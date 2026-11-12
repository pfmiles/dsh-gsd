---
phase: "3"
slug: "github-npm-dshmarket"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-12"
---

# Phase 3 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> 来源：本 phase 无执行期 SECURITY.md（state B），寄存器由三份 PLAN 的 `<threat_model>` 块重建（`register_authored_at_plan_time: true`），逐条对照 HEAD `cf13915` 的实现/证据核验。

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → 构建/安装链 | 宿主与桥接包的解析结果来自外部 registry；peer 收紧把解析面钉死在本版插件声明的桥接集上 | 版本元数据（公开）；无凭据 |
| 仓库 → 用户安装包（tarball） | `package.json` 的 `files` 是唯一收面闸门；`.planning/`、`tests/`、`build/`、`.github/`、`.gitignore` 全靠它排除 | 本仓源码与构建产物；**不得**含规划文档/测试 |
| GitHub Actions runner → 仓库 token | 顶层 `permissions` 决定 `GITHUB_TOKEN` 能力边界（改前继承仓库默认权限） | 仓库内容（只读 checkout） |
| 本地仓库 → 公开远端（origin/main） | push 是不可逆公开写入，进公开历史；CI run 永久留存 | 提交树 + workflow 文件 |
| 本地凭据 → GitHub 授权面 | origin 走 SSH（不受 OAuth scope 限制）；改走 HTTPS 则需 `workflow` scope | OAuth token scope（敏感） |
| 仓库 → 第三方 catalog（awesome-dsh-plugin） | 我方 YAML 会被对方 `validateEntries`/awesome-lint 判定，文案会作为市场卡片展示 | 产品文案（公开） |
| README/CHANGELOG → 用户（GitHub 与 npm 页面） | 发布面公开表述；数字与承诺必须与包内实际能力一致 | 版本/能力声明（公开） |
| 宿主插件管理器 → locale/*.json 与 icon.svg | 宿主读包内声明渲染标题/描述/图标；`files` 漏掉即静默降级 | 展示元数据（公开） |
| 外部图床（shields.io）→ README 渲染 | 徽章是第三方 URL；不可达只影响观感 | 常规 UA/Referer；无用户数据 |
| 工作树 → 构建产物树 | `tests/build-smoke.test.mjs` 会重写 skills/gsd-core/hooks/config/scripts；并发动作会读到半成品 | 派生构建产物 |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01 | Information Disclosure | `package.json` `files` / pack 收面 | high | mitigate | `tests/pack-contents.test.mjs` 三层断言在码（L112 白名单纯字面量/无宽泛条目；L132 `.planning/`+`tests/`+`build/`+`.github/` 零出现且顶层收敛于 12 项白名单；L153 条目有内容），且已纳入 `tests/*.test.mjs` 每波回路（c304c76 为 100% 纯重命名，内容零改动）；实包交叉核对记录 = 958 文件 / 12 顶层条目 / `.planning` 泄漏 0（03-01-SUMMARY） | closed |
| T-03-02 | Tampering | 依赖解析树（peer 收紧前的上游漂移） | high | mitigate | `package.json` peer = `@deepseek-ai/dsh-skill-filesystem 0.2.2-rc.1`，`build/assets/pins.json` L12 `lines.022.peer` 逐字同值（6ce5360 两文件同改）；`build/lib/check-pins.mjs` L152–159 (j) 强等值门 fail-closed exit 2，实跑 `--offline` → exit 0 `pins: all consistent (line dsh022)`；workflow/全仓 `--force` 与 `--legacy-peer-deps` 命中数 = 0 | closed |
| T-03-03 | Tampering | 矩阵格假绿（probe 绿但解析树错） | high | mitigate | `.github/workflows/compat-matrix.yml` L42–49：install-ok 格内 `require.resolve` 读出的 version 必须 == `${{ matrix.dsh }}`，不等 `exit 2`（fail-closed，与 gate 同口径）；reject 格由 `matrix.expect` 门控跳过；`run:` 步骤仍恰 4 个（L35/38/53/56） | closed |
| T-03-04 | Elevation of Privilege | GITHUB_TOKEN 默认权限 | medium | mitigate | yml L10–11 顶层 `permissions: {contents: read}`；工作流只做 checkout + 只读校验/构建/测试，无写回、无评论、无发包；4 格 × 6 步实测全绿（run 43218878911）⇒ 最小权限足以支撑 | closed |
| T-03-05 | Tampering | 测试门被弱化为换计数/绿 | medium | mitigate | 本 phase 触及 `tests/` 的提交仅两笔：c304c76 = 100% 重命名；f061bc0 = 56 行追加式（⑧⑨⑩），唯一"删除"行是 ⑥ 的**断言消息文本** Phase 3→5（谓词 `pkg.private === true` 逐字未动，仍为强约束）。测试计数 2+7+10+3+7+3 = **32**，与 BUILD.md:16 记录值等值 | closed |
| T-03-06 | Spoofing / Repudiation | docs/dshmarket 条目文案 | medium | mitigate | `docs/dshmarket/pfmiles__dsh-gsd.yml` 恰 4 个顶层键（url/name/category/description，description 下 en+zh）→ 5 字段形态；`category: workflow` 属 23 类闭集；无 `icon:` 键；文案只含可证事实（72 skills / GSD 1.20.1 / 与 locale `meta.description` 同源）；「非纯聚合包」论证写进 `docs/dshmarket/README.md` §4。**残余**：该 yml 无 per-commit 测试守卫（离线行级自检是 Task 2 的一次性 verify 命令），本字段形态由本轮复核确认 | closed |
| T-03-07 | Tampering | CHANGELOG 版本与实际版本漂移 | medium | mitigate | `tests/docs-consistency.test.mjs` L112 ⑧：首条目版本 === `package.json.version` === `1.20.1-1.dsh022`，且 `###` 小节名 ∈ 六类闭集；⑧ 在 `tests/*.test.mjs` 每波回路内（f061bc0） | closed |
| T-03-08 | Repudiation | INST-06 元数据静默降级（locale/icon 漏收） | medium | mitigate | L139 ⑩：locale 双语 `meta.title`/`meta.description` 非空、title 双边相等（实测均 `GSD on DSH`，description 117/64 字符）、`pkg.icon === 'icon.svg'`、`exports['./icon'] === './icon.svg'` 双通道就位、`files` 收录 `locale` 与 `icon.svg` | closed |
| T-03-09 | Tampering | `files` 顺带扩张（加 PNG / 塞 CHANGELOG、docs） | high | mitigate | `files` 仍恰 9 条（index.js / cordis.patch.yml / locale / icon.svg / skills / gsd-core / hooks / config / scripts），phase 内零改动；无 PNG 条目；`CHANGELOG.md` 与 `docs/` 均不在 `files`，且 pack-contents ② 的 `FORBIDDEN_FILES`/`ALLOWED_TOP_LEVEL` 会把任何新增顶层条目打红 | closed |
| T-03-10 | Information Disclosure | README 徽章引入外部请求 | low | accept | 静态 shields.io 徽章只产生常规 UA/Referer 请求，不含用户数据；不可达仅破图（仅装饰，不影响安装与许可声明），⑨ 只断言结构不断言 HTTP → 见 A-03-01 | closed |
| T-03-11 | Elevation of Privilege | push 通道凭据（gh token 无 workflow scope） | high | mitigate | `origin` 逐字未改写（实测仍 `git@github.com:pfmiles/dsh-gsd.git`，fetch/push 同）；未 force-push（`d3c8e89..20e20c0 main -> main` 快进）；「HTTPS + 提权」未作默认路径，由人裁决后执行（执行器未自行 refresh，P-03-j 成立）。**偏离**：SSH key 实测非账号有效 key（`Permission denied (publickey)`），推送实际走 HTTPS + `gh` credential helper，且 token 经**人类显式授权** `gh auth refresh -s workflow -s delete_repo` 后具备 `workflow`+`delete_repo` → 见 A-03-02 | closed |
| T-03-12 | Repudiation | 首跑红后被重推掩盖（红跑历史 + 假绿叙述） | high | mitigate | 真仓唯一一条 run：**43218878911**（event=push / run_attempt=1 / conclusion=success / headSha=20e20c0），无 rerun；本轮 live 复核 `gh api repos/pfmiles/dsh-gsd/actions/runs --jq .total_count` → **1**（无红跑史）；推送前在临时仓 `pfmiles/dsh-gsd-ci-probe` 同 SHA 干跑后删仓，不污染真仓历史 | closed |
| T-03-13 | Information Disclosure | 推送内容含未发布/本地资产 | medium | mitigate | push 前 `git status --porcelain`（仅排除本计划自己的 `03-03-SUMMARY.md` 单一路径）为空、`git ls-files '*.tgz'` 为空；`.gitignore` 含 `*.tgz`、`.gsd-build-tmp/`、`.build-cache/` 与五棵产物树（skills/gsd-core/hooks/config/scripts）；`.planning/.gitignore`（c82f55e）忽略运行期 `state.json`、`tmp/`、`milestone.lock`，使「干净树」判据可长期成立；只推 main，无额外 refspec。本轮复核：status 0 行、tracked tgz 0 条 | closed |
| T-03-14 | Tampering | 推送的树与本地验证过的树不一致 | medium | mitigate | 权威远端 sha = `gh api repos/pfmiles/dsh-gsd/commits/main --jq .sha` → **20e20c0**（本轮 live，== push 输出目标 == CI run headSha），远端 tree 含 `.github/workflows/compat-matrix.yml`（contents API 命中）；`20e20c0..HEAD` 差异仅 4 份 `.planning/` 文档（REQUIREMENTS/ROADMAP/STATE/03-03-SUMMARY），**发布面与 workflow 字节级一致** ⚠️**此句已被 2026-11-12 后置更正推翻，见文末「后置更正」节**。**caveat**：plan 写的 `git rev-parse origin/main == HEAD` 在本环境不可复现——推送走显式 HTTPS URL，`refs/remotes/origin/main` 不再自动更新（仍 `d3c8e89`），故该口径已换成 `gh api` 权威 sha + 树差异 | closed |
| T-03-SC (01) | Tampering | npm/pip/cargo installs（03-01） | high | mitigate | 零新依赖：`package.json` phase 内 diff 仅元数据字段 + peer 收紧 + `publishConfig`，`dependencies` 两条 `@deepseek-ai/*` exact 未动；四格安装用 Phase 02 已核验官方 exact 版本（Package Legitimacy Audit 全 OK），无 `[ASSUMED]`/`[SUS]` 包触发人工 checkpoint | closed |
| T-03-SC (02) | Tampering | npm/pip/cargo installs（03-02） | high | mitigate | 零安装（`js-yaml`/`semver` 均未引入；catalog 条目走零依赖行级正则自检）；仓库无 lockfile 变更（三件套均无 package-lock/pnpm-lock/yarn.lock） | closed |
| T-03-SC (03) | Tampering | npm/pip/cargo installs（03-03） | high | mitigate | 零新依赖；`gh`/`actionlint` 为既有工具；探针仓与真仓安装同用 Phase 02 已核验 exact 版本；`gh repo delete` 仅作用于自建探针仓（已 404 复核） | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` (high) count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

> **T-03-11 偏离注记（重要）：** 该威胁的缓解前提是「origin 走 SSH ⇒ 不受 OAuth scope 限制」，**实测前提被推翻**（key 非 `pfmiles` 账号有效 key，`git ls-remote` exit 128）。实际通道 = `git -c credential.helper= -c credential.helper='!gh auth git-credential' push <https-url> main`，token 原有 `gist/read:org/repo` 缺 `workflow`，由**人类**执行 `gh auth refresh -h github.com -s workflow -s delete_repo` 后追加 `delete_repo, workflow`。可执行控制仍成立的三条：① `origin` 未被改写成 HTTPS（凭据通道未被固化进 `.git/config`）；② 无 force-push；③ 提权由人裁决、执行器未自行 refresh。**不可回收的部分** = 该 token 现具备 `workflow` 与 `delete_repo` 两个额外 scope，记入 A-03-02 并给出收敛建议。
>
> **T-03-03 与跨 phase 遗留项的区分：** 本 phase 新增的正向断言只覆盖「install-ok 格解析树是否匹配」，**未**改变步级门控结构（4 个 `run:` 步仍各挂同一条 `inputs ∩ matrix` 的 `if:`）。Phase 2 登记的 `T-2-09`（`workflow_dispatch` 输入零匹配 ⇒ 全 skip 仍收绿）因此**原样延续**为 open–non-blocking（medium < high），本轮不重评、不并入本寄存器计数。若该 workflow 日后成为 required check，该项应重评为 high。

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| A-03-01 | T-03-10 | README 顶部的两枚静态 shields.io 徽章（`license: MIT`、`DSH 0.2.2-rc.1`）是第三方 URL，渲染时向 `img.shields.io` 发出常规 GET（UA/Referer，无用户数据、无鉴权、无追踪参数）；离线/受限网络下仅退化为破图，不阻塞安装、不改变许可声明。选择 shields.io 而非仓内 SVG 是写死决策：`docs/` 不进安装包，本地 SVG 在 npm 页面会 404。⑨ 只断言结构（`img.shields.io` 前缀）不断言 HTTP 可达，属有意为之 | 规划期用户裁决（03-PATTERNS `[ASSUMED]` A5 → 03-02-PLAN Task 2 步骤 1）；执行期 8d0e9c6 落地 | 2026-11-12 |
| A-03-02 | T-03-11 | **残余授权面**：本机 `gh` OAuth token 因「SSH 不可用 + 推 workflow 文件必须 `workflow` scope」而经人类授权扩权，现为 `delete_repo, gist, read:org, repo, workflow`。`workflow` 意味着该 token 可改写本仓（及同账号其它仓）的 CI 定义；`delete_repo` 与本次交付无长期必要性（仅为删除探针仓）。风险接受理由：无 SSH 可用路径，且不改写 `origin`、不把凭据写进仓库配置；提权是人工一次性动作、有审计记录。**收敛建议**（Phase 5 前）：`gh auth refresh -h github.com -s repo -s read:org -s gist` 收回 `delete_repo`（`workflow` 在首发周期内保留），或改用 fine-grained PAT 限定到单仓 `Contents: read/write` + `Workflows: write` | 人类（03-03 Task 2 blocking-human checkpoint 显式授权 `gh auth refresh`）；执行器未自行提权 | 2026-11-12 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit

| Date | Threats found | Closed | Open | Verdict |
|------|---------------|--------|------|---------|
| 2026-11-12 | 17 | 17 | 0 | L1 verified — state B（无既有 SECURITY.md）+ plan-authored register + ASVS L1 + `block_on: high` ⇒ `threats_open: 0` 后按 short-circuit 直写合同；L1 深度 = 每条缓解在实现/证据中都有落点（spot-grep + 行号 + 执行期记录） |

**Severity 分布：** high 9（T-03-01/02/03/09/11/12 + T-03-SC×3）· medium 7（T-03-04/05/06/07/08/13/14）· low 1（T-03-10）。

**本轮独立复核（HEAD `cf13915`，只读）：**
- `node build/lib/check-pins.mjs --offline` → exit 0，`pins: all consistent (line dsh022)`（(j) 强等值门在码且通过）。
- `gh api repos/pfmiles/dsh-gsd/actions/runs --jq .total_count` → **1**；`gh api repos/pfmiles/dsh-gsd/commits/main --jq .sha` → **20e20c0**；contents API 命中 `.github/workflows/compat-matrix.yml`。
- `git remote -v` → `git@github.com:pfmiles/dsh-gsd.git`（fetch/push 同，逐字未变）；`git status --porcelain` → 0 行；`git ls-files '*.tgz'` → 空。
- `20e20c0..HEAD` 差异 = `.planning/{REQUIREMENTS,ROADMAP,STATE}.md` + `03-03-SUMMARY.md`（发布面/workflow 零差异）。
- `git diff 63eb7dc..HEAD -- package.json` → 仅元数据 5 字段 + peer 收紧 + `publishConfig`；无依赖增删；仓库无 lockfile。
- `tests/` 计数 = 2+7+10+3+7+3 = 32（build-smoke / compat-matrix / docs-consistency / pack-contents / rewrite-map / version），与 BUILD.md:16 的 `预期 32/32` 及执行期记录 32/32 等值。
- 未复跑 `node build.mjs` 与 `node --test tests/*.test.mjs`：**有意为之**——本 session 有并发执行者，`tests/build-smoke.test.mjs` 会重写构建树，并发跑会产生假红。套件 32/32 与 `gates: all passed (A/B/C)` 引用执行期记录（f061bc0 / 03-01-SUMMARY / 03-03-SUMMARY），报告面已注明来源。

**未在密码学/平台层复现的证据（如实标注）：** ① T-03-01 的 `npm pack --dry-run` 真包核对（958 文件 / 12 顶层条目）为执行期一次性记录，本轮未重跑（prepack 会递归回 build + 全量套件），静态防线在码；② T-03-02 的副本内真实 `npm install` 解析树双证（656/601 包）同样为执行期记录，本轮仅复跑仓库侧 `check-pins --offline`；③ T-03-14 的 `origin/main` 跟踪 ref 因推送方式失效，已改用 `gh api` 权威 sha，属口径替换而非证据缺失。

**与既有 phase 的关系：** Phase 1（`01-SECURITY.md`）、Phase 2（`02-SECURITY.md`）各自闭合；本 phase 不重开其条目。唯一跨 phase 延续的 open 项为 `T-2-09`（medium，non-blocking），见上方注记。

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log（A-03-01 / A-03-02）
- [x] `threats_open: 0` confirmed（high 及以上 open 项 0）
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-12

---

## 后置更正（2026-11-12，HEAD `ab9e2f4`）

**起因：** 本文件撰写于 HEAD `cf13915`。此后 code-review 立案 CR-01（`index.js` 包根 off-by-one，72 个技能永不加载），由 `49c0efe` 修复。该修复改变了「远端树 vs 本地已验证树」的实情，故 T-03-14 的结论句必须更正——security 文档里留着已知为假的陈述，比缺一条更糟。

**实测（HEAD `ab9e2f4`）：** `git diff --name-status 20e20c0..HEAD` 共 **15** 个文件：

| 类别 | 文件 | 是否入包（`package.json.files`） |
|---|---|---|
| `.planning/` 文档 | REQUIREMENTS / ROADMAP / STATE / 03-03-SUMMARY（改）+ 03-REVIEW / 03-REVIEW-DISPOSITION / 03-SECURITY / 03-UI-REVIEW / 03-VERIFICATION（新） | 否 |
| 发布面 | **`index.js`**（CR-01 修复） | **是** |
| 不入包 | `BUILD.md`、`tests/compat-matrix.test.mjs`、`tests/docs-consistency.test.mjs`、`tests/pack-contents.test.mjs` | 否 |

**更正后的准确表述：** 入包面相对 CI 已验证的 sha `20e20c0` **恰差 `index.js` 一个文件**——即 CR-01 修复本身。原文「发布面与 workflow 字节级一致」不再成立；`.github/workflows/compat-matrix.yml` 与 `package.json` 确实字节未变，但 `index.js` 变了。

**对 T-03-14 判定：** 威胁本体仍 **closed**——差异已知、有意、可解释、可枚举（恰 1 个入包文件），符合本条「推送的树与本地验证过的树不一致」的缓解目标。但须明确记账：

- 该修复已**本地**验证：全量 37/37；真 tarball（958 文件）装进一次性 profile 后，安装版 `skillsDir` 解析到 `.../dsh-gsd/skills`（存在，72 项），`dsh --profile <fresh> --dump-config` exit 0 且 `- id: gsd` / `- id: gsd-hooks-bridge` 两行俱在；探针 profile 已删除。
- 该修复**尚未经 CI 验证**——`20e20c0` 那次绿灯跑的是**带 CR-01 缺陷**的 `index.js`。

**由此新增的发布前硬要求（Phase 5，阻塞级）：** `npm publish` 前必须让一次 CI run 覆盖修复后的 `index.js`（重新 push 或等价验证）。否则等于把一个从未被 CI 跑过的入口文件发出去。此项与 T-03-11/A-03-02 的 token 权限收敛一并列为 Phase 5 门禁。

**证据完整性声明：** 本更正是**追加**，不删改原文——T-03-14 原句保留并加显式失效标记，使「当时的观测」与「现在的实情」都可追溯。