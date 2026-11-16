# Changelog

本文件记录 dsh-gsd 所有值得注意的变更。
格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，版本方案为 `<gsd-ver>-<rev>.dsh<line>`。
发布约定：每个发布对应一个与版本串逐字相同的 git tag（如 `1.20.1-1.dsh022`，**不加 v 前缀**）；GitHub Release 的正文直接取本文件对应条目。本阶段只把条目成文，Release 本体随首次发布在 Phase 5 执行。

## [Unreleased]

## [1.20.1-1.dsh022] - 2026-11-12

### Added
- 72 个 `gsd-*` skills、GSD 1.20.1 引擎与生命周期守卫 hooks，作为一个 DSH 插件 bundle 分发。
- `cordis.patch.yml` 挂载 `gsd` 与 `gsd-hooks-bridge` 两行；hooks 桥接自带 stdio adapter（`dsh-gsd-suite`）。
- 干净机器 8 项 UAT 全部通过：判据跑在一次性 `/tmp` 新 `DSH_HOME`（零 GSD 残留）上，覆盖安装、卸载、同一条命令换版本号、两个 hooks 的三段对照、`.env` 拦截与阳性对照、启动开销；判据表与原始证据随仓（`05-UAT.md` / `05-UAT-EVIDENCE.md`）。
- 启动开销实测结论进入 README 双语（`## 启动开销` / `## Startup overhead`）：基线 9 ms、带插件 279 ms、插件段 ≈270 ms（事件时间戳口径，`n=3`、单机、暖页缓存）；技能目录 watch 如实标为 `not measured`。

### Changed
- 插件安装元数据合规化：`files` 白名单精确收录 `scripts/`、`locale/`、`icon.svg`，漏收即静默降级为技术名/头像。
- 根 peer `@deepseek-ai/dsh-skill-filesystem` 由开区间 `>=0.2.2-rc.1 <0.3.0-0` 收紧为 exact `0.2.2-rc.1`（与 `dependencies` 的 exact 钉法一致）。**维护义务**：`0.2.2-rc.2` 转正或 DSH `0.2.2` 正式发布时，必须随新版本号同步抬 peer —— exact 区间同样排除正式版。
- 发布态：移除 `private` 标记，`publishConfig.tag` 钉 `latest`（本机 npm 12 对 prerelease 版本缺显式 tag 时会在写网络之前硬拒；`registry` 仍钉 `https://registry.npmjs.org/`，该键只治理发布写入，读仍需显式 `--registry`）。

### Fixed
- 引擎 `MODULE_NOT_FOUND`：`scripts/` 兄弟目录随包分发。