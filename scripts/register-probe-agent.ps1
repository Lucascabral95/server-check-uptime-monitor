param(
  [Parameter(Mandatory=$true)][string]$ApiUrl,
  [Parameter(Mandatory=$true)][string]$AccessToken,
  [Parameter(Mandatory=$true)][string]$Name,
  [Parameter(Mandatory=$true)][string]$Region,
  [string]$Version = "0.1.0"
)

$headers = @{ Authorization = "Bearer $AccessToken"; "Content-Type" = "application/json" }
$body = @{ name = $Name; region = $Region; version = $Version } | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri "$ApiUrl/api/v1/probe-agents" -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 5
Write-Host "Store .token only on the probe VPS; it will not be returned again."
