# Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用） - Pattern Map

**Mapped:** 2026-11-10
**Files analyzed:** 10
**Analogs found:** 7 / 10

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `build.mjs` | utility | batch/transform (file I/O) | `build.mjs` (in-place target; only pipeline utility in repo) | self (carry-forward) |
| `build/lib/rewrite-map.cjs` | utility | transform | `build.mjs` L23-31 `REWRITES` | exact (literal extraction source) |
| `build/assets/gsd-hooks.json` | config | — | `cordis.patch.yml` L22-25 (consumer) + tracked origin `install-gsd-dsh.sh:587-657` (sibling repo, byte-identical template) | exact content / role-match |
| `tests/rewrite-map.test.mjs` | test | transform | — No Analog Found — | — |
| `tests/build-smoke.test.mjs` | test | batch/file I/O | — No Analog Found — | — |
| `tests/run-gates.sh` | test (gate script) | batch/file I/O | — No Analog Found — | — |
| `package.json` | config/manifest | — | `package.json` (in-place; `scripts`/`files`/`engines` blocks) | self (carry-forward) |
| `README.md` | doc | — | `README.md` (in-place; bilingual structure) | self (carry-forward) |
| `BUILD.md` | doc | — | `README.md` | role-match |
| `THIRD-PARTY-NOTICES.md` | doc/config | — | `README.md` L110-114 attribution + `LICENSE` L1-3 header | role-match |

**Tracked-source gate verified:** all named analogs above are git-tracked in their
repos (`git ls-files` non-empty). `config/`, `skills/`, `gsd-core/`, `hooks/`,
`scripts/` are gitignored build products — **excluded as analogs**; where their
content matters, the tracked origin is named instead (build.mjs's own copy logic;
install-gsd-dsh.sh template).

## Pattern Assignments

### `build.mjs` (utility, batch/transform) — MODIFIED in place

**Analog:** `build.mjs` itself (read fully; only pipeline utility in repo). Keep
current conventions when inserting the fetch → pre-gate → stage → capture wiring.

**Shebang + header comment** (L1-8) — carry forward; update comment when换源 happens:
```js
#!/usr/bin/env node
// dsh-gsd build — stage GSD assets into the plugin package.
```

**Imports** (L9-12) — Node built-ins only, zero runtime deps (also RESEARCH.md Standard Stack):
```js
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
```

**Root/ref resolution** (L14-15, L21) — `fileURLToPath(import.meta.url)` idiom, same as `index.js` L13-21:
```js
const root = resolve(dirname(fileURLToPath(import.meta.url)))
const PLUGIN_ROOT_REF = '$DSH_PROFILE_DIR/node_modules/dsh-gsd'
```

**Sourcing contract (to change)** (L15, L19) — current SPIKE legacy entry, per CONTEXT
`GSD_BUILD_SOURCE` remains compatibility-only; production = npm tarball + official `--claude` staging:
```js
const source = process.env.GSD_BUILD_SOURCE || join(homedir(), '.dsh')
const sourceHome = process.env.GSD_BUILD_FROM || `${source}`
```

**Logging + counters style** (L65, L107, L155) — `console.log('build: ...')` progress,
`console.error('build: ...')` failure (L100), no try/catch anywhere (fail-fast top-level script):
```js
let counters = { copied: 0, rewritten: 0, notes: 0 }
console.log(`build: source=${source} from-prefix=${sourceHome}`)
console.log(`build: copied ${counters.copied} trees, … ${counters.notes} skills (${skillNames.length} total)`)
```

**Tree reset + 4-tree whitelist copy** (L110-134) — the capture-step shape to keep
(staging becomes source; `config/gsd-hooks.json` source switches to `build/assets/gsd-hooks.json`):
```js
for (const d of ['skills', 'gsd-core', 'hooks', 'config', 'scripts']) {
  await rm(join(root, d), { recursive: true, force: true })
}
```

**Rewrite/inject walk** (L137-153) — `walk()` (L75-82) over `skills/`, `gsd-core/`, `scripts/` then `injectNote(skillFiles)`.

**Exit-code gap:** current file has no `process.exit`. New pipeline adopts RESEARCH.md:375
convention (`0` ok / `1` IO/staging 失败留痕 / `2` gate 失败) — a deviation from current style, deliberate.

---

### `build/lib/rewrite-map.cjs` (utility, transform) — NEW

**Analog:** `build.mjs` L23-31 `REWRITES` — literal extraction target (Wave 0, RESEARCH.md:347).

```js
const REWRITES = [
  [`${sourceHome}/gsd-core`, `${PLUGIN_ROOT_REF}/gsd-core`],
  [`${sourceHome}/skills`, `${PLUGIN_ROOT_REF}/skills`],
  [`${sourceHome}/tasks`, '$DSH_HOME/tasks'],
  [sourceHome, '$DSH_HOME'],
  ['~/.dsh/gsd-core', `${PLUGIN_ROOT_REF}/gsd-core`],
  ['~/.dsh/tasks', '$DSH_HOME/tasks'],
  ['~/.dsh', '$DSH_HOME'],
]
```

**Ordering rule:** longest/most-specific `from` prefix first (staging-root + `gsd-core`
before bare staging root; `~/` fallbacks last) — mirrors `rewrite()` (build.mjs L67-73),
which applies pairs sequentially with `split/join`. New signature per RESEARCH.md L158-169:
from-prefix = runtime `stagingRoot` (never a deployment root).

**⚠ CJS vs ESM flag:** `package.json` L6 `"type": "module"` ⇒ `.cjs` = CommonJS.
RESEARCH.md L159's example uses `export function makeRewrites(stagingRoot)` — will fail
in `.cjs`. Use `module.exports = { makeRewrites }` (static shape keeps named import
working from `build.mjs`, e.g. `import { makeRewrites } from './build/lib/rewrite-map.cjs'`).
Planner must resolve this; do not copy the ESM form verbatim.

---

### `build/assets/gsd-hooks.json` (config) — NEW committed canonical template

**Analog:** consumer contract `cordis.patch.yml` L22-25 (tracked); byte-identical
content origin `install-gsd-dsh.sh:587-657` (tracked in sibling repo
`/Users/yue.weny/frontWorkspace/gsd-on-dsh/install-gsd-dsh`, git-tracked — verified).
Do NOT cite gitignored `config/gsd-hooks.json`; it is the build product this file replaces.

```yaml
config:
  configPath: !!js "process.getBuiltinModule('node:path').join(...createRequire(baseUrl).resolve('dsh-gsd/package.json')), 'config/gsd-hooks.json')"
  pluginRoot: !!js "process.getBuiltinModule('node:path').dirname(...createRequire(baseUrl).resolve('dsh-gsd/package.json'))"
```

**JSON conventions** from `package.json` L1-47 (tracked): 2-space indent, double
quotes, no trailing commas, keys sorted with `name`/`version`/`description` first.
The 4-tree copy logic in build.mjs L132-133 already writes this file into `config/`.

---

### `tests/rewrite-map.test.mjs` · `tests/build-smoke.test.mjs` · `tests/run-gates.sh` (test) — NEW

No analog — repo has zero tracked test files (`git ls-files -- '*test*' 'tests/*'` = empty).
Planner uses RESEARCH.md patterns: framework `node:test` with no config file
(RESEARCH.md L325-331, `node --test tests/`); gate A/B/C shell commands at
RESEARCH.md L249-257; smoke identity assertion at L262; exit-code convention L375.

## Shared Patterns

### Fail-fast + `build:` log prefix
**Source:** `build.mjs` L100/L107/L155 · **Apply to:** `build.mjs`, `tests/run-gates.sh`.
`console.error('build: no frontmatter in ${f}')` is the sole error style; new gate
failures must use message + `process.exit(2)` (RESEARCH.md L375), IO/staging failures `exit(1)`.

### Path reference vocabulary
**Source:** `build.mjs` L21-31 · **Apply to:** `build.mjs`, `build/lib/rewrite-map.cjs`,
`tests/*`.
`$DSH_PROFILE_DIR/node_modules/dsh-gsd` (PLUGIN_ROOT_REF) for package assets;
`$DSH_HOME` for `tasks/` and `~/`/`$HOME` fallbacks; `stagingRoot` (mktemp, never a
`/Users/...` literal) as from-prefix — CONTEXT locked.

### Config/manifest conventions
**Source:** `package.json` L32-46 + `cordis.patch.yml` L17-25 · **Apply to:**
`package.json` (add `"test": "node --test tests/"` beside L44-45, prepack chain
unchanged), `build/assets/gsd-hooks.json`.
Preserve: `files` whitelist shape (output trees stay listed), `dsh.bundle.patch`
pointer, `engines.dsh` untouched (P2).

### Docs: bilingual 中文 + `**EN**` mirror, links to tracked files
**Source:** `README.md` L1 (generated-by marker), L9-18 (bilingual), L56-67 (原理),
L85-96 (构建章节 — the section being rewritten) · **Apply to:** `README.md`, `BUILD.md`.
BUILD.md should carve out of the Build & Release section: GSD_VERSION usage, staging
channel, offline chain (RESEARCH.md Pattern 2: GSD_TARBALL → `.build-cache` → GSD_PACKAGE_DIR
→ npm pack), failure modes + fixes (Pitfall 1 ENOTCACHED wording), exit codes.

### Third-party attribution
**Source:** `README.md` L110-114 + `LICENSE` L1-3 · **Apply to:** `THIRD-PARTY-NOTICES.md`.
Format precedent: ``上游：GSD Core (MIT, © 2026 Open GSD)`` — SBOM-style fields
(package/version/shasum/integrity/license/URL per RESEARCH.md Open Q3) as a table.

### Related tracked file (conditional edit)
`RESEARCH.md` Pattern 2 proposes `.build-cache/` (added to `.gitignore`). If adopted,
follow tracked `.gitignore` L1-8 entry style (`*.tgz`, `.gsd-build-tmp/` already there).

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `tests/rewrite-map.test.mjs` | test | transform | Zero tracked test files in repo; use node:test per RESEARCH.md L325-331, feed `makeRewrites(stagingRoot)` fixtures |
| `tests/build-smoke.test.mjs` | test | batch/file I/O | No test infra exists; assert SKIL-03 identity JSON (RESEARCH.md L262) + SKIL-04/INST-02 greps (L249-257) |
| `tests/run-gates.sh` | test (gate script) | batch/file I/O | No shell scripts in repo; gate A/B/C command bodies from RESEARCH.md L249-257 |

## Metadata

**Analog search scope:** full repo `git ls-files` (23 tracked paths incl. `.planning/`);
sibling repo `install-gsd-dsh` tracked check for template origin.
**Files scanned:** build.mjs (155 L, full), package.json (47), index.js (42),
cordis.patch.yml (25), README.md (114), LICENSE (21), .gitignore (8);
CONTEXT.md + RESEARCH.md consumed as required reading.
**Patched-date of data:** 2026-11-10
**Pattern extraction date:** 2026-11-10
