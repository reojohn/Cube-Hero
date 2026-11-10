// The cubejs package ships JavaScript without TypeScript declaration files.
declare module 'cubejs' {
  export default class Cube {
    constructor()
    static initSolver(): void
    move(algorithm: string): this
    solve(maxDepth?: number): string
    isSolved(): boolean
  }
}
