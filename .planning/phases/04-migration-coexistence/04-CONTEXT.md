# Phase 4: 迁移与并存 - Context

**Gathered:** 2026-11-13
**Status:** Ready for planning
**Source:** 交互式 discuss（4 个灰度区 × 13 条裁决）；无 SPEC.md、无 RESEARCH.md

<domain>
## Phase Boundary

本 phase 交付「**脚本部署用户的无痛迁移**」与「**两种方式的可解释并存**」—— 是一份可执行、可证伪的迁移规程 + 一张讲得清的差异表 + 一次真实并存实测，**不是**新的安装能力、不是新的构建能力。

- **Phase Goal（ROADMAP 原文）**：脚本部署用户的无痛迁移，两种方式可解释可回退。
- **Requirements in scope**：MIG-01..04。
  - **⚠ 范围出入（须由 planner 在 plan 中裁定并留痕）**：`HOOK-05` **不在** ROADMAP Phase 4 的 Requirements 行里，但 `02-CONTEXT.md` 与 `03-CONTEXT.md` 的 `<deferred>` 两处都明确把它移交 Phase 4。本 CONTEXT 按后者**纳入 HOOK-05**（D-13 即其落法）。若 planner 决定不纳入，必须在 plan 中写明并回写 ROADMAP，不得静默跳过。
- **Success Criteria（ROADMAP 原文，3 条）**：
  1. runbook 全流程在验证机走通（uninstall → add → 复验）
  2. `install-gsd-dsh.sh` README 顶部互链，定位重述为保底/离线
  3. 同 profile 与 codegraph/deja/dshmarket 并存无冲突实测

**不在本 phase**：`npm publish` / GitHub Release / dshmarket PR 本体（→ P5，承 03-D-02）；干净机器 8 项 UAT（UAT-01..06 → P5）；**本机（真实 `DSH_HOME`）的整体迁移**（D-02 → P5）；`dsh-gsd-core` 精简档（Backlog）。

**本 phase 的核心难点不是写文档，是「别把假验收写成真验收」**：仓库里已经存在 72 个同名技能的双源，且它们内容不同。任何「卸载后还能看到 72 个技能」式的判据都可能是旧源在兜底 —— 这正是 Phase 3 CR-01 被掩盖的同一机制（数磁盘文件 ≠ 观测宿主消费）。
</domain>

<decisions>
## Implementation Decisions

以下 13 条为用户裁决（2026-11-13 交互 discuss），planner 必须逐条映射进 plan，不得重新论证。

### 迁移序列与破坏半径

- **D-01 — 机器级整体切换（先卸后装）** — **Reversibility:** costly — 撤销意味着对每个 profile 逐个回退：插件的 `remove` 可逆，但旧部署要靠重跑 `install-gsd-dsh.sh` 重建 `~/.dsh/{skills/gsd-*,gsd-core,hooks,scripts,gsd-hooks.dsh.json}`，且 bridge 块只能从 `.stripped-bak` 手工回填。
  - 采纳 MIG-01 的字面顺序：`--uninstall` → `dsh plugin add` → 复验。**拒绝**「先全量装插件再卸旧」（双源窗口拉长）与「双轨并存、卸载可选」（使 MIG-01 的「避免同名 skills 双源」从硬约束降为建议）。
  - **必须承认的代价**：旧部署是**机器级**的（`~/.dsh` 被所有 profile 共享），插件是 **profile 级**的。`--uninstall` 会 `rm -rf "$DSH_HOME"/skills/gsd-*` 并从 **所有** `profiles/*/cordis.patch.yml` 剥掉 `# GSD-DSH-bridge` / `# GSD-DSH-sandbox` 块。runbook 必须把这层不对称讲明，否则读者会以为「只迁移一个 profile」是安全的。

- **D-02 — 实测只在临时 DSH_HOME 里做，本机真实迁移留 Phase 5**：
  - 演练环境：`DSH_HOME=/tmp/dsh-mig-<ts>`，全流程 = 旧脚本装一遍 → `--uninstall` → `dsh plugin add` → 复验。**零风险，且能真正复现「脚本装过的人」的完整初态**。
  - 本机 `~/.dsh` 的真实迁移**本 phase 不做**（`web` 是用户在用的 profile，`--uninstall` 不认 profile）。与 03-D-02「对外/不可逆动作推迟 Phase 5」同构。
  - 推论：SC-1 的「验证机」= 该临时 home，**不是** 3091 实例的真实 home。

- **D-03 — 未裁决 profile → 硬门中止**：
  - 卸载前若探测到任一 profile 仍引用旧 bridge 块（或仍依赖 `~/.dsh/skills` 下的 gsd-*），runbook **中止**并要求先逐个裁决去向，不得「警告后继续」。
  - 与 Phase 3「不留红跑历史」同风格：宁可卡住，也不留半迁移态。
  - runbook 需给出可复制的探测命令（见 D-07 的双面扫）。

- **D-04 — 默认卸掉全局 CLI** — **Reversibility:** reversible — `npm i -g @opengsd/gsd-core@<ver>` 可原样装回。
  - runbook 默认步骤包含 `npm uninstall -g @opengsd/gsd-core`；`~/.gsd/`（全局 GSD 状态，如 `research-cache`）列为**可选清理**。
  - **理由（事实）**：旧脚本的 `--uninstall` **不**触碰全局 npm 包与 `~/.gsd`；本机实测 PATH 上的 `gsd_run` 解析到 **`@opengsd/gsd-core@1.16.0`**，而插件包内引擎是 **1.20.1**。留着它 = 留下一个落后 5 个小版本的引擎，任何仍按旧文档敲 `gsd_run` 的人都会静默跑错版本。
  - **另需讲清（不要写成"新版也需要它"）**：包内 skills 的 adapter 写的是 `node <GSDROOT>/gsd-core/bin/gsd-tools.cjs`，**不依赖 PATH**；只有旧 skills 才写 `gsd_run` 走 PATH。所以卸掉全局 CLI 不会损伤插件态。

### 双源清除与来源证明

- **D-05 — 判据 = 阴性对照 + 内容比对**：
  - **阴性对照**：卸载后 `~/.dsh` 下**不存在**任何残留 `gsd-*` 技能（旧源已死）。
  - **内容比对**：抽查技能的正文与包内 `skills/<name>/SKILL.md` 逐字/哈希一致（新源是真源）。
  - **两条必须同时成立**：只做阴性对照 → 插件坏掉也能"通过"（0 个技能也满足"旧源为空"）；只做内容比对 → 无法排除混源。
  - **拒绝的判据**：仅 `provider` 日志行（只证明"提供了"，不证明"没混源"）；仅技能计数（多 provider 同名技能可能被去重，144 不一定出现，判据会静默失效）。

- **D-06 — 判据以纯文档 + 可复制命令块交付，不新增随包检测脚本**：
  - 不新增 `scripts/gsd-migrate-check.mjs` 之类的入口（避免长期维护成本）。
  - **同时拒绝改动 `/gsd-health`**：`skills/` 与 `gsd-core/` 是 **构建产物**（gitignored，由 `build.mjs` 从上游 tarball 重建），任何改动下次构建即被覆盖。`scripts/` 虽在 `package.json` 的 `files` 白名单内，但按本裁决**不新增**。

- **D-07 — 阴性对照做「技能 + hooks」双面扫**：
  - 面 1（技能）：`~/.dsh` 下无残留 `gsd-*` 技能目录。
  - 面 2（hooks）：无 profile 仍含 `# GSD-DSH-bridge BEGIN` 块，且无**第二条** `gsd-hooks-bridge` 行。
  - **为何两面都要**：残留技能的后果是「内容串味」（新技能用旧正文），残留 bridge 的后果是「双 bridge 重复拦截」—— 两种失败模式不同，症状不同，不能互相替代。
  - **拒绝**全机 `find`（含 `profiles/*/node_modules`、全局 npm）：输出噪声大，读者看不懂结果。

### 跨仓动作边界

- **D-08 — 本仓改 + 旧仓备料不推（承 03-D-02）** — **Reversibility:** reversible — 备料落地不改变任何远端状态。
  - 在 `dsh-gsd` 的 `README.md` 顶部（中英各一处）加「从脚本迁移」入口，指向 `docs/MIGRATION.md`。
  - 旧仓（`pfmiles/install-gsd-dsh`）的互链**只备料、不提交、不推送**；推送留 Phase 5。
  - **理由**：旧仓是独立仓库（remote `git@github.com:pfmiles/install-gsd-dsh.git`，最近提交 `41fcc7a`，工作树干净），改动即对外写入；且本机 SSH 不可用（PROJECT 已锁的操作教训），推它需另走 `gh` 凭据路径。

- **D-09 — 备料形态 = 粘贴片段 + PR 描述**：
  - 内容：README 顶部 markdown 片段（**中英各一份**）+ 建议插入位置（用章节锚点描述，**不写死行号**）+ PR title/body。
  - **拒绝**真 `git patch`：旧仓一变动就冲突，且要维护基准 sha。
  - **拒绝**只写意图说明：Phase 5 还得重写一遍。

### 差异表与 HOOK-05

- **D-10 — 单篇 `docs/MIGRATION.md`** — **Reversibility:** reversible — 拆篇或并篇都只动文档。
  - 一篇承载三节：① 迁移 runbook ② 三轴差异表 ③ DSH 升级的症状与修复。`README.md` 顶部只加**一行入口**。
  - **拒绝**两篇（迁移 / 排障分开）：本仓文档已有 README、BUILD.md、CHANGELOG、THIRD-PARTY-NOTICES、PLAN.md、SPIKE.md，再加两篇属文档膨胀。

- **D-11 — 双语，与 README 同构**：
  - 中文在前 → `---` 分隔 → 英文在后，与 `README.md` 现有双语结构一致。
  - **理由**：`MIGRATION.md` 是**用户面**文档（脚本用户要照着敲），不是构建者文档（`BUILD.md` 中文单语可接受）；公开仓需兼顾英文访客。
  - 已知成本：写作量翻倍，且日后两份内容需同步维护 —— planner 应把「双语同构」写进验收，避免只写一半。

- **D-12 — 差异表 = 三轴对照表 + 选型建议**：
  - 表头：`轴 | 旧脚本 | 插件 | 迁移影响`，三行对应 MIG-02 点名的三轴：**全局 CLI**、**GSD_PROFILE 档位**、**hooks 归属**。
  - 表前一段「什么情况选哪个」的选型建议。
  - **另必须单列一条「共同限制」**：DSH 只支持 5 类 hook 事件（`SessionStart` / `PreToolUse` / `PostToolUse` / `SubagentStop` / `Stop`），**两种方式都受此限制** —— 不写成差异，否则读者会误以为换到插件能获得更多事件。

- **D-13 — HOOK-05 先做一次真实错配演练，症状表来自实测**：
  - 在临时 `DSH_HOME` 里把**桥接版本或 pin** 改成不匹配，记录真实报错与修复步骤，再把症状 → 原因 → 修复写进 `docs/MIGRATION.md` 第 ③ 节。
  - **拒绝**只写历史已知症状（Phase 1/2 的记录足以"看起来完整"，但未实测的症状会失真 —— 与 Phase 3 verifier 自述指纹不符同类风险）。
  - **拒绝**只演练 `check-pins` 能拦住的静态 pin 漂移：那只是静态门，盖不住运行时症状。

### Claude's Discretion

planner 定夺、须在 plan 中显式落成（不得静默假设）：

- **错配演练的具体注入点**：改 `build/assets/pins.json` 的 `lines.022.peer`（会先红在 `check-pins` 步骤 (j)）vs 改临时 home 里 `node_modules/@deepseek-ai/dsh-hooks-claude-code/package.json` 的版本（更接近真实漂移）。二者症状不同，建议至少覆盖「运行时症状」那一类。
- **MIG-04 并存验证的覆盖面**：本机唯一真实并存样本是 `web` profile（`dsh-deja` + `dshmarket` + 旧 bridge 块）；`codegraph` 在本机**未安装**。在临时 `DSH_HOME` 里复现并存需联网装这几个插件。planner 需裁定：只验 `dsh-deja`/`dshmarket` 即可，还是必须凑齐 codegraph；以及「无冲突」的判定是什么（两行都在 `--dump-config` / 都能 enable / 同名 id 不撞）。
- **临时 `DSH_HOME` 的命名与清理策略**：路径形态、演练后是否保留、失败时的留痕方式。
- **runbook 命令块的组织方式**：单块可整段粘贴 vs 分步逐条（后者更适合「硬门中止」的交互节奏）。
- **`docs/MIGRATION.md` 是否需要在 `tests/docs-consistency.test.mjs` 里加一条守卫**（如「README 顶部含 MIGRATION 链接」）。注意现有 13 条断言钉住了 `private === true`、版本窗口、徽章唯一性等，新增文档不得使其失真。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 规划与需求
- `.planning/ROADMAP.md` — Phase 4 goal / 3 条 Success Criteria / Requirements 指派；Phase 5 的移交面
- `.planning/REQUIREMENTS.md` — MIG-01..04 原文；HOOK-05 原文（`### Hooks 桥接 (HOOK)` 组内）
- `.planning/PROJECT.md` — 技术上下文、路径契约、§Prior Art 的 Phase 3 操作教训（SSH 不可用、`gh` 凭据路径、权威远端 sha 取法）
- `.planning/STATE.md` — 已锁决策、并发纪律

### 前序 phase 裁决（必须继承，不得违反）
- `.planning/phases/03-github-npm-dshmarket/03-CONTEXT.md` — **D-02（对外动作推迟 P5）是本 phase D-08 的直接依据**；另有 D-05 exact peer、D-07 catalog icon 留空等不相关但不可推翻的裁决
- `.planning/phases/02-compat-matrix/02-CONTEXT.md` — `<deferred>` 明确把 HOOK-05 移交 Phase 4；pin 对齐机制（`pins.json` + `check-pins`）的来源
- `.planning/phases/01-build-mjs/01-CONTEXT.md` — 构建产物不得提交、`scripts/` 兄弟目录契约

### 迁移的两个端点（实物）
- `../install-gsd-dsh/install-gsd-dsh.sh` — **旧方式唯一真源**（本机 `~/frontWorkspace/gsd-on-dsh/install-gsd-dsh/`）。⚠ 该路径在 `dsh-gsd` 仓**之外**，fresh clone 里不存在 —— 持久引用请用 `https://github.com/pfmiles/install-gsd-dsh`（基准提交 `41fcc7a`），本 CONTEXT 的 `<specifics>` 已收录其关键行为，可离线据此工作
- `../install-gsd-dsh/README.md` — MIG-03 所指的「旧 README」（23.6 KB，英文，仓内门面）
- `../INSTALL-GSD-DSH-README.md` — ⚠ **另一篇**（16.6 KB，中文，**不在任何仓内**）。与上者内容不同，**不是** MIG-03 的目标，勿混淆
- `README.md` — 本仓门面（双语，中文 1-76 行 / 英文 79-148 行）。D-08 的改动点在其顶部；D-11 的语言形态以它为基准
- `docs/MIGRATION.md` — **本 phase 新建**（D-10/D-11）

### 插件侧的迁移事实
- `package.json` — `files` 白名单（9 项）**不含 `docs/`** ⇒ `docs/MIGRATION.md` **不会进 npm 包**；`version: 1.20.1-1.dsh022`
- `index.js` — skills provider 注册（`includeDefaultRoots: false` + `customSkillDirs: [包内 skills]`）；第 43 行打印 `[dsh-gsd] skills provider: <包内绝对路径>`（D-05 的辅助证据）
- `cordis.patch.yml` — 插件如何挂 `gsd` 与 `gsd-hooks-bridge` 两行；`configPath`/`pluginRoot` 用 `!!js createRequire(baseUrl)` **包内自定位**（D-12 中 hooks 归属轴的对照物）
- `config/gsd-hooks.json` — 包内 hooks 配置（5 事件 / 14 matcher），与旧 `~/.dsh/gsd-hooks.dsh.json` **事件集合完全相同**
- `skills/<name>/SKILL.md` — 包内技能正文（D-05 内容比对的基准；亦被 gitignore）
- `gsd-core/bin/gsd-tools.cjs` — 包内引擎（1.20.1），D-04 中「版本一致」的对照物

### 构建与守卫（了解边界，勿越界改）
- `build.mjs` + `BUILD.md` — 构建四档 / gates / exit 0-1-2；`skills/`、`gsd-core/` 的产物身份
- `build/assets/pins.json` + `build/lib/check-pins.mjs` — pin 真源与校验入口（HOOK-05「pin 对齐策略」的既有落点）
- `tests/docs-consistency.test.mjs` — 13 条文档断言（钉住 `private === true`、版本窗口、徽章唯一性等）。新增文档/链接不得使其失真
- `.github/workflows/compat-matrix.yml` — 4 格矩阵；不属本 phase 改动面
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`/gsd-health` skill**：装后自检入口，runbook 的「复验」一步应当复用它，而不是另发明一套检查。
- **`tests/docs-consistency.test.mjs` 的断言风格**：已有「文档里的字符串必须与 manifest 逐字一致」的守卫形态，可作为「README 顶部入口存在」这条守卫的模板（是否加由 planner 定，见 Discretion）。
- **`check-pins` 步骤 (j)**：已把 `package.json` peer 与 `pins.json` 的 `lines.022.peer` 强等值，是 HOOK-05「pin 对齐」的现成执行件。
- **`.stripped-bak` 机制**：旧脚本剥 bridge 块时会对每个 `cordis.patch.yml` 备份为 `.stripped-bak`，这是 D-01 回滚路径的实物依托（runbook 应指出它的存在与位置）。

### Established Patterns
- **构建产物不可手改**：`skills/`、`gsd-core/`、`hooks/`、`config/`、`scripts/` 由 `build.mjs` 从上游 tarball 重建并被 gitignore。任何「改一下 `/gsd-health` 加个检查」的想法都会在下次构建被冲掉（D-06 的排除依据）。
- **机器特定绝对路径零容忍**：SKIL-04 与 build gate 都要求包内文件不含 `/Users/...`、`~/.dsh` 字面量；插件侧一律用 `!!js` 自定位。写文档时引用路径要区分「用户机器上的路径」（可写）与「包内路径」（用 `<GSDROOT>` 之类占位）。
- **测试并发纪律**：`tests/build-smoke.test.mjs` 会重写构建树，禁止与其它测试并跑（本机并行度 10、6 个测试文件时会出现假红 `gate C: no SKILL.md`）。若本 phase 触及测试，用 `node --test --test-concurrency=1 tests/*.test.mjs`。
- **提交纪律**：`git add` 具体文件，不用 `-A`；`.planning/` 进 git，构建产物不进。

### Integration Points
- **`README.md` 顶部**（中英两段各一处）← D-08 的唯一改动点。
- **`docs/` 目录**（现仅 `dshmarket/`）← `docs/MIGRATION.md` 的落点。**注意 `docs/` 不在 `package.json` 的 `files` 白名单内**：该文档只存在于 GitHub，不会随 npm 包分发。若 planner 认为 npm 用户也需要它，必须显式裁决（加进 `files` 会触发 pack 测试的 `ALLOWED_TOP_LEVEL` 相关断言），**不得默认顺手加**。
- **临时 `DSH_HOME`**（`/tmp/dsh-mig-<ts>`）← D-02/D-13 的演练场，与真实 `~/.dsh` 完全隔离。
- **旧仓备料**（`docs/dshmarket/` 是同类先例：备料放 `docs/` 下、推送留到 Phase 5）← D-09 的形态可照此办理。
</code_context>

<specifics>
## Specific Ideas

### 已实测的事实（planner 不必重查，但可复核）

**双源现状（本机 2026-11-13 实测）**
- `~/.dsh/skills` 共 **84** 项 = **72 个 `gsd-*`** + **12 个 `teamclaw-*`**。旧脚本的 `--uninstall` 只 `rm -rf "$DSH_HOME"/skills/gsd-*`，因此 teamclaw 不受影响。
- **同名技能两边内容不同**：`gsd-health` 旧 3084 B / 插件 3587 B；`gsd-new-project` 旧 3195 B / 插件 3856 B。⇒ 双源不是"重复"，是**冲突**，谁生效取决于 provider 优先级。
- 插件 provider 用 `includeDefaultRoots: false`，只服务包内 `skills/`；而默认的 DSH skills provider 仍会扫 `~/.dsh/skills` ⇒ 两边同时提供同名技能。

**旧脚本 `--uninstall` 的真实行为（读源码实测）**
- 删：`$DSH_HOME/skills/gsd-*`（**无条件**，不查 marker）。
- marker 感知删除：`$DSH_HOME/{gsd-core,hooks,scripts}`（各自查 marker 文件），以及 `$DSH_HOME/gsd-hooks.dsh.json` + 其 `$MARKER`。非本脚本管理的同名目录会被 **跳过**并打印 `SKIPPED ...`。
- 剥块：对 **所有** `$DSH_HOME/profiles/*/cordis.patch.yml` 去掉 `# GSD-DSH-bridge BEGIN…END` 与 `# GSD-DSH-sandbox BEGIN…END`，**每个文件留 `.stripped-bak` 备份**。
- **不删**：全局 npm 包（`@opengsd/gsd-core`）、全局 `gsd_run`、`~/.gsd/`（仅提示「If you also want to drop GSD's global state: rm -rf ~/.gsd」）。

**版本面**
- 全局 `gsd_run`（PATH: `~/.nvm/versions/node/v24.21.0/bin/gsd_run`）→ `@opengsd/gsd-core@**1.16.0**`。
- 插件包内 `gsd-core/bin/gsd-tools.cjs` → `@opengsd/gsd-core@**1.20.1**`；`package.json` version `1.20.1-1.dsh022`。
- 旧 skills 的 adapter 写 `gsd_run` 走 PATH（并推荐 `npm i -g @opengsd/gsd-core`）；包内 skills 的 adapter 写 `node <GSDROOT>/gsd-core/bin/gsd-tools.cjs`，**不碰 PATH**。

**hooks 面（关键纠偏）**
- 旧 `~/.dsh/gsd-hooks.dsh.json` 与包内 `config/gsd-hooks.json` 的**事件集合完全相同**：`SessionStart`(1) / `PreToolUse`(7) / `PostToolUse`(4) / `SubagentStop`(1) / `Stop`(1)，共 **14 个 matcher**，双向差集为空。
- ⇒ MIG-02 的「hooks 事件子集」轴**不是事件差异**，真正差异在 **configPath / pluginRoot 的归属**：旧 = 机器级绝对路径（`/Users/yue.weny/.dsh/gsd-hooks.dsh.json` + pluginRoot `/Users/yue.weny/.dsh`）；新 = 包内自定位（`!!js createRequire(baseUrl)` → `<包>/config/gsd-hooks.json`）。
- 「DSH 只支持 5 类 hook 事件、无 PreCompact/FileChanged/statusline」是**两种方式共同的限制**（PROJECT 已记），必须单列为「共同限制」而非差异（D-12）。

**本机 profile 现状（D-03 硬门的现实样本）**
- `gsdtest`：已装 `dsh-gsd` 插件；`gsd-p3-release`：已装 `dsh-gsd`。
- `web`：`dsh-deja` + `dshmarket` + **仍含 `# GSD-DSH-bridge` 块**（指向 `~/.dsh/gsd-hooks.dsh.json`）—— 唯一的并存样本，也是被 `--uninstall` 波及的对象。
- `headless`：**仍含 `# GSD-DSH-bridge` 块**。
- 根级 `~/.dsh/cordis.patch.yml` 只有 ATC 管理的 MCP 块，无 GSD 内容。
- ⇒ 若现在就在本机跑 `--uninstall`，`web` 与 `headless` 会**同时**失去 bridge 与 72 个技能。这正是 D-02 把真实迁移推到 P5、D-03 设硬门的原因。

**旧仓与文档**
- `pfmiles/install-gsd-dsh`：remote `git@github.com:pfmiles/install-gsd-dsh.git`，HEAD `41fcc7a`，工作树干净。
- 旧仓 `README.md` = 23653 B（英文，`# install-gsd-dsh` → `## Quick start` → … → `## Uninstall` → `## Troubleshooting` → `## License and credits`）。**这是 MIG-03 的目标**。
- `../INSTALL-GSD-DSH-README.md` = 16573 B（中文，`## 1. 它装了什么` … `## 10. 许可与来源说明`），**不在任何仓内**，与上者不同 —— 勿当作 MIG-03 对象。
- `--uninstall` 相关：旧脚本支持 `--uninstall`、`--no-ghooks`、`--no-npm-bin`、`--fix-repo`；环境变量 `DSH_HOME`、`GSD_VERSION`、`GSD_PACKAGE_DIR`（离线）、`GSD_PROFILE`（core|standard|full）、`GSD_FORCE_HOOKS_PATCH`、`GSD_ALLOW_OLD_NODE`、`GSD_NO_BRIDGE_SYNC`、`GSD_HOOKS_SANDBOX_PATCH`、`GSD_INSTALL_BWRAP`。

**GSD_PROFILE 档位（差异表第二轴的事实）**
- 旧方式：`GSD_PROFILE=core|standard|full` 透传给上游安装器（`install-gsd-dsh.sh` 的 `INSTALLER_ARGS+=(--profile=...)`）。
- 新方式：**无对应物** —— 插件恒定携带全部 72 个 skills；精简档 `GSD_PROFILE=core` 等价物是 Backlog 里的 `dsh-gsd-core` 子包（未排期）。
- ⇒ 迁移影响：从 `core`/`standard` 档迁过来的用户会**多得技能**（不是少得），这点必须在差异表里写明，否则会被读成"功能缩水"。

### 现状锚点（供 plan 引用）
- 本仓文档清单：`README.md`（双语）、`BUILD.md`（中文）、`CHANGELOG.md`、`THIRD-PARTY-NOTICES.md`、`PLAN.md`、`SPIKE.md`、`docs/dshmarket/{README.md,pfmiles__dsh-gsd.yml}`。`docs/MIGRATION.md` 是**新增**的第 8 篇。
- 测试面：`npm test` = `node --test tests/*.test.mjs` = 6 文件 / **37** 个顶层用例（build-smoke 2、compat-matrix 8、docs-consistency 13、pack-contents 4、rewrite-map 7、version 3）。
</specifics>

<deferred>
## Deferred Ideas

- **本机（真实 `~/.dsh`）的整体迁移** → Phase 5（D-02；届时 `web`/`headless` 一并处置）
- **旧仓 `pfmiles/install-gsd-dsh` 的互链提交与推送** → Phase 5（D-08/D-09）
- **`npm publish` / GitHub Release / dshmarket PR 本体** → Phase 5（承 03-D-02）
- **干净机器 8 项 UAT（UAT-01..06）** → Phase 5
- **SKIL-01「会话内 72 技能可见」的真正观测** → Phase 5（本 phase 的 D-05 判据会产出中间证据，但完整观测属 UAT-01）
- **`dsh-gsd-core` 精简档（`GSD_PROFILE=core` 的插件等价物）** → Backlog，未排期
- **随包迁移检测脚本（`scripts/gsd-migrate-check.mjs`）** → 本 phase 明确不做（D-06）；若日后用户反馈命令块太繁琐可重开
- **`ui-frontend-evidence.cjs:104` 的 `SKIP_DIRS` 缺 `.gsd-build-tmp`** → 既有债务，与本 phase 无关，留 Phase 5 收口
</deferred>

---

*Phase: 04-migration-coexistence*
*Context gathered: 2026-11-13 via interactive discuss (4 areas, 13 decisions)*