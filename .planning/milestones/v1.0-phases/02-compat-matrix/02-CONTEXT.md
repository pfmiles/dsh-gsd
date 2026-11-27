# Phase 2: 版本与兼容矩阵 - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/REQUIREMENTS.md)

<domain>
## Phase Boundary

本 phase 交付「DSH 行 × GSD 版本」的兼容矩阵体系：`engines.dsh` 门槛拒绝不兼容安装、插件版本号方案与工具固化、桥接依赖 pin 与 DSH 行对齐、CI 矩阵冒烟验证。目标是让"装哪个版本、与哪行 DSH 适配"成为声明式、可验证、可解释的事实，而非口头约定。

- **Phase Goal（ROADMAP）**: DSH 行 × GSD 版本的兼容矩阵体系，engines.dsh 与依赖 pin 策略固化，CI 冒烟。
- **Depends on**: Phase 1（构建已换源生产化，GSD_VERSION 参数化）
- **Requirements in scope**: VER-01..04, DEV-03
- **Success Criteria（必须全真）**:
  1. `.github/workflows` 存在矩阵 CI（当前 DSH 行 + 前一行 × GSD 版本）
  2. 版本号方案 `<gsd-ver>-<rev>-dsh<line>` 文档化并示例
  3. 不兼容安装被 engines.dsh 干净拒绝，日志可解释
  4. 桥接依赖 pin 与 DSH 行对齐的脚本/文档位

**不在本 phase**：发布三处（PUB-01..04 → P3）、迁移并存与 runbook 全文（MIG-01..04、HOOK-05 的策略文档 + DSH 升级症状/修复 runbook → P4，本 phase 只交付 pin 对齐机制/文档位）、干净机器 UAT（UAT-01..06 → P5）。
</domain>

<decisions>
## Implementation Decisions

以下全部来自 PRD（REQUIREMENTS.md）与 ROADMAP，视为已锁定决策（locked decisions），planner 必须逐条映射进 plan：

### 版本兼容门槛（VER-01）
- `engines.dsh` 门槛拒绝/禁用不兼容版本安装（安装期拒绝，不是装后报错）。
- 不兼容安装的拒绝必须"干净"且日志可解释（Success Criterion 3）——用户能看懂"为什么拒、该装哪个"。
- 当前宿主契约（PROJECT.md）：DSH 0.2.2-rc.1 系，`engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"`。

### 版本号方案（VER-02）
- 插件版本号方案 = `<gsd-ver>-<rev>-dsh<line>`；升级/回滚 = 同命令换版本号。
- 必须文档化并给出示例（Success Criterion 2）。
- 现状锚点：package.json `version: "0.1.0-gsd1.20.1"` 是该形态的雏形但未固化规则（`<gsd-ver>` 与 `<line>` 的表达、`<rev>` 的起算与递增规则均未成文）。

### 兼容矩阵与 CI（VER-03）
- 每个 DSH 兼容行有构建/冒烟验证记录，CI matrix 覆盖「当前 DSH 行 + 前一行」× GSD 版本。
- Success Criterion 1：矩阵 CI 必须存在于 `.github/workflows`。
- 已知：repo（git@github.com:pfmiles/dsh-gsd.git）已建仓，本地 ahead 31 未推，push 后 CI 才成型（STATE.md）。

### Node 门槛（VER-04）
- Node ≥ 24 门槛与 GSD 引擎要求一致，并在 README 声明。
- 现状：package.json `engines.node: ">=24"` 已写；README 声明一致性需核对。

### 自举验证（DEV-03）
- 每个 phase 的完成物在验证实例（gsdtest profile @ 127.0.0.1:3091，本插件 file: 安装）上 gate 通过后才算 done。
- 兼容矩阵相关的运行期验证同样要走验证实例复证（与 Phase 1 的 DEV-03 同口径）。

### Claude's Discretion

PRD 未覆盖、由 planner 研究后定夺的区域（在 plan 中显式落成设计决策，不静默假设）：

- 「当前 DSH 行 + 前一行」的具体取值（0.2.2-rc.1 系之外"前一行"指哪个版本号区间，需研究 DSH 实际发布行）。
- CI 平台/流程的具体形态（Actions workflow 布局、冒烟层级：安装冒烟 vs 静态校验 vs 产物校验）。
- engines.dsh 拒绝的发生点与文案设计（DSH 插件管理器在哪个环节读 engines、拒绝体验如何实现/验证）。
- 桥接依赖 pin 对齐的机制形态（同步脚本 vs 文档位 vs 两者，pin 具体指 `@deepseek-ai/dsh-hooks-claude-code`、`dsh-hook-protocol`、peer `dsh-skill-filesystem`）。
- `<rev>` 的维护规则（起始值、何时递增、发布工具是否强制校验格式）。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 规划与需求
- `.planning/ROADMAP.md` — Phase 2 goal / success criteria / requirements 指派（planner 的边界锚）
- `.planning/REQUIREMENTS.md` — VER-01..04、DEV-03 验收原文（PRD 来源）
- `.planning/PROJECT.md` — 技术上下文：宿主契约、资产源、路径契约、已知宿主限制、约束
- `.planning/STATE.md` — 已锁决策（目标引擎 1.20.1、repo 状态、验证实例）、执行历史与决策记录

### 代码与构建现状
- `package.json` — 当前 engines.dsh / engines.node / 依赖 pin / prepack 链路（VER 改造的直接对象）
- `build.mjs` — GSD_VERSION 参数化构建（矩阵冒烟的可复用执行件）
- `BUILD.md` — 构建四档/gates/exit codes 现状（VER-03 冒烟验证要复用的既定程序）
- `.planning/phases/01-build-mjs/01-01-PLAN.md` — Phase 1 双 gate 口径与验证命令（矩阵冒烟的可复用形态）
- `tests/` — 现有测试形态（`node --test tests/*.test.mjs`）与 gate 脚本契约

### 背景与机制
- `SPIKE.md` — 宿主机制证据（file: 安装快照、版本行为踩坑）
- `README.md` — 现状文档（VER-04 README 声明的核对对象）
</canonical_refs>

<specifics>
## Specific Ideas

- ROADMAP 已预列 plan 布局：`02-01: 兼容矩阵与 CI`、`02-02: 版本号与 pin 策略落地`（planner 默认按此细化，可依 tracer-first 规则调整 wave 归属）。
- package.json 现状：`version: 0.1.0-gsd1.20.1`；`dependencies`: `@deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1`、`@deepseek-ai/dsh-hook-protocol@0.2.2-rc.1`；`peerDependencies`: `@deepseek-ai/dsh-skill-filesystem >=0.2.2-rc.1 <0.3.0-0`。
- Github repo 已存在但未 push（STATE：本地 ahead 31）；CI 矩阵落地可先行在本地验证 workflow 语法（如 `actionlint` 或 GitHub UI 验证），push 是 Phase 3 发布步的前置，不阻塞本 phase 交付 workflow 文件。
- 验证实例（gsdtest/3091）当前 fire: 安装本插件 1.20.1 产物；矩阵冒烟中"装成/装不成"的预期应包含负向用例（推导自 VER-01）。
</specifics>

<deferred>
## Deferred Ideas

- PUB-01..04（GitHub 发布/npm/dshmarket registry）→ Phase 3
- MIG-01..04（迁移 runbook 全文、差异表、并存验证）→ Phase 4
- HOOK-05 的策略文档 + DSH 升级症状/修复 runbook → Phase 4（本 phase 只做 pin 对齐机制/文档位）
- UAT-01..06（干净机器全量验收）→ Phase 5
</deferred>

---

*Phase: 02-compat-matrix*
*Context gathered: 2026-11-11 via PRD Express Path*
