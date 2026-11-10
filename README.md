# dsh-gsd

将 [GSD Core](https://github.com/open-gsd/gsd-core)(规格驱动的编码工作流)以 **DeepSeek Harness 原生产插件 bundle** 的形式安装到 DSH。与 `install-gsd-dsh.sh` 脚本方案不同,这里没有任何手工步骤:

```bash
dsh plugin --profile web add dsh-gsd@0.1.0-gsd1.20.1
# 重启 dsh web 即生效
```

- **一条命令**,装的即是 DSH 认知的 plugin(出现在插件管理器/市场同级的 bundle 清单里,可 enable/disable/remove)。
- 自带 72 个 `gsd-*` skills(含 DSH 适配说明)、GSD 引擎(workflows/templates/agents/commands)、
  hooks 守卫 + `dsh-hooks-claude-code` 桥接挂载,全部自包含在本包内,不写 `~/.dsh` 任何文件。
- 升级/回滚 = 换一个版本号重跑同一条命令;卸载 = `dsh plugin --profile <name> remove dsh-gsd`。

## Requirements

- DSH **0.2.2-rc.1 ~ 0.2.x**(`engines.dsh` 门槛强制;更早/更晚版本安装会被拒绝或禁用该行)。
- Node ≥ 24(GSD Core 1.16+ 引擎要求)。
- macOS / Linux / WSL。

## How it works

- 包声明 `dsh.bundle.patch → cordis.patch.yml`,插入一行 `gsd`(本包 `index.js`)。
- `index.js` 在 cordis `apply()` 里:
  1. 用 DSH 官方的 `FileSystemSkillProvider` 把包内 `skills/` 注册为第二个 skill provider
     (`providerName: gsd`,不启用默认根目录扫描);
  2. `ctx.plugin()` 挂载 `@deepseek-ai/dsh-hooks-claude-code`,`configPath`/`pluginRoot`
     指向包内 `config/gsd-hooks.json` 与包根,`${CLAUDE_PLUGIN_ROOT}` 全部在包内展开。
- skills 里的每条 DSH 适配说明(runtime_note)由 `npm run build`(或 `prepack`)生成:
  引擎与工作流路径统一改写为 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...`,
  会话任务目录保留在 `$DSH_HOME/tasks`。runtime 时模型用 bash 展开 `$DSH_PROFILE_DIR` 一次即可。

## 目录结构

```
index.js            应用入口(skill provider + hooks 桥接)
cordis.patch.yml    bundle patch(单行 insert)
build.mjs           资产构建:取材 → 路径改写 → runtime_note 注入
locale/ icon.svg    插件管理器展示元数据
skills/             72 个 gsd SKILL.md(构建产物)
gsd-core/           GSD 引擎(构建产物)
hooks/              守卫脚本 + dsh-gsd-suite/run.cjs(构建产物)
config/gsd-hooks.json  桥接配置(构建产物)
```

## 构建 / 发布

```bash
npm run build                    # 默认从本机 ~/.dsh 的部署拷贝(SPIKE 阶段)
GSD_BUILD_SOURCE=… node build.mjs  # 从指定 DSH_HOME 取材
npm pack                         # prepack 自动执行 build
```

生产发布将改为从 `@opengsd/gsd-core@<version>` npm tarball 取材并经官方 `--claude`
安装通道 staging(见 PLAN.md)。规划文档:[PLAN.md](./PLAN.md),spike 记录:[SPIKE.md](./SPIKE.md)。

> **开发提示**:`dsh plugin add file:<path>` 会按 `files` 字段打包冻结源码 ——
> 改动 index.js / cordis.patch.yml 后必须**重新执行 add**(或加 `--force`)才会进入 profile。

## 验证

1. `dsh plugin --profile web add dsh-gsd`,重启 `dsh web`。
2. 会话 skill 目录中出现 `gsd-*`;`/gsd-health` 可执行。
3. `dsh --profile web --dump-config | grep dsh-gsd` 可见 `gsd` 行。
4. 让模型 `read` 一个 `.env` 文件 → 被 gsd-secret-read-guard 以 exit 2 拦截(桥接生效的证据)。
5. `dsh plugin --profile web remove dsh-gsd` → 下个进程启动后一切消失。

## License

MIT。许可证文本见 [LICENSE](./LICENSE)。上游:GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。第三方组件保留各自许可。
