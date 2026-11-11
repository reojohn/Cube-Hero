/**
 * CubeHero's tiny, entirely local sound engine. No downloads, audio assets,
 * recurring timers, or React renders; one AudioContext is reused throughout
 * the app. Every cue is a short, balanced Web Audio envelope.
 *
 * Browsers (especially mobile Safari/Chrome) require a user interaction before
 * sound playback. unlockGameAudio() is called from real pointer/key gestures.
 */
export type GameSound =
  | 'inspect' | 'arm' | 'ready' | 'start' | 'stop' | 'countdown'
  | 'opponentFinish' | 'victory' | 'loss' | 'personalBest'
  | 'ghostFinish' | 'vs' | 'preview'

export type GameAudioSettings = {
  enabled: boolean
  volume: number
  cinematic: boolean
  timer: boolean
}

const defaults: GameAudioSettings = { enabled: false, volume: 55, cinematic: true, timer: true }
let settings = { ...defaults }
let context: AudioContext | null = null
let bus: GainNode | null = null
// Previous 0.25 mix was barely audible on mobile, even at 100%.
// 0.65 keeps start/stop cues distinct without making overlapping tones clip.
const MASTER_GAIN = 0.65

export function configureGameAudio(next: Partial<GameAudioSettings>): void {
  settings = { ...settings, ...next, volume: Math.min(100, Math.max(0, Number(next.volume ?? settings.volume) || 0)) }
  if (bus && context) bus.gain.setTargetAtTime(settings.enabled ? settings.volume / 100 * MASTER_GAIN : 0, context.currentTime, 0.01)
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !settings.enabled || !settings.volume) return null
  if (!context || context.state === 'closed') {
    const Constructor = window.AudioContext
    if (!Constructor) return null
    try {
      context = new Constructor({ latencyHint: 'interactive' })
      bus = context.createGain()
      bus.gain.value = settings.volume / 100 * MASTER_GAIN
      bus.connect(context.destination)
    } catch { context = null; bus = null; return null }
  }
  return context
}

/** Only call from a user gesture: browsers suspend audio otherwise. */
export function unlockGameAudio(): void {
  const audio = getContext()
  if (audio?.state === 'suspended') void audio.resume().catch(() => {})
}

type Note = [frequency: number, offset: number, duration: number, peak?: number, type?: OscillatorType, endFrequency?: number]

const effects: Record<GameSound, Note[]> = {
  inspect: [[470, 0, .105, .28, 'sine', 680], [840, .095, .14, .22, 'triangle', 1050]],
  arm: [[290, 0, .09, .11, 'sine', 380]],
  ready: [[660, 0, .105, .30, 'sine'], [990, .11, .15, .23, 'sine']],
  start: [[940, 0, .09, .33, 'triangle', 630], [1240, .04, .11, .10, 'sine']],
  stop: [[580, 0, .135, .34, 'triangle', 380], [370, .10, .09, .13, 'sine']],
  countdown: [[780, 0, .08, .21, 'sine']],
  opponentFinish: [[700, 0, .075, .14, 'triangle'], [480, .1, .105, .12, 'sine']],
  victory: [[520, 0, .13, .2, 'triangle'], [660, .12, .13, .22, 'sine'], [880, .24, .13, .24, 'sine'], [1050, .36, .22, .23, 'triangle']],
  loss: [[470, 0, .15, .2, 'triangle'], [350, .16, .20, .14, 'sine']],
  personalBest: [[620, 0, .12, .24, 'sine'], [830, .11, .11, .22, 'triangle'], [1046, .22, .17, .25, 'sine'], [1320, .37, .24, .20, 'sine']],
  ghostFinish: [[360, 0, .21, .17, 'sine', 510], [720, .17, .23, .16, 'sine', 900]],
  vs: [[800, 0, .32, .17, 'sawtooth', 110], [340, .38, .29, .23, 'triangle', 110], [700, .4, .24, .17, 'sine', 920]],
  preview: [[540, 0, .10, .23, 'sine'], [680, .13, .11, .23, 'sine'], [910, .26, .19, .24, 'triangle']],
}

const cinematicOnly = new Set<GameSound>(['vs'])
const timerOnly = new Set<GameSound>(['inspect', 'arm', 'ready', 'start', 'stop', 'countdown'])

/** Schedules short effects on the AudioContext's own clock, not on timer frames. */
export function playGameSound(cue: GameSound, delay = 0): void {
  if (!settings.enabled || !settings.volume) return
  if (cinematicOnly.has(cue) && !settings.cinematic) return
  if (timerOnly.has(cue) && !settings.timer) return
  const audio = getContext()
  if (!audio || !bus || audio.state === 'closed') return
  const base = audio.currentTime + Math.max(0, delay)
  try {
    for (const [frequency, offset, duration, peak = 0.2, type = 'sine', endFrequency] of effects[cue]) {
      const from = base + offset
      const osc = audio.createOscillator()
      const envelope = audio.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(frequency, from)
      if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFrequency), from + duration)
      envelope.gain.setValueAtTime(0.0001, from)
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), from + Math.min(0.025, duration / 3))
      envelope.gain.exponentialRampToValueAtTime(0.0001, from + duration)
      osc.connect(envelope)
      envelope.connect(bus)
      osc.start(from)
      osc.stop(from + duration + .01)
      osc.onended = () => { try {osc.disconnect(); envelope.disconnect()} catch {/* browser shutdown */} }
    }
  } catch { /* Sound can fail gracefully without ever impacting a race. */ }
}
