---
phase: 02-compat-matrix
plan: 01
subsystem: infra
tags: [compat-matrix, engines.dsh, pins, github-actions, version-scheme, dsh022]

# Dependency graph
requires:
  - phase: 01-build-mjs
    provides: build.mjs exit 0/1/2 契约 + GSD_VERSION 参数化构建（矩阵格 build+gates 步骤直接消费）
provides:
  - build/assets/pins.json（行↔pin 单文件真源：node/version/lines.022/021/matrix 轴值）
  - build/lib/check-pins.mjs（pin/版本/窗口对照校验器，export parseVersion/validateVersion，exit 0/1/2）
  - build/lib/compat-probe.mjs（DSH 宿主 evaluatePluginCompatibility 求值探针，exit 0/1/2）
  - .github/workflows/compat-matrix.yml（compat-matrix 4 格矩阵 CI 本体）
  - tests/compat-matrix.test.mjs（①-⑥ 静态防线，VER-03 静态面 + VER-02 pin 对齐面）
affects:
  - 02-compat-matrix 02-02（version.test/docs-consistency 消费 check-pins 导出面与 pins.json 结构）
  - 02-compat-matrix 02-03（verify-evidence.md 复验证据）
  - 03-publish（push 后 CI 首绿，D-R4）

# Actuals (#2632) — chars/4 over the realized diff; pairs with the plan estimate.
actuals:
  tokens: 4894
  tasks: 2
  commits: 2
plan_head_before: 30e715b7e55188375637dcd694d2a4149fb357dc
plan_head_after: 23b23a44a0e6131a1361f33ce8dc7655575169e7

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "exit 0/1/2 gate 契约（build.mjs 先例）复用为全部新脚本执行语言"
    - "宿主求值为唯一兼容真值：仓库侧只做字符串/等值断言，zero semver math"
    - "pins.json 单文件真源：矩阵轴值/workflow/test/check-pins 全部消费同一文件"

key-files:
  created:
    - build/assets/pins.json
    - build/lib/check-pins.mjs
    - build/lib/compat-probe.mjs
    - .github/workflows/compat-matrix.yml
    - tests/compat-matrix.test.mjs
  modified:
    - package.json

key-decisions:
  - "pins.json 增补顶层 version 键：AC2 篡改负向需要版本等值对照有牙，plan 校验序（a–k）未含该对照；P2-04 禁止第二处硬编码版本串，故期望版本置于 pins.json 本身（唯一版本串真源语义）"
  - "check-pins 在线取样兼容 npm view --json 数组形态：exact spec 亦返回单元素数组，漂移判定 = 数组长 1 且元素等于 pin，其余 registry drift exit 2"
  - "actionlint 1.7.12 经 brew 安装后 0 findings；brew auto-update 卡滞约 20 分钟 → HOMEBREW_NO_AUTO_UPDATE=1 重试同一 brew 安装路径成功（未走 plan 之外的安装源）"

patterns-established:
  - "兼容判定管道：pins.json 期望表 → check-pins 对照（含篡改负向有牙）→ compat-probe 宿主求值（双向 expect）→ matrix workflow → 静态防线测试锁定"

requirements-completed: [VER-01, VER-02, VER-03]

# Coverage metadata (#1602) — one entry per shipped deliverable.
coverage:
  - id: D1
    description: "行↔pin 对齐单文件真源（build/assets/pins.json）+ check-pins 对照校验器 + package.json version 迁至 1.20.1-1.dsh022（版本串单点真源语义）"
    requirement: VER-02
    verification:
      - kind: unit
        ref: "node build/lib/check-pins.mjs --offline"
        status: pass
      - kind: unit
        ref: "篡改负向：version 1.20.1-2.dsh022 → exit 2 version mismatch（列双边值），还原后 exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "当前行宿主求值证据：@deepseek-ai/dsh@0.2.2-rc.1 对插件 manifest 求值 → install-ok（host 返 undefined）"
    requirement: VER-01
    verification:
      - kind: integration
        ref: "npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.2-rc.1 && node build/lib/compat-probe.mjs --dsh 0.2.2-rc.1 --expect install-ok"
        status: pass
    human_judgment: false
  - id: D3
    description: "前一行负向格本地实证：@deepseek-ai/dsh@0.2.1-rc.5 求值 → reject（requirements.engines.dsh 非空），矩阵 2 个 reject 格的本地等价证据"
    requirement: VER-01
    verification:
      - kind: integration
        ref: "npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.1-rc.5 && node build/lib/compat-probe.mjs --dsh 0.2.1-rc.5 --expect reject"
        status: pass
    human_judgment: false
  - id: D4
    description: "compat-matrix workflow 文件（4 格：当前行 2 install-ok + 前一行 2 reject）+ tests/compat-matrix.test.mjs ①-⑥ 静态防线锁定"
    requirement: VER-03
    verification:
      - kind: unit
        ref: "node --test tests/compat-matrix.test.mjs (6/6 pass)"
        status: pass
      - kind: other
        ref: "actionlint 1.7.12 — 0 findings (exit 0)"
        status: pass
      - kind: unit
        ref: "node --test tests/*.test.mjs (15/15 pass: 既有 9 + 新增 6)"
        status: pass
    human_judgment: false

# Metrics
duration: 35min
completed: 2026-11-11
status: complete
---

# Phase 2 Plan 1: 兼容矩阵与 CI Summary

**兼容判定管道全部层位贯通并出双向宿主证据：pin 真源 → check-pins 对照（篡改有牙）→ 宿主求值探针（0.2.2-rc.1 install-ok / 0.2.1-rc.5 reject）→ 4 格矩阵 workflow → 一致性静态防线；version 执行真值迁至 1.20.1-1.dsh022**

## Performance

- **Duration:** 35 min
- **Started:** 2026-11-11T15:42:13Z
- **Completed:** 2026-11-11T16:17:50Z
- **Tasks:** 2/2
- **Files modified:** 6（5 新增 + package.json 单键迁移）

## Accomplishments

- build/assets/pins.json 落为行↔pin 单文件真源（022 当前行/021 前一行、matrix dsh/gsd 轴值、期望 package version），build/assets tracked 配置树先例（D-R6 选项 A）
- check-pins 对照全链有牙：--offline exit 0 `pins: all consistent (line dsh022)`；篡改 version → exit 2 列双边值；在线档 npm view 两件桥接 pin 取样等值；导出 parseVersion/validateVersion 供 02-02 消费
- compat-probe 以宿主 evaluatePluginCompatibility 为唯一真值，两向证据实测：0.2.2-rc.1 → install-ok、0.2.1-rc.5 → reject（requirements.engines.dsh 非空打印），环境 guard hostVersion === --dsh
- .github/workflows/compat-matrix.yml：4 格（当前行 2 install-ok + 前一行 2 reject）× build+gates+tests 内嵌，check-pins --offline 前置，无 dsh plugin add、无第三方 registry/secret
- tests/compat-matrix.test.mjs ①-⑥ 全绿（workflow 存在性/轴值 ⊆ pins.json/expect 列与支持窗一致/选项 A 路径哨兵/编排哨兵/check-pins 消费），零 YAML 依赖
- package.json version `0.1.0-gsd1.20.1` → `1.20.1-1.dsh022`（D-R3 去点线号编码），git diff 仅 version 键一行；engines/private/deps/peer/prepack 全保持
- Tracer 反馈门：Task 1 后全链复跑（check-pins → install-ok 探针 → 15/15 测试）通过，`⚡ Tracer verified end-to-end — expanding`
- actionlint 1.7.12：0 findings（exit 0 通过分支，非跳过）

## Task Commits

Each task was committed atomically:

1. **Task 1: 兼容矩阵一条路径端到端 tracer** - `9847eb5` (feat)
2. **Task 2: 前一行负向格实证 + compat-matrix 一致性防线** - `23b23a4` (test)

## Files Created/Modified

- `build/assets/pins.json` - 行↔pin 对齐单文件真源（node/version/lines.022/021/matrix）
- `build/lib/check-pins.mjs` - pin/版本/窗口对照校验器（exit 0/1/2；--offline/--registry；exports parseVersion/validateVersion）
- `build/lib/compat-probe.mjs` - 宿主求值探针（--dsh/--expect；动态 import + hostVersion guard；exit 0/1/2）
- `.github/workflows/compat-matrix.yml` - 4 格矩阵 CI（checkout@v7/setup-node@v7/node 24；check-pins → 探针 → build → test）
- `tests/compat-matrix.test.mjs` - ①-⑥ 静态防线（workflow ↔ pins.json ↔ check-pins 一致性锁定）
- `package.json` - version → `1.20.1-1.dsh022`（仅此键变化）

## Decisions Made

- 见 frontmatter key-decisions（3 条）。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] pins.json 增补顶层 version 键 + check-pins 版本等值对照**
- **Found during:** Task 1（acceptance criterion AC2 篡改负向）
- **Issue:** plan 校验序（a）–（k）无 package.json version ↔ 期望等值对照；AC2 要求的篡改负向（'1.20.1-2.dsh022' → exit 2）按原文将假绿。P2-04（pin 漂移不得静默存在）与「本 phase 唯一版本串真源」语义要求该对照有牙。
- **Fix:** pins.json 增补顶层 `"version": "1.20.1-1.dsh022"`；check-pins 在（c）/（d）后新增严格等值对照，不符 exit 2 列双边值。
- **Files modified:** build/assets/pins.json, build/lib/check-pins.mjs
- **Verification:** 篡改 version 为 '1.20.1-2.dsh022' → exit 2 `version mismatch — package.json '1.20.1-2.dsh022' vs pins.json version '1.20.1-1.dsh022'`；还原后 exit 0。02-02 的 validateVersion 契约（lines/matrix 判定）不依赖该键，无冲突。
- **Committed in:** 9847eb5 (Task 1 commit)

**2. [Rule 1 - Bug] check-pins peer 对照把组合串当裸 range 直比**
- **Found during:** Task 1（首次 --offline 运行）
- **Issue:** pins.json peer 按 plan 指定为组合串 `"@deepseek-ai/dsh-skill-filesystem <range>"`，对照实现拿 package.json 的裸 range 直比 → 恒 exit 2。
- **Fix:** 对照以 `${peerName} ${peerRange}` 复合后与 line.peer 严格等值。
- **Files modified:** build/lib/check-pins.mjs
- **Verification:** --offline exit 0 `pins: all consistent (line dsh022)`。
- **Committed in:** 9847eb5 (Task 1 commit)

**3. [Rule 1 - Bug] check-pins 在线取样误判 npm --json 数组为漂移**
- **Found during:** Task 2（在线取样 action 步骤 2）
- **Issue:** `npm view <pkg>@<pin> version --json` 对 exact spec 亦返回单元素数组 `["0.2.2-rc.1"]`，实现只认裸字符串 → 恒 registry drift exit 2（fail-closed 但误报）。
- **Fix:** 解析后数组形态须恰一元素且等于 pin；裸字符串形态严格等值；其余仍 drift exit 2。
- **Files modified:** build/lib/check-pins.mjs
- **Verification:** 在线档 exit 0（两件桥接 pin 取样等值）；--offline 档不受影响 exit 0。
- **Committed in:** 23b23a4 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed（1 missing critical + 2 bugs）
**Impact on plan:** 全部为实现 fail-closed 有牙与 plan 自身 acceptance 通过所必需；改动文件集与 files_modified 一致，无 scope creep。

## Issues Encountered

- actionlint 未预装：`brew install actionlint` 首次触发 brew auto-update 卡滞约 20 分钟（homebrew-core 元数据网络缓慢）；kill 后以 `HOMEBREW_NO_AUTO_UPDATE=1` 重试同一 brew 安装路径成功（actionlint 1.7.12）→ 0 findings。**通过分支为 exit 0，非跳过分支（exit 3 ACTIONLINT_UNAVAILABLE 未触发）。**
- `npm install @deepseek-ai/dsh@<line>` 两轮各约 60 s 内完成（在线 registry）；node_modules 均按 verify 链尾 `rm -rf` 清理，package-lock 未产生（--no-package-lock）。
- 探针实况与计划假设一致：host 0.2.2-rc.1 用于 022 行、0.2.1-rc.5 用于 021 行均下载成功且求值环境 guard 通过（无 host spoofing 面）。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 02-02 可直接消费：check-pins 导出面（parseVersion/validateVersion）与 pins.json 结构已按 02-02-PLAN L117 契约落定；README/BUILD.md 文档位从 pins.json 取真值。
- CI 首绿归 Phase 3（D-R4）：workflow 已完成本地 actionlint 0 findings + 本地等价证据，push 后激活。
- DEV-03 活体验证（gsdtest 实例复证 + 负向 live 探针）归 02-03 计划。
- 计划级真值审计：git status 复核 = 恰好 files_modified 六文件（skills/gsd-core/hooks/config/scripts 仍 gitignored，node_modules/package-lock 未出现）。

## Self-Check: PASSED

- 6/6 key files exist on disk（build/assets/pins.json、build/lib/check-pins.mjs、build/lib/compat-probe.mjs、.github/workflows/compat-matrix.yml、tests/compat-matrix.test.mjs、package.json）
- 2/2 task commits ancestor of HEAD（9847eb5、23b23a4）
- evaluation-scope --plan 02-01 --commits-only → status resolved，2 commits（本分支）
- 全链复验：check-pins --offline exit 0；install-ok 探针 exit 0；reject 探针 exit 0；node --test tests/*.test.mjs 15/15；actionlint 0 findings

---

*Phase: 02-compat-matrix*
*Completed: 2026-11-11*
