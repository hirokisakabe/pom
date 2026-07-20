# pom-theme

`pom-theme` onboards brand assets into a reusable `pom-theme.json` file. `pom-slide` reads this file automatically when it generates a deck in the same directory.

## Install

```bash
npx skills add hirokisakabe/pom --all
npm install -g @hirokisakabe/pom-cli
```

## Supported inputs

Ask the agent to create a theme from one or more of:

- brand colors such as `#0052CC`
- an existing `.pptx` master
- a website URL
- a logo or other image

For example:

```text
Create a pom theme from brand-master.pptx.
```

For PPTX input, the skill uses `pom theme extract` to read theme colors. It derives a palette, checks color contrast, records typography and background settings, and writes `pom-theme.json`.

## Basic flow

1. Provide the brand source and ask the agent to create a pom theme.
2. Review the palette and typography recorded in `pom-theme.json`.
3. Ask the agent to create a presentation in the same directory.
4. `pom-slide` applies the theme's tone, palette, fonts, and background to its pom XML.
5. Preview and refine the deck with [pom CLI](/pom-cli).

The theme file remains a separate, reusable design input. The presentation itself is still represented as pom XML and rendered through the common pom pipeline.
