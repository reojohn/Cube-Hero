import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const src = resolve('dist-desktop')
const dst = resolve('windows-installer/dist')
try {
  const info = await stat(resolve(src, 'index.html'))
  if (!info.isFile()) throw new Error('Missing index.html')
} catch {
  console.error('Desktop build missing. Run the Vite desktop build first.')
  process.exit(1)
}
await rm(dst, { force: true, recursive: true })
await mkdir(dst, { recursive: true })
await cp(src, dst, { recursive: true })
console.log('CubeHero desktop game assets staged successfully (APK excluded).')
