---
phase: "03"
slug: "github-npm-dshmarket"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-12"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> 派生自 `03-RESEARCH.md` 的 `## Validation Architecture` 段（2026-11-12）。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 内置 test runner（`node --test`），Node `v24.21.0`（`engines.node >=24`） |
| **Config file** | 无配置文件 —— glob 驱动。gate A/B/C 由 `tests/run-gates.sh` 提供（需 `GSD_VERSION` + `GSD_STAGING_ROOT` 双 env，缺失 exit 1） |
| **Quick run command** | `node --test tests/rewrite-map.test.mjs tests/version.test.mjs tests/compat-matrix.test.mjs`（17 tests，~0.3 s）＋ 纳管后 `node --test tests/pack-contents.test.mjs`（3 tests，~0.1 s） |
| **Full suite command** | `node --test tests/*.test.mjs`（**29 tests**，5–30 s，含真实构建 smoke） |
| **Estimated runtime** | ~30 秒（全量，冷缓存）；~0.4 秒（快速回路） |

**⚠ 串行强制：** `tests/build-smoke.test.mjs` 会重写构建树。任何并发运行都会产出假红 `gate C: no SKILL.md under skills/gsd-*`。**禁止并行跑测试套件。**

---

## Sampling Rate

- **After every task commit:** 快速回路 = `node --test tests/rewrite-map.test.mjs tests/version.test.mjs tests/compat-matrix.test.mjs` ＋ `node --test tests/pack-contents.test.mjs`（纳管后）。**改动 workflow 时必须加跑** `actionlint .github/workflows/compat-matrix.yml`。
- **After every plan wave:** `node --test tests/*.test.mjs`（29/29，串行）
- **Before `/gsd-verify-work`:** 全量 29/29 + `node build.mjs` → `gates: all passed (A/B/C)`、76 trees / 286 files / 72 skills + `node build/lib/check-pins.mjs --offline` exit 0 + 四格 install/probe 全绿 + 真 `npm pack`（958 文件 / 12 顶层 / 零泄漏）+ 干净 profile 装成判据 + `actionlint` exit 0。**push 之后再加**：`gh run list --workflow=compat-matrix.yml --limit 1` → `conclusion=success`。
- **Max feedback latency:** 1 秒（快速回路）／30 秒（全量）

---

## Per-Task Verification Map

> 计划尚未产出，本表按 **Success Criterion** 粒度填充（这是 RESEARCH.md 已确证的映射）。
> 逐任务行（`03-01-01`…）在 `validate-phase` 阶段按实际 PLAN.md 任务补齐。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| SC-1 | TBD | TBD | PUB-01, PUB-02 | — | 只从本地 tarball 装，不触 registry 写入 | integration（脚本化手工） | `npm pack` → `dsh plugin --profile <clean> add "$PWD/<tgz>"` → `node …/gsd-tools.cjs runtime-identity --raw` 得 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}` → `dsh --profile <clean> --dump-config \| grep -cE '^\s*- id: (gsd\|gsd-hooks-bridge)$'` = 2 | ❌ W0 | ⬜ pending |
| SC-2 | TBD | TBD | PUB-02 | — | `.planning/`·`tests/`·`build.mjs` 零泄漏进包 | unit（静态推导，per-commit） | `node --test tests/pack-contents.test.mjs` → 3/3 | ⚠️ 位置错（`tests/pending-phase-3/`）→ 移动即用 | ⬜ pending |
| SC-2b | TBD | TBD | PUB-02 | — | 同 SC-2（交叉核对） | integration（分钟级） | `npm pack --dry-run --json --ignore-scripts` → `entryCount 958`、顶层 12 项、leaks 0 | ✅ 命令可跑 | ⬜ pending |
| SC-3 | TBD | TBD | PUB-03 | — | 材料自检离线可跑，不访问网络 | unit（行级断言）+ 人工复核 | 离线 `node -e` 自检（字段/文件名/词表）＋ `grep -F` 比对 README 与材料的 install 串 | ❌ W0 | ⬜ pending |
| SC-4 | TBD | TBD | PUB-03, PUB-04 | — | — | unit（docs-consistency 扩写） | `node --test tests/docs-consistency.test.mjs`（现有 7 tests 全绿 + 可选徽章/致谢断言） | ⚠️ 现有 ✅；新增断言 ❌ W0（可选） | ⬜ pending |
| SC-5 | TBD | TBD | D-03（PUB-01 的 CI 面） | — | 无红跑历史 | e2e（外部）+ 本地四格等价 | 本地：四格 `npm install` + `compat-probe` 全 exit 0；外部：`gh run list --workflow=compat-matrix.yml --limit 1` → `conclusion=success` | 本地 ✅（手工）；CI 判定在 push 后 | ⬜ pending |
| SC-6 | TBD | TBD | D-04 | — | — | unit | `test -f CHANGELOG.md` + `grep -F '## [1.20.1-1.dsh022] - 2026-11-12'` + 版本等值断言 | ❌ W0 | ⬜ pending |
| INST-06 | TBD | TBD | INST-06 | — | — | unit | `tests/pack-contents.test.mjs`（files/icon）+ 新增 locale 键非空断言 | ⚠️ 部分覆盖（W0 补 locale 断言） | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/pack-contents.test.mjs` — **从 `tests/pending-phase-3/` 移回 `tests/`**，同时修好 ROOT 解析（现址解析到 `tests/` → 实测 `ENOENT tests/package.json`）— 覆盖 SC-2 / PUB-02
- [ ] `BUILD.md:16` 计数 26/26 → 29/29（**唯一活体计数**；`02-VALIDATION.md` 的 26/26 是历史审计记录，按仓内惯例只追加带日期的前向注记，不改写）
- [ ] `CHANGELOG.md` 新建 + 首条目 `1.20.1-1.dsh022`（覆盖 SC-6）；建议同时加「CHANGELOG 版本 == `package.json.version`」断言
- [ ] dshmarket 条目材料（`data/plugins/pfmiles__dsh-gsd.yml` 形状）+ 离线自检命令（覆盖 SC-3）
- [ ] 干净 profile 的安装/boot 复核序（写入 plan 的 verify 段或本文件的 Manual-Only 表）— 覆盖 SC-1
- [ ] （可选，Q5）`tests/docs-consistency.test.mjs` 增徽章/致谢断言；`compat-matrix.yml` 加 `permissions:` 与「解析结果 == `matrix.dsh`」正向断言

**无新框架安装需求** —— Node 内置 runner 已足够。`js-yaml` 与 `semver` 均**不引入**（宿主判定唯一走 `compat-probe`，禁止本地 semver 断言）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| tarball 在干净 profile 装成并 boot | SC-1 / PUB-01 | 需要 `dsh` 真实 profile 生命周期与宿主 boot，无纯静态等价物 | 1) `npm pack` 取 tgz；2) 新 profile 名：`dsh plugin --profile <clean> add "$PWD/<tgz>"`；3) 用该 profile 的 `node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` 断言 `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`；4) `dsh --profile <clean> --dump-config` 断言 `gsd` 与 `gsd-hooks-bridge` 两个 id 各出现一次；5) 记录 `pnpm approve` 是否提示「Agent skills awaiting approval」，以及技能是否仍可见（研究项 A2 待观测） |
| CI 首次激活 run 全绿 | SC-5 / D-03 | CI 首跑本身不可先验证明（研究项 A1 `[ASSUMED]`） | push 后 `gh run list --workflow=compat-matrix.yml --limit 1 --json conclusion,status` → `conclusion=success`。若首跑即红，修复后重跑会留下红跑历史，须在 plan 的 checkpoint 中承认该残余风险 |
| dshmarket 提交流程真实性 | SC-3 / PUB-03 | 目标仓为第三方仓，流程由其 `contributing.md` 与 CI 定义，本地无法执行 | 以 `03-RESEARCH.md` 的 Sources 为准复核四检（≤3 条/PR、`dsh.bundle` 存在、仓龄≥1 天、awesome-lint+site build）；实际提交在 Phase 5 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending