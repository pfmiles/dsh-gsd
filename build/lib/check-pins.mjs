#!/usr/bin/env node
// dsh-gsd check-pins — verify pins.json ⇄ package.json consistency for the
// declared DSH line. build/assets/pins.json is the single truth source of
// version strings for this phase; package.json is the execution truth; this
// script fails closed on any drift between the two.
//
// Usage: node build/lib/check-pins.mjs [--offline] [--registry=<url>]
//
// Exit codes: 0 ok / 1 IO·parse failure / 2 validation failure (gate — blocks
// the matrix: version format, dsh<line> existence, package version, engines.dsh
// window string, engines.node, three-pin equality, registry drift).
import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const finish = (code, msg) => {
  if (msg) (code === 0 ? console.log : console.error)(msg)
  process.exit(code)
}

// Parse a plugin version of the form <gsd-ver>-<rev>.dsh<line> where <gsd-ver>
// is x.y.z, <rev> is a pure numeric id, and <line> is a 3-digit dotless DSH
// line label (e.g. 1.20.1-2.dsh022). Returns { gsd, rev, line } or null.
export function parseVersion(v) {
  if (typeof v !== 'string') return null
  const m = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-([1-9]\d*)\.dsh(\d{3})$/.exec(v)
  if (!m) return null
  return { gsd: `${m[1]}.${m[2]}.${m[3]}`, rev: Number(m[4]), line: m[5] }
}

// True when v names a published-supportable pair: parseable, its DSH line
// exists in pins, that line is not '<unsupported>', and its gsd-ver sits on the
// matrix GSD axis. Pure string/table judgment — never local semver math.
export function validateVersion(v, pins) {
  const p = parseVersion(v)
  if (!p) return false
  const line = pins && pins.lines && typeof pins.lines === 'object' ? pins.lines[p.line] : undefined
  if (!line || typeof line !== 'object') return false
  if (line.dshRange === '<unsupported>') return false
  return Boolean(pins && pins.matrix && Array.isArray(pins.matrix.gsd) && pins.matrix.gsd.includes(p.gsd))
}

async function main() {
  const { values } = parseArgs({
    options: {
      offline: { type: 'boolean', default: false },
      registry: { type: 'string', default: 'https://registry.npmjs.org' },
    },
  })

  // (a) pins.json load / JSON.parse failure → exit 1
  const pinsPath = join(root, 'build', 'assets', 'pins.json')
  let pins
  try {
    pins = JSON.parse(await readFile(pinsPath, 'utf8'))
  } catch (e) {
    finish(1, `check-pins: cannot load ${pinsPath} — ${e && e.message ? e.message : e}`)
  }

  // (b) pins schema: lines / matrix present, axis arrays non-empty → exit 2
  const linesOk =
    pins && typeof pins === 'object' && pins.lines && typeof pins.lines === 'object' &&
    Object.keys(pins.lines).length > 0
  const matrixOk =
    pins && pins.matrix && typeof pins.matrix === 'object' &&
    Array.isArray(pins.matrix.dsh) && pins.matrix.dsh.length > 0 &&
    Array.isArray(pins.matrix.gsd) && pins.matrix.gsd.length > 0
  if (!linesOk || !matrixOk) {
    finish(2, 'check-pins: pins.json schema invalid — need non-empty lines and matrix.dsh / matrix.gsd arrays')
  }

  // package.json (execution truth) — load failure → exit 1 (IO·parse)
  let pkg
  try {
    pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  } catch (e) {
    finish(1, `check-pins: cannot load package.json — ${e && e.message ? e.message : e}`)
  }

  // (c) name/version non-empty valid strings (host preflight fails open on bad
  // manifests — the publish-side counter, Pitfall 4) → exit 2
  if (typeof pkg.name !== 'string' || pkg.name.trim() === '') {
    finish(2, 'check-pins: package.json name missing or not a non-empty string (host preflight fails open on bad manifests)')
  }
  if (typeof pkg.version !== 'string' || pkg.version.trim() === '') {
    finish(2, 'check-pins: package.json version missing or not a non-empty string (host preflight fails open on bad manifests)')
  }

  // (d) version format whitelist → exit 2
  const pv = parseVersion(pkg.version)
  if (!pv) {
    finish(2, `check-pins: invalid version format '${pkg.version}' (must match <gsd-ver>-<rev>.dsh<line> e.g. 1.20.1-1.dsh022 — rev is a pure numeric id, line is dotless)`)
  }

  // package version must equal the pins single source (upgrade/rollback =
  // change the version in ONE place — pins.json) → exit 2
  if (typeof pins.version !== 'string' || pins.version.trim() === '') {
    finish(2, 'check-pins: pins.json version key missing or not a non-empty string (single source of the package version)')
  }
  if (pkg.version !== pins.version) {
    finish(2, `check-pins: version mismatch — package.json '${pkg.version}' vs pins.json version '${pins.version}' (upgrade/rollback changes the version in one place)`)
  }

  // (e) version.line must exist in pins.json lines → exit 2
  const line = pins.lines[pv.line]
  if (!line || typeof line !== 'object') {
    finish(2, `check-pins: line dsh${pv.line} not present in pins.json lines (present: ${Object.keys(pins.lines).join(', ')})`)
  }

  // (f) declared line must not be '<unsupported>' → exit 2
  if (line.dshRange === '<unsupported>') {
    finish(2, `check-pins: line dsh${pv.line} is '<unsupported>' — package version '${pkg.version}' declares an unsupported DSH line`)
  }

  const engines = pkg.engines && typeof pkg.engines === 'object' ? pkg.engines : {}

  // (g) engines.dsh strictly equals pins.lines[line].dshRange → exit 2
  if (engines.dsh !== line.dshRange) {
    finish(2, `check-pins: engines.dsh mismatch — package.json '${engines.dsh ?? '<missing>'}' vs pins.json dsh${pv.line}.dshRange '${line.dshRange}'`)
  }

  // (h) engines.node strictly equals pins.node → exit 2
  if (engines.node !== pins.node) {
    finish(2, `check-pins: engines.node mismatch — package.json '${engines.node ?? '<missing>'}' vs pins.json node '${pins.node}'`)
  }

  // (i) both bridge dependency pins strictly equal pins.lines[line].bridge → exit 2
  const deps = pkg.dependencies && typeof pkg.dependencies === 'object' ? pkg.dependencies : {}
  const bridge = line.bridge && typeof line.bridge === 'object' ? line.bridge : {}
  for (const [name, pin] of Object.entries(bridge)) {
    if (deps[name] !== pin) {
      finish(2, `check-pins: dependency ${name} mismatch — package.json '${deps[name] ?? '<missing>'}' vs pins.json pin '${pin}'`)
    }
  }

  // (j) skill-filesystem peer range strictly equals pins.lines[line].peer → exit 2
  // pins.json spells the peer as "<name> <range>"; package.json executes it as
  // key=<name>, value=<range> — the equivalence check composes the same string.
  const peers = pkg.peerDependencies && typeof pkg.peerDependencies === 'object' ? pkg.peerDependencies : {}
  const peerName = '@deepseek-ai/dsh-skill-filesystem'
  const peerRange = peers[peerName]
  if (peerRange === undefined || `${peerName} ${peerRange}` !== line.peer) {
    finish(2, `check-pins: peerDependencies ${peerName} mismatch — package.json '${peerRange ?? '<missing>'}' vs pins.json peer '${line.peer}'`)
  }

  // (k) registry sampling of the two bridge pins (skipped with --offline):
  // spawn failure → exit 1, returned version != pin → exit 2 'registry drift'
  if (!values.offline) {
    for (const [name, pin] of Object.entries(bridge)) {
      const p = spawnSync('npm', ['view', `${name}@${pin}`, 'version', '--json', `--registry=${values.registry}`], { encoding: 'utf8' })
      if (p.status !== 0) {
        finish(1, `check-pins: npm view ${name}@${pin} failed (exit ${p.status}) — ${(p.stderr || '').trim() || '(no stderr)'}`)
      }
      let got
      try {
        got = JSON.parse((p.stdout || '').trim())
      } catch {
        got = (p.stdout || '').trim()
      }
      // npm --json emits an array of matching versions even for an exact
      // specifier; a plain string is the non-json/edge shape. Both must
      // resolve to exactly the pinned version — anything else is drift.
      const drift = Array.isArray(got)
        ? got.length !== 1 || got[0] !== pin
        : typeof got === 'string' ? got !== pin : true
      if (drift) {
        finish(2, `check-pins: registry drift ${name} expected '${pin}' vs actual '${JSON.stringify(got)}'`)
      }
    }
  }

  console.log(`pins: all consistent (line dsh${pv.line})`)
}

// Side-effect-free import contract: main() runs only when this file IS the
// entry point (tests import the exported parseVersion/validateVersion).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => finish(1, `check-pins: unexpected failure — ${e && e.message ? e.message : e}`))
}
