---
gsd_state_version: "1.0"
current_phase: 05
current_plan: Not started
status: completed
stopped_at: Phase 05 complete — all phases complete
last_updated: "2026-11-26T13:27:46.446Z"
last_activity: 2026-11-26
last_activity_desc: Phase 05 complete
state_head: b81a3b152e418345bf4e15c851c6a90504605d0d
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 18
  completed_plans: 18
  percent: 100
---

# STATE: dsh-gsd

## Current Position

Phase: 05
Plan: 4 of 4
Current Plan: Not started
Total Plans in Phase: 4
Status: All phases complete
Last activity: 2026-11-26 — Phase 05 complete

Progress: [██████████] 18/18 plans (100%) — 5/5 phases (100%)

## Current Focus

> **2026-11-12 执行 03-03 完成（本 phase 最后一个计划）**：push 前六项证据当场复跑（四格 4/4、三档构建、actionlint 0 findings、全量 32/32、zero-state、待推 106）→ Task 2 blocking-human 裁决 = **「先在一个临时仓库干跑一次，绿了再推」** → 探针私仓 `pfmiles/dsh-gsd-ci-probe` 同 SHA 跑绿（run 43218482632，1m36s）后删仓 → 真仓推送 `d3c8e89..20e20c0`（HTTPS + `gh` credential helper）→ Actions 史上第一跑 **`43218878911` / conclusion=success / total_count=1**（4 格 × 6 步全绿，run_attempt=1，无红跑历史）。**SC-5 成立；PUB-01 闭合。下一步 = `/gsd-verify-work 03`。** 通道现实：**SSH 不可用**（`~/.ssh/id_rsa` 非 `pfmiles` 账号有效 key，`Permission denied (publickey)`），`origin` 保持 SSH 未改写 ⇒ 后续推送须显式 HTTPS URL + credential helper，`origin/main` 跟踪 ref 不会自动更新（权威值用 `gh api …/commits/main`）。

> **2026-11-12 执行 03-02 完成**：manifest 补 `repository`/`homepage`/`bugs`/`keywords`/`author` + `publishConfig.registry`（钉 npmjs.org）；README 顶部 MIT/DSH 徽章 + zh/en 各一条裸名示例 + 「当前状态」改 Phase 5；`CHANGELOG.md` 首条目 `1.20.1-1.dsh022`（不进 `files`）；`docs/dshmarket/` 5 字段条目 + 提交说明；⑧⑨⑩ 落盘后 `docs-consistency` **10/10**、全量串行 **32/32**（两次同值），`BUILD.md:16` 已写 32/32。**下一步 = 03-03（首次 push 与 CI 首绿）**。

Phase 3: 发布（GitHub + npm + dshmarket） —— **Context locked，ready to plan**（`03-CONTEXT.md` 已落盘；四条裁决 **D-01..D-04**：License=**MIT**（PUB-04 的 Apache-2.0 作废）、**对外发布推迟到 Phase 5**（P3 只交"发布就绪"）、**先修 L37 再 push**、**CHANGELOG+Release 纳入**。REQUIREMENTS 的 PUB-01/PUB-03/PUB-04 与 ROADMAP Phase 3/5 已同步修订）。2026-11-12 复核：**Phase 01 与 Phase 02 的 verification 均已 stale→passed 续跑完毕**，无遗留 stale——Phase 01 14/14（digest ab8770cb）、Phase 02 13/13（digest fe299fa9，17 covered files），两轮均走 #4682 复用产物路径（Nyquist/SECURE/UI 三钩子 State A 复审 → code-review 重审 → regression gate → verifier）。**入 Phase 3 前须处理的上游漂移**：`@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.2` / `dsh-fs@0.2.2-rc.2` 于 2026-11-12T01:54–02:00Z 发布，落入根 peer 开区间 `>=0.2.2-rc.1 <0.3.0-0` 与 rc.1 钉住的 bridge 链冲突，`compat-matrix.yml` L37 的无豁免 install 步会 4 格全 ERESOLVE（已用户裁决归档为已知漂移、移交 Phase 3 修复，`--force` 可用、`--legacy-peer-deps` 不可用）。其余遗留：3 条 known debt（WR-05 零匹配 dispatch 假绿 = 安全侧 T-2-09；WR-06 幽灵轴未回溯 pins.lines；IN-04 门哨兵断言偏弱）、REQUIREMENTS 追溯行缺省、本地 main 领先 origin 未推 —— 由 /gsd-progress 追踪。（2026-11-12 03-03 后：**「未推」已解除** —— main 已推送，远端 main = `20e20c0`；但 SSH 仍不可用，推送通道见 Current Focus 的 03-03 段。）

## Key Decisions（已锁定）

1. 名称 `dsh-gsd`（registry 主流形态，repo/npm/条目三处同名）
2. 引擎资产嵌入插件包（版本自锁），GSD 升级 = 发新插件版本
3. 全局 gsd_run 不安装；skills 用 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` 路径
4. hooks 桥接走 bundle patch YAML 行（ctx.plugin 已证不订阅事件）
5. secret-read-guard 保持上游 basename 行为
6. 开发隔离：GSD phase 只在 3091 验证实例驱动；主 profile 装备插件需等 Milestone 1 稳定通过
7. install-gsd-dsh.sh 保留作迁移/离线保底

## Context Snapshot（最近一次同步）

- 分支：main @ origin = git@github.com:pfmiles/dsh-gsd.git（已建仓；当前本地 ahead 83 未推，push 后 CI 激活）
- 验证实例：gsdtest profile @ 127.0.0.1:3091，插件 file: 安装（dsh-gsd）
- 已知修复：scripts/ 兄弟目录缺失 → 引擎 MODULE_NOT_FOUND（已并入 build.mjs）
- 目标引擎版本：@opengsd/gsd-core 1.20.1（2026-11-10 执行期 checkpoint 人类决策；canonical shasum `d632001e2541e6cccfb740bcad5b2f5c334efabd`，双 registry 一致）；repo 产物树已由 01-01 build 换源重建为 1.20.1（76 棵树）；本机 ~/.dsh 部署快照仍为 1.16.0
- 构建产物不入 git：skills/ gsd-core/ hooks/ config/ scripts/
- 测试锚点（02 复核后现状）：npm test = `node --test tests/*.test.mjs`（5 文件 / 26 tests，含真实构建 smoke）；快速回路 3 套 = 17 tests；prepack = build && tests（gates 内嵌 build）；tests/run-gates.sh 双 env 契约（GSD_VERSION + GSD_STAGING_ROOT，缺失 exit 1）；build/assets/pins.json = 行↔pin 真源 + build/lib/check-pins.mjs（exit 0/1/2）；DSH 矩阵 [0.2.2-rc.1, 0.2.1-rc.5] × GSD [1.20.1, 1.19.0]（workflow 4 格，CI 首绿归 P3）
- 并发纪律：`build-smoke.test.mjs` 会重写构建树，**禁止并发**跑测试或 build（会假红 `gate C: no SKILL.md under skills/gsd-*`）——本轮已实证并全程改为串行
- Phase 3 待纳管：`tests/pending-phase-3/pack-contents.test.mjs`（发布面 tarball 内容防线，3/3 绿）刻意置于 `tests/*.test.mjs` glob 之外以免污染 Phase 02 计数；纳管时需同步更新 BUILD.md/文档计数

## Progress Log

- 2026-11-15 执行 04-05（gap closure，`--gaps-only`）并收官 Phase 04：`1a6f437`（步骤 1 硬门成可裁决双面门 + DRILL-4 六类合成 home）/ `8dfeafe`（步骤 6 拆静态·COEXIST-DRILL·COEXIST-REAL，增量口径统一）/ `a7db7a6`（WR-03 三分归类 + IN-03 314 行 + IN-04）/ `ce4724c`（SUMMARY）。编排层独立复核而非采纳自述：构建门 `gates: all passed (A/B/C)` / 76 树 / 72 技能；测试门与回归门各以 `node --test --test-concurrency=1`（**非 `npm test`**，后者缺 `--test-concurrency=1`）跑得 `38/38` exit 0；6 个带标记块 `bash -n` 全绿；20 个 bash 围栏块首 `export DSH_HOME=` 零违反；`/Users/` 0 处；两半 `##` 各 3。**code review 两轮**：`a0730e5` 复审把 7 条旧 finding 判为 6 fixed / 1 open 并新提 4 条（WR-04 假计数、**WR-05 正则不认自己正文承诺的 `patched by <bundle>` 形态 ⇒ 假红**、IN-05 裸 `<version>` 使演练块 `bash -n` 红、IN-06 en 半「last three rows」与「last row」自相矛盾）；`be46e9f`/`4044efc`/`3ead903`/`e9f1e70`/`67e590c` 五条修复后台账 **11/11 fixed、open 0**（`73dc3ae`，另 `7636521` 对齐 fix-report 标题使对账可自动复现）。**verifier 判 passed 48/48**（`v3:sha256:f6353fd9…`，19 covered files；两条缺口按行为闭合：GAP-1 用 8 个合成 home / 12 次运行、GAP-2 用真 `dsh 0.2.2-rc.1` 对真实 profile 只读副本的四态）→ `phase.complete`（plans 5/5，next=Phase 5）→ `requirements mark-complete MIG-01..04`。**三处编排层纠错**：① ROADMAP Phase 4 的 `**Requirements**: MIG-01..04` 是区间形态，CLI 不展开 ⇒ `phase.complete` 自报 `requirements_updated: false` 且判 `req-line-misparse`，已改写为四个显式 ID 再以 `requirements mark-complete` 逐条落 `[x]` ② `state update-progress` 自报 `updated: true, percent: 20` 却**一个字节都没写**（Progress 行原样），故 `completed_phases`/`percent` 按可证事实手改为 4 / 80（ROADMAP 4 个 `[x]` + 14/14 计划已总结）——与 2026-11-13 的同类订正同口径 ③ 我先前给 `04-SECURITY.md` 加的前向注记把 marker 行号写成 @59/@492，实为 @60/@493（取的是围栏行而非 marker 行），verifier 指出后已改。**已知仍未修（不属本 phase）**：`package.json` 的 `test`/`prepack` 与 CI 均缺 `--test-concurrency=1`（结构性假红隐患）；`chmod` 在本环境被 SIGKILL（rc=137）⇒ 可执行 fixture 桩会静默假红，须改用 `export -f` 函数桩

- 2026-11-13 verification 续跑（Phase 03）：review-fix（`54edd58`/`9fed9cd`/`4fae49d`/`aacdbfa`，删 3 条恒真断言 + 改写 BUILD.md:110）触碰 03 的 4 个 covered files 致 stale；`/gsd-execute-phase 03` 走 #4682 复用产物路径（0 plan 重跑）——verify:post 三钩子均以证据免重派（nyquist 引用的「门只在注释里」突变现场复验仍使 ⑧ 红、security `threats_open` 0、ui 无前端文件改动）→ code-review 第三轮复审修复面 **clean 0 findings**（`e37b949`；前 10 findings 全 fixed/skipped，`open: 0`，`57ed89d`）→ regression gate 5 套件全绿（`npm test` 37/37 exit 0）→ verifier 13/13 passed（新 digest `v3:c61afb20`，18 covered files）→ phase.complete（`eed6bdd`）。**两处编排层纠错（均为 verifier/CLI 自述与实测不符）**：① verifier 声称「指纹原样复制 CLI 输出」，实际写入 `v4:sha256:e5dfaa…` —— 该前缀在**任何 CLI 代码中都不存在**（只出现在 `gsd-core/` 的 `agents/gsd-verifier.md` 与 `templates/verification-report.md` 两份文档里），权威查询因此判 `stale`；改用 CLI 实值 `v3:c61afb20` 后 `passed`，`covered_files` 18 条经核对逐字正确 ② STATE 的 `completed_phases: 2` / `percent: 40` 与 ROADMAP 实况（3/5 个 `[x]`）矛盾，CLI 自报 `preserved-over-disagreeing-derived` 选择保留陈值；已按可证事实订正为 3/60 并同步正文进度行。**IN-02 处置收窄**：HEAD 领先 CI 验证 sha `9e99cd6` 共 10 提交，但 `git diff 9e99cd6..HEAD` 对 `package.json files` 白名单（index.js/cordis.patch.yml/locale/icon.svg/skills/gsd-core/hooks/config/scripts + 恒含的 package.json/README/LICENSE）**为空** ⇒ npm 发布面与 CI 验证字节相同，未过 CI 的只是 `.planning/`、BUILD.md 与 3 个测试文件
- 2026-11-12 execution 03-03（3091 实例）：**首次 push 与 CI 首绿完成**（推送 `d3c8e89..20e20c0`，run `43218878911` conclusion=success，`total_count` 0→1，无红跑历史）——Task 1 六项证据当场串行复跑（四格 4/4：install-ok 656 包 / reject 601 包；三档构建 1.20.1→1.19.0→默认 1.20.1，均 gates 全过 + `copied 76 trees`；actionlint 0 findings；全量 32/32 与 `BUILD.md:16` 等值；status 0 行 / 无 tgz / origin=SSH / `total_count`=0；待推 106）。Task 2 blocking-human 由人类裁决为 **「先在一个临时仓库干跑一次，绿了再推」**；执行期发现三层阻塞：① **SSH 不可用**（`~/.ssh/id_rsa` 非 `pfmiles` 有效 key；`PubkeyAcceptedAlgorithms` 三档算法均无效）② HTTPS 缺 `workflow` scope（人类执行 `gh auth refresh -s workflow -s delete_repo`）③ `osxkeychain` 提供旧 token（须 `git -c credential.helper= -c credential.helper='!gh auth git-credential'`）。探针私仓 `pfmiles/dsh-gsd-ci-probe` 同 SHA 跑绿（run 43218482632，1m36s）后删除（API 404）；真仓只推一次、只有一条 run（`run_attempt=1`）。`origin` 保持 SSH **未改写**（仍不可用；`origin/main` 跟踪 ref 停在 `d3c8e89`，权威远端 sha 用 `gh api`）。PUB-01 闭合；本 phase 3/3 计划完成，待 `/gsd-verify-work 03`。4 条 first-class 偏离 + 4 条记录性差异记入 03-03-SUMMARY
- 2026-11-12 execution 03-02（3091 实例）：元数据与提交材料完成（commits 3f2c909 + 8d0e9c6 + f061bc0 + SUMMARY 0340e46）——package.json 纯新增 8 行（repository/homepage/bugs/keywords/author + publishConfig.registry，`git diff --numstat` = 8 0）；README 徽章/裸名示例/Phase 5 文案（`# dsh-gsd` 仍 2、裸名行 2、pin 示例 4、无 `dsh-gsd@latest`）；CHANGELOG 首条目 `1.20.1-1.dsh022`（Added×2 / Changed×2 / Fixed×1，未进 `files`）；docs/dshmarket 5 字段条目（category=workflow、无 icon）+ 提交说明；docs-consistency 追加 ⑧⑨⑩（10/10），全量串行 32/32 两次同值，BUILD.md:16 写 32/32。PUB-03 / PUB-04 / INST-06 落 Complete。0 auto-fixed、2 条记录性差异记入 SUMMARY；01-VERIFICATION / 02-VALIDATION / STATE 的历史 26/26 未改写
- 2026-11-12 execution 03-01（3091 实例）：发布管线与 CI 首绿完成（commits 6ce5360 + 19911d1 + c304c76）——peer 收紧 exact `0.2.2-rc.1`（package.json + pins.json 同提交，workflow L37 零改动；副本内 npm 通道 656 包全树 dedupe、install-ok confirmed）、workflow 顶层 `permissions: {contents: read}` + install-ok 格门控正向解析断言（`run:` 行数仍 4，落位由 PLAN 自带命令机器证明并对 6 个退化变体 fail-closed）、`tests/pack-contents.test.mjs` 纯重命名纳管（100% similarity、0 行改动；全量 29/29）、真 tarball 958 文件在 profile `gsd-p3-release` 装成并 boot（引擎 1.20.1 / 72 skills / dump-config 两 id）。PUB-02 落 Complete；PUB-01 与 03-03 共享 ID，按共享门待 03-03 SUMMARY 后落 Complete。2 条记录性差异（workflow diff 10 行 vs 括注 6-8 行；`--force` 回退支路未触发）记入 SUMMARY
- 2026-11-12 verification 续跑（Phase 02）：review-fix 七提交（55191da/6356ff4/88d213d/b2e351b/4fe265a/df81330/e8e9d73）触碰 02 的 covered files 致 stale；/gsd-execute-phase 02 走 #4682 复用产物路径（0 plan 重跑）——Nyquist validate State A 复审（26/26 + 17/17 现场复跑、计数 25→26 与 16→17 订正、12 项事实修正、上游漂移 ESCALATE `70e54e4`）→ secure-phase 复审（9 found / 8 closed / 1 open-non-blocking，新登记 T-2-09 `b0c11c5` + 步数订正 `84784f1`）→ ui-review 非 UI 判定维持、两门本次重测（`9cf7907`）→ code-review 重审 HEAD（7/7 前次发现全 resolved、0 regressed，突变实验验证；新发现 WR-05/WR-06/IN-04 `4e81517`）→ disposition 三条新发现入账 open（`e309703`）→ regression gate 26/26 exit 0（含 Phase 01 套件）→ verifier 13/13 passed（新 digest fe299fa9，17 covered files `b800db2`）→ phase.complete（next=Phase 3，`roadmap_updated: false` 属预期因 ROADMAP 早已 `[x]`）。**本轮最重要的产物 = 上游 registry 漂移发现**：四格 install 步在当前 HEAD 全 ERESOLVE，已复现、已用户裁决移交 Phase 3
- 2026-11-12 verification 续跑（Phase 01）：review-fix（384b72a 及 02 修复序列）触碰 01/02 的 covered files 致两阶段 verification stale；/gsd-execute-phase 01 走 #4682 复用产物路径——verify:post 三钩子（Nyquist validate 复审 0 gap `ff645cb`、SECURE 复审 threats_open 0 `48cb443`、UI audit 全 N/A `71759eb`）→ code-review 重审 HEAD clean 0 findings（前 6 findings 保持已修 `51ee48c`）→ verifier 全量 live 复验 14/14 passed（新 digest ab8770cb）→ phase.complete（`4d18d11`，STATE 推进至 Phase 3）。Phase 02 的 stale 待同法续跑（/gsd-execute-phase 02）
- 2026-11-10 bootstrapping：`.planning/` 由主会话按 GSD 模板生成；GSD 流程随后移交 3091 验证实例驱动
- 2026-11-10 planning（3091 实例）：Phase 1 经 PRD express path 跳过 discuss → 轻量 research + pattern map → 3 plans 产出并通过 plan-checker 两轮验证（1 blocker + 2 warnings 已修，0 剩余）；需求覆盖 4/4（SKIL-03/04、INST-02、DEV-03）；决策覆盖门 skipped（无 D-ID）
- 2026-11-10 execution 01-01（3091 实例）：staging 取源管线完成（commits ebf35b4 + 0305b6e）——npm tarball 主链 + 离线三档 + 双 gate + exit 0/1/2 + THIRD-PARTY-NOTICES；3 处 1.20.1 形态差内联适配（gate A 双锚、gate B 三段式、① 档双哈希）记入 01-01-SUMMARY；SKIL-03/04 因共享 ID（01-02/01-03 同声明）按门未落 Complete
- 2026-11-10 execution 01-02（3091 实例）：改写与 gate 迁移完成（commits 395a795 + 02fe473 + 1880943）——rewrite-map.cjs 9 对映射+六组单测、run-gates.sh 三段式/双锚外置并强制消费、build-smoke 76 树/identity/零 '~/.dsh'/adapter 72×1、test/prepack 全链；2 处执行现实适配（gate A/B 继承 01-01 口径、node --test 目录参数→glob 形态）记入 01-02-SUMMARY；SKIL-03/04/INST-02 因共享 ID（01-03 同声明）按门未落 Complete
- 2026-11-10 execution 01-03（3091 实例）：验证实例全量复验与构建文档完成（commits a95f639 + 2d45fac + bca4875 + 14ee71c）——三项复验 live 全过留证 verify-evidence.md（独立 CLI 1.20.1 / gsd-health / read 精确 .env 硬拦 exit 2），两轮 user_setup + 一次 Rule-1 回归修复（hooks 桥接适配器 dsh-gsd-suite/run.cjs 不随 npm tarball → 守卫 fail-open → canonical 入库 + 捕获拷贝，回归 2d45fac、live 复验 bca4875）；BUILD.md 八章（离线四档/gates/exit 0-1-2/交叉核对/复验序）+ README/SBOM 双语互链；DEV-03/INST-02/SKIL-03/SKIL-04 四方 Complete，门此前因共享 ID 未落的判断在本计划 SUMMARY 落盘后解除
- 2026-11-11 verification + 收口（3091 实例）：verify:post 全链——Nyquist validate-phase（1 gap 填补：hooks fail-open 机器防线 ⑥⑦⑧ 入 build-smoke，21a38e6）→ secure-phase（01-SECURITY threats_open 0，38b179f）→ code-review（6 findings 全修 384b72a + 处置 392a5b6）→ verifier（14/14 must-haves，01-VERIFICATION human_needed → UAT 3/3 人工确认 → status passed）→ phase.complete（3/3，next=Phase 2）。追踪 warnings 2 条：01-02-SUMMARY 引用 gsd-core/package.json（1.20.1 形态历史引用）与 REQUIREMENTS 追溯行格式缺省——由 /gsd-progress 追踪

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01-01 | 20 min | 3 tasks | 4 files |
| Phase 01 P01-02 | 11 min | 3 tasks | 6 files |
| Phase 01 P01-03 | 60 min | 3 tasks | 5 files |
| Phase 02 P01 | 35 min | 2 tasks | 6 files |
| Phase 02 P02-02 | 9 min | 2 tasks | 5 files |
| Phase 02 P02-03 | 86 | 2 tasks | 1 files |
| Phase 03 P01 | 10 min | 3 tasks | 5 files |
| Phase 03 P02 | 7min | 3 tasks | 7 files |
| Phase 03 P03 | 9 min（Task 1）/~67 min（Task 2/3 线下） | 3 tasks | 4 files（SUMMARY + STATE + ROADMAP + REQUIREMENTS；产品面 0） |
| Phase 04 P01 | 8 min | 2 tasks | 3 files |
| Phase 04 P02 | 5 min | 2 tasks | 5 files |
| Phase 04 P03 | 10 min | 3 tasks | 4 files |
| Phase 04 P04 | 5 min | 2 tasks | 2 files |
| Phase 04 P05 | 13min | 3 tasks | 5 files |
| Phase 05 P01 | 37 min | 3 tasks | 6 files |
| Phase 05 P02 | 26 min | 3 tasks | 9 files |
| Phase 05 P03 | 69 min (3 dispatches) | 3 tasks | 3 files |
| Phase 05 P04 | 14h 49m | 3 tasks | 7 files |

## Decisions

- [Phase 02]: 2026-11-12 续跑口径：stale→execute-phase 路由下三钩子按 State A（audit existing）复审——VALIDATION 计数订正（25→26 / 16→17）并逐条回查 manual-only 证据册；SECURITY 逐威胁在码复核并新增 HEAD 复审段；UI-REVIEW 维持 6-pillar 全 N/A 但两门本次重测（不沿用旧值）
- [Phase 02]: **上游 registry 漂移归档口径（用户裁决）**：`dsh-skill-filesystem@0.2.2-rc.2`（2026-11-12T02:00:34Z）/ `dsh-fs@0.2.2-rc.2`（01:54:18Z）落入根 peer 开区间 `>=0.2.2-rc.1 <0.3.0-0`，致 `compat-matrix.yml` L37 无豁免 install 步四格全 ERESOLVE（已实测复现）——**不**作为 Phase 02 未决 gap、**不**在本轮改 workflow，移交 Phase 3 修复。约束：`--force` 可用（两向探针绿）；**`--legacy-peer-deps` 不可用**（跳过 host peer → 缺 `dsh-app-boot` → probe exit 1）；上界陷阱 `<0.2.2-rc.2-0` 不能排除 rc.2（rc.2 < rc.2-0），候选 exact peer 或 `<0.2.2-rc.2`
- [Phase 02]: 三条新发现判为 **known debt 而非 must-have 失败**（verifier 裁定，含独立突变复现）：WR-05 零匹配 dispatch 假绿（同安全侧 T-2-09，medium < block_on(high) 故 threats_open 仍 0）、WR-06 幽灵轴未回溯 pins.lines（打的是未来保证，VER-03 现时判据仍成立）、IN-04 门哨兵只断 token 存在不断布尔语义
- [Phase 02]: 并发纪律确立：`build-smoke.test.mjs` 重写构建树，与并发测试/build 会假红（gate C `no SKILL.md under skills/gsd-*`）——本轮实测一次假红后全程改串行；后续验证跑须遵守
- [Phase 02]: 越界产物处置：`tests/pack-contents.test.mjs`（发布面防线，来源不明）移入 `tests/pending-phase-3/` 使 glob 不匹配、Phase 02 计数保持 26/26，文件与 README 说明一并入库（`25ce425`）留待 Phase 3 正式纳管
- [Phase 01]: 2026-11-12 续跑口径：stale→execute-phase 路由下 verify:post 钩子按各 skill 的 State A（audit existing）执行——既存 VALIDATION/SECURITY 复审并追加审计块而非重建；UI-REVIEW 对零 UI 面给 6-pillar 全 N/A 忠实结论（不虚构分数）；code-review 重审以 phase-01 key_files 为界（02 文件已有自属处置，排除），clean 0 findings；verifier 以旧 14 truths 为基线全量 live 复验（含负向矩阵），原 human_verification 由 01-UAT/verify-evidence 闭合不复发
- [Phase 01]: 取源目标版本 = @opengsd/gsd-core@1.20.1（执行期 checkpoint 人类决策，2026-11-10；GSD_VERSION 默认值与全链判据落 1.20.1）
- [Phase 01]: gate A（产物版本交叉校验）在 1.20.1 落为 gsd-core/VERSION + runtime-identity 引擎自报双锚（1.20.1 staged 树无 gsd-core/package.json，1.16.0 有；预 gate ③ 已 pin tarball package.json version）
- [Phase 01]: gate B 三段式：staging 根前缀（4 树）+ 本机 homedir 前缀残留（4 树）+ /Users|home 字面正则（仅 skills 树=SKIL-04 字面范围）；upstream 1.20.1 的 8 处叙述例径属可移植内容不拒
- [Phase 01]: 离线 ① 档 shasum-gating 双重校验：SHA-512 hex vs NOTICES dist.integrity（base64 解码）+ SHA-1 vs dist.shasum（plan sha512/shasum 混用的相干解法，fail-closed exit 2）
- [Phase 01]: run-gates.sh 的 gate A/B 按 01-01-SUMMARY 交接口径实现：gate A 双锚（gsd-core/VERSION === GSD_VERSION 且 runtime-identity 自报精确相等）、gate B 三段式（B1 staging 根 4 树 / B2 homedir 4 树 / B3 /Users|home 字面仅 skills）；plan 旧文为 1.16.0 时代形态
- [Phase 01]: build-smoke 版本锚点断言 gsd-core/VERSION（1.20.1 staged 树无 gsd-core/package.json——01-01 偏差 1 同口径）
- [Phase 01]: test/prepack 脚本采样 'node --test tests/*.test.mjs' glob 形态：Node v24.21.0 实测目录参数 'node --test tests/' 被当作模块加载机械失败（/tmp 最小复现确认），glob 由 node 内部展开，7/7 全绿
- [Phase 01]: WINDOWS 条目 #1（01-01 gate-B deviation）已被 run-gates.sh 三段式覆盖、可关闭（关闭动作留 verifier）
- [Phase 01]: 01-03：hooks 桥接适配器 dsh-gsd-suite/run.cjs 为 install-gsd-dsh.sh 部署产物、不在 @opengsd/gsd-core npm tarball 树内，01-01 4 树捕获默认丢失 → 全部守卫 MODULE_NOT_FOUND fail-open（live 探针实证）；canonical 入库 build/assets 并由 build.mjs 捕获拷贝进产物（回归 2d45fac、live 复验 bca4875）
- [Phase 01]: 01-03：DEV-03 三项复验证据口径 = 可观察输出 + UTC 时间戳 + 新快照声明；live 通过形态只认含修复快照（第二轮 add ≈13:57:48Z → 重启 pid 90223 13:58:39Z → 新 token），旧快照负向仅作根因历史、不充当通过证据
- [Phase 01]: 01-03：BUILD.md 按实况成文（prepack/test glob 形态、run-gates.sh 双 env fail-closed、exit 0/1/2 表与 build.mjs 一致）；README 原 Build & Release 段已被并发重构为自举构建段，互链定点落在该段（双语各 1 处）、不重写全篇
- [Phase 02]: pins.json 增补顶层 version 键：AC2 篡改负向需要版本等值对照有牙，plan 校验序未含该对照；P2-04 禁止第二处硬编码版本串，期望版本置于 pins.json 本身（唯一版本串真源语义）
- [Phase 02]: check-pins 在线取样兼容 npm view --json 数组形态：exact spec 亦返回单元素数组，漂移判定 = 数组长 1 且元素等于 pin，其余 registry drift exit 2
- [Phase 02]: actionlint 1.7.12 经 brew 安装后 0 findings；brew auto-update 卡滞约 20 分钟 → HOMEBREW_NO_AUTO_UPDATE=1 重试同一 brew 安装路径成功
- [Phase 02]: 02-02：1.19.0 staged 树含 gsd-core/VERSION（官方安装器写入）——gate A 双锚天然兼容，形态差异预案未触发，tests/run-gates.sh 零改动
- [Phase 02]: 02-02：Task 1 verify ④ 原命令按裸对象读 npm view 输出，本机 npm 12.2.1 对 exact spec 返回单元素数组+扁平键致 TypeError——验证命令适配为数组归一化+双形态字段读取，等值断言不变（与 02-01 偏差 3 同源）
- [Phase 02]: 02-02：docs-consistency ④ 旧编码哨兵字面量（0.1.0-gsd1.20.1）在测试文件内定义、执行期从 README L19 现取，不写回任何文档/样例
- [Phase 02]: 02-03：负向 doctored fixture 活体拒绝实测文案与 RESEARCH 预期完全一致（exit 1 + installation rejected + allow-version 双指引 + nothing was installed，preflight 早于 pnpm）；复原重装回产品快照身份复检通过
- [Phase 02]: 02-03：~/.dsh 受管文件基线现为 1066（Phase 1 为 987，属本机部署 11-10→11-12 期间外部演进，非本 phase 写入；INST-02 判据维持 before/after comm -13 零新增）
- [Phase 02]: 02-03：Task 2 交互段经人工重启收口——3091 监听 pid 90223→95618（lstart 2026-11-11T17:38:26Z，晚于复原重装 16:46:14Z）；三项 live 复验（/gsd-health 0 errors/2 warnings、read 精确 .env 硬拦 exit-2、ENGINES 人读可读）均于重启后新 token 会话通过并录证
- [Phase 02]: 02-03：两条自动 verify 由续执行器收口——dump-config exit 0（1321 行）L1280 '- id: gsd' + L1282 '- id: gsd-hooks-bridge' 整行精确各计 1（防 'gsd' 子串误判）；comm -13 before/after 输出为空（1066=1066，安装侧零新增）
- [Phase 03] peer 收紧落地形态（D-05）：package.json peerDependencies['@deepseek-ai/dsh-skill-filesystem'] 与 build/assets/pins.json lines.022.peer 同一次提交改 exact 0.2.2-rc.1；compat-matrix.yml L37 零改动；engines.dsh / dshRange / README 窗口串逐字不动（职责不同，有意为之）。副本内 npm 通道 656 包全树 dedupe 到 0.2.2-rc.1、compat-probe install-ok confirmed exit 0。 — check-pins 步骤 (j) 对 "<name> <range>" 拼串逐字比较，只改一侧即 exit 2 并打红 compat-matrix ⑥；开区间会继续吞下 rc.2（上游漂移根因）。
- [Phase 03] workflow 加固形态（D-08）：顶层 permissions{contents: read} + install-ok 格内门控正向解析断言，写在既有『宿主求值探针（install-ok/reject）』的 run: | 块内（run: 行数仍 4，不新增步骤），canonical 门 + || true 兜底 + 显式 exit 2；reject 格被门控跳过。 — ⑦ isGate 要求每个 run: 的上一行是 inputs∩matrix 门；reject 格根 peer 被声明为 exact rc.1，根层解析结果极可能 ≠ matrix.dsh，无条件断言会让首次 CI run 即红（违反 SC-5 无红跑历史）。
- [Phase 03] 发布面收口：tests/pending-phase-3/pack-contents.test.mjs 以 100% 相似度纯重命名进 tests/（0 行改动），待迁目录与自相矛盾 README 一并删除；全量 29/29（BUILD.md:16 按计划不改，终值由 03-02 写入）；真 tarball（958 文件）装进新 profile gsd-p3-release 并 boot（引擎 @opengsd/gsd-core 1.20.1 / 72 skills / dump-config 两 id 各 1 行）。安装日志出现 Agent skills awaiting approval（A2 未验证项，移交 Phase 5 UAT-01）。 — 原址 ROOT 用 import.meta.url 的 '..' 只到 tests/ 导致 ENOENT，移动到 tests/ 即修好且无需改内容；SC-1 的「干净 profile」定义为同一 DSH_HOME 下新 profile 名（新 DSH_HOME 由 Phase 5 UAT-01 覆盖）。
- [Phase 03]: npm 元数据体例与 publishConfig 分工：repository/bugs 用紧凑单行对象、keywords 用单行数组（与 03-PATTERNS 骨架逐字一致）；publishConfig 作为最后一个顶层键只写 registry=https://registry.npmjs.org/，tag 留到 Phase 5 与发布动作一起裁决（推荐 latest，它决定卡片裸名命令能否解析）。 — 本机 npm 默认 registry 是只读镜像 registry.npmmirror.com，不钉 canonical registry 会在 Phase 5 发不出去；private/version/license/files/engines/peer 一律不动（各有机器门），git diff 必须只含新增行。
- [Phase 03]: README 徽章走远端 shields.io（license-MIT 与 DSH-0.2.2--rc.1 两枚），放第一个 # dsh-gsd 之前；第二枚只放行标签不放完整窗口串。docs/ 不进 npm 包，本地 SVG 在 npm 页面会 404（D-07 的镜像结论）。 — 窗口串已有 docs-consistency ② 的双语正文强等值兜底，徽章只是可见性；shields.io 不可达只会破图（A5 显式接受），故 ⑨ 只断言结构不断言 HTTP。
- [Phase 03]: D-06 落地：README zh/en 各补一条裸名示例 dsh plugin --profile web add dsh-gsd（market 卡片形态），pinned 命令 4 处逐字不动；docs/dshmarket 材料逐字引用裸名串，YAML 只留 5 字段、不承载 install 字段、无 icon。 — specCaptures 的 /dsh-gsd@(\S+)/g 对裸名零捕获，⑤ 不动；卡片命令由目标仓 CI 生成且不带版本号，SC-3 的逐字一致只能靠两侧同一行字面串 grep -F 证明；catalog 只收 GitHub 托管位图，本仓只有 icon.svg 会被拒。
- [Phase 03]: 计数按实测收口：⑧ CHANGELOG 版本等值、⑨ 徽章与双语致谢、⑩ INST-06 元数据三条断言零依赖落盘后，两次独立串行全量均为 ℹ tests 32，BUILD.md:16 写 32/32（git diff 恰 1 增 1 删），算术 29+3 只作交叉核对；01-VERIFICATION/02-VALIDATION/STATE 的历史 26/26 未改写。 — 它们是被签名的审计结论，仓内惯例只追加带日期的前向注记；全仓唯一可改写的活体计数是 BUILD.md:16（⛔-E）。

- [Phase 03]: 推送通道 = **HTTPS 显式 URL + `gh` credential helper**，`origin` 保持 SSH **不改写**（仍是 `git@github.com:pfmiles/dsh-gsd.git`，且在本机不可用）。 — SSH 实测不可用：`~/.ssh/id_rsa`（`SHA256:X6AR4nBc…`）被 GitHub `Server accepts key` 后仍 `Permission denied (publickey)`，`rsa-sha2-512/256/+ssh-rsa` 三档算法均无效 ⇒ key 非 `pfmiles` 账号有效 key。把 broken SSH 换成为 HTTPS+token 会把凭据通道固化进 `.git/config`，属更重的变更；代价是 `origin/main` 跟踪 ref 不随推送更新（停在 `d3c8e89`），**权威远端 sha 用 `gh api repos/pfmiles/dsh-gsd/commits/main`**。
- [Phase 03]: `workflow` scope 与 `delete_repo` 由**人类**在 checkpoint 授权后执行 `gh auth refresh -h github.com -s workflow -s delete_repo` 追加（现 scope：`delete_repo, gist, read:org, repo, workflow`）。 — P-03-j 明令执行器不得自行 refresh（改 token = 对外动作）；缺 workflow scope 时 GitHub 拒绝创建/更新 `.github/workflows/*`。`delete_repo` 仅用于删除探针仓。
- [Phase 03]: refresh 之后仍失败的原因不是 scope 而是 **stale `osxkeychain` 凭据**；成功形态固定为 `git -c credential.helper= -c credential.helper='!gh auth git-credential' push <https-url> main`。 — `credential.helper=osxkeychain` 把旧 token 顶在 gh 的新 token 之前；`gh auth status` 的 `Git operations protocol: ssh` 又让默认路径继续走坏掉的 SSH。清空 helper 链后只接 gh 的 helper 即通。
- [Phase 03]: 首跑前增加**探针私仓干跑**（用户裁决「先在一个临时仓库干跑一次，绿了再推」）：`pfmiles/dsh-gsd-ci-probe` 推同一 SHA → run `43218482632` success（4 格全绿，1m36s）→ `gh repo delete --yes` → API 404。 — 用一次可删除的 run 换掉「真仓首跑变红」的不可逆风险；探针仓不留在任何公开历史上。真仓随后只推一次（`run_attempt=1`、`total_count=1`）。
- [Phase 03]: **第二次推送**（`20e20c0..9e99cd6`）把 CR-01 修复 + 8 条守卫 + 全部审查/验证产物推上 GitHub，触发 run `43238375397` success（4 格全绿）⇒ `total_count` 1→2，**两条 run 皆 success，仍无红跑历史**，SC-5 不破。 — 触发原因：GitHub 上的 `20e20c0` 含 CR-01 缺陷（`index.js` 包根 off-by-one，装出来 0 个技能），是「公开可安装但坏的」；推修复既消除该状态，也让修复首次获得 CI 覆盖，从而消掉原本记给 Phase 5 的唯一阻塞项。`03-03-SUMMARY` 的 `total_count==1` 仍是准确的**首跑当时**记录，不改写（它属 covered file，改写会让 verification 变 stale，且会混淆「当时」与「现在」）。
- [Phase 04]: 演练场钉死恰 20 字符并在 --uninstall 之前同轮断言 GSD 1.16.0（路由 A，不做运行中公式推导）：3084/3195 是「20 字符 home × 1.16.0」这一对前提的产物，不是常量；换长度按 3084-3×(20-L) / 3195-7×(20-L) 递减的关系只写进文档给读者。
- [Phase 04]: 迁移命令块后续步骤用 export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}" 而非重新 mktemp：既守住「每块首行 export DSH_HOME=」的反误伤纪律（T-4-01），又不替换已选定的演练场，未设 home 时 fail-closed。
- [Phase 04]: README 的迁移入口紧贴 intro 段下一行、不额外插空行（Markdown blockquote 可中断段落）：这样 git diff BASE -- README.md 恰为 +2 −0，与计划硬判据一致，而渲染与语义不变。
- [Phase 04]: docs/MIGRATION.md 的文件头警告写成有条件的（「未经逐 profile 裁决，不要在真实 ~/.dsh 上跑 --uninstall」+ 指向 0-B 与步骤 1），不写无条件禁令：否则文档禁掉了自己的步骤 2，脚本用户只能去迁一个 /tmp 演练场。D-02 约束的是本仓执行，不是文档可为读者写什么（D-11）。
- [Phase 04]: §② 落位：zh 插在 §①「本机实测值」表之后、独占 --- 之前，en 追加在文件末尾；两半保持「§① → §②」同构，04-03 的 §③ 接在其后即把两半 ## 从各 2 推到各 3 — D-11 要求两半各自完整且章节同构；三节顺序由 D-10 锁定（① runbook ② 差异表 ③ 症状表），§② 必须是第 2 节
- [Phase 04]: 旧仓备料按 docs/dshmarket 先例落四文件（说明 / snippet.en 正式件 / snippet.zh 备而不用 / pr.md），中文片段首行 HTML 注释声明无落点（D-09 读法 A） — 旧仓 README 实测 CJK 0 / 315 行 / 23653 B，没有中文落点；把中英一起粘进去等于未经对方同意把它的门面改成双语。说明与资产分离是先例已立的形态
- [Phase 04]: docs/MIGRATION.md 原本无文件末尾换行：追加 §② 后 git 记 1 行删除（末行原样重发射），零内容删除由 361/361 按序保留 + 该行逐字相同证明；§② 末尾也保持无 EOF 换行以免扩大位移面 — 计划判据写「纯追加（无 - 行）」，物理上无法在无 EOF 换行的末行之后追加而不动该行标记；选择如实记录并取证，而不是把判据改写成绿
- [Phase 04]: 04-04 版本漂移如实记账：人审批准并钉住 dsh-deja@0.24.0 / dshmarket@1.73.15，而复核时 registry 的 dist-tags.latest 已是 0.24.2 / 1.73.19 — 「too-new」这条 SUS 依据相对 latest 已部分过时；证据册与 SUMMARY 都写明，不把 04-RESEARCH 的快照当当前值。
- [Phase 04]: 04-04 并存判据 = 四条集合判据的合取（stderr 0 字节 / 同一 home 的 H1>H0 且逐 bundle 标签出现 / 四个期望 id 各恰 1 / uniq -d 为空），exit code 与「装上了没报错」一律不作判据 — 同名 row id 是静默双行（add exit 0、零 warning）；实测 bundles=5 而 headers=27，T-4-17 的伪不变量再次自证。
- [Phase 04]: 04-04 步骤 6 用 ### 追加在两半（步骤 5 之后、回退之前），不新增 ## — 两半的 ## 仍各 3，⑭ 零改动即继续挡「只写一半」；docs/MIGRATION.md 本次 --numstat = 118 0（插入点在中段，末行未动，故无 EOF 位移）。
- [Phase 04]: 04-05 GAP-1 走路线①：步骤 1 的 MIG-GATE 块补卸载前面 1 探针（skills 基线 + undecided profile），块退出码 = 裁决（0/1/2）；MIG_DECIDED_PROFILES 是逐 profile 记录，命中集必须完整覆盖，机器级 DIRTY 无豁免 — 路线②把 D-03 的第二触发条件交回人脑，而缺的恰是能提前中止无条件 rm -rf 的信息；演练场 skills 必然非空，所以判据落在 profile 是否仍只靠 home 级技能
- [Phase 04]: 04-05 GAP-2：步骤 6 拆静态 / COEXIST-DRILL / COEXIST-REAL 三段；真实迁移形态零安装、判 listed ⇔ labeled（期望集来自 profile 自己的 dsh.profile.bundles），增量口径统一为「本次新装 bundle 数」（演练 +3 / 步骤 5 +1），真实迁移不比较增量 — 增量恒等于新装 bundle 数，真实迁移新装数为 0 ⇒ H1>H0 在健康 home 上必假，反向还会以无关理由误绿（DRILL-3 的 27 = 24 + 3）
- [Phase 04]: 04-05 块首契约改写：带标记块 = 标记行 → 紧接 export DSH_HOME= 与回显；无标记块首行即 export；由门逐块断言（三类标记 # MIG-GATE / # COEXIST-DRILL / # COEXIST-REAL） — 旧句「每个可粘贴块的第一行都是 export」在有标记块之后为假，保留它会让文档自相矛盾
- [Phase 05]: INST-01 空入参边按实测改写（Rule 1）：`dsh plugin --profile <absent> add` 在 dsh 0.2.2-rc.1 上 exit 0 并初始化 profile（`dsh plugin --help` 原文 "initialized on first use"），与 05-RESEARCH.md:91 相反；判据改为「不存在第三种状态」——要么干净失败且不留 profile，要么明确宣称初始化并真的装出 gsd row。
- [Phase 05]: INST-05 判据改为对声明的 `!!js` 表达式求值（Rule 1）：`--dump-config` 明确不 evaluate `!!js`（本机实测 dump 里 21 处 `!!js` 原样保留），故按加载器语义以 baseUrl=profile 目录求值，断言结果是含 node_modules/dsh-gsd 的绝对路径且文件在盘。
- [Phase 05]: UAT-03 用两个同前缀、不同值的哨兵（Rule 1）：一个哨兵无法同时满足「不出现在记录里」（.env 未进上下文）与「出现在记录里」（.txt 读成功），两条断言互斥；两哨兵保留原意且互不矛盾。
- [Phase 05]: 引擎路径断言 = 「包内路径段 ∧ 引擎名」（Rule 1）：「node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs」连续串是否出现取决于模型命令写法（实测一次 15 次、一次 0 次，后者用 GSDROOT 变量），连续串断言会随机红绿。
- [Phase 05]: 判据环境显式钉 /tmp（Rule 3）：macOS 的 os.tmpdir() 是 /var/folders/…，与 D-01/计划硬判据要求的 /tmp/dsh-uat-* 不符，故 UAT_TMP=/tmp 显式传入 mkdtemp。
- [Phase 05]: UAT-04 的 commit 三段对照跑在 mkdtemp 的 scratch cwd 上，绝不改本仓配置（`gsd-validate-commit.sh` 用 `require('./.planning/config.json')` 读当前目录；本仓一旦 opt-in，此后每次 commit 都要过校验）；「本仓未 opt-in」写成一条断言而不是注释。 — 一个恒拦的 hook 也会「通过」两向对照，所以必须有 (b) 规范消息放行与 (c) 未 opt-in 放行两段；而「本仓未 opt-in」若不落成断言，改坏配置时没有任何东西会红。
- [Phase 05]: injection 半边只断言 exit 0 + `INJECTION-PATTERN` finding + 无 `decision`，并复用 05-01 的 wrapper 分发路径。 — 该 hook 是 PostToolUse advisory，只有 `security.injection_blocking=true` 时才拦 HIGH；断言「被拦」会按设计制造一条红，断言「无输出」则连扫描器有没有跑都证明不了。
- [Phase 05]: UAT-05 的「两份 tarball 只有版本串不同」是 **JSON 语义**陈述，不是字节陈述：npm 在 `pack` 时重排 `package.json` 的缩进，三段证明 = 成员清单逐行相同 + 除该文件外逐成员字节相同 + 该文件去掉 version 后深度相等。 — 照字面写成字节等值会是一条恒红的判据；限定已逐字写进 05-UAT-EVIDENCE 判据段 5 与 05-UAT.md 的 UAT-05 行。
- [Phase 05]: D-10-5 走 canonical 覆盖件 + post-staging `cp`（在 ⑥ 改写 pass 之前、**不**递增 `counters.copied`），并把 `SKIP_DIRS` 成员行计数限定在 Set 字面量内（文件头注释点名同一 token 属散文，不计入）。 — 直接改 `gsd-core/bin/lib/ui-frontend-evidence.cjs` 会在下次 `node build.mjs` 时消失（而 prepack 每次发布都 build）；加一 `counters.copied` 会打红 `copied 76 trees`；按全文计数会把注释判成「成员写重」。
- [Phase 05]: 放行与发布两段制被实际执行：第一次 registry 读 11:57:59Z 晚于 published 回执 11:18:35Z；publish 回执后约 7 分钟内版本不可读（11:10–11:11Z 只有 0.0.0-stage、该版本 404），窗口内的 404 不是红，D-05 未触发
- [Phase 05]: registry 通道「装上了」不靠 pnpm 计数器（它打 downloaded 0），靠「装出的 958 个文件与 registry 上那份 tarball 逐文件 sha256 相同」（判据段 11）
- [Phase 05]: dshmarket 走 gh api 退化路径（首选 clone 两次被网络层拒：Empty reply / HTTP2 framing layer），逐字节一致由「从 fork 下载回来再 cmp」证明；四检 ①②③ 已确认，④ 由目标仓 PR check 决定（D-09 合并不等）
- [Phase 05]: D-08 的 delete_repo scope 收窄未执行（需交互式浏览器 re-auth），gh auth status 原样清单记入判据段 11；npm deprecate dsh-gsd@0.0.0-stage 也未执行（需 OTP），两项均交回给人
- [Phase 05]: 旧仓推送的授权范围被严格守住：只把 docs/oldrepo-link/snippet.en.md 推进 pfmiles/install-gsd-dsh 的 README.md（snippet.zh.md 与 pr.md 不推）；插入用章节锚点（--- 之后、## Quick start 之前），比较对象是 snippet 的 691 B 精确切片且取的是远端字节（gh api contents?ref=<sha> 解码），不是本地 clone 的文件
- [Phase 05]: 不可逆动作前的秩序是硬前提：三道提交闸同形态（git status --porcelain 为空 + git diff --quiet HEAD -- <f> + <f> 在 git log --format= --name-only -- <f> 里 ≥1 次），从不使用 git log -1 —— 只提交证据册的批次不会把已提交的锚点判红
- [Phase 05]: gsd-p3-release 迁移后 0 个 gsd-* 技能（CR-01 修复前的 index.js + home 级旧源已归零）保持未修：它不在人类授权的范围内，只记录不修，交人裁决；version 串 1.20.1-1.dsh022 完全区分不出这件事（与 T-5-18 同一陷阱）

## Session

**Last session:** 2026-11-26T06:58:56.551Z
**Stopped at:** Phase 05 complete — all phases complete
**Resume file:** None
