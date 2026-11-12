@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo.
echo ============================================
echo   CubeHero v1.0.0 Download Update
echo ============================================
echo.
if not exist "release-downloads\CubeHero-v1.0.0-android.apk" (
  echo ERROR: New APK missing. Extract the full ZIP first.
  pause
  exit /b 1
)
if exist "public\downloads\CubeHero-v1.0.0-android.apk" (
  if not exist "release-downloads\old" mkdir "release-downloads\old"
  set "STAMP=%RANDOM%%RANDOM%"
  move "public\downloads\CubeHero-v1.0.0-android.apk" "release-downloads\old\CubeHero-previous-%STAMP%.apk" >nul
  if errorlevel 1 (
    echo ERROR: Could not move old public APK. Please close programs using it.
    pause
    exit /b 1
  )
  echo Previous public APK moved to release-downloads\old\.
)
if exist "dist\downloads\CubeHero-v1.0.0-android.apk" del /q "dist\downloads\CubeHero-v1.0.0-android.apk"
if exist "android\app\src\main\assets\public\downloads\CubeHero-v1.0.0-android.apk" del /q "android\app\src\main\assets\public\downloads\CubeHero-v1.0.0-android.apk"
echo.
echo Website files updated. Old APK removed from Android build inputs.
echo Run: npm run build:web
echo Then deploy your project to Vercel.
echo.
pause
endlocal
