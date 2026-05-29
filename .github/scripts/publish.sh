#!/bin/bash
set -e
node .github/scripts/resolve-workspace-deps.js
pnpm exec changeset publish
