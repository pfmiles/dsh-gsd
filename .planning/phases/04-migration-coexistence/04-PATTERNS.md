# Phase 4: 迁移与并存 - Pattern Map

**Mapped:** 2026-11-13
**Files analyzed:** 6（3 新增 / 1 修改 / 2 条件式〔可选断言 + 其连带的单行改动〕）
**Analogs found:** 6 / 6（1 exact · 2 role-match · 3 self carry-forward）
**Phase 性质声明：** 这是**文档 + 一次性演练** phase，不是功能 phase。不存在 controller / service / model 分层——本文件刻意**不套用**应用代码分类法，改按 `doc（用户面双语）` / `doc（备料，非代码提交物）` / `test（文档一致性断言）` / `evidence（演练留证）` 四类角色映射。凡「无 analog」的项，直说无 analog 并给外部形态来源（D-09 的粘贴片段就是这一类）。

> **Tracked-source gate：** 下表所有 named analog 均经 `git ls-files -- <path>` 非空核实为 git-TRACKED 源。`.gitignore` 覆盖的构建产物树（`skills/` `gsd-core/` `hooks/` `config/` `scripts/`）与 `.gsd-build-tmp/` `.build-cache/` `node_modules/` 一律**不得**作 analog。实测 tracked：`docs/dshmarket/{README.md,pfmiles__dsh-gsd.yml}`（`docs/` 下仅此 2 个文件）、`tests/docs-consistency.test.mjs`、`tests/pack-contents.test.mjs`、`BUILD.md`、`CHANGELOG.md`、`THIRD-PARTY-NOTICES.md`、`.planning/phases/01-build-mjs/verify-evidence.md`。
> ⚠ 两个**看起来像 analog 但不能引用**的东西：① `skills/gsd-health/SKILL.md`（3587 B，构建产物、gitignored）；② `grep -l 'GSD-DSH-bridge BEGIN'` 之类的真机探测（不是源）。`../install-gsd-dsh/`（旧仓）在 `dsh-gsd` 仓**之外**，只能作**外部事实源**引用，不能当仓内 analog。

---

## ⛔ Planner-Must-Resolve（任何 plan 动笔前逐条裁决）

### ⛔-A README 插入点：只有**一种**形态能同时过 8 处既有约束

双语切片点是**机器算的**，不是人约定的。`tests/docs-consistency.test.mjs:29-33`（逐字）：

```js
// README 双语两半：zh 段在前，en 段从第二个 '# dsh-gsd' 标题起。
const firstTitle = readme.indexOf('# dsh-gsd')
const enStart = readme.indexOf('# dsh-gsd', firstTitle + 1)
const readmeZh = readme.slice(0, enStart)
const readmeEn = readme.slice(enStart)
```

**实测切片现状**（本会话逐字符计算）：`# dsh-gsd` 全文**恰出现 2 次**——offset 229（L6）、offset 2641（L79），第三次出现 = `-1`。⇒ `readmeZh` = chars `[0, 2641)` = **L1–L78**（含 L77 的 `---` 与 L78 空行）；`readmeEn` = chars `[2641, 6428]` = **L79–L148**。

新增入口会同时经过这 8 处约束，逐条给出**会红成什么样**：

| # | 断言 | 位置 | 新增入口触发红的条件 | 实测边界值 |
|---|---|---|---|---|
| ① | Node ≥ 24 双语存在 | `:41-45` | 不触发（不可能删掉 `Node ≥ 24`） | zh `true` / en `true` |
| ② | 窗口串 ≥2 次（双语各 1） | `:47-56` | 不触发；但**不要**把 `>=0.2.2-rc.1 <0.3.0-0` 写进新行（会变 3 次，断言仍绿 → 反而是「断言作用域被悄悄改掉」的前兆） | zh 1 / en 1（**恰好卡在阈值 2 上**） |
| ③ | 全部 `dsh-gsd@(\S+)` 可被 `parseVersion` 拆解 | `:58-69` | 新行出现 `dsh-gsd@<非版本>`（如 `dsh-gsd@1.20`、`dsh-gsd@{ver}`） | 现 8 处命中（README 6 + BUILD 2）全合法 |
| ⑤ | `dsh-gsd@` 后必须数字开头；`dsh-gsd@latest` 零出现 | `:86-100` | 新行写 `dsh-gsd@latest` | 现在 0 处 |
| ⑦ | `allow-version` 双语存在 | `:107-110` | 不触发 | zh/en 各 ≥1 |
| **⑨** | **shields.io 徽章恰 2 枚且全在首个 `# dsh-gsd` 之前** | `:127-169` | **新行加第三枚徽章 / 把入口写成带 badge 的行** | 现 2 枚（L3/L4），`headingIdx`=L6 |
| **⑫** | **裸名 install 整行全文恰 2 行、zh/en 各 1 行、逐字节相等** | `:264-305` | **入口里出现独占一行的 `dsh plugin --profile web add dsh-gsd`**（哪怕在 fenced block 里） | zh 1 / en 1，byte-equal |
| **切片点** | `indexOf('# dsh-gsd')` 两次 | `:29-33` | **新行含字面量 `# dsh-gsd`**（含 `[x](# dsh-gsd)` 这种带空格锚点） | 全文恰 2 次 |

⇒ **唯一安全形态：一行 blockquote 链接，纯相对路径，不含 `# dsh-gsd`、不含 `dsh-gsd@`、不含徽章、不含独行 install 命令。**

推荐插入位置（**章节锚点，不写死行号**）：

| 半区 | 锚点 | 当前位置（仅作证据） |
|---|---|---|
| zh | 紧跟 intro 段之后、`## 为什么用 dsh-gsd` 之前 | 在 L10 之后 / L12 之前 |
| en | 紧跟 intro 段之后、`## Why dsh-gsd` 之前 | 在 L83 之后 / L85 之前 |

推荐文本（zh 以 `。` 收尾、en 以 `.` 收尾，与 README 相邻段落标点一致；链接目标用仓内既有的 `./` 相对路径体例，见 `README.md:71` 的 `[BUILD.md](./BUILD.md)`）：

```markdown
> 已经用脚本装过？迁移到插件见 [docs/MIGRATION.md](./docs/MIGRATION.md)（含回退路径与排障）。
```

```markdown
> Installed with the shell script before? See [docs/MIGRATION.md](./docs/MIGRATION.md) to migrate (rollback and troubleshooting included).
```

**为什么不选其它位置**（各有一条实测理由）：

- **放 L2–L5（徽章区）**：⑨ 要求徽章**恰 2 枚**且都在首个 `# dsh-gsd` 之前；把入口挤进徽章区容易被后来者顺手加第三枚徽章。
- **放 `## 快速开始` 内 L32 之后**：语义上更贴（那一段就是「其它安装形态」，L32 的 `> 也可以从 GitHub 仓库安装：\`dsh plugin …\`` 是同一类）。但它在 L32 之后、L34 `## 卸载 / 升级` 之前——英文对应位是 L105 之后、L107 之前。**也安全**，只是「顶部」程度弱于推荐位。选它必须在 plan 里写明并保持中英同位。
- **新增一个 `## 从脚本迁移` 章节**：章节集从 8 变 9。功能上不破坏任何断言（没有测试数 `##` 数量），但与 D-10「`README.md` 顶部只加**一行**入口」直接冲突 ⇒ **不用**。

**另外一条硬纪律**：如果入口里需要**提到**命令，只能写成行内代码（`README.md:32` / `:105` 的现有体例：`> 也可以从 GitHub 仓库安装：\`dsh plugin --profile web add github:pfmiles/dsh-gsd\``），**绝不**让它独占一行。

### ⛔-B `docs/` 已在仓内，但**不许**为了「npm 用户也能看」把它加进 `files`

`package.json:37-47`（逐字，9 项）：

```json
  "files": [
    "index.js",
    "cordis.patch.yml",
    "locale",
    "icon.svg",
    "skills",
    "gsd-core",
    "hooks",
    "config",
    "scripts"
  ],
```

`tests/pack-contents.test.mjs:46-52`（逐字）：

```js
// 允许出现在安装包顶层的条目 = package.json `files` + npm 无条件收录的
// package.json / README* / LICENSE* / main 指向文件。
const ALLOWED_TOP_LEVEL = new Set([
  'package.json', 'README.md', 'LICENSE',
  'index.js', 'cordis.patch.yml', 'icon.svg', 'locale',
  'skills', 'gsd-core', 'hooks', 'config', 'scripts',
])
```

② 断言（`:172-175`）要求「包顶层的每个条目都在 `ALLOWED_TOP_LEVEL` 里」，红文案逐字：

```js
  const tops = [...new Set(files.map((p) => p.split('/')[0]))].sort()
  const unexpected = tops.filter((t) => !ALLOWED_TOP_LEVEL.has(t))
  assert.deepEqual(unexpected, [],
    `安装包会出现未登记顶层条目: ${unexpected.join(', ')}；如属有意新增，请同步更新 package.json 的 files 与本测试的 ALLOWED_TOP_LEVEL`)
```

⇒ 加 `docs` 到 `files` 会让 ② 变红（`未登记顶层条目: docs`），必须同时改 `ALLOWED_TOP_LEVEL`——而那是**有意识的发布面变更**，本 phase 无此授权（D-06 + `04-CONTEXT.md:169`「不得默认顺手加」）。

**关键补充（聊胜于无的定心丸）：本仓已经存在「README 链接到不进包文档」的先例，所以不加 `files` 不是妥协。** `BUILD.md` 被 `tests/pack-contents.test.mjs:64-67` 显式列为 `FORBIDDEN_FILES`（即**明令不许进包**），而 `README.md:71` 与 `:144` 都在链它。⇒ `docs/MIGRATION.md` 与 `BUILD.md` 属**同一类**：只活在 GitHub 的读者向文档。**无需新增裁决。**

**另一条零成本的实测结论**：`docs/` 不是新顶层目录（`git ls-files docs/` 已返回 2 个文件），且 `docs/MIGRATION.md` **不会**被 `tests/pack-contents.test.mjs` 的 `simulatePack()` 收录（该函数只从 `files` + npm 无条件收录项展开，`:103-121`），也不在任何 `FORBIDDEN_PREFIXES` 里（`:60-63` 无 `docs/`）。⇒ **pack 面零 churn，零断言改动。**

### ⛔-C `BUILD.md:16` 是**唯一**活体计数：加 ⑭ ⇒ 37 变 38，同一提交改完

`BUILD.md:16`（逐字）：

```bash
# 每波可重跑测试（含真实构建 smoke）——预期 37/37（真实构建 smoke；兼容矩阵/版本/文档一致性等套件已并入）
```

**实测现状 37 = build-smoke 2 + compat-matrix 8 + docs-consistency 13 + pack-contents 4 + rewrite-map 7 + version 3**（本会话 `grep -c '^test('` 逐文件核过）。`docs-consistency` 目前恰 13 条（①–⑬，`:41`/`:47`/`:58`/`:71`/`:86`/`:102`/`:107`/`:115`/`:127`/`:171`/`:217`/`:264`/`:307`）。

⇒ **加 1 条 `test(` 就 +1，没有例外**。若采纳 ⑭，`BUILD.md:16` 必须写**实测输出**得到的 `38/38`，不要用算术推。`04-VALIDATION.md:44` 已预告「37/37；若追加 ⑭ 断言则 38/38」，与此一致。

**历史记录一律不改。** `01-VERIFICATION.md` / `02-VALIDATION.md` / `STATE.md` 里的旧数字是**已签名审计结论**，只能追加带日期的前向注记，不得改写正文（`03-PATTERNS.md:625-629` 已立此纪律，Phase 4 继承）。

### ⛔-D 旧仓 README 是**纯英文**：D-09 的「中英各一份」在目标仓**没有对偶落点**

实测（`node` 计 CJK 字符）：

```
old README CJK chars: 0   lines: 315   bytes: 23653
```

标题结构（`install-gsd-dsh/README.md`，全部 `##` 一级，**无 `---` 双语分隔**）：

```
1:# install-gsd-dsh
35:## Quick start
60:## Requirements
70:## What it installs
86:## Options and environment variables
119:## Upgrade, rollback and offline install
146:## Hooks bridge (on by default)
197:## How it works
222:## What works — and the honest limitations
255:## Verify the installation
265:## Uninstall
281:## Troubleshooting
300:## Compatibility
309:## License and credits
```

⇒ **MIG-03 的目标是一篇英文单语 README。** 所以 D-09 的「中英各一份」有两种可能读法，**planner 必须二选一并在 plan 里留痕**：

| 读法 | 落法 | 代价 |
|---|---|---|
| **A（推荐）** | 英文片段 = 可粘贴的正式件（唯一会被推的那个）；中文片段 = **备而不用**（Phase 5 若旧仓补中文 README 才用），在备料文件里显式标注「当前无落点」 | 中文片段永不进仓，但 D-09 的字面要求被完整满足，且不会误导执行者去改英文 README 为双语 |
| B | 把中英两份**一起**粘进旧仓英文 README | 让旧仓门面变成双语——**未经旧仓 owner 同意即改变其文档语言形态**，且 D-09 只说「片段」，未授权改结构 |

⚠ **不要**把 `../INSTALL-GSD-DSH-README.md`（16573 B，中文，`## 1. 它装了什么` … `## 10. 许可与来源说明`）当成中文片段的目标位——`04-CONTEXT.md:133` 明确它是**另一篇、不在任何仓内**、不是 MIG-03 对象。

### ⛔-E `/gsd-health` **不是**迁移复验判据（`04-CONTEXT.md` 的「可复用资产」判断需订正）

`04-CONTEXT.md:156` 写「**`/gsd-health` skill**：装后自检入口，runbook 的「复验」一步应当复用它，而不是另发明一套检查」。`skills/gsd-health/SKILL.md:44-45`（构建产物、gitignored，此处仅作事实引用）逐字：

```
<objective>
Validate `.planning/` directory integrity and report actionable issues. Checks for missing files, invalid configurations, inconsistent state, and orphaned plans.
```

⇒ 它校验的是 **`.planning/` 目录完整性 + 上下文利用率**，**与「旧源是否已死」「技能正文是否来自包内」毫无关系**。它能证明的**唯一**与迁移相关的事：**技能目录已加载**（能触达即为 provider 生效）。这与 `verify-evidence.md:42` 的历史用法一致——那一轮的「通过」判据其实是它调用的 `runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`，即**引擎身份**，不是迁移面。

⇒ runbook 的「复验」段**必须**用 D-05/D-07 的 shell 判据块（RESEARCH `## Runtime State Inventory` A–D + `## Code Examples` 复验 C），`/gsd-health` 只能作为**可选的「catalog 真加载了」软信号**，并写明它证不了什么。
⇒ 若 planner 想用引擎身份作补充证据，**直接调绝对路径**（T-4-03），不要经 PATH 的 `gsd_run`：`node "$PKG/gsd-core/bin/gsd-tools.cjs" runtime-identity --raw`。

### ⛔-F `docs/` 在 gate B 扫描面**之外**：机器路径禁令没有兜底

`tests/run-gates.sh:45`（逐字）：

```bash
TREES="skills gsd-core hooks scripts"
```

gate B 的三段（staging-root 残留 / `$HOME` 前缀 / `skills/` 的 `/(Users|home)/<name>/` 正则）**全部只扫这 4 棵树**。`docs/` 不在其中，包内也无 `docs/` ⇒ **`docs/MIGRATION.md` 里写 `/Users/yue.weny/...` 不会有任何门禁报警**（T-4-05 的实质）。

⇒ 纪律只能靠 plan 写死，不能靠 CI 兜底：

| 禁令 | 理由 |
|---|---|
| 正文命令一律 `"$DSH_HOME"` / `"$PWD/…"` / `<profile>` / `<GSDROOT>` 占位，**零** `/Users/…` | gate B 不扫 docs/，一旦写死就永久漂移（T-4-05） |
| 凡是「本机实测值」必须集中在一张标注了「示例 / 本机 2026-11-13」的表里 | 与 `04-RESEARCH.md` 的 provenance 约定同源 |
| 不得出现 `~/.dsh` 的**硬编码绝对**形式（`~/.dsh/...` 可，`/Users/x/.dsh/...` 不可） | INST-02 的零字面量纪律（`tests/build-smoke.test.mjs` 已机器化到产物侧） |

### ⛔-G D-05 的「内容比对」判别器要**跨平台**：`shasum` 在 Linux 不保证存在

RESEARCH 用 `shasum -a 256`（`## Runtime State Inventory`、`### 复验 C`），`### Security Domain` V6 也写「仅用 `shasum -a 256` 做内容比对」。但 `README.md:59` / `:132` 声明支持 **macOS / Linux / WSL** —— `shasum` 是 Perl 脚本（macOS 自带，**Linux 不保证**），`sha256sum` 反之亦然（本机实测 `/usr/bin/shasum` 与 `/sbin/sha256sum` **都在**，是特例，不能当通例）。

⇒ runbook 的抽检判别器**优先用 RESEARCH 已实测的字节数**（它对两个同名异源技能有现成实测值，且零外部依赖）：

| 技能 | 旧部署 | 插件包内 | 依据 |
|---|---|---|---|
| `gsd-health/SKILL.md` | 3084 B | **3587 B** | `04-RESEARCH.md` 实测 |
| `gsd-new-project/SKILL.md` | 3195 B | **3856 B** | 同上 |

哈希只作**可选加强项**，且必须写成兼容形态：`shasum -a 256 <f> 2>/dev/null || sha256sum <f>`（或统一走 `node -e` 的 `crypto.createHash`——与仓内零依赖纪律一致）。

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `docs/MIGRATION.md`（**新**） | doc（用户面双语） | 静态（人读 + 复制命令） | `README.md`（双语镜像骨架，**主 analog**）+ `BUILD.md`（章节/表格深度，**副 analog**） | role-match（strong：两种形态都在仓内） |
| `README.md`（改，中英各 1 行） | doc（门面） | 静态 | 自身 carry-forward + 哨兵 `tests/docs-consistency.test.mjs` | self (carry-forward) |
| `docs/<备料>/…`（**新**，D-09） | doc/data（可粘贴提交物，非代码） | 静态（Phase 5 人工复制） | `docs/dshmarket/`（**目录形态唯一先例**）+ `CHANGELOG.md`/`THIRD-PARTY-NOTICES.md`（短 md 体例） | role-match |
| `tests/docs-consistency.test.mjs`（改，**可选** ⑭） | test（文档一致性） | file-I/O（同步读文本） | 自身 ①–⑬（carry-forward） | self (carry-forward) |
| `BUILD.md`（改，**仅 L16 且仅当加 ⑭**） | doc（构建者面） | 静态 | 自身 TL;DR 命令块 `:9-24` | self (carry-forward) |
| `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`（**新**） | evidence（演练留证） | file-I/O（人填表） | `.planning/phases/01-build-mjs/verify-evidence.md`（78 行） | **exact**（同 role、同 data-flow、同目录层级） |

**显式不在本 phase 文件清单（勿「顺手补齐」）：**

- `package.json` 的 `files` —— ⛔-B 已证会红；`private` / `version` 由 `docs-consistency` ⑥ `:102-105` 钉死，属 Phase 5。
- `skills/` `gsd-core/` `hooks/` `config/` `scripts/` —— 构建产物（gitignored，`build.mjs` 从上游 tarball 重建）。D-06 已拒「改 `/gsd-health` 加检查」；同理不新增 `scripts/gsd-migrate-check.mjs`。
- `cordis.patch.yml` / `index.js` / `build/` / `.github/workflows/compat-matrix.yml` —— 本 phase 零改动。
- `CHANGELOG.md` —— 本 phase 无发布。**技术上安全**（⑧ 的正则 `/^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/m` 不匹配 `## [Unreleased]`，`docs-consistency.test.mjs:117`），但 D-10 的文档清单里没有它 ⇒ 默认不动。
- `LICENSE` / `THIRD-PARTY-NOTICES.md` —— 无新增第三方内容（演练装的三个包只在 `/tmp`，且 D-02 期满即删）。
- `.gitignore` —— `docs/` 不被忽略，无需改。

## Pattern Assignments

---

### `docs/MIGRATION.md`（doc, 用户面双语）— NEW

**主 Analog：`README.md`** —— 仓内**唯一**「中文整段在前 → 独占一行的 `---` → 英文整段在后」的文档，且两半的**章节集逐一对应**。**副 Analog：`BUILD.md`** —— 仓内唯一「H1 = 文件名 + 一句话职责 → 一段加粗总纲 → 编号章节 + 表格 + 命令块」的深文档（205 行）。

#### A. 双语骨架：三处必须逐字照抄的机械特征

**特征 1 —— 分隔符是一行只有三个连字符的 `---`，前后各一个空行。** `README.md:75-79`（逐字）：

```
MIT，见 [LICENSE](./LICENSE)。含上游内容：GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。

---

# dsh-gsd
```

**特征 2 —— 两半各是完整独立文档**（各自有 H1、各自有 8 个 `##` 章节、各自能单独读通），不是「中文正文 + 英文摘要」。实测两半章节集：

```
zh（L1-78，8 个 ##）：为什么用 dsh-gsd ‖ 快速开始 ‖ 卸载 / 升级 ‖ 版本号方案 ‖ 环境要求 ‖ 当前状态 ‖ 自举构建（顺带一提） ‖ License
en（L79-148，8 个 ##）：Why dsh-gsd   ‖ Quick Start ‖ Uninstall / Upgrade ‖ Version scheme ‖ Requirements ‖ Status ‖ Bootstrapped (a fun aside) ‖ License
```

⇒ **中文半区用中文标题、英文半区用英文标题**（不是「同一标题两种语言各写一遍」）。README 的 H1 两半相同（`# dsh-gsd`）纯属**产品名相同**的巧合；`MIGRATION.md` 的 H1 应**翻译**（下面的推荐骨架即如此）。

**特征 3 —— README 里 `###` 数量为 0**（实测 `grep -c '^###' README.md` = 0），全部是 `##` 平铺。⇒ 这条**不**适用于 `MIGRATION.md`：runbook 需要子步骤，应当用 `###`。但**`##` 层级必须恰 3 个**（D-10 的三节），子步骤下沉到 `###`。

#### B. 推荐骨架（含 D-10/D-11/D-12 三节与判定点）

```markdown
# dsh-gsd 迁移指南 — 从脚本部署到插件

**给已经用 `install-gsd-dsh.sh` 装过 GSD 的人：怎么无痛换到插件方式，两种方式差在哪，DSH 升级出错时怎么排。**
<!-- 上面这行是 BUILD.md:3 的体例（一段加粗总纲），不是新发明 -->

本文件**不随 npm 包发布**（`package.json` 的 `files` 九项无 `docs/`）；它是 GitHub 读者向文档，
与 [BUILD.md](./BUILD.md) 同类。构建与发布链见 BUILD.md，日常安装见 [README.md](./README.md)。

> ⚠ 本页所有命令都在临时 `DSH_HOME` 里执行。**不要**在真实 `~/.dsh` 上跑 `--uninstall` —— 它不认 profile，
> 会一次波及该 home 下的每一个 profile。

## ① 迁移 runbook

### 步骤 0 — 隔离演练场（每条命令块的第一行都是它）
### 步骤 1 — 硬门：先裁决每个 profile 的去向（D-03，不通过就中止）
### 步骤 2 — 卸旧部署
### 步骤 3 — 卸全局 CLI
### 步骤 4 — 装插件
### 步骤 5 — 复验：阴性对照 + 内容比对（两条同时成立）
### 回退（旧脚本 `.stripped-bak` / 插件一条 remove）

## ② 两种方式的三轴差异

### 什么情况选哪个

### 对照表

### 共同限制（两种方式都受此限）

## ③ DSH 升级 / 版本错配：症状 → 原因 → 修复

---

# dsh-gsd Migration Guide — from shell script to plugin

**For anyone who already installed GSD with `install-gsd-dsh.sh`: how to move to the plugin…**

（同样 3 个 `##` 章节，逐节对应）
```

**为什么 `##` 必须恰 3 个**：D-10 逐字「一篇承载三节：① 迁移 runbook ② 三轴差异表 ③ DSH 升级的症状与修复」。下文 `tests/docs-consistency.test.mjs` 段的 ⑭ 会把「两半各 3 个 `##`」写成可 grep 判据——`01`/`03` 两轮都栽在「只写一半」（`04-VALIDATION.md:78`），机器计数是唯一的防再犯手段。

#### C. 三轴的表格体例（D-12 锁死表头，不要加列）

D-12 逐字：「表头：`轴 | 旧脚本 | 插件 | 迁移影响`，三行对应 MIG-02 点名的三轴」。仓内表格体例参照（`README.md:49-53`，CJK 表头 + `| ---- |` 分隔行 + 末列放 EN）：

```markdown
| 字段 | 含义 | 示例（`1.20.1-1.dsh022`） | EN |
| ---- | ---- | -------------------------- | -- |
```

⇒ 中文半区：

```markdown
| 轴 | 旧脚本 | 插件 | 迁移影响 |
| ---- | ---- | ---- | ---- |
| 全局 CLI | `npm i -g @opengsd/gsd-core` 提供 PATH 上的 `gsd_run`（本机实测解析到 1.16.0） | 包内引擎 `gsd-core/bin/gsd-tools.cjs`（1.20.1），skills adapter 写绝对路径、**不碰 PATH** | 卸掉全局 CLI **不损伤**插件态；留着它 = 留一个落后 5 个小版本的坑 |
| `GSD_PROFILE` 档位 | `core` / `standard` / `full` 透传给上游安装器 | **无对应物**：恒定携带全部 72 个 skills | 从 `core`/`standard` 迁来会**多得**技能，不是缩水（精简档属 Backlog） |
| hooks 归属 | 机器级绝对 `configPath`（`~/.dsh/gsd-hooks.dsh.json`）+ `pluginRoot=~/.dsh` | 包内自定位（`!!js createRequire(baseUrl)` → `<包>/config/gsd-hooks.json`） | **不是事件差异**（两侧同为 5 事件 / 14 matcher，双向差集为空），差异只在归属 |
```

**三条写表纪律：**

1. **「共同限制」绝不能做成第 4 行**（D-12 逐字：「不写成差异，否则读者会误以为换到插件能获得更多事件」）。单列一个 `###` 小节，内容 = DSH 只支持 `SessionStart` / `PreToolUse` / `PostToolUse` / `SubagentStop` / `Stop` 五类事件，**两种方式都受此限**。实测支撑：`config/gsd-hooks.json` 的 `hooks` 对象恰这五键，matcher 数 `1/7/4/1/1` = 14（本会话 `node -e` 核过）。
2. **「选型建议」段在表前**（D-12 逐字「表前一段」）。
3. **迁移影响列的措辞方向必须是「多得」而非「少得」**（`04-CONTEXT.md:216` 点名：写成「功能缩水」会被读错）。

#### D. 命令块纪律（逐条对应一个威胁，写进 plan 的 action 里）

| 纪律 | 形态 | 对冲的威胁 |
|---|---|---|
| 每条独立可粘贴块的**第一行**都是 `export DSH_HOME="$(mktemp -d /tmp/dsh-mig-XXXXXX)"` + 一句 `echo "DSH_HOME=$DSH_HOME"` | 见 RESEARCH `## Code Examples` 骨架 `# 0)` 段 | T-4-01（误伤真实 home） |
| 演练额外声明 `export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"` 并回显 `npm config get prefix` | 同上 | T-4-02（覆写真实全局 CLI） |
| 引擎调用**一律绝对路径**：`node "$PKG/gsd-core/bin/gsd-tools.cjs" …`；`command -v gsd_run` 的输出只作**残留证据**，不作「可用」证据 | T-4-03 的门面句 | T-4-03（PATH 串味） |
| 探测命令一律 `2>/dev/null` 或 `|| true` | 实测：不存在的 profile 名会**抛栈**（非单行提示） | 可读性 |
| 演练日志里显式断言「**没有**出现 `allow-version` / `Exact-version exemption: active`」 | 一句 `grep -c` + 期望 0 | T-4-04（用豁免掩盖不兼容） |
| 每个「通过」判据后面跟一句「为什么 exit code 不算数」 | `--uninstall` 恒 `exit 0`（源码 `:308`）；load 层错配也 `exit 0`（RESEARCH Pattern 4 ③） | 假绿 |

#### E. 第 ③ 节的症状表必须**来自实测**（D-13）

三行分别对应 RESEARCH Pattern 4 的三层门，**逐字引文**是硬要求（「症状表的每一格都要能对上宿主输出」）：

| 层 | 症状（逐字） | 原因 | 修复 |
|---|---|---|---|
| ① preflight（registry / 目录 spec） | `dsh: installation rejected: …` + `dsh: nothing was installed.` | manifest `engines.dsh` 不满足 | 装匹配版本 |
| ② post-install（`.tgz` spec） | `dsh: installation rejected: …`（两次）+ `dsh: restored package.json, pnpm-lock.yaml, and node_modules.` | 同上，但先真装再回滚 | 同上；**注意 `node_modules` 留在盘上** |
| ③ load（bundle 级） | `dsh: skipping profile bundle "<name>": Error: …`（**stderr**） | 已装 bundle 加载时不满足 | 同上；**exit 仍是 0** |
| ③′ load（row 级） | `dsh: disabling profile plugin row "<id>": <reason>` | 合成了但行不可用 | 同上；**不写回任何文件** |

⚠ **`pins.json` 的 `lines.022.peer` 只喂 `check-pins` 步骤 (j)，产不出运行时症状**（`build/lib/check-pins.mjs:152-160` 是唯一消费方；`unmetRequirements` 在 `engines.dsh` 在场时直接 return）。⇒ 演练注入点必须在**已装包的 `engines.dsh`** 或 **bridge 包版本**上（`04-CONTEXT.md:106` 的 plan-phase 期订正 + `04-RESEARCH.md` Pattern 4 两个注入点表）。这条**必须在 plan 里写明**，否则执行者会做一次假的「错配演练」。

#### F. 反模式（写成什么就错了）

- ❌ 写「跑通了就是好了」「`--dump-config` exit 0 即通过」——第 ③ 层错配 `exit 0`（实测）。
- ❌ 写「卸载后用 `ls ~/.dsh/skills | wc -l` 确认 72 个技能」——数磁盘文件 ≠ 观测宿主消费，正是 Phase 3 CR-01 的掩盖机制。
- ❌ 把 `GSD_PROFILE=core` 写成「新版也支持，等价物在计划中」——插件侧**无对应物**。
- ❌ 声称旧脚本 `--uninstall` 会清全局 npm / `~/.gsd` / 机器级 `$DSH_HOME/cordis.patch.yml`——三者**都不清**（源码实测）。
- ❌ 把 `/gsd-health` 写成复验判据（⛔-E）。

---

### `README.md`（doc）— MODIFIED（中英各 1 行）

**Analog:** 自身 carry-forward。**哨兵** = `tests/docs-consistency.test.mjs`（13 条全绿是现状基线，本 phase 只允许「加 2 行后仍 13/13」这一种结果）。

**现状头部（`README.md:1-11`，逐字）——插入点的坐标系：**

```markdown
<!-- generated-by: gsd-doc-writer -->

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.1-blue)](https://github.com/pfmiles/dsh-gsd#requirements)

# dsh-gsd

**给 DeepSeek Harness 一条命令装上 GSD。**

dsh-gsd 把 GSD——规格驱动的 AI 编码工作流（72 个 skills + 引擎 + 守卫 hooks）——打包成 DeepSeek Harness（DSH）的原生插件。装好之后，你的会话直接拥有完整的 GSD 工作流能力。
```

**唯一改动**：在 `README.md:10` 之后、`:12` 的 `## 为什么用 dsh-gsd` 之前插一行；英文半区在 `:83` 之后、`:85` 的 `## Why dsh-gsd` 之前插一行。文本见 ⛔-A。

**改动后必跑（秒级）**：

```bash
node --test tests/docs-consistency.test.mjs   # 期望 13/13（未加 ⑭）或 14/14（加了 ⑭）
```

**不要碰的地方**：`README.md:22` / `:27` / `:95` / `:100`（⑫ 的 4 条 install 行，其中 `:27`/`:100` 是裸名、⑫ 要求恰 2 行 byte-equal）、`:57`/`:130` 的窗口串（② 恰好卡在 2 次）、`:3-4` 的两枚徽章（⑨ 要求恰 2 枚）。`README.md:65`/`:138` 的「当前状态」段属 Phase 3 已改过的语义文案，本 phase 不再动。

---

### `docs/<备料目录>/…`（doc/data, 可粘贴提交物）— NEW（D-09）

**Analog：`docs/dshmarket/`** —— 仓内**唯一**「备料进 `docs/`、推送留到 Phase 5」的先例。现状（`ls -la` 实测，2 个文件）：

```
docs/dshmarket/
├── README.md                     (1947 B, 32 行)  ← 备料说明：目标/路径/时点 + 逐字命令 + 可证事实 + 论证
└── pfmiles__dsh-gsd.yml          (402 B, 6 行)    ← 提交物本体（Phase 5 直接复制到目标仓 data/plugins/）
```

它成立的三个设计要点，Phase 4 的备料应原样继承：

1. **说明与资产分离**：`README.md` 讲「往哪放、何时放、为什么这么写」，资产文件本身**不含任何说明性文字**（`pfmiles__dsh-gsd.yml` 只有 5 个 schema 字段）。
2. **首行即声明「不随 npm 包发布」**（`docs/dshmarket/README.md:3` 逐字）：

   ```markdown
   本目录是 Phase 3 产出的提交资产，**不随 npm 包发布**（`docs/` 不在 `package.json` 的 `files` 里，npm 也不会无条件收录它），因此 pack 面零 churn。
   ```

3. **时点写死在标题里**（`:1` `# dshmarket 提交材料（Phase 5 提交）`）。

**推荐形态（目录，4 文件）**：

```
docs/oldrepo-link/
├── README.md            ← 备料说明（目标仓 / 基准 sha 41fcc7a / 插入锚点 / 时点=P5 / 为何本 phase 不推）
├── snippet.en.md        ← 英文粘贴片段裸正文（可直接整段复制，无围栏）
├── snippet.zh.md        ← 中文粘贴片段裸正文（**当前无落点，见 ⛔-D**；文件头用 HTML 注释标注）
└── pr.md                ← `title: …` 一行 + `---` + body markdown
```

**备选形态（单文件 `docs/MIGRATION-OLDREPO.md`）**：把四段装进一个 md 的四个 `##` 小节。**取舍点**：D-10 逐字「本仓文档已有 README、BUILD.md、CHANGELOG、THIRD-PARTY-NOTICES、PLAN.md、SPIKE.md，再加两篇属文档膨胀」——若 planner 认为该裁决覆盖备料，选单文件；若认为它只约束**用户面**文档，选 4 文件（与 dshmarket 同构）。**必须二选一并在 plan 留痕**，不得默认。

**内容契约（每个文件必须承载什么）**：

| 文件 | 必含 |
|---|---|
| `README.md` | ① 目标仓 `pfmiles/install-gsd-dsh` + remote `git@github.com:pfmiles/install-gsd-dsh.git`；② 基准 sha `41fcc7a`（**标注为「观测时的 HEAD，不是 patch 基准」**，A6）；③ 插入位置用**章节锚点**：「`## Quick start` 之前」（`[VERIFIED: install-gsd-dsh/README.md:35]`；其上是 `:33` 的 `---`）；④ 「本 phase 只备料，提交/推送属 Phase 5（D-08 承 03-D-02）」；⑤ 本机 SSH 不可用、推它须另走 `gh` 凭据路径（`PROJECT.md` §Prior Art） |
| `snippet.en.md` | 一段 `> ` blockquote，链回新仓 README/安装命令，**不含版本号硬编码**（旧仓一变动就过期） |
| `snippet.zh.md` | 同义中文；首行 HTML 注释注明「旧仓 README 为纯英文，本片段当前无落点（⛔-D）」 |
| `pr.md` | `title: docs: point install-gsd-dsh readers at the dsh-gsd plugin` + body（改了什么 / 为什么 / 回链 / 不改变现有行为） |

**为什么用「章节锚点」而非行号（A6，逐字理由）**：`04-RESEARCH.md` A6「旧仓 `install-gsd-dsh.sh` 在本 phase 期间不变（基准 `41fcc7a`）…若旧仓更新，`--uninstall` 的行为与行号引用会漂移；备料（D-09）用章节锚点而非行号正是为此」。D-09 也逐字拒绝「真 `git patch`」（旧仓一变动就冲突，且要维护基准 sha）。

**不推送的取证（本会话只读复验）**：`git -C ../install-gsd-dsh log --oneline -1` → `41fcc7a`；`git status --porcelain` → 空（工作树干净）；`git remote -v` → `origin git@github.com:pfmiles/install-gsd-dsh.git`。⇒ 本 phase 结束后这三个值**必须仍然一字不变**，可写成 phase 的一条 verify。

---

### `tests/docs-consistency.test.mjs`（test, file-I/O static）— MODIFIED（**可选**，Discretion 第 5 条）

**Analog:** 自身 ①–⑬（carry-forward）。**照搬现制四件套**（`:12-27`）：

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
```

**加 ⑭ 前必读的三条硬门（都在本文件内，改错就是「作用域被悄悄改掉」）**：

| 门 | 行 | 含义 | 对本 phase 的约束 |
|---|---|---|---|
| 切片点 | `:29-33` | zh/en 由 `indexOf('# dsh-gsd')` 的**前两次**出现切分 | 新断言**必须复用 `readmeZh` / `readmeEn`**，不得另算切片 |
| ⑫ 双语计数 | `:264-305` | 裸名 install 整行 zh 1 / en 1 / byte-equal | 新断言的**任何** message 或 fixture 里都别写出那整行 |
| ⑨ 徽章 | `:127-141` | 恰 2 枚 shields.io，全在首个 `# dsh-gsd` 之前 | 别把徽章断言改成 `>=2` |

**推荐 ⑭（一条 `test(`，一次加完再跑）**：

```js
// ─────────────────────────────────────────────────────────────────────────────
// ⑭（Phase 4）：MIGRATION 双语入口 + 迁移文档双语同构守卫（D-08 / D-10 / D-11）。
// 为什么是「两半各一次」而不是「全文 ≥1 次」：切分点由 :29-33 决定，只在 zh 半加
// 链接 = 英文访客无入口；⑫ 已用同一理由否决过「总数 2 会被同一半重复蒙过」。
// ─────────────────────────────────────────────────────────────────────────────
const MIGRATION_DOC = 'docs/MIGRATION.md'

test('⑭ MIGRATION 入口双语存在 + 文档两半各恰 3 个二级标题（D-08/D-10/D-11）', () => {
  // 1) README 入口：两半各一（切片复用 :29-33 的 readmeZh / readmeEn）
  for (const [name, half] of [['zh', readmeZh], ['en', readmeEn]]) {
    assert.ok(half.includes(MIGRATION_DOC), `README ${name} 段缺 ${MIGRATION_DOC} 入口`)
  }

  // 2) 文档本体：恰 2 个一级标题 → 以第二个 `# ` 为界切两半（比按 `---` 切更稳：
  //    代码块里的 YAML 文档分隔符、setext 下划线都是独占一行的 `---`）
  const doc = read(MIGRATION_DOC)
  const h1s = [...doc.matchAll(/^# .+$/gm)]
  assert.equal(h1s.length, 2, `docs/MIGRATION.md 应恰有 2 个一级标题（zh/en 各一），实际 ${h1s.length}`)
  const halves = { zh: doc.slice(0, h1s[1].index), en: doc.slice(h1s[1].index) }

  // 3) 视觉分隔行仍在（D-11 的「中文在前 → --- → 英文在后」）
  assert.ok(doc.includes('\n---\n'), 'docs/MIGRATION.md 缺独占一行的 --- 双语分隔')

  // 4) 两半各恰 3 个 `## `（注意 `^## ` 不会匹配 `### `），对应 D-10 三节
  for (const [name, half] of Object.entries(halves)) {
    const heads = half.match(/^## /gm) ?? []
    assert.equal(
      heads.length, 3,
      `${name} 段应有 3 个二级标题（runbook / 差异表 / 症状与修复），实际 ${heads.length}`
        + '——01/03 两轮都栽在「只写一半」',
    )
  }

  // 5) 语言判别：防「把 zh 半复制到 en 半」式假双语
  assert.match(halves.zh, /[\u4e00-\u9fff]/, 'zh 段没有任何中文字符')
  assert.ok(!/[\u4e00-\u9fff]/.test(halves.en), 'en 段含中文字符——双语未真正分半')
})
```

**§5 的语言判别有一个已知例外**：`MIGRATION.md` 的英文半区若要引用 `dsh: skipping profile bundle "…"` 之类的**宿主原文**没问题（英文），但若要引用一句中文报错（旧脚本输出有中文吗？实测没有——旧脚本与 DSH 的输出全是英文）⇒ 该断言可安全保留。若日后英文半区确需中文引文，应改成「en 半的 CJK 字符数 < zh 半的 1/10」而不是硬零。

**计数影响**：+1 ⇒ 37 变 38 ⇒ `BUILD.md:16` 同步（⛔-C）。**若决定不加 ⑭**，`BUILD.md` 一字不动，但 plan 必须写明「不加的理由」并接受「README 入口日后可能被误删而无守卫」这一已知风险。

---

### `BUILD.md`（doc）— CONDITIONAL MODIFIED（**仅** L16，且仅当采纳 ⑭）

**Analog:** 自身 TL;DR 块（`:9-24`）。**逐字现状 `:16`**：

```bash
# 每波可重跑测试（含真实构建 smoke）——预期 37/37（真实构建 smoke；兼容矩阵/版本/文档一致性等套件已并入）
```

**目标**：数字改为**实测输出值**（38），其余措辞**逐字保留**。相邻行（`:17` 的 `npm test`、`:19` 的 `npm run prepack`）不动。

**不要碰**：`BUILD.md` 的 §①–⑨ 章节体制、`| 项 | 值 | EN |` 双语表列体例（`:33-37`）、§⑥ gates 契约、§⑦ canonical 表——它们是 Phase 01/02 的已验契约（`01-VERIFICATION.md` 的覆盖审计对象）。

---

### `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`（evidence）— NEW

**Analog（exact）：`.planning/phases/01-build-mjs/verify-evidence.md`**（78 行，tracked）。这是仓内**唯一**「一次性演练 → 可审计证据册」的先例，Phase 02 也复制过一份（`02-compat-matrix/verify-evidence.md`）。

**它的骨架（逐段抽取）**：

```markdown
# verify-evidence.md — Phase 01 DEV-03 验证实例复验证据

> 复验对象：…
> 验证实例：…
> 目标身份：…

## 复验序（对应 BUILD.md §验证实例复验）

1. …
2. …
5. 每项须留有可观察输出（…），禁止"大概/应该/目测"表述

## Task 1 — 自动化段（本次执行器实测）

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| … | … | **exit 0**；`…`（原文） |

**结论（Task 1 tracer 切片）**：…

## Task 2 — 交互段

> 前置复查（只读）：…

| 操作 | 时间 (UTC) | 输出要点 |
```

**Phase 4 版本的三条必须承载（否则 MIG-01/MIG-04/HOOK-05 无法在 verifier 面前举证）**：

1. **每行一个 `(操作, UTC 时间, 输出要点)` 三元组**，输出要点里贴**逐字文案**（`dsh: skipping profile bundle "…"` / `grep -c` 的数字）。
2. **负向证据必须显式标注「不得充当通过形态」**（`verify-evidence.md:43` 的先例：`⚠️ **未拦** … 该轮输出**不得充当通过形态**`）。
3. **每条 manual-only 判据后跟一句「这证不了什么」**——例如「静态 id 集合比对证明行级无冲突，**不能**证明同层合成」。

**它不在 `docs/` 下**：`.planning/` 是流程面、已 tracked、且 `pack-contents` 的 `FORBIDDEN_PREFIXES` 明令其不得进包（`:60-63`）。⇒ 这是「证据该放哪」的正确答案：**放 phase 目录，不放 `docs/`**。

---

## Shared Patterns

### 1. 双语镜像 = 一个独占行的 `---` + 两半各自完整 + 章节集同构
**Source:** `README.md`（L1-78 / L77 `---` / L79-148）；机器侧判据 `tests/docs-consistency.test.mjs:29-33`。
**Apply to:** `docs/MIGRATION.md`（用户面，D-11）、README 侧的新入口。

判定「用户面 vs 构建者面」的仓内实测分层（这是本 phase 最需要的一把尺）：

| 层 | 语言形态 | 实例 | 判据 |
|---|---|---|---|
| **用户面 + 公开仓** | **双语镜像**（zh 半 → `---` → en 半，章节集同构） | `README.md`、**`docs/MIGRATION.md`（本 phase 新增）** | 读者是外部访客，需兼顾英文（D-11 逐字理由） |
| **构建者面** | 中文单语正文 + **一行英文总纲** + 表内 `EN` 列 | `BUILD.md`（`:3` 是一整句英文摘要，`:5` 起全中文 + `| 项 | 值 | EN |` 表）、`THIRD-PARTY-NOTICES.md`（中文 + 六列英文表头） | 读者是发布者/复验者；**不做双语镜像**（没有「中文半区 → `---` → 英文半区」） |
| **流程面** | 中文单语，无 EN 列 | `.planning/**`、`docs/dshmarket/README.md` | 不面向外部读者；`docs/dshmarket/` 里那 5 个 schema 字段才是给外部看的 |
| **混合** | 中文正文 + Keep a Changelog 六类英文小节名 | `CHANGELOG.md` | 小节名是外部规范，正文不是 |

### 2. 「历史陈述不动」+ 唯一活体计数
**Source:** `03-PATTERNS.md:625-629`（立此纪律）+ `BUILD.md:16`（唯一活体数字）+ `docs-consistency` ⑥ `:102-105`（`version` / `private` 钉死）。
**Apply to:** 任何涉及测试计数、版本串、`private` 的编辑。**只有 `BUILD.md:16` 可改写**；`01-VERIFICATION.md` / `02-VALIDATION.md` / `STATE.md` 的旧数字只能追加带日期的前向注记。

### 3. 零依赖 / 零新脚本（D-06 的机器理由）
**Source:** `package.json` 无 `devDependencies`、仓内无 lockfile；`tests/docs-consistency.test.mjs:196-198`（「零 YAML 依赖——catalog 条目走行级正则自检（`js-yaml` 有意不引入）」）；`tests/pack-contents.test.mjs:9-22`（「为什么是静态推导而不是真跑一次 `npm pack`」）。
**Apply to:** ⑭ 断言、`docs/MIGRATION.md` 里的自检命令、全部备料文件。

- 文档自检 → 行级正则 / `includes`，**不引 markdown/YAML 解析器**。
- 迁移检测 → **不新增** `scripts/gsd-migrate-check.mjs`（D-06 逐字），判据只以可粘贴命令块交付。
- 需要 unserialize 的东西一律 `node -e` / `JSON.parse`。

### 4. 表格与标题体例（两条并存的 idiom，选哪条取决于文档面）
**Source:** `README.md:49-53`（CJK 表头 + `| ---- |` + 末列 `EN`）；`BUILD.md:9-24`（TL;DR 命令块 + `**加粗总纲**` + 编号 `## ①` 章节）；`BUILD.md:1` / `THIRD-PARTY-NOTICES.md:1`（H1 = `文件名 — 一句话职责`）。
**Apply to:** `docs/MIGRATION.md`（用户面 ⇒ 走 README 的表格 + 镜像；**不**走 `## ①` 编号，编号在双语镜像下会破坏两半对齐）、备料 README（内部 ⇒ 可走 `## 1. / ## 2.` 编号，见 `docs/dshmarket/README.md:5-32`）。

### 5. 提交纪律（`git add` 具体文件，不用 `-A`）与 commit message
**Source:** 实测 `git log`（本会话逐条解析）；`04-CONTEXT.md:165`（「`git add` 具体文件，不用 `-A`；`.planning/` 进 git，构建产物不进」）。

格式 = **Conventional Commits，`type(scope): subject`，subject-only、零 body**（近 40 个提交 `BODY len = 0`）、无 merge commit（线性 `main`）。type 实测分布：`docs` 占绝大多数，其次 `fix` / `feat` / `test` / `chore`（另有 2 个历史非约定式 `spike:` / `rename:`）。scope 是 **phase id**（`04`、`phase-03`）、**plan id**（`03-02`）或**域名**（`state`、`project`、`repo`、`planning`）。subject 语言**混用**：实质性裁决用中文、机械记录用英文。subject 可长（实测最长 244 字符），**证据写进 subject** 是既有惯例，例：

```
test(phase-03): 补 ⑧⑪⑫⑬ 四条 per-commit 守卫，闭合 G-1/G-2/R-1（Nyquist COMPLIANT；全量 36/36，BUILD.md:16 → 36/36）
feat(03-02): Task 1 npm manifest 元数据补全 — repository/homepage/bugs/keywords/author + publishConfig.registry（钉 canonical registry）
```

⇒ Phase 4 的建议形态（不新增约定，只沿用）：

```
docs(04): 迁移指南 docs/MIGRATION.md（双语同构，三节）+ README 双语入口
test(04): 追加 ⑭ MIGRATION 入口守卫（全量 38/38，BUILD.md:16 → 38/38）
docs(04): 旧仓互链备料落 docs/oldrepo-link（不提交、不推送，D-08）
```

### 6. 演练隔离面 = 三个 env 变量，一个都不能靠默认值
**Source:** `04-RESEARCH.md` Pattern 5（`DSH_HOME` 三入口全认；全局 npm prefix / pnpm store / `~/.gsd` / PATH 上的 `gsd_run` 都不在隔离面内）。
**Apply to:** `docs/MIGRATION.md` 的每一段命令块、`04-DRILL-EVIDENCE.md` 的每次操作记录。

```bash
export DSH_HOME="$(mktemp -d /tmp/dsh-mig-XXXXXX)"
export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"
echo "DSH_HOME=$DSH_HOME"; echo "npm prefix=$(npm config get prefix)"
```

---

## 附加直答（`<extra_questions_to_answer>` 的四问）

### 1. `README.md` 是否有稳定锚点？——**有，但「稳定」的定义是章节锚点，不是行号**

- **稳定锚点**：`## 为什么用 dsh-gsd`（zh）与 `## Why dsh-gsd`（en）这两个**标题行**。入口插在它们**之前**。标题文本是语义锚点，插入行不会移动它们。
- **脆弱锚点（不要写进 plan）**：`README.md:10` / `:83`——行号会随任一插入/删除漂移。本文件里出现的行号只为**证据**，plan 的 action 必须写成「`## 为什么用 dsh-gsd` 之前」。
- **钉住切片点的断言（逐字，`tests/docs-consistency.test.mjs:29-33`）**：

  ```js
  const firstTitle = readme.indexOf('# dsh-gsd')
  const enStart = readme.indexOf('# dsh-gsd', firstTitle + 1)
  const readmeZh = readme.slice(0, enStart)
  const readmeEn = readme.slice(enStart)
  ```

  **新插入必须避免的三件事**：① 出现字面量 `# dsh-gsd`（含 `](# dsh-gsd)` 这种带空格锚点）——会让 `indexOf` 命中新位置，切片整体位移，①②⑦⑫ 全部作用在**错误的半区**（**最危险**：可能不红，但断言语义已被换掉）；② 在 zh 半或 en 半**各加一次**裸名 install 整行（⑫ 从 1 变 2 该半区即红）；③ 加第三枚 shields.io 徽章（⑨ 红）。
- **实测的余量**：② 要求窗口串出现 `>=2` 次，现状 zh 1 / en 1 = **恰好 2**，没有任何冗余。⇒ 新行**不要**提到窗口串（提到也不红，但会让「阈值是否被绕过」变得不可读）。

### 2. `CLAUDE.md` / `AGENTS.md` / `.claude/skills/` —— **三者都不存在**

实测：`ls -la CLAUDE.md AGENTS.md AGENTS.MD .claude` → 三者均 `No such file or directory`；`find .claude -maxdepth 3` → 空（目录不存在）；仓内也无 `.cursorrules` / `.github/copilot-instructions.md`。

⇒ **没有任何「文件级规则文件」约束 doc 编辑**。约束全部落在**可执行的门**上，共四道，全部已在本文件逐字引用：

| 约束来源 | 形态 | 命中本 phase 的方式 |
|---|---|---|
| `tests/docs-consistency.test.mjs`（13 条） | 测试 | README 改 2 行 ⇒ 跑一遍 |
| `tests/pack-contents.test.mjs`（4 条） | 测试 | 只要不碰 `files` 就零影响 |
| `tests/run-gates.sh` gate A/B/C | 构建 gate | 只扫 `skills gsd-core hooks scripts` ⇒ **不覆盖 `docs/`**（⛔-F） |
| `.planning/.gitignore` 的注释纪律 | 约定（无机器执行） | 与 docs 无关 |

**唯一「规则式」约束来自 `.planning/` 的既有裁决与纪律**（不是文件）：`04-CONTEXT.md` 的 D-01..D-13、`03-PATTERNS.md:625-629` 的「历史陈述不动」、`STATE.md` 的串行纪律（`node --test --test-concurrency=1`）。

### 3. 提交信息惯例（依据最近 15–40 个提交的实测）

见上文 **Shared Pattern 5**。补三条量化事实（本会话逐条解析 `git log` 全史 143 条）：

- **最近 40 个提交全部 `BODY len = 0`**（无 body、无 `BREAKING CHANGE`、无 `Signed-off-by`）。全史 143 个提交里只有 22 个带 body，且都是 SUMMARY 式的 `- ` 列表——即「body 用于留证摘要，不用于解释动机」。
- 最近 15 个：`docs` **11** 条 / `fix` **4** 条；scope 依次为 `03`(×10)、`04`(×2)、`phase-03`(×2)、`state`(×1)。
- 工作分支 = `main`；另有备份分支 `backup/pre-identity-rewrite`（唯一一个）。`git log --merges` = **0** ⇒ 线性历史，无 merge commit。
- 最新提交 `01fe9e1 docs(04): 研究结论、验证策略与 CONTEXT codegraph 事实订正`（2026-11-13 23:40）。

### 4. 是否有测试扫 `docs/`？——**有，但只按字面路径点名 2 个文件，没有 glob**

实测（`grep -n 'docs/' tests/*.test.mjs` 的全部命中，4 行，全在同一文件）：

```
tests/docs-consistency.test.mjs:207:const DSHMARKET_ENTRY = 'docs/dshmarket/pfmiles__dsh-gsd.yml'
tests/docs-consistency.test.mjs:208:const DSHMARKET_README = 'docs/dshmarket/README.md'
tests/docs-consistency.test.mjs:289:  …docs/dshmarket/README.md…（失败文案）
tests/docs-consistency.test.mjs:298:  …docs/dshmarket/README.md…（失败文案）
```

⇒ **`docs/MIGRATION.md` 与 `docs/oldrepo-link/` 不会被任何现有断言看见**：
- 没有 `readdirSync('docs')`；
- 没有 `*.md` 的仓库级 glob（`tests/build-smoke.test.mjs` 只读 `skills/`、`config/`、`hooks/` 与 `README.md` 单点）；
- `pack-contents` 的 `simulatePack()` 只从 `files` + npm 无条件收录项展开 ⇒ `docs` 永不入列；
- `.github/workflows/compat-matrix.yml` 的 4 个 step 只跑 `check-pins` / 探针 / `build.mjs` / `node --test tests/*.test.mjs`，不扫 `docs/`。

**唯一会因新增 `docs/` 文件而变化的测试** = 你**自己**新加的 ⑭（⛔-C 的计数影响）。⇒ 「加一篇文档会不会无故变红」的答案：**不会**；「会不会因为漏改计数而红」的答案：**会，且只有这一条**。

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `docs/<备料>/snippet.{zh,en}.md` + `pr.md` | doc/data（可粘贴提交物） | 静态（人工复制到**另一个仓库**） | 仓内**没有**「面向第三方仓库的散文粘贴片段」先例。最近的 analog 是 `docs/dshmarket/pfmiles__dsh-gsd.yml`——但它是**结构化 schema 文件**（4 个字段、可被行级正则校验），而粘贴片段是散文，没有可机器化的契约。plan 直接用 D-09 的字面要求（片段 + 章节锚点 + PR title/body）落形，**不要**为它发明 schema 或校验脚本（D-06 的精神同样适用）。 |
| 旧仓 `README` 的插入位置本身 | — | — | 目标仓在 `dsh-gsd` 仓**之外**（`../install-gsd-dsh/`），fresh clone 里不存在。持久引用一律用 `https://github.com/pfmiles/install-gsd-dsh`；本文件里的 `:35` 这类行号是**本机观测值**，plan 的 action 只能写「`## Quick start` 之前」。 |

## Metadata

**Analog search scope:** 仓库 tracked 全集（`git ls-files` 核实，含 `docs/` 的 2 个 tracked 文件）；重点面 `docs/`、仓根 `.md`、`tests/`、`build/{assets,lib}/`、`.planning/phases/{01,02,03}/`、`.github/workflows/`。`.gitignore` 覆盖的产物树（`skills/` `gsd-core/` `hooks/` `config/` `scripts/`）与 `.gsd-build-tmp/` `.build-cache/` `node_modules/` 明确排除；仓外 `../install-gsd-dsh/` 仅作外部事实源。
**Files scanned:** `04-CONTEXT.md`(239) · `04-RESEARCH.md`(952) · `04-VALIDATION.md`(107) · `04-DISCUSSION-LOG.md`(headings) · `03-PATTERNS.md`(703，体例参照) · `02-PATTERNS.md`(438) · `01-PATTERNS.md`(195) · `README.md`(148，逐字符切片计算) · `BUILD.md`(1-70 + L16) · `CHANGELOG.md`(全) · `THIRD-PARTY-NOTICES.md`(1-12) · `docs/dshmarket/README.md`(32) · `docs/dshmarket/pfmiles__dsh-gsd.yml`(6) · `tests/docs-consistency.test.mjs`(335，全) · `tests/pack-contents.test.mjs`(240，全) · `tests/run-gates.sh`(101，全) · `tests/build-smoke.test.mjs`(selective) · `package.json`(56) · `cordis.patch.yml`(33) · `index.js`(48) · `config/gsd-hooks.json`(键集) · `skills/gsd-health/SKILL.md`(1-120，仅事实引用，gitignored) · `.planning/phases/01-build-mjs/verify-evidence.md`(78) · `../install-gsd-dsh/README.md`(1-40 + 标题枚举 + CJK 计数 + git 状态) · `.planning/.gitignore` · `.github/workflows/compat-matrix.yml`(step 枚举)
**Tracked-source gate:** 所有 named analog 经 `git ls-files -- <path>` 非空核实；无 mirror 路径进入本文件。
**Inherited evidence（未在本会话复跑，直接引用 RESEARCH 实测）:** 三层门逐字症状、`--dump-config` exit 0 的假绿、同 id 静默双行、`remove` 的 manifest 收敛、`gsd-health` 3084/3587 B 与 `gsd-new-project` 3195/3856 B 的字节数、72 个 `gsd-*`、`.bak.<epoch>` 5 个、全局 `@opengsd/gsd-core@1.16.0`。本 agent 硬约束禁止 `npm install` / `npm pack` / `dsh plugin` / git 写操作，故以上均为**继承证据**，验证归属执行期。
**本会话新增实测（供 plan 直接引用）:** `# dsh-gsd` 在 README 恰 2 次（offset 229/2641）；两半各 8 个 `##`、0 个 `###`；shields.io 徽章恰 2 枚（L3/L4，均在 L6 之前）；窗口串每半 1 次；裸名 install 每半 1 次；`docs-consistency` 13 条 / 全仓 37 条；`docs/` tracked 2 文件；`CLAUDE.md`/`AGENTS.md`/`.claude` 均不存在；旧仓 README CJK 字符 = 0、`## Quick start` 在 L35、HEAD `41fcc7a`、工作树干净；`run-gates.sh` 的 `TREES` 只含 4 棵树；`config/gsd-hooks.json` 的 5 事件 / matcher `1/7/4/1/1`；`jq` / `shasum` / `sha256sum` 本机均可用。
**Pattern extraction date:** 2026-11-13