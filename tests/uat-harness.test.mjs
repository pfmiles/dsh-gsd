// tests/uat-harness.test.mjs — Phase 5 UAT 的唯一执行件（live 用例；默认整组跳过）。
//
// ── 两个开关 ────────────────────────────────────────────────────────────────
//   DSH_UAT_LIVE=1      显式开启 live 用例。未设时**一律** t.skip，理由逐条列出缺什么。
//                       live 用例要起真实 `dsh` 一次性会话并消费 LLM 凭据，而
//                       `prepack` 会跑全套测试（发布链 `npm publish` → `prepack`）
//                       —— 发布环境不该被 live 用例卡住，也不该在没有凭据时静默通过。
//   DSH_UAT_TGZ=<path>  要安装的 tarball；缺省时在 /tmp/uat-tgz/ 下解析
//                       `dsh-gsd-*.tgz`，且必须**恰好一个**（两个及以上即 skip 并列出）。
// 另需 `DEEPSEEK_API_KEY` 已在进程环境里（本 harness 只透传，绝不读取、打印或落盘）。
// 它是唯一能认证 `deepseek-official` 路由的凭据：干净 home 上没有
// `settings.yaml` 也照样能起会话（05-RESEARCH §Q1 Evidence B）。
// `ALIPAY_API_KEY` 这条路在本机实测会 `MISSING_CREDENTIAL`
// （05-RESEARCH §Q1 Evidence C），故从子进程环境删除——留着只会制造误判。
// `zstd` 与 `dsh` 也必须可跑（会话记录是 zstd 压缩的 JSONL）。
//
// ── 判据环境（D-01）────────────────────────────────────────────────────────
// 每个 live 用例都 `mkdtemp('/tmp/dsh-uat-')` 造一个一次性 `DSH_HOME`，并且**先
// delete 掉继承来的 `DSH_HOME` / `DSH_PROFILE` / `DSH_PROFILE_DIR`** —— 继承编排
// 会话的 `DSH_HOME=~/.dsh` 会让写动作落到真实 home，也会让「零残留」变成假前提。
// 本机 `~/.dsh` **不可**作判据环境：`skills/` 有 72 个旧脚本 `gsd-*`，`headless`/`web`
// 的 patch 里各有 2 行 `GSD-DSH-bridge`（本轮实测 2；`05-CONTEXT` 记的 1 已过时）。
// 在那上面「72 技能可见」会由旧源满足而静默失效。
//
// ── 会话判据（T-5-01：本 phase 的一号假绿通道）────────────────────────────
// 一次 `MISSING_CREDENTIAL` 的**失败**轮同样会创建 session 目录与
// `session.v4.jsonl.zstd`（实测 `sessions: 1`）。所以「sessions/ 非空」「目录存在」
// 「进程 exit 0」都不是证据——前两者在失败形态下也为真，后者在 bundle 被静默跳过时
// 仍为 0。唯一有效的谓词 = 事件流里
//     `assistant/message` 在场  ∧  任何 `turn/end` 记录内部（**递归**）没有 `kind === 'error'`。
// 实现在 `JSON.parse` 之后对事件对象做判断，不是对压缩流做行级正则。
//
// ── 为什么不在 scripts/ ────────────────────────────────────────────────────
// 仓根 `scripts/` 被 `.gitignore:8` 忽略、被 `build.mjs` 每轮 `rm -rf` 后从 staging
// 重建、且在 npm `files` 白名单内（会作为产品内容发出去）。`tests/` 三者皆无。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TGZ_DIR = '/tmp/uat-tgz'

// 子进程环境白名单构造：继承 PATH/HOME/凭据等必需项，然后显式删掉四个会污染判据
// 的键（理由见文件头）。`NO_COLOR` 让 `dsh` 的输出可稳定比对。
const uatEnv = () => {
  const env = { ...process.env }
  for (const k of ['DSH_HOME', 'DSH_PROFILE', 'DSH_PROFILE_DIR', 'ALIPAY_API_KEY']) delete env[k]
  env.NO_COLOR = '1'
  return env
}

const out = (r) => `${r.stderr || ''}${r.stdout || ''}`.trim().slice(0, 400)

// 一次性 home 内的 `dsh` 调用：唯一入口，防止某处漏设 DSH_HOME 而落到真实 home。
const runDsh = (args, { home, cwd = tmpdir(), timeout = 180000 } = {}) => {
  const env = uatEnv()
  if (home) env.DSH_HOME = home
  return spawnSync('dsh', args, { cwd, env, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 })
}

// 前置探测：缺什么就报什么（`t.skip` 的理由必须是可诊断的具体项，不是一句 "skipped"）。
const missingPrereqs = () => {
  const missing = []
  if (process.env.DSH_UAT_LIVE !== '1') {
    missing.push('DSH_UAT_LIVE is not 1 (live cases are opt-in: prepack runs the full suite, so it must not start real dsh sessions)')
  }
  if (!process.env.DEEPSEEK_API_KEY) missing.push('DEEPSEEK_API_KEY is not in the process env (the only route credential that works on a fresh home)')
  for (const [bin, argv] of [['dsh', ['-V']], ['zstd', ['--version']]]) {
    const r = spawnSync(bin, argv, { encoding: 'utf8' })
    if (r.error || r.status !== 0) missing.push(`${bin} is not runnable (session records need it)`)
  }
  const { tgz, candidates } = resolveTgz()
  if (!tgz) missing.push(`no single tarball: DSH_UAT_TGZ unset and ${TGZ_DIR} resolved ${candidates.length} candidate(s) [${candidates.join(', ') || 'none'}]`)
  return missing
}

const resolveTgz = () => {
  if (process.env.DSH_UAT_TGZ) {
    const p = resolve(process.env.DSH_UAT_TGZ)
    return { tgz: existsSync(p) ? p : null, candidates: existsSync(p) ? [p] : [] }
  }
  if (!existsSync(TGZ_DIR)) return { tgz: null, candidates: [] }
  const candidates = readdirSync(TGZ_DIR)
    .filter((f) => /^dsh-gsd-.*\.tgz$/.test(f))
    .sort()
    .map((f) => join(TGZ_DIR, f))
  return { tgz: candidates.length === 1 ? candidates[0] : null, candidates }
}

// 零 GSD 残留判据：判据环境本身必须是干净的，否则「插件提供了技能/hooks」无从谈起。
const residue = (home) => {
  const bad = []
  const skillsDir = join(home, 'skills')
  if (existsSync(skillsDir)) {
    const gsdSkills = readdirSync(skillsDir).filter((e) => e.startsWith('gsd-'))
    if (gsdSkills.length) bad.push(`skills/gsd-* present (${gsdSkills.length})`)
  }
  if (existsSync(join(home, 'gsd-core'))) bad.push('gsd-core/ present')
  for (const e of readdirSync(home)) {
    if (/^gsd-hooks\.dsh\.json/.test(e)) bad.push(`${e} present`)
  }
  const profiles = join(home, 'profiles')
  if (existsSync(profiles)) {
    for (const p of readdirSync(profiles)) {
      const patch = join(profiles, p, 'cordis.patch.yml')
      if (existsSync(patch) && readFileSync(patch, 'utf8').includes('GSD-DSH-bridge')) {
        bad.push(`profiles/${p}/cordis.patch.yml carries GSD-DSH-bridge`)
      }
      if (existsSync(join(profiles, p, 'node_modules', 'dsh-gsd'))) {
        bad.push(`profiles/${p}/node_modules/dsh-gsd present`)
      }
    }
  }
  return bad
}

// 会话记录发现：`sessions/<cwd-slug>/session-<uuid>/session.v4.jsonl.zstd`。
const sessionFiles = (home) => {
  const root = join(home, 'sessions')
  const found = []
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name === 'session.v4.jsonl.zstd') found.push(p)
    }
  }
  if (existsSync(root)) walk(root)
  return found.sort()
}

// 解压 + 逐行 JSON.parse。解析失败要带上文件名与行号——否则「记录读不动」会被误读成
// 「判据不成立」。
const readSession = (file) => {
  const r = spawnSync('zstd', ['-dc', file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  assert.equal(r.status, 0, `zstd -dc failed for ${file}: ${out(r)}`)
  const lines = (r.stdout || '').split('\n').filter((l) => l.trim())
  return lines.map((l, i) => {
    try {
      return JSON.parse(l)
    } catch (e) {
      throw new Error(`${file}:${i + 1} is not JSON (${e.message}): ${l.slice(0, 120)}`)
    }
  })
}

// 递归找 `kind === 'error'`：`turn/end` 的失败原因嵌在 `data.reason.kind` 里，
// 顶层找键会漏。只扫 `turn/end` 事件体，不扫 `assistant/message`（工具级错误允许存在）。
const carriesKindError = (v) => {
  if (Array.isArray(v)) return v.some(carriesKindError)
  if (v && typeof v === 'object') {
    if (v.kind === 'error') return true
    return Object.values(v).some(carriesKindError)
  }
  return false
}

// 会话判据本体：两半各自给可区分的失败消息（`no assistant/message` /
// `turn/end carried kind:error`）。
const assertSessionSucceeded = (file) => {
  const events = readSession(file)
  const types = [...new Set(events.map((e) => e && e.type))].join(',')
  const assistant = events.filter((e) => e && e.type === 'assistant/message')
  assert.ok(
    assistant.length > 0,
    `no assistant/message in ${file} — the turn produced no model output; event types: ${types.slice(0, 120)}`,
  )
  const turnEnds = events.filter((e) => e && e.type === 'turn/end')
  const errored = turnEnds.filter((e) => carriesKindError(e))
  assert.deepEqual(
    errored.map((e) => JSON.stringify(e.data ?? e).slice(0, 200)),
    [],
    `turn/end carried kind:error in ${file} — the session directory and .zstd exist anyway, so this is exactly the false-green channel (event types: ${types.slice(0, 120)})`,
  )
  return { types, assistantCount: assistant.length, turnEndCount: turnEnds.length }
}

// `- id: gsd` 与 `- id: gsd-hooks-bridge` 的行级计数。**不能**用 `includes('gsd')`：
// `gsd-hooks-bridge` 会被子串误计，两个 row 就变成了 3 次命中。
const rowCount = (text, id) => text.split('\n').filter((l) => new RegExp(`^\\s*-\\s+id:\\s+${id}\\s*$`).test(l)).length

// cordis.patch.yml 的「有效内容」：去掉注释行与空行后剩下的部分。空 profile 层是 `[]`。
const patchBody = (file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .join('\n')
    .trim()

// ─────────────────────────────────────────────────────────────────────────────
// ③ UAT-01 + INST-01 —— 一条路径到底
//    零残留 /tmp home → 一次调用建 profile 并跑会话 → `plugin add` → 不重启
//    再跑一次 one-shot → 会话记录谓词。
// ─────────────────────────────────────────────────────────────────────────────
test('③ UAT-01 / INST-01：零残留 /tmp home → plugin add → 新会话的会话记录谓词', { timeout: 600000 }, (t) => {
  const missing = missingPrereqs()
  if (missing.length) {
    t.skip(`live UAT requires: ${missing.join(' | ')}`)
    return
  }
  const { tgz } = resolveTgz()
  const home = mkdtempSync(join(tmpdir(), 'dsh-uat-'))
  let ok = false
  try {
    // 1) 判据环境前提：安装前零 GSD 残留（不做这一步，「插件提供了技能」就永远无从证明）。
    const before = residue(home)
    assert.deepEqual(before, [], `home not residue-free before install: ${before.join('; ')}`)

    // 2) 一次调用同时建 profile 与跑一轮会话（`--from-default-profile` 就是造 profile 的
    //    入口；没有单独的 `profile create`）。
    const boot = runDsh(['probe', '--from-default-profile', 'headless', '--json', '--approval-policy', 'never', 'reply with the word OK'], { home })
    const profileDir = join(home, 'profiles', 'probe')
    assert.equal(boot.status, 0, `fresh-home bootstrap exited ${boot.status} (profile not created?): ${out(boot)}`)
    assert.ok(existsSync(profileDir), `profile 'probe' was not created under ${home}/profiles: ${out(boot)}`)

    // 3) 安装 tarball。INST-01 = 单命令安装、零手工 patch。
    const add = runDsh(['plugin', '--profile', 'probe', 'add', tgz], { home })
    const addOut = out(add)
    assert.equal(add.status, 0, `dsh plugin add exited ${add.status}: ${addOut}`)
    assert.ok(
      existsSync(join(profileDir, 'node_modules', 'dsh-gsd')),
      `profiles/probe/node_modules/dsh-gsd missing after 'plugin add' — install did not land: ${addOut}`,
    )

    // 3a) INST-01 第一条：安装不改写 profile patch（仍为空数组 `[]`）。
    const patchFile = join(profileDir, 'cordis.patch.yml')
    assert.ok(existsSync(patchFile), `cordis.patch.yml missing in the profile: ${patchFile}`)
    const body = patchBody(patchFile)
    assert.equal(body, '[]', `cordis.patch.yml changed by 'plugin add' (expected the empty array []): ${body.slice(0, 200)}`)

    // 3b) INST-01 第二条：patch 里没有任何把 `gsd` / `gsd-hooks-bridge` 关掉的条目。
    //     用行级正则判 `disabled:` 后接真值——属性名本身不是判据（`disabled: false` 合法）。
    const patchText = readFileSync(patchFile, 'utf8')
    const disabling = patchText
      .split('\n')
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => /^\s*disabled:\s*(true|yes|on|!!js)/.test(l))
      .map(({ l, i }) => `L${i + 1}: ${l.trim()}`)
    assert.deepEqual(disabling, [], `patch disables an entry — the install would install-but-not-load: ${disabling.join('; ')}`)

    // 3c) INST-01 第三条（空入参边）。**实测与 05-RESEARCH §Q1 的断言相反**：
    //     `dsh plugin --profile <absent> add` 在本机 dsh 0.2.2-rc.1 上 **exit 0 并
    //     初始化该 profile**（`dsh plugin --help` 原文: "the profile whose plugins are
    //     managed (initialized on first use)"；stderr 打
    //     `dsh: initialized profile <name> at …`）。RESEARCH 记的「it does not create the
    //     profile」是错的。
    //     这里断言的是**真正的不变量**：不存在「第三种状态」——要么干净地失败且不留下
    //     profile，要么明确宣称初始化并真的把插件装进去。把「静默新建」本身当作缺陷会
    //     变成恒红；假装它失败则是伪造观测。
    const absentName = 'uat-absent-profile'
    const absent = runDsh(['plugin', '--profile', absentName, 'add', tgz], { home })
    const absentDir = join(home, 'profiles', absentName)
    const absentOut = out(absent)
    if (absent.status !== 0) {
      assert.ok(
        !existsSync(absentDir),
        `absent-profile 'plugin add' failed (exit ${absent.status}) but still left profiles/${absentName} behind: ${absentOut}`,
      )
    } else {
      assert.match(
        absent.stderr || '',
        /initialized profile/,
        `absent profile was created silently: exit 0 but stderr never says 'initialized profile …' — a fake single-command install: ${absentOut}`,
      )
      assert.ok(existsSync(join(absentDir, 'package.json')), `initialized profile has no package.json: ${absentOut}`)
      const absentDump = runDsh(['--profile', absentName, '--dump-config'], { home, timeout: 120000 })
      assert.equal(absentDump.status, 0, `--dump-config on the initialized profile exited ${absentDump.status}: ${out(absentDump)}`)
      assert.equal(
        rowCount(absentDump.stdout || '', 'gsd'),
        1,
        `initialized profile claims success but carries no 'gsd' row — the install never happened: ${out(absentDump)}`,
      )
    }

    // 4) 不重启（每次调用都是新进程 ⇒ hooks/技能天然在新挂载下生效），再跑一次 one-shot。
    const sessionsBefore = new Set(sessionFiles(home))
    const run2 = runDsh(['--profile', 'probe', '--json', '--approval-policy', 'never', 'reply with the word SECOND'], { home })
    assert.equal(run2.status, 0, `second one-shot exited ${run2.status} after 'plugin add': ${out(run2)}`)

    // 5) 会话目录集合的**差集**取到这一次新建的记录（不靠 mtime、不靠 slug 猜）。
    const fresh = sessionFiles(home).filter((f) => !sessionsBefore.has(f))
    assert.equal(
      fresh.length,
      1,
      `expected exactly 1 new session record after the second one-shot, found ${fresh.length}: ${fresh.join(', ')}`,
    )

    // 6) 判据本体。
    assertSessionSucceeded(fresh[0])

    // 7) 技能只可能来自插件：安装后 home 级 `skills/` 仍不存在（本机真正的假绿源就在这里）。
    assert.equal(
      existsSync(join(home, 'skills')),
      false,
      `${home}/skills exists after install — any 'skill visible' claim could come from a home-level source instead of the plugin`,
    )

    // 8) 仓根卫生：tarball 只能待在 /tmp（`*.tgz` 被 `.gitignore:2` 覆盖，但仓根出现
    //    tgz 仍说明有人把发布产物落在了工作树里）。
    const strays = readdirSync(ROOT).filter((f) => f.endsWith('.tgz'))
    assert.deepEqual(strays, [], `stray tarball(s) in the repo root: ${strays.join(', ')}`)

    ok = true
  } finally {
    if (ok) {
      rmSync(home, { recursive: true, force: true })
    } else {
      console.error(`[uat-harness] kept failing home for forensics: ${home}`)
    }
  }
})