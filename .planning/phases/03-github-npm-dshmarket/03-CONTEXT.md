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
- **Success Criteria（修订后，必须全真）**：
  1. `npm pack` 产出的 tarball 在干净 profile 装成并 boot（`dsh plugin add ./<tarball>`）；registry 通道（`dsh plugin add dsh-gsd@<ver>`）留 Phase 5
  2. npm pack 清单 = `files` 白名单，且含 `scripts/`、`locale/`、`icon.svg`
  3. dshmarket 提交材料就绪（双语文案、`category=workflow`、install 命令与 README 逐字一致）+ 提交流程已查实；PR 本体留 Phase 5
  4. CI 首次激活 run 全绿（4 格 × 六步 gated steps，无红跑历史）
  5. `CHANGELOG.md` 首个条目成文（D-04）

**不在本 phase**：`npm publish` / GitHub Release / dshmarket PR 本体（→ P5）、迁移 runbook 与差异表（→ P4）、干净机器 UAT（→ P5）。
</domain>

<decisions>
## Implementation Decisions

以下四条为**用户裁决**（2026-11-12），planner 必须逐条映射进 plan，不得重新论证：

### D-01 License = MIT（PUB-04 改写）

- 全仓**已**以 MIT 落地：`LICENSE` 首行 `MIT License`（`Copyright (c) 2026 pf_miles`）、`package.json:15` `"license": "MIT"`。
- **PUB-04 与 `PLAN.md:46` 的 Apache-2.0 是过期表述，以本裁决为准。** PUB-04 改写为「LICENSE（MIT）+ 上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）」。
- **不做**：不改 `LICENSE` 文件、不改 `package.json` 的 `license` 字段。`THIRD-PARTY-NOTICES.md` 记录的是各上游自己的许可，不受本裁决影响，不动。
- 已知缺陷（顺带修正）：PUB-04 原文 `GSD MИT` 中的 `И` 是 U+0418 西里尔大写字母，非 ASCII `I` —— 任何 `grep MIT` 式一致性检查都会漏掉它。改写条目时一并修真。

### D-02 对外发布推迟到 Phase 5

- 本 phase **不执行** `npm publish`、**不**建 GitHub Release、**不**提 dshmarket PR。
- Phase 3 产出「发布就绪」：发布面无阻塞 + 本地 tarball 可装 + CI 首绿。
- Phase 5 在干净机器 8 项 UAT（UAT-01..06）通过后执行：`npm publish` → GitHub Release → dshmarket PR → 1.0 收官。
- **推论**：PUB-01 的"npm 发布"、PUB-03 的"PR 已开"从 Phase 3 判据降级为 Phase 5 动作；本 phase 保留二者的**准备**部分。registry 安装验证（原 Success Criterion 1）在 Phase 3 用 tarball 等价替代，Phase 5 用真 registry 复验。

### D-03 先修 L37 再 push

- 顺序锁定：修 `compat-matrix.yml` L37 上游漂移 → 本地 4 格验证绿 → `git push`（当前领先 origin **84** 提交）→ CI 首跑即绿。
- **约束继承（Phase 02 用户裁决，不得违反）**：
  - `--force` 可用（两向探针实测绿）；
  - **`--legacy-peer-deps` 禁用**（跳过 host peer → 缺 `dsh-app-boot` → probe exit 1 `cannot resolve the DSH host boot module`）；
  - 上界陷阱：`<0.2.2-rc.2-0` **排除不了** rc.2（rc.2 < rc.2-0）；
  - 候选方案 = exact peer 或 `<0.2.2-rc.2`。
- 判据：push 后 Actions 首次 run 全绿，**不留红跑历史**。

### D-04 CHANGELOG + GitHub Release 纳入

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
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 规划与需求
- `.planning/ROADMAP.md` — Phase 3 goal / success criteria / requirements 指派（含 D-02 修订须在此落地）
- `.planning/REQUIREMENTS.md` — PUB-01..04、INST-06 原文（PUB-04 有 U+0418 缺陷）
- `.planning/PROJECT.md` — 技术上下文、已决事项（命名、引擎嵌入、category=workflow）、约束
- `.planning/STATE.md` — 已锁决策、上游漂移裁决、并发纪律、84 提交未推

### 发布面现状
- `package.json` — `private: true`、`license: MIT`、`version: 1.20.1-1.dsh022`、`files` 白名单、`prepack = build && test`、`engines.dsh`（直接改造对象）
- `LICENSE` — MIT 全文（D-01 的落地物，不改）
- `locale/en.json`、`locale/zh.json`、`icon.svg` — INST-06 元数据现状
- `THIRD-PARTY-NOTICES.md` — 上游致谢（GSD MIT / DSH MIT / 第三方各自许可）
- `README.md` — 安装/升级/回滚命令原文（Success Criterion 3 的"install 命令真实"的比对基准）
- `CHANGELOG.md` — **不存在**，本 phase 新建

### 构建与 CI
- `build.mjs` + `BUILD.md` — 构建四档 / gates / exit 0-1-2 / 计数现状
- `.github/workflows/compat-matrix.yml` — L37 漂移修复点；4 格 × 六步结构
- `build/assets/pins.json` + `build/lib/check-pins.mjs` — 行↔pin 真源与校验入口
- `tests/pending-phase-3/pack-contents.test.mjs` + 同目录 `README.md` — 待纳管的发布面防线

### 背景
- `SPIKE.md` — 宿主机制证据（bundle 声明、零安装脚本约束、pnpm 生命周期拦截）
- `PLAN.md` — P3 发布清单原文（注意其 Apache-2.0 表述已被 D-01 推翻）
</canonical_refs>

<specifics>
## Specific Ideas

### 已查实的事实（planner 不必重查，但可复核）

- **npm 名 `dsh-gsd` 未被占用**：`npm view dsh-gsd version` → `E404`（2026-11-12 实测）。
- **`dshmarket` 是 npm 包**：`dshmarket@1.73.18`，描述 "Visual plugin market inside DeepSeek Harness — browse, search, and one-click install community plugins." 即它**本身是一个 DSH 插件（市场 UI）**，不是独立的 registry 服务。PUB-03 的 "curated registry" 指这个插件的收录清单。
- **DSH 侧元数据消费方就在本机**：`@deepseek-ai/dsh-client-ui-plugin-manager`、`dsh-client-ui-plugin-market`、`dsh-client-ui-plugin-recommendations`、`dsh-plugin-manager@0.1.6-alpha.2`。
- **GitHub 仓已建**：`origin = git@github.com:pfmiles/dsh-gsd.git`；当前本地 ahead 84、未 push，CI 从未跑过。
- **不可信来源警告**：检索 dshmarket 流程时 web 结果全是互相矛盾的 SEO 变体（`dshbase.com`、`Anil-matcha/awesome-dsh-plugin`、`fuyiyun666/awesome-dsh-plugin-2` 等），**无可信 spec** —— 以 tarball 实读为准，不采信这些来源。

### 现状锚点

- `package.json`：`private: true`（阻碍发布）、`version: 1.20.1-1.dsh022`、`files` 已含 `index.js cordis.patch.yml locale icon.svg skills gsd-core hooks config scripts`、`prepack: node build.mjs && node --test tests/*.test.mjs`。
- 测试锚点：`npm test` = `node --test tests/*.test.mjs` = 5 文件 / **26 tests**；纳管 `pending-phase-3` 后应为 **29**。
- ROADMAP 已预列三条 plan 方向：`建仓`、`prepack 校验`、`发布 + registry PR` —— D-02 后第 3 条须重切为"材料就绪"。
- 并发纪律（STATE 已锁）：`build-smoke.test.mjs` 重写构建树，**禁止与其他测试/build 并跑**，否则假红 `gate C: no SKILL.md under skills/gsd-*`。
</specifics>

<requirements_amendments>
## Requirements 修订建议（待确认）

D-01 与 D-02 使两行需求与现状矛盾，建议按下表改写（**提案，尚未落盘**）：

| 行 | 现文 | 建议改为 |
|---|---|---|
| PUB-01 | `GitHub 仓库（dsh-gsd）+ npm 发布，repo/npm/registry 三处同名` | `GitHub 仓库（pfmiles/dsh-gsd）建仓并推送，repo 名与 npm 包名同名；npm 首次发布推迟到 Phase 5（UAT 通过后）执行` |
| PUB-04 | `LICENSE（Apache-2.0）与上游致谢（GSD MИT、DSH MIT、第三方组件各自许可）` | `LICENSE（MIT）与上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）`（顺带修 U+0418） |

连带影响：ROADMAP Phase 3 的 Goal 行"…三处同名 dsh-gsd 上线，市场可搜可装"与 Success Criterion 1/3 需按 `<domain>` 的修订版同步；PUB-01 的"npm 发布"分量应移到 Phase 5 的需求清单。
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