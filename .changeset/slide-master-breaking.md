---
"@hirokisakabe/pom": major
---

BREAKING CHANGE: Replace MasterSlideOptions with SlideMasterOptions

This release replaces the pseudo master slide implementation with pptxgenjs's native `defineSlideMaster` API, creating true PowerPoint master slides that are editable in PowerPoint.

### Breaking Changes

- **Removed**: `MasterSlideOptions` type
- **Removed**: `composePage` and `replacePlaceholders` internal functions
- **Removed**: Dynamic placeholders (`{{page}}`, `{{totalPages}}`, `{{date}}`)
- **Removed**: `header` and `footer` options (use `objects` instead)
- **Removed**: `pageNumber.position` option (use `slideNumber` instead)

### New API

The new `SlideMasterOptions` type provides:

- `title`: Master slide name (optional, auto-generated if omitted)
- `background`: Slide background (`{ color }`, `{ path }`, or `{ data }`)
- `margin`: Content margins in pixels
- `objects`: Array of static objects (`text`, `image`, `rect`, `line`) with absolute coordinates
- `slideNumber`: Page number configuration using pptxgenjs built-in feature

### Migration Guide

Before:

```typescript
{
  master: {
    header: { type: "hstack", ... },
    footer: { type: "hstack", ... },
    pageNumber: { position: "right" },
    date: { value: "2025/01/01" },
  }
}
```

After:

```typescript
{
  master: {
    title: "MY_MASTER",
    objects: [
      { type: "rect", x: 0, y: 0, w: 1280, h: 40, fill: { color: "0F172A" } },
      { type: "text", text: "Header", x: 48, y: 12, w: 200, h: 28, fontPx: 14 },
      { type: "text", text: "2025/01/01", x: 1032, y: 12, w: 200, h: 28, fontPx: 12 },
    ],
    slideNumber: { x: 1100, y: 680, fontPx: 10 },
  }
}
```
