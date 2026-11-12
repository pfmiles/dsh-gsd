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
- ✓ **PUB — Phase 3**：GitHub 仓库 `pfmiles/dsh-gsd` 首次推送且 **CI 首绿**（run 43218878911，四格 install-ok/reject × GSD 1.20.1/1.19.0 全 success，`total_count=1` 无红跑历史）；packaging 面符合 npm 规范（`files` 9 项白名单、pack 清单 958 文件/12 顶层/零泄漏、`prepack` 全量重建）；dshmarket 提交材料齐备（5 字段条目 + 双语提交说明 + 与 README 逐字同源的 install 串）；README 徽章/许可/CHANGELOG 成文。真正 `npm publish` / GitHub Release / dshmarket PR 按 D-02 仍移交 Phase 5
- ✓ **INST-06 — Phase 3**：插件管理器展示元数据合规（`locale/{en,zh}.json` 双语 `meta.title`/`meta.description`、`package.json.icon` 与 `exports['./icon']` 双通道、`files` 收录 locale 与 icon.svg），由 docs-consistency ⑩ 机器守护

### Active

<!-- Current scope. 见 REQUIREMENTS.md 的 8 组检查项。 -->

- INST：一条命令安装、零手工步骤、零 `~/.dsh` 写入（展示元数据 INST-06 已于 Phase 3 合规；"干净机器一条命令"全量验收随 Phase 5 UAT）
- SKIL：72 个 gsd skills + 引擎独立可用（可移植路径）——**注意**：Phase 3 code review 发现 skills 目录定位 off-by-one（CR-01），已修为包根自身并有测试 ④ 守护；"会话内 72 技能可见"仍待 Phase 5 实机观测（SKIL-01 / UAT-01）
- HOOK：hooks 桥接经 bundle 层挂载并真实拦截
- PUB：npm 首次发布、GitHub Release、dshmarket PR —— Phase 3 已完成 GitHub 推送 + CI 首绿 + 发布面材料；三项对外动作按 D-02 待 Phase 5（干净机器 UAT 通过后）
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
- **路径契约**：skills/hooks/引擎包内自定位（`!!js createRequire(baseUrl)`）；运行时引用 `$DSH_PROFILE_DIR/node_modules/dsh-gsd`；任务目录 `$DSH_HOME/tasks`。**Phase 3 教训（CR-01）**：`skills/` 的定位一度写成 `resolve(dirname(import.meta.url), '..')`，而 `index.js` 本身就在包根 ⇒ 目录逃出包外 ⇒ 72 个技能全部加载不到；正确形态是 `dirname(fileURLToPath(import.meta.url))`（不加 `..`），现由 `tests/pack-contents.test.mjs` ④ 以「模拟安装形态 + 求值真实路径表达式」守护。凡「包内自定位」的路径，都必须有这种级别的守卫，不能只靠安装日志
- **已知宿主限制**：无 PreCompact/FileChanged/statusline 事件、无 agents 注册、无 `@`-include 展开（与 GSD on Codex 同状态）
- **安全**：守卫钩子经 bash 沙箱运行；Linux 无 bubblewrap 时钩子 fail-open（与脚本版同行为）；pnpm 拦截生命周期脚本 = 设计使然（零安装脚本）

## Prior Art & 决策记录

- SPIKE.md：机制证据 + 真机验证 + 两个踩坑教训（ctx.plugin 不订阅事件；file: 安装打包冻结）
- PLAN.md：P0 已闭环（含 hooks 阳性拦截），P1-P5 规划 → 本 ROADMAP 的 5 个 phase 与之对应
- 已决：命名 `dsh-gsd`（curated registry 主流形态）；引擎资产嵌入；全局 gsd_run 不再安装；守卫保持上游行为；dshmarket category=workflow
- Phase 1 执行决策：目标版本 1.20.1（checkpoint 人类决策）；gate A 双锚 / gate B 三段式（1.20.1 形态）；hooks 桥接适配器 canonical 入库；sequential 执行模式（DSH 无 worktree 隔离原语）；`node --test` glob 形态（Node v24）
- Phase 2 执行决策：矩阵轴 = 当前行 0.2.2-rc.1（install-ok）× 前一行 0.2.1-rc.5（expect-reject）× GSD [1.20.1, 1.19.0]；CI 首绿归 P3（D-R4）；版本编码去点 `dsh022`（semver 排序病理实测依据）；日提交工具移出 gitignored `scripts/` → `build/assets`+`build/lib`（选项 A，scripts/ 被 build.mjs 捕获段覆盖）；check-pins 进 test 不进 prepack；engines.dsh 窗口保持不动（>=0.2.2-rc.1 <0.3.0-0）
- Phase 3 执行决策（D-01..D-08，见 03-CONTEXT）：LICENSE=MIT；**对外发布全部推迟 Phase 5**（`private: true` 保留）；先修漂移再 push（判据=四格绿+无红跑历史）；CHANGELOG 本 phase 成文、Release 留 P5；peer 收紧为 exact `0.2.2-rc.1` 且**必须 manifest+pins 两文件同提交**（`check-pins` 步骤 (j) 强等值）；README 加裸名命令但**不得出现 `dsh-gsd@latest`**；catalog `icon` 留空（catalog 拒 SVG、只收 GitHub 托管栅格图）；workflow 加 `permissions: contents: read` + install-ok 格门控正向断言
- Phase 3 操作教训（重要，影响后续 phase）：
  - **SSH 不可用**：`origin` 虽配为 `git@github.com:pfmiles/dsh-gsd.git`，但本机 `~/.ssh/id_rsa` 非 pfmiles 账号有效 key（`Server accepts key` 后仍 `Permission denied`，三种 RSA 签名算法皆试）。推送实走显式 HTTPS URL，`origin` 未改。⇒ **将来任何 push 不要假定 SSH 可用**；`git status` 的 ahead 数与 `origin/main` 均陈旧，权威远端 sha 用 `gh api repos/pfmiles/dsh-gsd/commits/main`。
  - **HTTPS 需 `workflow` scope 且 git 用的是另一份凭据**：`gh` token 原本只有 `gist/read:org/repo`，推 workflow 文件被拒；人类执行 `gh auth refresh -h github.com -s workflow -s delete_repo` 扩权后，普通 `git push` 仍失败——`osxkeychain` 里是陈旧凭据；成功形态是 `git -c credential.helper= -c credential.helper='!gh auth git-credential' push …`。
  - **首跑即绿用「临时仓干跑」换证据**：真仓 `total_count` 必须保持 1（SC-5 无红跑历史），故先在一次性 private 仓 `dsh-gsd-ci-probe` 推同一 SHA 验证，绿后删仓再推真仓。
  - **验证要验到实处**：SC-1 的「72 skills」一度是用 `ls` 数包内 SKILL.md，而非观测 provider 实际加载，因而掩盖了 CR-01。后续凡「产物能否被宿主消费」类判据，必须走到真实消费路径。
- **dogfooding 约定（本项目独有）**：GSD 流程由 3091 验证实例（gsdtest profile + 本插件）驱动；3080 主实例只做基建协助（重启/刷新/提交兜底），不推进 GSD phase

## Constraints

- 不在主 profile（3080）上推进任何 GSD phase，直至至少一个 milestone（Phase 1）在验证实例上稳定通过
- `.planning/` 提交进 git（GSD 惯例）；构建产物（skills/gsd-core/hooks/config/scripts）不提交
- 每次插件源码变更后必须 `--force` 重装 + 重启验证实例（file: 快照机制）

---
*Last updated: 2026-11-12 after Phase 3 completion — Phase 3 verified `passed` 13/13 (all six SC green); PUB/INST-06 moved to Validated, PUB's three outward actions (npm publish / GitHub Release / dshmarket PR) remain deferred to Phase 5 per D-02. Phase 3 surfaced one genuine release blocker (CR-01: skills dir off-by-one, 72 skills never loaded) found by code review — not by the phase's own SC-1 evidence, which measured files on disk instead of what the provider loads. It also surfaced two operational facts that reshape all future push work: SSH is unusable from this machine, and the `gh` token now carries `workflow` + `delete_repo` (A-03-02, to be narrowed). Carry-forward to Phase 5 is blocking on one item: a CI run must cover the CR-01-fixed `index.js` before publish.*
