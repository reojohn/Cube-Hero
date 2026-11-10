/** Minimal public integration contracts. Actual code/types come from npm at install. */
declare module '@moishy/cfop' {
  export const cfop: {
    solve(scramble: string, settings?: { colorNeutrality?: 'fixed' | string }, options?: { timeBudgetMs?: number }): Promise<{
      solved: boolean
      solutionString: string
      segments: Array<{ unitId: string; moves: unknown[] }>
    }>
  }
}
declare module '@moishy/cubing-core' {
  export function formatAlg(moves: unknown[]): string
}
