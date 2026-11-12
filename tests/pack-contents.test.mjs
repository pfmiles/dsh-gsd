// tests/pack-contents.test.mjs — 发布面（tarball 内容）静态防线。
//
// 目的：package.json 的 `files` 是唯一一道把开发期产物挡在安装包之外的屏障——
// 本仓自己的 .planning/（GSD 规划文档、阶段计划、UAT 记录）、tests/、
// .build-cache/ 全靠它排除。它一旦被放宽成宽泛 glob 或被误加条目，npm/pnpm pack
// 会静默放行且没有任何 CI 信号：用户装完后会在自己的 DSH profile 里看到本仓的
// 规划文档与测试。
//
// **为什么是静态推导而不是真跑一次 `npm pack`：** 本仓 prepack =
// `node build.mjs && node --test tests/*.test.mjs`。从测试里触发 pack 会递归回到
// 本套件（实测：pack 期间 skills/gsd-core 被清空重建、产物清单在 21 / 494 / 957 /
// 958 之间跳变——并发构建把 packlist 读成半成品）。递归 + 依赖整条 build 的耗时
// 都不适合放进 per-commit 回路，因此这里按 npm-packlist 的收录规则**静态推导**
// 收录面：
//   files 条目展开（文件即自身，目录即其下全部文件）
//   + npm 无条件收录的 package.json / README* / LICENSE* / main 指向的文件。
// 该推导已在 1.20.1-1.dsh022 上与真实 `npm pack --dry-run`
// 交叉核对：958 个文件、12 个顶层条目（LICENSE README.md config cordis.patch.yml
// gsd-core hooks icon.svg index.js locale package.json scripts skills），逐条一致。
// 需要复验真实 tarball 时手工执行：
//   npm pack --dry-run --json   （注意：会跑一遍 build + 全量测试）
//
// 断言四层：
//   ① `files` 必须是非空、纯字面量的相对路径列表——无宽泛条目（"." / "*" / "**"）、
//      无否定条目、无绝对路径、无 ".." 穿越；且**收录方向**上必需顶层条目一个不少
//      （删条目不会让 ② 变红——它只让推导面变小，故必须正向点名）。
//   ② 推导出的收录面里，.planning/ 与其它开发期路径零出现，顶层条目收敛在白名单内
//      （新增顶层目录要求同步改本文件，属有意识变更）。
//   ③ `files` 条目不得指向不存在的路径（拼错即静默漏发）；冷克隆未构建的五棵
//      gitignored 产物树例外。
//   ④ 安装形态下 index.js 的包根解析：index.js 与 `skills/` 同级，pluginRoot 必须是
//      包目录本身（多向上一级 = provider 注册到不存在的目录，技能全不加载）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

// 允许出现在安装包顶层的条目 = package.json `files` + npm 无条件收录的
// package.json / README* / LICENSE* / main 指向文件。
const ALLOWED_TOP_LEVEL = new Set([
  'package.json', 'README.md', 'LICENSE',
  'index.js', 'cordis.patch.yml', 'icon.svg', 'locale',
  'skills', 'gsd-core', 'hooks', 'config', 'scripts',
])

// 上面三条由 npm 无条件收录（见 simulatePack 的 always/main 列表），即便不写进
// `files` 也在包里；其余条目必须逐个显式列举，否则安装包静默缺一块。
const NPM_ALWAYS_INCLUDED = new Set(['package.json', 'README.md', 'LICENSE'])

// 开发期路径：一个都不许进包。'.planning/' 首当其冲——它是本仓 GSD 工作流
// 自己的规划目录，泄漏即等于把项目文档、阶段计划、UAT 记录发给每个用户。
const FORBIDDEN_PREFIXES = [
  '.planning/', '.gsd/', '.gsd-build-tmp/', '.build-cache/',
  'build/', 'tests/', '.github/', '.git/', 'node_modules/',
]
const FORBIDDEN_FILES = [
  'build.mjs', 'BUILD.md', 'PLAN.md', 'SPIKE.md',
  '.gitignore', '.npmignore', '.npmrc',
]

// 宽泛条目：一旦出现，白名单就不再"白"，等同于打包整棵树（含 .planning/）。
const BROAD_ENTRIES = new Set(['.', './', '*', '**', '**/*', '/', ''])

// gitignored 的构建产物树：冷克隆（未跑 build）上不存在，③ 对它们免检。
const BUILD_TREES = new Set(['skills', 'gsd-core', 'hooks', 'config', 'scripts'])

// 目录下全部文件的相对路径（相对 ROOT）。ENOENT 视为空——并发构建清空目录时
// 不误报，推导面只会变小，而 ② 全是"不得出现"的否定断言，不受影响。
const walk = (rel) => {
  const abs = join(ROOT, rel)
  let entries
  try {
    entries = readdirSync(abs, { withFileTypes: true })
  } catch {
    return []
  }
  const out = []
  for (const e of entries) {
    const child = `${rel}/${e.name}`
    out.push(...(e.isDirectory() ? walk(child) : [child]))
  }
  return out
}

// npm-packlist 收录规则的静态推导：files 条目 + npm 无条件收录项。
// 目录条目自身不入列（packlist 只记文件），单文件条目按自身入列。
const isFile = (abs) => {
  try {
    return statSync(abs).isFile()
  } catch {
    return false
  }
}

const simulatePack = () => {
  const paths = new Set(['package.json'])
  for (const always of ['README.md', 'README', 'LICENSE', 'LICENCE']) {
    if (existsSync(join(ROOT, always))) paths.add(always)
  }
  if (typeof pkg.main === 'string' && pkg.main) paths.add(pkg.main.replace(/^\.\//, ''))

  for (const raw of pkg.files ?? []) {
    const entry = String(raw).trim().replace(/^\.\//, '').replace(/\/$/, '')
    // 本测试的 ① 已禁止 glob，这里只按字面量展开。
    const sub = walk(entry)
    if (sub.length > 0) {
      for (const p of sub) paths.add(p)
    } else if (isFile(join(ROOT, entry))) {
      paths.add(entry) // 单文件条目（index.js / icon.svg / cordis.patch.yml）
    }
  }
  return [...paths].sort()
}

test('① files 白名单：非空、纯字面量相对路径、无宽泛条目、必需顶层条目齐全', () => {
  assert.ok(Array.isArray(pkg.files) && pkg.files.length > 0,
    'package.json 缺少 files 白名单——缺省会把整棵工作树打进安装包')

  for (const entry of pkg.files) {
    assert.equal(typeof entry, 'string', `files 含非字符串条目: ${JSON.stringify(entry)}`)
    const norm = entry.trim()
    assert.ok(!BROAD_ENTRIES.has(norm),
      `files 含宽泛条目 "${entry}"——会重新吞下整棵树（含 .planning/）`)
    assert.ok(!norm.startsWith('!'),
      `files 不应使用否定条目 "${entry}"；白名单应正向列举要发布的内容`)
    assert.ok(!norm.startsWith('/') && !/^[A-Za-z]:/.test(norm),
      `files 条目应为相对路径: "${entry}"`)
    assert.ok(!norm.split('/').includes('..'),
      `files 条目不得走出包根目录: "${entry}"`)
    assert.ok(!/[?*[\]{}]/.test(norm),
      `files 条目含 glob（"${entry}"）——收录面将无法静态审计，请改为字面量路径`)
  }

  // 收录方向：② 只做「不得出现」的否定断言，删条目时推导面只会变小、②③⑩ 全绿。
  // 必需集 = ALLOWED_TOP_LEVEL 减去 npm 无条件收录的三条——不另立第二份清单。
  // CHANGELOG.md 记录过同一类遗漏：tarball 漏发 gsd-core ⇒ 用户侧 MODULE_NOT_FOUND。
  const listed = new Set(
    pkg.files.map((raw) => String(raw).trim().replace(/^\.\//, '').replace(/\/$/, '')),
  )
  const missing = [...ALLOWED_TOP_LEVEL].filter((t) => !NPM_ALWAYS_INCLUDED.has(t) && !listed.has(t))
  assert.deepEqual(
    missing, [],
    `files 漏发必需顶层条目: ${missing.join(', ')}——安装包里会静默缺一块`
      + '（CHANGELOG.md 记录过漏发 gsd-core 导致用户侧 MODULE_NOT_FOUND）；'
      + '若属有意缩面，请同步修改本测试的 ALLOWED_TOP_LEVEL 与 NPM_ALWAYS_INCLUDED',
  )
})

test('② 推导收录面：.planning/ 与开发期路径零出现，顶层条目收敛在白名单内', () => {
  const files = simulatePack()
  assert.ok(files.length > 0, '推导出的收录面为空')

  for (const p of files) {
    const bad = FORBIDDEN_PREFIXES.find((pre) => p === pre.slice(0, -1) || p.startsWith(pre))
    assert.equal(bad, undefined, `开发期路径会被打进安装包: ${p}`)
    assert.ok(!FORBIDDEN_FILES.includes(p), `开发期文件会被打进安装包: ${p}`)
  }

  // 用户装插件时最直接的担忧：显式点名，失败信息要一眼看懂。
  const leaked = files.filter((p) => p.startsWith('.planning'))
  assert.deepEqual(leaked, [],
    `.planning/ 会混入安装包（${leaked.length} 个文件，例如 ${leaked.slice(0, 3).join(', ')}）`)

  const tops = [...new Set(files.map((p) => p.split('/')[0]))].sort()
  const unexpected = tops.filter((t) => !ALLOWED_TOP_LEVEL.has(t))
  assert.deepEqual(unexpected, [],
    `安装包会出现未登记顶层条目: ${unexpected.join(', ')}；如属有意新增，请同步更新 package.json 的 files 与本测试的 ALLOWED_TOP_LEVEL`)
})

test('③ files 条目都有实际内容（拼错 / 空目录即静默漏发）', () => {
  const norm = (raw) => String(raw).trim().replace(/^\.\//, '').replace(/\/$/, '')
  const empty = (pkg.files ?? []).filter((raw) => {
    const entry = norm(raw)
    if (walk(entry).length > 0 || isFile(join(ROOT, entry))) return false
    // 冷克隆上五棵构建产物树尚不存在（gitignored），不算漏发；存在却空则算。
    return !(BUILD_TREES.has(entry) && !existsSync(join(ROOT, entry)))
  }).map(norm)
  assert.deepEqual(empty, [],
    `files 条目没有可发布内容: ${empty.join(', ')}——安装包会静默缺一块`)
})

// ④ 行为守卫（CR-01）：把 index.js 里真实的 `pluginRoot` / `skillsDir` 两行抽出来，
//    代入**模拟安装形态**的 <tmp>/node_modules/dsh-gsd/index.js 在子进程里真求值。
//
//    为什么不直接 import index.js：它 import '@deepseek-ai/dsh-skill-filesystem'
//    （peerDependency，本仓未安装）——直连必然 ENOENT/ERR_MODULE_NOT_FOUND，测不到路径。
//    为什么不只对源码做正则：`'..'` 到底指到哪儿取决于文件在包里的位置，只有在
//    真实安装形状下求值才能证伪。任一「向上一级」的写法（`resolve(dirname(...), '..')`
//    / `dirname(dirname(...))` / `join(__dirname, '..')`）都会让 skillsDir 落到
//    node_modules/ 而不是 node_modules/dsh-gsd/，本守卫即红。
test('④ 安装形态：pluginRoot 必须是包目录本身（skills/ 与 index.js 同级）', () => {
  // 模拟形状由 package.json 自己给出：包名 + main，避免第二份路径真值。
  assert.equal(pkg.main, 'index.js', '本守卫按 main 定位 index.js；main 变更须同步此模拟')

  const src = readFileSync(join(ROOT, 'index.js'), 'utf8')
  const rootLine = /^const pluginRoot = .*$/m.exec(src)?.[0]
  const skillsLine = /^const skillsDir = .*$/m.exec(src)?.[0]
  assert.ok(rootLine, 'index.js 找不到 `const pluginRoot = …` 行（守卫抽取点已失效）')
  assert.ok(skillsLine, 'index.js 找不到 `const skillsDir = …` 行（守卫抽取点已失效）')

  const tmp = mkdtempSync(join(tmpdir(), 'dsh-gsd-install-'))
  try {
    const installedRoot = join(tmp, 'node_modules', pkg.name)
    const installedMain = join(installedRoot, 'index.js')
    mkdirSync(join(installedRoot, 'skills'), { recursive: true }) // 真实的同级 skills/

    const probe = join(installedRoot, '__plugin-root-probe.mjs')
    writeFileSync(probe, [
      "import { dirname, join, resolve } from 'node:path'",
      "import { fileURLToPath } from 'node:url'",
      `const simulatedUrl = ${JSON.stringify(pathToFileURL(installedMain).href)}`,
      // 只替换 import.meta.url 这一处元变量，两行源码其余部分逐字求值。
      rootLine.replace('import.meta.url', 'simulatedUrl'),
      skillsLine,
      'console.log(skillsDir)',
      '',
    ].join('\n'))

    const run = spawnSync(process.execPath, [probe], { encoding: 'utf8' })
    assert.equal(run.status, 0, `包根求值探针执行失败: ${run.stderr || run.stdout}`)

    const printed = run.stdout.trim()
    const expected = join(installedRoot, 'skills')
    assert.equal(
      printed, expected,
      `skillsDir 未落在包目录内：期望 ${expected}，实际 ${printed}`
        + '——多向上一级会让 FileSystemSkillProvider 注册到不存在的目录，72 个技能全不加载',
    )
    assert.ok(
      existsSync(printed),
      `${printed} 不存在——provider 会注册到空目录，技能目录看不到任何 gsd-* 技能`,
    )
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})