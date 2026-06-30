@echo off
echo Activando requisitos de Windows para Docker Desktop...
echo Este archivo debe ejecutarse como administrador.
echo.
dism.exe /online /Enable-Feature /FeatureName:Microsoft-Windows-Subsystem-Linux /All /NoRestart
dism.exe /online /Enable-Feature /FeatureName:VirtualMachinePlatform /All /NoRestart
dism.exe /online /Enable-Feature /FeatureName:Microsoft-Hyper-V-All /All /NoRestart
bcdedit /set hypervisorlaunchtype auto
echo.
echo Listo. Reinicia la PC y luego abre Docker Desktop.
pause
