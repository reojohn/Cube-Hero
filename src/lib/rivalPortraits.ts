import type { Difficulty } from './racing'

/** All 55 premium rival portraits (Sub-6 → Sub-60).
 *  The manifest is keyed by difficulty, not the display name. Players can
 *  rename characters without losing their approved artwork.
 *  WebP is the fast default; the original transparent PNG and vector avatar
 *  remain automatic fallbacks in RivalPortrait.
 */
export const RIVAL_PORTRAIT_FILES: Readonly<Partial<Record<Difficulty, string>>> = {
  '6': 'Sub-6_Zenith.webp',
  '7': 'Sub-7_Astra.webp',
  '8': 'Sub-8_Nyx.webp',
  '9': 'Sub-9_Orion.webp',
  '10': 'Sub-10_Kairo.webp',
  '11': 'Sub-11_Veyra.webp',
  '12': 'Sub-12_Vanta.webp',
  '13': 'Sub-13_Soren.webp',
  '14': 'Sub-14_Kaela.webp',
  '15': 'Sub-15_Ryuu.webp',
  '16': 'Sub-16_Rei.webp',
  '17': 'Sub-17_Zara.webp',
  '18': 'Sub-18_Jett.webp',
  '19': 'Sub-19_Lyra.webp',
  '20': 'Sub-20_Ryo.webp',
  '21': 'Sub-21_Mika.webp',
  '22': 'Sub-22_Arden.webp',
  '23': 'Sub-23_Nova.webp',
  '24': 'Sub-24_Talon.webp',
  '25': 'Sub-25_Suki.webp',
  '26': 'Sub-26_Bex.webp',
  '27': 'Sub-27_Niko.webp',
  '28': 'Sub-28_Aiko.webp',
  '29': 'Sub-29_Zane.webp',
  '30': 'Sub-30_Riven.webp',
  '31': 'Sub-31_Iris.webp',
  '32': 'Sub-32_Kai.webp',
  '33': 'Sub-33_Sable.webp',
  '34': 'Sub-34_Dax.webp',
  '35': 'Sub-35_Lumi.webp',
  '36': 'Sub-36_Ezra.webp',
  '37': 'Sub-37_Mara.webp',
  '38': 'Sub-38_Kian.webp',
  '39': 'Sub-39_Tessa.webp',
  '40': 'Sub-40_Axel.webp',
  '41': 'Sub-41_Nia.webp',
  '42': 'Sub-42_Finn.webp',
  '43': 'Sub-43_Yuna.webp',
  '44': 'Sub-44_Milo.webp',
  '45': 'Sub-45_Juno.webp',
  '46': 'Sub-46_Remy.webp',
  '47': 'Sub-47_Skye.webp',
  '48': 'Sub-48_Theo.webp',
  '49': 'Sub-49_Piper.webp',
  '50': 'Sub-50_Koa.webp',
  '51': 'Sub-51_Lina.webp',
  '52': 'Sub-52_Ollie.webp',
  '53': 'Sub-53_Hana.webp',
  '54': 'Sub-54_Felix.webp',
  '55': 'Sub-55_Rina.webp',
  '56': 'Sub-56_Leo.webp',
  '57': 'Sub-57_Pax.webp',
  '58': 'Sub-58_Tori.webp',
  '59': 'Sub-59_Ember.webp',
  '60': 'Sub-60_Cody.webp',
}

/** Full-resolution WebP portrait for previews and VS intros. */
export function getRivalPortraitUrl(difficulty: Difficulty): string | undefined {
  const filename = RIVAL_PORTRAIT_FILES[difficulty]
  return filename ? `${import.meta.env.BASE_URL}rivals/${filename}` : undefined
}

/** Dedicated 160px variants for the small roster thumbnails.
 *  Drawing 55 full-resolution 512px images (with GPU shadows) on every
 *  scroll was a source of unnecessary decode, texture and paint work.
 */
export function getRivalPortraitThumbnailUrl(difficulty: Difficulty): string | undefined {
  const filename = RIVAL_PORTRAIT_FILES[difficulty]
  return filename ? `${import.meta.env.BASE_URL}rivals/thumbs/${filename}` : undefined
}

/** Original PNG retained for compatibility when WebP cannot be loaded. */
export function getRivalPortraitPngUrl(difficulty: Difficulty): string | undefined {
  return getRivalPortraitUrl(difficulty)?.replace(/\.webp$/, '.png')
}

// Keep the featured full-resolution portrait ready when selecting a character.
// Roster <img> elements already eagerly request tiny 160px WebPs; avoid
// pre-decoding all 55 full-size 512px files simultaneously on the UI thread.
const warmedPortraits = new Set<string>()
export function prewarmRivalPortraits(preferred?: Difficulty) {
  if (typeof Image === 'undefined' || !preferred) return
  const url = getRivalPortraitUrl(preferred)
  if (!url || warmedPortraits.has(url)) return
  warmedPortraits.add(url)
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  if (typeof img.decode === 'function') {
    void img.decode().catch(() => { /* visible component handles PNG/SVG fallback */ })
  }
}

/** Source-art palette for the later batches. These affect atmospheric glows,
 *  not rival divisions, difficulty, personality or CFOP race behaviour.
 *  Batch 2 artwork intentionally progresses through teal, violet, blue and
 *  amber/coral; Batch 3 remains in the same warm amber/coral family.
 */
export function getRivalPortraitTheme(difficulty: Difficulty, accent: string, glow: string): {
  '--rival-accent': string; '--rival-glow': string
} {
  const n = Number(difficulty)
  if (n >= 31 && n <= 35) return { '--rival-accent': '#BD8BF5', '--rival-glow': '#8B5EED' }
  if (n >= 36 && n <= 39) return { '--rival-accent': '#70CFFF', '--rival-glow': '#4F86EF' }
  if (n >= 40 && n <= 60) return { '--rival-accent': '#F6AB73', '--rival-glow': '#F77465' }
  if (n >= 26 && n <= 30) return { '--rival-accent': '#62E6D1', '--rival-glow': '#25AECB' }
  return { '--rival-accent': accent, '--rival-glow': glow }
}

/** Featured portrait's visible identity badge matches the actual illustration. */
export const RIVAL_PORTRAIT_MOTIFS: Readonly<Partial<Record<Difficulty, string>>> = {
  '6':'CROWN', '7':'STAR', '8':'PHOENIX', '9':'ORBIT', '10':'DIAMOND',
  '11':'JEWEL', '12':'COMMS', '13':'CRYSTAL', '14':'COSMOS', '15':'WAVE',
  '16':'ICE', '17':'SHARD', '18':'SWIFT', '19':'STELLAR', '20':'TECH',
  '21':'COSMOS', '22':'SCARF', '23':'PRISM', '24':'CIRCUIT', '25':'BLOOM',
  '26':'DIAMOND', '27':'COMMS', '28':'BLOOM', '29':'VISOR', '30':'ROYAL', '31':'LAUREL', '32':'SCARF', '33':'LUNAR', '34':'CYBER', '35':'COSMOS', '36':'ORBIT', '37':'FLORA', '38':'PRISM', '39':'STELLAR', '40':'CROWN', '41':'BLOOM', '42':'COMMS', '43':'CELESTIAL', '44':'ENGINEER', '45':'PHOENIX', '46':'ROYAL', '47':'ORBIT', '48':'VISOR', '49':'FLAME', '50':'CROWN', '51':'LAUREL', '52':'ORBIT', '53':'FLORA', '54':'CYBER', '55':'STAR', '56':'MECHA', '57':'SPARK', '58':'LUNAR', '59':'EMBER', '60':'COMMS'
}
