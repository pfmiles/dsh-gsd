---
phase: "2"
slug: "compat-matrix"
status: validated
nyquist_compliant: true
wave_0_complete: true
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
| **Estimated runtime** | ~90 秒（= build ~60 s + 测试 ~6 s；⚠️ 审计实测校准：seed 期预估 480 s 偏保守——`node --test tests/*.test.mjs` 全量 25/25 实测 6.2 s，全量构建按 02-02 实测约 1 分钟） |

> ⚠️ **计划期 checklist INFO-advisory 复核（2026-11-12 审计）**：① *test-count consistency* —— seed 期「既有 7 套 + 新增 3 套」为规划口径，实际套件现为 **5 文件 / 25 tests**（build-smoke 7 + rewrite-map 2 + compat-matrix 6 + version 3 + docs-consistency 7），`npm test` = 25/25；② *Nyquist 8b latency 偏差* —— 登记维持（任务级 full-build verify 仍为分钟级，秒级单测套件（16 tests / 0.13 s）是主反馈回路），实测反馈延迟远低于 480 s 预算。

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/*.test.mjs`（新增套件 per-commit 秒级回路；全量含 build-smoke）
- **After every plan wave:** Run `node build.mjs && node --test tests/*.test.mjs`（= prepack 全链）
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 480 seconds
- **Accepted deviation (Nyquist 8b):** 任务级 full-build 验证（pack→stage→gate 全链）本质上超过秒级反馈预算，为已记录偏差；新增 3 套零构建单测（version/compat-matrix/docs-consistency）是主反馈回路，全量构建验收归在 wave 合并级与 phase gate。
- **审计实测（2026-11-12）：** 快速回路（3 套 16 tests）= 133 ms；全量 `node --test tests/*.test.mjs`（25 tests）= 6.2 s；wave 级 prepack（build+gates+tests）≈ 66 s——全部在 480 s 预算内，偏差登记维持但余量充足。

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T2 | 02-01 | 1 | VER-01 | T-2-03 | 不兼容安装被宿主干净拒绝：engines.dsh 非空独自裁决、拒绝文案含 allow-version 指引、清单/锁文件回滚 | integration | `npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.1-rc.5 && node build/lib/compat-probe.mjs --dsh 0.2.1-rc.5 --expect reject && rm -rf node_modules`（matrix 前一行 2 格） | ✅ | ✅ green |
| 02-01-T1 | 02-01 | 1 | VER-01 | T-2-04 | 兼容安装不被误拒（当前行 0.2.2-rc.1 → install-ok） | integration | `npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@0.2.2-rc.1 && node build/lib/compat-probe.mjs --dsh 0.2.2-rc.1 --expect install-ok && rm -rf node_modules`（当前行 2 格） | ✅ | ✅ green |
| 02-03-T1 · 02-03-T2 | 02-03 | 3 | VER-01 | T-2-02 | 活体拒绝日志可解释（人读留证，DEV-03 口径） | manual-only | BUILD.md §⑧ 复验序 + doctored file: 负向探针；证据落 verify-evidence.md | — | ✅ 已执行 |
| 02-02-T1 | 02-02 | 2 | VER-02 | T-2-01 | 版本号方案 `<gsd-ver>-<rev>.dsh<line>` 格式白名单校验（rev 纯数字、线号去点） | unit | `node --test tests/version.test.mjs` | ✅ | ✅ green |
| 02-02-T2 | 02-02 | 2 | VER-02 | T-2-06 | README/BUILD.md 示例与规范一致（升级/回滚 = 同命令换 exact 版本） | static | `node --test tests/docs-consistency.test.mjs` | ✅ | ✅ green |
| 02-01-T2 | 02-01 | 1 | VER-03 | T-2-01 | `.github/workflows` 矩阵 CI：轴值为 pins.json 声明子集且含当前+前行（0.2.2-rc.1 / 0.2.1-rc.5），expect 列与支持窗一致 | static | `node --test tests/compat-matrix.test.mjs`（另：`actionlint` 0 findings） | ✅ | ✅ green |
| 02-01-T1 · 02-01-T2 ·（CI 单元） | 02-01 | 1 | VER-03 | T-2-04 | 每格「build + gates + tests」通过 = 该 (DSH 行 × GSD 版本) 构建/冒烟记录 | integration | 矩阵单元 `GSD_VERSION=<gsd> node build.mjs && node --test tests/*.test.mjs`（workflow steps：build + gates → 完整测试） | —（CI 运行） | ✅ green ⚠️ |
| 02-02-T2 | 02-02 | 2 | VER-04 | T-2-01 | `engines.node: ">=24"` 与上游 GSD engines 一致（1.20.1/1.19.0/1.16.0 均 ≥24.0.0）；README 双语声明 Node ≥ 24 | static | `node --test tests/docs-consistency.test.mjs`（断言 ①） | ✅ | ✅ green |
| 02-03-T1 · 02-03-T2 | 02-03 | 3 | DEV-03 | T-2-07 | 本 phase 完成物在 gsdtest 验证实例 gate 通过（正向三项复验 + 负向拒绝探针，证据口径 = 可观察输出 + UTC 时间戳 + 新快照声明） | manual-only | BUILD.md §⑧ 复验序；证据落 verify-evidence.md | — | ✅ 已执行 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> **审计实测（2026-11-12，nyquist-auditor 逐条复跑）：** check-pins --offline exit 0 `pins: all consistent (line dsh022)`；快速回路 3 套 16/16 pass（133 ms）；全量 `node --test tests/*.test.mjs` **25/25 pass**（6.2 s）；actionlint exit 0 无输出（0 findings）；两条宿主求值探针现场复跑——install-ok（0.2.2-rc.1）exit 0 原文 `compat-probe: install-ok confirmed (dsh 0.2.2-rc.1 satisfies engines.dsh >=0.2.2-rc.1 <0.3.0-0)`、reject（0.2.1-rc.5）exit 0 `compat-probe: reject confirmed` + `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}`，跑后 node_modules 清理。
>
> ⚠️ **VER-03 矩阵格行**：CI 首批绿按 D-R4 归 Phase 3（push 后激活）；本 phase 以本地等价证据收口——两 DSH 行双向探针实测 + GSD 轴 1.19.0 `GSD_VERSION=1.19.0 node build.mjs` exit 0（gates A/B/C）+ identity `@opengsd/gsd-core@1.19.0`（02-02 coverage D2）+ 默认 1.20.1 build/25/25 多次全绿（02-03 阶段终检 + 本次审计）——非 gap，为已记录决策。
>
> **Manual-only 三行（VER-01 活体拒绝 · DEV-03 复验 · ENGINES 人读）**：状态均由 pending 转 **✅ 已执行**——证据闭环于 verify-evidence.md Task 1（7 行实测 + 负向 stderr 全文，16:44–16:46Z）与 Task 2（五项交互段，17:54–18:06:53Z），新快照声明成立（监听 pid 95618 lstart 2026-11-11T17:38:26Z 晚于复原重装 16:46:14Z）。

---

## Wave 0 Requirements

- [x] `build/assets/pins.json` — pin/行对齐真源（check-pins 与 workflow 轴的共同消费方；02-PATTERNS ⛔ 选项 A：scripts/ 被 .gitignore 与 build.mjs 捕获段覆盖，不可用）
- [x] `build/lib/check-pins.mjs` — VER-02/HOOK-05 前置校验器（exit 2 gate 口径；exports parseVersion/validateVersion）
- [x] `build/lib/compat-probe.mjs` — VER-01 宿主求值探针（CI 单元执行件）
- [x] `tests/version.test.mjs` — 版本号方案格式单测
- [x] `tests/compat-matrix.test.mjs` — workflow 存在性/轴值与 pins.json 一致性
- [x] `tests/docs-consistency.test.mjs` — engines 声明 ↔ README 双语一致性
- [x] `.github/workflows/compat-matrix.yml` — 矩阵 CI 本体（Success Criterion 1 交付物）
- [x] `BUILD.md` 新增「版本与 pin 对齐」章（§⑨）+ README 新版本号示例与版本方案表（Success Criterion 2 文档位）
- [x] workflow 语法校验方案：actionlint 已安装（brew，1.7.12）且 **0 findings**——通过分支 exit 0，非跳过分支（ACTIONLINT_UNAVAILABLE exit 3 未触发；02-01-SUMMARY 留档）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | 状态 / 证据 |
|----------|-------------|------------|-------------------|-------------|
| 不兼容安装活体拒绝（真实验证实例） | VER-01 / DEV-03 | 宿主拒绝发生在 pnpm 运行前 + 真实 profile 安装环境，自动化 fixture 无法完整覆盖活体行为 | gsdtest profile：`dsh plugin --profile gsdtest add file:<doctored-fixture>` → stderr 拒绝文案 + allow-version 指引；证据落 verify-evidence.md | ✅ 已执行 — verify-evidence.md Task 1（2026-11-11T16:45:55Z：exit 1 + `installation rejected` + `allow-version` 双指引 + `nothing was installed`，stderr 全文照录；fixture 用后即弃 + 复原重装） |
| 兼容行安装活体验证 | VER-03 / DEV-03 | 验证实例复验口径（Phase 1 同构） | 按 BUILD.md §⑧ 复验序：/gsd-health + 独立 CLI + 版本 identity | ✅ 已执行 — Task 1（16:44:48Z `add file:. --force` exit 0；identity `@opengsd/gsd-core@1.20.1`；快照 version `1.20.1-1.dsh022`）+ Task 2（重启后 /gsd-health 0E/2W DEGRADED 良性；read 精确 .env 硬拦 exit-2 语义 + benign-ctl 对照放行；dump-config L1280/L1282 双行；comm -13 零新增 1066=1066；新快照声明 pid 95618 lstart 17:38:26Z > 复原重装 16:46:14Z） |
| ENGINES 门槛文档可解释性人读 | VER-01 | 文案质量无法自动化 | 拒绝日志人工阅卷：用户能读出「为什么拒、该装哪个」 | ✅ 已执行 — Task 2（2026-11-11T18:02:38Z 阅卷结论 = **可读**：① 为什么拒（`installation rejected … engines.dsh` 窗口不匹配）② 该装哪个（窗口覆盖 0.2.2-rc.1 的正品 `dsh-gsd@1.20.1-1.dsh022` / `compatible with this dsh runtime` 指引）③ 想硬装（`--accept-risk` = allow-version 精确豁免，README 风险声明对应）——02-03-SUMMARY D2 收档） |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 480s（审计实测：快速回路 0.13 s / 全量测试 6.2 s / prepack ≈ 66 s）
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-11-12（nyquist-auditor，State A 审计 + 全部自动化命令现场复跑绿 + manual-only 三行证据册闭环）

## Validation Audit 2026-11-11

| Metric | Count |
|---|---|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
