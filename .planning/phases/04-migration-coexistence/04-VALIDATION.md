---
phase: "04"
slug: "migration-coexistence"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-13"
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
>
> **History:** seeded from `04-RESEARCH.md` § Validation Architecture before the planner ran.
> Re-keyed to the real plan/task IDs after planning settled on **4 plans** (ROADMAP's 2-plan
> sketch was split by requirement cluster: 04-01 MIG-01+tracer, 04-02 MIG-02/MIG-03, 04-03 HOOK-05,
> 04-04 MIG-04). `/gsd-validate-phase` promotes `status: draft` → `validated`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 内置 `node --test`（Node `v24.21.0`），无第三方测试框架 |
| **Config file** | none（无 vitest/jest/pytest 配置；用例即 `tests/*.test.mjs`） |
| **Quick run command** | `npm test`（= `node --test tests/*.test.mjs`；wave 1–2 为 6 文件 / 37 用例，04-03 落 ⑭ 后为 38） |
| **Full suite command** | `node --test --test-concurrency=1 tests/*.test.mjs` |
| **Estimated runtime** | ~10–20 秒（串行） |

**串行是硬要求，不是偏好。** `build-smoke` 会重写构建树；并发运行会假红
`gate C: no SKILL.md under skills/gsd-*`。`package.json` 的 `test` 脚本与 CI 的 "full test"
步骤目前都**未**带 `--test-concurrency=1`（已知结构性假红隐患，不属本 phase 范围）。

**本 phase 的主判据不是 JS 测试，而是 shell 断言块。** MIG-01 / MIG-04 / HOOK-05 都需要真的
装一次、卸一次并观察宿主行为；D-02 禁止在真实 home 上做，D-06 禁止新增随包检测脚本。因此它们的
可执行载体是**文档里的可复制命令块 + 一次性演练留证**，而不是 `npm test` 里的用例。下表逐条区分。

---

## Sampling Rate

- **After every task commit:** `npm test`（wave 1–2：37/37；04-03 落 ⑭ 之后：38/38）。串行，且先确认没有并发 `build` 在跑。
- **After every plan wave:** `node --test --test-concurrency=1 tests/*.test.mjs` + 对临时 home 复跑本 wave 触及的 shell 判据块。
- **Before `/gsd-verify-work`:** 全量绿 + 演练日志落盘 + `docs/MIGRATION.md` 双语两半各含三节（D-10/D-11）。
- **Max feedback latency:** ~20 秒（全量串行）。

---

## Per-Task Verification Map

> 按**真实任务**键控（4 个 plan / 9 个任务）。`<automated>` 的完整命令体在各自 PLAN.md 里；
> 本表只登记任务与判据形态，不复制命令正文。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-T1 | 04-01 | 1 | MIG-01, MIG-01′ | T-4-01/02/03/04/16/17/18 | 隔离头 `export DSH_HOME` + echo；`--no-npm-bin` + `npm_config_prefix` 双保险；引擎一律绝对路径；零 `allow-version`/`--force`；两条基线前提（20 字符 home、GSD 1.16.0）**由演练自己断言** | integration（manual-only） | 04-01 T1 的 `bash` 块（四段判据，末尾 `DRILL-1 PASS`） | ❌ W0 | ⬜ pending |
| 04-01-T2 | 04-01 | 1 | MIG-03（本仓 README 半边） | T-4-05 | README 只加可达性：无字面量 `# dsh-gsd`、无第三枚徽章、无第三行裸名安装 ⇒ 双语切片点不位移 | unit（automated） | `node --test tests/docs-consistency.test.mjs`（13/13，`# dsh-gsd` 仍恰 2 次） | ✅ 已存在 | ⬜ pending |
| 04-02-T1 | 04-02 | 2 | MIG-02 | T-4-08/09 | 双语同构（两半各 2 `##` / 3 `###`，en 半零 CJK）；hooks 轴写成**归属**差异而非事件差异，且把 5 事件 / 14 matcher / 双向差集为空写进影响列 | docs（automated 形状断言） | 04-02 T1 的 `node -e` 形状门 | ❌ W0 | ⬜ pending |
| 04-02-T2 | 04-02 | 2 | MIG-03（旧仓备料半边） | T-4-07 | 只写 `docs/oldrepo-link/`，不 `git add`/commit/push、不改 remote；旧仓 HEAD `41fcc7a`、工作树空、remote 未变 | smoke（shell，只读） | 三条只读 `git -C ../install-gsd-dsh …` | ❌ W0 | ⬜ pending |
| 04-03-T1 | 04-03 | 3 | HOOK-05（静态）, HOOK-05′ | T-4-04/10 | 篡改 `lines.022.peer` 必 exit 2；复原后 `git status --porcelain build/assets/pins.json` 为空 | unit（automated） | `node build/lib/check-pins.mjs --offline`（篡改 → exit 2 → 复原 → exit 0） | ✅ `check-pins` 已存在 | ⬜ pending |
| 04-03-T2 | 04-03 | 3 | HOOK-05（运行时） | T-4-11/17 | 症状逐字且来自实测；`H1 = H0 − 1`、`N1 < N0`、`# == dsh-gsd` 标签消失、`- id: gsd` 为 0、stderr 恰 1 行；**标头数不与 bundles 长度比** | integration（manual-only） | 04-03 T2 的 `bash` 块（末尾 `DRILL-2 PASS`） | ❌ W0 | ⬜ pending |
| 04-03-T3 | 04-03 | 3 | MIG-02′, HOOK-05′ | T-4-12 | ⑭ 采用**围栏感知**的 H1 计数（行首 `# 注释` 不算标题）；①–⑬ diff 为空；`BUILD.md:16` 单行 37→38 | unit（automated） | `node --test tests/docs-consistency.test.mjs`（14/14）+ `node --test tests/*.test.mjs`（38） | ✅ 已存在 | ⬜ pending |
| 04-04-T1 | 04-04 | 4 | MIG-04（供应链门） | T-4-13/19 | `checkpoint:human-verify gate="blocking-human"`，任何模式都不自动放行；裁决写成证据册 `APPROVAL: approved\|hold` 行，**只认最后一行** | checkpoint（human） | 人工裁决；验收为证据册的 `APPROVAL:` 行 | — | ⬜ pending |
| 04-04-T2 | 04-04 | 4 | MIG-04, MIG-04′ | T-4-14/15 | 四判据集合断言（stderr 0 字节 + 同 home `H1 > H0` 且三包标签出现 + 四 id 各 1 + `uniq -d` 为空）**由可运行块现场执行**；结论带 `不能证明`/`does not prove` 边界并点名 codegraph 缺口 | integration（manual-only）+ smoke（零安装静态段） | 04-04 T2 的 `bash` 块（末尾 `COEXIST-DRILL PASS`）；静态段 `coexist-static ok` | ❌ W0（静态段零安装，可即刻跑） | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**一条不可再引入的伪不变量（T-4-17）：** 「`^# == ` 标头数 == `dsh.profile.bundles` 长度」是**假的**。
标头按**连续来源段**打，`dsh-web-app` 就地 patch base 的行，实测一个 2-bundle 的模板 profile 就打出
**24** 个标头 / 1243 行。正确形态是**同一 home 内**的前后关系（`H0` → `H1`）加逐 bundle 的**存在**断言，
且 `H0` 必须先断言非空（`-s` 且标头数 > 0），否则 0=0 会空洞成立。

**manual-only 的理由（不得省略）：** MIG-01 / MIG-04 / HOOK-05 的主判据都要求真的装/卸一次并观察
宿主行为，而 D-02 禁止在真实 home 上做、D-06 禁止新增随包检测脚本。因此它们的「自动化」形态只能是
文档里的可复制命令块 + 一次性演练留证。**planner 已把这件事写成 Task 的验收物**：
`04-DRILL-EVIDENCE.md` 的 DRILL-1 / DRILL-2 / DRILL-3 三段，且每段都被一个 token 门交叉核对
（只写 token 而不贴现场输出会被挡下），否则这三条无法在 verifier 面前举证。

---

## Wave 0 Requirements

- [ ] `docs/MIGRATION.md` —— 三节双语同构（D-10/D-11），且 §① 同时给出 0-A 演练场与 0-B 真实迁移两个迁移场；01/03 两轮都栽在「只写一半」，需「zh/en 各含该节标题 + en 半零 CJK」的可 grep 判据。
- [ ] runbook 的命令块（Runtime State Inventory A–D + Code Examples 复验 A/B/C）—— MIG-01/04/HOOK-05 的唯一可执行载体。
- [ ] 旧仓备料：`docs/oldrepo-link/` 四文件（`snippet.en.md` 为唯一可推件、`snippet.zh.md` 标「备而不用」、`README.md`、`pr.md`）+ 章节锚点「`## Quick start` 之前」+ PR title/body（D-09）。
- [ ] 演练日志留证：`04-DRILL-EVIDENCE.md` 的 DRILL-1/2/3 三段 + `APPROVAL:` 行（MIG-01/MIG-04/HOOK-05 三条 manual-only 的证据册）。
- [ ] **必需（不再是可选）**：`tests/docs-consistency.test.mjs` 追加 ⑭（README 顶部 MIGRATION 入口），**同一提交**同步 `BUILD.md:16` 的活体计数 37 → 38（04-03 T3；`BUILD.md` 保持单行 diff）。
- [x] 无新框架安装需求（`node --test` 已就位）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 先卸后装后旧源全灭 + 新源可举证 | MIG-01 | 需真实 installer + 网络 + 临时 home；D-02 禁止在真实 home 做 | 临时 `DSH_HOME`（恰 20 字符）内跑 `GSD_VERSION=1.16.0` 旧脚本 → **先断言版本前提** → 量基线（72 技能 / 3084 / 3195 / bridge 命中）→ D-03 硬门 → `--uninstall` → 阴性对照 A–D（机器级一面分 `ABSENT`/`PRESENT`）→ `npm pack` → `dsh plugin add` → 内容比对（3587 / 3856 / 72）。留 DRILL-1 日志 |
| 同 profile 多 bundle 并存无冲突 | MIG-04 | 需在临时 home 联网安装两个 `SUS` 第三方包才证明「同层合成」，故前置 `blocking-human` 门 | 四判据的合取：stderr **0 字节**；**同一 home** 的 `H1 > H0`（`H0` 装任何包之前取，且必须 `> 0`）且 `dsh-gsd` / `dsh-deja` / `dshmarket` 三包标头标签各**出现**；`gsd` / `gsd-hooks-bridge` / `deja` / `dsh-market` 四 id 各恰 1 行；这四者 `uniq -d` 为空。**不得**用 exit code（实测恒 0），**不得**用「标头数 == bundles 长度」（T-4-17） |
| 三类错配各有一条实测症状 → 原因 → 修复 | HOOK-05 | 需注入错配并观察宿主真实反应 | 静态：篡改 `lines.022.peer` → `check-pins` exit 2 → 复原 → exit 0 且 `git status` 空。运行时：改包内 `engines.dsh` → dump 的 `H1 = H0 − 1`、标签消失、rows 0、stderr 恰 1 行且 **exit 仍 0**（假绿证据）。症状须实测，不得由源码推导代填；未复现的写 `NOT REPRODUCED:` |
| 旧脚本定位为保底/离线可被验证 | MIG-03 | 需读旧仓 README 并真跑离线模式 | 备料片段与 PR body 落盘；旧仓 HEAD/工作树/remote 保持只读核验；离线模式可用性由 Pitfall 13 结论约束 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending