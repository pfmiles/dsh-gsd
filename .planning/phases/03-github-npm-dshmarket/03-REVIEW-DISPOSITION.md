---
phase: 03
review: 03-REVIEW.md
titles: json
findings:
  - id: CR-01
    severity: critical
    disposition: fixed
    title: "`index.js` 把 `skills/` 解析到包外一级 —— 装成后技能 provider 指向不存在的目录（Critical，scope 外既有缺陷）"
  - id: WR-01
    severity: warning
    disposition: fixed
    title: "`pack-contents` 白名单守卫只有「排除」方向 —— 从 `files` 删掉任何一个必需品仍全绿"
  - id: WR-02
    severity: warning
    disposition: fixed
    title: "⑨ 的徽章断言单条正则即可满足 —— 删掉 DSH 徽章或把徽章挪到标题下方都不会红"
  - id: WR-03
    severity: warning
    disposition: fixed
    title: "⑫ 只数「全文件 2 条」而不按 zh/en 两半各断言 1 条 —— 英文半区丢失仍绿"
  - id: IN-01
    severity: info
    disposition: fixed
    title: "⑧ 的 `matrix.expect` 计数把注释也算进去 —— 一句说明性注释就会误红"
  - id: IN-02
    severity: info
    disposition: skipped
    title: "绿色 CI 只覆盖到 `20e20c0`；HEAD 的 5 条提交（含全部新守卫）从未在 CI 执行；本地 `origin/main` 是陈旧引用"
open: 0
total: 6
recorded: 2026-11-12T14:15:57.258Z
---

# Phase 03: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| CR-01 | critical | fixed | fixed in 49c0efe — pluginRoot 改为 dirname(fileURLToPath(import.meta.url))，同时删掉未用的 resolve 导入；守卫 = tests/pack-contents.test.mjs ④，重新引入 '..' 恰 ④ 红（tests 4 / pass 3 / fail 1），复原 4/4 |
| WR-01 | warning | fixed | fixed in 49c0efe — ① 补上包含方向：必需集 = ALLOWED_TOP_LEVEL 减去 NPM_ALWAYS_INCLUDED（package.json / README.md / LICENSE）；删掉 skills+gsd-core+scripts 时仅 ① 红 |
| WR-02 | warning | fixed | fixed in 49c0efe — ⑨ 断言恰 2 枚徽章、都在首个 # dsh-gsd 之前，且一枚 ./LICENSE+MIT、一枚 DSH；删 DSH 徽章或把两枚整体下移都会红 |
| WR-03 | warning | fixed | fixed in 49c0efe — ⑫ 追加 readmeZh 恰 1、readmeEn 恰 1；2/0 分布变异会红 |
| IN-01 | info | fixed | fixed in 49c0efe — ⑧ 先剥整行注释再计数：注释里提到 matrix.expect 仍绿，真实的第二处未门控用法仍红 |
| IN-02 | info | skipped | accepted / won't-fix（本 phase 不修）— 权威远端 sha 取自 gh api repos/pfmiles/dsh-gsd/commits/main，而不是陈旧的 origin/main tracking ref；再次 push 会产生第二个 CI run，属人工决策而非缺陷 |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
