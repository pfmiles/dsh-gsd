# Phase 2: 版本与兼容矩阵 - Research

**Researched:** 2026-11-11
**Domain:** 插件版本策略 / 宿主兼容门语义 / CI 矩阵（npm semver + GitHub Actions + DSH plugin-manager）
**Confidence:** HIGH（核心机制全部由本机 DSH 0.2.2-rc.1 运行时源码 + 实测探针确定）

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

以下全部来自 PRD（REQUIREMENTS.md）与 ROADMAP，视为已锁定决策（locked decisions），planner 必须逐条映射进 plan：

### 版本兼容门槛（VER-01）
- `engines.dsh` 门槛拒绝/禁用不兼容版本安装（安装期拒绝，不是装后报错）。
- 不兼容安装的拒绝必须"干净"且日志可解释（Success Criterion 3）——用户能看懂"为什么拒、该装哪个"。
- 当前宿主契约（PROJECT.md）：DSH 0.2.2-rc.1 系，`engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"`。

### 版本号方案（VER-02）
- 插件版本号方案 = `<gsd-ver>-<rev>-dsh<line>`；升级/回滚 = 同命令换版本号。
- 必须文档化并给出示例（Success Criterion 2）。
- 现状锚点：package.json `version: "0.1.0-gsd1.20.1"` 是该形态的雏形但未固化规则（`<gsd-ver>` 与 `<line>` 的表达、`<rev>` 的起算与递增规则均未成文）。

### 兼容矩阵与 CI（VER-03）
- 每个 DSH 兼容行有构建/冒烟验证记录，CI matrix 覆盖「当前 DSH 行 + 前一行」× GSD 版本。
- Success Criterion 1：矩阵 CI 必须存在于 `.github/workflows`。
- 已知：repo（git@github.com:pfmiles/dsh-gsd.git）已建仓，本地 ahead 31 未推，push 后 CI 才成型（STATE.md）。

### Node 门槛（VER-04）
- Node ≥ 24 门槛与 GSD 引擎要求一致，并在 README 声明。
- 现状：package.json `engines.node: ">=24"` 已写；README 声明一致性需核对。

### 自举验证（DEV-03）
- 每个 phase 的完成物在验证实例（gsdtest profile @ 127.0.0.1:3091，本插件 file: 安装）上 gate 通过后才算 done。
- 兼容矩阵相关的运行期验证同样要走验证实例复证（与 Phase 1 的 DEV-03 同口径）。

### Claude's Discretion

PRD 未覆盖、由 planner 研究后定夺的区域（在 plan 中显式落成设计决策，不静默假设）：

- 「当前 DSH 行 + 前一行」的具体取值（0.2.2-rc.1 系之外"前一行"指哪个版本号区间，需研究 DSH 实际发布行）。
- CI 平台/流程的具体形态（Actions workflow 布局、冒烟层级：安装冒烟 vs 静态校验 vs 产物校验）。
- engines.dsh 拒绝的发生点与文案设计（DSH 插件管理器在哪个环节读 engines、拒绝体验如何实现/验证）。
- 桥接依赖 pin 对齐的机制形态（同步脚本 vs 文档位 vs 两者，pin 具体指 `@deepseek-ai/dsh-hooks-claude-code`、`dsh-hook-protocol`、peer `dsh-skill-filesystem`）。
- `<rev>` 的维护规则（起始值、何时递增、发布工具是否强制校验格式）。

### Deferred Ideas (OUT OF SCOPE)

- PUB-01..04（GitHub 发布/npm/dshmarket registry）→ Phase 3
- MIG-01..04（迁移 runbook 全文、差异表、并存验证）→ Phase 4
- HOOK-05 的策略文档 + DSH 升级症状/修复 runbook → Phase 4（本 phase 只做 pin 对齐机制/文档位）
- UAT-01..06（干净机器全量验收）→ Phase 5
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VER-01 | `engines.dsh` 门槛拒绝/禁用不兼容版本安装 | 「Architecture Patterns → Pattern 1/3」+「Code Examples [4]」：宿主求值语义与安装期 preflight 拒绝契约（全源码级 VERIFIED + 运行 DSH 自身函数实测探针表见 Summary/Pitfall 2）；Pitfall 3/4（engines.dsh 独裁语义、manifest 缺失 fail-open） |
| VER-02 | 插件版本号方案 = `<gsd-ver>-<rev>-dsh<line>`，升级/回滚 = 同命令换版本号 | 「Code Examples [1]」+ Pitfall 1：semver 7.8.6 实测各编码合法性/排序病理；推荐 `1.20.1-<rev>.dsh022` 无点线号编码 + 修订规则（Open Question 3/5、Pattern 2） |
| VER-03 | 每个 DSH 兼容行有构建/冒烟验证记录（CI matrix，当前行 + 前一行） | Summary（npm registry 发布行实测数据）+「Code Examples [2]」（矩阵单元格 = 宿主探针 + build + gates 的完整 workflow 骨架）+「Standard Stack」（actions v7 版本经 GitHub API 核实） |
| VER-04 | Node ≥ 24 门槛与 GSD 引擎要求一致并在 README 声明 | Summary/Pitfall 相关（@opengsd/gsd-core 1.20.1/1.19.0/1.16.0 engines 逐字来自 registry；README.md:40-42 双语已声明，需同步新版本号示例——docs-consistency 测试覆盖） |
| DEV-03 | 每个 phase 完成物在验证实例 gate 通过才算 done | 「Validation Architecture」+「Code Examples [4]」：BUILD.md §⑧ 复验序复用 + 负向安装探针设计；证据口径沿用 Phase 1 verify-evidence.md |
</phase_requirements>

## Summary

本 phase 的实质是把「装哪个版本、适配哪行 DSH」从口头约定变成**声明式、可验证、可解释**的事实。研究确认了三件关键事：

**第一，兼容门已经由宿主实现且语义可精确刻画。** `engines.dsh` 不是 npm/pnpm 的能力（npm/pnpm 只认 `engines.node`/`engines.npm`，自定义 key 一律忽略——[ASSUMED]，见 Assumptions Log A1），而是 DSH 0.2.2 时代新增的两处自有执法：安装期 preflight（`@deepseek-ai/dsh-plugin-manager`）与启动期 bundle 加载检查（`@deepseek-ai/dsh-app-boot`）。求值规则逐字为：`semver.satisfies(runtimeVersion, range, { includePrerelease: true })`（semver 7.8.6），且 **engines.dsh 存在时独自裁决，peerDependencies 被完全忽略**。本机的 DSH runtime 与安装的 0.2.2-rc.1 完全一致，我已直接用运行时的 `evaluatePluginCompatibility` 函数对候选行做了实测（见 §2 探针表）——这使 VER-01 的门槛行为是可预测、可负向测试的，不需要重造任何语义。

**第二，DSH 的发布行是快速移动的 prerelease 线。** npm 上存在 0.1.x 线（至 0.1.7-rc.2，2026-09-24）与 0.2.x 线（0.2.0-rc.1 → 0.2.1-rc.5 → 0.2.2-rc.1，最近一次发布 2026-11-04，距今 7 天）。「当前行」= 0.2.2-rc.1；「前一行」= 0.2.1-rc.5。关键张力：**pins 是行锁定的**（桥接包 `@deepseek-ai/dsh-hooks-claude-code` 等三件全部按行同号发布、包内 peers 全部精确 pin `0.2.2-rc.1`），一个包版本只可能诚实支持一行 → 前一行格在矩阵里是**期望拒绝（负向）格**，而不是"扩大 engines 范围假装支持"。这与 Success Criterion 3 的负向要求天然同构。

**第三，CI 可以在不依赖任何第三方服务的前提下验证全部四个成功标准。** 矩阵单元格 = 安装宿主自身对应该行的 `@deepseek-ai/dsh@<line>` → 调其 `evaluatePluginCompatibility` 探我们的 package.json（期望 ok/reject）→ `GSD_VERSION=<gsd> node build.mjs`（gates 内嵌）→ `node --test tests/*.test.mjs`。官方 actions 当前版本已核实为 actions/checkout@v7.0.1（2026-07-20）与 actions/setup-node@v7.1.0（2026-10-08）。

**Primary recommendation:** 保持 `engines.dsh` 不动（`">=0.2.2-rc.1 <0.3.0-0"`，与 README.md:40 一致）；版本号编码采用无点线号形式 `1.20.1-<rev>.dsh022`（rev 必须为独立数字 id，点号在线号内会产生排序病理，已实测证明）；新增 `scripts/pins.json`（pin/行对齐单文件真源）+ `scripts/check-pins.mjs`（校验）+ `scripts/compat-probe.mjs`（宿主求值探针）+ `.github/workflows/compat-matrix.yml`（2 DSH 行 × 2 GSD 版本 = 4 格，前一行两格为负向）；（任一）`tests/version.test.mjs`、`tests/compat-matrix.test.mjs`、`tests/docs-consistency.test.mjs` 三个 node:test 单测套件；更新 README 版本示例与 BUILD.md 新增「版本与 pin 对齐」章。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| engines.dsh 求值与拒绝 | DSH 运行时（宿主 app-boot / plugin-manager） | — | 执法唯一实现点；插件侧只有声明，绝不复制语义 |
| 版本号方案与格式校验 | 包清单/仓库源码（package.json + scripts/check-pins.mjs） | 外部文档（README/BUILD.md） | 声明 + 静态自校验；文档只转述 |
| 桥接 pin 对齐 | 仓库源码（scripts/pins.json 单文件真源） | CI Runner | 单一真源防四处漂移；CI 强制消费 |
| 矩阵冒烟（build/gates/tests） | CI Runner（GitHub Actions） | 仓库源码（build.mjs/tests/run-gates.sh 复用） | 每个 DSH 行的验证记录落在 workflow 单元格 |
| 负向拒绝证据 | 验证实例（gsdtest profile，DEV-03） | CI Runner（期望拒绝格） | 人可读的"干净拒绝"证据必须活体采集 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| GitHub Actions（actions/checkout） | v7.0.1 | CI 矩阵取码 | GitHub 官方 action，latest tag 经 GitHub API 核实 2026-07-20 发布 [VERIFIED: api.github.com/repos/actions/checkout/releases/latest] |
| GitHub Actions（actions/setup-node） | v7.1.0 | 单元格 Node 24 环境 | GitHub 官方 action，latest tag 经 GitHub API 核实 2026-10-08 发布 [VERIFIED: api.github.com/repos/actions/setup-node/releases/latest] |
| Node 内置 `node:test` | Node v24.21.0（本机） | 全部单测 | 零安装、repo 无 devDependencies/lockfile 的既有约定；`node --test tests/*.test.mjs` 7/7 已稳 [VERIFIED: package.json:46 + STATE.md:40] |
| DSH 运行时 `evaluatePluginCompatibility` | dsh 0.2.2-rc.1 内置 | 兼容门求值（探针调用） | 宿主的唯一真值；CI 单元安装 `@deepseek-ai/dsh@<line>` 后直接 import，杜绝自造 semver 语义 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| semver | 7.8.6（仅在 DSH runtime 内部） | 版本比对 | 决不在仓库侧新增 semver 依赖；一切求值走宿主探针或 `npm view` |
| npm CLI `npm view` / `npm pack` | npm 12.2.1（本机） | registry 事实取样、GSD tarball 在线档 | 沿用 BUILD.md §③/§⑦ 的既定取样纪律（registry.npmjs.org + npmmirror 对照） |
| actionlint | —（本机缺失） | workflow YAML 静态诊断 | 本 phase 本地验证语法；缺失时回退方案见 §11 环境审计 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `engines.dsh` 扩大为 `>=0.2.1-rc.5 <0.3.0-0`（宣称支持前一行） | 保持 `>=0.2.2-rc.1 <0.3.0-0` | 扩大 = 宣称一个从未活体验证的行；且 pins 行锁定决定双行必须双版本，扩大只会把"装错版本"变成"装后崩" |
| 仓库侧加 `semver` devDependency 自判范围 | 探针调宿主函数 + 字符串表校验 | devDep 引入 install/lockfile 噪声，违背零安装约定（BUILD.md 无 npm install 步骤） |
| CI 直接跑 `dsh plugin add file:.` 于每行 DSH | 每格安装 `@deepseek-ai/dsh@<line>` 做求值探针 | 完整 profile add 需 DSH bootstrap 进程/UI 环境，单元格成本数量级更高；P5 UAT 才是活体安装验收的宿主 |
| workflow 用脚本串行跑 4 格 | `strategy.matrix.include` 原生矩阵 | GitHUB 原生并行 + fail-fast 控制 + 每格日志可独立取证 |

**Installation:** 本 phase 的 CI 单元只安装官方 `@deepseek-ai/dsh@<line>`（`npm install --no-save --ignore-scripts @deepseek-ai/dsh@0.2.2-rc.1`），不引入任何第三方包；仓库侧零安装新增（全部 node 内置 + 既有 npm CLI）。

**Version verification:** 上表 actions 版本经 GitHub API `releases/latest` 实测取得（2026-11-11）；semver 版本经本机 DSH node_modules 直读 `semver/package.json` 为 `"7.8.6"`；包名均为 GitHub 官方组织 `actions/*` 与 DeepSeek 官方 scope `@deepseek-ai/*`，来源权威。

## Package Legitimacy Audit

> 本 phase 不向仓库引入任何外部依赖（零安装约定），但 CI 单元与工具链会触碰以下具名包/action：

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| @deepseek-ai/dsh | npm | 2026-09 起发布 0.1.x → 0.2.x 线 | 宿主官方包（本机 global install） | github.com/deepseek-ai/deepseek-harness（package.json:8-9 直读） | OK | Approved（仅 CI 探针安装各自行号版本 `--no-save`） |
| @deepseek-ai/dsh-hooks-claude-code | npm | 与 DSH 同线同号发布 | 同上 | 同上 monorepo | OK | 既有依赖 pin（package.json:26），本 phase 校验对齐不改装 |
| @deepseek-ai/dsh-hook-protocol / dsh-skill-filesystem | npm | 同上 | 同上 | 同上 monorepo | OK | 同上 |
| actions/checkout | GitHub marketplace | 官方 action，v7.0.1 | GitHub 官方维护 | github.com/actions/checkout | OK | Approved（@v7 主版本引用） |
| actions/setup-node | GitHub marketplace | 官方 action，v7.1.0 | GitHub 官方维护 | github.com/actions/setup-node | OK | Approved（@v7 主版本引用） |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*注：@opengsd/gsd-core@1.20.1 的 canonical 完整性（dist.shasum `d632001e2541e6cccfb740bcad5b2f5c334efabd` / dist.integrity `sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPZcQ==`）已由 Phase 1 固化于 THIRD-PARTY-NOTICES.md:8，本 phase 只消费，不新装外部包。*

## Architecture Patterns

### System Architecture Diagram

```
 [用户]  dsh plugin --profile <name> add dsh-gsd@1.20.1-1.dsh022   (exact spec, saveExact)
   │
   ▼
 [DSH plugin-manager preflight]  ── 安装 pnpm 之前 ──────────────┐
   │  namedSpecManifest:                                             │
   │   · file:/本地路径 → 直读 <path>/package.json                    │ 双方一致：
   │   · registry 规格 → pnpm view <spec> name version               │ engines.dsh 独自裁决
   │                     engines peerDependencies --json              │ (semver.satisfies,
   │   ↓ 调 evaluatePluginCompatibility(manifest, exemptions)        │  includePrerelease:true)
   │  ├─ 满足 → pnpm add（saveExact）→ 安装 → bundle 注册            │
   │  └─ 不满足 → REJECT before pnpm：exit 1，stderr =                │ 豁免出口：
   │      "dsh: installation rejected: <Plugin x@y is incompatible   │ profile/compatibility.json
   │       with dsh z: requirements {...}…>" + allow-version 命令      │ (精确 name@version ×
   │       留痕 .plugin-manager 日志；清单/锁文件快照回滚("nothing    │  精确 DSH 版本)
   │       was installed")                                            │
   ▼                                                                  ▼
 [DSH 启动 bundle 加载]  ── 已装但不兼容/无豁免 → 行被拒绝加载(禁用) ──┘

 ——— CI 侧（.github/workflows/compat-matrix.yml，每格）———
 checkout@v7 → setup-node@v7(node 24)
   → npm i --no-save --ignore-scripts @deepseek-ai/dsh@<matrix.dsh>
   → node scripts/compat-probe.mjs --dsh <line> --expect install-ok|reject   (宿主自家求值)
   → GSD_VERSION=<matrix.gsd> node build.mjs                                  (gates A/B/C 内嵌)
   → node --test tests/*.test.mjs                                             (真实构建 smoke 等)

 ——— 仓库侧（pin 对齐，prepack 前不变）———
 scripts/pins.json  (行→engines 窗口/pins/矩阵轴值，单文件真源)
   → scripts/check-pins.mjs --dsh-line <022|021> [--offline]                  (字符串表校验)
   → npm test / prepack 链路不变（build && node --test tests/*.test.mjs）
```

### Recommended Project Structure

```
.github/
└── workflows/
    └── compat-matrix.yml        # 矩阵 CI（本 phase 新增，唯一 workflow）
scripts/
├── pins.json                   # 行↔pin 对齐真源（新增；scripts/ 已在 files 白名单）
├── check-pins.mjs              # pin/版本号/engines 窗口一致性校验（新增）
└── compat-probe.mjs            # 宿主求值探针（CI 单元用，新增）
tests/
├── run-gates.sh                # 既有：gate A/B/C 唯一实现
├── build-smoke.test.mjs        # 既有：真实构建 smoke + 防线组
├── rewrite-map.test.mjs        # 既有
├── version.test.mjs            # 新增：版本号方案 parse/validate/bump
├── compat-matrix.test.mjs      # 新增：workflow 存在性 + 轴值 vs pins.json 一致性
└── docs-consistency.test.mjs   # 新增：engines.node ↔ README 双语声明一致性
```

### Pattern 1: 宿主求值为唯一真值（declarative gate, never re-evaluate locally）

**What:** 兼容判定只有一个实现 —— DSH 运行时的 `evaluatePluginCompatibility`。仓库侧一切校验都是**字符串/存在性**断言（pins 等值、版本号格式、workflow 轴值是否为 pins.json 子集），绝不在仓库侧用 semver 库重算范围。
**When to use:** VER-01 的负向测试、CI 矩阵探针格、任何"这个 DSH 行装不装得上"的判定。
**Example:**
```js
// scripts/compat-probe.mjs（骨架——规划者细化）
// 用法: node scripts/compat-probe.mjs --dsh <runtime-version> --expect install-ok|reject
// 原理: 从 node_modules 定位 @deepseek-ai/dsh 附带的 dsh-app-boot，
//       import { evaluatePluginCompatibility } 对自家 package.json 求值；
//       install-ok → 要求返回 undefined；reject → 要求返回 requirements["engines.dsh"] 非空。
// 不等 → exit 2（gate 口径，与 run-gates.sh 一致）。
```

### Pattern 2: 单文件 pin 真源 + 校验脚本 + 文档位三层

**What:** pin 对齐走三个落点：`scripts/pins.json`（机器可读真源：行号 ↔ engines 窗口 ↔ 三件桥接 pin）、`scripts/check-pins.mjs`（消费真源并对照 package.json 断言，prepack 前不阻断但并入 test 套件）、BUILD.md 新章（人类文档位，记录 refresh 手续）。
**When to use:** VER-02 格式固化、HOOK-05 对齐机制的 Phase 2 前言（Phase 4 才写 runbook 全文）。
**Example:**
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

### Pattern 3: 负向优先（negative-first cells）

**What:** 矩阵里每个轴的"不支持"取值不是省略，而是显式 `expect: reject` 格。这样 Success Criterion 3（拒绝干净可解释）在 CI 里与 Success Criterion 1（矩阵存在）合并验证，一次推流同时拿到支持行证据与拒绝证据。
**When to use:** 前一行（0.2.1-rc.5）两格；未来 DSH 发新行时先以 reject 格入库，等 pin 刷新升级为 ok 格。

### Anti-Patterns to Avoid

- **在多处重复声明同一个 pin/范围值**：package.json 是执行真值，pins.json 是期望表，check-pins 负责两者一致；不要让 README/BUILD.md/CI/脚本各自硬编码版本号（漂移面）。
- **仓库侧 `semver.satisfies` 自建判定**：与宿主 includePrerelease 语义注定分叉；全部判定走探针或纯字符串断言。
- **CI 单元格里跑 `dsh plugin add` 当冒烟**：需要 profile bootstrap/宿主进程环境，成本不成比例；活体安装回归属于 DEV-03 验证实例与 P5 UAT。
- **矩阵轴硬编码版本字符串而不用 pins.json 驱动**：DSH 行 ~每周移动（0.2.2-rc.1 发布于 2026-11-04），轴值必须单点可刷新的。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| engines.dsh 范围语义求值 | 自写 semver 判断器（哪怕引 semver 库） | DSH 运行时 `evaluatePluginCompatibility` 探针 | 宿主以 `{ includePrerelease: true }` 求值，自建语义必然分叉；且该函数是启动期同款实现 |
| registry 事实（pin 是否存在、完整性） | 自建 HTTP 客户端 / 解析 dist 元数据 | `npm view <pkg>@<ver> name version engines peerDependencies --json`（preflight 同款取样）＋ BUILD.md §⑦ 双镜像交叉核对 | npm CLI 已封装 cache/proxy/auth/retry；自建只会漏边角 |
| workflow YAML 语法诊断 | 自写 YAML/工作流语法校验 | actionlint（本地一次安装）或 push 后 GitHub UI 校验 | 官方 CI 语法规则复杂且持续演进 |
| 每格冒烟编排 | 自写并行调度脚本 | `strategy.matrix.include` 原生矩阵 + `fail-fast: false` | 每格独立日志/取证、原生并行、输入覆盖描形 |
| 版本号格式/修订校验 | 发布文档口口相传 | `scripts/check-pins.mjs` 正则校验（格式）+ 修订规则写进 pins.json 邻接文档位 | "未成文规则"正是 02-CONTEXT 认定的现状缺口 |

**Key insight:** 这个 domain 的几乎所有"复杂"都宿在 DSH 运行时与 npm CLI 里；仓库侧的正确形态是一层薄薄的**断言与探针**，任何新增的求值逻辑都是负债。

## Common Pitfalls

### Pitfall 1: 版本号线号里带点号 → 排序彻底失序
**What goes wrong:** `1.20.1-2-dsh0.2` 这类把 "0.2" 直接放进 prerelease 的写法是**合法 semver**，但点号把 prerelease 切成多个 id（实测 parse 结果为 `["2-dsh0", 2]`），导致 node-semver 排序出现 `1.20.1-1-dsh0.2 > 1.30.0-1-dsh0.2` 这种跨 gsd-ver 反序，且 rev 10 与 rev 2 的字典序颠倒（"10-dsh…" < "2-dsh…"）。Phase 3 的 `listVersions`「newest first」列表会直接读这个顺序。
**Why it happens:** prerelease id 以点号分界；字母数字混合 id 按字典序、纯数字 id 按数值序比较。
**How to avoid:** 线号**去点**，rev 用独立数字 id：`1.20.1-<rev>.dsh<line-nodots>`（如 `1.20.1-2.dsh022`，parse 结果 `["2", "dsh022"]`）。rev 数值序天然正确；线号只是人类标签，跨行排序永不依赖。
**Warning signs:** `semver.parse(v).prerelease.length !== 2`（本探针已实证为当前带点形态的 failure signal）；研究文件 §4 探针表的实测输出即可自检。

### Pitfall 2: `includePrerelease: true` 改变"窗口"的真实边界
**What goes wrong:** 用普通 semver 直觉读 `">=0.2.2-rc.1 <0.3.0-0"` 会误判边界。实测（DSH 自身求值函数）：`0.2.3-rc.1`、`0.2.9-rc.1` **通过**（都属于 0.2.x），`0.2.2-alpha.3` **拒绝**（低于 rc.1），`0.3.0-rc.1` 与 `0.3.0-0` **拒绝**（上界拦截生效）。即该窗口真实语义 =「0.2.2-rc.1 起的所有后续 0.2.x prerelease」。
**Why it happens:** 宿主显式以 `includePrerelease: true` 求值（dsh-app-boot 实现直读，见 §2）；与 node-semver 默认的"同 tuple prerelease 才参与"不同。
**How to avoid:** 任何文档/注释对窗口的描述都按这个实测语义写；新增行的窗口变更必须在新 DSH 行上跑探针复核（不是纸面推理）。
**Warning signs:** 只靠 `npx semver`（默认参数）核对 engines 窗口 —— 结论会与宿主不同。

### Pitfall 3: `engines.dsh` 是独裁声明，peer 不是门
**What goes wrong:** 以为 `peerDependencies` 里 `"@deepseek-ai/dsh-skill-filesystem": ">=0.2.2-rc.1 <0.3.0-0"` 也参与兼容判定。实现明确：`engines.dsh` 存在时**独自裁决，peerDependencies 被忽略**（index.js#L1099-1103 直读）。skill-filesystem 的范围只在 pnpm 解析层起作用（且 profile `autoInstallPeers: false`），不是安装拒绝门。
**Why it happens:** 误把 npm 生态的 peer 兼容直觉搬进 DSH 的自定 key 机制。
**How to avoid:** VER-01 的测试断言只针对 `engines.dsh`；peer 范围作为 pin 对齐（check-pins）的一部分，不给它"门槛"叙事。
**Warning signs:** 负向测试里改 peer 范围却期待安装被拒 —— 不会发生。

### Pitfall 4: manifest 缺失/不可读 → 宿主 preflight 静默跳过
**What goes wrong:** 若插件包 `package.json` 的 `name`/`version` 缺失、不可读或解析失败，preflight **continue 跳过**（operations.js#L372-377、L384-386 注释直读），pnpm 照常安装 —— 兼容门对"打包坏了的包"是 fail-open 的。
**Why it happens:** 宿主把"读不到 manifest"留给 pnpm 与安装后检查，避免误杀网络/git 形式的规格。
**How to avoid:** 我们的防线在发布侧：prepack 全链（含 gates）保证包完整性；check-pins 显式断言 name/version 为非空合法字符串。CI 负向用例聚焦"合法 manifest + 不匹配 range"，不测宿主 fail-open 语义。
**Warning signs:** 把"manifest 坏"作为 VER-01 负向用例 → 测不到真正的拒绝契约。

### Pitfall 5: pnpm 侧解析不走 includePrerelease → 文档只准推广 exact spec
**What goes wrong:** 推荐 `dsh plugin add dsh-gsd@^1.20.1` 这类 range。pnpm 用标准 semver（无 includePrerelease）解析，实测 `^1.20.1` 对本方案的全部 prerelease 版本**匹配数为 0**；装 pre-release 版本只靠 exact spec 或 dist-tag（latest）。而 `latest` 是我们自己打的 tag（Phase 3），含义可漂。
**Why it happens:** prerelease 参与 range 是 DSH 求值层的开关，不传导给 pnpm 的 `pnpm view/add`。
**How to avoid:** README/BUILD.md/registry PR 文案一律呈现**精确版本号**命令；升级/回滚示例 = 同命令换 exact 版本（VER-02 字面要求，也是 dshmarket `marketInstallTarget` 的形态 —— 官方实现返回 `name@version` 精确规格）。
**Warning signs:** 任何文档出现 `@^`、`@~`、`@*`、`@latest` 加 dsh-gsd 的组合。

### Pitfall 6: file: 安装是打包冻结快照
**What goes wrong:** 验证实例上改了源码（engines.dsh、检查脚本）后认为"已生效"，实际 profile 里是旧快照 —— SPIKE 曾花 20 分钟排查"patch 被丢弃"假象。
**Why it happens:** `dsh plugin add file:<path>` 按 `files` 字段打 tarball 解包（SPIKE.md 关键调试结论 2）。**但注意**：file: 目录规格同样走 preflight（`namedSpecManifest` 直读 `<path>/package.json`，operations.js#L191-194），所以负向探针可以直接用 doctored package.json 的临时目录验证拒绝文案，而无须 registry。
**How to avoid:** 任何源码变更后 `--force` re-add + 重启 + 新 token（BUILD.md §⑧）；负向活体验证用临时 fixture 目录（不是 profile 目录）避免污染。
**Warning signs:** 复验"没变化"的第一反应是怀疑机制 —— 先核对快照时间。

### Pitfall 7: `private: true` 直接堵死 npm publish（Phase 3 前置）
**What goes wrong:** 当前 package.json:4 `"private": true`。npm 官方行为逐字：`If you set "private": true in your package.json, then npm will refuse to publish it.`（docs.npmjs.com package-json）。Phase 3 若忘记移除，`npm publish` 硬拒。
**Why it happens:** 防误发私有仓库的设计。
**How to avoid:** 本 phase **不动**该字段（也不在 README 宣布 registry 可用性）；Phase 3 任务清单必须显式包含"移除 private → publishConfig 定 registry/tag"。可在 docs-consistency 测试里加一条"若 version 已迁移至新方案则断言 private 仍为 true（未发布前）"的哨兵，防中途翻车。
**Warning signs:** registry PR 提交前 private: true 仍在 —— 立即停止发布链。

### Pitfall 8: "前一行" ≠ "兼容行"，双行支持 = 双版本
**What goes wrong:** 把矩阵"当前行 + 前一行"读成"插件必须同时支持两行"，于是扩大 engines 窗口或做参数化 pin。事实：三件桥接包全部**按行同号发布**（registry 实测：0.2.1-rc.5 与 0.2.2-rc.1 同谱系），且桥接包自身 peers 全部精确 pin `"0.2.2-rc.1"`（registry 实测）；一个包版本 = 一组 pin = 一行。
**Why it happens:** 把 npm 多版本并存直觉套到"资产嵌入 + 行锁定"插件形态上。
**How to avoid:** 矩阵前一行格 = `expect: reject` 的负向格（见 Pattern 3）；真正支持前一行 = 未来用 `dsh021` 线号发**另一个版本**，不回改当前版本。
**Warning signs:** plan 里出现"engines 范围包含 0.2.1"或"pin 随 DSH 行参数化"的设计。

### Pitfall 9: 轴值随 DSH 发布线快速过期
**What goes wrong:** DSH 0.2.x 线以 ~周为单位移动（0.2.2-alpha.3 → 0.2.2-rc.1 仅隔 1 天、0.2.2-rc.1 发布 2026-11-04）。硬编码的 matrix 轴值几个月后就是"当前行+前一行"的历史错位。
**Why it happens:** prerelease 线本身就是移动目标。
**How to avoid:** 轴值唯一来源 = pins.json；BUILD.md 新章写死 refresh 手续（DSH 发新行 → 探针先以 reject 格验证 → pin/窗口刷新 → 格升级 ok → rev 递增发新版本）。CI workflow 从 `github.ref` 无感知，刷新 = 改 pins.json + check-pins 复跑。
**Warning signs:** 两个地方出现不同版本的 DSH 行号。

## Code Examples

### [1] 版本号方案（VER-02 推荐编码，semver 7.8.6 实测合法）

```
dsh-gsd@1.20.1-1.dsh022    # GSD 1.20.1、修订 1、DSH 0.2.2 行（当前行）
dsh-gsd@1.20.1-2.dsh022    # 同（gsd-ver, 行）的第 2 修订（rev 数值序递增）
dsh-gsd@1.20.2-1.dsh022    # GSD 引擎升 1.20.2，rev 归 1
dsh-gsd@1.20.1-1.dsh021    # 若未来发布 0.2.1 行版本（行号去点只作标签）

升级：dsh plugin --profile <name> add dsh-gsd@1.20.2-1.dsh022
回滚：dsh plugin --profile <name> add dsh-gsd@1.20.1-1.dsh022
```

实测依据（本 session 用 DSH runtime 携带的 semver 7.8.6 运行）：
```
0.1.0-gsd1.20.1        -> valid: 0.1.0-gsd1.20.1 | parsed: ["gsd1",20,1]   （现状锚点，合法但旧）
1.20.1-1-dsh0.2        -> valid: 1.20.1-1-dsh0.2 | parsed: ["1-dsh0",2]   （带点=多 id，弃用）
1.20.1-1-dsh02         -> valid: 1.20.1-1-dsh02 | parsed: ["1-dsh02"]     （rev 混进字母 id，rev10 会失序）
1.20.1-1-dsh0.2.2      -> valid: 1.20.1-1-dsh0.2.2 | parsed: ["1-dsh0",2,2]（带点=多 id，弃用）
1.20.1-2-dsh0.2        -> valid, 排序病理：1.20.1-1-dsh0.2 > 1.30.0-1-dsh0.2
plain-range match: ^1.20.1 matches 0 prerelease candidates  （pnpm 侧不认 range，只认 exact/dist-tag）
```

### [2] 矩阵 CI 骨架（VER-03）

```yaml
# .github/workflows/compat-matrix.yml
name: compat-matrix
on:
  push: { branches: [main] }
  pull_request: {}
  workflow_dispatch:
    inputs:
      dsh: { type: string, required: false }
      gsd: { type: string, required: false }
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
          - { dsh: "0.2.1-rc.5", gsd: "1.20.1", expect: reject }    # 前一行：负向格
          - { dsh: "0.2.1-rc.5", gsd: "1.19.0", expect: reject }
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 24 }
      - name: pins 对齐校验（仓库侧静态）
        run: node scripts/check-pins.mjs --offline
      - name: 宿主求值探针（install-ok/reject）
        run: |
          npm install --no-save --ignore-scripts @deepseek-ai/dsh@${{ matrix.dsh }}
          node scripts/compat-probe.mjs --dsh ${{ matrix.dsh }} --expect ${{ matrix.expect }}
      - name: build + gates（GSD 轴，gate A/B/C 内嵌）
        run: GSD_VERSION=${{ matrix.gsd }} node build.mjs
      - name: 完整测试（含真实构建 smoke）
        run: node --test tests/*.test.mjs
```

要点：只依赖官方 registry（npmjs；DSH 的 plugin-manager 自身 fallback 亦为 npmmirror）；无第三方 registry、无 secret、无自托管 runner；`node build.mjs` 的 GSD tarball 走 ④ 号在线档（CI 在线），离线档位纪律不变（BUILD.md §③）。

### [3] check-pins 消费形态（VER-02/HOOK-05 前置的 pin 对齐位）

```bash
node scripts/check-pins.mjs                # 对照 package.json 全项断言（pins.json 驱动）
node scripts/check-pins.mjs --offline      # 跳过 npm view 存在性取样（CI 静态格/离线机）
node scripts/check-pins.mjs --registry=https://registry.npmmirror.com  # 镜像取样（§⑦ 纪律）
```

失败 exit 2（gate 口径），文案列明：版本号格式、`dsh<line>` 与 pins.json 行号、engines.dsh 窗口串、三件 pin 等值的具体不动项。

### [4] 负向 live 探针（DEV-03，验证实例）

```bash
# fixture：临时目录放 doctored package.json（engines.dsh 改为 ">=0.2.0-rc.1 <0.2.1-0"）
dsh plugin --profile gsdtest add file:<fixture-dir>    # 期望：exit 1 + installation rejected 文案
# 留证：stderr 全文 + UTC 时间戳进 verify-evidence.md（BUILD.md §⑧ 证据口径）
# 正向对照：add file:. --force 重装后三项复验全过（runtime-identity / gsd-health / .env 拦截）
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pnpm 直装插件，无兼容判定 | plugin-manager preflight + app-boot 启动检查 + `allow-version` 豁免（compatibility.json） | DSH 0.2.2 线（机制在现网 0.2.2-rc.1 源码/文档中为现形态） | 插件作者可声明门槛并被"干净拒绝"——VER-01 的宿主基础 |
| 插件市场 = 仓库/站点 | 市场 = 单一 JSON index（`dsh-plugin-market-index` format 1）+ `marketInstallTarget(name,version)` 产出精确 `name@version` 安装规格 | 2026-10-02（Agent Note 日期） | Phase 3 registry PR 只写条目数据；安装始终 exact |
| 版本号 `0.1.0-gsd1.20.1`（雏形） | `<gsd-ver>-<rev>.dsh<line>`（rev=数字 id、行号去点）文档化 + check-pins 强制 | 本 phase 计划 | 升级/回滚 = 同命令换 exact 版本，机器可校验 |
| 验证靠人工重跑命令清单 | gates/测试/矩阵单元格 = 共享脚本（run-gates.sh / build.mjs exit 0-1-2 契约已立） | Phase 1 | 本 phase 只新增薄探针层，不改既有契约 |

**Deprecated/outdated:**
- 现行 `version: 0.1.0-gsd1.20.1`：迁移到新方案后废弃（docs-consistency 测试锁定新格式）。
- 「README 用 `github:pfmiles/dsh-gsd` 安装」作为主路径的叙事：GitHub 安装形态受 pnpm build 拦截（host 提醒 allowBuilds），主叙事保持 registry exact 安装。

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | npm/pnpm 对 `engines.node` 默认仅警告（EBADENGINE/Unsupported engine）、对自定义 key（dsh）完全忽略；engine-strict 需显式开启 | Summary/§7 附近 | 低——VER-01 执法已被证实宿在 DSH 层；此条只影响文档措辞 |
| A2 | actions/setup-node@v7 保留 `node-version` 输入契约（未读 v7 README，latest tag 经 API 核实但输入面按 v4 记忆外推） | §3 | 低——若输入改名，workflow 在 push 时即报错，GitHub UI 可速查 |
| A3 | ubuntu-latest runner 默认可达 registry.npmjs.org | §5 | 低——GitHub-hosted runner 出网是常态；若受限可在 plan 加 npmmirror fallback 格 |
| A4 | `<0.3.0-0` 上界的意图是"未来 0.3 稳定线不自动兼容"（需人工评审） | §2 窗口语义 | 中——若 DSH 官方另有上界惯例，调整窗口串即可（check-pins 单点改） |
| A5 | "前一行" = 0.2.1-rc.5（0.2.x 谱系内紧邻的前一个 rc 行），而非 0.1.7-rc.2 | §1 | 中——若 stakeholder 认为前一行指 0.1 线，矩阵轴换值即可，机制不变 |
| A6 | rev 起算为 1（首个发布的 (gsd-ver, 行) 版本 rev=1，之后同对递增） | §4 | 低——纯约定，check-pins 只锁格式不锁起算值 |

## Open Questions

> 状态更新（planner revision iteration 1，2026-11）：Q1–Q5 均已在计划层决议并落地为 02-01/02-02 PLAN 的计划级设计决策 D-R1–D-R5（出处：各 PLAN 的 `<objective>` 决策块）。各条下方保留研究当时原文，标题行以 `(RESOLVED — D-Rx)` 标记决议归属。

1. **前一行是否纳入"支持窗"**（RESOLVED — D-R1：前一行 0.2.1-rc.5 不进支持窗，矩阵前一行两格 = expect: reject 负向格）
   - What we know: pins 行锁定（registry 实测），双行支持 = 双版本；0.2.1-rc.5 的桥接包确已发布。
   - What's unclear: stakeholder 是否愿意为 0.2.1 行另发版本（dsh021）——那属后续发布行为，本 phase 只需负向格。
   - Recommendation: 本 phase 保持 `">=0.2.2-rc.1 <0.3.0-0"`，矩阵前一行格 `expect: reject`；把"支持 0.2.1 行"作为 discuss 议题，若同意也只落在「refresh 手续」文档里，不改本 phase 包。

2. **GSD 轴的第二/第三取值**（RESOLVED — D-R2：GSD 轴 = ["1.20.1","1.19.0"]，本 phase 按 BUILD.md §⑦ 增补 1.19.0 NOTICES 行；1.16.0 不取为轴）
   - What we know: NOTICES 只 canonical 了 1.20.1 行（THIRD-PARTY-NOTICES.md:8）；1.19.0 与 1.16.0 的 dist.integrity/shasum/engines 均已实测可取样（registry），canonicalization 机械可行。
   - What's unclear: 轴取 {1.20.1, 1.19.0}（紧邻）还是加 1.16.0（migration 相关，生产 ~/.dsh 快照版本，STATE.md:38）。
   - Recommendation: 矩阵 GSD 轴 = ["1.20.1", "1.19.0"]，本 phase 按 BUILD.md §⑦ 增补 1.19.0 的 NOTICES 行；1.16.0 作为可选第三格（讨论点）。

3. **`<line>` 编码：`dsh022`（去点）确认度**（RESOLVED — D-R3：dsh022 去点编码落为 package.json version 1.20.1-1.dsh022；README 版本表显式列 dsh022 = DSH 0.2.2 线映射行）
   - What we know: 带点编码合法但排序病理（实测输出见 §4）；VER-02 锁定的是语义模板，表达在 discretion。
   - What's unclear: 用户是否介意行号去点（"022" 对读不如 "0.2.2" 直观）。
   - Recommendation: 采用 `1.20.1-<rev>.dsh022`，README 版本表显式列出「dsh022 = DSH 0.2.2 线」的映射行。

4. **CI 实际激活时点**（RESOLVED — D-R4：Phase 2 只交付 workflow 文件 + 本地验证，push 与 CI 首绿遵循 Phase 3 建仓计划）
   - What we know: 本地 ahead 33 未推（STATE.md）；CONTEXT 明确"push 是 Phase 3 发布步的前置，不阻塞本 phase 交付 workflow 文件"。
   - What's unclear: 是否在本 phase 就 push（激活 CI 恰恰是 VER-03 的证据闭环）。
   - Recommendation: Phase 2 交付 workflow + 本地语法校验（actionlint，缺失则安装或人工 Review）+ 与 pins.json 的一致性测试；push 与首绿遵循 Phase 3 建仓计划，若 stakeholder 希望提前验证，push 一次 main 的 cost 可忽略（属发布域 decision）。

5. **check-pins 是否进 prepack 链**（RESOLVED — D-R5：并入 test 套件——tests/compat-matrix.test.mjs ⑥ spawn --offline 消费；prepack 链不动）
   - What we know: prepack = `node build.mjs && node --test tests/*.test.mjs`（package.json:45）；发布链契约已固化。
   - What's unclear: pin 校验放 tests 内（CI/prepack 都覆盖）还是 prepack 前置（多一道独立 exit）。
   - Recommendation: 并入 test 套件（check-pins 自身作为 tests/ 的调用面），prepack 链不动——保持"发布契约唯一变化点最少"。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build.mjs / node:test | ✓ | v24.21.0 | — |
| npm CLI | npm view / npm pack（pin 取样、GSD 在线档） | ✓ | 12.2.1 | pnpm 12.11.2（可替 view） |
| bash + grep + tar | run-gates.sh / build.mjs 解包 | ✓ | macOS system | — |
| git | 提交（commit_docs） | ✓ | ahead origin/main 33 | — |
| gh CLI | （可选）workflow 查看 | ✓ | homebrew | — |
| DSH runtime | 宿主源码取证、探针 | ✓ | 0.2.2-rc.1（本机 global，与 npm latest 一致） | — |
| actionlint | workflow 本地语法验证 | ✗ | 未安装 | `brew install actionlint` 或一次人工 Review + push 后 GitHub UI 校验 |
| registry.npmjs.org | pin 取样 / GSD tarball ④ 档 / CI 单元 | ✓ | 本 session 多次 npm view 全通 | BUILD.md §③/§⑦ 既有纪律（npmmirror 对照） |
| GitHub Actions | 矩阵实际运行 | ✗（未 push） | repo 已建仓 pfmiles/dsh-gsd | Phase 3 push 后激活；本 phase 本地验证 |

**Missing dependencies with no fallback:** none（CI 运行依赖 push，已按 CONTEXT 归 Phase 3 前置，不阻塞交付物）。

**Missing dependencies with fallback:** actionlint（本地语法验证）。

## Validation Architecture

> `.planning/config.json` `workflow.nyquist_validation: true` → 本节必填。Nyquist 会按本节核对，规划者须把以下断言落入 plan。

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node 内置 `node:test` + `node:assert/strict`（无第三方、零安装） |
| Config file | none —— 既有 glob 形态 `node --test tests/*.test.mjs`（Node v24.21.0 实测目录参数机械失败，glob 形态已固化于 STATE.md 决策） |
| Quick run command | `node --test tests/*.test.mjs` |
| Full suite command | `node build.mjs && node --test tests/*.test.mjs`（= prepack，gates 内嵌 build） |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VER-01 | 不兼容安装被宿主干净拒绝（requirements 键 `engines.dsh` 非空 + 拒绝文案含 allow-version 指引） | integration（宿主自家求值函数） | CI 单元：`npm i --no-save @deepseek-ai/dsh@<line> && node scripts/compat-probe.mjs --dsh <line> --expect reject`（matrix 前一行 2 格） | ❌ Wave 0（scripts/compat-probe.mjs 待建） |
| VER-01 | 兼容安装不被误拒（0.2.2-rc.1 → install-ok） | integration | 同上 `--expect install-ok`（当前行 2 格） | ❌ Wave 0 |
| VER-01 | 活体拒绝日志可解释（人读留证） | manual-only（DEV-03） | §「Code Examples [4]」负向 file: 探针 + verify-evidence.md | —（验证实例活体） |
| VER-02 | 版本号方案格式 parse/validate（`<gsd-ver>-<rev>.dsh<line>`，rev 纯数字 id、行号去点） | unit | `node --test tests/version.test.mjs` | ❌ Wave 0 |
| VER-02 | README/BUILD.md 示例与规范一致（示例含升级/回滚同命令换 exact 版本） | static | `node --test tests/docs-consistency.test.mjs` | ❌ Wave 0 |
| VER-03 | `.github/workflows` 存在矩阵 CI；轴值为 pins.json 声明子集且含当前+前行（0.2.2-rc.1/0.2.1-rc.5）；expect 列与支持窗一致 | static | `node --test tests/compat-matrix.test.mjs`；CI 首批绿 = push 后（Phase 3） | ❌ Wave 0 |
| VER-03 | 每格「build + gates + tests」通过 = 该 (DSH 行 × GSD 版本) 的构建/冒烟记录 | integration | 矩阵单元 `GSD_VERSION=<gsd> node build.mjs && node --test tests/*.test.mjs` | —（CI 运行，本地可等价复跑） |
| VER-04 | `engines.node: ">=24"` 与上游 GSD engines 一致、README 双语声明 Node ≥ 24 | static（对照 NOTICES/registry 记录取样） | `node --test tests/docs-consistency.test.mjs` | ❌ Wave 0 |
| DEV-03 | 本 phase 完成物在 gsdtest 验证实例 gate 通过（含负向探针） | manual-only（活体） | BUILD.md §⑧ 复验序 + 负向 [4]；证据口径（可观察输出 + UTC 时间戳 + 新快照声明） | —（沿用 verify-evidence.md 形式） |

### Sampling Rate

- **Per task commit:** `node --test tests/*.test.mjs`（预计既有 7 + 新增 3 套，< 8 min，含真实构建 smoke 的 420s 上限口径）
- **Per wave merge:** `node build.mjs && node --test tests/*.test.mjs`（= prepack）
- **Phase gate:** prepack 全绿 + gsdtest 验证实例正向三项复验 + 负向拒绝探针，证据落 verify-evidence.md，之后才允许 `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `scripts/pins.json` — pin/行对齐真源（check-pins 与 workflow 轴的共同消费方）
- [ ] `scripts/check-pins.mjs` — VER-02/HOOK-05 前置校验器（exit 2 gate 口径）
- [ ] `scripts/compat-probe.mjs` — VER-01 宿主求值探针（CI 单元执行件）
- [ ] `tests/version.test.mjs` — 版本方案格式单测
- [ ] `tests/compat-matrix.test.mjs` — workflow 存在性/轴值与 pins.json 一致性
- [ ] `tests/docs-consistency.test.mjs` — engines 声明 ↔ README 双语一致性
- [ ] `.github/workflows/compat-matrix.yml` — 矩阵 CI 本体（Success Criterion 1 的交付物）
- [ ] BUILD.md 新增「版本与 pin 对齐」章 + README 新版本号示例（Success Criterion 2 的文档位）
- [ ] local 语法验证：`actionlint` 未装 → Wave 0 装或替代为一次人工 Review（见 §11）

## Security Domain

> `.planning/config.json` `security_enforcement: true`（ASVS level 1）→ 本节必填。

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | 本 phase 无认证面 |
| V3 Session Management | no | 无会话态新增 |
| V4 Access Control | no | 无访问控制新增 |
| V5 Input Validation | yes | GSD_VERSION 格式 gate 既有（`/^\d+\.\d+\.\d+$/` → exit 2，build.mjs:242）；版本号方案校验（check-pins，正则白名单）；engines.dsh 串=字符串表白名单 |
| V6 Cryptography | no | 不新增密码学；既有 SHA-512/SHA-1 完整性对照消费不动 |
| V14 Configuration | yes | engines/pins 声明集中化（pins.json 真源 + check-pins drift 断言），防配置漂移弱化兼容门 |

### Known Threat Patterns for 插件版本/兼容矩阵（STRIDE）

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| pin 漂移（桥接包版本与 DSH 行错位 → 运行时行为不可解释） | Tampering | check-pins 静态强制 + NOTICES 完整性纪律（§⑦）复用 |
| 市场/文档给出 range 安装规格 → 用户装不到或被装错版本 | Spoofing（体验面） | 全部文档只呈现 exact spec；docs-consistency 测试锁定 |
| `allow-version` 豁免绕过兼容门 | Elevation of Privilege | 宿主既有强制（acceptRisk + 精确 pair + 警告文案）；插件侧在 README 声明风险与不建议，不新增对抗层 |
| CI 单格离线/超时假红假绿 | Denial / 误报 | 已有 canBuild 探测 skip 语义（build-smoke WR-02）沿用；workflow `timeout-minutes` + `fail-fast: false` 保格间独立 |
| doctored 负向 fixture 混入 profile | Tampering（自伤面） | 负向探针只用临时目录 `add file:<fixture>`，不复用产品树；用后即弃 |

## Sources

### Primary（HIGH confidence — 本 session 直读源码/执行实测）

- DSH runtime source（本机 `/Users/yue.weny/.nvm/versions/node/v24.21.0/lib/node_modules/@deepseek-ai/dsh/`，版本 0.2.2-rc.1，与其 npm dist-tag latest 一致）：
  - `node_modules/@deepseek-ai/dsh-plugin-manager/lib/types/operations.js:355-390`（install preflight 拒绝段）+ `:189-209`（namedSpecManifest，file:/registry 规格的 manifest 读取）+ `:333-354`（清单/锁文件快照回滚）
  - `node_modules/@deepseek-ai/dsh-plugin-manager/README.md`（§Version compatibility and exemptions：preflight 时序、`incompatible-version` 码、compatibility.json、saveExact、registry plan npmjs→npmmirror）
  - `node_modules/@deepseek-ai/dsh-app-boot/lib/index.js:1094-1095`（`satisfies` = semver.satisfies + includePrerelease:true）、`:1097-1116`（engines.dsh 独裁/peers 忽略）、`:1151-1154`（拒绝警告文案）、`:1806-1807`（启动期 bundle 拒绝加载）
  - `node_modules/@deepseek-ai/dsh-app-boot/lib/types/plugin-compatibility.d.ts`（求值合同语）
  - `node_modules/@deepseek-ai/dsh-plugin-market-index/README.md`（市场 index format 1、marketInstallTarget = 精确 name@version）
  - `lib/plugin-DscIHF4k.js:96-97`（CLI 打印 allow-version 补救命令与诊断 log 路径）
  - `node_modules/semver/package.json`（version `"7.8.6"`；全部版本号探针用其执行，输出见 §4）
- npm registry 实测（2026-11-11，registry.npmjs.org）：
  - `@deepseek-ai/dsh` dist-tags `{ latest: '0.2.2-rc.1', alpha: '0.2.2-alpha.3', next: '0.2.2-rc.1' }`；完整版本/时间线（0.1.2 → 0.1.7-rc.2；0.2.0-rc.1 → 0.2.2-rc.1，2026-11-04）；`0.2.1-rc.5` tarball 可装
  - `@deepseek-ai/dsh-hooks-claude-code` / `dsh-hook-protocol` / `dsh-skill-filesystem` 版本谱系（均至 0.2.2-rc.1，且含 0.2.1-rc.5）；hooks-claude-code@0.2.2-rc.1 的 peers 全部精确 `"0.2.2-rc.1"`；两者 engines 字段均缺省
  - `@opengsd/gsd-core@1.20.1` engines `{ "npm": ">=10.0.0", "node": ">=24.0.0" }`（1.19.0、1.16.0 同值）；1.19.0/1.16.0 dist.integrity+dist.shasum 可取；dist-tags `{ latest: '1.20.1' }`
- GitHub API（2026-11-11）：`repos/actions/checkout/releases/latest` → `v7.0.1`（2026-07-20）；`repos/actions/setup-node/releases/latest` → `v7.1.0`（2026-10-08）
- npm 官方文档（docs.npmjs.com/cli/…/package-json），逐字引用：
  ==DATA_x7k3q9z_START==
  If you set `private: true` in your package.json, then npm will refuse to publish it.
  ==DATA_x7k3q9z_END==
- node-semver 官方 README（raw.githubusercontent.com/npm/node-semver/main/README.md#prerelease-tags），逐字引用：
  ==DATA_m2p8v4hq_START==
  If a version has a prerelease tag (for example, `1.2.3-alpha.3`) then it will only be allowed to satisfy comparator sets if at least one comparator with the same `[major, minor, patch]` tuple also has a prerelease tag.
  ==DATA_m2p8v4hq_END==
- In-repo truth（本 session 直读）：package.json（version/private/engines/deps/pins/prepack）、build.mjs（GSD_VERSION 格式 gate、四档、gates 内嵌）、tests/run-gates.sh（A/B/C、exit 0/1/2）、tests/build-smoke.test.mjs（7 组断言 + WR-01/02）、BUILD.md（§①-⑧ 全契约）、SPIKE.md（机制与快照教训）、README.md:38-46（环境要求双语）、THIRD-PARTY-NOTICES.md:8（1.20.1 canonical）、STATE.md（历史与决策）、.planning/config.json（nyquist/security 开启）、02-CONTEXT.md（锁定决策）

### Secondary（MEDIUM confidence）

- 项目规划文档交叉印证：ROADMAP.md、PROJECT.md、REQUIREMENTS.md（与 STATE/CONTEXT 一致）

### Tertiary（LOW confidence — 仅作线索，未采信为事实）

- Web 检索命中的 dependabot/仓库 PR 页面（指向 setup-node v5/v7 存在性；真值已改由 GitHub API 核实）

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH —— CI action 版本经官方 API 实测；测试框架为零安装既定约定
- Architecture: HIGH —— 宿主求值/拒绝链路全部源码级直读 + 一次真实函数执行探针
- Pitfalls: HIGH —— 排序病理、includePrerelease 边界、engines 独裁、file: 快照均由本 session 实测或源码直读；npm/pnpm engines 默认行为为 LOW（ASSUMED A1）
- Versioning scheme 语法合法性: HIGH（semver 7.8.6 逐条实测）；修订惯例: MEDIUM（约定面）

**Research date:** 2026-11-11
**Valid until:** 2026-11-25（机制部分稳定可推 30 天；DSH/GSD 矩阵轴值按发布节奏单独 refresh——手续写入 BUILD.md 新章）
