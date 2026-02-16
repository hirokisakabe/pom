import { POMNode, buildPptx, defineComponent, mergeTheme, Theme } from "./src";

// テーマ定義
const myTheme = mergeTheme({
  colors: { primary: "1D4ED8", background: "F8FAFC", text: "1E293B" },
});

// セクションカードコンポーネント
const SectionCard = defineComponent<{
  title: string;
  content: POMNode;
  theme?: Partial<Theme>;
}>((props) => {
  const t = mergeTheme(props.theme);
  return {
    type: "box",
    padding: t.spacing.md,
    backgroundColor: "FFFFFF",
    border: { color: t.colors.border, width: 1 },
    borderRadius: 8,
    children: {
      type: "vstack",
      gap: t.spacing.sm,
      children: [
        {
          type: "text",
          text: props.title,
          fontPx: t.fontPx.heading,
          bold: true,
          color: t.colors.text,
        },
        props.content,
      ],
    },
  };
});

// ページレイアウトコンポーネント
const PageLayout = defineComponent<{
  title: string;
  children: POMNode[];
}>((props) => ({
  type: "vstack",
  w: 1280,
  h: 720,
  padding: { top: 24, bottom: 24, left: 48, right: 48 },
  gap: 24,
  backgroundColor: myTheme.colors.background,
  children: [
    {
      type: "text",
      text: props.title,
      fontPx: myTheme.fontPx.title,
      bold: true,
      color: myTheme.colors.text,
    },
    ...props.children,
  ],
}));

// コンポーネントを使ったスライド
const page: POMNode = PageLayout({
  title: "Component Template Demo",
  children: [
    SectionCard({
      title: "Horizontal Process Arrow",
      content: {
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
    }),
    {
      type: "hstack",
      gap: 24,
      children: [
        SectionCard({
          title: "3 Steps (Default color)",
          content: {
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
        }),
        SectionCard({
          title: "Custom Theme",
          content: {
            type: "processArrow",
            direction: "horizontal",
            w: 500,
            h: 60,
            steps: [
              { label: "Step 1", color: "#2196F3" },
              { label: "Step 2", color: "#00BCD4" },
              { label: "Step 3", color: "#009688" },
            ],
          },
          theme: {
            colors: { text: "0F172A", border: "CBD5E1" },
          },
        }),
      ],
    },
    {
      type: "hstack",
      gap: 24,
      children: [
        SectionCard({
          title: "Vertical",
          content: {
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
        }),
        SectionCard({
          title: "Single Step",
          content: {
            type: "processArrow",
            direction: "horizontal",
            w: 200,
            h: 60,
            steps: [{ label: "Only One", color: "#E91E63" }],
          },
        }),
        SectionCard({
          title: "Custom textColor",
          content: {
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
        }),
      ],
    },
  ],
});

async function main() {
  const pptx = await buildPptx([page], {
    w: 1280,
    h: 720,
  });

  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
