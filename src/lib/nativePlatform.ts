/**
 * Tiny bridge to Capacitor's native-injected global. Keeping the app entry
 * independent of npm native packages means the existing website remains
 * buildable before Android has been installed. The optional plugins are
 * installed by `npm run android:setup` and registered by `cap sync`.
 */
type NativeListener = { remove: () => Promise<void> | void }
type NativeAppPlugin = {
  // Capacitor plugin bridges may provide a listener handle immediately or as
  // a Promise. Both forms must be accepted or native startup can crash.
  addListener: (event: 'backButton', handler: () => void) => NativeListener | PromiseLike<NativeListener>
  minimizeApp: () => Promise<void> | void
}
type NativeOrientationPlugin = {
  lock: (options: { orientation: 'portrait' | 'landscape' }) => Promise<void>
  unlock: () => Promise<void>
}
type NativeBridge = {
  getPlatform?: () => string
  isNativePlatform?: () => boolean
  platform?: string
  Plugins?: { App?: NativeAppPlugin; ScreenOrientation?: NativeOrientationPlugin }
}

function nativeBridge(): NativeBridge | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { Capacitor?: NativeBridge }).Capacitor
}

export function isNativeApp(): boolean {
  const bridge = nativeBridge()
  if (!bridge) return false
  if (typeof bridge.isNativePlatform === 'function') return bridge.isNativePlatform()
  const platform = bridge.getPlatform?.() ?? bridge.platform
  return platform === 'android' || platform === 'ios'
}

export function isNativeAndroid(): boolean {
  const bridge = nativeBridge()
  return isNativeApp() && (bridge?.getPlatform?.() ?? bridge?.platform) === 'android'
}

export function nativeOrientationPlugin(): NativeOrientationPlugin | undefined {
  return isNativeApp() ? nativeBridge()?.Plugins?.ScreenOrientation : undefined
}

function safelyRemoveNativeListener(handle: NativeListener | undefined): void {
  if (!handle || typeof handle.remove !== 'function') return
  try {
    void Promise.resolve(handle.remove()).catch(() => {})
  } catch { /* Navigation teardown must never crash CubeHero. */ }
}

/** One app-level subscriber; never put this in a live race's render loop. */
export function listenForNativeBack(handler: () => void): () => void {
  const plugin = isNativeAndroid() ? nativeBridge()?.Plugins?.App : undefined
  if (!plugin) return () => {}

  let disposed = false
  let listener: NativeListener | undefined
  try {
    // Some Capacitor versions return a listener synchronously, others return
    // a Promise. Promise.resolve normalizes both, including thenables.
    void Promise.resolve(plugin.addListener('backButton', handler))
      .then(handle => {
        if (disposed) safelyRemoveNativeListener(handle)
        else listener = handle
      })
      .catch(() => { /* If native registration fails, web UI still renders. */ })
  } catch { /* A failed native listener must not block initial app rendering. */ }

  return () => {
    disposed = true
    safelyRemoveNativeListener(listener)
    listener = undefined
  }
}

/** Minimize instead of forcing a kill; keep the native WebView and race history. */
export function minimizeNativeApp(): void {
  const plugin = nativeBridge()?.Plugins?.App
  if (isNativeAndroid() && plugin) {
    try { void Promise.resolve(plugin.minimizeApp()).catch(() => {}) }
    catch { /* Native action unavailable: do not crash game. */ }
  }
}
