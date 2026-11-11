# BUILD.md — dsh-gsd 构建全流程

**How this repo ships: `node build.mjs` rebuilds the product trees from the `@opengsd/gsd-core` npm tarball; this file is the single source of truth for version selection, offline tiers, failure modes, exit codes, gates, upstream integrity cross-checks, and the verification-instance re-verify sequence.**

构建产物（`skills/` `gsd-core/` `hooks/` `config/` `scripts/`）不入 git；本文件解释整个构建链的行为与契约，发布合规核对和验证实例复验都以此为准。许可证归属见 [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md)；安装/使用见 [README.md](./README.md)。

## TL;DR — 快速参考

```bash
# 全量重建（默认 GSD_VERSION=1.20.1，在线/缓存档）——预期 exit 0、gates: all passed (A/B/C)
node build.mjs

# 显式版本 + 离线完整 tarball 档（解包前双重完整性校验）
GSD_VERSION=1.20.1 GSD_TARBALL=$PWD/.gsd-build-tmp/opengsd-gsd-core-1.20.1.tgz node build.mjs

# 每波可重跑测试（含真实构建 smoke）——预期 7/7
npm test

# 发布前全链（gates 内嵌 build）——预期 exit 0
npm run prepack

# 上游完整性交叉核对（对照 THIRD-PARTY-NOTICES.md 表）
npm view @opengsd/gsd-core@1.20.1 dist.integrity dist.shasum --registry=https://registry.npmjs.org
```

- **成功形态**：`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)` + `gates: all passed (A/B/C)`，exit 0。
- **失败形态**：exit 1（IO/解包/安装器，staging 留痕）或 exit 2（gate/校验，阻断 prepack）。

---

## ① GSD_VERSION 用法（Usage）

| 项 | 值 | EN |
| -- | -- | -- |
| 默认值 | `1.20.1` | default |
| 格式校验 | `/^\d+\.\d+\.\d+$/`，非法 → exit 2 | format gate |
| 示例 | `GSD_VERSION=1.20.1 node build.mjs` | example |

- 版本**恒显式**：要么显式传 `GSD_VERSION`，要么用默认 `1.20.1`——构建链从不解析 `latest`，防上游新版本静默漂移（Tampering 面）。
- 空值/空白按未设置处理（落入默认值）；格式非法（如 `banana`、`1.20`）在取源前即 exit 2，文案 `invalid GSD_VERSION '…' (must match \d+\.\d+\.\d+)`。
- 目标版本变更的完整做法：先跑 §⑦ 交叉核对把新版本 canonical 值写进 [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md)，再改默认值/传入值——否则 ①/② 档离线完整性校验会因无记录而 exit 2。

## ② staging 通道（Main staging chain）

主链六步（`build.mjs` production path）：

1. **fetch**（§③ 四档探测，命中即止）→ 得到 `PKG_DIR`；
2. **pre-gate**：`require(<PKG_DIR>/package.json).version === GSD_VERSION`，不等 → exit 2（在 staging **之前**拦截 fetched≠requested）；
3. **staging**：官方安装器 `node <PKG_DIR>/bin/install.js --claude --global`，环境 = `CLAUDE_CONFIG_DIR=mktemp 的 throwaway staging 目录` + `HOME=.gsd-build-tmp/fakehome`。**绝不手写 staging**——与 install-gsd-dsh.sh 安装器同契约，官方安装器是唯一的 staging 实现；
4. **4 树白名单捕获**：`skills/gsd-*` + `gsd-core` + `hooks` + `scripts`；`config/gsd-hooks.json` 来自仓库 canonical 模板 `build/assets/gsd-hooks.json`（与 install-gsd-dsh.sh:587-657 逐字一致）；`settings.json` / `agents/` / `.gsd-*` **概不拷贝**（携带本机路径，Pitfall 2）；
5. **改写 + 注入**：以**本次 staging 根**为 from 基准改写 `skills/gsd-core/hooks/scripts` 四树（映射来自 `build/lib/rewrite-map.cjs`，9 对、最长/最具体在前、裸 `$HOME` 不映射）；随后向 72 份 `SKILL.md` 注入 DSH adapter note（先剥历史两种标记再注入，防二次构建重复块）；
6. **gates**（§⑥）在 staging 清理**之前**运行，失败 → staging 树保留留痕。

**hooks 桥接适配器来源**：`hooks/dsh-gsd-suite/run.cjs`（DSH→Claude 小写工具名归一化 + exit 码透传的 stdio adapter）的本仓库 canonical 拷贝在 `build/assets/dsh-gsd-suite-run.cjs`，捕获取树 4 步骤中一并拷入产物 `hooks/dsh-gsd-suite/run.cjs`。它是 install-gsd-dsh.sh 的部署产物，**不在 @opengsd/gsd-core npm tarball 树内**——01-03 Task 2 验证实例 live `.env` 拦截探针发现缺失该适配器会让全部守卫 hook spawn `MODULE_NOT_FOUND` → 桥接 fail-open（所有守卫失效），为本轮回归修复背景（见 git 历史 fix 2d45fac 与 [verify-evidence.md](./.planning/phases/01-build-mjs/verify-evidence.md)）。

## ③ 离线/在线档位（Offline & online tiers）

探测顺序固定（01-RESEARCH Pattern 2），命中即止：

| # | 档位 Tier | 行为 Behavior | 失败 Failure |
| -- | --------- | ------------- | ------------ |
| ① | `GSD_TARBALL=<path.tgz>` | 解包前 **SHA-512 + SHA-1 双重对照** [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) 该版本行（`dist.integrity` base64 解码 + `dist.shasum`）→ 系统 `tar` 解包 | 任一不符 → exit 2 `checksum mismatch`（fail-closed）；无该版本记录 → exit 2 |
| ② | `.build-cache/opengsd-gsd-core-<ver>.tgz`（repo 内缓存，gitignored；**由维护者/CI 手工预置，build 从不写入**——无自愈/自更新语义） | 解包前 **SHA-512 + SHA-1 双重对照** [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) 该版本行（与 ① 档同一校验入口）→ 系统 `tar` 解包 | 任一不符 / 无该版本记录 → exit 2 `checksum mismatch`（fail-closed）；版本不符另由 pre-gate（§②-2）拦截 |
| ③ | `GSD_PACKAGE_DIR=<unpacked dir>` | 已解包目录直接采用（无 tar 步骤）；目录必须含 `bin/install.js` **与** `package.json` | 缺任一 → 落到下一档；fetched≠requested 由 pre-gate exit 2 |
| ④ | `npm pack @opengsd/gsd-core@<ver>`（在线） | 最后一档，在线取件到 `.gsd-build-tmp/` | 非零 → exit 1，stderr 列明 ①-④ 档位名并提示离线看本文 |

- **npm cache `--offline` 不是离线档**：本机实测 `npm error code ENOTCACHED`（镜像 302 重定向使缓存键落在 cdn URL 上，Pitfall 1）——永不进入代码路径，勿依赖。
- 断网离线重建的正确姿势：① 预置 `GSD_TARBALL`（完整 tarball，过双重完整性校验）或 ② 依赖 `.build-cache/`；两者都无则 exit 1。
- **`.build-cache/` 不由 build 写入**（IN-01）：全仓无任何代码路径落盘该目录——在线 ④ 档成功后 tgz 只留在 `.gsd-build-tmp/`。缓存由维护者/CI 按 §⑦ canonical 值核对后**手工预置**（如先过 ① 档校验再 `cp` 进 `.build-cache/`）；缓存被篡改 → ② 档完整性校验 exit 2 fail-closed，不会静默自愈，需按 §⑦ 重新预置。

## ④ 失败模式与修复（Failure modes & fixes）

| # | Pitfall（来源） | 症状 Symptom | 修复 Fix |
| -- | --------------- | ------------ | -------- |
| 1 | npm cache 不能当离线机制（RESEARCH P1） | `npm error code ENOTCACHED`，暖缓存仍失败 | 用本地 `.tgz`（`GSD_TARBALL` / `.build-cache`）；不要 `--offline` |
| 2 | staging 里躺机器耦合资产（P2） | 构建产物出现本机绝对路径（settings.json 烘焙 node 路径、agents） | 白名单已排除，永不拷贝；gate B 兜底扫描产物 |
| 3 | fetched≠requested 没在 stage 前拦（P3） | 产物版本与请求不符（如 ③ 档目录版本漂移） | pre-gate 在 staging 前 exit 2 + `fetched version X != requested Y` 文案 |
| 4 | adapter 双标记与二次构建（P4） | 二次构建后 SKILL.md 出现重复 adapter 块 | 注入前先剥两种历史标记（installer / regenerated 形态）；gate C 72×1 计数兜底 |
| 5 | staged 含 `$HOME`/`~` 合法形态（P5） | gate B 字面正则误杀上游可移植叙述例径（如 `/Users/john/` 教学行） | gate B 三段式（§⑥）；不改上游文件——命中人工审计 |
| 6 | 构建期安装器受 HOME/环境（P6） | 构建结果随机、或上游版本引入交互 prompt 挂起 | `CLAUDE_CONFIG_DIR=throwaway` + `HOME=fakehome`；未来上游交互化靠版本 pin + timeout |

- **gate A 失败**（exit 2，`gate A failed`）：先看 staging 树 `gsd-core/VERSION` 是否存在且等于 `GSD_VERSION`，再看 `node <产物>/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 是否精确自报 `{"packageName":"@opengsd/gsd-core","version":"<GSD_VERSION>"}`。上游改动产物形态时（如去掉 VERSION 文件）须同步更新锚点（1.20.1 无 gsd-core/package.json 是先例，01-01 偏差 1）。
- **gate B 失败**：staging 树保留（路径在错误文案里），按命中层定位——B1 = staging 根前缀改写漏网；B2 = homedir 前缀残留；B3 = skills 树 `/Users|home` 字面残留。
- **gate C 失败**（exit 2，adapter 计数 ≠72）：注入步骤被破坏（72 个 skills 各应恰 1 个 adapter 块）。

## ⑤ exit codes

| Exit | 含义 Meaning | 状态 State |
| ---- | ------------ | ---------- |
| **0** | 成功：构建完成、gates 全过；staging + fakehome 已清理 | success |
| **1** | IO / 解包 / 安装器失败、或 gate 脚本无法运行（env 缺失 fail-closed）；**staging 树保留留痕** | failure (forensics kept) |
| **2** | gate/校验失败：GSD_VERSION 格式非法、fetched≠requested、①/② 档 checksum mismatch、gate A/B/C 任一失败——**阻断 prepack/发布** | gate failure (blocks release) |

判读与处置：

- `node build.mjs` 以 **exit 0** 收尾 = 唯一可信任的成功信号；成功后才允许 `npm run prepack` 进入发布链。
- **exit 1** 时错误文案会点出阶段（fetch 四档列明 / tar 不可用 / 官方安装器 failed / gate 脚本不可运行）并附 staging 路径——保留该目录诊断，修复后重跑即可（每次构建都会重建 staging）。
- **exit 2** 时按文案分类：`invalid GSD_VERSION` → 传合法 `x.y.z`；`fetched version … != requested …` → 核对 ③ 档目录或改 GSD_VERSION；`checksum mismatch` → 走 §⑦ 核对对应档位 tarball 来源（② 档 `.build-cache` 被篡改需人工重新预置，见 §③）；`gate A/B/C failed` → 走 §④ gate 排查表。
- **staging/fakehome 取证留痕只增不清**（IN-04）：exit 1/2 时 `.gsd-build-tmp/staging.*` 与 `fakehome` 按取证语义保留（约 MB 级、无自动轮替/上限），便于按下表定位飞错；诊断完成后手工清理：`rm -rf .gsd-build-tmp/`（该目录仅 build 自身使用，下次构建会自动重建）。
- exit code 契约同时适用于 `tests/run-gates.sh`（独立调用时）：exit 0 全过、exit 1 env 缺失、exit 2 gate 失败。

## ⑥ gates 与 prepack 契约（Gate & prepack contract）

- **`tests/run-gates.sh` 是 gate A/B/C 的唯一实现**（build.mjs / prepack / CI 三方共享，单写模式）：
  - 前置：需 `GSD_VERSION` 与 `GSD_STAGING_ROOT` 两个 env，**任一缺失 → exit 1 fail-closed**；
  - gate A **双锚**：`gsd-core/VERSION === GSD_VERSION` 且 `runtime-identity --raw` 自报精确相等；
  - gate B **三段式**：B1 staging 根前缀（4 树全扫）/ B2 本机 homedir 前缀残留（4 树全扫）/ B3 `/Users|home` 字面正则（仅 skills 树 = SKIL-04 字面范围）；
  - gate C：72×1 adapter 计数（72 份 SKILL.md 各恰 1 个注入块）。
- build 在 staging 清理前 spawn 该脚本并**原样传播 exit 码**（1→IO-style, 2→gate）；成功路径 stdout 含 `gates: all passed (A/B/C)`。
- **prepack**（package.json 实际契约）：`node build.mjs && node --test tests/*.test.mjs`——gates 内嵌 build。（plan 旧文 "node --test tests/" 目录参数在 Node 24.21.0 机械失败，已按 01-02 偏差 2 适配为 glob 形态，实测 7/7。）
- **test**（每波可重跑）：`npm test` = `node --test tests/*.test.mjs`。

已实证的负向/正向命令（01-02 fixture）：

```bash
# env 缺失 → exit 1 fail-closed（无 GSD_VERSION / GSD_STAGING_ROOT）
bash tests/run-gates.sh          # expect: exit 1 + env 缺失文案

# 全量构建（gates 内嵌）→ exit 0 + "gates: all passed (A/B/C)"
GSD_VERSION=1.20.1 node build.mjs

# ③ 档版本漂移负向 → exit 2 + "fetched version 1.19.9 != requested 1.20.1"
GSD_VERSION=1.20.1 GSD_PACKAGE_DIR=<1.19.9 unpacked> node build.mjs

# 篡改 tarball（① 档）→ exit 2 + checksum mismatch（fail-closed）
GSD_VERSION=1.20.1 GSD_TARBALL=/tmp/gsd-tampered.tgz node build.mjs

# 篡改 .build-cache 缓存（② 档，同一校验入口）→ 同样 exit 2 + checksum mismatch
# （自动化负向防线见 npm test 的 "WR-01 负向"；修复 = 按 §⑦ 重新预置缓存）
```

## ⑦ 上游完整性交叉核对（Upstream integrity cross-check，RESEARCH Open Q1）

采样核对命令（canonical）：

```bash
npm view @opengsd/gsd-core@1.20.1 dist.integrity dist.shasum --registry=https://registry.npmjs.org
```

与另一镜像输出（如 `--registry=https://registry.npmmirror.com`）及 [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) 表逐字节对照：SBOM 记录 **canonical（registry.npmjs.org）** 值；任一侧漂移即告警（镜像延迟窗口），发布合规以 NOTICES 表为准。上游 1.20.1 现状：两侧逐字节一致（2026-11-10 核对）。

1.20.1 canonical 记录（SBOM 行，勿手抄旧值）：

| 字段 | 值（canonical，2026-11-10） |
| ---- | --------------------------- |
| `dist.shasum` | `d632001e2541e6cccfb740bcad5b2f5c334efabd` |
| `dist.integrity` | `sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPcZQ==` |

核对动作：两条命令输出与该表**逐字节相等**→ 平安；任一不等 → 停止构建/发布，查明是镜像滞后还是中间人篡改（Tampering 面），必要时 human checkpoint。

## ⑧ 验证实例复验序（Verification-instance re-verify，DEV-02/DEV-03）

每次插件源码变更后的标准复验序（对应 [verify-evidence.md](./.planning/phases/01-build-mjs/verify-evidence.md)）：

1. `node build.mjs`（全量重建，默认 GSD_VERSION=1.20.1）→ 预期 exit 0 + `gates: all passed (A/B/C)`；
2. `dsh plugin --profile gsdtest add file:. --force`（file: 安装 = 打包冻结快照——**必须 re-add**）→ 预期 exit 0；
3. **重启 3091 验证实例**（执行器不能从会话内重启自己，由主会话/orchestrator 协作）→ **新 token 会话**；佐证 = 监听 pid 启动时间晚于 add 时间；
4. 三项复验（按序）：
   - 独立 CLI：`node $DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → 预期 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；
   - `/gsd-health` → 预期引擎经包内路径解析、诊断正常（1.20.1 快照形态：`status: degraded` / errors 0）；
   - **read 精确 `.env` 被 guard 硬拦** → 预期 exit 2 + `decision: block / code: secret-read` + 文案，良性 read 对照 exit 0；
5. 三项均留可观察输出并记录进 verify-evidence.md，声明证据来自**重装后新快照**（防旧 file: 快照假绿，SPIKE 教训）。

---

*构建契约与上游形态按需演进：改 gate 语义先改 §⑥ 与 tests/run-gates.sh；改目标版本先走 §⑦。*
