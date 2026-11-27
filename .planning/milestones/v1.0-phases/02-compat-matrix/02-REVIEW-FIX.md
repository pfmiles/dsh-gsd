---
phase: 02-compat-matrix
fixed_at: 2026-11-11T19:17:43Z
review_path: .planning/phases/02-compat-matrix/02-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 02 Code Review Fix Report

7 条发现（4 Warning + 3 Info）逐条独立重验（read 当前 HEAD 源码 ±10 行上下文 + 真实命令复现），全部判为真实问题并按给定方向修复，每 finding 恰一条原子提交。两处与预判表的细节偏差（均为适配现实语义、不改变修复意图）在对应条目内说明。

## Fixed Issues

### WR-01: parseVersion 白名单放行 semver 非法的版本串（前导零 / rev=0）

**判定:** real

**证据:** node 实测 `parseVersion('1.20.1-01.dsh022')` → `{gsd:'1.20.1',rev:1,line:'022'}` 且 `validateVersion(...)===true`；`'1.20.1-0001.dsh022'`/`'1.20.1-0.dsh022'`/`'01.20.1-1.dsh022'` 均非 null——白名单确实放行 semver 数字 id 前导零与 rev=0。

**Files modified:** `build/lib/check-pins.mjs`, `tests/version.test.mjs`

**Commit:** 55191da

**Applied fix:** 正则收紧为 `/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-([1-9]\d*)\.dsh(\d{3})$/` 并同步修正 return 捕获组映射（`gsd: m[1].m[2].m[3] / rev: m[4] / line: m[5]`）。注意：REVIEW 建议的正则 `-(0|[1-9]\d*)` 仍会放行 rev=0，与其自带的 invalids 样本 `'1.20.1-0.dsh022'` 相矛盾，故 rev 组改为 `[1-9]\d*`（rev 从 1 起，BUILD.md §⑨ 契约）；version.test ② 追加 4 个样本。修复后 4 个病理样本全部 null，README/BUILD 现存全部 `dsh-gsd@` 示例（均 `1.20.x-1` 形态）不受影响，docs-consistency ③ 保持全绿。

### WR-02: bridge pin 对照单向——pins 行缺 `bridge` 键或 deps 多出条目时静默通过

**判定:** real

**证据:** `check-pins.mjs:131-137` 现值确为 `line.bridge && typeof ... ? line.bridge : {}` 后仅单方向 `Object.entries(bridge)` 遍历；/tmp 隔离副本实证：删掉 022 行 bridge → exit 0 静默通过（修复前形态），deploy 多出依赖键亦无检测。

**Files modified:** `build/lib/check-pins.mjs`

**Commit:** 6356ff4

**Applied fix:** (e) 行存在性检查后新增 line 级 schema 前置断言：`line.bridge` 必须为非空 object（缺失/坏型 → exit 2 明确文案 `check-pins: line dsh022.bridge missing or not a non-empty object...`）；(i) 段改双向键集等值（`Object.keys(deps).sort()` vs `Object.keys(bridge).sort()` 以 `\u0000` 连接比较，不等 → exit 2 键集 mismatch 文案），再做逐项等值。负向复现三连：无 bridge → exit 2、多余依赖键 → exit 2、bridge 覆盖键值漂移 → exit 2；当前 pins.json 两行 bridge 与 package.json deps 恰等，`--offline` 仍 exit 0。

### WR-03: workflow_dispatch 的 dsh/gsd「manual override」输入从未消费——死输入误导操作者

**判定:** real

**证据:** `grep -c 'inputs\.' .github/workflows/compat-matrix.yml` = 0——L6-9 声明的两个 input 全 workflow 零消费，矩阵仍为硬编码 4 格。

**Files modified:** `.github/workflows/compat-matrix.yml`, `tests/compat-matrix.test.mjs`

**Commit:** 88d213d

**Applied fix:** 选 (b) 接线（02-01-PLAN action 4 明文要求 inputs 存在，删除会推翻计划结构面），但**接线形态与预判表不同**：实测 GitHub 语义 + actionlint 1.7.12 双确认 job 级 `if:` **无 matrix context**（actionlint 直接报 `context "matrix" is not allowed here`），预判的 job 级单行门不成立。改为 steps 级条件门（此处 inputs 与 matrix 均为合法 context）：6 个步骤各挂 `if: ${{ (!inputs.dsh || inputs.dsh == matrix.dsh) && (!inputs.gsd || inputs.gsd == matrix.gsd) }}`——push/PR 默认 inputs 为空串恒真、4 格全跑（行为不变），workflow_dispatch 手动 override 时只跑匹配格、其余格跳过。tests/compat-matrix.test.mjs 新增测试 ⑦（消费面哨兵）：断言每个 `run:` 步骤的上一行均为含 4 个 token 的 `if:` 门（消费面存在 + 工作步骤全覆盖 + 不漂移），头注释同步 ①-⑦。actionlint 0 findings。

### WR-04: 轴值一致性测试只验 pins→workflow 单向，幽灵格/冗余格/子串误配均漏检

**判定:** real

**证据:** tests/compat-matrix.test.mjs ② 实读确为 `y.includes(v)` 子串匹配且仅 pins→workflow 单向；复查证实 `1.20.10` 包含子串 `1.20.1`——旧断言对子串假匹配无感且无反方向检查。

**Files modified:** `tests/compat-matrix.test.mjs`

**Commit:** b2e351b

**Applied fix:** 定义整行 cell 正则 `CELL_RE`（`dsh:"..." gsd:"..." expect:(install-ok|reject)`）与 `parseCells` 单一解析真值（②③ 共用，不再二次扫描）；② 改为 `assert.deepEqual` 精确断言 cell 有序对集合恰等于 `pins.matrix.dsh × pins.matrix.gsd` 笛卡尔积；③ 复用同一 cells 做 expect 与支持窗一致断言（每行 dsh 对应格 ≥1 且 expect 与 `<unsupported>`→reject / 支持→install-ok 一致）；删除不再使用的 `esc` 辅助。突变负向实证（临时改 workflow 后 `git checkout --` 还原）：幽灵格（0.3.0-rc.1）/重复格/子串陷阱（1.20.1→1.20.10）三连均使 ② 红（fail 1）——三个盲区全部封堵。①④⑤⑥⑦ 语义不变。

### IN-01: BUILD.md TL;DR 的测试计数已过期（7/7 vs 实际 25/25）

**判定:** real

**证据:** BUILD.md L16 现写「预期 7/7」；修复当轮实测全套 `node --test tests/*.test.mjs` = 26/26（WR-03 新增测试 ⑦ 后比评审时点的 25 多 1）。

**Files modified:** `BUILD.md`

**Commit:** e8e9d73

**Applied fix:** L16 改为 `——预期 26/26（真实构建 smoke；兼容矩阵/版本/文档一致性等套件已并入）`（以最终实测为准；L110「实测 7/7」历史陈述按约定不动）。

### IN-02: compat-probe 对 CLI 用法错误返回 exit 2，与头注释的 1=IO·parse 契约有分歧

**判定:** real

**证据:** compat-probe.mjs L30（缺 --dsh）与 L32-34（--expect 非法/缺失）实读为 `finish(2, …)`，与同文件 L9 契约「1 IO·parse·environment mismatch」分歧；grep 确认 BUILD.md/README 均无 compat-probe 单列 exit 表需要同步（BUILD.md L200 只引用法不列 exit code）。

**Files modified:** `build/lib/compat-probe.mjs`

**Commit:** 4fe265a

**Applied fix:** 两处 CLI 用法错误改 `finish(1, …)`（参数解析类失败归 1，CI 中两者均红格、无行为回归），头注释契约保持不动。负向实证：缺 --dsh / bad expect / missing expect 三连均 exit 1 且文案不变。

### IN-03: check-pins registry 取样 spawnSync 无显式 timeout

**判定:** real

**证据:** check-pins.mjs (k) 段 spawnSync 实读仅 `{ encoding: 'utf8' }`，无 timeout——npm view 悬挂时本地在线档无限等待；节点原生语义实测 spawnSync timeout 触发时 `status===null && error.code==='ETIMEDOUT'`（用 `sleep 5` + timeout 1000 验证）。

**Files modified:** `build/lib/check-pins.mjs`

**Commit:** df81330

**Applied fix:** options 加 `timeout: 120_000`，在 `p.status !== 0` 检查前显式分支 `p.error.code === 'ETIMEDOUT'` → `finish(1, "check-pins: npm view <name>@<pin> timed out (120s) — retry with --offline or --registry=<url>")`；非超时 status 失败路径保持原语义。回归验证：`--offline` exit 0、在线档（真实 registry 取样）exit 0 全绿。Windows `npm.cmd` 半句按预判不修（README 支撑面 macOS/Linux/WSL）。

## Skipped Issues

（无——7/7 全部确认为真实问题并修复。）

---

_Fixer: gsd-code-fixer (DeepSeek Harness)_
