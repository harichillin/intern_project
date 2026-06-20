# NexaCore Sentinel AI: Portable Setup Script
# Installs portable Node.js and PostgreSQL, and sets up database and dependencies UAC-free.

$ErrorActionPreference = "Stop"

# Create a folder for portable binaries
$portableDir = Join-Path $PSScriptRoot "portable"
if (-not (Test-Path $portableDir)) {
    New-Item -ItemType Directory -Path $portableDir | Out-Null
}

# 1. Download Node.js (v20.11.0)
$nodeZip = Join-Path $portableDir "node.zip"
$nodeDest = Join-Path $portableDir "node-v20.11.0-win-x64"
if (-not (Test-Path $nodeDest)) {
    Write-Host "Downloading portable Node.js..." -ForegroundColor Cyan
    curl.exe -Lo $nodeZip "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
    Write-Host "Extracting Node.js..." -ForegroundColor Cyan
    tar.exe -xf $nodeZip -C $portableDir
    Remove-Item $nodeZip -Force
} else {
    Write-Host "Portable Node.js already exists." -ForegroundColor Green
}

# 2. Download PostgreSQL (v16.14)
$pgZip = Join-Path $portableDir "postgres.zip"
$pgDest = Join-Path $portableDir "pgsql"
if (-not (Test-Path $pgDest)) {
    Write-Host "Downloading portable PostgreSQL..." -ForegroundColor Cyan
    curl.exe -Lo $pgZip "https://sbp.enterprisedb.com/getfile.jsp?fileid=1260308"
    Write-Host "Extracting PostgreSQL..." -ForegroundColor Cyan
    tar.exe -xf $pgZip -C $portableDir
    Remove-Item $pgZip -Force
} else {
    Write-Host "Portable PostgreSQL already exists." -ForegroundColor Green
}

# Add portable Node.js to current PATH
$nodeBinPath = Resolve-Path $nodeDest
$env:PATH = "$nodeBinPath;$env:PATH"
Write-Host "Using Node version: $(node -v)" -ForegroundColor Green

# 3. Initialize PostgreSQL Database Cluster (UAC-free)
$pgBinPath = Join-Path $pgDest "bin"
$pgDataPath = Join-Path $pgDest "data"
if (-not (Test-Path $pgDataPath)) {
    Write-Host "Initializing PostgreSQL Database..." -ForegroundColor Cyan
    & "$pgBinPath\initdb.exe" -D $pgDataPath -U postgres -A trust
} else {
    Write-Host "PostgreSQL Database already initialized." -ForegroundColor Green
}

# 4. Start PostgreSQL Server
Write-Host "Starting PostgreSQL Server on Port 5432..." -ForegroundColor Cyan
$postgresLog = Join-Path $pgDest "postgres.log"
& "$pgBinPath\pg_ctl.exe" -D $pgDataPath -l $postgresLog start

# Wait for database to start
Start-Sleep -Seconds 3

# 5. Create database & setup schema
Write-Host "Creating database nexacore_db..." -ForegroundColor Cyan
& "$pgBinPath\createdb.exe" -U postgres -h localhost nexacore_db 2>$null

Write-Host "Running database schema..." -ForegroundColor Cyan
& "$pgBinPath\psql.exe" -U postgres -h localhost -d nexacore_db -f (Join-Path $PSScriptRoot "db\schema.sql")

# 6. Install Project Dependencies and Seed
Write-Host "Installing Backend dependencies..." -ForegroundColor Cyan
cd (Join-Path $PSScriptRoot "backend")
npm install
cd ..

Write-Host "Installing Frontend dependencies..." -ForegroundColor Cyan
cd (Join-Path $PSScriptRoot "frontend")
npm install
cd ..

Write-Host "Installing DB dependencies and seeding data..." -ForegroundColor Cyan
cd (Join-Path $PSScriptRoot "db")
npm install
node seed.js
cd ..

# 7. Install ML Service dependencies
Write-Host "Installing ML Service dependencies (pip)..." -ForegroundColor Cyan
cd (Join-Path $PSScriptRoot "ml-service")
pip install -r requirements.txt
cd ..

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Portable Setup Completed Successfully!" -ForegroundColor Green
Write-Host "Use 'run_portable.ps1' to launch the app." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
