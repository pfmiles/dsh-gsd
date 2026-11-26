---
phase: 05-uat-1-0
verified: 2026-11-26T08:58:33Z
status: human_needed
score: 44/44 must-haves verified
covered_files: [".github/workflows/compat-matrix.yml",".planning/phases/05-uat-1-0/05-01-PLAN.md",".planning/phases/05-uat-1-0/05-01-SUMMARY.md",".planning/phases/05-uat-1-0/05-02-PLAN.md",".planning/phases/05-uat-1-0/05-02-SUMMARY.md",".planning/phases/05-uat-1-0/05-03-PLAN.md",".planning/phases/05-uat-1-0/05-03-SUMMARY.md",".planning/phases/05-uat-1-0/05-04-PLAN.md",".planning/phases/05-uat-1-0/05-04-SUMMARY.md","BUILD.md","CHANGELOG.md","README.md","build.mjs","build/assets/ui-frontend-evidence.cjs","package.json","tests/build-smoke.test.mjs","tests/docs-consistency.test.mjs","tests/fixtures/injection-sample.md","tests/uat-harness.test.mjs"]
covered_digest: "v4:sha256:e651c6371dc0bcc48e68fd41f080362c69fbd15defed944c8ece8a27d2b2a436"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 43/44
  previous_commit: d59af03
  previous_verified: "2026-11-26T07:59:11Z"
  gaps_closed:
    - "WR-01 / G-1：①② 的 skip 门比用例实际需要宽（凭据 / zstd / tarball 与 hook 两向对照无关）⇒ 两条 hook 回归在默认回路与 CI 里永不执行"
    - "WR-02：BUILD.md:110-111 的 prepack / test 缺 --test-concurrency=1，且 ⑮ 的注释宣称了一个它并不具备的全仓扫描面"
    - "IN-01：⑯ 只数源码 `^test(` 行，`test.skip(` / `test.todo(` / `test.only(` 会让 BUILD.md:16 静默变旧"
    - "IN-02：DSH_UAT_TGZ 设了但路径不存在时，skip 理由说「unset」并报告一个从未被查询过的目录"
  gaps_remaining: []
  regressions: []
residuals:
  - id: R-5-04
    fact: "发布门 ≠ UAT 门：live 7/7 于 2026-11-16T07:16:23Z 在当时候选树上跑；11-25 发布前 package.json 改过元数据字段。发布后只对 registry 装出的字节复验了 UAT-01 的会话谓词（判据段 11）"
    impact: "UAT-02..06 未对最终发布提交 a0529ac 重跑；无行为代码差异，但严格意义上未重锚 ⇒ 人决定是否补一次（human item 2）"
  - id: UAT-06-watch
    fact: "技能 watch（长驻进程热重载）仍是 `not measured`（README:81 / :170 双语，05-UAT.md:17），REQUIREMENTS.md:63 仍是 `[ ]`"
    impact: "判据本身经其声明的 fallback 满足（见 §UAT-06 显式裁决），但 watch 行为本身从未被观测；勾选与否是人的记账动作（human item 1）"
  - id: OPEN-3
    fact: "registry 通道上的升级/回滚语义未测（registry 上只有一个公开版本可作两端）"
    impact: "UAT-05 只证「换版本号这条命令的机制」，不是 registry 升级历史"
  - id: OPEN-4
    fact: "codegraph 同层合成（真装三 bundle 的 `COEXIST-DRILL`）在真实 home 上仍无证据"
    impact: "D-10-2 只到行级 id 不相交 + `COEXIST-REAL`，不证解析级/挂载级合成"
  - id: CI-coverage
    fact: "①② 修复后只在 `DSH_UAT_LIVE=1` 时执行；`package.json` 的 test/prepack 与 `.github/workflows/compat-matrix.yml` 都不设该变量 ⇒ 默认回路与 CI 仍 100% skip 这两条"
    impact: "凭据耦合（WR-01 的要害）已去除，opt-in 仍是 T-5-12 的防伪绿设计；要拿到 CI 证据需在 workflow 的 run 步加 env（本趟未做）"
  - id: D-08
    fact: "`gh` token 的 `delete_repo` scope 仍在（本趟 `gh auth status` 复读：scopes 含 delete_repo）"
    impact: "继承的 accepted risk 的收窄动作未完成（human item 3）"
  - id: R-5-08
    fact: "`dsh-gsd@0.0.0-stage` 未 deprecate（本趟 `npm view … deprecated` 为空；`latest` 仍是 1.20.1-1.dsh022）"
    impact: "不占 latest、不影响安装；会出现在版本列表（human item 3）"
  - id: R-5-01
    fact: "4 个 `/tmp/dsh-uat-*` 残留（本趟清点仍为 4；harness 的 finally 路径会清理，本趟两次全量跑未新增）"
    impact: "无凭据材料；未清理"
  - id: DOC-01
    fact: "README:66 / :155 的「npm 首发、GitHub Release 与 dshmarket 收录随后落地」在发布后已过时；05-01-PLAN.md:39-40 的 INST-01 空入参边与 INST-05 `!!js` 两条措辞仍是被实测证伪的旧形态（偏离已登记在 05-01-SUMMARY 的 Deviations 1/2）"
    impact: "文案/计划文本债，不破任何 must-have（human item 4 的范围外，可随下一轮清理）"
  - id: PLAN-01
    fact: "`05-UAT.md` 与 `verify-work` 的输出文件名 `{phase}-UAT.md` 冲突：下一次 `/gsd:verify-work` 会覆盖这份判据↔证据↔结论表"
    impact: "planning 产物命名缺陷（不是 phase 5 的交付缺口）；改名前需人决定目标文件名"
human_verification:
  - test: "裁决 UAT-06 的 watch 半边：接受「`not measured` + 结构性理由」这一 fallback（并把 REQUIREMENTS.md:63 勾选，或写明理由保持不勾），或按 05-RESEARCH §Q5 的 method 2 在非 3091 端口的 scratch `web` profile 里改一个 SKILL.md，记录「我改了 X，新会话在 T+n 看到它」的读数"
    expected: "要么 REQUIREMENTS.md:63 反映裁决（本报告的判定是「已由自身 fallback 满足」），要么有一条带时间戳的 watch 读数回写 README 双语与 05-UAT.md 的 UAT-06（技能 watch）行"
    why_human: "结构性不可测：一次性会话每次都是新进程、启动时重读技能目录；watcher 只在长驻 `web` 进程里可观察，而数 fsevents 需要 root。且需求账本的勾选不是 verifier 的写面（本趟约束只允许改本文件）"
  - test: "决定是否把 UAT-02..06 重锚到最终发布提交（R-5-04）：在 `a0529ac` 上跑一次 `DSH_UAT_LIVE=1` + 真实 `DEEPSEEK_API_KEY` 的 live 段"
    expected: "live 7/7 的读数与发布提交绑定；否则保留「UAT 在候选树上绿、发布树只复验 UAT-01」的诚实表述"
    why_human: "需要真实凭据、真实 `dsh` 会话与已打好的 tarball；本会话不读凭据面（`~/.dsh/.credentials.yaml`），也无该授权"
  - test: "范围外 hygiene 两件：`gh auth refresh --remove-scopes delete_repo`（D-08）与 `npm deprecate dsh-gsd@0.0.0-stage \"<reason>\" --registry https://registry.npmjs.org/`（R-5-08，不 unpublish）"
    expected: "`gh auth status` 的 scopes 不再含 delete_repo；该版本带 deprecate 说明而 `dist-tags.latest` 仍是 1.20.1-1.dsh022"
    why_human: "前者需要交互式浏览器 re-auth，后者需要 OTP；agent 两者都做不到"
  - test: "决定 registry 通道升级/回滚语义（OPEN-3）与 codegraph 同层合成（OPEN-4）是否必须在本 milestone 内补证"
    expected: "补证则给出可重放的读数；不补证则写入已知限制并进入下一 milestone 的 backlog"
    why_human: "前者需要第二个已发布版本作两端；后者需要在真实 home 上真装三个 bundle 的演练（破坏性），均非本轮可执行"
---

# Phase 5: 端到端 UAT 与 1.0 收官 Verification Report

**Phase Goal:** 干净机器全量验收，发布 1.0。
**Verified:** 2026-11-26T08:58:33Z（HEAD `56bb0cc`，`git status --porcelain` 空）
**Status:** human_needed
**Re-verification:** Yes — 四条 review finding 已在 `aab3976` 修复、账本在 `56bb0cc` 落定，旧报告的覆盖指纹已过期
**Score:** 44/44 must-haves verified（0 FAILED，0 present-behavior-unverified）

## Verdict rationale

**没有一条 must-have truth 被判 FAILED，也没有 missing/stub artifact 或未接线的 key link。** 上一轮 43/44 的三条扣分理由里有两条已经消失：

1. **G-1 / WR-01 是真缺口，现已修复。** `tests/uat-harness.test.mjs:100-106` 新增 `hookPrereqs()`（**仅** `DSH_UAT_LIVE=1`），①② 在 `:780` / `:877` 改用它；`zstd` / 凭据 / tarball 的耦合从两条 hook 用例剥离。本趟实测：`DSH_UAT_LIVE=1` 且**无** `DEEPSEEK_API_KEY`、**无** `DSH_UAT_TGZ` ⇒ `47 / pass 42 / fail 0 / skipped 5`，①② 转绿（上一轮必须借一枚**占位凭据**才能越过那道门）。缺 `hooks/` 构建产物时两条用例改为 `t.skip` 并指路 `node build.mjs`，冷 clone 不再假红。
2. **UAT-06 的 watch 半边**：本趟显式裁决为**经其自身声明的 fallback 满足**（理由与反事实见下节），SC-3 因此从 `⚠️ PRESENT_BEHAVIOR_UNVERIFIED` 升为 `✓ VERIFIED`，分数 43/44 → **44/44**。
3. **R-5-04 仍然成立**（live 7/7 跑在 11-16 候选树上，发布树只复验了 UAT-01 的谓词）—— 它是**记录口径**的限制，不是实现缺口，仍由人决定是否重锚。

`status` 仍取 `human_needed` 而不是 `passed`：分数满了，但本 phase 自己的账本里仍有两件**只能由人做**的事 —— UAT-06 的记账（`REQUIREMENTS.md:63` 仍 `[ ]`，本趟约束不允许我改它）与 R-5-04 的重锚决定（需要真实凭据），外加两件范围外动作（`delete_repo` scope、`0.0.0-stage` deprecate）。按 Step 9 的判定树，只要存在 human verification item，就不是 `passed`；同时没有任何 blocker，所以也不是 `gaps_found`。

> 与上一轮相比，本趟**没有**新增任何 code finding，也没有把任何旧 finding 重新记为 open：`05-REVIEW-DISPOSITION.md` 记 `fixed` 的四条，我逐条在源码上复核并重跑了能重跑的部分（见 §Behavioral Spot-Checks）。

## 本趟改变了什么（vs `d59af03` 的 43/44）

| 项 | 上一轮 | 本趟 | 我的复核方式 |
|---|---|---|---|
| WR-01 / G-1 | `open`；①② 被凭据/zstd/tarball 门挡在默认回路外 | `fixed`；①② 只吃 `DSH_UAT_LIVE=1` | 读 `:100-106`/`:780`/`:877` + 实跑 `DSH_UAT_LIVE=1`（2/2 pass，无占位凭据） |
| WR-02 | `open`；`BUILD.md:110-111` 与 `package.json` 矛盾，⑮ 注释夸大了扫描面 | `fixed`；两行均带 `--test-concurrency=1`，⑮ 注释改为「本断言的两个扫描面内恰 3 处」 | 读 `BUILD.md:110-111`、`package.json` scripts、`docs-consistency:421-429` + ⑮ 绿 |
| IN-01 | `open`；⑯ 只数 `^test(` | `fixed`；正则 `^test(?:\.(?:skip|todo|only))?\(`，仍 47 | 读 `:533-537` + 独立逐文件计数 2/8/16/4/7/7/3 = 47 |
| IN-02 | `open`；set-but-missing 报「unset」 | `fixed`；`resolveTgz()` 返回 `reason`，两种情形分开 | 设 `DSH_UAT_TGZ=/tmp/definitely-not-a-real-tarball.tgz` 实跑，理由逐字指名该路径 |
| SC-3 / UAT-06 | `⚠️ PRESENT_BEHAVIOR_UNVERIFIED` ⇒ 43/44 | `✓ VERIFIED`（经自身 fallback）⇒ 44/44 | 见下节；README 双语 + 05-UAT.md 的行逐字复核 |
| R-5-06（`gsd-p3-release`） | 0 个 `gsd-*` 技能来源（CR-01 前形态） | **已修**（2026-11-26 重装）：`1.20.1-1.dsh022`、72 技能、`index.js` 为 CR-01 后形态 | 只读复核（见 SC/D-10-3 行） |
| `05-VALIDATION.md` | 审计为 PARTIAL / `nyquist_compliant: false` | 文件已加「G-1 在审计之后关闭」的日期注记；仍保留 `false`（5 条 manual-only + watch 未测） | 读文件；`false` 是否翻绿留待下一次审计，不由修复者自证 —— 本趟不判为 phase gap |
| 状态 | `human_needed`（7 项人验） | `human_needed`（4 项：2 项判据相关 + 2 项范围外） | 见 §Human Verification Required |

## UAT-06 显式裁决（本趟必须回答的问题）

**裁决：SC-3 经**其自身声明的 fallback** 满足，因此计为 `✓ VERIFIED`，分数 44/44。**

判据原文（05-02-PLAN `must_haves.truths` 第 6 条）自己写死了两种可交付形态：(a) 能自动测的只有「启动时读取」；(b) 长驻进程里的 watch **结构性不可测**，「若无人跑 `05-RESEARCH.md` §Q5 的 method 2，`05-UAT.md` 与 `README.md` **必须**写 `not measured` 并给出这条结构性理由——编一个数字比不写更糟」。同计划的 `prohibitions` 里还有一条同向禁令：「MUST NOT 编造或沿用任何技能 watch 数字……没有 method 2 的实测就写 `not measured` 并写出原因」。稍早的 behavior_unverified 条目也把 `expected` 写成两臂：「一次读数；**无此读数时** README 与 05-UAT.md 必须写 `not measured` 并给出结构性理由」。

四条判据齐备：

1. **fallback 是事先登记的，不是事后找补。** 它写在 PLAN 的 must-have 与 prohibition 里，执行期按它交付。
2. **交付完全符合这条 fallback。** `README.md:81`（zh）与 `:170`（en）双语写 `not measured` 并给结构性理由（一次性会话=新进程、启动重读；watcher 只在长驻 `web`；fsevents 需 root）；`05-UAT.md:17` 的「UAT-06（技能 watch）」行结论列就是 `not measured`，备注给出同一条理由，并显式声明「本计划只量了启动时读取（token 命中 2 次），那**不是** watch」。
3. **可量的那一半有量化记录。** 启动开销三点用事件时间戳（`turn/start.time − session.createdAt`）：9 ms / 279 ms / ≈270 ms（判据段 8，n=3、单机、暖缓存），README 双语与 `05-UAT.md` 的 UAT-06（启动开销）行逐字一致，且显式声明墙钟（2 560–3 834 ms）不作开销数字。
4. **路标级 SC 的措辞也容得下这条 fallback。** `ROADMAP.md` 的 SC-3 是「启动开销数字与技能 watch 行为**记录**入 README」—— `not measured` + 结构性理由正是一条关于 watch 行为的记录（负记录），而不是省略。

**这条裁决不主张什么（必须一起读）：**

- 它**不**主张 watch 被观测过。watch 行为至今零观测，`not measured` 是诚实披露，不是测量结果；`behavior_unverified: 0` 指的是「没有 truth 停在该状态」，不是「watch 已被验证」。
- 它**不**主张 `REQUIREMENTS.md:63` 已经可以自动勾选。该行文本要求「启动开销与技能 watch 的**量化**记录」，比 ROADMAP SC 与 PLAN must-have 更严；勾选是需求账本所有者的动作，本趟约束只允许改本文件。
- **反事实（写在这里以免被读成静默处理）**：若采用更严的读法 —— 「UAT-06 的 `量化记录` 必须有 watch 数字」—— 则 SC-3 未满足，分数回落到 **43/44**。但**状态不变**：两种读法下都还剩 UAT-06 的处置与 R-5-04 两件人做的事，仍然是 `human_needed`。也就是说这项裁决只移动分数，不改变 verdict 的方向。

## Goal Achievement

### ROADMAP Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UAT-01..05 全绿（干净 `DSH_HOME` 安装、skills、健康、拦截、scaffold、升级回滚） | ✓ VERIFIED | 记录：live 7/7 @2026-11-16T07:16:23Z（判据段 1/2/3/5/8；registry 通道的 UAT-01 谓词在判据段 11，含 `hook/invoked`）。实测：UAT-04 的两条 hook 用例本趟在 `DSH_UAT_LIVE=1`（无凭据）下 `2/2 pass`。留 R-5-04 的重锚口径 |
| 2 | hooks 回归（commit 校验拦截错误格式、injection 扫描落日志） | ✓ VERIFIED | 实测：`[uat-harness] ① … opt-in+nonconforming=exit 2/block:CONVENTIONAL_COMMITS_VIOLATION \| opt-in+conforming=exit 0/no-block \| no-opt-in+nonconforming=exit 0/no-block \| repo hooks.community=absent`；`② injection: severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)`；`pass 2 / fail 0 / skipped 0`（只需 opt-in，不再需要占位凭据） |
| 3 | 启动开销数字与技能 watch 行为记录入 README | ✓ VERIFIED（经其自身 fallback，见上节） | 数字双语在场且与 `05-UAT.md` 同源（`README.md:68-81` / `:157-170`：9 / 279 / ≈270 ms）；watch 两语均写 `not measured` + 结构性理由（`:81` / `:170`），`05-UAT.md:17` 同行。`REQUIREMENTS.md:63` 仍 `[ ]` ⇒ human item 1 |
| 4 | 1.0 发布 + UAT 报告 | ✓ VERIFIED | 实测 `npm view … --registry https://registry.npmjs.org/` → `latest = 1.20.1-1.dsh022`；`05-UAT.md`（判据↔证据↔结论表）与 `05-UAT-EVIDENCE.md`（判据段 1–14，1346 行）在仓 |
| 5 | 对外动作执行：npm publish（registry 通道复验）+ GitHub Release + dshmarket PR | ✓ VERIFIED | 实测 registry：`latest=1.20.1-1.dsh022`；Release：`tagName=1.20.1-1.dsh022, targetCommitish=a0529acf…, isPrerelease=false, isDraft=false`；PR：`state=MERGED, mergedAt=2026-11-25T16:36:45Z, changedFiles=1, +6/−0`，`Submission gate` 与 `check` 均 `pass`，文件与 `docs/dshmarket/pfmiles__dsh-gsd.yml` **逐字节相同**（`cmp` IDENTICAL） |
| 6 | （D-10-1）`--test-concurrency=1` 三处齐备，且有一条计数断言守着它 | ✓ VERIFIED | 实测：`package.json` 的 `prepack`/`test` 与 `compat-matrix.yml:56` 各 1 处；⑮ 在默认回路绿（`:435`）；**变异实验本趟重放**：删掉 `scripts.test` 的 flag ⇒ `✖ ⑮ … 缺 --test-concurrency=1`，`pass 15 / fail 1` |
| 7 | （D-10-2）G-4 闭合：四源 row id 两两不相交（`MISSING:` 判红）且 `COEXIST-REAL` 通过 | ✓ VERIFIED | 实测独立读 `web` 四源 patch：`[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`（合计 5 个 id，两两不相交）；`MISSING:` 0 行与 `COEXIST-REAL PASS`（五条合取，判据段 14 §10）为**记录** —— 该块要在真实 home 上跑 `--dump-config`，计划明令禁止当只读探针 |
| 8 | （D-10-3）真实 `~/.dsh` 迁移完成：旧源为零、两 profile 插件 row 各恰 1、包内 72 技能与两项字节数对齐 | ✓ VERIFIED | 实测只读：`~/.dsh/skills/gsd-*` = **0**；`gsd-core`/`hooks`/`scripts` 全 absent；`gsd-hooks.dsh.json*` 无输出；`web`/`headless` 均 `1.20.1-1.dsh022`、`skills/gsd-*` = **72**、`gsd-health/SKILL.md` = **3587 B**、`gsd-new-project/SKILL.md` = **3856 B**；两 profile 的 `dsh.profile.bundles` 各含 `dsh-gsd` **1** 次；插件 `cordis.patch.yml` 的 `id: gsd` / `id: gsd-hooks-bridge` 各 **1** 行（写段读数见判据段 14 §2–§9，记录） |
| 9 | （D-10-4）旧仓 `pfmiles/install-gsd-dsh` 互链已推送：远端 main 前进且插入正文与 `snippet.en.md` 逐字节一致 | ✓ VERIFIED | 实测：`gh api …/commits/main` → `3af3f27f5893fbf66950551fba8ddfc9427f1106`（父 `41fcc7a`，2026-11-26T06:53:10Z）；远端 README **24346 B**，691 B 的 `snippet.en.md` 是**连续子串**（字符 2210 / 字节 2222），其后紧跟 `\n\n## Quick start`；远端 CJK **0**（`snippet.zh.md` 未推） |
| 10 | （D-10-5）构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，连跑两次 `node build.mjs` 仍成立 | ✓ VERIFIED | 实测：本趟两次全量跑各触发一次真实构建（6 504 ms / 5 831 ms）；构建后 `gsd-core/bin/lib/ui-frontend-evidence.cjs` 与 `build/assets/ui-frontend-evidence.cjs` **逐字节相同**（14 223 B）；`SKIP_DIRS` 成员行 `.gsd-build-tmp` **恰 1**（`:140`），全文 mentions 4（与记录一致）；⑨ 组 ✔ |

### Plan must-haves — 05-01（安装面 / 会话面 / D-10-1）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 零残留 `/tmp` 新 home 上 `plugin add` 后，**新开会话**的会话记录含 `assistant/message` 且任何 `turn/end` 递归无 `kind:error`；「有 session 目录」不作判据 | ✓ VERIFIED（记录） | 谓词实现于 `tests/uat-harness.test.mjs:210-232`（`JSON.parse` 之后、递归 `kind === 'error'`，`:199-207`）；live PASS 记录（判据段 1，`pass 7 / skipped 0`）。本趟无凭据，未重跑 |
| 2 | 安装前 home 零 GSD 残留且被断言；安装后 home 级 `skills/` 仍不存在；本机 profile 不作判据环境 | ✓ VERIFIED（记录 + 实测旁证） | `residue()`（`:138`）/`homeTree()`（`:387`）+ 判据段 1 逐项读数；本趟只读复核真实 home 的旧源已归零，但判据环境仍是 `/tmp`（D-01） |
| 3 | INST-01：`add` 后 profile patch 仍 `[]`、无禁用条目；空入参边成立 | ✓ VERIFIED（口径已订正；偏离已登记） | `cordis.patch.yml` 正文 `[]`、`disabled:` 真值 0（判据段 1）；空入参边：计划原文「非零退出」被实测**证伪**（dsh 0.2.2-rc.1 是 `exit 0` + 初始化 profile），harness 断言「不存在第三种状态」（`:294-327`），偏离登记在 `05-01-SUMMARY` Deviations 1。⚠ `05-01-PLAN.md:39` 仍是旧措辞（文本债，非缺口） |
| 4 | INST-03/05：`add` 后不重启即 `--dump-config` 两 row 各 1；`configPath` 是包内绝对路径；未安装时两行都不在 | ✓ VERIFIED（INST-05 口径已订正；偏离已登记） | 判据段 2：dump 403/404 行、`gsd` 1 / `gsd-hooks-bridge` 1、stderr 0 B；`!!js` 按加载器语义求值为 `…/profiles/probe6/node_modules/dsh-gsd/config/gsd-hooks.json` 且存在。计划原文「dump 里直接出现绝对路径」恒红（实测 dump 不求值 `!!js`，VALIDATION C-12、SUMMARY Deviations 2），harness 改为求值形态（更强）。⚠ `05-01-PLAN.md:40` 旧措辞未改 |
| 5 | INST-04：`remove` 后归零（删前在场）+ 幂等边 + 空操作边 | ✓ VERIFIED（记录） | 判据段 2：删前两 row 各 1 且在盘 → 删后 0；再 `remove` exit 1、manifest 逐字节不变、stdout 空；未装过的 profile `remove` exit 1 且无副作用 |
| 6 | INST-02：装前/装后 `DSH_HOME` 受管面哈希差集只落在 `profiles/<p>/` | ✓ VERIFIED（记录） | 判据段 2：home 树 digest `b072887…` 装前装后不变，差集 `{added:[],removed:[]}`，五类受管面全 `ABSENT` |
| 7 | UAT-02/03：真实会话 scaffold 出 `PROJECT/ROADMAP/STATE`；引擎经包内绝对路径；`.env` 被硬拦且哨兵不入记录，`.txt` 阳性对照哨兵入记录 | ✓ VERIFIED（记录） | 判据段 3：`.planning/` 5 文件；`hook/result` `decision=block`、`exitCode=2`、guard 指名 `secret-read`；`.env` 哨兵 0 次 / `.txt` 哨兵 12 次；live 用例 ⑤ 127 s 通过 |
| 8 | D-10-1：三处齐备且 ⑮ 是逐处计数扫描（不是「套件绿所以 flag 在」） | ✓ VERIFIED | 实测：三处读盘 + ⑮ 绿 + **变异实验本趟重放**（删 flag ⇒ ⑮ 红，`pass 15 / fail 1`）；`:435-500`（`pkgSites==2` ∧ `workflowTestLines==1` ∧ 合计==3） |

### Plan must-haves — 05-02（hooks / 版本 / 开销 / 构建补丁 / 回归）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UAT-04 commit 半边三段对照：(a) opt-in+非规范 → exit 2 + `decision: block` + `CONVENTIONAL_COMMITS_VIOLATION`；(b) opt-in+规范 → exit 0 无 block；(c) 未 opt-in+非规范 → exit 0；三段 stderr 均不含 fail-open 文案 | ✓ VERIFIED | **实测（只需 opt-in）**：三段读数逐字命中（见 SC-2）；`FAIL_OPEN_LINE` 三条 `doesNotMatch` 在 `:820/:837/:843` |
| 2 | UAT-04 injection 半边只落日志：exit 0 + `INJECTION-PATTERN` finding + 无 block | ✓ VERIFIED | **实测**：`severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)` |
| 3 | 第四条事实：本仓 `.planning/config.json` 无 `hooks.community`，commit 校验默认不生效；该事实本身是一条断言 | ✓ VERIFIED（实测） | 本趟读 `.planning/config.json`：`hooks` 只有 `context_warnings`；① 打印 `repo hooks.community=absent` |
| 4 | UAT-05：同一条 `plugin add` 换版本（`.dsh022→.dsh021→.dsh022`），version 随之变、两 row 各 1、会话谓词成立；两份 tarball 只有版本串不同 | ✓ VERIFIED（记录） | 判据段 5（三段 swap + 回滚后会话）；`05-UAT.md` UAT-05 行逐字含「从未也永不发布」与「证的是换版本号这条命令的机制」 |
| 5 | UAT-06 三个点用**事件时间戳**（`turn/start.time − session.createdAt`），墙钟不作数字 | ✓ VERIFIED（记录 + 实测读文档） | 判据段 8 六轮实测表：9 / 279 / ≈270 ms（n=3、单机、暖缓存）；墙钟并列记录并显式声明不可用；README 双语与 `05-UAT.md` 逐字一致 |
| 6 | UAT-06 watch 半边两种状态必须分清；无人跑 method 2 时 `05-UAT.md` 与 `README.md` 必须写 `not measured` + 结构性理由 | ✓ VERIFIED | `05-UAT.md:17` = `not measured`；`README.md:81`/`:170` 双语同写；结构性理由（一次性会话新进程、watcher 只在长驻 web、fsevents 需 root）齐备；可测半边（启动读取，token 命中 2 次）与 watch 明确区分。见 §UAT-06 显式裁决 |
| 7 | D-10-5：构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，与 canonical 逐字节相同，连跑两次构建仍成立 | ✓ VERIFIED | **实测**：两次构建后 `cmp` IDENTICAL（14 223 B）、成员行 1；⑨ 组断言存在性 + 字节等值 + 成员行恰 1（`tests/build-smoke.test.mjs:151-205`） |
| 8 | INST-06 是回归：`pack-contents` 与 `docs-consistency` 仍全绿，证据册记实数与 UTC 而非「已通过」 | ✓ VERIFIED（实测） | 本趟默认回路：`pack-contents` 4/4 ✔ + `docs-consistency` 16/16 ✔；判据段 7 记 `20/20` @2026-11-16T07:16:30Z |

### Plan must-haves — 05-03（发布态 / 对外动作）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | manifest 的发布态是四处同一次提交：`private` 整键删除、`publishConfig={registry,tag}`、⑥ 发布态哨兵、⑬ 期望值加 `tag` | ✓ VERIFIED（实测） | `package.json`：无 `private`（`hasOwnProperty` false）、`publishConfig={"registry":"https://registry.npmjs.org/","tag":"latest"}`；⑥/⑬ 在默认回路绿（`docs-consistency` 16/16） |
| 2 | `publishConfig.tag` 不是可选项（npm 12 对 prerelease 缺显式 tag 硬拒） | ✓ VERIFIED（机制未复跑） | 声明值在盘；dry-run 打印 `Publishing to https://registry.npmjs.org/ with tag latest`（判据段 9，记录）。npm 12 的抛错路径未由本趟重放 |
| 3 | `npm publish --dry-run` 是门：打印 registry + `with tag latest`，且真的跑完 prepack | ✓ VERIFIED（记录） | 判据段 9：exit 0、prepack 跑完 build 门 + `ℹ tests 47 / pass 40`，同一次打印 `with tag latest` 与 npmjs URL |
| 4 | README 双语开销段数字与 `05-UAT.md` UAT-06 行同源逐字一致，且不破 ⑫/⑨/①② | ✓ VERIFIED（实测） | 本趟 grep：两语同为 9 / 279 / ≈270；`docs-consistency` 16/16 绿（含 ⑫ 裸名 install 串、⑨ 徽章、①② 门槛串） |
| 5 | 「当前状态 / Status」改写：(a) 点名版本、(b) 8 项 UAT 已在干净机器通过、(c) 指向 CHANGELOG、(d) 不出现 `dsh-gsd@latest` | ✓ VERIFIED（实测） | `README.md:66`（zh）/`:155`（en）：三条齐备、`grep dsh-gsd@latest` 零命中。⚠ 同句「npm 首发…随后落地」已过时（文案陈迹，不破本 truth，见 DOC-01） |
| 6 | 发布前抢注复查必须是 `404` 才放行 | ✓ VERIFIED（记录） | 判据段 10 放行前证据 4：`404`，对照 `@opengsd/gsd-core` `200`。该读数如今**不可重放**（名字已归我们） |
| 7 | 推送先预演后主推，权威 sha 用 `gh api …/commits/main`；预演与 main 两次 CI 均绿 | ✓ VERIFIED（记录 + 实测旁证） | 判据段 10：两次 run `success`；本趟 `gh api …/commits/a0529ac…/check-runs` → **8 条全部 `conclusion=success`** |
| 8 | 发布后每次观测读权威 registry；判据 = `latest` 等于发布版本、tarball 可解析、registry 通道在**新** `/tmp` home 上重跑 UAT-01 谓词 | ✓ VERIFIED | 本趟 `npm view` 显式带 `--registry https://registry.npmjs.org/` 得 `latest=1.20.1-1.dsh022`；registry 通道安装与会话谓词为记录（判据段 11：`assistant/message` 1、`turn/end` 1、无 `kind:error`、含 `hook/invoked`/`hook/result`） |
| 9 | `approved` 与 `published` 严格两段；D-05 只在发布后仍红才可达；本轮 D-05 未触发 | ✓ VERIFIED（记录） | 判据段 11：回执 `2026-11-25T11:18:35.005Z`，首次 registry 读 11:57:59Z；传播窗口约 7 分钟未被判红；`.dsh022` 仍是 `latest`、未 deprecate |
| 10 | Release tag 必须 `--target PUBLISHED_SHA`；无 `v` 前缀、`prerelease=false`、正文取 CHANGELOG | ✓ VERIFIED（实测） | `gh release view`：`tagName=1.20.1-1.dsh022`、`targetCommitish=a0529acf57e1ab01d59bd0730af0e7964d680033`、`isPrerelease=false`、`isDraft=false`；该提交在远端存在且 8/8 check 绿 |
| 11 | dshmarket 完成判据 = PR 已开 + 对方仓四检通过（**不含合并**） | ✓ VERIFIED（实测，比收官记录更进一步） | `gh pr view 18793`：`state=MERGED`（2026-11-25T16:36:45Z）、`changedFiles=1`、`+6/−0`；`gh pr checks` → `Submission gate pass`、`check pass`；目标仓文件与仓内 yml sha256 相同、`cmp` IDENTICAL |

### Plan must-haves — 05-04（机器级收口）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | D-11：机器级收口只在 `.planning/` 产物提交之后；三道闸同形态、可重跑，不用 `git log -1` | ✓ VERIFIED（记录 + 实测复核） | 判据段 12 §10 / 13 §2 / 14 §14 三次 `commit gate: PASS`；本趟 `.continue-here.md` 在 `git log --name-only` 里出现 **5** 次、`git status --porcelain` 空。顺序本身不可重放 |
| 2 | 只读预检先于写动作且自身是判据；命中集被 `MIG_DECIDED_PROFILES` 完整覆盖；基线**重数**（`web` bridge = 2 而非 1） | ✓ VERIFIED（记录 + 实测复核） | 判据段 12：`GATE` 两次跑 1→0、`GATE: PASS`（`skills=72 / profiles=4 / machine-level=CLEAN`）；本趟：迁移后四 profile 的 bridge 计数全 0（与「删前 2」构成同一条判据的两端，删前读数仅存记录） |
| 3 | 3091 刷新的判据是「插件自报提供技能」：`index.js` 为 CR-01 修复后形态、两 row 各 1、provider 指向 `<plugin>/skills` | ✓ VERIFIED（实测） | 本趟读 `~/.dsh/profiles/gsdtest/node_modules/dsh-gsd/index.js:22-23` → `pluginRoot = dirname(fileURLToPath(import.meta.url))` + `join(pluginRoot,'skills')`；包内 72；provider 行记录（判据段 13 §4） |
| 4 | 真实迁移按 runbook 走完，判据全部是内容/集合/字节：`GATE: PASS` → `--uninstall` → 卸全局 CLI → registry 通道装 `web`+`headless` → 阴性对照 A–E + 内容比对同时成立 | ✓ VERIFIED（记录 + 实测终点态） | 本趟只读复核终点态（见 SC-8）；写段读数（备份 72 目录、A–E 全成立、3587/3856/72、stderr 0 B）为记录（判据段 14 §2–§9）。全局 CLI 已不在 PATH（本环境即其后果） |
| 5 | G-4：步骤 6 两段（静态四源 + CB-8b `COEXIST-REAL` 五条合取），`MISSING:` 判红；两段不可互相替代 | ✓ VERIFIED | 本趟独立读四源 row-id 集（两两不相交）；`MISSING:` 0 行与 `COEXIST-REAL PASS`（含 `required-absent:dsh-gsd`）为**记录** —— 该块在真实 home 上跑 `--dump-config`，属计划禁令面 |
| 6 | 旧仓互链判据在**远端**：sha 前进于 `41fcc7a`，插入正文与 `snippet.en.md` 逐字节一致，`snippet.zh.md` 不推 | ✓ VERIFIED（实测） | 本趟：sha `3af3f27…`；691 B 连续子串（字节 2222 / 字符 2210）+ 尾部 `\n\n## Quick start`；远端 CJK 0 |
| 7 | `ROADMAP.md` 的 Phase 5 Requirements 行逐字含 19 个 ID，SC 含 D-10 五件 | ✓ VERIFIED（实测） | 本趟读 `.planning/ROADMAP.md`：`**Requirements**` 行逐字 19 个 ID（无区间形态）；SC 1–10 在场，SC 6–10 即 D-10-1..5 |

**Score:** 44/44 truths verified（10 ROADMAP SC + 8 + 8 + 11 + 7；0 FAILED，0 present-behavior-unverified，0 override）

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `tests/uat-harness.test.mjs` | UAT 唯一执行件，7 用例；①② 只吃 opt-in | ✓ EXISTS + SUBSTANTIVE + WIRED | 7 个顶层注册行；`hookPrereqs()` `:100-106`、`resolveTgz()` 带 `reason` `:111-137`；7 条全部注册进 `node --test` |
| `tests/fixtures/injection-sample.md` | ② 的 payload | ✓ EXISTS + WIRED | 1 202 B；被 ② 直接消费（本趟 ② 绿） |
| `tests/build-smoke.test.mjs` | ⑨ 组（D-10-5） | ✓ EXISTS + WIRED | 本趟两次真实构建 + ⑨ 断言全绿 |
| `tests/docs-consistency.test.mjs` | ⑥ 发布态哨兵 / ⑬ `tag` / ⑮ / ⑯ | ✓ EXISTS + WIRED | 16/16 绿；⑮ `:435`、⑯ `:505`（注册行正则 `:533`） |
| `build/assets/ui-frontend-evidence.cjs` | canonical 覆盖件 | ✓ EXISTS + SUBSTANTIVE | 14 223 B；`SKIP_DIRS` 成员 `.gsd-build-tmp` 1 行；与构建产物逐字节相同 |
| `build.mjs` | post-staging 拷贝步（不递增 `counters.copied`） | ✓ EXISTS + WIRED | `:321` 在 ⑤ 之后、⑥ 之前；`copied 76 trees` 未被撞红（build-smoke 绿） |
| `package.json` | 发布态（无 `private`、`publishConfig.tag`、两处 flag） | ✓ EXISTS | 本趟逐项读盘命中 |
| `.github/workflows/compat-matrix.yml` | 全量测试 `run:` 行带 flag，不新增步骤 | ✓ EXISTS + WIRED | `:56` 单行带 flag；`node --test` 的 `run:` 行仍 1 条（⑮ 计数口径） |
| `README.md` | 双语「启动开销」+ 状态句 + `not measured` | ✓ EXISTS | 双语数字与 `05-UAT.md` 一致；`not measured` 双语在场（`:81`/`:170`） |
| `CHANGELOG.md` | `## [1.20.1-1.dsh022]` 条目（Release 正文来源） | ✓ EXISTS | 首条目 == `pkg.version`（⑧ 绿） |
| `BUILD.md` | `:16` 活体计数 47；`:110-111` 命令与 manifest 一致 | ✓ EXISTS + WIRED | ⑯ 绿；`:110-111` 两行均带 `--test-concurrency=1`（WR-02 已修） |
| npm `dsh-gsd@1.20.1-1.dsh022` | `latest` + tarball 可解析 | ✓ EXISTS（远端） | 本趟 `npm view` 实测 |
| GitHub Release `1.20.1-1.dsh022` | tag → `PUBLISHED_SHA`，`prerelease=false` | ✓ EXISTS（远端） | 本趟 `gh release view` 实测 |
| dshmarket PR #18793 | 单文件、逐字节、四检通过 | ✓ EXISTS（已合并） | 本趟 `gh pr view` + `gh pr checks` + 内容 sha256 比对 |
| 迁移后的真实 `~/.dsh` | 旧源 0、两 profile 各 1 插件、72 技能 | ✓ EXISTS（机器） | 本趟只读探针实测（4 个 profile 全部 1.20.1-1.dsh022 / 72 技能） |
| `pfmiles/install-gsd-dsh` 远端提交 | `README.md` 互链 | ✓ EXISTS（远端） | 本趟 sha + 字节比对实测 |
| `05-UAT.md` / `05-UAT-EVIDENCE.md` | 判据表 + 判据段 1–14 | ✓ EXISTS + SUBSTANTIVE | 逐行可复核；本趟抽查各段读数与现盘一致 |

**Artifacts:** 17/17 verified（上一轮 `BUILD.md` 的唯一条目已随 WR-02 修复而消失）。

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| live 用例 ③④⑤⑥⑦ | 真实 `dsh` 会话 / tarball | `missingPrereqs()` → `t.skip`，`DSH_UAT_LIVE=1` + 凭据 + 唯一 tarball | ✓ WIRED | 默认 5 条 skip 理由逐项可读（本趟 `DSH_UAT_LIVE=1` 下只见 `DEEPSEEK_API_KEY is not in the process env`）；需要真实凭据（R-5-04） |
| ①② | `hooks/` 构建产物 | `hookPrereqs()`（仅 opt-in）→ `spawnSync('node', [HOOK_WRAPPER, …])` 喂合成 payload | ✓ WIRED | **本趟实测：只需 `DSH_UAT_LIVE=1`，2/2 pass**；缺构建产物时定向 `t.skip` 并指路（`:784-793` / `:881-890`），冷 clone 不假红。CI 未设该 env ⇒ 默认回路仍 0 覆盖（见 CI-coverage 残余） |
| `build.mjs` 拷贝步 | `gsd-core/bin/lib/ui-frontend-evidence.cjs` | ⑤ 捕获之后、⑥ rewrite 之前 `cp` | ✓ WIRED | 本趟两次构建后字节等值 + 成员行 1 |
| `publishConfig` | npm registry 写入 | `registry` + `tag` 同对象 | ✓ WIRED | 本趟 registry `latest` 为该版本 |
| `PUBLISHED_SHA` | Release tag | `gh release create --target` | ✓ WIRED | 本趟 `targetCommitish` 逐字相同 |
| 读侧 `--registry` | 权威 registry | 每条 `npm view` / 安装命令显式带 | ✓ WIRED | 本趟 `npm view` 复现 `latest` |

**Wiring:** 6/6 条连接成立（上一轮 ①② 的「默认回路不可达」已由 `hookPrereqs()` 拆分解除，剩余的是 opt-in 政策而非接线缺陷）。

### Data-Flow Trace (Level 4)

N/A —— 本 phase 无渲染型产物（交付为判据、构建资产、manifest/文档与对外发布物）。没有需要追踪的动态数据源。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 默认全量套件（串行） | `node --test --test-concurrency=1 tests/*.test.mjs` | `ℹ tests 47 / pass 40 / fail 0 / skipped 7`，9 056 ms | ✓ PASS（与 `BUILD.md:16` 的 47 等值） |
| 只开 opt-in 的全量套件 | `DSH_UAT_LIVE=1 node --test --test-concurrency=1 tests/*.test.mjs`（无 `DEEPSEEK_API_KEY`、无 `DSH_UAT_TGZ`） | `ℹ tests 47 / pass 42 / fail 0 / skipped 5`，8 783 ms；①② 转绿，③④⑤⑥⑦ 仅因缺凭据 skip | ✓ PASS（WR-01 的要害已解除：不再需要占位凭据） |
| UAT-04 两条 hook 判据的输出 | 同上（看 `[uat-harness]` 行） | `① … exit 2/block:CONVENTIONAL_COMMITS_VIOLATION \| exit 0/no-block \| exit 0/no-block \| repo hooks.community=absent`；`② injection: severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)` | ✓ PASS |
| IN-02 的两种 reason | `DSH_UAT_LIVE=1 DSH_UAT_TGZ=/tmp/definitely-not-a-real-tarball.tgz node --test --test-concurrency=1 --test-name-pattern='UAT-01' tests/uat-harness.test.mjs` | skip 理由：`no single tarball: DSH_UAT_TGZ is set to /tmp/definitely-not-a-real-tarball.tgz but no such file exists (point it at a real dsh-gsd-*.tgz, or unset it to auto-resolve under /tmp/uat-tgz)` | ✓ PASS（旧文案「unset」已消失） |
| ⑯ 的计数口径（独立复算） | `grep -cE '^test(\.(skip\|todo\|only))?\('` 逐文件 | `build-smoke 2 / compat-matrix 8 / docs-consistency 16 / pack-contents 4 / rewrite-map 7 / uat-harness 7 / version 3` = **47**；`test.skip(`/`test.todo(`/`test.only(` 当前用量 0 | ✓ PASS |
| ⑮ 的扫描面（独立复算） | `node -e 'require("./package.json").scripts'` + `grep -n 'node --test' .github/workflows/*.yml` | scripts 含 `node --test` 的恰 2 条（`prepack`/`test`，均带 flag）；workflow 恰 1 行（`:56`，带 flag） | ✓ PASS |
| ⑮ 的牙（变异实验，本趟重放） | `git archive 56bb0cc \| tar -x -C /tmp/verif-mut-56bb0cc` → 删 `scripts.test` 的 flag → 该副本内跑 `docs-consistency` | baseline `16/16`；变异后 `✖ ⑮ … 缺 --test-concurrency=1`，`pass 15 / fail 1`（退出码 1） | ✓ PASS（临时目录已删，主树未动） |
| ⑯ 的牙（变异实验，本趟重放） | 同上副本内把 `BUILD.md` 的「预期 47」改成「预期 48」 | `✖ ⑯ … 活体计数已过期`，`pass 15 / fail 1`（退出码 1） | ✓ PASS |
| D-10-5 二次连续构建 | 两次全量跑各触发一次真实构建（6 504 ms / 5 831 ms） | 构建后 `cmp` canonical **IDENTICAL**（14 223 B）；`SKIP_DIRS` 成员行 `.gsd-build-tmp` 恰 1（`:140`），全文 mentions 4 | ✓ PASS |
| npm 权威 registry | `npm view dsh-gsd dist-tags.latest version deprecated --json --registry https://registry.npmjs.org/` | `latest=1.20.1-1.dsh022`；`deprecated` 为空 | ✓ PASS |
| GitHub Release | `gh release view 1.20.1-1.dsh022 --repo pfmiles/dsh-gsd --json …` | `targetCommitish=a0529ac…`、`isPrerelease=false`、`isDraft=false` | ✓ PASS |
| 发布提交的 CI | `gh api repos/pfmiles/dsh-gsd/commits/a0529ac…/check-runs` | **8 条**，`conclusions={"success":8}` | ✓ PASS |
| dshmarket PR | `gh pr view 18793 …` + `gh pr checks` | `state=MERGED`、`changedFiles=1`、`+6/−0`；`Submission gate pass`、`check pass` | ✓ PASS（优于收官记录：④ 已终态，且已合并） |
| PR 文件逐字节 | `gh api …/contents/data/plugins/pfmiles__dsh-gsd.yml` → base64 解码 → `cmp` | `cmp` IDENTICAL（远端 blob sha `93f8d031…`） | ✓ PASS |
| 旧仓互链 | `gh api repos/pfmiles/install-gsd-dsh/commits/main` + `contents/README.md?ref=3af3f27…` | sha `3af3f27…`；691 B 连续子串 @字节 2222；尾部 `\n\n## Quick start`；CJK 0 | ✓ PASS |
| 真实 `~/.dsh` 旧源 | `ls -d ~/.dsh/skills/gsd-*`；`[ -d ~/.dsh/{gsd-core,hooks,scripts} ]`；`ls ~/.dsh/gsd-hooks.dsh.json*` | `gsd-*` = **0**；三项 absent；`gsd-hooks.dsh.json*` 无输出 | ✓ PASS |
| 真实 home 四 profile | 读各 profile 的插件 `package.json` / `skills/` / 两项字节 / `dsh.profile.bundles` / bundle patch | `web`/`headless`/`gsdtest`/`gsd-p3-release` 均 `1.20.1-1.dsh022`、`skills/gsd-*` = 72、`3587` / `3856` B、`bundles` 含 `dsh-gsd` 1 次、`id: gsd` 与 `id: gsd-hooks-bridge` 各 1 行 | ✓ PASS（`gsd-p3-release` 已由此前重装修复，R-5-06 关闭） |
| 四源 row id（D-10-2 静态段） | 读 `web/node_modules/{dsh-gsd,@jiangzhenguo/dsh-codegraph,dsh-deja,dshmarket}/cordis.patch.yml` | `[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`，两两不相交 | ✓ PASS（`COEXIST-REAL` 为记录） |
| `gh` token scope | `gh auth status` | scopes 含 **`delete_repo`**（D-08 未执行） | ✗ 仍开放（残余，非 phase gap） |

### Probe Execution

N/A —— 本仓没有提交 `scripts/*/tests/probe-*.sh` 形态的探针（`scripts/` 是构建产物、不入 git）。本 phase 声明的一次性门（⑮ 变异实验、D-10-5 补丁门、三道 commit gate）以命令 + 逐字输出记录在 `05-UAT-EVIDENCE.md` 判据段 1/6/12/13/14。本趟把其中**可重放的两条**（⑮/⑯ 的变异实验）在 `git archive 56bb0cc` 的临时副本里重跑（见上表），其余只复核产物。

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| UAT-01 | 05-01, 05-03 | 干净 `DSH_HOME` 完成 INST-01 并重启 | ✓ SATISFIED | tarball 通道 live（判据段 1）+ registry 通道谓词（判据段 11，含 `hook/invoked`）；`REQUIREMENTS.md` `[x]` |
| UAT-02 | 05-01 | `/gsd-health` 成功；`/gsd-new-project --auto` scaffold `.planning/` | ✓ SATISFIED | 判据段 3：5 文件 + 引擎包内路径；`[x]` |
| UAT-03 | 05-01 | 真实会话 read `.env` 被拦 | ✓ SATISFIED | 判据段 3：`decision=block` + 双哨兵对照；`[x]` |
| UAT-04 | 05-02 | hooks 回归抽测（commit 校验、injection 扫描） | ✓ SATISFIED | **本趟实测 2/2**（只需 opt-in）；G-1 已修；`[x]` |
| UAT-05 | 05-02 | 升级/回滚同命令换版本号后抽测通过 | ✓ SATISFIED（机制段） | 判据段 5；`[x]`。registry 升级语义见 OPEN-3 |
| UAT-06 | 05-02, 05-03 | 启动开销与技能 watch 的量化记录 | ✓ SATISFIED（经其自身声明的 fallback） | 开销数字有（判据段 8 / README 双语）；watch `not measured` + 结构性理由（README:81/:170、05-UAT.md:17）。**`REQUIREMENTS.md:63` 仍 `[ ]`** —— 记账动作见 human item 1；反事实见 §UAT-06 |
| INST-01 | 05-01 | 单命令安装，无前置脚本/手工 patch | ✓ SATISFIED | 判据段 1（`[]` patch、无禁用行、空入参边不变量） |
| INST-02 | 05-01 | 安装不写 `~/.dsh` 受管文件 | ✓ SATISFIED | 判据段 2（digest 不变、差集空） |
| INST-03 | 05-01 | 安装即注册、无重启前提 | ✓ SATISFIED | 判据段 2（404 行、两 row 各 1） |
| INST-04 | 05-01 | 卸载后 skills/hooks/bundle 行全部消失 | ✓ SATISFIED | 判据段 2（归零 + 幂等边 + 空操作边） |
| INST-05 | 05-01 | dump 见两 row，`!!js` 展开为包内绝对路径 | ✓ SATISFIED（求值形态） | 判据段 2（求值得包内路径且在盘） |
| INST-06 | 05-02 | 元数据合规 | ✓ SATISFIED | 本趟 `pack-contents` 4/4 + `docs-consistency` 16/16；判据段 7 |
| PUB-01 | 05-03 | npm 首发成功 + registry 复验 | ✓ SATISFIED | 本趟 `latest=1.20.1-1.dsh022`；判据段 10/11 |
| PUB-03 | 05-03 | dshmarket 材料与 PR 本体 | ✓ SATISFIED | 本趟 PR `MERGED` + 两 check `pass` + 文件逐字节相同；材料半由 ⑪⑫ 守 |
| D-10-1 | 05-01 | `--test-concurrency=1` 三处 + 计数断言 | ✓ SATISFIED | 本趟三处读盘 + ⑮ 绿 + **变异实验重放** |
| D-10-2 | 05-04 | G-4 静态四源 + `COEXIST-REAL` | ✓ SATISFIED | 本趟四源集合两两不相交；`COEXIST-REAL PASS` 为记录 |
| D-10-3 | 05-04 | 真实 `~/.dsh` 迁移完成 | ✓ SATISFIED | 本趟终点态复核（旧源 0、两 profile 各 1、72 技能、3587/3856） |
| D-10-4 | 05-04 | 旧仓互链已推送且逐字节一致 | ✓ SATISFIED | 本趟远端 sha + 691 B 子串比对 |
| D-10-5 | 05-02 | 构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，经得住重建 | ✓ SATISFIED | 本趟两次构建 + 字节等值 + 成员行 1 |

**Coverage:** 19/19 satisfied（其中 UAT-06 依据其自身 fallback 判为满足，理由与反事实见 §UAT-06）。**无 ORPHANED**：`ROADMAP.md` 的 Phase 5 Requirements 行 19 个 ID 与四份 PLAN 的 `requirements` 并集逐一对上（05-01 9 个、05-02 5 个、05-03 4 个、05-04 3 个，去重 19）。

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `tests/uat-harness.test.mjs` | 100-106, 780, 877 | ①② 仍只在 `DSH_UAT_LIVE=1` 时执行，而 `package.json` 与 CI 都不设该变量 ⇒ 默认回路/CI 里 UAT-04 自动化覆盖仍为 0 | ℹ️ Info（政策选择，非 finding） | WR-01 指名的**凭据/zstd/tarball 耦合**已解除（本趟：只开 opt-in 即 2/2 绿）；保留 opt-in 是 T-5-12 的防伪绿设计（否则「全 skip ⇒ fail 0」会被读成 UAT-04 通过）。若要 CI 真跑，需在 `compat-matrix.yml:56` 的步上加 `env: DSH_UAT_LIVE: '1'` —— 本趟约束不改 tests/CI |
| — | — | 债务标记（TBD/FIXME/XXX） | ✅ 0 | 本 phase 改动的 11 个非 `.planning` 文件零命中；无 blocker |
| — | — | 四条 review finding（WR-01 / WR-02 / IN-01 / IN-02） | ✅ 0 open | `05-REVIEW-DISPOSITION.md`：`fixed` ×4，`open: 0`，source `aab3976`；本趟逐条复核并重跑（见 §Behavioral Spot-Checks） |

**Anti-patterns:** 0 open（上一轮 4 条 open 全部关闭）。唯一一条 ℹ️ Info 是**覆盖面政策**（opt-in 导致默认回路 0 覆盖），不是新缺陷，也不使任何 must-have 失败。

## Residual / Out-of-scope Open Items（不计分）

| # | Item | Evidence status | Consequence |
| - | ---- | --------------- | ----------- |
| 1 | UAT-06 watch 半边 `not measured`；`REQUIREMENTS.md:63` 仍 `[ ]` | 本趟复核 README 双语 + 05-UAT.md | 判据经 fallback 满足；记账见 human item 1 |
| 2 | R-5-04（发布树未重跑 UAT-02..06） | 发布后仅 UAT-01 谓词复验（记录） | 严格意义上的「发布树全量 UAT」未成立；见 human item 2 |
| 3 | `delete_repo` scope 仍在（D-08） | 本趟 `gh auth status` 复读 | 需交互式 re-auth；human item 3 |
| 4 | `dsh-gsd@0.0.0-stage` 未 deprecate | 本趟 `npm view … deprecated` 为空 | 需 OTP；human item 3 |
| 5 | registry 通道升级/回滚语义（OPEN-3） | 只有一个公开版本 | UAT-05 只证机制；human item 4 |
| 6 | codegraph 同层合成（OPEN-4） | 只有行级 id + `COEXIST-REAL` | 不证解析级/挂载级合成；human item 4 |
| 7 | 4 个 `/tmp/dsh-uat-*` 残留（R-5-01） | 本趟清点仍为 4（本趟两次全量跑未新增） | 无凭据材料；未清理 |
| 8 | `05-UAT.md` 与 `verify-work` 输出文件名冲突（PLAN-01） | 命名事实 | 下次 `verify-work` 会覆盖该表；属 planning 缺陷，非 phase gap |
| 9 | `README.md:66`/`:155` 的「首发…随后落地」已过时；`05-01-PLAN.md:39-40` 两条被证伪的旧措辞未改（DOC-01） | 本趟读盘 | 文案/计划文本债，不破 must-have |
| 10 | ~~`gsd-p3-release` 0 技能（R-5-06）~~ | **已关闭**：本趟只读复核 `1.20.1-1.dsh022` / 72 技能 / CR-01 后形态 `index.js` / bundles 1 / patch 两 id 各 1 | 无需动作 |

## Human Verification Required

见 frontmatter 的 `human_verification`（4 项）。摘要：

1. **UAT-06 的处置** —— 接受「`not measured` + 结构性理由」这一 fallback（并让 `REQUIREMENTS.md:63` 反映裁决），或按 05-RESEARCH §Q5 method 2 去量一次 watch。本报告的判定是「已由自身 fallback 满足」；勾选是需求账本所有者的动作。
2. **R-5-04 的重锚** —— 是否在最终发布提交 `a0529ac` 上用真实凭据重跑 live 段（UAT-02..06）。
3. **范围外 hygiene** —— `delete_repo` scope 收窄（D-08）与 `0.0.0-stage` deprecate（R-5-08）。
4. **OPEN-3 / OPEN-4 的取舍** —— registry 升级语义与 codegraph 同层合成是否必须在本 milestone 内补证。

## Gaps Summary

**没有 must-have truth 被判 FAILED，也没有 missing/stub artifact 或未接线的 key link。** 因此不产生 `/gsd:plan-phase --gaps` 形态的 blocker 清单，也不存在需要 deferred 到后续 phase 的条目（Phase 5 是本 milestone 的最后一相）。

上一轮的三条扣分理由现在是这样收口的：

- **G-1 / WR-01** —— 已修（`hookPrereqs()`）。残留是一条**政策**而非缺陷：opt-in 保留使默认回路与 CI 仍不执行 ①②（CI 未设 env）。这点写入 ℹ️ Info 与残余表，不计为 gap。
- **UAT-06 的 watch 半边** —— 经其自身事先登记的 fallback 判为满足（44/44 的最后一分）；watch 行为本身仍零观测，这一点在 §UAT-06、残余表与 human item 1 三处都写明。
- **R-5-04** —— 仍是记录口径的限制（候选树 → 发布树），需要人决定是否重锚。

状态取 `human_needed` 而不是 `passed`：分数虽满，但 UAT-06 的记账与 R-5-04 的重锚都是**人的决定**，`REQUIREMENTS.md:63` 此刻也仍与我的判定不一致 —— 在需求账本更新之前宣布 `passed` 会把一条未勾选的需求留在身后。也不是 `gaps_found`：没有任何 must-have 失败或工件缺失。

## Verification Method & Limits (what I re-executed vs what I only read)

**本趟亲自重跑（可复现）：**

- 默认全量串行套件：`47 / 40 pass / 0 fail / 7 skip`（9 056 ms）。
- `DSH_UAT_LIVE=1` 全量（**无**凭据、**无** `DSH_UAT_TGZ`）：`47 / 42 pass / 0 fail / 5 skip`；①② 转绿且输出逐字符合 must-have。
- IN-02 的 set-but-missing 分支（新 skip 理由指名路径）。
- ⑯ 的独立计数（逐文件 2/8/16/4/7/7/3 = 47）与 ⑮ 的扫描面（scripts 2 + workflow 1 = 3）。
- ⑮ / ⑯ 的**变异实验**（`git archive 56bb0cc` 临时副本内：删 flag ⇒ ⑮ 红；改计数 ⇒ ⑯ 红；baseline 16/16；副本已删，主树未动）。
- 两次真实构建（两次全量跑各一次）后的 canonical ↔ 产物字节等值与 `SKIP_DIRS` 成员行。
- `npm view`（权威 registry）、`gh release view`、`gh pr view` / `gh pr checks`、PR 文件逐字节、发布提交 8 条 check-run、旧仓 main sha 与 691 B 子串（远端字节）、`gh auth status`。
- 真实 `~/.dsh` 与四个 profile 的只读探针（旧源、版本、72 技能、3587/3856 B、bundles、patch 两 id）。
- 四源 `cordis.patch.yml` 的 row-id 集合。
- `git status --porcelain` 全程为空；`05-REVIEW-DISPOSITION.md` 的 `open: 0`。

**只来自记录、本趟无法重跑（逐条声明，不冒充观测）：**

- live 用例 ③④⑤⑥⑦ 的 `pass 7 / skipped 0`（2026-11-16T07:16:23Z）—— 需要真实 `DEEPSEEK_API_KEY` 与真实 `dsh` 会话；本会话不读凭据面。**UAT-01/02/03/05/06(开销) 与 INST-01..05 的「今天仍绿」因此不由本趟独立证明**，来自判据段 1/2/3/5/8 的 live 记录 + 代码复核。
- `npm publish` 的人类 OTP 动作与回执、传播窗口读数、registry 通道装出的 958 文件与 tarball 的逐字节比对。
- dry-run 的 `with tag latest` 行、npm 12 prerelease tag guard 的抛错机制、发布前 404 抢注复查（如今不可重放）。
- 两次 CI run（预演/主推）的 `success`（我复核的是同一提交上的 8 条 check run）。
- 真实迁移的写段（`--uninstall` 前 72 技能备份、A–E 阴性对照的「卸载后立刻」时点、registry 通道两条 `add` 的逐字输出）。
- `COEXIST-REAL` 五条合取（需在真实 home 上 `--dump-config`；计划的禁令把它列为不得当只读探针）。
- 3091 刷新后新会话里的 `[dsh-gsd] skills provider:` 行（我复核的是磁盘上的 `index.js` 形态与 72 项，未起新会话）。
- `gsd-p3-release` 的重装动作本身（2026-11-26 由他人执行）；我只复核了终点态。

---

_Verified: 2026-11-26T08:58:33Z_
_Verifier: DeepSeek Harness (gsd-verifier)_
_Score: 44/44 must-haves verified · behavior_unverified: 0 · overrides_applied: 0 · open review findings: 0_