---
phase: 05-uat-1-0
plan: 03
subsystem: release
tags: [npm-publish, registry-pin, propagation-window, github-release, dshmarket, registry-channel, staged-publishing-placeholder]

# Dependency graph
requires:
  - phase: 05-uat-1-0
    provides: 05-01/05-02 的判据段 1–8（两条安装面、hooks、UAT-05 机制段、启动开销）与本计划的发布前证据（判据段 9 的 dry-run、判据段 10 的两次 CI）
  - phase: 05-uat-1-0
    provides: Task 1 的发布态树（`private` 整键删除、`publishConfig.tag`）与 Task 2 的 `PUBLISHED_SHA = a0529ac`
provides:
  - npm 上 `dsh-gsd@1.20.1-1.dsh022` 是 `dist-tags.latest`，用 registry 通道在全新 `/tmp` home 装出的 958 个文件与 registry 上那份 tarball 逐字节相同，且通过 UAT-01 的会话谓词
  - GitHub Release `1.20.1-1.dsh022`：tag 无 `v` 前缀、`prerelease=false`、正文取自 CHANGELOG 条目、目标提交 = `PUBLISHED_SHA`
  - dshmarket 单文件 PR 已开（#18793），逐字节一致，四检状态逐条记录（合并状态是开放项）
  - 一条实测的传播窗口读数：publish 回执后约 7 分钟版本才可读 ⇒ 「一次 404 不判红」有了具体时长依据
affects: [05-04]

# Actuals (#2632) — 同一 estimateTokens 口径（chars/4 over realized diff），不是 harness token 数
actuals:
  tokens: 20531
  tasks: 3
  commits: 4
  plan_head_before: c82d844aac20e75a0ecad4c7a7bd04c25fe089f5
  plan_head_after: 5f9b130e54ec2748d98b1e97a7eaef84c7c8033d

tech-stack:
  added: []
  patterns:
    - "读侧 registry pin：`publishConfig.registry` 只治理写；每条读都带 `--registry https://registry.npmjs.org/`，并先记一行 `npm config get registry` 作为「为什么必须 pin」的现场证据"
    - "发布传播窗口：publish 回执 ≠ 版本可读；窗口内的 404 是正常读数，不是 D-05 的依据"
    - "判据本体复用：registry 通道的会话谓词由脚本在运行时从 `tests/uat-harness.test.mjs` 抽取函数后执行，不另写一套"
    - "退化路径留痕：首选 CLI 路径被网络层拒时，改用计划写明的 `gh api` 路径，并把「下载回落盘那份再 `cmp`」作为逐字节一致的证据"

key-files:
  created:
    - .planning/phases/05-uat-1-0/05-03-SUMMARY.md
  modified:
    - .planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md
    - .planning/phases/05-uat-1-0/05-UAT.md
  deleted:
    - .planning/phases/05-uat-1-0/05-03-CHECKPOINT.md

key-decisions:
  - "「人放行」与「包已发布」严格两段：本 dispatch 从 `published` 回执起步，第一次 registry 读的 UTC 是 11:57:59Z，晚于回执 11:18:35Z —— 窗口里那 7 分钟的 404 没有被读成红"
  - "传播窗口内的一次 404 不判红，且窗口下限定为 ≥5 分钟：本轮实测「回执 → 可读」约 7 分钟，是这条纪律的具体时长依据"
  - "registry 通道「装上了」不靠 pnpm 计数器（它打 `downloaded 0`），而靠「装出的 958 个文件 == registry 上那份 tarball，逐文件 sha256 相同」"
  - "`0.0.0-stage` 是 npm staged publishing 的占位版本，不是我们的代码；按 D-05 同精神建议 deprecate 而非 unpublish，且**本计划不执行**（需 OTP）"
  - "dshmarket 走 `gh api` 退化路径（首选 clone 被网络层拒两次），逐字节一致由「从 fork 下载回来再 cmp」证明，比本地 cmp 更强"
  - "UAT-06 不翻勾：它由 05-04 一并声明，且技能 watch 段仍是 `not measured`"

requirements-completed: [PUB-01, PUB-03, UAT-01]

coverage:
  - id: D1
    description: "npm 首发成功且 `dist-tags.latest = 1.20.1-1.dsh022`（权威 registry 读数）"
    requirement: PUB-01
    verification:
      - kind: manual_procedural
        ref: "npm view dsh-gsd dist-tags.latest --registry https://registry.npmjs.org/  (05-UAT-EVIDENCE.md 判据段 11 §registry 复验 第 2 行)"
        status: pass
    human_judgment: false
  - id: D2
    description: "registry 通道（`add dsh-gsd@1.20.1-1.dsh022 --registry=…`）在全新 /tmp home 上装成，并通过 UAT-01 的会话谓词"
    requirement: UAT-01
    verification:
      - kind: e2e
        ref: "tests/uat-harness.test.mjs#③ 谓词（运行时抽取）+ registry 通道安装（05-UAT-EVIDENCE.md 判据段 11）"
        status: pass
    human_judgment: false
  - id: D3
    description: "GitHub Release `1.20.1-1.dsh022`：tag 无 v 前缀、prerelease=false、正文即 CHANGELOG 条目、tag 解引用 = PUBLISHED_SHA"
    verification:
      - kind: other
        ref: "gh release view 1.20.1-1.dsh022 --json tagName,isPrerelease,targetCommitish ; git ls-remote --tags (05-UAT-EVIDENCE.md 判据段 11 §Release 第 3/5/6 行)"
        status: pass
    human_judgment: false
  - id: D4
    description: "dshmarket 单文件 PR 已开，内容与仓库源文件逐字节相同"
    requirement: PUB-03
    verification:
      - kind: other
        ref: "cmp(下载回 fork 分支的那份, docs/dshmarket/pfmiles__dsh-gsd.yml) ; gh api …/pulls/18793/files (05-UAT-EVIDENCE.md 判据段 11 §dshmarket PR 第 6/9 行)"
        status: pass
    human_judgment: false
  - id: D5
    description: "dshmarket 四检通过（目标仓 CI）"
    requirement: PUB-03
    verification:
      - kind: other
        ref: "gh pr checks 18793（run 45612678334）"
        status: unknown
    human_judgment: true
    rationale: "④ 的终态由目标仓自己的 runner 决定，收官时仍在跑最后一步 Build；①②③ 已由直读确认。D-09 的完成判据是「PR 已开 + 四检通过」且合并不等，故这条必须由人（或下一次观测）确认，不在此处声称已绿"
  - id: D6
    description: "D-08 的 `delete_repo` scope 收窄"
    verification: []
    human_judgment: true
    rationale: "需要一次交互式浏览器 re-auth，本计划按 dispatch 边界**未执行**；`gh auth status` 原样清单里 `delete_repo` 仍在。不得把未执行记成已完成"

# Metrics
duration: 14 min (Task 1) + 15 min (Task 2 segment) + ~40 min (this segment)
completed: 2026-11-25
status: complete
---

# Phase 5 Plan 3: 发布态、npm 首发与三项对外动作 Summary

**`dsh-gsd@1.20.1-1.dsh022` 已在 npm 上成为 `dist-tags.latest`，registry 通道装出的 958 个文件与 registry 那份 tarball 逐字节相同并通过 UAT-01 的会话谓词；GitHub Release 的 tag 解引用等于 `PUBLISHED_SHA` 且 `prerelease=false`；dshmarket 的单文件 PR（#18793）逐字节一致、四检中 ①②③ 已确认 —— 顺带量到「publish 回执 → 版本可读」约 7 分钟，把「一次 404 不判红」从纪律变成了有具体时长的读数。**

## Performance

- **Duration:** 14 min（Task 1，2026-11-16T07:28Z → 07:42Z）+ 15 min（Task 2，08:40Z → 08:55Z）+ 约 40 min（本段，2026-11-25T11:57Z → 12:30Z）
- **Started:** 2026-11-16T07:28:04Z（首次 dispatch）
- **Completed:** 2026-11-25T12:30Z（本段；跨两次人回执）
- **Tasks:** 3 / 3（Task 1 发布态树 + dry-run、Task 2 裁决 + 两次 CI、Task 3 复验 + Release + PR）
- **Files modified:** 3 个 `.planning/` 文件（+ 删除 checkpoint 记录 1 个）

## Accomplishments

1. **Task 3 第 1 步：registry 复验（每条读钉权威 registry）**。先记 `npm config get registry` = `https://registry.npmmirror.com`（只读镜像，这就是每个 `--registry` 承重的理由），再读 `dist-tags.latest` = `1.20.1-1.dsh022`、`dist.tarball` 可解析、`versions = ["0.0.0-stage","1.20.1-1.dsh022"]`、`fileCount 958` / `shasum 69cc8c8a…`、`private` 键不存在、`publishConfig = {tag:'latest', registry:npmjs}`。
2. **Task 3 第 1 步（续）：registry 通道的 UAT-01 会话判据成立**。全新 `/tmp/dsh-uat-regb-6yIWc8`，`add dsh-gsd@1.20.1-1.dsh022 --registry=https://registry.npmjs.org/` → 装成 `1.20.1-1.dsh022`、profile 声明的 `dependencies`/`bundles` 都带上它、`cordis.patch.yml` 仍是 `[]`、`disabled:` 真值行 0；`--dump-config` 的 `gsd` 与 `gsd-hooks-bridge` 各 1 行；第二次 one-shot（`--profile`，不重置模板）新增恰 1 份会话记录，谓词 PASS（`assistant/message` 1、`turn/end` 1、递归无 `kind:error`），事件里含 **`hook/invoked`、`hook/result`**。
3. **装出来的字节 = 发布出去的字节**：下载 registry 上那份 tarball（4 582 650 B，sha1 = `69cc8c8a…` 与 `dist.shasum` 逐字相同，958 个成员），与 registry 通道装出的树做相对路径集合与逐文件 sha256 比对，**两侧差集都是 0 行**。这一步是必要的：pnpm 打的是 `downloaded 0`，计数器单独不足以立论。
4. **Task 3 第 2 步：Release**。`gh release create 1.20.1-1.dsh022 --target a0529ac… --title … --notes-file …`（不加 `-p`、不加 `--verify-tag`）→ https://github.com/pfmiles/dsh-gsd/releases/tag/1.20.1-1.dsh022 。`gh release view --json` 给出 `{tagName:"1.20.1-1.dsh022", isPrerelease:false, targetCommitish:"a0529ac…"}`；`git ls-remote --tags` 的解引用行 = `a0529ac…`（轻量 tag，无 `^{}` 行）；`immutable_releases` 为 `null` ⇒ D-06「Release 可删可改」的前提成立。
5. **Task 3 第 3 步：dshmarket PR**。提交前目标仓 404；fork 建出 `pfmiles/awesome-dsh-plugin`；**首选 clone 路径被网络层拒两次**（`Empty reply from server` / `Error in the HTTP2 framing layer`），改用计划写明的 `gh api` 退化路径建分支 + 提交单文件；随后**从 fork 分支把文件下载回来** `cmp` → 逐字节相同（`sha256 3a69a74a…`，402 B，`en:`/`zh:` 单引号各 1 行）；`gh pr create` → https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18793 （`changedFiles 1`、`+6/−0`）。
6. **Task 3 第 4 步：三段读数进证据册判据段 11 + `05-UAT.md` 补 PUB-01/PUB-03 两行与六条开放项**（原计划的判据段编号 10 已被 Task 2 的记录占用，故落在 11）。
7. **一条被自己判错又被救回的假绿**（见 Deviations 与 Issues）：第一次跑 registry 通道判据时第二次 one-shot 误用 `--from-default-profile`，它**重建了 profile 并把插件清掉**，而那一轮的会话谓词仍然 PASS —— 靠 `hook/invoked` 事件的有无与 `package.json` 的 `dependencies` 才识别出来，随后按用例 ③ 的 `--profile` 形态重测。

## Task Commits

1. **Task 1（`type="tracer"`）: 发布态树 + 双语 README 开销段 + CHANGELOG 追加，终点是 `npm publish --dry-run` 的 tag/registry 行** — `3287bbd` (chore)
2. **Task 1 记录（checkpoint）** — `eefbf12` (docs)
3. **Task 2 的 D-04 口径订正（先于任何推送）** — `a0529ac` (docs) ← **`PUBLISHED_SHA`**
4. **Task 2 记录：裁决 + 两次 CI + `PUBLISHED_SHA`** — `5f9b130` (docs)
5. **Task 3：本 SUMMARY（替代 checkpoint 记录）+ 判据段 11 + UAT 两行** — 本 metadata 提交（账本按协议在写本文件**之前**测得，故 `commits: 4` 与 `plan_head_after: 5f9b130` 都不含它）

`commits:` 由账本实测（`.git/gsd-plan-head-before-05-03` = `c82d844`，`git rev-list --count c82d844..5f9b130` = **4**）。`actuals.tokens` = 本段 metadata 补丁的 chars/4（`git diff --cached | wc -c` = 82 127 → 20 531），含被删除的 240 行 checkpoint 记录。

## Files Created/Modified

- `.planning/phases/05-uat-1-0/05-UAT-EVIDENCE.md` —— 新增 **判据段 11**（发布回执与传播窗口 / registry 复验 / `0.0.0-stage` / registry 通道会话判据 / 一次假绿 / 字节同一性 / Release / dshmarket PR 与四检 / 未执行的 D-08 / 边界）。
- `.planning/phases/05-uat-1-0/05-UAT.md` —— 表头证据册范围改 1–11；UAT-01 行补 registry 通道与 `hook/invoked` 证据；新增 **PUB-01**（passed）、**PUB-03**（passed，合并单列开放项）；开放项清单从 4 条改为 6 条（新增 dshmarket 合并、`0.0.0-stage` 未 deprecate；第 3 条按实际覆盖改写）。
- `.planning/phases/05-uat-1-0/05-03-CHECKPOINT.md` —— **删除**（其内容已并入本 SUMMARY；它的存在只是「未完成」的临时记号）。
- `.planning/phases/05-uat-1-0/05-03-SUMMARY.md` —— 本文件。

## Decisions Made

1. **「放行」与「发布」两段制被实际执行到了**：本段第一次 registry 读在 11:57:59Z，晚于 `published` 回执的 11:18:35Z；窗口内那 7 分钟的 404 没有被读成红，D-05 一次都没进入。计划把这条写成「本任务唯一不可逆的事实」，实测下来它确实是唯一能把「还没发」与「发了但还没传播」分开的东西。
2. **判据段落在 11 而不是计划写的 10**：10 已被 Task 2 的「D-04 裁决 + 两次 CI」占用（那段本身也是因 05-02 占用 8、dry-run 顺延 9 才落到 10）。沿用既有顺延规则，段名前缀不变。
3. **`0.0.0-stage` 按「已知事实 + 建议动作」记录，不在本计划处置**：它是 npm staged publishing 的占位（`description: "Temporary package placeholder for staged publishing"`、2 文件 / 329 B、`_npmUser pf_miles1`、11:10:24.523Z），不占 `latest`。建议的处置是 `npm deprecate`（与 D-05 同精神：不 unpublish），**需 OTP，交回给人**。
4. **dshmarket 选 `gh api` 退化路径**：首选 clone 两次被网络层拒（错误各不相同、都不是鉴权），同期 `api.github.com` 全程可用。逐字节一致的证据改成「从 fork 下载回来再 `cmp`」——比本地 `cmp` 更强，因为它验的是 GitHub 上真实落盘的那份。
5. **UAT-06 没有翻勾**：它由 05-04 一并声明，且技能 watch 段仍是 `not measured`。本计划只贡献了启动开销段的实测（Task 1）。
6. **D-08 没有执行、也没有被记成完成**：`gh auth status` 的 scope 清单原样记在判据段 11，`delete_repo` 仍在。
7. **PUB-03 的「requirement 已闭合」与「四检已通过」是两件事，分开记**：requirement 文本是「材料就绪 + PR 随首发提交」，两条都成立（PR #18793 已开、单文件、逐字节一致），故 `requirements-completed` 含 PUB-03；计划的 D-09 判据里「四检通过」的第 ④ 项（目标仓 `PR check` run 45612678334 的最后一步 `Build`）在收官时仍 `in_progress`，故 `05-UAT.md` 的 PUB-03 行取 **`open item`**（SUMMARY 的 coverage D5 也标 `human_judgment: true` / `status: unknown`）。不把「还没出终态」写成绿。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 判据段编号冲突：计划写 10，10 已被 Task 2 占用**
- **Found during:** Task 3 第 4 步（写证据册）
- **Issue:** `05-03-PLAN.md` Task 3 的 action 第 4 步与 acceptance 都写「判据段 10」，但判据段 10 已由 Task 2 的记录（D-04 裁决 + 两次 CI）落盘。
- **Fix:** 新段落写作 `## 判据段 11 — 发布后复验：…（计划编号 10；因 05-02 占用 8、dry-run 顺延 9、Task 2 占 10，本段落在 11）`，段名前缀与引用格式不变。
- **Files modified:** `05-UAT-EVIDENCE.md`
- **Verification:** `grep -n '^## 判据段'` → 1..11 连续、无重复。

**2. [Rule 1 - Bug] 我自己第一版的会话判据仪器是错的（假绿）**
- **Found during:** Task 3 第 1 步（registry 通道判据）
- **Issue:** 第二次 one-shot 写成了 `dsh regchan --from-default-profile headless …`。`--from-default-profile` 是**造 profile 的入口**，对已存在的 profile 再传一次会按模板重建它：实测该 profile 的 `package.json` 回到 `dependencies: {}`、`bundles` 只剩 `base`+`headless`、`node_modules/` 整个消失。**而那一轮的会话谓词仍然 PASS**（`assistant/message` 1、`turn/end` 1、无 `kind:error`）—— 正是本证据册从判据段 1 起就在警告的假绿通道。
- **Fix:** 第二次 one-shot 改用 `--profile regchan2`（不带 `--from-default-profile`），与 `tests/uat-harness.test.mjs` 用例 ③ 的 `run2` 同形；并加两条可区分信号：装后状态（`dependencies`/`bundles`/`node_modules`）与事件里 **`hook/invoked`、`hook/result`** 是否存在。假绿那一轮的任何读数都未计入判据。
- **Files modified:** `/tmp/dsh-uat-registry/driver2.mjs`（判据脚本，不进仓）
- **Verification:** 假绿轮事件类型**无** hook 事件；修正轮**有** `hook/invoked`、`hook/result`，且 `node_modules` 在轮后仍在盘。判据段 11 的「一次被我自己判错的假绿」小节留档。
- **Impact:** 没有放宽判据 —— 它把一条本来会写进证据册的假绿换成了真读数。

**3. [Rule 3 - Blocking] `git ls-remote` 被 `github.com` 的网络层连续拒，需传输层开关 + 重试**
- **Found during:** Task 3 第 2 步（tag 解引用）
- **Issue:** 12:06–12:13Z 之间 `Error in the HTTP2 framing layer`、`Failed to connect to github.com port 443 after 75015 ms`（连续 3 次，每次 75 s）、`Empty reply from server`；同期 `api.github.com` 正常。
- **Fix:** `git ls-remote` 加 `-c http.version=HTTP/1.1`（**命令内容一字未改，只多传输层开关**）并重试；第 4 次成功。API 侧先用 `gh api …/git/ref/tags/…` 取了交叉印证读数。
- **Files modified:** 无
- **Verification:** 第 4 次输出 `a0529ac…	refs/tags/1.20.1-1.dsh022`；API 侧 `object.type = commit`、`sha = a0529ac…`。

**4. [Rule 3 - Blocking] dshmarket 的首选 clone 路径被网络层拒 → 走计划写明的 `gh api` 退化路径**
- **Found during:** Task 3 第 3 步
- **Issue:** `git clone https://github.com/pfmiles/awesome-dsh-plugin.git` 两次失败（`Empty reply from server` 12:16:03→12:17:36Z；`Error in the HTTP2 framing layer` 12:17:42→12:19:02Z），两次都 `rc=128`，都不是鉴权问题。
- **Fix:** 用 `POST git/refs` 建分支 + `PUT contents` 落单文件 + `gh pr create`；随后从 fork 分支下载该文件做 `cmp`。
- **Files modified:** 目标仓 fork 的 `refs/heads/add-pfmiles-dsh-gsd`（commit `aa1af6f8…`）
- **Verification:** `cmp` 无输出、两侧 sha256 相同、PR `changedFiles 1`。
- **Impact:** 判据不变强也不变弱：逐字节一致由「下载回来再比」证明。

**5. [Rule 3 - Blocking] `gh repo fork --remote=false` 与仓参数互斥**
- **Found during:** Task 3 第 3 步
- **Issue:** `the --remote flag is unsupported when a repository argument is provided`（`fork_rc=1`）。
- **Fix:** 去掉 `--remote=false`，重跑 `gh repo fork … --clone=false` → 成功。
- **Files modified:** 无

---

**Total deviations:** 5 documented（Rule 1 × 2、Rule 3 × 3；其中偏离 2 是本段最重要的一条 —— 它是一条被自己判错又被救回的假绿）。
**Impact on plan:** 没有一条放宽判据。偏离 1 防的是覆盖既有证据；偏离 2 把一条本会写进证据册的假绿换成真读数；偏离 3/4/5 是网络层与 CLI 参数的现实摩擦，判据与证据强度都未变化。

## Issues Encountered

1. **pnpm 的 `downloaded 0`**：registry 通道安装时 pnpm 打的是 `resolved 6, reused 6, downloaded 0`。这意味着「载荷可能来自 store 而不是这次的新下载」。处置不是降低要求，而是改证据形态：下载 registry 上那份 tarball（sha1 与 `dist.shasum` 相同）再与装出的树逐文件比 —— 差集 0 行。**教训**：包管理器的计数器是「它做了什么」，不是「盘上是什么」。
2. **`git ls-remote` 曾连续失败 3 次**：第一条读数（12:09:5xZ，API 侧）比 `git ls-remote` 成功（12:13:54Z）早约 4 分钟。两条读数一致，但**不能把 API 读数当成 `git ls-remote` 的替代**：判据要求的形态是后者，前者只是过渡期的交叉印证。
3. **`05-03-CHECKPOINT.md` 的临时形态**：上一段之所以不写 `05-03-SUMMARY.md`，是因为本构建的 `extractFrontmatter` 对任何 SUMMARY 都返回 0 个键（`status` 读不出来），一个 `status: halted` 的 SUMMARY 会被 `init.execute-phase` 计为「已总结」并把 05-04 提前成下一个计划。本段完成后该理由消失，故改名落成 SUMMARY 并删除 checkpoint 文件。

## Authentication Gates

- **`npm publish`（人类执行，Task 3 前置）**：本机 `npm whoami` = `ENEEDAUTH`，需要人类账号的 2FA/OTP。人已执行并回 `published` + `+ dsh-gsd@1.20.1-1.dsh022` + UTC `2026-11-25T11:18:35.005Z`。agent 全程未 login / 未 publish / 未 `--force`。
- **`gh auth refresh --remove-scopes delete_repo`（D-08，未执行）**：需要一次交互式浏览器 re-auth，本 dispatch 的边界是 Task 3 第 1–4 步。`gh auth status` 原样 scope 清单记在判据段 11（`delete_repo` 仍在），并按计划要求**没有**把它记成已完成。

## User Setup Required

见 `05-03-PLAN.md` 的 `user_setup`（npm 2FA/OTP 与发布权限）。本段无新增 setup：

- `npm publish` 已完成（人执行）。
- 剩余两项需人工/交互，均已在 `05-UAT.md` 开放项 5/6 登记：dshmarket 的合并（D-09，不阻塞）、`0.0.0-stage` 的 `npm deprecate`（需 OTP）。

## Next Phase Readiness

**05-04 可以开始**：npm 首发已发生、Release 已建、dshmarket PR 已开。05-04 的三件事（3091 刷新 → 真实 `~/.dsh` 迁移 → 旧仓推送）都排在发布之后，现在前置条件成立。

### 明确未做的事（不得被读成已完成）

| 项 | 状态 | 依据 |
| -- | ---- | ---- |
| **Task 3 第 5 步：D-08 的 `gh auth refresh --remove-scopes delete_repo`** | **未执行** | 需要交互式浏览器 re-auth，由编排层单独交回给人；`gh auth status` 原样清单（含 `delete_repo`）在判据段 11 |
| **`npm deprecate dsh-gsd@0.0.0-stage`** | **未执行** | 需 OTP；建议命令与理由写在判据段 11 与 `05-UAT.md` 开放项 6 |
| **`npm unpublish` / `npm publish --force`** | **从未执行** | D-05 的禁令；本 phase 全部命令历史可核 |
| **dshmarket 合并** | **未等待** | D-09：完成判据 = PR 已开 + 四检通过，合并不阻塞 |
| **UAT-06 的勾选** | **保持未勾** | 由 05-04 一并声明；技能 watch 仍 `not measured` |
| **四检的 ④** | **收官时仍 `pending`** | 目标仓 `PR check` 的最后一步 `Build` 尚在运行；①②③ 已直读确认 |

### 需要人接手的两件事

1. `npm deprecate dsh-gsd@0.0.0-stage "<reason>" --registry https://registry.npmjs.org/`（D-05 同精神：不 unpublish）。
2. `gh auth refresh --remove-scopes delete_repo`（D-08；会开一次浏览器）。

---

## Self-Check: PASSED

- 文件存在：`05-03-SUMMARY.md` FOUND；`05-03-CHECKPOINT.md` **已删除**（`ls` 无此项，其内容并入本文件）
- 提交可达：`3287bbd` / `eefbf12` / `a0529ac` / `5f9b130` 均在 `HEAD` 的祖先里
- 判据段编号连续：`grep -n '^## 判据段'` → 1..11，无重复
- `05-UAT.md`：PUB-01 / PUB-03 两行在场且结论为 `passed`；开放项 6 条；UAT-06 仍未勾
- registry：`dist-tags.latest = 1.20.1-1.dsh022`（带 `--registry`）；装出的 958 文件与 tarball 逐字节相同
- Release：`isPrerelease=false`、`tagName` 逐字、tag 解引用 = `PUBLISHED_SHA`
- PR：`changedFiles 1`、`cmp` 一致、四检状态逐条记录
- 未做的动作（本段）：无 `npm publish` / 无 `npm unpublish` / 无 `--force` / 无 `gh auth refresh`

---
*Phase: 05-uat-1-0*
*Completed: 2026-11-25*