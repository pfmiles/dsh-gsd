---
phase: 02
review: 02-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: fixed
    title: "parseVersion 白名单放行 semver 非法的版本串（前导零 / rev=0）"
  - id: WR-02
    severity: warning
    disposition: fixed
    title: "bridge pin 对照单向——pins 行缺 `bridge` 键或 deps 多出条目时静默通过"
  - id: WR-03
    severity: warning
    disposition: fixed
    title: "workflow_dispatch 的 dsh/gsd「manual override」输入从未消费——死输入误导操作者"
  - id: WR-04
    severity: warning
    disposition: fixed
    title: "轴值一致性测试只验 pins→workflow 单向，幽灵格/冗余格/子串误配均漏检"
  - id: IN-01
    severity: info
    disposition: fixed
    title: "BUILD.md TL;DR 的测试计数已过期（7/7 vs 实际 25/25）"
  - id: IN-02
    severity: info
    disposition: fixed
    title: "compat-probe 对 CLI 用法错误返回 exit 2，与头注释的 1=IO·parse 契约有分歧"
  - id: IN-03
    severity: info
    disposition: fixed
    title: "check-pins registry 取样 spawnSync 无显式 timeout"
open: 0
total: 7
recorded: 2026-11-11T19:21:43.159Z
---

# Phase 02: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | fixed | 02-REVIEW-FIX.md |
| WR-02 | warning | fixed | 02-REVIEW-FIX.md |
| WR-03 | warning | fixed | 02-REVIEW-FIX.md |
| WR-04 | warning | fixed | 02-REVIEW-FIX.md |
| IN-01 | info | fixed | 02-REVIEW-FIX.md |
| IN-02 | info | fixed | 02-REVIEW-FIX.md |
| IN-03 | info | fixed | 02-REVIEW-FIX.md |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
