---
phase: 01-build-mjs
reviewed: 2026-11-12T03:32:26Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - build.mjs
  - build/lib/rewrite-map.cjs
  - build/assets/gsd-hooks.json
  - build/assets/dsh-gsd-suite-run.cjs
  - tests/run-gates.sh
  - tests/build-smoke.test.mjs
  - tests/rewrite-map.test.mjs
  - package.json
  - .gitignore
  - THIRD-PARTY-NOTICES.md
  - BUILD.md
  - README.md
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 1: Code Review Report（Re-review — 收敛轮）

**Reviewed:** 2026-11-12T03:32:26Z
**Depth:** standard（对 build.mjs / build/lib/rewrite-map.cjs / run-gates.sh / build-smoke.test.mjs 做了跨文件调用链核验）
**Files Reviewed:** 12（phase 01 三个 PLAN 的 key_files 并集，取当前 HEAD 状态）
**Status:** clean

## Summary

本轮为 **re-review 收敛轮**：上一轮审查（2026-11-11T09:42:57Z，`01-REVIEW.md` 初版）共 6 项 findings（WR-01、WR-02、IN-01..IN-04），已由 REVIEW-FIX.md（iteration 1，commit `384b72a`）全部修复并 disposition 为 fixed（0 open）。本轮按 skill 的 scope 规则对 phase 01 全部 12 个源文件在**当前 HEAD（`71759eb`）** 状态做了一次全新对抗式复核：先逐项验证旧 findings 是否仍处于已修复状态，再对这些文件的 HEAD 形态重新找新缺陷。

**结论：6 项历史 findings 全部保持已修复（resolution log 见下），未发现任何新的真实缺陷。** `npm test` 在 HEAD 实测 **26/26 全绿（exit 0，5.3s，0 skip）**：真实构建（② 档缓存 + NOTICES 双重哈希通过、gates A/B/C 通过、72 skills 注入）、WR-01 篡改负向（exit 2 fail-closed，46ms）、IN-02 单一来源漂移防线测试 ⑦ 均实跑通过。

**Scope 说明（skill 规则下的收敛散焦处理）：** 本 phase 存在先审记录，evaluation-scope resolver 以 `--since <LAST_REVIEW_COMMIT>`（`392a5b6`）查询时返回 `status: degraded, reason: no-task-commits-since`——自上次审查以来 phase 01 没有新的 task commit，其 phase-range 放宽结果落入了 **phase 02** 的文件（build/lib/check-pins.mjs、build/lib/compat-probe.mjs、.github/workflows/compat-matrix.yml、tests/{compat-matrix,docs-consistency,version}.test.mjs、build/assets/pins.json）。这些文件归属 phase 02 且已有其独立的 review/fix/disposition（commits `71f696e`/`b819741`/`2ae98e6`），按 phase 归属排除出本轮 scope，避免跨 phase 重复报账。本轮 scope = phase 01 三个 SUMMARY 的 key_files 并集（上述 12 个），逐文件以 HEAD 内容复核——其中 build.mjs、rewrite-map.cjs、两个测试文件自修复提交 `384b72a` 后未被后续提交再触碰；BUILD.md、README.md、THIRD-PARTY-NOTICES.md、package.json 被 phase 02 提交后续修改过，已按 HEAD 最新形态核验（详见下文核验依据）。

## Re-review Resolution Log（上轮 6 项 findings 复核）

| Finding | 标题 | 复核结果 | 核验依据（HEAD） |
| --- | --- | --- | --- |
| WR-01 | .build-cache ②档解包绕过完整性校验 | **resolved（维持 fixed）** | `build.mjs:205-208` ②档命中即 `await checkTarballIntegrity(tgzPath, GSD_VERSION, tier)`，与 ①档共用 NOTICES 双重哈希入口，mismatch/无记录 → `finish(2, …)` fail-closed；`tests/build-smoke.test.mjs:152-174` 负向测试实测 exit 2 + `checksum mismatch`（46ms）；`.build-cache/opengsd-gsd-core-1.20.1.tgz` 实测 sha512/sha1 与 THIRD-PARTY-NOTICES.md 1.20.1 行逐值相等（成功路径端到端验证）；BUILD.md:62-63 ②档行口径已同步 |
| WR-02 | build-smoke 真实构建前置缺失 opaque fail | **resolved（维持 fixed）** | `tests/build-smoke.test.mjs:36-50` `canBuild` 前置探测（暖缓存 → 直接 true；否则 `npm view` 15s 上限）→ `t.skip(...)` 带原因文案并 `return`；HEAD 实测（暖缓存路径）真实构建断言 5.2s 通过 |
| IN-01 | BUILD.md .build-cache 来源描述失实 | **resolved（维持 fixed）** | BUILD.md:63「由维护者/CI 手工预置，build 从不写入——无自愈/自更新语义」、BUILD.md:69 完整 bullet 均存在；全仓仍无任何代码路径写入 `.build-cache/`（grep 复核） |
| IN-02 | PLUGIN_ROOT_REF 常量双写 | **resolved（维持 fixed）** | `build/lib/rewrite-map.cjs:25,42` 单一来源导出；`build.mjs:26` 改导入消费、本地副本已删（`build.mjs:29` 仅注释说明）；`tests/rewrite-map.test.mjs:82-91` 测试 ⑦ 实测通过（漂移防线） |
| IN-03 | legacy GSD_BUILD_SOURCE 静默绕过校验 | **resolved（维持 fixed）** | `build.mjs:346-354` 入口 `console.warn('build: legacy GSD_BUILD_SOURCE path (compat only) — skips tarball integrity checks and gates A/B/C')`，不再静默降级；exit 0/1 语义未变 |
| IN-04 | staging 取证留痕只增不清 | **resolved（维持 fixed）** | BUILD.md:99「staging/fakehome 取证留痕只增不清（IN-04）」段落存在，含清理指引 `rm -rf .gsd-build-tmp/`；留痕取证语义维持不变 |

## Fresh-pass 核验项（本轮的独立验证依据，非 findings）

- **HEAD 全链实跑**：`npm test` 26/26 绿（exit 0，5.32s，fail/skip 0）——真实构建（②档完整性校验通过 → unpack → pre-gate → staging → 捕获 → 改写 → 注入 → gates A/B/C 全过）、WR-01 负向、IN-02 ⑦ 全部在含两行（1.20.1 + 1.19.0）NOTICES 表的当前 HEAD 上通过。
- **`checkTarballIntegrity` 对 phase-02 新增行的兼容性**：`THIRD-PARTY-NOTICES.md` 现有 1.20.1/1.19.0 两行，1.19.0 行（commit `28c68c0`）未改变表格列序；解析逻辑 `cells[3]`=shasum、`cells[4]`=integrity，`find` 精确匹配 `| @opengsd/gsd-core | 1.20.1 |` 行——HEAD 实测无误（两行 integrity 均为 64 字节 sha512 base64、shasum 均 40 hex）。
- **被 phase-02 后续修改的 phase-01 文件（HEAD 形态）**：`package.json`（version `1.20.1-1.dsh022`，scripts 链 prepack/test 未变）与 README 双语安装/版本号方案互洽（version.test 哨兵全绿）；BUILD.md 的 WR-01/IN-01/IN-04 修复行未被 phase-02 的 TL;DR（26/26，实测准确）与 §⑨ 追加破坏；README:65,135 自举构建段 → BUILD.md / THIRD-PARTY-NOTICES.md 双语互链仍在（plan 01-03 契约）。
- **未再复报的既有口径**（首轮已核验，本轮复核仍成立）：gate A 双锚、gate B 三段式、`node --test tests/*.test.mjs` glob 形态、hooks 桥接 fail-open 修复链、目标版本 1.20.1、legacy 分支 exit 0 语义、`npm view`/网络探测超时设计（phase-02 fix `df81330` 的 compat-probe 120s 上限属 phase-02 scope，此处仅确认不交叉影响 build-smoke 的 15s 探测）。
- **测试执行对工作树的洁净性**：`npm test` 仅重建 gitignored 产物树并在 WR-01 负向结束后还原 `.build-cache` fixture（`finally` 分支含中断残留恢复），未产生除编排方存量变更（STATE.md / .planning 未跟踪文件）外的任何 tracked 漂移。

---

_Reviewed: 2026-11-12T03:32:26Z_
_Reviewer: DeepSeek Harness agent (gsd-code-reviewer 契约，re-review 收敛轮)_
_Depth: standard_
