---
phase: 03-github-npm-dshmarket
plan: 03
subsystem: release / CI-first-run / push-gate
tags: [github-actions, first-ci-run, https-push, oauth-workflow-scope, osxkeychain, credential-helper, probe-repo, compat-matrix, four-cell-probe, actionlint, serial-discipline, blocking-human, checkpoint, sc-5]

# Dependency graph
requires:
  - phase: 03-github-npm-dshmarket
    provides: peer 冻结 exact 0.2.2-rc.1（manifest + pins）、workflow permissions 与 install-ok 格门控正向断言、tests/pack-contents.test.mjs 纳管（03-01）
  - phase: 03-github-npm-dshmarket
    provides: npm 元数据 / README 徽章 / CHANGELOG / dshmarket 材料 + ⑧⑨⑩ 断言，全量 32/32 写入 BUILD.md:16（03-02）
provides:
  - 首次 push 落地：`d3c8e89..20e20c0 main -> main`，远端 main 与本地 HEAD 同为 `20e20c0`，`.github/workflows/compat-matrix.yml` 首次出现在 origin/main
  - CI 史上第一次 run：`43218878911`（event=push, run_attempt=1）conclusion=**success**，4 格 × 6 步全绿；真实仓 `total_count` 0 → **1**（无红跑历史）
  - 首跑前证据册（Task 1 六项）：四格本地等价 4/4、三档 GSD 构建、actionlint 零 finding、全量套件 32/32、工作树/远端 zero-state、待推提交数
  - 推送通道的现实结论：SSH 在本机不可用（key 非账号有效 key）；实际通道 = HTTPS + `gh` credential helper 覆盖；`origin` 保持 SSH 未改写（仍不可用）
  - 探针仓干跑（用户裁决的去风险步骤）：`pfmiles/dsh-gsd-ci-probe` 上同一 SHA 先跑绿，仓随后删除
affects: ["Phase 5 UAT-01", "Phase 5 npm publish / GitHub Release / dshmarket PR", "后续任何需要从本仓推送或读 origin/main 的操作"]

# Actuals (#2632) — pairs with the plan's estimate (plan estimate: 26000 tokens / 3 tasks)
actuals:
  tokens: 8346
  tasks: 3
  commits: 1

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "每格独立一次性副本（mktemp -d + rsync 排除 .git/node_modules/*.tgz），跑完即删：四格互不污染，仓根零残留"
    - "CI 命令逐字同源复跑：npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<v> → node build/lib/compat-probe.mjs --dsh <v> --expect <expect>，不使用 --force / --legacy-peer-deps"
    - "三档构建以默认档收尾（GSD_VERSION=1.20.1 → 1.19.0 → 默认）：构建树必须回到仓的 1.20.1 形态"
    - "不可逆推送前先在一次性私仓干跑同一 SHA（用户裁决的去风险步骤），绿后再推真仓"
    - "HTTPS 推送绕过 stale keychain：`git -c credential.helper= -c credential.helper='!gh auth git-credential' push <url> main`"

key-files:
  created:
    - .planning/phases/03-github-npm-dshmarket/03-03-SUMMARY.md
  modified: []

key-decisions:
  - "Task 1 按 must_haves 的「四格」口径执行：四条矩阵行各用独立的一次性副本跑一遍（而非 plan <verify> 里两格的最小回路），四格 4/4 全绿"
  - "构建轴与 probe 判定相互独立被实测确认：GSD 轴（1.20.1/1.19.0）不改变 install/probe 结果，四格只有两种 (dsh, expect) 组合"
  - "reject 格实测 root skill-filesystem = 0.2.2-rc.1（exact peer 占位）≠ matrix.dsh 0.2.1-rc.5 —— 这是 D-08 门控断言必须存在的机器证据（无条件断言会让首跑即红）"
  - "人类在 Task 2 裁决：先在一个临时仓库干跑一次，绿了再推（推荐项 push-now 的前置去风险步骤，不在原计划内）"
  - "SSH 不可用 ⇒ 改走 HTTPS，但 **origin 不改写**（仍是 git@github.com:pfmiles/dsh-gsd.git），每次推送显式给 HTTPS URL + gh credential helper；代价是 origin/main 远端跟踪 ref 不会自动更新"
  - "真实仓只推一次（d3c8e89..20e20c0）、只产生一条 run（run_attempt=1、total_count=1）；探针仓的 run 与仓随后一并删除，不污染真仓历史"

patterns-established:
  - "首跑前置证据册的六格结构：四格 / 三档构建 / actionlint / 全量套件 / 工作树+远端 zero-state / 待推提交数"
  - "不可逆对外动作的「临时代码仓干跑」去风险：同一 SHA → 私仓 → 观测 conclusion → 删仓"
  - "推送凭据的三层现实：SSH key 是否账号有效、OAuth token 是否有 workflow scope、git 的 credential helper 是否把旧 token 顶在前面 —— 三者任一不通都会以同一条 workflow scope 文案失败"

requirements-completed: [PUB-01]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "四格本地等价全绿：dsh 0.2.2-rc.1 两格 install-ok、dsh 0.2.1-rc.5 两格 reject，每条路径在独立一次性副本里按 CI 同款两行命令跑，全部 exit 0"
    requirement: "PUB-01"
    verification:
      - kind: integration
        ref: "cell 1 dsh=0.2.2-rc.1 gsd=1.20.1 expect=install-ok → added 656 packages / resolved 0.2.2-rc.1 / 'compat-probe: install-ok confirmed' / exit 0"
        status: pass
      - kind: integration
        ref: "cell 2 dsh=0.2.2-rc.1 gsd=1.19.0 expect=install-ok → added 656 packages / resolved 0.2.2-rc.1 / install-ok confirmed / exit 0"
        status: pass
      - kind: integration
        ref: "cell 3 dsh=0.2.1-rc.5 gsd=1.20.1 expect=reject → added 601 packages / '{\"engines.dsh\":\">=0.2.2-rc.1 <0.3.0-0\"}' + 'compat-probe: reject confirmed' / exit 0"
        status: pass
      - kind: integration
        ref: "cell 4 dsh=0.2.1-rc.5 gsd=1.19.0 expect=reject → added 601 packages / reject confirmed / exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "两档 GSD 轴串行构建 + 默认 1.20.1 收尾：三条均 exit 0 且 gates 全过，收尾输出含 copied 76 trees，构建树回到 gsd-core/VERSION=1.20.1"
    verification:
      - kind: integration
        ref: "GSD_VERSION=1.20.1 node build.mjs → exit 0 / gates: all passed (A/B/C) / copied 76 trees / 286 files / 72 skills"
        status: pass
      - kind: integration
        ref: "GSD_VERSION=1.19.0 node build.mjs → exit 0 / gates: all passed (A/B/C) / copied 76 trees"
        status: pass
      - kind: integration
        ref: "node build.mjs（默认）→ exit 0 / gates: all passed (A/B/C) / copied 76 trees；gsd-core/VERSION=1.20.1"
        status: pass
    human_judgment: false
  - id: D3
    description: "workflow 静态合法：actionlint 1.7.12 对 .github/workflows/compat-matrix.yml exit 0 且零输出（非 ACTIONLINT_UNAVAILABLE）"
    verification:
      - kind: unit
        ref: "actionlint（仓根，自动发现唯一 workflow）→ exit 0，output=<empty>；actionlint .github/workflows/compat-matrix.yml → exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "全量套件串行单次 32/32（fail 0 / cancelled 0），N 与 BUILD.md:16 的 32/32 机器等值"
    verification:
      - kind: unit
        ref: "node --test tests/*.test.mjs → ℹ tests 32 / ℹ pass 32 / ℹ fail 0 / ℹ cancelled 0；grep -qF '预期 32/32' BUILD.md → 'pre-push suite 32/32'"
        status: pass
    human_judgment: false
  - id: D5
    description: "push 前工作树与远端 zero-state：除本 SUMMARY 外无未提交改动、无 tracked *.tgz、origin 为 SSH 且 basename == 包名、远端 total_count 仍为 0"
    requirement: "PUB-01"
    verification:
      - kind: integration
        ref: "git status --porcelain -- . ':(exclude)…03-03-SUMMARY.md' → 0 行；git ls-files '*.tgz' → 空；git remote get-url origin → git@github.com:pfmiles/dsh-gsd.git；basename == dsh-gsd；gh api …/actions/runs --jq .total_count → 0"
        status: pass
      - kind: integration
        ref: "git rev-list --count origin/main..HEAD → 105（证据时刻）/ 106（提交证据册后）；HEAD c82f55e→20e20c0；origin/main d3c8e89；origin/main 的 .github/workflows 文件数 = 0"
        status: pass
    human_judgment: false
  - id: D6
    description: "首次 push 落地 + CI 首跑全绿（conclusion=success）且真实仓 total_count==1 —— SC-5「首跑即绿、不留红跑历史」"
    requirement: "PUB-01"
    verification:
      - kind: e2e
        ref: "git push（HTTPS + gh credential helper）→ 'd3c8e89..20e20c0  main -> main' exit 0；gh run list --workflow=compat-matrix.yml --limit 1 --json … → databaseId 43218878911 / event push / conclusion success / headSha 20e20c0"
        status: pass
      - kind: e2e
        ref: "gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count' → 1（推送前 0）；4/4 job conclusion=success（reject 2 格 41s/42s，install-ok 2 格 51s/60s）"
        status: pass
      - kind: e2e
        ref: "gh api repos/pfmiles/dsh-gsd/commits/main --jq '.sha' → 20e20c0… == git rev-parse HEAD；远端 contents API 命中 .github/workflows/compat-matrix.yml"
        status: pass
    human_judgment: false
  - id: D7
    description: "探针仓干跑（用户裁决的去风险步骤）：同一 SHA 在 pfmiles/dsh-gsd-ci-probe 先跑绿，随后删仓"
    verification:
      - kind: e2e
        ref: "probe run 43218482632 → conclusion success / 4 格 success / 1m36s；probe repo total_count=1；`gh repo delete … --yes` exit 0；随后 `gh api repos/pfmiles/dsh-gsd-ci-probe` → 404"
        status: pass
    human_judgment: false

# Metrics
duration: 9min (Task 1) + ~67min out-of-band (Task 2/3)
completed: 2026-11-12
status: complete
---

# Phase 3 Plan 3: 首次 push 与 CI 首绿 Summary

> ## ✅ COMPLETED — Task 2 裁决已执行，首次 push 与首跑均已完成
>
> 人类在 blocking-human checkpoint 裁决：**「先在一个临时仓库干跑一次，绿了再推」**（即推荐项 `push-now` 的去风险前置）。
> 探针仓 `pfmiles/dsh-gsd-ci-probe` 上同一 SHA 跑绿 → 真仓推送 `d3c8e89..20e20c0` → 首跑 **`43218878911` / `conclusion=success` / `total_count=1`**，全程无第二次推送、无 rerun。
> **通道现实**：SSH 在本机不可用（key 非 `pfmiles` 账号有效 key）；实际推送走 **HTTPS + `gh` credential helper 覆盖**，`origin` **未改写**（仍是 SSH，仍不可用）。

**四格本地等价 4/4 全绿（656 / 601 包解析树各自匹配 expect）、三档 GSD 构建含默认 1.20.1 收尾、actionlint 零 finding、全量套件串行 32/32 与 BUILD.md:16 等值、远端 `total_count` 0 → 1 —— 首次 push 把 106 个提交与 workflow 推上 `origin/main`，Actions 史上第一次 run `43218878911` 四格 × 六步全绿，且它同时是**唯一**一条运行历史（无红跑历史，SC-5 成立）。**

## Performance

- **Duration:** 9 min（Task 1 证据合练）+ ~67 min（Task 2/3 线下：人类裁决、SSH 排障、token scope、探针仓干跑、真推与观测）
- **Started:** 2026-11-12T11:18:07Z
- **Completed:** 2026-11-12（首跑完成 12:33:53Z；其后为 SUMMARY/STATE/ROADMAP/REQUIREMENTS 收口）
- **Tasks:** 3 / 3
- **Files modified:** 1 个计划交付物（本 SUMMARY）+ 3 个规划元数据（STATE / ROADMAP / REQUIREMENTS）；产品面 **0** 改动（`files_modified: []`）

## Accomplishments

### Task 1 — push 前证据合练（六项，全部当场复跑、严格串行）

**① 四格本地等价 — 4/4 exit 0**（四条矩阵行各用一个 `mktemp -d` 独立副本，CI 同款两行命令，副本跑完即删）

| # | matrix.dsh | matrix.gsd | expect | npm install | 根解析 skill-filesystem | probe stdout | exit |
|---|---|---|---|---|---|---|---|
| 1 | 0.2.2-rc.1 | 1.20.1 | install-ok | `added 656 packages in 1m` | `0.2.2-rc.1` | `compat-probe: install-ok confirmed (dsh 0.2.2-rc.1 satisfies engines.dsh >=0.2.2-rc.1 <0.3.0-0)` | 0 |
| 2 | 0.2.2-rc.1 | 1.19.0 | install-ok | `added 656 packages in 58s` | `0.2.2-rc.1` | `compat-probe: install-ok confirmed (…)` | 0 |
| 3 | 0.2.1-rc.5 | 1.20.1 | reject | `added 601 packages in 26s` | `0.2.2-rc.1` | `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}` + `compat-probe: reject confirmed` | 0 |
| 4 | 0.2.1-rc.5 | 1.19.0 | reject | `added 601 packages in 28s` | `0.2.2-rc.1` | `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}` + `compat-probe: reject confirmed` | 0 |

- 四格合计 `4/4 exit 0`，每格各自打印 `cell ok: dsh=… gsd=… expect=…`。
- **对 D-08 有直接意义的机器证据**：reject 两格的根 `@deepseek-ai/dsh-skill-filesystem` 实测解析为 **0.2.2-rc.1**（manifest exact peer 占位），而 `matrix.dsh` 是 **0.2.1-rc.5**。所以 workflow 里「解析结果 == matrix.dsh」的正向断言**必须**被 `expect == install-ok` 门控 —— 无条件断言会让首跑在 reject 格 `exit 2`。这是实测反证，不是设计口味。
- 副本清理后仓根：`node_modules` 无、`package-lock.json` 无、`*.tgz` 无。

**② 两档 GSD 轴 + 默认收尾（严格串行）**

| # | 命令 | exit | 耗时 | 关键输出 |
|---|---|---|---|---|
| 1 | `GSD_VERSION=1.20.1 node build.mjs` | 0 | 15s | `gates: all passed (A/B/C)`；`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)` |
| 2 | `GSD_VERSION=1.19.0 node build.mjs` | 0 | 11s | `gates: all passed (A/B/C)`；`fetched @opengsd/gsd-core@1.19.0, copied 76 trees, …` |
| 3 | `node build.mjs`（默认 1.20.1 **收尾**） | 0 | 15s | `gates: all passed (A/B/C)`；`copied 76 trees`；`gsd-core/VERSION = 1.20.1` |

**③ actionlint（推前最后一道静态校验）**

```
actionlint                                      → exit 0, output=<empty>
actionlint .github/workflows/compat-matrix.yml  → exit 0
```

`actionlint` 1.7.12 在 `/opt/homebrew/bin/actionlint`（可用，故不适用 `ACTIONLINT_UNAVAILABLE`）。workflow 内容与 03-01 交付时逐字一致，本计划零改动。

**④ 全量套件（一次、单进程、串行）**

```
node --test tests/*.test.mjs
ℹ tests 32   ℹ suites 0   ℹ pass 32   ℹ fail 0   ℹ cancelled 0   ℹ skipped 0   ℹ todo 0
ℹ duration_ms 18093.6845
```

exit 0（19s）；`BUILD.md:16` = `预期 32/32` → `pre-push suite 32/32`。**N 与文档计数机器等值，未做算术推导。**

**⑤ 工作树与远端 zero-state**

| 断言 | 命令 | 实测 |
|---|---|---|
| 工作树干净（**只**排除本 SUMMARY） | `git status --porcelain -- . ':(exclude)…03-03-SUMMARY.md'` | 0 行 |
| 无 tracked tarball | `git ls-files '*.tgz'` | 空 |
| origin 是 SSH | `git remote get-url origin` | `git@github.com:pfmiles/dsh-gsd.git` |
| repo 名 == npm 包名 | `basename "$(git remote get-url origin)" .git` vs `package.json.name` | `dsh-gsd` == `dsh-gsd` |
| 远端尚未激活过 CI | `gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count'` | `0` |
| 仓根零安装残留 | `ls node_modules / package-lock.json /*.tgz` | 三者皆 none |

`zero-state gate: PASS`（plan `<verify>` #5 原样执行）。

**⑥ 待推提交数（当场观测，不硬编码）**

```
git rev-list --count origin/main..HEAD → 105（证据时刻；提交本证据册后 106）
HEAD = c82f55e（证据时刻）→ 20e20c0（推送的那个提交）
origin/main = d3c8e89（推送前）
origin/main 的 .github/workflows 文件数 = 0   ← 本次 push 是远端首次具备 workflow
```

### Task 2 — 人类裁决（已解决）

**问题**：是否现在把 `main` 推送到 `origin`，让 GitHub Actions 首次激活？
**背景**：远端 `total_count = 0` 且无 workflow，这次 push 就是史上第一次 run，会在公开仓永久留下 CI 运行历史；成文判据 = 「首跑即绿、不留红跑历史」（D-03 / SC-5）。

三项待选（计划原文）：

| 选项 | 结论 |
|---|---|
| `push-now-ssh`（计划推荐） | **被采纳为方向**，但加了去风险前置：先在临时私仓干跑 |
| `defer-push` | 未采纳（会放弃本 phase SC-5） |
| `push-https-token` | 未采纳（SSH 仍优先；实际最后改走 HTTPS 是因为 SSH 实测不可用，且 scope 由人类显式授权） |

**人类最终裁决原文：** 「先在一个临时仓库干跑一次，绿了再推（推荐）」

**执行中发现的三层阻塞（全部由 orchestrator 线下排障，本 SUMMARY 记录）：**

1. **SSH 不可用 —— 推翻 Shared Pattern 9 的前提。** `ssh -T git@github.com` 客户端提供 `~/.ssh/id_rsa`（`SHA256:X6AR4nBc25fFimCyDkupo1ajyo8y+0PtaKkvRgUJMjY`, miles.wy.1@gmail.com），GitHub 先答 `Server accepts key`，随后 `Permission denied (publickey)`；`git ls-remote git@github.com:pfmiles/dsh-gsd.git HEAD` → exit 128 同错误。`PubkeyAcceptedAlgorithms` 试 `rsa-sha2-512` / `rsa-sha2-256` / `+ssh-rsa` 均失败 ⇒ 该 key 不是 `pfmiles` 账号的有效 key（不是算法协商问题）。`~/.ssh/config` 仅 `Host * / ServerAliveInterval 240`；agent 无 identities，`IdentitiesOnly=yes -i ~/.ssh/id_rsa` 无差别。
2. **HTTPS 缺 `workflow` scope。** 初始 `gh auth status` = `'gist', 'read:org', 'repo'`；首个 HTTPS 探针被拒：`refusing to allow an OAuth App to create or update workflow '.github/workflows/compat-matrix.yml' without 'workflow' scope`。人类执行 `gh auth refresh -h github.com -s workflow -s delete_repo`；现 scope = `'delete_repo', 'gist', 'read:org', 'repo', 'workflow'`（本次收口已复核）。
3. **git 的 keychain 凭据是旧的。** refresh 之后普通 `git push https://…` 仍报同一条 workflow scope 错 —— `credential.helper=osxkeychain` 把旧 token 顶在前面，而不是 gh 的新 token。成功形态：`git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/pfmiles/dsh-gsd.git main`（两次推送都用它）。

**探针仓干跑（用户要求的去风险步骤，不在原计划内）：**

- 新建**私有**仓 `pfmiles/dsh-gsd-ci-probe`，用同一 SHA 走同一 HTTPS 通道推送。
- run `43218482632`，event push，`conclusion: success`，4 格全 success，1m36s；探针仓 `total_count = 1`。
- 观测完成后删仓：`gh repo delete … --yes` exit 0；随后 `gh api repos/pfmiles/dsh-gsd-ci-probe` → **404**（本次收口复核）。

### Task 3 — 推送与首跑观测（已执行）

**推送前一刻的前置复核（全部通过）：** 真仓 `total_count = 0`、工作树干净、`HEAD = 20e20c0283f764864474b7d6a2dfd48f22a0c6b9`、`origin/main = d3c8e89e300b32f30caa7e4a7bc71a6cf29e479c`、origin URL 未变。

**推送：**

```
git -c credential.helper= -c credential.helper='!gh auth git-credential' \
  push https://github.com/pfmiles/dsh-gsd.git main
# → d3c8e89..20e20c0  main -> main   (exit 0)
```

**首跑（唯一一条 run）：**

| 字段 | 值 |
|---|---|
| `databaseId` | **43218878911** |
| `name` / `display_title` | `compat-matrix` / `docs(03-03): add 03-03-SUMMARY.md（…）` |
| `event` | `push` |
| `head_sha` | `20e20c0283f764864474b7d6a2dfd48f22a0c6b9`（== 本地 HEAD） |
| `status` / `conclusion` | `completed` / **`success`** |
| `run_attempt` | **1**（无 rerun） |
| `created_at` → `updated_at` | `2026-11-12T12:32:49Z` → `2026-11-12T12:33:53Z`（总时长约 64s 墙钟） |
| `html_url` | https://github.com/pfmiles/dsh-gsd/actions/runs/43218878911 |
| 真实仓 `total_count` | **推送前 0 → 推送后 1** |

**四格矩阵结论（各 job 独立跑，全部 success）：**

| matrix cell | started → completed | 用时 | conclusion |
|---|---|---|---|
| (0.2.2-rc.1, 1.20.1, install-ok) | 12:32:52 → 12:33:43 | 51s | success |
| (0.2.2-rc.1, 1.19.0, install-ok) | 12:32:52 → 12:33:52 | 60s | success |
| (0.2.1-rc.5, 1.20.1, reject) | 12:32:52 → 12:33:33 | 41s | success |
| (0.2.1-rc.5, 1.19.0, reject) | 12:32:51 → 12:33:33 | 42s | success |

**远端形态复核（本次收口用只读 API 复核，因 SSH 不可用无法 `git fetch origin`）：**

- `gh api repos/pfmiles/dsh-gsd/commits/main --jq '.sha'` → `20e20c0…` **== 本地 HEAD**。
- 远端含 `.github/workflows/compat-matrix.yml`（`contents` API 命中，blob sha `2ade830…`）—— 远端首次具备 workflow。
- `total_count == 1` 且唯一那条 run 是绿的 ⇒ **无红跑历史**（SC-5 成立）。
- **注意**：本地 `refs/remotes/origin/main` 仍是 `d3c8e89`（未更新），因为推送走的是显式 HTTPS URL 而非 `origin` remote；`git rev-list` 的计数因此仍显示 106（远端跟踪 sha 已过期）。**权威远端 sha 以 `gh api` 的 commits/main 为准**，不要把这个计数当成「未推送」。

## Phase 5 移交清单（Task 3 步骤 7 要求，不得省略）

1. **`EPRIVATE`** —— 真发布前必须删 `package.json` 的 `private: true`，并同步改 `tests/docs-consistency.test.mjs` ⑥ 的 message（已在 03-02 改为「Phase 5」）与断言（当前仍硬断 `private === true`）。
2. **prerelease 必须显式 `--tag`**（或 `publishConfig.tag`），且 `dist-tags.latest` 必须指向首发版本 —— 否则市场卡片的裸名命令 `dsh plugin --profile web add dsh-gsd` 会 `No matching version found`。
3. **抢注窗口移交义务** —— 发布前重跑 `npm view dsh-gsd version --registry=https://registry.npmjs.org`，仍 404 才继续；若已被占用，升级为用户决策（改名 vs 等待），不得擅自继续。
4. **peer 抬升义务** —— `0.2.2-rc.2` 转正或 `0.2.2` 正式发布时，必须随新版本号同步抬 `peerDependencies['@deepseek-ai/dsh-skill-filesystem']`（exact 同样排除正式版），与 CHANGELOG 的维护义务同一件事。
5. **GitHub Release** —— tag 名 = `1.20.1-1.dsh022`（无 `v` 前缀，与 CHANGELOG 发布约定一致）、正文直接取 CHANGELOG 对应条目、在 `npm publish` 成功**之后**创建。

**禁令式移交：** 不得用 `npm publish --dry-run` 充当「可发布」判据 —— `private: true` 下它照样通过，真发布才会抛 `EPRIVATE`。

**新的前向事实（来自本次 run 的 annotation）：** GitHub 在 reject 两格提示 `The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026`。不是失败，但矩阵的下限绑在 `ubuntu-latest` 上 —— 迁移窗口前应复核 Node 24 / npm 行为，必要时钉 `ubuntu-24.04`。

## Task Commits

| 任务 | 提交 | 类型 |
|---|---|---|
| Task 1: push 前证据合练（六项） | 无产品提交（`files_modified: []`）；证据写入本 SUMMARY | — |
| Task 2: 推送通道与时机裁决（blocking-human） | 无提交（人类裁决，记录于本文件） | — |
| Task 3: 首次推送与首跑观测 | 推送 `d3c8e89..20e20c0`（推送的是 Task 1 的 `20e20c0` 证据册提交）；无新增产品提交 | — |

**计划元数据：** `20e20c0`（Task 1 证据册，即被推送的 HEAD）→ `docs(03-03): complete … plan`（本次收口提交，含 SUMMARY + STATE + ROADMAP + REQUIREMENTS）。

## Files Created/Modified

- `.planning/phases/03-github-npm-dshmarket/03-03-SUMMARY.md` — 首跑证据册（四格 / 三档构建 / actionlint / 32/32 / zero-state / run 事实 / 通道阻塞 / Phase 5 移交）
- `.planning/STATE.md` — 3/3 计划完成、`completed_plans: 9`、`stopped_at` 03-03、新增 [Phase 03] 四类裁决（SSH / workflow scope / keychain / 探针干跑）
- `.planning/ROADMAP.md` — Phase 3 `3/3 plans executed`、03-03 打勾
- `.planning/REQUIREMENTS.md` — `PUB-01` 关闭（推送落地 + 首跑绿）
- 产品面零改动：`package.json` / workflow / tests / docs 一行未动

## Decisions Made

- **四格按 must_haves 口径跑满四条矩阵行**：`plan <verify>` 的最小回路只覆盖两种 `(dsh, expect)` 组合，而 `must_haves.truths` 要求「四格」。四格各用独立副本，成本约 3 分钟，换来「矩阵行全覆盖」的无可争议证据。
- **GSD 轴与 probe 判定解耦被实测确认**：1.20.1 / 1.19.0 对 install/probe 无影响（四格只出现 656 与 601 两种包数）。
- **构建顺序 = 1.20.1 → 1.19.0 → 默认 1.20.1**：收尾档额外断言 `copied 76 trees` 与 `gsd-core/VERSION=1.20.1`。
- **先干跑再推真仓**：人类裁决把「去风险」具体化为「临时私仓跑同一 SHA」。它以一次可删除的 run 换掉了「真仓首跑可能变红」的不可逆风险；探针仓随后删除，不留在任何公开历史上。
- **origin 不改写**：把 broken SSH 远端保留下来（而不是换成 HTTPS + token），避免把凭据通道固化进 `.git/config`；代价是每次推送要显式给 URL + credential helper，且 `origin/main` 跟踪 ref 不再自动更新。
- **只推一次、只看一条 run**：`run_attempt == 1` 与 `total_count == 1` 是「无红跑历史」的机器证据；全程未 rerun、未重推。
- **零状态断言用单路径白名单排除**：`:(exclude)` 只排除本 SUMMARY 这一个路径，不是 `.planning/` 通配 —— 其余任何未提交内容照旧会打红。

## Deviations from Plan

### 推送通道上的偏离（first-class，改变执行路径）

1. **[Rule 3 - Blocking] Shared Pattern 9 的前提被推翻：SSH 推送在本机不可用**
   - **Found during:** Task 2/3（人类裁决后执行推送时）
   - **Issue:** 计划与 03-PATTERNS Shared Pattern 9 都断言「origin 是 SSH，故不受 workflow scope 限制」。实测 `ssh -T git@github.com` → `Server accepts key` 后 `Permission denied (publickey)`；`git ls-remote git@github.com:pfmiles/dsh-gsd.git HEAD` → exit 128。`~/.ssh/id_rsa`（`SHA256:X6AR4nBc…`）不是 `pfmiles` 账号的有效 key；换 `PubkeyAcceptedAlgorithms`（rsa-sha2-512 / rsa-sha2-256 / +ssh-rsa）无效 ⇒ 不是算法协商问题。
   - **Fix:** 改走 HTTPS，但**不把 origin 改写成 HTTPS**：每次推送显式给 `https://github.com/pfmiles/dsh-gsd.git`。origin 至今仍是 `git@github.com:pfmiles/dsh-gsd.git`（仍不可用）。
   - **Verification:** 推送输出 `d3c8e89..20e20c0  main -> main`；`git remote -v` 前后逐字一致；远端 main sha == 本地 HEAD（API 复核）。
   - **Committed in:** 无产品提交（推送即交付）

2. **[Rule — 对外动作] `workflow` scope 由人类显式授权后追加**
   - **Found during:** Task 3（首个 HTTPS 探针）
   - **Issue:** token scopes 原为 `'gist','read:org','repo'`，缺 `workflow`；GitHub 拒绝创建/更新 `.github/workflows/…`（`refusing to allow an OAuth App to create or update workflow … without 'workflow' scope`）。P-03-j 明令不得自行 refresh。
   - **Fix:** 由**人类**执行 `gh auth refresh -h github.com -s workflow -s delete_repo`（同时为探针仓的删除授权 `delete_repo`）；执行器未自行 refresh。
   - **Verification:** `gh auth status` → `Token scopes: 'delete_repo', 'gist', 'read:org', 'repo', 'workflow'`（收口时复核）。
   - **Committed in:** 无产品提交

3. **[Rule 3 - Blocking] stale `osxkeychain` 凭据让 refresh 后的推送仍失败**
   - **Found during:** Task 3（refresh 后重试）
   - **Issue:** 普通 `git push https://…` 仍报同一条 workflow scope 错 —— `credential.helper=osxkeychain` 提供的是旧 token；`gh auth status` 里 `Git operations protocol: ssh` 也让默认路径继续走坏掉的 SSH。
   - **Fix:** 用 `git -c credential.helper= -c credential.helper='!gh auth git-credential' push <https-url> main`（清空 helper 链后只接 gh 的 credential helper）；两次推送（探针仓 + 真仓）都用该形态。
   - **Verification:** 探针仓与真仓均推送成功；scope 错误不再出现。
   - **Committed in:** 无产品提交

4. **[Rule 4 - 计划外增项，用户授权] 探针仓干跑**
   - **Found during:** Task 2 裁决
   - **Issue:** 计划的三选项里没有「先在临时仓验证」。人类裁决追加此步骤，理由是首跑红不可撤销。
   - **Fix:** 建私有仓 `pfmiles/dsh-gsd-ci-probe` → 推同一 SHA → run `43218482632` success（4 格全绿，1m36s）→ `gh repo delete … --yes` → API 404。真仓随后才推。
   - **Verification:** 探针 run conclusion=success；探针仓 `total_count=1`；删除后 `gh api repos/pfmiles/dsh-gsd-ci-probe` → 404（收口复核）；真仓 `total_count` 仍为 0（推送前）。
   - **Committed in:** 无产品提交（探针仓已删除）

### 记录性差异（不改变交付物语义）

5. **[记录性] 四格执行数 > plan `<verify>` 的两格回路** —— 按 must_haves 的四格口径执行（4/4 全绿），两格回路是它的真子集。
6. **[记录性] SUMMARY 由 `docs(03-03)` 提交落库，而非「计划收尾的 metadata commit」** —— Task 1 结束时按 dispatch 要求先落证据册（`20e20c0`），它随后成了被推送的 HEAD；planning-only，零 CI 输入变化（`.planning/` 不在 `files`，pack 排除）。
7. **[记录性] `requirements-completed` 在 Task 1 时为 `[]`，收口时改为 `[PUB-01]`** —— 推送前 PUB-01 的决定性一步未发生，当时的空值是正确状态；现由 `requirements.ready-ids` 判定 1/1 ready 后闭合。
8. **[记录性] frontmatter `status` 由 `halted` → `complete`** —— Task 1 阶段是设计的 blocking-human 停点；人类裁决执行后按 `complete` 收口。

---

**Total deviations:** 4 条改变执行路径（1 条 premise 被推翻 + 1 条对外授权 + 1 条凭据排障 + 1 条用户授权增项）+ 4 条记录性差异。
**Impact on plan:** 交付判据全部成立（SC-5 的 `conclusion=success` 与 `total_count==1` 双机器事实），但**通道与计划假设不同**：Shared Pattern 9 的「SSH 可用」在本机为假，后续任何推送都必须走 HTTPS + gh credential helper，且 `origin/main` 跟踪 ref 不会自动更新。

## Issues Encountered

- **SSH key 无效**（详见偏离 1）：不是算法问题，是 key 与账号不匹配。未尝试生成/更换 key（属凭据变更，超出授权）。
- **OAuth scope 缺失**（偏离 2）：由人类 refresh 解决；执行器未自行 refresh。
- **keychain stale token**（偏离 3）：refresh 不等于 git 会用新 token；helper 覆盖是必要步骤。
- **`origin/main` 本地跟踪 ref 仍停在 `d3c8e89`**：推送用显式 HTTPS URL，未走 `origin` remote；SSH 又不可用，无法 `git fetch origin` 更新。**不要把它误读为「本地领先 106 未推」** —— 远端 main 已是 `20e20c0`（API 复核）。后续若要恢复常规 `git status` 语义，需先修 SSH key 或把 origin 改成 HTTPS（两者都是需要人类授权的通道变更）。
- **Ubuntu 26 迁移提示**（run annotation，非失败）：`ubuntu-latest` 将于 2026-10-19 起迁到 Ubuntu 26；矩阵下限绑在该标签上，迁移前需复核。

## User Setup Required

None - 本计划的对外动作已全部完成（push 已发生）。**剩余通道问题需人类决定**（不属本计划交付物）：`~/.ssh/id_rsa` 与 `pfmiles` 账号不匹配，导致 `origin`（SSH）不可用；是否修 key 或把 `origin` 改为 HTTPS，属凭据/remote 变更，须人类授权。

## Next Phase Readiness

- **Phase 3 的 SC-5 成立**：CI 首次激活 run `43218878911` 四格 × 六步全绿，`conclusion=success`，`total_count=1`（唯一一条历史 ⇒ 无红跑历史）。PUB-01 的推送面闭合（repo 名 == npm 包名 `dsh-gsd`；npm 首发仍按 D-02 推迟到 Phase 5）。
- **D-02 的边界守住**：零 `npm publish`、零 GitHub Release、零 dshmarket PR、零 `private` 变更。
- **下一步 = `/gsd-verify-work 03`**：Phase 3 的 6 条 Success Criteria 已有可机读证据（tarball 装成 boot 见 03-01、pack 清单见 03-01/03-02、dshmarket 材料见 03-02、徽章/许可见 03-02、CI 首绿见本文件、CHANGELOG 见 03-02）。
- **Phase 5 移交**：见上方五条 + dry-run 禁令 + Ubuntu 26 annotation。
- **无阻塞项**：3/3 计划完成；`total_count==1` 且为绿。

## Self-Check: PASSED

- 四格 4/4 exit 0 且各自打印 `cell ok` → PASS
- 三条构建 exit 0，收尾含 `copied 76 trees` + `gates: all passed (A/B/C)`，`gsd-core/VERSION=1.20.1` → PASS
- actionlint exit 0 零输出（可用，非 UNAVAILABLE）→ PASS
- 全量套件 32/32，失败数与 cancelled 数均为 0（原始输出见证据 ④：`ℹ tests 32` / `ℹ pass 32`），与 `BUILD.md:16` 等值 → PASS
- 推送前 zero-state：status（仅排除本 SUMMARY）0 行、无 tracked `*.tgz`、origin=SSH 且 basename==包名、`total_count==0` → PASS
- **首次 push**：`d3c8e89..20e20c0 main -> main`，exit 0；推送后远端 `refs/heads/main` == 本地 HEAD == `20e20c0283f764864474b7d6a2dfd48f22a0c6b9`（`gh api …/commits/main`）→ PASS
- **首跑**：`gh run list --workflow=compat-matrix.yml --limit 1 --json …` → databaseId `43218878911` / event `push` / conclusion `success` / headSha `20e20c0` → PASS
- **一次推送一次 run**：`gh api repos/pfmiles/dsh-gsd/actions/runs --jq '.total_count'` → `1`（推送前 `0`）；`run_attempt == 1` → PASS
- **远端形态**：`.github/workflows/compat-matrix.yml` 在远端存在（contents API 命中）→ PASS
- **通道未被擅自改变**：`git remote -v` 仍是 `git@github.com:pfmiles/dsh-gsd.git`（fetch+push）；执行器未 refresh token（由人类执行）、未 rerun、未第二次推真仓 → PASS
- **收口一致性**：`find-phase 03` → plans 3 / summaries 3；`requirements.ready-ids` → 1/1 → `mark-complete PUB-01` updated；`roadmap.update-plan-progress 03` → 3/3 + 03-03 打勾；`state.advance-plan` → `completed_plans: 9`、`status: verifying` → PASS

---

*Phase: 03-github-npm-dshmarket*
*Plan: 03（complete — push 与首跑均已落地）*
*Completed: 2026-11-12*