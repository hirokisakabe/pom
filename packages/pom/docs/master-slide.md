# Slide Master

You can define a slide master with static objects (text, images, rectangles, lines) and automatic page numbers that appear on all slides.

## Basic Usage

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const xml = `
<Slide>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Page 1</Text>
  </VStack>
</Slide>
<Slide>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Page 2</Text>
  </VStack>
</Slide>
`;

const { pptx } = await buildPptx(
  xml,
  { w: 1280, h: 720 },
  {
    master: {
      title: "MY_MASTER",
      background: { color: "F8FAFC" },
      objects: [
        // Header background
        {
          type: "rect",
          x: 0,
          y: 0,
          w: 1280,
          h: 40,
          fill: { color: "0F172A" },
        },
        // Header text (left)
        {
          type: "text",
          text: "Company Name",
          x: 48,
          y: 12,
          w: 200,
          h: 28,
          fontSize: 14,
          color: "FFFFFF",
        },
        // Header text (right) - date
        {
          type: "text",
          text: "2025/01/01",
          x: 1032,
          y: 12,
          w: 200,
          h: 28,
          fontSize: 12,
          color: "E2E8F0",
          textAlign: "right",
        },
        // Footer text
        {
          type: "text",
          text: "Confidential",
          x: 48,
          y: 682,
          w: 200,
          h: 30,
          fontSize: 10,
          color: "1E293B",
        },
      ],
      // Page number (automatically inserted by pptxgenjs)
      slideNumber: {
        x: 1032,
        y: 682,
        w: 200,
        h: 30,
        fontSize: 10,
        color: "1E293B",
      },
    },
  },
);
```

## Slide Master Options

```typescript
type SlideMasterOptions = {
  title?: string; // Master slide name (auto-generated if omitted)
  background?:
    { color: string } | { path: string } | { data: string } | { image: string };
  margin?:
    number | { top?: number; right?: number; bottom?: number; left?: number };
  objects?: MasterObject[]; // Static objects (absolute coordinates in px)
  slideNumber?: SlideNumberOptions; // Page number using pptxgenjs built-in feature
};

type MasterObject =
  MasterTextObject | MasterImageObject | MasterRectObject | MasterLineObject;

type MasterTextObject = {
  type: "text";
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  textAlign?: "left" | "center" | "right";
};

type MasterImageObject = {
  type: "image";
  src: string; // Path or data URI
  x: number;
  y: number;
  w: number;
  h: number;
};

type MasterRectObject = {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: { color?: string; transparency?: number };
  border?: { color?: string; width?: number; dashType?: string };
};

type MasterLineObject = {
  type: "line";
  x: number;
  y: number;
  w: number;
  h: number;
  line?: { color?: string; width?: number; dashType?: string };
};

type SlideNumberOptions = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
};
```

## Features

- **True PowerPoint Master**: Uses pptxgenjs's `defineSlideMaster` to create a real master slide that is editable in PowerPoint
- **Static Objects**: Define text, images, rectangles, and lines with absolute coordinates (in pixels)
- **Background**: Set solid color, image path, or base64-encoded image as the slide background
- **Page Number**: Automatic page numbering using pptxgenjs built-in feature
- **Margin**: Define content margins in pixels

## Background Options

```typescript
// Solid color
background: {
  color: "F8FAFC";
}

// Image from file path
background: {
  path: "./images/background.png";
}

// Base64-encoded image
background: {
  data: "data:image/png;base64,...";
}

// Image from URL or file path
background: {
  image: "https://example.com/cover.jpg";
}
```

## Using an Existing PPTX as Master

You can pass an existing PPTX file as a master template via the `masterPptx` option. The background (solid color or image) from the slide master or slide layout will be extracted and applied to the output.

```typescript
import fs from "fs";
import { buildPptx } from "@hirokisakabe/pom";

const { pptx } = await buildPptx(
  xml,
  { w: 1280, h: 720 },
  {
    masterPptx: fs.readFileSync("template.pptx"),
  },
);
```

### Usage from pom-md

When using `@hirokisakabe/pom-md`, you can specify `masterPptx` in the frontmatter:

```markdown
---
masterPptx: ./template.pptx
---

# Slide content
```

The path is resolved relative to the `.pom.md` file.

### Priority Rules

- If both `masterPptx` and `master.background` are specified, `master.background` takes priority
- `masterPptx` only extracts the background; other master settings (objects, margin, slideNumber) are not affected

### Supported Backgrounds

- Solid color fills (`a:solidFill` / `a:srgbClr`)
- Image fills (`a:blipFill` / `a:blip`)

### Lookup Order

1. Slide master (`ppt/slideMasters/slideMaster1.xml`)
2. Slide layouts (`ppt/slideLayouts/slideLayoutN.xml`)

### Not Supported

- Theme colors (`a:schemeClr`)
- Gradient fills (`a:gradFill`)
- Static objects (logos, decorations)
- Slide size inheritance
- Font/theme/placeholder inheritance

## Notes

- All coordinates and dimensions are specified in **pixels** (px)
- Coordinates are converted internally to inches (96 DPI)
- The `slideNumber` option uses pptxgenjs's built-in page number feature
