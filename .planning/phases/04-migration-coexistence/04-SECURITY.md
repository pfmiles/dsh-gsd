---
phase: "4"
slug: "migration-coexistence"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-14"
---

# Phase 4 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> **来源**：本 phase 无执行期 `04-SECURITY.md`（state B，追认审计）。寄存器 = `04-RESEARCH.md` `## Security Domain` 的 T-4-01…T-4-06 + 四份 `04-0X-PLAN.md` 的 `<threat_model>` 块（T-4-07…T-4-19，另各计划一条 `T-4-SC`），`register_authored_at_plan_time: true`，逐条对照 HEAD `3c4ffcf` 的提交产物核验。
> **本 phase 的性质决定了缓解面的形态**：它是**文档 + 一条测试守卫**，无产品代码改动——`docs/MIGRATION.md`（新，585 行双语）、`docs/oldrepo-link/`（4 件新）、`README.md`（+2 行）、`tests/docs-consistency.test.mjs`（+60 / −0，⑭ 一条）、`BUILD.md:16`（37/37 → 38/38）。因此多数威胁的缓解落在「文档里命令块的形态与判据」+「证据册里的实测记录」，少数落在「必须在码的机器断言」（⑭、`cordis.patch.yml`、plan 内的 `automated` 块）。
> **判据口径**：一切「通过」只认内容 / 字节数 / 集合；`--uninstall` 与 `--dump-config` 的 exit code 恒 0，本 phase 全部判据**均不以退出码为准**（`docs/MIGRATION.md` L151 / L217 / L279）。

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → 临时 drill home | 演练要装 `@opengsd/gsd-core@1.16.0` + 两个 bridge 包；04-04 另装两个 `[SUS]`（too-new）第三方插件 | 公开包元数据与代码；无凭据 |
| 真实 `~/.dsh` → 演练动作 | `--uninstall` **不认 profile**、机器级生效；`--dump-config` 会重写 `<profile>/cordis.yml`，profile 不存在时还会把它建出来 | 用户正在用的 72 skills / hooks / profile 清单；bridge 块**只有 `.stripped-bak` 一处可恢复** |
| 全局 npm prefix → 旧脚本的 `npm i -g` | 临时 home **不隔离** `npm i -g`；旧脚本无条件把全局 CLI 写进真实 prefix | 用户在用的 `@opengsd/gsd-core@1.16.0` |
| 多个 bundle → 同一棵 profile 树 | DSH 的 `applyPatches` 是纯 `push`、**无冲突仲裁**；同名 row id 静默双行 | 各 bundle 的 patch 行 |
| 本仓 → 公开旧仓 `pfmiles/install-gsd-dsh` | 备料四件是为 Phase 5 的对外改动准备的；本 phase 只落盘、不推送 | 对外文案（公开）；旧仓 HEAD / 工作树 / remote |
| 文档 → 用户终端 | `docs/MIGRATION.md` 不在 npm 包内（`files` 九项不含 `docs`），**不受** gate B 的 `/Users/` 禁令扫描，但用户会**原样粘贴** | 可执行命令（含语义上是 `rm -rf` 的 `--uninstall`） |
| 判据 → 结论 | 「通过」只认内容 / 字节 / 集合；exit code 一律不作判据 | 实测读数 |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation（证据落点） | Status |
|-----------|----------|-----------|----------|-------------|------------------------|--------|
| T-4-01 | Tampering / DoS | 真实 `~/.dsh`（`--uninstall` 不认 profile；`--dump-config` 会写盘） | high | mitigate | `docs/MIGRATION.md` 的 18 个代码块里 14 个**首行**即 `export DSH_HOME=`（L21/38/49/70/89/103/118/315/332/343/364/383/397/412），另 2 个（L194/L488）先一行说明再 export；后续块一律 `${DSH_HOME:?run step 0-A or 0-B first}` **fail-closed**（L49/70/89/103/118），未设 home 即退出而非落回默认值；`--uninstall`（L72）之前有 D-03 硬门（L48–61：面 2a `grep -l 'GSD-DSH-bridge BEGIN'`、面 2b 逐 profile 计数、机器级 ABSENT/PRESENT 两支），「命中即中止」写在 L33/L46；真实 home 只允许 `ls`/`grep`/`node -e`（L158/L452）。演练侧机器证据 = 真实 `~/.dsh` 的 profiles 清单与各 `package.json` 的 mtime+size `diff -q` 无差异（`04-DRILL-EVIDENCE.md` L49）、`find ~/.dsh -newermt 2026-11-14T06:17:00Z` 命中 **0**（同文件 L160）。**形态偏离（已核）**：两个零安装静态块（L169/L463）有意不带 `DSH_HOME`，它们只做 `fs.readFileSync`、零写入，属本条允许的「只读探针」形态 | closed |
| T-4-02 | Tampering | 全局 npm prefix（临时 home 不隔离 `npm i -g`） | high | mitigate | 文档 L18/L312 写明两道保险；0-A 块 L23–24 实装 `export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"` + `echo "npm prefix=$(npm config get prefix)"`；演练真用了另一半：`GSD_VERSION=1.16.0 … --no-npm-bin`，日志含 `(skip) for gsd_run on PATH run: npm i -g @opengsd/gsd-core@1.16.0`（DRILL-1 L35）；收尾 `npm ls -g --depth=0` 复测为 `├── @opengsd/gsd-core@1.16.0`、`command -v gsd_run` 落点未变（L50；同处还记录了首次采样因临时 `npm_config_prefix` 未 unset 而误报 `NOT FOUND` 的负向观测，并标注不得充当通过形态） | closed |
| T-4-03 | Spoofing | PATH 上的 `gsd_run`（串味到旧引擎） | medium | mitigate | 文档 L96–98/L390–392 明确「包内 adapter 走 `node <GSDROOT>/gsd-core/bin/gsd-tools.cjs` 绝对路径、不依赖 PATH」，并规定 `command -v gsd_run` 的输出只作**残留证据**；演练所有引擎调用写绝对路径（DRILL-1 L36 `node "$DSH_HOME/gsd-core/bin/gsd-tools.cjs" runtime-identity --raw`；04-01-PLAN L215–216 同一形态） | closed |
| T-4-04 | Elevation of Privilege | 兼容门的豁免路径（`allow-version` / `--force`） | high | mitigate | 文档 L160/L454 把 `allow-version` 定义为「显式风险豁免」且「演练里出现次数必须是 0」，`--force` 定义为 pnpm 解析开关而非强制安装；L291/L585「绝不 `--force`」；L290/L584 把 `allow-version` 降级为三条修复路径的**次选**。证据：三个日志里 `allow-version` + `Exact-version exemption: active` 合计 **0** 次（DRILL-1 L48）；三次 `add` 日志三项全 0，`npm pack` 日志唯一命中是测试用例名 `⑦ allow-version 风险声明双语存在`（DRILL-3 L166）。本轮 grep：`--legacy-peer-deps` 在 `docs/MIGRATION.md` = 0 次 | closed |
| T-4-05 | Information Disclosure（弱）/ 可移植性 | `docs/MIGRATION.md` 正文命令 | medium | mitigate | **本轮实测** `grep -c "/Users/" docs/MIGRATION.md` = **0**；`docs/oldrepo-link/{README,pr,snippet.en,snippet.zh}.md` 四件亦均 0。路径一律 `$DSH_HOME` / `$PWD` / `<profile>` / `<path-to>`；本机读数集中在标注「示例，本机 2026-11-13」的 L226–238 表内；机器断言在 04-04-PLAN L327（`doc.includes("/Users/")` 即 throw），04-01 的 shape gate 输出 `migration-doc-shape ok`（04-01-SUMMARY L196）。**残余**：gate B 不扫 `docs/`，本条无 CI 兜底——文档 L5/L299 只自述「不随 npm 包发布」，而「gate B 不扫 `docs/`」写在该门自身的红消息里（04-01-PLAN L326），故这条纪律没有 per-commit 判据 | closed |
| T-4-06 | Tampering | 演练期的 registry 取源 | high | mitigate | 只装 Phase 1–3 已核验的官方 exact：`GSD_VERSION=1.16.0` + payload check `{"packageName":"@opengsd/gsd-core","version":"1.16.0"}`（DRILL-1 L35）；bridge 两包按 `pins.json` 的 exact 值安装（本轮读盘：`lines.022.bridge` = `@deepseek-ai/dsh-hooks-claude-code` / `@deepseek-ai/dsh-hook-protocol` 均为 `0.2.2-rc.1`）；04-01 不装任何 `[SUS]` 第三方插件（`[SUS]` 只在 04-04，且有 blocking-human 门）。⚠ **未履行条款**：本条 mitigation 的「演练环境是一次性 `/tmp` home，**收尾即弃**」不成立——见 R-4-01 | closed |
| T-4-07 | Tampering（对外写入） | `pfmiles/install-gsd-dsh` 的 HEAD / 工作树 / remote | high | mitigate | 三条只读命令在任务提交前后各跑一次，均为 `oldrepo-untouched ok`（04-02-SUMMARY L107 / L139）。**本轮 live 复核**：`git -C ../install-gsd-dsh rev-parse --short HEAD` → `41fcc7a`、`status --porcelain` → 0 行、`remote get-url origin` → `git@github.com:pfmiles/install-gsd-dsh.git`；写入面仅 `docs/oldrepo-link/` 四件（`snippet.zh.md` 首行 HTML 注释即「无落点」声明），`docs/` 仍未进 `package.json.files`（`files-scope ok`，04-02-SUMMARY L110） | closed |
| T-4-08 | Repudiation / 语义失真 | `docs/MIGRATION.md` §② 的双语同构 | medium | mitigate | per-commit 守卫 = ⑭（`tests/docs-consistency.test.mjs` L348–395）：围栏感知数 H1（恰 2）、按第二个 H1 切半、两半围栏外各恰 **3** 个 `##`、zh 含 CJK / en **零** CJK、README 两半各含 `docs/MIGRATION.md` 入口；authoring-time 门另有 `section-2 ok`（表头逐字、3 个 `###` 齐、en 半零 CJK）记录于 04-02-SUMMARY L215。**残余**：`###` 标题逐字对应与表头逐字校验只在该一次性门里，⑭ 不覆盖（见 R-4-02） | closed |
| T-4-09 | Tampering（技术叙述失真） | §② 的 hooks 轴（把归属差异写成事件差异） | high | mitigate | 正文两半均含 `不是事件差异`（L256）/ `not an event-set difference`（L550），并把「两侧同为 5 事件 / 14 matcher、双向差集为空」写进影响列；「共同限制」被单列成 `###`（L260 / L554）而非对照表第 4 行，并把五类事件全写成行内代码；机器断言是**双向**的：04-02-PLAN L237 对任何以竖线开头的表格行匹配 `共同限制\|Shared limit` 即红（`put the shared limit inside the table`），同门还断言小节内五个事件齐；输出 `section-2 ok`（04-02-SUMMARY L215） | closed |
| T-4-10 | Tampering | `build/assets/pins.json` 与临时 home 内的 manifest（注入后未复原） | high | mitigate | 注入前 sha256 `45c643ea…a2bb`（DRILL-2 L81）→ 注入后 `check-pins` **exit 2** / stderr 逐字 167 B（L82）→ 复原后 sha256 与注入前**逐字节相同**且 `git status` 为空（L83）。**本轮 live 复核**：`shasum -a 256 build/assets/pins.json` = `45c643ea3711e998445369c61cf2958c1ea63bc6062a9e143f28e1d5c494a2bb`、`git diff 7de4010 HEAD -- build/assets/pins.json` **0 行**、`lines.021.peer` 仍 = `@deepseek-ai/dsh-skill-filesystem >=0.2.1-rc.5 <0.2.2-0`（未被误伤）。临时 home 内的两处 manifest（`dsh-gsd` 的 `engines.dsh`、bridge 包新增的 `engines`）亦经 `cp` 复原（DRILL-2 L96） | closed |
| T-4-11 | Repudiation（症状失真） | `docs/MIGRATION.md` §③ 的症状表 | high | mitigate | 五条逐字串在两半齐备（**本轮 grep 计数**：`dsh: installation rejected:` ×4、`dsh: nothing was installed.` ×2、`dsh: restored package.json, pnpm-lock.yaml, and node_modules.` ×2、`dsh: skipping profile bundle` ×2、`dsh: disabling profile plugin row` ×2）；③ 行明写「退出码仍是 0」（L276）/ `the exit code stays 0`（L570）；③′ 行携带 `MEASURED:` + boot 逐字原文（L277/L571），而不是「已知会…」式转述；结构门在 04-03-PLAN L332–343 对四层首列 + 五条逐字串 + `allow-version`/`--force`/「退出码仍是 0」逐条断言，输出 `section-3 ok`（04-03-SUMMARY L236）；DRILL-2 存有 526 B 逐字 stderr（L93） | closed |
| T-4-12 | Tampering（守卫失真） | `tests/docs-consistency.test.mjs` 的 ⑭ | medium | mitigate | **本轮实测**：对 phase base `7de4010` 的 diff = `60 0`（纯追加，零删除，①–⑬ 一行未动）；文件内 `test(` = 14；全量 `2+8+14+4+7+3` = **38**，`BUILD.md:16` = `预期 38/38`；⑭ 复用 L29–33 的 `readmeZh`/`readmeEn` 切片（不另算切点），且标题计数**围栏感知**（L356–363，行首三反引号打标）；突变实验留痕：M1（en 半一个 `##` 降级）→ `fail 1` 且文案点明「实际 2」，M2（围栏内注入 `# 假标题`）→ 仍 14/14 而 naive 计数 29（04-03-SUMMARY L239） | closed |
| T-4-13 | Tampering（供应链） | `dsh-deja@0.24.0` / `dshmarket@1.73.15` 的安装 | high | mitigate | ① `checkpoint:human-verify gate="blocking-human"` 声明在 04-04-PLAN L139（`<task type="checkpoint:human-verify" gate="blocking-human">`）；② 人审留痕 `APPROVAL: approved 2026-11-14T06:17:59Z`（DRILL-EVIDENCE L117，全文件**唯一**一条，本轮 grep 确认），裁决依赖的复核读数（在用版本 / `postinstall` 均为 `none` / 源码仓）在同文件 L104–115；③ 演练块以该行为第一道判据（04-04-PLAN L231–237），缺行或非 `approved` 即 `bail` 且不装任何包；④ 两个精确版本 + 装后版本复核（L251 / L260–265 → 实测 `dsh-deja=0.24.0`、`dshmarket=1.73.15`，DRILL-3 L149–153）；⑤ 演练只在 `mktemp -d /tmp/dsh-coex-XXXXXX`（L238），真实 `~/.dsh` 零写入以 `diff -q`（profiles 清单 + 各 `package.json` mtime/size）+ `find -newermt` 命中 **0** 双证（DRILL-3 L160）；⑥ 收尾删除三次演练 home 与仓根 tarball——本轮 `ls /tmp/dsh-coex-*` = 无、`ls *.tgz` = 无 | closed |
| T-4-14 | Tampering（假绿） | 同名 row id 静默双行 / 被跳过的 bundle | high | mitigate | 「无冲突」= 四判据**合取**，由可运行的 `automated` bash 块现场执行而非散文（04-04-PLAN L266–285：stderr 0 字节 / 同一 home `H1 > H0` + 三 bundle 标签**出现** / 四 id 各恰 1 / `uniq -d` 为空），并先把 `dsh.profile.bundles` 断言含三者（L259，缺项即「演练没跑」而不是「无冲突」）；块末与证据册的 `COEXIST-DRILL bundles=… headers=…` 行**逐字对表**（L286–289，`does not record this run` 为红）。实测 `bundles=5 / headers=24→27 / stderr 0 / 四 id 各 1 / uniq -d 0 行`（DRILL-3 L152–159），`dump exit=0` 只记录并标注「永不作通过信号」（L158）；RUN1 的唯一红恰是「证据册未记录本次运行」（L164），证明对表有牙 | closed |
| T-4-15 | Repudiation（越界声明） | §① 步骤 6 与 DRILL-3 的结论范围 | medium | mitigate | 文档 L219 含 `不能证明` 并点名 `codegraph` 缺口（`github:` 形态、冻结不了精确版本），en 半 L513 含 `does not prove`；DRILL-3 L170–172 同段落三条局限（codegraph 未动态安装 / 解析级未触发不代表换包不会 / 临时 profile ≠ 真实依赖图）；机器断言 = 步骤 6 门先切出小节再要求边界词与 `codegraph`（04-04-PLAN L322–323），输出 `step-6 ok`（04-04-SUMMARY L209） | closed |
| T-4-16 | Tampering（空判据） | 机器级 `$DSH_HOME/cordis.patch.yml` 的「计数为 0」断言 | medium | mitigate | 文档 L56–60（步骤 1）与 L132–136（步骤 5）都用 `if [ -e … ]` 先判存在性：不存在打印 `machine-level: ABSENT` 并声明这是**另一状态**，存在才打印实际计数并要求 0；L63/L357 写明「裸 `grep -c … \|\| true` 在文件缺失时同样返回 0，它证明的是文件不存在，不是文件干净」；演练实际命中 `ABSENT` 分支并原样记录（DRILL-1 L42） | closed |
| T-4-17 | Repudiation（伪不变量） | 「`^# == ` 层数 == `dsh.profile.bundles` 长度」 | high | mitigate | 文档 L153 / L217 / L279 / L447 / L511 明确该等式是**伪不变量**（标头按连续来源段打、`dsh-web-app` 就地 patch base 行），正确形态写成「同一 home 内 `H1 = H0 + 1`（`H0` 先断言非空）」+「逐 bundle 标签**出现**」+「row 集合」；两条实测反例：DRILL-1 L47 标头 **25 ≠ bundles 3**（分布 12/11/1/1）、DRILL-3 L155/L162 标头 **27 ≠ bundles 5**（`27 = 24 + 3`，健康形态）；演练块把该禁令写成 stdout 提示（04-04-PLAN L272）并在 fails_when 里点名「不要把它当红」 | closed |
| T-4-18 | Repudiation（基线前提被抄） | 旧部署侧字节基线 3084 / 3195 | high | mitigate | 两条前提**由演练自己断言**且断言点在 `--uninstall` **之前**：`if [ ${#DSH_HOME} -ne 20 ]` → exit 1（04-01-PLAN L203）、`core/VERSION` 与 `runtime-identity --raw` 都须 `1.16.0`（L215–216，两条独立读数）；实测同轮成立：`home_len=20`（DRILL-1 L33/L37）、`core_VERSION=1.16.0` + `runtime_identity=1.16.0`（L36），此后才轮到 `3084`/`3195`（L37）与「卸载后为 0」的阴性对照。`--uninstall` 在 L40，断言在 L36–37 ⇒ 顺序正确。文档 L27–29 把「3084-3×(20-L) / 3195-7×(20-L)」与版本依赖写进正文，0-B 则要求读者**自量**基线（L42），不继承本机常量 | closed |
| T-4-19 | Repudiation（供应链门失效） | 证据册的 `APPROVAL:` 记录与演练准入门 | high | mitigate | 门只认**最新一条**：`APP=$(grep -E "^APPROVAL: (approved\|hold)" "$EV" \| tail -n 1)` + `case` 三分支——`approved` 放行 / 空 → `no APPROVAL line` / 其余（含 `hold`）→ `the LATEST APPROVAL decision is not approved: … a later hold overrides an earlier approved (T-4-19)`，两支都 `bail` 且**不安装任何包**（04-04-PLAN L231–237）。「改判只在文件末尾追加、绝不编辑旧行」的规则同时写进证据册 L102 与计划验收 L162；证据册本轮 grep 只有 1 条 `APPROVAL:`，演练输出 `approval gate: latest decision is approved`（DRILL-3 L146） | closed |
| T-4-SC | Tampering | npm/pip/cargo installs（四份 PLAN 各声明一次：04-01 L433 / 04-02 L353 / 04-03 L385 / 04-04 L381） | high | mitigate | 全 phase `package.json` **零改动**（本轮：`git diff 7de4010 HEAD -- package.json` = 0 行；该文件最后一次改动是 phase 03 的 `3f2c909`）、`CHANGELOG.md` 零改动、仓库无 lockfile（`git ls-files` 命中 0）；四份 SUMMARY 的 `tech-stack.added` 均为空数组；唯一的三方安装（`dsh-deja` / `dshmarket`）在 blocking-human 裁决之后发生并逐字核对版本；`--force` / `--legacy-peer-deps` / `allow-version` 使用次数 = 0（DRILL-1 L48、DRILL-3 L166） | closed |

*Status: closed · open（`T-4-SC` 为保留 ID：`04-RESEARCH.md` 未定义它，四份 PLAN 各声明一条同义项，本文件按 phase 03 体例合并为一行，不计入 19 条编号寄存器）*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on`（本仓配置为 `high`）count toward `threats_open`*
*Disposition: mitigate（implementation required）· accept（documented risk）· transfer（third-party）*

> **T-4-06 的「收尾即弃」不成立（重要，见 R-4-01）：** 本条 mitigation 的四个子句里，前三个（exact 版本、`pins.json` 的 bridge exact、不装 `[SUS]`）都有落点，第四个「演练环境是一次性 `/tmp` home，**收尾即弃**」被现场推翻：`/tmp` 下仍有 **12 项** `/tmp/dsh-mig-*`（4 个 home + 8 个空 npm prefix），其中 `dsh-mig-BLJoAwJ` 18 MB。判定仍为 `closed` 的理由与边界写在该条 R-4-01 里——**本轮不把它计入 `threats_open`，但也不把它当作已履行**。
>
> **T-4-01 的形态说明：** plan 期 must_have 的字面要求是「每个命令块首行都是 `export DSH_HOME=`」。实件有 2 个例外（L169/L463 的零安装静态比对），它们**只读**真实 home（`fs.readFileSync`）且不写任何文件，正好落在本条允许的「真实 home 只允许 `ls`/`grep`/`node -e` 只读探针」内。这是有意的形态选择（零安装判据优先），不是纪律漏项。
>
> **T-4-08 / 09 / 11 的守卫生效面要分清：** ⑭ 只把「H1 数 + 两半各 3 个 `##` + 双语非复制」变成 **per-commit** 判据；`###` 标题逐字、表头逐字、五条症状串、`codegraph` 缺口这些是 **authoring-time 一次性门**（`section-2 ok` / `section-3 ok` / `step-6 ok`），其输出被记录在 SUMMARY 里但不会在后续提交上重跑。三者中只有 T-4-11 的五条串与 §③ 结构在 04-04 的 `step-6`/`drill-3` 门里被间接再摸了一次。

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| — | — | 本 phase 寄存器内**无 `accept` disposition 条目**，故无新增 accepted risk。04-04 `blocking-human` 给出的是对两个 `[SUS]` 包的**合法性裁断**（发布者 / 源码仓 / 与在用版本一致 / 无 `postinstall`），不是对某项残余风险的有意识接受；它作为审批留痕记在 `04-DRILL-EVIDENCE.md` L104–117，不进入本表 | — | 2026-11-14 |

*Accepted risks do not resurface in future audit runs.*

---

## 残余与偏离（不计入 `threats_open`，但必须留痕）

| ID | 关联威胁 | 事实（可复核） | 影响判定 | 收敛动作 |
|----|----------|----------------|----------|----------|
| **R-4-01** | T-4-06 | 演练的「收尾即弃」未履行：`/tmp` 下仍有 12 项 `/tmp/dsh-mig-*`（4 个 home + 8 个**空** npm prefix），其中 `dsh-mig-BLJoAwJ` 18 MB（`profiles/web/` 含 `node_modules` / `cordis.yml` / `.stripped-bak`）；`/tmp/dsh-coex-*` 与 `/tmp/dsh-mis-*` 均已清空 | **不构成 tampering 或泄露**：残留物是公开的 GSD 1.16.0 源码与一次已卸载的 profile，目录权限 `drwx------`（`mktemp -d`），本轮 `find` 未发现 `.npmrc` / token / credential / `.env`；npm prefix 全空（0 文件）。T-4-06 的**篡改控制**（exact pin + 已验证出处 + 无 `[SUS]`）成立，故判 `closed`；但「收尾即弃」这句话在当前磁盘状态上是**假**的 | Phase 5 开工前执行 `rm -rf /tmp/dsh-mig-*`；并把 04-01-PLAN L429 的「收尾即弃」与 04-RESEARCH L944 的「全部临时目录已 `rm -rf`」按实测订正 |
| **R-4-02** | T-4-08 | ⑭ 覆盖 H1 / `##` 计数 / 双语非复制；`###` 标题逐字对应、表头逐字、三轴事实词只在 04-02 的一次性 `section-2` 门里 | 中：后续提交若把某半的 `###` 改掉而不动 `##`，⑭ 不会红 | Phase 5 若要长期守 §②，可把 `section-2` 的核心断言并入 ⑭（本 phase 不改测试面） |
| **R-4-03** | T-4-05 | `docs/` 不在 `package.json.files`，gate B 的 `/Users/` 禁令不扫 `docs/`，因此「零机器路径」只有 plan 期门 + 本轮 grep 两道 | 低：本轮实测 0 命中 | 若要 CI 兜底，需让 gate B 的扫描面覆盖 `docs/**`（跨 phase 决策） |
| **R-4-04** | T-4-04 / T-4-13 | 豁免计数与安装日志的证据是**一次性**的：`add` / `pack` 日志在 `/tmp`，已随演练收尾消失，本轮只能引用证据册记录（DRILL-1 L48、DRILL-3 L166），无法二次复验 | 低：日志内容在证据册里逐字摘录，伪造成本高于收益 | 无需动作；后续同类演练建议把 `grep -c` 结果直接写进证据册（本 phase 已是该形态） |
| **R-4-05** | 全部 | 本轮**未复跑**测试套件与演练：`tests/*.test.mjs` 有已知的并发假红（`gate C: no SKILL.md under skills/gsd-*`），且本 session 有并发执行者（本轮期间并发钩子新增了未跟踪的 `04-UI-REVIEW.md`） | 无：计数与守卫形态用静态复核替代（见下） | 由编排器在串行窗口跑一次 `node --test --test-concurrency=1 tests/*.test.mjs`（预期 `ℹ tests 38 / fail 0`） |

---

## Security Audit

| Date | Threats found | Closed | Open | Verdict |
|------|---------------|--------|------|---------|
| 2026-11-14 | 20（T-4-01…T-4-19 + 合并后的 T-4-SC） | 20 | 0 | L1 verified — state B（无既有 SECURITY.md）+ plan-authored register（`register_authored_at_plan_time: true`）+ ASVS L1 + `block_on: high` ⇒ `threats_open: 0` 后按 short-circuit 直写合同；L1 深度 = 每条缓解在提交产物里有**具体行号落点**，并对 7 条（T-4-05/06/07/10/11/12/13）另做 live 复核（`grep` / 读盘 / 只读 git / 文件系统检查） |

**Severity 分布：** high 14（T-4-01/02/04/06/07/09/10/11/13/14/17/18/19 + T-4-SC）· medium 6（T-4-03/05/08/12/15/16）· low 0。

**本轮独立复核（HEAD `3c4ffcf`，只读；审计开始时工作树 0 行）：**
- `shasum -a 256 build/assets/pins.json` → `45c643ea3711e998445369c61cf2958c1ea63bc6062a9e143f28e1d5c494a2bb`（与 DRILL-2 L81 逐字相同）；`git diff 7de4010 HEAD -- build/assets/pins.json` → **0 行**；`lines.021.peer` = `@deepseek-ai/dsh-skill-filesystem >=0.2.1-rc.5 <0.2.2-0`，`lines.022.peer` = `@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1`（两者均未被注入污染）。
- 旧仓三读（T-4-07 的 live 形态）：`41fcc7a` / `status --porcelain` 0 行 / `git@github.com:pfmiles/install-gsd-dsh.git`。
- `grep -c "/Users/" docs/MIGRATION.md` → **0**；`docs/oldrepo-link/` 四件 → 各自 **0**。
- 测试面静态复核：`grep -c '^test('` = 2（build-smoke）+ 8（compat-matrix）+ 14（docs-consistency）+ 4（pack-contents）+ 7（rewrite-map）+ 3（version）= **38**；`BUILD.md:16` = `预期 38/38`；`git diff 7de4010 -- tests/docs-consistency.test.mjs` = `60 0`（纯追加）。
- 发布面复核：`git diff 7de4010 HEAD -- package.json` = 0 行、`CHANGELOG.md` = 0 行、`git ls-files` 无 lockfile；phase 全量 diff 恰 16 个路径（`docs/MIGRATION.md` 585、`docs/oldrepo-link/` 4 件、`README.md` +2、`tests/` +60、`BUILD.md` 1 行、其余为 `.planning/` 文档）。
- 文档逐字复核：五条症状串在两半均命中（4/2/2/2/2）；`APPROVAL:` 在证据册中恰 1 条且为 `approved 2026-11-14T06:17:59Z`；`/tmp/dsh-coex-*`、`/tmp/dsh-mis-*` 与仓根 `*.tgz` 均已不存在。
- 演练脚本形态复核：`04-04-PLAN.md` L231–237（最新 APPROVAL 的 `tail -n 1` + `case` 三分支）、L251/L260–265（精确版本 + 装后复核）、L266–289（四判据 + 对表）；`04-01-PLAN.md` L203/L215–216（两条前提的硬断言）。

**未在密码学 / 平台层复现的证据（如实标注）：**
1. **未复跑任何演练**（`DRILL-1/2/3`）与 `npm pack`：本 phase 的演练会真装三个包、写临时 home、跑 `prepack`（全量 build + 全量测试），且本 session 有并发执行者——复跑既违反「不得重演」的审计纪律，也会产生已知的假红。所有演练读数引用 `04-DRILL-EVIDENCE.md` 的逐字记录。
2. **未复跑测试套件**：同上（并发 `build-smoke` 会重写构建树）。38 条是静态计数（本轮实测），14/14 与 `fail 0` 引用执行期记录（`04-03-SUMMARY` L139 / `04-04-SUMMARY` L136）。
3. **豁免扫描不可二次验证**：安装日志已随临时目录清理消失（R-4-04），只能引用证据册里的 `grep -c` 结论。
4. **T-4-13 的「人审发生过」是过程事实**：`APPROVAL:` 行是编排器写下的留痕，能证明「门被以正确形态走过、且演练以它为判据」，不能独立证明那一刻确有一个人在看屏幕——该属性由 `blocking-human` 的工作流语义与 `04-VALIDATION.md` 的 Manual-Only 记录承担。

**与既有 phase 的关系：** Phase 1（`01-SECURITY.md`）、Phase 2（`02-SECURITY.md`）、Phase 3（`03-SECURITY.md`）各自闭合，本 phase 不重开其条目。本 phase 交给 **Phase 5** 的三项新承接（均已写在文档与证据册正文里，不属本寄存器）：
1. `@jiangzhenguo/dsh-codegraph` 的**动态**并存验证（本轮只做了行级静态证明，`docs/MIGRATION.md` L219 与 DRILL-3 L170 都点名为第一复验对象）；
2. 解析级冲突（pnpm ERESOLVE）在本包组合上未触发，换组合需重新观测（DRILL-3 L171）；
3. `rm -rf /tmp/dsh-mig-*`（R-4-01）与真实 `~/.dsh` 的整体迁移（D-02，04-DRILL-EVIDENCE L65）。

---

## Sign-Off

- [x] All threats have a disposition（20 行全部 `mitigate`，无 `accept` / `transfer`）
- [x] Accepted risks documented in Accepted Risks Log（本 phase 无 `accept` 条目，表内已说明理由）
- [x] `threats_open: 0` confirmed（high 及以上的 open 项 = 0；`T-4-06` 的未履行子句以 R-4-01 单列，不改变其 closed 判定）
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-14

## 前向注记：04-05 重写后的定点复核（2026-11-15）

上表各行的 `docs/MIGRATION.md` 行号引用（`L48–61` / `L72` / `L194` / `L488` / `L158` / `L452` 等）取自 **04-05 之前**的文件。04-05 把步骤 1 的硬门重写成可执行的 `# MIG-GATE` 块、把步骤 6 拆成静态 / `COEXIST-DRILL` / `COEXIST-REAL` 三段；`docs/MIGRATION.md` 因此由 584 行长到 863 行（`git diff --numstat d106944..HEAD` = `355 76`），上述行号随之位移。

**这不是一次重新审计**：威胁模型（20 行 `mitigate`，T-4-01..T-4-SC）没有被重新推导，`R-4-01` / `R-4-02` 的登记照旧。以下是 2026-11-15 在 HEAD `7636521` 上对**可机检的那几条 mitigation** 做的定点复核，目的只是确认 04-05 的改动没有削弱它们：

| 断言（对应威胁行） | 当前锚点 | 复跑结果 |
|---|---|---|
| 每个可粘贴 bash 块块首给出 `export DSH_HOME=`；带标记的块为 marker 后**紧接**下一行（T-4-01） | 全文 20 个 bash 围栏，逐块脚本判定 | **0 处违反** |
| 步骤 1 硬门排在 `--uninstall` **之前**（T-4-01 / D-03） | zh `# MIG-GATE` @59 → 首个 `--uninstall` @146；en @492 → @580 | 顺序成立 |
| 退出码即裁决、且块可解析（T-4-16 / WR-04） | `# MIG-GATE` 0/1/2、`# COEXIST-REAL` 0/1、静态段 `exit 1` 为失败信号 | 6 个带标记块 `bash -n` 全绿 |
| 可移植性：正文无本机绝对路径（T-4-05） | `grep -c "/Users/" docs/MIGRATION.md` | **0** |
| 双语同构（T-4-08 的 ⑭ 不变量） | H1=2；两半 `##` 各 3；独立 `---` 1 处；en 半零 CJK | 全部成立 |
| ⑭ 的 per-commit 回路仍在（T-4-12） | `docs-consistency` 14 条；全量串行 `38/38` exit 0 | 成立 |

结论不变：`threats_open: 0`，`status: verified`。行号引用按本仓惯例原样保留（它们是签署当时的记录），以本段作为位移的前向注记；**需要重新推导威胁模型时要跑 `/gsd-secure-phase 04`，本段不能替代它**。