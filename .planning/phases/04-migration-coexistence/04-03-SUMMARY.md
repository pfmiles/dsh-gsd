---
phase: 04-migration-coexistence
plan: 03
subsystem: docs
tags: [version-mismatch, dsh-upgrade, four-gates, drill-evidence, bilingual-docs, fence-aware-guard, pin-alignment, build-count]

# Dependency graph
requires:
  - phase: 04-migration-coexistence
    plan: 01
    provides: "DRILL-1 校准出的 dump 判据形态（同一 home 的 `H0`/`H1` 前后关系 + 逐 bundle 标签出现 + stderr 字节数），本计划的 `H1 = H0 − 1` 直接照它写"
  - phase: 04-migration-coexistence
    plan: 02
    provides: "`docs/MIGRATION.md` §② 的收尾位置（追加时两半各 2 个 `##`），本计划追加 §③ 后各变 3；围栏感知计数的现场教训"
  - phase: 02-compat-matrix
    provides: "`build/assets/pins.json` + `build/lib/check-pins.mjs` 的 pin 对齐机制（步骤 (j) 的逐字比较与 exit 2 口径）"
provides:
  - "`docs/MIGRATION.md` §③（zh/en 各 3 个 `###` + 五列四行症状表 + pin 对齐边界 + 三条修复路径）：两半各恰 3 个 `##`，四层症状全部来自本轮实测"
  - "`tests/docs-consistency.test.mjs` 的 ⑭：围栏感知的双语入口 + 文档同构守卫（docs-consistency 13→14，全量 37→38）"
  - "`BUILD.md:16` 唯一活体计数 `预期 37/37` → 实测 `预期 38/38`（其余措辞逐字未动）"
  - "`04-DRILL-EVIDENCE.md` 的 DRILL-2 段：静态门三态 + bundle 级注入（含 `EXIT=0` 假绿证据）+ row 级 boot 的 `ROWLEVEL MEASURED` 逐字"
affects: [04-04, 05-end-to-end-uat]

# Actuals (#2632) — 与 PLAN 的 estimate 配对，同一尺度（chars/4 over realized diff）
actuals:
  tokens: 4644
  tasks: 3
  commits: 5
  plan_head_before: bc1f87ca9a17b3e114aaf22364284623a17469fe
  plan_head_after: d6841444fd394087af81a1f8e47ef29bf22125d2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "「逐字 symptom」必须从宿主 stderr 原样搬，且**不要**把它包进单反引号代码段——代码段里不能嵌反引号，转义出的 `\\`` 会让「逐字」在字节层面失真；正确形态是纯文本 + 内嵌单个 code span"
    - "围栏感知的标题计数 = 先给每行打 in-fence 标记（判据：行首三个反引号），再只在围栏外 `^# ` / `^## `；naive `grep -c '^# '` 在本文档上是 28 而真实 H1 是 2"
    - "错配演练分两段、用途不同：静态注入（pins.json）证 CI 有牙但产不出运行时症状；运行时症状必须从已装包的 `engines.dsh` / bridge 包 manifest 注入"
    - "假绿证据正着记：`injected: EXIT=0` 是被记录的观测值，不是失败条件；判据是 stderr + 标头 `H1 = H0 − 1` + 逐 bundle 标签出现 + row 集合"
    - "突变实验证明守卫有牙：`##` 减一 → ⑭ fail 1（可区分文案）；围栏内注入行首 `# ` → naive 计数 29 而 ⑭ 仍 14/14"

key-files:
  created: []
  modified:
    - docs/MIGRATION.md
    - tests/docs-consistency.test.mjs
    - BUILD.md
    - .planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md

key-decisions:
  - "§③ 的 zh 半插在 §② 收尾之后、独占 `---` 之前；en 半追加在文件末尾——两半的 `##` 因此各从 2 推到 3，D-11 的同构顺序不必再调（延续 04-02 的落位裁决）"
  - "④ 层症状表的 ③ 行按计划写成 `dsh: skipping profile bundle \"<name>\": …` 形状（`<name>` 占位），具体 `dsh-gsd` 实例的 526 B 逐字原文放在 DRILL-2 证据册；③′ 行则**整段逐字**搬进表里，因为该行是本轮唯一一次 boot 实测"
  - "③′ 的诚实阀门落在「实测到了」这一支：boot 真的打印了 `dsh: disabling profile plugin row \"gsd-hooks-bridge\"`（RESEARCH 的 Assumptions Log A4 由此从 [ASSUMED] 升级为实测），同时把 boot 随后的 `MISSING_CREDENTIAL` 一并记下，避免读者误以为完整会话跑通"
  - "`BUILD.md:16` 的 38 来自 `node --test --test-concurrency=1 tests/*.test.mjs` 的 `ℹ tests 38`，不是 13+1 或 37+1 的算术；同一提交内落地，避免「测试 38 条而文档写 37/37」的中间态"
  - "⑭ 的切片复用既有的 `readmeZh` / `readmeEn`，标题计数自带围栏感知；断言只追加在文件末尾，①–⑬ 零改动（`git diff --numstat` = `60 0`）"

patterns-established:
  - "双语同构守卫的「结构 + 语言」双判据：围栏感知 H1=2 切两半 → 每半 `##` 恰 3 → zh 含 CJK / en 零 CJK；这比「全文出现 ≥1 次」更难被单侧补写蒙过"
  - "证据册里同时留「正证据」与「负证据」：静态门 exit 2 是正证据，`injected: EXIT=0` 与 boot 的 `MISSING_CREDENTIAL` 是负证据；两者都用同一张 `(操作, UTC, 输出要点)` 表承载"
  - "运行时演练的隔离三件套：`mktemp -d` 的 `DSH_HOME` + 临时 `npm_config_prefix` + 只在临时 home 内 `add`/`dump`/boot；真实 `~/.dsh` 用 `find -newermt` 事后确证零写入（并如实区分宿主自身会话写入）"

requirements-completed: [HOOK-05]

# Coverage metadata (#1602) — 每个交付物一条，驱动 verify-work 的确定性 UAT 路由
coverage:
  - id: D1
    description: "`docs/MIGRATION.md` §③ 双语四层症状表：两半各 3 个 `##` + 3 个 `###`，四个层标签（`① preflight` / `② post-install` / `③ load` / `③′ load`）都做行首，五条逐字症状串两半都在，③ 行明写「退出码仍是 0」/`the exit code stays 0`"
    requirement: HOOK-05
    verification:
      - kind: unit
        ref: "04-03 Task 3 <automated> §③ 结构门 → `section-3 ok`；`node --test tests/docs-consistency.test.mjs` ⑭ → tests 14 / pass 14"
        status: pass
    human_judgment: false
  - id: D2
    description: "pin 对齐策略与静态门边界：`pins.json` 是行↔pin 唯一真源、`check-pins` 步骤 (j) 逐字比较、该 peer 只被这一步消费 ⇒ 改 pins 只红 CI、产不出运行时症状（两半都含 `pins.json` / `check-pins` 与该边界陈述）"
    requirement: HOOK-05
    verification:
      - kind: unit
        ref: "§③ 结构门对 `pins.json`/`check-pins` 的逐半断言；Task 1 `static-pin-gate ok: drift exit=2`（三态 0 → 2 → 0，sha256 复原一致）"
        status: pass
    human_judgment: false
  - id: D3
    description: "修复路径三条齐全且顺序正确（装匹配版本 → `allow-version` 精确二元组豁免 → 绝不 `--force`），两半都含 `allow-version` 与 `--force`，后者在「不要用」语境"
    requirement: HOOK-05
    verification:
      - kind: unit
        ref: "§③ 结构门（`allow-version` / `--force` 逐半断言）→ `section-3 ok`"
        status: pass
    human_judgment: false
  - id: D4
    description: "⑭ 围栏感知守卫落地且真的有牙：docs-consistency 13 → 14、全量 37 → 38、`BUILD.md:16` 同提交 38/38；突变实验证明 `##` 减一即红、围栏内行首 `# ` 不误判"
    requirement: HOOK-05
    verification:
      - kind: unit
        ref: "`node --test tests/docs-consistency.test.mjs` → 14/14；`node --test --test-concurrency=1 tests/*.test.mjs` → tests 38 / fail 0 / cancelled 0；突变 M1 → fail 1（en 段 3→2）；突变 M2 → 仍 14/14 而 naive 计数 29"
        status: pass
    human_judgment: false
  - id: D5
    description: "DRILL-2 证据册：静态段三态 + bundle 级注入（EXIT=0 / 25→24 标头 / 1255→1243 行 / 标签消失 / stderr 恰 1 行 526 B）+ 复原 + row 级 boot 的 ROWLEVEL MEASURED 逐字"
    requirement: HOOK-05
    verification:
      - kind: integration
        ref: "04-03 Task 2 <automated> bash 块 → `DRILL-2 PASS`；证据门 → `drill-2-evidence ok`；交叉核对：doc / 证据册 / 宿主 stderr 三处逐字一致"
        status: pass
    human_judgment: false
  - id: D6
    description: "文档对脚本用户的可操作性：四层症状与三条修复路径是否足以让人自行定位「装上却没生效」，以及「退出码仍是 0」这条假绿警告是否讲清"
    requirement: HOOK-05
    verification: []
    human_judgment: true
    rationale: "机器只能证明结构与逐字串在场，证不了读者能否据此在真实 DSH 升级后完成定位与修复；这需要 verifier 以用户视角读一遍 §③。"

# Metrics
duration: 10 min
completed: 2026-11-13
status: complete
---

# Phase 4 Plan 3: 版本错配症状表与围栏感知守卫 Summary

**`docs/MIGRATION.md` §③ 把四层错配门写成双语五列四行表，每一格都从本轮实测抄来：静态注入 `pins.json` 的 `lines.022.peer` → `check-pins` exit 2（复原后 sha256 逐字节相同），运行时注入已装包的 `engines.dsh` → `EXIT=0` 但标头 25→24、行数 1255→1243、`# == dsh-gsd` 标签消失、stderr 恰 1 行 526 B，row 级 boot 更实拍到 `dsh: disabling profile plugin row "gsd-hooks-bridge"`（RESEARCH 的 A4 假设由此变为实测）；⑭ 用围栏感知的标题计数把「双语只写一半」变成机器判据（13→14，全量 37→38，`BUILD.md:16` 同提交 38/38）。**

## Performance

- **Duration:** 10 min
- **Started:** 2026-11-13T17:58:33Z
- **Completed:** 2026-11-13T18:08:36Z
- **Tasks:** 3 / 3
- **Files modified:** 4（全部为既有文件的追加/单行改写；无新建文件）
- **Commits:** 5（measured `git rev-list --count bc1f87c..d684144` = 3 任务 + 2 处逐字保真修复）

## Accomplishments

- **HOOK-05 的静态面被证明有牙且可复原**：把 `build/assets/pins.json` 的 `lines.022.peer` 由 `0.2.2-rc.1` 改成 `0.2.2-rc.2`，`node build/lib/check-pins.mjs --offline` 从 exit 0 变为 **exit 2**，stderr 逐字 167 B：`check-pins: peerDependencies @deepseek-ai/dsh-skill-filesystem mismatch — package.json '0.2.2-rc.1' vs pins.json peer '@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.2'`；复原后 sha256 回到 `45c643ea…a2bb`（与注入前**逐字节相同**），`lines.021.peer` 全程未动，工作树零残留。
- **HOOK-05 的运行时面被现场复现，包括最危险的那一层**：同一临时 home 里先量健康态基线 `H0 = 25` 标头 / `N0 = 1255` 行 / stderr **0 B** / bundles 3；把已装 `dsh-gsd` 的 `engines.dsh` 改成 `>=9.0.0` 后，`dsh --profile web --dump-config` **仍然 EXIT=0**，而标头 25→24、行数 1255→1243（差 12）、`# == dsh-gsd` 标签消失、`- id: gsd` 与 `- id: gsd-hooks-bridge` 各 0 行、stderr **恰 1 行 526 B** 含 `dsh: skipping profile bundle "dsh-gsd"`；复原后 `H2 = H0`、`N2 = N0`、stderr 回空。**「DSH 升级会 exit 0 地坏掉」这条因此有了可审计的逐字证据。**
- **③′ 的诚实阀门落在「实测到了」**：headless 派生 profile 里把 bridge 包 `@deepseek-ai/dsh-hooks-claude-code` 的 `engines.dsh` 改成 `>=9.0.0` 后做了一次有界 boot，stderr 首行逐字为 `dsh: disabling profile plugin row "gsd-hooks-bridge": …`（`ROWLEVEL MEASURED`）——这同时把 `04-RESEARCH.md` 的 Assumptions Log A4 从「源码推断」升级为「本机实测」。第二行是 `dsh: MISSING_CREDENTIAL …`，一并记录，不让读者误以为完整会话跑通。
- **NEVER `--force` / NEVER `allow-version` 的边界写进用户面文档**：§③ 的修复路径按「装匹配版本 → 精确二元组豁免（写 `compatibility.json`、升级任一版本即失效）→ 绝不 `--force`」排序，并说明 `--force` 只会得到「装上了但没生效」的假象。演练全程这两者出现次数均为 0——演练的目的是把坏状态**记录下来**，不是让它变绿。
- **「双语只写一半」变成机器判据**：⑭ 先按行首三个反引号给每行打 in-fence 标记，再只在围栏外数 `^# ` / `^## `——`docs/MIGRATION.md` 里有 26 行行首 `# 步骤 N` 注释（naive `grep -c '^# '` = 28，真实 H1 = 2），不分围栏的守卫会恒红。突变实验证明它有牙：把 en 半一个 `##` 降为 `###` → ⑭ `fail 1` 且文案点明「en 段应有 3 个二级标题…实际 2」；把一行 `# 假标题` 注入围栏内 → naive 计数升到 29 而 ⑭ 仍 14/14。
- **活体计数按实测同步**：全量串行 `node --test --test-concurrency=1 tests/*.test.mjs` 输出 `ℹ tests 38` / `ℹ pass 38` / `ℹ fail 0` / `ℹ cancelled 0`，`BUILD.md:16` 同提交改成 `预期 38/38`（该行其余措辞逐字保留，diff 恰 +1 −1）。

## Task Commits

Each task was committed atomically:

1. **Task 1: 静态 pin 门三态 + DRILL-2 静态段** - `4016bc2` (docs)
2. **Task 2: 运行时 bundle 级/row 级演练 + DRILL-2 运行时段** - `c401c4b` (docs)
3. **Task 3: §③ 双语成文 + ⑭ 守卫 + BUILD.md 38/38** - `e63edb3` (test)
4. **Fix: 证据册逐字行去掉 markdown 转义反斜杠** - `629f12b` (fix)
5. **Fix: §③ 引言措辞去掉与「禁止大概/应该/目测式表述」扫描冲突的字样** - `d684144` (docs)

**Plan metadata:** 与本次 SUMMARY 同提交（`docs(04-03): complete 版本错配症状表与围栏感知守卫 plan`，含 STATE/ROADMAP/REQUIREMENTS）

_Note: 本计划无 TDD 任务、无 checkpoint；3 个任务各自单提交，另有 2 个逐字保真修复提交（见 Deviations）。_

## Files Created/Modified

- `docs/MIGRATION.md`（改，+55 / −1 行；37229 B → 47821 B、413 → 467 行）— 两半各追加 §③：`## ③ DSH 升级 / 版本错配：症状 → 原因 → 修复` / `## ③ DSH upgrade / version mismatch: symptom to cause to fix`，其下各 3 个 `###`（四层门与逐字症状 / pin 对齐策略与静态门的边界 / 修复路径），症状表五列四行、四个层标签做行首。§①/§② 的内容零删改（413/413 行按序保留）。
- `tests/docs-consistency.test.mjs`（改，+60 / −0 行，纯追加）— 文件末尾追加 ⑭：复用 `readmeZh`/`readmeEn` 断言 README 两半各含 `docs/MIGRATION.md`；围栏感知地数 H1（恰 2）、按第二个 H1 切半、每半在围栏外恰 3 个 `##`；zh 含 CJK / en 零 CJK。①–⑬ 一条未改。
- `BUILD.md`（改 1 行）— `:16` 的 `预期 37/37` → `预期 38/38`（实测值），该行其余措辞逐字保留；`:17` / `:19` 未动。
- `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`（改，+34 / −1 行）— 新增 `## DRILL-2 — 版本错配`：静态段 3 行 + 运行时段 8 行 `(操作, UTC, 输出要点)` 三元组，段首声明「本段证明的是静态门、产不出运行时症状」，段尾写「运行时段证不了什么」。

## Decisions Made

- **§③ 的落位延续 04-02 的裁决**：zh 插在 §② 收尾之后、独占 `---` 之前；en 追加在末尾。这样两半的 `##` 各从 2 推到 3，D-11 的同构顺序不需要重排。
- **③ 行用计划指定的 `<name>` 占位形态，③′ 行整段逐字**：③ 的逐字实例（526 B，含 `dsh-gsd`）放在证据册；③′ 是本轮唯一一次 boot 实测，因此整段搬进表里，读者能直接对着 stderr 比对。
- **`BUILD.md:16` 的 38 只认实测输出**：以 `node --test --test-concurrency=1 tests/*.test.mjs` 的 `ℹ tests 38` 为准，不做 13+1 或 37+1 的算术推导；与 ⑭ 同一次提交落地。
- **⑭ 只追加、不重构**：复用 `:29-33` 的切片变量，标题计数自带围栏感知；断言放在文件末尾意味着 ①–⑬ 的 diff 为空（`git diff --numstat` = `60 0`）。
- **运行时演练不在「装旧脚本↔卸载」窗口里 dump**：本计划根本没装旧脚本（那是 04-01 的演练），因此 04-01 记录的 `YAMLException` 窗口在本轮不出现——这一点在写 §③ 时没有被误当成版本错配的症状。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `docs/MIGRATION.md` 无文件末尾换行，追加 §③ 后 git 记 1 行删除**
- **Found during:** Task 3（`git diff HEAD --numstat -- docs/MIGRATION.md` 复核「纯追加」时）
- **Issue:** 该文件在 HEAD 上末尾没有换行符（`endsWithNewline: false`）。在末行之后追加内容必然改变该行的「EOF 无换行」标记，于是 git 把末行原样重发射并记成 1 行删除（`--numstat` = `55 1`）。**这与 04-02 的偏差同源、同形。**
- **Fix:** 不改任何既有内容，接受这 1 行机械位移；§③ 的末尾同样保持「无文件末尾换行」，不扩大位移面。
- **Files modified:** `docs/MIGRATION.md`
- **Verification:** subsequence 检查 `base lines 413 / matched in order 413`（零内容删除）；§③ 结构门 `section-3 ok`；docs-consistency 14/14。
- **Committed in:** `e63edb3`（Task 3 提交）

**2. [Rule 1 - Bug] 证据册的「逐字」引用里出现了 markdown 转义反斜杠**
- **Found during:** Task 3（把 ③′ 的逐字行搬进 §③ 时，比对 `/tmp/m-boot.err` 失败）
- **Issue:** Task 2 的证据册把整段 stderr 包进了单个反引号代码段，为了在代码段里容纳消息自带的 `` ` `` 而写了 `` \`dsh plugin allow-version\` ``。Markdown 代码段内的反斜杠是字面量，于是「逐字」引用比真实 stderr 多了 4 个反斜杠——对一条以字节比对为判据的证据来说这是失真。
- **Fix:** 去掉外层代码段与转义，改为纯文本 + 内嵌单个 code span；现在证据册与 `docs/MIGRATION.md` 都**逐字节包含**真实 stderr 行（`ev.includes(bad)` / `ev.includes(boot)` / `doc.includes(boot)` 均为 true）。
- **Files modified:** `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`
- **Verification:** `node -e` 用 `/tmp/m-bad.err` 与 `/tmp/m-boot.err` 做 `includes` 断言；`grep -c '\\`'` = 0。
- **Committed in:** `629f12b`（修复提交）

**3. [Rule 1 - Bug] §③ 引言里的「已知会」字样会踩到本计划自己的措辞扫描**
- **Found during:** 计划级 verification 第 4 条（`grep -E '大概|应该|目测|已知会'` 扫描两份文档时）
- **Issue:** 引言原句「不是"已知会怎样"的复述」在否定语境里引用了该词，但扫描是字面的，会让 verifier 读到一条命中。仓内另两处命中是 04-01/04-02 既有的**禁令本身**（`不需要靠"应该没问题"来收尾` / `禁止"大概 / 应该 / 目测"式表述`），属历史文本，未改。
- **Fix:** 把本计划新增的这句改成「不是对旧记录的转述」，语义不变、零信息损失。
- **Files modified:** `docs/MIGRATION.md`
- **Verification:** `grep -n -E '已知会' docs/MIGRATION.md` → 无输出；结构门 `shape ok: H1=2 zh##=3 en##=3`；docs-consistency 14/14。
- **Committed in:** `d684144`（修复提交）

---

**Total deviations:** 3 auto-fixed（1 blocking / 2 bug）
**Impact on plan:** 无 scope creep。① 是「无 EOF 换行的文件在其末行之后追加」的物理必然，已用 subsequence 证明零内容删除；② 与 ③ 都只动本计划自己新增的文字，且都是为了「逐字」与「措辞扫描」这两条硬判据真正成立。三个交付物的语义、位置与断言强度均未改变。

## Issues Encountered

- **row 级 boot 无法跑完**：`dsh misrow "say ok"` 在打印 `dsh: disabling profile plugin row "gsd-hooks-bridge"` 之后，第二行以 `dsh: MISSING_CREDENTIAL: llm-deepseek: no API key for provider route "deepseek-official"` 终止。**row 级 gate 先于凭据失败发生**，所以症状是实测到的；但「完整会话行为」没有被证明，这一点同时写进了证据册的「运行时段证不了什么」与 §③ 的 ③′ 单元格。
- **`npm pack` 的 `prepack` 仍然没有 `--test-concurrency=1`**（`package.json` 的 `prepack` 未带该参数）：本轮触发一次，37/37 全绿、未出现已知的 `gate C: no SKILL.md under skills/gsd-*` 假红。这是既有的结构性隐患（**不属本 phase 范围**，`04-VALIDATION.md:33-35` 已记），本次未改 `package.json`。
- **真实 `~/.dsh` 的观测口径**：演练全程 `DSH_HOME` 都在 `/tmp`，`find ~/.dsh -newermt` 只命中本会话自身的 `sessions/` 与 `storages/session_projcache/`（由正在运行的宿主进程更新）。证据册照实写成「非演练写入」，而不是简单的「零写入」——后者会被这条命中推翻。
- **无认证门（Authentication Gates）**：本计划零推送、零发布；`dsh plugin add` 只装本仓自己打出的 tarball 到临时 home。`MISSING_CREDENTIAL` 属演练环境的预期限制，不是认证门。

## User Setup Required

None - no external service configuration required.（演练全部在 `/tmp/dsh-mis-wgkIJM` 与临时 npm prefix 内完成；真实 `~/.dsh`、真实全局 npm prefix 均未写入；仓根无 `*.tgz` 残留。）

## Next Phase Readiness

- **04-04 可开工**：`docs/MIGRATION.md` 的三节结构已完整（两半各 3 个 `##`），⑭ 会挡住「只写一半」；`04-04` 的 MIG-04 并存验证与本节不共享文件，唯一的共同纪律是「同一 home 的前后关系」判据（本计划又实测了一次 `H0`/`H1` 关系）。
- **Phase 5 可直接消费**：§③ 的四层症状表与三条修复路径是真实 DSH 升级后的排障入口；`04-DRILL-EVIDENCE.md` 的 DRILL-2 段可作为「症状来自哪一次实测」的可审计出处。
- **遗留观察（不阻塞）**：`prepack` 缺少 `--test-concurrency=1` 的假红隐患仍在（`package.json` 不属本 phase 改动面）；`DRILL-3`（并存）留给 `04-04`。
- **需求状态**：`requirements.ready-ids` 对 HOOK-05 返回 `1/1 requirement(s) ready to mark complete`（无兄弟 plan 共享该 ID），已落 Complete。Phase 4 余下仅 MIG-04（04-04）。

---

*Phase: 04-migration-coexistence*
*Completed: 2026-11-13*

## Verification (plan-level)

| # | 项 | 命令 / 判据 | 结果 |
| -- | -- | ----------- | ---- |
| 1 | Task 1 静态 pin 门三态 | `04-03` Task 1 `<automated>` bash 块 | **PASS** → `static-pin-gate ok: drift exit=2`；`lines.021.peer` 前后同为 `>=0.2.1-rc.5 <0.2.2-0`；`git status --porcelain` / `git diff HEAD --stat` 对 `pins.json` 均为空 |
| 2 | Task 2 运行时 drill | `04-03` Task 2 `<automated>` bash 块 | **PASS** → `DRILL-2 PASS`：`EXIT=0` / 24=25−1 标头 / 1243<1255 行 / `gsd_label=0` / `gsd_rows=0` / `skip_lines=1`；复原 25/1255/0 B；`ROWLEVEL MEASURED` |
| 3 | Task 2 证据册形状 | 第二个 `<automated>` node 门 | **PASS** → `drill-2-evidence ok` |
| 4 | Task 3 docs-consistency | `node --test tests/docs-consistency.test.mjs` | **PASS** → `ℹ tests 14` / `pass 14` / `fail 0` |
| 5 | Task 3 全量串行 | `node --test --test-concurrency=1 tests/*.test.mjs` | **PASS** → `ℹ tests 38` / `pass 38` / `fail 0` / `cancelled 0` |
| 6 | Task 3 活体计数 | `grep -c '预期 38/38' BUILD.md` = 1；`预计 37/37` = 0；`git diff bc1f87c -- BUILD.md` = `1 1` | **PASS** |
| 7 | §③ 结构 | Task 3 的 `node -e` 形状门 | **PASS** → `section-3 ok`（H1=2 / 两半 `##` 各 3 / 四层标签行首 / 五条逐字症状 / `allow-version` / `--force` / en 半零 CJK / 零 `/Users/`） |
| 8 | 交叉核对 | doc ↔ 证据册 ↔ 宿主 stderr 三处逐字 | **PASS** → skip 行在两处、row 行在三处均为 `includes` 为真 |
| 9 | 工作树复核 | `git diff bc1f87c --name-status` / `git status --porcelain` / `ls *.tgz` | **PASS** → 恰 4 个文件（`M` ×4）；`build/assets/pins.json` 与 `package.json` 零 diff（sha256 仍 `45c643ea…a2bb`）；porcelain 空；无 `*.tgz` |
| 10 | 突变实验（⑭ 有牙） | M1：en 半 `##` 降级；M2：围栏内注入 `# 假标题` | **M1 FAIL 1**（`en 段应有 3 个二级标题…实际 2`）；**M2 仍 14/14**（naive 计数 29）——两次突变后 `docs/MIGRATION.md` 均复原为 sha256 `814fdba8…929c` 逐字节相同 |

## Self-Check: PASSED

- **Created files exist:** `04-03-SUMMARY.md` FOUND；`docs/MIGRATION.md` FOUND（47821 B）；`tests/docs-consistency.test.mjs` FOUND（14 条 `test(`）；`BUILD.md` FOUND（`预期 38/38` 恰 1 处）
- **Commits exist（ancestor of HEAD）:** `4016bc2` FOUND（Task 1）、`c401c4b` FOUND（Task 2）、`e63edb3` FOUND（Task 3）、`629f12b` / `d684144` FOUND（两处逐字保真修复）；measured `commits: 5`（`git rev-list --count bc1f87ca..d684144`）
- **Evaluation scope:** `gsd_run check evaluation-scope --plan 04-03 --commits-only --raw` → `status: resolved`、`source: plan-subjects`、`commits` 5 条
- **Acceptance criteria re-run after all commits:** Task 1 三段（`static-pin-gate ok` / `lines.021.peer` 未动 / 工作树空）、Task 2 两段（`DRILL-2 PASS` / `drill-2-evidence ok`）、Task 3 四段（`docs-consistency` 14/14、全量串行 38/38 fail 0 cancelled 0、`预期 38/38` 恰 1、`section-3 ok`）全部通过
- **Plan-level verification:** 10 项逐条记录于上表，全部 PASS；两次突变实验均在复原后验证 `docs/MIGRATION.md` 的 sha256 与突变前逐字节相同
- **Summary frontmatter:** `requirements-completed: [HOOK-05]` 与 PLAN frontmatter 逐字一致；`actuals` 三值 + `plan_head_before` / `plan_head_after` 齐备；`status: complete`