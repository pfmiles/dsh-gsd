---
phase: 03-github-npm-dshmarket
fixed_at: 2026-11-12T17:47:40Z
review_path: .planning/phases/03-github-npm-dshmarket/03-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-11-12T17:47:40Z
**Source review:** `.planning/phases/03-github-npm-dshmarket/03-REVIEW.md`
**Iteration:** 1
**Scope:** `fix_scope: all` — the 4 Info findings (IN-03 … IN-06). No Critical, no Warning existed.

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

All four are "assertions that cannot fail" (IN-03/04/05) plus one stale doc count (IN-06), so each
entry below also records **the mutation the deleted assertion was supposed to catch, and what still
catches it** — that residual coverage is why these are `fixed` and not `fixed: requires human
verification`. No deleted assertion turned out to be the sole check for its named defect.

## Fixed Issues

### IN-03: ⑧ 的「门行只在注释里」断言不可能失败（GATE_RE 已蕴含该性质）

**Files modified:** `tests/compat-matrix.test.mjs`
**Commit:** `54edd58`
**Applied fix:** Deleted **only** line 152 (`assert.ok(!/^\s*#/.test(gateLine), …)`). Lines 150-151
(`gateIdx`, `gateLine`) were **kept** — the review's `Fix:` block proposes deleting the dead line, but
`gateLine` is load-bearing downstream (`:174` indent computation, `:207-212` degraded-form rejections)
and `gateIdx` at `:161`, `:176`, `:179-180`, `:192-193`, `:201-202`; removing them would cascade
into `ReferenceError`s.

**Mutation it was meant to catch:** the gate line exists only as a YAML comment
(`#   if [ "${{ matrix.expect }}" = "install-ok" ]; then`) — the gate is commented out and never runs,
i.e. "门被整行注释掉等于没有门".

**What still catches it:** two earlier assertions, both re-verified against the real artifact
(`.github/workflows/compat-matrix.yml:42`) with the mutation applied in memory:

- `:145` `assert.ok(m, 'canonical 门行缺失或非整行锚定…')` — `GATE_RE`
  (`/^\s+if \[ … \]; then$/m`) is line-start anchored, so `\s+` cannot span the `#`. With the gate
  commented out, `GATE_RE.exec(y)` returns `null` (probe: `GATE_RE match = null`) → red.
- `:157` `assert.equal(gateish.length, 1, …)` — the uniqueness filter (`/^\s*if\s+\[/`) equally
  excludes comment lines (probe: `gateish.length = 0`) → red.

The deleted line could not fire in the mutation it names: `gateLine` is *derived from* the successful
`GATE_RE` match, so when there is no match, `:145` throws before `m.index` at `:150` is ever
evaluated. (The only other shape — `\s+` spanning a newline — yields `gateLine === ''`, which
`/^\s*#/` does not match either.)

### IN-04: ⑨ 的「除许可徽章外应恰 1 枚」断言是恒真的

**Files modified:** `tests/docs-consistency.test.mjs`
**Commit:** `9fed9cd`
**Applied fix:** Deleted **only** line 157 (`assert.equal(dshBadges.length, 1, …)`). Line 156
(`const dshBadges = shieldBadges.filter((b) => b.i !== licenseBadges[0].i)`) was **kept** — it is
live at `:157-160` (`assert.match(dshBadges[0].l, /DSH/)`), so the review's literal `:156-157` would
have replaced an always-true assertion with a `ReferenceError`.

**Mutation it was meant to catch:** README grows a third shields.io badge, or loses the DSH badge —
i.e. "there is exactly one badge besides the licence badge".

**What still catches it:** `:137` (`shieldBadges.length === 2`) + `:150`
(`licenseBadges.length === 1`) jointly **entail** `dshBadges.length === 1`, because `dshBadges` is a
filter of `shieldBadges` with exactly one of its two elements removed. Probe over 1/2/3-badge
READMEs: the 1-badge and 3-badge mutations both redden `:137` first; at 2 badges the deleted
assertion evaluates `1 === 1`. It therefore could never be the first to redden — by construction,
not by luck. The DSH-specific requirement lives at `:157-160` (`/DSH/`), badge position at `:143-147`.

### IN-05: ④ 的 `existsSync(printed)` 在等值断言通过后恒真

**Files modified:** `tests/pack-contents.test.mjs`
**Commit:** `4fae49d`
**Applied fix:** Deleted lines 237-240 (`assert.ok(existsSync(printed), …)`). The `existsSync` import
at `:37` was **kept** — still used at `:106` and `:184`, so removing it would have been a new defect.

**Mutation it was meant to catch:** `skillsDir` resolves outside the package
(`node_modules/skills` instead of `node_modules/dsh-gsd/skills`) — the CR-01 regression, whose
consequence is "provider registers into a directory that does not exist / 72 skills never load".

**What still catches it:** `:232` `assert.equal(printed, expected)` where
`expected = join(installedRoot, 'skills')` — the very directory `:213` creates with `mkdirSync`
(removed only in `finally` at `:238`). Any "one level up" form prints a different path and reddens
`:232`, whose message already names the 72-skill consequence. When `:237` was reached,
`printed === expected` had just been asserted and `existsSync(expected)` was established by `:213`,
so the deleted line was unreachable-false. No replacement added, deliberately: the simulated
`skills/` is intentionally empty, so an "is not empty" variant would be wrong here, and a real-count
variant belongs to a different guard (and would false-red on a cold clone).

### IN-06: BUILD.md 的套件规模在两处自相矛盾（37/37 vs 实测 7/7）

**Files modified:** `BUILD.md`
**Commit:** `aacdbfa`
**Applied fix:** Took review option 1 (keep the provenance, qualify it as historical):

```
- …适配为 glob 形态，实测 7/7。
+ …适配为 glob 形态；glob 形态在 Node 24.21.0 上实测全绿——当时共 7 个用例，当前套件规模见 §TL;DR。
```

`§TL;DR` refers to `## TL;DR — 快速参考` (`BUILD.md:7`), which holds the authoritative 37/37 at
`BUILD.md:16`. Only `:110` changed; nothing else in the file was touched.

**Mutation it was meant to catch:** a stale suite-size claim — the build contract declaring two
different suite sizes (`:16` 37/37 vs `:110` 7/7) with no time qualifier, so a reader cannot tell
which is current.

**What still catches it:** no automated guard asserts BUILD.md's numbers, before or after this change
(`tests/docs-consistency.test.mjs` reads BUILD.md only for `dsh-gsd@` version specs, the legacy-encoding
sentinel and `dsh-gsd@latest`). The current figure is owned by `BUILD.md:16` and is mechanically
re-derivable: `tests/*.test.mjs` holds exactly 37 top-level cases, which the suite itself prints
(`pass 37`). The `7` is now explicitly scoped as a measurement of the then-7-case suite, so the two
statements no longer contradict each other.

## Skipped Issues

None.

## Verification

- **Baseline** before any edit: `node --test --test-concurrency=1 tests/*.test.mjs` → **37 pass / 0 fail**.
- **After each fix, before its commit:** same command → **37 pass / 0 fail**, every time. The count
  never moved off 37, which is the check that no `test()` block was damaged by the deletions.
- **Tier 1** (re-read the modified region, confirm surrounding code intact) passed for all four.
- **Tier 2 (`node -c`) not used:** these are ESM `.mjs` files and the checker does not support the
  type; per `<verification_strategy>` this falls back to Tier 1 + the full suite. `BUILD.md` is `.md`
  → Tier 3.
- **Deliberately not run:** `npm test` (slower `prepack`, does a real build), `node --test tests/`
  (directory arg fails on Node 24.21.0), `node build.mjs` standalone (dirties the tree;
  `build-smoke` invokes it internally), and never two suites concurrently.
- **Where verification ran:** the **main checkout**, on branch `main`. `workflow.use_worktrees` is
  `false` in `.planning/config.json`, so no isolated worktree was created (`wt="."`); the four fix
  commits are on `main` and the run is reproducible from it.

## Commits

| Finding | Commit | Files |
|---------|--------|-------|
| IN-03 | `54edd58` | `tests/compat-matrix.test.mjs` |
| IN-04 | `9fed9cd` | `tests/docs-consistency.test.mjs` |
| IN-05 | `4fae49d` | `tests/pack-contents.test.mjs` |
| IN-06 | `aacdbfa` | `BUILD.md` |

REVIEW-FIX.md itself is **not** committed — left for the orchestrator.

---

_Fixed: 2026-11-12T17:47:40Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_