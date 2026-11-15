---
phase: 04-migration-coexistence
verified: 2026-11-15T03:33:19Z
status: passed
score: 48/48 must-haves verified
covered_files:
  - ".planning/phases/04-migration-coexistence/04-01-PLAN.md"
  - ".planning/phases/04-migration-coexistence/04-01-SUMMARY.md"
  - ".planning/phases/04-migration-coexistence/04-02-PLAN.md"
  - ".planning/phases/04-migration-coexistence/04-02-SUMMARY.md"
  - ".planning/phases/04-migration-coexistence/04-03-PLAN.md"
  - ".planning/phases/04-migration-coexistence/04-03-SUMMARY.md"
  - ".planning/phases/04-migration-coexistence/04-04-PLAN.md"
  - ".planning/phases/04-migration-coexistence/04-04-SUMMARY.md"
  - ".planning/phases/04-migration-coexistence/04-05-PLAN.md"
  - ".planning/phases/04-migration-coexistence/04-05-SUMMARY.md"
  - ".planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md"
  - "BUILD.md"
  - "README.md"
  - "docs/MIGRATION.md"
  - "docs/oldrepo-link/README.md"
  - "docs/oldrepo-link/pr.md"
  - "docs/oldrepo-link/snippet.en.md"
  - "docs/oldrepo-link/snippet.zh.md"
  - "tests/docs-consistency.test.mjs"
covered_digest: "v3:sha256:f6353fd99e4769f4fe260bac3b3f069abd8e376b120865f17501ae22cd1e53bc"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 39/41
  gaps_closed:
    - "04-01-T4 / D-03：卸载前硬门现在真的覆盖两个面（面 1a skills 基线 + 面 1b undecided profile，面 2a/2b，机器级三态），命中未裁决 exit 1、机器级脏 exit 2、逐 profile 覆盖不足仍 exit 1"
    - "04-04-T5 / MIG-04：步骤 6 拆成静态段 + 演练专用 COEXIST-DRILL + 零安装 COEXIST-REAL；真实迁移形态不再使用增量判据，改判 listed ⇔ labeled，健康 home 为真、被跳过的 bundle 与不在册的 dsh-gsd 都按其真实原因报红"
  gaps_remaining: []
  regressions: []
deferred:
  - truth: "@jiangzhenguo/dsh-codegraph 的同层合成（动态）验证"
    addressed_in: "Phase 5"
    evidence: "docs/MIGRATION.md:358/:792 与 DRILL-3 的『这证不了什么』点名它是真实迁移时的第一复验对象；04-VALIDATION.md 的 G-4 标 Escalated → Phase 5。⚠ ROADMAP Phase 5 的 Success Criteria 仍未点名该对象，P5 规划时须显式认领"
  - truth: "真实 ~/.dsh 的整体迁移（web / headless 等 profile 的实际迁移动作）"
    addressed_in: "Phase 5"
    evidence: "D-02；ROADMAP P5 SC-1『UAT-01..05 全绿』；docs/MIGRATION.md 的 0-B 只给出路径，DRILL 全程只写临时 home"
  - truth: "旧仓 pfmiles/install-gsd-dsh 的互链提交与推送"
    addressed_in: "Phase 5"
    evidence: "D-08/D-09；docs/oldrepo-link/README.md 的时点；ROADMAP P5 SC-5『对外动作执行』"
advisory:
  - finding: "04-SECURITY.md 追加的 2026-11-15 前向注记把 zh/en 的 `# MIG-GATE` 标成 @59/@492，实测标记行是 @60/@493（片段的 fence 行才是 59/492）"
    category: other
    reason: "行号引用口径混用（0-based fence 行 vs 1-based 标记行）；排序结论（硬门在 --uninstall 之前）本身成立。不是 phase 4 的完成级缺陷，重写安全审计时应一并订正"
    evidence_status: "file:line 已复算，但属注记层叙述，非行为断言"
---

# Phase 4: 迁移与并存 Verification Report

**Phase Goal:** 脚本部署用户的无痛迁移，两种方式可解释可回退
**Verified:** 2026-11-15T03:33:19Z（HEAD `3aa64ce`，分支 `main`，工作树 0 行）
**Status:** passed
**Re-verification:** Yes — after gap closure（`04-05`，`gap_closure: true`；本次从零重推 48 条 must-have，不复用上一份报告的表格结论）

## 本次判定口径（honest-verifier）

上一份报告判 `gaps_found` 39/41，两条缺口都是「文档承诺的判据 ≠ 块里真正执行的检查」。本次**没有**把旧表两行翻绿了事：48 条 must-have 逐条回到当前树重判，其中两条原缺口的行为由**我自己提取并运行文档块**来判定，而不是引用 04-05 的自述。

证据分三档，逐行标注：

1. **本趟亲自执行**：`node --test --test-concurrency=1 tests/*.test.mjs`（串行一次）；`docs/MIGRATION.md` 的 `# MIG-GATE` 块在 **12 个合成 home** 上逐次运行；`# COEXIST-REAL` 块在**真实 dsh 0.2.2-rc.1** 上跑四种状态（home 是**真实 profile 的只读副本**放进 `mktemp -d`）；步骤 6 静态块在空 / 单来源 / 四来源 / 重复 id / `cwd=/` 五种形态上运行；`bash -n` 四个块；文档结构复算；四来源 row id 独立重算；包内产物读数；旧仓三读；`check-pins` 与 pins sha；零 diff 与零写入核对。
2. **记录在案、输入物本趟已证未变**：DRILL-1 / DRILL-2 / DRILL-3（真实装 1.16.0 旧部署、真卸、真装三个 bundle）**未重跑**——按任务约束与 04-05 自身的纪律（演练场已销毁、`npm pack` 禁用）。判定方式是：证据册逐字读数 + 本趟对**可复算输入**（包内 3587/3856/72、引擎 1.20.1、pins sha、hooks 5 事件/14 matcher、四来源 id 集合）的独立复核 + 文档↔证据册对账。DRILL-2 的运行时 ③ 另有本趟的**独立复现**（注入已装包 `engines.dsh` → 526 B stderr / 标签消失 / row 0；复原 → PASS）。
3. **不采信 SUMMARY 的结论句**：`04-05-SUMMARY.md` 的每条自述都当作待证命题；下表每一行的证据都指向命令输出、当前文件的 `file:line` 或证据册的逐字读数。

**一处方法学事故（如实记录，且与 04-REVIEW.md 踩过的是同一个坑）**：本环境对 `chmod` 直接 SIGKILL（实测 `chmod rc=137`、`Killed: 9`），我第一次用「可执行 `dsh` 桩脚本」测 `COEXIST-REAL` 时桩没有执行位，块拿到 241 B 的 stderr 与空 dump，**那一轮三个 fixture 全是假红**。已作废，改用 `export -f dsh` 的**函数桩**重跑（块文本一字未改），得下表读数。所有 `DSH_HOME` 都在 `mktemp -d` 内；真实 `~/.dsh` 的 `profiles/*/package.json` 元数据前后 `diff` 为空，`find ~/.dsh -newermt 11:20` 在 `sessions/`、`storages/`、`logs/` 之外命中 **0**。

## Goal Achievement

### Must-have 来源与覆盖（无缩面证明）

- **ROADMAP Success Criteria（3 条）** → #1–#3。
- **04-01..04-04 的 PLAN frontmatter truths（38 条：11 + 9 + 10 + 8）** → #4–#41，逐条保留，无合并、无降级。
- **04-05 的 PLAN frontmatter truths（7 条，gap_closure）** → #42–#48。这 7 条是本次新增的完成级义务（上一份报告写于 04-05 之前，故不含它们）；它们与 #7、#38 重叠的部分按更严的措辞判定（命中集覆盖、机器级三态、listed ⇔ labeled）。
- **跨 phase 移交**：`HOOK-05` 不在 ROADMAP P4 的 Requirements 行，但 04-03 明确承接并由其十条 truth 覆盖（见 §Requirements Coverage）。
- 合计 **48 条**，判定 **48/48 VERIFIED**，0 条 present-but-behavior-unverified。

### Observable Truths — ROADMAP SC + 04-01

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 1 | **SC-1** | runbook 全流程在验证机走通（uninstall → add → 复验） | ✓ VERIFIED | 证据册 DRILL-1（19 行三元组，17:35:47Z–18:01:05Z）：旧 `72/3084/3195` + `hits=1` → 卸后 `0/absent/ABSENT` → 包内 `3587/3856/72` → dump `stderr 0 B`、标头 `24→25`、两 row 各 1。**本趟独立复算**包内三项：`wc -c` = 3587 / 3856、`ls -d skills/gsd-*` = 72；`gsd-core/VERSION` 与 `runtime-identity` = 1.20.1 |
| 2 | **SC-2** | 旧脚本 README 顶部互链 + 定位重述为保底/离线 | ✓ VERIFIED | `README.md:11`（zh）/`:85`（en）各一行 blockquote，本趟直读；`docs/MIGRATION.md:385/:819` 把「批量铺 / 完全离线 / 诊断输出」写成留在旧脚本的三条理由；`docs/oldrepo-link/` 四件齐备；旧仓本趟三读 `41fcc7a` / 0 行 / remote 未变 |
| 3 | **SC-3** | 同 profile 与 codegraph/deja/dshmarket 并存无冲突实测 | ✓ VERIFIED（覆盖面按计划裁定） | 静态：四来源五 id 本趟独立重算（`gsd gsd-hooks-bridge` / `dsh-codegraph` / `deja` / `dsh-market`，并集 5、无重复），步骤 6 静态块重跑得逐字 `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`；动态：DRILL-3 记录 `bundles=5 / stderr 0 / headers 24→27 / 四 id 各 1 / uniq -d 0 行 / COEXIST-DRILL PASS`。**codegraph 的「同层合成」仍未动态验证**——已由计划显式裁定并登记（§Deferred + G-4），文档两半也明写不许声称 |
| 4 | 04-01-T1 | 双语同构（zh → 独占 `---` → en、各一 H1、en 零 CJK）；§① 给出 0-A / 0-B 两个迁移场；每个命令块块首给出 `export DSH_HOME=` | ✓ VERIFIED（块首契约已被 04-05 改写） | 本趟复算：H1=2（:1 / :434）、独占 `---` 恰 1（:432）、两半 `##` 各 3、en 半 CJK **0**（zh 5830）；0-A `:20-25` 用 `mktemp -d /tmp/dsh-mig-XXXXXXX` + 临时 `npm_config_prefix`，0-B `:39-42` 用 `$HOME/.dsh` 且 `:35` 指向步骤 1；20 个围栏块逐块判定：6 个带标记块「marker → 下一行 `export DSH_HOME=`」、14 个无标记块首行即 `export`，**0 处违反当前契约**（旧全称句「第一行都是 export」已由 04-05 改写为 `:14/:447` 的双形态契约，属显式修订而非缩面） |
| 5 | 04-01-T2 | 文件头警告是**有条件**的，自带出口指向 0-B 与步骤 1 | ✓ VERIFIED | `:7-8`（en `:440-441`）条件句「未经逐 profile 裁决，不要在真实 `~/.dsh` 上跑 `--uninstall`」+ 明写先走步骤 1、再从 0-B 开始；不是无条件禁令 |
| 6 | 04-01-T3 | 演练复现「脚本装过的人」初态，且两条前提由演练自己断言（20 字符 home + GSD 1.16.0） | ✓ VERIFIED（证据册） | DRILL-1 同一轮先记 `core_VERSION=1.16.0` + `runtime_identity=1.16.0`（17:35:59Z），后记 `old_health_bytes=3084` / `old_new_project_bytes=3195` / `home_len=20`；`$DSH_HOME` 字面出现 3 / 7 次同轮量得。前提与数字同轮成立 |
| 7 | 04-01-T4 | **D-03 硬门在 `--uninstall` 之前执行**（命中先被观测，且「命中即中止」） | ✓ VERIFIED（原缺口 GAP-1，本次亲跑闭合） | 位置：`# MIG-GATE` zh marker `:60`（块 59–125）早于 `--uninstall` 块 `:143-147`；en `:493` 早于 `:577-581`。行为（本趟 12 次运行）：risky home → `GATE: ABORT undecided=web bridge=web multirow=-` / **exit 1**；`MIG_DECIDED_PROFILES=web` → `GATE: PASS` / **0**；机器级 DIRTY → `GATE: HARD-ABORT machine-level=DIRTY` / **2**。面 1 的命令确实在块内（`skills=` 与 `undecided=` 两行） |
| 8 | 04-01-T5 | 卸载后阴性对照（技能 0 / 无 bridge / 三受管目录 absent / 无 hooks json）+ 机器级一面区分 `ABSENT` 与 `PRESENT` | ✓ VERIFIED | 文档 `:192-213`（en `:626-647`）A–E 五项齐备且 E 分两支；DRILL-1 卸后 `old_skills=0 / bridge_hits=0 / sandbox_hits=0 / 三目录 absent / ABSENT`，并注明「`ABSENT` 是它自己的状态，不是 0 计数」 |
| 9 | 04-01-T6 | 迁移后内容比对成立（`3587` / `3856` / `72`，与旧源不同 ⇒ 新源是真源） | ✓ VERIFIED | 本趟直读：`skills/gsd-health/SKILL.md`=3587 B、`skills/gsd-new-project/SKILL.md`=3856 B、`ls -d skills/gsd-*`=72；DRILL-1 记录旧源 3084 / 3195 且两侧 sha256 前 16 位不同 |
| 10 | 04-01-T7 | 迁移后 dump 判据同时成立：`stderr` 0、同一 home `H1 = H0 + 1`（24→25）、标签出现、两 row 各 1；**不**拿标头数与 bundles 长度比、不把 exit code 当信号 | ✓ VERIFIED（证据册） | 文档 `:219-225` / `:230` 与 `:653-659` / `:664` 两处明写伪不变量禁令；DRILL-1 记 `headers before=24 after=25` / `stderr 0 B` / `rows gsd=1 gsd-hooks-bridge=1`。**上一份报告的未计分观察已修**：0-B 现在明写 `H0` 取法（`:46` / `:479`：步骤 2 之后、步骤 4 之前，且给降级路径） |
| 11 | 04-01-T8 | 演练日志 `allow-version` / `Exact-version exemption: active` 出现 0 次；`--force` 未使用 | ✓ VERIFIED（证据册） | DRILL-1 记录三个日志合计 **0** 次；DRILL-2 / DRILL-3 各 0；本趟 `grep -c 'legacy-peer-deps'` = 0 |
| 12 | 04-01-T9 | 真实 `~/.dsh` 零写入（profiles 清单与 mtime 不变、`npm ls -g` 仍 1.16.0） | ✓ VERIFIED | DRILL-1 第 17 行：`~/.dsh/profiles` 清单与各 `package.json` mtime `diff -q` 无差异，并把一次采样口径错误标为「不得充当证据」后复测。**本趟复核**：`ls -l ~/.dsh/profiles/*/package.json` 在我全部实验前后 `diff` 为空；`find ~/.dsh -newermt 11:20`（排除 sessions/storages/logs）= **0** |
| 13 | 04-01-T10 | README 两半各恰一行 `./docs/MIGRATION.md` 入口；`# dsh-gsd` 仍 2、徽章仍 2、裸名 install 整行仍 2；切片点未位移 | ✓ VERIFIED | 本趟：`:11` / `:85` 各一行；`grep -c '^# dsh-gsd'`=2、`shields.io`=2；⑫ 在本次 38/38 里通过。原真值写「13/13」，实际已按计划推进到 **14/14**（同判据的超集） |
| 14 | 04-01-T11 | 证据册每行为 `(操作, UTC, 输出要点)` 三元组；基线行同时记两条前提；机器级一面记 `ABSENT`/`PRESENT`；负向观测显式标注；每个 manual-only 判据后有「这证不了什么」 | ✓ VERIFIED | 本趟全文直读（227 行）：DRILL-1 19 行、DRILL-2 两段、DRILL-3 三段、DRILL-4 两段全部三元组；`ABSENT`/`PRESENT` 在 L42；两处负向观测（YAML 1877 B、`NOT FOUND` 采样错误）均标注；`这证不了什么` 出现 4 次 + DRILL-4 的两段边界 |

### Observable Truths — 04-02

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 15 | 04-02-T1 | §② 两半各有第 2 个 `##`，其下各恰 3 个 `###`，顺序「选型建议 → 对照表 → 共同限制」 | ✓ VERIFIED | 本趟围栏感知复算：zh §② `:379` 下 `:383`/`:389`/`:399`；en `:813` 下 `Which one should you use` / `Comparison` / `Shared limit`；两半 `###` 各 3，顺序一致 |
| 16 | 04-02-T2 | zh 表头逐字 `\| 轴 \| 旧脚本 \| 插件 \| 迁移影响 \|`；en 同构四列；两半数据行各 3、轴序一致 | ✓ VERIFIED | 本趟脚本：zh `:391` 逐字命中、en `:825` `\| Axis \| Shell script \| Plugin \| Migration impact \|`；两半数据行各 3；轴序 全局 CLI → `GSD_PROFILE` 档位 → hooks 归属 |
| 17 | 04-02-T3 | 「共同限制」是独立 `###` 而非表行；点名 5 类事件并明说两种方式都受此限；任何以 `\|` 开头的行不含小节标题词 | ✓ VERIFIED | `:399-403`（en `:833-837`）；本趟脚本：该小节起 10 行内 `\|` 开头行 = **0**；五个事件名两半均为行内代码；`PreCompact`/`FileChanged`/statusline 明写没有 |
| 18 | 04-02-T4 | 三轴每一格对上真源（1.16.0/1.20.1 与绝对路径 adapter；`GSD_PROFILE` 无对应物且影响写成「多得」；hooks 不是事件差异而是归属） | ✓ VERIFIED | 本趟：`package.json` version `1.20.1-1.dsh022`、`gsd-core/VERSION`=1.20.1、`runtime-identity`=1.20.1；`config/gsd-hooks.json` 5 事件 / 14 matcher；旧仓源码 `install-gsd-dsh.sh:383` 逐字 `[ -n "${GSD_PROFILE:-}" ] && INSTALLER_ARGS+=(--profile="$GSD_PROFILE")`（本趟直读，不是转述）；`:394`/`:828` 写「多得技能，不是缩水」 |
| 19 | 04-02-T5 | `docs/oldrepo-link/` 四文件齐备且职责分离，首行声明不随包发布 | ✓ VERIFIED | 四文件均在（3602 / 691 / 889 / 1235 B）；`README.md` 首段声明不随 npm 包发布；`snippet.zh.md` 首行为 HTML 注释「本片段当前无落点」；`pr.md` 首行 `title:`；`docs/dshmarket/README.md` 先例仍在 |
| 20 | 04-02-T6 | 插入位置用章节锚点（`## Quick start` 之前）；基准 sha `41fcc7a` 显式标为「观测时的 HEAD，不是 patch 基准」；四文件 `/Users/` 出现 0 次 | ✓ VERIFIED | `README.md:11` 逐字含此限定；本趟旧仓 `grep -n '^# \|^## '`：`## Quick start` 在第 35 行；四文件 `/Users/` 计数各 0 |
| 21 | 04-02-T7 | `snippet.en.md` 不含 `dsh-gsd@` 任何形态；它是唯一会被推送的正式件，中文片段备而不用已声明 | ✓ VERIFIED | 本趟 `grep -c 'dsh-gsd@' snippet.en.md` = **0**；片段以 `dsh plugin --profile web add dsh-gsd` 无版本形态给出；`snippet.zh.md:1` 首行即声明 |
| 22 | 04-02-T8 | `pfmiles/install-gsd-dsh` 一字未变：HEAD `41fcc7a`、工作树干净、remote 未变 | ✓ VERIFIED | 本趟三读：`41fcc7a` / `status --porcelain` 0 行 / `git@github.com:pfmiles/install-gsd-dsh.git` |
| 23 | 04-02-T9 | `docs/` 仍不在 `files`（九项），`ALLOWED_TOP_LEVEL` 未改；`docs-consistency` 通过 | ✓ VERIFIED | 本趟 `files` = 9 项且无 `docs`；`tests/pack-contents.test.mjs` 在 38/38 内通过；`docs-consistency` = 14 条 `test(` 且 14/14（计划的「13/13」已被 04-03 按计划推进） |

### Observable Truths — 04-03（含 HOOK-05）

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 24 | 04-03-T1 | 静态 pin 门有牙且可复原：篡改 → exit 2 + 逐字失配串；复原 → exit 0；注入不留痕 | ✓ VERIFIED（证据册；本趟跑健康态） | DRILL-2 首段三行：`EXIT=0` → `EXIT=2` + 167 B 逐字（含 em dash 与单引号）→ `EXIT=0` 且 sha256 回 `45c643ea…a2bb`。本趟：`shasum -a 256 build/assets/pins.json` = `45c643ea3711e998445369c61cf2958c1ea63bc6062a9e143f28e1d5c494a2bb`（逐字节同）；`node build/lib/check-pins.mjs --offline` → `pins: all consistent (line dsh022)` / exit 0；`check-pins.mjs` 的 (j) 逐字比较与 `finish(2, …)` 本趟直读。**篡改方向未重跑**（会写仓内 pins；按纪律用证据册 + sha 复原值判定） |
| 25 | 04-03-T2 | 运行时 ③ 层现场复现：`EXIT=0`、`H1 = H0 − 1`（25→24）、`N1 = N0 − 12`（1255→1243）、标签消失、`- id: gsd` 0 行、stderr 恰 1 行含 `dsh: skipping profile bundle` | ✓ VERIFIED（证据册 + 本趟独立复现） | DRILL-2 运行时段：`injected: EXIT=0 headers=24 lines=1243 gsd_rows=0 skip_lines=1 gsd_label=0`，stderr 526 B 逐字；复原后 `H2=H0=25` / `N2=N0=1255` / stderr 0 B。**本趟独立复现**（真实 dsh 0.2.2-rc.1 + 真实 profile 的只读副本）：把已装 `dsh-gsd` 的 `engines.dsh` 改成 `>=9.0.0` → `COEXIST-REAL` 看到 `stderr-bytes:526`、`label dsh-gsd MISSING`、`row gsd 0`；复原 → `PASS`。判据是同一 home 的前后关系，与 T-4-17 一致 |
| 26 | 04-03-T3 | ③′ 层要么实测到、要么显式 `NOT REPRODUCED:`（文档与证据册都要） | ✓ VERIFIED | 文档 `:416`（en `:850`）以 `MEASURED:` 开头整段贴 boot 逐字；DRILL-2 记 `ROWLEVEL MEASURED:` 原文并同时记下随后的 `MISSING_CREDENTIAL`（不夸大成「完整会话可启动」）。**本趟未重跑 boot**（需凭据）；虚假「已知会…」零处 |
| 27 | 04-03-T4 | §③ 四层症状表两半各 4 数据行、首列逐字 `① preflight` / `② post-install` / `③ load` / `③′ load`，五条逐字症状两半都在 | ✓ VERIFIED | 本趟脚本：两半均 4 行、首列逐字；五条串两半命中数均 `11111`；两半 `###` 各 3、`allow-version` 与 `--force` 均在；③ 行两半都写「退出码仍是 0」/`the exit code stays 0` |
| 28 | 04-03-T5 | pin 对齐策略与其边界写清：`pins.json` 是唯一真源、`check-pins` 步骤 (j) 逐字比较、该 peer 只被它消费、`engines.dsh` 在场时 DSH 不读 `peerDependencies` | ✓ VERIFIED | `:420-424`（en `:854-858`）明写「只会让 CI 变红，产不出任何运行时症状」；本趟读 `check-pins.mjs` 的 (j) 段确认比较逻辑与唯一消费点 |
| 29 | 04-03-T6 | 修复列三条且按推荐顺序；`allow-version` 是精确二元组豁免；**绝不** `--force`；两半都含这两个词 | ✓ VERIFIED | `:426-430`（en `:860-864`）：① 装匹配版本 ② `allow-version` 精确二元组 ③「绝不 `--force`」；两半 `allow-version` / `--force` 均在（en 的本趟初次脚本因切片上界 off-by-one 误报 false，已复算为 true） |
| 30 | 04-03-T7 | ⑭ 落地并真的能判：追加 1 条 `test(`、围栏感知、复用 `readmeZh`/`readmeEn`、两 H1、每半 3 个 `##`、zh 有 CJK / en 零 CJK | ✓ VERIFIED | `tests/docs-consistency.test.mjs:337-397` 直读：注释 + 实现均围栏感知（`/^\s*\x60{3}/`），用 `h1s[1].i` 切半（**不是** `---`，是关键正确选择），断言齐全；①–⑬ 未改（`git diff` 纯追加）；本趟 14/14 通过 |
| 31 | 04-03-T8 | `docs-consistency` 13→14 并通过；全量 37→38；`BUILD.md:16` 同一提交改成实测 `预期 38/38` | ✓ VERIFIED | 本趟：逐文件 `grep -c '^test('` 2+8+14+4+7+3=**38**；`docs-consistency`=14；`BUILD.md:16` 含 `预期 38/38` 恰 1 处、`37/37` 0 处 |
| 32 | 04-03-T9 | 全量串行一次的输出为 `ℹ tests 38` / `ℹ fail 0` / `ℹ cancelled 0` | ✓ VERIFIED | 本趟实跑 `node --test --test-concurrency=1 tests/*.test.mjs`（仓根、单独）：`tests 38 / pass 38 / fail 0 / cancelled 0`（7002 ms），`EXIT=0` |
| 33 | 04-03-T10 | `build/assets/pins.json` 与 `package.json` 在本计划结束时与 HEAD 逐字一致 | ✓ VERIFIED | 本趟：pins sha256 与证据册「复原后」值逐字节相同；`git status --porcelain` 空；`package.json` 对 `d106944` 零 diff（见 #41 / 硬约束 5） |

### Observable Truths — 04-04

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 34 | 04-04-T1 | 静态段：四来源五 id、两两不相交、并集 5、无重复；只读文件、不对真实 profile 跑 `--dump-config` | ✓ VERIFIED（本趟独立重算 + 块实跑） | 本趟 `node -e` 直读四来源：`dsh-gsd ["gsd","gsd-hooks-bridge"]` / `codegraph ["dsh-codegraph"]` / `deja ["deja"]` / `dshmarket ["dsh-market"]`，并集 5、无重复；步骤 6 静态块在四来源 fixture 上打出逐字 `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`（`cwd=/` 同输出）；全程 `readFileSync`，未对真实 profile 跑 dump |
| 35 | 04-04-T2 | 动态段：临时 home 装三者后 `stderr` 0 字节、`H1 > H0`（24→27）且三包标签出现、四 id 各 1、`uniq -d` 空；该段本身是 `automated` bash 块 | ✓ VERIFIED（证据册；本趟未重跑安装） | DRILL-3 动态表逐项：`bundles=5` / `stderr_bytes=0` / `headers=24->27` / 三包标签各 1 / 四 id 各 1 / `uniq -d` 0 行 / 逐字 `COEXIST-DRILL bundles=5 headers=24->27 rows=… env=temp-home`；计划侧为可执行 bash 块（04-04-PLAN Task 2 的 `<automated>`，含 `bail`）。**块已被 04-05 改写为 `H1 = H0 + 3`**（同一「增量 = 新装数」口径，且更严格），本趟确认该口径在块内 |
| 36 | 04-04-T3 | 「无冲突」判据是集合断言而不是「能装能跑」；同名 row id 静默双行的机制写明 | ✓ VERIFIED | 文档 `:241`/`:675` 与 `:356`/`:790`、DRILL-3 均写明「DSH 对同名 row id 没有任何冲突仲裁…`add` exit 0、零 warning」；四条合取在文档与计划里同源（真实形态现为 listed⇔labeled + 行集合 + stderr，演练形态为增量 + 标签 + 行集合） |
| 37 | 04-04-T4 | 两段各自的证明边界被写死（静态只证行级；动态未装 codegraph；解析级未触发）；缺口写进 §① 步骤 6 与证据册 | ✓ VERIFIED | 文档 `:358`（en `:792`）三点齐备并点名 `codegraph` 的 `github:` 形态；DRILL-3「这证不了什么」四条与之一一对应 |
| 38 | 04-04-T5 | §① 两半各新增步骤 6（位置在步骤 5 之后、回退之前），含 `uniq -d` 与逐 id 计数两条命令 + zh `不能证明` / en `does not prove` 边界声明 | ✓ VERIFIED（原缺口 GAP-2，本次亲跑闭合） | 结构：两半均有该 `###`（zh `:239` / en `:673`），索引 5 < 6 < 回退；`uniq -d` / 四 id / `bundles` / `stderr` / 边界词 / `codegraph` 全在。**真实迁移路径的可用性**：真实形态 `# COEXIST-REAL` 零安装（无 `plugin add`、无 `H0`/`H1`），本趟在真实 dsh 上四态实测：健康 → `PASS`/0；引擎注入 → `label dsh-gsd MISSING` + `row gsd 0` + `stderr-bytes:526`/1；复原 → `PASS`/0；不在册 → `required-absent:dsh-gsd`/1。旧 `:219` 的「步骤 4 之后同一组命令重跑」已不存在（`grep 同一组命令` = 0） |
| 39 | 04-04-T6 | 供应链门被真正走完：两个 `[SUS]` 包装之前必须过人审 `checkpoint:human-verify gate="blocking-human"`，任何模式都不自动放行 | ✓ VERIFIED | 04-04-PLAN 的 `checkpoint:human-verify` 与 `gate="blocking-human"` 在盘；证据册有**唯一**一条 `APPROVAL: approved 2026-11-14T06:17:59Z`（本趟 `grep -cE '^APPROVAL: (approved\|hold)'` = **1**，L117）；演练块以 `tail -n 1` 为判据，`hold` 可推翻先前 `approved`（T-4-19） |
| 40 | 04-04-T7 | 隔离面完整：一切写动作只在 `mktemp -d` 的临时 home 内；真实 `~/.dsh` 只读 | ✓ VERIFIED | DRILL-3 收尾行：三次临时 home 与仓根 tarball 全删；真实 `~/.dsh` 的 profiles 清单 `diff -q` 无差异、各 `package.json` mtime+size 无差异、`find -newermt` 命中 0。本趟复核：仓根 `*.tgz` **0**、`/tmp/dsh-{mig,coex,mis,gap2,verif}-*` **0**、真实 home 元数据前后一致 |
| 41 | 04-04-T8 | 本计划结束时 `docs-consistency` 14/14、全量 38、`package.json` 与 `BUILD.md` 零 diff | ✓ VERIFIED | 本趟 38/38 与 14 条 `test(`；`git diff --quiet d106944 -- BUILD.md package.json` **exit 0**（逐字节零 diff；与硬约束 5 一致） |

### Observable Truths — 04-05（gap closure）

| # | 来源 | Truth（摘要） | Status | Evidence |
| - | ---- | ------------- | ------ | -------- |
| 42 | 04-05-T1（GAP-1） | 步骤 1 的块**真的实现两个面**：面 1a `skills=<N>` 基线 + 面 1b `undecided=<profile…>`；面 2a/2b/机器级照旧；命中集 = 去重 profile 名集合，必须被 `MIG_DECIDED_PROFILES` **完整覆盖**，未覆盖 exit 1 并打印 `GATE: ABORT`；机器级 `DIRTY` exit 2；块在 `--uninstall` 之前；`PASS` 旁写明语义边界 | ✓ VERIFIED | 块文 `:59-125`（en `:492-559`）：`GATE: skills=` @72/505、`GATE: undecided=` @101/535、面 2a/2b @90-93/524-527、机器级三态 @105-112/539-546、覆盖循环 @116-121/550-555、`GATE: PASS` 后 `:133`/`:567` 明写「PASS 只表示有记录，不表示记录是对的」。位置：`# MIG-GATE` @60/@493 早于 `--uninstall` @146/@580。行为见 #43 |
| 43 | 04-05-T2（GAP-1 双向） | risky → exit 1；覆盖后 → exit 0 + `GATE: PASS`；**部分覆盖仍 exit 1**；multirow 未裁决 1 / 已裁决 0；clean → 0 且 `skills=0`；机器级脏 → 2；zh 与 en 两半对同一 home 的 `GATE:` 行**逐字相同** | ✓ VERIFIED（本趟 12 次实跑） | 本趟从文档围栏提取两半块、在 8 个合成 home 上运行：F1 risky/undecided **1**（`GATE: ABORT undecided=web bridge=web multirow=-`）；F2 decided=web **0**（`GATE: PASS`）；F3 decided=headless **1**（命中集未被覆盖）；F4 clean **0**（`skills=0`/`undecided=-`/`machine-level=ABSENT`）；F5 机器级 DIRTY **2**（`GATE: HARD-ABORT`，`decided='web headless'` 也不能豁免）；F6 机器级 **CLEAN → 0**（非空文件、0 匹配）；F7 multirow/未裁决 **1**、F7b 已裁决 **0**；F8 两 profile 只裁决 web **1**（点名 `headless`）、F8b 全覆盖 **0**；F9 交互式无 `DSH_HOME` **2** 且 stdout 逐字 `DSH_HOME=` / `GATE: ABORT no-home`；F11 zh/en 的 `^GATE:` 行 `diff` 无差异。`bash -n` 四块均过（必要非充分，故以实跑为准） |
| 44 | 04-05-T3（GAP-2） | 步骤 6 拆成两个形态且判据互不冒充：增量口径唯一 = 本次新装 bundle 数（演练 `H0 + 3`，步骤 5 `H0 + 1`）；真实形态 `COEXIST-REAL` **不含增量判据**，改判 listed ⇔ labeled；演练块是演练专用（无真实 home 指令）；全文不再有「步骤 4 之后用同一组命令重跑」 | ✓ VERIFIED | `:241`/`:675` 三段分工；`:276`/`:710` 明写 `+3` 与新装数口径；`:305`/`:739` 明写真实形态不比较增量且 `H1 > H0` 必假；演练块 `:278-303` / `:712-737` 内 `grep '$HOME/.dsh'` = 0、`把第一行换成` = 0；真实块 `:307-354` / `:741-788` 内无 `plugin add`、无 `H0`/`H1`；全文 `同一组命令` / `the same command set` = 0；`H1 > H0` 只剩两处「为什么不用」的解释。步骤 5 的 `+1` @222/656 与 0-B 的 `H0` 取法 @46/479 同口径 |
| 45 | 04-05-T4（GAP-2 真值表） | 健康 home 上真实形态 exit 0（`PASS`）；`engines.dsh` 改坏 → exit 非 0 且打印 `label dsh-gsd MISSING` + `row gsd 0`；恢复 → 0；`dsh-gsd` 移除 → `required-absent:dsh-gsd`，不是「少了一层」 | ✓ VERIFIED（本趟真实 dsh 四态） | 本趟把真实 profile **只读复制**进 `mktemp -d`，用真实 `dsh 0.2.2-rc.1` 跑：① 副本 `gsdtest`（在册 dsh-gsd）→ `COEXIST-REAL PASS` / **0**；② 注入 `engines.dsh=">=9.0.0"` → `label dsh-gsd MISSING` / `row gsd 0` / `row gsd-hooks-bridge 0` / `FAIL stderr-bytes:526 label-missing:dsh-gsd row-gsd:0 row-gsd-hooks-bridge:0` / **1**（与证据册逐字相同）；③ 复原 → `PASS` / **0**；④ 副本 `web`（dsh-gsd 未在册，deja/dshmarket 在册）→ `listed dsh-deja` + `label dsh-deja PRESENT` + `row deja 1`、`listed dshmarket` + `label dshmarket PRESENT` + `row dsh-market 1`、`absent dsh-gsd` → `FAIL required-absent:dsh-gsd` / **1**。zh/en 两半对同一 home 的 `^COEXIST-REAL` 行一致 |
| 46 | 04-05-T5（WR-03/IN-01/IN-02） | 读数叙述三方一致（前三行随 home/版本变且含 3195、后三行 3587/3856/72 是包内产物、最后一行 `24 → 25` 随 bundle 组合变）；静态块认 `DSH_HOME`、缺包打印 `MISSING:` 不抛栈；全文无「零匹配多打一个 0」计数形态 | ✓ VERIFIED | `:367`/`:801` 现为逐字同构的「第 1–3 行 / 第 4–6 行 / 第 7 行」三段划分，`前两行`/`后四行`/`first two rows`/`last four rows` 均 0；静态块 `:246-273` 首行 `export DSH_HOME=`、`process.env.DSH_HOME`、`existsSync` → `MISSING:`；本趟空 home 实跑 → 4 行 `MISSING:` + `coexist-static SKIPPED (… this is not a pass)` / 0，**无栈**；重复 id → `FAIL duplicate row ids: gsd` / 1；从 `/` 跑输出相同；全文 `|| echo 0` = **0**，且步骤 5 的 E 段为两步式 |
| 47 | 04-05-T6（IN-03/IN-04） | `docs/oldrepo-link/` 每一处行数读数 = `wc -l` 实测 314（README:11 + snippet.zh:1），章节链补上 `## Compatibility`；⑭ 的注释与断言文案引用真实存在的注释形态，且不写死会增长的计数 | ✓ VERIFIED | 旧仓本趟实测 `23653 B / 314 行 / CJK 0`，章节链 `:281 ## Troubleshooting → :300 ## Compatibility → :309 ## License and credits`；两文件写 314（该目录无第二套行数口径，`315` 全文 0）。⑭ 注释 `:340` 引 `# MIG-GATE…` / `# COEXIST-DRILL…` / `# COEXIST-REAL…` / `# A 阴性对照`；本趟逐一验证存在且 column-0（`:60` / `:279` / `:308` / `:196`），`# 步骤 N` 计数 0，无写死计数 |
| 48 | 04-05-T7（不做的事） | 不新增 `test(`（仍 14 / 38）；`BUILD.md:16` 保持 `预期 38/38` 且零改动；`package.json` 零 diff；不新增 `scripts/` 入口；不把 `docs/` 加进 `files`；不声称 codegraph 已被动态验证 | ✓ VERIFIED | 本趟：`docs-consistency` 14 条、全量 38 条；`BUILD.md:16` = `预期 38/38`，`git diff --quiet d106944 -- BUILD.md package.json` exit 0；`git diff --name-only d106944..HEAD -- scripts/` = 0 行；`files` 9 项无 `docs`；文档 `:358`/`:792` 与证据册都把 codegraph 限定为行级证据 |

**Score:** **48/48** must-haves verified（0 条 present-but-behavior-unverified；0 条 override）

### 原缺口逐条结案

| 原缺口 | 旧判定 | 本次判定 | 判定依据 |
| ------ | ------ | -------- | -------- |
| **GAP-1**：`docs/MIGRATION.md` 步骤 1 声称「两个面」但块只实现面 2 | 旧判 gaps_found（04-01-T4 / D-03 / D-07） | **CLOSED** | 面 1 的命令在块内（`skills=` 基线 + `undecided=` 逐 profile），位置在 `--uninstall` 之前；12 次实跑给出 0/1/2 三态，部分覆盖与多 profile 覆盖不足都真的 exit 1（#42/#43） |
| **GAP-2**：步骤 6 要求步骤 4 之后重跑同一组命令，而 `H1 > H0` 在健康 home 上必假 | 旧判 gaps_found（04-04-T5 / MIG-04） | **CLOSED** | 真实形态零安装、无增量判据，改判 listed ⇔ labeled；真实 dsh 上健康 0 / 坏 1（具名原因）/ 复原 0 / 不在册 1（`required-absent`）；残留指令 `grep` 为 0（#44/#45） |

### Deferred Items

| # | Item | Addressed In | Evidence |
| - | ---- | ------------ | -------- |
| 1 | `@jiangzhenguo/dsh-codegraph` 的同层合成（动态）验证 | Phase 5 | 文档 `:358`/`:792` 与 DRILL-3 边界段点名；`04-VALIDATION.md` G-4 Escalated。⚠ ROADMAP P5 的 SC 未点名该复验对象，P5 规划时须显式认领 |
| 2 | 真实 `~/.dsh` 的整体迁移（含 `web` / `headless`） | Phase 5 | D-02；ROADMAP P5 SC-1；证据册「本轮未覆盖」第 3 条 |
| 3 | 旧仓互链的提交与推送 | Phase 5 | D-08/D-09；`docs/oldrepo-link/README.md` 的时点；ROADMAP P5 SC-5 |

### Advisory（New Scope, Unevidenced）

| # | Finding | Category | Why Advisory |
| - | ------- | -------- | ------------ |
| 1 | `04-SECURITY.md` 的前向注记把 `# MIG-GATE` 标为 @59/@492，实际标记行是 @60/@493（59/492 是 fence 行） | other | 注记层叙述的行号口径混用，不改变「硬门早于 `--uninstall`」的结论；不构成完成级缺陷。重跑 `/gsd-secure-phase 04` 时应订正 |

## Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `docs/MIGRATION.md` | 双语三节 + §① 0-A/0-B/步骤 1–6 + 回退 + 双面硬门 + 步骤 6 三形态 | ✓ VERIFIED | 864 行；H1=2、两半 `##` 各 3、独占 `---` 1、en 半 CJK 0；20 个围栏块块首契约 0 违反；`# MIG-GATE` / `COEXIST-DRILL` / `COEXIST-REAL` 两半各一 |
| `README.md` | 中英各一行 `./docs/MIGRATION.md` 入口 | ✓ VERIFIED | `:11` / `:85`；`# dsh-gsd` 2、徽章 2 |
| `docs/oldrepo-link/README.md` | 备料说明（目标仓 / remote / sha / 锚点 / 时点 / 为何不推） | ✓ VERIFIED | 3602 B；含 `41fcc7a`、`## Quick start`、remote、314 行、`## Compatibility` |
| `docs/oldrepo-link/snippet.en.md` | 唯一可推件，无版本号、无机器路径 | ✓ VERIFIED | 691 B；`dsh-gsd@` 0 次；`/Users/` 0 次 |
| `docs/oldrepo-link/snippet.zh.md` | 备而不用，首行声明无落点 | ✓ VERIFIED | 889 B；首行 HTML 注释；314 行口径 |
| `docs/oldrepo-link/pr.md` | `title:` + `---` + body | ✓ VERIFIED | 1235 B；首行 `title:` |
| `tests/docs-consistency.test.mjs` | ⑭（双语入口 + 文档同构守卫，围栏感知） | ✓ VERIFIED | 14 条 `test(`；⑭ 在 `:350`，H1 切半 + 3/3 `##` + 语言判别 + 复用 `readmeZh/readmeEn`；14/14 通过 |
| `BUILD.md` | `:16` = `预期 38/38` | ✓ VERIFIED | 恰 1 处；`37/37` 0 处；对 `d106944` 零 diff |
| `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` | DRILL-1/2/3/4 + `APPROVAL:` + 口径例外 | ✓ VERIFIED | 227 行；四段三元组；`APPROVAL:` 恰 1 条；DRILL-4 段首写明「exit code 不作判据」只约束宿主命令 |
| `build/assets/pins.json` | 未被注入污染 | ✓ VERIFIED | sha256 `45c643ea…a2bb` 与 DRILL-2 复原值逐字节相同；`check-pins` exit 0 |

## Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `docs/MIGRATION.md` 步骤 1 的 `# MIG-GATE` 块 | 「命中即中止」 | 块自身 exit 0/1/2 + `GATE:` 行；位置在 `--uninstall` 之前 | ✓ WIRED | 本趟 12 次实跑：0/1/2 三态与打印行一一对应；zh/en 逐字同构；机器级 `DIRTY` 无豁免 |
| `docs/MIGRATION.md` 步骤 6 的真实形态 `COEXIST-REAL` | `$DSH_HOME/profiles/<p>/package.json` 的 `dsh.profile.bundles` | listed ⇔ labeled 配对判据 | ✓ WIRED | 真实 dsh 四态：健康 0 / 注入 1（`label … MISSING` + `row gsd 0` + 526 B）/ 复原 0 / 不在册 1（`required-absent`） |
| `docs/MIGRATION.md` §① 命令块 | 临时 `DSH_HOME` 的真实执行 | 隔离头 + 证据册回填 | ✓ WIRED | 0-A `:20-25` / 0-B `:39-42`；后续块 `${DSH_HOME:?…}` fail-closed；正文数字与证据册同源（1.16.0 / 3084 / 3195 / 3587 / 3856 / 72 / 24→25 逐项对上，包内读数本趟复算） |
| `README.md` 双语两半 | `docs/MIGRATION.md` | 相对路径 `./docs/MIGRATION.md` | ✓ WIRED | 两半各 1 处；⑭ 以 `readmeZh`/`readmeEn` 断言 |
| `04-DRILL-EVIDENCE.md` | `docs/MIGRATION.md` §①/§③ 的实测数字 | 逐字一致 | ✓ WIRED | 七组数字 + 1877 B / 1255→1243 / 25→24 / 526 B 全对；WR-03 的归类句已修 |
| `docs/MIGRATION.md` §② 对照表 | 真源（`package.json` / `pins.json` / `config/gsd-hooks.json` / 旧脚本源码） | 只读命令 | ✓ WIRED | 本趟复算：1.20.1、5 事件/14 matcher、`files` 九项、旧脚本 `--profile=` 透传 @383 |
| `tests/docs-consistency.test.mjs` ⑭ | `docs/MIGRATION.md` 的 2 H1 / 每半 3 `##` / README 入口 | 围栏感知计数 | ✓ WIRED | 本趟 38/38 全绿；⑭ 是 `docs/MIGRATION.md` 唯一会红的守卫（无 glob 扫 `docs/`） |
| `build/assets/pins.json` | `build/lib/check-pins.mjs` 步骤 (j) | `${peerName} ${peerRange}` 逐字比较 | ✓ WIRED | 本趟 exit 0；篡改方向见 DRILL-2（exit 2 + 167 B 逐字） |
| `04-DRILL-EVIDENCE.md` DRILL-3 | Phase 5 的真实迁移 | 缺口交接 | ⚠️ PARTIAL（已登记，非缺口） | 交接文本在（`:358` + DRILL-3），但 ROADMAP P5 的 SC 未点名 → 见 Deferred 第 1 条的警告 |

## Data-Flow Trace（Level 4）

本 phase 无产品代码改动，唯一数据流是「实测读数 → 证据册 → 用户面文档」。本趟逐格对账：七组数字 + 两处负向观测全部一致；**上一份报告 WR-03 的归类错已修**——zh `:367` 与 en `:801` 现在都把 7 行分成 1–3 / 4–6 / 7，`3195` 明确随 home 长度走、`24 → 25` 明确随 profile 的 bundle 组合走。判定：**FLOWING**（数字与归类均一致）。

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| 全量套件（串行，唯一一次） | `node --test --test-concurrency=1 tests/*.test.mjs` | `tests 38 / pass 38 / fail 0 / cancelled 0`（7002 ms），exit 0 | ✓ PASS |
| `# MIG-GATE` 三态（8 个合成 home × 12 次） | 从文档围栏提取 zh/en 块后 `DSH_HOME=<fixture> bash` | risky 1 / decided 0 / disjoint 1 / clean 0 / machine-DIRTY 2 / machine-CLEAN 0 / multirow 1→0 / 两 profile 部分 1→全覆盖 0 / 无 home 交互式 2 / zh-en `GATE:` 行 diff 空 | ✓ PASS |
| `# COEXIST-REAL` 四态（真实 dsh 0.2.2-rc.1） | 真实 profile 只读副本 + 函数桩/真 dsh | healthy 0 `PASS`；注入 1 `label dsh-gsd MISSING` + `row gsd 0` + 526 B；复原 0；不在册 1 `required-absent:dsh-gsd`；deja/dshmarket listed 且 label PRESENT | ✓ PASS |
| 步骤 6 静态块 | 空 / 单来源 / 四来源 / 重复 id / `cwd=/` | `MISSING:`×4+`SKIPPED`/0；四来源 `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`/0（cwd 无关）；重复 id `FAIL duplicate row ids: gsd`/1 | ✓ PASS |
| 文档双语同构 | 自写围栏感知脚本 | H1=2（:1/:434）；两半 `##`=3/3；`###`=15/15；独占 `---`=1（:432）；CJK 5830/0；`/Users/`=0 | ✓ PASS |
| §③ 四层症状表 | 自写脚本 | 两半各 4 数据行、首列逐字；五条逐字串 `11111`/`11111`；两半均有 `allow-version` / `--force` / exit-0 警示 | ✓ PASS |
| 四来源 row id 集合 | `node -e` 读四个 `cordis.patch.yml` | `gsd gsd-hooks-bridge` / `dsh-codegraph` / `deja` / `dsh-market`，并集 5、无重复 | ✓ PASS |
| pins 未污染 | `shasum -a 256` + `check-pins --offline` | `45c643ea…a2bb` + `pins: all consistent (line dsh022)` / exit 0 | ✓ PASS |
| 旧仓零写入 | `git -C ../install-gsd-dsh` 三读 + `wc -l` | `41fcc7a` / 0 行 / remote 未变 / 314 行 / CJK 0 | ✓ PASS |
| 真实 `~/.dsh` 零写入 | `diff` profiles 元数据 + `find -newermt` | 前后一致；sessions/storages/logs 之外命中 0；仓根 `*.tgz` 0；`/tmp/dsh-*` 演练残留 0 | ✓ PASS |
| `bash -n` 四个块 | `bash -n gate_zh gate_en real_zh real_en` | 全部 ok（**必要非充分**；判据是上表的实跑） | ✓ PASS |
| WR-05 标签形态 | 函数桩 + 三种 label fixture | `patched by dsh-gsd` → PRESENT/0；`# == dsh-gsd` → PRESENT/0；`patched by other-pkg` → MISSING/1 | ✓ PASS |

### Probe Execution

无 `scripts/*/tests/probe-*.sh`（本趟 `find` = 0），PLAN/SUMMARY 亦未声明 probe。本 phase 的判据载体是 PLAN/文档内的可执行块 + 证据册。**N/A**。

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| **MIG-01** | 04-01 + 04-05 | 迁移 runbook：先卸旧再装新，避免同名 skills 双源 | ✓ SATISFIED | §① 步骤 0–5 + 双面硬门；DRILL-1 端到端；阴性对照 + 内容比对两腿；GAP-1 已闭合（#7/#42/#43） |
| **MIG-02** | 04-02 + 04-03 | 不同部署方式差异表（全局 CLI、`GSD_PROFILE` 档位、hooks 事件子集） | ✓ SATISFIED | §② 三轴 + 选型建议 + 单列共同限制（#15–#18）；hooks 轴按 D-12 的正确读法写成「归属差异 + 共同限制」，是对需求措辞的订正而非缩水（04-02 prohibition 明确禁止写成事件子集） |
| **MIG-03** | 04-01 + 04-02 | 旧脚本保留定位（离线/批量铺/诊断保底）+ README 顶部互链 | ✓ SATISFIED | README 双语入口；§② 三条保底理由；`docs/oldrepo-link/` 四件；旧仓零写入。离线档：本仓产物缺 `gsd-core/bin/install.js` 与 `gsd-core/package.json` ⇒ `GSD_PACKAGE_DIR` 离线档在本仓产物上不成立，04-VALIDATION C-4 已如实改写为「实测判定不可行」 |
| **MIG-04** | 04-04 + 04-05 | 同 profile 同时装 `dsh-gsd` 与其他插件无冲突 | ✓ SATISFIED | 静态五 id（本趟重算 + 块实跑）；动态 DRILL-3 四判据；真实迁移形态所列四态（本趟真实 dsh）；codegraph 仅行级 → Deferred/G-4 |
| **HOOK-05** | 04-03 | 桥接 pin 与 DSH 版本对齐策略文档化；升级后的症状与修复写入 runbook | ✓ SATISFIED | §③ 四层门 + 逐字症状（#27）+ pin 对齐边界（#28）+ 三条修复（#29）；静态门三态、运行时 ③/③′ 均有现场记录；⑭ 把「双语只写一半」变成 per-commit 判据 |

**孤儿需求检查**：REQUIREMENTS.md 中映射到本 phase 的 ID = `MIG-01..04` + `HOOK-05`（后者由跨 phase 移交进入）。五者**全部**出现在某个 PLAN 的 `requirements:` 字段（04-01→MIG-01/MIG-03；04-02→MIG-02/MIG-03；04-03→HOOK-05；04-04→MIG-04；04-05→MIG-01/MIG-04）。**无 ORPHANED**。

**勾选状态说明**：REQUIREMENTS.md 当前 `HOOK-05` 为 `[x]`，`MIG-01..04` 为 `[ ]`——这是 `527d0a8` 在缺口出现时**主动回退**的记录（commit message 逐字：「revert premature Complete requirements after gaps found」），不是证据缺口。本报告判五条需求均满足，可由编排器在收口时翻 `[x]`；本趟按纪律未改 REQUIREMENTS.md。

## Decision Coverage（13 条锁定裁决）

| 决策 | 判定 | 证据 |
| ---- | ---- | ---- |
| D-01 先卸后装 + 承认机器级/ profile 级不对称 | ✓ honored | 步骤 2 块 `:143` 在步骤 4 块 `:176` 之前；`:363`/`:797` 明写不对称与破坏半径 |
| D-02 只在临时 home 实测，真实 home 迁移留 P5 | ✓ honored | 证据册三段 + DRILL-4 全在临时/合成 home；真实 `~/.dsh` 元数据前后一致、`find` 0 命中 |
| D-03 未裁决 profile → **硬门中止（两个面）** | ✓ honored（原 partial） | 面 1a/1b/2a/2b + 机器级三态；exit 0/1/2；本趟 12 次实跑 |
| D-04 默认卸全局 CLI + 讲清为何不损伤插件态 | ✓ honored | 步骤 3 `:160-172`；1.16.0 / 1.20.1 与绝对路径 adapter 说明 |
| D-05 阴性对照 + 内容比对**两条同时**成立 | ✓ honored | 步骤 5 A–E；`:190` 明写「只做一条都不够」 |
| D-06 纯文档 + 可复制命令块，不新增随包脚本 | ✓ honored | `git diff --name-only d106944..HEAD -- scripts/` = 0；`docs/` 不在 `files` |
| D-07 阴性对照做「技能 + hooks」双面扫 | ✓ honored（原 partial） | 步骤 5 A（技能）+ D（bridge/sandbox）+ E（机器级）；步骤 1 的面 1 现在卸载前可判 |
| D-08 本仓改 + 旧仓备料不推 | ✓ honored | README 两行；旧仓 `41fcc7a` / 0 行 / remote 未变 |
| D-09 备料 = 粘贴片段 + 章节锚点 + PR 描述（zh/en 各一份） | ✓ honored | 四文件职责分离；读法 A（en 正式件 / zh 备而不用）显式声明 |
| D-10 单篇 `docs/MIGRATION.md` 三节 + README 一行入口 | ✓ honored | 两半各 3 个 `##`；README 每半 1 行 |
| D-11 双语同构（zh → `---` → en） | ✓ honored | H1=2、独占 `---`=1、en CJK=0 |
| D-12 三轴表 + 表前选型建议 + 共同限制单列 | ✓ honored | §② 结构与逐字表头；共同限制小节内 0 个表行 |
| D-13 真实错配演练，症状来自实测 | ✓ honored | DRILL-2 静态三态 + 运行时 ③（本趟独立复现 526 B）+ row 级 ③′ `MEASURED`；无「已知会…」 |

**结论：13/13 完全落地（上一份的 D-03 / D-07 partial 已闭合）。**

## 对 review 账本的独立裁定

`04-REVIEW-DISPOSITION.md` 记 11/11 `fixed`、`open: 0`。本趟不采信账本，逐条回到当前树：

| ID | 账本 | 本趟裁定 | 依据 |
| -- | ---- | -------- | ---- |
| WR-01 | fixed | ✓ fixed | 块内面 1 的两行 + 实跑 exit 1/0（#42/#43） |
| WR-02 | fixed | ✓ fixed | 真实形态零安装、无增量、listed⇔labeled；四态实跑（#44/#45） |
| WR-03 | fixed | ✓ fixed | `:367`/`:801` 三分归类；`前两行`/`后四行` 均 0 |
| IN-01 | fixed | ✓ fixed | 静态块首行 export、认 `DSH_HOME`、`MISSING:` 不抛栈、cwd 无关（本趟实跑） |
| IN-02 | fixed | ✓ fixed | `|| echo 0` = 0；步骤 5 E 段两步式；机器级输出单行 |
| IN-03 | fixed | ✓ fixed | 314 在两文件；`## Compatibility` @300 |
| IN-04 | fixed | ✓ fixed | ⑭ 注释引用的四个形态都存在且 column-0；无写死计数 |
| WR-04 | fixed | ✓ fixed | `恰有两个` / `exactly two` 全文 0；改为「裁决 vs 失败信号」区分，两半与证据册同措辞 |
| WR-05 | fixed | ✓ fixed | 本趟三 fixture：patched / plain 均 PRESENT+0，unrelated MISSING+1（两半） |
| IN-05 | fixed | ✓ fixed | 演练块 `V_GSD`/`V_DEJA`/`V_MARKET` 分离、`:?` 失败关闭；步骤 4 `V_GSD`；四块 `bash -n` 过；无 `<version>` 残留 |
| IN-06 | fixed | ✓ fixed | 7 行恰分为 1–3 / 4–6 / 7，两半同构；`455` 错误只出现在历史 SUMMARY（不修改历史记录） |

**唯一的过程性观察**：`04-REVIEW.md` 自身的 frontmatter 仍写 `open_findings: 5 / status: issues_found`（那是 2026-11-15T03:11Z 二次审查时点的快照）；后续 5 条修复的证据在 `04-REVIEW-FIX.md` 与 disposition 账本。审查文件是时点记录、账本是权威，不矛盾；不构成缺口。

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| — | — | 无 `TBD` / `FIXME` / `TODO` / `HACK` / `PLACEHOLDER` / 未引用 debt marker | ℹ️ Info | 正则 `TBD|FIXME|XXX` 命中的 12 行全部是 `mktemp -d /tmp/…XXXXXXX` 模板（`XXX` 是 mktemp 占位符），不是债务标记；`TODO|HACK|PLACEHOLDER` 0 次 |

## Validation 遗留项的裁定（非完成级）

`04-VALIDATION.md` 记 `nyquist_compliant: false`。本趟判定：**不构成 gaps，也不构成 human_verification**，理由逐条：

| 项 | 内容 | 本趟裁定 | 理由 |
| -- | ---- | -------- | ---- |
| G-1 | §② 的 D-12 断言只在 04-02 的一次性门，未进套件 | 追踪项（非阻塞） | 该断言的三条实质判据（逐字表头 / 共同限制独立成 `###` / 5 事件行内代码）本趟已用独立脚本逐条复算通过（#15–#17）。缺的是 **per-commit 回归回路**，不是交付物或行为；`04-VALIDATION.md` 已登记具体落点（追加 ⑮，同步 38→39）。把「测试覆盖策略欠账」当完成级缺口会让本 phase 永远无法收口，而它不影响 goal「可解释可回退」的可观察真值 |
| G-2 | `docs/oldrepo-link/` 备料契约未进套件 | 追踪项（非阻塞） | 四文件内容本趟逐条复核（#19–#21），旧仓零写入三读通过（#22）；风险是「未来漂移不会被捕获」，已登记 `tests/oldrepo-prep.test.mjs` 落点 |
| G-3 | 套件 ⑥ 只断言 `check-pins` exit 0，「篡改→exit 2」只在一次性块 | 追踪项（非阻塞） | 健康态本趟实跑 exit 0；有牙方向有 DRILL-2 的 `EXIT=0→2→0` 与 167 B 逐字、pins sha 复原逐字节相同（#24）。真正缺的是「门退化成恒绿」的自动防线，已登记「复制进 mkdtemp 后改坏」的具体方案 |
| G-4 | codegraph 只有行级证据 | 追踪项 + Deferred → Phase 5 | 与计划裁定一致；文档两半与证据册都禁止声称「已验证并存」。本趟独立重算其行级 id（`dsh-codegraph`）与另外四者不相交 |

四者都写在 `04-VALIDATION.md` 的 Coverage Gaps 表里（带需求、现状、为什么算缺口、建议落点），不是静默丢弃。它们属于**验证策略的债务**，不属于本 phase 的 must-have 真值；按 Step 9 的决策树，没有任何 truth FAILED / artifact MISSING/STUB / link NOT_WIRED，因此不触发 `gaps_found`，也没有需要人类判断的 truth，因此不触发 `human_needed`。

## Human Verification Required

None — 0 项。

说明：上一轮报告把「人审记录是否足以支撑裁决」「读者能否据此排障」作为潜在人工项，但本 phase 的 must-have 不包含这些主观属性；两块原缺口现已由可执行块的**双向实跑**（exit 0/1/2 与具名裁决行）承担，不再需要人眼替代。真实 `~/.dsh` 的整体迁移与 codegraph 的动态并存**不是**被悄悄转成人工项，而是显式 Deferred → Phase 5。

## Gaps Summary

None — 48/48 must-haves verified。

本 phase 的骨架仍是扎实的：DRILL-1/2/3 三段演练各有逐字读数与前提断言，包内读数与引擎版本本趟可复算一致，38/38 与 14/14 真实可跑，pins 与旧仓零污染，供应链门留下唯一且可推翻的人审记录，⑭ 是真正有牙的 per-commit 守卫。

上一轮的两条完成级缺口在本趟**都按行为判定闭合**，而不是按 04-05 的自述：

1. **GAP-1** 的关节点不是「块里多了两行」，而是「命中集是否真的能中止」。本趟在 8 个合成 home 上跑 12 次：部分覆盖（两个命中 profile 只裁决一个）仍 exit 1、`multirow` 未裁决 1 / 已裁决 0、机器级 `DIRTY` 连全量裁决也豁免不了（exit 2）、`machine-level=CLEAN` 能放行（区分了「文件在」与「文件干净」）、交互式无 home 由块内守卫 exit 2。面 1 的基线（`skills=`）与「谁还只靠 home 级技能」（`undecided=`）都在卸载**之前**。
2. **GAP-2** 的关节点不是「换了个判据名」，而是「健康 home 为真、真坏的 home 为假、与装了几个无关」。本趟用真实 `dsh 0.2.2-rc.1` 在真实 profile 的只读副本上跑：在册且挂上 → 0；引擎被注入 → 1 且具名 `label dsh-gsd MISSING` + `row gsd 0` + 526 B stderr；复原 → 0；不在册 → 1 且具名 `required-absent:dsh-gsd`，不是「少了一层」。演练块与真实块现在物理分开：演练块里没有 `$HOME/.dsh` 或「把第一行换成」，真实块里没有 `plugin add` / `H0` / `H1`。

因此判 `passed`：三条 ROADMAP SC、38 条原计划 truths、7 条 04-05 truths 全部成立；没有失败的 truth、缺失/空壳的 artifact、断开的 key link 或阻塞级 anti-pattern；没有遗留的人工判定项。Deferred 的三项（codegraph 动态、真实 home 迁移、旧仓推送）是 ROADMAP 明确留给 Phase 5 的对外/现场动作，不属本 phase 的完成级缺口——但第 1 项的交接在 ROADMAP P5 的 SC 里仍未点名，P5 规划时必须显式认领。

## 未计分观察（记下来，不算 finding）

1. **步骤 6 静态段把 profile 硬编码为 `web`**（`:251`/`:685`），而 `COEXIST-REAL` 认 `$P`。在流程内这没问题（步骤 4/5 也固定 `web`），但维护者若直接对本机真实 home 跑静态块，会把 `MISSING: dsh-gsd` 打出来——本机真实 `web` 里没有装 `dsh-gsd`（插件装在 `gsdtest` / `gsd-p3-release`），本趟实跑得到 `coexist-static ok: dsh-codegraph deja dsh-market`（3 来源）。这是文档写明的降级形态（「某来源不在盘上时打印 MISSING 并继续」），不是缺陷；四来源齐备时逐字复现 DRILL-3 的 5-id 行。
2. **DRILL-4-A/4-B 的提取位置注记是历史值**：`gate@54,419` / `real@301,730 drill@275,704` / `gate@58,486` 与当前文件的行（`# MIG-GATE` @60/@493、`# COEXIST-REAL` @308/@742）不一致——它们在 04-05 后续提交与 WR-04 的块内注释扩写之前记录。**读数本身**本趟逐行复现（12 次 gate + 四态 real），所以不是证据失真；但想按行定位块的人会被误导。
3. **`04-REVIEW.md` frontmatter 仍是 `issues_found`**（时点记录），与 disposition 账本的 11/11 fixed 并存；解释见上。
4. **`/tmp` 里有本 phase 之前的残留**：`/tmp/dsh-chk-*`（11-14 01:13）、`/tmp/dsh-hl-*`（01:15）、`/tmp/dsh-probe-*`（00:41）、`/tmp/dsh-after-verify.txt`（11-12）——都不是 phase 4 的演练 home（`dsh-mig` / `dsh-coex` / `dsh-mis` / `dsh-gap2` 为 0），也与本轮无关；下一轮清理 `/tmp` 时不要把它们误记为 phase 4 的残留。
5. **`chmod` 在本执行环境被 SIGKILL**（`rc=137`），这是 04-REVIEW.md `:599` 记录过的同一现象。任何「用可执行桩脚本替换 `dsh`」的 fixture 都会得到假红；正确做法是 `export -f dsh` 函数桩（块文本不变）。建议写进本仓的验证方法论，免得下一位 verifier 再踩。
6. **`npm test` / `prepack` 仍不带 `--test-concurrency=1`**（既有结构性假红隐患，跨 phase 债务，不属 phase 4 改动面；`04-VALIDATION.md:42-46` 已登记）。本趟按要求只用串行形态。

---

_Verified: 2026-11-15T03:33:19Z_
_Verifier: Claude (gsd-verifier)_