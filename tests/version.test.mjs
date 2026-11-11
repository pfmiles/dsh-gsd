// tests/version.test.mjs — 版本号方案 <gsd-ver>-<rev>.dsh<line> parse/validate 单测
// （per-commit 秒级反馈回路）。
//
// 覆盖 plan 02-02 Task 1 的三组断言：① 合法拆解为 {gsd, rev, line}、② 非法形态
// 判 null（带点线号/rev 混字母/两位线号/rev 非数字/纯 gsd/空 rev，另含 02-02 执行期
// 从 README 快速开始安装示例现取的迁移前旧编码样本）、③ validateVersion 以
// build/assets/pins.json 为真值（行存在且非 <unsupported>、gsd-ver 在 matrix.gsd 轴）。
// 方案解析只有 build/lib/check-pins.mjs 一处实现——本测试只消费导出，不复刻正则
// （02-PATTERNS key_link：共享解析真值）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseVersion, validateVersion } from '../build/lib/check-pins.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pins = JSON.parse(readFileSync(join(ROOT, 'build', 'assets', 'pins.json'), 'utf8'))

test('① 合法拆解：<gsd-ver>-<rev>.dsh<line> → {gsd, rev, line}', () => {
  assert.deepEqual(parseVersion('1.20.1-1.dsh022'), { gsd: '1.20.1', rev: 1, line: '022' })
  assert.deepEqual(parseVersion('1.20.1-2.dsh022'), { gsd: '1.20.1', rev: 2, line: '022' })
  assert.deepEqual(parseVersion('1.20.2-1.dsh022'), { gsd: '1.20.2', rev: 1, line: '022' })
  assert.deepEqual(parseVersion('1.20.1-1.dsh021'), { gsd: '1.20.1', rev: 1, line: '021' })
})

test('② 非法形态判 null：排序病理编码 + 迁移前旧编码', () => {
  // 迁移前旧编码样本：02-02 执行期取自 README 快速开始安装示例
  // `dsh plugin --profile web add dsh-gsd@0.1.0-gsd1.20.1`（修改 README 之前先取串）。
  const invalids = [
    '1.20.1-1-dsh0.2', // 线号带点 = 多 prerelease id（Pitfall 1 排序病理）
    '1.20.1-1-dsh0.2.2', // 线号多点形态
    '1.20.1-1-dsh02', // rev 混进字母 id（'-1-dsh02' 型，rev 10 会失序）
    '1.20.1-1.dsh02', // 两位线号（线号非 3 位去点标签）
    '1.20.1-x.dsh022', // rev 非数字
    '1.20.1-.dsh022', // 空 rev
    '1.20.1', // 纯 gsd 无 prerelease
    '0.1.0-gsd1.20.1', // 迁移前旧编码（README L19 现取样本）
  ]
  for (const v of invalids) {
    assert.equal(parseVersion(v), null, `expected null for '${v}'`)
  }
})

test('③ validateVersion 真值：pins.json 行存在 / 支持窗 / matrix.gsd 轴', () => {
  assert.equal(validateVersion('1.20.1-1.dsh022', pins), true, '当前行 + 轴内 gsd 应为 true')
  assert.equal(
    validateVersion('1.20.1-1.dsh021', pins),
    false,
    "021 行 dshRange === '<unsupported>'（前一行负向格）",
  )
  assert.equal(validateVersion('1.16.0-1.dsh022', pins), false, 'gsd 1.16.0 不在 matrix.gsd 轴')
  assert.equal(validateVersion('0.1.0-gsd1.20.1', pins), false, '迁移前旧编码不可解析')
})
