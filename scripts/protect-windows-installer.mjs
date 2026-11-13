/** Keep the >100 MB Windows Setup OUT of Git and Vercel uploads. */
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

async function ensureLine(file, line) {
  let current = ''
  try { current = await readFile(file, 'utf8') }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  const rows = current.split(/\r?\n/).map(row => row.trim())
  if (!rows.includes(line)) {
    await writeFile(file, current + (current && !current.endsWith('\n') ? '\n' : '') + line + '\n')
    console.log(`Updated ${file}`)
  } else console.log(`${file} already excludes the Windows installer`)
}
await ensureLine('.gitignore', '/release-downloads/*.exe')
await ensureLine('.vercelignore', 'release-downloads/*.exe')
try {
  const tracked = execFileSync('git', ['ls-files', '--', 'release-downloads/CubeHero-v1.0.0-Windows-Setup.exe'], { encoding: 'utf8' }).trim()
  if (tracked) {
    console.log('\nCAUTION: The Windows EXE is already tracked by Git.')
    console.log('Run: git rm --cached -- release-downloads/CubeHero-v1.0.0-Windows-Setup.exe')
    console.log('This stops tracking it without deleting your local installer.')
  }
} catch { console.log('No Git tracking status available. Please check before pushing.') }
