---
phase: 01-build-mjs
plan: 01
subsystem: infra
tags: [npm, build, staging, offline, sbom, gsd-core, integrity]

# Dependency graph
requires:
  - phase: P0-spike
    provides: [SPIKE build.mjs 机制（staging 契约、adapter 注入、改写映射）、验证实例 3091]
provides:
  - "build.mjs 主链：npm tarball 取件 → 官方 --claude staging → 4 树白名单捕获 → staging 根改写 → adapter 注入 → 双 gate，exit 0/1/2 契约"
  - "离线回退链三档（GSD_TARBALL shasum-gated / .build-cache / GSD_PACKAGE_DIR）+ npm pack 在线档"
  - "build/assets/gsd-hooks.json canonical hooks 模板（与 install-gsd-dsh.sh:587-657 逐字一致）"
  - "THIRD-PARTY-NOTICES.md：@opengsd/gsd-core@1.20.1 canonical 值（离线 ① 档完整性 pinning 对照源）"
affects: [01-02（改写/gate 迁移与 run-gates.sh）, 01-03（验证实例复验与 BUILD.md）]

# Actuals (#2632) — 与 plan 的 estimate（42000 tokens / 3 tasks）同标尺
actuals:
  tokens: 6215   # chars/4 over the realized diff (build.mjs + build/assets/gsd-hooks.json + THIRD-PARTY-NOTICES.md + .gitignore)
  tasks: 3
  commits: 2    # MEASURED: rev-list count plan_head_before..HEAD
plan_head_before: e60f5536f3e02a0174443ea0063d58ae15fbe921
plan_head_after: 0305b6ee96590337716dc0bcb4f0e0ecda229411

# Tech tracking
tech-stack:
  added: [系统 tar/bsdtar 确定性解包, node:crypto sha512/sha1 完整性校验, npm pack 取件]
  patterns:
    - "主链契约：node <pkg>/bin/install.js --claude --global，CLAUDE_CONFIG_DIR=mktemp staging + HOME=fakehome"
    - "4 树白名单捕获：skills/gsd-* + gsd-core + hooks + scripts；settings.json/agents/.gsd-* 概不拷贝"
    - "exit code 约定：0 成功（清理留痕）/ 1 IO·解包·安装器失败（保留 staging 留痕）/ 2 gate 失败（阻断 prepack）"

key-files:
  created:
    - build/assets/gsd-hooks.json
    - THIRD-PARTY-NOTICES.md
  modified:
    - build.mjs
    - .gitignore

key-decisions:
  - "取源目标版本 = @opengsd/gsd-core@1.20.1（执行期 checkpoint 人类决策，2026-11-10；GSD_VERSION 默认值与全链判据落 1.20.1）"
  - "gate A（产物版本交叉校验）在 1.20.1 落为 gsd-core/VERSION + runtime-identity 引擎自报双锚（1.20.1 staged 树无 gsd-core/package.json，1.16.0 有——plan ⑧a 的 package.json 锚点不可用，预 gate ③ 已 pin 住 tarball package.json version）"
  - "gate B 三段式：staging 根前缀（4 树全扫）+ 本机 homedir 前缀残留（4 树全扫）+ /Users|home 字面正则（仅 skills 树 = SKIL-04 字面范围）；upstream 1.20.1 的 8 处叙述例径（/Users/john/、/root/.ssh 等教学举例）是可移植内容、非本机残留，不拒绝"
  - "离线 ① 档 shasum-gating 落地为双重校验：SHA-512 hex 对照 NOTICES dist.integrity（base64 解码）+ SHA-1 对照 dist.shasum（plan 文本“shasum -a 512 对照 dist.shasum”混用的相干解法，两端均 fail-closed exit 2）"

patterns-established:
  - "Pattern: fetch 四档统一收敛到 PKG_DIR → 预 gate → staging 骨架（① ② ④ 解包、③ 直接采用）"
  - "Pattern: gate B 用 grep -RInE spawn（模式转义 + exit 码语义 0=命中/1=干净）"

requirements-completed: [SKIL-03, SKIL-04]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "在线换源主链：npm pack → 预 gate → 官方 --claude staging → 4 树捕获 → 改写 → 注入 → 双 gate，exit 0 且末行 skills (72 total)、76 棵树"
    requirement: SKIL-03
    verification:
      - kind: integration
        ref: "GSD_VERSION=1.20.1 node build.mjs（Task 2 verify ④ + tracer gate 重跑 + Task 3 后终轮，共 4 次全量构建 exit 0）"
        status: pass
      - kind: other
        ref: "bash -c '72 个 skills/gsd-*/SKILL.md 各恰 1 个 gsd:dsh-adapter begin 块'"
        status: pass
    human_judgment: false
  - id: D2
    description: "SKIL-03：repo 产物独立 CLI 输出身份 JSON（@opengsd/gsd-core + 1.20.1，scripts/ 齐备无 MODULE_NOT_FOUND）"
    requirement: SKIL-03
    verification:
      - kind: integration
        ref: "node gsd-core/bin/gsd-tools.cjs runtime-identity --raw → {\"packageName\":\"@opengsd/gsd-core\",\"version\":\"1.20.1\"}（在线与 .build-cache 离线重建各验证 1 次）"
        status: pass
    human_judgment: false
  - id: D3
    description: "离线三档 + 在线档：断网无档 exit 1 列明档位、.build-cache 断网重建 exit 0 身份不变、篡改 tarball exit 2 checksum mismatch（fail-closed）"
    requirement: SKIL-03
    verification:
      - kind: integration
        ref: "npm_config_registry=http://127.0.0.1:9 node build.mjs（无档 → exit 1；.build-cache → exit 0 + identity）"
        status: pass
      - kind: integration
        ref: "GSD_TARBALL=/tmp/gsd-tampered.tgz（追加 6 字节）→ exit 2 + checksum mismatch"
        status: pass
    human_judgment: false
  - id: D4
    description: "SKIL-04/SC4 双 gate：产物版本交叉校验（VERSION + 引擎自报）、机器路径扫描（gate B 三段式）、fetched≠requested 预 gate exit 2（③ 档 GSD_PACKAGE_DIR 负向实证 + 非法 GSD_VERSION 格式 exit 2）"
    requirement: SKIL-04
    verification:
      - kind: other
        ref: "SC4 负向：GSD_PACKAGE_DIR 伪包(1.19.9) → exit 2 'fetched version 1.19.9 != requested 1.20.1'；GSD_VERSION=banana → exit 2"
        status: pass
    human_judgment: true
    rationale: "gate B 语义细化（三段式）与 verify ③ 的按意图审计（8 处 upstream 叙述例径逐行核对为可移植内容）是对 SKIL-04 拒绝集的解释性决定，需验证者复核审计结论与 01-02 run-gates.sh 的延续口径。"

# Metrics
duration: 20 min
completed: 2026-11-10
status: complete
---

# Phase 1 Plan 1: staging 取源管线 Summary

**build.mjs 资产来源切换为 @opengsd/gsd-core@1.20.1 npm tarball：npm pack/离线三档取件 → fetched==requested 预 gate → 官方 install.js --claude staging → 4 树白名单捕获 → staging 根改写 → 72 份 adapter 注入 → 双 gate，exit 0/1/2 契约 + THIRD-PARTY-NOTICES 完整性 pinning 全链落地**

## Performance

- **Duration:** 20 min
- **Started:** 2026-11-10T12:25:24Z
- **Completed:** 2026-11-10T12:45:43Z
- **Tasks:** 3 (1 checkpoint 人类决策已在前序执行器完成 + 2 实现任务)
- **Files modified:** 4（build.mjs、build/assets/gsd-hooks.json 新增、THIRD-PARTY-NOTICES.md 新增、.gitignore）

## Accomplishments

- 主链端到端成立：`GSD_VERSION=1.20.1 node build.mjs` 4 次全量构建全部 exit 0，产物 76 棵树（72 gsd-* skills + gsd-core + hooks + scripts + config/gsd-hooks.json），末行 "skills (72 total)"；identity JSON 精确为 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`
- SC1 离线等价：断网 + ① GSD_TARBALL（完整体积分校验通过）或 ② .build-cache 档均重建成功且身份不变；断网无档 exit 1 且 stderr 列明 ①-④ 档位 + BUILD.md 指引；篡改 tarball exit 2 fail-closed
- SC4 fail-closed：fetched≠requested 在 staging 之前被拦（③ 档负向实证 exit 2 显式文案）；GSD_VERSION 格式非法 exit 2
- 供应链 pinning：THIRD-PARTY-NOTICES.md 记录 canonical 值（2026-11-10 双 registry 核对）并供 ① 档 SHA-512/SHA-1 双校验消费；build/assets/gsd-hooks.json 与 install-gsd-dsh.sh:587-657 逐字一致（与既有 config/gsd-hooks.json JSON 等价）

## Task Commits

1. **Task 1: 包合法性确认（checkpoint:human-verify）** — 无 commit（checkpoint 返回；人类决策改取 1.20.1，由 orchestrator 于 9fb437e 同步）
2. **Task 2: build.mjs 换源全链 tracer** — `ebf35b4` (feat)
3. **Task 3: 离线回退链三档 + 环境加固 + SBOM + exit code 收口** — `0305b6e` (feat)

**Plan metadata:** 见 final_commit（docs）。

## Files Created/Modified

- `build.mjs` — 换源主链 + 离线三档 + GSD_BUILD_SOURCE 遗留分支 + 双 gate + exit 0/1/2 收口
- `build/assets/gsd-hooks.json` — canonical hooks 模板（config/gsd-hooks.json 的捕获来源）
- `THIRD-PARTY-NOTICES.md` — SBOM canonical 记录行（1.20.1）+ 离线对照协议 + 1.16.0 审计存档行
- `.gitignore` — 追加 `.build-cache/`

## Decisions Made

1. 取源目标版本 = @opengsd/gsd-core@1.20.1（执行期 checkpoint 人类决策，2026-11-10）。
2. gate A 锚点改为 gsd-core/VERSION + runtime-identity 引擎自报（1.20.1 无 gsd-core/package.json）。
3. gate B 三段式拒绝集（staging 前缀 / 本机 homedir / skills 树字面），8 处上游叙述例径不拒。
4. ① 档完整性双重校验（SHA-512 vs integrity 解码 + SHA-1 vs dist.shasum）。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] gate A 的 product package.json 源文件在 1.20.1 不存在**
- **Found during:** Task 2（首次全量 build，exit 1 ENOENT gsd-core/package.json）
- **Issue:** plan ⑧a 与 01-RESEARCH 的 gate A 基于 1.16.0 形态（staged gsd-core/ 含 package.json）；1.20.1 官方安装器只写 gsd-core/VERSION，staged 树无任何携带引擎身份的 package.json。Version Amendment 验证的"包形同构"只覆盖顶层目录结构，未覆盖此锚点。
- **Fix:** gate A 改双锚——gsd-core/VERSION === GSD_VERSION 且 `runtime-identity --raw` 自报 packageName/version 精确相等；tarball package.json 版本已被预 gate ③ pin 住。
- **Files modified:** build.mjs
- **Verification:** 重建 exit 0；identity 断言 PASS；负向（1.19.9 伪包）在预 gate 被拦。
- **Committed in:** ebf35b4（Task 2 commit）

**2. [Rule 1 - Plan-reality mismatch] gate B 字面 /Users|home/ 正则误杀 upstream 1.20.1 叙述例径**
- **Found during:** Task 2（gate B 首轮 exit 2）
- **Issue:** 1.20.1 上游内容含 9 处叙述性示例路径（`/Users/john/`、`/home/linuxbrew/`、`/root/.ssh` 教学行，分布于 gsd-core/ 8 处 + hooks/ 1 处；skills/ 与 scripts/ 零命中），与"残留机器绝对路径"（如 /Users/yue.weny）语法不可分；plan verify ③ 的字面正则四树扫描在 1.20.1 上机械不可通过，而手工编辑上游文件属 RESEARCH 反模式。
- **Fix:** gate B 细化为三段：B1 staging 根前缀（4 树）+ B2 本机 homedir() 前缀（4 树，含以 root 运行时的 /root 形态）+ B3 字面 /Users|home/ 正则仅扫 skills/ 树（SKIL-04 字面范围 = SKILL.md）。verify ③ 按 fails_when 括注意图审计：8 行命中逐一核对为可移植叙述、零本机路径（grep /Users/yue.weny = 0 文件）、skills 树净空 → PASS-by-purpose，逐行留档。
- **Files modified:** build.mjs
- **Verification:** 重建 exit 0；两次全量构建 gate 扫描命中集合一致（diff=0，产物确定性）；本机残留探针 0 命中。
- **Committed in:** ebf35b4（Task 2 commit）

**3. [Rule 2 - Correctness] ① 档完整性校验的相干解法（plan 文本 sha512/shasum 混用）**
- **Found during:** Task 3
- **Issue:** plan ① 写"shasum -a 512 对照 … dist.shasum"，但 dist.shasum 为 40-hex SHA-1、SHA-512 为 128-hex，直接比对将永远误杀合法 tarball（与 SC1 "① 档断网重建 exit 0" 冲突）。
- **Fix:** 双重校验：SHA-512 hex vs NOTICES dist.integrity（sha512-… base64 解码）+ SHA-1 vs dist.shasum；任一不符 exit 2（文案含 mismatch + 双期望值）。
- **Files modified:** build.mjs
- **Verification:** 正版 tgz 经 ① 档断网构建 exit 0（integrity verified 日志）；篡改 tgz exit 2 + checksum mismatch（plan verify ③ 通过）。
- **Committed in:** 0305b6e（Task 3 commit）

---

**Total deviations:** 3 auto-fixed（2 bug/reality-mismatch + 1 correctness）
**Impact on plan:** 三处均为 1.20.1 与 01-RESEARCH（1.16.0 时代）样本的形态差所致，修复保持 plan 语义（版本交叉校验/机器残留拒绝/完整性 pinning）不变、fail-closed 强化，无范围蔓延。**01-02 预警**：其测试计划引用 RESEARCH L249-257 的 gate B 字面正则与 `require('./gsd-core/package.json')` gate A——执行时需继承本计划的三段式 gate B 与双锚 gate A 口径。

## Issues Encountered

- 无阻断项。Task 2 累计 3 次内联修复尝试（gate A 锚点、gate B /root/ 误杀、gate B 收敛 homedir），均在偏差限内收敛。
- 记录：install-gsd-dsh.sh 上游 staging 输出确认 1.20.1 树形（agents/ gsd-core/ hooks/ scripts/ skills/ + settings.json 等）——4 树白名单未变。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- build.mjs 主链 + 离线链可被 01-02（改写/gate 迁移：rewrite-map.cjs 抽取、tests/、run-gates.sh）与 01-03（验证实例复验 + BUILD.md）直接作为地基使用；.gsd-build-tmp/ 内 tgz 与 .build-cache/ 已就绪供离线档测试。
- 口径交接：gate A 双锚（VERSION + runtime-identity）、gate B 三段式、① 档双重完整性校验——01-02 的 run-gates.sh 须沿用（本 plan 不modify 01-02 PLAN，由该 plan 执行器按 SUMMARY 交接口径适配）。

## Self-Check: PASSED

- FOUND: build.mjs / build/assets/gsd-hooks.json / THIRD-PARTY-NOTICES.md / .gitignore
- FOUND: ebf35b4（Task 2）· FOUND: 0305b6e（Task 3）（`git merge-base --is-ancestor` 于 HEAD）
- Ledger 实测：commits=2（rev-list e60f5536..HEAD，等于任务 commit 数，代码变更无未提交残留）

---

*Phase: 01-build-mjs*
*Completed: 2026-11-10*
