import { useState } from 'react'
import type { RivalProfile } from '../lib/rivals'
import { getRivalPortraitPngUrl, getRivalPortraitThumbnailUrl, getRivalPortraitUrl } from '../lib/rivalPortraits'
import RivalAvatar from './RivalAvatar'

/** Fast local WebP portraits; original PNG then vector fallback on failure. */
export default function RivalPortrait({ rival, large = false }: { rival: RivalProfile; large?: boolean }) {
  const webp = getRivalPortraitUrl(rival.difficulty)
  const thumb = !large ? getRivalPortraitThumbnailUrl(rival.difficulty) : undefined
  const png = getRivalPortraitPngUrl(rival.difficulty)
  const [error, setError] = useState<'thumb' | 'webp' | 'png' | null>(null)
  const source = error === null ? (thumb || webp) : error === 'thumb' ? webp : error === 'webp' ? png : undefined

  if (!source || error === 'png') return <RivalAvatar rival={rival} large={large} />

  return <>
    <span className={`rival-png-decor ${large ? 'rival-png-decor--featured' : ''}`} aria-hidden="true">
      <span className="rival-png-decor__ring" />
      <span className="rival-png-decor__spark rival-png-decor__spark--one" />
      <span className="rival-png-decor__spark rival-png-decor__spark--two" />
      <span className="rival-png-decor__spark rival-png-decor__spark--three" />
    </span>
    <img
      className={`rival-character-img rival-png-avatar ${large ? 'rival-emblem-large rival-png-avatar-large' : ''}`}
      src={source}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      loading="eager"
      fetchPriority={large ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      onError={() => setError(error === null && thumb ? 'thumb' : error === 'thumb' || (error === null && !thumb) ? 'webp' : 'png')}
    />
  </>
}
