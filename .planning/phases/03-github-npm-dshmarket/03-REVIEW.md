---
phase: 03-github-npm-dshmarket
reviewed: 2026-11-12T17:09:01Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - BUILD.md
  - index.js
  - tests/compat-matrix.test.mjs
  - tests/docs-consistency.test.mjs
  - tests/pack-contents.test.mjs
findings:
  critical: 0
  warning: 0
  info: 4
  total: 4
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-11-12T17:09:01Z
**Depth:** standard
**Files Reviewed:** 5
**Scope:** DELTA re-review of `386e80387dd517bee81ed5d621dcee6111313882..HEAD` (commit `49c0efe`)
**Status:** issues_found

## Summary

**Scope provenance: `degraded`.** The evaluation-scope resolver returned `status: degraded`,
`reason: no-task-commits-since` (no plan SUMMARY changed since the previous review), so it widened to
the phase-directory range. The resulting file set was confirmed present on disk and all 5 files were
read in full. Treat the scope as "this is what changed", not "this is everything the phase touched".

**CR-01 is genuinely fixed — verified, not accepted from the commit message.** Two independent checks:

1. *Real installed layout* — the layout on this machine is `<profile>/node_modules/dsh-gsd/index.js`
   with a 72-entry `skills/` sibling (`~/.dsh/profiles/gsd-p3-release/node_modules/dsh-gsd/`), i.e.
   exactly the two-level depth `pack-contents.test.mjs:211` simulates. `index.js:22`
   (`dirname(fileURLToPath(import.meta.url))`) resolves to the package directory itself.
2. *Evaluation of the two real lines in the simulated layout* (outside the test runner, in a throwaway
   `/tmp` tree — `node build.mjs` / `npm test` were not invoked): extraction of `index.js:22-23` plus a
   probe of `<tmp>/node_modules/dsh-gsd/index.js` prints `<tmp>/node_modules/dsh-gsd/skills`. The
   pre-fix form (`resolve(dirname(…), '..')`) prints `<tmp>/node_modules/skills` — i.e. it fails
   `pack-contents.test.mjs:232` by a directory, which is the CR-01 defect (0/72 skills).

The path contract now also *agrees across both consumers*: `cordis.patch.yml:23-24` computes the same
root via `dirname(require.resolve('dsh-gsd/package.json'))`, which was package root all along. The
`resolve` import was correctly dropped from `index.js:13`.

**`index.js` was reviewed for the first time in full (not only the changed line) — no findings.**
The parts that were previously unreviewed were checked against the installed dependency versions, not
assumed: `new FileSystemSkillProvider(ctx, control, {providerName, includeDefaultRoots,
customSkillDirs, watch})` matches the `0.2.2-rc.1` constructor and config keys; `ctx.skills.registerProvider(create)`
is called synchronously during `apply` as that API requires, and its internal
`layers.effect(this.ctx, …)` is fiber-bound through cordis's context tracker, so the ignored return
value does not leak a registration on unload; a generator is a valid `ctx.effect` body
(`Iterable<Disposable>`), and `ctx.effect` is registered after `registerProvider`, so teardown runs
"stop watching, then unregister" — the safe order. The static peer import
(`@deepseek-ai/dsh-skill-filesystem`, `peerDependencies` only, absent from the profile's
`node_modules`) is *not* a load failure: `dsh-app-boot` wraps Node's ESM and CJS resolvers to supply
installation-carried packages to bundle imports (`lib/index.js:2567-2719` of the host), and the
profile's `.modules.yaml` confirms only `dependencies` are hoisted.

**The four tightened guards: each one will redden on the defect it names.** Verified by tracing every
assertion against the artifact it asserts over (the suite itself was not executed — prohibited here):

| Guard | Mutation that must redden | Reddens? |
|-------|---------------------------|----------|
| ① `pack-contents:145-154` | drop `index.js` / `cordis.patch.yml` / `locale` / `skills` / `gsd-core` / `hooks` / `config` / `scripts` / `icon.svg` from `files` | yes — `missing` is non-empty (`package.json`/`README.md`/`LICENSE` are excluded as npm-unconditional) |
| ⑨ `docs-consistency:130-161` | delete the DSH badge; add a 3rd shields badge; move both badges below the first `# dsh-gsd` | yes — count 2, position, and per-badge link/alt assertions are all live at `README.md:3-4` vs heading `:6` |
| ⑫ `docs-consistency:276-287` | delete the en line; duplicate zh and delete en (keeps total at 2) | yes — per-half 1/1 replaces the 2/0-blind total check (`README.md:27` zh, `:100` en) |
| ⑧ `compat-matrix:136-222` | revert to `\|\|` / `!=` / `&&` / brace form; comment-only gate; drop the closing `fi`; move `exit 2` or the resolve assert out of the gate | yes — the whole-line anchor `GATE_RE` (`:136`) rejects every variant; artifact is `compat-matrix.yml:42-49` |

**No Critical and no Warning findings.** The four Info items below are *sub-assertions that cannot
fail* and one stale count — the guards themselves still work, so none of them blocks release and no
re-fix round is required. Finding IDs continue from the prior review (`IN-02`) rather than restarting
at `IN-01`: `03-REVIEW-DISPOSITION.md` records that reusing an id silently drops that id's existing
disposition row.

**Environment observation (not a finding, outside `files_reviewed_list`):** both installed snapshots
on this machine still contain the *pre-fix* `index.js:22`
(`~/.dsh/profiles/{gsd-p3-release,gsdtest}/node_modules/dsh-gsd/index.js`). That is expected —
`file:` installs are frozen packed snapshots — and `BUILD.md:154-162` §⑧ step 2 already requires
re-adding before re-verifying. It does mean any "72 skills load" claim made against these two profiles
predates the fix and cannot serve as evidence for it.

## Info

### IN-03: ⑧ 的「门行只在注释里」断言不可能失败（GATE_RE 已蕴含该性质）

**File:** `tests/compat-matrix.test.mjs:152`
**Issue:** `assert.ok(!/^\s*#/.test(gateLine), '门行只出现在注释里…')` cannot fail. `GATE_RE`
(`:136`) is `/^\s+if \[ … \]; then$/m`, so a match can only begin at a line start whose characters up
to `if` are *all* whitespace — `gateLine` therefore always starts with whitespace followed by `if`.
The one other shape is a match that begins on a blank line because `\s+` spans the newline, which
yields `gateLine === ''`. `/^\s*#/` matches neither. The mutation it names is already caught one
assert earlier, by `GATE_RE.exec` returning `null` at `:144-149`; this line is dead code with a
diagnostic no reader can ever trigger.
**Fix:** delete line 152. If the comment-case deserves its own message, anchor it on the whole file
instead of the already-anchored gate line:
```js
assert.ok(
  !/^\s*#\s*if\s+\[.*matrix\.expect/m.test(y),
  'matrix.expect 门行只出现在注释里——门被整行注释掉等于没有门',
)
```

### IN-04: ⑨ 的「除许可徽章外应恰 1 枚」断言是恒真的

**File:** `tests/docs-consistency.test.mjs:156-157`
**Issue:** `assert.equal(dshBadges.length, 1, …)` cannot fail. `licenseBadges` is filtered *from*
`shieldBadges` (`:149`), and by the time `:157` runs, `:137` has already asserted
`shieldBadges.length === 2` and `:150` has asserted `licenseBadges.length === 1`. A 2-element array
minus exactly one of its elements is 1 element — no mutation of `README.md` can make this red. The
intent the message states is already enforced by `:137` + `:150`; the assertion that actually carries
the DSH-badge requirement is `:158-161`.
**Fix:** delete `:156-157` and keep `:158-161`. If the intent was positional (the DSH badge is the
badge directly below the licence badge, as in `README.md:3-4`), assert that instead:
```js
assert.equal(shieldBadges[1].i, licenseBadges[0].i + 1, 'DSH 徽章应紧邻许可徽章')
```

### IN-05: ④ 的 `existsSync(printed)` 在等值断言通过后恒真

**File:** `tests/pack-contents.test.mjs:237-240`
**Issue:** `assert.ok(existsSync(printed), '…provider 会注册到空目录…')` cannot fail. `:232` has
already asserted `printed === expected`, and `expected` is `join(installedRoot, 'skills')` — a
directory that `:213` created with `mkdirSync` (removed only in the `finally` at `:242`). So whenever
this line is reached, the path provably exists. The failure it describes ("provider 注册到不存在的
目录") is caught by the equality assert one line above, which is the assertion that actually reddens
when CR-01 is reintroduced.
**Fix:** delete `:237-240`. No replacement is warranted: an "is not empty" variant would be wrong here
because the simulated `skills/` is intentionally empty, and a real-count variant belongs to a
different guard (and would false-red on a cold clone).

### IN-06: BUILD.md 的套件规模在两处自相矛盾（37/37 vs 实测 7/7）

**File:** `BUILD.md:110`
**Issue:** `:16` was updated by this delta to *"预期 37/37"* (verified: `tests/*.test.mjs` holds exactly
37 top-level `test()` cases — 2+8+13+4+7+3 — so `:16` is correct; the draft's `1+8+13+4+6+3` summed
to 35 because it reused `14ee71c`-era counts for `build-smoke` (now 2) and `rewrite-map` (now 7) —
i.e. this finding's own evidence line briefly reproduced the staleness it reports; corrected above,
conclusion unchanged), but `:110` still says
*"适配为 glob 形态，实测 7/7"* with no time qualifier. That 7/7 is a real measurement of a *different
suite size*: at `14ee71c` (the commit that introduced the sentence) `tests/` held only
`build-smoke.test.mjs` (1 case) and `rewrite-map.test.mjs` (6 cases). A reader of the doc that declares
itself the build contract sees two different suite sizes in the same file and cannot tell which is
current.
**Fix:** either qualify it as historical, or drop the number:
```markdown
# 选项 1（保留出处）
…适配为 glob 形态；glob 形态在 Node 24.21.0 上实测全绿（当时共 7 个用例，当前规模见 §TL;DR）
# 选项 2（删数字）
…适配为 glob 形态，实测全绿。
```

---

_Reviewed: 2026-11-12T17:09:01Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_