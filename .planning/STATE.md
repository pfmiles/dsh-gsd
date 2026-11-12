---
gsd_state_version: "1.0"
current_phase: 03
current_phase_name: 发布（GitHub + npm + dshmarket）
current_plan: 3
status: verifying
stopped_at: Completed 03-03-PLAN.md
last_updated: "2026-11-12T12:40:00.000Z"
last_activity: 2026-11-12
last_activity_desc: Phase 03 plan 03 executed (first push + CI first run green)
state_head: 20e20c0283f764864474b7d6a2dfd48f22a0c6b9
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 9
  completed_plans: 9
  percent: 40
---

# STATE: dsh-gsd

## Current Position

Phase: 03 (发布（GitHub + npm + dshmarket）) — EXECUTING
Plan: 3 of 3 — COMPLETE
Current Plan: 3
Total Plans in Phase: 3
Status: Phase complete — ready for verification
Last activity: 2026-11-12 — 03-03 executed（首次 push + CI 首跑绿）

Progress: [████████████████████] 9/9 plans ([████░░░░░░] 40%) — 2/5 phases (40%)

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

## Session

**Last session:** 2026-11-12T12:40:00.000Z
**Stopped at:** Completed 03-03-PLAN.md
**Resume file:** None
