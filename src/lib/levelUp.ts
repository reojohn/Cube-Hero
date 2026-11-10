import { levelInfo } from './heroJourney'

export type LevelUpMilestone = { previousLevel: number; level: number; title: string }

/**
 * One-time level advancement check. XP itself is calculated exclusively by
 * Hero Journey; this helper never awards points or edits saved progression.
 * A multi-level leap is presented as one celebration of the highest level.
 */
export function earnedLevel(previousHighestLevel: number, nextTotalXp: number): LevelUpMilestone | null {
  if (!Number.isFinite(previousHighestLevel) || !Number.isFinite(nextTotalXp) || nextTotalXp < 0) return null
  const current = levelInfo(nextTotalXp)
  return current.level > previousHighestLevel
    ? { previousLevel: previousHighestLevel, level: current.level, title: current.title }
    : null
}
