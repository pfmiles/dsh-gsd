# verify-evidence.md — Phase 02 DEV-03 验证实例复验证据

> 复验对象：本 phase 构建产物 dsh-gsd（02-01 兼容矩阵/pins/探针/CI + 02-02 版本号方案/文档 + 02-03 本次 `node build.mjs` 终构建，插件版本 `1.20.1-1.dsh022`）
> 验证实例：gsdtest profile @ 127.0.0.1:3091（当前执行会话宿主，DSH runtime 0.2.2-rc.1）
> 目标身份：`@opengsd/gsd-core` / `1.20.1`；profile 快照内插件 `package.json` version = `1.20.1-1.dsh022`
> 证据口径（Phase 1 沿用）：**可观察输出 + UTC 时间戳 + 新快照声明**——禁止"大概/应该/目测"表述，旧快照不充当新证据。

## 复验序（对应 BUILD.md §⑧ + 本计划负向探针）

1. `node build.mjs`（全量重建，GSD_VERSION 默认 1.20.1）
2. `dsh plugin --profile gsdtest add file:. --force`（file: 安装 = 打包冻结快照）
3. **user_setup：重启 3091 实例（主会话/orchestrator 协作，计划执行器自身不做此事）→ 新 token 会话**
4. 三项复验（按序）：独立 CLI identity → `/gsd-health` → read 精确 `.env` 被 guard 硬拦
5. 负向探针：doctored fixture（engines.dsh 窗口不含 0.2.2 系）被宿主安装期干净拒绝（VER-01 活体半）
6. Phase 1 契约回归：dump-config 两行 + `~/.dsh` 零新增

## Task 1 — 自动化段（DEV-03 独立 CLI + 身份/版本快照 + 负向拒绝，本次执行器实测）

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| INST-02 基线快照：`find ~/.dsh/skills ~/.dsh/gsd-core ~/.dsh/hooks -type f \| sort` | 2026-11-11T16:44:30Z | 基线 **1066** 个受管文件 → `.gsd-build-tmp/dsh-before.txt`（Task 2 comm -13 收口用） |
| `node build.mjs` | 2026-11-11T16:44:37Z–16:44:42Z | **exit 0**；`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)`；`gates: all passed (A/B/C)` |
| `dsh plugin --profile gsdtest add file:. --force` | 2026-11-11T16:44:48Z–16:44:49Z | **exit 0**；pnpm `Packages: +6 / added 6, done in 617ms`；`Agent skills awaiting approval: dsh-gsd@file:…`；快照解包至 `$DSH_PROFILE_DIR/node_modules/dsh-gsd` |
| 独立 CLI 复验：`node $DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` | 2026-11-11T16:44:57Z | **exit 0**；输出原文：`{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`（DEV-03 三项之一 + truths ① 前半） |
| 版本快照复验：profile 内 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/package.json` version | 2026-11-11T16:44:57Z | **exit 0**；`installed version: 1.20.1-1.dsh022`（truths ① 后半：新方案版本号真实进入 profile 快照，VER-02 活体） |
| **负向 live 探针**：`dsh plugin --profile gsdtest add file:/tmp/gsd-compat-fixture`（doctored `engines.dsh: ">=0.2.0-rc.1 <0.2.1-0"`，窗口不含运行中的 0.2.2-rc.1） | 2026-11-11T16:45:55Z | **exit 1**（宿主安装期 preflight 拒绝，早于 pnpm）；stderr 全文见下节；`nothing was installed`（清单/锁文件回滚）；fixture 目录用后即弃（`rm -rf` 已执行，无残留） |
| 复原重装：`dsh plugin --profile gsdtest add file:. --force` + 身份复检 | 2026-11-11T16:46:14Z | **exit 0**；pnpm `+6 … done in 579ms`；identity 复检原文 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；version `1.20.1-1.dsh022`（profile 回到产品快照，T-2-08 双侧缓释） |

### 负向拒绝 stderr 全文（VER-01 活体证据可与 README allow-version 声明对照）

```text
dsh: installation rejected: Plugin dsh-gsd@1.20.1-1.dsh022 is incompatible with dsh 0.2.2-rc.1: requirements {"engines.dsh":">=0.2.0-rc.1 <0.2.1-0"}. Running it may cause crashes or data loss. Update the plugin or install a plugin version compatible with this dsh runtime. To accept this risk explicitly, grant the exact-version exemption for dsh-gsd@1.20.1-1.dsh022 on dsh 0.2.2-rc.1 with `dsh plugin allow-version` or the plugin manager, then retry the installation or restart dsh. Exact-version exemption: not active.
dsh: nothing was installed.
dsh: to accept the risk, run: dsh plugin --profile gsdtest allow-version dsh-gsd@1.20.1-1.dsh022 --dsh-version 0.2.2-rc.1 --accept-risk
dsh: plugin command failed; diagnostics: /Users/yue.weny/.dsh/profiles/gsdtest/.plugin-manager/logs/operation-0Dr84c/pnpm.log
```

**结论（Task 1 tracer 切片）**：本 phase 产物（`1.20.1-1.dsh022` 快照）已强制装入 gsdtest；独立 CLI 身份精确 `@opengsd/gsd-core` / `1.20.1`；不兼容安装的活体干净拒绝完整留证（exit 1 + `installation rejected` + `allow-version` 指引 + `nothing was installed` + fixture 用后即弃 + 复原重装回产品快照）。装机侧快照佐证：profile 内 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs` mtime = 2026-11-12 00:44 (+08:00) = **2026-11-11T16:44Z**，与本次构建时间一致（防旧 file: 快照假绿，SPIKE 教训）。

> **机器侧新快照声明**：以上 Task 1 证据全部来自本 phase 重建产物 `node build.mjs`（2026-11-11T16:44:37Z）→ `add file:. --force`（2026-11-11T16:44:48Z）的打包冻结快照（佐证 = 构建 mtime + add 时间戳 + identity/version 双向断言 + 负向探针后复原重装 16:46:14Z）。**重启依赖的三项复验（/gsd-health、read 精确 .env 拦截、ENGINES 门槛人读）在实例重启前不存在——本节不预写其通过结论，待 Task 2 交互段补录。**

---

## Task 2 — 交互段（重启后新 token 会话；本节证据待续，不得以旧快照充数）

> 前置条件（user_setup）：Task 1 复原重装（2026-11-11T16:46:14Z）**之后**由主会话/orchestrator 重启 3091 验证实例（保持 gsdtest profile），并以**新 token 会话**继续。佐证 = 监听 pid 启动时间晚于 add 时间（BUILD.md §⑧ 第 3 步口径）。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `/gsd-health` 端到端（重启后新会话） | 2026-11-11T17:54:00Z | **跑通，0 errors / 2 warnings**。Status DEGRADED：W016 `config.json workflow.ai_integration_phase` 缺键（默认 enabled，无害，`--repair` 可修）；W010 `~/.dsh/agents` 无 Claude agents（DSH 环境良性——角色文件在 `~/.dsh/gsd-core/agents/`，DSH adapter 从该路径读取，本文档已注明）；W025 worktrees/isolation ✔ 无冲突（harness-worktree × use_worktrees:false）。引擎经重装后新快照实际运行并产出诊断输出；引擎身份另由 Task 1 `runtime-identity` 断言（`@opengsd/gsd-core@1.20.1`）与本表 dump-config 双行佐证。原始输出粘贴自用户新会话（本会话收档）。
| read 精确 `.env` 被 guard 硬拦（重启后新会话） | 2026-11-11T17:56:00Z | **硬拦成立**。本会话 Read `/tmp/gsd-verify/.env` → 工具调用被 guard 拒绝（exit-2 语义），文案照录：`Secret read guard: Read would read '/tmp/gsd-verify/.env', which matches a protected secret-file pattern (.env, .env.<suffix> (except .env.example/.sample/.template/.dist), .secrets). Secret values must not be read into the conversation...`。**对照（exit 0）**：同会话同目录 Read `/tmp/gsd-verify/benign-ctl.out` 正常放行，未触发 guard。会话佐证 = 由监听 pid 95618（lstart 2026-11-11T17:38:26Z，晚于复原重装 16:46:14Z）承载的新 token 会话执行。
| `dsh --profile gsdtest --dump-config` gsd + gsd-hooks-bridge 两行 | ⏳ 待续执行器 | （自动项，重启后续执行器执行并记录输出行） |
| INST-02 收口：`.gsd-build-tmp/dsh-after.txt` + `comm -13` vs before（1066 行基准） | ⏳ 待续执行器 | （自动项；差异为空 = 安装侧零新增） |
| ENGINES 门槛文档可解释性人读（02-VALIDATION Manual-Only 第 3 行认领） | ⏳ 待人工 | （人工阅卷：上文 Task 1 负向拒绝 stderr 全文 + README allow-version 风险声明——确认用户能读出「为什么拒、该装哪个」，结论记入本行） |

**新快照声明（三项 live 通过形态，Task 2 完成后必补）**：
> ✅ 已落位（机器佐证）：三项 live 复验的通过形态均来自重装后新快照——`node build.mjs`（2026-11-11T16:44:37Z）→ `add file:. --force`（16:44:48Z；负向探针后复原重装 16:46:14Z）→ **重启**（监听 pid 95618，lstart **2026-11-11T17:38:26Z**，晚于 add/复原重装时间 ✓）→ 新 token 会话（/gsd-health 与 `.env` 拦截均为该会话实况；dump-config 双行由续执行器同快照补齐）。禁止旧 file: 快照充当新证据（本计划 prohibitions ②）；断言佐证 = pid 启动时间 > add 时间 + Task 1 快照 mtime/identity 双向断言。
