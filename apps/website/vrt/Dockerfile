# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/pom/package.json packages/pom/
COPY packages/pom-cli/package.json packages/pom-cli/
COPY packages/pom-editor/package.json packages/pom-editor/
COPY packages/pom-jsx/package.json packages/pom-jsx/
COPY packages/pom-md/package.json packages/pom-md/
COPY packages/pom-vscode/package.json packages/pom-vscode/
COPY apps/website/package.json apps/website/

RUN corepack enable && corepack install
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/website
RUN pnpm run build

CMD ["pnpm", "run", "vrt"]
