---
phase: "5"
slug: "uat-1-0"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-26"
---

# Phase 5 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> **来源**：本 phase 无执行期 `05-SECURITY.md`（**State B**，追认审计）。寄存器 = 四份 `05-0X-PLAN.md` 的 `<threat_model>` 块（`register_authored_at_plan_time: true`，4/4 计划都有可解析块；四份 SUMMARY **没有** `## Threat Flags` 条目），共 **18 个编号威胁 T-5-01…T-5-18**，另 `T-5-SC`（供应链）在每份计划各声明一次、按 phase 3/4 体例**合并为一行** ⇒ 寄存器 **19 行**。逐条对照 HEAD `e958ba9` 的提交产物核验；phase 起点 `bfb5f5e`。
> **本 phase 的性质决定了缓解面的形态**：它是**验收 + 发布 + 收口**，不是功能开发。产品源码零改动——非 `.planning/` 的 diff 恰好 **11 个路径、+1777/−14**：`tests/uat-harness.test.mjs`（新，1188 行）、`tests/docs-consistency.test.mjs`（+142/−6，⑥ 翻发布态、⑮/⑯ 新增）、`tests/build-smoke.test.mjs`（+61，⑨ 组）、`tests/fixtures/injection-sample.md`（新，1202 B）、`build/assets/ui-frontend-evidence.cjs`（新，308 行 canonical 覆盖件）、`build.mjs`（+14，拷贝步）、`package.json`（+4/−4：删 `private`、`publishConfig.tag`、两处 `--test-concurrency=1`）、`.github/workflows/compat-matrix.yml`（1/1，行尾追加 flag）、`README.md`（+32/−2 开销段双语）、`CHANGELOG.md`（+3）、`BUILD.md`（1/1 计数）。因此多数威胁的缓解落在「判据形态 + 证据册读数」，少数落在 per-commit 机器断言（⑥⑮⑯、build-smoke ⑨、pack-contents ④）。
> **审计口径**：ASVS **L1** + `block_on: high`（引擎现读 `config-get`：`1` / `high` / `true`）⇒ 分类到 `threats_open: 0` 后按工作流 short-circuit 直写合同，**未派 gsd-security-auditor**（工作流 Step 3 的 L1 分支；且本会话委派深度为 0）。L1 深度 = 每条缓解在提交产物/证据册里有**具体落点**，并对可离线复跑的守卫做了本轮 live 复核（见「本轮独立复核」）。判据只认内容 / 字节 / 集合；退出码只在被明确赋义时才作判据（`--uninstall` 与 `--dump-config` 的 exit code 恒 0，本 phase 全部判据均不以退出码为准）。

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| 编排会话的环境 → 一次性 `/tmp` home | `DSH_HOME`/`DSH_PROFILE`/`DSH_PROFILE_DIR` 是唯一隔离闸门；漏删一个，写动作就落到真实 `~/.dsh` | 一次性 home 路径；会话记录 |
| 一次性 home → 会话记录 | 会话目录在**失败轮**同样被创建；判据若停在「有会话」就永远绿 | run events（`assistant/message` / `turn/end` / `hook/*`） |
| `~/.dsh/.credentials.yaml` → 子进程环境 | 密钥是 `refs.DEEPSEEK_API_KEY` 的字面值；一旦写进仓内文件或被 echo，就进了 git 历史 | LLM 凭据（敏感） |
| 模型行为 → 判据 | `.env` 拦截与 skill 调用都要求模型真的发起工具调用；模型不配合会被误读成「拦住了」 | 工具调用参数与结果 |
| 合成 payload → `hooks/dsh-gsd-suite/run.cjs` → 两个 guard | 这条链与真实会话共用分发入口，但绕过 `dsh` 的注册面；两者不可互相替代 | 提交消息 / 注入文本（公开） |
| 本地树 → npm registry | 一次**不可逆**写入；`publishConfig`/`tag` 是唯一声明式护栏，`--force` 会拆掉它 | 958 个公开文件 + 元数据 |
| registry → 真实 `~/.dsh` | 首次把 registry 字节装进 `web`/`headless`；读的默认是本机只读镜像 | 包字节（公开） |
| 真实 `~/.dsh` → 旧源 | `--uninstall` **不认 profile**、无条件 `rm -rf skills/gsd-*`；bridge 块只有 `.stripped-bak` 一处可恢复 | 用户在用的 72 个技能 / 两个 patch 文件 |
| 本仓 → 公开旧仓 `pfmiles/install-gsd-dsh` | 跨仓写入；内容错位会改到对方门面 | 英文互链片段（公开） |
| 本仓 `docs/dshmarket/` → 第三方 catalog | 逐字节复制；手打会与 ⑪ 的字段断言漂移，去引号会破 YAML 语义 | 条目 YAML（公开） |
| 上游 `@opengsd/gsd-core` → `gsd-core/`（构建产物，gitignored） | 任何对构建产物的手改都会在下次 `node build.mjs` 时消失 | 构建期第三方代码（MIT） |
| 构建树 → npm tarball | `files` 九项白名单是唯一收面闸门；`.planning/`、`tests/`、`build/`、`docs/`、`.github/` 全靠它排除 | 本仓源码与构建产物 |
| 3091 重启 → 本会话 | `kill` 掉监听进程即终止执行会话；**未提交**的 `.planning/` 证据不可恢复 | 会话上下文 / 盘上产物 |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation（证据落点） | Status |
|-----------|----------|-----------|----------|-------------|------------------------|--------|
| T-5-01 | Spoofing | `tests/uat-harness.test.mjs` 的会话判据（「`sessions/*` 存在即通过」） | high | mitigate | 判据在 `JSON.parse` 之后：`assertSessionSucceeded` 要求 `assistant/message` 在场 **∧** 任何 `turn/end` 体**递归**无 `kind === 'error'`（`tests/uat-harness.test.mjs:180-196`，递归扫在 `:169-178`）；两条失败消息可区分（`no assistant/message` :188 / `turn/end carried kind:error … exactly the false-green channel` :195）；「失败轮同样建 session 目录」写在文件头 :18-35。证据册判据段 1 记 live 谓词 PASS 且 `ℹ skipped 0` 是硬要求；无 live 时**只 skip、不可能 pass**（判据段 1 第 31 行） | closed |
| T-5-02 | Information Disclosure | `~/.dsh/.credentials.yaml` → 子进程 → 证据册 | high | mitigate | harness **从不读、不打印、不落盘**密钥，只透传进程环境（`tests/uat-harness.test.mjs:10-13`），并显式从子进程 env 删除 `DSH_HOME`/`DSH_PROFILE`/`DSH_PROFILE_DIR`/`ALIPAY_API_KEY`（`:63-66`），缺失时只报「不在进程环境」（`:84`）；证据册只记命令形态 `DEEPSEEK_API_KEY="$K"` 与「`$K` 一次性取出、不打印不落盘」（判据段 1 第 119 行）。本轮复核：phase 目录 `grep -rE "sk-[A-Za-z0-9]{12,}"` = **0**；`git ls-files \| grep -c credentials` = **0**；`/tmp/dsh-uat-*` 内无 `settings*`/`credential*`/`*.env` 且无 key 形态字面量 | closed |
| T-5-03 | Tampering / Information Disclosure | 真实会话里的 `.env` 读取（HOOK-02 面） | high | mitigate | 同前缀**不同值**双哨兵（`tests/uat-harness.test.mjs:588-594`，`.env` / `notes.txt`，运行时随机生成）；三段合取：`.env` 工具调用失败 + `hook/result` 指名 `secret-read`（`:680`）、`.env` 哨兵**不进**记录（`:686`）、`.txt` 哨兵**进入**记录（`:697`/`:701`，缺阳性对照即判红，「拦住了」与「没读到」不可区分） | closed |
| T-5-04 | Tampering | `hooks/gsd-validate-commit.sh`（opt-in 缺省即放行；配置读失败也放行） | high | mitigate | 三段对照在 `tests/uat-harness.test.mjs:749-819`：(a) opt-in+非规范 → `exit 2` + `{"decision":"block","code":"CONVENTIONAL_COMMITS_VIOLATION"}`；(b) opt-in+规范 → `exit 0` 且**无** block；(c) 未 opt-in+非规范 → `exit 0`（负向对照）。三段都断言 stderr **不含** fail-open 文案（`validator disabled`），排掉「恒拦/恒放/fail-open」三种假绿。本仓未 opt-in 是**被断言**的事实（改坏配置会红并提示改写「第四条事实」），`.planning/config.json` 零改动 | closed |
| T-5-05 | Tampering | `npm publish`（`--force` 绕过 tag guard；未验证字节被发出去） | high | mitigate | 声明式 `publishConfig.tag: latest`（本轮读盘在盘）；`prepack = node build.mjs && node --test --test-concurrency=1 …`（build 失败即短路）；发布前「全套串行绿 + `npm publish --dry-run` 绿（判据段 9，打印该 registry 与 `with tag latest`）」双门；`--force` / `npm unpublish` **从未执行**（05-03-SUMMARY:230 逐条可核）；publish 由人类持 OTP 执行（判据段 11 回执 `2026-11-25T11:18:35.005Z`）。**残余**：`private: true` 已删，意外发布只剩声明式护栏 → R-5-05 | closed |
| T-5-06 | Tampering | registry 目标与 `dist-tags.latest`（写侧与**读**侧） | high | mitigate | 写侧：`publishConfig.registry` = `https://registry.npmjs.org/` + dry-run 必须打印该 registry；读侧：每条 `npm view` / registry 通道安装 / `deprecate` 建议都带显式 `--registry`，并先记 `npm config get registry` = `registry.npmmirror.com`（只读镜像）作为「为什么必须 pin」的现场证据（判据段 11；`05-UAT.md` PUB-01 行）。实测 `latest = 1.20.1-1.dsh022`、`dist.tarball` 可解析、958 文件与 tarball 逐字节相同 | closed |
| T-5-07 | Elevation of Privilege / DoS | 真实 `~/.dsh` 的 `--uninstall`（无条件 `rm -rf skills/gsd-*`，波及全部 profile） | high | mitigate | 写前跑步骤 1 硬门：本轮 `GATE: PASS`（rc 0，`MIG_DECIDED_PROFILES="web headless gsdtest gsd-p3-release"`，四条 `DECIDE` 行与现场逐字对应，判据段 14 §2）；卸载前把 72 个旧技能目录备份到 `/tmp/dsh-legacy-skills-backup-20261126T043114Z`；`.continue-here.md` 在重启/重装**之前**已进历史（判据段 12/13 的 `in-history` 闸，计数 1 → 2 而非 `git log -1`）；`.stripped-bak` **恰 2 份**保留（判据段 14 §4）。判据只看集合/字节，`--uninstall` 退出码不作判据 | closed |
| T-5-08 | Tampering | 旧仓互链写错位置或写错内容（改对方门面 / 推中文片段） | high | mitigate | 插入位置用章节锚点：`---` 之后、`## Quick start` 之前（现 35–42 行）；内容 = `snippet.en.md` **逐字节**副本，比较对象是**从远端字节**（`gh api …/contents/README.md?ref=3af3f27`）切出的 691 B（两侧 sha256 `2ee9bde6…`、`cmp` IDENTICAL）；该提交只动 `README.md`（`+9/−0`），`snippet.zh.md` / `pr.md` **未推**（旧仓 CJK 推送前后均 0）；推送走 `git -c credential.helper= … push https://…`（判据段 14 §15） | closed |
| T-5-09 | Repudiation | Release 与产物脱绑（tag 指向未发布提交） | high | mitigate | `gh release create … --target "$PUBLISHED_SHA"`（`a0529ac…`，取自 `gh api …/commits/main` 而非 `origin/main`）；`gh release view --json` 回读 `targetCommitish` = 同一 sha；`git ls-remote --tags` 解引用行 = `a0529ac…`（轻量 tag，无 `^{}` 行）。⚠ `git ls-remote` 曾三次被网络层拒，重试只加传输层开关 `-c http.version=HTTP/1.1`，**命令内容一字未改**（05-03-SUMMARY 偏离 3） | closed |
| T-5-10 | Repudiation | `--test-concurrency=1` 三处的「怎么证明它在」 | medium | mitigate | ⑮ 逐处计数扫描（`tests/docs-consistency.test.mjs:432`）：两处 lifecycle script 都带 flag 且 `prepack` 仍以 `node build.mjs && ` 开头；workflow 中含 `node --test` 的 `run:` 行恰 1 行且带 flag；**合计恰 3**（`> 3` 不算通过）。`/tmp` 变异实验：删掉副本 `prepack` 的 flag → 断言 `FAIL` 并给出「prepack 假红会中止发布（人手输完 OTP 之后）」原文（判据段 1 第 42–44 行）。明令禁止用「套件跑绿了」推断 flag 在场 | closed |
| T-5-11 | Tampering | 一次性 home 的泄漏（失败时残留 `/tmp/dsh-uat-*`，含会话记录） | low | mitigate | harness 用 `try/finally`：成功 `rmSync` 删、失败保留并 `console.error` 打印路径（`tests/uat-harness.test.mjs:326-330`，另 574/709/826/1051/1181 同形）；home 内不含密钥文件（凭据只走 env，见 T-5-02）。**形式偏差**：该条款只覆盖 harness 创建的 home；registry 通道那几次是**手工**跑，留下 4 个 `/tmp/dsh-uat-*` → R-5-01（本轮扫描：无凭据材料） | closed |
| T-5-12 | Repudiation | injection 扫描被误报成「已拦截」或「无问题」 | medium | mitigate | `tests/uat-harness.test.mjs:840-885` 只断言 **exit 0 + `INJECTION-PATTERN` finding**（advisory，绝不 block）；fixture `tests/fixtures/injection-sample.md`（1202 B）入仓以便复跑；失败消息带 `severity` 与 findings 条数（`no INJECTION-PATTERN finding — … severity=… findings=… ruleIds=…`） | closed |
| T-5-13 | Tampering | `gsd-core/bin/lib/ui-frontend-evidence.cjs` 被手改（下次 build 即失效，且文件在 gitignore 内无从 review） | high | mitigate | 补丁落 canonical 覆盖件 `build/assets/ui-frontend-evidence.cjs`：`SKIP_DIRS` 的 Set 成员 `'.gsd-build-tmp'` 恰 1 行（`:127-141`，成员行 `:140`），文件头记上游版本 / 缺失后果 / 整文件拷贝钉住上游；`build.mjs:321` 在 staging 之后、path-rewrite 之前 `cp` 回树；`tests/build-smoke.test.mjs:151-205` 断言存在、与 canonical **逐字节相同**、成员行**恰 1**（计数限定在 Set 字面量内，散文提及不计）。证据册判据段 6：连跑两次 `node build.mjs` 后 `skip-dirs survives rebuild: PASS`（`:177-178`） | closed |
| T-5-14 | Spoofing | UAT-05 被读成「registry 上升级成功」（两份 tarball 都是本地复刻件） | medium | mitigate | `05-UAT.md` UAT-05 行逐字写明「两个 tarball 只有版本串不同（`.dsh021` 由已打好 tarball 解包改 `version` 再 `npm pack --ignore-scripts` 复刻，**从未也永不发布**）⇒ 证的是换版本号这条命令的机制，**不是** registry 升级历史」；证据册判据段 5 另留诚实边界：`package.json` 是 **JSON 语义等值**、非字节等值（其余 957 个成员字节相同） | closed |
| T-5-15 | Repudiation | 技能 watch 被编一个数字或把启动读取冒充成 watch | high | mitigate | `05-UAT.md` 的 `技能 watch` 行 = **`not measured`** + 结构性理由（一次性会话每次新进程、启动重读技能目录；watcher 只在长驻 `web` 可观察；数 fsevents 需 root）；`README.md:81`（zh）/ `:170`（en）双语同写 `not measured`；用例 ⑦ 的断言消息显式声明它测的是「启动读取」而非 watch（`tests/uat-harness.test.mjs:1077`；判据段 8 记 token 命中 2 次） | closed |
| T-5-16 | Tampering | dshmarket 条目被手打改写或引号被「整理」掉 | medium | mitigate | 逐字节：从 **fork 分支**把落盘的那份下载回来再 `cmp`（判据段 11 第 6 行：402 B、`cmp` 无输出、两侧 sha256 `3a69a74a…`、`en:`/`zh:` 单引号各 1 行）；PR 形态 `changedFiles 1` / `+6/−0` / `data/plugins/pfmiles__dsh-gsd.yml`（added），目标仓 `README*` 未触碰；`docs/dshmarket/pfmiles__dsh-gsd.yml` 本身是 4 顶层键的 `④` 形态（⑪ 在默认回路内） | closed |
| T-5-17 | Repudiation | G-4 被判成绿而实际少一条来源（`MISSING:` 当 skip） | high | mitigate | 静态段必须打印 `coexist-static ok:` **且零 `MISSING:` 行**（判据段 14 §10.1 逐字：`coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`；`MISSING:` 行数 **0**，判据段 14 表 L1134）；四源 row-id 集合 `pairwise-disjoint=true`（合计 5 个 id）；`COEXIST-REAL PASS`（CB-8b 五条合取，判据段 14 §10.2） | closed |
| T-5-18 | Tampering | 3091 刷新后插件仍不供技能（CR-01 形态未修）却被记成通过 | high | mitigate | `index.js:23` 为 `const skillsDir = join(pluginRoot, 'skills')`（修复后形态）；`tests/pack-contents.test.mjs:190-234` 抽出真实 `pluginRoot`/`skillsDir` 两行并**实际执行**，断言解析结果落在包内；证据册判据段 13 记录刷新后新 pid、`--dump-config` 两 row 各 1、provider 行指向 `<profile>/node_modules/dsh-gsd/skills` 且 72；判据段 14 §7 记 `gsdtest` 在旧源归零后**仍由插件供 72**（用 stub ctx 执行已安装 `index.js`，sha256 `6d027202…`）。⚠ 范围外的 `gsd-p3-release` 仍是 CR-01 修复前形态（0 技能）→ R-5-06 | closed |
| T-5-SC | Tampering | npm/pip/cargo installs（四份 PLAN 各声明一次；按 phase 3/4 体例合并一行） | high | mitigate | 全 phase **零新依赖**：`package.json` 的 `dependencies`（两条 `@deepseek-ai/*` exact）与 `peerDependencies`（exact）相对 phase 起点零 diff（`git diff bfb5f5e..HEAD -- package.json` 只有 `private` / `scripts` / `publishConfig.tag`）；四份 SUMMARY 的 `tech-stack.added` 均为 `[]`；安装动作仅两类——`dsh plugin add <本仓 tarball>`（本地 produce，不经 registry）与 `dsh plugin add dsh-gsd@$PV --registry=https://registry.npmjs.org/`（**我们自己的包**、钉权威 registry、无 `--force`）；`npm uninstall -g @opengsd/gsd-core` 是**移除**；dshmarket 的 clone **不跑** `npm install`；仓库无 lockfile 变更 | closed |

*Status: closed · open（本表 19 行全部 `closed`）*
*Severity 分布：high **14**（T-5-01/02/03/04/05/06/07/08/09/13/15/17/18 + T-5-SC）· medium **4**（T-5-10/12/14/16）· low **1**（T-5-11）*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on`（本仓为 `high`）count toward `threats_open`*
*Disposition: mitigate（implementation required）· accept（documented risk）· transfer（third-party）*

> **`T-5-SC` 的编号说明：** 四份 PLAN 各写一条同义项（`05-01-PLAN.md:287` / `05-02-PLAN.md:275` / `05-03-PLAN.md:338` / `05-04-PLAN.md:300`），本文件按 phase 03 的 `T-03-SC (01..03)` 与 phase 04 的合并体例收成一行，**不计入 18 条编号寄存器**，但计入 19 行总数。
>
> **`T-5-02` 的形式偏差（已核，不改变 closed）：** 计划写的是「harness 从 `~/.dsh/.credentials.yaml` 取一次」；实现把这一步**交给调用者的 shell**（harness 只透传 env，`tests/uat-harness.test.mjs:10-13`）。这在安全上是**更强**的形态（harness 没有读凭据的代码路径，也就没有泄漏它的路径），但它使 05-01-SUMMARY 的「证据册只记 key resolved (len>0)」在本轮**没有**逐字落成——证据册记的是命令形态 `$K` + 「一次性取出、不打印不落盘」。见 R-5-02。
>
> **`T-5-11` 的「成功即删」只在 harness 路径成立：** registry 通道的复验是手工跑的（判据段 11），不受 harness 的 `finally` 约束，故留下 4 个 `/tmp/dsh-uat-*`。本条严重度 **low**（低于 `high` 门），判 `closed`，但**不把它当作已履约**——见 R-5-01。
>
> **`T-5-17` 的强制点在输出而非退出码：** `docs/MIGRATION.md` 的静态段本身在缺来源时 `console.log("MISSING: "+k); continue`（`:260`），`coexist-static SKIPPED` 也自带「这不是通过」的声明（`:243`）。计划把验收判据提升为「必须打印 `coexist-static ok:` 且零 `MISSING:` 行」，本轮实测命中（判据段 14 §10.1）。⇒ 它是一条**读输出**的判据，不是 fail-closed 的退出码判据；这与 phase 4 对 `--dump-config` / `--uninstall` 的「退出码不作判据」同口径。

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| A-5-01 | T-5-05 | **npm 发布不可撤回**：72 小时后不可 unpublish，有人依赖后也不可撤回；D-05 裁决「失败版本用 `npm deprecate` 标注原因、修正版走新 rev，**不 unpublish**」，理由是保留可追溯历史优于抹除痕迹。本 phase 首发成功、D-05 未触发；不可撤回性是**选择公开分发**的固有代价，不是可缓解项 | 规划期用户裁决 D-05（2026-11-15，`05-CONTEXT.md`）；执行期未触发 | 2026-11-26 |

*Accepted risks do not resurface in future audit runs.*

> **继承的 accepted risk 不重开、但要报状态：** phase 3 的 **A-03-02**（`gh` token 的 `delete_repo` scope 待收窄）把收敛建议写成「Phase 5 前」；本 phase 的 D-08 计划执行 `gh auth refresh --remove-scopes delete_repo`，**未执行**（需交互式浏览器 re-auth）。证据册判据段 11 明写「`delete_repo` 仍在 scope 里」「D-08 没有收窄」，并把原样清单留档。按「accepted risks 不重开」的规则，本表不复制 A-03-02；它的**未收窄状态**作为 R-5-07 记录，供编排层交回人执行。

---

## 残余与偏离（不计入 `threats_open`，但必须留痕）

| ID | 关联威胁 | 事实（可复核） | 影响判定 | 收敛动作 |
|----|----------|----------------|----------|----------|
| **R-5-01** | T-5-11 | `/tmp` 残留 **4 项** `/tmp/dsh-uat-*`：`reg-uQxyXL` 60 K / `reg3-huaH5e` 18 M / `regb-6yIWc8` 18 M / `registry` 22 M（含 driver 脚本与日志），外加 `/tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz`（4.5 MB）与 `/tmp/dsh-legacy-skills-backup-20261126T043114Z`（72 个目录）。均来自手工 registry 通道复验与迁移备份，不是 harness 的成功失败分支。**对照**：phase 4 的 R-4-01 遗留 `/tmp/dsh-mig-*` 本轮实测 **0 项**（已清），所以本行是**新残留**，不继承旧账 | **不构成泄露**：本轮 `find` 未发现 `settings*` / `credential*` / `*.env`；`grep -rE "sk-[A-Za-z0-9]{16,}"` 命中 **0**；目录权限 `drwx------`（`mkdtemp`）。内容 = 会话记录（模型输出）+ 公开包字节 | `rm -rf /tmp/dsh-uat-* /tmp/uat-tgz`；技能备份在确认 `.stripped-bak` 与插件态稳定后再删（它不是正式回退路径，见判据段 14 尾注） |
| **R-5-02** | T-5-02 | 计划条款「harness 从 `.credentials.yaml` 取一次、证据册只记 key resolved (len>0)」未逐字落成：实现在 harness 外（调用者 shell），证据册记命令形态 `$K`。摘要里的「key resolved (len>0)」在证据册正文中不存在 | 低：安全性更强（少一条读凭据的代码路径），**不是**放宽 | 无需动作；后续同类 harness 若要在码内读凭据，须同时断言「不 echo、不落盘、不留子串」 |
| **R-5-03** | T-5-13 | canonical 覆盖件**整文件钉住** upstream `@opengsd/gsd-core@1.20.1`；`build-smoke` ⑨ 证的是「构建后产物 == canonical」，**不证**「canonical == upstream + 1 个 Set 成员」。上游换版本时该副本会静默停在上一个版本 | 中：不是篡改，是**供给内容陈旧**；文件头已写明需重取 | 上游升级时重取 canonical、复核文件头的版本串、复跑 ⑨；可考虑加一条「canonical 与 upstream 的 diff 恰为 `SKIP_DIRS` 成员」的一次性门 |
| **R-5-04** | T-5-05 / T-5-10 | **发布门 ≠ UAT 门**：`prepack` 跑全量套件，但 7 个 live 用例因 `DSH_UAT_LIVE` 全 skip ⇒ `prepack` 绿**不表示** UAT-01..06 跑过；`05-VALIDATION.md` 的 **G-1** 另记：UAT-04 的 ① ② 两条 hook 断言被同一道凭据闸挡在默认回路外。时间线：live 7/7 于 **2026-11-16T07:16Z** 在当时候选树上跑；**11-25** 发布前 `package.json` 又改过（删 `private`、加 `publishConfig.tag`，非行为性）；发布后只在 registry 装出的字节上复验了 **UAT-01 的会话谓词**（判据段 11），UAT-02..06 未对**最终发布树**重跑 | 中：已发布字节与 UAT 验证树**非逐字节同一提交**，但差异全部落在非发布路径（`docs/`/`tests/`/`build/`/`.github/`）与 `package.json` 的元数据字段（`private` / `publishConfig.tag`），**无行为代码差异**；`05-VALIDATION` 因此判 **PARTIAL**（`nyquist_compliant` 未置 true） | 若要闭：下次发布前对同一 commit 跑一次 `DSH_UAT_LIVE=1` 的 live 段并落账；或把 ①② 改成不需要凭据的形态（G-1 的现成建议） |
| **R-5-05** | T-5-05 | `private: true` **整键删除**（⑯ 断言其已移除）：意外发布的机械护栏消失，剩下的只有 `publishConfig.tag`、`prepack` 的 build+测试、以及 npm 账号的 2FA/OTP | 低—中：发布本就需要这条护栏拆除；已有测试断言发布态，且 `npm whoami` 当前为 `ENEEDAUTH`（本机无登录态） | 无需动作；若未来加 CI 自动发布，必须另建 tag/provenance 护栏 |
| **R-5-06** | T-5-18 | `gsd-p3-release` 迁移后 **0 个 `gsd-*` 来源**：其 `dsh.profile.bundles` 含 `dsh-gsd`，但 `index.js` 是 CR-01 **修复前**形态（`skillsDir` → 不存在的 `<profile>/node_modules/skills`），而 home 级旧源已被 `--uninstall` 归零。不在授权范围（in-scope 集 = `web`+`headless`），未修 | 低（单一个人 profile）；但**该 profile 的 hook 是否仍生效本轮未验证**——补一条命令即可修（`dsh plugin --profile gsd-p3-release add "dsh-gsd@1.20.1-1.dsh022" --registry=…`） | 交人裁决后执行；执行时顺手用同一 stub-ctx 探针确认 provider 行指向插件 |
| **R-5-07** | 继承 A-03-02 | **D-08 未执行**：`gh auth status` 的 scopes 仍为 `delete_repo, gist, read:org, repo, workflow`（判据段 11 原样留档，并明写「D-08 没有收窄」）。这是前序 accepted risk 的**计划内收窄动作**，本 phase 未做 | 不因本 phase 新增：token 的删除权限是 phase 3 人类授权扩权的遗留；本 phase 未扩权、未 refresh | 人执行 `gh auth refresh --remove-scopes delete_repo`（需浏览器 re-auth）；或换 fine-grained PAT 限定单仓 |
| **R-5-08** | T-5-05 / T-5-SC | npm 上仍有占位版本 **`dsh-gsd@0.0.0-stage`**（`description: "Temporary package placeholder for staged publishing"`、2 文件 / 329 B、`_npmUser pf_miles1`、2026-11-25T11:10:24Z 创建）。不占 `latest`、不影响卡片命令，但出现在版本列表 | 低：包属于本账号（staged publish 机制的副产物），不是抢注 | 按 D-05 同精神 `npm deprecate`（**不** unpublish）；需 OTP，本 phase 未执行 |

---

## Security Audit

| Date | Threats found | Closed | Open | Verdict |
|------|---------------|--------|------|---------|
| 2026-11-26 | 19（T-5-01…T-5-18 + 合并后的 T-5-SC） | 19 | 0 | **L1 verified — State B**（无既有 SECURITY.md）+ plan-authored register（`register_authored_at_plan_time: true`）+ ASVS L1 + `block_on: high` ⇒ 分类得 `threats_open: 0` 后按 short-circuit 直写合同；L1 深度 = 每条缓解在提交产物/证据册中有**具体行号落点**，并对默认回路里可离线复跑的守卫做了本轮 live 复核（下节 30 个用例 0 fail） |

**本轮独立复核（HEAD `e958ba9`，只读；审计开始时 `git status --porcelain` 0 行、结束时仍 0 行）：**

- **可跑的守卫全部现场跑过**：`node --test tests/docs-consistency.test.mjs` → **16 / 16 pass**（含 ⑥ 发布态 `private` 已移除、⑬ manifest 元数据、⑮ 三处 flag 恰 3、⑯ BUILD.md 计数 == 47）；`node --test tests/pack-contents.test.mjs tests/version.test.mjs tests/rewrite-map.test.mjs` → **14 / 14 pass**（含 `skillsDir` 落在包内的行为守卫 ④）。两条合计 30 个用例、0 fail。
- **引擎/配置现读**：`node gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；`config-get` → `security_asvs_level=1` / `security_block_on=high` / `security_enforcement=true`；`loop render-hooks verify:post` 的 `security` 步 `ref.skill=secure-phase`、`produces=SECURITY.md`、`onError=halt` ⇒ 本次执行**由启用的 step hook 触发**，不是旁路。
- **phase 面复核**：`git diff bfb5f5e..HEAD --stat -- . ':!.planning'` → 恰 **11 个路径**、+1777/−14（清单见文首）；`git diff bfb5f5e..HEAD -- package.json` → 仅 `private` 删除、两处 `--test-concurrency=1`、`publishConfig.tag`；`files` 仍 **9 项**、`dependencies`/`peerDependencies` 零变动。
- **凭据面**：phase 目录 `grep -rE "sk-[A-Za-z0-9]{12,}"` = **0**；`git ls-files | grep -c credentials` = **0**；`ls *.tgz` 于仓根 = 无（`.gitignore` 覆盖 + 判据段 1 的「仓根卫生」断言）；`/tmp/dsh-uat-*` 与 `/tmp/dsh-uat-registry` 内无 `settings*`/`credential*`/`*.env`、无 key 形态字面量（见 R-5-01）。
- **发布面读数复核（引用证据册，未重新联网）**：`latest = 1.20.1-1.dsh022`（判据段 11 第 421 行，每条读带 `--registry`）；958 文件与 registry tarball 逐字节相同（判据段 11 第 483–485 行）；Release `targetCommitish` 与 `git ls-remote --tags` 解引用同为 `a0529ac…`（05-03-SUMMARY）。
- **收口面读数复核（引用证据册）**：`GATE: PASS` + 四条 `DECIDE` 行（判据段 14 §2）；`--uninstall` 后 A–E 阴性对照全成立、`.stripped-bak` 恰 2 份（§4）；`gsdtest` 旧源归零后仍 72（§7）；`coexist-static ok:` + `MISSING:` 0 行 + `COEXIST-REAL PASS`（§10）；旧仓 `41fcc7a → 3af3f27` 与 691 B 逐字节相同（§15）。

**新识别威胁 vs 沿用：**

- **沿用 19 行（100%）**：T-5-01…T-5-18 + T-5-SC 全部来自四份 PLAN 的 `<threat_model>`，本轮逐条对照实现/证据复核；**没有**新增 ID，也**没有**把任何一行降级为「文档性」。
- **新识别威胁：0 行。** 逐项核对新增可达面：(1) 本 phase 新增/修改的文件**无一进入 npm tarball**——`files` 九项未变，`tests/`、`build/`、`docs/`、`.planning/` 均不在其中（⑩ 与 pack-contents 在默认回路内守这条）；(2) 唯一真正新增的对外可达面是「包已公开发布 + 三个对外写入（Release / dshmarket PR / 旧仓 README）+ 一次真实 home 变更」，这五项分别由 T-5-05/06/09、T-5-16、T-5-08、T-5-07 在**计划期**建模并覆盖；(3) 新增的构建资产 `build/assets/ui-frontend-evidence.cjs` 是 build-time only（`build/` 不在 `files`），其篡改面由 T-5-13 覆盖；(4) 依赖面零变动 ⇒ 无新供应链条目。
- **新识别「观测」（记为残余，不升为威胁行）**：R-5-01（`/tmp` 残留，无凭据材料）、R-5-04（发布门 ≠ UAT 门，含 `05-VALIDATION` 的 G-1）、R-5-06（`gsd-p3-release` 0 技能及其 hook 未验证）、R-5-07（D-08 未收窄）。四者都**不改变**本 phase 的发布/迁移结论，但都不应被读成「已闭合」。

**与既有 phase 的关系（为什么本 phase 需要自己的文件，而不是只继承）：**

1. 前四个 phase 各有 `0X-SECURITY.md` 且各自闭合（01 = build/gates/pins 完整性；02 = 依赖矩阵与 `engines.dsh` 拒绝语义；03 = `files` 收面、token scope、catalog 条目形态、CHANGELOG 漂移；04 = migration runbook 的 `--uninstall`/bridge 危险面与「只证行级不相交」的边界声明）。**本 phase 不重开它们的条目**；03 的 T-03-01/T-03-09（`files` 收面）与 T-03-11（push 凭据）在本轮被当作**仍然有效的护栏**引用，并现场复核 `files` 仍 9 项、依赖零变动。
2. 但本 phase **不能只继承**：它执行的正是前序 phase 明确推迟给它的**不可逆对外动作**（03-D-02 的 publish/Release/PR；04-D-02 的真实迁移；04-D-08/09 的旧仓推送）。这些动作的威胁模型是**本 phase 计划期**写的（18+SC），前序寄存器里没有对应行；且 `verify:post` 的验证门读的是**本文件**的 `threats_open`。
3. 承前启后的关系是**分工而非重叠**：phase 4 交下来的三项（codegraph 的**同层合成**、`/tmp/dsh-mig-*` 清理、真实迁移）里，**真实迁移**已由本 phase 闭合、**`/tmp/dsh-mig-*` 已清空**（本轮实测 **0 项**，R-4-01 履约），而**同层合成**（真装三 bundle 的 `COEXIST-DRILL`）仍未闭合——它留在 `05-UAT.md` 开放项 4，本文件不把它算进任何一行。⚠ 但本 phase **自己**新造了 4 个 `/tmp/dsh-uat-*`（见 R-5-01）："`/tmp` 已清" 这句话只对 phase 4 的遗留成立，不对本 phase 的产物成立。

---

## 未验证的事（如实标注）

1. **live UAT 的 7 个用例未在本轮复跑**：需要真实 `dsh` 会话 + `DEEPSEEK_API_KEY` + tarball，且 `05-VALIDATION.md` 已声明「live 段未复跑」。本轮引用 **2026-11-16T07:09–07:16Z 的 live 7/7** 记录与**发布后 registry 通道对 UAT-01 会话谓词**的复验；UAT-02..06 未对最终发布树重跑（R-5-04）。
2. **真实 `~/.dsh` 的状态本轮未重读**（约束要求不触碰该目录）：`.stripped-bak` 2 份、旧源归零、两 profile 各 1 row、72 技能与 3587/3856 B 全部来自证据册判据段 14 的逐字读数，不是本轮现场观测。
3. **未重新联网核验**：npm registry 的 `dist-tags`/`dist.shasum`、GitHub Release 的 tag 解引用、dshmarket PR #18793 的四检终态、旧仓 `3af3f27` 的远端内容，均引用带 UTC 时间戳的既有读数；本轮**没有**发出任何 registry / GitHub API 请求。
4. **`npm publish` 是人工动作**：回执（`+ dsh-gsd@1.20.1-1.dsh022`、`2026-11-25T11:18:35.005Z`）由人回报，agent 侧只能证明「registry 上可读到的字节与装出来的一致」，不能独立证明按下回车的是谁、当时 2FA 是否通过。
5. **「`.dsh021` 从未发布」是不可证否的负命题**：只能以 registry 的版本列表（`versions = ["0.0.0-stage","1.20.1-1.dsh022"]`）为证据，且该读数来自证据册而非本轮现查。
6. **`gsd-p3-release` 的 hook 是否生效未验证**（R-5-06）：该 profile 的 `index.js` 是 CR-01 前形态、技能为 0；其 `cordis.patch.yml` 的 hook 行是否仍被宿主加载，本轮没有可用的观测（需要一次该 profile 的真实会话）。
7. **上游 `@opengsd/gsd-core` 后续版本不会自动保持本仓补丁**（R-5-03）：⑨ 只在每次构建时断言「构建产物 == canonical」。

---

## Sign-Off

- [x] All threats have a disposition（寄存器 19 行全部 `mitigate`；无 `transfer`。accepted risk 仅 A-5-01 一条，属记录性条目，不改变 T-5-05 的 `mitigate` 判定）
- [x] Accepted risks documented in Accepted Risks Log（A-5-01 记录「发布不可撤回」；继承的 A-03-02 状态转 R-5-07，不复制条目）
- [x] `threats_open: 0` confirmed（high 及以上**开放威胁行** = 0；8 项残余均不计入 `threats_open`。其中 R-5-07 的 `delete_repo` 影响面为 high，但它是**继承的 accepted risk + 需人类交互收窄**，已单列为交回项而非本 phase 的开放威胁）
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-26
