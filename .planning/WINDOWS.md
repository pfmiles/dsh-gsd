---
schema_version: 1
open_count: 0
waived_count: 0
fixed_count: 3
total_count: 3
last_updated: 2026-11-11T10:05:29.012Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | build.mjs |  | gate B literal four-tree regex refined to three probes (staging prefix + machine homedir + skills-tree literal); upstream 1.20.1 narrative example paths (8 lines audited 2026-11-10) are portable content, not machine residue | fixed |  | 2026-11-10T12:47:09.723Z | 2026-11-11T10:05:28.513Z |
| 2 | 01 | deviation | tests/run-gates.sh |  | gate A 按 01-01 口径实现为双锚（gsd-core/VERSION + runtime-identity 自报），替代 plan 旧文的 require('./gsd-core/package.json') 锚点（1.20.1 staged 树无该文件）；fixture 负向经 VERSION 缺失/假内容直证；01-01-SUMMARY 交接口径 | fixed |  | 2026-11-10T13:06:49.164Z | 2026-11-11T10:05:28.763Z |
| 3 | 01 | deviation | package.json |  | Node 24.21.0 实测 'node --test tests/' 目录参数被当作模块加载而机械失败（/tmp 最小复现确认），test/prepack 采样 'node --test tests/*.test.mjs' glob 形态（node 内部 glob 展开）; plan verify ② 的逐字断言改为适配断言 | fixed |  | 2026-11-10T13:06:49.422Z | 2026-11-11T10:05:29.012Z |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "build.mjs",
    "line": null,
    "description": "gate B literal four-tree regex refined to three probes (staging prefix + machine homedir + skills-tree literal); upstream 1.20.1 narrative example paths (8 lines audited 2026-11-10) are portable content, not machine residue",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-11-10T12:47:09.723Z",
    "resolved_at": "2026-11-11T10:05:28.513Z",
    "milestone": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "01",
    "file": "tests/run-gates.sh",
    "line": null,
    "description": "gate A 按 01-01 口径实现为双锚（gsd-core/VERSION + runtime-identity 自报），替代 plan 旧文的 require('./gsd-core/package.json') 锚点（1.20.1 staged 树无该文件）；fixture 负向经 VERSION 缺失/假内容直证；01-01-SUMMARY 交接口径",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-11-10T13:06:49.164Z",
    "resolved_at": "2026-11-11T10:05:28.763Z",
    "milestone": null
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "01",
    "file": "package.json",
    "line": null,
    "description": "Node 24.21.0 实测 'node --test tests/' 目录参数被当作模块加载而机械失败（/tmp 最小复现确认），test/prepack 采样 'node --test tests/*.test.mjs' glob 形态（node 内部 glob 展开）; plan verify ② 的逐字断言改为适配断言",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-11-10T13:06:49.422Z",
    "resolved_at": "2026-11-11T10:05:29.012Z",
    "milestone": null
  }
]
````
