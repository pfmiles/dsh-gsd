---
phase: 03-github-npm-dshmarket
verified: 2026-11-13T02:55:49Z
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
covered_digest: "v3:sha256:c61afb205185080372f7c84cbff7946a4d6a734dc080364d1ad1fae2797d0e8a"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: passed
  previous_score: 13/13
  previous_verified: "2026-11-12T14:21:06Z"
  previous_head: "eba56ec"
  current_head: "e37b949"
  scope: "四个被覆盖的非规划文件在上一份报告落盘后变更（BUILD.md + tests/{compat-matrix,docs-consistency,pack-contents}.test.mjs），本趟从零重推全部 13 条 truth，不继承上一份的逐条判定"
  gaps_closed: []
  gaps_remaining: []
  regressions: []
phase_type: infrastructure
decision_coverage: "8/8 honored（check.decision-coverage-verify exit 0，not_honored 空）"
prohibition_flags: 13
prohibition_flag_items:
  - id: P3-01-1
    requirement: PUB-02
    tier: transparency
    verdict: honored（本趟直读复核）
    note: "package.json files 仍 9 条纯字面量（index.js / cordis.patch.yml / locale / icon.svg / skills / gsd-core / hooks / config / scripts），无 '.' / '*' / '**' / '!'；docs/、CHANGELOG.md、PNG 均不在包内；pack-contents ①②③ 本趟绿"
  - id: P3-01-2
    requirement: PUB-01
    tier: transparency
    verdict: honored（本趟机器复核）
    note: "本趟 grep -rn -- '--force|--legacy-peer-deps' .github build package.json tests → 0 命中"
  - id: P3-01-3
    requirement: PUB-02
    tier: values
    verdict: honored（本趟逐条证伪后维持）
    note: "需重审：本 phase 在上次报告后删除了 3 条断言。本趟独立验证三处删除均为恒真断言（详见 §被删断言复核），不构成『为换绿而弱化』：GATE_RE 已蕴含门行非注释；shieldBadges=2 ∧ licenseBadges=1 蕴含 dshBadges=1；printed===expected 且 expected 由 mkdirSync 刚创建，蕴含 existsSync(printed)。计数 37→37 未变，无断言因转红而被删"
  - id: P3-01-4
    requirement: PUB-01
    tier: safety
    verdict: honored
    note: "03-01 范围内零对外写入；两次 push 均发生在 03-03 的人审 checkpoint 之后"
  - id: P3-02-1
    requirement: PUB-03
    tier: transparency
    verdict: honored（本趟机器复核）
    note: "catalog 文案仅 72 skills / GSD 1.20.1 / 双语同源表述；pinned 安装命令本趟 grep -cF = 4，逐字未删"
  - id: P3-02-2
    requirement: PUB-04
    tier: values
    verdict: honored（本趟机器复核）
    note: "git log d3c8e89..HEAD -- LICENSE THIRD-PARTY-NOTICES.md locale/ 仅返回 phase 1/2 旧提交（0305b6e / 384b72a / 28c68c0），phase 3 内零改动；无第二致谢真源"
  - id: P3-02-3
    requirement: PUB-03
    tier: safety
    verdict: honored（本趟直读复核）
    note: "yml 顶层键恰 url/name/category/description，description 下仅 en/zh；无 icon；package.json files 无 PNG"
  - id: P3-02-4
    requirement: INST-06
    tier: transparency
    verdict: honored（本趟机器复核）
    note: "同 P3-02-2 的 git log：locale/{en,zh}.json 在 phase 内零改动；docs-consistency ⑩ 本趟绿（未新增宿主 schema 外字段）"
  - id: P3-02-5
    requirement: PUB-02
    tier: values
    verdict: honored（措辞范围已放宽，见 note）
    note: "历史审计记录未被改写：02-VALIDATION / 01-VERIFICATION / STATE 的 26/26 原样保留；唯一活体计数仍是 BUILD.md:16=37/37。**变化**：本 phase 后来又改了 BUILD.md:110（把陈旧的『实测 7/7』标注为当时规模并指向 §TL;DR），以及 03-SECURITY.md 的追加式更正（aebc5d7，明示『本更正是追加，不删改原文』）。两者都不属于被禁的改写，故维持 honored，但据此把『唯一可改写行 = :16』放宽为『活体计数仍只有 :16』"
  - id: P3-03-1
    requirement: PUB-01
    tier: safety
    verdict: honored（经人审授权，附偏离注记）
    note: "计划假设 SSH 可用；实测 key 非账号有效 key。人类在 blocking-human checkpoint 显式授权后改走 HTTPS + gh credential helper，执行器未自行 gh auth refresh；origin 逐字未改写（本趟 git remote -v 仍 git@github.com:pfmiles/dsh-gsd.git）。残余 scope 见 A-03-02"
  - id: P3-03-2
    requirement: PUB-01
    tier: transparency
    verdict: honored（前提已变，重述）
    note: "禁令本体是『红了之后反复重推刷绿』。本趟 live 复核：total_count = 2，两条 run 的 run_attempt 均为 1，conclusion 均为 success ⇒ 无 rerun、无红跑、无刷绿。但『只推一次』这一事实已不成立（第二次 push 为 CR-01 修复取得 CI 覆盖，经人授权），故本条目按『无红跑历史』判，而非按『推过一次』判"
  - id: P3-03-3
    requirement: PUB-01
    tier: safety
    verdict: honored（数字已变，重述）
    note: "原注『真仓 total_count = 1』**已过期**：本趟 live = 2。仍成立的机器事实：git ls-files '*.tgz' = 0；branches = ['main']（无其他分支）；两次推送均为快进（d3c8e89..20e20c0、20e20c0..9e99cd6），无 force-push、无重推同一 sha"
  - id: P3-03-4
    requirement: PUB-01
    tier: values
    verdict: honored（本趟 live 复核）
    note: "SC-5 判据由 GitHub Actions run 43218878911 与 43238375397 本身给出（两条皆 success），本地证据未被用来替代 CI 结论"
deferred:
  - truth: "会话技能目录出现全部 72 个 gsd-*，且在 live 交互会话中可见"
    addressed_in: "Phase 5（UAT-01）"
    evidence: "REQUIREMENTS.md SKIL-01 / UAT-01 仍为 [ ]（本趟复核）；ROADMAP Phase 5 SC-1『UAT-01..05 全绿（干净 DSH_HOME 安装、skills、健康…）』；03-RESEARCH A2 / Open Question 6；03-01-SUMMARY D9 human_judgment:true 的显式移交"
  - truth: "真正的 npm publish（含 dist-tags.latest）/ GitHub Release / dshmarket PR"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 3 goal 与 Phase 5 SC-5『对外动作执行：npm publish + GitHub Release + dshmarket PR 本体』；03-CONTEXT D-02/D-04"
  - truth: "registry 通道安装复验（dsh plugin add dsh-gsd@<ver>）"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 3 SC-1 括注『registry 通道 … 由 Phase 5 复验』；03-CONTEXT D-02"
advisory:
  - finding: "package.json 的 test/prepack 与 CI 的『完整测试』步骤都不带 --test-concurrency=1，而 tests/build-smoke.test.mjs 会重写构建树；在高并行核数机器上可能与读取构建产物的套件（pack-contents ③ 等）竞态"
    category: architectural
    reason: "本趟按要求只以串行方式跑一次全量（37/37），未重跑 npm test，故无确定性证据；且相关文件（package.json、.github/workflows/compat-matrix.yml）自上一份报告后未被修改，不属回归。两次 CI run 实测皆绿，未观测到竞态。若要收口：把 CI 步骤与 npm scripts 改为 node --test --test-concurrency=1 tests/*.test.mjs"
    evidence_status: "none provided（仅有编排器口径的已知现象描述；未取得红跑）"
known_debt:
  - id: IN-02
    severity: info
    status_now: restated
    disposition: accepted / won't-fix（本 phase 不修）
    must_have_impact: none
    note: "原注『20e20c0 之后的 5 个非规划文件从未在 CI 执行』**已被树推翻**：run 43238375397（head_sha 9e99cd6）已覆盖 index.js 与当时三个测试文件。**重述后的实情**：当前 HEAD e37b949 领先 CI 已验证 sha 9e99cd6 共 10 个提交，其中 4 个非规划文件被改（BUILD.md + tests/{compat-matrix,docs-consistency,pack-contents}.test.mjs）⇒ 当前断言集未被 CI 执行过。影响面已收窄：发布面（index.js / package.json / cordis.patch.yml / locale / skills / icon.svg / gsd-core / hooks / config / scripts）在 9e99cd6..HEAD 上 git diff 为空，故『从当前树发布』与『远端 main 的发布面』逐字节相同。再次 push 会产生第三条 run，属人工决策"
  - id: SEC-T-03-14
    severity: info
    status_now: resolved
    disposition: closed（文档已更正，无需再记）
    must_have_impact: none
    note: "原注的『03-SECURITY.md T-03-14 写 byte-identical publish surface 且已过期』已被 aebc5d7 修复：原句保留但加显式失效标记，新增『后置更正』节给出准确表述（入包面相对 20e20c0 恰差 index.js 一个文件），并随后追加 d2117c4 记录 run 43238375397 使入包面差异归零。本趟复核 threats_open 仍为 0（SECURITY 内 open 状态威胁计数 0）"
  - id: A-03-02
    severity: high
    status_now: kept
    disposition: accepted risk（人类授权，记录在 03-SECURITY.md:72）
    must_have_impact: none
    note: "前提未变：gh OAuth token 仍持 delete_repo, gist, read:org, repo, workflow。SECURITY 已给收敛建议（Phase 5 首发前收回 delete_repo，或改 fine-grained PAT）。属人类已裁决的接受风险"
  - id: DM-SCHEMA
    severity: info
    status_now: kept
    disposition: deferred
    must_have_impact: none
    note: "前提未变：docs/dshmarket/pfmiles__dsh-gsd.yml 的条目形态（4 顶层键 + description.en/zh、category=workflow、无 icon）仍来自离线研究，未对 live awesome-dsh-plugin 仓验证；PR 本体在 Phase 5，届时即验证。本趟复核条目形态未漂移"
  - id: UI-EVIDENCE
    severity: info
    status_now: kept
    disposition: deferred（非本 phase 缺陷）
    must_have_impact: none
    note: "本趟在运行时检出点复核：$HOME/.dsh/gsd-core/bin/lib/ui-frontend-evidence.cjs:104 的 SKIP_DIRS = {node_modules,.git,.planning,dist,build,out,.next,.nuxt,.output,coverage,vendor,.cache}，仍**不含** .gsd-build-tmp；而本仓 .gsd-build-tmp/ 确实存在且被 .gitignore:3 忽略。故『reader 从 gitignored 构建产物返回 found:true』的前提成立。对 NON-UI 本相位无影响"
  - id: SC5-WORDING
    severity: info
    status_now: kept
    disposition: open（用户未授权改写 ROADMAP）
    must_have_impact: none
    note: "前提未变：本趟直读 ROADMAP Phase 3 SC-5 仍写『CI 首次激活 run 全绿（L37 上游漂移修复后 push，无红跑历史）』；实际修法在 manifest peer（package.json peer + pins.json lines.022.peer），.github/workflows/compat-matrix.yml 的 L37 零改动。判据实质（四格绿 + 无红跑历史）成立"
---

# Phase 3: 发布（GitHub + npm + dshmarket） Verification Report

**Phase Goal:** 发布就绪 —— repo 建仓并推送、packaging 面符合 npm 规范、CI 首绿；真正的 `npm publish` / GitHub Release / dshmarket PR 移交 Phase 5（干净机器 UAT 通过后）执行。
**Verified:** 2026-11-13T02:55:49Z（HEAD `e37b949`，工作树除 `.planning/STATE.md` 外干净）
**Status:** passed
**Re-verification:** Yes — 上一份报告落盘于 `ab9e2f4`（锚定 HEAD `eba56ec`）之后，四个被覆盖的非规划文件（`BUILD.md` + 三个测试文件）又各被改动一次；本趟全部 13 条 truth 从零重推，未继承上一份的判定

## 验证基调（honest-verifier）

本报告把证据分成三档，每条 truth 都注明来源：

1. **本趟亲自执行 / 直读**：`node --test --test-concurrency=1 tests/*.test.mjs`（37/37）；`node build/lib/check-pins.mjs --offline`；`gsd_run query verify.artifacts | verify.key-links | check.decision-coverage-verify`；`gh api` 只读复核（runs / commits/main / branches）；`git diff` / `git log` / `git status`；12 个交付文件与 3 份 PLAN/SUMMARY 全文直读。
2. **记录在案、输入物本趟已证未变**：真 tarball（958 文件）装进一次性 profile 并 boot 的 e2e（57 条 run 的装载输出、`runtime-identity`、72 skills、`--dump-config` 两行）。本趟**未重跑**（hard constraint：`npm pack` 触发 prepack 递归回本套件、会改写构建树）；但本趟用 `git diff --stat 49c0efe..HEAD -- <发布面>` 证明该 e2e 锚点以来**发布面逐字节未变**，故结论可迁移到当前树。
3. **不采信 SUMMARY 的结论句**：SUMMARY 只用于定位证据；每条判定都回到文件内容或机器输出。

## Goal Achievement

### Must-have 来源与覆盖（无缩面证明）

- **ROADMAP Success Criteria（6 条，非可协商）**：SC-1..SC-6 → 全部进入下表。
- **PLAN frontmatter truths（21 条）**：03-01 七条、03-02 七条、03-03 七条 → 按下表合并去重，**无一条被丢弃**（映射见每行括注）。

合并结果 13 条：6 条 SC + 7 条 plan 专有组。

### Observable Truths

| # | Truth（来源） | Status | Evidence |
| - | ------------- | ------ | -------- |
| 1 | **SC-1**（含 03-01 T7）`npm pack` 的 tarball 在干净 profile 装成并 boot；registry 通道由 Phase 5 复验 | ✓ VERIFIED | 记录在案 e2e：958 文件 tarball → 一次性 profile → 安装版 `skillsDir` 解析到 `.../dsh-gsd/skills`、72 项、`--dump-config` exit 0 且 `- id: gsd` / `- id: gsd-hooks-bridge` 各 1。**本趟新增迁移证明**：`git diff --stat 49c0efe..HEAD -- index.js package.json cordis.patch.yml locale skills icon.svg gsd-core hooks config scripts` **为空**（e2e 锚点以来发布面零差异）；`find skills -name SKILL.md \| wc -l` = **72**；pack-contents ④ 本趟绿（子进程真求值安装形态）。registry 通道属 Phase 5（Deferred 3） |
| 2 | **SC-2**（含 03-01 T4/T6）pack 清单 = `files` 白名单，含 `scripts/`、`locale`、`icon`；开发期路径零泄漏 | ✓ VERIFIED | 直读 `package.json`：`files` 9 条纯字面量且含 scripts/locale/icon.svg；`ALLOWED_TOP_LEVEL` 12 项（3 项 npm 无条件 + 9 项白名单）收敛。本趟 pack-contents **4/4 pass**（①包含方向 ②顶层收敛+`.planning/`/`tests/`/`build/`/`.github/` 零出现 ③条目有内容 ④安装形态包根） |
| 3 | **SC-3**（含 03-02 T3/T4）dshmarket 提交材料就绪（双语、category=workflow、install 命令与 README 逐字一致）+ 流程查实 | ✓ VERIFIED | 直读 yml：顶层键恰 `url/name/category/description`，`description` 下恰 `en/zh`（5 个叶子字段），`category: workflow`，无 icon。本趟逐字比对：README 的裸名行与 `docs/dshmarket/README.md:16` 两侧**字节相等**（脚本 `[ "$A" = "$B" ]` → IDENTICAL）；docs-consistency ⑪⑫ 本趟绿。流程记录于 03-RESEARCH + `docs/dshmarket/README.md`（目标仓/路径/四检/Phase 5 时点）。**残余**：未对 live 目标仓验证 schema（DM-SCHEMA，Phase 5 提 PR 时即验证） |
| 4 | **SC-4**（含 03-02 T2/T5 的可见性半）README 徽章 / LICENSE(MIT) / 上游致谢齐备 | ✓ VERIFIED | 直读 README：L3 `[![license: MIT](shields…)](./LICENSE)`、L4 `[![DSH](shields…)]`，两枚都在首个 `# dsh-gsd` 之前；`grep -c '^# dsh-gsd$'` = **2**（双语边界未切歪）。ZH 段 L75 / EN 段 L148 各含 `MIT` 与 `THIRD-PARTY-NOTICES.md`。docs-consistency ⑨ 本趟绿。`LICENSE`(1065B) 与 `THIRD-PARTY-NOTICES.md`(1670B) 存在，phase 内 git log 零改动 |
| 5 | **SC-5**（含 03-03 T5/T6/T7）CI 首次激活 run 全绿，无红跑历史 | ✓ VERIFIED | 本趟 live `gh api …/actions/runs` → `total_count: **2**`：`43238375397`（event=push、run_attempt=1、success、head_sha 9e99cd6）与 `43218878911`（event=push、run_attempt=1、success、head_sha 20e20c0）。**两条皆绿、无 rerun ⇒ 无红跑历史**。`commits/main` = `9e99cd6`；`branches` = `["main"]`。**与上一份报告的差异**：`total_count` 由 1 变 2（第二次 push 经人授权，为 CR-01 修复取得 CI 覆盖），判据本体不变 |
| 6 | **SC-6**（含 03-02 T5 的 CHANGELOG 半）CHANGELOG.md 首个条目成文 | ✓ VERIFIED | 直读：`## [1.20.1-1.dsh022] - 2026-11-12`；`###` 小节恰 3 个（Added/Changed/Fixed）⊂ 六类闭集；导语写明 tag = 版本串、不加 `v` 前缀、Release 正文取本文件；`### Changed` 载明 peer 收紧与 rc.2 转正的维护义务。docs-consistency ⑧ 本趟绿。该文件不在 `files` 内（顶层仍收敛 12 项） |
| 7 | **03-01 T1 / D-05** peer 收紧为 exact `0.2.2-rc.1` 且 manifest + pins 同构；`engines.dsh` / `dshRange` / README 窗口串逐字不动 | ✓ VERIFIED | 直读 `package.json`：`peerDependencies["@deepseek-ai/dsh-skill-filesystem"] === "0.2.2-rc.1"`；`pins.json` `lines.022.peer === "@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`；`engines.dsh` 仍 `>=0.2.2-rc.1 <0.3.0-0`，`lines.022.dshRange` 同值。本趟 `check-pins --offline` → **exit 0**，末行 `pins: all consistent (line dsh022)`；compat-matrix ⑥ 本趟绿 |
| 8 | **03-01 T2** npm 通道上收紧后的 manifest 干净解析，install-ok 探针通过 | ✓ VERIFIED | 独立于本地记录：CI run 43238375397 在 GitHub runner 上执行两个 install-ok 格（`npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.2-rc.1` + 门控解析断言 + `compat-probe --expect install-ok`），job 全 success（本趟 live 复核）。`git diff 9e99cd6..HEAD -- package.json` 为空 ⇒ 该格覆盖的 manifest 与当前树同字节 |
| 9 | **03-01 T3 / D-08** workflow 顶层最小权限 + install-ok 格门控正向解析断言，且未新增步骤 | ✓ VERIFIED | 直读 `.github/workflows/compat-matrix.yml`：L10-11 `permissions:` / `contents: read`（唯一一次）；门行 L42 `if [ "${{ matrix.expect }}" = "install-ok" ]; then` 位于既有『宿主求值探针』`run: \|` 块（L38-49）**内部**；`RESOLVED` 取值失败 `\|\| true` 兜住后 `exit 2`；`run:` 行 **4** 条（L35/L38/L53/L56）。本趟 compat-matrix **8/8 pass** |
| 10 | **03-01 T4/T5 + 03-02 T7** pack 防线纳入 `tests/`、待迁目录消失；串行单次全量与 `BUILD.md:16` 等值 | ✓ VERIFIED | `ls tests/pending-phase-3` → No such file or directory；本趟 4/4 绿（含 ④ CR-01 回归门）。六文件 `test()` 计数 **2+8+13+4+7+3 = 37**，本趟 `ℹ tests **37** / pass 37 / fail 0 / cancelled 0`；`BUILD.md:16` 写 `预期 37/37` ⇒ 机器等值。`BUILD.md:110` 原『实测 7/7』已改为『当时共 7 个用例，当前套件规模见 §TL;DR』，`grep -n '7/7' BUILD.md` 现为 0 命中，陈旧计数不再与 :16 冲突 |
| 11 | **03-02 T1** manifest 元数据补全，其余字段零漂移 | ✓ VERIFIED | 直读 `package.json`：`repository`/`homepage`/`bugs`/`keywords`(7)/`author`/`publishConfig.registry=https://registry.npmjs.org/` 均在；`version 1.20.1-1.dsh022`、`private: true`、`license: MIT`、`files`(9)、`engines`、`dependencies` 两 exact、`peer` exact、`icon`、`exports`、`dsh.bundle`、`scripts` 与契约一致。docs-consistency ⑥⑬ 本趟绿 |
| 12 | **03-02 T6** docs-consistency ⑧⑨⑩⑪⑫⑬ 全绿 | ✓ VERIFIED | 本趟 `node --test --test-concurrency=1 tests/docs-consistency.test.mjs` → **13/13 pass**（⑧ 版本等值 ⑨ 徽章/致谢 ⑩ INST-06 ⑪ dshmarket schema ⑫ 裸名串逐字中英各 1 ⑬ manifest 元数据）。注：上一份报告记 13/13 时的断言集与当前不同（见 §被删断言复核），本趟为当前断言集的实测 |
| 13 | **03-03 T1-T4** 四格本地等价 + 两档 GSD 构建 + push 只推 main/不 force；远端 main == 被推 sha 且 workflow 已上远端 | ✓ VERIFIED | 数字等价由 CI 独立复现（4 格 × 6 步 success，GSD 轴 1.20.1/1.19.0 各自 build + 全量测试）。本趟 live：`commits/main` = `9e99cd6`（== 最近一次被推 sha == run 43238375397 的 head_sha）、`branches` 仅 `main`、`git ls-files '*.tgz'` = 0、`origin` 仍 `git@github.com:pfmiles/dsh-gsd.git`（`git remote -v` 前后一致）。两次推送均为快进（`d3c8e89..20e20c0`、`20e20c0..9e99cd6`）。**偏离（经人授权，非自行决定）**：SSH 实测不可用（key 非账号有效 key），实际通道 = HTTPS + `gh` credential helper；`git fetch origin` 不可执行，改以 `gh api` 权威复核 |

**Score:** 13/13 truths verified（0 present-but-behavior-unverified；0 override）。

### 被删断言复核（本趟最关键的重推导）

上一份报告之后，本 phase 删除了 3 条断言。adversarial 默认假设是「为换绿而弱化覆盖」，故本趟逐条做恒真性证明，而不是采信第三次评审的 `clean` 结论：

| 提交 | 文件 | 被删断言 | 恒真性证明（本趟独立推导） | 判定 |
| ---- | ---- | -------- | -------------------------- | ---- |
| `54edd58` (IN-03) | `tests/compat-matrix.test.mjs` | `assert.ok(!/^\s*#/.test(gateLine))` | `gateLine` 由 `gateIdx` 定位，`gateIdx` 来自 `GATE_RE = /^\s+if \[ "${{ matrix\.expect }}" = "install-ok" \]; then$/m` 的匹配起点。`\s+` 必须匹配至少一个空白字符，故 `m.index` 所在行必以空白开头；该行若为注释（空白后为 `#`）则 `\s+` 之后无法匹配 `if`（`#` 非空白），正则不成立 | 恒真，删除无覆盖损失 ✓ |
| `9fed9cd` (IN-04) | `tests/docs-consistency.test.mjs` | `assert.equal(dshBadges.length, 1)` | 两行上方已断言 `shieldBadges.length === 2` 与 `licenseBadges.length === 1`；`dshBadges = shieldBadges.filter(b => b.i !== licenseBadges[0].i)` ⇒ 长度恒为 2−1=1 | 恒真，删除无覆盖损失 ✓ |
| `4fae49d` (IN-05) | `tests/pack-contents.test.mjs` | `assert.ok(existsSync(printed))` | 上一行已断言 `printed === expected`；`expected = join(installedRoot, 'skills')`，而同一 `try` 块开头 `mkdirSync(join(installedRoot, 'skills'), { recursive: true })` 已成功创建（抛错则测试已红）。队列顺序保证等值断言先失败 | 恒真，删除无覆盖损失 ✓ |

**结论：三处删除均未削弱覆盖**，且计数器 37→37 未变（无断言因转红而被删除）。`BUILD.md:110` 的改写（`aacdbfa`）只是把陈旧数字标为历史并指向活体计数，未制造新的不一致。因此在「禁止弱化断言换绿」这条 prohibition 上，本趟维持 honored，但不是继承判定，而是重证。

### Deferred Items（Step 9b —— 后续 phase 明确承接，不影响状态）

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | 会话技能目录出现全部 72 个 `gsd-*`，并在 **live 交互会话**中可见 | Phase 5 UAT-01 | `REQUIREMENTS.md` `SKIL-01` / `UAT-01` 本趟复核仍为 `[ ]`；ROADMAP Phase 5 SC-1；03-RESEARCH A2 / Open Question 6；03-01-SUMMARY D9 `human_judgment: true` |
| 2 | 真正的 `npm publish`（含 `dist-tags.latest`）/ GitHub Release / dshmarket PR 本体 | Phase 5 | ROADMAP Phase 3 goal + Phase 5 SC-5；03-CONTEXT D-02 / D-04 |
| 3 | registry 通道安装复验（`dsh plugin add dsh-gsd@<ver>`） | Phase 5 | ROADMAP Phase 3 SC-1 括注；03-CONTEXT D-02 |

### Advisory（New Scope, Unevidenced）

本趟为 re-verification，故本节必列（即使无）。

| # | Finding | Category | Why Advisory |
|---|---------|----------|--------------|
| 1 | `package.json` 的 `test` / `prepack` 与 CI『完整测试』步骤均写 `node --test tests/*.test.mjs`，**不带 `--test-concurrency=1`**；而 `tests/build-smoke.test.mjs` 会重写构建树，在高并行核数机器上可能与读构建产物的套件（如 pack-contents ③）竞态 | architectural | new-scope、无确定性证据：本趟按要求只串行跑一次全量（37/37），未重跑 `npm test`；`package.json` 与 workflow 自上一份报告后未被修改（非回归）；两次 CI run 实测皆绿。收口方式：CI 步骤与 npm scripts 补 `--test-concurrency=1` |

### Required Artifacts

`gsd_run query verify.artifacts` 三计划全部 **exit 0**：03-01 **4/4**、03-02 **7/7**、03-03 **1/1**（`all_passed: true`）。均经本趟实读，非仅存在性：

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `package.json` | peer exact + 元数据 + publishConfig | ✓ VERIFIED | 全文直读；无 stub、无 TODO；`files` 9 条纯字面量 |
| `build/assets/pins.json` | 行↔pin 单一真源 | ✓ VERIFIED | `lines.022.peer` 与 manifest 逐字同构；`dshRange` 未随 peer 收紧；check-pins exit 0 |
| `.github/workflows/compat-matrix.yml` | permissions + 门控断言 + 4 格 6 步 | ✓ VERIFIED | 全文直读；4 格未动、`run:` 4 条、断言在既有探针块内、门行 canonical |
| `tests/pack-contents.test.mjs` | 发布面静态防线 + CR-01 守卫 | ✓ VERIFIED | 本趟 4/4；④ 在安装形态下用子进程真求值 pluginRoot/skillsDir |
| `CHANGELOG.md` | 首条目 + 发布约定 | ✓ VERIFIED | 全文直读；§见 truth #6 |
| `README.md` | 徽章 + 裸名示例 + Phase 5 时间线 | ✓ VERIFIED | 徽章 L3/L4 在首标题前、`# dsh-gsd` 恰 2、裸名行 L27/L100、pinned 4、`@latest` 0、状态文案已改 Phase 5（L65/L138） |
| `docs/dshmarket/pfmiles__dsh-gsd.yml` | 5 叶子字段 catalog 条目 | ✓ VERIFIED | 直读 6 行；无 icon、无自定义键、category=workflow |
| `docs/dshmarket/README.md` | 提交说明 + 逐字 install 串 | ✓ VERIFIED | L16 裸名串与 README 字节相等（本趟脚本比对 IDENTICAL）；目标仓/路径/四检/Phase 5 时点齐备 |
| `BUILD.md` | :16 实测计数 | ✓ VERIFIED | `:16` = `预期 37/37` == 本趟实测 37；`:110` 陈旧 7/7 已标注为历史 |
| `tests/docs-consistency.test.mjs` | ⑧⑨⑩⑪⑫⑬ | ✓ VERIFIED | 本趟 13/13 |
| `tests/compat-matrix.test.mjs` | ②-⑧ workflow 结构/门控哨兵 | ✓ VERIFIED | 本趟 8/8 |
| `index.js` | 包根解析（CR-01 修复）+ 72 技能 provider | ✓ VERIFIED | 直读：`const pluginRoot = dirname(fileURLToPath(import.meta.url))`、`const skillsDir = join(pluginRoot, 'skills')`、`FileSystemSkillProvider({ customSkillDirs: [skillsDir] })`；无 `..` |

### Key Link Verification

`verify.key-links` 的机器结果必须如实拆开看：**3/10 verified**（03-01 1/3、03-02 1/4、03-03 0/3），其余 7 条 detail 均为
`"Source file not found (from: must be a relative file path)"` —— 这是 **`from` 写成散文标签（含全角括号）导致的输入不可评估**，不是 wiring 断开（detail 自身点明「must be a relative file path」）。本趟逐条手工回溯，**10/10 连接成立**：

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `package.json` peerDependencies | `build/assets/pins.json` `lines.022.peer` | check-pins 步骤 (j) 逐字比较 | ✓ WIRED | 本趟 exit 0 `pins: all consistent (line dsh022)`；compat-matrix ⑥ spawn 同一脚本 |
| workflow 门控断言 | npm 解析树里的 `dsh-skill-filesystem` version | `require.resolve` + 与 `matrix.dsh` 比对 | ✓ WIRED | 直读 L42-L49；CI 两个 install-ok 格 success 证明执行路径（run 43238375397） |
| `tests/pack-contents.test.mjs` | `package.json` `files` | `simulatePack()` + `ALLOWED_TOP_LEVEL` | ✓ WIRED（CLI 已证） | `verify.key-links` verified=true；本趟 ①-③ 绿 |
| `README.md` 裸名示例 | `docs/dshmarket/README.md` install 串 | 两侧整行 byte 相等 | ✓ WIRED（本趟手工） | 脚本比对 IDENTICAL；⑫ 绿 |
| `CHANGELOG.md` 首条目版本 | `package.json.version` | docs-consistency ⑧ | ✓ WIRED（本趟手工） | 两处均为 `1.20.1-1.dsh022`；⑧ 绿 |
| `BUILD.md:16` 计数 | `node --test` 实测输出 | 按实测写 N/N | ✓ WIRED（本趟手工） | 37 == `ℹ tests 37` == 六文件计数和 |
| `docs/dshmarket/*.yml` | awesome-dsh-plugin 词表 | 离线行级正则 | ✓ WIRED（CLI 已证） | verified=true；⑪ 绿 |
| workflow `push: branches [main]` | GitHub Actions run | 推送触发 | ✓ WIRED（本趟 live） | run 43218878911 / 43238375397 均 event=push |
| 本地四格等价 | CI 四格 | 同源两行命令 | ✓ WIRED（本趟手工） | yml L39/L50 与 PLAN 命令逐字同源；CI 4/4 success |
| `gh run list` conclusion | ROADMAP SC-5 | `conclusion=success` + 无红跑 | ✓ WIRED（本趟 live） | 2/2 success、attempt 均 1 |

> ℹ 建议（非本 phase 缺陷）：plan frontmatter 的 `key_links.from` 用文件路径字面量（而非「package.json（peerDependencies）」这类标签），否则该 verb 只能覆盖 3/10。

### Data-Flow Trace (Level 4)

不适用（infrastructure 相位，无渲染 / 无动态数据）。等价的「真值→消费方」链路已由 Key Link 表覆盖：`pins.json` → `package.json` → workflow 格 → 文档窗口串，每层都有机器强制方（check-pins / compat-matrix ② / docs-consistency ②）。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 全量套件（唯一一次，串行） | `node --test --test-concurrency=1 tests/*.test.mjs` | `ℹ tests 37 / pass 37 / fail 0 / cancelled 0 / skipped 0 / todo 0`，7589 ms | ✓ PASS |
| CR-01 回归：安装形态下 pluginRoot 必须是包目录 | `node --test --test-concurrency=1 tests/pack-contents.test.mjs` | 4/4 pass | ✓ PASS |
| 发布面元数据/文档/条目守卫 | `node --test --test-concurrency=1 tests/docs-consistency.test.mjs` | 13/13 pass | ✓ PASS |
| workflow 结构与门控哨兵 | `node --test --test-concurrency=1 tests/compat-matrix.test.mjs` | 8/8 pass | ✓ PASS |
| pin 强等值 | `node build/lib/check-pins.mjs --offline` | exit 0，`pins: all consistent (line dsh022)` | ✓ PASS |
| CI 运行史（无红跑） | `gh api …/actions/runs --jq …` | `total_count: 2`，两条均 success / attempt 1 | ✓ PASS |
| 远端权威 sha | `gh api …/commits/main --jq .sha` | `9e99cd6c5787839d07474f328a46ca2683fa71ab` | ✓ PASS |
| 远端分支面 | `gh api …/branches --jq '[.[].name]'` | `["main"]` | ✓ PASS |
| 发布面自 e2e 锚点未变 | `git diff --stat 49c0efe..HEAD -- <发布面>` | 空输出 | ✓ PASS |
| 发布面自 CI 验证 sha 未变 | `git diff --stat 9e99cd6..HEAD -- <发布面>` | 空输出 | ✓ PASS |

> 上述四个 `node --test` 调用共享同一次全量实现：先跑全量一次（`tests/*.test.mjs`，37 例），再按文件分别跑是为了在报告里给出分组证据；未使用 `npm test`（其脚本缺 `--test-concurrency=1`，本机会与 `build-smoke` 重写构建树竞态）。全量 37/37 采信本趟亲自执行，不是引用编排器。

### Probe Execution

N/A —— 仓内无 `scripts/*/tests/probe-*.sh`（`find` 空），三份 PLAN/SUMMARY 也未声明 probe 资产（grep 空）。安装/boot 类一次性验证按 Manual-Only 口径处理（truth #1）。

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
| --------- | ---------- | ------ | ------- | -------- | --------------- | ------- |
| `tests/pack-contents.test.mjs` | PUB-02 / SC-1 | 4 | 0 | 否 | 值 + 行为（子进程真求值） | ✓ |
| `tests/docs-consistency.test.mjs` | PUB-03 / PUB-04 / INST-06 | 13 | 0 | 否 | 值（deepEqual / 正则等值 / byte 相等） | ✓ |
| `tests/compat-matrix.test.mjs` | PUB-01 / PUB-02 | 8 | 0 | 否 | 结构 + 值 | ✓ |
| `tests/build-smoke.test.mjs` | PUB-02（构建链） | 2 | 0 | 否（跑真实 build 后断言 gates；`writeFileSync` 只写 `.env` 与**篡改过的** fixture tgz，非自产期望值） | 行为 | ✓ |
| `tests/version.test.mjs` / `tests/rewrite-map.test.mjs` | VER-02 / VER-04（前序） | 10 | 0 | 否 | 值 | ✓ |

**Disabled tests on requirements:** 0 —— `grep -rnE "it\.skip|describe\.skip|test\.skip|xit\(|…|\.only\(" tests/` 唯一命中是 `tests/run-gates.sh:37` 的 `process.exit(`（`xit(` 子串假阳性），无真实跳过 → 无 BLOCKER。
**Circular patterns detected:** 0 —— 期望值来自 `package.json` 字面量、闭集词表、pins 与固定版本串；pack-contents ④ 的 `writeFileSync` 写的是「只替换 `import.meta.url` 一行」的探针模块，期望值由 `mkdirSync` 刚创建的真实路径给出。
**Insufficient assertions:** 0 —— 需求要求的量（白名单 / 等值 / 逐字一致）均以值级断言覆盖；SC-1 的整机安装/boot 属 Manual-Only（有意，非缺失）。
**变异证据（记录在案，本趟未重跑）:** ⑧⑪⑫⑬ 与 workflow ⑧ 各做过「注入变异 → 单条转红 → 还原」；④ 由 REVIEW-DISPOSITION 记录为「重新引入 `'..'` → 恰 ④ 红（4 tests / 1 fail），复原 4/4」。

### Requirements Coverage

ROADMAP 指派给 Phase 3 的 `PUB-01..04, INST-06` 按 **range 形式展开为 5 个 ID** 逐个核对：**5/5 全部被 plan frontmatter 声明**（03-01: PUB-01/02；03-02: PUB-03/04/INST-06；03-03: PUB-01），**无 ORPHANED**。REQUIREMENTS.md 中 5 条均 `[x]`（本趟复核）。

| Requirement | 声明计划 | 描述（REQUIREMENTS.md） | Status | Evidence |
| ----------- | -------- | ---------------------- | ------ | -------- |
| PUB-01 | 03-01, 03-03 | GitHub 仓 `pfmiles/dsh-gsd` 建仓并推送，repo 名 = npm 包名；npm 首发推迟 Phase 5 | ✓ SATISFIED | 远端 live：`commits/main` 9e99cd6、`branches` 仅 main、`total_count` 2 且两条 success（无红跑）；repo 名与 `package.json.name` 同为 `dsh-gsd`；npm 首发按 D-02 未执行 |
| PUB-02 | 03-01 | `prepack` = 全量重建，`files` 白名单精确（含 `scripts/` 修复） | ✓ SATISFIED | 直读 `scripts.prepack = "node build.mjs && node --test tests/*.test.mjs"`；pack-contents 4/4（含包含方向）；recorded 真 pack 958 文件 / 12 顶层 / leaks 0（输入物本趟证未变）；`scripts` 在 `files` 且非空 |
| PUB-03 | 03-02 | dshmarket 提交材料与流程就绪（双语、category=workflow、install 命令真实）；PR 本体 Phase 5 | ✓ SATISFIED | ⑪⑫ 绿；yml 5 叶子字段、无 icon；`docs/dshmarket/README.md:16` 与 README:27/100 逐字同串（byte 相等）；流程见 RESEARCH/README（live schema 验证 deferred → DM-SCHEMA） |
| PUB-04 | 03-02 | LICENSE（MIT）+ 上游致谢（GSD/DSH/第三方各自许可） | ✓ SATISFIED | `license: MIT` + `LICENSE` 首行 `MIT License`；⑨ 绿（双语各含 MIT 与 THIRD-PARTY-NOTICES 链接）；两份文件 phase 内未改 |
| INST-06 | 03-02 | 插件管理器展示元数据合规（locale 双语、icon.svg、files 白名单） | ✓ SATISFIED | ⑩ 绿（`meta.title`/`meta.description` 双语非空、title 双边相等、`pkg.icon` + `exports['./icon']`、files 收录 locale 与 icon.svg）；locale 文件 phase 内零改动 |

### Decision Coverage（CONTEXT D-01..D-08）

`gsd_run query check.decision-coverage-verify` → **exit 0**，`total: 8 / honored: 8 / not_honored: []`，message「All trackable CONTEXT.md decisions are honored by shipped artifacts.」逐条落点：D-01（LICENSE 未改）· D-02（未 publish/Release/PR）· D-03+D-05（peer 两文件同改、L37 零改动）· D-04（CHANGELOG 成文、Release 草稿在导语）· D-06（裸名示例 + pinned 未动）· D-07（catalog 无 icon）· D-08（permissions + 门控断言同一次改动）。

### Prohibitions（13 条 must-NOT）

13 条（03-01 4 + 03-02 5 + 03-03 4）逐条对照本趟证据重新判定，全部 **honored**，无被违反或「无强制方」的条目；明细见 frontmatter `prohibition_flag_items`。三条需要明说的：

1. **P3-01-3（禁止弱化断言换绿）** —— 本 phase 确实删了 3 条断言，故本趟不采信「评审说 clean」，而是逐条做恒真性证明（§被删断言复核）。结论：三处皆恒真，覆盖零损失，计数 37→37 未变。
2. **P3-03-1（禁止绕过人裁决改通道）** —— 计划假设 SSH 可用；实测 key 非账号有效 key。人类在 `blocking-human` checkpoint 显式授权后改走 HTTPS + gh credential helper，执行器未自行 refresh、origin 未改写、无 force-push ⇒ 其**意图（不得绕过人裁决）**成立。通道偏离与 token 残余 scope 已记入 03-SECURITY（T-03-11 / A-03-02）。
3. **P3-03-2 / P3-03-3（禁止重推刷绿 / 数字）** —— 事实已变：真仓 `total_count` 由 1 变 **2**。两条禁令的**本体**仍成立（无 rerun、attempt 均 1、无红跑历史、无 force-push、只有 main），但「只推过一次」不再是事实，故按重述后的口径判 honored，而不是沿用旧数字。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `.planning/ROADMAP.md` | 98 / 115 | `**Plans**: TBD`（Phase 4 / Phase 5 尚未规划） | ℹ Info | 非本 phase 交付面；ROADMAP 对未来相位的标准占位形态，不构成完成度不可审计。本 phase 三份 plan 均 `[x]`（ROADMAP:77 `3/3 plans complete`） |
| `.planning/ROADMAP.md` | 54 | `**Plans**: TBD（执行时 plan）`，但 Phase 2 已有 3 PLAN + 3 SUMMARY | ℹ Info | 项目级记账不一致（Phase 2 已完成却仍写 TBD）；不属本 phase 交付文件，不影响本 phase 判定 |
| 其余 14 个交付/变更文件 | — | TBD/FIXME/XXX/PLACEHOLDER/TODO/HACK/禁用测试 | — | **0 命中**（本趟对 `BUILD.md`、`CHANGELOG.md`、`README.md`、`package.json`、`index.js`、`docs/dshmarket/*`、`build/assets/pins.json`、workflow、三份 tests、`LICENSE`、`THIRD-PARTY-NOTICES.md` 逐文件 grep） |

> 债务标记门（TBD/FIXME/XXX 无 follow-up 引用 = BLOCKER）：本 phase 交付文件 0 命中，无 BLOCKER。

### Human Verification Required

N/A —— Infrastructure/foundation 相位（发布管线 / 打包 / CI / 文档），无用户可交互元素；所有验收判据均以命令输出或文件内容判定。本趟无 ⚠️ PRESENT_BEHAVIOR_UNVERIFIED truth（均为记录型/静态可判定，或已由绿的断言与 live run 覆盖），故 `behavior_unverified: 0`、不产生 `human_needed`。唯一「需要人看」的事项（live 会话技能可见性）已按 Step 9b 归入 Phase 5 UAT-01，不是本 phase 的未验证 must-have。

### 残余与遗留（如实入账，不改变 verdict）

1. **live 会话技能可见性从未观测** —— 只验到「安装形态路径解析 + 包内 72 项 + boot 配置」。判为 **Phase-5 handoff**（Deferred 1），理由：Phase 3 的 SC-1 与三份 PLAN 的 must_have 把验收定为「装成并 boot」，live 可见性属 `SKIL-01` / `UAT-01`（两者本趟复核仍未勾选），由 ROADMAP Phase 5 明确承接；Step 9b 的显式承接项不影响状态。
2. **dshmarket 目标仓 schema 未对 live 仓验证** —— 条目形态来自离线研究；PR 本体在 Phase 5，届时 schema 校验即发生（known_debt DM-SCHEMA）。
3. **Token scope 残余（A-03-02，security `high` accepted）** —— `workflow` + `delete_repo` 现挂在 token 上；SECURITY 已给收敛建议（Phase 5 前收 `delete_repo` 或换 fine-grained PAT）。属人类已裁决的接受风险。
4. **当前树领先 CI 已验证 sha 10 个提交（IN-02 restated）** —— `9e99cd6..HEAD` 改了 4 个非规划文件（`BUILD.md` + 三个测试）；发布面 `git diff` 为空，故 npm 发布面不受影响，但**当前断言集未被 CI 执行过**。再推一次会产生第三条 run ⇒ 人工决策，不是缺陷。
5. **ROADMAP SC-5 措辞陈旧（SC5-WORDING）** —— 仍写「L37 上游漂移修复后 push」；实际修法在 manifest peer、workflow L37 零改动。判据实质（四格绿 + 无红跑历史）成立；用户未授权改写 ROADMAP。
6. **UI 门潜在缺陷（UI-EVIDENCE）** —— `ui-frontend-evidence.cjs:104` 的 `SKIP_DIRS` 缺 `.gsd-build-tmp`，且本仓该目录确实存在（gitignored）。本相位 NON-UI，无影响；未来 frontend 相位需注意。
7. **`03-REVIEW-DISPOSITION.md` 的 IN-02 行标题已陈旧** —— 仍写「绿色 CI 只覆盖到 20e20c0 …5 条提交从未在 CI 执行」；实情已被 run 43238375397 推进（见 known_debt IN-02）。该行 `disposition: skipped` 的**决定**仍成立（不修），只是描述过期。本会话无权改该工件，故如实登记。
8. **串行纪律未被固化（Advisory 1）** —— `npm test` / CI 的测试步骤缺 `--test-concurrency=1`；本机实测需要串行才稳定。无确定性证据，故不阻塞。

### Gaps Summary

无 gap。6 条 ROADMAP Success Criteria 全部满足；13 条 must-have truths 全部 VERIFIED（0 behavior-unverified）；12/12 交付工件存在、实质、接线；13 条禁令全部 honored（其中 3 条按重述后的口径判定）；0 个 blocker 反模式；decision coverage 8/8；security `threats_open: 0`（block_on high）；validation `validated` + `nyquist_compliant: true`；review disposition `open: 0 / total: 10`，第三次评审 `status: clean`、0 findings。上述 8 条残余均已登记，其中 1 条（SEC-T-03-14）本趟判为 **已解决**、1 条（IN-02）**重述**、4 条 **维持**，均不构成 must-have 失败。

---

_Verified: 2026-11-13T02:55:49Z_
_Verifier: Claude (gsd-verifier)_