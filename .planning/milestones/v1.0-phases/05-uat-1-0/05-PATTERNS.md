# Phase 5: 端到端 UAT 与 1.0 收官 - Pattern Map

**Mapped:** 2026-11-16
**Files analyzed:** 9 existing + 2 new (+ 2 report deliverables)
**Analogs found:** 11 / 11 (7 self-analogs, 4 cross-file analogs)
**Scope:** release + UAT + measurement. Every "modify" below is a surgical edit inside an
existing idiom; only the UAT harness and one canonical build asset are new files.

> **All line numbers re-verified against the working tree at `eeb9c24`, not inherited from
> `05-RESEARCH.md`.** Every path below passed `git ls-files` (tracked-source gate, no gitignored
> mirrors). Discrepancies found are listed in §0.

---

## 0. Load-bearing findings that change what the planner should do

These are ordered by how much they change the plan. F-01 and F-02 are **new** (not in
`05-RESEARCH.md`); F-03 is a hard correction to the brief itself.

### F-01 — Adding `publishConfig.tag` reds a **second** assertion that RESEARCH did not name

`05-RESEARCH.md` §Q2.1 says the flip touches three places: `package.json`, `docs-consistency`
⑥ (`:102-105`), and the header comment at `:7`. **There is a fourth.** Test ⑬ pins the entire
`publishConfig` object with `deepEqual`:

```js
// tests/docs-consistency.test.mjs:330-334
  assert.deepEqual(
    pkg.publishConfig,
    { registry: 'https://registry.npmjs.org/' },
    'package.json publishConfig 丢失或漂移 ⇒ 发布会落到本机默认只读镜像（registry.npmmirror.com）而非 npmjs',
  )
```

`assert.deepEqual` from `node:assert/strict` rejects an extra key. Verified by execution against
the exact assertion shape: a `publishConfig` of `{ registry, tag }` produces
`RED -> publishConfig drift`.

⇒ **The same commit must edit `docs-consistency.test.mjs:330-334` to expect
`{ registry: 'https://registry.npmjs.org/', tag: 'latest' }`, or the suite reds after a
"correct" Q2.2 fix.** Without this the publish pre-flight fails for a reason that looks
unrelated to the change just made.

### F-02 — `scripts/uat/*` is **not a viable location** for the UAT harness

The brief offers `tests/uat-harness.test.mjs` **or** `scripts/uat/*`. The second option is
structurally impossible in this repo, on three independent grounds:

```bash
$ git check-ignore -v scripts/uat/runner.mjs
.gitignore:8:scripts/	scripts/uat/runner.mjs
$ git ls-files -- scripts/ | wc -l
0
```

1. `.gitignore:8` ignores `scripts/` outright → the file can never be committed.
2. Repo-root `scripts/` is a **build product**, deleted and repopulated on every build:

```js
// build.mjs:281-283
  for (const d of ['skills', 'gsd-core', 'hooks', 'config', 'scripts']) {
    await rm(join(root, d), { recursive: true, force: true })
  }
```
   …then copied from the staging tree at `build.mjs:295` (`cp(join(STAGING,'scripts'), …)`).
   `prepack` runs `build.mjs` (`package.json:50`), so the file would evaporate on every publish.
3. It is inside the npm `files` whitelist (`package.json:46`), so it would ship to users as
   package content — the opposite of what a UAT harness wants.

⇒ **Harness goes in `tests/`.** `tests/` is git-tracked (`git ls-files -- tests/` → 7 files),
is **not** in `files`, and is not touched by `build.mjs`. Same conclusion for the fixtures
(`tests/fixtures/` does not exist yet — the planner creates it).

### F-03 — Commit-validator opt-in key is `hooks.community`, not `hooks.commit_types`

`05-RESEARCH.md:636` reports the repo "has no commit-types opt-in". The precise mechanism is
different and it matters for UAT-04, because it decides what the harness must assert:

```bash
# hooks/gsd-validate-commit.sh:82-83  (inside the node -e opt-in probe)
      const c=require('./.planning/config.json');
      process.stdout.write(c.hooks?.community===true?'1':'0');
# hooks/gsd-validate-commit.sh:118-119
  ENABLED="${CONFIG_OUT%%$'\n'*}"
  if [ "$ENABLED" != "1" ]; then exit 0; fi
```

`hooks.commit_types` (read at `:85`) only supplies **extra** types beyond the 10 built-ins; it is
not the enable flag. The enable flag is `hooks.community === true`, and the live
`.planning/config.json` has only `"hooks": { "context_warnings": true }` → `ENABLED = '0'` →
**the validator exits 0 and allows everything in this repo as it stands.**

⇒ UAT-04 cannot be "run a bad commit and see it blocked" in the current tree. The plan must
either (a) flip `hooks.community` in a scratch copy of the repo, or (b) assert the *disabled*
line and treat the case as un-provable rather than green. Silently recording "commit was
rejected by something" is the false green Q6 §1 warns about.

### F-04 — `BUILD.md:16` and the 38-case count stay valid; new tests change it

`BUILD.md:16` is the repo's only live test count. Verified by static count at `eeb9c24`:
`build-smoke 2 / compat-matrix 8 / docs-consistency 14 / pack-contents 4 / rewrite-map 7 /
version 3 = 38`. Any new `test()` the planner adds makes `BUILD.md:16` stale — and no test
asserts on that number today (`grep -rn '当前状态\|## Status' tests/` → none), so it will
degrade silently. The plan should carry an explicit "update `BUILD.md:16`" action.

### F-05 — `05-RESEARCH.md` line citations confirmed accurate (no drift)

Checked every citation the brief inherited: `package.json:50-51` ✅, `compat-matrix.yml:56` ✅,
`docs-consistency.test.mjs:102-105` ✅, `build.mjs:298` and `:306-307` ✅,
`ui-frontend-evidence.cjs:104` ✅. **Nothing moved.**

**Corrected 2026-11-16 — the `CB-8` note in this finding was wrong.** It said the token "is indeed
absent from both `04-VALIDATION.md` and `docs/MIGRATION.md`". Measured (`grep -c 'CB-8'`):

| File | Count | Where |
|---|---|---|
| `.planning/phases/04-migration-coexistence/04-05-PLAN.md` | **5** | the label's only *definition*: `:76`, `:436` (CB-8b's five conjuncts), `:437`, `:772-773` (CB-8a = `COEXIST-DRILL`, CB-8b = `COEXIST-REAL`) |
| `.planning/phases/04-migration-coexistence/04-VALIDATION.md` | **1** | `:165`, the G-4 escalation row's last column: 「重跑步骤 6 的 CB-8 四条判据」 |
| `docs/MIGRATION.md` | **0** | carries the criteria, never the label |

So: cite **CB-8b** by name with `04-05-PLAN.md:436` + `:772-773` and quote its five conjuncts; cite the
**static segment** from `docs/MIGRATION.md:239-257` as the runbook's own prose (it has no label). The
only accurate negative claim is the narrow one: *the runbook never uses the label*. See
`05-RESEARCH.md` §Q8's corrected note for how this was caught (a truncated quote plus an unreported
negative grep — the same failure class as the phase's other false greens).

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `package.json` | config (manifest) | declarative / batch (lifecycle scripts) | itself — `:48-55` scripts+publishConfig block | exact (self) |
| `.github/workflows/compat-matrix.yml` | config (CI) | batch (matrix fan-out) | itself — `:54-56` + gate line `:27` | exact (self), **hard-constrained** by `compat-matrix.test.mjs` |
| `tests/docs-consistency.test.mjs` | test (static consistency) | file-I/O (read → assert) | itself — ⑥ `:102-105`, ⑬ `:307-335` | exact (self) |
| **NEW** `tests/uat-harness.test.mjs` | test (integration harness) | batch + subprocess + file-I/O | `tests/build-smoke.test.mjs` | **role-match** (spawn+assert+skip) — no exact analog exists |
| `build.mjs` | build script | file-I/O (copy / transform / spawn) | itself — ⑤ capture `:278-307` | exact (self) |
| **NEW** `build/assets/ui-frontend-evidence.cjs` | build asset (canonical override) | file-I/O | `build/assets/dsh-gsd-suite-run.cjs` | **role-match** (both are canonical overrides of upstream bytes) |
| `README.md` | docs (bilingual, 2 halves) | static content | itself — badges `:1-6`, halves `:6` / `:80` | exact (self) |
| `CHANGELOG.md` | docs (release-notes source) | static content | itself — `:1-9` | exact (self) |
| `docs/dshmarket/pfmiles__dsh-gsd.yml` | data (catalog entry / PR payload) | static (byte-exact copy) | itself — `:1-6` | exact (self) |
| **NEW** `.planning/phases/05-uat-1-0/05-UAT.md` | docs (judgement ↔ evidence table) | static content | `04-VALIDATION.md` (per-req table) | role-match |
| **NEW** `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` | docs (raw logs ledger) | static content | `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` | **exact** (same genre, same phase-local placement) |

---

## Pattern Assignments

### 1. `package.json` (config, declarative)

**Analog:** itself. This is a self-modification; the pattern to copy is the file's own
compact-object style, because two tests pin exact shapes.

**Current state — the four edit sites** (`package.json:4`, `:48-55`):

```json
  "private": true,
  ...
  "scripts": {
    "build": "node build.mjs",
    "prepack": "node build.mjs && node --test tests/*.test.mjs",
    "test": "node --test tests/*.test.mjs"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
```

**Style precedent — how this file expresses a multi-key object.** `package.json:16-20` and
`:25-29` show the house style: JSON, 2-space indent, no trailing commas, keys in one line when
short (`"repository": { "type": "git", … }`) and one-per-line when they carry prose. The
`publishConfig` edit should be the one-per-line form:

```json
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest"
  }
```

**The flip must make `private` *absent*, not `false`** — see `05-RESEARCH.md:210-217`. Delete
line 4 entirely; do not write `"private": false`.

**Test couplings (all must land in the same commit):**

| Coupling | Site | Effect |
|---|---|---|
| ⑥ `pkg.private === true` | `docs-consistency.test.mjs:104` | reds when `private` is deleted |
| ⑬ `deepEqual(pkg.publishConfig, {registry})` | `docs-consistency.test.mjs:330-334` | **reds when `tag` is added** (F-01) |
| Header comment "private 未发布前仍 true" | `docs-consistency.test.mjs:6-7` | prose only, must be rewritten to stay honest |
| `prepack` / `test` scripts | `docs-consistency` — no assertion today | D-10-1 adds one (see §2/§3) |

**Do not touch:** `files` (9 entries, `:37-47`), `engines` (`:21-24`), `dsh.bundle`
(`:25-29`), `peerDependencies` exact pin (`:34-36`). Each is asserted by ⑩/⑬ or by
`version.test.mjs`. In particular `05-CONTEXT` carries `engines.dsh` unchanged (03-D-05).

---

### 2. `.github/workflows/compat-matrix.yml` (config, batch)

**Analog:** itself; **constraint source:** `tests/compat-matrix.test.mjs` (8 assertions).
This is the highest-risk edit in the phase: the test asserts workflow *shape*, so a
well-intentioned "tidy" reds the suite.

**The edit — pure in-place append at `:54-56`, and nothing else:**

```yaml
      - name: 完整测试（含真实构建 smoke）
        if: ${{ (!inputs.dsh || inputs.dsh == matrix.dsh) && (!inputs.gsd || inputs.gsd == matrix.gsd) }}
        run: node --test tests/*.test.mjs
```

becomes `run: node --test --test-concurrency=1 tests/*.test.mjs`.

**Why an in-place append is the only safe shape** — the six assertions that bind it:

**(a) ⑦ — every `run:` must sit directly under a four-term `if:`** (`compat-matrix.test.mjs:108-125`):

```js
  const isGate = (l) =>
    l.trim().startsWith('if:') &&
    l.includes('inputs.dsh') && l.includes('matrix.dsh') &&
    l.includes('inputs.gsd') && l.includes('matrix.gsd')
  const runIndexes = lines
    .map((l, i) => (/^\s+run:/.test(l) ? i : -1))
    .filter((i) => i >= 0)
  assert.ok(runIndexes.length >= 3, `expected >=3 run steps, found ${runIndexes.length}`)
  for (const i of runIndexes) {
    assert.ok(
      isGate(lines[i - 1]),
      `run step at line ${i + 1} is not gated by an inputs ∩ matrix if: on the previous line — previous: '${(lines[i - 1] || '').trim()}'`,
    )
  }
```

⇒ **Never add a new `run:` step** for the flag. A new step needs a synthesised four-term `if:`
on the line above it; an append to line 56 adds no line and no step.

**(b) ④ — four forbidden literals + the two required tool paths** (`:81-88`):

```js
  assert.ok(y.includes('node build/lib/check-pins.mjs --offline'), 'check-pins build/lib step missing')
  assert.ok(y.includes('node build/lib/compat-probe.mjs'), 'compat-probe build/lib step missing')
  assert.ok(!y.includes('scripts/pins.json'), 'scripts/pins.json leaked into workflow (D-R6)')
  assert.ok(!y.includes('scripts/check-pins'), 'scripts/check-pins leaked into workflow (D-R6)')
  assert.ok(!y.includes('scripts/compat-probe'), 'scripts/compat-probe leaked into workflow (D-R6)')
```

**(c) ⑤ — `dsh plugin add` must not appear** (`:92-94`). Relevant because the UAT harness
*will* use that phrase; keep it out of the workflow.

**(d) ⑧ — the canonical gate line is anchored to the whole line** (`:136-137`):

```js
const GATE_RE = /^\s+if \[ "\$\{\{ matrix\.expect \}\}" = "install-ok" \]; then$/m
const GATE_LINE_RE = /^\s+if \[ "\$\{\{ matrix\.expect \}\}" = "install-ok" \]; then$/
```

and `matrix.expect` must appear **exactly twice** in non-comment lines (`:163-171`), with
`exit 2` exactly once (`:196-204`). Appending to line 56 touches none of these.

**(e) ② — matrix cells must equal `pins.matrix.dsh × pins.matrix.gsd` exactly** (`:43-55`).
Do not add, remove, or reformat a cell.

**(f) ⑧ (4) — degenerate gate forms rejected** (`:207-221`): `||`, `!=`, `&&`, brace form. Do
not "improve" the gate lines while editing nearby.

**The safe diff is exactly one line.** `05-RESEARCH.md:725` reaches the same conclusion.

---

### 3. `tests/docs-consistency.test.mjs` (test, file-I/O)

**Analog:** itself. This file is the repo's idiom for "static assertion over files read as
text", and the new concurrency/`SKIP_DIRS` assertions belong here (not in a new file).

**Imports and helpers — copy these verbatim for any new block** (`:12-27`):

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseVersion } from '../build/lib/check-pins.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

const pkg = JSON.parse(read('package.json'))
const pins = JSON.parse(read('build/assets/pins.json'))
const readme = read('README.md')
const buildMd = read('BUILD.md')
const pkgText = read('package.json')
```

Note `read()` is root-relative and there is **no** `readJson()` — JSON files are
`JSON.parse(read(...))` at module scope. A new assertion reading the workflow file should
follow `compat-matrix.test.mjs:19` (`readWF = () => readFileSync(WF,'utf8')`) or simply
`read('.github/workflows/compat-matrix.yml')`, which the `read()` helper already supports.

**Test-naming idiom — circled numerals, Chinese scope prefix, colon-delimited claim:**

```js
// :102 / :107 / :115 / :127 / :171 / :217 / :264 / :307 / :350
test('⑥ Pitfall 7 哨兵：version 已迁新方案且 private 未发布前保持 true', () => {
test('⑧ CHANGELOG 首条目版本与 package.json.version 等值，小节名在六类闭集内', () => {
```

The file runs ①–⑭. New assertions continue at **⑮**; do not renumber (the section banner
comments at `:195-198` and `:337-347` reference numbers in prose).

**The block to flip — `:102-105`, verbatim, with its failure message:**

```js
test('⑥ Pitfall 7 哨兵：version 已迁新方案且 private 未发布前保持 true', () => {
  assert.equal(pkg.version, '1.20.1-1.dsh022')
  assert.equal(pkg.private, true, 'npm publish 前置：private: true 移除属 Phase 5 任务')
})
```

The message is literally an instruction to this phase. The researched target form
(`05-RESEARCH.md:212-217`) asserts absence, keeps the version pin, and renames the test to a
*published-state* sentinel.

**The block that breaks on `publishConfig.tag` — `:330-334`:** quoted in §0 F-01. Both blocks
plus the `:6-7` header comment are one atomic edit.

**Assertion style to imitate for "three sites carry the flag"** — the repo's established shape
for a literal must-appear/must-not-appear pair is `assert.ok(s.includes(x), msg)` /
`assert.ok(!s.includes(x), msg)` with the *file name* interpolated into the message
(`:98` `'${name} 含 ...'`, `:81` `` `${name} 仍含 ...` ``). And for "exactly N sites", the
pattern is a counted scan then `assert.equal(`, as in ⑫ (`:271-274`):

```js
  assert.equal(
    readmeHits.length, 2,
    `README.md 的裸名 install 整行应恰 2 行（zh + en 两半各一），实际 ${readmeHits.length}`,
  )
```

⇒ The D-10-1 assertion should be a counted scan over the three literal sites, **not**
`assert.ok(suite is green)` — `05-VALIDATION.md:65` states that explicitly.

**Bilingual slice helpers — reuse, never recompute** (`:29-33`):

```js
// README 双语两半：zh 段在前，en 段从第二个 '# dsh-gsd' 标题起。
const firstTitle = readme.indexOf('# dsh-gsd')
const enStart = readme.indexOf('# dsh-gsd', firstTitle + 1)
const readmeZh = readme.slice(0, enStart)
const readmeEn = readme.slice(enStart)
```

⑭ comments at `:345-346` codify why: a second slice computation "will silently shift the cut
point". Any new bilingual assertion must consume `readmeZh` / `readmeEn`.

**`read()` cost note:** the file reads 5 files at module scope and 2 more inside tests
(`:116` CHANGELOG, `:218` dshmarket entry). Adding 2–3 more module-scope reads is consistent
with existing style and keeps the file's ~sub-second runtime.

---

### 4. **NEW** `tests/uat-harness.test.mjs` (test / integration harness, batch + subprocess)

**No exact analog.** `grep -rn "'dsh'" tests/*.test.mjs` → nothing; **no test in this repo
spawns the `dsh` binary today.** The planner must compose the harness from three partial
analogs rather than copy one file.

#### 4a. Closest analog — `tests/build-smoke.test.mjs` (role-match: spawn + assert + skip)

**Prerequisite probe → `t.skip` with a reason (never a silent pass)** (`:31-50`):

```js
const CACHE_TGZ = join(ROOT, '.build-cache', `opengsd-gsd-core-${GSD_VERSION}.tgz`)
const canBuild = (() => {
  if (existsSync(CACHE_TGZ)) return true
  try {
    execFileSync('npm', ['view', `@opengsd/gsd-core@${GSD_VERSION}`, 'version'], { stdio: 'pipe', timeout: 15000 })
    return true
  } catch {
    return false
  }
})()

test('真实构建 → 产物断言（76 树 / identity / 零 ~/.dsh / adapter 72×1 / hooks 桥接守卫）', { timeout: 420000 }, (t) => {
  if (!canBuild) {
    t.skip(`full-build smoke requires warm ${CACHE_TGZ} or registry access — neither available (offline cold clone)`)
    return
  }
```

This is the pattern for the UAT harness's own gate: `DSH_HOME` must never be the real
`~/.dsh`, `DEEPSEEK_API_KEY` must be present, `zstd` must exist, and the tarball must exist.
Each unmet prerequisite → `t.skip('<what is missing>')` with the concrete path. **`timeout:`
as a test option** (`:46`) is how a long-running spawn is bounded.

**Spawn + assert on captured output, with exit code in the failure message** (`:162-165`):

```js
    const r = spawnSync('node', ['build.mjs'], { cwd: ROOT, env: buildEnv(), encoding: 'utf8' })
    const out = `${r.stderr}${r.stdout}`
    assert.equal(r.status, 2, `tampered .build-cache tgz must fail-closed (exit 2), got ${r.status}: ${out.trim().slice(0, 300)}`)
    assert.match(out, /checksum mismatch/, 'exit 2 must come from the NOTICES integrity check, not a downstream gate')
```

Three conventions to carry over: `spawnSync(..., { encoding: 'utf8' })`, concatenate
`stderr + stdout` into one `out`, and slice to 300 chars in the message. The final
`assert.match(out, …)` is what distinguishes "failed for the right reason" from "failed".

**Temp fixture lifecycle — `mkdtempSync` + `try/finally` + `rmSync`** (`:122-145`):

```js
  const probeDir = mkdtempSync(join(tmpdir(), 'gsd-nyquist-'))
  try {
    writeFileSync(join(probeDir, '.env'), 'DUMMY=1\n')
    const runGuard = (payload) =>
      spawnSync('node', [WRAPPER, 'node', join(ROOT, 'hooks', 'gsd-secret-read-guard.js')], {
        input: payload, encoding: 'utf8',
      })
    ...
  } finally {
    rmSync(probeDir, { recursive: true, force: true })
  }
```

Note `input:` for piping a payload into a child's stdin — directly reusable for a
`zstd -dc` pipe or a hook payload. And note the fixture is written **by the test**, not
committed; `tests/fixtures/` does not exist yet (F-02).

**Env-whitelist construction for child processes** (`:24-29`):

```js
const buildEnv = () => {
  const env = { ...process.env }
  for (const k of ['GSD_TARBALL', 'GSD_PACKAGE_DIR', 'GSD_BUILD_SOURCE']) delete env[k]
  env.GSD_VERSION = GSD_VERSION
  return env
}
```

The UAT analog must do the same for `DSH_HOME` / `DSH_PROFILE` / `DSH_PROFILE_DIR`, then
*set* `DSH_HOME` to the throwaway dir — inheriting the orchestrating session's `DSH_HOME=~/.dsh`
is exactly the "本机 profile 不进 UAT 判据" failure D-01 forbids.

**Negative test as a sibling `test()`, not a branch** (`:148-173`). The WR-01 test carries a
header comment stating its ordering rationale (`:149-151`: "same file = node:test serial
within a file, so it will not contend for `.build-cache`"). UAT-03/UAT-04 (block / allow
directions) should follow this: separate `test()` per direction, with the "must also assert
the positive case" reasoning in a comment.

#### 4b. Secondary analog — `tests/compat-matrix.test.mjs:98-102` (minimal spawn-and-assert)

The smallest correct "shell out, assert exit and one success line" in the repo:

```js
test('⑥ check-pins --offline 消费（D-R5：tests 内 spawn，prepack 链不动）', () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'build', 'lib', 'check-pins.mjs'), '--offline'], { encoding: 'utf8' })
  assert.equal(r.status, 0, `check-pins --offline failed (exit ${r.status}): ${r.stdout} ${r.stderr}`)
  assert.ok((r.stdout || '').includes('pins: all consistent'), `missing success line: ${r.stdout}`)
})
```

Note `process.execPath` rather than the string `'node'` when the child is a JS file of ours —
use `'dsh'`/`spawnSync('dsh', …)` only for the external binary.

#### 4c. Tertiary — `tests/pack-contents.test.mjs:227`

`spawnSync(process.execPath, [probe], { encoding: 'utf8' })` — same shape, used to exercise a
packed tarball. Confirms the repo has no third distinct idiom.

#### 4d. The one pattern that must come from RESEARCH, not from code

The session-execution predicate has **no** in-repo analog — nothing here reads a
`.jsonl.zstd` session record. Take it verbatim from `05-RESEARCH.md:130-133`:

```bash
zstd -dc "$f" | grep -q '"type":"assistant/message"'        # turn produced model output
# and NOT: grep -q '"type":"turn/end".*"kind":"error"'
```

with the false-green warning at `:128`: a session dir and `.zstd` exist **even when the turn
failed with `MISSING_CREDENTIAL`**. So "`sessions/` is non-empty" is never evidence.

#### 4e. Harness constraints the planner should record in the plan

| Constraint | Source | Consequence |
|---|---|---|
| `tests/` only, never `scripts/` | F-02 | committed, not shipped, not rebuilt |
| Never inherit `DSH_HOME` | `05-CONTEXT` D-01 | `delete env.DSH_HOME` then set to temp |
| Skip, never silently pass | `build-smoke:47-50` | missing `zstd`/key/tarball → `t.skip(reason)` |
| No `npm test` | `05-VALIDATION.md:30` | without `--test-concurrency=1` the harness races `build-smoke`'s rebuild |
| Adding a `test()` makes `BUILD.md:16` stale | F-04 | explicit update action |
| A `dsh` one-shot costs ~2.4–5.1 s wall | `05-RESEARCH.md:518-525` | budget the file's `timeout:` accordingly; a 6-case UAT is ~30 s |

---

### 5. `build.mjs` (build script, file-I/O)

**Analog:** itself. The mechanism to copy is the **post-staging canonical-asset copy**, used
twice already.

**The precedent, verbatim — `build.mjs:296-307`:**

```js
  await mkdir(join(root, 'config'), { recursive: true })
  await cp(join(root, 'build', 'assets', 'gsd-hooks.json'), join(root, 'config', 'gsd-hooks.json'))
  counters.copied++
  // hooks-bridge stdio adapter: the canonical hooks registry dispatches every
  // guard through hooks/dsh-gsd-suite/run.cjs, which the npm tarball does NOT
  // ship (install-gsd-dsh.sh deployment-only artifact). Missing it = every
  // hook spawn MODULE_NOT_FOUND → bridge fail-open → all guards dead. Caught
  // by the 01-03 Task 2 live .env interception probe (gsdtest/3091); shipped
  // from our canonical copy. 4-tree capture semantics unchanged.
  await mkdir(join(root, 'hooks', 'dsh-gsd-suite'), { recursive: true })
  await cp(join(root, 'build', 'assets', 'dsh-gsd-suite-run.cjs'), join(root, 'hooks', 'dsh-gsd-suite', 'run.cjs'))
```

**The five structural facts that make this the right injection point:**

1. It runs **after** the 4-tree capture — the upstream staging copy is `build.mjs:291`
   (`cp(join(STAGING, 'gsd-core'), join(root, 'gsd-core'), …)`), so a copy placed after it
   **overrides** upstream bytes.
2. It runs **before** the rewrite pass at `:313-317` (`for (const tree of ['skills','gsd-core',
   'hooks','scripts'])`), so a copied asset still gets `$DSH_HOME` / `${CLAUDE_PLUGIN_ROOT}`
   normalisation — which matters: `ui-frontend-evidence.cjs` is under `gsd-core/`, one of the
   four rewritten trees.
3. It runs **before** the gates at `:329-338`, so a bad patch is caught by gate B
   (machine-coupling scan) rather than shipping.
4. `counters.copied++` is incremented for every copy (`:299`) so the final log line
   (`:343`, `copied ${counters.copied} trees`) stays truthful. A new copy should do the same.
5. `build/assets/` is the **committed** canonical directory — all three members are tracked:
   `build/assets/dsh-gsd-suite-run.cjs`, `build/assets/gsd-hooks.json`,
   `build/assets/pins.json` (`git ls-files -- build/assets/`). New assets go here, nowhere else.

**The three-line shape to add** (mirroring `:298` and `:306-307`), to be placed in the ⑤ block:

```js
  await cp(join(root, 'build', 'assets', 'ui-frontend-evidence.cjs'), join(root, 'gsd-core', 'bin', 'lib', 'ui-frontend-evidence.cjs'))
  counters.copied++
```

`gsd-core/bin/lib/` already exists after the `:291` capture, so **no `mkdir` is needed** —
unlike the `hooks/dsh-gsd-suite` case at `:306`. Verify at implementation time; if the capture
whitelist ever narrows, add the `mkdir` back.

**Comment convention:** every non-obvious copy in this file carries a multi-line comment saying
*why the upstream copy is wrong* and *what fails without it* (`:300-305`). The new copy needs
the same treatment: name the upstream source version, the missing `.gsd-build-tmp` entry, and
the "whole-file copy pins upstream content" caveat that `05-RESEARCH.md:848` demands.

**Exit-code discipline** — `build.mjs:31-35` is the single exit funnel, and `:335-338` is how
gate failure propagates:

```js
const finish = (code, msg) => {
  if (msg) (code === 0 ? console.log : console.error)(msg)
  process.exit(code)
}
...
  if (gates.status !== 0) {
    console.error(`build: gates failed (exit ${gates.status}) — staging kept at ${STAGING} for forensics`)
    process.exit(gates.status)
  }
```

A patch that fails should surface through these, not through a bare `throw`. Exit 2 blocks
`prepack` (per `05-RESEARCH.md:692`), which is the intended behaviour.

**Do not:** edit `gsd-core/bin/lib/ui-frontend-evidence.cjs` in place (gitignored,
`.gitignore:5:gsd-core/`), reuse the `rewrites` table at `:116-124` (path-prefix substitution,
wrong tool — `05-RESEARCH.md:843`), or touch the legacy `GSD_BUILD_SOURCE` branch (`:115-154`),
which is compat-only and does not run gates.

---

### 6. **NEW** `build/assets/ui-frontend-evidence.cjs` (build asset, file-I/O)

**Analog:** `build/assets/dsh-gsd-suite-run.cjs` — same genre: a committed canonical copy that
`build.mjs` stages into the tree because the upstream tarball ships a wrong/absent version.

**Diff surface — the whole change is one Set member.** Current state in the built tree
(`gsd-core/bin/lib/ui-frontend-evidence.cjs:103-116`):

```js
/** Directories never walked — dependencies, VCS data, build output, GSD planning state. */
const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    '.planning',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    '.output',
    'coverage',
    'vendor',
    '.cache',
]);
```

12 members; **`.gsd-build-tmp` is absent** (`grep -c 'gsd-build-tmp' <file>` → `0`). The
consumer is `:181` — `if (!SKIP_DIRS.has(entry.name))` inside the evidence walk, with a
`MAX_WALK_ENTRIES = 10_000` cap at `:118-119`. So the missing entry means the repo's own
build scratch dir (`.gsd-build-tmp/`, 29 entries at time of mapping, ignored at
`.gitignore:3`) is walked as if it were user source during UI-evidence collection.

**How the copy is verified — copy the assertion from `build-smoke.test.mjs:102-109`:**

```js
  const WRAPPER = join(ROOT, 'hooks', 'dsh-gsd-suite', 'run.cjs')
  const CANONICAL = join(ROOT, 'build', 'assets', 'dsh-gsd-suite-run.cjs')
  assert.ok(existsSync(WRAPPER), 'hooks/dsh-gsd-suite/run.cjs missing after build — all guards fail open')
  assert.equal(
    readFileSync(CANONICAL, 'utf8'),
    readFileSync(WRAPPER, 'utf8'),
    'wrapper drifted from canonical build/assets/dsh-gsd-suite-run.cjs',
  )
```

Two assertions: existence after build, and **byte equality against the canonical**. That second
one is what proves the copy step ran and was not bypassed.

**Why the assertion must run post-rebuild, not on the working tree** (`05-VALIDATION.md:69`,
`05-RESEARCH.md:897`): asserting the working-tree file passes today and breaks at publish,
because `prepack` rebuilds. The order is: `node build.mjs` → assert built file contains
`.gsd-build-tmp` → (optionally) rebuild again → re-assert. Only the post-build assertion is
evidence.

**Where the assertion lives** — `docs-consistency` (⑮) reads text and needs no build, but this
check **requires** a build to have run. `build-smoke.test.mjs` already owns the "assert on
build products after a real build" slot (`:46`) and already has the `canBuild` skip guard.
Either place it inside `build-smoke`'s ① test as a new lettered group (the file uses
①–⑧ already, `:56`–`:145`), or create `tests/build-config.test.mjs` with a `t.skip` guard of
its own. `05-VALIDATION.md:78` allows either.

---

### 7. `README.md` (docs, bilingual two halves)

**Analog:** itself. The file is a **single file with two complete language halves**, and
`docs-consistency.test.mjs:29-33` splits it by the second `# dsh-gsd` heading.

**The badge block + first heading — `:1-6`, exactly as ⑨ expects:**

```markdown
<!-- generated-by: gsd-doc-writer -->

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.1-blue)](https://github.com/pfmiles/dsh-gsd#requirements)

# dsh-gsd
```

⑨ (`:134-147`) asserts **exactly 2** shields.io badges, both **above** the first `# dsh-gsd`
heading, one linking `./LICENSE` and stating MIT, the other mentioning DSH. Adding a third
badge (a version/npm badge is the tempting one at 1.0) reds it. **Do not add badges.**

**The split — `:76-82`: zh half ends with `---`, en half starts at the second H1:**

```markdown
MIT，见 [LICENSE](./LICENSE)。含上游内容：GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。

---

# dsh-gsd

**GSD for DeepSeek Harness, one command away.**
```

Because `readmeZh = readme.slice(0, enStart)`, the `---` belongs to the **zh** half. A new
section added to zh must go before line 80; a new section for en must go after it.

**Where the overhead/watch paragraph sits.** The natural home is beside the existing status
section, which already talks about the upcoming release:

| Half | Section | Lines |
|---|---|---|
| zh | `## 当前状态` | `:64-66` |
| en | `## Status` | `:138-140` |

zh current text (`:66`):

```markdown
P0 spike 已全链路验证（2026-11-10，含守卫 hooks 阳性拦截）；首个正式版本随 Phase 5 在干净机器 8 项 UAT 通过后发布，届时一并开放 npm 首发、GitHub Release 与 dshmarket 收录（见 [ROADMAP](./.planning/ROADMAP.md)）。
```

This sentence becomes **false** the moment the phase lands (it says the release is pending). So
the same edit both (a) rewrites the status sentence and (b) adds the numbers. Two shapes are
safe:

- **Extend in place**: keep `## 当前状态` / `## Status` and add a short paragraph after the
  existing one. Zero structural risk.
- **Add a sibling `## 启动开销` / `## Startup overhead`**: also safe — **no test counts README
  `##` headings** (unlike MIGRATION, where ⑭ `:380-392` pins exactly 3 per half). This is the
  cleaner option for SC-3 because "overhead measured" deserves its own heading and the status
  sentence stays about status.

**What not to break while editing README** — the five README-pinning assertions:

| # | Pins | Line |
|---|---|---|
| ① | `Node ≥ 24` literal in **both** halves | `:43-44` |
| ② | `>=0.2.2-rc.1 <0.3.0-0` literal in both halves, count ≥2 | `:50-55` |
| ⑤ | no `dsh-gsd@latest` anywhere | `:98`, `:302-304` |
| ⑦ | `allow-version` in both halves | `:108-109` |
| ⑫ | naked install line `dsh plugin --profile web add dsh-gsd`, **trim-equal, exactly 1 per half**, byte-equal | `:264-305` |

⚠️ ⑫ is the trap for a numbers paragraph: any new code block that repeats the naked install
line (e.g. "install, then measure") breaks the per-half count of exactly 1. Numbers paragraphs
should contain **numbers and prose, not install commands**.

**Number discipline for the content itself** (`05-RESEARCH.md:531-533`, `05-VALIDATION.md:56`):
the honest headline is `≈0.33 s` added boot cost against a `10 ms` baseline, quoted **with**
the absolute beside the 33× ratio; wall-clock medians are *not* usable (LLM-dominated). Watch
behaviour is **UNMEASURED** — the README line must say "not measured" unless someone runs
`05-RESEARCH.md:544-547` method 2. `05-VALIDATION.md:92` records that the "reads correctly in
both languages" judgement is human-only.

---

### 8. `CHANGELOG.md` (docs, release-notes source)

**Analog:** itself. Format is Keep a Changelog 1.1.0 with a repo-specific preamble.

**Preamble + the release convention that D-06 leans on — `:1-5`:**

```markdown
# Changelog

本文件记录 dsh-gsd 所有值得注意的变更。
格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，版本方案为 `<gsd-ver>-<rev>.dsh<line>`。
发布约定：每个发布对应一个与版本串逐字相同的 git tag（如 `1.20.1-1.dsh022`，**不加 v 前缀**）；GitHub Release 的正文直接取本文件对应条目。本阶段只把条目成文，Release 本体随首次发布在 Phase 5 执行。
```

**Entry format — `:7-13`:**

```markdown
## [Unreleased]

## [1.20.1-1.dsh022] - 2026-11-12

### Added
- 72 个 `gsd-*` skills、GSD 1.20.1 引擎与生命周期守卫 hooks，作为一个 DSH 插件 bundle 分发。
```

Shape: `## [<version>] - <YYYY-MM-DD>`, then `### ` sections from the six-item closed set,
then `- ` bullets, one per line, Chinese, with backticked identifiers.

**Two hard constraints** (⑧, `docs-consistency.test.mjs:115-125`):

```js
  const m = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/m.exec(changelog)
  assert.ok(m, 'CHANGELOG.md 缺少 "## [<version>] - <YYYY-MM-DD>" 形态的首条目')
  assert.equal(m[1], pkg.version, 'CHANGELOG 首条目版本与 package.json.version 漂移')
  assert.equal(m[1], '1.20.1-1.dsh022')
  const heads = [...changelog.matchAll(/^### (.+)$/gm)].map((x) => x[1].trim())
  const bad = heads.filter((h) => !CHANGELOG_SECTIONS.includes(h))
  assert.deepEqual(bad, [], `CHANGELOG 出现非 Keep a Changelog 小节名: ${bad.join(', ')}`)
```

1. The **first** `## [` heading in file order must equal `pkg.version`. Because D-04 keeps
   the version at `1.20.1-1.dsh022`, **do not add a new version heading** — an added `## [1.0.0]`
   above the existing entry reds ⑧ twice (version mismatch + the `'1.20.1-1.dsh022'` literal
   at `:120`).
2. `### ` heads must be in `['Added','Changed','Deprecated','Removed','Fixed','Security']`
   (`:113`) — and the regex is `/^### (.+)$/gm` over the **whole file**, so any `### ` in a
   later entry counts too.

⇒ The correct 1.0 action is at most to **append bullets to the existing
`## [1.20.1-1.dsh022]` entry** (e.g. the `private` removal and the publish metadata), not to
open a new version. If the phase also wants an `## [Unreleased]` note, `:7` already exists and
is empty — safe to fill, since it is skipped by `/^## \[…\] - \d{4}-/m` (no date suffix).

**Release-notes extraction** (for `gh release create --notes-file`) — `05-RESEARCH.md:448-452`:

```bash
# strip the "## [<ver>] - <date>" heading line itself; keep the ### Added body
awk '/^## \[1\.20\.1-1\.dsh022\]/{f=1;next} f&&/^## \[/{exit} f' CHANGELOG.md \
  > /tmp/release-notes-1.20.1-1.dsh022.md
```

This works precisely because the entry is the **last** section and no `## [` follows it
(`:446`). Adding a new entry (or reordering) would change what this extracts — another reason
not to add one.

---

### 9. `docs/dshmarket/pfmiles__dsh-gsd.yml` (data, static PR payload)

**Analog:** itself. The file is already correct and **must be copied byte-for-byte** into the
PR. It is not edited this phase; it is *shipped*.

**Current content, verbatim, all 6 lines (`:1-6`):**

```yaml
url: https://github.com/pfmiles/dsh-gsd
name: pfmiles/dsh-gsd
category: workflow
description:
  en: 'GSD for DeepSeek Harness: a spec-driven coding workflow that ships 72 gsd-* skills, the GSD engine, and lifecycle guard hooks as one plugin bundle.'
  zh: '把 GSD 规格驱动编码工作流装进 DeepSeek Harness：72 个 gsd-* 技能、GSD 引擎与生命周期守卫钩子合为一个插件包。'
```

**Every field is already test-pinned** by ⑪ (`docs-consistency.test.mjs:217-262`). The
assertions that a "cleanup" would break:

```js
  const keys = [...entry.matchAll(/^([A-Za-z][\w-]*):/gm)].map((x) => x[1])
  assert.deepEqual(
    keys,
    ['url', 'name', 'category', 'description'],
    `顶层键应恰为 url/name/category/description 四项，实际 [${keys.join(', ')}]`,
  )
  assert.equal(keys.length, 4, `顶层键数量应恰 4，实际 ${keys.length}`)
  assert.ok(!/^icon:/m.test(entry), 'dshmarket 条目出现 icon 顶层键（目标仓 schema 无此字段，恒为宿主派生）')
```

plus: `category` in the 23-value closed set (`:241-245`, the set is enumerated at `:201-205`),
`description.en` ends with `.` and `description.zh` ends with `。` (`:259-261`), both
non-empty.

**The one field-level trap — single quotes must survive** (`05-RESEARCH.md:365`): both
descriptions contain `: ` (`Harness: a spec-driven`, `Harness：72 个` — the latter is a
full-width colon, so only `en` is at risk), and the target repo's rule requires quoting a value
containing `: `. Unquoted, YAML parses it as a nested key. **Do not "tidy" the quotes.**

**Related payload — `docs/dshmarket/README.md`** is read by ⑫ (`:269`, `:287-290`): the naked
install line must appear there ≥1 time and be byte-equal to README's copy. It is a Phase-3
submission asset, not part of the PR; do not edit it while preparing the PR.

**Byte-exactness note:** the same 6 lines must also appear as `data/plugins/pfmiles__dsh-gsd.yml`
in the target repo (`05-RESEARCH.md:326`). Since ⑪ pins the local file, "copy the local file" is
the whole procedure — do not hand-retype into the GitHub web editor.

---

## Shared Patterns

### S-1 — "Read the file as text at module scope, assert with a named scope prefix"

**Source:** `tests/docs-consistency.test.mjs:20-27`
**Apply to:** every new static assertion (§3, §6's non-build half)

```js
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
```

No YAML dependency anywhere in this repo — ⑪'s header comment at `:196-198` is explicit:
"零 YAML 依赖——catalog 条目走行级正则自检（`js-yaml` 有意不引入）". A new assertion over
`compat-matrix.yml` must use `includes()` / line regex, never a YAML parser.

### S-2 — "Every assertion carries a message that names the fix, not the symptom"

**Source:** `docs-consistency.test.mjs:104` (`'npm publish 前置：private: true 移除属 Phase 5 任务'`),
`:333` (`'… ⇒ 发布会落到本机默认只读镜像 …'`), `compat-matrix.test.mjs:122`
(`` `run step at line ${i + 1} is not gated by …` ``)
**Apply to:** all new assertions

The house style is `assert.<x>(actual, expected, '<what is wrong> ⇒ <what breaks>')`, with
actual values interpolated. When flipping ⑥ and ⑬, the *new* messages must explain the new
invariant (published state), not carry the old instruction forward.

### S-3 — "The three-site concurrency flag is a counted scan, never a green-suite inference"

**Source:** `05-VALIDATION.md:65` + `docs-consistency.test.mjs:271-274` (counted-scan idiom)
**Apply to:** D-10-1

Sites: `package.json:50` (`prepack`), `package.json:51` (`test`),
`.github/workflows/compat-matrix.yml:56` (full-test step). `grep -rn 'node --test'` finds
exactly these three and no fourth (`05-RESEARCH.md:686`). The assertion must read all three
strings and assert the flag on each — asserting "the suite passed" is the race itself.

### S-4 — "False-green channels are named in the test, not just avoided"

**Source:** `build-smoke.test.mjs:51-53` (deletes the wrapper before rebuilding "防 stale 文件
假绿"), `build-smoke.test.mjs:31-34` (probe-before-build so a missing prerequisite is a skip,
not a red)
**Apply to:** UAT harness + the post-rebuild `SKIP_DIRS` check

`05-RESEARCH.md:970` found six false-green channels. The repo's response pattern is: make the
test *delete or perturb the thing first*, so a passing test proves the mechanism ran. The UAT
harness's session predicate (4d) and the "assert the hook actually ran, and fail on
`validator disabled`" rule (F-03, `05-RESEARCH.md:639`) are the two places this must be applied.

### S-5 — "Tracked-source gate: never cite a gitignored mirror"

Verified for every path in this document:

```
package.json · .github/workflows/compat-matrix.yml · tests/{docs-consistency,build-smoke,
compat-matrix,pack-contents,rewrite-map,version}.test.mjs · tests/run-gates.sh · build.mjs ·
README.md · CHANGELOG.md · docs/dshmarket/pfmiles__dsh-gsd.yml · build/assets/*
```

all print under `git ls-files`. **The one exception is deliberate and quoted as a target, not a
source:** `gsd-core/bin/lib/ui-frontend-evidence.cjs` is gitignored (`.gitignore:5:gsd-core/`) —
its content is quoted in §6 only as the *thing to be overridden*, and the edit goes to
`build/assets/ui-frontend-evidence.cjs` (tracked). A plan that says "edit
`gsd-core/bin/lib/ui-frontend-evidence.cjs`" is wrong twice: untracked, and rebuilt.

### S-6 — "Never `npm test` until D-10-1 lands"

**Source:** `05-VALIDATION.md:30-31`, `05-RESEARCH.md:866`
**Apply to:** every verification command written into a plan, including the harness's own
follow-ups

Correct form for all plan-level commands:
`node --test --test-concurrency=1 tests/*.test.mjs`. `npm test` omits the flag and races
`build-smoke`'s rebuild — that race is a *publish blocker* through `prepack` (`package.json:50`).

---

## No Analog Found

| File | Role | Data Flow | Reason / what to use instead |
|---|---|---|---|
| `tests/uat-harness.test.mjs` (session-execution half) | test | subprocess + binary-record decode | No test in the repo spawns `dsh` or reads a `.jsonl.zstd` session. Use `05-RESEARCH.md:130-133` predicate (quoted §4d) + `build-smoke`'s spawn/skip/assert scaffolding (§4a). |
| UAT-04 commit-validator case | test | subprocess | Requires a repo state that does not exist (F-03: `hooks.community` absent → validator disabled). The plan must create the opt-in explicitly (scratch copy) or record the case as un-provable. |
| Skill-watch measurement | (any) | — | Structurally unobservable from a one-shot harness (`05-RESEARCH.md:542`); two no-sudo methods named at `:544-547`, otherwise "not measured". |

---

## Metadata

**Analog search scope:** repo root config (`package.json`, `build.mjs`, `README.md`,
`CHANGELOG.md`), `.github/workflows/`, `tests/`, `build/assets/`, `docs/dshmarket/`,
`.planning/phases/04-migration-coexistence/`
**Files scanned:** 22 (`git ls-files` + directory listings over the above)
**Pattern extraction date:** 2026-11-16
**Base commit:** `eeb9c24` (working tree; only untracked `.planning/phases/05-uat-1-0/*` differs)
**Safety:** read-only — no source file was modified, no `npm publish`, no `git push`, no
`gh release create`, no touching of the real `~/.dsh`, 3091 not restarted. Two `node -e`
probes were run to verify assertion semantics (F-01); both were pure in-memory `assert` calls.