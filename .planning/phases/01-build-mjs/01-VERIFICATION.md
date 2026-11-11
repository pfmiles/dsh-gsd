---
phase: 01-build-mjs
verified: 2026-11-11T10:08:06Z
status: human_needed
score: 14/14 must-haves verified
covered_files: [".gitignore", ".planning/phases/01-build-mjs/01-01-PLAN.md", ".planning/phases/01-build-mjs/01-01-SUMMARY.md", ".planning/phases/01-build-mjs/01-02-PLAN.md", ".planning/phases/01-build-mjs/01-02-SUMMARY.md", ".planning/phases/01-build-mjs/01-03-PLAN.md", ".planning/phases/01-build-mjs/01-03-SUMMARY.md", "BUILD.md", "README.md", "THIRD-PARTY-NOTICES.md", "build.mjs", "build/assets/dsh-gsd-suite-run.cjs", "build/assets/gsd-hooks.json", "build/lib/rewrite-map.cjs", "package.json", "tests/build-smoke.test.mjs", "tests/rewrite-map.test.mjs", "tests/run-gates.sh"]
covered_digest: "v3:sha256:4175d06510685a508b841e688c17b84d7f265fd0eb7bc971a903d275dda590dc"
behavior_unverified: 0
overrides_applied: 0
prohibitions_flagged: 3
phase_type: infrastructure
decision_coverage: "skipped (gate reported no trackable decisions; CONTEXT <decisions> manually reviewed — all honored)"
human_verification:
  - test: "复核改写映射诚实性（01-02 SKIL-04 judgment 禁项）——抽查若干改写后 SKILL.md / 引擎文件中的路径引用（$DSH_PROFILE_DIR/node_modules/dsh-gsd/… 与 $DSH_HOME/… 形态），确认每一条都指向部署态真实存在的目标，不存在安抚式删除"
    expected: "每一条改写后引用都可在部署态（插件包内或 $DSH_HOME）解析；gate B 是真拒绝而非绕行"
    why_human: "judgment-tier 禁项：gate 只能机械反『残留/误杀』，无法机器证明『每条改写目标在部署态可解析』；LLM-judge 初判 satisfied——改写目标仅两类部署态构造（包内锚点 $DSH_PROFILE_DIR/node_modules/dsh-gsd、$DSH_HOME），无删除形态、负向 fixture 与 gate B 三段式 fail-closed——但按 ADR-550 D4 必须人工复核"
  - test: "确认 DEV-03 证据来自 gsdtest/3091 验证实例（01-03 DEV-03 禁项①）——按 verify-evidence.md 与 01-SECURITY.md 审计实据核对三项复验确为实例侧执行而非主机器本地检查"
    expected: "证据链的实例侧 provenance 成立（$DSH_PROFILE_DIR 展开、pid 90223 存活、进程级 {\"decision\":\"block\",\"code\":\"secret-read\"} 输出、--dump-config 两行）"
    why_human: "judgment-tier 禁项：验证器无法在会话内重启 3091 实例复跑交互复验（当前会话即宿主）；LLM-judge 初判 satisfied——UTC 时间戳/新快照声明/安全审计独立交叉复核（01-SECURITY 2026-11-10T14:32Z 现场复证）齐备——provenance 判定需人工拍板"
  - test: "确认无旧 file: 安装快照充当新产物证据（01-03 DEV-03 禁项②）——核对第二轮 --force add ≈13:57:48Z → 重启 pid 90223 lstart 13:58:39Z 的先后关系，以及已装 hooks/dsh-gsd-suite/run.cjs 与 build/assets canonical 逐字节一致"
    expected: "全部通过形态来自含修复快照的新 token 会话；第一轮旧快照输出仅作根因历史"
    why_human: "judgment-tier 禁项：快照新鲜度由『进程 lstart 晚于 add 时刻』+ 逐字节比对佐证，验证器不能回放该时序；LLM-judge 初判 satisfied，接受该声明需人工确认"
---

# Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用） Verification Report

**Phase Goal:** build.mjs 支持 `GSD_VERSION` 从 `@opengsd/gsd-core@<version>` npm tarball 取材并经官方 `--claude` staging，改写映射以 staging 根为基准；产物含 scripts/，独立 CLI 全绿。
**Verified:** 2026-11-11T10:08:06Z（initial verification）
**Status:** human_needed（14/14 must-haves VERIFIED；3 项 judgment-tier 禁项 flagged → 人工复核；无 gaps）
**Re-verification:** No — initial verification

## Goal Achievement

All five ROADMAP Success Criteria independently re-run by the verifier on this machine plus the recorded verify-evidence for the instance-side SC5.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | SC1：`GSD_VERSION=1.20.1 node build.mjs` 在线/离线产出 76 棵树 | ✓ VERIFIED | 本机三形态全跑：在线 ④ npm pack（exit 0·gates A/B/C·76 trees）、离线 ① GSD_TARBALL + dead registry（exit 0·76 trees）、② .build-cache（`npm run build` exit 0）；identity 每次 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` |
| 2 | SC2：改写不再依赖机器特定前缀（staging 根为基准） | ✓ VERIFIED | rewrite-map.cjs 无任何 `/Users/` 字面量（from 仅 `stagingRoot` + `~/.dsh` + `$HOME/.dsh` 回退；裸 `$HOME` 惯用语不清洗——单测⑥）；gate B 三段式四次构建全绿；产物 grep `/(Users\|home)/…/`（skills）= 0、staging 根残留 = 0 |
| 3 | SC3：repo 产物独立 CLI 输出身份 JSON | ✓ VERIFIED | `node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` exit 0（verifier 直跑 + build-smoke ③） |
| 4 | SC4：fetched≠requested 构建失败 | ✓ VERIFIED | verifier 负向实测：③档伪包 1.19.9 + 请求 1.20.1 → **exit 2 "fetched version 1.19.9 != requested 1.20.1"（staging 前拦截）**；`GSD_VERSION=banana` → exit 2 格式守卫 |
| 5 | SC5：验证实例重装后 `/gsd-health` + 独立 CLI + `.env` 拦截三项复验 | ✓ VERIFIED (recorded live evidence) | verify-evidence.md 两轮 user_setup + 含修复快照声明（pid 90223 lstart 13:58:39Z 晚于终轮 add 13:57:48Z；wrapper 与 canonical 逐字节一致），01-SECURITY 审计独立交叉复证；交互段无法由验证器在本会话复跑——见 2 条 DEV-03 judgment 禁项（human_verification） |
| 6 | 离线链 fail-closed：无档 exit 1 列档位；①档断网重建身份不变；篡改 exit 2 | ✓ VERIFIED | verifier 实测：cache 移开 + `npm_config_registry=http://127.0.0.1:9` → **exit 1** + ①-④档清单 + BUILD.md 指引；同环境 ①档 → exit 0 + identity；②档篡改 → exit 2 checksum mismatch（build-smoke WR-01 负向） |
| 7 | rewrite-map 模块：9 对映射、最长/最具体在前、CJS 导出、PLUGIN_ROOT_REF 单一来源 | ✓ VERIFIED | 单测 ①-⑦ 7/7；module.exports = { makeRewrites, PLUGIN_ROOT_REF }；build.mjs:26 导入消费（IN-02 修复在位） |
| 8 | gate B 三段式（staging 前缀 / 本机 homedir / skills 字面）| ✓ VERIFIED | run-gates.sh:42-78 三段独立探测（grep 显式出口码：0=命中失败/1=干净/2=扫描错误）；正路径 4× 全绿；01-02 记录的 fixture 负向（B1/B3 exit 2 + gate 名文案） |
| 9 | gate C：72 个 SKILL.md 各恰 1 个 adapter 块 | ✓ VERIFIED | 每次构建 "gates: all passed (A/B/C)"（gate C 计数含其中）；verifier grep：72 个文件各恰 1 标记；build-smoke ⑤ 同断言 |
| 10 | gate A 双锚（gsd-core/VERSION + runtime-identity）+ 失败 exit 2 | ✓ VERIFIED | 所有构建 gate A 通过；verifier 独立负向 fixture（复制产树、VERSION 改 1.19.9）→ **exit 2 "gate A failed: version mismatch"**；env 缺失 → exit 1 fail-closed（verifier 直跑） |
| 11 | 产物零 `~/.dsh` 字面量 + scripts/ 固化 + 76 树计数 | ✓ VERIFIED | verifier grep：skills/gsd-core/hooks/config 零命中；`scripts/fix-slash-commands.cjs` 在（SKIL-03 MODULE_NOT_FOUND 防线）；build-smoke ②④ |
| 12 | `node --test tests/` 全量绿（含真实构建循环） | ✓ VERIFIED | verifier 实跑 `npm test` → **9/9 pass exit 0**（基线 7 + REVIEW 修复 2：WR-01 负向、IN-02 ⑦）；prepack 链 = build && tests（package.json:45） |
| 13 | BUILD.md 八章覆盖（GSD_VERSION/staging/离线四档/失败模式/exit 0-1-2/gates/交叉核对/复验序） | ✓ VERIFIED | 166 行；关键词计数：GSD_VERSION 17、ENOTCACHED 2、exit 0/1/2 各 9/9/18、run-gates.sh 4、dist.integrity 4；§①-⑧ 与 build.mjs/package.json/run-gates.sh 实况一致（01-03 D2 复核） |
| 14 | README↔BUILD 顶部互链；既有"零安装脚本 / hook 上游 basename"表述未改写 | ✓ VERIFIED | grep 'BUILD.md' README.md → 2 处（zh/en 自举构建段）；code review（01-REVIEW）确认既有表述未动 |

**Score:** 14/14 truths verified（0 present-behavior-unverified；0 override）。

### Prohibitions Ledger（ADR-550 D3/D4）

| 计划 | 禁项（requirement / tier） | 裁决 | Flag |
| --- | --- | --- | --- |
| 01-01 | SKIL-03 不得静默回退本机快照（**test**） | ✓ enforced：main 链不读 GSD_BUILD_SOURCE；无档 exit 1 + 档位清单（verifier 实测）；②档篡改 exit 2（WR-01 负向）；smoke buildEnv 显式 delete | 否 |
| 01-02 | SKIL-04 改写不可安抚式绕过（**judgment**） | ⚠ LLM-judge satisfied（非权威）：改写目标仅部署态构造、无删除形态、gate B fail-closed；详见 human_verification #1 | 是 |
| 01-03 | DEV-03 证据必须来自 gsdtest/3091（**judgment**） | ⚠ LLM-judge satisfied（非权威）：verify-evidence + 01-SECURITY 独立交叉复证；详见 human_verification #2 | 是 |
| 01-03 | DEV-03 不得以旧 file: 快照充当新证据（**judgment**） | ⚠ LLM-judge satisfied（非权威）：新快照声明（pid lstart 晚于 add）+ wrapper 逐字节一致；详见 human_verification #3 | 是 |

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `build.mjs` | fetch→pre-gate→staging→捕获→改写→注入→gates 主链（01-01/01-02） | ✓ VERIFIED | 355 行，全链在；WR-01(②档校验 L205-208)、IN-02(导入 L26)、IN-03(warn L350) 修复在位 |
| `build/assets/gsd-hooks.json` | canonical hooks 模板 | ✓ VERIFIED | 存在且被 ⑤ 捕获段拷贝至 config/gsd-hooks.json（L298） |
| `build/assets/dsh-gsd-suite-run.cjs` | hooks 桥接 stdio adapter canonical（01-03 回归修复） | ✓ VERIFIED | build.mjs L306-307 捕获拷贝；smoke ⑥ 逐字节一致断言 |
| `THIRD-PARTY-NOTICES.md` | canonical shasum/integrity/许可/URL | ✓ VERIFIED | 1.20.1 行在位；被 checkTarballIntegrity 消费（①②档） |
| `.gitignore` | `.build-cache/` 豁免 | ✓ VERIFIED | 包含 |
| `build/lib/rewrite-map.cjs` | 9 对映射纯模块 | ✓ VERIFIED | 单测 ①-⑦ 全绿 |
| `tests/rewrite-map.test.mjs` | 映射单测 | ✓ VERIFIED | 7 tests |
| `tests/run-gates.sh` | gate A/B/C 独立脚本 | ✓ VERIFIED | 101 行；env fail-closed exit 1（verifier 实测） |
| `tests/build-smoke.test.mjs` | 产物断言（76 树/identity/~.dsh/adapter/⑥⑦⑧/WR-01） | ✓ VERIFIED | npm test 9/9 中真实构建 5.3s |
| `package.json` | test/prepack 链 | ✓ VERIFIED (deviation adopted) | plan 逐字 `"test": "node --test tests/"` 于 Node 24.21.0 机械失败 → glob 形态 `node --test tests/*.test.mjs`（WINDOWS #3 已 fixed；npm test 9/9 实证） |
| `BUILD.md` | 八章构建文档 | ✓ VERIFIED | 166 行 / 11 关键词全命中（01-03 D2 口径复盘） |
| `README.md` | 互链定点修改 | ✓ VERIFIED | 2 处互链；无重写 |
| `.planning/phases/01-build-mjs/verify-evidence.md` | DEV-03 证据 | ✓ VERIFIED (recorded) | 78 行，两轮历史 + 新快照声明；judgment 复核见 human_verification |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| build.mjs | 官方 install.js | `CLAUDE_CONFIG_DIR=<STAGING> HOME=<fakehome> … --claude --global` | ✓ WIRED | build.mjs:265-272 spawn 数组形态（verb 连续串 pattern 不匹配属措辞限制，代码直读确认）；我的构建输出含官方 staging 横幅 |
| build.mjs | THIRD-PARTY-NOTICES.md | ①②档解包前 SHA-512/SHA-1 对照 | ✓ WIRED | checkTarballIntegrity L164-184；构建日志 "integrity verified against THIRD-PARTY-NOTICES.md" 实测出现 |
| build/assets/gsd-hooks.json | config/gsd-hooks.json | ⑤ 捕获段拷贝 | ✓ WIRED | build.mjs:298 cp（verb 以两文件内容搜 pattern 未命中属链接措辞限制） |
| build.mjs | build/lib/rewrite-map.cjs | ESM 命名导入 | ✓ WIRED | build.mjs:26 + L312 makeRewrites(STAGING) 调用 |
| build.mjs | tests/run-gates.sh | staging 清理前 spawn + 传播 exit | ✓ WIRED | build.mjs:329-338；失败时 exit 原样传播（留痕语义） |
| package.json prepack | build + 全量测试 | prepack 链 | ✓ WIRED | package.json:45 glob 形态（WINDOWS #3 采纳口径） |
| README.md | BUILD.md | 自举构建段互链 | ✓ WIRED | README.md:52,109 |
| BUILD.md | THIRD-PARTY-NOTICES.md | 交叉核对命令 + SBOM 表 | ✓ WIRED | BUILD.md §⑦（dist.integrity ×4） |
| verify-evidence.md | 验证实例三项复验 | Task 1/2 段记录 + 新快照声明 | ✓ WIRED | 文件直读确认（verb 无法解析非根级相对 from，属链接措辞限制） |

### Data-Flow Trace (Level 4)

| Chain | Source | Flow | Status |
| --- | --- | --- | --- |
| tarball bytes → staging tree → product trees → gates | ①②③④档（integrity gated / pre-gate / npm） | 4× 端到端实跑（在线/离线/缓存） | ✓ FLOWING |
| canonical assets → config/ + hooks/dsh-gsd-suite/ | build/assets/*（仓库 canonical） | 捕获拷贝每轮重放 | ✓ FLOWING（smoke ⑥⑦ 固定断言） |
| 注入 NOTE / 改写映射 | build.mjs 常量 + rewrite-map | 286 文件改写 / 72 注入 | ✓ FLOWING（构建日志实测） |

UI 数据流不适用——基础设施/构建工具phase，无渲染面。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| 全量测试 | `npm test` | 9/9 pass exit 0 | ✓ PASS |
| 全量构建 | `npm run build` | exit 0，gates A/B/C，76 trees | ✓ PASS |
| 身份 CLI | `node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` | @opengsd/gsd-core / 1.20.1 | ✓ PASS |
| SC4 负向 | ③档 1.19.9 + 请求 1.20.1 | exit 2 + "!= requested"（staging 前） | ✓ PASS |
| 版本格式守卫 | GSD_VERSION=banana | exit 2 + 显式文案 | ✓ PASS |
| 离线无档 | cache 移走 + dead registry | exit 1 + ①-④档清单 + BUILD.md | ✓ PASS |
| 离线①档重建 | GSD_TARBALL + dead registry | exit 0 + identity 不变 | ✓ PASS |
| 在线④档重建 | 默认 registry npm pack | exit 0 + 76 trees + identity | ✓ PASS |
| gate A 负向 | 复制产树 VERSION=1.19.9 fixture | exit 2 "gate A failed" | ✓ PASS |
| gates env fail-closed | run-gates.sh 无 env | exit 1 | ✓ PASS |
| 产物残留扫描 | grep ~/.dsh、/(Users\|home)/（skills） | 0 命中 | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
| --- | --- | --- | --- |
| — | `find scripts -path '*/tests/probe-*.sh'` | 无任何 probe 声明 | N/A（本 phase 不依赖 probe 脚本；gates/测试为验证面） |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| SKIL-03 | 01-01/02/03 | 独立 CLI identity + scripts/ 齐备 | ✓ SATISFIED | verifier 直跑 identity；scripts/fix-slash-commands.cjs 在；smoke ③ |
| SKIL-04 | 01-01/02/03 | SKILL.md 零机器绝对路径 + 改写 gate | ✓ SATISFIED | gate B/C 全绿；产物扫描 0；unit ①-⑦ |
| INST-02 | 01-02/03 | 不写 ~/.dsh 受管文件 | ✓ SATISFIED | build 侧零 '~/.dsh'（verifier grep 0）；安装侧 987→987 零新增（verify-evidence Task 1 实录） |
| DEV-03 | 01-03 | 完成物在验证实例 gate 通过 | ✓ SATISFIED (recorded evidence) | verify-evidence 三项 live；2 条 judgment 禁项 flagged → human_verification |

Orphaned check: ROADMAP Phase 1 requirements（SKIL-03/SKIL-04/INST-02/DEV-03）全部被 plan 声明；无 ORPHANED。REQUIREMENTS.md 四项均已置 [x]（与执行器报告一致，verifier 复核确认）。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无。TBD/FIXME/XXX/TODO/HACK/placeholder/stub 扫描全 0；code review（01-REVIEW 6 findings）已由 384b72a 全修，verifier 在本代码中逐项确认 WR-01（L205-208）/IN-02（L26）/IN-03（L350）修复在位 |

### Decision Coverage

Engine gate `check.decision-coverage-verify` → **skipped（"no trackable decisions"，blocking: false）**：01-CONTEXT `<decisions>` 为自由文本清单，非 gate 可追踪形态。Verifier 手动复核 CONTEXT 决策均已兑现：取源切换（tarball 主链）、staging 基准改写、fetched==requested gate、scripts/ 固化、DEV-03 三项复验、文档化、legacy 仅兼容 + 显式告警——逐条映射到 build.mjs/BUILD.md/verify-evidence.md 实证。

### Human Verification Required

本 phase 为 infrastructure/foundation（构建工具），无可发明的人工 UAT 步骤——下述 3 项是 ADR-550 要求的 judgment-tier 禁项人工复核（非用户面检查），全部 LLM-judge 初判为 satisfied、等待人工拍板：

**1. 改写映射诚实性（01-02 SKIL-04 禁项）**
- **Test:** 抽查改写后产物中的路径引用形态，确认每一条都指向部署态真实存在的目标（包内 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` 或 `$DSH_HOME/...`），无安抚式删除。
- **Expected:** 每条引用可解析；gate B 为真拒绝。
- **Why human:** gate 反残留/误杀，无法机器证明"每条目标可解析"。

**2. DEV-03 证据来自 gsdtest/3091 实例（01-03 禁项①）**
- **Test:** 按 verify-evidence.md + 01-SECURITY 审计实据核对三项复验为实例侧执行。
- **Expected:** provenance 成立（$DSH_PROFILE_DIR 展开、pid 90223 lstart 时序、进程级 decision:block 输出）。
- **Why human:** 验证器无法在会话内重启 3091 复跑交互复验。

**3. 无旧 file: 快照充当新产物证据（01-03 禁项②）**
- **Test:** 核对第二轮 add 13:57:48Z → 重启 13:58:39Z 先后关系与已装 wrapper 与 canonical 逐字节一致。
- **Expected:** 通过形态均来自含修复新快照；旧快照输出仅根因历史。
- **Why human:** 快照新鲜度时序无法回放，接受声明需人工确认。

### Gaps Summary

无 gaps：14/14 must-haves VERIFIED（含 verifier 独立重跑的全部验证面），artifact/key-link 全部在位且 wired，anti-pattern 0，WINDOWS 三张 deviation 卡已由 verifier 判定 fixed（1=gate B 三段式、2=gate A 双锚、3=node --test glob 形态——均经本次实测采纳为 1.20.1 契约口径）。综合状态 = human_needed，仅因 3 条 judgment-tier 禁项按 contract 必须人工复核（"complete with 3 flagged prohibitions"）。

## Verification Summary

- 验证器独立重跑的机器面：`npm test` 9/9、`npm run build` exit 0（gates A/B/C + 76 trees）、在线 ④/离线 ①/缓存 ② 三取源形态、SC4 负向 exit 2（staging 前）、离线无档 exit 1、gate A 负向 fixture exit 2、env fail-closed exit 1——全部与执行器 SUMMARY 声称一致。
- 提交链：12/12 文档化 commit hash 经 engine `verify.commits` 确认有效（含修复 2d45fac/e039939/384b72a 与决策 9fb437e）。
- 三 plan 的 artifacts/key-links 经 engine verbs 复核；4 处 verb 未命中均为措辞/形态限制（spawn 数组 vs 连续串、非根级相对 from、已采纳的 glob 偏差），代码直读判定全部 WIRED。
- DEV-03 交互段（SC5）：仅以 recorded evidence 复核（verify-evidence.md + 安全审计交叉佐证），验证器未复跑 live 实例——经 2 条 judgment 禁项 flag 进入人工复核，不静默吸收为 passed。

---

_Verified: 2026-11-11T10:08:06Z_
_Verifier: DeepSeek Harness agent (gsd-verifier)_
