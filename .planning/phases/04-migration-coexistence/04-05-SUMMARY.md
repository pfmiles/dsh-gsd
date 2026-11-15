---
phase: 04-migration-coexistence
plan: 05
subsystem: docs
tags: [migration, runbook, bilingual, bash-gate, dsh, gap-closure]

# Dependency graph
requires:
  - phase: 04-migration-coexistence
    provides: 04-01 的 §① runbook 与 DRILL-1 读数 / 04-03 的围栏感知 ⑭ 与 38 条测试基线 / 04-04 的步骤 6 与 DRILL-3（24→27）
provides:
  - 步骤 1 的可执行双面硬门（面 1 = skills 基线 + undecided profile；面 2a/2b；机器级 ABSENT|CLEAN|DIRTY；逐 profile 裁决记录；exit 0/1/2；无-home 守卫）
  - 步骤 6 的三段结构（静态段认 DSH_HOME / 演练专用 COEXIST-DRILL / 零安装 COEXIST-REAL）与「增量 = 本次新装 bundle 数」单一口径
  - DRILL-4（六类合成 home 的 gate 三态 + COEXIST-REAL 四态）双向复核证据
  - 旧仓对照基线订正（314 行 / 章节链含 Compatibility）与 ⑭ 注释与现场对齐
affects: [04-verify, phase-05, migration-runbook]

# Actuals (#2632)
actuals:
  tokens: 18615
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "自定裁决块：退出码与打印的裁决行一一对应（宿主命令恒 0 的口径只约束宿主命令）"
    - "合成 home fixture 驱动文档内可粘贴块的负向/正向测试（零网络、零安装、不写真实 home）"
    - "listed ⇔ labeled 配对判据替代增量判据（期望集来自 home 自己的清单）"

key-files:
  created: []
  modified:
    - docs/MIGRATION.md
    - docs/oldrepo-link/README.md
    - docs/oldrepo-link/snippet.zh.md
    - tests/docs-consistency.test.mjs
    - .planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md

key-decisions:
  - "路线①而非路线②：把面 1 做成卸载前的可执行探针（skills 基线 + 哪些 profile 仍只靠 home 级技能），而不是把正文降级成「人工确认」"
  - "MIG_DECIDED_PROFILES 是逐 profile 的决定记录：命中集必须被完整覆盖（交集非空不够），机器级 DIRTY 无豁免，multirow 与 bridge/undecided 同权"
  - "步骤 6 分形态而非挪 H0：真实迁移形态零安装、判 listed ⇔ labeled；增量口径统一为「本次新装 bundle 数」（演练 +3 / 步骤 5 +1）"
  - "块首契约改写成「标记行 → 紧接 export；无标记块首行即 export」，并逐块由门断言（旧的「第一行都是 export」在有标记块后为假）"
  - "四项 IN 与 WR-03 同批收口；不新增 test(、不动 BUILD.md / package.json（计数保持 14 / 38）"

patterns-established:
  - "文档即被测程序：把围栏块原样提取到合成 home 上跑，按退出码与裁决行判文档承诺是否成立"
  - "机器级三态 ABSENT / CLEAN / DIRTY：文件存在不等于脏，缺失也不等于干净"

requirements-completed: [MIG-01, MIG-04]

coverage:
  - id: D1
    description: "步骤 1 的 MIG-GATE 块：面 1（skills=N + undecided）+ 面 2a/2b + 机器级三态 + 逐 profile 覆盖裁决，exit 0/1/2（zh/en 两半各一块）"
    requirement: "MIG-01"
    verification:
      - kind: integration
        ref: "04-05-PLAN.md Task 1 <automated> #1 — 从 docs/MIGRATION.md 提取 MIG-GATE 块，在 6 类合成 home 上 11 次运行（risky/decided/disjoint/clean/dirty/CLEAN/multirow×2/two-profile×2/no-home）"
        status: pass
    human_judgment: false
  - id: D2
    description: "MIG_DECIDED_PROFILES 的语义（覆盖而非交集、机器级无豁免、multirow 是 profile 级面、PASS 的语义边界）与「runbook 里恰两个以退出码为判据的块」"
    requirement: "MIG-01"
    verification:
      - kind: integration
        ref: "04-05-PLAN.md Task 1 <automated> #1 — 两 profile 只裁决一个 exit=1、裁决集与命中集不相交 exit=1、multirow 未裁决 1 / 已裁决 0"
        status: pass
      - kind: other
        ref: "04-05-PLAN.md Task 1 <automated> #2 — 语义锚点逐半断言（不是机器级那一面 / 不表示记录是对的 / 宿主机 exit code）"
        status: pass
    human_judgment: false
  - id: D3
    description: "步骤 6 的 COEXIST-REAL 真实迁移形态：零安装、listed ⇔ labeled、期望 id 各恰 1、uniq -d 空、stderr 0 字节、required-absent"
    requirement: "MIG-04"
    verification:
      - kind: integration
        ref: "04-05-PLAN.md Task 2 <automated> #1 — npm pack 装进一次性 home 后四态：healthy exit=0 / engines.dsh 注入 exit=1（label MISSING + row gsd 0）/ 恢复 exit=0 / remove 后 required-absent:dsh-gsd"
        status: pass
    human_judgment: false
  - id: D4
    description: "增量判据单一口径（增量 = 本次新装 bundle 数）与演练块 / 真实形态的形态隔离（演练块无 $HOME/.dsh、无「把第一行换成」；全文无「步骤 4 之后重跑同一组命令」）"
    requirement: "MIG-04"
    verification:
      - kind: other
        ref: "04-05-PLAN.md Task 2 <automated> #2 — gap2-doc：H0 + 3 在演练块内、真实块无 plugin add / 无 H0|H1、两半各一 DRILL/REAL、残留即红三条断言"
        status: pass
    human_judgment: true
    rationale: "27 = 24 + 3 是 DRILL-3 的已签名读数、本计划未重跑 DRILL-3；门只断言文档与该口径一致，不重算那三个数。"
  - id: D5
    description: "WR-03 读数三分归类（前三行随 home 长度/版本变、后三行包内产物、最后一行随 profile 的 bundle 组合变）与 en 同构"
    verification:
      - kind: other
        ref: "04-05-PLAN.md Task 3 <automated> #2 — nonblocking ok（前三行/最后一行/3195 - 7/24 → 25/bundle；禁形 前两行、后四行）"
        status: pass
    human_judgment: false
  - id: D6
    description: "IN-03：docs/oldrepo-link 的每处行数读数 314、README 章节链含 ## Compatibility"
    verification:
      - kind: other
        ref: "04-05-PLAN.md Task 3 <automated> #2 — 314 行恰出现在 2 个文件；该目录无第二套行数口径；## Compatibility 在场"
        status: pass
    human_judgment: false
  - id: D7
    description: "IN-04：⑭ 的注释与断言文案引用真实存在的注释形态（# 面 2a：… / # A 阴性对照），不写死会增长的计数，断言逻辑与条数不变"
    verification:
      - kind: integration
        ref: "node --test tests/docs-consistency.test.mjs → ℹ tests 14 / pass 14 / fail 0"
        status: pass
    human_judgment: false
  - id: D8
    description: "DRILL-4 证据段（A：gate 六类 fixture 三态；B：COEXIST-REAL 四态 + npm pack 的 ℹ tests 38）与证据册前言口径的显式例外说明"
    verification:
      - kind: other
        ref: "04-05-PLAN.md Task 1/2 <automated> 对证据册的 token 断言（GATE: ABORT / GATE: PASS / machine-level=CLEAN / COEXIST-REAL PASS|FAIL / required-absent / label dsh-gsd MISSING / 前言 / 宿主命令 / 例外 / 未重跑）"
        status: pass
    human_judgment: true
    rationale: "证据册的读数是我从真实运行的输出逐字粘贴的，但没有任何测试断言其数值保真度——verifier 必须按同一口径重推。"

# Metrics
duration: 13min
completed: 2026-11-15
status: complete
---

# Phase 4 Plan 05: 缺口闭合（GAP-1 / GAP-2 + WR-03 / IN-01..IN-04）Summary

**步骤 1 的硬门第一次有牙：`MIG-GATE` 块在卸载前真的能看到技能基线与「谁还只靠它们」并非零中止（逐 profile 裁决记录、机器级三态、exit 0/1/2）；步骤 6 拆成静态 / 演练专用 `COEXIST-DRILL` / 零安装 `COEXIST-REAL` 三段，真实迁移改用 listed ⇔ labeled 配对判据、不比较增量**

## Performance

- **Duration:** 13 min
- **Started:** 2026-11-15T02:43:45Z
- **Completed:** 2026-11-15T02:56:15Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- **GAP-1 闭合**：`docs/MIGRATION.md` 步骤 1 的块（zh/en 各一块，`# MIG-GATE` 块首）现打印六行状态（`skills=` / `profiles=… decided=` / `undecided=` / `bridge=` / `multirow=` / `machine-level=`）与三种裁决（`GATE: PASS` / `GATE: ABORT` / `GATE: HARD-ABORT`），退出码 0/1/2；命中集 = `undecided ∪ bridge ∪ multirow` 必须被 `MIG_DECIDED_PROFILES` **完整覆盖**（两个命中 profile 只裁决一个仍 exit 1）；机器级 `CLEAN` 放行、只有 `DIRTY` exit 2；无 `DSH_HOME` 的交互式 shell 由块内守卫走 `GATE: ABORT no-home` / exit 2。块的文档索引（54 行级）早于 `--uninstall` 块（第 3 个围栏块），由提取后的 index 断言。
- **GAP-2 闭合**：步骤 6 的引导句改成三段分工；静态段改认 `process.env.DSH_HOME`、四个来源全从 `profiles/<p>/node_modules/...` 取、缺包打印 `MISSING:` 不抛栈、单来源 `coexist-static SKIPPED`；演练块改为演练专用（`# COEXIST-DRILL`，`H0 + 3`，无 $HOME/.dsh、无「把第一行换成」）；新增零安装真实迁移形态（`# COEXIST-REAL`，listed ⇔ labeled + 在册 id 各 1 + `uniq -d` 空 + stderr 0 字节 + `required-absent:<bundle>`）。
- **非阻塞项**：WR-03 三分归类、IN-01（静态块认 DSH_HOME + `:14` 块首契约重写）、IN-02（四处计数改两步式，全文 `|| echo 0` 归零）、IN-03（旧仓 314 行 + `## Compatibility`）、IN-04（⑭ 注释引真实形态、去写死计数）全部落地。
- **不做的事有机器证明**：`docs-consistency` 仍 14 条、全量仍 `ℹ tests 38`、`BUILD.md` / `package.json` 零 diff、无新增 `scripts/`、真实 ~/.dsh 零写入、无 dsh-gsd-*.tgz 残留。

## Task Commits

Each task was committed atomically:

1. **Task 1: 步骤 1 硬门从「承诺两个面」变成「可执行的双面裁决」** - `1a6f437` (docs)
2. **Task 2: 步骤 6 拆形态（COEXIST-DRILL / COEXIST-REAL）+ 增量口径统一** - `8dfeafe` (docs)
3. **Task 3: WR-03 / IN-03 / IN-04 读数与注释收口** - `a7db7a6` (docs)

**Plan metadata:** `（本 SUMMARY 提交）` (docs: complete plan)

## Files Created/Modified

- `docs/MIGRATION.md` — 步骤 1 的 `MIG-GATE` 双面硬门与 `MIG_DECIDED_PROFILES` 语义；`### 步骤 0` 的块首契约（标记共存）；步骤 5 的两处 `|| echo 0` 与项 A 注释；步骤 6 的三段（静态 / `COEXIST-DRILL` / `COEXIST-REAL`）与 exit-code 口径限定；0-B 的 `H0` 取法与 `--dump-config` 写副作用；WR-03 的三分归类（两半）
- `docs/oldrepo-link/README.md` — 行数读数 314（`wc -l` 实测）；章节链补 `## Compatibility`
- `docs/oldrepo-link/snippet.zh.md` — 同一处行数读数同步 314（`04-VERIFICATION.md:259` 点名要求）
- `tests/docs-consistency.test.mjs` — ⑭ 的注释与断言文案改引真实存在的注释形态（`# 面 2a：…` / `# A 阴性对照`），去掉写死计数；断言逻辑与条数不变（14）
- `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` — 新增 `## DRILL-4`（A：六类合成 home 的 gate 三态；B：`COEXIST-REAL` 四态 + `npm pack` 的 `ℹ tests 38`）；段首写明它是前言「exit code 一律不作判据」的显式例外（只约束宿主命令）

## Decisions Made

- **选路线①（补卸载前探针）而不是路线②（把正文降级成人工确认）**：D-03 的第二个触发条件只有机器可读才可能提前中止无条件的 `rm -rf`；路线②等于承认 runbook 判不了这件事。
- **面 1 的判据不是「技能数 > 0」**：脚本装过的 home 里 `skills/gsd-*` 必然非空；真正的 profile 级信号是「它的 dsh.profile.bundles 里没有 `dsh-gsd`」，于是命中即中止仍然成立，而演练场不会因为这面而无法通过。
- **`MIG_DECIDED_PROFILES` 是记录不是开关**：覆盖必须完整（相交不够）、机器级脏不可裁决、`multirow` 与 bridge/undecided 同权；文档写明 PASS 只表示「有记录」不表示「记录对」。
- **真实迁移形态零安装 + listed ⇔ labeled**：增量恒等于新装 bundle 数（DRILL-3 的 `27 = 24 + 3`），真实迁移的新装数是 0；只有配对判据与「同层合成」同构。
- **块首契约改写**：旧的「每个可粘贴块的第一行都是 `export DSH_HOME=`」在有标记块之后为假，改写成「标记行 → 紧接 export；无标记块首行即 export」并由门逐块断言。
- **不把 REQUIREMENTS.md 翻成 Complete**：本 phase 的 MIG-01 / MIG-04 此前已按缺口回退为 pending，计划明写「本次闭合后由 verifier 重判」；SUMMARY 保留 `requirements-completed: [MIG-01, MIG-04]` 作为本计划声明的范围，实际判定留给 verifier。

## Deviations from Plan

None - plan executed exactly as written.

（两处过程性说明，不构成偏离：① Task 1 第一次提交前发现 `MIG-GATE` 块把三条说明性注释放在标记行与 `export DSH_HOME=` 之间，违反本计划自己要求的块首形态——当场把注释移进子 shell，`gap1-doc-evidence` 的 `does not put export DSH_HOME= on the line immediately after the marker` 这条红消息正是为它准备的；② Task 3 的 ⑭ 注释初稿把 `# 步骤 N` 写进「这种写法不存在」的否定句里，仍被 `includes("# 步骤 N")` 判红——改成「行首写步骤编号那种注释形态」，门转绿。）

## Issues Encountered

- `gap2-doc` 在 Task 2 的第一轮是「证据册缺 `COEXIST-REAL PASS`」的红：该门的顺序是先验文档、再验证据册，所以必须先真跑 `COEXIST-REAL`（含 `npm pack` → 全量 build + 全量测试）拿到真实裁决行，才能补 DRILL-4；本轮按此顺序执行，证据行逐字来自运行输出。
- `npm pack` 会重写构建树（`skills/` / `gsd-core/` 等，均已 gitignore）并跑全量测试；本轮所有 build/test/`npm pack` 与 gate 均串行执行，无并发。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **可重判的两条 must-have**：GAP-1（`docs/MIGRATION.md` 步骤 1 的块）+ GAP-2（步骤 6 的三段与 `COEXIST-REAL`）。重判建议直接按 04-DRILL-EVIDENCE.md 的 DRILL-4-A / DRILL-4-B 复推，不必重跑 DRILL-1/2/3；若要现场复验，04-05-PLAN.md 的 7 个 `<automated>` 块本次全部通过（含一次 `npm pack`）。
- **REQUIREMENTS.md 未改动**（MIG-01 / MIG-04 仍 pending），由 verifier 在重判后决定是否翻 `[x]`；ROADMAP.md 由编排器维护，本计划未触碰。
- **留给 Phase 5**：`@jiangzhenguo/dsh-codegraph` 的同层合成仍只有行级静态证据（G-4）；真实 ~/.dsh 的整体迁移与 UAT-01..05 仍属 Phase 5。
- **已知边界**：DRILL-4 的裁决变量是人写的记录，门只判「是否已裁决」，判不了「裁决对不对」；合成/临时 home ≠ 用户真实 profile。


## Gate Results（最终提交树上的实跑）

- 3/3 tasks 完成并按计划逐个提交：`1a6f437` / `8dfeafe` / `a7db7a6`（三次提交都触发了仓库 hooks，未使用 `--no-verify`）
- 7/7 `<automated>` 块在**最终提交树**上重跑通过：gate1 `GAP1-GATE PASS`、gate2 `gap1-doc-evidence ok`、gate3 `COEXIST-REAL PASS (drill)`（healthy exit=0 / bundle-skipped exit=1 / restored exit=0 / absent exit=1）、gate4 `gap2-doc ok`、gate5 `ℹ tests 14 / pass 14 / fail 0`、gate6 `nonblocking ok`、gate7 `ℹ tests 38 / pass 38 / fail 0`
- 工作树对本计划的四个交付文件之外零改动：`BUILD.md` / `package.json` 零 diff；`git status --porcelain` 只余编排器的 `.planning/STATE.md` 待随本提交更新；仓根无 dsh-gsd-*.tgz
- 真实 ~/.dsh 零写入：DRILL-4 的全部写动作都在 `mktemp -d` 的合成 / 一次性 home 内

## Self-Check: PASSED

3/3 tasks committed (`1a6f437` / `8dfeafe` / `a7db7a6`), and all 7 automated gates were re-run green on the final committed tree; the per-gate readings are in Gate Results above.
