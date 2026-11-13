# Phase 4: 迁移与并存 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-11-13
**Phase:** 4-迁移与并存
**Areas discussed:** 迁移序列与破坏半径, 双源清除与来源证明, 跨仓动作边界, 差异表与 HOOK-05

---

## 迁移序列与破坏半径

开场侦察结论：旧部署是**机器级**的（`~/.dsh` 被所有 profile 共享），插件是 **profile 级**的；`--uninstall` 会 `rm -rf ~/.dsh/skills/gsd-*` 并从**所有** profile 的 `cordis.patch.yml` 剥掉 bridge 块。本机 `web`/`headless` 仍依赖旧 bridge。

### Q1. 迁移窗口的破坏半径怎么定？

| Option | Description | Selected |
|--------|-------------|----------|
| 机器级整体切换（先卸后装） | MIG-01 字面；双源窗口最短，但 uninstall 时 web/headless 同时失去 bridge 与 72 技能；要求前置扇出扫描 | ✓ |
| 先全量装插件，再全局卸旧 | 零中断，但双源窗口拉长，需修订 MIG-01 措辞 | |
| 双轨并存，卸载可选 | 最安全，但「避免双源」从硬约束降为建议 | |

**User's choice:** 机器级整体切换（先卸后装）
**Notes:** 选最严格的顺序，接受中断窗口。

### Q2. 迁移 runbook 在哪台环境上跑通？

| Option | Description | Selected |
|--------|-------------|----------|
| 临时 DSH_HOME 演练（推荐） | `DSH_HOME=/tmp/dsh-mig-<ts>` 全流程；零风险，可复现脚本用户初态；本机迁移留 P5 | ✓ |
| 演练 + 本机真实迁移都做 | Phase 4 内完成两者；web 不可回退风险最高 | |
| 不演练，直接本机迁 | 最快拿真实证据，但破坏 web/headless 需手工重建 | |

**User's choice:** 临时 DSH_HOME 演练（推荐）
**Notes:** 与 03-D-02 同构：不可逆动作推迟 Phase 5。

### Q3. 发现还有 profile 依赖旧部署时，runbook 怎么办？

| Option | Description | Selected |
|--------|-------------|----------|
| 硬门：未裁决就中止 | 探测到就停，要求逐个裁决；宁可卡住也不半迁移 | ✓ |
| 全量要求，不留例外 | 规定所有 profile 必须装插件；对单 profile 用户过于霸道 | |
| 只警告，不阻断 | 风险判断全交给读者 | |

**User's choice:** 硬门：未裁决就中止

### Q4. 迁移后遗留的全局 gsd_run（当前 1.16.0）怎么处置？

事实：PATH 上 `gsd_run` → `@opengsd/gsd-core@1.16.0`；包内引擎 1.20.1。旧 skills 的 adapter 走 PATH，包内 skills 走 `<GSDROOT>`，不碰 PATH。

| Option | Description | Selected |
|--------|-------------|----------|
| 默认卸掉全局 CLI（推荐） | `npm uninstall -g @opengsd/gsd-core`；单一真源，消除 1.16.0 陈引擎 | ✓ |
| 保留，但断言版本一致 | 不卸，把「gsd_run 版本 == 包内引擎」作为硬断言 | |
| 保留，仅记录提示 | 文档最轻，1.16.0 长期静默存在 | |

**User's choice:** 默认卸掉全局 CLI（推荐）

---

## 双源清除与来源证明

开场侦察结论：`~/.dsh/skills` 84 项 = 72 个 `gsd-*` + 12 个 `teamclaw-*`；同名技能两边内容不同（`gsd-health` 3084 B vs 3587 B）。CR-01 当初正是被这些旧技能兜底掩盖。

### Q1. 「技能确实来自插件」用什么判据？

| Option | Description | Selected |
|--------|-------------|----------|
| 阴性对照 + 内容比对（推荐） | 旧源为空 + 抽查正文与包内 sha 一致；同时证明「无旧源」与「未混源」 | ✓ |
| 仅 provider 日志行 | 最轻，只证明「提供了」，不证明「没混源」 | |
| 仅技能计数 | 144→72 最直观，但去重会让判据静默失效 | |

**User's choice:** 阴性对照 + 内容比对（推荐）

### Q2. 这套判据放哪里？

约束：`skills/`、`gsd-core/` 是构建产物（gitignored，由 build.mjs 重建），改 `/gsd-health` 会被覆盖；`scripts/` 随包发布。

| Option | Description | Selected |
|--------|-------------|----------|
| 纯文档 + 命令块（推荐） | 可复制命令块；零新增文件、零打包面变化 | ✓ |
| 随包新增检测脚本 | `scripts/gsd-migrate-check.mjs`；可反复自检，但多一个长期维护入口 | |
| 本仓 tests/ 守卫 | 只护仓库回归，看不到用户机器 | |

**User's choice:** 纯文档 + 命令块（推荐）

### Q3. 阴性对照扫到什么程度？

| Option | Description | Selected |
|--------|-------------|----------|
| 技能 + hooks 双面扫（推荐） | 技能残留＝内容串味，bridge 残留＝重复拦截；两类失败模式不同 | ✓ |
| 只扫技能 | 文档更短，双 bridge 不会被单独发现 | |
| 全机 find 扫描 | 最彻底，但输出噪声大 | |

**User's choice:** 技能 + hooks 双面扫（推荐）

---

## 跨仓动作边界

开场侦察结论：旧脚本在独立仓 `pfmiles/install-gsd-dsh`（remote SSH，HEAD `41fcc7a`，工作树干净）。该目录下有两篇**不同**的 README：仓内 `README.md`（23.6 KB 英文）与上级目录 `INSTALL-GSD-DSH-README.md`（16.6 KB 中文，不在任何仓内）。

### Q1. MIG-03 的旧仓互链，本 phase 做到哪一步？

| Option | Description | Selected |
|--------|-------------|----------|
| 本仓改 + 旧仓备料不推（推荐） | 沿用 03-D-02；零对外写入 | ✓ |
| 本 phase 直接改并推旧仓 | 字面完成，但需另一仓提交 + SSH 不可用需走 gh 凭据 | |
| 旧仓完全不碰 | 最省，但 MIG-03 字面未满足 | |

**User's choice:** 本仓改 + 旧仓备料不推（推荐）

### Q2. 旧仓互链的备料做成什么形式？

| Option | Description | Selected |
|--------|-------------|----------|
| 粘贴片段 + PR 描述（推荐） | markdown 片段中英各一 + 建议插入位置 + PR title/body；不依赖行号 | ✓ |
| 真正的 git patch | 可 `git apply`，但旧仓一变动就冲突，需维护基准 sha | |
| 只写意图说明 | 最轻，Phase 5 还得重写 | |

**User's choice:** 粘贴片段 + PR 描述（推荐）

---

## 差异表与 HOOK-05

开场侦察结论：本仓已有 7 篇文档（README 双语、BUILD.md、CHANGELOG、THIRD-PARTY-NOTICES、PLAN、SPIKE、docs/dshmarket/）。

### Q1. 三块内容怎么安放？

| Option | Description | Selected |
|--------|-------------|----------|
| 单篇 docs/MIGRATION.md（推荐） | runbook + 差异表 + DSH 升级排障三节；README 顶部一行入口 | ✓ |
| 两篇：迁移 / 排障 分开 | 按「迁移中」与「已装出问题」分读者；代价是多一篇维护 | |
| 全进 README | 零新文件，但双语 README 会明显膨胀 | |

**User's choice:** 单篇 docs/MIGRATION.md（推荐）

### Q2. docs/MIGRATION.md 用什么语言？

| Option | Description | Selected |
|--------|-------------|----------|
| 双语，与 README 同构（推荐） | 中文在前 → `---` → 英文在后；公开仓兼顾英文访客 | ✓ |
| 中文单语 | 与 BUILD.md 同构；英文用户会直接关页 | |
| 英文单语 | GitHub 友好，但现有脚本用户多为中文用户 | |

**User's choice:** 双语，与 README 同构（推荐）
**Notes:** 已知成本：写作量翻倍，日后需同步维护两份。

### Q3. 三轴差异表做成什么形式？

事实纠偏：旧 `~/.dsh/gsd-hooks.dsh.json` 与包内 `config/gsd-hooks.json` 事件集合**完全相同**（5 事件 / 14 matcher，双向差集为空）——差异在 configPath/pluginRoot 归属，不在事件。

| Option | Description | Selected |
|--------|-------------|----------|
| 对照表 + 选型建议（推荐） | 表头 `轴｜旧脚本｜插件｜迁移影响` + 表前选型建议 + 单列共同限制 | ✓ |
| 仅决策表（场景 → 推荐） | 最快得到答案，但看不到细节差异 | |
| 仅差异清单 | 中性审计向，读者需自行判断 | |

**User's choice:** 对照表 + 选型建议（推荐）

### Q4. HOOK-05 的症状表要不要先实测一遍？

| Option | Description | Selected |
|--------|-------------|----------|
| 做一次真实错配演练（推荐） | 临时 DSH_HOME 里改成不匹配，记录真实报错与修复；症状表来自实测 | ✓ |
| 只写历史已知症状 | 取材 Phase 1/2 记录；未实测的症状可能失真 | |
| 只演练 pin 漂移 | 只盖静态门，盖不住运行时症状 | |

**User's choice:** 做一次真实错配演练（推荐）

---

## Claude's Discretion

- 错配演练的具体注入点（改 `pins.json` peer vs 改临时 home 里 bridge 包的版本）
- MIG-04 并存验证的覆盖面：本机 `web` 是唯一真实样本（`dsh-deja` + `dshmarket` + 旧 bridge），`codegraph` 未安装；「无冲突」的判定标准待定
- 临时 `DSH_HOME` 的命名与清理策略
- runbook 命令块的组织方式（整段粘贴 vs 分步逐条）
- 是否在 `tests/docs-consistency.test.mjs` 加一条「README 顶部含 MIGRATION 链接」守卫

## Deferred Ideas

- 本机真实 `~/.dsh` 整体迁移 → Phase 5
- 旧仓互链的提交与推送 → Phase 5
- 随包迁移检测脚本 → 本 phase 明确不做（D-06）
- `dsh-gsd-core` 精简档 → Backlog

## Scope 出入（已记录，待 planner 裁定）

- `HOOK-05` 不在 ROADMAP Phase 4 的 Requirements 行里，但 `02-CONTEXT.md` 与 `03-CONTEXT.md` 的 `<deferred>` 两处都把它移交 Phase 4。本 CONTEXT 按后者纳入，并要求 planner 若不纳入须明写并回写 ROADMAP。
- `docs/` 不在 `package.json` 的 `files` 白名单内 ⇒ `docs/MIGRATION.md` 不会进 npm 包，只在 GitHub 可见。若认为 npm 用户也需要，须显式裁决，不得默认加进 `files`。