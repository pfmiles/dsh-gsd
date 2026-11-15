# dsh-gsd 迁移指南 — 从脚本部署到插件

**给已经用 `install-gsd-dsh.sh` 装过 GSD 的人：怎么从脚本部署换到插件方式。下面的命令块可以整段粘贴，每一步都给出可观察的判据——不需要靠"应该没问题"来收尾。**

本文件**不随 npm 包发布**（`package.json` 的 `files` 九项没有 `docs/`），是 GitHub 读者向文档，与 [BUILD.md](./BUILD.md) 同类；日常安装见 [README.md](./README.md)，构建与发布链见 BUILD.md。§① 是迁移 runbook。

> ⚠ **未经逐 profile 裁决，不要在真实 `~/.dsh` 上跑 `--uninstall`** —— 它不认 profile，会把该 home 下**每一个** profile（`web` / `headless` 等）的技能与 bridge 块一起清掉。
> 如果你就是脚本部署用户：先按**步骤 1** 逐个 profile 裁决去向（命中即中止，不是"警告后继续"），确认之后再从**步骤 0-B**（`export DSH_HOME="$HOME/.dsh"`）开始做真实迁移。**步骤 0-A** 的临时演练场只是本仓库维护者用的隔离路径——它演示判据怎么取，不是你的迁移路径。

## ① 迁移 runbook

### 步骤 0 — 选你的迁移场

迁移场决定**一切写动作落在哪个 home 上**。`DSH_HOME` 是 DSH 三个入口（`dsh plugin add/remove`、`--dump-config`、机器级 patch 层）共同认的根，也是旧脚本的根。**每个可粘贴块都在块首给出 `export DSH_HOME=`**：带标记的块先起一行 `# <标记>`（本步的 `# MIG-GATE`，步骤 6 的 `# COEXIST-*` 同形），紧接着是 `export DSH_HOME=` 与回显；没有标记的块第一行就是 `export DSH_HOME=`。漏掉这一行，命令就落到你正在用的 home 上。

#### 0-A 演练场（本仓库维护者用）

在一次性临时 home 里把整条链路跑一遍。这里多一道 `npm_config_prefix`：**临时 home 不隔离 `npm i -g`**，旧脚本会无条件把 `@opengsd/gsd-core` 装进你的**真实**全局 prefix，所以演练必须同时用 `--no-npm-bin` 与临时的 `npm_config_prefix` 两道保险（前者只在非 upgrade 模式生效）。

```bash
export DSH_HOME="$(mktemp -d /tmp/dsh-mig-XXXXXXX)"
echo "DSH_HOME=$DSH_HOME"
export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"
echo "npm prefix=$(npm config get prefix)"
```

`/tmp/dsh-mig-` 是 13 个字符，后面 7 个 `X` ⇒ `DSH_HOME` 恰好 **20 字符**。这个长度是**判据的一部分**，不是巧合：旧脚本在 staging 时把 `$DSH_HOME` 的字面路径写进 `SKILL.md`，所以旧部署侧的字节数随 home 长度线性变化——20 字符 home 下 `gsd-health/SKILL.md` 是 **3084 B**、`gsd-new-project/SKILL.md` 是 **3195 B**（这两个文件里该路径分别出现 3 次 / 7 次）。换成长度 `L` 的 home，期望值就是 `3084 - 3×(20-L)` / `3195 - 7×(20-L)`；**不要**把 3084 / 3195 当固定资产，也不要在量到 3081 时改小期望值去凑绿。

另一条前提是**旧部署的 GSD 版本**：上面那组基线是 `@opengsd/gsd-core@1.16.0` 的产物（上游 `SKILL.md` 本身就随版本变化）。所以演练把版本钉成 `1.16.0`，并在卸载**之前**断言两个读数都等于它——`gsd-core` 会在卸载时被删掉，断言放到之后就取不到了。

演练场里的步骤 1 **必然命中**（新建 home 的 `web` 还没有插件、旧脚本刚把 bridge 块装上）：一次性 home 的整个 home 已经是「可弃」的裁决，所以放行方式是把实际 profile 名写进 `MIG_DECIDED_PROFILES`（见步骤 1）。

#### 0-B 真实迁移（脚本用户用）

**先执行步骤 1 的逐 profile 裁决，命中即中止**：`--uninstall` 是机器级的，一次会波及该 home 下所有 profile，真实 home 上没有"只迁一个 profile"这种安全形态。 裁决结果**逐个 profile** 写进 `MIG_DECIDED_PROFILES`（不得把它当默认值）。

这一步**不**隔离 npm 全局 prefix——真实迁移的第 3 步就是要卸掉你自己的全局 CLI。

```bash
export DSH_HOME="$HOME/.dsh"
echo "DSH_HOME=$DSH_HOME"
```

真实 home 的长度与旧部署的版本都**不由本文档决定**，所以 3084 / 3195 不是你的期望值：**在卸载之前自己量一次基线**（`wc -c` 记下两个 `gsd-*.md` 的值即可），迁移后只与"你自己量到的那个数"比较，命令见步骤 5。

**`H0` 的取法：步骤 2 之后、步骤 4 之前 dump 一次**（那时 `dsh-gsd` 还没装），它就是步骤 5 与步骤 6 演练形态共用的「加包前」基线——这个取法对两者**同等适用**，不是演练专用；真没取到就降级：跳过增量判据，只用步骤 5 的 stderr / 标签 / row 集合与步骤 6 的真实迁移形态（`COEXIST-REAL`，它不比较增量）。另外 `--dump-config` 会重写 `<profile>/cordis.yml`（profile 不存在时还会把它建出来），迁移期它已经是动作的一部分，**不要**把它当只读探针。

### 步骤 1 — 硬门：先裁决每个 profile 的去向

**命中即中止。** 判据是**两个面**：面 1（技能）与面 2（hooks）。两面都要，因为两种失败模式不同——残留技能的后果是内容串味（新技能用旧正文），残留 bridge 块的后果是双 bridge 重复拦截。机器级 patch 层优先级高于 profile 层，旧脚本**不扫**它，因此必须单独一面。

**面 1 由两个可观察构成**（它不是「技能数 > 0 就报警」的开关：脚本装过的 home 里 `$DSH_HOME/skills/gsd-*` 必然非空，按那个判法 0-A 与 0-B 全都过不去）：

- **`GATE: skills=<N>`** —— `$DSH_HOME/skills/gsd-*` 的条目数。它是**基线**，也是步骤 5 项 A「卸载后为 0」赖以成立的前提：`N=0` 时那条阴性对照是空洞的。面 1 与步骤 5 项 A 是**同一个量的前后两点**（卸载前 > 0、卸载后 0）；跳过步骤 1 的读者拿不到基线，那个 `0` 也就证明不了「旧源已死」。
- **`GATE: undecided=<profile…>`** —— `dsh.profile.bundles` 里没有 `dsh-gsd` 的那些 profile。它们此刻仍只靠 home 级 `skills/gsd-*` 拿到 GSD 技能，正是 D-03 第二触发条件（「或仍依赖 `~/.dsh/skills` 下的 gsd-*」）的机器形态。

**为什么面 1 必须在卸载前判**：旧脚本对 `$DSH_HOME/skills/gsd-*` 是**无条件** `rm -rf`、不查 marker（见步骤 2）；这个动作一旦执行，双源就在场，再测只能记录、不能中止。

```bash
# MIG-GATE：步骤 1 的硬门（只读）。本块自己的退出码就是裁决：0 放行 / 1 命中未裁决 / 2 硬中止。
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
(
  # 宿主的 --uninstall 恒 0、不作判据；runbook 里只有本块与步骤 6 的 COEXIST-REAL 以退出码为判据。
  # 面 1a = skills 基线；面 1b = 仍只靠 home 级技能拿到 GSD 的 profile；面 2a = 旧 bridge 块；
  # 面 2b = 第二个 gsd-hooks-bridge 行；machine-level = 机器级 patch 层三态。
  # 无-home 守卫：${DSH_HOME:?} 只在非交互 shell 里中止；贴进交互式 shell 时它只打印消息、后续照跑，
  # 于是空 home 会得到空命中集并打印 GATE: PASS。守卫把这一支变成硬中止（exit 2）。
  [ -n "${DSH_HOME:-}" ] || { echo "GATE: ABORT no-home"; exit 2; }
  # 面 1a：旧源技能计数（步骤 5 项 A 的基线）
  SK=$(ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l | tr -d ' ')
  echo "GATE: skills=$SK"
  # 逐 profile 扫：跳过 node_modules，只处理含 package.json 或 cordis.patch.yml 的目录
  U=""; B=""; M=""; N=0
  for d in "$DSH_HOME"/profiles/*/; do
    [ -d "$d" ] || continue
    p=$(basename "${d%/}")
    [ "$p" = "node_modules" ] && continue
    [ -f "$d/package.json" ] || [ -f "$d/cordis.patch.yml" ] || continue
    N=$((N+1))
    # 面 1b：用 node 读清单，不用 grep 近似（dependencies 里可能仍留着该键而 bundles 已不含它）
    if [ -f "$d/package.json" ]; then
      if ! node -e 'const j=require(process.argv[1]);const b=(j.dsh&&j.dsh.profile&&j.dsh.profile.bundles)||[];process.exit(b.includes("dsh-gsd")?0:1)' "$d/package.json" >/dev/null 2>&1; then
        U="$U $p"
      fi
    fi
    if [ -f "$d/cordis.patch.yml" ]; then
      # 面 2a：旧 bridge 块
      grep -q 'GSD-DSH-bridge BEGIN' "$d/cordis.patch.yml" 2>/dev/null && B="$B $p"
      # 面 2b：第二行 gsd-hooks-bridge（两步式取数：零匹配时 grep -c 先打印 0 再以 1 退出）
      HT=$(grep -c 'gsd-hooks-bridge' "$d/cordis.patch.yml" 2>/dev/null || true)
      [ "${HT:-0}" -gt 1 ] && M="$M $p"
    fi
  done
  U=$(printf '%s' "$U" | sed -e 's/^ *//' -e 's/ *$//')
  B=$(printf '%s' "$B" | sed -e 's/^ *//' -e 's/ *$//')
  M=$(printf '%s' "$M" | sed -e 's/^ *//' -e 's/ *$//')
  DEC=$(printf '%s' "${MIG_DECIDED_PROFILES:-}" | sed -e 's/^ *//' -e 's/ *$//' -e 's/  */ /g')
  echo "GATE: profiles=$N decided=${DEC:--}"
  echo "GATE: undecided=${U:--}"
  echo "GATE: bridge=${B:--}"
  echo "GATE: multirow=${M:--}"
  # 机器级一面：三态必须分开（ABSENT / CLEAN / DIRTY）
  ML="$DSH_HOME/cordis.patch.yml"
  if [ ! -e "$ML" ]; then
    MC=ABSENT
  else
    HT=$(grep -c 'gsd-hooks-bridge' "$ML" 2>/dev/null || true)
    if [ "${HT:-0}" -gt 0 ]; then MC=DIRTY; else MC=CLEAN; fi
  fi
  echo "GATE: machine-level=$MC"
  # 机器级脏没有豁免：它没有 profile 可裁决，只能手工清理
  if [ "$MC" = "DIRTY" ]; then echo "GATE: HARD-ABORT machine-level=DIRTY"; exit 2; fi
  # 命中集 = undecided ∪ bridge ∪ multirow（去重后的 profile 名集合），必须被 MIG_DECIDED_PROFILES 完整覆盖
  HITS=$(printf '%s %s %s\n' "$U" "$B" "$M" | tr ' ' '\n' | sed '/^$/d' | sort -u)
  MISS=""
  for h in $HITS; do
    case " $DEC " in *" $h "*) ;; *) MISS="$MISS $h" ;; esac
  done
  if [ -n "$MISS" ]; then echo "GATE: ABORT undecided=${U:--} bridge=${B:--} multirow=${M:--}"; exit 1; fi
  echo "GATE: PASS"
  exit 0
)
```

**六行状态 + 三种裁决。** 块内机器可读输出**一律 ASCII**（解释留在这里，这样 zh / en 两半对同一个 home 会产出逐字相同的 `GATE:` 行）：`GATE: skills=<N>`（面 1a 基线）、`GATE: profiles=<n> decided=<list|->`、`GATE: undecided=<list|->`（面 1b）、`GATE: bridge=<list|->`（面 2a）、`GATE: multirow=<list|->`（面 2b：某个 profile 出现了第二行 `gsd-hooks-bridge`）、`GATE: machine-level=<ABSENT|CLEAN|DIRTY>`；裁决行是 `GATE: PASS` / `GATE: ABORT …` / `GATE: HARD-ABORT machine-level=DIRTY`，退出码依次 0 / 1 / 2。`-` 表示该集合为空。

**机器级一面为什么要分三支**：`ABSENT`（文件不存在）、`CLEAN`（文件在，但 `gsd-hooks-bridge` 计数为 0——真实健康 home 的根级 `cordis.patch.yml` 常常只有 ATC 的 MCP 块，**必须放行**）、`DIRTY`（计数 > 0）。裸 `grep -c … || true` 在文件缺失时同样返回 0，它证明的是「文件不存在」，不是「文件干净」；把「文件存在」一律当 `DIRTY`，又会在真实健康 home 上 exit 2。**`DIRTY` 没有豁免**：`--uninstall` 根本不扫机器级层，留在那儿的 bridge 块优先级更高、卸载后仍然生效，而这一面没有 profile 可裁决、只能手工清理，所以一律 `exit 2`。

**`MIG_DECIDED_PROFILES` 是逐 profile 的决定记录，不是放行开关。** 命中集 = `undecided ∪ bridge ∪ multirow`（**去重后的 profile 名集合**；三面同权、都是 profile 级，所以都能被逐 profile 的裁决覆盖）。命中集必须被它**完整**覆盖；覆盖不全仍 `exit 1`——命中集有两个 profile 而只裁决其中一个，同样 `exit 1`（判据是「覆盖」，不是「交集非空」）。机器级脏不适用它。形态示例：`MIG_DECIDED_PROFILES="web headless"`。命中后的动作：先决定每个 profile 的去向（迁移它 / 退役它 / 它本来就不用 GSD），把名字写进来，重跑步骤 1 直到 `GATE: PASS`。**`multirow`（第二个 `gsd-hooks-bridge` 行）也是 profile 级面**——它与 bridge 块一样由逐 profile 的裁决覆盖，**不是机器级那一面**、也没有第三个退出码。

**`GATE: PASS` 只表示每个命中 profile 都有记录，不表示记录是对的。** 记录是人写的；本块判的是「是否已裁决」，判不了「裁决对不对」——与 DRILL-4 的「这证不了什么」同口径。

**为什么本块的退出码可以作判据**：runbook 里**恰有两个**块以退出码为判据——本块与步骤 6 的真实迁移形态 `COEXIST-REAL`。两者的退出码都由我们定义、且与打印的裁决行一一对应。宿主的 `--uninstall` / `--dump-config` / `plugin add` 仍恒 0，**不作**判据。

**0-A 演练场里这一步必然命中**（新建 home 的 `web` 还没有插件、旧脚本刚把 bridge 块装上）：一次性 home 的整个 home 已经被裁决为可弃，所以放行方式是把实际 profile 名写进 `MIG_DECIDED_PROFILES`（例如 `MIG_DECIDED_PROFILES=web`）。这是把 DRILL-1 里「命中后继续」的动作**显式化**，不是绕过。**0-B 则必须先做逐 profile 裁决再写这个变量**，且**不得**把它当默认值。

> 探测命令一律带 `2>/dev/null` 或 `|| true`：不存在的 profile 名会让 `dsh` 抛栈而不是打印一行提示。

### 步骤 2 — 卸旧部署

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
bash <path-to>/install-gsd-dsh.sh --uninstall
```

`--uninstall` **不认 profile**：它对 `$DSH_HOME/skills/gsd-*` 无条件 `rm -rf`；对 `$DSH_HOME/{gsd-core,hooks,scripts}` 按 `.gsd-dsh-managed` marker 删；对**所有** `profiles/*/cordis.patch.yml` 剥掉 `# GSD-DSH-bridge BEGIN…END` 与 `# GSD-DSH-sandbox BEGIN…END`，每个被剥过的文件留一份同名 `.stripped-bak` 备份。

**旧脚本不做这四件事**——runbook 的义务是把它们单列，而不是等你迁移完才自己发现：

1. **不碰全局 npm 包**：`@opengsd/gsd-core` 与 `$prefix/bin/gsd_run` 都留着 → 交步骤 3。
2. **不碰 `~/.gsd`**：只打印一句提示。那是 GSD 的全局状态（如 `research-cache`），是否清理由你决定。
3. **不碰机器级 `$DSH_HOME/cordis.patch.yml`**：它只扫 `profiles/*/cordis.patch.yml`。若你曾把 bridge 块手工放进机器级层，卸载后它仍在，而它的优先级更高。
4. **不碰 profile 里 hooks 的两条直连依赖**（`@deepseek-ai/dsh-hook-protocol`、`@deepseek-ai/dsh-hooks-claude-code`）：这是非阻断残留，`dsh-gsd` 自己也依赖它们，**不要手改清单**。

⚠ **exit code 在这里不作判据**：`--uninstall` 源码末尾无条件 `exit 0`，连"一个块都没剥"也会打印成功；`set -euo pipefail` 也被 `|| true` 兜住。判据只认步骤 5 的阴性对照输出。

### 步骤 3 — 卸全局 CLI

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
npm uninstall -g @opengsd/gsd-core
# 残留证据：还能解析到它，说明还有人会把引擎指到旧版本
command -v gsd_run 2>/dev/null || echo "no gsd_run on PATH"
```

**为什么默认卸掉**：留着它 = 留一个落后若干小版本的引擎，任何仍按旧文档敲 `gsd_run` 的人都会静默跑错版本。

**为什么卸了也不损伤插件态**：包内 skills 的 adapter 写的是 `node <GSDROOT>/gsd-core/bin/gsd-tools.cjs` **绝对路径**，不依赖 PATH；只有旧 skills 才走 PATH 上的 `gsd_run`。演练里也一样：所有引擎调用都用绝对路径，`command -v gsd_run` 的输出只作**残留证据**，不作"可用"证据。

### 步骤 4 — 装插件

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
# 演练形态：本仓自己打出的 tarball，必须给绝对路径
dsh plugin --profile web add "$PWD/dsh-gsd-<version>.tgz"
# 真实迁移形态：registry 上的精确版本号
dsh plugin --profile web add dsh-gsd@<version>
```

两种 spec 的判定路径**不同**：`.tgz` 先真装进 `node_modules` 再判定，兼容门不满足时回滚 `package.json` / `pnpm-lock.yaml`，但 `node_modules` 会留在盘上；registry / 目录 spec 走 preflight，装之前就拒绝。演练用的是前者。

### 步骤 5 — 复验：阴性对照 + 内容比对

两条判据**必须同时成立**：只做阴性对照，插件坏掉也能"通过"（0 个技能当然满足"旧源为空"）；只做内容比对，无法排除混源。两条都成立，才同时证明"旧源已死"与"新源是真源"。

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
P=web
# A 阴性对照：旧源必须死（期望 0）。这就是步骤 1 的 GATE: skills=<N> 那个量的「后一点」——
# 没有卸载前量到的基线，这个 0 也证明不了「旧源已死」
ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l
# B 旧受管目录（期望三行全 absent）
for d in gsd-core hooks scripts; do
  printf '%-10s %s\n' "$d" "$([ -e "$DSH_HOME/$d" ] && echo PRESENT || echo absent)"
done
# C 旧 hooks 配置与 marker（期望无输出）
ls "$DSH_HOME"/gsd-hooks.dsh.json* 2>/dev/null
# D 面 2：bridge / sandbox 块（期望无输出）
grep -l -e 'GSD-DSH-bridge BEGIN' -e 'GSD-DSH-sandbox BEGIN' "$DSH_HOME"/profiles/*/cordis.patch.yml 2>/dev/null
# E 机器级一面：ABSENT 与 PRESENT-and-clean 是两种状态（两步式取数，零匹配时不会多打一个 0）
if [ -e "$DSH_HOME/cordis.patch.yml" ]; then
  HT=$(grep -c 'gsd-hooks-bridge' "$DSH_HOME/cordis.patch.yml" 2>/dev/null || true)
  echo "machine-level: PRESENT gsd-hooks-bridge=${HT:-0}"
else
  echo "machine-level: ABSENT"
fi
# 内容比对：新源必须是包内那份。字节数判别器零外部依赖，优先于哈希
PKG="$DSH_HOME/profiles/$P/node_modules/dsh-gsd"
node -e 'for (const f of process.argv.slice(1)) console.log(require("fs").statSync(f).size, f)' \
  "$PKG/skills/gsd-health/SKILL.md" "$PKG/skills/gsd-new-project/SKILL.md"
ls -d "$PKG"/skills/gsd-* | wc -l
# 层是否挂上：同一 home 的前后关系，不是「标头数 == bundles 数」
dsh --profile "$P" --dump-config > /tmp/mig-dump.out 2> /tmp/mig-dump.err
wc -c < /tmp/mig-dump.err                      # 期望 0：非空 = 有 bundle 被静默跳过
grep -c '^# == ' /tmp/mig-dump.out             # 加包后 = 加包前 + 1（本次新装 1 个 bundle：步骤 4 只加 dsh-gsd；与步骤 6 演练形态的 +3 同一口径）
grep -q '^# == dsh-gsd' /tmp/mig-dump.out && echo "dsh-gsd layer present"
grep -cE '^\s*- id: gsd$' /tmp/mig-dump.out              # 期望 1
grep -cE '^\s*- id: gsd-hooks-bridge$' /tmp/mig-dump.out # 期望 1
```

判据是**内容、字节数与集合**，没有一条依赖 exit code：`--dump-config` 在有 bundle 被跳过时仍然 `exit 0`（stdout 少 3 行、stderr 一行、退出码不变），`--uninstall` 更是恒 0。

**标头数只能与"同一个 home 自己的加包前基线"比。** "`^# == ` 标头数 == `dsh.profile.bundles` 长度"是伪不变量：标头按**连续来源段**打，`dsh-web-app` 还会就地 patch `dsh-base` 的行，于是标签交替出现。演练实测：2-bundle 的模板 profile 就有 **24** 个标头 / 1243 行；装上 `dsh-gsd`（第 3 个 bundle）后 **25** 个标头 / 1255 行。正确形态是"同一 home 内 `H1 = H0 + 1`"加"每个期望 bundle 的标签**出现**"，再加 row id 集合断言（各 1 行、无重复）。

⚠ **演练环境的两处限制**（写在这里，免得读者以为是自己的错）：

- **装完旧脚本、还没卸载**这段窗口里，`--dump-config` 会以 YAML 解析失败告终（演练实测：exit 1、0 个标头、stderr **1877 B**）。原因：模板 profile 的 `cordis.patch.yml` 内容是空数组 `[]`，旧脚本会在其后**再追加**一个顶层 `- insert:`，于是文件不再合法。真实用户的 profile 里该文件非空（首个条目通常是一条 `- id:` 行），追加才合法。**处置：不要在这个窗口里 dump。**
- **真实 home 上不要用 `--dump-config` 做"只读"探测**：它至少会重写 `<profile>/cordis.yml`，profile 不存在时还会把它建出来。真实 home 的只读探针只用 `ls` / `grep` / `node -e`。

**关于豁免**：版本不匹配时宿主给出的 `allow-version` 是**显式风险豁免**（精确 name@version × 精确 DSH 版本 + 接受风险），它会写进 `<profile>/compatibility.json` 并掩盖真实的版本不匹配。演练里它的出现次数必须是 **0**；它也**不是**让兼容门变绿的手段。`--force` 属 pnpm 的解析开关，同理——装着不兼容的包只会在 load 层被跳过，得到"装上了但没生效"的假象。

### 步骤 6 — 并存自检

同一个 profile 里装 `dsh-gsd` 之后，还能不能和别的插件共存？判据**不是**「装上了、没报错、能跑」：DSH 对同名 row id **没有任何冲突仲裁**，两个 bundle 贡献同一个 id 时会静默产生两行（`add` exit 0、零 warning、`--dump-config` 也 exit 0）。所以「无冲突」是一条**集合断言**——下面**三段**各有分工：**静态段**（零安装，只证行级不相交）与**真实迁移形态 `COEXIST-REAL`**（零安装，判 listed ⇔ labeled 与 row 集合）是**真实迁移要跑的两段**；中间的**演练形态 `COEXIST-DRILL`**（真装三个 bundle）只在**一次性 home** 里演示同层合成，**真实迁移不跑**它。

**静态段：零安装的静态比对。** 只读四个 `cordis.patch.yml`（来源一律从 `$DSH_HOME/profiles/<p>/node_modules/...` 取，不依赖 cwd = 仓根），断言它们贡献的 row id 两两不相交（本仓两个 + `codegraph` / `deja` / `dsh-market`）。这一段只证明**行级**不撞；某个来源的包不在盘上时打印 `MISSING: <pkg>` 并继续，只剩一个来源时打印 `coexist-static SKIPPED` 并声明**这不是通过**。本块只读，读的就是 `DSH_HOME` 指向的那个 home。

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
node -e '
const fs=require("fs"), p=require("path");
const home=process.env.DSH_HOME;
const web=p.join(home,"profiles","web");
const src={
  "dsh-gsd":p.join(web,"node_modules","dsh-gsd","cordis.patch.yml"),
  "codegraph":p.join(web,"node_modules","@jiangzhenguo","dsh-codegraph","cordis.patch.yml"),
  "deja":p.join(web,"node_modules","dsh-deja","cordis.patch.yml"),
  "dshmarket":p.join(web,"node_modules","dshmarket","cordis.patch.yml")
};
const ids={}; let n=0;
for (const [k,f] of Object.entries(src)) {
  if (!fs.existsSync(f)) { console.log("MISSING: "+k); continue; }
  n++;
  const s=[];
  for (const l of fs.readFileSync(f,"utf8").split("\n")) {
    const m=/^\s*-\s+id:\s*(\S+)\s*$/.exec(l); if (m) s.push(m[1]);
  }
  ids[k]=s;
}
if (n<2) { console.log("coexist-static SKIPPED (fewer than two sources present -- this is not a pass)"); process.exit(0); }
const all=Object.values(ids).flat();
const dup=all.filter((x,i)=>all.indexOf(x)!==i);
if (dup.length) { console.log("coexist-static FAIL duplicate row ids: "+dup.join(",")); process.exit(1); }
console.log("coexist-static ok: "+all.join(" "));
'
```

**演练形态（`COEXIST-DRILL`）：在一次性 home 里真装一遍。** 把三个 bundle 真装进同一个 profile，再对 `--dump-config` 的输出做集合断言。增量判据只有一个口径——**增量 = 本次新装 bundle 数**：本块新装 3 个 ⇒ `H1 = H0 + 3`（DRILL-3 实测 `27 = 24 + 3`）；步骤 5 新装 1 个 ⇒ 同一口径的 `+1`。`H0` 必须在装任何包之前取且非空，否则比较空洞成立。

```bash
# COEXIST-DRILL：演练形态（一次性 home；真装三个 bundle）。真实迁移用下面的 COEXIST-REAL——零安装、不比较增量。
export DSH_HOME="$(mktemp -d /tmp/dsh-coex-XXXXXX)"
echo "DSH_HOME=$DSH_HOME"
export P=web
dsh --profile "$P" --dump-config > /tmp/c-l0.out 2> /tmp/c-l0.err  # 装包前先取 H0
H0=$(grep -c '^# == ' /tmp/c-l0.out)
dsh plugin --profile "$P" add dsh-gsd@<version>
dsh plugin --profile "$P" add dsh-deja@<version>
dsh plugin --profile "$P" add dshmarket@<version>
dsh --profile "$P" --dump-config > /tmp/c-dump.out 2> /tmp/c-dump.err
wc -c < /tmp/c-dump.err            # ① stderr 期望 0 字节：非空 = 有 bundle 被静默跳过
H1=$(grep -c '^# == ' /tmp/c-dump.out)
echo "headers $H0 -> $H1"           # ② 期望 H1 = H0 + 3（本次新装 3 个 bundle；DRILL-3 实测 27 = 24 + 3）
for p in dsh-gsd dsh-deja dshmarket; do
  grep -qE "^# == .*$p" /tmp/c-dump.out || echo "MISSING layer: $p"   # ②每个期望 bundle 的标头标签必须出现
done
for id in gsd gsd-hooks-bridge deja dsh-market; do
  printf '%s x%s\n' "$id" "$(grep -cE "^[[:space:]]*- id: $id$" /tmp/c-dump.out)"   # ③ 期望各恰 1
done
grep -oE '^[[:space:]]*- id: (gsd|gsd-hooks-bridge|deja|dsh-market)$' /tmp/c-dump.out \
  | sed -E 's/.*id: //' | sort | uniq -d   # ④ 期望空 = 没有同名 row 被渲染成两行
```

**真实迁移形态（`COEXIST-REAL`）：零安装的配对判据。** 真实迁移的 `dsh-gsd` 由步骤 4 装上，三条 `add` 在这里全是 no-op ⇒ 增量恒 0，所以**真实迁移形态不比较增量**：`H1 > H0` 在健康 home 上必然为假；反过来若 profile 本来没有 deja/dshmarket，增量还会以与「同层合成」无关的理由误绿（DRILL-3 的 `27 = 24 + 3` 已把机制钉死：增量恒等于新装 bundle 数，而真实迁移的新装数是 0）。真实形态零安装，期望集从 home 自己的清单推出：`dsh-gsd` **必须在** `dsh.profile.bundles` 里（缺 = 步骤 4 没做成），对三个关注 bundle 逐个判 **listed ⇔ labeled**（在册则必须有标头标签 `# == <bundle>` 或 `# == …, patched by <bundle>`；不在册则打印 `COEXIST-REAL absent <bundle>` 并跳过——不在册的 bundle 不要求标签，否则没有装 deja/dshmarket 的真实 profile 会假红），在册 bundle 的期望 row id 各恰 1 行（`dsh-gsd` → `gsd` + `gsd-hooks-bridge`；`dsh-deja` → `deja`；`dshmarket` → `dsh-market`），这些 id 上 `uniq -d` 为空，且 dump 的 stderr 为 0 字节。缺 `dsh-gsd` 时以 `required-absent:dsh-gsd` 报红——报的是「不在册」，不是「少了一层」。

```bash
# COEXIST-REAL：真实迁移形态（零安装）。真实 home 只由下面这一行 export 点名；本块不装任何东西。
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
(
  # 期望集来自 $DSH_HOME/profiles/<p>/package.json 的 dsh.profile.bundles（listed ⇔ labeled），与「刚装了几个」无关。
  [ -n "${DSH_HOME:-}" ] || { echo "COEXIST-REAL FAIL no-home"; exit 1; }
  P=${P:-web}
  echo "COEXIST-REAL env DSH_HOME=$DSH_HOME profile=$P"
  dsh --profile "$P" --dump-config > /tmp/c-real.out 2> /tmp/c-real.err
  R=""
  SB=$(wc -c < /tmp/c-real.err | tr -d ' ')
  [ "$SB" -eq 0 ] || R="$R stderr-bytes:$SB"
  MAN="$DSH_HOME/profiles/$P/package.json"
  LISTED=$(node -e 'const j=require(process.argv[1]);const b=(j.dsh&&j.dsh.profile&&j.dsh.profile.bundles)||[];console.log(b.join(" "))' "$MAN" 2>/dev/null || true)
  case " $LISTED " in *" dsh-gsd "*) ;; *) R="$R required-absent:dsh-gsd" ;; esac
  for b in dsh-gsd dsh-deja dshmarket; do
    case " $LISTED " in
      *" $b "*)
        echo "COEXIST-REAL listed $b"
        if grep -qE "^# == (.*, )?${b}(, patched by .*)?$" /tmp/c-real.out; then
          echo "COEXIST-REAL label $b PRESENT"
        else
          echo "COEXIST-REAL label $b MISSING"
          R="$R label-missing:$b"
        fi
        ;;
      *) echo "COEXIST-REAL absent $b" ;;
    esac
  done
  for pair in dsh-gsd:gsd dsh-gsd:gsd-hooks-bridge dsh-deja:deja dshmarket:dsh-market; do
    b=${pair%%:*}; id=${pair##*:}
    case " $LISTED " in
      *" $b "*)
        n=$(grep -cE "^[[:space:]]*- id: $id$" /tmp/c-real.out || true)
        echo "COEXIST-REAL row $id ${n:-0}"
        [ "${n:-0}" -eq 1 ] || R="$R row-$id:${n:-0}"
        ;;
    esac
  done
  ND=$(grep -oE '^[[:space:]]*- id: (gsd|gsd-hooks-bridge|deja|dsh-market)$' /tmp/c-real.out | sed -E 's/.*id: //' | sort | uniq -d | wc -l | tr -d ' ')
  echo "COEXIST-REAL dup $ND"
  [ "$ND" -eq 0 ] || R="$R duplicate-row-ids:$ND"
  if [ -n "$R" ]; then echo "COEXIST-REAL FAIL$R"; exit 1; fi
  echo "COEXIST-REAL PASS"
  exit 0
)
```

**不要**用宿主的 exit code 或「装上了没报错」判「无冲突」：`--dump-config` 在有 bundle 被静默跳过时照样 `exit 0`，同名 row id 也不会产生任何非零退出。本小节的裁决只看 `COEXIST-REAL` 块自己的退出码（0 通过 / 1 失败）与它打印的裁决行——这不违反上面那句，因为那句限定的正是**宿主命令**（`--dump-config` / `plugin add`）。**不要**把标头数当作 `dsh.profile.bundles` 的计数——DSH 按连续来源段打标头（`dsh-web-app` 还会就地 patch `dsh-base` 的行），一个 2-bundle 的模板 profile 就会打出 24 个标头；标头只能与**同一个 home 自己**的加包前基线比。

**这三段都还不能证明什么**：静态段只证行级 id 不相交，**不能证明**同层合成；演练形态刻意没装 `@jiangzhenguo/dsh-codegraph`（它的 spec 是 `github:` 形态、冻结不了确切版本），所以它的并存只有行级证据；解析级冲突（pnpm ERESOLVE）在本组合上未触发，也不代表换一组包不会触发。真实迁移形态（`COEXIST-REAL`）同样判不了「hooks 在运行时真的拦截」「skills 真的被会话加载」，也判不了 `codegraph` 的同层合成——后者仍只有行级静态证据（G-4，移交 Phase 5）。

### 回退

- **插件 → 旧部署**：`dsh plugin --profile web remove <name>`，清单（`dependencies` 与 `dsh.profile.bundles`）会自动收敛。旧部署则要**重跑旧脚本**重建 `$DSH_HOME/{skills/gsd-*,gsd-core,hooks,scripts,gsd-hooks.dsh.json}`，并把 `.stripped-bak` 里的内容**手工回填**到对应的 `profiles/*/cordis.patch.yml`——bridge 块没有别处可恢复。**迁移后不要删 `.stripped-bak`。**
- **单向不对称**：旧部署是机器级的，插件是 profile 级的。所以"卸旧"这一步的破坏半径永远大于"装新"——这也是步骤 1 的硬门必须先过的原因。

### 本机实测值（示例，本机 2026-11-13）

下表是演练场（20 字符 home + `@opengsd/gsd-core@1.16.0`）上的读数，逐字原文见 `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` 的 DRILL-1 段。**它们只是示例**：换 home 长度或换旧部署版本，前两行就变；后四行是包内产物，与路径、版本都无关。

| 项 | 读数 | 取法 |
| ---- | ---- | ---- |
| 旧部署技能数 | 72 | `ls -d "$DSH_HOME"/skills/gsd-*` |
| 旧 `gsd-health/SKILL.md` | 3084 B | 20 字符 home + 1.16.0 的产物 |
| 旧 `gsd-new-project/SKILL.md` | 3195 B | 同上（该路径出现 7 次） |
| 包内 `gsd-health/SKILL.md` | 3587 B | 与 home 长度、版本无关 |
| 包内 `gsd-new-project/SKILL.md` | 3856 B | 同上 |
| 包内技能数 | 72 | `ls -d "$PKG"/skills/gsd-*` |
| dump 标头数 | 24 → 25 | 加包前 → 加包后，同一 home |

## ② 两种方式的三轴差异

两种方式都能把 GSD 装进 DSH，但它们的**归属**不同：旧脚本是机器级的（写 `$DSH_HOME` 与全局 npm prefix），插件是 profile 级的（只写 `profiles/<name>/`）。下面三轴是唯一的实质差异面；三轴之外的差别，基本都是同一件事落在两个不同位置上。

### 什么情况选哪个

- **留在旧脚本**：仍要**批量铺多台机器**（一条 `curl | bash` 就够，不必先把 DSH profile 建好）、需要**完全离线安装**（`GSD_PACKAGE_DIR` 指向一个完整 npm 布局的包目录）、或者需要脚本自己那份**逐 profile 的诊断输出**（它逐条播报 bridge 块与 marker 状态）。
- **换成插件**：单机日常使用；要能 `dsh plugin` 一条命令 **enable / disable / 卸载**；要**一条命令升级或回滚**（换一个精确版本号即可）；希望安装只动 profile，不碰 `$DSH_HOME` 的其它位置。
- **已经装过脚本**：先按 §① 的**步骤 1** 逐个 profile 裁决去向，再走**步骤 2** 卸载 —— 两种方式同时在场会让同名技能**双源**，谁生效取决于 provider 优先级。

### 对照表

| 轴 | 旧脚本 | 插件 | 迁移影响 |
| ---- | ---- | ---- | ---- |
| 全局 CLI | `npm i -g @opengsd/gsd-core` 把 `gsd_run` 放到 PATH 上（本机实测解析到 1.16.0） | 包内引擎 `gsd-core/bin/gsd-tools.cjs`（1.20.1）；skills adapter 写 `node <GSDROOT>/…` 绝对路径，**不依赖 PATH** | 卸掉全局 CLI **不损伤**插件态；留着它 = 留一个落后 5 个小版本（1.16.0 对 1.20.1）的坑 |
| `GSD_PROFILE` 档位 | `core` / `standard` / `full` 三档透传给上游安装器（`INSTALLER_ARGS+=(--profile=…)`） | **无对应物**：恒定携带全部 72 个 skills；精简档是 Backlog 里未排期的 `dsh-gsd-core` 子包 | 从 `core` / `standard` 迁来会**多得**技能，不是缩水 |
| hooks 归属 | 机器级绝对 `configPath`（`~/.dsh/gsd-hooks.dsh.json`）加 `pluginRoot=~/.dsh` | 包内自定位（`!!js createRequire(baseUrl)` → `<包>/config/gsd-hooks.json`） | **不是事件差异**（两侧同为 5 事件 / 14 matcher，双向差集为空），差异只在 `configPath` / `pluginRoot` 归谁 |

每一格都能被一条只读命令复核：全局 CLI 那一行看 `npm ls -g --depth=0` 的版本与 `readlink -f "$(command -v gsd_run)"` 的落点；hooks 那一行用 `node -e` 数 `config/gsd-hooks.json` 的键集（5 个）与 matcher 数（14 个）；`GSD_PROFILE` 那一行看旧脚本的 `--profile=` 透传与包内 `skills/` 的目录数（72）。

### 共同限制：两种方式都受此限

DSH 只支持五类 hook 事件：`SessionStart`、`PreToolUse`、`PostToolUse`、`SubagentStop`、`Stop`（合计 14 个 matcher，分布 1 / 7 / 4 / 1 / 1）。没有 `PreCompact`、没有 `FileChanged`、也没有 statusline 事件。

**两种方式都受此限 —— 旧脚本与插件一样。** 换成插件**不会**获得更多事件：插件只是把同一份配置从机器级绝对路径搬进包内（`configPath` 自定位），事件集合一字未变。旧脚本那几个 hooks 开关（`GSD_FORCE_HOOKS_PATCH` / `GSD_NO_BRIDGE_SYNC` / `GSD_HOOKS_SANDBOX_PATCH`）在插件侧同样**无对应物**。

## ③ DSH 升级 / 版本错配：症状 → 原因 → 修复

DSH 的版本兼容判定在**四个不同时机**触发，四层的可观察后果完全不同——最危险的是第 ③ 层：**命令照常成功退出，坏掉的是那一层本身**。下表每一格都来自本仓 2026-11-13 的实测（逐字原文见 `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` 的 DRILL-2 段），不是对旧记录的转述。

### 四层门与逐字症状（来自实测）

| 层 | 症状（逐字） | 原因 | 修复 |
| ---- | ---- | ---- | ---- |
| ① preflight | `dsh: installation rejected:` … 紧跟 `dsh: nothing was installed.` | 目标是 registry / 目录形态的 spec，其 manifest 的 `engines.dsh` 不满足当前 DSH 版本，**装之前**就拒绝 | 见下面「修复路径」第 1 条 |
| ② post-install | `dsh: installation rejected:`（warning 出现两次）紧跟 `dsh: restored package.json, pnpm-lock.yaml, and node_modules.` | 目标是本地 `.tgz`：pnpm 先真装、随后回滚；`node_modules` **会留在盘上** | 同上；别把回滚读成"装上了" |
| ③ load | `dsh: skipping profile bundle "<name>": …`（**stderr**，整段只有一行） | 已装的 bundle 在加载 / `--dump-config` 时判定不满足，整个 bundle 被跳过；stdout 少若干行，`dsh.profile.bundles` 原样不动 | 同上；**退出码仍是 0**——判据只能是 stderr + 层数 + row 集合 |
| ③′ load | MEASURED: dsh: disabling profile plugin row "gsd-hooks-bridge": Plugin @deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1 is incompatible with dsh 0.2.2-rc.1: requirements {"engines.dsh":">=9.0.0"}. Running it may cause crashes or data loss. Update the plugin or install a plugin version compatible with this dsh runtime. To accept this risk explicitly, grant the exact-version exemption for @deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1 on dsh 0.2.2-rc.1 with `dsh plugin allow-version` or the plugin manager, then retry the installation or restart dsh. Exact-version exemption: not active.（本机 boot 实测到的逐字原文） | 行被合成了，但它指向的包（这里是 bridge 包 `@deepseek-ai/dsh-hooks-claude-code`）manifest 不满足；该行被标 `disabled`，**不写回任何文件** | 同上；症状是"静默无守卫"，不是报错 |

**为什么第 ③ 行要单独标"退出码仍是 0"**：`--dump-config` 与 boot 在 bundle 被跳过时依旧成功退出，`dsh --profile … --dump-config && echo ok` 这类判据会把坏状态判绿。本机实测这一形态是：`EXIT=0`、标头 25 → 24、stdout 1255 → 1243 行、`# == dsh-gsd` 标签消失、`- id: gsd` 行数为 0、stderr 恰一行。判据只能是这四个量（stderr 非空 / 标头 `H1 = H0 − 1` / 每个期望 bundle 的标签**出现** / row id 集合），且标头数只能与**同一个 home 自己的**基线比，不能与 `dsh.profile.bundles` 的长度比。

### pin 对齐策略与静态门的边界

`build/assets/pins.json` 是**行 ↔ pin 的唯一真源**（`lines.<line>.bridge` / `lines.<line>.peer` / `lines.<line>.dshRange`），`package.json` 是执行真值，`node build/lib/check-pins.mjs --offline` 是两者之间的静态门。步骤 (j) 把 `package.json` 的 peer 拼成 `"<name> <range>"`，与 `lines.022.peer` **逐字**比较，不相等即 exit 2 并打印失配串；本机实测把该值注入成 `0.2.2-rc.2` 后得到 exit 2 与一行 `check-pins: peerDependencies @deepseek-ai/dsh-skill-filesystem mismatch — …`。

**这条门有明确的边界**：该 peer 只被 `check-pins` 步骤 (j) 消费。DSH 的兼容判定在包自带 `engines.dsh` 时**直接返回、完全不读 `peerDependencies`**，所以改 `pins.json` / 改 peer **只会让 CI 变红，产不出任何运行时症状**。运行时症状只能从「已装包自己的 `engines.dsh`」或「bridge 包的 manifest」注入——上面四层门里的 ③ / ③′ 两行就是这么测出来的。把静态门当成运行时门，会得到一个"CI 全绿、装上却少一层"的发布。

### 修复路径（按推荐顺序）

1. **装与 DSH 运行时匹配的版本**（首选）。匹配窗口由 `build/assets/pins.json` 的 `dshRange` 定义，运行时版本用 `dsh --version` 取；升级与回滚都只是换一个精确版本号。
2. **`allow-version`：显式承担风险的精确二元组豁免**（次选）。`dsh plugin --profile <p> allow-version <name>@<ver> --dsh-version <exact> --accept-risk` 会写进 `<profile>/compatibility.json`；它只对**这一个包版本 × 这一个 DSH 版本**生效，**升级任一版本即失效**，且宿主会明确警告可能崩溃或损坏数据。它不是让兼容门变绿的手段，是一次被记录下来的风险接受。
3. **绝不 `--force`**。`--force` 是 pnpm 的解析开关，不改变 DSH 的判定；它只会让不兼容的包被装上，然后在 load 层被静默跳过——得到"装上了但没生效"的假象，比装不上更难排查。

---

# dsh-gsd Migration Guide — from shell script to plugin

**For anyone who already installed GSD with `install-gsd-dsh.sh`: how to move from the shell-script deployment to the plugin. Every block below is safe to paste as a whole, and every step states an observable criterion — you never have to close a migration on "looks fine".**

This file is **not shipped with the npm package** (`docs/` is absent from the nine entries in `package.json`'s `files`), so it is a GitHub-reader document, the same kind of artifact as [BUILD.md](./BUILD.md); day-to-day installs live in [README.md](./README.md), and the build/release chain lives in BUILD.md. §① is the migration runbook.

> ⚠ **Do not run `--uninstall` on a real `~/.dsh` before deciding, per profile, where each profile should go** — it does not understand profiles: it wipes the skills and bridge blocks of **every** profile under that home (`web` / `headless`, etc.).
> If you are a shell-script user: first work through the per-profile decision in **step 1** (a hit means abort, not "warn and continue"), and only then start the real migration from **step 0-B** (`export DSH_HOME="$HOME/.dsh"`). The throwaway drill box in **step 0-A** is an isolated path for this repository's maintainers — it shows how the criteria are measured, it is not your migration path.

## ① Migration runbook

### Step 0 — choose your migration arena

The arena decides **which home every write lands in**. `DSH_HOME` is the root that all three DSH entry points (`dsh plugin add/remove`, `--dump-config`, the machine-level patch layer) agree on, and it is also the root the legacy script uses. **Every pasteable block carries `export DSH_HOME=` at its head** — a marked block opens with one marker line (`# <marker>`; here `# MIG-GATE`, in step 6 `# COEXIST-*`), immediately followed by `export DSH_HOME=` and then the echo; an unmarked block has `export DSH_HOME=` on its first line. Drop that line and your commands land in the very home you are using right now.

#### 0-A Drill box (for this repository's maintainers)

Run the whole chain inside a one-shot temporary home. The drill adds one more switch, `npm_config_prefix`: **a temporary home does not isolate `npm i -g`**, and the legacy script unconditionally installs `@opengsd/gsd-core` into your **real** global prefix. So the drill needs both `--no-npm-bin` and a temporary `npm_config_prefix` as two independent safeguards (the former only takes effect outside upgrade mode).

```bash
export DSH_HOME="$(mktemp -d /tmp/dsh-mig-XXXXXXX)"
echo "DSH_HOME=$DSH_HOME"
export npm_config_prefix="$(mktemp -d /tmp/dsh-mig-npm-XXXXXX)"
echo "npm prefix=$(npm config get prefix)"
```

`/tmp/dsh-mig-` is 13 characters, plus 7 `X` characters ⇒ `DSH_HOME` is exactly **20 characters** long. That length is **part of the criterion**, not a coincidence: during staging the legacy script writes the literal `$DSH_HOME` path into `SKILL.md`, so the byte counts on the legacy side vary linearly with home length — with a 20-character home, `gsd-health/SKILL.md` is **3084 B** and `gsd-new-project/SKILL.md` is **3195 B** (that path occurs 3 times and 7 times in those two files). For a home of length `L`, the expectations become `3084 - 3×(20-L)` and `3195 - 7×(20-L)`; **do not** treat 3084 / 3195 as fixed assets, and do not shrink an expectation just to turn 3081 into a pass.

The other premise is **the GSD version of the legacy deployment**: that baseline is an artifact of `@opengsd/gsd-core@1.16.0` (the upstream `SKILL.md` itself changes between versions). The drill therefore pins the version to `1.16.0` and asserts both readings equal it **before** uninstalling — `gsd-core` is deleted by the uninstall, so the assertion would be unobtainable afterwards.

In the drill box step 1 **necessarily hits** (the new home's `web` has no plugin yet, and the legacy script has just installed the bridge block): the whole one-shot home has already been decided as disposable, so the way to pass is to write the actual profile name into `MIG_DECIDED_PROFILES` (see step 1).

#### 0-B Real migration (for shell-script users)

**Run the per-profile decision from step 1 first; a hit means abort**: `--uninstall` is machine-wide and touches every profile under the home at once, so on a real home there is no such thing as a safe "migrate just one profile". Write the outcome into `MIG_DECIDED_PROFILES`, one profile at a time — and never treat it as a default.

This step deliberately does **not** isolate the npm global prefix — step 3 of a real migration is precisely about removing your own global CLI.

```bash
export DSH_HOME="$HOME/.dsh"
echo "DSH_HOME=$DSH_HOME"
```

Neither the length of your real home nor your legacy deployment's version is decided by this document, so 3084 / 3195 are simply not your expectations: **measure your own baseline before uninstalling** (a `wc -c` on the two `gsd-*.md` files is enough) and after migrating compare only against the number you measured yourself; the commands are in step 5.

**Where `H0` comes from: dump once after step 2 and before step 4** (at that point `dsh-gsd` is not installed yet). That is the before-install baseline shared by step 5 and step 6's drill form — the same recipe applies to both, it is not drill-only; if you genuinely could not take it, degrade gracefully: skip the increment criterion and rely only on step 5's stderr / labels / row set and step 6's real-migration form (`COEXIST-REAL`, which compares no increment). Note also that `--dump-config` rewrites `<profile>/cordis.yml` (and creates the profile when it does not exist), so during the migration it is already part of the action — do **not** treat it as a read-only probe.

### Step 1 — hard gate: decide each profile's destination first

**A hit means abort.** There are **two faces** to check: face 1 (skills) and face 2 (hooks). Both are required, because the two failure modes differ — leftover skills mean content contamination (new skills running old bodies), leftover bridge blocks mean a doubled bridge intercepting twice. The machine-level patch layer outranks profile layers and the legacy script **never** scans it, so it needs its own face.

**Face 1 is made of two observables** (it is not an "any skills ⇒ alarm" switch: on any home the script ever touched, `$DSH_HOME/skills/gsd-*` is necessarily non-empty, and that criterion would fail both 0-A and 0-B):

- **`GATE: skills=<N>`** — the number of entries under `$DSH_HOME/skills/gsd-*`. This is the **baseline**, and it is what makes step 5 item A ("expect 0 after uninstall") meaningful: with `N=0` that negative control is vacuous. Face 1 and step 5 item A are **two points of the same quantity** (above 0 before the uninstall, 0 after it); skip step 1 and you have no baseline, so the `0` proves nothing about "the legacy source is dead".
- **`GATE: undecided=<profile…>`** — the profiles whose `dsh.profile.bundles` does not contain `dsh-gsd`. They are the ones still getting GSD skills only from the home-level `skills/gsd-*`, which is exactly the machine-readable form of D-03's second trigger ("or still depend on the gsd-* under `~/.dsh/skills`").

**Why face 1 must be judged before the uninstall**: the legacy script `rm -rf`s `$DSH_HOME/skills/gsd-*` **unconditionally**, without consulting any marker (see step 2); once that has run, both sources are on disk and a probe can only record, never abort.

```bash
# MIG-GATE: step 1's hard gate (read-only). This block's own exit code is the verdict: 0 pass / 1 hit undecided / 2 hard abort.
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
(
  # The host's --uninstall always exits 0 and is never a criterion; only this block and step 6's COEXIST-REAL judge by exit code.
  # face 1a = skills baseline; face 1b = profiles still getting GSD only from home-level skills; face 2a = legacy bridge block;
  # face 2b = a second gsd-hooks-bridge row; machine-level = the three states of the machine-level patch layer.
  # No-home guard: ${DSH_HOME:?} aborts only a non-interactive shell; pasted into an interactive one it just prints a
  # message and the rest still runs, so an empty home would yield an empty hit set and print GATE: PASS. This makes it exit 2.
  [ -n "${DSH_HOME:-}" ] || { echo "GATE: ABORT no-home"; exit 2; }
  # face 1a: legacy skill count (the baseline for step 5 item A)
  SK=$(ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l | tr -d ' ')
  echo "GATE: skills=$SK"
  # per profile: skip node_modules, only dirs holding package.json or cordis.patch.yml
  U=""; B=""; M=""; N=0
  for d in "$DSH_HOME"/profiles/*/; do
    [ -d "$d" ] || continue
    p=$(basename "${d%/}")
    [ "$p" = "node_modules" ] && continue
    [ -f "$d/package.json" ] || [ -f "$d/cordis.patch.yml" ] || continue
    N=$((N+1))
    # face 1b: read the manifest with node rather than approximating with grep (dependencies may still carry
    # the key while bundles no longer does)
    if [ -f "$d/package.json" ]; then
      if ! node -e 'const j=require(process.argv[1]);const b=(j.dsh&&j.dsh.profile&&j.dsh.profile.bundles)||[];process.exit(b.includes("dsh-gsd")?0:1)' "$d/package.json" >/dev/null 2>&1; then
        U="$U $p"
      fi
    fi
    if [ -f "$d/cordis.patch.yml" ]; then
      # face 2a: the legacy bridge block
      grep -q 'GSD-DSH-bridge BEGIN' "$d/cordis.patch.yml" 2>/dev/null && B="$B $p"
      # face 2b: a second gsd-hooks-bridge row (two-step count: on zero matches grep -c prints 0 and then exits 1)
      HT=$(grep -c 'gsd-hooks-bridge' "$d/cordis.patch.yml" 2>/dev/null || true)
      [ "${HT:-0}" -gt 1 ] && M="$M $p"
    fi
  done
  U=$(printf '%s' "$U" | sed -e 's/^ *//' -e 's/ *$//')
  B=$(printf '%s' "$B" | sed -e 's/^ *//' -e 's/ *$//')
  M=$(printf '%s' "$M" | sed -e 's/^ *//' -e 's/ *$//')
  DEC=$(printf '%s' "${MIG_DECIDED_PROFILES:-}" | sed -e 's/^ *//' -e 's/ *$//' -e 's/  */ /g')
  echo "GATE: profiles=$N decided=${DEC:--}"
  echo "GATE: undecided=${U:--}"
  echo "GATE: bridge=${B:--}"
  echo "GATE: multirow=${M:--}"
  # machine-level face: the three states must stay apart (ABSENT / CLEAN / DIRTY)
  ML="$DSH_HOME/cordis.patch.yml"
  if [ ! -e "$ML" ]; then
    MC=ABSENT
  else
    HT=$(grep -c 'gsd-hooks-bridge' "$ML" 2>/dev/null || true)
    if [ "${HT:-0}" -gt 0 ]; then MC=DIRTY; else MC=CLEAN; fi
  fi
  echo "GATE: machine-level=$MC"
  # A dirty machine level has no exemption: it has no profile to decide and can only be cleaned by hand
  if [ "$MC" = "DIRTY" ]; then echo "GATE: HARD-ABORT machine-level=DIRTY"; exit 2; fi
  # hit set = undecided ∪ bridge ∪ multirow (the deduplicated set of profile names); MIG_DECIDED_PROFILES must cover it all
  HITS=$(printf '%s %s %s\n' "$U" "$B" "$M" | tr ' ' '\n' | sed '/^$/d' | sort -u)
  MISS=""
  for h in $HITS; do
    case " $DEC " in *" $h "*) ;; *) MISS="$MISS $h" ;; esac
  done
  if [ -n "$MISS" ]; then echo "GATE: ABORT undecided=${U:--} bridge=${B:--} multirow=${M:--}"; exit 1; fi
  echo "GATE: PASS"
  exit 0
)
```

**Six status lines, three verdicts.** Every machine-readable line inside the block is **ASCII** (the explanation lives here, so the zh and en halves emit word-for-word identical `GATE:` lines for the same home): `GATE: skills=<N>` (face 1a baseline), `GATE: profiles=<n> decided=<list|->`, `GATE: undecided=<list|->` (face 1b), `GATE: bridge=<list|->` (face 2a), `GATE: multirow=<list|->` (face 2b: some profile carries a second `gsd-hooks-bridge` row), `GATE: machine-level=<ABSENT|CLEAN|DIRTY>`; the verdict lines are `GATE: PASS` / `GATE: ABORT …` / `GATE: HARD-ABORT machine-level=DIRTY`, with exit codes 0 / 1 / 2. `-` means the set is empty.

**Why the machine-level face needs three branches**: `ABSENT` (no such file), `CLEAN` (the file exists but its `gsd-hooks-bridge` count is 0 — a real, healthy home's root `cordis.patch.yml` often carries nothing but ATC MCP blocks, and it **must pass**), `DIRTY` (count > 0). A bare `grep -c … || true` also returns 0 when the file is missing, and what it proves then is "the file does not exist", not "the file is clean"; conversely, treating mere file existence as `DIRTY` turns a healthy real home red. **`DIRTY` has no exemption**: `--uninstall` never scans the machine-level layer, so a bridge block left there outranks the profiles and survives the uninstall, and this face has no profile to decide — it can only be cleaned by hand, hence `exit 2`.

**`MIG_DECIDED_PROFILES` is a per-profile decision record, not a release switch.** The hit set is `undecided ∪ bridge ∪ multirow` (a **deduplicated set of profile names**; the three faces are peers, all profile-level, so a per-profile decision covers any of them). The decision record must **fully** cover the hit set; partial coverage still exits 1 — a hit set of two profiles with only one of them decided exits 1 (the criterion is coverage, not a non-empty intersection). A dirty machine level is not covered by it at all. Shape example: `MIG_DECIDED_PROFILES="web headless"`. What to do on a hit: decide where each profile goes (migrate it / retire it / it never needed GSD), write the names in, and re-run step 1 until `GATE: PASS`. **`multirow` (a second `gsd-hooks-bridge` row) is a profile-level face too** — a per-profile decision covers it exactly like the bridge block; it is **not a machine-level face** and gets no third exit code.

**`GATE: PASS` only says every hit profile has a record — it does not mean the record is right.** The record is written by a human; this block judges "has it been decided", not "was the decision correct" — the same boundary as DRILL-4's "what this does not prove".

**Why this block may judge by exit code**: exactly **two** blocks in this runbook judge by exit code — this one and step 6's real-migration form `COEXIST-REAL`. Both define their own exit codes, and each maps one-to-one onto the verdict lines they print. The host's `--uninstall` / `--dump-config` / `plugin add` still always exit 0 and are **never** criteria.

**On the 0-A drill box this step necessarily hits** (the new home's `web` has no plugin yet, and the legacy script has just installed the bridge block): the whole one-shot home has already been decided as disposable, so the way to pass is to write the actual profile name into `MIG_DECIDED_PROFILES` (e.g. `MIG_DECIDED_PROFILES=web`). That makes DRILL-1's "continue after hits=1" **explicit** rather than a bypass. **0-B must decide per profile first and only then write this variable** — and must **not** treat it as a default.

> Always append `2>/dev/null` or `|| true` to probes: a non-existent profile name makes `dsh` throw a stack trace instead of printing a one-line notice.

### Step 2 — remove the legacy deployment

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
bash <path-to>/install-gsd-dsh.sh --uninstall
```

`--uninstall` **does not understand profiles**: it `rm -rf`s `$DSH_HOME/skills/gsd-*` unconditionally; it deletes `$DSH_HOME/{gsd-core,hooks,scripts}` only when their `.gsd-dsh-managed` marker is present; and it strips `# GSD-DSH-bridge BEGIN…END` plus `# GSD-DSH-sandbox BEGIN…END` from **every** `profiles/*/cordis.patch.yml`, leaving a `.stripped-bak` copy next to each file it actually stripped.

**Four things the legacy script does not do** — a runbook's job is to list them up front instead of letting you discover them afterwards:

1. **It does not touch the global npm package**: both `@opengsd/gsd-core` and `$prefix/bin/gsd_run` stay → hand them to step 3.
2. **It does not touch `~/.gsd`**: it only prints a hint. That is GSD's global state (e.g. `research-cache`); whether to clean it is your call.
3. **It does not touch the machine-level `$DSH_HOME/cordis.patch.yml`**: it only scans `profiles/*/cordis.patch.yml`. If you ever put a bridge block into the machine-level layer by hand, it survives the uninstall — and it outranks the profile layers.
4. **It does not touch the two direct hook dependencies in each profile** (`@deepseek-ai/dsh-hook-protocol`, `@deepseek-ai/dsh-hooks-claude-code`): they are non-blocking leftovers, `dsh-gsd` depends on them too, so **do not edit the manifest by hand**.

⚠ **Exit codes are not a criterion here**: the `--uninstall` source ends with an unconditional `exit 0`, so even "not a single block stripped" prints success, and `set -euo pipefail` is neutralised by `|| true`. The only criterion is the negative control output in step 5.

### Step 3 — remove the global CLI

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
npm uninstall -g @opengsd/gsd-core
# Residue evidence: if it still resolves, someone can still point the engine at the old version
command -v gsd_run 2>/dev/null || echo "no gsd_run on PATH"
```

**Why remove it by default**: keeping it means keeping an engine several minor versions behind, so anyone still typing `gsd_run` from the old docs silently runs the wrong version.

**Why removing it does not damage the plugin state**: the bundled skills' adapters call `node <GSDROOT>/gsd-core/bin/gsd-tools.cjs` by **absolute path** and never rely on PATH; only the legacy skills went through a PATH-resolved `gsd_run`. The drill behaves the same way: every engine invocation uses an absolute path, and `command -v gsd_run` output is **residue evidence**, never "it works" evidence.

### Step 4 — install the plugin

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
# Drill form: the tarball this repository packs itself; the path must be absolute
dsh plugin --profile web add "$PWD/dsh-gsd-<version>.tgz"
# Real migration form: an exact version from the registry
dsh plugin --profile web add dsh-gsd@<version>
```

The two specs take **different** decision paths: a `.tgz` is really installed into `node_modules` first and judged afterwards, so an incompatible one is rolled back out of `package.json` / `pnpm-lock.yaml` while `node_modules` stays on disk; a registry / directory spec goes through preflight and is rejected before anything is installed. The drill uses the former.

### Step 5 — verify: negative control + content comparison

Both criteria **must hold together**: with only the negative control, a broken plugin also "passes" (0 skills trivially satisfies "the legacy source is empty"); with only the content comparison, mixed sources cannot be ruled out. Both, and you have proven "the legacy source is dead" and "the new source is the real one" at the same time.

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
P=web
# A Negative control: the legacy source must be dead (expect 0). This is the "after" point of the same
# quantity as GATE: skills=<N> in step 1 -- without the baseline measured before the uninstall, 0 proves nothing
ls -d "$DSH_HOME"/skills/gsd-* 2>/dev/null | wc -l
# B Legacy managed directories (expect all three lines to read absent)
for d in gsd-core hooks scripts; do
  printf '%-10s %s\n' "$d" "$([ -e "$DSH_HOME/$d" ] && echo PRESENT || echo absent)"
done
# C Legacy hooks config and its marker (expect no output)
ls "$DSH_HOME"/gsd-hooks.dsh.json* 2>/dev/null
# D Face 2: bridge / sandbox blocks (expect no output)
grep -l -e 'GSD-DSH-bridge BEGIN' -e 'GSD-DSH-sandbox BEGIN' "$DSH_HOME"/profiles/*/cordis.patch.yml 2>/dev/null
# E Machine-level face: ABSENT and PRESENT-and-clean are two different states (two-step count: no extra 0)
if [ -e "$DSH_HOME/cordis.patch.yml" ]; then
  HT=$(grep -c 'gsd-hooks-bridge' "$DSH_HOME/cordis.patch.yml" 2>/dev/null || true)
  echo "machine-level: PRESENT gsd-hooks-bridge=${HT:-0}"
else
  echo "machine-level: ABSENT"
fi
# Content comparison: the new source must be the in-package copy. A byte-count discriminator is dependency-free and preferred over hashing
PKG="$DSH_HOME/profiles/$P/node_modules/dsh-gsd"
node -e 'for (const f of process.argv.slice(1)) console.log(require("fs").statSync(f).size, f)' \
  "$PKG/skills/gsd-health/SKILL.md" "$PKG/skills/gsd-new-project/SKILL.md"
ls -d "$PKG"/skills/gsd-* | wc -l
# Did the layer mount? A before/after relation inside one home, not "header count == bundle count"
dsh --profile "$P" --dump-config > /tmp/mig-dump.out 2> /tmp/mig-dump.err
wc -c < /tmp/mig-dump.err                      # expect 0: anything here means a bundle was silently skipped
grep -c '^# == ' /tmp/mig-dump.out             # after installing = before + 1 (one newly installed bundle: step 4 adds only dsh-gsd; same definition as the +3 in step 6)
grep -q '^# == dsh-gsd' /tmp/mig-dump.out && echo "dsh-gsd layer present"
grep -cE '^\s*- id: gsd$' /tmp/mig-dump.out              # expect 1
grep -cE '^\s*- id: gsd-hooks-bridge$' /tmp/mig-dump.out # expect 1
```

The criteria are **content, byte counts and sets**; none of them relies on an exit code: `--dump-config` still exits 0 when a bundle is skipped (three stdout lines missing, one stderr line, unchanged status), and `--uninstall` always exits 0.

**A header count may only be compared with the same home's own before-install baseline.** "`^# == ` header count == `dsh.profile.bundles` length" is a false invariant: headers are emitted per **contiguous origin run**, and `dsh-web-app` patches `dsh-base` rows in place, so the labels alternate. The drill measured: a two-bundle template profile already emits **24** headers / 1243 lines, and after adding `dsh-gsd` (the third bundle) **25** headers / 1255 lines. The correct shape is "`H1 = H0 + 1` inside one home", plus a **presence** assertion per expected bundle label, plus row-id set assertions (one row each, no duplicates).

⚠ **Two limitations of the drill environment** (documented here so you do not blame yourself):

- In the window **after the legacy install and before the uninstall**, `--dump-config` ends in a YAML parse failure (drill measurement: exit 1, 0 headers, stderr **1877 B**). Cause: the template profile's `cordis.patch.yml` body is the empty array `[]`, and the legacy script **appends** a top-level `- insert:` after it, which makes the file invalid. A real user's profile has a non-empty patch file (its first entry is normally an `- id:` row), so the append is legal there. **Therefore: do not dump inside that window.**
- **Never use `--dump-config` as a "read-only" probe on a real home**: it at least rewrites `<profile>/cordis.yml`, and it creates the profile when it does not exist. Read-only probes on a real home are limited to `ls` / `grep` / `node -e`.

**About exemptions**: when versions mismatch, the host-offered `allow-version` is an **explicit risk exemption** (exact name@version × exact DSH version + accept risk); it writes into `<profile>/compatibility.json` and masks the real mismatch. Its occurrence count in the drill must be **0**, and it is **not** a way to make the compatibility gate go green. `--force` is a pnpm resolution switch and behaves the same way — an incompatible package simply gets skipped at the load layer, giving the illusion of "installed but not effective".

### Step 6 — coexistence self-check

After installing `dsh-gsd` into a profile, can other plugins still share that profile? The criterion is **not** "it installed, nothing errored, it runs": DSH has **no conflict arbitration** for duplicate row ids — when two bundles contribute the same id you silently get two rows (`add` exits 0, zero warnings, and `--dump-config` exits 0 too). So "no conflict" is a **set assertion** — the **three parts** below have distinct jobs: the **static part** (zero install, proves row-level disjointness only) and the **real-migration form `COEXIST-REAL`** (zero install, judges listed ⇔ labeled plus the row set) are **the two parts a real migration runs**; the middle **drill form `COEXIST-DRILL`** (really installs three bundles) only demonstrates same-layer composition inside a **one-shot home** — **a real migration does not run it**.

**Static part: the zero-install comparison.** Read four `cordis.patch.yml` files only (every source is taken from `$DSH_HOME/profiles/<p>/node_modules/...`, no dependence on cwd being the repo root) and assert that the row ids they contribute are pairwise disjoint (the two from this repository plus `codegraph` / `deja` / `dsh-market`). This part proves **row-level** non-collision only; a source whose package is not on disk prints `MISSING: <pkg>` and is skipped, and when only one source remains it prints `coexist-static SKIPPED` and states that **this is not a pass**. The block is read-only and reads the very home `DSH_HOME` points at.

```bash
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
node -e '
const fs=require("fs"), p=require("path");
const home=process.env.DSH_HOME;
const web=p.join(home,"profiles","web");
const src={
  "dsh-gsd":p.join(web,"node_modules","dsh-gsd","cordis.patch.yml"),
  "codegraph":p.join(web,"node_modules","@jiangzhenguo","dsh-codegraph","cordis.patch.yml"),
  "deja":p.join(web,"node_modules","dsh-deja","cordis.patch.yml"),
  "dshmarket":p.join(web,"node_modules","dshmarket","cordis.patch.yml")
};
const ids={}; let n=0;
for (const [k,f] of Object.entries(src)) {
  if (!fs.existsSync(f)) { console.log("MISSING: "+k); continue; }
  n++;
  const s=[];
  for (const l of fs.readFileSync(f,"utf8").split("\n")) {
    const m=/^\s*-\s+id:\s*(\S+)\s*$/.exec(l); if (m) s.push(m[1]);
  }
  ids[k]=s;
}
if (n<2) { console.log("coexist-static SKIPPED (fewer than two sources present -- this is not a pass)"); process.exit(0); }
const all=Object.values(ids).flat();
const dup=all.filter((x,i)=>all.indexOf(x)!==i);
if (dup.length) { console.log("coexist-static FAIL duplicate row ids: "+dup.join(",")); process.exit(1); }
console.log("coexist-static ok: "+all.join(" "));
'
```

**Drill form (`COEXIST-DRILL`): really install once inside a one-shot home.** Install the three bundles into the same profile, then assert on the `--dump-config` output. The increment criterion has exactly one definition — **the increment equals the number of newly installed bundles**: this block installs 3, so `H1 = H0 + 3` (DRILL-3 measured `27 = 24 + 3`); step 5 installs 1, so it is `+1` under the same definition. `H0` must be taken before installing anything and must be non-empty, else the comparison holds vacuously.

```bash
# COEXIST-DRILL: the drill form (one-shot home; really installs three bundles). For a real migration use COEXIST-REAL below -- zero install, compares no increment.
export DSH_HOME="$(mktemp -d /tmp/dsh-coex-XXXXXX)"
echo "DSH_HOME=$DSH_HOME"
export P=web
dsh --profile "$P" --dump-config > /tmp/c-l0.out 2> /tmp/c-l0.err  # take H0 before installing anything
H0=$(grep -c '^# == ' /tmp/c-l0.out)
dsh plugin --profile "$P" add dsh-gsd@<version>
dsh plugin --profile "$P" add dsh-deja@<version>
dsh plugin --profile "$P" add dshmarket@<version>
dsh --profile "$P" --dump-config > /tmp/c-dump.out 2> /tmp/c-dump.err
wc -c < /tmp/c-dump.err            # 1) stderr must be 0 bytes: anything here means a bundle was silently skipped
H1=$(grep -c '^# == ' /tmp/c-dump.out)
echo "headers $H0 -> $H1"           # 2) expect H1 = H0 + 3 (three newly installed bundles; DRILL-3 measured 27 = 24 + 3)
for p in dsh-gsd dsh-deja dshmarket; do
  grep -qE "^# == .*$p" /tmp/c-dump.out || echo "MISSING layer: $p"   # 2) each expected bundle's header label must be present
done
for id in gsd gsd-hooks-bridge deja dsh-market; do
  printf '%s x%s\n' "$id" "$(grep -cE "^[[:space:]]*- id: $id$" /tmp/c-dump.out)"   # 3) expect exactly 1 each
done
grep -oE '^[[:space:]]*- id: (gsd|gsd-hooks-bridge|deja|dsh-market)$' /tmp/c-dump.out \
  | sed -E 's/.*id: //' | sort | uniq -d   # 4) expect empty = no row id silently rendered twice
```

**Real-migration form (`COEXIST-REAL`): the zero-install pairing criterion.** In a real migration `dsh-gsd` is installed by step 4, so all three `add`s here are no-ops and the increment is necessarily 0 — **the real-migration form compares no increment**: `H1 > H0` is necessarily false on a healthy home, and in the other direction, if the profile never had deja/dshmarket the increment would go green for a reason unrelated to same-layer composition (DRILL-3 pins the mechanism: the increment always equals the number of newly installed bundles, and a real migration installs 0). So the real form installs nothing and derives its expectation set from the home's own manifest: `dsh-gsd` **must be** in `dsh.profile.bundles` (missing = step 4 did not succeed), and each of the three bundles of interest is judged **listed ⇔ labeled** (when listed it must carry a header label `# == <bundle>` or `# == ..., patched by <bundle>`; when absent it prints `COEXIST-REAL absent <bundle>` and is skipped — an absent bundle is not required to have a label, otherwise a real profile without deja/dshmarket would go falsely red); every listed bundle's expected row ids must appear exactly once (`dsh-gsd` -> `gsd` + `gsd-hooks-bridge`; `dsh-deja` -> `deja`; `dshmarket` -> `dsh-market`); `uniq -d` over those ids must be empty; and the dump's stderr must be 0 bytes. A missing `dsh-gsd` reddens as `required-absent:dsh-gsd` — it reports "not listed", not "one layer short".

```bash
# COEXIST-REAL: the real-migration form (zero install). The real home is named by exactly one export line below; this block installs nothing.
export DSH_HOME="${DSH_HOME:?run step 0-A or 0-B first}"
echo "DSH_HOME=$DSH_HOME"
(
  # The expectation set comes from dsh.profile.bundles in $DSH_HOME/profiles/<p>/package.json (listed <=> labeled), never from "how many were just installed".
  [ -n "${DSH_HOME:-}" ] || { echo "COEXIST-REAL FAIL no-home"; exit 1; }
  P=${P:-web}
  echo "COEXIST-REAL env DSH_HOME=$DSH_HOME profile=$P"
  dsh --profile "$P" --dump-config > /tmp/c-real.out 2> /tmp/c-real.err
  R=""
  SB=$(wc -c < /tmp/c-real.err | tr -d ' ')
  [ "$SB" -eq 0 ] || R="$R stderr-bytes:$SB"
  MAN="$DSH_HOME/profiles/$P/package.json"
  LISTED=$(node -e 'const j=require(process.argv[1]);const b=(j.dsh&&j.dsh.profile&&j.dsh.profile.bundles)||[];console.log(b.join(" "))' "$MAN" 2>/dev/null || true)
  case " $LISTED " in *" dsh-gsd "*) ;; *) R="$R required-absent:dsh-gsd" ;; esac
  for b in dsh-gsd dsh-deja dshmarket; do
    case " $LISTED " in
      *" $b "*)
        echo "COEXIST-REAL listed $b"
        if grep -qE "^# == (.*, )?${b}(, patched by .*)?$" /tmp/c-real.out; then
          echo "COEXIST-REAL label $b PRESENT"
        else
          echo "COEXIST-REAL label $b MISSING"
          R="$R label-missing:$b"
        fi
        ;;
      *) echo "COEXIST-REAL absent $b" ;;
    esac
  done
  for pair in dsh-gsd:gsd dsh-gsd:gsd-hooks-bridge dsh-deja:deja dshmarket:dsh-market; do
    b=${pair%%:*}; id=${pair##*:}
    case " $LISTED " in
      *" $b "*)
        n=$(grep -cE "^[[:space:]]*- id: $id$" /tmp/c-real.out || true)
        echo "COEXIST-REAL row $id ${n:-0}"
        [ "${n:-0}" -eq 1 ] || R="$R row-$id:${n:-0}"
        ;;
    esac
  done
  ND=$(grep -oE '^[[:space:]]*- id: (gsd|gsd-hooks-bridge|deja|dsh-market)$' /tmp/c-real.out | sed -E 's/.*id: //' | sort | uniq -d | wc -l | tr -d ' ')
  echo "COEXIST-REAL dup $ND"
  [ "$ND" -eq 0 ] || R="$R duplicate-row-ids:$ND"
  if [ -n "$R" ]; then echo "COEXIST-REAL FAIL$R"; exit 1; fi
  echo "COEXIST-REAL PASS"
  exit 0
)
```

**Do not** use the host's exit code, or "it installed and nothing errored", as the "no conflict" criterion: `--dump-config` still exits 0 when a bundle is silently skipped, and duplicate row ids produce no non-zero exit at all. This section's verdict reads only `COEXIST-REAL`'s own exit code (0 pass / 1 fail) and the verdict lines it prints — which does not contradict the sentence above, because that sentence scopes exactly the **host commands** (`--dump-config` / `plugin add`). **Do not** treat the header count as a count of `dsh.profile.bundles` — DSH emits one header per contiguous origin run (`dsh-web-app` also patches `dsh-base` rows in place), so a two-bundle template profile already emits 24 headers; a header count may only be compared with the **same home's own** before-install baseline.

**What none of the three parts proves**: the static part proves row-level id disjointness only, it **does not prove** same-layer composition; the drill form deliberately does not install `@jiangzhenguo/dsh-codegraph` (its spec is a `github:` form and cannot be frozen to an exact version), so its coexistence has row-level evidence only; and a resolution-level conflict (pnpm ERESOLVE) not firing on this bundle set does not mean it cannot fire on another. The real-migration form cannot prove "hooks really intercept at runtime" or "skills are really loaded by a session" either, nor can it prove codegraph's same-layer composition — that still has row-level static evidence only (G-4, handed to Phase 5).

### Rollback

- **Plugin → legacy deployment**: `dsh plugin --profile web remove <name>`; the manifest (`dependencies` and `dsh.profile.bundles`) reconciles itself. For the legacy deployment you must **re-run the legacy script** to rebuild `$DSH_HOME/{skills/gsd-*,gsd-core,hooks,scripts,gsd-hooks.dsh.json}`, and **hand-restore** the `.stripped-bak` contents into the corresponding `profiles/*/cordis.patch.yml` — there is no other place to recover the bridge block from. **Do not delete `.stripped-bak` after migrating.**
- **One-way asymmetry**: the legacy deployment is machine-wide, the plugin is profile-level. So the blast radius of "remove the old" is always larger than that of "install the new" — which is exactly why the step 1 hard gate comes first.

### Measured values on this machine (examples, measured 2026-11-13)

The table below is what the drill box (20-character home + `@opengsd/gsd-core@1.16.0`) reported; the verbatim log lives in the DRILL-1 section of `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`. **They are only examples**: change the home length or the legacy deployment version and the first three rows move; the last three rows are in-package artifacts and are independent of both path and version.

| Item | Reading | How it was taken |
| ---- | ---- | ---- |
| Legacy skill count | 72 | `ls -d "$DSH_HOME"/skills/gsd-*` |
| Legacy `gsd-health/SKILL.md` | 3084 B | an artifact of a 20-character home + 1.16.0 |
| Legacy `gsd-new-project/SKILL.md` | 3195 B | same (that path occurs 7 times) |
| Bundled `gsd-health/SKILL.md` | 3587 B | independent of home length and version |
| Bundled `gsd-new-project/SKILL.md` | 3856 B | same |
| Bundled skill count | 72 | `ls -d "$PKG"/skills/gsd-*` |
| dump header count | 24 → 25 | before install → after install, same home |

## ② Three axes of difference

Both modes put GSD inside DSH, but they **own** different things: the shell script is machine-wide (it writes `$DSH_HOME` and the global npm prefix), the plugin is profile-level (it writes `profiles/<name>/` only). The three axes below are the only substantive differences; anything outside them is the same job landing in two different places.

### Which one should you use

- **Stay on the shell script** if you still need to **provision many machines in bulk** (one `curl | bash` is enough, no DSH profile has to exist first), need a **fully offline install** (`GSD_PACKAGE_DIR` pointing at a complete npm-layout package directory), or need the script's own **per-profile diagnostic output** (it reports bridge blocks and marker state, one line at a time).
- **Use the plugin** for day-to-day work on one machine: to **enable / disable / remove** with a single `dsh plugin` command, to **upgrade or roll back with one command** (swap one exact version number), or to keep the install confined to the profile instead of the rest of `$DSH_HOME`.
- **Already installed with the script?** Decide, per profile, where each profile should go using **step 1** of §①, and only then uninstall via **step 2** - running both modes at once gives the same skill name two sources, and which one wins depends on provider precedence.

### Comparison

| Axis | Shell script | Plugin | Migration impact |
| ---- | ---- | ---- | ---- |
| Global CLI | `npm i -g @opengsd/gsd-core` puts `gsd_run` on PATH (on this machine it resolves to 1.16.0) | The bundled engine `gsd-core/bin/gsd-tools.cjs` (1.20.1); the skills adapters call `node <GSDROOT>/...` by absolute path, so the plugin does not go through PATH | Removing the global CLI **does not damage** the plugin state; keeping it leaves an engine 5 minor versions behind (1.16.0 vs 1.20.1) |
| `GSD_PROFILE` tiers | `core` / `standard` / `full`, forwarded to the upstream installer (`INSTALLER_ARGS+=(--profile=...)`) | **no equivalent**: the plugin always ships all 72 skills; the slim tier is the unscheduled `dsh-gsd-core` subpackage on the backlog | Migrating from `core` / `standard` gives you **more** skills, not fewer |
| hooks ownership | Machine-level absolute `configPath` (`~/.dsh/gsd-hooks.dsh.json`) plus `pluginRoot=~/.dsh` | In-package self-location (`!!js createRequire(baseUrl)` -> `<package>/config/gsd-hooks.json`) | **not an event-set difference** (both sides carry the same 5 events / 14 matchers, empty two-way set difference); the difference is only who owns `configPath` / `pluginRoot` |

Every cell can be re-checked with one read-only command: for the global-CLI row, `npm ls -g --depth=0` and `readlink -f "$(command -v gsd_run)"`; for the hooks row, a `node -e` count of the key set (5) and matcher count (14) inside `config/gsd-hooks.json`; for the `GSD_PROFILE` row, the script's `--profile=` pass-through and the directory count under the package's `skills/` (72).

### Shared limit: both modes are bound by it

DSH supports only five hook events: `SessionStart`, `PreToolUse`, `PostToolUse`, `SubagentStop`, `Stop` (14 matchers in total, distributed 1 / 7 / 4 / 1 / 1). There is no `PreCompact`, no `FileChanged`, and no statusline event.

**Both modes are bound by it - the shell script and the plugin alike.** Switching to the plugin does **not** buy more events: the plugin only moves the same configuration from a machine-level absolute path into the package (`configPath` self-located), and the event set is unchanged word for word. The script's hooks switches (`GSD_FORCE_HOOKS_PATCH` / `GSD_NO_BRIDGE_SYNC` / `GSD_HOOKS_SANDBOX_PATCH`) likewise have **no equivalent** on the plugin side.

## ③ DSH upgrade / version mismatch: symptom to cause to fix

DSH evaluates version compatibility at **four different moments**, and their observable consequences differ completely. The dangerous one is gate ③: **the command still succeeds and exits 0; what broke is the layer itself.** Every cell below comes from a drill run on this repository on 2026-11-13 (verbatim log in the DRILL-2 section of `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md`), not from a "this is known to happen" retelling.

### The four gates and their verbatim symptoms

| Gate | Symptom (verbatim) | Cause | Fix |
| ---- | ---- | ---- | ---- |
| ① preflight | `dsh: installation rejected:` ... followed by `dsh: nothing was installed.` | The target is a registry / directory spec whose manifest `engines.dsh` does not satisfy the running DSH version, so it is rejected **before** anything is installed | Fix path, item 1 below |
| ② post-install | `dsh: installation rejected:` (the warning appears twice) followed by `dsh: restored package.json, pnpm-lock.yaml, and node_modules.` | The target is a local `.tgz`: pnpm really installs it and then rolls back; `node_modules` **stays on disk** | Same; do not read the rollback as "installed" |
| ③ load | `dsh: skipping profile bundle "<name>": ...` (on **stderr**, exactly one line) | An already-installed bundle fails the check at load / `--dump-config` time, so the whole bundle is skipped; stdout loses rows while `dsh.profile.bundles` stays unchanged | Same; **the exit code stays 0** — the criteria are stderr, layer count and row set |
| ③′ load | MEASURED: dsh: disabling profile plugin row "gsd-hooks-bridge": Plugin @deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1 is incompatible with dsh 0.2.2-rc.1: requirements {"engines.dsh":">=9.0.0"}. Running it may cause crashes or data loss. Update the plugin or install a plugin version compatible with this dsh runtime. To accept this risk explicitly, grant the exact-version exemption for @deepseek-ai/dsh-hooks-claude-code@0.2.2-rc.1 on dsh 0.2.2-rc.1 with `dsh plugin allow-version` or the plugin manager, then retry the installation or restart dsh. Exact-version exemption: not active. (the verbatim line a real boot emitted on this machine) | The row was composed, but the package it points at (here the bridge package `@deepseek-ai/dsh-hooks-claude-code`) does not satisfy the manifest; the row is marked `disabled` and **nothing is written back to any file** | Same; the symptom is "silently no guards", not an error |

**Why gate ③ needs its own "the exit code stays 0" warning**: `--dump-config` and boot both still exit successfully when a bundle is skipped, so a criterion shaped like `dsh --profile ... --dump-config && echo ok` turns a broken state green. Measured on this machine: `EXIT=0`, headers 25 -> 24, stdout 1255 -> 1243 lines, the `# == dsh-gsd` label gone, zero `- id: gsd` rows, and exactly one stderr line. The criteria can only be those four quantities (non-empty stderr / `H1 = H0 - 1` / **presence** of each expected bundle label / the row-id set), and a header count may only be compared with the **same home's own** baseline, never with the length of `dsh.profile.bundles`.

### Pin alignment and what the static gate cannot see

`build/assets/pins.json` is the **single source of truth** for line-by-line pins (`lines.<line>.bridge` / `lines.<line>.peer` / `lines.<line>.dshRange`); `package.json` is the execution truth, and `node build/lib/check-pins.mjs --offline` is the static gate between them. Step (j) composes the package's peer into the string `"<name> <range>"` and compares it **verbatim** with `lines.022.peer`; any difference is exit 2 plus the mismatch line. On this machine, injecting `0.2.2-rc.2` produced exit 2 and exactly one line: `check-pins: peerDependencies @deepseek-ai/dsh-skill-filesystem mismatch — ...`.

**That gate has a hard boundary**: this peer is consumed only by step (j) of `check-pins`. When the package carries its own `engines.dsh`, DSH's compatibility check **returns immediately and never reads `peerDependencies`**, so editing `pins.json` (or the peer) **only reddens CI and can never produce a runtime symptom**. Runtime symptoms can only be injected through the installed package's own `engines.dsh` or the bridge package's manifest — that is exactly how gates ③ / ③′ above were measured. Mistaking the static gate for the runtime gate ships a release that is "green in CI but one layer short when installed".

### Fix path (in recommended order)

1. **Install a version that matches the DSH runtime** (first choice). The matching window is defined by `dshRange` in `build/assets/pins.json`; read the runtime with `dsh --version`. Upgrades and rollbacks are both just a swap of one exact version number.
2. **`allow-version`: an exact-pair risk exemption you take explicitly** (second choice). `dsh plugin --profile <p> allow-version <name>@<ver> --dsh-version <exact> --accept-risk` writes into `<profile>/compatibility.json`; it applies to **one package version × one DSH version** only and **expires as soon as either version changes**, and the host warns explicitly that it may crash or corrupt data. It is not a way to make the compatibility gate green; it is a recorded risk acceptance.
3. **Never `--force`.** `--force` is a pnpm resolution switch and does not change DSH's judgement; it only gets the incompatible package installed so that the load layer silently skips it — an illusion of "installed but not in effect", which is harder to diagnose than a failed install.