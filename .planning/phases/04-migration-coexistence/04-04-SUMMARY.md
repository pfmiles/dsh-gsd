---
phase: 04-migration-coexistence
plan: 04
subsystem: docs
tags: [coexistence, mig-04, set-assertion, row-id, dump-config, temp-dsh-home, supply-chain-gate, approval-record, version-drift, bilingual-docs]

# Dependency graph
requires:
  - phase: 04-migration-coexistence
    plan: 01
    provides: "DRILL-1 校准出的 dump 判据形态（同一 home 的 `H0`/`H1` 前后关系 + 逐 bundle 标签出现 + stderr 字节数）与 `mktemp -d` 隔离头；本计划的动态段直接照它写，实测基线同为 24 标头 / 1243 行"
  - phase: 04-migration-coexistence
    plan: 02
    provides: "`docs/MIGRATION.md` §② 的收尾位置与「§① 0-A / 0-B 两个场」的块体例；本计划的步骤 6 沿用同一隔离头惯例"
  - phase: 04-migration-coexistence
    plan: 03
    provides: "`tests/docs-consistency.test.mjs` 的 ⑭（围栏感知：两半各恰 3 个 `##`）与全量 38 条基线；本计划只加 `###`，⑭ 零改动仍 14/14"
  - phase: 02-compat-matrix
    provides: "`engines.dsh` 兼容门与 dump 的 bundle 级跳过形态（`EXIT=0` 假绿），是「exit code 不作判据」这条纪律的来源"
provides:
  - "`docs/MIGRATION.md` §① 的两半各一个步骤 6（zh `### 步骤 6 — 并存自检` / en `### Step 6 — coexistence self-check`）：CB-7 静态比对 + CB-8 动态四条合取 + 两句反例 + 边界声明"
  - "`04-DRILL-EVIDENCE.md` 的 DRILL-3 段：静态四来源五 id、动态 bundles=5 / headers 24→27 / stderr 0 / 四 id 各 1 / `uniq -d` 空、逐字 `COEXIST-DRILL` 汇总行、三条局限"
  - "包合法性门的人审留痕：`APPROVAL: approved 2026-11-14T06:17:59Z`（最后一条生效）+ registry 版本漂移记录（latest 已到 0.24.2 / 1.73.19）"
  - "MIG-04 的可判定定义：`uniq -d` 为空 + 期望 id 各恰 1 + stderr 0 字节 + 同一 home 的标头 `H1 > H0` 且逐 bundle 标签出现——四条合取，exit code 永不作判据"
affects: [05-end-to-end-uat]

# Actuals (#2632) — 与 PLAN 的 estimate 配对，同一尺度（chars/4 over realized diff）
actuals:
  tokens: 6171
  tasks: 2
  commits: 2
  plan_head_before: 98a80f306d11ca5ca54552705875a1a46e32c89b
  plan_head_after: 19af44af275b850f3f8a4278e6ad17db6e18b9d7

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "「无冲突」= 四条集合/内容判据的合取（stderr 0 字节 + 同一 home 的 `H1 > H0` 且逐 bundle 标签出现 + 期望 id 各恰 1 + `uniq -d` 为空）；exit code 与「装上了没报错」被明确排除"
    - "两段式证明：静态段（零安装、只 `fs.readFileSync`）只证行级 id 不相交；动态段（一次性 `DSH_HOME` 真装）才证同层合成。两段各写「证不了什么」，不许合并成一句「已验证并存」"
    - "供应链门的自动重跑形态：把 blocking-human 的裁决写成证据册里的一条 `APPROVAL:` 行，演练块以 `grep … | tail -n 1` 为准（后来的 `hold` 能推翻先前的 `approved`，T-4-19）；缺行即报红且不装任何包"
    - "「记录 → 确认」两步：演练块第一次跑只红在「证据册未记录本次运行」，把打印出的汇总行逐字粘进 DRILL-3 后复跑才 PASS——数字只能来自现场"
    - "标头 27 ≠ bundles 5 是健康态：标头按连续来源段打，`27 = 24 + 3` 恰对应新装的三个 bundle 各开一段（T-4-17 的伪不变量再次被实测钉住）"

key-files:
  created:
    - .planning/phases/04-migration-coexistence/04-04-SUMMARY.md
  modified:
    - docs/MIGRATION.md
    - .planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md

key-decisions:
  - "版本漂移如实记账：人审批准并钉住的是 `dsh-deja@0.24.0` / `dshmarket@1.73.15`，但复核时 registry 的 `dist-tags.latest` 已是 `0.24.2` / `1.73.19`——「too-new」这条 SUS 依据相对 latest 已部分过时，证据册与 SUMMARY 都写明，不把 RESEARCH 快照当当前值"
  - "动态段的四条判据一个都不放宽：stderr 0 字节、同一 home 的 `H1 > H0` 且三个包的标头标签各出现、四个期望 id 各恰 1、`uniq -d` 为空；`dump exit=0` 只记录、明确标注不作判据"
  - "步骤 6 的位置与形态：zh 插在「步骤 5 — 复验」之后 /「回退」之前，en 插在 Step 5 之后 / Rollback 之前——两半的 `##` 仍是 3，⑭ 无需改动即可继续挡「只写一半」"
  - "证据册的 `APPROVAL:` 行由演练块以「最后一条」为准（`tail -n 1`），因此改判只在文件末尾追加、绝不编辑旧行；这条追加规则同时写进证据册与（Task 1 的）验收"
  - "第三轮复跑是刻意的：前两轮证明「记录→确认」闭环，第三轮在文档与证据册定稿后再跑一次仍是 PASS，确保通过形态落在最终树上"

patterns-established:
  - "集合断言优先于行为断言：`uniq -d` 空 + 逐 id 计数 + 逐 bundle 标签「存在」+ stderr 字节数，四者皆可逐字复核；任何「能装能跑」式判据在静默双行的场景下都恒真"
  - "同一 home 的标头前后关系可以跨 bundle 数扩张：模板 profile 24 → 加三个 bundle 27（每次 +1 来源段），而与 `dsh.profile.bundles` 长度无关"
  - "运行时演练的隔离与留痕：`mktemp -d /tmp/dsh-coex-XXXXXX` + 真实 `~/.dsh` 前后 `diff -q`（profiles 清单 + 各 package.json 的 mtime/size）+ `find -newermt` 命中 0"

requirements-completed: [MIG-04]

# Coverage metadata (#1602) — 每个交付物一条，驱动 verify-work 的确定性 UAT 路由
coverage:
  - id: D1
    description: "`docs/MIGRATION.md` §① 两半的步骤 6：zh `### 步骤 6 — 并存自检` / en `### Step 6 — coexistence self-check`，含静态比对命令、动态四条判据、两句反例（不认 exit code / 不把标头数当 bundles 数）与边界声明"
    requirement: MIG-04
    verification:
      - kind: unit
        ref: "04-04 Task 2 <automated> 步骤 6 结构门 → `step-6 ok`；`node --test tests/docs-consistency.test.mjs` ⑭ → tests 14 / pass 14"
        status: pass
    human_judgment: false
  - id: D2
    description: "静态段：本仓 `cordis.patch.yml` + 本机已装的 `@jiangzhenguo/dsh-codegraph` / `dsh-deja` / `dshmarket` 四个 patch 文件，五个 row id（gsd / gsd-hooks-bridge / dsh-codegraph / deja / dsh-market）两两不相交、并集恰 5"
    requirement: MIG-04
    verification:
      - kind: unit
        ref: "04-04 Task 2 <automated> node -e 静态门 → `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`（exit 0）"
        status: pass
    human_judgment: false
  - id: D3
    description: "动态段：一次性 `DSH_HOME` 里真装 `dsh-deja@0.24.0` + `dshmarket@1.73.15` + 本仓 tarball，同层合成成立——bundles=5、stderr 0 B、headers 24→27、三个包标头标签各出现、四 id 各恰 1、`uniq -d` 为空"
    requirement: MIG-04
    verification:
      - kind: integration
        ref: "04-04 Task 2 <automated> bash 块（三轮：RUN1 仅红在「证据册未记录本次运行」、RUN2/RUN3 `COEXIST-DRILL PASS`），末行 `COEXIST-DRILL bundles=5 headers=24->27 rows=gsd,gsd-hooks-bridge,deja,dsh-market env=temp-home`"
        status: pass
    human_judgment: false
  - id: D4
    description: "`04-DRILL-EVIDENCE.md` 的 DRILL-3：静态四来源五 id、动态逐项读数与逐字汇总行、豁免扫描 0、「这证不了什么」三条局限（codegraph 未动态安装 / 解析级未触发 / 临时 profile ≠ 真实依赖图）、真实 home 零写入与收尾"
    requirement: MIG-04
    verification:
      - kind: unit
        ref: "04-04 Task 2 <automated> 证据门 → `drill-3-evidence ok`；真实 `~/.dsh` 前后 `diff -q`（profiles 清单 / package.json mtime+size）无差异、`find -newermt` 命中 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "供应链门被完整走完且留痕：两个 `[SUS]` 包的安装发生在 blocking-human 人审之后（`APPROVAL: approved 2026-11-14T06:17:59Z`），registry 版本漂移被如实记录，演练全程 `--force` / `allow-version` / `Exact-version exemption` 计数为 0"
    requirement: MIG-04
    verification: []
    human_judgment: true
    rationale: "门本身是人的判断（发布者 / 源码仓 / 确切版本 / 无 postinstall 的页面级复核，npmjs 对自动抓取返回 403 由人完成）；机器只能证明裁决行在场、门在自动重跑时生效、以及漂移与零豁免被记录，证不了「人当时看到的信息是否足以支撑这个裁决」。"

# Metrics
duration: 5 min
completed: 2026-11-14
status: complete
---

# Phase 4 Plan 4: 并存判据两段式与步骤 6 Summary

**MIG-04 从「能装能跑」改写成四条集合判据并在一次性 `DSH_HOME` 里真跑：静态段在真实已装物上证明四个 bundle 的五个 row id 两两不相交（`coexist-static ok`），动态段真装 `dsh-deja@0.24.0` + `dshmarket@1.73.15` + 本仓 tarball 后得到 `bundles=5 / stderr 0 B / headers 24→27 / 四个 id 各恰 1 / uniq -d 空` 并以 `COEXIST-DRILL PASS` 收尾；`@jiangzhenguo/dsh-codegraph` 未被动态安装这一缺口，与另两条局限一起写进文档与证据册，交给 Phase 5。**

## Performance

- **Duration:** 5 min（实际执行窗口；Task 1 的 blocking-human 人审时间不计入——裁决在我开工前已由人给出）
- **Started:** 2026-11-14T06:17:59Z
- **Completed:** 2026-11-14T06:23:16Z
- **Tasks:** 2 / 2
- **Files modified:** 2（`docs/MIGRATION.md` 纯追加 118 行；`04-DRILL-EVIDENCE.md` 追加 76 行）
- **Commits:** 2（measured `git rev-list --count 98a80f3..19af44a`，ledger `gsd-plan-head-before-04-04`）

## Accomplishments

- **Task 1 的包合法性门走完并留痕**：人审裁决为 `approved`，证据册新增一节记录「两个 `[SUS]` 包的在用版本 / `postinstall` / 源码仓」复核读数，并把裁决写成一行 **`APPROVAL: approved 2026-11-14T06:17:59Z`**（文件最后一条生效；改判只在末尾追加，T-4-19）。
- **版本漂移被如实登记，而不是让 RESEARCH 快照冒充当前值**：复核 `registry.npmmirror.com` 时 `dsh-deja` 的 `dist-tags.latest` 已是 **0.24.2**、`dshmarket` 已是 **1.73.19**（`04-RESEARCH.md` 记的是 0.24.0 / 1.73.15）。演练仍**刻意钉住人审批准的确切版本**，两者都在 `versions` 列表内可解析；「too-new」这条 SUS 依据相对 latest 已部分过时，这一点写进了证据册与本节。
- **MIG-04 的静态面（零安装、零网络、零写入）成立**：只 `fs.readFileSync` 读四个 patch 文件，输出 `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`——并集恰 5 个 id、四路两两不相交；**未对真实 profile 跑 `--dump-config`**（它会重写 `<profile>/cordis.yml`）。
- **MIG-04 的动态面（真装、同层合成）成立**：一次性 home 里依次 `add dsh-deja@0.24.0`（`+ dsh-deja 0.24.0`）、`add dshmarket@1.73.15`（`+ dshmarket 1.73.15`）、`add "$PWD/<tgz>"`（`+ dsh-gsd 1.20.1-1.dsh022`）后——`dsh.profile.bundles` 5 项；**①** `stderr_bytes=0`；**②** `headers 24 -> 27`（`H0` 24 / `H1` 27，`H1 > H0`）且 `dsh-gsd` / `dsh-deja` / `dshmarket` 三个标头标签各出现 1 次；**③** `row gsd x1` / `row gsd-hooks-bridge x1` / `row deja x1` / `row dsh-market x1`；**④** 这四者上 `uniq -d` 输出 0 行。汇总行逐字：`COEXIST-DRILL bundles=5 headers=24->27 rows=gsd,gsd-hooks-bridge,deja,dsh-market env=temp-home`。
- **「exit code 不作判据」被写死**：`dump exit=0`（`EXIT=0`）在证据册里被记录并明确标注「只作记录，永不作通过信号」——有 bundle 被跳过时它同样是 0。文档两半各有一句同义反例。
- **T-4-17 的伪不变量再次被实测钉住**：`headers=27` 而 `bundles=5`，且 2-bundle 的模板 profile 就已经打出 24 个标头；`27 = 24 + 3` 恰对应新装三个 bundle 各开一个来源段。正确判据是「同一 home 的 `H1 > H0`」+「逐 bundle 标签出现」+「row id 集合」。
- **缺口被显式交接，而不是留白**：`@jiangzhenguo/dsh-codegraph` 的 spec 是 `github:jiangzhenguo/dsh-codegraph#main`（冻结不了确切版本），本计划不装它，因此其并存**只有行级证据**；另记「解析级（pnpm ERESOLVE）在本组合上未触发不代表换组包不会触发」与「临时 profile ≠ 用户真实依赖图」。这三条同时进文档与证据册。
- **真实 `~/.dsh` 零写入（强形态）**：静态段只读；动态段三次运行的临时 home（`/tmp/dsh-coex-cj6ISM`、`lUOWCh`、`LzH9RA`）与仓根 tarball 全部删除；真实 home 的 `profiles` 清单与各 `profiles/*/package.json` 的 mtime+size `diff -q` 均无差异，且 `find ~/.dsh -newermt 2026-11-14T06:17:00Z` 命中 **0** 项。
- **计数与守卫零变化**：`docs-consistency` 仍 **14/14**（⑭ 未被改动，因为新内容全是 `###`，两半 `##` 仍各 3）、全量串行仍 **38/38 fail 0**、`package.json` / `BUILD.md` / `tests/` 对 plan base **零 diff**。

## Task Commits

Each task was committed atomically:

1. **Task 1: 包合法性门 —— 记录人审 `approved` 与 registry 版本漂移** - `f042158` (docs)
2. **Task 2: 并存判据两段式 + 步骤 6 入文档 + DRILL-3** - `19af44a` (docs)

**Plan metadata:** 与本次 SUMMARY 同提交（`docs(04-04): complete 并存判据两段式与步骤 6 plan`，含 STATE/ROADMAP/REQUIREMENTS）

_Note: 本计划无 TDD 任务；Task 1 是已在编排层被回答的 `checkpoint:human-verify gate="blocking-human"`（不是跳过），其产物就是那行 `APPROVAL:` 与本节记录的漂移。_

## Files Created/Modified

- `docs/MIGRATION.md`（改，`+118 / −0` 行；46452 B → 585 行，文件末尾仍无换行）— §① 两半各新增一个步骤 6：zh `### 步骤 6 — 并存自检` / en `### Step 6 — coexistence self-check`，位置在「步骤 5 — 复验」之后、「回退」之前（en：Step 5 之后、Rollback 之前）。内容 = CB-7 静态比对（一条可粘贴的 `node -e`，指明读哪四个文件）+ CB-8 动态四条判据（`wc -c` 的 stderr、`H0`/`H1` 标头前后关系与逐 bundle 标签、逐 id 计数、`uniq -d`）+ 两句反例 + 边界声明（zh 含 `不能证明` / en 含 `does not prove`，两半都点名 `codegraph`）。§① 的步骤 0–5、「回退」小节、§②、§③ 一个字节未改（base 467 行按序全保留）。
- `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`（改，`+76 / −1` 行）— 新增 `## 包合法性门裁决（Task 1，blocking-human）`（复核读数表 + 人工裁决 + 版本漂移 + `APPROVAL:` 行）与 `## DRILL-3 — 并存判据（两段式）`（静态四来源五 id 表、动态十二项读数表、两次/三次运行的关系、豁免扫描、三条局限）。

## Decisions Made

- **版本漂移按事实记账**：人审批准的是 0.24.0 / 1.73.15，而 latest 已是 0.24.2 / 1.73.19。演练钉住批准过的确切版本（可解析、可审计），同时把漂移写成一行显式记录——不把 `04-RESEARCH.md` 的判定当当前值引用。
- **动态段四条判据一条不放宽**：`stderr` 0 字节、`H1 > H0` 且逐 bundle 标签出现、四个 id 各恰 1、`uniq -d` 为空。`dump exit=0` 只记录并标注不作判据——这正是「同名 row id 静默双行 / bundle 被静默跳过」两种假绿的封堵口。
- **步骤 6 的落位选在「步骤 5」与「回退」之间**：它是复验的延伸而不是新阶段；两半的 `##` 因此仍是 3，⑭ 无需改动即继续挡「只写一半」，避免为了加一节而改守卫（改守卫会让 ⑭ 的既有语义变宽）。
- **演练走「记录 → 确认」两步，并额外跑第三轮**：第一轮红在「证据册未记录本次运行」（不是失败，是设计要求），把现场打印的汇总行逐字粘进 DRILL-3 后第二轮 PASS；文档与证据册定稿后再跑第三轮仍 PASS，确保通过形态落在最终树上。
- **静态段绝不对真实 profile 跑 `--dump-config`**：它至少会重写 `<profile>/cordis.yml`，`web` 是用户正在用的 profile。静态段只用 `fs.readFileSync` 读四个 patch 文件；这条纪律同时是 prohibitions 里的一条。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 证据册无文件末尾换行，两次追加各记 1 行「删除」**
- **Found during:** Task 1（`git show --numstat` 复核）与 Task 2（同一文件再次追加）
- **Issue:** `04-DRILL-EVIDENCE.md` 在 HEAD 上末行没有换行符。在末行之后追加内容必然改变该行的「EOF 无换行」标记，git 把末行原样重发射一次并记成 1 行删除：Task 1 是 `20 1`（重发射 DRILL-2 的边界行），Task 2 是 `57 1`（重发射那行 `APPROVAL:`）。**与 04-02 / 04-03 的同源同形偏差**。
- **Fix:** 不改任何既有内容；两次都用「有序子序列」证明零内容删除（Task 1 后 base 117/117、Task 2 后 base 117/117 按序保留），并确认 diff 里唯一的 `-` 行与 `+` 侧逐字相同（Task 2 就是那行 `APPROVAL: approved 2026-11-14T06:17:59Z`）。`docs/MIGRATION.md` 这次**没有**这个位移——插入点在文件中段（「回退」/「Rollback」之前），末行未动，`--numstat` 为 `118 0`。
- **Files modified:** `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`
- **Verification:** `node -e` 有序子序列检查（base lines 117 / matched in order 117）；`git diff HEAD -- … | grep '^-'` 恰一行且与 `+` 侧同字；提交后演练块第三次复跑仍读到 `APPROVAL: approved …` 并 PASS。
- **Committed in:** `f042158`（Task 1）与 `19af44a`（Task 2）

---

**Total deviations:** 1 auto-fixed（1 blocking）
**Impact on plan:** 无 scope creep、无内容改写。唯一代价是两次「纯追加」在字面上各多 1 行 EOF 标记位移，已用子序列检查取证；两个交付物的语义、位置与断言强度均未改变。

## Issues Encountered

- **STATE 的两个 verb 在我写 SUMMARY 之前跑会自报未完成**：我先跑了 `state.advance-plan` / `state.update-progress`，它们按磁盘上的 `*-SUMMARY.md` 计数，于是返回 `plans_outstanding` 并把进度条按 12/13 重算。**这是执行顺序问题，不是计划偏差**——本文件落盘后按同样顺序复跑，计数与进度都正确收敛（见下方 Verification 表第 6 行）。
- **`npm pack` 的 `prepack` 仍不带 `--test-concurrency=1`**（`package.json` 的 `prepack` 未带该参数）：本计划触发三次，均 38/38 全绿、未出现已知的 `gate C: no SKILL.md under skills/gsd-*` 假红。这是既有结构性隐患（**不属本 phase 范围**，`04-VALIDATION.md:33-35` 已记），本次未改 `package.json`（对 plan base 零 diff）。
- **`npm pack` 日志里 `allow-version` 有 1 次命中，是测试用例名不是豁免使用**：逐字为 `✔ ⑦ allow-version 风险声明双语存在（P2-01 docs 半）`。三次 `add` 日志的 `allow-version` / `--force` / `Exact-version exemption` 计数均为 0——证据册已按这个口径记录，避免被读成「用了豁免」。
- **无认证门（Authentication Gates）**：本计划零推送、零发布；`dsh plugin add` 只把 registry 上的两个确切版本与本仓 tarball 装进一次性 home，未使用任何凭据。

## User Setup Required

None - no external service configuration required.（演练全部在 `mktemp -d` 的一次性 home 内；真实 `~/.dsh`、真实全局 npm prefix 均未写入；仓根无 `*.tgz` 残留。）

## Next Phase Readiness

- **MIG-04 闭合，Phase 4 的四个计划全部完成**：`requirements.ready-ids` 对 MIG-04 返回 `1/1 requirement(s) ready to mark complete`（无兄弟 plan 共享该 ID），已落 Complete。ROADMAP SC-3 要求的「同 profile 并存无冲突**实测**」由两段式证据支撑，而不是一句「装上了」。
- **Phase 5 的第一个复验对象已被点名**：真实迁移 `web` profile 时，`@jiangzhenguo/dsh-codegraph` 已经在该 profile 里，但本 phase 只做了它的**行级**静态证明。迁移后必须对真实 `~/.dsh` 重跑步骤 6 的 CB-8 四条判据（`uniq -d` / 逐 id 计数 / 同一 home 的 `H1 > H0` / 逐 bundle 标签），这才是它的动态并存证据。
- **解析级冲突仍是未观测面**：本组合上 pnpm 没有 ERESOLVE，换包组合（尤其 `github:` spec）需重新观测；这条已写进文档与证据册的边界段。
- **遗留观察（不阻塞）**：`prepack` 缺少 `--test-concurrency=1` 的假红隐患仍在（`package.json` 不属本 phase 改动面）；真实 `~/.dsh` 的整体迁移与 `web`/`headless` 的 bridge 块处置属 Phase 5（D-02）。

---

*Phase: 04-migration-coexistence*
*Completed: 2026-11-14*

## Verification (plan-level)

| # | 项 | 命令 / 判据 | 结果 |
| -- | -- | ----------- | ---- |
| 1 | Task 1 人审门 + 留痕 | 复核在用版本 / `postinstall` / `repository`；`grep -E "^APPROVAL: (approved\|hold)" "$EV" \| tail -n 1` | **PASS** → `0.24.0` / `1.73.15`、两者 `postinstall` 均为 `none`、源码仓分别 `vshulcz/deja-vu` 与 `dsh-market/dsh-market`；最后一条裁决 = `APPROVAL: approved 2026-11-14T06:17:59Z`（`match_count=1`，且它是文件末行） |
| 2 | Task 2 静态段 | `04-04` Task 2 `<automated>` node 门 | **PASS** → `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`（exit 0；并集 5、四路不相交） |
| 3 | Task 2 动态段 | `04-04` Task 2 `<automated>` bash 演练块（三轮） | **PASS** → `COEXIST-DRILL PASS`（RUN2/RUN3 exit 0）。读数：`approval gate: latest decision is approved`、`DSH_HOME=/tmp/dsh-coex-*`、`baseline headers=24 stderr_bytes=0`、`bundles=5 headers=24->27 stderr_bytes=0`、`row gsd x1 / gsd-hooks-bridge x1 / deja x1 / dsh-market x1`、`uniq -d` 0 行。RUN1 的唯一红是 `does not record this run`（设计要求） |
| 4 | Task 2 步骤 6 结构 | `<automated>` node 门 | **PASS** → `step-6 ok`（H1=2、两半各含 `uniq -d` + 四个 id + `bundles` + 标头前后关系 + `stderr` + 边界词 + `codegraph`；en 半零 CJK；零 `/Users/`） |
| 5 | Task 2 证据册形状 | `<automated>` node 门 | **PASS** → `drill-3-evidence ok`（DRILL-3 在场、五个 id 齐、`uniq -d`、`bundles`、边界段、`codegraph` 缺口、`EXIT=0` 记录、`COEXIST-DRILL bundles=` 逐字行） |
| 6 | 计数与守卫 | `node --test tests/docs-consistency.test.mjs`；`node --test --test-concurrency=1 tests/*.test.mjs` | **PASS** → docs-consistency `tests 14 / pass 14 / fail 0`；全量 `tests 38 / pass 38 / fail 0 / cancelled 0`（终树复跑同值） |
| 7 | 交叉核对 | 步骤 6 的命令与 DRILL-3 的判据同源；两处期望 id 集合一致；两处都不把 exit code 当判据 | **PASS** → 两处同为 `gsd,gsd-hooks-bridge,deja,dsh-market` 与 `uniq -d`；文档两半各有一句「不要把标头数当作 bundles 计数」；证据册记 `EXIT=0` 且标注不作判据 |
| 8 | 工作树复核 | `git status --porcelain` / `git diff 98a80f3 --stat -- package.json BUILD.md tests/` / `ls *.tgz` | **PASS** → 仅 `docs/MIGRATION.md` 与 `04-DRILL-EVIDENCE.md` 两处改动；`package.json` / `BUILD.md` / `tests/` 零 diff；仓根无 `*.tgz`；无未跟踪文件 |
| 9 | 真实 `~/.dsh` 零写入 | profiles 清单与 `profiles/*/package.json` 的 mtime+size `diff -q`；`find ~/.dsh -newermt 2026-11-14T06:17:00Z` | **PASS** → 两次（run2 后、run3 后）均 `IDENTICAL`；`find` 命中 **0** 项；三次演练的临时 home 与 tarball 全部删除 |
| 10 | 豁免扫描 | 三个 `add` 日志 + `pack` 日志的 `allow-version` / `--force` / `Exact-version exemption` 计数 | **PASS** → add 日志三项全 0；pack 日志唯一 `allow-version` 命中是测试用例名 `⑦ allow-version 风险声明双语存在`，非豁免使用 |

## Self-Check: PASSED

- **Created/modified files exist:** `04-04-SUMMARY.md` FOUND；`docs/MIGRATION.md` FOUND（46452 B / 585 行，两半各含步骤 6）；`04-DRILL-EVIDENCE.md` FOUND（含 `## 包合法性门裁决` 与 `## DRILL-3`）
- **Commits exist（ancestor of HEAD）:** `f042158` FOUND（Task 1）、`19af44a` FOUND（Task 2）；measured `commits: 2`（`git rev-list --count 98a80f30..19af44af`，ledger `gsd-plan-head-before-04-04`）
- **Evaluation scope:** `gsd_run check evaluation-scope --plan 04-04 --commits-only --raw` → `status: resolved`、`source: plan-subjects`、`commits` 2 条（`19af44a` / `f042158`）
- **Acceptance criteria re-run after all commits:** Task 1 五项（在用版本 `0.24.0`/`1.73.15`、`postinstall` 均 `none`、源码仓字段、`APPROVAL:` 最后一条为 approved、漂移已记）与 Task 2 七项（`coexist-static ok`、`COEXIST-DRILL PASS`（RUN2/RUN3）、`step-6 ok`、`drill-3-evidence ok`、docs-consistency 14/14、全量串行 38/38、真实 home 零写入 + 无 `*.tgz` + 工作树仅两处改动）全部通过
- **Plan-level verification:** 10 项逐条记录于上表，全部 PASS；动态演练三轮的读数一致（`bundles=5 headers=24->27`、四 id 各 1、`uniq -d` 空），第三轮落在文档与证据册定稿后的树上
- **Summary frontmatter:** `requirements-completed: [MIG-04]` 与 PLAN frontmatter 逐字一致；`actuals` 五值（tokens 6171 / tasks 2 / commits 2 / plan_head_before / plan_head_after）齐备；`status: complete`