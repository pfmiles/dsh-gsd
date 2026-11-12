# Phase 3 — UI Review

**Audited:** 2026-11-12（锚点 `cf13915`。审计期间其后新增了兄弟代理的 `552bb48 docs(phase-03): add/update security threat verification` —— 只动 `.planning`，已复核不改变以下任何文件面结论）
**Baseline:** 无 `03-UI-SPEC.md` —— 本相位从未生成设计契约（`ui-phase` 未被触发，因为 plan gate 的 `frontend` 判据始终为 false）。若适用则按抽象 6 支柱标准审计。
**Screenshots:** 未采集 — 不适用。`localhost:3000` / `:5173` / `:8080` 本次实测全部返回 `000`（无服务在听）；唯一在听的 `:3091` 是 DSH harness GUI（host 自有的会话 shell），不是本相位交付物，采集它等于把无关界面记为审计证据。
**Interaction captures:** 关闭 —— `.planning/config.json` 无 `workflow.ui_interaction_capture` 键，引擎 schema 默认 `false`；存在且为 `true` 的只有 `workflow.ui_safety_gate`。
**Auditor:** 以 `gsd-ui-auditor` 角色行内执行。本会话 subagent 委派层级已用尽（depth 1 / 剩余 0），按工作流自身的「以文件系统与 git 状态做完成核对」回退路径核对，不再另起子代理。

---

## 判定：NON-UI 相位 — 视觉审计不适用

相位 3 是发布 / CI / 文档基础设施。撇开 `.planning` 工件，它**改动面的全集**是 12 个文件，恰好落在四类里：清单与钉版（`package.json`、`build/assets/pins.json`）、CI（`.github/workflows/compat-matrix.yml`）、测试（`tests/*.test.mjs`）、文档与提交材料（`README.md`、`BUILD.md`、`CHANGELOG.md`、`docs/dshmarket/*`）。没有组件、没有样式、没有布局、没有交互。6 支柱中没有任何一栏存在可计分的对象。

下面三条判据是**本次重新实测**的，不是从相位 2 的报告里搬来的。

### 判据 1：词汇门 —— 该相位不是前端相位

```json
// gsd_run check ui-safety-gate 3 --raw
{"frontend": false, "hasUiFiles": false, "hasUiSpec": false, "block": false}
```

`frontend: false` 来自 `.planning/ROADMAP.md` 的 Phase 3 段对 UI 词表（`UI|interface|frontend|component|layout|page|screen|view|form|dashboard|widget`，词边界锚定，`ui-safety-gate.cjs` 的 `UI_TOKENS`）的扫描，`matchedToken: null`。这不是我用 grep 猜的，是 gate 读同一段文本得出的。该段 goal 原文是「发布就绪 —— repo 建仓并推送、packaging 面符合 npm 规范、CI 首绿」，六条 Success Criteria 里没有一条描述界面。

### 判据 2：文件面（相位 evaluation scope）—— 该相位没碰过 UI 文件

```text
$ gsd_run check evaluation-scope --phase 03 --raw
{"unit": {"kind": "phase", "phase": "03"}, "status": "resolved", "source": "task-commits", ...}
```

11 个文件，与 `ui.safety-gate` 的 `hasUiFiles: false` 同源：

`.github/workflows/compat-matrix.yml` · `BUILD.md` · `CHANGELOG.md` · `README.md` · `build/assets/pins.json` · `docs/dshmarket/README.md` · `docs/dshmarket/pfmiles__dsh-gsd.yml` · `package.json` · `tests/docs-consistency.test.mjs` · `tests/pack-contents.test.mjs` · `tests/pending-phase-3/README.md`

判据是 `gate-ui-safety.cjs:24` 的 `/\.(tsx|jsx|css|scss|sass|less|vue|svelte|html)$/i` 与同文件 `:25` 的 `/\/(components|pages|views|screens|layouts|ui|frontend)\//i`，两者命中数均为 0。

`status: resolved`，且 payload 里没有 `scopeStatus` / `readError` —— 这个 `false` 是「确实没有」，不是「读不到」。

### 判据 3：放宽到整个相位提交区间 —— 结论不变

`4495d13^..cf13915`（22 个提交：15 个只动 `.planning`，其余 7 个合起来改动 12 个非 `.planning` 文件 —— 六个 task 提交加 `02a833b` 顺带改的一行 `PLAN.md`）的非 `.planning` 改动面是 12 个文件，比判据 2 多一个 `PLAN.md`（`02a833b` 里一行措辞改动，属计划文档，被 task-commits 口径排除）。对整段区间跑前端/视觉扩展名扫描（`tsx|jsx|css|scss|sass|less|html|vue|svelte|svg|png|jpe?g|webp|gif|ico`）：**零命中**；在其后的 `552bb48` 上复跑同样扫描，仍是零命中。

仓库侧：85 个 tracked 文件，无 `src/`，无 `components.json`，全仓无 `*-UI-SPEC.md`。唯一的视觉资产 `icon.svg`（541 B，mtime 2026-11-10）在相位 3 之前就已存在，本相位一个字节都没改 —— 相位 3 只是把它的**接线**（`package.json:14` 的 `icon`、`package.json:12` 的 `exports["./icon"]`）写进了防漂移断言。

### 口径修正：plan gate 的 `hasFrontendEvidence: false` 不是独立佐证（本次新发现）

```json
// gsd_run check ui-plan-gate 3 --raw
{"frontend": false, "hasFrontendEvidence": false, "hasUiSpec": false, "block": false, "uiSpecPath": null, "matchedToken": null, "matchedLine": null}
```

相位 2 的报告把这一条当成 `frontend: false` 的结构性佐证。**在相位 3 的口径下这说法不成立**：`gate-ui-plan.cjs:48` 是短路写法 ——

```js
const frontendEvidence = frontend ? readStaticFrontendEvidence(projectDir) : evidenceNone();
```

词汇门没命中时，静态证据**根本没被读**，`hasFrontendEvidence: false` 只是 `evidenceNone()` 的默认值，不是一次负向测量。我直接调用同一个函数复核：`readStaticFrontendEvidence(<repo root>)` 返回 `{kind: "found", value: true}`。命中源是 `.gsd-build-tmp/package/.opencode/plugins/gsd-statusline/tui.tsx` —— 一个由 `build.mjs` 生成的 gitignored 构建暂存目录（`.gitignore:3`）里的文件，内容是从上游 vendored 进来的 gsd-core 引擎载荷（OpenCode statusline 的终端 TUI）。它既不在那 85 个 tracked 文件里，也不在 `package.json:37` 的 `files` 白名单里（`files` 为 `index.js` / `cordis.patch.yml` / `locale` / `icon.svg` / `skills` / `gsd-core` / `hooks` / `config` / `scripts`）。

结论不变（相位 3 仍无前端面），但方法学上要记一笔，分类 **INFO**，非本相位缺陷：本仓的静态前端探测会因构建暂存目录给出假阳性；将来若真有相位变成前端相位，`ui.plan-gate` 会因为这个 `found` 而具备 block 能力（`block = frontend && hasFrontendEvidence && !hasUiSpec`），届时必须有一份真实的 `*-UI-SPEC.md` 才能过。`ui-frontend-evidence.cjs:104` 的 `SKIP_DIRS` 目前不含 `.gsd-build-tmp`。

### 相位 3 确实造了「展示面」——但它是宿主渲染的数据，不是本仓的前端

这是相位 3 与相位 2 的实质差别，写清楚，免得后来者把「NON-UI 相位」误读成「没碰任何用户可见的东西」。相位 3 亲手产出了三类**会被界面消费的文案 / 元数据**：

1. `locale/en.json` / `locale/zh.json` 的 `meta.title`（"GSD on DSH"）与 `meta.description`（中英双语）—— DSH 插件管理器卡片上真正显示的那两行字；
2. `docs/dshmarket/pfmiles__dsh-gsd.yml` 的 4 个顶层键 / 5 个叶子字段（`url` / `name` / `category` / `description.en` / `description.zh`，**无 `icon`**）—— dshmarket catalog 卡片的输入数据；
3. `README.md` 头部两枚 shields.io 徽章、裸名安装示例、`CHANGELOG.md` 首个条目 —— 由 npm registry / GitHub 按 Markdown 渲染。

为什么这仍不构成 6 支柱的审计对象：这三类只提供**内容**，不提供**呈现**。卡片尺寸、配色、字体、行距、间距节奏全部由 DSH 插件管理器与 dshmarket 站点持有，本仓没有一行代码参与渲染；`icon.svg` 的图形是相位 3 之前的产物。本仓能选的视觉变量只有「有没有徽章 / 图标接线对不对 / 文案是否双语一致」，而这些恰好已被 `tests/docs-consistency.test.mjs` ⑨⑩ 机器锁死。

给它们打 1–4 分会是**编造信号**：既无设计契约可比，也无渲染结果可看。因此六栏一律 N/A，而不是补一个 3/4 让表格看起来完整。

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | N/A | 相位内**有**用户可见文案（`locale/*.json` 的 `meta.title`/`description`、dshmarket 双语 description、CHANGELOG 条目），但它们是宿主渲染的数据契约，不是可审计的界面文案；一致性已由 docs-consistency ⑨⑩ 锁定 |
| 2. Visuals | N/A | 零组件、零布局、零图标改动（`icon.svg` 未被本相位触碰） |
| 3. Color | N/A | 无 CSS / 设计令牌 / 主题文件；唯一颜色面是 shields.io 徽章的远程 SVG，本仓不持有 |
| 4. Typography | N/A | 无字体声明；排版完全由 GitHub / npm / dshmarket 渲染器决定 |
| 5. Spacing | N/A | 无布局面，无间距刻度可测 |
| 6. Experience Design | N/A | 相位不含任何用户任务流；`compat-matrix.yml` 与测试是无头 CI，终端输出不是交付界面 |

**Overall: n/a** — 相位交付零前端 / 视觉文件（`frontend: false`、`hasUiFiles: false`、11 文件 scope 零命中），无可对 6 支柱计分的对象。

---

## Top 3 Priority Fixes

N/A — 无 UI 发现，无 BLOCKER / WARNING 分类适用。相位 3 的收口质量由已验证的机器门承担（真实 `npm pack` 958 文件 / 4.6 MB、`compat-matrix` 四格 × 六步、全量测试与 docs-consistency ⑧⑨⑩），不属本次审计口径。

---

## Detailed Findings

六栏均为 **not applicable**。证据链：相位 changed-file 集合 = 上面 11 个（完整区间 12 个），扩展名只有 `.mjs` / `.md` / `.json` / `.yml` 四种；整段区间的视觉扩展名扫描零命中；`src/`、`components.json`、`*-UI-SPEC.md` 均不存在；对相位内非 Markdown 文件（`compat-matrix.yml`、`pins.json`、`package.json`、两个测试套件）做标记/CSS/UI-API 词汇扫描（`className=`、`aria-`、`style=`、`<html`、`<div`、`@media`、`:root`、`tailwind`、`document.`、`addEventListener`、`createElement`、`useState`、`styled`）：全部 clean。未尝试任何截图：:3000/:5173/:8080 探测全 `000`，`:3091` 是 host 自有 GUI（鉴权前置），采集它属于张冠李戴的证据。

**文档 / 元数据面（非 UI，仅供参考，不计分）：** README 的双语徽章与裸名安装命令、`BUILD.md:16` 的计数终值、CHANGELOG 首条目，都是给人读的 Markdown，不是随包发布的界面。其正确性由 `tests/docs-consistency.test.mjs` ⑧⑨⑩ 约束：⑧ CHANGELOG 首条目版本与 `package.json.version` 等值且小节名限定在 Keep a Changelog 六类闭集；⑨ 徽章存在 + 双语段含 MIT 与 `THIRD-PARTY-NOTICES.md` 链接；⑩ `locale` 双语 `meta.title`/`description` 非空 + `icon` 双通道（`icon` 与 `exports["./icon"]`）+ `files` 收录 `locale` 与 `icon.svg`（漏收即宿主静默降级为技术名 / 默认头像）。

**Registry 安全审计：** 跳过 —— 无 `components.json`，未初始化 shadcn，无第三方 registry 条目。

**未执行的验证（约束所致，如实记录）：** 本次审计**没有**运行 `node build.mjs`，也**没有**运行 `node --test tests/*.test.mjs` —— 同一时刻有三个兄弟代理在跑，`tests/build-smoke.test.mjs` 会重写构建树，并发执行会产出假红。因此上文引用的测试编号 ⑧⑨⑩ 是**读源码确认其断言存在**，不是本次执行通过的回执；执行回执在 `03-02-SUMMARY.md`（串行全量 32/32、fail 0 / cancelled 0）与 `03-03-SUMMARY.md`（首跑 run `43218878911` success、`total_count=1`）里。

---

## Files Audited

- `.planning/phases/03-github-npm-dshmarket/03-01-PLAN.md`、`03-02-PLAN.md`、`03-03-PLAN.md` — 计划文件面（纯构建 / CI / 测试 / 文档）
- `.planning/phases/03-github-npm-dshmarket/03-01-SUMMARY.md`、`03-02-SUMMARY.md`、`03-03-SUMMARY.md` — 实际文件面；对 `UI|界面|视觉|frontend|组件|component|screenshot` 做大小写无关扫描，唯一命中是 `requires` / `requirements` 里的 `ui` 字母序列，无真实 UI 叙述
- `.planning/phases/03-github-npm-dshmarket/03-CONTEXT.md`、`03-RESEARCH.md`、`03-PATTERNS.md`、`03-VALIDATION.md` — 相位边界与约束（D-02 发布移交 P5、D-05 peer 收紧、D-08 workflow 加固）
- `.planning/ROADMAP.md` Phase 3 段 — `ui.plan-gate` / `ui.safety-gate` 的词汇判据输入（`matchedToken: null`）
- `.planning/config.json` — 无 `ui_*` / `text_mode` / `interaction` 键；`workflow.ui_safety_gate` 为 `true`
- `gsd_run loop render-hooks execute:wave:post --raw` — `capId: "ui"` 的 gate 已注册（`blocking: true`、`onError: "halt"`），故上述 `block: false` 是活门通过，不是门被关掉
- `gsd_run check ui-safety-gate 3 --raw`、`check ui-plan-gate 3 --raw`、`check evaluation-scope --phase 03 --raw` — 本次重测的三条判据
- `gsd-core/bin/lib/gate-ui-safety.cjs`、`gate-ui-plan.cjs`、`ui-frontend-evidence.cjs`、`ui-safety-gate.cjs` — 判据实现（确认命中规则与短路行为）
- 相位区间 `4495d13^..cf13915`（22 提交）及其中 11 个 scope 文件 + `PLAN.md` — 完整改动面；锚点之后新增的 `552bb48` 亦复核（`.planning` only）
- `package.json`、`build/assets/pins.json`、`.github/workflows/compat-matrix.yml`、`tests/docs-consistency.test.mjs`、`tests/pack-contents.test.mjs` — 相位内非 Markdown 文件，标记 / CSS / UI-API 词汇扫描
- `locale/en.json`、`locale/zh.json`、`docs/dshmarket/pfmiles__dsh-gsd.yml`、`docs/dshmarket/README.md`、`README.md`、`CHANGELOG.md`、`BUILD.md` — 展示面数据契约（不计分）
- `icon.svg` — 唯一视觉资产，`git log -- icon.svg` 在相位窗口内为空（非本相位产物）
- `git ls-files`（85 个 tracked 文件）— 无 `src/`、无 `components.json`、无 `*-UI-SPEC.md`
- `.planning/ui-reviews/.gitignore` — 截图忽略门已在位并入库（本次无需采集，故未新增文件）
- 端口探测 `:3000` / `:5173` / `:8080`（均无服务）与 `:3091`（DSH harness GUI，非本相位交付物，未采集）