---
phase: 04-migration-coexistence
reviewed: 2026-11-14T06:45:14Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - BUILD.md
  - README.md
  - docs/MIGRATION.md
  - docs/oldrepo-link/README.md
  - docs/oldrepo-link/pr.md
  - docs/oldrepo-link/snippet.en.md
  - docs/oldrepo-link/snippet.zh.md
  - tests/docs-consistency.test.mjs
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-11-14T06:45:14Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

范围由 `check evaluation-scope --phase-dir .planning/phases/04-migration-coexistence --raw`
现场解析：`status: resolved` / `source: task-commits` / 8 个文件，`outsideUnion` 与
`unreachable` 均为空，`missingOnDisk` 为空。`.planning/**` 按任务约定不审。

本 phase 的实质交付物是 `docs/MIGRATION.md`（584 行，中英两半各 9 个 bash 块，合计 18 个围栏）。
其余 7 个文件是四类改动：入口（README 中英各 +1 行）、计数（BUILD.md 37→38）、一条新守卫（⑭）
与旧仓互链备料（4 个不发布文件）。
因此审查立场是三条：

1. 把 9 个可粘贴块当**会被执行的程序**读（写落到哪个 home、引号、顺序、判据是否真的被命令检查）；
2. 把实测数字当**必须与证据册对账的断言**读，并把能在本机复算的直接复算一遍；
3. 把 zh / en 两半当**同一交付物的两个副本**读——守卫 ⑭ 只断言标题数与"en 半无 CJK"，
   内容级偏差它不会红，只能人读。

**结论：0 Critical / 3 Warning / 4 Info。**

先说已验证干净的三件"最贵的事"：

- **没有会写坏真实 `~/.dsh` 的块。** 9 个块中 5 个写块（步骤 1/2/3/4/5）首行一律
  `export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"`，DSH_HOME 未设或为空即中止；0-A 自建
  `mktemp` 演练场，0-B 显式声明真实 home 并只 `export` 一个变量，步骤 6 动态段自建一次性 home，
  步骤 6 静态段只 `readFileSync`。**没有一处静默回落到默认 home。**
- **没有与 `04-DRILL-EVIDENCE.md` 矛盾的实测数字。** 1.16.0 / 3084 / 3195 / 3587 / 3856 / 72 /
  24→25 / 1877 B / 1255→1243 / 25→24 全部逐项对上；其中 3587 / 3856 / 72 / 5 事件 / 14 matcher /
  `files` 九项我另用工作树与 `config/gsd-hooks.json` 独立复算过（见 §2）。
- **守卫 ⑭ 的围栏跟踪在现存 18 个围栏上是正确的**，且双语切片用"第二个 H1"而不是 `---`——这正是
  它该有的做法（代码块里的 `---` 不会切错位）。断言消息可诊断（`围栏感知计数` 一句直接解释为什么
  naive 计数不对）。

3 条 Warning 都是"正文承诺的判据与命令/证据对不上"，不是风格问题：步骤 1 声明两个面却只给了
一个面的命令；步骤 6 让读者在真实 home 上重跑同一组命令，而该块第 ② 条判据在这种场景下对健康
系统必然为红；① 末尾的示例说明在 zh 半边把"哪些行会变"说错，并与 en 半边、与同一文件 `:27` 的
公式三方矛盾。

## Narrative Findings (AI reviewer)

### WR-01: 步骤 1 声明"两个面"，但块里没有面 1（技能）的任何命令

**File:** `docs/MIGRATION.md:46-61`（en 同构：`:340-355`）

**Issue:** 正文 `:46` 把硬门写成"判据是**两个面**：面 1（技能）与面 2（hooks）…… **两面都要**，
因为两种失败模式不同——残留技能的后果是内容串味"。但紧随其后的块 `:48-61` 只有三项：
`面 2a`（`grep -l 'GSD-DSH-bridge BEGIN'`）、`面 2b`（`grep -c 'gsd-hooks-bridge'`）、
`机器级一面`。**没有任何一行探测 `$DSH_HOME/skills/gsd-*`**。

这条不是措辞问题：`04-CONTEXT.md:41-44` 的 D-03 明确要求"卸载前若探测到任一 profile 仍引用旧
bridge 块**（或仍依赖 `~/.dsh/skills` 下的 gsd-\*）**，runbook 中止"，而本块是 runbook 里唯一
"命中即中止"的位置。面 1 的命令只在**卸载之后**的步骤 5 项 A（`:122`）出现——那时 `--uninstall`
已经跑完，双源已经在场，再测只能记录不能中止。读者按 `:33`（"先执行步骤 1 的逐 profile 裁决"）
操作时，手里缺的恰恰是最危险那一面的探测器，而正文刚承诺过它有。

补充证据（说明这是"文档写法"而不是"演练没做"）：`04-01-PLAN.md:227` 的演练硬门同样只用
`grep -l "GSD-DSH-bridge BEGIN"` 算 `hits`，`04-DRILL-EVIDENCE.md:38` 记录的 `hits=1` 也只来自
bridge 块。所以这个缺失在演练里不会暴露——演练的 home 是新建的，`skills/gsd-*` 是"有"，面 1
必然是命中，没人需要那条命令。

**Fix:** 在步骤 1 的块里补一行（与步骤 5 项 A 同形，但判据相反：这里是"期望 0，非 0 = 命中"），
zh 与 en 各一处：

```bash
# 面 1：旧源技能（期望 0；非 0 = 命中，中止）
ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l
```

若有意把面 1 留给步骤 5（因为它不是 profile 级的：`$DSH_HOME/skills` 是 home 级目录，无法按
profile 裁决），那就把 `:46` 的"两个面"改成"面 2 的两个子面 + 一个机器级面"，并明说面 1 的阴性
对照只能放在步骤 5、D-03 的"仍依赖 `~/.dsh/skills`"一项在本 runbook 里以"卸载前先人工确认没有
profile 还在用旧技能"承担。二者择一，不要让正文与块各说一套。

### WR-02: 步骤 6 的"真实 home 重跑同一组命令"与第 ② 条判据 `H1 > H0` 互斥——健康系统上必红

**File:** `docs/MIGRATION.md:219` 与 `:206`（en：`:513` 与 `:500`；块本体 `:193-215`）

**Issue:** `:219` 的收尾句是"真实 `~/.dsh` 的并存复验要在迁移时（**步骤 4 之后**）用同一组命令
重跑一次"；块首注释 `:194` 又只让读者改第一行（`export DSH_HOME="$HOME/.dsh"`）。但块内第 ② 条
判据是 `:206` 的 `echo "headers $H0 -> $H1"  # ② 期望 H1 > H0`。

按这个指令在真实 home 上执行时：`H0` 是在**步骤 4 已把 `dsh-gsd` 装好之后**取的，所以 `dsh-gsd`
已经在 `dsh.profile.bundles` 里；随后三条 `add` 里对 `dsh-gsd@<version>` 是重复添加（无变化），而
`dsh-deja` / `dshmarket` 若已存在（**本块第一段 `:173-175` 正是从真实 profile 的
`node_modules/dsh-deja/cordis.patch.yml`、`node_modules/dshmarket/cordis.patch.yml` 读它们的
patch 文件，等于预设它们已装**），也是无变化。
于是 `H1 − H0 = 0`，`H1 > H0` 为假——一个完全健康的 home 被判红。

`04-DRILL-EVIDENCE.md:162` 把机制写死了："本轮 `27 = 24 + 3`，恰对应**新装的三个 bundle** 各自
打开一个来源段"。增长量 = 新装 bundle 数，而真实迁移场景里新装数是 0。这个缺陷还是**双向**的：
对"真实 profile 里本来没有 deja/dshmarket"的读者，`H1 = H0 + 2` 会**意外通过**——通过的理由
与判据想证明的东西（`dsh-gsd` 与别的插件同层合成）并不是同一条。也就是说这条判据在目标场景下
既会误红、也会误绿。

**Fix:** 把"演练形态"与"真实迁移形态"的判据分开写，别让同一句话兼任两职。建议真实形态把三条
`add` 换成"确认已在册"，判据改 `H1 >= H0`：

```bash
# 真实形态：三条 bundle 都应在册（不是"再装一遍"）
dsh --profile "$P" --dump-config > /tmp/c-dump.out 2> /tmp/c-dump.err
wc -c < /tmp/c-dump.err                     # ① 期望 0
for p in dsh-gsd dsh-deja dshmarket; do
  grep -qE "^# == .*$p" /tmp/c-dump.out || echo "MISSING layer: $p"   # ② 标签出现
done
# ③④ 不变（row id 各 1、uniq -d 为空）
```

若确实想在真实 home 上保留"增长"判据，就必须把 `H0` 的取法改成"步骤 4 **之前**"，并在正文
写清这一点；否则 `H1 = H0 + 1`（步骤 5 `:145`）与 `H1 > H0`（步骤 6 `:206`）两个口径会在同一份
文档里打架。

### WR-03: ① 的示例说明在 zh 半边把"哪些行会变"说错，并与 en 半边、与 `:27` 的公式三方矛盾

**File:** `docs/MIGRATION.md:228`（en：`:522`；反证见同一文件 `:27`）

**Issue:** zh `:228` 写"换 home 长度或换旧部署版本，**前两行**就变；**后四行**是包内产物，与路径、
版本都无关"。表格 `:232-238` 共 7 行，对照下来两处都错：

1. **"前两行"漏了第 3 行。** 第 3 行是旧 `gsd-new-project/SKILL.md` = 3195 B，而同一文件 `:27`
   给它的公式是 `3195 - 7×(20-L)`——它**随 home 长度变**。`前两行就变` 等于宣称 3195 不随 home
   长度变，与 `:27` 直接冲突。
2. **"后四行是包内产物"错标了第 7 行。** 后四行 = 3587 / 3856 / 72 / `24 → 25`；前三个确是包内
   产物（我复算过：工作树 `skills/gsd-health/SKILL.md` 3587 B、`skills/gsd-new-project/SKILL.md`
   3856 B、`skills/` 72 项），但 `24 → 25` 是**模板 profile 的 dump 属性**，不是任何包内文件，
   说它"是包内产物"会让读者以为它与自己的 profile 无关。

3. **en 半边与 zh 半边不一致。** en `:522` 是 "the first **three** rows move; the last **three**
   rows are in-package artifacts"。en 的两句都对（前三行 = 72 / 3084 / 3195 都会随版本或 home
   长度动；后三行 = 3587 / 3856 / 72 确在包内），只是没交代第 7 行。**守卫 ⑭ 对这类偏差完全
   免疫**——它只数 `## ` 与查 CJK，两种写法都能过。

危害落在这张表唯一的用途上：读者拿它当期望值时，会以为 3195 是固定资产，于是在不同长度的 home
上量到 3188 就怀疑"旧源没死/混源"——而这正是 `:27` 花了整整一段去防的误判（"不要在量到 3081
时改小期望值去凑绿"）。

**Fix:** zh 改成与 en 同构且把第 7 行也归类：

> 换 home 长度或换旧部署版本，**前三行**就变；后三行（3587 / 3856 / 72）是包内产物，与路径、版本
> 都无关；最后一行（`24 → 25`）既不随路径也不随版本变，它随 profile 的 bundle 组合变（见步骤 5）。

en 末尾补一句 "the last row follows the profile's bundle composition, not your home or version"
即可对齐。

### IN-01: 步骤 6 静态块违反文档自己的"每个可粘贴块第一行都是 `export DSH_HOME=`"不变量，且只在仓根可用

**File:** `docs/MIGRATION.md:169`（不变量在 `:14`；en：`:463` / `:308`）

**Issue:** `:14` 给出的安全不变量是"**每个可粘贴块的第一行都是 `export DSH_HOME=`，第二行回显
它**——漏掉这一行，命令就落到你正在用的 home 上"。步骤 6 第一段的围栏首行却是 `node -e '`，既
没有 `export DSH_HOME`，也没有回显（en `:463` 同）。三处后果：

1. 它以 `p.join(process.env.HOME,".dsh","profiles","web")` 硬编码真实 home（`:171`）。在 0-A 的
   演练场里粘贴它，检查的是**真实 home** 里装的第三方插件，而不是演练场——与文档其余部分
   "DSH_HOME 决定一切"的模型相反。
2. `"dsh-gsd":"cordis.patch.yml"` 是**仓根相对路径**（`:172`），只在 `cwd` = 本仓根时成立，
   而 `:166`/`:460` 的正文没有一句要求"从仓根执行"。在别的目录粘贴会直接抛
   `ENOENT … cordis.patch.yml`（至少是响的，不是静默误判）。
3. 该块**预设三者的 `node_modules` 都在**：`dsh-codegraph` / `dsh-deja` / `dshmarket` 任一缺失，
   `fs.readFileSync` 就整体抛错（`:179`），而不是报"该插件的 patch 文件不存在"。对一个没有装
   `@jiangzhenguo/dsh-codegraph` 的真实 home，这一段不是"只证明行级"，而是直接失败。

对照 `04-04-PLAN.md` 的同源块，它开头有 `[ -f package.json ] || { say "FAIL: run from repo root"; exit 1; }`
之类的守卫——文档版把这个显式前提删掉了。

**Fix:** 三条任选其一（建议 1+2）：(1) 在 `:166`/`:460` 前加一句"本块**只读**、从本仓根执行，
读的是真实 `$HOME/.dsh`，故意不受 `DSH_HOME` 约束"；(2) 把 `:14` 的不变量收窄成"除本块（只读、
零写入）之外"；(3) 让块真正认 `DSH_HOME` 并给出绝对路径：
`const home = process.env.DSH_HOME || p.join(process.env.HOME, ".dsh")`，`dsh-gsd` 的 patch 路径
也改成 `p.join(home,"profiles","web/node_modules/dsh-gsd/cordis.patch.yml")`（装过插件时它就在那）。

### IN-02: 机器级那一面在"文件存在且干净"时多打一行 `0`

**File:** `docs/MIGRATION.md:57` 与 `:133`（en：`:351` / `:427`）

**Issue:** 四处同一个表达式：
`echo "machine-level: PRESENT gsd-hooks-bridge=$(grep -c 'gsd-hooks-bridge' "$DSH_HOME/cordis.patch.yml" 2>/dev/null || echo 0)"`。

`grep -c` 在**零匹配**时先打印 `0` 再以 1 退出，于是 `|| echo 0` 又追加一个 `0`；命令替换里是
`"0\n0"`，双引号内换行被保留，实际输出是两行：

```
machine-level: PRESENT gsd-hooks-bridge=0
0
```

本机已复现（`grep (BSD grep, GNU compatible) 2.6.0-FreeBSD`）：`if [ -e /dev/null ]; then echo "x=$(grep -c 'zzz' /dev/null 2>/dev/null || echo 0)"; fi` → `x=0` 换行 `0`。命中时（计数 > 0）
反而干净，所以这条**只在"期望"的那一支上**制造噪声——读者正好会在这里问"多出来的 0 是什么"。
`04-01-PLAN.md:238-240` 的同源写法是 `HT=$(grep -c … || true); … ${HT:-0}`，它不会重影；文档版
是改写时引入的。

**Fix:** 改成 plan 的两步式（两处 zh + 两处 en）：

```bash
HT=$(grep -c 'gsd-hooks-bridge' "$DSH_HOME/cordis.patch.yml" 2>/dev/null || true)
echo "machine-level: PRESENT gsd-hooks-bridge=${HT:-0}"
```

`04-01-PLAN` 里这段还有注释说明"present-and-clean"与"absent"是两种状态，可一并搬进来。

### IN-03: 旧仓清点有两个可核对的偏差（行数 315→314；章节链漏了 `## Compatibility`）

**File:** `docs/oldrepo-link/README.md:11`

**Issue:** 该行是 Phase 5 唯一的"旧仓是否变过"的对照基线，两处与观测 sha `41fcc7a` 的实测不符
（我只读核对了 `../install-gsd-dsh`，其 HEAD 确为 `41fcc7a`、工作树干净、remote 与文中一致、
`README.md` 23653 B、CJK 0）：

1. **"315 行"实际是 314 行。** `wc -l README.md` → `314`；文件以换行结尾，`vim`/GitHub 也显示
   314 行。315 是 `readFileSync(...).split('\n').length` 的典型 off-by-one（末尾空串多算一个）。
2. **章节链 `## Uninstall` → `## Troubleshooting` → `## License and credits` 中间漏了
   `## Compatibility`**（实际 `## ` 序列第 12 个是 Compatibility，在 Troubleshooting 与
   License and credits 之间）。文中只在更早处用了省略号，这三项是连写的，读者会读成相邻。

两者都不影响"插入点在 `## Quick start` 之前"这个结论，但第 1 条正好是 Phase 5 用来判断"旧仓是否
被改过"的数字——它天然会对不上。

**Fix:** `315 行` → `314 行`；章节链补成
`… → ## Uninstall → ## Troubleshooting → ## Compatibility → ## License and credits`。

### IN-04: 守卫 ⑭ 的说明与断言消息引用了不存在的 `# 步骤 N`，计数也已过期（28→30）

**File:** `tests/docs-consistency.test.mjs:339-341`（注释）与 `:371`（断言消息）

**Issue:** 注释 `:339-341` 写"bash 块里有 26 行 column-0 的 `# 步骤 N` 注释 … naive `grep -c '^# '`
得到 28"。实测：

- `docs/MIGRATION.md` 今天 `grep -c '^# '` = **30**，减去 2 个 H1 = **28** 行围栏内 column-0 注释（多出的 2 行
  是 04-04 的步骤 6 引入的 `:194` / `:488`）。在 `e63edb3`（写这段注释时）确为 26/28，所以两个
  数字**在本 phase 内变旧了**。
- **`# 步骤 N` 这种行从来不存在**：`grep -c '^# 步骤'` = 0，`git show e63edb3` 也是 0。真实形态是
  `# 面 2a：…` / `# A 阴性对照` / `# drill form (one-shot home)…`。断言消息 `:371` 同样说
  "runbook 里行首的 `# 步骤 N` 是 bash 注释"，下一任维护者照这句话去文件里找会找不到。

这条不是守卫功能缺陷（围栏逻辑本身正确，见 §4），是**给下一位维护者的说明与现场不符**——而这段
注释的全部价值就是让下一个人看懂"为什么要围栏感知"。

**Fix:** 注释改为"28 行 column-0 的 `# …` 注释（如 `# 面 2a：…` / `# A 阴性对照`），naive
`grep -c '^# '` 得到 30，真实 H1 是 2"；`:371` 的括号同样把 `# 步骤 N` 换成 `# 面 2a：…`。数字
建议不再写死，改成"数量会随新块增长，判据只看围栏外"。

## Verification（做了什么、怎么验的）

### 1. 可执行性：9 个块逐块过（写落到哪个 home / 引号 / 顺序 / 判据）

| 块 | 首行 | 写入目标 | 失败关闭 |
| --- | --- | --- | --- |
| 0-A `:20-25` | `export DSH_HOME="$(mktemp -d …)"` | 临时 home + 临时 npm prefix | mktemp 失败 → 空串 → 下游 `${…:?}` 拦下 ✓ |
| 0-B `:37-40` | `export DSH_HOME="$HOME/.dsh"` | 真实 home（**由读者显式选择**）✓ | 只 export，不写盘 ✓ |
| 步骤 1 `:48-61` | `${DSH_HOME:?…}` | 只读 ✓ | ✓ |
| 步骤 2 `:69-73` | `${DSH_HOME:?…}` | `--uninstall` | ✓ |
| 步骤 3 `:88-94` | `${DSH_HOME:?…}` | 全局 npm prefix | ✓ |
| 步骤 4 `:102-109` | `${DSH_HOME:?…}` | profile | ✓ |
| 步骤 5 `:117-149` | `${DSH_HOME:?…}` | 只读 + `/tmp/mig-dump.*` | ✓ |
| 步骤 6 静态 `:169` | `node -e '` | 只读（硬编码 `$HOME/.dsh`） | 无 DSH_HOME 依赖（见 IN-01） |
| 步骤 6 动态 `:195` | `export DSH_HOME="$(mktemp -d …)"` | 一次性 home | 非 `${…:?}`，但写入点是新临时 home ✓ |

- **引号**：所有变量展开都带引号，或落在 `"$DSH_HOME"/glob` 这种正确习语里（引号只包前缀，
  路径名展开在引号外，空格安全）。唯一裸放的是占位符 `bash <path-to>/install-gsd-dsh.sh`
  （`:72` / `:366`）：路径含空格时首行即报 `No such file`，属响失败，未计分。
- **顺序**：D-03 硬门（步骤 1）先于 `--uninstall`（步骤 2）✓；步骤 2 先于卸全局 CLI ✓。
  （`:8`/`:33` 的措辞顺序与步骤 1 的 `${DSH_HOME:?…}` 守卫互相别扭——守卫要你先跑 0-B，正文说
  先跑步骤 1——但 0-B 只 export 一个变量，且守卫自带指引，属自纠，未计分。）
- **`set -e`**：9 个块都不 `set -e`，符合"整段粘贴到交互 shell"的用法；若读者自行包进 `set -e`
  脚本，步骤 5/6 里"期望无输出"的 `grep`（退出 1）会中途终止——文档没建议这种用法，未计分。
- **`\s`**：`:147-148` / `:441-442` 用 `grep -cE '^\s*- id: gsd$'`。本机 BSD grep 支持 `\s`
  （实测匹配），未计分；步骤 6 同判据用的是可移植的 `[[:space:]]`，两种写法混用但都能跑。
- **exit code**：文档三处明说"exit code 不作判据"（`:151` / `:217` / `:378`），与我读旧脚本
  源码得到的结论一致（无条件 `exit 0`）。

### 2. 数字对账（doc ↔ 证据册 ↔ 可复算项）

| 数 | 文档 | 证据册 | 独立复算 |
| --- | --- | --- | --- |
| 旧部署版本 1.16.0 | `:29` `:228` `:254` | `04-DRILL-EVIDENCE.md:36-37` | — （演练已销毁） |
| 旧 72 / 3084 B / 3195 B | `:232-234` | `:37`（`home_len=20`，路径出现 3/7 次） | — |
| 公式 `3084-3×(20-L)` / `3195-7×(20-L)` | `:27` / `:321` | `:37` 同 | 与 `:228` 冲突（WR-03） |
| 包内 3587 / 3856 / 72 | `:235-237` | `:45` | **✓** `wc -c skills/…` = 3587/3856，`ls skills` = 72 |
| dump 标头 24 → 25，1243 / 1255 行 | `:145` `:153` `:238` | `:43` `:52` `:92` | — |
| 跳过时 25→24、1255→1243、stderr 恰 1 行 / 526 B、EXIT=0 | `:279` `:276` | `:93` | — （文档只写"恰一行"，未写 526 B：不矛盾） |
| 并存 24 → 27 | 文档未写具体值（只写 `H1 > H0`） | `:155` `:162` | 与 `:206` 判据冲突（WR-02） |
| 卸载前窗口 1877 B | `:157` | `:39` | — |
| pins 注入 exit 2 / 失配串 | `:283` | `:82`（167 B） | **✓** `build/lib/check-pins.mjs:152-159` 消息格式逐字对上 |
| 5 事件 / 14 matcher，分布 1/7/4/1/1 | `:262` | — | **✓** `config/gsd-hooks.json` 实测 1/7/4/1/1 |
| `files` 九项无 `docs/` | `:5` | — | **✓** 9 项，无 `docs` |
| `!!js createRequire(baseUrl)` → `<包>/config/gsd-hooks.json` | `:256` | — | **✓** `cordis.patch.yml:31-34` |
| adapter 走 `node <GSDROOT>/…` 绝对路径 | `:98` `:254` | — | **✓** `skills/gsd-health/SKILL.md:19-20` 原文 |
| 全套 38 个用例（BUILD.md:16） | `BUILD.md:16` | `:148`（`tests 38 / pass 38`） | **✓** `grep -c '^test('` = 2+8+14+4+7+3 = 38 |

证据册 `:52` 自己写着"正文与本表使用同一组数字 … 任一侧改动而另一侧未改即为缺陷"——这条我按
逐项对账执行了，除 WR-03 那一处**归类**（不是数字本身）之外没有失配。

### 3. 双语同构（守卫 ⑭ 不会替人做的部分）

机械对齐（脚本按围栏感知切两半后逐段比对）：**76 段 ↔ 76 段一一对应**（zh 第 77 段是 `---` 分隔行，
en 没有，属预期）；**9 个围栏 ↔ 9 个围栏**；每个围栏的**命令/代码行数与内容逐行相等**（步骤 5 的
24 行、步骤 6 的 20 行、20 行全部一致，差异只在行尾注释语言）。也就是说**没有任何步骤或段落只在
一半里存在**——这条是干净的。

内容级差异只有一处：WR-03（`:228` vs `:522`）。这类偏差守卫 ⑭ 结构上抓不到（它只数 `## `、
查 CJK），只能人读，属于设计上的已知边界而非缺陷。

### 4. 守卫 ⑭ 的围栏逻辑（对抗性检查）

- 现存 18 个围栏（36 行分隔行，其中 18 行带 `bash` 标记）全部是行首三反引号；
  `/^\s*\x60{3}/` 逐行翻转，翻转次数为偶 ✓；
  `:360` 对围栏行本人 `push(true)` 后 `continue`，所以分隔行永远不会被当成标题 ✓。
- 开（带语言标记）与闭两种分隔行都命中同一正则，正常闭合 ✓（现存 9 对就是这样）。
- 4 反引号围栏：正则同样命中（会翻转）。今天文档里 0 个 4 反引号围栏；若将来加一个**内含 3 反引号
  行**的 4 反引号围栏，跟踪会反相——但那会让 H1/H2 计数偏离 2/3+3 而**变红**，属响亮失败而非
  静默假绿。未计分。
- EOF 未闭合围栏：其后全部标为围栏内 → H1 数变 1 → 红。方向正确 ✓。
- `---` 分隔行：切两半用的是**第二个 H1** 而不是 `---`（`:374-375`），所以代码块里出现 `---` 不会
  切错 —— 这是本守卫最关键的正确选择。`:373` 的 `raw.includes('---')` 本身是围栏盲的，但今天
  `:293` 是全文唯一一行精确 `---` 且在围栏外，断言有效；若将来某个 bash 块里出现独占一行的
  `---`，这条断言就可以被那行满足而分隔行被删也不红。属潜在弱点，未计分（今天不成立）。
- 语言判别：en 半 CJK 计数实测 0，zh 半 4020 ✓；`## ` 计数 3 + 3 ✓；`^# ` naive 计数 30（见 IN-04）。

### 5. 与旧脚本源码的逐条对账（文档关于 `--uninstall` 的每一句）

读 `../install-gsd-dsh/install-gsd-dsh.sh`（1060 行，HEAD `41fcc7a`）：

| 文档主张 | 源码 |
| --- | --- |
| 对 `$DSH_HOME/skills/gsd-*` 无条件 `rm -rf` | `:264` ✓ |
| `{gsd-core,hooks,scripts}` 按 `.gsd-dsh-managed` marker 删 | `:268-273` ✓（且非 marker 时打印 SKIPPED） |
| 剥 `bridge` + `sandbox` 两对块，留 `.stripped-bak` | `:232` / `:299-301` ✓（仅"真剥过"才备份，与文档"每个被剥过的文件"一致） |
| 末尾无条件 `exit 0` | `:308` ✓ |
| `set -euo pipefail` 被 `|| true` 兜住 | `:56` 有 `set -euo pipefail`；剥块调用为 `node … || true` ✓ |
| 不碰全局 npm 包 / `~/.gsd`（只提示）/ 机器级 patch / 两条直连依赖 | 卸载段内无对应写动作 ✓ |
| `--no-ghooks`/`--no-npm-bin` 只在非 upgrade 模式生效 | `:402` 原文 ✓ |
| `GSD_PROFILE` 三档透传 `INSTALLER_ARGS+=(--profile=…)` | `:383` ✓ |
| 不认 profile（一次波及该 home 下所有 profile） | 技能是 home 级、patch 扫 `profiles/*` ✓ |

### 6. README / BUILD / 旧仓备料

- `README.md`：diff 恰 `+2 −0`，中英各一行、都指向 `./docs/MIGRATION.md`；插入点在首个 `# dsh-gsd`
  之后，不影响 ⑨ 的徽章定位与 ⑫ 的裸名 install 计数（切片点 `:29-33` 未位移）✓。
- `BUILD.md`：唯一改动 37/37 → 38/38（`:16`），38 已独立数过 ✓。
- `docs/oldrepo-link/`：`pr.md` 结构（`title:` / 独占一行 `---` / body）、`snippet.en.md` 为纯
  blockquote（无标题无围栏）、`snippet.zh.md` 首行 HTML 注释说明"备而不用"——都与 `README.md` 的
  分工表一致 ✓；回链 `…/blob/main/docs/MIGRATION.md` 的默认分支确为 `main` ✓；`41fcc7a` 已核对
  为观测 HEAD（不是 patch 基准）、旧仓工作树干净、remote 一致 ✓。

### 7. 未计分的观察（记下来，不算 finding）

1. **`npm_config_prefix` 的采样陷阱没有写进文档。** `04-DRILL-EVIDENCE.md:50` 记录了一次真实误判：
   演练后在同一 shell 里 `npm ls -g` 得 `NOT FOUND`，原因是临时 prefix 还在环境里。文档 0-A 讲了
   为什么要加这道保险，但没讲它的副作用（同一 shell 里 `npm ls -g` / `npm uninstall -g` 都指向
   临时 prefix）。不计分：0-B（真实用户路径）不设该变量，步骤 3 在演练里**正需要**它指向临时 prefix。
2. **步骤 4 的一个围栏里放了两种互斥形态**（`.tgz` 与 registry 版，`:106-108`）。盲粘会先报一条
   `No such file`（占位符 `<version>` 未替换），再执行 registry 安装。正文紧接着解释了二者判定路径
   不同，且占位符本身就强制读者动手改，故不计分。
3. **`/tmp/mig-dump.*` / `/tmp/c-*.out` 用固定文件名**：并发或重跑会互相覆盖。文档是单次流程，不计分。
4. **`docs/oldrepo-link/*.md` 与 `docs/MIGRATION.md` 末尾都没有换行**（`tail -c 1` 的最后一个字节
   不是 `\n`）。本仓其它文档同样如此，属既有约定，不计分。

### 8. 测试与构建：未运行（按任务约束）

我没有跑 `npm test` / `node --test` / `npm run build`（编排器紧接着串行跑，并发会触发
`build-smoke.test.mjs` 的已知假红）。因此**守卫 ⑭ 是否绿不是我的观测，而是我的推演**：我用独立的
`node -e` 复算了它的全部前置——2 个 H1（`:1` / `:295`）、3 + 3 个 `## `、`---` 唯一且在 `:293`、
en 半 CJK = 0、README 两半各含 `docs/MIGRATION.md`，均成立。若需机器确认，串行执行
`node --test --test-concurrency=1 tests/docs-consistency.test.mjs` 即可（单文件，不触发
`build-smoke` 的并发假红）。

`BUILD.md:16` 的 38 同样不是跑出来的，是数出来的：`grep -c '^test('` 逐文件 2 + 8 + 14 + 4 + 7 + 3 = 38。

---

_Reviewed: 2026-11-14T06:45:14Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_