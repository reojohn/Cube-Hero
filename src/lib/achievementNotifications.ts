import type { Achievement, JourneyState } from './heroJourney'
import { achievements } from './heroJourney'

/** Stable IDs of achievements already earned. Seed this from persisted progress so
 * upgrading CubeHero never announces a user's historical awards on launch.
 */
export function earnedAchievementIds(state: JourneyState): Set<string> {
  return new Set(achievements(state).filter(item => item.unlocked).map(item => item.id))
}

/** Detect only the locked -> unlocked transition. Keep IDs unchanged so
 * repeat renders, history syncs and page navigation cannot replay an award.
 */
export function newAchievementUnlocks(previous: ReadonlySet<string>, current: readonly Achievement[]): Achievement[] {
  return current.filter(item => item.unlocked && !previous.has(item.id))
}
