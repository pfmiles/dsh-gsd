<!-- generated-by: gsd-doc-writer -->

# dsh-gsd

**一条命令，把 GSD——规格驱动的 AI 编码工作流（72 个 skills + 引擎 + 守卫 hooks）——装成 DeepSeek Harness (DSH) 的原生产插件 bundle。**

**EN** — GSD, the spec-driven AI coding workflow (72 skills + engine + guard hooks), installed into DeepSeek Harness (DSH) as a native plugin bundle with a single command.

```bash
dsh plugin --profile web add dsh-gsd@0.1.0-gsd1.20.1
# 重启 dsh web 即生效
```

- 自带 72 个 `gsd-*` skills（含 DSH 适配说明）、GSD 引擎（workflows/templates/agents/commands）、hooks 守卫 + `dsh-hooks-claude-code` 桥接，全部自包含在包内，不写 `~/.dsh` 任何文件。
- 升级/回滚 = 换一个版本号重跑同一条命令；卸载 = `dsh plugin --profile <name> remove dsh-gsd`。
- ⚠️ 当前为 **P0 spike 已验证**形态（2026-11-10 file: 安装全链路通过，含 hooks 阳性拦截）；registry 公开通道随 [ROADMAP](./.planning/ROADMAP.md) Phase 3 开放，干净机器 8 项 UAT 收官在 Phase 5。

**EN** — Self-contained (72 gsd skills with DSH runtime notes, the GSD engine, guard hooks + the dsh-hooks-claude-code bridge). Upgrade/rollback = re-run with a new version; remove with one command. Currently a P0-verified spike; the public registry channel opens at roadmap Phase 3, with clean-machine UAT closing at Phase 5.

## ⚡ Bootstrapped · 自举开发

**这个项目由它自己开发。**

dsh-gsd 的开发流程本身由 dsh-gsd 驱动：插件被装入验证实例（gsdtest profile @ 127.0.0.1:3091）之后，该实例上的 72 个 `gsd-*` skills、引擎与守卫 hooks 便开始推进本仓库的 ROADMAP——每个 phase 的计划、实现与验证，都跑在**插件自己提供的引擎/skills/hooks**上（dogfooding 约定，见 [PROJECT.md](./.planning/PROJECT.md) DEV-04）。

自举循环大致是这样的：

```text
写插件源码 → file: 装入验证实例 → 用装好的 GSD 驱动下一个 phase →
新构建产物重装 → 继续推进 …
```

证据就在仓库里：

- [`.planning/`](./.planning/)（REQUIREMENTS / PROJECT / ROADMAP / STATE）由 GSD 模板生成并随 git 提交；
- [PLAN.md](./PLAN.md) 与 [SPIKE.md](./SPIKE.md) 记录了 spike → 决策 → 生产化这条由引擎驱动的开发轨迹；
- 提交历史本身就是自举的产物——包括你正在读的这份 README。

**EN** — This project is built by itself. Once the plugin is installed into a verification instance (gsdtest profile @ 127.0.0.1:3091), its own 72 skills, engine and hooks drive this repo's roadmap — every phase is planned, implemented and verified on the engine the plugin itself ships (dogfooding). The `.planning/` artifacts, PLAN.md, SPIKE.md, the commit history — and this very README — are products of that bootstrap loop.

## 为什么不用安装脚本 · Why

`install-gsd-dsh.sh` 需要手工步骤且安装结果对 DSH 不可见；dsh-gsd 把同样内容打包为 DSH 认知的原生 bundle：出现在插件管理器同一清单里，可 enable/disable/remove，通过 `dsh.bundle.patch` 以声明式 cordis 补丁完成装配。

**EN** — Replaces the install script with a DSH-native bundle: visible in the plugin manager, enable/disable/remove, assembled declaratively via a cordis bundle patch.

## 要求 · Requirements

- DSH `>=0.2.2-rc.1 <0.3.0-0`（`engines.dsh` 强制门槛：范围内接受，范围外安装被拒绝或禁用）。
- Node ≥ 24（GSD 引擎要求）。
- macOS / Linux / WSL。
- Linux 上无 bubblewrap 时守卫 hooks fail-open（与脚本安装版同行为）。

**EN** — DSH `>=0.2.2-rc.1 <0.3.0-0` (enforced by the `engines.dsh` gate), Node ≥ 24, macOS/Linux/WSL. On Linux without bubblewrap, guard hooks fail open (same behavior as the script installer).

## 工作原理 · How it works

[cordis.patch.yml](./cordis.patch.yml) 向宿主 cordis 组合插入两行：

1. **`gsd`** — 即本包 [index.js](./index.js)：注册第二个 skill provider（复用 DSH 官方 `FileSystemSkillProvider`，`providerName: gsd`，指向包内 `skills/`，不启用默认根目录扫描，随 dispose 清理）。
2. **`gsd-hooks-bridge`** — 挂载 `@deepseek-ai/dsh-hooks-claude-code`，`configPath`/`pluginRoot` 由 `createRequire(baseUrl)` 从本包位置动态解析（指向 [config/gsd-hooks.json](./config/gsd-hooks.json) 与包根），不依赖任何 `~/.dsh` 字面量，安装可整体迁移。

> 注：早期方案曾在 `index.js` 里以 `ctx.plugin()` 程序化挂载 hooks，spike 验证其不订阅会话事件，遂改为上述独立的 patch 行（证据见 [SPIKE.md](./SPIKE.md)）。

构建期（[build.mjs](./build.mjs)）把 skills 内的引擎/工作流引用统一改写为 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...`，任务目录保留在 `$DSH_HOME/tasks`，并为每个 SKILL.md 注入 DSH 适配说明（`<runtime_note>`）——运行时模型只需用 bash 展开 `$DSH_PROFILE_DIR` 一次。

**EN** — Two cordis rows: `gsd` registers a filesystem skill provider over the package's `skills/` directory; `gsd-hooks-bridge` mounts the hooks bridge with package-relative config paths. The build rewrites engine/workflow paths to `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` and injects a DSH runtime note into every skill.

## 目录结构 · Layout

```text
index.js               应用入口(skill provider)
cordis.patch.yml       bundle patch(两行 insert)
build.mjs              资产构建:取材 → 路径改写 → runtime_note 注入
locale/ icon.svg       插件管理器展示元数据(中英双语)
skills/                72 个 gsd SKILL.md(构建产物)
gsd-core/              GSD 引擎(构建产物)
hooks/                 守卫脚本 + dsh-gsd-suite/run.cjs(构建产物)
config/gsd-hooks.json  桥接配置(构建产物)
scripts/               引擎配套脚本(构建产物)
```

**EN** — Entry (`index.js`), bundle patch, build script, bilingual plugin metadata, 72 skills, the GSD engine, guard hooks with the hook-suite runner, bridge config, and engine support scripts.

## 构建与发布 · Build & Release

```bash
npm run build                      # 当前形态:从本机 ~/.dsh 的部署拷贝取材
GSD_BUILD_SOURCE=/path/to/home node build.mjs   # 从指定 DSH_HOME 取材
npm pack                           # prepack 自动执行 build
```

- **Phase 1（进行中）**：`GSD_VERSION=… node build.mjs` 改从 `@opengsd/gsd-core@<version>` npm tarball 取材，复用官方 `--claude` staging 通道；输出版本交叉校验与 SBOM 式 thanks 清单。
- **Phase 3**：GitHub 仓库 + npm 发布 + dshmarket 注册；仓库形态即支持 `dsh plugin add github:<owner>/<repo>` 安装。

**EN** — Currently sources assets from a local `~/.dsh` deployment; Phase 1 switches to the `@opengsd/gsd-core` npm tarball via the official `--claude` staging channel, adding a version cross-check and an SBOM-style thanks list. Phase 3 covers GitHub/npm/dshmarket publication; the repo form already supports `github:` installs.

## 验证 · Verification

1. `dsh plugin --profile web add dsh-gsd`（GitHub 源或 file: 源），重启 `dsh web`。
2. 会话 skill 目录出现 72 个 `gsd-*`；`/gsd-health` 可执行。
3. `dsh --profile web --dump-config | grep dsh-gsd` 可见 `gsd` 行。
4. 让模型 `read` 一个 `.env` 文件 → 被 gsd-secret-read-guard 以 exit 2 拦截（桥接生效的证据）。
5. `dsh plugin --profile web remove dsh-gsd` → 下个进程启动后一切消失。

完整验收清单见 [PLAN.md](./PLAN.md) 的 8 项 UAT；干净机器全量执行安排在 Phase 5。

**EN** — Five smoke checks: the 72 skills appear and `/gsd-health` runs; config shows the bundle; a `.env` read is blocked by gsd-secret-read-guard (exit 2); removal takes effect on the next start. The full 8-item UAT runs on a clean machine at Phase 5.

## License

MIT。许可证文本见 [LICENSE](./LICENSE)。上游：GSD Core (MIT, © 2026 Open GSD)、DeepSeek Harness (MIT)。第三方组件保留各自许可。

**EN** — MIT. See [LICENSE](./LICENSE). Upstream: GSD Core (MIT, © 2026 Open GSD), DeepSeek Harness (MIT); third-party components keep their own licenses.
