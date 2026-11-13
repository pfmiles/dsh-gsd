> **Using DeepSeek Harness and want GSD the native way?** This script stays the right choice for
> bulk provisioning, fully offline installs, and its own per-profile diagnostics - keep it if that
> is what you need. If you would rather install GSD as a DSH plugin (one command, profile-scoped,
> enable/disable/remove, one-command upgrade and rollback, nothing written outside the profile),
> see [pfmiles/dsh-gsd](https://github.com/pfmiles/dsh-gsd):
> `dsh plugin --profile web add dsh-gsd`. Already installed with this script?
> [The migration guide](https://github.com/pfmiles/dsh-gsd/blob/main/docs/MIGRATION.md) walks
> through uninstall -> plugin add -> verify, plus how to roll back.