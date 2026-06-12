import { describe, expect, it } from "vitest";
import { renderToXml } from "./renderToXml.ts";
import type { ReactNode } from "./types.ts";
import {
  Slide,
  Text,
  VStack,
  HStack,
  Ul,
  Li,
  Image,
  Chart,
  B,
  I,
  A,
} from "./components.ts";

describe("renderToXml", () => {
  describe("基本的な要素変換", () => {
    it("Text ノードが正しく変換される", () => {
      const xml = renderToXml(<Text>Hello World</Text>);
      expect(xml).toBe("<Text>Hello World</Text>");
    });

    it("子要素なしのノードが自己終了タグになる", () => {
      const xml = renderToXml(<Image src="test.png" />);
      expect(xml).toBe('<Image src="test.png" />');
    });

    it("Slide ラッパーが正しく変換される", () => {
      const xml = renderToXml(
        <Slide>
          <Text>スライド1</Text>
        </Slide>,
      );
      expect(xml).toBe("<Slide><Text>スライド1</Text></Slide>");
    });
  });

  describe("属性変換", () => {
    it("数値属性が文字列に変換される", () => {
      const xml = renderToXml(<Text fontSize={28}>テキスト</Text>);
      expect(xml).toContain('fontSize="28"');
    });

    it("boolean true が文字列 true に変換される", () => {
      const xml = renderToXml(<Text bold>テキスト</Text>);
      expect(xml).toContain('bold="true"');
    });

    it("boolean false は属性として出力されない", () => {
      const xml = renderToXml(<Text bold={false}>テキスト</Text>);
      expect(xml).not.toContain("bold");
    });

    it("オブジェクト属性が JSON 文字列になる（単一クォートで囲まれる）", () => {
      const xml = renderToXml(
        <Text padding={{ top: 10, bottom: 5 }}>テキスト</Text>,
      );
      expect(xml).toContain("padding=");
      expect(xml).toContain('"top":10');
      expect(xml).toContain('"bottom":5');
    });

    it("辺ごとの border 属性が JSON 文字列になる", () => {
      const xml = renderToXml(
        <Text borderLeft={{ color: "1D4ED8", width: 6 }}>テキスト</Text>,
      );
      expect(xml).toContain("borderLeft=");
      expect(xml).toContain('"color":"1D4ED8"');
      expect(xml).toContain('"width":6');
    });

    it("配列属性が JSON 文字列になる", () => {
      const xml = renderToXml(
        <Chart
          chartType="bar"
          data={[{ labels: ["Q1", "Q2"], values: [100, 200] }]}
        />,
      );
      expect(xml).toContain('chartType="bar"');
      expect(xml).toContain("data=");
      expect(xml).toContain('"Q1"');
      expect(xml).toContain("100");
    });

    it("undefined 属性はスキップされる", () => {
      const xml = renderToXml(<Text color={undefined}>テキスト</Text>);
      expect(xml).not.toContain("color");
    });

    it("文字列属性の特殊文字がエスケープされる", () => {
      const xml = renderToXml(<Text color="&test">テキスト</Text>);
      expect(xml).toContain("&amp;test");
    });
  });

  describe("子要素のシリアライズ", () => {
    it("VStack の子要素が正しく変換される", () => {
      const xml = renderToXml(
        <VStack gap={16}>
          <Text>項目1</Text>
          <Text>項目2</Text>
        </VStack>,
      );
      expect(xml).toBe(
        '<VStack gap="16"><Text>項目1</Text><Text>項目2</Text></VStack>',
      );
    });

    it("ネストされた要素が正しく変換される", () => {
      const xml = renderToXml(
        <Slide>
          <VStack padding={48} gap={16}>
            <Text fontSize={28} bold>
              タイトル
            </Text>
            <Ul>
              <Li>項目A</Li>
              <Li>項目B</Li>
            </Ul>
          </VStack>
        </Slide>,
      );
      expect(xml).toContain("<Slide>");
      expect(xml).toContain('<VStack padding="48"');
      expect(xml).toContain('<Text fontSize="28" bold="true">タイトル</Text>');
      expect(xml).toContain("<Ul>");
      expect(xml).toContain("<Li>項目A</Li>");
    });

    it("テキストコンテンツの特殊文字がエスケープされる", () => {
      const xml = renderToXml(<Text>{"a < b & c > d"}</Text>);
      expect(xml).toBe("<Text>a &lt; b &amp; c &gt; d</Text>");
    });

    it("数値の子要素がテキストとして出力される", () => {
      const xml = renderToXml(<Text>{42}</Text>);
      expect(xml).toBe("<Text>42</Text>");
    });
  });

  describe("条件付きレンダリング", () => {
    it("false 子要素は無視される", () => {
      const show = false;
      const xml = renderToXml(
        <VStack>
          {show && <Text>表示しない</Text>}
          <Text>表示する</Text>
        </VStack>,
      );
      expect(xml).not.toContain("表示しない");
      expect(xml).toContain("表示する");
    });

    it("null 子要素は無視される", () => {
      const xml = renderToXml(
        <VStack>
          {null}
          <Text>表示する</Text>
        </VStack>,
      );
      expect(xml).not.toContain("null");
      expect(xml).toContain("表示する");
    });

    it("undefined 子要素は無視される", () => {
      const xml = renderToXml(
        <VStack>
          {undefined}
          <Text>表示する</Text>
        </VStack>,
      );
      expect(xml).toContain("表示する");
    });
  });

  describe("配列レンダリング", () => {
    it("配列から複数の要素をレンダリングできる", () => {
      const items = ["項目1", "項目2", "項目3"];
      const xml = renderToXml(
        <Ul>
          {items.map((item) => (
            <Li key={item}>{item}</Li>
          ))}
        </Ul>,
      );
      expect(xml).toContain("<Li>項目1</Li>");
      expect(xml).toContain("<Li>項目2</Li>");
      expect(xml).toContain("<Li>項目3</Li>");
    });

    it("key 属性は XML に出力されない", () => {
      const xml = renderToXml(<Li key="mykey">テスト</Li>);
      expect(xml).not.toContain("key");
      expect(xml).toContain("<Li>テスト</Li>");
    });
  });

  describe("インラインテキスト書式", () => {
    it("B タグが正しく変換される", () => {
      const xml = renderToXml(
        <Text>
          通常 <B>太字</B> テキスト
        </Text>,
      );
      expect(xml).toBe("<Text>通常 <B>太字</B> テキスト</Text>");
    });

    it("I タグが正しく変換される", () => {
      const xml = renderToXml(
        <Text>
          <I>斜体</I>
        </Text>,
      );
      expect(xml).toBe("<Text><I>斜体</I></Text>");
    });

    it("A タグに href が付与される", () => {
      const xml = renderToXml(
        <Text>
          <A href="https://example.com">リンク</A>
        </Text>,
      );
      expect(xml).toBe('<Text><A href="https://example.com">リンク</A></Text>');
    });
  });

  describe("Fragment (<>...</>)", () => {
    it("Fragment 内の要素が連結される", () => {
      const xml = renderToXml(
        <>
          <Text>第1スライド内容</Text>
          <Text>第2スライド内容</Text>
        </>,
      );
      expect(xml).toBe(
        "<Text>第1スライド内容</Text><Text>第2スライド内容</Text>",
      );
    });

    it("Fragment を VStack に含めることができる", () => {
      const xml = renderToXml(
        <Slide>
          <VStack>
            <>
              <Text>テキスト1</Text>
              <Text>テキスト2</Text>
            </>
          </VStack>
        </Slide>,
      );
      expect(xml).toContain("<Text>テキスト1</Text><Text>テキスト2</Text>");
    });
  });

  describe("カスタムコンポーネント", () => {
    it("関数コンポーネントが正しく展開される", () => {
      function TitleSlide({ title }: { title: string }) {
        return (
          <Slide>
            <VStack padding={48}>
              <Text fontSize={32} bold>
                {title}
              </Text>
            </VStack>
          </Slide>
        );
      }

      const xml = renderToXml(<TitleSlide title="発表タイトル" />);
      expect(xml).toContain("<Slide>");
      expect(xml).toContain(
        '<Text fontSize="32" bold="true">発表タイトル</Text>',
      );
    });

    it("子要素を受け取るカスタムコンポーネントが正しく動作する", () => {
      function Card({
        children,
        color,
      }: {
        children?: ReactNode;
        color?: string;
      }) {
        return (
          <VStack backgroundColor={color} padding={16} borderRadius={8}>
            {children}
          </VStack>
        );
      }

      const xml = renderToXml(
        <Card color="F0F4FF">
          <Text>カード内容</Text>
        </Card>,
      );
      expect(xml).toContain('backgroundColor="F0F4FF"');
      expect(xml).toContain("<Text>カード内容</Text>");
    });
  });

  describe("HStack", () => {
    it("HStack が正しく変換される", () => {
      const xml = renderToXml(
        <HStack gap={8}>
          <Text>左</Text>
          <Text>右</Text>
        </HStack>,
      );
      expect(xml).toBe(
        '<HStack gap="8"><Text>左</Text><Text>右</Text></HStack>',
      );
    });
  });

  describe("複数 Slide", () => {
    it("複数の Slide を配列でレンダリングできる", () => {
      const slides = [
        <Slide key="1">
          <Text>スライド1</Text>
        </Slide>,
        <Slide key="2">
          <Text>スライド2</Text>
        </Slide>,
      ];
      const xml = slides.map((s) => renderToXml(s)).join("\n");
      expect(xml).toContain("<Slide><Text>スライド1</Text></Slide>");
      expect(xml).toContain("<Slide><Text>スライド2</Text></Slide>");
    });
  });
});
