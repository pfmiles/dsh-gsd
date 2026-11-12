// tests/compat-matrix.test.mjs — 02-01 Task 2 静态防线（VER-03 静态面 + VER-02
// pin 对齐面）：workflow 存在性 ① / 矩阵格集合恰等于 pins.json 笛卡尔积 ② /
// expect 列与支持窗一致 ③ / 选项 A 路径哨兵 ④ / 编排哨兵 ⑤ /
// check-pins --offline 消费 ⑥ / workflow_dispatch inputs 消费面哨兵 ⑦ /
// 门控形态守卫 ⑧（G-1，03-VALIDATION 的 Nyquist 缺口）。
// 零 YAML 依赖——全字符串/JSON 断言（断言面按 02-01-PLAN Task 2 action ①-⑦，
// ⑧ 按 03-VALIDATION G-1 补测）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const WF = join(ROOT, '.github', 'workflows', 'compat-matrix.yml')
const PIN = join(ROOT, 'build', 'assets', 'pins.json')

const readWF = () => readFileSync(WF, 'utf8')

// 格行解析（②③ 共用单一真值，不重复扫描）：整行正则抽取
// - { dsh: "...", gsd: "...", expect: install-ok|reject } 三元组。
const CELL_RE = /^\s*-\s*\{\s*dsh:\s*"([^"]+)"\s*,\s*gsd:\s*"([^"]+)"\s*,\s*expect:\s*(install-ok|reject)\s*\}\s*$/
const parseCells = (y) => y.split('\n')
  .map((l) => CELL_RE.exec(l))
  .filter(Boolean)
  .map((m) => ({ dsh: m[1], gsd: m[2], expect: m[3] }))

// ① 存在性：workflow 文件存在且含 name / checkout v7 / setup-node v7。
test('① workflow 存在性与关键引用（compat-matrix / checkout@v7 / setup-node@v7）', () => {
  assert.ok(existsSync(WF), '.github/workflows/compat-matrix.yml missing')
  const y = readWF()
  assert.ok(y.includes('name: compat-matrix'), 'workflow name: compat-matrix missing')
  assert.ok(y.includes('actions/checkout@v7'), 'actions/checkout@v7 missing')
  assert.ok(y.includes('actions/setup-node@v7'), 'actions/setup-node@v7 missing')
})

// ② 矩阵格集合 = pins.json 笛卡尔积（双向精确等值）：整行解析格为 (dsh,gsd,
//    expect) 三元组，dsh×gsd 有序对集合 deepEqual 恰等于 pins.matrix 两轴
//    笛卡尔积——幽灵格（pins 未声明的实验格）、冗余格（轴移除后残留）、重复格、
//    1.20.1 vs 1.20.10 子串假匹配均在此失败（Anti-Pattern 4：轴值唯一来源
//    = pins.json，双向、计数唯一）。
test('② 矩阵格集合恰等于 pins.json 笛卡尔积（双向精确等值）', () => {
  const y = readWF()
  const pins = JSON.parse(readFileSync(PIN, 'utf8'))
  const cells = parseCells(y)
  const expectedPairs = pins.matrix.dsh
    .flatMap((d) => pins.matrix.gsd.map((g) => `${d}\u0000${g}`))
    .sort()
  assert.deepEqual(
    cells.map((c) => `${c.dsh}\u0000${c.gsd}`).sort(),
    expectedPairs,
    `matrix cells must equal exactly pins.matrix.dsh × pins.matrix.gsd (got ${cells.length} cells)`,
  )
})

// ③ expect 列与支持窗一致（复用 ② 的格解析结果）：对 pins.lines 每行，凡含该
//    行 dsh 的格全部与该行窗口一致的 expect（<unsupported> → reject，否则
//    install-ok）；格存在性由 ② 的精确等值保证，此处不做子串扫描。
test('③ expect 列与支持窗一致（unsupported 行 → reject，支持行 → install-ok）', () => {
  const y = readWF()
  const pins = JSON.parse(readFileSync(PIN, 'utf8'))
  const cells = parseCells(y)
  for (const lineKey of Object.keys(pins.lines)) {
    const line = pins.lines[lineKey]
    const v = line.dsh
    const expected = line.dshRange === '<unsupported>' ? 'reject' : 'install-ok'
    const matching = cells.filter((c) => c.dsh === v)
    assert.ok(matching.length > 0, `no matrix cell for dsh ${v}`)
    for (const c of matching) {
      assert.equal(
        c.expect, expected,
        `cell dsh=${c.dsh} gsd=${c.gsd} has expect ${c.expect}, expected ${expected} (line dsh${lineKey} dshRange=${line.dshRange})`,
      )
    }
  }
})

// ④ 选项 A 路径哨兵：workflow 必须引用 build/lib 工具路径，且不得漂回
//    scripts/ 形式（D-R6——scripts/ 被 gitignore 与 build.mjs 捕获段覆盖）。
test('④ 选项 A 路径哨兵（build/lib 引用存在，scripts/ 反漂移）', () => {
  const y = readWF()
  assert.ok(y.includes('node build/lib/check-pins.mjs --offline'), 'check-pins build/lib step missing')
  assert.ok(y.includes('node build/lib/compat-probe.mjs'), 'compat-probe build/lib step missing')
  assert.ok(!y.includes('scripts/pins.json'), 'scripts/pins.json leaked into workflow (D-R6)')
  assert.ok(!y.includes('scripts/check-pins'), 'scripts/check-pins leaked into workflow (D-R6)')
  assert.ok(!y.includes('scripts/compat-probe'), 'scripts/compat-probe leaked into workflow (D-R6)')
})

// ⑤ 编排哨兵：workflow 内不得出现 dsh plugin add（Anti-Pattern 3——profile
//    bootstrap 归 DEV-03/P5，矩阵格只做宿主求值探针）。
test('⑤ 编排哨兵：workflow 内不得出现 dsh plugin add（Anti-Pattern 3）', () => {
  assert.ok(!readWF().includes('dsh plugin add'), 'dsh plugin add leaked into workflow')
})

// ⑥ check-pins 消费（D-R5）：check-pins 进 test 消费、prepack 链未动的落地
//    形态——spawn --offline 全等绿是 pin 对齐的机器防线（离线可跑，无网络依赖）。
test('⑥ check-pins --offline 消费（D-R5：tests 内 spawn，prepack 链不动）', () => {
  const r = spawnSync(process.execPath, [join(ROOT, 'build', 'lib', 'check-pins.mjs'), '--offline'], { encoding: 'utf8' })
  assert.equal(r.status, 0, `check-pins --offline failed (exit ${r.status}): ${r.stdout} ${r.stderr}`)
  assert.ok((r.stdout || '').includes('pins: all consistent'), `missing success line: ${r.stdout}`)
})

// ⑦ inputs 消费面哨兵：workflow_dispatch 声明的 dsh/gsd「manual override」必须被
//    真实接线消费——每个 run 步骤的上一行为单行 if: 条件门，同时引用
//    inputs.dsh+matrix.dsh 与 inputs.gsd+matrix.gsd（消费面存在、工作步骤全覆盖；
//    GitHub 语义下 job 级 if: 无 matrix context，故门落在 steps 级）。
test('⑦ workflow_dispatch inputs 消费面哨兵（inputs ∩ matrix 条件门盖住全部 run 步骤）', () => {
  const y = readWF()
  const lines = y.split('\n')
  const isGate = (l) =>
    l.trim().startsWith('if:') &&
    l.includes('inputs.dsh') && l.includes('matrix.dsh') &&
    l.includes('inputs.gsd') && l.includes('matrix.gsd')
  const runIndexes = lines
    .map((l, i) => (/^\s+run:/.test(l) ? i : -1))
    .filter((i) => i >= 0)
  assert.ok(runIndexes.length >= 3, `expected >=3 run steps, found ${runIndexes.length}`)
  for (const i of runIndexes) {
    assert.ok(
      isGate(lines[i - 1]),
      `run step at line ${i + 1} is not gated by an inputs ∩ matrix if: on the previous line — previous: '${(lines[i - 1] || '').trim()}'`,
    )
  }
})

// ⑧ 门控形态守卫（G-1）：探针 `run: |` 块内「解析树 == matrix.dsh」断言必须被
//    canonical 门行 `if [ "${{ matrix.expect }}" = "install-ok" ]; then` 门控。
//    理由是实测的：reject 两格根解析到 manifest exact peer 占位的 0.2.2-rc.1，
//    无条件断言 ⇒ 首跑即红（直违 SC-5 无红跑历史）。本仓史里「证明断言存在」的
//    检查被 4 个连续变异（|| 形 / != 反写 / && 形 / brace 形 `[ … ] && { …; exit 2; }`）
//    逐一绕过，直到门行被整行锚定才收敛——故此处：(1) 端到端锚定 canonical 门行
//    （不接受任何尾随内容）；(2) `matrix.expect` 在**非注释行**里恰 2 次（门 + 探针调用），
//    杜绝第二处未门控用法；(3) 解析断言与 `exit 2` 各恰 1 条且都落在（门, 收口 fi）
//    之间；(4) 逐个拒绝已知退化形态（含「门只在注释里」）。
const GATE_RE = /^\s+if \[ "\$\{\{ matrix\.expect \}\}" = "install-ok" \]; then$/m
const GATE_LINE_RE = /^\s+if \[ "\$\{\{ matrix\.expect \}\}" = "install-ok" \]; then$/

test('⑧ G-1 门控形态守卫（canonical gate 端到端锚定，解析断言与 exit 2 在门内）', () => {
  const y = readWF()
  const lines = y.split('\n')

  // (1) canonical 门行存在，且整行锚定——尾随 junk、`||`/`!=`/`&&`/brace 形均在此红。
  const m = GATE_RE.exec(y)
  assert.ok(
    m,
    'canonical 门行缺失或非整行锚定：期望 /^\\s+if \\[ "${{ matrix.expect }}" = "install-ok" \\]; then$/m '
      + '（`||` / `!=` / `&&` / `[ … ] && { … }` 等退化形态一律不接受）',
  )
  const gateIdx = y.slice(0, m.index).split('\n').length - 1
  const gateLine = lines[gateIdx]
  assert.ok(!/^\s*#/.test(gateLine), `门行只出现在注释里（L${gateIdx + 1}）：'${gateLine}'`)

  // 唯一性：全文件只允许一行「if [ … matrix.expect …」形态，防止旁路门。
  const gateish = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^\s*if\s+\[/.test(l) && l.includes('matrix.expect'))
  assert.equal(
    gateish.length, 1,
    `matrix.expect 门行应恰 1 行，实际 ${gateish.length} 行（L${gateish.map((g) => g.i + 1).join('/L')}）`,
  )
  assert.equal(gateish[0].i, gateIdx, '命中的 canonical 门行不是唯一的 matrix.expect 门行')

  // (2) 全文件 `matrix.expect` 恰 2 次（门 + 探针调用），无第二处未门控用法。
  //     注释行不计：未来某条 `# … matrix.expect …` 说明不该让本断言误红。
  const codeText = lines.filter((l) => !/^\s*#/.test(l)).join('\n')
  const expectUses = [...codeText.matchAll(/matrix\.expect/g)].length
  assert.equal(
    expectUses, 2,
    `非注释行里 matrix.expect 应恰出现 2 次（门 + 探针调用），实际 ${expectUses} 次`
      + `${expectUses > 2 ? '——疑似新增未门控用法' : ''}`,
  )

  // (3) 解析断言 + exit 2 各恰 1 条，且都在（门行, 收口 fi）之间。
  const gateIndent = gateLine.match(/^\s*/)[0].length
  const closingFi = lines.findIndex(
    (l, i) => i > gateIdx && l.trim() === 'fi' && (l.match(/^\s*/)[0].length <= gateIndent),
  )
  assert.ok(
    closingFi > gateIdx,
    `门行 L${gateIdx + 1}（indent ${gateIndent}）之后找不到同层收口 fi`,
  )

  const resolveHits = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => l.includes("require.resolve('@deepseek-ai/dsh-skill-filesystem/package.json')"))
  assert.equal(resolveHits.length, 1, `解析断言（require.resolve … package.json）应恰 1 条，实际 ${resolveHits.length} 条`)
  assert.ok(
    resolveHits[0].l.includes('RESOLVED'),
    `解析断言行未绑定到 RESOLVED：'${resolveHits[0].l.trim()}'`,
  )
  assert.ok(
    resolveHits[0].i > gateIdx && resolveHits[0].i < closingFi,
    `解析断言在门控区外：L${resolveHits[0].i + 1} 不落在（L${gateIdx + 1}, L${closingFi + 1}）内`,
  )

  const exitHits = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^\s*exit 2\s*$/.test(l))
  assert.equal(exitHits.length, 1, `exit 2 应恰 1 条（未门控的 exit 2 会让 reject 格红），实际 ${exitHits.length} 条`)
  assert.ok(
    exitHits[0].i > gateIdx && exitHits[0].i < closingFi,
    `exit 2 被挪到门控区外：L${exitHits[0].i + 1} 不落在（L${gateIdx + 1}, L${closingFi + 1}）内`
      + '——reject 格会解析失败并 exit 2，首跑即红',
  )

  // (4) 逐个拒绝已知退化形态（每个都给可区分的红消息）。
  assert.ok(!gateLine.includes('||'), `门行含 '||'（fail-open 形态）：'${gateLine.trim()}'`)
  assert.ok(!gateLine.includes('!='), `门行含 '!='（条件反写形态）：'${gateLine.trim()}'`)
  assert.ok(!gateLine.includes('&&'), `门行含 '&&'（组合条件形态）：'${gateLine.trim()}'`)
  assert.equal(
    GATE_LINE_RE.exec(gateLine)?.[0], gateLine,
    `门行未整行匹配 canonical 形态（尾随 junk）：'${gateLine}'`,
  )
  const braceForm = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /^\s*if\s+\[.*\]\s*&&\s*\{/.test(l))
  assert.equal(
    braceForm.length, 0,
    `出现 brace 形门（\`[ … ] && { …; exit 2; }\`，曾在「证明断言存在」检查下漏过）：`
      + `L${braceForm.map((b) => b.i + 1).join('/L')}`,
  )
})
