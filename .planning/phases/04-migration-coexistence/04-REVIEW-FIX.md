---
phase: 04-migration-coexistence
fixed_at: 2026-11-15T03:19:49Z
review_path: .planning/phases/04-migration-coexistence/04-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 4: Code Review Fix Report

**Fixed at:** 2026-11-15T03:19:49Z
**Source review:** `.planning/phases/04-migration-coexistence/04-REVIEW.md`
**Iteration:** 1
**Findings in scope:** 5（WR-04 / WR-05 / IN-05 / IN-06 / IN-04）
**Fixed:** 5
**Skipped:** 0

**Verification location:** 主工作树（`workflow.use_worktrees=false`），即
`/Users/yue.weny/frontWorkspace/gsd-on-dsh/dsh-gsd`。下面所有命令都在该树内、以串行方式单独执行，
读数可从这个树直接复现。

## Fixed Issues

| ID | 原 severity | Commit | 改动文件 | 一句话 |
| --- | --- | --- | --- | --- |
| WR-04 | warning | `be46e9f` | `docs/MIGRATION.md`、`04-DRILL-EVIDENCE.md` | 去掉「恰有两个」的裸计数，改为「裁决」与「失败信号」的区分，两半与证据册同措辞 |
| WR-05 | warning | `4044efc` | `docs/MIGRATION.md` | `COEXIST-REAL` 的标签正则也接受 `# == …, patched by <bundle>`，两半同改 |
| IN-05 | info | `3ead903` | `docs/MIGRATION.md` | 演练块三个 `<version>` 换成 `V_GSD` / `V_DEJA` / `V_MARKET`（`:?` 失败关闭）；步骤 4 的两处同形占位符一并改 |
| IN-06 | info | `e9f1e70` | `docs/MIGRATION.md` | 7 行实测值恰好划分成第 1–3 / 4–6 / 7 行，两半同构 |
| IN-04 | info | `67e590c` | `tests/docs-consistency.test.mjs` | 注释引用真实存在于 column-0 的 `# MIG-GATE…` / `# COEXIST-*…` / `# A 阴性对照` |

---

### WR-04: 「runbook 里恰有两个块以退出码为判据」为假——静态段也是（zh / en / 证据册三处）

**Files modified:** `docs/MIGRATION.md`、`.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`
**Commit:** `be46e9f`

**Applied fix:** 不再写「恰有两个」这种裸计数。两半的正文与块内注释都改成同一个区分：

- **裁决**（verdict-bearing）：`# MIG-GATE`（0 放行 / 1 命中未裁决 / 2 硬中止）与
  `# COEXIST-REAL`（0 通过 / 1 失败），退出码与打印的裁决行一一对应；
- **失败信号**（failure-signal）：步骤 6 静态段在重复 row id 时 `exit 1`，且同一句
  `coexist-static FAIL duplicate row ids: …` 也打在 stdout 上——它是信号，不是通过 / 不通过的裁决；
- 宿主命令（`--uninstall` / `--dump-config` / `plugin add`）仍恒 0，仍不作判据。

证据册 `04-DRILL-EVIDENCE.md:177` 的同一错误数字（「两个块」）同步改成「裁决块 + 失败信号」的措辞，
并保留「前言与 DRILL-1/2/3 一字未动」的边界说明。

**Executed proof:**

```text
$ grep -n "承载裁决" docs/MIGRATION.md
64:  # 宿主的 --uninstall 恒 0、不作判据；runbook 里以退出码承载裁决的是本块与步骤 6 的 COEXIST-REAL
135:**为什么本块的退出码可以作判据**：runbook 里以退出码**承载裁决**的块由本仓自己定义——本块与步骤 6 的真实迁移形态 `COEXIST-REAL`，它们的退出码与打印的裁决行一一对应。步骤 6 的静态段也会在重复 row id 时 `exit 1`，但那是 `coexist-static FAIL` 的**失败信号**（同一句也打在 stdout 上），不构成通过 / 不通过的裁决。宿主的 `--uninstall` / `--dump-config` / `plugin add` 仍恒 0，**不作**判据。

$ grep -n "exit-code \*\*verdicts\*\*" docs/MIGRATION.md
569:**Why this block may judge by exit code**: the runbook's exit-code **verdicts** are defined by this repository itself — this block and step 6's real-migration form `COEXIST-REAL` — and their exit codes map one-to-one onto the verdict lines they print. Step 6's static part also exits 1 on duplicate row ids, but that is a **failure signal** (`coexist-static FAIL` also prints on stdout), not a pass/fail verdict. The host's `--uninstall` / `--dump-config` / `plugin add` still always exit 0 and are **never** criteria.

$ grep -n "失败信号" .planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md | head -1
177:> **口径说明（本段是证据册前言的显式例外）**：… 步骤 6 静态段的 `exit 1` 是 `coexist-static FAIL`（重复 row id）的**失败信号**，不是裁决。…

$ grep -n "恰有两个\|exactly \*\*two\*\*\|only this block and step 6" docs/MIGRATION.md .planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md
（无输出；旧裸计数已不存在）
```

---

### WR-05: `COEXIST-REAL` 的标签判据没有实现它自己写下的 `# == …, patched by <bundle>` 形态

**Files modified:** `docs/MIGRATION.md`
**Commit:** `4044efc`

**Applied fix:** 两半（`:327` / `:761`）的正则从

```bash
"^# == (.*, )?${b}(, patched by .*)?$"
```

改为：

```bash
"^# == (.*, )?${b}(, patched by .*)?$|^# == .*patched by ${b}$"
```

两侧锚点 `^# == ` 与 `$` 都保留；第二种形态仍要求包名落在行尾的 `patched by` 槽位。
正文没有改（它本来就把两种形态都写成可接受）。

**Executed proof:** 用 `dsh` 函数桩 + `mktemp` 合成 home 跑两个半边的 `# COEXIST-REAL` 块，
每个 fixture 的 `profiles/web/package.json` 只列 `dsh-gsd`，dump 分别给三种标签形态：

```text
[patched/zh] exit=0 :: COEXIST-REAL label dsh-gsd PRESENT COEXIST-REAL PASS
[plain/zh]   exit=0 :: COEXIST-REAL label dsh-gsd PRESENT COEXIST-REAL PASS
[other/zh]   exit=1 :: COEXIST-REAL label dsh-gsd MISSING COEXIST-REAL FAIL label-missing:dsh-gsd
[patched/en] exit=0 :: COEXIST-REAL label dsh-gsd PRESENT COEXIST-REAL PASS
[plain/en]   exit=0 :: COEXIST-REAL label dsh-gsd PRESENT COEXIST-REAL PASS
[other/en]   exit=1 :: COEXIST-REAL label dsh-gsd MISSING COEXIST-REAL FAIL label-missing:dsh-gsd
```

fixture 逐字：

- `patched`：`# == @deepseek-ai/dsh-base, patched by dsh-gsd`
- `plain`：`# == dsh-gsd`
- `other`：`# == something-else, patched by other-pkg`

三种 fixture 的 dump 都带 `- id: gsd` 与 `- id: gsd-hooks-bridge` 各一行，所以 patched / plain
的 `exit=0` 与 `PASS` 不是被别的红/绿理由带出来的；`other` 的 1 只来自 `label-missing:dsh-gsd`。
patched 分支的输出里**没有** `label-missing:dsh-gsd`。两个块另过 `bash -n`（见 IN-05 的读数）。

---

### IN-05: 演练块的三个 `<version>` 让整块无法解析（`bash -n` 红），且一个占位符被三个不同的包共用

**Files modified:** `docs/MIGRATION.md`
**Commit:** `3ead903`

**Applied fix:** 演练块（zh `:279`、en `:713`）在 `export P=web` 之后、取 `H0` 之前加入三个
**失败关闭**变量，然后每条 `add` 用各自包的变量：

```bash
: "${V_GSD:?set V_GSD to the dsh-gsd version}"
: "${V_DEJA:?set V_DEJA to the dsh-deja version}"
: "${V_MARKET:?set V_MARKET to the dshmarket version}"
...
dsh plugin --profile "$P" add "dsh-gsd@$V_GSD"
dsh plugin --profile "$P" add "dsh-deja@$V_DEJA"
dsh plugin --profile "$P" add "dshmarket@$V_MARKET"
```

块首不变量未动：标记行仍是第一行，`export DSH_HOME=` 仍紧接在第二行。两个半边的命令行逐字同构
（`V_*` 的 `:?` 消息用 ASCII，两半相同）。

**`:181` / `:610` 的判定：** 这两行 `dsh plugin --profile web add dsh-gsd@<version>` 在**步骤 4 的
runnable bash fence 内**（不是散文/表格），且同样因裸 `<` `>` 而 `bash -n` 红，所以按同一办法修掉，
不是「illustrative and untouched」：块内加 `: "${V_GSD:?set V_GSD to the dsh-gsd version}"`，并把
tarball 与 registry 两个形态都改用 `"$V_GSD"`。修改后步骤 4 两块也过 `bash -n`。

**Executed proof:**

```text
$ # 从 docs/MIGRATION.md 按围栏提取 4 个块后逐一 bash -n
bash -n OK: drill-0.sh      # zh COEXIST-DRILL
bash -n OK: drill-1.sh      # en COEXIST-DRILL
bash -n OK: step4-0.sh      # zh 步骤 4
bash -n OK: step4-1.sh      # en 步骤 4
```

演练块的控制流用 `dsh` 函数桩执行（不调用真 `dsh`，不建真实 home）：

```text
--- drill/zh/green exit=0 ---
DSH_HOME=/tmp/dsh-coex-…（mktemp -d）
headers 1 -> 4
gsd x1
gsd-hooks-bridge x1
deja x1
dsh-market x1

--- drill/en/green exit=0 ---
（与 zh 逐行相同）

--- drill/zh/red exit=0 ---
headers 1 -> 3
MISSING layer: dsh-deja
gsd x2
gsd-hooks-bridge x1
deja x0
dsh-market x1
gsd
（en 同）

--- drill/zh/unset-V_GSD exit=127 ---
… line 5: V_GSD: set V_GSD to the dsh-gsd version
（en 同；在取 H0 / 三次 add 之前中止）
```

说明：该块的判定输出本身没有「末行 PASS/FAIL」（PASS/FAIL 由 `04-04-PLAN` 的外部 `automated`
块对表）；上面的 green/red 是块打印的四条判据读数，不是本块自己的退出码。

---

### IN-06: en 半把 3587/3856/72 叫成 "the last three rows"，与紧邻的 "the last row (`24 → 25`)" 自相矛盾

**Files modified:** `docs/MIGRATION.md`
**Commit:** `e9f1e70`

**Applied fix:** 表共 7 行。两半都改成显式行号，三组恰好覆盖 7 行、不重不漏：

- 第 1–3 行（随 home 长度 / 旧部署版本变；第 3 行 3195 按 `3195 - 7×(20-L)`）；
- 第 4–6 行（3587 / 3856 / 72，包内产物）；
- 第 7 行（`24 → 25`，随 profile 的 bundle 组合变）。

**Executed proof:**

```text
$ grep -n "第 4–6 行\|rows 4–6" docs/MIGRATION.md
367:…**前三行**（第 1–3 行）就变（第 3 行 3195 按 `3195 - 7×(20-L)` 随 home 长度走）；**第 4–6 行**（3587 / 3856 / 72）是包内产物，与路径、版本都无关；**第 7 行**（`24 → 25`）既不随路径也不随版本变，它随 profile 的 bundle 组合变（见步骤 5）。
801:…the first three rows (rows 1–3) move (row 3, 3195, follows `3195 - 7×(20-L)`); rows 4–6 (3587 / 3856 / 72) are in-package artifacts and are independent of both path and version; and row 7 (`24 → 25`) is independent of path and version as well — it follows the bundle composition of the profile (see step 5).

$ grep -n "后三行\|最后一行\|last three rows\|last row" docs/MIGRATION.md
（无输出）

$ # 逐半提取表格数据行（排除表头与分隔行）
table zh data rows: 7
table en data rows: 7
```

7 行原文（zh）：72 / 3084 B / 3195 B / 3587 B / 3856 B / 72 / `24 → 25`。第 1–3 行 + 第 4–6 行 +
第 7 行 = 7，故每一行恰好被归属一次。

---

### IN-04: 守卫 ⑭ 的说明与断言消息引用了不存在的 `# 步骤 N`，计数也已过期（28→30）

**Files modified:** `tests/docs-consistency.test.mjs`
**Commit:** `67e590c`

**Applied fix:** 注释 `:339-341` 改成引用真实存在于 column-0 的形态：

```text
// （真实形态如 `# MIG-GATE…` / `# COEXIST-DRILL…` / `# COEXIST-REAL…` / `# A 阴性对照`；
```

断言消息 `:373` 里同样把 `# 面 2a：…`（实际缩进 6 空格）换成 `# MIG-GATE…` / `# COEXIST-REAL…`。
**没有改任何断言逻辑或断言值**；改动只在两处字符串（一处注释、一处仅失败时可见的消息），
守卫的红/绿行为不变。`node --check tests/docs-consistency.test.mjs` 通过，全套 38/38 通过（见下）。

**Executed proof:**

```text
$ grep -n "真实形态如" tests/docs-consistency.test.mjs
340:// （真实形态如 `# MIG-GATE…` / `# COEXIST-DRILL…` / `# COEXIST-REAL…` / `# A 阴性对照`；

$ grep -n '^# MIG-GATE' docs/MIGRATION.md          → :60
$ grep -n '^# COEXIST-DRILL' docs/MIGRATION.md     → :279
$ grep -n '^# COEXIST-REAL' docs/MIGRATION.md      → :308
$ grep -n '^# A 阴性对照' docs/MIGRATION.md        → :196

$ grep -c '# drill form' docs/MIGRATION.md         → 0   （旧注释引用的形态确实不存在）
$ grep -c '^# 面 2a' docs/MIGRATION.md             → 0   （column-0 不存在）
$ grep -c '^[[:space:]]\+# 面 2a' docs/MIGRATION.md → 1  （它只在缩进 6 空格处存在）
```

---

## Verification

### 1. Full serial suite（主工作树，单独执行）

```text
$ node --test --test-concurrency=1 tests/*.test.mjs
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6834.548458
SUITE_EXIT=0
```

`docs-consistency` 仍是 **14** 个 `test(`（`grep -c '^test('` = 14），⑭ 在输出里是 `✔`。

### 2. 文档硬不变量（改后复算）

```text
H1: 2（第二个 H1 在第 434 行，zh/en 切点）
H2 zh/en: 3 3
CJK zh/en: true false
standalone ---: 1
/Users/ hits: 0
fenced blocks: 20（两半各 10）
block-head invariant violations: 0
  - 6 个标记块（每半各 3 个：MIG-GATE / COEXIST-DRILL / COEXIST-REAL）都是「标记行 → export DSH_HOME=」
  - 其余块首行都是 export DSH_HOME=
table zh/en data rows: 7 / 7
```

### 3. 零 diff 与清理

```text
$ git diff --stat d106944..HEAD -- BUILD.md package.json
（空）

$ git status --short
（五条 fix 提交后、写本报告前实测为空；本报告随后作为最后一条 docs 提交）

仓根 *.tgz：无
/tmp/f2-fix-*、/tmp/f2-n-*、/tmp/f3-n-*、/tmp/f3-run-*、/tmp/dsh-coex-*：无残留
/tmp/c-real.*、/tmp/c-l0.*、/tmp/c-dump.*：无残留
```

所有 fixture 都在 `mktemp -d /tmp/…` 下并已删除；**没有调用真 `dsh`**（F2/F3 用函数桩），
因此真实 `~/.dsh` 未被读写。

### 4. 逐 finding 的提交

```text
67e590c fix(04): IN-04 cite comment forms that exist at column 0
e9f1e70 fix(04): IN-06 partition all seven measured-value rows exactly once
3ead903 fix(04): IN-05 make the drill and step-4 blocks parse with per-package version vars
4044efc fix(04): WR-05 accept the documented patched-by label form in COEXIST-REAL
be46e9f fix(04): WR-04 stop claiming an exact count of exit-code blocks
a0730e5 docs(04): re-review 04-05 缺口闭合 delta（基线）
```

## What could not be proven（明确标注，不冒充）

1. **IN-05 的真实演练没有重跑。** 真演练需要 `npm pack` + 真装 `dsh-deja` / `dshmarket`；任务禁止
   `npm pack`，本轮也没有装这两个包。上面的 green/red 是用 `dsh` 函数桩跑**提取出来的块原文**，
   证明的是「块能解析 / 走到四条判据 / 三个变量在取值前失败关闭」，**不是**「真实包在这台机器上
   合成成功」。证据册 DRILL-3 的 `27 = 24 + 3` 仍是已签名历史读数，本轮未复算。
2. **WR-05 的 `patched by` 真实可达性未验证。** 我没有安装 `dsh-deja` / `dshmarket`，因此没有证明
   三者中是否有任何一个**只**以 patcher 身份出现。本轮证明的是：只要 dump 出现正文承诺的形态，
   块不再假红；不相关的标签仍红。
3. **IN-06 的表格读数本身没有重跑。** 这 7 行是 2026-11-13 的演练读数；本轮只证明分类句覆盖全部
   7 行，没有重新测量 3084 / 3195 / 3587 / 3856 / `24 → 25`。
4. **WR-04 是叙述层修复。** 没有运行时行为可测；验证方式是逐字 grep 两半与证据册的新措辞，
   以及确认旧裸计数零出现。
5. **IN-04 的守卫行为没有单独做红/绿注入。** 我只改了注释与失败消息字符串，没有构造一个让 ⑭
   变红的 fixture；全量 38/38 通过证明当前文档下守卫仍绿，`node --check` 证明文件可解析。