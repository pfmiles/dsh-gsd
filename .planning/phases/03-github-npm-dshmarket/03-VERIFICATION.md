---
phase: 03-github-npm-dshmarket
verified: 2026-11-12T14:21:06Z
status: passed
score: 13/13 must-haves verified
covered_files: [
  ".github/workflows/compat-matrix.yml",
  ".planning/phases/03-github-npm-dshmarket/03-01-PLAN.md",
  ".planning/phases/03-github-npm-dshmarket/03-01-SUMMARY.md",
  ".planning/phases/03-github-npm-dshmarket/03-02-PLAN.md",
  ".planning/phases/03-github-npm-dshmarket/03-02-SUMMARY.md",
  ".planning/phases/03-github-npm-dshmarket/03-03-PLAN.md",
  ".planning/phases/03-github-npm-dshmarket/03-03-SUMMARY.md",
  "BUILD.md",
  "CHANGELOG.md",
  "README.md",
  "build/assets/pins.json",
  "docs/dshmarket/README.md",
  "docs/dshmarket/pfmiles__dsh-gsd.yml",
  "index.js",
  "package.json",
  "tests/compat-matrix.test.mjs",
  "tests/docs-consistency.test.mjs",
  "tests/pack-contents.test.mjs"
]
covered_digest: "v3:sha256:536f616668c9dcc8ec2c3db99ee2af3a54e75ce35d57f9450af06bbe2a62f98b"
behavior_unverified: 0
overrides_applied: 0
phase_type: infrastructure
decision_coverage: "8/8 honored（check.decision-coverage-verify exit 0，not_honored 空）"
prohibition_flags: 13
prohibition_flag_items:
  - id: P3-01-1
    requirement: PUB-02
    tier: transparency
    verdict: honored（机器证据）
    note: "files 仍 9 条纯字面量；pack-contents ①② 绿；顶层仍收敛于 12 项白名单；无 docs/CHANGELOG/PNG 入包"
  - id: P3-01-2
    requirement: PUB-01
    tier: transparency
    verdict: honored（机器证据）
    note: "仓内 .github + build 的 --force / --legacy-peer-deps 命中数 = 0（本趟 grep 复核）"
  - id: P3-01-3
    requirement: PUB-02
    tier: values
    verdict: honored（评审复核）
    note: "本 phase 对 tests/ 的改动仅两笔：c304c76 纯重命名；32665af/49c0efe 追加式断言（37 > 32 > 29）；既有断言谓词未被放宽"
  - id: P3-01-4
    requirement: PUB-01
    tier: safety
    verdict: honored（机器证据）
    note: "03-01 范围内零对外写入；push 只发生在 03-03 的人审 checkpoint 之后"
  - id: P3-02-1
    requirement: PUB-03
    tier: transparency
    verdict: honored（机器证据）
    note: "catalog 文案仅 72 skills / GSD 1.20.1 / 双语同源表述；pinned 安装命令逐字未删（README 4 处仍在）"
  - id: P3-02-2
    requirement: PUB-04
    tier: values
    verdict: honored（机器证据）
    note: "phase 内 LICENSE 与 THIRD-PARTY-NOTICES.md 零改动（git log d3c8e89..HEAD 仅 phase 1/2 旧提交）；无第二致谢真源"
  - id: P3-02-3
    requirement: PUB-03
    tier: safety
    verdict: honored（机器证据）
    note: "yml 无 icon 键、无自定义字段；package.json files 无 PNG"
  - id: P3-02-4
    requirement: INST-06
    tier: transparency
    verdict: honored（机器证据）
    note: "locale/{en,zh}.json 在 phase 内零改动；⑩ 仍绿（未新增宿主 schema 外字段）"
  - id: P3-02-5
    requirement: PUB-02
    tier: values
    verdict: honored（机器证据）
    note: "01/02 的 VERIFICATION/VALIDATION 与 STATE 历史计数未被回写；唯一改动是 BUILD.md:16 前半句由 26/26 改为实测 32/32→37/37（本 phase 自己的活体计数）"
  - id: P3-03-1
    requirement: PUB-01
    tier: safety
    verdict: honored（经人审授权，附偏离注记）
    note: "计划假设 SSH 可用；实测 key 非账号有效 key。人类在 blocking-human checkpoint 显式授权后改走 HTTPS + gh credential helper，执行器未自行 gh auth refresh；origin 逐字未改写（git remote -v 复核）。残余 scope 见 A-03-02"
  - id: P3-03-2
    requirement: PUB-01
    tier: transparency
    verdict: honored（机器证据）
    note: "真仓 total_count = 1 且 run_attempt = 1；无 rerun、无重推"
  - id: P3-03-3
    requirement: PUB-01
    tier: safety
    verdict: honored（机器证据）
    note: "git ls-files '*.tgz' 空；远端 branches 仅 main（live gh api）；推送为 d3c8e89..20e20c0 快进，无 force-push"
  - id: P3-03-4
    requirement: PUB-01
    tier: values
    verdict: honored（机器证据）
    note: "SC-5 判据由 GitHub Actions run 43218878911 本身给出，本地证据未被用来替代 CI 结论"
known_debt:
  - id: IN-02
    severity: info
    disposition: accepted / won't-fix（03-REVIEW-DISPOSITION 记录）
    must_have_impact: none
    note: "20e20c0 之后的 5 个非 planning 文件（BUILD.md、index.js、tests/{pack-contents,docs-consistency,compat-matrix}.test.mjs）从未在 CI 执行；本地 37/37 与 target 同名套件覆盖，但『CI 对当前树为绿』未被机器观测。再次 push 会产生第二条 run，属人工决策"
  - id: SEC-T-03-14
    severity: info
    disposition: open（文档时效，不改源）
    must_have_impact: none
    note: "03-SECURITY.md 的 T-03-14 注记写『20e20c0..HEAD 差异仅 4 份 .planning 文档』——该结论成立于其审计锚点 cf13915，在 HEAD eba56ec 已不成立（实测 5 个非 planning 文件 + 6 份 planning 文档）。threats_open 计数不受影响"
  - id: A-03-02
    severity: high
    disposition: accepted risk（人类授权，记录在 03-SECURITY.md）
    must_have_impact: none
    note: "gh token 现持 workflow + delete_repo；SECURITY 已给收敛建议（Phase 5 前收 delete_repo 或改 fine-grained PAT）"
  - id: DM-SCHEMA
    severity: info
    disposition: deferred
    must_have_impact: none
    note: "dshmarket 条目形态（data/plugins/pfmiles__dsh-gsd.yml、5 字段、category 闭集）来自离线研究，未对 live awesome-dsh-plugin 仓验证；PR 本体 Phase 5"
  - id: UI-EVIDENCE
    severity: info
    disposition: deferred（非本 phase 缺陷）
    must_have_impact: none
    note: "ui-frontend-evidence.cjs:104 SKIP_DIRS 缺 .gsd-build-tmp，读 gitignored 构建产物给出 found:true；对 NON-UI 本相位无影响，仅未来 frontend 相位需注意"
  - id: SC5-WORDING
    severity: info
    disposition: open（用户未授权改写 ROADMAP）
    must_have_impact: none
    note: "ROADMAP SC-5 仍写『L37 上游漂移修复后 push』；实际修法在 manifest peer，L37 零改动。判据实质（四格绿 / 无红跑历史）成立"
deferred:
  - truth: "会话技能目录出现全部 72 个 gsd-*，且在 live 交互会话中可见"
    addressed_in: "Phase 5（UAT-01）"
    evidence: "REQUIREMENTS.md SKIL-01 仍未勾选；ROADMAP Phase 5 SC-1『UAT-01..05 全绿（干净 DSH_HOME 安装、skills、健康…）』；03-RESEARCH A2 / Open Question 6；03-01-SUMMARY D9 human_judgment:true 的显式移交"
  - truth: "真正的 npm publish（含 dist-tags.latest）/ GitHub Release / dshmarket PR"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 3 goal 与 Phase 5 SC-5『对外动作执行：npm publish + GitHub Release + dshmarket PR 本体』；03-CONTEXT D-02/D-04"
  - truth: "registry 通道安装复验（dsh plugin add dsh-gsd@<ver>）"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 3 SC-1 括注『registry 通道 … 由 Phase 5 复验』；03-CONTEXT D-02"
---

# Phase 3: 发布（GitHub + npm + dshmarket） Verification Report

**Phase Goal:** 发布就绪 —— repo 建仓并推送、packaging 面符合 npm 规范、CI 首绿；真正的 `npm publish` / GitHub Release / dshmarket PR 移交 Phase 5（干净机器 UAT 通过后）执行。
**Verified:** 2026-11-12T14:21:06Z（HEAD `eba56ec`，工作树干净）
**Status:** passed
**Re-verification:** No — initial verification（本 phase 此前无 VERIFICATION.md）

## 验证基调（honest-verifier）

本报告区分三类证据，并在每条 truth 里标明来源：

1. **本趟亲自执行**：`check-pins --offline`；三个静态测试文件串行单进程（25/25：pack-contents 4 + docs-consistency 13 + compat-matrix 8）；`git diff`/`git status`/`git ls-files`；`gh api` 只读复核（远端 main sha、runs、jobs、branches）；直读全部 12 个非 planning 交付文件与 3 套 PLAN/SUMMARY/审计工件。
2. **编排器修复后复验（本会话引用，未重跑）**：`npm pack`（958 文件）→ 全新 profile 安装 → 已安装 `index.js` 的 `skillsDir` 解析到 `.../dsh-gsd/skills`、`exists: true`、**72** 项 → `dsh --profile <fresh> --dump-config` exit 0（`- id: gsd` L368、`- id: gsd-hooks-bridge` L370）。按 hard constraint 不重跑 pack（prepack 递归 + 会改写构建树）。
3. **记录在案的历史实测**：全量 37/37、`node build.mjs` gates A/B/C、`npm pack` 958/12/leaks 0、四格本地等价、actionlint 0 findings、CI run 43218878911 四格全绿。

**不采信 SUMMARY 的结论**：每条 truth 都回到文件内容或机器输出；SUMMARY 只用于定位证据。

## Goal Achievement

### Observable Truths

| # | Truth（must-have 来源） | Status | Evidence（本趟实测 / 直读 / 记录） |
| - | ----------------------- | ------ | ----------------------------------- |
| 1 | **SC-1** `npm pack` 的 tarball 在干净 profile 装成并 boot；packaging 面真能装 | ✓ VERIFIED | 修复后复验：958 文件 tarball → 新 profile 安装 → 已安装 `index.js`（直读：`const pluginRoot = dirname(fileURLToPath(import.meta.url))`）解析 `skillsDir` 到 `.../dsh-gsd/skills`，`exists: true`，72 项；`--dump-config` exit 0 且 `gsd` / `gsd-hooks-bridge` 两行各 1。**注**：这是「装成 + boot 配置」判据；live 交互会话内的技能可见性未观测，属 Phase 5 UAT-01（见 Deferred 1） |
| 2 | **SC-2** pack 清单 = `files` 白名单，且含 `scripts/`、`locale`、`icon`；开发期路径零泄漏 | ✓ VERIFIED | 直读 `package.json`：`files` 9 条纯字面量（index.js / cordis.patch.yml / locale / icon.svg / skills / gsd-core / hooks / config / scripts）；本趟 pack-contents 4/4（①包含方向、②顶层收敛 12 项 + `.planning/`/`tests/`/`build/`/`.github/` 零出现、③条目有内容）；记录在案真实 `npm pack` = 958 文件 / 12 顶层 / 4.58 MB / leaks 0 |
| 3 | **SC-3** dshmarket 提交材料就绪（双语、category=workflow、install 命令与 README 逐字一致）+ 流程查实 | ✓ VERIFIED | 直读 `docs/dshmarket/pfmiles__dsh-gsd.yml`：url/name/category/description.{en,zh} 共 5 字段、`category: workflow`、无 icon；本趟 docs-consistency ⑪（schema）⑫（README 整行恰 2、zh/en 各 1、dshmarket 1、byte 相等、`dsh-gsd@latest` 零出现）绿；流程（目标仓/路径/CI 四检）记录于 03-RESEARCH + `docs/dshmarket/README.md`。**残余**：未对 live 目标仓验证 schema（Phase 5 提 PR 时即验证，见 known_debt DM-SCHEMA） |
| 4 | **SC-4** README 徽章 / LICENSE(MIT) / 上游致谢齐备 | ✓ VERIFIED | 直读 README 顶部：`[![license: MIT](badge)](./LICENSE)` 与 DSH 徽章两枚都在 `<!-- generated-by -->` 与首个 `# dsh-gsd` 之间（`grep -c '^# dsh-gsd$'` = 2，双语边界未被切歪）；本趟 docs-consistency ⑨ 绿（恰 2 枚、位置、zh/en 各含 `MIT` 与 `THIRD-PARTY-NOTICES.md`）；LICENSE 与 THIRD-PARTY-NOTICES.md phase 内零改动 |
| 5 | **SC-5** CI 首次激活 run 全绿，无红跑历史 | ✓ VERIFIED | 本趟 live `gh api repos/pfmiles/dsh-gsd/actions/runs` → `total_count: 1`，唯一 run `43218878911` / `event: push` / `run_attempt: 1` / `conclusion: success` / `head_sha: 20e20c0…`；`/jobs` → 4/4 `success`（两格 install-ok、两格 reject）；`commits/main` → `20e20c0…`；`branches` → `["main"]`。**caveat**：绿跑只覆盖到 20e20c0（见 known_debt IN-02），且 ROADMAP SC-5 的「L37」措辞已陈旧（SC5-WORDING），判据实质成立 |
| 6 | **SC-6** CHANGELOG.md 首个条目成文（对应 1.20.1-1.dsh022） | ✓ VERIFIED | 直读 `CHANGELOG.md`：`## [1.20.1-1.dsh022] - 2026-11-12`，小节仅 Added/Changed/Fixed（六类闭集内），导语写明「tag 名 = 版本串、不加 v 前缀、Release 正文取本文件」；`### Changed` 载明 peer 收紧与 rc.2/0.2.2 转正时抬 peer 的维护义务；本趟 ⑧ 绿（版本与 `package.json.version` 等值）；该文件不在 `files` 内 |
| 7 | **03-01 T1 / D-05** peer 收紧为 exact `0.2.2-rc.1` 且 manifest + pins 同构；`engines.dsh` / `dshRange` / README 窗口串逐字不动 | ✓ VERIFIED | 直读 `package.json`：`peerDependencies["@deepseek-ai/dsh-skill-filesystem"] === "0.2.2-rc.1"`；`pins.json:12` `lines.022.peer === "@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`；`engines.dsh` 仍 `>=0.2.2-rc.1 <0.3.0-0`、`lines.022.dshRange` 同值未动；本趟 `node build/lib/check-pins.mjs --offline` → exit 0、末行 `pins: all consistent (line dsh022)`；compat-matrix ② 绿 |
| 8 | **03-01 T2** npm 通道上收紧后的 manifest 干净解析，install-ok 探针通过 | ✓ VERIFIED | 独立于本地记录：CI 的两个 install-ok 格（0.2.2-rc.1 × 1.20.1 / 1.19.0）在 GitHub runner 上执行 `npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.2-rc.1` + 门控解析断言 + `compat-probe --expect install-ok`，job conclusion = success（本趟 live 复核）；记录在案的本地副本实测为 656 packages 全树 dedupe 到 0.2.2-rc.1 |
| 9 | **03-01 T3 / D-08** workflow 顶层最小权限 + install-ok 格门控正向解析断言，且未新增步骤（`run:` 仍 4） | ✓ VERIFIED | 直读 `.github/workflows/compat-matrix.yml`：L10-11 `permissions:` / `contents: read`；断言写在既有「宿主求值探针」`run: \|` 块内，`if [ "${{ matrix.expect }}" = "install-ok" ]; then` 门控，`RESOLVED` 取值失败用 `\|\| true` 兜住后 `exit 2`；`^  run:` 计数 4；本趟 compat-matrix 8/8 绿 |
| 10 | **03-01 T4/T5** pack 防线纳入 `tests/` 且待迁目录消失；串行单次全量与 `BUILD.md:16` 等值 | ✓ VERIFIED | `tests/pack-contents.test.mjs` 在 `tests/`（`ls tests/pending-phase-3` → No such file or directory）；本趟 4/4 绿（含 ④ 安装形态 pluginRoot 守卫 = CR-01 回归门）；`tests/` 六文件 `test()` 计数 2+8+13+4+7+3 = **37**，`BUILD.md:16` 写「预期 37/37」；`git status` 干净（无并发污染） |
| 11 | **03-02 T1** manifest 元数据补全，其余字段零漂移（PUB-03） | ✓ VERIFIED | 直读 `package.json`：`repository`/`homepage`/`bugs`/`keywords`(7)/`author`/`publishConfig.registry=https://registry.npmjs.org/` 均在；`version 1.20.1-1.dsh022`、`private: true`、`license: MIT`、`files` 9、`engines`、`dependencies` 两 exact、`peer` exact、`icon`、`exports`、`dsh.bundle`、`scripts` 均与契约一致；本趟 docs-consistency ⑥⑬ 绿 |
| 12 | **03-02 T6** docs-consistency ⑧⑨⑩（及后补 ⑪⑫⑬）全绿；`BUILD.md:16` 按实测写 N/N | ✓ VERIFIED | 本趟 `node --test --test-concurrency=1 tests/docs-consistency.test.mjs` → **13/13 pass**；⑧ 版本等值、⑨ 徽章/致谢、⑩ INST-06（locale 双语 + icon 双通道 + files 收录）、⑪⑫ dshmarket/install 串、⑬ manifest 元数据；`BUILD.md:16` = 37/37 与实测计数等值 |
| 13 | **03-03 T1-T4** 四格本地等价 + 两档 GSD 构建 + push 只推 main/不 force；远端 main == 被推 sha 且 workflow 已上远端 | ✓ VERIFIED | 数字等价由 CI 独立复现（4 格 × 6 步 success，GSD 轴 1.20.1/1.19.0 各自 build + 全量测试）；本趟 live：`commits/main` = `20e20c0`（== push 输出目标 == CI head_sha）、`branches` 仅 `main`、`total_count` 1（无 force/重推痕迹）、`git ls-files '*.tgz'` 空、`origin` 仍 `git@github.com:pfmiles/dsh-gsd.git`（`git remote -v` 前后一致）。**偏离**：SSH 实测不可用，实际通道 = HTTPS + gh credential helper，经人审 checkpoint 授权；`git fetch origin` 不可执行，改以 `gh api` 权威复核 |

**Score:** 13/13 truths verified（0 present-but-behavior-unverified；0 override）。

> 说明：`03-VALIDATION.md` 登记的 Manual-Only 安装/boot 复核序对应 truth #1，已在修复后复验；其「会话内可见性」半条被有意移出本 phase 判据（Deferred 1）。

### Deferred Items（Step 9b —— 后续 phase 明确承接，不影响状态）

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | 会话技能目录出现全部 72 个 `gsd-*`，并在 **live 交互会话**中可见 | Phase 5 UAT-01 | REQUIREMENTS.md `SKIL-01` 仍未勾选；ROADMAP Phase 5 SC-1「UAT-01..05 全绿（干净 DSH_HOME 安装、skills、健康…）」；03-RESEARCH A2 / Open Question 6；03-01-SUMMARY D9 `human_judgment: true` 的显式移交 |
| 2 | 真正的 `npm publish`（含 `dist-tags.latest`）/ GitHub Release / dshmarket PR 本体 | Phase 5 | ROADMAP Phase 3 goal + Phase 5 SC-5；03-CONTEXT D-02 / D-04 |
| 3 | registry 通道安装复验（`dsh plugin add dsh-gsd@<ver>`） | Phase 5 | ROADMAP Phase 3 SC-1 括注；03-CONTEXT D-02 |

### Requirement ID 交叉核对

ROADMAP 指派给 Phase 3 的 5 个 ID **全部**被 plan frontmatter 声明（03-01: PUB-01/02；03-02: PUB-03/04/INST-06；03-03: PUB-01），**无 ORPHANED**。REQUIREMENTS.md 中 5 条均 `[x]`。

| Requirement | 声明计划 | 描述（REQUIREMENTS.md） | Status | Evidence |
| ----------- | -------- | ---------------------- | ------ | -------- |
| PUB-01 | 03-01, 03-03 | GitHub 仓 `pfmiles/dsh-gsd` 建仓并推送，repo 名 = npm 包名；npm 首发推迟 Phase 5 | ✓ SATISFIED | 远端 live：`commits/main` 20e20c0、`branches` 仅 main、`total_count` 1（绿）；repo 名与 `package.json.name` 同为 `dsh-gsd`；npm 首发按 D-02 未执行 |
| PUB-02 | 03-01 | `prepack` = 全量重建，`files` 白名单精确（含 `scripts/`） | ✓ SATISFIED | 直读 `scripts.prepack = "node build.mjs && node --test tests/*.test.mjs"`；pack-contents 4/4（含包含方向）；真实 pack 958/12/leaks 0；`scripts` 在 `files` 且非空 |
| PUB-03 | 03-02 | dshmarket 提交材料与流程就绪（双语、category=workflow、install 命令真实）；PR 本体 Phase 5 | ✓ SATISFIED | ⑪⑫ 绿；yml 5 字段、无 icon；`docs/dshmarket/README.md:16` 与 README:27/100 逐字同串；流程见 RESEARCH/README（live schema 验证 deferred） |
| PUB-04 | 03-02 | LICENSE（MIT）+ 上游致谢（GSD/DSH/第三方各自许可） | ✓ SATISFIED | `license: MIT` + `LICENSE` 首行 `MIT License`；⑨ 绿（双语各含 MIT 与 THIRD-PARTY-NOTICES 链接）；两份文件 phase 内未改（D-01 确认现状） |
| INST-06 | 03-02 | 插件管理器展示元数据合规（locale 双语、icon.svg、files 白名单） | ✓ SATISFIED | ⑩ 绿（`meta.title`/`meta.description` 双语非空、title 双边相等、`pkg.icon` + `exports['./icon']`、files 收录 locale 与 icon.svg）；locale 文件 phase 内零改动 |

### Required Artifacts

`gsd_run query verify.artifacts` 三计划全部 exit 0：03-01 **4/4**、03-02 **7/7**、03-03 **1/1**（`all_passed: true`）。均经本趟实读，非仅存在性：

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `package.json` | peer exact + 元数据 + publishConfig | ✓ VERIFIED | 85 行全文直读；无 stub、无 TODO |
| `build/assets/pins.json` | 行↔pin 单一真源 | ✓ VERIFIED | `lines.022.peer` 与 manifest 逐字同构；`dshRange` 未随 peer 收紧 |
| `.github/workflows/compat-matrix.yml` | permissions + 门控断言 + 4 格 6 步 | ✓ VERIFIED | 直读全文；4 格未动、`run:` 4 条、断言在块内 |
| `tests/pack-contents.test.mjs` | 发布面静态防线 + CR-01 守卫 | ✓ VERIFIED | 本趟 4/4；④ 在安装形态下真求值 pluginRoot/skillsDir |
| `CHANGELOG.md` | 首条目 + 发布约定 | ✓ VERIFIED | 20 行全文直读；§见 truth #6 |
| `README.md` | 徽章 + 裸名示例 + Phase 5 时间线 | ✓ VERIFIED | 徽章在首标题前、`# dsh-gsd` 恰 2、裸名行 zh/en 各 1、pinned 4 处、`@latest` 0 处、状态文案已改 Phase 5 |
| `docs/dshmarket/pfmiles__dsh-gsd.yml` | 5 字段 catalog 条目 | ✓ VERIFIED | 直读 6 行；无 icon、无自定义键、category=workflow |
| `docs/dshmarket/README.md` | 提交说明 + 逐字 install 串 | ✓ VERIFIED | 直读；L16 裸名串与 README 字节相等 |
| `BUILD.md` | :16 实测计数 | ✓ VERIFIED | `:16` = 37/37；其余章节 phase 内零 diff（03-02 记录） |
| `tests/docs-consistency.test.mjs` | ⑧⑨⑩⑪⑫⑬ | ✓ VERIFIED | 本趟 13/13 |
| `tests/compat-matrix.test.mjs` | ②-⑧ workflow 结构/门控哨兵 | ✓ VERIFIED | 本趟 8/8 |
| `index.js` | 包根解析（CR-01 修复）+ 72 技能 provider | ✓ VERIFIED | 直读：`pluginRoot = dirname(fileURLToPath(import.meta.url))`；`FileSystemSkillProvider({ customSkillDirs: [skillsDir] })`；修复在 49c0efe |

### Key Link Verification

`verify.key-links` 的机器结果必须如实拆开看：**3/10 verified**，其余 7 条返回
`"Source file not found (from: must be a relative file path)"` —— 这是 **`from` 写成散文标签导致的输入不可评估**，不是 wiring 断开（detail 自己点明「must be a relative file path」）。本趟逐条手工回溯，10/10 连接成立：

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `package.json` peerDependencies | `build/assets/pins.json` `lines.022.peer` | check-pins 步骤 (j) 逐字比较 | ✓ WIRED | 本趟 exit 0 `pins: all consistent (line dsh022)`；compat-matrix ⑥ spawn 同一脚本 |
| workflow 门控断言 | npm 解析树里的 `dsh-skill-filesystem` version | `require.resolve` + 与 `matrix.dsh` 比对 | ✓ WIRED（手工） | 直读 L42-L49；CI 两格 install-ok success 证明执行路径 |
| `tests/pack-contents.test.mjs` | `package.json` `files` | `simulatePack()` + `ALLOWED_TOP_LEVEL` | ✓ WIRED（CLI 已证） | `verify.key-links` verified=true |
| `README.md` 裸名示例 | `docs/dshmarket/README.md` install 串 | 两侧整行 byte 相等 | ✓ WIRED（手工） | ⑫ 绿；`grep -F` 两侧命中 |
| `CHANGELOG.md` 首条目版本 | `package.json.version` | docs-consistency ⑧ | ✓ WIRED（手工） | 本趟 ⑧ 绿两大版本等值 |
| `BUILD.md:16` 计数 | `node --test` 实测输出 | 按实测写 N/N | ✓ WIRED（手工） | 37 与六文件计数和等值 |
| `docs/dshmarket/*.yml` | awesome-dsh-plugin 词表 | 离线行级正则 | ✓ WIRED（CLI 已证） | verified=true |
| workflow `push: branches [main]` | GitHub Actions 首个 run | 推送触发 | ✓ WIRED（手工） | run 43218878911 event=push / head_sha=20e20c0 |
| 本地四格等价 | CI 四格 | 同源两行命令 | ✓ WIRED（手工） | CI 4/4 success；命令逐字同源（yml vs PLAN） |
| `gh run list` conclusion | ROADMAP SC-5 | `conclusion=success` + `total_count=1` | ✓ WIRED（手工） | 本趟 live `gh api` 双值复核 |

> ℹ 建议（非本 phase 缺陷）：plan frontmatter 的 `key_links.from` 用文件路径字面量（而非「package.json（peerDependencies）」这类标签），否则该 verb 只能覆盖 3/10。

### Data-Flow Trace

不适用（infrastructure 相位，无渲染 / 无动态数据）。等价的「真值→消费方」链路已由 Key Link 表覆盖：`pins.json` → `package.json` → workflow 格 → 文档窗口串，每层都有机器强制方（check-pins / compat-matrix ② / docs-consistency ②）。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| CR-01 回归：安装形态下 pluginRoot 必须是包目录 | `node --test --test-concurrency=1 tests/pack-contents.test.mjs` | 4/4 pass（④ 40.5ms） | ✓ PASS |
| 发布面元数据/文档/条目守卫 | `node --test --test-concurrency=1 … tests/docs-consistency.test.mjs` | 13/13 pass | ✓ PASS |
| workflow 结构与门控哨兵 | `node --test --test-concurrency=1 … tests/compat-matrix.test.mjs` | 8/8 pass | ✓ PASS |
| pin 强等值 | `node build/lib/check-pins.mjs --offline` | exit 0，`pins: all consistent (line dsh022)` | ✓ PASS |
| CI 首跑结论 | `gh api repos/pfmiles/dsh-gsd/actions/runs` | `total: 1` / success / attempt 1 / head 20e20c0 | ✓ PASS |
| CI 四格 | `gh api …/runs/43218878911/jobs` | 4/4 `success` | ✓ PASS |
| 远端权威 sha | `gh api …/commits/main --jq .sha` | `20e20c0283f764864474b7d6a2dfd48f22a0c6b9` | ✓ PASS |
| 远端分支面 | `gh api …/branches --jq '[.[].name]'` | `["main"]` | ✓ PASS |

三个测试文件合计 25 tests，耗时 294 ms，无构建树重写；**全量 37/37 采信编排器实测**（未重跑，遵 hard constraint：`build-smoke` 会重写构建树）。

### Probe Execution

N/A —— 仓内无 `scripts/*/tests/probe-*.sh`，三份 PLAN 也未声明 probe 资产（`ls` 与 grep 双确认）。安装/boot 类一次性验证按 Manual-Only 口径处理（truth #1）。

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
| --------- | ---------- | ------ | ------- | -------- | --------------- | ------- |
| `tests/pack-contents.test.mjs` | PUB-02 / SC-1 | 4 | 0 | 否 | 值 + 行为（子进程真求值） | ✓ |
| `tests/docs-consistency.test.mjs` | PUB-03 / PUB-04 / INST-06 | 13 | 0 | 否 | 值（deepEqual / 正则等值） | ✓ |
| `tests/compat-matrix.test.mjs` | PUB-01 / PUB-02 | 8 | 0 | 否 | 结构 + 值 | ✓ |
| `tests/build-smoke.test.mjs` | PUB-02（构建链） | 2 | 0 | 否（跑真实 build 后断言 gates，非自产期望值） | 行为 | ✓ |
| `tests/version.test.mjs` / `tests/rewrite-map.test.mjs` | VER-02 / VER-04（前序） | 10 | 0 | 否 | 值 | ✓ |

**Disabled tests on requirements:** 0（`describe|it|test .skip|.todo|.only` 全仓 0 命中）→ 无 BLOCKER。
**Circular patterns detected:** 0 —— 期望值来自 `package.json` 字面量、闭集词表、pins 与固定版本串；`build-smoke` 只断言真实构建的 exit/output 契约。
**Insufficient assertions:** 0 —— 需求要求的量（白名单/等值/逐字一致）均以值级断言覆盖；SC-1 的安装/boot 属 Manual-Only（有意，非缺失）。
**变异证据（记录在案，本趟未重跑）:** ⑧⑪⑫⑬ 与 workflow ⑧ 各做过「注入变异 → 单条转红 → 还原」；④ 由 REVIEW-DISPOSITION 记录为「重新引入 `'..'` → 恰 ④ 红（4 tests / 1 fail），复原 4/4」。

### Decision Coverage（CONTEXT D-01..D-08）

`gsd_run query check.decision-coverage-verify` → exit 0，`total: 8 / honored: 8 / not_honored: []`，message「All trackable CONTEXT.md decisions are honored by shipped artifacts.」逐条落点：D-01（LICENSE 未改）· D-02（未 publish/Release/PR）· D-03+D-05（peer 两文件、L37 零改动）· D-04（CHANGELOG 成文、Release 草稿在导语）· D-06（裸名示例 + pinned 未动）· D-07（catalog 无 icon）· D-08（permissions + 门控断言同一次改动）。

### Prohibitions（13 条 must-NOT）

13 条全部逐条对照证据判定为 **honored**，无被违反或「无强制方」的条目；明细见 frontmatter `prohibition_flag_items`。唯一需要人读的是 **P3-03-1**：计划假设 SSH 可用并禁止自行提权 —— 实测 SSH key 非账号有效 key，人类在 `checkpoint:decision` 显式授权 `gh auth refresh -s workflow -s delete_repo` 后改走 HTTPS；执行器未自行 refresh、origin 未改写、无 force-push，故其**意图（不得绕过人裁决）**成立，通道偏离与 token 残余 scope 已记入 03-SECURITY（T-03-11 / A-03-02）。按「经人审授权的偏离 + 有审计记录」判 honored，而非 flag。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `.planning/ROADMAP.md` | 98 / 115 | `**Plans**: TBD`（Phase 4 / Phase 5 尚未规划） | ℹ Info | 非本 phase 交付面；ROADMAP 对未来相位的标准占位形态，不构成完成度不可审计。本 phase 三份 plan 均 `[x]` |
| 其余 12 个交付文件 | — | TBD/FIXME/XXX/PLACEHOLDER/禁用测试 | — | 0 命中（本趟 grep） |

### 残余与遗留（如实入账，不改变 verdict）

1. **live 会话技能可见性从未观测** —— 只验到「安装形态路径解析 + 包内 72 项 + boot 配置」。判为 **Phase-5 handoff**（Deferred 1），理由：Phase 3 的 SC-1 与三份 PLAN 的 must_have 把验收定为「装成并 boot」，live 可见性属 `SKIL-01` / `UAT-01`，二者至今未勾选且被 ROADMAP Phase 5 明确承接；Step 9b 的显式承接项不影响状态。若把它升为 `human_needed`，等于用 Phase 5 的判据 gate Phase 3，与 D-02 的分期契约冲突。
2. **dshmarket 目标仓 schema 未对 live 仓验证** —— 条目形态来自离线研究；PR 本体在 Phase 5，届时 schema 校验即发生（known_debt DM-SCHEMA）。
3. **Token scope 残余（A-03-02，security `high` accepted）** —— `workflow` + `delete_repo` 现挂在 token 上；SECURITY 已给收敛建议（Phase 5 前收 `delete_repo` 或换 fine-grained PAT）。属人类已裁决的接受风险。
4. **20e20c0 之后的提交未跑过 CI（IN-02）** —— 5 个非 planning 文件（`index.js`、`BUILD.md`、3 个测试）在 `49c0efe` / `32665af` 后从未进 CI；本地 37/37 覆盖同名套件，但「CI 对当前树为绿」无机器观测。再推一次会产生第二条 run ⇒ 人工决策，不是缺陷。
5. **ROADMAP SC-5 措辞陈旧** —— 仍写「L37 上游漂移修复后 push」；实际修法在 manifest peer、L37 零改动。判据实质（四格绿 + 无红跑历史）成立；用户未授权改写 ROADMAP。
6. **UI 门潜在缺陷** —— `ui-frontend-evidence.cjs:104` 的 `SKIP_DIRS` 缺 `.gsd-build-tmp`，且 plan gate 先短路，reader 会从 gitignored 构建产物返回 `found:true`。本相位 NON-UI，无影响；未来 frontend 相位需注意。
7. **03-SECURITY.md T-03-14 注记在 HEAD 已过时** —— 其「20e20c0..HEAD 差异仅 4 份 .planning 文档」在审计锚点 cf13915 成立，但 HEAD 实测为 6 份 planning 文档 + 5 个非 planning 文件。`threats_open: 0` 不受影响；属文档时效（known_debt SEC-T-03-14），本会话无权改该工件。

### Human Verification Required

N/A —— Infrastructure/foundation 相位（发布管线 / 打包 / CI / 文档），无用户可交互元素；所有 Phase 3 验收判据均以命令输出或文件内容判定。唯一「需要人看」的事项（live 会话技能可见性）已按 Step 9b 归入 Phase 5 UAT-01，不是本 phase 的未验证 must-have，故不产生 `human_needed`。

### Gaps Summary

无 gap。6 条 ROADMAP Success Criteria 全部满足；13 条 must-have truths 全部 VERIFIED；12/12 交付工件存在、实质、接线；13 条禁令全部 honored；0 个 blocker 反模式；decision coverage 8/8；security `threats_open: 0`（block_on high）；validation `validated` + `nyquist_compliant: true`；review disposition 5 fixed / 1 skipped / 0 open。上述 7 条残余均已登记且不构成 must-have 失败。

---

_Verified: 2026-11-12T14:21:06Z_
_Verifier: Claude (gsd-verifier)_