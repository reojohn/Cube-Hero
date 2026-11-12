# CubeHero v1.0.0 — Signed Android APK (Windows, no Android Studio UI needed)

This package contains CubeHero's working game code, the custom blue-eyed Moonkeeper launcher icon, and a repeatable local Android release-signing configuration.

## Build your official self-distributed APK

1. **Back up your existing CubeHero project folder.** Extract the supplied changed files into the existing `CubeHero_Phase1` folder, replacing matching files, or use the full-source ZIP instead. If using the full source, run `npm install` before the first build.
2. Open **Windows PowerShell** in the main `CubeHero_Phase1` folder and run:

   ```powershell
   .\BUILD_CUBEHERO_RELEASE.bat
   ```

3. The first run creates a private signing key at `C:\Users\<your-user>\CubeHero-Release-Keys\cubehero-release.jks`. The JDK's keytool asks you to choose a password. Save it securely. You are then asked to enter that password again for Gradle.
4. The script compiles the React/Vite app, runs Capacitor sync, builds a **signed non-debug APK**, verifies its APK signature using Android SDK `apksigner`, and opens the output folder.

**Output:** `CubeHero_Phase1\release\CubeHero-v1.0.0-android.apk` and `SHA256.txt`.

## Identity and update policy

- Displayed app name: **CubeHero**
- Package/application ID: **`com.cubehero.speedcubing`** (retained to avoid breaking future updates; verify rights/availability before a Play listing)
- First release: `versionName 1.0.0`, `versionCode 1`
- Release signing key is created **only on your PC**, outside the project tree. **Never upload or share the `.jks` or password**, and keep secure backups of both. All future APK updates must use the same signing key and a higher `versionCode`.
- This **release** is signed with a different certificate from the **debug** APK you previously installed. Android cannot install it as an in-place update over the debug package. Back up important local progress before removing the debug installation; uninstalling normally deletes local app data.
- This APK can be shared directly via your own website (sideload distribution). It is **not automatically published to Google Play**. Google Play typically expects a separate Play Console submission with an AAB and policy/listing checks.
- The Android application packages the Vite build locally, so the app remains usable offline as before.

## If the build stops

- Check `JAVA_HOME` points to your installed Java 23. The builder prefers `C:\Program Files\Java\jdk-23` if available.
- Check the Android SDK and its Build Tools are installed at your established `C:\Android\Sdk` (or referenced by `ANDROID_HOME`).
- Ensure Node/npm and Android Gradle tooling are available.
- If the password is wrong, rerun the script and enter your original signing password. **Do not delete or regenerate your existing signing key** unless you intentionally want a new app signing identity.

## Source code scope

This release setup changes package/app version metadata, Android launcher display name, Gradle's release-signing configuration, and adds a build script. It does not change AI logic, cube rendering, timing, Ghost Race, or saved progress logic.
