// dsh-plugin-gsd — GSD coding workflow as a DeepSeek Harness bundle.
//
// One cordis application that, on activation:
//   1. registers a filesystem skill provider over this package's `skills/`
//      directory (reusing DSH's own FileSystemSkillProvider), so all 72
//      `gsd-*` skills appear in the session skill catalog; and
//   2. mounts `@deepseek-ai/dsh-hooks-claude-code` with a configPath and
//      pluginRoot inside this package, so GSD's lifecycle guard hooks fire
//      with zero profile-patch edits.
//
// Everything is resolved relative to this package's own directory, so the
// installation is fully portable across DSH_HOME locations and profiles.
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem'
import { apply as hooksBridgeApply } from '@deepseek-ai/dsh-hooks-claude-code'

export const inject = ['skills']
export const name = 'gsd'

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const skillsDir = join(pluginRoot, 'skills')
const hooksConfig = join(pluginRoot, 'config', 'gsd-hooks.json')

export function apply(ctx, config = {}) {
  if (config.skills !== false) {
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
  }

  if (config.hooks !== false) {
    ctx.effect(() => {
      const fiber = ctx.plugin(hooksBridgeApply, {
        configPath: hooksConfig,
        pluginRoot,
        defaultTimeoutMs: config.defaultTimeoutMs ?? 300000,
      })
      return () => { void fiber.dispose?.() }
    }, 'gsd-hooks-bridge')
  }

  ctx.logger.info(
    `[dsh-plugin-gsd] skills=${skillsDir} hooks=${config.hooks === undefined || config.hooks !== false ? hooksConfig : '(disabled)'}`,
  )
}
