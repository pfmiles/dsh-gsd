# Phase 4: 迁移与并存 - Research

**Researched**: 2026-11-13
**Domain**: 部署方式迁移（legacy shell installer → DSH bundle plugin）+ 同 profile 多插件并存
**Confidence**: HIGH（DSH CLI / 并存合成 / 版本错配三层门 / 隔离面 全部读源码 + 在一次性 `DSH_HOME` 里实测；旧脚本残留面逐行读源码并在真机做只读探测）+ MEDIUM（旧脚本 end-to-end 演练本轮**未执行**——需联网且真实全局 npm prefix 有被覆写风险，见 `## Open Questions`）

**Provenance 约定（本文件统一遵守）：** 仓内/机内离散值一律 `path:行区间` + **逐字引文**并列（引文本身即 tag 的实体）；凡实测结论另附 `[VERIFIED: 命令 + 观测值]`；DSH 源码与旧脚本源码标 `[VERIFIED: 绝对路径:行区间]`；文档型来源标 `[CITED: url]`；本会话未验证的推断标 `[ASSUMED]` 并汇入 `## Assumptions Log`。

**本轮实测的边界声明：** 所有变更性实验都在 `DSH_HOME=$(mktemp -d /tmp/dsh-probe-home.XXXXXX)` 内完成，使用的插件是临时合成的 `probe-bundle*`（`/tmp` 下，已删除），**未触碰真实 `~/.dsh`、全局 npm prefix、`~/.gsd` 与本仓工作树**（收尾核验：`~/.dsh/profiles` mtime 仍为 `Nov 12 22:15`；临时目录全部 `rm -rf`）。

## Summary

**1) `dsh plugin` 不是一套独立插件系统，而是「pnpm 转发器 + bundle reconcile + 兼容门」三件事。** `add` / `remove` 就是 pnpm 的子命令（DSH 只把剩余参数原样转发），`--profile` 必填，`--force` 是 pnpm 侧的开关而非 DSH 语义。实测 `remove` 会同时清掉 profile `package.json` 的 `dependencies` 与 `dsh.profile.bundles` 里的对应条目（本会话实测，见 Pattern 2/5）——**D-01 里「插件的 remove 可逆」不仅成立，而且比 CONTEXT 记录的更强**：不需要手工编辑任何清单。真正不可逆的只剩旧部署侧（`~/.dsh` 受管目录 + bridge 块），这正是 D-01 把 reversibility 评为 costly 的根据，本 phase 无需推翻它。

**2) 并存模型没有任何冲突检测，这一条必须先成为判据的前提。** DSH 把每个 bundle 的 `cordis.patch.yml` 按 `dsh.profile.bundles` 顺序**追加**到一棵空 root 上（`insert` 是 `data.push(...)` 语义），随后才是 profile 自己的 `cordis.patch.yml`、`$DSH_HOME/cordis.patch.yml`、`--patch` 覆盖层。本会话实测：两个 bundle 贡献**同一个 row id** 时，DSH 静默产生两行同名 id、`--dump-config` exit 0、**零 warning**。⇒ MIG-04 的「无冲突」不能写成「能装能跑不报错」，必须写成可判定的集合判据（bundle 层集合 + row id 集合 + stderr 空）。

**3) 版本错配是三层门，且最危险那一层会「exit 0 地坏掉」。** 三层分别是：① **preflight**（registry / 本地目录 spec：装之前就拒绝，`dsh: nothing was installed.`）；② **post-install**（本地 `.tgz` spec：装了再回滚，`dsh: restored package.json, pnpm-lock.yaml, and node_modules.`）；③ **load**（启动/`--dump-config` 时逐 bundle 判定，坏的那层被**跳过**）。第 ③ 层实测形态是：**exit 0**、stdout 少 3 行、stderr 多一行 `dsh: skipping profile bundle "…"`、`dsh.profile.bundles` 原样不动。任何「跑通了就是好了」的验收都会在这一层被骗——这与 Phase 3 CR-01 被旧源掩盖是同一类失败。

**4) 隔离面比直觉窄。** `DSH_HOME` 对 `dsh plugin add/remove`、`dsh --dump-config`、旧脚本三者**都**生效（各有源码行，见 Pattern 5），所以在 `/tmp` 里做全流程演练是可行的；但 **全局 npm prefix（`npm i -g`）、pnpm store、`~/.gsd`、PATH 上的 `gsd_run`** 都不在隔离面内。另有一个反直觉项：**`--dump-config` 不是只读**——它会重写 `<profile>/cordis.yml`，profile 不存在时会把它建出来（实测）。

**Primary recommendation:** 把 phase 拆成「先立判据、再跑演练、最后写字」三段。① 先把三类错配症状与并存判据**写成可复制的 grep/断言块**（本文件 Pattern 4/5 与 `## Code Examples` 已给出现成形态，且全部在本会话实测过）；② 演练一律在 `DSH_HOME=$(mktemp -d)` 内，旧脚本**必须带 `--no-npm-bin`**（否则 `npm i -g @opengsd/gsd-core@1.20.1` 会覆写本机真实的 `1.16.0`）；③ runbook 的每一条「复验」都必须显式包含**阴性对照 + 内容比对**（D-05），并且**不得**以 `--dump-config` 的 exit code 作为通过条件。

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

> 以下 13 条为用户裁决（2026-11-13 交互 discuss），planner 必须逐条映射进 plan，不得重新论证。

#### 迁移序列与破坏半径

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

#### 双源清除与来源证明

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

#### 跨仓动作边界

- **D-08 — 本仓改 + 旧仓备料不推（承 03-D-02）** — **Reversibility:** reversible — 备料落地不改变任何远端状态。
  - 在 `dsh-gsd` 的 `README.md` 顶部（中英各一处）加「从脚本迁移」入口，指向 `docs/MIGRATION.md`。
  - 旧仓（`pfmiles/install-gsd-dsh`）的互链**只备料、不提交、不推送**；推送留 Phase 5。
  - **理由**：旧仓是独立仓库（remote `git@github.com:pfmiles/install-gsd-dsh.git`，最近提交 `41fcc7a`，工作树干净），改动即对外写入；且本机 SSH 不可用（PROJECT 已锁的操作教训），推它需另走 `gh` 凭据路径。

- **D-09 — 备料形态 = 粘贴片段 + PR 描述**：
  - 内容：README 顶部 markdown 片段（**中英各一份**）+ 建议插入位置（用章节锚点描述，**不写死行号**）+ PR title/body。
  - **拒绝**真 `git patch`：旧仓一变动就冲突，且要维护基准 sha。
  - **拒绝**只写意图说明：Phase 5 还得重写一遍。

#### 差异表与 HOOK-05

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

> ⚠ 上一条 Discretion 里「`codegraph` 在本机未安装」与实测**不符**，见 `## Common Pitfalls` Pitfall 11 与 Pattern 3 —— 本机 `web` profile **已装** `@jiangzhenguo/dsh-codegraph@1.2.2` 且是 bundle 层。planner 裁定覆盖面时以实测为准。

### Deferred Ideas (OUT OF SCOPE)

- **本机（真实 `~/.dsh`）的整体迁移** → Phase 5（D-02；届时 `web`/`headless` 一并处置）
- **旧仓 `pfmiles/install-gsd-dsh` 的互链提交与推送** → Phase 5（D-08/D-09）
- **`npm publish` / GitHub Release / dshmarket PR 本体** → Phase 5（承 03-D-02）
- **干净机器 8 项 UAT（UAT-01..06）** → Phase 5
- **SKIL-01「会话内 72 技能可见」的真正观测** → Phase 5（本 phase 的 D-05 判据会产出中间证据，但完整观测属 UAT-01）
- **`dsh-gsd-core` 精简档（`GSD_PROFILE=core` 的插件等价物）** → Backlog，未排期
- **随包迁移检测脚本（`scripts/gsd-migrate-check.mjs`）** → 本 phase 明确不做（D-06）；若日后用户反馈命令块太繁琐可重开
- **`ui-frontend-evidence.cjs:104` 的 `SKIP_DIRS` 缺 `.gsd-build-tmp`** → 既有债务，与本 phase 无关，留 Phase 5 收口

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description（REQUIREMENTS.md 原文） | Research Support |
|----|-------------|------------------|
| MIG-01 | `install-gsd-dsh.sh` 用户迁移 runbook：uninstall 顺序（先卸旧再装新，避免同名 skills 双源） | Pattern 1/2/5 + `## Runtime State Inventory` 给出每一步的只读举证命令；`--uninstall` 的**无条件 exit 0** 与「strip 需 BEGIN+END 同时在场」是两条必须写进 runbook 的陷阱（Pitfall 1/2） |
| MIG-02 | 不同部署方式差异表（全局 CLI、GSD_PROFILE 档位、hooks 事件子集） | `## Runtime State Inventory` 的三轴逐项实测；D-12 的真正差异在 configPath/pluginRoot 归属（Pattern 3/4）；全局 CLI 侧有真机实测解析链（`gsd_run` → `@opengsd/gsd-core@1.16.0`） |
| MIG-03 | 旧脚本保留定位（离线/批量铺/诊断保底）并在 README 顶部互链 | `## Environment Availability` 给出旧脚本**离线模式可用性**的实测边界（`gsd-core/bin/install.js` 不在本仓构建产物中）；README 顶部改动的三条既有断言约束见 Pitfall 10 |
| MIG-04 | 同 profile 同时装 dsh-gsd 与其他插件（codegraph/deja/dshmarket 级）无冲突 | Pattern 3 给出四个插件的 row id 实测集合（互不相交）；Pattern 2 给出「无冲突」的可判定定义；实测「同 id 静默双行」证明不能靠「跑通」判定（Pitfall 9） |
| HOOK-05（CONTEXT 追加） | 桥接依赖 pin 与 DSH 版本对齐策略文档化，DSH 升级后的症状与修复写入 runbook | Pattern 4 给出三层门的**逐字**症状与注入点；关键纠偏：`engines.dsh` 在场时 DSH **完全不读** `peerDependencies`，故 `pins.json` 的 peer 改动只能在 CI 静态门变红（Pitfall 6） |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 迁移序列编排（先卸后装、硬门中止） | 用户面文档（`docs/MIGRATION.md` 的 runbook） | 人的判断（D-03 的 profile 逐个裁决） | 卸载是机器级动作、安装是 profile 级动作，两者**没有**原子事务可包，只能由文档规定顺序 + 人工闸门 |
| 卸载旧部署 | `install-gsd-dsh.sh --uninstall`（唯一实现） | 手工 `rm -rf ~/.gsd`、`npm uninstall -g`（runbook 追加的两步） | 旧脚本自己声明「不碰全局 npm 与 `~/.gsd`」，这两项必须由 runbook 补 |
| 安装新部署 | DSH CLI（`dsh plugin … add`，转发 pnpm） | pnpm（解析/落盘） + DSH plugin-manager（reconcile + 兼容门） | `add` 的语义一半在 pnpm、一半在 plugin-manager；任何「DSH 会帮我装好」的假设都要落到这两层 |
| 多插件合成 | DSH app-boot `composeEntries`（层序 = `dsh.profile.bundles`） | 各 bundle 自己的 `cordis.patch.yml` | 合成是纯追加，**无冲突仲裁**；冲突面只能由外部判据兜住 |
| 版本/兼容判定 | DSH plugin-manager（安装态） + app-boot（加载态） | 本仓 `check-pins`（静态门，仅 CI） | 三层门各管一段：preflight / post-install / load；静态门与运行时门**不同源** |
| 差异表与旧脚本定位 | 本仓 `README.md` + `docs/MIGRATION.md` | 旧仓 README（Phase 5 才落） | 本 phase 只做本仓侧 + 备料，远端不动（D-08） |
| 验证判据 | shell 命令块（runbook 内嵌） | `node --test`（仓内守卫，若 planner 决定加） | D-06 明确不加随包检测脚本，判据以可复制命令块交付 |

## Standard Stack

### Core

| 组件 | 版本 | 用途 | 为何是标准（本 phase 无法替换） |
|------|---------|------|--------------|
| `@deepseek-ai/dsh`（CLI） | `0.2.2-rc.1` | 迁移与验证的宿主；提供 `plugin` / `--dump-config` 两个唯一入口 | `[VERIFIED: dsh --version → 0.2.2-rc.1]`；该值由 `getDshRuntimeVersion()` 读 **app-boot 的 package.json** 而来（`bin.js:208` `const version = getDshRuntimeVersion();`），即「运行版本」= app-boot 包版本，不是 CLI 包版本——兼容门的比较对象就是它 |
| `pnpm` | `12.11.2` | `dsh plugin` 的实际执行者（add/remove/why 全是 pnpm 子命令） | `[VERIFIED: pnpm --version → 12.11.2]`；`[VERIFIED: dsh plugin --help]` 明写 `pnpm arguments, forwarded verbatim (add <pkg>, remove <pkg>, why <pkg>, ...)` |
| `node` | `v24.21.0` | 引擎与所有探针脚本 | `[VERIFIED: node --version]`；`package.json` 的 `"node": ">=24"` 是硬门（`docs-consistency` ① 同时钉住） |
| `npm` | `12.2.1` | D-04 的全局 CLI 卸载/重装；`check-pins` 的 registry 采样 | `[VERIFIED: npm --version]` |
| `install-gsd-dsh.sh`（仓外） | 1061 行 / 51928 B，旧仓 HEAD `41fcc7a` | 旧部署唯一真源、`--uninstall` 唯一实现 | `[VERIFIED: /Users/yue.weny/frontWorkspace/gsd-on-dsh/install-gsd-dsh/install-gsd-dsh.sh:1-58]`（shebang + `DSH_HOME="${DSH_HOME:-$HOME/.dsh}"`） |

### Supporting

| 组件 | 版本 | 用途 | 何时用 |
|------|---------|------|-------------|
| `node --test` | Node 内置 | 仓内守卫（现 37 顶层用例） | 若 planner 决定为 `docs/MIGRATION.md` 加入口守卫（Discretion 第 5 条） |
| `@opengsd/gsd-core`（包内引擎） | `1.20.1` | 插件态的引擎真源 | 迁移后「版本一致」的对照物 |
| `@opengsd/gsd-core`（全局 CLI） | `1.16.0` | 旧态残留物，D-04 要求默认卸掉 | `[VERIFIED: readlink -f $(command -v gsd_run) → …/@opengsd/gsd-core/gsd-core/bin/gsd_run]` + `[VERIFIED: npm ls -g --depth=0 → @opengsd/gsd-core@1.16.0]` |
| `dsh-deja` | `0.24.0` | 并存样本（本机 `web` profile 已装） | MIG-04 的对照插件之一 |
| `dshmarket` | `1.73.15` | 并存样本（本机 `web` profile 已装） | 同上；peer 面最宽（见 Pattern 3） |
| `@jiangzhenguo/dsh-codegraph` | `1.2.2` | 并存样本（本机 `web` profile **已装**） | 同上；**纠偏 CONTEXT 的「未安装」**（Pitfall 11） |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `dsh plugin --profile p add <tgz>`（MIG-01 演练的安装步） | `add dsh-gsd@<ver>`（registry 形态） | registry 形态走 **preflight**（装前拒绝），但本 phase `package.json` 仍 `"private": true` 且未发布 ⇒ 演练只能用 `.tgz`（走 **post-install** 路径）。两者文案与副作用不同，runbook 必须写清「演练与真实用户命令的差异」——真实用户在 Phase 5 之后才会用裸名/带版本号的 registry 形态 |
| 真 `.tgz` | `add <本仓目录>`（path spec → pnpm `link:`） | 无网、秒级，适合做**判据探针**；但 `link:` 绕过 tarball 收面与 pnpm 解析，**不能**作为 MIG-01「装的是发布物」的证据，也不能作为 MIG-04 的并存证据（解析冲突面正是要测的东西） |
| 手改 profile `cordis.patch.yml` 挂插件 | `dsh plugin add` | 手改不触发 reconcile ⇒ `dsh.profile.bundles` 不含它 ⇒ `remove` 也管不到，直接落入 D-03 要禁止的「半迁移态」 |
| `--force` 绕过兼容门 | 修复 pin / 用 `allow-version` | `--force` 是 **pnpm** 的开关（DSH 原样转发，`bin.js:117` 的 `[args...]`），不改变 DSH 的兼容门；用它「装上去」只会在 load 层被跳过，制造假绿 |

**Installation:** 本 phase **不新增任何依赖**（D-06 + 本 phase 是文档/演练面）。演练期临时安装的外部包见 `## Package Legitimacy Audit`。

**Version verification:**

```bash
dsh --version        # 0.2.2-rc.1
pnpm --version       # 12.11.2
node --version       # v24.21.0
npm --version        # 12.2.1
npm ls -g --depth=0 | grep gsd-core   # @opengsd/gsd-core@1.16.0
```

## Package Legitimacy Audit

本 phase 的**交付物**不引入新依赖。但 **MIG-04 演练**若要复现「deja / dshmarket / codegraph 三者并存」，需要把三个第三方插件装进临时 profile。它们的合法性门结果（`gsd_run query package-legitimacy check --ecosystem npm …`，本会话实测）：

| Package | Registry | 最新版发布时间 | 周下载 | Source Repo | Verdict | Disposition |
|---------|----------|---------------|--------|-------------|---------|-------------|
| `dsh-deja` | npm | `2026-11-12T12:18:29.166Z` | 2383 | `git+https://github.com/vshulcz/deja-vu.git` | `SUS`（too-new） | 仅用于演练；若装进临时 profile，planner 须加 `checkpoint:human-verify` 或改用「不装」的替代判据（见下） |
| `dshmarket` | npm | `2026-11-12T06:41:18.536Z` | 322398 | `git+https://github.com/dsh-market/dsh-market.git` | `SUS`（too-new） | 同上 |
| `@jiangzhenguo/dsh-codegraph` | npm | `2026-10-16T09:48:53.248Z` | 839 | `git+https://github.com/jiangzhenguo/dsh-codegraph.git` | `SUS`（too-new + low-downloads） | 同上 |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `dsh-deja`、`dshmarket`、`@jiangzhenguo/dsh-codegraph`（三者**本机 `web` profile 已安装且在用**，所以风险是「再装一次」而非「首次引入」；`postinstall` 三者均为 `null`，已由 seam 报文确认）

**关键取舍（供 planner 裁定 MIG-04 覆盖面）：** 这三者在本机 `web` profile 里**已经存在**，因此存在一条零安装的替代判据：**只读**读取 `~/.dsh/profiles/web/{package.json,cordis.patch.yml}` 与三个插件各自的 `cordis.patch.yml`，做**静态集合比对**（bundle 名集合 / row id 集合 / peer 范围交集），不启动、不安装、不联网。它能证明「行级与解析级无冲突」，但**不能**证明「同时装进同一个 profile 后 DSH 能合成」——后者需要临时 home + 真安装。两条判据互补，planner 应至少落一条并在 plan 里写明它证不了什么。

## Architecture Patterns

### System Architecture Diagram

```
【旧态】install-gsd-dsh.sh（机器级，写入 $DSH_HOME）
   ├─ $DSH_HOME/skills/gsd-*                 (72 个，无条件 rm 重建)
   ├─ $DSH_HOME/{gsd-core,hooks,scripts}/     (各带 .gsd-dsh-managed 标记)
   ├─ $DSH_HOME/gsd-hooks.dsh.json + .gsd-dsh-managed
   ├─ $DSH_HOME/profiles/*/cordis.patch.yml  ← 每个 profile 各追加一段
   │      # GSD-DSH-bridge BEGIN … END      （configPath 指向机器级绝对路径）
   │      # GSD-DSH-sandbox BEGIN … END     （仅 GSD_HOOKS_SANDBOX_PATCH=1）
   └─ 全局 npm: @opengsd/gsd-core@<ver> → PATH 上的 gsd_run
      （旧脚本 --uninstall 不碰它，也不碰 ~/.gsd）

【迁移序列】（D-01；本 phase 只在临时 DSH_HOME 演练）
   ① 探测硬门 ─── 任一 profile 仍含 bridge 块 / 仍依赖 ~/.dsh/skills 下的 gsd-*
   │                └─ 有 → 中止（D-03），不提供「警告后继续」
   ② install-gsd-dsh.sh --uninstall          （exit 0 恒真，见 Pitfall 1）
   ③ npm uninstall -g @opengsd/gsd-core       （D-04；旧脚本不管）
   ④ dsh plugin --profile <p> add <tgz>       （→ 下方「安装管线」）
   ⑤ 复验 = 阴性对照 + 内容比对（D-05/D-07），不得只看 exit code

【安装管线】dsh plugin --profile p add <spec>
   bin.js:115-127  ── argv 原样转发 ──▶ plugin-DscIHF4k.js:64-100
        │                                   │
        │                                   ├─ 无 package.json → initProfile（会创建 profile！）
        │                                   ├─ namedSpecs 取 add/install/i 的位置参数
        │                                   ├─ preflight: path/registry 读 manifest → evaluatePluginCompatibility
        │                                   └─ pnpm <args>（cwd = profile 目录）
        │                                            │
        └────────────────────────────────────────────┴─▶ 后检查（installed 直接依赖 + bundle 组件）
                                                           → reconcile: 追加 dsh.profile.bundles
                                                           → 失败则 restore package.json/lock/node_modules

【合成管线】dsh --profile p (--dump-config)
   composeEntries( layers ) =
       [每个 bundle 的 cordis.patch.yml]（按 dsh.profile.bundles 顺序）
     + [<profile>/cordis.patch.yml]
     + [$DSH_HOME/cordis.patch.yml]        ← 机器级偏好，压过 per-profile
     + [--patch 覆盖层]
        → applyPatches([], patches)       ← insert 一律 push，无 id 冲突检测
        → prepareProfileEntries           ← 逐 row 查 manifest 兼容性，失败则 disabled（仅 boot 路径）
```

### Pattern 1: `dsh plugin` 的真实命令面

**What:** `dsh plugin` 只有一层 commander 包装，`--profile` 必填，其后所有 token **原样交给 pnpm**。DSH 自己只识别三个 `version` 子命令（`allow-version` / `revoke-version` / `version-exemptions`），其余全是 pnpm 的。

**源码依据：**

- `[VERIFIED: lib/bin.js:115-127]` — `if (first === "plugin") { const plugin = program.command("plugin")…requiredOption("--profile <name>", "the profile whose plugins to manage (initialized on first use)"…).argument("[args...]", "pnpm arguments, forwarded verbatim (add <pkg>, remove <pkg>, why <pkg>, ...)")`
- `[VERIFIED: lib/bin.js:234-237]` — `case "plugin": { const { runPlugin } = await import("./plugin-DscIHF4k.js"); process.exit(await runPlugin(invocation.profile, invocation.args, options.packageManager)); }` ⇒ **DSH 进程的 exit code 就是 pnpm/兼容门的 exit code**
- `[VERIFIED: lib/plugin-DscIHF4k.js:15-57]` — `versionCommand` 只拦 `command !== "allow-version" && command !== "revoke-version" && command !== "version-exemptions"`，其余 `return void 0`
- `[VERIFIED: lib/plugin-DscIHF4k.js:95]` — `if (result.exitCode === 127) process.stderr.write("dsh: pnpm was not found; install pnpm and make it available on PATH.\n");`
- `[VERIFIED: dsh plugin --help]` 原文：
  ```
  Usage: dsh plugin [options] [args...]
  manage a profile's plugins by forwarding the remaining arguments to pnpm in the
  profile directory
  Arguments:
    args              pnpm arguments, forwarded verbatim (add <pkg>, remove <pkg>,
                      why <pkg>, ...)
  Options:
    --profile <name>  the profile whose plugins to manage (initialized on first
                      use)
  ```
- `[VERIFIED: dsh --help]` 的 usage 两行原文：`dsh plugin --profile <name> <pnpm-args...>`；示例 `dsh plugin --profile tui add <package>    install a plugin into the tui profile`

**答案（agenda 问题 1）：**

- **子命令**：不存在 DSH 自己定义的 `add/remove/list`。`add` / `remove` / `why` / `install` 都是 **pnpm** 的；`--profile` 是 DSH 的（必填、只能给一次）；`--force` **不是** DSH 的（没有任何 DSH 代码读它），它是 pnpm 的开关，会随 `[args...]` 一起被转发。`[VERIFIED: dsh plugin --help 未列出 --force]`
- **`remove`/`uninstall` 是否存在**：**存在**——就是 pnpm 的 `remove`，且 DSH 在之后做了 reconcile。本会话实测：`dsh plugin --profile probe remove probe-bundle` 的 exit code 为 `0`，输出为 `Already up to date` + `dependencies:` 段落里一行 `- probe-bundle link:/tmp/…`，随后 profile `package.json` 的 `dependencies` **整键消失**、`dsh.profile.bundles` 从 `["@deepseek-ai/dsh-base","probe-bundle"]` 变回 `["@deepseek-ai/dsh-base"]`。`[VERIFIED: 本会话临时 DSH_HOME 实测]`
  ⇒ **D-01 的 "costly" 评级无需下调**（旧部署侧仍不可逆），但**插件侧的可逆性应写成「单命令可逆、清单自动收敛」**——比 CONTEXT 记的更强，runbook 可以直接告诉用户「回滚插件 = 一条 remove」。
- **`add <tgz|name>` 对磁盘做什么**：见 Pattern 2。
- **exit code / 输出串**：见 Pattern 4 的三层门表（三层各有逐字文案，全部本会话实测）。

**When to use:** 一切「装/卸/查」动作都走 `dsh plugin`，不要手改 profile 的 `package.json` 或 `cordis.patch.yml`（会绕过 reconcile，见 Alternatives）。

### Pattern 2: `add` 到底写了什么（可复现的磁盘清单）

**What:** `add` 的落盘效果 = **pnpm 的常规效果** + **DSH 的三处额外改写**。

**实测（一次性 `DSH_HOME`，`add <本地目录>` 成功后，profile 目录由空变满）：**

```
profiles/<p>/
├── package.json          ← 依赖 + dsh.profile.bundles 两处被 DSH 改写（mode 600）
├── pnpm-lock.yaml        ← pnpm 写
├── pnpm-workspace.yaml   ← DSH 建的模板（initProfile）
├── cordis.patch.yml      ← DSH 建的模板（用户层，空数组）
├── cordis.yml            ← 只在 --dump-config/boot 时被重写（常量内容）
├── node_modules/         ← pnpm 写（含 .modules.yaml / .pnpm / .pnpm-workspace-state-v1.json）
└── .plugin-manager/logs/operation-XXXX/pnpm.log   ← 每次操作一个目录（只增不删）
```

`[VERIFIED: 本会话实测 ls -la + cat]`。`pnpm-workspace.yaml` 的内容是硬编码模板 `[VERIFIED: @deepseek-ai/dsh-app-boot/lib/index.js:1373-1378]`：

```js
const PROFILE_PNPM_WORKSPACE = `packages:
  - .

nodeLinker: hoisted
autoInstallPeers: false
`;
```

**DSH 的三处改写：**

1. **`dsh.profile.bundles` 追加**（reconcile）——`[VERIFIED: @deepseek-ai/dsh-plugin-manager/lib/types/operations.js:97-138]`，关键三行：
   ```js
   const previous = after.dsh?.profile?.bundles ?? [];
   …
   if (!bundles.includes(name)) { bundles.push(name); }
   …
   if (JSON.stringify(previous) === JSON.stringify(bundles)) return [];
   after.dsh = { ...after.dsh, profile: { ...after.dsh?.profile, bundles } };
   await saveManifest(dir, after);
   ```
   ⇒ **新装的 bundle 一律追加到末尾**，所以「安装顺序 = 层序」。移除时同一函数把已消失的依赖过滤掉（`previous.filter(...)` 分支），因此 `remove` 无需手工改清单。
2. **无 `dsh.bundle` 的包给出 warning 而不是拒绝**（同一文件 `:113`）：
   ```js
   `dsh: warning: ${name} declares no dsh.bundle — installed as a plain dependency, not a profile layer\n`
   ```
   ⇒ 这条正是旧脚本 `dsh plugin add @deepseek-ai/dsh-hooks-claude-code@…` 的落点：**装成普通依赖、不成为 bundle 层**（所以旧脚本还必须自己写 bridge 块）。这也是 MIG-02「hooks 归属轴」的机器证据。
3. **失败即回滚清单**（同一文件 `:545-575`）——`savedFiles = ['package.json','pnpm-lock.yaml']` 的快照 + `restore()` + 重跑 `pnpm install`；`restoration` 两种文案见 Pattern 4。

**幂等性**：同一 spec 再跑一次，pnpm 输出 `Already up to date`（本会话实测），DSH 侧因 `JSON.stringify(previous) === JSON.stringify(bundles)` 提前 return，**不重写 manifest**。⇒ runbook 里「重跑一次 add」是安全的，不会产生重复 bundle 条目。

**`--force` 语义**：`[ASSUMED]` —— DSH 不解释它（`bin.js:117` 原样转发），其行为完全属于 pnpm（惯例是强制重新解析/覆盖已装依赖）。**本会话未实测**。`cordis.patch.yml` 顶部注释里 `DEV NOTE: dsh plugin add file:<path> installs a PACKED snapshot … re-run the add (or pnpm add --force)` 也只是开发期提示。若 runbook 要写「`--force` 重装同版本」，planner 必须把它列为演练项而不是既成事实。

### Pattern 3: 四个插件的并存事实（row id 集合互斥，冲突面在 pnpm 解析）

**What:** 并存的安全性有两层：**行级**（patch 合成的 id/name）与**解析级**（同一个 profile 的 pnpm 树里 peer/engine 是否可满足）。两层都必须验。

**合成规则（逐字引文）** `[VERIFIED: @deepseek-ai/dsh-app-boot/lib/index.js:1302-1315]`：

```
A profile is a directory under `$DSH_HOME/profiles/<name>` holding a
`package.json` (out-of-tree plugin dependencies plus the profile manifest
`dsh.profile` with its ordered `bundles` list) and a
`cordis.patch.yml` (the user's own patch layer, applied after every bundle layer). Bundles are
npm packages whose manifest declares
`"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` (one file, or an
ordered list of files); the tree is composed by applying each bundle's patch
lists in `dsh.profile.bundles` order over an empty entry list, then the
profile's own patches, then any launcher layers (`--patch` files and
flag-derived patches).
```

**行级：四个 bundle 各自贡献的行**（`[VERIFIED: 各包 package.json 的 dsh.bundle.patch 指向的文件，本会话逐字读取]`）

| bundle | 版本 | 贡献的 row id | row name | 依据 |
|--------|------|--------------|----------|------|
| `dsh-gsd` | `1.20.1-1.dsh022` | `gsd`、`gsd-hooks-bridge` | `'dsh-gsd'`、`'@deepseek-ai/dsh-hooks-claude-code'` | `[VERIFIED: cordis.patch.yml:17-25]`（`- insert:` 下两行 id，逐字见 Code Examples） |
| `@jiangzhenguo/dsh-codegraph` | `1.2.2` | `dsh-codegraph` | `'@jiangzhenguo/dsh-codegraph'` | `[VERIFIED: ~/.dsh/profiles/web/node_modules/@jiangzhenguo/dsh-codegraph/cordis.patch.yml]` `- id: dsh-codegraph` |
| `dsh-deja` | `0.24.0` | `deja` | `dsh-deja` | `[VERIFIED: ~/.dsh/profiles/web/node_modules/dsh-deja/cordis.patch.yml]` `- id: deja` |
| `dshmarket` | `1.73.15` | `dsh-market` | `'dshmarket'` | `[VERIFIED: ~/.dsh/profiles/web/node_modules/dshmarket/cordis.patch.yml]` `- id: dsh-market` |

⇒ **四者的 id 集合两两不相交**（`{gsd, gsd-hooks-bridge}` / `{dsh-codegraph}` / `{deja}` / `{dsh-market}`），这是「无冲突」在行级可证的第一个事实。

**MCP 面：** 四者**都不贡献 MCP server 行**（上表即它们的全部行）。机器级 MCP 在 `$DSH_HOME/cordis.patch.yml`，其 id 形如 `atc-mcp-<hex>`、`serverName` 为 `Dima_MCP_abe7b2e8` / `MCP_96762640` / `antlogs_mcp_3c1d3011`，`[VERIFIED: ~/.dsh/cordis.patch.yml 前 30 行]`。⇒ MIG-04 的「同名 MCP server 冲突」在本例中不成立，但 runbook 应保留一句「若将来两个插件都用 `@deepseek-ai/dsh-mcp-client` 且 `serverName` 相同，DSH 不做去重」——依据见下条。

**冲突检测：不存在。** `applyPatches` 的 `insert` 分支是纯追加 `[VERIFIED: @deepseek-ai/dsh-app-boot/lib/index.js:505-534]`：

```js
if (insert) {
    const clone = structuredClone(insert);
    if (id) { … if (!target.group) { warn("patch insert: entry %C is not a group", id); continue; } … }
    else data.push(...clone);
    buildMap(clone);
    continue;
}
```

以及按 id 打补丁时的**软失败** `[VERIFIED: 同文件 :537-548]`：`warn("patch: entry %C not found", id)`、`warn("patch: name mismatch for %C (expected %C, got %C), skipping", id, target.name, name)` —— 都是 warn，不是 error。

**实测验证（本会话，一次性 DSH_HOME）：** 造两个 bundle，各 `insert` 一行 `id: probe-row`（name 不同），同时 `add` 进同一 profile → `add` **exit 0、零 warning**；`--dump-config` **exit 0**，输出中出现：

```
- id: probe-row
  name: probe-bundle-a
- id: probe-row
  name: probe-bundle-b
```

`[VERIFIED: 本会话实验 7]` ⇒ **同名 id 是静默双行**。另外，后续若有按 `id: probe-row` 的配置补丁，`entryMap.set` 是「后写覆盖」，补丁只会命中**最后一条**（源码 `buildMap` 在同一作用域内 `entryMap.set(entry.id, entry)`），这意味着「冲突」的后果可能表现为「某插件配置不生效」而不是报错。

**解析级（真实冲突面）：** profile 的 `pnpm-workspace.yaml` 固定 `autoInstallPeers: false` + `nodeLinker: hoisted`，所以每个插件的 peer 范围都会落在**同一棵树**里参与解析。四者的声明（`[VERIFIED: 各 package.json]`）：

| 包 | `engines` | DSH 相关 peer |
|----|-----------|---------------|
| `dsh-gsd` | `"dsh": ">=0.2.2-rc.1 <0.3.0-0"`、`"node": ">=24"` | `"@deepseek-ai/dsh-skill-filesystem": "0.2.2-rc.1"`（exact） |
| `dshmarket` | 无 | `"@deepseek-ai/dsh-settings": "^0.1.0-rc.7 \|\| ^0.1.1-rc.2 \|\| ^0.1.2-alpha.2 \|\| ^0.2.0-rc.1 \|\| ^0.2.1-alpha.3 \|\| ^0.2.1-rc.1"`（+`@deepseek-ai/cordis`、`@deepseek-ai/schemastery`：**不**被 DSH 的兼容门计入） |
| `@jiangzhenguo/dsh-codegraph` | 无 | `"@deepseek-ai/dsh-llm"` / `"@deepseek-ai/dsh-tools"`：`">=0.0.1-rc.1 <0.1.0 \|\| >=0.1.0-rc.1 <0.3.0-0"`（+`schemastery`：不计入） |
| `dsh-deja` | 无 | 无 DSH peer（只有 `@vshulcz/deja-vu` 普通依赖） |

⇒ 真正的「冲突」只可能发生在 **pnpm 解析/ERESOLVE** 上（Phase 2 已记录过一次上游漂移导致的四格全 ERESOLVE）；DSH 的兼容门只看 `engines.dsh` 或 `@deepseek-ai/dsh*` peer，且 `engines.dsh` 在场时 peer 被**整体忽略**（Pattern 4）。所以 MIG-04 的验收至少要包含 **`add` 的 exit code（解析是否成功）** 与 **`--dump-config` 的 bundle 层数/row id 集合** 两个正交判据。

**顺序敏感性：** 由于 dsh-gsd 只贡献 `insert`（不按 id 打补丁），它在 `dsh.profile.bundles` 里的位置对结果**无影响**；但只要将来给 dsh-gsd 加一条按 id 覆盖别的插件行的补丁，顺序就会变成语义（`[VERIFIED: app-boot 文档 1309-1315 的 layer 顺序定义]`）。runbook 不必规定安装顺序，但差异表可以指出这一点。

### Pattern 4: 版本错配的三层门（HOOK-05 / D-13 的机制底座）

**What:** `engines.dsh` 与 DSH 相关 peer 会在**三个不同时机**被 `evaluatePluginCompatibility` 检查，每层的可观察后果都不同。判定逻辑一处 `[VERIFIED: @deepseek-ai/dsh-app-boot/lib/index.js:1097-1117]`：

```js
function unmetRequirements(fields, runtimeVersion) {
	const engines = Object.hasOwn(fields, "engines") ? objectOf$1(fields.engines, "Plugin manifest engines") : {};
	if (Object.hasOwn(engines, "dsh")) {
		const range = engines.dsh;
		if (typeof range !== "string") throw new Error("Plugin manifest engines.dsh must be a string");
		return satisfies(runtimeVersion, range) ? {} : { "engines.dsh": range };
	}
	if (!Object.hasOwn(fields, "peerDependencies")) return {};
	const dependencies = objectOf$1(fields.peerDependencies, "Plugin manifest peerDependencies");
	const unmet = {};
	for (const [name, range] of Object.entries(dependencies)) {
		…
		if (name !== "@deepseek-ai/dsh" && !name.startsWith("@deepseek-ai/dsh-")) continue;
		…
	}
	return unmet;
}
```

**逐字要点：`engines.dsh` 一旦存在就 `return`，peerDependencies 完全不参与。** 本仓 `package.json` 的 `engines.dsh` 存在（`">=0.2.2-rc.1 <0.3.0-0"`），因此 **`peerDependencies['@deepseek-ai/dsh-skill-filesystem']` 的 exact pin 对 DSH 的兼容门是不可见的**。peer 只有两个执行者：**pnpm 的解析**（安装时）与**本仓 `check-pins` 步骤 (j)**（静态）。

**三层门的实测症状表：**

| 层 | 触发条件 | 观测（本会话实测） | exit code | 磁盘后果 |
|----|---------|--------------------|-----------|----------|
| ① preflight | spec 是 **registry** 或**绝对路径目录**，且其 manifest 不满足 | `dsh: installation rejected: Plugin <name>@<ver> is incompatible with dsh <runtime>: requirements {"engines.dsh":"…"}. … Exact-version exemption: not active.` 紧跟 `dsh: nothing was installed.`，再跟 `dsh: to accept the risk, run: dsh plugin --profile <p> allow-version <name>@<ver> --dsh-version <runtime> --accept-risk` | **1** | **没有任何安装**；但**profile 目录已被初始化**（`package.json`/`cordis.patch.yml`/`pnpm-workspace.yaml` 出现） |
| ② post-install | spec 是**本地 `.tgz`**（`kind: 'tarball'` → preflight 跳过） | pnpm 先真装（`+ <name> <ver>` / `Done in 91ms`），随后 `dsh: installation rejected: …`（warning 文本出现两次）+ `dsh: restored package.json, pnpm-lock.yaml, and node_modules.` + 两次 `to accept the risk` 提示 | **1** | `package.json` 恢复（无该依赖）、`pnpm-lock.yaml` **被删除**（原本不存在）、`node_modules` **留在磁盘上**（源码注释亦言 "leaves downloaded modules on disk"） |
| ③ load（bundle 级） | 已装 bundle 的 manifest 在**加载/`--dump-config`**时不满足 | `dsh: skipping profile bundle "<name>": Error: Plugin <name>@<ver> is incompatible with dsh <runtime>: … Exact-version exemption: not active.`（**stderr**）；stdout 少 3 行（该 bundle 的层整体消失），`dsh.profile.bundles` **原样不动** | **0** ⚠ | 无写入；表现为「静默少一层」 |
| ③′ load（row 级） | 已合成行指向的包 manifest 不满足（例如 bridge 包版本与 DSH 不符） | 源码固定文案：`dsh: disabling profile plugin row "<id>": <reason>`（`[VERIFIED: app-boot:3085-3087]`，`process.stderr.write(`${binName}: disabling profile plugin ${label}: ${reason}\n`)`，`label` 为 `row ${JSON.stringify(row.id)}` 或 `row.name`） | 仍 0（boot 继续） | 该 row 被 `disabled: true`，**不写回任何文件** |

⚠ **第 ③ 层的 exit 0 是本 phase 最危险的假绿来源。** 本会话实测：同一 profile，改坏 bundle 的 `engines.dsh` 后 `--dump-config` 仍 `EXIT=0`，stdout 从 369 行降到 366 行、目标 row 消失，只有一行 stderr 说明原因。任何以 `--dump-config > /dev/null && echo OK` 为判据的验收都会把它判绿。

**修复路径（写进 MIGRATION §3 的「修复」列）：**

- 首选：装与运行时匹配的版本（`engines.dsh` 窗口由本仓 `pins.json` 的 `dshRange` 定义）。
- 次选（显式承担风险）：`dsh plugin --profile <p> allow-version <name>@<ver> --dsh-version <exact> --accept-risk`，写入 `<profile>/compatibility.json`（`[VERIFIED: app-boot:1159]` `const PROFILE_COMPATIBILITY_FILENAME = "compatibility.json";`），并打印 `dsh: warning: allowing incompatible plugin versions can break the application or corrupt data. Approval applies only to the exact package and DSH versions.`（`[VERIFIED: plugin-DscIHF4k.js:37]`）。豁免是**精确二元组**，升级任一版本即失效。
- 绝不：`--force` 硬装（`--force` 属 pnpm，不改变 DSH 的判定；见 Pattern 1）。

**`build/assets/pins.json` 的 `lines.022.peer` 到底喂给谁（agenda 问题 3 的答案）：** 只喂给 `check-pins` 步骤 (j)，一处、等值比较。`[VERIFIED: build/lib/check-pins.mjs:152-160]`：

```js
// (j) skill-filesystem peer range strictly equals pins.lines[line].peer → exit 2
// pins.json spells the peer as "<name> <range>"; package.json executes it as
// key=<name>, value=<range> — the equivalence check composes the same string.
const peers = pkg.peerDependencies && typeof pkg.peerDependencies === 'object' ? pkg.peerDependencies : {}
const peerName = '@deepseek-ai/dsh-skill-filesystem'
const peerRange = peers[peerName]
if (peerRange === undefined || `${peerName} ${peerRange}` !== line.peer) {
  finish(2, `check-pins: peerDependencies ${peerName} mismatch — package.json '${peerRange ?? '<missing>'}' vs pins.json peer '${line.peer}'`)
```

对应的真源值 `[VERIFIED: build/assets/pins.json:8-12]`：`"bridge": { "@deepseek-ai/dsh-hooks-claude-code": "0.2.2-rc.1", "@deepseek-ai/dsh-hook-protocol": "0.2.2-rc.1" }` 与 `"peer": "@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`。
⇒ **改 `pins.json` 的 peer 只能让静态门变红（exit 2，文案如上），不可能产生任何运行时症状**——这正是 D-13 拒绝「只演练 check-pins 能拦住的漂移」的源码级理由；运行时症状必须从 ③/③′ 层注入。

**两个可注入点（对应 Discretion 第 1 条）：**

| 注入点 | 改什么 | 期望症状 | 代价 |
|--------|--------|---------|------|
| A（静态） | `build/assets/pins.json` 的 `lines.022.peer`（或 `package.json` 的 peer） | `check-pins` exit 2 + 上述逐字文案；`npm test` 里 `docs-consistency` ② 也会红 | 秒级、无需演练环境；但**产不出运行时症状** |
| B（运行时，推荐至少覆盖） | 临时 home 里 `<profile>/node_modules/@deepseek-ai/dsh-hooks-claude-code/package.json` 的 `version`（或改动其 8 个 exact peer 之一），或直接改 bundle 包自己的 `engines.dsh` | ③：`dsh: skipping profile bundle …` + dump 少层；③′（bridge 包）：boot 时 `dsh: disabling profile plugin row "gsd-hooks-bridge": …` | 需要能启动 profile 观察 ③′；③ 只需 `--dump-config`（秒级，本会话已实测） |

### Pattern 5: 演练隔离面（`DSH_HOME` 到底隔离了什么）

**What:** `DSH_HOME` 是 `resolveDshHome()` 的最高环境优先级（仅次于显式配置参数）。`[VERIFIED: @deepseek-ai/dsh-home-paths/lib/index.js:100-110]`：

```js
* Precedence, highest first: an explicit configured path, `$DSH_HOME`, then
* `~/.dsh`. The harness keeps all user data under one root. An empty or
* whitespace-only `$DSH_HOME` is treated as unset, so a blank override never
* resolves the home to the current working directory.
…
function resolveDshHome(configured, env = process.env) {
	return resolveRoot(configured, env, DSH_HOME_ENV, defaultDshHome);
}
```

**三个入口是否认 `DSH_HOME`：**

| 入口 | 是否认 | 源码依据 |
|------|-------|----------|
| `dsh plugin add/remove` | ✅ | `[VERIFIED: lib/plugin-DscIHF4k.js:73]` `const dir = resolveProfileDir(profile);`（第二参数缺省 → `resolveDshHome()`），`[VERIFIED: app-boot:1364-1367]` `function resolveProfileDir(name, home = resolveDshHome())` |
| `dsh --dump-config` | ✅ | `[VERIFIED: lib/profile-boot-e2mS45fC.js:219]` `const profile = loadProfile(NAME, name, INSTALL_ANCHOR, void 0, { userLayer });`（home 传 `void 0` → 默认 `resolveDshHome()`） |
| 机器级 patch 层 `$DSH_HOME/cordis.patch.yml` | ✅ | `[VERIFIED: lib/profile-boot-e2mS45fC.js:116-118]` `function homePatchPath() { return join(resolveDshHome(), PROFILE_PATCH_FILENAME); }`（注释明写 "Resolved per call, not at module load: `$DSH_HOME` may be set by the test or launcher after import."） |
| 旧脚本 `install-gsd-dsh.sh` | ✅ | `[VERIFIED: install-gsd-dsh.sh:58]` `DSH_HOME="${DSH_HOME:-$HOME/.dsh}"` |

**不在隔离面内（runbook 必须写警告）：**

1. **全局 npm prefix**：旧脚本 `6/6` 无条件执行 `npm install -g "@opengsd/gsd-core@$GSD_VERSION"`（`[VERIFIED: install-gsd-dsh.sh:1024-1039]`）。在演练机上这会**覆写本机真实的 `@opengsd/gsd-core@1.16.0`**。两条可行规避：① 用 `--no-npm-bin`（**仅在非 upgrade 模式生效**，`[VERIFIED: install-gsd-dsh.sh:396-409]`：只有 `[ -e "$DSH_HOME/gsd-core/$MARKER" ] || ls "$DSH_HOME"/skills/gsd-*` 为真时才强制 `NPM_BIN=1`）；② 给子进程换 prefix —— `[VERIFIED: npm_config_prefix=/tmp/npm-prefix-probe npm config get prefix → /tmp/npm-prefix-probe]`（`npm i -g` 会随之写到该 prefix 的 `lib/node_modules` 与 `bin/`）。
2. **pnpm store**：实测 `Content-addressable store is at: /Users/yue.weny/Library/pnpm/store/v11` —— 演练安装的包会落进用户共享 store（缓存语义，可接受但非零痕迹）。
3. **`~/.gsd`**：全局 GSD 状态（本机有 `research-cache/`，`[VERIFIED: ls ~/.gsd]`）。旧脚本 `--uninstall` 只提示不删（`[VERIFIED: install-gsd-dsh.sh:307]` `note "Done. If you also want to drop GSD's global state: rm -rf ~/.gsd"`）。
4. **PATH 上的 `gsd_run`**：旧脚本可能写出 `$prefix/bin/gsd_run`；演练时若 PATH 上已有它，**探针会读到真实机器的引擎**，产生跨环境的假绿/假红。
5. **`--dump-config` 不是只读**：它会 `writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG)`（`[VERIFIED: profile-boot:221]`），并在 profile 不存在时初始化（`[VERIFIED: app-boot:1848-1852]`）。本会话实测：对全新 `DSH_HOME` 跑 `dsh --profile web --dump-config` → exit 0、1243 行，并**建出** `profiles/web/{package.json,cordis.patch.yml,cordis.yml,pnpm-workspace.yaml}`，bundles 为 `["@deepseek-ai/dsh-base","@deepseek-ai/dsh-web-app"]`（`[VERIFIED: 本会话实测]`）。⚠ 因此 **`--dump-config` 不能用来对真实 `web` profile 做"只读"探测**——它至少会重写 `cordis.yml`。

**最小可行演练序列（本会话已验证其中 ①③④ 的可执行性与输出）：**

```bash
# 0) 全新隔离 home（D-02）
T="$(mktemp -d /tmp/dsh-mig-XXXXXX)"; export DSH_HOME="$T"
# 1) 造一个和真实用户同形的 profile（零网络；用 shipped 模板即可）
dsh --profile web --dump-config > /dev/null      # 建出 profiles/web（base + web-app）
# 2) 旧脚本装一遍（⚠ 必须 --no-npm-bin，或换 npm_config_prefix；见上）
GSD_VERSION=1.20.1 bash <旧仓>/install-gsd-dsh.sh --no-npm-bin
# 3) 硬门探测（D-03）：有 bridge 块 → 在真机上必须中止；演练机上应"看到"才有意义
grep -l 'GSD-DSH-bridge BEGIN' "$DSH_HOME"/profiles/*/cordis.patch.yml
# 4) 卸载
bash <旧仓>/install-gsd-dsh.sh --uninstall
# 5) 装插件（tarball；见 Alternatives 的说明）
dsh plugin --profile web add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"
# 6) 复验：D-07 双面扫 + D-05 内容比对（命令见 Code Examples）
```

**实测的失败形态（供 runbook 的「出错怎么办」）：** 不存在的 profile 名 → `dsh --profile nosuch --dump-config` 会**抛栈**（非一行提示），exit 1，`Error: dsh: profile "nosuch" does not exist; create it with 'dsh plugin --profile nosuch add <package>'`；profile 名含 `/` → `Error: dsh: invalid profile name "a/b"`，同样抛栈。`[VERIFIED: 本会话实测]` ⇒ runbook 里的探测命令应 `2>/dev/null` 或 `|| true`，不要依赖漂亮的单行输出。

### Anti-Patterns to Avoid

- **以 exit code 作为验收**：第 ③ 层错配 exit 0（实测），`--uninstall` 恒 exit 0（源码 `exit 0`）。判据必须是**内容 + 集合**，不是码。
- **以「技能数量」或「provider 日志」作为来源证明**：D-05 已拒；本 phase 补充一条机器理由——插件 provider 与默认 provider 可同时供同名技能，计数被去重后不可判。
- **在真实 `~/.dsh` 上跑任何 `--uninstall` / `add` / `--dump-config`**：D-02 已锁；`--uninstall` 不认 profile（机器级），`--dump-config` 也会写 `cordis.yml`。
- **用手改 `cordis.patch.yml` 代替 `dsh plugin add`**：绕开 reconcile ⇒ 清单与实际装的东西脱节，`remove` 管不到（见 Alternatives）。
- **把 `--force` 当「强制安装」**：它是 pnpm 的解析开关，装着不兼容的包只会在 load 层被跳过（③），得到「装上了但没生效」的假象。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 判定「某插件是否已装/是否成为 bundle 层」 | 自写 `node -e require.resolve(...)` 或数 `node_modules` 目录 | `dsh --profile p --dump-config \| grep '^# == <pkg>'` | 层标签是**合成结果**，直接反映 `dsh.profile.bundles` + 能否解析，不受 hoisted/link 布局影响 |
| 剥旧 bridge / sandbox 块 | 自写 `sed`/`python` 去块 | 旧脚本 `--uninstall` | 它同时处理两种块、校验 BEGIN+END 成对、并留 `.stripped-bak`（`[VERIFIED: install-gsd-dsh.sh:280-305]`）；自写极易破坏 YAML（旧脚本注释自己就记了「a YAML break anywhere in the file kills `--dump-config`」） |
| 卸载插件 | 手改 `package.json` + `rm -rf node_modules/<pkg>` | `dsh plugin --profile p remove <name>` | reconcile 会自动同步 `dsh.profile.bundles`（本会话实测），手改会留下「清单说装了、磁盘没有」的半态 |
| 兼容性判定 | 自写 semver 比较 | 让 DSH 自己判（`add` 的 exit/文案、`--dump-config` 的 stderr） | 它用 `semver.satisfies(..., { includePrerelease: true })`，且 `engines.dsh` 与 peer 的优先级规则（engines 独占）自己实现必错 |
| 迁移检测脚本 | 新增 `scripts/gsd-migrate-check.mjs` | 文档内嵌命令块（本文件 Code Examples 已给） | D-06 已裁决不做；且 `scripts/` 是构建产物目录，会被 `build.mjs` 重建 |
| 造「和真实用户一样」的初始 profile | 手写 `package.json` | `dsh --profile web --dump-config`（零网络建出模板 profile）或旧脚本自己跑一遍 | 手写清单极易漏 `dsh.profile.bundles` 的模板项，导致层序与真实用户不同 |

**Key insight:** 本 phase 的所有判据都应当**由 DSH 自己产生**（层标签、row 行、stderr 文案、exit code），而不是由我们重新实现一遍 DSH 的语义。自己实现的那一份，其失真只在验收当天才会暴露——正是 Phase 3 verifier 指纹事件的重演风险。

## Runtime State Inventory

> 本 phase 是迁移 phase，五类必须逐项回答。**每一项都给出只读举证命令**（D-07 拒绝全机 `find`，这里全部是定点的 `ls`/`grep`/`node -e`）。下表「实测现值」是本机 2026-11-13 的真实状态，可直接当 runbook 的「迁移前基线」。

| Category | 找到的东西（实测） | 需要的动作 |
|----------|------------------|-----------|
| **Stored data**（磁盘上的受管数据） | ① `$DSH_HOME/skills/gsd-*`：**72 个**目录（`[VERIFIED: ls -d ~/.dsh/skills/gsd-* \| wc -l → 72]`）。② `$DSH_HOME/{gsd-core,hooks,scripts}`：三者**都**带 `.gsd-dsh-managed` 标记（`[VERIFIED: 本会话逐个 test -e]`）。③ `$DSH_HOME/gsd-hooks.dsh.json` 3953 B + 同名 `.gsd-dsh-managed` 0 B（`[VERIFIED: ls -la]`）。④ `~/.gsd/research-cache/`（全局 GSD 状态，**不**属旧脚本管理）。⑤ profile 级：`web`/`headless` 的 `package.json` 里挂着 `@deepseek-ai/dsh-hook-protocol` + `@deepseek-ai/dsh-hooks-claude-code` 两条**直连依赖**（旧脚本 6/6 写入，`--uninstall` 不清）。 | ①②③ 由 `--uninstall` 删（①无条件、②③按 marker）；④ 由 runbook 列为**可选**清理（D-04）；⑤ 属**非阻断残留**——迁移后 dsh-gsd 自己依赖这两个包，保留直连不产生双源，**不要手改清单**（见 Pitfall 12）。 |
| **Live service config**（活在 UI/运行进程里、不在 git 的配置） | ① `$DSH_HOME/profiles/web/cordis.patch.yml` 与 `…/headless/cordis.patch.yml` 各含一段 `# GSD-DSH-bridge BEGIN … END`（`[VERIFIED: grep -l → 两个文件]`）；无 `# GSD-DSH-sandbox` 块（`[VERIFIED: grep -l → 无输出]`）。② `$DSH_HOME/cordis.patch.yml`（机器级层）**零** GSD 命中（`[VERIFIED: grep -c GSD → 0]`），只有 ATC 管理的 MCP 行。③ `web` 的 user 层还有 `patchReload: "live"`（`[VERIFIED: ~/.dsh/profiles/web/package.json]`）。 | ①由 `--uninstall` 剥除（**所有** profile，机器级）→ runbook 必须先过 D-03 硬门；②无需动作（无残留），但判据里保留一行 grep 成本为零；③说明 hooks 挂载**必须重启**才生效，runbook 的「复验」段要写「重启后再验」。 |
| **OS-registered state**（OS 级注册） | **None found.** 依据：旧脚本 1061 行全文只有文件系统动作、`npm pack/install -g`、`node` 调用与 `dsh plugin add`——**无** launchd/systemd/schtasks/注册表调用（`[VERIFIED: install-gsd-dsh.sh 全文 1-1061]`）。DSH 本身以 `dsh web` 进程方式运行，无守护安装。 | 无。runbook 用「重启 dsh web」而非「重启服务」。 |
| **Secrets / env vars** | 旧脚本读取的**用户面 env** 共 11 个：`DSH_HOME`、`GSD_VERSION`、`GSD_PACKAGE_DIR`、`GSD_PROFILE`、`GSD_FORCE_HOOKS_PATCH`、`GSD_ALLOW_OLD_NODE`、`GSD_NO_BRIDGE_SYNC`、`GSD_HOOKS_SANDBOX_PATCH`、`GSD_INSTALL_BWRAP`，加 `PWD`（`--fix-repo`）与 `CLAUDE_CONFIG_DIR`（内部置为 staging）（`[VERIFIED: install-gsd-dsh.sh:38-58 与 384]`）。**无密钥类变量**。迁移相关的环境面只剩两个：`DSH_HOME`（决定 home）与 `PATH`（决定 `gsd_run` 是否被找到）。 | runbook 需**显式声明**：上述 `GSD_*` 变量在插件方式下**全部无对应物**（差异表的第四列「迁移影响」）；旧文档里「`GSD_PROFILE=core` 精简档」的等价物不存在（D-12 已裁决要写进差异表）。 |
| **Build artifacts / installed packages**（装了/建了就不会自动变的东西） | ① 全局 npm `@opengsd/gsd-core@1.16.0` + `$prefix/bin/gsd_run`（`[VERIFIED: npm ls -g --depth=0；readlink -f $(command -v gsd_run)]`）。② `$DSH_HOME/profiles/*/cordis.patch.yml.bak.<epoch>` **5 个**（headless×2、web×3，其中 web 有一个 13 位毫秒戳 `1791882147969`）——旧脚本「bridge 块规范化」与 sandbox 补丁各自留的备份（`[VERIFIED: ls → 5 行]`）。③ `.stripped-bak`：**当前 0 个**（`--uninstall` 只在真剥掉块时写，`[VERIFIED: install-gsd-dsh.sh:299]` `fs.writeFileSync(f + '.stripped-bak', before)`）。④ `$DSH_HOME/profiles/<p>/node_modules/dsh-gsd`（插件态）。⑤ `$DSH_HOME/profiles/<p>/.plugin-manager/logs/operation-*`（每次 pnpm 操作一个目录，只增不删——本会话实测）。 | ①由 runbook 的 `npm uninstall -g` 处理（D-04），②③由 runbook 提示「人工确认后清理」（**不能**自动删：`.bak.*` 里可能有用户自己的历史块），④⑤无动作。⚠ ②③ 是 CONTEXT 未列全的**残留类**——CONTEXT 只记了 `.stripped-bak`，实测还存在 `.bak.<epoch>`。 |

**只读举证命令（可直接进 runbook 的「复验」段；`DSH_HOME` 缺省指向真实家目录，演练时指向临时 home）：**

```bash
: "${DSH_HOME:=$HOME/.dsh}"

# A 旧技能（D-05 面 1：阴性对照）——期望 0
ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l

# B 受管目录——期望三行全 absent
for d in gsd-core hooks scripts; do
  printf '%-10s %s\n' "$d" "$([ -e "$DSH_HOME/$d" ] && echo PRESENT || echo absent)"
done

# C 旧 hooks 配置 + marker——期望无输出
ls "$DSH_HOME"/gsd-hooks.dsh.json* 2>/dev/null

# D bridge/sandbox 块（D-07 面 2）——期望无输出；再逐 profile 数 gsd-hooks-bridge 行，期望全 0
grep -l -e 'GSD-DSH-bridge BEGIN' -e 'GSD-DSH-sandbox BEGIN' \
  "$DSH_HOME"/profiles/*/cordis.patch.yml 2>/dev/null
grep -c 'gsd-hooks-bridge' "$DSH_HOME"/profiles/*/cordis.patch.yml 2>/dev/null

# E 备份残留——期望无输出（有则人工确认）
ls "$DSH_HOME"/profiles/*/cordis.patch.yml.stripped-bak \
   "$DSH_HOME"/profiles/*/cordis.patch.yml.bak.* 2>/dev/null

# F 全局 CLI（D-04）——期望 not-found 与 0
command -v gsd_run || echo "no gsd_run on PATH"
npm ls -g --depth=0 2>/dev/null | grep -c '@opengsd/gsd-core'

# G 全局 GSD 状态（可选清理项）
ls -d "$HOME/.gsd" 2>/dev/null || echo "no ~/.gsd"

# H profile 里的旧直连依赖（非阻断残留，仅登记）
for p in "$DSH_HOME"/profiles/*/package.json; do
  node -e 'const m=require(process.argv[1]);const d=m.dependencies||{},
    hit=["@deepseek-ai/dsh-hooks-claude-code","@deepseek-ai/dsh-hook-protocol"].filter(k=>k in d);
    console.log(process.argv[1].split("/").slice(-2)[0], hit.join(",")||"-")' "$p"
done
```

**D-05 的「内容比对」需要一个现成的判别器——本会话实测了两个同名异源技能（可直接写进 runbook 当抽检点）：**

| 技能 | 旧部署（`$DSH_HOME/skills/…`） | 插件包（`…/node_modules/dsh-gsd/skills/…`） | 结论 |
|------|-------------------------------|--------------------------------------------|------|
| `gsd-health/SKILL.md` | **3084 B**，sha256 前 16 位 `e59120c11c72ffe9` | **3587 B**，`05ef6ef4f451d3e6` | 两侧**内容不同**（不是重复，是冲突） |
| `gsd-new-project/SKILL.md` | **3195 B** | **3856 B** | 同上 |

`[VERIFIED: 本会话 wc -c + shasum -a 256 + ls]`；包内 `skills/gsd-*` 也是 **72** 个（`[VERIFIED: ls | wc -l]`）。
⇒ 迁移后的合格形态是：**旧路径的 3084 B 文件不存在**，且**包内 3587 B 文件存在**，且 `index.js` 打印的 provider 路径落在 `<profile>/node_modules/dsh-gsd/skills`（`index.js:43` 打印 `[dsh-gsd] skills provider: <包内绝对路径>`，CONTEXT 已记）。三者同时成立才算 D-05 的双条判据都满足。

## Common Pitfalls

### Pitfall 1: `--uninstall` 永远 exit 0，且「没剥块」也算成功
**What goes wrong:** runbook 若写 `bash install-gsd-dsh.sh --uninstall && echo 卸干净了`，即使它一个块都没剥、一个目录都没删，也会打印成功。
**Why it happens:** 剥块脚本对每个文件先判 `if (!(s.includes(B) && s.includes(E))) continue;`（`[VERIFIED: install-gsd-dsh.sh:292-298]`），BEGIN/END 不同时在场就认为「没有块」并打印 `no marked block: <f>`；末尾无条件 `exit 0`（`[VERIFIED: :308]`）。`set -euo pipefail` 也被 `|| true` 兜住（`[VERIFIED: :305]` `node "$NODE_STRIP" … || true`）。
**How to avoid:** 判据只认 §Runtime State Inventory 的 A–D 四条命令的输出，不认 exit code。
**Warning signs:** 卸载日志里出现 `no marked block:` 而你**知道**那个 profile 有块（说明块被手工改坏了，BEGIN/END 不成对）。

### Pitfall 2: `--uninstall` 只扫 `profiles/*/cordis.patch.yml`，不扫机器级那一层
**What goes wrong:** 若用户曾把 bridge 块手工放进 `$DSH_HOME/cordis.patch.yml`（机器级层，优先级高于 profile 层），`--uninstall` 不会碰它，于是「卸载后有第二个 bridge」。
**Why it happens:** glob 写死为 `"$DSH_HOME"/profiles/*/cordis.patch.yml`（`[VERIFIED: install-gsd-dsh.sh:305]`）。
**How to avoid:** 判据 D 之外再加一条 `grep -c 'gsd-hooks-bridge' "$DSH_HOME"/cordis.patch.yml`（本机实测 0，成本一行）。**不要**在 runbook 里声称旧脚本会清它。

### Pitfall 3: `--dump-config` 在 bundle 被跳过时仍然 exit 0
**What goes wrong:** 版本错配的 bundle 会被静默跳过，dump 依旧成功；以 exit code 作判据的验收会把它判绿。
**Why it happens:** `reportSkippedBundles` 只 `process.stderr.write`（`[VERIFIED: app-boot:1355-1357]`），不改变退出码；`loadProfileDirectory` 用 `try/catch` 把坏 bundle 收进 `skippedBundles`（`[VERIFIED: app-boot:1800-1821]`）。
**How to avoid:** 判据 = **stderr 必须为空** + **`grep '^# == <bundle>'` 的层数等于 `dsh.profile.bundles` 长度** + 关键 row id 各出现 1 次。本会话实测的对照值：正常 369 行 / 坏掉 366 行 / stderr 1 行。
**Warning signs:** stdout 行数比上次少了几行而没有报错。

### Pitfall 4: `--dump-config` 不是只读
**What goes wrong:** 想「先看一眼真实 `web` profile 的合成结果」，结果写坏了/写了 `$DSH_HOME/profiles/web/cordis.yml`（内容虽为常量，但仍是写入；若 profile 不存在还会被**建出来**）。
**Why it happens:** `prepareProfile` 无条件 `writeFileSync(join(profile.dir, PROFILE_ROOT_FILENAME), PROFILE_ROOT_CONFIG)`（`[VERIFIED: profile-boot:221]`）；`loadProfile` 在 `package.json` 缺失时会 `initProfile`（`[VERIFIED: app-boot:1848-1852]`）。
**How to avoid:** 真实 home 的探测只用 `ls`/`grep`/`node -e` 读文件；一切 dump 只在临时 home 里跑。若必须 dump 真实 profile，先声明「这会重写 `<profile>/cordis.yml`」并把它写进 runbook 的「无害副作用」清单。

### Pitfall 5: `.tgz` 安装走的是「装了再回滚」，不是「装前拒绝」
**What goes wrong:** 演练用 `add ./dsh-gsd-….tgz` 时，错配的后果是「先真装进 node_modules，再回滚 package.json/lock」，`node_modules` **留在盘上**；有人据此认为「装上了」。
**Why it happens:** `namedSpecManifest` 只对 `kind === 'path'` 与 `kind === 'registry'` 预读 manifest，`tarball` 直接 `return undefined`（`[VERIFIED: operations.js:189-209]`）；真正判定发生在 pnpm 之后的直接依赖循环里（`[VERIFIED: operations.js:516-575]`）。
**How to avoid:** runbook 必须写明演练命令与真实用户命令的差异；回滚后的判据用 `dependencies` 键 + `dsh.profile.bundles` + `pnpm-lock.yaml` 是否存在三条一起看（本会话实测：依赖键消失、bundles 不变、lock 被删）。

### Pitfall 6: `engines.dsh` 在场时 peer 不是运行时门——改 `pins.json` 造不出运行时症状
**What goes wrong:** 按 D-13 的「改 `pins.json` 的 `lines.022.peer`」做演练，只看到 `check-pins` exit 2，误以为「症状就这些」。
**Why it happens:** `unmetRequirements` 在 `Object.hasOwn(engines, "dsh")` 为真时**立即 return**，peer 分支永远走不到（`[VERIFIED: app-boot:1097-1117]`）；而 `pins.json` 的 peer 只被 `check-pins` 步骤 (j) 消费（`[VERIFIED: build/lib/check-pins.mjs:152-160]`）。
**How to avoid:** 运行时症状必须从 ③/③′ 层注入（改已装包的 `engines.dsh` 或 bridge 包的版本/peer）。建议两条都做：静态门证明「CI 能拦住」，运行时门证明「用户会遇到什么」。

### Pitfall 7: `remove` 之后 `node_modules` 里仍留着符号链接
**What goes wrong:** 想用 `ls node_modules | grep <pkg>` 证明「已卸载」，结果仍在。
**Why it happens:** 本会话实测（`link:` 形态的依赖）`remove` 后 `package.json` 的 `dependencies` 与 `dsh.profile.bundles` 都已清掉，但 `node_modules/<pkg> -> /tmp/...` 的 symlink 仍在（pnpm 在该 profile 的 `nodeLinker: hoisted` + link 依赖下未剪枝）。`[VERIFIED: 本会话实验 5]`
**How to avoid:** 「已卸载」的判据只认 `package.json` 的两个位置（`dependencies` / `dsh.profile.bundles`）与 `--dump-config` 的层缺失；不要用 `node_modules` 的目录是否存在。registry/tarball 形态是否同样残留**未实测**，写入 plan 时应标为「待演练确认」。

### Pitfall 8: 演练用 `npm i -g` 会覆写真实机器的全局 CLI
**What goes wrong:** 在 `/tmp` 的 `DSH_HOME` 里跑旧脚本，第 6/6 步 `npm install -g "@opengsd/gsd-core@1.20.1"` 照样写进**真实的** npm prefix（本机 `.../lib/node_modules` + `bin/gsd_run`），把用户在用的 `1.16.0` 冲掉。
**Why it happens:** `DSH_HOME` 只改数据根，不改 npm prefix；旧脚本无 dry-run（`[VERIFIED: install-gsd-dsh.sh:1024-1039]`）。
**How to avoid:** 用 `--no-npm-bin`（注意：**仅非 upgrade 模式生效**，`[VERIFIED: :396-409]`）；或 `export npm_config_prefix=$(mktemp -d)`（实测 `npm config get prefix` 会随之变）。推荐两者都写进 runbook 的「演练专用」段，并在演练后核对 `npm ls -g --depth=0 | grep gsd-core` 仍是 `1.16.0`。

### Pitfall 9: 同名 row id 静默双行——「无冲突」必须定义成集合判据
**What goes wrong:** 两个插件都 `insert` 同一 id，DSH 不报错、`--dump-config` exit 0，但挂载了两行同 id；后续按 id 的配置补丁只会命中最后一条（`entryMap` 后写覆盖）。
**Why it happens:** `applyPatches` 的 insert 分支是 `data.push(...clone)`，无去重（`[VERIFIED: app-boot:505-534]`）；本会话实验 7 实测零 warning、dump 出现两行 `id: probe-row`。
**How to avoid:** MIG-04 判据里加一条**集合断言**：期望 id 集合 = 实际 id 集合、且无重复。命令见 Code Examples。

### Pitfall 10: README 顶部加一行会踩到三条既有断言（含一个切片陷阱）
**What goes wrong:** 加「从脚本迁移」入口后 `docs-consistency` 变红，或更糟——没红但断言的作用域被悄悄改掉。
**Why it happens:** ① `tests/docs-consistency.test.mjs:30-33` 用 **`readme.indexOf('# dsh-gsd')` 的前两次出现**切分 zh/en 两半；若新加的入口里出现字面量 `# dsh-gsd`，切片点会整体位移，①②⑦⑫ 全部作用在错误的半区。② ⑤ 会扫 README 里所有 `dsh-gsd@(\S+)` 并要求以数字开头（`[VERIFIED: :86-100]`）。③ ⑫ 要求 `dsh plugin --profile web add dsh-gsd` **整行恰好 2 行、zh/en 各 1 行、逐字节相等**（`[VERIFIED: :264-306]`）。
**How to avoid:** 入口写成**纯链接行**（例如 `> 从脚本迁移？见 [docs/MIGRATION.md](./docs/MIGRATION.md)。`），不含 `# dsh-gsd`、不含 `dsh-gsd@…`、不含裸名 install 整行；中英两半各一处（zh 段在第一个 `# dsh-gsd`（现在第 6 行）之后、第二个（第 79 行）之前）。

### Pitfall 11: CONTEXT 的「codegraph 本机未安装」与实测不符
**What if wrong:** 若 planner 按 CONTEXT 认定 codegraph 不存在，可能把 MIG-04 的覆盖面缩到 deja+dshmarket，从而**漏掉唯一一个「零 DSH 依赖、只贡献一行、peer 范围最宽」的样本**；或者反过来以为要联网装它。
**实测：** `~/.dsh/profiles/web/package.json` 的 `dependencies` 含 `"@jiangzhenguo/dsh-codegraph": "github:jiangzhenguo/dsh-codegraph#main"`，`dsh.profile.bundles` 含 `"@jiangzhenguo/dsh-codegraph"`，实装版本 `1.2.2`，其 `cordis.patch.yml` 贡献 `- id: dsh-codegraph`（`[VERIFIED: 三个文件本会话读取]`）。
**How to avoid:** 以实测为准；并在 plan 里显式记录这次对 CONTEXT 的纠偏（CONTEXT 是裁决记录，不宜静默改写，但 Discretion 的事实前提必须更正）。

### Pitfall 12: profile 里的旧 hooks 直连依赖是「非阻断残留」，但不能手改
**What goes wrong:** 想「顺手干净」，把 `web`/`headless` 的 `package.json` 里那两个 hooks 依赖删掉 → 与 pnpm 树脱节，且 `dsh-gsd` 自己也依赖这两个包（版本同为 `0.2.2-rc.1`），删了反而可能让 hoisted 树缺包。
**Why it happens:** 旧脚本 6/6 用 `dsh plugin add --save-exact` 把它们写进每个 profile（`[VERIFIED: install-gsd-dsh.sh:690-703]`），`--uninstall` 只管文件与块，不做 pnpm 操作（`[VERIFIED: :262-309]`）。
**How to avoid:** 判据里**只登记不处理**（Runtime State Inventory 命令 H）；runbook 明说「这两条直连依赖在迁移后无害，交由包管理器自然收敛」。

### Pitfall 13: 离线演练不成立（旧脚本取源 + 插件依赖都要 registry）
**What goes wrong:** 以为演练可以完全离线。
**Why it happens:** 旧脚本在线模式 `npm pack "@opengsd/gsd-core@$GSD_VERSION"`（`[VERIFIED: :359-379]`）；离线模式要求 `GSD_PACKAGE_DIR` 里有 `bin/install.js`（`[VERIFIED: :342-358]`），而**本仓的构建产物 `gsd-core/` 没有 `install.js`**（实测 `ls gsd-core/bin/install.js` 不存在，也没有 `gsd-core/package.json`）。插件侧，`dsh-gsd` 自己依赖两个 DSH 包，`.tgz` 安装仍要让 pnpm 解析它们。
**How to avoid:** 把「需要网络」写进 plan 的前置条件；若必须离线，先准备一个**完整 npm 布局**的 `GSD_PACKAGE_DIR`（不是本仓的 payload 树），并预置 pnpm store。

## Code Examples

> 以下全部在本会话的一次性 `DSH_HOME` 里实跑过（除标注「未实测」者）。命令块可直接进 `docs/MIGRATION.md`。

### 迁移演练骨架（含隔离与全局 prefix 防护）

```bash
# 0) 隔离 home + 隔离 npm 全局 prefix（防 Pitfall 8）
export DSH_HOME="$(mktemp -d /tmp/dsh-mig-XXXXXX)"
export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"
echo "DSH_HOME=$DSH_HOME"; echo "npm prefix=$(npm config get prefix)"

# 1) 造一个和真实用户同形的 profile（零网络；shipped 模板即可）
dsh --profile web --dump-config > /dev/null          # 实测：EXIT=0，建出 profiles/web

# 2) 旧脚本装一遍（--no-npm-bin 双保险）
GSD_VERSION=1.20.1 bash /path/to/install-gsd-dsh.sh --no-npm-bin

# 3) 硬门（D-03）：任一 profile 仍有 bridge 块 → 真机上必须中止
grep -l 'GSD-DSH-bridge BEGIN' "$DSH_HOME"/profiles/*/cordis.patch.yml 2>/dev/null && {
  echo "ABORT: 先逐 profile 裁决去向（D-03）"; exit 1; }

# 4) 卸载
bash /path/to/install-gsd-dsh.sh --uninstall

# 5) 装插件（tarball 必须是绝对路径或被 shell 展开成绝对路径；
#    DSH 的 anchorPathSpec 会把 ./-开头 的 spec 锚到 cwd，见 operations.js:72-77）
dsh plugin --profile web add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"

# 6) 复验（D-05 + D-07，见下两段）
```

### 复验 A：三层门症状对照（错配演练用）

```bash
# ③ bundle 级：改坏已装 bundle 的 engines.dsh（真实漂移的最小模拟）
PKG="$DSH_HOME/profiles/web/node_modules/dsh-gsd"
node -e 'const f=process.argv[1],j=JSON.parse(require("fs").readFileSync(f,"utf8"));
         j.engines.dsh=">=9.0.0";require("fs").writeFileSync(f,JSON.stringify(j,null,2)+"\n")' "$PKG/package.json"

dsh --profile web --dump-config > /tmp/dump.out 2> /tmp/dump.err; echo "EXIT=$?"
grep -c '^# == dsh-gsd' /tmp/dump.out     # 期望 0（层消失）
grep -c 'id: gsd-hooks-bridge' /tmp/dump.out  # 期望 0
cat /tmp/dump.err                          # 期望 1 行：dsh: skipping profile bundle "dsh-gsd": Error: …
# ⚠ EXIT 仍为 0 —— 判据必须看 grep，不看 exit code（Pitfall 3）

# ③′ row 级（bridge 包版本错配）—— 需 boot 才能观察，源码文案为：
#   dsh: disabling profile plugin row "gsd-hooks-bridge": <reason>
#   （[VERIFIED: app-boot:3085-3087]；本会话未实测 boot 路径，列为执行期任务）
```

### 复验 B：并存判据（MIG-04 的可判定定义）

```bash
P=web
dsh --profile "$P" --dump-config > /tmp/d.out 2> /tmp/d.err || echo "dump failed"

# 1) bundle 层数 == 清单长度（Pitfall 3 的集合版）
node -e 'const m=require(process.argv[1]);console.log(m.dsh.profile.bundles.length)' \
  "$DSH_HOME/profiles/$P/package.json"
grep -c '^# == ' /tmp/d.out

# 2) stderr 必须为空（否则有 bundle 被跳过）
test -s /tmp/d.err && { echo "SKIPPED BUNDLE:"; cat /tmp/d.err; }

# 3) id 集合：期望值 vs 实际值，且无重复（Pitfall 9）
grep -oE '^- id: [^ ]+$' /tmp/d.out | sed 's/^- id: //' | sort | uniq -d   # 期望无输出
grep -E '^- id: (gsd|gsd-hooks-bridge|deja|dsh-market|dsh-codegraph)$' /tmp/d.out | sort
# 期望恰 5 行：dsh-codegraph / dsh-market / deja / gsd / gsd-hooks-bridge
```

### 复验 C：D-05 双条判据（阴性对照 + 内容比对）

```bash
# 阴性：旧源必须死
test "$(ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l | tr -d ' ')" = 0 \
  || { echo "FAIL: 仍有旧技能"; exit 1; }

# 阳性：新源必须真，且是包内那份（尺寸判别器，本会话实测）
PKG="$DSH_HOME/profiles/web/node_modules/dsh-gsd"
wc -c "$PKG/skills/gsd-health/SKILL.md"       # 期望 3587（旧源为 3084）
wc -c "$PKG/skills/gsd-new-project/SKILL.md"  # 期望 3856（旧源为 3195）
ls -d "$PKG"/skills/gsd-* | wc -l             # 期望 72
# 会话侧证据（可选）：provider 行由 index.js:43 打印，形如
#   [dsh-gsd] skills provider: <包内绝对路径>
```

### 修复路径（写进 MIGRATION §3 的「修复」列）

```bash
# 精确二元组豁免（会写 <profile>/compatibility.json；风险自负）
dsh plugin --profile web allow-version dsh-gsd@1.20.1-1.dsh022 \
  --dsh-version 0.2.2-rc.1 --accept-risk
# 输出：dsh: warning: allowing incompatible plugin versions can break the application or corrupt data. …
#       dsh: allowed dsh-gsd@1.20.1-1.dsh022 for DSH 0.2.2-rc.1
```
`[VERIFIED: plugin-DscIHF4k.js:37-49 的文案与 `setProfileVersionExemption`，`app-boot:1159` 的 `compatibility.json` 文件名]`；该命令行本身**未实跑**（会写 profile 文件），文案来自源码逐字。

### 旧脚本行为的取证命令（迁移前基线，只读）

```bash
# 旧部署是否存在（本机实测：72 / 三目录 marker 齐 / hooks json 3953 B）
ls -d "$DSH_HOME"/skills/gsd-* | wc -l
for d in gsd-core hooks scripts; do test -e "$DSH_HOME/$d/.gsd-dsh-managed" && echo "MANAGED $d"; done
ls -la "$DSH_HOME"/gsd-hooks.dsh.json*
# 机器级影响面（本机实测：web + headless 两个 profile 会被波及）
grep -l 'GSD-DSH-bridge BEGIN' "$DSH_HOME"/profiles/*/cordis.patch.yml
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 脚本把 skills 铺进 `$DSH_HOME/skills`（机器级，所有 profile 共享） | 插件以 bundle 层挂一个 `includeDefaultRoots:false` 的 skills provider（profile 级） | 本仓 Phase 1-2 起 | 迁移必须是「先卸后装」，否则双源同时提供同名技能（D-01）；旧源与包源内容不同（3084 vs 3587） |
| 手写/脚本写 profile `cordis.patch.yml` 的 bridge 块（机器级绝对 `configPath`） | 插件的 `cordis.patch.yml` 用 `!!js createRequire(baseUrl)` 包内自定位 | 本仓 Phase 1 | 差异表的「hooks 归属轴」的真正差异**不是事件集合**（两侧同为 5 事件 / 14 matcher），而是 configPath/pluginRoot 的归属 |
| `npm i -g @opengsd/gsd-core` 提供 `gsd_run`（PATH） | 包内引擎 + skills adapter 写 `node <GSDROOT>/gsd-core/bin/gsd-tools.cjs`（不走 PATH） | 本仓 Phase 1（Key Decision 3） | 卸掉全局 CLI 不损伤插件态（D-04）；但旧文档仍教人敲 `gsd_run`，留它 = 留一个 1.16.0 的坑 |
| DSH 插件靠 `ctx.plugin` 订阅 hooks（已证不工作） | bundle patch YAML 行（`gsd-hooks-bridge`） | 本仓 Phase 1（Key Decision 4） | 版本错配时该行会被 `disabled`，症状是「静默无守卫」而非报错（Pattern 4 ③′） |
| 「卸载 = 删目录」 | 「卸载 = 删目录 + 剥块 + 清 marker + 全局 CLI 另办」 | 旧脚本 v? → 本 phase 定稿 | MIG-01 的 runbook 必须把「旧脚本不做的三件事」单列（全局 npm、`~/.gsd`、profile 直连依赖） |

**Deprecated/outdated:**
- 「`GSD_PROFILE=core\|standard\|full` 档位」在插件方式下**无对应物**（D-12 第二轴）：迁过来只会**多得**技能，不会缩水；精简档是 Backlog 里的 `dsh-gsd-core`。
- `pins.json` 的 `lines.021`（`"dsh": "0.2.1-rc.5"`、`"dshRange": "<unsupported>"`）说明旧兼容行已被标 unsupported——差异表**不要**把 0.2.1 写成受支持行。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `[ASSUMED]` pnpm 的 `--force` 会强制重新解析并覆盖已装依赖（`cordis.patch.yml` 开发期注释建议用它重装） | Pattern 1/2 | runbook 若写「`--force` 重装」而实际行为不同，用户会卡在「装了旧快照」 |
| A2 | `[ASSUMED]` registry/tarball 形态的依赖在 `remove` 后同样会在 `node_modules` 留痕 | Pitfall 7 | 判据若依赖 `node_modules` 的存在性，可能误判（本会话只实测了 `link:` 形态） |
| A3 | `[ASSUMED]` 演练环境可联网（旧脚本取源 + 三个第三方插件安装） | Pitfall 13 / Environment | 无网则 MIG-01/MIG-04 的 end-to-end 演练无法完成，只能降级为静态判据 |
| A4 | `[ASSUMED]` boot 路径的 row 级禁用文案与源码一致（`dsh: disabling profile plugin row "…": …`） | Pattern 4 ③′ | 若实际多了前缀或走了别的分支，症状表要改；本会话未启动 profile 观测 |
| A5 | `[ASSUMED]` 真实 `web` profile 的 `patchReload: "live"` 只影响 user 层热重载，不影响 bundle 层 | Pattern 5 / Runtime State | 若 bundle 层也能热重载，runbook 的「必须重启」会过严（过严无害，过松有害） |
| A6 | `[ASSUMED]` 旧仓 `install-gsd-dsh.sh` 在本 phase 期间不变（基准 `41fcc7a`） | 全文 | 若旧仓更新，`--uninstall` 的行为与行号引用会漂移；备料（D-09）用章节锚点而非行号正是为此 |

## Open Questions

1. **旧脚本 end-to-end 演练本轮未执行（最重要的执行期任务）**
   - What we know: 每一步的**单元行为**都已读源码确认；旧脚本的取源、部署、bridge 块规范化、`--uninstall` 四段逻辑均已逐行读过；`--no-npm-bin` 与 `npm_config_prefix` 两条防全局污染路径已实测可用。
   - What's unclear: 在**真实网络 + 真实 pnpm store** 下，`GSD_VERSION=1.20.1 bash install-gsd-dsh.sh --no-npm-bin` 在一个 `/tmp` home 上的完整输出、耗时、以及它调用的 `dsh plugin add`（对每个 profile）在本机 pnpm 12.11.2 下是否出现 Phase 2 记录过的那类 ERESOLVE。
   - Recommendation: 作为 04-01 的第一个执行任务，**在临时 home 里跑一遍并留完整日志**；这也是 SC-1「runbook 全流程在验证机走通」的唯一真证据。

2. **boot 路径（row 级禁用）与「重启后 hooks 是否真的生效」**
   - What we know: 源码文案与判定逻辑已读；`--dump-config` 不执行 row 级 preflight，所以 dump 无法观察 ③′。
   - What's unclear: 在临时 home 里启动一个 profile（需要选一个能跑完就退的 app，如 `dsh headless "<task>"`）是否会真的打印禁用行、以及是否会因为有 row 被禁用而改变退出码。
   - Recommendation: 若时间允许，用 `dsh --profile <temp> headless "echo hi"` 之类的最小 app 观测一次；否则在 MIGRATION §3 里明确「③′ 症状来自源码，未在本机复现」，不要让读者以为是实测。

3. **MIG-04 的覆盖面（Discretion 第 2 条）需要 planner 裁定**
   - What we know: 三个插件在本机 `web` 都已装；id 集合互斥；真正的冲突面是 pnpm 解析；三者都被合法性门标 `SUS`（too-new）。
   - What's unclear: 是否值得为「凑齐 codegraph」付一次联网安装 + 一个 `checkpoint:human-verify`；还是用「静态集合比对（读真实 web 的文件）+ 临时 home 里只装 dsh-gsd 与 deja/dshmarket」两段式。
   - Recommendation: 两段式。静态一段证明行级无冲突（零安装、零网络、零风险），临时 home 一段证明「dsh-gsd 与至少一个第三方 bundle 能同层合成」。

4. **`docs/MIGRATION.md` 是否要仓内守卫（Discretion 第 5 条）**
   - What we know: 现有 13 条断言里，任何涉及 README 的改动都要过 ①②⑤⑦⑫ 五条；`docs/` 不在 `package.json` `files`（`[VERIFIED: package.json files 九项]`），`pack-contents` 的 `ALLOWED_TOP_LEVEL` 也没有 `docs`（`[VERIFIED: tests/pack-contents.test.mjs:48-52]`）。
   - What's unclear: 加一条「README 顶部含 MIGRATION 链接」的断言是否值得（会让今后重命名文档变红，但能防入口被误删）。
   - Recommendation: 若加，**追加到现有 `tests/docs-consistency.test.mjs`（⑭）而不是新建文件**——这样计数从 37 变 38，只需同步 `BUILD.md:16` 那一处活体计数（`[VERIFIED: BUILD.md:16]` `预期 37/37`）。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `dsh` CLI | 安装/卸载/复验全部 | ✓ | `0.2.2-rc.1` | — |
| `pnpm` | `dsh plugin` 的实际执行者 | ✓ | `12.11.2` | 无（缺则 `dsh plugin` exit 127） |
| `node` | 引擎、探针、测试 | ✓ | `v24.21.0` | 无（`engines.node >=24` 是硬门） |
| `npm` | D-04 全局卸载、`check-pins` 采样 | ✓ | `12.2.1` | — |
| 旧仓 `install-gsd-dsh.sh` | MIG-01 演练的第 2/4 步 | ✓（仓外，本机路径存在） | 1061 行 / HEAD `41fcc7a` | 无（fresh clone 里不存在此路径）；持久引用用 GitHub URL |
| 网络（npm registry） | 旧脚本取源、第三方插件安装 | 假设 ✓ | `https://registry.npmmirror.com`（`[VERIFIED: npm config get registry 与 pnpm config get registry 同值]`，只读镜像；`publishConfig.registry` 钉 npmjs 是 Phase 5 的事） | 离线需完整 `GSD_PACKAGE_DIR`（本仓 payload 树**不是**该形态，见 Pitfall 13） |
| pnpm store | 无网复用已下载包 | ✓ | `/Users/yue.weny/Library/pnpm/store/v11`（`[VERIFIED: pnpm store path 与实测安装日志同值]`） | — |
| `~/.dsh` 真实 home | 只读基线取证 | ✓ | 4 个 profile（`web`/`headless`/`gsdtest`/`gsd-p3-release`） | 演练不得写入（D-02） |

**Missing dependencies with no fallback:** 无（有网 + pnpm 即可完成全部演练）。
**Missing dependencies with fallback:** 旧脚本的离线模式（`GSD_PACKAGE_DIR`）——fallback = 联网跑在线模式；若必须离线，需另备一份完整 npm 布局的包目录。

## Validation Architecture

> `workflow.nyquist_validation` 在本项目为 `true`（`[VERIFIED: .planning/config.json:9]` `"nyquist_validation": true`），故本节必须存在。

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node 内置 `node --test`（Node `v24.21.0`），无第三方测试框架 |
| Config file | none（无 vitest/jest/pytest 配置；用例即 `tests/*.test.mjs`） |
| Quick run command | `npm test`（= `node --test tests/*.test.mjs`，当前 6 文件 / 37 顶层用例） |
| Full suite command | `node --test --test-concurrency=1 tests/*.test.mjs`（**必须串行**：`build-smoke` 会重写构建树，并发会假红 `gate C: no SKILL.md under skills/gsd-*`） |

补充：本 phase 的大部分判据不是 JS 测试，而是 **shell 断言块**（runbook 内嵌）。这类判据的「可运行性」由演练脚本证明，不进入 `npm test`；下表逐条区分。

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIG-01 | 先卸后装后，旧源全灭 + 新源可举证 | integration（**manual-only**：需临时 home + 旧脚本 + 网络） | `DSH_HOME=$(mktemp -d) bash <旧仓>/install-gsd-dsh.sh --no-npm-bin && … --uninstall && dsh plugin --profile web add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"` 后跑 Runtime State Inventory 的 A–D | ❌ Wave 0（命令块进 `docs/MIGRATION.md`；若 planner 要机器守卫则需新断言） |
| MIG-01′ | 「迁移后无残留」这条判据本身可重复执行 | smoke（**shell**，可对任意 `DSH_HOME` 跑） | `ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null \| wc -l`（期望 0）+ `grep -l 'GSD-DSH-bridge BEGIN' …`（期望无输出） | ❌ Wave 0（内嵌文档） |
| MIG-02 | 差异表三轴的每一格都有可复核的证据 | docs（**automated**：与实测值比对） | 三轴各自的事实源：`readlink -f "$(command -v gsd_run)"`、`npm ls -g --depth=0 \| grep gsd-core`、`jq -r '.[].matcher' config/gsd-hooks.json \| sort \| uniq -c` 与 `~/.dsh/gsd-hooks.dsh.json` 同命令对比 | ⚠ 部分：hooks 事件集合已在 Phase 2 固化；本 phase 仅需文档叙述 ⇒ 见 Wave 0 |
| MIG-02′ | 差异表不得与真源漂移（若加守卫） | unit（**automated**） | 追加到 `tests/docs-consistency.test.mjs` 的断言（如「MIGRATION.md 同时含 `dsh plugin` 与 `install-gsd-dsh.sh`」） | ❌ Wave 0（Discretion，planner 定） |
| MIG-03 | 旧脚本的定位（保底/离线）可被验证而非宣称 | docs（**manual-only**：需读旧仓 README 与真跑离线模式） | 备份料片段 + PR body 落盘（D-09）；离线模式可用性由 Pitfall 13 的结论约束 | ❌ Wave 0（备料文件） |
| MIG-04 | 同 profile 多 bundle 并存无冲突 | integration（**manual-only**：需临时 home + 安装） | Code Examples「复验 B」四段（层数 / stderr 空 / id 无重复 / 期望 5 行） | ❌ Wave 0（命令块进文档） |
| MIG-04′ | 「无冲突」的行级判据可离线复核 | smoke（**shell**，零安装） | 对真实 `web` 的三个插件 `cordis.patch.yml` 做 id 集合比对（`grep -h '^- id:' …`） | ❌ Wave 0 |
| HOOK-05 | 三类错配各有一条实测症状 → 原因 → 修复 | integration（**manual-only**：注入 + 观测） | Code Examples「复验 A」：改 `engines.dsh` → `--dump-config`（③，exit 0 + stderr 1 行）；改 bridge 包版本 → boot 观测（③′）；改 `pins.json` → `node build/lib/check-pins.mjs`（静态，exit 2） | ❌ Wave 0 |
| HOOK-05′ | 静态门仍绿（未被文档改动波及） | unit（**automated**） | `node build/lib/check-pins.mjs --offline`（或 `npm test` 里的 `docs-consistency` ②） | ✅ 已存在（`check-pins` + ②） |

**manual-only 的理由（不得省略）：** MIG-01/MIG-04/HOOK-05 的主判据都要求**真的装/卸一次**并观察宿主行为，而 D-02 禁止在真实 home 上做、D-06 禁止新增随包检测脚本。因此它们的「自动化」形态只能是**文档里的可复制命令块 + 一次性演练留证**，而不是 `npm test` 里的用例。planner 必须把「演练留证」（日志/输出粘贴进 SUMMARY）写成 Task 的验收物，否则这三条无法在 verifier 面前举证。

### Sampling Rate

- **Per task commit:** `npm test`（37/37；若加了 ⑭ 则 38/38）。**串行**，且先确认没有并发 `build` 在跑。
- **Per wave merge:** `node --test --test-concurrency=1 tests/*.test.mjs` + 本 phase 触及的 shell 判据块（对临时 home 复跑）。
- **Phase gate:** 全量绿 + 演练日志落盘 + `docs/MIGRATION.md` 双语两半都含三节（D-10/D-11）后，才交给 `/gsd-verify-work 04`。

### Wave 0 Gaps

- [ ] `docs/MIGRATION.md` —— 三节双语同构（D-10/D-11）；01/03 两轮都栽在「只写一半」，本 phase 需在验收里加「zh/en 各含 3 个二级标题」的可 grep 判据。
- [ ] runbook 的命令块（Runtime State Inventory A–D + Code Examples 复验 A/B/C）—— 这是 MIG-01/04/HOOK-05 的唯一可执行载体。
- [ ] 旧仓备料：`docs/` 下的粘贴片段（README 顶部中英各一份）+ 建议插入位置（章节锚点：「`## Quick start` 之前」，旧 README 该标题在 `[VERIFIED: install-gsd-dsh/README.md:35]`）+ PR title/body（D-09）。
- [ ] 演练日志留证（MIG-01/MIG-04/HOOK-05 三条 manual-only 的证据册）。
- [ ] **可选**：`tests/docs-consistency.test.mjs` 追加 ⑭（README 顶部 MIGRATION 入口），并同步 `BUILD.md:16` 的活体计数。
- [ ] 无新框架安装需求（`node --test` 已就位）。

## Security Domain

> `security_enforcement` 在本项目为 `true`（`[VERIFIED: .planning/config.json:10]`），ASVS level 1、`block_on: high`。

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | 本 phase 无身份面（不涉及账号/token；`gh`/npm 凭据属 Phase 5 发布面） |
| V3 Session Management | no | 不触碰会话状态 |
| V4 Access Control | yes（弱） | 演练脚本必须**先声明 DSH_HOME 与 npm prefix** 再动手；任何「默认值落到真实 home」的路径就是一次越权写（见 T-4-01/T-4-02） |
| V5 Input Validation | yes | 文档里的命令块必须对人可粘贴安全：路径一律用 `$DSH_HOME`/`"$PWD/…"` 引号包裹，禁止把用户输入拼进 `rm -rf`（旧脚本的 `rm -rf "$DSH_HOME"/skills/gsd-*` 是通配删除，runbook 引用时必须保留引号） |
| V6 Cryptography | no | 无加密逻辑；仅用 `shasum -a 256` 做内容比对 |

### Known Threat Patterns for 迁移演练 + 文档

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| **T-4-01 误伤真实 home**：某条命令忘了带 `DSH_HOME`，`--uninstall` 直接删真实 `~/.dsh/skills/gsd-*` 并剥掉 `web`/`headless` 的 bridge 块（本机实测这两个 profile 都会被波及） | Tampering / DoS | 演练脚本第一行 `export DSH_HOME=…` 且**每段开头 echo 一次**；`--uninstall` 前加硬门 grep（D-03）；真实 home 只做只读命令 |
| **T-4-02 全局 npm 被覆写**：演练里的 `npm i -g @opengsd/gsd-core@1.20.1` 冲掉用户在用的 `1.16.0` | Tampering | `--no-npm-bin` 或 `npm_config_prefix=$(mktemp -d)`（两条均已实测可用）；演练后核对 `npm ls -g --depth=0` |
| **T-4-03 PATH 上的引擎被劫持/串味**：探针调到别的 `gsd_run`（旧部署的 1.16.0 或 PATH 上更早的 shim），得出假的「一致」结论 | Spoofing | 一切引擎调用写**绝对路径**（`node "$PKG/gsd-core/bin/gsd-tools.cjs" runtime-identity --raw`），不依赖 PATH；runbook 里对 `command -v gsd_run` 的输出只作**残留证据**，不作「可用」证据 |
| **T-4-04 用豁免/`--force` 掩盖不兼容**：为了让演练「通过」而 `allow-version` 或 `--force` | Elevation of privilege（对兼容门） | 演练日志必须显式断言「**没有**出现 `allow-version` / `Exact-version exemption: active`」；MIGRATION §3 把豁免写成「显式承担风险」的最后手段 |
| **T-4-05 文档把机器特定路径固化**：`docs/MIGRATION.md` 不在 npm 包内（`files` 九项无 `docs`），不受 build gate B 的 `/Users/…` 字面禁令约束，但用户会**原样粘贴** | Information disclosure（弱）/ 可移植性 | 文档内一律 `$DSH_HOME`、`<profile>`、`~/.dsh`；只在「本机实测值」表格里出现 `/Users/...`，且标注为示例 |
| **T-4-06 供应链**：演练要装三个 `SUS`（too-new）第三方包 | Tampering | 优先用「静态读已装文件」的零安装判据；确需安装时加 `checkpoint:human-verify`，并在演练后清理临时 home |

## Sources

### Primary (HIGH confidence)

- **DSH 安装源码**（本机实现 checkout）：`lib/bin.js`、`lib/plugin-DscIHF4k.js`、`lib/profile-boot-e2mS45fC.js`、`lib/dump-config-D97dwXdd.js`；`node_modules/@deepseek-ai/dsh-plugin-manager/lib/types/{operations,install-spec}.js`；`node_modules/@deepseek-ai/dsh-app-boot/lib/index.js`（5315 行，本会话按区段精读）；`node_modules/@deepseek-ai/dsh-home-paths/lib/index.js`；`node_modules/@deepseek-ai/dsh-official-bundles/lib/index.js`。
- **旧部署源码**：`/Users/yue.weny/frontWorkspace/gsd-on-dsh/install-gsd-dsh/install-gsd-dsh.sh`（1061 行，全文精读）；`install-gsd-dsh/README.md`（23653 B，章节标题枚举）。
- **本会话的一次性 `DSH_HOME` 实测**（7 组实验：preflight 拒绝 / 成功 add / `--dump-config` / bundle 漂移 / `remove` / `.tgz` post-install 回滚 / 同 id 双行；另加模板 profile 创建、未知 profile 报错、`npm_config_prefix` 覆盖）。全部临时目录已 `rm -rf`。
- **本机真实状态只读探测**：72 个 `gsd-*`、三目录 marker、`gsd-hooks.dsh.json` 3953 B、`web`+`headless` 的 bridge 块、5 个 `.bak.<epoch>`、全局 `@opengsd/gsd-core@1.16.0`、`~/.gsd/research-cache`、`web` 的四个 bundle 与三个第三方插件 manifest。
- **仓内真源**：`package.json`、`cordis.patch.yml`、`build/assets/pins.json`、`build/lib/check-pins.mjs`、`tests/docs-consistency.test.mjs`、`tests/pack-contents.test.mjs`、`BUILD.md`、`.planning/config.json`。

### Secondary (MEDIUM confidence)

- CONTEXT.md 的已实测事实（本轮复核了其中 5 项：72 技能、3084/3587、两 profile bridge 块、全局 1.16.0、web 并存样本；**纠偏 1 项**：codegraph 本机已安装）。

### Tertiary (LOW confidence)

- `[ASSUMED]` 两项：pnpm `--force` 的重装语义；registry/tarball 形态 `remove` 后的 `node_modules` 残留形态（见 Assumptions Log A1/A2）。

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 四个工具链版本均实测；DSH 的「运行版本」来源（app-boot 的 package.json）由源码确认。
- Architecture（并存合成 / 三层门 / 隔离面）: HIGH — 每条结论都落在 `path:行区间` + 逐字引文，且关键行为（preflight / post-install / load-bundle / 同 id 双行 / `remove` / 模板 profile 创建 / `--dump-config` 写盘）均在本会话实测。
- Pitfalls: HIGH（本会话实测 7 条）+ MEDIUM（Pitfall 12/13 来自源码与仓内探测，未做端到端演练）。
- 旧脚本 end-to-end: MEDIUM — 单元行为确定，整体流程未跑（Open Question 1）。

**Research date:** 2026-11-13
**Valid until:** 2026-12-13（DSH 处于 `0.2.2-rc` 快速迭代期；`--dump-config` 的 exit 0 语义与 bundle 跳过行为一旦变化，Pattern 4 与 Pitfall 3 必须重测）