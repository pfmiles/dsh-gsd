---
phase: 03-github-npm-dshmarket
reviewed: 2026-11-12T13:58:47Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - package.json
  - build/assets/pins.json
  - .github/workflows/compat-matrix.yml
  - tests/compat-matrix.test.mjs
  - tests/docs-consistency.test.mjs
  - tests/pack-contents.test.mjs
  - README.md
  - BUILD.md
  - CHANGELOG.md
  - docs/dshmarket/pfmiles__dsh-gsd.yml
  - docs/dshmarket/README.md
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-11-12T13:58:47Z
**Depth:** standard（路径覆盖解析器：`{"ok":true,"depth":"standard","source":"config","fileCount":11}`）
**Files Reviewed:** 11（`.planning/.gitignore` 按 D-03 不算源码 scope，只作上下文核对）
**Status:** issues_found

## Summary

Phase 3 的源码面只有 12 个跟踪文件（11 个进 scope + `.planning/.gitignore`），主体是「元数据/文档/CI 形态 + 四条新守卫测试」。逐文件读完 diff 后：**声明面（peer/pins 等值、`publishConfig.registry` 尾斜杠、CHANGELOG 版本等值、dshmarket 四键、`run:` 仍 4、`permissions` 最小化）全部与源码一致，没有发现问题**；问题集中在两处：

1. **一条出在受审 scope 之外、但会阻断 Phase 5 发布的既有缺陷（CR-01）**：`index.js` 把 skills 根目录解析到了包的**上一级**，装成后技能 provider 指向不存在的目录。
2. **三条新守卫的半盲区（WR-01..03）**：都不属于「永远为真」的空断言，但都存在一个**真实且容易发生的回归方向**恰好落在断言之外，且我都用内存变异实测确认过「变异后仍绿」。

另记两条 Info：⑧ 的计数会因注释误红（IN-01），以及 CI 绿跑只覆盖到 `20e20c0`、五条后续提交（含全部新守卫）从未在 CI 执行（IN-02，仓状态面）。

**复跑证据（严格串行，单进程）：**

| 命令 | 结果 |
|---|---|
| `node --test --test-concurrency=1 tests/*.test.mjs` | `tests 36 / pass 36 / fail 0 / cancelled 0 / skipped 0`，6906 ms |
| `node build/lib/check-pins.mjs --offline` | `pins: all consistent (line dsh022)`，exit 0 |
| `actionlint .github/workflows/compat-matrix.yml` | exit 0，零输出 |

审查方法：11 个文件的完整内容 + `d4adaf5..HEAD` 的逐提交 diff；守卫测试的 fail-open 检查用**内存字符串变异**（不落盘、不改源）复算断言；未修改任何源文件，唯一写入是本文件。

---

## Findings

### CR-01: `index.js` 把 `skills/` 解析到包外一级 —— 装成后技能 provider 指向不存在的目录（Critical，scope 外既有缺陷）

**File:** `index.js:20-21`（phase 3 未触碰；`git log -- index.js` 最后一次改动是 spike `08feebd`）

**Evidence:**

```js
const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir  = join(pluginRoot, 'skills')
```

- `index.js` 就位于**包根**：`package.json:7` `"main": "index.js"`，`files`（`package.json:37-47`）把 `index.js` 与 `skills` 作为同级顶层条目收录，phase 3 记录的 tarball 顶层清单也是 `index.js` 与 `skills` 同级。
- 因此 `dirname(import.meta.url)` 已经是包根，再 `..` 就出了包：本地实测该表达式得到 `/Users/yue.weny/frontWorkspace/gsd-on-dsh/skills`（**不存在**）；正确值 `<repo>/skills` 存在且恰 72 个 `gsd-*`。装进 profile 后同理落到 `<profile>/node_modules/skills`（pnpm 真路径则是 `<...>/node_modules/skills`）。
- 与文件自身的注释矛盾：`index.js:11-12` 写的是 "resolved relative to this package's own directory"。
- `skillsDir` 唯一的消费者是 `index.js:30-35` 的 `FileSystemSkillProvider({ includeDefaultRoots: false, customSkillDirs: [skillsDir] })`。

**Impact:** 该插件自己的 72 个 `gsd-*` 技能注册不到会话技能目录（provider 要么在目录缺失时注册 0 条，要么构造即报错）。这正是 README:30「装好后会话内的 skill 目录会出现 72 个 `gsd-*`」的核心承诺，也是 `/gsd-health` 等命令的来源。

**为什么 36/36 与 boot 判据都没抓到：** phase 3 的「真 tarball boot」只验磁盘与配置行 —— `ls …/node_modules/dsh-gsd/skills | wc -l` = 72（03-01-PLAN:232、03-VALIDATION Manual-Only 第 1 行）+ `--dump-config` 两行；两者都不查会话技能目录。仓库里没有任何测试 import `index.js`（`grep -rn "from '../index.js'" tests/` 为空）。spike 的 GUI 目验发生在装有旧部署的机器上，无法区分技能来自本 provider 还是宿主其它/默认技能根。

**未验证的部分：** 宿主在目录缺失时是抛错还是静默 0 技能（本机无 `@deepseek-ai/dsh-skill-filesystem`，无法执行 provider 构造）。两种失败模式都使该插件核心功能失效，故按 Critical 记。

**Suggested fix:** `const pluginRoot = dirname(fileURLToPath(import.meta.url))`（去掉 `resolve(…, '..')`），并补一条测试断言 `existsSync(join(pluginRoot, 'skills'))`；建议作为 Phase 5 发布前的独立修复，不并入本 phase 的 REVIEW 修复批次。

**Scope note:** 不在 phase-3 diff 内，故不计入本 phase 的执行修复范围；但它是发布就绪面的硬阻断，必须在 npm 首发前解决。

### WR-01: `pack-contents` 白名单守卫只有「排除」方向 —— 从 `files` 删掉任何一个必需品仍全绿

**File:** `tests/pack-contents.test.mjs:41-45`（`ALLOWED_TOP_LEVEL` 只作上界）、`:147-150`（`tops ⊆ ALLOWED`）、`:153-163`（③ 只检查「已列入的条目有内容」）；`tests/docs-consistency.test.mjs:162-163` 只钉 `locale` 与 `icon.svg`

**Evidence:** 把 `scripts` 从 `files` 里删掉后逐条复算：① 仍过（剩余条目都是字面量、非宽泛）；③ 仍过（每个剩余条目都存在）；⑩ 仍过（`locale`/`icon.svg` 还在）；② 的 `tops` 只是变成更小的子集，`unexpected` 依旧为空 → 仍过。`gsd-core`/`skills`/`hooks`/`config` 同理 —— 它们都在 `ALLOWED_TOP_LEVEL` 里，但**没有任何断言要求它们出现在 `files` 里**。这不是假设：`CHANGELOG.md:20` 的 Fixed 条目（`scripts/` 未随包 → 引擎 `MODULE_NOT_FOUND`）就是这一方向的真实回归，而现在唯一的机器证人仍是那份一次性的 `npm pack --dry-run`（958/12 清单）。

**Impact:** 反向漏发（白名单丢条目）在 per-commit 回路里零信号；最坏形态是发布的 tarball 缺 `gsd-core`/`skills`，用户装上一个「空壳插件」，而 36 条测试全绿。

**Suggested fix:** 在该文件追加一条「必需条目」断言（例如 `['index.js','cordis.patch.yml','skills','gsd-core','hooks','config','scripts','locale','icon.svg']` 全部 `files.includes`），或把 `ALLOWED_TOP_LEVEL` 由上界集合改成双向集合等值。

### WR-02: ⑨ 的徽章断言单条正则即可满足 —— 删掉 DSH 徽章或把徽章挪到标题下方都不会红

**File:** `tests/docs-consistency.test.mjs:128-132`（⑨）

**Evidence:** 唯一断言是 `assert.match(readme, /!\[[^\]]*\]\(https:\/\/img\.shields\.io\//)`，许可徽章（`README.md:3`）单独就能满足。内存变异实测：(a) 删除 `README.md:4` 的 `DSH-0.2.2--rc.1` 徽章 → ⑨ **仍通过**；(b) 把两枚徽章移到第一个 `# dsh-gsd` 之后 → ⑨ **仍通过**；（只有把整块徽章删光才会红）。而 03-02-PLAN:198 的落位要求是「两枚徽章、位于 `<!-- generated-by: gsd-doc-writer -->` 与第一个 `# dsh-gsd` 之间」；套件内只有 ⑨，位置/条数一直是「一次性结构门」（03-VALIDATION 的 03-02-02 行亦如此标注）。

**Impact:** 「DSH 行可见性」与「徽章在最顶部」这两个 phase 交付判据，在 per-commit 回路里没有守卫；⑨ 的标题与失败消息（「PUB-04 的许可与 DSH 行可见性」）高于它实际证明的东西。

**Suggested fix:** 在 ⑨ 里按 `readmeZh`/`readmeEn` 之外再加两条：`readme` 必须同时含 `badge/license-MIT` 与 `badge/DSH-` 两条 shields URL；徽章块位置用 `readme.indexOf('# dsh-gsd')` 断言两枚徽章都在其之前。

### WR-03: ⑫ 只数「全文件 2 条」而不按 zh/en 两半各断言 1 条 —— 英文半区丢失仍绿

**File:** `tests/docs-consistency.test.mjs:242-245`（⑫）

**Evidence:** 断言只有 `assert.equal(readmeHits.length, 2)`，没有使用同文件 `:32-33` 已切好的 `readmeZh`/`readmeEn`；失败消息与标题写的却是「zh + en 两半各一」。内存变异实测：删掉英文段的裸名安装行、再在中文段复制一行 → 总数仍是 2，逐字节相等与「无 `dsh-gsd@latest`」两条子断言都通过 → ⑫ **仍绿**（实测分布 zh/en = 2/0）。

**Impact:** 英文半区的 `dsh plugin --profile web add dsh-gsd` 可以无声消失，而 ⑫ 恰是「install 命令逐字一致」的唯一 per-commit 守卫。`docs/dshmarket/README.md` 的 byte 对照也因此只与「中文副本」对齐。

**Suggested fix:** 把计数断言改成按半区：`hits(readmeZh).length === 1 && hits(readmeEn).length === 1`（保留总数 2 与 byte 相等断言）。

### IN-01: ⑧ 的 `matrix.expect` 计数把注释也算进去 —— 一句说明性注释就会误红

**File:** `tests/compat-matrix.test.mjs:165-170`（⑧ 的 (2)）

**Evidence:** `[...y.matchAll(/matrix\.expect/g)].length === 2` 是对**全文件原始子串**计数，注释行同样计入。给 workflow 补一句提到 `matrix.expect` 的说明（行为零变化）→ 计数变 3 → ⑧ 红。反过来，⑧ 的其余部分经复核是 fail-closed 的（门行整行锚定、唯一性、`require.resolve` 与 `exit 2` 都必须落在（门行, 收口 fi）之间，且全局各恰 1 条）——这条只是「误红」方向的维护陷阱，不是漏放。

**Impact:** 后续维护者面对误红最可能的修法是放宽为 `>= 2`，那会把 ⑧ 真正想挡的「第二处未门控用法」一起放掉。

**Suggested fix:** 计数前先剥注释行（例如只统计 `trim()` 后不以 `#` 开头的行），或把「探针调用行必须含 `--expect ${{ matrix.expect }}`」写成独立的结构断言，替代全局计数。

### IN-02: 绿色 CI 只覆盖到 `20e20c0`；HEAD 的 5 条提交（含全部新守卫）从未在 CI 执行；本地 `origin/main` 是陈旧引用

**Evidence:**
- `git ls-remote https://github.com/pfmiles/dsh-gsd.git refs/heads/main` → `20e20c0283f764864474b7d6a2dfd48f22a0c6b9`。
- `git rev-list --count 20e20c0..HEAD` → **5**（`cf13915` / `552bb48` / `d20f875` / `60402b7` / `32665af`），即唯一的绿色 run `43218878911` 没有跑过 ⑧⑪⑫⑬，也没有跑过 `BUILD.md:16` 的 36/36。
- 本地 `git rev-parse origin/main` 仍是 `d3c8e89`（推送走的是显式 HTTPS URL，未更新 tracking ref，见 `03-03-SUMMARY.md`），故 `git status -sb` 报 `ahead 111`；任何以 `origin/main` 为真值的「远端状态」判据都会误判。

**Impact:** 发布就绪的 CI 证据只到 20e20c0。Phase 5 之前需要一次推送 + 复跑，或显式接受「新增守卫仅本地绿」。同时建议 `git fetch origin` 修正 tracking ref，避免后续工作流基于 `origin/main` 得出错误结论。

**归因:** 仓状态/证据面，不是 11 个受审文件的缺陷。

---

## 已核验、未立案（含用户点名的 hunt 项）

| 项 | 结论与证据 |
|---|---|
| workflow 门控语义（hunt 3） | **正确、fail-closed**。`exit 2`（`compat-matrix.yml:46`）是 `run: \|` 脚本里的裸语句，不在子 shell、不在 `\|\| true` 尾部；`\|\| true` 只包在 `RESOLVED="$(…)"` 命令替换内，解析失败时 `RESOLVED` 为空串 → `[ "" != matrix.dsh ]` 成立 → 仍 `exit 2`。GitHub 默认 `bash -e`，非零即步骤红。`run:` 仍 4 个，actionlint exit 0。`install-ok` 独享门控也与实测语义一致（reject 格根解析到 exact peer 占位的 0.2.2-rc.1）。 |
| `publishConfig.registry`（hunt 4） | **正确**：`package.json:53-55` 恰为 `{"registry":"https://registry.npmjs.org/"}`（带尾斜杠），且 ⑬（`docs-consistency.test.mjs:289-293`）以 `deepEqual` 钉住；`private: true` 按 ⑥ 保留到 Phase 5。 |
| `pack-contents` 的 ROOT（hunt 2） | **正确**：`tests/` → `resolve(dirname(url), '..')` = 仓库根；`git show -M` 证实 `tests/{pending-phase-3 => }/pack-contents.test.mjs` 为 100% 相似度重命名，旧目录无 tracked 残留。`walk()` 的 `ENOENT → []` 只影响「不得出现」的否定断言面（文件自述，③ 对五棵构建树有显式例外），不构成「静默退化成子集检查」；真正的缺口是 WR-01 的丢条目方向。 |
| 密钥/凭据（hunt 5） | **干净**：全仓 `git grep` 无 `gh[pousr]_` / `github_pat_` / `AKIA` / `PRIVATE KEY` / `npm_` token；phase-3 提交信息同样零命中；无 tracked `.npmrc`/credential/key 文件；`docs/dshmarket/` 只有公开 URL 与文案；`origin` 为 SSH、无内联凭据。 |
| exact peer vs `engines.dsh` 窗口 | **有意取舍，不立案**：peer 收紧为 exact `0.2.2-rc.1` 而 `engines.dsh` 仍是 `>=0.2.2-rc.1 <0.3.0-0`；`CHANGELOG.md:15` 已写成维护义务（0.2.2-rc.2/0.2.2 转正时必须同步抬 peer），`check-pins` (j) 以严格等值守 manifest⇄pins 同改。 |
| `.planning/.gitignore` | **正确**：`git check-ignore -v .planning/milestone.lock` → `.planning/.gitignore:16:/milestone.lock`；`state.json`/`tmp/`/`milestone.lock` 均未被跟踪。 |

## 未核实

- **dshmarket 目标仓真实 schema**：4 顶层键、`category` 23 类闭集、`slugFor(url)` 命名都只有仓内材料与 ⑪ 的自洽证据；本机离线，未能对照 `awesome-dsh-plugin` 目标仓，故不据此立案。
- **CR-01 的宿主失败模式**：`@deepseek-ai/dsh-skill-filesystem` 未安装，无法执行 `FileSystemSkillProvider` 观察「目录缺失 = 抛错还是 0 技能」。