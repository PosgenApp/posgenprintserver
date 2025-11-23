# PowerShell script to build the installer
# Requires Inno Setup to be installed

$innoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

if (-not (Test-Path $innoSetupPath)) {
    Write-Host "Inno Setup not found at: $innoSetupPath" -ForegroundColor Red
    Write-Host "Please install Inno Setup from: https://innosetup.com/" -ForegroundColor Yellow
    Write-Host "Or update the path in this script." -ForegroundColor Yellow
    exit 1
}

# Check if executable exists
if (-not (Test-Path "posgenprintservice.exe")) {
    Write-Host "posgenprintservice.exe not found!" -ForegroundColor Red
    Write-Host "Please compile the executable first:" -ForegroundColor Yellow
    Write-Host "  bun build index.js --compile --outfile posgenprintservice.exe" -ForegroundColor Yellow
    exit 1
}

# Create dist directory if it doesn't exist
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Compile installer
Write-Host "Building installer..." -ForegroundColor Green
& $innoSetupPath "installer.iss"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Installer built successfully!" -ForegroundColor Green
    Write-Host "Output: dist\PosgenPrintService-Setup.exe" -ForegroundColor Cyan
} else {
    Write-Host "Installer build failed!" -ForegroundColor Red
    exit 1
}



