---
phase: "1"
slug: "build-mjs"
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-10"
---

# Phase 1 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> 本文件由 /gsd-secure-phase(verify:post security hook)于 State B(无既有 SECURITY.md,自三个 PLAN 的 `<threat_model>` 工件 + 代码实证)产出。

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry(canonical / 本机配置镜像)→ build.mjs | 不可信网络取件入口;tarball 内容未经本地审查即进入构建 | 包字节流(完整性敏感) |
| unpacked tarball → 官方 install.js 执行 | build 期执行上游安装器代码(信任模型 = 上游官方包) | 构建期代码执行 |
| staging 产物 → 产物树 | 唯一拷贝通道 = 4 树白名单直拷 + staging 根改写 + gate 扫描 | 待发布资产内容 |
| 产物树 → gate 扫描 | 最后一道可机器验证的完整性/可移植性边界 | 版本标识、路径引用 |
| 产物包 → gsdtest 实例安装面 | file: add 打包冻结快照化;重装后须重启才加载新内容(spoof/stale 面) | 引擎身份、hooks 桥接 |
| 上游 registry → THIRD-PARTY-NOTICES 记录 | 文档化 canonical 值与实际取源值之间的核对边界(防镜像漂移) | SBOM 元数据 |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-1-01 | Tampering | tarball 获取(npm pack / 离线 .tgz) | high | mitigate | 在线依赖 npm registry integrity;离线 ① 档 SHA-512(对照 NOTICES dist.integrity)+ SHA-1(对照 dist.shasum)双重校验,mismatch → exit 2 fail-closed。代码:build.mjs:162-182 `checkTarballIntegrity`;canonical 行:THIRD-PARTY-NOTICES.md;篡改负向:01-01-SUMMARY D3(exit 2 + checksum mismatch) | closed |
| T-1-02 | Spoofing | 包名解析(@opengsd/gsd-core) | high | mitigate | 包名为 build.mjs 内常量、不可被环境参数化(build.mjs:215 `npm pack @opengsd/gsd-core@${GSD_VERSION}`;GSD_VERSION 仅参数化版本且格式强校验 build.mjs:236-238);legitimacy seam 判 SUS(too-new,01-RESEARCH §Package Legitimacy Audit)→ 01-01 Task 1 blocking-human checkpoint 人类决策取 1.20.1(canonical↔npmmirror dist.integrity 逐字节一致,01-01-PLAN/SMMARY 留档) | closed |
| T-1-03 | Tampering | 版本标识(package.json / VERSION / GSD_VERSION) | medium | mitigate | gate A 双锚(1.20.1 staged 树无 gsd-core/package.json 的既成口径):gsd-core/VERSION === GSD_VERSION 且 `runtime-identity --raw` 自报 packageName/version 精确相等,任一不等 exit 2。代码:tests/run-gates.sh:32-40;build.mjs:324-333(staging 清理前强制消费、exit code 原样传播);fixture 负向:01-02-SUMMARY D2 | closed |
| T-1-04 | Elevation of Privilege | 官方 install.js build 期执行 | high | mitigate | 版本 pin + 完整性(在线 npm / 离线 shasum)+ CLAUDE_CONFIG_DIR=mktemp staging + HOME=.gsd-build-tmp/fakehome 隔离(build.mjs:260-271,官方契约绝不手写 staging)+ 4 树白名单捕获(settings.json / agents / .gsd-* 概不拷贝,build.mjs:276-294)+ 产物 gate 扫描 | closed |
| T-1-05 | DoS | 断网降级路径绕过 | medium | mitigate | 离线链固定顺序 ① GSD_TARBALL(shasum-gated)→ ② .build-cache → ③ GSD_PACKAGE_DIR(须含 bin/install.js 与 package.json)→ ④ npm pack;全空失败 exit 1 + stderr 列明 ①-④ 档位名 + BUILD.md 指引(build.mjs:184-228);npm cache --offline/--prefer-offline 全文零出现(grep 实证) | closed |
| T-1-SC | Tampering | npm 包安装 + hooks 桥接(本 phase 唯一引入包) | high | mitigate | package-legitimacy gate 已跑(SUS/too-new)+ 01-01 Task 1 blocking-human checkpoint 任何模式不自动通过;**执行期发现**:hooks 桥接适配器 hooks/dsh-gsd-suite/run.cjs 为 install-gsd-dsh.sh 部署产物、不在 npm tarball 树内 → 首轮快照守卫全链 fail-open → 修复(commit 2d45fac):canonical 入库 build/assets/dsh-gsd-suite-run.cjs + build.mjs:295-302 捕获拷贝;回归防线:build-smoke ⑥⑦⑧(e039939,本次 npm test 7/7 绿);live 证据:verify-evidence.md + 本审计现场复证(已装 wrapper 与 canonical 逐字节一致) | closed |
| T-1-06 | Tampering | 产物树内容(改写后) | high | mitigate | gate B 三段式作为内容完整性第二道防线:tests/run-gates.sh:45-78 — B1 staging 根前缀残留(4 树 -F 固定串)/ B2 本机 homedir 前缀残留(4 树)/ B3 字面 /Users\|home/ 正则(仅 skills 树,SKIL-04 字面范围);任一命中 exit 2、阻断 prepack;upstream 叙述例径不误杀(01-01-SUMMARY 偏差 2 逐行审计) | closed |
| T-1-07 | Spoofing | 实例安装的引擎身份(runtime identity) | high | mitigate | 重装后包内 CLI identity JSON 断言(须为 @opengsd/gsd-core / 1.20.1):verify-evidence.md Task 1 自动化段与 Task 2 交互段留证;**本审计现场独立复证(2026-11-10T14:32Z)**:`node $DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/bin/gsd-tools.cjs runtime-identity --raw` → `{"packageName":"@opengsd/gsd-core","version":"1.20.1"}`(exit 0),gsd-core/VERSION = 1.20.1 | closed |
| T-1-08 | DoS | 断网降级/失败模式理解路径 | medium | mitigate | BUILD.md 固化四档离线链、每档失败文案与 exit code 0/1/2 契约、gates 契约、canonical↔mirror 交叉核对命令、验证实例复验序(161 行,11 关键词断言全过);verify-evidence 新快照声明防 stale 假绿(本审计已复核证据链,见下) | closed |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

**残余风险注记(ASVS L1 grep 深度,均不构成 open 威胁):**
- gate A 第二锚为引擎 runtime-identity 自报,可信链锚定于取件期完整性 pinning(npm integrity / ① 档双哈希)。自报仅与已 pin 的 tarball 同可信度——供应链层已由 T-1-01/T-1-SC 覆盖,属分层防御已知边界。
- gate B3 字面 /Users|home/ 正则仅扫 skills/ 树(SKIL-04 字面口径);gsd-core/hooks/scripts 由 B1(精确 staging 根)+ B2(本机 homedir 前缀)覆盖;config/ 树不经 gate B,但其内容全部源自仓库 canonical 两文件(build/assets/gsd-hooks.json、build/assets/dsh-gsd-suite-run.cjs),非 staging 派生——设计使然,已记录。
- hooks 桥接守卫本体(gsd-secret-read-guard.js)来自 npm tarball hooks 树(上游内容),其行为由 build-smoke ⑧ 组件级契约(nod:block/secret-read exit 2 + 良性 exit 0)与 verify-evidence live 四路证据机器化锁定。

**执行期威胁旗标(SUMMARY 记录的 01-03 偏差 #1)**:hooks 桥接适配器丢失 → 全部守卫 fail-open —— 映射至 T-1-SC,经 2d45fac 修复 + e039939 回归测试 + live 复验(第二轮新快照)闭环,无未映射新攻击面(unregistered_flags: 0)。

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks — all register threats carry implemented mitigations verified at ASVS L1 depth.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-10 | 9 | 9 | 0 | gsd-secure-phase(verify:post security hook;register authored at plan time,ASVS L1,block_on: high) |

**本审计的独立实证(2026-11-10T14:32Z,非仅计划文本):**
1. `npm test` 全量重跑 exit 0、7/7 绿 —— 其中 build-smoke 真实构建循环(预热 .build-cache 档→pack 预 gate→staging→捕获→改写→注入→gates)含 ⑥ wrapper 删除后重放+逐字节一致、⑦ registry 经 wrapper 调度、⑧ 组件级 .env 拦截 exit 2/良性放行 exit 0。
2. verify-evidence.md 新快照证据链复核(对应 01-03 DEV-03 两条 prohibitions 的 human_judgment 项):3091 监听进程 pid 90223 存活,`ps -o lstart=` = Tue Nov 10 21:58:39 2026(+08:00)= 13:58:39Z,晚于终轮 `--force add` ≈13:57:48Z;已装 `$DSH_PROFILE_DIR/node_modules/dsh-gsd/hooks/dsh-gsd-suite/run.cjs` 与仓库 canonical `build/assets/dsh-gsd-suite-run.cjs` `cmp` 逐字节一致(mtime 21:45 = 修复重建产物时间,file: 冻结保留);已装 identity 现场输出 1.20.1 —— 证据来自重装后新快照,无旧 file: 快照假绿。
3. THIRD-PARTY-NOTICES.md canonical 行与 01-01-PLAN Task 1 记录逐字一致(shasum `d632001e2541e6cccfb740bcad5b2f5c334efabd` / integrity `sha512-vG3iTEmeImmFFS8CjX69n7F2bxQ3QdssO++DxhaVDa/S2k098DFoGWXkjHbCCOyfQkIIkFt7kDginryDnoPcZQ==`);build.mjs 全文无 `--offline`/`--prefer-offline`。
4. git 链确认修复与回归测试在库:2d45fac(fix,wrapper 入库+捕获段)、bca4875(live 补记)、e039939/21a38e6(回归断言与 Nyquist 收口)。

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer) — 9/9 mitigate
- [x] Accepted risks documented in Accepted Risks Log(为空:无接受风险)
- [x] `threats_open: 0` confirmed(9 closed / 0 open;high 级威胁全数有实现级缓解)
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-10
