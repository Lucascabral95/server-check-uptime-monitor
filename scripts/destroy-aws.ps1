[CmdletBinding()]
param(
  [string]$Region = 'us-east-1',
  [switch]$Force
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

function Get-TerraformOutput([string]$WorkingDirectory, [string]$Name) {
  Push-Location -LiteralPath $WorkingDirectory
  try {
    $value = & terraform output -raw $Name
    if ($LASTEXITCODE -ne 0) { throw "Terraform could not read output '$Name'." }
  } finally {
    Pop-Location
  }

  return ($value | Out-String).Trim()
}

foreach ($command in @('aws', 'terraform')) { Require-Command $command }

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$bootstrapDirectory = Join-Path $repositoryRoot 'deploy/aws/bootstrap'
$mainDirectory = Join-Path $repositoryRoot 'deploy/aws/main'
$bootstrapPath = Join-Path $repositoryRoot 'deploy/phase5/secrets/bootstrap.env'

foreach ($directory in @($bootstrapDirectory, $mainDirectory)) {
  if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
    throw "Missing Terraform directory: $directory"
  }
}
if (-not (Test-Path -LiteralPath $bootstrapPath)) { throw "Missing $bootstrapPath" }

& aws sts get-caller-identity --output json | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'AWS CLI could not verify the active account.' }

if (-not $Force) {
  $confirmation = Read-Host 'This permanently deletes the EC2, database, backups, S3 buckets and Terraform state. Type DESTROY to continue'
  if ($confirmation -cne 'DESTROY') {
    Write-Host 'Destruction cancelled.' -ForegroundColor Yellow
    exit 0
  }
}

$secret = Get-EnvFile $bootstrapPath
if ([string]::IsNullOrWhiteSpace($secret.AWS_SES_FROM_EMAIL)) {
  throw 'Missing AWS_SES_FROM_EMAIL in bootstrap.env'
}

Invoke-Terraform $bootstrapDirectory {
  & terraform init -input=false
}
$stateBucket = Get-TerraformOutput $bootstrapDirectory 'state_bucket_name'

Invoke-Terraform $mainDirectory {
  & terraform init -input=false -reconfigure "-backend-config=bucket=$stateBucket" '-backend-config=key=server-check/main.tfstate' "-backend-config=region=$Region" '-backend-config=use_lockfile=true' '-backend-config=encrypt=true'
}
Invoke-Terraform $mainDirectory {
  & terraform destroy -auto-approve -input=false "-var=aws_region=$Region" "-var=ses_from_email=$($secret.AWS_SES_FROM_EMAIL)" "-var=budget_alert_email=$($secret.AWS_SES_FROM_EMAIL)"
}
Invoke-Terraform $bootstrapDirectory {
  & terraform destroy -auto-approve -input=false "-var=aws_region=$Region"
}

Write-Host 'AWS infrastructure destroyed successfully.' -ForegroundColor Green
