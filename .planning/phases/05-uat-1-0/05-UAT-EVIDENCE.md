# 05-UAT-EVIDENCE.md — Phase 05 端到端 UAT 原始证据账本

> **判据对象**：`tests/uat-harness.test.mjs` 的 live 用例。用例 ③ = UAT-01 / INST-01；用例 ④ = INST-02..05；用例 ⑤ = UAT-02 / UAT-03（本文件按判据段追加，判据段 2/3 由后续计划写入）。
> **判据环境形态**：一次性 `DSH_HOME` —— `mkdtemp('/tmp/dsh-uat-')`，**每个用例一份**，成功即删、失败保留并打印路径（取证需要）。真实 `~/.dsh` 全程只读：它**不是**判据环境，因为 `~/.dsh/skills` 有 72 个旧脚本 `gsd-*`、`headless`/`web` 的 patch 里各有 2 行 `GSD-DSH-bridge`（本轮实测 2；`05-CONTEXT` 记的 1 已过时）—— 在那上面「技能可见」会由旧源满足而静默失效（D-01）。
> **目标身份**：`dsh-gsd@1.20.1-1.dsh022`（包内引擎 `@opengsd/gsd-core` 1.20.1，72 skills）；待装件 `dsh-gsd-1.20.1-1.dsh022.tgz`（958 files，4.6 MB）。
> **判据口径**：一切「通过」只认**内容 / 集合 / 事件记录**。exit code 一律不作判据 —— 一次 `MISSING_CREDENTIAL` 的失败轮同样会创建 session 目录与 `.zstd`（实测 `sessions: 1`），`plugin add` / `--dump-config` 在 bundle 被静默跳过时同样 `exit 0`。会话判据的唯一有效形态是「`assistant/message` 在场 ∧ 任何 `turn/end` 内部（递归）无 `kind:error`」。
> **时间**：全表一律 UTC（`date -u +"%Y-%m-%dT%H:%M:%SZ"`）。

## 复验序

对应 `tests/uat-harness.test.mjs` 的三个 live 用例；本条逐项与实际操作一一对应。

1. **判据环境隔离**：每个用例 `mkdtemp('/tmp/dsh-uat-')` 造新 `DSH_HOME`，子进程环境先 `delete` 掉 `DSH_HOME` / `DSH_PROFILE` / `DSH_PROFILE_DIR` / `ALIPAY_API_KEY`，再显式设 `DSH_HOME` 为一次性目录；`NO_COLOR=1`。继承编排会话的 `DSH_HOME=~/.dsh` 就是 D-01 禁止的「本机 profile 进判据」。
2. **零残留前置**：安装前断言 `skills/gsd-*` 计数 0、`gsd-core/` 不在、`gsd-hooks.dsh.json*` 不在、`profiles/*/cordis.patch.yml` 里 `GSD-DSH-bridge` 计数 0、`profiles/*/node_modules/dsh-gsd` 不在。判据环境本身不干净时，全部结论作废（失败消息 `home not residue-free`）。
3. **一次调用建 profile + 跑会话**：`dsh probe --from-default-profile headless --json --approval-policy never "reply with the word OK"`（`--from-default-profile` 就是造 profile 的入口，没有单独的 `profile create`）。
4. **安装**：`dsh plugin --profile probe add /tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz`；随后断言安装真的落到 `profiles/probe/node_modules/dsh-gsd`、`profiles/probe/cordis.patch.yml` 仍是空数组 `[]`、patch 里没有任何 `disabled:` 真值行。
5. **不重启**（每次调用都是新进程 ⇒ hooks/技能天然在新挂载下生效）：再跑一次 one-shot，然后用**会话目录集合的差集**取到这次新建的 `session.v4.jsonl.zstd`（不靠 mtime、不靠 slug 猜）。
6. **会话判据**：`zstd -dc` 解压后逐行 `JSON.parse`，断言 `assistant/message` 在场且所有 `turn/end` 记录内部递归不含 `kind === 'error'`；断言失败消息里带事件类型集合的前 120 字符，便于区分「没产出模型输出」与「这一轮失败了」。
7. **技能来源**：断言安装后 home 级 `skills/` 仍**不存在**（技能只可能来自插件，不可能来自 home 级旧源）。
8. **仓根卫生**：断言仓根无游离 `*.tgz`（tarball 只待在 `/tmp/uat-tgz/`；`*.tgz` 由 `.gitignore:2` 覆盖，但落在工作树里仍说明发布产物越界）。
9. 每项须留有可观察输出（逐字文案 / 实测数字 / 事件类型），**禁止「大概 / 应该 / 目测」式表述**；负向观测必须原样记录并显式标注不得充当通过形态。

## 判据段 1 — UAT-01 / INST-01

> 用例 ③ `③ UAT-01 / INST-01：零残留 /tmp home → plugin add → 新会话的会话记录谓词`（一条路径到底）。`dsh` = 0.2.2-rc.1，`node` = v24.21.0。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `node build.mjs`（产出待打包容器的产品树） | 2026-11-16T06:14:47Z | exit 0；`gates: all passed (A/B/C)`；`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)` |
| `npm pack --ignore-scripts --pack-destination /tmp/uat-tgz` | 2026-11-16T06:14:52Z | `filename: dsh-gsd-1.20.1-1.dsh022.tgz`；`package size: 4.6 MB`；`total files: 958`；`shasum: 85cec6a0039d76d1da2fb74fb52dd31683f6cfe6`。**不带 `--ignore-scripts` 的 `npm pack` 会跑 `prepack` = build + 全量测试，而全量测试里就有本 harness ⇒ 递归且不可收敛**；真实 `prepack` 路径由发布计划的 `npm publish --dry-run` 单独覆盖 |
| 无 live 环境跑 `node --test --test-concurrency=1 tests/uat-harness.test.mjs` | 2026-11-16T06:14:54Z | `ℹ tests 1` / `ℹ pass 0` / `ℹ fail 0` / `ℹ skipped 1`；skip 理由逐条列出缺项：`DSH_UAT_LIVE is not 1 …` \| `DEEPSEEK_API_KEY is not in the process env …`。无 live 环境下「pass」不可能出现 ⇒ 不存在「pass 但没真跑」的形态 |
| 有 live 环境跑同一文件（`DEEPSEEK_API_KEY` 只经进程环境传入、只做一次命令替换、不打印不落盘） | 2026-11-16T06:14:54Z（耗时 8.4 s） | `ℹ tests 1` / `ℹ pass 1` / `ℹ fail 0` / `ℹ skipped 0`。用例内部依次通过：零残留前置（`skills/gsd-*` 0、`gsd-core/` 不在、`gsd-hooks.dsh.json*` 不在、profile patch 里 `GSD-DSH-bridge` 0、`node_modules/dsh-gsd` 不在）→ `probe` profile 由 `--from-default-profile headless` 建出 → `plugin add` 落盘并 exit 0 → `cordis.patch.yml` 正文仍为 `[]` → 第二次 one-shot 新增**恰 1** 个 session 记录 → 该记录 `assistant/message` ≥1 且无 `turn/end{kind:error}` → 安装后 home 级 `skills/` 仍不存在 → 仓根无 `*.tgz` |
| 手动旁证：同一 tarball 装进 `/tmp/dsh-uat-probe-nUxv` 的 `probe` profile 后读回 | 2026-11-16T06:15:34Z | `plugin add` 输出末两行 `+ dsh-gsd 1.20.1-1.dsh022` / `Done in 471ms using pnpm v12.11.2`；`profiles/probe/cordis.patch.yml` 去注释后正文 = `[]`；`profiles/probe/node_modules/dsh-gsd` 在盘；home 级 `skills/`、`gsd-core/`、`gsd-hooks.dsh.json*` 三者皆 `No such file or directory`；profile patch 里 `GSD-DSH-bridge` 命中 0；`dsh --profile probe --dump-config` = exit 0 / **403 行** / stderr **0 B**，`- id: gsd` 在 L393、`- id: gsd-hooks-bridge` 在 L395（各恰 1 行） |
| ⚠ **负向观测**：空入参边 —— `dsh plugin --profile uat-absent add <tgz>`（profile 名此前不存在，全新 home `/tmp/dsh-uat-abs-f6LF`） | 2026-11-16T06:15:03Z | **rc=0**，stderr 首行 `dsh: initialized profile uat-absent at /tmp/dsh-uat-abs-f6LF/profiles/uat-absent`，`profiles/uat-absent` 被创建。**这与 `05-RESEARCH.md:91`「`dsh plugin --profile <absent-name> add` fails — it does not create the profile」直接相反**；`dsh plugin --help` 原文亦为「the profile whose plugins are managed (initialized on first use)」。⇒ 「profile 名不存在时非零退出」这条判据在本 DSH 版本上不成立；harness 改为断言真正的不变量「不存在第三种状态」：要么干净失败且不留下 profile，要么明确宣称初始化并**真的**装出 `gsd` row。**该观测不得充当通过形态，也不得被读成「单命令安装失败」** |

### 边界：这证不了什么

- 一次成功的会话**不证明**技能 watch 行为（一次性会话在启动时重读技能，watch 只存在于长生命周期进程里），也不证明升级 / 回滚（UAT-05，另一计划）。
- 「`assistant/message` 在场 ∧ 无 `turn/end{kind:error}`」证明的是**这一轮跑完了**，不证明模型做了任何具体的事；涉及「模型是否照做」的判据（scaffold、`.env` 拦截）在判据段 3，且必须配阳性对照。
- 本判据段不覆盖 `~/.dsh` 的任何状态：真实 home 全程只读，本段的全部写动作都发生在 `/tmp/dsh-uat-*` 一次性目录里。
- 「仓根无 `*.tgz`」是仓卫生断言，不是发布面断言（发布面由 `tests/pack-contents.test.mjs` 与 `npm pack --dry-run` 覆盖）。