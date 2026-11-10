# verify-evidence.md — Phase 01 DEV-03 验证实例复验证据

> 复验对象：本 phase 构建产物 dsh-gsd（01-01 取源链 + 01-02 改写/gate 迁移 + 01-03 本次 `node build.mjs` 终构建）
> 验证实例：gsdtest profile @ 127.0.0.1:3091（当前执行会话宿主）
> 目标身份：`@opengsd/gsd-core` / `1.20.1`

## 复验序（对应 BUILD.md §验证实例复验）

1. `node build.mjs`（全量重建，GSD_VERSION 默认 1.20.1）
2. `dsh plugin --profile gsdtest add file:. --force`（file: 安装 = 打包冻结快照）
3. **user_setup：重启 3091 实例（主会话/orchestrator 协作，计划执行器自身不做此事）→ 新 token 会话**
4. 三项复验：独立 CLI（本文件 Task 1 段）→ `/gsd-health` → read 精确 `.env` 被 guard 硬拦（本文件 Task 2 段）
5. 每项须留有可观察输出（拦截 exit 2 + 文案、health 诊断正文），禁止"大概/应该/目测"表述

## Task 1 — 自动化段（DEV-03 独立 CLI + INST-02 安装侧，本次执行器实测）

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| INST-02 基线快照：`find ~/.dsh/skills ~/.dsh/gsd-core ~/.dsh/hooks -type f \| sort` | 2026-11-10T13:16:53Z | 基线 **987** 个受管文件 → `.gsd-build-tmp/dsh-before.txt` |
| `node build.mjs` | 2026-11-10T13:17:00Z | **exit 0**；`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)`；`gates: all passed (A/B/C)` |
| `dsh plugin --profile gsdtest add file:. --force` | 2026-11-10T13:17:08Z | **exit 0**；pnpm `Packages: +6 / added 6, done in 791ms`；`Agent skills awaiting approval: dsh-gsd@file:…`；快照解包至 `$DSH_PROFILE_DIR/node_modules/dsh-gsd` |
| 快照 B（同 find 命令） | 2026-11-10T13:17:24Z | **987** 个受管文件 → `.gsd-build-tmp/dsh-after.txt`；`comm -13 dsh-before dsh-after` 输出为空 → **无新增**（INST-02 安装侧实证） |
| 独立 CLI 复验：`node $DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` | 2026-11-10T13:18:16Z | **exit 0**；输出原文：`{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` |
| bundle 层只读核对：`dsh --profile gsdtest --dump-config` | 2026-11-10T13:17:24Z–13:18:30Z | `# == dsh-gsd` 层在；`gsd` 与 `gsd-hooks-bridge` 两行在（bundle 层完好） |

**结论（Task 1 tracer 切片）**：新构建产物已强制装入 gsdtest，独立 CLI 身份精确为 `@opengsd/gsd-core` / `1.20.1`，~/.dsh 受管文件集合零新增（987 → 987）。此段证据来自 **2026-11-10T13:17:08Z 的 --force add 解包快照**——佐证：profile 内 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/VERSION` 与 `bin/gsd-tools.cjs` 的 mtime == 本次构建时间 2026-11-10T13:17:00Z（防旧 file: 快照假绿，SPIKE 教训）。

## Task 2 — 交互段（待主会话重启后新会话执行）

> **此段必须在"重启后的新 token 会话"执行并补记**（DEV-02 刷新协议：file: 安装为打包冻结快照，
> `--force` add 后必须重启 DSH 进程 + 新会话才加载新产物）。重启前本段保持空缺，
> 由重启后的延续执行器补记——禁止以旧快照输出充当本段证据。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `/gsd-health` 端到端 | （待补记） | （待补记——期望：引擎 @opengsd/gsd-core v1.20.1 诊断输出、BROKEN 报告正常输出，与 SPIKE 基线一致） |
| read 精确 `.env`（如 /tmp/gsd-verify/.env）被 guard 硬拦 | （待补记） | （待补记——期望：exit 2 + gsd-secret-read-guard 文案完整，hooks 桥接阳性对照） |
| `dsh --profile gsdtest --dump-config` 两行确认 | （待补记） | （待补记——期望：`gsd` 与 `gsd-hooks-bridge` 两行仍在） |

**新快照声明**（重启后由延续执行器补记）：
> 以上 Task 2 交互段证据来自本次重装后新快照（`--force add` → 重启 3091 → 新 token 会话）。
