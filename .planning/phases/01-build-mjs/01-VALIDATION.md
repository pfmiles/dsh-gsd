---
phase: "1"
slug: "build-mjs"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-11-10"
validated: "2026-11-10"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> 依据 01-RESEARCH.md §Validation Architecture。执行后经 gsd-validate-phase 审计收敛（status: validated）。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test（Node ≥24 内置 test runner，零新依赖） |
| **Config file** | none — package.json `"test": "node --test tests/*.test.mjs"`（glob 形态，01-02 偏差 2 实测适配；`node --test tests/` 目录参数在本机不可用） |
| **Quick run command** | `node --test tests/rewrite-map.test.mjs`（per-commit 秒级回路） |
| **Full suite command** | `npm test`（= 真实构建 + 产物断言 build-smoke —— gates 内嵌于 build.mjs、staging 清理前强制消费） |
| **Estimated runtime** | ~5-30 秒（暖缓存全量 6s 实测；含一次真实 pack → stage → gate 循环） |

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
| 01-01 (plan) | 01 | 1 | SKIL-03 | T-1-02 / T-1-01 | ①/④ 档离线 .tgz 经 shasum-512 对照 SBOM 后解包；独立 CLI 输出身份 JSON | smoke | `npm test`（build-smoke ③ identity 断言 + build 内嵌 gate A 双锚） | ✅ (build-smoke ③) | ✅ green |
| 01-02 (plan) | 01 | 1 | SKIL-04 | T-1-06 / T-1-03 | 产物树零残留机器绝对路径；72 个 SKILL.md 各恰一个 adapter 块 | gate/unit | `npm test`（rewrite-map 6/6 unit + build 内嵌 run-gates gate B1/B2/B3、gate C 72×1） | ✅ (rewrite-map.test / run-gates.sh) | ✅ green |
| 01-02 (plan) | 04 | 1 | INST-02 | T-1-06 | 产物树无 `~/.dsh` 托管字面量，安装不写受管文件 | smoke | `npm test`（build-smoke ④ 四树零 '~/.dsh'）；安装侧 987→987 零新增复核见 verify-evidence.md Task 1 | ✅ (build-smoke ④) | ✅ green |
| 01-03 (plan) | 01 | 1 | DEV-03 | T-1-07 / T-1-08 | 验证实例（gsdtest/3091）三项复验：`/gsd-health` + 独立 CLI + `.env` 拦截（read/bash 双入口硬拦 exit 2） | manual-only（已执行） | 复验序见 BUILD.md §⑧；证据 = verify-evidence.md（两轮 user_setup 历史 + 含修复快照声明） | ✅ (verify-evidence.md) | ✅ green（manual-only executed） |
| 01-03 T2（审计追加） | 03 | 3 | SKIL-03（守卫链） | T-1-SC 类 / hooks 桥接 fail-open 回归 | `hooks/dsh-gsd-suite/run.cjs` 随构建逐字节重放 canonical；注册命令行（经 wrapper）对 DSH payload 拦 `.env` exit 2、良性放行 exit 0 | smoke | `npm test`（build-smoke ⑥⑦⑧：删后重建 wrapper 逐字节一致 + registry 经 wrapper 调度 + 组件级拦截/放行契约） | ✅ (build-smoke ⑥⑦⑧) | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `build/lib/rewrite-map.cjs` — 把 build.mjs 的 REWRITES 提成纯模块（makeRewrites(stagingRoot)，可单测）
- [x] `tests/rewrite-map.test.mjs` — covers SKIL-04 映射正确性（staging 根 from、`~/`、`$HOME` 回退形态）
- [x] `tests/build-smoke.test.mjs` — covers SKIL-03 + SKIL-04 + INST-02 产物断言（01-validate-phase 追加 ⑥⑦⑧ hooks 桥接守卫断言）
- [x] `tests/run-gates.sh` — gate A/B/C 独立脚本（CI/prepack 直接调用；build.mjs staging 清理前强制消费）
- [x] `package.json` 增 `"test": "node --test tests/*.test.mjs"`（prepack 链上加 gate 调用；glob 形态为 01-02 偏差 2 的实测适配，原逐字目录参数形态在本机 Node 24 不可用）

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 验证实例三项复验 | DEV-03 | 需要运行中的 DSH 实例（127.0.0.1:3091）+ 交互式 skill 确认，无法 CI 自动化 | ✅ **已执行并留证**：verify-evidence.md（2026-11-10，两轮 user_setup；通过形态仅认含修复快照 —— `--force add` ≈13:57:48Z → 重启 pid 90223 13:58:39Z → 新 token 会话）。三项：`/gsd-health` 通过（identity 1.20.1 / degraded / errors 0）、read 精确 `.env` 双入口硬拦（进程级 decision:block / code:secret-read exit 2）+ 良性 exit 0、`--dump-config` gsd + gsd-hooks-bridge 两行在。verifier（verify-work）按 01-03 prohibitions 复核新快照声明（01-03 coverage D1, human_judgment: true） |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s（暖缓存全量实测 ~6s；per-commit 单测 < 1s）
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved — 2026-11-10 · gsd-validate-phase（DSH verify:post hook）。审计发现 1 gap（hooks 桥接 fail-open 回归无机器防线）已 closed；0 escalated。DEV-03 为登记的 manual-only，已执行且证据齐备（verify-evidence.md）。

## Validation Audit 2026-11-10

| Metric | Count |
|---|---|
| Gaps found | 1 |
| Resolved | 1 |
| Escalated | 0 |
