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

## 判据段 4 — UAT-04（hooks 回归）

> 用例 ① = commit 校验的三段对照；用例 ② = injection 扫描只落日志。两条都**不起** `dsh` 会话：两个 hook 都由 `config/gsd-hooks.json` 经 `hooks/dsh-gsd-suite/run.cjs` 调度（`bash` / 30 s 与 `read|web_fetch|web_search` / 5 s 两条），harness 把合成 payload 喂给**同一个 wrapper**，所以判定走的是真实分发入口，只是绕过了 `dsh` 的注册面（见「这证不了什么」）。

**本段只认这一次跑（2026-11-16T06:59:40Z 完成，耗时 108.4 s）的命令原文与读数：**

```
$ DEEPSEEK_API_KEY="$K" DSH_UAT_LIVE=1 node --test --test-concurrency=1 tests/uat-harness.test.mjs
ℹ tests 5 / ℹ pass 5 / ℹ fail 0 / ℹ skipped 0
```

（`$K` 一次性从 `~/.dsh/.credentials.yaml` 取出、只经进程环境传入、不打印不落盘。`ℹ skipped 0` 是硬要求：无 `DSH_UAT_LIVE` 时**全部**用例 skip，那时 `ℹ fail 0` 什么也不证明——三段对照一次都没跑。）

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| (a) `hooks.community: true` 的 scratch cwd + 非规范消息 `git commit -m "Update the release notes."` | 2026-11-16T06:59:40Z | **exit 2**；stdout = `{"decision": "block", "code": "CONVENTIONAL_COMMITS_VIOLATION", "valid_types": ["feat","fix","docs","style","refactor","perf","test","build","ci","chore"], "reason": …}`；stderr **空**（不含 `validator disabled`） |
| (b) 同一 opt-in cwd + 规范消息 `git commit -m "feat(05-02): wire the UAT hook regression"` | 2026-11-16T06:59:40Z | **exit 0**；stdout **空**（无 block 判定）⇒ 排掉「恒拦的 hook 也能通过两向对照」这条假绿 |
| (c) 负向对照：`hooks.context_warnings`（与本仓同形，**无** `community`）+ 同一条非规范消息 | 2026-11-16T06:59:40Z | **exit 0**；stdout 空 ⇒ (a) 的红确实来自 opt-in 打开后的判定，不是 git 自己出错 |
| 三段共同断言 | 2026-11-16T06:59:40Z | stderr **不含** `/validator disabled/i`。该句是三条 fail-open 通道的共同收尾（opt-in 读失败 / `tool_input.command` 抽取失败 / 分类器跑不动），含它 = 判定不可用，三段的红都归因不了 |
| ② `PostToolUse` 合成 payload（`tool_name=read`、`tool_input.file_path` = `tests/fixtures/injection-sample.md`、`tool_response` = 该文件正文）经同一 wrapper → `gsd-read-injection-scanner.js` | 2026-11-16T06:59:40Z | **exit 0**；stdout 可 `JSON.parse`；`severity=**HIGH**`；`findings=**3**`，其中 `ruleId=INJECTION-PATTERN` **3** 条；**无** `decision` 键 ⇒ advisory，未 block |
| 第四条事实：本仓 `.planning/config.json`（由用例 ① 断言，不是注释） | 2026-11-16T06:59:40Z | `hooks` 只有 `context_warnings`，**没有** `community` ⇒ commit 校验在本仓**默认不生效**（上游设计：`gsd-validate-commit.sh:118` `if [ "$ENABLED" != "1" ]; then exit 0; fi`）。改坏本仓配置会让这条断言红，并提示「第四条事实需改写」 |
| 全量套件（同一棵树，串行；含真实构建 smoke） | 2026-11-16T06:59:56Z | `ℹ tests 44 / ℹ pass 39 / ℹ fail 0 / ℹ skipped 5`，exit 0。44 = 05-01 结束时的 42 + 本任务的 ①②；`skipped 5` 是无 live 环境下 5 条 live 用例全 skip 的正确读数 |

### 边界：这证不了什么

- 本段证的是两个 hook **在 wrapper 这一层**的判定与分发。它**不证明** `dsh` 会话里 hooks 的注册面（`config/gsd-hooks.json` 的两条 matcher 有没有被 bridge 挂上）——那由 05-01 的会话记录（`hook/result` 事件，判据段 3）与 05-04 迁移后的 `--dump-config` 间接支撑。
- ② 的 `INJECTION-PATTERN` 证明扫描器**认得**这个 fixture，**不证明**它在真实会话里「拦住了」注入：它是 PostToolUse，内容在它跑之前就已经进了上下文；SC-2 的原话也只要求「落日志」。
- 三段对照跑在 `mkdtemp` 出来的 scratch cwd 上，**不改**本仓配置。所以它证的是「opt-in 打开后的机制成立」，**不是**「本仓的 commit 会被校验」——后者恰是第四条事实的反面，且是上游设计的默认值。
- 若某次 (c) 意外 exit 2，属负向观测，必须原样记录并标注**不得**充当通过形态；本次三段均如预期，无负向观测。

## 判据段 5 — UAT-05（升级 / 回滚 = 同一条命令换版本号）

> 用例 ⑥ `⑥ UAT-05 升级/回滚：同一条 plugin add 换版本号（.dsh022 ↔ .dsh021）`。**本段只认这一次 live 跑（2026-11-16T07:09:30Z 完成）：**
>
> ```
> $ DEEPSEEK_API_KEY="$K" DSH_UAT_LIVE=1 node --test --test-concurrency=1 tests/uat-harness.test.mjs
> ℹ tests 6 / ℹ pass 6 / ℹ fail 0 / ℹ skipped 0
> ```
>
> `ℹ skipped 0` 是硬要求：⑥ 若被 skip，本段就没有任何 UAT-05 证据（`ℹ fail 0` 只是「没执行」的同义词）。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 复刻第二份 tarball：`tar -xzf dsh-gsd-1.20.1-1.dsh022.tgz` → `package.json.version = 1.20.1-1.dsh021` → `npm pack --ignore-scripts --pack-destination …` | 2026-11-16T07:09:30Z | 产出 `dsh-gsd-1.20.1-1.dsh021.tgz`（`npm notice total files: 958`）。**`--ignore-scripts` 是硬要求**：不带它的 `npm pack` 会跑 `prepack` = `node build.mjs` + 整套测试，而整套测试里就有本 harness ⇒ 递归且不可收敛 |
| 「两份只有版本串不同」的比对（`assertOnlyVersionDiffers`） | 2026-11-16T07:09:30Z | 成员清单 **958 / 958 逐行相同**；解包后逐成员比字节，**只有 `package/package.json` 不同**；该文件在 JSON 语义上去掉 `version` 后**深度相等**（`1.20.1-1.dsh022` vs `1.20.1-1.dsh021`） |
| ⚠ 该比对的诚实边界 | 同上 | `package.json` **不是逐字节相等**：npm 在 `pack` 时会把 `repository: { … }` / `keywords` 之类重排成多行缩进。判据是 **JSON 语义等值**，不是字节等值；别把本行读成「两个 tarball 字节相同」（其余 957 个成员是字节相同的） |
| 装 `.dsh022` → `plugin add` → version + `--dump-config` | 2026-11-16T07:09:30Z | exit 0；`profiles/probe6/node_modules/dsh-gsd/package.json` 的 `version` = **1.20.1-1.dsh022**；dump **393 行**，`- id: gsd` **1** 行、`- id: gsd-hooks-bridge` **1** 行 |
| 装 `.dsh021`（同一条 `dsh plugin --profile probe6 add <tgz>`） | 2026-11-16T07:09:30Z | exit 0；`version` = **1.20.1-1.dsh021**（跟着换）；dump **393 行**，两 row 仍各 **1** 行 |
| 再装回 `.dsh022`（回滚） | 2026-11-16T07:09:30Z | exit 0；`version` 回到 **1.20.1-1.dsh022**；dump **393 行**，两 row 仍各 **1** 行 |
| 回滚之后的一次性会话（会话谓词） | 2026-11-16T07:09:30Z | exit 0；新增**恰 1** 个会话记录；`assistant/message` **1** 条、`turn/end` **1** 条且无 `kind:error` |

### 这条判据证的是什么，不是什么（T-5-14）

- 证的是**「换版本号这条命令的机制」**：同一条 `dsh plugin --profile <p> add <tarball>` 换一份 tarball 就能把 profile 内的 `version` 换进换出，且 composition 的两个 row 与会话谓词全程成立。
- **不证** registry 上的升级历史：两份 tarball **只有版本串不同**，`.dsh021` 由已打好的 tarball 解包后改 `version` 再 `npm pack --ignore-scripts` 本地复刻，**从未也永不发布**。registry 通道的升级/回滚复验不在本判据范围内（归 PUB-01 之后的复验）。

### 边界：这证不了什么

- 不证明真实 registry 通道上的 `npm install` 升级语义（那是 registry 通道的判据，05-03 的 `npm publish --dry-run` 与发布后复验覆盖）。
- 不证明 `.dsh021` 这个版本串在语义上是「更旧」——它只是一个不同的 prerelease 字面量；判据说的是「命令会把 tarball 的版本装进去」，不是「npm 的 semver 排序如何」。
- 只覆盖单 profile、单进程串行；并发 `plugin add` 无锁语义文档，不在本 phase 判据内。

## 判据段 6 — D-10-5（`SKIP_DIRS` 的构建期补丁）

> 补丁形态：canonical 覆盖件 `build/assets/ui-frontend-evidence.cjs`（入库、可 review）+ `build.mjs` ⑤ 块末尾的一行 `cp`（在 upstream 捕获之后 ⇒ 覆盖上游字节；在 ⑥ 改写 pass 之前 ⇒ 仍吃到路径归一化）+ `tests/build-smoke.test.mjs` ① 里的 ⑨ 组断言。**不递增 `counters.copied`**：`copied 76 trees` 被同一测试断成 76，加一即红（`dsh-gsd-suite/run.cjs` 那次拷贝是同样的先例）。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 第一次 `node build.mjs`（补丁落地后） | 2026-11-16T07:05:35Z → 07:05:40Z | exit **0**；`gates: all passed (A/B/C)`；`build: fetched @opengsd/gsd-core@1.20.1, **copied 76 trees**, rewrote paths in 286 files, injected notes into 72 skills (72 total)` ⇒ 新拷贝没有把树数推成 77 |
| 补丁门（`cmp` + `SKIP_DIRS` **成员行**计数 + 再跑一次 build） | 2026-11-16T07:05:40Z 之后 | `skip-dirs-range=**127-141** set-members=**1** whole-file=**4**`；`skip-dirs survives rebuild: PASS (set member exactly 1, whole-file mentions 4)` |
| 第二轮读数（同一脚本内联的第二次 `node build.mjs`，`>/dev/null`） | 同上 | 该分支只在非零时打 `FAIL: second build failed` 并 exit 1，本轮**未触发**；随后 `cmp -s` 通过 ⇒ 补丁**经得住重建**。成员行仍为 **1**（全文出现次数仍是 4：文件头注释 3 + Set 成员 1） |
| `node --test --test-reporter=tap tests/build-smoke.test.mjs` | 2026-11-16T07:07:07Z → 07:07:14Z | `ok 1`（真实构建 → 产物断言）/ `ok 2`（WR-01）；`# tests 2 / # pass 2 / # fail 0`。⑨ 组的可区分失败消息若触发会是：`gsd-core/bin/lib/ui-frontend-evidence.cjs missing after build`（拷贝步没跑）、`drifted from canonical …`（拷贝落在改写 pass 之后，或上游拷贝在其后）、`SKIP_DIRS Set has N .gsd-build-tmp member line(s) …`（0 = 补丁丢了；>1 = 成员重复） |
| 全量套件（同一棵树，串行） | 2026-11-16T07:09:46Z | `ℹ tests 45 / ℹ pass 39 / ℹ fail 0 / ℹ skipped 6`，exit 0（45 = 44 + ⑥） |

### 补丁自身也有 RED 证据（TDD，不写进套件运行结果）

- **RED**：先只提交测试（`790f103`），实现（canonical 覆盖件 + `build.mjs` 拷贝步）不在树上。`node --test --test-reporter=tap tests/build-smoke.test.mjs` → `not ok 1`，`failureType: testCodeFailure`，`code: ERR_ASSERTION`，错误原文 `build/assets/ui-frontend-evidence.cjs missing — the canonical override (D-10-5) is not tracked, so the copy step has no source`；`# pass 1 / # fail 1`。`gsd_run check tdd-red-evidence .build-cache/tdd-red-05-02-task2.json` → **`RED_EVIDENCE_OK`**（`reason: target_test_failed`，TAP 格式，2 tests / 1 pass / 1 fail）。
- **语义复核**：那一次构建**是成功的**（76 树 / identity / 零 `~/.dsh` / adapter 72×1 / wrapper 字节等值五组都过了才到 ⑨ 组），失败的不是 setup、不是语法、不是无关断言，就是这个任务要实现的那条不变量。
- **GREEN 前的一次自造错诊断**：⑨ 组最初把 Set 的闭包行正则写成 `/^\];/`（漏了 `)`），于是永远找不到 `]);`，GREEN 首次跑报 `SKIP_DIRS literal is not closed …`。这是判据实现的 bug，不是补丁的问题——改成 `/^\]\);$/` 后 `# pass 2 / # fail 0`。记在这里的理由与判据段 3 那次假红相同：**遇到红先查判据实现，再谈未实现**。

### 边界：这证不了什么

- 断言证明的是**这一次构建的产物**与 canonical 逐字节相同且成员行恰 1。它**不证明**上游 `@opengsd/gsd-core` 在下个版本里仍然缺 `.gsd-build-tmp`（它会一直缺，因为我们覆盖整份文件）——也正因为整文件覆盖会**钉住上游内容**，上游换版本时必须重新取一次 canonical 覆盖件并复核文件头的版本串。
- 不证明 UI 证据采集在真实项目上的行为（`MAX_WALK_ENTRIES` 与 `SKIP_DIRS` 的消费点在 `:181`）；本判据只钉「本仓的构建 scratch 目录不再被当作源码走」。
- `whole-file=4` **不是**判据（文件头注释点名了该 token），只是给读者的交叉核对；等值判据只有 Set 成员行那一条。

## 判据段 7 — INST-06（回归）

> INST-06 是**回归**而不是新判据：元数据合规（`locale/*.json` 与 `icon.svg`、`files` 九项白名单、README/BUILD 的元数据一致性）早已由 `tests/pack-contents.test.mjs` 与 `tests/docs-consistency.test.mjs` 覆盖。本段记的是**这一次运行的实数与 UTC 时间**，不是一句「已通过」。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `node --test --test-concurrency=1 tests/pack-contents.test.mjs tests/docs-consistency.test.mjs` | 2026-11-16T07:16:30Z | exit **0**；`ℹ tests **20**` / `ℹ pass **20**` / `ℹ fail **0**` / `ℹ skipped **0**`（`pack-contents` 4 + `docs-consistency` 16） |
| 同一次跑里 `docs-consistency` 的 ⑯（本计划新增） | 同上 | 绿：`BUILD.md:16` 的「预期 47」与「47/47」两处形态各恰 1 处且互相一致，并等于 `tests/*.test.mjs` 的 `test(` 总数 **47**（`build-smoke=2 / compat-matrix=8 / docs-consistency=16 / pack-contents=4 / rewrite-map=7 / uat-harness=7 / version=3`） |
| 全量套件（同一棵树，串行；含真实构建 smoke） | 2026-11-16T07:16:30Z → 07:16:38Z | exit **0**；`ℹ tests **47**` / `ℹ pass **40**` / `ℹ fail **0**` / `ℹ skipped **7**` ⇒ **47 == `BUILD.md:16`**；`skipped 7` 是无 live 环境下 7 条 live 用例全 skip 的正确读数（40 + 7 = 47） |

### 这 20 条里 INST-06 自己的那几条

- `pack-contents.test.mjs`：`ALLOWED_TOP_LEVEL` 与 `files` 九项白名单（`index.js` / `cordis.patch.yml` / `locale` / `icon.svg` / `skills` / `gsd-core` / `hooks` / `config` / `scripts`）、`locale/*.json` 的键集与 `icon.svg` 存在性。
- `docs-consistency.test.mjs`：⑥ 的 published-state 哨兵、⑬ 的六个元数据键全等守卫（`repository`/`homepage`/`bugs`/`keywords`/`author`/`publishConfig`）、⑧ CHANGELOG 首条目与 package.json.version 等值、⑪⑫ dshmarket 条目与裸名 install 串的逐字一致。

### 边界：这证不了什么

- 它是回归：证明这些静态断言**今天仍绿**，不证明发布面的字节（真 tarball 的内容由 `npm pack --dry-run` 与 03 的 pack-contents 判据覆盖）。
- ⑯ 证明「`BUILD.md:16` 与套件计数一致」，不证明「47 这个数以后不会变」——它只把「静默变旧」变成一条红。
- 全套 `pass 40` 是在**无 live 环境**下取得的：7 条 live 用例 skip，所以这 40 条不含任何真实 `dsh` 会话。live 的读数在判据段 4/5/8。

## 判据段 8 — UAT-06（三点启动开销 + 技能目录的启动读取）

> 用例 ⑦。**本段只认这一次 live 跑（2026-11-16T07:16:23Z 完成）：**
>
> ```
> $ DEEPSEEK_API_KEY="$K" DSH_UAT_LIVE=1 node --test --test-concurrency=1 tests/uat-harness.test.mjs
> ℹ tests 7 / ℹ pass 7 / ℹ fail 0 / ℹ skipped 0
> ```
>
> 测量点 = **`turn/start.time − session.createdAt`**（两个值都由 DSH 以毫秒写进 `session.v4.jsonl.zstd`）。它不含模型往返、不含 Node 进程启动，剩下的正好是 profile 合成 + bundle mount + 首轮准备——插件成本就落在那里。setup 是**成对**的：同一个 `DSH_HOME`、同一个 `--from-default-profile headless` 模板造 `base`（无插件）与 `p5`（有插件），交替各跑 3 轮，只差 `plugin add` 一个变量。

| 轮次 | profile | 墙钟 (ms) | `turn/start − createdAt` (ms) | 会话谓词 |
|---|---|---|---|---|
| 1 | `base`（无插件） | 2 673 | **6** | ✔ |
| 1 | `p5`（有插件） | 3 287 | **279** | ✔ |
| 2 | `base` | 2 560 | **10** | ✔ |
| 2 | `p5` | 3 357 | **268** | ✔ |
| 3 | `base` | 2 600 | **9** | ✔ |
| 3 | `p5` | 3 834 | **363** | ✔ |

**点 ①基线启动** = median **9 ms**（6 / 10 / 9）。
**点 ②带插件启动** = median **279 ms**（279 / 268 / 363）。
**点 ③插件段** ≈ **270 ms**（279 − 9）。

> **墙钟不是开销数字。** 上表把它并排列出来，只作反例：base 2 560–2 673 ms、p5 3 287–3 834 ms，逐轮漂移以百毫秒到秒计，而它由 LLM 往返主导。用墙钟做「插件加了多少开销」的结论等于在量模型延迟。RESEARCH §Q5 的基线（10 / 340 / ≈330 ms）与本轮同量级但不同值——**重跑值可以不同，口径必须相同**。
>
> 口径与局限：`n=3`、单机、暖页缓存；差值是中位数之差，不是每轮配对差的中位数。断言只要求「6 轮都满足会话谓词、6 个差值都是正整数、median(p5) > median(base)」——不钉具体毫秒数（钉了就会在换机器时假红）。

### 技能目录的「启动读取」（**不是** watch）

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 把 `profiles/p5/node_modules/dsh-gsd/skills/gsd-help/SKILL.md` 的 **front-matter `description`** 换成含唯一 token 的描述，再起一次**新进程**的一次性会话 | 2026-11-16T07:16:23Z | 新会话记录里该 token 命中 **2** 次 ⇒ 新进程启动时读到了新描述 |
| 为什么必须改 front-matter 而不是正文 | — | 技能的**正文不进模型上下文**，只有 `name` + `description` 进；RESEARCH §Q5 用正文 marker 得到 0 命中，就是这个原因（那一次不是「没重读」，是「改错了地方」） |

**它测的是「新进程启动时读到新描述」，不是热重载。** 一次性会话每次都是新进程，所以对 harness 而言「watch 延迟」结构上不适用。

### watch 的处置：`not measured`（T-5-15）

- **为什么测不了**：watcher 的行为只在**长驻**进程（`web` profile）里可观察；本 harness 的每一次会话都是新进程，启动时重读技能目录。数 fsevents 需要 root（`fs_usage`），`lsof` 看不见 fsevents。两者都被排除了。
- **因此**：`05-UAT.md` 的 `技能 watch` 行结论是 `not measured` 并带这条结构性理由；`README.md` 若要声称 watch 行为，只能声称「未测」。**没有 method 2 的实测就不得写数字**——编一个数字比不写更糟。
- 两条 no-sudo 方法（供后续真正去测的人）在 `05-RESEARCH.md` §Q5：session-record proxy（启动时读取，即本段已做的那件事）与 long-lived process proxy（在非 3091 端口的 scratch `web` profile 里改 `description`，看新会话何时可见）。

### 边界：这证不了什么

- 三点数字**不证明**任何 UX 断言：270 ms 是否「可接受」是人的判断，不是本段的判据。
- 不证明 watch；也不证明「技能目录不会被缓存」——只证明**这一次新进程**读到了新描述。
- 不证明 72 个技能全部可被模型看见/调用（那需要逐个技能的可观察调用，属另一条口径；本段只动了一个 skill 的 `description`）。

## 判据段 9 — 发布前 dry-run（计划编号 8；因 05-02 已占用「判据段 8」而顺延）

> 本段只认这一次跑：`npm publish --dry-run`（仓根，**不带** `--tag`、**不带** `--force`；2026-11-16T07:33:58Z → 07:34:14Z，exit **0**）。它真的跑完 `prepack` = `node build.mjs && node --test --test-concurrency=1 tests/*.test.mjs`，因此一条命令同时给出「构建门绿」「全套串行绿」「npm 自己的 prerelease tag guard 与 registry 目标」三组读数。**它不上传任何字节**：这是本计划唯一一个「用 npm 自己的机器验一遍发布态、但不烧版本号」的动作。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `npm publish --dry-run`（prepack 真的执行了） | 2026-11-16T07:33:58Z → 07:34:14Z，exit **0** | 头两行 `npm notice run dsh-gsd@1.20.1-1.dsh022 prepack` / `npm notice run node build.mjs && node --test --test-concurrency=1 tests/*.test.mjs`；构建门 `gates: all passed (A/B/C)`；套件 `ℹ tests 47` / `ℹ pass 40` / `ℹ fail 0` / `ℹ skipped 7`（`skipped 7` = 无 live 环境下 7 条 live 用例全 skip，与 `BUILD.md:16` 的「预期 47」等值） |
| 同一命令的打包面读数 | 同上 | `npm notice filename: dsh-gsd-1.20.1-1.dsh022.tgz`；`npm notice package size: 4.6 MB`；`npm notice unpacked size: 16.0 MB`；`npm notice shasum: 4d3edd7c527729571d9e780148348584986f0980`；`npm notice total files: 958` |
| **tag 与 registry 的目标行（本任务的门）** | 同上 | `npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access (dry-run)` —— 两个 token 同时在场：`with tag latest`（`publishConfig.tag` 生效，npm 12 的 prerelease tag guard 未被触发）与 `https://registry.npmjs.org/`（`publishConfig.registry` 生效，没有落到本机默认的只读镜像 `registry.npmmirror.com`） |
| 同一次跑里的登录态读数 | 同上 | `npm warn publish This command requires you to be logged in to https://registry.npmjs.org/ (dry-run)` ⇒ 本机未登录（与本 phase 侦察的 `npm whoami` = ENEEDAUTH 一致）⇒ 真发布必须由人类带 OTP 执行（D-07），agent 不尝试 login/publish |
| 两条失败为什么可区分（本段是判据而不是「跑通了」） | — | 缺 `publishConfig.tag` 时本机 npm 12.2.1 在**写网络之前**就抛 `You must specify a tag using --tag when publishing a prerelease version`（`npm/lib/commands/publish.js:131-138`：`isDefaultTag` 且 `isPreRelease` 即 throw）⇒ 命令到不了打包之后，也就不会打印上面那一行；`publishConfig.registry` 被动过时 exit 仍是 0，只有这一行的 URL 会变。所以「tag 缺」与「registry 错」不会混成同一条红 |
| `node --test --test-concurrency=1 tests/docs-consistency.test.mjs`（④⑥⑬ 三处改动所在文件） | 2026-11-16T07:36:14Z → 07:36:22Z，exit **0** | `ℹ tests 16` / `ℹ pass 16` / `ℹ fail 0` ⇒ ⑥ 的发布态哨兵（`'private' in pkg` 为假）、⑬ 的两键 `publishConfig`（`registry` 仍在 ⇒ npmjs 钉法**没有被放宽**，只是多了一个 `tag`）与文件头注释改写三处同树且绿 |
| 全套串行（同树，独立于 prepack 再跑一次） | 同上，exit **0** | `ℹ tests 47` / `ℹ pass 40` / `ℹ fail 0` / `ℹ skipped 7` ⇒ 与 `BUILD.md:16` 的「预期 47」等值。本任务**不新增用例**（47 不变），所以 ⑯ 的活体计数自校验无需改 `BUILD.md` |
| manifest 的四项不变量（`files`/`engines`/`dsh.bundle`/`peerDependencies`/`version`） | 2026-11-16T07:33Z 前后 | 逐字未变：`files` 九项白名单、`engines = {node:'>=24', dsh:'>=0.2.2-rc.1 <0.3.0-0'}`、`dsh.bundle.patch = './cordis.patch.yml'`、`peerDependencies['@deepseek-ai/dsh-skill-filesystem'] = '0.2.2-rc.1'`、`version = '1.20.1-1.dsh022'`。`git diff HEAD -- package.json` 恰两处：删 `"private": true,` 一行、`publishConfig` 里加 `"tag": "latest"` 一行（`--numstat` = `2 2`） |

### 一条必须如实记的差异：D-04 的「`files` 白名单零 diff」依据已部分失效

D-04 的申报依据是「`git diff 9e99cd6..HEAD` 对 `files` 白名单（含 `package.json` 本身）零 diff ⇒ 要发布的字节正是 CI run `43238375397` 验过的字节」。**这一步之后该依据部分失效**：`package.json` 与 `README.md` 都在 npm **无条件收录项**里（`tests/pack-contents.test.mjs:49,56` 的 `NPM_ALWAYS_INCLUDED`），而它们本任务必然变了（发布态 + 双语开销段）⇒ 即将发布的 tarball 与 CI 验过的那份**不是同一份字节**。

处置不是把判据放宽，而是换一条可证的路：

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `git diff 9e99cd6..HEAD --stat -- index.js cordis.patch.yml locale icon.svg skills gsd-core hooks config scripts` | 2026-11-16T07:36:23Z | **空输出**（此时 HEAD = `c82d844`，本任务尚未提交）⇒ 已提交历史里代码树零 diff |
| `git diff 9e99cd6 --stat -- <同一组路径>`（含工作树） | 同上 | **空输出** ⇒ 连「正在被 dry-run 打包的这棵树」，代码面也零 diff |
| 同一组路径再加 `package.json` `README.md` | 同上 | 恰好两个文件：`README.md`（36 行增 / 2 删）与 `package.json`（4 增 / 4 删），合计 `2 files changed, 38 insertions(+), 6 deletions(-)` ⇒ 白名单面上变的只有这两个文件，且都属于「发布态本身」而不是代码 |
| 重建「发布所用提交有 CI 背书」 | 待 Task 2 | 推 main → 该提交上跑出一次 `completed/success` 的 run，把背书从「同一份旧字节」换成「同一个提交」。**在 Task 2 的推送发生之前这句话不成立**，本段不预先声称它成立。注意背书的对象是**提交**而不是字节：见下一小节 |

### 一个更大的差异：`npm publish` 的字节不是「可复现的字节」

本段第一张表记了一次 dry-run 的 `shasum`。提交本任务之后，在**同一棵树**上再跑一次同样的 dry-run（2026-11-16T07:37:57Z → 07:38:12Z，exit **0**，`with tag latest` 与 `https://registry.npmjs.org/` 两个 token 与第一次逐字相同），`shasum` 从 `4d3edd7c…` 变成了 `35d93379…`。**这不是本次改动引起的**：两次之间树里只多了一个 `.planning/` 下的证据文件，而 `.planning/` 不在 `files` 白名单里。实测定位如下：

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 同一棵**已构建**的树上 `npm pack --ignore-scripts` 连跑两次 | 2026-11-16T07:39:5xZ | 两个 tarball 的 sha256 **完全相同**（`bcbe1454dfd0c5bd0a2c2b0bb4b8fb867a85a80a83e0b5b60e39b2d9eb1ed82b`，4 582 656 B）⇒ 打包本身是确定的 |
| `node build.mjs` 重建一次后再 `npm pack --ignore-scripts` | 同上 | sha256 **变了**（`fa94f7d75fe2e7c007580e4cfd50a4af1ed9e45b0be70901b9c6c8969a432f83`，4 582 668 B）⇒ **重建即改字节** |
| 解包两份 tarball 逐成员比对 | 同上 | 成员清单 **958 / 958 逐行相同**；内容恰 **59** 个成员不同，且**这 59 个就是全部含 `GSD_ARGS_END_` 的文件**（50 个在 `gsd-core/workflows/`，其余分布在 `gsd-core/workflows/*/steps|modes|detail` 与 `skills/gsd-quick-batch`）；其余 899 个成员逐字节相同 |
| 差异的形状 | 同上 | 只有 heredoc 的结束标记变：`IFS= read -rd '' GSD_ARGS <<'GSD_ARGS_END_c3432f38…'` → `…GSD_ARGS_END_c590e68a…` |
| 根因（在构建产物内，本计划未改动） | — | `gsd-core/bin/lib/args-terminator.cjs:37-40` 的 `generateArgsNonce()` = `randomBytes(16).toString('hex')`，文件头注释即「A fresh nonce」；构建日志的 `build: staging with the official installer` 一步把每个文件的重定向标记「盖章」成这个 nonce。这是**上游的设计**（避免标记与正文冲突），不是缺陷 |

**对判据的后果（Task 2/3 的口径必须据此改写）：** `npm publish` 会先跑 `prepack` = `node build.mjs && …`，所以**发布出去的字节是发布那一刻 build 生成的**，它在构造上**不可能**等于任何此前被 dry-run 或 CI 验过的 tarball 的字节。因此「发布的字节 = 某个被验过的字节指纹」这句话在本包上永远为假，无论 CI 跑多少次；能成立且更强的是：**同一提交 + 同一套构建门 + 同一套串行测试 + 该提交上 CI 绿** —— 这三样 dry-run 各自证过（`gates: all passed` / `tests 47` / `Publishing to … with tag latest`）。推论：Task 2 的 `PUBLISHED_SHA` 是「**发布所用提交**」的标识，不是「发布所用字节」的标识；Task 3 的 registry 复验能核到的是「同一版本号 + 同一管线产物可用」，核不到字节指纹（发布后把 tarball 下载下来单独记账是另一件事，本计划未安排）。

### D-04 的字节口径订正（本轮 Step 0，发生在**任何推送之前**）

D-04 的原文与 `05-03-PLAN.md` 的多处表述把判据说成「发布的字节 = CI run `43238375397` 验过的字节」。上一小节已经实测出**这是构造性不可成立**的：`npm publish` 的 `prepack` 必然重建，`gsd-core/bin/lib/args-terminator.cjs` 的 `generateArgsNonce()` 每次给 59 个成员盖新的随机 heredoc nonce ⇒ 发布出去的 tarball 不可能等于任何一份此前被验过的 tarball。

因此本轮在推任何东西之前先把口径改掉，改成的**唯一可证的**表述是：

> **同一 commit + 同一构建门（`gates: all passed (A/B/C)`）+ 同一串行套件（`node --test --test-concurrency=1`）+ 该 commit 的 CI 绿。**

`PUBLISHED_SHA` 因此是「**发布所用提交**」的标识，不是「发布所用字节」的指纹。改动的落点（逐条可 `git show`）：

| 文件 | 改动 |
| ---- | ---- |
| `05-03-PLAN.md` | must_haves 的 Release tag 那条、key_links、prohibitions、objective、Task 1 action 7、Task 2 context 选项 A 的 (d)、Task 2 action 5、Task 3 `<done>` 与 success_criteria 共 9 处：把「已发布字节所属提交 / 发布的字节有 CI 背书」改成「`PUBLISHED_SHA`（发布所用提交）/ 发布所用提交有 CI 背书」，并逐处点名「字节不可复现」 |
| `05-UAT-EVIDENCE.md` | 本小节 + 上一张表里「重建『发布的字节有 CI 背书』」一行改为「发布所用提交」 |
| `05-CONTEXT.md` | D-04 条目下追加**订正注**（不重写裁决本身：`publish-as-is` 的裁决不变，改的是它的依据口径） |

D-04 的裁决（`1.20.1-1.dsh022` 原样发布）**不因这条订正而改变**——变的只是它凭什么成立：不是「同一份字节」，而是「同一个提交 + 同一套门 + 该提交的 CI 绿」。

### 边界：这证不了什么

- **不上传任何字节**：dry-run 证明的是「npm 会怎么发」，不是「已经发了」。registry 上此刻仍然没有 `dsh-gsd`（本段不做抢注复查，那是 Task 2 放行前的动作）。
- 不证明发布后 `dist-tags.latest` 的读数，也不证明 registry 通道能装出来 —— 那要等人类 `npm publish` 之后才可观测（D-05 只在 `published` 回执之后可达）。
- `total files: 958` 与 `shasum` 只描述**这一次** dry-run 的 tarball；任何一次后续改动（含 Task 2/3 的补丁）都会改变 shasum，届时必须重跑本段。
- 不证明 `prepack` 里那条 `--test-concurrency=1` 的**必要性**（并发假红本轮未复现，见判据段 1 的对照）；它证的是 flag 在位且链跑完。
- 判据段编号：计划写的是「判据段 8」，但 05-02 的偏离 3 已经把判据段 8 用于 UAT-06，故本段落在 9；段名前缀 `## 判据段 ` 与复验序的引用格式不变。

## 判据段 10 — D-04 裁决与「先预演后主推」的两次 CI（计划编号 9；因 05-02 占用 8、dry-run 顺延为 9，本段落在 10）

> 本段覆盖 `05-03-PLAN.md` Task 2 的第 3–6 步：人已裁决 `publish-as-is`，agent 推预演分支 → `workflow_dispatch` 预演 CI → 绿了推 main → 取权威 `PUBLISHED_SHA` → 记录 main 的 run。**本段不发布任何东西**：`npm publish` 仍未执行，它停在 Task 3 的 `checkpoint:human-verify gate="blocking-human"`。
> **口径**（承本文件判据段 9 的「D-04 的字节口径订正」）：本段能证的是**提交级**背书 —— 同一 commit + 同一构建门 + 同一串行套件 + 该 commit 的 CI 绿。tarball 字节不可复现，**不**作判据；`PUBLISHED_SHA` 标识提交，不标识字节。

### 裁决记录

| 字段 | 值 |
| ---- | -- |
| 裁决类型 | `checkpoint:decision`，`gate="blocking"`，`reversibility: one-way` |
| 摆在人面前的三个选项 | A `publish-as-is` / B `bump-rev` / C `defer` |
| **人的裁决** | **A `publish-as-is`** —— 按 D-04 把 `1.20.1-1.dsh022` 原样发布，发布前先把这棵树推上远端 main 以取得该提交的 CI 绿 |
| 裁决回执时间 (UTC) | **2026-11-16T08:40:03Z**（本次续执行 dispatch 的起点；人未附新条件、未要求补证据） |
| 理由 | D-04 既定裁决不变；代码树对 `9e99cd6` 零 diff；dry-run 已证 `with tag latest` 与 npmjs registry（判据段 9）。**依据口径按判据段 9 订正为提交级** |
| B / C 的处置 | 未采纳：B（抬 rev）让新号脱保且违反 D-04；C（暂缓）的内容已包含在 A 的执行顺序里 |

### 放行前的五项证据（Task 2 action 1）

| # | 证据 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | 全套串行 `node --test --test-concurrency=1 tests/*.test.mjs`（仓根） | 2026-11-16T08:44:58Z | exit **0**；`ℹ tests **47**` / `ℹ pass **40**` / `ℹ fail **0**` / `ℹ skipped **7**` ⇒ 与 `BUILD.md:16` 的「预期 47」等值（`skipped 7` = 无 live 环境下 7 条 live 用例全 skip） |
| 2 | `npm publish --dry-run` 的关键行 | 2026-11-16T07:33:58Z（判据段 9 的读数；此后**打包面无任何提交改动**——Step 0 只改 `.planning/`，不在 `files` 白名单内） | `npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access (dry-run)`；prepack 段的 `gates: all passed (A/B/C)` |
| 3 | `git diff 9e99cd6..HEAD --stat -- index.js cordis.patch.yml locale icon.svg skills gsd-core hooks config scripts` | 2026-11-16T08:45:13Z | **空输出** ⇒ 代码树零 diff（此时 HEAD = `a0529ac`） |
| 4 | 抢注复查 `curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/dsh-gsd` | 2026-11-16T08:45:13Z | **404**；对照组 `@opengsd/gsd-core` → **200**（证明 404 是「名字空着」，不是「网络不可达」） |
| 5 | `gh auth status` 的 scope 清单 | 2026-11-16T08:54:48Z | 登录 `pfmiles`（keyring）；`Git operations protocol: ssh`；scopes `delete_repo, gist, read:org, repo, workflow` ⇒ 推送必须走 `--credential.helper='!gh auth git-credential'` 的 HTTPS 形态。**`delete_repo` 的收窄（D-08）仍未执行**，属 Task 3 |

### 两次 CI run（预演 + main）

| run 用途 | databaseId | headSha | event / ref | 创建 → 完成 (UTC) | conclusion |
| -------- | ---------- | ------- | ----------- | ----------------- | ---------- |
| 预演 | **43833863547** | `a0529acf57e1ab01d59bd0730af0e7964d680033` | `workflow_dispatch` / `phase-5/publish-tree` | 08:45:40 → 08:46:58 | **success** |
| main（推送触发） | **43834802996** | `a0529acf57e1ab01d59bd0730af0e7964d680033` | `push` / `main` | 08:52:32 → 08:53:21 | **success** |

两个 run 的四格矩阵逐格 `success`（`0.2.2-rc.1×1.20.1` / `0.2.2-rc.1×1.19.0` / `0.2.1-rc.5×1.20.1` / `0.2.1-rc.5×1.19.0`），且**每一格都打印了** `gates: all passed (A/B/C)` 与 `ℹ tests 47 / ℹ pass 40 / ℹ fail 0 / ℹ skipped 7` —— 预演与 main 跑的是同一套门与同一套串行套件，不是只看了一个绿徽章。

### PUBLISHED_SHA

```
PUBLISHED_SHA=a0529acf57e1ab01d59bd0730af0e7964d680033
```

- 取自 `gh api repos/pfmiles/dsh-gsd/commits/main --jq .sha`（2026-11-16T08:52:36Z），**不是** `origin/main`：本机 `origin/main` 跟踪 ref 停在 `d3c8e89…`（SSH 不可用，跟踪 ref 不随 HTTPS 推送更新），拿它当权威值会指到一个 199 个提交之前的位置。
- 它是**本 phase 后续 tag 的唯一合法目标**：`gh release create 1.20.1-1.dsh022 --target "$PUBLISHED_SHA"`。
- 它标识的是**提交**，不是字节（见判据段 9 的订正）。
- `git ls-remote --heads https://github.com/pfmiles/dsh-gsd.git` 的两个 ref 都指向它：`refs/heads/main`、`refs/heads/phase-5/publish-tree`（预演分支保留不删）。

### 推送通道与一次网络层失败（如实记录）

- 命令形态：`git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/pfmiles/dsh-gsd.git HEAD:refs/heads/<branch>`。`origin` **未被改写**，仍是 `git@github.com:pfmiles/dsh-gsd.git`。
- 推 main 时先失败三次，全部是**网络层**、不是鉴权或分叉：08:47:36 `fatal: … Error in the HTTP2 framing layer`、08:49:13（HTTP/1.1）`Empty reply from server`、08:50:27（`ls-remote`）`Failed to connect to github.com port 443 after 75016 ms`；同期 `curl https://github.com/` → `000`，而 `api.github.com` → `200`、`registry.npmjs.org/dsh-gsd` → `404`。08:52:19 起 `github.com` 恢复（连续三次 `200`、`remote_ip 57.155.223.240`），08:52:27 重推成功：`9e99cd6..a0529ac  HEAD -> main`。
- **远端在那三次失败期间没有被写入**：`gh api …/commits/main` 与 `git ls-remote` 事后都读到 `a0529ac`，推送呈现为 fast-forward（`9e99cd6` 是它的祖先，81 + 2 个提交）。
- 未做（本段全部禁区，逐条可核）：`npm publish`（真发布）、`git tag`、`gh release`、`npm unpublish`、`--force`、`gh auth refresh --remove-scopes delete_repo`、**任何 registry 读**（`npm view` / registry 通道安装）。

### 边界：这证不了什么

- 证的是「该提交在两个 ref 上各有一次四格全绿」，**不证明** registry 上有任何产物：`dsh-gsd` 此刻仍是 404（名字仍空），发布要等人带 OTP 执行。
- 不证明 `npm publish` 真的会成功（登录态 / 2FA / 名字占用窗口都没在这一段被重新验证——判据段 9 的 `npm warn … requires you to be logged in` 仍是最后一次登录态读数）。
- 不证明 dshmarket PR、Release 或 tag：全部在 Task 3。
- 两次 run 的绿**不**构成「发布的字节有 CI 背书」——字节不可复现（判据段 9），这里证的是提交级背书。

## 判据段 11 — 发布后复验：权威 registry / Release / dshmarket PR（计划编号 10；因 05-02 占用 8、dry-run 顺延 9、Task 2 占 10，本段落在 11）

> 本段覆盖 `05-03-PLAN.md` Task 3 的 `<action>` 第 1–4 步。**第 5 步（D-08 的 `gh auth refresh --remove-scopes delete_repo`）没有执行**，它需要一次交互式浏览器 re-auth，由编排层单独交回给人；本段末尾「未执行的」一节逐条列清。
> **口径**（承判据段 9 的订正）：能证的是**提交级**背书 —— 同一 commit + 同一构建门 + 同一串行套件 + 该 commit 的 CI 绿，加 registry 上的版本/字节可用。tarball 字节**发布时重建**、不可复现，故 `PUBLISHED_SHA` 标识提交，不标识字节。

### 发布回执（人执行）与一次差点被误判为 D-05 的传播窗口

| 字段 | 值 |
| ---- | -- |
| 动作 | `npm publish`（人类持 OTP 执行；agent 全程未 login / 未 publish / 未 `--force`） |
| 回执 | `+ dsh-gsd@1.20.1-1.dsh022`，UTC **2026-11-25T11:18:35.005Z** |
| 本节读数由谁取 | 11:10–11:11Z 的三行由编排层取；11:57Z 之后的行由本 dispatch 现取（下文逐行标源） |

**传播窗口（本 phase 最值得记的一条时序实测）**：`npm publish` 打出 `+` 行之后，版本**不是立刻可读的** —— npmjs 会跑一段异步校验流。

| 时间 (UTC) | 读数 | 源 |
| --- | --- | --- |
| 11:10:24.523Z | registry 上只有 `0.0.0-stage` 一个版本（`time.created` 即这一刻） | 本 dispatch 现读 `npm view dsh-gsd time --json` |
| 11:10–11:11Z | `/dsh-gsd` 只显示 `0.0.0-stage`；`/dsh-gsd/1.20.1-1.dsh022` 返回 **404** | 编排层 |
| 11:18:35.005Z | `1.20.1-1.dsh022` 出现在 registry，`dist-tags.latest` 同时移过去 | 本 dispatch 现读（`time` 与 `dist-tags` 两处一致） |
| 11:18:35.258Z | 包的 `time.modified` | 同上 |

⇒ **传播窗口内的一次 404 不是红。** 从 publish 回执到版本可读约 **7 分钟**（11:11Z 仍 404 → 11:18:35Z 可读），而计划写的重试窗口是 **≥5 分钟**。这次实测正是「窗口不得短于 5 分钟」的证据：若按「一次 404 即判红」处理，就会在 11:11Z 给一个 7 分钟后自己出现的版本发 `.dsh023` 并 deprecate 一条好包 —— 在 one-way 路径上绕开 D-04 的裁决。本 dispatch 复验时（11:57Z 起）窗口早已结束，因此**没有进入任何重试循环**，也没有触发 D-05。

### registry 复验（判据段 10 第一段；每条读都钉权威 registry）

| # | 操作 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | `npm config get registry` | 11:57:59Z | **`https://registry.npmmirror.com`** —— 本机默认是只读镜像，这就是下面每个 `--registry` 承重的理由（`publishConfig.registry` 只治理发布写入，管不到读） |
| 2 | `npm view dsh-gsd dist-tags.latest --registry https://registry.npmjs.org/` | 11:58Z | **`1.20.1-1.dsh022`** |
| 3 | `npm view dsh-gsd@1.20.1-1.dsh022 dist.tarball --registry …` | 11:58Z | `https://registry.npmjs.org/dsh-gsd/-/dsh-gsd-1.20.1-1.dsh022.tgz` |
| 4 | `npm view dsh-gsd versions --json --registry …` | 11:58Z | `["0.0.0-stage", "1.20.1-1.dsh022"]` |
| 5 | 该版本 manifest 的发布面（`npm view --json`） | 11:58Z | `fileCount 958` / `unpackedSize 15962499` / `shasum 69cc8c8a5482fb2d097daa8dec5f7e0f510c3007`；`private` 键**不存在**（不是 `false`）；`publishConfig = {tag:'latest', registry:'https://registry.npmjs.org/'}`；`scripts.test` 与 `scripts.prepack` 都带 `--test-concurrency=1`；`_npmUser = pf_miles1 <miles.wy.2@gmail.com>` |
| 6 | 打包面与 dry-run 对照 | — | `fileCount 958` 与判据段 9 的 `total files: 958` 等值；`unpackedSize` 15 962 499 B ≈ 16.0 MB，同量级 ⇒ 发出去的就是同一套白名单 |

### `0.0.0-stage` —— npm 自己造出来的占位版本（开放项，本计划**未处置**）

它不是我们的代码，是 npm 的 staged publishing 在真版本被接受之前先落的一个占位：

| 字段 | 读数 |
| ---- | ---- |
| `description` | `Temporary package placeholder for staged publishing` |
| 打包面 | `fileCount 2` / `unpackedSize 329` / `shasum 6bd214fdf300b69bd608f179e204d8aff2d2e09c` |
| `_npmUser` | `pf_miles1 <miles.wy.2@gmail.com>` |
| 创建时间 | `2026-11-25T11:10:24.523Z`（比真版本可读早约 8 分钟） |
| `deprecated` | 字段为空 ⇒ **未被 deprecate** |

它是「一个已发布版本，只是不是 `latest`」，所以不影响 §「registry 复验」的任何一条；但它会出现在 `npm view dsh-gsd versions` 与 npm 页面的版本列表里。

**建议的处置（与 D-05 同精神，本计划不执行）**：`npm deprecate dsh-gsd@0.0.0-stage "<reason>" --registry https://registry.npmjs.org/`。理由与 D-05 一致 —— **不 unpublish**（保留可追溯历史优于抹除痕迹），只标注原因。**这条需要 OTP，agent 未执行**，作为开放项交给人（见 `05-UAT.md` 开放项 5）。

### registry 通道的 UAT-01 会话判据（安装命令带 `--registry=https://registry.npmjs.org/`）

判据环境是**新的** `/tmp` home（成功也保留取证，与 05-01 的「成功即删」不同，本轮要逐条复核）。判据本体**不是**重写的：`residue()` 与 `assertSessionSucceeded()` 等函数由脚本在运行时从 `tests/uat-harness.test.mjs` **原样抽取**后执行（`driver2.mjs`），所以这里跑的是与 tarball 通道**同一个谓词**，唯一变的是安装面。

| # | 操作 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | 新建 `DSH_HOME=/tmp/dsh-uat-regb-6yIWc8`；装前 `residue()` | 12:01:36Z | `[]`（零残留：`skills/gsd-*` 0、`gsd-core/` 不在、`gsd-hooks.dsh.json*` 不在、profile patch 无 `GSD-DSH-bridge`、`node_modules/dsh-gsd` 不在） |
| 2 | `dsh regchan2 --from-default-profile headless --json --approval-policy never "reply with the word OK"` | 12:01:36Z | rc 0；造出 `profiles/regchan2`；`sessions` 1 份 |
| 3 | `dsh plugin --profile regchan2 add dsh-gsd@1.20.1-1.dsh022 --registry=https://registry.npmjs.org/` | 12:01:40Z | rc 0；`Done in 149ms using pnpm v12.11.2` |
| 4 | 安装真的落地 | 同上 | `profiles/regchan2/node_modules/dsh-gsd` 在盘；`package.json` 的 `version` = **`1.20.1-1.dsh022`** |
| 5 | 声明面（不是只看 node_modules） | 同上 | profile `package.json`：`dependencies = {"dsh-gsd":"1.20.1-1.dsh022"}`、`dsh.profile.bundles = ["@deepseek-ai/dsh-base","@deepseek-ai/dsh-headless","dsh-gsd"]` |
| 6 | INST-01 两条 | 同上 | `cordis.patch.yml` 去注释后正文 = **`[]`**；`disabled:` 真值行 = **0** |
| 7 | `dsh --profile regchan2 --dump-config` | 12:01:41Z | rc 0；`- id: gsd` **1** 行、`- id: gsd-hooks-bridge` **1** 行 ⇒ 装即注册（不重启） |
| 8 | 第二次 one-shot：`dsh --profile regchan2 --json --approval-policy never "reply with the word SECOND"` | 12:01:42Z | rc 0；末行 `{"type":"final",…,"text":"SECOND"}`，`reason.kind = completed` |
| 9 | 装完仍在（证明这一轮是**带着**插件跑的） | 同上 | `node_modules/dsh-gsd` 仍在盘、`version` 仍 `1.20.1-1.dsh022` |
| 10 | 会话目录集合差集 | 同上 | 新增**恰 1** 份：`/tmp/dsh-uat-regb-6yIWc8/sessions/--private-tmp--/session-bf50ea05-0b2c-4a8d-887b-b3401e4a4bc4/session.v4.jsonl.zstd` |
| 11 | **会话判据**（`assertSessionSucceeded`） | 同上 | **PASS**：`assistant/message` = 1、`turn/end` = 1、递归无 `kind:error`。事件类型里含 **`hook/invoked`、`hook/result`** —— 插件自己的 hooks 真在这一轮里跑过 |
| 12 | 技能只可能来自插件 | 同上 | 安装后 home 级 `skills/` 仍**不存在**；`gsd-core/` 也不在 home 级 |

**结论：registry 通道的安装 → 真实会话判据成立**（UAT-01 的 registry 通道复验，与 05-01 的 tarball 通道是两条不同的安装面）。

### 一次被我自己判错的假绿（必须留档，因为它正是本文件警告的那条通道）

第一次跑这个判据时（11:59:12Z，home `/tmp/dsh-uat-reg-uQxyXL`）我写错了第二次 one-shot 的形态：用了 `dsh regchan --from-default-profile headless …`。`--from-default-profile` 是**造 profile 的入口**，对已存在的 profile 再传一次会**按模板重建它** —— 实测后果：该 profile 的 `package.json` 回到 `dependencies: {}`、`bundles` 只剩 `base`+`headless`、`node_modules/` 整个消失。**而那一轮的会话判据仍然 PASS**（`assistant/message` 1、`turn/end` 1、无 `kind:error`）。

⇒ 这是判据段 1 起就在警告的假绿通道的一次活体复现：**「session 目录建出来了 + 这一轮跑完了」不证明插件被挂载过**。两个可区分的信号救回了这条判定：
1. **`hook/invoked` / `hook/result`** 事件在假绿那一轮**不存在**，在修正后那一轮存在；
2. 装后面状态（`package.json` 的 `dependencies`/`bundles` + `node_modules/dsh-gsd` 是否在盘）在假绿那一轮被清空。

修正做法：第二次 one-shot 改用 `--profile regchan2`（**不带** `--from-default-profile`），与 `tests/uat-harness.test.mjs` 用例 ③ 的 `run2` 逐字同形。上表全部读数取自修正后的那一轮（12:01:36Z → 12:01:45Z）。**假绿那一轮的任何读数都没有被计入判据。**

### 装出来的字节就是发布出去的字节（因为 pnpm 的计数器单独不可信）

`pnpm` 在这一轮打的是 `Progress: resolved 6, reused 6, downloaded 0, added 6, done` —— **`downloaded 0`**。也就是说：版本→tarball 的解析发生在了 npmjs（`--registry=` 与 `dsh-gsd@1.20.1-1.dsh022` 这个 spec 只能在那里解析），但**载荷可能来自 pnpm 的内容寻址 store，而不是这次的新下载**。因此「装上了」这句话不能只靠 pnpm 的计数器立论，改用一次直接比对：

| # | 操作 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | `curl -sS -o pub.tgz https://registry.npmjs.org/dsh-gsd/-/dsh-gsd-1.20.1-1.dsh022.tgz` | 12:00:07Z | 4 582 650 B；`shasum -a 1` = **`69cc8c8a5482fb2d097daa8dec5f7e0f510c3007`** ⇒ 与 registry 的 `dist.shasum` 逐字相同（下载到的就是 authority 那一份） |
| 2 | 解包后的成员清单 | 同上 | **958** 个文件（与 `fileCount 958` 等值） |
| 3 | 与 registry 通道装出的树做相对路径集合比对 | 12:01:5xZ | **差集 0 行**（958 个相对路径两侧逐行相同） |
| 4 | 逐文件 sha256 比对 | 同上 | **差集 0 行** ⇒ 装出来的树与发布出去的 tarball **逐字节相同** |

⇒ registry 通道的结论不依赖 pnpm 的 `downloaded` 计数器：**装在盘上的 958 个文件与 registry 上那一份 tarball 逐字节相同**，而那个 tarball 的 sha1 与 registry 的 `dist.shasum` 相同。

### Release（判据段 10 第二段；D-06）

| # | 操作 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | 从 `CHANGELOG.md` 抽条目：`awk '/^## \[1\.20\.1-1\.dsh022\]/{f=1;next} /^## \[/{f=0} f'` | 12:08Z | 1 647 B / 13 行；首行 `### Added`、**不含**版本标题行，也不含任何 `## [`（`grep -c '^## \['` = 0） |
| 2 | `gh release create 1.20.1-1.dsh022 --target a0529acf57e1ab01d59bd0730af0e7964d680033 --title 1.20.1-1.dsh022 --notes-file /tmp/release-notes-1.20.1-1.dsh022.md` | 12:09:36Z | rc 0；URL **https://github.com/pfmiles/dsh-gsd/releases/tag/1.20.1-1.dsh022**。**未加** `-p`/`--prerelease`、**未加** `--verify-tag`（tag 当时不存在，加了会中止） |
| 3 | `gh release view 1.20.1-1.dsh022 --json tagName,isPrerelease,targetCommitish` | 12:09:5xZ | `{"isPrerelease":false,"tagName":"1.20.1-1.dsh022","targetCommitish":"a0529acf57e1ab01d59bd0730af0e7964d680033"}` ⇒ 名字逐字无 `v` 前缀、正式 release、目标即 `PUBLISHED_SHA` |
| 4 | `gh api …/releases/tags/1.20.1-1.dsh022`（原始字段） | 同上 | `tag_name 1.20.1-1.dsh022`、`prerelease false`、`draft false`、`published_at` **2026-11-25T12:09:37Z**；另记 `created_at` = `2026-11-16T08:44:52Z`（**两者不同**：`published_at` 才是这次建的时刻，`created_at` 是 tag 所指提交的时刻） |
| 5 | `git ls-remote --tags … "refs/tags/1.20.1-1.dsh022" "…^{}"` | 12:13:54Z（第 4 次尝试） | `a0529acf57e1ab01d59bd0730af0e7964d680033	refs/tags/1.20.1-1.dsh022` —— **没有 `^{}` 行**，因为它是轻量 tag（计划已写明「若 `^{}` 行不存在则用普通行」） |
| 6 | API 侧的交叉印证（`git ls-remote` 连续失败时先取的读数） | 12:09:5xZ | `gh api …/git/ref/tags/1.20.1-1.dsh022` → `{ref: refs/tags/1.20.1-1.dsh022, object_type: commit, sha: a0529ac…}` ⇒ 轻量 tag 直接指向该提交，解引用后仍是它 |
| 7 | 不可变 Release 预检（D-06 的前提） | 12:09Z | `gh api repos/pfmiles/dsh-gsd --jq .immutable_releases` → **`null`** ⇒ 未启用，「Release 可删可改、tag 可重打」的前提**成立**，无需为此记开放项 |
| 8 | `gh release list` | 12:08Z | 建之前为空（此前没有 Release / tag） |

**tag 目标这一条是本段最要紧的判定**：`gh release create` 不带 `--target` 时会从默认分支 HEAD 建 tag，与 npm 上发出去的提交**没有耦合**（T-5-09）。本段 `--target "$PUBLISHED_SHA"` 与第 5/6 两行的解引用读数是同一条判据的两半。

**网络层失败（如实记录，与判据段 10 同类）**：`github.com` 的 git 端点在 12:06–12:13 之间连续抖动 —— `Error in the HTTP2 framing layer`（12:06Z 前后）、`Failed to connect to github.com port 443 after 75015 ms`（连续 3 次，每次 75 s）、`Empty reply from server`。同期 `api.github.com` 正常（第 3/4/6 行的读数就取自它）。第 5 行最终成功前共失败 **3 次**，全部是网络层、不是鉴权也不是「tag 不存在」。为穿过该抖动，`git ls-remote` 加了 `-c http.version=HTTP/1.1`（**命令内容一字未改，只多了传输层开关**）。

### dshmarket PR（判据段 10 第三段；D-09 完成判据不含合并）

| # | 操作 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | 提交前确认目标仓仍没有这条：`curl -s -o /dev/null -w '%{http_code}' https://raw.githubusercontent.com/awesome-dsh-plugin/awesome-dsh-plugin/main/data/plugins/pfmiles__dsh-gsd.yml` | 12:14:17Z | **404** |
| 2 | `gh repo fork awesome-dsh-plugin/awesome-dsh-plugin --clone=false` | 12:15:10Z | fork 建出 `pfmiles/awesome-dsh-plugin`（`fork:true`、`parent:awesome-dsh-plugin/awesome-dsh-plugin`、`default_branch:main`）；fork 的 `main` = `8f1a1800e31e67aa5664581aea4e772dc5f2cf04`，与父仓同一时刻的 `main` 相同 |
| 3 | **CLI clone 路径（计划的首选路径）两次被网络层拒** | 12:16:03Z→12:17:36Z / 12:17:42Z→12:19:02Z | 两次都 `rc=128`：第一次 `fatal: unable to access '…/pfmiles/awesome-dsh-plugin.git/': Empty reply from server`，第二次 `…: Error in the HTTP2 framing layer`。**不是鉴权失败、不是仓不存在** —— 同一时段 `gh api` 全部正常 |
| 4 | 退化到计划写明的 API 路径：`POST /repos/pfmiles/awesome-dsh-plugin/git/refs` | 12:19:12Z | 建出 `refs/heads/add-pfmiles-dsh-gsd` @ `8f1a1800…` |
| 5 | `PUT /repos/pfmiles/awesome-dsh-plugin/contents/data/plugins/pfmiles__dsh-gsd.yml`（`content` = 源文件的 base64，402 B） | 12:19:20Z | commit **`aa1af6f82d43d3eacb913cef751d6b69f1a0e37e`**；返回 `content.size = 402` |
| 6 | 从 fork 分支把文件**下载回来**再 `cmp` | 12:19:27Z | 402 B；`cmp` **无输出（identical）**；两侧 `sha256 = 3a69a74acffe0db14bb409264dfa8a1d892b67e2cd41fe9bcbc14e4dabe73741`；`en:` / `zh:` 单引号各 1 行 ⇒ 逐字节一致、引号未被「整理」掉（T-5-16） |
| 7 | `gh pr create --repo awesome-dsh-plugin/awesome-dsh-plugin --head pfmiles:add-pfmiles-dsh-gsd --base main --title … --body-file …` | 12:19:32Z | rc 0；**https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18793** |
| 8 | PR 形态（D-09「单文件」） | 12:19:34Z | `state: OPEN`、`changedFiles: **1**`、`additions 6` / `deletions 0`、`headRefName add-pfmiles-dsh-gsd`、`baseRefName main`、`mergeable: MERGEABLE` |
| 9 | PR 的文件清单 | 12:19:5xZ | `[{filename:"data/plugins/pfmiles__dsh-gsd.yml", status:"added", additions:6, deletions:0}]` ⇒ 恰一个文件，且是新增（**没有**触碰 `README.md` / `README.zh.md` 等生成物） |

**选用的路径与理由（计划要求把路径写进证据册）**：首选路径（`gh repo fork` + `git clone` + 本地 `cmp` + `git push`）在**第 3 行**被网络层拒了两次，两次的报错互不相同且都不是鉴权问题；同期 `api.github.com` 全程可用。因此改用计划 `<action>` 第 3 步明确写出的退化路径（`gh api` 的 contents + pulls 接口）。这条退化路径**没有削弱判据**：逐字节一致不是「我打算拷什么」，而是**从 fork 分支把落盘的那份下载回来**再 `cmp`（第 6 行）—— 比本地 `cmp` 更强，因为它验的是 GitHub 上真实的那份。`git ls-remote` 与 `git clone` 走的是 `github.com` 的 git 端点，而 `gh api` 走 `api.github.com`，两者在本时段的可用性**不同**，这是本段能继续的全部原因。

**四检状态（目标仓 `scripts/check-submission.mjs` + `pr-check.yml` 的真实口径）**

| 检 | 判据（目标仓源码） | 读数 | 状态 |
| -- | ------------------ | ---- | ---- |
| ① 每 PR ≤3 条（`MAX_ENTRIES_PER_PR = 3`） | `changedFiles` | **1** | ✅ |
| ② `package.json` 声明 `dsh.bundle` | 本仓 `dsh.bundle.patch = ./cordis.patch.yml`（`check-submission.mjs` 在整棵树里枚举 manifest 后判定） | 在场 | ✅ |
| ③ 仓龄 ≥1 天（`MIN_AGE_DAYS = 1`） | 提交仓 `pfmiles/dsh-gsd` 的 `created_at` | **2026-11-10T09:50:51Z**（15 天） | ✅ |
| ④ `awesome-lint` + site build | 目标仓 `pr-check.yml` 的 check `PR check` | run **45612678334**；步骤 `npm ci` / `Stale-fork guard` / 各 entry 检查 / `awesome-lint` / 各回归测试全部 `success`，`Build (locale parity, date derivation, templates)` 运行中 | ⏳ 见下一行 |

| ④ 的终态 | 时间 (UTC) | 读数 |
| --- | --- | --- |
| `PR check` 最终结论 | 见 `05-UAT.md` 的 PUB-03 行 | 以 `gh pr checks 18793` 的终态为准；**合并不等**（D-09），故即使仍为 `pending` 也不阻塞收官 |

### 未执行的：D-08 的 scope 收窄（计划第 5 步）

| 项 | 读数 | 时间 (UTC) |
| -- | ---- | ---------- |
| `gh auth status` 的 scope 清单 | 登录 `pfmiles`（keyring）；`Git operations protocol: ssh`；scopes **`'delete_repo', 'gist', 'read:org', 'repo', 'workflow'`** | 12:09:5xZ |
| `delete_repo` 是否还在 | **在** | 同上 |
| `gh auth refresh --remove-scopes delete_repo` | **未执行** —— 它需要一次交互式浏览器 re-auth，本 dispatch 的边界是 Task 3 的第 1–4 步；由编排层单独交回给人 | — |

⇒ D-08 **没有收窄**，本段不把它记成已完成。`gh auth status` 的原样 scope 清单就是这条事实的证据（原计划在这一步之后才贴新的清单；这里贴的是**未收窄**的那份）。

### 边界：这证不了什么

- **不证明传播窗口的普适长度**：本轮量到「publish 回执 → 版本可读」约 7 分钟，这是**这一次**的读数。它足以证明「≥5 分钟窗口」这个下限是必要的，不足以外推成「7 分钟一定够」。
- **不证明 `0.0.0-stage` 会被清掉**：本段只记录了它存在、未 deprecate，并给了 D-05 同精神的建议命令（需 OTP）。它不影响 `dist-tags.latest`，也不在 `latest` 上。
- **不证明 dshmarket 的四检通过**：① ② ③ 是直接读数，④ 以目标仓自己的 `PR check` 终态为准；本段占位的那一行必须与 `05-UAT.md` 的 PUB-03 行取同一读数，不得一处写绿另一处留白。
- **不证明合并**：D-09 的完成判据是「PR 已开 + 四检通过」，合并状态单列为开放项。
- **不证明发布字节可复现**：装出来的 958 个文件与 registry 上那份 tarball 逐字节相同，说的是「registry 上那一份 == 装到盘上那一份」，**不是**「它 == 任何一份此前被验过的 tarball」（判据段 9）。
- **不证明 D-08 已完成**：`delete_repo` 仍在 scope 里（见上一节）。
- **`created_at` 与 `published_at` 不同**（第 4 行）：Release 对象的 `created_at` 是 tag 所指提交的时刻（`2026-11-16T08:44:52Z`），`published_at`（`2026-11-25T12:09:37Z`）才是本次创建的时刻；引用时不要拿 `created_at` 当「Release 建于何时」。

---

## 判据段 12 — 真实 home 只读预检（计划编号 11；因 05-02 占 8、dry-run 顺延 9、Task 2 占 10、05-03 落在 11，本段落在 12）

> 本段覆盖 `05-04-PLAN.md` Task 1（`type="tracer"`）的 `<action>` 第 1–8 步。
> **全程只读**：对真实 `~/.dsh` 只用 `ls` / `grep` / `node -e` / `sed -n`（读）。**没有**跑 `--uninstall`、**没有**重装、**没有**重启、**没有**推任何远端。
> **本段没有在真实 home 上跑 `--dump-config`**，尽管计划的 Task 2 会读它的两个 row 计数：runbook 明写它会重写 `<profile>/cordis.yml`（profile 不存在时还会把它建出来），计划的禁令也把它列为「不得当只读探针」。因此 Task 1 的两 row 计数只能由 `grep` + `node -e` 的等价读数承担（见 §8 的 `skillsDir` 解析），`--dump-config` 的真实 row 计数留给 Task 2 放行之后。
> **段号订正（Rule 1，见 SUMMARY 偏离）**：计划的 Task 1/2/3 写的是「判据段 11 / 12 / 13」，但 **11 已被 05-03 的发布后复验占用**。沿用 05-03 偏离 1 的同一条顺延规则（段名前缀与引用格式不变，编号顺延），本计划的三段落在 **12 / 13 / 14**。下文的「计划编号 11」只在指纹里出现，不构成第二个 11。

### 1. 前提核对（D-11：「产物已提交」是硬前提，不是顺序建议）

| # | 命令 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | `git rev-parse --abbrev-ref HEAD` / `git rev-parse HEAD` | 16:07Z | `main` / `2316e9c541487b061d1c3e443bbf5a5f9f1227f2` |
| 2 | `git status --porcelain` | 16:07Z | **0 行（空）** |
| 3 | 判定 | — | 前提成立：Task 1 开始前没有未提交的 `.planning/` 改动，→ 不需要先补提交再继续 |

### 2. 基线重数（重数，不沿用旧值）

| # | 命令 | 时间 (UTC) | 读数（逐字） |
| -- | ---- | ---------- | ------------ |
| 1 | `ls -1 ~/.dsh/profiles` | 16:09:08Z | `gsd-p3-release` / `gsdtest` / `headless` / `node_modules` / `web` ⇒ **4 个真实 profile + `node_modules`** |
| 2 | `ls -d ~/.dsh/skills/gsd-* \| wc -l` | 16:09:08Z | **72** |
| 3 | 逐 profile `grep -c 'GSD-DSH-bridge' ~/.dsh/profiles/<p>/cordis.patch.yml` | 16:09:08Z | `gsd-p3-release: 0` / `gsdtest: 0` / **`headless: 2`** / **`web: 2`** |
| 4 | 四个受管项存在性：`[ -e ~/.dsh/<d> ]` | 16:09:08Z | `gsd-core PRESENT` / `hooks PRESENT` / `scripts PRESENT` / `gsd-hooks.dsh.json PRESENT` |
| 5 | `ls ~/.dsh/gsd-hooks.dsh.json*` | 16:09:08Z | **2 个**：`gsd-hooks.dsh.json`（3953 B）+ `gsd-hooks.dsh.json.gsd-dsh-managed`（0 B） |
| 6 | 机器级一面：`~/.dsh/cordis.patch.yml` 存在性与 `gsd-hooks-bridge` 计数 | 16:09:08Z | `PRESENT gsd-hooks-bridge=0` ⇒ 三态里是 **`CLEAN`**，不是 `ABSENT`、也不是 `DIRTY`（故 `# MIG-GATE` 不会 `exit 2`） |
| 7 | `.stripped-bak` 存在性：`ls ~/.dsh/profiles/*/*.stripped-bak` | 16:09:09Z | **0 个**（与计划预期一致：预检时还没有任何备份，`.stripped-bak` 只会在 Task 3 的 `--uninstall` 剥块时出现） |

Task 1 的第 1 条 `<automated>` 的**逐字输出**（`profiles:` 逐行 + `old-skills:` + 逐 profile `bridge` 计数 + `managed:` 四项；这条命令在收尾时又跑了一次，两次输出逐字节相同）：

```text
profiles:
gsd-p3-release
gsdtest
headless
node_modules
web
old-skills: 72
bridge gsd-p3-release: 0
bridge gsdtest: 0
bridge headless: 2
bridge web: 2
managed:
  gsd-core           PRESENT
  hooks              PRESENT
  scripts            PRESENT
  gsd-hooks.dsh.json PRESENT
```

`dsh.profile.bundles`（`node -e` 读每个 profile 的 `package.json`，不用 `grep` 近似）：

| profile | `dsh.profile.bundles` |
| ------- | --------------------- |
| `gsd-p3-release` | `["@deepseek-ai/dsh-base","dsh-gsd"]` |
| `gsdtest` | `["@deepseek-ai/dsh-base","@deepseek-ai/dsh-web-app","dsh-gsd"]` |
| `headless` | `["@deepseek-ai/dsh-base","@deepseek-ai/dsh-headless"]` |
| `web` | `["@deepseek-ai/dsh-base","@deepseek-ai/dsh-web-app","@jiangzhenguo/dsh-codegraph","dsh-deja","dshmarket"]` |

⇒ **`web` 与 `headless` 不在册 `dsh-gsd`**（它们是「仍靠 home 级 `skills/gsd-*` 拿技能」的两个 profile，即 D-03 第二触发条件的机器形态）；**`gsdtest` 与 `gsd-p3-release` 在册**（插件形态，但见 §8 的 CR-01 问题）。

**⚠ 显式订正 1（计划要求写进证据册的那一句）**：`05-CONTEXT.md` 记的 web bridge 行数为 **1**（`headless` 同为 1），**本轮实测 `web` = 2、`headless` = 2，以实测为准**。这条订正不是文档卫生：`--uninstall` 之后「为 0」这条阴性对照的意义来自卸载前的基线，拿 1 去规划会让「2 → 0」与「1 → 0」看起来是同一件事，而它们不是。

**⚠ 显式订正 2**：`05-CONTEXT.md` 的 D-11 记 3091 的监听 pid 为 **95618**；**本轮实测为 95461**（`ps -o lstart=` = `Mon Nov 16 22:02:55 2026`）。pid 随重启而变，只能作现场锚点，不能作判据；`.continue-here.md` 里记的是实测值。

### 3. 版本钉死（D-05 分支下它会变，故必须在波 4 开头一次钉死）

| # | 命令 | 时间 (UTC) | 读数 |
| -- | ---- | ---------- | ---- |
| 1 | `npm config get registry` | 16:08:5xZ | `https://registry.npmmirror.com` —— 本机默认是**只读镜像**，这就是下面每条读都带 `--registry` 的理由 |
| 2 | `npm view dsh-gsd dist-tags.latest --registry https://registry.npmjs.org/` | 16:08:5xZ | `1.20.1-1.dsh022` |
| 3 | `npm view dsh-gsd versions --json --registry https://registry.npmjs.org/` | 16:08:5xZ | `["0.0.0-stage","1.20.1-1.dsh022"]` ⇒ registry 上**不存在**更新的 `1.20.1-1.dshNNN`（`0.0.0-stage` 是 npm staged publishing 的占位，不占 `latest`，见判据段 11） |
| 4 | `node -p "require('./package.json').version"` | 16:08:5xZ | `1.20.1-1.dsh022` ⇒ 与 registry 的 `dist-tags.latest` **逐字相同**（两条安装通道不会分叉） |

判据段 11 的 D-05 分支**没有发生**（`.dsh022` 仍是 `latest`、未被 deprecate），所以下面这一行就是本轮的值；它是波 4 后面**每条安装命令的唯一版本来源**（registry 通道装 `dsh-gsd@$PUBLISHED_VERSION`；`gsdtest` 刷新用本地 `npm pack` 出的 `dsh-gsd-$PUBLISHED_VERSION.tgz`）：

```text
PUBLISHED_VERSION=1.20.1-1.dsh022
```

（全文件 `grep -c '^PUBLISHED_VERSION='` 必须为 **1**；若 05-03 曾在判据段 10 写过同名行，应就地更新那一行而不是新增第二行 —— 本轮没有同名行，故本行是唯一一行。）

### 4. 步骤 1 的 `# MIG-GATE`（只读）—— 两次跑，退出码 1 → 0

执行的是 `docs/MIGRATION.md` 的 **zh 半**那一块（`grep -n '^# MIG-GATE' docs/MIGRATION.md` = `60:` zh、`493:` en；本块从 `:60` 到 `:124` 被**原样抽出**到 `/tmp/mig-gate-zh.sh` 后执行，未改写任何一行命令）。`grep -c '^# MIG-GATE' docs/MIGRATION.md` = **2**（zh/en 各一块，属计划的「计数为 2 也可接受」分支）。

**RUN 1（不设 `MIG_DECIDED_PROFILES`）—— UTC 2026-11-25T16:08:17Z，退出码 `1`**

```text
DSH_HOME=/Users/yue.weny/.dsh
GATE: skills=72
GATE: profiles=4 decided=-
GATE: undecided=headless web
GATE: bridge=headless web
GATE: multirow=-
GATE: machine-level=CLEAN
GATE: ABORT undecided=headless web bridge=headless web multirow=-
```

**RUN 2（`MIG_DECIDED_PROFILES="web headless gsdtest gsd-p3-release"`）—— UTC 2026-11-25T16:08:31Z，退出码 `0`**

```text
DSH_HOME=/Users/yue.weny/.dsh
GATE: skills=72
GATE: profiles=4 decided=web headless gsdtest gsd-p3-release
GATE: undecided=headless web
GATE: bridge=headless web
GATE: multirow=-
GATE: machine-level=CLEAN
GATE: PASS
```

| 项 | 读数 |
| -- | ---- |
| 命中集 | `undecided ∪ bridge ∪ multirow` = `{headless, web}`（`multirow` 为空；两次跑命中集**完全相同**，说明「写进 `MIG_DECIDED_PROFILES`」只改变裁决行、不改变现场） |
| 第一次退出码 | **1**（命中未裁决） |
| 第二次退出码 | **0**（`GATE: PASS`） |
| `HARD-ABORT`（`exit 2`） | **没有出现**：机器级一面是 `CLEAN`（文件在、计数 0），不是 `DIRTY` |
| `MIG_DECIDED_PROFILES` 取值 | `web headless gsdtest gsd-p3-release` —— 比命中集**多两个**名字（`gsdtest` / `gsd-p3-release`），因为计划第 4 步要求「若在册也要给去向」，而这两个 profile 在 §2 的表里都在册 `dsh-gsd`。覆盖是「完整覆盖」而非「交集非空」，多记不改变判据 |

### 5. 逐 profile 的去向（人的决定被显式化的地方，不是执行器的自由裁量）

| 决定行 | 理由 | 依据 |
| ------ | ---- | ---- |
| `DECIDE web: migrate` | bundles 里有 codegraph/deja/dshmarket 但**没有** `dsh-gsd`；bridge **2 行**；旧源 `skills/gsd-*` 是它此刻唯一的技能来源 ⇒ 迁移后由 Task 3 用 registry 通道装上 `dsh-gsd@$PUBLISHED_VERSION`，旧源随 `--uninstall` 归零 | D-10 第 3 件「`web`/`headless` 一并处置」的点名对象 |
| `DECIDE headless: migrate` | bundles 只有 `base`+`headless`；bridge **2 行**；与 `web` 同一形态 ⇒ 与 `web` 同批处置（计划要求两 profile **都**装插件，不得只处置一个） | 同上 |
| `DECIDE gsdtest: migrate` | bundles 已含 `dsh-gsd`、bridge **0 行**（它不用 bridge 块，用插件的 `cordis.patch.yml`）⇒ 已处插件形态，**不退役**；它是 Task 2 的刷新对象，刷新后仍是插件形态 | D-11 的「3091 刷新」；§8 的 CR-01 问题 |
| `DECIDE gsd-p3-release: migrate` | bundles = `base` + `dsh-gsd`、bridge **0 行**；Phase 3 的发布验证 profile，已处插件形态 ⇒ 保留，**本轮不动它**（不删、不改、不刷新） | 计划的「若在册也要给去向」 |

⇒ `MIG_DECIDED_PROFILES` 的内容就是这四行上表的 profile 名（顺序无关；`# MIG-GATE` 会自行归一化空格）。**覆盖的是命中集 `{headless, web}`，另外两个名字是「在册也要给去向」的那一条。**

### 6. 四条来源盘点（步骤 6 静态段的前置，只读）

`node -e` 用行级正则 `/^\s*-\s+id:\s*(\S+)\s*$/` 从 `~/.dsh/profiles/web/node_modules/` 下的四个 `cordis.patch.yml` 抽 row id（时间 16:09:09Z）：

| 来源 | `cordis.patch.yml` | row id 集合 |
| ---- | ------------------ | ----------- |
| `dsh-gsd` | **MISSING（文件不存在）** | — |
| `@jiangzhenguo/dsh-codegraph` | present | `[dsh-codegraph]` |
| `dsh-deja` | present | `[deja]` |
| `dshmarket` | present | `[dsh-market]` |

**`dsh-gsd` 这一行「迁移前必然缺」是由迁移顺序决定的**：插件是 runbook 步骤 4 才装进 `web` 的，而本段在步骤 4 之前跑。**这不是失败**，如实记录即可 —— **补齐由 Task 3 在迁移后完成**（届时静态段才有四条来源可比，且 `MISSING:` 一行都不许有）。三条在场的 id 两两不相交（`dsh-codegraph` / `deja` / `dsh-market`），但这**不构成** D-10-2 的结论：D-10-2 要的是迁移后四条的集合断言。

### 7. `CB-8` 的归属（`grep -c` 行数与命中行号，本轮实读）

| 文件 | `grep -n 'CB-8'` 的行号 | 行数 |
| ---- | ----------------------- | ---- |
| `.planning/phases/04-migration-coexistence/04-05-PLAN.md` | `76 436 437 772 773` | **5** |
| `.planning/phases/04-migration-coexistence/04-VALIDATION.md` | `165` | **1** |
| `docs/MIGRATION.md` | （无） | **0** |

⇒ 与 `05-RESEARCH.md` §Q8 的 5 / 1 / 0 **一致**。所以判据正文可以按名字引 **CB-8b**，出处是 `04-05-PLAN.md:436`（五条合取）与 `:772-773`（命名 CB-8a/CB-8b），而**不得**声称 runbook 里有这个标签。另一条同时被钉住的事实：`04-VALIDATION.md:165` 把它记作「四条判据」，**少算了一条** —— ② `required-absent:dsh-gsd`（「步骤 4 没做成」时唯一会红的那条）必须跑。

### 8. 现场快照：3091 与 dogfooding 的 CR-01 形态（只读，供 Task 2 的放行前核对）

| 项 | 读数 | 时间 (UTC) |
| -- | ---- | ---------- |
| `DSH_HOME` | `/Users/yue.weny/.dsh` | 16:09Z |
| `DSH_PROFILE` | `gsdtest` | 16:09Z |
| `DSH_PROFILE_DIR` | `/Users/yue.weny/.dsh/profiles/gsdtest` | 16:09Z |
| `DSH_WEB_URL` | `http://127.0.0.1:3091` | 16:09Z |
| 3091 监听 | `lsof -nP -iTCP:3091 -sTCP:LISTEN` → `node 95461 yue.weny … TCP 127.0.0.1:3091 (LISTEN)` | 16:09:09Z |
| 启动命令行（重启用） | `ps -o command= -p 95461` → `node /Users/yue.weny/.nvm/versions/node/v24.21.0/bin/dsh gsdtest --port 3091 --no-open` | 16:09:09Z |
| 进程启动时刻 | `Mon Nov 16 22:02:55 2026` | 16:09:09Z |
| `dsh --version` / `node --version` | `0.2.2-rc.1` / `v24.21.0` | 16:09Z |
| `gsdtest` 里已装插件的 `version` | `1.20.1-1.dsh022` | 16:09:09Z |
| `gsdtest` 里 `index.js` 的形态 | `const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')` / `const skillsDir = join(pluginRoot, 'skills')` | 16:09:09Z |
| 该形态的解析结果（按加载器语义 `node -e` 求值） | `index.js` 目录 = `…/node_modules/dsh-gsd`；`resolve(dir, '..')` = `…/profiles/gsdtest/node_modules`；候选 `skillsDir` = `…/profiles/gsdtest/node_modules/skills`；**`exists = false`** | 16:09:09Z |
| 包里自己那份 `skills/` | `…/node_modules/dsh-gsd/skills` —— **`exists = true`**，其下 `gsd-*` = **72** | 16:09:09Z |
| ⇒ 结论 | **`gsdtest` 当前由插件提供 0 个技能**（`skillsDir` 指向不存在的 `<profile>/node_modules/skills`）。本会话里可见的 72 个 `gsd-*` **全部来自旧脚本的 `~/.dsh/skills`** | — |

**这一节最重要的一个陷阱（T-5-18）：`version` 串区分不出修复前后。** `gsdtest` 里装的 `version` 已经是 `1.20.1-1.dsh022`（与 HEAD 的 `package.json` 逐字相同），但它的 `index.js` 是 **CR-01 修复前**形态。仓库 HEAD 的 `index.js:22-23` 才是修复后形态：

```js
const pluginRoot = dirname(fileURLToPath(import.meta.url))   // 无 '..'
const skillsDir = join(pluginRoot, 'skills')
```

⇒ 「刷新成功」只能靠 `skillsDir` 的**解析形态**（`<plugin>/skills`，且该目录在盘）与新会话里 `[dsh-gsd] skills provider: <path>` 那一行判，**不能**靠 `package.json` 的 `version`。这也是 Task 2 的 acceptance 写「`index.js` 的 `skillsDir` 是 `<plugin>/skills` 形态」而不是「版本号变了」的原因。

### 9. 边界：这证不了什么

- **只读预检不证明迁移会成功**：它证的是「现场是什么」与「硬门可达 `GATE: PASS`」，不证 `--uninstall` 会把块剥干净、不证 `plugin add` 会装成。那要靠 Task 3 的步骤 5 阴性对照 + 内容比对。
- **`GATE: PASS` 只表示每个命中 profile 都有记录，不表示记录是对的**：记录是人写的，本块判的是「是否已裁决」，判不了「裁决对不对」（runbook 的 `GATE: PASS` 段落原话，与 DRILL-4 同口径）。
- **不证明 codegraph 的并存**：§6 只给出三个在场来源的行级 id 集合，`dsh-gsd` 缺失；D-10-2 的集合断言要等迁移后四源齐全。
- **不证明 `gsdtest` 刷新会成功**：§8 只记录「现在是 CR-01 修复前形态、自报 0 技能」，没有跑任何安装。
- **不证明 `--dump-config` 的两个 row 各 1**：本段刻意没在真实 home 上跑 dump（它会重写 `cordis.yml`）。该读数属于 Task 2。
- **不证明卸载前基线之外的任何事**：`skills=72` 是**卸载前**的点，步骤 5 的「0」是另一个点；两点都在同一台机器、同一 `DSH_HOME` 上才构成同一条判据。

### 10. 提交闸（D-11 的强制步）—— 第 1 次提交之后的实测读数

**这一次提交本身**：`git add` 逐个点名 `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` 与 `.planning/phases/05-uat-1-0/.continue-here.md`（**没有**用 `-A`），`git commit -m "docs(05-04): record real-home pre-flight and the resume anchor"`，提交说明里写了「下一波会杀掉执行会话，未提交的 `.planning/` 写入补不回来」。

| 断言（三条，缺一即红） | 逐字读数 | 时间 (UTC) |
| ---------------------- | -------- | ---------- |
| `git status --porcelain` 为空 | **0 行** | 16:11Z |
| 每个文件 `git diff --quiet HEAD -- <path>` 通过 | `diff-quiet OK: .planning/phases/05-uat-1-0/.continue-here.md` / `diff-quiet OK: .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` | 16:11Z |
| 每个文件在 `git log --format= --name-only -- <path>` 里出现 ≥1 次 | `in-history .planning/phases/05-uat-1-0/.continue-here.md: 1 commit(s)` / `in-history .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md: 12 commit(s)` | 16:11Z |
| 裁决行 | **`commit gate: PASS`**（退出码 0） | 16:11Z |

**批次标识（只作标识，不作判据）**：`git log -1 --format='%h %s'` → `15ca7ae docs(05-04): record real-home pre-flight and the resume anchor`。

两条口径说明，都是本闸**为什么不能写成「最后一次提交」**的实例：

1. **`05-UAT-EVIDENCE.md` 的 12 次出现远多于「1」**：它被 05-01/05-02/05-03 反复追加过。按「最后一次提交里有两个文件」判，Task 2 那种「只提交证据册」的批次之后就会把一个**已经提交的锚点**判成红（锚点在上一次提交里）。判据必须是「在历史里」。
2. **本节自己就是一次新的回写**：把上面这张表写进判据段 12 会再产生一次提交，本次回写之后 `.continue-here.md` 的计数仍是 1、本文件的计数会再 +1 —— **闸是单调的**（追加证据既不会把锚点从历史里拿走，也不会弄脏工作树）。这正是 Task 2 的 `<action>` 第 3 步要求「回写后重跑一次闸并确认仍 PASS」的原因；复跑的读数在 Task 2 的提交闸里落账，本段不复述未经实测的数字。

---

## 判据段 13 — 3091 刷新（计划编号 12；因 05-02 占 8、dry-run 顺延 9、Task 2 占 10、05-03 落在 11、05-04 Task 1 落在 12，本段落在 13）

> 本段覆盖 `05-04-PLAN.md` Task 2（`type="checkpoint:decision" gate="blocking"`，人类回执 **`proceed`**）的 `<action>` 第 1–5 步；第 6 步（重启 3091 = 杀掉执行会话）由人执行，第 7 步的读数补进本段「刷新后」半段。
> **段号订正（承判据段 12 的同一条顺延规则）**：计划的 Task 2 写的是「判据段 12」，但 12 已被本计划的 Task 1 占用（Task 1 把 11/12/13 顺延为 12/13/14）。沿用同一条规则，本段落在 **13**，计划编号 12 只出现在标题指纹里。
> **`--dump-config` 的例外（必须显式记账）**：本段在 `gsdtest` 上跑了 `--dump-config`，它**不是**只读探针 —— 实测它重写了 `<profile>/cordis.yml`（见 §3 第 6 行的 mtime）。这不构成对禁令的违反：该 profile 随后被 `--force` 重装并重启，`cordis.yml` 被重写是预期内且无害的；禁令针对的是把它当作**真实 home 上其它 profile** 的只读探针 —— `web` / `headless` / `gsd-p3-release` 一个都没跑过。

### 1. 打包自当前 HEAD（第 1 步）

| # | 命令 | 时间 (UTC) | 读数（逐字） |
| -- | ---- | ---------- | ------------ |
| 1 | `git rev-parse HEAD` / `git status --porcelain` | 17:58:52Z | `99835e5480f42958f4a7b76b47678b4089b28443` / **0 行** |
| 2 | `node build.mjs`（串行，`build-smoke` 会重写构建树） | 17:59Z | rc 0；`gates: all passed (A/B/C)`；`build: fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)` |
| 3 | 构建后 `git status --porcelain` | 17:59Z | **0 行**（构建树不进 git，闸的前提仍成立） |
| 4 | `npm pack --ignore-scripts --pack-destination /tmp/uat-tgz` | 17:59Z | rc 0；`filename: dsh-gsd-1.20.1-1.dsh022.tgz`；**`shasum: 36eac0dc40158bc90647947bf7de4fe3a4ee92bf`**；`integrity: sha512-d9QG/7JutjpTr…B9l1xWu7HyM0w==`；`package size 4.6 MB` / `unpacked size 16.0 MB` / **`total files: 958`** |
| 5 | 独立核对 `shasum -a 1 /tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz` | 18:00Z | `36eac0dc40158bc90647947bf7de4fe3a4ee92bf` ⇒ 与第 4 行的 `shasum:` 行**逐字相同**（另记 `sha256 = fd4a363d3e7c232c861c3846b869a38d8cdeaf090ac2cb057a96f87b6328d11d`，`4 582 619 B`） |
| 6 | `tar -xzOf <tgz> package/index.js \| grep -n 'skillsDir'` | 18:00Z | `23:const skillsDir = join(pluginRoot, 'skills')` / `35:      customSkillDirs: [skillsDir],` / ``43:      ctx.logger.info(`[dsh-gsd] skills provider: ${skillsDir}`)`` |
| 7 | 抽出的 `:22` | 同上 | `const pluginRoot = dirname(fileURLToPath(import.meta.url))` —— **无 `'..'`**，即 CR-01 修复后形态 |
| 8 | 包内技能计数 | 同上 | `package/skills/gsd-*/SKILL.md` = **72**（去重目录数同为 72） |
| 9 | 包内两项字节锚 | 同上 | `package/skills/gsd-health/SKILL.md` **3587 B**；`package/skills/gsd-new-project/SKILL.md` **3856 B**（与判据段 11 的包内侧一致） |

⇒ **tarball 来自当前 HEAD，且它自己的 `index.js` 就是修复后形态。** 这一条是重装能否治好 CR-01 的**唯一**前提：装的必须是这一份，`skillsDir` 才会解析到 `<plugin>/skills`。

### 2. 提交闸（第 3 步）—— 交出重启之前共跑三次

命令 = `05-04-PLAN.md` Task 2 `<verify>` 的第一条 `<automated>`，**原样抽出后 `eval`**（一个字未改；抽取方式 = `sed -n '206p' …05-04-PLAN.md | sed -n 's/^[[:space:]]*<automated>\(.*\)<\/automated>[[:space:]]*$/\1/p'`）。它问的是「在历史里 + 盘上等于 HEAD」，**不是**「在最后一次提交里」。

**RUN #1 —— 锚点提交 `7ff3418` 之后，退出码 `0`**

```text
in-history .planning/phases/05-uat-1-0/.continue-here.md: 2 commit(s)
in-history .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md: 14 commit(s)
anchor-version: PUBLISHED_VERSION=1.20.1-1.dsh022
pre-restart commit gate: PASS
```

（判据段 12 §10 记的 `.continue-here.md: 1 commit(s)` 在本轮变成 **2** —— 这正是闸「在历史里」口径的体现：Task 1 的骨架与 Task 2 的完整版是两次提交，两者都在历史里。若闸退化成 `git log -1`，这里会红。）

RUN #2 —— 刷新前读数批次（`eb041fd`）之后，退出码 `0`：

```text
in-history .planning/phases/05-uat-1-0/.continue-here.md: 2 commit(s)
in-history .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md: 15 commit(s)
anchor-version: PUBLISHED_VERSION=1.20.1-1.dsh022
pre-restart commit gate: PASS
```

**RUN #3 —— 「刷新后」批次（本段所在的这次提交）之后、把重启交出去之前**：这是计划强制的最后一道（「回写后重跑一次闸并确认仍 PASS」）。**本段不预写它的结果**：它必须在把重启交出去之前跑绿，逐字读数贴在交给人类的重启交接里。**为什么不回写它的输出**：回写会再产生一次提交，使「交出重启前的最后一次闸」永远后移一格 —— 闸是**单调**的（追加证据既不把锚点从历史里拿走，也不弄脏工作树），所以终态 = 最终提交之后跑一次并确认 PASS，任何人可原样重跑复核。

### 3. 刷新前读数（第 4 步）—— 此刻仍是双源并存

时间 2026-11-25T18:01:2xZ，profile `/Users/yue.weny/.dsh/profiles/gsdtest`：

| # | 读数 | 值 |
| -- | ---- | -- |
| 1 | 已装插件的 `version` | **`1.20.1-1.dsh022`** —— 与 `PUBLISHED_VERSION` **逐字相同**（⇒ 版本串区分不出修复前后，T-5-18） |
| 2 | 已装 `index.js:20` | `const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')`（**CR-01 修复前**形态） |
| 3 | 已装 `index.js:21` | `const skillsDir = join(pluginRoot, 'skills')` |
| 4 | 按加载器语义求值（`node -e`，与包内同一 `resolve`/`join` 实现） | `plugin dir = …/profiles/gsdtest/node_modules/dsh-gsd`；`resolve(dir,'..') = …/profiles/gsdtest/node_modules`；**`skillsDir = …/profiles/gsdtest/node_modules/skills`，`exists = false`**；对照 `…/node_modules/dsh-gsd/skills` 的 `exists = true` |
| 5 | `--dump-config` 的两 row 计数 | **2**：`:1282 - id: gsd`、`:1284 - id: gsd-hooks-bridge`（rc 0，**stderr 0 字节**） |
| 6 | 该命令对 `cordis.yml` 的副作用（实测） | 前后均为 223 B，但 mtime `Nov 16 22:02:56 2026` → **`Nov 26 02:01:31 2026`** ⇒ **它确实重写了文件**，不是只读探针 |
| 7 | 已装包内 `skills/gsd-*` | **72**（包内容本来就是全的；病在 `skillsDir` 的解析，不在文件） |
| 8 | `~/.dsh/skills/gsd-*`（旧源） | **72**（此刻仍双源并存，属预期；单源由 Task 3 完成） |

⇒ **刷新前的两 row 计数也是 2**，所以「两 row = 2」**不能**用来证明刷新成功；能区分的是第 2–4 行的 `skillsDir` 解析形态与新会话的 `[dsh-gsd] skills provider:` 那一行（判据段 12 §8 的 T-5-18 陷阱在本段被实测复现）。

### 4. 重装 `gsdtest`（第 5 步）与「刷新后」读数

命令（版本取自判据段 12 的 `PUBLISHED_VERSION` 行，**不硬编码**）：

```bash
PV=$(sed -n 's/^PUBLISHED_VERSION=//p' .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md | head -1)
dsh plugin --profile gsdtest add "/tmp/uat-tgz/dsh-gsd-$PV.tgz" --force
```

这里的 `--force` 是**安装器替换**语义，与永久禁用的 `npm publish --force` 无关。

逐字输出（2026-11-25T18:02:4xZ，**rc 0**）：

```text
[WARN] Replaced "dsh-gsd" ("file:/Users/yue.weny/frontWorkspace/gsd-on-dsh/dsh-gsd") with "/tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz" from a different source.
✓ Lockfile passes supply-chain policies (verified 15d ago)
Packages: +6
++++++
Progress: resolved 6, reused 5, downloaded 1, added 6, done
Agent skills awaiting approval: dsh-gsd@file:../../../../../tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz.
Run "pnpm approve" to review them.
[WARN] Issues with peer dependencies found. Run "pnpm peers check" to list them.

dependencies:
- dsh-gsd file:../../../frontWorkspace/gsd-on-dsh/dsh-gsd
+ dsh-gsd 1.20.1-1.dsh022

Done in 1.1s using pnpm v12.11.2
```

刷新前 vs 刷新后（后者 2026-11-25T18:02:5xZ，同一 profile）：

| # | 断言 | 刷新前 | 刷新后 | 判定 |
| -- | ---- | ------ | ------ | ---- |
| 1 | `node_modules/dsh-gsd/package.json` 的 `version` | `1.20.1-1.dsh022` | `1.20.1-1.dsh022` | ✅ 等于 `PUBLISHED_VERSION`，但**两次相同** ⇒ 版本串不作刷新判据 |
| 2 | `index.js` 的 `skillsDir` 形态 | `:20 resolve(dirname(fileURLToPath(import.meta.url)), '..')` ⇒ `<profile>/node_modules/skills` | `:22 dirname(fileURLToPath(import.meta.url))`（**无 `..`**）+ `:23 join(pluginRoot, 'skills')` ⇒ `<plugin>/skills` | ✅ 修复后形态 |
| 3 | 该 `skillsDir` 目标是否存在（`node -e` 求值） | **`exists = false`** | **`exists = true`**（`…/node_modules/dsh-gsd/skills`）；旧形态路径 `…/node_modules/skills` 仍 `false` | ✅ **这一条才是刷新是否成立的判据** |
| 4 | 包内 `skills/gsd-*` | 72 | **72** | ✅ |
| 5 | 包内 `gsd-health/SKILL.md` / `gsd-new-project/SKILL.md` | — | **3587 B / 3856 B** | ✅ 与 tarball 内、判据段 11 的包内侧一致 |
| 6 | `--dump-config` 两 row 计数 | **2**（`gsd` / `gsd-hooks-bridge`） | **2**（`:1282` / `:1284`，rc 0，stderr 0 B） | ✅ 但**两次相同** ⇒ 该计数不区分刷新前后 |
| 7 | 装出来的 `index.js` 与 tarball 内那份逐字节相同 | — | 两侧 `sha256 = 6d0272025c8577faeb73700962b4287d912186c5cd93f654d2d55f40267585af` | ✅ 装的就是这一份 tarball |
| 8 | profile 声明面 | `dsh-gsd: file:…/dsh-gsd`（HEAD 工作树路径） | `dsh-gsd: file:/tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz`；`bundles` 仍含 `dsh-gsd` | ✅ 走的是计划指定的 tarball 通道（Task 3 的 `web`/`headless` 走 registry 通道） |
| 9 | `~/.dsh/skills/gsd-*`（旧源） | 72 | **72** | ✅ 旧源仍在 |

⇒ **刷新成立**：能区分刷新前后的三条（第 2/3/7 行）全部从「修复前」变成「修复后」；而两条**看起来像判据**的读数（版本串、两 row 计数）**刷新前后完全相同**，按它们判会得到一个无法区分真假的绿 —— 这正是 T-5-18 要在判据侧堵住的通道。

**刷新后仍是双源并存，单源由 Task 3 完成**：`~/.dsh/skills/gsd-*` 仍是 72，而 `gsdtest` 现在自己也供 72 个技能。此刻两者同时存在是**预期状态**，不是「单源已完成」；把旧源摘掉是 Task 3 的 `--uninstall` 的职责（本段没有执行它）。

**一条必须记账的副作用（不阻塞，交给人决定）**：`gsdtest` 的 `dependencies` 现在指向 `/tmp/uat-tgz/…tgz`。`node_modules` 已装好，重启不受影响；但 `/tmp` 被系统清理后，该 profile 再执行 `pnpm install` 会因源消失而失败。若希望它长期可复现，后续可改走 registry 通道（`dsh plugin --profile gsdtest add dsh-gsd@$PUBLISHED_VERSION --registry=https://registry.npmjs.org/`）—— 本计划**不做**这一步：Task 2 指定的就是 tarball 通道，且这台 profile 不该在重启前再被改动一次。

### 5. 边界：这证不了什么

- **不证明刷新后技能真的出现在会话里**：§4 证明的是**盘上**的解析形态与包内容；技能是否真的进了会话，要等重启后的新会话（Task 2 第 7 步）里那行 `[dsh-gsd] skills provider: <profile>/node_modules/dsh-gsd/skills` —— `--dump-config` 证明的是**行**在场，不是 **provider 行**指向插件目录。
- **不证明重启会成功**：重启是第 6 步（人执行），它的判据是 `lsof` 出现**新** pid + GUI 可用 + 新会话的 provider 行；本段只到「盘上已就绪」。
- **不证明单源完成**：`~/.dsh/skills/gsd-*` 此刻仍 72，双源并存；删旧源是 Task 3 的 `--uninstall`，本段没有做、也不得做。
- **不证明 `/tmp` 那份 tarball 会长期在**：它只保证这一次重装装的是这一份（`sha256` 逐字节相同）；`/tmp` 的生命周期不归本计划管（见 §4 末的副作用记账）。
- **`cordis.yml` 被重写这件事本身不作判据**：它只是本段必须记账的副作用（§3 第 6 行）；`--dump-config` 的退出码同样不作判据。
