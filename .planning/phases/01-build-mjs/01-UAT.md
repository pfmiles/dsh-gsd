---
status: testing
phase: 01-生产化构建（build.mjs 换源 + 引擎独立可用）
source: [01-VERIFICATION.md]
started: "2026-11-11T10:12:00+08:00"
updated: "2026-11-11T10:12:00+08:00"
---

## Current Test

number: 1
name: 改写诚实性（SKIL-04，judgment-tier 禁项复核）
expected: |
  改写目标仅部署态构造（staging 根 → $DSH_HOME 等），无删除/安抚式绕过形态；gate B 三段式对机器路径残留 fail-closed。
awaiting: user response

## Tests

### 1. 01-02 SKIL-04 改写诚实性（无安抚式绕过）
expected: 改写映射与注入只构造部署态路径、不删除内容；gate B 三段式 fail-closed（staging 前缀 / homedir 前缀 / skills 树字面）。LLM-judge 初判 satisfied；独立证据：rewrite-map 6/6 单测 + 全量 build 零残留扫描。
result: [pending]

### 2. 01-03 DEV-03 三项复验证据确来自 gsdtest/3091 验证实例
expected: verify-evidence.md 记载的证据来自真实 gsdtest/3091 实例（--force 重装 → 重启 → 新会话）。LLM-judge 初判 satisfied；独立交叉复核：01-SECURITY.md 审计对 pid 90223 lstart=13:58:39Z > 终轮 add ≈13:57:48Z、wrapper 与 canonical 逐字节一致、live identity=1.20.1 逐项复核通过。
result: [pending]

### 3. 01-03 DEV-03 无旧 file: 快照冒充新证据
expected: 交互段证据来自含修复的新快照，而非重装前的旧 file: 快照。LLM-judge 初判 satisfied；证据：两次 user_setup 循环的完整时间链 + 新快照声明 + 含修复 wrapper 存在性检查。
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
