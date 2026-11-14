---
phase: 04-migration-coexistence
verified: 2026-11-14T06:53:54Z
status: gaps_found
score: 39/41 must-haves verified
covered_files: [
  ".planning/phases/04-migration-coexistence/04-01-PLAN.md",
  ".planning/phases/04-migration-coexistence/04-01-SUMMARY.md",
  ".planning/phases/04-migration-coexistence/04-02-PLAN.md",
  ".planning/phases/04-migration-coexistence/04-02-SUMMARY.md",
  ".planning/phases/04-migration-coexistence/04-03-PLAN.md",
  ".planning/phases/04-migration-coexistence/04-03-SUMMARY.md",
  ".planning/phases/04-migration-coexistence/04-04-PLAN.md",
  ".planning/phases/04-migration-coexistence/04-04-SUMMARY.md",
  "BUILD.md",
  "README.md",
  "docs/MIGRATION.md",
  "docs/oldrepo-link/README.md",
  "docs/oldrepo-link/pr.md",
  "docs/oldrepo-link/snippet.en.md",
  "docs/oldrepo-link/snippet.zh.md",
  "tests/docs-consistency.test.mjs"
]
covered_digest: "v3:sha256:695d38cfd1d0c4f1119c23d089f5f65c17c379a0e775b70b2287809f40df6cee"
behavior_unverified: 0
overrides_applied: 0
phase_type: documentation+verification
head: "02cb9a5"
decision_coverage: "11/13 完全落地；D-03 与 D-07 部分（同一缺陷：卸载前缺面 1 技能探针）"
review_findings_summary: "7 findings，7 条 open；本趟独立裁定：WR-01 成立（升级为完成级缺口）、WR-02 成立（升级为完成级缺口）、WR-03 成立（非阻塞但须修）、IN-01/IN-02/IN-03/IN-04 均成立（非阻塞）"
validation_gaps_summary: "G-1/G-2/G-3 = 追踪项（可自动化断言未进套件），G-4 = 追踪项（已登记移交 Phase 5，但 ROADMAP P5 未点名）"
prohibition_audit: "25 条 must-NOT 逐条抽查，honored 24；『§① 步骤 0–5 不被改写』由 04-04 提交的 118 增 / 0 删证明"
gaps:
  - truth: "04-01-T4 / D-03：卸载前硬门覆盖「两个面」（面 1 技能 + 面 2 hooks），命中即中止"
    status: partial
    reason: "步骤 1 的正文声明「判据是两个面…两面都要」（zh :46 / en :340），但紧随其后的块只有面 2a（bridge 块）、面 2b（gsd-hooks-bridge 行数）与机器级一面，没有任何一行探测 `$DSH_HOME/skills/gsd-*`。面 1 的命令只出现在卸载之后的步骤 5 项 A（:122 / en :417）——那时 `--uninstall` 已跑完，双源已在场，只能记录不能中止。D-03 的第二个触发条件（『或仍依赖 ~/.dsh/skills 下的 gsd-*』）因此没有卸载前探测器，D-07 的『双面扫』只落地一面。演练不会暴露它：临时 home 新建时 skills 必然为『有』，演练脚本的 hits 也只来自 bridge 块。"
    artifacts:
      - path: "docs/MIGRATION.md"
        issue: "zh :46 承诺两个面，块 :48-61 只实现面 2a/2b + 机器级；en :340 与 :341-355 同构。面 1 唯一命令在 :122（卸载后）"
    missing:
      - "二择一：①在步骤 1 块内补一条卸载前的面 1 探针（与 :122 同形、判据相反），或 ②把 :46 改写成「面 2 的两个子面 + 机器级一面」，并明说面 1 只能作步骤 5 的阴性对照、D-03 的『仍依赖 skills』一项由人工确认承担"
      - "en 半同构修改"
  - truth: "04-04-T5 / MIG-04：步骤 6 的「可复制的集合断言命令」在文档自己指定的真实迁移路径上可判为通过"
    status: partial
    reason: "步骤 6 的块首注释只让读者把第一行换成 `export DSH_HOME=\"$HOME/.dsh\"`（zh :194 / en :489），而 :219 / en :513 明确要求「真实 `~/.dsh` 的并存复验要在迁移时（步骤 4 之后）用同一组命令重跑一次」。真实路径上 `H0` 是在步骤 4 已装好 `dsh-gsd` 之后取的，三条 `add` 均为 no-op（`dsh-gsd` 同版本、`dsh-deja` / `dshmarket` 由 :173-175 预设已在装），于是 `H1 − H0 = 0`，判据 ② `H1 > H0`（:206）在完全健康的 home 上必然为假——文档自己的自检在目标场景里必然报红。反方向也是坏的：若真实 profile 里本来没有 deja/dshmarket，`H1 = H0 + 2` 会以「新增了两层」这个与命题无关的理由通过。DRILL-3 已把机制写死（`27 = 24 + 3`，增长量 = 新装 bundle 数），而真实迁移的新装数是 0。"
    artifacts:
      - path: "docs/MIGRATION.md"
        issue: "zh :194 / :206 / :219 与 en :489 / :500 / :513：同一组命令被要求兼任「演练形态」与「真实迁移形态」，两种形态的新装数不同"
    missing:
      - "真实迁移形态改为「确认三者在册」+ `H1 >= H0`（标签出现、四 id 各 1、`uniq -d` 空三条不变）；或把 `H0` 的取法明确挪到步骤 4 之前并写明"
      - "en 半同构修改；同时消除:145 的 `H1 = H0 + 1` 与 :206 的 `H1 > H0` 两个口径在同一文档里的分歧"
deferred:
  - truth: "@jiangzhenguo/dsh-codegraph 的同层合成（动态）验证"
    addressed_in: "Phase 5"
    evidence: "DRILL-3『这证不了什么』第一条 + §① :219 点名它是真实迁移时的第一复验对象；04-VALIDATION.md 的 G-4 标 Escalated → Phase 5。⚠ 注意：ROADMAP Phase 5 的 Success Criteria（UAT-01..05 全绿 / hooks 回归 / 启动开销 / 1.0 发布 / 对外动作）未点名该复验对象，交接只存在于 phase 4 的产物内，Phase 5 规划时须显式认领"
  - truth: "真实 ~/.dsh 的整体迁移"
    addressed_in: "Phase 5"
    evidence: "D-02；ROADMAP P5 SC-1『UAT-01..05 全绿（干净 DSH_HOME 安装…升级回滚）』；04-DRILL-EVIDENCE.md 的『本轮未覆盖』第 3 条"
  - truth: "旧仓 pfmiles/install-gsd-dsh 的互链提交与推送"
    addressed_in: "Phase 5"
    evidence: "D-08/D-09；docs/oldrepo-link/README.md『时点 Phase 5』；ROADMAP P5 SC-5『对外动作执行』"
---

# Phase 4: 迁移与并存 Verification Report

**Phase Goal:** 脚本部署用户的无痛迁移，两种方式可解释可回退。
**Verified:** 2026-11-14T06:53:54Z（HEAD `02cb9a5`，分支 `main`）
**Status:** gaps_found
**Re-verification:** No — 本 phase 无前一份 VERIFICATION.md（Step 0：目录内无 `04-VERIFICATION.md`），本趟为初次验证，41 条 truth 全部从零重推

## 验证基调（honest-verifier）

本趟把证据分三档，每条 truth 都注明来源：

1. **本趟亲自执行 / 直读**：`node --test --test-concurrency=1 tests/*.test.mjs` → **tests 38 / pass 38 / fail 0**（串行一次，未用并行形态）；围栏感知的 `docs/MIGRATION.md` 形状复算（H1=2、两半 `##` 各 3、`###` 各 15、独占 `---` 恰 1、en 半 CJK=0、`/Users/`=0、naive `^# `=30）；`§②/§③/步骤 6` 的结构断言（四层首列、五条逐字症状、`uniq -d`、`codegraph`、边界词、`5<6<回退` 顺序）自写脚本复算；四个 bundle 的 row id 集合**独立重算**（`gsd gsd-hooks-bridge` / `dsh-codegraph` / `deja` / `dsh-market`，并集 5、无重复）；包内 `skills/` 的 3587 / 3856 / 72 与 `gsd-core/VERSION`=1.20.1 直读；`build/assets/pins.json` sha256 与 `git diff`；旧仓三读（HEAD / 工作树 / remote）；`/tmp` 残留与 `*.tgz` 计数；7 份 planning 文件与 9 个交付文件全文直读。
2. **记录在案、输入物本趟已证未变**：DRILL-1 / DRILL-2 / DRILL-3 三段演练（真实装、真实卸、boot）**本趟未重跑**——它们要联网安装两个 `[SUS]` 包、跑 `prepack`（全量 build + 全量测试），且编排器已把演练残留删除。判定方式是：证据册的逐字读数 + 本趟对**可复算输入**（包内技能字节数、引擎版本、pins sha、钩子配置 5 事件 / 14 matcher）的独立复核 + 交付物内部一致性对账。哪些 truth 属这一档，在表中逐条标注「证据册」。
3. **不采信 SUMMARY 的结论句**：SUMMARY 只用于定位证据；每条判定都回到文件内容、机器输出或证据册原文。

**一处与编排器口径的差异（如实记录）**：编排器给的前提是「工作树干净」，实际 `git status --porcelain` 有**一行未跟踪文件** `?? .planning/phases/04-migration-coexistence/04-REVIEW.md`——`02cb9a5` 只提交了 `04-REVIEW-DISPOSITION.md`，被引用的 `04-REVIEW.md` 本身从未入库。不影响任何 truth（该文件是审查输入，不是交付物），但作为流程事实记在 §未计分观察 里。

## Goal Achievement

### Must-have 来源与覆盖（无缩面证明）

- **ROADMAP Success Criteria（3 条，非可协商）** → 全部进入下表（#1–#3）。
- **PLAN frontmatter truths（38 条）**：04-01 十一条、04-02 九条、04-03 十条、04-04 八条 → 逐条保留，**无一条被合并、丢弃或降级**（#4–#41）。
- **跨 phase 移交项**：`HOOK-05`（不在 ROADMAP 的 Requirements 行，但 02/03-CONTEXT 的 `<deferred>` 与 04-03 的 `<objective>` 均承接）由 04-03 的十条 truth 完整覆盖，见 §Requirements Coverage。
- 合计 **41 条 truth**，判定分布于下表。

### Observable Truths（SC + 04-01）

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 1 | **SC-1** | runbook 全流程在验证机走通（uninstall → add → 复验） | ✓ VERIFIED | 证据册 DRILL-1：旧 `72/3084/3195` + `hits=1` → 卸载后 `0/absent/ABSENT` → 包内 `3587/3856/72` → dump `stderr 0 B`、标头 `24→25`、两 row 各 1。包内三项本趟直读复算一致 |
| 2 | **SC-2** | 旧脚本 README 顶部互链 + 定位重述为保底/离线 | ✓ VERIFIED | 本仓 `README.md:11`（zh）/`:85`（en）各一行 blockquote 入口，本趟直读；`docs/MIGRATION.md:246` 把「批量铺 / 完全离线 / 诊断输出」写成留在旧脚本的三条理由；`docs/oldrepo-link/` 四件备料齐备，旧仓本趟复核仍 `41fcc7a` / 工作树 0 行 / remote 未变 |
| 3 | **SC-3** | 同 profile 与 codegraph/deja/dshmarket 并存无冲突实测 | ✓ VERIFIED（覆盖面按计划裁定） | 静态段本趟独立重算：四来源五 id 两两不相交（`dsh-codegraph` 取自**真实已装物**）；动态段证据册 `bundles=5 / stderr 0 / headers 24→27 / 四 id 各 1 / uniq -d 0 行 / COEXIST-DRILL PASS`。**codegraph 的「同层合成」未被动态验证**——此事实已由计划显式裁定并登记（见 §Deferred 与 G-4），计划同时禁止把它写成「已验证并存」 |
| 4 | 04-01-T1 | 双语同构（zh → 独占 `---` → en、各一 H1、en 零 CJK）；§① 给出 0-A / 0-B 两个迁移场；每个命令块首行 `export DSH_HOME=` + 回显 | ✓ VERIFIED（带偏离注记） | 本趟复算：H1=2、第 292 行前为 zh、en CJK=0、独占 `---` 恰 1（第 293 行）；0-A `:21` 用 `mktemp -d /tmp/dsh-mig-XXXXXXX` + `:23` 临时 `npm_config_prefix`，0-B `:38` 用 `$HOME/.dsh` 且紧邻 `:33` 指向步骤 1；`export DSH_HOME=` 全文 22 处。**偏离**：步骤 6 的两个零安装只读块（zh `:169` / en `:463`）首行是 `node -e '`，使正文 `:14` 的「每个可粘贴块」全称句不再成立 → 记为 IN-01（追踪项，非本 truth 的失败：两块零写入，落在 04-SECURITY T-4-01 的「真实 home 只允许只读探针」内，且 04-SECURITY 明确记录了这条形态偏离） |
| 5 | 04-01-T2 | 文件头警告是**有条件**的，自带出口指向 0-B 与步骤 1 | ✓ VERIFIED | `:7-8`：条件句「未经逐 profile 裁决，不要在真实 `~/.dsh` 上跑 `--uninstall`」+ 明写先走步骤 1、再从 0-B 开始；不是无条件禁令 |
| 6 | 04-01-T3 | 演练复现「脚本装过的人」初态，且**两条前提由演练自己断言**（20 字符 home + GSD 1.16.0） | ✓ VERIFIED（证据册，T-4-18 达标） | DRILL-1 第 6 行同一轮先记 `core_VERSION=1.16.0` + `runtime_identity=1.16.0`（卸载前，17:35:59Z），第 7 行才记 `old_health_bytes=3084` / `old_new_project_bytes=3195` 并同轮记 `home_len=20`；`$DSH_HOME` 字面出现次数 3 / 7 亦同轮量得。**前提与数字同轮成立**，不是抄来的常量 |
| 7 | 04-01-T4 | **D-03 硬门在 `--uninstall` 之前执行**（hits ≥ 1 先被观测，文档写明「命中即中止」） | ✗ FAILED（partial） | 门的位置对（步骤 1 在步骤 2 之前，DRILL-1 亦先 `hits=1` 再卸载）且文档 `:46`/`:33` 写「命中即中止」；但「D-03 硬门」按 D-03 的定义是**两个面**：面 1（技能）在块内**不存在**，`$DSH_HOME/skills/gsd-*` 的探测只在卸载后的 `:122`。见 §Gaps 与 §对 WR-01 的裁定 |
| 8 | 04-01-T5 | 卸载后阴性对照（技能 0 / 无 bridge / 三受管目录 absent / 无 hooks json）+ 机器级一面区分 `ABSENT` 与 `PRESENT` | ✓ VERIFIED | 文档 `:121-136` 五项 A–E 齐备且机器级分两支；DRILL-1 第 11 行记 `old_skills=0 / bridge_hits=0 / sandbox_hits=0 / 三目录 absent / ABSENT`，并注明「`ABSENT` 是它自己的状态，不是 0 计数」 |
| 9 | 04-01-T6 | 迁移后内容比对成立（`3587` / `3856` / `72`，与旧源 `3084/3195` 不同 ⇒ 新源是真源） | ✓ VERIFIED | 本趟直读 `skills/gsd-health/SKILL.md`=3587 B、`skills/gsd-new-project/SKILL.md`=3856 B、`ls -d skills/gsd-*`=72；DRILL-1 记录旧源 3084 / 3195 且两侧 sha256 前 16 位不同 |
| 10 | 04-01-T7 | 迁移后 dump 判据同时成立：`stderr` 0、同一 home `H1 = H0 + 1`（24→25）、`^# == dsh-gsd` 出现、两 row 各 1；**不**拿标头数与 bundles 长度比、不把 exit code 当信号 | ✓ VERIFIED（证据册） | 文档 `:145-153` 与 `:279` 两处明写伪不变量禁令；DRILL-1 记 `headers before=24 after=25 delta=1` / `stderr 0 B` / `rows gsd=1 gsd-hooks-bridge=1` / 标签分布 12+11+1+1。注：0-B 读者未被交代「卸载后、装包前取 H0」，是可用性弱点，与 WR-02 同源（见 §未计分观察） |
| 11 | 04-01-T8 | 演练日志 `allow-version` / `Exact-version exemption: active` 出现 0 次；`--force` 未使用 | ✓ VERIFIED（证据册） | DRILL-1 第 16 行记三个日志合计 **0** 次；DRILL-2 / DRILL-3 各记 0；文档本趟 `grep -c 'legacy-peer-deps'` = 0 |
| 12 | 04-01-T9 | 真实 `~/.dsh` 零写入（profiles 清单与 mtime 不变、`npm ls -g` 仍 1.16.0） | ✓ VERIFIED | DRILL-1 第 17 行：`~/.dsh/profiles` 清单与各 `package.json` 的 mtime `diff -q` 无差异，并如实把一次 `npm ls -g` 的采样口径错误（临时 prefix 未 unset）标为「不得充当证据」后复测；编排器另行确认 mtime/size 前后一致；本趟 `/tmp/dsh-mig-*` 等残留 = **0** |
| 13 | 04-01-T10 | README 两半各恰一行 `./docs/MIGRATION.md` blockquote 入口；`# dsh-gsd` 仍 2、徽章仍 2、裸名 install 整行仍 2；切片点未位移 | ✓ VERIFIED | 本趟：`:11` / `:85` 各一行且以 `>` 开头；`grep -c '^# dsh-gsd'`=2、`shields.io`=2；⑫ 由套件内的既有断言在本趟 38/38 里通过。原真值写「13/13」，实际已按计划推进到 **14/14**（同判据的超集） |
| 14 | 04-01-T11 | 证据册每行为 `(操作, UTC, 输出要点)` 三元组；基线行同时记两条前提读数与 before/after 标头；机器级一面记 `ABSENT`/`PRESENT`；负向观测显式标注；每个 manual-only 判据后有「这证不了什么」 | ✓ VERIFIED | 本趟全文直读：DRILL-1 19 行、DRILL-2 两段、DRILL-3 三段，全部三元组；两条前提读数在 L36-37；`ABSENT`/`PRESENT` 分支在 L42；两处负向观测（YAML 1877 B、`NOT FOUND` 采样错误）均标注「不得充当通过形态」；`这证不了什么` 出现 4 次（DRILL-1 / DRILL-2 / DRILL-3 + 未覆盖） |

### Observable Truths（04-02）

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 15 | 04-02-T1 | §② 两半各有第 2 个 `##`，其下各恰 3 个 `###`，顺序为「选型建议 → 对照表 → 共同限制」 | ✓ VERIFIED | zh `:240` 下 `:244`/`:250`/`:260`；en `:530` 下 `Which one should you use` / `Comparison` / `Shared limit`（本趟 awk 直读）；两半 `##` 各 3 |
| 16 | 04-02-T2 | zh 表头逐字 `\| 轴 \| 旧脚本 \| 插件 \| 迁移影响 \|`；en 同构四列；两半数据行各 3、轴序一致 | ✓ VERIFIED | zh `:252-256`、en `\| Axis \| Shell script \| Plugin \| Migration impact \|`；三行轴序 全局 CLI → `GSD_PROFILE` → hooks 归属，两半一致 |
| 17 | 04-02-T3 | 「共同限制」是独立 `###` 而非表行；点名 5 类事件并明说两种方式都受此限；任何以 `\|` 开头的行不含小节标题词 | ✓ VERIFIED | `:260-264`（en `:554`）；本趟脚本：该小节起 8 行内以 `\|` 开头的行数 = **0**；五个事件名两半均为行内代码（`:262`），`PreCompact`/`FileChanged`/statusline 明写没有 |
| 18 | 04-02-T4 | 三轴每一格对上真源（1.16.0/1.20.1 与绝对路径 adapter；`GSD_PROFILE` 无对应物、影响写成「多得」；hooks 不是事件差异而是归属） | ✓ VERIFIED | 本趟直读：`package.json` version `1.20.1-1.dsh022`、`gsd-core/VERSION`=1.20.1、`gsd-tools.cjs runtime-identity`=1.20.1；`config/gsd-hooks.json` 本趟算出 **5 事件 / 14 matcher**；`cordis.patch.yml:23-24` 的 `!!js ` `createRequire(baseUrl)` 自定位逐字在；`:255` 写「多得技能，不是缩水」 |
| 19 | 04-02-T5 | `docs/oldrepo-link/` 四文件齐备且职责分离（说明 / 英文正式件 / 中文备而不用 / PR 描述），照 `docs/dshmarket/` 先例、首行声明不随包发布 | ✓ VERIFIED | 四文件均在（3579 / 691 / 889 / 1235 B）；`README.md:1-3` 首段即声明「不随 npm 包发布」；`snippet.zh.md` 首行为 HTML 注释「本片段当前无落点」；`pr.md` 首行 `title: …`；`docs/dshmarket/README.md` 作为先例仍在 |
| 20 | 04-02-T6 | 插入位置用章节锚点（`## Quick start` 之前），基准 sha `41fcc7a` 显式标为「观测时的 HEAD，不是 patch 基准」；四文件 `/Users/` 出现 0 次 | ✓ VERIFIED | `README.md:11` 逐字含此限定；旧仓本趟 `grep -n '^## '`：`## Quick start` 在第 35 行，其上一行确为独占 `---`；四文件 `/Users/` 计数各 0（本趟 grep） |
| 21 | 04-02-T7 | `snippet.en.md` 不含 `dsh-gsd@` 任何形态；它是唯一会被推送的正式件，中文片段备而不用已声明 | ✓ VERIFIED | 本趟 `grep -c 'dsh-gsd@' snippet.en.md` = **0**；片段以 `dsh plugin --profile web add dsh-gsd` 无版本形态给出；`snippet.zh.md` 首行即「备而不用」声明 |
| 22 | 04-02-T8 | `pfmiles/install-gsd-dsh` 一字未变：HEAD `41fcc7a`、工作树干净、remote 未变 | ✓ VERIFIED | 本趟三读：`rev-parse --short HEAD`=41fcc7a、`status --porcelain`=0 行、`remote get-url origin`=`git@github.com:pfmiles/install-gsd-dsh.git` |
| 23 | 04-02-T9 | `docs/` 仍不在 `files`（九项），`ALLOWED_TOP_LEVEL` 未改；`docs-consistency` 通过 | ✓ VERIFIED | 本趟 `files.length`=9 且不含 `docs`；`tests/pack-contents.test.mjs` 在本趟全量串行里通过；`docs-consistency` = 14 条 `test(` 且 14/14（计划的「13/13」已被 04-03 按计划推进） |

### Observable Truths（04-03，含 HOOK-05）

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 24 | 04-03-T1 | 静态 pin 门有牙且可复原：篡改 → exit 2 + 逐字失配串；复原 → exit 0；注入不留痕 | ✓ VERIFIED（证据册；本轮未重跑注入） | DRILL-2 首段三行：`EXIT=0` → `EXIT=2` + 167 B 逐字（含 em dash 与单引号）→ `EXIT=0` 且 sha256 回到 `45c643ea…a2bb`、`git status` 空。本趟：sha256 = `45c643ea3711e998445369c61cf2958c1ea63bc6062a9e143f28e1d5c494a2bb`（逐字节相同）、`git diff` 空；`check-pins.mjs:159` 的文案与证据册逐字一致；`lines.021.peer` 未被动 |
| 25 | 04-03-T2 | 运行时 ③ 层现场复现：`EXIT=0`、`H1 = H0 − 1`（25→24）、`N1 = N0 − 12`（1255→1243）、标签消失、`- id: gsd` 0 行、stderr 恰 1 行含 `dsh: skipping profile bundle` | ✓ VERIFIED（证据册） | DRILL-2 运行时段逐条记录：`injected: EXIT=0 headers=24 lines=1243 gsd_rows=0 skip_lines=1 gsd_label=0`，stderr 526 B 逐字；复原后 `H2=H0=25` / `N2=N0=1255` / stderr 0 B。判据是同一 home 的前后关系，与 T-4-17 的伪不变量禁令一致 |
| 26 | 04-03-T3 | ③′ 层要么实测到、要么显式 `NOT REPRODUCED:`（文档与证据册都要） | ✓ VERIFIED | 文档 `:277` 以 `MEASURED:` 开头整段贴 boot 逐字；DRILL-2 记 `ROWLEVEL MEASURED:` 原文并同时记下随后的 `MISSING_CREDENTIAL`（不夸大成「完整会话可启动」）。虚假「已知会…」零处 |
| 27 | 04-03-T4 | §③ 四层症状表两半各 4 数据行、首列逐字 `① preflight` / `② post-install` / `③ load` / `③′ load`，五条逐字症状两半都在 | ✓ VERIFIED | 本趟脚本：两半均 4 行、首列逐字；五条串两半命中数均 `11111` |
| 28 | 04-03-T5 | pin 对齐策略与其边界写清：`pins.json` 是唯一真源、`check-pins` 步骤 (j) 逐字比较、该 peer 只被它消费、`engines.dsh` 在场时 DSH 不读 `peerDependencies` | ✓ VERIFIED | `:283-285`（en 同构）：明写「只会让 CI 变红，产不出任何运行时症状」；本趟读 `check-pins.mjs:155-159` 确认比较逻辑与唯一消费点 |
| 29 | 04-03-T6 | 修复列三条且按推荐顺序；`allow-version` 是精确二元组豁免；**绝不** `--force`；两半都含这两个词 | ✓ VERIFIED | `:289-291`（en :577-579）：① 装匹配版本 ② `allow-version` 精确二元组 ③「绝不 `--force`」；两半 `allow-version` / `--force` 均在 |
| 30 | 04-03-T7 | ⑭ 落地并真的能判：追加 1 条 `test(`、围栏感知、复用 `readmeZh`/`readmeEn`、两 H1、每半 3 个 `##`、zh 有 CJK / en 零 CJK | ✓ VERIFIED | `tests/docs-consistency.test.mjs:339-395` 直读：注释 + 实现均围栏感知（`/^\s*\x60{3}/`），用 `h1s[1].i` 切半（**不是** `---`，这是关键正确选择），四条断言齐全；①–⑬ 未改（`git diff 7de4010 HEAD` = `60 0`，纯追加） |
| 31 | 04-03-T8 | `docs-consistency` 13→14 并通过；全量 37→38；`BUILD.md:16` 同一提交改成实测 `预期 38/38` | ✓ VERIFIED | 本趟：`grep -c '^test('` 逐文件 2+8+14+4+7+3=**38**；`docs-consistency`=14；`BUILD.md:16` 含 `预期 38/38` 恰 1 处、`37/37` 0 处；`git diff` 对 BUILD.md = `1 1` |
| 32 | 04-03-T9 | 全量串行一次的输出为 `ℹ tests 38` / `ℹ fail 0` / `ℹ cancelled 0` | ✓ VERIFIED | 本趟实跑 `node --test --test-concurrency=1 tests/*.test.mjs`：`tests 38 / pass 38 / fail 0 / cancelled 0`（7516 ms） |
| 33 | 04-03-T10 | `build/assets/pins.json` 与 `package.json` 在本计划结束时与 HEAD 逐字一致 | ✓ VERIFIED | 本趟：pins sha256 = 证据册「复原后」值；`git status` 对两文件为空。`package.json` 最后一次改动仍是 phase 3 的提交（04-SECURITY 已记，本轮 `git diff` 0 行） |

### Observable Truths（04-04）

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 34 | 04-04-T1 | 静态段：四来源五 id、两两不相交、并集 5、无重复；只读文件、不对真实 profile 跑 `--dump-config` | ✓ VERIFIED（本趟独立重算） | 本趟 `node -e` 直读四个 `cordis.patch.yml`：`dsh-gsd ["gsd","gsd-hooks-bridge"]` / `codegraph ["dsh-codegraph"]` / `deja ["deja"]` / `dshmarket ["dsh-market"]`，并集 5、无重复；全程 `readFileSync`，未对真实 profile 跑 dump |
| 35 | 04-04-T2 | 动态段：临时 home 装三者后 `stderr` 0 字节、`H1 > H0`（24→27）且三包标签出现、四 id 各 1、`uniq -d` 空；且该段本身是可运行的 `automated` bash 块 | ✓ VERIFIED（证据册；本轮未重跑安装） | DRILL-3 动态表逐项：`bundles=5` / `stderr_bytes=0` / `headers=24->27` / 三包标签各 1 / 四 id 各 1 / `uniq -d` 0 行 / 逐字 `COEXIST-DRILL bundles=5 headers=24->27 rows=… env=temp-home`（本趟确认该串在证据册内可被 `includes` 命中）；计划侧确为可执行 bash 块（04-04-PLAN.md Task 2 的 `<automated>`，含 `bail`/`COEXIST-DRILL PASS`） |
| 36 | 04-04-T3 | 「无冲突」判据是集合断言而不是「能装能跑」；同名 row id 静默双行的机制被写明 | ✓ VERIFIED | 文档 `:164`/`:217` 与 DRILL-3 均写明「DSH 对同名 row id 没有任何冲突仲裁…`add` exit 0、零 warning」；四条合取在文档与计划里同源 |
| 37 | 04-04-T4 | 两段各自的证明边界被显式写死（静态只证行级；动态未装 codegraph；解析级未触发）；缺口写进 §① 步骤 6 与证据册 | ✓ VERIFIED | 文档 `:219` 三点齐备并点名 `codegraph` 的 `github:` 形态；DRILL-3「这证不了什么」三条与之一一对应 |
| 38 | 04-04-T5 | §① 两半各新增步骤 6（位置在步骤 5 之后、回退之前），含 `uniq -d` 与逐 id 计数两条命令 + zh `不能证明` / en `does not prove` 边界声明 | ✗ FAILED（partial） | 结构与位置全部成立（本趟：两半均有该 `###`，索引 5 < 6 < 回退；`uniq -d` / 四 id / `bundles` / `stderr` / 边界词 / `codegraph` 全在）。但该小节交付的「可复制集合断言」在它自己指定的**真实迁移路径**上不可满足：`:194` 让读者只改第一行、`:219` 要求步骤 4 之后用同一组命令重跑，而 `H0` 此时已含 `dsh-gsd`，三条 `add` 全为 no-op ⇒ `H1 > H0` 在健康 home 上必假。见 §Gaps 与 §对 WR-02 的裁定 |
| 39 | 04-04-T6 | 供应链门被真正走完：两个 `[SUS]` 包装之前必须过人审 `checkpoint:human-verify gate="blocking-human"`，任何模式都不自动放行 | ✓ VERIFIED | 04-04-PLAN 的 `<task type="checkpoint:human-verify" gate="blocking-human">` 在盘；证据册有**唯一**一条 `APPROVAL: approved 2026-11-14T06:17:59Z`（本趟 `grep -cE '^APPROVAL: (approved\|hold)'` = 1）；演练块以 `grep … \| tail -n 1` 为第一判据，`hold` 可推翻先前 `approved`（T-4-19）；DRILL-3 记录 `approval gate: latest decision is approved` |
| 40 | 04-04-T7 | 隔离面完整：一切写动作只在 `mktemp -d` 的临时 home 内；真实 `~/.dsh` 只读 | ✓ VERIFIED | DRILL-3 收尾行：三次临时 home 与仓根 tarball 全删；真实 `~/.dsh` 的 profiles 清单 `diff -q` 无差异、各 `package.json` mtime+size 无差异、`find -newermt` 命中 0。本趟复核：`/tmp/dsh-coex-*` / `/tmp/dsh-mis-*` / `/tmp/dsh-mig-*` 合计 **0** 项，`*.tgz` **0** 个 |
| 41 | 04-04-T8 | 本计划结束时 `docs-consistency` 14/14、全量 38、`package.json` 与 `BUILD.md` 零 diff | ✓ VERIFIED | 本趟 38/38 与 14 条 `test(`；`BUILD.md` 最后一次改动在 `98a80f3`（04-03），`19af44a` 对本文件的 diff = `118 0`（只动 `docs/MIGRATION.md`） |

**Score:** **39/41** truths verified（0 条 present-but-behavior-unverified）

## Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `docs/MIGRATION.md` | 双语三节 + §① 0-A/0-B/步骤 1-6 + 回退；`§②` 三轴；`§③` 四层症状 | ✓ VERIFIED（内容面 2 处缺陷，见 Gaps） | 585 行（`git diff` 585 增 / 0 删）；H1=2、两半 `##` 各 3、`###` 各 15；含 `dsh: skipping profile bundle`×2、`uniq -d`×2、`export DSH_HOME=`×22、五个事件名 |
| `README.md` | 中英各一行 `./docs/MIGRATION.md` 入口 | ✓ VERIFIED | `:11` / `:85`，diff = `2 0`；`# dsh-gsd` 仍 2、徽章仍 2 |
| `docs/oldrepo-link/README.md` | 备料说明（目标仓 / remote / sha / 锚点 / 时点 / 为何不推） | ✓ VERIFIED（含 IN-03 的两处读数偏差） | 3579 B；含 `41fcc7a`、`## Quick start`、`git@github.com:pfmiles/install-gsd-dsh.git`；「315 行」与「章节链漏 Compatibility」两处与实测不符 |
| `docs/oldrepo-link/snippet.en.md` | 唯一可推件，无版本号、无机器路径 | ✓ VERIFIED | 691 B；`dsh-gsd@` 0 次；`/Users/` 0 次 |
| `docs/oldrepo-link/snippet.zh.md` | 备而不用，首行声明无落点 | ✓ VERIFIED | 889 B；首行为 HTML 注释「本片段当前无落点」 |
| `docs/oldrepo-link/pr.md` | `title:` + `---` + body | ✓ VERIFIED | 1235 B；首行 `title: docs: point install-gsd-dsh readers at the dsh-gsd plugin` |
| `tests/docs-consistency.test.mjs` | ⑭（双语入口 + 文档同构守卫） | ✓ VERIFIED | 14 条 `test(`；⑭ 在 `:348`；diff = `60 0`（纯追加） |
| `BUILD.md` | `:16` = `预期 38/38` | ✓ VERIFIED | 恰 1 处；`37/37` 0 处；diff `1 1` |
| `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` | DRILL-1/2/3 + `APPROVAL:` | ✓ VERIFIED | 172 行；三段三元组表；`COEXIST-DRILL bundles=` 可在文件内命中；`APPROVAL:` 恰 1 条 |

## Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `docs/MIGRATION.md` §① 命令块 | 临时 `DSH_HOME` 的真实执行 | 隔离头 + 证据册回填 | ✓ WIRED | 0-A `:21-24` / 0-B `:38-39`；后续块 `${DSH_HOME:?…}` fail-closed；正文数字与证据册同源（1.16.0 / 3084 / 3195 / 3587 / 3856 / 72 / 24→25 本趟逐项对上） |
| `README.md` 双语两半 | `docs/MIGRATION.md` | 相对路径 `./docs/MIGRATION.md` | ✓ WIRED | 两半各 1 处（本趟直读）；⑭ 以 `readmeZh`/`readmeEn` 断言 |
| `04-DRILL-EVIDENCE.md` | `docs/MIGRATION.md` §①/§③ 的实测数字 | 七组数字逐字一致 | ✓ WIRED（除 WR-03 的**归类**句） | 数字全对：1.16.0 / 3084 / 3195 / 3587 / 3856 / 72 / 24→25 / 1877 B / 1255→1243 / 25→24 / 526 B；WR-03 是「哪些行随路径变」的叙述错，不是数字错 |
| `docs/MIGRATION.md` §② 对照表 | 真源（`package.json` / `pins.json` / `config/gsd-hooks.json`） | 只读命令 | ✓ WIRED | 本趟复算：1.20.1（`gsd-core/VERSION` + `runtime-identity`）、5 事件 / 14 matcher、`files` 九项、`!!js createRequire(baseUrl)` |
| `docs/MIGRATION.md` §① 步骤 6 静态段 | 真实已装物的 `- id:` 行 | 四文件 `fs.readFileSync` | ✓ WIRED | 本趟独立重算得同一 5 id；但块本身依赖 cwd=仓根与真实 `$HOME/.dsh`（IN-01） |
| `build/assets/pins.json` | `build/lib/check-pins.mjs` 步骤 (j) | `${peerName} ${peerRange}` 逐字比较 | ✓ WIRED | `check-pins.mjs:159` 文案与证据册逐字一致；本趟 sha 未污染 |
| 临时 home 里已装包的 `engines.dsh` | `--dump-config` 的 stderr 与层数 | 逐 bundle 判定 | ✓ WIRED（证据册） | DRILL-2 的 `EXIT=0` + `H1=H0−1` + 单行 stderr；数字与文档 `:279` 一致 |
| `tests/docs-consistency.test.mjs` ⑭ | `docs/MIGRATION.md` 的 2 H1 / 每半 3 `##` / README 入口 | 围栏感知计数 | ✓ WIRED | 本趟 38/38 全绿；⑭ 是 `docs/MIGRATION.md` 唯一会红的守卫（无 glob 扫 `docs/`） |
| `04-DRILL-EVIDENCE.md` DRILL-3 | Phase 5 的真实迁移 | 缺口交接 | ⚠️ PARTIAL | 交接文本在（`:219` + DRILL-3），但 ROADMAP Phase 5 的 SC 未点名该复验对象 → 见 Deferred 的警告 |

## 数据流（Level 4）

本 phase 无产品代码改动，唯一的数据流是「实测读数 → 证据册 → 用户面文档」。该链路本趟逐格对账：七组数字 + 两处负向观测全部一致；唯一例外是 WR-03 的**归类句**（zh 把 3195 归进「不随 home 长度变」，与同一文件 `:27` 的 `3195 - 7×(20-L)` 直接冲突；zh 又把 dump 标头 `24→25` 归进「包内产物」，而它是 profile 的 dump 属性）。en 半写「前三行动 / 后三行是包内产物」，对前三行正确、但漏了第 7 行的归属。判定：数字 **FLOWING**，归类叙述 **STATIC（错）**。

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 全量套件（串行，唯一一次） | `node --test --test-concurrency=1 tests/*.test.mjs` | `tests 38 / pass 38 / fail 0 / cancelled 0`（7516 ms） | ✓ PASS |
| 文档双语同构 | 自写围栏感知脚本 | H1=2；两半 `##`=3/3；`###`=15/15；独占 `---`=1（:293）；CJK=4020/0；`/Users/`=0；naive `^# `=30 vs 真实 2 | ✓ PASS |
| §③ 四层症状表 | 自写脚本 | 两半各 4 行、首列逐字；五条逐字串 `11111`/`11111`；两半均有 exit-0 警示与 `allow-version`/`--force` | ✓ PASS |
| 步骤 6 结构与顺序 | 自写脚本 | 两半均有该 `###`；索引 5<6<回退；含 `uniq -d`/四 id/`bundles`/`stderr`/边界词/`codegraph` | ✓ PASS |
| 四 bundle 的 row id 集合 | `node -e` 读四个 `cordis.patch.yml` | `gsd gsd-hooks-bridge` / `dsh-codegraph` / `deja` / `dsh-market`，并集 5、无重复 | ✓ PASS |
| pins 未污染 | `shasum -a 256` + `git status` | `45c643ea…a2bb`（与证据册复原值逐字节同）+ 空 | ✓ PASS |
| 旧仓零写入 | `git -C ../install-gsd-dsh` 三读 | `41fcc7a` / 0 行 / remote 未变 | ✓ PASS |
| 演练残留 | `ls /tmp/dsh-{mig,coex,mis}-*` / `ls *.tgz` | 0 / 0 | ✓ PASS |
| 包内技能读数 | `wc -c` + `ls -d` | 3587 / 3856 / 72 | ✓ PASS |
| 引擎与钩子真源 | `gsd-core/VERSION` + `runtime-identity` + `config/gsd-hooks.json` | 1.20.1 / 1.20.1 / 5 事件 14 matcher | ✓ PASS |
| WR-02 的机理复现 | 读 `:194`/`:206`/`:219` 与 DRILL-3 的 `27 = 24 + 3` | 真实路径新装数 = 0 ⇒ `H1 = H0` ⇒ 判据 ② 必假；反向可误绿 | ✗ FAIL（缺陷确认） |
| IN-02 的机理复现 | `printf 'x=%s' "$(grep -c 'zzz' /dev/null 2>/dev/null \|\| echo 0)"` | `x=0` 换行 `0`（两行） | ✗ FAIL（缺陷确认，非阻塞） |

### Probe Execution

无 `scripts/*/tests/probe-*.sh`，PLAN/SUMMARY 亦未声明 probe（本 phase 的判据载体是 PLAN 内的一次性 `<automated>` 块 + 证据册）。**N/A**。

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| **MIG-01** | 04-01 | 迁移 runbook：先卸旧再装新，避免同名 skills 双源 | ✓ SATISFIED（D-03 门面 1 缺，见 Gaps） | §① 步骤 0–5 齐备（0-A / 0-B / 硬门 / 卸载 / 全局 CLI / 装插件 / 复验）；DRILL-1 端到端跑通；阴性对照 + 内容比对两腿都在 |
| **MIG-02** | 04-02 + 04-03 | 不同部署方式差异表（全局 CLI、`GSD_PROFILE` 档位、hooks 事件子集） | ✓ SATISFIED | §② 三轴 + 选型建议 + 单列共同限制（本趟结构复算通过）；hooks 轴的「不是事件差异」纠偏两半都在。**注**：REQUIREMENTS 原文写「hooks 事件子集」，而实测两侧事件集合相同，文档按 D-12 的正确读法写成「归属差异 + 共同限制」——这是对需求措辞的订正而非缩水，04-02 的 prohibition 已显式要求不得写成事件子集 |
| **MIG-03** | 04-01 + 04-02 | 旧脚本保留定位（离线/批量铺/诊断保底）+ README 顶部互链 | ✓ SATISFIED（离线模式实测**不可行**并如实记录） | README 双语入口在；§② 选型建议重述三条保底理由；`docs/oldrepo-link/` 四件备料齐备；旧仓零写入。离线档：本仓产物缺 `gsd-core/bin/install.js` 与 `gsd-core/package.json`（本趟复核后者仍 ABSENT）⇒ `GSD_PACKAGE_DIR` 离线档在本仓产物上不成立，04-VALIDATION 的 C-4 已如实改写为「以缺失项实测判定不可行」 |
| **MIG-04** | 04-04 | 同 profile 同时装 `dsh-gsd` 与其他插件无冲突 | ✓ SATISFIED（含 2 处边界登记） | 静态段本趟独立重算通过；动态段证据册四判据齐；边界：codegraph 未动态装（G-4 → Phase 5）、解析级未触发。步骤 6 的自检命令在真实路径上有缺陷（见 Gaps），不改变「并存本身无冲突」这一结论 |
| **HOOK-05** | 04-03 | 桥接 pin 与 DSH 版本对齐策略文档化；升级后的症状与修复写入 runbook | ✓ SATISFIED | §③ 四层门 + 逐字症状（本趟结构复算）+ pin 对齐边界 + 三条修复路径；静态门三态、运行时 ③/③′ 均有现场记录；⑭ 把「双语只写一半」变成 per-commit 判据 |

**孤儿需求检查**：REQUIREMENTS.md 中映射到本 phase 的 ID = `MIG-01..04` + `HOOK-05`（后者由跨 phase 移交进入，见 `<phase_requirement_ids>`）。五者**全部**出现在某个 PLAN 的 `requirements:` 字段里（04-01→MIG-01/MIG-03；04-02→MIG-02/MIG-03；04-03→HOOK-05；04-04→MIG-04）。**无 ORPHANED**。五个 ID 在 REQUIREMENTS.md 均为 `[x]`（本趟复核）。

## Decision Coverage（13 条锁定裁决）

| 决策 | 判定 | 证据 |
| ---- | ---- | ---- |
| D-01 先卸后装 + 承认机器级/ profile 级不对称 | ✓ honored | 步骤 2 在步骤 4 之前；`:224` 明写不对称与破坏半径 |
| D-02 只在临时 home 实测，真实 home 迁移留 P5 | ✓ honored | 证据册三段全在临时 home；真实 `~/.dsh` mtime/size 前后一致 |
| D-03 未裁决 profile → **硬门中止**（两个面） | ✗ **partial** | 门在、中止写在、面 2 与机器级面在；**面 1（技能）在卸载前不存在** → 见 §Gaps 第 1 条 |
| D-04 默认卸全局 CLI + 讲清为何不损伤插件态 | ✓ honored | 步骤 3；`:96-98` 的 1.16.0 / 1.20.1 与绝对路径 adapter 说明 |
| D-05 阴性对照 + 内容比对**两条同时**成立 | ✓ honored | 步骤 5 A–F；`:115` 明写「只做一条都不够」 |
| D-06 纯文档 + 可复制命令块，不新增随包脚本 | ✓ honored | 本趟 `git status` 无新增脚本；`scripts/` 零改动 |
| D-07 阴性对照做「技能 + hooks」双面扫 | ✗ **partial** | 面 2a/2b + 机器级在；面 1 的阴性对照只在卸载后，未构成**卸载前**的双面扫（与 D-03 同一缺陷） |
| D-08 本仓改 + 旧仓备料不推 | ✓ honored | README 两行；旧仓 `41fcc7a` / 0 行 / remote 未变 |
| D-09 备料 = 粘贴片段 + 章节锚点 + PR 描述（zh/en 各一份） | ✓ honored | 四文件职责分离；读法 A（en 正式件 / zh 备而不用）已显式声明 |
| D-10 单篇 `docs/MIGRATION.md` 三节 + README 一行入口 | ✓ honored | 两半各 3 个 `##`；README 每半 1 行 |
| D-11 双语同构（zh → `---` → en） | ✓ honored | 本趟形状复算：H1=2、独占 `---`=1、en CJK=0 |
| D-12 三轴表 + 表前选型建议 + 共同限制单列 | ✓ honored | §② 结构与逐字表头；共同限制小节内 0 个表行 |
| D-13 真实错配演练，症状来自实测 | ✓ honored | DRILL-2 静态三态 + 运行时 ③ + row 级 ③′ `MEASURED`；无「已知会…」 |

**结论：11/13 完全落地，2 条部分（D-03 / D-07，同一缺陷）。**

## 对 04-REVIEW 七条 finding 的独立裁定

四条 info 我逐条复核，**全部成立**，但都不改变 goal 判定；两条 warning 成立且**升级为完成级缺口**；一条 warning 成立但列追踪项。

| ID | 本趟裁定 | 依据 |
| -- | -------- | ---- |
| **WR-01** | **成立，且升级为完成级缺口** | 直读 `:46`（「判据是两个面…两面都要」）与 `:48-61`（只有面 2a / 2b / 机器级）。`$DSH_HOME/skills/gsd-*` 的唯一命令在 `:122`（步骤 5，卸载后）。D-03 的第二个触发条件与 D-07 的面 1 因此没有卸载前探测器。**这是被承诺的判据与交付的命令不一致**，且缺的正是安全相关的那一面：`--uninstall` 会 `rm -rf` 全部 profile 的技能，用户按 `:33` 操作时手里没有能提前中止它的探测器。计划侧的演练不会暴露它（临时 home 的 skills 必然是「有」，hits 只来自 bridge），所以「演练通过」不构成反驳 |
| **WR-02** | **成立，且升级为完成级缺口** | 三条独立事实：①`:194` 只让改第一行；②`:219` 要求在**步骤 4 之后**用同一组命令重跑；③判据 `:206` 是 `H1 > H0`，而 `H0` 在此场景已含 `dsh-gsd`、三条 `add` 全 no-op ⇒ 差值 0。DRILL-3 自己把机制钉死：`27 = 24 + 3`，「增长量 = 新装 bundle 数」，真实迁移的新装数为 0。**双向都坏**：另一个方向的读者（真实 profile 无 deja/dshmarket）会以「新增两层」这个与命题无关的理由通过。这是文档自己的自检在目标场景里**必然**报红，而不是「可能不稳」 |
| **WR-03** | 成立，**非阻塞**（追踪项） | zh `:228`「前两行就变」漏了第 3 行（3195 随 home 长度变，同文件 `:27` 的公式 `3195-7×(20-L)` 直接反证）；「后四行是包内产物」错标第 7 行（`24→25` 是 profile 的 dump 属性）；en `:522`「first three / last three」对前三行正确但漏第 7 行归属。数字全对、归类错，读者会在不同长度 home 上把 3188 误判为「旧源没死」 |
| **IN-01** | 成立，**非阻塞** | `:169` / `:463` 首行 `node -e '`，与 `:14` 的全称安全不变量冲突；`"dsh-gsd":"cordis.patch.yml"` 是仓根相对路径（本趟确认仅在 cwd=仓根时成立）；三者的 `node_modules` 任一缺失即整体抛错。影响是「粘贴后响失败 / 与文档自己的模型冲突」，不是静默误判 |
| **IN-02** | 成立，**非阻塞** | 本趟机器复现：`x=$（grep -c … \|\| echo 0）` → `x=0` 换行 `0`（BSD grep）。`grep -c` 零匹配时先打印 `0` 再 exit 1，`\|\| echo 0` 又追加一个。只在校验「期望」的那一支制造噪声 |
| **IN-03** | 成立，**非阻塞** | 本趟：旧仓 `README.md` `wc -l` = **314**（文中写 315，off-by-one）；`grep -n '^## '` 的章节链里 `## Compatibility`（第 300 行）在 `## Troubleshooting` 与 `## License and credits` 之间，文中连写时漏了它。两处都不影响「插在 `## Quick start` 之前」的结论 |
| **IN-04** | 成立，**非阻塞** | 本趟：`grep -c '^# '`=`30`、真实 H1=2 ⇒ 围栏内 column-0 `#` 注释 **28** 行（注释写 26/28，已过期）；`# 步骤 N` 形态实测 **0** 次（真实形态是 `# 面 2a：…`）。属「给下一位维护者的说明与现场不符」 |

## Gaps Summary

本 phase 的骨架是**扎实**的：三段演练各有逐字读数与前提断言，数字与包内产物可复算一致，38/38 与 14/14 真实可跑，pins 与旧仓零污染，供应链门留下了唯一且可推翻的人审记录，⑭ 是真正有牙的 per-commit 守卫（围栏感知是本 phase 最有价值的一条订正）。**但两条「文档承诺 vs 交付命令」的不一致落在用户面文档的两处关键位置**，且都属「读者照着敲会得到错误结论」这一类：

1. **D-03 硬门缺面 1**（MIG-01）：正文承诺两个面，块里只有一个面 + 机器级一面；缺的恰是能提前中止机器级 `rm -rf` 的那一面。演练不会暴露它（临时 home 里 skills 必然存在），所以「演练通过」不能替代这条判据。
2. **步骤 6 的真实迁移形态必红**（MIG-04）：文档要求步骤 4 之后用同一组命令重跑，而 `H0` 已包含 `dsh-gsd`、三条 `add` 全为 no-op ⇒ `H1 > H0` 在健康 home 上必假；另一方向还能以无关理由误绿。

两条都是**文档级、可在一次编辑里修掉**的缺陷（补一条探针 / 改一个判据 + en 同构），不需要回滚任何交付物、不涉及演练重跑、不改任何计数。但它们足以让「这份 runbook 的可信度」打折，因此本趟判 `gaps_found` 而不是 `passed`。WR-03 与四条 info 建议在同一次编辑里一并处理（`snippet.zh.md` 的「315 行」也须同步改成 314）。

### 追踪项（非完成级，但不得静默丢弃）

| 项 | 性质 | 建议落点 |
| -- | ---- | -------- |
| **WR-03** + IN-01 / IN-02 / IN-03 / IN-04 | 文档/注释正确性，7 条 review finding 全部 `open` | 与上面两条缺口同一次编辑 |
| **G-1 / G-2 / G-3** | 「可自动化却没进套件」（§② 的 D-12 断言、备料契约、`check-pins` 的**有牙方向**） | ⑮ 或 `tests/oldrepo-prep.test.mjs`；G-3 建议把 `pins.json` 复制进 `mkdtemp` 后改坏再断言 exit 2（**不写仓**）。⚠ 附带事实：04-02 的一次性门 `:189` 在 HEAD 上会因过时的 `##` 子句（`want 2`）转红——门过期不是交付缺陷，但重跑它会得到假红，下一任维护者需知道 |
| **G-4** | codegraph 只有行级证据 | 已 Escalated → Phase 5；**但 ROADMAP P5 的 SC 未点名该复验对象**，Phase 5 规划时必须显式认领（见 Deferred 第 1 条） |
| `04-REVIEW.md` 未入库 | 流程卫生：`02cb9a5` 只提交了 disposition，被引用的 review 本体仍是 `??` | 由编排器随本报告一并提交 |
| 04-03 prohibition 内的一处笔误 | 写「stdout 少 3 行」，而 truth 与实测都是 **12 行**（1255→1243） | 不改（prohibition 是 MUST-NOT 语境，数字不影响禁令）；记在此处以免下一轮把它当证据 |

## Deferred Items

| # | Item | Addressed In | Evidence |
| - | ---- | ------------ | -------- |
| 1 | `@jiangzhenguo/dsh-codegraph` 的同层合成（动态）验证 | Phase 5 | DRILL-3 边界段点名它是真实迁移时的第一复验对象；`docs/MIGRATION.md:219`；04-VALIDATION G-4。⚠ ROADMAP P5 SC 未点名 |
| 2 | 真实 `~/.dsh` 的整体迁移（含 `web` / `headless`） | Phase 5 | D-02；ROADMAP P5 SC-1；证据册「本轮未覆盖」第 3 条 |
| 3 | 旧仓互链的提交与推送 | Phase 5 | D-08/D-09；`docs/oldrepo-link/README.md` 的时点；ROADMAP P5 SC-5 |

## 未计分观察（记下来，不算 finding）

1. **0-B 读者没有被交代「卸载后、装包前取 H0」**。`:42` 只要求量 `gsd-*.md` 的字节基线，而 `:145` 的判据是 `H1 = H0 + 1`——真实用户没有「加包前」的标头读数。这是 WR-02 的同源弱点（同一处修复可一并解决），但它在演练形态下成立（DRILL-1 第 9 步就是在卸载后、装包前取 H0），故未单列为缺口。
2. **`npm_config_prefix` 的采样副作用没写进文档**：演练后同一 shell 里 `npm ls -g` / `npm uninstall -g` 都指向临时 prefix（证据册已把这次误判记为负向观测）。0-B 不设该变量，故不影响真实路径。
3. **`/tmp/mig-dump.*` / `/tmp/c-*.out` 用固定文件名**：并发或重跑会互相覆盖；文档是单次流程。
4. **四个 `docs/oldrepo-link/*.md` 与 `docs/MIGRATION.md` 末尾无换行**：与本仓既有文档一致（`04-VALIDATION` 已把它记为既有形态）。
5. **`\s` 与 `[[:space:]]` 两种写法混用**：`grep -cE '^\s*- id:'`（`:147-148`）依赖 BSD/GNU grep 的 `\s` 扩展，步骤 6 用可移植的 `[[:space:]]`；两者本轮都能跑。
6. **工作树并非「干净」**：`04-REVIEW.md` 未跟踪（见上）。除此之外无任何未提交改动。

---

_Verified: 2026-11-14T06:53:54Z_
_Verifier: Claude (gsd-verifier)_