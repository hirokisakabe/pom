import type { POMNode } from "../../src/types.js";
import type { NodeType } from "./config.js";

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

export const textSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Text Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "hstack",
      gap: 40,
      children: [
        {
          type: "vstack",
          gap: 8,
          children: [
            { type: "text", text: "Font Sizes", fontPx: 14, bold: true },
            { type: "text", text: "12px text", fontPx: 12 },
            { type: "text", text: "18px text", fontPx: 18 },
            { type: "text", text: "24px text", fontPx: 24 },
          ],
        },
        {
          type: "vstack",
          gap: 8,
          children: [
            { type: "text", text: "Colors", fontPx: 14, bold: true },
            { type: "text", text: "Navy color", color: palette.navy },
            { type: "text", text: "Blue color", color: palette.blue },
            { type: "text", text: "Red color", color: palette.red },
          ],
        },
        {
          type: "vstack",
          gap: 8,
          children: [
            { type: "text", text: "Alignment", fontPx: 14, bold: true },
            {
              type: "text",
              text: "Left aligned",
              alignText: "left",
              w: 150,
              backgroundColor: palette.lightBlue,
            },
            {
              type: "text",
              text: "Center aligned",
              alignText: "center",
              w: 150,
              backgroundColor: palette.lightBlue,
            },
            {
              type: "text",
              text: "Right aligned",
              alignText: "right",
              w: 150,
              backgroundColor: palette.lightBlue,
            },
          ],
        },
        {
          type: "vstack",
          gap: 8,
          children: [
            { type: "text", text: "Bullet List", fontPx: 14, bold: true },
            {
              type: "text",
              text: "Item 1\nItem 2\nItem 3",
              fontPx: 14,
              bullet: true,
            },
          ],
        },
      ],
    },
  ],
};

const sampleImageUrl =
  "https://raw.githubusercontent.com/hirokisakabe/pom/main/sample_images/sample_0.png";

export const imageSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Image Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "hstack",
      gap: 40,
      alignItems: "center",
      children: [
        {
          type: "box",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: {
            type: "image",
            src: sampleImageUrl,
            w: 200,
            h: 150,
          },
        },
        {
          type: "box",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          borderRadius: 8,
          padding: 16,
          children: {
            type: "image",
            src: sampleImageUrl,
            w: 150,
            h: 150,
          },
        },
        {
          type: "box",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          borderRadius: 16,
          padding: 16,
          children: {
            type: "image",
            src: sampleImageUrl,
            w: 180,
            h: 120,
          },
        },
      ],
    },
  ],
};

export const tableSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Table Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "table",
      defaultRowHeight: 36,
      columns: [{ width: 80 }, { width: 200 }, { width: 100 }, { width: 120 }],
      rows: [
        {
          cells: [
            {
              text: "ID",
              bold: true,
              backgroundColor: palette.navy,
              color: "FFFFFF",
              alignText: "center",
            },
            {
              text: "Name",
              bold: true,
              backgroundColor: palette.navy,
              color: "FFFFFF",
              alignText: "center",
            },
            {
              text: "Status",
              bold: true,
              backgroundColor: palette.navy,
              color: "FFFFFF",
              alignText: "center",
            },
            {
              text: "Progress",
              bold: true,
              backgroundColor: palette.navy,
              color: "FFFFFF",
              alignText: "center",
            },
          ],
        },
        {
          cells: [
            { text: "001", alignText: "center" },
            { text: "Project Alpha" },
            { text: "Active", color: palette.green },
            { text: "75%", alignText: "right" },
          ],
        },
        {
          cells: [
            { text: "002", alignText: "center" },
            { text: "Project Beta" },
            { text: "Pending", color: palette.accent },
            { text: "30%", alignText: "right" },
          ],
        },
        {
          cells: [
            { text: "003", alignText: "center" },
            { text: "Project Gamma" },
            { text: "Complete", color: palette.blue },
            { text: "100%", alignText: "right" },
          ],
        },
      ],
    },
  ],
};

export const shapeSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Shape Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "hstack",
      gap: 32,
      alignItems: "center",
      children: [
        {
          type: "shape",
          shapeType: "rect",
          w: 120,
          h: 80,
          fill: { color: palette.blue },
          text: "Rectangle",
          color: "FFFFFF",
          fontPx: 14,
          alignText: "center",
        },
        {
          type: "shape",
          shapeType: "roundRect",
          w: 120,
          h: 80,
          fill: { color: palette.green },
          text: "Rounded",
          color: "FFFFFF",
          fontPx: 14,
          alignText: "center",
        },
        {
          type: "shape",
          shapeType: "ellipse",
          w: 100,
          h: 100,
          fill: { color: palette.accent },
          text: "Ellipse",
          color: "FFFFFF",
          fontPx: 14,
          alignText: "center",
        },
        {
          type: "shape",
          shapeType: "diamond",
          w: 100,
          h: 100,
          fill: { color: palette.red },
          text: "Diamond",
          color: "FFFFFF",
          fontPx: 12,
          alignText: "center",
        },
        {
          type: "shape",
          shapeType: "rightArrow",
          w: 140,
          h: 60,
          fill: { color: palette.navy },
          text: "Arrow",
          color: "FFFFFF",
          fontPx: 14,
          alignText: "center",
        },
      ],
    },
  ],
};

export const chartSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Chart Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "hstack",
      gap: 32,
      children: [
        {
          type: "chart",
          chartType: "bar",
          w: 350,
          h: 250,
          showTitle: true,
          title: "Bar Chart",
          showLegend: true,
          chartColors: [palette.blue, palette.green, palette.red],
          data: [
            { name: "Q1", labels: ["Jan", "Feb", "Mar"], values: [30, 45, 60] },
            { name: "Q2", labels: ["Jan", "Feb", "Mar"], values: [40, 55, 70] },
          ],
        },
        {
          type: "chart",
          chartType: "pie",
          w: 300,
          h: 250,
          showTitle: true,
          title: "Pie Chart",
          showLegend: true,
          chartColors: [
            palette.blue,
            palette.green,
            palette.accent,
            palette.red,
          ],
          data: [
            {
              labels: ["Category A", "Category B", "Category C", "Category D"],
              values: [35, 25, 25, 15],
            },
          ],
        },
        {
          type: "chart",
          chartType: "line",
          w: 350,
          h: 250,
          showTitle: true,
          title: "Line Chart",
          showLegend: true,
          chartColors: [palette.blue, palette.red],
          data: [
            {
              name: "2023",
              labels: ["Q1", "Q2", "Q3", "Q4"],
              values: [20, 35, 45, 60],
            },
            {
              name: "2024",
              labels: ["Q1", "Q2", "Q3", "Q4"],
              values: [30, 50, 55, 75],
            },
          ],
        },
      ],
    },
  ],
};

export const timelineSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Timeline Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "timeline",
      direction: "horizontal",
      w: "100%",
      h: 200,
      items: [
        {
          date: "2024 Q1",
          title: "Phase 1",
          description: "Planning & Research",
          color: palette.blue,
        },
        {
          date: "2024 Q2",
          title: "Phase 2",
          description: "Development",
          color: palette.green,
        },
        {
          date: "2024 Q3",
          title: "Phase 3",
          description: "Testing",
          color: palette.accent,
        },
        {
          date: "2024 Q4",
          title: "Phase 4",
          description: "Launch",
          color: palette.red,
        },
      ],
    },
  ],
};

export const matrixSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Matrix Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "matrix",
      w: 500,
      h: 400,
      axes: { x: "Cost", y: "Impact" },
      quadrants: {
        topLeft: "Low Cost\nHigh Impact",
        topRight: "High Cost\nHigh Impact",
        bottomLeft: "Low Cost\nLow Impact",
        bottomRight: "High Cost\nLow Impact",
      },
      items: [
        { label: "Project A", x: 0.2, y: 0.8, color: palette.green },
        { label: "Project B", x: 0.7, y: 0.85, color: palette.blue },
        { label: "Project C", x: 0.3, y: 0.3, color: palette.accent },
        { label: "Project D", x: 0.8, y: 0.2, color: palette.red },
      ],
    },
  ],
};

export const treeSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Tree Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "tree",
      layout: "vertical",
      nodeShape: "roundRect",
      w: "100%",
      h: 400,
      connectorStyle: { color: palette.charcoal, width: 2 },
      data: {
        label: "CEO",
        color: palette.navy,
        children: [
          {
            label: "CTO",
            color: palette.blue,
            children: [
              { label: "Dev Team", color: palette.accent },
              { label: "QA Team", color: palette.accent },
            ],
          },
          {
            label: "CFO",
            color: palette.green,
            children: [
              { label: "Finance", color: palette.accent },
              { label: "Accounting", color: palette.accent },
            ],
          },
          {
            label: "COO",
            color: palette.red,
            children: [
              { label: "Operations", color: palette.accent },
              { label: "HR", color: palette.accent },
            ],
          },
        ],
      },
    },
  ],
};

export const flowSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Flow Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "flow",
      direction: "horizontal",
      w: "100%",
      h: 300,
      connectorStyle: { color: palette.charcoal, width: 2 },
      nodes: [
        {
          id: "start",
          shape: "flowChartTerminator",
          text: "Start",
          color: palette.green,
        },
        {
          id: "input",
          shape: "flowChartInputOutput",
          text: "Input Data",
          color: palette.lightBlue,
        },
        {
          id: "process",
          shape: "flowChartProcess",
          text: "Process",
          color: palette.blue,
        },
        {
          id: "decision",
          shape: "flowChartDecision",
          text: "Valid?",
          color: palette.accent,
        },
        {
          id: "end",
          shape: "flowChartTerminator",
          text: "End",
          color: palette.red,
        },
      ],
      connections: [
        { from: "start", to: "input" },
        { from: "input", to: "process" },
        { from: "process", to: "decision" },
        { from: "decision", to: "end", label: "Yes" },
      ],
    },
  ],
};

export const boxSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "Box Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "hstack",
      gap: 32,
      children: [
        {
          type: "box",
          w: 200,
          h: 150,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: {
            type: "text",
            text: "Basic Box\nwith padding",
            fontPx: 14,
          },
        },
        {
          type: "box",
          w: 200,
          h: 150,
          backgroundColor: palette.lightBlue,
          border: { color: palette.blue, width: 2 },
          borderRadius: 8,
          padding: 16,
          children: {
            type: "text",
            text: "Rounded Box\nwith border",
            fontPx: 14,
            color: palette.navy,
          },
        },
        {
          type: "box",
          w: 200,
          h: 150,
          backgroundColor: palette.navy,
          borderRadius: 16,
          padding: 16,
          children: {
            type: "text",
            text: "Styled Box\nwith background",
            fontPx: 14,
            color: "FFFFFF",
          },
        },
      ],
    },
  ],
};

export const vstackSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "VStack Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "hstack",
      gap: 32,
      children: [
        {
          type: "vstack",
          w: 200,
          h: 250,
          gap: 8,
          alignItems: "start",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: [
            { type: "text", text: "alignItems: start", fontPx: 12, bold: true },
            {
              type: "shape",
              shapeType: "rect",
              w: 100,
              h: 40,
              fill: { color: palette.blue },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 80,
              h: 40,
              fill: { color: palette.green },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 120,
              h: 40,
              fill: { color: palette.red },
            },
          ],
        },
        {
          type: "vstack",
          w: 200,
          h: 250,
          gap: 8,
          alignItems: "center",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: [
            {
              type: "text",
              text: "alignItems: center",
              fontPx: 12,
              bold: true,
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 100,
              h: 40,
              fill: { color: palette.blue },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 80,
              h: 40,
              fill: { color: palette.green },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 120,
              h: 40,
              fill: { color: palette.red },
            },
          ],
        },
        {
          type: "vstack",
          w: 200,
          h: 250,
          gap: 8,
          alignItems: "end",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: [
            { type: "text", text: "alignItems: end", fontPx: 12, bold: true },
            {
              type: "shape",
              shapeType: "rect",
              w: 100,
              h: 40,
              fill: { color: palette.blue },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 80,
              h: 40,
              fill: { color: palette.green },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 120,
              h: 40,
              fill: { color: palette.red },
            },
          ],
        },
      ],
    },
  ],
};

export const hstackSample: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "HStack Node Example",
      fontPx: 28,
      bold: true,
      color: palette.navy,
    },
    {
      type: "vstack",
      gap: 16,
      children: [
        {
          type: "hstack",
          w: "100%",
          h: 80,
          gap: 16,
          justifyContent: "start",
          alignItems: "center",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: [
            {
              type: "text",
              text: "justifyContent: start",
              fontPx: 12,
              bold: true,
              w: 150,
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.blue },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.green },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.red },
            },
          ],
        },
        {
          type: "hstack",
          w: "100%",
          h: 80,
          gap: 16,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: [
            {
              type: "text",
              text: "justifyContent: center",
              fontPx: 12,
              bold: true,
              w: 150,
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.blue },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.green },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.red },
            },
          ],
        },
        {
          type: "hstack",
          w: "100%",
          h: 80,
          gap: 16,
          justifyContent: "spaceBetween",
          alignItems: "center",
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 1 },
          padding: 16,
          children: [
            {
              type: "text",
              text: "justifyContent: spaceBetween",
              fontPx: 12,
              bold: true,
              w: 180,
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.blue },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.green },
            },
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 40,
              fill: { color: palette.red },
            },
          ],
        },
      ],
    },
  ],
};

export const sampleNodes: Record<NodeType, POMNode> = {
  text: textSample,
  image: imageSample,
  table: tableSample,
  shape: shapeSample,
  chart: chartSample,
  timeline: timelineSample,
  matrix: matrixSample,
  tree: treeSample,
  flow: flowSample,
  box: boxSample,
  vstack: vstackSample,
  hstack: hstackSample,
};
