---
phase: 04-migration-coexistence
plan: 02
subsystem: docs
tags: [migration, three-axis, bilingual-docs, oldrepo-prep, shared-limit, dsh-hooks-events]

# Dependency graph
requires:
  - phase: 04-migration-coexistence
    plan: 01
    provides: "`docs/MIGRATION.md` 的双语骨架与 §①（zh 半 → 独占 `---` → en 半、两半各 1 个 `##` 时点），本计划的 §② 追加在它的收尾之后"
  - phase: 01-build-mjs
    provides: "包内引擎 1.20.1 与 `skills/` 72 项（差异表第一、二轴的插件侧真源）"
  - phase: 02-compat-matrix
    provides: "`config/gsd-hooks.json` 的 5 事件 / 14 matcher 事实（差异表第三轴与共同限制的真源）"
provides:
  - "`docs/MIGRATION.md` §②：两半各 3 个 `###`（选型建议 → 四列三行对照表 → 单列共同限制），zh 表头逐字 D-12、en 同构四列"
  - "D-12 三条写表纪律的机器可判形态：共同限制不是表行、选型建议在表前、影响列措辞方向是「多得」"
  - "`docs/oldrepo-link/` 四件备料（说明 / 英文正式片段 / 中文备而不用片段 / PR 描述），Phase 5 可直接复制，不需重写"
affects: [04-03, 04-04, 05-end-to-end-uat]

# Actuals (#2632) — 与 PLAN 的 estimate 配对，同一尺度（chars/4 over realized diff）
actuals:
  tokens: 2600
  tasks: 2
  commits: 2
  plan_head_before: f05997346b280bfdc75cacd734a69282de470cd4
  plan_head_after: d455b9a4cd006637ba29ae4c4e6bf13b7ea15a66

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "文档节的形状门写成单段 `node -e`：围栏感知取 H1 切两半 → 逐半断言 `##`/`###` 计数与逐字标题 → 表头必须与分隔行相邻（别处的表冒充会被这一条挡住）→ 关键事实词逐条断言"
    - "备料目录的契约用 15 条 `includes`/regex 一次断言完（目标仓 / remote / 基准 sha 语义 / 章节锚点 / 时点 / 零机器路径 / 不引用错的那篇中文 README），旧仓零写入用三条只读 git 命令同轮证明"
    - "「共同限制」这类易被降级成表行的内容，机器判据是双向的：小节内必须齐 5 个行内代码事件名，同时任何以 `|` 开头的行不得含小节标题词"

key-files:
  created:
    - docs/oldrepo-link/README.md
    - docs/oldrepo-link/snippet.en.md
    - docs/oldrepo-link/snippet.zh.md
    - docs/oldrepo-link/pr.md
  modified:
    - docs/MIGRATION.md

key-decisions:
  - "zh §② 插在 §① 的「本机实测值」表之后、独占 `---` 之前；en §② 追加在文件末尾——两半的 §② 都紧跟 §① 收尾，D-11 的同构顺序得以保持，04-03 的 §③ 直接接在 §② 之后（`##` 从各 2 变各 3）"
  - "en 半的 hooks 轴逐字复述 D-12 的纠偏（`not an event-set difference` / `configPath` / `pluginRoot`），而不是把它译成「事件子集差异」；三轴的每一格都配一条可复核命令（`npm ls -g`、`readlink -f \"$(command -v gsd_run)\"`、`node -e` 数 hooks 键集）"
  - "五个 hook 事件名一律写成行内代码：裸词 `Stop` 是 `SubagentStop` 的后缀，机器无法把它与完整事件名区分开，只有反引号形态才可判定（计划已把这条写成判据）"
  - "片段不写 `dsh-gsd@<version>`、不写旧仓行号、不写机器路径；插入位置只用章节锚点「`## Quick start` 之前」，基准 sha `41fcc7a` 显式标注为「观测时的 HEAD，不是 patch 基准」"
  - "`snippet.zh.md` 首行 HTML 注释即「无落点」声明（读法 A）：旧仓 README 实测 CJK 0 / 315 行，不越权把它的门面改成双语；D-09「中英各一份」由「英文正式件 + 中文备而不用」完整满足"
  - "README.md / package.json / tests/ / BUILD.md 零改动：`files` 仍九项不含 `docs`，全量仍 37/37，`BUILD.md:16` 保持 37/37 留给 04-03 与 ⑭ 同提交"

patterns-established:
  - "双语同构的形状门复用 04-01 的围栏感知切半法：只有围栏感知的 H1 计数才安全——naive `grep -c '^# '` 会把 runbook 里 column-0 的 `#` 注释行数成标题（本 plan 实测 28 而非 2）"
  - "备料目录沿 `docs/dshmarket/` 先例：说明与资产分离、首行声明不随 npm 包发布、时点写死在标题里（置备 → Phase 5 提交）"

requirements-completed: [MIG-02, MIG-03]

# Coverage metadata (#1602) — 每个交付物一条，驱动 verify-work 的确定性 UAT 路由
coverage:
  - id: D1
    description: "`docs/MIGRATION.md` §② 的三轴对照表（zh 表头逐字 `| 轴 | 旧脚本 | 插件 | 迁移影响 |` / en 同构四列 / 各恰 3 行数据 / 轴顺序 全局 CLI → GSD_PROFILE 档位 → hooks 归属 / 每格事实可被只读命令复核）"
    requirement: MIG-02
    verification:
      - kind: unit
        ref: "docs/MIGRATION.md §② 形状门（`node -e`，围栏感知切半 + 表头相邻分隔行 + 三轴 + en 半零 CJK）→ 输出 `section-2 ok`"
        status: pass
      - kind: other
        ref: "事实交叉核对：`npm ls -g --depth=0` → `@opengsd/gsd-core@1.16.0`；`readlink -f $(command -v gsd_run)` → `.../@opengsd/gsd-core/gsd-core/bin/gsd_run`；`gsd-core/VERSION` → `1.20.1`；`ls -d skills/gsd-*` → 72"
        status: pass
    human_judgment: false
  - id: D2
    description: "「共同限制」单列为独立 `###` 小节（不是对照表第 4 行）：两半各恰 5 个行内代码事件名（`SessionStart` / `PreToolUse` / `PostToolUse` / `SubagentStop` / `Stop`），并明写两种方式都受此限、换插件不会多拿事件"
    requirement: MIG-02
    verification:
      - kind: unit
        ref: "同一形状门内的三条断言：小节内 5 个事件各 1 次、任何 `|` 开头行不含小节标题词（`put the shared limit inside the table` 为红）、14 matcher 事实与 `config/gsd-hooks.json` 实测一致（5 键 / 1-7-4-1-1）"
        status: pass
    human_judgment: false
  - id: D3
    description: "表**前**的选型建议段（走批量铺机 / 完全离线 / 要脚本诊断输出 → 留旧脚本；单机日常 / 要 enable-disable-remove / 要一条命令升级回滚 → 用插件；已装脚本 → 按 §① 迁移）"
    requirement: MIG-02
    verification:
      - kind: unit
        ref: "形状门断言 `### 什么情况选哪个` / `### Which one should you use` 在场且位于对照表之前 → `section-2 ok`"
        status: pass
    human_judgment: true
    rationale: "机器只能证明「有一段表前建议且三条分支都在」，证不了它是否真的能让人做出正确选择——推荐口径的完整性与措辞是否会误导（尤其「已装脚本」那条要不要强制硬门）需要人读一遍。"
  - id: D4
    description: "`docs/oldrepo-link/` 四文件职责分离（README 只有说明含六要件 / snippet.en 是可整段粘贴的裸 blockquote 且不含 `dsh-gsd@` / snippet.zh 首行 HTML 注释声明无落点 / pr.md 首行 `title:` 次行 `---` 后接四段 body）"
    requirement: MIG-03
    verification:
      - kind: unit
        ref: "`node -e` oldrepo-prep 契约门（15 条 includes/regex + 四文件零 `/Users/` + 不引用 `INSTALL-GSD-DSH-README`）→ 输出 `oldrepo-prep ok`"
        status: pass
      - kind: other
        ref: "文件形态复核：snippet.en 无标题行/无围栏/非空行全部 `> ` 开头；snippet.zh 首行 `<!--` 且含「纯英文 / CJK 字符数 0 / 315 行 / 无落点」；pr.md 第 2 行恰为 `---` 且 body 四段齐"
        status: pass
    human_judgment: false
  - id: D5
    description: "旧仓零写入（HEAD 仍 `41fcc7a`、工作树 `status --porcelain` 为空、remote 仍 `git@github.com:pfmiles/install-gsd-dsh.git`）；`docs/` 仍未进 `package.json` 的 `files`（九项不含 `docs`）"
    requirement: MIG-03
    verification:
      - kind: integration
        ref: "`test \"$(git -C ../install-gsd-dsh rev-parse --short HEAD)\" = 41fcc7a && test -z \"$(... status --porcelain)\" && test \"$(... remote get-url origin)\" = git@...` → 输出 `oldrepo-untouched ok`（任务提交前后各跑一次）"
        status: pass
      - kind: unit
        ref: "`node -e` files-scope 门（`files` 长度 9 且不含 `docs`）→ 输出 `files-scope ok`；`git diff <plan-base> HEAD -- package.json tests/ README.md BUILD.md` 为空"
        status: pass
    human_judgment: false

# Metrics
duration: 5 min
completed: 2026-11-13
status: complete
---

# Phase 4 Plan 2: 三轴差异表与旧仓备料 Summary

**`docs/MIGRATION.md` §② 在 zh/en 两半各长出 3 个 `###`（选型建议 → 四列三行三轴表 → 单列共同限制），zh 表头逐字沿用 D-12、en 半零 CJK 且同构；`docs/oldrepo-link/` 四件备料落盘而旧仓 HEAD / 工作树 / remote 一字未变——「英文片段是唯一正式件、中文片段备而不用」由文件首行的 HTML 注释固定下来。**

## Performance

- **Duration:** 5 min
- **Started:** 2026-11-13T17:48:43Z
- **Completed:** 2026-11-13T17:53:27Z
- **Tasks:** 2 / 2
- **Files modified:** 5（1 改 + 4 新建）
- **Commits:** 2（measured `git rev-list --count f059973..d455b9a` = 2，ledger `gsd-plan-head-before-04-02`）

## Accomplishments

- **MIG-02 从散文变成一张可判定的表**：三轴（全局 CLI / `GSD_PROFILE` 档位 / hooks 归属）各一格，zh 表头逐字 `| 轴 | 旧脚本 | 插件 | 迁移影响 |`、en 半同构四列，两半数据行数都是 3、轴顺序一致——形状门在提交后复跑出 `section-2 ok`。
- **hooks 轴的关键纠偏写进了正文而不是留在研究笔记里**：两半都明写「**不是事件差异**」/「**not an event-set difference**」，并把两侧同为 5 事件 / 14 matcher、双向差集为空写进影响列；本轮又用 `node -e` 同时读了包内 `config/gsd-hooks.json` 与旧部署 `~/.dsh/gsd-hooks.dsh.json`，两侧键集与 matcher 数逐一相等（5 键 / 1-7-4-1-1）。
- **「共同限制」没有被降级成第 4 行**：它是独立 `###`，把五类事件全写成行内代码（裸词 `Stop` 是 `SubagentStop` 的后缀，只有反引号形态可判定），并明写两种方式都受此限、换插件不会获得更多事件。机器判据是双向的——小节内 5 个事件必须齐，且任何表格行不得出现小节标题词。
- **三轴每一格都有真源可对**：`npm ls -g --depth=0` → `@opengsd/gsd-core@1.16.0`；`readlink -f "$(command -v gsd_run)"` → 落在 `@opengsd/gsd-core/gsd-core/bin/gsd_run`；包内 `gsd-core/VERSION` → `1.20.1`；`ls -d skills/gsd-*` → 72；hooks 键集 5 / matcher 14。文本与这五个读数逐条不冲突。
- **MIG-03 的备料侧成形且「不发生」可证**：`docs/oldrepo-link/` 四件（说明 / 英文正式片段 / 中文备而不用片段 / PR 描述）一次过 15 条契约；旧仓三条只读命令同轮证明 HEAD 仍 `41fcc7a`、`status --porcelain` 为空、remote 未变，任务提交前后各跑一次结论相同。
- **发布面零 churn**：`package.json` 的 `files` 仍九项且不含 `docs`，`docs/` 依旧只活在 GitHub；`README.md` / `BUILD.md` / `tests/` / `package.json` 对 plan-base 的 diff 为空，全量串行 **37/37**、`BUILD.md:16` 保持 `37/37`（留给 04-03 与 ⑭ 同提交改为 38/38）。

## Task Commits

Each task was committed atomically:

1. **Task 1: §② 三轴差异表（zh/en 各一套）** - `cb60686` (docs)
2. **Task 2: 旧仓互链备料四文件** - `d455b9a` (docs)

**Plan metadata:** 与本次 SUMMARY 同提交（`docs(04-02): complete … plan`，含 STATE/ROADMAP/REQUIREMENTS）

_Note: 本计划无 TDD 任务、无 checkpoint；两个任务各自单提交，无 fixup。_

## Files Created/Modified

- `docs/MIGRATION.md`（改，+53 / −1 行；30238 B → 37229 B、361 → 413 行）— 两半各追加 §②：`## ② 两种方式的三轴差异` / `## ② Three axes of difference`，其下 `### 什么情况选哪个` / `### Which one should you use`（表前选型建议）、`### 对照表` / `### Comparison`（四列三行表 + 一行「每格怎么复核」）、`### 共同限制：两种方式都受此限` / `### Shared limit: both modes are bound by it`（单列，5 事件行内代码）。§① 的 361 行内容零删改。
- `docs/oldrepo-link/README.md`（新，3579 B）— 备料说明：目标仓 / remote / 基准 sha `41fcc7a`（标注为观测 HEAD 而非 patch 基准）/ 章节锚点 `## Quick start` 之前 / 时点 Phase 5 / SSH 不可用与 `gh` 凭据路径 / 两片段分工 / 只读核对命令 / 落盘前核对清单。
- `docs/oldrepo-link/snippet.en.md`（新，691 B）— **唯一会被推送的正式件**：8 行 `> ` blockquote 裸正文，无标题、无围栏、无版本硬编码，回链 `https://github.com/pfmiles/dsh-gsd` 与迁移指南。
- `docs/oldrepo-link/snippet.zh.md`（新，889 B）— 同义中文；首行 HTML 注释写明「旧仓 README 为纯英文（CJK 字符数 0、315 行），本片段当前无落点、备而不用」。
- `docs/oldrepo-link/pr.md`（新，1235 B）— `title: docs: point install-gsd-dsh readers at the dsh-gsd plugin` + 独占 `---` + body 四段（What this changes / Why / Backlink / No behaviour change）。

## Decisions Made

- **§② 的落位**：zh 插在 §① 的「本机实测值」表之后、独占 `---` 之前；en 追加在文件末尾。这样两半都保持「§① 收尾 → §②」，04-03 的 §③ 直接接在 §② 之后即可把两半的 `##` 从各 2 推到各 3，同构顺序不必再调。
- **en 半不译错**：hooks 轴的纠偏在英文里也用 `not an event-set difference`，并保留 `configPath` / `pluginRoot` 两个标识符原形；`GSD_PROFILE` 行的结论用 `no equivalent` + 「gives you **more** skills, not fewer」，与 D-12「措辞方向必须是多得」一致。
- **每格都留一条复核命令**：在 `### 对照表` 之下补一句「每一格怎么复核」，把 `npm ls -g`、`readlink -f`、`node -e` 数 hooks 键集点名到具体行。这不是新交付面，而是把 must_haves 的「每一格都能对上真源」落在正文里，读者不必回翻研究文档。
- **5 个事件名必须行内代码**：裸词 `Stop` 是 `SubagentStop` 的后缀，任何文本判据都无法区分；`.<event>.` 形态才可判定。计划把这条写成了判据，实现时两半都照办。
- **备料按 `docs/dshmarket/` 先例四文件而非单文件**：说明与资产分离（`snippet.*` 里只有可粘贴正文，没有一句说明）、首行声明不随 npm 包发布、时点写死在标题里。D-10 反对的是**用户面**文档拆篇，备料不属用户面。
- **中文片段备而不用（读法 A）**：旧仓 README 实测 CJK 0 / 315 行 / 23653 B，没有中文落点；把中英一起粘进去等于未经对方同意把它的门面改成双语。D-09 的字面要求由「英文正式件 + 中文备而不用」满足，并在两处（备料 README 的表格、`snippet.zh.md` 首行）写明不用的原因。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `docs/MIGRATION.md` 原本没有文件末尾换行，追加 §② 后 git 报出 1 行删除**

- **Found during:** Task 1（`git diff "$BASE" -- docs/MIGRATION.md` 复核「纯追加、无 `-` 行」时）
- **Issue:** 该文件在 HEAD 上末尾**没有换行符**（`endsWithNewline: false`）。在它的最后一行之后追加内容，必然让那一行的「EOF 无换行」状态改变，于是 git 把**末行 `| dump header count | 24 → 25 | … |` 原样重新发射一次**并记成 1 行删除（`--numstat` = `53 1`）。实测确认这不是内容改写：**base 的 361 行按序全部保留**（subsequence 检查 361/361 命中），新增 52 行是两段 §②，第 53 个 `+` 就是那同一行。物理上无法既在末行之后追加、又保住末行的「无换行」标记，因此计划里「纯追加（无 `-` 行）」这条判据只能落成「零内容删除 + 1 行 EOF 标记位移」。
- **Fix:** 不改动任何既有内容，接受这 1 行机械位移；同时把 §② 的末尾也保持「无文件末尾换行」，与该文件原有形态一致（不去顺手加 EOF 换行，以免把位移面扩大）。§① 的语义与字节一致性另行取证。
- **Files modified:** `docs/MIGRATION.md`
- **Verification:** `git diff f059973 --numstat -- docs/MIGRATION.md` → `53 1`；`git diff f059973 -- docs/MIGRATION.md | grep '^-' | grep -v '^--- a/'` → 恰那一行，且它与 `+` 侧逐字相同；subsequence 检查 `base lines 361 / matched in order 361`；`docs-consistency` 13/13、`section-2 ok` 均绿。
- **Committed in:** `cb60686`（Task 1 提交）

---

**Total deviations:** 1 auto-fixed（1 blocking）
**Impact on plan:** 无 scope creep，也无内容改写。唯一代价是「纯追加」这条判据在字面上多了 1 行 EOF 标记位移；§① 的 361 行一字未动（可机器复核），§② 的两段位置与计划一致。若日后要彻底消除这类位移，应在某个独立提交里把全仓 `.md` 的 EOF 换行一次性规范化，而不是混在内容提交里。

## Issues Encountered

- **围栏感知的 H1 计数是硬要求，不是洁癖**：`docs/MIGRATION.md` 的 bash 块里有 26 行 column-0 的 `#` 注释，naive `grep -c '^# '` 会返回 **28** 而真实 H1 是 **2**。本轮我自己的一版临时统计脚本忘了加围栏过滤，当场把 zh/en 两半切反（zh 半变成 26 行、`###` 数为 0），差点报出一条假回归；计划的 `section-2` 门本身是围栏感知的，复跑即恢复。**04-03 加「两半各 3 个 `##`」守卫时必须同样围栏感知**，否则会被 runbook 的注释行喂出假绿/假红。
- **旧仓 `~/.dsh/gsd-hooks.dsh.json` 只做了只读读取**（为了核对「双向差集为空」）：`JSON.parse` 后数键集与 matcher，未写入、未备份、未改动；真实 `~/.dsh` 的其余部分本 plan 未触碰。
- **无认证门（Authentication Gates）**：本 plan 零推送、零安装、零联网动作；`docs/` 的读写与四条只读 git 命令足以完成全部判据。

## User Setup Required

None - no external service configuration required.（备料四文件只在本仓；旧仓在 Phase 5 才动，且届时须另走 `gh` 凭据路径——那条通道已写进 `docs/oldrepo-link/README.md` 第 3 节。）

## Next Phase Readiness

- **04-03 可开工**：§③ 的追加点是 §② 之后（zh 半在 `---` 之前、en 半在文件末尾）；它的「两半各 3 个 `##`」守卫将看到当前各 2、落地后各 3。**注意围栏感知**（见 Issues）。⑭ 守卫与 `BUILD.md:16` 的 37→38 由 04-03 同一提交完成，本计划未动 `BUILD.md`（仍 `预期 37/37`）也未新增 `test(`（全量仍 37/37）。
- **04-04 不受影响**：本计划不碰 `profiles/`、不装任何包、不改 `cordis.patch.yml`、不改 `config/gsd-hooks.json`（只读）。
- **Phase 5 可直接消费备料**：`docs/oldrepo-link/snippet.en.md` 是唯一正式件，`pr.md` 的 title/body 可原样用；`README.md` 里已写明「HEAD 一变只重读 `## Quick start` 位置，片段正文不必改」。
- **需求状态**：MIG-02 与 MIG-03 均落 Complete（`requirements.ready-ids` 对两者都返回 ready —— MIG-03 与 04-01 共享，04-01 的 SUMMARY 已在盘上，共享 ID 门不再挡）。Phase 4 余下 MIG-04（04-04）与 HOOK-05（04-03）。

---

*Phase: 04-migration-coexistence*
*Completed: 2026-11-13*

## Self-Check: PASSED

- **Created files exist:** `docs/oldrepo-link/README.md` FOUND、`docs/oldrepo-link/snippet.en.md` FOUND、`docs/oldrepo-link/snippet.zh.md` FOUND、`docs/oldrepo-link/pr.md` FOUND、`.planning/phases/04-migration-coexistence/04-02-SUMMARY.md` FOUND
- **Commits exist (ancestor of HEAD):** `cb60686` FOUND（Task 1）、`d455b9a` FOUND（Task 2）；measured `commits: 2`（`git rev-list --count f059973..d455b9a`）
- **Evaluation scope:** `gsd_run check evaluation-scope --plan 04-02 --commits-only --raw` → `status: resolved`、`source: plan-subjects`、`commits` 2 条（`cb60686` / `d455b9a`）
- **Acceptance criteria re-run after both commits:** Task 1 两段（`node --test tests/docs-consistency.test.mjs` → `tests 13 / pass 13 / fail 0`；§② 形状门 → `section-2 ok`）与 Task 2 三段（oldrepo-prep 契约 → `oldrepo-prep ok`；旧仓三处 → `oldrepo-untouched ok`；`files` 九项 → `files-scope ok`）全部通过
- **Plan-level verification:** 三轴五条交叉核对读数与本机实测一致（1.16.0 / `@opengsd/gsd-core` 落点 / 1.20.1 / 72 / 5 事件 14 matcher，旧部署侧同值）；工作树对 plan-base 恰 5 个文件（`M docs/MIGRATION.md` + 4 个 `A`），`README.md` / `BUILD.md` / `tests/` / `package.json` 零 diff；全量串行 `node --test --test-concurrency=1 tests/*.test.mjs` = **37/37 fail 0**（计数不变），`BUILD.md:16` 仍 `37/37`
- **Summary frontmatter:** `requirements-completed: [MIG-02, MIG-03]` 与 PLAN frontmatter 逐字一致；`actuals` 三值 + `plan_head_before` / `plan_head_after` 齐备；`status: complete`