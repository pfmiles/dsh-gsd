---
phase: "2"
slug: "compat-matrix"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-11"
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> 依据 02-RESEARCH.md §Validation Architecture（Nyquist on）seeded；执行后经 gsd-validate-phase 审计收敛（status: validated）。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test（Node ≥24 内置 test runner + node:assert/strict，零第三方、零安装） |
| **Config file** | none — 既有 glob 形态 `node --test tests/*.test.mjs`（Node v24.21.0 实测目录参数机械失败，glob 形态已固化于 STATE.md 决策） |
| **Quick run command** | `node --test tests/version.test.mjs tests/compat-matrix.test.mjs tests/docs-consistency.test.mjs`（新增 3 套 per-commit 快速回路） |
| **Full suite command** | `node build.mjs && node --test tests/*.test.mjs`（= prepack，gates 内嵌 build） |
| **Estimated runtime** | ~480 秒（含真实构建 smoke；既有 7 套 + 新增 3 套） |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/*.test.mjs`（新增套件 per-commit 秒级回路；全量含 build-smoke）
- **After every plan wave:** Run `node build.mjs && node --test tests/*.test.mjs`（= prepack 全链）
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 480 seconds
- **Accepted deviation (Nyquist 8b):** 任务级 full-build 验证（pack→stage→gate 全链）本质上超过秒级反馈预算，为已记录偏差；新增 3 套零构建单测（version/compat-matrix/docs-consistency）是主反馈回路，全量构建验收归在 wave 合并级与 phase gate。

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | — | VER-01 | TBD | 不兼容安装被宿主干净拒绝：engines.dsh 非空独自裁决、拒绝文案含 allow-version 指引、清单/锁文件回滚 | integration | `npm i --no-save --no-package-lock @deepseek-ai/dsh@<line> && node build/lib/compat-probe.mjs --dsh <line> --expect reject`（matrix 前一行 2 格） | ❌ W0 | ⬜ pending |
| TBD | TBD | — | VER-01 | TBD | 兼容安装不被误拒（当前行 0.2.2-rc.1 → install-ok） | integration | 同上 `--expect install-ok`（当前行 2 格） | ❌ W0 | ⬜ pending |
| TBD | TBD | — | VER-01 | TBD | 活体拒绝日志可解释（人读留证，DEV-03 口径） | manual-only | RESEARCH §Code Examples [4] 负向 file: 探针 + verify-evidence.md | — | ⬜ pending |
| TBD | TBD | — | VER-02 | TBD | 版本号方案 `<gsd-ver>-<rev>.dsh<line>` 格式白名单校验（rev 纯数字、线号去点） | unit | `node --test tests/version.test.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | VER-02 | TBD | README/BUILD.md 示例与规范一致（升级/回滚 = 同命令换 exact 版本） | static | `node --test tests/docs-consistency.test.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | VER-03 | TBD | `.github/workflows` 矩阵 CI：轴值为 pins.json 声明子集且含当前+前行（0.2.2-rc.1 / 0.2.1-rc.5），expect 列与支持窗一致 | static | `node --test tests/compat-matrix.test.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | VER-03 | TBD | 每格「build + gates + tests」通过 = 该 (DSH 行 × GSD 版本) 构建/冒烟记录 | integration | 矩阵单元 `GSD_VERSION=<gsd> node build.mjs && node --test tests/*.test.mjs` | —（CI 运行） | ⬜ pending |
| TBD | TBD | — | VER-04 | TBD | `engines.node: ">=24"` 与上游 GSD engines 一致（1.20.1/1.19.0/1.16.0 均 ≥24.0.0）；README 双语声明 Node ≥ 24 | static | `node --test tests/docs-consistency.test.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | — | DEV-03 | TBD | 本 phase 完成物在 gsdtest 验证实例 gate 通过（正向三项复验 + 负向拒绝探针，证据口径 = 可观察输出 + UTC 时间戳 + 新快照声明） | manual-only | BUILD.md §⑧ 复验序；证据落 verify-evidence.md | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `build/assets/pins.json` — pin/行对齐真源（check-pins 与 workflow 轴的共同消费方；02-PATTERNS ⛔ 选项 A：scripts/ 被 .gitignore 与 build.mjs 捕获段覆盖，不可用）
- [ ] `build/lib/check-pins.mjs` — VER-02/HOOK-05 前置校验器（exit 2 gate 口径）
- [ ] `build/lib/compat-probe.mjs` — VER-01 宿主求值探针（CI 单元执行件）
- [ ] `tests/version.test.mjs` — 版本号方案格式单测
- [ ] `tests/compat-matrix.test.mjs` — workflow 存在性/轴值与 pins.json 一致性
- [ ] `tests/docs-consistency.test.mjs` — engines 声明 ↔ README 双语一致性
- [ ] `.github/workflows/compat-matrix.yml` — 矩阵 CI 本体（Success Criterion 1 交付物）
- [ ] `BUILD.md` 新增「版本与 pin 对齐」章 + README 新版本号示例（Success Criterion 2 文档位）
- [ ] workflow 语法校验方案：actionlint 未装 → 装或一次人工 Review（RESEARCH §11）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 不兼容安装活体拒绝（真实验证实例） | VER-01 / DEV-03 | 宿主拒绝发生在 pnpm 运行前 + 真实 profile 安装环境，自动化 fixture 无法完整覆盖活体行为 | gsdtest profile：`dsh plugin --profile gsdtest add file:<doctored-fixture>` → stderr 拒绝文案 + allow-version 指引；证据落 verify-evidence.md |
| 兼容行安装活体验证 | VER-03 / DEV-03 | 验证实例复验口径（Phase 1 同构） | 按 BUILD.md §⑧ 复验序：/gsd-health + 独立 CLI + 版本 identity |
| ENGINES 门槛文档可解释性人读 | VER-01 | 文案质量无法自动化 | 拒绝日志人工阅卷：用户能读出「为什么拒、该装哪个」 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 480s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
