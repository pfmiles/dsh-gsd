<!-- generated-by: gsd-doc-writer -->

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![DSH](https://img.shields.io/badge/DSH-0.2.2--rc.1-blue)](https://github.com/pfmiles/dsh-gsd#requirements)

# dsh-gsd

**给 DeepSeek Harness 一条命令装上 GSD。**

dsh-gsd 把 GSD——规格驱动的 AI 编码工作流（72 个 skills + 引擎 + 守卫 hooks）——打包成 DeepSeek Harness（DSH）的原生插件。装好之后，你的会话直接拥有完整的 GSD 工作流能力。
> 已经用脚本装过？迁移到插件见 [docs/MIGRATION.md](./docs/MIGRATION.md)（含回退路径与排障）。

## 为什么用 dsh-gsd

- **一条命令安装**。无需脚本、无需手工步骤、不写 `~/.dsh` 任何文件。
- **DSH 原生插件**。可在插件管理器里 enable / disable / remove，升级与回滚 = 换一个版本号重跑同一条命令。
- **全量 GSD 能力自包含**。72 个 `gsd-*` skills、GSD 引擎（workflows / templates / agents / commands）、守卫 hooks 全部随包携带。

## 快速开始

```bash
# 1. 安装
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022

# 2. 重启 dsh web（或对应 profile 的服务）即生效

# 市场（dshmarket）与宿主 Discover 的卡片给的是不带版本号的等价命令：
dsh plugin --profile web add dsh-gsd
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

首个正式版本 **`1.20.1-1.dsh022`** 已就绪：8 项 UAT 已在干净机器（一次性 `/tmp` 新 `DSH_HOME`，零 GSD 残留）全部通过；npm 首发、GitHub Release 与 dshmarket 收录随后落地。本版本的变更见 [`CHANGELOG.md`](./CHANGELOG.md) 的对应条目。

## 启动开销

插件给每次会话启动加了多少开销？三点测量，口径固定为**事件时间戳之差**：会话记录里 `session.createdAt` 到首个 `turn/start.time` 的差（两个值都由 DSH 以毫秒写进 `session.v4.jsonl.zstd`）。

| 点 | 含义 | 实测 |
| -- | ---- | ---- |
| ① 基线启动 | 无插件 profile | **9 ms** |
| ② 带插件启动 | 同一 home、同一模板 + 插件 | **279 ms** |
| ③ 插件段 | ① → ② 的差 | **≈270 ms** |

测量条件：同一 `DSH_HOME`、同一 `--from-default-profile headless` 模板成对造 profile（只差一次插件安装）、两 profile 交替各 3 轮（`n=3`）、单机、暖页缓存。差值是**中位数之差**，不是每轮配对差的中位数。

> **墙钟不可用作开销。** 同一轮从进程启动到答案返回的墙钟在 2 560–3 834 ms 之间漂移，而它由 LLM 往返主导 —— 用它算「插件成本」等于在量模型延迟。
> **技能目录的 watch（长驻进程热重载）是 `not measured`。** 一次性会话每次都是新进程、启动时重读技能目录，watcher 对它结构性不适用；而数 fsevents 需要 root。本段只给启动开销，不给 watch 数字。

## 自举构建（顺带一提）

这个项目由它自己开发：插件装入验证实例后，由它自带的 skills / 引擎 / hooks 驱动本仓库的全部开发流程（dogfooding）。感兴趣可看 [`.planning/`](./.planning/)。

构建者与复验者见 [BUILD.md](./BUILD.md)——GSD_VERSION 用法、在线/离线四档、exit codes 0/1/2、gates 契约、上游完整性交叉核对与验证实例复验序；上游包元数据（SBOM）见 [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md)。

## License

MIT，见 [LICENSE](./LICENSE)。含上游内容：GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。

---

# dsh-gsd

**GSD for DeepSeek Harness, one command away.**

dsh-gsd packages GSD — a spec-driven AI coding workflow (72 skills + engine + guard hooks) — as a native DeepSeek Harness (DSH) plugin. Once installed, full GSD workflow capabilities are available in your sessions.
> Installed with the shell script before? See [docs/MIGRATION.md](./docs/MIGRATION.md) to migrate (rollback and troubleshooting included).

## Why dsh-gsd

- **One-command install.** No scripts, no manual steps, nothing written to `~/.dsh`.
- **A native DSH plugin.** Enable / disable / remove in the plugin manager; upgrade or rollback = re-run the same command with a different version.
- **Fully self-contained.** All 72 `gsd-*` skills, the GSD engine (workflows / templates / agents / commands) and guard hooks ship inside the package.

## Quick Start

```bash
# 1. Install
dsh plugin --profile web add dsh-gsd@1.20.1-1.dsh022

# 2. Restart dsh web (or the target profile's service) — done.

# The dshmarket / host Discover card generates the version-less equivalent:
dsh plugin --profile web add dsh-gsd
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

The first public release, **`1.20.1-1.dsh022`**, is ready: all 8 UAT items pass on a clean machine (a throwaway `/tmp` `DSH_HOME` with zero GSD residue); the npm first publish, the GitHub Release and the dshmarket listing follow. What changed in this release is in the matching [`CHANGELOG.md`](./CHANGELOG.md) entry.

## Startup overhead

What does the plugin add to session startup? Three points, measured on a fixed clock: the difference between `session.createdAt` and the first `turn/start.time` in the session record (both written by DSH in milliseconds into `session.v4.jsonl.zstd`).

| Point | Meaning | Measured |
| ----- | ------- | -------- |
| ① baseline | profile without the plugin | **9 ms** |
| ② with plugin | same home, same template + plugin | **279 ms** |
| ③ plugin segment | ① → ② delta | **≈270 ms** |

Setup: one `DSH_HOME`, paired profiles built from the same `--from-default-profile headless` template (differing only by one plugin install), alternated over 3 rounds each (`n=3`), single machine, warm page cache. The delta is a **difference of medians**, not the median of per-round paired differences.

> **Wall clock is not a cost measure.** Time from process start to answer on the same setup drifts between 2 560 and 3 834 ms, dominated by LLM round-trips — using it as "plugin cost" measures model latency.
> **Skill-directory watch (hot reload in long-lived processes) is `not measured`.** One-shot sessions are a fresh process every time and re-read the skill directory at startup, so a watcher structurally does not apply; counting fsevents needs root. This section reports startup cost only — no watch numbers.

## Bootstrapped (a fun aside)

This project is built by itself: once installed into a verification instance, its own skills / engine / hooks drive this repo's entire development process (dogfooding). Curious? See [`.planning/`](./.planning/).

Builders and re-verifiers: [BUILD.md](./BUILD.md) covers GSD_VERSION usage, the four offline/online tiers, exit codes 0/1/2, the gates contract, upstream integrity cross-checks, and the verification-instance re-verify sequence; upstream package metadata (SBOM) lives in [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).

## License

MIT — see [LICENSE](./LICENSE). Bundles upstream content: GSD Core (MIT, © 2026 Open GSD), DeepSeek Harness (MIT).
