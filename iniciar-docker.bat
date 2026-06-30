@echo off
cd /d "%~dp0"
echo Iniciando sistema del gimnasio con Docker...
echo.
docker compose up -d --build
echo.
echo Si no hubo errores, abre:
echo http://localhost:8080
echo.
pause
