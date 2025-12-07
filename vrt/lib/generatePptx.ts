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
                children: { type: "text", text: "" },
              },
              {
                type: "box",
                w: 80,
                h: 40,
                backgroundColor: palette.blue,
                children: { type: "text", text: "" },
              },
              {
                type: "box",
                w: 80,
                h: 40,
                backgroundColor: palette.green,
                children: { type: "text", text: "" },
              },
            ],
          },
        ],
      },
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
    ],
    {
      w: 1280,
      h: 720,
    },
    {
      master: {
        header: {
          type: "hstack",
          h: 40,
          padding: { left: 48, right: 48, top: 12, bottom: 0 },
          justifyContent: "spaceBetween",
          alignItems: "center",
          backgroundColor: palette.navy,
          children: [
            {
              type: "text",
              text: "VRT Test Suite",
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
              text: "pom VRT",
              fontPx: 10,
              color: palette.charcoal,
            },
            {
              type: "text",
              text: "Page {{page}} / {{totalPages}}",
              fontPx: 10,
              color: palette.charcoal,
              alignText: "right",
            },
          ],
        },
        date: {
          format: "YYYY/MM/DD",
        },
      },
    },
  );

  await pptx.writeFile({ fileName: outputPath });
}
