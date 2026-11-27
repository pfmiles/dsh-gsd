# Phase 4 — UI Review

**Audited:** 2026-11-14（锚点 `7de4010..HEAD` = `3c4ffcf`，15 个提交；审计时工作树 `git status --porcelain` 为 0 条）
**Baseline:** 无 `04-UI-SPEC.md` —— 本相位从未生成设计契约。`ui-phase` 没有被运行，原因不是疏漏而是前提不成立：plan gate 的 `frontend` 判据全程为 `false`，没有可规格化的界面。全仓 `git ls-files | grep -c 'UI-SPEC'` = 0，相位目录内 `*-UI-SPEC.md` 亦为空。因此本次**没有可比对的契约**，也没有按「抽象 6 支柱标准」抢救出分数的做法。
**Screenshots:** 未采集 — 不适用。`localhost:3000` / `:5173` / `:8080` 本次实测全部返回 `000`（无服务在听）；唯一在听的 `:3091` 是 DSH harness GUI（host 自有的会话 shell），不是本相位交付物，采集它等于把无关界面记为审计证据。
**Interaction captures:** 关闭 —— `.planning/config.json` 无 `workflow.ui_interaction_capture` 键，`query config-get workflow.ui_interaction_capture --raw` 返回 `false`。
**Auditor:** 以 `gsd-ui-auditor` 角色行内执行。本会话 subagent 委派层级已用尽（depth 1 / 剩余 0），按工作流自身的「以文件系统与 git 状态做完成核对」回退路径核对，不再另起子代理。

---

## 判定：NON-UI 相位 — 视觉审计不适用

相位 4 是迁移文档与并存验证。撇开 `.planning` 工件，它**改动面的全集**是 8 个文件，恰好落在两类里：文档（`docs/MIGRATION.md`、`docs/oldrepo-link/{README.md,snippet.en.md,snippet.zh.md,pr.md}`、`README.md`、`BUILD.md`）与测试（`tests/docs-consistency.test.mjs`）。没有组件、没有样式、没有布局、没有交互、没有图片资源。6 支柱中没有任何一栏存在可计分的对象。

下面三条判据是**本次重新实测**的，不是从相位 3 的报告里搬来的。

### 判据 1：词汇门 —— 该相位不是前端相位

```json
// gsd_run check ui-safety-gate 4 --raw
{"frontend": false, "hasUiFiles": false, "hasUiSpec": false, "block": false}
```

`frontend: false` 来自 `.planning/ROADMAP.md` 的 Phase 4 段对 UI 词表（`UI|interface|frontend|component|layout|page|screen|view|form|dashboard|widget`，词边界锚定，`ui-safety-gate.cjs` 的 `UI_TOKENS`）的扫描。该段 goal 原文是「脚本部署用户的无痛迁移，两种方式可解释可回退」，三条 Success Criteria 分别讲 runbook 走通、旧仓 README 互链、与 codegraph/deja/dshmarket 并存 —— 没有一条描述界面。

这条 `block: false` 是**活门通过**，不是门被关掉：`gsd_run loop render-hooks execute:wave:post --raw` 显示 `capId: "ui"` 的 gate 已注册（`when: workflow.ui_safety_gate`、`blocking: true`、`onError: "halt"`）。

### 判据 2：文件面（相位 evaluation scope）—— 该相位没碰过 UI 文件

```text
$ gsd_run check evaluation-scope --phase 04 --raw
{"unit": {"kind": "phase", "phase": "04"}, "status": "resolved", "source": "task-commits", "reason": null, ...}
```

`status: resolved`，payload 里没有 `scopeStatus` / `readError` —— 这个 `false` 是「确实没有」，不是「读不到」。9 个 task 提交，去重后 8 个文件：

`BUILD.md` · `README.md` · `docs/MIGRATION.md` · `docs/oldrepo-link/README.md` · `docs/oldrepo-link/pr.md` · `docs/oldrepo-link/snippet.en.md` · `docs/oldrepo-link/snippet.zh.md` · `tests/docs-consistency.test.mjs`

对这份清单直接施加 `gate-ui-safety.cjs:24` 的 `/\.(tsx|jsx|css|scss|sass|less|vue|svelte|html)$/i` 与同文件 `:25` 的 `/\/(components|pages|views|screens|layouts|ui|frontend)\//i`：**两者命中数均为 0**。

### 判据 3：放宽到整个相位提交区间 —— 结论不变

`7de4010..HEAD`（15 个提交）的改动面是 16 个文件（`+1827 −28`）：其中 8 个是上面的 scope 文件，另 8 个是 `.planning` 工件（`REQUIREMENTS.md`、`ROADMAP.md`、`STATE.md`、`04-01..04-04-SUMMARY.md`、`04-DRILL-EVIDENCE.md`）。

对**全部 16 个路径**做扩展名普查，只有两种：

```text
  15 .md
   1 .mjs
```

再叠加视觉资源扩展名扫描（`svg|png|jpe?g|webp|gif|ico|avif|woff2?|ttf|otf|eot|mp4|webm`）：**零命中**。本相位没有新增或修改任何图标、截图、字体、位图。

仓库侧：当前 110 个 tracked 文件（相位锚点 `7de4010` 处为 100）。本相位新增的恰好 10 个文件是 5 个 `.planning` 工件（4 份 SUMMARY + `04-DRILL-EVIDENCE.md`）加 5 个文档（`docs/MIGRATION.md`、`docs/oldrepo-link/` 四件），**全部是 `.md`**。全仓无 `src/`，无 `components.json`，0 个 `*-UI-SPEC.md`。

### 口径修正：相位 3 报告里的一处措辞不准（本次新发现，属 INFO，非相位 4 缺陷）

相位 3 的 `03-UI-REVIEW.md:6` 写「存在且为 `true` 的只有 `workflow.ui_safety_gate`」。本次核对了 `.planning/config.json` 全文 —— **该键并不存在**。`query config-get workflow.ui_safety_gate --raw` 之所以返回 `true`，来源是引擎 schema 默认值：

```js
// gsd-core/bin/lib/config.cjs:360
ui_safety_gate: true,
```

结论不受影响（门确实是激活的），但「存在」与「取默认值」是两件事，后者一旦将来默认翻转就会静默改行为。记一笔以免后被误引。

另，相位 3 记录的那条**方法学坑仍在且已复测**：`ui-plan-gate` 的 `hasFrontendEvidence: false` 是短路默认值，不是负向测量 ——

```json
// gsd_run check ui-plan-gate 4 --raw
{"frontend": false, "hasFrontendEvidence": false, "hasUiSpec": false, "block": false, "uiSpecPath": null, "matchedToken": null, "matchedLine": null}
```

`gate-ui-plan.cjs:48` 是 `const frontendEvidence = frontend ? readStaticFrontendEvidence(projectDir) : evidenceNone();`，词汇门没命中时静态证据根本没被读。本次直接调用该函数复核：`readStaticFrontendEvidence(<repo root>)` 仍返回 `{"kind":"found","value":true}`，命中源依旧是 gitignored 的构建暂存目录 `.gsd-build-tmp` 内那 1 个 `.tsx`（上游 vendored 的 statusline TUI 载荷），既不在 110 个 tracked 文件里，也不在 `package.json` 的 `files` 白名单里。**不是**本相位的前端面。

### 相位 4 确实造了「展示面」——但它是宿主渲染的 Markdown 文档，不是本仓的前端

这条要写清楚，免得后来者把「NON-UI 相位」误读成「没碰任何用户可见的东西」。相位 4 的主要交付物 `docs/MIGRATION.md` 有 584 行、18 个 ```bash 代码块，是给人读的迁移 runbook；`README.md` 新增的两行是 bilingual 入口链接（`+2 −0`）；`docs/oldrepo-link/` 四个文件共 74 行，是旧仓互链的备料（含一次性的 PR 正文）。

为什么这仍不构成 6 支柱的审计对象：这些文件的**呈现**完全由 GitHub / npm / 终端渲染器持有 —— 字号、行距、代码块配色、表格边框、锚点样式，本仓没有一行代码参与。本仓能选的视觉变量只有「有没有入口链接 / 链接指向对不对 / 双语文档结构是否同构」，而这些恰好已被 `tests/docs-consistency.test.mjs` ⑭ 机器锁死。

顺带记一个实测：`grep -c '^# ' docs/MIGRATION.md` 得到 **30**，但围栏感知的真实 H1 只有 **2**（第 1 行中文、第 295 行英文）—— 差值来自 bash 块里 column-0 的 `# 步骤 N` 注释。这正是 ⑭ 必须围栏感知的原因（naive 统计会把注释数成标题，导致切片点位移、守卫恒红）。文档是散文 + 命令块，不是标记语言的界面。

给它们打 1–4 分会是**编造信号**：既无设计契约可比，也无渲染结果可看。因此六栏一律 N/A，而不是补一个 3/4 让表格看起来完整。

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | N/A | 相位内**有**大量用户可见文案（584 行双语迁移 runbook、README 双语入口、`oldrepo-link/pr.md` 的 PR 正文），但它们是 GitHub / 终端渲染的 Markdown 散文，不是界面文案；双语同构与入口存在性已由 docs-consistency ⑭ 锁定 |
| 2. Visuals | N/A | 零组件、零布局、零图标改动；本相位 diff 内视觉资源扩展名（svg/png/webp/ico/字体/视频）扫描零命中 |
| 3. Color | N/A | 无 CSS / 设计令牌 / 主题文件；README 上仅有的颜色面是 shields.io 徽章的远程 SVG，本仓不持有，且那两枚徽章在相位 3 之前就已存在 |
| 4. Typography | N/A | 无字体声明、无字号刻度；排版完全由 GitHub / npm / 终端渲染器决定 |
| 5. Spacing | N/A | 无布局面，无间距刻度可测。全文唯一一行独占的 `---` 是双语分界（⑭ 断言其在场），属 Markdown 语义块，不是设计间距 |
| 6. Experience Design | N/A | 相位不含 GUI 任务流。真实的「体验」是迁移 runbook 的步骤可达性与回退路径，其正确性由 DRILL-1/DRILL-2/DRILL-4 的实测证据承担（见 `04-DRILL-EVIDENCE.md`），不属视觉审计口径 |

**Overall: n/a** — 相位交付零前端 / 视觉文件（`frontend: false`、`hasUiFiles: false`、8 文件 scope 零命中、16 文件全区间扩展名仅 `.md`/`.mjs`），无可对 6 支柱计分的对象。

---

## Top 3 Priority Fixes

N/A — 无 UI 发现，无 BLOCKER / WARNING 分类适用。相位 4 的收口质量由已验证的机器门与实测证据承担（⑭ 围栏感知守卫 14/14、全量串行 38/38、DRILL-1 旧源 72/3084/3195 → 0 → 包内 3587/3856/72、DRILL-2 静态 `EXIT=2` 逐字失配串与运行时段 `EXIT=0` 假绿对照、旧仓 HEAD/工作树/remote 一字未变），不属本次审计口径。

---

## Detailed Findings

六栏均为 **not applicable**。证据链：相位 scope 集合 = 上面 8 个文件（全区间 16 个），扩展名只有 `.md` / `.mjs` 两种；整段区间的视觉扩展名与 UI 目录扫描零命中；`src/`、`components.json`、`*-UI-SPEC.md` 均不存在；对 8 个 scope 文件做标记 / CSS / UI-API 词汇扫描（`className=`、`aria-`、`<html`、`<div`、`<span`、`style=`、`@media`、`:root`、`tailwind`、`styled-`、`useState`、`addEventListener`、`createElement`、`document.querySelector`、`flexbox`、`grid-template`、`font-family`、`border-radius`、`box-shadow`）：**8 个文件全部 clean**。

两处需要点名的「看起来像但不是」：`docs/MIGRATION.md:172` 与 `:466` 的 `const src={...}` 是 bash 代码块内的 JS 片段，不是页面脚本；`README.md:3-4` 的两枚 `img.shields.io` 徽章是相位 3 之前就有的远程 SVG 引用，本相位未改（`README.md` 本相位 diff 恰 `+2 −0`，新增内容只有那两行 blockquote 入口）。

未尝试任何截图：`:3000` / `:5173` / `:8080` 探测全 `000`；`:3091` 是 host 自有 GUI（鉴权前置），采集它属于张冠李戴的证据。

**文档 / 元数据面（非 UI，仅供参考，不计分）：** `docs/MIGRATION.md` 的 §① runbook / §② 三轴差异 / §③ 版本错配症状表（中英各半，各 3 个二级标题，围栏感知 H1 = 2）、`README.md` 双语入口两行、`docs/oldrepo-link/` 四件、`BUILD.md:16` 的计数终值 37/37 → 38/38，都是给人读的 Markdown，不是随包发布的界面。其正确性由 `tests/docs-consistency.test.mjs:338` 起的 ⑭ 约束：入口双语存在 + 文档两半各恰 3 个二级标题 + 独占一行的 `---` 分隔，且标题判定必须先给每行打围栏内外标记，否则 bash 注释会被数成 H1。

**Registry 安全审计：** 跳过 —— 无 `components.json`，未初始化 shadcn，无第三方 registry 条目。

**未执行的验证（约束所致，如实记录）：** 本次审计**没有**运行 `node --test tests/*.test.mjs` —— 编排器持有测试执行权，且并发跑会与兄弟代理冲突（`tests/build-smoke.test.mjs` 会重写构建树，产出已知的假红）。也**没有**运行 `node build.mjs`。因此上文引用的 ⑭ 与 38/38 是**读源码与读提交确认其断言/记录存在**，不是本次执行通过的回执；执行回执在 `04-03-SUMMARY.md`（全量串行 38/38，fail 0 / cancelled 0）与 `04-DRILL-EVIDENCE.md`（DRILL-1/2/4 逐字观测）里。

---

## Files Audited

- `.planning/phases/04-migration-coexistence/04-01-PLAN.md` … `04-04-PLAN.md` — 计划文件面（纯文档 / 测试 / drills）
- `.planning/phases/04-migration-coexistence/04-01-SUMMARY.md` … `04-04-SUMMARY.md` — 实际文件面；四份 frontmatter 的 `subsystem` 全为 `docs`，无 UI 子系统（相位已执行，满足工作流 step 1 的前置）
- `.planning/phases/04-migration-coexistence/04-CONTEXT.md`、`04-RESEARCH.md`、`04-PATTERNS.md`、`04-VALIDATION.md`、`04-DISCUSSION-LOG.md` — 相位边界与约束（跨仓动作边界、双源清除、并存判据）
- `.planning/phases/04-migration-coexistence/04-DRILL-EVIDENCE.md` — 演练证据记录（DRILL-1/2/4），非视觉工件
- `.planning/ROADMAP.md` Phase 4 段 — `ui.plan-gate` / `ui.safety-gate` 的词汇判据输入
- `.planning/config.json` — 无 `ui_*` / `interaction` / `text_mode` / `response_language` 键；`ui_safety_gate` 亦不在文件内（取 schema 默认值 `true`，见 `config.cjs:360`）
- `gsd_run loop render-hooks execute:wave:post --raw` — `capId: "ui"` 的 gate 已注册（`blocking: true`、`onError: "halt"`），故上述 `block: false` 是活门通过
- `gsd_run check ui-safety-gate 4 --raw`、`check ui-plan-gate 4 --raw`、`check evaluation-scope --phase 04 --raw` — 本次重测的三条判据
- `gsd-core/bin/lib/gate-ui-safety.cjs`、`gate-ui-plan.cjs`、`ui-frontend-evidence.cjs`、`config.cjs` — 判据实现（命中规则、短路行为、默认值来源）
- 相位区间 `7de4010..3c4ffcf`（15 提交 / 16 文件 / `+1827 −28`）— 完整改动面与扩展名普查
- `docs/MIGRATION.md`（584 行 / 18 个 bash 块 / 围栏感知 H1 = 2）、`docs/oldrepo-link/README.md`、`snippet.en.md`、`snippet.zh.md`、`pr.md`、`README.md`、`BUILD.md` — 标记 / CSS / UI-API 词汇扫描，全 clean
- `tests/docs-consistency.test.mjs` — 新增 ⑭ 守卫源码（`:338` 起），确认断言存在；本相位 `+60 −0`
- `git ls-files`（110 个 tracked 文件）— 无 `src/`、无 `components.json`、无 `*-UI-SPEC.md`
- `.gsd-build-tmp/` — 复测静态前端证据函数时的假阳性来源（gitignored 构建暂存，非相位产物）
- 端口探测 `:3000` / `:5173` / `:8080`（均无服务）与 `:3091`（DSH harness GUI，非本相位交付物，未采集）