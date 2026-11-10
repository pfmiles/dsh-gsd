---
gsd_state_version: '1.0'
status: planning
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# STATE: dsh-gsd

## Current Focus

Phase 1: 生产化构建（build.mjs 换源 + 引擎独立可用）。当前 build.mjs 从本机部署取材（SPIKE 形态），需切换到 `@opengsd/gsd-core@<GSD_VERSION>` npm tarball → 官方 `--claude` staging 通道。

## Key Decisions（已锁定）

1. 名称 `dsh-gsd`（registry 主流形态，repo/npm/条目三处同名）
2. 引擎资产嵌入插件包（版本自锁），GSD 升级 = 发新插件版本
3. 全局 gsd_run 不安装；skills 用 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/...` 路径
4. hooks 桥接走 bundle patch YAML 行（ctx.plugin 已证不订阅事件）
5. secret-read-guard 保持上游 basename 行为
6. 开发隔离：GSD phase 只在 3091 验证实例驱动；主 profile 装备插件需等 Milestone 1 稳定通过
7. install-gsd-dsh.sh 保留作迁移/离线保底

## Context Snapshot（最近一次同步）

- 分支：local git（master，4 commits；发布期建 GitHub remote）
- 验证实例：gsdtest profile @ 127.0.0.1:3091，插件 file: 安装（dsh-gsd）
- 已知修复：scripts/ 兄弟目录缺失 → 引擎 MODULE_NOT_FOUND（已并入 build.mjs）
- 当前引擎版本：@opengsd/gsd-core 1.16.0（部署快照；P1 起可参数化）
- 构建产物不入 git：skills/ gsd-core/ hooks/ config/ scripts/

## Progress Log

- 2026-11-10 bootstrapping：`.planning/` 由主会话按 GSD 模板生成；GSD 流程随后移交 3091 验证实例驱动
