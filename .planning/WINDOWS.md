---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-11-10T12:47:09.723Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | build.mjs |  | gate B literal four-tree regex refined to three probes (staging prefix + machine homedir + skills-tree literal); upstream 1.20.1 narrative example paths (8 lines audited 2026-11-10) are portable content, not machine residue | open |  | 2026-11-10T12:47:09.723Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "build.mjs",
    "line": null,
    "description": "gate B literal four-tree regex refined to three probes (staging prefix + machine homedir + skills-tree literal); upstream 1.20.1 narrative example paths (8 lines audited 2026-11-10) are portable content, not machine residue",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-11-10T12:47:09.723Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
