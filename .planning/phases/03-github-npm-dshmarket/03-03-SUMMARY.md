---
phase: 03-github-npm-dshmarket
plan: 03
subsystem: release / CI-first-run / push-gate
tags: [github-actions, first-ci-run, ssh-push, compat-matrix, four-cell-probe, actionlint, serial-discipline, blocking-human, checkpoint, sc-5]

# Dependency graph
requires:
  - phase: 03-github-npm-dshmarket
    provides: peer 冻结 exact 0.2.2-rc.1（manifest + pins）、workflow permissions 与 install-ok 格门控正向断言、tests/pack-contents.test.mjs 纳管（03-01）
  - phase: 03-github-npm-dshmarket
    provides: npm 元数据 / README 徽章 / CHANGELOG / dshmarket 材料 + ⑧⑨⑩ 断言，全量 32/32 写入 BUILD.md:16（03-02）
provides:
  - 首跑前证据册（Task 1 六项）：四格本地等价 4/4、三档 GSD 构建、actionlint 零 finding、全量套件 32/32、工作树/远端 zero-state、待推提交数 105
  - reject 格的实测反证：根 peer 解析结果为 0.2.2-rc.1 ≠ matrix.dsh 0.2.1-rc.5 —— 机器证明 D-08 的门控（expect==install-ok）是必需的，不是保险
  - Task 2 checkpoint 的完整决策材料（三选项 pros/cons + 当前全部可观测事实）
affects: [03-03 Task 2 decision, 03-03 Task 3 push, "Phase 5 UAT-01", "Phase 5 npm publish / GitHub Release / dshmarket PR"]

# Actuals (#2632) — pairs with the plan's estimate (plan estimate: 26000 tokens / 3 tasks)
actuals:
  tokens: 5855
  tasks: 1
  commits: 1

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "每格独立一次性副本（mktemp -d + rsync 排除 .git/node_modules/*.tgz），跑完即删：四格互不污染，仓根零残留"
    - "CI 命令逐字同源复跑：npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<v> → node build/lib/compat-probe.mjs --dsh <v> --expect <expect>，不使用 --force / --legacy-peer-deps"
    - "三档构建以默认档收尾（GSD_VERSION=1.20.1 → 1.19.0 → 默认）：构建树必须回到仓的 1.20.1 形态，否则后续 pack/复验拿到错引擎"
    - "push 前证据用「同一会话内串行合练」产出，而不是引用历史 SUMMARY 的数字"

key-files:
  created:
    - .planning/phases/03-github-npm-dshmarket/03-03-SUMMARY.md
  modified: []

key-decisions:
  - "Task 1 按 must_haves 的「四格」口径执行：四条矩阵行各用独立的一次性副本跑一遍（而非 plan <verify> 里两格的最小回路），四格 4/4 全绿"
  - "构建轴与 probe 判定相互独立这一事实被实测确认：GSD 轴（1.20.1/1.19.0）不改变 install/probe 结果，四格只有两种 (dsh, expect) 组合"
  - "reject 格实测 root skill-filesystem = 0.2.2-rc.1（exact peer 占位）≠ matrix.dsh 0.2.1-rc.5 —— 这是 D-08 门控断言必须存在的机器证据（无条件断言会让首跑即红）"
  - "在 Task 2（blocking-human）前停住：不 push、不改 remote、不 gh auth refresh、不 rerun、不进 Task 3；SUMMARY 的 run 字段留空并显式标注 NOT AVAILABLE"
  - "SUMMARY 由本次 docs 提交落库（dispatch 要求），而非计划的「计划收尾 metadata commit」：push 未发生，故被推的树里不含任何首跑结论；planning-only 提交，零 CI 输入变化"

patterns-established:
  - "首跑前置证据册的六格结构：四格 / 三档构建 / actionlint / 全量套件 / 工作树+远端 zero-state / 待推提交数"
  - "不可逆对外动作前的「同会话重跑」纪律：不引用历史数字，全部当场复现并留原始输出"

requirements-completed: []   # PUB-01 未完成：Task 3（push + 首跑 conclusion=success）尚未执行

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "四格本地等价全绿：dsh 0.2.2-rc.1 两格 install-ok、dsh 0.2.1-rc.5 两格 reject，每条路径在独立一次性副本里按 CI 同款两行命令跑，全部 exit 0"
    requirement: "PUB-01"
    verification:
      - kind: integration
        ref: "cell 1 dsh=0.2.2-rc.1 gsd=1.20.1 expect=install-ok → added 656 packages / resolved 0.2.2-rc.1 / 'compat-probe: install-ok confirmed' / exit 0"
        status: pass
      - kind: integration
        ref: "cell 2 dsh=0.2.2-rc.1 gsd=1.19.0 expect=install-ok → added 656 packages / resolved 0.2.2-rc.1 / install-ok confirmed / exit 0"
        status: pass
      - kind: integration
        ref: "cell 3 dsh=0.2.1-rc.5 gsd=1.20.1 expect=reject → added 601 packages / '{\"engines.dsh\":\">=0.2.2-rc.1 <0.3.0-0\"}' + 'compat-probe: reject confirmed' / exit 0"
        status: pass
      - kind: integration
        ref: "cell 4 dsh=0.2.1-rc.5 gsd=1.19.0 expect=reject → added 601 packages / reject confirmed / exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "两档 GSD 轴串行构建 + 默认 1.20.1 收尾：三条均 exit 0 且 gates 全过，收尾输出含 copied 76 trees，构建树回到 gsd-core/VERSION=1.20.1"
    verification:
      - kind: integration
        ref: "GSD_VERSION=1.20.1 node build.mjs → exit 0 / gates: all passed (A/B/C) / copied 76 trees / 286 files / 72 skills"
        status: pass
      - kind: integration
        ref: "GSD_VERSION=1.19.0 node build.mjs → exit 0 / gates: all passed (A/B/C) / copied 76 trees"
        status: pass
      - kind: integration
        ref: "node build.mjs（默认）→ exit 0 / gates: all passed (A/B/C) / copied 76 trees；gsd-core/VERSION=1.20.1"
        status: pass
    human_judgment: false
  - id: D3
    description: "workflow 静态合法：actionlint 1.7.12 对 .github/workflows/compat-matrix.yml exit 0 且零输出（非 ACTIONLINT_UNAVAILABLE）"
    verification:
      - kind: unit
        ref: "actionlint（仓根，自动发现唯一 workflow）→ exit 0，output=<empty>；actionlint .github/workflows/compat-matrix.yml → exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "全量套件串行单次 32/32（fail 0 / cancelled 0），N 与 BUILD.md:16 的 32/32 机器等值"
    verification:
      - kind: unit
        ref: "node --test tests/*.test.mjs → ℹ tests 32 / ℹ pass 32 / ℹ fail 0 / ℹ cancelled 0；grep -qF '预期 32/32' BUILD.md → 'pre-push suite 32/32'"
        status: pass
    human_judgment: false
  - id: D5
    description: "push 前工作树与远端 zero-state：除本 SUMMARY 外无未提交改动、无 tracked *.tgz、origin 为 SSH 且 basename == 包名、远端 total_count 仍为 0"
    requirement: "PUB-01"
    verification:
      - kind: integration
        ref: "git status --porcelain -- . ':(exclude)…03-03-SUMMARY.md' → 0 行；git ls-files '*.tgz' → 空；git remote get-url origin → git@github.com:pfmiles/dsh-gsd.git；basename == dsh-gsd；gh api …/actions/runs --jq .total_count → 0"
        status: pass
      - kind: integration
        ref: "git rev-list --count origin/main..HEAD → 105（记录值，未硬编码）；HEAD c82f55e；origin/main d3c8e89；origin/main 的 .github/workflows 文件数 = 0"
        status: pass
    human_judgment: false
  - id: D6
    description: "首次 push + CI 首跑全绿（conclusion=success）且 total_count==1 —— Task 3，尚未执行"
    requirement: "PUB-01"
    verification: []
    human_judgment: true
    rationale: "Task 3 是单向门（公开仓永久 CI 运行历史），按 ABSOLUTE_STOP 与计划设计停在 Task 2 的 checkpoint:decision(gate=blocking-human)，须由人裁决通道与时机后才能执行；本地证据只能降低首跑变红概率，不能替代 gh run list 的 conclusion（03-RESEARCH A1）"

# Metrics
duration: 9min
completed: 2026-11-12
status: halted
---

# Phase 3 Plan 3: 首次 push 与 CI 首绿 Summary

> ## ⚠️ HALTED AT TASK 2 (checkpoint:decision, gate="blocking-human") — PLAN NOT COMPLETE
>
> **本文件目前只承载 Task 1 的证据册。没有 push、没有 remote 变更、没有 `gh auth refresh`、没有 rerun、Task 3 未启动。**
> `requirements-completed: []` 是刻意的：PUB-01 的推送面要等 Task 3 的 `conclusion=success` + `total_count==1` 才算闭合。
> 恢复点 = 人类对 Task 2 的三选一裁决（`push-now-ssh` / `defer-push` / `push-https-token`）。

**四格本地等价 4/4 全绿（656 / 601 包解析树各自匹配 expect）、三档 GSD 构建含默认 1.20.1 收尾（copied 76 trees）、actionlint 零 finding、全量套件串行 32/32 与 BUILD.md:16 等值、工作树干净且远端 `total_count` 仍为 0、本地领先 105 提交 —— 首跑前可先验证明的部分已全部当场复现，停在不可逆推送的裁决点。**

## Performance

- **Duration:** 9 min（生产面约 11:18Z → 11:27Z）
- **Started:** 2026-11-12T11:18:07Z
- **Completed:** 2026-11-12（Task 1；计划整体未完成）
- **Tasks:** 1 / 3（Task 2 = checkpoint，Task 3 未启动）
- **Files modified:** 1（仅本 SUMMARY；零源码/零 workflow/零 manifest 改动）

## Accomplishments（Task 1：push 前证据合练）

### 证据 1/6 — 四格本地等价（四条矩阵行 × 独立一次性副本）

命令与 CI 逐字同源：`npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<v>` → `node build/lib/compat-probe.mjs --dsh <v> --expect <expect>`。每条路径都在 `mktemp -d` 的独立副本里执行（`rsync -a --exclude .git --exclude node_modules --exclude '*.tgz'`），副本用完即删。

| # | matrix.dsh | matrix.gsd | expect | npm install | 根解析 skill-filesystem | probe stdout | exit |
|---|---|---|---|---|---|---|---|
| 1 | 0.2.2-rc.1 | 1.20.1 | install-ok | `added 656 packages in 1m` | `0.2.2-rc.1` | `compat-probe: install-ok confirmed (dsh 0.2.2-rc.1 satisfies engines.dsh >=0.2.2-rc.1 <0.3.0-0)` | 0 |
| 2 | 0.2.2-rc.1 | 1.19.0 | install-ok | `added 656 packages in 58s` | `0.2.2-rc.1` | `compat-probe: install-ok confirmed (…)` | 0 |
| 3 | 0.2.1-rc.5 | 1.20.1 | reject | `added 601 packages in 26s` | `0.2.2-rc.1` | `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}` + `compat-probe: reject confirmed` | 0 |
| 4 | 0.2.1-rc.5 | 1.19.0 | reject | `added 601 packages in 28s` | `0.2.2-rc.1` | `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}` + `compat-probe: reject confirmed` | 0 |

- 四格合计：`4/4 exit 0`；每条路径都打印了自己的 `cell ok: dsh=… gsd=… expect=…`。
- **顺带取得的机器证据（对 D-08 有直接意义）**：reject 两格的根 `@deepseek-ai/dsh-skill-filesystem` 实测解析为 **0.2.2-rc.1**（manifest 的 exact peer 占位），而 `matrix.dsh` 是 **0.2.1-rc.5**。因此 `compat-matrix.yml` 里那条「解析结果 == matrix.dsh」的正向断言**必须**被 `expect == install-ok` 门控 —— 无条件断言会让首次 CI run 就在 reject 格 `exit 2`，直接违反 SC-5。这是实测反证，不是设计口味。
- 副本清理后仓根：`node_modules` 无、`package-lock.json` 无、`*.tgz` 无。

### 证据 2/6 — 两档 GSD 轴 + 默认收尾（严格串行）

| # | 命令 | exit | 耗时 | 关键输出 |
|---|---|---|---|---|
| 1 | `GSD_VERSION=1.20.1 node build.mjs` | 0 | 15s | `gates: all passed (A/B/C)`；`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)` |
| 2 | `GSD_VERSION=1.19.0 node build.mjs` | 0 | 11s | `gates: all passed (A/B/C)`；`fetched @opengsd/gsd-core@1.19.0, copied 76 trees, …` |
| 3 | `node build.mjs`（默认 1.20.1 **收尾**） | 0 | 15s | `gates: all passed (A/B/C)`；`copied 76 trees`；`gsd-core/VERSION = 1.20.1` |

收尾档是必须的：构建树最终停在 **1.20.1** 默认形态（`gsd-core/VERSION` 实测 `1.20.1`）。全量套件里的 `build-smoke` 之后又跑了一次 1.20.1 构建，收束状态保持一致。

### 证据 3/6 — actionlint（推前最后一道静态校验）

```
actionlint                                  → exit 0, output=<empty>
actionlint .github/workflows/compat-matrix.yml → exit 0
```

`actionlint` 1.7.12 在 `/opt/homebrew/bin/actionlint`（**可用**，故本计划不适用 `ACTIONLINT_UNAVAILABLE` 分支）。workflow 内容与 03-01 交付时逐字一致，本次零改动。

### 证据 4/6 — 全量套件（一次、单进程、串行）

```
node --test tests/*.test.mjs
ℹ tests 32
ℹ suites 0
ℹ pass 32
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 18093.6845
```

- exit 0，耗时 19s。
- `BUILD.md:16` = `# 每波可重跑测试（含真实构建 smoke）——预期 32/32（…）`；`grep -qF '预期 32/32'` 命中 → `pre-push suite 32/32`。**N 与文档计数机器等值，未做算术推导。**

### 证据 5/6 — 工作树与远端 zero-state

| 断言 | 命令 | 实测 |
|---|---|---|
| 工作树干净（**只**排除本 SUMMARY） | `git status --porcelain -- . ':(exclude).planning/phases/03-github-npm-dshmarket/03-03-SUMMARY.md'` | 0 行 |
| 无 tracked tarball | `git ls-files '*.tgz'` | 空 |
| origin 是 SSH | `git remote get-url origin` | `git@github.com:pfmiles/dsh-gsd.git` |
| repo 名 == npm 包名 | `basename "$(git remote get-url origin)" .git` vs `package.json.name` | `dsh-gsd` == `dsh-gsd` |
| 远端尚未激活过 CI | `gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count'` | `0` |
| 仓根零安装残留 | `ls node_modules / package-lock.json /*.tgz` | 三者皆 none |

`zero-state gate: PASS`（plan `<verify>` #5 原样执行）。

### 证据 6/6 — 待推提交数（当场观测，不硬编码）

```
git rev-list --count origin/main..HEAD → 105
HEAD          = c82f55ec5f1faaeb166f825a2d40955510add3cb
origin/main   = d3c8e89e300b32f30caa7e4a7bc71a6cf29e479c
git ls-tree -r --name-only origin/main | grep -c '^.github/workflows/' → 0
git ls-tree -r --name-only HEAD        | grep '^.github/workflows/'  → .github/workflows/compat-matrix.yml
```

规划期记的是 93、orchestrator 预检记的是 105 —— 本计划按实测记录 **105**，不采用任何历史值。`origin/main` 目前**没有** `.github/workflows/`，所以本次 push 会是远端首次具备 workflow（也是史上第一次 run 的触发器）。

> **口径补记（落库后）**：本证据册自身的 `docs(03-03)` 提交把待推数从 105 抬到 **106**（`git rev-list --count origin/main..HEAD` 复测）。Task 3 若获准推送，推的就是这 106 个提交；推送前那一刻应再测一次，不用本处数字。

## 当前状态：为什么停在这里

`03-03` 是本 phase 唯一的单向门。推送会在公开仓 `pfmiles/dsh-gsd` 上**永久**创建 CI 运行历史，而用户的成文判据是「首跑即绿、不留红跑历史」（D-03 / SC-5）。一次性的事实已经全部证完（上六项），剩下唯一不可先验排除的变量是 **GitHub runner 与本地环境的差异**（03-RESEARCH A1）。这个门的意义就是让人在「全部可观测事实」面前自己按下开关 —— 所以执行器在 Task 2 停住，不替人决定。

## Task 2 — CHECKPOINT: Decision Required（blocking-human）

**决策：是否现在把 `main` 推送到 `origin`（SSH），让 GitHub Actions 首次激活？**

三项待选（与 PLAN 逐字一致）：

1. **`push-now-ssh`（计划推荐）** — 现在用 SSH 推送。
   - Pros：`origin` 已是 `git@github.com:pfmiles/dsh-gsd.git`，SSH 不受 `gh` token 的 workflow scope 限制（当前 scopes `gist, read:org, repo`，**无** workflow）；Task 1 证据刚跑完，工作树/构建树就是可推状态；一次推送、一次 run，最符合 SC-5。
   - Cons：首跑仍可能因 runner 环境差异变红（A1），届时红跑历史已产生且 SC-5 实质未达成。
2. **`defer-push`** — 暂缓推送，把首跑挪到 Phase 5。
   - Pros：Phase 5 在干净机器 UAT 之后执行对外动作，环境证据更充分。
   - Cons：直接放弃本 phase 的 SC-5 判据；「先修后推」的 D-03 顺序失去意义；workflow 的缺陷要等 Phase 5 才暴露。
3. **`push-https-token`** — 改用 HTTPS 推送并刷新 token scope。
   - Pros：若 SSH 实测不可用，这是唯一替代通道。
   - Cons：需先 `gh auth refresh -s workflow`（改 token = 对外动作 + 扩大凭据权限）；需临时改写 origin；多两个可失败环节。**仅在 SSH 实测失败后考虑。**

**Resume signal：** 回复 `push-now-ssh`（或直接「推」）/ `defer-push` / `push-https-token`；若选第三项，另需确认允许刷新 `gh` token 的 workflow scope。

## Task 3 — NOT EXECUTED（首跑结论字段一览）

| 字段 | 状态 |
|---|---|
| `git push origin main` | **未执行** |
| run `databaseId` | NOT AVAILABLE |
| run `headSha` / `event` | NOT AVAILABLE |
| `conclusion` | NOT AVAILABLE |
| `total_count`（推送前 → 推送后） | `0` → NOT AVAILABLE |
| `origin/main` head sha == 本地 HEAD | NOT AVAILABLE（push 未发生） |

Phase 5 移交清单（五条 + dry-run 禁令）按计划属 **Task 3 的成功分支**，本文件不预填；它们将在 Task 3 执行时写入。

## Decisions Made

- **四格按 must_haves 口径跑满四条矩阵行**：`plan <verify>` 的最小回路只覆盖两种 `(dsh, expect)` 组合，而 `must_haves.truths` 要求「四格」。四格各用独立副本，成本约 3 分钟，换来「矩阵行全覆盖」的无可争议证据。
- **GSD 轴与 probe 判定解耦被实测确认**：1.20.1 / 1.19.0 对 install/probe 无影响（四格只出现 656 与 601 两种包数）。这不是假设，是四格里两两对照的结果。
- **actionlint 用仓根裸命令 + 显式文件路径双跑**：仓内只有一支 workflow，双跑排除「自动发现漏读」的可能。
- **构建顺序 = 1.20.1 → 1.19.0 → 默认 1.20.1**：与计划逐字一致；收尾档额外断言 `copied 76 trees` 与 `gsd-core/VERSION=1.20.1`。
- **在 Task 2 前停住并落 SUMMARY**：证据册是人做决策的输入，必须先于决策存在；同时不把「未发生的推送」写成任何形式的结论。
- **零状态断言用单路径白名单排除**：`:(exclude)` 只排除本 SUMMARY 这一个路径，不是 `.planning/` 通配 —— 其余任何未提交内容照旧会打红。

## Deviations from Plan

### Documented Variances

1. **[Rule — 记录性] 四格执行数 > plan `<verify>` 的两格回路**
   - **Found during:** Task 1（步骤 2）
   - **Issue:** `plan <verify>` 的自动化块 `for cell in "0.2.2-rc.1:install-ok" "0.2.1-rc.5:reject"` 只跑两格；`must_haves.truths` 与 `<action>` 要求「四格、每条路径独立副本」。
   - **Fix:** 按更严的一方执行 —— 四条矩阵行各跑一遍独立副本（4/4 全绿），两格回路是它的真子集。
   - **Verification:** 四格各自 `cell ok` 行 + 上表四行实测输出。
   - **Committed in:** 本 SUMMARY 提交（Task 1 无 tracked 产物）

2. **[Rule — 记录性] SUMMARY 由本次 docs 提交落库，而非「计划收尾的 metadata commit」**
   - **Found during:** Task 1（步骤 7）
   - **Issue:** 计划级设计决策 ② 假定 SUMMARY 在 Task 1/3 期间保持未提交、由收尾提交落库；本次 dispatch 的成功判据要求「evidence 写入 SUMMARY 并提交」。
   - **Fix:** 提交本 SUMMARY（`docs(03-03)`），并把 Task 2/3 的状态显式标为未完成。**零 CI 输入变化**：本文件不在 `files`、不参与 build/tests/pack，被推的树因此只多一个 planning 文档（`.planning/` 本来就在仓内且被 pack 排除）。
   - **Verification:** `git show --stat` 只含该单文件；`git status`（排除本文件口径）仍为 0 行。
   - **Committed in:** 本 SUMMARY 提交

3. **[Rule — 记录性] `requirements-completed: []` 而非照抄 `[PUB-01]`**
   - **Found during:** SUMMARY 撰写
   - **Issue:** 模板要求逐字复制 PLAN 的 `requirements`；但 PUB-01 的决定性一步（推送 + 首跑绿）未执行，标 Complete 会是假陈述（03-01 已把 PUB-01 的判定推迟到本计划）。
   - **Fix:** 留空数组并在顶部 banner 说明「PUB-01 待 Task 3 闭合」。
   - **Verification:** `gh api …/actions/runs --jq .total_count` 仍为 0 —— 没有任何推送发生。
   - **Committed in:** 本 SUMMARY 提交

4. **[Rule — 记录性] frontmatter `status: halted` 而非 `complete`**
   - **Found during:** SUMMARY 撰写
   - **Issue:** 计划在设计的 blocking-human 门处停止，Task 3 未执行；`complete` 会让机器把它当成已收口。
   - **Fix:** 用 `halted`（模板定义：「计划到达设计好的停点、有意留下未完成任务」），并在正文顶部给出恢复点。
   - **Verification:** 本文件 banner + 本节；Task 3 的所有 run 字段标 NOT AVAILABLE。
   - **Committed in:** 本 SUMMARY 提交

---

**Total deviations:** 0 auto-fixed（4 条记录性差异）
**Impact on plan:** 无功能影响 —— 四条都只涉及证据口径与文档状态；Task 2 的决策材料因此更完整（含 reject 格的反证），而单向门未被触碰。

## Issues Encountered

- **无执行期故障。** 四格安装的包数与 03-RESEARCH Pattern 1 的实测值逐字一致（install-ok 656 / reject 601），没有出现 `--force` 时代的 706 包形态。
- **`.planning/milestone.lock` 未出现在 `git status`**：orchestrator 的 `c82f55e` 已把 `/milestone.lock` 加入 `.planning/.gitignore`，Task 1 的干净树断言因此可满足（未改该规则、未碰根 `.gitignore`）。
- **`node_modules` / `package-lock.json` / `*.tgz` 在仓根零残留**：四格全部在 `mktemp -d` 副本内安装，副本随即删除；全量套件与构建都不在仓根产生 node_modules。

## User Setup Required

None - no external service configuration required.（**未** push、**未** 改 remote、**未** `gh auth refresh`、**未** publish、**未**建 Release、**未**提 dshmarket PR。）

## Next Phase Readiness

- **Task 1 的六项证据已齐备**，可以支撑 Task 2 的裁决：四格 4/4、三档构建、actionlint 零 finding、32/32、zero-state、105 提交待推。
- **恢复点唯一**：人类回复 `push-now-ssh` / `defer-push` / `push-https-token`。选第一项后，Task 3 的执行路径是 `git push origin main`（只推 main、不 force、不加 refspec）→ 只观察一条 run（`gh run list --workflow=compat-matrix.yml --limit 1`）→ `gh run watch <databaseId> --exit-status` → 断言 `conclusion=success` 且 `total_count==1`。
- **红跑分支已被计划写死**：若 `conclusion != success` 或 `total_count != 1`，立即停、取证（`gh run view <id> --log-failed`）、标注「SC-5 未达成」，**不得**重推刷绿（P-03-k）。
- **STATE.md 未推进**：本计划未完成，状态推进（plan counter / progress / session）留给 orchestrator 在 Task 3 收口时统一处理，避免出现「9/9 plans complete 但未推送」的假进度。

## Self-Check: PASSED（范围：Task 1）

- 四格 4/4 exit 0 且各自打印 `cell ok` → PASS
- 三条构建 exit 0，收尾含 `copied 76 trees` + `gates: all passed (A/B/C)`，`gsd-core/VERSION=1.20.1` → PASS
- actionlint exit 0 零输出（可用，非 UNAVAILABLE）→ PASS
- 全量套件 32/32，`fail 0` / `cancelled 0`，与 `BUILD.md:16` 等值 → PASS
- 工作树（仅排除本 SUMMARY）0 行、无 tracked `*.tgz`、origin=SSH 且 basename==包名、`total_count==0`、待推 105 → PASS
- 单向门未被触碰：`git remote -v` 与开始时一致，`total_count` 仍 0，无 push/rerun/refresh → PASS

**范围声明：** 本 Self-Check **不**覆盖计划的 `<success_criteria>`（SC-5 需要 `conclusion=success` + `total_count==1`）—— 那部分属于 Task 3，尚未执行。

---

*Phase: 03-github-npm-dshmarket*
*Plan: 03（halted at Task 2 checkpoint — blocking-human）*
*Completed (Task 1 only): 2026-11-12*