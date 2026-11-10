---
phase: "1"
slug: "build-mjs"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-10"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> 依据 01-RESEARCH.md §Validation Architecture。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test（Node ≥24 内置 test runner，零新依赖） |
| **Config file** | none — `node --test tests/` 即全量 |
| **Quick run command** | `node --test tests/rewrite-map.test.mjs` |
| **Full suite command** | `node build.mjs && node --test tests/ && bash tests/run-gates.sh` |
| **Estimated runtime** | ~60-120 seconds（含一次真实 pack → stage → gate 循环） |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/rewrite-map.test.mjs`（秒级）
- **After every plan wave:** Run `node build.mjs && node --test tests/ && bash tests/run-gates.sh`（全量 smoke）
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds
- **Accepted deviation (Nyquist 8b):** 任务级 full-build 验证（pack→stage→gate 全链）本质上超过 ~30 s 反馈预算，为已记录偏差；秒级 per-commit 单测（rewrite-map.test / run-gates 于 fixture）是主反馈回路，全量构建验收归在 wave 合并级与 phase gate。

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01 (plan) | 01 | 1 | SKIL-03 | T-1-02 / — | ①/④ 档离线 .tgz 经 shasum-512 对照 SBOM 后解包 | smoke | `node -e "const r=require('child_process').execSync('node gsd-core/bin/gsd-tools.cjs runtime-identity --raw');const j=JSON.parse(r);if(j.packageName!=='@opengsd/gsd-core'||j.version!==process.env.GSD_VERSION)process.exit(1)"` | ❌ W0 | ⬜ pending |
| 01-02 (plan) | 01 | 1 | SKIL-04 | T-1-01 / T-1-03 | 产物树零残留机器绝对路径；72 个 SKILL.md 各恰一个 adapter 块 | gate/smoke | `bash tests/run-gates.sh`（gate A 版本交叉校验 + gate B 绝对路径 + gate C adapter 计数） | ❌ W0 | ⬜ pending |
| 01-02 (plan) | 04 | 1 | INST-02 | T-1-02 | 产物树无 `~/.dsh` 托管字面量，安装不写受管文件 | smoke | `grep -RIl '~/.dsh' skills/ gsd-core/ hooks/ config/ && exit 1` | ❌ W0 | ⬜ pending |
| 01-03 (plan) | 01 | 1 | DEV-03 | T-1-05 | 验证实例（gsdtest/3091）三项复验：`/gsd-health` + 独立 CLI + `.env` 拦截 | manual-only | `dsh plugin --profile gsdtest add file:… --force` → 重启 → `/gsd-health` + 独立 CLI + read `.env` 被拦（exit 2）。需运行中 DSH 实例，无法 CI 自动化 | ❌ W0（01-03 文档化序） | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `build/lib/rewrite-map.cjs` — 把 build.mjs 的 REWRITES 提成纯模块（makeRewrites(stagingRoot)，可单测）
- [ ] `tests/rewrite-map.test.mjs` — covers SKIL-04 映射正确性（staging 根 from、`~/`、`$HOME` 回退形态）
- [ ] `tests/build-smoke.test.mjs` — covers SKIL-03 + SKIL-04 + INST-02 产物断言
- [ ] `tests/run-gates.sh` — gate A/B/C 独立脚本（CI/prepack 直接调用）
- [ ] `package.json` 增 `"test": "node --test tests/"`（prepack 链上加 gate 调用）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 验证实例三项复验 | DEV-03 | 需要运行中的 DSH 实例（127.0.0.1:3091）+ 交互式 skill 确认，无法 CI 自动化 | 01-03 计划内：`--force` 重装 → 重启 → `/gsd-health` 成功 + 独立 CLI 输出身份 JSON + 模型 read `.env` 被 guard 硬拦并记录证据 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
