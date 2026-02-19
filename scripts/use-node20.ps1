# ParkingHub — Run commands with Node 20 (nvm-windows)
# Use when your default is Node 12. Does NOT change your default.
# Usage: .\scripts\use-node20.ps1 npm install
#        .\scripts\use-node20.ps1 npm run dev
#        .\scripts\use-node20.ps1 npx ng version

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $CommandArgs
)

$nvmRoot = $env:NVM_HOME
if (-not $nvmRoot) {
    $nvmRoot = (nvm root 2>$null) -replace 'Current Root:\s*', ''
}
if (-not $nvmRoot) {
    Write-Error "NVM_HOME not set. Is nvm-windows installed?"
    exit 1
}

$node20Dir = Get-ChildItem $nvmRoot -Directory -Filter "v20*" | Sort-Object Name -Descending | Select-Object -First 1
if (-not $node20Dir) {
    Write-Error "No Node 20 found. Run: nvm install 20"
    exit 1
}

$nodeExe = Join-Path $node20Dir.FullName "node.exe"
$npmCmd = Join-Path $node20Dir.FullName "npm.cmd"
$npxCmd = Join-Path $node20Dir.FullName "npx.cmd"

if (-not (Test-Path $nodeExe)) {
    Write-Error "Node.exe not found at $nodeExe"
    exit 1
}

# Prepend Node 20 to PATH for this process only
$env:Path = "$($node20Dir.FullName);$env:Path"

if ($CommandArgs.Count -eq 0) {
    Write-Host "Node 20 active. Run commands in this shell." -ForegroundColor Green
    & $PSHOME\powershell.exe -NoExit
} else {
    & $CommandArgs[0] @($CommandArgs[1..($CommandArgs.Count - 1)])
}
