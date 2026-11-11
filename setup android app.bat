@echo off
setlocal
cd /d "%~dp0"
title Cube Hero - Android App Setup
color 0B

echo.
echo  ===================================================
echo            CUBE HERO - ANDROID SETUP
echo  ===================================================
echo.
echo  Requirements: Node.js 22+, Android Studio + SDK,
echo  and internet for the first Android build.
echo.
where npm >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] Node.js/npm was not found. Install Node.js 22 LTS.
  pause
  exit /b 1
)
call npm run android:setup
if errorlevel 1 (
  echo.
  echo  [ERROR] Setup did not finish. Read the error shown above.
  pause
  exit /b 1
)
echo.
echo  [OK] Android project setup completed.
echo  Next: run "npm run android:open" to open Android Studio.
echo.
pause
endlocal
