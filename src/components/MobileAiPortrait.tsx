import { memo, useState } from 'react'
import type { CSSProperties } from 'react'
import { BrainCircuit } from 'lucide-react'
import type { RivalProfile } from '../lib/rivals'
import { getRivalPortraitThumbnailUrl, getRivalPortraitUrl, getRivalPortraitPngUrl } from '../lib/rivalPortraits'

/** One small, static image per extra AI on phones; no 3D cube / glow animation.
 * Includes WebP → original WebP → PNG → icon fallback for offline/PWA installs.
 * memo prevents the 240ms race tick from rebuilding these image nodes.
 */
const MobileAiPortrait = memo(function MobileAiPortrait({ rival }: { rival: RivalProfile }) {
  const [fallback, setFallback] = useState(0)
  const sources = [
    getRivalPortraitThumbnailUrl(rival.difficulty),
    getRivalPortraitUrl(rival.difficulty),
    getRivalPortraitPngUrl(rival.difficulty),
  ].filter((src): src is string => Boolean(src))
  return <span
    className="multi-ai-mobile-portrait"
    style={{ '--mobile-ai-accent': rival.accent } as CSSProperties}
    role="img"
    aria-label={`${rival.name} character portrait`}
    title={rival.name}
  >
    {sources[fallback]
      ? <img
          src={sources[fallback]}
          alt=""
          aria-hidden="true"
          width={160}
          height={160}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFallback(index => index + 1)}
        />
      : <BrainCircuit size={22} aria-hidden="true" />}
  </span>
})

export default MobileAiPortrait
