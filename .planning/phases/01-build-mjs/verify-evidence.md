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

## Task 2 — 交互段（重启后新 token 会话执行；本节证据得自新快照）

> 前置复查（只读，2026-11-10T13:27:20Z 前）：`lsof -nP -iTCP:3091 -sTCP:LISTEN` = pid **67367**；
> `ps -o lstart= -p 67367` = **Tue Nov 10 21:27:20 2026**（+08:00）= **2026-11-10T13:27:20Z**，
> 晚于最后一次 `--force add`（profile 包 mtime **2026-11-10T13:20:24Z**）→ 当前会话为重启后新 token 会话 ✅。
> 包内 `gsd-core/VERSION`=`1.20.1`，`bin/gsd-tools.cjs` mtime 与 add 一致。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `/gsd-health` 端到端（经包内引擎） | 2026-11-10T13:29–13:32Z | **通过**。`node $DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；`query validate.health` → `status: degraded`、errors 0、warnings 2（W016 ai_integration_phase 键缺失可修 / W010 缺 gsd-dom-verifier agent——上游内容形态，非本管线破坏）、info 1（I001=01-03 无 SUMMARY，进行中符合预期）、repairable_count 1；`inspect-dispatch-isolation`=`harness-worktree`、`workflow.use_worktrees`=false（W025 未触发）。BROKEN 报告机制正常输出。 |
| read 精确 `.env`（/tmp/gsd-verify/.env，dummy 占位内容）被 guard 硬拦 | 2026-11-10T13:33–13:44Z | ⚠️ **首探未拦 → 根因定位 → Rule-1 修复 → 产物级证明**（见下节"拦截复验与回归修复"）。当前实例快照缺少 `hooks/dsh-gsd-suite/run.cjs`（npm tarball 不随包、registry 全量引用）→ 钩子 spawn MODULE_NOT_FOUND → 桥接 fail-open。**live 重验待下一次 `--force add` + 重启 + 新会话（user_setup）**。 |
| `dsh --profile gsdtest --dump-config` 两行确认 | 2026-11-10T13:36Z | **通过**（exit 0）。`# == dsh-gsd` 层存在；`- id: gsd`（name: dsh-gsd）与 `- id: gsd-hooks-bridge`（name: '@deepseek-ai/dsh-hooks-claude-code'，configPath/pluginRoot 指向包内 config/gsd-hooks.json 与包根）两行均在——bundle 层完好。 |

### 拦截复验与回归修复（Task 2 内 Rule-1，一次收敛）

1. **首探对照**（新快照会话内）：`read` 工具与 bash `cat` 读取 /tmp/gsd-verify/.env（仅 dummy 占位内容）
   均**未被拦**。按计划安全纪律：不传播内容，判定为安全 gate 失效信号，转诊断。
2. **根因**（read-only 逐层核对，2026-11-10T13:36–13:40Z）：新快照 `config/gsd-hooks.json`
   的 PreToolUse 注册逐字节 == SPIKE 已证可用的 ~/.dsh 部署版（7 组 matcher 全同），
   但全部 hook 命令经 `${CLAUDE_PLUGIN_ROOT}/hooks/dsh-gsd-suite/run.cjs` 调度，而
   **`dsh-gsd-suite/` 是 install-gsd-dsh.sh 的部署产物，不在 @opengsd/gsd-core npm tarball 树内**——
   01-01 从 tarball 捕获的 4 树因此丢了这个适配器（SPIKE 期用的 legacy build 从 ~/.dsh 取材所以没暴露）。
   负向实证：对新快照按注册命令行 spawn → `MODULE_NOT_FOUND …/hooks/dsh-gsd-suite/run.cjs`；
   同一 payload 经 ~/.dsh 部署版 wrapper + 新快照 guard → `{"decision":"block","code":"secret-read",…}` exit 2。
3. **修复**：wrapper 作为本仓库 canonical 内容入库 `build/assets/dsh-gsd-suite-run.cjs`
   （与 install-gsd-dsh.sh 同契约、行文一致），build.mjs ⑤ 捕获段追加拷贝至
   `hooks/dsh-gsd-suite/run.cjs`（不改上游、不改 4 树语义）。
4. **修复验证（产物级端到端）**：`GSD_VERSION=1.20.1 node build.mjs` → exit 0、`gates: all passed (A/B/C)`、
   72 skills；注册命令行对重建产物注入 DSH 小写 payload：read `.env` → **exit 2**
   + `decision: block / code: secret-read` + guard 文案；bash `cat …/.env` → **exit 2** + 文案；
   良性 read → exit 0；`.env.example`（豁免族）→ exit 0。`npm test` 7/7 全绿（含真实构建 smoke）。
5. **live 复验依赖 user_setup**（执行器契约禁止本会话再执行 `--force add` 与重启）：
   下一次 `dsh plugin --profile gsdtest add file:. --force` → 重启 3091 → 新 token 会话内
   read 精确 `.env` 须被硬拦（exit 2 + 文案），届时由延续执行器在本表第 3 行补记通过形态。

**新快照声明**：
> 本节 /gsd-health 与 dump-config 证据、以及拦截回归的负向诊断证据，均来自本次重装后新快照
> （`--force add` 2026-11-10T13:20:24Z → 重启 3091（pid 67367）2026-11-10T13:27:20Z → 新 token 会话）。
> 拦截的 **live 通过形态**尚缺：修复（wrapper 恢复）已入库并经产物级负/正向证明，但须下一轮
> `--force add` + 重启后的新会话录证——旧快照输出不得充当该项证据（本计划 prohibitions 第二条）。
