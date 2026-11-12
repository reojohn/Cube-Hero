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


// Both download locations use the same source: the APK bundled in the site's public folder.
// The upcoming platform buttons deliberately remain disabled until an actual build is ready.
function PlatformDownloads({ compact = false }: { compact?: boolean }) {
  return <div className={`lp-download-platforms${compact ? ' lp-download-platforms-hero' : ''}`} aria-label="Get Cube Hero for your device">
    <a className="lp-platform-card lp-platform-card-android" href="/downloads/CubeHero-v1.0.0-android.apk?release=clean-official-20261113" download="CubeHero-v1.0.0-android.apk">
      <span className="lp-platform-icon"><Download size={18}/></span><span><strong>Android</strong><small>Download APK · v1.0.0</small></span>
    </a>
    <button type="button" className="lp-platform-card lp-platform-card-ios" disabled title="iOS release coming soon">
      <span className="lp-platform-icon"><Smartphone size={18}/></span><span><strong>iOS</strong><small>Coming soon</small></span>
    </button>
    <button type="button" className="lp-platform-card lp-platform-card-pc" disabled title="PC / Laptop release coming soon">
      <span className="lp-platform-icon"><Laptop size={18}/></span><span><strong>PC / Laptop</strong><small>Coming soon</small></span>
    </button>
  </div>
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
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
          <div className="lp-download-trust lp-entry"><ShieldCheck size={14}/><span>Official CubeHero APK · Direct download from this site</span></div>
          <div className="lp-hero-downloads lp-entry"><div className="lp-hero-downloads-heading"><span>GET CUBE HERO</span><small>Android available now</small></div><PlatformDownloads compact /></div>
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
        <div className="lp-download-card"><div className="lp-download-light" aria-hidden="true"/><div className="lp-download-left"><div className="lp-eyebrow"><Smartphone size={15}/> CUBE HERO EVERYWHERE</div><h2 id="lp-download-title">Your next solve<br/>is <span>always within reach.</span></h2><p>Play Cube Hero instantly on the web, download the Android build today, and get ready for upcoming iOS and PC releases.</p><div className="lp-download-actions"><WebLink className="lp-button lp-button-primary lp-button-large"><Play size={18} fill="currentColor"/> Play on web <ArrowRight size={18}/></WebLink><PlatformDownloads /></div><div className="lp-download-note"><ShieldCheck size={15}/> Android APK available now. iPhone and PC buttons are ready for the future files you’ll attach later.</div></div><div className="lp-phone-art" aria-hidden="true"><div className="lp-phone"><div className="lp-phone-bar"/><div className="lp-phone-screen"><img src="/cube-hero-mascot-384.png" alt=""/><span>CUBE HERO</span><strong>YOUR ARENA<br/>AWAITS.</strong><div className="lp-phone-cta">PLAY NOW <ArrowRight size={12}/></div></div></div><div className="lp-phone-orbit lp-phone-orbit-one"/><div className="lp-phone-orbit lp-phone-orbit-two"/></div></div>
      </div></section>

      <section className="lp-section lp-wrap lp-faq" id="faq" aria-labelledby="lp-faq-title"><div className="lp-faq-intro"><div className="lp-eyebrow"><span className="lp-eyebrow-dot"/> GOOD TO KNOW</div><h2 id="lp-faq-title">Questions, <span>answered.</span></h2><p>A few things to know before your first solve.</p></div><div className="lp-faq-items">{FAQS.map(({ question, answer }) => <details key={question} className="lp-faq-item"><summary>{question}<ChevronDown size={19}/></summary><p>{answer}</p></details>)}</div></section>
    </main>

    <footer className="lp-footer"><div className="lp-wrap"><div className="lp-footer-main"><div><Brand compact/><p>Race. Learn. Level up. Repeat.</p></div><div className="lp-footer-links"><a href="#features">Features</a><a href="#download">Download</a><a href="#faq">FAQ</a><WebLink>Play Cube Hero <ArrowUpRight size={15}/></WebLink></div></div><div className="lp-footer-bottom"><span>© {new Date().getFullYear()} Cube Hero. Built for the love of cubing.</span><span><MousePointer2 size={13}/> MADE FOR CUBERS · POWERED BY PRACTICE</span></div></div></footer>
  </div>
}
