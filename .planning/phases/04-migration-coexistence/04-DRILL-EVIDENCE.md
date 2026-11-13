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