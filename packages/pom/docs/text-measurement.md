# Text Measurement

pom uses `opentype.js` with bundled Noto Sans JP fonts or caller-supplied font bytes to measure text width and determine line break positions. This approach works consistently in Node.js and browsers, including serverless platforms like Vercel or AWS Lambda.

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
| `"opentype"` | Always use opentype.js; an unregistered family uses bundled Noto Sans JP metrics       |
| `"fallback"` | Always use fallback calculation (CJK characters = 1em, alphanumeric = 0.5em estimated) |
| `"auto"`     | Use opentype.js for bundled or registered fonts; otherwise use fallback (default)      |

## Font Resolution Rules

pom resolves the measurement method based on the `fontFamily` specified on each node:

1. **Bundled font (`Noto Sans JP`)**: Uses opentype.js for accurate glyph-level measurement. This is the default when no `fontFamily` is specified.
2. **Registered custom fonts**: Uses that face's opentype advance widths. Family matching is case-insensitive. A requested bold face falls back to the registered regular face when necessary.
3. **Unregistered fonts** (e.g., `Arial`, `Meiryo`): In `"auto"` mode, falls back to heuristic estimation (CJK characters = 1em, alphanumeric = 0.5em).
4. **`textMeasurement: "fallback"`**: Forces heuristic estimation regardless of registered fonts.
5. **`textMeasurement: "opentype"`**: Preserves the legacy behavior of using bundled Noto Sans JP metrics when the requested family is not registered.

## Custom Font Bytes

Pass font bytes through the `fonts` build option. Its shape is compatible with pptx-glimpse font buffers and does not require a file-system API:

```typescript
import { buildPptx, type FontInput } from "@hirokisakabe/pom";

const fonts: FontInput[] = [
  { name: "Brand Sans", data: regularBytes },
  { name: "Brand Sans", data: boldBytes, weight: 700 },
];

const { pptx } = await buildPptx(xml, { w: 1280, h: 720 }, { fonts });
```

```typescript
interface FontInput {
  name?: string;
  data: ArrayBuffer | Uint8Array;
  weight?: "normal" | "bold" | number;
}
```

When `name` is present, it is registered as a family alias in addition to family names read from the font's names table. Without `name`, use the font's internal family name. If `weight` is omitted, pom reads the font metadata when possible and otherwise registers it as regular.

The supplied bytes affect advance-width measurement and wrapping for `Text`, `Ul`, `Ol`, and `Shape`. They do not change custom-font vertical metrics, accurately combine per-`Span` font families, embed fonts in the PPTX, or install fonts in the viewing environment.

### Why this matters

Previously, layout measurement always used Noto Sans JP metrics even when a different `fontFamily` was specified for rendering. This caused layout misalignment because the measured widths did not match the rendered widths. Now, when a non-bundled font is specified, pom uses a font-independent heuristic instead, reducing the mismatch.

### Supported nodes

Font resolution applies consistently to all text-bearing nodes: `Text`, `Ul`, `Ol`, and `Shape`.

## Recommended Settings

- **All environments**: Default (`"auto"`) works fine - bundled fonts ensure consistent results
- **Reduced bundle size**: Use `"fallback"` if you want to avoid loading bundled fonts (less accurate but smaller bundle)
- **Custom fonts with available bytes**: Register them through `fonts` and keep the default `"auto"` mode
- **Custom fonts without available bytes**: Default `"auto"` uses heuristic measurement to avoid mismatched metrics

## Line Height and Rendering

The user-supplied `lineHeight` (default `1.3`) is reflected in the yoga layout measurement of `Text` (and the text inside `Shape`): the block height is `lines × fontSize × lineHeight`.

To keep the measured height aligned with the rendered output, the renderer emits the line spacing as a fixed value (PowerPoint `spcPts` = `fontSize × lineHeight` in pt). Using a fixed value instead of a multiplier (`spcPct`) avoids font-metric mismatches that previously left asymmetric whitespace above/below the glyph ink — see [PR #854](https://github.com/hirokisakabe/pom/pull/854). Glyphs are also vertically centered within the line box so a custom `lineHeight` produces evenly distributed top/bottom padding.

`Ul` / `Ol` still use the multiplier form (`spcPct` = `lineHeight` × bundled-font line-height ratio). Their measurement and rendering both go through `measureFontLineHeightRatio × lineHeight`, so the block height matches the rendered line spacing, but it differs slightly from a `Text` block with the same `lineHeight`.

The PNG / SVG output produced by `pom render` and the previews shown by `pom preview` / pom-vscode go through `pptx-glimpse`, which has supported `spcPts` since version 1.1.1. Both rendering paths now honor the fixed `Text` line spacing emitted by pom.
