#!/usr/bin/env bash
# tests/run-gates.sh — 产物树 gate 独立脚本（build.mjs / prepack / CI 三方共享契约）。
#
# 口径继承 01-01-SUMMARY（1.20.1 执行现实，非 01-02-PLAN 旧文）：
#   env 契约: GSD_VERSION 与 GSD_STAGING_ROOT 必填（build.mjs 在 staging 清理前
#     显式传入）；任一缺失 → exit 1，fail-closed，无静默跳过。
#   gate A 双锚（1.20.1 staged 树无 gsd-core/package.json）:
#     a) gsd-core/VERSION 内容 === GSD_VERSION；
#     b) node gsd-core/bin/gsd-tools.cjs runtime-identity --raw 自报
#        packageName/version 精确相等。任一不等 → exit 2。
#   gate B 三段式（upstream 叙述例径不误杀，Pitfall 5 精神）:
#     B1 staging 根前缀残留（4 树全扫，-F 固定串）;
#     B2 本机 homedir 前缀残留（4 树全扫；HOME=/root 时天然覆盖 root 形态）;
#     B3 字面 /Users|home/<name>/ 正则仅扫 skills/ 树（SKIL-04 字面范围）。
#     $HOME/`~` 形态不在拒绝集（回退改写目标）。
#   gate C: skills/gsd-*/SKILL.md 各恰 1 个 "gsd:dsh-adapter begin"，且总计 72。
#
# 退出码: 0 全过 / 1 env 缺失或扫描工具失败 / 2 gate 失败（阻断 prepack）。
# 运行 cwd 必须是产物树所在根（repo 根，或 fixture 根做负向验证）。
#
# 本脚本刻意不用 set -e（每个 gate 显式 if+echo+exit）；grep -c 计数点均针对
# 注入标记行（gsd:dsh-adapter begin），不涉及文件头注释命题。

if [ -z "${GSD_VERSION:-}" ] || [ -z "${GSD_STAGING_ROOT:-}" ]; then
  echo "gates: GSD_VERSION and GSD_STAGING_ROOT required (invoke via build.mjs)" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# gate A: 版本交叉校验 — 双锚（VERSION 文件 + 引擎 runtime-identity 自报）
# ---------------------------------------------------------------------------
VER_CONTENT="$(cat gsd-core/VERSION 2>/dev/null || true)"
if [ "$VER_CONTENT" != "$GSD_VERSION" ]; then
  echo "gate A failed: version mismatch (gsd-core/VERSION '${VER_CONTENT:-<missing>}' != GSD_VERSION '$GSD_VERSION')" >&2
  exit 2
fi
if ! node -e 'const {execSync}=require("node:child_process");let j;try{j=JSON.parse(execSync("node gsd-core/bin/gsd-tools.cjs runtime-identity --raw",{encoding:"utf8"}).trim())}catch(e){process.exit(2)}if(j.packageName!=="@opengsd/gsd-core"||j.version!==process.env.GSD_VERSION)process.exit(2)' 2>/dev/null; then
  echo "gate A failed: version mismatch (runtime-identity != @opengsd/gsd-core@'$GSD_VERSION')" >&2
  exit 2
fi

# ---------------------------------------------------------------------------
# gate B: 机器耦合扫描 — 三段式，grep 显式探测（0=命中=gate 失败 / 1=干净 / 2=扫描错误）
# ---------------------------------------------------------------------------
TREES="skills gsd-core hooks scripts"
HM="${HOME:-$(printf '%s' ~)}"

grep -RInF "$GSD_STAGING_ROOT" skills gsd-core hooks scripts >/dev/null 2>&1
STATUS=$?
if [ "$STATUS" -eq 0 ]; then
  echo "gate B failed: staging-root residue (${GSD_STAGING_ROOT} in product trees)" >&2
  exit 2
elif [ "$STATUS" -ne 1 ]; then
  echo "gate B scan failed (staging-root probe, grep exit $STATUS)" >&2
  exit 1
fi

if [ -n "$HM" ]; then
  grep -RInF "$HM" skills gsd-core hooks scripts >/dev/null 2>&1
  STATUS=$?
  if [ "$STATUS" -eq 0 ]; then
    echo "gate B failed: machine-specific absolute path ($HM in product trees)" >&2
    exit 2
  elif [ "$STATUS" -ne 1 ]; then
    echo "gate B scan failed (homedir probe, grep exit $STATUS)" >&2
    exit 1
  fi
fi

grep -RInE "/(Users|home)/[A-Za-z0-9_.-]+/" skills >/dev/null 2>&1
STATUS=$?
if [ "$STATUS" -eq 0 ]; then
  echo "gate B failed: machine-specific absolute path (skills/ literal syntax)" >&2
  exit 2
elif [ "$STATUS" -ne 1 ]; then
  echo "gate B scan failed (skills literal probe, grep exit $STATUS)" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# gate C: 72 个 SKILL.md，每个恰好 1 个 adapter 注入标记
# ---------------------------------------------------------------------------
for f in skills/gsd-*/SKILL.md; do
  if [ ! -f "$f" ]; then
    echo "gate C failed: no SKILL.md under skills/gsd-*/" >&2
    exit 2
  fi
  COUNT=$(grep -c "gsd:dsh-adapter begin" "$f" | tr -d ' ')
  if [ "$COUNT" != "1" ]; then
    echo "gate C failed: adapter count $COUNT in $f" >&2
    exit 2
  fi
done
TOTAL=$(ls skills/gsd-*/SKILL.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOTAL" != "72" ]; then
  echo "gate C failed: expected 72 skills, found $TOTAL" >&2
  exit 2
fi

echo "gates: all passed (A/B/C)"
exit 0
