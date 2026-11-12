# Phase 3: 发布（GitHub + npm + dshmarket） - Research

**Researched**: 2026-11-12
**Domain**: 发布面（npm packaging / GitHub Actions 首次激活 / 第三方 curated registry 提交）
**Confidence**: HIGH（发布面全部为可量化观测：pack 清单、tarball 安装、peer 解析矩阵、catalog 数据源均已实测）+ MEDIUM（CI「首跑即绿」只能由本地四格等价证据外推，无法先验证明）

**Provenance 约定（本文件统一遵守）：** 仓内离散值一律以 `path:行区间` + **逐字引文**并列呈现（引文本身即 tag 的实体，例：`package.json:15` `"license": "MIT"`）；凡「实测」结论另附 `[VERIFIED: 命令/来源 + 时间]`；外部一手物证标 `[VERIFIED: tarball/仓源码路径]`；文档型来源标 `[CITED: url]`；未经本会话验证的标 `[ASSUMED]` 并汇入 `## Assumptions Log`。

## Summary

本 phase 的全部**仓内**事实都已量化：`npm pack` 在 HEAD 产出 **958 个文件 / 12 个顶层条目 / 4.58 MB**（unpacked 15.96 MB），`.planning/`、`tests/`、`build.mjs`、`BUILD.md` 零泄漏，`scripts/`、`locale/`、`icon.svg` 齐全；同一 tarball 在「profile 同构」的干净 pnpm 环境（`autoInstallPeers: false` + `nodeLinker: hoisted`）里装成 `+ dsh-gsd 1.20.1-1.dsh022`，其内 `gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 输出 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`、`skills/` 72 项——Success Criterion 1 与 2 的机器判据已经成立，Phase 3 只需把它们固化成防线。

唯一真正的外部缺口 **dshmarket 提交流程已彻底查实**，来源是三方第一手物证而非网页推测：`dshmarket@1.73.18` 的 tarball 内 `README.md:136` 明写「This repo is the market app, not the catalog… open a PR **there**」；catalog 仓 `awesome-dsh-plugin/awesome-dsh-plugin`（24,360 stars，CC0-1.0）的 `contributing.md:9` 规定「一个插件一个文件」`data/plugins/<owner>__<repo>.yml`；线上 `https://awesome-dsh-plugin.com/plugins.json`（14,244,998 B，`count: 10581`，`updated: 2026-11-11`）的 23 个 `category` 键中 `workflow` 存在（en 标签 `Workflow & Automation`）——`category=workflow` 成立。排序规则是 `scripts/lib/entries.mjs:259-263` 的 `CAT_IDS.flatMap(... .sort((a,b) => a.url.localeCompare(b.url)))`：按固定分类序分组、组内按 `url` 字典序，**提交物里没有任何排序字段**。

D-03 的 L37 漂移有一个比 CONTEXT 预设更省的解：**把根 `peerDependencies` 收紧为 exact `0.2.2-rc.1` 后，L37 一字不改即四格全绿**（实测 `656 packages`、`dsh-skill-filesystem` 全树 dedupe 到 `0.2.2-rc.1`、probe exit 0；reject 格 `601 packages` + `reject confirmed`）。反之 `--force` 虽然也能让 probe 绿，但实测会在根装出 `dsh-skill-filesystem@0.2.2-rc.2`（`npm ls` 三份并存、706 packages），即「绿在错误的树上」——必须写进 plan 的禁令。

**Primary recommendation:** 按「先固化防线、再修 peer、最后 push」三段推进：① 把 `tests/pending-phase-3/pack-contents.test.mjs` 移回 `tests/` 并同步 `BUILD.md:16` 计数 26 → 29（**该文件现址 ROOT 解析到 `tests/` 而非仓根，移动同时修掉一个既存 ENOENT**）；② 根 peer 改 exact `0.2.2-rc.1`，L37 保持裸命令，四格本地复跑绿；③ CHANGELOG + catalog 提交材料 + README 徽章/许可落盘后再一次性 push，让首次 CI run 即绿。`private: true` **不动**（D-02：本 phase 不发布），把 `EPRIVATE` 与 prerelease `--tag` 两条已实测的前置条件记入 Phase 5 移交。

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### D-01 License = MIT（PUB-04 改写）

- 全仓**已**以 MIT 落地：`LICENSE` 首行 `MIT License`（`Copyright (c) 2026 pf_miles`）、`package.json:15` `"license": "MIT"`。
- **PUB-04 与 `PLAN.md:46` 的 Apache-2.0 是过期表述，以本裁决为准。** PUB-04 改写为「LICENSE（MIT）+ 上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）」。
- **不做**：不改 `LICENSE` 文件、不改 `package.json` 的 `license` 字段。`THIRD-PARTY-NOTICES.md` 记录的是各上游自己的许可，不受本裁决影响，不动。
- 已知缺陷（顺带修正）：PUB-04 原文 `GSD MИT` 中的 `И` 是 U+0418 西里尔大写字母，非 ASCII `I` —— 任何 `grep MIT` 式一致性检查都会漏掉它。改写条目时一并修真。

#### D-02 对外发布推迟到 Phase 5

- 本 phase **不执行** `npm publish`、**不**建 GitHub Release、**不**提 dshmarket PR。
- Phase 3 产出「发布就绪」：发布面无阻塞 + 本地 tarball 可装 + CI 首绿。
- Phase 5 在干净机器 8 项 UAT（UAT-01..06）通过后执行：`npm publish` → GitHub Release → dshmarket PR → 1.0 收官。
- **推论**：PUB-01 的"npm 发布"、PUB-03 的"PR 已开"从 Phase 3 判据降级为 Phase 5 动作；本 phase 保留二者的**准备**部分。registry 安装验证（原 Success Criterion 1）在 Phase 3 用 tarball 等价替代，Phase 5 用真 registry 复验。

#### D-03 先修 L37 再 push

- 顺序锁定：修 `compat-matrix.yml` L37 上游漂移 → 本地 4 格验证绿 → `git push`（当前领先 origin **84** 提交）→ CI 首跑即绿。
- **约束继承（Phase 02 用户裁决，不得违反）**：
  - `--force` 可用（两向探针实测绿）；
  - **`--legacy-peer-deps` 禁用**（跳过 host peer → 缺 `dsh-app-boot` → probe exit 1 `cannot resolve the DSH host boot module`）；
  - 上界陷阱：`<0.2.2-rc.2-0` **排除不了** rc.2（rc.2 < rc.2-0）；
  - 候选方案 = exact peer 或 `<0.2.2-rc.2`。
- 判据：push 后 Actions 首次 run 全绿，**不留红跑历史**。

> **⚠ 前向注记（2026-11-12，ROADMAP 表述已陈旧——勿据此改判，也勿据此改 ROADMAP）**
> `ROADMAP.md` 的 Phase 3 **SC-5 括注仍写着「L37 上游漂移修复后 push」**，而 **D-05 已把修复位置挪到 manifest**：`package.json` 的 `peerDependencies` 收紧为 exact `0.2.2-rc.1` + `build/assets/pins.json` 的 `lines.022.peer` 同步，**L37（现在的 L39）一字未改**。
> **判据本身未变**：四格全绿、无红跑历史——变的只是实现位置，「先修后推」的顺序与 SC-5 的验收含义都不受影响。
> 本次**不**改 ROADMAP 的 Success Criteria 文本：那是用户面契约，改措辞需用户授权。**记为后续 ROADMAP 改写的候选**（把括注改成「manifest 侧 peer 收紧 + workflow 加固后 push」即可，无判据变化）。

#### D-04 CHANGELOG + GitHub Release 纳入

- **CHANGELOG**：本 phase 成文 —— `CHANGELOG.md`（Keep a Changelog 形态），首条目对应 `1.20.1-1.dsh022`。
- **GitHub Release**：随发布动作在 Phase 5 执行（需要 tag + 已发布版本）；本 phase 只准备 tag 策略与 release notes 草稿。
- 两者都**不排除**，plan 中必须有落点（不能沉默跳过）。

### Claude's Discretion

planner 研究后定夺、在 plan 中显式落成设计决策（不静默假设）：

- **dshmarket 提交流程细节**（唯一确认的外部缺口）：PR 目标仓、必填字段、`category` 词表、审核周期、是否要求 npm 已发布或 GitHub stars。注意 `dshmarket` 本身是 npm 包（v1.73.18，"Visual plugin market inside DeepSeek Harness"），curated 清单与字段很可能直接在 tarball 内 —— 先解包读，再决定是否需要外部查证。
- **INST-06 元数据合规的 schema 判定**：本地可查 —— DSH 装内含 `dsh-client-ui-plugin-manager`、`dsh-client-ui-plugin-market`、`dsh-client-ui-plugin-recommendations`、`@deepseek-ai/dsh-plugin-manager@0.1.6-alpha.2`；判定 `locale/{en,zh}.json` 的键位与 `icon.svg` 是否满足展示要求（现 en/zh 只有 `meta.title` + `meta.description`）。
- **L37 豁免的具体形态**：exact peer vs `<0.2.2-rc.2`，以及是否同时收紧根 `peerDependencies`。
- **package.json 元数据补全范围**：`private: true` 移除时点、`repository`/`homepage`/`bugs`/`keywords`/`author` 是否需要以及字段取值。
- **pack 清单防线的纳管方式**：`tests/pending-phase-3/pack-contents.test.mjs`（3 个测试）移回 `tests/` glob 后，需同步 BUILD.md TL;DR、`02-VALIDATION.md` 与 `tests/docs-consistency.test.mjs` 的计数断言（26 → 29）。

### Deferred Ideas (OUT OF SCOPE)

- **`npm publish` / GitHub Release / dshmarket PR 本体** → Phase 5（D-02；随 UAT-01..06 之后）
- **registry 通道验证**（`dsh plugin add dsh-gsd@<ver>`）→ Phase 5（本 phase 用 tarball 等价替代）
- 迁移 runbook、两套方式差异表、旧脚本定位互链（MIG-01..04、HOOK-05）→ Phase 4
- 干净机器 8 项 UAT（UAT-01..06）→ Phase 5
- 配套 `dsh-gsd-core` 精简档（`PLAN.md` 开放问题 2）→ 初期不排期
- 上游更新时的重新打包责任/CI 驱动（`PLAN.md` 开放问题 3）→ 不排期，本 phase 只记录义务
</user_constraints>

> **研究注记（CONTEXT 中已漂移的数字，plan 请以本节为准；上方裁决原文保持逐字未改）**
> - D-03 里的「领先 origin **84** 提交」→ 实测 **88**（`git rev-list --count origin/main..HEAD`，HEAD `dba96bb`）。
> - Discretion 里的 `@deepseek-ai/dsh-plugin-manager@0.1.6-alpha.2` → 本机实装 **`0.2.2-rc.1`**（与 dsh 同版）。
> - Discretion 说「同步 `tests/docs-consistency.test.mjs` 的计数断言（26 → 29）」→ 该文件**不含计数断言**；唯一活体计数在 `BUILD.md:16`（见 Pitfall 10）。
> - Discretion 说 dshmarket 细节「先解包读，再决定是否需要外部查证」→ **已按此路径查实**，并额外落到目标仓源码（见 Pattern 3），无需外部网页来源。

<phase_requirements>
## Phase Requirements

| ID | Description（REQUIREMENTS.md 原文） | Research Support |
|----|-------------|------------------|
| PUB-01 | `GitHub 仓库（\`pfmiles/dsh-gsd\`）建仓并推送，repo 名 = npm 包名 \`dsh-gsd\`；npm 首次发布推迟到 Phase 5（UAT 通过后）执行` | **仓已存在于远端**且已有 10 提交（`created 2026-11-10T09:50:51Z`、`pushed 2026-11-10T10:17:29Z`、public、MIT、topics 已含 `dsh-plugin`），本地领先 **88** 提交且 `origin/main` **不含任何 `.github/workflows/`** → push 才是「建仓并推送」的真正落地动作。见 Common Pitfalls 1（push 与 workflow 文件的 OAuth scope）与 Validation Architecture SC-5 |
| PUB-02 | `prepack`=build 全量重建，包内 files 白名单精确（含 scripts/ 修复） | 实测 `npm pack --dry-run --json --ignore-scripts` = **958 文件 / 12 顶层**，`.planning/`·`tests/`·`build/`·`.github/` 零出现，`scripts/` 25 文件在包内；`prepack` 契约见 `package.json:45`。防线 = 纳管后的 `tests/pack-contents.test.mjs`（3 tests）。见 Standard Stack / Pattern 2 / SC-2 |
| PUB-03 | `dshmarket curated registry 提交材料与流程就绪（双语描述、category=workflow、install 命令真实）；PR 本体随 npm 首发于 Phase 5 提交` | 流程全部查实：目标仓 `awesome-dsh-plugin/awesome-dsh-plugin`、文件 `data/plugins/pfmiles__dsh-gsd.yml`、字段 `url/name/category/description.{en,zh}`、`workflow` ∈ 23 类词表、CI 四检（≤3 条 / `dsh.bundle` / 仓龄 ≥1 天 / awesome-lint+site build）、审核 SLA「usually within a day」。**install 命令由 catalog 生成且不带版本号** → 与 README 的 `dsh-gsd@<ver>` 形态冲突，需在 plan 中显式裁决（见 Pattern 3 / Open Questions Q2） |
| PUB-04 | `LICENSE（MIT）与上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）` | `LICENSE:1-3` = `MIT License` + `Copyright (c) 2026 pf_miles`；`package.json:15` `"license": "MIT"`；README 双语各有 MIT 段（zh `README.md:67-69`、en `README.md:137-139`）；`THIRD-PARTY-NOTICES.md` 已在仓且被 BUILD.md/README 双向链接。D-01 明令**不改**。本 phase 只需「徽章 + 致谢齐备」的可见性补齐 |
| INST-06 | `插件管理器展示元数据合规（locale/en.json + zh.json、icon.svg、files 白名单）` | 契约来自 `dsh-plugin-manager@0.2.2-rc.1` 的 `typert.host.js:99-103`：`meta.title` / `meta.description`（string 或 `{en:…}` 多语映射）+ `icon`（"Base64 image data URL from a package root's manifest icon or an exported `<specifier>/icon`"）。当前 `locale/{en,zh}.json` 两键齐全且双语已实写，`package.json:14` `"icon": "icon.svg"` + `exports["./icon"]` 双通道就位，pack 清单含二者 → **现状已合规，Phase 3 只需落一条复核断言** |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| tarball 收路面（`files` 白名单 / `.npmignore` 缺失时的默认行为） | npm 打包层（`npm-packlist`） | 仓库层（`package.json` `files`） | 收录决策完全由 `package.json` `files` + npm 无条件收录项（`package.json`/`README*`/`LICENSE*`/`main`）决定，CI 与运行时都无二次过滤 |
| 安装期依赖解析（peer / engine 判定） | pnpm（profile 内 `autoInstallPeers: false`） | 宿主层（`engines.dsh` 由 DSH 自己的 `evaluatePluginCompatibility` 裁决） | profile 的 `pnpm-workspace.yaml` 定死了 peer 策略；peer 范围在 profile 通道**只警告不阻断**，真正的拒绝门是 `engines.dsh` |
| 兼容矩阵证据（4 格） | CI（GitHub Actions Ubuntu runner，npm 通道） | 本地等价复核（`npm install` + `build/lib/compat-probe.mjs`） | CI 用 **npm**（默认 auto-install-peers=true）与 profile 的 pnpm 行为不同——漂移只在这条通道上暴露，所以证据必须在同通道产出 |
| curated registry 收录 | 第三方仓（`awesome-dsh-plugin`，一个插件一个 YAML） | 生成物（`plugins.json` → 市场/站点/宿主 Discover） | 提交物只有数据；install 命令、npm 映射、star/download 全部由对方 CI 生成，我方无法在条目里指定 |
| 插件展示元数据（INST-06） | 包内资源（`locale/*.json` + `icon.svg` + `package.json` `icon`/`exports`） | 宿主 UI 层（`@deepseek-ai/dsh-plugin-manager` 转 base64 data URL） | 宿主只读包内声明，不做二次加工；`files` 一旦漏掉 `locale/` 或 `icon.svg` 就会静默降级为技术名/头像 |
| 发表面**对外动作**（publish / release / PR） | Phase 5（人工 + UAT 前置于此） | — | D-02：本 phase 只生产「就绪」，任何对外写入都在 Phase 5 |

## Standard Stack

本 phase **不新增任何运行时依赖**——发布面工具全部是既有平台件（npm / pnpm / gh / actionlint）与仓内脚本。因此本节记录的是「发布面用到的东西及其已核验版本」，不是待安装清单。

### Core

| Tool / Lib | Version（本机实测） | Purpose | Why Standard |
|---------|---------|---------|--------------|
| npm | `12.2.1` | `npm pack`（收路面）+ `npm publish --dry-run` | npm 官方打包实现 = `npm-packlist` 的唯一真值；本仓 `prepack` 挂钩就挂在这条链上 |
| pnpm | `12.11.2` | profile 安装通道（`dsh plugin add` 转发 pnpm） | DSH profile 的包管理器就是 pnpm；`autoInstallPeers:false` / `nodeLinker:hoisted` 是 DSH 写入 profile 的策略 |
| dsh CLI | `0.2.2-rc.1` | `dsh plugin --profile <name> add <spec>`；`--dump-config` | 唯一能把 bundle patch 行挂上宿主组合面的通道（`dsh.bundle.patch` 消费方） |
| GitHub Actions | `actions/checkout@v7`（v7.0.1, 2026-07-20）、`actions/setup-node@v7`（v7.1.0, 2026-10-08） | CI 激活载体 | 两个 major **在 GitHub 上真实存在**（实测 releases API），排除「首跑因 action 版本不存在而红」的风险 |
| gh CLI | `2.103.3` | push 后读 `gh run list` 判 SC-5 | 已登录 `pfmiles`（scopes `gist, read:org, repo`） |
| actionlint | `1.7.12` | workflow 静态校验（workflow 若有任何改动） | Phase 02 已建立「actionlint 0 findings」惯例 |

### Supporting

| Tool | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node --test`（Node 内置 test runner） | Node `v24.21.0` | 全量套件 / pack 防线 | `tests/*.test.mjs` glob；**禁止与 build 并发** |
| `build/lib/check-pins.mjs` | — | `--offline` pin 对齐（CI 第一步） | 任何 workflow / 版本改动后的第一道自检 |
| `build/lib/compat-probe.mjs` | — | 宿主求值探针（install-ok / reject） | 四格矩阵的唯一判定器 |
| js-yaml | 仓内未装（catalog 仓用 `js-yaml@^4.3.2`） | 校验提交 YAML 可解析 | 校验 dshmarket 条目材料的语法（可用 catalog 同款语义） |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `npm pack --dry-run --json` 作为 pack 防线 | 静态推导（`tests/pack-contents.test.mjs` 现有做法） | 真跑 pack 会触发 `prepack` = build + 全量测试，**递归回本套件**、且并发构建会让清单在 21/494/957/958 间跳变（该测试文件头注释已记录）；静态推导秒级、可 per-commit，但需要与真 pack 定期交叉核对（1.20.1-1.dsh022 已核对一致） |
| 根 peer 收紧（exact） | L37 追加显式 pin / L37 加 `--force` | 见 Pattern 1 三解对比（exact 与「安装命令显式钉」都实测干净；`--force` 实测会在根多装一份 rc.2） |
| 读 `npm ls --json` 判定解析结果 | 用 `node -e` 直读 `node_modules/<pkg>/package.json` | npm 12 的 `--json` 输出形态已两次咬到本仓（`npm view` 单元素数组 + 本次 `npm pack --json` 返回**以包名为键的对象**而非数组）；直读 package.json 与 `compat-probe.mjs` 既有 idiom 一致 |

**Installation:**

```bash
# 本 phase 不安装任何新依赖。复核既有工具链即可：
node --version && npm --version && pnpm --version && dsh --version && actionlint --version
```

**Version verification（本节所有版本均于 2026-11-12 实测）:**

```bash
npm --version            # 12.2.1
pnpm --version           # 12.11.2
dsh --version            # 0.2.2-rc.1
actionlint --version     # 1.7.12
gh --version             # 2.103.3
node --version           # v24.21.0
```

## Package Legitimacy Audit

> **本 phase 不安装外部包。** 常规的 `gsd_run query package-legitimacy check` 门在本运行时**不可用**（本 agent 的硬约束禁止执行任何 `gsd_run`），故下表改用第一手物证替代：npm registry 元数据 + tarball 实读 + GitHub API 仓元数据。凡未经第一手复核的都不出现在推荐里。

| Package / Source | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `dshmarket@1.73.18` | npm（npmmirror 镜像解析，`publishConfig` 指 npmjs） | 首发 2026-08-13（≈3 月） | 未取 | `github.com/dsh-market/dsh-market`（package.json `repository` 实测） | OK（第一手 tarball 实读 126 文件，无 postinstall 网络脚本；`scripts` 全为构建/校验） | 仅作**流程证据源**，不安装、不依赖 |
| `awesome-dsh-plugin/awesome-dsh-plugin`（catalog 数据源） | 非 npm（GitHub 仓 + `awesome-dsh-plugin.com` 站点） | 仓 `pushed 2026-11-11T23:22:58Z`，CC0-1.0，24,360 stars | `plugins.json` 10,581 条 | 同上 | OK（第一手：GitHub API + `plugins.json` 实拉 + 仓内 `scripts/` 源码） | 提交目标仓（Phase 5 提 PR） |
| `@deepseek-ai/dsh-plugin-manager@0.2.2-rc.1` | 随 dsh 安装内置 | 与本机 dsh 同版 | — | `@deepseek-ai/*` 官方 monorepo | OK（`typert.host.js` 的 zod schema 直接读作契约） | 只读参考，不安装 |
| `dsh-plugin-catalog`（宿主 Discover 的 format-1 索引，npm 分发） | npm | 未核 | 未核 | 未核 | **不采用**（仅由 `dshmarket` README 提及，未第一手复核） | 记为可选第二通道，不进 plan 必做项 |
| `dshbase.com` / `Anil-matcha/awesome-dsh-plugin` / `fuyiyun666/awesome-dsh-plugin-2` | 网页/第三方仓 | — | — | — | **REMOVED（不可信）** | 与本 phase 无关；CONTEXT 已判为 SEO 变体，本趟未采信任何一条 |

**Packages removed due to [SLOP] verdict:** 无（本 phase 无安装动作；三条不可信网页来源已按 REMOVED 处理）
**Packages flagged as suspicious [SUS]:** 无

*本 phase 的一切外部事实都来自「已发布 tarball 实读」或「提交目标仓源码实读」，不存在「靠 WebSearch 猜包名」的面。*

## Architecture Patterns

### System Architecture Diagram

```
仓库（本地 main，领先 origin 88 提交）
  package.json(files 白名单) · locale/{en,zh}.json · icon.svg · cordis.patch.yml · index.js
  skills/ gsd-core/ hooks/ config/ scripts/   ← build.mjs 产物，gitignored，靠 files 收面
        │
        ├─(A) npm pack（prepack = build + 全量测试）──► dsh-gsd-1.20.1-1.dsh022.tgz
        │                                              958 files / 12 tops / 4.58 MB
        │                                                     │
        │                                        pnpm add <绝对路径>
        │                                        （profile: autoInstallPeers=false,
        │                                          nodeLinker=hoisted）
        │                                                     ▼
        │                                          干净 profile 装成 → 可 boot
        │                                          （runtime-identity / dump-config 可证）
        │
        ├─(B) git push（SSH）──► GitHub Actions 首次激活 run
        │                        4 cells × 6 gated steps
        │                        （pins --offline → npm install dsh → probe →
        │                          build+gates → 全量 tests）
        │                                    │
        │                          首跑即绿 ⇒ 无红跑历史（SC-5）
        │
        └─(C) 手写一条 YAML ──► awesome-dsh-plugin/awesome-dsh-plugin
                                 data/plugins/pfmiles__dsh-gsd.yml   （Phase 5 提 PR）
                                        │
                                 Submission gate（≤3 条 / dsh.bundle / 仓龄≥1天）
                                 + awesome-lint + site build
                                        │ 人工读码复核（usually within a day）
                                        ▼
                                 plugins.json（14.2 MB / count 10581 / updated 2026-11-11）
                                        │
                                        ▼
                                 dshmarket 卡片：install 命令由 ci 生成
                                 `dsh plugin --profile web add dsh-gsd`（**不带版本号**）
```

三条通道彼此独立：**(A) 证「包能装」、(B) 证「CI 能绿」、(C) 证「市场能收」**；D-02 把 (C) 的 PR 本体与 (A) 的真 registry 复验都推到 Phase 5，Phase 3 只把材料与本地等价证据做齐。

### Pattern 1: L37 漂移的三解与实测对比（D-03 的核心）

**漂移机理（实测复现，非推断）。** 在仓副本上跑 L37 原文：

```bash
npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.2-rc.1
```

得到（verbatim，节选）：

```
npm error Could not resolve dependency:
npm error peer @deepseek-ai/dsh-skill-filesystem@">=0.2.2-rc.1 <0.3.0-0" from the root project
npm error Conflicting peer dependency: @deepseek-ai/dsh-fs@0.2.2-rc.2
npm error node_modules/@deepseek-ai/dsh-fs
npm error   peer @deepseek-ai/dsh-fs@"0.2.2-rc.2" from @deepseek-ai/dsh-skill-filesystem@0.2.2-rc.2
```

`[VERIFIED: /tmp 仓副本实测 2026-11-12，real 2.1s，exit≠0]` —— CI 用 **npm**（默认 auto-install-peers=true），而 profile 用 **pnpm + autoInstallPeers:false**，所以这条漂移只在 CI 通道暴露、用户侧只表现为 peer warning。这一点决定了「改 manifest」与「改 CI」在语义上并不等价。

**semver 边界矩阵（node-semver 7.8.5，npm 12.2.1 内置，逐条实跑）：**

| 版本 | `>=0.2.2-rc.1 <0.3.0-0`（现状） | `… <0.2.2-rc.2-0` | `… <0.2.2-rc.2` | exact `0.2.2-rc.1` |
|---|---|---|---|---|
| `0.2.2-rc.1` | IN | IN | **IN** | **IN** |
| `0.2.2-rc.2` | **IN**（漂移源） | **IN**（上界陷阱，`rc.2 < rc.2-0`） | OUT | OUT |
| `0.2.2`（正式版） | IN | OUT | **OUT** | OUT |

`[VERIFIED: npm 12.2.1 内置 semver 7.8.5 实测 7 组 satisfies() + compare('0.2.2-rc.2','0.2.2-rc.2-0')=-1]`
第三列揭示一个 CONTEXT 未记的副作用：`<0.2.2-rc.2` 在排除 rc.2 的同时**也排除了 0.2.2 正式版**——即 DSH 0.2.2 正式发布当天必须再发一版插件（与 VER-02「每 DSH 行一版」自洽，但 plan 中要写明这层义务）。

**三解实测（同一仓副本、同一命令，仅改一处，全部端到端跑到 probe）：**

| 变体 | 改动位置 | `npm install` 结果 | 解析树 | probe | 评价 |
|---|---|---|---|---|---|
| **A. `--force`** | L37 加 `--force` | 成功，**706 packages** | 根 `dsh-skill-filesystem@0.2.2-rc.2` + 宿主内嵌 `@0.2.2-rc.1`（`npm ls` 三份并存） | install-ok exit 0 | ❌ 绿在**错误的树**上：安装步接受了自己正在校验的矛盾，`dsh-fs` rc.1/rc.2 混装而 probe 看不出来 |
| **B. exact peer**（推荐） | `package.json` peer → `"0.2.2-rc.1"` | 成功，**656 packages** | 全树 dedupe 到 `@0.2.2-rc.1` | install-ok exit 0；reject 格（`0.2.1-rc.5`）`reject confirmed` exit 0 | ✅ L37 **一字不改**即四格绿；与既有 `dependencies` 的 exact 钉法一致；`<0.2.2-rc.2` 与 exact 等价（本表第 3 列），但 exact 更明确表达「本版插件绑定 rc.1 桥接集」 |
| **C. 显式钉** | L37 追加 `@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.1` | 成功，**656 packages** | 全树 dedupe 到 `@0.2.2-rc.1` | install-ok exit 0 | ⚠️ 可行但把第二个版本字面量写进 workflow；reject 格不能直接用 `@${{ matrix.dsh }}`（那是 0.2.1-rc.5，会与根 peer 冲突），只能硬写 rc.1 |

`[VERIFIED: /tmp/npmprobe/pkg 四个变体逐一实跑 + build/lib/compat-probe.mjs 现场调用 2026-11-12]`

**推荐 B，理由按重要性：**
1. **修的是根因**：三条 `@deepseek-ai/*` 声明里，两条 `dependencies`（`dsh-hooks-claude-code` / `dsh-hook-protocol`）是 exact `0.2.2-rc.1`，只有第三条（peer `dsh-skill-filesystem`）是开区间——内部自相矛盾才是漂移的根因，L37 只是信使。
2. **改动面最小且最可测**：一处 `package.json` 字符串；workflow 零改动 ⇒ `tests/compat-matrix.test.mjs` 的 ④⑤⑦ 三条结构哨兵全不动。
3. **用户侧零回归**：profile 走 `autoInstallPeers:false`，peer 只产生 warning（实测干净 profile 安装时输出 `[WARN] Issues with peer dependencies found`，安装照常成功）；exact 与开区间在该通道行为无差。
4. **D-03 的判据仍逐条满足**（四格绿、无红跑历史），只是实现位置从 workflow 移到 manifest——这一点必须在 plan 里显式声明，不能静默偏移。若用户坚持「workflow 必须有 diff」，C 是已实测的等价 fallback。

**附加建议（非 D-03 要求，但 02-REVIEW 已点名）：** 在 L36-38 同一个 `run: |` 块内追加一条正向断言，证明解析结果与矩阵行一致——用 `node -e` 直读 `node_modules/@deepseek-ai/dsh-skill-filesystem/package.json` 的 `version` 并与 `${{ matrix.dsh }}` 比对（**不要**新增 `run:` 步骤：`tests/compat-matrix.test.mjs:106-123` 要求每个 `run:` 的**上一行**必须是 `inputs ∩ matrix` 门；写在既有块内可完全避开该约束）。这条断言正是 A 变体「绿在错误树上」的解毒剂。

### Pattern 2: 收路面（`files`）与 tarball 安装链

**收路面实测（HEAD `dba96bb`，仓副本上跑，带 `--ignore-scripts` 以跳过 prepack 的 build+tests）：**

```bash
npm pack --dry-run --json --ignore-scripts
# → entryCount 958 / 12 顶层：LICENSE README.md config cordis.patch.yml gsd-core
#   hooks icon.svg index.js locale package.json scripts skills
#   .planning 0 · tests 0 · build.mjs 0 · BUILD.md 0
#   skills/*/SKILL.md 72 · gsd-core/ 808 · scripts/ 25 · hooks/ 44 · config/ 1
```

`[VERIFIED: npm 12.2.1 实测，与 tests/pending-phase-3/pack-contents.test.mjs:18-19 注释记载的「958 个文件、12 个顶层条目」逐字一致]`

三条 npm 语义必须写进 plan，否则实现会走偏：
1. **`private: true` 不影响 `npm pack`**（实测 tarball 照常产出、pnpm 照常安装）。
2. **npm 无条件收录** `package.json`、`README*`、`LICENSE*`、`main` 指向的文件——所以 `README.md`/`LICENSE` 在包里而它们**不在** `files`；反之 `BUILD.md`/`build.mjs` 不在包里也不需要 `.npmignore`。
3. **`CHANGELOG.md` 不会被自动收录**（实测 958 清单里没有）⇒ 要发就显式加进 `files`，但那会**打红** `pack-contents.test.mjs` 的 ②（`ALLOWED_TOP_LEVEL` 未含 `CHANGELOG.md`，见 `tests/pending-phase-3/pack-contents.test.mjs:41-45`）。**推荐：不进包**（npm 页面只渲染 README，CHANGELOG 在 GitHub 上就够），从而 pack 防线零 churn。

**tarball → 干净 profile 链路（已实测到可执行层）：**

```bash
# 1) 真 tarball（在仓内跑会执行 prepack=build+全量测试；先确认无并发 build）
npm pack                       # → dsh-gsd-1.20.1-1.dsh022.tgz（.gitignore 已忽略 *.tgz）

# 2) 装进干净 profile（绝对路径，见 Pitfall 6）
dsh plugin --profile <clean> add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"

# 3) 装成判据（实测同一 tarball 在 profile 同构的 pnpm 环境里的输出）
#    + dsh-gsd 1.20.1-1.dsh022        （pnpm 12.11.2，6 packages，4s）
node <profile>/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw
#    → {"packageName":"@opengsd/gsd-core","version":"1.20.1"}   exit 0
ls <profile>/node_modules/dsh-gsd/skills | wc -l   # → 72
```

`[VERIFIED: 用 /tmp/npmprobe 的 958 文件 tarball，在 /tmp/pnpmprof（pnpm-workspace.yaml 复刻 profile 的 `nodeLinker: hoisted` + `autoInstallPeers: false`）实装实跑 2026-11-12]`

**「干净 profile」的可行定义**（plan 需要写死，否则执行者会去重装宿主）：在同一 `$DSH_HOME` 下**新建一个 profile 名**即满足「无需前置脚本、无手工 patch 编辑」；宿主 bundle 由 DSH 安装自身提供（`dsh plugin` 上下文里带 `installAnchor`），不必在新 profile 里重装 600+ 包。真正的「全新 DSH_HOME / 干净机器」由 Phase 5 的 UAT-01 覆盖。

### Pattern 3: dshmarket 提交（外部缺口，已查实）

**结论链（每一环都有第一手出处）：**

| # | 事实 | 出处 |
|---|---|---|
| 1 | `dshmarket` 是市场 UI 插件，**不是**登记服务；登记数据在别处 | `dshmarket@1.73.18` tarball `README.md:136`：**"This repo is the market app, not the catalog."** |
| 2 | 提交目标仓 = `github.com/awesome-dsh-plugin/awesome-dsh-plugin` | 同上："open a PR **there** (one entry in the list; the site and this market pick it up automatically, usually within a day)"；`lib/regions.js:83` `const CATALOG_OFFICIAL = 'https://awesome-dsh-plugin.com/plugins.json';` |
| 3 | 收录单位 = **一个插件一个 YAML 文件**，路径 `data/plugins/<owner>__<repo>.yml` | 目标仓 `contributing.md:9`；文件名由 `scripts/lib/entries.mjs:60-66` 的 `slugFor(url)` 生成 ⇒ 本仓为 **`data/plugins/pfmiles__dsh-gsd.yml`** |
| 4 | 条目字段（实际提交物） | `contributing.md:12-21` 模板 + 线上实例 `data/plugins/0-0-user__dsh-plan-note.yml` 逐字：`url:` / `name:` / `category:` / `description.en` / `description.zh` / `icon:`（可选） |
| 5 | 只有 `description.en` 必填，缺 zh 由维护者补 | `contributing.md:24`：**"Only `description.en` is required."** |
| 6 | `category` 是**闭合词表**，`workflow` 合法 | `scripts/lib/entries.mjs:27` `export const CAT_IDS = ['agi','ui','usage','theme','model','identity','session','memory','tools','wsl','browser','vision','voice','docs','skill','workflow','git','notify','dev','security','remote','market','fun']`；`:209-211` 非法值直接 `problems.push(...must be one of...)`；线上 `plugins.json.categories` 实测 23 键，`workflow` → `"Workflow & Automation"` |
| 7 | **排序规则**：提交物里没有排序字段 | `scripts/lib/entries.mjs:259-263` `orderEntries` = `CAT_IDS.flatMap(id => entries.filter(e => e.category===id).sort((a,b)=>a.url.localeCompare(b.url)))` ⇒ 按固定分类序分组、组内按 `url` 字典序 |
| 8 | 允许**多条分类**（数组）但目录生成器只认单值 | 市场端 `lib/types/registry.d.ts:11-12` `category: string \| string[]`（"One legacy category id or several category ids"）；目录侧 `entries.mjs` 用 `===` 比较单值 ⇒ **提交就写单值一个字符串** |
| 9 | 仓库侧硬门槛 | `contributing.md:58` 根 `package.json` 必须声明 `dsh.bundle`（本仓 `package.json:20-24` 已有 `"dsh": {"bundle": {"patch": "./cordis.patch.yml"}}` ✅）；`:79` 仓龄 ≥ **1 天**（本仓 `created 2026-11-10T09:50:51Z` ✅）；`:83` 仓要带 `dsh-plugin` topic（远端 topics 实测已含 ✅）；「真实可用的代码」「描述必须属实」「分类贴合实际」 |
| 10 | CI 检查四步 | `contributing.md:160-166`：① 每 PR ≤ **3 条**（`check-submission.mjs:78` `MAX_ENTRIES_PER_PR = 3`）② `dsh.bundle` 从 `package.json` 读（只声明 `dsh.client` 会红）③ 仓龄（`check-submission.mjs:21` `MIN_AGE_DAYS = 1`）④ `awesome-lint` + site build（双语一致、分隔符、日期、截图） |
| 11 | 审核 SLA 与流程 | `contributing.md:90-92`「CI 通过是**前置条件**，不是结论…合并前维护者会实际阅读目标仓库」；`README.md:136`「usually within a day」；需改时打 `held: author` 标签（`:172`），rebase 由维护者做（`:182`） |
| 12 | **不要求 npm 已发布**，也不要求 star 数 | 门槛清单（`contributing.md:56-88`）无 npm/stars 项；npm 只是「推荐」（`:119`），不发 npm 时可改用 `tarball:` 字段（`:120-133`，必须是 GitHub Release 托管的 https `.tgz`） |
| 13 | **icon 只收 GitHub 托管位图**，SVG 明确被拒 | `contributing.md:190`：「SVG and third-party image hosts are refused」⇒ **不能**把本仓 `icon.svg` 填进条目的 `icon:`；留空则回退作者头像 |
| 14 | 纯聚合包不收录 | `contributing.md:105`「List the plugins, not the bundle」——判断标准是「bundle 自己是否做事」。本仓自带 `index.js`（skill provider）、`hooks/dsh-gsd-suite`（stdio adapter）、`config/gsd-hooks.json`，**不是**只依赖别人的聚合包，属可收录形态；但 plan 应把这条作为**提交说明的论证点**写进材料，而不是留给审核者自己猜 |
| 15 | 依赖必须指向上游原作者 | `contributing.md:107`；本仓 `dependencies` 是官方 `@deepseek-ai/*` exact pin ✅ |

**install 命令是生成物，不是提交物（本 phase 最容易做错的一处）。** catalog 生成 install 串的选择器见目标仓 `scripts/card-install-command.test.mjs`：

```js
// npm 优先：'dsh plugin --profile web add example-plugin'（**不带版本号**）
// else tarball：`dsh plugin --profile web add "https://github.com/${repo}/releases/download/${asset}"`
// else git：`dsh plugin --profile web add github:${repo}${path}`
```

线上实例印证：`dsh-plan-note` 条目的 `"install": "dsh plugin --profile web add dsh-plan-note"`。⇒ 本插件上架后卡片命令将是 **`dsh plugin --profile web add dsh-gsd`**（无 `@版本`），而 README 的规范命令是 `dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022`（`README.md:19`）。Success Criterion 3 的「install 命令与 README 逐字一致」因此**不可能对「带版本」形态成立**，只有两种自洽解法：
- **(a) 推荐**：README 增加一处「不带版本」的等价命令（市场/宿主 Discover 的形态），并在提交材料里逐字引用该串；带版本的规范命令同时保留（`tests/docs-consistency.test.mjs:83-97` ⑤ 只禁止 range/tag 且要求至少一条 `dsh-gsd@` 示例存在——新增无版本示例**不会**打红 ③⑤）。
- (b) 把 SC-3 解释为「提交材料记录的 install 命令与 README 逐字一致」，即材料里写生成物那一串，并要求 README 含之。

任一解法都需要一个**前置条件**：不带版本号的安装能解析到包，唯一依赖是 npm `dist-tags.latest`（prerelease 版本不参与 range 匹配——`README.md:41` 已声明）。⇒ Phase 5 的 `npm publish` 必须把 `latest` 指向本版本（`publishConfig.tag` 或 `--tag`，见 Pattern 4），否则市场卡片的命令在用户手里会 `No matching version found`。**这条依赖关系必须写进 plan 与 Phase 5 移交清单。**

### Pattern 4: CHANGELOG、版本与 tag、package.json 元数据

**CHANGELOG（D-04）**：Keep a Changelog 1.1.0 的骨架（实测 1.1.0 页面结构）为 `## [Unreleased]` + `## [<ver>] - <YYYY-MM-DD>` + 六个固定小节 `Added / Changed / Deprecated / Removed / Fixed / Security`。本仓首个条目即 `## [1.20.1-1.dsh022] - 2026-11-12`。文案来源可靠：`git log` 与既有 `.planning/phases/*/` 的决策记录**都是**可见事实，不需要发明。plan 应指定「版本号与 `package.json.version` 等值」这条可由测试断言的约束（可挂在 docs-consistency 或新测试里）。

**`private: true` 与发布前置（实测，直接决定 Phase 5 的手感）：**

| 观察 | 命令 | 结果 |
|---|---|---|
| `npm pack` 照常 | `npm pack --dry-run --json --ignore-scripts` | exit 0，958 文件 ✅ |
| `npm publish --dry-run` **不报** private | `npm publish --dry-run --ignore-scripts --tag next` | `+ dsh-gsd@1.20.1-1.dsh022`（dry-run 通过）⇒ **dry-run 不能当发布就绪判据** |
| prerelease 必须显式 tag | `npm publish --dry-run --ignore-scripts` | `npm error You must specify a tag using --tag when publishing a prerelease version.` |
| 真发布才拦 private | npm 12.2.1 `node_modules/libnpmpublish/lib/publish.js:16-22` | `if (manifest.private) { throw Object.assign(new Error(\`This package has been marked as private\nRemove the 'private' field from the package.json to publish it.\`), { code: 'EPRIVATE' }) }` |
| dry-run 不走到那一步 | `lib/commands/publish.js:210-224` | `if (!dryRun) { … await otplease(this.npm, opts, o => libpub(manifest, tarballData, o)) }` |

`[VERIFIED: npm 12.2.1 源码 + 两次 dry-run 实测 2026-11-12]`
⇒ **本 phase 保留 `private: true`**（D-02 不发布，且 `tests/docs-consistency.test.mjs:99-102` ⑥ 明确断言 `assert.equal(pkg.private, true, 'npm publish 前置：private: true 移除属 Phase 3 任务')`——该注释里的「Phase 3」已被 D-02 取代，plan 应把它改写为 Phase 5 而**不必**改断言）。Phase 3 只需把三条移交事实写进计划：`EPRIVATE` → 删 `private`；prerelease → `--tag` 或 `publishConfig.tag`；registry → `publishConfig.registry`（见下）。

**`publishConfig.registry` 是本机环境的必要项（否则 Phase 5 会发不出去）**：本机 `npm config get registry` = `https://registry.npmmirror.com`（镜像只读代理），而 `dshmarket` 自己的 `package.json` 就带 `"publishConfig": {"registry": "https://registry.npmjs.org/"}`——同一约束的既有先例。`dsh-gsd` 目前**没有** `publishConfig`。建议 Phase 3 落 `"publishConfig": {"registry": "https://registry.npmjs.org/"}`（纯元数据、无行为副作用、不打红任何既有测试），把 `tag` 的取值留到 Phase 5 与发布动作一起裁决（推荐 `latest`，因为它同时决定市场卡片命令能否解析）。

**元数据补全范围（Discretion 项，给出取值）：**

| 字段 | 现状 | 建议 | 依据 |
|---|---|---|---|
| `name` / `version` | `dsh-gsd` / `1.20.1-1.dsh022` | 不动 | `tests/docs-consistency.test.mjs:100` 钉死 version |
| `private` | `true` | **保留**（Phase 5 删） | 上表 + D-02 |
| `license` | `MIT` | 不动 | D-01 明令 |
| `repository` | 缺 | 加 `{"type":"git","url":"git+https://github.com/pfmiles/dsh-gsd.git"}` | npm 页面的 repo 链接、`npm repo` 都读它；`dshmarket` 的 `package.json` 同形 |
| `homepage` | 缺 | `https://github.com/pfmiles/dsh-gsd#readme` | 同上（`dshmarket` 用独立站点，我们没有） |
| `bugs` | 缺 | `{"url":"https://github.com/pfmiles/dsh-gsd/issues"}` | 同上 |
| `keywords` | 缺 | 含 `deepseek`, `harness`, `dsh`, `dsh-plugin`, `gsd`, `skills`, `workflow` | `dshmarket` 的 keywords 同构；npm 搜索面 |
| `author` | 缺 | `"pf_miles"`（可与 `miles.wy.1@gmail.com` 组合） | `git config user.name` = `pf_miles`、`LICENSE` = `Copyright (c) 2026 pf_miles` |
| `icon` / `exports` | 已有 | 不动 | INST-06 契约（见下） |
| `publishConfig` | 缺 | 加 `registry`（`tag` 留 Phase 5） | 上段 |

**INST-06 契约（Discretion 项的判定，已有第一手 schema）**：宿主 `@deepseek-ai/dsh-plugin-manager@0.2.2-rc.1` 的 `lib/typert.host.js:99-104` 定义 `meta` 形状——

```js
'meta': z.object({
  'title': z.union([z.string(), z.intersection(z.object({'en': z.string().readonly()}), z.record(z.string(), z.string()).readonly())]).readonly().optional().describe('Display title; omission preserves the consumer\'s technical-name fallback.'),
  'description': z.union([z.string(), …]).optional().describe('Display introduction after locale and package-field fallback.'),
  'icon': z.string().readonly().optional().describe('Base64 image data URL from a package root\'s manifest icon or an exported `<specifier>/icon`; render as an image, not inline markup.'),
  'error': z.string().readonly().optional(),
})
```

`[VERIFIED: dsh-plugin-manager@0.2.2-rc.1 lib/typert.host.js:99-104 逐字]`
⇒ 本仓现状**已满足**：`locale/en.json` + `locale/zh.json` 各带 `meta.title`（`"GSD on DSH"`）与 `meta.description`（双语实写、非占位），`package.json:14` `"icon": "icon.svg"` 且 `exports["./icon"]` 存在，pack 清单含 `locale/` 与 `icon.svg`。**INST-06 在本 phase 是「复核 + 断言」，不是「补齐」**——plan 不要为它造新字段。注意 `icon` 在 catalog 条目里是另一套规则（SVG 被拒，见 Pattern 3 #13），两者不可混为一谈。

### Anti-Patterns to Avoid

- **用 `--force` 让安装步变绿**：实测会在根装出 rc.2 的 peer 副本，probe 仍绿 ⇒ 把「绿灯」与「正确解析」解耦，比红更坏。
- **用 `npm publish --dry-run` 证明「可以发布」**：`private: true` 下它照样通过（实测），真发布才 `EPRIVATE`。
- **把 `CHANGELOG.md` 加进 `files`**：会打红 pack 防线 ②（顶层条目白名单）。
- **改 `package.json.version` 或 `private` 而不同步 `tests/docs-consistency.test.mjs` ⑥**（`:99-102` 同时钉死二者）。
- **给 dshmarket 条目填 `icon: .../icon.svg`**：SVG 明确被拒（`contributing.md:190`），只会被打回。
- **指望在 catalog 条目里指定 install 命令的版本号**：命令由对方 CI 生成。
- **把 pack 防线写成「真跑 npm pack」**：递归回本套件 + 并发构建使清单跳变（该测试文件头注释已载明）。
- **在 `run:` 块里新增 workflow 步骤而不补前置 `if:` 门**：`tests/compat-matrix.test.mjs:106-123` 逐行断言「每个 `run:` 的上一行必须是 `inputs ∩ matrix` 门」。
- **并发跑 build/测试**：`build-smoke.test.mjs` 重写构建树，并发会假红 `gate C: no SKILL.md under skills/gsd-*`（STATE 已锁纪律）。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| tarball 收面清单的「真相」 | 自己写 glob 遍历当唯一真值 | `npm pack --dry-run --json --ignore-scripts`（周期性交叉核对）+ 既有静态推导测试（per-commit） | 收录规则属 `npm-packlist`：`files` 展开、`always-include`（`package.json`/`README*`/`LICENSE*`/`main`）、嵌套 `.gitignore` 交互——手写副本必然漂移 |
| 依赖解析冲突的判定 | 自己算 semver / 猜 npm 行为 | 直接跑 `npm install`（CI 通道）+ `node build/lib/compat-probe.mjs`（宿主判定） | 本 phase 的 4 个变体差异全部由真实解析树体现，本地推理三次都差一点（上界陷阱就是典型） |
| 宿主兼容性判定 | 自写 `engines` 求值 | `build/lib/compat-probe.mjs`（转发宿主 `evaluatePluginCompatibility`） | 02 已确立：宿主是唯一真值，本地 semver 数学会与宿主不一致 |
| catalog 条目格式校验 | 自写 YAML schema | 目标仓 `scripts/lib/entries.mjs` 的 `validateEntries` 规则（字段/词表/文件名 slug 逐条照抄到本地断言） | 对方就是最终裁判；照抄即可在 Phase 3 提前红，而不必等 Phase 5 被打回 |
| CHANGELOG 结构 | 自创小节名 | Keep a Changelog 1.1.0 的六小节 + `[Unreleased]` | 生态惯例，且 D-04 已指定 |

**Key insight:** 本 phase 的所有「难题」都是**外部工具的既有语义**（npm-packlist 的收面、npm 的 peer 解析与 EPRIVATE、pnpm 的 peer 策略、catalog 仓的词表与 gate），没有一个值得自研；研究价值在于把它们逐条测出来写成断言。

## Common Pitfalls

### Pitfall 1: `tests/pending-phase-3/pack-contents.test.mjs` 现在**根本跑不起来**（ROOT 解析错位）

**What goes wrong:** 该文件用 `resolve(dirname(fileURLToPath(import.meta.url)), '..')` 求仓根（`tests/pending-phase-3/pack-contents.test.mjs:36`）。在现址 `..` 只到 `tests/`，于是 `join(ROOT,'package.json')` 指向**不存在的** `tests/package.json`。
**实测：** `node --test tests/pending-phase-3/pack-contents.test.mjs` → `Error: ENOENT: no such file or directory, open '…/dsh-gsd/tests/package.json'`，`fail 1`。
**Why it happens:** 文件本来是为 `tests/` 位置写的；移入 `pending-phase-3/` 只改了 glob 可见性，没改相对深度。`tests/pending-phase-3/README.md:19` 的「3/3 passing when run explicitly」对**现址**已不成立。
**How to avoid:** 移动回 `tests/pack-contents.test.mjs` 即在语义上修好（`..` 回到仓根）。已实证：把 ROOT 硬改为仓根后同一份断言 **3/3 pass**。
**Warning signs:** 任何人声称「那 3 个测试已经绿」时，先看它是在哪个路径下跑的。

### Pitfall 2: 首次 push 会带上**新增的 workflow 文件**——HTTPS 通道会被 OAuth scope 拦

**What goes wrong:** `origin/main` 目前只有 10 个提交且**零** `.github/workflows/`（实测 `git ls-tree -r --name-only origin/main` 无该目录）。本次 push 是「新增 workflow」的提交。若走 HTTPS + `gh` 的 OAuth token，GitHub 会拒：需要 `workflow` scope。
**实测：** `gh auth status` = 账号 `pfmiles`，scopes `'gist', 'read:org', 'repo'` ——**不含 `workflow`**；但 `origin` 是 `git@github.com:pfmiles/dsh-gsd.git`（SSH），SSH 推送不受该 scope 限制。
**How to avoid:** 用 SSH push（现状即是）。若临时切 HTTPS 并失败，修法是 `gh auth refresh -s workflow`（这会改 token，属对外动作，plan 应在 checkpoint 上写明）。
**Warning signs:** 报错文本含 `refusing to allow an OAuth App to create or update workflow`。

### Pitfall 3: `--force` 让 CI 变绿，但绿在**错误的解析树**上

**What goes wrong:** 实测 `--force` 装出 706 包，根层 `dsh-skill-filesystem@0.2.2-rc.2`，宿主内嵌 `@0.2.2-rc.1`；`npm ls` 三份并存。`compat-probe` 只校验 host boot 版本与 `engines.dsh`，**照旧 exit 0**。
**Why it happens:** `--force` 的语义就是「接受错误解析」。矩阵格原本要证的正是「这份 manifest 在某宿主上能否干净解析」，`--force` 把被证命题删掉了。
**How to avoid:** 用 Pattern 1 的 B（exact peer）；若必须用 A，至少补一条「解析结果 == `${{ matrix.dsh }}`」的正向断言。
**Warning signs:** 安装日志出现 `706 packages`（干净解是 656）；`npm ls` 里同一包多版本。

### Pitfall 4: 上界两个陷阱（一个已知、一个尚未记录）

**What goes wrong:** `<0.2.2-rc.2-0` 排除不了 `0.2.2-rc.2`（实测 `satisfies('0.2.2-rc.2','>=0.2.2-rc.1 <0.2.2-rc.2-0') === true`，因 `compare('0.2.2-rc.2','0.2.2-rc.2-0') = -1`）。**新发现：** 换成 `<0.2.2-rc.2` 虽能排除 rc.2，但**同时排除 `0.2.2` 正式版**（实测 `satisfies('0.2.2', '… <0.2.2-rc.2') === false`）。
**Why it happens:** 预发布比较级联规则 + 正式版大于同号预发布版。
**How to avoid:** 若选窄区间，plan 必须写明「DSH 0.2.2 正式发布当天要再发一版插件」的维护义务；选 exact 时该义务同样存在但语义更直白。
**Warning signs:** `npm install` 在 rc.2 落地那天突然 ERESOLVE；或 0.2.2 正式版上线后安装被拒。

### Pitfall 5: `npm publish --dry-run` 通过 ≠ 可以发布

**What goes wrong:** `private: true` 下 `npm publish --dry-run --ignore-scripts --tag next` 输出 `+ dsh-gsd@1.20.1-1.dsh022`（成功）。真发布才会在 `libnpmpublish` 抛 `EPRIVATE`（源码见 Pattern 4 表）。
**Why it happens:** npm 12 的 dry-run 在 `if (!dryRun)` 之前就返回，`libpub` 根本没被调用。
**How to avoid:** 把「发布就绪」的判据定为 `npm pack` + 干净 profile 安装 + boot，而不是 publish dry-run；`private` 的移除留 Phase 5。
**Warning signs:** 有人拿 dry-run 输出当「已经能发了」的证据。

### Pitfall 6: tarball 路径要用**绝对路径**

**What goes wrong:** `dsh plugin --profile p add ./dsh-gsd-….tgz` 的相对路径归属容易出错——`dsh` 的包管理上下文是 `cwd: process.cwd()`（`lib/plugin-DscIHF4k.js:79` 上下文对象），而 pnpm 的项目根在 `$DSH_HOME/profiles/<name>`，两边不是同一目录。
**How to avoid:** 传绝对路径：`dsh plugin --profile p add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"`。已在 `/tmp` 用 pnpm 直接验证绝对路径 tarball 安装成功。
**Warning signs:** `ENOENT` / `No matching version found` / pnpm 报找不到 spec。

### Pitfall 7: npm 12 的 `--json` 输出形态（本仓已被咬两次）

**What goes wrong:** `npm pack --dry-run --json` 在 npm 12.2.1 返回的是**以包名为键的对象**，不是数组（`Object.values(raw)[0]` 才是那条记录）；Phase 02 也记录过 `npm view <exact>` 返回单元素数组的形态差（`02-02` 偏差 3）。
**How to avoid:** 解析时先归一化（`Array.isArray(raw) ? raw[0] : Object.values(raw)[0]`）；或干脆不解析 npm JSON，直接读 `node_modules/<pkg>/package.json`（与 `compat-probe.mjs` 同一 idiom）。
**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'filename')`。

### Pitfall 8: pnpm 12 的「Agent skills awaiting approval」

**What goes wrong:** 本包带 72 个 `SKILL.md`，pnpm 12.11.2 安装时会打印 `Agent skills awaiting approval: dsh-gsd@file:…tgz.` 并提示 `Run "pnpm approve" to review them.`（实测）。安装本身成功（`+ dsh-gsd 1.20.1-1.dsh022`），但**审批是否影响会话内技能可见性未验证** [ASSUMED]。
**Why it happens:** pnpm 12 新增的依赖权限审批（`pnpm approve` = `pnpm permissions approve`）。
**How to avoid:** SC-1 的 boot 验证必须显式覆盖这一点：装完先 `ls node_modules/dsh-gsd/skills | wc -l` = 72，再在会话里确认技能目录出现 72 个 `gsd-*`；若被拦，`pnpm approve --all`（不可交互环境）。
**Warning signs:** 安装日志有 `Agent skills awaiting approval`，而会话里技能缺失。

### Pitfall 9: `docs-consistency` ⑥ 同时钉死了 `version` 与 `private`

**What goes wrong:** `tests/docs-consistency.test.mjs:99-102`：

```js
assert.equal(pkg.version, '1.20.1-1.dsh022')
assert.equal(pkg.private, true, 'npm publish 前置：private: true 移除属 Phase 3 任务')
```

改版本号或 `private` 都会立刻打红——而那条 message 里的「Phase 3」已被 D-02 推迟到 Phase 5。
**How to avoid:** Phase 3 两者都不动；plan 里把「Phase 5 删 `private` 时同步改此断言与 message」写成显式移交项。
**Warning signs:** 全量套件突然 1 fail 且信息是 `private` 相关。

### Pitfall 10: 计数同步面只有**一处**是活体断言，别去改历史记录

**What goes wrong:** CONTEXT 的 Discretion 说三处要同步（`BUILD.md` TL;DR、`02-VALIDATION.md`、`tests/docs-consistency.test.mjs`）。实测：`tests/docs-consistency.test.mjs` **不含任何计数断言**；`BUILD.md:16` 是唯一活体计数（`# 每波可重跑测试（含真实构建 smoke）——预期 26/26…`）。`02-VALIDATION.md` 的 `26/26` 都带 HEAD 引用（`HEAD 84784f1`），属**历史审计记录**，且本仓已有「历史陈述按约定不动」的先例（`02-REVIEW-FIX.md:76`：`L110「实测 7/7」历史陈述按约定不动`）。
**How to avoid:** 只改 `BUILD.md:16`（26/26 → 29/29）+ 新测试文件里的注释；对 `02-VALIDATION.md` 追加一条**带日期**的前向注记而不是改写旧数字。
**Warning signs:** 为了让计数「一致」而改写别的 phase 的审计结论。

### Pitfall 11: dshmarket 两处与直觉相反

**What goes wrong:** ① 条目的 `icon:` **只收 GitHub 托管位图**，SVG 与第三方图床被拒（`contributing.md:190`）——本仓只有 `icon.svg`，直接填会被打回；② 市场卡片的 install 命令由对方生成且**不带版本号**（`card-install-command.test.mjs`），与 README 的 `@<ver>` 形态不一致（SC-3 的冲突点）。
**How to avoid:** `icon:` 留空（回退作者头像）或后续补一张 GitHub 托管的方形 PNG；SC-3 按 Pattern 3 的 (a)/(b) 二选一落成，并把「Phase 5 publish 必须设 `dist-tags.latest`」写进移交。
**Warning signs:** 条目里出现 `raw.githubusercontent.com/.../icon.svg`；或 README 与材料里的 install 命令措辞不一致。

### Pitfall 12: 并发纪律（继承自 Phase 02，仍然生效）

**What goes wrong:** `tests/build-smoke.test.mjs` 会**重写**构建树；与任何 build/测试并发 ⇒ 假红 `gate C: no SKILL.md under skills/gsd-*`。本 phase 新引入的 `npm pack`（真跑会触发 `prepack` = build + 全量测试）也是「会重写构建树」的动作。
**How to avoid:** 严格串行：`npm pack` / `node build.mjs` / `node --test tests/*.test.mjs` 三者永不并行；`npm pack --dry-run --json --ignore-scripts` 可作快速观测（不跑 prepack）。
**Warning signs:** gate C 假红、pack 清单文件数在 21/494/957/958 间跳变。

## Code Examples

> 以下命令全部在本会话实跑过；除注明外均为**只读/无副作用**。`<...>` 为 plan 需填的占位。

### 收路面观测（不触发 prepack）

```bash
# 关键：--ignore-scripts 跳过 prepack（build + 全量测试），只测收面
npm pack --dry-run --json --ignore-scripts > /tmp/pack.json
node -e "
const raw = JSON.parse(require('fs').readFileSync('/tmp/pack.json','utf8'));
const a = Array.isArray(raw) ? raw[0] : Object.values(raw)[0];   // npm 12 返回对象
const files = a.files.map(f => f.path);
const tops = [...new Set(files.map(p => p.split('/')[0]))].sort();
console.log('entryCount', a.entryCount, 'tops', tops.join(' '));
console.log('leaks', files.filter(p => /^(\.planning|tests|build|\.github)\//.test(p)).length);
console.log('mustHave', ['index.js','cordis.patch.yml','icon.svg','locale/en.json','locale/zh.json'].every(p => files.includes(p)));
"
# 本会话实测输出：entryCount 958 / 12 顶层 / leaks 0 / mustHave true
```

### pack 防线（纳管后）

```bash
# 单独跑（秒级，无需 build）
node --test tests/pack-contents.test.mjs        # 期望 3/3 pass
# 全量（串行！先确认没有并发 build）
node --test tests/*.test.mjs                    # 期望 29/29 pass（26 + 3）
```

### L37 四格本地等价复跑（B 变体：manifest 改 exact peer 后，L37 原样）

```bash
for cell in "0.2.2-rc.1 install-ok" "0.2.1-rc.5 reject"; do
  set -- $cell
  rm -rf node_modules
  npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@"$1"
  node build/lib/compat-probe.mjs --dsh "$1" --expect "$2"
done
# 本会话实测：656 packages → install-ok confirmed exit 0；601 packages → reject confirmed exit 0
```

### tarball → 干净 profile → 装成判据

```bash
npm pack                                        # 会跑 prepack：build + 全量测试（串行！）
dsh plugin --profile <clean> add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"
node "$DSH_HOME/profiles/<clean>/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs" runtime-identity --raw
# 期望：{"packageName":"@opengsd/gsd-core","version":"1.20.1"}
ls "$DSH_HOME/profiles/<clean>/node_modules/dsh-gsd/skills" | wc -l    # 期望 72
dsh --profile <clean> --dump-config | grep -cE '^\s*- id: (gsd|gsd-hooks-bridge)$'   # 期望 2
```

### workflow 改动后必跑

```bash
actionlint .github/workflows/compat-matrix.yml   # 期望 exit 0 且无输出
node --test tests/compat-matrix.test.mjs         # ④⑤⑦ 结构哨兵，7/7
```

### push 后判 SC-5

```bash
gh run list --workflow=compat-matrix.yml --limit 1 --json status,conclusion,event,headSha
# 期望：status=completed, conclusion=success, event=push
gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count'    # push 前实测为 0
```

### dshmarket 条目材料（形态取自线上真实条目 `data/plugins/0-0-user__dsh-plan-note.yml`）

```yaml
# 文件名必须 = data/plugins/pfmiles__dsh-gsd.yml（slugFor(url) 生成）
url: https://github.com/pfmiles/dsh-gsd
name: pfmiles/dsh-gsd
category: workflow
description:
  en: 'GSD for DeepSeek Harness: a spec-driven coding workflow that ships 72 gsd-* skills, the GSD engine, and lifecycle guard hooks as one plugin bundle.'
  zh: '把 GSD 规格驱动编码工作流装进 DeepSeek Harness：72 个 gsd-* 技能、GSD 引擎与生命周期守卫钩子合为一个插件包。'
# icon: 省略 —— 只收 GitHub 托管位图（png/jpg/jpeg/webp），本仓只有 icon.svg，会被拒
```

### 条目材料的离线自检（不引入新依赖）

```bash
node -e "
const fs=require('fs');
const y=fs.readFileSync('<material>/pfmiles__dsh-gsd.yml','utf8');
const CAT=['agi','ui','usage','theme','model','identity','session','memory','tools','wsl','browser','vision','voice','docs','skill','workflow','git','notify','dev','security','remote','market','fun'];
const ok=(c,m)=>{ if(!c){ console.error('FAIL',m); process.exitCode=1 } };
ok(/^url: https:\/\/github\.com\/pfmiles\/dsh-gsd$/m.test(y),'url 必须精确等于仓库地址');
ok(/^name: pfmiles\/dsh-gsd$/m.test(y),'name 必须是 owner/repo 形态且指向同一仓');
const cat=(y.match(/^category: (\S+)$/m)||[])[1];
ok(CAT.includes(cat),'category 必须在 23 类词表内，实际 '+cat);
ok(/^  en: .*\.'?$/m.test(y),'description.en 必填且以句号结尾');
ok(!/^icon:/m.test(y) || /^icon: https:\/\/raw\.githubusercontent\.com\/.*\.(png|jpg|jpeg|webp)$/m.test(y),'icon 只能是 GitHub 托管位图');
"
```

### CHANGELOG 首条目骨架（Keep a Changelog 1.1.0）

```markdown
# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to a `<gsd-ver>-<rev>.dsh<line>` versioning scheme.

## [Unreleased]

## [1.20.1-1.dsh022] - 2026-11-12

### Added
- 72 个 `gsd-*` skills、GSD 1.20.1 引擎与生命周期守卫 hooks，作为一个 DSH 插件 bundle 分发
- `cordis.patch.yml` 挂载 `gsd` 与 `gsd-hooks-bridge` 两行；hooks 桥接自带 stdio adapter

### Changed
- 插件安装元数据合规化：`files` 白名单精确收录 `scripts/`、`locale/`、`icon.svg`

### Fixed
- 引擎 `MODULE_NOT_FOUND`：`scripts/` 兄弟目录随包分发
```

`[CITED: keepachangelog.com/en/1.1.0/ —— 小节名 Added/Changed/Deprecated/Removed/Fixed/Security、`[Unreleased]`、`## [x.y.z] - YYYY-MM-DD` 三形态均取自该页]`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact 对本 phase |
|--------------|------------------|--------------|--------|
| awesome-list 里手工往 README 追加一行 | **一个插件一个 YAML 文件** `data/plugins/<owner>__<repo>.yml`，README 由脚本生成 | 目标仓 `contributing.md:7,26,47` 明载（旧做法的 PR 互相冲突） | 提交物只有 5 行数据；PR 不会与他人冲突；不要手改 README |
| 手写 install 命令 | 卡片命令由 `cardCmd(e)` 生成（npm → tarball → git 三级优先） | 目标仓 `scripts/card-install-command.test.mjs` | SC-3 的「逐字一致」必须按生成物校准（Pattern 3） |
| `private: true` 一旦为真就「肯定发不出去」 | npm 12 的 `private` 只在 `libnpmpublish`（真发布路径）拦；`publish --dry-run` 不拦 | npm 12.2.1 源码结构（`publish.js:210-224` vs `libnpmpublish/lib/publish.js:16-22`） | 不能用 dry-run 代替「可发布」判据 |
| `npm publish` 直接发 prerelease | 必须 `--tag` 或 `publishConfig.tag` | npm 12 `isDefaultTag` 逻辑 | `1.20.1-1.dsh022` 是 prerelease ⇒ Phase 5 必须处理 tag |
| pnpm 装包只看依赖 | pnpm 12 新增 **agent skills 审批**（`pnpm approve`） | pnpm 12.11.2 实测输出 | 72 个 SKILL.md 会进审批队列（Pitfall 8） |
| `--legacy-peer-deps` 当通用解 | 已被本仓证否（丢 host peer → 缺 `dsh-app-boot` → probe exit 1） | Phase 02 裁决 | 明确禁用 |

**Deprecated/outdated:**
- PLAN.md 的 Apache-2.0 表述（D-01 已推翻）；`README.md:59`「版本化安装通道与 dshmarket 收录随 Phase 3 开放」在 Phase 3 完成后应改为「随 Phase 5 发布开放」——这是 README 与 D-02 的一处**现存矛盾**，plan 应作为文案落点处理。
- `tests/docs-consistency.test.mjs:101` 里「private: true 移除属 Phase 3 任务」的注释（D-02 后应为 Phase 5）。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | push 后 Actions **首次 run 会全绿** `[ASSUMED]` | Summary / Validation Architecture | 首跑即红 ⇒ 违反 SC-5 的「无红跑历史」，而 D-03 的顺序（先修后推）正是为了这个；缓解：四格本地等价全跑一遍 + actionlint，且首跑失败可修复后重跑（会留下红跑历史，需在 plan 的 checkpoint 里承认此残余风险） |
| A2 | `pnpm approve` 的「agent skills 待审批」**不阻断**会话内技能可见性 `[ASSUMED]` | Pitfall 8 / SC-1 | 若阻断，SC-1 的 boot 验证必须补 `pnpm approve --all` 一步；Phase 5 UAT-01 会真正暴露它 |
| A3 | catalog 词表（23 类）与「usually within a day」的 SLA 在研究窗口内稳定 | Pattern 3 | 词表若增删，`category: workflow` 仍合法（它是最早一批分类之一，且被 `CAT_IDS` 与线上 `categories` 双证）；SLA 只是期望值，不构成阻塞 |
| A4 | `npm pack` 的 958/12 数字在 plan 执行时仍成立 | Pattern 2 / SC-2 | 任何新增顶层文件都会改变它；断言应写成「泄漏集合为空 + 必含集合齐全」而非硬编码 958，硬编码只作交叉核对提示 |
| A5 | README 徽章可用 shields.io 静态徽章（实测 200/`image/svg+xml`）；**CN 网络可达性未验证** `[ASSUMED]` | Pattern 4 / SC-4 | shields.io 在部分网络不可达 ⇒ 徽章变破图；备选：本地 SVG 徽章（仓内已有 `icon.svg` 先例）或省略 |
| A6 | GitHub 仓的 `dsh-plugin` topic 与 MIT 许可被 GitHub 正确识别 | PUB-01/PUB-04 | 实测 API 已返回 `topics` 含 `dsh-plugin`、`license.spdx_id = MIT`，风险极低；若 topic 丢失，catalog CI 不检查它（`contributing.md:83` 是人工要求） |

**If this table is empty:** —（非空，见上）

## Open Questions (RESOLVED)

> 六问全部结案（2026-11-12，plan 定稿前）。逐条 `**Resolution:**` 记在各自条目末尾；`What we know` / `Recommendation` 原文保留为决策依据，不改写。Q1–Q6 的裁决分别落到 D-05 / D-06 / Phase 5 移交 / D-07 / D-08 / 有意的未结案（A2），因此本阶段**没有**遗留的开放问题。

1. **D-03 的字面要求（改 workflow）与推荐解（改 manifest）不一致——需要一次显式确认。**
   - What we know: B 变体（peer → exact `0.2.2-rc.1`）四格实测全绿且 L37 零改动；C 变体（L37 追加显式 pin）同样全绿但有 workflow diff。
   - What's unclear: 用户是否接受「L37 不改也能满足 D-03 的判据」。
   - Recommendation: 采用 B，并在 plan 的决策段写明「D-03 的判据（四格绿 + 无红跑历史）全满足，实现位置由 workflow 移到 manifest」；若用户要求 workflow 必须有 diff，切 C（已实测）。
   - **Resolution: 已由 D-05 结案（用户裁决，2026-11-12）**——采用 B 变体：`package.json` 的 `peerDependencies['@deepseek-ai/dsh-skill-filesystem']` 收紧为 exact `0.2.2-rc.1`，`build/assets/pins.json` 的 `lines.022.peer` 同一次提交内同改，**L37 一字不改**。D-03 的判据（四格绿 + 无红跑历史）不变，变的是实现位置；C 变体不再考虑。落点：03-01 Task 1。

2. **SC-3「install 命令与 README 逐字一致」如何落地。**
   - What we know: catalog 生成的命令**不带版本号**（`dsh plugin --profile web add dsh-gsd`），README 规范命令带精确版本。
   - What's unclear: 是把「无版本形态」写进 README（解法 a），还是把 SC-3 解释为「材料记录生成物即可」（解法 b）。
   - Recommendation: 解法 a——README 增一处无版本示例（不改既有规范命令，不触犯 ③⑤ 哨兵），材料逐字引用该串；同时把「Phase 5 publish 必须设 `latest` tag」列为硬移交项。
   - **Resolution: 已由 D-06 结案（用户裁决，2026-11-12）**——采用解法 a：README 增一处裸名示例（`dsh plugin --profile web add dsh-gsd`），既有带版本号的规范命令逐字不动；`docs/dshmarket/` 材料逐字引用该裸名串。`latest` tag 义务定为硬移交项，落在 03-03 的 Phase 5 移交清单第 ② 条。落点：03-02。

3. **包名抢注窗口。** `dsh-gsd` 在 `registry.npmjs.org` 与 `npmmirror` 双 404（实测 2026-11-12），但真发布在 Phase 5。若他人在此窗口注册同名包，Phase 5 会失败且 `name` 不能改（三处同名是 PROJECT 已锁决策）。
   - Recommendation: 不提前发布（D-02 明令），但 plan 应在 Phase 5 移交里写明「发布前重跑 `npm view dsh-gsd version --registry=https://registry.npmjs.org`，404 才继续」；若已被占用，升级为用户决策（改名 vs 收买/等待）。
   - **Resolution: 结案为 Phase 5 的发布前义务（非本 phase 阻塞项）**——采纳上述 Recommendation，不提前发布（D-02 约束）。义务已铸成 03-03 Task 3 的 Phase 5 移交清单第 ③ 条：发布前重跑 `npm view dsh-gsd version --registry=https://registry.npmjs.org`，仍 404 才继续；若已被占用则升级为用户决策。本 phase 不再追踪此项。

4. **dshmarket 条目要不要配 `icon`。**
   - What we know: 只收 GitHub 托管位图；本仓只有 `icon.svg`（会被拒）。
   - Recommendation: Phase 3 留空（回退作者头像）；若日后要卡片图标，另加一张方形 PNG（如 `assets/icon-180.png`）并从 README 相对链接——注意：该 PNG **不必**进 npm 包，别顺手改 `files`。
   - **Resolution: 已由 D-07 结案（用户裁决，2026-11-12）**——`icon` 保持**空**（回退作者头像）；本 phase 不新增 PNG、不动 `files`、不填 SVG。03-02 的 `docs/dshmarket/pfmiles__dsh-gsd.yml` 明确不写 `icon:` 字段。落点：03-02。

5. **是否追加两项加固（都会新增 workflow diff 或测试计数）。**
   - (i) `compat-matrix.yml` 目前**没有 `permissions:` 块**（实测 L1-44）⇒ `GITHUB_TOKEN` 取仓库默认权限；加 `permissions: {contents: read}` 是最小权限化。
   - (ii) 在 L36-38 的 `run: |` 块内补「解析结果 == `${{ matrix.dsh }}`」的正向断言（02-REVIEW.md:187 已点名建议）。
   - Recommendation: 两项都建议做，但**放在同一次 workflow 改动里**并把计数/结构哨兵一次跑过；若求最小 diff，可只做 (ii)（它直接封堵 `--force` 式假绿）。
   - **Resolution: 已由 D-08 结案（用户裁决，2026-11-12）**——（i）(ii) **两项都做**，同一次 workflow 改动、不新开 `run:` 步骤：顶层 `permissions: { contents: read }`，且正向解析断言写进既有『宿主求值探针（install-ok/reject）』的 `run: |` 块内，门控条件为 `matrix.expect == install-ok`，取值失败 `|| true` 兜住后显式 `exit 2`。matrix 四行与 6 条 `if:` 门零改动。落点：03-01 Task 2。

6. **`pnpm approve` 的真实影响面未验证（见 A2）。** Recommendation: 不阻塞 Phase 3；在 SC-1 的 boot 步骤里观测并记录，Phase 5 UAT-01 定性。
   - **Resolution: 有意保持未结案（`[ASSUMED]`，A2 继续挂在 Assumptions Log）**——这不是遗漏：本 phase 无法先验证明「agent skills 待审批」是否阻断会话内技能可见性，任何本地结论都只是猜测。处置定为**观测 + 如实记录**：03-01 Task 3 的 tarball 安装步骤原样记录安装日志里是否出现 `Agent skills awaiting approval`（不改任何 boot 判据），定性责任移交 Phase 5 UAT-01。本 phase 的判据只到「包内声明齐备」为止。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | 全部（build / tests / dsh） | ✓ | `v24.21.0`（`engines.node >=24`） | — |
| npm | pack / publish 面 / CI 同款通道 | ✓ | `12.2.1` | — |
| pnpm | profile 安装通道 | ✓ | `12.11.2` | — |
| dsh CLI | `plugin add` / `--dump-config` / probe 宿主模块 | ✓ | `0.2.2-rc.1`（与 `engines.dsh` 下界一致） | — |
| git + SSH 远端 | push（SC-5） | ✓ | `origin git@github.com:pfmiles/dsh-gsd.git` | HTTPS（需 `workflow` scope，见 Pitfall 2） |
| gh CLI | push 后读 Actions 结论 | ✓ | `2.103.3`，已登录 `pfmiles`（`gist, read:org, repo`） | `curl https://api.github.com/repos/.../actions/runs`（本会话实测可用） |
| actionlint | workflow 静态校验 | ✓ | `1.7.12` | `npx actionlint`（需网络） |
| jq / curl | 解析 catalog JSON、API | ✓ | `/usr/bin/jq`, `/usr/bin/curl` | node 内置 `fetch` |
| `js-yaml`（仓内） | 严格 YAML 解析 catalog 条目 | ✗ | — | 行级断言（见 Code Examples）；或 `npx --yes js-yaml@4 <file>`（需网络） |
| `semver`（仓内，作为可 import 的依赖） | 任何 semver 断言 | ✗ | — | **不要**引 `semver` 依赖：宿主判定走 `compat-probe`，semver 事实只在研究期用 npm 内置副本验证过（路径不可移植） |
| 干净 profile（新 profile 名） | SC-1 | ✓（可现造） | 同一 `$DSH_HOME` 下新建即可 | 全新 `DSH_HOME`（代价 = 重装 600+ 宿主包，留 Phase 5 UAT-01） |

**Missing dependencies with no fallback:** 无。
**Missing dependencies with fallback:** `js-yaml`（→行级断言 / `npx`）、`semver`（→`compat-probe` 唯一的宿主判定，禁止本地 semver 断言）。

## Validation Architecture

> `.planning/config.json` `workflow.nyquist_validation = true` ⇒ 本节为必需项，`03-VALIDATION.md` 由此派生。

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node 内置 test runner（`node --test`），Node `v24.21.0` |
| Config file | 无配置文件 —— glob 驱动（`node --test tests/*.test.mjs`）；gate A/B/C 由 `tests/run-gates.sh` 提供（`GSD_VERSION` + `GSD_STAGING_ROOT` 双 env，缺失 exit 1） |
| Quick run command | `node --test tests/rewrite-map.test.mjs tests/version.test.mjs tests/compat-matrix.test.mjs`（17 tests，~0.3 s）＋ 纳管后 `node --test tests/pack-contents.test.mjs`（3 tests，~0.1 s） |
| Full suite command | `node --test tests/*.test.mjs`（**29 tests**，5–30 s，含真实构建 smoke；**必须串行**） |

### Phase Requirements → Test Map

| Req ID / SC | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **SC-1**（PUB-01/02 的安装面） | tarball 在干净 profile 装成并 boot | integration（脚本化手工） | `npm pack` → `dsh plugin --profile <clean> add "$PWD/<tgz>"` → `node …/gsd-tools.cjs runtime-identity --raw` = `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` → `dsh --profile <clean> --dump-config \| grep -cE '^\s*- id: (gsd\|gsd-hooks-bridge)$'` = 2 | ❌ Wave 0（需新 profile 名 + 断言串，建议写成 plan 的 verify 步骤） |
| **SC-2**（PUB-02） | pack 清单 = `files` 白名单且含 `scripts/`·`locale/`·`icon.svg`；`.planning/`·`tests/`·`build.mjs` 零泄漏 | unit（静态推导，per-commit） | `node --test tests/pack-contents.test.mjs` → 3/3 | ⚠️ 文件存在但**位置错**（`tests/pending-phase-3/`）且 ROOT 解析错（Pitfall 1）⇒ 移动即用 |
| **SC-2b**（PUB-02 交叉核对） | 静态推导 == 真实 `npm pack` | integration（分钟级，非 per-commit） | `npm pack --dry-run --json --ignore-scripts` → `entryCount 958`、顶层 12 项、leaks 0 | ✅ 命令可跑（本会话实测） |
| **SC-3**（PUB-03） | 提交材料就绪：双语文案、`category=workflow`、字段/文件名/词表合规、install 命令与 README 逐字一致 | unit（行级断言）+ 人工复核 | Code Examples 的 `node -e` 自检 + `grep -F` 比对 README 与材料的 install 串 | ❌ Wave 0（材料文件不存在） |
| **SC-4**（PUB-03/04 的可见面） | README 徽章 + MIT 声明 + 上游致谢 + 互链 | unit（docs-consistency 扩写） | `node --test tests/docs-consistency.test.mjs`（① 现有 7 tests 全绿 + 新增徽章/致谢断言，若 plan 决定加） | ⚠️ 现有 7 tests ✅；徽章断言 ❌ Wave 0（可选） |
| **SC-5**（D-03） | 四格 CI 首跑全绿、无红跑历史 `[ASSUMED]`（本地四格等价已实测；CI 首跑本身不可先验证明，见 A1） | e2e（外部） + 本地等价 | 本地：`for` 循环跑 install+probe（B 变体，见 Code Examples）；externally：`gh run list --workflow=compat-matrix.yml --limit 1` → `conclusion=success` | 本地 ✅（手工命令）；CI 判定在 push 后 |
| **SC-6**（D-04） | `CHANGELOG.md` 首条目成文且版本与 `package.json.version` 等值 | unit | `test -f CHANGELOG.md` + `grep -F '## [1.20.1-1.dsh022] - 2026-11-12'` +（推荐）`node -e` 断言版本等值 | ❌ Wave 0 |
| **INST-06** | `locale/{en,zh}.json` 的 `meta.title`/`meta.description` + `icon.svg` + `files` 收录 | unit | 现有 `node --test tests/pack-contents.test.mjs`（files/icon）+ 新增两行断言（locale 键存在且非空） | ⚠️ 部分覆盖（Wave 0 补 locale 键断言） |

### Sampling Rate

- **Per task commit:** 快速回路 = `node --test tests/rewrite-map.test.mjs tests/version.test.mjs tests/compat-matrix.test.mjs`（17）+ 纳管后 `tests/pack-contents.test.mjs`（3）。改动 workflow 时**必须**加跑 `actionlint .github/workflows/compat-matrix.yml`。
- **Per wave merge:** `node --test tests/*.test.mjs`（29/29，串行；`build-smoke` 会重写构建树，禁止并发）。
- **Phase gate（进 `/gsd-verify-work` 之前）：** 29/29 + `node build.mjs` → `gates: all passed (A/B/C)`、76 trees / 286 files / 72 skills + `node build/lib/check-pins.mjs --offline` exit 0 + 四格 install/probe 全绿 + 真 `npm pack` + 干净 profile 装成判据 + `actionlint` exit 0。push 之后**再加**：`gh run list` 首跑 `success`。

### Wave 0 Gaps

- [ ] `tests/pack-contents.test.mjs`（**从 `tests/pending-phase-3/` 移回**，同时修好 ROOT 解析）— 覆盖 SC-2 / PUB-02
- [ ] `BUILD.md:16` 计数 26/26 → 29/29（唯一活体计数；`02-VALIDATION.md` 的旧数字是历史记录，只追加带日期的前向注记）
- [ ] `CHANGELOG.md` 新建 + 首条目（覆盖 SC-6）；建议同时加一条「CHANGELOG 版本 == package.json.version」断言（挂在 docs-consistency）
- [ ] dshmarket 条目材料（建议 `docs/dshmarket/pfmiles__dsh-gsd.yml` 或 `.planning/phases/03-…/dshmarket/`，plan 定）+ 离线自检命令（覆盖 SC-3）
- [ ] 干净 profile 的安装/boot 复核序（写进 plan 的 verify 段或 `03-VALIDATION.md` 的 Manual-Only 表）— 覆盖 SC-1
- [ ] （可选，Open Question 5）`tests/docs-consistency.test.mjs` 增徽章/致谢断言、`compat-matrix.yml` 加 `permissions:` 与解析正向断言
- [ ] 无新框架安装需求：Node 内置 runner 已足够（`js-yaml`/`semver` 均**不引入**，见 Environment Availability）

## Security Domain

> `.planning/config.json`：`security_enforcement: true`、`security_asvs_level: 1`、`security_block_on: high`。

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | 本 phase 无认证面（gh/npm 认证由既有 CLI 凭据负责） |
| V3 Session Management | no | 无会话状态 |
| V4 Access Control | yes（弱） | CI 最小权限：`compat-matrix.yml` 目前**无 `permissions:` 块**（L1-44 实读）⇒ 建议 `permissions: {contents: read}` |
| V5 Input Validation | yes | 外部输入两处：catalog 条目 YAML（我方产出，用 23 类词表 + 行级断言校验）与 `plugins.json`（对方产出，只读不改） |
| V6 Cryptography | no | 不手写加密；上游完整性用 npm `dist.integrity`/`dist.shasum`（Phase 01 已建双重校验，本 phase 不动） |
| V14 Configuration | yes | `package.json` 的 `files`/`publishConfig`/`private` 决定「哪些字节会发出去」——本 phase 的核心安全面 |

### Known Threat Patterns for {npm 发布面 + 第三方 registry 提交}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 发布面信息泄漏：`.planning/`（阶段计划/UAT/决策）或 `tests/` 进 tarball | Information Disclosure | `files` 白名单 + `tests/pack-contents.test.mjs` 三层断言（宽泛条目/泄漏路径/条目有内容）+ `npm pack --dry-run` 交叉核对。本会话实测 leaks = 0 |
| 上游漂移致「绿在错误解析树」 | Tampering | exact peer pin（B 变体）+ `check-pins --offline` +（建议）解析结果正向断言；禁用 `--force` 作为常规手段 |
| CI token 权限过宽 | Elevation of Privilege | 显式 `permissions: {contents: read}`（当前缺省） |
| 市场条目夸大/失实（描述与代码不符） | Spoofing / Repudiation | 材料里的数字只用可证事实（72 skills、GSD 1.20.1、958 文件）；描述与 README 逐字同源；不写无法自证的形容词（catalog 规则 `contributing.md:85` 明说要与代码核对） |
| 包名抢注（研究期 404，Phase 5 才发布） | Supply Chain | Phase 5 发布前重查双 registry（Open Question 3） |
| GitHub Release 资产链接腐化（若使用 `tarball:` 字段） | — | 不采用该字段（我们发 npm，`contributing.md:119` 的推荐路径） |
| 未固定 action 版本（`@v7` 为可移动 tag） | Tampering | 现状可接受（GitHub 官方 action，L1 级别）；若要更强，改 SHA pin —— 属可选加固，不进本 phase 必做 |

## Sources

### Primary (HIGH confidence)
- `dshmarket@1.73.18` 已发布 tarball（`npm pack dshmarket@1.73.18` → `README.md`、`package.json`、`lib/regions.js`、`lib/registry.js`、`lib/types/registry.d.ts`）— 判明「市场不是目录」、catalog 真源 URL、条目 schema
- `awesome-dsh-plugin/awesome-dsh-plugin@main` 源码（`contributing.md`、`scripts/lib/entries.mjs`、`scripts/check-submission.mjs`、`scripts/card-install-command.test.mjs`、`data/plugins/0-0-user__dsh-plan-note.yml`）— 提交规范、词表、排序、gate 阈值
- `https://awesome-dsh-plugin.com/plugins.json`（实测 14,244,998 B，`count: 10581`，`updated: 2026-11-11`，23 个 `category` 键）— 线上词表与 install 命令实例
- npm 12.2.1 源码（`lib/commands/publish.js`、`node_modules/libnpmpublish/lib/publish.js`、内置 `semver@7.8.5`）— `private`/prerelease tag/semver 边界
- `@deepseek-ai/dsh-plugin-manager@0.2.2-rc.1` `lib/typert.host.js` — INST-06 的 `meta` schema
- dsh CLI 0.2.2-rc.1（`--help`、`lib/plugin-DscIHF4k.js`）— `$DSH_HOME`、`cwd`、`allow-version`
- 本仓实测：`npm pack --dry-run --json --ignore-scripts`（958/12）、四变体 `npm install` + `compat-probe`、pnpm 12.11.2 干净环境装 tarball、`node --test` 各套件
- GitHub API：`repos/pfmiles/dsh-gsd`（created/pushed/topics/license）、`actions/runs`（`total_count: 0`）、`repos/actions/{checkout,setup-node}/releases`（v7 存在）

### Secondary (MEDIUM confidence)
- `https://keepachangelog.com/en/1.1.0/` — CHANGELOG 结构与小节名
- `https://img.shields.io/badge/license-MIT-blue.svg` — 徽章可用性（200，`image/svg+xml`）

### Tertiary (LOW confidence)
- `dsh-plugin-catalog`（宿主 Discover 的 format-1 索引，经 jsDelivr 分发）— 仅见于 `dshmarket` README 的提及，本会话**未**第一手复核其内容；不进入任何必做项
- `dshbase.com`、`Anil-matcha/awesome-dsh-plugin`、`fuyiyun666/awesome-dsh-plugin-2` — 判为不可信 SEO 变体，**未采信**

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — 每个工具的版本都是本机实测字符串，action major 的存在性由 GitHub releases API 实证
- Architecture（含 dshmarket 流程）: **HIGH** — 全部来自已发布 tarball 与目标仓源码，非网页推测；唯一未闭合项是 catalog 侧 CI 的实时行为（已由源码 `check-submission.mjs` 直接读出阈值）
- Pitfalls: **HIGH** — 12 条里 11 条有实测命令/输出，1 条（pnpm approve 影响面）明确标为未验证
- Validation Architecture: **MEDIUM-HIGH** — 命令全部可跑；SC-1/SC-5 的判定含人工/外部步骤，已在表中标明 manual/external

**Research date:** 2026-11-12
**Valid until:** 2026-11-19（7 天）——理由：上游 `@deepseek-ai/*` 在 11-12 一天内就发过 rc.2，peer/registry 面属快变；catalog 词表与提交流程可放宽到 30 天（2026-12-12）。