// tests/docs-consistency.test.mjs — 文档/清单一致性静态防线（per-commit 秒级反馈回路）。
//
// 覆盖 plan 02-02 Task 2 的①-⑦断言面：① VER-04 engines.node ↔ README 双语 Node ≥ 24；
// ② VER-01 engines.dsh 窗口串双语声明且与 pins.json lines.022.dshRange 等值；
// ③ README/BUILD 全部 dsh-gsd@ 示例 parseVersion 合法；④ 迁移前旧编码零出现；
// ⑤ refuse-by-design：range/tag 安装规格零出现；⑥ Pitfall 7 哨兵（version 已迁新方案
// 且 private 未发布前仍 true）；⑦ allow-version 风险声明双语存在。
// ⑧⑨⑩：CHANGELOG 首条目/小节闭集、徽章与致谢、INST-06 插件管理器元数据。
// ⑪⑫（G-2）：dshmarket 条目 schema 与裸名 install 串逐字一致性；⑬（R-1）：
// manifest 六个元数据键的全等守卫。catalog 条目亦走行级正则，不引入 YAML 依赖。
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
  // 徽章两条都必须在首个 `# dsh-gsd` 标题之前（README 首行是 HTML 注释
  // `<!-- generated-by: gsd-doc-writer -->`，故以首个标题为锚）。
  const lines = readme.split('\n')
  const headingIdx = lines.findIndex((l) => /^#\s+dsh-gsd\s*$/.test(l))
  assert.ok(headingIdx >= 0, 'README 缺首个 "# dsh-gsd" 一级标题（徽章位置锚点）')

  const shieldBadges = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /!\[[^\]]*\]\(https:\/\/img\.shields\.io\//.test(l))
  assert.equal(
    shieldBadges.length, 2,
    `README 应恰有 2 枚 shields.io 徽章（许可 + DSH），实际 ${shieldBadges.length} 枚`
      + `（L${shieldBadges.map((b) => b.i + 1).join('/L')}）——删一枚或加第三枚都算漂移`,
  )

  const below = shieldBadges.filter(({ i }) => i > headingIdx).map(({ i }) => i + 1)
  assert.deepEqual(
    below, [],
    `徽章被移到首个 "# dsh-gsd"（L${headingIdx + 1}）之后：L${below.join('/L')}——顶部可见性丢失`,
  )

  const licenseBadges = shieldBadges.filter(({ l }) => /\]\(\.\/LICENSE\)/.test(l))
  assert.equal(
    licenseBadges.length, 1,
    `应恰有 1 枚以 ./LICENSE 为链接目标的许可徽章，实际 ${licenseBadges.length} 枚`,
  )
  assert.match(licenseBadges[0].l, /MIT/, `许可徽章应声明 MIT：'${licenseBadges[0].l.trim()}'`)

  const dshBadges = shieldBadges.filter((b) => b.i !== licenseBadges[0].i)
  assert.equal(dshBadges.length, 1, `除许可徽章外应恰有 1 枚徽章，实际 ${dshBadges.length} 枚`)
  assert.match(
    dshBadges[0].l, /DSH/,
    `第二枚徽章应是 DSH 徽章（alt 或 URL 含 DSH）：'${dshBadges[0].l.trim()}'`,
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

// ─────────────────────────────────────────────────────────────────────────────
// G-2（PUB-03）与 R-1（PUB-03 npm 元数据面）：03-VALIDATION 的两个 Nyquist 缺口。
// 零 YAML 依赖——catalog 条目走行级正则自检（`js-yaml` 有意不引入）。
// ─────────────────────────────────────────────────────────────────────────────

// catalog 的 23 类闭集（目标仓 schema 的词表；与 03-02 Task 2 的一次性自检同源）。
const DSHMARKET_CATEGORIES = [
  'agi', 'ui', 'usage', 'theme', 'model', 'identity', 'session', 'memory', 'tools', 'wsl',
  'browser', 'vision', 'voice', 'docs', 'skill', 'workflow', 'git', 'notify', 'dev',
  'security', 'remote', 'market', 'fun',
]

const DSHMARKET_ENTRY = 'docs/dshmarket/pfmiles__dsh-gsd.yml'
const DSHMARKET_README = 'docs/dshmarket/README.md'

// 去掉单/双引号包裹（YAML 标量的最小可用子集；不追求完整 YAML 语义）。
const unquote = (s) => {
  const t = s.trim()
  const q = /^(['"])([\s\S]*)\1$/.exec(t)
  return q ? q[2] : t
}

test('⑪ G-2 dshmarket 条目 schema（4 顶层键 / category 闭集 / 双语 description 句末标点）', () => {
  const entry = read(DSHMARKET_ENTRY)

  // 顶层键：恰 4 个且集合/顺序精确——多键（含 `icon`）、少键、键名漂移都红。
  const keys = [...entry.matchAll(/^([A-Za-z][\w-]*):/gm)].map((x) => x[1])
  assert.deepEqual(
    keys,
    ['url', 'name', 'category', 'description'],
    `顶层键应恰为 url/name/category/description 四项，实际 [${keys.join(', ')}]`,
  )
  assert.equal(keys.length, 4, `顶层键数量应恰 4，实际 ${keys.length}`)
  assert.ok(!/^icon:/m.test(entry), 'dshmarket 条目出现 icon 顶层键（目标仓 schema 无此字段，恒为宿主派生）')

  // 标量叶子（行级正则，不经 YAML 解析）。
  const scalar = (k) => {
    const mm = new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(entry)
    assert.ok(mm, `dshmarket 条目缺 ${k} 标量`)
    return unquote(mm[1])
  }
  assert.equal(scalar('url'), 'https://github.com/pfmiles/dsh-gsd', 'url 与目标仓库地址漂移')
  assert.equal(scalar('name'), 'pfmiles/dsh-gsd', 'name 与 slug（pfmiles__dsh-gsd.yml / slugFor(url)）漂移')

  const category = scalar('category')
  assert.equal(category, 'workflow', `category 应为 workflow，实际 '${category}'`)
  assert.ok(
    DSHMARKET_CATEGORIES.includes(category),
    `category '${category}' 不在 23 类闭集内（新类目须先改目标仓 schema）`,
  )
  assert.equal(DSHMARKET_CATEGORIES.length, 23, 'catalog 类目闭集本应是 23 项')

  // description.{en,zh}：非空 + 句末标点（en 用 '.'，zh 用 '。'）。
  const descStart = entry.search(/^description:\s*$/m)
  assert.ok(descStart >= 0, 'dshmarket 条目缺 description: 块')
  const descBody = entry.slice(descStart).split('\n').slice(1).filter((l) => /^\s+\S/.test(l))
  const leaf = (k) => {
    const hit = descBody.map((l) => new RegExp(`^\\s+${k}:\\s*(.+)$`).exec(l)).find(Boolean)
    assert.ok(hit, `description 缺 ${k} 叶子`)
    return unquote(hit[1])
  }
  const en = leaf('en')
  const zh = leaf('zh')
  assert.ok(en.trim().length > 0, 'description.en 为空')
  assert.ok(en.trim().endsWith('.'), `description.en 未以句号结尾：…${en.slice(-24)}`)
  assert.ok(zh.trim().length > 0, 'description.zh 为空')
  assert.ok(zh.trim().endsWith('。'), `description.zh 未以句号结尾：…${zh.slice(-24)}`)
})

test('⑫ G-2 裸名 install 串逐字一致（README 整行 2 次且 zh/en 各 1 次 / dshmarket ≥1 次 / byte 相等）', () => {
  const NAKED_INSTALL = 'dsh plugin --profile web add dsh-gsd'
  // 命中面 = trim 后整行相等（缩进/尾随空格的「近似行」仍会被选中，随后由 byte 断言否决）。
  const hits = (s) => s.split('\n').filter((l) => l.trim() === NAKED_INSTALL)
  const readmeHits = hits(readme)
  const marketHits = hits(read(DSHMARKET_README))

  assert.equal(
    readmeHits.length, 2,
    `README.md 的裸名 install 整行应恰 2 行（zh + en 两半各一），实际 ${readmeHits.length}`,
  )
  // 总数会被「删一行 + 复制另一行」保持为 2（实测分布 2/0），故按双语两半分别计数。
  for (const [name, half] of [
    ['zh', readmeZh],
    ['en', readmeEn],
  ]) {
    const n = hits(half).length
    assert.equal(
      n, 1,
      `README ${name} 段的裸名 install 整行应恰 1 行，实际 ${n} 行`
        + '——两半各一才算双语覆盖；总数 2 会被同一半重复两次蒙过',
    )
  }
  assert.ok(
    marketHits.length >= 1,
    `docs/dshmarket/README.md 的裸名 install 整行应 ≥1 行，实际 ${marketHits.length}`,
  )
  // byte 相等：README 每行必须逐字节等于 canonical 文本，docs 副本再与 README 副本对齐。
  for (const hit of readmeHits) {
    assert.equal(hit, NAKED_INSTALL, `README.md 的裸名 install 行与 canonical 文本不 byte 相等：'${hit}'`)
  }
  for (const hit of marketHits) {
    assert.equal(
      hit, readmeHits[0],
      `docs/dshmarket/README.md 的裸名 install 行与 README 副本不 byte 相等：'${hit}' vs '${readmeHits[0]}'`,
    )
  }
  assert.ok(
    !readme.includes('dsh-gsd@latest'),
    "README.md 含 'dsh-gsd@latest'（refuse-by-design：裸名命令不带 tag）",
  )
})

test('⑬ R-1 manifest 元数据守卫（repository/homepage/bugs/keywords/author/publishConfig）', () => {
  assert.deepEqual(
    pkg.repository,
    { type: 'git', url: 'git+https://github.com/pfmiles/dsh-gsd.git' },
    'package.json repository 漂移（npm 页面的源码链接与 dshmarket 审阅入口依赖它）',
  )
  assert.equal(
    pkg.homepage,
    'https://github.com/pfmiles/dsh-gsd#readme',
    'package.json homepage 漂移',
  )
  assert.deepEqual(
    pkg.bugs,
    { url: 'https://github.com/pfmiles/dsh-gsd/issues' },
    'package.json bugs 漂移',
  )
  assert.deepEqual(
    pkg.keywords,
    ['deepseek', 'harness', 'dsh', 'dsh-plugin', 'gsd', 'skills', 'workflow'],
    'package.json keywords 与 7 项闭集漂移（改词表须同步 Phase 5 的 catalog 检索口径）',
  )
  assert.equal(pkg.keywords.length, 7, `keywords 应恰 7 项，实际 ${pkg.keywords.length}`)
  assert.equal(pkg.author, 'pf_miles', 'package.json author 漂移')
  assert.deepEqual(
    pkg.publishConfig,
    { registry: 'https://registry.npmjs.org/' },
    'package.json publishConfig 丢失或漂移 ⇒ 发布会落到本机默认只读镜像（registry.npmmirror.com）而非 npmjs',
  )
})
