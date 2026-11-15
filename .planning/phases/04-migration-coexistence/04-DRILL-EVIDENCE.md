# 04-DRILL-EVIDENCE.md — Phase 04 MIG-01 迁移演练证据

> **复验对象**：`docs/MIGRATION.md` §① 的命令块（D-01 先卸后装顺序 / D-03 硬门 / D-04 全局 CLI / D-05·D-07 双面复验），即 MIG-01 的唯一可执行载体。
> **演练环境**：临时 `DSH_HOME`（`mktemp -d /tmp/dsh-mig-XXXXXXX`，**恰 20 字符**）+ 临时 `npm_config_prefix`（`/tmp/dsh-mig-npm-XXXXXX`）。真实 `~/.dsh` 全程只读（D-02：真实 home 的整体迁移留 Phase 5）。
> **目标身份**：旧部署 `@opengsd/gsd-core` / **1.16.0**；迁移后插件 `dsh-gsd@1.20.1-1.dsh022`（包内引擎 1.20.1，72 skills）。
> **判据口径**：一切"通过"只认**内容 / 字节数 / 集合**。exit code 一律不作判据——`--uninstall` 源码末尾无条件 `exit 0`，`--dump-config` 在有 bundle 被静默跳过时同样 `exit 0`（两者本轮实测都是 0）。
> **时间**：全表一律 UTC（`date -u +"%Y-%m-%dT%H:%M:%SZ"`）。

## 复验序

对应 `docs/MIGRATION.md` §① 的步骤 0 → 5；本条逐项与实际操作一一对应。

1. **隔离头**：`export DSH_HOME="$(mktemp -d /tmp/dsh-mig-XXXXXXX)"`（断言 `${#DSH_HOME} -eq 20`）+ `export npm_config_prefix="$(mktemp -d …)"`，两者都回显。
2. **造同形 profile**：`dsh --profile web --dump-config`（零网络，建出 base + web-app 模板）。
3. **旧脚本装一遍**：`GSD_VERSION=1.16.0 bash <path-to>/install-gsd-dsh.sh --no-npm-bin`（双保险的另一半是临时 `npm_config_prefix`）。
4. **版本前提断言（必须在卸载之前）**：`$DSH_HOME/gsd-core/VERSION` 与 `node "$DSH_HOME/gsd-core/bin/gsd-tools.cjs" runtime-identity --raw` 都报 `1.16.0`——`gsd-core` 会被下一步删掉，断言放到之后就取不到。
5. **量基线**：旧技能数 / 两个 `SKILL.md` 字节数 / `$DSH_HOME` 字面出现次数 / bridge 块命中。
6. **D-03 硬门**：先看到命中（hits ≥ 1）再进卸载；命中即中止，不是"警告后继续"。
7. **`--uninstall`**：exit 0 不作判据，判据在下一步。
8. **阴性对照 A–D**：旧技能 0 / 受管目录 absent / 旧 hooks 配置无输出 / bridge·sandbox 块无输出；外加**机器级一面**的 `ABSENT` / `PRESENT` 分支。
9. **取 `H0`**：卸载后、装包前 dump 一次，作为本轮标头基线（必须先断言非空，否则 after/before 比较会空洞成立）。
10. **`npm pack` → `dsh plugin --profile web add "$PWD/<tgz>"`**（`npm pack` 会跑 `prepack` = 全量 build + 全量测试，须串行）。
11. **内容比对**（3587 / 3856 / 72）+ **dump 判据**（stderr 0 B、`H1 = H0 + 1`、`# == dsh-gsd` 出现、两 row 各 1）。
12. 每项须留有可观察输出（逐字文案 / 实测数字 / 字节数），**禁止"大概 / 应该 / 目测"式表述**；负向观测必须原样记录并显式标注不得充当通过形态。

## DRILL-1 — 迁移全流程

> 一次到底的演练，中途未改判据、未用 `--force`、未用 `allow-version`。操作在 `/Users/yue.weny/frontWorkspace/gsd-on-dsh/dsh-gsd`（仓根）执行。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 真实 home 只读快照（`ls -1 ~/.dsh/profiles`、`npm ls -g --depth=0`、`git status --porcelain`） | 2026-11-13T17:35:47Z | profiles = `gsd-p3-release gsdtest headless node_modules web`；全局 `@opengsd/gsd-core@1.16.0` 在；仓 `git status` 仅 ` M .planning/STATE.md`（编排器进入执行时的状态推进，非本任务写入） |
| 隔离头 | 2026-11-13T17:35:47Z | `DSH_HOME=/tmp/dsh-mig-BLJoAwJ`（`home_len=20`）；`npm prefix=/tmp/dsh-mig-npm-9HHlnE` |
| `dsh --profile web --dump-config > /dev/null`（模板 profile，零网络） | 2026-11-13T17:35:49Z | exit 0；stdout 1243 行；stderr 0 B；bundles = `@deepseek-ai/dsh-base,@deepseek-ai/dsh-web-app`；`profiles/web/cordis.patch.yml` 217 B，正文是注释头 + 空数组 `[]` |
| `GSD_VERSION=1.16.0 bash <path-to>/install-gsd-dsh.sh --no-npm-bin` | 2026-11-13T17:35:49Z | exit 0；日志 110 行；末行 `DONE (1.16.0 -> /tmp/dsh-mig-BLJoAwJ).`；payload check `{"packageName":"@opengsd/gsd-core","version":"1.16.0"}`；日志含 `(skip) for gsd_run on PATH run: npm i -g @opengsd/gsd-core@1.16.0`（`--no-npm-bin` 生效，未动全局 prefix） |
| **版本前提断言（卸载前）**：`cat "$DSH_HOME/gsd-core/VERSION"` + `node "$DSH_HOME/gsd-core/bin/gsd-tools.cjs" runtime-identity --raw` | 2026-11-13T17:35:59Z | `core_VERSION=1.16.0`；`runtime_identity=1.16.0`；原文 `{"packageName":"@opengsd/gsd-core","version":"1.16.0"}`——两条读数同轮成立，故 3084 / 3195 不是抄来的常量 |
| **基线量取**（技能数 / 两文件字节数 / 路径出现次数 / 受管目录 / hooks json） | 2026-11-13T17:36:00Z | `old_skills=72`、`old_health_bytes=3084`、`old_new_project_bytes=3195`、`home_len=20`；受管目录 `gsd-core=PRESENT hooks=PRESENT scripts=PRESENT`；`gsd-hooks.dsh.json` 3953 B + `.gsd-dsh-managed` 0 B；`$DSH_HOME` 字面路径在 `gsd-health/SKILL.md` 出现 **3** 次、在 `gsd-new-project/SKILL.md` 出现 **7** 次（⇒ 换长度按 `3084-3×(20-L)` / `3195-7×(20-L)` 递减）；`gsd-health/SKILL.md` sha256 前 16 位 `79157bfab6772d67`；`profiles/web/cordis.patch.yml` 549 B |
| **D-03 硬门**：`grep -l 'GSD-DSH-bridge BEGIN' "$DSH_HOME"/profiles/*/cordis.patch.yml` + 逐 profile 数 `gsd-hooks-bridge` 行 | 2026-11-13T17:36:00Z | **命中 `hits=1`**（`profiles/web/cordis.patch.yml`）；逐 profile `gsd-hooks-bridge` 行数 = 1。命中先于卸载被观测到——探测器有牙，硬门才不是摆设 |
| ⚠ **负向观测**：装完旧脚本、卸载前的窗口里跑 `dsh --profile web --dump-config` | 2026-11-13T17:36:00Z | exit 1；stdout **0** 行 / **0** 个标头；stderr **1877 B**，首行为 `file://…/dsh-app-boot/lib/index.js:4745 throw new Error(…: failed to parse …)`（YAMLException）。成因：模板 profile 的 patch 文件是空数组 `[]`，旧脚本在其后再追加一个顶层 `- insert:`，文件不再合法；真实用户 profile 非空时不复现。**该轮输出不得充当通过形态。** |
| `bash <path-to>/install-gsd-dsh.sh --uninstall` | 2026-11-13T17:36:00Z | exit 0（**不作判据**，源码末尾无条件 `exit 0`）；7 行日志逐字：`removed managed gsd-core/`、`removed managed hooks/`、`removed managed scripts/`、`removed managed gsd-hooks.dsh.json`、`stripped GSD-DSH-bridge /tmp/dsh-mig-BLJoAwJ/profiles/web/cordis.patch.yml (backup: …/cordis.patch.yml.stripped-bak)`、`Done. If you also want to drop GSD's global state: rm -rf ~/.gsd`；`no marked block:` 出现 **0** 次（⇒ BEGIN/END 成对被识别）；`.stripped-bak` 文件存在 1 个 |
| **阴性对照 A–D** | 2026-11-13T17:36:00Z | `old_skills=0`；`bridge_hits=0`；`sandbox_hits=0`；受管目录 `gsd-core=absent hooks=absent scripts=absent`；`ls "$DSH_HOME"/gsd-hooks.dsh.json*` 无输出；`skills/` 下条目总数 0；卸后 patch 正文回到注释头 + `[]` |
| **机器级一面**（`$DSH_HOME/cordis.patch.yml`） | 2026-11-13T17:36:00Z | 打印 `machine-level /tmp/dsh-mig-BLJoAwJ/cordis.patch.yml: ABSENT`。**`ABSENT` 是它自己的状态，不是一个 0 计数**——`mktemp -d` 出来的新 home 里根本没有这个文件，裸 `grep -c … \|\| true` 得到的 0 会把它伪装成"干净" |
| **`H0` 基线 dump**（卸载后、装包前） | 2026-11-13T17:36:00Z | `headers=24 lines=1243 stderr_bytes=0`；bundles 仍是 2 项。`H0` 非空且标头 > 0 已先断言，否则 `H1 = H0 + 1` 会是空洞比较 |
| `npm pack` | 2026-11-13T17:36:01Z | exit 0；`prepack` 真跑完：`gates: all passed (A/B/C)`、`copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills`、`ℹ tests 37 / ℹ pass 37 / ℹ fail 0`；产物 `dsh-gsd-1.20.1-1.dsh022.tgz` 4580586 B / 958 files / shasum `4177c792c4dc936e8eab49b7e28f4f4355ba0632` |
| `dsh plugin --profile web add "$PWD/dsh-gsd-1.20.1-1.dsh022.tgz"` | 2026-11-13T17:36:15Z | exit 0；日志 12 行；`+ dsh-gsd 1.20.1-1.dsh022`、`Done in 410ms using pnpm v12.11.2`；bundles 变为 `@deepseek-ai/dsh-base,@deepseek-ai/dsh-web-app,dsh-gsd` |
| **内容比对**（`node -e` 取字节数 + 计数） | 2026-11-13T17:36:16Z | 包内 `gsd-health=3587`、`gsd-new-project=3856`、`skills=72`；包内 `gsd-health/SKILL.md` sha256 前 16 位 `05ef6ef4f451d3e6`（旧源同项 3084 B / `79157bf…` ⇒ 两侧**内容不同**，是新源而非重复）；已装包 version `1.20.1-1.dsh022` |
| **加包后 dump 判据** | 2026-11-13T17:36:16Z | exit 0（**不作判据**）；`stderr_bytes=0`；`headers: before=24 after=25`（`delta=1`）；标头标签分布 `12 × @deepseek-ai/dsh-base` / `11 × @deepseek-ai/dsh-base, patched by @deepseek-ai/dsh-web-app` / `1 × @deepseek-ai/dsh-web-app` / `1 × dsh-gsd`（⇒ **标头数 25 ≠ bundles 数 3**，伪不变量在此自证）；`# == dsh-gsd` 标签出现；`rows: gsd=1 gsd-hooks-bridge=1`；`dup ids` 为空 |
| **豁免扫描**（T-4-04） | 2026-11-13T17:36:16Z | 三个日志（install / add / uninstall）里 `allow-version` + `Exact-version exemption: active` 合计 **0** 次；`--force` **0** 次 |
| **收尾 + 真实 home 零写入** | 2026-11-13T17:36:16Z | 仓根无 `dsh-gsd-*.tgz`；`~/.dsh/profiles` 清单与各 `package.json` 的 mtime 迁移前后 `diff -q` 均无差异（`YES`）；`git status --porcelain` 仍只有 `.planning/STATE.md` |
| ⚠ **采样口径更正（负向）**：收尾时在同一 shell 里跑 `npm ls -g --depth=0` | 2026-11-13T17:36:16Z | 首次采样得 `NOT FOUND`，因为该 shell 仍导出了演练用的临时 `npm_config_prefix`，`npm ls -g` 列的是**临时** prefix。去掉该变量后复测为 `├── @opengsd/gsd-core@1.16.0`，`command -v gsd_run` 仍解析到 `…/lib/node_modules/@opengsd/gsd-core/gsd-core/bin/gsd_run`。**`NOT FOUND` 那次是采样口径错误，不得充当"全局 CLI 被毁"的证据**；真实 prefix 未被写入的结论由复测支撑 |

**结论（DRILL-1 PASS）**：迁移全链条一次跑通——旧源 `72 / 3084 / 3195` 且两条前提（20 字符 home + GSD 1.16.0）同轮断言成立 → 硬门 `hits=1` → 卸载后 `0 / absent / ABSENT` → 包内 `3587 / 3856 / 72` → dump `stderr 0 B`、标头 `24 → 25`、`# == dsh-gsd` 出现、两 row 各 1。正文 `docs/MIGRATION.md` 与本表使用同一组数字（`1.16.0` / 3084 / 3195 / 3587 / 3856 / 72 / 24→25），任一侧改动而另一侧未改即为缺陷。

### 这证不了什么（本段的边界）

- **内容比对**证明"包内那份 `SKILL.md` 确实在这个 profile 的 `node_modules` 里"，**这证不了什么**关于"会话内真的加载了 72 个技能"——磁盘文件 ≠ 宿主消费（Phase 3 CR-01 的同一机制）。`/gsd-health` 只校验 `.planning/` 目录完整性，**不是**迁移判据；宿主侧 catalog 观测属 Phase 5 的 UAT-01。
- **dump 的层存在**证明 bundle 合成进来了，**这证不了什么**关于"hooks 在运行时会拦截"——那需要重启后再触发一次真实拦截。
- **`--dump-config` / `--uninstall` 的 exit code 全程恒 0，这证不了什么**：它们不区分"完成"与"什么都没做"，本轮两者的 exit 都是 0，而两者的真实结果分别由 `stderr` + 标头增量 + row 集合与阴性对照证明。
- **本轮演练**证明的是"临时 home 上这一次通过"，**证不了**真实 `~/.dsh` 会同样一次通过：真实 home 的长度与旧部署版本不受控，字节基线必须由读者自己量（`docs/MIGRATION.md` 步骤 0-B）。

### 本轮未覆盖（留给后续计划）

- `DRILL-2`（HOOK-05 版本错配的运行时症状）→ `04-03`。
- `DRILL-3`（同 profile 与 `dsh-deja` / `dshmarket` / `codegraph` 并存的四判据）→ `04-04`，前置 `blocking-human` 包合法性门。
- 真实 `~/.dsh` 的整体迁移 → Phase 5（D-02）。

## DRILL-2 — 版本错配

> 本节闭合上文「本轮未覆盖」的第 1 项（`DRILL-2` → `04-03`）。两段用途不同、不可互相替代：
> **下面这张表证明的是静态门** —— `build/lib/check-pins.mjs` 的步骤 (j) 能把 pin 漂移挡在 CI 里；
> **它产不出运行时症状**：`build/assets/pins.json` 的 `lines.022.peer` 的唯一消费方就是步骤 (j)，
> 而 DSH 的兼容判定在 `engines.dsh` 在场时立即 `return`、完全不读 `peerDependencies`。
> 运行时症状只能从「已装包自己的 `engines.dsh`」注入（见本节的运行时段）。
>
> 注入点：`build/assets/pins.json` 的 `lines.022.peer`（L12），以**整值**锚定
> `"peer": "@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1"`（该串全文恰 1 次）；`lines.021.peer`
> 是 `>=0.2.1-rc.5 <0.2.2-0`，注入前后均未被误伤。操作在仓根 `dsh-gsd` 执行，时间一律 UTC。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 基线：`node build/lib/check-pins.mjs --offline`（未注入） | 2026-11-13T17:58:48Z | **EXIT=0**；末行 `pins: all consistent (line dsh022)`；stderr 0 B；`build/assets/pins.json` sha256 = `45c643ea3711e998445369c61cf2958c1ea63bc6062a9e143f28e1d5c494a2bb`；`lines.021.peer` = `@deepseek-ai/dsh-skill-filesystem >=0.2.1-rc.5 <0.2.2-0` |
| 静态注入后跑门：`node -e` 把 `lines.022.peer` 改成 `@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.2`（整值锚定，非行号），再跑 `node build/lib/check-pins.mjs --offline` | 2026-11-13T17:58:49Z | 注入后 `lines.022.peer` = `@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.2`，`lines.021.peer` 仍 = `@deepseek-ai/dsh-skill-filesystem >=0.2.1-rc.5 <0.2.2-0`。**EXIT=2**；stdout 0 B；stderr **167 B**，逐字原文（整段，未转述）：`check-pins: peerDependencies @deepseek-ai/dsh-skill-filesystem mismatch — package.json '0.2.2-rc.1' vs pins.json peer '@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.2'` |
| 复原后复跑同一门：`cp /tmp/t1-pins.bak build/assets/pins.json` → `node build/lib/check-pins.mjs --offline` | 2026-11-13T17:58:49Z | **EXIT=0**；末行 `pins: all consistent (line dsh022)`；stderr 0 B；sha256 回到 `45c643ea…a2bb`（与注入前**逐字节相同**）；`git status --porcelain build/assets/pins.json` 为空、`git diff HEAD --stat -- build/assets/pins.json` 为空 ⇒ 注入没有留在工作树里 |

**静态段到此为止。** 下表是同一次演练的**运行时段**（bundle 级 ③ + row 级 ③′），注入点在**已装包自己的 `engines.dsh`** 与 **bridge 包的 `engines.dsh`**，不在 `pins.json`——这正是「静态门产不出运行时症状」的反面取证。全部操作在同一临时 `DSH_HOME`（`/tmp/dsh-mis-wgkIJM`）内；真实 `~/.dsh` 全程只读。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| 隔离头 + 模板 profile：`export DSH_HOME="$(mktemp -d /tmp/dsh-mis-XXXXXX)"`、`export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"`、`dsh --profile web --dump-config > /dev/null 2>&1` | 2026-11-13T18:00:19Z | `DSH_HOME=/tmp/dsh-mis-wgkIJM`；模板 profile 建出 `profiles/web`（零网络）；`dsh.profile.bundles` = `["@deepseek-ai/dsh-base","@deepseek-ai/dsh-web-app"]` |
| `npm pack`（串行；`prepack` 真跑完：build + 全量测试） | 2026-11-13T18:00:33Z | 产物 `dsh-gsd-1.20.1-1.dsh022.tgz`，4.6 MB / **958 files**，shasum `e9944e4a3d598ba053a0aed96bb2679feb9cc983`；日志逐字含 `gates: all passed (A/B/C)`、`fetched @opengsd/gsd-core@1.20.1, copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)`、`ℹ tests 37` / `ℹ pass 37` / `ℹ fail 0` |
| `dsh plugin --profile web add "$PWD/<tgz>"` | 2026-11-13T18:00:34Z | `+ dsh-gsd 1.20.1-1.dsh022`；`Done in 428ms using pnpm v12.11.2`；`dsh.profile.bundles` 变 3 项（前两项 + `dsh-gsd`） |
| **健康态基线（同一 home）**：`dsh --profile web --dump-config > /tmp/m-ok.out 2> /tmp/m-ok.err` | 2026-11-13T18:00:34Z | `headers=25 lines=1255 stderr_bytes=0 bundles=3`；`# == dsh-gsd` 标签 **1** 个；`- id: gsd` **1** 行、`- id: gsd-hooks-bridge` **1** 行。⚠ 标头数 25 **不等于** bundles 数 3（标头按连续来源段打、`dsh-web-app` 就地 patch base 行），两者不比较 |
| **③ bundle 级注入**：`node -e` 把 `$DSH_HOME/profiles/web/node_modules/dsh-gsd/package.json` 的 `engines.dsh` 改成 `>=9.0.0`，再跑 `dsh --profile web --dump-config` | 2026-11-13T18:00:34Z | `injected: EXIT=0 headers=24 lines=1243 gsd_rows=0 skip_lines=1 gsd_label=0`。⇒ **`EXIT=0`**（本 phase 最危险的假绿：命令成功退出，坏的是层）；`H1 = H0 − 1`（25 → 24）；`N1 < N0`（1255 → 1243，**实测差 12 行**，判据只要求严格下降）；`# == dsh-gsd` 标签消失；`- id: gsd` / `- id: gsd-hooks-bridge` 均为 0 行；stderr **恰 1 行 / 526 B**，逐字：dsh: skipping profile bundle "dsh-gsd": Error: Plugin dsh-gsd@1.20.1-1.dsh022 is incompatible with dsh 0.2.2-rc.1: requirements {"engines.dsh":">=9.0.0"}. Running it may cause crashes or data loss. Update the plugin or install a plugin version compatible with this dsh runtime. To accept this risk explicitly, grant the exact-version exemption for dsh-gsd@1.20.1-1.dsh022 on dsh 0.2.2-rc.1 with `dsh plugin allow-version` or the plugin manager, then retry the installation or restart dsh. Exact-version exemption: not active. |
| 复原包内 manifest（`cp /tmp/m-pkg.bak` 回写）后复跑 dump | 2026-11-13T18:00:34Z | `H2 = H0 = 25`、`N2 = N0 = 1255`、stderr **0 B**；`# == dsh-gsd` 标签回到 **1**、两 row 各 **1** 行 ⇒ 症状可逆，修好之后就是这个形态 |
| **③′ row 级尝试（有界 boot）**：`dsh misrow --from-default-profile headless --dump-config` 造 headless 派生 profile → `dsh plugin --profile misrow add "$PWD/<tgz>"`（bundles = base/headless/dsh-gsd）→ 把 `profiles/misrow/node_modules/@deepseek-ai/dsh-hooks-claude-code/package.json` 的 `engines.dsh` 改成 `>=9.0.0`（该包原本无 `engines` 字段，新建）→ `dsh misrow "say ok"` 后台启动、`sleep 30` 后 `kill` | 2026-11-13T18:00:38Z | **`ROWLEVEL MEASURED:`** 逐字：`dsh: disabling profile plugin row "gsd-hooks-bridge": Plugin @deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1 is incompatible with dsh 0.2.2-rc.1: requirements {"engines.dsh":">=9.0.0"}. Running it may cause crashes or data loss. Update the plugin or install a plugin version compatible with this dsh runtime. To accept this risk explicitly, grant the exact-version exemption for @deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1 on dsh 0.2.2-rc.1 with `dsh plugin allow-version` or the plugin manager, then retry the installation or restart dsh. Exact-version exemption: not active.` —— 该行由 **boot 真正触发**（不是 `--dump-config`：后者只走 bundle 级）。boot 的第二行 stderr 是 `dsh: MISSING_CREDENTIAL: llm-deepseek: no API key for provider route "deepseek-official"; …` ⇒ **row 级 gate 先于凭据失败发生**，boot 随后终止，故本条只证明「行级禁用文案在 boot 时出现」，**不证明**完整会话可启动 |
| 收尾：`rm -f "$TGZ"`；真实 `~/.dsh` 零写入核对；工作树核对 | 2026-11-13T18:01:05Z | 仓根无 `dsh-gsd-*.tgz`；`git status --porcelain` 不因本任务新增任何路径；`~/.dsh` 下 `find -newermt` 仅命中本会话自身的 `sessions/` 与 `storages/session_projcache/`（由正在运行的宿主进程更新，**非**演练写入）；演练的全部写入都在 `/tmp/dsh-mis-wgkIJM` 与临时 npm prefix 内。注入的两处 manifest 均已 `cp` 复原（`dsh-gsd` 的 `engines.dsh` 回到 `>=0.2.2-rc.1 <0.3.0-0`，bridge 包回到无 `engines` 字段） |

**运行时段证不了什么（边界）**：注入值是合成的 `>=9.0.0`，不是一次真实的 DSH 升级；`--dump-config` 的 bundle 级判据只证明「层被跳过 + 一行 stderr」，不证明「会话内 skills 全部失效」；row 级那一条虽然实测到，但 boot 随即因缺少 `DEEPSEEK_API_KEY` 终止，故不证明完整会话行为。另：**这段演练没有用 `allow-version`、没有用 `--force`** —— 两种手段都会让坏状态「变绿」，而演练的目的正是把它记录下来。

## 包合法性门裁决（Task 1，`blocking-human`）

本段是 MIG-04 动态段的**准入条件**，不是证据的替代品。两个 `[SUS]`（too-new）包的安装由人过 `checkpoint:human-verify gate="blocking-human"` 裁决；Task 2 的 `automated` 演练块只认**本文件里最后一条** `APPROVAL:` 行（`grep -E "^APPROVAL: (approved|hold)" … | tail -n 1`），因此改判一律在文件末尾追加新行，**绝不编辑旧行**（T-4-19：先 `approved`、后 `hold` 必须能拦住演练）。

| 项 | 读数（本机只读复核，2026-11-14T06:17:59Z） | 取法 |
| --- | --- | --- |
| `dsh-deja` 在用版本 | `0.24.0` | `node -p "require('~/.dsh/profiles/web/node_modules/dsh-deja/package.json').version"` |
| `dshmarket` 在用版本 | `1.73.15` | 同一取法 |
| 两者 `scripts.postinstall` | 均 `none`（即 `undefined`） | `node -p "require(…).scripts?.postinstall ?? 'none'"` |
| `dsh-deja` 源码仓 | `git+https://github.com/vshulcz/deja-vu.git`（`directory: extensions/dsh`） | 包内 `package.json` 的 `repository` |
| `dshmarket` 源码仓 | `git+https://github.com/dsh-market/dsh-market.git` | 同上 |
| 演练写入面 | 仅 `mktemp -d /tmp/dsh-coex-XXXXXX` 的一次性 home | 演练块的隔离头（`export DSH_HOME` + 回显） |

**人工裁决**：`approved`。裁决由编排器向人呈现上表证据后取得（`npmjs.com` 包页面对自动抓取返回 HTTP 403，页面级复核由人完成；发布者 `vshulcz` 即 `deja-vu` 仓主，`dshmarket` 由 `fkysly` 经 GitHub Actions OIDC trusted publisher 发布）。

**版本漂移（如实记录，不许当作 RESEARCH 快照仍然有效）**：`04-RESEARCH.md` 的 Package Legitimacy Audit 是 **2026-11-13 的快照**。本机在 2026-11-14T06:18Z 复核 `registry.npmmirror.com`，`dist-tags.latest` 已前进为 **`dsh-deja@0.24.2`** 与 **`dshmarket@1.73.19`**（两者各自的 `0.24.0` / `1.73.15` 仍在 `versions` 列表内且可解析）。本演练**刻意钉住人审批准的两个确切版本**，所以「too-new」这条 `SUS` 依据相对 latest 已**部分过时**——此行的存在正是为了不让读者把 RESEARCH 的判定读成当前值。

APPROVAL: approved 2026-11-14T06:17:59Z

## DRILL-3 — 并存判据（两段式）

> 本节闭合 DRILL-1「本轮未覆盖」的第 2 项（`DRILL-3` → `04-04`）。前置 = 上一节的包合法性门：两个 `[SUS]` 包的安装经人裁决为 `approved`，裁决行与版本漂移都在上一节。
> **两段不能互相替代**：静态段只证**行级** row id 不相交（零安装、零网络、零写入，真实 `~/.dsh` 全程只读）；动态段才证 DSH 能把 `dsh-gsd` 与两个第三方 bundle **同层合成**。单看任何一段都不足以支撑「无冲突」。
> **判据口径**：一切「通过」只认**集合 / 字节数 / 存在性**；`--dump-config` 的 exit code 一律不作判据（本轮实测恒为 0）。

### 静态段 — 四来源五 id（零安装 · 零网络 · 零写入）

**本段只证行级**：它证明四个 bundle 各自贡献的 row id 两两不相交；它**不能证明**同层合成（见本节末「这证不了什么」）。判据由 `04-04-PLAN.md` Task 2 的 `automated` `node -e` 块现场执行，只做 `fs.readFileSync`，**不对真实 profile 跑 `--dump-config`**（那会重写 `<profile>/cordis.yml`）。

| 来源 | 文件 | 贡献的 row id |
| --- | --- | --- |
| `dsh-gsd`（本仓） | `cordis.patch.yml`（L18 / L20） | `gsd`、`gsd-hooks-bridge` |
| `@jiangzhenguo/dsh-codegraph` | `~/.dsh/profiles/web/node_modules/@jiangzhenguo/dsh-codegraph/cordis.patch.yml`（L13） | `dsh-codegraph` |
| `dsh-deja` | 同目录 `dsh-deja/cordis.patch.yml`（L2） | `deja` |
| `dshmarket` | 同目录 `dshmarket/cordis.patch.yml`（L3） | `dsh-market` |

块的实际输出（逐字）：`coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`
⇒ 并集恰 **5** 个 id、四路两两不相交、无重复；`dsh-gsd` 的两个 id 恰为 `gsd` 与 `gsd-hooks-bridge`，其余三者各恰 1 个。

### 动态段 — 一次性 home 里的同层合成（真的装）

演练块（`04-04-PLAN.md` Task 2 的 `automated` `bash -c`）自行完成：读本文件**最后一条** `APPROVAL:` 并要求是 `approved` → 隔离头 `export DSH_HOME="$(mktemp -d /tmp/dsh-coex-XXXXXX)"` + 回显 → 建模板 profile 并立刻取 `H0` → `npm pack`（`prepack` = build + 全量测试，串行）→ 三次 `dsh plugin --profile web add` → 四条集合判据 → 与本文件的 `COEXIST-DRILL` 行对表。

| 项 | 实测（2026-11-14T06:19Z 起，同一临时 home） | 判据 |
| --- | --- | --- |
| 隔离头 | `DSH_HOME=/tmp/dsh-coex-cj6ISM`；真实 `~/.dsh` 只读 | 一切写入只在临时 home 内 |
| 准入门 | `approval (latest decision): APPROVAL: approved 2026-11-14T06:17:59Z`；`approval gate: latest decision is approved` | 最后一条裁决为 approved（后追加的 `hold` 会推翻先前的 `approved`，T-4-19） |
| `H0`（装包前，模板 profile） | `headers=24 lines=1243 stderr_bytes=0` | `H0` 非空（否则 `H1 > H0` 是空洞比较） |
| `npm pack` | `dsh-gsd-1.20.1-1.dsh022.tgz` 4580718 B / 958 files / shasum `d759d487a55e…`；`gates: all passed (A/B/C)`、`copied 76 trees`、`ℹ tests 38` / `pass 38` / `fail 0` | tarball 由本仓现场构建 |
| `add dsh-deja@0.24.0` | `+ dsh-deja 0.24.0`；`Done in 4.1s using pnpm v12.11.2` | 装到的是人审批准的确切版本 |
| `add dshmarket@1.73.15` | `+ dshmarket 1.73.15`；`Done in 279ms` | 同上 |
| `add "$PWD/<tgz>"` | `+ dsh-gsd 1.20.1-1.dsh022`；`Done in 315ms` | 本仓 tarball 装进同一 profile |
| `dsh.profile.bundles` | `["@deepseek-ai/dsh-base","@deepseek-ai/dsh-web-app","dsh-deja","dshmarket","dsh-gsd"]`，**5** 项 | 三者都在（缺项 = 演练没装成，不是可跳过的情况） |
| 实装版本核对 | `dsh-deja=0.24.0`、`dshmarket=1.73.15`、`dsh-gsd=1.20.1-1.dsh022` | 与人审批准的两个确切版本逐字相符 |
| ① stderr | `stderr_bytes=0` | 0 字节（非空 = 有 bundle 被静默跳过或拒绝） |
| ② 同一 home 的标头前后关系 | `headers=24->27`（`H1 > H0`），且 `^# == .*dsh-gsd` / `…dsh-deja` / `…dshmarket` 三个标签各出现 **1** 次 | 增长 + 逐 bundle 标签**存在**；标签分布 = 12 × `dsh-base` / 11 × `dsh-base, patched by dsh-web-app` / 1 × `dsh-web-app` / 1 × `dsh-deja` / 1 × `dshmarket` / 1 × `dsh-gsd` |
| ③ 逐 id 计数 | `row gsd x1`、`row gsd-hooks-bridge x1`、`row deja x1`、`row dsh-market x1`（`dsh-codegraph x0` —— 本段没装它） | 四个期望 id 各恰 **1** 行 |
| ④ `uniq -d` | 四个 id 上 `uniq -d` 输出 **0** 行 | 为空（非空 = 同名 row id 被静默渲染成两行，这就是 MIG-04 的缺陷本体） |
| dump exit code | `dump exit=0`（即 **EXIT=0**） | **只作记录，永不作通过信号**——有 bundle 被跳过时它同样是 0 |
| 逐字汇总行 | `COEXIST-DRILL bundles=5 headers=24->27 rows=gsd,gsd-hooks-bridge,deja,dsh-market env=temp-home` | 该行由演练块打印，块会拿它与现场重跑逐字对表 |
| 收尾 + 真实 `~/.dsh` 零写入 | 三次运行的临时 home（`/tmp/dsh-coex-cj6ISM` / `/tmp/dsh-coex-lUOWCh` / `/tmp/dsh-coex-LzH9RA`）与仓根 `dsh-gsd-1.20.1-1.dsh022.tgz` 全部删除；真实 `~/.dsh` 的 `profiles` 清单 `diff -q` **无差异**、各 `profiles/*/package.json` 的 mtime+size `diff -q` **无差异**、`find ~/.dsh -newermt 2026-11-14T06:17:00Z` 命中 **0** 项 | 真实 home 零写入（静态段只读、动态段只在临时 home） |

⚠ **标头数 27 ≠ bundles 数 5，且这不是缺陷**：标头按**连续来源段**打，`dsh-web-app` 还会就地 patch `dsh-base` 的行（12 + 11 交替），所以「标头数 == `dsh.profile.bundles` 长度」是伪不变量（T-4-17），健康态下就会红。正确形态是三条同时成立：「同一 home 内 `H1 > H0`」+「每个期望 bundle 的标签**出现**」+「row id 集合各 1 且无重复」。本轮 `27 = 24 + 3`，恰对应新装的三个 bundle 各自打开一个来源段。

**两次运行的关系（记录 → 确认，不是为凑绿）**：`automated` 块第一次跑（`RUN1_EXIT=1`）已把整条演练做完并通过 ①②③④，唯一的红是「本文件还没记录这次运行」——原话 `FAIL: 04-DRILL-EVIDENCE.md does not record this run (COEXIST-DRILL bundles=5 headers=24->27) -- paste the summary line printed above verbatim, then re-run`。因此上表那行是**从现场打印里逐字粘来的**；粘进本文件后复跑得到 `COEXIST-DRILL PASS`（`RUN2_EXIT=0`），文档与证据册定稿后再跑一次仍是 `COEXIST-DRILL PASS`（`RUN3_EXIT=0`，临时 home `/tmp/dsh-coex-LzH9RA`）。数字只能来自现场，块会逐字对表，改写、四舍五入或省略都会红。

**豁免扫描（T-4-04）**：三次 `add` 日志的 `allow-version` / `--force` / `Exact-version exemption` 计数均为 **0**；`npm pack` 日志里唯一的 `allow-version` 命中是**测试用例名**（`⑦ allow-version 风险声明双语存在`），不是一次豁免使用。演练全程没有 `--force`、没有 `--legacy-peer-deps`、没有 `allow-version`。

### 这证不了什么（本段的边界）

- **`@jiangzhenguo/dsh-codegraph` 没有被动态安装**：它的 spec 是 `github:jiangzhenguo/dsh-codegraph#main`（不是 registry 的 exact 版本，冻结不了），本计划不装它。所以它的并存**只在行级被静态证明**（`- id: dsh-codegraph` 与另外四者不相交），这**证不了**它与另外三个 bundle 能同层合成。**这是交给 Phase 5 的第一个复验对象**：真实迁移 `web` profile 时它已经在里面，届时必须重跑本节的四条判据。
- **解析级（pnpm ERESOLVE）在本演练的包组合上未触发**，这**证不了**换一组包不会触发：本节四条判据判的是「行级 + 合成」，判不了 peer 解析冲突。
- **临时 home 的 profile 是模板派生的**（`@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` 两个模板 bundle + 本次三个），这**证不了**用户真实 `web` profile 的依赖图会得出同样结论——真实 profile 里还有旧 bridge 块、`@jiangzhenguo/dsh-codegraph` 与其他 ATC 管理的条目。
- **「装上了没报错」不是判据**：三次 `add` 的 exit code 都是 0，`--dump-config` 的 exit code 也是 0，它们一个都不区分「合成成功」与「静默双行 / 被跳过」。判据只有 ①②③④ 四条集合断言。

## DRILL-4 — 缺口修复的双向复核

> **口径说明（本段是证据册前言的显式例外）**：本文件开头的**前言**（`:6`）写「exit code 一律不作判据」——那条禁令只约束**宿主命令**（`--uninstall` / `--dump-config` / `plugin add`：三者恒 `exit 0`，不区分「完成」与「什么都没做」）。本段记的 `exit=0/1/2` 来自**本仓自定义**的裁决块与失败信号：`docs/MIGRATION.md` 步骤 1 的 `MIG-GATE` 与步骤 6 的 `COEXIST-REAL` 的退出码是**裁决**（与打印的裁决行一一对应）；步骤 6 静态段的 `exit 1` 是 `coexist-static FAIL`（重复 row id）的**失败信号**，不是裁决。它们都不是宿主命令，因此是那条前言规则的**显式例外**。前言与 DRILL-1/2/3 一字未动，例外只写在本段。
> **本轮未重跑 DRILL-1/2/3**（它们是已签名证据，且编排器已删除演练残留）。DRILL-1 里「`hits=1` 之后继续」在今天的文档语义下等价于**演练场的裁决记录**：一次性 home 已被裁决为可弃，故可把实际 profile 名写进 `MIG_DECIDED_PROFILES` 放行。这是把当时的动作显式化，不是对历史结论的改写。
> **一切写入只在 `mktemp -d` 的合成 home 内**；真实 `~/.dsh` 全程零读写（D-02）。合成 home 由三种文件构成：`profiles/<p>/package.json`（`dsh.profile.bundles`）、`profiles/<p>/cordis.patch.yml`、可选 `$DSH_HOME/cordis.patch.yml` 与 `$DSH_HOME/skills/gsd-*`。

### DRILL-4-A — 步骤 1 的 `MIG-GATE`：六类合成 home + 三种裁决

块的取法：从 `docs/MIGRATION.md` 的围栏里原样提取两半各一块（`extract ok: gate@54,419`），逐次 `DSH_HOME=<fixture> bash <block>`；退出码由块自己给出。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| risky（`skills/gsd-health` 在场、`web` 的 `bundles` 无 `dsh-gsd`、`web` 带 bridge 块）+ 未设 `MIG_DECIDED_PROFILES` | 2026-11-15T02:49:30Z | **exit=1**；`GATE: skills=1` / `GATE: profiles=1 decided=-` / `GATE: undecided=web` / `GATE: bridge=web` / `GATE: multirow=-` / `GATE: machine-level=ABSENT` / **`GATE: ABORT undecided=web bridge=web multirow=-`** |
| 同一 risky home + `MIG_DECIDED_PROFILES=web` | 2026-11-15T02:49:30Z | **exit=0**；`GATE: profiles=1 decided=web`、其余同上，末行 **`GATE: PASS`** |
| 同一 risky home + `MIG_DECIDED_PROFILES=headless`（裁决集与命中集**不相交**） | 2026-11-15T02:49:30Z | **exit=1**；`GATE: profiles=1 decided=headless` 而 `GATE: undecided=web` ⇒ 仍是 `GATE: ABORT …`（决策变量不是「设了就行」的开关） |
| clean（`web` 的 `bundles` 含 `dsh-gsd`、无 skills 目录、机器级文件不存在） | 2026-11-15T02:49:31Z | **exit=0**；`GATE: skills=0` / `GATE: undecided=-` / `GATE: bridge=-` / `GATE: multirow=-` / **`GATE: machine-level=ABSENT`** / `GATE: PASS` |
| 机器级脏（`$DSH_HOME/cordis.patch.yml` 含 1 行 `gsd-hooks-bridge`）+ `MIG_DECIDED_PROFILES=web` | 2026-11-15T02:49:31Z | **exit=2**；`GATE: machine-level=DIRTY` + **`GATE: HARD-ABORT machine-level=DIRTY`**（全量裁决也豁免不了机器级那一面） |
| 机器级 `CLEAN`（`cordis.patch.yml` 在、但只有 `- id: atc-mcp`，`gsd-hooks-bridge` 计数 0） | 2026-11-15T02:49:31Z | **exit=0**；**`GATE: machine-level=CLEAN`** / `GATE: PASS`（把「文件存在」一律当 `DIRTY` 的实现在此会 exit 2） |
| multirow（`web` 的 patch 有**两行** `gsd-hooks-bridge`）+ 未设裁决 | 2026-11-15T02:49:31Z | **exit=1**；`GATE: undecided=-` / `GATE: bridge=web` / **`GATE: multirow=web`** / `GATE: ABORT undecided=- bridge=web multirow=web` |
| 同一 multirow home + `MIG_DECIDED_PROFILES=web` | 2026-11-15T02:49:31Z | **exit=0**；`GATE: multirow=web` 仍在，末行 **`GATE: PASS`**（`multirow` 是 profile 级面，由逐 profile 裁决覆盖，不是机器级那一面） |
| 两 profile（`web` 有 `dsh-gsd` + bridge 块；`headless` 无 `dsh-gsd`）+ `MIG_DECIDED_PROFILES=web` | 2026-11-15T02:49:31Z | **exit=1**；`GATE: profiles=2 decided=web` / `GATE: undecided=headless` / `GATE: bridge=web` / `GATE: ABORT undecided=headless bridge=web multirow=-`（判据是「覆盖」，不是「交集非空」；第二个命中 profile 被点名） |
| 同一两 profile home + `MIG_DECIDED_PROFILES=web headless` | 2026-11-15T02:49:31Z | **exit=0**；`GATE: profiles=2 decided=web headless` / 末行 **`GATE: PASS`** |
| 无 `DSH_HOME` 的**交互式** shell：`env -u DSH_HOME bash --noprofile --norc -i < <block>` | 2026-11-15T02:49:31Z | **exit=2**；stdout 逐字为 `DSH_HOME=` 换行 **`GATE: ABORT no-home`** —— `${DSH_HOME:?}` 在交互 shell 里只打印消息、后续照跑，所以这一支必须由块内的无-home 守卫兜住 |
| zh / en 两半对同一 home（risky + `MIG_DECIDED_PROFILES=web`）的 `^GATE:` 行 | 2026-11-15T02:49:31Z | `diff` **无差异**（逐字一致），且全部落在 ASCII 区间；两半的命令逐条同构，差异只在注释语言 |

### DRILL-4-A 这证不了什么

- 裁决变量 `MIG_DECIDED_PROFILES` 是**人写的记录**：本段只证明块能判「命中是否已被记录」，**证不了**记录本身对不对（该迁还是该退役、那个 profile 是不是真的不用 GSD）。
- 六个合成 home 是**手写的 fixture**，**证不了**真实 `~/.dsh` 的 profile 形态（真实 home 里还有 ATC 管理的条目、旧 `.stripped-bak`、`profiles/node_modules` 等）。
- `GATE: machine-level` 只读机器级 patch 文件的文本计数，**证不了**那一层在运行时是否真的被 DSH 求值。
### DRILL-4-B — 步骤 6 的真实迁移形态（`COEXIST-REAL`）：四态

> 块由 `docs/MIGRATION.md` 的围栏原样提取（两半各一块；定稿文档上的提取结果是 `extract ok: real@301,730 drill@275,704`），四态都跑在**同一个**一次性 `DSH_HOME`（`mktemp -d /tmp/dsh-gap2-XXXXXX`）上：模板 profile 由 `dsh --profile web --dump-config` 建出，再 `dsh plugin --profile web add "$PWD/<tarball>"` **只装** `dsh-gsd` 一个 bundle。因此 `dsh-deja` / `dshmarket` 都不在册——正好检验「不在册的 bundle 不要求标签」。

| 操作 | 时间 (UTC) | 输出要点 |
| ---- | ---------- | -------- |
| `npm pack`（串行；`prepack` = 全量 build + 全量测试） | 2026-11-15T02:52:33Z | `gates: all passed (A/B/C)`；`copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills`；**`ℹ tests 38` / `ℹ pass 38` / `ℹ fail 0`**；产物 `dsh-gsd-1.20.1-1.dsh022.tgz`（4.6 MB / 958 files / shasum `ae2a80645751ed811696ca6cd4633e069e7887da`） |
| `dsh plugin --profile web add "$PWD/<tarball>"` | 2026-11-15T02:52:35Z | `+ dsh-gsd 1.20.1-1.dsh022`；`Done in 702ms using pnpm v12.11.2`；`dsh.profile.bundles` 变为 `@deepseek-ai/dsh-base,@deepseek-ai/dsh-web-app,dsh-gsd`（**只新装 1 个**） |
| **healthy**：`DSH_HOME=<tmp> bash <zh block>`（真实形态的原样运行） | 2026-11-15T02:52:35Z | **exit=0**；逐字 `COEXIST-REAL env DSH_HOME=<tmp> profile=web` / `COEXIST-REAL listed dsh-gsd` / **`COEXIST-REAL label dsh-gsd PRESENT`** / `COEXIST-REAL absent dsh-deja` / `COEXIST-REAL absent dshmarket` / **`COEXIST-REAL row gsd 1`** / `COEXIST-REAL row gsd-hooks-bridge 1` / `COEXIST-REAL dup 0` / **`COEXIST-REAL PASS`** |
| 同一 home 上跑 **en** 半的同构块 | 2026-11-15T02:52:35Z | **exit=0**；`^COEXIST-REAL ` 行与 zh 半 **`diff` 无差异**（逐字一致） |
| **注入跳过**：把已装 `dsh-gsd` 的 `package.json` 的 `engines.dsh` 改成 `>=9.0.0`，再跑同一块 | 2026-11-15T02:52:36Z | **exit=1**；逐字 **`COEXIST-REAL label dsh-gsd MISSING`** / **`COEXIST-REAL row gsd 0`** / `COEXIST-REAL row gsd-hooks-bridge 0` / `COEXIST-REAL dup 0` / **`COEXIST-REAL FAIL stderr-bytes:526 label-missing:dsh-gsd row-gsd:0 row-gsd-hooks-bridge:0`** —— 只有 526 B 的 stderr 与「在册但不挂上」被抓住，判据有牙 |
| **恢复**：把 `package.json` 原样写回，再跑同一块 | 2026-11-15T02:52:36Z | **exit=0**；`COEXIST-REAL label dsh-gsd PRESENT` / `row gsd 1` / **`COEXIST-REAL PASS`**（症状可逆） |
| **缺层**：`dsh plugin --profile web remove dsh-gsd` 后跑 en 半的块 | 2026-11-15T02:52:36Z | **exit=1**；`COEXIST-REAL absent dsh-gsd` / **`COEXIST-REAL FAIL required-absent:dsh-gsd`** —— 报的是「不在册」，**不是**「少了一层」；`dsh-deja` / `dshmarket` 仍只打印 `absent`，没有因为不在册而假红 |
| 演练形态的极性与残留 | 2026-11-15T02:52:36Z | 演练块（`# COEXIST-DRILL`）现含 **`H0 + 3`**（增量 = 本次新装 bundle 数；DRILL-3 的 `27 = 24 + 3`），且**不再含任何真实 home 指令**——块内无 `$HOME/.dsh`、无「把第一行换成」；真实 home 只由 `COEXIST-REAL` 的 `export DSH_HOME=` 行点名。全文也不再要求「步骤 4 之后用同一组命令重跑」 |
| 收尾 | 2026-11-15T02:52:36Z | 仓根 `dsh-gsd-*.tgz` 已删（`rm -f`）；临时 `DSH_HOME` 已删；真实 `~/.dsh` 零写入（本段全部写入都在临时 home 内） |

> **两次运行的关系（记录 → 确认）**：上表来自第一次运行；随后为步骤 5 / 0-B 补了两处纯正文说明（块的字节未变），**定稿文档上重跑同一块得到逐字相同的五份输出**（`h` / `he` / `b` / `r` / `n` 归一化 home 路径后 `diff` 无差异，zh 与 en 的 `^COEXIST-REAL ` 行亦无差异），故行号位移不影响本表读数。

### DRILL-4-B 这证不了什么

- 临时 home 的 profile 是**模板派生**的（`dsh-base` + `dsh-web-app` + 本次的 `dsh-gsd`），这**证不了**用户真实 `web` profile 的依赖图会得出同样结论——真实 profile 里还有旧 bridge 块、`@jiangzhenguo/dsh-codegraph` 与其他 ATC 管理的条目。
- `@jiangzhenguo/dsh-codegraph` 仍**没有**被动态安装（它的 spec 是 `github:` 形态、冻结不了确切版本），所以它的并存仍只有行级静态证据。缺口照旧登记为 **G-4 → Phase 5**，本段不声称它已被动态验证。
- 判据只覆盖「清单里说有的层，渲染里是不是真的挂上了」与 row id 集合；它**证不了** hooks 在运行时真的拦截、skills 真的被会话加载（那是 Phase 5 的 UAT-01）。
