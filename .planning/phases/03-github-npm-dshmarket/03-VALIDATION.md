---
phase: "03"
slug: "github-npm-dshmarket"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-11-12"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> 派生自 `03-RESEARCH.md` 的 `## Validation Architecture`（2026-11-12 规划期）；由 `gsd-validate-phase` 在 **HEAD `cf13915`** 按 3/3 PLAN + 3/3 SUMMARY 复审核并收敛（State A 审计：Per-Task Map 由 SC 粒度改写成 9 个真实任务 ID、Wave 0 逐项结账、两个「可自动化但未进套件」的缺口转为 Manual-Only）。
>
> **判定（2026-11-12 首次审计）= PARTIAL**（`status: validated` + `nyquist_compliant: false`）：5 条需求里 **3 条全自动覆盖**（PUB-02 / PUB-04 / INST-06，均在 `tests/` 的 per-commit 回路内），**2 条存在静态面缺口**（PUB-01 的 workflow 门控断言、PUB-03 的 `docs/dshmarket/` 材料与 install 串）——两者都**可**用十几行 `test()` 补上，但本次审计的写面被限定在 `.planning/phases/03-github-npm-dshmarket/` 内，故按 §4 的「Skip — mark manual-only」分支处置。见 §Audit Findings。
>
> **判定（同日补测后，当前）= COMPLIANT**（`status: validated` + `nyquist_compliant: true`）：G-1 落为 `tests/compat-matrix.test.mjs` **⑧**、G-2 落为 `tests/docs-consistency.test.mjs` **⑪⑫**、残余 R-1 同文件 **⑬**；三处均逐条做过「注入变异 → 新断言单独转红 → 还原」验证（含 `||`/`!=`/`&&`/brace/注释门/`exit 2` 出界 6 类 workflow 退化），全量套件实测 **37/37**（2026-11-12 CR-01 修复后：pack-contents 新增 ④、①⑨⑫ 收紧，实测 `ℹ tests 37`；收紧前为 36/36），`BUILD.md:16` 同步为 37/37。闭合记录见 §Validation Audit 2026-11-12。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 内置 test runner（`node --test`），Node `v24.21.0`（`engines.node >=24`） |
| **Config file** | 无配置文件 —— glob 驱动。gate A/B/C 由 `tests/run-gates.sh` 提供（需 `GSD_VERSION` + `GSD_STAGING_ROOT` 双 env，缺失 exit 1） |
| **Quick run command** | `node --test tests/rewrite-map.test.mjs tests/version.test.mjs tests/compat-matrix.test.mjs`（18 tests，~0.3 s）＋ `node --test tests/pack-contents.test.mjs`（4 tests，~0.1 s）＝ **22 tests** |
| **Full suite command** | `node --test tests/*.test.mjs`（**37 tests**：build-smoke 2 + compat-matrix 8 + docs-consistency 13 + pack-contents 4 + rewrite-map 7 + version 3；2026-11-12 CR-01 修复后实测 `ℹ tests 37` / `ℹ fail 0`，含真实构建 smoke） |
| **Estimated runtime** | ~19 秒（全量，2026-11-12 实测）；~0.4 秒（快速回路） |

**⚠ 串行强制：** `tests/build-smoke.test.mjs` 会重写构建树（`skills/` `gsd-core/` `hooks/` `config/` `scripts/`）。任一时刻只允许一个 `node build.mjs` / `node --test tests/*.test.mjs` / `npm pack` 在跑——并发会产出假红 `gate C: no SKILL.md under skills/gsd-*`（PUB-02 的并发面即由此观测：`ℹ fail 0` / `ℹ cancelled 0`）。

---

## Sampling Rate

- **After every task commit:** 快速回路 22 tests；改动 `.github/workflows/**` 时**必须**加跑 `actionlint`（本机 1.7.12，实测 exit 0、零输出）。
- **After every plan wave:** `node --test tests/*.test.mjs` → **37/37**（`ℹ fail 0` / `ℹ cancelled 0`，串行单进程）。
- **Before `/gsd-verify-work`:** 37/37 + `node build.mjs` → `gates: all passed (A/B/C)`、76 trees / 286 files / 72 skills + `node build/lib/check-pins.mjs --offline` exit 0（末行 `pins: all consistent (line dsh022)`）+ 四格 install/probe 两向全绿 + 真 `npm pack`（958 文件 / 12 顶层 / 4.58 MB / 零泄漏）+ 干净 profile 装成判据 + `actionlint` exit 0；**push 之后再加** CI 判据 `gh run list --workflow=compat-matrix.yml --limit 1 --json conclusion` → `success` 且 `total_count == 1`。
- **Phase gate 实测（2026-11-12，HEAD `cf13915`）:** 以上全部达成；CI 首跑 `43218878911` → `conclusion: success`（4/4 格 × 6 步），`total_count` 0 → 1。
- **Max feedback latency:** 1 秒（快速回路）／19 秒（全量）

---

## Per-Task Verification Map

> 行按 03-01 / 03-02 / 03-03 的实际任务拆分；`03-03-02` 是 `checkpoint:decision`（人审裁决），不产生自动化验证，故不入表。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | PUB-01, PUB-02 | T-03-02 | peer 收紧为 exact `0.2.2-rc.1` 必须 manifest + pins 同改；只改一侧即 exit 2（fail-closed 有牙） | unit（真值强等值，per-commit） | `node build/lib/check-pins.mjs --offline` → exit 0 ＋ 末行 `pins: all consistent (line dsh022)`（同一脚本由 compat-matrix ⑥ 在套件内 spawn，故它是两文件同改的机器证人） | ✅ `build/lib/check-pins.mjs` | ✅ green |
| 03-01-01 | 01 | 1 | PUB-01, PUB-02 | T-03-02 | 收紧 peer 不得连带漂移 `engines.dsh` / `dshRange` / README 窗口串 | unit（结构哨兵，per-commit） | `node --test tests/compat-matrix.test.mjs` → 7/7（②③④⑤⑥⑦） | ✅ `tests/compat-matrix.test.mjs` | ✅ green |
| 03-01-02 | 01 | 1 | PUB-01（CI 面，D-08） | T-03-03, T-03-04 | 「解析树 == `matrix.dsh`」断言必须被 `expect == install-ok` 门控（无条件断言会让 reject 格 `exit 2` → 首跑即红）；GITHUB_TOKEN 最小权限 | structural（套件内 ⑦ ＋ 一次性落位/静态校验） | `node --test tests/compat-matrix.test.mjs` ⑦ isGate（每个 `^\s+run:` 上一行是 inputs∩matrix 门、`run:` 仍 4）＋ ⑧ 门控形态（per-commit）＋ `actionlint`（一次性）＋ PLAN 落位校验命令（一次性，实测 `gated-assertion ok: probe run block L38-L50, gate L42 (indent 10), gated statements L43/L45/L46, closing fi L49`） | ✅ `tests/compat-matrix.test.mjs`（⑧，2026-11-12 补测：canonical 门行整行锚定 + `matrix.expect` 全文恰 2 次 + 解析断言与 `exit 2` 均落在（门, 收口 fi）内 + 6 类退化逐条拒绝） | ✅ green |
| 03-01-03 | 01 | 1 | PUB-02 | T-03-01 | `files` 白名单精确：`.planning/`·`tests/`·`build/`·`.github/`·`node_modules/` 零泄漏；顶层收敛于 12 项；条目有内容 | unit（静态推导，per-commit） | `node --test tests/pack-contents.test.mjs` → 4/4（④ = 安装形态下 `index.js` 的 pluginRoot/skillsDir 求值） | ✅ `tests/pack-contents.test.mjs` | ✅ green |
| 03-01-03 | 01 | 1 | PUB-01, PUB-02 | T-03-01 | 真实收面 == 静态推导；tarball 在干净 profile 装成并 boot（引擎 1.20.1 / 72 skills / 两条 bundle patch 行） | integration + e2e（分钟级，需 registry 与 `dsh` profile 生命周期） | `npm pack --dry-run --json --ignore-scripts`（958 / 12 / leaks 0）→ `npm pack` → `dsh plugin --profile gsd-p3-release add "$PWD/<tgz>"` → `runtime-identity --raw` = `@opengsd/gsd-core` + `1.20.1` / `skills` 72 / `dump-config` 两 id | ⚠️ 一次性执行（2026-11-12 全绿），**有意**不入套件（真 pack 会触发 prepack 递归回本套件，并发时清单会在 21/494/957/958 间跳变） | ⚠️ manual |
| 03-02-01 | 02 | 2 | PUB-03 | T-03-09 | manifest 只增不改：`repository`/`homepage`/`bugs`/`keywords`/`author`/`publishConfig.registry` 新增；`files` 仍 9 项、`private`/`version`/`peer` 零漂移 | unit（per-commit 全等断言） | `node --test tests/docs-consistency.test.mjs` ⑬：`repository`·`homepage`·`bugs`·`keywords`(7 项)·`author`·`publishConfig.registry` 六键全等（原一次性 `node -e` 12 键 `deepEqual` 中，本行这六个新键已由 ⑬ 长驻；`private`/`version` 由 ⑥ 兜住、`peer` 由 `check-pins --offline` 兜住、`files` 收面由 pack-contents 的顶层集合等值兜住——条数本身仍未单锁，见 §残余观察 R-1 闭合注） | ✅ `tests/docs-consistency.test.mjs`（⑬，2026-11-12 补测） | ✅ green |
| 03-02-02 | 02 | 2 | PUB-03, PUB-04 | T-03-06, T-03-10 | 徽章在最顶部且双语各有 MIT 与上游致谢；catalog 文案只用可证事实 | unit（套件内 ⑨ ＋ 一次性结构门/文案门） | `node --test tests/docs-consistency.test.mjs` ⑨（shields.io 徽章恰 2 枚且都在首个 `# dsh-gsd` 之前：其一以 `./LICENSE` 为链接且含 `MIT`、另一为 DSH 徽章；zh/en 各含 `THIRD-PARTY-NOTICES.md` 与 `MIT`）；一次性：`# dsh-gsd` 恰 2、pinned ≥ 4、Phase 5 文案正 2 / 反 2`）；⑪⑫（per-commit：dshmarket 条目 schema、裸名 install 串逐字一致与零 `dsh-gsd@latest`） | ✅ `tests/docs-consistency.test.mjs`（⑪⑫，2026-11-12 补测） | ✅ green |
| 03-02-03 | 02 | 2 | PUB-03, PUB-04, INST-06 | T-03-07, T-03-08 | CHANGELOG 首条目版本 == `package.json.version` 且小节名在六类闭集；locale 双语 `meta.title/description` 非空且 title 双边相等；`icon`/`exports['./icon']` 双通道 + `files` 收录 | unit（per-commit） | `node --test tests/docs-consistency.test.mjs` → 13/13（⑧ ⑨ ⑩ ⑪ ⑫ ⑬） | ✅ `tests/docs-consistency.test.mjs` | ✅ green |
| 03-03-01 | 03 | 3 | PUB-01 | T-03-12, T-03-13 | push 前四格两向绿 / 三档构建 / 套件 37/37 == `BUILD.md:16` / 工作树与远端 zero-state（除本计划 SUMMARY 外零未提交） | integration（一次性合练：外网 + registry） | 四格 `npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<v>` + `node build/lib/compat-probe.mjs --dsh <v> --expect <e>`；`GSD_VERSION=… node build.mjs` ×3；`git status --porcelain -- . ':(exclude)…03-03-SUMMARY.md'` 为空；`gh api …/actions/runs --jq '.total_count'` == 0 | ⚠️ 需外网/registry，按设计一次性；**不接受**「本地等价冒充 CI 结论」（P-03-m） | ⚠️ manual |
| 03-03-03 | 03 | 3 | PUB-01 | T-03-12, T-03-14 | 一次推送只产生一次 run ⇒ 无红跑历史；远端树 == 本地 HEAD | e2e（外部，`gh`） | `gh run list --workflow=compat-matrix.yml --limit 1 --json conclusion --jq '.[0].conclusion'` == `success` ＋ `gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count'` == 1 | ⚠️ 外部判据；实测 run `43218878911` success / 4-4 格 / `run_attempt 1` / `total_count` 0→1（2026-11-12T12:33:53Z） | ⚠️ manual |

*Status: ⬜ pending · ✅ green（per-commit 自动化）· ⚠️ manual（一次性命令或外部判据，证据见 Manual-Only 表）· ❌ red*

---

## Audit Findings

审计结论：首次审计 **无 red**；**2 个可自动化但未进套件的缺口**（均属 Wave 0 未落地的「测试侧」一半），首次 0 个已修、2 个转 Manual-Only。
**2026-11-12 补测后（同一原子提交）：2/2 已修**（⑧ / ⑪⑫），**残余 R-1 由 ⑬ 一并关闭**，**Manual-Only 中不再留任何本可自动化的项**；全量套件实测 **37/37**（CR-01 修复与 ①⑨⑫ 收紧后重测）。

### G-1 — PUB-01：workflow 门控正向断言没有 per-commit 守卫

- **状态：✅ Resolved（2026-11-12 补测，同一原子提交）** —— 守卫落为 `tests/compat-matrix.test.mjs` **⑧**（该文件 7 → **8** tests）。逐条注入的 6 类退化——`||` 门 / `!=` 反写 / `&&` 组合 / brace 形 `[ … ] && { … }` / 门只在 `#` 注释里 / `exit 2` 挪到门控区外——**每一个都使 ⑧ 单独转红**（同时 ①-⑦ 全绿，证明不是既存断言兜住的），还原后 8/8 复绿。另加一例「门行尾追 junk」验证端到端锚定（非 `.*` 前缀式）。

- **行为**：`compat-matrix.yml` 探针 `run: |` 块内的「解析树 == `matrix.dsh`」断言必须被 `if [ "${{ matrix.expect }}" = "install-ok" ]; then` 门控。理由是实测的：reject 两格的根 `@deepseek-ai/dsh-skill-filesystem` 解析为 `0.2.2-rc.1`（manifest exact peer 占位）而 `matrix.dsh` 是 `0.2.1-rc.5`，**无条件断言 ⇒ 首跑即红**（直接违反 SC-5 的「无红跑历史」）。
- **为什么是缺口**：套件里的 ⑦ 只断言「每个 `^\s+run:` 的上一行是 inputs∩matrix 门」与「`run:` 数量 ≥ 3」，**不检查块内断言是否按 expect 门控**；`actionlint` 与 03-01 的落位校验命令都是一次性执行，任何人把门「简化」掉（最典型的退化：把 `if` 去掉只留取值与 `exit 2`）套件仍全绿，直到下一次 CI 运行变红。
- **建议补测**：`tests/compat-matrix.test.mjs` 追加 ⑧ —— 在探针步骤自己的 `run:` 块区间内定位唯一 canonical 门行 `if [ "${{ matrix.expect }}" = "install-ok" ]; then`（trim 后整行锚定，拒绝 `!=`/`==`/`||`/brace 形态），并要求 `require.resolve`、`install tree does not match the matrix cell`、`exit 2` 三条语句各恰 1 条非注释行、且全部落在（门行, 收口 `fi`）内（存在 `else` 时落在（门, `else`）内）。**命令**：`node --test tests/compat-matrix.test.mjs`（8/8）。
- **现有证据（一次性，已通过）**：`gated-assertion ok: probe run block L38-L50, gate L42 (indent 10), gated statements L43/L45/L46, closing fi L49`；并实测 6 个退化变体各自 fail-closed。本次审计在 HEAD `cf13915` 目视复核同一落位（`run: |` L38 / 门 L42 / `exit 2` L46 / 收口 `fi` L49），未漂移。

### G-2 — PUB-03：`docs/dshmarket/` 材料与 install 串没有 per-commit 守卫

- **状态：✅ Resolved（2026-11-12 补测，同一原子提交）** —— 守卫落为 `tests/docs-consistency.test.mjs` **⑪⑫**（该文件 10 → **13** tests），残余 **R-1** 同提交以 **⑬** 关闭。逐条注入的变异——`icon` 顶层键 / 越界 `category`（`workflows`）/ zh 句末标点缺失 / docs 串整行缺失 / docs 串缩进（byte 不等）/ README 第三次出现 / `dsh-gsd@latest` / `publishConfig.registry` 改 npmmirror / `keywords` 删一项——**每个都使对应新断言转红**（除 `dsh-gsd@latest` 一例会与既有的 ③⑤ 同时红：同一 byte 的三重防线，属预期重叠而非耦合）。还原后 13/13 复绿。

- **行为**：`docs/dshmarket/pfmiles__dsh-gsd.yml` 的形状（恰 4 个顶层键 / `description.{en,zh}` / `category` ∈ 23 类闭集 / **无** `icon` / 文件名 slug）+ README 与 `docs/dshmarket/README.md` 的裸名 install 串逐字一致（SC-3 的「install 命令真实」）。
- **为什么是缺口**：03-02 Task 2 的离线行级自检与 `grep -F` 只在 `<verify>` 里**一次性**执行；`tests/docs-consistency.test.mjs` 的 ⑧⑨⑩ 不含 `docs/` 下任何断言（全仓 `grep -rn dshmarket tests/ build/` = **0 命中**）。这正是本文档草案 Wave 0 第 4 项「dshmarket 条目材料 + 离线自检命令（覆盖 SC-3）」未落地的后一半：**材料已产出，命令未入套件**。
- **建议补测**：`tests/docs-consistency.test.mjs` 追加 ⑪（零依赖行级正则：4 个顶层键与键序、`category` 词表、无 `^icon:`、`description.en/zh` 非空且句末标点）＋ ⑫（`grep -cE '^dsh plugin --profile web add dsh-gsd$'`：README == 2、`docs/dshmarket/README.md` ≥ 1）。**命令**：`node --test tests/docs-consistency.test.mjs`（13/13）。
- **现有证据（一次性，本次审计在 HEAD 复跑仍绿）**：`dshmarket entry ok`（exit 0）；裸名行 `README.md` = 2、`docs/dshmarket/README.md` = 1。

### 残余观察（不计入缺口数，均为「有意一次性」或低风险）

- **R-1（PUB-03 的 npm 元数据面）— ✅ 已闭合（2026-11-12，同一原子提交）**：6 个新键（`repository`/`homepage`/`bugs`/`keywords`/`author`/`publishConfig.registry`）由 docs-consistency **⑬** 长驻（全等断言；`publishConfig.registry` 改成 `registry.npmmirror.com` 即红）。**残留（有意）**：`files` 的**条数**（=9）仍无条数级断言，收面由 pack-contents 的顶层集合等值守卫（更强地钉住「哪 12 个顶层条目可入包」），条数本身不锁——新增/删除条目会先撞顶层集合等值。
- **R-2（PUB-02 的 prepack 组成）**：`scripts.prepack === 'node build.mjs && node --test tests/*.test.mjs'` 只做过一次性核对。套件不覆盖它是**有意的**（真 `npm pack` 会递归回本套件并造成清单抖动），pack 面改由静态推导的 3 条断言守卫。
- **R-3（PUB-04 的文件本体）**：⑨ 断言 README 含 `THIRD-PARTY-NOTICES.md` 与 `MIT` 字面，但不断言这两个文件存在（链接可腐烂而套件仍绿）。两者都是 tracked 且本 phase 零改动（D-01），风险低。
- **R-4（INST-06 的运行时面）**：宿主是否真把 `meta.title/description/icon` 渲染出来、以及 `pnpm approve` 的「Agent skills awaiting approval」是否影响会话内技能可见性，属宿主运行时行为 → 移交 Phase 5 UAT-01（03-RESEARCH A2，已登记 Manual-Only）。

---

## Wave 0 Requirements

- [x] `tests/pack-contents.test.mjs` — **从 `tests/pending-phase-3/` 移回**（`git mv`，100% 相似度、0 行改动；ROOT 的 `..` 由位置本身修好 `ENOENT tests/package.json`）— 覆盖 PUB-02；实测 3/3
- [x] `BUILD.md:16` 计数 — 26/26 → 29/29 →（03-02 按实测一次写成）**32/32** →（2026-11-12 补测后按 `node --test tests/*.test.mjs` 的 `ℹ tests 36` 实测改写）**36/36** →（同日 CR-01 修复：pack-contents 新增 ④ 安装形态守卫、①⑨⑫ 收紧后按 `ℹ tests 37` 实测改写）**37/37**；`git diff --numstat` 恰 `1 1`、全文无 `26/26` 残留、无 `32/32` 残留
- [x] `CHANGELOG.md` 新建 + 首条目 `1.20.1-1.dsh022` — 版本等值断言已落为 docs-consistency **⑧**（进 per-commit 回路），覆盖 SC-6 / PUB-03
- [x] dshmarket 条目材料 — `docs/dshmarket/pfmiles__dsh-gsd.yml`（4 顶层键 / `category: workflow` / 无 `icon`）+ `docs/dshmarket/README.md`（目标仓/路径/时点、逐字 install 串、可证事实、非聚合包论证）
- [x] **dshmarket 离线自检「入套件」— 已完成（2026-11-12）**：一次性命令的口径落为 docs-consistency **⑪**（条目 schema，零 YAML 依赖的行级正则）与 **⑫**（裸名 install 串整行计数 + byte 相等 + 零 `dsh-gsd@latest`）；`docs/dshmarket/**` 在套件内的命中数 0 → 2。
- [x] 干净 profile 的安装/boot 复核序 — 03-01 Task 3 执行（profile `gsd-p3-release`；引擎 1.20.1 / 72 skills / 两条 bundle patch 行），已登记 Manual-Only
- [x] （原「可选」项）`tests/docs-consistency.test.mjs` 徽章/致谢断言 = **⑨**；`compat-matrix.yml` 的 `permissions: { contents: read }` 与 install-ok 格正向断言均已落地 —— 后者**门控本身**的套件守卫 = **⑧**（2026-11-12 补测）

**无新框架安装需求** —— Node 内置 runner 已足够；`js-yaml` 与 `semver` 均**不引入**（catalog 条目走行级正则自检，宿主判定唯一走 `build/lib/compat-probe.mjs`）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | 状态 / 证据 |
|----------|-------------|------------|-------------------|-------------|
| tarball 在干净 profile 装成并 boot | SC-1 / PUB-01 | 需要 `dsh` 真实 profile 生命周期与宿主 boot，无纯静态等价物 | ① `npm pack` 取 tgz（绝对路径）；② `dsh plugin --profile gsd-p3-release add "$PWD/<tgz>"`；③ `node …/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；④ `ls …/node_modules/dsh-gsd/skills \| wc -l` = 72；⑤ `dsh --profile gsd-p3-release --dump-config \| grep -cE '^\s*- id: (gsd\|gsd-hooks-bridge)$'` = 2 | ✅ 已执行 — 2026-11-12（`tarball boot ok` exit 0；安装日志的 `Agent skills awaiting approval` 原样记录，定性移交 Phase 5 UAT-01） |
| CI 首次激活 run 全绿（无红跑历史） | SC-5 / PUB-01 | CI 首跑本身不可先验证明（03-RESEARCH A1），且判据只能在远端观测 | `gh run list --workflow=compat-matrix.yml --limit 1 --json databaseId,event,conclusion,headSha` → `conclusion=success`；`gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count'` → 1；`run_attempt` 必须为 1（无 rerun）；若首跑红则**不得**重推掩盖 | ✅ 已执行 — run `43218878911` / event `push` / `conclusion: success` / 4-4 格全 success / `run_attempt 1` / `total_count` 0→1（2026-11-12T12:33:53Z）；推送通道 = HTTPS + `gh` credential helper（SSH 在本机不可用，`origin` 未改写） |
| 四格本地等价（install/probe 两向） | PUB-01 | 需 npm registry 外网与真实解析树；每次独立一次性副本 | 每格 `mktemp -d` + `rsync` 副本 → `npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<v>` → `node build/lib/compat-probe.mjs --dsh <v> --expect <e>`；install-ok 格认 `compat-probe: install-ok confirmed`，reject 格认 `compat-probe: reject confirmed` | ✅ 已执行 — 4/4 exit 0（install-ok 656 包 / reject 601 包；reject 格根解析 `0.2.2-rc.1` 正是 G-1 门控存在的实测理由） |
| 真 `npm pack` 收面交叉核对 | PUB-02 | 分钟级 + `prepack` 会递归回本套件，不适合 per-commit | `npm pack --dry-run --json --ignore-scripts` → 归一化后断言 leaks 0、顶层集合 == `files` 推导面、必含 `index.js`/`cordis.patch.yml`/`icon.svg`/`locale/{en,zh}.json`。**不要硬编码 958**（任何新增顶层文件都会改变它） | ✅ 已执行 — `pack cross-check ok: 958 files / 12 tops / leaks 0`；真 `npm pack` 958 文件 / 4.58 MB |
| 三档 GSD 构建 + `actionlint` | PUB-01 | 需外网取 GSD tarball 与外部工具 | `GSD_VERSION=1.20.1 \| 1.19.0 \| 默认 node build.mjs` 三条均 `gates: all passed (A/B/C)`，收尾含 `copied 76 trees`；`actionlint` exit 0 零输出 | ✅ 已执行 — 三条 15s/11s/15s 全绿；`actionlint` 1.7.12 exit 0 |
| **G-1**：workflow 门控断言落位 | PUB-01 | ~~套件无守卫~~（已闭合：per-commit 守卫 = ⑧） | 重放 03-01-PLAN 的落位校验命令 → 期望 `gated-assertion ok: probe run block L38-L50, gate L42, …`；退化时各自报 6 类可区分红消息 | ✅ **已转 per-commit（⑧）**——不再是 Manual-Only；历史一次性证据：落位 L38-L50 / gate L42 / `exit 2` L46 / 收口 `fi` L49 |
| **G-2**：dshmarket 条目 schema + install 串 | PUB-03 | ~~套件无守卫~~（已闭合：per-commit 守卫 = ⑪⑫） | 重放 03-02 Task 2 的离线行级自检 → `dshmarket entry ok`；`grep -cE '^dsh plugin --profile web add dsh-gsd$' README.md docs/dshmarket/README.md` → 2 / 1 | ✅ **已转 per-commit（⑪⑫）**——不再是 Manual-Only；历史一次性证据：`dshmarket entry ok` exit 0；裸名行 2 / 1 |
| dshmarket 提交流程真实性 | PUB-03 | 目标仓是第三方仓，流程由其 `contributing.md` 与 CI 定义，本地无法执行 | 以 `03-RESEARCH.md` Pattern 3 复核四检（≤3 条/PR、根 `dsh.bundle` 存在、仓龄 ≥1 天、`awesome-lint` + site build）；实际提交在 Phase 5 | 📌 材料已备（`docs/dshmarket/`），PR 本体移交 Phase 5 |
| 宿主展示渲染 + `pnpm approve` 审批行为 | INST-06 | 纯宿主运行时行为（UI 渲染、技能可见性） | 干净机器 UAT：装包后确认插件卡片显示 `meta.title/description` 与 `icon.svg`；`pnpm approve` 后确认 `gsd-*` 技能在会话内可见 | 📌 移交 Phase 5 UAT-01（03-RESEARCH A2 / Open Question 6 有意留开） |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies（9 个任务行：2026-11-12 补测后 **6 条 per-commit 自动化守卫**（原 4 条 + ⑧⑪⑫⑬ 覆盖的 03-01-02 / 03-02-01 / 03-02-02）+ **3 条一次性/外部判据**（干净 profile 装机、真实 `npm pack`、CI 远端观测），后者在 Manual-Only 表内带证据）
- [x] Sampling continuity: no 3 consecutive tasks without automated verify（最长的连续人工段 = 02-01 → 02-02 两任务，其后 02-03 即回落 per-commit）
- [x] Wave 0 covers all MISSING references —— 2026-11-12 补测后满足：第 4 项「自检入套件」= ⑪⑫，第 7 项门控守卫 = ⑧
- [x] No watch-mode flags（全量与快速回路都是一次性退出；`prepack` 链无 watch）
- [x] Feedback latency < 30s（快速回路 0.4 s / 全量 19 s）
- [x] `nyquist_compliant: true` set in frontmatter —— 2026-11-12 补测后置 true（G-1/G-2/R-1 全部落为 per-commit 断言，且逐条通过变异验证）

**Approval:** compliant 2026-11-12（首次审计为 partial 同日闭合：三个缺口 G-1 → ⑧、G-2 → ⑪⑫、R-1 → ⑬，全量套件实测 **37/37**、`BUILD.md:16` 同步 37/37。首次审计于 HEAD `cf13915` 的 State A 结论保留其上：Per-Task Map 9 个真实任务、Wave 0 逐项结账、Manual-Only 证据册；`check-pins --offline` 与 dshmarket 离线自检当时只读复跑通过）

## Validation Audit 2026-11-12

| Metric | Count |
|---|---|
| Gaps found | 2 |
| Resolved | 2 |
| Escalated | 0 |
| Residual closed in same commit | 1（R-1 → ⑬） |

| Gap | 首次处置 | 现状态 | 守卫 | 变异验证（注入 → 新断言单独转红 → 还原） |
|---|---|---|---|---|
| G-1（PUB-01 workflow 门控） | Escalated 2（Manual-Only） | ✅ **Resolved** | `tests/compat-matrix.test.mjs` **⑧**（7 → 8 tests） | `\|\|` 门 / `!=` 反写 / `&&` 组合 / brace 形 `[ … ] && { … }` / 门只在 `#` 注释 / `exit 2` 挪到收口 `fi` 之后 / 门行尾追 junk —— 7/7 均使 ⑧ 红且仅 ⑧ 红，还原后 8/8 |
| G-2（PUB-03 dshmarket 材料） | Escalated 2（Manual-Only） | ✅ **Resolved** | `tests/docs-consistency.test.mjs` **⑪⑫**（10 → 13 tests） | `icon` 顶层键 / 越界 `category` / zh 句末标点缺失 / docs 串整行缺失 / docs 串缩进 / README 第三次出现 —— 6/6 各自使 ⑪ 或 ⑫ 红（仅目标断言），还原后 13/13 |
| R-1（PUB-03 npm 元数据面） | 残余观察（不计缺口） | ✅ **Closed（同提交）** | 同文件 **⑬** | `publishConfig.registry` → npmmirror / `keywords` 删一项 —— 均使 ⑬ 红，还原后 13/13 |

**变异验证的边界（如实登记）：** ⅰ) `dsh-gsd@latest` 变异会让 ⑫ 与既有的 ③⑤ **同时**红（同一 byte 的三重防线，属预期重叠）；ⅱ) ⑪ 的 `category ∈ 23 类闭集` 一行被更强的 `category === 'workflow'` 前置遮蔽——只有把 `workflow` 从闭集里删掉才会单独触发，故它是「闭集自证」而非独立行为守卫；ⅲ) ⑧ 锁的是**文本形态**（门行字面、与收口 `fi` 的相对位置、出现计数），不证明 shell 执行语义：门控区内**新增**一条与 `RESOLVED` 无关的语句不会被 ⑧ 抓到（⑧ 只要求 RESOLVED 解析断言与字面 `exit 2` 各恰 1 条并落在门内），那类扩张仍需 code review。
