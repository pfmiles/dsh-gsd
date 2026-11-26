---
phase: 05-uat-1-0
reviewed: 2026-11-26T07:43:26Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - .github/workflows/compat-matrix.yml
  - BUILD.md
  - CHANGELOG.md
  - README.md
  - build.mjs
  - build/assets/ui-frontend-evidence.cjs
  - package.json
  - tests/build-smoke.test.mjs
  - tests/docs-consistency.test.mjs
  - tests/fixtures/injection-sample.md
  - tests/uat-harness.test.mjs
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
  necessity: 0
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-11-26T07:43:26Z
**Depth:** standard
**Files Reviewed:** 11（`bfb5f5e..HEAD` 的非 `.planning` 变动，+1777/−14）
**Status:** issues_found

## Summary

Phase 5 交付的是**判据**而不是运行时代码：一个 1188 行的 live UAT harness、四条文档/清单守卫（⑥/⑬ 为改写，⑮/⑯ 为新增）、一个构建期覆盖件与拷贝步（D-10-5）、以及发布态和 `--test-concurrency=1` 的清单/CI 改动。因此本轮按项目自己的标准审：**一条不能失败、或从不运行的判据比没有判据更糟**。0 Critical。

**Scope 说明。** `git diff --name-status bfb5f5e..HEAD -- . ':(exclude).planning'` 实测 **11 路径**，比任务说明里列的 9 条多两条：`tests/build-smoke.test.mjs`（+61，⑨ D-10-5 断言）与 `tests/fixtures/injection-sample.md`（+23，② 的 payload）。两者都按源码审了。

`check evaluation-scope --phase 05` 只返回 **5** 个文件 / 4 个 task commit（全部来自 05-01）。原因是 05-02 的 `## Task Commits` 写成散文编号列表而不是 resolver 读的表格行（`05-02-SUMMARY.md:169-181`），05-03/05-04 同理 ⇒ union 漏掉 6 条路径。这是 planning 产物的格式问题，不记为源码 finding，但它意味着**只看 resolver 的 scope 会漏掉本 phase 一半的交付物**（`build.mjs`、canonical 覆盖件、`build-smoke` 的 ⑨ 全在其中）。本轮按完整 diff 审。

**实跑过的判据（不是读代码得出的结论）：**

- `node --test` 六个非 build-smoke 文件：**45 tests / 38 pass / 7 skip / 0 fail**。7 条 skip 全是 live 用例，skip 理由逐条列出缺项。
- 全部 `tests/*.test.mjs` 的顶层 `test(` 行数合计 **47**，与 `BUILD.md:16` 的「预期 47」「47/47」一致 ⇒ ⑯ 在 HEAD 上自洽。
- ①② 在**一次性**环境里实跑通过（2/2，1.26 s）——见 WR-01，这条实测同时是那条 finding 的证据。
- D-10-5 的覆盖件与上游 `@opengsd/gsd-core@1.20.1`（`npm pack` 到 `/tmp` 解包）逐行 diff：**只多文件头注释 + `SKIP_DIRS` 里的 `.gsd-build-tmp` 一行**，没有夹带上游改动；构建产物 `gsd-core/bin/lib/ui-frontend-evidence.cjs` 与覆盖件**字节相同**（14223 = 14223），⑨ 的核心断言（存在性 / 与 canonical 字节等值 / `SKIP_DIRS` 成员行恰 1，锚点 L127、闭包 L141）在当前树上逐条复算成立 ⇒ 该模块确实被 `gsd-core/bin/lib/gate-ui-plan.cjs:20` 与 `gate-ui-safety.cjs:24` require，补丁不是写进一个没人加载的文件。
- `build.mjs` 新增的 cp 落在 ⑤（capture）之后、⑥（rewrite）之前，与注释一致；未递增 `counters.copied`，因此 `copied 76 trees`（`tests/build-smoke.test.mjs` ②）不会被撞红。
- `⑮` 的三处计数（`package.json` ×2 + workflow ×1）与 `⑯` 的 47 都实跑通过；两者在 `.build-cache/red-05-0{1,2}-task{2,3}.tap` 里有**真实红过的记录**（`not ok 15` / `not ok 16`），不是天生绿的断言。
- ① 的 `FAIL_OPEN_LINE` 守卫落在 stderr 是对的：`gsd-validate-commit.sh` 三条 fail-open 文案都以 `>&2` 收尾（`:111`、`:159`、`:195`），不是一句写在错误流上的死守卫。

**没能执行的（如实列出）：** live 用例 ③④⑤⑥⑦ 需要真实 `DEEPSEEK_API_KEY`，本会话没有，故只做了静态审 + 依赖它们的公共件（`missingPrereqs`、`sessionFiles`、`assertSessionSucceeded`、`rowCount`、`assertOnlyVersionDiffers`）的逐行核验；`build-smoke` 的「真实构建」用例没有执行（它先 `rmSync(hooks/dsh-gsd-suite/run.cjs)` 再整树重建，属破坏性操作，且会把本轮的 ①② 证据删掉），只核验了它断言的产物在当前树上已成立；`npm publish` 的 prerelease-tag 行为（`publishConfig.tag` 的理由）未实测，属无法在 review 中验证的声明。

## Warnings

### WR-01: ①② 的 skip 门比用例实际需要宽 —— 凭据 / `zstd` / tarball 与两条 hook 用例无关，而它们因此在 `npm test` 与 CI 里永不执行

**File:** `tests/uat-harness.test.mjs:79-92`（`missingPrereqs`），调用点 `:750-754`（①）与 `:841-845`（②）；被评估的既定决策在 `:39-41`。

**Issue:** `missingPrereqs()` 一次要求五件事：`DSH_UAT_LIVE=1`、`DEEPSEEK_API_KEY`、`dsh` 可跑、`zstd` 可跑、`/tmp/uat-tgz` 下**恰好一个** tarball（或 `DSH_UAT_TGZ` 指向存在文件）。①② 一条都不用：它们的用例体只 `spawnSync('node', [HOOK_WRAPPER, …])` 喂合成 payload，从不调用 `runDsh()` / `sessionText()` / `readSession()` / `resolveTgz()`，也不需要 tarball（① 的 `.planning/config.json` 是 `mkdtemp` 出来的，② 的 fixture 在仓内）。用例自己的文件头（`:723-726`）与 `05-UAT-EVIDENCE.md:110` 都明说「两条都**不起** `dsh` 会话」。

**我实跑了它，不是在读代码：**

```bash
$ DSH_UAT_LIVE=1 DEEPSEEK_API_KEY=dummy DSH_UAT_TGZ=$PWD/package.json \
    node --test --test-name-pattern='UAT-04' tests/uat-harness.test.mjs
[uat-harness] ① commit 三段对照: opt-in+nonconforming=exit 2/block:CONVENTIONAL_COMMITS_VIOLATION | opt-in+conforming=exit 0/no-block | no-opt-in+nonconforming=exit 0/no-block | repo hooks.community=absent
[uat-harness] ② injection: severity=HIGH findings=3 INJECTION-PATTERN=3 decision=(none)
✔ ① UAT-04 commit 校验三段对照：opt-in 拦 / opt-in 放 / 未 opt-in 放 (978.798708ms)
✔ ② UAT-04 injection 扫描落日志：fixture → advisory + INJECTION-PATTERN，不 block (218.829541ms)
ℹ tests 2 / pass 2 / fail 0 / skipped 0
```

凭据是假的、`DSH_UAT_TGZ` 指的是一份 `package.json`（不是 tarball），两条照样 2/2 绿。同一棵树上、不设 live 环境跑那六个非 build-smoke 套件：**45 tests / 38 pass / 7 skip / 0 fail**，两条都在 skip 之列。

**对 `:39-41` 那条既定决策的判断（分开两部分看，不要整块接受或整块否掉）：**

- **可接受的一半**：「两条 hook 用例的证据只认一次 live 跑，否则『无 live 环境 ⇒ 全 skip ⇒ ℹ fail 0』会被读成 UAT-04 通过」。这个反复绿通道是真的，用 `DSH_UAT_LIVE` 做 opt-in 是对的，不该取消。
- **不可接受的一半**：把 opt-in 开关与**互不相干的三个前置**绑在一起。后果是可观测的：(a) `npm test` 与 `.github/workflows/compat-matrix.yml:56` 都没设 `DSH_UAT_LIVE`，所以 UAT-04 的两条判据**在任何自动化路径上都不会执行**，全靠 05-UAT 那一次手工跑留下的日志；(b) `/tmp/uat-tgz` 里多出第二个 tarball（重建一次就会，`resolveTgz()` 要求**恰好一个**）或当次 shell 没导出 key，UAT-04 的证据会**无声关闭**，而 skip 理由里写的却是「缺少 DEEPSEEK_API_KEY」这种与 hook 判定毫无关系的话；(c) 一台只想验 hook 回归的机器必须先去造 tarball、装凭据才能跑本地 hook 判定。

**Fix:** 拆成两个门，`DSH_UAT_LIVE` 这一半保留：

```js
// ①② 用：只认 opt-in 开关 + 构建产物在位；hooks/ 是 gitignore 的构建产物（.gitignore:6），
// 缺它应该是「带理由的 skip」，不是一条要 readme 教人 build 的红。
const hookPrereqs = () => {
  const missing = []
  if (process.env.DSH_UAT_LIVE !== '1') missing.push('DSH_UAT_LIVE is not 1 (hook cases are opt-in evidence, same switch as the live ones)')
  for (const [p, why] of [[HOOK_WRAPPER, 'the stdio adapter'], [COMMIT_HOOK, 'the commit validator'], [INJECTION_HOOK, 'the injection scanner']]) {
    if (!existsSync(p)) missing.push(`${p} missing (${why}) — run \`node build.mjs\``)
  }
  return missing
}
```

并把 ①② 顶端现成的 `assert.ok(existsSync(p), …)` 前置（`:755-760`、`:846-852`）降级为上面这条 skip 理由（否则一旦 ①② 真的开始跑，`npm test` 在冷克隆上会红，而不是 skip——那正是当前宽门掩盖的第二个问题）。`livePrereqs()` 继续只服务 ③④⑤⑥⑦。

**根因不在用例，在门的形状**：一个前置列表被两个需求完全不同的用例组共用，任何一侧新增前置都会静默扩大另一侧的 skip 面。这条 finding 的收益是把「UAT-04 的自动化证据在 CI 里为零」变成可修的事实。

### WR-02: `BUILD.md:110-111` 仍把 prepack / test 写成没有 `--test-concurrency=1` 的形态 —— 与本 phase 改过的 `package.json` 直接矛盾，且 ⑮ 按设计不覆盖它

**File:** `BUILD.md:110-111`（`package.json:49-50` 是新的真值；`BUILD.md:16` 是本 phase 更新过的计数行）。

**Issue:** `package.json` 的 `prepack` / `test` 已经带上 `--test-concurrency=1`（本 phase 的改动），`BUILD.md:16` 也写明「预期 47（tests 总数…）」，但同一份文档 100 行之后仍写着：

```
$ sed -n '110,111p' BUILD.md
- **prepack**（package.json 实际契约）：`node build.mjs && node --test tests/*.test.mjs`——gates 内嵌 build。
- **test**（每波可重跑）：`npm test` = `node --test tests/*.test.mjs`。

$ node -e 'const s=require("./package.json").scripts; console.log(s.prepack); console.log(s.test)'
node build.mjs && node --test --test-concurrency=1 tests/*.test.mjs
node --test --test-concurrency=1 tests/*.test.mjs
```

第一行自称「**package.json 实际契约**」，而它已经不是实际契约。⑮ 只扫 `package.json` 的两条 script 与 workflow 的 `run:` 行（三处），故意不扫文档，所以这条漂移是**静默**的：复制这行命令就会回到本 phase 用 ⑮ 修掉的那个并发假红（`build-smoke` 重建 `skills/`/`gsd-core/`/`hooks/` 时，其余套件读到半写的树 ⇒ `gate C: no SKILL.md under skills/gsd-*`），而这会在人手输完 OTP、`npm publish` 跑 `prepack` 的那一刻才炸。

顺带：`tests/docs-consistency.test.mjs:421` 的注释断言「`grep -rn 'node --test'` 全仓恰好这三处、没有第四处」。这句作为 grep 事实是假的——`BUILD.md:110`、`:111` 就是其中两处文本出现（`grep -n 'node --test' BUILD.md` 两条全中）。计数口径（可执行的 3 处）本身没错，但把口径写成一句可被 grep 立刻打脸的「全仓」事实，会让下一个读注释的人以为文档那半已被覆盖。

**Fix:** 两行补上 flag；或者更好，别复述命令，直接指向唯一真值：

```diff
-- **prepack**（package.json 实际契约）：`node build.mjs && node --test tests/*.test.mjs`——gates 内嵌 build。
-- **test**（每波可重跑）：`npm test` = `node --test tests/*.test.mjs`。
+- **prepack**（package.json 实际契约）：`npm run prepack` = `node build.mjs && node --test --test-concurrency=1 tests/*.test.mjs`——gates 内嵌 build，`--test-concurrency=1` 是硬要求（build-smoke 会重建 skills/gsd-core/hooks，并发会让其余套件读到半写的树）。
+- **test**（每波可重跑）：`npm test` = `node --test --test-concurrency=1 tests/*.test.mjs`。
```

## Info

### IN-01: ⑯ 数的是源码 `^test(` 行数，不是 runner 注册数 —— `test.skip(` / `test.todo(` / 嵌套注册会让 `BUILD.md:16` 的计数静默变旧而 ⑯ 仍绿

**File:** `tests/docs-consistency.test.mjs:524`（`match(/^test\(/gm)`），断言在 `:526-532`。

**Issue:** ⑯ 守的是 `BUILD.md:16` 的「tests 总数 / 40 pass / 7 skip」。那行描述的是 **node 的读数**（47 = 40 pass + 7 skip），但守卫数的是**源码里以 `test(` 开头的行**。两者今天相等（47 = 47），可只要新增的用例采用 node:test 的另一种合法写法，runner 的总数会变而 ⑯ 不动——它守护的数字就静默过期了，正是 ⑯ 自己文件头（`:488-489`）说要防的「静默变旧」。

**证明（两行文件，`node --test` 与守卫的正则各数一次）：**

```bash
$ cat > /tmp/skipdemo.test.mjs <<'EOF'
import { test } from 'node:test'
test('a', () => {})
test.skip('b', () => {})
EOF
$ node --test /tmp/skipdemo.test.mjs 2>&1 | grep -E '^ℹ (tests|pass|skipped)'
ℹ tests 2
ℹ pass 1
ℹ skipped 1
$ node -e 'const s=require("fs").readFileSync("/tmp/skipdemo.test.mjs","utf8"); console.log("^test( =",(s.match(/^test\(/gm)||[]).length)'
^test( = 1
```

一条 `test.skip(` 让 runner 记 2 条、守卫只记 1 条。同样的缺口对 `test.todo(`、以及对写成 `describe(...)` 内缩进的 `test(` 成立（后者的行首是空格，`^test\(` 不匹配，而 node 照常注册）。

**严重性判断：Info，不是 Warning。** 守卫本身是**可失败**的（`.build-cache/red-05-02-task3.tap` 里 `not ok 16` 是真实先红），常规改法（在文件顶层加 `test('…')`）它抓得住；文件头也明说了口径是「文件文本，不是运行期注册数」。缺口只落在「换一种注册写法」这条合法编辑上，而当前仓里 `test.skip(` / `describe(` 的用量为 0（`grep -rn '^test\.skip(\|^test\.todo(\|^describe(' tests/*.test.mjs` 无命中）。

**Fix:** 把正则放宽到 node:test 的注册形态并明说口径，或直接断 runner 读数：

```js
// 至少：test( 以及它的 skip/todo/only 形态
const n = (read(`tests/${f}`).match(/^test(?:\.(?:skip|todo|only))?\(/gm) || []).length
```

或者让 `BUILD.md:16` 改口径为「顶层 `test(` 行数 47」——但那样它就不再是 `npm test` 的预期读数，不如让守卫去追 runner（`node --test --test-reporter=tap` 的 `# tests`）。

### IN-02: `DSH_UAT_TGZ` 指向不存在的路径时，skip 理由说「unset」，并报告一个从未被查询过的目录

**File:** `tests/uat-harness.test.mjs:90`（`missing.push(...)`）与 `:94-105`（`resolveTgz`）。

**Issue:** `resolveTgz()` 在 `DSH_UAT_TGZ` 有值时只 `existsSync(p)` 一次，失败就返回 `{ tgz: null, candidates: [] }`，**从不读** `/tmp/uat-tgz`。而 `missingPrereqs()` 的理由文案把两件事硬编码成一句「`DSH_UAT_TGZ` unset and `/tmp/uat-tgz` resolved 0 candidate(s) [none]`」。于是 `DSH_UAT_TGZ` **设了但写错**的场景会被报成「没设」，且候选数说的是一个根本没被读过、实际上有 1 个 tarball 的目录。本文件的既定要求是「`t.skip` 的理由必须是可诊断的具体项」（`:78`）；这条理由会把排障指向错误的目录。

**证明：**

```bash
$ ls /tmp/uat-tgz
dsh-gsd-1.20.1-1.dsh022.tgz
$ DSH_UAT_LIVE=1 DEEPSEEK_API_KEY=dummy DSH_UAT_TGZ=/tmp/definitely-not-there.tgz \
    node --test --test-name-pattern='③' tests/uat-harness.test.mjs 2>&1 | grep '﹣'
﹣ ③ UAT-01 / INST-01：… # live UAT requires: no single tarball: DSH_UAT_TGZ unset and /tmp/uat-tgz resolved 0 candidate(s) [none]
```

三处都不对：变量是设了的、`/tmp/uat-tgz` 有 1 个候选、真正缺的是 `/tmp/definitely-not-there.tgz`。

**Fix:** 让 `resolveTgz()` 返回 `source: 'env' | 'dir'`（以及 env 路径本身），理由文案按 source 分支：

```js
if (!tgz) {
  missing.push(process.env.DSH_UAT_TGZ
    ? `DSH_UAT_TGZ does not exist: ${process.env.DSH_UAT_TGZ}`
    : `no single tarball: ${TGZ_DIR} resolved ${candidates.length} candidate(s) [${candidates.join(', ') || 'none'}] (need exactly 1, or set DSH_UAT_TGZ)`)
}
```

---

_Reviewed: 2026-11-26T07:43:26Z_
_Reviewer: DeepSeek Harness (gsd-code-reviewer)_
_Depth: standard_