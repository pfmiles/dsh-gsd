// tests/compat-matrix.test.mjs — 02-01 Task 2 静态防线（VER-03 静态面 + VER-02
// pin 对齐面）：workflow 存在性 ① / 轴值 ⊆ pins.json ② / expect 列与支持窗一致
// ③ / 选项 A 路径哨兵 ④ / 编排哨兵 ⑤ / check-pins --offline 消费 ⑥。
// 零 YAML 依赖——全字符串/JSON 断言（断言面按 02-01-PLAN Task 2 action ①-⑥）。
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
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ① 存在性：workflow 文件存在且含 name / checkout v7 / setup-node v7。
test('① workflow 存在性与关键引用（compat-matrix / checkout@v7 / setup-node@v7）', () => {
  assert.ok(existsSync(WF), '.github/workflows/compat-matrix.yml missing')
  const y = readWF()
  assert.ok(y.includes('name: compat-matrix'), 'workflow name: compat-matrix missing')
  assert.ok(y.includes('actions/checkout@v7'), 'actions/checkout@v7 missing')
  assert.ok(y.includes('actions/setup-node@v7'), 'actions/setup-node@v7 missing')
})

// ② 轴值 ⊆ pins.json：dsh/gsd 两轴的每个值都必须出现在 workflow 文本里
//    （Anti-Pattern 4 防线——轴值唯一来源 pins.json，硬编码漂移在此失败）。
test('② 矩阵轴值 ⊆ pins.json（轴值唯一来源 = pins.json）', () => {
  const y = readWF()
  const pins = JSON.parse(readFileSync(PIN, 'utf8'))
  for (const v of [...pins.matrix.dsh, ...pins.matrix.gsd]) {
    assert.ok(y.includes(v), `workflow text missing axis value: ${v}`)
  }
})

// ③ expect 列与支持窗一致：对 pins.lines 每行，凡含该行 dsh 版本的矩阵格行
//    必须同含与该行窗口一致的 expect（<unsupported> → reject，否则 install-ok）。
test('③ expect 列与支持窗一致（unsupported 行 → reject，支持行 → install-ok）', () => {
  const y = readWF()
  const pins = JSON.parse(readFileSync(PIN, 'utf8'))
  for (const lineKey of Object.keys(pins.lines)) {
    const line = pins.lines[lineKey]
    const v = line.dsh
    const expected = line.dshRange === '<unsupported>' ? 'reject' : 'install-ok'
    const cellLines = y.split('\n').filter((l) => new RegExp(`dsh:\\s*"?${esc(v)}"?`).test(l))
    assert.ok(cellLines.length > 0, `no matrix cell for dsh ${v}`)
    for (const l of cellLines) {
      const m = /expect:\s*(install-ok|reject)/.exec(l)
      assert.ok(m, `cell for dsh ${v} has no expect column: ${l.trim()}`)
      assert.equal(
        m[1], expected,
        `cell for dsh ${v} has expect ${m[1]}, expected ${expected} (line dsh${lineKey} dshRange=${line.dshRange})`,
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
