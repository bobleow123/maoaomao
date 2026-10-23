# 摸凹猫 - 一键启动脚本
# Windows PowerShell 版本

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Starting Moao Cat..." -ForegroundColor Green
Write-Host ""

# 检查并安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Starting backend (port 3001)..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "backend" -WindowStyle Hidden

Start-Sleep -Seconds 2

Write-Host "Starting frontend (port 5173)..." -ForegroundColor Cyan
Write-Host "Browser will open automatically at http://localhost:5173" -ForegroundColor Magenta
Write-Host ""

Set-Location frontend
npm run dev -- --open
