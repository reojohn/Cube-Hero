// CubeHero Windows standalone desktop host.
// All app code is bundled locally. No remote website is loaded.
const { app, BrowserWindow, protocol, session } = require('electron')
const path = require('node:path')
const { readFile } = require('node:fs/promises')

const SCHEME = 'cubehero'
const HOST = 'app'
const ROOT = path.join(__dirname, 'dist')

// A secure, standard custom origin keeps /assets URLs and localStorage working.
// This also avoids loading pages from file:// and the associated limitations.
protocol.registerSchemesAsPrivileged([{
  scheme: SCHEME,
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    stream: true,
    corsEnabled: true,
  },
}])

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
}

app.whenReady().then(async () => {
  protocol.handle(SCHEME, async request => {
    let pathname
    try {
      const url = new URL(request.url)
      if (url.hostname !== HOST) return new Response('Forbidden', { status: 403 })
      pathname = decodeURIComponent(url.pathname)
      if (pathname.includes('\\') || pathname.includes('\\0')) return new Response('Invalid path', { status: 400 })
    } catch {
      return new Response('Invalid URL', { status: 400 })
    }

    // /app is the real CubeHero game; other internal hash routes stay on /app.
    const appRoute = pathname === '/' || pathname === '/app' || pathname.startsWith('/app/')
    const rel = appRoute ? 'index.html' : pathname.replace(/^\/+/, '')
    if (!rel || rel.split('/').some(x => x === '..' || x === '.')) {
      return new Response('Invalid path', { status: 400 })
    }

    const filename = path.resolve(ROOT, rel)
    if (filename !== ROOT && !filename.startsWith(ROOT + path.sep)) {
      return new Response('Forbidden', { status: 403 })
    }
    try {
      const bytes = await readFile(filename)
      const contentType = mime[path.extname(filename).toLowerCase()] || 'application/octet-stream'
      return new Response(bytes, { status: 200, headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      } })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })

  const mainWindow = new BrowserWindow({
    width: 1330,
    height: 850,
    minWidth: 800,
    minHeight: 550,
    backgroundColor: '#080916',
    title: 'CubeHero — The Speedcubing Arena',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, 'assets', 'cubehero.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
    },
  })
  mainWindow.once('ready-to-show', () => mainWindow.show())
  // External navigation is blocked; this EXE runs only its locally bundled game.
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, destination) => {
    try {
      const target = new URL(destination)
      if (target.protocol !== SCHEME + ':' || target.hostname !== HOST) event.preventDefault()
    } catch { event.preventDefault() }
  })
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
  await mainWindow.loadURL('cubehero://app/app#/home')
}).catch(error => {
  console.error('CubeHero could not start:', error)
  app.quit()
})

app.on('window-all-closed', () => app.quit())
