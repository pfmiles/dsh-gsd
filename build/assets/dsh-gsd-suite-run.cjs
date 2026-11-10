// dsh-gsd-suite/run.cjs — DSH→Claude hook stdio adapter for GSD guard hooks.
//
// Canonical copy maintained at build/assets/dsh-gsd-suite-run.cjs in the
// dsh-gsd repo and shipped by build.mjs into the product tree at
// hooks/dsh-gsd-suite/run.cjs. Provenance: the install-gsd-dsh.sh deployment
// artifact of the same project (MIT) — carried verbatim into the plugin
// package because the canonical hooks registry (config/gsd-hooks.json,
// build/assets/gsd-hooks.json) dispatches every guard through this path, and
// the @opengsd/gsd-core npm tarball's hooks tree does NOT ship it. Without
// this wrapper every hook spawn fails with MODULE_NOT_FOUND and the DSH
// bridge fails open (no guard ever fires — all guards dead). Restored by
// plan 01-03 Task 2 (hooks-bridge regression, live .env interception probe).
//
// The DSH claude-code hooks bridge forwards tool calls with DSH tool names
// (lowercase: read/write/edit/bash/grep/glob/web_search/…) and Claude-shaped
// tool_input/tool_response fields. GSD's guard hooks dispatch on Claude's
// PascalCase tool vocabulary, so unknown names silently allow. This runner
// normalizes the tool_name on stdin, then execs the real hook verbatim
// (stdout/stderr inherited, exit code propagated — exit 2 still blocks).
//
// Usage: node run.cjs <command> [args…]   (stdin: hook JSON payload)
'use strict';
const fs = require('fs');
const { spawnSync } = require('child_process');

const NAME_MAP = {
  read: 'Read',
  read_image: 'Read',
  grep: 'Grep',
  glob: 'Glob',
  bash: 'Bash',
  pwsh: 'Bash',
  write: 'Write',
  edit: 'Edit',
  web_search: 'WebSearch',
  web_fetch: 'WebFetch',
  subagent: 'Agent',
  subagent_fork: 'Agent',
  workflow: 'Agent',
};

let raw = fs.readFileSync(0, 'utf8');
try {
  const j = JSON.parse(raw);
  if (j && typeof j === 'object' && typeof j.tool_name === 'string') {
    const mapped = NAME_MAP[j.tool_name];
    if (mapped) j.tool_name = mapped;
  }
  raw = JSON.stringify(j);
} catch {
  // not parseable (rare bridge payloads): forward verbatim, fail-open downstream
}

const cmd = process.argv[2];
if (!cmd) {
  process.stderr.write('run.cjs: missing hook command\n');
  process.exit(2);
}
// GSD's .sh hooks are bash scripts; Debian's /bin/sh (dash) cannot parse
// `set -o pipefail`, and its exit code 2 would collide with the hook
// protocol's block code — so route every sh request through bash.
const resolved = cmd === 'sh' || cmd.endsWith('/sh') ? 'bash' : cmd;
const r = spawnSync(resolved, process.argv.slice(3), {
  input: raw,
  stdio: ['pipe', 'inherit', 'inherit'],
});
process.exit(r.status === null ? 1 : r.status);
