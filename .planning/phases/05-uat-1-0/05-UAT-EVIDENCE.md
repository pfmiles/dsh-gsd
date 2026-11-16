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

### ⑮ 变异实验（一次性证据，不写进套件）

> 目的：证明 `docs-consistency` 的 ⑮ 不是恒绿。做法 = 把 `package.json` 复制到 `/tmp/uat-mut15/`，从 `prepack` 删掉 `--test-concurrency=1`，再用**与 ⑮ 同形**的谓词各跑一遍。**若 ⑮ 在删掉 flag 的副本上仍绿，则 ⑮ 无效。**

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `node /tmp/uat-mut15/predicate-15.mjs ./package.json`（真树） | 2026-11-16T06:20:03Z | `PREDICATE: PASS (all three sites carry the flag)`；rc=0 |
| 把 `package.json` 复制到 `/tmp/uat-mut15/` 并删掉 `prepack` 里的 flag → `node /tmp/uat-mut15/predicate-15.mjs /tmp/uat-mut15/package.json` | 2026-11-16T06:20:03Z | 变异后 `prepack` = `node build.mjs && node --test tests/*.test.mjs`；`PREDICATE: FAIL — package.json scripts.prepack 缺 --test-concurrency=1 ⇒ \`npm publish\` 的 prepack 阶段会与 build-smoke 的重建并发，假红直接中止发布（人手输完 OTP 之后）`；rc=1。⇒ ⑮ 有牙 |
| `grep -c -- '--test-concurrency=1' package.json .github/workflows/compat-matrix.yml` | 2026-11-16T06:20:03Z | `package.json:2` / `.github/workflows/compat-matrix.yml:1` ⇒ 合计**恰 3**（`>= 3` 不算通过：多出来的一处意味着有人新增了第四处而没有同步 ⑮ 的计数口径） |
| 串行纪律对照：`node --test tests/*.test.mjs`（**无** flag，改动前的形态） | 2026-11-16T06:19:41Z | `ℹ tests 40` / `ℹ pass 39` / `ℹ fail 0` / `ℹ skipped 1`，6.8 s；`gate C: no SKILL.md` 命中 **0** —— **并发假红本轮未复现** |
| 串行纪律对照：`node --test --test-concurrency=1 tests/*.test.mjs`（带 flag，改动后的形态） | 2026-11-16T06:19:48Z | `ℹ tests 40` / `ℹ pass 39` / `ℹ fail 0` / `ℹ skipped 1`，7.3 s。两次读数同值 ⇒ 本轮**未复现**假红；`05-RESEARCH.md:731` 亦记「No — deliberately not」。**不为凑一条红反复重试**（复现会弄脏构建树）——flag 依机制与「prepack 假红会中止发布」这条阻塞风险立论，不依本轮是否撞见 |

### 边界：这证不了什么

- 一次成功的会话**不证明**技能 watch 行为（一次性会话在启动时重读技能，watch 只存在于长生命周期进程里），也不证明升级 / 回滚（UAT-05，另一计划）。
- 「`assistant/message` 在场 ∧ 无 `turn/end{kind:error}`」证明的是**这一轮跑完了**，不证明模型做了任何具体的事；涉及「模型是否照做」的判据（scaffold、`.env` 拦截）在判据段 3，且必须配阳性对照。
- 本判据段不覆盖 `~/.dsh` 的任何状态：真实 home 全程只读，本段的全部写动作都发生在 `/tmp/dsh-uat-*` 一次性目录里。
- 「仓根无 `*.tgz`」是仓卫生断言，不是发布面断言（发布面由 `tests/pack-contents.test.mjs` 与 `npm pack --dry-run` 覆盖）。
## 判据段 2 — INST-02..05

> 用例 ④ `④ INST-02..05：受管面差集 / 装即注册 / !!js 展开 / 卸载归零与两个边`。以下手工旁证在一次性 home `/tmp/dsh-uat-ev-6yWA` 内用与用例 ④ 同形的快照逻辑跑出（`dsh` 0.2.2-rc.1 / node v24.21.0），跑完即删。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `dsh probe6 --from-default-profile headless --dump-config`（只造 profile，不起会话）→ 装前快照 | 2026-11-16T06:37:27Z | exit 0；home 树（排除 `profiles/probe6/`）= **1 行**，digest `b0728870211bbcae…`；受管面五类全是 `ABSENT`（`skills` / `gsd-core` / `hooks` / `gsd-hooks.dsh.json*` / 根级 `cordis.patch.yml`） |
| `dsh plugin --profile probe6 add dsh-gsd-1.20.1-1.dsh022.tgz` → 装后快照 | 2026-11-16T06:37:27Z | exit 0；home 树 digest **不变**（`b0728870211bbcae…`，仍 1 行）；差集 `{"added":[],"removed":[]}`；受管面五类逐项与装前**逐字相同**且仍全 `ABSENT` ⇒ INST-02 成立：安装只写 `profiles/<p>/` |
| `dsh --profile probe6 --dump-config`（**add 之后不重启**，每次调用都是新进程） | 2026-11-16T06:37:27Z | exit 0；**404 行**；stderr **0 B**；`- id: gsd` 行计数 **1**、`- id: gsd-hooks-bridge` 行计数 **1**（行级正则 `^\s*-\s+id:\s+<id>\s*$`，不用 `includes('gsd')`——那会把 bridge 行重复计入）⇒ INST-03 成立 |
| 同一 dump 的 bridge block 原文 | 2026-11-16T06:37:27Z | `- id: gsd-hooks-bridge` / `name: '@deepseek-ai/dsh-hooks-claude-code'` / `config:` / `configPath: !!js >-` / `process.getBuiltinModule('node:path').join(… createRequire(baseUrl).resolve('dsh-gsd/package.json')), 'config/gsd-hooks.json')`；整段无 `${…}` 占位符 |
| 用 DSH 加载器语义求值该 `!!js` 表达式（`baseUrl` = profile 目录） | 2026-11-16T06:37:27Z | 求值结果 `/private/tmp/dsh-uat-ev-6yWA/profiles/probe6/node_modules/dsh-gsd/config/gsd-hooks.json`（**绝对路径 ∧ 含 `node_modules/dsh-gsd`**）；`existsSync` = **true** ⇒ INST-05 成立 |
| `dsh plugin --profile probe6 remove dsh-gsd` | 2026-11-16T06:37:30Z | exit 0；随后的 `--dump-config` 里 `gsd` 行 **0**、`gsd-hooks-bridge` 行 **0**；`profiles/probe6/node_modules/dsh-gsd` **不在盘上**。（删之前这一侧已在场：dump 两行各 1 + `node_modules/dsh-gsd` 在盘——两侧都断言）⇒ INST-04 正向边成立 |
| 对同一 profile 再 `remove` 一次（幂等边） | 2026-11-16T06:37:30Z | exit **1**；`profiles/probe6/package.json` **逐字节相同**（manifest 未被改动）；stdout **空**（没有任何「移除成功」行） |
| 对**从未装过**的 profile `uat-never` 跑 `remove`（空操作边） | 2026-11-16T06:37:30Z | exit **1**；`package.json` **逐字节相同**；stderr 首行 `Error: ERR_PNPM_CANNOT_REMOVE_MISSING_DEPS`；没有伪装成一次成功卸载 |
| 用例 ④ 本体的 live 实跑（开关见 `tests/uat-harness.test.mjs` 文件头） | 2026-11-16T06:38:04Z（2.0 s） | `ℹ pass 3 / ℹ fail 0 / ℹ skipped 0`（三用例一起跑；④ 单独 2010 ms 通过） |

### 实测与计划/研究不一致的一处（必须记录，不得改判据凑绿）

`05-RESEARCH.md` §Q10（`:895`）与 `05-VALIDATION.md:61` 写的是「`grep -A3 'id: gsd-hooks-bridge'` → `configPath` 是含 `node_modules/dsh-gsd` 的绝对路径，**不是** `!!js` 字面量」。**实测不成立**：本机 `dsh --profile <p> --dump-config` 输出里 `!!js` 表达式**不被求值**（该文件共 21 处 `!!js`，含 base/headless 出厂 bundle 自身的 `task: !!js ctx.headlessStartup.task`），DSH 源码注释亦为 "without booting or evaluating `!!js`"。⇒ 「dump 里出现绝对路径」这条字面断言恒红。用例 ④ 改为**对该 `!!js` 声明式求值**（`baseUrl` = profile 目录，与加载器同语义），断言求值结果是包内绝对路径且文件在盘——这比原判据更强（同时排掉 CR-01 那类自定位 off-by-one），且 failure 消息保留 `configPath is not an absolute in-package path` / `!!js literal survived unexpanded` 两个可区分 token。

### 边界：这证不了什么

- INST-02 只覆盖**一次性 home 的 home 级受管面**（`skills/` `gsd-core/` `hooks/` `gsd-hooks.dsh.json*` 根级 patch）。它不证明真实 `~/.dsh` 的受管面未被改动到（那属于真实迁移计划的判据段），也不覆盖 `profiles/` 下其他 profile 的字节。
- 「装即注册」证明的是 **composition 里出现两行**，不证明 hooks 在真实工具调用里真的拦住——后者在判据段 3（`.env`）与另一计划的 SC-2 里单独判。
- INST-04 的幂等边只覆盖**单进程串行**的重复 `remove`；并发 `plugin add/remove` 无锁语义文档，不在本 phase 判据内（`05-01-PLAN.md` 的 probe_dispositions 已把该边标为 FLAGGED ASSUMPTION）。

## 判据段 3 — UAT-02 / UAT-03

> 用例 ⑤ `⑤ UAT-02 / UAT-03：gsd-new-project 造 .planning + health 包内引擎路径 + .env 拦截与 .txt 阳性对照` —— 一个 `test()`、一次真实会话里的两半。会话跑在无 `.planning/` 的临时 git 仓里（`mkdtemp('/tmp/uat-repo-')`），profile 装在同一一次性 home 的 `probe5` 上。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 手工旁证：一次 one-shot 同时要求「`gsd-new-project`（auto）+ `gsd-health`」与「读 `.env` 与 `notes.txt`」 | 2026-11-16T06:27:53Z（会话记录 mtime，UTC） | `.planning/` 产出 **5 个文件**：`config.json` `PROJECT.md` `REQUIREMENTS.md` `ROADMAP.md` `STATE.md`；会话记录里 `profiles/probe/node_modules/dsh-gsd` 与 `gsd-tools` 都在场（引擎经包内绝对路径解析，不靠 PATH） |
| 同一会话：`.env` 的读 | 2026-11-16T06:27:53Z | 1 条 `hook/result`：`point=PreToolUse`、`decision=**block**`、`exitCode=2`，`stderrSummary` 原文 `Secret read guard: Read would read '/private/tmp/uat-comboprobe/.env', which matches a protected secret-file pattern (.env, .env.<suffix> (except .env.example/.sample/.template/.dist), .secrets). Secret values must not be read into the conversation.` |
| 同一会话：两个哨兵的泄漏判定 | 2026-11-16T06:27:53Z | `.env` 的哨兵值在整份会话记录里出现 **0** 次；`notes.txt` 的哨兵值出现 **12** 次 ⇒ 拦截 + 阳性对照同时成立 |
| 用例 ⑤ 本体的 live 实跑 | 2026-11-16T06:38:04Z（127 s） | `✔`；两半都过：`.planning/{PROJECT,ROADMAP,STATE}.md` 三者在场；引擎包内路径在场；`.env` 被 `secret-read` guard 拦住且其哨兵不进记录；`notes.txt` 读成功且其哨兵进记录 |
| 无 live 环境的下限 | 2026-11-16T06:38:04Z | `ℹ tests 3` / `ℹ pass 0` / `ℹ fail 0` / `ℹ skipped 3`，三个用例各自给出「缺什么」的具体理由（`DSH_UAT_LIVE` / `DEEPSEEK_API_KEY` / `dsh` / `zstd` / tarball）——**无 live 环境不可能出现 pass** |

### 判据形状的三处改写（均为实测/逻辑所迫，已逐条记录）

1. **同一哨兵 → 两个哨兵**。计划要求「同一个唯一哨兵串」同时满足「不出现在记录里」（.env 没进上下文）与「出现在记录里」（.txt 读成功）。**这两条在同一个串上互斥**：`.txt` 一读成功，该串就进了记录。改用两个同前缀、不同值的哨兵（`.env` 一个、`notes.txt` 一个）后，两条断言互不矛盾，且**保留了原意**：证明拦的是文件名规则，不是模型不肯读。若沿用单哨兵，判据只能靠「哪个 tool/result 里出现」做位置推断，脆弱且易假绿。
2. **「一条连续串」→「包内路径段 + 引擎名」**。计划写「会话记录里出现含 `node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs` 的字符串」。实测该串是否连续**取决于模型怎么写命令**：一次会话里模型用完整绝对路径（该串命中 15 次），另一次用 `GSDROOT=<绝对路径>` + `"$GSDROOT/gsd-core/bin/gsd-tools.cjs"`（连续串命中 **0** 次，但 `profiles/<p>/node_modules/dsh-gsd` 与 `gsd-tools` 都在场）。判据改为「包内路径段 ∧ 引擎文件名」两者在场，语义不变（引擎确实从包内绝对路径解析），但不随模型写法随机红绿。
3. **一次会话两半（保留计划形态）**。计划的「⑤ 是一个 test()，UAT-02 与 UAT-03 共用同一次会话」被保留：单个提示词按序要求两件事，实测模型两半都做了（`gsd-new-project` + `gsd-health` + 两次读文件）。重试支路（同一 home、不新建 profile、更明确的提示）已实现，用于「模型没发起被观察的调用」这一情形；此时判**红**并在本文件记 `⚠ 未执行`，绝不改判据、绝不 skip。

### ⚠ 执行期发现并修掉的一次**假红**（记录在此，防止被读成「模型没配合」）

用例 ⑤ 第一次 live 实跑（2026-11-16T06:35Z 前）报 `model never issued the read(.env) call`。回看保留的失败 home 后发现：模型**确实**发起了 `{"file_path":"/private/var/folders/…/uat-repo-ggPkFG/.env"}` 的 `read`，且 `.env` 那条被 guard 拦住（`decision=block`）。原因是 harness 的检测正则只接受了 `.env` 前为空白/引号的情形，没接受路径分隔符 `/`——即**判据实现有 bug，不是模型不配合**。修法：前缀字符类补 `/` 与 `\`（后者覆盖模型写 `grep '\.env'` 的转义形态）。修后同一用例 127 s 通过。这条记录的意义：假红与假绿一样会毁掉证据链，遇到红先查判据实现，再谈「未执行」。

### 边界：这证不了什么

- `.planning/` 的「三者在场」证明 scaffold 真的动了工作区，**不证明**生成的规划内容质量（那属另一条验收口径），也不证明 `--auto` 在别的仓状态下同样收敛。
- `.env` 拦截证明的是**这一次会话里 guard 生效**，不证明 `security.injection_blocking=true` 时的阻断语义，也不证明 hook 在崩溃路径上的 fail-open 行为（SC-2 的另一半归另一计划）。
- 一次成功的 `gsd-health` 证明引擎能从包内解析，**不证明** 72 个技能全部可被模型看见/调用（技能面归 05-02 的 ①②）。
