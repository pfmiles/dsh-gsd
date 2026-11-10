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
dsh plugin --profile web add dsh-gsd@0.1.0-gsd1.20.1

# 2. 重启 dsh web（或对应 profile 的服务）即生效
```

装好后会话内的 skill 目录会出现 72 个 `gsd-*`，执行 `/gsd-health` 可直接自检。接下来像平常一样对话即可：`/gsd-new-project`、`/gsd-quick` 等命令随手可用，直接开始推进开发。

> 也可以从 GitHub 仓库安装：`dsh plugin --profile web add github:pfmiles/dsh-gsd`

## 卸载 / 升级

```bash
# 卸载：下个进程启动后一切消失
dsh plugin --profile web remove dsh-gsd

# 升级 / 回滚：换一个版本号，重跑安装命令
dsh plugin --profile web add dsh-gsd@<新版本>
```

## 环境要求

- DeepSeek Harness `>=0.2.2-rc.1 <0.3.0-0`（`engines.dsh` 自动校验，不满足会拒绝安装）
- Node ≥ 24
- macOS / Linux / WSL

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
dsh plugin --profile web add dsh-gsd@0.1.0-gsd1.20.1

# 2. Restart dsh web (or the target profile's service) — done.
```

After restart, 72 `gsd-*` skills appear in the session skill catalog, and `/gsd-health` runs a self-check. From there just talk to your agent as usual — `/gsd-new-project`, `/gsd-quick`, and 70 more commands are ready to drive your development.

> GitHub install: `dsh plugin --profile web add github:pfmiles/dsh-gsd`

## Uninstall / Upgrade

```bash
# Uninstall — everything disappears on the next process start
dsh plugin --profile web remove dsh-gsd

# Upgrade / rollback — re-run add with the desired version
dsh plugin --profile web add dsh-gsd@<another-version>
```

## Requirements

- DeepSeek Harness `>=0.2.2-rc.1 <0.3.0-0` (`engines.dsh` is enforced automatically; incompatible hosts are rejected)
- Node ≥ 24
- macOS / Linux / WSL

## Status

The P0 spike is fully verified end-to-end (2026-11-10), including positive guard-hook interception. Versioned install channels and the dshmarket listing open with [ROADMAP](./.planning/ROADMAP.md) Phase 3; clean-machine UAT (8 items) closes at Phase 5.

## Bootstrapped (a fun aside)

This project is built by itself: once installed into a verification instance, its own skills / engine / hooks drive this repo's entire development process (dogfooding). Curious? See [`.planning/`](./.planning/).

Builders and re-verifiers: [BUILD.md](./BUILD.md) covers GSD_VERSION usage, the four offline/online tiers, exit codes 0/1/2, the gates contract, upstream integrity cross-checks, and the verification-instance re-verify sequence; upstream package metadata (SBOM) lives in [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).

## License

MIT — see [LICENSE](./LICENSE). Bundles upstream content: GSD Core (MIT, © 2026 Open GSD), DeepSeek Harness (MIT).
