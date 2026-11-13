/** Stage only the Android APK in dist-web. Windows EXE stays outside website builds. */
import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const name = 'CubeHero-v1.0.0-android.apk'
const source = resolve('release-downloads', name)
const target = resolve('dist-web', 'downloads', name)
const sourceStat = await stat(source)
if (!sourceStat.isFile() || sourceStat.size < 1_000_000) {
  throw new Error('Missing or unexpectedly small Android APK: ' + source)
}
await stat(resolve('dist-web', 'index.html'))
await mkdir(resolve('dist-web', 'downloads'), { recursive: true })
// Remove any stale Windows binaries left by a previous website build.
for (const entry of await readdir(resolve('dist-web', 'downloads'), { withFileTypes: true })) {
  if (entry.isFile() && /\.(exe|msi)$/i.test(entry.name)) {
    await rm(resolve('dist-web', 'downloads', entry.name))
    console.log(`Removed old Windows download from Vercel output: ${entry.name}`)
  }
}
await copyFile(source, target)
const targetStat = await stat(target)
if (sourceStat.size !== targetStat.size) throw new Error('Android APK staging copy failed')
console.log(`Website Android download ready: /downloads/${name} (${(targetStat.size / 1048576).toFixed(2)} MiB)`)
console.log('Windows Setup is served directly from GitHub Releases (not bundled in dist-web).')
