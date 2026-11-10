@echo off
setlocal
cd /d "%~dp0"
title Cube Hero - Local Website
color 0B

echo.
echo  ========================================================
echo           CUBE HERO - START SYSTEM
echo  ========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo.
    echo  Install Node.js LTS from https://nodejs.org/
    echo  Then close this window and double-click this file again.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] npm was not found. Reinstall Node.js LTS.
    pause
    exit /b 1
)

node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=12)||(v[0]===20&&v[1]>=19)?0:1)"
if errorlevel 1 (
    echo  [ERROR] Your Node.js version is too old.
    node --version
    echo  Please install Node.js 22 LTS or newer from https://nodejs.org/
    pause
    exit /b 1
)

echo  [OK] Node.js installed:
node --version

if not exist "node_modules\vite\bin\vite.js" goto INSTALL_DEPS
if not exist "node_modules\cubing\package.json" goto INSTALL_DEPS
if not exist "node_modules\cubejs\package.json" goto INSTALL_DEPS
if not exist "node_modules\@moishy\cfop\package.json" goto INSTALL_DEPS
if not exist "node_modules\@moishy\cubing-core\package.json" goto INSTALL_DEPS
echo  [1/2] Dependencies already installed.
goto RUN_SERVER

:INSTALL_DEPS
(
    echo.
    echo  [1/2] Installing website dependencies. This requires internet...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo  [ERROR] Dependencies failed to install.
        echo  Check your internet connection and retry.
        pause
        exit /b 1
    )
)

:RUN_SERVER
echo.
echo  [2/2] Starting Cube Hero...
echo  Browser address: http://localhost:5188/
echo  A new command window will keep your website running.
echo  Close that SERVER window to stop the website.
echo.

start "Cube Hero Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:5188/"
echo  [OK] Opening Cube Hero in your browser.
endlocal
