/** Read-only deployment readiness checks. Does not contact Vercel or mutate player data. */
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')
const packageJson = JSON.parse(read('package.json'))
const lock = JSON.parse(read('package-lock.json'))
const vercel = JSON.parse(read('vercel.json'))

assert.equal(packageJson.scripts.build, 'tsc --noEmit && vite build', 'Vercel build must typecheck and run Vite')
assert.equal(packageJson.engines?.node, '22.x', 'Pin Node to a tested major release')
assert.equal(lock.packages[''].engines?.node, packageJson.engines.node, 'Keep lockfile root metadata in sync')
assert.equal(lock.lockfileVersion, 3, 'Require an npm lockfile supported by current npm')
assert.ok(packageJson.dependencies.react && packageJson.devDependencies.vite, 'React/Vite dependencies must be declared')
assert.ok(packageJson.scripts['test:vercel'], 'Deployment smoke-test script must be available')
assert.equal(vercel.rewrites.find(r => r.source === '/app')?.destination, '/index.html')
assert.equal(vercel.rewrites.find(r => r.source === '/app/:path*')?.destination, '/index.html')
assert.equal(vercel.rewrites.at(-1)?.source, '/(.*)', 'Last rewrite must provide Vite SPA fallback')
assert.equal(vercel.rewrites.at(-1)?.destination, '/index.html')

const routing = read('src/lib/siteRouting.ts')
const appEntry = read('src/main.tsx')
assert.match(routing, /normalizedPath === '\/app'/, '/app must select the game')
assert.match(routing, /GAME_START_URL\s*=\s*'\/app#\/home'/)
assert.match(appEntry, /isGameLocation\(window\.location\.pathname, window\.location\.hash\)/)
assert.ok(existsSync(path.join(root, 'src/workers/solver.worker.ts')), 'CFOP Web Worker source is required')
assert.match(read('src/lib/solver.ts'), /new Worker\(new URL\('\.\.\/workers\/solver\.worker\.ts', import\.meta\.url\)/, 'Use Vite-bundled worker URL')

for (const asset of ['favicon.png', 'cube-hero-mascot-768.png', 'apple-touch-icon.png', 'ghost-assassin-emblem.png', 'ai-personalities/casual.png', 'ai-personalities/balanced.png', 'ai-personalities/competitive.png']) {
  assert.ok(existsSync(path.join(root, 'public', asset)), `Missing public asset: ${asset}`)
}
for (const folder of ['rivals', 'rivals/thumbs']) {
  const files = readdirSync(path.join(root, 'public', folder)).filter(name => name.endsWith('.webp'))
  assert.equal(files.length, 55, `Expected 55 rival WebPs in public/${folder}`)
}
const allPublicFiles = (folder) => readdirSync(folder, { withFileTypes: true }).flatMap(item => item.isDirectory() ? allPublicFiles(path.join(folder, item.name)) : [path.join(folder, item.name)])
const publicBytes = allPublicFiles(path.join(root, 'public')).reduce((sum, file) => sum + statSync(file).size, 0)
assert.ok(publicBytes < 95 * 1024 * 1024, 'Public assets may approach the 100 MB Hobby static upload limit')

const ignore = read('.gitignore')
for (const value of ['node_modules/', 'dist/', '.vercel/', '.env']) assert.ok(ignore.includes(value), `Add ${value} to .gitignore`)
console.log(`PASS: Vercel routing, Node 22 pin, build configuration, solver worker, 55 portraits, assets (${(publicBytes / 1048576).toFixed(1)} MiB), and Git hygiene`)
console.log('Note: This is a static readiness check, not a successful Vercel or Linux production build.')
