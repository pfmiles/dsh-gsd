# Phase 2: 版本与兼容矩阵 - Pattern Map

**Mapped:** 2026-11-11
**Files analyzed:** 11（7 新增 + 4 修改）
**Analogs found:** 10 / 11

> **Tracked-source gate verified（#3645）：** 下表所有 named analog 均经 `git ls-files` 非空核实为 git-TRACKED 源。`config/`、`skills/`、`gsd-core/`、`hooks/`、`scripts/` 为 `.gitignore` 覆盖的构建产物树（`.gitignore` L5-L8），**不得作为 analog 引用**；内容需要时引用其 tracked 起源（`build/assets/*`、`build/lib/*`）。

## ⛔ Planner-Must-Resolve（任何 plan 动笔前先裁决）

**RESEARCH.md 把三个新增仓库侧工具放在 `scripts/`（pins.json / check-pins.mjs / compat-probe.mjs），但该路径与两个 git 事实冲突：**

1. **`.gitignore` L8 忽略整个 `scripts/` 树**——新文件根本无法 commit：
   ```
   skills/
   gsd-core/
   hooks/
   config/
   scripts/
   ```
   （`git check-ignore -v scripts/pins.json` → `.gitignore:8:scripts/`，实测。）
2. **`build.mjs` ⑤ 捕获段每轮构建先删后拷 `scripts/` 树**（build.mjs L281-283）——即使强行 commit（negation），任何一次 `node build.mjs` 都会把工作区的已提交文件从盘上抹掉再从 GSD staging 拷一份替代：
   ```js
   for (const d of ['skills', 'gsd-core', 'hooks', 'config', 'scripts']) {
     await rm(join(root, d), { recursive: true, force: true })
   }
   ```
   且 `scripts/` 在 package.json `files` 白名单内（L41），本 phase 的三个工具是 CI/tests 消费的仓库侧工具，**不需要进安装 tarball**。

**选项 A（推荐）——迁到 tracked 的 `build/` 树：** `build/assets/pins.json` + `build/lib/check-pins.mjs` + `build/lib/compat-probe.mjs`。既有先例：`build/assets/gsd-hooks.json`、`build/assets/dsh-gsd-suite-run.cjs`、`build/lib/rewrite-map.cjs` 全部 tracked；`tests/rewrite-map.test.mjs` L9 已用 `import { makeRewrites } from '../build/lib/rewrite-map.cjs'` 消费 build/lib。**零改动** `.gitignore` 与 `build.mjs` 捕获语义；只需在本 phase 新文件（workflow/tests/02-VALIDATION.md）里把 RESEARCH 的 `scripts/…` 路径引用统一替换为 `build/…` 路径——这些文件全部是本 phase 产物，改写零成本。

**选项 B——保留 `scripts/`：** 必须（1）`.gitignore` 加 negation、**且**（2）改 `build.mjs` 捕获段保留已提交的自有文件（删树前备份、拷树后回放）。动的是 Phase 1 刚固化的构建契约（BUILD.md §②-4「4 树白名单捕获」），面更大；不推荐。

下文分类表按**选项 A 路径**列出（括注 RESEARCH 原提案路径）。

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `build/assets/pins.json` | config | file-I/O（静态数据，check-pins/workflow 消费） | `build/assets/gsd-hooks.json`（tracked 配置树先例）+ `package.json` L16-31（它镜像的执行真值） | role-match |
| `build/lib/check-pins.mjs` | utility | batch/transform（file-I/O + subprocess） | `build.mjs`（exit funnel / env trim / 字符串表解析 / spawnSync 取样 / fail-closed exit 2） | role-match |
| `build/lib/compat-probe.mjs` | utility | request-response（宿主求值函数调用 → exit code） | `build.mjs` L252-258 pre-gate（spawnSync 求值比对 + exit 2） | role-match |
| `tests/version.test.mjs` | test | transform（纯解析/校验） | `tests/rewrite-map.test.mjs`（纯模块单测全形态） | exact |
| `tests/compat-matrix.test.mjs` | test | file-I/O（静态：workflow YAML 存在性/轴值） | `tests/build-smoke.test.mjs` L84-88（spawnSync grep）+ L113（JSON.parse 断言） | role-match |
| `tests/docs-consistency.test.mjs` | test | file-I/O（静态：README/package.json 一致性） | 同上 + `tests/rewrite-map.test.mjs`（编号断言风格） | role-match |
| `.github/workflows/compat-matrix.yml` | config（CI 编排） | batch（matrix 并行格） | — No Analog Found —（repo 无任何 `.github/`） | — |
| `package.json`（修改） | config | — | `package.json`（in-place：version/engines/deps/prepack 现态） | self (carry-forward) |
| `README.md`（修改） | doc | — | `README.md`（in-place：双语结构 + 版本示例段落） | self (carry-forward) |
| `BUILD.md`（修改） | doc | — | `BUILD.md`（in-place：§ 编号章节 + 双语表格 + TL;DR） | self (carry-forward) |
| `THIRD-PARTY-NOTICES.md`（修改） | doc/config | — | `THIRD-PARTY-NOTICES.md`（in-place：SBOM 表行格式） | self (carry-forward) |

**显式不在本 phase 文件清单：**
- `cordis.patch.yml` —— RESEARCH 未要求改动；它是 `dsh.bundle.patch` 指针（package.json L20-24），本 phase 的「桥接 pin 文件」指三处执行真值：`dependencies` 两件 pin（package.json L26-27）+ `peerDependencies` 范围（L30），全部经 `check-pins` 对照 `pins.json` 校验，无需动 patch 文件本身。
- `.gitignore` —— 仅选项 B 才需改（见 ⛔）；选项 A 下零改动。
- `hooks/dsh-gsd-suite/run.cjs` 等 gitignored 产物 —— 非 tracked，本 phase 不触碰。

## Pattern Assignments

---

### `build/assets/pins.json`（config, file-I/O）— NEW

**Analog:** `build/assets/gsd-hooks.json`（tracked canonical 配置先例，`git ls-files -- build/` 证实）+ `package.json` L16-31（被镜像的执行真值）。

**JSON conventions**（01-PATTERNS §JSON conventions，经 phase 1 全链执行验证）：2 空格缩进、双引号、无尾逗号；纯数据、无注释。

**内容形态**（RESEARCH Pattern 2 示例，规划者细化；三行 ↔ 三处执行真值一一对应）：

```json
{
  "lines": {
    "022": {
      "dshRange": ">=0.2.2-rc.1 <0.3.0-0",
      "bridge": {
        "@deepseek-ai/dsh-hooks-claude-code": "0.2.2-rc.1",
        "@deepseek-ai/dsh-hook-protocol": "0.2.2-rc.1"
      },
      "peer": "@deepseek-ai/dsh-skill-filesystem >=0.2.2-rc.1 <0.3.0-0"
    },
    "021": {
      "dshRange": "<unsupported>",
      "bridge": { "…": "0.2.1-rc.5", "…": "0.2.1-rc.5" },
      "peer": "@deepseek-ai/dsh-skill-filesystem >=0.2.1-rc.5 <0.2.2-0"
    }
  },
  "matrix": {
    "dsh": ["0.2.2-rc.1", "0.2.1-rc.5"],
    "gsd": ["1.20.1", "1.19.0"]
  }
}
```

**被镜像的执行真值**（check-pins 的对照对象，package.json L16-31）：

```json
"engines": {
  "node": ">=24",
  "dsh": ">=0.2.2-rc.1 <0.3.0-0"
},
"dependencies": {
  "@deepseek-ai/dsh-hooks-claude-code": "0.2.2-rc.1",
  "@deepseek-ai/dsh-hook-protocol": "0.2.2-rc.1"
},
"peerDependencies": {
  "@deepseek-ai/dsh-skill-filesystem": ">=0.2.2-rc.1 <0.3.0-0"
}
```

**⚠ Planner notes：** RESEARCH 原提案路径 `scripts/pins.json`（若选 B 见 ⛔）。单一真源语义：workflow 轴值、compat-matrix.test.mjs 断言、check-pins 对照全部以本文件驱动（RESEARCH Anti-Pattern「矩阵轴硬编码版本字符串而不用 pins.json 驱动」）。

---

### `build/lib/check-pins.mjs`（utility, batch/transform）— NEW

**Analog:** `build.mjs`（repo 内唯一大规模顶层脚本工具，已固化 exit 0/1/2 契约）。

**Shebang + 头注释**（build.mjs L1-19 形态）——新脚本延续「一行职责 + exit codes 契约」头注释：

```js
#!/usr/bin/env node
// build.mjs L18-19 先例：
// Exit codes: 0 ok … / 1 IO·unpack·installer failure … / 2 gate failure (blocks prepack).
```

**Imports：Node built-ins only，零第三方**（build.mjs L20-26；repo 无 devDependencies/lockfile）：

```js
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
```

**Single exit funnel + env trim**（build.mjs L32-38，逐字可复用）：

```js
const finish = (code, msg) => {
  if (msg) (code === 0 ? console.log : console.error)(msg)
  process.exit(code)
}
const env = (name) => (process.env[name] || '').trim()
```

**root 解析惯用语**（build.mjs L28）：

```js
const root = resolve(dirname(fileURLToPath(import.meta.url)))
```

**核心对照形态：字符串表解析 + fail-closed exit 2**（build.mjs `checkTarballIntegrity` L164-184 —— 读 Markdown 表行、剥 `|`、逐格比对、不符 `finish(2, …)`；check-pins 同构：读 pins.json 与 package.json，把 `lines` 各键与 engines.dsh / dependencies / peerDependencies 逐字对照）：

```js
const notices = await readFile(join(root, 'THIRD-PARTY-NOTICES.md'), 'utf8')
const tableRows = notices.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('| … |'))
const row = tableRows.find((l) => l.startsWith('| … |'))
if (!row) { finish(2, `… no record …`) }
```

**registry 取样（在线档）**：`spawnSync('npm', ['view', …])` 形态照 build.mjs L220（`npm pack` spawn）；`--offline` 跳过取样（RESEARCH [3]）；`--registry=` 走 §⑦ 纪律。

**top 级执行入口**（build.mjs L355）：

```js
await main().catch((e) => finish(1, `…: unexpected failure — ${e?.message ?? e}`))
```

**⚠ Planner notes：**
- exit 码：0 ok / **2 = 校验失败（gate 口径，阻断）**，文案列明每个不动项——RESEARCH [3]：「失败 exit 2（gate 口径），文案列明：版本号格式、`dsh<line>` 与 pins.json 行号、engines.dsh 窗口串、三件 pin 等值的具体不动项」。
- **CLI 参数解析无 in-repo 先例**（build.mjs 只读 env）。用 Node 内置 `node:util` `parseArgs`（零依赖硬约束）；不要自写 argv 解析。
- RESEARCH Q5：并入 test 套件消费（tests 直接 import 其导出函数或 spawn），**prepack 链不动**。
- 版本号格式白名单正则（VER-02）：`1.20.1-<rev>.dsh022` —— rev 纯数字 id、线号去点（Pitfall 1 实测：带点 = 多 prerelease id → 排序病理）。`semver.parse(v).prerelease.length === 2` 为失败信号。

---

### `build/lib/compat-probe.mjs`（utility, request-response）— NEW

**Analog:** `build.mjs` pre-gate 块 L252-258 —— repo 内「spawn/subprocess 求值 → 字符串比对 → exit 2」的唯一先例：

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

**未变契约复用**：`finish()` L32-35、`env()` L38、root 解析 L28 同上。exit 码对齐 gate 口径（run-gates.sh L18）：0 = 结果与 `--expect` 一致（install-ok → 求值返回 undefined；reject → `requirements["engines.dsh"]` 非空）；1 = IO/解析失败（找不到宿主模块等）；2 = 求值结果与期望**不符**（矩阵格红）。

**宿主函数解析（无 in-repo 先例，规划者细化）**：DSH 由 CI 单元格 `npm install --no-save --ignore-scripts @deepseek-ai/dsh@<line>` 装入 repo `node_modules`（npm 默认 hoisting 使 `@deepseek-ai/dsh-app-boot` 可见）。解析路径用 `node:module` 的 `createRequire(import.meta.url)` 定位（ESM `.mjs` 文件引陌生 bare specifier 的稳妥路径），逐条尝试候选目录（`node_modules/@deepseek-ai/dsh-app-boot` 或其 nested 位置，照 RESEARCH 直读证据：`dsh-app-boot/lib/index.js:1097-1116` 的 `evaluatePluginCompatibility`），全部落空 → exit 1 + 明确文案。**禁止仓库侧自算 semver**（Anti-Pattern 2）。

**输入**（RESEARCH [1]）：`--dsh <runtime-version> --expect install-ok|reject`。求值对象 = 自家 `package.json` manifest。

---

### `tests/version.test.mjs`（test, transform）— NEW

**Analog:** `tests/rewrite-map.test.mjs` —— 纯模块单测全形态（exact）。

**Imports**（rewrite-map.test.mjs L6-9：`node:test` + `node:assert/strict`；被测模块从 tracked 树 import）：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeRewrites, PLUGIN_ROOT_REF } from '../build/lib/rewrite-map.cjs'
// 本文件对应形态：
// import { parseVersion, validateVersion } from '../build/lib/check-pins.mjs'
```

**测试风格**（rewrite-map.test.mjs L19-35）：中文注释头 + 「① ② ③」编号 test 名 + `assert.deepEqual/equal`。断言面：`1.20.1-1.dsh022`/`1.20.1-2.dsh022`/`1.20.2-1.dsh022`/`1.20.1-1.dsh021` 合法与字段拆解（RESEARCH [1]）；负向：`1.20.1-1-dsh0.2`（带点=多 id）、rev 混入字母 id（`1-dsh02`）、`0.1.0-gsd1.20.1`（旧锚点，迁移后应判 deprecated/失效——docs-consistency 锁定）。

**格式规则来源**：build.mjs L242-244 是 repo 内唯一现役版本格式 gate（`/^\d+\.\d+\.\d+$/` → exit 2），本测试即该风格在新域（插件版本号而非 GSD_VERSION）的复制：

```js
const GSD_VERSION = env('GSD_VERSION') || '1.20.1'
if (!/^\d+\.\d+\.\d+$/.test(GSD_VERSION)) {
  finish(2, `build: invalid GSD_VERSION '${GSD_VERSION}' (must match \\d+\\.\\d+\\.\\d+)`)
}
```

**运行形态**：`node --test tests/*.test.mjs` **glob 形式**——BUILD.md L110 实证：Node 24.21.0 下 `node --test tests/`（目录参数）机械失败（01-02 偏差 2），禁 directory arg。

---

### `tests/compat-matrix.test.mjs`（test, file-I/O static）— NEW

**Analog:** `tests/build-smoke.test.mjs`（文件存在性 + spawnSync grep + JSON.parse 断言的静态防线组）。

**Imports + ROOT**（build-smoke.test.mjs L11-19）：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
```

**grep 式文件断言**（build-smoke.test.mjs L84-88 —— 产物树扫描的同款形态，此处扫 workflow YAML）：

```js
const tildeScan = spawnSync('grep', ['-RIl', '~/.dsh', 'skills', 'gsd-core', 'hooks', 'config'], {
  cwd: ROOT, encoding: 'utf8',
})
const tildeHits = (tildeScan.stdout || '').split('\n').filter(Boolean)
assert.deepEqual(tildeHits, [], `~/.dsh literals remain: ${tildeHits.join(', ')}`)
```

**JSON.parse 断言**（build-smoke.test.mjs L113）：

```js
const registry = JSON.parse(readFileSync(join(ROOT, 'config', 'gsd-hooks.json'), 'utf8'))
```

**⚠ 关键约束：零依赖 → 无 YAML parser。** workflow 断言 = 字符串/正则形态：`existsSync('.github/workflows/compat-matrix.yml')`；`matrix` 轴值来自 `JSON.parse(pins.json).matrix`（dsh/gsd 数组），逐值 `assert.ok(yamlText.includes(v))`（轴值为 pins.json 子集 + 含当前行/前行）；`expect: reject` 格存在性用正则。**不要**为一致性测试引入 yaml 依赖、**不要**在测试里重算 semver（走探针/等值，Pattern 1）。

---

### `tests/docs-consistency.test.mjs`（test, file-I/O static）— NEW

**Analog:** 同上家族（readFileSync + `assert.match` + `assert.doesNotMatch`，build-smoke.test.mjs L117-141 的 match 断言形态）。

**断言面**（RESEARCH Validation Map VER-02/VER-04）：
- `package.json` engines.node `>=24` ↔ README 双语「Node ≥ 24」两侧声明（README.md L41 与 L98 现态已一致，测试锁死防漂移）；
- README/BUILD.md 出现的全部版本示例（`dsh-gsd@…`）匹配新方案 `<gsd-ver>-<rev>.dsh<line>` 正则、且**不含** `@^`/`@~`/`@*`/`@latest`（Pitfall 5 哨兵）；旧锚点 `0.1.0-gsd1.20.1` 迁移后应判为失效示例（Pitfall「Deprecated」行）；
- Pitfall 7 哨兵：若 version 已迁移至新方案，断言 `private: true` 仍为 true（未发布前）。

---

### `.github/workflows/compat-matrix.yml`（config, batch orchestration）— NEW

**Analog:** — No Analog Found —（repo 无任何 `.github/`；`git ls-files -- .github/` = 空）。**Planner 用 RESEARCH Code Example [2] 骨架**：

```yaml
name: compat-matrix
on:
  push: { branches: [main] }
  pull_request: {}
  workflow_dispatch:
    inputs: { dsh: { type: string, required: false }, gsd: { type: string, required: false } }
jobs:
  matrix:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        include:
          - { dsh: "0.2.2-rc.1", gsd: "1.20.1", expect: install-ok }
          - { dsh: "0.2.2-rc.1", gsd: "1.19.0", expect: install-ok }
          - { dsh: "0.2.1-rc.5", gsd: "1.20.1", expect: reject }   # 前一行：负向格
          - { dsh: "0.2.1-rc.5", gsd: "1.19.0", expect: reject }
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 24 }
      - name: pins 对齐校验（仓库侧静态）
        run: node build/lib/check-pins.mjs --offline     # 选项 A 路径；B 为 scripts/check-pins.mjs
      - name: 宿主求值探针（install-ok/reject）
        run: |
          npm install --no-save --ignore-scripts @deepseek-ai/dsh@${{ matrix.dsh }}
          node build/lib/compat-probe.mjs --dsh ${{ matrix.dsh }} --expect ${{ matrix.expect }}
      - name: build + gates（GSD 轴，gate A/B/C 内嵌）
        run: GSD_VERSION=${{ matrix.gsd }} node build.mjs
      - name: 完整测试（含真实构建 smoke）
        run: node --test tests/*.test.mjs
```

**⚠ Planner notes：**
- actions 版本已经 GitHub API 实测核实：`actions/checkout@v7`（v7.0.1，2026-07-20）、`actions/setup-node@v7`（v7.1.0，2026-10-08）——RESEARCH Standard Stack。
- A2 假设（setup-node@v7 保留 `node-version` 输入）：push 时 GitHub UI 可速查；本 phase 本地以 actionlint（未装 → 安装或一次人工 Review，RESEARCH §11）+ tests/compat-matrix.test.mjs 校验；**不 push**（PHASE 3 前置）。
- CI 格用 `@deepseek-ai/dsh@<line>` 求值探针，**不跑 `dsh plugin add`**（需 profile bootstrap，Anti-Pattern 3）。
- 轴值唯一来源 = pins.json（Anti-Pattern 4）；未来 DSH 新行先以 reject 格入库。

---

### `package.json`（config）— MODIFIED in place

**Analog:** `package.json` 自身（self carry-forward）。改动面最小化：

**version 迁移**（L3 现态 → 目标）：`"0.1.0-gsd1.20.1"` → `"1.20.1-1.dsh022"`（RESEARCH [1]：`<gsd-ver>-<rev>.dsh<line>`，rev 起算 1）。`private: true`（L4）**保持不动**（Pitfall 7——Phase 3 任务清单才移除 + publishConfig）。

**engines 不动**（L16-19）：`"dsh": ">=0.2.2-rc.1 <0.3.0-0"` 原样保留（「Alternative Considered」否定了扩大窗口）；`"node": ">=24"` 原样（VER-04 已满足）。

**dependencies/peerDependencies 不动**（L25-31）：pin 执行真值由 check-pins 对照 pins.json 校验，不手动改值——改值只发生在「DSH 发新行 → refresh 手续」（BUILD.md 新章）。

**scripts/prepack 不动**（L43-47，RESEARCH Q5「发布契约唯一变化点最少」）：

```json
"scripts": {
  "build": "node build.mjs",
  "prepack": "node build.mjs && node --test tests/*.test.mjs",
  "test": "node --test tests/*.test.mjs"
}
```

---

### `README.md`（doc）— MODIFIED in place

**Analog:** `README.md` 自身双语结构（self carry-forward）。改动面：

**Quick Start 版本号示例**（L17-22 现态 → 替换为 `dsh-gsd@1.20.1-1.dsh022`）：

```markdown
## 快速开始
# 1. 安装
dsh plugin --profile web add dsh-gsd@0.1.0-gsd1.20.1   # → 改为 dsh-gsd@1.20.1-1.dsh022
```

**升级/回滚 = 同命令换 exact 版本**（L30-36 先例，VER-02 字面要求）：

```markdown
# 升级 / 回滚：换一个版本号，重跑安装命令
dsh plugin --profile web add dsh-gsd@<新版本>
```

**环境要求双语声明**（L38-42 与 L95-99 —— VER-04 核对对象，现态已含 Node ≥ 24 与 engines.dsh 窗口）：新增版本号方案示例表 + 「dsh022 = DSH 0.2.2 线」映射行（RESEARCH Open Q3 采纳）；**全部示例只用 exact spec**（Pitfall 5：任何 `@^`/`@~`/`@*`/`@latest` 加 dsh-gsd 的组合都不得出现——docs-consistency 测试锁死）。README 主导安装叙事的演进：HTTP git 安装（`github:pfmiles/dsh-gsd`，L26/L83）在此阶段不作为主路径（RESEARCH「Deprecated」行），保留原文即动手最小。

---

### `BUILD.md`（doc）— MODIFIED in place

**Analog:** `BUILD.md` 自身章节体制（self carry-forward）。新增「版本与 pin 对齐」章，沿用现制：

**§ 编号 + 双语小标题**（L31/L43/L151 先例）：

```markdown
## ⑨ 版本与 pin 对齐（Version & pin alignment，VER-02/HOOK-05 前置）
```

**双语三列表格**（L33-37 先例：`| 项 | 值 | EN |`；L60-65：`| # | 档位 Tier | 行为 Behavior | 失败 Failure |`）——新章表：版本号方案字段表（gsd-ver / rev / dsh<line> / 示例 / 升级回滚命令）、行↔pin 对照（022/021 × 三件桥接 pin）。

**TL;DR 命令块样式**（L7-27 先例）；check-pins 三种调用（RESEARCH [3]）与 refresh 手续（DSH 发新行 → 探针先以 reject 格验证 → pin/窗口刷新 → 格升级 ok → rev 递增发新版本，Pitfall 9）按 §⑥「已实证的负向/正向命令」代码块形态记录。

---

### `THIRD-PARTY-NOTICES.md`（doc/config）— MODIFIED in place

**Analog:** 自身表格式（self carry-forward）。RESEARCH Open Q2 推荐：矩阵 GSD 轴取 {1.20.1, 1.19.0} → 按 BUILD.md §⑦ 增补 **1.19.0 canonical 行**（L6-8 表格式复制）：

```markdown
| 包名 | 版本 | dist.shasum | dist.integrity | 许可 | 来源 URL |
| ---- | ---- | ----------- | -------------- | ---- | -------- |
| @opengsd/gsd-core | 1.20.1 | d632001e2541e6cccfb740bcad5b2f5c334efabd | sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPcZQ== | MIT | https://registry.npmjs.org/@opengsd/gsd-core |
| @opengsd/gsd-core | 1.19.0 | <§⑦ 实测值> | <§⑦ 实测值> | MIT | https://registry.npmjs.org/@opengsd/gsd-core |
```

**⚠ 纪律**（L10-13 脚注）：canonical（registry.npmjs.org）值、与 npmmirror 逐字节一致、核对日期落注。1.19.0/1.16.0 的 dist.integrity+shasum「均已实测可取样」（RESEARCH Summary），写入前仍按 §⑦ 双镜像交叉核对，勿手抄研究文。

---

## Shared Patterns

### exit 0/1/2 契约（本 phase 全部新脚本/CI 的执行语言）
**Source:** `build.mjs` L32-35 + L18-19 头注释；`tests/run-gates.sh` L18；`BUILD.md` §⑤（L86-92）。
**Apply to:** `check-pins.mjs`（0 ok / 2 校验失败）、`compat-probe.mjs`（0 一致 / 1 IO·解析失败 / 2 求值结果与 expect 不符）、CI 单元格（`GSD_VERSION=<gsd> node build.mjs` 与 `node --test tests/*.test.mjs` 原样消费既有契约，build 侧完全无改动）。

### Node built-ins only（零依赖硬约束）
**Source:** `build.mjs` L20-26 imports；package.json 无 devDependencies/lockfile。
**Apply to:** 全部新 `.mjs`。CLI args → `node:util` `parseArgs`；YAML 断言 → 字符串/正则（不引 yaml 包）；semver → 宿主探针或纯字符串断言（Pattern 1，永不自建）。

### `node --test tests/*.test.mjs` glob 形态
**Source:** package.json L45-46 现契约 + BUILD.md L110（Node 24.21.0 目录参数机械失败，01-02 偏差 2）。
**Apply to:** 三个新测试套件 + CI 完整测试步。**禁** `node --test tests/`。

### root 解析 + env trim + 单出口
**Source:** `build.mjs` L28（`resolve(dirname(fileURLToPath(import.meta.url)))`）、L38（`env()` trim 空串=未设置）、L32-35（`finish()`）。
**Apply to:** `check-pins.mjs`、`compat-probe.mjs`。

### 子进程 env 白名单构造 + 网络前置 skip 语义
**Source:** `tests/build-smoke.test.mjs` L24-29（`buildEnv()` delete 三档离线 env 再注入）；L36-44（`canBuild` 暖缓存/registry 探测 → `t.skip`）。
**Apply to:** 任何 spawn build/probe 的测试；docs/compat tests 若触发 registry 取样需同款 skip 语义（WR-02 回退），离线机不得假红。

### 文档双语 + 编号章节 + 逐项留痕
**Source:** `README.md` L38-42/L95-99（双语镜像段）；`BUILD.md` §①-⑧ 编号 + EN 列 + TL;DR + 实证命令块。
**Apply to:** BUILD.md 新章、README 版本表。所有文档一律 exact spec（Pitfall 5）。

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.github/workflows/compat-matrix.yml` | config（CI 编排） | batch（matrix 并行） | Repo 无任何 `.github/`（`git ls-files -- .github/` = 空）。用 RESEARCH Code Example [2] 骨架 + Standard Stack 已核实 actions 版本；本地以 actionlint 或人工 Review + compat-matrix.test.mjs 校验 |
| （疑似）`compat-probe.mjs` 的宿主模块解析 | utility | subprocess eval | repo 无「从 CI 瞬时 node_modules 引第三方包」先例（build.mjs 只 spawn 自家产物）；方案 = `createRequire` 多候选路径，见上文 ⚠ |

## Metadata

**Analog search scope:** repo `git ls-files` 全集（tracked 源）；`.gitignore` 与 `git check-ignore` 实测（scripts/ 冲突定案依据）；phase 1 产物（01-PATTERNS.md 结构性先例）。
**Files scanned:** build.mjs (355 L), tests/run-gates.sh (101), tests/build-smoke.test.mjs (174), tests/rewrite-map.test.mjs (92), BUILD.md (166), README.md (113), THIRD-PARTY-NOTICES.md (16), package.json (48), 01-PATTERNS.md (195), 01-01-PLAN.md (249)；CONTEXT.md + RESEARCH.md 已按 required_reading 全读。
**Tracked-source gate:** all named analogs `git ls-files`-verified；`scripts/`/`config/`/`hooks/`/`skills/`/`gsd-core/`/`.gsd-build-tmp/` 为 gitignored 产物树，未作 analog。
**Pattern extraction date:** 2026-11-11
