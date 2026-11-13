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
> **Seed note:** seeded from `04-RESEARCH.md` § Validation Architecture before the planner ran, so
> the Per-Task Verification Map is keyed by requirement, not by task ID. Plan-phase fills task IDs;
> `/gsd-validate-phase` promotes `status: draft` → `validated`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 内置 `node --test`（Node `v24.21.0`），无第三方测试框架 |
| **Config file** | none（无 vitest/jest/pytest 配置；用例即 `tests/*.test.mjs`） |
| **Quick run command** | `npm test`（= `node --test tests/*.test.mjs`；当前 6 文件 / 37 顶层用例） |
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

- **After every task commit:** `npm test`（37/37；若追加 ⑭ 断言则 38/38）。串行，且先确认没有并发 `build` 在跑。
- **After every plan wave:** `node --test --test-concurrency=1 tests/*.test.mjs` + 对临时 home 复跑本 wave 触及的 shell 判据块。
- **Before `/gsd-verify-work`:** 全量绿 + 演练日志落盘 + `docs/MIGRATION.md` 双语两半各含三节（D-10/D-11）。
- **Max feedback latency:** ~20 秒（全量串行）。

---

## Per-Task Verification Map

> 任务号由 planner 落号后回填；此处按 requirement 粒度给出**已验证的**判据形态。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 待 planner 落号 | 04-01 | TBD | MIG-01 | T-4-01 / T-4-02 | 演练脚本首行声明 `DSH_HOME` 与 npm prefix，绝不落到真实 home | integration（manual-only） | `DSH_HOME=$(mktemp -d) bash <旧仓>/install-gsd-dsh.sh --no-npm-bin && … --uninstall && dsh plugin --profile web add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"` 后跑 Runtime State Inventory A–D | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-01 | TBD | MIG-01′ | T-4-03 | 引擎调用写绝对路径，不依赖 PATH | smoke（shell，零安装） | `ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null \| wc -l`（期望 0）+ `grep -l 'GSD-DSH-bridge BEGIN' …`（期望无输出） | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-02 | TBD | MIG-02 | — | N/A | docs（automated：与实测值比对） | 三轴事实源：`readlink -f "$(command -v gsd_run)"`、`npm ls -g --depth=0 \| grep gsd-core`、`jq -r '.[].matcher' config/gsd-hooks.json \| sort \| uniq -c` 与 `~/.dsh/gsd-hooks.dsh.json` 同命令对比 | ⚠ 部分（hooks 事件集合 Phase 2 已固化） | ⬜ pending |
| 待 planner 落号 | 04-02 | TBD | MIG-02′ | — | N/A | unit（automated） | 追加到 `tests/docs-consistency.test.mjs` 的断言（如「MIGRATION.md 同时含 `dsh plugin` 与 `install-gsd-dsh.sh`」）—— Discretion，planner 定 | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-02 | TBD | MIG-03 | — | N/A | docs（manual-only：需读旧仓 README 与真跑离线模式） | 备料片段 + PR body 落盘（D-09） | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-01 | TBD | MIG-04 | T-4-06 | 三方包合法性门为 `SUS/too-new`；确需安装时加 `checkpoint:human-verify`，演练后清理临时 home | integration（manual-only） | Code Examples「复验 B」四段（层数 / stderr 空 / id 无重复 / 期望 5 行） | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-02 | TBD | MIG-04′ | — | N/A | smoke（shell，零安装） | 对真实 `web` 的三个插件 `cordis.patch.yml` 做 id 集合比对（`grep -h '^- id:' …`） | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-01 | TBD | HOOK-05 | T-4-04 | 演练日志显式断言「**没有**出现 `allow-version` / `Exact-version exemption: active`」 | integration（manual-only） | Code Examples「复验 A」：改 `engines.dsh` → `--dump-config`（exit 0 + stderr 1 行）；改 bridge 包版本 → boot 观测；改 `pins.json` → `node build/lib/check-pins.mjs`（静态，exit 2） | ❌ W0 | ⬜ pending |
| 待 planner 落号 | 04-01 | TBD | HOOK-05′ | — | N/A | unit（automated） | `node build/lib/check-pins.mjs --offline`（或 `npm test` 的 docs-consistency ②） | ✅ 已存在 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**manual-only 的理由（不得省略）：** MIG-01 / MIG-04 / HOOK-05 的主判据都要求真的装/卸一次并观察
宿主行为，而 D-02 禁止在真实 home 上做、D-06 禁止新增随包检测脚本。因此它们的「自动化」形态只能是
文档里的可复制命令块 + 一次性演练留证。**planner 必须把「演练留证」（日志/输出粘贴进 SUMMARY）
写成 Task 的验收物**，否则这三条无法在 verifier 面前举证。

---

## Wave 0 Requirements

- [ ] `docs/MIGRATION.md` —— 三节双语同构（D-10/D-11）；01/03 两轮都栽在「只写一半」，需加「zh/en 各含 3 个二级标题」的可 grep 判据。
- [ ] runbook 的命令块（Runtime State Inventory A–D + Code Examples 复验 A/B/C）—— MIG-01/04/HOOK-05 的唯一可执行载体。
- [ ] 旧仓备料：`docs/` 下的粘贴片段（README 顶部中英各一份）+ 建议插入位置（章节锚点：「`## Quick start` 之前」）+ PR title/body（D-09）。
- [ ] 演练日志留证（MIG-01/MIG-04/HOOK-05 三条 manual-only 的证据册）。
- [ ] **可选**：`tests/docs-consistency.test.mjs` 追加 ⑭（README 顶部 MIGRATION 入口），并同步 `BUILD.md:16` 的活体计数。
- [x] 无新框架安装需求（`node --test` 已就位）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 先卸后装后旧源全灭 + 新源可举证 | MIG-01 | 需真实 installer + 网络 + 临时 home；D-02 禁止在真实 home 做 | 临时 `DSH_HOME` 内跑旧脚本 install → `--uninstall` → `dsh plugin add <tgz>` → 逐条跑 A–D 只读举证命令，留日志 |
| 同 profile 多 bundle 并存无冲突 | MIG-04 | 需在临时 home 联网安装三个 `SUS` 第三方包才证明「同层合成」 | 四段断言：层数 == `dsh.profile.bundles` 长度；stderr 为空；`uniq -d` 为空且期望 id 各 1 次；期望 5 行。**不得用 exit code 判定** |
| 三类错配各有一条实测症状 → 原因 → 修复 | HOOK-05 | 需注入错配并观察宿主真实反应 | 复验 A 三小段：改 `engines.dsh` → `--dump-config`（exit 0 + stderr 1 行）；改 bridge 包版本 → boot 观测；改 `pins.json` → 静态 `check-pins`（exit 2）。症状须实测，不得由源码推导代填 |
| 旧脚本定位为保底/离线可被验证 | MIG-03 | 需读旧仓 README 并真跑离线模式 | 备料片段与 PR body 落盘；离线模式可用性由 Pitfall 13 结论约束 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending