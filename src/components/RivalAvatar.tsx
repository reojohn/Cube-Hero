import { useId } from 'react'
import type { RivalProfile } from '../lib/rivals'

/**
 * Cube Hero — Phase 2.6 Clean Premium Vector Rivals.
 * Still entirely code-drawn, but simplified: softer silhouettes, fewer hard
 * contour lines, friendlier accessories, and a cleaner featured illustration.
 */
export type RivalArtDNA = {
  silhouette: number
  eyes: number
  armor: number
  accessory: number
  mask: number
  energy: number
}

const SIGNATURE_ORNAMENTS: Partial<Record<number, number>> = {
  6: 5,   // Zenith: crown crest
  7: 1,   // Astra: star circlet
  8: 9,   // Nyx: ember pin / moon sigil
  9: 10,  // Orion: orbit jewel
  10: 7,  // Kairo: speed band
  11: 1,
  12: 8,  // Vanta: comms
  13: 6,
  14: 4,
  15: 6,
  17: 6,
  18: 8,
  22: 7,
  23: 1,
  24: 4,
  26: 4,
  28: 1,
  31: 10,
  33: 2,
  40: 8,
  56: 5,
  57: 3,
  58: 8,
  59: 6,
  60: 3,
}

export function getRivalArtDNA(rival: Pick<RivalProfile, 'difficulty'>): RivalArtDNA {
  const index = Number(rival.difficulty) - 6
  return {
    silhouette: index % 11,
    eyes: Math.floor(index / 11),
    armor: (index * 3 + 2) % 7,
    accessory: SIGNATURE_ORNAMENTS[Number(rival.difficulty)] ?? (index * 7 + 3) % 11,
    mask: (index * 2 + 1) % 5,
    energy: (index * 3 + Math.floor(index / 11)) % 5,
  }
}

export const ART_MOTIFS = ['CREST', 'STAR', 'MOON', 'LAUREL', 'AURORA', 'CROWN', 'RIBBON', 'SWIFT', 'COMMS', 'EMBER', 'ORBIT'] as const

const HOOD_SHAPES = [
  'M69 176 C64 145 68 103 85 79 C96 63 112 54 120 55 C128 54 144 63 155 79 C172 103 176 145 171 176 C160 186 150 194 138 201 C126 207 114 207 102 201 C90 194 80 186 69 176Z',
  'M70 177 C65 149 65 110 83 85 C91 73 103 63 120 57 C137 63 149 73 157 85 C175 110 175 149 170 177 C159 188 149 196 136 203 C126 207 114 207 104 203 C91 196 81 188 70 177Z',
  'M68 174 C67 144 71 109 89 82 C98 69 106 63 120 58 C134 63 142 69 151 82 C169 109 173 144 172 174 C162 186 149 194 136 201 C126 207 114 207 104 201 C91 194 78 186 68 174Z',
  'M72 178 C66 148 70 118 84 88 C95 66 109 58 120 53 C131 58 145 66 156 88 C170 118 174 148 168 178 C157 187 149 196 137 202 C126 208 114 208 103 202 C91 196 83 187 72 178Z',
  'M67 176 C66 149 72 117 86 92 C94 78 106 64 120 58 C134 64 146 78 154 92 C168 117 174 149 173 176 C162 186 151 194 138 202 C126 208 114 208 102 202 C89 194 78 186 67 176Z',
  'M70 176 C66 152 69 114 82 92 C92 74 104 61 120 56 C136 61 148 74 158 92 C171 114 174 152 170 176 C159 187 149 195 137 202 C126 208 114 208 103 202 C91 195 81 187 70 176Z',
  'M68 175 C64 146 69 111 84 86 C92 73 104 63 120 56 C136 63 148 73 156 86 C171 111 176 146 172 175 C161 186 150 194 138 201 C126 208 114 208 102 201 C90 194 79 186 68 175Z',
  'M71 177 C67 150 69 117 83 90 C92 73 104 63 120 56 C136 63 148 73 157 90 C171 117 173 150 169 177 C158 189 149 197 137 203 C126 209 114 209 103 203 C91 197 82 189 71 177Z',
  'M69 174 C65 149 70 115 84 90 C93 73 105 62 120 56 C135 62 147 73 156 90 C170 115 175 149 171 174 C161 185 150 194 137 201 C126 208 114 208 103 201 C90 194 79 185 69 174Z',
  'M72 175 C68 150 70 114 84 87 C94 69 105 60 120 55 C135 60 146 69 156 87 C170 114 172 150 168 175 C158 187 149 195 136 202 C126 208 114 208 104 202 C91 195 82 187 72 175Z',
  'M68 176 C64 149 68 112 84 87 C94 70 106 60 120 55 C134 60 146 70 156 87 C172 112 176 149 172 176 C160 188 149 196 136 203 C126 209 114 209 104 203 C91 196 80 188 68 176Z',
] as const

const EYE_LEFT = [
  'M90 116 Q99 110 109 116 Q100 123 90 119Z',
  'M90 116 Q100 113 109 116 Q100 121 91 119Z',
  'M89 116 Q100 108 110 116 Q100 125 90 120Z',
  'M90 118 Q99 112 109 118 Q100 123 91 121Z',
  'M91 117 Q100 114 108 117 Q100 120 92 118Z',
] as const

const FACE_MARKS = [
  <><path d="M102 145 Q120 153 138 145" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".4"/><path d="M110 157 Q120 162 130 157" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".32"/></>,
  <><path d="M97 144 Q109 152 120 151 Q131 152 143 144" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".38"/><path d="M114 157 H126" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".3"/></>,
  <><path d="M99 146 Q109 150 120 149 Q131 150 141 146" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".36"/><path d="M106 160 Q120 166 134 160" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".24"/></>,
  <><path d="M101 144 Q120 150 139 144" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".35"/><path d="M109 160 Q120 163 131 160" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".3"/></>,
  <><path d="M100 145 Q120 154 140 145" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".35"/><path d="M113 158 Q120 160 127 158" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".28"/></>,
] as const

const SHOULDER_SHAPES = [
  { left:'M37 244 C45 219 60 203 84 194 C94 204 102 219 107 243 Z', right:'M203 244 C195 219 180 203 156 194 C146 204 138 219 133 243 Z' },
  { left:'M35 245 C47 214 65 201 86 195 C95 208 102 223 105 244 Z', right:'M205 245 C193 214 175 201 154 195 C145 208 138 223 135 244 Z' },
  { left:'M37 247 C43 219 61 206 83 196 C96 210 103 223 109 247 Z', right:'M203 247 C197 219 179 206 157 196 C144 210 137 223 131 247 Z' },
  { left:'M34 246 C47 219 61 205 84 196 C94 208 100 224 103 246 Z', right:'M206 246 C193 219 179 205 156 196 C146 208 140 224 137 246 Z' },
  { left:'M38 245 C45 220 61 204 82 195 C96 208 102 222 107 245 Z', right:'M202 245 C195 220 179 204 158 195 C144 208 138 222 133 245 Z' },
  { left:'M36 246 C46 216 64 203 84 194 C95 206 102 221 106 246 Z', right:'M204 246 C194 216 176 203 156 194 C145 206 138 221 134 246 Z' },
  { left:'M35 247 C44 220 61 205 84 195 C97 208 104 223 108 247 Z', right:'M205 247 C196 220 179 205 156 195 C143 208 136 223 132 247 Z' },
] as const

function HeadAccessory({ kind, accent, glow }: { kind: number; accent: string; glow: string }) {
  switch (kind) {
    case 0: // soft crest band
      return <g fill="none" stroke={accent} strokeLinecap="round"><path d="M87 76 Q120 60 153 76" strokeWidth="3.2"/><path d="M95 73 Q120 64 145 73" stroke={glow} strokeWidth="1.4" opacity=".8"/></g>
    case 1: // star circlet
      return <g fill="none" stroke={accent}><path d="M83 76 Q120 57 157 76" strokeWidth="3" strokeLinecap="round"/><path d="M120 57 L124 64 L132 65 L126 70 L128 78 L120 73 L112 78 L114 70 L108 65 L116 64 Z" fill={glow} strokeWidth="1.2"/></g>
    case 2: // moon halo
      return <g fill="none" stroke={accent}><path d="M84 78 Q120 56 156 78" strokeWidth="2.9" strokeLinecap="round"/><path d="M144 55 A8 8 0 1 1 135 64 A6 6 0 1 0 144 55Z" fill={glow} stroke="none"/></g>
    case 3: // laurel tips
      return <g fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round"><path d="M83 91 Q73 82 72 69"/><path d="M157 91 Q167 82 168 69"/><path d="M73 71 L79 76 M167 71 L161 76" stroke={glow} strokeWidth="1.3"/></g>
    case 4: // side ribbon folds
      return <g fill="none" stroke={accent} strokeWidth="2.8" strokeLinecap="round"><path d="M80 90 Q67 82 61 68"/><path d="M160 90 Q173 82 179 68"/><path d="M80 90 Q70 94 65 104"/><path d="M160 90 Q170 94 175 104"/></g>
    case 5: // crown crest
      return <g fill="#1a2139" stroke={accent} strokeWidth="2.1" strokeLinejoin="round"><path d="M89 77 L98 61 L109 71 L120 55 L131 71 L142 61 L151 77 Q120 69 89 77Z"/><path d="M95 73 Q120 67 145 73" fill="none" stroke={glow} strokeWidth="1.3"/></g>
    case 6: // aurora ribbon
      return <g fill="none" strokeLinecap="round"><path d="M91 76 Q119 61 149 74" stroke={accent} strokeWidth="3.4"/><path d="M97 82 Q121 71 144 82" stroke={glow} strokeWidth="1.6" opacity=".85"/></g>
    case 7: // speed band
      return <g fill="none" strokeLinecap="round"><path d="M84 81 Q120 62 156 81" stroke={accent} strokeWidth="3"/><path d="M153 79 L165 72 M87 79 L75 72" stroke={glow} strokeWidth="1.5"/></g>
    case 8: // comms band
      return <g fill="none" strokeLinecap="round" stroke={accent} strokeWidth="2.8"><path d="M84 77 Q120 58 156 77"/><path d="M78 118 Q74 95 84 78"/><path d="M162 78 Q170 92 166 118"/><circle cx="75" cy="122" r="5" fill="#11172b" stroke={accent}/><circle cx="165" cy="122" r="5" fill="#11172b" stroke={accent}/><circle cx="166" cy="122" r="2" fill={glow} stroke="none"/></g>
    case 9: // ember pin
      return <g fill="none"><path d="M120 60 C127 67 127 76 120 80 C114 76 114 67 120 60Z" fill={glow} opacity=".95"/><path d="M102 75 Q120 67 138 75" stroke={accent} strokeWidth="2.6" strokeLinecap="round"/></g>
    default: // orbit jewel
      return <g fill="none" stroke={accent} strokeLinecap="round"><path d="M86 77 Q120 58 154 77" strokeWidth="2.8"/><path d="M138 56 Q151 60 157 72" strokeWidth="1.8" opacity=".85"/><circle cx="154" cy="69" r="4" fill={glow} stroke="none"/></g>
  }
}

function DivisionMark({ division, color }: { division: RivalProfile['division']; color: string }) {
  switch (division) {
    case 'Legend':
      return <path d="M108 208 L114 201 L120 206 L126 201 L132 208" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    case 'Master':
      return <path d="M112 201 Q120 194 128 201 Q120 208 112 201Z" fill="none" stroke={color} strokeWidth="2"/>
    case 'Expert':
      return <path d="M117 198 L123 198 L119 205 L125 205 L116 214 L119 208 L113 208Z" fill={color}/>
    case 'Challenger':
      return <path d="M108 205 Q120 194 132 205" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round"/>
    case 'Rising':
      return <circle cx="120" cy="204" r="4" fill={color}/>
  }
}

function SparkField({ clipId, large, glow }: { clipId: string; large: boolean; glow: string }) {
  const stars = [
    [101, 95, 1.5], [115, 88, 1.1], [133, 98, 1.4], [144, 112, 1.2], [96, 124, 1.1], [126, 132, 1.3], [108, 145, 1.2], [139, 149, 1.1],
    [103, 176, 1.2], [117, 186, 1.1], [132, 181, 1.3], [145, 194, 1.1],
  ]
  return (
    <g clipPath={`url(#${clipId})`} opacity={large ? .9 : .65}>
      {stars.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#ffffff" opacity={0.75} />)}
      <path d="M96 109 l2 0 m-1 -1 l0 2" stroke={glow} strokeWidth="0.9" opacity=".8" />
      <path d="M144 142 l2 0 m-1 -1 l0 2" stroke={glow} strokeWidth="0.9" opacity=".78" />
      {large && <><path d="M111 170 l3 0 m-1.5 -1.5 l0 3" stroke={glow} strokeWidth="1" opacity=".85" /><path d="M132 104 l3 0 m-1.5 -1.5 l0 3" stroke={glow} strokeWidth="1" opacity=".72" /></>}
    </g>
  )
}

export default function RivalAvatar({ rival, large = false }: { rival: RivalProfile; large?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const id = (key: string) => `${uid}-${key}`
  const art = getRivalArtDNA(rival)
  const accent = rival.accent
  const glow = rival.glow
  const leftEye = EYE_LEFT[art.eyes]
  const rightEyeTransform = 'translate(240 0) scale(-1 1)'
  const shoulders = SHOULDER_SHAPES[art.armor]

  return (
    <svg className={`rival-emblem rival-code-avatar ${large ? 'rival-emblem-large rival-code-avatar-large' : ''}`} viewBox="0 0 240 266" role="img" aria-label={`${rival.name}, ${rival.title}: Cube Hero ${rival.division} rival portrait`} strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={id('bgGlow')} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={accent} stopOpacity=".32" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('hoodLine')} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2d9a2" stopOpacity=".95" />
          <stop offset=".38" stopColor={accent} />
          <stop offset="1" stopColor={glow} />
        </linearGradient>
        <linearGradient id={id('robe')} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={accent} stopOpacity=".88" />
          <stop offset=".5" stopColor={glow} stopOpacity=".76" />
          <stop offset="1" stopColor="#162040" stopOpacity=".98" />
        </linearGradient>
        <linearGradient id={id('innerRobe')} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#18274d" />
          <stop offset="1" stopColor="#0d1428" />
        </linearGradient>
        <radialGradient id={id('halo')}>
          <stop stopColor={accent} stopOpacity=".35" />
          <stop offset=".58" stopColor={glow} stopOpacity=".1" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('faceGlow')} cx="50%" cy="38%" r="65%">
          <stop stopColor="#0f1732" />
          <stop offset=".8" stopColor="#080d1b" />
          <stop offset="1" stopColor="#060914" />
        </radialGradient>
        <linearGradient id={id('eyeFill')} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#fff4b0" />
          <stop offset=".55" stopColor={accent} />
          <stop offset="1" stopColor={glow} />
        </linearGradient>
        <clipPath id={id('faceClip')}>
          <path d="M84 92 Q95 76 120 74 Q145 76 156 92 Q164 105 164 126 Q164 156 149 172 Q136 186 120 188 Q104 186 91 172 Q76 156 76 126 Q76 105 84 92Z" />
        </clipPath>
      </defs>

      <g className="rival-vector-aura" aria-hidden="true">
        <circle cx="120" cy="122" r={large ? 96 : 88} fill={`url(#${id('halo')})`} />
        <circle className="rival-vector-orbit" cx="120" cy="121" r={large ? 84 : 77} fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity=".28" strokeDasharray={art.energy % 2 ? '0 9 22 7' : '46 18'} />
        <path d="M61 96 Q79 68 111 59" fill="none" stroke={accent} strokeWidth="2" strokeOpacity=".35" />
        <path d="M177 96 Q160 68 129 59" fill="none" stroke={accent} strokeWidth="2" strokeOpacity=".25" />
        <circle cx="55" cy="120" r="3" fill={accent} opacity=".42" />
        <circle cx="184" cy="113" r="2.5" fill={glow} opacity=".58" />
        {large && <><circle cx="70" cy="80" r="2.2" fill={glow} opacity=".72" /><circle cx="172" cy="156" r="1.9" fill={accent} opacity=".66" /></>}
      </g>

      <ellipse cx="120" cy="249" rx="88" ry="8" fill="#050915" opacity=".42" />
      <path d="M36 246 C47 216 63 202 86 194 C97 205 104 220 108 246 Z" fill={`url(#${id('robe')})`} opacity=".96" />
      <path d="M204 246 C193 216 177 202 154 194 C143 205 136 220 132 246 Z" fill={`url(#${id('robe')})`} opacity=".96" />
      <path d={shoulders.left} fill={`url(#${id('robe')})`} opacity=".88" />
      <path d={shoulders.right} fill={`url(#${id('robe')})`} opacity=".88" />
      <path d="M78 193 Q99 210 120 220 Q141 210 162 193 Q150 222 136 246 H104 Q90 222 78 193Z" fill={`url(#${id('innerRobe')})`} opacity=".98" />
      <path d="M83 193 Q101 207 120 216 Q139 207 157 193" fill="none" stroke={accent} strokeOpacity=".38" strokeWidth="1.8" />
      <path d="M103 192 Q120 205 137 192" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1.1" />
      <DivisionMark division={rival.division} color={accent} />

      <path d={HOOD_SHAPES[art.silhouette]} fill="#11172e" stroke={`url(#${id('hoodLine')})`} strokeWidth="3.4" />
      <path d="M82 83 Q97 66 120 64 Q143 66 158 83 Q168 95 171 115 Q167 157 145 182 Q132 196 120 201 Q108 196 95 182 Q73 157 69 115 Q72 95 82 83Z" fill="#0f1630" opacity=".28" />
      <path d="M84 92 Q95 76 120 74 Q145 76 156 92 Q164 105 164 126 Q164 156 149 172 Q136 186 120 188 Q104 186 91 172 Q76 156 76 126 Q76 105 84 92Z" fill={`url(#${id('faceGlow')})`} />
      <SparkField clipId={id('faceClip')} large={large} glow={glow} />
      <path d="M84 92 Q95 76 120 74 Q145 76 156 92" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="3" />
      <path d="M84 92 Q95 76 120 74 Q145 76 156 92 Q164 105 164 126 Q164 156 149 172 Q136 186 120 188 Q104 186 91 172 Q76 156 76 126 Q76 105 84 92Z" fill="none" stroke={accent} strokeOpacity=".18" strokeWidth="1.2" />

      <HeadAccessory kind={art.accessory} accent={accent} glow={glow} />

      <g className="rival-vector-eyes">
        <path d={leftEye} fill={`url(#${id('eyeFill')})`} stroke="none" />
        <path d={leftEye} transform={rightEyeTransform} fill={`url(#${id('eyeFill')})`} stroke="none" />
        <path d="M98 104 Q100 100 104 99" fill="none" stroke="#fff7c9" strokeWidth="1.1" strokeOpacity=".7" />
        <path d="M142 99 Q146 100 148 104" fill="none" stroke="#fff7c9" strokeWidth="1.1" strokeOpacity=".7" />
      </g>

      <path d="M106 141 Q120 151 134 141" fill="none" stroke={glow} strokeWidth="1.7" strokeOpacity=".85" />
      <path d="M110 156 Q120 163 130 156" fill="none" stroke={glow} strokeWidth="1.6" strokeOpacity=".7" />
      <g style={{ color: accent }}>{FACE_MARKS[art.mask]}</g>

      <path d="M95 182 Q108 193 120 197 Q132 193 145 182" fill="none" stroke={accent} strokeWidth="2.3" strokeOpacity=".55" />
      <path d="M106 190 Q120 202 134 190" fill="none" stroke={glow} strokeWidth="1.4" strokeOpacity=".62" />
      <path d="M116 198 L120 203 L124 198" fill="none" stroke={glow} strokeWidth="1.4" strokeOpacity=".72" />

      {large && (
        <g className="rival-vector-fine-detail" fill="none" stroke={accent} strokeOpacity=".22" strokeWidth="1.2">
          <path d="M31 228 Q54 205 80 198" />
          <path d="M209 228 Q186 205 160 198" />
          <path d="M54 171 Q59 188 70 198" />
          <path d="M186 171 Q181 188 170 198" />
        </g>
      )}
    </svg>
  )
}
