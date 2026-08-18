# PrepWise PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          Starting PrepWise (Full Stack)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting PrepWise Backend in a new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=prod'"

Write-Host "Waiting 5 seconds for Backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting PrepWise Frontend..." -ForegroundColor Yellow
Set-Location $ScriptDir
npm run dev
