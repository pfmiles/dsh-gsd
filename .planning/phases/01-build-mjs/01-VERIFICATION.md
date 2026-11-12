---
phase: 01-build-mjs
verified: 2026-11-12T03:48:05Z
status: passed
score: 14/14 must-haves verified
covered_files: [".gitignore", ".planning/phases/01-build-mjs/01-01-PLAN.md", ".planning/phases/01-build-mjs/01-01-SUMMARY.md", ".planning/phases/01-build-mjs/01-02-PLAN.md", ".planning/phases/01-build-mjs/01-02-SUMMARY.md", ".planning/phases/01-build-mjs/01-03-PLAN.md", ".planning/phases/01-build-mjs/01-03-SUMMARY.md", ".planning/phases/01-build-mjs/01-REVIEW-DISPOSITION.md", ".planning/phases/01-build-mjs/01-REVIEW.md", ".planning/phases/01-build-mjs/01-SECURITY.md", ".planning/phases/01-build-mjs/01-UAT.md", ".planning/phases/01-build-mjs/01-UI-REVIEW.md", ".planning/phases/01-build-mjs/01-VALIDATION.md", ".planning/phases/01-build-mjs/REVIEW-FIX.md", ".planning/phases/01-build-mjs/verify-evidence.md", "BUILD.md", "README.md", "THIRD-PARTY-NOTICES.md", "build.mjs", "build/assets/dsh-gsd-suite-run.cjs", "build/assets/gsd-hooks.json", "build/lib/rewrite-map.cjs", "package.json", "tests/build-smoke.test.mjs", "tests/rewrite-map.test.mjs", "tests/run-gates.sh"]
covered_digest: "v3:sha256:ab8770cbb359f5ea43e2f9ad7305817566abb6d4e79ee3ab73c9749ea7ff1ccf"
behavior_unverified: 0
overrides_applied: 0
prohibitions_flagged: 3
prohibitions_resolution: "human-confirmed via 01-UAT (3/3 passed, 0 issues)"
phase_type: infrastructure
decision_coverage: "skipped (gate reported no trackable decisions; CONTEXT <decisions> manually reviewed — all honored)"
re_verification:
  previous_status: passed
  previous_status_note: "旧报告 frontmatter=passed / 正文=human_needed（3 项 judgment-tier 禁项待人工）——自身矛盾，按 ADR-550 D4 实为『complete with 3 flagged prohibitions（人工待拍板）』"
  previous_score: 14/14
  what_changed:
    - "BUILD.md 被 phase-02 提交修改两次（e8e9d73 IN-01：TL;DR 测试数 9/9→26/26；e01a244：追加 §⑨ 版本与 pin 对齐）。phase-01 覆盖的 §①-⑧ 与关键词计数（GSD_VERSION 17 / ENOTCACHED 2）未破坏，08 章契约仍成立"
    - "README.md 被 e01a244 追加双语版本号方案段（纯增量）；BUILD.md 互链仍在（README:65 与 :135，原 :52/:109 行号漂移）；零安装/不写 ~/.dsh 既有表述（README:11）与 hook 上游行为叙述未被改写（14ee71c 为纯追加 diff）"
    - "THIRD-PARTY-NOTICES.md 新增 1.19.0 行（phase-02 矩阵轴）；1.20.1 canonical 行原样在位，本趟对 .build-cache tgz 实测 sha512+sha1 双哈希一致"
    - "package.json 被 phase-02 追加 version/engines/dsh.bundle/deps；test/prepack 脚本链未变（glob 形态偏差 2 维持）"
    - "01-UAT.md 三人工项全部人工确认通过（3/3, 0 issues）→ 旧报告 3 项 judgment 禁项由人工拍板闭环"
    - "新增/更新证据文档：01-REVIEW（HEAD re-review 收敛轮 0 findings）、01-SECURITY、01-VALIDATION、01-UI-REVIEW；全部纳入本次指纹"
    - "full suite 由 9/9 增至 26/26：phase-02 套件经 tests/*.test.mjs glob 并入；phase-01 自身 9 项（7 baseline + WR-01 + IN-02⑦）仍在其中且全绿"
  gaps_closed: []
  gaps_remaining: []
  regressions: []
  human_items_resolved:
    - "旧 #1 改写映射诚实性（SKIL-04 judgment 禁项）→ 01-UAT Test 1: pass（人工确认 2026-11-11）"
    - "旧 #2 DEV-03 证据来自 gsdtest/3091 实例 → 01-UAT Test 2: pass（pid/时间链/逐字节一致性交叉复核）"
    - "旧 #3 无旧 file: 快照冒充新证据 → 01-UAT Test 3: pass（两轮 user_setup 全时间链 + 新快照声明）"
---

# Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用） Verification Report（Re-verification）

**Phase Goal:** build.mjs 支持 `GSD_VERSION` 从 `@opengsd/gsd-core@<version>` npm tarball 取材并经官方 `--claude` staging，改写映射以 staging 根为基准；产物含 scripts/，独立 CLI 全绿。
**Verified:** 2026-11-12T03:48:05Z（re-verification — 旧报告 digest 失效：covered 文件在旧验证后被 phase-02/评审修复提交修改）
**Status:** passed
**Re-verification:** Yes — stale re-verification（previous VERIFICATION.md existed at 2026-11-11T10:08:06Z；无 gaps: 段 → 本趟按全量流程重跑 14 truths 与全部验证面）

## Goal Achievement

14/14 truths 在本趟由验证器独立重跑全部验证面（spot-checks、named tests、full suite ×1、full build ×1、负向 fixtures、产物扫描、engine verbs），无 FAILED、无 PRESENT_BEHAVIOR_UNVERIFIED、无 override。

### Observable Truths

| #   | Truth   | Status     | Evidence       |
| --- | ------- | ---------- | -------------- |
| 1   | SC1：`GSD_VERSION=1.20.1 node build.mjs` 在线/离线产出 76 棵树 | ✓ VERIFIED | 本趟 3 形态实跑全绿：②档 `.build-cache`（`npm test` 内真实构建 5.1s + `npm run build` exit 0）、①档 `GSD_TARBALL` + dead registry exit 0；每次输出 `copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)` + `gates: all passed (A/B/C)` |
| 2   | SC2：改写不依赖机器特定前缀（staging 根为基准） | ✓ VERIFIED | rewrite-map.cjs 零 `/Users/` 字面量（仅 stagingRoot + `~/.dsh`/`$HOME/.dsh` 回退，裸 `$HOME` 不映射——单测⑥）；gate B 三段式随每次构建通过；产物扫描 skills 树 `/(Users|home)/…` = 0、~/.dsh 字面 = 0 |
| 3   | SC3：repo 产物独立 CLI 输出身份 JSON | ✓ VERIFIED | 本趟直跑 3 次（建前/②档建后/①档建后）：`node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` exit 0 |
| 4   | SC4：fetched≠requested 构建失败 | ✓ VERIFIED | 本趟负向实测（cache 隔离后命中③档）：fake 1.19.9 解包目录 + 请求 1.20.1 → **exit 2 `fetched version 1.19.9 != requested 1.20.1`（staging 前拦截）**；`GSD_VERSION=banana` → exit 2 格式守卫（fetch 前） |
| 5   | SC5：验证实例重装后 `/gsd-health` + 独立 CLI + `.env` 拦截三项复验 | ✓ VERIFIED (recorded live evidence + 人工拍板) | verify-evidence.md 两轮 user_setup + 含修复快照（pid 90223 lstart 13:58:39Z 晚于 add 13:57:48Z；wrapper 与 canonical 逐字节一致）；01-SECURITY 独立交叉复证；2026-11-11 三项 judgment 禁项经 01-UAT 人工确认 3/3 pass（本趟无法在本会话重启 3091 复跑交互段——宿主会话；见 Prohibitions Ledger） |
| 6   | 离线链 fail-closed：无档 exit 1；①档断网重建身份不变；②档篡改 exit 2 | ✓ VERIFIED | 本趟实测：cache 移开 + `npm_config_registry=http://127.0.0.1:9` → **exit 1** + ①-④档清单 + `offline? see BUILD.md`；`GSD_TARBALL` + dead registry ①档重建 exit 0 + 身份 JSON 不变；WR-01 负向（npm test 内 47ms）exit 2 `checksum mismatch` |
| 7   | rewrite-map 模块：9 对映射、最长/最具体在前、CJS 导出、PLUGIN_ROOT_REF 单一来源 | ✓ VERIFIED | `node --test tests/rewrite-map.test.mjs` 本趟 7/7 pass（0 skip/todo）；代码直读：9 对（staging×3 + ~/.dsh×3 + $HOME/.dsh×3）、`module.exports = { makeRewrites, PLUGIN_ROOT_REF }`、build.mjs:26 导入消费（IN-02 修复在位） |
| 8   | gate B 三段式（staging 前缀 / 本机 homedir / skills 字面） | ✓ VERIFIED | run-gates.sh:48-78 三段独立 grep 显式出口码（0=命中失败/1=干净/2=扫描错误）；本趟全量构建 3 次 gates 全绿；产物扫描独立复核 0 命中 |
| 9   | gate C：72 个 SKILL.md 各恰 1 个 adapter 块 | ✓ VERIFIED | 每次构建 `gates: all passed (A/B/C)`；本趟独立 grep：72 个文件各恰 1 个 `gsd:dsh-adapter begin`（`72 1` 计数分布） |
| 10  | gate A 双锚（gsd-core/VERSION + runtime-identity）+ 失败 exit 2 | ✓ VERIFIED | 所有构建 gate A 通过；本趟负向 fixture 直跑：`GSD_VERSION=1.19.9 GSD_STAGING_ROOT=/nonexistent bash tests/run-gates.sh` → **exit 2 `gate A failed: version mismatch (gsd-core/VERSION '1.20.1' != 1.19.9)`**；env 缺失 → exit 1 fail-closed |
| 11  | 产物零 `~/.dsh` 字面量 + scripts/ 固化 + 76 树计数 | ✓ VERIFIED | 本趟扫描：skills/gsd-core/hooks/scripts/config 五树 `~/.dsh` = 0；`scripts/fix-slash-commands.cjs` 在（SKIL-03 MODULE_NOT_FOUND 防线）；`hooks/dsh-gsd-suite/run.cjs` 在（01-03 回归修复）；72+4 树 = 76 |
| 12  | 全量测试全绿（含真实构建循环） | ✓ VERIFIED | 本趟 `npm test` **26/26 pass exit 0（0 fail/0 skip/0 todo，5.2s）**；其中 phase-01 自身 9 项含真实构建 5.1s + WR-01 负向 47ms；prepack 链 = `node build.mjs && node --test tests/*.test.mjs`（glob 形态，01-02 偏差 2 采纳口径） |
| 13  | BUILD.md 覆盖契约（GSD_VERSION/staging/离线四档/失败模式/exit 0-1-2/gates/交叉核对/复验序） | ✓ VERIFIED | 当前 HEAD 直读：§①-⑧ 全在（GSD_VERSION 用法默认 1.20.1 + 格式守卫、staging 主链六步、四档含 ENOTCACHED×2、Pitfall 1-6、exit 表、gates 契约、§⑦ canonical 1.20.1 行、§⑧ 复验序）；§⑨ 为 phase-02 追加（版本与 pin 对齐，非本 phase 契约）；快查口径 GSD_VERSION×17、ENOTCACHED×2 不变；TL;DR 26/26（e8e9d73）与本趟实测一致 |
| 14  | README↔BUILD 顶部互链；既有"零安装脚本 / hook 上游 basename"表述未改写 | ✓ VERIFIED | README:65（zh）与 :135（en）双语互链各 2 处指向 BUILD.md + THIRD-PARTY-NOTICES.md；14ee71c 相位 diff 为纯追加（两行互链，零删除）；README:11 `一条命令安装…无需脚本…不写 ~/.dsh 任何文件` 原样；01-REVIEW HEAD 复核 README 契约未破坏 |

**Score:** 14/14 truths verified（0 present-behavior-unverified；0 override）。

### Prohibitions Ledger（ADR-550 D3/D4）

| 计划 | 禁项（requirement / tier） | 裁决 | Flag |
| --- | --- | --- | --- |
| 01-01 | SKIL-03 不得静默回退本机快照（**test**） | ✓ enforced：main 链不读 GSD_BUILD_SOURCE（L15-16 注释 + L346-354 legacy 分支 warn）；无档 exit 1 + 档位清单（本趟实测）；②档篡改 exit 2（WR-01 本趟 47ms）；cache/tarball 双哈希本趟实测一致 | 否 |
| 01-02 | SKIL-04 改写不可安抚式绕过（**judgment**） | ✓ **人工已确认**：01-UAT Test 1 pass（2026-11-11）；本趟复验：9 对映射均为部署态构造（`$DSH_PROFILE_DIR/node_modules/dsh-gsd` 或 `$DSH_HOME`）、无删除形态、gate B fail-closed、产物零残留 | 已闭环 |
| 01-03 | DEV-03 证据必须来自 gsdtest/3091（**judgment**） | ✓ **人工已确认**：01-UAT Test 2 pass；verify-evidence pid 90223 lstart 时间链 + 01-SECURITY 独立交叉复证 | 已闭环 |
| 01-03 | DEV-03 不得以旧 file: 快照充当新证据（**judgment**） | ✓ **人工已确认**：01-UAT Test 3 pass；两轮 user_setup 全时间链 + wrapper 逐字节一致声明（verify-evidence §Task 2） | 已闭环 |

### Advisory (New Scope, Unevidenced)

None。本趟 Step 7 全覆盖文件扫描 0 命中；changed 文件（BUILD.md/README.md/THIRD-PARTY-NOTICES.md/package.json）按 #3304 具备回归地位，其内容复核（§①-⑧ 契约、互链、1.20.1 行、scripts 链）全部通过，无新-scope 观察项。

### Required Artifacts

| Artifact | Expected    | Status | Details |
| -------- | ----------- | ------ | ------- |
| `build.mjs` | fetch→pre-gate→staging→捕获→改写→注入→gates 主链 | ✓ VERIFIED | 355 行直读全链在位；WR-01（L205-208 ②档 integrity）、IN-02（L26 导入）、IN-03（L350 warn）修复仍在；本趟 ①/② 档两趟全链实跑 exit 0 |
| `build/assets/gsd-hooks.json` | canonical hooks 模板 | ✓ VERIFIED | engine verb 4/4；build.mjs:298 捕获拷贝 |
| `build/assets/dsh-gsd-suite-run.cjs` | hooks 桥接 stdio adapter canonical | ✓ VERIFIED | build.mjs:306-307 拷贝；build-smoke ⑥ 逐字节断言（26/26 内通过） |
| `THIRD-PARTY-NOTICES.md` | canonical shasum/integrity/许可/URL | ✓ VERIFIED | 1.20.1 行在位且本趟 sha512+sha1 实测一致；1.19.0 行（phase-02）不改变列序 |
| `.gitignore` | `.build-cache/` + `.gsd-build-tmp/` 豁免 | ✓ VERIFIED | L3/L9 |
| `build/lib/rewrite-map.cjs` | 9 对映射纯模块 | ✓ VERIFIED | 直读 42 行；命名测试 7/7 |
| `tests/rewrite-map.test.mjs` | 映射单测 | ✓ VERIFIED | 7 tests，0 skip/todo（本趟精确扫描） |
| `tests/run-gates.sh` | gate A/B/C 独立脚本 | ✓ VERIFIED | 101 行直读；env fail-closed exit 1 + gate A 负向 exit 2 本趟实测 |
| `tests/build-smoke.test.mjs` | 产物断言 + WR-01 负向 | ✓ VERIFIED | 本趟：真实构建断言 5.1s ✓、WR-01 47ms ✓ |
| `package.json` | test/prepack 链 | ✓ VERIFIED (deviation adopted) | verb 报 "Missing pattern: `\"test\": \"node --test tests/\"`" 属旧文逐字偏差——实际 glob 形态 `node --test tests/*.test.mjs`（Node 24 目录参数机械失败后的 01-02 偏差 2 / WINDOWS #3，BUILD.md §⑥ 记录在案）；本趟 26/26 实证 |
| `BUILD.md` | 构建文档 §①-⑧ | ✓ VERIFIED | 205 行 HEAD 直读；§⑨ 属 phase-02 追加 |
| `README.md` | 互链定点修改 | ✓ VERIFIED | 2 处双语互链；14ee71c 纯追加 |
| `.planning/phases/01-build-mjs/verify-evidence.md` | DEV-03 证据 | ✓ VERIFIED (recorded + 人工拍板) | 78 行；01-UAT 3/3 闭环 |
| `.planning/phases/01-build-mjs/01-UAT.md` | 人工检查点 | ✓ VERIFIED | status complete；3 passed / 0 issues |

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| build.mjs | 官方 install.js | `CLAUDE_CONFIG_DIR=<STAGING> HOME=<fakehome> node <PKG>/bin/install.js --claude --global` | ✓ WIRED | build.mjs:267-272 spawn 数组形态（verb 连续串 pattern 不命中属措辞限制；代码直读）；本趟构建输出含官方安装器横幅 `Installing for Claude Code to …staging.*` |
| build.mjs | THIRD-PARTY-NOTICES.md | ①/②档解包前 SHA-512+SHA-1 对照 | ✓ WIRED | checkTarballIntegrity L164-184；本趟 ①/② 档构建日志 `integrity verified against THIRD-PARTY-NOTICES.md (sha512 + sha1)` 实测出现 |
| build/assets/gsd-hooks.json | config/gsd-hooks.json | ⑤ 捕获段拷贝 | ✓ WIRED | build.mjs:298 cp（verb 非文本 pattern 限制；代码直读） |
| build.mjs | build/lib/rewrite-map.cjs | ESM 命名导入 | ✓ WIRED | build.mjs:26 + L312 makeRewrites(STAGING) |
| build.mjs | tests/run-gates.sh | staging 清理前 spawn + 传播 exit | ✓ WIRED | build.mjs:329-338；失败 exit 原样传播（留痕语义） |
| package.json prepack | build + 全量测试 | prepack 链 | ✓ WIRED | package.json:45 glob 形态 |
| README.md | BUILD.md | 自举构建段互链 | ✓ WIRED | README:65, 135 |
| BUILD.md | THIRD-PARTY-NOTICES.md | 交叉核对命令 + SBOM 表 | ✓ WIRED | BUILD.md §⑦（1.20.1 canonical 两值 + npm view 命令） |
| verify-evidence.md | 验证实例三项复验 | Task 1/2 段记录 + 新快照声明 | ✓ WIRED | 文件直读 + 01-UAT 人工闭环 |

### Data-Flow Trace (Level 4)

| Chain | Source | Flow | Status |
| --- | --- | --- | --- |
| tarball bytes → staging tree → product trees → gates | ①②③④档（integrity gated / pre-gate / npm） | 本趟 ①/② 档端到端实跑 + ③档 pre-gate 负向 + ④档失败路径（SPOT 6） | ✓ FLOWING |
| canonical assets → config/ + hooks/dsh-gsd-suite/ | build/assets/*（仓库 canonical） | 捕获拷贝每轮重放 | ✓ FLOWING（build-smoke ⑥⑦ 断言在 26/26 内通过） |
| 注入 NOTE / 改写映射 | build.mjs 常量 + rewrite-map | 286 文件改写 / 72 注入（本趟构建日志） | ✓ FLOWING |

UI 数据流不适用——基础设施/构建工具 phase，无渲染面。

### Behavioral Spot-Checks（本趟全量重跑）

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| 身份 CLI（建前/②档/①档 3 次） | `node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` | `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` exit 0 ×3 | ✓ PASS |
| 版本格式守卫 | `GSD_VERSION=banana node build.mjs` | exit 2 `invalid GSD_VERSION 'banana' (must match \d+\.\d+\.\d+)`（fetch 前） | ✓ PASS |
| gates env fail-closed | `bash tests/run-gates.sh` | exit 1 `GSD_VERSION and GSD_STAGING_ROOT required` | ✓ PASS |
| gate A 负向 fixture | `GSD_VERSION=1.19.9 … bash tests/run-gates.sh` | exit 2 `gate A failed: version mismatch` | ✓ PASS |
| ③档 fetched≠requested（pre-gate） | cache 隔离 + fake 1.19.9 `GSD_PACKAGE_DIR` | exit 2 `fetched version 1.19.9 != requested 1.20.1`（staging 前） | ✓ PASS |
| 离线无档 fail-closed | cache 隔离 + dead registry | exit 1 + ①-④档清单 + `offline? see BUILD.md` | ✓ PASS |
| ①档离线重建 | `GSD_TARBALL` + dead registry | exit 0 + integrity verified + gates A/B/C + 76 trees；身份不变 | ✓ PASS |
| ②档缓存完整链 | `npm run build` | exit 0 + `.build-cache integrity verified` + 76 trees | ✓ PASS |
| cache tgz 双哈希 | sha512+sha1 vs NOTICES 1.20.1 行 | both match: true | ✓ PASS |
| 命名测试 | `node --test tests/rewrite-map.test.mjs` | 7/7 pass, 0 skip/todo | ✓ PASS |
| 全量测试（唯一一次 full run） | `npm test` | 26/26 pass exit 0, 0 fail/skip/todo（5.2s） | ✓ PASS |
| 产物残留扫描 | grep `~/.dsh`（5 树）/ `/(Users|home)/`（skills） | 0 / 0 | ✓ PASS |
| adapter 计数 | `grep -c 'gsd:dsh-adapter begin' skills/*/SKILL.md \| uniq -c` | `72 1`（72 文件各恰 1） | ✓ PASS |

注：SPOT 4 首跑被 ②档缓存抢先（档位优先级正确行为），已用 trap 自恢复方式隔离 cache 重跑（见 SPOT 4b/6）；`.build-cache` 移开-复原均在单次 shell 内完成并复核恢复，`git status` 前后一致无新增漂移。

### Probe Execution

| Probe | Command | Result | Status |
| --- | --- | --- | --- |
| — | `find scripts -path '*/tests/probe-*.sh'` | 无任何 probe 声明 | N/A（本 phase 不依赖 probe 脚本；gates/测试为验证面） |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| SKIL-03 | 01-01/02/03 | 独立 CLI identity + scripts/ 齐备 | ✓ SATISFIED | 本趟直跑 identity ×3；scripts/fix-slash-commands.cjs 在；build-smoke ③（26/26 内） |
| SKIL-04 | 01-01/02/03 | SKILL.md 零机器绝对路径 + 改写 gate | ✓ SATISFIED | gate B/C 每构建通过；产物扫描 0；unit 7/7 |
| INST-02 | 01-02/03 | 不写 ~/.dsh 受管文件 | ✓ SATISFIED | build 侧五树零 `~/.dsh`（本趟 grep 0）；安装侧 987→987 零新增（verify-evidence Task 1 实录，人工复核闭环） |
| DEV-03 | 01-03 | 完成物在验证实例 gate 通过 | ✓ SATISFIED (recorded + 人工拍板) | verify-evidence 三项 live；2 条 judgment 禁项经 01-UAT 人工 3/3 pass |

Orphaned check：ROADMAP Phase 1 requirements（SKIL-03/SKIL-04/INST-02/DEV-03）全部被 plan 声明，无 ORPHANED。REQUIREMENTS.md 四项均已 `[x]`。DEV-04（里程碑级：Phase 1 稳定后才装主 profile）不属本 phase 交付口径，维持里程碑收口责任（与旧报告一致）。

### Anti-Patterns Found

无。本趟对 7 个实现文件全模式扫描（TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER/not yet implemented/return null/{} /[] /=>{}）0 命中。注：`xit\(` 粗扫描在 run-gates.sh:37 命中属 `process.exit(2)` 子串假阳性，词边界精确复核（`\b(describe|it|test)\.(skip|todo)\b`）0 实际禁用测试。code review：01-REVIEW re-review 收敛轮（2026-11-12T03:32Z，HEAD）0 findings；历史 6 findings 经 REVIEW-FIX（384b72a）全修且 HEAD 复核仍 fixed。

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| tests/rewrite-map.test.mjs | SKIL-04（改写契约） | 7 | 0 | 否（断言语义由测试字面构造，非系统生成） | Value | ✓ |
| tests/build-smoke.test.mjs | SKIL-03 / INST-02 / DEV-03 产物面 | 9（含 ②-⑧ 产物断言 + WR-01） | 0（`t.skip` 仅在 canBuild 前置探测失败时触发，本趟暖缓存路径实跑） | 否（预期哈希/计数来自 NOTICES canonical，非 build 输出回灌） | Behavioral | ✓ |
| tests/run-gates.sh | SKIL-04 gate 面（A/B/C） | 3 gates | 0 | 否 | Behavioral | ✓ |

Disabled tests on requirements: 0。Circular patterns: 0。Insufficient assertions: 0（产物断言为值级/行为级）。phase-02 套件（compat-matrix/version/docs-consistency）不属本 phase 审计范围。

### Decision Coverage

Engine gate `check.decision-coverage-verify` → **skipped（"no trackable decisions"，blocking: false）**：01-CONTEXT `<decisions>` 为自由文本清单，非 gate 可追踪形态。Verifier 本趟手动复核 CONTEXT 决策均已兑现：取源切换（tarball 主链，GSD_BUILD_SOURCE 仅 legacy 分支 + warn）、staging 基准改写（makeRewrites(STAGING)）、fetched==requested pre-gate（L252-258）、scripts/ 固化（捕获段 + build-smoke）、DEV-03 三项复验（verify-evidence + UAT 闭环）、文档化（BUILD/README/NOTICES）、legacy 仅兼容 + 显式告警。

### Human Verification Required

**无待办人工项。** 旧报告 3 项 judgment-tier 禁项人工复核已由 01-UAT（2026-11-11，3/3 passed 0 issues）人工拍板闭环，本趟不重复挂起。本 phase 为 infrastructure/foundation（构建工具），无用户面，不发明人工 UAT 步骤；behavior_unverified = 0（14 truths 全部具备本趟行为实证或 recorded-live+人工实证，无未exercised 的状态迁移/取消/排序不变式）。

### Gaps Summary

无 gaps。14/14 must-haves VERIFIED（本趟全量独立重跑），artifact/key-link 全部在位且 wired，anti-pattern 0，disabled tests 0，WINDOWS 三张 deviation 卡维持 fixed（1=gate B 三段式、2=gate A 双锚、3=node --test glob 形态）。旧报告 frontmatter `passed` 与正文 `human_needed` 的矛盾随 UAT 人工闭环消解：当前结论 passed。

## Verification Summary

- **Staleness 根源**：旧报告 verified 2026-11-11T10:08:06Z 之后，covered 文件被 phase-02 提交与评审修复提交修改——BUILD.md（×2：e8e9d73 TL;DR 26/26、e01a244 §⑨）、README.md（e01a244）、THIRD-PARTY-NOTICES.md（28c68c0 增 1.19.0 行）、package.json（9847eb5 版本/engines/deps）；build.mjs/rewrite-map/两测试/run-gates 自旧验后零变更（git log 逐文件核实）。
- **验证器本趟独立重跑**：`npm test` 26/26（唯一一次 full run）、`npm run build` exit 0（②档双哈希 + gates A/B/C + 76 trees）、①档断网重建、（四档 fail-closed 矩阵：banana→2 / no-env→1 / gate-A 负向→2 / ③档漂移→2 / 无档→1 / ②档篡改→2 全实测）、产物扫描（~/.dsh 0、skills 字面 0、72×1 adapter）、identity ×3。
- **变更文件的契约回归**：#3304 证据门——4 个 changed 文件按 HEAD 形态全量复核通过；无 advisory 新项。
- **Engine verbs**：01-01 artifacts 4/4；01-02 artifacts 5/6（package.json 逐字偏差为 01-02 偏差 2 采纳口径，26/26 实证弥补）；key-links 2 处 verb pattern 不命中均为形态/措辞限制，代码直读 WIRED；decision gate skipped（无 trackable）；verify.commits（384b72a/2d45fac）valid。
- **Phase 02 文件**（build/lib/check-pins.mjs、compat-probe.mjs、.github/workflows/compat-matrix.yml、tests/{compat-matrix,version,docs-consistency}.test.mjs、build/assets/pins.json）不在本 phase 范围，未纳入 truth 判定与指纹。
- **未提交**：本报告按契约留待 orchestrator 统一提交；工作树中既有 M .planning/STATE.md 与 3 个未跟踪文件维持原状。

---

_Verified: 2026-11-12T03:48:05Z（re-verification）_
_Verifier: DeepSeek Harness agent (gsd-verifier)_
