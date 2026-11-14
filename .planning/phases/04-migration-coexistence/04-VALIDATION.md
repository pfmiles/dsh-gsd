---
phase: "04"
slug: "migration-coexistence"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: false
wave_0_complete: true
created: "2026-11-13"
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
>
> **History:** 规划期从 `04-RESEARCH.md` § Validation Architecture 落盘（`status: draft` /
> `nyquist_compliant: false` / `wave_0_complete: false`），并在规划定型后按**真实**键位重排为
> **4 个 plan / 9 个任务**（ROADMAP 的 2-plan 草图按需求簇拆开：04-01 MIG-01+tracer、04-02
> MIG-02/MIG-03、04-03 HOOK-05、04-04 MIG-04）。三段式演练（DRILL-1/2/3）与 6 条 Wave 0
> 交付物由此成为本 phase 的实际判据骨架。
>
> **判定（2026-11-14 State A 审计，HEAD `3c4ffcf`，4/4 PLAN + 4/4 SUMMARY 复核）= PARTIAL**
> （`status: validated` + `nyquist_compliant: false`）：5 条需求在 `REQUIREMENTS.md` 全部 `[x]`，
> 执行证据齐全（DRILL-1/2/3 三段逐字读数 + 供应链人审 `APPROVAL:` 行 + 套件内的 ⑭），但
> **文档内容面与「静态门有牙」面的自动断言，载体全是 PLAN 内的一次性门，不在 `npm test` 里**；
> 其中 §② 的那条一次性门在 HEAD 上还会因过时的 `##` 计数子句转红。缺口与事实订正逐条见
> §Coverage Gaps 与事实订正。本次审计的写面被限定在本文件，故按 03 首次审计的同一分支
> （§4「Skip — mark manual-only」）处置为 PARTIAL，而不是当场补测试。

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node 内置 `node --test`（Node `v24.21.0`），无第三方测试框架 |
| **Config file** | none（无 vitest/jest/pytest 配置；用例即 `tests/*.test.mjs`） |
| **Quick run command** | `npm test` = `node --test tests/*.test.mjs`。**实测 6 文件 / 38 顶层用例**：build-smoke 2 + compat-matrix 8 + docs-consistency 14 + pack-contents 4 + rewrite-map 7 + version 3（逐文件 `grep -c '^test('` 核过，与 `BUILD.md:16` 的 `预期 38/38` 等值）。wave 1–2 期为 37，04-03 落 ⑭ 后为 38 |
| **Full suite command** | `node --test --test-concurrency=1 tests/*.test.mjs` |
| **Estimated runtime** | 全量串行 ~10–20 秒（登记值，本次未复跑套件——见下）；**本 phase 自己那 8 条一次性门复跑合计 0.36 s**（本次实测） |

**串行是硬要求，不是偏好。** `build-smoke` 会重写构建树；并发运行会假红
`gate C: no SKILL.md under skills/gsd-*`。`package.json` 实测仍是
`"test": "node --test tests/*.test.mjs"` / `"prepack": "node build.mjs && node --test tests/*.test.mjs"`
——**两者都不带 `--test-concurrency=1`**（已知的结构性假红隐患，不属本 phase 范围；本 phase 的
三次 `npm pack` 与多次全量串行均未触发）。

**本 phase 的主判据不是 JS 测试，而是 shell 断言块——但这条理由只适用于「真装/真卸」。**
MIG-01 / MIG-04 动态段 / HOOK-05 运行时段都需要真的装一次、卸一次并观察宿主行为；D-02 禁止在
真实 home 上做、D-06 禁止新增**随包**检测脚本。但 `tests/` 不随包发布（`files` 实测 9 项，不含
`tests`），因此**文档形状类判据（§②/§③/步骤 6/备料契约/静态门有牙）没有 manual-only 的理由**
——它们是「可自动化却没进套件」，这正是本文件 `nyquist_compliant: false` 的来源，逐条见
§Coverage Gaps。下表逐门区分载体与 HEAD 复跑结果。

---

## 判据载体与 HEAD `3c4ffcf` 复跑实测（2026-11-14）

> 复跑方式：把各 PLAN 的 `<automated>` `node -e` 块原样抽到 `/tmp` 后执行（cwd = 仓根），
> **不跑 `npm test`**（套件由编排器在随后的回归门串行执行，两次并发会假红）。全部只读。

| 门（stdout token） | 定义处 | 在 `npm test` 内？ | HEAD 复跑 | 备注 |
|---|---|---|---|---|
| `migration-doc-shape`（§① runbook） | `04-01-PLAN.md:288` | ❌ 一次性 | 🔴 原文红：`zh half has 3 ## headings, want 1 (only ① runbook in this plan)`；**仅**把该子句 `1→3` 后 → `migration-doc-shape ok` | 错误文案自述「in this plan」= **时点门**；§① 的其余断言（D-03 硬门、`--no-npm-bin`、`npm_config_prefix`、`--uninstall`、`stripped-bak`、20 字符模板、`$HOME/.dsh` 真实迁移场、限定式文件头）在 HEAD 上仍全部成立 |
| `drill-evidence`（DRILL-1 证据册形状） | `04-01-PLAN.md:332` | ❌ | 🟢 `drill-evidence ok` | |
| `readme-entry`（README 双语入口） | `04-01-PLAN.md:378` | ❌ | 🟢 `readme-entry ok`（`# dsh-gsd` 仍 2 / 徽章 2 / 裸名 install 整行 2） | 目标行为另由 ⑭ 在套件内覆盖 ⇒ 04-01-T2 有真正的 per-commit 信号 |
| `section-2`（§② D-12 三轴表） | `04-02-PLAN.md:189` | ❌ | 🔴 原文红：`zh half has 3 ## headings, want 2`；仅把 `2→3` 后 → `section-2 ok` | **G-1**：D-12 的实质断言只活在这里 |
| `oldrepo-prep`（备料四文件契约） | `04-02-PLAN.md:289` | ❌ | 🟢 `oldrepo-prep ok` | **G-2** |
| `oldrepo-untouched`（旧仓零写入） | `04-02-PLAN.md:319` | ❌（只读 git） | 🟢 HEAD `41fcc7a` / 工作树空 / remote 未变 | **G-2** |
| `files-scope`（`files` 九项无 `docs`） | `04-02-PLAN.md:321` | ❌ | 🟢 `files-scope ok`（len=9） | 与 `tests/pack-contents.test.mjs` 的顶层白名单互为冗余 |
| `drill-2-evidence`（DRILL-2 证据册形状） | `04-03-PLAN.md:265` | ❌ | 🟢 `drill-2-evidence ok` | |
| `section-3`（§③ 四层症状表） | `04-03-PLAN.md:315` | ❌ | 🟢 `section-3 ok`（四个层标签做行首 / 五条逐字症状 / `allow-version` + `--force` / ③′ 行带 `MEASURED:`） | 结构（两半各 3 个 `##`）另由 ⑭ 覆盖 |
| `coexist-static`（四来源五 id） | `04-04-PLAN.md:189` | ❌（读真实 `~/.dsh`） | 🟢 `coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market` | 依赖本机已装物，天然不适合进套件 |
| `step-6`（步骤 6 并存自检） | `04-04-PLAN.md:297` | ❌ | 🟢 `step-6 ok` | |
| `drill-3-evidence`（DRILL-3 证据册形状） | `04-04-PLAN.md:331` | ❌ | 🟢 `drill-3-evidence ok` | |

**两条未复跑，理由与替代确证：**

- **`static-pin-gate`（`04-03-PLAN.md:159`）**——「篡改 → exit 2 → 复原」会写 `build/assets/pins.json`，
  属本次审计的禁改面，**未复跑**。残留面改用只读方式确证：HEAD 的
  `shasum -a 256 build/assets/pins.json` = `45c643ea3711e998445369c61cf2958c1ea63bc6062a9e143f28e1d5c494a2bb`，
  与证据册记录的**复原后**值逐字节相同 ⇒ 注入没有留在工作树里。健康态方向由套件
  `tests/compat-matrix.test.mjs:98` ⑥ 每提交断言（只断言 `exit 0`，见 **G-3**）。
- **`DRILL-1/2/3` 的 bash 演练块**——需要联网安装 / 真实 installer / 临时 home，单轮 ≈2 min（04-01
  记录「三次完整演练 ≈6 min」）且会重新下载包，**未复跑**；判据由证据册的逐字读数加
  `drill-*-evidence` 三门把守。

---

## Sampling Rate

- **After every task commit:** `npm test`（wave 1–2：37/37；04-03 落 ⑭ 之后：38/38）。串行，且先确认没有并发 `build` 在跑。
- **After every plan wave:** `node --test --test-concurrency=1 tests/*.test.mjs` + 对临时 home 复跑本 wave 触及的 shell 判据块。
- **Before `/gsd-verify-work`:** 全量绿 + 演练日志落盘 + `docs/MIGRATION.md` 双语两半各含三节（D-10/D-11）。
- **Max feedback latency:** ~20 秒（全量串行）；一次性门合计 0.36 秒（本次实测，8 条）。

---

## Per-Task Verification Map

> 按**真实任务**键控（4 个 plan / 9 个任务）。`<automated>` 的完整命令体在各自 PLAN.md 里；
> 本表登记任务、判据形态与**实际落地位置**，不复制命令正文。状态列给出的是执行后的实测结论。

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-T1 | 04-01 | 1 | MIG-01, MIG-01′ | T-4-01/02/03/04/16/17/18 | 隔离头 `export DSH_HOME` + echo；`--no-npm-bin` + `npm_config_prefix` 双保险；引擎一律绝对路径；零 `allow-version`/`--force`；两条基线前提（20 字符 home、GSD 1.16.0）**由演练自己断言** | integration（manual-only） | 04-01 T1 的 `bash` 块（四段判据，末尾 `DRILL-1 PASS`；三次运行逐字同构） | ✅ `docs/MIGRATION.md` + `04-DRILL-EVIDENCE.md` §DRILL-1 | ✅ 已执行（2026-11-13T17:36:16Z，`72/3084/3195` → `0/absent/ABSENT` → `3587/3856/72`，标头 `24→25`） |
| 04-01-T2 | 04-01 | 1 | MIG-03（本仓 README 半边） | T-4-05 | README 只加可达性：无字面量 `# dsh-gsd`、无第三枚徽章、无第三行裸名安装 ⇒ 双语切片点不位移 | unit（automated，**套件内**） | `node --test tests/docs-consistency.test.mjs` → **14/14**（⑭ 断言 README 两半各含 `docs/MIGRATION.md`）；04-01 当时为 **13/13** | ✅ `tests/docs-consistency.test.mjs:348`（⑭） | ✅ green（⑭ 为 04-01-T2 提供真正的 per-commit 信号；`readme-entry ok` 另在 HEAD 复跑绿） |
| 04-02-T1 | 04-02 | 2 | MIG-02 | T-4-08/09 | 双语同构（两半各 **3** `##`），en 半零 CJK；hooks 轴写成**归属**差异而非事件差异，且把 5 事件 / 14 matcher / 双向差集为空写进影响列；「共同限制」必须独立成 `###` 而非表行 | docs（一次性形状门，**不在套件**） | §② 形状门 `node -e` → `section-2 ok`；**HEAD 复跑原文红（`want 2`）**，仅改 `##` 子句后绿 | ✅ 门在 `04-02-PLAN.md:189-250` | ⚠️ PARTIAL（**G-1**） |
| 04-02-T2 | 04-02 | 2 | MIG-03（旧仓备料半边） | T-4-07 | 只写 `docs/oldrepo-link/`，不 `git add`/commit/push、不改 remote；旧仓 HEAD `41fcc7a`、工作树空、remote 未变 | smoke（一次性 shell + node，**不在套件**） | `oldrepo-prep ok` / `oldrepo-untouched ok` / `files-scope ok`（HEAD 复跑全部绿） | ✅ `docs/oldrepo-link/` 四文件 | ⚠️ PARTIAL（**G-2**） |
| 04-03-T1 | 04-03 | 3 | HOOK-05（静态）, HOOK-05′ | T-4-04/10 | 篡改 `lines.022.peer` 必 exit 2；复原后 `git status --porcelain build/assets/pins.json` 为空 | unit（**健康态在套件内**；有牙方向一次性） | `node build/lib/check-pins.mjs --offline`：套件 `tests/compat-matrix.test.mjs:98` ⑥ 每提交断言 exit 0；「篡改 → exit 2」由 04-03 T1 一次性块记录（本次未复跑，见上节） | ✅ `build/lib/check-pins.mjs` + `tests/compat-matrix.test.mjs:98` | ⚠️ PARTIAL（**G-3**）；三态实测 `0 → 2 → 0`，`lines.021.peer` 全程未动 |
| 04-03-T2 | 04-03 | 3 | HOOK-05（运行时） | T-4-11/17 | 症状逐字且来自实测：**bundle 级 ③ + row 级 ③′**；`H1 = H0 − 1`、`N1 < N0`、`# == dsh-gsd` 标签消失、`- id: gsd` 为 0、stderr 恰 1 行；**标头数不与 bundles 长度比** | integration（manual-only） | 04-03 T2 的 `bash` 块（末尾 `DRILL-2 PASS`）+ 证据门 `drill-2-evidence ok`（HEAD 复跑绿） | ✅ `04-DRILL-EVIDENCE.md` §DRILL-2 | ✅ 已执行（`injected: EXIT=0` / 25→24 / 1255→1243 / 526 B 逐字 / `ROWLEVEL MEASURED`；boot 随后 `MISSING_CREDENTIAL` 终止） |
| 04-03-T3 | 04-03 | 3 | MIG-02′, HOOK-05′ | T-4-12 | ⑭ 采用**围栏感知**的 H1 计数（行首 `# 注释` 不算标题）；①–⑬ diff 为空；`BUILD.md:16` 单行 37→38 | unit（automated，**套件内**） | `node --test tests/docs-consistency.test.mjs` → 14/14；`node --test --test-concurrency=1 tests/*.test.mjs` → 38；`grep -c '预期 38/38' BUILD.md` = 1（HEAD 实测；`37/37` = 0） | ✅ `tests/docs-consistency.test.mjs:348` + `BUILD.md:16` | ✅ green（⑭ 变异实验双向验证：`##` 降级 → 单条转红；围栏内注入 `# 假标题` → ⑭ 仍绿） |
| 04-04-T1 | 04-04 | 4 | MIG-04（供应链门） | T-4-13/19 | `checkpoint:human-verify gate="blocking-human"`，任何模式都不自动放行；裁决写成证据册 `APPROVAL: approved\|hold` 行，**只认最后一行** | checkpoint（human） | 人工裁决；验收为 `grep -E "^APPROVAL: (approved\|hold)" "$EV" \| tail -n 1` | ✅ `04-DRILL-EVIDENCE.md` 的 `APPROVAL: approved 2026-11-14T06:17:59Z`（**唯一一条**，L117；`tail -n 1` 取到的就是它） | ✅ 人工批准（页面级复核由人完成；npmjs 对自动抓取 403） |
| 04-04-T2 | 04-04 | 4 | MIG-04, MIG-04′ | T-4-14/15 | 四判据合取（stderr 0 字节 + 同 home `H1 > H0` 且三包标签出现 + 四 id 各 1 + `uniq -d` 为空）**由可运行块现场执行**；静态段零安装 | integration（manual-only 动态）+ smoke（静态一次性） | 静态 `coexist-static ok: …`；动态 `COEXIST-DRILL PASS`（RUN2/RUN3）；步骤 6 `step-6 ok`；证据门 `drill-3-evidence ok`（三门 HEAD 复跑绿） | ✅ `docs/MIGRATION.md` 步骤 6 + `04-DRILL-EVIDENCE.md` §DRILL-3 | ✅ 已执行（`bundles=5` / `stderr 0` / `headers 24->27` / 四 id 各 1 / `uniq -d` 空）；codegraph 仅行级 → **G-4** |

*Status: ✅ green · ✅ 已执行（manual-only / human）· ⚠️ PARTIAL（见 §Coverage Gaps）*

**一条不可再引入的伪不变量（T-4-17）：** 「`^# == ` 标头数 == `dsh.profile.bundles` 长度」是**假的**。
标头按**连续来源段**打，`dsh-web-app` 就地 patch base 的行——本轮两次实测都自证：2-bundle 模板 profile
打出 **24** 个标头 / 1243 行（加 1 个 bundle 后 25），5-bundle 的并存 home 打出 **27** 个标头（`27 = 24 + 3`）。
正确形态是**同一 home 内**的前后关系（`H0` → `H1`）加逐 bundle 的**存在**断言，且 `H0` 必须先断言
非空（`-s` 且标头数 > 0），否则 0=0 会空洞成立。

**manual-only 的理由（已订正）：** MIG-01 / MIG-04 动态段 / HOOK-05 运行时段的主判据都要求真的
装/卸一次并观察宿主行为，而 D-02 禁止在真实 home 上做、D-06 禁止新增**随包**检测脚本——所以它们的
「自动化」形态只能是文档里的可复制命令块 + 一次性演练留证。planner 已把这件事写成 Task 的验收物：
`04-DRILL-EVIDENCE.md` 的 DRILL-1/2/3 三段，每段都被一个 token 门交叉核对（只写 token 而不贴现场
输出会被挡下）。**但这套理由不能外溢到文档形状类判据**——`tests/` 不随包发布，那类断言完全可以在
套件里逐提交跑（见 §Coverage Gaps 的 G-1/G-2/G-3）。

---

## Wave 0 Requirements

- [x] `docs/MIGRATION.md` —— 三节双语同构（D-10/D-11），§① 同时给出 0-A 演练场与 0-B 真实迁移两个迁移场。**HEAD 实测**：H1 = 2、两半 `##` 各 **3**、`###` 各 **15**、585 行；`section-3 ok` + ⑭ 14/14。
- [x] runbook 的命令块（Runtime State Inventory A–D + Code Examples 复验 A/B/C）—— MIG-01/04/HOOK-05 的唯一可执行载体；DRILL-1/2/3 三段都是从这些块跑出来的。
- [x] 旧仓备料：`docs/oldrepo-link/` 四文件（`snippet.en.md` 为唯一可推件、`snippet.zh.md` 标「备而不用」、`README.md`、`pr.md`）+ 章节锚点「`## Quick start` 之前」+ PR title/body（D-09）。`oldrepo-prep ok`、旧仓三处 `oldrepo-untouched ok`（HEAD `41fcc7a` / 工作树空 / remote 未变，本次 HEAD 复跑）。
- [x] 演练日志留证：`04-DRILL-EVIDENCE.md` 的 DRILL-1/2/3 三段 + `APPROVAL:` 行（MIG-01/MIG-04/HOOK-05 三条 manual-only 的证据册）——`wc -l` = 172、末行无换行符（该文件的既有形态，04-02/03/04 三次追加都因此记过 1 行 EOF 位移）。
- [x] **必需（不再是可选）**：`tests/docs-consistency.test.mjs` 追加 ⑭（README 顶部 MIGRATION 入口 + 两半各恰 3 个 `##`），**同一提交**同步 `BUILD.md:16` 的活体计数 37 → 38（04-03 T3；`BUILD.md` 保持单行 diff `1 1`）。HEAD 实测：`预期 38/38` 恰 1 处、`37/37` 0 处。
- [x] 无新框架安装需求（`node --test` 已就位；`npm test` 仍是一条 `node --test tests/*.test.mjs`）。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | 状态 / 证据 |
|----------|-------------|------------|-------------------|-------------|
| 先卸后装后旧源全灭 + 新源可举证 | MIG-01 | 需真实 installer + 网络 + 临时 home；D-02 禁止在真实 home 做 | 临时 `DSH_HOME`（恰 20 字符）内跑 `GSD_VERSION=1.16.0` 旧脚本 → **先断言版本前提** → 量基线（72 技能 / 3084 / 3195 / bridge 命中）→ D-03 硬门 → `--uninstall` → 阴性对照 A–D（机器级一面分 `ABSENT`/`PRESENT`）→ `npm pack` → `dsh plugin add` → 内容比对（3587 / 3856 / 72） | ✅ 已执行 — `04-DRILL-EVIDENCE.md` §DRILL-1（19 行 `(操作, UTC, 输出要点)`，三次运行逐字同构）。**负向观测一并留证**：装旧脚本↔卸载窗口里 `--dump-config` 实测 exit 1 / 0 标头 / stderr 1877 B（模板 profile 的 patch 是空数组 `[]`，旧脚本再追加顶层 `- insert:` 致 YAML 解析失败），已标注**不得充当通过形态**；收尾的 `npm ls -g` 曾因临时 `npm_config_prefix` 未 unset 报 `NOT FOUND`，同样标注为采样口径错误 |
| 同 profile 多 bundle 并存无冲突 | MIG-04 | 需在临时 home 联网安装两个 `SUS` 第三方包才证明「同层合成」，故前置 `blocking-human` 门 | 四判据的合取：stderr **0 字节**；**同一 home** 的 `H1 > H0`（`H0` 装任何包之前取，且必须 `> 0`）且 `dsh-gsd` / `dsh-deja` / `dshmarket` 三包标头标签各**出现**；`gsd` / `gsd-hooks-bridge` / `deja` / `dsh-market` 四 id 各恰 1 行；这四者 `uniq -d` 为空。**不得**用 exit code（实测恒 0），**不得**用「标头数 == bundles 长度」（T-4-17） | ✅ 已执行 — `04-DRILL-EVIDENCE.md` §DRILL-3 动态段：`bundles=5` / `stderr_bytes=0` / `headers=24->27` / 四 id 各 1 / `uniq -d` 0 行 / 逐字 `COEXIST-DRILL bundles=5 headers=24->27 rows=gsd,gsd-hooks-bridge,deja,dsh-market env=temp-home`。`@jiangzhenguo/dsh-codegraph` **未动态安装**（见 **G-4**） |
| 三类错配各有一条实测症状 → 原因 → 修复 | HOOK-05 | 需注入错配并观察宿主真实反应 | 静态：篡改 `lines.022.peer` → `check-pins` exit 2 → 复原 → exit 0 且 `git status` 空。运行时：改包内 `engines.dsh` → dump 的 `H1 = H0 − 1`、标签消失、rows 0、stderr 恰 1 行且 **exit 仍 0**（假绿证据）；**再补 row 级 ③′**（改 bridge 包 `engines.dsh` 后 boot，期望 `dsh: disabling profile plugin row "…"`）。症状须实测，不得由源码推导代填；未复现的写 `NOT REPRODUCED:` | ✅ 已执行 — §DRILL-2 两段：静态 `EXIT=0 → 2 → 0`（stderr 167 B 逐字，复原 sha256 逐字节相同）；运行时 bundle 级 `EXIT=0` 假绿 + 25→24 + 1255→1243 + 526 B 逐字；**row 级 `ROWLEVEL MEASURED`**（把 RESEARCH 的 A4 从 `[ASSUMED]` 升级为实测）。boot 随后 `dsh: MISSING_CREDENTIAL …` 终止 ⇒ 完整会话行为**仍未证明**，已写入文档与证据册边界段 |
| 旧脚本定位为保底 / 离线可被验证 | MIG-03 | 需读旧仓 README 并判定离线档是否成立 | 备料片段与 PR body 落盘；旧仓 HEAD / 工作树 / remote 保持只读核验；离线模式可用性以「本仓 payload 树是否具备离线档前提」实测判定（Pitfall 13） | ✅ 已执行（备料侧）/ ⚠️ **离线模式未真跑**：实测 `gsd-core/bin/install.js` 与 `gsd-core/package.json` **均 ABSENT** ⇒ `GSD_PACKAGE_DIR` 离线档在本仓产物上不成立，结论为「不可行」而非「跑过」。备料四文件 `oldrepo-prep ok`、旧仓零写入 `oldrepo-untouched ok`（HEAD 复跑） |
| 两个 `[SUS]` 第三方包的供应链门 | MIG-04 | 门本身是人的判断（发布者 / 源码仓 / 确切版本 / 无 `postinstall` 的页面级复核），机器只能证明裁决行在场与门在自动重跑时生效 | 证据册记录在用版本（`dsh-deja@0.24.0` / `dshmarket@1.73.15`）、`postinstall` 均 `none`、源码仓，并向人呈现后取得裁决；裁决只写一行 `APPROVAL:`，改判只在文件末尾追加 | ✅ 已执行 — `APPROVAL: approved 2026-11-14T06:17:59Z`（**唯一一条** `APPROVAL:` 行，L117；`grep -c` = 1，其后追加的 DRILL-3 不含裁决行，故 `tail -n 1` 取到的仍是它）；registry 版本漂移已如实登记（`latest` 已前进到 `0.24.2` / `1.73.19`，演练仍钉住人审批准的确切版本） |

---

## Coverage Gaps 与事实订正（2026-11-14）

### 缺口（4 条）

| 缺口 | 需求 | 现状（本次实测） | 为什么算缺口 | 建议落点 |
|---|---|---|---|---|
| **G-1** | MIG-02 | §② 的 D-12 断言只在 `04-02-PLAN.md:189-250` 的一次性 `node -e`。HEAD 复跑**原文红**（`zh half has 3 ## headings, want 2`）；仅把 `##` 子句 `2→3` 后 → `section-2 ok`（其余断言全部成立）。套件里 ⑭ 只判「两半各 3 个 `##` + README 入口 + 语言分半」 | 三轴表头逐字、**「共同限制」必须独立成 `###` 而非表行**（D-12 的硬红线）、5 个事件必须行内代码且落在该小节内——都是可自动化的文本判定，**⑭ 一条都不覆盖**：把共同限制降级成表行时 ⑭ 仍绿 | `tests/docs-consistency.test.mjs` 追加 ⑮（同一提交把 `BUILD.md:16` 38→39） |
| **G-2** | MIG-03（备料侧） | `oldrepo-prep` / `files-scope` / `oldrepo-untouched` 三条一次性门 HEAD 复跑全绿，但不在套件 | 与 G-1 同源：`docs/oldrepo-link/` 四文件是 Phase 5 会直接复制的素材，漂移不会被 per-commit 回路捕获（README 半边已由 ⑭ 覆盖，备料半边没有） | 并入 ⑮，或新增 `tests/oldrepo-prep.test.mjs`；旧仓三处断言依赖仓外路径 `../install-gsd-dsh`，须条件 `skip` |
| **G-3** | HOOK-05（静态面「有牙」） | 套件 `tests/compat-matrix.test.mjs:98` ⑥ 每提交 spawn `check-pins --offline`，但**只断言 exit 0**；「篡改 → exit 2」只在 `04-03-PLAN.md:159` 的一次性块（本次未复跑：它会写 `build/assets/pins.json`） | 门退化成**恒绿**（步骤 (j) 被短路、比较字段改错）时 ⑥ 仍绿——而「恒绿」正是 HOOK-05 要防的假绿本身 | 扩 ⑥：把 `pins.json` 复制进 `mkdtemp` 后改坏，断言 exit 2 与逐字失配串（**不写仓**） |
| **G-4** | MIG-04（codegraph 动态面） | 静态段绿（`coexist-static ok: gsd gsd-hooks-bridge dsh-codegraph deja dsh-market`）；动态段只装了 deja / dshmarket / 本仓 tarball，`@jiangzhenguo/dsh-codegraph` **未装** | spec 是 `github:…/#main`（冻结不了确切版本），D-02 又不许在真实 home 上试装 ⇒ 本 phase 只能给行级证据 | **Escalated → Phase 5**：真实迁移 `web` profile 后重跑步骤 6 的 CB-8 四条判据（已同时写入文档与证据册） |

> **计数口径：** Gaps found = **4**、Resolved = **0**、Escalated = **1**（G-4）。G-1/G-2/G-3 未处置的
> 原因不是「不可自动化」，而是本次审计的写面被限定在 `04-VALIDATION.md` 内——与 03 首次审计
> 完全同型（那次的 G-1/G-2 在下一轮补测后落为 ⑧/⑪⑫⑬ 并升为 COMPLIANT）。

### 与种子版相比的事实订正（8 条）

| # | 项 | 种子版写的 | 实测 / 证据 |
|---|---|---|---|
| C-1 | 套件计数（04-01-T2 行） | `docs-consistency` **13/13** | **14/14**（04-03 追加 ⑭；⑭ 恰好覆盖 README 两半各含 `docs/MIGRATION.md` = 04-01-T2 的交付物）。HEAD 实测该文件 14 条 `test(` |
| C-2 | §② 的 `##` 计数 | 「两半各 **2** 个 `##`」 | HEAD 实测两半各 **3**（§③ 与步骤 6 落位后）；§② 一次性门的 `want 2` 子句因此过时（= **G-1** 的一半事实基础） |
| C-3 | 04-03-T2 的判据形态 | 只写到 bundle 级 ③（`H1 = H0 − 1`、stderr 1 行） | 实况还有 **③′ row 级**：有界 boot 打出 `dsh: disabling profile plugin row "gsd-hooks-bridge": …`（`ROWLEVEL MEASURED`）。种子版对此**低估**了交付面 |
| C-4 | MIG-03 的 manual-only 行 | 「需读旧仓 README 并**真跑离线模式**」 | **离线模式没有跑**：本仓 payload 树实测缺 `gsd-core/bin/install.js` 与 `gsd-core/package.json`（Pitfall 13 的判定依据）⇒ `GSD_PACKAGE_DIR` 离线档在本仓产物上不成立。该行承诺的「真跑」应读作「以缺失项实测判定不可行」，属**未执行项**（已在 Manual-Only 表内如实改写） |
| C-5 | `File Exists` 列 | 5 行 `❌ W0` | 5 行全部落地：`docs/MIGRATION.md`（+ `04-DRILL-EVIDENCE.md`）/ `docs/oldrepo-link/`×4 / `tests/docs-consistency.test.mjs:348` / `build/lib/check-pins.mjs` + `compat-matrix ⑥` |
| C-6 | 围栏感知的 naive 计数 | 04-03 突变实验时 naive `grep -c '^# '` = **28**（真实 H1 = 2） | HEAD 实测 **30**（04-04 的步骤 6 又加了行首 `#` 注释行），真实 H1 仍 **2**、⑭ 仍绿——naive 计数随内容单调上涨，正是不能拿它当判据的理由 |
| C-7 | Manual-Only 行数 | 4 行 | **5 行**（补入 04-04-T1 的供应链人审门：有 `APPROVAL:` 留痕与页面级复核读数，属人工判据，**不**计入缺口） |
| C-8 | Wave 0 结账 | 5 项 `[ ]` + 1 项 `[x]` | 6 项全 `[x]`，逐项带证据（见 §Wave 0 Requirements） |

**未改动、经核对仍准确的部分：** `38 = 2+8+14+4+7+3` 的逐文件算术、「串行是硬要求」的理由与
`package.json` 缺 `--test-concurrency=1` 的债务登记、T-4-17 伪不变量的两轮实测数值（24→25 / 24→27）、
种子版四条 manual-only 的「为什么人工」论证（第 5 条的论证为本轮新增），以及 9 个任务的 Threat Ref
映射（逐条回查 4 个 PLAN 的 `threat_model` 均在盘）。

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies（9 个任务行：**8 条有 `<automated>` 块**，唯一例外是 04-04-T1 的 `checkpoint:human-verify gate="blocking-human"`——门被真的走完（唯一一条 `APPROVAL: approved` 在证据册 L117，`grep -c` = 1），不是跳过）
- [x] Sampling continuity: no 3 consecutive tasks without automated verify（最长连续人工段 = 04-04-T1 与 04-04-T2 的动态半，两任务；其前 04-03-T3 是套件内的 ⑭/全量，其后无任务）
- [x] Wave 0 covers all MISSING references（6/6 已结账，见上）
- [x] No watch-mode flags（`npm test`、全量串行、12 条一次性门全部一次性退出；无 `--watch`）
- [x] Feedback latency < 20s（一次性门合计 **0.36 s** 为本次实测；全量串行 ~10–20 s 为登记值，本次按纪律未复跑套件）
- [ ] `nyquist_compliant: true` set in frontmatter —— **不置 true**：G-1 / G-2 / G-3 是「可自动化却不在套件」，与 03 首次审计同类（那轮同样停在 `nyquist_compliant: false`）；G-4 已 Escalated 至 Phase 5。写面限定在本文件，故不在此轮补测试。

**Approval:** partial 2026-11-14（gsd-validate-phase / DSH `verify:post` nyquist 钩子，State A 审计）——HEAD `3c4ffcf`；4/4 PLAN + 4/4 SUMMARY + `04-DRILL-EVIDENCE.md` 复核；12 条一次性门抽到 `/tmp` 复跑（10 绿、2 红且红因已定位为过时 `##` 子句），`pins.json` 以 sha256 只读确证无残留，套件计数按其纪律未复跑。结论 **PARTIAL**：5 条需求全部落地且证据齐全，但 3 条可自动化断言仍未进入 per-commit 回路。

## Validation Audit 2026-11-14

| Metric | Count |
|---|---|
| Gaps found | 4 |
| Resolved | 0 |
| Escalated | 1 |
