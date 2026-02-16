import { describe, it, expect } from "vitest";
import {
  defineComponent,
  defaultTheme,
  mergeTheme,
  expandComponents,
  expandComponentSlides,
} from "./component.ts";
import type { POMNode } from "./types.ts";
import type { ComponentRegistry } from "./component.ts";

describe("defineComponent", () => {
  it("Propsから POMNode を生成する関数を作成する", () => {
    const MyComponent = defineComponent<{ text: string }>((props) => ({
      type: "text",
      text: props.text,
    }));

    const result = MyComponent({ text: "hello" });
    expect(result).toEqual({ type: "text", text: "hello" });
  });

  it("スロットパターンで POMNode を子として渡せる", () => {
    const Card = defineComponent<{ content: POMNode }>((props) => ({
      type: "box",
      padding: 16,
      children: props.content,
    }));

    const result = Card({
      content: { type: "text", text: "inner" },
    });
    expect(result).toEqual({
      type: "box",
      padding: 16,
      children: { type: "text", text: "inner" },
    });
  });

  it("複数スロットを渡せる", () => {
    const Layout = defineComponent<{
      title: POMNode;
      content: POMNode[];
    }>((props) => ({
      type: "vstack",
      gap: 16,
      children: [props.title, ...props.content],
    }));

    const result = Layout({
      title: { type: "text", text: "Title" },
      content: [
        { type: "text", text: "Content 1" },
        { type: "text", text: "Content 2" },
      ],
    });
    expect(result.type).toBe("vstack");
    expect((result as { children: POMNode[] }).children).toHaveLength(3);
  });

  it("コンポーネントをネストできる", () => {
    const Inner = defineComponent<{ label: string }>((props) => ({
      type: "text",
      text: props.label,
    }));

    const Outer = defineComponent<{ title: string }>((props) => ({
      type: "vstack",
      gap: 8,
      children: [Inner({ label: props.title }), Inner({ label: "fixed" })],
    }));

    const result = Outer({ title: "test" });
    expect(result).toEqual({
      type: "vstack",
      gap: 8,
      children: [
        { type: "text", text: "test" },
        { type: "text", text: "fixed" },
      ],
    });
  });

  it("オプショナルな Props をサポートする", () => {
    const Badge = defineComponent<{
      label: string;
      color?: string;
    }>((props) => ({
      type: "text",
      text: props.label,
      color: props.color ?? "333333",
    }));

    expect(Badge({ label: "OK" })).toEqual({
      type: "text",
      text: "OK",
      color: "333333",
    });
    expect(Badge({ label: "NG", color: "FF0000" })).toEqual({
      type: "text",
      text: "NG",
      color: "FF0000",
    });
  });
});

describe("expandComponents", () => {
  const SectionCard = defineComponent<{
    title: string;
    content: POMNode;
  }>((props) => ({
    type: "box",
    padding: 16,
    children: {
      type: "vstack",
      gap: 8,
      children: [
        { type: "text", text: props.title, bold: true },
        props.content,
      ],
    },
  }));

  const registry: ComponentRegistry = { SectionCard };

  it("type: 'component' ノードをレジストリから展開する", () => {
    const input = {
      type: "component",
      name: "SectionCard",
      props: {
        title: "KPI",
        content: { type: "text", text: "$1M" },
      },
    };

    const result = expandComponents(input, registry);
    expect(result).toEqual({
      type: "box",
      padding: 16,
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "KPI", bold: true },
          { type: "text", text: "$1M" },
        ],
      },
    });
  });

  it("コンテナノードの children 内のコンポーネントを展開する", () => {
    const input = {
      type: "vstack",
      gap: 24,
      children: [
        { type: "text", text: "Title" },
        {
          type: "component",
          name: "SectionCard",
          props: {
            title: "Card",
            content: { type: "text", text: "Content" },
          },
        },
      ],
    };

    const result = expandComponents(input, registry);
    expect(result.type).toBe("vstack");
    const children = (result as { children: POMNode[] }).children;
    expect(children[0]).toEqual({ type: "text", text: "Title" });
    expect(children[1]).toEqual({
      type: "box",
      padding: 16,
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "Card", bold: true },
          { type: "text", text: "Content" },
        ],
      },
    });
  });

  it("スロット内のネストされたコンポーネントを再帰展開する", () => {
    const Badge = defineComponent<{ label: string }>((props) => ({
      type: "text",
      text: props.label,
      bold: true,
    }));

    const nestedRegistry: ComponentRegistry = { ...registry, Badge };

    const input = {
      type: "component",
      name: "SectionCard",
      props: {
        title: "Nested",
        content: {
          type: "component",
          name: "Badge",
          props: { label: "NEW" },
        },
      },
    };

    const result = expandComponents(input, nestedRegistry);
    expect(result).toEqual({
      type: "box",
      padding: 16,
      children: {
        type: "vstack",
        gap: 8,
        children: [
          { type: "text", text: "Nested", bold: true },
          { type: "text", text: "NEW", bold: true },
        ],
      },
    });
  });

  it("未登録のコンポーネント名でエラーが発生する", () => {
    const input = {
      type: "component",
      name: "Unknown",
      props: {},
    };

    expect(() => expandComponents(input, registry)).toThrow(
      'Unknown component: "Unknown"',
    );
  });

  it("コンポーネントを含まない通常の POMNode はそのまま通過する", () => {
    const input = {
      type: "vstack",
      gap: 16,
      children: [
        { type: "text", text: "Hello" },
        { type: "text", text: "World" },
      ],
    };

    const result = expandComponents(input, registry);
    expect(result).toEqual(input);
  });

  it("box の単一 children 内のコンポーネントを展開する", () => {
    const input = {
      type: "box",
      padding: 8,
      children: {
        type: "component",
        name: "SectionCard",
        props: {
          title: "Inner",
          content: { type: "text", text: "Text" },
        },
      },
    };

    const result = expandComponents(input, registry);
    expect((result as { children: POMNode }).children.type).toBe("box");
  });
});

describe("expandComponentSlides", () => {
  const Card = defineComponent<{ title: string }>((props) => ({
    type: "text",
    text: props.title,
  }));

  const registry: ComponentRegistry = { Card };

  it("複数スライドのコンポーネントを展開する", () => {
    const inputs = [
      {
        type: "component",
        name: "Card",
        props: { title: "Slide 1" },
      },
      {
        type: "component",
        name: "Card",
        props: { title: "Slide 2" },
      },
    ];

    const result = expandComponentSlides(inputs, registry);
    expect(result).toEqual([
      { type: "text", text: "Slide 1" },
      { type: "text", text: "Slide 2" },
    ]);
  });
});

describe("mergeTheme", () => {
  it("未指定のプロパティにデフォルト値を適用する", () => {
    const theme = mergeTheme({ colors: { primary: "FF0000" } });
    expect(theme.colors.primary).toBe("FF0000");
    expect(theme.colors.secondary).toBe("64748B");
    expect(theme.spacing.md).toBe(16);
    expect(theme.fontPx.body).toBe(14);
  });

  it("undefined を渡すと完全なデフォルトテーマを返す", () => {
    const theme = mergeTheme(undefined);
    expect(theme).toEqual(defaultTheme);
  });

  it("引数なしで完全なデフォルトテーマを返す", () => {
    const theme = mergeTheme();
    expect(theme).toEqual(defaultTheme);
  });

  it("複数カテゴリを同時にオーバーライドできる", () => {
    const theme = mergeTheme({
      colors: { primary: "FF0000" },
      spacing: { md: 32 },
      fontPx: { title: 48 },
    });
    expect(theme.colors.primary).toBe("FF0000");
    expect(theme.colors.secondary).toBe("64748B");
    expect(theme.spacing.md).toBe(32);
    expect(theme.spacing.sm).toBe(8);
    expect(theme.fontPx.title).toBe(48);
    expect(theme.fontPx.body).toBe(14);
  });
});
