# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — 首发

**Shipped:** 2026-11-27
**Phases:** 5 | **Plans:** 18 | **Tasks:** 48 | **Sessions:** 未逐次统计（见 Cost Observations）

### What Was Built

- `dsh plugin --profile <name> add dsh-gsd` 一条命令把 GSD Core（72 skills + 独立引擎 + 守卫钩子）装进 DSH 任一 profile —— 不写受管 `~/.dsh` 文件、不需要安装脚本、升级/回滚 = 同命令换版本号
- `build.mjs` 从「抄本机部署」改成「从 `@opengsd/gsd-core@1.20.1` npm tarball 经官方 `--claude` staging 取材 → staging 相对改写 → gates A/B/C」，构建可复现、无机器特定路径、离线三档回退
- 4 格 × 6 步 CI 兼容矩阵（DSH `0.2.2-rc.1` install-ok / `0.2.1-rc.5` expect-reject × GSD `1.20.1` / `1.19.0`），首发后每次 push 全绿
- npm `dsh-gsd@1.20.1-1.dsh022` 首发（`latest`，958 files，装出的字节 = registry `dist.shasum`）+ GitHub Release + dshmarket 收录；双语迁移 runbook、旧仓互链
- 判据 harness（`tests/uat-harness.test.mjs`，7 条 live 用例）＋ 串行全量套件（47 tests，默认 40 pass / 7 skip），把「装得上、跑得完、拦得住」变成可重放命令

### What Worked

- **判据环境隔离**：每个用例一份 `mkdtemp('/tmp/dsh-uat-')`，子进程 env 先删 `DSH_HOME`/`DSH_PROFILE`/`DSH_PROFILE_DIR`/`ALIPAY_API_KEY` 再显式设。这条纪律直接决定了 UAT 结论有效 —— 在真实 `~/.dsh` 上，「技能可见 / hook 生效」会被 72 个旧脚本技能静默满足
- **判据 harness 而非手测**：7 条 live 用例在**发布字节**上整套重跑（`7 pass / 0 fail / 0 skipped`），UAT 结论因此不依赖「当时那台机器的当时状态」
- **三段对照**排掉三种假绿：commit 校验的「opt-in 拦 / opt-in 放 / 未 opt-in 放」，把「恒拦」「恒放」「fail-open」一次性区分开
- **探针私仓干跑**（一次可删的 run）换掉「真仓首跑变红」的不可逆风险，真仓因此 `run_attempt=1`、`total_count=1`、无红跑历史
- **归档前 `--dry-run`**：`milestone.complete --dry-run` 先把 5 个 phase 的移动清单、accomplishments、stats 全打出来，再决定是否真跑
- **收官对账**：把「记账 vs 现实」的三处差异（2 条审计误报、5 份过期 digest、10 个无承保需求）先量清楚再决定怎么关，而不是让工具替自己拍板

### What Was Inefficient

- **verification 陈旧直到收官才发现**：串行项目里后续 phase 必然修改 `BUILD.md` / `README.md` / `package.json` / `build.mjs` / `tests/*`，于是先行 phase 的 `covered_digest` 必然过期。5 份报告**全部** stale，收官时只能用 `override_closeout` 关掉。这不是判定被推翻，但它说明「每 phase 收官即验、之后不会再碰共享文件」这个隐含假设在本项目从来不成立
- **需求 → phase 的承保关系漏了一批**：10 个 ID（SKIL-01/02/05、HOOK-01..04、DEV-01/02/04）从未写进任何 phase 的 `Requirements:` 行，5 个 verifier 因此一个都没看它们。能力有证据，缺口在规划期就埋下了
- **STATE.md 长成 43KB**：60 余条带理由的决策与逐阶段叙事越积越多，收官时不得不先归档快照再瘦身。决策该在写下的同时进 PROJECT.md，而不是堆在 STATE
- **工具改写状态 6 次写错数**：`state.update-progress` / `phase.complete` / `milestone.complete` 反复写错 `percent`、`completed_phases` 或直接丢掉 `Progress:` 行（本次 `milestone.complete` 的 `preservation_warnings` 报的就是它），每次都得按算术与 ROADMAP 勾选手工订正。**自动写入的进度数字一律不可信，必须复算**
- **3 份 SUMMARY 的 frontmatter 是非法 YAML**：`03-01` / `05-01` / `05-02` 一路写到收官才被 `summary-extract` 撞出来，期间它们一直被静默丢出里程碑汇总（读 one-liner 之前就抛错，被 `try/catch` 吃掉）
- **两个 live 用例在 CI 里恒 skip**：CI 从不设 `DSH_UAT_LIVE`，所以最值钱的那部分判据只在本地跑过

### Patterns Established

- **一次性 home 判据环境** + 子进程 env 白名单（`DSH_HOME` 必须是新目录，真实 home 只读）
- **会话判据** = 「`assistant/message` 在场 ∧ 任何 `turn/end` 递归无 `kind:error`」。唯一有效形态 —— session 目录在失败轮同样会被创建
- **三段对照**（原点拦 / 原点放 / 负向对照）用于任何「守卫是否真的生效」类判据
- **「只有版本串不同」的 tarball 复刻**：从已发布字节解包改 version 再 repack，判据因此只量一个变量
- **canonical 覆盖件 + post-staging `cp`** 作为构建产物补丁的唯一可重建形态（直接改产物会在下次 `npm pack` 时消失；手改 `counters.copied` 会打红 `copied 76 trees`）
- **三道提交闸**：`git status --porcelain` 空 + `git diff --quiet HEAD -- <f>` + `<f>` 在 `git log --format= --name-only -- <f>` 里 ≥1 次。从不使用 `git log -1`（只提交证据册的批次会把已提交的锚点判红）
- **假绿通道清单**（永不重引）：session 目录存在、npm 的 `+` 行、本仓 commit 校验默认 OFF、injection scanner 默认只告警、runbook 块末尾无条件 `exit 0`、`MISSING:`/`SKIPPED` 仍打印 ok、`--dump-config` 不是只读且从不 evaluate `!!js`

### Key Lessons

1. **「产物能否被宿主消费」必须走到真实消费路径**。CR-01（`skills/` 定位 off-by-one，72 个技能从未加载）是被 code review 发现的，不是被 phase 的 SC-1 证据 —— 后者用 `ls` 数包内 `SKILL.md`。更狠的一点：**版本串 `1.20.1-1.dsh022` 完全区分不出修复前后**，只有 `index.js` 的形态与技能加载结果能。
2. **exit code 一律不作判据**。失败轮同样创建 session 目录；`plugin add` / `--dump-config` 在 bundle 被静默跳过时同样 exit 0；`dsh plugin --profile <absent> add` 甚至 exit 0 并初始化 profile（与自己的 RESEARCH 相反）。
3. **digest 过期 ≠ 判定被推翻；但也绝不能用 `verification fingerprint` 重算 digest 去「刷新」报告** —— 那等于不重跑判定就自证通过，比留一份过期的真报告更糟。
4. **一次 404 不判红**。npm publish 回执到版本可读约 7 分钟（本次实测，`11:10:24Z` → `11:18:35Z`），传播窗口内的 404 是窗口不是失败；这条从纪律变成了有具体时长的读数。
5. **需求 → phase 的承保关系要在规划期闭合**。没有 phase 认领的需求 ID，verifier 永远不会看 —— 于是「能力做出来了」与「需求被判定过」之间会出现一条静默的沟。
6. **状态文件的自动写入一律复算**。`percent` / `completed_phases` / `Progress:` 行在本 milestone 里被自动改错 6 次，每次都以「工具说 updated: true」的形式发生。
7. **串行改共享文件的里程碑，收官前要预留重验成本**。否则整个里程碑只能在 `override_closeout` 下关闭 —— 记录得再清楚，也不等于重验过。

### Cost Observations

- **Model mix**：无法从本地数据得出（未按模型记录 token 归属）
- **Plan-level token actuals**：18/18 份 SUMMARY 都记了 `actuals.tokens`，合计 **168,015**；重头在 phase 04–05（`04-05` 18,615 / `05-02` 22,667 / `05-03` 20,531 / `05-04` 18,268 / `05-01` 17,439 —— 五个计划占 58%），轻头在 phase 02–03（`03-01` 1,096 / `04-02` 2,600）
- **Sessions**：未逐次统计
- **Notable**：`05-04` 单计划 wall clock **14h49m**，其中绝大部分是人类外部等待（发布传播窗口、3091 重启、对旧仓推送的裁决），不是模型时间。`03-03` 反过来 —— 9 min 的计划外，~67 min 都在线下等人类授权与探针仓跑 CI。**计划耗时数字必须区分「模型时间」与「人类等待」**，否则会被误读成效率指标

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 未统计 | 5 | 首个里程碑：从「机制已验证的 spike」走到一条命令可用；判据从手测转为 harness；dogfooding 全程由本插件在 3091 上驱动 |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 47（默认 40 pass / 7 skip；`DSH_UAT_LIVE=1` 时 42 pass / 5 skip） | 无覆盖率统计（判据面以 UAT/SECURITY/VALIDATION 报告承载，132/132 must-haves） | 0（依赖仅 DSH 与 GSD 上游） |

### Top Lessons (Verified Across Milestones)

1. *（v1.0 首条，尚无跨里程碑验证）* 「产物能否被宿主消费」必须走到真实消费路径 —— 文件在盘上不等于宿主加载得到，版本号也不等于实现形态。
2. *（v1.0 首条）* 假绿通道会以「工具打印成功」的形式反复出现；每发现一条就写进文档并加机器断守，否则它一定会回来。