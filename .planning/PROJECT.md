# dsh-gsd

## What This Is

[dsh-gsd](https://github.com/pfmiles/dsh-gsd) 是 GSD Core（规格驱动的编码工作流，72 个 skills + 引擎 + 守卫钩子）在 DeepSeek Harness（DSH）上的官方形态插件：`dsh plugin --profile <name> add dsh-gsd` 一条命令完成安装，不写任何 `~/.dsh` 受管文件、不需要安装脚本。它是 install-gsd-dsh.sh 脚本安装器的插件化替代，目标用户是 DSH 的 web/tui 使用者。

**v1.0 已发布（2026-11-27）**：npm `dsh-gsd@1.20.1-1.dsh022`（`dist-tags.latest`）+ GitHub Release `1.20.1-1.dsh022` + dshmarket 目录收录（[PR #18793](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18793) 已合并）。完整里程碑记录见 `MILESTONES.md`。

## Core Value

**一条命令装好、声明式可回滚的 GSD**：安装/升级/卸载全部由 DSH 原生 bundle 机制承载，如果其他都失败，`dsh plugin add dsh-gsd` → 重启 → `/gsd-health` 可用这条链路必须成立。

## Business Context

<!-- OPTIONAL — 开源社区项目，无商业化。 -->

## Requirements

### Validated（v1.0 已发布）

- ✓ **INST — v1.0**：单命令安装/卸载、零受管 `~/.dsh` 写入、装即注册（无需重启）、展示元数据合规（`locale/{en,zh}.json` + `icon.svg` + `files` 白名单）。全部在一次性 `/tmp` home 上实测，安装后 `cordis.patch.yml` 仍是空数组 `[]`
- ✓ **SKIL — v1.0**：72 个 `gsd-*` 在**真实会话**里可见（判据段 15：干净 home、无 home 级 `skills/`）、`/gsd-health` 端到端、独立 CLI 输出 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`、SKILL.md 零机器特定路径
- ✓ **HOOK — v1.0**：桥接经 bundle patch 行挂载（`--dump-config` 两 row 各恰 1），真实分发路径上 `.env` 读被硬拦（exit 2 + 文案，双哨兵阳性/阴性对照），会话记录里有 `hook/invoked` / `hook/result`，行为与上游一致（basename 规则，不含内容判定）
- ✓ **VER — v1.0**：`engines.dsh` 干净拒绝不兼容版本（负向 doctored fixture 实测）、版本号 `<gsd-ver>-<rev>.dsh<line>`、4 格 × 6 步 CI 矩阵（当前行 install-ok / 前一行 reject）、Node ≥24 门槛与上游对齐
- ✓ **PUB — v1.0**：npm 首发（`latest`、958 files / 4,582,650 B、sha1 = registry `dist.shasum`、发布 commit `a0529ac`）、GitHub Release（`prerelease=false`）、dshmarket 单文件 PR 已合并、LICENSE(MIT)/第三方致谢/CHANGELOG 齐备
- ✓ **MIG — v1.0**：双语 runbook、三轴差异表、四层版本错配症状表、同 profile 与 codegraph/deja/dshmarket 并存实测（四源 row id 两两不相交、`COEXIST-REAL PASS`）、真实 `~/.dsh` 整体迁移（旧源 0、`web`/`headless` 各 1 插件 row）
- ✓ **UAT — v1.0**：7 条 live 用例在**发布字节**上 `7 pass / 0 fail / 0 skipped`；启动开销有基线（base 中位 9 ms / p5 中位 279 ms，事件时间戳口径）；技能 watch 按预登记退路记 `not measured`
- ✓ **DEV — v1.0**：5 个 phase 全程由 3091/gsdtest 上的本插件自己驱动（dogfooding）；插件已装到 `web` / `headless` 两个 profile

> **记账缺口（保留，不抹掉）**：上面 7 组里有 **10 个需求 ID**（SKIL-01/02/05、HOOK-01..04、DEV-01/02/04）从未被任何 phase 的 `Requirements:` 行承保 ⇒ 没有 verifier 针对这些 ID 逐条判过。能力有证据（6 条直接、4 条间接），缺的是 ID 级承保。逐条出处见 `MILESTONES.md` § Known gaps。

### Active

<!-- 下一个里程碑尚未定义。`/gsd-new-milestone` 会重建需求集；v1.0 已固化的需求见上。 -->

### Backlog

- **Phase 02 遗留的 3 条 code review finding（`open`）** —— WR-05 `workflow_dispatch` 输入零匹配时 4 格全 skip 而 run 不红；WR-06 `pins.matrix.dsh` 轴值未要求回溯 `pins.lines`（幽灵轴）；IN-04 矩阵门哨兵 ⑦ 只断 token 存在、不断布尔语义且未覆盖 `uses` 步
- **`dsh-gsd@0.0.0-stage` 未 deprecate** —— npm staged-publishing 的占位版本（2 files / 329 B）仍留在 `versions` 里；registry 对该版本的 `PUT` 返回 `E404`。`dist-tags.latest` 不受影响，只有显式 `@0.0.0-stage` 才会装到它
- **CI 从未设 `DSH_UAT_LIVE`** —— ①②两个 live 用例在 CI 里恒 skip（T-5-12 的 opt-in 策略）；要覆盖需在 `compat-matrix.yml:56` 加 `env: DSH_UAT_LIVE: '1'`
- **README 状态句过时（DOC-01）** —— 「首发…随后落地」写在发布之前
- **`05-UAT.md` 与 `verify-work.md:368` 产物同名（PLAN-01）** —— 归档后已不冲突，但下个里程碑若用 `/gsd-verify-work` 仍会撞
- **`gsd-p3-release` profile 是 CR-01 修复前形态 ⇒ 0 个 `gsd-*` 技能来源** —— 待裁决（重装 or 删除）
- **tui profile 未单独验** —— `headless` 已随 D-10-3 装成
- **GSD_PROFILE=core 精简档**（`dsh-gsd-core` 子包）
- **secret-read-guard 收紧版**（`.env` 结尾判定）—— 已决：保持上游行为

## Technical Context

- **已发布版本**：`dsh-gsd@1.20.1-1.dsh022`（包内引擎 `@opengsd/gsd-core` 1.20.1，72 skills，958 files）
- **栈**：Node ≥ 24、ESM plugin + cordis patch 层、pnpm（DSH 转发）、bash 构建脚本（`build.mjs`）
- **宿主契约**：DSH 0.2.2-rc.1 系（`engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"`）；依赖 `@deepseek-ai/dsh-hooks-claude-code` + `dsh-hook-protocol`（peer 收紧为 exact `0.2.2-rc.1`，与 `pins.json` 同提交强等值）；`FileSystemSkillProvider`（事实公开导出，需版本矩阵守护）
- **资产源**：`@opengsd/gsd-core@<GSD_VERSION>`（默认 1.20.1）npm tarball → 官方安装器 `--claude` staging → staging 根相对改写 + runtime_note 注入 + gates A/B/C（`build.mjs` 已换源生产化，离线三档回退）
- **路径契约**：skills/hooks/引擎包内自定位（`!!js createRequire(baseUrl)`）；运行时引用 `$DSH_PROFILE_DIR/node_modules/dsh-gsd`；任务目录 `$DSH_HOME/tasks`
- **已知宿主限制**：无 PreCompact/FileChanged/statusline 事件、无 agents 注册、无 `@`-include 展开（与 GSD on Codex 同状态）
- **安全**：守卫钩子经 bash 沙箱运行；Linux 无 bubblewrap 时钩子 fail-open（与脚本版同行为）；pnpm 拦截生命周期脚本 = 设计使然（零安装脚本）
- **本次 milestone 学到的四条硬教训**：
  1. **包内自定位必须有守卫**（CR-01）：`skills/` 的定位一度写成 `resolve(dirname(import.meta.url), '..')`，而 `index.js` 本身就在包根 ⇒ 目录逃出包外 ⇒ 72 个技能全部加载不到；正确形态是 `dirname(fileURLToPath(import.meta.url))`（不加 `..`）。**版本号无法区分修复前后**，只有 `index.js` 的形态与技能加载结果能
  2. **凡「产物能否被宿主消费」类判据，必须走到真实消费路径**（不是 `ls` 数文件）
  3. **exit code 一律不作判据**：失败轮同样会创建 session 目录；`plugin add` / `--dump-config` 在 bundle 被静默跳过时同样 exit 0。会话判据的唯一有效形态是「`assistant/message` 在场 ∧ 任何 `turn/end` 递归无 `kind:error`」
  4. **一次 404 不判红**：npm publish 回执到版本可读约 7 分钟（实测），这是传播窗口不是失败

## Prior Art & 决策记录

- SPIKE.md：机制证据 + 真机验证 + 两个踩坑教训（ctx.plugin 不订阅事件；file: 安装打包冻结）
- PLAN.md：P0 已闭环（含 hooks 阳性拦截），P1-P5 规划 → 已全部落地为 v1.0
- 已决（跨 milestone）：命名 `dsh-gsd`（curated registry 主流形态）；引擎资产嵌入；全局 `gsd_run` 不再安装；守卫保持上游行为；dshmarket `category=workflow`
- **Phase 1**：目标版本 1.20.1；gate A 双锚 / gate B 三段式；hooks 桥接适配器 canonical 入库；sequential 执行（DSH 无 worktree 隔离原语）；`node --test` glob 形态（Node v24）
- **Phase 2**：矩阵轴 = 当前行 `0.2.2-rc.1`（install-ok）× 前一行 `0.2.1-rc.5`（expect-reject）× GSD [1.20.1, 1.19.0]；版本编码去点 `dsh022`；日提交工具移出 gitignored `scripts/`；`check-pins` 进 test 不进 prepack
- **Phase 3**：LICENSE=MIT；**对外发布全部推迟 Phase 5**（`private: true` 保留到那时）；先修漂移再 push（判据=四格绿+无红跑历史）；peer 收紧必须 manifest+pins 两文件同提交；README 不得出现 `dsh-gsd@latest`；catalog `icon` 留空（拒 SVG）
- **Phase 4**：runbook 分段（§① 全流程 / §② 三轴差异 / §③ 错配症状），每段命令块都在临时 20 字符 `DSH_HOME` 里真跑过；旧仓互链**只推英文片段**（旧仓 CJK 计数前后均 0）；`COEXIST` 拆静态段 / 演练专用 `COEXIST-DRILL` / 零安装 `COEXIST-REAL` 三段，真实迁移用 listed ⇔ labeled **配对**判据而不比较增量
- **Phase 5**：判据环境一律是一次性 `mkdtemp('/tmp/dsh-uat-')`（真实 `~/.dsh` 全程只读，否则旧源会静默满足判据）；`--test-concurrency=1` 三处齐备并由计数断言守护；`SKIP_DIRS` 补丁落 `build/assets/` + 构建期拷贝（不手改构建产物）；dshmarket **不等合并**（D-09）；D-08 撤掉 `delete_repo` scope
- **验证纪律（本 milestone 反复证伪过的假绿通道，永不重引）**：session 目录存在；npm 的 `+` 行；本仓 commit 校验（`hooks.community` 未设，validator 默认 OFF）；injection scanner 默认只告警；runbook 代码块末尾无条件 `exit 0`；`MISSING:` / `SKIPPED` 仍打印 ok；`--dump-config` **不是**只读操作（会重写 `<profile>/cordis.yml`，且从不 evaluate `!!js`）
- **dogfooding 约定（本项目独有）**：GSD 流程由 3091 验证实例（gsdtest profile + 本插件）驱动；3080 主实例只做基建协助（重启/刷新/提交兜底），不推进 GSD phase

## Constraints

- ~~不在主 profile（3080）上推进任何 GSD phase，直至至少一个 milestone 在验证实例上稳定通过~~ → **已满足**（v1.0 全程在 3091 完成，插件随后装到 `web`/`headless`）
- `.planning/` 提交进 git（GSD 惯例）；构建产物（skills/gsd-core/hooks/config/scripts）不提交
- 每次插件源码变更后必须 `--force` 重装 + 重启验证实例（file: 快照机制）
- **不改本仓 hooks 配置**（`hooks.community` 保持未设）—— 「commit 校验在本仓默认不生效」是一条被断言的开放项，不是一句散文
- **推送纪律**：`origin` 是 SSH 且本机 key 对该账号无效；任何网络 git 操作都用 `git -c credential.helper= -c credential.helper='!gh auth git-credential' … https://github.com/pfmiles/<repo>.git`，HTTP/2 抖动时降级 `-c http.version=HTTP/1.1`
- **registry 纪律**：本机默认 registry 是只读滞后的镜像 `registry.npmmirror.com`，每次读写都要显式 `--registry https://registry.npmjs.org/`

---
*Last updated: 2026-11-27 after v1.0 milestone — v1.0 归档（5 phases / 18 plans / 48 tasks / 132 must-haves passed），npm + GitHub Release + dshmarket 三处对外动作全部落地。此轮完整演进复核留下两件不抹掉的事：10 个需求 ID 从未被任何 phase 承保（能力有证据、ID 无判定，见 MILESTONES.md § Known gaps）；5 份 VERIFICATION 的 `covered_digest` 在收官时全部过期（不是判定被推翻，是共享文件被后续 phase 合法修改；本次未重跑 verifier，也未重算 digest 去「刷新」报告 —— 见 MILESTONES.md § Known verification overrides）。*