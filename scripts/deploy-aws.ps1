[CmdletBinding()]
param(
  [string]$Region = 'us-east-1',
  [string]$InstanceType = 'm7i-flex.large',
  [string]$BudgetAlertEmail = '',
  [decimal]$MonthlyBudgetUsd = 15
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# AWS CLI bundles its own Python runtime. On Windows it defaults to the console's legacy
# codepage (cp1252, aka "charmap") and crashes with UnicodeEncodeError if remote command
# output contains non-ASCII characters (dnf/systemd/docker often emit arrows or box-drawing
# glyphs). Force UTF-8 everywhere so a display crash here can never hide the real error.
try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
  # No console attached (e.g. output redirected) - safe to ignore.
}
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is required. Install it and retry."
  }
}

function Get-EnvFile([string]$Path) {
  $values = @{}
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $key, $value = $line -split '=', 2
    $values[$key.Trim()] = $value.Trim().Trim('"')
  }
  return $values
}

function Invoke-Terraform([string]$WorkingDirectory, [scriptblock]$Command) {
  Push-Location -LiteralPath $WorkingDirectory
  try {
    & $Command
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Terraform failed in: $WorkingDirectory" -ForegroundColor Red
      exit $LASTEXITCODE
    }
  } finally {
    Pop-Location
  }
}

function New-ForwardSlashZipArchive([string]$SourceDirectory, [string]$DestinationPath) {
  # Compress-Archive (System.IO.Compression.ZipFile on .NET Framework, which Windows
  # PowerShell 5.1 uses) does not normalize entry names to forward slashes on Windows,
  # producing zips that `unzip` on Linux warns about and can extract incorrectly.
  # Build the archive by hand so every entry name uses '/', per the Zip spec.
  Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
  if (Test-Path -LiteralPath $DestinationPath) { Remove-Item -LiteralPath $DestinationPath -Force }
  $sourceFull = (Resolve-Path -LiteralPath $SourceDirectory).Path
  $zip = [System.IO.Compression.ZipFile]::Open($DestinationPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    Get-ChildItem -LiteralPath $sourceFull -Recurse -File | ForEach-Object {
      $entryName = $_.FullName.Substring($sourceFull.Length + 1).Replace('\', '/')
      $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
      $entryStream = $entry.Open()
      try {
        $fileStream = [System.IO.File]::OpenRead($_.FullName)
        try {
          $fileStream.CopyTo($entryStream)
        } finally {
          $fileStream.Dispose()
        }
      } finally {
        $entryStream.Dispose()
      }
    }
  } finally {
    $zip.Dispose()
  }
}

function Get-TerraformOutput([string]$WorkingDirectory, [string]$Name) {
  Push-Location -LiteralPath $WorkingDirectory
  try {
    $value = & terraform output -raw $Name
    if ($LASTEXITCODE -ne 0) {
      throw "Terraform could not read output '$Name'."
    }
  } finally {
    Pop-Location
  }

  $result = ($value | Out-String).Trim()
  if ([string]::IsNullOrWhiteSpace($result)) {
    throw "Terraform output '$Name' is empty."
  }

  return $result
}

foreach ($command in @('aws', 'terraform', 'git')) { Require-Command $command }

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repositoryRoot

& aws sts get-caller-identity --output json | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'AWS CLI could not verify the active account.' }

$bootstrapPath = Join-Path $repositoryRoot 'deploy/phase5/secrets/bootstrap.env'
if (-not (Test-Path -LiteralPath $bootstrapPath)) { throw "Missing $bootstrapPath" }
$secret = Get-EnvFile $bootstrapPath
$required = @('POSTGRES_USER', 'POSTGRES_DB', 'POSTGRES_PASSWORD', 'REDIS_PASSWORD', 'SECRET_JWT', 'MONITOR_SECRETS_KEY', 'AWS_SES_FROM_EMAIL', 'GRAFANA_ADMIN_PASSWORD')
foreach ($key in $required) { if ([string]::IsNullOrWhiteSpace($secret[$key])) { throw "Missing $key in bootstrap.env" } }

if ([string]::IsNullOrWhiteSpace($BudgetAlertEmail)) {
  $BudgetAlertEmail = $secret.AWS_SES_FROM_EMAIL
}

$bootstrapDirectory = Join-Path $repositoryRoot 'deploy/aws/bootstrap'
if (-not (Test-Path -LiteralPath $bootstrapDirectory -PathType Container)) {
  throw "Missing Terraform bootstrap directory: $bootstrapDirectory"
}
Invoke-Terraform $bootstrapDirectory {
  & terraform init -input=false
}
Invoke-Terraform $bootstrapDirectory {
  & terraform apply -auto-approve -input=false "-var=aws_region=$Region"
}
$stateBucket = Get-TerraformOutput $bootstrapDirectory 'state_bucket_name'

$mainDirectory = Join-Path $repositoryRoot 'deploy/aws/main'
if (-not (Test-Path -LiteralPath $mainDirectory -PathType Container)) {
  throw "Missing Terraform main directory: $mainDirectory"
}
Invoke-Terraform $mainDirectory {
  & terraform init -input=false -reconfigure "-backend-config=bucket=$stateBucket" '-backend-config=key=server-check/main.tfstate' "-backend-config=region=$Region" '-backend-config=use_lockfile=true' '-backend-config=encrypt=true'
}
Invoke-Terraform $mainDirectory {
  & terraform apply -auto-approve -input=false "-var=aws_region=$Region" "-var=instance_type=$InstanceType" "-var=ses_from_email=$($secret.AWS_SES_FROM_EMAIL)" "-var=budget_alert_email=$BudgetAlertEmail" "-var=monthly_budget_usd=$MonthlyBudgetUsd"
}

$artifactBucket = Get-TerraformOutput $mainDirectory 'artifact_bucket'
$backupBucket = Get-TerraformOutput $mainDirectory 'backup_bucket'
$parameterName = Get-TerraformOutput $mainDirectory 'bootstrap_parameter_name'
$instanceId = Get-TerraformOutput $mainDirectory 'instance_id'
$cloudFrontUrl = Get-TerraformOutput $mainDirectory 'cloudfront_url'
$cognitoPoolId = Get-TerraformOutput $mainDirectory 'cognito_user_pool_id'
$cognitoClientId = Get-TerraformOutput $mainDirectory 'cognito_client_id'
$cognitoIssuer = Get-TerraformOutput $mainDirectory 'cognito_issuer'

$secret.AWS_REGION = $Region
$secretPayload = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($bootstrapPath))
if ($secretPayload.Length -gt 4096) {
  throw 'bootstrap.env is too large for a standard SSM SecureString parameter.'
}
& aws ssm put-parameter --region $Region --name $parameterName --type SecureString --overwrite --value $secretPayload | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not store production secrets in AWS Systems Manager.' }

$commit = (& git rev-parse --verify HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commit)) {
  throw 'The repository must contain at least one Git commit before deployment.'
}
$artifactId = "$($commit.Substring(0, 12))-$([DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ'))"
$artifactKey = "releases/$artifactId.zip"
$artifactPath = Join-Path ([System.IO.Path]::GetTempPath()) "server-check-$artifactId.zip"
$sourceDirectory = Join-Path ([System.IO.Path]::GetTempPath()) "server-check-source-$artifactId"
try {
  New-Item -ItemType Directory -Force -Path $sourceDirectory | Out-Null
  $workspaceFiles = @(& git ls-files -co --exclude-standard)
  if ($LASTEXITCODE -ne 0 -or $workspaceFiles.Count -eq 0) {
    throw 'Git could not enumerate the files to deploy.'
  }

  foreach ($relativePath in $workspaceFiles) {
    $sourcePath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { continue }
    $destinationPath = Join-Path $sourceDirectory $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
  }

  New-ForwardSlashZipArchive -SourceDirectory $sourceDirectory -DestinationPath $artifactPath
  & aws s3 cp $artifactPath "s3://$artifactBucket/$artifactKey" --region $Region --only-show-errors
  if ($LASTEXITCODE -ne 0) { throw 'Could not upload the deployment artifact to S3.' }
} finally {
  Remove-Item -LiteralPath $artifactPath -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $sourceDirectory -Force -Recurse -ErrorAction SilentlyContinue
}

$remoteScript = @"
set -euo pipefail
cloud-init status --wait >/dev/null
release=/opt/server-check/releases/$artifactId
shared=/opt/server-check/shared
rm -rf "`$release"
mkdir -p "`$release" "`$shared/secrets"
aws s3 cp "s3://$artifactBucket/$artifactKey" /tmp/server-check.zip --region $Region --only-show-errors
set +e
unzip -q /tmp/server-check.zip -d "`$release"
unzip_status=`$?
set -e
if [ "`$unzip_status" -gt 1 ]; then
  printf '%s\n' "Could not extract the deployment archive (unzip exit code: `$unzip_status)" >&2
  exit "`$unzip_status"
fi
rm -f /tmp/server-check.zip
aws ssm get-parameter --region $Region --name $parameterName --with-decryption --query Parameter.Value --output text \
  | base64 --decode | tr -d '\r' > "`$shared/bootstrap.env"
test -s "`$shared/bootstrap.env"
set -a
. "`$shared/bootstrap.env"
set +a
export SECRETS_DIR="`$shared/secrets"
export COGNITO_ISSUER='$cognitoIssuer'
export COGNITO_CLIENT_ID='$cognitoClientId'
export PUBLIC_ORIGIN='$cloudFrontUrl'
sh "`$release/scripts/bootstrap-production-secrets.sh"
cat >> "`$shared/secrets/backend.env" <<EOF
COGNITO_ISSUER="`$COGNITO_ISSUER"
COGNITO_CLIENT_ID="`$COGNITO_CLIENT_ID"
MY_URL_FRONTEND="`$PUBLIC_ORIGIN"
EOF
cat > "`$release/deploy/phase5/.env" <<EOF
PUBLIC_ORIGIN=$cloudFrontUrl
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$cognitoPoolId
NEXT_PUBLIC_COGNITO_CLIENT_ID=$cognitoClientId
APP_VERSION=$artifactId
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
EOF
cat > "`$shared/secrets/s3.env" <<EOF
AWS_S3_BUCKET=$backupBucket
AWS_S3_PREFIX=server-check
AWS_REGION=$Region
EOF
chmod 600 "`$shared/secrets"/*
ln -sfn "`$release" /opt/server-check/current
cp "`$release/deploy/phase5/systemd/server-check-backup.service" /etc/systemd/system/
cp "`$release/deploy/phase5/systemd/server-check-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now server-check-backup.timer
export REPOSITORY_DIR=/opt/server-check/current
export DEPLOY_ENV_FILE=/opt/server-check/current/deploy/phase5/.env
export SECRETS_DIR="`$shared/secrets"
export POSTGRES_ENV_FILE="`$shared/secrets/postgres.env"
export REDIS_ENV_FILE="`$shared/secrets/redis.env"
export BACKEND_ENV_FILE="`$shared/secrets/backend.env"
export GRAFANA_ADMIN_PASSWORD_FILE="`$shared/secrets/grafana_admin_password"
export COMPOSE_PROJECT_NAME=server-check
set -a
. "`$shared/secrets/s3.env"
set +a
if docker volume ls -q -f name=server-check_postgres_data | grep -q .; then
  sh /opt/server-check/current/scripts/backup-production.sh
fi
sh /opt/server-check/current/scripts/deploy-primary.sh
"@

$commandsFile = Join-Path ([System.IO.Path]::GetTempPath()) 'server-check-ssm-commands.json'
try {
  $online = $false
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    $pingStatus = (& aws ssm describe-instance-information --region $Region --filters "Key=InstanceIds,Values=$instanceId" --query 'InstanceInformationList[0].PingStatus' --output text 2>$null).Trim()
    if ($pingStatus -eq 'Online') {
      $online = $true
      break
    }
    Start-Sleep -Seconds 10
  }
  if (-not $online) { throw 'The EC2 instance did not become available in AWS Systems Manager within 10 minutes.' }

  @{ commands = @($remoteScript) } | ConvertTo-Json -Compress | Set-Content -LiteralPath $commandsFile -NoNewline
  $commandId = (& aws ssm send-command --region $Region --instance-ids $instanceId --document-name AWS-RunShellScript --parameters "file://$commandsFile" --query 'Command.CommandId' --output text).Trim()
  do {
    Start-Sleep -Seconds 5
    $status = (& aws ssm get-command-invocation --region $Region --command-id $commandId --instance-id $instanceId --query Status --output text 2>$null).Trim()
  } while ($status -in @('Pending', 'InProgress', 'Delayed', ''))
  if ($status -ne 'Success') {
    $invocation = & aws ssm get-command-invocation --region $Region --command-id $commandId --instance-id $instanceId --output json | ConvertFrom-Json
    Write-Host '--- Remote stdout ---' -ForegroundColor Yellow
    Write-Host $invocation.StandardOutputContent
    Write-Host '--- Remote stderr ---' -ForegroundColor Yellow
    Write-Host $invocation.StandardErrorContent
    throw "Remote deployment failed with SSM status: $status"
  }
} finally {
  Remove-Item -LiteralPath $commandsFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Deployment completed: $cloudFrontUrl"
Write-Host 'Verify the SES sender identity from AWS email before relying on notifications.'
