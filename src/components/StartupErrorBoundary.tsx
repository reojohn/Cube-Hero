import React from 'react'

type Props = { children: React.ReactNode }
type State = { error: Error | null }

/** Makes an actual WebView startup exception visible without requiring a USB debugger. */
export default class StartupErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('CubeHero startup error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const diagnostic = `${this.state.error.message}\n\n${this.state.error.stack ?? ''}`
    return (
      <main role="alert" style={{
        minHeight: '100dvh', boxSizing: 'border-box', padding: 'max(70px, env(safe-area-inset-top, 0px)) 24px 40px',
        background: '#090c19', color: '#f5f0ff', fontFamily: 'system-ui, sans-serif',
      }}>
        <h1 style={{ fontSize: 23, margin: '0 0 12px' }}>CubeHero could not start</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>The game encountered an error while opening. Please screenshot the details below so we can identify the cause.</p>
        <pre style={{
          padding: 14, border: '1px solid #544278', borderRadius: 10, background: '#161b37',
          fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
        }}>{diagnostic}</pre>
        <button type="button" onClick={() => window.location.reload()} style={{
          padding: '12px 18px', border: 0, borderRadius: 10, color: 'white',
          background: '#8552ff', fontSize: 14, fontWeight: 700,
        }}>Retry CubeHero</button>
      </main>
    )
  }
}
