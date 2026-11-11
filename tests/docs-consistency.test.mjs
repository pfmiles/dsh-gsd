// tests/docs-consistency.test.mjs — 文档/清单一致性静态防线（per-commit 秒级反馈回路）。
//
// 覆盖 plan 02-02 Task 2 的①-⑦断言面：① VER-04 engines.node ↔ README 双语 Node ≥ 24；
// ② VER-01 engines.dsh 窗口串双语声明且与 pins.json lines.022.dshRange 等值；
// ③ README/BUILD 全部 dsh-gsd@ 示例 parseVersion 合法；④ 迁移前旧编码零出现；
// ⑤ refuse-by-design：range/tag 安装规格零出现；⑥ Pitfall 7 哨兵（version 已迁新方案
// 且 private 未发布前仍 true）；⑦ allow-version 风险声明双语存在。
// 版本号解析只消费 build/lib/check-pins.mjs 导出（单一真值，02-PATTERNS key_link）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseVersion } from '../build/lib/check-pins.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

const pkg = JSON.parse(read('package.json'))
const pins = JSON.parse(read('build/assets/pins.json'))
const readme = read('README.md')
const buildMd = read('BUILD.md')
const pkgText = read('package.json')

// README 双语两半：zh 段在前，en 段从第二个 '# dsh-gsd' 标题起。
const firstTitle = readme.indexOf('# dsh-gsd')
const enStart = readme.indexOf('# dsh-gsd', firstTitle + 1)
const readmeZh = readme.slice(0, enStart)
const readmeEn = readme.slice(enStart)

// 全部 dsh-gsd@ 安装示例捕获（README + BUILD.md）。
const specCaptures = () => [
  ...readme.matchAll(/dsh-gsd@(\S+)/g),
  ...buildMd.matchAll(/dsh-gsd@(\S+)/g),
]

test('① VER-04：engines.node === ">=24" 且 README 双语两段各自声明 Node ≥ 24', () => {
  assert.equal(pkg.engines.node, '>=24')
  assert.ok(readmeZh.includes('Node ≥ 24'), 'README 中文段缺 Node ≥ 24 声明')
  assert.ok(readmeEn.includes('Node ≥ 24'), 'README 英文段缺 Node ≥ 24 声明')
})

test('② VER-01：engines.dsh 窗口串双语声明且与 pins.json lines.022.dshRange 等值', () => {
  const range = pins.lines['022'].dshRange
  assert.equal(pkg.engines.dsh, range, 'package.json engines.dsh 与 pins.json 漂移')
  assert.ok(readmeZh.includes(range), 'README 中文段缺 engines.dsh 窗口串')
  assert.ok(readmeEn.includes(range), 'README 英文段缺 engines.dsh 窗口串')
  assert.ok(
    readme.split(range).length - 1 >= 2,
    '窗口串在 README 出现次数 <2（双语声明计数）',
  )
})

test('③ 示例方案合法性：README/BUILD 全部 dsh-gsd@ 示例可被 parseVersion 拆解', () => {
  const caps = specCaptures()
  assert.ok(caps.length > 0, 'README/BUILD 未见任何 dsh-gsd@ 安装示例')
  for (const m of caps) {
    const v = m[1].replace(/[`'"),.;:，。；：]+$/, '')
    assert.notEqual(
      parseVersion(v),
      null,
      `示例版本 '${m[1]}' 不符合 <gsd-ver>-<rev>.dsh<line>（行号去点、rev 纯数字）`,
    )
  }
})

test('④ 旧编码哨兵：迁移前版本串在 README/BUILD/package.json 零出现', () => {
  const LEGACY_VERSION = '0.1.0-gsd1.20.1'
  for (const [name, s] of [
    ['README.md', readme],
    ['BUILD.md', buildMd],
    ['package.json', pkgText],
  ]) {
    assert.equal(
      s.indexOf(LEGACY_VERSION),
      -1,
      `${name} 仍含迁移前旧编码 ${LEGACY_VERSION}（docs-consistency 哨兵锁定）`,
    )
  }
})

test('⑤ refuse-by-design 哨兵：无 range/tag 安装规格（捕获组一律精确版本数字开头）', () => {
  for (const m of specCaptures()) {
    assert.match(
      m[1],
      /^\d/,
      `dsh-gsd@ 后必须以精确版本数字开头，实际 '${m[1]}'（range/tag 形态对 prerelease 匹配数为 0）`,
    )
  }
  for (const [name, s] of [
    ['README.md', readme],
    ['BUILD.md', buildMd],
  ]) {
    assert.ok(!s.includes('dsh-gsd@latest'), `${name} 含 'dsh-gsd@latest' 形态`)
  }
})

test('⑥ Pitfall 7 哨兵：version 已迁新方案且 private 未发布前保持 true', () => {
  assert.equal(pkg.version, '1.20.1-1.dsh022')
  assert.equal(pkg.private, true, 'npm publish 前置：private: true 移除属 Phase 3 任务')
})

test('⑦ allow-version 风险声明双语存在（P2-01 docs 半）', () => {
  assert.ok(readmeZh.includes('allow-version'), 'README 中文段缺 allow-version 风险声明')
  assert.ok(readmeEn.includes('allow-version'), 'README 英文段缺 allow-version 风险声明')
})
