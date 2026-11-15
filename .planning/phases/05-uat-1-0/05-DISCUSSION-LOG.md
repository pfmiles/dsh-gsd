# Phase 5: 端到端 UAT 与 1.0 收官 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-15
**Phase:** 5-端到端 UAT 与 1.0 收官
**Areas discussed:** UAT 怎么跑, 发布实体与失败处置, 对外动作谁执行, 收口边界

---

## UAT 怎么跑

### Q1「干净机器」用哪个环境？

| Option | Description | Selected |
|--------|-------------|----------|
| `/tmp` 新 DSH_HOME | 全新 `DSH_HOME=/tmp/dsh-uat-<ts>`，只种入 `settings.yaml.imported` 的 LLM 凭据，零 GSD 残留；本机 profile 只做并存补充、不进 UAT 判据 | ✓ |
| 本机新 profile | 在现有 `~/.dsh` 下新建 profile 名（Phase 3 SC-1 口径）。省 pnpm 冷装，但旧源就在旁边 | |
| 两者都做，分列结论 | 新 home 判定 UAT-01..05；本机 profile 另做「真实机器并存」补充章节 | |

**User's choice:** `/tmp` 新 DSH_HOME（推荐项）
**Notes:** 前置事实把这条题的答案基本钉死了 —— `~/.dsh/skills` 有 72 个旧 `gsd-*`，`headless`/`web` 各有 1 行 bridge；在该环境上「72 技能可见」由旧源满足，判据静默失效。

### Q2 UAT 由谁驱动？

| Option | Description | Selected |
|--------|-------------|----------|
| 机器优先，人工兜底 | 能 headless 判的一律 `dsh --profile <p> --json --approval-policy never "<task>"`；无头覆盖不了的才转人工，人工项须写「人做了什么 + 可观察结果」 | ✓ |
| 全部人工 | 人按清单在 GUI 走，agent 只备命令与录证 | |
| 全部机器 | 连 web 也由 agent 起实例、用 HTTP/日志判定 | |

**User's choice:** 机器优先，人工兜底（推荐项）
**Notes:** 关键使能事实 = `dsh --profile headless` 是一次性会话（answer→stdout、诊断→stderr、进程退出），每次都是新进程 ⇒ hooks 天然重新挂载，不需要人工重启。

### Q3 UAT-06 的启动开销与技能 watch 怎么量？

| Option | Description | Selected |
|--------|-------------|----------|
| 带基线的三点测量 | ① 无插件基线 profile ② 有插件同口径 ③ 插件 load 段日志时间差；watch = watcher 计数 + 改 `SKILL.md` 到生效的时延 | ✓ |
| 只测有插件 | 只给绝对值，不设对照 | |
| 只测任务墙钟 | 只测 headless 一次性任务墙钟（含模型延迟） | |

**User's choice:** 带基线的三点测量（推荐项）
**Notes:** 无基线则「开销」一词无参照物；SC-3 要求「记录入 README」，故结论数字需进 README 双语各一段，原始日志另存证据册。

---

## 发布实体与失败处置

### Q1「1.0 发布」发哪个版本号？

| Option | Description | Selected |
|--------|-------------|----------|
| 发 `1.20.1-1.dsh022` | 零版本改动；`git diff 9e99cd6..HEAD` 对 files 白名单零 diff ⇒ 字节即 CI 已验证字节 | ✓ |
| 抬成 `1.20.1-2.dsh022` | 让版本号「新于」CI 覆盖的 sha，但 files 面零 diff，新号未经 CI | |
| 另起 `1.0.0` | 摆脱 GSD 版本号，与 VER-02 方案冲突 | |

**User's choice:** 发 `1.20.1-1.dsh022`（推荐项）
**Notes:** 「1.0」被确认为 milestone 收官的叙述，不是字面新版本号。

### Q2 publish 后 registry 通道复验变红怎么处置？

| Option | Description | Selected |
|--------|-------------|----------|
| 发 `.dsh023` 修订版 | 保留可追溯历史；失败版本 `npm deprecate` 标注 | ✓ |
| 72h 内 unpublish 重发同号 | 版本号干净，但留痕且有人依赖后不可撤 | |
| 挂已知问题，下次再修 | 最省事，但对「1.0」是硬伤 | |

**User's choice:** 发 `.dsh023` 修订版（推荐项）

### Q3 GitHub Release 用什么形态？

| Option | Description | Selected |
|--------|-------------|----------|
| 正式 Release，无 v 前缀 | tag `1.20.1-1.dsh022`，`prerelease=false`，正文取 CHANGELOG 条目 | ✓ |
| 同 tag，但标 prerelease | 版本串本身是 semver prerelease 形态，标注更「诚实」，但会排在 Latest 之下 | |
| 只打 tag，不建 Release | 最轻，但 SC-4 明写 Release | |

**User's choice:** 正式 Release，无 v 前缀（推荐项）

---

## 对外动作谁执行

### Q1 三项对外动作分别由谁执行？

| Option | Description | Selected |
|--------|-------------|----------|
| 分级：publish 人、Release agent | `npm publish` 人类（OTP + 不可逆）；`gh release create` agent；dshmarket PR agent 开、人类合并 | ✓ |
| 三项全人执行 | agent 只做发布前检查与发布后复验，不碰对外写入 | |
| 三项全 agent 执行 | 人类只提供 npm 凭据与 OTP | |

**User's choice:** 分级（推荐项）
**Notes:** 与 Phase 3 的 blocking-human 先例同构 —— 不可逆动作交人。另：本机 `npm whoami` = ENEEDAUTH，agent 客观上也无法自行 publish。

### Q2 `delete_repo` scope 要不要在本 phase 撤掉？

| Option | Description | Selected |
|--------|-------------|----------|
| 本 phase 撤掉 | `gh auth refresh --remove-scopes delete_repo`，需人类浏览器 re-auth | ✓ |
| 保留 | 收尾后可能还要删临时仓 | |
| 推迟到归档后 | 写进 milestone 归档待办 | |

**User's choice:** 本 phase 撤掉（推荐项）
**Notes:** `gh auth refresh` 原生支持 `--remove-scopes` 且保持其余 scope；`repo`/`read:org`/`gist` 为最小集不可移除。探针仓已于 Phase 3 删除。

### Q3 dshmarket PR 算不算「1.0 收官」阻塞项？

| Option | Description | Selected |
|--------|-------------|----------|
| 不阻塞：开出去 + CI 绿即算 | 完成判据 = PR 已开 + 对方仓四检通过；合并状态记入 UAT 报告作开放项 | ✓ |
| 必须合并才算过 | 更强，但收官时间交给对方 maintainer | |
| 开出去就算，不等 CI | 最松，等于放弃一次真实反馈 | |

**User's choice:** 不阻塞（推荐项）

---

## 收口边界

### Q1 五件未点名移交物怎么纳管？

| Option | Description | Selected |
|--------|-------------|----------|
| 全纳入，并回写 ROADMAP | 五件都进本 phase，plan 逐条落点，名字补回 ROADMAP 的 Requirements/SC | ✓ |
| 只纳 publish 阻塞项 | 只做 `--test-concurrency=1`，其余正式弃置 | |
| 两档：阻塞 + 只读纳入 | 纳入 `--test-concurrency=1` 与 G-4；其余三件独立收尾 | |
| 全弃置 | 严格按 ROADMAP 字面 | |

**User's choice:** 全纳入，并回写 ROADMAP（推荐项）
**Notes:** 其中 3 件是 04-D-02 / 04-D-08-09 的显式移交，ROADMAP 漏记；不点名 = 静默丢失。代价：计划数从 2 涨到 3-4。

### Q2 有机器级副作用的三项顺序怎么排？

| Option | Description | Selected |
|--------|-------------|----------|
| 先 publish，收口放最后 | `/tmp` UAT → publish → registry 复验 → Release → dshmarket PR → 3091 刷新 → 真实迁移 → 旧仓推送 | ✓ |
| 先收口，后 publish | 先把本机弄干净再发 | |
| 本机三项全后置到归档后 | 本 phase 只做 `/tmp` UAT + publish/Release/PR | |

**User's choice:** 先 publish，收口放最后（推荐项）
**Notes:** 决定性事实 —— 本执行会话就跑在 `gsdtest`/3091 上（`DSH_HOME=~/.dsh`，pid 95618）。刷新 3091 = 杀掉本会话；真实迁移会删掉 `~/.dsh/skills/gsd-*`（本会话在用的 72 个技能）。故收口三步必须在所有 `.planning/` 产物提交之后。

---

## Claude's Discretion

- `private: true` 的移除时机与形态（建议与 `publishConfig.tag` 同一次提交，且不写死 tag —— 走 npm 默认 `latest` 即满足 03-D-06）。
- UAT 报告的落点与详略（建议 `05-UAT.md` + `05-UAT-EVIDENCE.md`；`docs/` 不进 `files`，报告也不进 npm 包）。
- `--test-concurrency=1` 的落法（`package.json` 两处 + CI 一处，三处缺一不可；改 workflow 需同步 `tests/compat-matrix.test.mjs`）。
- UAT-06 基线 profile 怎么造、测量点选哪个口径（须写死一个并两次同口径测）。
- `/tmp/dsh-uat-<ts>` 的清理与留痕策略（不得把含 apiKey 的 `settings.yaml.imported` 复制进任何进 git 的目录）。

## Deferred Ideas

- `04-VALIDATION.md` 的 G-1/G-2/G-3（「可自动化却不在套件」三条）→ 不进本 phase。
- `03-REVIEW-DISPOSITION.md` 的 IN-02 行陈旧 → 文档卫生，不属本 phase 判据。
- `dsh-gsd-core` 精简档 → Backlog。
- `ui-frontend-evidence.cjs` 若判定「属上游」→ 转上游 issue/PR，本仓只留登记。
- `03-03-SUMMARY` 的历史数字（`total_count==1` 等）→ 不改写，现值用 `gh api` 现取。