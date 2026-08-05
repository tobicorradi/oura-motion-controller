import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

const root = process.cwd(); const localEnv = resolve(root, '.env.oura'); if (existsSync(localEnv)) for (const line of readFileSync(localEnv, 'utf8').split(/\r?\n/)) { const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '') }; const env = process.env; if (env.OURA_LOG_LEVEL && !env.RUST_LOG) env.RUST_LOG = env.OURA_LOG_LEVEL; const repo = env.OPEN_OURA_DIR || resolve(root, '.tools/open_oura'); const binary = resolve(repo, 'target/release/oura'); const keyFile = env.OURA_KEY_FILE; const ringName = env.OURA_RING_NAME || 'Oura'; const ringAddress = env.OURA_RING_ADDRESS; const scanTimeout = env.OURA_SCAN_TIMEOUT || '45'; const port = env.OURA_SERVER_PORT || '8088'; const minutes = env.OURA_STREAM_MINUTES || '15'
const passthroughStdio = ['ignore', 'inherit', 'inherit']
const run = (command, args, options = {}) => { const result = spawnSync(command, args, { cwd: repo, stdio: passthroughStdio, env, ...options }); if (result.error) { console.error(`Could not run ${command}: ${result.error.message}`); return 1 } return result.status ?? 1 }
const requireBinary = () => { if (!existsSync(binary)) { console.error('open_oura is not built. Run: pnpm oura:setup'); process.exit(1) } }
const withKey = args => { if (!keyFile) { console.error('Set OURA_KEY_FILE to a secure local 16-byte key-file path in .env.oura.'); process.exit(1) } return ['--name', ringName, '--scan-timeout', scanTimeout, ...(ringAddress ? ['--address', ringAddress] : []), '--key-file', keyFile, ...args] }
const statusFile = resolve(root, 'public/oura-status.json')
const captureBattery = () => {
  const checkedAt = new Date().toISOString()
  const result = spawnSync(binary, withKey(['info']), { cwd: repo, encoding: 'utf8', env })
  const output = `${result.stdout || ''}\n${result.stderr || ''}`
  const match = output.match(/Battery\s*:\s*(\d{1,3})\s*%/i)
  const battery = match ? Math.max(0, Math.min(100, Number(match[1]))) : null
  mkdirSync(resolve(root, 'public'), { recursive: true })
  writeFileSync(statusFile, JSON.stringify({ battery, checkedAt }))
  if (battery !== null) console.log(`Oura battery: ${battery}%`)
  else console.warn('Could not read Oura battery. Live motion will still start normally.')
}
const vitePort = env.VITE_PORT || '5173'
const listPids = args => {
  const result = spawnSync('lsof', args, { encoding: 'utf8', env })
  if (result.error) {
    console.error(`Could not inspect processes with lsof: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status && result.status !== 1) {
    console.error(result.stderr?.trim() || 'Could not inspect running processes.')
    process.exit(result.status)
  }
  return Array.from(new Set((result.stdout || '').split(/\s+/).map(value => value.trim()).filter(Boolean)))
}
const findProjectPids = () => {
  const result = spawnSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8', env })
  if (result.error) {
    console.error(`Could not inspect process table: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status) {
    console.error(result.stderr?.trim() || 'Could not inspect process table.')
    process.exit(result.status)
  }
  return (result.stdout || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^(\d+)\s+(.*)$/)
      return match ? { pid: match[1], command: match[2] } : null
    })
    .filter(Boolean)
    .filter(entry => entry.pid !== String(process.pid))
    .filter(entry => /(?:^|\/)(node|pnpm|vite|oura)(?:\s|$)/i.test(entry.command))
    .filter(entry => /scripts\/oura\.mjs\s+(?:live|serve)|\bvite\b|\/target\/release\/oura\b.*\bviz\b/i.test(entry.command))
    .map(entry => entry.pid)
}
const killIfAny = (pids, signal) => {
  if (!pids.length) return 0
  const result = spawnSync('kill', [`-${signal}`, ...pids], { stdio: passthroughStdio, env })
  if (result.error) {
    console.error(`Could not send ${signal} to processes: ${result.error.message}`)
    return 1
  }
  return result.status ?? 1
}
const command = process.argv[2]
if (command === 'setup') { if (!existsSync(repo)) { const parent = resolve(repo, '..'); const made = spawnSync('mkdir', ['-p', parent], { stdio: passthroughStdio }); if (made.status) process.exit(made.status); const cloned = spawnSync('git', ['clone', 'https://github.com/Th0rgal/open_oura.git', repo], { stdio: passthroughStdio }); if (cloned.status) process.exit(cloned.status) } const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }); if (!revision.status) console.log(`open_oura revision: ${revision.stdout.trim()}`); process.exit(run('cargo', ['build', '--release'])) }
if (command === 'scan') { requireBinary(); process.exit(run(binary, ['scan'])) }
if (command === 'pair') { requireBinary(); if (env.OURA_CONFIRM_PAIR !== '1') { console.error('Pairing writes an auth key. Manually factory-reset the dedicated backup ring first, then rerun with OURA_CONFIRM_PAIR=1.'); process.exit(1) } if (!keyFile) { console.error('Set OURA_KEY_FILE outside the repository before pairing.'); process.exit(1) } if (existsSync(keyFile) && env.OURA_CONFIRM_REINSTALL !== '1') { console.error('A local key file already exists. To retry an interrupted pairing with that exact same key, rerun with OURA_CONFIRM_REINSTALL=1. This does not generate or overwrite a key.'); process.exit(1) } console.log(`Pairing ${ringName}${ringAddress ? ` (${ringAddress})` : ''}…`); console.log('Step 1/3: scanning and connecting (usually 25–60 seconds). Keep the ring close and still.'); console.log('Step 2/3: installing or reusing the local app-auth key.'); console.log('Step 3/3: verifying authentication and battery.'); if (env.OURA_LOG_LEVEL) console.log(`Bridge logs enabled at ${env.OURA_LOG_LEVEL}.`); const result = run(binary, withKey(['pair'])); if (result === 0) console.log('Pairing completed. Next: pnpm oura:verify'); process.exit(result) }
if (command === 'verify') { requireBinary(); if (run(binary, withKey(['info']))) process.exit(1); process.exit(run(binary, withKey(['accel', '--seconds', '15']))) }
if (command === 'serve') { requireBinary(); captureBattery(); process.exit(run(binary, withKey(['viz', '--port', port, '--minutes', minutes]))) }
if (command === 'live') { const web = spawn('pnpm', ['dev'], { stdio: passthroughStdio, env }); const bridge = spawn('node', ['scripts/oura.mjs', 'serve'], { stdio: passthroughStdio, env }); bridge.on('exit', code => console.error(`[oura] bridge exited (${code ?? 'unknown'}); React remains available in Demo Mode.`)); const stop = () => { web.kill('SIGINT'); bridge.kill('SIGINT') }; process.on('SIGINT', stop); process.on('SIGTERM', stop); web.on('exit', code => process.exit(code ?? 0)); }
if (command === 'stop') {
  const portPids = listPids(['-ti', `:${vitePort}`, '-ti', `:${port}`])
  const relatedPids = Array.from(new Set([...portPids, ...findProjectPids()]))
  if (!relatedPids.length) {
    console.log(`No Oura bridge or Vite processes found on ports ${vitePort} and ${port}.`)
    process.exit(0)
  }
  console.log(`Stopping processes: ${relatedPids.join(', ')}`)
  const signal = env.OURA_FORCE_STOP === '1' ? 'KILL' : 'TERM'
  const result = killIfAny(relatedPids, signal)
  if (result === 0) console.log(`Stop signal ${signal} sent. If anything remains stuck, rerun with OURA_FORCE_STOP=1 pnpm oura:stop`)
  process.exit(result)
}
console.error('Usage: pnpm oura:{setup|scan|pair|verify|serve|stop} or pnpm dev:live'); process.exit(1)
