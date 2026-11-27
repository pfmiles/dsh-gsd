---
phase: 05-uat-1-0
verified: 2026-11-26T13:20:12Z
status: passed
score: 44/44 must-haves verified
covered_files: [".github/workflows/compat-matrix.yml",".planning/phases/05-uat-1-0/05-01-PLAN.md",".planning/phases/05-uat-1-0/05-01-SUMMARY.md",".planning/phases/05-uat-1-0/05-02-PLAN.md",".planning/phases/05-uat-1-0/05-02-SUMMARY.md",".planning/phases/05-uat-1-0/05-03-PLAN.md",".planning/phases/05-uat-1-0/05-03-SUMMARY.md",".planning/phases/05-uat-1-0/05-04-PLAN.md",".planning/phases/05-uat-1-0/05-04-SUMMARY.md",".planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md",".planning/phases/05-uat-1-0/05-UAT.md","BUILD.md","CHANGELOG.md","README.md","build.mjs","build/assets/ui-frontend-evidence.cjs","package.json","tests/build-smoke.test.mjs","tests/docs-consistency.test.mjs","tests/fixtures/injection-sample.md","tests/uat-harness.test.mjs"]
covered_digest: "v4:sha256:f222cd65786ec0a82ad8d1b261d7eeb4042cc9ebd2043eeef6d26fe9345597fc"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 44/44
  previous_commit: 4cd016e
  previous_verified: "2026-11-26T08:58:33Z"
  gaps_closed: []
  gaps_remaining: []
  regressions: []
  human_items_resolved:
    - "UAT-06 的记账：`REQUIREMENTS.md:63` 已翻 `[x]`，并写明「按计划预登记的退路判定为满足」「不代表 watch 被观测过」；本趟独立判断该读法可辩护（§UAT-06）"
    - "R-5-04 的重锚：7 条 live 已在 registry 发布字节上整套重跑（判据段 15）；本趟复核被测对象身份（本地 sha1 = registry `dist.shasum` = 现下载字节），run 本身为记录"
    - "D-08 的 scope 收窄：`delete_repo` 已撤；本趟 `gh auth status` 复读 scopes = `gist, read:org, repo, workflow`"
    - "R-5-08 的 deprecate：已尝试并被 registry 以 E404 拒绝（判据段 16）；本趟复核该版本 `deprecated` 仍 absent、`latest` 仍指向 `.dsh022`、该版本 HTTP 200 / 2 文件 329 B"
    - "OPEN-3 / OPEN-4：记为本轮 deferred by decision；本趟逐条核对了「19 个 ID 与 D-10 五件均无对应判据」这一理由（§OPEN-3/4）"
residuals:
  - id: UAT-06-watch
    fact: "技能 watch 仍是 `not measured`（README:81 / :170 双语、05-UAT.md 的「UAT-06（技能 watch）」行），零观测"
    impact: "判据经其自身预登记的退路满足；若改用更严读法（要求 watch 数字），SC-3 判红、分数 43/44 —— 两种读法下状态都是 `passed` 之外无 blocker（详见 §UAT-06）"
    disposition: accepted-reading
  - id: R-5-08
    fact: "`dsh-gsd@0.0.0-stage` 仍未 deprecate：人类于 2026-11-26T13:05:27Z 执行 `npm deprecate`，客户端选中成功（`npm notice deprecating …` 已打印），红在随后的 `PUT /dsh-gsd` 上的 E404"
    impact: "不占 `latest`、不影响按名安装（`latest` 仍为 `.dsh022`），只有显式 pin `@0.0.0-stage` 才会装到 2 文件占位符；同一 PUT 路径不再重试，余下只有网页端人工处置。**不是 19 个 ID 里的判据**（计划里唯一提到 deprecate 的是未触发的 D-05 失败路径）"
    disposition: out-of-scope-blocked
  - id: OPEN-3
    fact: "registry 通道上的升级/回滚语义未测（deferred by decision，05-UAT.md 段 (d)）"
    impact: "UAT-05 只证「同命令换版本号」这条命令的机制 —— 其判据原文与 PLAN must-have 都明写如此，不是隐式假设"
    disposition: deferred-by-decision
  - id: OPEN-4
    fact: "codegraph 同层合成的行为级证据（真装三 bundle 的 `COEXIST-DRILL`）仍缺；行级 + `COEXIST-REAL`（五条合取，记录）已闭合 D-10-2"
    impact: "真实迁移按计划只跑静态段 + `COEXIST-REAL`，`COEXIST-DRILL` 明确不跑（判据段 14 §10.3）；MIG-04 属 Phase 4 需求，不在本 phase 的 19 个 ID 内"
    disposition: deferred-by-decision
  - id: PLAN-01
    fact: "`05-UAT.md` 与 `verify-work` 的输出文件名 `{phase}-UAT.md` 冲突"
    impact: "下一次 `/gsd:verify-work` 会覆盖这份判据↔证据↔结论表；planning 产物命名缺陷，不是 phase 5 的交付缺口"
    disposition: planning-defect
  - id: CI-coverage
    fact: "①② 只在 `DSH_UAT_LIVE=1` 时执行，而 `package.json` 的 `test`/`prepack` 与 `.github/workflows/compat-matrix.yml` 都不设该变量"
    impact: "凭据/zstd/tarball 的耦合已由 `hookPrereqs()` 去除（本趟实测只开 opt-in 即 2/2 绿），保留 opt-in 是 T-5-12 的防伪绿设计；要在 CI 拿到 UAT-04 证据需在 `compat-matrix.yml:56` 加 `env: DSH_UAT_LIVE: '1'`（本趟未改，超出 verifier 写面）"
    disposition: policy
  - id: VALIDATION-01
    fact: "`05-VALIDATION.md` 仍保留 `nyquist_compliant: false`（审计时点状态：5 条 manual-only + watch 未测），文件头已加「G-1 在审计之后关闭」的日期注记"
    impact: "翻绿与否留给下一次审计或 verifier 判定；本轮不以自证方式改它，也不把它判成 phase gap（它不是 44 条 must-have 之一）"
    disposition: audit-artifact
  - id: DOC-01
    fact: "README:66 / :155 的状态句仍写「npm 首发、GitHub Release 与 dshmarket 收录随后落地」（发布后已过时）；`05-01-PLAN.md:39-40` 的 INST-01 空入参边与 INST-05 `!!js` 两条旧措辞仍是被实测证伪的形态（偏离登记在 05-01-SUMMARY）；`05-UAT.md` 头部写「判据段 1–15」而证据册已有 16 段"
    impact: "文案/计划文本债，不破任何 must-have"
    disposition: doc-debt
  - id: R-5-01
    fact: "4 个 `/tmp/dsh-uat-*` 残留（本趟清点仍为 4；本趟两次全量跑未新增）"
    impact: "无凭据材料；未清理"
    disposition: residue
  - id: REC-01
    fact: "判据段 11 把发布回执时刻记作 `2026-11-25T11:18:35.005Z`，同段又写「11:11Z 仍 404 → 11:18:35Z 可读」，两读并置有约 7 分钟口径差"
    impact: "记录精度瑕疵，不改变「D-05 未触发 / `.dsh022` 为 `latest`」的结论；回执原始行未留进程副本，无法回溯订正"
    disposition: record-precision
---

# Phase 5: 端到端 UAT 与 1.0 收官 Verification Report

**Phase Goal:** 干净机器全量验收，发布 1.0。
**Verified:** 2026-11-26T13:20:12Z（HEAD `0647317`，`git status --porcelain` 空）
**Status:** passed
**Re-verification:** Yes —— 上一版 `4cd016e` 为 `human_needed`，四条留给人的决定此后分三次落地（`71a0576` / `398138d` / `0647317`）；本趟从零复核并重写本文件
**Score:** 44/44 must-haves verified（0 FAILED，0 present-behavior-unverified，0 override）

## Verdict rationale

**没有任何 must-have truth 被判 FAILED，也没有 missing/stub artifact 或未接线的 key link；19 个需求 ID 现已全部 `[x]`，四条此前保留给人的决定全部落地并可复核。** 因此按 Step 9 的判定树走到第 3 条：`passed`。

上一版取 `human_needed` 不是因为分数不满，而是因为四件事只能由人做。本趟逐件复核：

1. **UAT-06 的记账** —— `REQUIREMENTS.md:63` 已 `[x]`，并在行内写明「按计划里预登记的退路判定为满足」「**不代表 watch 被观测过**」。这是一个**合同读法**的显式落账，不是把未测说成已测（§UAT-06）。
2. **R-5-04 的重锚** —— 7 条 live 已在**发布字节**上整套重跑（判据段 15）。本趟亲手复核被测对象的身份：本地 sha1 = registry `dist.shasum` = 现下载字节（`cmp` 相同），且 11-16 候选树那份 tarball 的 sha1 不同（`36eac0dc…`）—— 重锚确实换了对象，不是换个说法。
3. **D-08 的 scope 收窄** —— `gh auth status` 实测 scopes = `gist, read:org, repo, workflow`，`delete_repo` 已不在。
4. **R-5-08（`0.0.0-stage`）** —— 已尝试 deprecate，被 registry 以 `E404` 拒绝；字段仍 absent、`latest` 不受影响。**如实记为仍未闭合**，不写成「已 deprecate」。
5. **OPEN-3 / OPEN-4** —— 记录为 deferred by decision，理由（19 个 ID 与 D-10 五件均无对应判据）本趟逐条核对成立（§OPEN-3/4）。

**`passed` 不主张什么（必须一起读）：**

- 它**不**主张 watch 被观测过 —— watch 至今零观测，`not measured` 是负记录，不是测量结果；`behavior_unverified: 0` 指的是「没有 truth 停在该状态」。
- 它**不**主张本趟亲自跑过 live 7/7 —— 那一条是**记录**（判据段 15）；本趟实跑的是默认回路、opt-in 回路、两次变异实验与全部只读探针（§Verification Method & Limits）。
- 它**不**主张 `0.0.0-stage` 已处置 —— registry 拒绝写入，余下只有网页端人工路径；它不在 19 个 ID 内，因此不改变 status，但也不被静默吸收（§Residual）。
- 它**不**主张 OPEN-3 / OPEN-4 已被证明 —— 两者按决定出界，理由与边界都写在 §OPEN-3/4。

## 本趟改变了什么（vs `4cd016e`）

| 项 | `4cd016e` | 本趟 | 我的复核方式 |
|---|---|---|---|
| `REQUIREMENTS.md:63`（UAT-06） | `[ ]` | `[x]` + 预登记退路说明 + 「不代表 watch 被观测」 | 读该行全文；独立判断该读法（§UAT-06）—— **re-executed（读盘）** |
| R-5-04（发布树重锚） | 仍是记录口径的限制，交人决定 | 判据段 15：发布字节上 `tests 7 / pass 7 / fail 0 / skipped 0`，145 131 ms | tarball sha1 / `dist.shasum` / 现下载字节 `cmp` / 全包面比对 —— **re-executed**；run 本身 **recorded-only** |
| D-08（`delete_repo`） | scope 仍在 | 已撤，最小四集保留 | `gh auth status` —— **re-executed** |
| R-5-08（`0.0.0-stage`） | 未尝试 | 已尝试，被 registry 拒绝（`E404` on `PUT /dsh-gsd`） | registry packument 字段 + HTTP 200 + npm 12.2.1 `deprecate.js` 源码 —— **re-executed（读）**；尝试本身 **recorded-only** |
| OPEN-3 / OPEN-4 | 交人取舍 | deferred by decision，理由入 `05-UAT.md` 段 (d) | 逐条核对 19 个 ID 与 D-10 五件的判据文本 —— **re-executed（读）** |
| 19 个需求 ID | UAT-06 未勾 | 19/19 `[x]` | 逐行 `grep` 勾选态 —— **re-executed** |
| 状态 | `human_needed` | `passed` | 本报告 |

## UAT-06 显式裁决（本趟必须回答的问题）

**裁决：该读法可辩护，我同意；SC-3 计为 `✓ VERIFIED`（经其自身预登记的退路），分数 44/44。**

判据原文里 fallback 是**事先登记**的，不是事后找补 —— 这一点我逐字读过两处：

- `05-02-PLAN.md` 的 must-have 第 6 条自己写死了两臂：(a) 能自动测的只有「启动时读取」；(b) 长驻进程里的 watch **结构性不可测**，「若无人跑 `05-RESEARCH.md` §Q5 的 method 2，`05-UAT.md` 与 `README.md` **必须**写 `not measured` 并给出这条结构性理由——编一个数字比不写更糟」。
- 同计划的 prohibition 第 3 条同向：「MUST NOT 编造或沿用任何技能 watch 数字……没有 method 2 的实测就写 `not measured` 并写出原因」。

交付与这条 fallback 逐字相符（本趟读盘复核）：`README.md:81`（zh）与 `:170`（en）双语写 `not measured` 并给结构性理由（一次性会话=新进程、启动重读技能目录；watcher 只在长驻 `web` 可观察；数 fsevents 需 root）；`05-UAT.md` 的「UAT-06（技能 watch）」行结论列即 `not measured`，备注显式声明「本计划只量了启动时读取……那**不是** watch」。可量的那一半有量化记录且两次独立轮次一致：判据段 8 与判据段 15 的 base 中位 9 → 9 ms、p5 中位 279 → 279 ms、插件段 ≈270 → ≈270 ms（我复算了后一组的中位数与逐用例耗时之和，见 §Behavioral Spot-Checks）。

**路标级 SC 也容得下这条读法。** `ROADMAP.md` 的 SC-3 是「启动开销数字与技能 watch 行为**记录**入 README」——`not measured` + 结构性理由正是一条关于 watch 行为的**负记录**，不是省略。更严的措辞在需求层（「量化记录」），而需求层的所有者已把裁决写进账本。

**反事实（写在这里以免被读成静默处理）：** 若坚持「UAT-06 的量化记录必须有 watch 数字」，则 SC-3 未满足，分数回落到 **43/44**；但**状态不变**——没有 blocker，仍不是 `gaps_found`，而该读法此刻已被需求账本显式记录为「经预登记退路判定为满足」。也就是说这项裁决只移动分数，不改变 verdict 的方向。**我采信较宽读法**，理由是 fallback 在 PLAN 的 must-have 与 prohibition 里双处预登记、交付逐字符合、且 ROADMAP SC 的措辞（「记录」）本身容许负记录。

## R-5-04 复核：被测对象身份（re-executed）与 run（recorded-only）

**我亲手重跑的（可复现）：**

| 检查 | 命令 | 读数 |
|---|---|---|
| 本地发布字节 sha1 | `shasum -a 1 /tmp/uat-published/dsh-gsd-1.20.1-1.dsh022.tgz` | `69cc8c8a5482fb2d097daa8dec5f7e0f510c3007` |
| registry 权威 sha | `npm view dsh-gsd@1.20.1-1.dsh022 dist.shasum --json --registry https://registry.npmjs.org/` | `69cc8c8a5482fb2d097daa8dec5f7e0f510c3007` |
| 现下载一份再比 | `curl -o /tmp/verify-uat/pub.tgz …/dsh-gsd-1.20.1-1.dsh022.tgz` → `shasum` / `cmp` | 同 sha1；`cmp` 与 `/tmp/uat-published/…` **IDENTICAL**；4 582 650 B |
| 候选树那份是否同一物 | `shasum -a 1 /tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz` | `36eac0dc…`，**不同** ⇒ 重锚换了对象 |
| 发布面清单 | registry packument | `fileCount 958` / `unpackedSize 15962499` / 无 `deprecated` |
| 全包面比对 | tarball 解包后逐文件与工作树比 | 958 文件中 **899 逐字节相同**；59 个仅差构建期 heredoc nonce（`gsd-core/workflows/**` + `skills/gsd-quick-batch` 内嵌块），与判据段 9 的「字节不可复现」一致 |
| ①② 实际驱动的 hook 字节 | `cmp` 发布 tarball 的 `hooks/*` 与工作树构建产物 | `gsd-validate-commit.sh` / `gsd-read-injection-scanner.js` / `config/gsd-hooks.json` / `index.js` 全部 **IDENTICAL** |

**记录（本趟无法重跑，逐字声明，不冒充观测）：** 判据段 15 的 `tests 7 / pass 7 / fail 0 / skipped 0` 与 145 131 ms、以及 7 条用例的逐条耗时（828 / 94 / 10 082 / 2 395 / 95 229 / 10 396 / 26 032 ms）。该轮需要真实 `DEEPSEEK_API_KEY`、真实 `dsh` 会话与约 145 s 墙钟；本会话 env 无该键，且不读凭据面（`~/.dsh/.credentials.yaml`）。

**内部一致性旁证（我复算的）：** 上述 7 条耗时之和 = **145 056 ms**，与记录的 145 131 ms 差 75 ms（进程级开销量级）；base 组 8/11/9 的中位 = 9、p5 组 279/253/305 的中位 = 279，与判据段 15 的表格自洽。

**一处精度说明（不改变结论）：** ①② 不消费 tarball（它们 spawn 的是仓内构建出的 hook），严格说「7 条都跑在发布字节上」应读作「整套在发布字节上跑；其中 5 条直接消费 tarball，2 条驱动的是与本发布 tarball 内 hook **逐字节相同**的构建产物」。上表最后一行即为此提供了字节证据。

## D-08 / R-5-08：状态收窄已落地，deprecate 被 registry 拒绝

**D-08（re-executed）：** `gh auth status` → `Token scopes: 'gist', 'read:org', 'repo', 'workflow'`。`delete_repo` 已不在，最小四集仍在。

**R-5-08（状态 re-executed / 动作 recorded-only）：**

| 读数 | 值 | 含义 |
|---|---|---|
| `dist-tags.latest` | `1.20.1-1.dsh022` | 按名安装拿到正确版本 |
| `versions` | `['0.0.0-stage','1.20.1-1.dsh022']` | 占位符与真版本并存 |
| `0.0.0-stage` 的 `deprecated` | **absent** | 本次尝试未生效（如实记未闭合） |
| `0.0.0-stage` 元数据 | 2 文件 / 329 B / `2026-11-25T11:10:24.523Z` | 与判据段 16 逐项一致 |
| `GET /dsh-gsd/0.0.0-stage` | HTTP **200** | 只有显式 pin 才会装到它 |
| 本机 npm 登录态 | `npm whoami` → **E401** | 本会话无法重试；动作由人类用其凭据执行 |

**失败点定位（本趟读 npm 12.2.1 源码复核，不是沿用）：** `lib/commands/deprecate.js` 的 `exec()` 是「`GET /<pkg>`（`query:{write:true}`）→ `semver.satisfies` 选版本 → `log.notice('deprecating …')` → `otplease(PUT /<pkg>, body=packument)`」。`npm notice deprecating …` 已打印 ⇒ 第①步与选择成功；红在第②步的 PUT 上，且发生在 2FA 挑战之前。

**一处我不替它加戏的边界：** 客户端无法区分该 404 的两种成因 —— 「账号无写权限，npm 以 404 隐藏」与「服务端拒绝该文档写入」。判据段 16 断言「不是没权限（那会是 403）」，这一句严格说不可由客户端判定；但同一账号八分钟前刚发布过 `.dsh022`，且无论哪种成因，**同一 PUT 路径重试都不会改变结果**这一可执行结论成立。所以：事实（仍未 deprecate）**已验证**，归因（为何被拒）**保留不确定性**。

## OPEN-3 / OPEN-4 的 deferred 判断（本趟逐条核对）

| 项 | 为什么说它出界 | 我核对到的原文 |
|---|---|---|
| OPEN-3 registry 通道升级/回滚语义 | UAT-05 的判据原文就是「升级/回滚**同命令换版本号**后抽测通过」，PLAN 的 must-have 更明写「本判据证的是『换版本号这条命令的机制』，不是 registry 上的升级历史」，且这句话必须逐字出现在 `05-UAT.md` 的 UAT-05 行（在场） | 05-UAT.md UAT-05 行的备注逐字含该句 |
| OPEN-4 codegraph 同层合成 | D-10-2 的判据是「静态段四条来源 row id + `COEXIST-REAL` 五条合取」，两者都已闭合（前者本趟实跑，后者记录）；真实迁移**明确不跑** `COEXIST-DRILL`，且 MIG-04（同 profile 并存无冲突）是 Phase 4 需求，不在本 phase 的 19 个 ID 内 | 判据段 14 §10.3 的边界段；05-04-PLAN 的 must-have 第 5 条 |

因此「deferred by decision」不是把缺口改个名字：两者都不在 19 个 ID 与 D-10 五件的判据文本里。Step 9b 的 `deferred:` frontmatter 是「由后续 phase 承接」的语义，而 Phase 5 是本 milestone 最后一相，故本报告把它们记在 `residuals`，不伪造一个 `deferred` 去向。

## Goal Achievement

### ROADMAP Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UAT-01..05 全绿（干净 `DSH_HOME` 安装、skills、健康、拦截、scaffold、升级回滚） | ✓ VERIFIED | 记录：判据段 15 在**发布字节**上 7/7（含 ③④⑤⑥⑦）；实测：①② 本趟 `DSH_UAT_LIVE=1`（无凭据）`2/2 pass`；被测对象身份本趟复核（sha1 = `dist.shasum`） |
| 2 | hooks 回归（commit 校验拦截错误格式、injection 扫描落日志） | ✓ VERIFIED | 实测逐字：`① … opt-in+nonconforming=exit 2/block:CONVENTIONAL_COMMITS_VIOLATION \| opt-in+conforming=exit 0/no-block \| no-opt-in+nonconforming=exit 0/no-block \| repo hooks.community=absent`；`② injection: severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)`；两条 hook 用例 **2/2 pass、0 fail、0 skip**（只需 opt-in；套件级为 `47 / pass 42 / skip 5`） |
| 3 | 启动开销数字与技能 watch 行为记录入 README | ✓ VERIFIED（经其预登记 fallback，见 §UAT-06） | 数字双语在场且与 `05-UAT.md` 同源（9 / 279 / ≈270 ms）；watch 两语 `not measured` + 结构性理由（`:81` / `:170`）；`05-UAT.md` 同行 `not measured`；`REQUIREMENTS.md:63` 已 `[x]` 并附免责 |
| 4 | 1.0 发布 + UAT 报告 | ✓ VERIFIED | 实测 `npm view … --registry https://registry.npmjs.org/` → `latest = 1.20.1-1.dsh022`；`05-UAT.md` 与 `05-UAT-EVIDENCE.md`（判据段 1–16）在仓 |
| 5 | 对外动作执行：npm publish（registry 通道复验）+ GitHub Release + dshmarket PR | ✓ VERIFIED | 实测 registry `latest`；Release `tagName=1.20.1-1.dsh022, targetCommitish=a0529acf…, isPrerelease=false, isDraft=false`；PR #18793 `state=MERGED, mergedAt=2026-11-25T16:36:45Z, changedFiles=1, +6/−0`，两 check 均 `pass`，文件与仓内 yml **sha256 相同 + `cmp` IDENTICAL**；D-08 已收窄（R-5-08 见残余） |
| 6 | （D-10-1）`--test-concurrency=1` 三处齐备，且有一条计数断言守着它 | ✓ VERIFIED | 实测：`package.json` 的 `prepack`/`test` 与 `compat-matrix.yml:56` 各 1 处；⑮ 绿；**变异实验本趟重放**：删掉 `scripts.test` 的 flag ⇒ `✖ ⑮ … 缺 --test-concurrency=1`，`pass 15 / fail 1` |
| 7 | （D-10-2）G-4 闭合：四源 row id 两两不相交（`MISSING:` 判红）且 `COEXIST-REAL` 通过 | ✓ VERIFIED | 实测独立读 `web` 四源 patch：`[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`（5 个 id，两两不相交）；`MISSING:` 0 行与 `COEXIST-REAL PASS`（五条合取）为**记录** —— 该块要在真实 home 上跑 `--dump-config`，计划明令禁止当只读探针 |
| 8 | （D-10-3）真实 `~/.dsh` 迁移完成：旧源为零、两 profile 插件 row 各恰 1、包内 72 技能与两项字节数对齐 | ✓ VERIFIED | 实测只读：`~/.dsh/skills/gsd-*` = **0**；`gsd-core`/`hooks`/`scripts` 全 absent；`gsd-hooks.dsh.json*` 无输出；四个 profile（`web`/`headless`/`gsdtest`/`gsd-p3-release`）均 `1.20.1-1.dsh022`、`skills/gsd-*` = **72**、`gsd-health/SKILL.md` = **3587 B**、`gsd-new-project/SKILL.md` = **3856 B**、`dsh.profile.bundles` 含 `dsh-gsd` 恰 **1**、patch 两 id 各 **1** 行（写段读数见判据段 14 §2–§9，记录） |
| 9 | （D-10-4）旧仓 `pfmiles/install-gsd-dsh` 互链已推送：远端 main 前进且插入正文与 `snippet.en.md` 逐字节一致 | ✓ VERIFIED | 实测：`gh api …/commits/main` → `3af3f27f5893fbf66950551fba8ddfc9427f1106`（父 `41fcc7a`，2026-11-26T06:53:10Z）；远端 README **24346 B**，691 B 的 `snippet.en.md` 是**连续子串**（字节 2222），其后紧跟 `\n\n## Quick start`；远端 CJK **0** |
| 10 | （D-10-5）构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，连跑两次 `node build.mjs` 仍成立 | ✓ VERIFIED | 实测：本趟两次全量跑都执行了 `tests/build-smoke.test.mjs` 的真实构建（其 `execFileSync('node', ['build.mjs'], {cwd: ROOT})`），构建后 `build/assets/ui-frontend-evidence.cjs` 与 `gsd-core/bin/lib/ui-frontend-evidence.cjs` **逐字节相同**（14 223 B）；成员行 `.gsd-build-tmp` **恰 1**（`:140`），全文 mentions 4；⑨ 组绿 |

### Plan must-haves — 05-01（安装面 / 会话面 / D-10-1）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 零残留 `/tmp` 新 home 上 `plugin add` 后，**新开会话**的会话记录含 `assistant/message` 且任何 `turn/end` 递归无 `kind:error`；「有 session 目录」不作判据 | ✓ VERIFIED（记录） | 谓词实现于 `tests/uat-harness.test.mjs`（`JSON.parse` 后递归 `kind === 'error'`）；live PASS 记录（判据段 15 的 ③）。本趟无凭据，未重跑 |
| 2 | 安装前 home 零 GSD 残留且被断言；安装后 home 级 `skills/` 仍不存在；本机 profile 不作判据环境 | ✓ VERIFIED（记录 + 实测旁证） | `residue()` / `homeTree()` 在盘；判据段 15 的 ③④ 记录；本趟只读复核真实 home 旧源已归零，但判据环境仍是 `/tmp`（D-01） |
| 3 | INST-01：`add` 后 profile patch 仍 `[]`、无禁用条目；空入参边成立 | ✓ VERIFIED（口径已订正；偏离已登记） | 记录：判据段 15 的 ③（`[]`、`disabled:` 真值 0）；空入参边：计划原文「非零退出」被实测**证伪**（本 DSH 版本 `exit 0` + 初始化 profile），harness 断言「不存在第三种状态」，偏离登记在 `05-01-SUMMARY` Deviations 1。⚠ `05-01-PLAN.md:39` 仍是旧措辞（DOC-01 文本债，非缺口） |
| 4 | INST-03/05：`add` 后不重启即 `--dump-config` 两 row 各 1；`configPath` 是包内绝对路径；未安装时两行都不在 | ✓ VERIFIED（INST-05 口径已订正；偏离已登记） | 记录：判据段 15 的 ④（两 row 各 1、stderr 0 B）；`!!js` 按加载器语义求值为包内 `config/gsd-hooks.json` 且存在；计划原文「dump 里直接出现绝对路径」恒红（实测 dump 不求值 `!!js`，VALIDATION C-12 / SUMMARY Deviations 2），harness 改为求值形态（更强）。⚠ `05-01-PLAN.md:40` 旧措辞未改 |
| 5 | INST-04：`remove` 后归零（删前在场）+ 幂等边 + 空操作边 | ✓ VERIFIED（记录） | 判据段 15 的 ④：删前两 row 各 1 且在盘 → 删后 0；再 `remove` exit 1、manifest 不变、stdout 空；未装过的 profile `remove` exit 1 且无副作用 |
| 6 | INST-02：装前/装后 `DSH_HOME` 受管面哈希差集只落在 `profiles/<p>/` | ✓ VERIFIED（记录） | 判据段 15 的 ④：home 树 digest 不变、差集 `{added:[],removed:[]}`、五类受管面全 `ABSENT` |
| 7 | UAT-02/03：真实会话 scaffold 出 `PROJECT/ROADMAP/STATE`；引擎经包内绝对路径；`.env` 被硬拦且哨兵不入记录，`.txt` 阳性对照哨兵入记录 | ✓ VERIFIED（记录） | 判据段 15 的 ⑤（95 229 ms）：`.planning/` 5 文件；`decision=block`、`exitCode=2`、guard 指名 `secret-read`；`.env` 哨兵 0 次 / `.txt` 哨兵 >0 |
| 8 | D-10-1：三处齐备且 ⑮ 是逐处计数扫描（不是「套件绿所以 flag 在」） | ✓ VERIFIED | 实测：三处读盘 + ⑮ 绿 + **变异实验本趟重放**（删 flag ⇒ ⑮ 红，`pass 15 / fail 1`）；`:435` 起（`pkgSites==2` ∧ `workflowTestLines==1` ∧ 合计==3） |

### Plan must-haves — 05-02（hooks / 版本 / 开销 / 构建补丁 / 回归）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UAT-04 commit 半边三段对照（拦 / 放 / 未 opt-in 放），三段 stderr 均不含 fail-open 文案 | ✓ VERIFIED | **实测（只需 opt-in）**：三段读数逐字命中（见 SC-2）；`FAIL_OPEN_LINE` 三条 `doesNotMatch` 在盘 |
| 2 | UAT-04 injection 半边只落日志：exit 0 + `INJECTION-PATTERN` finding + 无 block | ✓ VERIFIED | **实测**：`severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)` |
| 3 | 第四条事实：本仓 `.planning/config.json` 无 `hooks.community`，commit 校验默认不生效；该事实本身是一条断言 | ✓ VERIFIED（实测） | 本趟读 `.planning/config.json` → `hooks = {"context_warnings":true}`；① 打印 `repo hooks.community=absent` |
| 4 | UAT-05：同一条 `plugin add` 换版本（`.dsh022→.dsh021→.dsh022`），version 随之变、两 row 各 1、会话谓词成立；两份 tarball 只有版本串不同 | ✓ VERIFIED（记录） | 判据段 15 的 ⑥（10 396 ms，三跳 `dump 393 lines (gsd=1, bridge=1)`，末跳 `turnEnd=1 assistant=1`）；`05-UAT.md` 的 UAT-05 行逐字含「从未也永不发布」与「证的是换版本号这条命令的机制」 |
| 5 | UAT-06 三个点用**事件时间戳**（`turn/start.time − session.createdAt`），墙钟不作数字 | ✓ VERIFIED（记录 + 实测读文档） | 判据段 8 / 15 的 ⑦：9 / 279 / ≈270 ms（n=3、单机、暖缓存）；墙钟并列记录并显式声明不可用；README 双语与 `05-UAT.md` 逐字一致 |
| 6 | UAT-06 watch 半边两种状态必须分清；无人跑 method 2 时 `05-UAT.md` 与 `README.md` 必须写 `not measured` + 结构性理由 | ✓ VERIFIED | `05-UAT.md` 行 = `not measured`；`README.md:81`/`:170` 双语同写；结构性理由齐备；可测半边（启动读取）与 watch 明确区分。见 §UAT-06 |
| 7 | D-10-5：构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，与 canonical 逐字节相同，连跑两次构建仍成立 | ✓ VERIFIED | **实测**：本趟两次全量跑都经过真实构建，跑完后 `cmp` IDENTICAL（14 223 B）、成员行 1；⑨ 组断言存在性 + 字节等值 + 成员行恰 1 |
| 8 | INST-06 是回归：`pack-contents` 与 `docs-consistency` 仍全绿，证据册记实数与 UTC 而非「已通过」 | ✓ VERIFIED（实测） | 本趟默认回路：`pack-contents` 4/4 ✔ + `docs-consistency` 16/16 ✔；判据段 7 记 `20/20` @2026-11-16T07:16:30Z；判据段 15 为其后一次独立全量 |

### Plan must-haves — 05-03（发布态 / 对外动作）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | manifest 的发布态是四处同一次提交：`private` 整键删除、`publishConfig={registry,tag}`、⑥ 发布态哨兵、⑬ 期望值加 `tag` | ✓ VERIFIED（实测） | `package.json`：`hasOwnProperty('private')` false、`publishConfig={"registry":"https://registry.npmjs.org/","tag":"latest"}`；⑥/⑬ 在默认回路绿（16/16）。发布 tarball 内同样无 `private` |
| 2 | `publishConfig.tag` 不是可选项（npm 12 对 prerelease 缺显式 tag 硬拒） | ✓ VERIFIED（机制未复跑） | 声明值在盘；dry-run 打印 `Publishing to https://registry.npmjs.org/ with tag latest`（判据段 9，记录）。npm 12 的抛错路径本趟未重放 |
| 3 | `npm publish --dry-run` 是门：打印 registry + `with tag latest`，且真的跑完 prepack | ✓ VERIFIED（记录） | 判据段 9：exit 0、prepack 跑完 build 门 + `ℹ tests 47 / pass 40`，同一次打印 `with tag latest` 与 npmjs URL |
| 4 | README 双语开销段数字与 `05-UAT.md` UAT-06 行同源逐字一致，且不破 ⑫/⑨/①② | ✓ VERIFIED（实测） | 本趟 grep：两语同为 9 / 279 / ≈270；`docs-consistency` 16/16 绿（含 ⑫ 裸名 install 串、⑨ 徽章、①② 门槛串） |
| 5 | 「当前状态 / Status」改写：(a) 点名版本、(b) 8 项 UAT 已在干净机器通过、(c) 指向 CHANGELOG、(d) 不出现 `dsh-gsd@latest` | ✓ VERIFIED（实测） | `README.md:66`（zh）/`:155`（en）：三条齐备、`grep dsh-gsd@latest` 零命中。⚠ 同句「npm 首发…随后落地」已过时（DOC-01 文案陈迹，不破本 truth） |
| 6 | 发布前抢注复查必须是 `404` 才放行 | ✓ VERIFIED（记录） | 判据段 10 放行前证据 4：`404`，对照 `@opengsd/gsd-core` `200`。该读数如今**不可重放**（名字已归我们） |
| 7 | 推送先预演后主推，权威 sha 用 `gh api …/commits/main`；预演与 main 两次 CI 均绿 | ✓ VERIFIED（记录 + 实测旁证） | 判据段 10：两次 run `success`；本趟 `gh api …/commits/a0529ac…/check-runs` → **8 条全部 `conclusion=success`** |
| 8 | 发布后每次观测读权威 registry；判据 = `latest` 等于发布版本、tarball 可解析、registry 通道在**新** `/tmp` home 上重跑 UAT-01 谓词 | ✓ VERIFIED | 本趟 `npm view` 显式带 `--registry https://registry.npmjs.org/` 得 `latest=1.20.1-1.dsh022`，tarball 可解析（本趟现下载并 `cmp`）；registry 通道安装与会话谓词为记录（判据段 11：`assistant/message` 1、`turn/end` 1、无 `kind:error`、含 `hook/invoked`/`hook/result`） |
| 9 | `approved` 与 `published` 严格两段；D-05 只在发布后仍红才可达；本轮 D-05 未触发 | ✓ VERIFIED（记录） | 判据段 11：回执行 `+ dsh-gsd@1.20.1-1.dsh022`；11:10–11:11Z 的 404 未被判红，11:18:35Z 版本与 `dist-tags.latest` 同时出现，11:57Z 起的复验已在窗口之后且未进重试循环；`.dsh022` 仍是 `latest`、未 deprecate。⚠ 证据册把回执时刻记作 `2026-11-25T11:18:35.005Z`，与「11:11Z 仍 404」并读时有约 7 分钟口径差（REC-01，记录瑕疵，不破本 truth） |
| 10 | Release tag 必须 `--target PUBLISHED_SHA`；无 `v` 前缀、`prerelease=false`、正文取 CHANGELOG | ✓ VERIFIED（实测） | `gh release view`：`tagName=1.20.1-1.dsh022`、`targetCommitish=a0529acf57e1ab01d59bd0730af0e7964d680033`、`isPrerelease=false`、`isDraft=false`、`publishedAt=2026-11-25T12:09:37Z`；该提交 8/8 check 绿 |
| 11 | dshmarket 完成判据 = PR 已开 + 对方仓四检通过（**不含合并**） | ✓ VERIFIED（实测，比收官记录更进一步） | `gh pr view 18793 --repo awesome-dsh-plugin/awesome-dsh-plugin`：`MERGED`（2026-11-25T16:36:45Z）、`changedFiles=1`、`+6/−0`、head `add-pfmiles-dsh-gsd`；`gh pr checks` → `Submission gate pass`、`check pass`；远端文件 402 B 与仓内 yml **sha256 相同 + `cmp` IDENTICAL** |

### Plan must-haves — 05-04（机器级收口）

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | D-11：机器级收口只在 `.planning/` 产物提交之后；三道闸同形态、可重跑，不用 `git log -1` | ✓ VERIFIED（记录 + 实测复核） | 判据段 12 §10 / 13 §2 / 14 §14 三次 `commit gate: PASS`；本趟：`.continue-here.md` 在 `git log --format= --name-only` 里出现 **5** 次、`git diff --quiet HEAD` 无输出、`git status --porcelain` 空。顺序本身不可重放 |
| 2 | 只读预检先于写动作且自身是判据；命中集被 `MIG_DECIDED_PROFILES` 完整覆盖；基线**重数**（`web` bridge = 2） | ✓ VERIFIED（记录 + 实测复核） | 判据段 12：`GATE` 两次跑 1→0、`GATE: PASS`（`skills=72 / profiles=4 / machine-level=CLEAN`）；本趟迁移后四 profile 的 bridge 计数全 0（与「删前 2」构成同一条判据的两端，删前读数仅存记录） |
| 3 | 3091 刷新的判据是「插件自报提供技能」：`index.js` 为 CR-01 修复后形态、两 row 各 1、provider 指向 `<plugin>/skills` | ✓ VERIFIED（实测） | 本趟读 `~/.dsh/profiles/gsdtest/node_modules/dsh-gsd/index.js:22-23` → `pluginRoot = dirname(fileURLToPath(import.meta.url))` + `join(pluginRoot,'skills')`；包内 72；provider 行记录（判据段 13 §4） |
| 4 | 真实迁移按 runbook 走完，判据全部是内容/集合/字节：`GATE: PASS` → `--uninstall` → 卸全局 CLI → registry 通道装 `web`+`headless` → 阴性对照 A–E + 内容比对同时成立 | ✓ VERIFIED（记录 + 实测终点态） | 本趟只读复核终点态（见 SC-8）；写段读数（备份 72 目录、A–E 全成立、3587/3856/72、stderr 0 B）为记录（判据段 14 §2–§9）。全局 CLI 已不在 PATH（本环境即其后果） |
| 5 | G-4：步骤 6 两段（静态四源 + CB-8b `COEXIST-REAL` 五条合取），`MISSING:` 判红；两段不可互相替代 | ✓ VERIFIED | 本趟独立读四源 row-id 集（两两不相交）；`MISSING:` 0 行与 `COEXIST-REAL PASS`（含 `required-absent:dsh-gsd` 的缺席）为**记录** —— 该块在真实 home 上跑 `--dump-config`，属计划禁令面 |
| 6 | 旧仓互链判据在**远端**：sha 前进于 `41fcc7a`，插入正文与 `snippet.en.md` 逐字节一致，`snippet.zh.md` 不推 | ✓ VERIFIED（实测） | 本趟：sha `3af3f27…`；691 B 连续子串（字节 2222）+ 尾部 `\n\n## Quick start`；远端 CJK 0 |
| 7 | `ROADMAP.md` 的 Phase 5 Requirements 行逐字含 19 个 ID，SC 含 D-10 五件 | ✓ VERIFIED（实测） | 本趟读 `.planning/ROADMAP.md:119`：19 个 ID 逐字（无区间形态）；SC 1–10 在场，SC 6–10 即 D-10-1..5 |

**Score:** 44/44 truths verified（10 ROADMAP SC + 8 + 8 + 11 + 7；0 FAILED，0 present-behavior-unverified，0 override）

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `tests/uat-harness.test.mjs` | UAT 唯一执行件，7 用例；①② 只吃 opt-in | ✓ EXISTS + SUBSTANTIVE + WIRED | 7 个顶层注册行；`hookPrereqs()`（仅 `DSH_UAT_LIVE=1`）、`resolveTgz()` 带 `reason`；本趟 ①② 实跑绿 |
| `tests/fixtures/injection-sample.md` | ② 的 payload | ✓ EXISTS + WIRED | 1 202 B；被 ② 直接消费（本趟 ② 绿） |
| `tests/build-smoke.test.mjs` | ⑨ 组（D-10-5） | ✓ EXISTS + WIRED | 本趟两次真实构建 + ⑨ 断言全绿 |
| `tests/docs-consistency.test.mjs` | ⑥ 发布态哨兵 / ⑬ `tag` / ⑮ / ⑯ | ✓ EXISTS + WIRED | 16/16 绿；⑮ `:435`、⑯ 注册行正则含 `skip|todo|only` |
| `build/assets/ui-frontend-evidence.cjs` | canonical 覆盖件 | ✓ EXISTS + SUBSTANTIVE | 14 223 B；`SKIP_DIRS` 成员 `.gsd-build-tmp` 1 行；与构建产物逐字节相同 |
| `build.mjs` | post-staging 拷贝步（不递增 `counters.copied`） | ✓ EXISTS + WIRED | `:321` 在 ⑤ 之后、⑥ 之前；`copied 76 trees` 未被撞红（build-smoke 绿） |
| `package.json` | 发布态（无 `private`、`publishConfig.tag`、两处 flag） | ✓ EXISTS | 本趟逐项读盘命中 |
| `.github/workflows/compat-matrix.yml` | 全量测试 `run:` 行带 flag，不新增步骤 | ✓ EXISTS + WIRED | `:56` 单行带 flag；`node --test` 的 `run:` 行仍 1 条（⑮ 计数口径） |
| `README.md` | 双语「启动开销」+ 状态句 + `not measured` | ✓ EXISTS | 双语数字与 `05-UAT.md` 一致；`not measured` 双语在场（`:81`/`:170`） |
| `CHANGELOG.md` | 对应版本条目（Release 正文来源） | ✓ EXISTS | ⑧ 绿（条目版本与 `pkg.version` 等值断言在默认回路通过） |
| `BUILD.md` | `:16` 活体计数 47；`:110-111` 命令与 manifest 一致 | ✓ EXISTS + WIRED | ⑯ 绿（本趟独立复算 47）；两行均带 `--test-concurrency=1` |
| npm `dsh-gsd@1.20.1-1.dsh022` | `latest` + tarball 可解析 | ✓ EXISTS（远端） | 本趟 `npm view` + 现下载 + `cmp` 实测 |
| GitHub Release `1.20.1-1.dsh022` | tag → `PUBLISHED_SHA`，`prerelease=false` | ✓ EXISTS（远端） | 本趟 `gh release view` 实测 |
| dshmarket PR #18793 | 单文件、逐字节、四检通过 | ✓ EXISTS（已合并） | 本趟 `gh pr view` + `gh pr checks` + 内容 sha256 比对 |
| 迁移后的真实 `~/.dsh` | 旧源 0、profile 插件 row 各 1、72 技能 | ✓ EXISTS（机器） | 本趟只读探针实测（4 个 profile 全部 `.dsh022` / 72 技能 / 3587/3856 B / bundles 各 1） |
| `pfmiles/install-gsd-dsh` 远端提交 | `README.md` 互链 | ✓ EXISTS（远端） | 本趟 sha + 字节比对实测 |
| `05-UAT.md` / `05-UAT-EVIDENCE.md` | 判据表 + 判据段 1–16 | ✓ EXISTS + SUBSTANTIVE | 逐行可复核；本趟抽查各段读数与现盘一致 |

**Artifacts:** 17/17 verified。

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| live 用例 ③④⑤⑥⑦ | 真实 `dsh` 会话 / tarball | `missingPrereqs()` → `t.skip`，`DSH_UAT_LIVE=1` + 凭据 + 唯一 tarball | ✓ WIRED | 默认 5 条 skip 理由逐项可读（本趟 opt-in 下只见 `DEEPSEEK_API_KEY is not in the process env`）；发布字节上的 7/7 为记录（R-5-04 已重锚） |
| ①② | `hooks/` 构建产物 | `hookPrereqs()`（仅 opt-in）→ `spawnSync('node', [HOOK_WRAPPER, …])` 喂合成 payload | ✓ WIRED | **本趟实测 2/2**；且该构建产物与发布 tarball 内 hook **逐字节相同**；缺产物时定向 `t.skip` 并指路 |
| `build.mjs` 拷贝步 | `gsd-core/bin/lib/ui-frontend-evidence.cjs` | ⑤ 捕获之后、⑥ rewrite 之前 `cp` | ✓ WIRED | 本趟两次构建后字节等值 + 成员行 1 |
| `publishConfig` | npm registry 写入 | `registry` + `tag` 同对象 | ✓ WIRED | 本趟 registry `latest` 为该版本 |
| `PUBLISHED_SHA` | Release tag | `gh release create --target` | ✓ WIRED | 本趟 `targetCommitish` 逐字相同 |
| 读侧 `--registry` | 权威 registry | 每条 `npm view` / 安装命令显式带 | ✓ WIRED | 本趟 `npm view` 复现 `latest` |

**Wiring:** 6/6 条连接成立。

### Data-Flow Trace (Level 4)

N/A —— 本 phase 无渲染型产物（交付为判据、构建资产、manifest/文档与对外发布物）。没有需要追踪的动态数据源。

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 默认全量套件（串行） | `node --test --test-concurrency=1 tests/*.test.mjs` | `ℹ tests 47 / pass 40 / fail 0 / skipped 7`，8 567 ms | ✓ PASS（与 `BUILD.md:16` 的 47 等值） |
| 只开 opt-in 的全量套件 | `DSH_UAT_LIVE=1 node --test --test-concurrency=1 tests/*.test.mjs`（无 `DEEPSEEK_API_KEY`、无 `DSH_UAT_TGZ`） | `47 / pass 42 / fail 0 / skipped 5`，7.83 s；①② 转绿，③④⑤⑥⑦ 仅因缺凭据 skip | ✓ PASS |
| UAT-04 两条 hook 判据的输出 | 同上（看 `[uat-harness]` 行） | `① … exit 2/block:CONVENTIONAL_COMMITS_VIOLATION \| exit 0/no-block \| exit 0/no-block \| repo hooks.community=absent`；`② severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)` | ✓ PASS |
| IN-02 的 set-but-missing 分支 | `DSH_UAT_LIVE=1 DSH_UAT_TGZ=/tmp/definitely-not-a-real-tarball.tgz node --test --test-concurrency=1 --test-name-pattern='UAT-01 / INST-01' tests/uat-harness.test.mjs` | skip 理由：`no single tarball: DSH_UAT_TGZ is set to /tmp/definitely-not-a-real-tarball.tgz but no such file exists (point it at a real dsh-gsd-*.tgz, or unset it to auto-resolve under /tmp/uat-tgz)`；`tests 1 / pass 0 / skipped 1` | ✓ PASS（旧文案「unset」已消失） |
| ⑯ 的计数口径（独立复算） | `grep -cE '^test(\.(skip\|todo\|only))?\('` 逐文件 | `build-smoke 2 / compat-matrix 8 / docs-consistency 16 / pack-contents 4 / rewrite-map 7 / uat-harness 7 / version 3` = **47**；`test.skip(`/`test.todo(`/`test.only(` 实际用量 0 | ✓ PASS |
| ⑮ 的扫描面（独立复算） | `node -e 'require("./package.json").scripts'` + `grep -c 'node --test' .github/workflows/compat-matrix.yml` | scripts 含 `node --test` 的恰 2 条（均带 flag）；workflow 恰 1 行（`:56`，带 flag） | ✓ PASS |
| ⑮ 的牙（变异实验，本趟重放） | `git archive HEAD` → `/tmp/verify-mut-0647317`；删 `scripts.test` 的 flag；该副本内跑 `docs-consistency` | baseline `16/16`；变异后 `✖ ⑮ … 缺 --test-concurrency=1`，`pass 15 / fail 1` | ✓ PASS（临时副本，主树未动） |
| ⑯ 的牙（变异实验，本趟重放） | 同上副本内把 `BUILD.md` 的「预期 47」改成「预期 48」 | `✖ ⑯ … 活体计数已过期`，`pass 15 / fail 1` | ✓ PASS |
| D-10-5 二次连续构建 | 两次全量跑都经过 build-smoke 的真实构建 | `cmp` canonical ↔ 产物 **IDENTICAL**（14 223 B）；`SKIP_DIRS` 成员行 `.gsd-build-tmp` 恰 1（`:140`），mentions 4 | ✓ PASS |
| 发布字节身份 | `shasum -a 1` / `npm view … dist.shasum` / 现下载 `cmp` | `69cc8c8a…` == registry `dist.shasum` == 现下载；候选树那份 `36eac0dc…` 不同 | ✓ PASS |
| 全包面比对 | tarball 958 文件逐字节 vs 工作树 | 899 相同；59 仅差构建 nonce；`hooks/*`、`config/gsd-hooks.json`、`index.js` 全 IDENTICAL | ✓ PASS |
| npm 权威 registry | `npm view dsh-gsd dist-tags.latest versions deprecated --json --registry https://registry.npmjs.org/` + 直读 packument | `latest=1.20.1-1.dsh022`；`versions=['0.0.0-stage','1.20.1-1.dsh022']`；两者 `deprecated` 均 absent；`0.0.0-stage` HTTP 200 / 2 文件 329 B | ✓ PASS（R-5-08 仍未闭合，见残余） |
| GitHub Release | `gh release view 1.20.1-1.dsh022 --repo pfmiles/dsh-gsd --json …` | `targetCommitish=a0529ac…`、`isPrerelease=false`、`isDraft=false` | ✓ PASS |
| 发布提交的 CI | `gh api repos/pfmiles/dsh-gsd/commits/a0529ac…/check-runs` | **8 条**，`conclusions={"success":8}` | ✓ PASS |
| dshmarket PR | `gh pr view 18793 --repo awesome-dsh-plugin/awesome-dsh-plugin` + `gh pr checks` | `state=MERGED`、`changedFiles=1`、`+6/−0`；`Submission gate pass`、`check pass` | ✓ PASS |
| PR 文件逐字节 | `gh api …/contents/data/plugins/pfmiles__dsh-gsd.yml` → base64 解码 → `cmp` | 402 B，`cmp` IDENTICAL；两侧 sha256 `3a69a74a…` | ✓ PASS |
| 旧仓互链 | `gh api repos/pfmiles/install-gsd-dsh/commits/main` + `contents/README.md?ref=3af3f27…` | sha `3af3f27…`；691 B 连续子串 @字节 2222；尾部 `\n\n## Quick start`；CJK 0 | ✓ PASS |
| 真实 `~/.dsh` 旧源 | `ls -d ~/.dsh/skills/gsd-*`；`[ -d ~/.dsh/{gsd-core,hooks,scripts} ]`；`ls ~/.dsh/gsd-hooks.dsh.json*` | `gsd-*` = **0**；三项 absent；glob 无输出 | ✓ PASS |
| 真实 home 四 profile | 读各 profile 的插件 `package.json` / `skills/` / 两项字节 / `dsh.profile.bundles` / bundle patch | `web`/`headless`/`gsdtest`/`gsd-p3-release` 均 `1.20.1-1.dsh022`、72 技能、3587 / 3856 B、bundles 含 `dsh-gsd` 1 次、patch 两 id 各 1 行 | ✓ PASS |
| 四源 row id（D-10-2 静态段） | 读 `web/node_modules/{dsh-gsd,@jiangzhenguo/dsh-codegraph,dsh-deja,dshmarket}/cordis.patch.yml` | `[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`，两两不相交 | ✓ PASS（`COEXIST-REAL` 为记录） |
| `gh` token scope | `gh auth status` | scopes `gist, read:org, repo, workflow`；`delete_repo` **已不在** | ✓ PASS（D-08 收窄落地） |

### Probe Execution

N/A —— 本仓没有提交 `scripts/*/tests/probe-*.sh` 形态的探针（`scripts/` 是构建产物、不入 git）。本 phase 声明的一次性门（⑮/⑯ 的变异实验、D-10-5 补丁门、三道 commit gate）以命令 + 逐字输出记录在 `05-UAT-EVIDENCE.md` 判据段 1/6/12/13/14；本趟把其中可重放的两条（⑮/⑯ 的变异实验）在 `git archive HEAD` 的临时副本里重跑（见上表），其余只复核产物。

### Decision Coverage

`check.decision-coverage-verify` → `{"skipped": false, "blocking": false, "total": 11, "honored": 11, "not_honored": [], "message": "All trackable CONTEXT.md decisions are honored by shipped artifacts."}`（exit 0）。决策覆盖不计入 status。

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `tests/uat-harness.test.mjs` | UAT-01..06 / INST-01..05 / D-10-5 | 7（opt-in 下 2 条常开；5 条凭据门） | 0 条被禁用 | 否 | Behavioral（内容/集合/字节/事件记录） | PASS（环境门，非 disabled test） |
| `tests/docs-consistency.test.mjs` | INST-06 / D-10-1 / PUB-01 / PUB-03 | 16 | 0 | 否 | Value（计数/串等值） | PASS |
| `tests/pack-contents.test.mjs` | INST-06 | 4 | 0 | 否 | Value（白名单集合） | PASS |
| `tests/build-smoke.test.mjs` | D-10-5 | 2 | 0 | 否 | Value（字节等值 + 成员行计数） | PASS |

**Disabled tests on requirements:** 0（`test.skip(`/`test.todo(`/`test.only(` 实际用量 0；扫描命中全部是注释文本）→ 无 BLOCKER。
**Circular patterns detected:** 0 —— `writeFileSync` 的 10 处调用（build-smoke 2 / pack-contents 1 / uat-harness 7）都是输入 fixture（`.env`、`notes.txt`、scratch `.planning/config.json`、tampered tarball），没有一处把被测系统的输出写成期望值；build-smoke 的期望值来自签入的 canonical 覆盖件，不是由被测系统生成。→ 无 BLOCKER。
**Insufficient assertions:** 0 —— 判据断言的是决策码/字节/行数与事件记录，不是 `exists`/类型。

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| UAT-01 | 05-01, 05-03 | 干净 `DSH_HOME` 完成 INST-01 并重启 | ✓ SATISFIED | 判据段 15 的 ③（发布字节）；registry 通道谓词（判据段 11，含 `hook/invoked`）；`REQUIREMENTS.md` `[x]` |
| UAT-02 | 05-01 | `/gsd-health` 成功；`/gsd-new-project --auto` scaffold `.planning/` | ✓ SATISFIED | 判据段 15 的 ⑤；`[x]` |
| UAT-03 | 05-01 | 真实会话 read `.env` 被拦 | ✓ SATISFIED | 判据段 15 的 ⑤（`decision=block` + 双哨兵对照）；`[x]` |
| UAT-04 | 05-02 | hooks 回归抽测（commit 校验、injection 扫描） | ✓ SATISFIED | **本趟实测 2/2**（只需 opt-in）；`[x]` |
| UAT-05 | 05-02 | 升级/回滚同命令换版本号后抽测通过 | ✓ SATISFIED（机制段） | 判据段 15 的 ⑥ + 判据段 5；`[x]`。registry 升级语义见 OPEN-3（deferred） |
| UAT-06 | 05-02, 05-03 | 启动开销与技能 watch 的量化记录 | ✓ SATISFIED（经其自身预登记 fallback） | 开销数字有（判据段 8/15 ⑦ + README 双语）；watch `not measured` + 结构性理由（README:81/:170、05-UAT.md）；**`REQUIREMENTS.md:63` 已 `[x]` 并附「不代表 watch 被观测」**；反事实见 §UAT-06 |
| INST-01 | 05-01 | 单命令安装，无前置脚本/手工 patch | ✓ SATISFIED | 判据段 15 的 ③（`[]` patch、无禁用行、空入参边不变量） |
| INST-02 | 05-01 | 安装不写 `~/.dsh` 受管文件 | ✓ SATISFIED | 判据段 15 的 ④（digest 不变、差集空） |
| INST-03 | 05-01 | 安装即注册、无重启前提 | ✓ SATISFIED | 判据段 15 的 ④（两 row 各 1） |
| INST-04 | 05-01 | 卸载后 skills/hooks/bundle 行全部消失 | ✓ SATISFIED | 判据段 15 的 ④（归零 + 幂等边 + 空操作边） |
| INST-05 | 05-01 | dump 见两 row，`!!js` 展开为包内绝对路径 | ✓ SATISFIED（求值形态） | 判据段 15 的 ④ + 判据段 2（求值得包内路径且在盘） |
| INST-06 | 05-02 | 元数据合规 | ✓ SATISFIED | 本趟 `pack-contents` 4/4 + `docs-consistency` 16/16；判据段 7 |
| PUB-01 | 05-03 | npm 首发成功 + registry 复验 | ✓ SATISFIED | 本趟 `latest=1.20.1-1.dsh022` + tarball 现下载可比；判据段 10/11 |
| PUB-03 | 05-03 | dshmarket 材料与 PR 本体 | ✓ SATISFIED | 本趟 PR `MERGED` + 两 check `pass` + 文件逐字节相同；材料半由 ⑪⑫ 守 |
| D-10-1 | 05-01 | `--test-concurrency=1` 三处 + 计数断言 | ✓ SATISFIED | 本趟三处读盘 + ⑮ 绿 + **变异实验重放** |
| D-10-2 | 05-04 | G-4 静态四源 + `COEXIST-REAL` | ✓ SATISFIED | 本趟四源集合两两不相交；`COEXIST-REAL PASS` 为记录 |
| D-10-3 | 05-04 | 真实 `~/.dsh` 迁移完成 | ✓ SATISFIED | 本趟终点态复核（旧源 0、四 profile 各 1、72 技能、3587/3856） |
| D-10-4 | 05-04 | 旧仓互链已推送且逐字节一致 | ✓ SATISFIED | 本趟远端 sha + 691 B 子串比对 |
| D-10-5 | 05-02 | 构建后 `SKIP_DIRS` 含 `.gsd-build-tmp`，经得住重建 | ✓ SATISFIED | 本趟两次构建 + 字节等值 + 成员行 1 |

**Coverage:** 19/19 satisfied（其中 UAT-06 依据其自身预登记 fallback 判为满足，理由与反事实见 §UAT-06）。**无 ORPHANED**：`ROADMAP.md:119` 的 19 个 ID 与四份 PLAN 的 `requirements` 并集逐一对上（05-01 9 个、05-02 5 个、05-03 4 个、05-04 3 个，去重 19）。

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `tests/uat-harness.test.mjs` | `hookPrereqs()` | ①② 仍只在 `DSH_UAT_LIVE=1` 时执行，而 `package.json` 与 CI 都不设该变量 | ℹ️ Info（政策选择，非 finding） | 凭据/zstd/tarball 耦合已解除（本趟：只开 opt-in 即 2/2 绿）；保留 opt-in 是 T-5-12 的防伪绿设计。要让 CI 真跑，需在 `compat-matrix.yml:56` 加 env（本趟不改 tests/CI） |
| — | — | 债务标记（TBD/FIXME/XXX） | ✅ 0 | 本 phase 改动的 11 个非 `.planning` 文件零命中；无 blocker |
| — | — | 四条 review finding（WR-01 / WR-02 / IN-01 / IN-02） | ✅ 0 open | `05-REVIEW-DISPOSITION.md`：`fixed` ×4、`open: 0`；本趟逐条复核并重跑（§Behavioral Spot-Checks） |

**Anti-patterns:** 0 open。唯一一条 ℹ️ Info 是覆盖面政策，不是新缺陷，也不使任何 must-have 失败。

### Advisory (New Scope, Unevidenced)

None —— 本趟未产生任何新的 Step 7 blocker（无论有无证据）；因此没有 advisory 条目。三条费用项（CI opt-in、`nyquist_compliant: false`、DOC-01 文本债）也都不是本次新发现的 blocker，见 `residuals`。

## Residual / Accepted Deviations（记录，不计分）

| # | Item | Evidence status | Consequence |
| - | ---- | --------------- | ----------- |
| 1 | UAT-06 watch 半边 `not measured` | 本趟复核 README 双语 + 05-UAT.md；`REQUIREMENTS.md:63` 已 `[x]` 附免责 | 判据经 fallback 满足；更严读法下 43/44，见 §UAT-06 |
| 2 | R-5-08：`0.0.0-stage` 仍未 deprecate | 本趟 registry 字段复核（absent）+ HTTP 200；尝试被 E404 拒（记录） | 不影响按名安装；仅网页端可人工处置；不在 19 ID 内 |
| 3 | OPEN-3：registry 通道升级/回滚语义未测 | deferred by decision；UAT-05 判据原文即「同命令换版本号」 | 出界，理由经本趟核对 |
| 4 | OPEN-4：codegraph 同层合成行为级证据 | 行级 + `COEXIST-REAL`（记录）已闭合 D-10-2 | 出界；`COEXIST-DRILL` 计划明确不跑 |
| 5 | PLAN-01：`05-UAT.md` 与 `verify-work` 输出同名 | 命名事实 | 下次 `verify-work` 会覆盖该表；planning 缺陷，非 phase gap |
| 6 | CI-coverage：①② 需 opt-in，CI 不设 | 三处读盘 + 本趟实测 | 防伪绿设计；要 CI 证据需加 env（未做） |
| 7 | VALIDATION-01：`nyquist_compliant: false` 保留 | 文件头已注明 G-1 在其后关闭 | 翻绿留给下次审计；不由 verifier 自证 |
| 8 | DOC-01：README 状态句过时、`05-01-PLAN:39-40` 旧措辞、`05-UAT.md` 头部写「判据段 1–15」（已有 16） | 本趟读盘 | 文案/计划文本债，不破 must-have |
| 9 | R-5-01：4 个 `/tmp/dsh-uat-*` 残留 | 本趟清点仍为 4（未新增） | 无凭据材料；未清理 |
| 10 | REC-01：判据段 11 把发布回执时刻记作 `11:18:35.005Z`，同段又写「11:11Z 仍 404 → 11:18:35Z 可读」，两读并置有约 7 分钟口径差（疑为回执时刻取的是版本可读时刻） | 本趟读判据段 11 | 属记录精度瑕疵，不改变「D-05 未触发 / `.dsh022` 为 `latest`」的结论；回执原始行未留进程副本，无法回溯订正 |

## Human Verification Required

**None（0 项）。** 上一版保留给人的四件事都已落地（见 `re_verification.human_items_resolved`），本趟没有发现新的、只能由人完成的验证项。按 `agents/gsd-verifier.md` 的基础设施/工具链判定，本 phase 的交付面是判据、字节、集合与对外发布物，不存在需要人工观察的 UI/实时行为；唯一仍可由人完成的是范围外的卫生动作（在 npmjs 网页端 deprecate `0.0.0-stage`），它不是任何 must-have 的验证项，故不进入本清单。

## Gaps Summary

**没有 must-have truth 被判 FAILED，也没有 missing/stub artifact 或未接线的 key link。** 因此不产生 `/gsd:plan-phase --gaps` 形态的 blocker 清单，也不存在需要 deferred 到后续 phase 的条目（Phase 5 是本 milestone 的最后一相）。

上一版 `human_needed` 的四条原因现在这样收口：

- **UAT-06 的记账** —— 已由需求账本落定（`[x]` + 预登记退路 +「不代表 watch 被观测」），本趟判断该读法可辩护（§UAT-06）。watch 本身仍零观测，这一点在 §UAT-06、残余表与 `behavior_unverified` 的说明三处都写明。
- **R-5-04 的重锚** —— 已完成：7 条 live 在发布字节上重跑（记录），被测对象身份本趟实跑复核（§R-5-04）。
- **D-08** —— 已完成（本趟 `gh auth status` 实测）。
- **R-5-08** —— 已尝试、被 registry 拒绝，如实记为未闭合（不占 `latest`、不影响安装，不在 19 ID 内）。
- **OPEN-3 / OPEN-4** —— deferred by decision，理由本趟逐条核对成立。

状态取 `passed` 而不是 `human_needed`：不再有任何「只能由人给出的验证结论」悬空 —— 四条决定都已落地并可复核，19 个 ID 全部 `[x]`，44 条 truth 全部有证据（实跑或记录，逐条标注）。也不是 `gaps_found`：没有任何 must-have 失败或工件缺失。**残余的十项都是已记录的接受项/出界项/记录精度项/文本债，不是未决的验证问题。**

## Verification Method & Limits（本趟实跑 vs 只来自记录）

**本趟亲自重跑（可复现）：**

- 默认全量串行套件：`47 / 40 pass / 0 fail / 7 skip`（8 567 ms）。
- `DSH_UAT_LIVE=1` 全量（**无**凭据、**无** `DSH_UAT_TGZ`）：`47 / 42 pass / 0 fail / 5 skip`；①② 转绿且输出逐字符合 must-have。
- IN-02 的 set-but-missing 分支（skip 理由逐字指名该路径）。
- ⑯ 的独立计数（逐文件 2/8/16/4/7/7/3 = 47）与 ⑮ 的扫描面（scripts 2 + workflow 1 = 3）。
- ⑮ / ⑯ 的**变异实验**（`git archive HEAD` 临时副本内：删 flag ⇒ ⑮ 红；改计数 ⇒ ⑯ 红；baseline 16/16；副本已删，主树未动）。
- 两次真实构建后的 canonical ↔ 产物字节等值与 `SKIP_DIRS` 成员行。
- 发布字节身份链：本地 sha1、registry `dist.shasum`、现下载 `cmp`、候选树 tarball 的 sha1 对照、958 文件全包面比对（899 同 / 59 仅 nonce）、发布 tarball 内 hook/config/index.js 与工作树 `cmp`。
- `npm view`（权威 registry）+ 直读 packument + `GET /dsh-gsd/0.0.0-stage` 的 HTTP 码；npm 12.2.1 `deprecate.js` 源码。
- `gh auth status`（scopes）、`gh release view`、发布提交 8 条 check-run、`gh pr view` / `gh pr checks`、PR 文件逐字节、旧仓 main sha 与 691 B 子串（远端字节）。
- 真实 `~/.dsh` 与四个 profile 的只读探针（旧源、版本、72 技能、3587/3856 B、bundles、patch 两 id）。
- 四源 `cordis.patch.yml` 的 row-id 集合。
- `decision-coverage-verify`（11/11）、`verification.fingerprint`（21 文件 / `v4:sha256:f222cd65…`）、`git status --porcelain` 空、`05-REVIEW-DISPOSITION.md` 的 `open: 0`。

**只来自记录、本趟无法重跑（逐条声明，不冒充观测）：**

- **判据段 15 的 live 7/7 与 145 131 ms**（以及 7 条用例的逐条耗时）—— 需要真实 `DEEPSEEK_API_KEY`、真实 `dsh` 会话与约 145 s 墙钟；本会话不读凭据面。被测对象身份与本文件其余可观测量已由本趟独立复核。
- live 用例 ③④⑤⑥⑦ 各自的历史读数（判据段 1/3/5/8/11）与 `pass 7 / skipped 0`（2026-11-16T07:16:23Z）。
- `npm publish` 的人类 OTP 动作与回执、传播窗口读数、registry 通道装出的 958 文件与 tarball 的逐字节比对。
- dry-run 的 `with tag latest` 行、npm 12 prerelease tag guard 的抛错机制、发布前 404 抢注复查（如今不可重放）。
- 两次 CI run（预演/主推）的 `success`（我复核的是同一提交上的 8 条 check run）。
- 真实迁移的写段（`--uninstall` 前 72 技能备份、A–E 阴性对照的「卸载后立刻」时点、registry 通道两条 `add` 的逐字输出）。
- `COEXIST-REAL` 五条合取（需在真实 home 上 `--dump-config`；计划的禁令把它列为不得当只读探针）。
- 3091 刷新后新会话里的 `[dsh-gsd] skills provider:` 行（我复核的是磁盘上的 `index.js` 形态与 72 项，未起新会话）。
- `gsd-p3-release` 的重装动作本身（2026-11-26 由他人执行）；我只复核了终点态。
- `gh auth refresh --remove-scopes delete_repo` 与 `npm deprecate` 两次人类动作本身；我复核的是它们的结果态（scopes / registry 字段）。

**覆盖指纹：** `verification.fingerprint` 的 21 个受覆盖文件（含 4 份 PLAN、4 份 SUMMARY 与本 phase 的两份证据册）与 digest 见 frontmatter；本报告自身不计入，且计算后未再改动任何受覆盖文件（`git status --porcelain` 为空）。

---

_Verified: 2026-11-26T13:20:12Z_
_Verifier: DeepSeek Harness (gsd-verifier)_
_Score: 44/44 must-haves verified · behavior_unverified: 0 · overrides_applied: 0 · open review findings: 0_