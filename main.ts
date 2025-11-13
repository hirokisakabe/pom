import { POMNode, buildPptx } from "./src";

// ページ1: タイトルページ
const page1: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "center",
  justifyContent: "center",
  children: [
    {
      type: "text",
      text: "プレゼンテーションタイトル",
      fontPx: 48,
    },
    {
      type: "text",
      text: "サブタイトル",
      fontPx: 32,
    },
    {
      type: "text",
      text: "2025年",
      fontPx: 24,
    },
  ],
};

// ページ2: コンテンツページ
const page2: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 24,
  gap: 16,
  alignItems: "stretch",
  children: [
    {
      type: "box",
      padding: 12,
      children: {
        type: "text",
        text: "セクションタイトル",
        fontPx: 26,
      },
    },

    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "vstack",
          w: "50%",
          padding: 12,
          gap: 8,
          alignItems: "start",
          children: [
            {
              type: "text",
              text: "左カラムタイトル",
              fontPx: 20,
            },
            {
              type: "vstack",
              gap: 6,
              alignItems: "start",
              children: [
                {
                  type: "text",
                  text: "あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ",
                  fontPx: 16,
                },
                {
                  type: "text",
                  text: "いいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいい",
                  fontPx: 16,
                },
                {
                  type: "text",
                  text: "ううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううう",
                  fontPx: 16,
                },
              ],
            },
          ],
        },
        {
          type: "vstack",
          w: "50%",
          padding: 12,
          gap: 8,
          alignItems: "start",
          children: [
            {
              type: "text",
              text: "右カラムタイトル",
              fontPx: 20,
            },
            {
              type: "vstack",
              gap: 6,
              alignItems: "start",
              children: [
                {
                  type: "text",
                  text: "あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ",
                  fontPx: 16,
                },
                {
                  type: "text",
                  text: "いいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいい",
                  fontPx: 16,
                },
                {
                  type: "text",
                  text: "ううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううう",
                  fontPx: 16,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ページ3: 画像ページ（既存の画像セクションを独立したページとして）
const page3: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 24,
  gap: 16,
  alignItems: "center",
  justifyContent: "center",
  children: [
    {
      type: "text",
      text: "画像ページ",
      fontPx: 36,
    },
    {
      type: "image",
      src: "https://placehold.co/600x400",
      w: 600,
      h: 400,
    },
  ],
};

async function main() {
  await buildPptx([page1, page2, page3], { w: 1280, h: 720 }, "sample.pptx");
}

main();
