/** Register the website-only desktop cache without affecting Capacitor builds. */
export function registerDesktopPwa() {
  if (!('serviceWorker' in navigator)) return
  if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname)) return

  const register = () => {
    // Updates are checked in the background; a failed cache never blocks play.
    navigator.serviceWorker.register('/cubehero-sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // Safari, privacy settings or restricted browsing may reject registration.
    })
  }
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
