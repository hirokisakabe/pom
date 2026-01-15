# Master Slide

You can automatically insert common headers, footers, and page numbers across all pages.

## Basic Usage

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const pptx = await buildPptx(
  [page1, page2, page3],
  { w: 1280, h: 720 },
  {
    master: {
      header: {
        type: "hstack",
        h: 40,
        padding: { left: 48, right: 48, top: 12, bottom: 0 },
        justifyContent: "spaceBetween",
        alignItems: "center",
        backgroundColor: "0F172A",
        children: [
          {
            type: "text",
            text: "Company Name",
            fontPx: 14,
            color: "FFFFFF",
          },
          {
            type: "text",
            text: "{{date}}",
            fontPx: 12,
            color: "E2E8F0",
          },
        ],
      },
      footer: {
        type: "hstack",
        h: 30,
        padding: { left: 48, right: 48, top: 0, bottom: 8 },
        justifyContent: "spaceBetween",
        alignItems: "center",
        children: [
          {
            type: "text",
            text: "Confidential",
            fontPx: 10,
            color: "1E293B",
          },
          {
            type: "text",
            text: "Page {{page}} / {{totalPages}}",
            fontPx: 10,
            color: "1E293B",
            alignText: "right",
          },
        ],
      },
      date: {
        format: "YYYY/MM/DD", // or "locale"
      },
    },
  },
);
```

## Master Slide Options

```typescript
type MasterSlideOptions = {
  header?: POMNode; // Header (any POMNode can be specified)
  footer?: POMNode; // Footer (any POMNode can be specified)
  pageNumber?: {
    position: "left" | "center" | "right"; // Page number position
  };
  date?: {
    format: "YYYY/MM/DD" | "locale"; // Date format
  };
};
```

## Placeholders

The following placeholders can be used in text within headers and footers:

- `{{page}}`: Current page number
- `{{totalPages}}`: Total number of pages
- `{{date}}`: Date (in the format specified by `date.format`)

## Features

- **Flexibility**: Headers and footers can use any POMNode (VStack, HStack, Box, etc.)
- **Automatic Composition**: Headers and footers are automatically added to each page's content
- **Dynamic Replacement**: Placeholders are automatically replaced per page
- **Backward Compatibility**: The master option is optional and has no impact on existing code
