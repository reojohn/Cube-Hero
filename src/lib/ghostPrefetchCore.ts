/**
 * Small verified-solution cache for personal Ghost Race challenges.
 *
 * Solves one future scramble ahead while the cuber is busy with the current
 * attempt. An in-flight preparation is reused, never duplicated. Every result
 * still comes from the existing verified CFOP solver.
 */
export function createGhostPrefetch<T>(
  generateScramble: () => string,
  solveVerified: (scramble: string) => Promise<T>,
  maxCached = 4,
) {
  const cache = new Map<string, T>()
  const inflight = new Map<string, Promise<T>>()
  let nextScramble: string | null = null

  function prepare(scramble: string): Promise<T> {
    const cached = cache.get(scramble)
    if (cached !== undefined) return Promise.resolve(cached)
    const existing = inflight.get(scramble)
    if (existing) return existing
    const pending = Promise.resolve()
      .then(() => solveVerified(scramble))
      .then(solution => {
        cache.set(scramble, solution)
        while (cache.size > maxCached) cache.delete(cache.keys().next().value!)
        return solution
      })
      .finally(() => { inflight.delete(scramble) })
    inflight.set(scramble, pending)
    return pending
  }

  function prewarm(): void {
    if (nextScramble !== null) return
    const future = generateScramble()
    nextScramble = future
    // Errors in speculative work are not user-facing. If a speculative solve
    // fails, release the slot; a fresh scramble can be prepared afterward.
    void prepare(future).catch(() => {
      if (nextScramble === future) nextScramble = null
    })
  }

  function seedNext(scramble: string, verifiedSolution: T): void {
    cache.set(scramble, verifiedSolution)
    nextScramble = scramble
  }

  function peekNext(): string | null { return nextScramble }

  function takeNext(): string {
    const selected = nextScramble ?? generateScramble()
    nextScramble = null
    return selected
  }

  return { prepare, prewarm, takeNext, peekNext, seedNext }
}
