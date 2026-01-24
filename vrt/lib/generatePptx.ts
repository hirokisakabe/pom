import { POMNode, buildPptx } from "../../src";

const palette = {
  background: "F8FAFC",
  navy: "0F172A",
  blue: "1D4ED8",
  lightBlue: "DBEAFE",
  accent: "0EA5E9",
  border: "E2E8F0",
  charcoal: "1E293B",
  red: "DC2626",
  green: "16A34A",
};

// ============================================================
// Page 1: Text Node Test
// テスト対象: fontPx, color, alignText, bold, fontFamily, lineSpacingMultiple
// ============================================================
const page1Text: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 1: Text Node Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    // fontPx variations
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "fontPx:", fontPx: 14, bold: true },
          {
            type: "hstack",
            gap: 24,
            alignItems: "end",
            children: [
              { type: "text", text: "12px", fontPx: 12 },
              { type: "text", text: "18px", fontPx: 18 },
              { type: "text", text: "24px", fontPx: 24 },
              { type: "text", text: "36px", fontPx: 36 },
            ],
          },
        ],
      },
    },
    // color variations
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "color:", fontPx: 14, bold: true },
          {
            type: "hstack",
            gap: 24,
            alignItems: "center",
            children: [
              {
                type: "text",
                text: "charcoal",
                fontPx: 16,
                color: palette.charcoal,
              },
              { type: "text", text: "blue", fontPx: 16, color: palette.blue },
              { type: "text", text: "red", fontPx: 16, color: palette.red },
              { type: "text", text: "green", fontPx: 16, color: palette.green },
            ],
          },
        ],
      },
    },
    // alignText variations
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "alignText:", fontPx: 14, bold: true },
          {
            type: "vstack",
            gap: 4,
            children: [
              {
                type: "box",
                w: "100%",
                backgroundColor: palette.lightBlue,
                padding: 8,
                children: {
                  type: "text",
                  text: "left (default)",
                  fontPx: 14,
                  alignText: "left",
                },
              },
              {
                type: "box",
                w: "100%",
                backgroundColor: palette.lightBlue,
                padding: 8,
                children: {
                  type: "text",
                  text: "center",
                  fontPx: 14,
                  alignText: "center",
                },
              },
              {
                type: "box",
                w: "100%",
                backgroundColor: palette.lightBlue,
                padding: 8,
                children: {
                  type: "text",
                  text: "right",
                  fontPx: 14,
                  alignText: "right",
                },
              },
            ],
          },
        ],
      },
    },
    // bold variations
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "bold:", fontPx: 14, bold: true },
          {
            type: "hstack",
            gap: 24,
            alignItems: "center",
            children: [
              { type: "text", text: "Normal text", fontPx: 16 },
              { type: "text", text: "Bold text", fontPx: 16, bold: true },
            ],
          },
        ],
      },
    },
    // fontFamily & lineSpacingMultiple
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "fontFamily:", fontPx: 14, bold: true },
              {
                type: "text",
                text: "Noto Sans JP",
                fontPx: 16,
                fontFamily: "Noto Sans JP",
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "lineSpacingMultiple:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "text",
                text: "Line 1\nLine 2\nLine 3",
                fontPx: 14,
                lineSpacingMultiple: 1.5,
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 2: Bullet Test
// テスト対象: bullet: true, type, numberType, numberStartAt
// ============================================================
const page2Bullet: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 2: Bullet Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "bullet: true",
                fontPx: 14,
                bold: true,
              },
              {
                type: "text",
                text: "Item A\nItem B\nItem C",
                fontPx: 14,
                bullet: true,
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: 'type: "number"',
                fontPx: 14,
                bold: true,
              },
              {
                type: "text",
                text: "First\nSecond\nThird",
                fontPx: 14,
                bullet: { type: "number" },
              },
            ],
          },
        },
      ],
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "alphaLcPeriod (a. b. c.)",
                fontPx: 14,
                bold: true,
              },
              {
                type: "text",
                text: "Alpha\nBeta\nGamma",
                fontPx: 14,
                bullet: { type: "number", numberType: "alphaLcPeriod" },
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "romanLcPeriod (i. ii. iii.)",
                fontPx: 14,
                bold: true,
              },
              {
                type: "text",
                text: "Roman I\nRoman II\nRoman III",
                fontPx: 14,
                bullet: { type: "number", numberType: "romanLcPeriod" },
              },
            ],
          },
        },
      ],
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 8,
        children: [
          {
            type: "text",
            text: "numberStartAt: 5",
            fontPx: 14,
            bold: true,
          },
          {
            type: "text",
            text: "Starts at 5\nContinues 6\nAnd 7",
            fontPx: 14,
            bullet: { type: "number", numberStartAt: 5 },
          },
        ],
      },
    },
  ],
};

// ============================================================
// Page 3: Image Test
// テスト対象: src, w, h
// ============================================================
const page3Image: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 3: Image Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Size variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 24,
            alignItems: "end",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "image",
                    src: "https://raw.githubusercontent.com/hirokisakabe/pom/main/sample_images/sample_0.png",
                    w: 60,
                    h: 60,
                  },
                  { type: "text", text: "60x60", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "image",
                    src: "https://raw.githubusercontent.com/hirokisakabe/pom/main/sample_images/sample_1.png",
                    w: 120,
                    h: 90,
                  },
                  { type: "text", text: "120x90", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "image",
                    src: "https://raw.githubusercontent.com/hirokisakabe/pom/main/sample_images/sample_0.png",
                    w: 180,
                    h: 135,
                  },
                  { type: "text", text: "180x135", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Image with container styling:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "start",
            children: [
              {
                type: "box",
                padding: 12,
                backgroundColor: palette.lightBlue,
                border: { color: palette.blue, width: 2 },
                children: {
                  type: "image",
                  src: "https://raw.githubusercontent.com/hirokisakabe/pom/main/sample_images/sample_0.png",
                  w: 80,
                  h: 80,
                },
              },
              {
                type: "vstack",
                gap: 4,
                children: [
                  {
                    type: "text",
                    text: "Image in styled Box",
                    fontPx: 16,
                    bold: true,
                  },
                  {
                    type: "text",
                    text: "Box with padding, backgroundColor, border",
                    fontPx: 12,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============================================================
// Page 4: Table Test
// テスト対象: columns, rows, defaultRowHeight, セルプロパティ
// ============================================================
const page4Table: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 4: Table Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Basic table (header + data rows):",
            fontPx: 14,
            bold: true,
          },
          {
            type: "table",
            defaultRowHeight: 32,
            columns: [{ width: 100 }, { width: 200 }, { width: 100 }],
            rows: [
              {
                cells: [
                  {
                    text: "ID",
                    fontPx: 14,
                    bold: true,
                    backgroundColor: palette.lightBlue,
                  },
                  {
                    text: "Name",
                    fontPx: 14,
                    bold: true,
                    backgroundColor: palette.lightBlue,
                  },
                  {
                    text: "Status",
                    fontPx: 14,
                    bold: true,
                    backgroundColor: palette.lightBlue,
                  },
                ],
              },
              {
                cells: [
                  { text: "001", fontPx: 13 },
                  { text: "Item Alpha", fontPx: 13 },
                  { text: "Active", fontPx: 13 },
                ],
              },
              {
                cells: [
                  { text: "002", fontPx: 13 },
                  { text: "Item Beta", fontPx: 13 },
                  { text: "Pending", fontPx: 13 },
                ],
              },
              {
                cells: [
                  { text: "003", fontPx: 13 },
                  { text: "Item Gamma", fontPx: 13 },
                  { text: "Done", fontPx: 13 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Cell alignText (left / center / right):",
            fontPx: 14,
            bold: true,
          },
          {
            type: "table",
            defaultRowHeight: 32,
            columns: [{ width: 150 }, { width: 150 }, { width: 150 }],
            rows: [
              {
                cells: [
                  {
                    text: "Left",
                    fontPx: 13,
                    alignText: "left",
                    backgroundColor: palette.lightBlue,
                  },
                  {
                    text: "Center",
                    fontPx: 13,
                    alignText: "center",
                    backgroundColor: palette.lightBlue,
                  },
                  {
                    text: "Right",
                    fontPx: 13,
                    alignText: "right",
                    backgroundColor: palette.lightBlue,
                  },
                ],
              },
              {
                cells: [
                  { text: "Aligned left", fontPx: 13, alignText: "left" },
                  { text: "Aligned center", fontPx: 13, alignText: "center" },
                  { text: "Aligned right", fontPx: 13, alignText: "right" },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Cell backgroundColor & color:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "table",
            defaultRowHeight: 32,
            columns: [{ width: 150 }, { width: 150 }, { width: 150 }],
            rows: [
              {
                cells: [
                  {
                    text: "Light Blue BG",
                    fontPx: 13,
                    backgroundColor: palette.lightBlue,
                  },
                  {
                    text: "Navy BG + White",
                    fontPx: 13,
                    backgroundColor: palette.navy,
                    color: "FFFFFF",
                  },
                  {
                    text: "Blue text",
                    fontPx: 13,
                    color: palette.blue,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Column width omitted (auto equal split):",
            fontPx: 14,
            bold: true,
          },
          {
            type: "table",
            w: 450,
            defaultRowHeight: 32,
            columns: [{}, {}, {}],
            rows: [
              {
                cells: [
                  {
                    text: "Col 1",
                    fontPx: 13,
                    backgroundColor: palette.lightBlue,
                    bold: true,
                  },
                  {
                    text: "Col 2",
                    fontPx: 13,
                    backgroundColor: palette.lightBlue,
                    bold: true,
                  },
                  {
                    text: "Col 3",
                    fontPx: 13,
                    backgroundColor: palette.lightBlue,
                    bold: true,
                  },
                ],
              },
              {
                cells: [
                  { text: "150px each", fontPx: 13 },
                  { text: "150px each", fontPx: 13 },
                  { text: "150px each", fontPx: 13 },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============================================================
// Page 5: Shape Test
// テスト対象: shapeType, fill, line, shadow, text
// ============================================================
const page5Shape: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 5: Shape Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "shapeType variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 24,
            alignItems: "end",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 60,
                    h: 40,
                    fill: { color: palette.lightBlue },
                    line: { color: palette.blue, width: 2 },
                  },
                  { type: "text", text: "rect", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "ellipse",
                    w: 60,
                    h: 40,
                    fill: { color: palette.lightBlue },
                    line: { color: palette.blue, width: 2 },
                  },
                  { type: "text", text: "ellipse", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "triangle",
                    w: 60,
                    h: 40,
                    fill: { color: palette.lightBlue },
                    line: { color: palette.blue, width: 2 },
                  },
                  { type: "text", text: "triangle", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "roundRect",
                    w: 60,
                    h: 40,
                    fill: { color: palette.lightBlue },
                    line: { color: palette.blue, width: 2 },
                  },
                  { type: "text", text: "roundRect", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "fill & line combinations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 24,
            alignItems: "end",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 60,
                    h: 40,
                    fill: { color: palette.blue },
                  },
                  { type: "text", text: "fill only", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 60,
                    h: 40,
                    line: { color: palette.blue, width: 2 },
                  },
                  { type: "text", text: "line only", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 60,
                    h: 40,
                    fill: { color: palette.lightBlue },
                    line: { color: palette.blue, width: 2 },
                  },
                  { type: "text", text: "fill + line", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "line.dashType variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 24,
            alignItems: "end",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 80,
                    h: 40,
                    line: {
                      color: palette.charcoal,
                      width: 2,
                      dashType: "solid",
                    },
                  },
                  { type: "text", text: "solid", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 80,
                    h: 40,
                    line: {
                      color: palette.charcoal,
                      width: 2,
                      dashType: "dash",
                    },
                  },
                  { type: "text", text: "dash", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "rect",
                    w: 80,
                    h: 40,
                    line: {
                      color: palette.charcoal,
                      width: 2,
                      dashType: "dashDot",
                    },
                  },
                  { type: "text", text: "dashDot", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Shape with text:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 24,
            alignItems: "center",
            children: [
              {
                type: "shape",
                shapeType: "ellipse",
                w: 80,
                h: 80,
                text: "Circle",
                fontPx: 14,
                fill: { color: palette.lightBlue },
                line: { color: palette.blue, width: 2 },
              },
              {
                type: "shape",
                shapeType: "rect",
                w: 100,
                h: 50,
                text: "Rectangle",
                fontPx: 14,
                bold: true,
                fill: { color: palette.navy },
                color: "FFFFFF",
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============================================================
// Page 6: Chart Test
// テスト対象: chartType, data, showLegend, showTitle, chartColors
// ============================================================
const page6Chart: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 6: Chart Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "Bar Chart", fontPx: 14, bold: true },
              {
                type: "chart",
                chartType: "bar",
                w: 400,
                h: 180,
                data: [
                  {
                    name: "Sales",
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    values: [100, 200, 150, 300],
                  },
                  {
                    name: "Profit",
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    values: [30, 60, 45, 90],
                  },
                ],
                showLegend: true,
                chartColors: ["0088CC", "00AA00"],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "Line Chart", fontPx: 14, bold: true },
              {
                type: "chart",
                chartType: "line",
                w: 400,
                h: 180,
                data: [
                  {
                    name: "Revenue",
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    values: [50, 80, 60, 120, 100, 150],
                  },
                ],
                showLegend: true,
                chartColors: [palette.blue],
              },
            ],
          },
        },
      ],
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "Pie Chart (with title)",
                fontPx: 14,
                bold: true,
              },
              {
                type: "chart",
                chartType: "pie",
                w: 400,
                h: 180,
                data: [
                  {
                    name: "Share",
                    labels: ["A", "B", "C", "D"],
                    values: [40, 30, 20, 10],
                  },
                ],
                showLegend: true,
                showTitle: true,
                title: "Market Share",
                chartColors: ["0088CC", "00AA00", "FF6600", "888888"],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "Bar Chart (with title)",
                fontPx: 14,
                bold: true,
              },
              {
                type: "chart",
                chartType: "bar",
                w: 400,
                h: 180,
                data: [
                  {
                    name: "2023",
                    labels: ["N", "S", "E", "W"],
                    values: [250, 180, 220, 150],
                  },
                  {
                    name: "2024",
                    labels: ["N", "S", "E", "W"],
                    values: [300, 200, 250, 180],
                  },
                ],
                showLegend: true,
                showTitle: true,
                title: "Regional Sales",
                chartColors: [palette.blue, palette.accent],
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 7: Layout Test (VStack / HStack / Box)
// テスト対象: gap, alignItems, justifyContent
// ============================================================
const page7Layout: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 7: Layout Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          { type: "text", text: "HStack gap:", fontPx: 14, bold: true },
          {
            type: "hstack",
            gap: 8,
            alignItems: "stretch",
            children: [
              {
                type: "box",
                padding: 8,
                backgroundColor: palette.lightBlue,
                children: {
                  type: "hstack",
                  gap: 8,
                  children: [
                    {
                      type: "box",
                      w: 40,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                    {
                      type: "box",
                      w: 40,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                    {
                      type: "box",
                      w: 40,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                  ],
                },
              },
              { type: "text", text: "gap: 8", fontPx: 12 },
              {
                type: "box",
                padding: 8,
                backgroundColor: palette.lightBlue,
                children: {
                  type: "hstack",
                  gap: 32,
                  children: [
                    {
                      type: "box",
                      w: 40,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                    {
                      type: "box",
                      w: 40,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                    {
                      type: "box",
                      w: 40,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                  ],
                },
              },
              { type: "text", text: "gap: 32", fontPx: 12 },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "HStack alignItems:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "stretch",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 120,
                    h: 60,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      alignItems: "start",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 20,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 40,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "start", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 120,
                    h: 60,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      alignItems: "center",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 20,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 40,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "center", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 120,
                    h: 60,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      alignItems: "end",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 20,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 40,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "end", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 120,
                    h: 60,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      alignItems: "stretch",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "stretch", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "HStack justifyContent:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "stretch",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 140,
                    h: 40,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      justifyContent: "start",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "start", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 140,
                    h: 40,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      justifyContent: "center",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "center", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 140,
                    h: 40,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      gap: 4,
                      justifyContent: "end",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "end", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 140,
                    h: 40,
                    padding: 4,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "hstack",
                      justifyContent: "spaceBetween",
                      children: [
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                        {
                          type: "box",
                          w: 30,
                          h: 30,
                          backgroundColor: palette.blue,
                          children: { type: "text", text: "" },
                        },
                      ],
                    },
                  },
                  { type: "text", text: "spaceBetween", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============================================================
// Page 8: Common Properties Test
// テスト対象: w/h, padding, backgroundColor, border
// ============================================================
const page8Common: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 8: Common Properties Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "w/h variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "end",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 80,
                    h: 40,
                    backgroundColor: palette.blue,
                    children: { type: "text", text: "" },
                  },
                  { type: "text", text: "w:80, h:40", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: "30%",
                    h: 40,
                    backgroundColor: palette.blue,
                    children: { type: "text", text: "" },
                  },
                  { type: "text", text: 'w:"30%"', fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "padding variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "start",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    padding: 8,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "box",
                      w: 60,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                  },
                  { type: "text", text: "padding: 8", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    padding: 24,
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "box",
                      w: 60,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                  },
                  { type: "text", text: "padding: 24", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    padding: { top: 20, right: 8, bottom: 4, left: 8 },
                    backgroundColor: palette.lightBlue,
                    children: {
                      type: "box",
                      w: 60,
                      h: 30,
                      backgroundColor: palette.blue,
                      children: { type: "text", text: "" },
                    },
                  },
                  { type: "text", text: "top:20, bottom:4", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "border variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "center",
            children: [
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 80,
                    h: 40,
                    border: { color: palette.charcoal, width: 1 },
                    children: { type: "text", text: "" },
                  },
                  { type: "text", text: "width: 1", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 80,
                    h: 40,
                    border: { color: palette.charcoal, width: 3 },
                    children: { type: "text", text: "" },
                  },
                  { type: "text", text: "width: 3", fontPx: 12 },
                ],
              },
              {
                type: "vstack",
                gap: 4,
                alignItems: "center",
                children: [
                  {
                    type: "box",
                    w: 80,
                    h: 40,
                    border: { color: palette.blue, width: 2 },
                    children: { type: "text", text: "" },
                  },
                  { type: "text", text: "color: blue", fontPx: 12 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "backgroundColor variations:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "hstack",
            gap: 16,
            alignItems: "center",
            children: [
              {
                type: "box",
                w: 80,
                h: 40,
                backgroundColor: palette.lightBlue,
                children: { type: "text", text: "" },
              },
              {
                type: "box",
                w: 80,
                h: 40,
                backgroundColor: palette.navy,
                borderRadius: 8,
                children: { type: "text", text: "" },
              },
              {
                type: "box",
                w: 80,
                h: 40,
                backgroundColor: palette.blue,
                borderRadius: 16,
                children: { type: "text", text: "" },
              },
              {
                type: "box",
                w: 80,
                h: 40,
                backgroundColor: palette.green,
                borderRadius: 20,
                children: { type: "text", text: "" },
              },
            ],
          },
        ],
      },
    },
  ],
};

// ============================================================
// Page 9: Timeline Test
// テスト対象: direction (horizontal/vertical), items, color
// ============================================================
const page9Timeline: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 9: Timeline Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Horizontal Timeline (Roadmap):",
            fontPx: 14,
            bold: true,
          },
          {
            type: "timeline",
            direction: "horizontal",
            w: 1100,
            h: 120,
            items: [
              {
                date: "2025/Q1",
                title: "Phase 1",
                description: "基盤構築",
                color: "4CAF50",
              },
              {
                date: "2025/Q2",
                title: "Phase 2",
                description: "機能開発",
                color: "2196F3",
              },
              {
                date: "2025/Q3",
                title: "Phase 3",
                description: "テスト",
                color: "FF9800",
              },
              {
                date: "2025/Q4",
                title: "Phase 4",
                description: "リリース",
                color: "E91E63",
              },
            ],
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Vertical Timeline (Project Plan):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "timeline",
                direction: "vertical",
                w: 500,
                h: 300,
                items: [
                  {
                    date: "Week 1",
                    title: "Planning",
                    description: "要件定義・設計",
                    color: palette.blue,
                  },
                  {
                    date: "Week 2-3",
                    title: "Development",
                    description: "実装・レビュー",
                    color: palette.accent,
                  },
                  {
                    date: "Week 4",
                    title: "Release",
                    description: "デプロイ・監視",
                    color: palette.green,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Milestones (Default color):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "timeline",
                direction: "vertical",
                w: 500,
                h: 300,
                items: [
                  { date: "Jan", title: "Kickoff" },
                  { date: "Mar", title: "MVP Launch" },
                  { date: "Jun", title: "GA Release" },
                  { date: "Dec", title: "v2.0" },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 10: Additional Chart Types Test
// テスト対象: area, doughnut, radar
// ============================================================
const page10ChartAdditional: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 10: Additional Chart Types",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "33%",
          padding: 12,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "Area Chart", fontPx: 14, bold: true },
              {
                type: "chart",
                chartType: "area",
                w: 350,
                h: 200,
                data: [
                  {
                    name: "Revenue",
                    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                    values: [30, 50, 40, 70, 60],
                  },
                ],
                showLegend: true,
                chartColors: ["0088CC"],
              },
            ],
          },
        },
        {
          type: "box",
          w: "33%",
          padding: 12,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "Doughnut Chart", fontPx: 14, bold: true },
              {
                type: "chart",
                chartType: "doughnut",
                w: 350,
                h: 200,
                data: [
                  {
                    name: "Share",
                    labels: ["A", "B", "C", "D"],
                    values: [35, 25, 25, 15],
                  },
                ],
                showLegend: true,
                chartColors: ["0088CC", "00AA00", "FF6600", "888888"],
              },
            ],
          },
        },
        {
          type: "box",
          w: "33%",
          padding: 12,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "Radar Chart", fontPx: 14, bold: true },
              {
                type: "chart",
                chartType: "radar",
                w: 350,
                h: 200,
                data: [
                  {
                    name: "Skills",
                    labels: ["Tech", "Design", "PM", "Sales", "Support"],
                    values: [80, 60, 70, 50, 90],
                  },
                ],
                showLegend: true,
                chartColors: ["0088CC"],
                radarStyle: "filled",
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 11: Matrix Test
// テスト対象: axes, quadrants, items, coordinate system
// ============================================================
const page11Matrix: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 11: Matrix Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Cost-Effectiveness Matrix (with quadrants):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "matrix",
                w: 500,
                h: 400,
                axes: { x: "コスト", y: "効果" },
                quadrants: {
                  topLeft: "低コスト高効果\n（優先実施）",
                  topRight: "高コスト高効果\n（検討）",
                  bottomLeft: "低コスト低効果\n（様子見）",
                  bottomRight: "高コスト低効果\n（見送り）",
                },
                items: [
                  { label: "施策A", x: 0.2, y: 0.8, color: "4CAF50" },
                  { label: "施策B", x: 0.7, y: 0.6, color: "2196F3" },
                  { label: "施策C", x: 0.3, y: 0.3, color: "FF9800" },
                  { label: "施策D", x: 0.8, y: 0.2, color: "E91E63" },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Impact-Effort Matrix (without quadrants):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "matrix",
                w: 500,
                h: 400,
                axes: { x: "Effort", y: "Impact" },
                items: [
                  { label: "Quick Win", x: 0.15, y: 0.85 },
                  { label: "Major Project", x: 0.75, y: 0.75 },
                  { label: "Fill-In", x: 0.25, y: 0.25 },
                  { label: "Time Sink", x: 0.85, y: 0.15 },
                  { label: "Feature X", x: 0.5, y: 0.5 },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 12: Tree Node Test
// テスト対象: TreeNode - layout, nodeShape, data, connectorStyle
// ============================================================
const page12Tree: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 12: Tree Node Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Vertical Tree (Organization Chart):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "tree",
                layout: "vertical",
                nodeShape: "roundRect",
                w: 550,
                h: 350,
                data: {
                  label: "CEO",
                  color: "1D4ED8",
                  children: [
                    {
                      label: "CTO",
                      color: "0EA5E9",
                      children: [
                        { label: "Engineer A" },
                        { label: "Engineer B" },
                      ],
                    },
                    {
                      label: "CFO",
                      color: "16A34A",
                      children: [{ label: "Accountant" }],
                    },
                  ],
                },
                connectorStyle: { color: "333333", width: 2 },
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Horizontal Tree (Decision Tree):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "tree",
                layout: "horizontal",
                nodeShape: "rect",
                w: 550,
                h: 350,
                data: {
                  label: "Start",
                  children: [
                    {
                      label: "Option A",
                      children: [{ label: "Result 1" }, { label: "Result 2" }],
                    },
                    {
                      label: "Option B",
                      children: [{ label: "Result 3" }],
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Ellipse Nodes:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "tree",
                layout: "vertical",
                nodeShape: "ellipse",
                w: 550,
                h: 200,
                nodeWidth: 100,
                nodeHeight: 50,
                data: {
                  label: "Root",
                  color: "DC2626",
                  children: [
                    { label: "Child 1", color: "2563EB" },
                    { label: "Child 2", color: "16A34A" },
                    { label: "Child 3", color: "CA8A04" },
                  ],
                },
                connectorStyle: { color: "64748B", width: 1 },
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Custom Spacing:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "tree",
                layout: "horizontal",
                nodeShape: "roundRect",
                w: 550,
                h: 200,
                nodeWidth: 80,
                nodeHeight: 30,
                levelGap: 80,
                siblingGap: 10,
                data: {
                  label: "A",
                  children: [
                    { label: "B", children: [{ label: "D" }, { label: "E" }] },
                    { label: "C", children: [{ label: "F" }] },
                  ],
                },
                connectorStyle: { color: "0EA5E9", width: 3 },
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 13: Flow Node Test
// テスト対象: FlowNode - direction, nodes, connections, connectorStyle
// ============================================================
const page13Flow: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 13: Flow Node Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Horizontal Flow (Basic Process):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "flow",
                direction: "horizontal",
                w: 550,
                h: 150,
                nodes: [
                  { id: "start", shape: "flowChartTerminator", text: "開始" },
                  { id: "process1", shape: "flowChartProcess", text: "処理A" },
                  { id: "process2", shape: "flowChartProcess", text: "処理B" },
                  { id: "end", shape: "flowChartTerminator", text: "終了" },
                ],
                connections: [
                  { from: "start", to: "process1" },
                  { from: "process1", to: "process2" },
                  { from: "process2", to: "end" },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Vertical Flow (Simple):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "flow",
                direction: "vertical",
                w: 550,
                h: 300,
                nodes: [
                  {
                    id: "start",
                    shape: "flowChartTerminator",
                    text: "開始",
                    color: "4CAF50",
                  },
                  {
                    id: "input",
                    shape: "flowChartInputOutput",
                    text: "データ入力",
                  },
                  { id: "process", shape: "flowChartProcess", text: "処理" },
                  {
                    id: "end",
                    shape: "flowChartTerminator",
                    text: "終了",
                    color: "E91E63",
                  },
                ],
                connections: [
                  { from: "start", to: "input" },
                  { from: "input", to: "process" },
                  { from: "process", to: "end" },
                ],
                connectorStyle: { color: "333333", width: 2 },
              },
            ],
          },
        },
      ],
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Flow with Decision:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "flow",
                direction: "horizontal",
                w: 550,
                h: 150,
                nodes: [
                  { id: "start", shape: "flowChartTerminator", text: "開始" },
                  {
                    id: "decision",
                    shape: "flowChartDecision",
                    text: "条件?",
                    color: "FF9800",
                  },
                  {
                    id: "yes",
                    shape: "flowChartProcess",
                    text: "Yes処理",
                    color: "4CAF50",
                  },
                  { id: "end", shape: "flowChartTerminator", text: "終了" },
                ],
                connections: [
                  { from: "start", to: "decision" },
                  { from: "decision", to: "yes", label: "Yes" },
                  { from: "yes", to: "end" },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Custom Node Colors:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "flow",
                direction: "horizontal",
                w: 550,
                h: 150,
                nodes: [
                  {
                    id: "doc",
                    shape: "flowChartDocument",
                    text: "ドキュメント",
                    color: "2196F3",
                  },
                  {
                    id: "db",
                    shape: "flowChartMagneticDisk",
                    text: "DB",
                    color: "9C27B0",
                  },
                  {
                    id: "prep",
                    shape: "flowChartPreparation",
                    text: "準備",
                    color: "009688",
                  },
                ],
                connections: [
                  { from: "doc", to: "db" },
                  { from: "db", to: "prep" },
                ],
                connectorStyle: {
                  color: "64748B",
                  width: 2,
                  arrowType: "arrow",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 14: ProcessArrow Node Test
// テスト対象: ProcessArrowNode - direction, steps, itemWidth, itemHeight, gap
// ============================================================
const page14ProcessArrow: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 14: ProcessArrow Node Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Horizontal Process Arrow (5 steps with colors):",
            fontPx: 14,
            bold: true,
          },
          {
            type: "processArrow",
            direction: "horizontal",
            w: 1100,
            h: 80,
            steps: [
              { label: "企画", color: "#4472C4" },
              { label: "設計", color: "#5B9BD5" },
              { label: "開発", color: "#70AD47" },
              { label: "テスト", color: "#FFC000" },
              { label: "リリース", color: "#ED7D31" },
            ],
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "3 Steps (Auto width):",
                fontPx: 14,
                bold: true,
              },
              {
                type: "processArrow",
                direction: "horizontal",
                w: 500,
                h: 60,
                steps: [
                  { label: "Input" },
                  { label: "Process" },
                  { label: "Output" },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Single Step:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "processArrow",
                direction: "horizontal",
                w: 500,
                h: 60,
                steps: [{ label: "Only One Step", color: "#E91E63" }],
              },
            ],
          },
        },
      ],
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 1 },
      children: {
        type: "vstack",
        gap: 12,
        children: [
          {
            type: "text",
            text: "Custom itemWidth, itemHeight & fontPx:",
            fontPx: 14,
            bold: true,
          },
          {
            type: "processArrow",
            direction: "horizontal",
            w: 1100,
            h: 100,
            itemWidth: 200,
            itemHeight: 80,
            fontPx: 18,
            bold: true,
            steps: [
              { label: "Step 1", color: "#2196F3" },
              { label: "Step 2", color: "#00BCD4" },
              { label: "Step 3", color: "#009688" },
            ],
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Vertical Process Arrow:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "processArrow",
                direction: "vertical",
                w: 200,
                h: 250,
                steps: [
                  { label: "Phase 1", color: "#4CAF50" },
                  { label: "Phase 2", color: "#2196F3" },
                  { label: "Phase 3", color: "#9C27B0" },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Custom textColor:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "processArrow",
                direction: "horizontal",
                w: 500,
                h: 60,
                steps: [
                  { label: "Light BG", color: "#FFEB3B", textColor: "#333333" },
                  { label: "Dark BG", color: "#1E293B", textColor: "#FFFFFF" },
                  { label: "Blue BG", color: "#1D4ED8", textColor: "#FFFFFF" },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================================
// Page 15: Diagram Node Test
// テスト対象: DiagramNode - areas, elements, connections, splitConnections
// ============================================================
const page15Diagram: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Page 15: Diagram Node Test",
      fontPx: 28,
      color: palette.charcoal,
      bold: true,
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        // 左カラム: 基本的なダイアグラム
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Basic Network Diagram:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "diagram",
                w: 550,
                h: 250,
                areas: [
                  {
                    x: 10,
                    y: 10,
                    w: 150,
                    h: 230,
                    label: "クライアント",
                    labelPosition: "topCenter",
                    fill: { color: "EBF5FF" },
                    border: { color: "93C5FD", width: 1 },
                    borderRadius: 8,
                  },
                  {
                    x: 380,
                    y: 10,
                    w: 160,
                    h: 230,
                    label: "サーバー",
                    labelPosition: "topCenter",
                    fill: { color: "F0FDF4" },
                    border: { color: "86EFAC", width: 1 },
                    borderRadius: 8,
                  },
                ],
                elements: [
                  {
                    id: "pc1",
                    x: 40,
                    y: 60,
                    w: 90,
                    h: 50,
                    shape: "rect",
                    text: "PC",
                    fill: { color: "3B82F6" },
                  },
                  {
                    id: "pc2",
                    x: 40,
                    y: 140,
                    w: 90,
                    h: 50,
                    shape: "rect",
                    text: "Mobile",
                    fill: { color: "3B82F6" },
                  },
                  {
                    id: "fw",
                    x: 220,
                    y: 100,
                    w: 100,
                    h: 50,
                    shape: "hexagon",
                    text: "FW",
                    fill: { color: "F59E0B" },
                  },
                  {
                    id: "web",
                    x: 410,
                    y: 60,
                    w: 100,
                    h: 50,
                    shape: "roundRect",
                    text: "Web",
                    fill: { color: "22C55E" },
                  },
                  {
                    id: "db",
                    x: 410,
                    y: 140,
                    w: 100,
                    h: 50,
                    shape: "can",
                    text: "DB",
                    fill: { color: "22C55E" },
                  },
                ],
                connections: [
                  { from: "pc1", to: "fw", arrowType: "end" },
                  { from: "pc2", to: "fw", arrowType: "end" },
                  { from: "fw", to: "web", arrowType: "end" },
                  { from: "fw", to: "db", arrowType: "end" },
                ],
              },
            ],
          },
        },
        // 右カラム: 分岐接続
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Split Connections:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "diagram",
                w: 550,
                h: 250,
                elements: [
                  {
                    id: "source",
                    x: 225,
                    y: 20,
                    w: 100,
                    h: 50,
                    shape: "roundRect",
                    text: "Source",
                    fill: { color: "6366F1" },
                  },
                  {
                    id: "dest1",
                    x: 50,
                    y: 180,
                    w: 100,
                    h: 50,
                    shape: "roundRect",
                    text: "Dest 1",
                    fill: { color: "EC4899" },
                  },
                  {
                    id: "dest2",
                    x: 225,
                    y: 180,
                    w: 100,
                    h: 50,
                    shape: "roundRect",
                    text: "Dest 2",
                    fill: { color: "EC4899" },
                  },
                  {
                    id: "dest3",
                    x: 400,
                    y: 180,
                    w: 100,
                    h: 50,
                    shape: "roundRect",
                    text: "Dest 3",
                    fill: { color: "EC4899" },
                  },
                ],
                splitConnections: [
                  {
                    from: "source",
                    fromAnchor: "bottom",
                    to: [
                      { id: "dest1", anchor: "top", label: "A" },
                      { id: "dest2", anchor: "top", label: "B" },
                      { id: "dest3", anchor: "top", label: "C" },
                    ],
                    color: "6366F1",
                    width: 2,
                    arrowType: "end",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        // 左カラム: 各種シェイプ
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Various Shapes:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "diagram",
                w: 550,
                h: 180,
                elements: [
                  {
                    id: "rect",
                    x: 10,
                    y: 10,
                    w: 80,
                    h: 50,
                    shape: "rect",
                    text: "rect",
                    fill: { color: "3B82F6" },
                  },
                  {
                    id: "roundRect",
                    x: 100,
                    y: 10,
                    w: 80,
                    h: 50,
                    shape: "roundRect",
                    text: "round",
                    fill: { color: "8B5CF6" },
                  },
                  {
                    id: "ellipse",
                    x: 190,
                    y: 10,
                    w: 80,
                    h: 50,
                    shape: "ellipse",
                    text: "ellipse",
                    fill: { color: "EC4899" },
                  },
                  {
                    id: "cloud",
                    x: 280,
                    y: 10,
                    w: 80,
                    h: 50,
                    shape: "cloud",
                    text: "cloud",
                    fill: { color: "06B6D4" },
                  },
                  {
                    id: "can",
                    x: 370,
                    y: 10,
                    w: 80,
                    h: 60,
                    shape: "can",
                    text: "can",
                    fill: { color: "10B981" },
                  },
                  {
                    id: "cube",
                    x: 460,
                    y: 10,
                    w: 80,
                    h: 60,
                    shape: "cube",
                    text: "cube",
                    fill: { color: "F59E0B" },
                  },
                  {
                    id: "hexagon",
                    x: 10,
                    y: 90,
                    w: 80,
                    h: 60,
                    shape: "hexagon",
                    text: "hexagon",
                    fontPx: 11,
                    fill: { color: "EF4444" },
                  },
                  {
                    id: "diamond",
                    x: 100,
                    y: 90,
                    w: 80,
                    h: 60,
                    shape: "diamond",
                    text: "?",
                    fill: { color: "84CC16" },
                  },
                  {
                    id: "parallelogram",
                    x: 190,
                    y: 90,
                    w: 100,
                    h: 50,
                    shape: "parallelogram",
                    text: "para",
                    fill: { color: "A855F7" },
                  },
                  {
                    id: "triangle",
                    x: 300,
                    y: 90,
                    w: 80,
                    h: 60,
                    shape: "triangle",
                    text: "!",
                    fill: { color: "F97316" },
                  },
                ],
              },
            ],
          },
        },
        // 右カラム: L字接続
        {
          type: "box",
          w: "50%",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "Elbow Connections:",
                fontPx: 14,
                bold: true,
              },
              {
                type: "diagram",
                w: 550,
                h: 180,
                elements: [
                  {
                    id: "a",
                    x: 30,
                    y: 30,
                    w: 80,
                    h: 50,
                    shape: "roundRect",
                    text: "A",
                    fill: { color: "3B82F6" },
                  },
                  {
                    id: "b",
                    x: 250,
                    y: 110,
                    w: 80,
                    h: 50,
                    shape: "roundRect",
                    text: "B",
                    fill: { color: "10B981" },
                  },
                  {
                    id: "c",
                    x: 450,
                    y: 30,
                    w: 80,
                    h: 50,
                    shape: "roundRect",
                    text: "C",
                    fill: { color: "F59E0B" },
                  },
                ],
                connections: [
                  {
                    from: "a",
                    to: "b",
                    fromAnchor: "right",
                    toAnchor: "left",
                    lineType: "elbow",
                    arrowType: "end",
                    color: "3B82F6",
                    width: 2,
                  },
                  {
                    from: "b",
                    to: "c",
                    fromAnchor: "right",
                    toAnchor: "bottom",
                    lineType: "elbow",
                    arrowType: "both",
                    color: "10B981",
                    width: 2,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};

export async function generatePptx(outputPath: string): Promise<void> {
  const pptx = await buildPptx(
    [
      page1Text,
      page2Bullet,
      page3Image,
      page4Table,
      page5Shape,
      page6Chart,
      page7Layout,
      page8Common,
      page9Timeline,
      page10ChartAdditional,
      page11Matrix,
      page12Tree,
      page13Flow,
      page14ProcessArrow,
      page15Diagram,
    ],
    {
      w: 1280,
      h: 720,
    },
    {
      master: {
        title: "VRT_MASTER",
        objects: [
          // ヘッダー背景
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 1280,
            h: 40,
            fill: { color: palette.navy },
          },
          // ヘッダーテキスト（左）
          {
            type: "text",
            text: "VRT Test Suite",
            x: 48,
            y: 12,
            w: 200,
            h: 28,
            fontPx: 14,
            color: "FFFFFF",
          },
          // ヘッダーテキスト（右）- 日付は固定値
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
          // フッターテキスト（左）
          {
            type: "text",
            text: "pom VRT",
            x: 48,
            y: 682,
            w: 200,
            h: 30,
            fontPx: 10,
            color: palette.charcoal,
          },
        ],
        slideNumber: {
          x: 1032,
          y: 682,
          w: 200,
          h: 30,
          fontPx: 10,
          color: palette.charcoal,
        },
      },
    },
  );

  await pptx.writeFile({ fileName: outputPath });
}
