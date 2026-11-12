# Changelog

本文件记录 dsh-gsd 所有值得注意的变更。
格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，版本方案为 `<gsd-ver>-<rev>.dsh<line>`。
发布约定：每个发布对应一个与版本串逐字相同的 git tag（如 `1.20.1-1.dsh022`，**不加 v 前缀**）；GitHub Release 的正文直接取本文件对应条目。本阶段只把条目成文，Release 本体随首次发布在 Phase 5 执行。

## [Unreleased]

## [1.20.1-1.dsh022] - 2026-11-12

### Added
- 72 个 `gsd-*` skills、GSD 1.20.1 引擎与生命周期守卫 hooks，作为一个 DSH 插件 bundle 分发。
- `cordis.patch.yml` 挂载 `gsd` 与 `gsd-hooks-bridge` 两行；hooks 桥接自带 stdio adapter（`dsh-gsd-suite`）。

### Changed
- 插件安装元数据合规化：`files` 白名单精确收录 `scripts/`、`locale/`、`icon.svg`，漏收即静默降级为技术名/头像。
- 根 peer `@deepseek-ai/dsh-skill-filesystem` 由开区间 `>=0.2.2-rc.1 <0.3.0-0` 收紧为 exact `0.2.2-rc.1`（与 `dependencies` 的 exact 钉法一致）。**维护义务**：`0.2.2-rc.2` 转正或 DSH `0.2.2` 正式发布时，必须随新版本号同步抬 peer —— exact 区间同样排除正式版。

### Fixed
- 引擎 `MODULE_NOT_FOUND`：`scripts/` 兄弟目录随包分发。