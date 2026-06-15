import { describe, expect, it } from "vitest";
import { renderToXml } from "./renderToXml.ts";
import {
  Slide,
  Theme,
  Text,
  VStack,
  HStack,
  Ul,
  Li,
  Ol,
  Image,
  Table,
  Tr,
  Td,
  Th,
  Chart,
  Shape,
  Icon,
  Timeline,
  Matrix,
  ProcessArrow,
  Pyramid,
  B,
  I,
  Sub,
  Sup,
  Span,
} from "./components.ts";
import { parseXml } from "../../pom/src/parseXml/parseXml.ts";

function assertParsable(xml: string): void {
  if (!xml.trim()) return;
  expect(() => parseXml(xml)).not.toThrow();
}

describe("pom core との統合テスト", () => {
  it("Text ノードが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text fontSize={28} bold>
          タイトル
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('<Text fontSize="28" bold="true">タイトル</Text>');
  });

  it("letterSpacing 付きの Text / Span が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text fontSize={32} bold letterSpacing={8}>
          SECTION TITLE
        </Text>
        <Text fontSize={16}>
          通常 <Span letterSpacing={6}>字間広め</Span> 通常
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('letterSpacing="8"');
    expect(xml).toContain('<Span letterSpacing="6">字間広め</Span>');
  });

  it("fontSize 付きの Span が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text fontSize={52} bold color="1D4ED8">
          ¥84.2<Span fontSize={20}>M</Span>
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('<Span fontSize="20">M</Span>');
  });

  it("glow / outline 付きの Text が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text
          fontSize={40}
          bold
          color="FFFFFF"
          glow={{ size: 8, opacity: 0.5, color: "FF3399" }}
          outline={{ size: 2, color: "0088CC" }}
        >
          Glowing title
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain(`glow='{"size":8,"opacity":0.5,"color":"FF3399"}'`);
    expect(xml).toContain(`outline='{"size":2,"color":"0088CC"}'`);
  });

  it("rotate 付きの leaf ノードが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text rotate={12}>Rotated text</Text>
        <Shape shapeType="rect" w={120} h={60} rotate={-15} />
        <Image src="image.png" w={120} h={80} rotate={8} />
        <Icon name="cpu" rotate={45} />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('rotate="12"');
    expect(xml).toContain('rotate="-15"');
    expect(xml).toContain('rotate="8"');
    expect(xml).toContain('rotate="45"');
  });

  it("textGradient 付きの Text が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text
          fontSize={48}
          bold
          textGradient="linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)"
        >
          Gradient title
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain(
      'textGradient="linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)"',
    );
  });

  it("Theme トークン宣言と $name 参照が parseXml で解決できる", () => {
    const xml = renderToXml(
      <>
        <Theme surface="0F172A" accent="38BDF8" />
        <Slide>
          <VStack backgroundColor="$surface">
            <Text color="$accent">Hello</Text>
          </VStack>
        </Slide>
      </>,
    );
    expect(xml).toContain('<Theme surface="0F172A" accent="38BDF8" />');
    const nodes = parseXml(xml);
    expect(nodes).toEqual([
      {
        type: "vstack",
        backgroundColor: "0F172A",
        children: [{ type: "text", text: "Hello", color: "38BDF8" }],
      },
    ]);
  });

  it("VStack コンテナが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <VStack w="max" h="max" padding={48} gap={16}>
          <Text fontSize={32} bold>
            スライドタイトル
          </Text>
          <Text>本文テキスト</Text>
        </VStack>
      </Slide>,
    );
    assertParsable(xml);
  });

  it("HStack コンテナが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <HStack gap={16} w="max">
          <Text w="50%">左カラム</Text>
          <Text w="50%">右カラム</Text>
        </HStack>
      </Slide>,
    );
    assertParsable(xml);
  });

  it("grow 属性が XML に出力され parseXml で数値としてパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <HStack gap={16} w="max">
          <VStack grow={2}>
            <Text>左カラム</Text>
          </VStack>
          <VStack grow={1}>
            <Text>右カラム</Text>
          </VStack>
        </HStack>
      </Slide>,
    );
    expect(xml).toContain('grow="2"');
    const nodes = parseXml(xml);
    const hstack = nodes[0] as unknown as {
      children: Record<string, unknown>[];
    };
    expect(hstack.children[0].grow).toBe(2);
    expect(hstack.children[1].grow).toBe(1);
  });

  it("Ul リストが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Ul>
          <Li>項目1</Li>
          <Li>項目2</Li>
          <Li>項目3</Li>
        </Ul>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("<Ul>");
    expect(xml).toContain("<Li>項目1</Li>");
  });

  it("Ol リストが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Ol>
          <Li>手順1</Li>
          <Li>手順2</Li>
        </Ol>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("<Ol>");
  });

  it("Image ノードが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Image src="test.png" w={400} h={300} />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('<Image src="test.png"');
  });

  it("Table が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Table cellBorder={{ color: "CBD5E1" }}>
          <Tr>
            <Td>名前</Td>
            <Td>値</Td>
          </Tr>
          <Tr>
            <Td>項目A</Td>
            <Td>100</Td>
          </Tr>
        </Table>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("<Table");
    expect(xml).toContain("<Tr>");
    expect(xml).toContain("<Td>名前</Td>");
    expect(xml).toContain("<Td>項目A</Td>");
  });

  it("Chart が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Chart
          chartType="bar"
          data={[
            {
              name: "売上",
              labels: ["Q1", "Q2", "Q3", "Q4"],
              values: [100, 150, 120, 200],
            },
          ]}
          showLegend
          title="四半期売上"
          w={800}
          h={400}
        />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('chartType="bar"');
  });

  it("Chart sparkline モードが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Chart
          chartType="bar"
          data={[
            {
              name: "売上",
              labels: ["Q1", "Q2", "Q3", "Q4"],
              values: [100, 200, 150, 300],
            },
          ]}
          sparkline
          w={200}
          h={40}
        />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('sparkline="true"');
  });

  it("Shape が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Shape shapeType="rect" w={200} h={100} fill={{ color: "4472C4" }}>
          テキスト
        </Shape>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('shapeType="rect"');
  });

  it("Timeline が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Timeline
          direction="horizontal"
          items={[
            { date: "2024-01", title: "イベント1" },
            { date: "2024-06", title: "イベント2", description: "詳細" },
          ]}
          w="max"
          h={200}
        />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('direction="horizontal"');
  });

  it("Matrix が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Matrix
          axes={{ x: "X軸", y: "Y軸" }}
          items={[
            { label: "項目A", x: 0.3, y: 0.7 },
            { label: "項目B", x: 0.8, y: 0.2 },
          ]}
          w={500}
          h={400}
        />
      </Slide>,
    );
    assertParsable(xml);
  });

  it("ProcessArrow が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <ProcessArrow
          steps={[
            { label: "企画", color: "4472C4" },
            { label: "開発", color: "ED7D31" },
            { label: "リリース", color: "A9D18E" },
          ]}
          w="max"
          h={120}
        />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("ProcessArrow");
  });

  it("Pyramid が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Pyramid
          levels={[
            { label: "レベル1", color: "4472C4" },
            { label: "レベル2", color: "ED7D31" },
            { label: "レベル3", color: "A9D18E" },
          ]}
          w={400}
          h={400}
        />
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("Pyramid");
  });

  it("インラインテキスト書式が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text>
          通常 <B>太字</B> と <I>斜体</I> テキスト
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("<B>太字</B>");
    expect(xml).toContain("<I>斜体</I>");
  });

  it("Text 全体の subscript / superscript 属性が parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text superscript>注釈</Text>
        <Text subscript>添字</Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain('superscript="true"');
    expect(xml).toContain('subscript="true"');
  });

  it("Sub / Sup インラインタグが parseXml でパースできる", () => {
    const xml = renderToXml(
      <Slide>
        <Text>
          H<Sub>2</Sub>O と x<Sup>2</Sup>
        </Text>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("<Sub>2</Sub>");
    expect(xml).toContain("<Sup>2</Sup>");
    const nodes = parseXml(xml);
    const textNode = nodes[0] as unknown as {
      runs?: { text: string; subscript?: boolean; superscript?: boolean }[];
    };
    expect(textNode.runs).toBeDefined();
    const sub = textNode.runs!.find((r) => r.subscript);
    const sup = textNode.runs!.find((r) => r.superscript);
    expect(sub?.text).toBe("2");
    expect(sup?.text).toBe("2");
  });

  it("複雑なスライドが parseXml でパースできる", () => {
    const quarters = [
      { name: "Q1", revenue: 100 },
      { name: "Q2", revenue: 150 },
      { name: "Q3", revenue: 120 },
    ];

    const xml = renderToXml(
      <Slide>
        <VStack w="max" h="max" padding={48} gap={16}>
          <Text fontSize={28} bold>
            売上レポート
          </Text>
          {quarters.map((q) => (
            <Text key={q.name}>
              {q.name}: {q.revenue}
            </Text>
          ))}
          <Chart
            chartType="bar"
            data={[
              {
                labels: quarters.map((q) => q.name),
                values: quarters.map((q) => q.revenue),
              },
            ]}
            w="max"
            h={300}
          />
        </VStack>
      </Slide>,
    );
    assertParsable(xml);
    expect(xml).toContain("<Slide>");
    expect(xml).toContain("<Text>Q1: 100</Text>");
    expect(xml).toContain("Chart");
  });

  it("カスタムコンポーネントで生成した XML が parseXml でパースできる", () => {
    function TwoColumnSlide({ left, right }: { left: string; right: string }) {
      return (
        <Slide>
          <HStack w="max" h="max" padding={32} gap={24}>
            <VStack w="50%" gap={8}>
              <Text bold fontSize={20}>
                左カラム
              </Text>
              <Text>{left}</Text>
            </VStack>
            <VStack w="50%" gap={8}>
              <Text bold fontSize={20}>
                右カラム
              </Text>
              <Text>{right}</Text>
            </VStack>
          </HStack>
        </Slide>
      );
    }

    const xml = renderToXml(
      <TwoColumnSlide left="左側のコンテンツ" right="右側のコンテンツ" />,
    );
    assertParsable(xml);
    expect(xml).toContain("<HStack");
    expect(xml).toContain("左側のコンテンツ");
    expect(xml).toContain("右側のコンテンツ");
  });
});

describe("buildPptx との統合テスト", () => {
  it("生成した XML で buildPptx が成功する", async () => {
    const { buildPptx } = await import("@hirokisakabe/pom");

    const xml = renderToXml(
      <Slide>
        <VStack w={1280} h={720} padding={48} gap={16}>
          <Text fontSize={32} bold>
            テストスライド
          </Text>
          <Text>本文テキスト</Text>
        </VStack>
      </Slide>,
    );

    const result = await buildPptx(xml, { w: 1280, h: 720 });
    expect(result.pptx).toBeTruthy();
  });
});
