---
phase: 02-compat-matrix
plan: 03
subsystem: infra
tags: [verify-evidence, dev-03, engines.dsh, install-rejection, dsh022, allow-version, verification-instance]

# Dependency graph
requires:
  - phase: 02-compat-matrix
    plan: 01
    provides: build/assets/pins.json + build/lib/check-pins.mjs + build/lib/compat-probe.mjs + .github/workflows/compat-matrix.yml + tests/compat-matrix.test.mjs（本计划复验其产物版本 1.20.1-1.dsh022 快照）
  - phase: 02-compat-matrix
    plan: 02
    provides: tests/version.test.mjs / tests/docs-consistency.test.mjs / README 版本方案与 allow-version 风险声明 / BUILD.md §⑧ 复验序与 §⑨ refresh 语义（本计划证据口径与负向拒绝对照物）
  - phase: 01-build-mjs
    plan: 03
    provides: verify-evidence.md 证据口径先例（操作 × UTC × 可观察输出 + 新快照声明）与 BUILD.md §⑧ 复验序
provides:
  - .planning/phases/02-compat-matrix/verify-evidence.md（Phase 02 证据册：Task 1 自动化段 7 行实测 + 负向拒绝 stderr 全文 + 机器侧新快照声明；Task 2 交互段 ⏳ 占位待续）
  - VER-01 活体拒绝证据（人读半）：host preflight 对 doctored fixture exit 1 + installation rejected + allow-version 指引 + nothing was installed
  - DEV-03 自动化段证据：identity @opengsd/gsd-core/1.20.1 + 版本快照 1.20.1-1.dsh022 + 复原重装身份复检
affects:
  - verify-work（收取 D2：交互段三项 manual-only 复验 + ENGINES 人读——证据须来自重启后新快照）
  - 03-publish（DEV-03 gate 的 02-03 记录是 phase 完成判据之一；CI 首绿仍归 Phase 3）

# Actuals (#2632) — chars/4 over the realized diff; pairs with the plan estimate (32000).
actuals:
  tokens: 1873   # chars/4 over .planning/phases/02-compat-matrix/verify-evidence.md（7494 bytes，先于交互段）
  tasks: 1       # Task 1 完成；Task 2 checkpoint 暂停（人工重启待办），最终 completion 记录由续执行器更新
  commits: 1     # MEASURED: rev-list --count plan_head_before..HEAD
plan_head_before: 44b28d5e57e8e2454eaecd218b63f81c82383f43
plan_head_after: 963835460af23b858573875f9276ac86226bc6b6

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "证据记录形态：操作 × UTC 时间戳 × 可观察输出三列 + 负向 stderr 全文 + 机器侧新快照声明（Phase 1 口径延续）"
    - "负向探针安全形态：/tmp 临时 fixture（合法 manifest + 不匹配 engines.dsh 窗口）→ 宿主 preflight 判拒 → 用后即弃 → 无条件复原重装 + 身份复检"

key-files:
  created:
    - .planning/phases/02-compat-matrix/verify-evidence.md
  modified: []

key-decisions:
  - "02-03：负向 doctored fixture 活体拒绝实测文案与 RESEARCH（0.2.2-rc.1 现网实现）预期完全一致——exit 1 + installation rejected + allow-version 双指引（风险声明 + 精确豁免命令）+ nothing was installed（清单/锁文件回滚），preflight 早于 pnpm；无需改判"
  - "02-03：~/.dsh 受管文件基线现为 1066（Phase 1 复证为 987）——属本机部署在两次执行期间的外部演进，非本 phase 写入；INST-02 判据维持 before/after comm -13 零新增（Task 2 收口）"
  - "02-03：Task 2 precondition 未满足即整体 STOP（不部分执行）——3091 监听 pid 90223 启动于 2026-11-10T13:58:39Z，早于最近一次快照 add（2026-11-11T16:48:40Z），重启依赖的三项 live 复验必须由人工重启后新 token 会话留证"

patterns-established:
  - "pattern: DEV-03 复验计划的分段执行——自动化段（build→add→identity/version→负向探针→复原）由执行器全量留证并即时 commit；交互段以 precondition（实例已重启）为门整体挂起，证据册以 ⏳ 占位禁止预写"

requirements-completed: []  # 检查点未完成：DEV-03/VER-01 须 Task 2 三项 live 复验 + 新快照声明后才落 Complete（本计划 prohibitions 禁止旧快照充当新证据，绝不预写）

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "verify-evidence.md Task 1 自动化段（已交付）：产物重建 → gsdtest --force 重装 → identity @opengsd/gsd-core/1.20.1 → 版本快照 1.20.1-1.dsh022 → doctored fixture 负向活体拒绝（exit 1 + installation rejected + allow-version + nothing was installed）→ 复原重装身份复检，全程 UTC 时间戳 + 机器侧新快照声明"
    requirement: VER-01
    verification:
      - kind: integration
        ref: "dsh plugin --profile gsdtest add file:/tmp/gsd-compat-fixture（engines.dsh >=0.2.0-rc.1 <0.2.1-0）→ exit 1；log 含 installation rejected ×1 / allow-version ×2"
        status: pass
      - kind: other
        ref: "node $DSH_PROFILE_DIR/.../gsd-tools.cjs runtime-identity --raw → {\"packageName\":\"@opengsd/gsd-core\",\"version\":\"1.20.1\"}；profile package.json version === 1.20.1-1.dsh022"
        status: pass
      - kind: other
        ref: "tracer 反馈门全链复跑（V1-V5 全 0：build+add / identity / version / neg probe / restore）；node --test tests/*.test.mjs 25/25（5.5s）"
        status: pass
    human_judgment: false
  - id: D2
    description: "verify-evidence.md Task 2 交互段（未交付，检查点暂停）：/gsd-health 端到端、read 精确 .env 被 guard 硬拦（exit 2 + 文案）、--dump-config gsd+gsd-hooks-bridge 两行 + comm -13 零新增、ENGINES 门槛文档可解释性人读——全部须在重启后新 token 会话留证并补新快照声明"
    requirement: DEV-03
    verification: []
    human_judgment: true
    rationale: "三项复验是重启依赖的活体检查（manual-only 口径）且 ENGINES 文案质量需人工阅卷——执行器无法从会话内重启 3091 自己，也禁止伪造 live 证据；Task 2 尚未执行，无任何 pass 可记，按分类器 fail-safe 必须路由人工。"

# Metrics
duration: 7 min   # Task 1 自动化段实际耗时（16:44:06Z → ~16:50:32Z）
completed: null   # CHECKPOINT — Task 2 待人工重启验证实例后由续执行器收口
status: halted    # 设计内暂停：Task 2 交互段（重启后三项 live 复验）待人工；续执行器完成后重写为 complete
---

# Phase 2 Plan 3: 验证实例复验与负向拒绝探针 Summary

**验证实例负向与正向自动化复验段闭合并留证：doctored fixture 被宿主 preflight 干净拒绝（exit 1 + installation rejected + allow-version 指引 + nothing was installed，stderr 全文入 verify-evidence.md）；1.20.1-1.dsh022 快照 --force 重装、identity/版本双断言、复原重装全过（tracer 门 V1-V5=0，全量测试 25/25）——Task 2 交互段在检查点暂停，待人工重启 3091 后于新会话完成三项 live 复验**

## Performance

- **Duration:** 7 min（仅 Task 1 自动化段）
- **Started:** 2026-11-11T16:44:06Z
- **Checkpointed:** 2026-11-11T16:50:32Z（执行暂停，非完成）
- **Tasks:** 1/2（Task 1 完成；Task 2 因 precondition 未满足整体挂起）
- **Files modified:** 1 tracked 新增（verify-evidence.md；STATE.md 位置更新随 metadata commit）

## Accomplishments

- verify-evidence.md（Phase 02 证据册）Task 1 自动化段 7 行实测记录（操作 × UTC 时间戳 × 可观察输出）：构建 exit 0（gates A/B/C、76 树、72 skills）、add --force exit 0（+6/617ms）、identity `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`、版本快照 `1.20.1-1.dsh022`、负向拒绝 exit 1、复原重装身份复检
- **VER-01 活体拒绝证据（Success Criterion 3 人读半）**：doctored fixture（合法 manifest + `engines.dsh: ">=0.2.0-rc.1 <0.2.1-0"`，窗口不含 0.2.2-rc.1）经 `dsh plugin --profile gsdtest add file:/tmp/gsd-compat-fixture` 被宿主安装期 preflight 拒绝——stderr 全文含 `installation rejected`（为什么拒：engines.dsh requirements 与运行 DSH 版本）+ `allow-version` 双指引（风险声明 + 精确豁免命令）+ `nothing was installed`（清单/锁文件回滚）；fixture 用后即弃、无残留
- DEV-03 自动化段闭合：1.20.1-1.dsh022 快照已强制装入 gsdtest，identity/版本双断言通过；机器侧新快照声明成立（build 16:44:37Z → add 16:44:48Z，产物 mtime 佐证）
- T-2-08 双侧缓释实测：负向探针后无条件复原重装（+6/579ms）+ 身份复检（1.20.1 / 1.20.1-1.dsh022），profile 回到产品快照
- Tracer 反馈门全链复跑通过：5/5 automated verify 命令 V1-V5=0（含负向探针第二次 exit 1 双文案命中）；全量回归 node --test tests/*.test.mjs **25/25 pass**（5.5s）

## Task Commits

Each task was committed atomically:

1. **Task 1: DEV-03 自动化段 — 产物重建 + gsdtest --force 重装 + 身份/版本快照复验 + 负向 file: fixture 活体拒绝探针（留证）** - `9638354` (docs)

**Task 2 未执行**：precondition 未满足（3091 实例未在复原重装后重启）→ 检查点暂停，无 commit。

## Files Created/Modified

- `.planning/phases/02-compat-matrix/verify-evidence.md` - Phase 02 证据册：Task 1 自动化段实录（含负向拒绝 stderr 全文与机器侧新快照声明）+ Task 2 交互段 ⏳ 占位（/gsd-health、.env 拦截、dump-config、comm、ENGINES 人读、新快照声明待补）

## Decisions Made

- 见 frontmatter key-decisions（3 条：负向文案现实与预期一致、~/.dsh 基线 1066 归因、precondition 未满足即整体挂起）。

## Deviations from Plan

None - plan executed exactly as written.

## Checkpoint Status（本计划为 autonomous: false——当前处于设计内暂停）

- **已完成**：Task 1（type=tracer）——全部 7 个动作 + tracer 反馈门复验 + verify-evidence.md 自动化段 + 原子提交 `9638354`。
- **阻断点**：Task 2 `<precondition>` 未满足——3091 监听 pid **90223** 启动于 2026-11-10T13:58:39Z，早于最近一次快照 add（2026-11-11T16:48:40Z tracer 门复原重装），运行实例尚未加载本 phase 新快照；执行器契约禁止从会话内重启自己。
- **待人工**（user_setup 步骤）：由主会话/orchestrator 重启 3091 验证实例（保持 gsdtest profile）→ 新 token 会话 → 三项 live 复验（/gsd-health、read 精确 .env 硬拦、ENGINES 门槛人读）+ 证据记入 verify-evidence.md Task 2 段。
- **续执行器将收口**：Task 2 其余自动项（--dump-config 两行、comm -13 零新增）+ 新快照声明 + SUMMARY 重写为 complete + STATE/ROADMAP 收口。

## Issues Encountered

- 无阻断项。负向探针第二次运行（tracer 门复跑）亦 exit 1 + 双文案命中，拒绝行为稳定可复现。

## User Setup Required

- 重启协作命令与三项检查细则见本次执行返回的 `## CHECKPOINT REACHED`（checkpoint:human-action / gate:blocking-human）——未生成独立 USER-SETUP.md（01-03 同款协作形态，检查点即交接面）。

## Next Phase Readiness

- Task 2 交互段完成后：verify-evidence.md 三项目录齐全 → DEV-03/VER-01 方可落 Complete → `/gsd:verify-work` 可收取 D1/D2（D2 需 verifier 按 prohibitions 复核重启后新快照声明）。
- Phase 终检口径（plan `<verification>` 第 3 条）：prepack 全绿已实测保持（build exit 0 + 25/25）；CI 首绿仍归 Phase 3（D-R4）。

## Self-Check: PASSED

- FOUND: .planning/phases/02-compat-matrix/verify-evidence.md（7494 bytes，7 行自动化段记录 + 负向 stderr 全文 + ⏳ 交互段占位）
- FOUND: commit 9638354（`git merge-base --is-ancestor` 于 HEAD）
- evaluation-scope --plan 02-03 --commits-only → status resolved，1 commit（本分支）；ledger 实测 commits=1（rev-list 44b28d5..HEAD）
- Task 1 acceptance 四项复核：证据册 ≥6 行（7 行）✓；负向 exit 1 + 双文案 + fixture 删除 + 复原身份复检 ✓；版本快照 === 1.20.1-1.dsh022 ✓；dsh-before.txt 留存（1066 行基准）✓
- Tracer 门复验 V1-V5 全 0；全量测试 25/25；STATE.md diff 复核（current_plan 未推进、status 保持 executing、仅位置/决策/state_head 更新）
- 未声明任何重启依赖结论为 pass（/gsd-health、.env 拦截、ENGINES 人读均为 ⏳ 待人工）

---

*Phase: 02-compat-matrix*
*Checkpointed: 2026-11-11*
