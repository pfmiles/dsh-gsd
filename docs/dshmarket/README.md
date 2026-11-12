# dshmarket 提交材料（Phase 5 提交）

本目录是 Phase 3 产出的提交资产，**不随 npm 包发布**（`docs/` 不在 `package.json` 的 `files` 里，npm 也不会无条件收录它），因此 pack 面零 churn。

## 1. 目标与路径

- 目标仓库：[`awesome-dsh-plugin/awesome-dsh-plugin`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)（catalog 数据的唯一真源；`dshmarket` 市场 UI 只是消费方）。
- 提交路径：`data/plugins/pfmiles__dsh-gsd.yml`（一个插件一个文件；文件名由目标仓 `scripts/lib/entries.mjs` 的 `slugFor(url)` 生成）。
- 提交时点：**Phase 5**，与 npm 首发同批进行（D-02）。本目录只备料，不提 PR。

## 2. 卡片 install 命令（逐字）

市场卡片与宿主 Discover 的安装命令由目标仓 CI 生成，**不带版本号**：

```
dsh plugin --profile web add dsh-gsd
```

它与 README 里的同名示例逐字一致（README 同时保留 pinned 的规范命令）。该命令能否解析取决于 Phase 5 首发时的 `dist-tags.latest`。

## 3. 可证事实清单

- 72 个 `gsd-*` skills（包内 `skills/` 实测计数）。
- GSD 引擎 `@opengsd/gsd-core` 1.20.1（`THIRD-PARTY-NOTICES.md` 记录 dist 校验值）。
- 双语 `meta.title` / `meta.description`（`locale/en.json`、`locale/zh.json`），文案与本条目的 `description.{en,zh}` 同源。
- catalog 侧四检（源自目标仓 `contributing.md` 与 `scripts/check-submission.mjs`）：每 PR ≤3 条、根 `package.json` 声明 `dsh.bundle`、仓龄 ≥1 天、`awesome-lint` + site build 通过。

## 4. 非纯聚合包论证

- 自带 `index.js` skill provider（本包自己注册技能面，不是只把别人的插件列成清单）。
- `hooks/dsh-gsd-suite` 提供 stdio adapter；`config/gsd-hooks.json` 是本包自己的 hooks 配置。
- 因此符合目标仓「List the plugins, not the bundle」的判据：bundle 自己做事。