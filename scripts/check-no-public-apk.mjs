/** Fail fast instead of accidentally shipping an old APK inside an Android APK. */
import { readdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'

async function scan(path) {
  let entries
  try { entries = await readdir(path, { withFileTypes: true }) }
  catch (error) { if (error.code === 'ENOENT') return []; throw error }
  const found = []
  for (const entry of entries) {
    const child = join(path, entry.name)
    if (entry.isDirectory()) found.push(...await scan(child))
    else if (entry.isFile() && /\.(apk|exe|msi)$/i.test(entry.name)) found.push(child)
  }
  return found
}
const offenders = await scan(resolve('public'))
if (offenders.length) {
  console.error('\nSTOP: Installer(s) inside public/ would be bundled into the Android app:')
  offenders.forEach((path) => console.error('  - ' + path))
  console.error('Move these files out of public/ into release-downloads/ first.\n')
  process.exitCode = 1
} else {
  console.log('Android asset safety check passed: no APK/EXE/MSI inside public/.')
}
