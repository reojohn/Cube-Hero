import { useEffect, useState } from 'react'
import {
  ArrowDown, ArrowRight, ArrowUpRight, Award, BookOpen, Check,
  ChevronDown, CircleCheck, Flag, Ghost,
  Download, GraduationCap, Layers3, Laptop, Menu, MousePointer2, Play, ShieldCheck,
  Smartphone, Sparkles, Timer, Trophy, X, Zap,
} from 'lucide-react'
import { GAME_START_URL } from '../lib/siteRouting'
import './LandingPage.css'

const FEATURES = [
  { label: 'RACE AI', title: 'Your toughest rival is ready.', description: 'Race against 1–10 human-like AI cubers. Choose your target speed and personality, then watch verified CFOP turns in 3D.', icon: Flag, tag: 'COMPETE', className: 'race', action: '/app#/race' },
  { label: 'GHOST RACE', title: 'Beat who you were yesterday.', description: 'Set your personal-best ghost, then race your own time on a fresh scramble. Your next rival is your past self.', icon: Ghost, tag: 'IMPROVE', className: 'ghost', action: '/app#/practice' },
  { label: 'CUBE HERO ACADEMY', title: 'Every algorithm. A new advantage.', description: 'Explore 41 F2L, 57 OLL, and 21 PLL cases with interactive cube viewing, recognition help, and practice progress.', icon: BookOpen, tag: 'MASTER', className: 'academy', action: '/app#/learn' },
  { label: 'HERO JOURNEY', title: 'Progress worth celebrating.', description: 'Earn 30 achievements, build XP, complete rotating daily and weekly challenges, and enter five-round AI tournaments.', icon: Trophy, tag: 'LEVEL UP', className: 'journey', action: '/app#/journey' },
]

const FAQS = [
  { question: 'Is Cube Hero free to play?', answer: 'Yes. You can open the browser version and play without making an account. The current web experience stores your progress locally on your device.' },
  { question: 'Can I download Cube Hero for Android?', answer: 'Yes. The Android APK is available in the download section of this landing page.' },
  { question: 'Can I install CubeHero on iPhone or iPad?', answer: 'Yes. Open this site in Safari, tap Share, choose Add to Home Screen, keep Open as Web App enabled if shown, then tap Add. No App Store account or IPA file is needed. Open the installed game online once before trying offline play.' },
  { question: 'Can I install CubeHero on a MacBook or iMac?', answer: 'Yes. On macOS Sonoma 14 or later, open CubeHero in Safari, choose File → Add to Dock (or Share → Add to Dock), name the app CubeHero, then click Add. Open the app online once before testing offline play.' },
  { question: 'Can I download CubeHero for Windows PC or laptop?', answer: 'Yes. The PC / Laptop button downloads the Windows Setup (.exe) directly from CubeHero’s official GitHub Release, with no GitHub account required.' },
  { question: 'Do I need a smart cube?', answer: 'No. Cube Hero is designed to work with a regular physical 3×3 cube. Apply the displayed scramble to your cube and use the on-screen timer to race.' },
  { question: 'Do I race against real people?', answer: 'Not at the moment. Race AI lets you challenge AI cubers built around verified CFOP move sequences. Ghost Race lets you race against your own saved time.' },
  { question: 'Will my records be saved?', answer: 'Your Race AI, Ghost Race, Academy, and Hero Journey progress is saved in the same browser on the same device. Clearing site storage or switching devices can remove that progress.' },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`lp-brand${compact ? ' lp-brand-small' : ''}`}>
    <span className="lp-brand-symbol"><img src="/cube-hero-mascot-384.png" alt="" width="46" height="46" /></span>
    <span className="lp-brand-name">CUBE<span>HERO</span><small>THE SPEEDCUBING ARENA</small></span>
  </span>
}

function WebLink({ className = '', children, to = GAME_START_URL }: { className?: string; children: React.ReactNode; to?: string }) {
  return <a className={className} href={to}>{children}</a>
}


/** Shared Apple install guide: renders identical steps and images in the page and modal. */
function AppleInstallCards({ modal = false }: { modal?: boolean }) {
  return (
    <div className={`lp-apple-help-grid${modal ? ' lp-apple-help-grid-in-modal' : ''}`}>
                <article className="lp-apple-help-card" id={modal ? undefined : "ios-install-help"} aria-labelledby={modal ? "lp-ios-modal-device-title" : "lp-ios-help-title"}>
                  <div className="lp-apple-help-card-head">
                    <span className="lp-apple-device-label"><Smartphone size={14}/> iOS / iPadOS · iPhone &amp; iPad</span>
                    <h4 id={modal ? "lp-ios-modal-device-title" : "lp-ios-help-title"}>Add to Home Screen</h4>
                  </div>
                  <ol className="lp-apple-help-list">
                    <li><span>01</span><p>Open the <strong>CubeHero website in Safari</strong> on your iPhone or iPad.</p></li>
                    <li><span>02</span><p>Tap <strong>Share</strong> (or Page Menu → Share), then select <strong>Add to Home Screen</strong>.</p></li>
                    <li><span>03</span><p>Keep <strong>Open as Web App</strong> enabled if offered, tap <strong>Add</strong>, and launch CubeHero from your Home Screen.</p></li>
                  </ol>
                  <div className="lp-apple-visuals lp-apple-visuals-ios" aria-label="Illustrated Safari installation screenshots for iPhone and iPad">
                    <figure className="lp-apple-visual">
                      <a href="/landing/cubehero-ios-share-step.webp" target="_blank" rel="noopener noreferrer" aria-label="Enlarge iPhone Safari Share button illustration">
                        <img src="/landing/cubehero-ios-share-step.webp" alt="Illustration of CubeHero open in iPhone Safari with the Share button highlighted" width="941" height="1672" loading="lazy" decoding="async"/>
                      </a>
                      <figcaption><strong>Step 1</strong> Tap Safari’s Share button <span>· View larger ↗</span></figcaption>
                    </figure>
                    <figure className="lp-apple-visual">
                      <a href="/landing/cubehero-ios-add-to-home-screen-step.webp" target="_blank" rel="noopener noreferrer" aria-label="Enlarge Add to Home Screen illustration">
                        <img src="/landing/cubehero-ios-add-to-home-screen-step.webp" alt="Illustration of Safari's Share menu highlighting Add to Home Screen for CubeHero" width="941" height="1672" loading="lazy" decoding="async"/>
                      </a>
                      <figcaption><strong>Step 2</strong> Choose Add to Home Screen <span>· View larger ↗</span></figcaption>
                    </figure>
                  </div>
                </article>
                <article className="lp-apple-help-card" id={modal ? undefined : "macos-install-help"} aria-labelledby={modal ? "lp-macos-modal-device-title" : "lp-macos-help-title"}>
                  <div className="lp-apple-help-card-head">
                    <span className="lp-apple-device-label"><Laptop size={14}/> macOS · MacBook &amp; iMac</span>
                    <h4 id={modal ? "lp-macos-modal-device-title" : "lp-macos-help-title"}>Add to Dock</h4>
                  </div>
                  <ol className="lp-apple-help-list">
                    <li><span>01</span><p>On <strong>macOS Sonoma 14 or later</strong>, open the CubeHero website in <strong>Safari</strong>.</p></li>
                    <li><span>02</span><p>Choose <strong>File → Add to Dock</strong> in the menu bar (or <strong>Share → Add to Dock</strong>).</p></li>
                    <li><span>03</span><p>Name it <strong>CubeHero</strong>, click <strong>Add</strong>, then open it from the Dock, Applications, or Spotlight.</p></li>
                  </ol>
                  <div className="lp-apple-visuals lp-apple-visuals-macos" aria-label="Illustrated macOS Safari Add to Dock installation screenshot">
                    <figure className="lp-apple-visual">
                      <a href="/landing/cubehero-macos-add-to-dock-step.webp" target="_blank" rel="noopener noreferrer" aria-label="Enlarge Safari File menu Add to Dock illustration">
                        <img src="/landing/cubehero-macos-add-to-dock-step.webp" alt="Illustration of macOS Safari displaying the File menu with Add to Dock highlighted, over CubeHero's landing page" width="1448" height="1086" loading="lazy" decoding="async"/>
                      </a>
                      <figcaption><strong>macOS</strong> File → Add to Dock <span>· View larger ↗</span></figcaption>
                    </figure>
                  </div>
                </article>
              </div>
  )
}

// The Android APK is staged into the website build; Windows Setup is hosted on GitHub Releases.
// Keep downloads and guide navigation independent so clicking Windows can do both.
function scrollToInstallGuide(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function PlatformDownloads({ compact = false, onIOSInstall }: { compact?: boolean; onIOSInstall: () => void }) {
  return <div className={`lp-download-platforms${compact ? ' lp-download-platforms-hero' : ''}`} aria-label="Get Cube Hero for your device">
    <a className="lp-platform-card lp-platform-card-android" href="/downloads/CubeHero-v1.0.0-android.apk?release=clean-official-20261113" download="CubeHero-v1.0.0-android.apk">
      <span className="lp-platform-icon"><Download size={18}/></span><span><strong>Android</strong><small>Download APK · v1.0.0</small></span>
    </a>
    <a className="lp-platform-card lp-platform-card-ios lp-platform-card-ios-ready" href="#ios-install-help" onClick={(event) => { event.preventDefault(); onIOSInstall() }} title="Open the iPhone/iPad install guide with screenshots and scroll to Apple instructions">
      <span className="lp-platform-icon"><Smartphone size={18}/></span><span><strong>iPhone / iPad</strong><small>See installation steps · Free</small></span>
    </a>
    <a className="lp-platform-card lp-platform-card-pc lp-platform-card-desktop-ready" href="https://github.com/reojohn/Cube-Hero/releases/download/v1.0.0/CubeHero-v1.0.0-Windows-Setup.exe" target="_blank" rel="noopener noreferrer" onClick={() => scrollToInstallGuide('windows-install-help')} title="Download CubeHero Windows Setup and see the installation guide">
      <span className="lp-platform-icon"><Laptop size={18}/></span><span><strong>PC / Laptop</strong><small>Download Windows Setup</small></span>
      <span className="lp-desktop-ready-icon" aria-hidden="true"><Download size={16}/></span>
    </a>
  </div>
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showIOSInstallModal, setShowIOSInstallModal] = useState(false)
  const openIOSInstallGuide = () => {
    // Navigate the underlying page to the illustrated guide as the modal opens.
    scrollToInstallGuide('ios-install-help')
    setShowIOSInstallModal(true)
  }
  const closeIOSInstallGuide = () => {
    setShowIOSInstallModal(false)
    // Ensure the reader lands at the visual guide even if the overlay interrupted scrolling.
    scrollToInstallGuide('ios-install-help')
  }
  useEffect(() => {
    if (!showIOSInstallModal) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowIOSInstallModal(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showIOSInstallModal])
  useEffect(() => {
    document.title = 'Cube Hero — Race. Learn. Become a Hero.'
    document.body.classList.add('cube-landing-body')
    return () => document.body.classList.remove('cube-landing-body')
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [menuOpen])
  const closeMenu = () => setMenuOpen(false)

  return <div className="lp-site">
    <div className="lp-backdrop" aria-hidden="true" />
    <header className="lp-header">
      <div className="lp-wrap lp-header-inner">
        <a href="#top" className="lp-brand-link" aria-label="Cube Hero, back to top" onClick={closeMenu}><Brand /></a>
        <nav className={`lp-nav${menuOpen ? ' is-open' : ''}`} aria-label="Landing page navigation" id="lp-navigation">
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#download" onClick={closeMenu}>Download</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>
          <WebLink className="lp-mobile-play" >Play Cube Hero <ArrowRight size={16}/></WebLink>
        </nav>
        <div className="lp-header-actions"><span className="lp-free-label"><span/> FREE TO PLAY</span><WebLink className="lp-button lp-button-primary lp-header-play lp-button-echo">Play now <ArrowUpRight size={16}/><span className="lp-cta-shine" aria-hidden="true" /></WebLink></div>
        <button type="button" className="lp-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="lp-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
      </div>
    </header>

    <main id="top">
      <section className="lp-hero lp-wrap" aria-labelledby="lp-hero-title">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow lp-entry"><span className="lp-eyebrow-dot"/> YOUR SPEEDCUBING JOURNEY STARTS HERE <Sparkles size={13}/></div>
          <h1 id="lp-hero-title" className="lp-hero-title lp-entry">SOLVE FASTER.<br/><span>RACE SMARTER.</span><br/>BECOME A <em>HERO.</em></h1>
          <p className="lp-hero-description lp-entry">More than a timer. Challenge human-like AI, chase your personal best, master CFOP, and turn every solve into progress.</p>
          <div className="lp-hero-actions lp-entry">
            <WebLink className="lp-button lp-button-primary lp-button-large lp-button-echo"><Play size={18} fill="currentColor"/> Play for free <ArrowRight size={18}/><span className="lp-cta-shine" aria-hidden="true" /></WebLink>
            <a href="#download" className="lp-button lp-button-secondary lp-button-large"><Smartphone size={19}/> All downloads <ArrowDown size={17}/></a>
          </div>
          <div className="lp-download-trust lp-entry"><ShieldCheck size={14}/><span>CubeHero on Android, Windows & iOS</span></div>
          <div className="lp-hero-downloads lp-entry"><div className="lp-hero-downloads-heading"><span>GET CUBE HERO</span><small>Android · Windows · iOS</small></div><PlatformDownloads compact onIOSInstall={openIOSInstallGuide} />
            <a className="lp-hero-windows-help" href="#windows-install-help">Windows installer showing a security warning? See the 2-step guide <ArrowDown size={13}/></a>
          </div>
          <div className="lp-hero-notes lp-entry"><span><CircleCheck size={15}/> No account needed</span><span><CircleCheck size={15}/> Works with a real 3×3 cube</span></div>
        </div>

        <div className="lp-hero-art" aria-label="Cube Hero hooded mascot holding a glowing puzzle cube">
          <div className="lp-hero-grid" aria-hidden="true"/>
          <div className="lp-hero-halo lp-hero-halo-one" aria-hidden="true"/>
          <div className="lp-hero-halo lp-hero-halo-two" aria-hidden="true"/>
          <div className="lp-art-topline"><span className="lp-status-dot"/> YOUR ARENA IS READY <span className="lp-art-cross">✦</span></div>
          <img className="lp-hero-mascot" src="/cube-hero-mascot-768.png" alt="Cube Hero's hooded cube-wielding hero mascot" width="768" height="768" fetchPriority="high" />
          <div className="lp-art-caption"><span className="lp-caption-stars">✦ ✦ ✦</span><span>THE NEXT SOLVE IS YOURS</span></div>
          <div className="lp-float-card lp-float-speed"><Zap size={18}/><span><strong>BEAT YOUR BEST</strong><small>One solve at a time</small></span></div>
          <div className="lp-float-card lp-float-badge"><Trophy size={20}/><span><strong>HERO JOURNEY</strong><small>30 achievements</small></span></div>
        </div>
      </section>

      <div className="lp-metrics-wrap">
        <div className="lp-wrap lp-metrics" aria-label="Cube Hero features at a glance">
          <div className="lp-metric"><strong>1–10</strong><span>AI RIVALS</span></div>
          <div className="lp-metric"><strong>119</strong><span>F2L · OLL · PLL CASES</span></div>
          <div className="lp-metric"><strong>30</strong><span>ACHIEVEMENTS</span></div>
          <div className="lp-metric"><strong>20</strong><span>DAILY + WEEKLY MISSIONS</span></div>
        </div>
      </div>

      <section id="features" className="lp-section lp-wrap lp-features-section" aria-labelledby="lp-features-title">
        <div className="lp-section-intro"><div className="lp-eyebrow"><span className="lp-eyebrow-dot"/> EVERYTHING YOU NEED TO LEVEL UP</div><h2 id="lp-features-title">Not just solving.<br/><span>A whole new arena.</span></h2><p>Compete, practice, learn, and keep building toward your next breakthrough—all in one place.</p></div>
        <div className="lp-features-grid">
          {FEATURES.map(({ label, title, description, icon: Icon, tag, className, action }, index) =>
            <article className={`lp-feature lp-feature-${className}`} key={label}>
              <div className="lp-feature-top"><span className="lp-feature-icon"><Icon size={27} strokeWidth={1.8}/></span><span className="lp-feature-index">0{index + 1} / 04</span></div>
              <span className="lp-feature-label">{label}</span><h3>{title}</h3><p>{description}</p>
              {className === 'ghost' ? <img className="lp-feature-ghost" src="/ghost-assassin-emblem.png" alt="" loading="lazy"/> : <div className="lp-feature-mark" aria-hidden="true">{className === 'race' ? 'VS' : className === 'academy' ? 'CFOP' : 'XP'}</div>}
              <WebLink to={action} className="lp-feature-link">{tag} <ArrowUpRight size={18}/></WebLink>
            </article>
          )}
        </div>
      </section>

      <section className="lp-split-wrap" id="how-it-works" aria-labelledby="lp-how-title">
        <div className="lp-wrap lp-how">
          <div className="lp-how-heading"><div className="lp-eyebrow"><span className="lp-eyebrow-dot"/> MADE FOR REAL CUBERS</div><h2 id="lp-how-title">Your cube. Your pace.<br/><span>Your comeback story.</span></h2><p>Everything starts with the cube you already have. No expensive hardware or special account needed.</p><WebLink className="lp-text-link">Enter the arena <ArrowRight size={18}/></WebLink></div>
          <div className="lp-steps">
            <div className="lp-step"><div className="lp-step-number">01</div><div><span>SCRAMBLE</span><h3>Mix your cube.</h3><p>Follow the displayed scramble on your physical 3×3 cube.</p></div><Layers3 size={22}/></div>
            <div className="lp-step"><div className="lp-step-number">02</div><div><span>RACE</span><h3>Start your solve.</h3><p>Use the inspection and timer controls to race an AI or your ghost.</p></div><Timer size={22}/></div>
            <div className="lp-step"><div className="lp-step-number">03</div><div><span>GROW</span><h3>Make every solve count.</h3><p>Review your performance, train CFOP, and progress through Hero Journey.</p></div><Award size={22}/></div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-wrap lp-showcase" aria-labelledby="lp-showcase-title">
        <div className="lp-showcase-card">
          <div className="lp-showcase-copy"><div className="lp-eyebrow"><Sparkles size={14}/> LEARN WITH PURPOSE</div><h2 id="lp-showcase-title">From first turns<br/>to <span>faster times.</span></h2><p>Practice notation, explore all 119 F2L/OLL/PLL cases, and study actual cube movements in an interactive 3D lesson viewer.</p><div className="lp-showcase-bullets"><span><Check size={16}/> Cross, F2L, OLL & PLL</span><span><Check size={16}/> Interactive cube viewing</span><span><Check size={16}/> Save your learned cases</span></div><WebLink className="lp-button lp-button-secondary" to="/app#/learn"><GraduationCap size={18}/> Explore the Academy <ArrowRight size={18}/></WebLink></div>
          <div className="lp-showcase-art" aria-hidden="true"><div className="lp-training-orbit"/><div className="lp-puzzle-cube"><div className="lp-puzzle-face lp-puzzle-front">{Array.from({length:9},(_,i)=><span key={i}/>)}</div><div className="lp-puzzle-face lp-puzzle-right">{Array.from({length:9},(_,i)=><span key={i}/>)}</div><div className="lp-puzzle-face lp-puzzle-top">{Array.from({length:9},(_,i)=><span key={i}/>)}</div></div><div className="lp-training-label">READY TO LEARN <span>✓</span></div></div>
        </div>
      </section>

      <section className="lp-section lp-wrap lp-battle-section" id="battle-modes" aria-labelledby="lp-battle-title">
        <div className="lp-section-intro lp-battle-intro">
          <div className="lp-eyebrow"><span className="lp-eyebrow-dot"/> CHOOSE YOUR CHALLENGE</div>
          <h2 id="lp-battle-title">Two rivalries. <span>One hero.</span></h2>
          <p>Go head-to-head with AI speedcubers or challenge your personal-best ghost. Here’s how each mode works.</p>
        </div>
        <div className="lp-battle-grid lp-poster-grid">
          <article className="lp-battle-card lp-poster-card" aria-labelledby="lp-ai-poster-title">
            <div className="lp-poster-frame">
              <picture>
                <source media="(max-width: 600px)" srcSet="/landing/race-ai-poster-mobile.webp" type="image/webp"/>
                <img className="lp-poster-image" src="/landing/race-ai-poster.webp" alt="CubeHero You versus AI: a speedcuber holding a Rubik's cube faces a futuristic AI competitor in a purple neon arena." width={1672} height={941} loading="lazy" decoding="async"/>
              </picture>
              <span className="lp-poster-corner"><Flag size={13}/> RACE AI</span>
            </div>
            <div className="lp-poster-info">
              <div className="lp-poster-title-row"><h3 id="lp-ai-poster-title">Challenge the AI.</h3><span className="lp-poster-kicker">HUMAN VS AI</span></div>
              <p>Pick your rival, share the same scramble, and race for the faster solve.</p>
              <ol className="lp-poster-mechanics">
                <li><span className="lp-poster-number">01</span><span><strong>Choose your rivals.</strong><small>Race 1–10 AI cubers. Set their speed and personality.</small></span></li>
                <li><span className="lp-poster-number">02</span><span><strong>Scramble your cube.</strong><small>Use the same displayed 3×3 scramble as your AI opponents.</small></span></li>
                <li><span className="lp-poster-number">03</span><span><strong>Race to the finish.</strong><small>Solve your physical cube before your AI rivals complete theirs.</small></span></li>
              </ol>
              <WebLink to="/app#/race" className="lp-button lp-button-primary lp-poster-cta"><Flag size={17}/> Challenge the AI <ArrowUpRight size={17}/></WebLink>
            </div>
          </article>
          <article className="lp-battle-card lp-poster-card lp-battle-card-ghost" aria-labelledby="lp-ghost-poster-title">
            <div className="lp-poster-frame">
              <picture>
                <source media="(max-width: 600px)" srcSet="/landing/ghost-race-poster-mobile.webp" type="image/webp"/>
                <img className="lp-poster-image" src="/landing/ghost-race-poster.webp" alt="CubeHero You versus Your Ghost: a speedcuber competes against a glowing purple ghost version of themself in a neon duel." width={1536} height={1024} loading="lazy" decoding="async"/>
              </picture>
              <span className="lp-poster-corner"><Ghost size={13}/> GHOST RACE</span>
            </div>
            <div className="lp-poster-info">
              <div className="lp-poster-title-row"><h3 id="lp-ghost-poster-title">Outrace your ghost.</h3><span className="lp-poster-kicker">YOU VS YOU</span></div>
              <p>Race against your own best recorded solve and chase a new personal best.</p>
              <ol className="lp-poster-mechanics">
                <li><span className="lp-poster-number">01</span><span><strong>Record three solves.</strong><small>Your fastest valid time becomes your personal ghost.</small></span></li>
                <li><span className="lp-poster-number">02</span><span><strong>Get a fresh scramble.</strong><small>Prepare your physical 3×3 cube for the next round.</small></span></li>
                <li><span className="lp-poster-number">03</span><span><strong>Beat your best.</strong><small>Finish faster than your ghost’s saved time to win.</small></span></li>
              </ol>
              <WebLink to="/app#/practice" className="lp-button lp-button-secondary lp-poster-cta"><Ghost size={17}/> Race your ghost <ArrowUpRight size={17}/></WebLink>
            </div>
          </article>
        </div>
      </section>

      <section id="download" className="lp-section lp-download-section" aria-labelledby="lp-download-title"><div className="lp-wrap">
        <div className="lp-download-card"><div className="lp-download-light" aria-hidden="true"/><div className="lp-download-left"><div className="lp-eyebrow"><Smartphone size={15}/> CUBE HERO EVERYWHERE</div><h2 id="lp-download-title">Your next solve<br/>is <span>always within reach.</span></h2><p>Play instantly on the web, download for Android or Windows, or install CubeHero on iPhone and iPad directly from Safari.</p><div className="lp-download-actions"><WebLink className="lp-button lp-button-primary lp-button-large"><Play size={18} fill="currentColor"/> Play on web <ArrowRight size={18}/></WebLink><PlatformDownloads onIOSInstall={openIOSInstallGuide} /></div><div className="lp-download-note"><ShieldCheck size={15}/> Android APK and Windows Setup download directly. On iPhone or iPad, tap the button above to view the Safari installation steps.</div></div><div className="lp-phone-art" aria-hidden="true"><div className="lp-phone"><div className="lp-phone-bar"/><div className="lp-phone-screen"><img src="/cube-hero-mascot-384.png" alt=""/><span>CUBE HERO</span><strong>YOUR ARENA<br/>AWAITS.</strong><div className="lp-phone-cta">PLAY NOW <ArrowRight size={12}/></div></div></div><div className="lp-phone-orbit lp-phone-orbit-one"/><div className="lp-phone-orbit lp-phone-orbit-two"/></div></div>
      </div></section>

      <section className="lp-windows-help-outer lp-wrap" aria-label="Windows installation help">
        <div className="lp-windows-help" id="windows-install-help" aria-labelledby="lp-windows-help-title">
          <div className="lp-windows-help-head">
            <div>
              <span className="lp-windows-help-kicker"><Laptop size={15}/> WINDOWS PC / LAPTOP</span>
              <h3 id="lp-windows-help-title">How to install CubeHero on Windows</h3>
              <p>Windows may show SmartScreen because this installer is unsigned. If you downloaded it from our official release, verified it, and trust the file, follow these two steps:</p>
            </div>
          </div>
          <div className="lp-windows-help-steps">
            <article className="lp-windows-help-step">
              <div className="lp-windows-help-step-heading"><span className="lp-windows-help-step-num">01</span><div><h4>Select “More info”</h4><p>On the Windows warning, click <strong>More info</strong> to see the app details.</p></div></div>
              <a className="lp-windows-help-image" href="/landing/windows-smartscreen-more-info.png" target="_blank" rel="noopener noreferrer" aria-label="View the first Windows SmartScreen warning screenshot at full size">
                <img src="/landing/windows-smartscreen-more-info.png" alt="Windows SmartScreen protection window with the More info link visible" width="667" height="624" loading="lazy" decoding="async"/>
              </a>
            </article>
            <article className="lp-windows-help-step">
              <div className="lp-windows-help-step-heading"><span className="lp-windows-help-step-num">02</span><div><h4>Choose “Run anyway”</h4><p>Check the installer name. If it matches the file you trust, click <strong>Run anyway</strong>.</p></div></div>
              <a className="lp-windows-help-image" href="/landing/windows-smartscreen-run-anyway.png" target="_blank" rel="noopener noreferrer" aria-label="View the second Windows SmartScreen warning screenshot at full size">
                <img src="/landing/windows-smartscreen-run-anyway.png" alt="Windows SmartScreen app details with CubeHero setup name and Run anyway button visible" width="663" height="617" loading="lazy" decoding="async"/>
              </a>
            </article>
          </div>
          <p className="lp-windows-help-footnote"><ShieldCheck size={15}/> Only proceed with installers you trust. Never disable SmartScreen globally. <a href="https://github.com/reojohn/Cube-Hero/releases/tag/v1.0.0" target="_blank" rel="noopener noreferrer">Verify the official v1.0.0 release <ArrowUpRight size={13}/></a></p>
        </div>
      </section>

      <section className="lp-apple-help-outer lp-wrap" id="apple-install-help" aria-labelledby="lp-apple-help-title">
        <div className="lp-apple-help">
          <div className="lp-apple-help-head">
            <span className="lp-apple-help-kicker"><Smartphone size={15}/> APPLE DEVICES · SAFARI INSTALLATION</span>
            <h3 id="lp-apple-help-title">Install CubeHero on Apple devices</h3>
            <p>iPhone, iPad, and Mac use Safari to install CubeHero as a web app. Follow the steps for your device below.</p>
          </div>
          <AppleInstallCards />
          <p className="lp-apple-help-footnote"><ShieldCheck size={15}/> Illustrative guides: Safari menus can look different across versions. For offline play, open CubeHero while connected once so its files can load, then test offline. Device storage cleanup may remove cached files.</p>
        </div>
      </section>

      <section className="lp-section lp-wrap lp-faq" id="faq" aria-labelledby="lp-faq-title"><div className="lp-faq-intro"><div className="lp-eyebrow"><span className="lp-eyebrow-dot"/> GOOD TO KNOW</div><h2 id="lp-faq-title">Questions, <span>answered.</span></h2><p>A few things to know before your first solve.</p></div><div className="lp-faq-items">{FAQS.map(({ question, answer }) => <details key={question} className="lp-faq-item"><summary>{question}<ChevronDown size={19}/></summary><p>{answer}</p></details>)}</div></section>
    </main>


    {showIOSInstallModal && (
      <div className="lp-ios-modal-backdrop" onClick={closeIOSInstallGuide}>
        <section className="lp-ios-modal lp-ios-modal-illustrated" role="dialog" aria-modal="true" aria-labelledby="lp-ios-modal-title" aria-describedby="lp-ios-modal-description" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="lp-ios-modal-close" onClick={closeIOSInstallGuide} aria-label="Close Apple installation guide" autoFocus><X size={19}/></button>
          <span className="lp-ios-modal-kicker"><Smartphone size={15}/> APPLE DEVICES · FREE SAFARI INSTALLATION</span>
          <h2 id="lp-ios-modal-title">Install CubeHero on Apple devices</h2>
          <p id="lp-ios-modal-description">Follow the instructions and illustrated screenshots for your device. Scroll inside this window to see both the iPhone/iPad and macOS guides.</p>
          <AppleInstallCards modal />
          <p className="lp-ios-modal-tip"><ShieldCheck size={15}/> These are illustrative Safari screenshots, so menus may look slightly different on your device. Launch CubeHero online once before trying offline.</p>
          <div className="lp-ios-modal-actions">
            <button type="button" className="lp-button lp-button-primary" onClick={closeIOSInstallGuide}>View guides on page <ArrowDown size={16}/></button>
            <button type="button" className="lp-button lp-button-secondary" onClick={closeIOSInstallGuide}>Close</button>
          </div>
        </section>
      </div>
    )}

    <footer className="lp-footer"><div className="lp-wrap"><div className="lp-footer-main"><div><Brand compact/><p>Race. Learn. Level up. Repeat.</p></div><div className="lp-footer-links"><a href="#features">Features</a><a href="#download">Download</a><a href="#faq">FAQ</a><WebLink>Play Cube Hero <ArrowUpRight size={15}/></WebLink></div></div><div className="lp-footer-bottom"><span>© {new Date().getFullYear()} Cube Hero. Built for the love of cubing.</span><span><MousePointer2 size={13}/> MADE FOR CUBERS · POWERED BY PRACTICE</span></div></div></footer>
  </div>
}
