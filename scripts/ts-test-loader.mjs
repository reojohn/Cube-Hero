/** Compile the local pure TypeScript modules to a temporary ESM tree for Node tests. */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
const ROOT = 'src/lib'
const NAMES = ['cubeMoves', 'cubeState', 'cubeTurning', 'mobileCubeTurn', 'mobileCubeFrames', 'graphicsQuality', 'cfop', 'racing', 'aiPlan', 'ghost', 'rivals']
export function loadTestModules() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cubehero-modules-'))
  for (const name of NAMES) {
    let code = ts.transpileModule(fs.readFileSync(`${ROOT}/${name}.ts`, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText
    code = code.replace(/from ['"]\.\/([^'".]+)['"]/g, (_,module) => `from './${module}.mjs'`)
    fs.writeFileSync(path.join(directory, `${name}.mjs`), code)
  }
  process.on('exit', () => fs.rmSync(directory, { recursive: true, force: true }))
  return async name => import(pathToFileURL(path.join(directory, `${name}.mjs`)).href)
}
