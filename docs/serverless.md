# Serverless Environments

pom uses `opentype.js` with bundled Noto Sans JP fonts to measure text width and determine line break positions. This approach works consistently in both Node.js and browser environments, including serverless platforms like Vercel or AWS Lambda.

## textMeasurement Option

You can specify the text measurement method using the `textMeasurement` option if needed:

```typescript
const pptx = await buildPptx(
  [slide],
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

## Recommended Settings

- **All environments**: Default (`"auto"`) works fine - bundled fonts ensure consistent results
- **Reduced bundle size**: Use `"fallback"` if you want to avoid loading bundled fonts (less accurate but smaller bundle)
