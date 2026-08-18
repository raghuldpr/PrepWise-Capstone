@echo off
title PrepWise Launcher
echo ===================================================
echo           Starting PrepWise (Full Stack)
echo ===================================================
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo ===================================================
echo.

echo Starting PrepWise Backend in a new terminal window...
start "PrepWise Backend" cmd /k "cd /d "%~dp0backend" && .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=prod""

echo.
echo Waiting 5 seconds for Backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting PrepWise Frontend...
cd /d "%~dp0"
npm run dev

pause
