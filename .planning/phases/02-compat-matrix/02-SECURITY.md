---
phase: "2"
slug: "compat-matrix"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-12"
---

# Phase 2 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| 兼容判定边界 | 兼容性真值唯一来源 = 宿主自身求值函数 `evaluatePluginCompatibility`（dsh runtime 0.2.2-rc.1）；仓库侧 `build/lib/compat-probe.mjs` 只是转发器（禁本地 semver 判定） | 无敏感数据；传递 manifest（package.json engines/version） |
| pin 真源边界 | `build/assets/pins.json` 是「DSH 行 ↔ 桥接包 pin ↔ 版本编码」单一真源；check-pins 逐项严格等值对照 | 版本元数据（公开） |
| 文档/用户面边界 | README/BUILD.md/NOTICES 的版本示例与 sentinel 被 docs-consistency 测试锁定；只呈现 exact spec | 版本串（公开） |
| 验证实例边界 | gsdtest profile（3091）为 live 验证目标；负向 fixture 只进 /tmp 临时目录、用后即弃 | 无敏感数据；doctored manifest（测试用） |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-2-01 | Tampering | pins.json / package.json | high | mitigate | check-pins.mjs 逐项严格等值对照 fail-closed exit 2 + compat-matrix.test ⑥消费 + pins.json 单文件真源 | closed |
| T-2-02 | Elevation of Privilege | allow-version 豁免绕过兼容门 | high | mitigate | 未新增任何自动触发/绕行豁免路径；宿主 acceptRisk + 精确 name@version×runtime pair 强制；README 风险声明已落（grep 2 处） | closed |
| T-2-03 | Spoofing | 探针解析到错版宿主模块 | medium | mitigate | compat-probe 候选路径有序（L47–62）+ `hostVersion !== --dsh` guard exit 1（L75–76 实测在码）；CI 每格精确安装 `@deepseek-ai/dsh@<line>`（yml L37） | closed |
| T-2-04 | Denial of Service | 矩阵格假绿（离线/超时/替身） | medium | mitigate | workflow `timeout-minutes: 30`（yml L13）+ `fail-fast: false`（yml L15）；格内 probe 步必跑宿主 `evaluatePluginCompatibility`（格内无再分叉）；静态测试无网络依赖（compat-matrix ⑥ 以 `--offline` spawn check-pins） | closed |
| T-2-05 | Tampering | NOTICES 1.19.0 canonical 行漂移 | medium | mitigate | 值经 npm view 双镜像逐字节一致后写入；verify ④ registry 对照；verify ⑤ ①档离线构建 checkTarballIntegrity 真实消费（`integrity verified against THIRD-PARTY-NOTICES.md` 实测输出） | closed |
| T-2-06 | Spoofing | 文档 range/tag 规格诱导装错版本 | high | mitigate | docs-consistency ③④⑤ 哨兵全绿；README 全部 exact 示例；版本映射表 dsh022/dsh021 | closed |
| T-2-07 | Spoofing | stale file: 快照假绿（旧产物充当新证据） | high | mitigate | --force 重装 + 实例重启 + 新 token；新快照声明落地（pid 95618 lstart 17:38:26Z > 复原重装 16:46:14Z）；身份断言逐次复核 | closed |
| T-2-08 | Tampering | doctored 负向 fixture 污染 profile | medium | mitigate | fixture 仅用 /tmp/gsd-compat-fixture 临时目录、用后即弃；探针后无条件复原重装 + 身份复检（02-03 实测） | closed |
| T-2-09 | Denial of Service | `workflow_dispatch` 输入与矩阵轴零匹配 → 零格执行仍收绿 | medium | mitigate | **未实现**（88d213d 引入面）：yml L25/27/32/35/40/43 五步共用一个 `if:` 门；`inputs.dsh` 或 `inputs.gsd` 为矩阵外值（如 `0.2.3` / `1.21.0`）→ 4 格 × 5 步全 skip → 4 job success、workflow success，零验证出绿。预期缓解 = dispatch 前置 guard job（输入∩matrix 为空即 fail）。现状仅 `compat-matrix.test` ⑦ 断言「run 步被门盖住」，**未**断言「至少一格真实执行」 | open — below high threshold (non-blocking) |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

> **T-2-03 注记（exit 1 非唯一语义）：** `build/lib/compat-probe.mjs` 自 `4fe265a`(IN-02) 起把 CLI 用法错误（缺 `--dsh`、非法 `--expect`）也归为 exit 1（原 exit 2）。故 exit 1 不再是「host 版本不匹配」的唯一信号；T-2-03 的判据是 **guard 在码 + 非零即红**，不依赖调用方对 exit 1 的语义解读。guard 行号（L75–76）与比较语义（`!==`，`hostVersion` 缺失时 `undefined !== values.dsh` 仍成立）本轮独立复核未漂移。
>
> **T-2-09 定级说明：** 88d213d(WR-03) 新增的步级门控把「是否执行某格」交给 `workflow_dispatch` 输入。零匹配时 GitHub 语义为「全部步骤 skipped → job success → workflow success」，属与 T-2-04 同类的假绿危害，故沿用 medium；medium < block_on(high) ⇒ 记 open–non-blocking，不计入 `threats_open`。若该 workflow 后续被设为 required check，本项应重评为 high（假绿 green check 会直接放行）。`inputs.*` 仅出现在 `if:` 表达式，未进入任何 `run:`（`grep '\${{ *inputs\.'` 零命中）⇒ WR-03 未引入 shell 注入面。

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|-----------|-----------|-------------|------|
| — | — | 无接受类风险：9 条注册威胁中 8 条走 mitigate 且实施证据已在执行期与 live 验证中闭合；T-2-09 记 open–non-blocking，**未**转为 accepted risk（仍期望实现 dispatch guard 缓解） | — | — |

---

## Security Audit

| Date | Threats found | Closed | Open | Verdict |
|------|---------------|--------|------|---------|
| 2026-11-12 | 8 | 8 | 0 | L1 verified — short-circuit (threats_open 0, plan-authored register, ASVS L1)〔round 1: register @ `bbaacd6`, before the 7 review-fix commits〕 |

**Audit note:** T-2-01..T-2-08 由规划期 `<threat_model>` 注册（#4683 跨计划唯一编号，无 T-2-SC 行）。L1 复核 = 缓解措施在实现/证据中都有落点（spot-grep + 执行期实测 + verify-evidence.md live 证据）。block_on=high 的四条 high（T-2-01/02/06/07）全部有 enforceable 机制且已实证。T-2-09 非规划期注册，由本轮 HEAD 复审新增，medium < block_on ⇒ 不计入 `threats_open`。

**HEAD 复审（`e81d8e9`，2026-11-12）：** 寄存器最后由 `bbaacd6`(02:25) 写入，其后 7 条 review-fix 提交逐条对照——`55191da`(WR-01) 收窄 `parseVersion` 白名单（三位段禁止前导零、rev≥1：`^(0|[1-9]\d*)\.…-([1-9]\d*)\.dsh(\d{3})$`），`6356ff4`(WR-02) 改为 bridge 双向键集等值 + bridge schema fail-closed（消除「缺 bridge ⇒ 零次迭代通过」的退化路径），两者均**加强** T-2-01 而非削弱（`check-pins.mjs` 现 15 处 `finish(2)` 分支全部在码）；`df81330`(IN-03) 的 120 s 上限把 `npm view` 超时归为 exit 1，仍为**非零**，不吞漂移信号（真漂移仍是 exit 2 `registry drift`）；`4fe265a`(IN-02) 只把用法错误的码值 2→1，不产生任何 exit 0 新路径；`b2e351b`(WR-04) 把矩阵格断言由「轴值子串存在」升级为「格集合 ≡ pins 笛卡尔积」双向精确等值；`e8e9d73`(IN-01) 仅改 BUILD.md 计数。唯一削弱项 = `88d213d`(WR-03) 的步级门控 → 已登记为 T-2-09。**独立实测**：`node build/lib/check-pins.mjs --offline` exit 0 `pins: all consistent (line dsh022)`；`node --test tests/*.test.mjs` **26/26 pass**；`actionlint .github/workflows/compat-matrix.yml` exit 0 无输出。

## Security Audit 2026-11-11

| Metric | Count |
|---|---|
| Threats found | 8 |
| Closed | 8 |
| Open | 0 |

## Security Audit 2026-11-12

| Metric | Count |
|---|---|
| Threats found | 9 |
| Closed | 8 |
| Open | 0 |
| Open (non-blocking) | 1 |
