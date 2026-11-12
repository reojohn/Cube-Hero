/** WEBSITE-ONLY stage: Vercel builds dist-web; Capacitor builds dist.
 * Never place an installer inside public/ or Capacitor's dist/ output.
 */
import { copyFile, mkdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const name = 'CubeHero-v1.0.0-android.apk'
const source = resolve('release-downloads', name)
const target = resolve('dist-web', 'downloads', name)
const sourceStat = await stat(source)
if (!sourceStat.isFile() || sourceStat.size < 1_000_000) {
  throw new Error('Missing or unexpectedly small official APK: ' + source)
}
await stat(resolve('dist-web', 'index.html'))
await mkdir(resolve('dist-web', 'downloads'), { recursive: true })
await copyFile(source, target)
const targetStat = await stat(target)
if (sourceStat.size !== targetStat.size) throw new Error('APK web staging copy failed')
console.log(`Website download ready: /downloads/${name} (${(targetStat.size / 1048576).toFixed(2)} MiB)`)
