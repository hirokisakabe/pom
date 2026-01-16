# Slide Master

You can define a slide master with static objects (text, images, rectangles, lines) and automatic page numbers that appear on all slides.

## Basic Usage

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const pptx = await buildPptx(
  [page1, page2, page3],
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
          fontPx: 14,
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
          fontPx: 12,
          color: "E2E8F0",
          alignText: "right",
        },
        // Footer text
        {
          type: "text",
          text: "Confidential",
          x: 48,
          y: 682,
          w: 200,
          h: 30,
          fontPx: 10,
          color: "1E293B",
        },
      ],
      // Page number (automatically inserted by pptxgenjs)
      slideNumber: {
        x: 1032,
        y: 682,
        w: 200,
        h: 30,
        fontPx: 10,
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
  background?: { color: string } | { path: string } | { data: string };
  margin?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  objects?: MasterObject[]; // Static objects (absolute coordinates in px)
  slideNumber?: SlideNumberOptions; // Page number using pptxgenjs built-in feature
};

type MasterObject =
  | MasterTextObject
  | MasterImageObject
  | MasterRectObject
  | MasterLineObject;

type MasterTextObject = {
  type: "text";
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontPx?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  alignText?: "left" | "center" | "right";
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
  fontPx?: number;
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
```

## Notes

- All coordinates and dimensions are specified in **pixels** (px)
- Coordinates are converted internally to inches (96 DPI)
- The `slideNumber` option uses pptxgenjs's built-in page number feature
