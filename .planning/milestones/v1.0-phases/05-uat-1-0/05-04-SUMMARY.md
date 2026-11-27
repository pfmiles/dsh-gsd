---
phase: 05-uat-1-0
plan: 04
subsystem: migration-and-release-handoff
tags: [real-home-migration, uninstall, registry-channel-install, coexistence-g4, coexist-real, cb-8b, old-repo-crosslink, one-way-actions, stripped-bak-preserved]

# Dependency graph
requires:
  - phase: 05-uat-1-0
    provides: 05-01..05-03 的判据段 1–13（两条安装面、hooks 两向、UAT-05 机制段、启动开销、发布后 registry/Release/dshmarket）与 05-03 的 `PUBLISHED_VERSION`
provides:
  - 真实 `~/.dsh` 已迁到插件形态：旧源 `skills/gsd-*` = **0**、`web`/`headless` 各装上 `dsh-gsd@1.20.1-1.dsh022`（两 row 各 1、包内 72 技能 + 3587/3856 B）、`.stripped-bak` 两份保留
  - G-4 用「步骤 6 静态段四源 + CB-8b（`COEXIST-REAL`）五条合取」闭合，`MISSING:` 判红
  - 旧仓 `pfmiles/install-gsd-dsh` 远端 `main` 前进到 `3af3f27`，插入正文与 `docs/oldrepo-link/snippet.en.md` **逐字节相同**，只推 `README.md`
  - 3091 实例刷新到「插件自供 72 技能」（`gsdtest`），dogfooding 名副其实
  - 一条可重接锚点 `.continue-here.md`（重启前已在历史里）
affects: [05-verification, ship, gsd-p3-release]

# Actuals (#2632) — 同一 estimateTokens 口径（chars/4 over realized diff），不是 harness token 数
actuals:
  tokens: 18268
  tasks: 3
  commits: 8
  plan_head_before: 2316e9c541487b061d1c3e443bbf5a5f9f1227f2
  plan_head_after: 620f5a66f401be1a8719807ddc292a9c9ec2e7fa

tech-stack:
  added: []
  patterns:
    - "一次性不可逆动作的前置：产物先进 `git log --format= --name-only -- <path>`，再动机器（`--uninstall` 会 `rm -rf skills/gsd-*`、3091 重启会杀掉执行会话）"
    - "跨仓写入前先新鲜 clone（不用本机旧 clone），推送后从**远端**取字节（`gh api …/contents/<path>?ref=<sha>` 解码）做逐字节比较，本地 clone 只作第二条 `cmp`"
    - "无 EOF 换行的片段按**字节切片**比较（691 B 精确切片），不按行比较 —— 按行会因补一个换行而假红/假绿"
    - "授权范围外的事实只记录不修：`gsd-p3-release` 的 0 技能、`delete_repo` scope、`0.0.0-stage` 全部交回人"

key-files:
  created:
    - .planning/phases/05-uat-1-0/05-04-SUMMARY.md
  modified:
    - .planning/phases/05-uat-1-0/.continue-here.md
    - .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md
    - .planning/phases/05-uat-1-0/05-UAT.md
    - .planning/ROADMAP.md
    - .planning/STATE.md
    - .planning/REQUIREMENTS.md

key-decisions:
  - "顺序不可颠倒：`--uninstall` 与 3091 重启都在「.planning 产物已进历史」之后执行，三道闸同形态（`git status --porcelain` 为空 + `git diff --quiet HEAD -- <f>` + `<f>` 在 `git log --format= --name-only -- <f>` 里 ≥1 次），**从不**用 `git log -1`"
  - "旧仓推送只推 `README.md`：`snippet.zh.md` 备而不用（旧仓 CJK 推送前后均为 0）、`pr.md` 不推；插入用章节锚点（`---` 之后、`## Quick start` 之前）而不是行号"
  - "逐字节比较的对象是 `snippet.en.md`，不是 `docs/oldrepo-link/README.md`（后者是备料说明）；且取的是**远端**字节，不是本地 clone 的文件"
  - "人类只授权了「推 snippet.en.md」：不重配 `gsd-p3-release`、不删 `*.stripped-bak`、不把 `delete_repo` scope 收窄、不给 `0.0.0-stage` 打 deprecate —— 四项全部如实保留为开放项"
  - "UAT-06 不翻勾（沿用 05-03 的裁决）：技能 watch 仍是 `not measured`，量化记录半边不成立；且 05-04 的 `requirements` 只有 D-10-2/3/4，它并不是 UAT-06 的声明者（声明者是 05-02 与 05-03）"
  - "收尾闸的读数不回写证据册（与 §14 的 RUN #2/#3 同口径）：回写会再产生一次提交，把「交出推送许可前的最后一次闸」永久后移一格"

requirements-completed: [D-10-2, D-10-3, D-10-4]

coverage:
  - id: D1
    description: "3091 实例刷新：`gsdtest` 的插件是 CR-01 修复后形态（`skillsDir` = `<plugin>/skills`），重启后由插件自供 72 个技能、两 row 各 1"
    verification:
      - kind: manual_procedural
        ref: "05-UAT-EVIDENCE.md 判据段 13 §4（重装读数）与「刷新后」半段（新 pid、dump 两 row、provider 行）"
        status: pass
    human_judgment: false
  - id: D2
    description: "真实 `~/.dsh` 迁移完成：旧源为零、`web`/`headless` 各装 `dsh-gsd@$PUBLISHED_VERSION`、两 row 各 1、包内 72 技能与 3587/3856 B 对齐、`.stripped-bak` 保留"
    requirement: D-10-3
    verification:
      - kind: manual_procedural
        ref: "runbook 步骤 1–6 原样抽出执行；读数见 05-UAT-EVIDENCE.md 判据段 14 §2–§9"
        status: pass
    human_judgment: true
    rationale: "一次性不可逆的真实 home 变更（`--uninstall` 无条件 `rm -rf skills/gsd-*`）。判据是人核对过的集合/字节读数而非测试断言，且迁移暴露出授权范围外的 `gsd-p3-release` 0 技能事实，需要人裁决后续处置"
  - id: D3
    description: "G-4 闭合：步骤 6 静态段四源 row id 两两不相交且 `MISSING:` 0 行，`COEXIST-REAL PASS`（CB-8b 五条合取）"
    requirement: D-10-2
    verification:
      - kind: manual_procedural
        ref: "`docs/MIGRATION.md:246-273` 静态段 + `:308-353` `COEXIST-REAL` 原样抽出后执行；读数见 05-UAT-EVIDENCE.md 判据段 14 §10.1/§10.2"
        status: pass
    human_judgment: false
  - id: D4
    description: "旧仓互链已推送：远端 `main` 前进于 `41fcc7a`，插入正文与 `docs/oldrepo-link/snippet.en.md` 逐字节一致，`snippet.zh.md` 未推"
    requirement: D-10-4
    verification:
      - kind: other
        ref: "`gh api repos/pfmiles/install-gsd-dsh/commits/main --jq .sha`（`3af3f27f…`）+ `gh api …/contents/README.md?ref=3af3f27f` 解码后对 691 B 切片 `cmp`（IDENTICAL，sha256 `2ee9bde6…`）；见 05-UAT-EVIDENCE.md 判据段 14 §15"
        status: pass
    human_judgment: false

# Metrics
duration: ~14h 49m elapsed（含人类重启 3091 与会话中断的等待；不是 effort）
completed: 2026-11-26
status: complete
---

# Phase 05 Plan 04: 机器级收口（3091 刷新 / 真实 `~/.dsh` 迁移 + G-4 / 旧仓互链推送）Summary

**真实 `~/.dsh` 从旧脚本单源迁到插件单源（旧源 0、两 profile 各 1 插件 row、包内 72 技能），G-4 用静态段四源 + CB-8b 闭合，3091 刷新到插件自供技能，旧仓 `install-gsd-dsh` 的 `README.md` 拿到与 `snippet.en.md` 逐字节相同的互链段。**

## Performance

- **Duration:** ≈14h 49m elapsed（首个计划提交 2026-11-25T16:11:10Z → 收官 2026-11-26T07:00Z 左右；中间包含人类重启 3091 与两次会话中断的等待）
- **Started:** 2026-11-25T16:11:10Z（Task 1 首个提交；只读预检本身更早）
- **Completed:** 2026-11-26（UTC 2026-11-26T06:53Z 之后收官）
- **Tasks:** 3
- **Files modified:** 7（`05-UAT-EVIDENCE.md`、`05-UAT.md`、`.continue-here.md`、`ROADMAP.md`、`STATE.md`、`REQUIREMENTS.md`、本 SUMMARY）

## Accomplishments

1. **真实 `~/.dsh` 迁移完成（D-10-3）**：步骤 1 硬门本轮重跑 `GATE: PASS`（rc 0，`MIG_DECIDED_PROFILES="web headless gsdtest gsd-p3-release"`）→ 卸载前把 72 个旧技能目录备份到 `/tmp/dsh-legacy-skills-backup-20261126T043114Z` → `--uninstall`（退出码不作判据）→ 卸全局 CLI（`no gsd_run on PATH`）→ registry 通道给 `web` 与 `headless` 各装 `dsh-gsd@1.20.1-1.dsh022`（= 权威 registry `dist-tags.latest`，命令带 `--registry=https://registry.npmjs.org/`）。阴性对照 A–E 全成立（A **0**、B 三行 absent、C/D 无输出、E `PRESENT gsd-hooks-bridge=0`），两 row 各 **1**，包内 **72** + **3587 B** + **3856 B**，`.stripped-bak` **2 份保留**。
2. **G-4 闭合（D-10-2）**：静态段四源 row id 集合 `[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`，`pairwise-disjoint=true`、`MISSING:` **0 行**；CB-8b 的 `COEXIST-REAL PASS`（① stderr **0 B** ② `dsh-gsd` 在册、无 `required-absent:dsh-gsd` ③ 三 bundle listed ⇔ labeled ④ row 各 **1** ⑤ `uniq -d` **0**）。
3. **旧仓互链已推送（D-10-4）**：`41fcc7a → 3af3f27`（单亲快进），该提交只动 `README.md`（`+9/−0`）；远端 `README.md` 24346 B（= 23653 + 693），从**远端**字节切出的 691 B 与 `docs/oldrepo-link/snippet.en.md` **逐字节相同**（sha256 两侧均 `2ee9bde6…`），尾部 `\n\n## Quick start`。`snippet.zh.md` 与 `pr.md` 未推。
4. **3091 刷新仍成立**：`gsdtest` 在旧源被摘掉之后**仍由插件供 72 个技能** —— 这正是 D-11 把「刷新」排在「迁移」之前的全部理由：先刷新验证插件确实供技能，再删旧源才不会把会话弄成没技能。

## Task Commits

Task 1–3 的提交（逐个落账，三处提交闸各一次实测）：

1. **Task 1（只读预检 + 锚点骨架）** — `15ca7ae`、`fc2de93`、`99835e5`（docs）
2. **Task 2（3091 刷新）** — `7ff3418`、`eb041fd`、`aee42e5`（docs）
3. **Task 3（迁移 + G-4 + 闸）** — `2763d40`、`620f5a6`（docs）
4. **Task 3 第 8 步（旧仓推送）** — 无本仓提交：写的是**另一个仓**；读数落在判据段 14 **§15** 与本 SUMMARY

**本次 SUMMARY 落盘时 MEASURED**：`git rev-list --count 2316e9c..HEAD` = **8**（`plan_head_before = 2316e9c`、`plan_head_after = 620f5a6`）。紧随其后的收尾元数据提交是计划内的第 9 条（协议里 metadata commit 与 per-task commit 分开计）。

## Files Created/Modified

- `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` — 判据段 11–14；本轮新增 **§15（旧仓推送）**，并把 §13 的「不证明旧仓推送」按 2026-11-26T06:53:10Z 更正为「对写段仍成立、对终态已不成立」
- `.planning/phases/05-uat-1-0/05-UAT.md` — 新增 D-10-2/3/4 三行；D-10-4 本轮 `⚠ 未执行 → passed`（带新 sha 与逐字节读数）；开放项 8 标为已闭合
- `.planning/phases/05-uat-1-0/.continue-here.md` — 完整版重接锚点（重启前已进历史）
- `.planning/ROADMAP.md` — Phase 5 计划进度（`roadmap.update-plan-progress`）+ 05-04 `[x]`
- `.planning/STATE.md` — Current Position / Progress / Performance Metrics / Decisions / Session
- `.planning/REQUIREMENTS.md` — D-10-2 / D-10-3 / D-10-4 三行 `[x]`

## Decisions Made

- **不可逆动作前的秩序**是硬前提：产物先进入 `git log --format= --name-only -- <path>`，再动机器。三道闸同形态且都可重跑，**从不**用 `git log -1`（Task 2 的第 4/5 步只提交证据册，按「最后一次提交」判会把已提交的锚点判红）。
- **跨仓写入的取证方向**：推送前新鲜 clone（不信任本机旧 clone），推送后从**远端**取字节做逐字节比较；本地 clone 只作为第二条 `cmp`。比较对象明确是 `snippet.en.md`，不是 `docs/oldrepo-link/README.md`（后者是备料说明）。
- **按字节切片而不是按行**：`snippet.en.md` 无 EOF 换行（691 B / 8 行），按行比较会因补一个换行而假红或假绿。
- **严格守住人类授权的范围**：只推 `snippet.en.md` 进 `README.md`；不推 `snippet.zh.md`（旧仓 CJK 推送前后均 0）/ `pr.md`；不重配 `gsd-p3-release`；不删 `.stripped-bak`。

## Deviations from Plan

**记录性差异（非自动修复）**

1. **提交账本文件缺失，基址按首个计划提交的父提交重建** — `git rev-parse --git-dir` 下的 `gsd-plan-head-before-05-04` 从未被创建（与 03-xx 同样的遗漏），所以 `plan_head_before` 取 `15ca7ae^` = `2316e9c541487b061d1c3e443bbf5a5f9f1227f2`（05-03 的最后一个提交），而不是「计划开始时手写的一个值」。`commits: 8` 因此是**从可证事实重建**的读数，不是从账本读出的读数。
2. **`05-UAT.md` 的证据册指针行同步了一次** — 原行把「判据段 14」写成「真实 `~/.dsh` 迁移与 G-4」；§15 落在同一判据段内，指针改为「迁移、G-4 与旧仓互链推送」。只改这一处括注，不改编号。
3. **交付说明里「05-04 是 UAT-06 的第二个声明者」与文件事实不符** — `05-04-PLAN.md` 的 `requirements` 只有 `D-10-2/3/4`；`UAT-06` 的声明者是 `05-02` 与 `05-03`。这改变不了裁决（05-03 已按「技能 watch 仍 `not measured`」不翻勾），但记录在此以免后人按错的前提复核。

**Plan 明确指出、本次如实保留的未做项**（见下方开放项，没有一条被静默丢弃）：不重配 `gsd-p3-release`、不删 `*.stripped-bak`、不推 `snippet.zh.md`。

## Issues Encountered

- **`gsd_run` 不在 PATH 上**（全局 CLI 已在迁移步骤 3 卸掉）：本轮所有追踪动词改用插件内的 `…/node_modules/dsh-gsd/gsd-core/bin/gsd_run`。这是迁移的**预期后果**，不是缺陷。
- **旧仓推送首次即成功**，没有用到 `-c http.version=HTTP/1.1` 的有界重试（那只是 05-03 遇到 `Empty reply` / HTTP2 framing 时的回退手段）。

## Open Items（本 phase 结束时仍未闭合，**均不在本次授权范围内**）

1. **`gsd-p3-release` 提供 0 个 `gsd-*` 技能**（判据段 14 §8）：它的 `dsh.profile.bundles` 含 `dsh-gsd`，但 `index.js` 是 **CR-01 修复前**形态（`skillsDir = <profile>/node_modules/skills`，不存在），而 home 级旧源已被 `--uninstall` 归零 ⇒ 该 profile 此刻没有任何 `gsd-*` 来源。**未修**，因为它不在授权范围内（计划的 in-scope 集是 `web` + `headless`）。修复只需一条 `dsh plugin --profile gsd-p3-release add "dsh-gsd@1.20.1-1.dsh022" --registry=https://registry.npmjs.org/`，**交人裁决**。注意 `version` 串完全区分不出这件事（与 T-5-18 同一陷阱）。
2. **dshmarket PR #18793 的合并状态**（D-09，非阻塞）：D-09 的完成判据是「PR 已开 + 四检通过」，**不含合并**；合并交给对方 maintainer，本 phase 不等待。四检 ④ 的 `Build` 步收官时仍在跑。
3. **`dsh-gsd@0.0.0-stage` 未 deprecate**：npm staged publishing 在真版本被接受前落下的占位版本，不占 `latest`、不影响卡片命令，但会出现在版本列表里。按 D-05 同精神建议 `npm deprecate`（不 unpublish）—— **需 OTP，未执行**。
4. **`delete_repo` scope 仍在**（D-08 未做）：收窄需交互式浏览器 re-auth，`gh auth status` 原样清单已记入判据段 11。

**顺带保留的既有开放项**（本计划未触碰）：技能 watch 仍 `not measured`（UAT-06 因此不翻勾）；codegraph 的**同层合成**（真装三 bundle 的 `COEXIST-DRILL`）在真实 home 上仍无证据；本仓 commit 校验未 opt-in；registry 通道上的升级/回滚语义仍未测。

## User Setup Required

None - no external service configuration required.（人类已完成的两件事：`approved` 授权推旧仓；3091 重启。两者均有读数留痕。）

## Next Phase Readiness

- Phase 05 的四个计划全部有 SUMMARY；`D-10` 五件全部闭合（D-10-1 于 05-01、D-10-5 于 05-02、D-10-2/3/4 于本计划）。
- 收官前仍待：`/gsd-verify-work 05` 的 phase 级验证；开放项 1（`gsd-p3-release`）需要一次人类裁决，否则那个 profile 将长期没有 GSD 技能。
- 回退路径仍在：`profiles/*/cordis.patch.yml.stripped-bak` 两份**未删**；旧技能目录的内容另在 `/tmp/dsh-legacy-skills-backup-20261126T043114Z`（`/tmp` 备份不是正式回退路径）。

---

*Phase: 05-uat-1-0*
*Completed: 2026-11-26*

## Self-Check: PASSED

- 文件在盘：`05-04-SUMMARY.md` / `05-UAT-EVIDENCE.md` / `05-UAT.md` / `ROADMAP.md` / `STATE.md` / `REQUIREMENTS.md` —— 6/6 FOUND。
- 提交在历史：`15ca7ae` `fc2de93` `99835e5` `7ff3418` `eb041fd` `aee42e5` `2763d40` `620f5a6` —— 8/8 `git merge-base --is-ancestor … HEAD` FOUND。
- 判据段 14 §15 恰 1 处；远端 sha `3af3f27f5893fbf66950551fba8ddfc9427f1106` 在 `05-UAT.md` 与证据册各出现 1 次。
- `05-UAT.md` 的 D-10-4 行结论 = `passed`。
- STATE 算术：`completed_plans 18 / total_plans 18` → `percent 100`（`update-progress` 自报 `80`，已按算术手改，见 Issues）。
- ROADMAP Phase 5：`**Plans**: 4/4 plans executed`，Wave 4 的 05-04 为 `[x]`。
- 套件：`node --test --test-concurrency=1 tests/*.test.mjs` → `ℹ tests 47 / pass 40 / fail 0 / skipped 7`（exit 0），与 `BUILD.md:16` 一致，未改 `BUILD.md`。
- **未做的事（逐条确认）**：`*.stripped-bak` 两份仍在、未被删除；`gsd-p3-release` 未被重配；`snippet.zh.md` / `pr.md` 未被推；旧仓除 `README.md` 外零改动。