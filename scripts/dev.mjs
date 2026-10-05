import { mkdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
config({ quiet: true, override: true })
if (process.env.WORKSHOP_MODE !== 'true' || process.env.DATABASE_URL !== 'file:./workshop.db') throw new Error('Najpierw npm run workshop:setup.')
const lock = resolve(root, '.workshop/server.json')
mkdirSync(dirname(lock), { recursive: true })
if (existsSync(lock)) {
  const { pid } = JSON.parse(readFileSync(lock, 'utf8'))
  let active = false
  try { process.kill(pid, 0); active = true } catch {}
  if (active) throw new Error('Serwer tego workspace już działa.')
}
writeFileSync(lock, JSON.stringify({ pid: process.pid, workspace: root }))
process.on('exit', () => {
  if (existsSync(lock) && JSON.parse(readFileSync(lock, 'utf8')).pid === process.pid) unlinkSync(lock)
})
process.argv = [process.execPath, 'next', 'dev', '--hostname', '127.0.0.1', '--port', '3100', ...process.argv.slice(2)]
await import('../node_modules/next/dist/bin/next')
