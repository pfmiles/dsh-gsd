# Pending — Phase 3 assets

Files here are **intentionally outside the `tests/*.test.mjs` glob** so they do not
run or count toward any Phase 02 verification figure.

## `pack-contents.test.mjs`

Publish-surface (tarball content) defence: asserts `package.json` `files` stays a
narrow whitelist, that `npm pack --dry-run` never ships `.planning/`, `tests/`,
`build/`, `.github/` or other dev-only paths, and that runtime essentials
(`index.js`, `cordis.patch.yml`, `locale/`, `skills/`, `gsd-core/`, `hooks/`,
`config/`, `scripts/`) are not dropped.

**Provenance:** appeared in `tests/` at 2026-11-12 12:10 local during the Phase 02
verification re-run. None of the three audit subagents created it, and it is not
referenced by any Phase 02 artifact. It measures the **publish** surface, which is
Phase 3 scope (发布 GitHub + npm + dshmarket), not Phase 02 (VER-01..VER-04, DEV-03).

**Status:** 3/3 passing when run explicitly. Kept out of the suite so Phase 02's
recorded figures (5 files / 26 tests) stay accurate.

**To adopt in Phase 3:** move it back to `tests/pack-contents.test.mjs`, then update
the test counts in `BUILD.md` (TL;DR line), `.planning/phases/02-compat-matrix/02-VALIDATION.md`
and any docs-consistency assertion that pins a count.
