// tests/build-smoke.test.mjs — 产物断言（一次真实 pack→stage→gate 循环，wave 级）。
//
// 覆盖 plan 01-02 Task 3 五组断言：真实构建成功、76 棵树与 scripts/ 固化
// （SKIL-03 的 MODULE_NOT_FOUND 回归防线）、identity JSON、INST-02 build 侧
// 零 '~/.dsh' 字面量、SKIL-04 adapter 72×1（均恰一注入标记）。
// 01-validate-phase 审计追加 ⑥⑦⑧ 三组：hooks 桥接 fail-open 回归防线
// （01-03 Task 2 / 2d45fac）机器化 —— wrapper 逐字节重放 + registry 经
// wrapper 调度 + 注册命令行组件级 .env 拦截/放行契约。
// 01-REVIEW 修复追加：WR-01 ②档 .build-cache 篡改 → exit 2 负向防线（本文件
// 末条 test）；WR-02 真实构建前置探测（暖缓存/registry）→ 缺失时 t.skip。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
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

// WR-02：真实构建的隐性前置 = 暖缓存（②档，gitignored，新克隆不存在）或
// registry 可达（④档 npm pack）。两者皆无时真实构建会在 execFileSync 里以
// 不透明的 exit 1 抛错，误报为构建失败——先探测，缺前置 → t.skip 并说明，
// 静态断言不受影响（跟随该 test 内构建产物执行）。
const CACHE_TGZ = join(ROOT, '.build-cache', `opengsd-gsd-core-${GSD_VERSION}.tgz`)
const canBuild = (() => {
  if (existsSync(CACHE_TGZ)) return true
  try {
    execFileSync('npm', ['view', `@opengsd/gsd-core@${GSD_VERSION}`, 'version'], { stdio: 'pipe', timeout: 15000 })
    return true
  } catch {
    return false
  }
})()

test('真实构建 → 产物断言（76 树 / identity / 零 ~/.dsh / adapter 72×1 / hooks 桥接守卫）', { timeout: 420000 }, (t) => {
  if (!canBuild) {
    t.skip(`full-build smoke requires warm ${CACHE_TGZ} or registry access — neither available (offline cold clone)`)
    return
  }
  // 对抗性前置（⑥ 的断言前提）：wrapper 由 build.mjs ⑤ 捕获段每轮重放；
  // 先删除再构建——若捕获段被删回归，其余 5 组断言与 gates 均不触碰该文件，
  // 只有本断言暴露（防 stale 文件假绿——01-03 第一轮快照教训）。
  rmSync(join(ROOT, 'hooks', 'dsh-gsd-suite', 'run.cjs'), { force: true })

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

  // ⑥ hooks 桥接 fail-open 回归防线（01-03 Task 2 / 2d45fac 机器化）：
  //    wrapper 是 install-gsd-dsh.sh 部署产物、不在 @opengsd/gsd-core npm
  //    tarball 树内，构建必须逐轮重放 canonical 拷贝；缺失 = 全部守卫
  //    MODULE_NOT_FOUND fail-open（① 前已删除，故此处存在即捕获段存活）。
  const WRAPPER = join(ROOT, 'hooks', 'dsh-gsd-suite', 'run.cjs')
  const CANONICAL = join(ROOT, 'build', 'assets', 'dsh-gsd-suite-run.cjs')
  assert.ok(existsSync(WRAPPER), 'hooks/dsh-gsd-suite/run.cjs missing after build — all guards fail open')
  assert.equal(
    readFileSync(CANONICAL, 'utf8'),
    readFileSync(WRAPPER, 'utf8'),
    'wrapper drifted from canonical build/assets/dsh-gsd-suite-run.cjs',
  )

  // ⑦ registry 契约：config/gsd-hooks.json 的 read|grep|bash PreToolUse 组
  //    必须经 wrapper 调度到 gsd-secret-read-guard（防 registry 改走旁路）。
  const registry = JSON.parse(readFileSync(join(ROOT, 'config', 'gsd-hooks.json'), 'utf8'))
  const secretGroup = registry.hooks.PreToolUse?.find((g) => (g.matcher || '').split('|').includes('read'))
  assert.ok(secretGroup, 'config/gsd-hooks.json PreToolUse read group missing')
  const secretCmd = secretGroup.hooks?.[0]?.command ?? ''
  assert.match(secretCmd, /dsh-gsd-suite\/run\.cjs/, `secret-read dispatch must go via wrapper: ${secretCmd}`)
  assert.match(secretCmd, /gsd-secret-read-guard\.js/, `secret-read guard not dispatched: ${secretCmd}`)

  // ⑧ 行为级：注册命令行 + DSH 小写 payload 走 wrapper → guard（组件级拦截
  //    闭环，不依赖活体 DSH 实例；live 工具级拦截仍为 DEV-03 manual-only）。
  const probeDir = mkdtempSync(join(tmpdir(), 'gsd-nyquist-'))
  try {
    writeFileSync(join(probeDir, '.env'), 'DUMMY=1\n')
    const runGuard = (payload) =>
      spawnSync('node', [WRAPPER, 'node', join(ROOT, 'hooks', 'gsd-secret-read-guard.js')], {
        input: payload, encoding: 'utf8',
      })
    const blockRead = runGuard(JSON.stringify({ tool_name: 'read', tool_input: { file_path: join(probeDir, '.env') } }))
    assert.equal(blockRead.status, 2, `read .env must block: ${blockRead.stdout} ${blockRead.stderr}`)
    const decision = JSON.parse(blockRead.stdout)
    assert.equal(decision.decision, 'block')
    assert.equal(decision.code, 'secret-read')
    assert.equal(decision.tool, 'Read')
    const blockBash = runGuard(JSON.stringify({ tool_name: 'bash', tool_input: { command: `cat ${join(probeDir, '.env')}` } }))
    assert.equal(blockBash.status, 2, `bash cat .env must block: ${blockBash.stdout} ${blockBash.stderr}`)
    // 良性对照：README.md 与豁免族 .env.example 放行（exit 0 且无 block JSON）
    const allowReadme = runGuard(JSON.stringify({ tool_name: 'read', tool_input: { file_path: join(ROOT, 'README.md') } }))
    assert.equal(allowReadme.status, 0, `README.md must be allowed: ${allowReadme.stderr}`)
    assert.doesNotMatch(allowReadme.stdout, /decision/, 'benign read must not emit decision JSON')
    const allowExample = runGuard(JSON.stringify({ tool_name: 'read', tool_input: { file_path: join(probeDir, '.env.example') } }))
    assert.equal(allowExample.status, 0, `.env.example (exempt family) must be allowed: ${allowExample.stderr}`)
  } finally {
    rmSync(probeDir, { recursive: true, force: true })
  }
})

// WR-01 负向：②档 .build-cache 的 tgz 被篡改后，构建必须在解包/执行前被
// NOTICES canonical 双重哈希校验拦截（exit 2 fail-closed），不得静默放行。
// 与上一条 real-build 断言同文件 = node:test 文件内串行，不会与真实构建
// 争用 .build-cache；fixture 用完即还原（含上次异常中断残留的 .smoke-backup）。
test('WR-01 负向：②档 .build-cache 篡改 tgz → 完整性校验 fail-closed exit 2', () => {
  const cacheDir = join(ROOT, '.build-cache')
  const cacheTgz = join(cacheDir, `opengsd-gsd-core-${GSD_VERSION}.tgz`)
  const backup = `${cacheTgz}.smoke-backup`
  mkdirSync(cacheDir, { recursive: true })
  if (!existsSync(cacheTgz) && existsSync(backup)) renameSync(backup, cacheTgz) // 上次中断残留：先恢复真身再备份
  const hadReal = existsSync(cacheTgz)
  try {
    if (hadReal) renameSync(cacheTgz, backup)
    writeFileSync(cacheTgz, `tampered fixture — NOT the real @opengsd/gsd-core@${GSD_VERSION} tarball\n`)
    const r = spawnSync('node', ['build.mjs'], { cwd: ROOT, env: buildEnv(), encoding: 'utf8' })
    const out = `${r.stderr}${r.stdout}`
    assert.equal(r.status, 2, `tampered .build-cache tgz must fail-closed (exit 2), got ${r.status}: ${out.trim().slice(0, 300)}`)
    assert.match(out, /checksum mismatch/, 'exit 2 must come from the NOTICES integrity check, not a downstream gate')
  } finally {
    if (hadReal) {
      rmSync(cacheTgz, { force: true })
      renameSync(backup, cacheTgz)
    } else {
      rmSync(cacheTgz, { force: true })
    }
  }
})
