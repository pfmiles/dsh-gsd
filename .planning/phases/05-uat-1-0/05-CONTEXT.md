# Phase 5: 端到端 UAT 与 1.0 收官 - Context

**Gathered:** 2026-11-15
**Status:** Ready for planning
**Source:** 交互式 discuss（4 个灰度区 × 11 条裁决）；无 SPEC.md、无 RESEARCH.md

<domain>
## Phase Boundary

本 phase 交付「**在干净环境上被证明可用的发布物**」加「**三项对外动作的落地**」—— 是一次验收与发布，**不是**新的安装能力、**不是**新的构建能力。具体三段：

1. **UAT（判据段）**：在零 GSD 残留的新 `DSH_HOME` 上，机器驱动地跑 UAT-01..06 与 INST-01..06 全量复验，产出可重放的证据表。
2. **发布（不可逆段）**：`npm publish` → registry 通道复验 → GitHub Release → dshmarket PR 本体。
3. **收口（机器级段）**：3091 实例刷新 → 真实 `~/.dsh` 迁移 → 旧仓互链推送。**这三步会打断本会话**，故必须排在所有 `.planning/` 产物提交之后。

- **Phase Goal（ROADMAP 原文）**：干净机器全量验收，发布 1.0。
- **Requirements in scope**：UAT-01..06、INST-01..06 全量复验、PUB-01（npm 首发部分）、PUB-03（PR 本体部分）。
  - **⚠ 范围出入（必须由 planner 在 plan 中落点）**：ROADMAP 的 Requirements/SC **没有点名**五件前序 phase 明确移交到本 phase 的实物（见 D-10）。按 D-10 裁决，它们**全部纳入**，且其名字要回写进 ROADMAP Phase 5 的 Requirements/SC —— 不得静默完成。
- **Success Criteria（ROADMAP 原文，5 条）**：
  1. UAT-01..05 全绿（干净 DSH_HOME 安装、skills、健康、拦截、scaffold、升级回滚）
  2. hooks 回归（commit 校验拦截错误格式、injection 扫描落日志）
  3. 启动开销数字与技能 watch 行为记录入 README
  4. 1.0 发布 + UAT 报告
  5. 对外动作执行：`npm publish`（registry 通道复验）+ GitHub Release + dshmarket PR 本体

**不在本 phase**：新的构建/安装能力；`dsh-gsd-core` 精简档（Backlog）；`GSD_PROFILE` 档位等价物；`04-VALIDATION.md` 的 G-1/G-2/G-3（见 `<deferred>`）。

**本 phase 的核心难点不是跑通，是「别把假验收写成真验收」**：本机此刻就是一个反例 —— `gsdtest` 与 `gsd-p3-release` 装的插件是 CR-01 **修复前**形态，插件自身提供 **0 个技能**，而会话里可见的 72 个 `gsd-*` 全部来自旧脚本的 `~/.dsh/skills`。在该环境上跑 SKIL-01/UAT-01 会得到「72 个技能可见」的**假绿**。这与 Phase 3 CR-01 被掩盖、Phase 4 双源冲突是同一机制。
</domain>

<decisions>
## Implementation Decisions

以下 11 条为用户裁决（2026-11-15 交互 discuss），planner 必须逐条映射进 plan，不得重新论证。

### UAT 的执行环境与判据形态

- **D-01 — 干净环境 = `/tmp` 新 `DSH_HOME`，本机 profile 不进 UAT 判据** — **Reversibility:** reversible — 演练场是一次性目录，删掉即无痕。
  - 判据环境：`DSH_HOME=/tmp/dsh-uat-<ts>`，只种入 LLM 凭据（`~/.dsh/settings.yaml.imported` 的 provider 配置），**零 GSD 残留**：无 `skills/gsd-*`、无 `gsd-core`、无 `gsd-hooks.dsh.json`、无 bridge 块、无 `profiles/*/node_modules/dsh-gsd`。
  - **本机 profile 明确不可作 UAT-01 判据**：`~/.dsh/skills` 有 72 个旧 `gsd-*`，`headless`/`web` 仍含 `# GSD-DSH-bridge` 行 —— 在该环境上「72 技能可见」会由旧源满足，判据静默失效。
  - 推论：Phase 3 SC-1 的「干净 profile」定义（同 home 新 profile 名）**在本 phase 不够用**；仅可用于「真实机器并存」类补充章节。

- **D-02 — 机器优先、人工兜底** — **Reversibility:** reversible — 换驱动方式只改判据实现，不动产物。
  - 能用 headless 判的一律走一次性会话：`dsh --profile <p> --json --approval-policy never "<task>"`（answer 到 stdout、诊断到 stderr、进程退出）。
  - **每次调用都是新进程 ⇒ hooks 天然在新挂载下生效**，不需要人工重启即满足 INST-03 的「重启仅使 hooks 生效」。
  - 无头覆盖不了的（web GUI 观感类）才转人工，且**人工项必须写「人做了什么 + 可观察结果」**，不接受「我已确认」式的自述（Phase 3 verifier 指纹自述不符、Phase 4 两个假红都栽在这一点上）。

- **D-03 — UAT-06 用带基线的三点测量** — **Reversibility:** reversible — 数字可重测。
  - 三点：① 无插件基线 profile（只 `@deepseek-ai/dsh-base`）② 有插件同口径 ③ 插件 load 段日志时间差。**没有 ① 则「开销」无参照物**。
  - watch：watcher 计数（`fs_usage`/`lsof`）＋「改一个 `SKILL.md` 到生效」的时延，两条都要。
  - 落点：原始日志进 `05-UAT-EVIDENCE.md`；README **双语各一段**只放结论数字（SC-3 原文要求「记录入 README」）。

### 发布实体与失败处置

- **D-04 — 发布 `1.20.1-1.dsh022` 原样；「1.0」是 milestone 收官的叙述** — **Reversibility:** one-way — 版本号一旦上 registry 即烧掉，不可复用、不可撤回；同一版本号不能重发不同字节。
  - **不抬 rev、不另起 1.0.0**。依据：`git diff 9e99cd6..HEAD` 对 `files` 白名单（含 `package.json` 本身）**零 diff**，变更全在 `docs/` 与 `tests/`（均不进包）⇒ 要发布的字节正是 CI run `43238375397` 验证过的字节。抬 rev 反而让新号脱保。
  - 发布时需移除 `private: true`（见 Discretion）。
  - `dist-tags.latest` 必须指向该版本（承 03-D-06 硬移交，否则 catalog 卡片裸名命令 404）。

- **D-05 — publish 后 registry 复验变红 → 发 `.dsh023` 修订版，不 unpublish** — **Reversibility:** one-way — 已发布版本不可撤（`npm unpublish` 72h 后不可能，且有人依赖后不可能）。
  - 失败版本用 `npm deprecate` 标注原因；修正版走新 rev，并重跑 registry 通道复验。
  - **为什么不是 unpublish**：与 SC-5「无红跑历史」同精神 —— 保留可追溯历史优于抹除痕迹。

- **D-06 — GitHub Release = 正式 release，tag 无 v 前缀** — **Reversibility:** reversible — Release 可删可改，tag 可重打。
  - tag 名 `1.20.1-1.dsh022`（不带 `v`），`prerelease=false`，正文直接取 `CHANGELOG.md` 对应条目。
  - 与 `CHANGELOG.md` 已锁的发布约定逐字一致（「每个发布对应一个与版本串逐字相同的 git tag，不加 v 前缀」）。

### 对外动作的执行者与完成判据

- **D-07 — 三项对外动作分级执行** — **Reversibility:** reversible — 分工调整不改变任何产物。
  - `npm publish`：**由人类执行**（要 OTP；上一轮实测本机 `npm whoami` = ENEEDAUTH，未登录）。
  - `gh release create`：**由 agent 执行**（可删可改，且 `gh` 已登录可用）。
  - dshmarket PR：**agent 开、人类合并**。
  - 与 Phase 3 的 blocking-human 先例（推送由人类裁决）同构：不可逆动作交人。

- **D-08 — 本 phase 撤掉 `delete_repo` scope** — **Reversibility:** reversible — 重授权即可加回，代价是一次浏览器 re-auth。
  - 命令：`gh auth refresh --remove-scopes delete_repo`（`gh` 原生支持该 flag，会保持其余 scope 不动；`repo`/`read:org`/`gist` 是最小集不可移除）。
  - 理由：探针仓 `pfmiles/dsh-gsd-ci-probe` 在 Phase 3 已删除，`delete_repo` 已无用武之地；这是 PROJECT.md 记的 A-03-02 遗留（「token 扩权后待收窄」）的收口。

- **D-09 — dshmarket PR 不阻塞收官** — **Reversibility:** reversible — 完成判据是文档级约定。
  - 完成判据 = **PR 已开 + 对方仓四检通过**（≤3 条/PR、`dsh.bundle` 存在、仓龄 ≥1 天、awesome-lint + site build）。
  - **不等合并**：合并状态记入 `05-UAT.md` 作为开放项。否则「1.0 收官」的时间交给对方 maintainer，可能无限期挂着。

### 收口边界

- **D-10 — 五件未点名移交物全部纳入，并回写 ROADMAP** — **Reversibility:** costly — 纳入后若再撤出，已产出的计划与证据需重排；回写 ROADMAP 的 Requirements/SC 也要再改一次。
  - 五件（逐条都要在 plan 里落点）：
    1. **`--test-concurrency=1`** —— `package.json` 的 `test`/`prepack` 与 CI full-test 步骤三处都缺；`build-smoke.test.mjs` 会重写构建树 ⇒ 并发即假红 `gate C: no SKILL.md under skills/gsd-*`。**这是 publish 阻塞项**（`prepack = build && test`，假红会中止发布）。
    2. **G-4 codegraph 复验** —— `@jiangzhenguo/dsh-codegraph` 在 04 只有行级静态证据；真实迁移 `web` 后重跑步骤 6 的 CB-8 四条判据（`04-VALIDATION.md` 已 Escalated → Phase 5）。
    3. **真实 `~/.dsh` 整体迁移** —— 承 04-D-02；`web`/`headless` 一并处置。
    4. **旧仓 `pfmiles/install-gsd-dsh` 互链提交与推送** —— 承 04-D-08/D-09，素材已在 `docs/oldrepo-link/` 备好。
    5. **`ui-frontend-evidence.cjs:104` 的 `SKIP_DIRS` 缺 `.gsd-build-tmp`** —— 承 04 `<deferred>`。**注意**：该文件在 `gsd-core/bin/lib/`，是**构建产物**（gitignored，由 `build.mjs` 从上游 tarball 重建）⇒ 直接改文件会被下次构建冲掉；正确形态是 `build.mjs` 里的改写/补丁步骤（参照 `dsh-gsd-suite/run.cjs` 的 canonical 入库先例），或判定「属上游、本仓只登记」。
  - **回写义务（不得省略）**：把这五件的名字补进 `ROADMAP.md` Phase 5 的 `**Requirements**` 行与 Success Criteria，否则「计划外静默完成」会让 ROADMAP 与实际交付再次脱节（Phase 4 的 `req-line-misparse` 已是一次同类教训）。

- **D-11 — 有机器级副作用的三项：先 publish，收口放最后** — **Reversibility:** costly — 顺序错了要重做本机变更，而本机变更会打断执行会话，重启后需重新建立上下文。
  - 顺序锁定：`/tmp` UAT 全绿 → `npm publish`（人类）→ registry 复验 → Release → dshmarket PR → **然后才** 3091 刷新 → 真实 `~/.dsh` 迁移 → 旧仓推送。
  - **必须承认的代价（事实）**：本 phase 的执行会话就跑在要收口的那台机器上（`DSH_PROFILE=gsdtest`、`DSH_HOME=~/.dsh`、服务 pid 95618 @ 3091）。
    - 刷新 3091 = `--force` 重装 + 重启 = **杀掉本会话**；
    - 真实迁移的 `--uninstall` 会 `rm -rf "$DSH_HOME"/skills/gsd-*`（**本会话正在用的 72 个技能**）并剥掉 `web`/`headless` 的 bridge 块。
  - ⇒ 收口三步必须在**所有 `.planning/` 产物已提交**之后执行，且 plan 必须把它们写成独立的、可中断后重接的步骤（写 `.continue-here.md`）。

### 承载前序裁决（不得推翻，故不重新讨论）

- **次序**（承 03-D-02）：UAT 通过 → `npm publish` → GitHub Release → dshmarket PR。**SC-5 的「registry 通道复验」是 publish 之后的增量复验，不是首次验收** ⇒ UAT-01 的安装判据拆两段：publish 前用 tarball（`dsh plugin add ./dsh-gsd-<ver>.tgz`，Phase 3 SC-1 口径），publish 后用 registry 通道复验同一版本（D-04/D-05 的失败处置挂在这一段）。
- **`dist-tags.latest`**（承 03-D-06）：必须指向首发版本。
- **版本方案**（承 VER-02）：`<gsd-ver>-<rev>.dsh<line>` 不动，现为 `1.20.1-1.dsh022`。
- **`engines.dsh` 不收紧**（承 03-D-05）：`>=0.2.2-rc.1 <0.3.0-0` 保持；它与 `peerDependencies` 的 exact 值职责不同，取值不同是有意为之。
- **测试并发纪律**（承 02/STATE）：一切判据跑 `node --test --test-concurrency=1 tests/*.test.mjs`，**不用 `npm test`**（后者缺 flag，直到 D-10-1 修好）。
- **推送通道**（承 03）：SSH 不可用；成功形态 = `git -c credential.helper= -c credential.helper='!gh auth git-credential' push <https-url> main`；权威远端 sha 用 `gh api repos/pfmiles/dsh-gsd/commits/main`。

### Claude's Discretion

planner 定夺、须在 plan 中显式落成（不得静默假设）：

- **`private: true` 的移除时机与形态**：机械改一处，但它使包"可发布"；建议与 `publishConfig.tag` 同一次提交，且**不加** `publishConfig.tag`（走 npm 默认 `latest`，即满足 03-D-06）。
- **UAT 报告的落点与详略**：建议 `.planning/phases/05-uat-1-0/05-UAT.md`（判据 ↔ 证据 ↔ 结论表）+ `05-UAT-EVIDENCE.md`（原始日志与命令）；`docs/` 不进 `files` 白名单，故 UAT 报告**不进 npm 包**，也不新增进 `files`（会触发 pack 测试的 `ALLOWED_TOP_LEVEL` 红）。
- **`--test-concurrency=1` 的落法**：三处（`package.json` 的 `test`、`prepack`、`.github/workflows/compat-matrix.yml` 的 full-test 步骤）。**只改一处等于没改**；改 workflow 需同步 `tests/compat-matrix.test.mjs` 的行集合断言（该测试对 `run:` 行数与门控形态有约束）。
- **U-1.3 的基线 profile 怎么造**：`dsh <name> --from-default-profile headless` 从出厂模板复制，再 `--dump-config` 确认无 `gsd`/`gsd-hooks-bridge` 两行；测量点选「进程启动到 `--dump-config` 落盘完成」还是「到 web 端口可连」，须在 plan 里写死一个口径并两次同口径测。
- **`/tmp/dsh-uat-<ts>` 的清理与留痕策略**：成功即删、失败保留并打印路径；不得把凭据文件复制进任何进 git 的目录（`settings.yaml.imported` 含 apiKey）。
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 规划与需求
- `.planning/ROADMAP.md` — Phase 5 goal / 5 条 Success Criteria / Requirements 指派；**D-10 要求把五件移交物回写进本文件**
- `.planning/REQUIREMENTS.md` — UAT-01..06 原文（`### 端到端验收 (UAT)` 组）、INST-01..06（`### 安装与 UX (INST)` 组，其中 INST-02/06 已 `[x]`）、PUB-01/PUB-03 的「Phase 5 部分」
- `.planning/PROJECT.md` — 技术上下文、路径契约、Phase 3 操作教训（SSH 不可用 / `gh` 凭据路径 / 权威远端 sha 取法 / 「验证要验到实处」），以及 §Constraints 的 dogfooding 约定
- `.planning/STATE.md` — 已锁决策、并发纪律、`~/.dsh` 受管文件基线

### 前序 phase 裁决（必须继承，不得违反）
- `.planning/phases/03-github-npm-dshmarket/03-CONTEXT.md` — **D-02（对外动作推迟到 P5）是本 phase 次序的直接依据**；D-06（`dist-tags.latest` 硬移交）；D-05（peer exact 与 `engines.dsh` 分工）
- `.planning/phases/04-migration-coexistence/04-CONTEXT.md` — **D-02（真实迁移推 P5）、D-08/D-09（旧仓备料推 P5）是 D-10-3/4 的依据**；D-01（机器级整体切换）；D-05（阴性对照 + 内容比对，UAT 判据可沿用）
- `.planning/phases/04-migration-coexistence/04-VALIDATION.md` — **G-4 的 Escalated 记录与 CB-8 四条判据原文**（D-10-2）；G-1/G-2/G-3 的「可自动化却不在套件」判定
- `.planning/phases/02-compat-matrix/02-CONTEXT.md` — pin 对齐机制、`engines.dsh` 拒绝语义

### 迁移与并存（D-10-3/4 的执行手册）
- `docs/MIGRATION.md` — **863 行**，三节：① runbook（含步骤 0-A 演练场、步骤 1 `# MIG-GATE` 硬门、步骤 6 `COEXIST-DRILL`/`COEXIST-REAL` 两形态）② 三轴差异表 ③ 版本错配症状表。真实迁移必须照它执行
- `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` — 演练实测值账本（20 字符 home 下 3084/3195 的来源），真实迁移重跑 CB-8 时的对照基线
- `docs/oldrepo-link/{README.md,pr.md,snippet.en.md,snippet.zh.md}` — D-10-4 的现成素材（`snippet.zh.md` 是备而不用件）

### 发布面与构建
- `package.json` — `private: true`（发布前移除）、`version: 1.20.1-1.dsh022`、`files` 9 项白名单、`test`/`prepack` 缺 `--test-concurrency=1`、`publishConfig.registry` 已钉 npmjs.org
- `CHANGELOG.md` — 首条目 `[1.20.1-1.dsh022] - 2026-11-12` 已成文；发布约定（tag 无 v 前缀、正文取本文件）写在文件头
- `build.mjs` + `BUILD.md` — 构建四档 / gates A/B/C / exit 0-1-2；`BUILD.md:16` 是仓内唯一活体计数（现 38/38）
- `build/assets/pins.json` + `build/lib/check-pins.mjs` — pin 真源与校验入口（步骤 (j) 强等值）
- `.github/workflows/compat-matrix.yml` — 4 格矩阵，`run:` 行数与门控形态被 `tests/compat-matrix.test.mjs` 断言；D-10-1 需在此改 full-test 步骤
- `gsd-core/bin/lib/ui-frontend-evidence.cjs:104` — D-10-5 的对象（**构建产物**，直接改会被 `build.mjs` 冲掉）

### 外部与现状（运行期取真值，勿采信旧快照）
- `registry.npmjs.org/dsh-gsd` — **2026-11-15 实测 HTTP 404**（名字仍空）。**publish 前必须重查一次 404 才继续**（03-CONTEXT 的抢注窗口义务）
- `https://github.com/pfmiles/dsh-gsd` — Actions `total_count` 与远端 main 的权威值用 `gh api repos/pfmiles/dsh-gsd/...` 取
- `https://github.com/pfmiles/install-gsd-dsh` — 旧仓（`41fcc7a` 为 04 期间基准）；D-10-4 的目标，**仓外路径**，fresh clone 里不存在

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **04 的演练场模式**：`DSH_HOME=/tmp/dsh-mig-<ts>` + 旧脚本装一遍 → `--uninstall` → `plugin add` → 复验。本 phase 的 UAT 干净环境可照此办，但**不要**先装旧脚本（UAT 要的是零残留）。
- **04-D-05 的判据形态**：阴性对照（旧源为空）＋ 内容比对（正文与包内文件一致）。**UAT-01/SKIL-01 直接沿用**，因为「72 个技能可见」可以由旧源满足。
- **`dsh --profile <p> --json`**：机器可读的 run events，是 D-02 自动化的执行件；`-` 可从 stdin 读任务（适合长提示词）。
- **`--from-default-profile <name>`**：从出厂模板复制出干净 profile，是 D-03 基线 profile 的造法。
- **`tests/docs-consistency.test.mjs` 的 14 条断言**：钉住 `private === true`、版本窗口、徽章唯一性、双语同构等。**移除 `private: true` 会让其中一条红** —— 必须同步改测试（这是本 phase 已知会触碰的测试面）。

### Established Patterns
- **「产物能否被宿主消费」必须走到真实消费路径**（PROJECT.md 的 Phase 3 教训）：数磁盘文件 ≠ 观测 provider 实际加载。本 phase 的 SKIL-01 判据必须包含 provider 自报的绝对路径＋正文哈希。
- **构建产物不可手改**：`skills/`、`gsd-core/`、`hooks/`、`config/`、`scripts/` 由 `build.mjs` 重建并被 gitignore（D-10-5 的形态约束来自此）。
- **机器特定绝对路径零容忍**：包内文件不得含 `/Users/...`；文档里引用用户机路径可以，包内路径用 `<GSDROOT>` 占位。
- **测试并发纪律**：`build-smoke.test.mjs` 重写构建树，禁止并发（D-10-1 就是要把它从「纪律」变成「默认」）。
- **提交纪律**：`git add` 具体文件，不用 `-A`；`.planning/` 进 git，构建产物不进。

### Integration Points
- **新 `DSH_HOME`**（`/tmp/dsh-uat-<ts>`）← UAT-01..05 的唯一判据环境；需种入 LLM 凭据才能起会话。
- **`.planning/phases/05-uat-1-0/05-UAT.md` + `05-UAT-EVIDENCE.md`** ← 报告与原始证据的落点（不进 npm 包）。
- **`package.json`** ← 移除 `private`、补 `--test-concurrency=1`（两处 script）。
- **`.github/workflows/compat-matrix.yml`** ← 补 `--test-concurrency=1`（第三处），需同步 `tests/compat-matrix.test.mjs`。
- **`build.mjs`** ← 若 D-10-5 选择「本仓打补丁」路线，改写步骤落在这里（不是改 `gsd-core/` 里的文件）。
- **真实 `~/.dsh`** ← 收口段的对象；`web`(bridge 1 行 + codegraph/deja/dshmarket) 与 `headless`(bridge 1 行) 都会被 `--uninstall` 波及。
</code_context>

<specifics>
## Specific Ideas

### 本次侦察实测的事实（planner 不必重查，但须在 plan 里复核一遍再依赖）

**发布面**
- `git diff 9e99cd6..HEAD` 对 `files` 白名单（含 `package.json`）**零 diff**；全量 diff 只有 `docs/MIGRATION.md`(+864)、`docs/oldrepo-link/*`、`tests/*.test.mjs`、`.planning/*` —— 无一进包。⇒ 可发布字节 = CI run `43238375397` 验证过的字节。
- `curl registry.npmjs.org/dsh-gsd` → **HTTP 404**（2026-11-15 实测）；`@opengsd/gsd-core` → 200（对照）。
- `npm whoami` → **ENEEDAUTH**；本机默认 registry = `registry.npmmirror.com`（只读镜像，故 `publishConfig.registry` 钉 npmjs.org 是必需的）。
- `gh auth status`：已登录 `pfmiles`，scopes = `delete_repo, gist, read:org, repo, workflow`；`Git operations protocol: ssh`（即默认路径仍走坏掉的 SSH）。
- **无 docker** ⇒ 干净机器只能用新 `DSH_HOME` 模拟。

**DSH 运行时**
- `dsh 0.2.2-rc.1` 在 PATH（`~/.nvm/versions/node/v24.21.0/bin/dsh`）。
- `dsh --profile headless --help` → `[task...]`、`--json`、`--session-id`、`--permission-mode`、`--approval-policy {ask,never}`、`--add-dir`；`-` 读 stdin。
- 出厂 headless 模板存在：`~/.dsh/profiles/node_modules/@deepseek-ai/dsh-headless`。
- LLM 凭据在 `~/.dsh/settings.yaml.imported`（`llm-pi-ai.providers.alipay`，含 apiKey + baseURL + 模型表）；新 home 不种入它则起不了会话。

**本机现状（UAT 的对照面，也是收口段的作业面）**
- `~/.dsh` 顶层 mtime 仍是 **Nov 12 01:38**；`profiles/` 有 4 个：`gsdtest`、`gsd-p3-release`、`web`、`headless`。
- `~/.dsh/skills` = **72 个 `gsd-*`**（旧脚本来源）+ 12 个 `teamclaw-*`。
- bridge 行：`web` 1 行、`headless` 1 行；`gsdtest`/`gsd-p3-release` **0 行**（它们用插件的 `cordis.patch.yml`）。
- `~/.dsh/{gsd-core(1.16.0), gsd-hooks.dsh.json, gsd-hooks.dsh.json.gsd-dsh-managed, hooks, scripts}` 均存在。
- `web` 的 bundles = `[@deepseek-ai/dsh-base, @deepseek-ai/dsh-web-app, @jiangzhenguo/dsh-codegraph, dsh-deja, dshmarket]` —— D-10-2 的作业面。
- PATH 上的 `gsd_run` → `@opengsd/gsd-core@**1.16.0**`（插件包内是 1.20.1；04-D-04 已裁决 runbook 默认卸掉全局 CLI）。

**⚠ dogfooding 现状（最需要先修的地基）**
- `~/.dsh/profiles/gsdtest/node_modules/dsh-gsd/index.js:20` = `resolve(dirname(fileURLToPath(import.meta.url)), '..')` ⇒ `skillsDir = <profile>/node_modules/skills`，而该目录**不存在** ⇒ 插件提供 **0 个技能**。`gsd-p3-release` 同形态。
- 正文差异实证：`gsd-health` 旧 **3084 B** vs 包内 **3587 B**；`gsd-new-project` 旧 3195 B vs 包内 3856 B。
- ⇒ 本会话里可见的 72 个 `gsd-*` **全部来自 `~/.dsh/skills`（旧脚本）**，不是插件。**在该环境上跑 SKIL-01/UAT-01 必然假绿。**
- ⇒ D-11 的「3091 刷新」不是可选卫生，而是让 dogfooding 名副其实的前提。

**本会话的物理约束**
- `DSH_PROFILE=gsdtest`、`DSH_HOME=/Users/yue.weny/.dsh`、`DSH_PROFILE_DIR=~/.dsh/profiles/gsdtest`、`DSH_WEB_URL=http://127.0.0.1:3091`；3091 的监听进程 `pid 95618`（启动于 Nov 12 01:38）。
- ⇒ 刷新 3091 = 杀掉本会话；真实迁移 = 删掉本会话可用的 72 个技能。**两者都必须在所有产物提交之后、且有 `.continue-here.md` 可重接的前提下执行。**

**测试面现况**
- `npm test` = `node --test tests/*.test.mjs`（6 文件，38 个顶层用例）；`BUILD.md:16` 记 38/38。
- 六个文件：`build-smoke`、`compat-matrix`、`docs-consistency`、`pack-contents`、`rewrite-map`、`version`。
- `tests/docs-consistency.test.mjs:102-105` 的 **⑥** 把 `private === true` 与 `version === '1.20.1-1.dsh022'` 一起钉住，断言的失败消息原文就是「npm publish 前置：private: true 移除属 Phase 5 任务」—— 即这条测试是**为 flip 而写**的。移除 `private` 时必须把它改成断言 `private` 不存在（或 `false`），否则 publish 前全量测试必红。
- 各文件用例数（合计 38）：`build-smoke 2` / `compat-matrix 8` / `docs-consistency 14` / `pack-contents 4` / `rewrite-map 7` / `version 3`。

### 现状锚点（供 plan 引用）
- 本仓文档：`README.md`（双语）、`BUILD.md`（中文）、`CHANGELOG.md`、`THIRD-PARTY-NOTICES.md`、`PLAN.md`、`SPIKE.md`、`docs/MIGRATION.md`、`docs/dshmarket/`（2 文件）、`docs/oldrepo-link/`（4 文件）。
- ROADMAP 现列 **2 个计划位**（`05-01` 干净机器 UAT、`05-02` 1.0 发布收尾）；按 D-10 的「全纳入」，planner 应扩到 **3-4 个** 并把收口段单独成 wave（D-11 的顺序要求它必须是最后一波）。
- Milestone 3 = Phase 4+5（ROADMAP §Milestones）；本 phase 完成即触发 milestone 归档讨论。
</specifics>

<deferred>
## Deferred Ideas

- **`04-VALIDATION.md` 的 G-1 / G-2 / G-3**（「可自动化却不在套件」三条：MIG-02 §② 内容守卫、oldrepo-prep 三断言、pin 篡改 → exit 2）→ **不进本 phase**（不在 D-10 的五件里）。若日后要收，形态是并入 `docs-consistency` 的 ⑮ 或新增 `tests/oldrepo-prep.test.mjs`（后者依赖仓外路径 `../install-gsd-dsh`，须条件 `skip`）。
- **`03-REVIEW-DISPOSITION.md` 的 IN-02 行已陈旧**（引用 Phase 3 时刻的 ahead 数与覆盖结论）→ 文档卫生，不属本 phase 判据。
- **`dsh-gsd-core` 精简档**（`GSD_PROFILE=core|standard|full` 的插件等价物）→ Backlog，未排期。
- **`ui-frontend-evidence.cjs` 的修复若判定「属上游」** → 转上游 issue/PR，本仓只留登记（D-10-5 的备选结论之一，须在 plan 中写明选了哪条）。
- **`03-03-SUMMARY` 里记录的 `total_count==1` 等「当时」数字** → 不改写（属 covered file，改写会让 verification 变 stale）；需要现值时用 `gh api` 现取。
</deferred>

---

*Phase: 05-uat-1-0*
*Context gathered: 2026-11-15 via interactive discuss (4 areas, 11 decisions)*