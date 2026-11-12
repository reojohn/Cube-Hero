import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createReadStream, statSync } from 'node:fs'
import { resolve } from 'node:path'

const androidApkName = 'CubeHero-v1.0.0-android.apk'
const androidApkUrl = `/downloads/${androidApkName}`

// Serve the release in local Vite dev too, without putting the APK in public/.
// Keeping it out of public/ prevents the Android Capacitor bundle from
// accidentally containing the previous version's 28 MB installer.
function localApkDownload(): Plugin {
  return {
    name: 'cube-hero-local-apk-download',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (path !== androidApkUrl) return next()
        const file = resolve('releases', androidApkName)
        let size: number
        try { size = statSync(file).size } catch { res.statusCode = 404; res.end('APK unavailable'); return }
        res.setHeader('Content-Type', 'application/vnd.android.package-archive')
        res.setHeader('Content-Disposition', `attachment; filename="${androidApkName}"`)
        res.setHeader('Content-Length', size)
        const stream = createReadStream(file)
        stream.on('error', () => { try { res.end() } catch { /* connection closed */ } })
        stream.pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApkDownload()],
  server: { strictPort: false },
  build: {
    cssCodeSplit: false,
  },
})
