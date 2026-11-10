# SPIKE — dsh-plugin-gsd(把 install-gsd-dsh 插件化)

日期:2026-11-10 · 环境:macOS, DSH 0.2.2-rc.1, Node v24.21.0, pnpm 12.11.2 · 状态:**已验证(见下)**

## 目标

回答一个问题:`install-gsd-dsh.sh` 这套"下载脚本 + 人工运行 + 写 `~/.dsh`"的安装形态,
能否改成 DSH 原生插件,`dsh plugin --profile <name> add dsh-plugin-gsd` 一条命令装完?
如果可以,机制是什么、代价是什么、哪些能力对不齐?

## 关键机制(源码/现网实证)

1. **plugin = pnpm 转发 + bundle 声明**。`dsh plugin` 只是把参数原样转发给 profile 目录里的
   pnpm(dsh lib/plugin-DscIHF4k.js);bundle 自动 reconcile 由 `dsh-app-boot` 的
   `reconcileProfilePlugins()` 负责。实测:add 后 `dsh.profile.bundles` 立即、自动加上
   `dsh-plugin-gsd`,无需重启。remove 后立即消失,node_modules 同步清理。
2. **bundle = npm 包 + `dsh.bundle.patch`**,patch 是 cordis patch 层,先于用户
   `cordis.patch.yml`。第三方先例:@jiangzhenguo/dsh-codegraph、dsh-deja、dshmarket
   (全部同形)。
3. **skills 扩展面**:`@deepseek-ai/dsh-skill-filesystem` 公开导出
   `FileSystemSkillProvider` + `Config`,`customSkillDirs` / `providerName` /
   `includeDefaultRoots` 完全够用;官方默认层自己就是用
   `createRequire(baseUrl).resolve('<pkg>/package.json')` 挂 agent-preset skills 的 ——
   "插件自带技能目录"是第一方用法。
4. **hooks 扩展面**:桥接 `@deepseek-ai/dsh-hooks-claude-code` 只认 `configPath` +
   `pluginRoot`(替换 `${CLAUDE_PLUGIN_ROOT}`),hooks 脚本与配置可以整体搬进包内;
   现有 `gsd-hooks.dsh.json` 的 command 全部是 `${CLAUDE_PLUGIN_ROOT}/hooks/...`,零改写。
5. **cordis 编程挂载**:`ctx.plugin(pluginFn, config)` 存在(cordis 4.1.0)。
   ⚠️ 实测教训:`ctx.plugin('@scope/name', …)` 传字符串会报
   `invalid plugin, expect function or object with an "apply" method` —— 先
   `import { apply } from '<pkg>'` 再传函数。
6. **环境变量**:bash 工具进程带 `DSH_HOME` / `DSH_PROFILE` / `DSH_PROFILE_DIR`
   (dsh-shell-env 注入);profile 用 hoisted node_modules(`pnpm-workspace.yaml:
   nodeLinker: hoisted`),`$DSH_PROFILE_DIR/node_modules/dsh-plugin-gsd/...`
   是稳定可预测路径,成为所有 runtime 路径改写的目标。
7. **兼容门**:`engines.dsh`(自决)或 `@deepseek-ai/dsh-*` peers;不匹配时行被禁用。
8. **pnpm 约束**:生命周期脚本默认被拦截(CLI 通道尤其如此)—— 因此插件必须"零安装脚本、
   纯声明"。本包满足:唯一 build 发生在发布侧(`prepack`),装机侧零动作。
   pnpm 12 会提示 "Agent skills awaiting approval"(识别包内 SKILL.md 的安全提醒),
   实测不影响安装与使用(文件照常链接,DSH 直接按目录发现)。

## 包结构(本仓库交付)

- `package.json`:`dsh.bundle.patch`、`engines.dsh: ">=0.2.2-rc.1 <0.3.0-0"`、
  依赖 `@deepseek-ai/dsh-hooks-claude-code` + `@deepseek-ai/dsh-hook-protocol`
  (后者是桥接的 peer 且 profile `autoInstallPeers: false`,必须显式依赖 —— 老安装器的教训)、
  peer `@deepseek-ai/dsh-skill-filesystem`(宿主提供)。
- `cordis.patch.yml`:单行 `- insert: [{id: gsd, name: 'dsh-plugin-gsd'}]`。
- `index.js`:apply() 内 ①`ctx.skills.registerProvider`(FileSystemSkillProvider,
  providerName `gsd`, includeDefaultRoots false) ②`ctx.plugin(hooksBridgeApply)`
  挂桥接;都包在 `ctx.effect` 里并返回 cleanup;`config.skills/hooks: false` 逃生门。
- `build.mjs`:SPIKE 版从本机部署拷贝资产(默认 `~/.dsh`,可 `GSD_BUILD_SOURCE` 覆盖),
  三件事:剥旧 adapter 块(两种标记格式都剥)、注入新 runtime_note(at 与模型约定
  `$DSH_PROFILE_DIR` 展开规则)、路径改写(gsd-core/skills→包内;`tasks`→`$DSH_HOME/tasks`;
  其余 DSH_HOME 引用→`$DSH_HOME`)。已验证 292 个文件被改写、72 个 SKILL.md 各恰好一个
  adapter 块、零残留绝对路径。
- `locale/{en,zh}.json` + `icon.svg`(插件管理器展示)。

## 实测记录(gsdtest profile,与线上 web profile 隔离)

| 步骤 | 结果 |
|---|---|
| `dsh plugin --profile gsdtest add file:…` | ✅ 安装;bundles 自动出现 `dsh-plugin-gsd` |
| `dsh --profile gsdtest --dump-config` | ✅ `# == dsh-plugin-gsd` 层 + `gsd` 行(后来升级为双行,含 `gsd-hooks-bridge`) |
| 首次 boot(web, 3091) | ❌ `invalid plugin, expect function…` — `ctx.plugin` 传了字符串;已修 |
| 二次 boot(单行 patch + ctx.plugin 桥接) | ✅ 无激活告警;但 hooks 未生效(见下) |
| GUI 目验 skills | ✅ `/` 触发器给出全部 gsd-* 命令提示;`/gsd-health` 端到端跑通(引擎 @opengsd/gsd-core v1.16.0,BROKEN 报告正常输出) |
| 三次 boot(双行 patch,YAML 桥接行) | ✅ hooks 阳性对照通过:read 精确 `.env` → **被硬拦截**,guard 文案完整出现在会话中(2026-11-10 16:49) |
| `remove dsh-plugin-gsd` | ✅ bundles 移除、dump 无 gsd 行、node_modules 清理 |
| 再次 `add`(回路) | ✅ 恢复原状 |

## 关键调试结论(负面结果同样值钱)

1. **`ctx.plugin()` 编程式挂载桥接 → 无效**。模块被 import、apply 也执行(激活无错),
   但桥接从未订阅会话事件:真实会话落盘记录中 hook 条目 = 0(同机主 profile 会话
   数百~数千条)。Loader patch 行(`cordis.patch.yml` 里的独立行)才是官方通路,
   插件最终采用该形态 —— 与 install-gsd-dsh 脚本写出的行同构,但由 bundle 自己携带。
2. **`file:` 安装是"打包冻结"**。`dsh plugin add file:<path>` 按 `files` 字段打
   tarball 后解包,**之后改源码不会同步进 profile**,必须重新 `add`(或
   `--force` / 升版本号)。排障期因此误判"patch 行被 loader 丢弃"——实际上
   `!!js` 双行 patch 自始可用,20 分钟排查打在旧快照上。这条也写进了
   cordis.patch.yml 的 DEV NOTE。
3. **`!!js` 求值上下文确认**:`with(loaderCtx){ eval(expr) }`,
   `loaderCtx.baseUrl` = profile 的 cordis.yml URL;`createRequire(baseUrl)` 从
   profile 起解析 `dsh-plugin-gsd/package.json` → 得到包内绝对路径,与标准预估一致,
   独立求值验证通过。
4. **guard 按 basename 规则判定**(`.env` / `.env.<suffix>` / `.secrets`,
   豁免 `.env.<example|sample|template|dist>` 家族;`*something.env` 不命中)。
   这是上游 GSD 的记档设计(#4580 取舍),不是插件缺陷;是否在插件内带收紧版
   守卫列为可选项(PLAN 开放问题)。

## 已验证 / 未验证

已验证:安装→bundle 注册→启动激活→skills 目录与 `/gsd-*` 命令(GUI 目验)→
`/gsd-health` 引擎端到端→**hooks 桥接阳性拦截(read `.env` → 硬阻塞)**→卸载→重装
全链路;适配改写正确性;引擎 `!!js` 自定位;两条依赖教训。

未验证(留给 P5 UAT):
1. `ctx.effect` 清理行为在 remove/disable 后的热卸载(patchReload: live)。
2. tui/headless 等其他 profile 形态未测(目标场景是 web)。
3. 干净机器全量安装(P5 第 0 节 8 条验收)。

## 遗留决策(已由用户拍板)

- 引擎资产:嵌入(本次 spike 即嵌入,后续生产构建从 npm tarball 取材)。
- 发布:GitHub 仓库 + npm(publish 前去掉 `private: true`;预发 `engines.dsh` 矩阵 CI)。
- 全局 `gsd_run` 不再安装;skills 改走 `node $DSH_PROFILE_DIR/.../gsd-tools.cjs`。
- install-gsd-dsh.sh 保留作旧部署迁移与离线保底。
