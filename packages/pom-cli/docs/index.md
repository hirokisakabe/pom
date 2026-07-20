# pom CLI

`@hirokisakabe/pom-cli` previews, builds, and renders `.pom.xml` and `.pom.md` presentations. It is a tool around the shared pom model: Markdown input is converted to pom XML, and all commands use the same core layout and rendering pipeline as the TypeScript library, pom-vscode, and Playground.

Requires Node.js 22 or later.

## Install

```bash
npm install -g @hirokisakabe/pom-cli
```

You can try a command without a global install:

```bash
npx @hirokisakabe/pom-cli preview slides.pom.xml
```

## AI-assisted live preview

Keep the preview open while an AI coding agent edits `slides.pom.xml`:

```bash
pom preview slides.pom.xml
```

The browser refreshes as the file changes, so the agent can focus on editing and validation while you inspect the visual result. For `.pom.xml`, the browser also offers XML and drag-and-drop AST editing. Unsaved browser edits are preserved when an external edit arrives, and **Save** refuses to overwrite a file that changed after it was loaded. `.pom.md` is preview-only in the browser.

This loop is the recommended pom kit workflow:

```text
Request changes → agent edits pom XML → live preview refreshes → review → repeat
```

The [pom-slide skill](/agent-skills/pom-slide) can start or reuse the preview as part of its generation and self-review flow.

## `preview`

Starts the local browser editor and live preview server.

```bash
pom preview slides.pom.xml
pom preview slides.pom.md
```

| Option            | Description                                  |
| ----------------- | -------------------------------------------- |
| `--port <number>` | Listen on a different port instead of `3000` |
| `--no-open`       | Do not open the browser automatically        |
| `--verbose`       | Print per-step build timing to stderr        |

## `build`

Builds an editable PPTX from pom XML or Markdown.

```bash
pom build slides.pom.xml -o slides.pptx
pom build slides.pom.md -o slides.pptx
```

| Option        | Description                             |
| ------------- | --------------------------------------- |
| `-o <output>` | Required output `.pptx` path            |
| `--watch`     | Rebuild whenever the input file changes |
| `--verbose`   | Print per-step build timing to stderr   |

In watch mode, a failed build is reported but the process stays alive for the next edit.

## `render`

Renders each slide to PNG (default) or SVG without requiring LibreOffice.

```bash
pom render slides.pom.xml -o ./images
pom render slides.pom.xml -o ./images --format svg
```

Output files are named `slide-01.png`, `slide-02.png`, and so on. The output directory is created when necessary.

| Option                 | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| `-o <dir>`             | Required output directory                                                       |
| `--format <format>`    | `png` (default) or `svg`                                                        |
| `--slides <numbers>`   | Render selected 1-based slides, for example `2,5`                               |
| `--text-output <mode>` | With SVG, use `path` glyph outlines or native `text` with embedded subset fonts |
| `--verbose`            | Print per-step build timing to stderr                                           |

`--text-output` is valid only with `--format svg`. Path output is the default; native text is selectable but may be affected by sanitizers or `<img>` embedding.

## `theme extract`

Extracts theme colors from an existing PowerPoint file as pom `ThemeTokens` JSON:

```bash
pom theme extract brand-master.pptx
```

The command prints one entry per visible slide layout in source order, including `text`, `background`, `primary`, `secondary`, and `accent3` through `accent6`. The [pom-theme skill](/agent-skills/pom-theme) uses this command when onboarding an existing PPTX master.

## Diagnostics

`build` and `render` run strict validation. Layout, image, master, and auto-fit diagnostics fail the command with a non-zero status and are printed to stderr. `preview` continues updating when diagnostics occur so you can correct the source interactively.

Continue with the [AI agent + pom CLI Quick Start](/getting-started#ai-agent--pom-cli) or compare [other tools and authoring formats](/authoring).
