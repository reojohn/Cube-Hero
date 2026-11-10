/** Cube Hero training preference, not a WCA-mandated exact hold duration. */
export const ARM_DELAY_MS = 1500

/** A hold starts the timer only if released at or beyond the arming threshold. */
export function isValidStartRelease(startedAt:number, releasedAt:number):boolean {
  return Number.isFinite(startedAt) && Number.isFinite(releasedAt) && releasedAt-startedAt>=ARM_DELAY_MS
}

export function armProgressPercent(startedAt:number|null, now:number):number {
  if(startedAt===null || !Number.isFinite(now))return 0
  return Math.max(0,Math.min(100,((now-startedAt)/ARM_DELAY_MS)*100))
}
