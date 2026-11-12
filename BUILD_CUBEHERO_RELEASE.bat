@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_CUBEHERO_RELEASE.ps1"
if errorlevel 1 (
  echo.
  echo Release build did not complete. Review the error above.
)
echo.
pause
