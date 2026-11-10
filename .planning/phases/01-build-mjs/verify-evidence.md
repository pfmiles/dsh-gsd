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

> 前置复查（只读）：两轮 user_setup 历史 —— 第一轮 `--force add` 2026-11-10T13:20:24Z → 重启 pid 67367
> （13:27:20Z）；该会话上 .env 拦截 live 探针**未过** → 根因定位与修复（下节）→ 第二轮（含修复）
> `--force add` ≈2026-11-10T13:57:48Z → 重启 pid **90223**，`ps -o lstart=` = **Tue Nov 10 21:58:39 2026**
> （+08:00）= **2026-11-10T13:58:39Z** ✅ 晚于 add → 当前会话为含修复快照重装后的新 token 会话。
> 本轮三项 live 复验均在该快照上执行。
> 快照加固核验（只读，2026-11-10T14:06Z）：已装 `hooks/dsh-gsd-suite/run.cjs` 存在且与仓库 canonical
> `build/assets/dsh-gsd-suite-run.cjs` **逐字节一致**（IDENTICAL；mtime 21:45 = 修复重建产物时间，file: 打包
> 冻结保留 mtime）；profile 内 `gsd-core/VERSION`=`1.20.1`；已装 `config/gsd-hooks.json` 与 canonical 模板一致
> ——防旧 file: 快照假绿（SPIKE 教训）。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `/gsd-health` 端到端（第一轮会话，经包内引擎，历史记录） | 2026-11-10T13:29–13:32Z | **通过**。`runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；`query validate.health` → `status: degraded`、errors 0、warnings 2（W016 ai_integration_phase 键缺失可修 / W010 缺 gsd-dom-verifier agent——上游内容形态，非本管线破坏）、info 1（I001=01-03 无 SUMMARY，进行中符合预期）、repairable_count 1；BROKEN 报告机制正常输出。 |
| read 精确 `.env`（第一轮会话，负向诊断——不作为通过证据） | 2026-11-10T13:33–13:44Z | ⚠️ **未拦** → 根因定位 → Rule-1 修复 → 产物级证明（见下节"拦截复验与回归修复"）。第一轮快照缺 wrapper（`hooks/dsh-gsd-suite/run.cjs` 不随 npm tarball）→ hook spawn MODULE_NOT_FOUND → 桥接 fail-open。该轮输出**不得充当通过形态**（本计划 prohibitions 第二条）。 |
| `dsh --profile gsdtest --dump-config` 两行确认（第一轮会话，历史记录） | 2026-11-10T13:36Z | **通过**（exit 0）。`# == dsh-gsd` 层存在；`- id: gsd`（name: dsh-gsd）与 `- id: gsd-hooks-bridge`（name: '@deepseek-ai/dsh-hooks-claude-code'，configPath/pluginRoot 指向包内 config/gsd-hooks.json 与包根）两行均在——bundle 层完好。 |
| **live ① `/gsd-health` 端到端**（第二轮快照） | 2026-11-10T14:03–14:04Z | ✅ **通过**。引擎经包内路径 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs` 解析：`runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`（exit 0）；`query validate.health` → `status: degraded`、**errors 0**、warnings 2（W016 config 键缺失可修、W010 缺 gsd-dom-verifier agent——上游内容形态）、info 1（I001=01-03 无 SUMMARY，进行中符合预期）、`repairable_count` 1。与第一轮基线形态一致，BROKEN 报告机制正常输出。 |
| **live ② read 精确 `.env` 被硬拦（本轮核心）** | 2026-11-10T14:03–14:05Z | ✅ **硬拦通过，四路证据**：① `read` 工具读 `/tmp/gsd-verify/.env`（先 `ls` 只读确认存在，40B dummy）→ 工具级拒绝 + guard 文案完整（受保护模式 `.env` / `.env.<suffix>`（.env.example 等模板族豁免）/ `.secrets`，提示凭据不可进入会话、名称去读 .env.example）——**零内容进入会话**；② `bash` `cat` 同源 → 同样工具级硬拦（PreToolUse 契约把 hook 拒绝转为调用拒绝）；③ live 快照进程级直证（wrapper 注入 DSH 小写 payload）：read payload → `{"decision":"block","code":"secret-read","tool":"Read",…}` **exit 2**、bash payload → `{"decision":"block","code":"secret-read","tool":"Bash",…}` **exit 2**；④ 良性对照 read `README.md` → **exit 0**。 |
| **live ③ `--dump-config` 两行** | 2026-11-10T14:05:44Z | ✅ **通过**（exit 0，输出 1321 行）。`- id: gsd`（name: dsh-gsd）与 `- id: gsd-hooks-bridge`（name: '@deepseek-ai/dsh-hooks-claude-code'）两行均在（本输出 L1280–1283）——bundle 层完好。 |

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
5. **live 复验闭环（第二轮 user_setup 后，本轮延续执行器）**：含修复快照经 `--force add`
   （≈13:57:48Z）+ 重启 3091（pid 90223，13:58:39Z）+ 新 token 会话后，上表 live ①-③三项全部通过——
   read 精确 `.env` 两个工具入口均被硬拦、进程级 `decision:block / code:secret-read` exit 2、
   良性 read exit 0。回归修复的 live 证明闭环，旧快照（第一轮）输出已标注为历史负向、不充当通过证据。

**新快照声明（含修复快照，live 通过形态齐备）**：
> 三项复验的 live 通过证据均来自第二轮（**含修复**）`--force add`（≈2026-11-10T13:57:48Z）→ 重启 3091
> （pid **90223**，启动 2026-11-10T13:58:39Z）→ 新 token 会话的快照：`/gsd-health` 通过（身份 1.20.1 /
> degraded / 0 errors）、read 精确 `.env` **硬拦**（两个工具入口 + 进程级 `decision:block /
> code:secret-read` exit 2 + 良性 exit 0）、`--dump-config` gsd 与 gsd-hooks-bridge 两行在。
> 修复 wrapper 已装入该快照且与仓库 canonical 逐字节一致。第一轮（13:20:24Z add / 13:27:20Z 重启）
> 快照的负向输出仅作根因历史，**不充当通过证据**（本计划 prohibitions 第二条）。
