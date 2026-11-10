# Requirements: dsh-gsd

**Defined:** 2026-11-10
**Core Value:** 一条命令装好、声明式可回滚的 GSD（见 PROJECT.md）

## v1 Requirements

各检查项映射到 ROADMAP phase；"done" = 在验证实例（gsdtest profile）上可证，P5 在干净机器复验。

### 安装与 UX (INST)

- [ ] **INST-01**: `dsh plugin --profile <name> add dsh-gsd@<ver>` 单命令完成安装，无前置脚本、无手工 patch 编辑
- [x] **INST-02**: 安装不写 `~/.dsh` 下任何受管文件（skills/gsd-core/hooks/patch 全部来自插件层）
- [ ] **INST-03**: `dsh.profile.bundles` 自动 reconcile，安装即注册，无重启前提（重启仅使 hooks 生效）
- [ ] **INST-04**: 卸载 `dsh plugin --profile <name> remove dsh-gsd` 后，skills/hooks/bundle 行全部消失
- [ ] **INST-05**: `dsh --profile <name> --dump-config` 可见 `gsd` 与 `gsd-hooks-bridge` 两行，且 `!!js` 自定位展开为包内绝对路径
- [ ] **INST-06**: 插件管理器展示元数据合规（locale/en.json + zh.json、icon.svg、files 白名单）

### 技能与引擎 (SKIL)

- [ ] **SKIL-01**: 会话技能目录出现全部 72 个 `gsd-*`，`/` 触发命令提示可用
- [ ] **SKIL-02**: `/gsd-health` 端到端跑通（引擎独立解析 + 诊断输出）—— 引擎经 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` 路径运行
- [x] **SKIL-03**: 独立 CLI：`node $DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 输出 `@opengsd/gsd-core` + 版本（scripts/ 兄弟目录齐备，MODULE_NOT_FOUND 已修复）
- [x] **SKIL-04**: SKILL.md 中无任何机器特定绝对路径（构建期改写 + 校验 gate）
- [ ] **SKIL-05**: runtime_note 约定模型可执行（GSDROOT 展开、工具名平移、@path/$ARGUMENTS 渐进披露）

### Hooks 桥接 (HOOK)

- [ ] **HOOK-01**: 桥接经 bundle patch 行挂载（YAML 行，非 ctx.plugin），configPath/pluginRoot 指包内
- [ ] **HOOK-02**: 阳性拦截：read 文件名恰为 `.env`/`.env.<suffix>` 被 guard 硬拦（exit 2 + 文案）
- [ ] **HOOK-03**: 会话落盘存在 hook 记录（区别于"挂载但静默"）
- [ ] **HOOK-04**: guard 行为与上游 GSD 一致（basename 规则，不含内容判定）—— 不以内容拦截替代
- [ ] **HOOK-05**: 桥接依赖 pin 与 DSH 版本对齐策略文档化，DSH 升级后的症状与修复写入 runbook

### 版本与兼容 (VER)

- [ ] **VER-01**: `engines.dsh` 门槛拒绝/禁用不兼容版本安装
- [ ] **VER-02**: 插件版本号方案 = `<gsd-ver>-<rev>-dsh<line>`，升级/回滚 = 同命令换版本号
- [ ] **VER-03**: 每个 DSH 兼容行有构建/冒烟验证记录（CI matrix，当前行 + 前一行）
- [ ] **VER-04**: Node ≥ 24 门槛与 GSD 引擎要求一致并在 README 声明

### 发布与交付 (PUB)

- [ ] **PUB-01**: GitHub 仓库（dsh-gsd）+ npm 发布，repo/npm/registry 三处同名
- [ ] **PUB-02**: `prepack`=build 全量重建，包内 files 白名单精确（含 scripts/ 修复）
- [ ] **PUB-03**: dshmarket curated registry PR 提交（双语描述、category=workflow、install 命令真实）
- [ ] **PUB-04**: LICENSE（Apache-2.0）与上游致谢（GSD MИT、DSH MIT、第三方组件各自许可）

### 迁移与并存 (MIG)

- [ ] **MIG-01**: install-gsd-dsh.sh 用户迁移 runbook：uninstall 顺序（先卸旧再装新，避免同名 skills 双源）
- [ ] **MIG-02**: 不同部署方式差异表（全局 CLI、GSD_PROFILE 档位、hooks 事件子集）
- [ ] **MIG-03**: 旧脚本保留定位（离线/批量铺/诊断保底）并在 README 顶部互链
- [ ] **MIG-04**: 同 profile 同时装 dsh-gsd 与其他插件（codegraph/deja/dshmarket 级）无冲突

### 端到端验收 (UAT)

- [ ] **UAT-01**: 干净机器（无 ~/.dsh 或全新 DSH_HOME）完成 INST-01 并重启
- [ ] **UAT-02**: `/gsd-health` 成功；`/gsd-new-project --auto` 在测试仓库 scaffold `.planning/`
- [ ] **UAT-03**: 真实会话 read `.env` 被拦（HOOK-02 复验）
- [ ] **UAT-04**: hooks 回归抽测（commit 校验、prompt-injection 扫描）
- [ ] **UAT-05**: 升级/回滚同命令换版本号后抽测通过
- [ ] **UAT-06**: 启动开销与技能 watch 的量化记录（启动耗时、目录监视行为）

### 自举开发 (DEV)

- [ ] **DEV-01**: 本仓库的 GSD 流程由验证实例（3091/gsdtest）驱动，主实例不推进 phase
- [ ] **DEV-02**: 插件源码变更的刷新协议文档化（--force 重装 + 重启 + 新 token）
- [x] **DEV-03**: 每个 phase 的完成物在验证实例上 gate 通过后才算 done
- [ ] **DEV-04**: 至少一个完整 milestone（Phase 1）在验证实例稳定通过后，插件才装到主 profile
