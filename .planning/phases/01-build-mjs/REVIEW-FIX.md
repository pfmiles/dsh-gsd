---
phase: 01-build-mjs
fixed_at: 2026-11-11T09:55:35Z
review_path: .planning/phases/01-build-mjs/01-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 01-build-mjs: Code Review Fix Report

**Fixed at:** 2026-11-11T09:55:35Z
**Source review:** [01-REVIEW.md](./01-REVIEW.md)
**Iteration:** 1

**Summary:**
- Findings in scope: 6（WR-01, WR-02, IN-01, IN-02, IN-03, IN-04）
- Fixed: 6
- Skipped: 0

**提交纪律说明：** 本批次由 /gsd-execute-phase 编排方显式要求单个原子 commit（`fix(phase-1): resolve code-review findings WR-01/WR-02/IN-01/IN-02/IN-03/IN-04`），故下示各 finding 共享同一 commit hash；逐文件 `git add` 精确 stage（无 `--files` 之外的批量 add），hooks 未绕过。REVIEW-FIX.md 本身按 gsd-code-fixer 契约由编排方另行提交。

**验证环境说明：** `workflow.use_worktrees=false`（.planning/config.json）→ 依契约直接在 main checkout（工作树 root `/Users/yue.weny/frontWorkspace/gsd-on-dsh/dsh-gsd`）编辑/提交，无隔离 worktree。全部 gates 与测试均在 main checkout 运行，数字可从当前工作树复现。

## Fixed Issues

### WR-01: .build-cache（②档）不经完整性校验直接解包并执行

**Files modified:** `build.mjs`, `tests/build-smoke.test.mjs`, `BUILD.md`, `THIRD-PARTY-NOTICES.md`
**Commit:** `fix(phase-1): resolve code-review findings WR-01/WR-02/IN-01/IN-02/IN-03/IN-04`（聚合提交，hash 见下）
**Applied fix:**
- `build.mjs` ②档命中分支接入 `await checkTarballIntegrity(tgzPath, GSD_VERSION, tier)`——与 ①档共用 NOTICES canonical 双重哈希入口（SHA-512 vs `dist.integrity` + SHA-1 vs `dist.shasum`）；mismatch / 无该版本记录 → 既有 `finish(2, …)` fail-closed（exit 2，契约不变）。校验成功日志由硬编码 `GSD_TARBALL` 改为携带档位名（`${tier} integrity verified …`）。
- 负向测试（必加项）：`tests/build-smoke.test.mjs` 追加独立 test「WR-01 负向：②档 .build-cache 篡改 tgz → 完整性校验 fail-closed exit 2」——篡改 fixture 写入 `.build-cache`，断言 `node build.mjs` exit 2 且 stderr/stdout 含 `checksum mismatch`；fixture 备份/还原含上次中断残留恢复，与真实构建断言同文件串行，不争用缓存，运行 ~55ms，npm test 仍快。
- `BUILD.md` §③ ②档行改为「解包前 SHA-512 + SHA-1 双重对照，与 ①档同一校验入口；任一不符/无记录 → exit 2（fail-closed）」；§⑥ fixture 增补 ②档篡改负向口径；§①/§⑤ exit-2 文案同步为「①/② 档」。`THIRD-PARTY-NOTICES.md` 协议段同步为「①/② 档对照协议」。plan 记录（01-01/01-02/01-03 PLan/SUMMARY）为历史口径，未改。

### WR-02: npm test / prepack 依赖不可见的前置条件（暖缓存或网络）

**Files modified:** `tests/build-smoke.test.mjs`
**Commit:** 同上聚合提交
**Applied fix:** 真实构建断言前做前置探测 `canBuild`：暖缓存命中即 true（不探网）；否则 `npm view @opengsd/gsd-core@1.20.1 version`（15s 上限）探测 registry。两者皆无 → `t.skip('full-build smoke requires warm .build-cache/... or registry access — neither available (offline cold clone)')` 并 `return`，静态前置注释与 skip 文案明示原因；②-⑧ 产物断言保留在构建成功路径内。修复后实测（冷缓存模拟路径）与暖缓存路径均绿。

### IN-01: BUILD.md 声称 .build-cache"由过往成功构建留存"，但没有任何代码路径写入该文件

**Files modified:** `BUILD.md`
**Commit:** 同上聚合提交
**Applied fix:** §③ ②档行措辞改为「由维护者/CI 手工预置，build 从不写入（无自愈/自更新语义）」；新增章节 bullet：「**.build-cache/ 不由 build 写入**（IN-01）：全仓无任何代码路径落盘该目录——在线 ④档成功后 tgz 只留在 .gsd-build-tmp/。缓存由维护者/CI 按 §⑦ canonical 值核对后手工预置；篡改 → ②档完整性校验 exit 2 fail-closed，不会静默自愈，需按 §⑦ 重新预置。」（复习建议的选项二，与实现一致、避免新写入路径。）

### IN-02: PLUGIN_ROOT_REF 常量双写（build.mjs 与 rewrite-map.cjs 各一份）

**Files modified:** `build/lib/rewrite-map.cjs`, `build.mjs`, `tests/rewrite-map.test.mjs`
**Commit:** 同上聚合提交
**Applied fix:** `rewrite-map.cjs` 模块级导出 `PLUGIN_ROOT_REF`（`module.exports = { makeRewrites, PLUGIN_ROOT_REF }`，CJS named-export 可被 ESM 静态识别），`makeRewrites` 内部改用该常量；build.mjs 删除本地副本，改为 `import { makeRewrites, PLUGIN_ROOT_REF } from './build/lib/rewrite-map.cjs'`（legacy 分支 7 对映射的 P 前缀沿用同一导入——改写目标行为不变，改写契约无牵动）。可查性：`tests/rewrite-map.test.mjs` 追加 ⑦「PLUGIN_ROOT_REF 单一来源导出」断言值与改写目标前缀一致（漂移防线）。

### IN-03: legacy GSD_BUILD_SOURCE 分支静默绕过完整性校验与 gate A/B/C

**Files modified:** `build.mjs`
**Commit:** 同上聚合提交
**Applied fix:** 入口 `console.log` 改为 `console.warn('build: legacy GSD_BUILD_SOURCE path (compat only) — skips tarball integrity checks and gates A/B/C')` 并附注释（环境残留该变量时不再静默降级为无门禁路径）。兼容行为与 exit 0（成功）/1（失败）语义不变；7 对映射未收敛（超出本 finding 的 trivially-safe 范围，遗留 ROADMAP 排期事项不变）。

### IN-04: 失败路径的 staging/fakehome 留痕只增不清

**Files modified:** `BUILD.md`
**Commit:** 同上聚合提交
**Applied fix:** §⑤「判读与处置」追加一条：「**staging/fakehome 取证留痕只增不清**（IN-04）：exit 1/2 时 .gsd-build-tmp/staging.* 与 fakehome 按取证语义保留（约 MB 级、无自动轮替/上限）；诊断完成后手工清理：`rm -rf .gsd-build-tmp/`（该目录仅 build 自身使用，下次构建自动重建）。」维持留痕取证语义不变，仅补留存说明与清理指引（finding 的最低要求即可选项）。

## Verification

- **npm test（最终全量）：9/9 绿**（基线 7/7 + 新增 WR-01 负向、IN-02 ⑦ 共 2 条）。真实构建断言 ~5.7s（暖缓存），WR-01 负向 ~54ms。
- **npm run build（最终代码）：exit 0**，输出含 `build: .build-cache integrity verified against THIRD-PARTY-NOTICES.md (sha512 + sha1)` → `fetched via .build-cache` → `gates: all passed (A/B/C)` → `copied 76 trees … 72 skills (72 total)`——②档新校验路径与 gates A/B/C 实跑通过。
- **legacy 分支探针：** `GSD_BUILD_SOURCE=/nonexistent node build.mjs` → stderr 现 warn 文案，exit 1（契约不变）；随后以上述 npm run build 恢复产物树。
- **语法：** `node --check` × {build.mjs, rewrite-map.cjs, build-smoke.test.mjs, rewrite-map.test.mjs} 全过。
- 未触碰 01-REVIEW.md、WINDOWS.md、.planning/tmp/；exit code 0/1/2 契约、gate A/B/C 语义、离线四档顺序、依赖声明均未改变。

---

_Fixed: 2026-11-11T09:55:35Z_
_Fixer: DeepSeek Harness agent (gsd-code-fixer 契约)_
_Iteration: 1_
