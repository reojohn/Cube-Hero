/**
 * Create a versioned desktop-only service worker AFTER the Vercel website build.
 * Never cache an Android APK; never run this generator in the Capacitor build.
 * All local game chunks and images are precached for offline PC usage.
 */
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = path.resolve('dist-web')
const swPath = path.join(root, 'cubehero-sw.js')
const result = []

async function walk(folder) {
  for (const item of await fs.readdir(folder, { withFileTypes: true })) {
    const full = path.join(folder, item.name)
    if (item.isDirectory()) {
      if (path.relative(root, full).replaceAll('\\', '/').startsWith('downloads')) continue
      await walk(full)
    } else if (item.isFile()) {
      const rel = path.relative(root, full).replaceAll('\\', '/')
      if (rel.startsWith('downloads/') || /\.(apk|exe|msi|zip|map)$/i.test(rel) || rel === 'cubehero-sw.js') continue
      const contents = await fs.readFile(full)
      result.push({ url: '/' + rel, digest: createHash('sha256').update(contents).digest('hex').slice(0, 12) })
    }
  }
}

await walk(root)
result.sort((a, b) => a.url.localeCompare(b.url))
const revision = createHash('sha256').update(JSON.stringify(result)).digest('hex').slice(0, 14)
const files = [...new Set(['/', '/app', ...result.map((entry) => entry.url)])]
const serviceWorker = `/* CubeHero desktop offline files: generated from website build ${revision}. */
const CACHE_PREFIX = 'cubehero-desktop-';
const CACHE_NAME = CACHE_PREFIX + '${revision}';
const FILES = ${JSON.stringify(files)};
const CACHE_BATCH = 8;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Avoid hundreds of concurrent downloads on slower connections.
    for (let index = 0; index < FILES.length; index += CACHE_BATCH) {
      await Promise.allSettled(FILES.slice(index, index + CACHE_BATCH).map(async url => {
        await cache.add(new Request(url, { cache: 'reload' }));
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/downloads/') || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          // Ensure normal navigation and the desktop app launch both work offline.
          const route = url.pathname === '/app' ? '/app' : '/';
          await cache.put(route, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(url.pathname, { ignoreSearch: true })) ||
          (await cache.match('/app')) || (await cache.match('/')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
`
await fs.writeFile(swPath, serviceWorker)
console.log(`CubeHero PC/PWA ready: ${files.length} local files, cache ${revision} (Android APK excluded)`)
