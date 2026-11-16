---
phase: "5"
slug: "uat-1-0"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-11-16"
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `05-RESEARCH.md` §Q10. Task IDs are bound at `validate-phase`; this draft binds
> **requirements → falsifiable check**, which is the part that must not drift.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in test runner — `node --test` (node `v24.21.0`) |
| **Config file** | none — glob `tests/*.test.mjs`, 6 files / 38 top-level cases |
| **Quick run command** | `node --test --test-concurrency=1 tests/docs-consistency.test.mjs` |
| **Full suite command** | `node --test --test-concurrency=1 tests/*.test.mjs` |
| **Estimated runtime** | ~8 s (measured: 7.7 s for the full 38) |

**Never `npm test`** until D-10-1 lands: `package.json:50` omits `--test-concurrency=1`, and
`tests/build-smoke.test.mjs` rewrites the build tree ⇒ the race is structural, not hypothetical.

---

## Sampling Rate

- **After every task commit:** `node --test --test-concurrency=1 tests/docs-consistency.test.mjs`
- **After every plan wave:** `node --test --test-concurrency=1 tests/*.test.mjs` (full 38)
- **Before `/gsd-verify-work`:** full suite green **and** `npm publish --dry-run` prints the right
  tag + registry (the dry run exercises `prepack`: build + full suite)
- **Max feedback latency:** ~10 s

---

## Per-Task Verification Map

Task IDs bind at `validate-phase`; the falsifiable check is fixed here.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 05-0x | 1 | UAT-01 | T-5-01 | 干净 home 安装后真实会话成功，且判据不是"目录存在" | shell block | `dsh plugin add <tgz>` → one-shot → 会话 `.zstd` 内 **有 `assistant/message` 且无 `turn/end{kind:error}`** | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | UAT-02 | — | `/gsd-health` 成功；`/gsd-new-project --auto` 生成 `.planning/` | shell block | 无 `.planning` 的仓库跑一次 → `test -d .planning` + health 成功行 | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | UAT-03 | T-5-03 | 真实会话 `read .env` 被硬拦（HOOK-02 复验） | shell block | sentinel `.env` + 让会话读它 → 工具调用失败 **且 stderr 指名 guard**（"无输出"不算拦） | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 2 | UAT-04 | T-5-04 | commit 校验两向 + injection 扫描留痕 | shell + NEW | 坏 commit → exit 2 且 stderr 含 `gsd-validate-commit.sh` **且不含 `validator disabled`**；好 commit → exit 0；injection → 有 `INJECTION-PATTERN` 行 | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 2 | UAT-05 | — | 升级/回滚 = 同命令换版本号 | shell block | `add v1 → add v2 → add v1`，每步重跑 UAT-01 判据 + `dump-config` 行集 + 版本串随之变化 | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 2 | UAT-06 | — | 启动开销三点 + watch 行为入 README | shell (+HUMAN) | `turn/start.time − session.createdAt`：基线 **10 ms** / 带插件 **340 ms**（已测）；watch **未测**⇒ README 必须写 "not measured" | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | INST-01 | T-5-01 | 单命令安装、零手工 patch | shell block | 全新 home `plugin add` exit 0 **且 `cordis.patch.yml` 仍为空数组** | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | INST-02 | — | 安装不写 `~/.dsh` 受管文件 | shell block | 安装前后 `DSH_HOME` 树哈希，diff 只允许 `profiles/<p>/` | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | INST-03 | — | 装即注册，无重启前提 | shell block | `add` 后立刻 `dump-config`（不重启）→ `gsd` + `gsd-hooks-bridge` 两行在场（实测 391→403 行） | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | INST-04 | — | 卸载后 skills/hooks/bundle 行全消失 | shell block | `remove` → 回到 391 行、0 个 gsd 行、`node_modules/dsh-gsd` 不在；**同时断言删除前是在场的** | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | INST-05 | — | 两行且 `!!js` 展开为包内绝对路径 | shell block | `grep -A3 'id: gsd-hooks-bridge'` → `configPath` 是含 `node_modules/dsh-gsd` 的**绝对路径**，不是 `!!js` 字面量 | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 3 | INST-06 | — | 元数据合规（回归） | EXIST | `tests/pack-contents.test.mjs` + `docs-consistency` 的 `ALLOWED_TOP_LEVEL` / locale 断言 | ✅ | ⬜ pending |
| TBD | 05-0x | 3 | PUB-01 | T-5-06 | npm 首发（人类执行 OTP）+ registry 复验 | shell + HUMAN | 发布前 `npm publish --dry-run` 打印 `tag latest` + `registry.npmjs.org`；发布后**每条读都钉 `--registry https://registry.npmjs.org/`**（本机默认是只读镜像 `registry.npmmirror.com`，`publishConfig.registry` 只约束**写**）：`npm view dsh-gsd dist-tags.latest --registry …` === `1.20.1-1.dsh022`，registry 通道的安装同样钉 `--registry=`，再重跑 UAT-01 | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 3 | PUB-03 | — | dshmarket PR 本体 | shell + HUMAN | `gh pr create` 只碰 `data/plugins/pfmiles__dsh-gsd.yml`（1 文件 / ≤3 条），随后 4 检通过；合并不等（D-09） | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 1 | D-10-1 | — | `--test-concurrency=1` 三处齐备 | NEW | 断言 `package.json:50`、`package.json:51`、`compat-matrix.yml:56` 三处都带该 flag（**不得**用"套件是绿的"充当断言——那正是竞争本身） | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 4 | D-10-2 | — | G-4 codegraph 并存静态段 | shell block | 四份 `cordis.patch.yml` 的 row-id 集两两不相交，且 **`MISSING:` 必须判红**；codegraph v1.2.2 / row id `dsh-codegraph` 已在场 | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 4 | D-10-3 | T-5-07 | 真实 `~/.dsh` 迁移 | shell block | `--uninstall` → `plugin add`；`web`/`headless` 的 `grep -c GSD-DSH-bridge` = 0 且两行仍在。⚠ 迁移前重数（实测 **2**，CONTEXT 记 1） | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 4 | D-10-4 | T-5-08 | 旧仓互链推送落地 | HUMAN + 远程核 | 权威判据在远端：`gh api repos/pfmiles/install-gsd-dsh/commits/main` sha 前进于 `41fcc7a`，且远端 README 插入段的正文与 **`docs/oldrepo-link/snippet.en.md`** 逐字节一致（**不是** `oldrepo-link/README.md`，那是备料说明）；SSH 不可用，须走 `gh auth git-credential` | ❌ W0 | ⬜ pending |
| TBD | 05-0x | 2 | D-10-5 | — | `SKIP_DIRS` 含 `.gsd-build-tmp` 且**经得住重建** | NEW | 断言**构建后**的 `gsd-core/bin/lib/ui-frontend-evidence.cjs`，再跑 `node build.mjs` 重断言（只断工作树文件=发布时必破） | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/uat-harness.test.mjs`（或 `scripts/uat/` runner）—— **不存在**；UAT 需要可提交的 harness，否则证据是手打的。必须实现 Q1 的会话判据（`assistant/message` 在场 且 无 `turn/end{kind:error}`）。
- [ ] 三处 `--test-concurrency=1` 的断言 + 重建后 `SKIP_DIRS` 断言 —— **不存在**；归入 `docs-consistency` 或新建 `tests/build-config.test.mjs`。
- [ ] UAT-03 的 sentinel `.env` fixture，以及把 `/tmp/uat-inj-fixture.md` 提升进仓（现在只活在 `/tmp`）。
- [ ] **不需要新测试框架** —— Node 自带 runner 覆盖以上全部。

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| npm publish 的 OTP 输入 | PUB-01 | npm 12 要求交互式两步验证；凭据在本机为 `ENEEDAUTH` | 人类执行 `npm publish`，在提示处输入 OTP；回填命令、时间戳与 `npm view` 结果 |
| dshmarket PR 的合并决定 | PUB-03 | 对方仓 maintainer 的时间不可控（D-09 已裁决不阻塞） | 记录 PR 号 + 四检状态；合并状态作为开放项写入 `05-UAT.md` |
| 旧仓推送 | D-10-4 | SSH 通道损坏，HTTPS + credential helper 是对"信任哪条通道"的判断 | 人类执行推送；以 `gh api .../commits/main` 为权威判据 |
| README 双语开销段落可读性 | UAT-06 / SC-3 | "读起来是否正确"只有人能判断 | 分别读中/英两段，确认数字同源、无互相矛盾 |
| 技能 watch 行为 | UAT-06 | 一次性会话在启动时重读，harness 结构上观测不到 watch；无 sudo 无法数 fsevents | 在非 3091 端口的 scratch `web` profile 里改一个 `SKILL.md`，记录「我改了 X，新会话在 T+n 看到它」；不跑则 README 必须写 "not measured" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending