---
paths:
  - .changeset/**
  - skills/**
---

## Release Flow (Changesets) — npm packages + pom-vscode

All npm packages (`@hirokisakabe/pom`, `@hirokisakabe/pom-md`, `@hirokisakabe/pom-cli`, `@hirokisakabe/pom-jsx`, `@hirokisakabe/pom-editor`) and `pom-vscode` use [Changesets](https://github.com/changesets/changesets) for versioning. The unified workflow (`release.yml`) handles all packages.

1. Add a changeset: `pnpm exec changeset add`
2. Push to main → GitHub Actions creates a Release PR (version bump + CHANGELOG)
3. Merge the Release PR → `changeset publish` publishes all npm packages, then detects pom-vscode version change → `vsce publish` to VS Code Marketplace + Git tag + GitHub Release

## Release Flow (pom-slide skill)

`pom-slide` uses a separate workflow (`release-skill.yml`) independent of Changesets.

- **Version management**: `metadata.version` field in `skills/pom-slide/SKILL.md` frontmatter
- **Trigger**: push to main with changes to `skills/**`
- **Flow**: bump `metadata.version` in `SKILL.md` → push to main → `release-skill.yml` runs `gh skill publish --tag pom-slide-v${VERSION}` → git tag + GitHub Release + skill registry publish
- **Idempotency**: if tag `pom-slide-v${VERSION}` already exists, the workflow skips
