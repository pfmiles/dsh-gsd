# dsh-gsd

## What This Is

[dsh-gsd](https://github.com/pfmiles) 是 GSD Core（规格驱动的编码工作流，72 个 skills + 引擎 + 守卫钩子）在 DeepSeek Harness（DSH）上的官方形态插件：`dsh plugin --profile <name> add dsh-gsd` 一条命令完成安装，不写任何 `~/.dsh` 文件、不需要安装脚本。它是 install-gsd-dsh.sh 脚本安装器的插件化替代，目标用户是 DSH 的 web/tui 使用者。

## Core Value

**一条命令装好、声明式可回滚的 GSD**：安装/升级/卸载全部由 DSH 原生 bundle 机制承载，如果其他都失败，`dsh plugin add dsh-gsd` → 重启 → `/gsd-health` 可用这条链路必须成立。

## Business Context

<!-- OPTIONAL — 开源社区项目，无商业化。 -->

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ **SKIL（核心）— Phase 1**：72 skills + 引擎独立可用已换源生产化（npm tarball 取源 + staging 改写 + gates），独立 CLI 输出身份 JSON
- ✓ **INST（部分）— Phase 1**：安装面零 `~/.dsh` 写入（987→987 复证）；一条命令安装依赖 DSH 原生机制（P3 发布后全量验收）
- ✓ **HOOK（部分）— Phase 1**：hooks 桥接真实拦截（live read 精确 `.env` hard-block exit 2；含 fail-open 回归修复与机器防线）
- ✓ **DEV（部分）— Phase 1**：自举开发循环成立（本 phase 全部由本插件自己驱动，DEV-03 验证实例 gate 通过）
- ✓ **VER — Phase 2**：待兼容矩阵体系落地——`engines.dsh` 拒绝语义源码级实证（宿主 preflight、allow-version 补救）；版本方案 `<gsd-ver>-<rev>.dsh<line>`（实例 1.20.1-1.dsh022）+ 升级/回滚=同命令换 exact；DSH 矩阵 [0.2.2-rc.1, 0.2.1-rc.5] × GSD [1.20.1, 1.19.0] 4 格 CI workflow；pin 真源 build/assets/pins.json + check-pins；Node ≥24 对齐与 README 双语声明；负向 doctored fixture 活体干净拒绝留证

### Active

<!-- Current scope. 见 REQUIREMENTS.md 的 8 组检查项。 -->

- INST：一条命令安装、零手工步骤、零 `~/.dsh` 写入
- SKIL：72 个 gsd skills + 引擎独立可用（可移植路径）
- HOOK：hooks 桥接经 bundle 层挂载并真实拦截
- PUB：GitHub + npm 发布、dshmarket registry 收录
- MIG：脚本部署用户的迁移 runbook 与并存策略
- UAT：干净机器 8 条端到端验收
- DEV：自举开发循环（本仓库由本插件自己驱动开发，dogfooding）

### Backlog

<!-- Deferred ideas. -->

- GSD_PROFILE=core 精简档（dsh-gsd-core 子包）
- secret-read-guard 收紧版（`.env` 结尾判定）—— 已决：保持上游行为
- tui/headless profile 兼容验证

## Technical Context

- **栈**：Node ≥ 24、ESM plugin + cordis patch 层、pnpm（DSH 转发）、bash 构建脚本（build.mjs）
- **宿主契约**：DSH 0.2.2-rc.1 系（`engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"`）；依赖 `@deepseek-ai/dsh-hooks-claude-code` + `dsh-hook-protocol`（与 DSH 版本对齐）；`FileSystemSkillProvider`（事实公开导出，需版本矩阵守护）
- **资产源**：`@opengsd/gsd-core@<GSD_VERSION>`（默认 1.20.1）npm tarball → 官方安装器 `--claude` staging → staging 根相对改写 + runtime_note 注入 + gates A/B/C（build.mjs 已换源生产化，离线三档回退）
- **路径契约**：skills/hooks/引擎全部包内自定位（`!!js createRequire(baseUrl)`）；运行时引用 `$DSH_PROFILE_DIR/node_modules/dsh-gsd`；任务目录 `$DSH_HOME/tasks`
- **已知宿主限制**：无 PreCompact/FileChanged/statusline 事件、无 agents 注册、无 `@`-include 展开（与 GSD on Codex 同状态）
- **安全**：守卫钩子经 bash 沙箱运行；Linux 无 bubblewrap 时钩子 fail-open（与脚本版同行为）；pnpm 拦截生命周期脚本 = 设计使然（零安装脚本）

## Prior Art & 决策记录

- SPIKE.md：机制证据 + 真机验证 + 两个踩坑教训（ctx.plugin 不订阅事件；file: 安装打包冻结）
- PLAN.md：P0 已闭环（含 hooks 阳性拦截），P1-P5 规划 → 本 ROADMAP 的 5 个 phase 与之对应
- 已决：命名 `dsh-gsd`（curated registry 主流形态）；引擎资产嵌入；全局 gsd_run 不再安装；守卫保持上游行为；dshmarket category=workflow
- Phase 1 执行决策：目标版本 1.20.1（checkpoint 人类决策）；gate A 双锚 / gate B 三段式（1.20.1 形态）；hooks 桥接适配器 canonical 入库；sequential 执行模式（DSH 无 worktree 隔离原语）；`node --test` glob 形态（Node v24）
- Phase 2 执行决策：矩阵轴 = 当前行 0.2.2-rc.1（install-ok）× 前一行 0.2.1-rc.5（expect-reject）× GSD [1.20.1, 1.19.0]；CI 首绿归 P3（D-R4）；版本编码去点 `dsh022`（semver 排序病理实测依据）；日提交工具移出 gitignored `scripts/` → `build/assets`+`build/lib`（选项 A，scripts/ 被 build.mjs 捕获段覆盖）；check-pins 进 test 不进 prepack；engines.dsh 窗口保持不动（>=0.2.2-rc.1 <0.3.0-0）
- **dogfooding 约定（本项目独有）**：GSD 流程由 3091 验证实例（gsdtest profile + 本插件）驱动；3080 主实例只做基建协助（重启/刷新/提交兜底），不推进 GSD phase

## Constraints

- 不在主 profile（3080）上推进任何 GSD phase，直至至少一个 milestone（Phase 1）在验证实例上稳定通过
- `.planning/` 提交进 git（GSD 惯例）；构建产物（skills/gsd-core/hooks/config/scripts）不提交
- 每次插件源码变更后必须 `--force` 重装 + 重启验证实例（file: 快照机制）

---
*Last updated: 2026-11-12 after Phase 2 re-verification — Phases 01 and 02 both re-verified at HEAD (14/14 and 13/13) following the code-review fix commits; requirements unchanged, 3 residual quality items (WR-05/WR-06/IN-04) carried as known debt and one upstream registry drift handed to Phase 3.*
