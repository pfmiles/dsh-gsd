---
phase: 02-compat-matrix
verified: 2026-11-12T04:49:06Z
status: passed
score: 13/13 must-haves verified
covered_files: [
  ".github/workflows/compat-matrix.yml",
  ".planning/phases/02-compat-matrix/02-01-PLAN.md",
  ".planning/phases/02-compat-matrix/02-01-SUMMARY.md",
  ".planning/phases/02-compat-matrix/02-02-PLAN.md",
  ".planning/phases/02-compat-matrix/02-02-SUMMARY.md",
  ".planning/phases/02-compat-matrix/02-03-PLAN.md",
  ".planning/phases/02-compat-matrix/02-03-SUMMARY.md",
  "BUILD.md",
  "README.md",
  "THIRD-PARTY-NOTICES.md",
  "build/assets/pins.json",
  "build/lib/check-pins.mjs",
  "build/lib/compat-probe.mjs",
  "package.json",
  "tests/compat-matrix.test.mjs",
  "tests/docs-consistency.test.mjs",
  "tests/version.test.mjs"
]
covered_digest: "v3:sha256:fe299fa9ea5a07595a790bbcc380eb1a2e643cdfdf109ebe21a4e358863adf19"
behavior_unverified: 0
overrides_applied: 0
phase_type: infrastructure
decision_coverage: "skipped (gate: no trackable decisions)"
prohibition_flags: 4
prohibition_flag_items:
  - id: P2-01
    requirement: VER-01
    tier: judgment
    verdict: honored (LLM-judge, machine-evidenced)
    review: recommended
  - id: P2-03
    requirement: VER-03
    tier: judgment
    verdict: honored (LLM-judge, machine-evidenced)
    review: recommended
    residual: "WR-05/T-2-09：dispatch 输入零匹配时全步 skip、run 仍绿——单元格本身未被标绿，故不判 P2-03 违反，但残余假绿面已登记"
  - id: P2-06
    requirement: DEV-03
    tier: judgment
    verdict: honored (LLM-judge, machine-evidenced)
    review: recommended
  - id: P2-07
    requirement: DEV-03
    tier: judgment
    verdict: honored (LLM-judge, machine-evidenced)
    review: recommended
known_debt:
  - id: WR-05
    severity: warning
    disposition: open
    must_have_impact: none
    note: "dispatch 输入零匹配 → 4 格 × 6 步全 skip、GitHub 记 success（假绿）；安全侧同源登记 T-2-09（medium，open — below high threshold，不计入 threats_open）。未否定任何 must-have"
  - id: WR-06
    severity: warning
    disposition: open
    must_have_impact: none
    note: "pins.matrix.dsh 轴值未被要求回溯 pins.lines——幽灵轴 0.3.0-rc.1 + 两格仍 7/7 绿且 check-pins exit 0（本验证突变复现）。VER-03 当前判据成立，属硬化缺口"
  - id: IN-04
    severity: info
    disposition: open
    must_have_impact: none
    note: "矩阵门哨兵只断 4 token 存在——取反 / &&→|| / 去掉 uses 步门三种语义变异仍 7/7 绿（本验证突变复现）"
deferred:
  - truth: "compat-matrix CI 在 GitHub runner 上首次跑绿（『CI 冒烟』的真实执行记录）"
    addressed_in: "Phase 3"
    evidence: "D-R4 决策（02-01-PLAN：本 phase 只交付 workflow 文件 + 本地验证，不 push，CI 首绿归 Phase 3 建仓计划）；ROADMAP Phase 3 goal『建仓』；02-CONTEXT『push 是 Phase 3 发布步的前置』；BUILD.md §⑨『CI 首绿时点归 Phase 3』"
re_verification:
  previous_status: passed
  previous_score: 13/13
  previous_verified: 2026-11-11T18:45:44Z
  prior_findings_resolved: 7
  prior_findings_not_resolved: 0
  prior_findings_regressed: 0
  new_findings_open: 3
  gaps_closed: []
  gaps_remaining: []
  regressions: []
  what_changed:
    - "7 条 review-fix 提交（55191da WR-01 / 6356ff4 WR-02 / 88d213d WR-03 / b2e351b WR-04 / 4fe265a IN-02 / df81330 IN-03 / e8e9d73 IN-01）在本 HEAD 全为祖先，均只修改不新增"
    - "02-REVIEW 在 HEAD 复审：前 7 条 resolved（0 not-resolved / 0 regressed），新发现 WR-05 / WR-06 / IN-04 三条 open（02-REVIEW-DISPOSITION.md open: 3）"
    - "02-VALIDATION（26/17 计数复测 + 上游漂移 ESCALATE 处置）、02-SECURITY（8 closed + T-2-09 open-non-blocking、threats_open 0）、02-UI-REVIEW（非 UI 复核）均在 HEAD 重审"
    - "full suite 由 25 增至 26（build-smoke 2 + rewrite-map 7 + compat-matrix 7 + version 3 + docs-consistency 7）；tests/pending-phase-3/ 被 glob 排除，未运行/未计数/未覆盖"
---

# Phase 2: 版本与兼容矩阵 Verification Report（Re-verification）

**Phase Goal:** DSH 行 × GSD 版本的兼容矩阵体系，engines.dsh 与依赖 pin 策略固化，CI 冒烟。
**Verified:** 2026-11-12T04:49:06Z（HEAD `e309703`）
**Status:** passed（附带 4 条 judgment-tier 禁令人工复查旗标 + 3 条已登记未决质量债 + 1 条 Phase 3 deferred 项）
**Re-verification:** Yes — 旧报告写于 2026-11-11T18:45:44Z，其后 7 条 fix 提交使 covered 指纹失效；本趟按全量流程重跑，不采信旧报告与 SUMMARY 结论。

## 验证基调（honest-verifier）

本报告所有结论来自本会话**亲自执行的命令**与**亲自读取的代码文件**。可在不改仓库状态前提下复现的自动化命令全部独立进程重跑（quick loop、full suite、两条 build、check-pins 离线/在线、actionlint、宿主双向探针 + guard 负向、NOTICES ① 档消费 + 篡改负向、双镜像取样、幽灵轴/幽灵格/门语义突变）；唯一不能复跑的是会改写 profile 状态的活体 `dsh plugin add` 负向探针与 `/gsd-health`（宿主会话），二者以记录在案的完整 stderr/输出 + 本会话在同进程 pid 95618 上亲测的机器锚点（identity、profile 版本快照、guard 硬拦、dump-config、进程启动时间）交叉佐证。

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence（本趟实测/直读） |
| - | ----- | ------ | ------------------------- |
| 1 | pins.json 为行↔pin 单一真源（022/021 行、matrix 轴值逐字符合计划） | ✓ VERIFIED | 直读 `build/assets/pins.json`：`lines.022.dshRange==='>=0.2.2-rc.1 <0.3.0-0'`、`lines.022.bridge` 两件 pin `0.2.2-rc.1`、`lines.021.dshRange==='<unsupported>'`、`matrix.dsh===['0.2.2-rc.1','0.2.1-rc.5']`、`matrix.gsd===['1.20.1','1.19.0']`、顶层 `version==='1.20.1-1.dsh022'` |
| 2 | package.json 版本迁移 + 不动清单并立 | ✓ VERIFIED | 直读 package.json：`version 1.20.1-1.dsh022`、`engines.dsh` 窗、`engines.node '>=24'`、`private true`、deps 两 pin、peer 范围、prepack 链原样；`git show 9847eb5 -- package.json` = 1 file changed / 1 insertion / 1 deletion（仅 version 行） |
| 3 | check-pins --offline 全等绿 | ✓ VERIFIED | 本趟 `node build/lib/check-pins.mjs --offline` → exit 0，stdout 恰 `pins: all consistent (line dsh022)`；在线档（npm view 取样两件 bridge pin）同样 exit 0 |
| 4 | 宿主求值双向探针（install-ok / reject） | ✓ VERIFIED | 本趟 /tmp 隔离副本实测：`@deepseek-ai/dsh@0.2.2-rc.1` → `compat-probe: install-ok confirmed (dsh 0.2.2-rc.1 satisfies engines.dsh >=0.2.2-rc.1 <0.3.0-0)` exit 0；`@0.2.1-rc.5` → `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}` + `reject confirmed` exit 0；期望错配 → exit 2；宿主版本 guard（请求 0.2.1-rc.5 而宿主 0.2.2-rc.1）→ exit 1。安装用 `--force`（02-VALIDATION 已记录的上游漂移豁免形态），仓库零改动 |
| 5 | compat-matrix workflow 4 格 + 一致性防线 | ✓ VERIFIED | 直读 yml：1 job / 4 个 include 格（2 `install-ok` + 2 `reject`）/ 6 步（2 `uses:` + 4 `run:`）/ 无 `dsh plugin add` / `fail-fast:false` / `timeout-minutes:30`；compat-matrix.test ①-⑦ 7/7；`actionlint` exit 0 无输出；**幽灵格突变**（轴不变、多一格 `0.3.0-rc.1`）→ ② 变红（WR-04 修复有效） |
| 6 | 版本方案机器校验（version.test 三组） | ✓ VERIFIED | 直读 tests/version.test.mjs：import `../build/lib/check-pins.mjs`（单一实现）；① 4 个合法拆解；② 12 个非法样本判 null（含前导零 `-01.`/`-0001.`、`rev=0`、带点线号、字母 rev、两位线号、旧编码）；③ validateVersion 4 真值；本趟 3/3 pass |
| 7 | GSD 轴第二值 1.19.0 构建/身份 + SBOM canonical 行 | ✓ VERIFIED | 本趟 `GSD_VERSION=1.19.0 node build.mjs` → exit 0 `gates: all passed (A/B/C)` + `copied 76 trees`；identity `{"packageName":"@opengsd/gsd-core","version":"1.19.0"}`；`GSD_VERSION=1.19.0 GSD_TARBALL=…1.19.0.tgz node build.mjs` → `integrity verified against THIRD-PARTY-NOTICES.md (sha512 + sha1)`；篡改 tarball 副本 → exit 2 `checksum mismatch`；NOTICES 1.19.0 行与 npmjs/npmmirror 双镜像**逐字节一致**且行值等值（shasum `32a608…` / integrity `sha512-3j2ejy…`） |
| 8 | engines/README 一致性防线（docs-consistency ①-⑦） | ✓ VERIFIED | 本趟 docs-consistency 7/7；直读断言面（Node ≥ 24 双语、窗口串双语且与 pins 等值、示例 parseVersion 合法、旧编码零出现、range/tag 零出现、private 哨兵、allow-version 声明）；上游 `engines.node` 实测 1.20.1/1.19.0 均 `>=24.0.0`，与 package.json `>=24` 一致 |
| 9 | README 双语版本方案 + BUILD.md §⑨ 文档位 | ✓ VERIFIED | README：`dsh-gsd@1.20.1-1.dsh022` 安装示例（zh L19 / en L89）、升级/回滚 exact 成对（L35-36 / L105-106）、版本方案表与 dsh022/dsh021 映射（L43/L47、L113/L117）、allow-version 风险声明（L55/L125）、Node ≥ 24（L52/L122）；BUILD.md §⑨ L164-201（字段表/行↔pin 指针/check-pins 三调用/refresh 手续/matrix 轴语义） |
| 10 | gsdtest 实例身份与版本快照 | ✓ VERIFIED | 本趟实测 `$DSH_PROFILE_DIR=/Users/yue.weny/.dsh/profiles/gsdtest` 内 `node_modules/dsh-gsd/package.json` → `version 1.20.1-1.dsh022`、窗口正确；`runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；3091 监听 pid 95618，`lstart` 2026-11-11T17:38:26Z > 复原重装 16:46:14Z |
| 11 | doctored fixture 活体拒绝 + stderr 可解释 | ✓ VERIFIED | verify-evidence.md 记录 exit 1 + 完整 stderr（`installation rejected` + requirements 窗口 + `allow-version` 双指引 + `nothing was installed`），探针时间 16:45:55Z 在重装之后；本趟**独立复现宿主判词**：同宿主对 0.2.1-rc.5 的 reject 返回 `requirements.engines.dsh` 非空，与拒绝语义同源；活体 add 属状态变更型探针，本趟不重跑（与旧报告同口径） |
| 12 | 三项复验（独立 CLI / /gsd-health / read 精确 .env 硬拦） | ✓ VERIFIED | 独立 CLI 本趟亲测（identity JSON）；**read 精确 `.env` 本会话实测被 guard 硬拦**（完整文案：`Secret read guard: Read would read '/tmp/gsd-verify/.env'…`），对照 `benign-ctl.out` 正常放行（positive/negative 双证）；`/gsd-health` 0 errors / 2 warnings（W016/W010/W025 具体归因）记录在案，且与该进程上的 identity/guard/dump-config 实测互证 |
| 13 | dump-config 两行 + ~/.dsh 零新增（Phase 1 契约回归） | ✓ VERIFIED | 本趟 `dsh --profile gsdtest --dump-config` → L1280 `- id: gsd`、L1282 `- id: gsd-hooks-bridge`（整行精确各 1）；受管文件复采 1074 vs 基线 1066，`comm -13` 的 8 条新增**全部是 `teamclaw-*` 技能**（mtime 2026-11-12T03:15–12:36Z，外部部署），`/skills/gsd-` 与 `dsh-gsd` 路径新增计数 **0**——dsh-gsd 安装侧零写入成立 |

**Score:** 13/13 truths verified（0 present-but-behavior-unverified；0 override）。

### Requirement ID 交叉核对（PLAN frontmatter ↔ REQUIREMENTS.md）

| Requirement | 声明计划 | 描述（REQUIREMENTS.md） | Status | Evidence |
| ----------- | -------- | ---------------------- | ------ | -------- |
| VER-01 | 02-01, 02-03 | `engines.dsh` 门槛拒绝/禁用不兼容版本安装 | ✓ SATISFIED | 宿主双向探针本趟实跑（install-ok / reject 各 exit 0）+ 活体安装期拒绝（exit 1 + 可解释 stderr 全文）+ 窗口串双语锁定（docs-consistency ②） |
| VER-02 | 02-01, 02-02 | 版本号方案 `<gsd-ver>-<rev>-dsh<line>`，升级/回滚=同命令换版本号 | ✓ SATISFIED | version 迁移单键 diff（9847eb5）+ version.test 3/3（12 非法样本）+ README/BUILD 双语示例 + 篡改负向 exit 2（旧记录）与解析白名单收紧（WR-01）在码 |
| VER-03 | 02-01, 02-02 | 每个 DSH 兼容行有构建/冒烟验证记录（CI matrix，当前行 + 前一行） | ✓ SATISFIED（CI 首绿 deferred） | 4 格在码（当前行 2 install-ok + 前行 2 reject）+ 两 DSH 行双向探针实测 + GSD 轴 1.20.1/1.19.0 两值构建全绿；GitHub runner 首绿按 D-R4 归 Phase 3（deferred，非 gap）。**注**：WR-06 显示「轴值必须回溯 lines」这一环未被机器锁定——当前判据成立，属硬化缺口（见下文） |
| VER-04 | 02-02 | Node ≥ 24 门槛与 GSD 引擎要求一致并在 README 声明 | ✓ SATISFIED | 上游 `engines.node >=24.0.0`（1.20.1/1.19.0 实测）↔ package.json `>=24` + README 双语声明 + docs-consistency ① 锁定 |
| DEV-03 | 02-03 | 每个 phase 完成物在验证实例 gate 通过才算 done | ✓ SATISFIED | verify-evidence.md 全册 + 本趟活体复核（pid 95618 / identity / 版本快照 / guard 硬拦 / dump-config 五项亲测）+ 新快照声明机器成立（pid lstart > 复原重装） |

ROADMAP 指派给 Phase 2 的 5 个 ID（VER-01..04, DEV-03）**全部**被计划 frontmatter 声明（02-01: VER-01/02/03；02-02: VER-02/03/04；02-03: DEV-03/VER-01），**无 ORPHANED**。ROADMAP 4 条 Success Criteria 全部落在上表 13 条 truth 内（SC1→#5、SC2→#6/#9、SC3→#11（+#4）、SC4→#1/#2/#3/#7）。

### Deferred Items（Step 9b——后续 phase 明确承接，不影响状态）

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | compat-matrix CI 在 GitHub runner 上首次真实跑绿（“CI 冒烟”的真机执行记录） | Phase 3 | D-R4 决策 + ROADMAP Phase 3 goal「建仓」+ 02-CONTEXT「push 是 Phase 3 发布步的前置」+ BUILD.md §⑨「CI 首绿时点归 Phase 3」 |

### Advisory (New Scope, Unevidenced)

None — 本趟 Step 7 扫描未产生任何新的、无确定性证据的 blocker。WR-05 / WR-06 / IN-04 不是本趟新发现，而是 02-REVIEW.md 既有 open 发现，另列于「Known Open Findings」。

### Required Artifacts（11/11 三层次通过）

`gsd_run query verify.artifacts` 三计划全部 exit 0（02-01 5/5、02-02 5/5、02-03 1/1 `all_passed`），且每个文件均经本趟逐一实读（非仅存在性）：

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `build/assets/pins.json` | 行↔pin 单文件真源 | ✓ VERIFIED | 键值逐字核对；被 check-pins / tests / workflow 三方消费（见 Key Links） |
| `build/lib/check-pins.mjs` | 一致性校验器（exit 0/1/2，导出 parse/validate） | ✓ VERIFIED | (a)–(k) 校验序在码；15 处 `finish(2)`；离线/在线各 exit 0；导出面被两测试 import |
| `build/lib/compat-probe.mjs` | 宿主求值探针（不自算 semver） | ✓ VERIFIED | 唯一兼容判定 = `host.evaluatePluginCompatibility`（L88）；hostVersion guard L75-76；本趟 4 种退出契约实测 |
| `.github/workflows/compat-matrix.yml` | 矩阵 CI 本体（4 格） | ✓ VERIFIED | 4 格 × 6 步；actionlint 0 findings；幽灵格突变变红 |
| `tests/compat-matrix.test.mjs` | 静态防线 ①-⑦ | ✓ VERIFIED | 7/7 pass；整行锚定 + 笛卡尔积精确等值（WR-04 在码） |
| `tests/version.test.mjs` | 版本方案 parse/validate 单测 | ✓ VERIFIED | 3/3 pass；12 非法样本；消费 check-pins 导出 |
| `tests/docs-consistency.test.mjs` | 文档/清单一致性 ①-⑦ | ✓ VERIFIED | 7/7 pass；断言面直读 |
| `README.md` | 双语示例/方案表/映射/风险声明 | ✓ VERIFIED | 行号级核对（见 truth #9） |
| `BUILD.md` | §⑨ 版本与 pin 对齐章 | ✓ VERIFIED | 字段表/指针对照/三调用/refresh/轴语义齐备；L16 计数 26/26 与实测一致 |
| `THIRD-PARTY-NOTICES.md` | 1.19.0 canonical 行 | ✓ VERIFIED | 双镜像逐字节一致；① 档真实消费（本趟复跑） |
| `.planning/phases/02-compat-matrix/verify-evidence.md` | 复验证据册 | ✓ VERIFIED | Task 1 七行 + 负向 stderr 全文 + Task 2 五项 + 新快照声明闭环，无占位 |

### Key Link Verification

| From | To | Status | Details |
| ---- | -- | ------ | ------- |
| `build/assets/pins.json` | package.json（engines/deps/peer/version） | ✓ WIRED | 工具 4/4 verified；本趟 check-pins 实跑 exit 0 + （旧记录）篡改负向 exit 2 列双边值 |
| `build/lib/compat-probe.mjs` | 宿主 `evaluatePluginCompatibility` | ✓ WIRED | 工具 verified；本趟双向实跑 exit 0；guard 负向 exit 1 |
| `.github/workflows/compat-matrix.yml` | check-pins + compat-probe | ✓ WIRED | 工具 verified；直读步骤链（L33/L37-38） |
| `tests/compat-matrix.test.mjs` | `build/assets/pins.json` | ✓ WIRED | 工具 verified；7/7 pass |
| check-pins 导出 | version.test / docs-consistency | ✓ WIRED（手工） | 工具因 `from` 带中文后缀判 not-found（假阴性）；直读两文件 `import { parseVersion… } from '../build/lib/check-pins.mjs'`（version L16 / docs L15） |
| NOTICES 1.19.0 行 | build.mjs ①/② 档 `checkTarballIntegrity` | ✓ WIRED（手工+实测） | 工具假阴性（`from` 非纯路径）；直读 build.mjs L164-183（读表 → SHA-512/SHA-1 双对照 → exit 2）+ 本趟 ① 档正/负双向实测 |
| README 版本方案表 | BUILD.md §⑨ | ✓ WIRED（手工） | 工具假阴性；README L65/L135 链 BUILD.md，BUILD §⑨ L167 反链 README |
| verify-evidence.md | 实例复验动作 | ✓ WIRED（手工） | 工具假阴性（`from` 非纯路径）；全文实读，runtime-identity/版本/guard/dump-config/新快照声明逐项在册 |
| `/tmp/gsd-compat-fixture` | plugin-manager preflight | ✓ WIRED（手工） | 工具拒绝项目外路径；evidence 记录完整命令与 stderr 全文；本趟以宿主 reject 判词独立佐证 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| check-pins | `pins.lines/pins.version` | `build/assets/pins.json`（真源文件） | 是（逐项等值，不符 exit 2） | ✓ FLOWING |
| compat-probe | `manifest` / `hostVersion` / `evaluatePluginCompatibility` | 真实 package.json + 已安装宿主模块 | 是（宿主返回值判定，无静态兜底） | ✓ FLOWING |
| compat-matrix workflow | `matrix.dsh/gsd/expect` + `inputs.*` | YAML 矩阵 + dispatch 输入 | 是（每格真跑探针/build/test） | ✓ FLOWING |
| build.mjs ①/② 档 | NOTICES canonical shasum/integrity | THIRD-PARTY-NOTICES.md + 真实 tarball 字节 | 是（SHA-512/SHA-1 双对照，篡改 exit 2） | ✓ FLOWING |

### Behavioral Spot-Checks（本趟实测，除标注外均 <10s）

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| quick loop（3 套） | `node --test tests/version.test.mjs tests/compat-matrix.test.mjs tests/docs-consistency.test.mjs` | 17 tests / 17 pass / 0 skip（0.11 s） | ✓ PASS |
| 全量套件（只跑一次） | `node --test tests/*.test.mjs` | 26 tests / 26 pass / 0 fail / 0 skip（8.39 s） | ✓ PASS |
| pins 全等（离线） | `node build/lib/check-pins.mjs --offline` | exit 0 `pins: all consistent (line dsh022)` | ✓ PASS |
| pins 全等（在线取样） | `node build/lib/check-pins.mjs` | exit 0（两件 bridge pin 取样等值） | ✓ PASS |
| 当前行宿主求值 | /tmp：`npm install … --force @deepseek-ai/dsh@0.2.2-rc.1` + `compat-probe --expect install-ok` | exit 0 `install-ok confirmed …` | ✓ PASS |
| 前一行宿主求值 | /tmp：`npm install … --force @deepseek-ai/dsh@0.2.1-rc.5` + `compat-probe --expect reject` | exit 0 `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}` + `reject confirmed` | ✓ PASS |
| guard 负向 | 宿主 0.2.2-rc.1 时 `--dsh 0.2.1-rc.5` | exit 1 `host boot version 0.2.2-rc.1 != requested 0.2.1-rc.5` | ✓ PASS |
| 用法错误契约 | `--expect bogus` / 缺 `--dsh` / 期望错配 | exit 1 / exit 1 / exit 2 | ✓ PASS |
| 默认构建 | `node build.mjs` | exit 0 `gates: all passed (A/B/C)` + 76 trees / 286 files / 72 skills | ✓ PASS |
| GSD 轴 1.19.0 构建 | `GSD_VERSION=1.19.0 node build.mjs` + identity | exit 0 gates A/B/C；`{"packageName":"@opengsd/gsd-core","version":"1.19.0"}` | ✓ PASS |
| NOTICES ① 档消费 | `GSD_VERSION=1.19.0 GSD_TARBALL=…1.19.0.tgz node build.mjs` | exit 0 + `integrity verified against THIRD-PARTY-NOTICES.md (sha512 + sha1)` | ✓ PASS |
| NOTICES 篡改负向 | 同命令 + /tmp 追加 1 字节的 tarball | exit 2 `checksum mismatch (expected de3d9e… sha512 / 32a608… sha1)` | ✓ PASS |
| SBOM 双镜像 | `npm view @opengsd/gsd-core@1.19.0 dist.integrity dist.shasum` × npmjs/npmmirror | 两镜像逐字节一致，且与 NOTICES 行等值 | ✓ PASS |
| 上游 Node 门槛 | `npm view @opengsd/gsd-core@{1.20.1,1.19.0} engines.node` | 均 `>=24.0.0` | ✓ PASS |
| workflow 语法 | `actionlint .github/workflows/compat-matrix.yml` | exit 0，0 findings | ✓ PASS |
| 幽灵格（WR-04 回归） | /tmp：轴不变 + 多 1 格 | test ② **红**（7 tests / 6 pass / 1 fail） | ✓ PASS |
| 活体 guard | 本会话 read `/tmp/gsd-verify/.env` | guard 硬拦（完整文案）；对照 `benign-ctl.out` 放行 | ✓ PASS |
| 活体身份/快照/两行 | profile `runtime-identity` + package.json + `--dump-config` | `@opengsd/gsd-core@1.20.1` / `1.20.1-1.dsh022` / L1280+L1282 | ✓ PASS |
| 活体新快照 | `lsof :3091` + `ps -o lstart` | pid 95618，lstart 2026-11-11T17:38:26Z > 复原重装 16:46:14Z | ✓ PASS |
| 受管文件零新增 | `find ~/.dsh/{skills,gsd-core,hooks}` + `comm -13` 基线 | 8 条新增全部 `teamclaw-*`，gsd-*/dsh-gsd 新增 0 | ✓ PASS（归因外部） |
| Phase 01 回归套件 | `node --test tests/build-smoke.test.mjs tests/rewrite-map.test.mjs` | 9/9 pass，exit 0（11.97 s） | ✓ PASS |

### Probe Execution（Step 7c——自进程复跑，非采信 SUMMARY）

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| `build/lib/compat-probe.mjs`（install-ok 格） | /tmp 隔离副本 + 宿主 0.2.2-rc.1 | exit 0 | ✓ PASS |
| `build/lib/compat-probe.mjs`（reject 格） | /tmp 隔离副本 + 宿主 0.2.1-rc.5 | exit 0 | ✓ PASS |
| `checkTarballIntegrity`（正） | `GSD_TARBALL=…1.19.0.tgz` | exit 0 + integrity verified | ✓ PASS |
| `checkTarballIntegrity`（负） | 篡改副本 | exit 2 checksum mismatch | ✓ PASS |

（02-03 的活体 `dsh plugin add file:` 负向探针会改写 profile 状态，本趟不做状态变更型复跑——以 verify-evidence 的 exit 1 + stderr 全文为准，并以本趟同宿主 reject 判词交叉佐证。）

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | 11 个 phase 实现/文档文件无 TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER | — | 无债务标记 blocker；`parseVersion` 的 `return null` 为解析契约，非 stub |

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
| --------- | ---------- | ------ | ------- | -------- | --------------- | ------- |
| `tests/compat-matrix.test.mjs` | VER-03 / VER-02 | 7 | 0 | 否 | Value（整行解析 + `deepEqual` 笛卡尔积） | ✓（IN-04 为断言强度残余，见 Known Debt） |
| `tests/version.test.mjs` | VER-02 | 3 | 0 | 否 | Value（`deepEqual` / `equal`） | ✓ |
| `tests/docs-consistency.test.mjs` | VER-04 / VER-02 | 7 | 0 | 否 | Value（`equal` / `includes` 计数） | ✓ |
| `tests/build-smoke.test.mjs` | Phase 01 回归 | 2 | 0 | 否（fixture 写 `.env`/篡改缓存用于负向，非期望值自生成） | Behavioral（真实构建 + gates） | ✓ |
| `tests/rewrite-map.test.mjs` | Phase 01 回归 | 7 | 0 | 否 | Value（映射表 `deepEqual`） | ✓ |

**Disabled tests on requirements:** 0（full suite `skipped 0`）。**Circular patterns:** 0。**Insufficient assertions:** IN-04 一条（⑦ 存在性哨兵），已登记，不影响 must-have 判据。`tests/pending-phase-3/` 未运行、未计数、未覆盖（glob `tests/*.test.mjs` 不递归）。

### Decision Coverage

`gsd_run query check.decision-coverage-verify` → `{skipped: true, blocking: false, reason: "no trackable decisions", total: 0}`。02-CONTEXT 的 `<decisions>` 为规划期锁定决策（planner 逐条映射），门按契约干净跳过（非评估失败）；本趟人工复核 D-R1/D-R3/D-R4/D-R5/D-R6 与 A6 在 pins.json / workflow / README / BUILD §⑨ / SUMMARY 中均有落点。

---

## 禁区（Prohibitions）逐条处置

| ID | 要求（缩写） | Tier | 处置 | 证据 |
|----|------|------|------|------|
| P2-01 | 不得扩大窗口/自动豁免绕过拒绝 | judgment | honored，⚠ flagged（human review recommended） | engines.dsh 自 Phase 1 零变化；`allow-version`/`accept-risk` 仅作 README 风险声明（docs-consistency ⑦ 锁定），代码/CI 零自动触发路径 |
| P2-02 | 不得回到带点线号/字母 rev 编码 | test | ✓ wired | `parseVersion` 正则 `^(0\|[1-9]\d*)\.…-([1-9]\d*)\.dsh(\d{3})$` + version.test ② 12 负样本全 null + docs-consistency ④ |
| P2-03 | 矩阵格不得未跑宿主求值即标绿 | judgment | honored，⚠ flagged（human review recommended） | 6 步门控下每格步骤链必含 `compat-probe --expect`；静态检查不作兼容证据。**残余**：WR-05 的零匹配路径是「全 skip」而非「单元格标绿」，已登记 T-2-09，不判本项违反 |
| P2-04 | pin 漂移不得静默存在 | test | ✓ wired | check-pins 15 处 `finish(2)` 逐项列名；篡改 version → exit 2；在线 drift → exit 2；取样失败/超时 → exit 1（非零）。**残余**：WR-06 的幽灵轴在比较器覆盖面之外，见 Known Debt |
| P2-05 | 文档不得出现 range/tag 安装规格 | test | ✓ wired | docs-consistency ⑤ 全绿（捕获组一律数字开头 + 无 `@latest`）+ ③ 全部示例 parseVersion 合法 |
| P2-06 | 证据必须来自验证实例 | judgment | honored，⚠ flagged | verify-evidence 全部动作录于 gsdtest/3091；本趟在同一实例（pid 95618）活体复核 identity/版本/guard/dump-config |
| P2-07 | 证据必须来自重装后新快照 | judgment | honored，⚠ flagged | 机器时间链：build 16:44:37Z → add 16:44:48Z → 探针 16:45:55Z → 复原重装 16:46:14Z → 重启 17:38:26Z（pid 95618，本趟 lsof/ps 复测一致）；禁旧快照声明在册 |

> ⚠️ 4 条 judgment-tier 禁令按 ADR-550「B-with-guard」处置：机器证据齐全（非无证据 abstain），但判定层为 LLM-judge，非权威；**human review recommended**——不静默吸收（全部旗标化），也不硬停自主运行（AFK 合同：complete with 4 flagged prohibitions）。test-tier 3 条全部有 wired enforcement，无 `unverified`。

---

## Known Open Findings（代码审查既有 open 项——本趟逐条判定 must-have 影响）

> 三条均来自 `02-REVIEW.md`（HEAD 复审新增），`02-REVIEW-DISPOSITION.md` 记 `open`。本趟**独立复现**了 WR-06 与 IN-04 的突变证据，WR-05 以结构证据复核。**三条均不否定任何 must-have truth**；结论已在下表逐条写明。

| ID | 级别 | 本趟复核 | 是否 must-have 失败 | 处置 |
| -- | ---- | -------- | ------------------- | ---- |
| WR-05 | warning | 复核属实：6 步（2 `uses:` + 4 `run:`）全挂同一条 `if:`；job 级 `if:` 0 处；无 `always()` / 无 dispatch 前置 guard（`grep` 计数 0）。`workflow_dispatch` 填入矩阵外值 → 4 格 × 6 步全 skip → GitHub 记 job/workflow success，零验证出绿。**否**——最接近的 must-have（#5：workflow 存在且含 4 格 + 探针步）未被否定；4 格仍在、每格仍必跑探针。这是「未激活 workflow 的过滤路径假绿」，且 CI 首绿已 deferred 至 Phase 3（D-R4）。安全侧同源登记 T-2-09（medium，open — below `block_on: high`，故意不计入 `threats_open`）；两个独立审计收敛于同一缺陷，但丢弃级别一致：非阻塞 | 否 | 记为质量债；建议 Phase 3 激活前补无 matrix 的 preflight guard（02-REVIEW WR-05 Fix 已给可落地片段）；在 T-2-09 未闭环前不得把该 workflow 设为 required check |
| WR-06 | warning | 复核属实（本趟突变）：`pins.matrix.dsh` 追加幽灵轴 `0.3.0-rc.1` + workflow 补 2 格 → `node --test tests/compat-matrix.test.mjs` **7/7 pass**、`check-pins --offline` **exit 0**；恢复后 7/7 绿（无假红）。② 锁 workflow⇄pins.matrix、③ 锁 expect⇄lines，但缺 `matrix.dsh ⊆ pins.lines` 这一环。**否**——VER-03 的现时判据（当前行 + 前一行均有构建/冒烟记录）成立；幽灵轴是**未来**可静默引入的轴值，不是当前仓库状态。truth #1 的「matrix.dsh === ['0.2.2-rc.1','0.2.1-rc.5']」逐字成立，truth #5 要求的是「轴值 ⊆ pins.matrix」而非「⊆ lines」 | 否 | 记为硬化缺口/质量债；修法有两条（测试 ③ 前加 `lineDsh.includes(d)` 断言；check-pins (b) 段镜像 fail-closed）。建议随 Phase 3 首次激活一并收口——尤其 rc.2 这类「真实存在但未 pin」的版本正适合踩这个坑 |
| IN-04 | info | 复核属实（本趟三组突变，均 7/7 绿）：① 门取反 `!((…)&&(…))`；② `&&`→`\|\|` 跨轴泄漏；③ 去掉两个 `uses:` 步的 `if:`（门行剩 4）。⑦ 只断 4 token 存在、且只查 `run:` 步的上一行。**否**——truth #5 要求「tests 断言轴值 ⊆ pins.matrix 且 workflow 引用 build/lib 路径」，已满足；IN-04 是断言强度，不是断言缺失 | 否 | 记为 info 级测试硬化项；建议按 02-REVIEW IN-04 Fix 升级为「表达式全文等值 + 覆盖 `uses:` 步」 |

**为什么整体不升格为 `gaps_found`：** Step 9 规则 1 的触发面是「truth FAILED / artifact MISSING·STUB / key link NOT_WIRED / blocker anti-pattern」。本趟三者皆无：13/13 truth 通过、11/11 artifact 三层次通过、9/9 key link wired、0 债务标记。三条发现描述的是**防护网强度**而非**交付物缺失**，且都落在「未来改动可能静默通过」的面上；当前仓库状态没有任何一格、任何一轴、任何一条 pin 处于未验证却标绿的状态（本趟逐格/逐轴核对）。按证据门（#3304）它们也不是 carried-forward gap（旧报告 `gaps: []`）——但相关文件在旧 `verified` 之后被 fix 提交修改过，故即使提升为 blocker 也属 in-contract；本趟的判定是**它们够不上 blocker 定义**，而不是被证据门降级。

---

## 已知上游漂移（已读处置，不计 Phase 02 gap，不复议）

`@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.2` / `@deepseek-ai/dsh-fs@0.2.2-rc.2` 于 2026-11-12T01:54–02:00Z 发布（晚于本 phase 全部证据）。本趟**只做事实确认、不做处置再议**：

- `npm view @deepseek-ai/dsh-skill-filesystem versions` 实测含 `0.2.2-rc.2`（与处置记录一致）。
- L37 原文命令（无 `--force`）在 /tmp 隔离目录实测 **exit 1 ERESOLVE**（`While resolving: dsh-gsd@1.20.1-1.dsh022` / `Found: @deepseek-ai/dsh-fs@0.2.2-rc.1`），与 `02-VALIDATION.md` 记录一致；`--force` 形态两向探针绿（本趟复跑）。
- **处置已由用户裁决并记录在 `02-VALIDATION.md`**：按「已知上游漂移」归档，**不**作 Phase 02 未决 gap、**不**在本次验证中改 `compat-matrix.yml`、**移交 Phase 3**（CI 首次激活前给安装步加豁免：`--force` 已实测；**不可** `--legacy-peer-deps`）。本报告不重复裁决、不计入 gaps、不计入 `known_debt`。Phase 02 从未声称 CI 已绿（D-R4 明确首批绿归 Phase 3）。

---

## Human Verification Required

N/A — 本 phase 为基础设施/工具链 phase（兼容矩阵、pin 校验器、宿主探针、CI 文件、版本文档），无面向用户的可交互元素；成功标准全部可编程验证，且本趟已对全部可复跑命令做独立进程实测。无 ⚠️ PRESENT_BEHAVIOR_UNVERIFIED、无 `insufficient_spec` abstain。

唯一提醒（非必须人工步骤）：4 条 judgment-tier 禁令为 **human review recommended**（见 Prohibitions 表）；WR-05/WR-06/IN-04 为已登记质量债（建议 Phase 3 收口，不阻塞本 phase 判定）；CI 首次真机绿为 D-R4 下的 Phase 3 deferred 项。

## Gaps Summary

无 must-have gap。13/13 truths verified，11/11 artifacts 三层次通过，9/9 key links wired，0 blocker，0 human UAT 项。附记三类非阻塞尾注：① 4 条 judgment-tier 禁令旗标（机器证据 + LLM 判决，建议人工复查）；② 3 条代码审查 open 发现（WR-05 / WR-06 / IN-04）经本趟独立复核，**均不构成 must-have 失败**，登记为质量债并给出收口建议；③ CI 首次真机绿按 D-R4 归 Phase 3（deferred），叠加已裁决的上游 registry 漂移处置（移交 Phase 3、不在本 phase 修）。

---

_Verified: 2026-11-12T04:49:06Z_
_Verifier: DeepSeek (gsd-verifier)_