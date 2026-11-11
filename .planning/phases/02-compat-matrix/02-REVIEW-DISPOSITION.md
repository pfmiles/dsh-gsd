# Phase 02: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | check-pins.mjs:29 parseVersion 放行前导零/rev=0 非法版本（'1.20.1-01.dsh022' validate=true 实测）——格式门 fail-closed 在同源笔误时失效；建议正则 (0|[1-9]\d*) + 测试样本 |
| WR-02 | warning | open | check-pins.mjs:131-137 bridge pin 对照单向——行条目缺 bridge 键时零迭代静默通过（T-2-01 三件等值此路 fail-open）；建议 schema 前置断言 + 双向键集等值 |
| WR-03 | warning | open | compat-matrix.yml:6-9 workflow_dispatch 的 dsh/gsd 手动覆盖输入从未消费（无 inputs.* 引用）；建议删除或接条件门 |
| WR-04 | warning | open | compat-matrix.test.mjs:30-36 轴值断言单向（pins→workflow 子串），幽灵格/冗余格/子串假匹配（1.20.1 vs 1.20.10）漏检；建议整行正则解析格集合与 pins 笛卡尔积精确等值 |
| IN-01 | info | open | BUILD.md TL;DR 测试计数过期（预期 7/7 vs 实际 25/25）——文档计数与 npm test 实际输出不一致（planning INFO-A advisory 同一来源，执行后按实测校准） |
| IN-02 | info | open | compat-probe CLI 误用 exit 2 与头注释 1=IO·parse 契约分歧——exit 表口径核对后二选一统一 |
| IN-03 | info | open | check-pins registry 取样 spawnSync 无 timeout——离线/卡网场景假挂；建议加 timeout + canBuild 式 skip 语义 |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved.
