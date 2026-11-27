# Roadmap: dsh-gsd

## Overview

从"机制已验证的 spike"走到"干净机器一条命令可用、可升级可回滚的发布版"。前四阶段在验证实例（gsdtest/3091）上自举推进：先生产化构建（P1），再做版本兼容矩阵（P2），发布通道（P3），迁移与并存文档（P4），最后干净机器全量 UAT 收官（P5）。Phase 1 稳定通过后插件才装到主 profile（DEV-04）。

**dogfooding 备注**：本 ROADMAP 由 dsh-gsd 插件自身驱动（3091 实例），每个 phase 的完成物都在插件自己提供的引擎/skills/hooks 上验证。

## Phases

- [x] **Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用）** - 构建源从本机部署改为 @opengsd/gsd-core npm tarball，GSD_VERSION 参数化，scripts/ 兄弟目录齐备 (completed 2026-11-11)
- [x] **Phase 2: 版本与兼容矩阵** - engines.dsh 模型化、CI matrix、版本号方案固化 (completed 2026-11-12)
- [x] **Phase 3: 发布（GitHub + npm + dshmarket）** - 发布就绪：建仓并推送、prepack 校验、CHANGELOG、L37 修复后 CI 首绿 (completed 2026-11-12)
- [x] **Phase 4: 迁移与并存** - runbook、差异表、旧脚本定位互链 (completed 2026-11-15)
- [x] **Phase 5: 端到端 UAT 与 1.0 收官** - 干净机器 8 项验收 + hooks 回归 + 开销记录 (completed 2026-11-26)

## Phase Details

### Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用）

**Goal**: build.mjs 支持 `GSD_VERSION` 从 `@opengsd/gsd-core@<version>` npm tarball 取材并经官方 `--claude` staging，改写映射以 staging 根为基准；产物含 scripts/，独立 CLI 全绿。
**Depends on**: Nothing（P0 spike 已完成）
**Requirements**: SKIL-03, SKIL-04, INST-02, DEV-03
**Success Criteria** (what must be TRUE):
  1. `GSD_VERSION=1.20.1 node build.mjs` 在离线/在线环境产出与当前等效的 76 棵树
  2. 改写不再依赖任何机器特定前缀（staging 根为基准）
  3. `node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 从 repo 产物直接输出身份 JSON
  4. fetched 版本与请求版本不一致时构建失败
  5. 验证实例重装后 `/gsd-health` + 独立 CLI + `.env` 拦截三项复验通过

**Plans**: 3/3 plans complete

Plans:
**Wave 1**
- [x] 01-01: staging 取源管线（npm pack → 官方 --claude staging → 产物捕获）

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02: 改写与 gate 迁移（staging-相对映射、版本交叉校验、scripts/ 固化）

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-03: 验证实例全量复验与构建文档

### Phase 2: 版本与兼容矩阵

**Goal**: DSH 行 × GSD 版本的兼容矩阵体系，engines.dsh 与依赖 pin 策略固化，CI 冒烟。
**Depends on**: Phase 1
**Requirements**: VER-01, VER-02, VER-03, VER-04, DEV-03
**Success Criteria**:
  1. `.github/workflows` 存在矩阵 CI（当前 DSH 行 + 前一行 × GSD 版本）
  2. 版本号方案 `<gsd-ver>-<rev>-dsh<line>` 文档化并示例
  3. 不兼容安装被 engines.dsh 干净拒绝，日志可解释
  4. 桥接依赖 pin 与 DSH 行对齐的脚本/文档位

**Plans**: TBD（执行时 plan）
Plans:
- [x] 02-03-PLAN.md

**Wave 1**
- [x] 02-01: 兼容矩阵与 CI [TBD 细化]

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-02: 版本号与 pin 策略落地 [TBD 细化]

### Phase 3: 发布（GitHub + npm + dshmarket）

**Goal**: 发布就绪 —— repo 建仓并推送、packaging 面符合 npm 规范、CI 首绿；真正的 `npm publish` / GitHub Release / dshmarket PR 移交 Phase 5（干净机器 UAT 通过后）执行。
**Depends on**: Phase 2
**Requirements**: PUB-01..04, INST-06
**Success Criteria**:
  1. `npm pack` 产出的 tarball 在干净 profile 装成并 boot（registry 通道 `dsh plugin add dsh-gsd@<ver>` 由 Phase 5 复验）
  2. npm pack 清单 = files 白名单且含 scripts/、locale、icon
  3. dshmarket 提交材料就绪（双语文案、category=workflow、install 命令与 README 逐字一致）+ 提交流程已查实（PR 本体由 Phase 5 提交）
  4. README 徽章/许可（MIT）/上游致谢齐备
  5. CI 首次激活 run 全绿（L37 上游漂移修复后 push，无红跑历史）
  6. CHANGELOG.md 首个条目成文（对应 1.20.1-1.dsh022）

**Plans**: 3/3 plans complete
Plans:
**Wave 1**
- [x] 03-01: 发布管线与 CI 首绿（peer 收紧两文件 per D-05、workflow 两项加固 per D-08、pack 清单防线纳管 —— 首跑条件就绪）

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-02: 元数据与提交材料（manifest 元数据、README 徽章/裸名示例、CHANGELOG、dshmarket 材料；全 phase 终值计数）

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 03-03: 首次 push 与 CI 首绿验收（四格合练 → blocking-human 推送裁决 → 首跑 success 且 total_count==1）

### Phase 4: 迁移与并存

**Goal**: 脚本部署用户的无痛迁移，两种方式可解释可回退。
**Depends on**: Phase 3
**Requirements**: MIG-01, MIG-02, MIG-03, MIG-04
**Success Criteria**:
  1. runbook 全流程在验证机走通（uninstall → add → 复验）
  2. install-gsd-dsh.sh README 顶部互链，定位重述为保底/离线
  3. 同 profile 与 codegraph/deja/dshmarket 并存无冲突实测

**Plans**: 5/5 plans complete（原列 2 项，plan-phase 按需求簇拆为 4：MIG-01 / MIG-02+MIG-03 / HOOK-05 / MIG-04；`/gsd-verify-work` 前身 `04-VERIFICATION.md` 判 `gaps_found` 后，`/gsd-plan-phase 04 --gaps` 追加 `04-05`（`gap_closure: true`），故本 phase 共 5 份计划）

**Wave 1**
- [x] 04-01: 迁移 runbook 与实测 —— tracer 端到端演练（临时 home）+ §① + README 双语入口

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 04-02: 三轴差异表与旧仓备料 —— §② + `docs/oldrepo-link/`

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 04-03: 版本错配症状表 —— §③ + ⑭ 守卫 + `BUILD.md` 38/38

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 04-04: 并存验证与边界声明 —— 静态 id 集合 + 临时 home 同层合成（前置 `blocking-human` 门）

**Wave 5** *(blocked on Waves 1–4 completion — gap closure)*
- [x] 04-05: 缺口闭合 —— 步骤 1 硬门补「面 1 技能 + 逐 profile 裁决」（D-03/D-07）+ 步骤 6 拆两形态、真实迁移改用「在册 ⇔ 挂上」配对判据（MIG-04）；顺带 WR-03 / IN-01..IN-04

### Phase 5: 端到端 UAT 与 1.0 收官

**Goal**: 干净机器全量验收，发布 1.0。
**Depends on**: Phase 4
**Requirements**: UAT-01, UAT-02, UAT-03, UAT-04, UAT-05, UAT-06, INST-01, INST-02, INST-03, INST-04, INST-05, INST-06, PUB-01, PUB-03, D-10-1, D-10-2, D-10-3, D-10-4, D-10-5

> **D-10 回写说明**（逐 ID 显式列出，不用区间形态 `UAT-01..06` —— Phase 4 的 `req-line-misparse` 就是因为 CLI 不展开区间）：`D-10-1` = `--test-concurrency=1` 三处齐备（`package.json` 的 `test`/`prepack` + `compat-matrix.yml` 全量测试步；`prepack` 缺它会假红并中止发布）；`D-10-2` = G-4 codegraph 并存复验（真实迁移 `web` 后重跑步骤 6 静态段四条来源断言 + `COEXIST-REAL`；`MISSING:` 必须判红）；`D-10-3` = 真实 `~/.dsh` 整体迁移（`web`/`headless` 一并处置）；`D-10-4` = 旧仓 `pfmiles/install-gsd-dsh` 互链提交与推送；`D-10-5` = `SKIP_DIRS` 补 `.gsd-build-tmp` 且经得住 `node build.mjs` 重建（落 `build/assets/` + 构建期拷贝，不手改构建产物）。

**Success Criteria**:
  1. UAT-01..05 全绿（干净 DSH_HOME 安装、skills、健康、拦截、scaffold、升级回滚）
  2. hooks 回归（commit 校验拦截错误格式、injection 扫描落日志）
  3. 启动开销数字与技能 watch 行为记录入 README
  4. 1.0 发布 + UAT 报告
  5. 对外动作执行：`npm publish`（registry 通道复验）+ GitHub Release + dshmarket PR 本体（Phase 3 备料的落地）
  6. （D-10-1）`--test-concurrency=1` 在 `package.json` 的 `test`、`package.json` 的 `prepack` 与 `.github/workflows/compat-matrix.yml` 的全量测试步**三处**齐备，且有一条计数断言守着它
  7. （D-10-2）G-4 闭合：真实迁移 `web` 后步骤 6 静态段的四条来源 row id 两两不相交（`MISSING:` 判红）且 `COEXIST-REAL` 通过
  8. （D-10-3）真实 `~/.dsh` 迁移完成：旧源为零、`web` 与 `headless` 的插件 row 各恰 1、包内 72 技能与两项字节数对齐
  9. （D-10-4）旧仓 `pfmiles/install-gsd-dsh` 互链已推送：远端 main 的 sha 前进且插入正文与 `docs/oldrepo-link/snippet.en.md` 逐字节一致
  10. （D-10-5）`gsd-core/bin/lib/ui-frontend-evidence.cjs` 在**构建后**的 `SKIP_DIRS` 含 `.gsd-build-tmp`，连跑两次 `node build.mjs` 仍成立

**Plans**: 4/4 plans complete（原列 2 项；按 D-10 的「五件全纳入」扩到 4，收口段单独成最后一波 —— D-11 要求它必须在所有 `.planning/` 产物提交之后）

**Wave 1**
- [x] 05-01: 判据 harness 与安装/会话面 —— tracer（干净 `/tmp` home → 装插件 → 会话谓词）+ INST-02..05 + UAT-02/03 + `--test-concurrency=1` 三处与 ⑮（D-01 / D-02 / D-10-1）

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 05-02: 残余判据、构建补丁与报告 —— hooks 两向（UAT-04）+ 升级回滚（UAT-05）+ 三点开销与 watch 处置（UAT-06）+ `SKIP_DIRS` 构建期补丁（D-10-5）+ `05-UAT.md`

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 05-03: 发布态树与不可逆对外动作 —— 四处 manifest 改动 + README/CHANGELOG + dry-run + `checkpoint:decision`（D-04）+ 人类 `npm publish` + registry 复验 + Release + dshmarket PR（PUB-01 / PUB-03）

**Wave 4** *(blocked on Wave 3 completion — 机器级收口，最后一个波次)*
- [x] 05-04: 只读预检 → 3091 刷新 → 真实 `~/.dsh` 迁移与 G-4 → 旧仓互链推送（D-10-2 / D-10-3 / D-10-4）

## Milestones

- **Milestone 1** = Phase 1（验证实例稳定通过后，插件装到主 profile —— DEV-04 触发点）
- Milestone 2 = Phase 2+3（发布具备）
- Milestone 3 = Phase 4+5（1.0）
