# Text Measurement

pom uses `opentype.js` with bundled Noto Sans JP fonts to measure text width and determine line break positions. This approach works consistently across all Node.js environments, including serverless platforms like Vercel or AWS Lambda.

## textMeasurement Option

You can specify the text measurement method using the `textMeasurement` option if needed:

```typescript
const { pptx } = await buildPptx(
  xml,
  { w: 1280, h: 720 },
  {
    textMeasurement: "auto", // "opentype" | "fallback" | "auto"
  },
);
```

| Value        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `"opentype"` | Always use opentype.js for text width measurement (default)                            |
| `"fallback"` | Always use fallback calculation (CJK characters = 1em, alphanumeric = 0.5em estimated) |
| `"auto"`     | Use opentype.js (same as "opentype", default)                                          |

## Font Resolution Rules

pom resolves the measurement method based on the `fontFamily` specified on each node:

1. **Bundled font (`Noto Sans JP`)**: Uses opentype.js for accurate glyph-level measurement. This is the default when no `fontFamily` is specified.
2. **Non-bundled fonts** (e.g., `Arial`, `Meiryo`): Automatically falls back to heuristic estimation (CJK characters = 1em, alphanumeric = 0.5em). This ensures layout does not use mismatched font metrics.
3. **`textMeasurement: "fallback"`**: Forces heuristic estimation regardless of font family.

### Why this matters

Previously, layout measurement always used Noto Sans JP metrics even when a different `fontFamily` was specified for rendering. This caused layout misalignment because the measured widths did not match the rendered widths. Now, when a non-bundled font is specified, pom uses a font-independent heuristic instead, reducing the mismatch.

### Supported nodes

Font resolution applies consistently to all text-bearing nodes: `Text`, `Ul`, `Ol`, and `Shape`.

## Recommended Settings

- **All environments**: Default (`"auto"`) works fine - bundled fonts ensure consistent results
- **Reduced bundle size**: Use `"fallback"` if you want to avoid loading bundled fonts (less accurate but smaller bundle)
- **Custom fonts**: When using `fontFamily` other than `Noto Sans JP`, pom automatically uses fallback measurement to avoid metric mismatch

## Line Height and Rendering

The user-supplied `lineHeight` (default `1.3`) is reflected in the yoga layout measurement of `Text` (and the text inside `Shape`): the block height is `lines × fontSize × lineHeight`.

To keep the measured height aligned with the rendered output, the renderer emits the line spacing as a fixed value (PowerPoint `spcPts` = `fontSize × lineHeight` in pt). Using a fixed value instead of a multiplier (`spcPct`) avoids font-metric mismatches that previously left asymmetric whitespace above/below the glyph ink — see [#846](https://github.com/hirokisakabe/pom/pull/854). Glyphs are also vertically centered within the line box so a custom `lineHeight` produces evenly distributed top/bottom padding.

`Ul` / `Ol` still use the multiplier form (`spcPct` = `lineHeight` × bundled-font line-height ratio). Their measurement and rendering both go through `measureFontLineHeightRatio × lineHeight`, so the block height matches the rendered line spacing, but it differs slightly from a `Text` block with the same `lineHeight`.

The PNG / SVG output produced by `pom render` and the previews shown by `pom preview` / pom-vscode go through `pptx-glimpse`, which has supported `spcPts` since version 1.1.1. Both rendering paths now honor the fixed `Text` line spacing emitted by pom.
