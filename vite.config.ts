import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createReadStream, statSync } from 'node:fs'
import { resolve } from 'node:path'

const releaseName = 'CubeHero-v1.0.0-android.apk'
const releasePath = resolve('release-downloads', releaseName)

/** Local downloads work in npm run dev without adding the APK to public/. */
function cubeHeroLocalRelease(): Plugin {
  return {
    name: 'cubehero-local-release-download',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0]
        if (pathname !== `/downloads/${releaseName}`) return next()
        let size: number
        try { size = statSync(releasePath).size } catch { res.statusCode = 404; res.end('Release APK not found'); return }
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/vnd.android.package-archive')
        res.setHeader('Content-Disposition', `attachment; filename="${releaseName}"`)
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Content-Length', size)
        const stream = createReadStream(releasePath)
        stream.on('error', () => { if (!res.headersSent) res.statusCode = 500; res.end() })
        stream.pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cubeHeroLocalRelease()],
  server: { strictPort: false },
  build: { cssCodeSplit: false },
})
