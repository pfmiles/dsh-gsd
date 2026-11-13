title: docs: point install-gsd-dsh readers at the dsh-gsd plugin
---
## What this changes

Adds one blockquote to `README.md`, immediately before the `## Quick start` heading. The `---`
rule above that heading stays exactly where it is, and no other section, command or line is
touched.

## Why

This script is the fallback, and it is kept - not deprecated. It remains the right choice for bulk
provisioning, for fully offline installs, and for its own per-profile diagnostics.

The plugin is the new default for single-machine use: one command, profile-scoped, enable / disable
/ remove, and a one-command upgrade or rollback. Readers who land on this repository should know the
native option exists, and one short honest note is the cheapest way to say so.

## Backlink

- Plugin repository: https://github.com/pfmiles/dsh-gsd
- Migration guide (uninstall -> plugin add -> verify, plus rollback):
  https://github.com/pfmiles/dsh-gsd/blob/main/docs/MIGRATION.md

## No behaviour change

- No existing step, command, option or environment variable is removed, renamed or reordered.
- No version numbers are hardcoded in the note, so it cannot go stale when the plugin releases.
- No file other than `README.md` is modified by this PR.