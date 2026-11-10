# Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用） - Context

**Gathered:** 2026-11-10
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/REQUIREMENTS.md)

<domain>
## Phase Boundary

把 SPIKE 形态的构建脚本生产化：`build.mjs` 的资产来源从"本机部署快照（默认 `~/.dsh`）"切换为 `@opengsd/gsd-core@<GSD_VERSION>` npm tarball → 经官方安装器 `--claude` staging 通道落盘 → 以 staging 根为基准做路径改写。产出带 `scripts/` 兄弟目录的完整包内引擎，独立 CLI 在 repo 产物上直接可用。

**本 phase 交付**：
- `GSD_VERSION` 参数化的取源管线（npm pack → 官方 --claude staging → 产物捕获）
- 以 staging 根为基准的机器无关改写映射（含 `~/`、`$HOME` 形态回退）
- fetched == requested 版本交叉校验（不一致即构建失败）
- `scripts/` 兄弟目录固化进产物
- 验证实例（gsdtest/3091）全量复验 + 构建文档

**不在本 phase**（属 P2-P5 或 backlog）：版本兼容矩阵与 CI、版本号方案、npm/registry 发布、迁移 runbook、干净机器 UAT、GSD_PROFILE 精简档。另：plugins 宿主面板展示、hooks 桥接行为本身在 P0 已闭环，本 phase 只保证构建管线不破坏之。
</domain>

<decisions>
## Implementation Decisions

### 构建取源（PRD locked：INST-02 / SKIL-03，ROADMAP SC2-4）
- 构建源必须是 `@opengsd/gsd-core@<GSD_VERSION>` npm tarball，不再依赖任何本机部署路径；`GSD_BUILD_SOURCE` 仅作为 SPIKE 遗留兼容入口，不作为主路径。
- 复用官方安装器的 `--claude` staging 通道（与 install-gsd-dsh.sh 的 stage 段同逻辑）；改写映射基准 = staging 根，禁止出现 `/Users/...` 或 `~/.dsh` 字面量依赖。
- 改写需覆盖 `~/`、`$HOME` 形态的回退映射（除 staging 根基准外）。
- 产出必须通过校验 gate：任意 SKILL.md 中残留机器特定绝对路径 ⇒ 构建失败；fetched 版本 != requested 版本 ⇒ 构建失败。
- 产物含 `gsd-core/`、`skills/`、`hooks/`、`config/`、`scripts/`（兄弟目录齐备，杜绝 MODULE_NOT_FOUND）。构建产物不入 git；`prepack` 全量重建。
- 独立 CLI 验收（SKIL-03）：`node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 从 repo 产物直接输出 `@opengsd/gsd-core` + 请求版本。
- 72 个 SKILL.md 各恰好一个 runtime_note adapter 块（构建期注入），零残留绝对路径（SKIL-04）。
- 默认目标版本沿用当前已验证快照 `1.16.0`（STATE.md 已锁定），首个打包脚本以该版本为缺省。**执行期修订（2026-11-10 checkpoint blocking-human）：** 默认目标版本改为 `1.20.1`（2026-11-05 发布、仍属 too-new，人类已知悉选择；canonical↔npmmirror dist.integrity 逐字节一致），GSD_VERSION 缺省值随之改 1.20.1。

### 验证与达成（PRD locked：DEV-03）
- 本 phase 全部完成物必须在验证实例（gsdtest profile @ 127.0.0.1:3091）上 gate 通过：`--force` 重装 → 重启 → `/gsd-health` + 独立 CLI + `.env` 拦截三项复验。
- 构建在任何离线/在线环境下都能产出与当前等效的产物树（ROADMAP SC1）。

### 文档（PRD locked：INST-02 / SKIL 组）
- 构建流程文档化：GSD_VERSION 用法、staging 通道说明、离线/在线行为、失败模式与修复。
- README/FAQ 与既有决策保持一致：零安装脚本、hook 行为保持上游 basename 规则（不新建扩展）。

### 打包与安装形态（既有决策，延续不破坏）
- 装机侧零动作（零安装脚本）；构建只发生在发布侧（prepack）。
- 插件包路径契约不变：`$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` 为 runtime 路径锚点。
- `engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"` 暂不改（属 P2）。

### Claude's Discretion
- 离线回退机制的具体实现（本地 .tgz 缓存 / npm cache / `--offline` / 显式离线报错）——由 researcher 调查、planner 落为可执行方案。
- thanks/SBOM 清单的字段粒度（上游版本、许可、来源 URL）——满足 PUB-04 精神即可，P3 发布前再精化。
- staging 临时目录与产物捕获的实现细节（tmp 命名、清理策略、失败留痕）。
- 构建脚本的错误文案与 exit code 约定。
- 是否在 build.mjs 内做 tarball 完整性校验（sha512 / integrity）——遵循 npm pack 默认行为即可。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目与流程
- `.planning/PROJECT.md` — 项目定义、核心价值、技术栈与 7 条已决约束（含 dogfooding 约定）
- `.planning/REQUIREMENTS.md` — 全部验收检查项（本 phase 关联：INST-02、SKIL-03、SKIL-04、DEV-03）
- `.planning/ROADMAP.md` — Phase 1 Goal / 5 条 Success Criteria / 预置 3 个 plan（01-01..01-03）
- `.planning/STATE.md` — 7 条 Key Decisions + Context Snapshot（当前引擎 1.16.0、scripts/ 修复记录）

### 实现先验（P0 成果，必读）
- `SPIKE.md` — 机制证据与真机实测记录：FileSystemSkillProvider 用法、hooks 桥接 configPath/pluginRoot 机制、pnpm 零安装脚本约束、两个踩坑教训（ctx.plugin 不订阅事件；file: 安装打包冻结）
- `PLAN.md` — P1 实施处方原文（取源管线/改写映射/VERSION 校验/SBOM 思路），P2-P5 上下文

### 当前代码（本 phase 修改对象）
- `build.mjs` — SPIKE 构建脚本（本机取材版，将换源；三步骤：剥 adapter → 注入 runtime_note → 路径改写）
- `package.json` — prepack/f文件白名单/依赖与 peer 形态
- `index.js` — 插件 apply()（skills provider + hooks 桥接）
- `cordis.patch.yml` — bundle patch 单行挂载
- `README.md` — 现状说明与安装形态叙述

</canonical_refs>

<specifics>
## Specific Ideas

- 现状数据点（SPIKE 实测）：292 个文件被改写、72 个 SKILL.md 各恰好一个 adapter 块、零残留绝对路径；scripts/ 兄弟目录缺失曾致引擎 MODULE_NOT_FOUND（已在 SPIKE 版 build.mjs 并修复，P1 需在换源后保持）。
- 官方 staging 通道 = `@opengsd/gsd-core` 安装器的 `--claude` 段（stage 到临时目录后摊平），这是 SPIKE 中已验证的复用目标。
- 验证回路（DEV-02）：任何插件源码变更后 `--force` 重装 + 重启验证实例 + 新 token 会话。
- `GSD_VERSION=1.20.1 node build.mjs` 是成功判据的基准命令。
</specifics>

<deferred>
## Deferred Ideas

- 版本号方案 `<gsd-ver>-<rev>-dsh<line>` 与 engines.dsh 收紧 — Phase 2
- CI 兼容矩阵（DSH 行 × GSD 版本）— Phase 2
- npm + GitHub + dshmarket 发布、LICENSE 细项 — Phase 3
- 迁移 runbook 与并存差异表 — Phase 4
- 干净机器 8 项全量 UAT、启动开销量化 — Phase 5
- GSD_PROFILE=core 精简档（dsh-gsd-core 子包）— Backlog
- tui/headless profile 兼容验证 — Backlog
- secret-read-guard 内容级判定收紧 — Backlog（已决：保持上游 basename 行为）

</deferred>

---

*Phase: 01-build-mjs*
*Context gathered: 2026-11-10 via PRD Express Path*
