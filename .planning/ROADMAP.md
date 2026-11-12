# Roadmap: dsh-gsd

## Overview

从"机制已验证的 spike"走到"干净机器一条命令可用、可升级可回滚的发布版"。前四阶段在验证实例（gsdtest/3091）上自举推进：先生产化构建（P1），再做版本兼容矩阵（P2），发布通道（P3），迁移与并存文档（P4），最后干净机器全量 UAT 收官（P5）。Phase 1 稳定通过后插件才装到主 profile（DEV-04）。

**dogfooding 备注**：本 ROADMAP 由 dsh-gsd 插件自身驱动（3091 实例），每个 phase 的完成物都在插件自己提供的引擎/skills/hooks 上验证。

## Phases

- [x] **Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用）** - 构建源从本机部署改为 @opengsd/gsd-core npm tarball，GSD_VERSION 参数化，scripts/ 兄弟目录齐备 (completed 2026-11-11)
- [x] **Phase 2: 版本与兼容矩阵** - engines.dsh 模型化、CI matrix、版本号方案固化 (completed 2026-11-12)
- [ ] **Phase 3: 发布（GitHub + npm + dshmarket）** - 发布就绪：建仓并推送、prepack 校验、CHANGELOG、L37 修复后 CI 首绿
- [ ] **Phase 4: 迁移与并存** - runbook、差异表、旧脚本定位互链
- [ ] **Phase 5: 端到端 UAT 与 1.0 收官** - 干净机器 8 项验收 + hooks 回归 + 开销记录

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

**Plans**: TBD
Plans:
- [ ] 03-01: 发布管线与 CI 首绿（L37 修复、pack 清单防线纳管）
- [ ] 03-02: 元数据与提交材料（MIT/README/CHANGELOG、dshmarket 材料与流程）

### Phase 4: 迁移与并存

**Goal**: 脚本部署用户的无痛迁移，两种方式可解释可回退。
**Depends on**: Phase 3
**Requirements**: MIG-01..04
**Success Criteria**:
  1. runbook 全流程在验证机走通（uninstall → add → 复验）
  2. install-gsd-dsh.sh README 顶部互链，定位重述为保底/离线
  3. 同 profile 与 codegraph/deja/dshmarket 并存无冲突实测

**Plans**: TBD
Plans:
- [ ] 04-01: 迁移 runbook 与实测
- [ ] 04-02: 并存验证与文档

### Phase 5: 端到端 UAT 与 1.0 收官

**Goal**: 干净机器全量验收，发布 1.0。
**Depends on**: Phase 4
**Requirements**: UAT-01..06, INST-01..06 全量复验, PUB-01（npm 首发部分）, PUB-03（PR 本体部分）
**Success Criteria**:
  1. UAT-01..05 全绿（干净 DSH_HOME 安装、skills、健康、拦截、scaffold、升级回滚）
  2. hooks 回归（commit 校验拦截错误格式、injection 扫描落日志）
  3. 启动开销数字与技能 watch 行为记录入 README
  4. 1.0 发布 + UAT 报告
  5. 对外动作执行：`npm publish`（registry 通道复验）+ GitHub Release + dshmarket PR 本体（Phase 3 备料的落地）

**Plans**: TBD
Plans:
- [ ] 05-01: 干净机器 UAT 执行与报告
- [ ] 05-02: 1.0 发布收尾

## Milestones

- **Milestone 1** = Phase 1（验证实例稳定通过后，插件装到主 profile —— DEV-04 触发点）
- Milestone 2 = Phase 2+3（发布具备）
- Milestone 3 = Phase 4+5（1.0）
