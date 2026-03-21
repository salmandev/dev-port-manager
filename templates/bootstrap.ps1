# Dev Port Manager Bootstrap Script (PowerShell/Windows)
# Usage: .\bootstrap.ps1 [-ProjectName "my-project"]

param(
    [string]$ProjectName = "",
    [string]$OutputDir = "."
)

# Color codes equivalent
$Red = 12
$Green = 10
$Blue = 9
$Yellow = 14

function Write-Color {
    param([string]$Message, [int]$Color = 7)
    Write-Host $Message -ForegroundColor $Color
}

# Use directory name if project name not provided
if (!$ProjectName) {
    $ProjectName = Split-Path -Leaf (Get-Location)
}

Write-Color "================================================" $Blue
Write-Color "  Dev Port Manager Bootstrap" $Blue
Write-Color "================================================" $Blue
Write-Host ""
Write-Host "Project: $ProjectName"
Write-Host "Output:  $OutputDir"
Write-Host ""

# Check if dpm CLI is installed
$dpmCmd = Get-Command dpm -ErrorAction SilentlyContinue

if (!$dpmCmd) {
    Write-Color "✗ dev-port-manager CLI not found" $Red
    Write-Color "Install with:" $Yellow
    Write-Host "  npm install -g @devops/dev-port-manager"
    exit 1
}

Write-Color "✓ dev-port-manager CLI found" $Green
Write-Host ""

# Assign port to project
Write-Color "Assigning port..." $Blue
& dpm assign $ProjectName --output $OutputDir --vscode

Write-Host ""
Write-Color "✓ Bootstrap complete!" $Green
Write-Host ""

# Display configuration
$configFile = Join-Path $OutputDir ".project-dev.json"
if (Test-Path $configFile) {
    Write-Color "Project configuration (.project-dev.json):" $Blue
    Get-Content $configFile | ConvertFrom-Json | Format-List
    Write-Host ""
}

Write-Color "Next steps:" $Blue
Write-Host "  1. Add to docker-compose.yml (if using Docker)"
Write-Host "  2. Update your application to listen on the assigned port"
Write-Host "  3. Source the .project-dev.json in your startup script"
Write-Host ""
