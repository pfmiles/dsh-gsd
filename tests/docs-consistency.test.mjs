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
  assert.equal(pkg.private, true, 'npm publish 前置：private: true 移除属 Phase 5 任务')
})

test('⑦ allow-version 风险声明双语存在（P2-01 docs 半）', () => {
  assert.ok(readmeZh.includes('allow-version'), 'README 中文段缺 allow-version 风险声明')
  assert.ok(readmeEn.includes('allow-version'), 'README 英文段缺 allow-version 风险声明')
})

// Keep a Changelog 1.1.0 的六个固定小节名：出现闭集外的名字即说明有人在自创结构。
const CHANGELOG_SECTIONS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']

test('⑧ CHANGELOG 首条目版本与 package.json.version 等值，小节名在六类闭集内', () => {
  const changelog = read('CHANGELOG.md')
  const m = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/m.exec(changelog)
  assert.ok(m, 'CHANGELOG.md 缺少 "## [<version>] - <YYYY-MM-DD>" 形态的首条目')
  assert.equal(m[1], pkg.version, 'CHANGELOG 首条目版本与 package.json.version 漂移')
  assert.equal(m[1], '1.20.1-1.dsh022')
  const heads = [...changelog.matchAll(/^### (.+)$/gm)].map((x) => x[1].trim())
  const bad = heads.filter((h) => !CHANGELOG_SECTIONS.includes(h))
  assert.deepEqual(bad, [], `CHANGELOG 出现非 Keep a Changelog 小节名: ${bad.join(', ')}`)
  assert.ok(heads.length > 0, 'CHANGELOG 首条目没有任何 ### 小节')
})

test('⑨ 徽章与上游致谢可见性（防漂移）', () => {
  assert.match(
    readme,
    /!\[[^\]]*\]\(https:\/\/img\.shields\.io\//,
    'README 缺 shields.io 徽章（PUB-04 的许可与 DSH 行可见性）',
  )
  for (const [name, s] of [
    ['zh', readmeZh],
    ['en', readmeEn],
  ]) {
    assert.ok(s.includes('THIRD-PARTY-NOTICES.md'), `README ${name} 段缺 THIRD-PARTY-NOTICES 链接`)
    assert.ok(s.includes('MIT'), `README ${name} 段缺 MIT 声明`)
  }
})

test('⑩ INST-06 插件管理器元数据合规（locale 双语键 + icon 双通道 + files 收录）', () => {
  // 宿主 schema（dsh-plugin-manager 0.2.2-rc.1）：string 或 { en: string } 联合形态。
  const nonEmptyText = (v) => {
    if (typeof v === 'string') return v.trim().length > 0
    if (v && typeof v === 'object' && typeof v.en === 'string') return v.en.trim().length > 0
    return false
  }
  const metaOf = (file) => JSON.parse(read(file)).meta ?? {}
  const en = metaOf('locale/en.json')
  const zh = metaOf('locale/zh.json')
  for (const [name, meta] of [
    ['en', en],
    ['zh', zh],
  ]) {
    assert.ok(nonEmptyText(meta.title), `locale/${name}.json 的 meta.title 缺失或为空`)
    assert.ok(nonEmptyText(meta.description), `locale/${name}.json 的 meta.description 缺失或为空`)
  }
  assert.deepEqual(en.title, zh.title, 'locale 双语 meta.title 漂移（同一产品名应按语言各自呈现）')
  assert.equal(pkg.icon, 'icon.svg', 'package.json icon 未指向包内 icon.svg（INST-06 展示通道）')
  assert.equal(pkg.exports['./icon'], './icon.svg', 'exports["./icon"] 缺失或指向漂移（INST-06 第二通道）')
  assert.ok(pkg.files.includes('locale'), 'files 未收录 locale/ ⇒ 宿主静默降级为技术名与英文兜底')
  assert.ok(pkg.files.includes('icon.svg'), 'files 未收录 icon.svg ⇒ 宿主静默降级为默认头像')
})
