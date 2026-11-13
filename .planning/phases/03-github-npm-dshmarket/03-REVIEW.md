---
phase: 03-github-npm-dshmarket
reviewed: 2026-11-13T02:48:14Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - BUILD.md
  - tests/compat-matrix.test.mjs
  - tests/docs-consistency.test.mjs
  - tests/pack-contents.test.mjs
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 3: Code Review Report

**Reviewed:** 2026-11-13T02:48:14Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** clean

## Summary

**Scope is degraded, by construction.** The evaluation-scope resolver returned
`status: degraded / reason: no-task-commits-since` (no plan `SUMMARY.md` moved since the previous
review), so the review was widened to the phase-directory range and all four files were confirmed
present. This is a **DELTA re-review of a FIX round**, not a review of new feature work: the four
files were last touched by exactly four commits, each claiming to retire one previously-filed Info
finding.

The central question was not "did the deletions apply cleanly" but **"did each deletion lose
coverage"**. Each commit message was treated as an unverified assertion and independently falsified
against the artifacts. Result: **all four fixes are correct, complete, and lossless.** Every deleted
assertion is genuinely unreachable-false — it is entailed either by an assertion one or two lines
above it or (IN-06) by the doc's own historical context — and every mutation the deleted assertion
named in its failure message is still caught by a named `file:line` that remains in the suite.
Nothing was orphaned: no unused `const`, no import without a remaining consumer, no variable whose
only reader was the deleted line. The two near-miss traps called out in the task brief are in the
**correct** final state, and I proved by mutation that the broken alternative would have failed.

**No findings. Zero Critical, zero Warning, zero Info.** The suite is green at **37/37** (canonical
command, `--test-concurrency=1`, exit 0) on the restored tree, and `BUILD.md`'s cross-referenced
suite size (37) is the measured truth.

## Narrative Findings (AI reviewer)

No findings. The rest of this section records the adversarial verification that produced that
verdict, because "clean" here is a claim that must be reproducible rather than a shrug.

### Verification of each deletion (claim → independent re-derivation → mutation)

**IN-03 — `tests/compat-matrix.test.mjs` (commit `54edd58`, deleted the `!/^\s*#/` guard).**

- *Claim:* unreachable, because `GATE_RE` (`:136`) can only match a line whose first non-space
  character is `i` of `if`, so `gateLine` can never start with `#`.
- *Re-derived:* `gateIdx = y.slice(0, m.index).split('\n').length - 1` and `gateLine = lines[gateIdx]`
  (`:150-151`) make `gateLine` the line on which the anchored match begins. `GATE_RE` is
  `/^\s+if \[ … \]; then$/m`, i.e. the matched span begins at a line start with a whitespace run and
  then literally `if [`. Enumerated 13 adversarial inputs (gate commented with `# `, `#` without
  space, at column 0, comment-only file, trailing comment on the gate, duplicate gate, commented dup
  + real gate, CRLF, tabs, blank line before the gate, whitespace-only line before the gate): in
  **every input where `GATE_RE` matched**, `gateLine` began with whitespace+`if` or was an empty /
  whitespace-only string. `!/^\s*#/.test(gateLine)` was true in **13/13** matched cases — the
  assertion was unreachable-false, not merely unlikely.
- *Mutation:* commented out the real gate line (`:42`) → test ⑧ reddens at
  `tests/compat-matrix.test.mjs:145-149` (`canonical 门行缺失或非整行锚定 …`), i.e. the named
  mutation is still caught, one assertion *before* the deleted line. Restored via
  `git checkout -- .github/workflows/compat-matrix.yml`.
- *Orphans:* none. `gateIdx` is read at `:150`, `:175-176`, `:181`, `:192-203`; `gateLine` at `:174`
  (indent computation) and `:207-212` (degraded-form rejections). Both are load-bearing and were
  correctly retained.

**IN-04 — `tests/docs-consistency.test.mjs` (commit `9fed9cd`, deleted `dshBadges.length === 1`).**

- *Claim:* entailed by `:137` (`shieldBadges.length === 2`) + `:150` (`licenseBadges.length === 1`).
- *Re-derived:* `dshBadges` is a filter of `shieldBadges` that removes exactly one element (the
  licence badge). A 2-element array minus exactly one of its elements has 1 element. There is no
  reachable state in which both prior assertions pass and `dshBadges.length !== 1`. The assertion was
  third in a chain that could only ever be evaluated after its own precondition was proven.
- *Mutation, three shapes:* (a) delete the DSH badge line from `README.md:4` → red at
  `:137` (`README 应恰有 2 枚 shields.io 徽章 … 实际 1 枚`); (b) replace the DSH badge with an
  unrelated shields.io badge → red at `:157-160` (`第二枚徽章应是 DSH 徽章 …`); (c) replace the DSH
  badge with a second copy of the licence badge (so "badges besides the licence badge" would be 0) →
  red at `:150` (`应恰有 1 枚以 ./LICENSE 为链接目标的许可徽章，实际 2 枚`). All three mutations
  named by the deleted message remain detected; none of them reached the deleted line first.
  Restored via `git checkout -- README.md`.
- *Orphans:* none. `const dshBadges` (`:156`) survives and is still read at `:158-159`. **The trap
  was real and was avoided:** I ran the reverse mutation and also deleted `:156` — the literal
  `:156-157` reading of the previous review's fix block — and test ⑨ died with
  `ReferenceError: dshBadges is not defined`. The committed state (variable kept, only the assert
  removed) is the correct one; the "delete the variable too" variant would have broken the suite.

**IN-05 — `tests/pack-contents.test.mjs` (commit `4fae49d`, deleted `existsSync(printed)`).**

- *Claim:* unreachable, because `:232` asserts `printed === expected` and `expected` is the directory
  `:213` created with `mkdirSync`, removed only in the `finally` at `:238`.
- *Re-derived:* confirmed. Whenever the line was reached, `printed` equalled a path the test itself
  had just created; `assert.equal` throws on mismatch, so in every *product*-defect scenario the
  deleted line was never executed.
- *Mutation (product side, both CR-01 shapes):* (a) `pluginRoot = resolve(dirname(…), '..')` and
  (b) `pluginRoot = dirname(dirname(…))` → both redden at `tests/pack-contents.test.mjs:232-236`
  (`skillsDir 未落在包目录内：期望 …/node_modules/dsh-gsd/skills，实际 …/node_modules/skills`), one
  assertion **above** the deletion site. Restored via `git checkout -- index.js`.
- *Fixture-side probe (to bound the claim exactly):* with the `skills/` fixture mutated so `:213`
  creates only `installedRoot`, test ④ **passes** with the assertion deleted, and **fails** only when
  the deleted `assert.ok(existsSync(printed))` is re-added (`… 不存在（RE-ADDED PROBE）`). That is the
  precise statement of what was removed: its sole trigger was damage to the test's own fixture
  setup, not any mutation of a shippable artifact. No product-defect coverage was lost.
  Restored via `git checkout -- tests/pack-contents.test.mjs`.
- *Orphans:* none. `existsSync` (`:37`) is still consumed at `:106` and `:184`; `printed` is still
  read by the equality assertion.

**IN-06 — `BUILD.md:110` (commit `aacdbfa`, reworded the stale `7/7`).**

- *Claim:* the sentence now qualifies `7/7` as historical and points at §TL;DR for the current size.
- *Re-derived, all three legs:* (1) `7` is the *historical* truth — at `14ee71c`, the commit that
  introduced the sentence, `tests/` contained only `build-smoke.test.mjs` (1 case) +
  `rewrite-map.test.mjs` (6 cases) = **7**; (2) the pointer resolves — `BUILD.md:16` says
  *"预期 37/37"*, and the measured suite is **37** top-level `test()` cases (2+8+13+4+7+3), confirmed
  by the canonical run (`ℹ tests 37 / pass 37 / fail 0`); (3) the documented `prepack` contract still
  matches `package.json` verbatim (`node build.mjs && node --test tests/*.test.mjs`). The two numbers
  no longer contradict each other: one is explicitly time-boxed, the other is the live count and is
  accurate.
- *Adjacent claim re-verified:* `:110`'s "glob 形态在 Node 24.21.0 上实测全绿" holds today —
  37/37 on Node 24.21.0.

### Residual-coverage matrix (mutation → what still reddens)

| Mutation that used to be named by the deleted assertion | Still caught at |
| --- | --- |
| Gate line exists only as a YAML comment (IN-03) | `tests/compat-matrix.test.mjs:145-149` (`GATE_RE` returns null) |
| README loses the DSH badge (IN-04) | `tests/docs-consistency.test.mjs:137` |
| README grows a third shields.io badge (IN-04) | `tests/docs-consistency.test.mjs:137` |
| "badge besides the licence badge" is not the DSH one (IN-04) | `tests/docs-consistency.test.mjs:157-160` |
| Licence badge missing / duplicated (IN-04) | `tests/docs-consistency.test.mjs:150` |
| `pluginRoot` one level up — `resolve(…, '..')` (IN-05) | `tests/pack-contents.test.mjs:232-236` |
| `pluginRoot` one level up — `dirname(dirname(…))` (IN-05) | `tests/pack-contents.test.mjs:232-236` |

**No mutation goes undetected after this fix round.** Each row above was executed, observed red on the
cited line, and the artifact restored with `git checkout --`.

### Deletion-hygiene sweep

`git diff HEAD` on all four files is empty (the committed state is the state reviewed). `node --check`
passes on all three test files. A declared-but-never-read scan over every top-level and test-scope
`const` in the three test files reports **zero** unused declarations
(`compat-matrix` 27 declared / 0 unused; `docs-consistency` 47 / 0; `pack-contents` 26 / 0). No
import lost its last consumer: `existsSync` survives at `:106`/`:184`, `spawnSync`/`readFileSync`
untouched, `parseVersion` untouched.

### Observations considered and **not** scored

1. `tests/compat-matrix.test.mjs:135` still reads *"(4) 逐个拒绝已知退化形态（含「门只在注释里」）"*.
   After IN-03 the commented-out-gate shape is rejected by sub-item (1), not (4). The **property is
   still enforced** (proven by the mutation above) — only the attribution in the prose comment is now
   slightly loose. Cosmetic, no coverage gap, no fix required; recorded so the next reader is not
   surprised that the comment outlives its assertion.
2. The `gateIdx` computation yields an empty `gateLine` if a blank line is ever inserted directly
   above the canonical gate (`\s+` spans the newline). That is pre-existing, unrelated to this fix
   round, and cannot manifest in the current artifact; it is not a coverage gap. Noted only because I
   exercised that shape while proving IN-03 unreachable.

### Working-tree note (not a finding)

`git status --porcelain` was **already** ` M .planning/STATE.md` before this review began (GSD state
bookkeeping, untouched by me) — the brief's premise that the tree starts clean did not hold on
arrival. All four reviewed files are byte-identical to `HEAD`; every mutation I injected was restored
with `git checkout --` and the final `git status --porcelain` shows only that pre-existing
`.planning/STATE.md` entry. No source file was modified by this review; the only file written is this
report.

### Test-suite evidence

Canonical command only: `node --test --test-concurrency=1 tests/*.test.mjs` → `tests 37 / pass 37 /
fail 0`, exit 0, run twice (before and after the mutation battery) with identical results. `npm test`,
directory-argument invocations, standalone `node build.mjs`, and concurrent suites were avoided as
required.

---

_Reviewed: 2026-11-13T02:48:14Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_