<!-- generated-by: gsd-doc-writer -->

# dsh-gsd

**给 DeepSeek Harness 一条命令装上 GSD。**

dsh-gsd 把 GSD——规格驱动的 AI 编码工作流（72 个 skills + 引擎 + 守卫 hooks）——打包成 DeepSeek Harness（DSH）的原生插件。装好之后，你的会话直接拥有完整的 GSD 工作流能力。

## 为什么用 dsh-gsd

- **一条命令安装**。无需脚本、无需手工步骤、不写 `~/.dsh` 任何文件。
- **DSH 原生插件**。可在插件管理器里 enable / disable / remove，升级与回滚 = 换一个版本号重跑同一条命令。
- **全量 GSD 能力自包含**。72 个 `gsd-*` skills、GSD 引擎（workflows / templates / agents / commands）、守卫 hooks 全部随包携带。

## 快速开始

```bash
# 1. 安装
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022

# 2. 重启 dsh web（或对应 profile 的服务）即生效
```

装好后会话内的 skill 目录会出现 72 个 `gsd-*`，执行 `/gsd-health` 可直接自检。接下来像平常一样对话即可：`/gsd-new-project`、`/gsd-quick` 等命令随手可用，直接开始推进开发。

> 也可以从 GitHub 仓库安装：`dsh plugin --profile web add github:pfmiles/dsh-gsd`

## 卸载 / 升级

```bash
# 卸载：下个进程启动后一切消失
dsh plugin --profile web remove dsh-gsd

# 升级 / 回滚：同一条命令换一个精确版本号
dsh plugin --profile web add dsh-gsd@1.20.2-1.dsh022   # 升级：GSD 引擎 1.20.2
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022   # 回滚：回到 GSD 1.20.1
```

## 版本号方案

版本号 = `<gsd-ver>-<rev>.dsh<line>`；升级与回滚永远是**同一条命令换一个精确版本号**。安装只认精确版本（prerelease 版本不参与 range 匹配，`@^`/`@~`/`@*`/`@latest` 形态匹配数为 0）。

| 字段 | 含义 | 示例（`1.20.1-1.dsh022`） | EN |
| ---- | ---- | -------------------------- | -- |
| `gsd-ver` | 打包的 GSD Core 引擎版本 | `1.20.1` | bundled GSD Core engine version |
| `rev` | 修订号：同一 (gsd-ver, DSH 行) 对内从 1 起、逐次递增 | `1` | revision id — starts at 1, +1 per release of the same pair |
| `dsh<line>` | 适配的 DSH 发布行（去点标签）：dsh022 = DSH 0.2.2 行、dsh021 = DSH 0.2.1 行 | `dsh022` | dotless DSH line label |

## 环境要求

- DeepSeek Harness `>=0.2.2-rc.1 <0.3.0-0`（`engines.dsh` 自动校验，不满足会拒绝安装）
- Node ≥ 24
- macOS / Linux / WSL

> 版本不匹配被 `engines.dsh` 拒绝时，宿主给出的 `allow-version` 是**显式风险豁免**（精确 name@version × 精确 DSH 版本 + acceptRisk）——本插件不推荐使用，也绝不会自动触发。

## 当前状态

P0 spike 已全链路验证（2026-11-10，含守卫 hooks 阳性拦截）；版本化安装通道与 dshmarket 收录随 [ROADMAP](./.planning/ROADMAP.md) Phase 3 开放，干净机器 8 项 UAT 收官安排在 Phase 5。

## 自举构建（顺带一提）

这个项目由它自己开发：插件装入验证实例后，由它自带的 skills / 引擎 / hooks 驱动本仓库的全部开发流程（dogfooding）。感兴趣可看 [`.planning/`](./.planning/)。

构建者与复验者见 [BUILD.md](./BUILD.md)——GSD_VERSION 用法、在线/离线四档、exit codes 0/1/2、gates 契约、上游完整性交叉核对与验证实例复验序；上游包元数据（SBOM）见 [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md)。

## License

MIT，见 [LICENSE](./LICENSE)。含上游内容：GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。

---

# dsh-gsd

**GSD for DeepSeek Harness, one command away.**

dsh-gsd packages GSD — a spec-driven AI coding workflow (72 skills + engine + guard hooks) — as a native DeepSeek Harness (DSH) plugin. Once installed, full GSD workflow capabilities are available in your sessions.

## Why dsh-gsd

- **One-command install.** No scripts, no manual steps, nothing written to `~/.dsh`.
- **A native DSH plugin.** Enable / disable / remove in the plugin manager; upgrade or rollback = re-run the same command with a different version.
- **Fully self-contained.** All 72 `gsd-*` skills, the GSD engine (workflows / templates / agents / commands) and guard hooks ship inside the package.

## Quick Start

```bash
# 1. Install
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022

# 2. Restart dsh web (or the target profile's service) — done.
```

After restart, 72 `gsd-*` skills appear in the session skill catalog, and `/gsd-health` runs a self-check. From there just talk to your agent as usual — `/gsd-new-project`, `/gsd-quick`, and 70 more commands are ready to drive your development.

> GitHub install: `dsh plugin --profile web add github:pfmiles/dsh-gsd`

## Uninstall / Upgrade

```bash
# Uninstall — everything disappears on the next process start
dsh plugin --profile web remove dsh-gsd

# Upgrade / rollback — re-run the same command with a different exact version
dsh plugin --profile web add dsh-gsd@1.20.2-1.dsh022   # upgrade: GSD engine 1.20.2
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022   # rollback: back to GSD 1.20.1
```

## Version scheme

Version = `<gsd-ver>-<rev>.dsh<line>`; upgrade and rollback are always the **same command with a different exact version**. Install specs are exact only — prerelease versions do not participate in range matching, and `@^`/`@~`/`@*`/`@latest` forms match zero candidates.

| Field | Meaning | Example (`1.20.1-1.dsh022`) | EN |
| ----- | ------- | --------------------------- | -- |
| `gsd-ver` | the bundled GSD Core engine version | `1.20.1` | bundled engine |
| `rev` | revision id — starts at 1, increments within the same (gsd-ver, DSH line) pair | `1` | revision |
| `dsh<line>` | dotless DSH line label — dsh022 = DSH 0.2.2 line, dsh021 = DSH 0.2.1 line | `dsh022` | line label |

## Requirements

- DeepSeek Harness `>=0.2.2-rc.1 <0.3.0-0` (`engines.dsh` is enforced automatically; incompatible hosts are rejected)
- Node ≥ 24
- macOS / Linux / WSL

> When a mismatch is rejected via `engines.dsh`, the host-offered `allow-version` is an **explicit risk exemption** (exact name@version × exact DSH version + acceptRisk) — this plugin does not recommend it and never triggers it automatically.

## Status

The P0 spike is fully verified end-to-end (2026-11-10), including positive guard-hook interception. Versioned install channels and the dshmarket listing open with [ROADMAP](./.planning/ROADMAP.md) Phase 3; clean-machine UAT (8 items) closes at Phase 5.

## Bootstrapped (a fun aside)

This project is built by itself: once installed into a verification instance, its own skills / engine / hooks drive this repo's entire development process (dogfooding). Curious? See [`.planning/`](./.planning/).

Builders and re-verifiers: [BUILD.md](./BUILD.md) covers GSD_VERSION usage, the four offline/online tiers, exit codes 0/1/2, the gates contract, upstream integrity cross-checks, and the verification-instance re-verify sequence; upstream package metadata (SBOM) lives in [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).

## License

MIT — see [LICENSE](./LICENSE). Bundles upstream content: GSD Core (MIT, © 2026 Open GSD), DeepSeek Harness (MIT).
