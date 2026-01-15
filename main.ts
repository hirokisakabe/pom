import { POMNode, buildPptx } from "./src";

const page: POMNode = {
  type: "vstack",
  w: 1280,
  h: 720,
  padding: { top: 24, bottom: 24, left: 48, right: 48 },
  gap: 24,
  backgroundColor: "F8FAFC",
  children: [
    {
      type: "text",
      text: "ProcessArrow Node Demo",
      fontPx: 32,
      bold: true,
      color: "1E293B",
    },
    // 水平方向のプロセスアロー
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: "E2E8F0", width: 1 },
      borderRadius: 8,
      children: {
        type: "vstack",
        gap: 16,
        children: [
          {
            type: "text",
            text: "Horizontal Process Arrow",
            fontPx: 18,
            bold: true,
            color: "334155",
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
    // 2カラムレイアウト
    {
      type: "hstack",
      gap: 24,
      children: [
        // 3ステップのプロセスアロー
        {
          type: "box",
          w: "50%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "E2E8F0", width: 1 },
          borderRadius: 8,
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "3 Steps (Default color)",
                fontPx: 16,
                bold: true,
                color: "334155",
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
        // カスタムスタイル
        {
          type: "box",
          w: "50%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "E2E8F0", width: 1 },
          borderRadius: 8,
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "Custom Style",
                fontPx: 16,
                bold: true,
                color: "334155",
              },
              {
                type: "processArrow",
                direction: "horizontal",
                w: 500,
                h: 70,
                itemWidth: 160,
                itemHeight: 60,
                fontPx: 16,
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
      ],
    },
    // 垂直方向と単一ステップ
    {
      type: "hstack",
      gap: 24,
      children: [
        {
          type: "box",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "E2E8F0", width: 1 },
          borderRadius: 8,
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "Vertical",
                fontPx: 16,
                bold: true,
                color: "334155",
              },
              {
                type: "processArrow",
                direction: "vertical",
                w: 150,
                h: 200,
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
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "E2E8F0", width: 1 },
          borderRadius: 8,
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "Single Step",
                fontPx: 16,
                bold: true,
                color: "334155",
              },
              {
                type: "processArrow",
                direction: "horizontal",
                w: 200,
                h: 60,
                steps: [{ label: "Only One", color: "#E91E63" }],
              },
            ],
          },
        },
        {
          type: "box",
          w: 600,
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "E2E8F0", width: 1 },
          borderRadius: 8,
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "Custom textColor",
                fontPx: 16,
                bold: true,
                color: "334155",
              },
              {
                type: "processArrow",
                direction: "horizontal",
                w: 550,
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

async function main() {
  const pptx = await buildPptx([page], {
    w: 1280,
    h: 720,
  });

  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
