# Agent Skills

The pom agent skills turn natural-language requests and brand assets into the same pom XML source used by the rest of the kit. They are designed for coding agents that support the open Agent Skills format.

## Install

Install both skills from the pom repository:

```bash
npx skills add hirokisakabe/pom --all
```

Install pom CLI as well so the skills can validate, render, preview, and build their output:

```bash
npm install -g @hirokisakabe/pom-cli
```

## Choose a skill

| Skill                                | Role                                                                             | Output                                         |
| ------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------- |
| [pom-slide](/agent-skills/pom-slide) | Create, revise, or extend a presentation from natural language                   | `slides.pom.xml` (or a requested pom XML file) |
| [pom-theme](/agent-skills/pom-theme) | Derive palette and typography from colors, a PPTX master, a website, or an image | `pom-theme.json`                               |

Installed skills can be selected automatically when a request matches their description. You can also select a skill explicitly through your agent's skill picker.

## Typical branded-deck flow

1. Ask the agent to create a pom theme from your brand color, existing PPTX, website, or image.
2. Review the generated `pom-theme.json`.
3. In the same directory, ask the agent to create the presentation. `pom-slide` reads the theme automatically.
4. Keep `pom preview slides.pom.xml` open while requesting changes.
5. Build the final editable PowerPoint with `pom build slides.pom.xml -o slides.pptx`.

See the [Getting Started guide](/getting-started#ai-agent--pom-cli) for a complete first run.
