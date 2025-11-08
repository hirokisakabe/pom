import { Node, layout, renderPptx } from "./src";

// 現在実装されている全機能を示すサンプルデータ
export const doc: Node = {
  type: "vstack",
  padding: 20,
  gap: 16,
  children: [
    // ========================================
    // セクション1: タイトル（中央揃え）
    // ========================================
    {
      type: "vstack",
      gap: 8,
      alignItems: "center",
      children: [
        {
          type: "text",
          text: "POM 機能デモ",
          fontPx: 36,
          alignText: "center",
          w: "max",
        },
        {
          type: "text",
          text: "VStack / HStack / Box / Text / Image",
          fontPx: 18,
          alignText: "center",
          w: "max",
        },
      ],
    },

    // ========================================
    // セクション2: 2カラムレイアウト
    // ========================================
    {
      type: "hstack",
      w: "max",
      gap: 16,
      justify: "center",
      children: [
        {
          type: "vstack",
          gap: 8,
          children: [
            {
              type: "text",
              text: "左カラム",
              fontPx: 20,
              alignText: "left",
            },
            {
              type: "text",
              text: "HStackで横並び配置",
              fontPx: 14,
              alignText: "left",
            },
            {
              type: "image",
              src: "https://placehold.co/400x300/4A90E2/FFFFFF?text=Left",
              w: 200,
              aspectRatio: 16 / 9,
            },
          ],
        },
        {
          type: "vstack",
          gap: 8,
          children: [
            {
              type: "text",
              text: "右カラム",
              fontPx: 20,
              alignText: "left",
            },
            {
              type: "text",
              text: "VStackで縦積み配置",
              fontPx: 14,
              alignText: "left",
            },
            {
              type: "image",
              src: "https://placehold.co/400x300/50C878/FFFFFF?text=Right",
              w: 200,
              aspectRatio: 16 / 9,
            },
          ],
        },
      ],
    },

    // ========================================
    // セクション3: 3カラム画像ギャラリー
    // ========================================
    {
      type: "vstack",
      gap: 8,
      children: [
        {
          type: "text",
          text: "3カラムギャラリー（justify: center）",
          fontPx: 20,
          alignText: "center",
          w: "max",
        },
        {
          type: "hstack",
          gap: 12,
          justify: "center",
          alignItems: "center",
          children: [
            {
              type: "image",
              src: "https://placehold.co/300x200/FF6B6B/FFFFFF?text=Image+1",
              w: 150,
              aspectRatio: 3 / 2,
            },
            {
              type: "image",
              src: "https://placehold.co/300x200/4ECDC4/FFFFFF?text=Image+2",
              w: 150,
              aspectRatio: 3 / 2,
            },
            {
              type: "image",
              src: "https://placehold.co/300x200/FFE66D/333333?text=Image+3",
              w: 150,
              aspectRatio: 3 / 2,
            },
          ],
        },
      ],
    },

    // ========================================
    // セクション4: spaceBetweenの使用例
    // ========================================
    {
      type: "vstack",
      gap: 8,
      children: [
        {
          type: "text",
          text: "justify: spaceBetween の例",
          fontPx: 20,
          alignText: "center",
          w: "max",
        },
        {
          type: "hstack",
          gap: 0,
          justify: "spaceBetween",
          alignItems: "center",
          children: [
            {
              type: "text",
              text: "左端",
              fontPx: 16,
              alignText: "left",
            },
            {
              type: "text",
              text: "中央",
              fontPx: 16,
              alignText: "center",
            },
            {
              type: "text",
              text: "右端",
              fontPx: 16,
              alignText: "right",
            },
          ],
        },
      ],
    },

    // ========================================
    // セクション5: Boxとpadding TRBL指定
    // ========================================
    {
      type: "box",
      padding: { top: 12, right: 30, bottom: 12, left: 30 },
      children: [
        {
          type: "vstack",
          gap: 4,
          alignItems: "center",
          children: [
            {
              type: "text",
              text: "Box with TRBL padding",
              fontPx: 18,
              alignText: "center",
              w: "max",
            },
            {
              type: "text",
              text: "padding: { top: 12, right: 30, bottom: 12, left: 30 }",
              fontPx: 12,
              alignText: "center",
              w: "max",
            },
          ],
        },
      ],
    },
  ],
};

async function main() {
  const slideSize = { w: 1280, h: 720 }; // px単位で16:9
  const positioned = layout(doc, slideSize);
  const pptx = renderPptx(positioned, slideSize);
  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
