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
| **Estimated runtime** | ~10–45 秒（暖缓存实测：`node build.mjs` 3.9–14.5 s + 全量 `node --test tests/*.test.mjs` 26 tests 5.1–29.1 s；首轮冷取件再 +~60 s，最坏仍 < 480 s 预算——seed 期预估 480 s 偏保守） |

> ⚠️ **计划期 checklist INFO-advisory 复核（2026-11-12 审计，HEAD 84784f1 复测）**：① *test-count consistency* —— seed 期「既有 7 套 + 新增 3 套」为规划口径，实际套件现为 **5 文件 / 26 tests**（build-smoke 2 + rewrite-map 7 + compat-matrix 7 + version 3 + docs-consistency 7），`npm test` = 26/26；快速回路 3 套 = 17 tests；② *Nyquist 8b latency 偏差* —— 登记维持（任务级 full-build verify 仍为分钟级，秒级单测套件（17 tests / 0.30 s）是主反馈回路），实测反馈延迟远低于 480 s 预算。

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/*.test.mjs`（新增套件 per-commit 秒级回路；全量含 build-smoke）
- **After every plan wave:** Run `node build.mjs && node --test tests/*.test.mjs`（= prepack 全链）
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 480 seconds
- **Accepted deviation (Nyquist 8b):** 任务级 full-build 验证（pack→stage→gate 全链）本质上超过秒级反馈预算，为已记录偏差；新增 3 套零构建单测（version/compat-matrix/docs-consistency）是主反馈回路，全量构建验收归在 wave 合并级与 phase gate。
- **审计实测（2026-11-12，HEAD 84784f1）：** 快速回路（3 套 17 tests）= 0.30 s（runner 计时 225 ms）；全量 `node --test tests/*.test.mjs`（26 tests）= 5.1–29.1 s（build-smoke 内嵌真实构建，暖/冷缓存差异）；wave 级 prepack（build+gates+tests）≈ 10–45 s（冷取件首轮再 +~60 s）——全部在 480 s 预算内，偏差登记维持但余量充足。

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T2 | 02-01 | 1 | VER-01 | T-2-03 | 不兼容安装被宿主干净拒绝：engines.dsh 非空独自裁决、拒绝文案含 allow-version 指引、清单/锁文件回滚 | integration | `npm install --no-save --ignore-scripts --no-package-lock --force @deepseek-ai/dsh@0.2.1-rc.5 && node build/lib/compat-probe.mjs --dsh 0.2.1-rc.5 --expect reject && rm -rf node_modules`（matrix 前一行 2 格） | ✅ | ✅ green |
| 02-01-T1 | 02-01 | 1 | VER-01 | T-2-04 | 兼容安装不被误拒（当前行 0.2.2-rc.1 → install-ok） | integration | `npm install --no-save --ignore-scripts --no-package-lock --force @deepseek-ai/dsh@0.2.2-rc.1 && node build/lib/compat-probe.mjs --dsh 0.2.2-rc.1 --expect install-ok && rm -rf node_modules`（当前行 2 格） | ✅ | ✅ green |
| 02-03-T1 · 02-03-T2 | 02-03 | 3 | VER-01 | T-2-02 | 活体拒绝日志可解释（人读留证，DEV-03 口径） | manual-only | BUILD.md §⑧ 复验序 + doctored file: 负向探针；证据落 verify-evidence.md | — | ✅ 已执行 |
| 02-02-T1 | 02-02 | 2 | VER-02 | T-2-01 | 版本号方案 `<gsd-ver>-<rev>.dsh<line>` 格式白名单校验（rev 纯数字、线号去点） | unit | `node --test tests/version.test.mjs` | ✅ | ✅ green |
| 02-02-T2 | 02-02 | 2 | VER-02 | T-2-06 | README/BUILD.md 示例与规范一致（升级/回滚 = 同命令换 exact 版本） | static | `node --test tests/docs-consistency.test.mjs` | ✅ | ✅ green |
| 02-01-T2 | 02-01 | 1 | VER-03 | T-2-01 | `.github/workflows` 矩阵 CI：轴值为 pins.json 声明子集且含当前+前行（0.2.2-rc.1 / 0.2.1-rc.5），expect 列与支持窗一致 | static | `node --test tests/compat-matrix.test.mjs`（另：`actionlint` 0 findings） | ✅ | ✅ green |
| 02-01-T1 · 02-01-T2 ·（CI 单元） | 02-01 | 1 | VER-03 | T-2-04 | 每格「build + gates + tests」通过 = 该 (DSH 行 × GSD 版本) 构建/冒烟记录 | integration | 矩阵单元 `GSD_VERSION=<gsd> node build.mjs && node --test tests/*.test.mjs`（workflow steps：build + gates → 完整测试） | —（CI 运行） | ✅ green ⚠️（CI 安装步 registry 漂移已 ESCALATE，见下注） |
| 02-02-T2 | 02-02 | 2 | VER-04 | T-2-01 | `engines.node: ">=24"` 与上游 GSD engines 一致（1.20.1/1.19.0/1.16.0 均 ≥24.0.0）；README 双语声明 Node ≥ 24 | static | `node --test tests/docs-consistency.test.mjs`（断言 ①） | ✅ | ✅ green |
| 02-03-T1 · 02-03-T2 | 02-03 | 3 | DEV-03 | T-2-07 | 本 phase 完成物在 gsdtest 验证实例 gate 通过（正向三项复验 + 负向拒绝探针，证据口径 = 可观察输出 + UTC 时间戳 + 新快照声明） | manual-only | BUILD.md §⑧ 复验序；证据落 verify-evidence.md | — | ✅ 已执行 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> **审计实测（2026-11-12，nyquist-auditor 逐条复跑，HEAD 84784f1；审计基线 e81d8e9，两者间仅 `.planning` 文档提交、实现与测试树零 diff）：** check-pins --offline exit 0 `pins: all consistent (line dsh022)`（在线档同绿）；快速回路 3 套 **17/17 pass**（0.30 s）；全量 `node --test tests/*.test.mjs` **26/26 pass**（5.1–29.1 s，build-smoke 内嵌真实构建；审计期间工作区存在并发 build 进程，build-smoke 曾因 `.gsd-build-tmp`/产物树竞态假红一次，隔离后复跑 26/26）；actionlint 1.7.12 exit 0 无输出（0 findings）；`node build.mjs` exit 0 `gates: all passed (A/B/C)`（76 trees / 286 files / 72 skills）；`GSD_VERSION=1.19.0 node build.mjs` exit 0 + identity `{"packageName":"@opengsd/gsd-core","version":"1.19.0"}`（GSD 轴第二值复跑）；两条宿主求值探针现场复跑——install-ok（0.2.2-rc.1）exit 0 原文 `compat-probe: install-ok confirmed (dsh 0.2.2-rc.1 satisfies engines.dsh >=0.2.2-rc.1 <0.3.0-0)`、reject（0.2.1-rc.5）exit 0 `compat-probe: reject confirmed` + `{"engines.dsh":">=0.2.2-rc.1 <0.3.0-0"}`，跑后 node_modules 清理。
>
> ⚠️ **宿主行安装命令已因上游 registry 漂移失效（2026-11-12 发现，安装步已按 `--force` 校正并复跑绿）**：`npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<line>` 在 HEAD 以 ERESOLVE 失败——`@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.2` / `@deepseek-ai/dsh-fs@0.2.2-rc.2` 于 2026-11-12T02:00Z / 01:54Z 发布（晚于本 phase 全部证据），根项目 peer `>=0.2.2-rc.1 <0.3.0-0` 现解析到 rc.2，与 hooks 依赖锁定的 rc.1 冲突。两行探针加 `--force` 后行为未变、仍全绿（仅安装解析需豁免）。**但 `.github/workflows/compat-matrix.yml` L37 的同一条 npm 命令未带该豁免——CI 激活（Phase 3，D-R4）时 4 格会在安装步全红。workflow 属实现文件（审计只读），故不在此修正，按 ESCALATE 上报 orchestrator。**
>
> **orchestrator 处置（2026-11-12，用户裁决）：** 本项按「已知上游漂移」归档——**不**作为 Phase 02 的未决 gap，**不**在本次验证跑中修改 `compat-matrix.yml`（该文件属 Phase 02 交付物，改动需走独立计划）。**移交 Phase 3**：CI 首次激活前必须让安装步具备豁免形态——`--force`（已实测两向绿）；**不可**用 `--legacy-peer-deps`（实测跳过 host peer → `@deepseek-ai/dsh-app-boot` 缺失 → probe exit 1「cannot resolve the DSH host boot module」）；或显式钉 `@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.1`、或隔离安装目录。Phase 02 的 VER-01 自动化判据以本文档内 `--force` 形态为准，双向宿主求值探针实测绿。
>
> ⚠️ **VER-03 矩阵格行**：CI 首批绿按 D-R4 归 Phase 3（push 后激活）；本 phase 以本地等价证据收口——两 DSH 行双向探针实测（2026-11-12 复跑绿）+ GSD 轴 1.19.0 `GSD_VERSION=1.19.0 node build.mjs` exit 0（gates A/B/C）+ identity `@opengsd/gsd-core@1.19.0`（02-02 coverage D2，2026-11-12 复跑同绿）+ 默认 1.20.1 build/26/26 多次全绿（02-03 阶段终检 + 本次审计）——非 gap，为已记录决策。
>
> **Manual-only 三行（VER-01 活体拒绝 · DEV-03 复验 · ENGINES 人读）**：状态均由 pending 转 **✅ 已执行**——证据闭环于 verify-evidence.md Task 1（7 行实测 + 负向 stderr 全文，16:44–16:46Z）与 Task 2（五项交互段，17:54–18:06:53Z），新快照声明成立（监听 pid 95618 lstart 2026-11-11T17:38:26Z 晚于复原重装 16:46:14Z）。**2026-11-12 审计逐项回查证据册：引用时间戳 16:44:30Z / 16:44:48Z / 16:45:55Z / 16:46:14Z / 17:38:26Z / 17:54:00Z / 18:02:38Z / 18:06:53Z 与引文 `installation rejected` / `allow-version` / `nothing was installed` / `0 errors / 2 warnings` / `benign-ctl` / L1280 / L1282 / 1066=1066 全部命中，无漂移。**
>
> ℹ️ **Phase 3 范围外观察（不计入本 phase 计数与绿标）**：审计期间工作区出现未跟踪文件 `tests/pack-contents.test.mjs`（3 tests，面向发布面 tarball 内容防线，属 Phase 3「发布 GitHub + npm + dshmarket」范围）。本文件全部计数以 HEAD `84784f1` 的 tracked 5 套 / 26 tests 为准，不含该文件；一次 glob 复跑曾因该未跟踪文件得到 29 tests（29/29 pass），已显式排除并在此记录，未作为本 phase 证据，其去留由 orchestrator 决定。

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
| 不兼容安装活体拒绝（真实验证实例） | VER-01 / DEV-03 | 宿主拒绝发生在 pnpm 运行前 + 真实 profile 安装环境，自动化 fixture 无法完整覆盖活体行为 | gsdtest profile：`dsh plugin --profile gsdtest add file:<doctored-fixture>` → stderr 拒绝文案 + allow-version 指引；证据落 verify-evidence.md | ✅ 已执行 — verify-evidence.md Task 1（2026-11-11T16:45:55Z：exit 1 + `installation rejected` + `allow-version` 双指引 + `nothing was installed`，stderr 全文照录；fixture 用后即弃 + 复原重装；2026-11-12 审计复核：时间戳 16:45:55Z 与三处引文均在册） |
| 兼容行安装活体验证 | VER-03 / DEV-03 | 验证实例复验口径（Phase 1 同构） | 按 BUILD.md §⑧ 复验序：/gsd-health + 独立 CLI + 版本 identity | ✅ 已执行 — Task 1（16:44:48Z `add file:. --force` exit 0；identity `@opengsd/gsd-core@1.20.1`；快照 version `1.20.1-1.dsh022`）+ Task 2（重启后 /gsd-health 0E/2W DEGRADED 良性；read 精确 .env 硬拦 exit-2 语义 + benign-ctl 对照放行；dump-config L1280/L1282 双行；comm -13 零新增 1066=1066；新快照声明 pid 95618 lstart 17:38:26Z > 复原重装 16:46:14Z；2026-11-12 审计复核：全部时间戳与引文在册） |
| ENGINES 门槛文档可解释性人读 | VER-01 | 文案质量无法自动化 | 拒绝日志人工阅卷：用户能读出「为什么拒、该装哪个」 | ✅ 已执行 — Task 2（2026-11-11T18:02:38Z 阅卷结论 = **可读**：① 为什么拒（`installation rejected … engines.dsh` 窗口不匹配）② 该装哪个（窗口覆盖 0.2.2-rc.1 的正品 `dsh-gsd@1.20.1-1.dsh022` / `compatible with this dsh runtime` 指引）③ 想硬装（`--accept-risk` = allow-version 精确豁免，README 风险声明对应）——02-03-SUMMARY D2 收档；2026-11-12 审计复核：18:02:38Z 与「可读」结论在册） |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 480s（审计实测：快速回路 0.30 s / 全量测试 5.1–29.1 s / prepack ≈ 10–45 s）
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-11-12（nyquist-auditor，State A 审计 + 全部自动化命令现场复跑绿 + manual-only 三行证据册闭环；2026-11-12 于 HEAD `84784f1` 复审计：26/26 + 17/17 绿、manual-only 引文复核无漂移、workflow 安装步 registry 漂移已 ESCALATE）

## Validation Audit 2026-11-11

| Metric | Count |
|---|---|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

## Validation Audit 2026-11-12

| Metric | Count |
|---|---|
| Gaps found | 1 |
| Resolved | 0 |
| Escalated | 1 |
