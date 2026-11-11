import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isValidPlayerName, loadPlayerName, normalizePlayerName, persistPlayerName, PLAYER_NAME_STORAGE_KEY } from '../lib/localPlayer'
import PlayerWelcome from './PlayerWelcome'
import { PLAYER_AVATAR_STORAGE_KEY, PLAYER_AVATAR_PRESET_STORAGE_KEY, isPlayerAvatarPresetId, loadPlayerAvatar, loadPlayerAvatarPreset, persistPlayerAvatar, persistPlayerAvatarPreset, removePlayerAvatar, removePlayerAvatarPreset } from '../lib/localPlayerAvatar'
import { getPlayerAvatarPreset } from '../lib/playerAvatarPresets'

type PlayerIdentity = {
  name: string
  /** Returns true when the name passed validation; doesn't change race progress. */
  setName: (value: string) => boolean
  /** The image currently displayed everywhere in CubeHero; null means original mascot. */
  avatarUrl: string | null
  uploadedAvatarUrl: string | null
  avatarPresetId: string | null
  avatarKind: 'default' | 'preset' | 'upload'
  setAvatar: (dataUrl: string) => boolean
  selectPresetAvatar: (id: string) => boolean
  useUploadedAvatar: () => boolean
  deleteUploadedAvatar: () => boolean
  clearAvatar: () => boolean
}

const LocalPlayerContext = createContext<PlayerIdentity | null>(null)

export function useLocalPlayer(): PlayerIdentity {
  const value = useContext(LocalPlayerContext)
  if (!value) throw new Error('useLocalPlayer must be used inside LocalPlayerProvider')
  return value
}

export default function LocalPlayerProvider({children}: {children: ReactNode}) {
  const [name, setNameState] = useState(loadPlayerName)
  const [uploadedAvatarUrl, setUploadedAvatarState] = useState(loadPlayerAvatar)
  const [avatarPresetId, setAvatarPresetState] = useState(loadPlayerAvatarPreset)
  const avatarKind: PlayerIdentity['avatarKind'] = avatarPresetId === 'default'
    ? 'default' : avatarPresetId ? 'preset' : uploadedAvatarUrl ? 'upload' : 'default'
  const avatarUrl = avatarKind === 'preset' ? getPlayerAvatarPreset(avatarPresetId!)?.src ?? null
    : avatarKind === 'upload' ? uploadedAvatarUrl : null
  const setName = useCallback((value: string) => {
    const normalized = normalizePlayerName(value)
    if (!isValidPlayerName(normalized)) return false
    persistPlayerName(normalized)
    setNameState(normalized)
    return true
  }, [])

  const setAvatar = useCallback((dataUrl: string) => {
    if (!persistPlayerAvatar(dataUrl) || !removePlayerAvatarPreset()) return false
    setUploadedAvatarState(dataUrl)
    setAvatarPresetState(null)
    return true
  }, [])
  const selectPresetAvatar = useCallback((id: string) => {
    if (!isPlayerAvatarPresetId(id) || !persistPlayerAvatarPreset(id)) return false
    setAvatarPresetState(id)
    return true
  }, [])
  const useUploadedAvatar = useCallback(() => {
    if (!uploadedAvatarUrl || !removePlayerAvatarPreset()) return false
    setAvatarPresetState(null)
    return true
  }, [uploadedAvatarUrl])
  const deleteUploadedAvatar = useCallback(() => {
    if (!removePlayerAvatar()) return false
    setUploadedAvatarState(null)
    return true
  }, [])
  const clearAvatar = useCallback(() => {
    if (!removePlayerAvatarPreset() || !removePlayerAvatar()) return false
    setAvatarPresetState(null)
    setUploadedAvatarState(null)
    return true
  }, [])

  useEffect(() => {
    // Keep separate tabs in sync. A cleared browser profile asks for a name again,
    // without touching locally saved XP, records, settings, or ghost data.
    const onStorage = (event: StorageEvent) => {
      if (event.key === PLAYER_NAME_STORAGE_KEY || event.key === null) setNameState(loadPlayerName())
      if (event.key === PLAYER_AVATAR_STORAGE_KEY || event.key === null) setUploadedAvatarState(loadPlayerAvatar())
      if (event.key === PLAYER_AVATAR_PRESET_STORAGE_KEY || event.key === null) setAvatarPresetState(loadPlayerAvatarPreset())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => ({
    name, setName, avatarUrl, uploadedAvatarUrl, avatarPresetId, avatarKind,
    setAvatar, selectPresetAvatar, useUploadedAvatar, deleteUploadedAvatar, clearAvatar,
  }), [name, setName, avatarUrl, uploadedAvatarUrl, avatarPresetId, avatarKind,
    setAvatar, selectPresetAvatar, useUploadedAvatar, deleteUploadedAvatar, clearAvatar])
  return (
    <LocalPlayerContext.Provider value={value}>
      {name ? children : <PlayerWelcome onCreate={setName} />}
    </LocalPlayerContext.Provider>
  )
}
