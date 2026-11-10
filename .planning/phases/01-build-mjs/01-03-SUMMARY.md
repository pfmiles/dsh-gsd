---
phase: 01-build-mjs
plan: 03
subsystem: infra
tags: [npm, build, docs, verification, hooks-bridge, secret-guard, sbom]

# Dependency graph
requires:
  - phase: 01-build-mjs
    plan: 01
    provides: "build.mjs 取源主链 + 离线三档 + gate A 双锚/gate B 三段式口径 + THIRD-PARTY-NOTICES.md canonical 值"
  - phase: 01-build-mjs
    plan: 02
    provides: "tests/run-gates.sh（双 env 契约）+ prepack/test 全链（glob 形态）+ build/assets/gsd-hooks.json canonical 模板"
provides:
  - "verify-evidence.md：DEV-03 验证实例三项复验完整证据（独立 CLI + /gsd-health + .env 硬拦），含两轮 user_setup 历史与新快照声明（含修复快照 live 通过形态齐备）"
  - "BUILD.md 八章：GSD_VERSION / staging 通道 / 离线在线四档 / Pitfall 1-6 与 gate 排查 / exit 0/1/2 契约 / gates 与 prepack / canonical↔mirror 交叉核对 / 验证实例复验序"
  - "README.md 双语互链：（自举构建段）→ BUILD.md 与 THIRD-PARTY-NOTICES.md"
  - "hooks 桥接适配器回归修复：build/assets/dsh-gsd-suite-run.cjs 入库 + build.mjs 捕获拷贝（守卫 fail-open 根除）"
affects: [verify-work（三项复验与文档证据收取）, 01-02（run-gates.sh 契约引用）, Phase 2（BUILD.md 续写）, DEV-04（Milestone 1 触发依据）]

# Actuals (#2632) — 与 plan 的 estimate（36000 tokens / 3 tasks）同标尺
actuals:
  tokens: 6439   # chars/4 over the realized diff (BUILD.md + verify-evidence.md + README.md diff + build.mjs + build/assets/dsh-gsd-suite-run.cjs)
  tasks: 3
  commits: 4    # MEASURED: rev-list --count plan_head_before..HEAD
plan_head_before: 2c2685255734cbf7e6b30995e1974e52f83cf624
plan_head_after: 14ee71ceee06d7ef58fa7909fa4f44d5f25fbd78

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "证据记录形态：操作 × UTC 时间戳 × 可观察输出三列；live 通过形态必须来自重装后新快照（监听 pid 启动时间 > add 时间佐证），旧快照负向仅作根因历史"
    - "文档双语约定延续：中文正文 + 关键表 EN 注释列；文档 check 用 node 正则断言关键词集 + min_lines"
    - "secret-guard live 直证形态：工具级拒绝（read/bash 两入口）+ wrapper 进程级 decision:block/code:secret-read exit 2 + 良性对照 exit 0 三路闭环"

key-files:
  created:
    - BUILD.md
    - .planning/phases/01-build-mjs/verify-evidence.md
    - build/assets/dsh-gsd-suite-run.cjs
  modified:
    - README.md
    - build.mjs

key-decisions:
  - "01-03：hooks 桥接适配器 dsh-gsd-suite/run.cjs 为 install-gsd-dsh.sh 部署产物、不在 @opengsd/gsd-core npm tarball 树内，01-01 4 树捕获默认丢失 → 全部守卫 MODULE_NOT_FOUND fail-open（live 探针实证）；canonical 入库 build/assets 并由 build.mjs 捕获拷贝进产物（回归 commit 2d45fac；live 复验 commit bca4875）"
  - "01-03：DEV-03 三项复验证据口径 = 可观察输出 + UTC 时间戳 + 新快照声明；live 通过形态只认含修复快照（第二轮 add ≈13:57:48Z → 重启 pid 90223 13:58:39Z → 新 token），第一轮负向仅作根因历史、不充当通过证据"
  - "01-03：BUILD.md 按实况成文——prepack/test 契约写 glob 形态（node --test tests/*.test.mjs，01-02 实测适配）、run-gates.sh 双 env fail-closed（exit 1）、exit 0/1/2 表与 build.mjs 一致；README 原 Build & Release 段已被并发工作流重构为自举构建段，互链定点落在该段（双语各 1 处）、不重写全篇"

patterns-established:
  - "Pattern: 验证实例复验序（build → --force add → 重启 → 新 token → 三项复验 → 留证）为每次插件源码变更的标准回路（BUILD.md §⑧ 固化）"

requirements-completed: [DEV-03, INST-02, SKIL-03, SKIL-04]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "verify-evidence.md：DEV-03 验证实例三项复验证据（独立 CLI identity 1.20.1 + /gsd-health 通过 + read 精确 .env 硬拦 exit 2），含两轮 user_setup 历史、待验标注清零、含修复快照声明闭环"
    requirement: DEV-03
    verification:
      - kind: integration
        ref: "live：read 工具读 /tmp/gsd-verify/.env → 工具级拒绝 + guard 文案；bash cat 同源 → 工具级拒绝"
        status: pass
      - kind: integration
        ref: "live 进程级：wrapper 注入小写 payload → {\"decision\":\"block\",\"code\":\"secret-read\"} exit 2（read+cat 两式）；良性 read README.md exit 0"
        status: pass
      - kind: integration
        ref: "identity：node $DSH_PROFILE_DIR/.../gsd-tools.cjs runtime-identity --raw → @opengsd/gsd-core/1.20.1（exit 0）；--dump-config gsd+gsd-hooks-bridge 两行 exit 0"
        status: pass
    human_judgment: true
    rationale: "交互段证据为 manual-only 口径（01-VALIDATION）：记录形态（guard 文案、健康诊断正文、新快照声明）由 verify-work/verifier 按本计划 prohibitions 复核——不得以\"大概/应该/目测\"表述达标，证据须来自重装后新快照。"
  - id: D2
    description: "BUILD.md 八章构建文档与 SBOM 互链：GSD_VERSION/staging（含 hooks 适配器来源与回归背景）/离线四档（npm cache --offline ENOTCACHED 不依赖）/Pitfall 1-6 + gate A/B/C 排查/exit 0/1/2/gates+prepack 契约/canonical↔mirror 交叉核对（dist.integrity）/复验序"
    requirement: SKIL-03
    verification:
      - kind: other
        ref: "node 断言 11 关键词全命中（含 exit 0/exit 1/exit 2/ENOTCACHED/runtime-identity/run-gates\\.sh/dist\\.integrity）"
        status: pass
      - kind: other
        ref: "min_lines≥120（161 行）；grep THIRD-PARTY-NOTICES ×5；exit 表 0/1/2 三行与 build.mjs 实际行为一致"
        status: pass
    human_judgment: false
  - id: D3
    description: "README 双语互链：自举构建段（zh/en 各 1 处）指向 BUILD.md 与 THIRD-PARTY-NOTICES.md；零安装脚本 / hook 上游 basename 行为既有表述未改写"
    verification:
      - kind: other
        ref: "grep -n 'BUILD.md' README.md → rc=0（2 处）"
        status: pass
    human_judgment: false

# Metrics
duration: 60 min
completed: 2026-11-10
status: complete
---

# Phase 1 Plan 3: 验证实例全量复验与构建文档 Summary

**验证实例三项复验 live 证据闭环（/gsd-health + 独立 CLI + read 精确 .env 硬拦 exit 2，含 hooks 桥接适配器回归的修复与新快照声明）+ BUILD.md 八章构建文档与 README/SBOM 双语互链**

## Performance

- **Duration:** 60 min（含两轮 user_setup 等待与一次 Rule-1 回归修复往返）
- **Started:** 2026-11-10T13:16:53Z
- **Completed:** 2026-11-10T14:17:07Z
- **Tasks:** 3（Task 1 自动化段 + Task 2 交互段 + Task 3 文档）
- **Files modified:** 5（verify-evidence.md 新建、BUILD.md 新建、build/assets/dsh-gsd-suite-run.cjs 新建、build.mjs、README.md）

## Accomplishments

- DEV-03 三项复验全部 live 通过并留证：独立 CLI identity `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；`/gsd-health` 经包内引擎解析（degraded / errors 0 / W016·W010 上游形态）；**read 精确 `.env` 被 guard 硬拦**——read 工具与 bash cat 两入口均被工具级拒绝，进程级直证 `{"decision":"block","code":"secret-read"}` exit 2、良性 read exit 0
- hooks 桥接回归修复闭环：live 探针首探未拦 → 根因 = `hooks/dsh-gsd-suite/run.cjs` 不随 npm tarball → 守卫全链 fail-open → canonical 入库 + build.mjs 捕获拷贝 → 第二轮含修复快照上三项全过，wait-verification 标注清零
- BUILD.md 八章成文（161 行）：GSD_VERSION 恒显式、staging 六步主链、离线四档（含 ENOTCACHED 勿依赖）、Pitfall 1-6 排查、exit 0/1/2 契约、run-gates.sh 双 env + prepack glob 形态实况、canonical↔mirror 交叉核对命令 + SBOM 值、验证实例复验序
- README 双语互链（自举构建段 → BUILD.md + THIRD-PARTY-NOTICES.md），既有安装形态叙述与锁定决策表述未改写

## Task Commits

1. **Task 1: 产物重建 + gsdtest --force 重装 + 独立 CLI/INST-02 安装侧复验（tracer）** - `a95f639` (docs)
2. **Task 2: DEV-03 交互段复验（/gsd-health + dump-config + .env 拦截回归定位修复）** - `2d45fac` (fix，含 wrapper 入库与 build.mjs 捕获段)
3. **Task 2 续（live 复验补记）** - `bca4875` (docs，三项 live 通过形态 + 新快照声明)
4. **Task 3: BUILD.md 八章 + README 互链** - `14ee71c` (docs)

**Plan metadata:** 见 final_commit（docs）。

## Files Created/Modified

- `.planning/phases/01-build-mjs/verify-evidence.md` — 三项复验证据（Task 1 自动化段 + Task 2 交互段含两轮 user_setup 历史、待验标注清零、含修复快照声明）
- `BUILD.md` — 八章构建文档（双语、EN 注释列、TL;DR 快速参考）
- `build/assets/dsh-gsd-suite-run.cjs` — hooks 桥接 stdio adapter canonical 拷贝（install-gsd-dsh.sh 同契约；原不在 npm tarball 树内）
- `build.mjs` — ⑤ 捕获段追加 wrapper 拷贝至产物 hooks/dsh-gsd-suite/run.cjs（4 树语义不变）
- `README.md` — 自举构建段双语互链（BUILD.md + THIRD-PARTY-NOTICES.md）

## Decisions Made

1. hooks 适配器回归按 Rule-1 修复在计划内闭环（归因 = install-gsd-dsh.sh 部署产物不入 tarball，非上游缺陷——修复形态 = 仓库 canonical 拷贝而非改上游）。
2. 三项复验证据口径：可观察输出 + UTC 时间戳 + 新快照声明；通过形态只认含修复快照，旧快照负向仅作根因历史。
3. BUILD.md 全部契约按实况成文（glob 形态 prepack、run-gates.sh 双 env、exit 三角与 build.mjs 逐字一致），README 互链顺应并发重构后的节结构。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug/Security] hooks 桥接适配器丢失 → 全部守卫 fail-open（T-1-SC 类发现）**
- **Found during:** Task 2（第一轮 user_setup 后 live .env 拦截探针：read 与 bash cat 均未被拦）
- **Issue:** 01-01 从 npm tarball 捕获 4 树，默认丢掉了 install-gsd-dsh.sh 部署产物的 `hooks/dsh-gsd-suite/run.cjs`（tarball 树上不存在）；canonical hooks registry 全部命令经它调度 → 每 spawn MODULE_NOT_FOUND → 桥接 fail-open → 所有守卫（含 secret-read）静默失效。
- **Fix:** adapter 作为仓库 canonical 内容入库 `build/assets/dsh-gsd-suite-run.cjs`，build.mjs ⑤ 捕获段拷贝进产物；产物级负/正向证明 + 第二轮重装后 live 复验全过。
- **Files modified:** build/assets/dsh-gsd-suite-run.cjs（新建）、build.mjs
- **Verification:** 产物级 read/cat payload exit 2 + decision:block；`npm test` 7/7；live（3021 快照）read 工具 + bash cat 双入口硬拦、良性 exit 0。
- **Committed in:** 2d45fac（修复）、bca4875（live 补记）

**2. [Rule 1 - Plan-reality] prepack/test/gates 契约口径按 01-01/01-02 交接口径成文**
- **Found during:** Task 3（BUILD.md ⑥ 章）
- **Issue:** plan 旧文 `prepack = node build.mjs && node --test tests/` 与 run-gates 单 env 描述为 1.16.0/规划时代形态；实测契约 = glob 形态 `node --test tests/*.test.mjs`（Node 24 目录参数机械失败，01-02 偏差 2）与 `GSD_VERSION`+`GSD_STAGING_ROOT` 双 env fail-closed（01-01/01-02 SUMMARY 交接口径）。
- **Fix:** BUILD.md 按实况记录并注明逐字断言适配理由；不做任何代码改动。
- **Files modified:** BUILD.md
- **Verification:** BUILD.md 11 关键词断言全过、与 build.mjs/package.json/tests/run-gates.sh 逐项对照一致。
- **Committed in:** 14ee71c

**3. [Rule 1 - Plan-reality] README「原 Build & Release 段」不存在（并发工作流重构）**
- **Found during:** Task 3（读当前 README）
- **Issue:** plan 描述的收缩对象（Build & Release 段）已被并发文档工作流重构为「自举构建」节；直接收缩无从谈起。
- **Fix:** 互链定点落在「自举构建/Bootstrapped」段（双语各 1 处），保持现有结构与双语风格，既有"零安装脚本 / hook 保持上游 basename 行为"表述未改写。
- **Files modified:** README.md
- **Verification:** `grep -n 'BUILD.md' README.md` → 2 处 rc=0。
- **Committed in:** 14ee71c

---

**Total deviations:** 3 auto-fixed（1 security-class regression + 2 plan-reality adaptations）
**Impact on plan:** 均为执行现实适配或安全必需修复；gate/glob 口径属前序 SUMMARY 已批准口径的文档固化。无范围蔓延。

## Issues Encountered

- 两轮 user_setup 往返（执行器契约禁止会话内重启实例）：第一轮会话 live 拦截未过触发回归修复，第二轮含修复快照三项全过。
- 无阻断项；每轮验证失败均一次内收敛。

## Next Phase Readiness

- 三项复验证据 + BUILD.md 齐备：verify-work 可直接收取 D1-D3 覆盖（D1 需 verifier 按 prohibitions 复核新快照声明）；01-VALIDATION DEV-03 行（manual-only，⬜ pending）可标记完成。
- WINDOWS 条目 #1/#2/#3 关闭动作留给 verifier（01-02 已声明）。
- Phase 2（版本与兼容矩阵）可引用 BUILD.md §①/§⑦ 作为版本策略与交叉核对的文档地基；DEV-04 触发点（Milestone 1 稳定通过后装主 profile）以本 plan 的 SC5 达成记录为依据。

## Self-Check: PASSED

- FOUND: BUILD.md / .planning/phases/01-build-mjs/verify-evidence.md / build/assets/dsh-gsd-suite-run.cjs / build.mjs / README.md
- FOUND commits: a95f639 · 2d45fac · bca4875 · 14ee71c（`git merge-base --is-ancestor` 于 HEAD）
- Ledger 实测：commits=4（rev-list 2c26852..HEAD），plan_head_before=2c26852 / plan_head_after=14ee71c（代码/文档变更无未提交残留；未跟踪项仅编排器运行态 milestone.lock/state.json/tmp/）
- 聚合校验：node build.mjs exit 0（.build-cache 档、gates: all passed (A/B/C)、76 树、72 skills）+ node --test tests/*.test.mjs 7/7 pass（6.1s）

---

*Phase: 01-build-mjs*
*Completed: 2026-11-10*
