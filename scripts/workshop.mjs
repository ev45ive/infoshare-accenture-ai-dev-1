import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { parse } from 'dotenv'
import Database from 'better-sqlite3'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const action = process.argv[2]
const envFile = resolve(root, '.env')
const lockFile = resolve(root, '.workshop/server.json')

function ensureStopped() {
  if (!existsSync(lockFile)) return
  const { pid } = JSON.parse(readFileSync(lockFile, 'utf8'))
  try { process.kill(pid, 0) } catch { return }
  throw new Error('Najpierw zatrzymaj serwer tego workspace. Reset i zmiana mocka wymagają zatrzymania.')
}

if (!['setup', 'reset', 'mode', 'integration'].includes(action)) throw new Error('Akcje: setup, reset, mode, integration.')
ensureStopped()
mkdirSync(resolve(root, '.workshop'), { recursive: true })
if (!existsSync(envFile)) {
  if (action !== 'setup') throw new Error('Najpierw npm run workshop:setup.')
  writeFileSync(envFile, `DATABASE_URL="file:./workshop.db"\nWORKSHOP_MODE="true"\nSESSION_SECRET="${randomBytes(32).toString('hex')}"\nPAYMENT_MOCK_MODE="normal"\nPAYMENT_TIMEOUT_MS="250"\n`, { flag: 'wx' })
}
const config = parse(readFileSync(envFile))
if (config.DATABASE_URL !== 'file:./workshop.db' || config.WORKSHOP_MODE !== 'true' || !config.SESSION_SECRET || config.SESSION_SECRET.length < 32) {
  throw new Error('Nieprawidłowa konfiguracja lokalnego workspace. Skrypt obsługuje tylko własny workshop.db.')
}
if (action === 'mode') {
  const mode = process.argv[3]
  if (!['normal', 'always_fail', 'always_timeout'].includes(mode)) throw new Error('Nieprawidłowy tryb mocka.')
  const text = readFileSync(envFile, 'utf8').replace(/^PAYMENT_MOCK_MODE=.*$/m, `PAYMENT_MOCK_MODE="${mode}"`)
  writeFileSync(envFile, text)
  console.log(`Mock płatności: ${mode}. Uruchom ponownie serwer.`)
  process.exit(0)
}

const filename = action === 'integration' ? resolve(root, '.workshop/integration.db') : resolve(root, 'workshop.db')
const databaseExisted = existsSync(filename)
if (!databaseExisted) new Database(filename).close()
const env = { ...process.env, ...config, DATABASE_URL: action === 'integration' ? 'file:./.workshop/integration.db' : 'file:./workshop.db' }
function run(relativeScript, args) {
  const result = spawnSync(process.execPath, [resolve(root, relativeScript), ...args], { cwd: root, env, stdio: 'inherit', windowsHide: true })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
if (action === 'reset') {
  env.SESSION_SECRET = randomBytes(32).toString('hex')
  writeFileSync(envFile, readFileSync(envFile, 'utf8')
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET="${env.SESSION_SECRET}"`)
    .replace(/^PAYMENT_MOCK_MODE=.*$/m, 'PAYMENT_MOCK_MODE="normal"')
    .replace(/^PAYMENT_TIMEOUT_MS=.*$/m, 'PAYMENT_TIMEOUT_MS="250"'))
}
run('node_modules/prisma/build/index.js', ['generate'])
run('node_modules/prisma/build/index.js', ['db', 'push'])
if (action !== 'setup' || !databaseExisted) run('node_modules/tsx/dist/cli.mjs', ['prisma/seed.ts'])
if (action === 'integration') {
  run('node_modules/tsx/dist/cli.mjs', ['--test', 'tests/integration/catalog.test.ts'])
} else {
  if (existsSync(lockFile)) unlinkSync(lockFile)
  console.log('Baza gotowa. Uruchom npm run dev, następnie otwórz /workshop/reset w używanej przeglądarce.')
}
