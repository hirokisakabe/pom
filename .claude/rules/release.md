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

## Distribution (skills/)

Skills (`pom-slide`, `pom-theme`) have **no release workflow**. They are distributed via `npx skills add hirokisakabe/pom --all` (vercel-labs/skills CLI), which fetches `skills/*/SKILL.md` directly from main HEAD — merging to main is the release (#791).

- **No git tags / GitHub Releases** for skills. The former `release-skill.yml` (`gh skill publish` with per-skill tags) was removed.
- **Validation**: `ci-skills.yml` runs `gh skill publish --dry-run` as an agentskills.io spec-compliance check on PRs touching `skills/**`.
- `metadata.version` in SKILL.md frontmatter is informational only; bumping it triggers nothing.
