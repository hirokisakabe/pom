# Serverless Environments

pom uses the `canvas` package by default to measure text width and determine line break positions. However, in serverless environments like Vercel or AWS Lambda, Japanese fonts (such as Noto Sans JP) are not installed, which may cause text line breaks to be misaligned.

To address this issue, you can specify the text measurement method using the `textMeasurement` option.

## textMeasurement Option

```typescript
const pptx = await buildPptx(
  [slide],
  { w: 1280, h: 720 },
  {
    textMeasurement: "auto", // "canvas" | "fallback" | "auto"
  },
);
```

| Value        | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `"canvas"`   | Always use canvas for text width measurement (for environments with fonts installed)   |
| `"fallback"` | Always use fallback calculation (CJK characters = 1em, alphanumeric = 0.5em estimated) |
| `"auto"`     | Auto-detect font availability and fall back if unavailable (default)                   |

## Recommended Settings

- **Local development / Docker**: Default (`"auto"`) works fine
- **Serverless environments**: Default `"auto"` will automatically fall back
- **Environments with fonts installed**: Explicitly specifying `"canvas"` enables more accurate measurement
