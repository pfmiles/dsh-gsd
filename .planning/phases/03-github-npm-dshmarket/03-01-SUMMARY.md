---
phase: 03-github-npm-dshmarket
plan: 01
subsystem: packaging / release-pipeline / CI
tags: [npm, peerDependencies, check-pins, github-actions, permissions, npm-packlist, tarball, dsh-plugin, ci-first-run]

# Dependency graph
requires:
  - phase: 02-compat-matrix
    provides: build/assets/pins.json 行↔pin 真源 + build/lib/check-pins.mjs 强等值门 + compat-matrix 4 格 × 6 步 workflow + build/lib/compat-probe.mjs 宿主求值探针
provides:
  - peer 收紧为 exact 0.2.2-rc.1（package.json 与 pins.json 同构），workflow L37 零改动下 install-ok 方向被真实解析树证明
  - workflow 顶层 permissions{contents: read} + install-ok 格门控正向解析断言（run: 行数仍 4，未新增步骤）
  - tests/pack-contents.test.mjs 纳入 tests/*.test.mjs glob（发布面 per-commit 防线，3 tests）
  - 全量 29/29 与真实 tarball（958 文件）装成 boot 证据，profile gsd-p3-release 可供 Phase 5 复用对照
affects: [03-02, 03-03, Phase 5 UAT-01]

# Actuals (#2632) — pairs with the plan's estimate
actuals:
  tokens: 1096
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "单一真源链单向推进：pins.json → package.json（check-pins (j)）→ workflow 格 → 文档窗口串，每层各有强制方"
    - "CI 正向断言三件套：matrix.expect 门控 + || true 兜底取值 + 显式 exit 2（fail-closed，与 gate 同口径）"
    - "发布面静态推导防线（frozenset 白名单）per-commit，真 npm pack 仅作周期性交叉核对（避免 prepack 递归回本套件）"

key-files:
  created: []
  modified:
    - package.json
    - build/assets/pins.json
    - .github/workflows/compat-matrix.yml
    - tests/pack-contents.test.mjs  # 纯重命名自 tests/pending-phase-3/（100% similarity，0 行改动）
  deleted:
    - tests/pending-phase-3/README.md  # 连同父目录 tests/pending-phase-3/ 一并消失

key-decisions:
  - "peer 收紧是两文件同一次提交（package.json:30 + pins.json:12），不是一处字符串；engines.dsh / dshRange / README 窗口串逐字不动是有意为之（职责不同）"
  - "workflow 断言只写进既有『宿主求值探针』的 run: | 块内，以 canonical `if [ \"${{ matrix.expect }}\" = \"install-ok\" ]; then` 门控，reject 格不执行——否则首跑即红"
  - "pack 防线以 git mv 纯重命名纳管（不改内容、不改 ROOT）：原址 ENOENT 由位置本身修好；BUILD.md:16 计数按计划留给 03-02 写终值"
  - "tarball 装进同一 $DSH_HOME 下的新 profile gsd-p3-release（绝对路径）；安装日志出现 `Agent skills awaiting approval` 原样记录，定性移交 Phase 5 UAT-01"

patterns-established:
  - "门控断言的机器证伪：落位校验命令对 6 个退化变体（缺 token / 非 canonical 门 / 找不到探针步骤 / token 移出块 / 门只在注释 / exit 2 在门外）各自给出可区分红消息"
  - "发布面双证：静态推导（pack-contents 3/3）+ 真 pack 交叉核对（958/12/leaks 0），两者都不硬编码 958"

requirements-completed: [PUB-01, PUB-02]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "peer 收紧为 exact 0.2.2-rc.1，manifest 与 pins 真源同构；check-pins 步骤 (j) 强等值仍成立"
    requirement: "PUB-01"
    verification:
      - kind: unit
        ref: "build/lib/check-pins.mjs --offline（exit 0，末行 'pins: all consistent (line dsh022)'）"
        status: pass
      - kind: unit
        ref: "篡改复验：package.json peer 临时改回开区间 → exit 2 + 'peerDependencies @deepseek-ai/dsh-skill-filesystem mismatch'（验后还原）"
        status: pass
    human_judgment: false
  - id: D2
    description: "npm 通道（auto-install-peers 默认真）上收紧后的 manifest 干净解析：656 包全树 dedupe 到 0.2.2-rc.1，install-ok 探针通过"
    requirement: "PUB-01"
    verification:
      - kind: integration
        ref: "mktemp 仓副本 → npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.2-rc.1 → node build/lib/compat-probe.mjs --dsh 0.2.2-rc.1 --expect install-ok（656 packages；install-ok confirmed exit 0）"
        status: pass
    human_judgment: false
  - id: D3
    description: "workflow 顶层最小权限：permissions{contents: read} 唯一出现一次，actionlint 0 findings"
    verification:
      - kind: unit
        ref: "grep -cE '^permissions:' = 1 + '  contents: read' 存在 + actionlint exit 0（无输出）"
        status: pass
    human_judgment: false
  - id: D4
    description: "install-ok 格内门控正向解析断言：解析树 version == matrix.dsh，不等 exit 2；reject 格被门控跳过"
    verification:
      - kind: unit
        ref: "03-01-PLAN L196 落位校验命令 → 'gated-assertion ok: probe run block L38-L50, gate L42 (indent 10), gated statements L43/L45/L46, closing fi L49'"
        status: pass
      - kind: unit
        ref: "6 个退化变体各自 fail-closed（missing new-block token / is not the canonical form / probe step not found / token outside probe run block / install-ok gate missing / is outside the gate）"
        status: pass
      - kind: unit
        ref: "tests/compat-matrix.test.mjs（②③④⑤⑦ 结构哨兵 7/7，run: 行数 4）"
        status: pass
    human_judgment: false
  - id: D5
    description: "发布面防线纳管：tests/pack-contents.test.mjs 进入 tests/ glob，3 层断言（白名单 / 零泄漏+顶层收敛 / 条目有内容）"
    requirement: "PUB-02"
    verification:
      - kind: unit
        ref: "node --test tests/pack-contents.test.mjs（3/3 pass）"
        status: pass
    human_judgment: false
  - id: D6
    description: "全量套件单进程串行 29/29，fail 0 / cancelled 0（26 既有 + 3 纳管）"
    verification:
      - kind: unit
        ref: "node --test tests/*.test.mjs（ℹ tests 29 / ℹ pass 29 / ℹ fail 0 / ℹ cancelled 0）"
        status: pass
    human_judgment: false
  - id: D7
    description: "真实收面与静态推导一致：958 文件 / 12 顶层 / 开发期路径零泄漏 / 必含集合齐全 / scripts/ 非空"
    requirement: "PUB-02"
    verification:
      - kind: integration
        ref: "npm pack --dry-run --json --ignore-scripts → 'pack cross-check ok: 958 files / 12 tops / leaks 0'"
        status: pass
    human_judgment: false
  - id: D8
    description: "SC-1：真 tarball（dsh-gsd-1.20.1-1.dsh022.tgz）在同一 $DSH_HOME 的新 profile 装成并 boot（引擎 1.20.1 / 72 skills / 两条 bundle patch 行）"
    requirement: "PUB-01"
    verification:
      - kind: e2e
        ref: "npm pack → dsh plugin --profile gsd-p3-release add \"$PWD/dsh-gsd-1.20.1-1.dsh022.tgz\" → runtime-identity --raw = {\"packageName\":\"@opengsd/gsd-core\",\"version\":\"1.20.1\"} / skills 72 / dump-config 两 id = 2（'tarball boot ok' exit 0）"
        status: pass
    human_judgment: false
  - id: D9
    description: "安装日志出现 pnpm 12 的 `Agent skills awaiting approval` —— 是否影响会话内技能可见性未验证（A2），本 phase 只观测记录"
    verification: []
    human_judgment: true
    rationale: "会话内技能可见性属宿主运行时行为，本地只能观测安装日志与包内 72 个 SKILL.md 的存在；定性责任移交 Phase 5 UAT-01（03-RESEARCH A2 / Open Question 6 有意保留未结案）"

# Metrics
duration: 10 min
completed: 2026-11-12
status: complete
---

# Phase 3 Plan 1: 发布管线与 CI 首绿 Summary

**peer 收紧为 exact `0.2.2-rc.1`（manifest + pins 同提交，L37 零改动）后，npm 真实解析树收敛到 656 包并 install-ok 通过；workflow 补上 `contents: read` 与 install-ok 格门控的「解析树 == 矩阵格」正向断言；发布面防线以纯重命名纳管 tests/，全量 29/29，真 tarball（958 文件）在干净 profile `gsd-p3-release` 装成并 boot（引擎 1.20.1 / 72 skills / 两条 bundle patch 行）。**

## Performance

- **Duration:** 10 min（生产面 10:45:59Z → 10:56:08Z；其后为 SUMMARY/STATE 收口）
- **Started:** 2026-11-12T10:45:59Z
- **Completed:** 2026-11-12
- **Tasks:** 3
- **Files modified:** 5（3 改 + 1 纯重命名 + 1 删除）

## Accomplishments

- **D-05 落地**：`package.json:30` 与 `build/assets/pins.json:12` 在同一次提交内把 peer 从开区间 `>=0.2.2-rc.1 <0.3.0-0` 收紧为 exact `0.2.2-rc.1`；`engines.dsh`、`lines.022.dshRange`、README 双语窗口串逐字未动（分工不同，有意为之）。`check-pins --offline` exit 0 且末行 `pins: all consistent (line dsh022)`；篡改复验证明只改一侧即 exit 2（fail-closed 有牙）。
- **真实解析树证明**：仓副本内按 CI 同款命令安装 `@deepseek-ai/dsh@0.2.2-rc.1` → **656 packages**，`@deepseek-ai/dsh-skill-filesystem` 全树 dedupe 到 `0.2.2-rc.1`，`compat-probe --expect install-ok` 输出 `compat-probe: install-ok confirmed` exit 0 —— 与 D-05 的 656 包结论逐字一致，L37 无需任何改动。
- **D-08 两项加固**：workflow 顶层新增 `permissions: { contents: read }`；在既有『宿主求值探针（install-ok/reject）』的 `run: |` 块内新增门控正向断言（`require.resolve` 读解析树 version，!= `matrix.dsh` 则 `exit 2`，取值失败用 `|| true` 兜住）。`^\\s+run:` 仍为 4（未新增步骤），6 条 `if:` 门与 matrix 四行逐字未变。
- **落位证明是机器给的**：PLAN 自带落位校验命令输出 `gated-assertion ok: probe run block L38-L50, gate L42 (indent 10), gated statements L43/L45/L46, closing fi L49`；并对 6 个退化变体实测 fail-closed（见 Deviations 表下的变异清单）。
- **发布面收口（SC-2）**：`git mv tests/pending-phase-3/pack-contents.test.mjs tests/pack-contents.test.mjs` 为 100% 相似度纯重命名（0 行改动），`tests/pending-phase-3/` 连同自相矛盾的 README 一并消失；单跑 3/3，全量 **29/29**（`ℹ fail 0` / `ℹ cancelled 0`）。
- **收面双证**：`npm pack --dry-run --json --ignore-scripts` → **958 文件 / 12 顶层 / leaks 0**，必含集合（`index.js` / `cordis.patch.yml` / `icon.svg` / `locale/en.json` / `locale/zh.json`）齐全且 `scripts/` 非空。
- **SC-1 端到端**：真 `npm pack`（prepack = build + 全量测试，`gates: all passed (A/B/C)` + `ℹ tests 29`）产出 `dsh-gsd-1.20.1-1.dsh022.tgz`（958 文件 / 4.6 MB），装进同 `$DSH_HOME` 下的新 profile **`gsd-p3-release`**，三条 boot 判据全过；tarball 已删除。

## Task Commits

Each task was committed atomically:

1. **Task 1: peer 两文件同改 → check-pins 强等值 → 测试门 → npm 真实解析树一格 install-ok（tracer）** - `6ce5360` (feat)
2. **Task 2: workflow 两项纯增量加固（顶层最小权限 + 既有 run 块内门控正向解析断言）** - `19911d1` (feat)
3. **Task 3: 发布面收口（防线纳管 + 待迁目录删除 + 真 tarball 装成 boot）** - `c304c76` (test)

**Plan metadata:** `docs(03-01): complete … plan`（SUMMARY + STATE + ROADMAP + REQUIREMENTS）

## Files Created/Modified

- `package.json` — 仅 `:30` 一行：`"@deepseek-ai/dsh-skill-filesystem": "0.2.2-rc.1"`（exact）；version / private / license / files / engines / dependencies / scripts / icon / exports 逐字未动
- `build/assets/pins.json` — 仅 `lines.022.peer` 一行：`"@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`；`dshRange`、`lines.021`、`matrix`、`node`、`version` 未动
- `.github/workflows/compat-matrix.yml` — 顶层 `permissions: { contents: read }`（+2 行）与探针 `run: |` 块内新增 2 行注释 + 8 行断言（+10 行）；matrix 四行 / 6 条 `if:` 门 / 既有工具路径零改动
- `tests/pack-contents.test.mjs` — 纳管产物（原 `tests/pending-phase-3/pack-contents.test.mjs`，100% 相似度重命名，内容零改动）
- `tests/pending-phase-3/README.md` — 删除（其「3/3 passing when run explicitly」在原址本就不成立，「To adopt in Phase 3」在移动后成假陈述）

## Evidence Ledger（本计划的可证事实）

| 门 | 命令 | 实测输出 |
|---|---|---|
| pin 强等值 | `node build/lib/check-pins.mjs --offline` | `pins: all consistent (line dsh022)` / exit 0 |
| fail-closed 有牙 | 临时把 peer 改回开区间再跑同一脚本 | exit 2 + `peerDependencies @deepseek-ai/dsh-skill-filesystem mismatch — package.json '>=0.2.2-rc.1 <0.3.0-0' vs pins.json peer '@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1'`（已还原） |
| npm 真实解析树 | 副本内 `npm install … @deepseek-ai/dsh@0.2.2-rc.1` | `added 656 packages`；`npm ls` 全树 `dsh-skill-filesystem@0.2.2-rc.1 deduped` |
| 宿主求值 | `node build/lib/compat-probe.mjs --dsh 0.2.2-rc.1 --expect install-ok` | `compat-probe: install-ok confirmed (dsh 0.2.2-rc.1 satisfies engines.dsh >=0.2.2-rc.1 <0.3.0-0)` / exit 0 |
| workflow 结构（W-1 门） | `test "$(grep -cE '^\s+run:' …)" -eq 4 && test "$(grep -cE '^permissions:' …)" -eq 1 && grep -qE '^  contents: read$' … && ! grep -qF 'dsh plugin add' … && test "$(grep -cF -- '--force' …)" -eq 0` | `STRUCTURAL GATE PASS: run:=4 permissions:=1 contents:read=present forbidden=absent --force=0 --legacy-peer-deps=0`（EXIT=0） |
| 断言落位 | PLAN L196 落位校验命令 | `gated-assertion ok: probe run block L38-L50, gate L42 (indent 10), gated statements L43/L45/L46, closing fi L49` |
| workflow 静态校验 | `actionlint`（1.7.12） | 无输出 / exit 0 |
| 结构哨兵 | `node --test tests/compat-matrix.test.mjs` | 7/7 pass（②③④⑤⑦ 全绿） |
| 防线套件 | `node --test tests/pack-contents.test.mjs` | 3/3 pass |
| 全量套件（串行单进程） | `node --test tests/*.test.mjs` | `ℹ tests 29` / `ℹ pass 29` / `ℹ fail 0` / `ℹ cancelled 0` |
| 收面交叉核对 | `npm pack --dry-run --json --ignore-scripts` | `pack cross-check ok: 958 files / 12 tops / leaks 0` |
| 真 tarball | `npm pack` | `dsh-gsd-1.20.1-1.dsh022.tgz` / 958 files / 4.6 MB；prepack 内 `gates: all passed (A/B/C)` + `ℹ tests 29` |
| 装成 + boot（SC-1） | `dsh plugin --profile gsd-p3-release add "$PWD/<tgz>"` → 三条判据 | `+ dsh-gsd 1.20.1-1.dsh022`；`{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；`72`；dump-config `L368 - id: gsd` + `L370 - id: gsd-hooks-bridge` → 计数 2；`tarball boot ok` |

**pnpm 12 审批提示（A2，原样记录）**：两次安装日志均出现

```
Agent skills awaiting approval: dsh-gsd@file:../../../frontWorkspace/gsd-on-dsh/dsh-gsd/dsh-gsd-1.20.1-1.dsh022.tgz.
Run "pnpm approve" to review them.
```

安装本身成功，包内 `skills/` 恰 72 项；**是否影响会话内技能可见性未验证**（03-RESEARCH A2 / Open Question 6 有意保留），定性移交 Phase 5 UAT-01。

## Decisions Made

- **D-05 的落点是两个文件、一次提交**：`package.json` 与 `pins.json` 必须同改，因为 check-pins 步骤 (j) 把 `<name> <range>` 拼串与 `line.peer` 逐字比较。`engines.dsh` / `dshRange` / README 窗口串**不随之收紧**——它们服务于用户侧友好报错与 `--allow-version`，与 npm 解析层职责不同（D-05 明文要求）。
- **D-08 的落位只在既有 `run: |` 块内**：`⑦ isGate` 要求每个 `^\s+run:` 的上一行是 inputs∩matrix 门，新开步骤会引入一整行门的结构风险；块内追加零结构风险。断言以 `expect == install-ok` 门控——reject 格根 peer 被声明为 exact rc.1，根层解析 ≠ `matrix.dsh` 属预期，无条件断言会让首次 CI run 即红（违反 SC-5「无红跑历史」）。
- **pack 防线用纯重命名纳管**：文件本来就是按目标位置写的（`ROOT` 用 `import.meta.url` 的 `..`），原址 `..` 只到 `tests/` 导致 `ENOENT tests/package.json`；移动即修好，**不需要也不应该**「顺手改 ROOT」。
- **`BUILD.md:16` 本计划不动**：全量已实测 29/29，但终值由 03-02 在其 ⑧⑨⑩ 三条新断言落地后一次性写入（两个计划各写一次会互相打脸）。当前 `BUILD.md` git diff 为空。
- **「干净 profile」的可行定义**：同一 `$DSH_HOME` 下新建 profile 名即满足（宿主 bundle 由 DSH 安装自身提供）；全新 `DSH_HOME` 留给 Phase 5 UAT-01。

## Deviations from Plan

**None - plan executed exactly as written.**（无自动修复、无范围蔓延；以下两条为**记录性差异**，不改变任何交付物语义）

### Documented Variances

1. **[Rule 3 - Blocking] workflow diff 为 10 行新增（8 行代码 + 2 行解释性注释），Task 2 acceptance 的括注写「6–8 行」**
   - **Found during:** Task 2
   - **Issue:** 03-PATTERNS 的落位骨架在断言前带两行注释说明 ⛔-B 的门控理由；照抄即多 2 行。
   - **Fix:** 保留注释（⛔-B 的理由必须与门相邻，否则下一位维护者会把它「简化」成无条件断言）。代码行恰为规范要求的 8 行（门 / 取值 / 内层 if / 报错 / exit 2 / 内层 fi / 成功回显 / 外层 fi）。
   - **Verification:** `git diff` 仅含 permissions 块（2 行）与 run 块内 10 行；matrix 四行与 6 条 `if:` 门经 `diff` 逐字比对未变。
   - **Committed in:** `19911d1`

2. **[Rule 3 - Blocking] `dsh plugin add` 重装分支未触发 `--force`**
   - **Found during:** Task 3（PLAN 的 tarball 验证命令第二次执行）
   - **Issue:** PLAN 的 verify 写成 `add "$TGZ" || add "$TGZ" --force`（重跑场景才需要 `--force`）。本机第二次 add 时 pnpm 自行完成了 replace（`[WARN] Replaced "dsh-gsd" … from a different source`），`||` 右支未被求值。
   - **Fix:** 无（按计划原样执行，回退支路只是未被走到）。
   - **Verification:** 命令链 exit 0，`tarball boot ok: dsh-gsd-1.20.1-1.dsh022.tgz`，tarball 随后删除。
   - **Committed in:** `c304c76`

### 落位校验命令的 fail-closed 变异实测（证明「门是机器证的，不是人眼看的」）

| 变异 | 红消息 |
|---|---|
| 门行整行删除 | `missing new-block token(s): = "install-ok" ]` |
| 门用 `!=` 代替 `=` | `install-ok gate at L42 is not the canonical "if [ "${{ matrix.expect }}" = "install-ok" ]; then" form (reads: … != …) - refusing to pass` |
| 探针步骤改名（找不到） | `probe step not found` |
| 整块搬到新步骤 | `token outside probe run block L38-L50: require.resolve, install tree does not match the matrix cell, = "install-ok" ], exit 2` |
| 门只留在 `#` 注释里 | `install-ok gate missing inside probe run block L38-L50` |
| `exit 2` 移到收口 `fi` 之后 | `exit 2 at L49 is outside the gate (gate L42, closing fi L48) - assertion un-gated, refusing to pass` |

（六个变体全部 exit 1，各自消息互不吞并；恢复原文件后命令输出 `gated-assertion ok`。）

## Issues Encountered

- **`grep -E '^\s+run:'` 的 POSIX 可移植性已在本机实测**（BSD/GNU grep 均接受 `\s`）；未做语法替换，PLAN 的结构门命令按原文执行通过。
- **`gsd-tools state add-decision` 拒绝仓外临时文件**（`Path escapes allowed directory`）→ 改用 `.planning/tmp/`（已 gitignore）传参；工具自动加的 `[Phase 03]:` 前缀与 summary 自带前缀重复，已就地去重为单前缀。
- **本计划不新增任何测试**（26 既有不变），`test()` 计数增量全部来自纳管的 3 个既有断言；`ℹ tests 29` 是地板值（⛔-E），最终数字由 03-02 按实测写入 `BUILD.md:16`。

## User Setup Required

None - no external service configuration required.（本计划零对外写入：未 `npm publish`、未建 GitHub Release、未提 dshmarket PR、未 `git push`。）

## Next Phase Readiness

- **03-02（元数据与提交材料）可就位**：peer 面已冻结（exact `0.2.2-rc.1`），manifest 其余字段（repository/homepage/bugs/keywords/author/publishConfig）尚未改动、无冲突；`BUILD.md:16` 仍写 26/26，**必须**在 03-02 把 ⑧⑨⑩ 落地后一次性写成实测值。
- **03-03（首次 push 与 CI 首绿）前置条件已满足**：四格本地等价证据就位（install-ok 方向 656 包 + install-ok confirmed；reject 方向由 03-03 的 push 前证据补齐）、actionlint 0 findings、workflow 结构哨兵 7/7、`permissions` 与门控断言都已就位。
- **Phase 5 移交项（本计划新增）**：① profile `gsd-p3-release` 可复用为对照 profile；② `Agent skills awaiting approval` 的会话内技能可见性未验证（A2 → UAT-01）；③ exact peer 的维护义务——rc.2 转正或 DSH 0.2.2 正式发布时必须同步抬 peer（「每行一版」）；④ `npm publish` 必须设 `dist-tags.latest`（D-06 的卡片裸名命令依赖它）。
- **无阻塞项**：本计划三个任务全部验收通过；`git status` 已收敛为 0 个非规划改动。

## Self-Check: PASSED