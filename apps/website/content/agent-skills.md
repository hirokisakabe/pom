# Agent Skills

pom ships two installable agent skills that connect natural-language work to the same pom XML and CLI workflow used elsewhere in the kit.

## Install

Requires Node.js 22 or later.

Install both skills from the repository:

```bash
npx skills add hirokisakabe/pom --all
```

Install pom CLI as well so the skills can validate, render, and preview their output:

```bash
npm install -g @hirokisakabe/pom-cli
```

Restart your coding-agent session after installation if it does not discover newly installed skills immediately.

## pom-slide

`pom-slide` creates a new pom XML deck or edits an existing one from natural-language instructions. It applies slide-design guidance, preserves untouched slides during incremental edits, validates the full deck, renders the result for self-review, and starts or reuses `pom preview`.

Typical flow:

1. Ask for a new deck or a targeted edit such as “replace slide 3 with a comparison”.
2. The skill writes or updates `slides.pom.xml`.
3. It validates with `pom build` and reviews rendered slides.
4. It leaves a live preview running for your review.

You normally do not need to name the skill: compatible agents select it when your request matches its description. Use your agent's skill picker when you want to invoke it explicitly.

## pom-theme

`pom-theme` creates `pom-theme.json` from brand colors, an existing PowerPoint master, a website, or an image. When both files are in the same working directory, `pom-slide` automatically applies its tone, colors, typography, and slide background. Other `slideMaster` options in the theme file are available to direct API consumers.

Typical flow:

1. Ask the agent to create a pom theme from a brand color or asset.
2. Review the generated `pom-theme.json` and optional sample slide.
3. Ask for a deck in the same directory; `pom-slide` reads the theme automatically.

For a PowerPoint source, `pom-theme` uses `pom theme extract brand-master.pptx` to read theme colors.

## Recommended workflow

```text
brand assets -> pom-theme -> pom-theme.json
                                  |
prompt ------> pom-slide ----------+-> slides.pom.xml
                                         |
                                         +-> pom preview
                                         +-> pom build -> PPTX
```

Continue with [Getting Started](/getting-started), [pom CLI](/pom-cli), or [pom XML](/pom-xml).
