import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, Check, ImagePlus, RotateCcw, Trash2 } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar'
import AvatarCropDialog from './AvatarCropDialog'
import { useLocalPlayer } from './LocalPlayerProvider'
import { PLAYER_AVATAR_MAX_FILE_BYTES } from '../lib/localPlayerAvatar'
import { DEFAULT_PLAYER_AVATAR, PLAYER_AVATAR_PRESETS } from '../lib/playerAvatarPresets'
import './AvatarSettings.css'

/** Built-in portraits are simple image choices, not uploads; no heavy artwork enters localStorage. */
export default function AvatarSettings() {
  const {
    avatarKind, avatarPresetId, uploadedAvatarUrl,
    setAvatar, selectPresetAvatar, useUploadedAvatar, deleteUploadedAvatar,
  } = useLocalPlayer()
  const fileInput = useRef<HTMLInputElement>(null)
  const [chosenFile, setChosenFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState('')

  const changeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = '' // selecting the same file twice should work
    if (!file) return
    if (file.size > PLAYER_AVATAR_MAX_FILE_BYTES) { setFeedback('Choose an image smaller than 10 MB.'); return }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { setFeedback('Use a JPG, PNG, WebP, or GIF image.'); return }
    setFeedback('')
    setChosenFile(file)
  }
  const choose = (id: string) => {
    if (selectPresetAvatar(id)) {
      const preset = id === 'default' ? DEFAULT_PLAYER_AVATAR : PLAYER_AVATAR_PRESETS.find(item => item.id === id)
      setFeedback(`${preset?.name ?? 'Avatar'} selected. Your picture is saved on this device.`)
    } else setFeedback('Could not save your selection. Check your browser storage.')
  }
  const restorePhoto = () => {
    setFeedback(useUploadedAvatar() ? 'Your previously uploaded photo is active again.' : 'Could not restore your saved photo.')
  }
  const removeSavedPhoto = () => {
    setFeedback(deleteUploadedAvatar() ? 'Your saved uploaded photo was removed from this device.' : 'Could not remove the saved picture.')
  }
  const save = (value: string) => {
    const saved = setAvatar(value)
    if (saved) setFeedback('Your cropped photo is now your active avatar.')
    return saved
  }
  const selectionLabel = avatarKind === 'upload' ? 'Your uploaded photo is active'
    : avatarKind === 'preset' ? `${PLAYER_AVATAR_PRESETS.find(item => item.id === avatarPresetId)?.name ?? 'Hero avatar'} selected`
    : 'Original CubeHero hero selected'

  return <div className="cube-avatar-settings">
    <div className="cube-avatar-settings-preview">
      <PlayerAvatar className="cube-avatar-settings-image" decorative/>
      <div><strong>Your profile picture</strong><p>{selectionLabel}</p><small>Visible in your races, VS intros, results, and Hero Journey</small></div>
    </div>

    <div className="cube-avatar-picker-head">
      <div><strong>Choose your Hero</strong><p>Select a character below. Changes save instantly.</p></div>
      <span>10 UNIQUE AVATARS</span>
    </div>
    <div className="cube-avatar-picker-grid" role="group" aria-label="Choose your CubeHero avatar">
      {[DEFAULT_PLAYER_AVATAR, ...PLAYER_AVATAR_PRESETS].map(preset => {
        const selected = preset.id === 'default' ? avatarKind === 'default' : avatarKind === 'preset' && avatarPresetId === preset.id
        return <button
          key={preset.id} type="button" className={`cube-avatar-picker-card${selected ? ' is-selected' : ''}`}
          onClick={() => choose(preset.id)} aria-pressed={selected}
          aria-label={`Select ${preset.name}${selected ? ', currently selected' : ''}`}
          title={preset.name}
        >
          <span className="cube-avatar-picker-photo"><img src={preset.thumb} alt="" width={160} height={160} loading="lazy" decoding="async"/>{selected && <span className="cube-avatar-picker-check" aria-hidden="true"><Check size={13}/></span>}</span>
          <span className="cube-avatar-picker-title">{preset.name}</span>
          <span className="cube-avatar-picker-detail">{preset.detail}</span>
        </button>
      })}
      {uploadedAvatarUrl && <button type="button"
        className={`cube-avatar-picker-card cube-avatar-picker-uploaded${avatarKind === 'upload' ? ' is-selected' : ''}`}
        onClick={restorePhoto} aria-pressed={avatarKind === 'upload'}
        aria-label={`Select your saved uploaded photo${avatarKind === 'upload' ? ', currently selected' : ''}`}>
        <span className="cube-avatar-picker-photo"><img src={uploadedAvatarUrl} alt="" width={160} height={160} loading="lazy" decoding="async"/>{avatarKind === 'upload' && <span className="cube-avatar-picker-check" aria-hidden="true"><Check size={13}/></span>}</span>
        <span className="cube-avatar-picker-title">Your Photo</span><span className="cube-avatar-picker-detail">Uploaded · personal</span>
      </button>}
    </div>

    <div className="cube-avatar-settings-actions">
      <button type="button" className="btn btn-primary btn-sm" onClick={() => fileInput.current?.click()}><Camera size={16}/>{uploadedAvatarUrl ? 'Upload a new photo' : 'Upload your photo'}</button>
      {avatarKind !== 'default' && <button type="button" className="btn btn-outline btn-sm" onClick={() => choose('default')}><RotateCcw size={16}/> Original avatar</button>}
      {uploadedAvatarUrl && <button type="button" className="btn btn-outline btn-sm cube-avatar-remove-photo" onClick={removeSavedPhoto}><Trash2 size={16}/> Remove saved photo</button>}
    </div>
    <p className="cube-avatar-settings-note"><ImagePlus size={14}/> Prefer your own image? Upload and crop it 1:1 (JPG, PNG, WebP, GIF · up to 10 MB). The selected avatar and uploaded photo stay on this device.</p>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={changeFile} hidden aria-label="Choose a profile picture"/>
    {feedback && <p className="cube-avatar-settings-feedback" role="status">{feedback}</p>}
    {chosenFile && <AvatarCropDialog file={chosenFile} onSave={save} onClose={() => setChosenFile(null)}/>}
  </div>
}
