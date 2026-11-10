// tests/build-smoke.test.mjs — 产物断言（一次真实 pack→stage→gate 循环，wave 级）。
//
// 覆盖 plan 01-02 Task 3 五组断言：真实构建成功、76 棵树与 scripts/ 固化
// （SKIL-03 的 MODULE_NOT_FOUND 回归防线）、identity JSON、INST-02 build 侧
// 零 '~/.dsh' 字面量、SKIL-04 adapter 72×1（均恰一注入标记）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const GSD_VERSION = '1.20.1'

// 子进程环境白名单构造：继承 PATH/HOME 等必需项，显式 delete 三档离线 env
// 防止执行器环境残留干扰，然后注入请求版本（与 plan verify 的构造语义一致）。
const buildEnv = () => {
  const env = { ...process.env }
  for (const k of ['GSD_TARBALL', 'GSD_PACKAGE_DIR', 'GSD_BUILD_SOURCE']) delete env[k]
  env.GSD_VERSION = GSD_VERSION
  return env
}

test('真实构建 → 产物断言（76 树 / identity / 零 ~/.dsh / adapter 72×1）', { timeout: 420000 }, () => {
  // ① 真实构建成功（离线 .build-cache 暖缓存档；gates 内嵌于 build 且已通过，
  //    失败即非零 exit → execFileSync 抛错）
  execFileSync('node', ['build.mjs'], { cwd: ROOT, env: buildEnv(), stdio: 'pipe' })

  // ② 76 棵树：skills/ 过滤 ^gsd- 后恰 72 + 其余 4 树显式固化断言。
  //    口径继承 01-01：1.20.1 staged 树无 gsd-core/package.json，版本锚点为
  //    gsd-core/VERSION（gsd-core/package.json 断言在该版本上不可成立）。
  const skillDirs = readdirSync(join(ROOT, 'skills')).filter((e) => e.startsWith('gsd-'))
  assert.equal(skillDirs.length, 72, 'expected 72 gsd-* skill trees')
  for (const p of [
    ['gsd-core', 'VERSION'],
    ['scripts', 'fix-slash-commands.cjs'], // scripts/ 固化防线（SKIL-03 MODULE_NOT_FOUND 回归）
    ['config', 'gsd-hooks.json'],
  ]) {
    assert.ok(existsSync(join(ROOT, ...p)), `${p.join('/')} missing`)
  }
  assert.ok(existsSync(join(ROOT, 'hooks')), 'hooks/ missing')

  // ③ SKIL-03 identity：repo 产物独立 CLI 自报精确身份
  const identRaw = execFileSync(
    'node', [join(ROOT, 'gsd-core', 'bin', 'gsd-tools.cjs'), 'runtime-identity', '--raw'],
    { cwd: ROOT, encoding: 'utf8' },
  ).trim()
  const ident = JSON.parse(identRaw)
  assert.equal(ident.packageName, '@opengsd/gsd-core')
  assert.equal(ident.version, GSD_VERSION)

  // ④ INST-02 build 侧：skills/ gsd-core/ hooks/ config/ 零 '~/.dsh' 字面量
  const tildeScan = spawnSync('grep', ['-RIl', '~/.dsh', 'skills', 'gsd-core', 'hooks', 'config'], {
    cwd: ROOT, encoding: 'utf8',
  })
  const tildeHits = (tildeScan.stdout || '').split('\n').filter(Boolean)
  assert.deepEqual(tildeHits, [], `~/.dsh literals remain: ${tildeHits.join(', ')}`)

  // ⑤ SKIL-04 adapter 计数：72 个 SKILL.md 每个恰 1 个注入标记
  for (const d of skillDirs) {
    const f = join(ROOT, 'skills', d, 'SKILL.md')
    const g = spawnSync('grep', ['-c', 'gsd:dsh-adapter begin', f], { encoding: 'utf8' })
    const count = g.status === 0 ? Number((g.stdout || '').trim()) : g.status === 1 ? 0 : null
    assert.equal(count, 1, `adapter block count != 1 in ${f}`)
  }
})
