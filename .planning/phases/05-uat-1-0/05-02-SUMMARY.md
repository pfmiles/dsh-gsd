---
phase: 05-uat-1-0
plan: 02
subsystem: testing
tags: [uat, hooks, commit-validator, injection-scanner, plugin-add, version-swap, boot-cost, build-override, tdd, skip-dirs]

requires:
  - phase: 05-uat-1-0
    plan: 01
    provides: `tests/uat-harness.test.mjs` 的骨架（`uatEnv` / `missingPrereqs` / `sessionText` / `assertSessionSucceeded`）+ 证据册判据段 1–3 + `/tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz`
  - phase: 03-github-npm-dshmarket
    provides: 可安装 tarball 与其 `files` 白名单
  - phase: 01-plugin-bootstrap
    provides: `hooks/` 构建树与 `dsh-gsd-suite/run.cjs` wrapper（两个 hook 的唯一分发入口）
provides:
  - UAT-04 的 commit 校验三段对照（opt-in 拦 / opt-in 放 / 未 opt-in 放）+ injection 只落日志
  - UAT-05 的「同一条 `plugin add` 换版本号」（`.dsh022 ↔ .dsh021`）三段判据
  - UAT-06 的三点事件时间戳数字（9 ms / 279 ms / ≈270 ms）与技能 watch 的 `not measured` 处置
  - D-10-5 的构建期 `SKIP_DIRS` 补丁（canonical 覆盖件 + 拷贝步 + 构建后字节等值断言）
  - `05-UAT.md` 的 13 行判据 ↔ 证据 ↔ 结论表（12 个四值闭集结论单元）
  - `BUILD.md:16` 从「无人守的活体计数」变成由 ⑯ 自校验（47/47）
affects: [05-03, 05-04]

actuals:
  tokens: 22667
  tasks: 3
  commits: 5

plan_head_before: b437b897444356710a85f05ce35681833fc43c9d
plan_head_after: b3406eb14220b9308ed133322acb8411f50f92f2
commits: 5

tech-stack:
  added: []
  patterns:
    - 合成 hook payload 经真实 wrapper（`hooks/dsh-gsd-suite/run.cjs`）→ 组件级判定，不必起 `dsh` 进程
    - 三段对照（原点拦 / 原点放 / 负向对照）把「恒拦」「恒放」「fail-open」三种假绿一次性排掉
    - 「只有版本串不同」的 tarball 由已发布字节复刻，判据因此只量一个变量
    - 成对 profile + 交替轮次 + 事件时间戳（`turn/start.time − session.createdAt`）作启动开销口径
    - canonical 覆盖件 + post-staging `cp`（在改写 pass 之前、不递增 `counters.copied`）作为「构建产物补丁」的唯一可重建形态
    - 活体计数自校验（`BUILD.md:16` == `tests/*.test.mjs` 的 `test(` 总数），把静默变旧变成一条红

key-files:
  created:
    - tests/fixtures/injection-sample.md
    - build/assets/ui-frontend-evidence.cjs
    - .planning/phases/05-uat-1-0/05-UAT.md
    - .planning/phases/05-uat-1-0/05-02-SUMMARY.md
  modified:
    - tests/uat-harness.test.mjs
    - tests/build-smoke.test.mjs
    - tests/docs-consistency.test.mjs
    - build.mjs
    - BUILD.md
    - .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md

key-decisions:
  - "UAT-04 的 commit 半边在 mkdtemp 出来的 scratch cwd 上跑三段对照，绝不改本仓配置：`gsd-validate-commit.sh` 用 `require('./.planning/config.json')` 读当前目录，本仓一旦 opt-in，此后每次 commit 都要过校验（不可逆的骚扰）"
  - "「本仓未 opt-in」写成一条断言而不是注释：改坏本仓配置会红并提示「第四条事实需改写」"
  - "injection 半边只断言 exit 0 + INJECTION-PATTERN finding + 无 decision：该 hook 是 PostToolUse advisory，只有 security.injection_blocking=true 时才拦 HIGH；断言「被拦」会按设计制造一条红"
  - "UAT-05 的第二份 tarball 由已打好的字节解包改 version 再 `npm pack --ignore-scripts` 复刻，且「只有版本串不同」用 成员清单 + 逐成员字节 + package.json 的 JSON 语义 三段证明（npm 在 pack 时会重排 package.json 的缩进，字节等值不可满足）"
  - "UAT-06 只用事件时间戳（turn/start.time − createdAt）作开销数字，墙钟并列记录但显式声明不可用：它由 LLM 往返主导，逐轮漂移以秒计"
  - "技能 watch 记 not measured 并给出结构性理由（一次性会话每次都是新进程；watcher 只在长驻 web 进程里可观察；数 fsevents 需要 root），不做任何数字替代"
  - "D-10-5 的补丁落 canonical 覆盖件 + post-staging 拷贝（不递增 counters.copied），断言计数限定在 SKIP_DIRS 的 Set 字面量内——文件头注释点名同一 token 属散文，不计入成员行"

patterns-established:
  - "假绿通道具名化：三个 hook 判据各自把「没执行」与「通过了」写成可区分 token（opt-in commit was not blocked / conforming commit was blocked / non-conforming commit passed without opt-in / validator disabled line on stderr / no INJECTION-PATTERN finding / plugin adds no measurable boot cost / front-matter description token never reached the session）"
  - "判据实现自身也要被证伪：本轮 GREEN 首次跑就撞上一次自造的错诊断（Set 闭包行正则漏了 `)`），修好后记进证据册判据段 6"

requirements-completed: [UAT-04, UAT-05, UAT-06, INST-06, D-10-5]

coverage:
  - id: D1
    description: "UAT-04 commit 半边：opt-in 下非规范消息被拦（exit 2 + CONVENTIONAL_COMMITS_VIOLATION）、规范消息放行、未 opt-in 时非规范消息放行（负向对照），三段 stderr 均不含 fail-open 文案"
    requirement: UAT-04
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#① UAT-04 commit 校验三段对照"
        status: pass
    human_judgment: false
  - id: D2
    description: "UAT-04 injection 半边：fixture 正文经 PostToolUse 合成 payload → exit 0 + severity HIGH + 3 条 INJECTION-PATTERN + 无 decision（只落日志，不 block）"
    requirement: UAT-04
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#② UAT-04 injection 扫描落日志"
        status: pass
    human_judgment: false
  - id: D3
    description: "UAT-05：同一条 plugin add 换版本号，.dsh022 → .dsh021 → .dsh022，version 随之变化、两 row 各恰 1 行、回滚后会话谓词仍成立；两份 tarball 只有版本串不同"
    requirement: UAT-05
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#⑥ UAT-05 升级/回滚"
        status: pass
    human_judgment: false
  - id: D4
    description: "D-10-5：构建后的 gsd-core/bin/lib/ui-frontend-evidence.cjs 与 build/assets/ui-frontend-evidence.cjs 逐字节相同，且 SKIP_DIRS 的 Set 成员行里 .gsd-build-tmp 恰 1 行（连跑两次构建后仍成立）"
    requirement: D-10-5
    verification:
      - kind: integration
        ref: "tests/build-smoke.test.mjs#真实构建 → 产物断言（… ⑨ 组）"
        status: pass
      - kind: other
        ref: "plan verify 的补丁门脚本：skip-dirs-range=127-141 set-members=1 whole-file=4，二次构建后 PASS"
        status: pass
    human_judgment: false
  - id: D5
    description: "BUILD.md:16 的活体套件计数自校验：预期 N 与 N/N 各恰 1 处、互相一致、且等于 tests/*.test.mjs 的 test( 总数（47）"
    requirement: INST-06
    verification:
      - kind: unit
        ref: "tests/docs-consistency.test.mjs#⑯ BUILD.md 的活体套件计数自校验"
        status: pass
    human_judgment: false
  - id: D6
    description: "INST-06 元数据合规回归（pack-contents 的 files/locale/icon 白名单 + docs-consistency 的元数据守卫）"
    requirement: INST-06
    verification:
      - kind: unit
        ref: "node --test --test-concurrency=1 tests/pack-contents.test.mjs tests/docs-consistency.test.mjs → 20 pass / 0 fail（2026-11-16T07:16:30Z）"
        status: pass
    human_judgment: false
  - id: D7
    description: "UAT-06 启动开销：成对 profile 交替 3 轮，median(base)=9 ms、median(p5)=279 ms、插件段 ≈270 ms（事件时间戳口径）"
    requirement: UAT-06
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#⑦ UAT-06 三点启动开销"
        status: pass
    human_judgment: true
    rationale: "数字本身是机器判据，但「≈0.27 s 的插件启动成本是否可接受、README 该怎么写」是人的判断；另 UAT-06 的 watch 半边为 not measured（结构性不可测），只有人能决定是否去跑 RESEARCH §Q5 的 method 2。"
  - id: D8
    description: "05-UAT.md 的可复核性：13 行判据 ↔ 证据 ↔ 结论，结论取四值闭集，open items 逐条可执行"
    requirement: UAT-04
    verification: []
    human_judgment: true
    rationale: "「另一个人能否照着证据册逐行复核」是读者的判断，没有测试能断言；机器只能断言它的形状（12 个结论单元、12 个需求 ID 均有落点、含 not measured 与开放项）。"

duration: 26 min
completed: 2026-11-16
status: complete
---

# Phase 5 Plan 2: 回归面 UAT 与构建期补丁 Summary

**把余下的验收面变成可重放的判据：两个 hook 在真实分发路径上各按设计行事（commit 校验三段对照 + injection 只落日志）、同一条 `plugin add` 能把版本换进换出、插件启动成本有一个带基线的数字（9 ms → 279 ms）、技能 watch 被诚实标成 `not measured`，并把 D-10-5 修成经得住重建的形态（canonical 覆盖件 + 拷贝步，连跑两次构建仍字节等值）。**

## Performance

- **Duration:** 26 min
- **Started:** 2026-11-16T06:55:48Z
- **Completed:** 2026-11-16T07:19:42Z
- **Tasks:** 3（TDD 任务各 2 个提交 = 5 个提交）
- **Files modified:** 9（4 新建 / 5 改写；`build/assets/ui-frontend-evidence.cjs` 与 `tests/fixtures/injection-sample.md` 是新增的入库资产）

## Accomplishments

- **UAT-04 有牙**：`hooks.community: true` 的 scratch cwd 上非规范消息 exit 2 + `{"decision":"block","code":"CONVENTIONAL_COMMITS_VIOLATION"}`，规范消息 exit 0 且**无** block 判定，未 opt-in 的同一条非规范消息 exit 0；三段 stderr 都不含 fail-open 的 `validator disabled`。这排掉了「恒拦」「恒放」「fail-open」三种假绿，且**本仓配置零改动**（`git diff -- .planning/config.json` 为空）。
- **本仓未 opt-in 成了断言**：用例 ① 直接读 `.planning/config.json` 并断言 `hooks.community !== true`，失败消息是「若本仓已 opt-in，改写 UAT-04 的第四条事实」。它把「commit 校验在本仓默认不生效」从一段散文变成一条可复核的开放项。
- **injection 只落日志**：`tests/fixtures/injection-sample.md`（本次入库，此前只活在 `/tmp`）的三段签名 → `severity=HIGH`、`findings=3`（3 条 `INJECTION-PATTERN`）、**无** `decision` 键、exit 0。没有一处断言 block。
- **UAT-05 只量一个变量**：第二份 tarball 由已发布字节复刻，成员清单 958/958 逐行相同、除 `package/package.json` 外逐成员字节相同、该文件 JSON 语义上只差 `version`。三段 swap 的 dump 都是 393 行、两 row 各 1，回滚后会话谓词仍成立。
- **UAT-06 有基线不是感觉**：成对 profile（同 home、同模板、只差 `plugin add`）交替 3 轮，`median(base)=9 ms`、`median(p5)=279 ms`、插件段 ≈270 ms（RESEARCH 基线 10 / 340 / ≈330，同口径不同值）。墙钟并列记录为反例（2 560–3 834 ms，LLM 主导）。
- **启动读取量到了，watch 没有**：改 `skills/gsd-help/SKILL.md` 的 front-matter `description` → 新进程会话里 token 命中 2 次。这是「启动时读取」，**不是**热重载；`05-UAT.md` 的 `技能 watch` 行是 `not measured` 并带结构性理由。
- **D-10-5 经得住重建**：补丁落 `build/assets/ui-frontend-evidence.cjs`（入库、可 review、文件头记上游版本/缺失后果/整文件覆盖的告诫）+ `build.mjs` ⑤ 块末尾一行 `cp`（在 ⑥ 改写 pass 之前、**不**递增 `counters.copied`）。`copied 76 trees` 未变；`skip-dirs-range=127-141 set-members=1 whole-file=4`，第二次构建后仍 PASS。
- **活体计数自校验**：⑯ 读 `BUILD.md` 的「预期 N」与「N/N」两处形态（各断言恰 1 处）并断言等于 `tests/*.test.mjs` 的 `test(` 总数。`BUILD.md:16` 42 → 47（`git diff` = 1 1），套件 `ℹ tests 47 == 47`。
- **全套门**：`node build.mjs` → `gates: all passed (A/B/C)` / `copied 76 trees`；无 live 跑 `skipped 7 / fail 0`；live 跑 `pass 7 / skipped 0`；INST-06 回归 20/20（`2026-11-16T07:16:30Z`）；全量 `tests 47 / pass 40 / fail 0 / skip 7`。

## Task Commits

Each task was committed atomically; the two `tdd="true"` tasks followed the RED → GREEN contract, so they have two commits each:

1. **Task 1（tracer）: UAT-04 的两半 + 入库的 injection fixture** - `8736dbe` (feat)
2. **Task 2（TDD）: D-10-5 构建期补丁 + UAT-05**
   - RED: `790f103` (test) — 新断言先红（canonical 覆盖件不存在）
   - GREEN: `1adaf31` (feat) — canonical 覆盖件 + `build.mjs` 拷贝步
3. **Task 3（TDD）: UAT-06 三点 + 技能启动读取 + ⑯ + `05-UAT.md` 成文**
   - RED: `f8e66b8` (test) — ⑯ 先红（`47 !== 42`）
   - GREEN: `b3406eb` (feat) — `BUILD.md:16` 47 + 判据段 7/8 + 13 行报告

**Plan metadata:** 本提交（docs: complete plan）。`commits:` 由账本实测：`b437b89..b3406eb` = **5**。

## Files Created/Modified

- `tests/uat-harness.test.mjs`（+481 −1，共 7 个用例）—— 追加 ①（commit 三段对照）、②（injection 只落日志）、⑥（UAT-05 三段 swap + 复刻助手 + `assertOnlyVersionDiffers`）、⑦（UAT-06 六轮 + boot-read probe）。复用 05-01 的 `uatEnv` / `missingPrereqs` / `sessionText` / `assertSessionSucceeded` / `rowCount`，未改其谓词。
- `tests/fixtures/injection-sample.md`（新建）—— 三段互不相同的已知注入签名；文件头两行声明它是安全 fixture、不是给模型读的内容。
- `build/assets/ui-frontend-evidence.cjs`（新建，308 行）—— upstream `@opengsd/gsd-core@1.20.1` 的整份 `bin/lib/ui-frontend-evidence.cjs` + `SKIP_DIRS` 里 `.gsd-build-tmp`；文件头记三件事（上游版本 / 缺失后果 / 整文件拷贝钉住上游内容）。
- `build.mjs`（+14）—— ⑤ 块末尾一条 `cp(join(root,'build','assets','ui-frontend-evidence.cjs'), join(root,'gsd-core','bin','lib','ui-frontend-evidence.cjs'))`，不递增 `counters.copied`，附一段解释为什么上游那份是错的、为什么不用 `rewrites` 表。
- `tests/build-smoke.test.mjs`（+61）—— ① 内新增 ⑨ 组：存在、与 canonical 逐字节相同、`SKIP_DIRS` **成员行**里 `.gsd-build-tmp` 恰 1 行（计数限定在 Set 字面量内，注释里的提及不计）。未新增 `test(`。
- `tests/docs-consistency.test.mjs`（+51 −1）—— ⑯（活体计数自校验）；`readdirSync` 加入 import；文件头补 ⑮⑯ 一行。
- `BUILD.md`（1 1）—— `:16` 42 → 47，`39 pass / 3 skip` → `40 pass / 7 skip`。
- `.planning/phases/05-uat-1-0/05-UAT.md`（新建，38 行）—— 13 行判据表 + 三段小字（判据环境 / 不进 npm 包 / 四条开放项）。
- `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md`（+156）—— 判据段 4（UAT-04）、5（UAT-05）、6（D-10-5）、7（INST-06 回归）、8（UAT-06），每段都有「这证不了什么」。

## Decisions Made

见 frontmatter `key-decisions`（7 条）。核心三条：

1. **判据必须能区分「没执行」与「通过了」**。每个 hook 判据都自带可区分 token（`opt-in commit was not blocked` / `conforming commit was blocked` / `non-conforming commit passed without opt-in` / `validator disabled line on stderr` / `no INJECTION-PATTERN finding`），并且 ①② 虽然不需要 `dsh` 会话，仍受 `missingPrereqs()` 门控——否则「无 live 环境 ⇒ 全 skip ⇒ `ℹ fail 0`」会被读成 UAT-04 通过。
2. **不改本仓配置，把「本仓未 opt-in」变成断言**。opt-in 打开后此后每次 commit 都要过校验，属不可逆的骚扰；这三段对照因此全部跑在 `mkdtemp` 出来的 scratch cwd 上。
3. **watch 不编数字**。能测的只有「新进程启动时读到新描述」（实测 token 命中 2 次），`技能 watch` 记 `not measured` 并给出结构性理由；启动读取**不得**被写成 watch 的证据。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `SKIP_DIRS` 闭包行的正则漏了 `)`，GREEN 首次跑出一条自造的错诊断**
- **Found during:** Task 2 的 GREEN（`node --test --reporter=tap tests/build-smoke.test.mjs`）
- **Issue:** ⑨ 组的区间定位写成 `/^\];/`，而闭包行是 `]);` —— `]` 后紧跟 `;`，永远不会命中，于是永远报 `SKIP_DIRS literal is not closed …`。这条红与补丁无关，是判据实现的 bug。
- **Fix:** 改成 `/^\]\);$/`（`]` `)` `;` 三个字面量），并在注释里写明为什么不能省那个 `)`。
- **Files modified:** `tests/build-smoke.test.mjs`
- **Verification:** 改后 `# tests 2 / # pass 2 / # fail 0`；记录进 `05-UAT-EVIDENCE.md` 判据段 6 的「GREEN 前的一次自造错诊断」。
- **Committed in:** `1adaf31`（GREEN 提交）

**2. [Rule 1 - Bug] 两份 tarball 的 `package.json` 不可能逐字节相等（npm 在 pack 时重排缩进）**
- **Found during:** Task 2 的复刻助手探针
- **Issue:** 计划要求「两个 tarball 只有版本串不同」。按**字节**比对时 `package/package.json` 恒不相等：`npm pack` 会把 `repository: { … }` / `keywords` 之类重排成多行缩进。照字面写成字节等值断言会是一条恒红的判据。
- **Fix:** 判据改成三段证明 —— 成员清单逐行相同、除 `package.json` 外**逐成员字节相同**、`package.json` 在 **JSON 语义**上去掉 `version` 后深度相等。即「只有版本串不同」是 JSON 语义陈述，其余 957 个成员仍是字节相同的。这条限定逐字写进 `05-UAT-EVIDENCE.md` 判据段 5，`05-UAT.md` 的 UAT-05 行也带着它。
- **Files modified:** `tests/uat-harness.test.mjs`、`05-UAT-EVIDENCE.md`、`05-UAT.md`
- **Verification:** 三段 swap 全过；`differing` 数组恰为 `['package.json']`。
- **Committed in:** `790f103`（RED）/ `1adaf31`（GREEN）

**3. [Rule 2 - Missing Critical] 计划的证据册章节 4–7 没有给 UAT-06 留落点**
- **Found during:** Task 3 写证据册时
- **Issue:** 计划的 artifacts 把判据段固定为「4 = UAT-04、5 = UAT-05、6 = D-10-5、7 = INST-06」，但 `05-UAT.md` 的 UAT-06 行必须有一条可引用的判据段（UAT-06 是本计划四个主判据之一）。没有落点，那一行就只能是散文。
- **Fix:** 按计划编号补齐 4–7 不动，**另加** `## 判据段 8 — UAT-06（三点启动开销 + 技能目录的启动读取）`；`05-UAT.md` 的 UAT-06 两行指向判据段 8。计划的 4–7 口径因此原样成立。
- **Files modified:** `05-UAT-EVIDENCE.md`、`05-UAT.md`
- **Verification:** `grep -n '^## 判据段'` → 1..8 齐全，4–7 的内容与计划指定的一致。
- **Committed in:** `b3406eb`（GREEN 提交）

---

**Total deviations:** 3 auto-fixed（Rule 1 × 2、Rule 2 × 1）。
**Impact on plan:** 无一条放宽判据。偏离 1 修的是判据实现的 bug（错诊断会让人以为补丁没落地）；偏离 2 把一条**恒红**的断言换成更强的三段证明并把限定写进报告（而不是删掉它）；偏离 3 补上计划漏掉的一个证据落点。**没有一条是「为了变绿而改判据」。**

## TDD Gate Compliance

| Task | RED | GREEN | REFACTOR | 备注 |
|---|---|---|---|---|
| Task 1（`type="tracer"`） | — | `8736dbe` | — | tracer 不要求 RED；它的「能失败」由三段对照的负向支路证明：任一段反向即红，且每条红消息点名是哪一段 |
| Task 2 | `790f103` `test(05-02): …` | `1adaf31` `feat(05-02): …` | — | RED 由 `gsd_run check tdd-red-evidence` 判 **RED_EVIDENCE_OK**（`target_test_failed`，TAP 2 tests / 1 pass / 1 fail，失败原文 `build/assets/ui-frontend-evidence.cjs missing …`，且构建本身成功——前五组断言都过了才到 ⑨ 组） |
| Task 3 | `f8e66b8` `test(05-02): …` | `b3406eb` `feat(05-02): …` | — | RED 判 **RED_EVIDENCE_OK**（`target_test_failed`，TAP 16 tests / 15 pass / 1 fail，失败原文 `BUILD.md:16 的活体计数已过期：它写 42，而 … 实际 47`）。⑯ 是一个**关于文档数字**的断言，所以它的 RED 形状天然是「读到陈旧值」而不是「功能缺失」 |

`git log -E --grep` 复核：`^test\(0*5-0*2\):` 命中 2 条（`790f103`、`f8e66b8`），`^feat\(0*5-0*2\):` 命中 3 条（`8736dbe`、`1adaf31`、`b3406eb`），无 `refactor` 提交（没有值得单独的清理）。

## Issues Encountered

1. **`npm pack --pack-destination` 要求目标目录已存在**：首次探针直接 `npm pack --ignore-scripts --pack-destination "$W/out"` 报了 `ENOENT … out/dsh-gsd-…tgz`（`mkdir -p` 在其后）。helper 里因此先 `mkdirSync(dest, { recursive: true })` 再 pack，并把这条写进 evidence 段 5 的复刻步骤。
2. **RED 的诚实状态需要重建**：Task 2 的两个实现文件（canonical 覆盖件 + `build.mjs` 拷贝步）在写测试时已经在工作树里了。为了拿到真正的 RED，先把 `build.mjs` 存到 `/tmp` 并 `git checkout -- build.mjs`、把覆盖件移出工作树，跑完 RED 取证再复原。RED 报告里的 `expected` 因此是「覆盖件存在」，`actual` 是「不存在」——与提交顺序一致。
3. **`assert.notEqual(setClose, -1)` 的失败消息**：偏离 1 的第一次报错是 `notStrictEqual` 而不是一条自解释的消息，靠在 evidence 段 6 里记下「遇到红先查判据实现」补上可读性。

## User Setup Required

None - 全部验证在一次性 `/tmp` home、临时 git 仓与 scratch cwd 里完成；真实 `~/.dsh` 全程只读（`profiles` 4 个 + `node_modules`、`skills/gsd-*` 72 / 总 84、`web`/`headless` 的 bridge 行各 2，与 phase 进入时一致）。`DEEPSEEK_API_KEY` 只经进程环境传入（一次性从 `~/.dsh/.credentials.yaml` 取出），不打印、不落盘、不进 git。

## Next Phase Readiness

- **05-03 可直接复用**：UAT-05 的 swap 判据只需要把 `DSH_UAT_TGZ` 指向 registry 下载到的同版本 tarball，判据不用改；`05-UAT.md` 的开放项 3 已把「registry 通道的升级/回滚复验」分配给 05-03。
- **05-04 需要读的开放项**：开放项 1（本仓 commit 校验未 opt-in）、开放项 4（codegraph 同层合成 CB-8b 的静态段）。watch（开放项 2）若最终仍无人测，`README.md` 必须照 SC-3 写 `not measured`。
- **套件已到 47 条**：任何新增 `test(` 都必须同一次提交更新 `BUILD.md:16`，否则 ⑯ 会红（这正是它的用途）。live 用例 7 条仍默认全 skip——`prepack` 会跑全套，发布链不能被真实会话卡住。

## Self-Check: PASSED

- 文件存在：`tests/fixtures/injection-sample.md` FOUND / `build/assets/ui-frontend-evidence.cjs` FOUND / `05-UAT.md` FOUND / `05-UAT-EVIDENCE.md` FOUND
- 提交可达：`8736dbe` / `790f103` / `1adaf31` / `f8e66b8` / `b3406eb` 五者 `git merge-base --is-ancestor` 皆真
- RED 证据：`.build-cache/tdd-red-05-02-task2.json` FOUND → `RED_EVIDENCE_OK`；`.build-cache/tdd-red-05-02-task3.json` FOUND → `RED_EVIDENCE_OK`
- 构建门：`node build.mjs` exit 0，`gates: all passed (A/B/C)`，`copied 76 trees`
- 补丁门：`set-members=1 whole-file=4`，连跑两次构建后 `PASS`
- live 跑：`ℹ tests 7 / ℹ pass 7 / ℹ fail 0 / ℹ skipped 0`
- 无 live 跑：`ℹ tests 7 / ℹ pass 0 / ℹ fail 0 / ℹ skipped 7`
- INST-06 回归：`ℹ tests 20 / ℹ pass 20 / ℹ fail 0`（2026-11-16T07:16:30Z）
- 全量套件（HEAD）：`ℹ tests 47 / ℹ pass 40 / ℹ fail 0 / ℹ skipped 7`，exit 0，且 47 == `BUILD.md:16`
- 报告形状：`05-UAT.md` 12 个结论单元 / 12 个需求 ID 均有落点 / 含 `not measured` 与开放项清单
- 工作树：本计划足迹恰 9 个文件；仓根 `*.tgz` 0 个
- 证据册无凭据材料：`grep -c 'sk-'` = `0`