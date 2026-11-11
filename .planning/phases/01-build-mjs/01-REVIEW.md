---
phase: 01-build-mjs
reviewed: 2026-11-11T09:42:57Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - build.mjs
  - build/lib/rewrite-map.cjs
  - build/assets/gsd-hooks.json
  - build/assets/dsh-gsd-suite-run.cjs
  - tests/run-gates.sh
  - tests/rewrite-map.test.mjs
  - tests/build-smoke.test.mjs
  - package.json
  - .gitignore
  - THIRD-PARTY-NOTICES.md
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-11-11T09:42:57Z
**Depth:** standard（对 bench 内相互依赖的 build.mjs / rewrite-map.cjs / run-gates.sh / smoke 测试做了跨文件调用链核验）
**Files Reviewed:** 10
**Status:** issues_found

## Summary

对 phase 01（build-mjs）十个核心变更文件做了对抗式审查:build.mjs 主链与离线四档、rewrite-map 纯模块、canonical hooks registry 与 hooks-bridge stdio 适配器、gate 脚本、两组测试、package.json 收口、.gitignore 与 SBOM notices。另抽查了 BUILD.md / README 的契约口径。

**客观核验通过项**(不复报,记录为审查依据):
- THIRD-PARTY-NOTICES.md 的 canonical 值与实测 `.build-cache/opengsd-gsd-core-1.20.1.tgz` 逐字节一致(sha512 hex = integrity base64 解码值;sha1 = dist.shasum)——NOTICES 数据可信。
- 产物树:零 `~/.dsh` 字面量残留、无 `$DSH_HOME-*` 改写歧义污染;`hooks/dsh-gsd-suite/run.cjs` 与 canonical 模板逐字节一致;`config/gsd-hooks.json` 与 canonical 一致。
- `injectNote` 的第二个 `---` 定位:抽查 gsd-surface 等含 4+ 个 `---` 行的 SKILL.md,前两个确为 frontmatter 边界,注入位置正确(body 内的 `---` 位于其后,不受影响)。
- 无硬编码密钥/`eval`/shell 插值注入面(spawnSync 全程无 `shell:true`);GSD_VERSION 正则强校验 + argv 数组传参。
- 复核(已知口径,未作新 findings):gate A 双锚、gate B 三段式、`node --test` glob 形态、hooks 桥接 fail-open 修复链(2d45fac+e039939)、目标版本 1.20.1 决策、legacy 分支 exit 0 语义。

**结论**:主链、改写、门禁与测试的工程质量整体良好,无 Critical。两个 Warning 集中在"②档缓存无完整性校验"与"smoke 测试对暖缓存/网络的隐性前置依赖";四个 Info 为文档失实、常量重复、legacy 旁路与失败留痕累积,均为低成本可修项。

---

## Warnings

### WR-01: .build-cache(②档)不经完整性校验直接解包并执行

**File:** `build.mjs:201-203`(校验函数 `build.mjs:162-182`)
**Issue:** `checkTarballIntegrity` 只为 ①档 `GSD_TARBALL` 接线。②档 `.build-cache/*.tgz` 命中即 `tgzPath = cacheTgz`,随后 `tar xzf` 解包并用 `node bin/install.js` 执行其中代码——唯一防线是解包后的 pre-gate(`package.json`.version === GSD_VERSION),而该字段对篡改者而言可随包覆写,不构成完整性证明。NOTICES 已备好该版本 canonical 哈希,却在该档位上未使用。BUILD.md:63 对该档的保护描述仅"版本不符由 pre-gate 拦截",与"构建期取源 SBOM 完整性对照"的整体口径存在落差。威胁模型:`.build-cache/` 为 gitignored 持久本地状态(且无任何代码写入它,见 IN-01),被污染后构建链静默放行并在构建机执行任意代码。
**Fix:** 与 ①档共用同一校验入口,一行接线即可:
```js
} else if (existsSync(cacheTgz)) {
  tgzPath = cacheTgz
  tier = '.build-cache'
  await checkTarballIntegrity(tgzPath, GSD_VERSION) // 复用 NOTICES canonical 双重哈希
}
```
(③档目录按预 gate + 本机信任模型处理、④档由 npm 侧 integrity 元数据兜底,可维持现状;至少应同步修正 BUILD.md ②档行的 Failure 列口径。)

### WR-02: npm test / prepack 依赖不可见的前置条件(暖缓存或网络),缺失时以不透明的 exit 1 失败而非跳过

**File:** `tests/build-smoke.test.mjs:29-37`(环境构造 `tests/build-smoke.test.mjs:22-27`)
**Issue:** smoke 测试 ①通过 `execFileSync('node', ['build.mjs'])` 真实构建,取源走 `.build-cache` → `npm pack` 在线档。`.build-cache/` 被 gitignored,新克隆离线/无缓存环境下 `npm pack` exit 1 → `execFileSync` 抛错,整组只有一个大 test(),失败信息仅是包裹后的子进程错误,不指明前置条件。这使 `npm test`(以及 `prepack`)在干净 CI 或离线机器上必然失败且难以诊断;测试可靠性问题按例入告警。
**Fix:** 构建前探测前置条件,缺失时分流:
```js
const cacheTgz = join(ROOT, '.build-cache', `opengsd-gsd-core-${GSD_VERSION}.tgz`)
const canBuild = existsSync(cacheTgz) || (() => {
  try { execFileSync('npm', ['view', `@opengsd/gsd-core@${GSD_VERSION}`, 'version'], { stdio: 'pipe', timeout: 15000 }); return true } catch { return false }
})()
```
不满足时 `t.skip('full-build smoke requires warm .build-cache or registry access')`(其余纯静态断言可拆成独立 test 继续跑);或在文档/注释中显式声明该前置,并在 buildEnv 中允许注入 `GSD_TARBALL` 作离线基座。

---

## Info

### IN-01: BUILD.md 声称 .build-cache"由过往成功构建留存",但没有任何代码路径写入该文件

**File:** `BUILD.md:63`
**Issue:** 全仓 grep 证实 build.mjs 只读 `.build-cache`,从未写入(在线 ④档成功只落盘到 `.gsd-build-tmp/`);D-3 证据里的缓存是手工置入的。文档描述与实际行为不符,会误导后续维护者以为缓存会自愈/自更新。
**Fix:** 二选一:在线档打包成功后(经 npm integrity 校验)回填 `cp` 至 `.build-cache` 并同步过 NOTICES 校验;或将该行措辞改为"由维护者手工预置(见 §⑦ 交叉核对)的缓存"。

### IN-02: PLUGIN_ROOT_REF 常量双写(build.mjs 与 rewrite-map.cjs 各一份)

**File:** `build.mjs:29` 与 `build/lib/rewrite-map.cjs:23`
**Issue:** `$DSH_PROFILE_DIR/node_modules/dsh-gsd` 字面量在两处独立维护,漂移后改写目标与 legacy 分支/文档口径不一致,且无测试能查出这种漂移(两处测试各自独立断言)。
**Fix:** 由 rewrite-map.cjs 一并导出 `PLUGIN_ROOT_REF`(`module.exports = { makeRewrites, PLUGIN_ROOT_REF }`),build.mjs 改为导入消费。

### IN-03: legacy GSD_BUILD_SOURCE 分支复制了一套改写表(7 对),且静默绕过全部完整性校验与 gate A/B/C

**File:** `build.mjs:115-154`(`legacyBuild`;入口 `build.mjs:341-347`)
**Issue:** 该兼容分支维护着与 `makeRewrites` 不同步的第二份映射,且不跑任何门禁。作为 spike 兼容入口问题不大,但目前仅打一条 `console.log('legacy ... compat only')`,`GSD_BUILD_SOURCE` 一旦被环境意外残留,构建会静默降级为无门禁路径(与 buildEnv 测试特意 delete 该变量的防御意图呼应——测试防了,生产入口没防)。
**Fix:** 保留兼容但显式告警:`console.warn('build: legacy path skips integrity checks and gates A/B/C')`;或将 7 对映射也收敛到 rewrite-map 模块的参数化形态,并考虑在 ROADMAP 中排期移除该分支。

### IN-04: 失败路径的 staging/fakehome 留痕只增不清

**File:** `build.mjs:240-241, 336-337`
**Issue:** WORK(`.gsd-build-tmp`)只在成功收尾时清理本轮 staging(约数 MB 级);exit 1/exit 2 留痕是刻意的取证语义,但多次失败会持续累积,且没有轮替/上限提示。
**Fix:** 维持留痕语义,但在 `mkdir(WORK)` 时提示存量目录数/大小(`readdir(WORK)` 统计 `staging.*`),或提供显式的 `build.mjs --cleanup-staging` 副命令(超阈值的清理动作仍保留最近 N 个)。

---

_Reviewed: 2026-11-11T09:42:57Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
