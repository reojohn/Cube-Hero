/**
 * Web deployment only. Keep the APK OUTSIDE public/ so Capacitor never packs
 * an older Android installer inside a new Android installer.
 * Vercel runs npm run build:web; BUILD_CUBEHERO_RELEASE.bat uses npm run build.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const name = 'CubeHero-v1.0.0-android.apk'
const input = resolve('releases', name)
const targetDir = resolve('dist', 'downloads')
const target = join(targetDir, name)

const release = await stat(input)
if (!release.isFile() || release.size < 1_000_000) throw new Error('Android APK is missing or too small: ' + input)
await stat(resolve('dist', 'index.html'))
await mkdir(targetDir, { recursive: true })
await copyFile(input, target)
const output = await stat(target)
if (output.size !== release.size) throw new Error('APK copy incomplete')
console.log(`Included Android APK in web build: /downloads/${name} (${(output.size / 1024 / 1024).toFixed(1)} MiB)`)
