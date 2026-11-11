// build/lib/rewrite-map.cjs — machine-independent path rewrite map (pure module).
//
// Produces the [from, to] pair list the build applies to every staged text
// file. `from` is anchored ONLY on the runtime staging root (a throwaway
// mktemp dir) plus the two portable fallback spellings `~/.dsh` and
// `$HOME/.dsh` locked by 01-CONTEXT — never any machine-specific prefix
// (no `/Users/...` literal dependency, ROADMAP SC2).
//
// Order matters: longest / most-specific from-prefix must come first so the
// sequential split/join applier resolves `${stagingRoot}/gsd-core` before the
// bare `${stagingRoot}` fallback, and `~/.dsh/gsd-core` before `~/.dsh`.
//
// Bare `$HOME` is DELIBERATELY not mapped: `${CLAUDE_CONFIG_DIR:-$HOME/.claude}`
// is a legal portable idiom in upstream content (01-RESEARCH Pitfall 5) and
// must pass through untouched.
//
// package.json has "type": "module", so this .cjs file is CommonJS:
// module.exports only (RESEARCH Pattern 1's `export function` form cannot be
// copied verbatim into .cjs — planner note from the pattern map).
'use strict'

// PLUGIN_ROOT_REF：部署前缀常量单一来源（IN-02）。build.mjs legacy 分支改写
// 与主链 makeRewrites 均由此模块导出消费——此前 build.mjs:29 副本易双写漂移
// 且无测试可查；现漂移面收敛为一个导出（rewrite-map.test.mjs ⑦ 断言其值）。
const PLUGIN_ROOT_REF = '$DSH_PROFILE_DIR/node_modules/dsh-gsd'

function makeRewrites(stagingRoot) {
  const P = PLUGIN_ROOT_REF
  return [
    [`${stagingRoot}/gsd-core`, `${P}/gsd-core`],
    [`${stagingRoot}/skills`, `${P}/skills`],
    [stagingRoot, '$DSH_HOME'], // 兜底：覆盖 staged 内容中其余 staging 引用与 tasks 形态
    ['~/.dsh/gsd-core', `${P}/gsd-core`],
    ['~/.dsh/tasks', '$DSH_HOME/tasks'],
    ['~/.dsh', '$DSH_HOME'],
    ['$HOME/.dsh/gsd-core', `${P}/gsd-core`],
    ['$HOME/.dsh/tasks', '$DSH_HOME/tasks'],
    ['$HOME/.dsh', '$DSH_HOME'], // CONTEXT 锁定的 $HOME 形态回退（六对之外的补全）
  ]
}

module.exports = { makeRewrites, PLUGIN_ROOT_REF }
