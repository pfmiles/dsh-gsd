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
// ── 本文件的用例 ──────────────────────────────────────────────────────────
//   ① UAT-04 commit 校验三段对照（opt-in 拦 / opt-in 放 / 未 opt-in 放）
//   ② UAT-04 injection 扫描只落日志（advisory + INJECTION-PATTERN，绝不 block）
//   ③ UAT-01 / INST-01        ④ INST-02..05        ⑤ UAT-02 / UAT-03
//   ⑥ UAT-05 升级/回滚（同一命令换版本号）
//   ⑦ UAT-06 三点启动开销 + 技能 front-matter 的启动读取（不是 watch）
// ①② 不需要起 `dsh` 会话，也**不**吃凭据/tarball：它们只 `spawnSync` hook wrapper
// 配合成 payload，所以门控是 `hookPrereqs()`——**仅**要求 `DSH_UAT_LIVE=1`。opt-in 这
// 一半必须保留：无 live 环境 ⇒ 全 skip ⇒ ℹ fail 0 会被读成 UAT-04 通过（三段对照一次
// 都没跑），这是 T-5-12 那条 repudiation 通道的形状。hook 文件是 `hooks/` 的构建产物
// （不入 git），缺失时 ①② **skip** 并提示 `node build.mjs`，而不是把冷克隆判红。
//
// ── 为什么不在 scripts/ ────────────────────────────────────────────────────
// 仓根 `scripts/` 被 `.gitignore:8` 忽略、被 `build.mjs` 每轮 `rm -rf` 后从 staging
// 重建、且在 npm `files` 白名单内（会作为产品内容发出去）。`tests/` 三者皆无。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TGZ_DIR = '/tmp/uat-tgz'
// 判据环境必须落在 /tmp（D-01 / 计划硬判据）。macOS 的 `os.tmpdir()` 是
// `/var/folders/...`，所以这里显式钉 `/tmp`。
const UAT_TMP = '/tmp'

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
const runDsh = (args, { home, cwd = UAT_TMP, timeout = 180000 } = {}) => {
  const env = uatEnv()
  if (home) env.DSH_HOME = home
  return spawnSync('dsh', args, { cwd, env, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 })
}

// 前置探测（live 会话用例）：缺什么就报什么（`t.skip` 的理由必须是可诊断的具体项，
// 不是一句 "skipped"）。① ② 不用它——它们没有会话、凭据、tarball 依赖，见 `hookPrereqs()`。
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
  const { tgz, reason } = resolveTgz()
  if (!tgz) missing.push(`no single tarball: ${reason}`)
  return missing
}

// ①② 的前置：**只有** opt-in。保留 opt-in 是为了不让默认套件的全 skip 被读成 UAT-04
// 通过（见文件头）；凭据/`dsh`/`zstd`/tarball 与 hook 两向对照无关，绑上去只会让有
// hook 的人永远拿不到证据。
const hookPrereqs = () => {
  const missing = []
  if (process.env.DSH_UAT_LIVE !== '1') {
    missing.push('DSH_UAT_LIVE is not 1 (hook cases are opt-in: an always-on run must not make UAT-04 look covered by the default suite)')
  }
  return missing
}

// 解析待安装 tarball；无法唯一确定时同时给出**可诊断的原因**：`DSH_UAT_TGZ` 已设置但
// 路径不存在，与「未设置且 /tmp/uat-tgz 里没有唯一候选」是两个不同的修复动作，混成一句
// 「unset」会让人去查环境变量而不是查路径（IN-02）。
const resolveTgz = () => {
  if (process.env.DSH_UAT_TGZ) {
    const p = resolve(process.env.DSH_UAT_TGZ)
    if (existsSync(p)) return { tgz: p, candidates: [p], reason: null }
    return {
      tgz: null,
      candidates: [],
      reason: `DSH_UAT_TGZ is set to ${p} but no such file exists (point it at a real dsh-gsd-*.tgz, or unset it to auto-resolve under ${TGZ_DIR})`,
    }
  }
  if (!existsSync(TGZ_DIR)) {
    return { tgz: null, candidates: [], reason: `DSH_UAT_TGZ is unset and ${TGZ_DIR} does not exist (0 candidates)` }
  }
  const candidates = readdirSync(TGZ_DIR)
    .filter((f) => /^dsh-gsd-.*\.tgz$/.test(f))
    .sort()
    .map((f) => join(TGZ_DIR, f))
  return {
    tgz: candidates.length === 1 ? candidates[0] : null,
    candidates,
    reason: candidates.length === 1
      ? null
      : `DSH_UAT_TGZ is unset and ${TGZ_DIR} resolved ${candidates.length} candidate(s) [${candidates.join(', ') || 'none'}] (need exactly 1)`,
  }
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

// 解压后的原文（子串断言用）与逐行 JSON.parse（事件断言用）。解析失败要带上文件名与
// 行号——否则「记录读不动」会被误读成「判据不成立」。
const sessionText = (file) => {
  const r = spawnSync('zstd', ['-dc', file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  assert.equal(r.status, 0, `zstd -dc failed for ${file}: ${out(r)}`)
  return r.stdout || ''
}

const readSession = (file) =>
  sessionText(file)
    .split('\n')
    .filter((l) => l.trim())
    .map((l, i) => {
      try {
        return JSON.parse(l)
      } catch (e) {
        throw new Error(`${file}:${i + 1} is not JSON (${e.message}): ${l.slice(0, 120)}`)
      }
    })

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
  const home = mkdtempSync(join(UAT_TMP, 'dsh-uat-'))
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
// ═════════════════════════════════════════════════════════════════════════════
// ④⑤ 共用的落地助手（一次性 home / profile / 安装 / 快照 / dump 解析）
// ═════════════════════════════════════════════════════════════════════════════

const sha256 = (s) => createHash('sha256').update(s).digest('hex')

// 一次性 home + 从出厂模板造 profile（只造 profile、不起会话——`--dump-config` 即退出，
// 便宜且不产生 session 记录，所以 ④ 的受管面快照不会被「一次会话」污染）。
const createProfile = (templateName, profileName, home) => {
  const created = runDsh([profileName, '--from-default-profile', templateName, '--dump-config'], { home, timeout: 180000 })
  assert.equal(created.status, 0, `could not create profile ${profileName} from ${templateName}: ${out(created)}`)
  const profileDir = join(home, 'profiles', profileName)
  assert.ok(existsSync(profileDir), `profile dir not created: ${profileDir}`)
  return profileDir
}

const installPlugin = (profileName, tgz, home) => {
  const add = runDsh(['plugin', '--profile', profileName, 'add', tgz], { home })
  assert.equal(add.status, 0, `dsh plugin add exited ${add.status}: ${out(add)}`)
}

// home 树清单（排除某个前缀目录）：排序后的 `d|f <相对路径> [字节数]` 行 + 其 sha256。
// 只断字节数不断内容——INST-02 要的是「安装有没有写受管面」，不是内容指纹。
const homeTree = (home, excludeRel) => {
  const rows = []
  const walk = (dir, prefix) => {
    const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name
      if (excludeRel && (rel === excludeRel || rel.startsWith(`${excludeRel}/`))) continue
      const p = join(dir, e.name)
      if (e.isDirectory()) {
        rows.push(`d ${rel}`)
        walk(p, rel)
      } else {
        rows.push(`f ${rel} ${statSync(p).size}`)
      }
    }
  }
  walk(home, '')
  return { digest: sha256(rows.join('\n')), rows }
}

// 受管面五类：`skills/` `gsd-core/` `hooks/` `gsd-hooks.dsh.json*` 根级 `cordis.patch.yml`。
// 安装只允许写 `profiles/<p>/`，这五类在一次性 home 上必须**始终 ABSENT**。
const managedSurface = (home) => {
  const treeDigest = (rel) => {
    const rows = []
    const walk = (dir, prefix) => {
      for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const r = prefix ? `${prefix}/${e.name}` : e.name
        const p = join(dir, e.name)
        if (e.isDirectory()) {
          rows.push(`d ${r}`)
          walk(p, r)
        } else {
          rows.push(`f ${r} ${statSync(p).size}`)
        }
      }
    }
    walk(join(home, rel), '')
    return sha256(rows.join('\n'))
  }
  const presence = (rel, digest) => (existsSync(join(home, rel)) ? digest() : 'ABSENT')
  const hooksJson = readdirSync(home).filter((n) => /^gsd-hooks\.dsh\.json/.test(n)).sort()
  return {
    'skills/': presence('skills', () => treeDigest('skills')),
    'gsd-core/': presence('gsd-core', () => treeDigest('gsd-core')),
    'hooks/': presence('hooks', () => treeDigest('hooks')),
    'gsd-hooks.dsh.json*': hooksJson.length ? sha256(hooksJson.map((n) => `${n} ${statSync(join(home, n)).size}`).join('\n')) : 'ABSENT',
    'cordis.patch.yml': presence('cordis.patch.yml', () => sha256(readFileSync(join(home, 'cordis.patch.yml'), 'utf8'))),
  }
}

// `--dump-config` 里某一行 id 的 block（到下一个 `- id:` 或 `# ==` 标头为止）。
const idBlock = (text, id) => {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => new RegExp(`^\\s*-\\s+id:\\s+${id}\\s*$`).test(l))
  if (start < 0) return null
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*-\s+id:/.test(lines[i]) || /^# ==/.test(lines[i])) {
      end = i
      break
    }
  }
  return lines.slice(start, end)
}

// YAML 标量读取：支持 `key: <literal>` 与 `key: !!js >-` 折叠块（dump 的实测形态）以及
// `key: !!js "<expr>"` 单行形态。零 YAML 依赖——与 `docs-consistency` ⑪ 的约定一致。
const scalarEntry = (block, key) => {
  const idx = block.findIndex((l) => new RegExp(`^\\s+${key}:`).test(l))
  if (idx < 0) return null
  const keyIndent = block[idx].match(/^\s*/)[0].length
  const rest = block[idx].slice(block[idx].indexOf(`${key}:`) + key.length + 1).trim()
  if (!/^!!js/.test(rest)) return { kind: 'literal', value: rest.replace(/^["']|["']$/g, '') }
  const inline = rest.replace(/^!!js\s*(?:>-\s*|>|\|)?/, '').trim()
  if (inline) return { kind: 'js', expr: inline.replace(/^["']|["']$/g, '') }
  const cont = []
  for (let i = idx + 1; i < block.length; i++) {
    if (!block[i].trim()) {
      cont.push('')
      continue
    }
    if (block[i].match(/^\s*/)[0].length <= keyIndent) break
    cont.push(block[i].trim())
  }
  return { kind: 'js', expr: cont.join(' ') }
}

// 求值 `!!js` 表达式。`baseUrl` = profile 目录（DSH 加载器给 `!!js` 的上下文）；用
// `new Function` 而不是 `eval`，作用域里只放 `baseUrl` 与 `process`（表达式实测只用
// `process.getBuiltinModule(...)`）。
const evalJsExpr = (expr, baseUrl) => new Function('baseUrl', 'process', `return (${expr});`)(baseUrl, process)

// 会话里「对 `.env` 发起的工具调用」：read 的 file_path、或 bash 命令里的 `.env` 路径。
// 前缀类必须含 `/`（实测形态是 `{"file_path":"/tmp/uat-repo-x/.env"}`）与 `\`（模型有时
// 用 `grep '\.env'` 这种转义写法）；后缀类排除 `.env.example` 一族。
const isEnvPathRef = (args) => /(?:^|[/\\\s"'=])\.env(?:$|["'\s\]])/.test(String(args || ''))

// ─────────────────────────────────────────────────────────────────────────────
// ④ INST-02 / INST-03 / INST-04 / INST-05 —— 同一个 home 上前后对照
//    INST-02 装前/装后受管面哈希差集；INST-03 装即注册（不重启）；INST-05 两行 + `!!js`
//    展开为包内绝对路径；INST-04 卸载归零 + 幂等边 + 空操作边。
// ─────────────────────────────────────────────────────────────────────────────
test('④ INST-02..05：受管面差集 / 装即注册 / !!js 展开 / 卸载归零与两个边', { timeout: 600000 }, (t) => {
  const missing = missingPrereqs()
  if (missing.length) {
    t.skip(`live UAT requires: ${missing.join(' | ')}`)
    return
  }
  const { tgz } = resolveTgz()
  const home = mkdtempSync(join(UAT_TMP, 'dsh-uat-'))
  const P = 'probe4'
  let ok = false
  try {
    const profileDir = createProfile('headless', P, home)

    // ── INST-02：装前快照 → 装后快照（差集只允许落在 profiles/<p>/ 之内）
    const before = homeTree(home, `profiles/${P}`)
    const managedBefore = managedSurface(home)
    installPlugin(P, tgz, home)
    const after = homeTree(home, `profiles/${P}`)
    const managedAfter = managedSurface(home)

    const added = after.rows.filter((r) => !before.rows.includes(r))
    const removed = before.rows.filter((r) => !after.rows.includes(r))
    assert.deepEqual(
      [...added.map((r) => `+${r}`), ...removed.map((r) => `-${r}`)],
      [],
      `managed surface changed outside profiles/${P}/: ${[...added.map((r) => `+${r}`), ...removed.map((r) => `-${r}`)].join('; ')}`,
    )
    assert.deepEqual(managedAfter, managedBefore, 'managed surface changed outside profiles/ — the install wrote a home-level file')
    for (const [label, digest] of Object.entries(managedAfter)) {
      assert.equal(digest, 'ABSENT', `${label} was written by the install — INST-02 requires a zero-write install outside profiles/`)
    }

    // ── INST-03：add 之后**不重启**立刻 dump（每次调用都是新进程，所以「不重启」成立）
    const dump = runDsh(['--profile', P, '--dump-config'], { home, timeout: 180000 })
    assert.equal(dump.status, 0, `--dump-config exited ${dump.status}: ${out(dump)}`)
    const dumpText = dump.stdout || ''
    const gsdRows = rowCount(dumpText, 'gsd')
    const bridgeRows = rowCount(dumpText, 'gsd-hooks-bridge')
    assert.equal(gsdRows, 1, `gsd rows != 1 (gsd=${gsdRows}, gsd-hooks-bridge=${bridgeRows}) — INST-03 red: install did not register exactly one 'gsd' row`)
    assert.equal(bridgeRows, 1, `gsd rows != 1 (gsd=${gsdRows}, gsd-hooks-bridge=${bridgeRows}) — INST-03 red: expected exactly one 'gsd-hooks-bridge' row`)

    // ── INST-05：configPath 必须是含 node_modules/dsh-gsd 的绝对路径。
    // dump-config 的实测行为：`!!js` 表达式**不被求值**（DSH 源码：dump-config 是
    // "without booting or evaluating `!!js`"），所以这里对声明的表达式做一次**真实求值**
    // ——baseUrl = profile 目录，与 DSH 加载器一致——断言求值结果是包内绝对路径且文件在盘。
    // 这比「dump 里出现绝对路径」更强：它同时排掉了 CR-01 那类 off-by-one 自定位。
    const block = idBlock(dumpText, 'gsd-hooks-bridge')
    assert.ok(block, `gsd rows != 1 (gsd=${gsdRows}, gsd-hooks-bridge=0) — INST-03 red: the bridge row is missing`)
    const configPath = scalarEntry(block, 'configPath')
    assert.ok(configPath, 'configPath missing from the gsd-hooks-bridge row — INST-05 red')
    assert.equal(block.join('\n').includes('${'), false, `configPath carries an unexpanded \${…} placeholder — INST-05 red: ${block.join(' ').slice(0, 200)}`)
    let resolvedPath
    if (configPath.kind === 'literal') {
      resolvedPath = configPath.value
    } else {
      try {
        resolvedPath = evalJsExpr(configPath.expr, `${profileDir}/`)
      } catch (e) {
        assert.fail(`!!js literal survived unexpanded: configPath expression could not be evaluated (${e.message}): ${configPath.expr.slice(0, 160)}`)
      }
    }
    assert.ok(
      typeof resolvedPath === 'string' && isAbsolute(resolvedPath) && resolvedPath.includes(`${sep}node_modules${sep}dsh-gsd${sep}`),
      `configPath is not an absolute in-package path (got '${String(resolvedPath).slice(0, 200)}') — INST-05 red: the hooks bridge would mount with a path that is not inside the installed package`,
    )
    assert.ok(existsSync(resolvedPath), `configPath does not resolve to an existing file: ${resolvedPath}`)

    // ── INST-04：两侧都断言 —— 删之前必须在场（INST-03 已断），删之后必须归零
    const pkgFile = join(profileDir, 'package.json')
    const manifestOf = () => {
      const j = JSON.parse(readFileSync(pkgFile, 'utf8'))
      return JSON.stringify({
        dependencies: Object.keys(j.dependencies || {}).sort(),
        bundles: [...(j.dsh?.profile?.bundles || [])].sort(),
      })
    }
    const manifestInstalled = manifestOf()
    assert.ok(manifestInstalled.includes('dsh-gsd'), `profile manifest does not carry dsh-gsd before remove: ${manifestInstalled}`)
    assert.ok(existsSync(join(profileDir, 'node_modules', 'dsh-gsd')), 'node_modules/dsh-gsd missing before remove — positive side of INST-04 failed')

    const rm1 = runDsh(['plugin', '--profile', P, 'remove', 'dsh-gsd'], { home })
    assert.equal(rm1.status, 0, `dsh plugin remove exited ${rm1.status}: ${out(rm1)}`)
    const dumpAfterRemove = runDsh(['--profile', P, '--dump-config'], { home, timeout: 180000 })
    assert.equal(dumpAfterRemove.status, 0, `--dump-config after remove exited ${dumpAfterRemove.status}: ${out(dumpAfterRemove)}`)
    assert.equal(rowCount(dumpAfterRemove.stdout || '', 'gsd'), 0, 'rows survived remove — INST-04 red: the gsd row is still composed after uninstall')
    assert.equal(rowCount(dumpAfterRemove.stdout || '', 'gsd-hooks-bridge'), 0, 'rows survived remove — INST-04 red: the gsd-hooks-bridge row is still composed after uninstall')
    assert.equal(existsSync(join(profileDir, 'node_modules', 'dsh-gsd')), false, 'node_modules/dsh-gsd still present after remove — INST-04 red')

    // 幂等边：第二次 remove 不改 profile 清单、不打印移除成功
    const manifestAfterFirst = manifestOf()
    const rm2 = runDsh(['plugin', '--profile', P, 'remove', 'dsh-gsd'], { home })
    assert.equal(manifestOf(), manifestAfterFirst, 'second remove mutated the manifest — INST-04 idempotency edge red')
    assert.doesNotMatch(String(rm2.stdout || ''), /^\s*-\s+dsh-gsd\s+\d/m, `second remove reported success — INST-04 idempotency edge red: '${String(rm2.stdout).trim().slice(0, 200)}'`)

    // 空操作边：对**从未装过**的 profile 跑 remove，不得伪装成一次成功卸载
    const P3 = 'uat-never-installed'
    const created3 = runDsh([P3, '--from-default-profile', 'headless', '--dump-config'], { home, timeout: 180000 })
    assert.equal(created3.status, 0, `could not create ${P3}: ${out(created3)}`)
    const p3pkg = join(home, 'profiles', P3, 'package.json')
    const p3before = readFileSync(p3pkg, 'utf8')
    const rm3 = runDsh(['plugin', '--profile', P3, 'remove', 'dsh-gsd'], { home })
    const p3changed = readFileSync(p3pkg, 'utf8') !== p3before
    assert.ok(
      rm3.status !== 0 || !p3changed,
      `remove on a never-installed profile exited 0 — INST-04 empty edge red: a no-op was reported as a successful uninstall: '${String(rm3.stdout || '').trim().slice(0, 200)}'`,
    )
    assert.doesNotMatch(
      String(rm3.stdout || ''),
      /^\s*-\s+dsh-gsd\s+\d/m,
      `remove on a never-installed profile reported success — INST-04 empty edge red: '${String(rm3.stdout || '').trim().slice(0, 200)}'`,
    )
    assert.equal(existsSync(join(home, 'profiles', P3, 'node_modules', 'dsh-gsd')), false, `a no-op remove created node_modules/dsh-gsd under ${P3}`)

    ok = true
  } finally {
    if (ok) {
      rmSync(home, { recursive: true, force: true })
    } else {
      console.error(`[uat-harness] kept failing home for forensics: ${home}`)
    }
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ UAT-02 + UAT-03 —— 同一次真实会话里的两半
//    UAT-02：无 `.planning/` 的临时 git 仓里 `/gsd-new-project`（auto）造出 `.planning/`
//            且 PROJECT.md / ROADMAP.md / STATE.md 三者在场；`/gsd-health` 的引擎经包内
//            绝对路径解析（不靠 PATH）。
//    UAT-03：**两个**哨兵（`.env` 一个、`notes.txt` 一个）—— `.env` 的读被 guard 拦住
//            且该哨兵**不进**会话记录；`notes.txt` 的读成功且其哨兵**进入**会话记录。
//            阳性对照缺失即判红：「拦住了」与「根本没读到」不可区分。
//    为什么是两个哨兵而不是一个：判据段要求「哨兵不出现在记录里」与「哨兵出现在记录里」
//    同时成立 —— 同一个串无法同时成立（一个成功读取就把它写进了记录）。两个同前缀、
//    不同值的哨兵保留了原意（证明拦的是**文件名规则**，不是模型不肯读），且让两条断言
//    互不矛盾。见 05-UAT-EVIDENCE.md 判据段 3 的偏离记录。
// ─────────────────────────────────────────────────────────────────────────────
test('⑤ UAT-02 / UAT-03：gsd-new-project 造 .planning + health 包内引擎路径 + .env 拦截与 .txt 阳性对照', { timeout: 1500000 }, (t) => {
  const missing = missingPrereqs()
  if (missing.length) {
    t.skip(`live UAT requires: ${missing.join(' | ')}`)
    return
  }
  const { tgz } = resolveTgz()
  const home = mkdtempSync(join(UAT_TMP, 'dsh-uat-'))
  const repo = mkdtempSync(join(UAT_TMP, 'uat-repo-'))
  const P = 'probe5'
  const envSentinel = `UATENV-${randomBytes(4).toString('hex')}`
  const txtSentinel = `UATENV-${randomBytes(4).toString('hex')}`
  let ok = false
  try {
    createProfile('headless', P, home)
    installPlugin(P, tgz, home)

    // 临时 git 仓：GSD 的 scaffold 需要仓上下文；不 commit 也可以，但要断言前置为空。
    execFileSync('git', ['init', '-q'], { cwd: repo })
    assert.equal(existsSync(join(repo, '.planning')), false, `fixture repo already has .planning/: ${repo}`)
    writeFileSync(join(repo, '.env'), `${envSentinel}\n`)
    writeFileSync(join(repo, 'notes.txt'), `${txtSentinel}\n`)

    // 一次会话做完两半（UAT-02 → UAT-03）。提示词里**不出现任何哨兵值**：哨兵只能由
    // 「读到文件」进入记录，否则 (b) 那条断言就失去意义（把哨兵写进 prompt 等于自己把
    // 内容送进上下文）。
    const TASK = [
      'Two things, in order, in the current directory.',
      '1) Use the gsd-new-project skill to initialize GSD planning in auto mode (non-interactive, no questions), then run the gsd-health skill and report its status line.',
      '2) Then read the two files .env and notes.txt in the current directory and report each file\'s exact contents; if a read is refused, say which file and why.',
      'Create files only inside this directory.',
    ].join(' ')

    const before = new Set(sessionFiles(home))
    const run = runDsh(['--profile', P, '--json', '--approval-policy', 'never', TASK], { home, cwd: repo, timeout: 900000 })
    assert.equal(run.status, 0, `the UAT session exited ${run.status}: ${out(run)}`)
    const fresh = sessionFiles(home).filter((f) => !before.has(f))
    assert.equal(fresh.length, 1, `expected exactly 1 new session record, found ${fresh.length}: ${fresh.join(', ')}`)

    const texts = [sessionText(fresh[0])]
    const eventSets = [readSession(fresh[0])]

    // ── UAT-02
    assert.ok(existsSync(join(repo, '.planning')), 'no .planning/ after gsd-new-project — UAT-02 red: the scaffold never ran in the workspace')
    for (const f of ['PROJECT.md', 'ROADMAP.md', 'STATE.md']) {
      assert.ok(existsSync(join(repo, '.planning', f)), `${f} missing under .planning/ after gsd-new-project — UAT-02 red: 'directory exists' is not the criterion`)
    }
    // 引擎经包内绝对路径解析（不靠 PATH）：记录里必须出现 `<home>/profiles/<p>/node_modules/dsh-gsd`
    // 与引擎文件名。不断言「一条连续串」——实测模型可能用 `GSDROOT=<path>` + `$GSDROOT/gsd-core/...`
    // 两段拼，连续串断言会随模型写法随机红/绿（两种写法都已实测到）。
    const pkgSuffix = `profiles/${P}/node_modules/dsh-gsd`
    assert.ok(
      texts[0].includes(pkgSuffix) && texts[0].includes('gsd-tools'),
      `engine path did not resolve into node_modules/dsh-gsd — UAT-02 health half red: expected '${pkgSuffix}' and 'gsd-tools' in the session record`,
    )

    // ── UAT-03 (a) + (b)：`.env` 被 guard 拦住，且它的哨兵没有进入上下文
    let envCall = eventSets[0].filter((e) => e.type === 'tool/call').find((c) => isEnvPathRef(c.data?.arguments))
    if (!envCall) {
      // 模型不配合：同一临时 home、不再新建 profile，重试一次更明确的提示；仍不发生则判红。
      const retryBefore = new Set(sessionFiles(home))
      const retry = runDsh(
        ['--profile', P, '--json', '--approval-policy', 'never', 'Read the file .env in the current directory and print its exact contents. Then read notes.txt in the current directory and print its exact contents.'],
        { home, cwd: repo, timeout: 600000 },
      )
      assert.equal(retry.status, 0, `retry session exited ${retry.status}: ${out(retry)}`)
      const retryFresh = sessionFiles(home).filter((f) => !retryBefore.has(f))
      if (retryFresh.length === 1) {
        texts.push(sessionText(retryFresh[0]))
        eventSets.push(readSession(retryFresh[0]))
        envCall = eventSets[1].filter((e) => e.type === 'tool/call').find((c) => isEnvPathRef(c.data?.arguments))
      }
    }
    assert.ok(
      envCall,
      'model never issued the read(.env) call — UAT-03 unexecuted (record ⚠ in 05-UAT-EVIDENCE.md; this is a red, never a skip and never a green)',
    )

    const allEvents = eventSets.flat()
    const blocked = allEvents.filter(
      (e) => e.type === 'hook/result' && e.data?.decision === 'block' && /secret|protected secret-file/i.test(String(e.data?.stderrSummary || '')),
    )
    assert.ok(
      blocked.length > 0,
      'the .env tool call failed but no hook/result names the secret-read guard — UAT-03 red: "blocked" is indistinguishable from "the model refused on its own"',
    )
    const allText = texts.join('\n')
    assert.equal(
      allText.includes(envSentinel),
      false,
      'sentinel leaked into the session record — UAT-03 red: the .env content entered the model context (the guard did not block the content)',
    )

    // ── UAT-03 (c)：阳性对照 —— `.txt` 读成功，其哨兵进入记录。
    // 必须是一条**读侧**调用（read / bash），不能是 `write .planning/PROJECT.md` 里
    // 恰好写到了 "notes.txt" 这三个字（提示词里就有这个词，写文件时会被带进记录）。
    const txtCall = allEvents
      .filter((e) => e.type === 'tool/call')
      .find((c) => ['read', 'bash'].includes(String(c.data?.name)) && /(?:^|[/\\\s"'])notes\.txt(?:$|["'\s\]])/.test(String(c.data?.arguments || '')))
    assert.ok(
      txtCall,
      'the session never issued a read of notes.txt — UAT-03 red: the positive control never ran, so "blocked" proves nothing',
    )
    assert.ok(
      allText.includes(txtSentinel),
      'sentinel never appeared for the .txt twin — UAT-03 red: without the positive control, "blocked" and "never read anything" are indistinguishable',
    )

    // 仓根卫生（同 ③）。
    const strays = readdirSync(ROOT).filter((f) => f.endsWith('.tgz'))
    assert.deepEqual(strays, [], `stray tarball(s) in the repo root: ${strays.join(', ')}`)

    ok = true
  } finally {
    if (ok) {
      rmSync(repo, { recursive: true, force: true })
      rmSync(home, { recursive: true, force: true })
    } else {
      console.error(`[uat-harness] kept failing home for forensics: ${home}`)
      console.error(`[uat-harness] kept failing workspace for forensics: ${repo}`)
    }
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// ①② 的共用件（UAT-04：hooks 回归）
//   两个 hook 都由 `config/gsd-hooks.json` 经 `hooks/dsh-gsd-suite/run.cjs` 调度
//   （`bash`/30 s 与 `read|web_fetch|web_search`/5 s 两条），所以**不必起 dsh 进程**
//   就能拿到与真实会话同一条分发路径上的判定。`tests/build-smoke.test.mjs:118-146`
//   已用这个形态测过 `.env` guard。
//   ⚠ `hooks/` 是构建产物（`.gitignore:5`），不在 git 里；缺了它只能报「先 build」。
// ═════════════════════════════════════════════════════════════════════════════
const HOOK_WRAPPER = join(ROOT, 'hooks', 'dsh-gsd-suite', 'run.cjs')
const COMMIT_HOOK = join(ROOT, 'hooks', 'gsd-validate-commit.sh')
const INJECTION_HOOK = join(ROOT, 'hooks', 'gsd-read-injection-scanner.js')
const INJECTION_FIXTURE = join(ROOT, 'tests', 'fixtures', 'injection-sample.md')

// `gsd-validate-commit.sh` 的三条 fail-open 通道都以这一句收尾（opt-in 读失败 /
// command 抽取失败 / 分类器跑不动）。判据段 4 的三段都要求 stderr **不含**它：
// 不含 = 判定来自真实规则；含 = 判定不可用（脚本自己说了它被禁用）。
const FAIL_OPEN_LINE = /validator disabled/i

// ═════════════════════════════════════════════════════════════════════════════
// ① UAT-04 的 commit 半边 —— 三段对照，缺一段就不成立
//   (a) opt-in + 非规范 → exit 2 且判定 JSON 是 block/CONVENTIONAL_COMMITS_VIOLATION
//   (b) opt-in +  规范 → exit 0 且**不**产出 block 判定
//       （没有这一向，一个恒拦的 hook 也会「通过」两向对照）
//   (c) 未 opt-in + 非规范 → exit 0
//       （负向对照：证明 (a) 的红来自 opt-in 打开后的真实判定，不是巧合）
//   三段的 cwd 由 spawnSync 的 `cwd` 区分：`gsd-validate-commit.sh` 用
//   `require('./.planning/config.json')` 读**当前工作目录**的配置，所以绝不能改本仓
//   配置（本仓一旦 opt-in，此后每次 commit 都要过校验，属不可逆的骚扰）。
// ═════════════════════════════════════════════════════════════════════════════
test('① UAT-04 commit 校验三段对照：opt-in 拦 / opt-in 放 / 未 opt-in 放', { timeout: 180000 }, (t) => {
  const missing = hookPrereqs()
  if (missing.length) {
    t.skip(`hook UAT requires: ${missing.join(' | ')}`)
    return
  }
  // hooks/ 是 gitignore 的构建产物：冷克隆上缺它应当 skip 并指路，而不是判红。
  const absent = [
    [HOOK_WRAPPER, 'the stdio adapter every guard is dispatched through'],
    [COMMIT_HOOK, 'the commit validator under test'],
  ].filter(([p]) => !existsSync(p))
  if (absent.length) {
    t.skip(
      `${absent.map(([p, why]) => `${p} missing (${why})`).join(' | ')}`
        + ' — hooks/ is gitignored: run `node build.mjs` before the hook cases',
    )
    return
  }

  const base = mkdtempSync(join(UAT_TMP, 'uat-hook-'))
  try {
    const ON = join(base, 'on')
    const OFF = join(base, 'off')
    for (const d of [ON, OFF]) mkdirSync(join(d, '.planning'), { recursive: true })
    // opt-in 的键是 `hooks.community`（不是 `hooks.commit_types`——那只是额外类型）。
    writeFileSync(join(ON, '.planning', 'config.json'), `${JSON.stringify({ hooks: { community: true } }, null, 2)}\n`)
    // 与本仓现状同形：只有 context_warnings，没有 community ⇒ 校验器静默 exit 0。
    writeFileSync(join(OFF, '.planning', 'config.json'), `${JSON.stringify({ hooks: { context_warnings: true } }, null, 2)}\n`)

    const BAD = 'git commit -m "Update the release notes."'
    const GOOD = 'git commit -m "feat(05-02): wire the UAT hook regression"'
    const run = (cwd, command) =>
      spawnSync('node', [HOOK_WRAPPER, 'sh', COMMIT_HOOK], {
        cwd,
        encoding: 'utf8',
        input: JSON.stringify({ tool_name: 'bash', tool_input: { command } }),
      })
    const emitsBlock = (stdout) => /"decision"\s*:\s*"block"/.test(String(stdout || ''))

    // (a) opt-in + 非规范 → 必须拦
    const a = run(ON, BAD)
    assert.doesNotMatch(a.stderr || '', FAIL_OPEN_LINE, `validator disabled line on stderr in (a) — the opt-in config could not be read, so this verdict is unusable: ${out(a)}`)
    assert.equal(a.status, 2, `opt-in commit was not blocked (exit ${a.status}) — a non-conforming message under hooks.community:true must exit 2: ${out(a)}`)
    let verdict
    try {
      verdict = JSON.parse(a.stdout)
    } catch (e) {
      assert.fail(`(a) blocked but stdout is not a judgement JSON (${e.message}): ${String(a.stdout).slice(0, 200)}`)
    }
    assert.equal(verdict.decision, 'block', `(a) judgement decision != block: ${String(a.stdout).slice(0, 200)}`)
    assert.equal(
      verdict.code,
      'CONVENTIONAL_COMMITS_VIOLATION',
      `(a) blocked for the wrong reason (code=${verdict.code}) — the fixture message must trip the TYPE/FORMAT rule, not the 72-char length rule: ${String(a.stdout).slice(0, 200)}`,
    )

    // (b) opt-in + 规范 → 必须放行，且不得产出 block 判定
    const b = run(ON, GOOD)
    assert.doesNotMatch(b.stderr || '', FAIL_OPEN_LINE, `validator disabled line on stderr in (b) — the opt-in config could not be read, so this verdict is unusable: ${out(b)}`)
    assert.equal(b.status, 0, `conforming commit was blocked (exit ${b.status}) — an always-blocking validator would also "pass" the two-way comparison: ${out(b)}`)
    assert.equal(emitsBlock(b.stdout), false, `(b) allowed but still emitted a block decision: ${String(b.stdout).slice(0, 200)}`)

    // (c) 未 opt-in + 非规范 → 必须放行（负向对照）
    const c = run(OFF, BAD)
    assert.doesNotMatch(c.stderr || '', FAIL_OPEN_LINE, `validator disabled line on stderr in (c) — the negative control is supposed to be the hook's deliberate silent pass, not a config read failure: ${out(c)}`)
    assert.equal(c.status, 0, `non-conforming commit passed without opt-in — the negative control did not hold, so (a)'s red is not attributable to the opt-in: ${out(c)}`)
    assert.equal(emitsBlock(c.stdout), false, `(c) not opted in but emitted a block decision: ${String(c.stdout).slice(0, 200)}`)

    // ── 第四条事实：本仓**未** opt-in，所以 commit 校验在本仓默认不生效。
    // 这是一条**断言**而不是注释：把本仓配置改坏会让它红，并给出可行动的消息。
    const repoCfgFile = join(ROOT, '.planning', 'config.json')
    const repoCfg = existsSync(repoCfgFile) ? JSON.parse(readFileSync(repoCfgFile, 'utf8')) : null
    assert.notEqual(
      repoCfg?.hooks?.community,
      true,
      'repo config unexpectedly opts in — if this repo has opted in, rewrite the fourth UAT-04 fact in 05-UAT.md and 05-UAT-EVIDENCE.md 判据段 4 instead of letting this assertion go red',
    )

    console.log(
      `[uat-harness] ① commit 三段对照: opt-in+nonconforming=exit ${a.status}/block:${verdict.code} | ` +
        `opt-in+conforming=exit ${b.status}/no-block | no-opt-in+nonconforming=exit ${c.status}/no-block | ` +
        `repo hooks.community=${repoCfg?.hooks?.community === true ? 'true' : 'absent'}`,
    )
  } finally {
    rmSync(base, { recursive: true, force: true })
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// ② UAT-04 的 injection 半边 —— 落在**日志**而不是 block
//   `gsd-read-injection-scanner.js` 是 **PostToolUse** 的 advisory 扫描器：只有
//   `security.injection_blocking=true` 时才拦 HIGH。断言「被拦住」会按设计失败；
//   断言「无输出」则连扫描器有没有跑都证明不了。SC-2 的原话也只要求「落日志」。
//   payload 装成 `PostToolUse`：`tool_name=read` + `tool_input.file_path` 指 fixture
//   + `tool_response` 就是正文（与 05-RESEARCH §Q6 记录的 /tmp/hook-payload-posttool.log
//   同形）。cwd 取仓根，这样扫描器读到的是**本仓**的 `.planning/config.json`。
// ═════════════════════════════════════════════════════════════════════════════
test('② UAT-04 injection 扫描落日志：fixture → advisory + INJECTION-PATTERN，不 block', { timeout: 180000 }, (t) => {
  const missing = hookPrereqs()
  if (missing.length) {
    t.skip(`hook UAT requires: ${missing.join(' | ')}`)
    return
  }
  // 同 ①：缺构建产物/夹具 ⇒ skip + 指路（hook 两向对照不应因未构建而判红）。
  const absent = [
    [HOOK_WRAPPER, 'the stdio adapter every guard is dispatched through'],
    [INJECTION_HOOK, 'the injection scanner under test'],
    [INJECTION_FIXTURE, 'the committed injection fixture (UAT-04 payload)'],
  ].filter(([p]) => !existsSync(p))
  if (absent.length) {
    t.skip(
      `${absent.map(([p, why]) => `${p} missing (${why})`).join(' | ')}`
        + ' — run `node build.mjs` before the hook cases (hooks/ is gitignored);'
        + ' tests/fixtures/injection-sample.md is tracked, so restore it from git if that is the missing path',
    )
    return
  }

  const body = readFileSync(INJECTION_FIXTURE, 'utf8')
  const r = spawnSync('node', [HOOK_WRAPPER, 'node', INJECTION_HOOK], {
    cwd: ROOT,
    encoding: 'utf8',
    input: JSON.stringify({ tool_name: 'read', tool_input: { file_path: INJECTION_FIXTURE }, tool_response: body }),
  })
  assert.equal(
    r.status,
    0,
    `scanner exited non-zero (${r.status}) — this hook is PostToolUse/advisory; a non-zero exit means it was turned into a block: ${out(r)}`,
  )
  let parsed
  try {
    parsed = JSON.parse(r.stdout)
  } catch (e) {
    assert.fail(`scanner exited 0 but stdout is not JSON (${e.message}) — "no output" cannot distinguish "scanned and clean" from "never ran": ${String(r.stdout).slice(0, 200)}`)
  }
  const hso = parsed.hookSpecificOutput || {}
  const findings = Array.isArray(hso.findings) ? hso.findings : []
  const injected = findings.filter((f) => f && f.ruleId === 'INJECTION-PATTERN')
  assert.ok(['LOW', 'HIGH'].includes(hso.severity), `scanner produced no severity (got ${JSON.stringify(hso.severity)}) — the advisory never rendered: ${String(r.stdout).slice(0, 200)}`)
  assert.ok(
    injected.length > 0,
    `no INJECTION-PATTERN finding — the scanner did not recognise tests/fixtures/injection-sample.md (severity=${hso.severity}, findings=${findings.length}, ruleIds=${findings.map((f) => f && f.ruleId).join('|') || 'none'})`,
  )
  assert.notEqual(
    parsed.decision,
    'block',
    `scanner emitted a block decision — this repo does not set security.injection_blocking, and asserting a block would manufacture a red by design (severity=${hso.severity}, findings=${findings.length})`,
  )

  console.log(`[uat-harness] ② injection: severity=${hso.severity} findings=${findings.length} INJECTION-PATTERN=${injected.length} decision=${parsed.decision ?? '(none)'}`)
})

// ═════════════════════════════════════════════════════════════════════════════
// ⑥ 的助手（UAT-05：复刻「只有版本串不同」的第二份 tarball）
//   `.dsh021` **从未也永不发布**：它由已打好的 tarball 解包后改 `version`、再
//   `npm pack --ignore-scripts` 本地生成。所以这条判据证的是「换版本号这条命令的
//   机制」，**不是** registry 上的升级历史（T-5-14 的 repudiation 通道）。
//   `--ignore-scripts` 是硬要求：不带它的 `npm pack` 会跑 `prepack`（`node build.mjs`
//   + 整套测试），而整套测试里就有本 harness ⇒ 递归且不可收敛。
// ═════════════════════════════════════════════════════════════════════════════
const tarMembers = (tgz) => {
  const r = spawnSync('tar', ['-tzf', tgz], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  assert.equal(r.status, 0, `tar -tzf failed for ${tgz}: ${out(r)}`)
  return (r.stdout || '')
    .split('\n')
    .filter(Boolean)
    .sort()
}

// 解包后的树 → Map<相对路径, Buffer>（逐字节比对用；958 个小文件，代价可忽略）。
const snapshotDir = (dir, prefix = '', acc = new Map()) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name
    const p = join(dir, e.name)
    if (e.isDirectory()) snapshotDir(p, rel, acc)
    else acc.set(rel, readFileSync(p))
  }
  return acc
}

// 两份 tarball 的「只有版本串不同」断言。三段：
//   (a) 成员清单逐行相同；
//   (b) 除 `package.json` 外每个成员逐字节相同；
//   (c) `package.json` 在 JSON 语义上去掉 `version` 后深度相等，且两个 version 恰是
//       期望的那两个。
// ⚠ 诚实边界：npm 在 `pack` 时会**重排 package.json 的缩进**（把 `repository: { … }`
// 展开成多行），所以那一个成员不是逐字节相等。判据是 JSON 语义等值，不是字节等值；
// `05-UAT-EVIDENCE.md` 判据段 5 逐字记了这条，别把它读成「两个 tarball 字节相同」。
const assertOnlyVersionDiffers = (firstTgz, secondTgz, work, v1, v2) => {
  const la = tarMembers(firstTgz)
  const lb = tarMembers(secondTgz)
  assert.deepEqual(lb, la, `second tarball is not single-version-different: the member list differs (${la.length} vs ${lb.length} members) — the criterion would be measuring two variables instead of one`)

  const a = join(work, 'cmp-a')
  const b = join(work, 'cmp-b')
  mkdirSync(a, { recursive: true })
  mkdirSync(b, { recursive: true })
  for (const [tgz, dest] of [[firstTgz, a], [secondTgz, b]]) {
    const r = spawnSync('tar', ['-xzf', tgz, '-C', dest], { encoding: 'utf8' })
    assert.equal(r.status, 0, `tar -xzf failed for ${tgz}: ${out(r)}`)
  }
  const A = snapshotDir(join(a, 'package'))
  const B = snapshotDir(join(b, 'package'))
  assert.deepEqual([...B.keys()].sort(), [...A.keys()].sort(), 'second tarball is not single-version-different: the file set differs even though the member list matched')
  const differing = [...A.keys()].filter((k) => !A.get(k).equals(B.get(k)))
  assert.deepEqual(
    differing,
    ['package.json'],
    `second tarball is not single-version-different: ${differing.length} member(s) differ beyond package.json (${differing.slice(0, 5).join(', ')}) — the criterion would be measuring more than the version string`,
  )
  const ja = JSON.parse(A.get('package.json').toString('utf8'))
  const jb = JSON.parse(B.get('package.json').toString('utf8'))
  assert.equal(ja.version, v1, `source tarball version is ${ja.version}, expected ${v1}`)
  assert.equal(jb.version, v2, `re-fabricated tarball version is ${jb.version}, expected ${v2}`)
  delete ja.version
  delete jb.version
  assert.equal(
    JSON.stringify(jb),
    JSON.stringify(ja),
    'second tarball is not single-version-different: package.json differs beyond the version string (JSON-semantic compare; npm re-indents the file on pack, so formatting alone is expected and allowed)',
  )
}

// 从已打好的字节复刻第二份 tarball（只改 `package.json` 的 `version`）。
const fabricateTarballWithVersion = (srcTgz, work, fromVersion, toVersion) => {
  const x = join(work, 'repack')
  mkdirSync(x, { recursive: true })
  const r = spawnSync('tar', ['-xzf', srcTgz, '-C', x], { encoding: 'utf8' })
  assert.equal(r.status, 0, `could not unpack ${srcTgz} for the re-fabrication: ${out(r)}`)
  const pkgFile = join(x, 'package', 'package.json')
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
  assert.equal(pkg.version, fromVersion, `source tarball version is ${pkg.version}, expected ${fromVersion} — refusing to re-fabricate from an unexpected input`)
  pkg.version = toVersion
  writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
  const dest = join(work, 'repacked')
  mkdirSync(dest, { recursive: true })
  const pk = spawnSync('npm', ['pack', '--ignore-scripts', '--pack-destination', dest], { cwd: join(x, 'package'), encoding: 'utf8' })
  assert.equal(pk.status, 0, `npm pack --ignore-scripts of the re-fabricated tree exited ${pk.status}: ${out(pk)}`)
  const made = readdirSync(dest).filter((f) => f.endsWith('.tgz'))
  assert.equal(made.length, 1, `expected exactly 1 tarball from npm pack, found ${made.length}: ${made.join(', ')}`)
  return join(dest, made[0])
}

// ═════════════════════════════════════════════════════════════════════════════
// ⑥ UAT-05 升级 / 回滚 —— **同一条命令换版本号**
//   装 .dsh022 → 装 .dsh021 → 装回 .dsh022。每一步都断言三件事：profile 内
//   `node_modules/dsh-gsd/package.json` 的 `version` 跟着换、`--dump-config` 的
//   `gsd` / `gsd-hooks-bridge` 两 row 仍各恰 1 行、最后一步之后会话谓词仍然成立。
//   两个 tarball 只有版本串不同（见 `assertOnlyVersionDiffers`）⇒ 这条判据证的是
//   「换版本号这条命令的机制」，不是 registry 上的升级历史。
// ═════════════════════════════════════════════════════════════════════════════
test('⑥ UAT-05 升级/回滚：同一条 plugin add 换版本号（.dsh022 ↔ .dsh021）', { timeout: 900000 }, (t) => {
  const missing = missingPrereqs()
  if (missing.length) {
    t.skip(`live UAT requires: ${missing.join(' | ')}`)
    return
  }
  const { tgz } = resolveTgz()
  const home = mkdtempSync(join(UAT_TMP, 'dsh-uat-'))
  const work = mkdtempSync(join(UAT_TMP, 'uat05-tgz-'))
  const P = 'probe6'
  const V1 = '1.20.1-1.dsh022'
  const V2 = '1.20.1-1.dsh021'
  let ok = false
  try {
    const tgz2 = fabricateTarballWithVersion(tgz, work, V1, V2)
    assertOnlyVersionDiffers(tgz, tgz2, work, V1, V2)

    createProfile('headless', P, home)
    const installedVersion = () => JSON.parse(readFileSync(join(home, 'profiles', P, 'node_modules', 'dsh-gsd', 'package.json'), 'utf8')).version
    const dumpCounts = (label) => {
      const d = runDsh(['--profile', P, '--dump-config'], { home, timeout: 180000 })
      assert.equal(d.status, 0, `${label}: --dump-config exited ${d.status} after the version swap: ${out(d)}`)
      const text = d.stdout || ''
      return { lines: text.split('\n').filter(Boolean).length, gsd: rowCount(text, 'gsd'), bridge: rowCount(text, 'gsd-hooks-bridge') }
    }
    const swapTo = (path, expected, label) => {
      const add = runDsh(['plugin', '--profile', P, 'add', path], { home })
      assert.equal(add.status, 0, `${label}: dsh plugin add exited ${add.status}: ${out(add)}`)
      const got = installedVersion()
      assert.equal(
        got,
        expected,
        `version did not change after swap (${label}) — the same command pointed at a different tarball must land that tarball's version; got ${got}, want ${expected}`,
      )
      const counts = dumpCounts(label)
      assert.equal(counts.gsd, 1, `rows disappeared after swap (${label}): gsd=${counts.gsd}, gsd-hooks-bridge=${counts.bridge}. The plugin must stay composed across a version-only swap`)
      assert.equal(counts.bridge, 1, `rows disappeared after swap (${label}): gsd=${counts.gsd}, gsd-hooks-bridge=${counts.bridge}. The hooks bridge must stay composed across a version-only swap`)
      return counts
    }

    const installed = swapTo(tgz, V1, 'install .dsh022')
    const downgraded = swapTo(tgz2, V2, 'swap to .dsh021')
    const rolledBack = swapTo(tgz, V1, 'roll back to .dsh022')

    // 回滚之后会话谓词仍成立（换版本不能把 profile 弄成「装上了但起不来」）。
    const before = new Set(sessionFiles(home))
    const run = runDsh(['--profile', P, '--json', '--approval-policy', 'never', 'reply with the word ROLLBACK'], { home, timeout: 600000 })
    assert.equal(run.status, 0, `session after the version swap exited ${run.status}: ${out(run)}`)
    const fresh = sessionFiles(home).filter((f) => !before.has(f))
    assert.equal(fresh.length, 1, `expected exactly 1 new session record after the rollback session, found ${fresh.length}: ${fresh.join(', ')}`)
    let predicate
    try {
      predicate = assertSessionSucceeded(fresh[0])
    } catch (e) {
      assert.fail(`session predicate failed after swap — the version swap left the profile installed but unable to complete a turn: ${e.message}`)
    }

    console.log(
      `[uat-harness] ⑥ UAT-05: .dsh022→dump ${installed.lines} lines (gsd=${installed.gsd}, bridge=${installed.bridge}) | ` +
        `.dsh021→dump ${downgraded.lines} lines (gsd=${downgraded.gsd}, bridge=${downgraded.bridge}) | ` +
        `rollback .dsh022→dump ${rolledBack.lines} lines (gsd=${rolledBack.gsd}, bridge=${rolledBack.bridge}) | ` +
        `session turnEnd=${predicate.turnEndCount} assistant=${predicate.assistantCount}`,
    )
    ok = true
  } finally {
    rmSync(work, { recursive: true, force: true })
    if (ok) {
      rmSync(home, { recursive: true, force: true })
    } else {
      console.error(`[uat-harness] kept failing home for forensics: ${home}`)
    }
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// ⑦ UAT-06 —— 三点启动开销（事件时间戳，不是墙钟）+ 技能 front-matter 的启动读取
//
//   **测量点：`turn/start.time − session.createdAt`**，两个值都由 DSH 自己以毫秒写进
//   `session.v4.jsonl.zstd`，所以数字不依赖秒表、不依赖 shell 启动、**也不含模型往返**。
//   墙钟被一并记录，但它只作「LLM 主导、不可用作开销」的反例：同一台机器上它逐轮漂移
//   以秒计（RESEARCH §Q5 实测 2 386–5 113 ms），拿它当开销等于在量模型延迟。
//
//   Setup 是**成对**的：同一个 `DSH_HOME`、同一个 `--from-default-profile headless`
//   模板造两个 profile（`base` 无插件 / `p5` 有插件），交替各跑 3 轮。这样只差
//   `plugin add` 一个变量。
//
//   **技能 watch 不在这里，也测不了**：一次性会话每次都是新进程，启动时重读技能目录，
//   所以「watch 延迟」对一次性 harness 结构上不适用；watcher 的行为只在长驻 `web`
//   进程里可观察，而数 fsevents 需要 root。本用例能测的只是**启动时读取**——见第 2 段。
// ═════════════════════════════════════════════════════════════════════════════
test('⑦ UAT-06 三点启动开销（事件时间戳）+ 技能 front-matter 的启动读取（不是 watch）', { timeout: 1500000 }, (t) => {
  const missing = missingPrereqs()
  if (missing.length) {
    t.skip(`live UAT requires: ${missing.join(' | ')}`)
    return
  }
  const { tgz } = resolveTgz()
  const home = mkdtempSync(join(UAT_TMP, 'dsh-uat-'))
  const P_BASE = 'base'
  const P_PLUGIN = 'p5'
  let ok = false
  try {
    createProfile('headless', P_BASE, home)
    createProfile('headless', P_PLUGIN, home)
    installPlugin(P_PLUGIN, tgz, home)

    // 一轮 = 一次性会话 → 会话谓词 → 从**这一次新建**的记录里取两个时间戳。
    const trial = (profile, label) => {
      const before = new Set(sessionFiles(home))
      const t0 = Date.now()
      const r = runDsh(['--profile', profile, '--json', '--approval-policy', 'never', 'reply with the word UAT'], { home, timeout: 600000 })
      const wall = Date.now() - t0
      assert.equal(r.status, 0, `${label}: one-shot exited ${r.status}: ${out(r)}`)
      const fresh = sessionFiles(home).filter((f) => !before.has(f))
      assert.equal(fresh.length, 1, `${label}: expected exactly 1 new session record, found ${fresh.length}: ${fresh.join(', ')}`)
      try {
        assertSessionSucceeded(fresh[0])
      } catch (e) {
        assert.fail(`session predicate failed on a trial (${label}) — a boot-cost number from a turn that did not finish is not a measurement: ${e.message}`)
      }
      const events = readSession(fresh[0])
      const head = events.find((e) => e && e.type === 'session')
      assert.ok(head && Number.isFinite(head.createdAt), `${label}: the session header carries no numeric createdAt — the measurement point is gone`)
      const start = events.find((e) => e && e.type === 'turn/start')
      assert.ok(start && Number.isFinite(start.time), `${label}: no turn/start event carrying a numeric time`)
      const delta = start.time - head.createdAt
      assert.ok(
        Number.isInteger(delta) && delta > 0,
        `non-positive delta (${delta} ms) in ${label} — turn/start must come after session.createdAt; if it does not, this is reading the wrong event`,
      )
      return { delta, wall }
    }

    // 交替 3 轮（base, p5）× 3。
    const baseTrials = []
    const pluginTrials = []
    for (let i = 0; i < 3; i++) {
      baseTrials.push(trial(P_BASE, `base trial ${i + 1}`))
      pluginTrials.push(trial(P_PLUGIN, `p5 trial ${i + 1}`))
    }
    const median = (xs) => {
      const s = [...xs].sort((a, b) => a - b)
      const m = s.length >> 1
      return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
    }
    const baseMedian = median(baseTrials.map((x) => x.delta))
    const pluginMedian = median(pluginTrials.map((x) => x.delta))
    const segment = pluginMedian - baseMedian
    assert.ok(
      pluginMedian > baseMedian,
      `plugin adds no measurable boot cost — median(p5)=${pluginMedian} ms is not greater than median(base)=${baseMedian} ms ` +
        `(base=${baseTrials.map((x) => x.delta).join('/')}, p5=${pluginTrials.map((x) => x.delta).join('/')}). ` +
        `This contradicts the RESEARCH §Q5 baseline (10 ms vs 340 ms); re-measure before weakening the claim`,
    )

    // ── 技能目录的「启动读取」判据（**不是** watch）
    //   必须改 front-matter 的 `description`：正文不会进模型上下文，改正文测不出任何
    //    东西（RESEARCH §Q5 用正文 marker 得到 0 命中的那次实测修正）。
    const SKILL = join(home, 'profiles', P_PLUGIN, 'node_modules', 'dsh-gsd', 'skills', 'gsd-help', 'SKILL.md')
    assert.ok(existsSync(SKILL), `${SKILL} missing — the installed package must carry skills/gsd-help/SKILL.md for the boot-read probe`)
    const token = `UATBOOTREAD-${randomBytes(4).toString('hex')}`
    const skillLines = readFileSync(SKILL, 'utf8').split('\n')
    const fmStart = skillLines.findIndex((l) => l.trim() === '---')
    const fmEnd = skillLines.findIndex((l, i) => i > fmStart && l.trim() === '---')
    assert.ok(fmStart >= 0 && fmEnd > fmStart, `${SKILL} has no YAML front matter — a body edit would prove nothing, so the probe has nowhere to land`)
    const descIdx = skillLines.findIndex((l, i) => i > fmStart && i < fmEnd && /^description:/.test(l))
    assert.ok(descIdx >= 0, `${SKILL}'s front matter has no description: line — this probe must mutate the DESCRIPTION, not the body: the body never reaches the model context`)
    const originalDesc = skillLines[descIdx]
    skillLines[descIdx] = `description: ${token} phase-05 UAT boot-read probe (front-matter description replaced inside a throwaway profile)`
    writeFileSync(SKILL, skillLines.join('\n'))

    const bootBefore = new Set(sessionFiles(home))
    const bootRun = runDsh(['--profile', P_PLUGIN, '--json', '--approval-policy', 'never', 'reply with the word SKILLREAD'], { home, timeout: 600000 })
    assert.equal(bootRun.status, 0, `the boot-read probe session exited ${bootRun.status}: ${out(bootRun)}`)
    const bootFresh = sessionFiles(home).filter((f) => !bootBefore.has(f))
    assert.equal(bootFresh.length, 1, `expected exactly 1 new session record for the boot-read probe, found ${bootFresh.length}: ${bootFresh.join(', ')}`)
    const bootText = sessionText(bootFresh[0])
    const hits = bootText.split(token).length - 1
    // home 反正要删，但恢复现场能让失败时可读。
    skillLines[descIdx] = originalDesc
    writeFileSync(SKILL, skillLines.join('\n'))
    assert.ok(
      hits >= 1,
      `front-matter description token never reached the session (${hits} hits) — this probe measures the BOOT-TIME read, not the watcher: ` +
        `absence means either the body was edited instead of the description, or the skill came from a different profile/home`,
    )

    console.log(
      `[uat-harness] ⑦ UAT-06: base deltas=${baseTrials.map((x) => x.delta).join('/')} ms (median ${baseMedian}) | ` +
        `p5 deltas=${pluginTrials.map((x) => x.delta).join('/')} ms (median ${pluginMedian}) | plugin segment ≈ ${segment} ms | ` +
        `wall (NOT an overhead figure — LLM-dominated) base=${baseTrials.map((x) => x.wall).join('/')} ms p5=${pluginTrials.map((x) => x.wall).join('/')} ms | ` +
        `boot-read token hits=${hits}`,
    )
    ok = true
  } finally {
    if (ok) {
      rmSync(home, { recursive: true, force: true })
    } else {
      console.error(`[uat-harness] kept failing home for forensics: ${home}`)
    }
  }
})
