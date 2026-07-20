# pom CLI

`@hirokisakabe/pom-cli` previews, builds, and renders `.pom.xml` and `.pom.md` files. It operates on the same pom XML model as the core library, pom-vscode, and Playground.

## Install

Requires Node.js 22 or later.

```bash
npm install -g @hirokisakabe/pom-cli
```

You can also run a command without a global install:

```bash
npx @hirokisakabe/pom-cli preview slides.pom.xml
```

## Agent editing + live preview

Keep a preview open while your coding agent edits `slides.pom.xml`:

```bash
pom preview slides.pom.xml
```

The browser updates when the file changes. The agent can focus on XML edits and validation while you assess the visual result and request another iteration. For `.pom.xml`, the browser also offers XML / AST editing and conflict-safe Save; `.pom.md` remains preview-only.

This is the runtime loop used by [`pom-slide`](/agent-skills#pom-slide): prompt -> XML edit -> strict validation -> rendered review -> live preview.

## `preview`

```bash
pom preview <input.pom.xml|input.pom.md> [options]
```

| Option            | Description                         |
| ----------------- | ----------------------------------- |
| `--port <number>` | Listen on a port other than 3000    |
| `--no-open`       | Do not open a browser automatically |
| `--verbose`       | Print build-step timing to stderr   |

## `build`

```bash
pom build slides.pom.xml -o slides.pptx
pom build slides.pom.md -o slides.pptx --watch
```

| Option        | Description                        |
| ------------- | ---------------------------------- |
| `-o <output>` | Required output PPTX path          |
| `--watch`     | Rebuild after each input-file save |
| `--verbose`   | Print build-step timing to stderr  |

Build uses strict diagnostics and exits non-zero for layout, image, master, or auto-fit errors. Watch mode reports an error and continues waiting for the next edit.

## `render`

Render every slide to PNG, or choose SVG:

```bash
pom render slides.pom.xml -o ./images
pom render slides.pom.xml -o ./images --format svg
pom render slides.pom.xml -o ./images --slides 2,5
```

| Option               | Description                                   |
| -------------------- | --------------------------------------------- |
| `-o <dir>`           | Required output directory                     |
| `--format <png       | svg>`                                         | Output format; default is `png`                                     |
| `--slides <numbers>` | Render 1-based, comma-separated slide numbers |
| `--text-output <path | text>`                                        | For SVG only: glyph paths or native text with embedded subset fonts |
| `--verbose`          | Print build-step timing to stderr             |

Output files are named `slide-01.png`, `slide-02.png`, and so on. Rendering uses the same pipeline as live preview and does not require LibreOffice.

## `theme extract`

Extract pom `ThemeTokens` from an existing PowerPoint file:

```bash
pom theme extract brand-master.pptx
```

The command prints a JSON array with one entry per visible slide layout. Each entry contains `text`, `background`, `primary`, `secondary`, and `accent3` through `accent6`. The [`pom-theme` agent skill](/agent-skills#pom-theme) uses this command when onboarding a PowerPoint master.

## Next steps

- Follow the full [Getting Started](/getting-started#ai-agent--pom-cli-recommended) flow.
- Learn the shared source format in [pom XML](/pom-xml).
- Use [pom-vscode](/pom-vscode) when you prefer an editor-integrated preview.
