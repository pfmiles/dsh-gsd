# Phase 3: 发布（GitHub + npm + dshmarket） - Pattern Map

**Mapped:** 2026-11-12
**Files analyzed:** 10（3 新增 + 6 修改/移动 + 1 删除）
**Analogs found:** 9 / 10
**Phase 性质声明：** 这是**发布就绪** phase，不是功能 phase。绝大多数「新文件」是仓库级元数据、CI 编排与文档，**不存在应用代码分层**——因此本文件按 `config / data / doc / test` 四类角色映射，**不虚构** controller/service/store 式架构。凡「无 analog」的项，下面直说无 analog 并给外部格式来源，不用仓库里不存在的模式硬套。

> **Tracked-source gate（#3645）：** 下表所有 named analog 均经 `git ls-files -- <path>` 非空核实为 git-TRACKED 源。`.gitignore` 覆盖的构建产物树（`skills/` `gsd-core/` `hooks/` `config/` `scripts/`）与 `.gsd-build-tmp/` `.build-cache/` `node_modules/` 一律**不得**作 analog。实测 tracked 清单含 `build/assets/pins.json`、`build/lib/check-pins.mjs`、`tests/pending-phase-3/pack-contents.test.mjs`、`.github/workflows/compat-matrix.yml`。

---

## ⛔ Planner-Must-Resolve（任何 plan 动笔前逐条裁决）

### ⛔-A peer 收紧是**两个文件**，不是一处（RESEARCH Pattern 1 此处偏乐观）

RESEARCH Pattern 1 的推荐（B 变体，exact peer）写着「改动面最小：**一处 `package.json` 字符串**」。仓内还有一道强等值门，会让单文件改动当场变红：

`build/lib/check-pins.mjs:152-160`（逐字）

```js
  // (j) skill-filesystem peer range strictly equals pins.lines[line].peer → exit 2
  // pins.json spells the peer as "<name> <range>"; package.json executes it as
  // key=<name>, value=<range> — the equivalence check composes the same string.
  const peers = pkg.peerDependencies && typeof pkg.peerDependencies === 'object' ? pkg.peerDependencies : {}
  const peerName = '@deepseek-ai/dsh-skill-filesystem'
  const peerRange = peers[peerName]
  if (peerRange === undefined || `${peerName} ${peerRange}` !== line.peer) {
    finish(2, `check-pins: peerDependencies ${peerName} mismatch — package.json '${peerRange ?? '<missing>'}' vs pins.json peer '${line.peer}'`)
  }
```

只改 `package.json:30` ⇒ `check-pins --offline` exit 2 ⇒ `tests/compat-matrix.test.mjs:96-100` ⑥（spawn 它并断言 exit 0）立刻红。**必须同一次提交改完两侧：**

| 文件 | 现值（逐字引用） | 目标值 |
|---|---|---|
| `package.json:30` | `"@deepseek-ai/dsh-skill-filesystem": ">=0.2.2-rc.1 <0.3.0-0"` | `"@deepseek-ai/dsh-skill-filesystem": "0.2.2-rc.1"` |
| `build/assets/pins.json:12` | `"peer": "@deepseek-ai/dsh-skill-filesystem >=0.2.2-rc.1 <0.3.0-0"` | `"peer": "@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"` |

**不要顺手改的一侧**：`engines.dsh`（`package.json:18`）、`pins.lines.022.dshRange`（`pins.json:11`）、README 的窗口串（`README.md:51` / `:121`）。这三者是**另一条**字符串（`>=0.2.2-rc.1 <0.3.0-0`），由 `tests/docs-consistency.test.mjs:44-53` ② 三方强等值钉死，与 peer 无关。`02-REVIEW.md:187` 说「同步进 `pins.lines.022.peer`、README/BUILD 的窗口串」——**前半句成立，后半句在本变体不适用**（窗口串 = `engines.dsh`，本次不动）。

> 若 plan 选 C 变体（L37 追加 `@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.1`）而非 exact peer：本 ⛔-A 整条不适用，但换来 workflow diff + 第二个版本字面量；且 reject 格不能引用 `${{ matrix.dsh }}`（RESEARCH Pattern 1 表格第三行已实测）。

### ⛔-B 「解析结果 == `matrix.dsh`」断言**必须按 `expect` 门控**，否则 reject 格首跑必红

D-03 判据是「首跑即绿、不留红跑历史」（SC-5）。若把 RESEARCH 建议的正向断言写成**无条件**的「`node_modules/@deepseek-ai/dsh-skill-filesystem` 的 version 必须等于 `${{ matrix.dsh }}`」：

- 两个 `expect: install-ok` 格（`dsh=0.2.2-rc.1`）：成立（RESEARCH 实测全树 dedupe 到 `0.2.2-rc.1`，656 packages）。
- 两个 `expect: reject` 格（`dsh=0.2.1-rc.5`）：根 `peerDependencies` 声明的是 exact `0.2.2-rc.1`，npm 为满足**根 peer** 会在根层放 `0.2.2-rc.1`（`0.2.1-rc.5` 的副本由宿主 `dsh@0.2.1-rc.5` 自身嵌套带入）⇒ 根层 version ≠ `matrix.dsh` ⇒ **断言红**。旁证：RESEARCH 实测 reject 格 `601 packages` vs install-ok 格 `656 packages`，两格解析树本就不同，因此「根层就是 `matrix.dsh`」在 reject 格上没有任何证据支持。

  标记 **[推断，执行期首跑确认]**：该格根层究竟是 `0.2.2-rc.1` 还是 `0.2.1-rc.5`，本会话未复跑（禁止 `npm install`）。但结论对两种解析都成立——**门控写法在两种情况下都不会红**（reject 格不执行此断言），**无条件写法只要根层 ≠ `matrix.dsh` 就在首跑留下红跑历史**，而 SC-5 判据正是「不留红跑历史」。故门控是唯一安全写法，不依赖上述推断成立。

⇒ 断言写在 shell 的 `if [ "${{ matrix.expect }}" = "install-ok" ]` 里。另外**必须** `|| true` 兜住取值失败（GitHub 默认 shell 是 `bash -e {0}`），再显式判空并 `exit 2`，保持 fail-closed 而不是静默通过。

### ⛔-C 新增断言只能写进**既有** `run: |` 块内（⑦ 是逐行硬门）

`tests/compat-matrix.test.mjs:106-123`（逐字，本 phase 改动 workflow 的**唯一硬约束**）

```js
test('⑦ workflow_dispatch inputs 消费面哨兵（inputs ∩ matrix 条件门盖住全部 run 步骤）', () => {
  const y = readWF()
  const lines = y.split('\n')
  const isGate = (l) =>
    l.trim().startsWith('if:') &&
    l.includes('inputs.dsh') && l.includes('matrix.dsh') &&
    l.includes('inputs.gsd') && l.includes('matrix.gsd')
  const runIndexes = lines
    .map((l, i) => (/^\s+run:/.test(l) ? i : -1))
    .filter((i) => i >= 0)
  assert.ok(runIndexes.length >= 3, `expected >=3 run steps, found ${runIndexes.length}`)
  for (const i of runIndexes) {
    assert.ok(
      isGate(lines[i - 1]),
      `run step at line ${i + 1} is not gated by an inputs ∩ matrix if: on the previous line — previous: '${(lines[i - 1] || '').trim()}'`,
    )
  }
})
```

读法（plan 必须遵守的三条）：

1. **判据是 `run:` 键的「上一行」**——加 `run: |` 步骤就必须同时补一整行 `if:` 门，且该行 `trim()` 后必须以 `if:` 开头。
2. **块内多行不受约束**：`run: |` 内部的 shell 行不以 `run:` 开头，且其上一行是 `npm install …`（无所谓）。所以「加断言」= 改 L36-38 的块内容，**零结构风险**；「加步骤」= 结构风险。
3. `/^\s+run:/` 是**任意缩进**匹配——新块内千万不要出现以 `run:` 开头的 shell 行（例如误贴一段 YAML 示例）。

**另两条顺带会踩的结构哨兵**（同文件）：

- `tests/compat-matrix.test.mjs:21-25` + `:41-53` ②：格行解析器 `CELL_RE` 只认整行 `- { dsh: "…", gsd: "…", expect: … }`，且格集合必须**双向精确等于** `pins.matrix.dsh × pins.matrix.gsd`。不要为 rc.2 之类加「实验格」（除非同时补 `pins.lines` 的 bridge/peer，见 02-REVIEW WR-06）。
- `tests/compat-matrix.test.mjs:90-92` ⑤：`assert.ok(!readWF().includes('dsh plugin add'))`。**新增的注释/回显里绝不能出现 `dsh plugin add` 字样**（写 `dsh-market` 卡片命令示例时会顺手犯）。

### ⛔-D `CHANGELOG.md` **不得**加进 `files`

`tests/pending-phase-3/pack-contents.test.mjs:41-45`（移动后为 `tests/pack-contents.test.mjs:41-45`，逐字）

```js
const ALLOWED_TOP_LEVEL = new Set([
  'package.json', 'README.md', 'LICENSE',
  'index.js', 'cordis.patch.yml', 'icon.svg', 'locale',
  'skills', 'gsd-core', 'hooks', 'config', 'scripts',
])
```

② 断言「顶层条目必须收敛在本集合」⇒ 一旦把 `CHANGELOG.md` 写进 `files`，包顶层多出 `CHANGELOG.md` 且不在白名单 ⇒ 红。npm 也**不会**无条件收录 CHANGELOG（只无条件收录 `package.json` / `README*` / `LICENSE*` / `main` 指向文件），所以「不进包」是零成本的默认结局。**CHANGELOG 只活在 GitHub 仓库里。**

### ⛔-E 测试计数只能有**一个**最终数字：29 是**地板值**，不是定值

`BUILD.md:16`（逐字，全仓唯一活体计数）：

```bash
# 每波可重跑测试（含真实构建 smoke）——预期 26/26（真实构建 smoke；兼容矩阵/版本/文档一致性等套件已并入）
```

实测现状 26 = build-smoke 2 + rewrite-map 7 + compat-matrix 7 + version 3 + docs-consistency 7；`pack-contents.test.mjs` 贡献 3 ⇒ **29 是最小终值**。但本 phase 有两处「可选新增 `test()`」：

| 可选断言 | 落点 | 计数影响 |
|---|---|---|
| CHANGELOG 版本 == `package.json.version`（RESEARCH Wave 0 / 03-VALIDATION SC-6 建议） | `tests/docs-consistency.test.mjs` 新增 ⑧ | **+1** |
| README 徽章 / 致谢齐备（SC-4 可选） | 同上 ⑨（或并入 ⑧） | **+1** |
| locale 键非空（INST-06「复核 + 断言」） | 可并入现有 `pack-contents` 已有 3 个 test 之一，或 docs-consistency | 并入则 +0 |

⇒ plan 必须**一次性锁定**最终数字（29 / 30 / 31），然后让 `BUILD.md:16` 写**实测输出**得到的值，不要用算术推。凡新增一个 `test(` 就 +1，没有例外。

**另：历史记录一律不改。** `02-VALIDATION.md`（`:25/:38/:58` 的 `26/26` 均带 `HEAD 84784f1` 引用）、`01-VERIFICATION.md`、`STATE.md` 里的 `26/26` 是**已签名审计结论**，仓内既有惯例是「历史陈述按约定不动」（`02-REVIEW-FIX.md:76`）。只能追加带日期的**前向注记**，不得改写旧数字。

### ⛔-F dshmarket 材料的落点与形态边界

- **落点**：`docs/dshmarket/pfmiles__dsh-gsd.yml`（推荐）—— 这是 Phase 5 要提交的资产，不是阶段草稿；放进 `.planning/phases/03-…/` 会在 `gsd-cleanup` 归档时被一起挪走。`docs/` 是**新顶层目录**，但因 `files` 不含它且 npm 不无条件收录它 ⇒ **不改 `files`、不改 `ALLOWED_TOP_LEVEL`、pack 面零 churn**（已核对：`tests/pack-contents.test.mjs` 的推导只从 `files` + 无条件收录项出发；`tests/build-smoke.test.mjs` 不枚举仓根）。
- **形态**：YAML **只写 5 个字段**（`url` / `name` / `category` / `description.en` / `description.zh`）。**不要**塞自定义键（如 `install:`）——目标仓 `scripts/lib/entries.mjs` 的 `validateEntries` 是最终裁判（RESEARCH Pattern 3 #6/#10）。
- **「install 命令与 README 逐字一致」不是 YAML 字段**：catalog 的卡片命令由对方 CI 生成且**不带版本号**。落地方式 = README 增一条**裸名**示例（见 ⛔-G），再在同目录放 `docs/dshmarket/README.md` 记「提交说明 + 生成命令形态 + install 串逐字引用 + 真实数字（72 skills / GSD 1.20.1 / 958 文件）」。SC-3 的校验命令是 `grep -F` 比对两侧，不是断言 YAML。
- **`icon:` 留空**：本仓只有 `icon.svg`，catalog 明确拒收 SVG（RESEARCH Pattern 3 #13）。不要为了「更好看」去改 `files` 加 PNG。

### ⛔-G README 的「不带版本」示例只能写**裸名**

`tests/docs-consistency.test.mjs:83-97` ⑤（逐字）

```js
test('⑤ refuse-by-design 哨兵：无 range/tag 安装规格（捕获组一律精确版本数字开头）', () => {
  for (const m of specCaptures()) {
    assert.match(
      m[1],
      /^\d/,
      `dsh-gsd@ 后必须以精确版本数字开头，实际 '${m[1]}'（range/tag 形态对 prerelease 匹配数为 0）`,
    )
  }
  for (const [name, s] of [
    ['README.md', readme],
    ['BUILD.md', buildMd],
  ]) {
    assert.ok(!s.includes('dsh-gsd@latest'), `${name} 含 'dsh-gsd@latest' 形态`)
  }
})
```

`specCaptures()` 抓的是 `/dsh-gsd@(\S+)/g`（`:33-36`）。⇒ 市场形态的示例**必须**写成裸名、不带 `@`：

```bash
dsh plugin --profile web add dsh-gsd          # ✅ 零捕获，⑤ 不动
dsh plugin --profile web add dsh-gsd@latest   # ❌ ⑤ 立刻红
```

③（`:55-66`）另要求**至少存在一条** `dsh-gsd@<精确版本>` 示例 —— 既有 4 条已满足，新增裸名示例不影响。

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.github/workflows/compat-matrix.yml`（改） | config（CI 编排） | batch（matrix 并行格） | 自身 carry-forward + 约束源 `tests/compat-matrix.test.mjs` | self + 约束源 |
| `package.json`（改） | config（npm manifest） | —（声明式，被 3 个消费方读取） | 自身 carry-forward + 强制方 `build/lib/check-pins.mjs` | self (carry-forward) |
| `build/assets/pins.json`（改） | data / config（单一真源） | file-I/O（静态，被 check-pins / 测试 / CI 消费） | 自身 carry-forward | self (carry-forward) |
| `README.md`（改） | doc | — | 自身双语镜像结构 + 哨兵 `tests/docs-consistency.test.mjs` | self (carry-forward) |
| `CHANGELOG.md`（**新**） | doc | — | `THIRD-PARTY-NOTICES.md`（仓内唯一「短结构化根级 md」先例）+ `BUILD.md` TL;DR 体例 | role-match |
| `tests/pack-contents.test.mjs`（**移动**） | test（静态推导防线） | file-I/O（同步读 JSON + 目录遍历） | 自身（文件已按目标位置写好）+ 兄弟套件 `tests/compat-matrix.test.mjs` 的 ROOT idiom | exact（同 idiom） |
| `tests/pending-phase-3/`（**删除**） | test fixture / doc | — | — | — |
| `BUILD.md`（改，仅 L16） | doc | — | 自身 TL;DR 命令块 | self (carry-forward) |
| `docs/dshmarket/pfmiles__dsh-gsd.yml`（**新**） | data（外部 schema） | file-I/O（Phase 5 提交物） | **无仓内 analog**（外部闭集词表） | none |
| `tests/docs-consistency.test.mjs`（改，**可选**） | test（文档一致性） | file-I/O（静态） | 自身 ①-⑦ + `tests/version.test.mjs`（消费 `check-pins` 导出） | self (carry-forward) |

**显式不在本 phase 文件清单（勿「顺手补齐」）：**

- `LICENSE` —— D-01 明令不改；现状已合规（`LICENSE:1` `MIT License`、`:3` `Copyright (c) 2026 pf_miles`）。
- `THIRD-PARTY-NOTICES.md` —— D-01 明令「不动」。上游致谢**已存在**（见下文 PUB-04 段），不需要新章节。
- `locale/en.json` / `locale/zh.json` / `icon.svg` / `package.json` 的 `icon` 与 `exports` —— INST-06 现状**已满足**宿主 schema（RESEARCH Pattern 4 逐字 `typert.host.js:99-104`）。本 phase 对它是「复核 + 断言」，不是「补齐」。
- `package.json` 的 `private` / `version` / `license` —— `tests/docs-consistency.test.mjs:99-102` ⑥ 同时钉死 `version` 与 `private: true`；D-02 把二者都推到 Phase 5。
- `.gitignore` / `build.mjs` / `cordis.patch.yml` / `index.js` —— 本 phase 零改动。

## Pattern Assignments

---

### `.github/workflows/compat-matrix.yml`（config, batch）— MODIFIED

**Analog:** 自身（carry-forward）。仓内无第二个 workflow，`git ls-files -- .github/` 只有一个文件。**约束源** = `tests/compat-matrix.test.mjs`（不是 analog，是裁判）。

**现状全文骨架**（`compat-matrix.yml:1-44`，逐字节选：L1-6 触发器、L10-21 job + matrix、L22-44 steps）：

```yaml
name: compat-matrix
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
    inputs:
      dsh: { description: 'DSH runtime version (manual override)', type: string, required: false }
      gsd: { description: 'GSD engine version (manual override)', type: string, required: false }
jobs:
  compat-matrix:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        include:
          - { dsh: "0.2.2-rc.1", gsd: "1.20.1", expect: install-ok }
          - { dsh: "0.2.2-rc.1", gsd: "1.19.0", expect: install-ok }
          - { dsh: "0.2.1-rc.5", gsd: "1.20.1", expect: reject }
          - { dsh: "0.2.1-rc.5", gsd: "1.19.0", expect: reject }
```

**步骤门的字面形态**（`:23-25`，全文件 6 条 step 复用同一行；新块内的 shell 行不要仿写这一行）：

```yaml
      # steps 级条件门（job 级 if: 无 matrix context，GitHub 语义/actionlint 双确认）：
      # 空 inputs（push/PR 默认）→ 恒真全跑；手动 override 时定向跑匹配格，其余格跳过。
      - if: ${{ (!inputs.dsh || inputs.dsh == matrix.dsh) && (!inputs.gsd || inputs.gsd == matrix.gsd) }}
```

**改动点 1 —— 顶层最小权限（当前实测无 `permissions:` 键）**，插在 `on:` 与 `jobs:` 之间：

```yaml
permissions:
  contents: read
```

依据：Security Domain V4 / ASVS L1「CI token 权限过宽 ⇒ Elevation of Privilege」。`contents: read` 恰好覆盖 `actions/checkout@v7` 的最小需求，且本 workflow 不写回仓库、不评论、不发包。**注意**：顶层 `permissions:` 会覆盖仓库默认权限——加完后 `checkout` 是唯一需要 token 的步骤，不要漏。

**改动点 2 —— 正向解析断言，写进既有 `run: |` 块（L36-38），不新增步骤**（理由见 ⛔-C / ⛔-B）：

```yaml
      - name: 宿主求值探针（install-ok/reject）
        if: ${{ (!inputs.dsh || inputs.dsh == matrix.dsh) && (!inputs.gsd || inputs.gsd == matrix.gsd) }}
        run: |
          npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@${{ matrix.dsh }}
          # (j) 的字符串预测 == 实际解析树。仅 install-ok 格：reject 格的根 peer 由 exact
          # 声明占位，根层解析到的是宿主行之外的版本，属预期（详见 03-PATTERNS ⛔-B）。
          if [ "${{ matrix.expect }}" = "install-ok" ]; then
            RESOLVED="$(node -p "require(require.resolve('@deepseek-ai/dsh-skill-filesystem/package.json')).version" 2>/dev/null || true)"
            if [ "$RESOLVED" != "${{ matrix.dsh }}" ]; then
              echo "compat-matrix: resolved dsh-skill-filesystem '${RESOLVED:-<unresolvable>}' != matrix.dsh '${{ matrix.dsh }}' — install tree does not match the matrix cell" >&2
              exit 2
            fi
            echo "compat-matrix: resolved peer ${RESOLVED} == matrix.dsh ${{ matrix.dsh }}"
          fi
          node build/lib/compat-probe.mjs --dsh ${{ matrix.dsh }} --expect ${{ matrix.expect }}
```

**取值 idiom 的来源**（`build.mjs:252-258`，仓内唯一「读某包 `package.json` 的 version 并与期望比对 → exit 2」先例；此处把 `-p` 的路径换成了 `require.resolve`，以避开 npm hoisting / nested 位置差异）：

```js
  // ③ pre-gate (BEFORE staging): fetched == requested
  {
    const p = spawnSync('node', ['-p', `require(${JSON.stringify(join(PKG_DIR, 'package.json'))}).version`], { encoding: 'utf8' })
    const fetched = (p.stdout || '').trim()
    if (p.status !== 0 || fetched !== GSD_VERSION) {
      finish(2, `build: fetched version ${fetched || '(unreadable)'} != requested ${GSD_VERSION}`)
    }
  }
```

**三条禁令（来自 RESEARCH Anti-Patterns + ⑧ 之外的实测）：**

1. **不得**在 L37 加 `--force` 让安装步变绿（706 packages、根层出现 rc.2、probe 照样 exit 0 ⇒ 绿在错误的树上）。
2. **不得**用 `--legacy-peer-deps`（丢 host peer ⇒ 缺 `dsh-app-boot` ⇒ probe exit 1）。
3. **不得**在 workflow 里出现 `dsh plugin add` 字样（⑤ 哨兵，`tests/compat-matrix.test.mjs:90-92`）。

**改动后必跑**：`actionlint .github/workflows/compat-matrix.yml`（期望 exit 0 无输出）+ `node --test tests/compat-matrix.test.mjs`（期望 7/7）。**注意**：加 `permissions:` 会让 L37 → L39，全仓文档里的「L37」是**标签**、不是契约（无测试硬编码 workflow 行号；⑦ 自己算 index），不必回改旧文档。

---

### `package.json`（config）— MODIFIED

**Analog:** 自身 carry-forward；强制方 `build/lib/check-pins.mjs`。

**现状关键行（逐字）**：`:3` version、`:4` `"private": true`、`:14-15` `"icon": "icon.svg"` / `"license": "MIT"`、`:16-19` engines、`:25-31` dependencies + peerDependencies、`:32-42` files、`:43-47` scripts。

**改动点（按 ⛔-A 同步两侧）**：

1. `:30` peer → exact `0.2.2-rc.1`（与 `pins.json:12` **同提交**）。
2. 新增 `publishConfig`（纯元数据、零行为副作用、不打红任何既有测试）：

```json
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
```

依据：本机 `npm config get registry` = `https://registry.npmmirror.com`（只读镜像代理），不发 `publishConfig.registry` 的话 Phase 5 会发不出去；`dshmarket` 自己的 manifest 就是同一先例（RESEARCH Pattern 4）。**`tag` 留到 Phase 5** 与发布动作一起裁决（推荐 `latest`，因为它同时决定市场卡片命令能否解析）。

3. 新增 `repository` / `homepage` / `bugs` / `keywords` / `author`（npm 页面与 `npm repo` 的读源；均为无副作用声明）：

```json
  "repository": { "type": "git", "url": "git+https://github.com/pfmiles/dsh-gsd.git" },
  "homepage": "https://github.com/pfmiles/dsh-gsd#readme",
  "bugs": { "url": "https://github.com/pfmiles/dsh-gsd/issues" },
  "keywords": ["deepseek", "harness", "dsh", "dsh-plugin", "gsd", "skills", "workflow"],
  "author": "pf_miles",
```

**不要动**（各有硬门）：`version`（⑥ `docs-consistency:100` + check-pins (e)/version 等值）、`private`（⑥ `:101`；D-02 推 Phase 5）、`license`（D-01）、`files`（pack 防线三层）、`engines` / `dependencies` / `peerDependencies` 的其余项（check-pins (g)(h)(i)）、`icon`/`exports`（INST-06）、`scripts`（prepack 链，02 已固化）。

**JSON 体例**：2 空格缩进、双引号、无尾逗号、无注释（全仓一致；`pins.json` 同）。

---

### `build/assets/pins.json`（data/config）— MODIFIED

**Analog:** 自身 carry-forward（tracked，`git ls-files -- build/` 实证 6 个 tracked 文件）。

**现状全文（逐字，28 行）**：

```json
{
  "node": ">=24",
  "version": "1.20.1-1.dsh022",
  "lines": {
    "022": {
      "dsh": "0.2.2-rc.1",
      "dshRange": ">=0.2.2-rc.1 <0.3.0-0",
      "bridge": {
        "@deepseek-ai/dsh-hooks-claude-code": "0.2.2-rc.1",
        "@deepseek-ai/dsh-hook-protocol": "0.2.2-rc.1"
      },
      "peer": "@deepseek-ai/dsh-skill-filesystem >=0.2.2-rc.1 <0.3.0-0"
    },
    "021": {
      "dsh": "0.2.1-rc.5",
      "dshRange": "<unsupported>",
      "bridge": {
        "@deepseek-ai/dsh-hooks-claude-code": "0.2.1-rc.5",
        "@deepseek-ai/dsh-hook-protocol": "0.2.1-rc.5"
      },
      "peer": "@deepseek-ai/dsh-skill-filesystem >=0.2.1-rc.5 <0.2.2-0"
    }
  },
  "matrix": {
    "dsh": ["0.2.2-rc.1", "0.2.1-rc.5"],
    "gsd": ["1.20.1", "1.19.0"]
  }
}
```

**唯一改动**：`lines.022.peer` → `"@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`。**`lines.021` 不动**（它是前行专属值，不参与当前声明行对照）。

**四个消费方（改这里 = 同时影响它们，plan 的 verify 必须全覆盖）**：

| 消费方 | 位置 | 与 `peer` 的关系 |
|---|---|---|
| check-pins (j) | `build/lib/check-pins.mjs:152-160` | 强等值：`"<name> <range>"` 拼接后逐字比较 ⇒ 本次改动的直接强制方 |
| compat-matrix ② | `tests/compat-matrix.test.mjs:41-53` | 读 `matrix.dsh` × `matrix.gsd` 双向精确等值（本次不改轴） |
| compat-matrix ③ | `tests/compat-matrix.test.mjs:58-75` | 读 `lines.*.dshRange` 判定 expect 列（本次不动 `dshRange`） |
| docs-consistency ② | `tests/docs-consistency.test.mjs:44-53` | 读 `lines.022.dshRange` 与 `engines.dsh` + README 双语对照（本次不动） |

---

### `README.md`（doc）— MODIFIED

**Analog:** 自身双语镜像结构（carry-forward）。**哨兵** = `tests/docs-consistency.test.mjs`（7 条全绿是现状基线）。

**双语边界是机器算的**（`tests/docs-consistency.test.mjs:26-30`，逐字）：

```js
// README 双语两半：zh 段在前，en 段从第二个 '# dsh-gsd' 标题起。
const firstTitle = readme.indexOf('# dsh-gsd')
const enStart = readme.indexOf('# dsh-gsd', firstTitle + 1)
const readmeZh = readme.slice(0, enStart)
const readmeEn = readme.slice(enStart)
```

⇒ 徽章块**放在最顶部**（`<!-- generated-by: gsd-doc-writer -->` 之后、第一个 `# dsh-gsd` 之前）最安全：单块服务双语、且 `indexOf` 的两次定位不受影响。**切勿**插入任何含字面 `# dsh-gsd` 的行（会切歪双语边界，①②⑦ 一起红）。

**改动点 1 —— 徽章（SC-4）**，建议形态（静态 shield，无 `dsh-gsd@` 捕获、不含 `# dsh-gsd`）：

```markdown
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.1-blue)](https://github.com/pfmiles/dsh-gsd#requirements)
```

> 第二个徽章刻意**只放行标签**、不放完整窗口串（`>=0.2.2-rc.1 <0.3.0-0` 需要 shields.io 的 `--`/`%20` 转义，容易拼成破图，且窗口串已有 ② 的正文声明兜底）。plan 若要放完整窗口串，必须先在浏览器打开渲染结果确认。

> `[ASSUMED]` A5：shields.io 在部分网络不可达 ⇒ 徽章变破图。备选：仓内已有 `icon.svg` 先例，可放本地 SVG 徽章；或省略徽章只留文字声明。plan 里要写死选择，别留「看情况」。

**改动点 2 —— 不带版本号的等价命令（SC-3 的落点，见 ⛔-G）**。既有规范命令保持逐字不动（`README.md:19` / `:89`）：

```bash
# 1. 安装 → 带版本（规范形态，保留）
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022
```

在同段追加裸名示例（市场 / 宿主 Discover 的生成形态）：

```bash
# 市场（dshmarket）与宿主 Discover 的卡片给的是不带版本号的等价命令：
dsh plugin --profile web add dsh-gsd
```

英文半段同理（`README.md:89` 之后）。

**改动点 3 —— 「当前状态」段与 D-02 的现存矛盾**（RESEARCH「Deprecated/outdated」点名）：

- `README.md:59` 原文：`…版本化安装通道与 dshmarket 收录随 [ROADMAP](./.planning/ROADMAP.md) Phase 3 开放，干净机器 8 项 UAT 收官安排在 Phase 5。`
- `README.md:129` 原文：`…Versioned install channels and the dshmarket listing open with [ROADMAP](./.planning/ROADMAP.md) Phase 3; clean-machine UAT (8 items) closes at Phase 5.`

⇒ 改为「随 Phase 5 发布开放」的双语对应句。**这是本 phase 唯一必须改的 README 语义文案**（其余是增量）。

**PUB-04 的落地物已全部存在——本 phase 只做可见性，不新建章节：**

| 要求 | 现状证据（逐字） | 本 phase 动作 |
|---|---|---|
| MIT 许可 | `LICENSE:1` `MIT License`；`package.json:15` `"license": "MIT"`；`README.md:67-69` 与 `:137-139` 双语 License 段 | **不动**；仅由徽章提升可见性 |
| 上游致谢 | `README.md:69` `含上游内容：GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。` / `:139` 同义英文；`README.md:65` 与 `:135` 双向链到 `THIRD-PARTY-NOTICES.md` | **不动**；`THIRD-PARTY-NOTICES.md` 记录的是各上游自己的许可，D-01 明令不碰 |
| 第三方组件各自许可 | `THIRD-PARTY-NOTICES.md:6-9` 表（`@opengsd/gsd-core` 1.20.1 / 1.19.0，许可列 `MIT`）+ `:11-14` 核对脚注 | **不新增「致谢」章节**——现有两处已够，重复章节只会制造第二真源 |

---

### `CHANGELOG.md`（doc）— NEW

**Analog:** `THIRD-PARTY-NOTICES.md`（仓内唯一「根级 + 短 + H1 + 一句话定位 + 结构化表 + 脚注留痕」的独立 md，17 行）：

```markdown
# THIRD-PARTY NOTICES — dsh-gsd

本文件记录构建期取源第三方包 `@opengsd/gsd-core` 的 canonical 元数据（SBOM）。
离线 ①/② 档（`GSD_TARBALL` / `.build-cache`）解包前完整性校验、发布合规核对均以此表为准。
```

叠加 `BUILD.md:1-5` 的体例（H1 = `文件名 — 一句话职责` + 一段 EN 摘要 + 后接结构化正文）。**语言档位与 `BUILD.md` 对齐**：zh 正文 + 英文小节名，不做双语镜像（双语镜像只 README 有）。

**骨架（Keep a Changelog 1.1.0，RESEARCH Code Examples 已给，此处补两条本仓约束）**：

```markdown
# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to a `<gsd-ver>-<rev>.dsh<line>` versioning scheme.

## [Unreleased]

## [1.20.1-1.dsh022] - 2026-11-12

### Added
- 72 个 `gsd-*` skills、GSD 1.20.1 引擎与生命周期守卫 hooks，作为一个 DSH 插件 bundle 分发
- `cordis.patch.yml` 挂载 `gsd` 与 `gsd-hooks-bridge` 两行；hooks 桥接自带 stdio adapter

### Changed
- 插件安装元数据合规化：`files` 白名单精确收录 `scripts/`、`locale/`、`icon.svg`

### Fixed
- 引擎 `MODULE_NOT_FOUND`：`scripts/` 兄弟目录随包分发
```

**本仓追加约束（plan 必须写进 action）：**

1. 版本号与 `package.json.version` **等值**（`1.20.1-1.dsh022`），日期用 `YYYY-MM-DD`（`2026-11-12`）——建议落成一条测试（见下）。
2. 小节名只用 `Added / Changed / Deprecated / Removed / Fixed / Security` 六个 + `[Unreleased]`，**不自创**（Don't Hand-Roll 表最后一行）。
3. **不进 `files`**（⛔-D）。
4. 文案来源只许可证事实（72 skills / GSD 1.20.1 / 958 文件 / 12 顶层），不写无法自证的形容词。

**推荐的可选断言（落 `tests/docs-consistency.test.mjs` 作 ⑧，形态照 ⑥ `:99-102`）**：

```js
// 待加进 tests/docs-consistency.test.mjs（imports / ROOT / read() 全部照用现制）
const SECTIONS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']

test('⑧ CHANGELOG 首条目版本与 package.json.version 等值，小节名在六类闭集内', () => {
  const cl = read('CHANGELOG.md')
  const m = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/m.exec(cl)
  assert.ok(m, 'CHANGELOG.md 缺少 "## [<version>] - <YYYY-MM-DD>" 形态的首条目')
  assert.equal(m[1], pkg.version, 'CHANGELOG 条目版本与 package.json.version 漂移')
  assert.equal(m[1], '1.20.1-1.dsh022')
  const heads = [...cl.matchAll(/^### (.+)$/gm)].map((x) => x[1].trim())
  const bad = heads.filter((h) => !SECTIONS.includes(h))
  assert.deepEqual(bad, [], `CHANGELOG 出现非 Keep a Changelog 小节名: ${bad.join(', ')}`)
  assert.ok(heads.length > 0, 'CHANGELOG 首条目没有任何 ### 小节')
})
```

> 该断言读文件用现成的 `read()`（`tests/docs-consistency.test.mjs:18`），不引新依赖；正则全部按行锚定，不用 YAML/markdown 解析器。

> 加了这个 `test(` ⇒ 计数 +1（见 ⛔-E）。若想守住 29，就把断言并进既有 ⑥ 的 body（不推荐：⑥ 的语义是 Pitfall 7 哨兵）。

---

### `tests/pack-contents.test.mjs`（test, file-I/O）— MOVED

**Analog:** 自身——文件**已经**是按目标位置写的（头注释 `:1` 即 `// tests/pack-contents.test.mjs`），移动即修好。同 idiom 的兄弟套件 = `tests/compat-matrix.test.mjs`（同一个 `ROOT` 惯用语）。

**ROOT 解析（唯一 bug 的所在，`:36`）**：

```js
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
```

| 位置 | `..` 到达 | 后果 |
|---|---|---|
| 现址 `tests/pending-phase-3/` | `tests/` | `join(ROOT,'package.json')` → `tests/package.json` ⇒ `ENOENT`（实测 `fail 1`） |
| 目标 `tests/` | 仓根 | ✅ 语义正确 |

⇒ **移动后文件内容零改动**（不需要「顺手修 ROOT」——改了反而错）。头注释里的「958 个文件、12 个顶层条目」交叉核对结论（`:17-19`）在目标位置继续成立。

**三层断言的锚点（plan 引用时按这些行号）**：

| 断言 | 行 | 语义 |
|---|---|---|
| ① `files` 白名单 | `:112-130` | 非空、纯字面量、无宽泛条目 / 否定条目 / 绝对路径 / `..` / glob |
| ② 推导收录面 | `:132-151` | `.planning/` 零出现 + 顶层收敛于 `ALLOWED_TOP_LEVEL`（`:41-45`） |
| ③ 条目有内容 | `:153-163` | 拼错 / 空目录即静默漏发；冷克隆未构建的五棵 gitignored 树豁免（`BUILD_TREES`，`:62`） |

**同步动作（同一 task 内完成，否则套件计数与文档打架）：**

1. `BUILD.md:16` 计数（见 ⛔-E）。
2. **删除 `tests/pending-phase-3/` 整个目录**（含 `README.md`）。该 README 的 `:19`「3/3 passing when run explicitly」在现址**本就不成立**（`ENOENT`），`:22-24` 的「To adopt in Phase 3」在移动后成为假陈述。留着 = 留一份自相矛盾的文档。目录无其他消费方（`node --test tests/*.test.mjs` 不递归）。
3. **不要**把 `tests/pending-phase-3/` 写进任何新白名单/忽略文件——它消失即可。

**planner 注意（并发）**：该套件是纯静态推导、秒级；但它读的是 `package.json` 与目录树，与 `build-smoke` 的写树动作**互斥**——串行纪律照旧（RESEARCH Pitfall 12）。

---

### `BUILD.md`（doc）— MODIFIED（单行）

**Analog:** 自身 TL;DR 命令块（`:9-24`）。

**逐字现状 `:16`：**

```bash
# 每波可重跑测试（含真实构建 smoke）——预期 26/26（真实构建 smoke；兼容矩阵/版本/文档一致性等套件已并入）
```

**目标**：数字改为**实测输出值**（29 或 30/31，见 ⛔-E），其余措辞逐字保留。`npm test`（`:17`）等相邻行不动。

**不要碰的地方**：`BUILD.md` 的 §①-⑨ 章节体制、双语表格列（`| 项 | 值 | EN |`）、§⑥ gates 契约、§⑦ canonical 表——它们是 Phase 01/02 的已验契约（`01-VERIFICATION.md` 的覆盖审计对象）。

---

### `docs/dshmarket/pfmiles__dsh-gsd.yml`（data）— NEW

**Analog:** **无仓内 analog**。这是外部闭集 schema（目标仓 `scripts/lib/entries.mjs` 的 `validateEntries` 是最终裁判），仓内不存在同类数据文件；`build/assets/pins.json` 只是「纯数据 + 显式 schema」的**格式气质**参照（2 空格、无注释、无多余键），不是同 role/同 data-flow 的 analog。

**形态（范围严格 5 字段，取自线上真实条目 `data/plugins/0-0-user__dsh-plan-note.yml`）**：

```yaml
# 文件名必须 = data/plugins/pfmiles__dsh-gsd.yml（由 slugFor(url) 生成）
url: https://github.com/pfmiles/dsh-gsd
name: pfmiles/dsh-gsd
category: workflow
description:
  en: 'GSD for DeepSeek Harness: a spec-driven coding workflow that ships 72 gsd-* skills, the GSD engine, and lifecycle guard hooks as one plugin bundle.'
  zh: '把 GSD 规格驱动编码工作流装进 DeepSeek Harness：72 个 gsd-* 技能、GSD 引擎与生命周期守卫钩子合为一个插件包。'
# icon: 省略 —— 只收 GitHub 托管位图（png/jpg/jpeg/webp）；本仓只有 icon.svg，会被拒
```

**双语口径的仓内来源**（不发明新话术）：`locale/en.json` 的 `meta.description` 与 `locale/zh.json` 的 `meta.description` 已经是同一件事的双语表述，catalog 文案应从它们扩写（保留「72 skills + engine + guard hooks」三要素），而不是另起一套。

**离线自检（零依赖、行级正则，不引 js-yaml）** —— RESEARCH Code Examples 已给完整脚本；plan 把它落成 `03-VALIDATION.md` 的 SC-3 命令或 `docs/dshmarket/README.md` 里的一段可粘贴命令即可。

**同目录 `docs/dshmarket/README.md`（提交说明，非机器格式）** 需含：

1. 目标仓 / 文件路径 / PR 时点（Phase 5）；
2. 生成式 install 命令的**逐字**形态 `dsh plugin --profile web add dsh-gsd`，并指向 README 的裸名示例（⛔-G）——SC-3 的「逐字一致」在这里被 `grep -F` 验证，**不在 YAML 里**；
3. 可证事实清单（72 skills / GSD 1.20.1 / catalog 四检：≤3 条、`dsh.bundle` 存在、仓龄 ≥1 天、awesome-lint + site build）；
4. 「非纯聚合包」的论证点（自带 `index.js` skill provider、`hooks/dsh-gsd-suite` stdio adapter、`config/gsd-hooks.json`）——RESEARCH Pattern 3 #14，别留给审核者猜。

---

### `tests/docs-consistency.test.mjs`（test, file-I/O）— MODIFIED（可选）

**Analog:** 自身 ①-⑦（carry-forward）+ `tests/version.test.mjs`（消费 `check-pins` 导出的单一真值 idiom）。

**若要加断言，形态照搬现制**（imports / ROOT / `read()` helper 全部照用，`:9-24`）：

```js
import { parseVersion } from '../build/lib/check-pins.mjs'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
```

**加断言前必读的三条硬门（都在本文件内）：**

| 门 | 行 | 含义 |
|---|---|---|
| ② | `:44-53` | `engines.dsh === pins.lines.022.dshRange`，且该窗口串在 README 出现 ≥2 次（双语各一次）⇒ 改裸名示例/徽章都别碰这个串 |
| ③ | `:55-66` | README + BUILD 的全部 `dsh-gsd@` 示例必须能被 `parseVersion` 拆解 ⇒ 别写 `dsh-gsd@<占位>`、`dsh-gsd@{ver}` |
| ⑤ | `:83-97` | `dsh-gsd@` 后必须数字开头；`dsh-gsd@latest` 零出现 |

**建议追加（顺序执行，一次加完再跑，避免中途红）**：⑧ CHANGELOG 版本等值 + 六类小节名（见 CHANGELOG 段），⑨（可选）徽章与致谢可见性：

```js
test('⑨ 徽章与上游致谢可见性（防漂移）', () => {
  assert.match(readme, /!\[[^\]]*\]\(https:\/\/img\.shields\.io\//, 'README 缺 shields.io 徽章')
  for (const [name, s] of [['zh', readmeZh], ['en', readmeEn]]) {
    assert.ok(s.includes('THIRD-PARTY-NOTICES.md'), `README ${name} 段缺 THIRD-PARTY-NOTICES 链接`)
    assert.ok(s.includes('MIT'), `README ${name} 段缺 MIT 声明`)
  }
})
```

---

## Shared Patterns

### 1. 单一真源链：任何版本串改动只能从 `pins.json` 起手
**Source:** `build/lib/check-pins.mjs:54-160`（(a)-(k) 共 11 段校验）+ `tests/compat-matrix.test.mjs:41-75`（②③）+ `tests/docs-consistency.test.mjs:44-53`（②）。
**Apply to:** `package.json`、`build/assets/pins.json`、`.github/workflows/compat-matrix.yml`、`README.md`、`BUILD.md`。

链路是单向的：`pins.json` → `package.json`（check-pins 强等值）→ workflow 格（compat-matrix ② 双向等值）→ 文档窗口串（docs-consistency ② 强等值）。**先改 pins.json 再改下游**，每改一层跑一次对应套件；反过来必然中途红。

```bash
# 版本/pin 面每次改动后的最小回路（秒级）
node build/lib/check-pins.mjs --offline        # 期望 exit 0 `pins: all consistent (line dsh022)`
node --test tests/compat-matrix.test.mjs       # 期望 7/7
node --test tests/docs-consistency.test.mjs    # 期望 7/7（或 8/8、9/9，按 ⛔-E 锁定）
```

### 2. 「历史陈述不动」纪律（唯一的活体计数在 `BUILD.md:16`）
**Source:** `tests/pending-phase-3/README.md:22-24`（迁移说明）+ `02-REVIEW-FIX.md:76`（历史陈述按约定不动的先例）+ `02-VALIDATION.md:25/:38/:58`（`26/26` 全部带 `HEAD 84784f1` 引用）。
**Apply to:** 所有涉及测试计数的编辑。

规则：**只有 `BUILD.md:16` 是可以改写的活体数字**；`01-VERIFICATION.md`、`02-VALIDATION.md`、`STATE.md`、`02-REVIEW.md` 里的旧数字是**已签名审计结论**，只允许追加带日期的前向注记（`> ⚠️ Phase 3（2026-11-12）注：本处 26/26 为 Phase 02 口径，纳管 pack-contents 后为 29/29…`），不得改写正文。同理 `tests/docs-consistency.test.mjs:101` 的 message 里「private: true 移除属 Phase 3 任务」是 D-02 前的口径——plan 可改写 **message**，但**不改断言**。

### 3. 零依赖 / 零 YAML parser（硬约束）
**Source:** `package.json` 无 `devDependencies`、仓内无 lockfile；`tests/compat-matrix.test.mjs:5` 头注释「零 YAML 依赖——全字符串/JSON 断言」；`tests/pack-contents.test.mjs:18-22`（不真跑 pack 的理由）。
**Apply to:** 全部新测试、workflow 断言、catalog 材料自检。

- YAML 断言 → 字符串/正则（`includes` / 整行正则）。
- YAML 材料校验 → 行级正则（RESEARCH 自检脚本），**不引 `js-yaml`**。
- semver → **禁止**仓内自算，唯一判定器是 `build/lib/compat-probe.mjs`（转发宿主 `evaluatePluginCompatibility`）。
- 需要版本格式 → 只消费 `check-pins` 导出的 `parseVersion` / `validateVersion`（`build/lib/check-pins.mjs:27-44`，`tests/docs-consistency.test.mjs:15` 与 `tests/version.test.mjs:15` 均如此）。

### 4. 测试文件统一体例
**Source:** 5 个现役套件全同构（`tests/version.test.mjs:1-13`、`tests/compat-matrix.test.mjs:1-15`、`tests/docs-consistency.test.mjs:1-21`）。
**Apply to:** 移动后的 `pack-contents`、任何新增断言。

```js
// tests/<name>.test.mjs — <一句话职责>（per-commit 秒级反馈回路）。
// 覆盖 plan <id> Task <n> 的 ①-⑦ 断言面：…
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
```

固定四件套：① 头注释写「覆盖谁 / 为什么这么写」；② `node:test` + `node:assert/strict`；③ `ROOT` 用 `import.meta.url` 的 `..` 求仓根；④ test 名以 `① ② ③` 编号 + 中文描述，断言 message 用中文并说明**为什么**这条会红。

### 5. `node --test tests/*.test.mjs` glob 形态（禁用目录参数）
**Source:** `package.json:45-46`；BUILD.md §（01-02 偏差 2：Node 24.21.0 下 `node --test tests/` 机械失败）。
**Apply to:** `BUILD.md:16` 的措辞、所有 verify 命令、CI 的「完整测试」步。**永远**写 glob。

### 6. 串行纪律（build / tests / pack 三者互斥）
**Source:** `tests/build-smoke.test.mjs:24-44`（env 白名单 + `canBuild` skip 语义）+ STATE 已锁纪律。
**Apply to:** `npm pack`（会触发 `prepack` = build + 全量测试）、`node build.mjs`、`node --test tests/*.test.mjs`。

三者**永不并发**，否则假红 `gate C: no SKILL.md under skills/gsd-*`，且 pack 清单会在 21/494/957/958 之间跳变。只观测收面时用 `npm pack --dry-run --json --ignore-scripts`（跳过 prepack）。

### 7. exit 0/1/2 契约 + 单出口 `finish()`
**Source:** `build.mjs:32-35`（`finish`）+ `:18-19`（头注释里的 exit 语义）+ `build/lib/check-pins.mjs:9-11` + `:19-22`；`tests/run-gates.sh:18`；`build.mjs:331-341`（gates 退出码逐字透传）。
**Apply to:** workflow 内的新断言（偏离即 `exit 2`，与 gate 同口径）、catalog 自检脚本（`process.exitCode = 1`）、任何新脚本。

```js
const finish = (code, msg) => {
  if (msg) (code === 0 ? console.log : console.error)(msg)
  process.exit(code)
}
```

### 8. 文档只许 exact spec（refuse-by-design）
**Source:** `tests/docs-consistency.test.mjs:83-97` ⑤ + `README.md:41` / `:111` 的显式声明。
**Apply to:** README / BUILD.md / CHANGELOG / catalog 说明里的每一条命令。

`@^` `@~` `@*` `@latest` **零出现**；唯一例外是「市场生成形态」的**裸名**（⛔-G）。`github:pfmiles/dsh-gsd` 与 `dsh plugin --profile web remove dsh-gsd` 这类不含 `@` 的形态天然安全。

### 9. push 走 SSH（唯一一次对外动作在本 phase 之外仍影响它）
**Source:** RESEARCH Pitfall 2（`gh auth status` scopes = `gist, read:org, repo`，**无 `workflow`**；`origin` 是 `git@github.com:…`）。
**Apply to:** 提交完成后的推送（orchestrator 执行，非本 agent）。

本次 push 会**新增** `.github/workflows/`，HTTPS + OAuth token 会被 GitHub 拒（`refusing to allow an OAuth App to create or update workflow`）。保持 SSH。若误切 HTTPS 失败，修法 `gh auth refresh -s workflow` 属对外动作，plan 应放在 checkpoint 上。

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `docs/dshmarket/pfmiles__dsh-gsd.yml` | data（外部 schema） | file-I/O | 仓内无「第三方 registry 提交物」这类数据文件；schema 由目标仓 `scripts/lib/entries.mjs` 定义，闭集 word list（23 个 `category`）不在本仓。plan 直接用 RESEARCH Pattern 3 的 5 字段形态 + 行级正则自检，**不要**为它新建仓内 schema 模块或引 `js-yaml`。 |
| （整份 phase 的 CI 面） | config / batch | batch | 已不适用：Phase 02 建了 `.github/workflows/compat-matrix.yml`，本 phase 是**修改**而非新建，analog = 自身。仅记录以避免 planner 误以为要重写。 |

## Metadata

**Analog search scope:** 仓库 tracked 全集（`git ls-files` 核实）；重点目录 `tests/`、`build/{assets,lib}/`、`.github/workflows/`、仓根 `.md` + `package.json`。`.gitignore` 覆盖的产物树（`skills/` `gsd-core/` `hooks/` `config/` `scripts/`）与 `.gsd-build-tmp/` `.build-cache/` `node_modules/` 明确排除。
**Files scanned:** `03-CONTEXT.md` (152 L) · `03-RESEARCH.md` (791) · `03-VALIDATION.md` (~150) · `02-PATTERNS.md` (438, 体例参照) · `02-REVIEW.md` (187 段) · `02-VALIDATION.md` (grep 计数段) · `.github/workflows/compat-matrix.yml` (44) · `tests/compat-matrix.test.mjs` (123) · `tests/docs-consistency.test.mjs` (107) · `tests/version.test.mjs` (1-30) · `tests/build-smoke.test.mjs` (1-45) · `tests/pending-phase-3/pack-contents.test.mjs` (163) · `tests/pending-phase-3/README.md` (24) · `build/lib/check-pins.mjs` (198) · `build/assets/pins.json` (28) · `build.mjs` (selective: 28-45 / 175-196 / 250-258 / 325-345) · `package.json` (48) · `README.md` (139) · `BUILD.md` (1-60) · `THIRD-PARTY-NOTICES.md` (17) · `LICENSE` (head) · `locale/{en,zh}.json`
**Tracked-source gate:** 所有 named analog 经 `git ls-files -- <path>` 非空核实；无 mirror 路径进入本文件。
**Inherited evidence（未在本会话复跑，直接引用 RESEARCH 实测）:** `npm pack` 958 文件 / 12 顶层 / leaks 0；四变体 `npm install` 包数（656 / 706 / 601）；probe 双向 exit 0；`tests/pending-phase-3/pack-contents.test.mjs` 现址 `ENOENT tests/package.json`。本 agent 硬约束禁止 `npm install` / `npm pack` / `gsd_run` / git 写操作，故以上均为**继承证据**，验证归属执行期。
**Pattern extraction date:** 2026-11-12