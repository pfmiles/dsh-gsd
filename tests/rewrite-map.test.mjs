// tests/rewrite-map.test.mjs — rewrite-map 纯模块单测（per-commit 秒级反馈回路）。
//
// 覆盖 plan 01-02 Task 1 的六组断言：特异性顺序、staging 根基准、~/ 与
// $HOME 回退形态、无 staging/机器残留、裸 $HOME 惯用语不清洗（Pitfall 5）。
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { makeRewrites } from '../build/lib/rewrite-map.cjs'

const STAGING = '/tmp/staging.A8f2Xq'
const pairs = makeRewrites(STAGING)

// 与 build.mjs rewrite() 同语义的顺序 split/join 应用器（模块自身只产映射，
// 应用逻辑属于消费方——这里复刻其行为做端到端断言）。
const apply = (text) =>
  pairs.reduce((t, [from, to]) => (t.includes(from) ? t.split(from).join(to) : t), text)

test('① 返回 9 对映射且最长/最具体 from 在前（特异性优先）', () => {
  assert.equal(pairs.length, 9)
  assert.deepEqual(
    pairs.map(([from]) => from),
    [
      `${STAGING}/gsd-core`,
      `${STAGING}/skills`,
      STAGING,
      '~/.dsh/gsd-core',
      '~/.dsh/tasks',
      '~/.dsh',
      '$HOME/.dsh/gsd-core',
      '$HOME/.dsh/tasks',
      '$HOME/.dsh',
    ],
  )
})

test('② staging 根基准：gsd-core 子路径命中引擎插件路径', () => {
  assert.equal(
    apply(`${STAGING}/gsd-core/workflows/plan-phase.md`),
    '$DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/workflows/plan-phase.md',
  )
  assert.equal(
    apply(`见 ${STAGING}/skills/gsd-plan-phase/SKILL.md 与 ${STAGING}/tasks/t1.md`),
    '见 $DSH_PROFILE_DIR/node_modules/dsh-gsd/skills/gsd-plan-phase/SKILL.md 与 $DSH_HOME/tasks/t1.md',
  )
})

test('③ ~/ 回退形态：tasks 与 skills 均落 $DSH_HOME', () => {
  assert.equal(apply('~/.dsh/tasks/t1.md'), '$DSH_HOME/tasks/t1.md')
  assert.equal(apply('~/.dsh/skills/x'), '$DSH_HOME/skills/x')
})

test('④ $HOME 回退形态：gsd-core 落引擎插件路径', () => {
  assert.equal(
    apply('$HOME/.dsh/gsd-core/a.md'),
    '$DSH_PROFILE_DIR/node_modules/dsh-gsd/gsd-core/a.md',
  )
  assert.equal(apply('$HOME/.dsh/tasks/b.md'), '$DSH_HOME/tasks/b.md')
  assert.equal(apply('$HOME/.dsh/free'), '$DSH_HOME/free')
})

test('⑤ 替换结果无 staging 根、无 /Users/ 机器路径残留', () => {
  const samples = [
    `${STAGING}/gsd-core/x`,
    `${STAGING}/skills/gsd-plan-phase/SKILL.md`,
    `${STAGING}/anything/else`,
    '~/.dsh/tasks/a.md',
    '$HOME/.dsh/gsd-core/b.md',
  ].map(apply)
  for (const out of samples) {
    assert.ok(!out.includes('/Users/'), `machine path leaked: ${out}`)
    assert.ok(!out.includes(STAGING), `staging root leaked: ${out}`)
  }
})

test('⑥ 裸 $HOME 惯用语保持原样（Pitfall 5，不映射裸 $HOME）', () => {
  const idiom = '${CLAUDE_CONFIG_DIR:-$HOME/.claude}'
  assert.equal(apply(idiom), idiom)
  assert.equal(apply('cat $HOME/.claude/settings.json'), 'cat $HOME/.claude/settings.json')
})
