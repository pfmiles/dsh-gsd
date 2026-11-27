---
phase: 02-compat-matrix
plan: 02
subsystem: infra
tags: [version-scheme, dsh022, sbom, sbom-notices, pins, docs-consistency, node-test]

# Dependency graph
requires:
  - phase: 02-compat-matrix
    provides: 02-01 产 build/lib/check-pins.mjs（parseVersion/validateVersion 导出）与 build/assets/pins.json（行↔pin 真源）——本计划消费其导出面具不复制实现
provides:
  - tests/version.test.mjs（版本方案 parse/validate 机器校验：合法拆解/非法判 null/validateVersion 真值）
  - THIRD-PARTY-NOTICES.md 1.19.0 canonical 行（§⑦ 双镜像实测；①/② 档离线完整性第二轴）
  - README.md 双语新方案示例 + 版本方案表 + dsh022/dsh021 映射 + 升级回滚 exact 示例 + allow-version 风险声明
  - BUILD.md §⑨ 版本与 pin 对齐（字段表/行↔pin 指针对照/check-pins 三调用/refresh 手续/matrix 轴语义）
  - tests/docs-consistency.test.mjs ①-⑦ 静态防线（VER-04 + VER-02 文档面 + private/range/旧编码哨兵）
affects:
  - 03-publish（README/BUILD 示例与版本串为发布文案真值；CI 首绿归 Phase 3）
  - 02-compat-matrix 02-03（verify-evidence.md 复验时消费 BUILD.md §⑨ refresh 语义）

# Actuals (#2632) — chars/4 over the realized diff; pairs with the plan estimate.
actuals:
  tokens: 4610
  tasks: 2
  commits: 2
plan_head_before: f0c8b8bb0e1333d8687ea653062ba08e0123a142
plan_head_after: e01a244da1ada1645fba976dbe9832711dcd03b7

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "版本方案解析单点实现：tests 只 import check-pins 导出，不复刻正则（key_link 共享真值）"
    - "SBOM canonical 值只来自命令实测：npm view 双镜像逐字节一致后才落 NOTICES 行，写行后立即跑 ① 档离线消费回环"
    - "文档一致性以静态测试锁死：示例 parseVersion 合法 + 旧编码/range/tag 零出现 + engines 双语等值"

key-files:
  created:
    - tests/version.test.mjs
    - tests/docs-consistency.test.mjs
  modified:
    - README.md
    - BUILD.md
    - THIRD-PARTY-NOTICES.md

key-decisions:
  - "1.19.0 staged 树含 gsd-core/VERSION（官方安装器写入）——gate A 双锚天然兼容，plan 形态差异预案未触发，tests/run-gates.sh 零改动"
  - "Task 1 verify ④ 原命令按裸对象读 npm view 输出，本机 npm 12.2.1 返回单元素数组+扁平键导致 TypeError——适配为数组归一化+扁平/嵌套双形态读取，等值断言语义不变（与 02-01 偏差 3 同源形态）"
  - "docs-consistency ④ 旧编码哨兵字面量在测试文件内定义（0.1.0-gsd1.20.1，02-02 执行期从 README L19 现取），不写回任何文档/样例"

patterns-established:
  - "NOTICES 消费回环：写 canonical 行 → ① 档 GSD_TARBALL 离线构建真实读行做 SHA-512/SHA-1 双对照（checkTarballIntegrity）——SBOM 行不是纸面声称"

requirements-completed: [VER-02, VER-03, VER-04]

# Coverage metadata (#1602) — one entry per shipped deliverable.
coverage:
  - id: D1
    description: "版本号方案机器校验：tests/version.test.mjs ①合法拆解 ②非法判 null（8 样本含 README 现取迁移前旧编码）③validateVersion 真值（消费 check-pins 导出）"
    requirement: VER-02
    verification:
      - kind: unit
        ref: "node --test tests/version.test.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "矩阵 GSD 轴第二值 1.19.0：本地构建/冒烟证据（gates A/B/C all passed + runtime-identity 1.19.0）+ THIRD-PARTY-NOTICES.md 1.19.0 canonical 行（§⑦ 双镜像逐字节一致）+ ① 档离线消费回环"
    requirement: VER-03
    verification:
      - kind: integration
        ref: "GSD_VERSION=1.19.0 node build.mjs (exit 0, gates: all passed A/B/C)"
        status: pass
      - kind: e2e
        ref: "GSD_VERSION=1.19.0 runtime-identity --raw → {\"packageName\":\"@opengsd/gsd-core\",\"version\":\"1.19.0\"}"
        status: pass
      - kind: e2e
        ref: "GSD_VERSION=1.19.0 GSD_TARBALL=.gsd-build-tmp/opengsd-gsd-core-1.19.0.tgz node build.mjs (exit 0, integrity verified against THIRD-PARTY-NOTICES.md)"
        status: pass
      - kind: other
        ref: "npm view @opengsd/gsd-core@1.19.0 dist.integrity dist.shasum (registry.npmjs.org == npmmirror 逐字节) + NOTICES 行等值断言"
        status: pass
    human_judgment: false
  - id: D3
    description: "SC2/SC4 文档位：README 双语新方案示例/版本方案表/升级回滚 exact 对/allow-version 风险声明 + BUILD.md §⑨ 版本与 pin 对齐章"
    requirement: VER-02
    verification:
      - kind: unit
        ref: "node --test tests/docs-consistency.test.mjs (①-⑦ 全绿)"
        status: pass
      - kind: other
        ref: "README dsh-gsd@1.20.1-1.dsh022 计数 4 (≥2)；BUILD §⑨ 7 关键词命中断言"
        status: pass
    human_judgment: false
  - id: D4
    description: "全量回归无构建回归：node --test tests/*.test.mjs 25/25（含 build-smoke 以默认 1.20.1 完整重建 + 02-01 compat-matrix 套件）"
    requirement: VER-04
    verification:
      - kind: unit
        ref: "node --test tests/*.test.mjs"
        status: pass
    human_judgment: false

# Metrics
duration: 9min
completed: 2026-11-11
status: complete
---

# Phase 2 Plan 2: 版本号与 pin 策略落地 Summary

**版本号方案 `<gsd-ver>-<rev>.dsh<line>` 机器可校验（parseVersion/validateVersion 单测消费 check-pins 单一实现）、矩阵 GSD 轴第二值 1.19.0 落本地构建+身份+SBOM canonical 证据（§⑦ 双镜像实测 + ① 档离线消费回环）、README/BUILD 文档位双语成文并被 docs-consistency ①-⑦ 静态防线锁死**

## Performance

- **Duration:** 9 min
- **Started:** 2026-11-11T16:26:26Z
- **Completed:** 2026-11-11T16:35:00Z
- **Tasks:** 2/2
- **Files modified:** 5（2 新增 + 3 修改）

## Accomplishments

- tests/version.test.mjs 三组全绿：①合法拆解（1.20.1-{1,2}.dsh022 / 1.20.2-1.dsh022 / 1.20.1-1.dsh021 → {gsd,rev,line}）；② 8 个非法样本判 null（带点线号/rev 混字母/两位线号/rev 非数字/纯 gsd/空 rev + 迁移前旧编码 0.1.0-gsd1.20.1，README L19 现取）；③ validateVersion 真值（021 行 `<unsupported>` → false、1.16.0 不在 matrix.gsd → false）
- GSD 轴第二值本地证据完整：`GSD_VERSION=1.19.0 node build.mjs` exit 0 + `gates: all passed (A/B/C)`（gate A 双锚天然兼容，预案未触发、run-gates.sh 零改动）；runtime-identity 自报 `{"packageName":"@opengsd/gsd-core","version":"1.19.0"}`
- THIRD-PARTY-NOTICES.md 增补 1.19.0 canonical 行：dist.shasum `32a6080732b9033f2419739fd86d8ff156a0c8b3` / dist.integrity `sha512-3j2ejyDoS4xo0nv9nUwlL8NhgQAEVy4HXsAGdylnEsp2toHTE5AZsDEzZTHv6mpHMtfOyr/vf9ZbdiREyFzvkQ==`，registry.npmjs.org 与 npmmirror 逐字节一致，核对日期 2026-11-11 落注
- key_link 消费回环真实执行：写行后立即跑 ① 档离线构建 `GSD_VERSION=1.19.0 GSD_TARBALL=.gsd-build-tmp/opengsd-gsd-core-1.19.0.tgz node build.mjs` → exit 0 且 `integrity verified against THIRD-PARTY-NOTICES.md (sha512 + sha1)`（checkTarballIntegrity 真实读 1.19.0 行作 SHA-512/SHA-1 双对照）
- README 双语定点改写：安装示例 → `dsh-gsd@1.20.1-1.dsh022`；升级/回滚 = 同命令换 exact 版本（`1.20.2-1.dsh022` / `1.20.1-1.dsh022`）；新增版本号方案小节（gsd-ver/rev/dsh<line> 三列表 + dsh022=DSH 0.2.2 行 / dsh021=DSH 0.2.1 行映射）；环境要求 Node ≥ 24 与引擎窗口字面未动，新增 allow-version 显式风险豁免声明
- BUILD.md 新增 ⑨ 版本与 pin 对齐章：字段表 / 行↔pin 指针式对照表（真源指向 build/assets/pins.json）/ check-pins 三调用 + exit 0/2 语义 / refresh 手续（Pitfall 9）/ matrix 轴语义（dsh=当前+前行、gsd=1.20.1/1.19.0、CI 首绿归 Phase 3）
- tests/docs-consistency.test.mjs ①-⑦ 全绿：VER-04 双语 Node ≥ 24、窗口串 bilingual 且与 pins.022 等值、所有 dsh-gsd@ 示例 parseVersion 合法、旧编码零出现、range/tag 零出现、Pitfall 7 哨兵（version=1.20.1-1.dsh022 且 private:true）、allow-version 声明
- 全量回归：`node --test tests/*.test.mjs` 25/25 pass（含 02-01 compat-matrix 6 套 + build-smoke 以默认 1.20.1 完整重建，产物树自动复原）

## Task Commits

Each task was committed atomically:

1. **Task 1: 版本号方案单测套件 + GSD 轴第二值 1.19.0 本地构建证据 + NOTICES 1.19.0 canonical 行** - `28c68c0` (feat)
2. **Task 2: README 版本方案/BUILD.md §⑨ 文档位 + docs-consistency 一致性防线** - `e01a244` (docs)

## Files Created/Modified

- `tests/version.test.mjs` - 版本方案 parse/validate 机器校验（三组；解析真值只消费 check-pins 导出）
- `tests/docs-consistency.test.mjs` - ①-⑦ 文档/清单一致性静态防线（VER-04/VER-02 文档面/private/range/旧编码/allow-version 哨兵）
- `README.md` - 双语新方案示例 + 版本方案表 + dsh022/dsh021 映射 + 升级回滚 exact 对 + allow-version 风险声明
- `BUILD.md` - 新增 ⑨ 版本与 pin 对齐章（字段表/行↔pin 指针对照/check-pins 三调用/refresh 手续/matrix 轴语义）
- `THIRD-PARTY-NOTICES.md` - 增补 1.19.0 canonical 行（§⑦ 双镜像实测值 + 核对日期脚注）

## Decisions Made

- 见 frontmatter key-decisions（3 条）。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Task 1 verify ④ 命令与本机 npm JSON 形态不兼容（验证工具层，无仓库文件改动）**
- **Found during:** Task 1（verify ④ 首次执行）
- **Issue:** plan 原命令 `JSON.parse(npm view … --json)` 后按裸对象读 `j.dist.shasum / j.dist.integrity`；本机 npm 12.2.1 对 exact spec 返回**单元素数组 + 扁平键**（`[{"dist.integrity":…,"dist.shasum":…}]`）→ TypeError（与 02-01 偏差 3「npm --json 数组形态」同源）。
- **Fix:** 命令内归一化：数组取首元素，字段按扁平键（`j["dist.integrity"]`）与嵌套形态双读；等值断言语义不变（NOTICES 行 ↔ registry.npmjs.org 实测逐字节等值）。
- **Files modified:** 无（验证命令适配，仓库零文件改动）。
- **Verification:** 适配后命令 exit 0，输出 `1.19.0 row verified`。
- **Committed in:** 无独立 commit（验证工具层适配）。

---

**Total deviations:** 1 auto-fixed（1 bug，验证命令适配）
**Impact on plan:** 断言语义与 fail-closed 强度零变化；仓库文件集与 files_modified 精确一致，无 scope creep。

## Issues Encountered

- 两轮 1.19.0 全量构建（在线 ④ 档 + ① 档离线）各约 1 分钟完成；npm view 双镜像取样秒级返回且逐字节一致——§⑦ 纪律执行无阻碍。
- gate A 形态差异预案未触发：1.19.0 staged 树由官方安装器写入 gsd-core/VERSION（与 1.16.0 同形态），双锚（VERSION + runtime-identity）天然通过。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 02-03 可直接消费：BUILD.md §⑨ refresh 手续与 verify-evidence.md 复验口径齐备；本 plan 不触及 pins.json/check-pins/workflow（02-01 产），DEV-03 活体验证所需执行件全部在位。
- CI 首绿归 Phase 3（D-R4）：compat-matrix workflow 待 push 后激活，本地语法校验已由 02-01 actionlint 0 findings + 本 plan 25/25 全量回归覆盖。
- 计划级真值审计：git status 复核 = 恰好 files_modified 五文件（skills/gsd-core/hooks/config/scripts 仍 gitignored，node_modules 未出现）。

## Self-Check: PASSED

- 5/5 key files exist on disk（tests/version.test.mjs、tests/docs-consistency.test.mjs、README.md、BUILD.md、THIRD-PARTY-NOTICES.md）
- 2/2 task commits ancestor of HEAD（28c68c0、e01a244）
- evaluation-scope --plan 02-02 --commits-only → status resolved，2 commits（本分支）
- 全链复验：version.test 3/3；docs-consistency 7/7；npm test 25/25 exit 0；NOTICES 1.19.0 行机器等值断言 exit 0；① 档离线构建 exit 0 + integrity verified 文案

---

*Phase: 02-compat-matrix*
*Completed: 2026-11-11*
