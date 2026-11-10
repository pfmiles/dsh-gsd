# PLAN — 将 install-gsd-dsh 插件化为 dsh-plugin-gsd

> 状态:P0 (spike) 已完成并**全链路验证通过**(含 hooks 阳性拦截,2026-11-10);
> 证据与调试结论见 [SPIKE.md](./SPIKE.md)。进入 P1。
> 目标形态:`dsh plugin --profile <name> add dsh-plugin-gsd@<版本>` 一条命令完成
> GSD 在 DSH 上的安装(72 skills + 引擎 + hooks 守卫桥接),零手工脚本、零 `~/.dsh` 写入。

## 验收标准(UAT,按 P5 在新机器全量执行)

1. 干净机器(无 ~/.dsh 或全新 DSH_HOME)上:
   `dsh plugin --profile web add dsh-plugin-gsd@0.1.0-gsd1.20.1`,重启 `dsh web`。
2. 会话技能目录出现 72 个 `gsd-*`;`/gsd-health` 成功执行。
3. 模型 `read` 一个 `.env` → 被 gsd-secret-read-guard 拦(exit 2,带拦截文案)。
4. 引擎可用:`node $DSH_PROFILE_DIR/node_modules/dsh-plugin-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw`
   打印 `@opengsd/gsd-core` + 目标版本。
5. `/gsd-new-project --auto` 在小测试仓库 scaffold 出 `.planning/`。
6. `dsh plugin --profile web remove dsh-plugin-gsd` → 重启后上述全部消失。
7. 升级/回滚:重跑 add 换版本号,随后同 2-5 抽测通过。
8. 不破坏共存:同一 profile 里其他插件(codegraph/deja/dshmarket 级)不受影响。

## 阶段

### P0 spike(已完成)
- 机制调研、包脚手架、本地 file: 安装验证、卸载/重装回路。
- 证据:[SPIKE.md](./SPIKE.md)。

### P1 生产化构建(构建来源从"本机部署"换成"npm 官方包")
- `build.mjs` 支持 `GSD_VERSION` 入参:fetch `@opengsd/gsd-core@<version>`(npm pack),
  复用官方安装器 `--claude` 通道 staging(与 install-gsd-dsh.sh 的 stage 段同逻辑),
  产物作为改写源。
- 改写映射改为以 staging 根为基准(不再依赖 `/Users/yue.weny/.dsh` 字面量),
  新增对 `~/`、`$HOME` 形态的回退映射。
- 输出 `gsd-core/VERSION` 校验:fetched == requested,否则失败。
- 生成 SBOM-ish 清单(thanks 文件:上游版本号、许可)。
- 产物仍为构建产物不入 git;`prepack` 全量重建。

### P2 版本与兼容矩阵
- 版本号方案:`<gsd-version>-<pkg-rev>-dsh<line>`,如 `1.20.1-1-dsh02`;
  GSD 升版则发新包(用户升级=换版本号)。
- `engines.dsh` 按发布时支撑的 DSH 行收紧(CI matrix 至少跑当前行 + 前一行)。
- CI:对每个兼容 DSH 版本跑「空 profile 安装 + dump-config + boot 冒烟」。
- 决定并固化:`dependencies` 中两个 `@deepseek-ai/dsh-*` 的 pin 是否跟随发布时的
  DSH 行(exact pin + 文档,与旧安装器同策略)。

### P3 发布
- 建独立 GitHub 仓库(git init 已在本地完成);README、LICENSE(Apache-2.0)、
  CHANGELOG;`private` 移除;`dshmarket` 注册(awesome-dsh-plugin.com 流程调研后执行,
  GitHub 仓库本身已支持 `dsh plugin add github:owner/repo` 安装)。
- npm 发布:`npm publish`;建议同时发 GitHub Release。
- 版本豁免流程记录:若未来需要临时绕过 `engines.dsh` 门槛,走插件管理器的
  version-exemption 通道(不默认提供)。

### P4 迁移与共存文档
- 老部署(install-gsd-dsh 装的机器)迁移 runbook:
  1) `bash install-gsd-dsh.sh --uninstall`(清 ~/.dsh 摊平的 skills/gsd-core/hooks/patch);
  2) `npm uninstall -g @opengsd/gsd-core`;
  3) `dsh plugin --profile web add dsh-plugin-gsd@…`;重启。
  顺序不可反(先卸旧再装新,避免同名 skills 双源)。
- install-gsd-dsh.sh 保留定位:离线内网、自定义 DSH_HOME 批量铺、诊断保底;
  README 顶部注明推荐新方式。
- 两套方式的黑盒差异表(全局 CLI、GSD_PROFILE 档位、hooks 事件子集等)。

### P5 端到端 UAT + 收尾
- 新机器/容器干净安装跑第 0 节全部 8 条验收。
- 回归关键 hooks:secret-read(prompt 注入、commit 校验)抽测。
- 性能/启动开销记录(技能目录 watch、桥接解析)。
- 输出 UAT 报告,合入 README;发布 1.0 版。

## 风险与缓解

| 风险 | 缓解 |
|---|---|
| FileSystemSkillProvider 是"事实公开导出",跨 DSH 版本签名变化 | `engines.dsh` 收紧 + CI matrix 按行验证;备选:退回纯 YAML `customSkillDirs` 路线(SPIKE 已确认 `baseUrl` 机制) |
| `ctx.plugin` 挂桥接在热卸载/多行时的生命周期 | 已在 `ctx.effect` 内注册 cleanup;P5 增加 remove/disable 后热卸载测试 |
| hooks 桥接依赖 pin 与 DSH 升版脱节 | 发布策略 P2 + 启动日志告警(`disabling profile plugin row … incompatible`)进入 runbook |
| pnpm 12 "Agent skills awaiting approval" 提示令用户困惑 | README/FAQ 解释;确认不同 pnpm 版本行为(10/11) |
| DSH 无 PreCompact/FileChanged/statusline、无 agents 注册、无 @include 展开 | 与现脚本方案相同的已知宿主限制,SPIKE 的 runtime_note 已含补偿约定;写入差异表 |
| 多个 profile 同时装、同 session 双源冲突 | 迁移 runbook 顺序约束 + 文档 |

## 开放问题
1. dshmarket 注册规范与审核要求(调研后决定是否首发就上)。
2. 是否发布配套 `dsh-plugin-gsd-core` 精简档(对应 GSD_PROFILE=core)?初期不排期。
3. npm 包内直接嵌 hooks/engine 的审计义务(上游更新时的重新打包责任)——CI 用
   GSD release 事件/定时任务驱动重建提示。
4. (可选硬化)secret-read-guard 的 basename 规则对 `*something.env` 不命中
   (上游 #4580 记档取舍):是否在插件内携带收紧版守卫、并与 GSD 升级同步打补丁。
   默认不做,保持上游行为。
