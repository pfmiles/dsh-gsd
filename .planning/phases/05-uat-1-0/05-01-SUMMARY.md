---
phase: 05-uat-1-0
plan: 01
subsystem: testing
tags: [uat, dsh, plugin-install, session-record, zstd, test-concurrency, tdd]

requires:
  - phase: 03-github-npm-dshmarket
    provides: 可安装 tarball `dsh-gsd-1.20.1-1.dsh022.tgz`（958 files）+ CI 绿
  - phase: 04-migration-coexistence
    provides: 演练证据册三段式（`04-DRILL-EVIDENCE.md`）+ 迁移 runbook
provides:
  - `tests/uat-harness.test.mjs` —— UAT 唯一执行件，3 个 live 用例（UAT-01/02/03、INST-01..05）
  - 会话判据「`assistant/message` 在场 ∧ `turn/end` 递归无 `kind:error`」（实现在 JSON.parse 之后）
  - `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` 判据段 1–3（可重放命令 + UTC 三元组）
  - `--test-concurrency=1` 三处齐备 + `docs-consistency` ⑮ 计数断言（D-10-1）
affects: [05-02, 05-03, 05-04]

actuals:
  tokens: 17439
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - 零残留一次性 `DSH_HOME`（`/tmp/dsh-uat-*`）+ 子进程 env 白名单
    - 会话记录判据（zstd 解压 → 逐行 JSON.parse → 事件级断言），而非「目录存在」
    - 「五类受管面 + 全 home 树（排除 profile）」双快照差集
    - `!!js` 声明式求值（baseUrl = profile 目录）以复核包内自定位
    - 双哨兵阳性/阴性对照（同一前缀、不同值）

key-files:
  created:
    - tests/uat-harness.test.mjs
    - .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md
  modified:
    - tests/docs-consistency.test.mjs
    - package.json
    - .github/workflows/compat-matrix.yml
    - BUILD.md

key-decisions:
  - "INST-01 空入参边按实测改写：dsh 0.2.2-rc.1 的 `plugin --profile <absent> add` exit 0 并初始化 profile（help 原文 initialized on first use），与 05-RESEARCH:91 相反 ⇒ 判据改为「不存在第三种状态」"
  - "INST-05 对声明的 `!!js` 表达式求值：`--dump-config` 明确不求值 `!!js`，字面断言恒红；求值 + 「包内绝对路径 ∧ 文件在盘」严格更强"
  - "UAT-03 改用两个哨兵：单哨兵无法同时满足「不在记录里」与「在记录里」"
  - "引擎路径断言 = 包内路径段 ∧ 引擎名（连续串随模型命令写法变化，实测 15 次 vs 0 次）"
  - "判据环境显式钉 /tmp：macOS `os.tmpdir()` 是 /var/folders"
  - "live 用例默认全 skip（`prepack` 会跑全套测试），缺项逐条写进 skip 理由"

patterns-established:
  - "假绿通道具名化：失败轮同样建 session 目录这件事写在文件头注释与失败消息里"
  - "判据实现自身也要被证伪：首次 live 假红由检测正则引起，修后记录在证据册"

requirements-completed: [UAT-01, UAT-02, UAT-03, INST-01, INST-02, INST-03, INST-04, INST-05, D-10-1]

coverage:
  - id: D1
    description: "UAT-01 / INST-01：零残留 /tmp home → plugin add → 新会话，会话记录谓词成立；安装不改写 profile patch、无禁用条目"
    requirement: UAT-01
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#③ UAT-01 / INST-01"
        status: pass
    human_judgment: false
  - id: D2
    description: "INST-02/03/04/05：受管面差集只落在 profiles/<p>/；不重启即两 row 各 1；`!!js` 求值为包内绝对路径；remove 归零 + 幂等边 + 空操作边"
    requirement: INST-03
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#④ INST-02..05"
        status: pass
    human_judgment: false
  - id: D3
    description: "UAT-02：无 .planning 的临时 git 仓里 gsd-new-project（auto）造出 PROJECT/ROADMAP/STATE，gsd-health 经包内绝对路径解析引擎"
    requirement: UAT-02
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#⑤ UAT-02 / UAT-03"
        status: pass
    human_judgment: false
  - id: D4
    description: "UAT-03：真实会话 .env 被 secret-read guard 拦住且其哨兵不进记录；notes.txt 可读且其哨兵进记录（阳性对照）"
    requirement: UAT-03
    verification:
      - kind: integration
        ref: "tests/uat-harness.test.mjs#⑤ UAT-02 / UAT-03"
        status: pass
    human_judgment: false
  - id: D5
    description: "D-10-1：`--test-concurrency=1` 三处齐备（package.json ×2 + workflow ×1），由 ⑮ 逐处计数扫描守护，并有 /tmp 变异实验证明有牙"
    requirement: D-10-1
    verification:
      - kind: unit
        ref: "tests/docs-consistency.test.mjs#⑮ D-10-1"
        status: pass
      - kind: other
        ref: "/tmp/uat-mut15/predicate-15.mjs（真树 PASS / 删 flag 副本 FAIL）"
        status: pass
    human_judgment: false
  - id: D6
    description: "05-UAT-EVIDENCE.md 判据段 1–3 的「另一个人照抄命令能复现同样输出」程度"
    requirement: UAT-01
    verification: []
    human_judgment: true
    rationale: "证据册的可重放性、边界声明是否写在该写的地方，是读者判断，没有测试能断言；机器只能断言它的形状（段名/三元组/无凭据材料）。"

duration: 37 min
completed: 2026-11-16
status: complete
---

# Phase 5 Plan 1: UAT 执行件与判据固化 Summary

**在零残留 `/tmp` `DSH_HOME` 上把「装得上、跑得完、拦得住」变成可重放的机器判据：3 个 live 用例（UAT-01/02/03 + INST-01..05）实跑 `pass 3 / fail 0 / skipped 0`，并把 `--test-concurrency=1` 补齐到三处、用逐处计数断言钉住（D-10-1）。**

## Performance

- **Duration:** 37 min
- **Started:** 2026-11-16T06:07:05Z
- **Completed:** 2026-11-16T06:44:00Z
- **Tasks:** 3
- **Files modified:** 6（2 新建 / 4 改写）

## Accomplishments

- **会话判据落地**：`tests/uat-harness.test.mjs` 的每个 live 用例都以「`assistant/message` 在场 ∧ 任何 `turn/end` 递归无 `kind:error`」判定，实现在 `JSON.parse` 之后（不是对压缩流做行级正则）。「失败轮同样建 session 目录」这条一号假绿通道写进了文件头注释与两条失败消息。
- **判据环境可信**：每个用例 `mkdtemp('/tmp/dsh-uat-')` 造新 home，子进程 env 先 `delete` `DSH_HOME`/`DSH_PROFILE`/`DSH_PROFILE_DIR`/`ALIPAY_API_KEY` 再注入；安装前断言零 GSD 残留，安装后断言 home 级 `skills/` 仍不存在（技能只可能来自插件）。
- **INST-01..05 全链有据**：`plugin add` 不改写 profile patch（仍 `[]`）、无禁用条目；不重启即 `gsd` 与 `gsd-hooks-bridge` 各 1 行；`configPath` 的 `!!js` 按加载器语义求值得 `…/node_modules/dsh-gsd/config/gsd-hooks.json`（在盘）；`remove` 归零且「删前在场」一侧同时断言；幂等边（第二次 `remove` 不改 manifest、不报成功）与空操作边（从未装过的 profile `remove` 非零退出且无副作用）都在场。
- **UAT-02/03 走真实会话**：临时 git 仓里 `gsd-new-project`（auto）产出 `PROJECT.md`/`ROADMAP.md`/`STATE.md`（+ `REQUIREMENTS.md`/`config.json`），`gsd-health` 的引擎由包内绝对路径解析；`.env` 的读被 `secret-read` guard 拦住（`decision=block`、`exitCode=2`、stderr 指名 guard），其哨兵在整份会话记录里出现 **0** 次，而 `notes.txt` 的同前缀哨兵出现 **12** 次——阳性/阴性对照同时成立。
- **D-10-1 收口**：`package.json` 的 `prepack`/`test` 与 `compat-matrix.yml:56` 三处齐备（`grep -c` = 2 / 1），`compat-matrix` 的 `run:` 行数与四个 matrix cell 逐字未动；⑮ 以逐处计数扫描守护，`/tmp` 变异实验证明它「删 flag 的副本上必红」。全量套件 `ℹ tests 42 / pass 39 / fail 0 / skipped 3`，`BUILD.md:16` 两次跟到实测值（38 → 40 → 42）。

## Task Commits

Each task was committed atomically (Task 2 followed the TDD RED→GREEN contract, so it has two):

1. **Task 1: 端到端一条判据 tracer** - `c353969` (feat)
2. **Task 2: `--test-concurrency=1` 三处落地 + ⑮** — RED: `b973372` (test) → GREEN: `069df9e` (feat)
3. **Task 3: INST-02..05 与 UAT-02/03 的会话判据** - `af6e703` (test)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `tests/uat-harness.test.mjs`（新，708 行）—— UAT 唯一执行件：`uatEnv()` 白名单、`missingPrereqs()`→`t.skip`、`sessionText`/`readSession`、`carriesKindError`（递归）、`homeTree`/`managedSurface`（双快照）、`idBlock`/`scalarEntry`/`evalJsExpr`（INST-05）、3 个 live 用例。
- `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md`（新，106 行）—— 文件头（判据对象/环境形态/目标身份/判据口径/UTC）+ 复验序 9 步 + 判据段 1/2/3 + `⑮ 变异实验` + 每段「这证不了什么」。
- `tests/docs-consistency.test.mjs`（+78 行）—— ⑮ 追加在 ⑭ 之后，命名沿用圈号 + 中文范围前缀 + 冒号声明；零 YAML 依赖，只 `read()` + `includes` + 行级正则。
- `package.json`（2 行）—— `prepack` / `test` 各加 `--test-concurrency=1`；`prepack` 仍以 `node build.mjs && ` 开头（build 失败仍短路）。
- `.github/workflows/compat-matrix.yml`（1 行）—— 第 56 行 `run:` 行尾追加 flag；`run:` 行仍 4 条（L35/38/53/56），四个 cell 未动。
- `BUILD.md`（1 行）—— `:16` 活体计数 38 → 40（Task 2）→ 42（Task 3），`git diff --numstat` 各为 `1 1`。

## Decisions Made

见 frontmatter `key-decisions`（6 条）。核心三条：

1. **计划与实测冲突时以实测为准、并把冲突写进证据册**，但不改判据去凑绿：INST-01 的空入参边（`05-RESEARCH:91` 说会失败，实测 exit 0 且初始化 profile）与 INST-05 的 `!!js` 形态（计划说 dump 出绝对路径，实测 dump 不求值）都属此类。两处都改成断言**更强或更真的不变量**，而不是悄悄放宽。
2. **认证凭据只走进程环境**：`DEEPSEEK_API_KEY` 从 `~/.dsh/.credentials.yaml` 取一次、经 env 传给子进程，不复制 `settings.yaml.imported`、不写盘、不进 git、不 echo；证据册只记「key resolved (len>0)」等价事实。
3. **live 用例默认全 skip**：`prepack` 会跑全套测试，发布链不能被真实会话卡住；同时「无 live 环境 ⇒ 不可能 pass」——它只会 skip 且逐条列出缺什么。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] INST-01 空入参边的判据前提与实测相反**
- **Found during:** Task 1（用例 ③）
- **Issue:** 计划（承 `05-RESEARCH.md:91`）要求 `dsh plugin --profile <absent> add` **非零退出且不建 profile**。实测（dsh 0.2.2-rc.1）：exit **0**，stderr 打 `dsh: initialized profile <name> at …`，`profiles/<name>/` 被创建且**真的**装出了 `gsd` row；`dsh plugin --help` 原文即「the profile whose plugins are managed (initialized on first use)」。照原判据写会恒红。
- **Fix:** 断言真正的不变量「不存在第三种状态」——要么干净失败且不留下 profile，要么**明确宣称初始化**并真的装出 `gsd` row（`--dump-config` 复核）。失败消息从 `absent profile was created` 改为 `absent profile was created silently`（exit 0 却没有初始化声明）。
- **Files modified:** `tests/uat-harness.test.mjs`
- **Verification:** live 用例 ③ 通过；负向观测以逐字命令/输出记入 `05-UAT-EVIDENCE.md` 判据段 1 并标注「不得充当通过形态」。
- **Committed in:** `c353969`

**2. [Rule 1 - Bug] INST-05 的「dump 里出现绝对路径」在本 DSH 版本上不可成立**
- **Found during:** Task 3（用例 ④）
- **Issue:** 计划/`05-RESEARCH.md:895`/`05-VALIDATION.md:61` 要求 `grep -A3 'id: gsd-hooks-bridge'` 看到含 `node_modules/dsh-gsd` 的**绝对路径**。实测 dump 明确**不求值** `!!js`（全文件 21 处 `!!js`，含出厂 bundle 的 `task: !!js ctx.headlessStartup.task`；DSH 源码注释 "without booting or evaluating `!!js`"），`configPath` 原样输出 `!!js >-`。
- **Fix:** 对声明的表达式按**加载器语义**求值（`baseUrl` = profile 目录，`new Function` 作用域只放 `baseUrl`/`process`），断言结果是绝对路径 ∧ 含 `node_modules/dsh-gsd` ∧ 文件在盘。保留 `configPath is not an absolute in-package path` / `!!js literal survived unexpanded` 两个可区分 token。
- **Files modified:** `tests/uat-harness.test.mjs`
- **Verification:** 用例 ④ 通过；求值结果与 `existsSync` 记入判据段 2。
- **Committed in:** `af6e703`

**3. [Rule 1 - Bug] UAT-03 的单哨兵形态使两条断言互斥**
- **Found during:** Task 3（用例 ⑤）
- **Issue:** 计划要求「同一个唯一哨兵串」同时「不出现在会话记录里」（证明 `.env` 内容没进上下文）与「出现在会话记录里」（证明 `.txt` 读成功）。一个串读成功就必然进记录 ⇒ 两条不可能同时成立。
- **Fix:** 两个同前缀、不同值的哨兵（`.env` 一个、`notes.txt` 一个）：`.env` 哨兵出现 **0** 次、`.txt` 哨兵出现 **12** 次。原意（拦的是文件名规则，不是模型不肯读）保留，且两条断言不再矛盾。
- **Files modified:** `tests/uat-harness.test.mjs`
- **Verification:** 用例 ⑤ 通过；两个计数记入判据段 3。
- **Committed in:** `af6e703`

**4. [Rule 1 - Bug] 引擎路径「一条连续串」的断言随模型命令写法随机红绿**
- **Found during:** Task 3（用例 ⑤的手工验证）
- **Issue:** 计划要求会话记录出现 `node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs` 连续串。实测两次会话：一次模型写完整绝对路径（该串 15 次命中），一次写 `GSDROOT=<绝对路径>` + `"$GSDROOT/gsd-core/bin/gsd-tools.cjs"`（连续串 **0** 次命中，但包内路径与 `gsd-tools` 都在场）。按连续串断言会因模型措辞随机失败。
- **Fix:** 断言「包内路径段 `profiles/<p>/node_modules/dsh-gsd` ∧ 引擎名 `gsd-tools`」两者在场——语义不变（引擎确实从包内绝对路径解析），但不随措辞抖动。
- **Files modified:** `tests/uat-harness.test.mjs`
- **Verification:** 用例 ⑤ 通过；两次实测命中数记入判据段 3。
- **Committed in:** `af6e703`

**5. [Rule 1 - Bug] 用例 ⑤ 第一次 live 实跑是「判据实现」造成的假红**
- **Found during:** Task 3 首次串行实跑
- **Issue:** 报 `model never issued the read(.env) call`，但回看保留的失败 home 发现模型**确实**发了 `{"file_path":"…/.env"}` 的 `read` 且被 guard 拦住。根因是检测正则只接受 `.env` 前为空白/引号，没接受路径分隔符 `/`。**这不是模型不配合**。
- **Fix:** 前缀字符类补 `/` 与 `\`（后者覆盖模型写 `grep '\.env'` 的转义形态）。修后同一用例 127 s 通过。
- **Files modified:** `tests/uat-harness.test.mjs`
- **Verification:** 判据段 3 单列一段记录此假红（「遇到红先查判据实现，再谈未执行」）。
- **Committed in:** `af6e703`

**6. [Rule 3 - Blocking] 判据环境不在 `/tmp`**
- **Found during:** Task 3 首次实跑（保留的 home 落在 `/var/folders/...`）
- **Issue:** `os.tmpdir()` 在 macOS 返回 `/var/folders/…`，与 D-01 / 计划硬判据要求的 `/tmp/dsh-uat-*` 不符（也让证据册里的路径与判据口径不一致）。
- **Fix:** 显式 `UAT_TMP = '/tmp'`，home 与临时仓都用它做前缀。
- **Files modified:** `tests/uat-harness.test.mjs`
- **Verification:** 后续实跑的 home 路径均为 `/tmp/dsh-uat-*`；证据册手工旁证路径同为 `/tmp/dsh-uat-ev-*`。
- **Committed in:** `af6e703`

---

**Total deviations:** 6 auto-fixed（Rule 1 × 5、Rule 3 × 1）。
**Impact on plan:** 无一放宽判据：1/2 把断言换成更强或更真的不变量并逐条留证；3/4 修掉了两个会随机假红/假绿的判据形态问题；5/6 是判据实现与环境口径的 bug。**没有一条是「为了变绿而改判据」**。两处与 `05-RESEARCH.md` 的冲突（`plugin add` 空 profile、dump 不求值 `!!js`）已在证据册逐字记录，后续计划不应再把这两条当既有事实引用。

## TDD Gate Compliance

| Task | RED | GREEN | REFACTOR | 备注 |
|---|---|---|---|---|
| Task 2 | `b973372` `test(05-01): …` | `069df9e` `feat(05-01): …` | — | RED 由 `gsd_run check tdd-red-evidence` 判 **RED_EVIDENCE_OK**（`target_test_failed`，14 pass / 1 fail，TAP 报告 117 行）；`⑮` 在删 flag 的副本上报红（变异实验），原树报绿 |
| Task 3 | — | `af6e703` `test(05-01): …` | — | **无独立 RED 提交，理由如实记录**：Task 3 的交付物本身就是测试，被测行为（DSH 的 bundle 安装/会话记录、插件的 skills 与 hooks）已由前序 phase 交付，本计划不写任何生产代码；制造一个假的 RED 属于表演。它的「能失败」由两件事证明：⑮ 式变异实验的同类方法，以及执行期真实撞到并修掉的一次假红（见偏离 5） |

## Issues Encountered

1. **并发假红未复现**：Task 2 的串行纪律对照跑了两次（无 flag 40 tests / 39 pass / 0 fail；带 flag 同值），`gate C: no SKILL.md` 命中 0。按计划**不为凑一条红反复重试**，如实记「未复现」，flag 依机制与「prepack 假红会中止发布」这条阻塞风险立论（`05-RESEARCH.md:731` 亦记 deliberately not）。
2. **`--dump-config` 的 `!!js` 形态**：见偏离 2。这条对后续计划（尤其 05-03 的 registry 复验）同样是事实，不要再用「dump 里是绝对路径」的口径。
3. **`dsh plugin add` 的警告**：安装日志有 `Agent skills awaiting approval: dsh-gsd@file:…` 与 peer 依赖 WARN，但实测技能与会话均正常（UAT-02 真的调到了 `gsd-new-project`/`gsd-health`）——该警告不构成阻塞，也不作判据。

## User Setup Required

None - 全部验证在一次性 `/tmp` home 与临时 git 仓里完成；真实 `~/.dsh` 全程只读（`profiles` 4 个 + `node_modules`、`skills/gsd-*` 72 / 总 84、`web`/`headless` 的 bridge 行各 2，与 phase 进入时一致）。

## Next Phase Readiness

- UAT 执行件与判据环境已就位：05-02 的用例 ①②⑥⑦ 直接长在 `uatEnv()` / `missingPrereqs()` / `sessionText()` / `assertSessionSucceeded()` / 证据册三元组格式上，不必另造环境。
- 05-02/03 需注意：`tests/uat-harness.test.mjs` 现在有 3 个用例（`ℹ skipped 3` 是当前无 live env 的**正确**读数）；每加一个 `test(` 必须同一次提交更新 `BUILD.md:16`（当前 42），否则活体计数会静默漂移（`05-PATTERNS` F-04）。
- 05-03 的 registry 通道复验会重跑 UAT-01：把 `DSH_UAT_TGZ` 指向 registry 下载到 `/tmp` 的同版本 tarball 即可，判据不需要改。
- `--test-concurrency=1` 三处已齐备，`npm test` 现在与串行全量等价；`prepack` 的并发假红这条发布中止风险消除。

## Self-Check: PASSED

- 文件存在：`tests/uat-harness.test.mjs` FOUND / `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` FOUND
- 提交可达：`c353969` FOUND / `b973372` FOUND / `069df9e` FOUND / `af6e703` FOUND（`git merge-base --is-ancestor` 四者皆真）
- RED 证据：`.build-cache/tdd-red-05-01-task2.json` FOUND，`gsd_run check tdd-red-evidence` → `RED_EVIDENCE_OK`
- 全量套件（HEAD）：`ℹ tests 42 / pass 39 / fail 0 / skipped 3`，exit 0
- 三处 flag：`grep -c -- '--test-concurrency=1' package.json .github/workflows/compat-matrix.yml` → `2` / `1`
- 证据册无凭据材料：`grep -c 'sk-'` = `0`