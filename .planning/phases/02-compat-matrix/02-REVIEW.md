---
phase: 02-compat-matrix
reviewed: 2026-11-11T18:37:00Z
depth: deep
files_reviewed: 11
files_reviewed_list:
  - build/lib/check-pins.mjs
  - build/lib/compat-probe.mjs
  - build/assets/pins.json
  - .github/workflows/compat-matrix.yml
  - tests/compat-matrix.test.mjs
  - tests/version.test.mjs
  - tests/docs-consistency.test.mjs
  - package.json
  - README.md
  - BUILD.md
  - THIRD-PARTY-NOTICES.md
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-11-11T18:37:00Z
**Depth:** deep
**Files Reviewed:** 11
**Status:** issues_found

## Summary

评审范围为 02 版本与兼容矩阵的 11 个 git-tracked 文件（pins 真源、pin 对照器、宿主求值探针、矩阵 CI、3 个新测试套件、package.json、README、BUILD.md、THIRD-PARTY-NOTICES）。评审做了三类交叉验证：(1) 对照 02-RESEARCH/PATTERNS/SECURITY 的计划契约逐行核验实现；(2) 以本机 DSH 0.2.2-rc.1 运行时源码（dsh-app-boot `lib/index.js:1129`）核实探针对宿主 `evaluatePluginCompatibility` 签名与返回契约的假设，并用真实 manifest 执行该函数验证 install-ok/reject 两条分支；(3) 在 /tmp 一次性目录里逐格复现 CI 单元（`npm install @deepseek-ai/dsh@0.2.2-rc.1` / `@0.2.1-rc.5` + 实际运行 `compat-probe.mjs`），两个方向均 exit 0 绿；`actionlint` 对 workflow 0 findings，`npm view` 取样形态与 check-pins (k) 解析一致，带 registry 的在线 check-pins 全绿。

核心结论：兼容门未被削弱——探针确实只转发宿主求值（无任何本地 semver 判定）、宿主版本 guard 在码、pins 等值对照 fail-closed、CI 格为真探针而非替身，威胁登记 T-2-01..T-2-08 的缓解措施在线且与本评审的实证一致。没有 Critical。4 条 Warning 集中在「白名单比承诺宽」（版本正则收带前导零的 semver 非法串、bridge 对照单向导致缺键即放假）、「CI 编排死角」（workflow_dispatch 声称的 manual override 从未接线）与「静态断言单向」（轴值一致性测试只验 pins→workflow 方向）。3 条 Info 为文档漂移与契约分类细节。

## Warnings

### WR-01: parseVersion 白名单放行 semver 非法的版本串（前导零 / rev=0）

**File:** `build/lib/check-pins.mjs:29`
**Issue:** 正则 `/^(\d+\.\d+\.\d+)-(\d+)\.dsh(\d{3})$/` 未禁止数字 id 的前导零与 rev=0。实测：`parseVersion('1.20.1-01.dsh022')` → `{gsd:'1.20.1', rev:1, line:'022'}` 且 `validateVersion(...) === true`；`'1.20.1-0001.dsh022'`、`'1.20.1-0.dsh022'`（rev 应从 1 起）同样通过。按 semver 规则，prerelease 数字 id 前导零即整体非法（`semver.valid('1.20.1-01.dsh022') === null`），npm/pnpm/DSH 宿主都会拒绝该版本。check-pins 的 (d) 格式门承诺「invalid version format → exit 2」fail-closed，但当 pins.json 里 `version` 与 package.json 载入同一手误值（§⑨ refresh 手续恰好是「先改 pins.json 单点再同步」）时，严格等值检查对同源笔误无兜底，整链 exit 0，直到 Phase 3 publish/安装时才在下游炸开；docs-consistency ③ 只判 `parseVersion !== null`，同样会给 README/BUILD 里的这种示例放行。
**Fix:** 收紧白名单，禁用前导零与 rev=0：
```js
const m = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-(0|[1-9]\d*)\.dsh(\d{3})$/.exec(v)
```
并在 version.test ② 的 invalids 里补 `'1.20.1-01.dsh022'`、`'1.20.1-0001.dsh022'`、`'1.20.1-0.dsh022'`、`'01.20.1-1.dsh022'` 样本。

### WR-02: bridge pin 对照单向——pins 行缺 `bridge` 键或 deps 多出条目时静默通过

**File:** `build/lib/check-pins.mjs:131-137`
**Issue:** `const bridge = line.bridge && typeof line.bridge === 'object' ? line.bridge : {}` 后 `for (const [name, pin] of Object.entries(bridge))` 只做 pins→deps 方向。两个洞口：(a) refresh 新行时若该行条目漏写/写坏 `bridge`（或为 null），`{}` 导致零次迭代，三件 pin 中的两件（hooks-claude-code / hook-protocol）完全不校验，deps 挂着旧行 pin 也全绿——头注释与 §⑨ 承诺的「three-pin equality fail-closed / exit 2」失守；(b) package.json `dependencies` 里新增任何不在 bridge 映射里的包，checker 视而不见。威胁登记 T-2-01 的「逐项严格等值对照」目前只覆盖 pins 侧枚举到的键。
**Fix:** 把 bridge 纳入 schema 前置（(b) 处断言声明行 `line.bridge` 为非空 object），并做双向键集等值：
```js
const bridge = line.bridge // 前置已验证为非空 object
const depKeys = Object.keys(deps).sort()
const bridgeKeys = Object.keys(bridge).sort()
if (depKeys.join('\u0000') !== bridgeKeys.join('\u0000')) {
  finish(2, `check-pins: dependencies key set mismatch — package.json [${depKeys}] vs pins.json bridge [${bridgeKeys}]`)
}
for (const [name, pin] of Object.entries(bridge)) { if (deps[name] !== pin) finish(2, …) }
```

### WR-03: workflow_dispatch 的 dsh/gsd「manual override」输入从未消费——死输入误导操作者

**File:** `.github/workflows/compat-matrix.yml:6-9`
**Issue:** `workflow_dispatch.inputs` 声明了 `dsh`/`gsd` 且描述写「manual override」，但全文件没有任何 `inputs.*` 引用（已 grep 证实）——矩阵 4 格仍是 L17-21 的硬编码值。按 GitHub Actions 语义手动触发时填入这两个输入不做任何事，操作者以为定向跑一格，实际全量跑 4 格；声称的能力不存在。该缺陷源自 RESEARCH Code Example [2] 骨架，执行时未裁决是否接线。
**Fix:** 二选一：(a) 本阶段删掉两个 input（诚实最小化）；或 (b) 真正接线——在 job 级加条件门（注意 `inputs.dsh` 未填时是空串，必须显式判非空，否则会把全部格跳过）：
```yaml
if: ${{ !inputs.dsh || inputs.dsh == matrix.dsh }}
```
配合对 `gsd` 的同构条件。若选 (b) 建议同时让 compat-matrix.test.mjs ⑤ 哨兵锁定「inputs 消费面存在」。

### WR-04: 轴值一致性测试只验 pins→workflow 单向，幽灵格/冗余格/子串误配均漏检

**File:** `tests/compat-matrix.test.mjs:30-36`
**Issue:** 测试 ② 用 `y.includes(v)` 把 pins.matrix 的每个值在 workflow 全文里做子串匹配；测试 ③ 只按 `pins.lines` 逐行要求「存在一个带正确 expect 的格」。三个盲区与注释 L28-29 声称的「轴值唯一来源 = pins.json（硬编码漂移在此失败）」不符：(a) 反方向无断言——workflow 里多出 pins 未声明的格（如实验性 1.16.0 格、从轴移除后残留的旧格）全部放行；(b) `includes` 是子串语义，pins 值 `1.20.1` 会被格文本 `1.20.10` 假匹配，反之轴值 `1.20.10` 也永远匹配不到却以相反方式失败；(c) 重复格（同一 (dsh,gsd) 两行）不报。
**Fix:** 把「格行解析」提升为一等断言：用整行正则抽取每个 `- { dsh: "...", gsd: "...", expect: ... }` 行，构造集合并断言它**恰等于** `pins.matrix.dsh × pins.matrix.gsd` 笛卡尔积（精确等值、计数唯一），随后 test ③ 的 expect 一致性验证复用同一个解析结果而不是再次正则扫描，杜绝子串与方向性漏洞：
```js
const cellRe = /^\s*-\s*\{\s*dsh:\s*"([^"]+)"\s*,\s*gsd:\s*"([^"]+)"\s*,\s*expect:\s*(install-ok|reject)\s*\}\s*$/
const cells = y.split('\n').map(l => cellRe.exec(l)).filter(Boolean).map(m => ({ dsh: m[1], gsd: m[2], expect: m[3] }))
const expectedPairs = pins.matrix.dsh.flatMap(d => pins.matrix.gsd.map(g => `${d}\u0000${g}`)).sort()
assert.deepEqual(cells.map(c => `${c.dsh}\u0000${c.gsd}`).sort(), expectedPairs)
```

## Info

### IN-01: BUILD.md TL;DR 的测试计数已过期（7/7 vs 实际 25/25）

**File:** `BUILD.md:16`
**Issue:** 「每波可重跑测试（含真实构建 smoke）——预期 7/7」是本 phase 新增 16 条断言（3+6+7）前的 Phase 1 计数；当前全套 `node --test tests/*.test.mjs` 为 25/25。BUILD.md §⑥ 是本仓构建契约单点，TL;DR 的错误计数会被构建者与 re-verifier 当作成功判据。§⑥ L110 的「实测 7/7」属历史陈述（01-02 偏差 2），无需改；仅 L16 是现时预期。
**Fix:** 将 L16 改为 `——预期 25/25（3 套新兼容矩阵/版本/文档一致性套件已并入）`，或去掉数字改述「预期全绿」。

### IN-02: compat-probe 对 CLI 用法错误返回 exit 2，与头注释的 1=IO·parse 契约有分歧

**File:** `build/lib/compat-probe.mjs:9`（契约）vs `:29-34`（实现）
**Issue:** 缺少 `--dsh` 或 `--expect` 非法时走 `finish(2, …)`，而第 9 行契约「1 IO·parse·environment mismatch / 2 evaluation result does not match --expect」把参数解析类失败归 1。CI 中两者都红格所以无实际危害，但 0/1/2 语义是 BUILD.md §⑨ 与 PATTERNS 的通用执行语言，混合分类会让排障时误判为「宿主求值不符」而去查探针语义。
**Fix:** 这两处改用 `finish(1, …)` 并同步头注释（或明确在头注释把「CLI 用法错误」列入 2，二选一但必须一致）。

### IN-03: check-pins registry 取样 spawnSync 无显式 timeout

**File:** `build/lib/check-pins.mjs:153`
**Issue:** `spawnSync('npm', ['view', …])` 未传 `timeout`，网络/代理悬挂时本地预检会无限等待（CI 走 `--offline` 不受影响，缺口在维护者本地在线档）。另 `spawnSync('npm', …)` 在 Windows 原生 shell 下需 `npm.cmd` 解析，README 支撑面是 macOS/Linux/WSL，影响有限。
**Fix:** 加 `{ timeout: 120_000 }` 并把超时映射为 exit 1（明确文案提示 `--offline` 或 `--registry=` 重试）。

---

_Reviewed: 2026-11-11T18:37:00Z_
_Reviewer: gsd-code-reviewer (DeepSeek Harness)_
_Depth: deep_
