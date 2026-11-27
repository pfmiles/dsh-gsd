# Milestones

## v1.0 首发 (Shipped: 2026-11-27)

**Delivered:** `dsh plugin --profile <name> add dsh-gsd` 一条命令把 GSD Core（72 skills + 独立引擎 + 守卫钩子）装进 DSH 任一 profile —— 不写受管 `~/.dsh` 文件、不需要安装脚本，升级/回滚 = 同命令换版本号。

**Phases completed:** 5 phases, 18 plans, 48 tasks
**Git:** `aeafe73..42cc5ba` — 233 commits，2026-11-10 → 2026-11-27（16 天）· 141 files changed, **+32,664 / −0** · 39 个非 `.planning` 文件共 5,774 行（含双语文档）
**Shipped:** npm `dsh-gsd@1.20.1-1.dsh022`（`dist-tags.latest`，958 files / 4,582,650 B，sha1 `69cc8c8a5482fb2d097daa8dec5f7e0f510c3007` = registry `dist.shasum`，发布 commit `a0529ac`）· GitHub Release `1.20.1-1.dsh022`（`prerelease=false`，`targetCommitish=a0529ac`）· dshmarket [PR #18793](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/18793)（MERGED `2026-11-25T16:36:45Z`）· 旧仓 `pfmiles/install-gsd-dsh` 互链 `3af3f27`

**Key accomplishments:**
- build.mjs 资产来源切换为 @opengsd/gsd-core@1.20.1 npm tarball：npm pack/离线三档取件 → fetched==requested 预 gate → 官方 install.js --claude staging → 4 树白名单捕获 → staging 根改写 → 72 份 adapter 注入 → 双 gate，exit 0/1/2 契约 + THIRD-PARTY-NOTICES 完整性 pinning 全链落地
- 改写映射抽成可单测 CJS 模块（build/lib/rewrite-map.cjs 9 对映射 + 六组单测）、双 gate 外置为独立脚本 tests/run-gates.sh（gate A 双锚 / gate B 三段式 / gate C 72×1，build.mjs staging 清理前强制消费 exit 0/1/2）、产物 smoke tests/build-smoke.test.mjs 与 package.json test/prepack 链落地——SKIL-03/SKIL-04/INST-02 获得每波可重跑的机器验证锚点
- 验证实例三项复验 live 证据闭环（/gsd-health + 独立 CLI + read 精确 .env 硬拦 exit 2，含 hooks 桥接适配器回归的修复与新快照声明）+ BUILD.md 八章构建文档与 README/SBOM 双语互链
- 兼容判定管道全部层位贯通并出双向宿主证据：pin 真源 → check-pins 对照（篡改有牙）→ 宿主求值探针（0.2.2-rc.1 install-ok / 0.2.1-rc.5 reject）→ 4 格矩阵 workflow → 一致性静态防线；version 执行真值迁至 1.20.1-1.dsh022
- 版本号方案 `<gsd-ver>-<rev>.dsh<line>` 机器可校验（parseVersion/validateVersion 单测消费 check-pins 单一实现）、矩阵 GSD 轴第二值 1.19.0 落本地构建+身份+SBOM canonical 证据（§⑦ 双镜像实测 + ① 档离线消费回环）、README/BUILD 文档位双语成文并被 docs-consistency ①-⑦ 静态防线锁死
- 验证实例对 1.20.1-1.dsh022 快照的全量复验闭环：doctored fixture 被宿主 preflight 干净拒绝（VER-01 机器半 exit 1 + 人读半「可读」双关）、DEV-03 三项 live 复验 + 两条自动 verify 全绿留证 verify-evidence.md（新快照声明闭环）——Phase 1 契约回归（dump-config 双行、~/.dsh 零新增、guards 拦截不变）同证
- peer 收紧为 exact `0.2.2-rc.1`（manifest + pins 同提交，L37 零改动）后，npm 真实解析树收敛到 656 包并 install-ok 通过；workflow 补上 `contents: read` 与 install-ok 格门控的「解析树 == 矩阵格」正向断言；发布面防线以纯重命名纳管 tests/，全量 29/29，真 tarball（958 文件）在干净 profile `gsd-p3-release` 装成并 boot（引擎 1.20.1 / 72 skills / 两条 bundle patch 行）。
- manifest 补上 repo/homepage/bugs/keywords/author 并把 registry 钉到 npmjs.org；README 顶部摆出 MIT 与 DSH 行徽章、双语各补一条 catalog 同款裸名安装命令、状态文案改到 Phase 5 时间线；CHANGELOG 以 `1.20.1-1.dsh022` 开篇并与 package.json 版本机器等值；dshmarket 条目严格 5 字段（category=workflow、无 icon）连同提交流程说明一并入库；⑧⑨⑩ 三条防漂移断言落地后，串行全量两次同测 `ℹ tests 32`，BUILD.md:16 写 32/32。
- 首次推送落地 `d3c8e89..20e20c0 main -> main`：CI 史首跑 `43218878911` 全绿（四格 × 6 步），真实仓 `total_count` 0→1，无红跑历史；顺带固化两条影响后续一切操作的事实——本机 SSH 不可用，HTTPS 推送必须用 `gh auth git-credential` 覆盖 stale keychain（`origin` 保持 SSH 未改写）。
- 双语迁移指南 §① 的每条命令块都在临时 20 字符 `DSH_HOME` 里真跑过一遍：旧源 72 / 3084 B / 3195 B 且两条前提（20 字符 home + GSD 1.16.0）同轮断言 → 硬门 hits=1 → 卸载后 0 / absent / ABSENT → 包内 3587 B / 3856 B / 72 → dump `stderr 0 B` 且标头 24→25、`# == dsh-gsd` 出现、两 row 各 1；同一组数字逐字回填正文与证据册，README 中英各加一行入口而双语切片点未位移（docs-consistency 13/13）。
- `docs/MIGRATION.md` §② 在 zh/en 两半各长出 3 个 `###`（选型建议 → 四列三行三轴表 → 单列共同限制），zh 表头逐字沿用 D-12、en 半零 CJK 且同构；`docs/oldrepo-link/` 四件备料落盘而旧仓 HEAD / 工作树 / remote 一字未变——「英文片段是唯一正式件、中文片段备而不用」由文件首行的 HTML 注释固定下来。
- `docs/MIGRATION.md` §③ 把四层错配门写成双语五列四行表，每一格都从本轮实测抄来：静态注入 `pins.json` 的 `lines.022.peer` → `check-pins` exit 2（复原后 sha256 逐字节相同），运行时注入已装包的 `engines.dsh` → `EXIT=0` 但标头 25→24、行数 1255→1243、`# == dsh-gsd` 标签消失、stderr 恰 1 行 526 B，row 级 boot 更实拍到 `dsh: disabling profile plugin row "gsd-hooks-bridge"`（RESEARCH 的 A4 假设由此变为实测）；⑭ 用围栏感知的标题计数把「双语只写一半」变成机器判据（13→14，全量 37→38，`BUILD.md:16` 同提交 38/38）。
- MIG-04 从「能装能跑」改写成四条集合判据并在一次性 `DSH_HOME` 里真跑：静态段在真实已装物上证明四个 bundle 的五个 row id 两两不相交（`coexist-static ok`），动态段真装 `dsh-deja@0.24.0` + `dshmarket@1.73.15` + 本仓 tarball 后得到 `bundles=5 / stderr 0 B / headers 24→27 / 四个 id 各恰 1 / uniq -d 空` 并以 `COEXIST-DRILL PASS` 收尾；`@jiangzhenguo/dsh-codegraph` 未被动态安装这一缺口，与另两条局限一起写进文档与证据册，交给 Phase 5。
- 步骤 1 的硬门第一次有牙：`MIG-GATE` 块在卸载前真的能看到技能基线与「谁还只靠它们」并非零中止（逐 profile 裁决记录、机器级三态、exit 0/1/2）；步骤 6 拆成静态 / 演练专用 `COEXIST-DRILL` / 零安装 `COEXIST-REAL` 三段，真实迁移改用 listed ⇔ labeled 配对判据、不比较增量
- 在零残留 `/tmp` `DSH_HOME` 上把「装得上、跑得完、拦得住」变成可重放的机器判据：3 个 live 用例（UAT-01/02/03 + INST-01..05）实跑 `pass 3 / fail 0 / skipped 0`，并把 `--test-concurrency=1` 补齐到三处、用逐处计数断言钉住（D-10-1）。
- 把余下的验收面变成可重放的判据：两个 hook 在真实分发路径上各按设计行事（commit 校验三段对照 + injection 只落日志）、同一条 `plugin add` 能把版本换进换出、插件启动成本有一个带基线的数字（9 ms → 279 ms）、技能 watch 被诚实标成 `not measured`，并把 D-10-5 修成经得住重建的形态（canonical 覆盖件 + 拷贝步，连跑两次构建仍字节等值）。
- `dsh-gsd@1.20.1-1.dsh022` 已在 npm 上成为 `dist-tags.latest`，registry 通道装出的 958 个文件与 registry 那份 tarball 逐字节相同并通过 UAT-01 的会话谓词；GitHub Release 的 tag 解引用等于 `PUBLISHED_SHA` 且 `prerelease=false`；dshmarket 的单文件 PR（#18793）逐字节一致、四检中 ①②③ 已确认 —— 顺带量到「publish 回执 → 版本可读」约 7 分钟，把「一次 404 不判红」从纪律变成了有具体时长的读数。
- 真实 `~/.dsh` 从旧脚本单源迁到插件单源（旧源 0、两 profile 各 1 插件 row、包内 72 技能），G-4 用静态段四源 + CB-8b 闭合，3091 刷新到插件自供技能，旧仓 `install-gsd-dsh` 的 `README.md` 拿到与 `snippet.en.md` 逐字节相同的互链段。

### Closeout

**Milestone marker:** git tag **`milestone-1.0`**（annotated，指向归档提交）。**刻意不用 `v1.0`** —— 本仓的对外版本空间是插件包版本 `1.20.1-1.dsh022`（`<gsd-ver>-<rev>-dsh<line>`，编码上游 GSD 1.20.1），由 tag `1.20.1-1.dsh022` 标记 commit `a0529ac`；`v1.0` 会让人以为存在一个叫 1.0 的 npm 包或 Release（实际没有），而 `v1.0` 指向的树 `package.json` 里仍是 `1.20.1-1.dsh022`，检出后打出的包会**自称同一个版本号却是不同字节**。两套编号因此分居两个命名空间。

**Closeout type:** `override_closeout` —— 5 份 VERIFICATION 在各自收官时都是 `passed`，但 5 份 `covered_digest` 在收官时**全部对不上当前字节**。审计侧是干净的：`audit-open` 收官前报 2 条 `uat_gaps`（`05-UAT.md` / `05-UAT-EVIDENCE.md`，`open_scenario_count` 均为 0），成因是这两份手写交付物缺 GSD 期望的 `status:` frontmatter，**并非真的有待办场景**；本次给两份补上终态声明后 `audit-open` 报 `All artifact types clear.`，**没有 acknowledge 任何条目**，因此 STATE.md 里没有 `## Deferred Items` 行。

### Known verification overrides

| Phase | 报告判定 | 覆盖文件中已变的部分 | 归因 |
|---|---|---|---|
| 1 | `passed` 14/14 | `BUILD.md` `README.md` `build.mjs` `package.json` `tests/build-smoke.test.mjs` | P2–P5 追加文档段与参数化（如 `--test-concurrency=1`） |
| 2 | `passed` 13/13 | `.github/workflows/compat-matrix.yml` `build/assets/pins.json` `BUILD.md` `README.md` `package.json` +2 | 同上 |
| 3 | `passed` 13/13 | `.github/workflows/compat-matrix.yml` `CHANGELOG.md` `BUILD.md` `README.md` `03-01-SUMMARY.md` +2 | 同上；`03-01-SUMMARY.md` 的改动是本次收官的 YAML 修复 |
| 4 | `passed` 48/48 | `BUILD.md` `README.md` `tests/docs-consistency.test.mjs` | P5 扩了断言 |
| 5 | `passed` 44/44 | `05-01-SUMMARY.md` `05-02-SUMMARY.md` `05-UAT.md` `05-UAT-EVIDENCE.md` | **本次收官自身**，见下 |

phase 5 的 21 个 covered 文件里，`build.mjs` / `package.json` / `tests/*` / `.github/*` / `BUILD.md` / `README.md` / `CHANGELOG.md` **一个字节都没动**；变动的 4 份全是 `.planning/` 文档，且都是记账/语法级：3 份 `*-SUMMARY.md` 的 frontmatter 原本是**非法 YAML**（`summary-extract` 与 `milestone.complete` 读 one-liner / task 计数前就抛错 ⇒ 一直被静默丢出里程碑汇总），修法是只给 3 处标量加引号，正文零改动；另 2 份是给 UAT 交付物补终态声明。

**本次没有重跑任何 verifier，也没有用 `verification fingerprint` 重算 digest**——后者等于不重跑判定就自证通过，比留一份过期的真报告更糟。132/132 的 must-have 判定未被推翻，也没有一条被重新判定过。

### Known gaps

10 条需求至今未勾选，且**没有任何 phase 的 `Requirements:` 行承保它们**（ROADMAP 里 phase 1 只承保 SKIL-03/04，phase 2–5 的清单同样不含）⇒ 没有 verifier 针对这 10 个 ID 逐条判过。能力是存在的，缺的是 ID 级的承保与判定：

| ID | 主张 | 判据强度 | 证据位置 |
|---|---|---|---|
| SKIL-01 | 会话技能目录出现全部 72 个 `gsd-*` | 直接 | 判据段 15（干净 `/tmp` home 会话里列出 72）；D-10-3 迁移后 `gsdtest` 仍供 72 |
| SKIL-02 | `/gsd-health` 端到端（引擎经包内绝对路径） | 直接 | UAT-02 行 / 判据段 3 / 用例 ⑤ |
| HOOK-01 | 桥接经 bundle patch 行挂载 | 直接 | `--dump-config` 两 row 各 1（INST-03/05）；UAT-04 在真实分发路径跑到 |
| HOOK-02 | `.env` 阳性拦截（exit 2 + 文案） | 直接 | UAT-03 行 / 判据段 3（双哨兵对照） |
| HOOK-03 | 会话落盘有 hook 记录 | 直接 | 判据段 11 registry 轮事件含 `hook/invoked` / `hook/result` |
| DEV-04 | Phase 1 稳定后插件装到主 profile | 直接 | `web` / `headless` 均装 `1.20.1-1.dsh022`（D-10-3） |
| SKIL-05 | runtime_note 约定模型可执行 | 间接 | 每个 skill 都按 GSDROOT 展开读到（本次会话即是），无专门判据 |
| HOOK-04 | guard 行为与上游一致（basename 规则） | 间接 | `01-UAT.md` 3/3 + 文档；无 ID 级判据 |
| DEV-02 | 刷新协议文档化（`--force` + 重启） | 间接 | `BUILD.md` 有该段；无 ID 级判据 |
| DEV-01 | 3091 驱动、主实例不推进 phase | 事实可核 | 全部 5 个 phase 都在 3091/gsdtest 上跑完 |

### Open items carried forward

**Phase 02 的 code review 至今仍有 3 条 finding 是 `open`**（`02-REVIEW-DISPOSITION.md` 记 `open: 3 / total: 10`；其余四个 phase 均为 `open: 0`）。它们没有被后续 phase 处理，也都与「假绿」有关：

| ID | 内容 |
|---|---|
| WR-05 | `workflow_dispatch` 的输入零匹配时 4 格 × 6 步全 skip，run 不红 —— WR-03 的误导换了形态 |
| WR-06 | `pins.matrix.dsh` 的轴值未要求回溯 `pins.lines` ⇒ 幽灵轴可静默通过 |
| IN-04 | 矩阵门哨兵 ⑦ 只断 token 存在、不断布尔语义，且未覆盖 `uses` 步 |

其余开放项：

- **`dsh-gsd@0.0.0-stage`**：npm staged-publishing 的占位版本（2 files / 329 B）仍在 `versions` 列表里，**未 deprecate** —— registry 对该版本的 `PUT` 返回 `E404`（客户端选择成功、服务端拒绝）。`dist-tags.latest` 不受影响，只有显式 `@0.0.0-stage` 才会装到它。
- **UAT-06 的技能 watch 半段 = `not measured`**：结构性不可测（一次性会话每次都是新进程，watcher 只在长驻 `web` 进程里可观察，数 fsevents 需 root）。按 T-5-15 预登记退路判为满足 —— **不代表 watch 被观测过**。
- **OPEN-3（registry 通道的升级/回滚语义）与 OPEN-4（codegraph 同层合成）**：按决定推迟，理由在 `05-UAT.md` §(d)。
- **CI 从不设 `DSH_UAT_LIVE`**：①② 两个 live 用例在 CI 里恒 skip（T-5-12 的 opt-in 策略）；要覆盖需在 `compat-matrix.yml:56` 加 `env: DSH_UAT_LIVE: '1'`。
- **`05-VALIDATION.md` 保持 `nyquist_compliant: false`**：auditor 拒绝自证。
- **README 状态句已过时**（DOC-01：「首发…随后落地」），**`05-UAT.md` 与 `verify-work.md:368` 的产物文件名撞车**（PLAN-01：`{phase_num}-UAT.md` 同名）。

---
