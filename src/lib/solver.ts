/** Shared Web Worker providing validated Cross → F2L×4 → OLL → PLL solutions. */
import { verifyCfopSolution } from './cfop'
import type { CfopSolution } from './cfop'

type SolveReply = { id: number; result?: CfopSolution; error?: string }
let worker: Worker | null = null
let nextId = 1
const awaiting = new Map<number, {
  scramble: string
  resolve: (value: CfopSolution) => void
  reject: (reason: Error) => void
}>()

function failWorker(message: string): void {
  for (const request of awaiting.values()) request.reject(new Error(message))
  awaiting.clear()
  worker?.terminate()
  worker = null
}

function getWorker(): Worker {
  if (worker) return worker
  const instance = new Worker(new URL('../workers/solver.worker.ts', import.meta.url), { type: 'module' })
  instance.onmessage = (event: MessageEvent<SolveReply>) => {
    const reply = event.data
    const request = awaiting.get(reply.id)
    if (!request) return
    awaiting.delete(reply.id)
    if (reply.error) { request.reject(new Error(reply.error)); return }
    if (!reply.result) { request.reject(new Error('CFOP solver returned no solution.')); return }
    try { request.resolve(verifyCfopSolution(request.scramble, reply.result)) }
    catch (error) { request.reject(error instanceof Error ? error : new Error('The CFOP solution was invalid.')) }
  }
  instance.onerror = () => failWorker('CFOP solver could not start. Check dependencies and restart Cube Hero.')
  instance.onmessageerror = () => failWorker('The CFOP worker returned an unreadable result.')
  worker = instance
  return instance
}

export function solveScramble(scramble: string): Promise<CfopSolution> {
  if (!/^(?:[URFDLB](?:2|')?)(?:\s+[URFDLB](?:2|')?)*$/.test(scramble)) {
    return Promise.reject(new Error('Invalid 3×3 scramble.'))
  }
  const id = nextId++
  return new Promise((resolve, reject) => {
    awaiting.set(id, { scramble, resolve, reject })
    try { getWorker().postMessage({ id, scramble }) }
    catch { awaiting.delete(id); reject(new Error('Unable to initialize the CFOP solver.')) }
  })
}
