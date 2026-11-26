# Requirements: dsh-gsd

**Defined:** 2026-11-10
**Core Value:** 一条命令装好、声明式可回滚的 GSD（见 PROJECT.md）

## v1 Requirements

各检查项映射到 ROADMAP phase；"done" = 在验证实例（gsdtest profile）上可证，P5 在干净机器复验。

### 安装与 UX (INST)

- [x] **INST-01**: `dsh plugin --profile <name> add dsh-gsd@<ver>` 单命令完成安装，无前置脚本、无手工 patch 编辑
- [x] **INST-02**: 安装不写 `~/.dsh` 下任何受管文件（skills/gsd-core/hooks/patch 全部来自插件层）
- [x] **INST-03**: `dsh.profile.bundles` 自动 reconcile，安装即注册，无重启前提（重启仅使 hooks 生效）
- [x] **INST-04**: 卸载 `dsh plugin --profile <name> remove dsh-gsd` 后，skills/hooks/bundle 行全部消失
- [x] **INST-05**: `dsh --profile <name> --dump-config` 可见 `gsd` 与 `gsd-hooks-bridge` 两行，且 `!!js` 自定位展开为包内绝对路径
- [x] **INST-06**: 插件管理器展示元数据合规（locale/en.json + zh.json、icon.svg、files 白名单）

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
- [x] **HOOK-05**: 桥接依赖 pin 与 DSH 版本对齐策略文档化，DSH 升级后的症状与修复写入 runbook

### 版本与兼容 (VER)

- [x] **VER-01**: `engines.dsh` 门槛拒绝/禁用不兼容版本安装
- [x] **VER-02**: 插件版本号方案 = `<gsd-ver>-<rev>-dsh<line>`，升级/回滚 = 同命令换版本号
- [x] **VER-03**: 每个 DSH 兼容行有构建/冒烟验证记录（CI matrix，当前行 + 前一行）
- [x] **VER-04**: Node ≥ 24 门槛与 GSD 引擎要求一致并在 README 声明

### 发布与交付 (PUB)

- [x] **PUB-01**: GitHub 仓库（`pfmiles/dsh-gsd`）建仓并推送，repo 名 = npm 包名 `dsh-gsd`；npm 首次发布推迟到 Phase 5（UAT 通过后）执行
- [x] **PUB-02**: `prepack`=build 全量重建，包内 files 白名单精确（含 scripts/ 修复）
- [x] **PUB-03**: dshmarket curated registry 提交材料与流程就绪（双语描述、category=workflow、install 命令真实）；PR 本体随 npm 首发于 Phase 5 提交
- [x] **PUB-04**: LICENSE（MIT）与上游致谢（GSD MIT、DSH MIT、第三方组件各自许可）

### 迁移与并存 (MIG)

- [x] **MIG-01**: install-gsd-dsh.sh 用户迁移 runbook：uninstall 顺序（先卸旧再装新，避免同名 skills 双源）
- [x] **MIG-02**: 不同部署方式差异表（全局 CLI、GSD_PROFILE 档位、hooks 事件子集）
- [x] **MIG-03**: 旧脚本保留定位（离线/批量铺/诊断保底）并在 README 顶部互链
- [x] **MIG-04**: 同 profile 同时装 dsh-gsd 与其他插件（codegraph/deja/dshmarket 级）无冲突

### 端到端验收 (UAT)

- [x] **UAT-01**: 干净机器（无 ~/.dsh 或全新 DSH_HOME）完成 INST-01 并重启
- [x] **UAT-02**: `/gsd-health` 成功；`/gsd-new-project --auto` 在测试仓库 scaffold `.planning/`
- [x] **UAT-03**: 真实会话 read `.env` 被拦（HOOK-02 复验）
- [x] **UAT-04**: hooks 回归抽测（commit 校验、prompt-injection 扫描）
- [x] **UAT-05**: 升级/回滚同命令换版本号后抽测通过
- [x] **UAT-06**: 启动开销与技能 watch 的量化记录（启动耗时、目录监视行为）—— 启动开销已量化（事件时间戳口径 base 中位 **9 ms** / p5 中位 **279 ms** / 插件段 **≈270 ms**，见 `05-UAT-EVIDENCE.md` 判据段 8 与 15）；**技能 watch 按 T-5-15 记为 `not measured`**，结构性理由写在 README 中英双段与 `05-UAT.md` 的对应行（一次性会话每次都是新进程、启动时重读技能目录，watcher 只在长驻 `web` 进程里可观察，而数 fsevents 需要 root）。本条按计划里预登记的退路（「无 method 2 的读数时必须写 `not measured` 并写出原因」）判定为满足，verifier 于 2026-11-26 显式裁定；**不代表 watch 被观测过**

### Phase 5 收口移交 (D-10)

这五项不是新能力，而是前序 phase 明确移交到 Phase 5、但原始 ROADMAP Requirements 行未点名的实物（04-D-02 / 04-D-08-09 / 04-D-10 / 04-VALIDATION 的 G-4）。Phase 5 的 D-10 裁决把它们全部纳入，并回写进 ROADMAP 的 Requirements 行与 Success Criteria 6–10。列在这里是为了让每一份计划里出现的需求 ID 都能在这份文档里找到出处（否则 plan:post 的 gap-analysis 会持续报它们「Missing from REQUIREMENTS.md」）。

- [x] **D-10-1**: `--test-concurrency=1` 在 `package.json` 的 `test`、`prepack` 与 `.github/workflows/compat-matrix.yml` 的全量测试步三处齐备，并由计数断言守护（消除并发假红这条发布中止风险）
- [x] **D-10-2**: G-4 闭合 —— 真实迁移 `web` 后跑步骤 6 静态段的四条来源 row id 断言（`MISSING:` 判红）与 CB-8b/`COEXIST-REAL` 五条合取（`@jiangzhenguo/dsh-codegraph` 的行级证据升级为运行时证据）
- [x] **D-10-3**: 真实 `~/.dsh` 迁移完成（04-D-02 的移交）—— 旧源为零、`web` 与 `headless` 的插件 row 各恰 1、包内 72 技能与两项字节数对齐
- [x] **D-10-4**: 旧仓 `pfmiles/install-gsd-dsh` 互链已推送（04-D-08/D-09 的移交）—— 远端 main 前进且插入正文与 `docs/oldrepo-link/snippet.en.md` 逐字节一致
- [x] **D-10-5**: `gsd-core/bin/lib/ui-frontend-evidence.cjs` 的 `SKIP_DIRS` 含 `.gsd-build-tmp`，且经得住两次重建（补丁落 `build/assets/` + `build.mjs` 的拷贝步，不直接改构建产物）

### 自举开发 (DEV)

- [ ] **DEV-01**: 本仓库的 GSD 流程由验证实例（3091/gsdtest）驱动，主实例不推进 phase
- [ ] **DEV-02**: 插件源码变更的刷新协议文档化（--force 重装 + 重启 + 新 token）
- [x] **DEV-03**: 每个 phase 的完成物在验证实例上 gate 通过后才算 done
- [ ] **DEV-04**: 至少一个完整 milestone（Phase 1）在验证实例稳定通过后，插件才装到主 profile
