import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { isValidPlayerName, loadPlayerName, normalizePlayerName, persistPlayerName, PLAYER_NAME_STORAGE_KEY } from '../lib/localPlayer'
import PlayerWelcome from './PlayerWelcome'

type PlayerIdentity = {
  name: string
  /** Returns true when the name passed validation; doesn't change race progress. */
  setName: (value: string) => boolean
}

const LocalPlayerContext = createContext<PlayerIdentity | null>(null)

export function useLocalPlayer(): PlayerIdentity {
  const value = useContext(LocalPlayerContext)
  if (!value) throw new Error('useLocalPlayer must be used inside LocalPlayerProvider')
  return value
}

export default function LocalPlayerProvider({children}: {children: ReactNode}) {
  const [name, setNameState] = useState(loadPlayerName)
  const setName = useCallback((value: string) => {
    const normalized = normalizePlayerName(value)
    if (!isValidPlayerName(normalized)) return false
    persistPlayerName(normalized)
    setNameState(normalized)
    return true
  }, [])

  useEffect(() => {
    // Keep separate tabs in sync. A cleared browser profile asks for a name again,
    // without touching locally saved XP, records, settings, or ghost data.
    const onStorage = (event: StorageEvent) => {
      if (event.key === PLAYER_NAME_STORAGE_KEY || event.key === null) setNameState(loadPlayerName())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => ({name, setName}), [name, setName])
  return (
    <LocalPlayerContext.Provider value={value}>
      {name ? children : <PlayerWelcome onCreate={setName} />}
    </LocalPlayerContext.Provider>
  )
}
