[CmdletBinding()]
param(
  [string]$Region = 'us-east-1',
  [string]$InstanceType = 'm7i-flex.large',
  [string]$BudgetAlertEmail = '',
  [decimal]$MonthlyBudgetUsd = 15
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

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

foreach ($command in @('aws', 'terraform', 'git')) { Require-Command $command }

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repositoryRoot

if (git status --porcelain) { throw 'Commit or stash all changes before deployment. The deployed artifact is the current Git commit.' }
& aws sts get-caller-identity --output json | Out-Null

$bootstrapPath = Join-Path $repositoryRoot 'deploy/phase5/secrets/bootstrap.env'
if (-not (Test-Path -LiteralPath $bootstrapPath)) { throw "Missing $bootstrapPath" }
$secret = Get-EnvFile $bootstrapPath
$required = @('POSTGRES_USER', 'POSTGRES_DB', 'POSTGRES_PASSWORD', 'REDIS_PASSWORD', 'SECRET_JWT', 'MONITOR_SECRETS_KEY', 'AWS_SES_FROM_EMAIL', 'GRAFANA_ADMIN_PASSWORD')
foreach ($key in $required) { if ([string]::IsNullOrWhiteSpace($secret[$key])) { throw "Missing $key in bootstrap.env" } }

$bootstrapDirectory = Join-Path $repositoryRoot 'deploy/aws/bootstrap'
& terraform -chdir=$bootstrapDirectory init -input=false
& terraform -chdir=$bootstrapDirectory apply -auto-approve -input=false -var "aws_region=$Region"
$stateBucket = (& terraform -chdir=$bootstrapDirectory output -raw state_bucket_name).Trim()

$mainDirectory = Join-Path $repositoryRoot 'deploy/aws/main'
& terraform -chdir=$mainDirectory init -input=false -reconfigure "-backend-config=bucket=$stateBucket" "-backend-config=key=server-check/main.tfstate" "-backend-config=region=$Region" '-backend-config=use_lockfile=true' '-backend-config=encrypt=true'
$terraformArgs = @(
  '-chdir=' + $mainDirectory, 'apply', '-auto-approve', '-input=false',
  "-var=aws_region=$Region", "-var=instance_type=$InstanceType", "-var=ses_from_email=$($secret.AWS_SES_FROM_EMAIL)",
  "-var=budget_alert_email=$BudgetAlertEmail", "-var=monthly_budget_usd=$MonthlyBudgetUsd"
)
& terraform @terraformArgs

function Terraform-Output([string]$Name) { return (& terraform -chdir=$mainDirectory output -raw $Name).Trim() }
$artifactBucket = Terraform-Output artifact_bucket
$parameterName = Terraform-Output bootstrap_parameter_name
$instanceId = Terraform-Output instance_id
$cloudFrontUrl = Terraform-Output cloudfront_url
$cognitoPoolId = Terraform-Output cognito_user_pool_id
$cognitoClientId = Terraform-Output cognito_client_id
$cognitoIssuer = Terraform-Output cognito_issuer

$secret.AWS_REGION = $Region
$secretJson = $secret | ConvertTo-Json -Compress
& aws ssm put-parameter --region $Region --name $parameterName --type SecureString --overwrite --value $secretJson | Out-Null

$commit = (& git rev-parse --verify HEAD).Trim()
$artifactKey = "releases/$commit.zip"
$artifactPath = Join-Path ([System.IO.Path]::GetTempPath()) "server-check-$commit.zip"
try {
  & git archive --format=zip --output=$artifactPath $commit
  & aws s3 cp $artifactPath "s3://$artifactBucket/$artifactKey" --region $Region --only-show-errors
} finally {
  Remove-Item -LiteralPath $artifactPath -Force -ErrorAction SilentlyContinue
}

$remoteScript = @"
set -euo pipefail
release=/opt/server-check/releases/$commit
shared=/opt/server-check/shared
rm -rf "`$release"
mkdir -p "`$release" "`$shared/secrets"
aws s3 cp "s3://$artifactBucket/$artifactKey" /tmp/server-check.zip --region $Region --only-show-errors
unzip -q /tmp/server-check.zip -d "`$release"
rm -f /tmp/server-check.zip
secrets=`$(aws ssm get-parameter --region $Region --name $parameterName --with-decryption --query Parameter.Value --output text)
printf '%s' "`$secrets" > "`$shared/bootstrap.json"
jq -r 'to_entries[] | select(.value != null) | "export \(.key)=\(.value|@sh)"' "`$shared/bootstrap.json" > "`$shared/bootstrap.env"
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
APP_VERSION=$commit
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
EOF
cat > "`$shared/secrets/s3.env" <<EOF
AWS_S3_BUCKET=$(Terraform-Output backup_bucket)
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
    & aws ssm get-command-invocation --region $Region --command-id $commandId --instance-id $instanceId --output json
    throw "Remote deployment failed with SSM status: $status"
  }
} finally {
  Remove-Item -LiteralPath $commandsFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Deployment completed: $cloudFrontUrl"
Write-Host 'Verify the SES sender identity from AWS email before relying on notifications.'
