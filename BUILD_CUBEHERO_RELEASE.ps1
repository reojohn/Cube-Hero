# CubeHero v1.0.0 — signed Android release APK builder.
# Run from Windows PowerShell or double-click BUILD_CUBEHERO_RELEASE.bat.
# Your signing key is generated only on YOUR PC and never included in source ZIPs.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$java23 = 'C:\Program Files\Java\jdk-23'

try {
    Set-Location -LiteralPath $projectRoot
    Write-Host "" 
    Write-Host "===============================================" -ForegroundColor Magenta
    Write-Host "  CubeHero v1.0.0 - Official Android Release" -ForegroundColor White
    Write-Host "===============================================" -ForegroundColor Magenta
    Write-Host ""

    if (Test-Path (Join-Path $java23 'bin\keytool.exe')) {
        $env:JAVA_HOME = $java23
    } elseif (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin\keytool.exe'))) {
        throw "JDK not found. Install JDK 23 at $java23 (the location you used yesterday)."
    }
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    $keytool = Join-Path $env:JAVA_HOME 'bin\keytool.exe'
    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw 'npm was not found. Install Node.js 22 and reopen PowerShell.'
    }
    $keyDir = Join-Path $env:USERPROFILE 'CubeHero-Release-Keys'
    $keyPath = Join-Path $keyDir 'cubehero-release.jks'
    $keyAlias = 'cubehero'
    if (-not (Test-Path -LiteralPath $keyPath)) {
        New-Item -ItemType Directory -Path $keyDir -Force | Out-Null
        Write-Host 'FIRST RELEASE: creating your private signing key.' -ForegroundColor Cyan
        Write-Host 'Keytool will ask you to create and confirm a keystore password.' -ForegroundColor Yellow
        Write-Host 'SAVE that password and BACK UP the .jks file. Never share them.' -ForegroundColor Yellow
        & $keytool -genkeypair -v -storetype PKCS12 -keystore $keyPath -alias $keyAlias -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=CubeHero, OU=Applications, O=CubeHero, C=PH'
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $keyPath)) {
            throw 'Could not create release signing key. No release APK was built.'
        }
    } else {
        Write-Host 'Existing release signing key found; it will be reused for updates.' -ForegroundColor Green
    }

    Write-Host ''
    $secure = Read-Host 'Enter your CubeHero RELEASE key password' -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
    if ([string]::IsNullOrWhiteSpace($plainPassword)) { throw 'Release password cannot be empty.' }

    try {
        $env:CUBEHERO_RELEASE_KEYSTORE = $keyPath
        $env:CUBEHERO_RELEASE_STORE_PASSWORD = $plainPassword
        $env:CUBEHERO_RELEASE_KEY_ALIAS = $keyAlias
        # A PKCS12 keystore uses the same password for its sole private key.
        $env:CUBEHERO_RELEASE_KEY_PASSWORD = $plainPassword
        $plainPassword = $null

        Write-Host ''
        Write-Host '1 / 3  Building CubeHero production web app and syncing Capacitor...' -ForegroundColor Cyan
        & npm.cmd run android:sync
        if ($LASTEXITCODE -ne 0) { throw 'Web build / Capacitor sync failed. No release APK was built.' }

        Write-Host ''
        Write-Host '2 / 3  Building the SIGNED Android release APK...' -ForegroundColor Cyan
        Push-Location (Join-Path $projectRoot 'android')
        try {
            & .\gradlew.bat --no-daemon assembleRelease
            if ($LASTEXITCODE -ne 0) { throw 'Gradle release build failed. See the error above.' }
        } finally { Pop-Location }

        $built = Join-Path $projectRoot 'android\app\build\outputs\apk\release\app-release.apk'
        if (-not (Test-Path -LiteralPath $built)) {
            throw 'Gradle did not produce app-release.apk. Check the output above.'
        }
        $outDir = Join-Path $projectRoot 'release'
        New-Item -ItemType Directory -Force -Path $outDir | Out-Null
        $signedApk = Join-Path $outDir 'CubeHero-v1.0.0-android.apk'
        Copy-Item -LiteralPath $built -Destination $signedApk -Force

        Write-Host ''
        Write-Host '3 / 3  Verifying APK signature...' -ForegroundColor Cyan
        $sdkCandidates = @(
            $env:ANDROID_HOME,
            $env:ANDROID_SDK_ROOT,
            'C:\Android\Sdk',
            (Join-Path $env:LOCALAPPDATA 'Android\Sdk')
        ) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique
        $signer = $null
        foreach ($sdk in $sdkCandidates) {
            $buildTools = Join-Path $sdk 'build-tools'
            if (-not (Test-Path $buildTools)) { continue }
            $toolDirs = @(Get-ChildItem -Path $buildTools -Directory | Sort-Object Name -Descending)
            foreach ($toolDir in $toolDirs) {
                $candidate = Join-Path $toolDir.FullName 'apksigner.bat'
                if (Test-Path -LiteralPath $candidate) { $signer = $candidate; break }
            }
            if ($signer) { break }
        }
        if (-not $signer) {
            throw 'Release APK was built, but apksigner.bat was not found. Install Android SDK Build-Tools to verify it before sharing.'
        }
        & $signer verify --print-certs $signedApk
        if ($LASTEXITCODE -ne 0) { throw 'APK signature verification FAILED. Do not distribute this APK.' }

        $hash = (Get-FileHash -LiteralPath $signedApk -Algorithm SHA256).Hash
        "$hash  CubeHero-v1.0.0-android.apk" | Set-Content -Path (Join-Path $outDir 'SHA256.txt') -Encoding Ascii
        Write-Host ''
        Write-Host 'SUCCESS: CubeHero v1.0.0 signed release APK generated and verified!' -ForegroundColor Green
        Write-Host "APP: $signedApk" -ForegroundColor White
        Write-Host "SIGNING KEY: $keyPath" -ForegroundColor Yellow
        Write-Host 'Back up your signing key and password in separate secure places.' -ForegroundColor Yellow
        Write-Host 'The first release APK will not install over the old DEBUG APK.' -ForegroundColor Yellow
        Write-Host 'Back up important in-app progress before uninstalling your debug app.' -ForegroundColor Yellow
        Start-Process explorer.exe -ArgumentList ('"' + $outDir + '"')
    } finally {
        Remove-Item Env:\CUBEHERO_RELEASE_KEYSTORE -ErrorAction SilentlyContinue
        Remove-Item Env:\CUBEHERO_RELEASE_STORE_PASSWORD -ErrorAction SilentlyContinue
        Remove-Item Env:\CUBEHERO_RELEASE_KEY_ALIAS -ErrorAction SilentlyContinue
        Remove-Item Env:\CUBEHERO_RELEASE_KEY_PASSWORD -ErrorAction SilentlyContinue
        $plainPassword = $null
    }
} catch {
    Write-Host ''
    Write-Host ('CubeHero release build stopped: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
