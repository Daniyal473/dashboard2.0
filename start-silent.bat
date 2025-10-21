@echo off
echo Starting Dashboard in Silent Mode...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop servers
echo.

REM Start backend silently
cd backend
start /B npm run dev:silent

REM Start frontend silently  
cd ..\frontend
start /B npm run start:silent

REM Keep the batch file running
:loop
timeout /t 30 /nobreak > nul
goto loop
