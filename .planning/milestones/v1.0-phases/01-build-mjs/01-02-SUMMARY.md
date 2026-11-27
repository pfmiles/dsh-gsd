---
phase: 01-build-mjs
plan: 02
subsystem: infra
tags: [npm, build, staging, rewrite, gates, node-test, prepack]

# Dependency graph
requires:
  - phase: 01-build-mjs
    plan: 01
    provides: "build.mjs 换源主链（npm tarball → 官方 --claude staging → 4 树捕获 → 改写/注入 → 双 gate）；gate A 双锚 / gate B 三段式 / ① 档双哈希口径交接"
provides:
  - "build/lib/rewrite-map.cjs：machine-independent 9 对改写映射纯模块（staging 根基准 + ~/ 与 $HOME 回退），六组单测覆盖（ROADMAP SC2 可回归契约）"
  - "tests/run-gates.sh：gate A 双锚版本交叉 + gate B 三段式机器路径扫描 + gate C 72×1 adapter 计数，独立脚本（build.mjs/staging 清理前强制消费、CI/prepack 可直接调用），exit 0/1/2 契约"
  - "tests/build-smoke.test.mjs + package.json test/prepack 链：76 棵树与 scripts/ 固化、identity JSON、INST-02 零 '~/.dsh'、adapter 72×1 每次构建/测试固定断言（SKIL-03/04/INST-02 机器验证锚点）"
affects: [01-03（BUILD.md 引用 run-gates.sh 契约与 prepack 全链）, verify-work（SKIL-03/04/INST-02 的 build 侧验证证据）]

# Actuals (#2632) — 与 plan 的 estimate（40000 tokens / 3 tasks）同标尺
actuals:
  tokens: 5088   # chars/4 over the realized diff (build.mjs + build/lib/rewrite-map.cjs + tests/* + package.json)
  tasks: 3
  commits: 3    # MEASURED: rev-list count plan_head_before..HEAD
plan_head_before: 85896c8e223793617c4811ed5980f5e92c889f7c
plan_head_after: 18809438be97720734b38eba5f0581072b398816

# Tech tracking
tech-stack:
  added: [node:test smoke 套件（零依赖）, bash gate 脚本（tests/run-gates.sh），package.json test/prepack 链]
  patterns:
    - "改造映射模块化契约：makeRewrites(stagingRoot) 返回 9 对 [from,to]，最长/最具体 from 在前；裸 $HOME 不映射（${CLAUDE_CONFIG_DIR:-$HOME/.claude} 惯用语保护）"
    - "gate 单写模式：run-gates.sh 为 gate A/B/C 唯一实现（build.mjs/prepack/CI 三方共享），build 仅在 staging 清理前 spawn 并原样传播 exit 码（失败留痕）"
    - "测试入口 glob 形态：node --test tests/*.test.mjs（Node 24.21.0 目录参数不工作，glob 由 node 内部展开）"

key-files:
  created:
    - build/lib/rewrite-map.cjs
    - tests/rewrite-map.test.mjs
    - tests/run-gates.sh
    - tests/build-smoke.test.mjs
  modified:
    - build.mjs
    - package.json
    - .planning/WINDOWS.md

key-decisions:
  - "run-gates.sh 的 gate A/B 按 01-01-SUMMARY 交接口径实现：gate A 双锚（gsd-core/VERSION === GSD_VERSION 且 runtime-identity 自报 packageName/version 精确相等）、gate B 三段式（B1 staging 根 4 树 / B2 homedir 4 树 / B3 /Users|home 字面仅 skills）；plan 旧文（require('./gsd-core/package.json') 与两段四树正则）是 1.16.0 时代形态，在 1.20.1 上不可成立"
  - "build-smoke 版本锚点断言 gsd-core/VERSION（1.20.1 staged 树无 gsd-core/package.json——01-01 偏差 1 同口径）"
  - "test/prepack 脚本采用 'node --test tests/*.test.mjs' glob 形态：Node v24.21.0 实测目录参数 'node --test tests/' 被当作模块加载机械失败（/tmp 最小复现确认），glob 形式由 node 内部展开、外层 shell 亦可展开，7/7 全绿"
  - "WINDOWS 条目 #1（01-01 gate-B deviation）所描述行为已由本 plan 的 run-gates.sh 三段式实现覆盖——可关闭，关闭动作（fixed/waive）留给 verifier"

patterns-established:
  - "Pattern: gate fixture 负向用假 runtime-identity 脚本穿过 gate A 双锚，直证 gate B1/B3 与 gate C 的失败路径（exit 2 + 对应 gate 名文案）"

requirements-completed: [SKIL-03, SKIL-04, INST-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "改写映射 CJS 纯模块（makeRewrites(stagingRoot) 9 对、特异性排序、~/ 与 $HOME 回退、裸 $HOME 不清洗）并被 build.mjs 消费；六组单测全绿；全量构建后产物四树零 staging 根/零 /Users|home 残留、identity 1.20.1"
    requirement: SKIL-04
    verification:
      - kind: unit
        ref: "node --test tests/rewrite-map.test.mjs — 6/6 pass"
        status: pass
      - kind: integration
        ref: "GSD_VERSION=1.20.1 env -u GSD_TARBALL -u GSD_PACKAGE_DIR node build.mjs → exit 0 + 'skills (72 total)'（Task 1 verify + tracer gate 重跑）"
        status: pass
    human_judgment: false
  - id: D2
    description: "gates 外置 tests/run-gates.sh：gate A 双锚 + gate B 三段式 + gate C 72×1（exit 0/1/2 契约、env 缺失 exit 1 fail-closed），build.mjs 在 staging 清理前强制消费并原样传播 exit 码（失败留痕）"
    requirement: SKIL-04
    verification:
      - kind: integration
        ref: "fixture 负向：env 缺失 exit 1 + 文案；gate A（VERSION 缺失/假内容）exit 2 'gate A failed'；gate B1 staging 残留 / B3 skills 字面 / gate C adapter 0 exit 2（假 identity 穿过 gate A 直证）"
        status: pass
      - kind: integration
        ref: "GSD_VERSION=1.20.1 node build.mjs → exit 0 + 'gates: all passed (A/B/C)'；③ 档 GSD_PACKAGE_DIR=1.20.1 + 请求 1.16.1 → exit 2 + '!= requested'（SC4 预 gate 负向）"
        status: pass
    human_judgment: true
    rationale: "gate A 双锚与 gate B 三段式的语义延续是 01-01 的解释性决定（8 处上游叙述例径审计），迁移保真需验证者复核——与 01-01 D4 同一口径。"
  - id: D3
    description: "产物 smoke 与 test/prepack 收口：真实构建循环断言（76 树 + scripts/fix-slash-commands.cjs 固化 + gsd-core/VERSION + config/gsd-hooks.json + identity + 零 '~/.dsh' + adapter 72×1）；package.json test/prepack 全链"
    requirement: SKIL-03
    verification:
      - kind: integration
        ref: "npm test（node --test tests/*.test.mjs）→ 7/7 pass；npm run prepack（build && tests）→ exit 0（11s 暖缓存）"
        status: pass
    human_judgment: false

# Metrics
duration: 11 min
completed: 2026-11-10
status: complete
---

# Phase 1 Plan 2: 改写与 gate 迁移 Summary

**改写映射抽成可单测 CJS 模块（build/lib/rewrite-map.cjs 9 对映射 + 六组单测）、双 gate 外置为独立脚本 tests/run-gates.sh（gate A 双锚 / gate B 三段式 / gate C 72×1，build.mjs staging 清理前强制消费 exit 0/1/2）、产物 smoke tests/build-smoke.test.mjs 与 package.json test/prepack 链落地——SKIL-03/SKIL-04/INST-02 获得每波可重跑的机器验证锚点**

## Performance

- **Duration:** 11 min
- **Started:** 2026-11-10T12:55:58Z
- **Completed:** 2026-11-10T13:07:33Z
- **Tasks:** 3
- **Files modified:** 6（build.mjs、build/lib/rewrite-map.cjs 新增、tests/rewrite-map.test.mjs 新增、tests/run-gates.sh 新增、tests/build-smoke.test.mjs 新增、package.json；另 WINDOWS.md 经 windows append 追加 2 条）

## Accomplishments

- 改写映射成为被单测覆盖的纯模块：makeRewrites(stagingRoot) 返回 9 对（staging 根三对 + ~/.dsh 三对 + $HOME/.dsh 三对），最长/最具体 from 在前，裸 $HOME 不映射（`${CLAUDE_CONFIG_DIR:-$HOME/.claude}` 惯用语不动）；build.mjs 主路径消费该模块，全量构建 exit 0、identity 1.20.1 无回归（tracer gate 端到端重跑通过）
- gates 外置：run-gates.sh 按 01-01 交接口径实现（gate A 双锚 + gate B 三段式 + gate C 72×1），负向实证齐全——env 缺失 exit 1、gate A（VERSION 缺失/假内容）/B1/B3/C 均 exit 2 + 对应 gate 名文案；build.mjs 在 staging 清理前 spawn 并原样传播 exit 码（失败留痕），成功路径 stdout 含 "gates: all passed (A/B/C)"
- 产物 smoke 与脚本收口：build-smoke 真实构建断言 76 棵树（72 skills + gsd-core/VERSION + hooks + scripts/fix-slash-commands.cjs 固化防线 + config/gsd-hooks.json）、identity JSON、INST-02 零 '~/.dsh'、adapter 72×1 全绿；package.json test/prepack 全链（prepack = build && tests，gates 内嵌 build）；npm test 7/7、npm run prepack exit 0
- SC4 负向维持：③ 档 GSD_PACKAGE_DIR=1.20.1 解包树 + 请求 1.16.1 → exit 2 + '!= requested'（预 gate 在 staging 前拦截）

## Task Commits

Each task was committed atomically：

1. **Task 1: 改写映射抽模块 + build.mjs 消费（tracer）** - `395a795` (feat) — tracer gate：三 verify 端到端重跑全绿后继续展开
2. **Task 2: gates 外置 run-gates.sh + build.mjs 清理前强制消费** - `02fe473` (refactor)
3. **Task 3: 产物 smoke + package.json test/prepack 收口** - `1880943` (feat)

**Plan metadata:** 见 final_commit（docs）。

## Files Created/Modified

- `build/lib/rewrite-map.cjs` — makeRewrites(stagingRoot) 9 对改写映射 CJS 纯模块（module.exports）
- `tests/rewrite-map.test.mjs` — 六组断言（顺序/三类 from/无残留/裸 $HOME 不清洗），秒级 per-commit 回路
- `tests/run-gates.sh` — gate A 双锚 + gate B 三段式 + gate C 72×1 独立脚本（exit 0/1/2）
- `tests/build-smoke.test.mjs` — 真实构建循环产物断言（76 树/identity/零 '~/.dsh'/adapter 72×1）
- `build.mjs` — 消费 rewrite-map 模块；内联 gate A/B/C 与 72 计数移除，改为 staging 清理前 spawn run-gates.sh 并传播 exit 码；homedir/escapeRe 清理
- `package.json` — 新增 "test" 脚本、prepack 升级为 build && tests 全链
- `.planning/WINDOWS.md` — windows append 追加条目 #2（gate A 双锚适配）与 #3（node --test glob 适配）

## Decisions Made

1. run-gates.sh 的 gate A/B 继承 01-01-SUMMARY 交接口径（双锚 + 三段式），不回归 plan 旧文（1.16.0 时代形态）。
2. build-smoke 版本锚点断言 gsd-core/VERSION（1.20.1 无 gsd-core/package.json）。
3. test/prepack 脚本采用 glob 形态（Node 24.21.0 目录参数实测不工作）。
4. WINDOWS #1 已被 run-gates.sh 覆盖、可关闭（动作留 verifier）。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Plan-reality mismatch] gate A 双锚与 gate B 三段式口径（继承 01-01-SUMMARY 交接）**
- **Found during:** Task 2（run-gates.sh 实现前按 prior_wave_handoff 口径适配）
- **Issue:** plan 旧文 gate A 用 `require('./gsd-core/package.json')`、gate B 用两段四树正则、Task 3 smoke 断言 `gsd-core/package.json` 存在——均为 1.16.0 时代形态；1.20.1 staged 树无 gsd-core/package.json，且 gate B 四树字面正则会误杀 upstream 8 处叙述例径（01-01 偏差 1/2 已实证）。
- **Fix:** run-gates.sh 实现双锚 gate A（gsd-core/VERSION + runtime-identity 自报）与三段式 gate B（B1 4 树 / B2 homedir 4 树 / B3 仅 skills）；fixture 负向经"VERSION 缺失、VERSION 假内容 1.16.9"两式直证 exit 2 + 'gate A failed'；build-smoke 锚点改 gsd-core/VERSION。
- **Files modified:** tests/run-gates.sh, tests/build-smoke.test.mjs
- **Verification:** fixture 负向 exit 2 文案断言通过；全量构建 exit 0 'gates: all passed (A/B/C)'；npm test 7/7。
- **Committed in:** 02fe473（Task 2）、1880943（Task 3）

**2. [Rule 1 - Bug] `node --test tests/` 目录参数在该 Node 上机械失败**
- **Found during:** Task 3（verify ① 全量套件 43ms 即 MODULE_NOT_FOUND）
- **Issue:** Node v24.21.0 把 `tests/` 目录参数当作模块入口加载（/tmp 最小复现确认，非本项目文件所致）；plan 强制逐字脚本串 `"test": "node --test tests/"` 若照抄将产出永久失败的测试脚本，01-RESEARCH 的该命令从未在真机上被验证（此前 repo 零测试文件）。
- **Fix:** test/prepack 脚本采样 `node --test tests/*.test.mjs` glob 形态（node 内部 glob 展开兼容外层 shell 展开，实测 7/7）；verify ② 逐字断言改为适配断言（glob 串 + prepack 全链），并按验收门协议记录了逐字断言的预期失败。
- **Files modified:** package.json
- **Verification:** npm test 7/7 pass（6s）；npm run prepack exit 0（11s）；直接 `node --test tests/` 失败已留存为复现证据。
- **Committed in:** 1880943（Task 3）

---

**Total deviations:** 2 auto-fixed（2 plan-reality/bug，均为执行现实适配）
**Impact on plan:** 口径类偏差全部来自 1.20.1 与既有 Node 实现同 plan 文本假设（1.16.0 时代形态、未验证过的测试命令）的差异，修复保持 plan 语义不变（版本交叉校验 / 三段式拒绝集 / 全量测试链），并以负向实证强化。无范围蔓延；与 01-01 的 3 处偏差同源同口径。

## Issues Encountered

- Task 3 verify ① 首轮失败（node --test 目录参数 MODULE_NOT_FOUND）：一次最小复现 + 一次脚本串适配内收敛，未超 3 次修复限。
- 全量构建实测暖缓存 ~4s（plan 估计 60-120s 为冷缓存上限）：全量反馈 < 120s 判据宽裕满足（prepack 全链 11s）。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 01-03 可直接使用：run-gates.sh 双 env 契约（exit 1 fail-closed）与 prepack 全链（node build.mjs && node --test tests/*.test.mjs）已就绪，BUILD.md 文档引用其契约即可。
- WINDOWS 条目 #1（01-01 gate-B deviation）已被本 plan 的 run-gates.sh 三段式覆盖，可在 verify-work 前关闭；条目 #2/#3 为本 plan 记录、open 状态留待 verifier 判定。
- 验证实例三项复验（DEV-03）与 BUILD.md 属 01-03，本 plan 未触及。

## Self-Check: PASSED

- FOUND: build/lib/rewrite-map.cjs / tests/rewrite-map.test.mjs / tests/run-gates.sh / tests/build-smoke.test.mjs / build.mjs / package.json / 01-02-SUMMARY.md
- FOUND commits: 395a795（Task 1）· 02fe473（Task 2）· 1880943（Task 3）（`git merge-base --is-ancestor` 于 HEAD）
- Ledger 实测：commits=3（rev-list 85896c8e..HEAD = 3，等于任务 commit 数；代码变更无未提交残留，未跟踪项仅编排器运行态 .planning/milestone.lock、state.json、tmp/）
- 聚合校验全量命令（prepack 链等价形态）exit 0：node build.mjs && node --test tests/*.test.mjs，7/7 pass

---

*Phase: 01-build-mjs*
*Completed: 2026-11-10*
