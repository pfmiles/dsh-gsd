---
phase: 04
review: 04-REVIEW.md
titles: json
findings:
  - id: WR-04
    severity: warning
    disposition: fixed
    title: "「runbook 里恰有两个块以退出码为判据」为假——静态段也是（zh / en / 证据册三处）"
  - id: WR-05
    severity: warning
    disposition: fixed
    title: "`COEXIST-REAL` 的标签判据没有实现它自己写下的 `# == …, patched by <bundle>` 形态"
  - id: IN-05
    severity: info
    disposition: fixed
    title: "演练块的三个 `<version>` 让整块无法解析（`bash -n` 红），且一个占位符被三个不同的包共用"
  - id: IN-06
    severity: info
    disposition: fixed
    title: "en 半把 3587/3856/72 叫成 \"the last three rows\"，与紧邻的 \"the last row (`24 → 25`)\" 自相矛盾"
  - id: WR-01
    severity: warning
    disposition: fixed
    title: "步骤 1 声明\"两个面\"，但块里没有面 1（技能）的任何命令"
  - id: WR-02
    severity: warning
    disposition: fixed
    title: "步骤 6 的\"真实 home 重跑同一组命令\"与第 ② 条判据 `H1 > H0` 互斥——健康系统上必红"
  - id: WR-03
    severity: warning
    disposition: fixed
    title: "① 的示例说明在 zh 半边把\"哪些行会变\"说错，并与 en 半边、与 `:27` 的公式三方矛盾"
  - id: IN-01
    severity: info
    disposition: fixed
    title: "步骤 6 静态块违反文档自己的\"每个可粘贴块第一行都是 `export DSH_HOME=`\"不变量，且只在仓根可用"
  - id: IN-02
    severity: info
    disposition: fixed
    title: "机器级那一面在\"文件存在且干净\"时多打一行 `0`"
  - id: IN-03
    severity: info
    disposition: fixed
    title: "旧仓清点有两个可核对的偏差（行数 315→314；章节链漏了 `## Compatibility`）"
  - id: IN-04
    severity: info
    disposition: fixed
    title: "守卫 ⑭ 的说明与断言消息引用了不存在的 `# 步骤 N`，计数也已过期（28→30）"
open: 0
total: 11
recorded: 2026-11-15T03:23:03.375Z
---

# Phase 04: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-04 | warning | fixed | 04-REVIEW-FIX.md |
| WR-05 | warning | fixed | 04-REVIEW-FIX.md |
| IN-05 | info | fixed | 04-REVIEW-FIX.md |
| IN-06 | info | fixed | 04-REVIEW-FIX.md |
| WR-01 | warning | fixed | 04-05 1a6f437 (re-review a0730e5) |
| WR-02 | warning | fixed | 04-05 8dfeafe (re-review a0730e5) |
| WR-03 | warning | fixed | 04-05 a7db7a6 (re-review a0730e5) |
| IN-01 | info | fixed | 04-05 8dfeafe (re-review a0730e5) |
| IN-02 | info | fixed | 04-05 a7db7a6 (re-review a0730e5) |
| IN-03 | info | fixed | 04-05 a7db7a6 (re-review a0730e5) |
| IN-04 | info | fixed | 04-REVIEW-FIX.md |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
