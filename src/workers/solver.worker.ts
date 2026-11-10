/** Genuine CFOP solving only. All search and stage verification stay off the UI thread. */
import { cfop } from '@moishy/cfop'
import { formatAlg } from '@moishy/cubing-core'
import { assembleCfopStages } from '../lib/cfop'
import type { CfopSolution } from '../lib/cfop'

type SolveMessage = { id: number; scramble: string }
type SolveReply = { id: number; result?: CfopSolution; error?: string }

self.onmessage = async (event: MessageEvent<SolveMessage>) => {
  const { id, scramble } = event.data
  try {
    // No two-phase fallback. If CFOP search fails the user sees Retry / New Scramble.
    // Fixed cross orientation avoids silently pre-rotating the user's physical cube.
    const res = await cfop.solve(scramble, { colorNeutrality: 'fixed' }, { timeBudgetMs: 30_000 })
    if (!res.solved) throw new Error('CFOP search ran out of time. Try Retry or New Scramble.')
    const result = assembleCfopStages(scramble,res.segments.map(segment => ({
      unitId: segment.unitId,
      moves: formatAlg(segment.moves).trim(),
    })))
    const answer: SolveReply = { id, result }
    self.postMessage(answer)
  } catch (error) {
    const answer: SolveReply = {
      id,
      error: error instanceof Error ? error.message : 'Could not verify a CFOP solution.',
    }
    self.postMessage(answer)
  }
}
