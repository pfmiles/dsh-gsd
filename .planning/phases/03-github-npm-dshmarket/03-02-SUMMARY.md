---
phase: 03-github-npm-dshmarket
plan: 02
subsystem: packaging / release-metadata / docs / third-party-catalog
tags: [npm-manifest, publishConfig, keywords, readme-badges, shields.io, changelog, keep-a-changelog, dshmarket, awesome-dsh-plugin, yaml, docs-consistency, inst-06, test-count]

# Dependency graph
requires:
  - phase: 03-github-npm-dshmarket
    provides: peer 冻结 exact 0.2.2-rc.1（manifest + pins）、workflow 加固、tests/pack-contents.test.mjs 纳管（全量 29/29 地板值）
provides:
  - npm 页面/搜索面元数据（repository/homepage/bugs/keywords/author）+ publishConfig.registry 钉 https://registry.npmjs.org/
  - README 顶部 shields.io 徽章（MIT / DSH 行）+ zh/en 各一条裸名安装示例（catalog 卡片形态）+ 「当前状态」改 Phase 5 时间线
  - CHANGELOG.md 首条目 1.20.1-1.dsh022（Keep a Changelog 1.1.0）+ 发布约定（tag=版本串、不加 v 前缀）
  - docs/dshmarket/pfmiles__dsh-gsd.yml（严格 5 字段、category=workflow、无 icon）+ 提交说明（Phase 5 提 PR 的资产）
  - docs-consistency ⑧⑨⑩（CHANGELOG 版本等值 / 徽章与双语致谢 / INST-06 元数据）+ BUILD.md:16 实测 32/32
affects: [03-03, "Phase 5 UAT-01", "Phase 5 npm publish / GitHub Release / dshmarket PR"]

# Actuals (#2632) — pairs with the plan's estimate
actuals:
  tokens: 3150
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "远端静态徽章（shields.io）而非本地 SVG：docs/ 不进 npm 包，本地图在 npm 页面必然 404；徽章放第一个标题之前，单块服务双语且不干扰 indexOf('# dsh-gsd') 的两次定位"
    - "外部 schema 资产（catalog 条目）用零依赖行级正则自检，不引 js-yaml/semver；单测只消费文件内容，保持 per-commit 秒级"
    - "唯一活体计数按实测写入：两次串行全量同值才落 BUILD.md，算术只作交叉核对"

key-files:
  created:
    - CHANGELOG.md
    - docs/dshmarket/pfmiles__dsh-gsd.yml
    - docs/dshmarket/README.md
  modified:
    - package.json
    - README.md
    - tests/docs-consistency.test.mjs
    - BUILD.md

key-decisions:
  - "repository/bugs 用紧凑单行对象、keywords 用单行数组（与 03-PATTERNS 骨架逐字一致）；publishConfig 作为最后一个顶层键，只写 registry，tag 留 Phase 5"
  - "README 徽章第二枚只放行标签 DSH-0.2.2--rc.1（shields.io 的双连字符转义），不放完整窗口串——窗口串已有 docs-consistency ② 的正文强等值兜底，徽章拼坏只会破图"
  - "裸名示例写进两个安装块的 # 2. 之后，pinned 命令逐字不动；dsh-gsd@latest 零出现（⑤ 哨兵零容忍）"
  - "CHANGELOG 不进 package.json files（ALLOWED_TOP_LEVEL 12 项保持封闭）；六类小节只用 Added/Changed/Fixed 三个"
  - "dshmarket 条目只写 url/name/category/description.{en,zh}，不写 icon（D-07：catalog 只收 GitHub 托管位图），不加自定义键"
  - "⑧⑨⑩ 沿用现成 read()/readme/readmeZh/readmeEn/pkg，不新增 import；⑨ 只断言结构不断言 HTTP（A5 显式接受）；⑩ 按 string|{en} 联合形态判定非空"
  - "BUILD.md:16 的 N 取两次独立串行全量的同一实测值 32，而非 29+3 的算术推导"

patterns-established:
  - "发布可见面的防漂移三件套：⑧ 版本等值（CHANGELOG ↔ package.json）、⑨ 许可/致谢双语可见性、⑩ 宿主展示元数据（locale 双语 + icon 双通道 + files 收录）"
  - "「同一串两处逐字」的 SC 证明方式：README 与 docs/dshmarket/README.md 各有一行裸名 install，grep -F 比对；不复用 YAML 字段承载命令"

requirements-completed: [PUB-03, PUB-04, INST-06]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "npm manifest 元数据补全：repository/homepage/bugs/keywords/author + publishConfig.registry 钉 canonical registry；version/private/license/files/engines/peer/scripts 零漂移"
    requirement: "PUB-03"
    verification:
      - kind: unit
        ref: "node -e 全等断言（12 个键 + files.length===9）→ 'manifest metadata ok'"
        status: pass
      - kind: unit
        ref: "build/lib/check-pins.mjs --offline → 'pins: all consistent (line dsh022)' exit 0"
        status: pass
      - kind: unit
        ref: "git diff --numstat package.json → 8 0（纯新增，无删除/改写）"
        status: pass
    human_judgment: false
  - id: D2
    description: "README 发布可见面：顶部 MIT/DSH 徽章、zh/en 各一条裸名安装示例、『当前状态/Status』改 Phase 5 时间线（旧整句零残留）"
    requirement: "PUB-04"
    verification:
      - kind: unit
        ref: "结构门：'# dsh-gsd' 计数=2、裸名行=2、pinned 示例=4、dsh-gsd@latest 零出现 → 'README structure ok'"
        status: pass
      - kind: unit
        ref: "文案门（正 2 / 反 2）：'首个正式版本随 Phase 5' + 'The first public release ships with Phase 5' 存在；两条旧整句 -F 零匹配"
        status: pass
      - kind: unit
        ref: "tests/docs-consistency.test.mjs ①-⑦ 复跑 7/7（⑤ 证明裸名示例零 dsh-gsd@ 捕获）"
        status: pass
    human_judgment: false
  - id: D3
    description: "CHANGELOG.md 首条目 1.20.1-1.dsh022（2026-11-12）+ 发布约定（tag=版本串、不加 v 前缀）+ 六类闭集小节"
    requirement: "PUB-03"
    verification:
      - kind: unit
        ref: "结构门：H1 + 首条目 + '不加 v 前缀' + '0.2.2-rc.2' + 六类小节=3 且无闭集外小节 + 不在 files → 'changelog ok: sections=3'"
        status: pass
      - kind: unit
        ref: "tests/docs-consistency.test.mjs#⑧ CHANGELOG 首条目版本与 package.json.version 等值，小节名在六类闭集内"
        status: pass
    human_judgment: false
  - id: D4
    description: "docs/dshmarket/pfmiles__dsh-gsd.yml：严格 4 个顶层键（description 下 en/zh）、category=workflow、无 icon、文件名 slug 形态"
    requirement: "PUB-03"
    verification:
      - kind: unit
        ref: "离线行级正则自检（23 类词表 / url / name / 句末标点 / 无 icon / 顶层键序）→ 'dshmarket entry ok'"
        status: pass
    human_judgment: false
  - id: D5
    description: "docs/dshmarket/README.md 提交说明：目标仓/路径/Phase 5 时点、逐字 install 串、可证事实清单、非聚合包论证"
    requirement: "PUB-03"
    verification:
      - kind: unit
        ref: "grep -cE '^dsh plugin --profile web add dsh-gsd$' docs/dshmarket/README.md ≥1（SC-3 逐字一致的另一侧）"
        status: pass
    human_judgment: false
  - id: D6
    description: "docs-consistency ⑧⑨⑩ 落盘：CHANGELOG 版本等值、徽章与双语致谢可见性、INST-06 元数据合规（locale 双语 + icon 双通道 + files 收录）"
    requirement: "INST-06"
    verification:
      - kind: unit
        ref: "node --test tests/docs-consistency.test.mjs → ℹ tests 10 / pass 10 / fail 0"
        status: pass
    human_judgment: false
  - id: D7
    description: "BUILD.md:16 唯一活体计数写入实测值 32/32（两次独立串行全量同值）"
    verification:
      - kind: unit
        ref: "node --test tests/*.test.mjs（串行 ×2）→ 'suite 32/32 matches BUILD.md'；git diff BUILD.md → 1 增 1 删，无 26/26 残留"
        status: pass
    human_judgment: false

# Metrics
duration: 7min
completed: 2026-11-12
status: complete
---

# Phase 3 Plan 2: 元数据与提交材料 Summary

**manifest 补上 repo/homepage/bugs/keywords/author 并把 registry 钉到 npmjs.org；README 顶部摆出 MIT 与 DSH 行徽章、双语各补一条 catalog 同款裸名安装命令、状态文案改到 Phase 5 时间线；CHANGELOG 以 `1.20.1-1.dsh022` 开篇并与 package.json 版本机器等值；dshmarket 条目严格 5 字段（category=workflow、无 icon）连同提交流程说明一并入库；⑧⑨⑩ 三条防漂移断言落地后，串行全量两次同测 `ℹ tests 32`，BUILD.md:16 写 32/32。**

## Performance

- **Duration:** 7 min（生产面约 11:04:56Z → 11:11:39Z；其后为 SUMMARY/STATE 收口）
- **Started:** 2026-11-12T11:04:56Z
- **Completed:** 2026-11-12
- **Tasks:** 3
- **Files modified:** 7（4 改 + 3 新增）

## Accomplishments

- **npm 元数据面就位（SC 的发布可见性）**：`package.json` 纯新增 8 行——`repository` / `homepage` / `bugs` / `keywords` / `author` 五键与 `publishConfig.registry = https://registry.npmjs.org/`。`git diff --numstat` = `8 0`（无删除、无改写）；`version` / `private` / `license` / `files`（9 项）/ `engines` / `peerDependencies`（exact `0.2.2-rc.1`）/ `scripts.prepack` 由 `check-pins --offline` 与 ⑥ 双证零漂移。
- **README 三处可见面一次落成**：顶部两枚静态 shields.io 徽章（`license-MIT` 与 `DSH-0.2.2--rc.1`）位于 `<!-- generated-by: gsd-doc-writer -->` 与第一个 `# dsh-gsd` 之间，`# dsh-gsd` 计数仍恰为 2（双语切分未被切歪）；zh/en 各追加一条裸名命令 `dsh plugin --profile web add dsh-gsd`（零 `dsh-gsd@` 捕获，⑤ 不动），pinned 命令 4 处逐字未改；「当前状态/Status」改为「首个正式版本随 Phase 5 在干净机器 8 项 UAT 通过后发布」，旧整句两条 `-F` 反向断言零匹配。
- **CHANGELOG 成文且机器可校验（SC-6 / D-04）**：`# Changelog` + `## [Unreleased]` + `## [1.20.1-1.dsh022] - 2026-11-12`，小节只有 Added×2 / Changed×2 / Fixed×1（六类闭集内）；导语写明发布约定——tag 名 = 版本串、**不加 v 前缀**、Release 正文取本文件对应条目（Release 本体留 Phase 5）；Changed 载明 peer 收紧与「`0.2.2-rc.2` 转正 / 0.2.2 正式版发布必须同步抬 peer」的维护义务。**未**进入 `files`。
- **dshmarket 备料严格贴合外部 schema（SC-3）**：`docs/dshmarket/pfmiles__dsh-gsd.yml` 恰 4 个顶层键（`description` 下 `en`/`zh`），`category: workflow` ∈ 23 类闭集，**无 `icon` 键**（D-07）；零依赖行级正则自检通过。同目录 `README.md` 写清目标仓 `awesome-dsh-plugin/awesome-dsh-plugin`、路径 `data/plugins/pfmiles__dsh-gsd.yml`、PR 时点 Phase 5，并给出与 README 逐字同源的裸名 install 串、可证事实清单与「非纯聚合包」论证。
- **三条新断言进入 per-commit 回路**：⑧ 以 `/^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/m` 取首个带日期条目，与 `pkg.version` 及字面值双等值，小节名对六类闭集 `deepEqual`；⑨ 断言 shields.io 徽章结构并逐半检查 `THIRD-PARTY-NOTICES.md` 与 `MIT`；⑩ 断言 locale 双语 `meta.title`/`meta.description` 非空（string 或 `{en}` 联合）、双语 title 相等、`pkg.icon`/`exports['./icon']` 双通道与 `files` 收录。`docs-consistency` 由 7 → **10/10**。
- **计数按实测收口（⛔-E）**：两次独立串行 `node --test tests/*.test.mjs` 均输出 `ℹ tests 32` / `ℹ pass 32` / `ℹ fail 0` / `ℹ cancelled 0`；`BUILD.md:16` 由 `预期 26/26` 改写为 `预期 32/32`，`git diff --numstat` 恰 `1 1`，全文无 `26/26` 残留，`:9-24` 其余行零 diff。
- **基线保持**：`node build.mjs` → `gates: all passed (A/B/C)`、`copied 76 trees, rewrote paths in 286 files, injected notes into 72 skills (72 total)`；`check-pins --offline` → exit 0 `pins: all consistent (line dsh022)`。

## Task Commits

Each task was committed atomically:

1. **Task 1: npm manifest 元数据补全 — repository/homepage/bugs/keywords/author + publishConfig.registry** - `3f2c909` (feat)
2. **Task 2: 发布可见面三件套 — README 徽章/裸名示例/Phase 5 文案 + CHANGELOG 首条目 + dshmarket 提交材料** - `8d0e9c6` (docs)
3. **Task 3: 三条防漂移断言 ⑧⑨⑩ + BUILD.md:16 按实测写终值 32/32** - `f061bc0` (test)

**Plan metadata:** `0340e46` (SUMMARY) → `docs(03-02): complete …`（STATE + ROADMAP + REQUIREMENTS 收口）

## Files Created/Modified

- `package.json` — `+8` 行：`repository` / `homepage` / `bugs` / `keywords` / `author` 与 `publishConfig.registry`；其余键逐字未动
- `README.md` — `+13/-2`：顶部徽章块 2 行、zh/en 裸名示例各 2 行（注释 + 命令）、「当前状态」与 `Status` 各 1 行改写
- `CHANGELOG.md`（新）— Keep a Changelog 1.1.0 形态，首条目 `1.20.1-1.dsh022`，3 个小节；**不进 npm 包**
- `docs/dshmarket/pfmiles__dsh-gsd.yml`（新）— 4 个顶层键（description 下双语），无 icon；Phase 5 提交物
- `docs/dshmarket/README.md`（新）— 提交说明四节（目标/路径/时点、逐字 install 串、可证事实、非聚合包论证）
- `tests/docs-consistency.test.mjs` — ⑥ 的断言 **message** 由「Phase 3」改「Phase 5」（断言条件未动）；追加 ⑧⑨⑩ 与 `CHANGELOG_SECTIONS` 常量（+55 行）
- `BUILD.md` — 仅 `:16`：`26/26` → `32/32`

## Decisions Made

- **元数据体例**：`repository`/`bugs` 用紧凑单行对象、`keywords` 用单行数组，与 `03-PATTERNS` 的骨架逐字一致；`publishConfig` 置于最后一个顶层键且只含 `registry`——`tag` 与发布动作一起在 Phase 5 裁决（推荐 `latest`，它决定卡片裸名命令能否解析）。
- **徽章只放行标签**：第二枚写 `DSH-0.2.2--rc.1`（shields.io 对 `.` 需双连字符）而非完整窗口串 `>=0.2.2-rc.1 <0.3.0-0`，避免转义拼成破图；窗口串的双语声明已有 ② 强等值兜底，徽章只是可见性。
- **裸名示例的位置**：放在两个安装块的 `# 2.` 之后（同一代码块内、命令独占一行），注释说明「市场与宿主 Discover 的卡片给的是不带版本号的等价命令」；pinned 命令逐字不动（D-06 明令）。
- **CHANGELOG 语言档位**：中文正文 + 英文小节名（与 BUILD.md 对齐，不做双语镜像）；只写可证事实（72 skills / GSD 1.20.1 / peer 收紧），不写无法自证的形容词。
- **dshmarket 条目不承载 install 字段**：卡片命令由对方 CI 生成，SC-3 的「逐字一致」由 README 与 `docs/dshmarket/README.md` 的同一行裸名串经 `grep -F` 证明；YAML 只留 5 字段（4 个顶层键）。
- **⑧⑨⑩ 不新增依赖**：全部复用文件现成的 `read()` / `readmeZh` / `readmeEn` / `pkg`，正则按行锚定；⑨ 只断言结构（A5 的 shields.io 不可达风险显式接受）；⑩ 用 `string | {en: string}` 联合判定，既不误判宿主允许的对象形态，也不为「更合规」加字段（INST-06 现状已合规）。
- **计数来源 = 实测**：`N=32` 取自两次独立串行全量的 `ℹ tests N`，`29+3` 仅作交叉核对；未改写 `01-VERIFICATION.md` / `02-VALIDATION.md` / `STATE.md` 里的历史 `26/26`。

## Deviations from Plan

**None - plan executed exactly as written.**（无自动修复、无范围蔓延、无断言放宽）

### Documented Variances

1. **[Rule — 记录性] ⑧⑨⑩ 的枚举顺序与追加位置**
   - **Found during:** Task 3
   - **Issue:** 计划只要求「末尾追加三条 `test(`」，未规定辅助常量位置；`CHANGELOG_SECTIONS` 放在 ⑦ 之后、⑧ 之前。
   - **Fix:** 无（常量紧邻其唯一消费方，语义更清楚）。
   - **Verification:** `git diff --numstat tests/docs-consistency.test.mjs` = `55 1`——1 行删除仅为 ⑥ 的 message，①-⑦ 断言条件零改动。
   - **Committed in:** `f061bc0`

2. **[Rule — 记录性] CHANGELOG 的 `### Changed` 第二条更具体**
   - **Found during:** Task 2
   - **Issue:** 计划要求写入「根 peer 收紧及 rc.2 转正 / 正式版发布必须同步抬 peer」；成文时把开区间现值与 exact 目标值一并写出，并点明 exact 同样排除正式版。
   - **Fix:** 无（只增可证事实，未改语义；`0.2.2-rc.2` 与「维护义务」两个必须出现的要素均在）。
   - **Verification:** CHANGELOG 结构门通过；⑧ 绿。
   - **Committed in:** `8d0e9c6`

---

**Total deviations:** 0 auto-fixed（2 条记录性差异）
**Impact on plan:** 无——所有交付物、断言与计数均按计划成立；两条差异只涉及文档措辞与常量位置。

## Issues Encountered

- **`.planning/milestone.lock`**：执行期间引擎写入的 PID+时间戳临时文件出现在 `git status`（未被 `.gitignore` 覆盖，也不得提交）。本计划三次 task commit 与元数据提交均未纳入它，工作树其余路径为零。
- **历史计数纪律（前向注记建议，不在本计划实施）**：`01-VERIFICATION.md` / `02-VALIDATION.md` / `STATE.md` 中的 `26/26` 是已签名的 Phase 01/02 审计结论，本计划**未**改写。建议后续需要时追加一条带日期的注记（如 `> ⚠️ Phase 3（2026-11-12）注：本处 26/26 为 Phase 02 口径；03-02 落地 ⑧⑨⑩ 后活体计数为 32/32`），而不是回写旧数字。
- **历史记录三文件零改动已核**：`git status` 未出现 `01-VERIFICATION.md` / `02-VALIDATION.md` / `STATE.md`（Task 3 验收项）。

## User Setup Required

None - no external service configuration required.（本计划零对外写入：未 `npm publish`、未建 GitHub Release、未提 dshmarket PR、未 `git push`。）

## Next Phase Readiness

- **03-03（首次 push 与 CI 首绿）就位**：manifest 元数据与 workflow 均已在 HEAD 稳定；`BUILD.md:16` 已是实测 32/32；四格本地等价证据与 `permissions`/门控断言已由 03-01 备好，03-03 只剩「四格合练 → blocking-human 推送裁决 → 首跑 success 且 total_count==1」。
- **Phase 5 移交清单（本计划新增/加强）**：① `npm publish` 前必须重跑 `npm view dsh-gsd version --registry=https://registry.npmjs.org`，404 才继续（抢注窗口）；② `publishConfig.registry` 已钉 canonical，`tag` 仍待裁决——必须把 `dist-tags.latest` 指向首发版本，否则卡片裸名命令 404（D-06 硬移交）；③ 发布时删除 `private: true` 并同步 ⑥ 的 message 与断言（本计划只把 message 改到 Phase 5，断言仍要求 `private === true`）；④ dshmarket PR 直接取 `docs/dshmarket/` 两文件，需在 PR 描述里带上「非聚合包」论证。
- **无阻塞项**：三个任务全部验收通过；全量串行 32/32（`fail 0` / `cancelled 0`），`docs-consistency` 10/10，`check-pins` exit 0，`build.mjs` gates 全过。

## Self-Check: PASSED