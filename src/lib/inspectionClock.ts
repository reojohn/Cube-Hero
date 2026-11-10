/**
 * Elapsed inspection time in milliseconds, excluding intervals spent holding
 * the Stackmat controls. An active hold pins the clock to the hold-start time.
 *
 * This is Cube Hero's training behavior, not a claim about a WCA-required
 * 1.5-second timer-arming delay.
 */
export function inspectionElapsedMs(
  inspectionStartedAt:number|null,
  now:number,
  pausedTotalMs:number,
  activeHoldStartedAt:number|null,
):number {
  if(inspectionStartedAt===null)return 0
  return Math.max(0,(activeHoldStartedAt??now)-inspectionStartedAt-pausedTotalMs)
}

/** Account for an unsuccessful/canceled hold before resuming inspection. */
export function includeEndedHold(
  pausedTotalMs:number,
  activeHoldStartedAt:number|null,
  releaseAt:number,
):number {
  if(activeHoldStartedAt===null)return pausedTotalMs
  return pausedTotalMs+Math.max(0,releaseAt-activeHoldStartedAt)
}
