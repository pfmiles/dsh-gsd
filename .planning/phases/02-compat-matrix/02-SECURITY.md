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
| T-2-03 | Spoofing | 探针解析到错版宿主模块 | medium | mitigate | compat-probe 候选路径有序 + hostVersion===--dsh guard（不等 exit 1，L76 实测在码）；CI 每格精确安装 @deepseek-ai/dsh@<line> | closed |
| T-2-04 | Denial of Service | 矩阵格假绿（离线/超时/替身） | medium | mitigate | workflow timeout-minutes 30 + fail-fast: false（yml L15 实测在码）；每格 expect 断言必跑宿主函数；静态测试无网络依赖 | closed |
| T-2-05 | Tampering | NOTICES 1.19.0 canonical 行漂移 | medium | mitigate | 值经 npm view 双镜像逐字节一致后写入；verify ④ registry 对照；verify ⑤ ①档离线构建 checkTarballIntegrity 真实消费（`integrity verified against THIRD-PARTY-NOTICES.md` 实测输出） | closed |
| T-2-06 | Spoofing | 文档 range/tag 规格诱导装错版本 | high | mitigate | docs-consistency ③④⑤ 哨兵全绿；README 全部 exact 示例；版本映射表 dsh022/dsh021 | closed |
| T-2-07 | Spoofing | stale file: 快照假绿（旧产物充当新证据） | high | mitigate | --force 重装 + 实例重启 + 新 token；新快照声明落地（pid 95618 lstart 17:38:26Z > 复原重装 16:46:14Z）；身份断言逐次复核 | closed |
| T-2-08 | Tampering | doctored 负向 fixture 污染 profile | medium | mitigate | fixture 仅用 /tmp/gsd-compat-fixture 临时目录、用后即弃；探针后无条件复原重装 + 身份复检（02-03 实测） | closed |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|-----------|-----------|-------------|------|
| — | — | 无接受类风险：8/8 威胁均走 mitigate 且实施证据已在执行期与 live 验证中闭合 | — | — |

---

## Security Audit

| Date | Threats found | Closed | Open | Verdict |
|------|---------------|--------|------|---------|
| 2026-11-12 | 8 | 8 | 0 | L1 verified — short-circuit (threats_open 0, plan-authored register, ASVS L1) |

**Audit note:** T-2-01..T-2-08 由规划期 `<threat_model>` 注册（#4683 跨计划唯一编号，无 T-2-SC 行）。L1 复核 = 缓解措施在实现/证据中都有落点（spot-grep + 执行期实测 + verify-evidence.md live 证据）。block_on=high 的四条 high（T-2-01/02/06/07）全部有 enforceable 机制且已实证。

## Security Audit 2026-11-11

| Metric | Count |
|---|---|
| Threats found | 8 |
| Closed | 8 |
| Open | 0 |
