# 05-03 checkpoint record — 发布态已落地，停在 D-04 的 blocking 裁决门

> **这是 checkpoint 记录，不是 `*-SUMMARY.md`，本计划未完成。** Task 2（D-04 裁决 + 推 main + CI）与 Task 3（人类 `npm publish` + registry 复验 + Release + dshmarket PR）**未执行**。
>
> **为什么没有 SUMMARY 文件**：本构建的 `extractFrontmatter` 对**任何** SUMMARY 都返回 0 个键（`05-01` / `05-02` / 本记录改名前三份实测均为 `keys: 0, status: undefined`），因此 `status: halted` / `status: blocked` 这些「设计性停止」的机器可读信号在本环境**全部失效** —— 一个 `05-03-SUMMARY.md` 会被 `init.execute-phase` 计为「已总结」，把 05-04 变成下一个计划（而 05-04 是 3091 刷新 → 真实迁移 → 旧仓推送的收口段，按 D-11 必须在发布之后）。改用不匹配 `*-SUMMARY.md` 的文件名后，工具链仍把 05-03 报成 incomplete，续执行点留在 05-03。
>
> 完成 Task 2/3 后，续执行器应把本文件重写为 `05-03-SUMMARY.md`（`status: complete`），并补上 `requirements-completed` 中真正成立的子集。

| 字段 | 值 |
| ---- | -- |
| phase / plan | `05-uat-1-0` / 03 |
| 计划状态 | **未完成**：Task 1 done / Task 2 停在裁决门 / Task 3 未开始 |
| 本段完成任务 | 1 of 3 |
| 任务提交 | `3287bbd`（chore(05-03)） |
| 本记录提交 | docs(05-03)（见 `git log --oneline`） |
| plan_head_before | `c82d844aac20e75a0ecad4c7a7bd04c25fe089f5` |
| plan_head_after | `3287bbd115c4f9b0b63a2daa329aee5279d68008` |
| 实测提交数 | 1（`git rev-list --count c82d844..3287bbd`） |
| actuals.tokens | 4279（chars/4 over the Task 1 diff：17 118 B） |
| 时长 | 14 min（2026-11-16T07:28Z → 07:42Z） |
| requirements-completed | 无（PUB-01 / PUB-03 / UAT-06 / UAT-01 均未在本计划内成立） |

tags: npm-publish, publish-state, dry-run, tag-guard, registry-pin, checkpoint, not-complete

---

# Phase 5 Plan 3: 发布态落地与 dry-run 门 Summary

**把树翻成发布态并让 npm 自己验了一遍：`private` 键整键删除（不是置 `false`）、`publishConfig` 变成 `{registry: npmjs, tag: latest}`、⑥⑬ 与文件头注释同日改、README 双语新增启动开销段（9 ms / 279 ms / ≈270 ms）、CHANGELOG 只追加不新建标题；`npm publish --dry-run` 打印 `Publishing to https://registry.npmjs.org/ with tag latest` 并真跑完 prepack（`gates: all passed (A/B/C)` + `ℹ tests 47`）。随后停在 D-04 的 blocking 裁决门前。**

> **本段只做到 Task 1。** Task 2（D-04 裁决 + 推 main + CI）与 Task 3（人类 `npm publish` + registry 复验 + Release + dshmarket PR）**未执行**：前者是 `one-way` 的裁决门（`autonomous: false`、auto-mode 关闭），本 dispatch 的边界是「执行 Task 1、到达门、返回」。裁决与后续步骤见本文件 `## 停在哪个门` 一节。

## Performance

- **Duration:** 14 min
- **Started:** 2026-11-16T07:28:04Z（dispatch 起点）
- **Completed（本段）:** 2026-11-16T07:42Z
- **Tasks:** 1 / 3（Task 1 完成；Task 2 停在裁决门；Task 3 未开始）
- **Files modified:** 5（+ 本记录）

## Accomplishments

- **四处发布态改动同日落地**：`package.json` 删 `"private": true,` 一行、`publishConfig` 加 `"tag": "latest"` 一行（`git show HEAD -- package.json` 恰两处、`--numstat` = `2 2`）；`docs-consistency` 的 ⑥ 从「`private` 必须为 true」翻成**发布态哨兵**（`!('private' in pkg)`，仍钉 `version === '1.20.1-1.dsh022'`）、⑬ 的 `deepEqual` 期望值加 `tag` 且**保留 registry 断言**（npmjs 钉法只加强、不放宽）、文件头 ⑥ 的描述句同步改写。
- **README 双语落地**：zh 半 `## 启动开销`（在「当前状态」之后、en 半 H1 之前）、en 半 `## Startup overhead`（在 `## Status` 之后）；三点数字 **9 ms / 279 ms / ≈270 ms** 与 `05-UAT.md` 的 UAT-06 行**同源逐字一致**，口径写死为「会话记录里 `session.createdAt` 到首个 `turn/start.time` 的差」，并显式声明墙钟不可用作开销（2 560–3 834 ms 漂移）；技能 watch 写 `not measured` + 结构性理由（一次性会话每次都是新进程）。两半的「当前状态 / Status」句改写为点名 `1.20.1-1.dsh022`、8 项 UAT 已在干净机器通过、指向 `CHANGELOG.md`，且不含 `dsh-gsd@latest`。
- **CHANGELOG 只追加**：`## [` 版本标题数不变（`Unreleased` + `1.20.1-1.dsh022`），新 bullet 落在既有 `### Added` / `### Changed` 下（⑧ 的六值闭集与版本等值断言都仍绿）。
- **dry-run 门真跑通**（不是贴一行输出）：`npm publish --dry-run` exit 0，`npm notice run … prepack` 真的执行了 `node build.mjs && node --test --test-concurrency=1 tests/*.test.mjs` → `gates: all passed (A/B/C)`、`ℹ tests 47 / ℹ pass 40 / ℹ fail 0 / ℹ skipped 7`；打包面 `total files: 958`、`package size: 4.6 MB`、`unpacked size: 16.0 MB`；目标行 `npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access (dry-run)`。同一次跑还给出登录态反证：`npm warn publish This command requires you to be logged in …` ⇒ 本机未登录，真发布必须由人类带 OTP 执行（D-07）。
- **证据册判据段 9**：dry-run 关键行 + 两条如实差异（下面 `## 两个必须交给人的实测发现`）。
- **Tracer 反馈门**：提交后在**同一棵树**上把 `<verify>` 的三条命令端到端复跑（`docs-consistency` 16/16、全量 47/40/0/7、`npm publish --dry-run` exit 0），全部绿 → 才继续到 Task 2 的门口。

## Task Commits

1. **Task 1（`type="tracer"`）: 发布态树一条路径到底（四处 manifest 改动 + 双语 README 开销段 + CHANGELOG 追加），终点是 `npm publish --dry-run` 的 tag/registry 行** - `3287bbd` (chore)
2. **本记录（docs）: checkpoint 状态 + 判据段 9 的两条差异补充** - 本次提交

`commits:` 由账本实测：`c82d844..3287bbd` = **1**（任务提交；账本在写本文件前测得，故不含本 metadata 提交）。

## Files Created/Modified

- `package.json`（2 行改动）—— 删 `"private": true,`、`publishConfig` 加 `"tag": "latest"`；`files` 九项 / `engines` / `dsh.bundle` / `peerDependencies` / `version` 一字未动。
- `tests/docs-consistency.test.mjs`（+13 −5）—— ⑥ 改发布态哨兵（键不存在，不是 `=== false`）、⑬ 期望值加 `tag` 并把失败消息扩成「registry 丢 / tag 丢」两条可区分红、文件头第 6-7 行同步；未新增 `test(`（47 不变，⑯ 无需改 `BUILD.md`）。
- `README.md`（+32 −2）—— 两半各一段启动开销结论 + 状态句改写。
- `CHANGELOG.md`（+3）—— `### Added` 补 2 条、`### Changed` 补 1 条。
- `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md`（判据段 9 共 +36 行，后续 docs 提交再 +14 行）—— 判据段 9。

## Decisions Made

见 frontmatter `key-decisions`（5 条）。三条要点：

1. **README 数字按实测，不按计划引用的旧值**。计划 action 3 写「约 10 / 约 340 / 约 330 ms」（来自 RESEARCH），但 same 段 must_haves 要求与 `05-UAT.md` 的 UAT-06 行「同源逐字一致」，而本 phase 实测是 **9 / 279 / ≈270**。取实测值：写旧值会让 README 与本仓证据册互相矛盾 —— 那正是本 phase 存在的理由。
2. **「发布的字节」这个口径本身要改**。`npm publish` 的 prepack 会重建，而 build 每次给 59 个文件盖新的随机 heredoc nonce ⇒ 字节在构造上不可复现（详见下节）。因此 Task 2/3 的判据只能是「同一提交 + 同一套门 + CI 绿」，`PUBLISHED_SHA` 是**发布所用提交**的标识，不是字节指纹。
3. **不修 build 的非确定性**。它属上游设计（避免 heredoc 标记与正文冲突），且会改 958 个成员中 59 个的形态；本任务对 `9e99cd6` 的代码树零 diff 已单独取证。留给上游/后续 phase 裁决。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 计划把 dry-run 证据指派给「判据段 8」，而 8 已被 05-02 占用**
- **Found during:** Task 1 写证据册时
- **Issue:** `05-03-PLAN.md` 的 artifacts 与 Task 1 acceptance 都写「判据段 8 = dry-run」，但 05-02 的偏离 3 已把 **判据段 8 = UAT-06** 落盘（计划 05-02 只被指派 4–7）。照字面写会覆盖既有证据。
- **Fix:** 新段落写作 `## 判据段 9 — 发布前 dry-run（计划编号 8；因 05-02 已占用「判据段 8」而顺延）`：段名前缀与复验序的引用格式不变，编号顺延并在标题里点名原因。Task 2/3 的段落届时顺延为 10/11（计划分别写 9/10）。
- **Files modified:** `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md`
- **Verification:** `grep -n '^## 判据段'` → 1..9 连续、无重复。

**2. [Rule 1 - Bug] 计划的 README 数字与它自己的 must_haves 冲突（旧 RESEARCH 值 vs 本站实测值）**
- **Found during:** Task 1 写 README 时
- **Issue:** action 3 要求写「基线约 10 ms、带插件约 340 ms、插件段约 330 ms」，而 must_haves 要求「数字与 `05-UAT.md` 的 UAT-06 行同源逐字一致」。该行实测为 **9 / 279 / ≈270 ms**（05-02 已记录「RESEARCH 基线 10 / 340 / ≈330，同口径不同值」）。两者不能同时满足。
- **Fix:** 取实测值（9 / 279 / ≈270），并在段内写死口径与 `n=3`/单机/暖页缓存，使读者能判断「这是本站这一次的数」。
- **Files modified:** `README.md`
- **Verification:** 与 `05-UAT.md` UAT-06 行逐字比对；`docs-consistency` ① ② ⑤ ⑨ ⑫ 全绿。
- **Impact:** 无判据放宽 —— 写旧值才会制造「文档与证据不一致」。

**3. [Rule 1 - Bug]（发现，未修）`npm publish` 的字节不可复现**
- **Found during:** tracer 反馈门（提交后复跑 dry-run 时 shasum 变了）
- **Issue:** 同树两次 dry-run 的 `shasum` 不同（`4d3edd7c…` → `35d93379…`）。定位：同一棵已构建的树连跑两次 `npm pack --ignore-scripts` 字节相同，但 `node build.mjs` 重建后即变 —— 恰好 59 个成员不同，且这 59 个就是全部含 `GSD_ARGS_END_` 的文件；根因是 `gsd-core/bin/lib/args-terminator.cjs:37-40` 的 `generateArgsNonce()` = `randomBytes(16).toString('hex')`，构建的 installer 步骤把每个文件的重定向标记盖章成新 nonce。
- **Fix:** **不修**（属上游设计，且不在本任务触发面内）。改写的是**口径**：D-04 的「发布的字节 = CI 验过的字节」在构造上不可成立，Task 2/3 只能用「同一提交 + 同一套门 + 该提交上 CI 绿」。
- **Files modified:** `05-UAT-EVIDENCE.md`（判据段 9 的新小节）
- **Verification:** 两次 `npm pack --ignore-scripts` sha256 相同（`bcbe1454…`）；重建后不同（`fa94f7d7…`）；成员清单 958/958 相同、59 个内容不同、全部为 `GSD_ARGS_END_` 载体；与 `05-UAT-EVIDENCE.md` 判据段 9 一致。

**4. [Rule 1 - Bug] CHANGELOG 的补充落进既有小节，而不是新增两个同名小节**
- **Found during:** Task 1 改 CHANGELOG 时
- **Issue:** 计划写「追加 `### Changed` 与 `### Added`」，但该条目下两个小节都已存在；再建同名小节会让 Release 正文（`awk` 抽到下一个 `## [`）出现重复标题，⑧ 只查名不查重（能过），但可读性差。
- **Fix:** 追加 bullet 到既有 `### Added` / `### Changed`。语义与计划一致（不新建版本标题、小节名在六值闭集内）。
- **Files modified:** `CHANGELOG.md`
- **Verification:** `## [` 标题数仍为 2（`Unreleased` + `1.20.1-1.dsh022`）；⑧ 绿。

---

**Total deviations:** 4 auto-fixed/documented（Rule 1 × 4；其中 1 条只改口径不修代码）。
**Impact on plan:** 无一条放宽判据。偏离 1 防的是覆盖既有证据；偏离 2 防的是文档与证据互相矛盾；偏离 3 是本 phase 最重要的一条实测（它把 D-04 的字节口径从「不可能成立」改成「可成立且更强」）；偏离 4 是文档结构选择。

## 两个必须交给人的实测发现

1. **dry-run 门是有牙的**：本机 npm 12.2.1 对 prerelease 版本缺显式 tag 时在**写网络之前**硬拒（`publish.js:131-138`），所以 `with tag latest` 这一行同时证明 `publishConfig.tag` 生效、且 `registry` 没有落回本机只读镜像。两条失败可区分（tag 缺 → 命令到不了打包之后；registry 错 → exit 仍 0，只有那一行变）。
2. **字节不可复现（见偏离 3）**：`npm publish` 一定会重建，而 build 每次换 59 个文件的随机 heredoc nonce ⇒ 发出去的 tarball 在构造上不可能等于任何此前被验过的 tarball。**这不阻止发布，但它改变了「验过什么」的表述**：可以证的是「同一提交 + 同一套构建门 + 同一套串行测试 + 该提交上 CI 绿」，不能证「字节指纹相同」。

## 停在哪个门

**Task 2 — `checkpoint:decision`，`gate="blocking"`，`reversibility: one-way`。** auto-mode 关闭（`workflow.auto_advance: false`、`_auto_chain_active: false`），故**不得自选**，也未执行 Task 2 的 `<action>`（没有推送、没有 `workflow_dispatch`、没有写判据段 10）。

### 三个选项（`05-03-PLAN.md` 原文）

| id | 名称 | 收益 | 代价 |
| -- | ---- | ---- | ---- |
| `publish-as-is` | A. 按 `1.20.1-1.dsh022` 原样发布（先推 main 取得该提交的 CI 绿） | 与 D-04 一致；代码树零 diff；dry-run 已证 tag 与 registry 正确；发布后可在同一提交上取得 CI 背书 | 版本号烧掉；失败只能发 `.dsh023` 并 deprecate |
| `bump-rev` | B. 抬 rev 到 `.dsh023` | 可把「发布态改动」打包成一次全新版本 | 新号从未被任何 CI run 验过，脱保；违反 D-04 既定裁决，需同步改 ROADMAP/CHANGELOG 与 Release 口径 |
| `defer` | C. 暂缓，先把 CI 补绿再说 | 不烧版本号 | 已包含在 A 的执行顺序里；拖延使 UAT 证据过期 |

### 裁决所需的事实（本 dispatch 实测）

- **版本串**：`1.20.1-1.dsh022`（`package.json` / `CHANGELOG.md` / `05-UAT.md` 三处一致）。
- **`npm publish --dry-run`**（2026-11-16T07:33:58Z → 07:34:14Z，exit 0）：
  - `npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access (dry-run)` ← tag guard 未被触发 + registry 是 npmjs
  - `gates: all passed (A/B/C)`；prepack 内 `ℹ tests 47 / ℹ pass 40 / ℹ fail 0 / ℹ skipped 7`
  - 打包面：`total files: 958`、`package size: 4.6 MB`、`unpacked size: 16.0 MB`、`shasum: 4d3edd7c527729571d9e780148348584986f0980`（⚠ 该 shasum **不可复现**，见偏离 3；同树复跑得 `35d93379…`）
  - `npm warn publish This command requires you to be logged in to https://registry.npmjs.org/ (dry-run)` ⇒ 本机未登录，发布必须由人类执行（D-07）
- **将发布的提交**：`3287bbd115c4f9b0b63a2daa329aee5279d68008`（本记录之后若再有提交会继续前进；`PUBLISHED_SHA` 必须是**推送后** `gh api repos/pfmiles/dsh-gsd/commits/main --jq .sha` 的权威值）。
- **工作树**：干净（`git status --short` 为空；本记录与判据段 9 的补充已随 docs 提交落盘）。
- **代码树零 diff**：`git diff 9e99cd6..HEAD --stat -- index.js cordis.patch.yml locale icon.svg skills gsd-core hooks config scripts` → 空；含工作树再跑一次仍为空。白名单面上变的只有 `package.json` 与 `README.md`（都属于「发布态本身」）。
- **抢注复查（只读，供裁决参考）**：`curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/dsh-gsd` → **404**（对照组 `@opengsd/gsd-core` → 200，2026-11-16T07:41:27Z）⇒ 名字仍空，选项 A 在名字面上可执行。
- **`gh auth status`（只读）**：登录 `pfmiles`，scopes `delete_repo, gist, read:org, repo, workflow`，`Git operations protocol: ssh`（故推送必须走 `--credential.helper='!gh auth git-credential'` 的 HTTPS 形态，`origin` 保持 SSH 不改写）。`delete_repo` 的收窄（D-08）仍在 Task 3。
- **未执行**：Task 2 的推送/`workflow_dispatch`/判据段 10 写作；Task 3 的全部动作（含任何 registry 读、`gh release create`、dshmarket PR、D-08 的 scope 收窄）。

## Issues Encountered

1. **shasum 漂移先被当成「树变了」**：第一次 dry-run 的 shasum 与提交后复跑不同。排查顺序是「是否有人改了打包面文件」→「是否 `files` 白名单变了」→「同一棵树连跑两次 pack」→「重建后再 pack」，最后定位到随机 nonce。**这条记录的意义**：发布前证据里的字节指纹，先要问一句「它可复现吗」；不可复现的指纹不是判据，只是一个读数。
2. **`.gitignore` 覆盖构建产物**（`skills/ gsd-core/ hooks/ config/ scripts/ .gsd-build-tmp/`）：dry-run 触发的重建没有把工作树弄脏，`git status --short` 全程只显示我改的 4 个文件 + 证据册。

## User Setup Required

见 `05-03-PLAN.md` 的 `user_setup`：`npm publish` 需要人类账号的 2FA/OTP（本机 `npm whoami` = ENEEDAUTH），且 `pfmiles` 需对 `dsh-gsd` 有发布权限。本 dispatch **没有**也无法代跑 `npm publish`。

## Next Phase Readiness

**续执行器的接续点**：D-04 的裁决（`publish-as-is` / `bump-rev` / `defer`）。

- 回 `publish-as-is` → 执行 Task 2 action 3–6：推 `phase-5/publish-tree` 预演分支 → `gh workflow run compat-matrix.yml --ref phase-5/publish-tree` 轮询到 `completed/success` → 推 main → `gh api repos/pfmiles/dsh-gsd/commits/main --jq .sha` 取 `PUBLISHED_SHA` → 轮询 main 的 run 至 `success`；两次 run 的 `(databaseId, headSha, conclusion)` 与 `PUBLISHED_SHA` 写进判据段 10（计划写 9），**并把五项裁决证据一次摆全**。
- 回 `bump-rev` → **停止本计划**，把版本号变更交回上游裁决（改 `package.json`、`CHANGELOG`、`ROADMAP`、`05-UAT.md` 与本计划里的版本串后重跑 Task 1），不得私自抬 rev。
- 回 `defer` → 记录裁决与理由，停在 Task 2 之前。
- 完成后把本文件重写为 `05-03-SUMMARY.md`（`status: complete`）并补上 `requirements-completed`（PUB-01 / PUB-03 / UAT-06 / UAT-01 中真正成立的子集）。

## Self-Check: PASSED

- 文件存在：`05-03-CHECKPOINT.md` FOUND（**故意不叫 SUMMARY**，理由见文件头）/ `05-UAT-EVIDENCE.md` 判据段 9 FOUND（`grep -n '^## 判据段 9'` 命中）
- 提交可达：`3287bbd` FOUND（`git merge-base --is-ancestor 3287bbd HEAD` = 真）
- 任务提交内容：5 个文件、无删除（`git show --diff-filter=D --name-only HEAD` 为空）
- 发布态：`'private' in pkg` = false；`publishConfig` = `{registry, tag}`；`git diff HEAD -- package.json` 恰两处
- 套件（提交后同树复跑）：`docs-consistency` 16/16、全量 `ℹ tests 47 / pass 40 / fail 0 / skipped 7`，exit 0
- dry-run（提交后同树复跑）：exit 0，`Publishing to https://registry.npmjs.org/ with tag latest` 在场
- 代码树零 diff：对 `9e99cd6` 的两条 `git diff … --stat` 均为空输出
- 证据册无凭据材料：`grep -c 'sk-'` = 0
- 未做的动作：无 `git push` / 无 tag / 无 `gh release` / 无 `npm publish`（真跑）——本 dispatch 的 `git status` 与 `git log` 可复核