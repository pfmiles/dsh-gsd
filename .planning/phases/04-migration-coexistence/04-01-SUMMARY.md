---
phase: 04-migration-coexistence
plan: 01
subsystem: docs
tags: [migration, runbook, bilingual-docs, drill-evidence, dsh-home-isolation, uninstall-before-add]

# Dependency graph
requires:
  - phase: 03-github-npm-dshmarket
    provides: 已发布就绪的插件包（prepack 全量构建 + 958 文件 tarball），本计划的 `npm pack` → `dsh plugin add` 直接消费它
  - phase: 01-build-mjs
    provides: 构建产物 72 skills（gsd-health 3587 B / gsd-new-project 3856 B）与包内引擎 1.20.1——内容比对的新源侧常量
  - phase: 02-compat-matrix
    provides: engines.dsh 兼容门与 pins 策略，`dsh plugin add` 的 preflight / post-install 判定路径
provides:
  - "`docs/MIGRATION.md` 的双语骨架与 §① 迁移 runbook（0-A 演练场 + 0-B 真实迁移两个场、D-03 硬门、D-04 全局 CLI、D-05/D-07 复验、回退）"
  - "DRILL-1 端到端迁移演练证据册（MIG-01 的唯一可审计载体，verifier 无需重跑）"
  - "README 中英各一行 scripts→plugin 迁移入口（MIG-03 的「README 顶部互链」半条）"
  - "一套可复制、判据只认内容/字节/集合的迁移命令块——04-02/04-03 的 §②/§③ 与 04-04 的并存自检都长在它上面"
affects: [04-02, 04-03, 04-04, 05-end-to-end-uat]

# Actuals (#2632) — 与 PLAN 的 estimate 配对，用同一尺度（chars/4 over realized diff）
actuals:
  tokens: 11041
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "迁移判据 = 内容 / 字节数 / 集合；exit code 一律不作通过信号（`--uninstall` 恒 0、`--dump-config` 在 bundle 被跳过时也恒 0）"
    - "标头数只与同一 home 自己的加包前基线比（`H1 = H0 + 1`）+ 逐 bundle 标签「出现」断言，绝不与 `dsh.profile.bundles` 长度比"
    - "字节基线必须与它的两条前提同轮断言（20 字符 home + GSD 1.16.0），否则数字只是被抄进来的常量"
    - "每个可粘贴块第一行 `export DSH_HOME=`、第二行回显；后续块用 `${DSH_HOME:?…}` fail-closed 而非重新 mktemp"

key-files:
  created:
    - docs/MIGRATION.md
    - .planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md
  modified:
    - README.md

key-decisions:
  - "演练场钉死在恰 20 字符（`mktemp -d /tmp/dsh-mig-XXXXXXX`）并显式断言，同时断言 `core/VERSION` 与 `runtime-identity --raw` 都是 1.16.0——3084 / 3195 是「20 字符 home × 1.16.0」这一对前提的产物，两条前提都在卸载前同轮成立"
  - "后续命令块用 `export DSH_HOME=\"${DSH_HOME:?run step 0-A or 0-B first}\"`：既满足「每块第一行是 export DSH_HOME=」的纪律，又不会重新 mktemp 破坏演练场，且未设 home 时 fail-closed"
  - "README 入口紧贴 intro 段下一行（不额外插空行）：Markdown 的 blockquote 可以中断段落，这样 `git diff BASE -- README.md` 恰为 +2 −0，符合计划的硬判据"
  - "本文件头警告写成**有条件**的（「未经逐 profile 裁决，不要在真实 ~/.dsh 上跑 --uninstall」+ 指向 0-B 与步骤 1），不写成无条件禁令——否则文档禁掉了自己的步骤 2"

patterns-established:
  - "演练逻辑一次跑通后，同一份 bash 块既作 Task 验收又作 tracer feedback gate 的复跑对象，两次输出逐字同构（本次三次运行基线完全一致）"
  - "证据册把「采样口径错误」也当负向观测量记录（临时 `npm_config_prefix` 未 unset 时 `npm ls -g` 报 NOT FOUND），并显式标注不得充当通过形态"

requirements-completed: [MIG-01, MIG-03]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "docs/MIGRATION.md 的双语骨架与 §① 迁移 runbook：zh 半 CJK / en 半零 CJK、两半各恰 1 个 `## ①`、独占一行的 `---` 分隔、0-A 与 0-B 两个迁移场、每块首行 `export DSH_HOME=`、全文零 `/Users/` 字面量"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "node -e docs/MIGRATION.md shape gate（H1=2 / 两半 ## 各 1 / 逐 token 断言 / real-home 可粘贴块 / 零 CJK 于 en 半）"
        status: pass
    human_judgment: false
  - id: D2
    description: "DRILL-1 端到端迁移：临时 20 字符 home 里 旧脚本装 1.16.0 → 基线 72/3084/3195 → 硬门 hits=1 → --uninstall → 阴性对照 0/absent/ABSENT → npm pack → dsh plugin add → 3587/3856/72 → dump stderr 0 B + 标头 24→25 + 两 row 各 1"
    requirement: MIG-01
    verification:
      - kind: integration
        ref: "04-01-PLAN.md Task 1 <automated> bash 块（三次运行均以 `DRILL-1 PASS` 结尾；末次 /tmp/verify-drill1.out 与 tracer gate 复跑 /tmp/tracer-gate-drill1.out 逐字同构）"
        status: pass
    human_judgment: false
  - id: D3
    description: "04-DRILL-EVIDENCE.md 的 DRILL-1 证据册：每行 (操作, UTC, 输出要点)、两条前提读数、标头 before/after、机器级 ABSENT/PRESENT 分支、负向观测标注、这证不了什么边界——足以让 verifier 复核而不必重跑"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "node -e evidence-shape gate（复验序 / DRILL-1 / UTC / 1.16.0 / 3084 / 3195 / 3587 / 3856 / headers / 不得充当通过形态 / 这证不了什么 / absent|present）+ grep -c DRILL-1 = 2"
        status: pass
    human_judgment: true
    rationale: "「证据册足以替代重跑」是审计判断，不是任何测试能断言的属性：机器门只证明必需字段与标注在场，是否真的能让第三方照着复核，需要 verifier 读一遍。"
  - id: D4
    description: "README 中英两半各一行 blockquote 入口指向 ./docs/MIGRATION.md，且 `# dsh-gsd` 仍恰 2 次 / shields 徽章 2 枚 / 裸名 install 整行 2 行（zh·en 各 1）/ 零 `/Users/`——双语切片点未位移"
    requirement: MIG-03
    verification:
      - kind: unit
        ref: "tests/docs-consistency.test.mjs（13/13 pass）+ node -e readme-entry 结构复核（`readme-entry ok`）"
        status: pass
      - kind: other
        ref: "git diff ad9bc6e --numstat -- README.md = `2  0`（恰 +2 增 0 删）；git diff ad9bc6e -- tests/ BUILD.md 为空"
        status: pass
    human_judgment: false

# Metrics
duration: 8 min
completed: 2026-11-13
status: complete
---

# Phase 4 Plan 1: 迁移 runbook 与实测 Summary

**双语迁移指南 §① 的每条命令块都在临时 20 字符 `DSH_HOME` 里真跑过一遍：旧源 72 / 3084 B / 3195 B 且两条前提（20 字符 home + GSD 1.16.0）同轮断言 → 硬门 hits=1 → 卸载后 0 / absent / ABSENT → 包内 3587 B / 3856 B / 72 → dump `stderr 0 B` 且标头 24→25、`# == dsh-gsd` 出现、两 row 各 1；同一组数字逐字回填正文与证据册，README 中英各加一行入口而双语切片点未位移（docs-consistency 13/13）。**

## Performance

- **Duration:** 8 min（其中三次完整演练 ≈6 min，`npm pack` 的 prepack 每次跑全量 build + 37 用例）
- **Started:** 2026-11-13T17:34:47Z
- **Completed:** 2026-11-13T17:42:47Z
- **Tasks:** 2 / 2
- **Files modified:** 3（2 新建 + 1 改 2 行）
- **Commits:** 2（measured `git rev-list --count 7de4010..a210d65`）

## Accomplishments

- **MIG-01 从散文变成可执行顺序**：硬门 → `--uninstall` → 阴性对照 → `dsh plugin add` → 内容比对，五步判据全部是内容 / 字节 / 集合，没有一处依赖 exit code；tracer 切片在临时 home 上一次到底跑通，三次独立运行输出逐字同构。
- **基线有牙**：先量到旧源非空（72 技能 / 3084 B / 3195 B / bridge 命中），并**同轮**断言它赖以成立的两条前提——`${#DSH_HOME} -eq 20` 且 `core/VERSION` 与 `runtime-identity --raw` 都报 `1.16.0`。没有这层，`--uninstall` 之后的「0」会在插件坏掉时也成立。
- **T-4-17 的伪不变量被实测钉死**：同一 home 加包前 24 个 `^# == ` 标头 / 1243 行，加包后 25 / 1255，而 `dsh.profile.bundles` 只有 3 项——「标头数 == bundles 长度」在健康态就假，正确判据是 `H1 = H0 + 1` 加逐 bundle 标签「出现」。
- **T-4-16 的机器级一面区分两种状态**：`$DSH_HOME/cordis.patch.yml` 在新建临时 home 里**不存在**，判据打印 `ABSENT` 而不是一个 0 计数；`PRESENT` 分支另行要求计数为 0。
- **MIG-03 的 README 半条有认领者**：中英各一行 blockquote 入口，`# dsh-gsd` 仍恰 2 次、徽章 2 枚、裸名 install 整行 2 行、diff 恰 +2 −0，docs-consistency 13/13。

## Task Commits

Each task was committed atomically:

1. **Task 1: 端到端迁移 tracer + 据实测成文 §①** - `ad9bc6e` (docs)
2. **Task 2: README 双语各一行迁移入口** - `a210d65` (docs)

**Plan metadata:** 与本次 SUMMARY 同提交（`docs(04-01): complete 迁移 runbook 与实测 plan`，含 STATE/ROADMAP/REQUIREMENTS）

_Note: 本计划无 TDD 任务；两个任务各自单提交，无 fixup。_

## Files Created/Modified

- `docs/MIGRATION.md`（新，30238 B）— 用户面双语迁移指南：zh 半 → 独占一行 `---` → en 半；§① 含步骤 0（0-A 演练场 / 0-B 真实迁移）、步骤 1 硬门双面扫、步骤 2 卸旧部署（含旧脚本不做的四件事）、步骤 3 卸全局 CLI、步骤 4 装插件、步骤 5 复验、回退、本机实测值表
- `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`（新，11932 B）— 三段式证据册：文件头（复验对象 / 演练环境 / 目标身份 / 判据口径）+ `## 复验序`（12 步 + 禁止"大概/应该/目测"）+ `## DRILL-1` 表（19 行三元组，UTC 时间）+ 结论 + 「这证不了什么」边界 + 「本轮未覆盖」
- `README.md`（改 2 行）— zh 半 `## 为什么用 dsh-gsd` 之前、en 半 `## Why dsh-gsd` 之前各一行 blockquote 指向 `./docs/MIGRATION.md`

## Decisions Made

- **演练场取路由 A（20 字符 home + 钉版本 1.16.0），不做运行中按公式推导**：两个前提都在脚本里硬断言，数字才不是抄来的；换长度按 `3084-3×(20-L)` / `3195-7×(20-L)` 递减的关系只写进文档给读者。
- **后续命令块用 `${DSH_HOME:?…}` 而不是重新 `mktemp`**：既保住「每块首行 `export DSH_HOME=`」的反误伤纪律（T-4-01），又不会把演练场换掉；未设 home 时 fail-closed。
- **README 入口不额外插空行**：Markdown 的 blockquote 可中断段落，因此两行入口直接贴在 intro 段之后，`git diff BASE -- README.md` 恰为 +2 −0，与计划的硬判据一致（代价是源码观感略紧，语义与渲染不受影响）。
- **文内「本机实测值」全部集中到一张标注「示例，本机 2026-11-13」的表里**，正文其余位置只用相对量（`$DSH_HOME` / `$PWD` / `<path-to>` / `<profile>`），全文零 `/Users/` 字面量（gate B 不扫 `docs/`，这条没有 CI 兜底）。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 收尾的全局 npm 校验首次采样口径错误（临时 `npm_config_prefix` 未 unset）**
- **Found during:** Task 1（演练收尾核对）
- **Issue:** 收尾时在同一 shell 里跑 `npm ls -g --depth=0`，该 shell 仍导出演练用的临时 `npm_config_prefix`，于是列出的是**临时** prefix 并报 `NOT FOUND`。若不纠正，会被读成「演练把真实全局 CLI 毁了」（T-4-02 违规）。
- **Fix:** 去掉该变量后复测：`@opengsd/gsd-core@1.16.0` 仍在，`command -v gsd_run` 仍解析到 `…/lib/node_modules/@opengsd/gsd-core/gsd-core/bin/gsd_run`。把这次采样错误作为**负向观测**逐字记进证据册并标注「不得充当通过形态」。
- **Files modified:** `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`（「采样口径更正（负向）」行）
- **Verification:** `env -u npm_config_prefix npm ls -g --depth=0 | grep @opengsd/gsd-core` → `├── @opengsd/gsd-core@1.16.0`
- **Committed in:** `ad9bc6e`（Task 1 提交）

**2. [Rule 2 - Missing Critical] README 入口多余空行会破坏「+2 −0」判据**
- **Found during:** Task 2（`git diff BASE -- README.md` 复核）
- **Issue:** 首版在 intro 段与 blockquote 之间、以及 blockquote 与 `##` 之间各补了空行，`--numstat` 变成 `4 0`，与计划验收「恰为 +2 增 0 删」不符。
- **Fix:** 去掉 intro 段与 blockquote 之间的空行（Markdown 允许 blockquote 中断段落，渲染不变），保留 blockquote 与 `##` 之间原有的空行；`--numstat` 回到 `2 0`。
- **Files modified:** `README.md`
- **Verification:** `git diff ad9bc6e --numstat -- README.md` → `2 0`；`node --test tests/docs-consistency.test.mjs` → 13/13；`readme-entry ok`
- **Committed in:** `a210d65`（Task 2 提交）

---

**Total deviations:** 2 auto-fixed（1 blocking / 1 missing critical）
**Impact on plan:** 两处都不改变计划产物与范围：① 只改证据册里的一行记录（并因此多了一条诚实的负向观测），真实 home 零写入这一结论不变；② 只改插入点的空白，README 的两行语义、位置锚点与全部既有断言不变。无 scope creep。

## Issues Encountered

- **`npm pack` 的 `prepack` 用并行 `node --test`**（`package.json` 的 `prepack` 未带 `--test-concurrency=1`）：本计划触发三次，均 37/37 绿、未出现已知的 `gate C: no SKILL.md under skills/gsd-*` 假红。这是既有的结构性隐患（**不属本 phase 范围**，`04-VALIDATION.md:33-35` 已记），本次未改 `package.json`。
- **演练环境限制（已写进文档与证据册）**：装完旧脚本、卸载前这段窗口里 `--dump-config` 会以 YAML 解析失败告终（实测 exit 1 / 0 标头 / stderr 1877 B），原因是模板 profile 的 patch 正文是空数组 `[]` 而旧脚本再追加一个顶层 `- insert:`；真实用户 profile 非空时不复现。处置是**不在该窗口 dump**，并把这条作为负向观测留证。

## User Setup Required

None - no external service configuration required.（演练全部在 `mktemp -d` 的临时 home 与临时 npm prefix 里；真实 `~/.dsh` 与全局 npm prefix 自动前后比对均未变。）

## Next Phase Readiness

- **04-02 可开工**：`docs/MIGRATION.md` 的骨架与 §① 已落盘，§②（三轴差异表）可继续追加；`##` 计数守卫刻意**未**在本计划加（两半各 3 个 `##` 的守卫由 04-03 在 §③ 落地时补，见 04-03 Task 3）。
- **04-03 可复用**：dump 判据的「同一 home `H0`/`H1` 关系 + 标签出现 + stderr 0 B」形态已在 04-01 实测校准（24→25 / 1243→1255），错配演练的 `H1 = H0 − 1` 可直接照此写。
- **04-04 可复用**：隔离头模板（`mktemp -d /tmp/dsh-mig-XXXXXXX` + `npm_config_prefix`）与机器级一面的 `ABSENT`/`PRESENT` 分支已在 §① 与证据册成形。
- **遗留观察（不阻塞）**：`REQUIREMENTS.md` 里 MIG-01 与 MIG-03 各自还有另一半交付（MIG-01 的「真实 home 迁移」属 Phase 5；MIG-03 的「旧仓备料」属 04-02）。两行在本计划完成后按 `requirements.ready-ids` 的实际返回落状态，若被共享 ID 门挡住则留待 04-02 收口。

---
*Phase: 04-migration-coexistence*
*Completed: 2026-11-13*

## Self-Check: PASSED

- **Created files exist:** `docs/MIGRATION.md` FOUND、`.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` FOUND、`04-01-SUMMARY.md` FOUND
- **Commits exist (ancestor of HEAD):** `ad9bc6e` FOUND（Task 1）、`a210d65` FOUND（Task 2）
- **Evaluation scope:** `gsd_run check evaluation-scope --plan 04-01 --commits-only --raw` → `status: resolved`、`commits` 2 条（`a210d65` / `ad9bc6e`）
- **Acceptance criteria re-run after both commits:** Task 1 四段（bash 演练 `DRILL-1 PASS`、`migration-doc-shape ok`、`grep -c DRILL-1` = 2、`drill-evidence ok`）与 Task 2 两段（`docs-consistency` 13/13、`readme-entry ok`）全部通过；tracer feedback gate 对 Task 1 的 `<verify>` 做了整段复跑，输出与验收轮逐字同构
- **Plan-level verification:** 三侧数字交叉核对通过（`1.16.0` / 3084 / 3195 / 3587 / 3856 / 72 / 24→25 在正文·证据册·演练 stdout 三处齐备）；全量串行 `node --test --test-concurrency=1 tests/*.test.mjs` = 37/37 fail 0（计数不变，`BUILD.md:16` 一字未动）；工作树无 `*.tgz` / `package-lock.json` / `node_modules`；`git diff 7de4010 -- package.json BUILD.md tests/` 为空
- **Summary frontmatter:** `requirements-completed: [MIG-01, MIG-03]` 与 PLAN frontmatter 逐字一致；`status: complete`