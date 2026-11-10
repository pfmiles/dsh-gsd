# Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用） - Research

**Researched:** 2026-11-10
**Domain:** npm-package build pipeline (fetch → stage → rewrite → gate), Node ≥24
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### 构建取源（PRD locked：INST-02 / SKIL-03，ROADMAP SC2-4）
- 构建源必须是 `@opengsd/gsd-core@<GSD_VERSION>` npm tarball，不再依赖任何本机部署路径；`GSD_BUILD_SOURCE` 仅作为 SPIKE 遗留兼容入口，不作为主路径。
- 复用官方安装器的 `--claude` staging 通道（与 install-gsd-dsh.sh 的 stage 段同逻辑）；改写映射基准 = staging 根，禁止出现 `/Users/...` 或 `~/.dsh` 字面量依赖。
- 改写需覆盖 `~/`、`$HOME` 形态的回退映射（除 staging 根基准外）。
- 产出必须通过校验 gate：任意 SKILL.md 中残留机器特定绝对路径 ⇒ 构建失败；fetched 版本 != requested 版本 ⇒ 构建失败。
- 产物含 `gsd-core/`、`skills/`、`hooks/`、`config/`、`scripts/`（兄弟目录齐备，杜绝 MODULE_NOT_FOUND）。构建产物不入 git；`prepack` 全量重建。
- 独立 CLI 验收（SKIL-03）：`node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 从 repo 产物直接输出 `@opengsd/gsd-core` + 请求版本。
- 72 个 SKILL.md 各恰好一个 runtime_note adapter 块（构建期注入），零残留绝对路径（SKIL-04）。
- 默认目标版本沿用当前已验证快照 `1.16.0`（STATE.md 已锁定），首个打包脚本以该版本为缺省。

### 验证与达成（PRD locked：DEV-03）
- 本 phase 全部完成物必须在验证实例（gsdtest profile @ 127.0.0.1:3091）上 gate 通过：`--force` 重装 → 重启 → `/gsd-health` + 独立 CLI + `.env` 拦截三项复验。
- 构建在任何离线/在线环境下都能产出与当前等效的产物树（ROADMAP SC1）。

### 文档（PRD locked：INST-02 / SKIL 组）
- 构建流程文档化：GSD_VERSION 用法、staging 通道说明、离线/在线行为、失败模式与修复。
- README/FAQ 与既有决策保持一致：零安装脚本、hook 行为保持上游 basename 规则（不新建扩展）。

### 打包与安装形态（既有决策，延续不破坏）
- 装机侧零动作（零安装脚本）；构建只发生在发布侧（prepack）。
- 插件包路径契约不变：`$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` 为 runtime 路径锚点。
- `engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"` 暂不改（属 P2）。

### Claude's Discretion
- 离线回退机制的具体实现（本地 .tgz 缓存 / npm cache / `--offline` / 显式离线报错）——由 researcher 调查、planner 落为可执行方案。
- thanks/SBOM 清单的字段粒度（上游版本、许可、来源 URL）——满足 PUB-04 精神即可，P3 发布前再精化。
- staging 临时目录与产物捕获的实现细节（tmp 命名、清理策略、失败留痕）。
- 构建脚本的错误文案与 exit code 约定。
- 是否在 build.mjs 内做 tarball 完整性校验（sha512 / integrity）——遵循 npm pack 默认行为即可。

### Deferred Ideas (OUT OF SCOPE)

- 版本号方案 `<gsd-ver>-<rev>-dsh<line>` 与 engines.dsh 收紧 — Phase 2
- CI 兼容矩阵（DSH 行 × GSD 版本）— Phase 2
- npm + GitHub + dshmarket 发布、LICENSE 细项 — Phase 3
- 迁移 runbook 与并存差异表 — Phase 4
- 干净机器 8 项全量 UAT、启动开销量化 — Phase 5
- GSD_PROFILE=core 精简档（dsh-gsd-core 子包）— Backlog
- tui/headless profile 兼容验证 — Backlog
- secret-read-guard 内容级判定收紧 — Backlog（已决：保持上游 basename 行为）

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SKIL-03 | 独立 CLI：`runtime-identity --raw` 输出 `@opengsd/gsd-core` + 版本（scripts/ 兄弟目录齐备） | Staging capture of `scripts/` (§Summary, §Pipeline)；今日实测 repo 产物与 staging 产物均输出正确 JSON（§Environment）；smoke test 断言（§Validation） |
| SKIL-04 | SKILL.md 无机器特定绝对路径（改写 + 校验 gate） | staged 内容的路径形态普查（61+152 文件含 staging 根，§Pitfalls）；gate 命令（§Code Examples） |
| INST-02 | 安装不写 `~/.dsh` 受管文件 | 产物树不含 `~/.dsh` 字面量（§Pitfalls P3 扫描）；验证实例重装复验属 01-03（§Validation DEV-03） |
| DEV-03 | 完成物在验证实例 gate 通过 | 3091 实例在线（§Environment）；手动验收命令序列（§Validation） |

</phase_requirements>

## Summary

build.mjs 换源的全部机制已在本机实证，无需再假设：`@opengsd/gsd-core@1.16.0` 在 npm registry 上存在（发布 2026-11-05T14:33:23Z，周下载 24,534），`npm pack` 可确定性取回 tarball `opengsd-gsd-core-1.16.0.tgz`（5.3 MB / 1125 files）；官方安装器以 `CLAUDE_CONFIG_DIR=<staging> node <pkg>/bin/install.js --claude --global` 落盘一套含 `skills/`（72 个 `gsd-*`）、`gsd-core/`（含 `VERSION` 文件）、`hooks/`、`scripts/` 的 staging 树，其中 skills 里 61 个文件、gsd-core 里 152 个文件含 staging 根绝对路径——这正是 01-02 改写映射的 from 基准。已实测：从 npm tarball 出发的 staging 产物与当前 repo 产物（SPIKE 版）树结构等价，`runtime-identity --raw` 两侧都输出 `{"packageName":"@opengsd/gsd-core","version":"1.16.0"}`。

**Primary recommendation:** 取源走「`npm pack --pack-destination .gsd-build-tmp/` → `tar xzf` → 官方 `--claude` staging → 只拷贝 4 棵树进 repo → 以 staging 根为 from 基准改写 + 注入 adapter + 双 gate」，离线主机制 = 本地 `.tgz` 文件（`GSD_TARBALL` 或 `.build-cache/` 缓存），**不要依赖 npm cache `--offline`**（本机实测 ENOTCACHED，见 Pitfall 1）。staging 产物里的 `settings.json`、`agents/`、`.gsd-*` 概不拷贝——它们携带本机 node 路径与 staging 路径，是最大的机器耦合陷阱。

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| tarball 取源（pack/unpack/版本预校验） | Build pipeline（build.mjs） | npm CLI（外部依赖） | 发布侧行为；npm 负责 registry 交互与 integrity 校验 |
| 官方 --claude staging | Build pipeline | 上游 install.js（外部） | 锁定决策：复用官方通道，绝不重写安装器逻辑 |
| 路径改写 + adapter 注入 + gate | Build pipeline | — | 机器无关映射是 P1 的核心增值，属于本仓库 |
| 产物运行时（standalone CLI / skills / hooks） | Engine runtime（包内资产） | DSH host | 产物在插件路径 `$DSH_PROFILE_DIR/node_modules/dsh-gsd` 上自足运行 |
| 验证实例复验（DEV-03） | Ops/Manual tier | 01-03 plan | 需要运行中的 DSH 实例，无法在 CI 内自动化 |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node built-ins（`node:fs/promises`, `node:child_process`, `node:path`） | Node ≥24 (实测 v24.21.0) | 全管线 IO + spawn 官方 install.js | 零新依赖；当前 build.mjs 已全用 built-ins |
| `@opengsd/gsd-core` | **1.16.0**（fetch-time，非 runtime dependency） | 构建源 tarball | 锁定决策；1.16.0 存在并可打包 [VERIFIED: npm registry] |
| npm CLI | ≥10.0.0 [VERIFIED: tarball package.json engines，原文 `"engines": { "node": ">=24.0.0", "npm": ">=10.0.0" }`]（实测 12.2.1） | registry 客户端（`npm pack`） | 官方包自身声明的门槛 |
| `node:test` | Node 内置 | 构建 smoke 测试 | 零依赖；Node 24 `node --test` 直接可用 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| system `tar` / bsdtar | 实测 3.5.3 | 确定性解包 .tgz（不经 npm install） | 取源第 2 步；避免 npm install 引入 lockfile 与 lifecycle |
| system `shasum`/`node:crypto` | — | 本地 .tgz 完整性校验 | 仅离线本地文件路径；在线路径由 npm pack 自校验 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `npm pack` + `tar` | `npm install --prefix` 取包 | install-gsd-dsh.sh 的官方回退路径 [VERIFIED: install-gsd-dsh.sh:362-368]；但引入 lockfile/缓存副作用，仅作文档化兜底，不进主链 |
| staging 后拷贝 4 棵树 | 拷贝 staging 全部 | settings.json/agents 携带机器路径（实测）——必须白名单拷贝 |

**Installation:** 本 phase 零新增 runtime 依赖；package.json `dependencies`/`peerDependencies` 不动。唯一外部取件发生在构建期。

**Version verification:** `npm view @opengsd/gsd-core@1.16.0` 已返回 version/dist.tarball/dist.integrity/dist.shasum；`npm pack` 实跑成功（见 Environment）。缓存中另有 1.20.0/1.20.1（本机 npm cache 观测），但目标版本锁定 1.16.0，不在本 phase 讨论。

## Package Legitimacy Audit

> Phase 引入的唯一外部包（build-time fetch）。已跑 Package Legitimacy Gate。

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| @opengsd/gsd-core | npm（实测配置 registry = https://registry.npmmirror.com；canonical 亦可达） | published 2026-11-05T14:33:23Z（≈5 天） | 24,534/wk | git+https://github.com/open-gsd/gsd-core.git | SUS（seam 输出 reasons: `["too-new"]`） | Keep + 人行确认 |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `@opengsd/gsd-core` — `too-new` 是"每版发布即新"的固有信号（1.16.0 发布于 5 天前）；该包即本机已部署运行中的同一个官方引擎（`~/.dsh/gsd-core` 与其同源、`runtime-identity` 输出一致），legitimacy 高于一般 `too-new` 包。planner 仍须在 01-01 加 `checkpoint:human-verify`（确认 1.16.0 就是要取的官方版本）。

## Architecture Patterns

### System Architecture Diagram

```
GSD_VERSION ──► build.mjs
                 │ ① fetch                    [online] npm pack → registry
                 │     └─ [offline] GSD_TARBALL / .build-cache/*.tgz → tar xzf
                 ▼ ② pre-gate     package.json.version == requested ? (≠ → exit 2)
                 │ ③ stage        CLAUDE_CONFIG_DIR=<tmp> node pkg/bin/install.js --claude --global
                 │    staging/ = skills/(72) gsd-core/ hooks/ scripts/ settings.json agents/ .gsd-*
                 ▼ ④ capture      copy ONLY skills/gsd-* gsd-core/ hooks/ scripts/ → repo
                 │ ⑤ rewrite      from=staging-root → PLUGIN_ROOT_REF / $DSH_HOME (+ ~/ $HOME fallback)
                 │ ⑥ inject       strip 两种 adapter 标记 → 注入 runtime_note（72 份）
                 ▼ ⑦ gate         ─ absolute-path + version 双 gate（FAIL ⇒ exit 2）
                 ► 产物（不入 git）→ prepack 打包 → 验证实例 --force 重装（01-03）
```

### Recommended Project Structure

```
dsh-gsd/
├── build.mjs                 # P1 重写对象：fetch/stage/capture/rewrite/gate
├── build/                    # 提交入库的构建资产（新）
│   ├── assets/gsd-hooks.json # config/gsd-hooks.json 的 canonical 模板（拷贝源替代 staging）
│   └── lib/rewrite-map.cjs   # 改写映射提取为可单测纯模块（Wave 0）
├── tests/                    # 新：node:test smoke
├── .gsd-build-tmp/           # 已被 .gitignore 覆盖的 staging/work 目录（复用，勿新建名）
├── .build-cache/             # [新建] 加到 .gitignore；离线 .tgz 缓存位
├── skills/ gsd-core/ hooks/ config/ scripts/   # 只写产物，不入 git
└── .planning/ …
```

### Pattern 1: Stage-then-rewrite（官方契约，锁死）
**What:** 官方安装器把 `@<path>` 引用重写到 throwaway staging 根；消费方再把 staging 根重写到自己目标。源码证据：install-gsd-dsh.sh:441-442 注释原文 `"The official installer rewrote every @<path> reference to the throwaway staging root; repoint them at the real deployment so the model's Reads resolve."`，落盘动作 `GSD_FROM="$STAGING" GSD_TO="$DSH_HOME" node "$NODE_REWRITE" "$DSH_HOME/skills"` + 同式 `gsd-core`（:463-464）。
**When to use:** P1 的 ⑤；from 前缀 = mktemp 出来的 staging 根，永远不是部署前缀。实测 staged `skills/gsd-plan-phase/SKILL.md` 含 `@/tmp/gsd-stage-a.FheGZr/gsd-core/workflows/plan-phase.md`。
**Example:**
```js
// build/lib/rewrite-map.cjs（Wave 0 新文件；from 为运行时 staging 根）
export function makeRewrites(stagingRoot) {
  const P = '$DSH_PROFILE_DIR/node_modules/dsh-gsd'
  return [
    [`${stagingRoot}/gsd-core`, `${P}/gsd-core`],
    [`${stagingRoot}/skills`,   `${P}/skills`],
    [`${stagingRoot}`,          '$DSH_HOME'],          // 兜底
    ['~/.dsh/gsd-core', `${P}/gsd-core`],              // 锁定决策：~/ 回退形态
    ['~/.dsh/tasks',  '$DSH_HOME/tasks'],
    ['~/.dsh',        '$DSH_HOME'],
  ]
}
```

### Pattern 2: 离线回退链（SC1 的主机制 — Claude's Discretion 的答案）
**What:** 主机制 = 本地 `.tgz` 文件，不是 npm cache。回退链：
1. `GSD_TARBALL=<path.tgz>`（显式）→ 2. `.build-cache/opengsd-gsd-core-<ver>.tgz`（repo 内缓存）→ 3. `GSD_PACKAGE_DIR=<unpacked>`（与官方安装器同名契约，含 `bin/install.js`）→ 4. `npm pack`（在线）→ 5. 失败：显式报错文案 + 指向 BUILD.md。
**When to use:** 探测顺序固定；任何一档拿到 .tgz 后统一走 `tar xzf` 解包（确定性），且对 ① 档执行 shasum 校验（②③④ 档由 npm/人肉眼负责）。
**Anti-Patterns to Avoid**
- **拷贝 staging 全树**：settings.json 实测烘焙 `"/Users/yue.weny/.nvm/versions/node/v24.21.0/bin/node"`（第一次项候选）——机器耦合，白名单拷贝 4 棵树。
- **用 `npm install` 取包替代 `npm pack`+`tar`**：引入 lockfile 与缓存语义，可复现性变差；只保留为文档化兜底。
- **改上游文件**：任何对 staging 产物内文件的 patch 都只能走 Rewrite 映射/adapter 注入，禁止手工编辑上游文件制造与官方包的漂移。

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 官方安装器的 staging/路径改写 | 重写一份"轻量版" staging | `node <pkg>/bin/install.js --claude --global`（CLAUDE_CONFIG_DIR=staging） | 锁定决策；上游 14k 行安装器处理 profile/迁移/hook 注册，重写即漂移 |
| tarball 完整性校验（在线） | 自己下载+hash | `npm pack`（registry 声明 integrity，npm 自动校验） | npm 官方语义 |
| 本地 .tgz 完整性校验（离线） | 无校验信任 | `shasum -a 512`/`node:crypto`，对照 SBOM 记录的 dist.shasum | 本地文件绕过了 npm 校验层 |
| DSH hooks 桥接配置 | 从 staging settings.json 二次派生 | repo 提交的 canonical `build/assets/gsd-hooks.json`（已证实与 install-gsd-dsh.sh 模板 byte 相同） | settings.json 是 Claude 形态且含机器路径 |
| 测试框架 | 引入 vitest/jest | `node --test`（内置） | phase 只需 smoke 级断言，零依赖 |

**Key insight:** 该 phase 唯一"复杂"的部分是取源与改写，二者都有已被验证的上游契约（npm pack + 官方 --claude + GSD_FROM/GSD_TO 重写），正确姿势是"调用 + 白名单拷贝 + 纯文本重写"，而不是任何形式的再实现。

## Common Pitfalls

### Pitfall 1: npm cache 不能当离线机制（ENOTCACHED）
**What goes wrong:** `npm pack @opengsd/gsd-core@1.16.0 --offline` 在缓存已暖（cache 里确有该 tgz：`request-cache:https://cdn.npmmirror.com/packages/%40opengsd/gsd-core/1.16.0/gsd-core-1.16.0.tgz`）时仍失败。实测原文 [VERIFIED: 本机 npm 12.2.1 输出]：
```
npm error code ENOTCACHED
npm error request to https://registry.npmmirror.com/@opengsd/gsd-core/-/gsd-core-1.16.0.tgz failed: cache mode is 'only-if-cached' but no cached response is available.
```
**Why it happens:** 镜像 registry 的 tarball URL 是 302 重定向到 `cdn.npmmirror.com`；缓存键落在重定向后的 cdn URL 上，`--offline` 按重定向前 URL 查缓存 → miss。（归因部分为推断，[ASSUMED] 见 A1；但"不可用"本身是实测。）
**How to avoid:** 离线主机制 = 本地 .tgz 文件（Pattern 2），文档明写"npm cache 不保证离线可用"。
**Warning signs:** 构建脚本里出现 `--offline`/`--prefer-offline` 字样即视为未按本研究执行。

### Pitfall 2: staging 里躺着机器耦合资产（settings.json / agents）
**What goes wrong:** 白名单漏写会把 `settings.json`（烘焙绝对 node 路径 + staging 路径）、`agents/`、`.gsd-*`、manifest 拷进产物，gate 若只扫 skills/ 就漏网。
**Why:** 官方安装器为 Claude 全局安装生成这些文件；`command -v node` 的机器值被写入。
**How to avoid:** 拷贝表为硬编码 4 项（`skills/gsd-*`, `gsd-core`, `hooks`, `scripts`）；gate 扫描全部产品树（含 hooks/gsd-core/scripts）。

### Pitfall 3: fetched != requested 没在 stage 前拦下
**What goes wrong:** 版本错误（如 `latest` 漂移）直到收尾才发现，浪费一次 staging。
**Why:** staging 是一次完整安装器运行，代价高。
**How to avoid:** 两道 gate：stage 前 `node -p "require('<unpack>/package/package.json').version"`（install-gsd-dsh.sh:374-377 同款，原文 `"ERROR: fetched version $ACTUAL != requested $GSD_VERSION"`）；stage 后复查 `gsd-core/VERSION`（实测内容恰为 `1.16.0`）。
**Warning signs:** 产物 `gsd-core/VERSION` 与 package.json version、GSD_VERSION 三者不一致。

### Pitfall 4: adapter 双标记与二次构建
**What goes wrong:** 重复注入产生一个技能两个 adapter 块（SKIL-04 明确"各恰好一个"）。
**Why:** 上游产物 1.16.0 实测 0 个 adapter 块，但历史部署/重跑会残留两种标记（`begin` 与 `begin (regenerated by install-gsd-dsh.sh)`）。
**How to avoid:** 注入前 strip 两种形式（当前 build.mjs:63 ADAPTER_BLOCK 正则已是正确形态）；注入后计数断言 = 72。

### Pitfall 5: staged 内容含 `$HOME`/`~` 合法形态，gate 不能一刀切
**What goes wrong:** gate 若直接拒绝一切 `$HOME`/`~/` 会误杀上游合法可移植惯用语（实测 skills 中 4 文件含 `$HOME`，主要是 `${CLAUDE_CONFIG_DIR:-$HOME/.claude}` 这类运行时解析器；2 文件含叙述性 `~/.claude`）。
**Why:** 上游原文混用"机器绝对路径"与"可移植占位形态"。
**How to avoid:** gate 只拒两类：(a) staging 根前缀；(b) `/Users/<name>|/home/<name>|/root/` 式绝对路径；`$HOME`/`~` 属回退改写目标（锁定决策），不在拒绝集。

### Pitfall 6: 构建期跑安装器受 HOME/环境影响
**What goes wrong:** 安装器读真实 HOME/PATH 生成内容 → 同一 GSD_VERSION 在不同机器产出不同 settings.json（不影响 4 棵树，但影响可复现性观感与遗留物）。
**Why:** 安装器以 config dir 为 staging 根，但 node 路径等取自环境。
**How to avoid:** staging 进程 env 显式注入 `HOME=<.gsd-build-tmp/fakehome>` + 预留 `PATH`；staging 目录用 `mktemp -d .gsd-build-tmp/staging.XXXXXX`，`trap` 清理。实测（fake HOME）安装器零 stray 写入。

## Code Examples

Verified patterns from real runs this session:

### 取源 + staging + 捕获（01-01 核心骨架）
```bash
# Source: install-gsd-dsh.sh:381-387（官方 --claude staging 契约）+ 本 session 实测
STAGING="$(mktemp -d "$REPO/.gsd-build-tmp/staging.XXXXXX")"
npm pack "@opengsd/gsd-core@$GSD_VERSION" --pack-destination "$REPO/.gsd-build-tmp" --silent
tar xzf "$REPO/.gsd-build-tmp/opengsd-gsd-core-$GSD_VERSION.tgz" -C "$REPO/.gsd-build-tmp"
PKG_DIR="$REPO/.gsd-build-tmp/package"
# 预 gate：fetched == requested（≠ 则 exit 2）
[ "$(node -p "require('$PKG_DIR/package.json').version")" = "$GSD_VERSION" ] || exit 2
CLAUDE_CONFIG_DIR="$STAGING" HOME="$REPO/.gsd-build-tmp/fakehome" node "$PKG_DIR/bin/install.js" --claude --global
```
tarball 名与内容已实证：`npm pack --json` 给出 `filename: "opengsd-gsd-core-1.16.0.tgz"`, `entryCount: 1125`, `shasum: "20c034c537010a2e812df7c49586ca831d57ec71"`, `integrity: "sha512-A3OgmNH8/M0eALNpKZp0bjP0L5puu6rne1keqdFaM+NvqybuYZ2kJOcUH+fCKu6FQBGV0fAUEUE1bs6xqRfF7Q=="` [VERIFIED: npm registry，canonical 与 npmmirror 逐字节一致]。

### 双 gate（01-02 核心，SKIL-04 / SC4）
```bash
# gate A：版本交叉校验
node -p "process.exit(require('./gsd-core/package.json').version === process.env.GSD_VERSION ? 0 : 2)"
# gate B：残留机器特定绝对路径（全产品树）
grep -RInE "$STAGING_ROOT" skills/ gsd-core/ hooks/ scripts/ && exit 2
grep -RInE "/(Users|home)/[A-Za-z0-9_.-]+/" skills/ gsd-core/ hooks/ scripts/ && exit 2
# gate C：72 个 SKILL.md 各恰好一个 adapter 块
grep -Rlc "gsd:dsh-adapter begin" skills/*/SKILL.md | grep -v '^1$' && exit 2
```

### 独立 CLI 身份断言（SKIL-03）
```bash
node gsd-core/bin/gsd-tools.cjs runtime-identity --raw
# 实测输出（repo 产物与 npm-tarball staging 产物两侧相同）：
# {"packageName":"@opengsd/gsd-core","version":"1.16.0"}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| install-gsd-dsh.sh：wrapper 负责 pack→stage→deploy→改写→注入（复用官方 install.js） | 同一契约搬进 build.mjs，但 deploy 目标 = 包内（PLUGIN_ROOT_REF），不再写 ~/.dsh | P1（本 phase） | 装机侧零动作；改写 from 前缀从"部署根"变为"staging 根" |
| 改写映射基准 = 本机部署根（build.mjs:19-31 `GSD_BUILD_FROM`/`~/.dsh` 字面量） | 基准 = mktemp staging 根；`~/`、`$HOME` 仅作回退形态保留 | P1 | 满足 SC2 机器无关性 |
| `npm install --prefix` 网络失败兜底 | 本地 .tgz / GSD_PACKAGE_DIR 离线链为主，npm install 保留为文档化兜底 | P1 | SC1 离线等价产出 |

**Deprecated/outdated:** `GSD_BUILD_SOURCE` 指向本机部署快照的用法（保留为 SPIKE 兼容入口但不作为主路径——CONTEXT 锁定）。

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ENOTCACHED 的根因是"缓存键落在重定向后的 cdn URL 上" | Pitfall 1 | 低——v"离线不可用"为实测，"为什么"仅影响文档措辞；离线主机制已押注本地 .tgz |
| A2 | settings.json 烘焙的 `/Users/yue.weny/.nvm/...` node 路径在任何机器都会出现（取 `command -v node` 首个命中） | Pitfall 2 | 低——即使形态不同，"settings.json 不可拷"的结论不变（因 staging 路径必然烘焙） |
| A3 | staging 树的顶层形状在上游 1.16.x 内稳定（4 树 + 额外资产） | Architecture Patterns | 中——若上游增删顶层目录，白名单拷贝表需跟测；gate B/C 应作为哨兵 |
| A4 | `--claude --global` 非交互路径在上游版本内不弹 prompt（1.16.0 实跑无 prompt，exit 0） | Pipeline | 中——若未来版本加交互，构建会挂起；GSD_VERSION 固定 + timeout 缓解 |

## Open Questions (RESOLVED)

> All three questions resolved during planning (2026-11-10): Q1 → 01-03 Task 3 ⑦ canonical↔mirror 交叉核对命令（SBOM 记 canonical 值 + 实际取源 registry）；Q2 → 采纳 `build/assets/gsd-hooks.json`（01-01 Task 2 创建）；Q3 → `THIRD-PARTY-NOTICES.md` 落 repo 根、暂不进 `files`（01-01 Task 3 生成）。

1. **npmmirror 与 canonical 的 integrity 何时会漂移**
   - What we know: 研究时刻两边 dist.integrity/shasum/tarball 完全一致；两 registry 均从本机可达。
   - What's unclear: 镜像同步延迟窗口的告警方式；SBOM 应记录哪个 registry。
   - Recommendation: SBOM 记录 canonical（registry.npmjs.org）值 + 实际取源 registry；01-03 文档里给一条"交叉核对"命令。

2. **CONFIG 模板的提交位置**
   - What we know: `config/` 在 .gitignore；现 build.mjs 从 `$source/gsd-hooks.dsh.json` 拷贝，npm 源后此文件不存在于 staging。
   - What's unclear: 用 `build/assets/gsd-hooks.json`（本研究推荐）还是别的 committed 位置。
   - Recommendation: 采纳 `build/assets/gsd-hooks.json`，由 planner 落为 01-02 任务。

3. **SBOM/thanks 文件进不进包**
   - What we know: PUB-04 精神即可；CONTEXT 授权 Claude's Discretion 定字段粒度。
   - What's unclear: 是否随 `files` 白名单进 npm 包。
   - Recommendation: 生成 `THIRD-PARTY-NOTICES.md` 于 repo 根（提交入库），字段 = 包名/版本/shasum/integrity/许可/来源 URL；暂不进 `files`。

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | install.js / build.mjs / gsd-tools | ✓ | v24.21.0（≥24 门槛满足） | — |
| npm | `npm pack`（在线档） | ✓ | 12.2.1（≥10 满足） | 本地 .tgz / GSD_PACKAGE_DIR |
| pnpm | 验证实例重装环节 | ✓ | 12.11.2 | — |
| tar/bsdtar | 解包 .tgz | ✓ | bsdtar 3.5.3 | node zlib 手动解（不推荐） |
| registry.npmjs.org（canonical） | integrity 交叉核对（安全域） | ✓ | — | — |
| registry.npmmirror.com（本机配置） | `npm pack` 默认取源 | ✓ | — （npm PONG 0.26s） | `--registry` 显式覆盖 |
| npm cache 离线复用 | 曾视为离线候选 | ✗（实测 ENOTCACHED） | — | 本地 .tgz 文件（主机制） |
| 验证实例 127.0.0.1:3091 | DEV-03 gate | ✓（在线；未认证访问 404 属预期） | DSH 0.2.2-rc.1 | — |

**Missing dependencies with no fallback:**
- 无。取源三档离线链（GSD_TARBALL → .build-cache → GSD_PACKAGE_DIR）覆盖断网场景。

**Missing dependencies with fallback:**
- npm cache 离线（✗）→ 已切换主机制为本地 .tgz，见 §Open 1 / Pattern 2。

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test（Node 内置 test runner，零新依赖） |
| Config file | none — `node --test tests/` 即全量 |
| Quick run command | `node --test tests/rewrite-map.test.mjs` |
| Full suite command | `node build.mjs && node --test tests/` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SKIL-03 | 产物独立 CLI 输出身份 JSON | smoke | `node -e "const r=child_process.execSync('node gsd-core/bin/gsd-tools.cjs runtime-identity --raw');assert(JSON.parse(r).packageName==='@opengsd/gsd-core'&&JSON.parse(r).version===process.env.GSD_VERSION)"` | ❌ Wave 0 |
| SKIL-04 | SKILL.md 零机器绝对路径 + 72 个 adapter 块 | gate/smoke | `bash tests/run-gates.sh`（gate A/B/C，见 Code Examples） | ❌ Wave 0 |
| INST-02 | 产物树无 `~/.dsh` 字面量托管引用 | smoke | `grep -RIl '~/.dsh' skills/ gsd-core/ hooks/ config/ && exit 1` | ❌ Wave 0 |
| DEV-03 | 验证实例三项复验 | manual-only | `dsh plugin --profile gsdtest add file:… --force` → 重启 → `/gsd-health` + 独立 CLI + read `.env` 拦截。需运行中 DSH 实例，无法 CI 自动化（合理，01-03 执行并录证） | ❌ Wave 0（01-03 文档化序） |

### Sampling Rate
- **Per task commit:** `node --test tests/rewrite-map.test.mjs`（改写映射纯函数，秒级）
- **Per wave merge:** `node build.mjs && node --test tests/`（全量 smoke，含一次真实 pack→stage→gate 循环）
- **Phase gate:** 全绿 + 验证实例三项复验（01-03）before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `build/lib/rewrite-map.cjs` — 把 build.mjs:23-31 REWRITES 提成纯模块（可单测，供 makeRewrites(stagingRoot)）
- [ ] `tests/rewrite-map.test.mjs` — covers SKIL-04 映射正确性（staging 根 from、`~/`、`$HOME` 回退）
- [ ] `tests/build-smoke.test.mjs` — covers SKIL-03 + SKIL-04 + INST-02 产物断言
- [ ] `tests/run-gates.sh` — gate A/B/C 独立脚本（CI/prepack 可直接调用）
- [ ] `package.json` 增 `"test": "node --test tests/"`（Wave 0 内完成；prepack 链上加 gate 调用）

## Security Domain

> `security_enforcement: true`, ASVS L1, block on high。范围 = 构建期第三方 tarball 的供应链安全；插件 runtime guard 行为属 P0-locked，不在本域。

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture/Design | yes | 信任边界 = npm registry（canonical）；staging 产物视为不可信输入，仅白名单拷贝 |
| V5 Input Validation | yes | `GSD_VERSION` 必须匹配 `^\d+\.\d+\.\d+$`；`GSD_TARBALL`/`GSD_PACKAGE_DIR` 拒绝空值与非文件路径 |
| V6 Cryptography | yes | 完整性 pinning：SBOM 记录 `dist.shasum`/`dist.integrity`；离线 .tgz 经 `shasum -a 512` 对照；在线由 npm 自带 integrity 校验 |
| V14 Configuration | yes | 取源 registry 显式化、可覆盖（`--registry`）；构建环境变量最小集（GSD_VERSION/GSD_TARBALL/GSD_PACKAGE_DIR） |

### Known Threat Patterns for npm-fetch build pipelines

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 镜像/中间人篡改 tarball | Tampering | dist.integrity pinning + canonical↔mirror 交叉核对（本研究已示范，两侧一致）；SBOM 记录 canonical 值 |
| 依赖混淆 / slopsquat 包名 | Spoofing | 包名是官方常量 `@opengsd/gsd-core`（不可参数化）；legitimacy seam 已跑（SUS/too-new → 人行 checkpoint） |
| 上游新版本静默漂移（`latest`） | Tampering | 版本恒显式：GSD_VERSION 必填或默认 1.16.0；双 gate 拦 fetched≠requested |
| build 期执行不可信安装器代码 | Elevation of Privilege | install.js 是官方包内代码（信任模型即上游）；缓解 = 版本 pin + integrity + HOME 隔离 + 白名单拷贝 + gate 扫描产物 |
| 断网引起降级路径被绕过 | DoS | 离线链档位分明，任意档失败都有显式文案 + exit 码约定（见下） |

**Exit code 约定（Claude's Discretion → 推荐采纳）：** `0` 成功；`1` 意外 IO/安装器失败（留痕：失败时保留 staging 树供诊断，成功时清理）；`2` gate 失败（版本不一致 / 残留绝对路径 / adapter 计数 ≠72）——gate 失败按 config `security_block_on: high` 处理：直接阻断 prepack/发布。

## Sources

### Primary (HIGH confidence)
- `@opengsd/gsd-core@1.16.0` npm registry（canonical registry.npmjs.org 与 npmmirror 双查）— version/dist.tarball/dist.shasum/integrity/engines/npm pack 实跑（含 `pack --json` 全清单）
- `/Users/yue.weny/frontWorkspace/gsd-on-dsh/install-gsd-dsh/install-gsd-dsh.sh:359-465`（npm pack 取源 + 官方 --claude staging + GSD_FROM/GSD_TO 改写）与 `:587-657`（gsd-hooks.dsh.json 模板，与 repo config byte-identical）
- 官方安装器实跑产物（/tmp/gsd-stage-a.FheGZr，本次 session 由 tarball 驱动）：staging 树目录清单、72 skills、`gsd-core/VERSION`=`1.16.0`、路径形态普查、settings.json 机器路径样本
- build.mjs（repo 根，全文已读）：L15 `const source = process.env.GSD_BUILD_SOURCE || join(homedir(), '.dsh')`、L19-31 sourceHome/PLUGIN_ROOT_REF/REWRITES、L63 ADAPTER_BLOCK、L110-134 拷贝表、L33-58 NOTE 模板

### Secondary (MEDIUM confidence)
- rationale for ENOTCACHED internals: npm 12.2.1 行为实测（错误原文已录）；make-fetch-happen 缓存键/重定向细节 [ASSUMED A1]

### Tertiary (LOW confidence)
- 无 web-only 结论；全部关键断言均落在本机源码/注册表实测上

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 全部工具本机实测版本；唯一外部包双 registry 核验 + legitimacy gate
- Architecture: HIGH — 官方 staging 契约经源码引读 + 实跑产物验证（两路证据一致）
- Pitfalls: HIGH — Pitfall 1（ENOTCACHED）为实测失败记录；Pitfall 2 为实测产物证据；A1 局部归因已入 Assumptions Log

**Research date:** 2026-11-10
**Valid until:** 2026-12-10（npm 生态快动；1.16.x 上游形变风险由 A3 哨兵 gate 覆盖）

---

## Version Amendment（2026-11-10，执行期 checkpoint 人类决策）

**目标版本 1.16.0 → 1.20.1。** 01-01 Task 1 blocking-human checkpoint 的回答为改取 `@opengsd/gsd-core@1.20.1`，GSD_VERSION 默认值与全 phase 判据已同步改为 1.20.1（01-01/01-02/01-03 PLAN、01-CONTEXT、ROADMAP、STATE）。

- **1.20.1 canonical 值** [VERIFIED: registry.npmjs.org 与 npmmirror 双查，2026-11-10]：dist.shasum `d632001e2541e6cccfb740bcad5b2f5c334efabd`；dist.integrity `sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPcZQ==`；license MIT；发布时间 2026-11-05T14:33:23Z（≈5 天新，**too-new 仍成立**，属人类已知悉决策）。
- **包形同构** [VERIFIED: npm pack --dry-run 双侧]：1.20.1 与 1.16.0 顶层结构等价——skills/ 恰 72 个 gsd-*、SKILL.md 恰 72、gsd-core/ hooks/ scripts/ 均齐；故 76 棵树 SC、gate C 72 计数、adapter 注入 72× 等结构常量不变。文件总数 1265（1.16.0 为 1125），差异来自 gsd-core/hooks/scripts 内部文件。
- **勘误（本文件）**：§Environment 所述 "1.16.0 发布 2026-11-05T14:33:23Z" 为错行——该时间戳逐秒吻合 1.20.1 的发布时间；1.16.0 实际发布于 2026-10-05T02:12:43Z（≈36 天）。"too-new（5 天）" 的判断对 1.16.0 不成立、对 1.20.1 成立。
- 1.16.0 相关记录（§Environment/§Code Examples 的 canonical 值与 1125 files 等）保留为审计历史。
