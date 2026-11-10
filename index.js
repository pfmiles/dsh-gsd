// dsh-gsd — GSD coding workflow as a DeepSeek Harness bundle.
//
// One cordis application that registers a filesystem skill provider over this
// package's `skills/` directory (reusing DSH's own FileSystemSkillProvider),
// so all 72 `gsd-*` skills appear in the session skill catalog.
//
// The hooks bridge is mounted by the bundle patch as a separate loader row
// (`gsd-hooks-bridge` in cordis.patch.yml) — programmatic ctx.plugin()
// mounting was spike-tested and does not subscribe to session events.
//
// Everything is resolved relative to this package's own directory, so the
// installation is fully portable across DSH_HOME locations and profiles.
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem'

export const inject = ['skills']
export const name = 'gsd'

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = join(pluginRoot, 'skills')

export function apply(ctx, config = {}) {
  if (config.skills === false) {
    ctx.logger.info('[dsh-gsd] skills provider disabled by row config')
    return
  }
  let provider
  ctx.skills.registerProvider((control) => {
    provider = new FileSystemSkillProvider(ctx, control, {
      providerName: 'gsd',
      includeDefaultRoots: false,
      customSkillDirs: [skillsDir],
      watch: true,
    })
    return provider
  })
  ctx.effect(function* () {
    yield () => { void provider?.dispose?.() }
  }, 'gsd-skill-provider')
  ctx.logger.info(`[dsh-gsd] skills provider: ${skillsDir}`)
}
