# Silent Dashboard Startup Script
Write-Host "Starting Dashboard in Silent Mode..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Yellow
Write-Host ""

# Start backend silently
Set-Location "backend"
Start-Process -FilePath "npm" -ArgumentList "run", "dev:silent" -WindowStyle Hidden

# Start frontend silently
Set-Location "..\frontend"  
Start-Process -FilePath "npm" -ArgumentList "run", "start:silent" -WindowStyle Hidden

# Return to root directory
Set-Location ".."

# Keep script running
Write-Host "Servers started silently. Terminal will remain clean." -ForegroundColor Green
while ($true) {
    Start-Sleep -Seconds 30
}
