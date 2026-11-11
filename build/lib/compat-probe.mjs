#!/usr/bin/env node
// dsh-gsd compat-probe — ask the DSH host itself whether this plugin manifest
// (package.json) is compatible with a given DSH runtime version. The host's
// evaluatePluginCompatibility is the ONLY compatibility truth; this probe
// forwards parameters and asserts the return contract, never local semver math.
//
// Usage: node build/lib/compat-probe.mjs --dsh <runtime-version> --expect install-ok|reject
//
// Exit codes: 0 result matches --expect / 1 IO·parse·environment mismatch /
// 2 evaluation result does not match --expect (matrix cell red).
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const finish = (code, msg) => {
  if (msg) (code === 0 ? console.log : console.error)(msg)
  process.exit(code)
}

async function main() {
  const { values } = parseArgs({
    options: {
      dsh: { type: 'string' },
      expect: { type: 'string' },
    },
  })
  if (!values.dsh) {
    finish(2, 'compat-probe: --dsh <runtime-version> is required')
  }
  if (values.expect !== 'install-ok' && values.expect !== 'reject') {
    finish(2, `compat-probe: invalid --expect '${values.expect ?? ''}' (must be install-ok|reject)`)
  }

  let manifest
  try {
    manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  } catch (e) {
    finish(1, `compat-probe: cannot load plugin manifest — ${e && e.message ? e.message : e}`)
  }

  // Host module candidates, in order: npm default hoisting puts the boot
  // package at the top level; a nested install pins it under @deepseek-ai/dsh.
  // The host package is ESM ("type": "module") — dynamic import only, never
  // createRequire hard-require (T-2-03: wrong-host spoofing is gated next).
  const candidates = [
    join(root, 'node_modules', '@deepseek-ai', 'dsh-app-boot', 'lib', 'index.js'),
    join(root, 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai', 'dsh-app-boot', 'lib', 'index.js'),
  ]
  let host = null
  let hostPackageDir = null
  let lastError = null
  for (const candidate of candidates) {
    try {
      host = await import(pathToFileURL(candidate).href)
      hostPackageDir = resolve(dirname(candidate), '..')
      break
    } catch (e) {
      lastError = e
    }
  }
  if (!host) {
    finish(1, `compat-probe: cannot resolve the DSH host boot module — tried ${candidates.map((c) => `'${c}'`).join(', ')}; last error: ${lastError && lastError.message ? lastError.message : lastError}`)
  }

  // Environment guard: the loaded host must BE the requested runtime version —
  // a hoisted stray copy resolves to the wrong truth (T-2-03).
  let hostVersion
  try {
    hostVersion = JSON.parse(await readFile(join(hostPackageDir, 'package.json'), 'utf8')).version
  } catch (e) {
    finish(1, `compat-probe: cannot read host package.json at ${hostPackageDir} — ${e && e.message ? e.message : e}`)
  }
  if (hostVersion !== values.dsh) {
    finish(1, `compat-probe: host boot version ${hostVersion} != requested ${values.dsh}`)
  }

  // Host evaluation — the only compatibility judgment in this file. The third
  // argument is passed explicitly so the result never depends on the module's
  // ambient runtime version.
  let result
  try {
    const { evaluatePluginCompatibility } = host
    if (typeof evaluatePluginCompatibility !== 'function') {
      finish(1, 'compat-probe: host boot module does not export evaluatePluginCompatibility')
    }
    result = evaluatePluginCompatibility(manifest, {}, values.dsh)
  } catch (e) {
    finish(1, `compat-probe: host evaluation threw — ${e && e.message ? e.message : e}`)
  }

  // Host return contract (measured): all requirements met → undefined; unmet →
  // { name, version, runtimeVersion, requirements, exempted }.
  if (values.expect === 'install-ok') {
    if (result === undefined) {
      const range = manifest && manifest.engines && typeof manifest.engines === 'object' ? manifest.engines.dsh : '(none)'
      console.log(`compat-probe: install-ok confirmed (dsh ${values.dsh} satisfies engines.dsh ${range})`)
      finish(0)
    }
    finish(2, JSON.stringify(result))
  }

  // expect: reject — host must report an unmet engines.dsh requirement.
  const unmet = result && typeof result === 'object' && result.requirements ? result.requirements['engines.dsh'] : undefined
  if (result && typeof unmet === 'string' && unmet !== '') {
    console.log(JSON.stringify(result.requirements))
    console.log('compat-probe: reject confirmed')
    finish(0)
  }
  finish(2, `compat-probe: expected reject but host did not report unmet engines.dsh (result=${result === undefined ? 'undefined' : JSON.stringify(result)})`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => finish(1, `compat-probe: unexpected failure — ${e && e.message ? e.message : e}`))
}
