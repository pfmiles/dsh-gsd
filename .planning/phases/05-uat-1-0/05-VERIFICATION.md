---
phase: 05-uat-1-0
verified: 2026-11-26T07:59:11Z
status: human_needed
score: 43/44 must-haves verified
covered_files: [".github/workflows/compat-matrix.yml",".planning/phases/05-uat-1-0/05-01-PLAN.md",".planning/phases/05-uat-1-0/05-01-SUMMARY.md",".planning/phases/05-uat-1-0/05-02-PLAN.md",".planning/phases/05-uat-1-0/05-02-SUMMARY.md",".planning/phases/05-uat-1-0/05-03-PLAN.md",".planning/phases/05-uat-1-0/05-03-SUMMARY.md",".planning/phases/05-uat-1-0/05-04-PLAN.md",".planning/phases/05-uat-1-0/05-04-SUMMARY.md","BUILD.md","CHANGELOG.md","README.md","build.mjs","build/assets/ui-frontend-evidence.cjs","package.json","tests/build-smoke.test.mjs","tests/docs-consistency.test.mjs","tests/fixtures/injection-sample.md","tests/uat-harness.test.mjs"]
covered_digest: "v4:sha256:c8838be1b7134b5f1019402cb40637ec7bebefd5e7042f751562526b694fa4d6"
behavior_unverified: 1
behavior_unverified_items:
  - truth: "ROADMAP SC-3 / UAT-06：技能 watch 行为（长驻进程热重载）已有可复核记录"
    test: "在非 3091 端口的 scratch `web` profile 里改一个 SKILL.md，观测长驻进程何时看见它（05-RESEARCH §Q5 method 2）"
    expected: "一次「我改了 X，新会话在 T+n 看到它」的读数；无此读数时 README 与 05-UAT.md 必须写 `not measured` 并给出结构性理由"
    why_human: "一次性会话每次都是新进程、启动时重读技能目录，watcher 对它结构上不适用；watcher 只在长驻 `web` 进程里可观察，而数 fsevents 需要 root。本趟无法构造该观测，也不得用「启动时读取」冒充 watch"
overrides_applied: 0
open_findings:
  - id: G-1 / WR-01
    severity: warning
    status: open
    title: "①② 的 skip 门比用例实际需要宽 —— 凭据 / zstd / tarball 与两条 hook 用例无关，而它们因此在 npm test 与 CI 里永不执行"
    evidence: "本趟默认全量 `ℹ skipped 7`（①② 的 skip 理由逐字含 `DEEPSEEK_API_KEY is not in the process env`）；同一树上强制开关后 ①② `2/2 pass`；`tests/uat-harness.test.mjs:79-92` 为共用门，`:750-754`/`:841-845` 为调用点"
  - id: WR-02
    severity: warning
    status: open
    title: "`BUILD.md:110-111` 仍把 prepack / test 写成没有 `--test-concurrency=1` 的形态，与 `package.json` 矛盾，且 ⑮ 按设计不覆盖文档"
    evidence: "`sed -n '110,111p' BUILD.md` 与 `node -e 'require(\"./package.json\").scripts'` 逐字对照；05-REVIEW.md WR-02"
  - id: IN-01
    severity: info
    status: open
    title: "⑯ 数的是源码 `^test(` 行数而非 runner 注册数（`test.skip(` / `test.todo(` / 嵌套注册会让计数静默变旧而 ⑯ 仍绿）"
    evidence: "`tests/docs-consistency.test.mjs:524` 的 `match(/^test\\(/gm)`；本仓当前 `test.skip(`/`describe(` 用量为 0"
  - id: IN-02
    severity: info
    status: open
    title: "`DSH_UAT_TGZ` 指向不存在的路径时 skip 理由说「unset」，并报告一个从未被查询过的目录"
    evidence: "`tests/uat-harness.test.mjs:90` 与 `:94-105`；05-REVIEW.md IN-02 的复现实测"
residuals:
  - id: R-5-01
    fact: "4 个 `/tmp/dsh-uat-*` 残留（手工 registry 通道复验与迁移备份，非 harness 的 finally 路径）；无凭据材料"
    impact: "不构成泄露；未清理"
  - id: R-5-04
    fact: "发布门 ≠ UAT 门：live 7/7 于 2026-11-16T07:16Z 在当时候选树上跑，11-25 发布前 package.json 改过元数据字段；发布后只对 registry 装出的字节复验了 UAT-01 的会话谓词"
    impact: "UAT-02..06 未对最终发布树重跑（无行为代码差异，但严格意义上未重锚）"
  - id: R-5-06
    fact: "`gsd-p3-release` 迁移后 0 个 `gsd-*` 技能来源（index.js 为 CR-01 修复前形态，`skillsDir` 指向不存在的 `<profile>/node_modules/skills`）"
    impact: "范围外，未修；该 profile 的 hook 是否仍生效未验证"
  - id: R-5-07
    fact: "`gh` token 的 `delete_repo` scope 仍在（D-08 未执行；`gh auth status` 本趟复读仍含该 scope）"
    impact: "继承的 accepted risk 的收窄动作未完成"
  - id: R-5-08
    fact: "`dsh-gsd@0.0.0-stage` 未被 deprecate（本趟 `npm view … deprecated` 为空）"
    impact: "不占 latest、不影响安装；会出现在版本列表"
  - id: OPEN-3
    fact: "registry 通道上的升级/回滚语义未测（registry 上只有一个公开版本可作两端）"
    impact: "UAT-05 只证「换版本号这条命令的机制」，不是 registry 升级历史"
  - id: OPEN-4
    fact: "codegraph 同层合成（真装三 bundle 的 `COEXIST-DRILL`）在真实 home 上仍无证据"
    impact: "D-10-2 只到行级 id 不相交 + `COEXIST-REAL`，不证解析级/挂载级合成"
human_verification:
  - test: "决定 UAT-06 的 watch 半边：跑 05-RESEARCH §Q5 的 method 2（scratch `web` profile 改 SKILL.md，记录长驻进程看见它的时刻），或显式接受 `not measured`"
    expected: "要么有一条带时间戳的 watch 读数并回写 README/05-UAT.md，要么把 REQUIREMENTS.md 的 UAT-06 处置（接受现状并写明理由）"
    why_human: "结构性不可测：需要长驻 web 进程与 root 才能观测 fsevents；且「270 ms 插件成本是否可接受」属人的判断"
  - test: "决定并实施 G-1 / WR-01 的修法：把 `missingPrereqs()` 拆成 `hookPrereqs()`（仅 `DSH_UAT_LIVE=1` + 已构建 `hooks/`）与 `livePrereqs()`，①② 只用前者"
    expected: "`npm test` / `prepack` / CI 的默认回路里出现 ①② 的两条判定（`pass` 而非 `skip`），且 ③④⑤⑥⑦ 仍按 live 开关 skip"
    why_human: "这是可自动化的代码改动，但不在本轮 verifier 的授权面（不得改 tests/）；需要人决定是否在本 phase 收口或记入下一轮"
  - test: "决定是否把 UAT-02..06 重锚到最终发布提交（R-5-04）：在 `a0529ac` 上跑一次 `DSH_UAT_LIVE=1` 的 live 段"
    expected: "live 7/7 的读数与发布提交绑定；否则保留「UAT 在候选树上绿、发布树只复验 UAT-01」的诚实表述"
    why_human: "需要真实 `DEEPSEEK_API_KEY`、真实 `dsh` 会话与已打好的 tarball；本趟无凭据面授权"
  - test: "处置 `gsd-p3-release`（R-5-06）：`dsh plugin --profile gsd-p3-release add \"dsh-gsd@1.20.1-1.dsh022\" --registry=https://registry.npmjs.org/`，并用 stub-ctx 探针确认 provider 行指向插件"
    expected: "该 profile 由插件提供 72 个技能；否则明确接受它 0 技能"
    why_human: "重新配置一个不在本轮 in-scope 集（`web` + `headless`）里的 profile，属人对范围的裁决"
  - test: "收窄 GitHub token 权限（D-08 / R-5-07）：`gh auth refresh --remove-scopes delete_repo`"
    expected: "`gh auth status` 的 scopes 不再含 `delete_repo`"
    why_human: "需要交互式浏览器 re-auth，agent 无法完成"
  - test: "处置 `dsh-gsd@0.0.0-stage`（R-5-08）：`npm deprecate dsh-gsd@0.0.0-stage \"<reason>\" --registry https://registry.npmjs.org/`（不 unpublish）"
    expected: "该版本带 deprecate 说明，`dist-tags.latest` 仍是 `1.20.1-1.dsh022`"
    why_human: "需要 OTP"
  - test: "决定 registry 通道的升级/回滚语义（OPEN-3）与 codegraph 同层合成（OPEN-4）是否必须在本 milestone 内补证"
    expected: "补证则给出可重放的读数；不补证则写入已知限制并进入下一 milestone 的 backlog"
    why_human: "前者需要第二个已发布版本；后者需要真实 home 上真装三个 bundle 的演练（破坏性），均非本轮可执行"
---

# Phase 5: 端到端 UAT 与 1.0 收官 Verification Report

**Phase Goal:** 干净机器全量验收，发布 1.0。
**Verified:** 2026-11-26T07:59:11Z
**Status:** human_needed
**Re-verification:** No — initial verification
**Score:** 43/44 must-haves verified（1 present, behavior-unverified）

## Verdict rationale

本 phase 的实质交付**已经在盘上、在 registry 上、在远端仓库上**：干净 `/tmp` home 的会话判据有 live 记录，hooks 的两条判据本趟实跑通过，`dsh-gsd@1.20.1-1.dsh022` 是权威 registry 的 `latest`，GitHub Release 的 `tag` 解引用等于发布所用提交，dshmarket 的 PR 已合并且四检终态为 `success`，真实 `~/.dsh` 的旧源为零、`web`/`headless` 各装 1 个插件并提供 72 个技能，旧仓互链在远端 sha 上与 `snippet.en.md` 逐字节相同。**没有一条 must-have truth 被判 FAILED。**

但本 phase **不能判 `passed`**，因为它自己的账本里仍有三类未闭合项，且都不是「已被后续 phase 承接」：

1. **UAT-06 的 watch 半边 `not measured`**（`05-UAT.md` 行、`README.md:81`/`:170` 双语）：`REQUIREMENTS.md:63` 的 UAT-06 **仍未勾选**。`not measured` 是本 phase 的合同允许的诚实形态（05-02 的 must-have 明写），但它是**人的决定**，不是机器可判的完成态。
2. **G-1 / WR-01（真实缺口）**：`tests/uat-harness.test.mjs` 的 ① ② 两条 hook 回归断言**不需要**凭据 / `zstd` / tarball，却被共用的 live 门一起挡掉 ⇒ `npm test`、`prepack`、CI 的默认回路里**永不执行**。本趟复现：默认全量 `ℹ skipped 7`，强制开关后 ①② `2/2 pass`。这是「可自动化却不在逐提交回路」的覆盖面缺口，与 phase 4 的 G-1/G-2/G-3 同类，**未修**。
3. **R-5-04（记录口径）**：live 7/7 跑在 2026-11-16 的候选树上；11-25 发布前 `package.json` 改过元数据字段，发布后只对 registry 装出的字节复验了 UAT-01 的会话谓词 ⇒ UAT-02..06 未对**最终发布树**重跑。

此外 4 条 code-review finding（WR-01、WR-02、IN-01、IN-02）的 disposition 全是 `open`（`05-REVIEW-DISPOSITION.md`），以及 5 条明确的残余（R-5-01/04/06/07/08）与 2 条 open item（registry 升级语义、codegraph 同层合成）。按「open finding 不得被静默记为已满足」的口径，这些全部在下面逐条入账，**没有一条被算进 43/44**；唯一被排除出分母的是 SC-3（watch 半边）。

> 本趟**亲自重跑**的：默认全量套件、①② 两条 hook 用例、第二次连续构建、registry 读、Release 读、dshmarket PR 读、旧仓远端 sha 与片段逐字节比对、真实 `~/.dsh` 的只读探针、`gh auth status`。
> **只依赖记录、无法重跑**的：live 用例 ③④⑤⑥⑦（需真实凭据与真实 `dsh` 会话）、`npm publish` / 推送 / 迁移的写段（不可逆）、`COEXIST-REAL`（需在真实 home 上 `--dump-config`，计划明令禁止）、npm 12 的 prerelease tag guard 机制本身。每一条都在证据列里标了「记录」。

## Goal Achievement

### ROADMAP Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UAT-01..05 全绿（干净 `DSH_HOME` 安装、skills、健康、拦截、scaffold、升级回滚） | ✓ VERIFIED | live 7/7 记录（判据段 1/2/3/5/8，2026-11-16T07:16:23Z）；本趟强制开关实跑 ①② `2/2 pass`；registry 通道 UAT-01 谓词记录（判据段 11，含 `hook/invoked`）。留 G-1（①② 不进默认回路）与 R-5-04（发布树未重跑）两条口径 |
| 2 | hooks 回归（commit 校验拦截错误格式、injection 扫描落日志） | ✓ VERIFIED | 本趟实跑：`① … opt-in+nonconforming=exit 2/block:CONVENTIONAL_COMMITS_VIOLATION \| opt-in+conforming=exit 0/no-block \| no-opt-in+nonconforming=exit 0/no-block \| repo hooks.community=absent`；`② injection: severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)`；`ℹ tests 2 / pass 2` |
| 3 | 启动开销数字与技能 watch 行为记录入 README | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | 开销数字在场且双语（`README.md:68-81` / `:157-170`：9 ms / 279 ms / ≈270 ms，与 `05-UAT.md` UAT-06 行逐字一致）；**watch 行为无记录**：两处均写 `not measured` + 结构性理由，`REQUIREMENTS.md:63` 的 UAT-06 仍未勾选 |
| 4 | 1.0 发布 + UAT 报告 | ✓ VERIFIED | `npm view … --registry https://registry.npmjs.org/` → `dist-tags.latest = 1.20.1-1.dsh022`（本趟实测）；`05-UAT.md`（19 个 ID 的判据↔证据↔结论表）与 `05-UAT-EVIDENCE.md`（判据段 1–14）在仓 |
| 5 | 对外动作执行：npm publish（registry 通道复验）+ GitHub Release + dshmarket PR | ✓ VERIFIED | registry：`latest=1.20.1-1.dsh022`、`versions=["0.0.0-stage","1.20.1-1.dsh022"]`（本趟）；Release：`gh release view` → `tagName=1.20.1-1.dsh022, isPrerelease=false, targetCommitish=a0529acf…`（本趟）；PR：`gh pr view 18793` → `state=MERGED, changedFiles=1, +6/−0`，`check` 与 `Submission gate` 均 `SUCCESS`（本趟），文件 sha256 `3a69a74a…` 与 `docs/dshmarket/pfmiles__dsh-gsd.yml` 相同 |
| 6 | （D-10-1）`--test-concurrency=1` 三处齐备，且有一条计数断言守着它 | ✓ VERIFIED | `package.json` 的 `prepack`/`test` 与 `compat-matrix.yml:56` 各 1 处（本趟读盘）；⑮ 在默认回路里绿（`ℹ tests 47 / pass 40`）；删 flag 副本的变异实验 FAIL（判据段 1） |
| 7 | （D-10-2）G-4 闭合：四源 row id 两两不相交（`MISSING:` 判红）且 `COEXIST-REAL` 通过 | ✓ VERIFIED | 本趟独立读 `web` 四源 patch：`[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`，两两不相交；`MISSING:` 0 行与 `COEXIST-REAL PASS`（五条合取）为记录（判据段 14 §10.1/§10.2）—— 该块需在真实 home 上跑 `--dump-config`，计划明令禁止当只读探针 |
| 8 | （D-10-3）真实 `~/.dsh` 迁移完成：旧源为零、两 profile 插件 row 各恰 1、包内 72 技能与两项字节数对齐 | ✓ VERIFIED | 本趟只读复读：`~/.dsh/skills/gsd-*` = **0**；`gsd-core`/`hooks`/`scripts`/`gsd-hooks.dsh.json*` 全 absent；`web`/`headless` 的 `node_modules/dsh-gsd` = **1.20.1-1.dsh022**、`skills/gsd-*` = **72**、`gsd-health/SKILL.md` = **3587 B**、`gsd-new-project/SKILL.md` = **3856 B**；两 profile 的 `dsh.profile.bundles` 各含 `dsh-gsd` **1** 次，插件 `cordis.patch.yml` 的 `id: gsd` / `id: gsd-hooks-bridge` 各 **1** 行；`.stripped-bak` **2** 份保留 |
| 9 | （D-10-4）旧仓 `pfmiles/install-gsd-dsh` 互链已推送：远端 main 前进且插入正文与 `snippet.en.md` 逐字节一致 | ✓ VERIFIED | 本趟：`gh api …/commits/main` → `3af3f27f5893fbf66950551fba8ddfc9427f1106`（前进于 `41fcc7a`）；远端 README（24346 B，CJK 0）里 691 B 的 `snippet.en.md` 是**连续子串**（offset 2222），其后紧跟 `\n\n## Quick start`；`snippet.zh.md` 未推 |
| 10 | （D-10-5）构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，连跑两次 `node build.mjs` 仍成立 | ✓ VERIFIED | 本趟两次连续构建（套件内的真实构建 + 单独 `tests/build-smoke.test.mjs`）：构建后 `gsd-core/bin/lib/ui-frontend-evidence.cjs` 与 `build/assets/ui-frontend-evidence.cjs` **逐字节相同**（14223 B）；`SKIP_DIRS` Set 成员行含 `.gsd-build-tmp` **恰 1**；⑨ 组 `✔` |

### Plan must-haves — 05-01（安装面 / 会话面 / D-10-1）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 零残留 `/tmp` 新 home 上 `plugin add` 后，**新开会话**的会话记录含 `assistant/message` 且任何 `turn/end` 递归无 `kind:error`；「有 session 目录」不作判据 | ✓ VERIFIED | 谓词实现于 `JSON.parse` 之后（`tests/uat-harness.test.mjs:169-196`）；live PASS 记录（判据段 1）；失败轮同样建目录的告诫写在文件头与失败消息里。本趟未重跑（无凭据） |
| 2 | 安装前 home 零 GSD 残留且被断言；安装后 home 级 `skills/` 仍不存在（技能只可能来自插件）；本机 profile 不作判据环境 | ✓ VERIFIED | `residue()`/`homeTree()` 实现 + 判据段 1 逐项读数；本趟复核真实 home 的旧源已归零，但判据环境仍是 `/tmp`（D-01） |
| 3 | INST-01：`add` 后 profile patch 仍 `[]`、无禁用条目；空入参边成立 | ✓ VERIFIED（口径已订正） | `cordis.patch.yml` 正文 `[]`、`disabled:` 真值 0（判据段 1）；空入参边：计划原文「不存在 profile 时非零退出」被实测**证伪**（dsh 0.2.2-rc.1 是 `exit 0` + 初始化 profile），harness 改为断言「不存在第三种状态」（`tests/uat-harness.test.mjs:264-293`）。⚠ `05-01-PLAN.md:39` 仍保留旧措辞 |
| 4 | INST-03/05：`add` 后不重启即 `--dump-config` 两 row 各 1；`configPath` 是包内绝对路径；未安装时两行都不在 | ✓ VERIFIED（INST-05 口径已订正） | 判据段 2：dump 404 行、`gsd` 1 / `gsd-hooks-bridge` 1、stderr 0 B；`!!js` 按加载器语义求值为 `…/profiles/probe6/node_modules/dsh-gsd/config/gsd-hooks.json` 且存在。计划原文「dump 里直接出现绝对路径」恒红（实测 dump 不求值 `!!js`，VALIDATION C-12），harness 改为求值形态（更强）。⚠ `05-01-PLAN.md:40` 仍保留旧措辞 |
| 5 | INST-04：`remove` 后归零（删前在场）+ 幂等边 + 空操作边 | ✓ VERIFIED | 判据段 2：删前两 row 各 1 且在盘 → 删后 0；再 `remove` exit 1、manifest 逐字节不变、stdout 空；未装过的 profile `remove` exit 1 且无副作用 |
| 6 | INST-02：装前/装后 `DSH_HOME` 受管面哈希差集只落在 `profiles/<p>/` | ✓ VERIFIED | 判据段 2：home 树 digest `b072887…` 装前装后不变，差集 `{added:[],removed:[]}`，五类受管面全 `ABSENT` |
| 7 | UAT-02/03：真实会话 scaffold 出 `PROJECT/ROADMAP/STATE`；引擎经包内绝对路径；`.env` 被硬拦且哨兵不入记录，`.txt` 阳性对照哨兵入记录 | ✓ VERIFIED | 判据段 3：`.planning/` 5 文件；`hook/result` `decision=block`、`exitCode=2`、guard 指名 `secret-read`；`.env` 哨兵 0 次 / `.txt` 哨兵 12 次；live 用例 ⑤ 127 s 通过（记录） |
| 8 | D-10-1：三处齐备且 ⑮ 是逐处计数扫描（不是「套件绿所以 flag 在」） | ✓ VERIFIED | 本趟：三处读盘 + ⑮ 绿 + 变异实验 FAIL（判据段 1）；`tests/docs-consistency.test.mjs:432-486` |

### Plan must-haves — 05-02（hooks / 版本 / 开销 / 构建补丁 / 回归）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UAT-04 commit 半边三段对照：(a) opt-in+非规范 → exit 2 + `decision: block` + `CONVENTIONAL_COMMITS_VIOLATION`；(b) opt-in+规范 → exit 0 无 block；(c) 未 opt-in+非规范 → exit 0；三段 stderr 均不含 fail-open 文案 | ✓ VERIFIED | 本趟实跑 ①：三段读数逐字命中（见 SC-2），stderr 无 `validator disabled` |
| 2 | UAT-04 injection 半边只落日志：exit 0 + `INJECTION-PATTERN` finding + 无 block | ✓ VERIFIED | 本趟实跑 ②：`severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)` |
| 3 | 第四条事实：本仓 `.planning/config.json` 无 `hooks.community`，commit 校验默认不生效；该事实本身是一条断言 | ✓ VERIFIED | 本趟读 `.planning/config.json`：`hooks` 只有 `context_warnings`；① 打印 `repo hooks.community=absent` |
| 4 | UAT-05：同一条 `plugin add` 换版本（`.dsh022→.dsh021→.dsh022`），version 随之变、两 row 各 1、会话谓词成立；两份 tarball 只有版本串不同，证机制非 registry 历史 | ✓ VERIFIED | 判据段 5（三段 swap + 回滚后会话）；`05-UAT.md` UAT-05 行逐字含「从未也永不发布」与「证的是换版本号这条命令的机制」 |
| 5 | UAT-06 三个点用**事件时间戳**（`turn/start.time − session.createdAt`），墙钟不作数字 | ✓ VERIFIED | 判据段 8 六轮实测表：9 ms / 279 ms / ≈270 ms（n=3、单机、暖缓存）；墙钟并列记录并显式声明不可用 |
| 6 | UAT-06 watch 半边两种状态必须分清；无人跑 method 2 时 `05-UAT.md` 与 `README.md` 必须写 `not measured` + 结构性理由 | ✓ VERIFIED | `05-UAT.md` 的技能 watch 行 = `not measured`；`README.md:81`/`:170` 双语同写；构造性理由（一次性会话新进程、watcher 只在长驻 web、fsevents 需 root）齐备 |
| 7 | D-10-5：构建后的 `SKIP_DIRS` 含 `.gsd-build-tmp`，与 canonical **逐字节相同**，连跑两次构建仍成立 | ✓ VERIFIED | 本趟两次构建后 `cmp` IDENTICAL、Set 成员行 1、`whole-file mentions 4`；⑨ 组断言存在性 + 字节等值 + 成员行恰 1（`tests/build-smoke.test.mjs:151-205`） |
| 8 | INST-06 是回归：`pack-contents` 与 `docs-consistency` 仍全绿，证据册记实数与 UTC 而非「已通过」 | ✓ VERIFIED | 本趟全量：`pack-contents 4/4` + `docs-consistency 16/16` 全绿；判据段 7 记 `20/20` @2026-11-16T07:16:30Z |

### Plan must-haves — 05-03（发布态 / 对外动作）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | manifest 的发布态是四处同一次提交：`private` 整键删除、`publishConfig={registry,tag}`、⑥ 发布态哨兵、⑬ 期望值加 `tag` | ✓ VERIFIED | 本趟读 `package.json`：无 `private`、`publishConfig.tag=latest`；⑥/⑬ 在默认回路里绿（`docs-consistency` 16/16） |
| 2 | `publishConfig.tag` 不是可选项（npm 12 对 prerelease 缺显式 tag 硬拒） | ✓ VERIFIED（机制未复跑） | 声明值在盘；dry-run 打印 `Publishing to https://registry.npmjs.org/ with tag latest`（判据段 9，记录）。npm 12 的抛错路径未由本趟重放 |
| 3 | `npm publish --dry-run` 是门：打印 registry + `with tag latest`，且真的跑完 prepack | ✓ VERIFIED（记录） | 判据段 9：exit 0、prepack 跑完 build 门 + `ℹ tests 47 / pass 40`，同一次打印 `with tag latest` 与 npmjs URL |
| 4 | README 双语开销段数字与 `05-UAT.md` UAT-06 行同源逐字一致，且不破 ⑫/⑨/①② | ✓ VERIFIED | 本趟 grep：两语同为 9 / 279 / ≈270；`docs-consistency` 16/16 绿（含 ⑫ 裸名 install 串、⑨ 徽章、①② 门槛串） |
| 5 | 「当前状态 / Status」改写：(a) 点名版本、(b) 8 项 UAT 已在干净机器通过、(c) 指向 CHANGELOG、(d) 不出现 `dsh-gsd@latest` | ✓ VERIFIED | `README.md:66`（zh）/`:155`（en）：三条齐备；本趟 `grep dsh-gsd@latest` 零命中。⚠ 同句仍写「npm 首发…随后落地」，发布后已过时（文案陈迹，不破本 truth） |
| 6 | 发布前抢注复查必须是 `404` 才放行 | ✓ VERIFIED（记录） | 判据段 10 放行前证据 4：`404`，对照 `@opengsd/gsd-core` `200`。该读数如今**不可重放**（名字已归我们） |
| 7 | 推送先预演后主推，权威 sha 用 `gh api …/commits/main`；预演与 main 两次 CI 均绿 | ✓ VERIFIED | 判据段 10：两次 run `success`；本趟 `gh api …/commits/a0529ac/check-runs` → **8 条** `completion=success` |
| 8 | 发布后每次观测读权威 registry；判据 = `latest` 等于发布版本、tarball 可解析、registry 通道在**新** `/tmp` home 上重跑 UAT-01 谓词 | ✓ VERIFIED | 本趟 `npm view` 以 `--registry https://registry.npmjs.org/`（含 `--registry` 的读法）得 `latest=1.20.1-1.dsh022`、`versions` 两项；registry 通道安装与会话谓词为记录（判据段 11：`assistant/message` 1、`turn/end` 1、无 `kind:error`、含 `hook/invoked`/`hook/result`） |
| 9 | `approved` 与 `published` 严格两段；D-05 只在发布后仍红才可达；本轮 D-05 未触发 | ✓ VERIFIED（记录） | 判据段 11：回执 `2026-11-25T11:18:35.005Z`，首次 registry 读 11:57:59Z；传播窗口约 7 分钟未被判红；`.dsh022` 仍是 `latest`、未 deprecate |
| 10 | Release tag 必须 `--target PUBLISHED_SHA`（提交级背书，非字节指纹）；无 `v` 前缀、`prerelease=false`、正文取 CHANGELOG | ✓ VERIFIED | 本趟 `gh release view`：`targetCommitish=a0529acf…`、`isPrerelease=false`、`tagName=1.20.1-1.dsh022`；该提交在远端存在且 8/8 check 绿；判据段 9 已把「字节不可复现」订正为提交级口径 |
| 11 | dshmarket 完成判据 = PR 已开 + 对方仓四检通过（**不含合并**） | ✓ VERIFIED | 本趟 `gh pr view 18793`：`state=MERGED`、`changedFiles=1`、`+6/−0`、`data/plugins/pfmiles__dsh-gsd.yml`（added）；`check` 与 `Submission gate` 均 `completed/SUCCESS` ⇒ 四检终态已闭合（收官时 ④ 仍 `in_progress`，现已不是开放项） |

### Plan must-haves — 05-04（机器级收口）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | D-11：机器级收口只在 `.planning/` 产物提交之后；三道闸同形态、可重跑（`git status` 空 + `git diff --quiet HEAD` + 在 `git log --name-only` 里 ≥1 次），不用 `git log -1` | ✓ VERIFIED（记录 + 本趟复核） | 判据段 12 §10 / 13 §2 / 14 §14 三次 `commit gate: PASS`；本趟 `.continue-here.md` 在历史里出现 5 次、`git status --porcelain` 空。顺序本身不可重放 |
| 2 | 只读预检先于写动作且自身是判据；命中集被 `MIG_DECIDED_PROFILES` 完整覆盖；基线**重数**（`web` bridge = 2 而非 1） | ✓ VERIFIED（记录 + 本趟复核） | 判据段 12：`GATE` 两次跑 1→0、`GATE: PASS`；本趟：迁移后 bridge 计数 4 个 profile 全 0（与「删前 2」构成同一条判据的两端，删前读数仅存记录） |
| 3 | 3091 刷新的判据是「插件自报提供技能」：`index.js` 为 CR-01 修复后形态、两 row 各 1、provider 指向 `<plugin>/skills` | ✓ VERIFIED | 本趟读 `~/.dsh/profiles/gsdtest/node_modules/dsh-gsd/index.js:22-23` → `pluginRoot = dirname(fileURLToPath(import.meta.url))` + `join(pluginRoot,'skills')`；包内 72；provider 行记录（判据段 13 §4） |
| 4 | 真实迁移按 runbook 走完，判据全部是内容/集合/字节：`GATE: PASS` → `--uninstall` → 卸全局 CLI → registry 通道装 `web`+`headless` → 阴性对照 A–E + 内容比对同时成立 | ✓ VERIFIED | 本趟只读复核终点态（见 SC-8）；写段读数（备份 72 目录、A–E 全成立、3587/3856/72、stderr 0 B）为记录（判据段 14 §2–§9）。全局 CLI 已不在 PATH（本环境即其后果） |
| 5 | G-4：步骤 6 两段（静态四源 + CB-8b `COEXIST-REAL` 五条合取），`MISSING:` 判红；两段不可互相替代 | ✓ VERIFIED | 本趟独立读四源 row-id 集：`[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`，两两不相交；`MISSING:` 0 行与 `COEXIST-REAL PASS`（含 ② `required-absent:dsh-gsd`）为记录 —— 该块在真实 home 上跑 `--dump-config`，属计划禁令面 |
| 6 | 旧仓互链判据在**远端**：sha 前进于 `41fcc7a`，插入正文与 `snippet.en.md` 逐字节一致，`snippet.zh.md` 不推 | ✓ VERIFIED | 本趟：sha `3af3f27…`；691 B 连续子串 + 尾部 `\n\n## Quick start`；CJK 0 |
| 7 | `ROADMAP.md` 的 Phase 5 Requirements 行逐字含 19 个 ID，SC 含 D-10 五件 | ✓ VERIFIED | 本趟 `sed -n '119p' .planning/ROADMAP.md`：19 个 ID 逐字在场（无区间形态）；SC 1–10 在场，SC 6–10 即 D-10-1..5 |

**Score:** 43/44 truths verified（1 present, behavior-unverified = SC-3 的 watch 半边；0 FAILED）

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `tests/uat-harness.test.mjs` | UAT 唯一执行件，7 用例 | ✓ EXISTS + SUBSTANTIVE + WIRED | 1188 行 / 7 个顶层 `test(`；会话判据在 `JSON.parse` 之后；7 条全部注册进 `node --test`（默认 7 skip） |
| `tests/fixtures/injection-sample.md` | ② 的 payload | ✓ EXISTS + WIRED | 1202 B；被 ② 直接消费（本趟 ② 绿） |
| `tests/build-smoke.test.mjs` | ⑨ 组（D-10-5） | ✓ EXISTS + WIRED | 本趟两轮真实构建 + ⑨ 断言全绿 |
| `tests/docs-consistency.test.mjs` | ⑥ 发布态哨兵 / ⑬ `tag` / ⑮ / ⑯ | ✓ EXISTS + WIRED | 16/16 绿（本趟全量） |
| `build/assets/ui-frontend-evidence.cjs` | canonical 覆盖件 | ✓ EXISTS + SUBSTANTIVE | 14223 B；`SKIP_DIRS` 成员 `.gsd-build-tmp` 1 行；与构建产物逐字节相同 |
| `build.mjs` | post-staging 拷贝步（不递增 `counters.copied`） | ✓ EXISTS + WIRED | `:321` 在 ⑤ 之后、⑥ 之前；`copied 76 trees` 未被撞红（build-smoke 绿） |
| `package.json` | 发布态（无 `private`、`publishConfig.tag`、两处 flag） | ✓ EXISTS | 本趟读盘逐项命中 |
| `.github/workflows/compat-matrix.yml` | 全量测试 `run:` 行带 flag，不新增步骤 | ✓ EXISTS + WIRED | `:56` 单行带 flag；`run:` 行仍 4 条；`compat-matrix` 8/8 绿 |
| `README.md` | 双语「启动开销」+ 状态句 | ✓ EXISTS | 双语数字与 `05-UAT.md` 一致；`not measured` 双语在场 |
| `CHANGELOG.md` | `## [1.20.1-1.dsh022]` 条目（Release 正文来源） | ✓ EXISTS | 首条目 == `pkg.version`（⑧ 绿） |
| `BUILD.md` | `:16` 活体计数 47 | ✓ EXISTS + WIRED | ⑯ 绿；`:110-111` 有陈旧命令（WR-02，open） |
| npm `dsh-gsd@1.20.1-1.dsh022` | `latest` + tarball 可解析 | ✓ EXISTS（远端） | 本趟 `npm view` 实测 |
| GitHub Release `1.20.1-1.dsh022` | tag → `PUBLISHED_SHA`，`prerelease=false` | ✓ EXISTS（远端） | 本趟 `gh release view` 实测 |
| dshmarket PR #18793 | 单文件、逐字节、四检通过 | ✓ EXISTS（已合并） | 本趟 `gh pr view` + 内容 sha256 比对 |
| 迁移后的真实 `~/.dsh` | 旧源 0、两 profile 各 1 插件、72 技能 | ✓ EXISTS（机器） | 本趟只读探针实测 |
| `pfmiles/install-gsd-dsh` 远端提交 | `README.md` 互链 | ✓ EXISTS（远端） | 本趟 sha + 字节比对实测 |
| `05-UAT.md` / `05-UAT-EVIDENCE.md` | 判据表 + 判据段 1–14 | ✓ EXISTS + SUBSTANTIVE | 逐行可复核；本趟抽查各段读数与现盘一致 |

**Artifacts:** 16/17 verified（`BUILD.md` 存在但含一条 open 的陈旧命令，不影响其 must-have 用途）

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| live 用例 ③④⑤⑥⑦ | 真实 `dsh` 会话 / tarball | `missingPrereqs()` → `t.skip`，`DSH_UAT_LIVE=1` + 唯一 tarball | ✓ WIRED | 默认 skip 理由逐项可读；强制开关后 ①② 实跑绿；③④⑤⑥⑦ 需真实凭据（R-1） |
| ①② | `hooks/` 构建产物 | `spawnSync('node', [HOOK_WRAPPER, …])` 喂合成 payload | ✓ WIRED（但默认回路不可达） | 本趟实跑经真实 wrapper 得判定；**门过宽**（G-1） |
| `build.mjs` 拷贝步 | `gsd-core/bin/lib/ui-frontend-evidence.cjs` | ⑤ 捕获之后、⑥ rewrite 之前 `cp` | ✓ WIRED | 本趟两次构建后字节等值 + 成员行 1 |
| `publishConfig` | npm registry 写入 | `registry` + `tag` 同对象 | ✓ WIRED | 本趟 registry `latest` 为该版本 |
| `PUBLISHED_SHA` | Release tag | `gh release create --target` | ✓ WIRED | 本趟 `targetCommitish` 逐字相同 |
| 读侧 `--registry` | 权威 registry | 每条 `npm view` / 安装命令显式带 | ✓ WIRED | 本趟 `npm view` 复现 `latest` |

**Wiring:** 6/6 条连接成立；其中 ①② 的默认回路可达性为 **open finding G-1**，不计入「已满足」。

### Data-Flow Trace (Level 4)

N/A —— 本 phase 无渲染型产物（交付为判据、构建资产、manifest/文档与对外发布物）。没有需要追踪的动态数据源。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 默认全量套件（串行） | `node --test --test-concurrency=1 tests/*.test.mjs` | `ℹ tests 47 / pass 40 / fail 0 / skipped 7`（14768 ms） | ✓ PASS（与 `BUILD.md:16` 的 47 等值） |
| UAT-04 两条 hook 判据 | `DSH_UAT_LIVE=1 DEEPSEEK_API_KEY=verifier-probe-not-a-real-key node --test --test-name-pattern='UAT-04' tests/uat-harness.test.mjs` | `✔ ①`（三段对照逐字预期）+ `✔ ②`（severity HIGH / 3 findings）；`pass 2 / fail 0 / skipped 0` | ✓ PASS（证明「今天绿」，同时坐实 G-1：默认回路看不到） |
| D-10-5 二次连续构建 | `node --test tests/build-smoke.test.mjs`（第二次构建） | 真实构建 `✔`（12047 ms）；构建后 `cmp` canonical **IDENTICAL**、Set 成员 1 | ✓ PASS |
| npm 权威 registry | `npm view dsh-gsd dist-tags.latest version --registry https://registry.npmjs.org/` | `1.20.1-1.dsh022`；`versions = ["0.0.0-stage","1.20.1-1.dsh022"]` | ✓ PASS |
| GitHub Release | `gh release view 1.20.1-1.dsh022 --repo pfmiles/dsh-gsd --json …` | `isPrerelease=false, targetCommitish=a0529ac…` | ✓ PASS |
| 发布提交的 CI | `gh api repos/pfmiles/dsh-gsd/commits/a0529ac…/check-runs` | 8 条 check run 全部 `completion=success` | ✓ PASS |
| dshmarket PR | `gh pr view 18793 --repo awesome-dsh-plugin/awesome-dsh-plugin --json …` | `state=MERGED, changedFiles=1, +6/−0`；`check`/`Submission gate` = `SUCCESS` | ✓ PASS（优于收官记录：④ 已终态） |
| PR 文件逐字节 | `gh api …/contents/data/plugins/pfmiles__dsh-gsd.yml` → base64 解码 → `cmp` | sha256 两侧 `3a69a74a…`；`IDENTICAL` | ✓ PASS |
| 旧仓互链 | `gh api repos/pfmiles/install-gsd-dsh/commits/main` + `contents/README.md?ref=3af3f27…` | sha `3af3f27…`；snippet 691 B 连续子串 @2222，尾部 `\n\n## Quick start`；CJK 0 | ✓ PASS |
| 真实 `~/.dsh` 旧源 | `ls -d ~/.dsh/skills/gsd-*`；`[ -d ~/.dsh/{gsd-core,hooks,scripts} ]`；`ls ~/.dsh/gsd-hooks.dsh.json*` | `gsd-*` = 0；三项 absent；`gsd-hooks.dsh.json*` 无输出；4 profile 的 bridge 计数均 0 | ✓ PASS |
| 真实 home 两 profile | 读 `profiles/{web,headless}` 的插件 `package.json` / `skills/` / `bundles` / bundle patch | 均 `1.20.1-1.dsh022`、72 skills、3587 / 3856 B、bundles 含 `dsh-gsd` 1 次、patch 两 id 各 1 行、`.stripped-bak` 2 份 | ✓ PASS |
| 生成物（hooks 未被绕过） | `①` 的 wrapper 判定 + `②` 的 advisory 判定 | 见上 | ✓ PASS |

### Probe Execution

N/A —— 本仓没有提交 `scripts/*/tests/probe-*.sh` 形态的探针（`scripts/` 是构建产物、不入 git）；本 phase 声明的一次性门（⑮ 变异实验、D-10-5 补丁门、三道 commit gate）都以命令 + 逐字输出记录在 `05-UAT-EVIDENCE.md` 判据段 1/6/12/13/14 中，本趟对其**产物**做了独立复核（见上表），但没有重跑那些一次性脚本。

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UAT-01 | 05-01, 05-03 | 干净 `DSH_HOME` 完成 INST-01 并重启 | ✓ SATISFIED | tarball 通道 live（判据段 1）+ registry 通道谓词（判据段 11，含 `hook/invoked`）；`REQUIREMENTS.md:58` `[x]` |
| UAT-02 | 05-01 | `/gsd-health` 成功；`/gsd-new-project --auto` scaffold `.planning/` | ✓ SATISFIED | 判据段 3：5 文件 + 引擎包内路径；`[x]` |
| UAT-03 | 05-01 | 真实会话 read `.env` 被拦 | ✓ SATISFIED | 判据段 3：`decision=block` + 双哨兵；`[x]` |
| UAT-04 | 05-02 | hooks 回归抽测（commit 校验、injection 扫描） | ✓ SATISFIED（断言绿）+ ⚠️ G-1（不入默认回路） | 本趟 2/2；`[x]` |
| UAT-05 | 05-02 | 升级/回滚同命令换版本号后抽测通过 | ✓ SATISFIED（机制段） | 判据段 5；`[x]`。registry 升级语义见 OPEN-3 |
| UAT-06 | 05-02, 05-03 | 启动开销与技能 watch 的量化记录 | ? NEEDS HUMAN | 开销数字有（判据段 8 / README 双语）；**watch `not measured`**；`REQUIREMENTS.md:63` 仍 `[ ]` |
| INST-01 | 05-01 | 单命令安装，无前置脚本/手工 patch | ✓ SATISFIED | 判据段 1（`[]` patch、无禁用行、空入参边不变量） |
| INST-02 | 05-01 | 安装不写 `~/.dsh` 受管文件 | ✓ SATISFIED | 判据段 2（digest 不变、差集空） |
| INST-03 | 05-01 | 安装即注册、无重启前提 | ✓ SATISFIED | 判据段 2（404 行、两 row 各 1） |
| INST-04 | 05-01 | 卸载后 skills/hooks/bundle 行全部消失 | ✓ SATISFIED | 判据段 2（归零 + 幂等边 + 空操作边） |
| INST-05 | 05-01 | dump 见两 row，`!!js` 展开为包内绝对路径 | ✓ SATISFIED（求值形态） | 判据段 2（求值得包内路径且在盘） |
| INST-06 | 05-02 | 元数据合规 | ✓ SATISFIED | 本趟 `pack-contents` 4/4 + `docs-consistency` 16/16；判据段 7 |
| PUB-01 | 05-03 | npm 首发成功 + registry 复验 | ✓ SATISFIED | 本趟 `latest=1.20.1-1.dsh022`；判据段 10/11 |
| PUB-03 | 05-03 | dshmarket 材料与 PR 本体 | ✓ SATISFIED（较收官记录前进一步） | 本趟 PR `MERGED` + 两 check `SUCCESS` + 文件逐字节相同；材料半由 ⑪⑫ 守 |
| D-10-1 | 05-01 | `--test-concurrency=1` 三处 + 计数断言 | ✓ SATISFIED | 本趟三处读盘 + ⑮ 绿 + 变异实验 |
| D-10-2 | 05-04 | G-4 静态四源 + `COEXIST-REAL` | ✓ SATISFIED | 本趟四源集合两两不相交；`COEXIST-REAL PASS` 为记录 |
| D-10-3 | 05-04 | 真实 `~/.dsh` 迁移完成 | ✓ SATISFIED | 本趟终点态复核（旧源 0、两 profile 各 1、72 技能、3587/3856） |
| D-10-4 | 05-04 | 旧仓互链已推送且逐字节一致 | ✓ SATISFIED | 本趟远端 sha + 691 B 子串比对 |
| D-10-5 | 05-02 | 构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，经得住重建 | ✓ SATISFIED | 本趟两次构建 + 字节等值 + 成员行 1 |

**Coverage:** 18/19 satisfied；1 NEEDS HUMAN（UAT-06）。**无 ORPHANED**：`ROADMAP.md:119` 的 19 个 ID 与四份 PLAN 的 `requirements` 并集逐一对上（`05-01` 9 个、`05-02` 5 个、`05-03` 4 个、`05-04` 3 个，去重 19）。

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `tests/uat-harness.test.mjs` | 79-92, 750-754, 841-845 | ①② 共用 live 门（凭据/zstd/tarball）⇒ 默认回路永不执行 | ⚠️ Warning（G-1 / WR-01） | hook 分发面与两条规则的退化不会被任何默认回路捕获；本趟已复现 skip 与强制绿 |
| `BUILD.md` | 110-111 | 仍写无 `--test-concurrency=1` 的 prepack/test，自称「package.json 实际契约」 | ⚠️ Warning（WR-02） | 复制该行会重现已修掉的并发假红；⑮ 按设计不覆盖文档 |
| `tests/docs-consistency.test.mjs` | 524 | ⑯ 数源码 `^test(` 行数而非 runner 注册数 | ℹ️ Info（IN-01） | `test.skip(` / `test.todo(` / 嵌套注册会让 `BUILD.md:16` 静默变旧而 ⑯ 仍绿；当前用量 0 |
| `tests/uat-harness.test.mjs` | 90, 94-105 | `DSH_UAT_TGZ` 设了但不存在时报「unset」并报告未查询的目录 | ℹ️ Info（IN-02） | skip 理由把排障指向错误目录 |
| — | — | 债务标记（TBD/FIXME/XXX） | ✅ 0 | 本 phase 改动的 11 个非 `.planning` 文件零命中；无 blocker |

**Anti-patterns:** 4 found（0 blockers, 2 warnings, 2 info）—— 全部 `disposition: open`（`05-REVIEW-DISPOSITION.md`），本趟未修、也不计入已满足。

## Open Items Carried (not closed)

| # | Item | Evidence status | Consequence |
| - | ---- | --------------- | ----------- |
| 1 | UAT-06 watch 半边 `not measured` | 记录 + 本趟复核 README 双语 | `REQUIREMENTS.md:63` 未勾选；见 human item 1 |
| 2 | G-1 / WR-01（①② 不入默认回路） | 本趟实跑复现（默认 skip 7；强制 2/2 绿） | 默认回路里 UAT-04 自动化证据为零；见 human item 2 |
| 3 | R-5-04（发布树未重跑 UAT-02..06） | 发布后仅 UAT-01 谓词复验（记录） | 严格意义上的「发布树全量 UAT」未成立；见 human item 3 |
| 4 | WR-02（`BUILD.md:110-111` 陈旧命令） | 本趟读盘 | 文档与 manifest 矛盾，静默 |
| 5 | IN-01 / IN-02 | 本趟读代码 + 记录 | 守卫口径与诊断文案的窄缺口 |
| 6 | registry 通道升级/回滚语义（OPEN-3） | 只有一个公开版本 | UAT-05 只证机制；见 human item 7 |
| 7 | codegraph 同层合成（OPEN-4） | 只有行级 + `COEXIST-REAL` 证据 | 不证解析级/挂载级合成 |
| 8 | `gsd-p3-release` 0 技能（R-5-06） | 本趟读 `index.js`（CR-01 前形态） | 范围外，未修；见 human item 4 |
| 9 | `delete_repo` scope 仍在（R-5-07 / D-08） | 本趟 `gh auth status`：scopes 含 `delete_repo` | 见 human item 5 |
| 10 | `dsh-gsd@0.0.0-stage` 未 deprecate（R-5-08） | 本趟 `npm view … deprecated` 为空 | 见 human item 6 |
| 11 | 4 个 `/tmp/dsh-uat-*` 残留（R-5-01） | 本趟 `ls -d` 计 4 | 无凭据材料；未清理 |
| 12 | `README.md:66`/`:155` 的「首发…随后落地」已过时 | 本趟读盘 | 文案陈迹（不破 must-have），建议随 WR-02 一起改 |

## Human Verification Required

见 frontmatter 的 `human_verification`（7 项）。摘要：

1. **UAT-06 watch** —— 跑 method 2 或显式接受 `not measured`；这是 SC-3 唯一的未闭合半边，也是 `REQUIREMENTS.md` 唯一未勾选项。
2. **G-1 / WR-01** —— 拆分 `missingPrereqs()`，让 ①② 在默认回路里跑；本趟已备好复现证据（默认 skip / 强制绿）。
3. **R-5-04** —— 是否把 live 段重锚到最终发布提交 `a0529ac`。
4. **`gsd-p3-release`** —— 一条命令即可修复，但它在授权范围外。
5. **`delete_repo` scope** —— 需交互式浏览器 re-auth。
6. **`0.0.0-stage` deprecate** —— 需 OTP。
7. **registry 升级语义 / codegraph 同层合成** —— 是否必须在本 milestone 内补证。

## Gaps Summary

**没有 must-have truth 被判 FAILED，也没有 missing/stub artifact 或未接线的 key link。** 因此不产生 `/gsd:plan-phase --gaps` 形态的 blocker 清单。

未闭合的是一条 **roadmap 级的半边**（UAT-06 的 watch 记录，SC-3）与一条**自动化覆盖面缺口**（G-1：UAT-04 的 ①② 断言不进默认回路），外加 4 条 review finding 与 8 条残余/out-of-scope 事项。它们都**不是本 phase 的交付物缺失**，而是「完成到什么程度、由谁接手」的裁决：

- 本 phase 的**核心风险**——「把假验收写成真验收」——从证据链看被有效防住了：判据是事件级的（不是目录存在）、阴性对照在场（不是单侧）、字节比较取的是远端字节、`not measured` 没有被编成数字、发布口径从「字节指纹」订正成「提交级背书」。这些我在本轮能独立复核的部分**都对上了**。
- 本 phase 的**核心交付**——干净机器能装上、能跑完、能拦住，1.0 已发布，三项对外动作已落地，真实 home 已迁到插件单源——**全部成立**。
- 剩下的是**人的决定**（要不要量 watch、要不要修 G-1、要不要把 UAT 重锚到发布提交、要不要处置范围外的 profile 与 token scope）与**已知残余**（registry 升级语义、同层合成、`/tmp` 残留、文档陈迹）。

因此状态取 `human_needed` 而不是 `passed`（存在 UAT-06 这一未测行为与 7 项需人裁决的事项），也不是 `gaps_found`（没有 must-have 失败或工件缺失）。

## Verification Method & Limits (what I observed vs what I only read)

**本趟亲自观测：**

- 全量套件 `47 / 40 pass / 0 fail / 7 skip`（14768 ms）；`BUILD.md:16` 的 47 与 ⑯ 自洽。
- ①② 两条 hook 判据在强制开关下 `2/2 pass`，判定文本逐字符合 must-have。
- 第二次连续 `node build.mjs` 后：构建产物与 canonical 逐字节相同、`SKIP_DIRS` 成员行恰 1、⑨ 组绿。
- `npm view`（权威 registry）：`latest`、`versions`、`0.0.0-stage` 未 deprecate。
- `gh release view`：tag / `targetCommitish` / `isPrerelease`；该提交 8/8 check run `success`。
- `gh pr view 18793`：`MERGED`、单文件、`+6/−0`、两项 check `SUCCESS`；目标仓文件与 `docs/dshmarket/pfmiles__dsh-gsd.yml` sha256 相同。
- 旧仓远端 sha `3af3f27…`；`snippet.en.md`（691 B）是远端 README 的连续子串，尾部 `\n\n## Quick start`，CJK 0。
- 真实 `~/.dsh`：`skills/gsd-*` = 0、三项受管目录 absent、`gsd-hooks.dsh.json*` 无输出、4 profile bridge 0；`web`/`headless` 插件版本/技能数/两项字节/`bundles`/bundle patch 行数；`gsdtest` 的 CR-01 修复形态；`gsd-p3-release` 的修复前形态；`.stripped-bak` 2 份。
- `gh auth status` 的 scope 清单；`git status --porcelain` 全程为空；`.continue-here.md` 在 git 历史里。

**只来自记录、本趟无法重跑（逐条声明，不冒充观测）：**

- live 用例 ③④⑤⑥⑦ 的 `pass 7 / skipped 0`（需真实 `DEEPSEEK_API_KEY` 与真实 `dsh` 会话；本会话不读凭据面）。**UAT-01/02/03/05/06(开销) 与 INST-01..05 的「今天仍绿」因此不由本趟独立证明**，来自判据段 1/2/3/5/8 的 live 记录 + 代码复核。
- `npm publish` 的人类 OTP 动作与回执、传播窗口读数；发布后 registry 通道安装出的 958 文件与 tarball 的逐字节比对。
- dry-run 的 `with tag latest` 行、npm 12 prerelease tag guard 的抛错机制。
- 两次 CI run（预演/主推）的 `success`（我复核的是同一提交上的 8 条 check run）。
- 真实迁移的写段（`--uninstall` 前 72 技能备份、A–E 阴性对照的「卸载后立刻」时点、registry 通道两条 `add` 的逐字输出）。
- `COEXIST-REAL` 五条合取（需在真实 home 上 `--dump-config`；计划的禁令把它列为不得当只读探针）。
- 3091 刷新后新会话里的 `[dsh-gsd] skills provider:` 行（我复核的是磁盘上的 `index.js` 形态与 72 项，未起新会话）。

---

_Verified: 2026-11-26T07:59:11Z_
_Verifier: DeepSeek Harness (gsd-verifier)_
_Score: 43/44 must-haves verified · behavior_unverified: 1 · overrides_applied: 0_