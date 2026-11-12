# Phase 3: 发布（GitHub + npm + dshmarket）- Context

**Gathered:** 2026-11-12
**Status:** Ready for planning
**Source:** 会话内直接裁决（四问四答）；无交互式 discuss 问答、无 RESEARCH.md

<domain>
## Phase Boundary

本 phase 交付「**发布就绪**」，不是「已发布」：把 packaging 面从"能构建"推到"能按 npm 规范发出去"，并让 CI 首次激活就跑绿；真正的对外动作（`npm publish` / GitHub Release / dshmarket PR）按 D-02 移到 Phase 5。

- **Phase Goal（ROADMAP 原文）**：repo/npm/registry 三处同名 dsh-gsd 上线，市场可搜可装。
- **⚠️ D-02 对该 Goal 的修订**：本 phase 完成判据 = 「发布面无阻塞 + CI 首绿 + 提交材料就绪」；"上线"由 Phase 5 在干净机器 UAT 通过后执行。
- **Depends on**：Phase 2（`build/assets/pins.json`、`check-pins`、`compat-matrix.yml` 已就位）
- **Requirements in scope**：PUB-01..04、INST-06（其中 PUB-01、PUB-04 按 D-01/D-02 修订，见「Requirements 修订建议」）
- **Success Criteria（修订后，必须全真；与 ROADMAP Phase 3 逐条一致）**：
  1. `npm pack` 产出的 tarball 在干净 profile 装成并 boot（`dsh plugin add ./<tarball>`）；registry 通道（`dsh plugin add dsh-gsd@<ver>`）留 Phase 5
  2. npm pack 清单 = `files` 白名单，且含 `scripts/`、`locale/`、`icon.svg`
  3. dshmarket 提交材料就绪（双语文案、`category=workflow`、install 命令与 README 逐字一致）+ 提交流程已查实；PR 本体留 Phase 5
  4. README 徽章 / 许可（MIT）/ 上游致谢齐备
  5. CI 首次激活 run 全绿（4 格 × 六步 gated steps，无红跑历史）
  6. `CHANGELOG.md` 首个条目成文（对应 `1.20.1-1.dsh022`）

**不在本 phase**：`npm publish` / GitHub Release / dshmarket PR 本体（→ P5）、迁移 runbook 与差异表（→ P4）、干净机器 UAT（→ P5）。
</domain>

<decisions>
## Implementation Decisions

以下八条为**用户裁决**（2026-11-12），planner 必须逐条映射进 plan，不得重新论证：

- **D-01 — License = MIT（PUB-04 改写）**：全仓**已**以 MIT 落地，本裁决确认现状、不改任何文件。
  - `LICENSE` 首行 `MIT License`（`Copyright (c) 2026 pf_miles`）、`package.json:15` `"license": "MIT"`。
  - **PUB-04 与 `PLAN.md:46` 的 Apache-2.0 是过期表述，以本裁决为准。** PUB-04 改写为「LICENSE（MIT）+ 上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）」。
  - **不做**：不改 `LICENSE` 文件、不改 `package.json` 的 `license` 字段。`THIRD-PARTY-NOTICES.md` 记录的是各上游自己的许可，不受本裁决影响，不动。
  - 已知缺陷（顺带修正）：PUB-04 原文 `GSD MИT` 中的 `И` 是 U+0418 西里尔大写字母，非 ASCII `I` —— 任何 `grep MIT` 式一致性检查都会漏掉它。改写条目时一并修真。

- **D-02 — 对外发布推迟到 Phase 5**：本 phase 只交付「发布就绪」，所有对外写入动作移交 Phase 5。
  - 本 phase **不执行** `npm publish`、**不**建 GitHub Release、**不**提 dshmarket PR。
  - Phase 3 产出「发布就绪」：发布面无阻塞 + 本地 tarball 可装 + CI 首绿。
  - Phase 5 在干净机器 8 项 UAT（UAT-01..06）通过后执行：`npm publish` → GitHub Release → dshmarket PR → 1.0 收官。
  - **推论**：PUB-01 的"npm 发布"、PUB-03 的"PR 已开"从 Phase 3 判据降级为 Phase 5 动作；本 phase 保留二者的**准备**部分。registry 安装验证（原 Success Criterion 1）在 Phase 3 用 tarball 等价替代，Phase 5 用真 registry 复验。

- **D-03 — 先修 L37 再 push**：push 之前必须先消除上游漂移，且判据是「四格绿 + 不留红跑历史」。
  - 顺序锁定：修 `compat-matrix.yml` L37 上游漂移 → 本地 4 格验证绿 → `git push`（规划期领先 origin **88** 提交，执行期以实测为准）→ CI 首跑即绿。
  - **落点已由 D-05 修订**（2026-11-12 研究后裁决）：判据不变，但实现位置从 workflow 移到 manifest —— peer 收紧为 exact `0.2.2-rc.1` 后 L37 一字不改即四格全绿。见 **D-05**。
  - **约束继承（Phase 02 用户裁决，不得违反）**：
    - `--force` 可用（两向探针实测绿）；
    - **`--legacy-peer-deps` 禁用**（跳过 host peer → 缺 `dsh-app-boot` → probe exit 1 `cannot resolve the DSH host boot module`）；
    - 上界陷阱：`<0.2.2-rc.2-0` **排除不了** rc.2（rc.2 < rc.2-0）；
    - 候选方案 = exact peer 或 `<0.2.2-rc.2`。
  - 判据：push 后 Actions 首次 run 全绿，**不留红跑历史**。

- **D-04 — CHANGELOG + GitHub Release 纳入**：两者都不排除，plan 中必须有落点（不能沉默跳过）。
  - **CHANGELOG**：本 phase 成文 —— `CHANGELOG.md`（Keep a Changelog 形态），首条目对应 `1.20.1-1.dsh022`。
  - **GitHub Release**：随发布动作在 Phase 5 执行（需要 tag + 已发布版本）；本 phase 只准备 tag 策略与 release notes 草稿。

- **D-05 — D-03 落点修订：改 manifest（两处，不是一处），L37 零改动**：判据不变，实现位置改为 `peerDependencies` 收紧为 exact `0.2.2-rc.1`。
  - **⚠ 纠偏（pattern-mapper 读源码实测，优先级高于本裁决的原始措辞）**：这**不是**"改一个 `package.json` 字符串"，而是**两处必须同时改**，只改一处会立刻红：
    - `package.json:30` — `peerDependencies["@deepseek-ai/dsh-skill-filesystem"]`：`">=0.2.2-rc.1 <0.3.0-0"` → `"0.2.2-rc.1"`
    - `build/assets/pins.json:12` — `lines.022.peer`：`"@deepseek-ai/dsh-skill-filesystem >=0.2.2-rc.1 <0.3.0-0"` → `"@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`
    - **执行依据**：`build/lib/check-pins.mjs` 步骤 (j) 断言 `` `${peerName} ${peerRange}` === line.peer ``，不等即 **exit 2**；`tests/compat-matrix.test.mjs` ⑥ 又 spawn `check-pins --offline` 要求 exit 0。只改一个文件 = 快速回路立刻红。
  - **被收紧的 peer 是 `@deepseek-ai/dsh-skill-filesystem`，不是 `dsh`**（`peerDependencies` 里并没有 `dsh` 键）。本条早前草稿写的"`peerDependencies.dsh`"是笔误，以本段为准。
  - **不得连带改动的邻近值**：`engines.dsh`、`pins.json` 的 `lines.022.dshRange`、README 的版本窗口字符串是**另一组**字符串，由 `tests/docs-consistency.test.mjs` 的 ② 钉住，动了就红。
  - **实测依据**（见 `03-RESEARCH.md`）：该变体 656 包全树 dedupe 到 `0.2.2-rc.1`，四格 install/probe 全 exit 0，`.github/workflows/compat-matrix.yml` 的 L37 **零改动**。
  - **拒绝的变体**：
    - `--force`：probe 虽绿，但根上解出 `skill-filesystem@0.2.2-rc.2`（706 包、三份并存）= **绿在错误树上**。仅作最后手段，且必须配正向断言。
    - C 变体（L37 追加显式 pin）：同样实测全绿，但只护 CI、不护用户侧。备案为 fallback，不采用。
  - **登记维护义务（不得省略）**：`<0.2.2-rc.2` 在 semver 上**同时排除 0.2.2 正式版**（实测 `satisfies('0.2.2', '>=0.2.2-rc.1 <0.2.2-rc.2') === false`）。采用 exact peer 后，rc.2 转正或 0.2.2 正式发布时**必须**同步抬 peer —— 写入 `CHANGELOG` 与 Phase 5 移交清单。
  - **`engines.dsh` 与 peer 的分工（planner 必须写明，防执行者"顺手对齐"）**：`engines.dsh` 保持 `>=0.2.2-rc.1 <0.3.0-0` **不随之收紧**，它面向用户的友好报错与 `--allow-version`；`peerDependencies["@deepseek-ai/dsh-skill-filesystem"]` 是 npm 解析层。两者职责不同，取值不同是**有意为之**，不是不一致。

- **D-06 — SC-3 口径：README 补无版本示例**：catalog 卡片的 install 命令是运行时生成、不带版本号的，与 README 的 pinned 命令字面不同（见 `03-RESEARCH.md`）。
  - **用户裁决（2026-11-12）**：README 增一处**无版本示例**；catalog 生成的是 `dsh plugin --profile web add dsh-gsd`，README 规范命令是 pinned 的 `dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022`。
  - **落地方式**：新增的**无版本示例**须明确标注"catalog 卡片生成的形式"，既有 pinned 命令**一字不动**；提交材料逐字引用这个无版本串，从而满足 SC-3 的"逐字一致"。**不得**为对齐而删改既有 pinned 命令。
  - **硬移交项（Phase 5，不得省略）**：`npm publish` 时必须让 `dist-tags.latest` 指向首发版本，否则卡片生成的无版本命令会 404。

- **D-07 — dshmarket 条目 icon 留空**：本 phase **不**给 catalog 条目配 `icon` 字段，也不新增位图资源。
  - **原因**：catalog 的 `icon` 只接受 GitHub 托管的**位图**，SVG 明确被拒；本仓只有 `icon.svg`。留空时 catalog 回退默认图/作者头像。
  - **两个消费方不同，不要混同**：`package.json` 的 `icon` 字段与 `exports["./icon"]` 服务的是 DSH 插件管理器（INST-06），与 catalog 无关。
  - **不做**：不新增 PNG 资源；**尤其不要**把 PNG 加进 `package.json` 的 `files`（会触发 pack 测试的 `ALLOWED_TOP_LEVEL` 白名单红）。

- **D-08 — workflow 两项加固纳入**：`compat-matrix.yml` 在**同一次改动**里做完 permissions 与门控正向断言两项。
  - **用户裁决（2026-11-12）**：
    - 补 `permissions: { contents: read }` —— 当前整个文件**没有** `permissions:` 块，`GITHUB_TOKEN` 取仓库默认权限，属最小权限化缺口。
    - 在既有 install+probe 的 `run: |` 块内补「解析结果 == `${{ matrix.dsh }}`」的**正向断言** —— 已点名于 Phase 2 的 `02-REVIEW.md`，且能封堵 `--force` 式假绿。
  - **约束**：见下方"落地形态"。注：D-05 已使 L37 本身零改动，因此本条 diff 是**纯增量**（新增 permissions 块 + 在既有 run 块内追加断言行），不是修复。
  - **⚠ 落地形态（pattern-mapper 读测试源码实测，必须遵守，否则首跑即红）**：
    - 断言**必须写在既有的 `run: |` 块内部**，**绝不能新开一个 `run:` 步骤**。原因：`tests/compat-matrix.test.mjs:106-123` 的 `isGate()` 要求每个 `run:` 的**上一行**是 `if:`，且该行须同时含 `inputs.dsh` / `matrix.dsh` / `inputs.gsd` / `matrix.gsd` 四串；另有 `runIndexes.length >= 3`。
    - 断言**必须用 `expect == install-ok` 作为门**，且门的写法必须是 canonical 形态 `if [ "${{ matrix.expect }}" = "install-ok" ]; then`（`!=` / `&&` / `||` / 多余操作数一律不行）。reject 格里根 peer 被声明为 exact `0.2.2-rc.1`，根层解析结果极可能 ≠ `matrix.dsh`（0.2.1-rc.5）；无条件断言会让**首次 CI run 就红**，直接违反 SC-5「无红跑历史」。
    - 加 `permissions:` 块**是安全的**：它把 L37 推到 L39，但没有任何测试硬编码 workflow 行号。
    - **本项不需要改任何测试**（与 D-08 早前草稿的说法相反，以此为准）。只需避开两个相邻陷阱：② 的 `CELL_RE` 与 `pins.matrix` 双向集合相等断言（`tests/compat-matrix.test.mjs:21-25`、`:41-53`）—— 即**不要动 matrix 的四行**；⑤ 的 `assert.ok(!readWF().includes('dsh plugin add'))`（`:90-92`）—— **任何注释或 echo 都不得出现 `dsh plugin add` 这个字面串**。

### Claude's Discretion

planner 定夺、在 plan 中显式落成设计决策（不静默假设）。**下列前三项已由研究结案，不再是自由裁量**，保留是为了记录"曾经在哪里悬空"：

- ~~**dshmarket 提交流程细节**~~ → **已结案**，见 `03-RESEARCH.md`。目标仓 `awesome-dsh-plugin/awesome-dsh-plugin`；收录单位 = 单文件 `data/plugins/pfmiles__dsh-gsd.yml`；字段 `url`/`name`/`category`/`description.{en,zh}`，仅 `description.en` 必填；`category` 是闭合 23 值词表，`workflow` 合法；排序由 catalog 生成，提交物无排序字段；CI 四检（≤3 条/PR、`dsh.bundle` 存在、仓龄 ≥1 天、awesome-lint + site build）；**不要求 npm 已发布**。web 上的 `dshbase.com` / `awesome-dsh-plugin-2` 等均为矛盾源，已弃用。
- ~~**INST-06 元数据合规的 schema 判定**~~ → **已结案**：**现状已合规，不要加字段**。契约取自 `dsh-plugin-manager@0.2.2-rc.1`（注意：不是 `0.1.6-alpha.2`，CONTEXT 此前的版本号已过期）的 `meta.title` / `meta.description`（string 或 `{en:…}`）+ `icon`。`locale/{en,zh}.json` 的双语 `meta.title`/`meta.description` 与 `package.json` 的 `icon` + `exports["./icon"]` 均已就位且在 pack 清单内。
- ~~**L37 豁免的具体形态**~~ → **已结案为 D-05**（exact peer）。补充事实：`engines.dsh` **不**随之收紧；`--legacy-peer-deps` 永久禁用。

仍属自由裁量（planner 必须在 plan 中显式落成）：

- **package.json 元数据补全范围**：`repository`/`homepage`/`bugs`/`keywords`/`author` 哪些要补、取值如何；`publishConfig` 的 `registry`（本机默认指向 `registry.npmmirror.com`，必须钉 `https://registry.npmjs.org`）与 `tag`（prerelease 必须显式 tag，否则 `npm publish` 报错）。**`private: true` 在 Phase 3 保留不动**（D-02：本 phase 不发布）；同时注意 `npm publish --dry-run` 在 `private: true` 下**照样通过**，它不是可发布性的判据。
- **pack 清单防线的纳管方式**：`tests/pending-phase-3/pack-contents.test.mjs` 必须**移到 `tests/pack-contents.test.mjs`** —— 现址的 `ROOT` 解析到 `tests/`，实测 `ENOENT tests/package.json`，这个测试**现在跑不起来**（研究前记录的"3/3 绿"只在 ROOT 被覆盖时成立）。计数同步范围已收窄：仓内**唯一活体计数**是 `BUILD.md:16` 的 26/26 → 29/29；`tests/docs-consistency.test.mjs` **没有**计数断言（此前判断有误）；`02-VALIDATION.md` 的 26/26 是历史审计记录，按仓内惯例**只追加带日期的前向注记，不改写历史**。
- **CHANGELOG 是否进 npm 包**：默认**不进**（加进 `files` 会触发 pack 测试的 `ALLOWED_TOP_LEVEL` 红）。plan 需明确这一点，避免"补全发布面"时顺手把 `CHANGELOG.md` 塞进 `files`。
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 规划与需求
- `.planning/ROADMAP.md` — Phase 3 goal / success criteria / requirements 指派（含 D-02 修订须在此落地）
- `.planning/REQUIREMENTS.md` — PUB-01..04、INST-06 原文（PUB-04 的 U+0418 已修）
- `.planning/PROJECT.md` — 技术上下文、已决事项（命名、引擎嵌入、category=workflow）、约束
- `.planning/STATE.md` — 已锁决策、上游漂移裁决、并发纪律、88 提交未推
- `.planning/phases/03-github-npm-dshmarket/03-RESEARCH.md` — **本研究阶段的唯一事实源**：dshmarket 全链、L37 根因与四变体实测、pack 面实测数字、GitHub/CI 现状
- `.planning/phases/03-github-npm-dshmarket/03-VALIDATION.md` — 本 phase 的验证契约（由 RESEARCH 的 Validation Architecture 派生）

### 发布面现状
- `package.json` — `private: true`（D-02 下**保留**）、`license: MIT`、`version: 1.20.1-1.dsh022`、`files` 白名单、`prepack = build && test`、`engines.dsh`（**不收紧**）、`peerDependencies.dsh`（D-05 的改造对象：收紧为 exact `0.2.2-rc.1`）
- `LICENSE` — MIT 全文（D-01 的落地物，不改）
- `locale/en.json`、`locale/zh.json`、`icon.svg` — INST-06 现状，**已合规**，不加字段
- `THIRD-PARTY-NOTICES.md` — 上游致谢（GSD MIT / DSH MIT / 第三方各自许可）；README 的致谢段落应先查它是否已有等价内容，避免造第二处真源
- `README.md` — 安装/升级/回滚命令原文（SC-3 的"install 命令真实"比对基准；D-06 要在此补一处**无版本**示例）
- `CHANGELOG.md` — **不存在**，本 phase 新建；默认**不进** `files`

### 构建与 CI
- `build.mjs` + `BUILD.md` — 构建四档 / gates / exit 0-1-2 / 计数现状（`BUILD.md:16` 是仓内唯一活体计数 26/26）
- `.github/workflows/compat-matrix.yml` — 4 格 × 六步结构。**L37 本身已由 D-05 免除改动**；本 phase 对它只有两类**纯增量**改动（D-08）：`permissions` 块 + install/probe 的解析正向断言
- `tests/compat-matrix.test.mjs` — 对上述 workflow 的行集合/顺序有断言（"⑦ gate-line constraint"）；改 workflow 必须同步改它
- `build/assets/pins.json` + `build/lib/check-pins.mjs` — 行↔pin 真源与校验入口
- `tests/pending-phase-3/pack-contents.test.mjs` + 同目录 `README.md` — 待纳管的发布面防线；**必须移到 `tests/pack-contents.test.mjs`**，否则 `ROOT` 解析错层、测试根本跑不起来

### 背景
- `SPIKE.md` — 宿主机制证据（bundle 声明、零安装脚本约束、pnpm 生命周期拦截）
- `PLAN.md` — P3 发布清单原文（注意其 Apache-2.0 表述已被 D-01 推翻）
</canonical_refs>

<specifics>
## Specific Ideas

### 已查实的事实（planner 不必重查，但可复核）

- **npm 名 `dsh-gsd` 未被占用**：`npm view dsh-gsd version` → `E404`，`registry.npmjs.org` 与 `npmmirror` **双 404**（2026-11-12 实测）。
- **抢注窗口是真实风险**：真发布在 Phase 5（D-02），中间窗口内若他人注册同名包，Phase 5 会失败且 `name` 不可改（三处同名是 PROJECT 已锁决策）。**移交义务**：Phase 5 发布前必须先重跑 `npm view dsh-gsd version --registry=https://registry.npmjs.org`，404 才继续；若已被占用，升级为用户决策（改名 vs 等待），不得擅自继续。
- **`dshmarket` 是 npm 包**：`dshmarket@1.73.18`，描述 "Visual plugin market inside DeepSeek Harness — browse, search, and one-click install community plugins." 即它**本身是一个 DSH 插件（市场 UI）**，不是独立的 registry 服务。PUB-03 的 "curated registry" 指这个插件的收录清单。
- **DSH 侧元数据消费方就在本机**：`@deepseek-ai/dsh-client-ui-plugin-manager`、`@deepseek-ai/dsh-client-ui-plugin-market`、`@deepseek-ai/dsh-client-ui-plugin-recommendations`、`@deepseek-ai/dsh-plugin-manager@0.2.2-rc.1`（**版本号已更正**，此前记为 `0.1.6-alpha.2` 是错的）。
- **GitHub 仓已存在且公开**：`origin = git@github.com:pfmiles/dsh-gsd.git`。仓建于 2026-11-10，`origin/main` 已含 10 个提交但**没有** `.github/workflows` 目录。当前本地 ahead **88**、未 push；Actions `total_count = 0` —— 本 phase 的 push 会产生**史上第一次** run（D-03 的顺序正是为此）。
- **push 的凭据路径**：`origin` 是 SSH，故推入新 workflow 文件不受 gh token scope 限制；`gh` 当前登录 `pfmiles`（scope `gist, read:org, repo`，**无 `workflow`**）—— 只有改走 HTTPS 才需要 `gh auth refresh -s workflow`。
- **不可信来源警告**：检索 dshmarket 流程时 web 结果全是互相矛盾的 SEO 变体（`dshbase.com`、`Anil-matcha/awesome-dsh-plugin`、`fuyiyun666/awesome-dsh-plugin-2` 等），**无可信 spec** —— 以 tarball 实读为准，不采信这些来源。

### 现状锚点

- `package.json`：`private: true`（阻碍发布）、`version: 1.20.1-1.dsh022`、`files` 已含 `index.js cordis.patch.yml locale icon.svg skills gsd-core hooks config scripts`、`prepack: node build.mjs && node --test tests/*.test.mjs`。
- 测试锚点：`npm test` = `node --test tests/*.test.mjs` = 5 文件 / **26 tests**；纳管 `pending-phase-3` 后应为 **29**。
- ROADMAP 现版已收敛为 **2 条计划**（D-02 后重切）：`03-01 发布管线与 CI 首绿`、`03-02 元数据与提交材料`。早期"建仓 / prepack 校验 / 发布 + registry PR"三条式已废弃 —— 仓早已存在，PUB-01 的建仓部分已完成，只剩推送。
- `npm pack` 实测面（研究期，命令可复跑）：**958 文件 / 12 顶层项 / 4.58 MB**（解包 15.96 MB）；`.planning`、`tests`、`build.mjs`、`BUILD.md` 均**零泄漏**。防线断言应写"泄漏集合为空 + 必含集合齐全"，**不要硬编码 958**（研究项 A4）。
- 两个已实测的 npm 12 陷阱：`npm pack --dry-run --json` 返回的是**以包名为键的对象**而非数组；`npm publish --dry-run` 在 `private: true` 下**照样通过**，不能当作可发布性判据。
- 并发纪律（STATE 已锁）：`build-smoke.test.mjs` 重写构建树，**禁止与其他测试/build 并跑**，否则假红 `gate C: no SKILL.md under skills/gsd-*`。
</specifics>

<requirements_amendments>
## Requirements / ROADMAP 修订（已落盘 2026-11-12）

D-01 与 D-02 使三行需求与 ROADMAP 的 Goal/SC 与实物矛盾；经用户确认后已按下表改写：

| 位置 | 现文（改后） |
|---|---|
| PUB-01 | `GitHub 仓库（pfmiles/dsh-gsd）建仓并推送，repo 名 = npm 包名 dsh-gsd；npm 首次发布推迟到 Phase 5（UAT 通过后）执行` |
| PUB-03 | `dshmarket curated registry 提交材料与流程就绪（双语描述、category=workflow、install 命令真实）；PR 本体随 npm 首发于 Phase 5 提交` |
| PUB-04 | `LICENSE（MIT）与上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）`（原 `GSD MИT` 的 U+0418 已修正） |

ROADMAP 连带同步：Phase 3 Goal 改为「发布就绪」、Success Criteria 重排为 6 条（含 CI 首绿与 CHANGELOG）、计划名改为「发布管线与 CI 首绿」/「元数据与提交材料」；Phase 5 Requirements 追加 `PUB-01（npm 首发部分）`、`PUB-03（PR 本体部分）`，并在 Success Criteria 增第 5 条「对外动作执行」。

**PUB-01 与 PUB-03 为跨 phase 需求**：Phase 3 交付准备部分，Phase 5 交付对外动作部分。二者不是重复声明，是同一需求的计时切分。
</requirements_amendments>

<deferred>
## Deferred Ideas

- **`npm publish` / GitHub Release / dshmarket PR 本体** → Phase 5（D-02；随 UAT-01..06 之后）
- **registry 通道验证**（`dsh plugin add dsh-gsd@<ver>`）→ Phase 5（本 phase 用 tarball 等价替代）
- 迁移 runbook、两套方式差异表、旧脚本定位互链（MIG-01..04、HOOK-05）→ Phase 4
- 干净机器 8 项 UAT（UAT-01..06）→ Phase 5
- 配套 `dsh-gsd-core` 精简档（`PLAN.md` 开放问题 2）→ 初期不排期
- 上游更新时的重新打包责任/CI 驱动（`PLAN.md` 开放问题 3）→ 不排期，本 phase 只记录义务
</deferred>

---

*Phase: 03-github-npm-dshmarket*
*Context gathered: 2026-11-12 via direct user rulings (discuss Q&A skipped)*