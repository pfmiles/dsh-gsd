---
phase: 02-compat-matrix
reviewed: 2026-11-12T04:35:02Z
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
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 2: Code Review Report（HEAD 复审）

**Reviewed:** 2026-11-12T04:35:02Z
**Depth:** deep
**Files Reviewed:** 11
**Status:** issues_found

## Summary

本次是对 2026-11-11T18:37:00Z 报告的 HEAD 复审（HEAD `25ce425`，其上是 7 条 review-fix 提交 `55191da` / `6356ff4` / `88d213d` / `b2e351b` / `e8e9d73` / `4fe265a` / `df81330`）。任务不是复述修复，而是逐条证伪：修复是否真正消除原缺陷、是否引入新缺陷、原评审判净的相邻面是否仍然干净。

证据来源五类：(1) HEAD 源码与契约文档逐行直读（11 个受审文件 + BUILD.md §⑨ + 02-01/02-02/02-03 PLAN + 02-PATTERNS 的「三处执行真值」定义 + REQUIREMENTS VER-01..04/DEV-03）；(2) 在 `/tmp` 隔离副本（仅拷入 11 个受审文件，零仓库内改动）跑突变负向电池——check-pins 9 组（bridge 缺失/空对象/数组、键集双向、值漂移、`\u0000` 伪造、键序、基线），compat-matrix.test 12 组（幽灵格/重复格/子串陷阱/expect 反写/块式 YAML/行尾注释/注释内格文本/幽灵轴 ×2/门控取反/门控改 `||`/`uses:` 去门）；(3) 真实命令复跑：`node --test tests/*.test.mjs` = **26/26 pass**、`check-pins --offline` exit 0、在线 registry 取样 exit 0、`compat-probe` 5 种用法错误全 exit 1；(4) 假 `npm` shim 驱动 (k) 取样分支（精确命中 0 / drift 2 / spawn 失败 1 / 空数组 2）+ `spawnSync` 超时语义实测；(5) `actionlint` 1.7.12 三份探针 workflow 交叉验证 context 合法性（真文件 0 findings；仅 push 触发时 `inputs` 报未定义；job 级 `if:` 用 matrix 报 not allowed）。

核心结论：**前次 7 条发现全部 resolved，0 条 not resolved、0 条 regressed**。兼容门本体没有被削弱——探针仍只转发宿主求值（`compat-probe.mjs:88`，无任何本地 semver 判定）、pins 等值对照仍 fail-closed (a)-(k)、CI 格仍是真探针而非替身。新发现 **2 Warning + 1 Info，无 Critical**，两条 Warning 都是修复面外扩后留下的「静默放行」：(WR-05) 手动 override 匹配零格时全步 skip、run 不红；(WR-06) 矩阵轴值未被要求来自已声明清单，幽灵 dsh 轴可带任意 expect 全绿。IN-04 是测试 ⑦ 只断言 token 存在、不断言布尔语义。上游 registry 漂移（`compat-matrix.yml` L37）按用户裁决不计 Phase 02 发现，Phase 3 判断见文末专节。

编号说明：前次 7 个 ID（WR-01..04 / IN-01..03）在本报告中只作「已解决」复核，不再占用；新发现从 **WR-05 / IN-04** 起编，以免与 `02-REVIEW-DISPOSITION.md` 的既有 7 行冲突（该文件本轮未改动）。`tests/pending-phase-3/` 按范围裁决未评审、未运行、未计数。

## 前次发现复核（7/7 resolved）

| ID | 原缺陷（一句话） | 判定 | 证据锚点 |
|---|---|---|---|
| WR-01 | `parseVersion` 放行 semver 非法串（前导零 / rev=0） | **resolved** | `check-pins.mjs:29,31` 收紧且组映射无错位；4 个病理样本全 null |
| WR-02 | bridge 对照单向，缺 `bridge` 键即零次迭代通过 | **resolved** | `:116-119` schema 前置 + `:140-150` 双向键集/逐值；8 组突变 |
| WR-03 | `workflow_dispatch` 的 dsh/gsd 输入从未被消费 | **resolved** | 6 个步级门（2 `uses:` + 4 `run:`）；actionlint 三探针证 context 合法 |
| WR-04 | 轴一致性测试单向 + 子串匹配 | **resolved** | `compat-matrix.test.mjs:21-25,41-53` 整行锚定 + 笛卡尔积等值；5 组突变变红 |
| IN-01 | BUILD.md TL;DR 计数过期（7/7） | **resolved** | `BUILD.md:16` 26/26 = 实测 26 |
| IN-02 | compat-probe 用法错误 exit 2 与 `1=IO·parse` 契约分歧 | **resolved** | 13 个 `finish()` 站点与头注释逐项对齐；5 种用法错误全 1 |
| IN-03 | registry 取样 `spawnSync` 无 timeout | **resolved** | `:166` `timeout:120_000` + `:167-169` ETIMEDOUT→1；真 drift 仍 2 |

### WR-01: resolved —— 白名单收紧、捕获组映射正确；rev≥1 才是 §⑨ 契约，原评审建议的 `(0|…)` 自相矛盾

**File:** `build/lib/check-pins.mjs:29,31`
**Evidence:**
- 正则现为 `/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-([1-9]\d*)\.dsh(\d{3})$/`，返回值的三字段映射为 `gsd = m1.m2.m3`（拼接）、`rev = Number(m4)`、`line = m5` —— 组号重排后一一对应，无 off-by-one。实测 `'1.20.2-7.dsh021' → {gsd:'1.20.2', rev:7, line:'021'}`（三个字段同时取非默认值，任何两位交换都会被抓到）、`'1.20.1-10.dsh022' → rev 10`、`'1.20.10-1.dsh022' → gsd '1.20.10'`。
- 4 个病理样本 `'1.20.1-01.dsh022'` / `'1.20.1-0001.dsh022'` / `'1.20.1-0.dsh022'` / `'01.20.1-1.dsh022'` 全部 null，且已固化进 `tests/version.test.mjs:40-43`；末尾换行/空格形态在 JS 非 multiline 的 `$` 下同样判 null（实测）。
- rev 契约核实：`BUILD.md:172`「`rev` 修订号：同一 (gsd-ver, DSH 行) 对内**从 1 起**、逐次 +1」+ 02-02-PLAN 决策 A6 + `pins.json:3` 现值 `1.20.1-1.dsh022`。因此 `-(0|[1-9]\d*)` 会放行契约明令不可能的 rev=0，前次评审给出的正则与其自带 invalid 样本 `'1.20.1-0.dsh022'` 互相矛盾；修复者改用 `[1-9]\d*` 是**更正确**的落地，该偏差不算偏离。
- 回归面：README/BUILD 全部 `dsh-gsd@` 示例都是 `1.20.x-1.dsh022` 形态，`docs-consistency` ③ 仍绿（README L19/35/36/89/105/106，BUILD.md §⑨ TL;DR）。

### WR-02: resolved —— schema 前置 + 双向键集 + 逐值等值均在码；「deps 键集 ≡ bridge 键集」是契约内收紧，不是锁死仓库

**File:** `build/lib/check-pins.mjs:116-119,138-150`
**Evidence:**
- 行级 schema 前置：`line.bridge` 必须是非空、非数组 object，否则 exit 2。突变三连（删键 / `{}` / `[]`）全部 exit 2，文案 `check-pins: line dsh022.bridge missing or not a non-empty object — three-pin equality requires a bridge map` —— 原先「缺 bridge ⇒ 零次迭代静默通过」的退化路径已消失。
- (i) 段先 `Object.keys(deps).sort()` vs `Object.keys(bridge).sort()` 以 `\u0000` 连接做键集等值，再逐键逐值 `deps[name] !== pin`。突变矩阵：deps 多出 `yaml` → exit 2 键集 mismatch；bridge 删键但 dep 保留（反方向）→ exit 2；bridge 值漂移 → exit 2 `dependency … mismatch`；键序反转 → exit 0（无假红）；当前仓库 → exit 0 `pins: all consistent (line dsh022)`。
- 契约判断（回答「是否让仓库永远无法新增非 DSH 依赖」）：02-PATTERNS:53 明确「本 phase 的桥接 pin 文件指三处执行真值：`dependencies` 两件 pin + `peerDependencies` 范围，全部经 check-pins 对照 pins.json 校验」，BUILD.md §⑨ 又把 pins.json 定为「版本串单点真源」。因此「deps 键集必须恰等于 bridge 键集」是契约内收紧，不是新增约束：将来若真引入非 DSH 运行期依赖，正确手续是把它写进 `lines.<line>.bridge`（于是自动进入 (k) 取样），而不是绕过对照器。代价是这条新 exit 2 未写进 `BUILD.md:199` 的退出语义枚举——同处 `engines.node`（(h) 段，早于本 phase 修复就存在）本来也没列，属清单不完整的既有问题，不计新发现。
- `\u0000` 连接不可伪造：npm 包名字符集不含 U+0000；且即使构造出 `["a","b"]` 与 `["a\u0000b"]` 的连接碰撞，键集比较之后的逐值循环仍会因 `deps['a'] === undefined` 落到 `dependency a mismatch`（exit 2）。实测把 bridge 键改成带 `\u0000` 的伪造形态 → exit 2 键集 mismatch。
- 残余硬化（非发现）：schema 只断言 bridge 是「非空 object」，未断言值是字符串；`null ↔ null` 这类自洽畸形对能在 `--offline` 下过 (i)（极低概率的人为写入）。后续可在 schema 前置补一行 `Object.values(bridge).every((p) => typeof p === 'string' && p !== '')`，对当前仓库零影响。

### WR-03: resolved（残留面另记 WR-05）—— inputs 已真实接线；steps 级是正确 GitHub 语义，job 级确实不可行

**File:** `.github/workflows/compat-matrix.yml:25,27,32,35,40,43`
**Evidence:**
- 6 个步骤各挂 `if: ${{ (!inputs.dsh || inputs.dsh == matrix.dsh) && (!inputs.gsd || inputs.gsd == matrix.gsd) }}`（2 个 `uses:` + 4 个 `run:`，`grep -c 'if: ${{ (!inputs'` = 6）。原缺陷「全文件零 `inputs.*` 引用」消失，02-SECURITY 已把该门登记为 T-2-09。
- (a) `inputs` 在 `steps.if` 合法，**且仅因为本 workflow 声明了 `workflow_dispatch`**：actionlint 1.7.12 对真文件 exit 0 无输出；把触发改成仅 push 的同构探针报 `property "dsh" is not defined in object type {}`；保留 dispatch 的探针 exit 0。运行时 push/PR 下 `inputs` 为空对象，`inputs.dsh → null`、`!null → true`，4 格行为与修复前一致（不是「空串」而是 null/空，结论同为恒真）。
- 修复者对「job 级 `if:` 无 matrix context」的判断独立复现：job 级 `if: ${{ … matrix.dsh … }}` 被 actionlint 判 `context "matrix" is not allowed here. available contexts are "github", "inputs", "needs", "vars"`。前次评审建议的 job 级单行门确实不成立，steps 级是唯一正解，该偏离不算偏离。
- 未来风险（当前为零风险）：两个 input 都无 `default:`。非手动触发时 `inputs` 会取默认值（社区报告语义，本 phase 未独立复核）；一旦有人补 `default:`，push/PR 的门会按默认值静默过滤，4 格可能退化为 2 格。建议在 input description 或 YAML 注释里锁死「不得加 default」。
- (b) 零匹配与 (c) 测试 ⑦ 的断言强度分别见 WR-05 与 IN-04。

### WR-04: resolved —— 整行锚定解析 + 笛卡尔积精确等值；三个旧盲区与两个新变体全部变红

**File:** `tests/compat-matrix.test.mjs:21-25,41-53`
**Evidence:**
- `CELL_RE` 为 `^…$` 整行锚定（`^\s*-\s*\{\s*dsh:\s*"([^"]+)"\s*,\s*gsd:\s*"([^"]+)"\s*,\s*expect:\s*(install-ok|reject)\s*\}\s*$`），`parseCells` 是 ②③ 共用的单一解析真值；② 用 sorted `${dsh}\u0000${gsd}` 数组 `deepEqual` 笛卡尔积（含计数，重复格必然不等）。
- 突变（隔离副本，`node --test tests/compat-matrix.test.mjs`）：幽灵格（`0.3.0-rc.1`）、重复格、子串陷阱（`1.20.1 → 1.20.10`）、块式 YAML 改写（三行 mapping）、行尾注释 —— **5 组全部 ② 红**；单格 `expect` 反写 → ③ 红（② 仍绿，分工正确）；注释行内的格文本不被计数（② 仍绿）；基线 7/7 绿。
- 构造「过测试但语义错」的尝试：**不改 pins.json 时未找到**。② 锁死 (dsh,gsd) 集合与计数、③ 锁死 `expect` 与 `lines.<k>.dshRange` 的对应，两条合起来把 4 格钉死；解析形态一旦漂移（块式/尾注）就计入不足而 fail-closed。唯一仍可全绿的形态是把幽灵值同时写进 `pins.matrix.dsh` —— 记为新发现 WR-06。

### IN-01: resolved —— 计数已对齐实测

**File:** `BUILD.md:16`
**Evidence:** L16 现为「预期 26/26（真实构建 smoke；兼容矩阵/版本/文档一致性等套件已并入）」；HEAD 实测 `node --test tests/*.test.mjs` = 26 tests / 26 pass / 0 fail（`tests/pending-phase-3/` 不被 `tests/*.test.mjs` glob 递归，未计入）。L110 的「实测 7/7」是 01-02 偏差 2 的历史陈述，按约定保留、非现时预期。

### IN-02: resolved —— 用法错误归 1，13 个 finish 站点与头注释自洽

**File:** `build/lib/compat-probe.mjs:9-10,30,33`
**Evidence:** 头注释 0/1/2 = 结果一致 / IO·parse·环境错位 / 求值结果不符。全文件 `finish()` 站点：**1** 共 9 处（缺 `--dsh`、非法 `--expect`、manifest 装载、宿主模块解析、host package.json 读取、host 版本错位、模块无导出、宿主求值抛错、兜底 unexpected）；**0** 共 2 处（install-ok confirmed / reject confirmed）；**2** 共 2 处（install-ok 期望落空、reject 期望未成立）——与头注释逐项对齐。实测 5 种用法错误全 exit 1：无参、缺 `--expect`、非法 `--expect`、`--dsh` 缺值（`parseArgs` throw → L115 兜底 1）、未知选项。无任何 CLI 用法错误落到 2。

### IN-03: resolved —— timeout 已传、超时归 1 带重试提示、真漂移仍是 2

**File:** `build/lib/check-pins.mjs:166-169`
**Evidence:** `spawnSync('npm', […], { encoding: 'utf8', timeout: 120_000 })`；`p.error.code === 'ETIMEDOUT'` 分支置于 `p.status !== 0` 之前 → `finish(1, "check-pins: npm view … timed out (120s) — retry with --offline or --registry=<url>")`。`spawnSync` 超时语义实测：`status=null, signal=SIGTERM, error.code=ETIMEDOUT`，分支可达。假 `npm` shim 驱动：精确命中 → exit 0；返回 `["0.2.2-rc.2"]` → exit 2 `registry drift`；返回 `[]` → exit 2；exit 7 + stderr → exit 1 且 stderr 透传；对真实 registry 直跑 `node build/lib/check-pins.mjs` → exit 0。结论：超时没有吞掉真信号（drift 仍 2、取样失败仍 1）。Windows `npm.cmd` 半句维持不修（README 支撑面 macOS/Linux/WSL），非本 phase 缺陷。

## Warnings

### WR-05: 手动 override 匹配零格时 4 格全 skip，run 仍然不红（fail-open 空跑）

**File:** `.github/workflows/compat-matrix.yml:25-44`
**Issue:** 步级门是「匹配即跑」，但没有「至少匹配一格」的守卫。操作者在 `workflow_dispatch` 里填一个不在 `pins.matrix` 轴上的值（拼写错、漏 `-rc.1`、带空格，或填上游存在但未 pin 的版本如 `0.2.2-rc.2`）时，4 条矩阵腿的 6 个步骤全部 skip。GitHub 以「失败步」判红，skip 本身不产生失败信号：全 skip 的矩阵腿要么记 success 要么记 skipped，两种都不会让这次 run 变红。于是结果与 WR-03 想消灭的「误导操作者」同构，只是从「override 被忽略」变成「override 命中空集却全绿」。
**Evidence:** 4 格 × 6 步全部只由 L25/27/32/35/40/43 的同一个 `if:` 门控；全文件仅一个 job（`jobs.compat-matrix`），无 `if: always()` 守卫、无轴值前置校验（`grep -c 'if: ${{ (!inputs'` = 6，6 个步骤门是同一表达式；全文第 7 处 `if:` 字样只出现在 L24 注释里）。本地无 `act` 且 CI 未 push（D-R4），无法活体复现，故按 GitHub 的 skip/结论语义判定；该结论在 Phase 3 首次 dispatch 时可一次证实。
**Fix:** 推荐加一个无矩阵的 preflight job，dispatch 时对照 `pins.json` 轴值，零匹配即红（push/PR 不受影响）：
```yaml
  dispatch-guard:
    if: ${{ github.event_name == 'workflow_dispatch' && (inputs.dsh || inputs.gsd) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: |
          node --input-type=module -e '
            import { readFileSync } from "node:fs";
            const p = JSON.parse(readFileSync("build/assets/pins.json", "utf8"));
            const dsh = process.env.DSH_IN || "", gsd = process.env.GSD_IN || "";
            if ((dsh && !p.matrix.dsh.includes(dsh)) || (gsd && !p.matrix.gsd.includes(gsd))) {
              console.error(`no matrix cell matches dsh=${dsh || "*"} gsd=${gsd || "*"}`);
              process.exit(1);
            }'
        env:
          DSH_IN: ${{ inputs.dsh }}
          GSD_IN: ${{ inputs.gsd }}
```
若不接受新 job，退路是把两个 input 的 description 改成「必须命中矩阵轴值，否则整次运行空跑」并在注释里写明——但那等于把误导重新写进文档，不推荐。

### WR-06: 矩阵轴值未被要求来自已声明清单——幽灵 dsh 轴可带任意 expect 全绿

**File:** `tests/compat-matrix.test.mjs:58-75`（③ 的遍历面）· `build/lib/check-pins.mjs:64-73`（(b) schema 面）
**Issue:** ② 把 workflow 格 ⇄ `pins.matrix` 双向锁死，③ 把 `expect` ⇄ `pins.lines[*].dshRange` 锁死，但两者共同的中间层——「`pins.matrix` 的轴值必须是已声明对象」——没有任何断言。(b) 只查 `matrix.dsh` 是非空数组，`lines` 只被按「当前声明行」校验；③ 只遍历 `Object.keys(pins.lines)`。因此：往 `pins.matrix.dsh` 加一个 `lines` 无对应键的值（如 `0.3.0-rc.1`，或**上游真实存在但未 pin 的 `0.2.2-rc.2`**），再补两条对应格，② 因「格 = 轴笛卡尔积」而绿、③ 因根本不遍历该轴值而**不检查这些格的 `expect`**、(a)-(j) 只校验当前声明行、CI 的 `--offline` 又跳过取样 —— 7 条测试 + check-pins 全绿。后果：矩阵会对一个没有 `lines` 记录、没有 bridge pin、没有 `engines.dsh` 窗口的 DSH 行「通过」验证，而 VER-03 的语义是「每个 DSH 兼容行有构建/冒烟验证记录」，BUILD.md §⑨ 的 021 行也写明「行锁定 = 每行独立版本」；幽灵轴恰好绕开行锁定。同族 gap 在 gsd 轴上是「`matrix.gsd` 值未要求出现在 THIRD-PARTY-NOTICES 的 canonical 双行表」，但 gsd 轴有运行期回填（build.mjs 真实拉取该版本 tarball），故以 dsh 轴为主发现。
**Evidence（隔离副本突变）:** `pins.matrix.dsh` 追加 `0.3.0-rc.1`、workflow 追加 2 格，`expect` 先取 `reject` 再取 `install-ok` 各跑一轮 → `node --test tests/compat-matrix.test.mjs` **7/7 pass**，`node build/lib/check-pins.mjs --offline` **exit 0** `pins: all consistent (line dsh022)`。恢复 HEAD 原状后 7/7 绿、exit 0（确认无假红）。
**Fix:** 在测试 ③ 前把 dsh 轴逐值回溯到 `pins.lines`（4 行，已对 HEAD 验证通过、对上述幽灵轴突变必红）：
```js
const lineDsh = Object.values(pins.lines).map((l) => l && l.dsh)
for (const d of pins.matrix.dsh) {
  assert.ok(
    lineDsh.includes(d),
    `matrix.dsh '${d}' has no pins.lines entry (declared: ${lineDsh.join(', ')}) — matrix axis must be a pinned DSH line`,
  )
}
```
建议再在 check-pins (b) 段镜像同一条 fail-closed（`finish(2, …)`），这样 test ⑥ 的 spawn 与 CI 的 `--offline` 步会同时覆盖；gsd 轴可后续加 THIRD-PARTY-NOTICES 表的机械解析（Phase 3 范围）。

## Info

### IN-04: 测试 ⑦ 只断言 token 存在，不断言布尔语义、也不覆盖 `uses:` 步

**File:** `tests/compat-matrix.test.mjs:106-122`
**Issue:** `isGate()` 判的是「该行 `trim()` 后以 `if:` 开头且同时含 `inputs.dsh` / `matrix.dsh` / `inputs.gsd` / `matrix.gsd` 四个子串」，且只检查每个 `run:` 步的**上一行**。因此三种语义错误下 ⑦ 仍绿：(i) 门写成恒假 `if: ${{ inputs.dsh && inputs.dsh == matrix.dsh && inputs.gsd && inputs.gsd == matrix.gsd }}`（push/PR 下 4 格全 skip，等价于把 CI 静默关掉）；(ii) 把 `&&` 写成 `||`（手动 override 时跨轴泄漏：dsh 命中即放过 gsd 不匹配的格）；(iii) 只删掉两个 `uses:` 步的 `if:`（`checkout`/`setup-node` 未门控）。此外它对写法位置敏感：`- if:` 的 flow-map 形态 `trim()` 后以 `- ` 开头，若把某个 `run:` 步改成该形态会误红。所以 ⑦ 是「消费面存在哨兵」，达不到 REVIEW-FIX 宣称的「工作步骤全覆盖 + 不漂移」。
**Evidence:** 三组突变（B9 门取反 / B10 改 `||` / B11 `uses:` 去门）下 `node --test tests/compat-matrix.test.mjs` 均 **7/7 pass**；当前 6 个步骤里只有 4 个 `run:` 步（`if:` 形态）落在断言面内，2 个 `uses:` 步（`- if:` 形态，`trim()` 后以 `- ` 开头）**根本不被检查**——它确属「存在性」而非「等值」断言。
**Fix:** 把断言从「含 token」升级为「表达式全文等值 + 覆盖 `uses:` 步」（下面这段已对 HEAD 验证 6/6 通过；对 B9/B10/B11 必红）：
```js
const norm = (l) => l.trim().replace(/^-\s+/, '')
const GATE = 'if: ${{ (!inputs.dsh || inputs.dsh == matrix.dsh) && (!inputs.gsd || inputs.gsd == matrix.gsd) }}'
assert.equal(lines.filter((l) => norm(l) === GATE).length, 6, 'expected exactly 6 gated steps')
for (const i of lines.map((l, j) => (/^\s+(run|uses):/.test(l) ? j : -1)).filter((j) => j >= 0)) {
  assert.ok(
    lines.slice(Math.max(0, i - 3), i).some((l) => norm(l) === GATE),
    `step at line ${i + 1} is not gated by the exact inputs ∩ matrix condition`,
  )
}
```

## Non-findings（复核过、确认无问题的面）

- **探针语义**：`compat-probe.mjs` 仍只调用宿主 `evaluatePluginCompatibility(manifest, {}, values.dsh)`（L88），无本地 semver 判定；环境 guard 仍按 host package.json 版本比对（L71-77）；`--expect` 两分支的返回契约判定未变。
- **pins 真源 ↔ 执行真值**：(e)-(j) 六项逐字等值仍在码且顺序合理；`pins.json:lines.022.bridge` 与 `package.json` `dependencies` 恰等（2 键 2 值），`peer` 与 `pins.lines.022.peer` 恰等；`lines.021.bridge` 是前行专属值（不参与当前声明行对照，符合「行锁定 = 每行独立版本」语义）；`--offline` 与在线两条调用均 exit 0。
- **文档一致性**：README 双语版本方案/升级回滚示例/`engines.dsh` 窗口串与 pins.json 等值，`THIRD-PARTY-NOTICES.md` 的 GSD 轴 canonical（1.20.1 / 1.19.0）与 `pins.matrix.gsd` 一致，共享 7 条断言全绿。
- **测试计数与打包链**：`npm test` 的 glob（`tests/*.test.mjs`）不递归，`tests/pending-phase-3/` 不被消费；26/26 与 BUILD.md 承诺一致；`prepack` 链未被本 phase 触碰。

## Phase 3 note（不计 Phase 02 发现）：`compat-matrix.yml` L37 是否按现文可直接激活

按用户裁决，上游 `@deepseek-ai/dsh-skill-filesystem@0.2.2-rc.2` / `@deepseek-ai/dsh-fs@0.2.2-rc.2`（2026-11-12T01:54Z / 02:00Z 发布）使根 `peerDependencies` 范围 `>=0.2.2-rc.1 <0.3.0-0` 解析到 rc.2，与 rc.1 锁定的 bridge deps 冲突；`npm install --no-save --ignore-scripts --no-package-lock @deepseek-ai/dsh@<line>`（L37 原文）已对 4 格全部 ERESOLVE exit 1。**我的判断：L37 按现文不宜直接激活。**

- 4 格会一起红在安装步而不是探针步，矩阵丧失区分度（`install-ok` 与 `reject` 格同因失败），首绿不可达；且失败原因与「宿主是否兼容本插件」无关，排障会指向错误方向。
- 当前范围确实放行 rc.2（本机 `npm` 自带 semver 实测：`satisfies('0.2.2-rc.2', '>=0.2.2-rc.1 <0.3.0-0') === true`），所以这不是安装器的偶发行为，而是窗口语义的直接结果。
- 候选修法优先级（Phase 3 裁决）：(1) 收紧 peer 形态让 `0.2.2-rc.2` 不再满足，二选一并实测：exact peer `"0.2.2-rc.1"`（与「行锁定 = 每行独立版本」一致，代价是 DSH 0.2.2 正式版发布时要再改一次），或右上界 `>=0.2.2-rc.1 <0.2.2-rc.2`（实测排除 rc.2 / rc.10 与 0.2.2 正式版）。**注意 prerelease 上界陷阱**：`<0.2.2-rc.2-0` 这类 `-0` 后缀写法在这里**不成立**——实测 `satisfies('0.2.2-rc.2', '>=0.2.2-rc.1 <0.2.2-rc.2-0') === true`（`-0` 把末位变成字母数字 id，排序反而高于数字 id）。落地时把值同步进 `pins.lines.022.peer`、README/BUILD 的窗口串与 (j) 对照，一处改、全链复跑——这是 BUILD.md §⑨「单一真源」的正规手续。(2) `--legacy-peer-deps` 不可用（已知缺 `dsh-app-boot`，探针直接 exit 1）。(3) `--force` 只能作一次性诊断，不得进 workflow——它把 peer 冲突变成静默容忍，等于让 (g)(j) 的窗口承诺与真实安装脱钩。
- 无论选哪条，建议激活时补一条「(j) 的字符串等值预测 = 实际 install 解析结果」的门（例如安装后 `npm ls @deepseek-ai/dsh-skill-filesystem` 与 pins 对照），否则 rc.2 这类上游漂移会持续以「安装步红」而非「pin 对照红」的形式出现。
- 与本轮新发现的关系：WR-06 的幽灵轴风险在 Phase 3 更现实——rc.2 是真实存在、可安装、未 pin 的版本；若为它加矩阵格，务必同时补 `lines.*` 的 bridge/peer（否则静态面不会拦，见 WR-06 的突变证据）。

---

_Reviewed: 2026-11-12T04:35:02Z_
_Reviewer: gsd-code-reviewer (DeepSeek Harness)_
_Depth: deep_