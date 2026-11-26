---
phase: 05
review: 05-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: fixed
    title: "①② 的 skip 门比用例实际需要宽 —— 凭据 / `zstd` / tarball 与两条 hook 用例无关，而它们因此在 `npm test` 与 CI 里永不执行"
  - id: WR-02
    severity: warning
    disposition: fixed
    title: "`BUILD.md:110-111` 仍把 prepack / test 写成没有 `--test-concurrency=1` 的形态 —— 与本 phase 改过的 `package.json` 直接矛盾，且 ⑮ 按设计不覆盖它"
  - id: IN-01
    severity: info
    disposition: fixed
    title: "⑯ 数的是源码 `^test(` 行数，不是 runner 注册数 —— `test.skip(` / `test.todo(` / 嵌套注册会让 `BUILD.md:16` 的计数静默变旧而 ⑯ 仍绿"
  - id: IN-02
    severity: info
    disposition: fixed
    title: "`DSH_UAT_TGZ` 指向不存在的路径时，skip 理由说「unset」，并报告一个从未被查询过的目录"
open: 0
total: 4
recorded: 2026-11-26T07:45:14.745Z
---

# Phase 05: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | fixed | aab3976 |
| WR-02 | warning | fixed | aab3976 |
| IN-01 | info | fixed | aab3976 |
| IN-02 | info | fixed | aab3976 |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
