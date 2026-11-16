# 05-UAT.md — Phase 05 端到端 UAT：判据 ↔ 证据 ↔ 结论

> **判据对象**：`tests/uat-harness.test.mjs` 的 7 个用例（① ② ③ ④ ⑤ ⑥ ⑦）。
> **证据册**：`05-UAT-EVIDENCE.md` 的判据段 1–7；本表每一行都能在证据册里对着逐字输出复核。
> **判据环境**：一次性 `DSH_HOME`（`mkdtemp('/tmp/dsh-uat-')`），**不是**本机 `~/.dsh`（D-01：真实 home 有 72 个旧 `gsd-*` 技能、`web`/`headless` 的 patch 里各有 2 行 `GSD-DSH-bridge`，在它上面任何「技能可见 / hook 生效」都会由旧源满足而静默失效）。
> **结论列**：只取 `passed` / `failed` / `⚠ 未执行` / `open item` 四种值；唯一例外是 UAT-06 的 `技能 watch` 行，按 T-5-15 取 `not measured`（结构性不可测，理由写在该行备注里——编一个数字比不写更糟）。
> **时间**：一律 UTC。

| 需求 | 判据 | 证据（判据段 + 行） | 结论 | 备注 |
|---|---|---|---|---|
| UAT-04 | 两个 hooks 在真实分发路径上各按设计行事：commit 校验**三段对照**（opt-in 拦 / opt-in 放 / 未 opt-in 放）+ injection 扫描**只落日志** | 判据段 4：(a)(b)(c) 三行 + ② findings 行 + 第四条事实行；用例 ①② | passed | 本仓未 opt-in，属上游设计默认；**不改本仓配置**（「commit 校验在本仓默认不生效」是一条被断言的开放项，不是一句散文） |
| UAT-05 | 同一条 `dsh plugin --profile <p> add <绝对路径 tgz>` 换版本号，profile 内 `node_modules/dsh-gsd/package.json` 的 `version` 随之变化（`.dsh022 → .dsh021 → .dsh022`），每次之后 `--dump-config` 的 `gsd` / `gsd-hooks-bridge` 两 row 仍各恰 1 行且会话谓词仍成立 | 判据段 5：复刻行 + 三段 swap 行 + 会话谓词行；用例 ⑥ | passed | **两个 tarball 只有版本串不同**（`.dsh021` 由已打好的 tarball 解包后改 `version` 再 `npm pack --ignore-scripts` 复刻，**从未也永不发布**）⇒ 本判据证的是「换版本号这条命令的机制」，**不是** registry 上的升级历史。⚠ 那个成员的比对是 **JSON 语义等值**，不是字节等值（npm 在 `pack` 时会重排 `package.json` 的缩进） |

> 本表在 05-02 的 **Task 1** 落 UAT-04 行、**Task 2** 追加 UAT-05 行；UAT-01..03 / UAT-06 / INST-01..06 的行由同一计划的 **Task 3** 补齐（本文件在计划内被两次提交，每次只含已经拿到证据的那几行）。