/** Cube Hero Phase 1: one-time native Android setup, run locally with internet + Android Studio. */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const cmd = process.platform === 'win32' ? {npm:'npm.cmd', npx:'npx.cmd'} : {npm:'npm', npx:'npx'}
function run(binary, args) {
  console.log(`\n> ${binary} ${args.join(' ')}`)
  const result = spawnSync(binary, args, {cwd: root, stdio:'inherit', shell:process.platform==='win32'})
  if (result.error || result.status !== 0) {
    console.error(`Command failed: ${result.error?.message || result.status}`)
    process.exit(1)
  }
}
function hasPackage(name) {
  try {
    const info=JSON.parse(readFileSync(resolve(root,'node_modules',name,'package.json'),'utf8'))
    return info.version.split('.')[0] === '8'
  } catch { return false }
}
const major=Number(process.versions.node.split('.')[0])
if (major < 22) { console.error('Capacitor 8 requires Node.js 22 or newer.');process.exit(1) }
const nativePackages=['@capacitor/core','@capacitor/android','@capacitor/app','@capacitor/screen-orientation']
if (nativePackages.some(name=>!hasPackage(name))) {
  run(cmd.npm, ['install','--save','@capacitor/core@8','@capacitor/android@8','@capacitor/app@8','@capacitor/screen-orientation@8'])
}
if (!hasPackage('@capacitor/cli')) run(cmd.npm, ['install','--save-dev','@capacitor/cli@8'])
console.log('\nBuilding bundled offline web assets...')
run(cmd.npm, ['run','build'])
if (!existsSync(resolve(root,'android','app','build.gradle'))) {
  console.log('\nCreating the native Android Studio project...')
  run(cmd.npx, ['--no-install','cap','add','android'])
}
run(cmd.npx, ['--no-install','cap','sync','android'])
console.log('\nAndroid project prepared. Open it with: npm run android:open')
console.log('In Android Studio, run on your connected Android device to make a test APK.')
console.log('IMPORTANT: com.cubehero.speedcubing is a provisional app ID. Finalize it before a Play Store release.')
