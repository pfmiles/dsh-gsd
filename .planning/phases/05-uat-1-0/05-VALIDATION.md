---
phase: "5"
slug: "uat-1-0"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: false
wave_0_complete: true
created: "2026-11-16"
validated: "2026-11-26"
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> **State A 审计（2026-11-26，HEAD `68ed58a`）**：本文件由 2026-11-16 的 plan-phase 种子版升级为执行后的实测版。
> 绑定的是**实际落地的断言位置与实测读数**，不是种子的预期；种子与实测的每一处差异在 §Fact corrections 里逐条订正 —— 含**三处判据形态变化**：C-5 加严、C-6 如实记窄、C-12 因原形态在本 DSH 版本上恒红而改为更强的求值形态。
>
> **本次审计实际重跑了什么**（其余一律不作「已复跑」声称）：
> 1. 默认全量：`node --test --test-concurrency=1 tests/*.test.mjs` → `47 / 40 pass / 0 fail / 7 skip`，**8 055 ms**（连跑两次一致：7 758 ms / 8 055 ms）。
> 2. 快速回路：`node --test --test-concurrency=1 tests/docs-consistency.test.mjs` → **16/16**，87 ms。
> 3. UAT-04 的两条 hook 用例，用**占位**凭据越过存在性闸实跑 → `pass 2 / fail 0`（见 **G-1**；占位值不被这两条用例消费，也不起 `dsh` 会话）。
>
> **本次审计没有重跑什么**：7 条用例共用一道 live 闸，其中 ③④⑤⑥⑦ 需要真实会话与进程内的 `DEEPSEEK_API_KEY`（①② 只需要已构建的 `hooks/`，见 G-1）；本会话 env 无该键，而读取
> `~/.dsh/.credentials.yaml` 越出本次授权的读写面（`05-UAT-EVIDENCE.md` 判据段 12 记该文件 591 B、mtime `Oct 22 14:14`，未被迁移触碰）。
> 因此 UAT-01/02/03/05/06(开销) 与 INST-01..05 的「今天仍绿」**不由本次审计独立证明**，状态来自执行期的 live 记录（判据段 1/2/3/5/8）+ 代码复核。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in test runner — `node --test`（node `v24.21.0`；`engines.node >=24`） |
| **Config file** | 无配置文件 —— glob 驱动。**7 个文件 / 47 个顶层用例**：`build-smoke 2` / `compat-matrix 8` / `docs-consistency 16` / `pack-contents 4` / `rewrite-map 7` / `uat-harness 7` / `version 3`（`BUILD.md:16` 的 ⑯ 自校验同一算术） |
| **Quick run command** | `node --test --test-concurrency=1 tests/docs-consistency.test.mjs`（16 tests，实测 **87 ms**） |
| **Full suite command** | `node --test --test-concurrency=1 tests/*.test.mjs`（47 tests；2026-11-26 实测 `47 / 40 pass / 0 fail / 7 skip`，**8 055 ms**，含真实构建 smoke） |
| **Estimated runtime** | ~8 s（全量，两次连跑 7.8 s / 8.1 s）；~0.1 s（快速回路） |

**`npm test` 现在可以跑**：D-10-1 已落地 —— `package.json:49` 的 `prepack` 与 `:50` 的 `test` 都带
`--test-concurrency=1`，`.github/workflows/compat-matrix.yml:56` 的全量测试步也带（`grep -c` 合计 **恰 3**，⑮ 逐处守着）。
串行**仍然必须**：`tests/build-smoke.test.mjs` 会 `node build.mjs` 重写构建树，并发假红是结构性风险，不是历史故事。

---

## Sampling Rate

- **After every task commit:** `node --test --test-concurrency=1 tests/docs-consistency.test.mjs`（16 tests，~0.1 s）
- **After every plan wave:** `node --test --test-concurrency=1 tests/*.test.mjs`（47 tests，~8 s）
- **Before `/gsd-verify-work`:** 全量绿（47 个 `test(` 都有结论：40 pass + 7 条 opt-in skip **且 skip 理由可读**）+ `npm publish --dry-run` 打印 `with tag latest` 与 `https://registry.npmjs.org/`（该 dry-run 真的跑 `prepack` = build + 全套串行）
- **Max feedback latency:** ~8 s（默认回路）。**live 段不计入**：单条用例 2 s–127 s 且需要真实会话与凭据
- **判据读法：** 只看 `fail 0` 会把「skip」读成「通过」。默认回路的正确读数是 `pass 40 + skip 7 = 47`；这 7 条在默认回路里**不算绿，算没跑** —— 其中 ①② 经本次旁证今天确实是绿的，只是没被默认回路执行（G-1）

---

## Per-Task Verification Map

绑定到**真实任务**（4 个 plan / 12 个任务）。`<automated>` 的完整命令体在各 PLAN 里；本表登记任务、需求、判据形态与**实际落地位置**，
状态列是执行后的实测结论。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-T1 | 05-01 | 1 | UAT-01, INST-01 | T-5-01 | 干净 `/tmp` home 单命令装成后**真实会话**判据成立（`assistant/message` ≥1 ∧ 任何 `turn/end` 递归无 `kind:error`）；`cordis.patch.yml` 仍为 `[]`、无被禁条目；不存在 profile 的边落在实测不变量上（不断言「非零退出」——本 DSH 版本上它 exit 0 并初始化 profile） | integration（live） | `DSH_UAT_LIVE=1 DEEPSEEK_API_KEY=… node --test --test-concurrency=1 tests/uat-harness.test.mjs`（用例 ③） | ✅ `tests/uat-harness.test.mjs:217` | ✅ green（live `pass 1 / skipped 0`，判据段 1，2026-11-16T06:14:54Z） |
| 05-01-T2 | 05-01 | 1 | D-10-1 | T-5-10 | `--test-concurrency=1` 三处齐备（`package.json:49` `prepack`、`:50` `test`、`compat-matrix.yml:56`），计数**恰 3**（`>= 3` 不算通过） | unit（in-suite） | `node --test --test-concurrency=1 tests/docs-consistency.test.mjs`（⑮） | ✅ `tests/docs-consistency.test.mjs`（⑮） | ✅ green（默认回路，本次 16/16；另有 ⑮ 变异实验，判据段 1） |
| 05-01-T3 | 05-01 | 1 | INST-02, INST-03, INST-04, INST-05, UAT-02, UAT-03 | T-5-03 | 受管面快照差集只落在 `profiles/<p>/`；`add` 后不重启即两 row 各**恰 1**；`!!js` 按加载器语义求值为**包内绝对路径**且在盘；`remove` 归零 + 幂等边（再 remove 不改 manifest、不报成功）+ 空操作边（从未装过的 profile）；无 `.planning/` 的临时 git 仓 scaffold 出 `PROJECT/ROADMAP/STATE`；`.env` 被 secret-read guard 拦且其哨兵**不入**记录、`.txt` 阳性对照成功且其哨兵**入**记录 | integration（live） | 同上（用例 ④ `:460` / ⑤ `:596`） | ✅ `tests/uat-harness.test.mjs:460,596` | ✅ green（live：④ 2.0 s、⑤ 127 s，`pass 3 / skipped 0`；判据段 2/3） |
| 05-02-T1 | 05-02 | 2 | UAT-04 | T-5-04, T-5-12 | commit 校验**三段对照**：opt-in+非规范 → exit 2 ∧ `decision: block` ∧ `code: CONVENTIONAL_COMMITS_VIOLATION` ∧ stderr 无 fail-open 行；opt-in+规范 → exit 0 ∧ 无 block；未 opt-in+非规范 → exit 0 ∧ 无 block（负向对照）；injection **只 advisory**：exit 0 ∧ 有 `severity` ∧ `INJECTION-PATTERN` >0 ∧ `decision ≠ block`。两条都**不起** `dsh` 会话 | unit（hook 组件级，经真实 wrapper） | 同上（用例 ① `:749` / ② `:840`）+ `tests/fixtures/injection-sample.md` | ✅ `tests/uat-harness.test.mjs:749,840` + `tests/fixtures/injection-sample.md` | ⚠️ PARTIAL（**G-1**）：断言今天全绿，但被 live 闸挡在默认回路之外 |
| 05-02-T2 | 05-02 | 2 | D-10-5, UAT-05 | T-5-13, T-5-14 | **构建后**的 `gsd-core/bin/lib/ui-frontend-evidence.cjs` 与 canonical `build/assets/ui-frontend-evidence.cjs` 逐字节相同，且 `SKIP_DIRS` **Set 成员行**里 `.gsd-build-tmp` **恰 1**（注释里的散文不计）；同一条 `plugin add` 换 tarball 使 profile 内 `version` 随之 `.dsh022 → .dsh021 → .dsh022`，每步两 row 各恰 1，回滚后会话谓词成立 | unit（in-suite，真实构建）+ integration（live） | `node --test --test-concurrency=1 tests/build-smoke.test.mjs`（⑨，在真实构建用例内）+ 同上（用例 ⑥ `:987`） | ✅ `tests/build-smoke.test.mjs:151-201`、`tests/uat-harness.test.mjs:987` | ✅ green（⑨ 默认回路绿，真实构建 5 882 ms；⑥ live `pass 6 / skipped 0`，判据段 5/6） |
| 05-02-T3 | 05-02 | 2 | UAT-06, INST-06 | T-5-15 | 同 home 成对 profile（`base` 无插件 / `p5` 有插件）交替 3 轮，`turn/start.time − session.createdAt` 的中位数 `median(p5) > median(base)`（**不钉毫秒**，换机器不假红）；改 front-matter `description` 后**新进程**会话命中该 token（启动读取，**不是** watch）；watch 取 `not measured`；元数据合规回归仍绿 | integration（live）+ unit（in-suite） | 同上（用例 ⑦ `:1077`）+ `node --test --test-concurrency=1 tests/docs-consistency.test.mjs`（⑩）+ `tests/pack-contents.test.mjs` | ✅ `tests/uat-harness.test.mjs:1077`、`tests/docs-consistency.test.mjs`（⑩）、`tests/pack-contents.test.mjs` | ✅ green（开销：live `pass 7 / skipped 0`，判据段 8；⑩ 默认回路绿）/ 🔶 watch 半边 = manual-only（`not measured`） |
| 05-03-T1 | 05-03 | 3 | PUB-01（发布前态） | T-5-05 | `private` 键被**删除**（不是置 false）、`publishConfig = {registry: https://registry.npmjs.org/, tag: latest}` 逐字；`npm publish --dry-run` 打印 `Publishing to https://registry.npmjs.org/ with tag latest` 且 prepack 跑完构建门 + 全套串行 | unit（in-suite）+ 一次性 dry-run | `node --test --test-concurrency=1 tests/*.test.mjs` + `npm publish --dry-run` | ✅ 判据段 9 | ✅ green（2026-11-16T07:34:14Z，exit 0） |
| 05-03-T2 | 05-03 | 3 | PUB-01（D-04 裁决与 CI 背书） | T-5-06 | 裁决行落证据册；预演分支 `workflow_dispatch` 与 main 两次 CI 逐条记录；「发布所用提交有 CI 背书」被重建（**字节**不可复现，这一点如实登记，不当判据） | checkpoint:decision + 远端只读 | `gh run list --workflow=compat-matrix.yml --limit 1 --json conclusion,status,headSha` + `curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/dsh-gsd` | ✅ 判据段 10 | ✅ 已执行（`approved`；两次 run 读数在判据段 10） |
| 05-03-T3 | 05-03 | 3 | PUB-01, PUB-03, UAT-01（registry 通道复验） | T-5-05, T-5-06, T-5-09, T-5-16 | 人执行 `npm publish`（OTP）后：权威 registry `dist-tags.latest = 1.20.1-1.dsh022`、该版本 tarball 可解析、**registry 通道**装出的 958 文件与发布字节逐字节相同且会话谓词成立；Release tag 指向 `PUBLISHED_SHA` 且 `isPrerelease=false`；dshmarket PR 单文件、与仓内 yml 逐字节相同 | human + 远端只读自动化 | `npm view … --registry https://registry.npmjs.org/` / `gh release view …` / `gh pr list …` / `gh api …/commits/main` | ✅ 判据段 11 | ✅ 已执行（PUB-01 `passed`；PUB-03 = `open item`：四检 ④ 收官时仍 `in_progress`） |
| 05-04-T1 | 05-04 | 4 | D-10-3（前置：只读预检） | T-5-07 | 真实 home 只读盘点：4 profile、`old-skills: 72`、`web`/`headless` 各 2 行 bridge、四受管项在场；步骤 1 硬门两次跑 **1 → 0**（`GATE: PASS`）；安装版本取自判据段 11 而非硬编码 | 只读（machine） | runbook 步骤 1 硬门 + 重数命令（判据段 12 §2/§4） | ✅ 判据段 12 | ✅ 已执行 |
| 05-04-T2 | 05-04 | 4 | D-10-3（前置：3091 刷新） | T-5-07, T-5-18 | 刷新后 `gsdtest` 由插件供 **72** 技能、包内 `index.js` 的 `skillsDir` 为 `<plugin>/skills`、provider 行指向插件目录、两 row 各 **1**；重启前把锚点写进 `.continue-here.md` 并提交 | checkpoint:decision + machine | 判据段 13 的重装与读数命令 | ✅ 判据段 13 | ✅ 已执行（双源并存的中间状态被如实记录，未记成通过） |
| 05-04-T3 | 05-04 | 4 | D-10-2, D-10-3, D-10-4 | T-5-07, T-5-08, T-5-17 | runbook 步骤 1–6：旧源 **0**、两 profile 各装 `dsh-gsd@1.20.1-1.dsh022`（registry 通道、两 row 各 1、包内 72 + 3587 B + 3856 B、stderr 0 B）；G-4 静态段 `coexist-static ok:` 且零 `MISSING:` + `COEXIST-REAL PASS`（五条合取）；旧仓远端 main 前进且插入正文与 `snippet.en.md` **逐字节相同**，`snippet.zh.md` 未推 | manual（machine-level，`blocking-human`） | **无 `<automated>`**：`<verification>` 的只读命令集 + 人放行 | ✅ 判据段 14 | 🔶 manual-only（已执行；3 条需求见 §Manual-Only） |

*Status: ✅ green（默认回路）· ✅ green（live 开关下实跑；默认 7 条全 skip）· ⚠️ PARTIAL（见 §Coverage Gaps）· 🔶 manual-only（见 §Manual-Only）· ⬜ pending · ❌ red*

### 19 个需求 ID 结账（ROADMAP 的 Phase 5 `Requirements` 行，逐 ID 展开）

| ID | 自动化断言（位置） | 默认回路 | 默认回路外的证据 | 状态 |
|---|---|---|---|---|
| UAT-01 | ③ live `uat-harness:217` | skip | 判据段 1（tarball 通道）+ 判据段 11（registry 通道，含 `hook/invoked`） | ✅ green |
| UAT-02 | ⑤ live `:596` | skip | 判据段 3（`.planning/` 5 文件 + 引擎包内路径） | ✅ green |
| UAT-03 | ⑤ live `:596` | skip | 判据段 3（guard `decision=block` + 双哨兵对照） | ✅ green |
| UAT-04 | ①② live `:749,:840` | **skip（闸过宽）** | 判据段 4 + 本次占位键实跑 `pass 2/2` | ⚠️ PARTIAL（**G-1**） |
| UAT-05 | ⑥ live `:987` | skip | 判据段 5（三段 swap + 回滚后会话） | ✅ green（机制段） |
| UAT-06 | ⑦ live `:1077`（仅开销半） | skip | 判据段 8（启动读取）；watch = `not measured` | ✅ green（开销）/ 🔶 manual（watch） |
| INST-01 | ③ live `:217` | skip | 判据段 1（`[]` 未被改写 + 空入参边） | ✅ green |
| INST-02 | ④ live `:460` | skip | 判据段 2（快照差集空）；`build-smoke` ④ 是**相关但更弱**的 build 侧断言（构建树零 `~/.dsh` 字面量），**不作替代** | ✅ green |
| INST-03 | ④ live `:460` | skip | 判据段 2（404 行 / 两 row 各 1） | ✅ green |
| INST-04 | ④ live `:460` | skip | 判据段 2（归零 + 幂等边 + 空操作边） | ✅ green |
| INST-05 | ④ live `:460` | skip | 判据段 2（`!!js` 求值为包内绝对路径 ∧ 在盘） | ✅ green |
| INST-06 | ⑩ `docs-consistency` + `pack-contents` | **跑** | 判据段 7（20 条实测 + 实数） | ✅ green |
| PUB-01 | —（一次性 dry-run + 人执行） | — | 判据段 9（dry-run）/ 10（裁决与 CI）/ 11（registry 复验） | 🔶 manual-only |
| PUB-03 | ⑪⑫（**材料**半：schema + 裸名串逐字） | **跑** | 判据段 11（PR 本体：单文件 + 逐字节 + 四检） | 🔶 manual-only（材料半 auto） |
| D-10-1 | ⑮ `docs-consistency` | **跑** | 判据段 1 的 ⑮ 变异实验（删 flag → 谓词 FAIL） | ✅ green |
| D-10-2 | —（真实 home） | — | 判据段 14 §10（四源 + `COEXIST-REAL`） | 🔶 manual-only |
| D-10-3 | —（真实 home） | — | 判据段 14 §1–§9（迁移 + 阴性对照 A–E） | 🔶 manual-only |
| D-10-4 | —（跨仓） | — | 判据段 14 §15（远端 sha + 691 B 逐字节） | 🔶 manual-only |
| D-10-5 | ⑨ `build-smoke:151-201`（真实构建内） | **跑**（构建前提见 R-2） | 判据段 6（两次构建 + RED 证据） | ✅ green |

**算术：** 19 = 3（默认回路绿：INST-06 / D-10-1 / D-10-5）+ 11（需要 live 开关：UAT-01..06 与 INST-01..05）+ 5（只有人工/远端判据：PUB-01 / PUB-03 / D-10-2 / D-10-3 / D-10-4）。
其中 UAT-04 是 11 里唯一**其实不需要开关**的一条（**G-1**），UAT-06 是唯一**一半自动化、一半人工**的一条。

---

## Wave 0 Requirements

- [x] `tests/uat-harness.test.mjs` —— **已落地**（71 802 B / 7 用例；0 条能在默认回路里跑，7 条全部经同一道 live 闸 —— 其中 ①② 其实不需要真实会话，见 G-1）。会话判据实现为「`zstd -dc` → 逐行 `JSON.parse` → `assistant/message` 在场 ∧ `turn/end` 递归无 `kind:error`」，失败消息可区分「没产出模型输出」与「这一轮失败了」。7 条用例全部经 `missingPrereqs()` 逐项报缺（`DSH_UAT_LIVE` / `DEEPSEEK_API_KEY` / `dsh` / `zstd` / 唯一 tarball），无 live 环境**不可能**出现 pass。
- [x] 三处 `--test-concurrency=1` 的计数断言 + 构建后 `SKIP_DIRS` 断言 —— **已落地**：⑮（`docs-consistency`，读 `package.json` 与 workflow，计数恰 3）+ ⑨（`build-smoke` 真实构建用例内，读**构建后**产物）。两条都在默认回路里跑，且 ⑮ 有变异实验证明有牙（判据段 1），⑨ 有 RED 证据（判据段 6）。
- [x] UAT-03 的 sentinel fixture + injection fixture 进仓 —— **injection 半边已进仓**：`tests/fixtures/injection-sample.md`（1 202 B，被用例 ② 直接消费）。`.env` 哨兵**不**进仓，而在一次性目录里**运行时生成**（`mkdtemp('/tmp/uat-repo-')` + `writeFileSync('.env')`）——这是唯一正确形态：判据就是「文件名恰为 `.env`」，把 `.env` 提交进仓既会触发本仓自己的 secret-read guard，也把判据变成了另一件事。哨兵值每次随机（`UATENV-<8 hex>`），两文件用**同前缀不同值**两个哨兵（单哨兵会让「不入记录」与「入记录」两条断言互斥）。
- [x] **不需要新测试框架** —— Node 自带 runner 覆盖以上全部；本 phase 未新增任何依赖（`tech-stack.added: []`）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | 状态 / 证据 |
|----------|-------------|------------|-------------------|-------------|
| `npm publish` 的 OTP 与发布回执 | PUB-01 | npm 12 要求交互式两步验证；本机 `npm whoami` 为 `ENEEDAUTH`，D-07 定死由人执行 | 人执行 `npm publish`，回填命令 / UTC / 末尾 `+ dsh-gsd@1.20.1-1.dsh022` 行；发布后**每条读**都钉 `--registry https://registry.npmjs.org/`（本机默认是只读镜像） | ✅ 已执行 —— 判据段 11：`latest = 1.20.1-1.dsh022`（11:57Z）；回执后约 7 分钟的 `404` 属传播窗口，**D-05 未触发** |
| dshmarket PR 的四检终态与合并决定 | PUB-03 | 对方仓 maintainer 的时间不可控；D-09 已裁决「PR 已开 + 四检通过」即满足，不含合并 | 记 PR 号 + 四检逐条状态；**合并状态单列 `open item`** | 已开 [#18793](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18793)：`changedFiles 1`、`+6/−0`、与 `docs/dshmarket/pfmiles__dsh-gsd.yml` 逐字节相同；四检 ①②③ 绿，④ 的 `Build (locale parity, …)` 在收官（12:31Z）时仍 `in_progress` ⇒ `05-UAT.md` 取 `open item` |
| 真实 `~/.dsh` 迁移（`--uninstall` → registry 通道安装 → 阴性对照） | D-10-3 | 写动作落在**真实 home** 上，且 `--uninstall` 无条件 `rm -rf skills/gsd-*`；机器只能证明读数，不能替人承担「现在动手」的裁决（T-5-07） | runbook 步骤 1–6 + 阴性对照 A–E + 内容比对（3587 / 3856 / 72）+ 保留 `.stripped-bak` | ✅ 已执行 —— 判据段 14 §1–§9：旧源 A **0** / B 三行 absent / C、D 无输出 / E `PRESENT gsd-hooks-bridge=0`；备份 72 目录；`web`/`headless` 各装 `dsh-gsd@1.20.1-1.dsh022`（两 row 各 1、包内 72 + 3587 B + 3856 B、stderr 0 B）。范围外发现：`gsd-p3-release` 迁移后 0 个 `gsd-*` 来源（未改动，交人裁决） |
| G-4 codegraph 并存的运行时复核 | D-10-2 | 需要真实 home 里四个 bundle 同层解析；临时 home 复刻不出该状态（D-02 禁止在真实 home 上做演练以外的写入），且 codegraph 的 spec 冻结不了确切版本 | 步骤 6 静态段四条来源断言（`MISSING:` **判红**）+ `COEXIST-REAL` 五条合取 | ✅ 已执行 —— 判据段 14 §10：四源 `[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`、`pairwise-disjoint=true`、`MISSING:` **0 行**；`COEXIST-REAL PASS`（五条全跑，含 `required-absent:dsh-gsd`）。**同层合成（真装三个 bundle 的 `COEXIST-DRILL`）仍未证** = `05-UAT.md` 开放项 4 |
| 旧仓互链推送 | D-10-4 | 跨仓写入不可逆；SSH 通道损坏，HTTPS + credential helper 是「信任哪条通道」的判断（T-5-08） | 人执行推送；权威判据 = `gh api …/commits/main` 前进 + 从**远端字节**切出的片段与 `snippet.en.md` 逐字节相同 | ✅ 已执行 —— 判据段 14 §15：`41fcc7a → 3af3f27`（单文件 `README.md`，`+9/−0`），691 B / sha256 `2ee9bde6…` 两侧相同，`snippet.zh.md` 未推 |
| 技能 watch（长驻进程热重载） | UAT-06 | **结构性不可测**：一次性会话每次都是新进程、启动时重读技能目录；watcher 只在长驻 `web` 进程里可观察，而数 fsevents 需要 root | 在非 3091 端口的 scratch `web` profile 里改一个 `SKILL.md`，记录「我改了 X，新会话在 T+n 看到它」；**不跑**则 README 必须写 `not measured` 且不得声称更强行为（SC-3） | 🔶 `not measured`（T-5-15）—— 只测了**启动读取**：改 front-matter `description` 后新进程会话 token 命中 **2** 次（判据段 8）。`README.md:81`（zh）与 `:170`（en）双语已如实写 `not measured` |

---

## Coverage Gaps

### G-1（UAT-04）：两条 hook 回归断言**可自动化，却不在默认回路**

**缺口本体：** `tests/uat-harness.test.mjs` 的 ①（commit 校验三段对照）与 ②（injection 只落日志）存在、指向正确、今天跑绿，
但被 `missingPrereqs()` 的 `DSH_UAT_LIVE=1` + `DEEPSEEK_API_KEY` 闸一起挡掉 ⇒ `npm test` / `prepack` / CI **永不执行**它们，
hook 分发面（`hooks/dsh-gsd-suite/run.cjs`）、commit 规则与 injection 规则的退化不会被任何默认回路捕获。

**证据（四条，都可重跑）：**

1. **默认读数**（2026-11-26 本次）：`node --test --test-concurrency=1 tests/*.test.mjs` → `ℹ skipped 7`，其中 ①② 的 skip 理由逐字为
   `live UAT requires: DSH_UAT_LIVE is not 1 (…) | DEEPSEEK_API_KEY is not in the process env (…)`。
2. **代码事实**：`DEEPSEEK_API_KEY` 在整个 harness 里只出现两处 —— 文件头注释（`:10`）与 `:84` 的**存在性检查**；
   ①② 的函数体只 `spawnSync('node', [HOOK_WRAPPER, …])` 喂合成 payload，不起 `dsh` 会话、不联网。
   执行期的证据册自己也是这么写的：判据段 4 首行「两条都**不起** `dsh` 会话」。
3. **反向实测**（本次审计，占位值不构成凭据）：
   `DSH_UAT_LIVE=1 DEEPSEEK_API_KEY=audit-probe-not-a-real-key node --test --test-concurrency=1 --test-name-pattern='UAT-04' tests/uat-harness.test.mjs`
   → `✔ ① …`、`✔ ② …`、`ℹ tests 2 / pass 2 / fail 0 / skipped 0`（1.25 s）；
   用例自报 `① … opt-in+nonconforming=exit 2/block:CONVENTIONAL_COMMITS_VIOLATION | opt-in+conforming=exit 0/no-block | no-opt-in+nonconforming=exit 0/no-block`、
   `② injection: severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)`。⇒ **断言今天是绿的，只是默认回路看不到。**
4. **为什么这条闸对 ①② 是可去掉的**：它们的前置只有「已构建的 `hooks/`（`run.cjs` + `gsd-validate-commit.sh`）+ `tests/fixtures/injection-sample.md`」；
   而 `prepack` 的第一段就是 `node build.mjs`，CI 也先跑 build。真正需要凭据与 `dsh` 的只有 ③④⑤⑥⑦。

**为什么算缺口（而不是「manual-only」）：** 这是 Phase 04 的 G-1/G-2/G-3 同一类 —— *可自动化却不在逐提交回路*。
它不是「需要人来判断」，也不是「需要真实 home」，而是**闸比实际需要更宽**。

**建议落点（本次未执行；写面限定在本文件，且约束禁止改 `tests/`）：** 把前置拆成两层 ——
`missingHookPrereqs()`（只查 `hooks/` 两个文件与 fixture；缺则定向 skip 并提示 `run node build.mjs`）与
`missingLivePrereqs()`（`DSH_UAT_LIVE` / `DEEPSEEK_API_KEY` / `dsh` / `zstd` / tarball）；
①② 只用前者，③④⑤⑥⑦ 仍用后者。**不得**为让它默认绿而放宽任何断言、换掉 `.env` 判据或删掉 `FAIL_OPEN_LINE` 这类否定断言。

### 残余条件（**不是**缺口，但改变「绿的含金量」—— 读本文件的人必须知道）

- **R-1（live 段未由本次审计复跑）**：5 条真实会话用例（③④⑤⑥⑦）覆盖 11 个需求 ID，它们需要 `DSH_UAT_LIVE=1` + 进程内 `DEEPSEEK_API_KEY`。执行期最后一次 live 读数是
  `ℹ tests 7 / pass 7 / fail 0 / skipped 0`（判据段 8，2026-11-16T07:16:23Z）。本次审计的进程 env 无该键，
  也**不**去读 `~/.dsh/.credentials.yaml`（越出本次授权的读写面）。⇒ UAT-01/02/03/05/06(开销) 与 INST-01..05 的「今天仍绿」来自记录 + 代码复核，**不是**本次独立复跑的结果。
- **R-2（D-10-5 的守卫有构建前提）**：⑨ 在 `tests/build-smoke.test.mjs` 的**真实构建**用例内，而该用例在「冷离线树」上会 `t.skip`
  （`canBuild` = `.build-cache` 里有 tgz **或** `npm view` 可达）。本次本机 registry 可达 ⇒ 真实构建 5 882 ms 跑完，⑨ 绿。
  在任何环境里读读数时，**看 `pass/skip` 的数字，不要只看 `fail 0`**。
- **R-3（待装 tarball 与 HEAD 的同源性是纪律、不是断言）**：live harness 从 `DSH_UAT_TGZ` 或 `/tmp/uat-tgz/` 里的**唯一** tarball 解析待装件，
  只校验版本串；它不断言该 tarball 由当前 HEAD 打出。本次可用件为 `/tmp/uat-tgz/dsh-gsd-1.20.1-1.dsh022.tgz`（4 582 619 B，2026-11-26 01:59 本地），
  来源是判据段 13 §1 的「打包自当前 HEAD」。
- **R-4（⑨ 只构建一次）**：D-10-5 的「连跑两次 `node build.mjs` 仍成立」由判据段 6 的**一次性门**留证
  （`skip-dirs survives rebuild: PASS (set member exactly 1, whole-file mentions 4)`）；套件断言的是「这一次构建后的产物」+「与 canonical 逐字节相同」+「Set 成员行恰 1」。
  把拷贝步挪到上游 staging 之后仍会让 ⑨ 红（字节不等），但「第二次构建」本身不是每条提交都在验。

### Fact corrections（种子版 → 实测，逐条）

| # | 项 | 种子版写的 | 实测 / 证据 |
|---|---|---|---|
| C-1 | 套件规模 | 「6 files / 38 top-level cases」「full 38」 | **7 files / 47**：`build-smoke 2 / compat-matrix 8 / docs-consistency 16 / pack-contents 4 / rewrite-map 7 / uat-harness 7 / version 3`；⑯ 以 47 自校验，`BUILD.md:16` 的「预期 47」与之一致 |
| C-2 | `npm test` 禁令 | 「**Never `npm test`** until D-10-1 lands：`package.json:50` omits `--test-concurrency=1`」；D-10-1 行写「断言 `package.json:50`、`package.json:51`、`compat-matrix.yml:56`」 | **D-10-1 已落地**：`package.json:49` `prepack`、`:50` `test`、`compat-matrix.yml:56` 三处都带，`grep -c` 合计恰 3（⑮ 守着）。⇒ `npm test` **现在等于**串行全量，禁令解除；串行仍必须（`build-smoke` 重写构建树）。⚠ 行号也订正过：`:51` 是 `publishConfig` 的开头，不是第二处 flag —— ⑮ 断的是 **scripts 里的两处值**，不是两个固定行号 |
| C-3 | 全量耗时 | 「~8 s（7.7 s for the full 38）」 | 47 条实测 **8 055 ms**（连跑两次 7 758 / 8 055）；迁移后日志记 8 411 ms（判据段 14 §12） |
| C-4 | Map 的 `File Exists` | 17 行 `❌ W0`、`TBD` 任务号 | 12 个真实任务号已绑定；凡有自动化断言的需求都引用到**文件:行**，5 条只有人工/远端判据的需求引用到证据册判据段（没有测试文件可指 —— 这本身就是它们的判据形态） |
| C-5 | UAT-04 判据形态 | 「坏 commit → exit 2 且 stderr 含 `gsd-validate-commit.sh` 且不含 `validator disabled`」 | 实作**更强**：exit 2 ∧ `decision: block` ∧ `code: CONVENTIONAL_COMMITS_VIOLATION`（判据是判定 JSON，不是「stderr 里出现文件名」）；`validator disabled` 那条仍是**否定**断言（fail-open 行不得出现）。另加了第三段「未 opt-in + 非规范 → exit 0 ∧ 无 block」负向对照，把「恒拦」这种假绿也排掉 |
| C-6 | UAT-05 的取样 | 「每步重跑 UAT-01 判据 + dump 行集 + 版本串」 | 实作：三步各断 `version` + 两 row 各 1，**会话谓词只在回滚后跑一次**（这是需求原文「升级/回滚…**后**抽测通过」的形态，也是 05-02-T2 action 的形态：首步与末步各一次；首装 `.dsh022` 的会话面由 ③ 在另一个 home/profile 上覆盖）。**这不是「把断言改弱以凑绿」**：种子那句话是对需求的加严，此处如实记窄 |
| C-7 | D-10-2 的四源 | 「四份 `cordis.patch.yml` 的 row-id 集两两不相交」 | 实跑是**四源五个 id**：`[gsd, gsd-hooks-bridge]` / `[dsh-codegraph]` / `[deja]` / `[dsh-market]`，`pairwise-disjoint=true`、`MISSING:` 0 行；另加 `COEXIST-REAL` 五条合取（判据段 14 §10） |
| C-8 | PUB-01 的读侧 | 「发布后每条读都钉 `--registry`（本机默认是只读镜像）」 | 已执行；**种子版没有的新事实**：发布回执后约 7 分钟 `npm view` 仍 404 属传播窗口，**不是** D-05 的依据（判据段 11 有具体时长）。这条是补记，不是订正 |
| C-9 | Wave 0 的 harness | 「`tests/uat-harness.test.mjs`（或 `scripts/uat/` runner）—— **不存在**」 | 已存在（71 802 B / 7 用例）；`.env` 哨兵改为**运行时生成**（理由见 §Wave 0 第 3 项），injection fixture 已进仓 |
| C-10 | 跨产物一致性 | —（种子版无此条） | `05-UAT.md` 的判据表是 **18 行**（UAT-06 拆两行），19 个需求单元里 **D-10-1 / D-10-5 不在该表**：它们只在套件内（⑮ / ⑨），证据在判据段 1 / 6。按该文件自己声明的范围（live 用例 + 回归面）这是**范围声明**，不是覆盖缺口 —— 但「19 个 ID 全部结账」这件事只有本文件做 |
| C-11 | 现场数字 | UAT-06「基线 **10 ms** / 带插件 **340 ms**（已测）」；INST-03「实测 **391→403** 行」、INST-04「回到 **391** 行」 | 本轮实测（判据段 8）：基线 median **9 ms** / 带插件 median **279 ms** / 插件段 ≈**270 ms**；`--dump-config` 实测 **403 / 404 行**（判据段 1 / 2）。**数字换了、口径没换** —— 断言本身不钉毫秒（钉了换机器就假红），行数只是现场读数、从不作判据 |
| C-12 | INST-05 的判据形态 | 「`--dump-config` 里 `configPath` 是含 `node_modules/dsh-gsd` 的**绝对路径**，不是 `!!js` 字面量」 | **该字面断言在本 DSH 版本上恒红**：`--dump-config` **不求值** `!!js`（该文件 21 处 `!!js`，含出厂 bundle 自身的；源码注释亦为「without booting or evaluating `!!js`」）。用例改为**按加载器语义求值**该声明（`baseUrl` = profile 目录），断言求值结果是包内绝对路径且文件在盘 —— 比原形态**更强**（同时排掉 CR-01 那类自定位 off-by-one），失败消息保留 `configPath is not an absolute in-package path` / `!!js literal survived unexpanded` 两个可区分 token（判据段 2 的「实测与计划/研究不一致的一处」） |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies —— 12 个任务里 **11** 条带 `<automated>`；唯一例外 **05-04-T3**（`checkpoint:human-verify` + `<verification>` 只读命令集，门真的走完，逐条读数在判据段 14）
- [x] Sampling continuity: no 3 consecutive tasks without automated verify —— 序列 `05-01-T1..T3` ✅ / `05-02-T1..T3` ✅ / `05-03-T1..T3` ✅（后两条是远端只读自动化）/ `05-04-T1` ✅ / `05-04-T2` ✅ / `05-04-T3` 无；最长连续无 `<automated>` 段 = **1**
- [x] Wave 0 covers all MISSING references —— 3/3 结账，逐项带路径与实测（见 §Wave 0）
- [x] No watch-mode flags —— `npm test` / `prepack` / CI 三处都是 `node --test --test-concurrency=1 …`；全仓 `--watch` 命中 **0**；12 条一次性门全部一次性退出
- [x] Feedback latency < 10 s —— 快速回路 **87 ms**、全量 **8 055 ms**；live 段（2 s–127 s/条）不在默认回路
- [ ] `nyquist_compliant: true` set in frontmatter —— **不置 true**：**G-1** 未闭合（可自动化却不在默认回路）+ **5 条需求只有人工/远端判据**（PUB-01 / PUB-03 / D-10-2 / D-10-3 / D-10-4）+ UAT-06 的 watch 半边 `not measured`。与 03 首次审计、04 审计同类；本轮的写面被限定在本文件，故不在此轮补测试

**Approval:** partial 2026-11-26（`gsd-validate-phase` / DSH `verify:post` 的 nyquist 钩子，**State A** 审计；HEAD `68ed58a`）。
复核面 = 4/4 PLAN + 4/4 SUMMARY + `05-UAT.md` + `05-UAT-EVIDENCE.md`（判据段 1–14）+ 7 个测试文件；重跑 = 默认全量（47/40/0/7，两次）、快速回路（16/16）、UAT-04 两条（占位键，2/2）。
结论 **PARTIAL**：19 个需求 ID 全部结账（14 条有自动化断言、5 条只有人工/远端判据），执行期证据齐全且可重放，但
(1) UAT-04 的两条 hook 断言被一道它并不需要的凭据闸挡在默认回路之外（**G-1**，未修：写面限定本文件 + 禁止改 `tests/`），
(2) 5 条对外/机器级需求按定义只能人工判据，(3) watch 结构性不可测。
**本次审计的边界：** live 段未复跑（R-1）；未 spawn `gsd-nyquist-auditor` 子代理（本会话委派深度为 0，且无测试写面）；
§4 的用户门按委托方指令取保守分支（记录缺口、不新增/不改测试）。**未验证的事不会被写成已验证。**

## Validation Audit 2026-11-26

| Metric | Count |
|---|---|
| Gaps found | 1 |
| Resolved | 0 |
| Escalated | 0 |
| Requirements audited | 19 |
| Automated coverage (any form) | 14 |
| Manual-only requirements | 5 |
| Manual-only behaviors | 6 |
