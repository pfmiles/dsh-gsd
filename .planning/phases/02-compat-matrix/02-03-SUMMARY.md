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
  - .planning/phases/02-compat-matrix/verify-evidence.md 全册（Phase 02 证据册：Task 1 自动化段 7 行 + 负向拒绝 stderr 全文 + Task 2 交互段五项复验 + dump-config 双行 + comm -13 零新增 + 新快照声明闭环，无占位）
  - VER-01 活体拒绝证据（SC3 全半关闭）：host preflight 对 doctored fixture exit 1 + installation rejected + allow-version 指引 + nothing was installed（机器半）；ENGINES 门槛文档可解释性人工阅卷结论 = 可读（人读半）
  - DEV-03 证据链闭环：identity @opengsd/gsd-core/1.20.1 + 版本快照 1.20.1-1.dsh022 + /gsd-health 0 errors + read 精确 .env 硬拦 + dump-config 双行 + comm -13 零新增，全部来自重启后新快照
affects:
  - verify-work（收取 D1：VER-01 负向拒绝机器证据；D2：三项 manual-only live 复验 + ENGINES 人读结论——verifier 按 prohibitions 复核新快照声明后收档）
  - 03-publish（DEV-03 gate 的 02-03 记录是 phase 完成判据之一；CI 首绿仍归 Phase 3）

# Actuals (#2632) — pairs with the plan estimate (32000 tokens).
# Same scale：chars/4 over the files this plan actually authored/changed.
actuals:
  tokens: 6201   # chars/4 over verify-evidence.md (10236 bytes) + 02-03-SUMMARY.md (14568 bytes)，按 wc -c 实测校准（24804/4）
  tasks: 2       # Task 1 + Task 2 全部完成
  commits: 5     # MEASURED (#3968): git rev-list --count plan_head_before..HEAD at SUMMARY write（写档后另有 SUMMARY 收口与 STATE 收口两次提交）
plan_head_before: 44b28d5e57e8e2454eaecd218b63f81c82383f43
plan_head_after: a769ce9bfd4f5bbd85e852523552f645a5f0047f

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "证据记录形态：操作 × UTC 时间戳 × 可观察输出三列 + 负向 stderr 全文 + 机器侧新快照声明（Phase 1 口径延续）"
    - "负向探针安全形态：/tmp 临时 fixture（合法 manifest + 不匹配 engines.dsh 窗口）→ 宿主 preflight 判拒 → 用后即弃 → 无条件复原重装 + 身份复检"
    - "dump-config 双行防子串锚定：整行精确匹配 ^- id: gsd$ 与 ^- id: gsd-hooks-bridge$ 各自计数 1（'gsd' 是 'gsd-hooks-bridge' 的子串，子串命中不充双行）"

key-files:
  created:
    - .planning/phases/02-compat-matrix/verify-evidence.md
    - .planning/phases/02-compat-matrix/02-03-SUMMARY.md
  modified: []

key-decisions:
  - "02-03：负向 doctored fixture 活体拒绝实测文案与 RESEARCH（0.2.2-rc.1 现网实现）预期完全一致——exit 1 + installation rejected + allow-version 双指引（风险声明 + 精确豁免命令）+ nothing was installed（清单/锁文件回滚），preflight 早于 pnpm；无需改判"
  - "02-03：~/.dsh 受管文件基线现为 1066（Phase 1 复证为 987）——属本机部署在两次执行期间的外部演进，非本 phase 写入；INST-02 判据维持 before/after comm -13 零新增（Task 2 已收口：1066=1066）"
  - "02-03：Task 2 precondition 未满足即整体 STOP（不部分执行）——旧监听 pid 90223 启动于 2026-11-10T13:58:39Z 早于复原重装；由人工重启后新 token 会话完成三项 live 复验，而非执行器代跑"
  - "02-03：Task 2 交互段经人工重启收口——3091 监听 pid 90223 → 95618（lstart 2026-11-11T17:38:26Z，晚于复原重装 16:46:14Z）；三项 live 复验均在该新 token 会话通过并录证（/gsd-health 0 errors/2 warnings、read 精确 .env 硬拦 + guard 文案、ENGINES 人读可读）"
  - "02-03：两条自动 verify 由续执行器收口——dump-config exit 0（1321 行）L1280 '- id: gsd' + L1282 '- id: gsd-hooks-bridge' 整行精确各计 1；comm -13 before/after 输出为空（安装侧零新增）"

patterns-established:
  - "pattern: DEV-03 复验计划的分段执行——自动化段由执行器全量留证即时 commit；交互段以 precondition（实例已重启）为门整体挂起（checkpoint:human-action），人工重启后新会话留证 + 续执行器收口自动项与 SUMMARY/STATE"

requirements-completed: [VER-01, DEV-03]  # 三项 live 复验 + 新快照声明闭环后落 Complete（prohibitions ② 已满足）

# Coverage metadata (#1602) — one entry per shipped deliverable.
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
    description: "verify-evidence.md Task 2 交互段（全部完成）：/gsd-health 端到端、read 精确 .env 被 guard 硬拦（exit-2 语义 + 文案）、--dump-config gsd+gsd-hooks-bridge 两行 + comm -13 零新增、ENGINES 门槛文档可解释性人读（VER-01 人读半认领）——全部在重启后新 token 会话留证 + 新快照声明闭环"
    requirement: DEV-03
    verification:
      - kind: manual_procedural
        ref: "/gsd-health 端到端（重启后新会话，pid 95618，2026-11-11T17:54:00Z）→ 0 errors / 2 warnings（W016 config 缺键无害、W010 ~/.dsh/agents 良性、W025 无冲突）——引擎经重装后新快照实际运行"
        status: pass
      - kind: manual_procedural
        ref: "read /tmp/gsd-verify/.env → gsd-secret-read-guard 硬拦（exit-2 语义）文案完整照录；同会话对照 benign-ctl.out 正常放行（positive/negative 双证）"
        status: pass
      - kind: manual_procedural
        ref: "ENGINES 门槛可解释性人读（02-VALIDATION Manual-Only 第 3 行）→ 结论可读：为什么拒 / 该装哪个（engines.dsh 窗口 + 'install a plugin version compatible with this dsh runtime'）/ 想硬装走 --accept-risk（2026-11-11T18:02:38Z 阅卷答复回传）"
        status: pass
      - kind: other
        ref: "dsh --profile gsdtest --dump-config（2026-11-11T18:06:53Z）→ exit 0，L1280 '- id: gsd' + L1282 '- id: gsd-hooks-bridge'；comm -13 dsh-before/dsh-after 为空、test -z exit 0（1066=1066）"
        status: pass
    human_judgment: true
    rationale: "三项 live 复验是重启依赖的手工证据（manual-only 口径）且新快照真实性依赖时间链（build→add→重启→新会话）——机器无法自证证据采集时的进程世系与人工阅卷质量；verifier 须按 prohibitions 复核新快照声明后收档，故保留人工门。"

# Metrics
duration: 86 min   # 16:44:06Z → 18:10:05Z（Task 1 7 min + checkpoint:human-action 人工重启等待 + Task 2 收口 ~2 min）
completed: 2026-11-11
status: complete
---

# Phase 2 Plan 3: 验证实例复验与负向拒绝探针 Summary

**验证实例对 1.20.1-1.dsh022 快照的全量复验闭环：doctored fixture 被宿主 preflight 干净拒绝（VER-01 机器半 exit 1 + 人读半「可读」双关）、DEV-03 三项 live 复验 + 两条自动 verify 全绿留证 verify-evidence.md（新快照声明闭环）——Phase 1 契约回归（dump-config 双行、~/.dsh 零新增、guards 拦截不变）同证**

## Performance

- **Duration:** 86 min（执行器连续段 Task 1 7 min + Task 2 收口 ~2 min；中间为 checkpoint:human-action 的人工重启等待，01-03 同款协作形态）
- **Started:** 2026-11-11T16:44:06Z
- **Completed:** 2026-11-11T18:10:05Z
- **Tasks:** 2/2
- **Files modified:** 1 tracked 新增（verify-evidence.md）+ 02-03-SUMMARY.md + STATE/ROADMAP/REQUIREMENTS metadata

## Accomplishments

- verify-evidence.md 全册齐备（无 ⏳ 残留）：Task 1 自动化段 7 行实测（build/add/identity/version snapshot/负向拒绝/复原重装）+ 负向 stderr 全文；Task 2 交互段五项（/gsd-health、read 精确 .env 硬拦、dump-config 双行、comm -13、ENGINES 人读）实测落档，每行 UTC 时间戳 + 可观察输出
- **VER-01 活体拒绝（SC3 全半关闭）**：doctored fixture（legal manifest + `engines.dsh: ">=0.2.0-rc.1 <0.2.1-0"` 不含运行中的 0.2.2-rc.1）经 `dsh plugin --profile gsdtest add file:/tmp/gsd-compat-fixture` 被宿主安装期 preflight 拒绝——exit 1 + `installation rejected` + `allow-version` 双指引 + `nothing was installed`；ENGINES 门槛可解释性人工阅卷结论 = **可读**（为什么拒 / 该装哪个 / --accept-risk 三点可答）
- **DEV-03 证据链闭环**：identity `@opengsd/gsd-core@1.20.1` + profile 快照 `1.20.1-1.dsh022` + 三项 live 复验全过；新快照声明闭环（build 16:44:37Z → add 16:44:48Z → 重启 pid 95618 17:38:26Z → 新 token 证据 17:54–18:06:53Z）
- **Phase 1 契约回归（truths③）**：dump-config 双行完好——L1280 `- id: gsd` / L1282 `- id: gsd-hooks-bridge` 整行精确命中各 1（防子串误判）；`comm -13 dsh-before dsh-after` 输出为空（1066=1066，安装侧零新增）；guard 硬拦行为不变
- **阶段终检（plan verification ③）**：`node build.mjs` exit 0（`gates: all passed (A/B/C)`，76 树/72 skills）+ `node --test tests/*.test.mjs` **25/25 pass**（6.6s）

## Task Commits

1. **Task 1: DEV-03 自动化段**（tracer：产物重建 + --force 重装 + 身份/版本快照 + 负向 file: 拒绝探针留证） - `9638354` (docs)
2. **Checkpoint 记录**（SUMMARY status: halted + STATE 位置） - `4646e25` (docs)
3. **Task 2 三项人工 live 证据**（/gsd-health 端到端 + read 精确 .env 硬拦 + 新快照声明） - `d1a792e` (docs)
4. **Task 2 人读结论**（ENGINES 门槛可解释性阅卷 = 可读） - `9e063a5` (docs)
5. **Task 2 两条自动 verify 实证**（dump-config 双行 + comm -13 零新增） - `a769ce9` (docs)

**Plan metadata:** 本档 SUMMARY 收口提交与 STATE/ROADMAP/REQUIREMENTS 收口提交各一次（`docs(02-03): complete 验证实例复验与负向拒绝探针 plan`，哈希见 git log）。

## Files Created/Modified

- `.planning/phases/02-compat-matrix/verify-evidence.md` - Phase 02 证据册全册：Task 1 自动化段 + 负向拒绝 stderr 全文 + Task 2 交互段五项 + dump-config 双行 + comm -13 零新增 + 新快照声明闭环
- `.planning/phases/02-compat-matrix/02-03-SUMMARY.md` - 本计划完成总结（status: complete）
- `.planning/STATE.md` / `.planning/ROADMAP.md` / `.planning/REQUIREMENTS.md` - 经 gsd_run state 收口（位置/决策/会话/metric + plan progress + DEV-03/VER-01 落 Complete）

## Decisions Made

- 见 frontmatter key-decisions（5 条：负向文案现实与预期一致；~/.dsh 基线 1066 归因；precondition 未满足即整体挂起；人工重启后三项 live 收口；两条自动 verify 锚定收口）。

## Deviations from Plan

None - plan executed exactly as written.（checkpoint:human-action 是计划设计的交互形态——user_setup 人工重启 3091 由主会话/orchestrator 承担，非偏差。）

## Issues Encountered

None.（Task 2 precondition 未满足时按计划整体挂起，人工重启后接续；无 Rule 1-4 触发。）

## User Setup Required

- 已完成：user_setup 步骤（重启 3091 验证实例，保持 gsdtest profile）由主会话/orchestrator 于 2026-11-11T17:38:26Z 完成（pid 90223 → 95618），Task 2 三项 live 复验随后在新 token 会话留证。无遗留外部配置项。

## Next Phase Readiness

- Phase 02 三计划（02-01/02-02/02-03）SUMMARY 齐全 → `/gsd:verify-work 02` 可收取 D1/D2（D2 保留人工门：verifier 按 prohibitions 复核新快照声明）。
- DEV-03/VER-01 本计划声明已可落 Complete（VER-01 共享声明者 02-01 早有 SUMMARY，共享 ID 门不阻塞）。
- CI 首绿仍归 Phase 3（D-R4）；02-03 完成不触发 CI。

## Self-Check: PASSED

- FOUND: .planning/phases/02-compat-matrix/verify-evidence.md（10236 bytes；Task 2 表无 ⏳/待续占位；新快照声明末段已落位）
- FOUND: commits 9638354 / 4646e25 / d1a792e / 9e063a5 / a769ce9（`git merge-base --is-ancestor` 于 HEAD 均真）
- evaluation-scope --plan 02-03 --commits-only → status resolved，≥1 commits（本分支；exit 0）
- ledger（#3968）实测：plan_head_before=44b28d5，rev-list 计数 = 5，plan_head_after=a769ce9
- Task 2 两条 automated verify 复跑实测：dump-config exit 0、1321 行、`^- id: gsd$` 与 `^- id: gsd-hooks-bridge$` 精确计数各 1（L1280/L1282）；comm -13 输出为空、test -z exit 0（1066=1066）——2026-11-11T18:06:53Z
- 计划级 verification ③ 复跑：node build.mjs exit 0（gates A/B/C all passed）+ node --test tests/*.test.mjs 25/25 pass（6.6s）
- acceptance_criteria 复核：三项复验 + 两条自动项证据齐；dump-config 双行 ✓；comm -13 为空 ✓；无「大概/应该/目测」表述（全部为实测输出照录）；ENGINES 人读有认领与结论 ✓；新快照声明末行存在 ✓

---

*Phase: 02-compat-matrix*
*Completed: 2026-11-11*
