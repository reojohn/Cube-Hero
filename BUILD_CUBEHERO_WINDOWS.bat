@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==================================================
echo  CubeHero v1.0.0 - Official Windows Setup Builder
echo ==================================================
echo.
echo  Generates a Windows x64 EXE installer with OFFLINE files.
echo  Release APKs remain outside the desktop build.
echo.
where node >nul 2>&1
if errorlevel 1 (
 echo ERROR: Node.js not found. Please install Node.js 22 first.
 pause
 exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
 echo ERROR: npm not found.
 pause
 exit /b 1
)
echo [1/4] Checking release assets...
call node scripts\check-no-public-apk.mjs
if errorlevel 1 goto :failure
echo [2/4] Building CubeHero desktop game...
call npm run typecheck
if errorlevel 1 goto :failure
call npx --no-install vite build --outDir dist-desktop
if errorlevel 1 goto :failure
call node scripts\prepare-windows-installer.mjs
if errorlevel 1 goto :failure
echo [3/4] Installing the Windows packaging tools (first run may download dependencies)...
call npm --prefix windows-installer install --no-audit --no-fund
if errorlevel 1 goto :failure
echo [4/4] Generating the Windows Setup EXE...
call npm --prefix windows-installer run package
if errorlevel 1 goto :failure
echo.
echo SUCCESS: release-downloads\CubeHero-v1.0.0-Windows-Setup.exe
echo Test it on Windows before publishing it.
pause
exit /b 0
:failure
echo.
echo BUILD FAILED - screenshot the error above to troubleshoot.
pause
exit /b 1
