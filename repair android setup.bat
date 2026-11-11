@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Cube Hero - Repair Windows Dependencies and Android Setup
color 0B

echo.
echo  =====================================================
echo      CUBE HERO - ANDROID SETUP DEPENDENCY REPAIR
 echo  =====================================================
echo.
echo  This repairs the local Node.js dependencies, then
 echo  reruns the existing Capacitor Android setup.
echo  Your game source, local browser progress, and
 echo  package-lock.json will NOT be deleted.
echo.
echo  Before continuing, close any CubeHero dev-server
 echo  terminals that may be using node_modules.
echo.
pause

where node >nul 2>nul
if errorlevel 1 goto missing
where npm >nul 2>nul
if errorlevel 1 goto missing

REM The script is for native Windows Command Prompt, not WSL.
REM Override an accidental Linux npm OS setting only in this script.
set "npm_config_os=win32"

echo.
echo  [1/3] Removing the old node_modules directory...
if exist "node_modules\" (
  rmdir /s /q "node_modules"
  if exist "node_modules\" goto locked
) else (
  echo  No existing node_modules; proceeding with installation.
)

echo.
echo  [2/3] Installing dependencies, including Windows native packages...
if exist "package-lock.json" (
  call npm ci --include=optional
  if errorlevel 1 (
    echo.
    echo  npm ci failed. Trying npm install with optional packages...
    call npm install --include=optional
    if errorlevel 1 goto fail
  )
) else (
  call npm install --include=optional
  if errorlevel 1 goto fail
)

echo.
echo  Checking the Rollup native module...
call node -e "require('rollup'); console.log('Rollup native module OK')"
if errorlevel 1 goto fail

echo.
echo  [3/3] Rerunning Capacitor Android setup...
call npm run android:setup
if errorlevel 1 goto fail

echo.
echo  =====================================================
echo  [SUCCESS] Android project setup completed.
echo  Next: npm run android:open
 echo  =====================================================
echo.
pause
exit /b 0

:missing
echo.
echo  [ERROR] Node.js and npm need to be installed on Windows.
goto endfail

:locked
echo.
echo  [ERROR] Could not remove node_modules. Close Node/Vite/VS Code
 echo  processes holding files open, then try again. OneDrive may
 echo  also interfere with file operations in synced folders.
goto endfail

:fail
echo.
echo  [ERROR] Dependency repair or Android setup failed.
echo  Please share the complete error message (especially the first lines).
goto endfail

:endfail
echo.
pause
exit /b 1
