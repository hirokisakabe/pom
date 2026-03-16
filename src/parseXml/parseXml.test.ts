import { describe, it, expect } from "vitest";
import { parseXml, ParseXmlError } from "./parseXml.ts";

describe("parseXml", () => {
  // ===== 基本的なノード変換 =====
  describe("ノードタイプ変換", () => {
    it("Text ノードを変換する", () => {
      const result = parseXml('<Text fontPx="32" bold="true">Hello</Text>');
      expect(result).toEqual([
        { type: "text", text: "Hello", fontPx: 32, bold: true },
      ]);
    });

    it("Image ノードを変換する（self-closing）", () => {
      const result = parseXml('<Image src="image.png" w="400" h="300" />');
      expect(result).toEqual([
        { type: "image", src: "image.png", w: 400, h: 300 },
      ]);
    });

    it("Shape ノードを変換する", () => {
      const result = parseXml(
        '<Shape shapeType="rect" w="200" h="100">Hello</Shape>',
      );
      expect(result).toEqual([
        { type: "shape", shapeType: "rect", w: 200, h: 100, text: "Hello" },
      ]);
    });

    it("Chart ノードを変換する", () => {
      const data = JSON.stringify([
        { name: "Q1", labels: ["1月", "2月"], values: [100, 120] },
      ]);
      const result = parseXml(
        `<Chart chartType="bar" w="400" h="300" data='${data}' />`,
      );
      expect(result).toEqual([
        {
          type: "chart",
          chartType: "bar",
          w: 400,
          h: 300,
          data: [{ name: "Q1", labels: ["1月", "2月"], values: [100, 120] }],
        },
      ]);
    });

    it("Timeline ノードを変換する", () => {
      const items = JSON.stringify([
        { date: "2024-01", title: "Start" },
        { date: "2024-06", title: "End" },
      ]);
      const result = parseXml(
        `<Timeline direction="horizontal" items='${items}' />`,
      );
      expect(result).toEqual([
        {
          type: "timeline",
          direction: "horizontal",
          items: [
            { date: "2024-01", title: "Start" },
            { date: "2024-06", title: "End" },
          ],
        },
      ]);
    });

    it("Matrix ノードを変換する", () => {
      const axes = JSON.stringify({ x: "Impact", y: "Effort" });
      const items = JSON.stringify([{ label: "A", x: 0.5, y: 0.5 }]);
      const result = parseXml(`<Matrix axes='${axes}' items='${items}' />`);
      expect(result).toEqual([
        {
          type: "matrix",
          axes: { x: "Impact", y: "Effort" },
          items: [{ label: "A", x: 0.5, y: 0.5 }],
        },
      ]);
    });

    it("Tree ノードを変換する", () => {
      const data = JSON.stringify({
        label: "Root",
        children: [{ label: "A" }, { label: "B" }],
      });
      const result = parseXml(`<Tree layout="vertical" data='${data}' />`);
      expect(result).toEqual([
        {
          type: "tree",
          layout: "vertical",
          data: {
            label: "Root",
            children: [{ label: "A" }, { label: "B" }],
          },
        },
      ]);
    });

    it("Flow ノードを変換する", () => {
      const nodes = JSON.stringify([
        { id: "1", shape: "flowChartProcess", text: "Start" },
        { id: "2", shape: "flowChartProcess", text: "End" },
      ]);
      const connections = JSON.stringify([{ from: "1", to: "2" }]);
      const result = parseXml(
        `<Flow direction="horizontal" nodes='${nodes}' connections='${connections}' />`,
      );
      expect(result).toEqual([
        {
          type: "flow",
          direction: "horizontal",
          nodes: [
            { id: "1", shape: "flowChartProcess", text: "Start" },
            { id: "2", shape: "flowChartProcess", text: "End" },
          ],
          connections: [{ from: "1", to: "2" }],
        },
      ]);
    });

    it("ProcessArrow ノードを変換する", () => {
      const steps = JSON.stringify([{ label: "Step 1" }, { label: "Step 2" }]);
      const result = parseXml(
        `<ProcessArrow direction="horizontal" steps='${steps}' gap="16" />`,
      );
      expect(result).toEqual([
        {
          type: "processArrow",
          direction: "horizontal",
          steps: [{ label: "Step 1" }, { label: "Step 2" }],
          gap: 16,
        },
      ]);
    });

    it("Line ノードを変換する", () => {
      const result = parseXml(
        '<Line x1="0" y1="0" x2="100" y2="100" color="FF0000" lineWidth="2" />',
      );
      expect(result).toEqual([
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
          color: "FF0000",
          lineWidth: 2,
        },
      ]);
    });

    it("Table ノードを変換する", () => {
      const columns = JSON.stringify([{ width: 100 }, { width: 200 }]);
      const rows = JSON.stringify([{ cells: [{ text: "A" }, { text: "B" }] }]);
      const result = parseXml(`<Table columns='${columns}' rows='${rows}' />`);
      expect(result).toEqual([
        {
          type: "table",
          columns: [{ width: 100 }, { width: 200 }],
          rows: [{ cells: [{ text: "A" }, { text: "B" }] }],
        },
      ]);
    });
  });

  // ===== コンテナノード =====
  describe("コンテナノード", () => {
    it("VStack で children を配列として変換する", () => {
      const xml = `
        <VStack gap="16">
          <Text>A</Text>
          <Text>B</Text>
        </VStack>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "vstack",
          gap: 16,
          children: [
            { type: "text", text: "A" },
            { type: "text", text: "B" },
          ],
        },
      ]);
    });

    it("HStack で children を配列として変換する", () => {
      const xml = `
        <HStack gap="8" alignItems="center">
          <Text>Left</Text>
          <Text>Right</Text>
        </HStack>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "hstack",
          gap: 8,
          alignItems: "center",
          children: [
            { type: "text", text: "Left" },
            { type: "text", text: "Right" },
          ],
        },
      ]);
    });

    it("Box で children を単一ノードとして変換する", () => {
      const xml = `
        <Box padding="20" backgroundColor="FFFFFF">
          <Text>Content</Text>
        </Box>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "box",
          padding: 20,
          backgroundColor: "FFFFFF",
          children: { type: "text", text: "Content" },
        },
      ]);
    });

    it("Layer で children を配列として変換する", () => {
      const xml = `
        <Layer w="800" h="600">
          <Text x="10" y="20" fontPx="32">Hello</Text>
          <Image x="100" y="200" src="img.png" />
        </Layer>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "layer",
          w: 800,
          h: 600,
          children: [
            { type: "text", x: 10, y: 20, fontPx: 32, text: "Hello" },
            { type: "image", x: 100, y: 200, src: "img.png" },
          ],
        },
      ]);
    });
  });

  // ===== 属性値の型変換 =====
  describe("属性値の型変換", () => {
    it("number 型に変換する", () => {
      const result = parseXml('<Text fontPx="24">test</Text>');
      expect(result[0]).toHaveProperty("fontPx", 24);
      expect(typeof (result[0] as Record<string, unknown>).fontPx).toBe(
        "number",
      );
    });

    it("boolean 型に変換する", () => {
      const result = parseXml('<Text bold="true" italic="false">test</Text>');
      expect(result[0]).toHaveProperty("bold", true);
      expect(result[0]).toHaveProperty("italic", false);
    });

    it("string 型をそのまま保持する", () => {
      const result = parseXml('<Text color="FF0000">test</Text>');
      expect(result[0]).toHaveProperty("color", "FF0000");
      expect(typeof (result[0] as Record<string, unknown>).color).toBe(
        "string",
      );
    });

    it("array 型を JSON.parse で変換する", () => {
      const data = JSON.stringify([{ name: "S1", labels: ["A"], values: [1] }]);
      const result = parseXml(`<Chart chartType="bar" data='${data}' />`);
      expect((result[0] as Record<string, unknown>).data).toEqual([
        { name: "S1", labels: ["A"], values: [1] },
      ]);
    });

    it("object 型を JSON.parse で変換する", () => {
      const border = JSON.stringify({ color: "000000", width: 2 });
      const result = parseXml(`<Text border='${border}'>test</Text>`);
      expect((result[0] as Record<string, unknown>).border).toEqual({
        color: "000000",
        width: 2,
      });
    });

    it("union 型（number | string）の length を正しく変換する", () => {
      // number
      const r1 = parseXml('<Text w="400">test</Text>');
      expect((r1[0] as Record<string, unknown>).w).toBe(400);

      // literal "max"
      const r2 = parseXml('<Text w="max">test</Text>');
      expect((r2[0] as Record<string, unknown>).w).toBe("max");

      // percentage string
      const r3 = parseXml('<Text w="50%">test</Text>');
      expect((r3[0] as Record<string, unknown>).w).toBe("50%");
    });

    it("union 型（boolean | object）の underline を正しく変換する", () => {
      // boolean
      const r1 = parseXml('<Text underline="true">test</Text>');
      expect((r1[0] as Record<string, unknown>).underline).toBe(true);

      // object
      const obj = JSON.stringify({ style: "dbl", color: "FF0000" });
      const r2 = parseXml(`<Text underline='${obj}'>test</Text>`);
      expect((r2[0] as Record<string, unknown>).underline).toEqual({
        style: "dbl",
        color: "FF0000",
      });
    });

    it("Ul + Li を正しくパースする", () => {
      const result = parseXml(
        '<Ul fontPx="14"><Li>Item A</Li><Li>Item B</Li></Ul>',
      );
      expect(result).toHaveLength(1);
      const node = result[0] as Record<string, unknown>;
      expect(node.type).toBe("ul");
      expect(node.fontPx).toBe(14);
      expect(node.items).toEqual([{ text: "Item A" }, { text: "Item B" }]);
    });

    it("Ol + Li を正しくパースする", () => {
      const result = parseXml(
        '<Ol fontPx="14" numberType="alphaLcPeriod" numberStartAt="3"><Li>A</Li><Li>B</Li></Ol>',
      );
      expect(result).toHaveLength(1);
      const node = result[0] as Record<string, unknown>;
      expect(node.type).toBe("ol");
      expect(node.fontPx).toBe(14);
      expect(node.numberType).toBe("alphaLcPeriod");
      expect(node.numberStartAt).toBe(3);
      expect(node.items).toEqual([{ text: "A" }, { text: "B" }]);
    });

    it("Li にスタイル属性がある場合を正しくパースする", () => {
      const result = parseXml(
        '<Ul><Li bold="true">Bold</Li><Li color="FF0000">Red</Li></Ul>',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.items).toEqual([
        { text: "Bold", bold: true },
        { text: "Red", color: "FF0000" },
      ]);
    });

    it("enum 型をそのまま文字列として保持する", () => {
      const result = parseXml('<Text alignText="center">test</Text>');
      expect((result[0] as Record<string, unknown>).alignText).toBe("center");
    });

    it("padding の number 変換", () => {
      const r1 = parseXml('<VStack padding="32"><Text>A</Text></VStack>');
      expect((r1[0] as Record<string, unknown>).padding).toBe(32);
    });

    it("padding の object 変換", () => {
      const padding = JSON.stringify({ top: 10, bottom: 20 });
      const r = parseXml(
        `<VStack padding='${padding}'><Text>A</Text></VStack>`,
      );
      expect((r[0] as Record<string, unknown>).padding).toEqual({
        top: 10,
        bottom: 20,
      });
    });

    it("padding の object 変換（引用符なしキー）", () => {
      const r = parseXml(
        `<VStack padding='{top:24,bottom:24,left:32,right:32}'><Text>A</Text></VStack>`,
      );
      expect((r[0] as Record<string, unknown>).padding).toEqual({
        top: 24,
        bottom: 24,
        left: 32,
        right: 32,
      });
    });

    it("opacity を number に変換する", () => {
      const result = parseXml('<Text opacity="0.5">test</Text>');
      expect((result[0] as Record<string, unknown>).opacity).toBe(0.5);
    });
  });

  // ===== テキストコンテンツの扱い =====
  describe("テキストコンテンツ", () => {
    it("Text ノードのテキストコンテンツを text プロパティに設定する", () => {
      const result = parseXml("<Text>Hello World</Text>");
      expect(result[0]).toHaveProperty("text", "Hello World");
    });

    it("Shape ノードのテキストコンテンツを text プロパティに設定する", () => {
      const result = parseXml('<Shape shapeType="rect">Hello</Shape>');
      expect(result[0]).toHaveProperty("text", "Hello");
    });

    it("text 属性がある場合はテキストコンテンツで上書きしない", () => {
      const result = parseXml('<Text text="from attr">from content</Text>');
      expect(result[0]).toHaveProperty("text", "from attr");
    });

    it("self-closing の Text で text 属性を使用する", () => {
      const result = parseXml('<Text text="hello" fontPx="16" />');
      expect(result[0]).toHaveProperty("text", "hello");
    });
  });

  // ===== ネスト構造 =====
  describe("ネスト構造", () => {
    it("深いネスト構造を正しく変換する", () => {
      const xml = `
        <VStack gap="16" padding="32">
          <Text fontPx="32" bold="true">Title</Text>
          <HStack gap="16">
            <Text fontPx="18" color="00AA00">Left</Text>
            <Text fontPx="18">Right</Text>
          </HStack>
        </VStack>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "vstack",
          gap: 16,
          padding: 32,
          children: [
            { type: "text", text: "Title", fontPx: 32, bold: true },
            {
              type: "hstack",
              gap: 16,
              children: [
                { type: "text", text: "Left", fontPx: 18, color: "00AA00" },
                { type: "text", text: "Right", fontPx: 18 },
              ],
            },
          ],
        },
      ]);
    });

    it("Box の中にコンテナノードをネストできる", () => {
      const xml = `
        <Box padding="20">
          <VStack gap="8">
            <Text>A</Text>
            <Text>B</Text>
          </VStack>
        </Box>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "box",
          padding: 20,
          children: {
            type: "vstack",
            gap: 8,
            children: [
              { type: "text", text: "A" },
              { type: "text", text: "B" },
            ],
          },
        },
      ]);
    });
  });

  // ===== 未知タグのエラー =====
  describe("未知タグのエラー", () => {
    it("組み込みノード以外のタグでエラーをスローする", () => {
      const xml = '<SectionCard title="KPI Summary" />';
      expect(() => parseXml(xml)).toThrow("Unknown tag: <SectionCard>");
    });

    it("未知タグがコンテナ内にある場合もエラーをスローする", () => {
      const xml = `
        <VStack>
          <MyComponent />
        </VStack>
      `;
      expect(() => parseXml(xml)).toThrow("Unknown tag: <MyComponent>");
    });
  });

  // ===== 複数ルート要素 =====
  describe("複数ルート要素", () => {
    it("複数のルート要素を配列として返す", () => {
      const xml = "<Text>Slide 1</Text><Text>Slide 2</Text>";
      const result = parseXml(xml);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: "text", text: "Slide 1" });
      expect(result[1]).toEqual({ type: "text", text: "Slide 2" });
    });
  });

  // ===== エッジケース =====
  describe("エッジケース", () => {
    it("空文字列で空配列を返す", () => {
      expect(parseXml("")).toEqual([]);
      expect(parseXml("  ")).toEqual([]);
    });

    it("backgroundImage を object として変換する", () => {
      const bg = JSON.stringify({ src: "bg.png", sizing: "cover" });
      const result = parseXml(
        `<VStack backgroundImage='${bg}'><Text>A</Text></VStack>`,
      );
      expect((result[0] as Record<string, unknown>).backgroundImage).toEqual({
        src: "bg.png",
        sizing: "cover",
      });
    });

    it("shadow を object として変換する", () => {
      const shadow = JSON.stringify({
        type: "outer",
        blur: 4,
        offset: 2,
        color: "000000",
      });
      const result = parseXml(`<Box shadow='${shadow}'><Text>A</Text></Box>`);
      expect((result[0] as Record<string, unknown>).shadow).toEqual({
        type: "outer",
        blur: 4,
        offset: 2,
        color: "000000",
      });
    });

    it("Chart の showLegend, showTitle を boolean に変換する", () => {
      const data = JSON.stringify([{ labels: ["A"], values: [1] }]);
      const result = parseXml(
        `<Chart chartType="pie" data='${data}' showLegend="true" showTitle="false" />`,
      );
      expect((result[0] as Record<string, unknown>).showLegend).toBe(true);
      expect((result[0] as Record<string, unknown>).showTitle).toBe(false);
    });

    it("不正な JSON 属性値でエラーをスローする", () => {
      expect(() =>
        parseXml('<Chart chartType="bar" data="not-json" />'),
      ).toThrow();
    });

    it("Box に複数子要素がある場合エラーをスローする", () => {
      expect(() => parseXml("<Box><Text>A</Text><Text>B</Text></Box>")).toThrow(
        "<Box> must have exactly 1 child element",
      );
    });

    it("boolean の不正値でエラーをスローする", () => {
      expect(() => parseXml('<Text bold="TRUE">x</Text>')).toThrow(
        'Cannot convert "TRUE" to boolean',
      );
      expect(() => parseXml('<Text bold="yes">x</Text>')).toThrow(
        'Cannot convert "yes" to boolean',
      );
    });

    it("Issue の比較例（XML）を正しく変換する", () => {
      const xml = `
        <VStack gap="16" padding="32">
          <Text fontPx="32" bold="true">売上レポート</Text>
          <HStack gap="16">
            <Chart chartType="bar" w="400" h="300"
              data='[{ "name": "Q1", "labels": ["1月","2月","3月"], "values": [100,120,90] }]'
            />
            <Text fontPx="18" color="00AA00">前年比 +15%</Text>
          </HStack>
        </VStack>
      `;
      const result = parseXml(xml);
      expect(result).toEqual([
        {
          type: "vstack",
          gap: 16,
          padding: 32,
          children: [
            {
              type: "text",
              text: "売上レポート",
              fontPx: 32,
              bold: true,
            },
            {
              type: "hstack",
              gap: 16,
              children: [
                {
                  type: "chart",
                  chartType: "bar",
                  w: 400,
                  h: 300,
                  data: [
                    {
                      name: "Q1",
                      labels: ["1月", "2月", "3月"],
                      values: [100, 120, 90],
                    },
                  ],
                },
                {
                  type: "text",
                  text: "前年比 +15%",
                  fontPx: 18,
                  color: "00AA00",
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  // ===== 子要素記法 =====
  describe("子要素記法", () => {
    // ----- ProcessArrow -----
    describe("ProcessArrow", () => {
      it("ProcessArrowStep 子要素から steps を構築する", () => {
        const xml = `
          <ProcessArrow direction="horizontal">
            <ProcessArrowStep label="Plan" color="1D4ED8" />
            <ProcessArrowStep label="Build" color="0EA5E9" />
            <ProcessArrowStep label="Launch" />
          </ProcessArrow>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "processArrow",
            direction: "horizontal",
            steps: [
              { label: "Plan", color: "1D4ED8" },
              { label: "Build", color: "0EA5E9" },
              { label: "Launch" },
            ],
          },
        ]);
      });

      it("textColor 属性も正しく変換する", () => {
        const xml = `
          <ProcessArrow>
            <ProcessArrowStep label="A" textColor="FFFFFF" />
          </ProcessArrow>
        `;
        const result = parseXml(xml);
        expect(
          (
            (result[0] as Record<string, unknown>).steps as Record<
              string,
              unknown
            >[]
          )[0].textColor,
        ).toBe("FFFFFF");
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const steps = JSON.stringify([
          { label: "Step 1" },
          { label: "Step 2" },
        ]);
        const result = parseXml(`<ProcessArrow steps='${steps}' />`);
        expect((result[0] as Record<string, unknown>).steps).toEqual([
          { label: "Step 1" },
          { label: "Step 2" },
        ]);
      });

      it("未知の子タグでエラーをスローする", () => {
        expect(() =>
          parseXml('<ProcessArrow><Unknown label="X" /></ProcessArrow>'),
        ).toThrow(
          "Unknown child element <Unknown> inside <ProcessArrow>. Expected: <ProcessArrowStep>",
        );
      });
    });

    // ----- Pyramid -----
    describe("Pyramid", () => {
      it("PyramidLevel 子要素から levels を構築する", () => {
        const xml = `
          <Pyramid direction="up">
            <PyramidLevel label="Strategy" color="E91E63" />
            <PyramidLevel label="Tactics" color="9C27B0" />
            <PyramidLevel label="Execution" />
          </Pyramid>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "pyramid",
            direction: "up",
            levels: [
              { label: "Strategy", color: "E91E63" },
              { label: "Tactics", color: "9C27B0" },
              { label: "Execution" },
            ],
          },
        ]);
      });

      it("textColor 属性も正しく変換する", () => {
        const xml = `
          <Pyramid>
            <PyramidLevel label="A" textColor="333333" />
          </Pyramid>
        `;
        const result = parseXml(xml);
        expect(
          (
            (result[0] as Record<string, unknown>).levels as Record<
              string,
              unknown
            >[]
          )[0].textColor,
        ).toBe("333333");
      });

      it("direction=down も変換する", () => {
        const xml = `
          <Pyramid direction="down">
            <PyramidLevel label="Top" color="4472C4" />
            <PyramidLevel label="Bottom" color="70AD47" />
          </Pyramid>
        `;
        const result = parseXml(xml);
        expect((result[0] as Record<string, unknown>).direction).toBe("down");
      });

      it("未知の子タグでエラーをスローする", () => {
        expect(() =>
          parseXml('<Pyramid><Unknown label="X" /></Pyramid>'),
        ).toThrow(
          "Unknown child element <Unknown> inside <Pyramid>. Expected: <PyramidLevel>",
        );
      });
    });

    // ----- Timeline -----
    describe("Timeline", () => {
      it("TimelineItem 子要素から items を構築する", () => {
        const xml = `
          <Timeline direction="horizontal">
            <TimelineItem date="2024-01" title="Launch" description="Product launch" color="1D4ED8" />
            <TimelineItem date="2024-06" title="Update" />
          </Timeline>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "timeline",
            direction: "horizontal",
            items: [
              {
                date: "2024-01",
                title: "Launch",
                description: "Product launch",
                color: "1D4ED8",
              },
              { date: "2024-06", title: "Update" },
            ],
          },
        ]);
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const items = JSON.stringify([{ date: "2024-01", title: "Start" }]);
        const result = parseXml(`<Timeline items='${items}' />`);
        expect((result[0] as Record<string, unknown>).items).toEqual([
          { date: "2024-01", title: "Start" },
        ]);
      });

      it("未知の子タグでエラーをスローする", () => {
        expect(() =>
          parseXml('<Timeline><Unknown date="X" /></Timeline>'),
        ).toThrow(
          "Unknown child element <Unknown> inside <Timeline>. Expected: <TimelineItem>",
        );
      });
    });

    // ----- Matrix -----
    describe("Matrix", () => {
      it("MatrixAxes/MatrixQuadrants/MatrixItem 子要素から構築する", () => {
        const xml = `
          <Matrix>
            <MatrixAxes x="Impact" y="Effort" />
            <MatrixQuadrants topLeft="Quick Wins" topRight="Major Projects" bottomLeft="Fill-Ins" bottomRight="Thankless Tasks" />
            <MatrixItem label="Feature A" x="0.8" y="0.2" color="1D4ED8" />
            <MatrixItem label="Feature B" x="0.3" y="0.7" />
          </Matrix>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "matrix",
            axes: { x: "Impact", y: "Effort" },
            quadrants: {
              topLeft: "Quick Wins",
              topRight: "Major Projects",
              bottomLeft: "Fill-Ins",
              bottomRight: "Thankless Tasks",
            },
            items: [
              { label: "Feature A", x: 0.8, y: 0.2, color: "1D4ED8" },
              { label: "Feature B", x: 0.3, y: 0.7 },
            ],
          },
        ]);
      });

      it("MatrixQuadrants なしでも動作する", () => {
        const xml = `
          <Matrix>
            <MatrixAxes x="X" y="Y" />
            <MatrixItem label="A" x="0.5" y="0.5" />
          </Matrix>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.axes).toEqual({ x: "X", y: "Y" });
        expect(node.quadrants).toBeUndefined();
        expect(node.items).toEqual([{ label: "A", x: 0.5, y: 0.5 }]);
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const axes = JSON.stringify({ x: "X", y: "Y" });
        const items = JSON.stringify([{ label: "A", x: 0.5, y: 0.5 }]);
        const result = parseXml(`<Matrix axes='${axes}' items='${items}' />`);
        const node = result[0] as Record<string, unknown>;
        expect(node.axes).toEqual({ x: "X", y: "Y" });
        expect(node.items).toEqual([{ label: "A", x: 0.5, y: 0.5 }]);
      });

      it("未知の子タグでエラーをスローする", () => {
        expect(() => parseXml('<Matrix><Unknown x="X" /></Matrix>')).toThrow(
          "Unknown child element <Unknown> inside <Matrix>. Expected: <MatrixAxes>, <MatrixQuadrants>, or <MatrixItem>",
        );
      });
    });

    // ----- Flow -----
    describe("Flow", () => {
      it("FlowNode/FlowConnection 子要素から構築する", () => {
        const xml = `
          <Flow direction="vertical">
            <FlowNode id="start" shape="flowChartTerminator" text="Start" />
            <FlowNode id="process" shape="flowChartProcess" text="Process" color="1D4ED8" />
            <FlowConnection from="start" to="process" label="next" />
          </Flow>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "flow",
            direction: "vertical",
            nodes: [
              {
                id: "start",
                shape: "flowChartTerminator",
                text: "Start",
              },
              {
                id: "process",
                shape: "flowChartProcess",
                text: "Process",
                color: "1D4ED8",
              },
            ],
            connections: [{ from: "start", to: "process", label: "next" }],
          },
        ]);
      });

      it("FlowNode と FlowConnection の混在順序を許容する", () => {
        const xml = `
          <Flow>
            <FlowNode id="a" shape="flowChartProcess" text="A" />
            <FlowConnection from="a" to="b" />
            <FlowNode id="b" shape="flowChartProcess" text="B" />
          </Flow>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.nodes).toHaveLength(2);
        expect(node.connections).toHaveLength(1);
      });

      it("FlowNode の数値属性を正しく変換する", () => {
        const xml = `
          <Flow>
            <FlowNode id="a" shape="flowChartProcess" text="A" width="200" height="100" />
          </Flow>
        `;
        const result = parseXml(xml);
        const nodes = (result[0] as Record<string, unknown>).nodes as Record<
          string,
          unknown
        >[];
        expect(nodes[0].width).toBe(200);
        expect(nodes[0].height).toBe(100);
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const nodes = JSON.stringify([
          { id: "1", shape: "flowChartProcess", text: "A" },
        ]);
        const connections = JSON.stringify([{ from: "1", to: "2" }]);
        const result = parseXml(
          `<Flow nodes='${nodes}' connections='${connections}' />`,
        );
        const node = result[0] as Record<string, unknown>;
        expect(node.nodes).toEqual([
          { id: "1", shape: "flowChartProcess", text: "A" },
        ]);
        expect(node.connections).toEqual([{ from: "1", to: "2" }]);
      });

      it("未知の子タグでエラーをスローする", () => {
        expect(() => parseXml('<Flow><Unknown id="x" /></Flow>')).toThrow(
          "Unknown child element <Unknown> inside <Flow>. Expected: <FlowNode> or <FlowConnection>",
        );
      });
    });

    // ----- Chart -----
    describe("Chart", () => {
      it("ChartSeries/ChartDataPoint 子要素から data を構築する", () => {
        const xml = `
          <Chart chartType="bar">
            <ChartSeries name="Q1">
              <ChartDataPoint label="1月" value="100" />
              <ChartDataPoint label="2月" value="120" />
              <ChartDataPoint label="3月" value="90" />
            </ChartSeries>
          </Chart>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "chart",
            chartType: "bar",
            data: [
              {
                name: "Q1",
                labels: ["1月", "2月", "3月"],
                values: [100, 120, 90],
              },
            ],
          },
        ]);
      });

      it("複数 ChartSeries を処理する", () => {
        const xml = `
          <Chart chartType="line">
            <ChartSeries name="2023">
              <ChartDataPoint label="Q1" value="100" />
              <ChartDataPoint label="Q2" value="200" />
            </ChartSeries>
            <ChartSeries name="2024">
              <ChartDataPoint label="Q1" value="150" />
              <ChartDataPoint label="Q2" value="250" />
            </ChartSeries>
          </Chart>
        `;
        const result = parseXml(xml);
        const data = (result[0] as Record<string, unknown>).data as Record<
          string,
          unknown
        >[];
        expect(data).toHaveLength(2);
        expect(data[0].name).toBe("2023");
        expect(data[1].name).toBe("2024");
      });

      it("name なしの ChartSeries を処理する", () => {
        const xml = `
          <Chart chartType="pie">
            <ChartSeries>
              <ChartDataPoint label="A" value="60" />
              <ChartDataPoint label="B" value="40" />
            </ChartSeries>
          </Chart>
        `;
        const result = parseXml(xml);
        const data = (result[0] as Record<string, unknown>).data as Record<
          string,
          unknown
        >[];
        expect(data[0].name).toBeUndefined();
        expect(data[0].labels).toEqual(["A", "B"]);
        expect(data[0].values).toEqual([60, 40]);
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const data = JSON.stringify([
          { name: "S1", labels: ["A"], values: [1] },
        ]);
        const result = parseXml(`<Chart chartType="bar" data='${data}' />`);
        expect((result[0] as Record<string, unknown>).data).toEqual([
          { name: "S1", labels: ["A"], values: [1] },
        ]);
      });

      it("Chart 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml('<Chart chartType="bar"><Unknown /></Chart>'),
        ).toThrow(
          "Unknown child element <Unknown> inside <Chart>. Expected: <ChartSeries>",
        );
      });

      it("ChartSeries 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml(
            '<Chart chartType="bar"><ChartSeries><Unknown /></ChartSeries></Chart>',
          ),
        ).toThrow(
          "Unknown child element <Unknown> inside <ChartSeries>. Expected: <ChartDataPoint>",
        );
      });
    });

    // ----- Table -----
    describe("Table", () => {
      it("TableColumn/TableRow/TableCell 子要素から columns/rows を構築する", () => {
        const xml = `
          <Table>
            <TableColumn width="200" />
            <TableColumn width="100" />
            <TableRow>
              <TableCell>太郎</TableCell>
              <TableCell>30</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>花子</TableCell>
              <TableCell>25</TableCell>
            </TableRow>
          </Table>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "table",
            columns: [{ width: 200 }, { width: 100 }],
            rows: [
              { cells: [{ text: "太郎" }, { text: "30" }] },
              { cells: [{ text: "花子" }, { text: "25" }] },
            ],
          },
        ]);
      });

      it("TableCell に属性（fontPx, bold等）を設定する", () => {
        const xml = `
          <Table>
            <TableColumn width="200" />
            <TableRow>
              <TableCell fontPx="14" bold="true" color="FF0000">Header</TableCell>
            </TableRow>
          </Table>
        `;
        const result = parseXml(xml);
        const rows = (result[0] as Record<string, unknown>).rows as Record<
          string,
          unknown
        >[];
        const cells = rows[0].cells as Record<string, unknown>[];
        expect(cells[0]).toEqual({
          text: "Header",
          fontPx: 14,
          bold: true,
          color: "FF0000",
        });
      });

      it("TableCell の text 属性がテキストコンテンツより優先される", () => {
        const xml = `
          <Table>
            <TableColumn />
            <TableRow>
              <TableCell text="from attr">from content</TableCell>
            </TableRow>
          </Table>
        `;
        const result = parseXml(xml);
        const rows = (result[0] as Record<string, unknown>).rows as Record<
          string,
          unknown
        >[];
        const cells = rows[0].cells as Record<string, unknown>[];
        expect(cells[0].text).toBe("from attr");
      });

      it("TableRow に height 属性を設定する", () => {
        const xml = `
          <Table>
            <TableColumn />
            <TableRow height="50">
              <TableCell>A</TableCell>
            </TableRow>
          </Table>
        `;
        const result = parseXml(xml);
        const rows = (result[0] as Record<string, unknown>).rows as Record<
          string,
          unknown
        >[];
        expect(rows[0].height).toBe(50);
      });

      it("TableColumn なしで TableRow のみを指定する", () => {
        const xml = `
          <Table>
            <TableRow>
              <TableCell>A</TableCell>
              <TableCell>B</TableCell>
            </TableRow>
          </Table>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.columns).toBeUndefined();
        expect(node.rows).toEqual([{ cells: [{ text: "A" }, { text: "B" }] }]);
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const columns = JSON.stringify([{ width: 100 }]);
        const rows = JSON.stringify([{ cells: [{ text: "A" }] }]);
        const result = parseXml(
          `<Table columns='${columns}' rows='${rows}' />`,
        );
        const node = result[0] as Record<string, unknown>;
        expect(node.columns).toEqual([{ width: 100 }]);
        expect(node.rows).toEqual([{ cells: [{ text: "A" }] }]);
      });

      it("TableRow 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml("<Table><TableRow><Unknown>x</Unknown></TableRow></Table>"),
        ).toThrow(
          "Unknown child element <Unknown> inside <TableRow>. Expected: <TableCell>",
        );
      });

      it("Table 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml('<Table><Unknown width="100" /></Table>'),
        ).toThrow(
          "Unknown child element <Unknown> inside <Table>. Expected: <TableColumn> or <TableRow>",
        );
      });

      it("TableCell に colspan/rowspan を設定する", () => {
        const xml = `
          <Table>
            <TableColumn width="100" />
            <TableColumn width="100" />
            <TableColumn width="100" />
            <TableRow>
              <TableCell colspan="3">Header</TableCell>
            </TableRow>
            <TableRow>
              <TableCell rowspan="2">Left</TableCell>
              <TableCell>A</TableCell>
              <TableCell>B</TableCell>
            </TableRow>
          </Table>
        `;
        const result = parseXml(xml);
        const rows = (result[0] as Record<string, unknown>).rows as Record<
          string,
          unknown
        >[];
        const row0Cells = rows[0].cells as Record<string, unknown>[];
        expect(row0Cells[0]).toEqual({ text: "Header", colspan: 3 });
        const row1Cells = rows[1].cells as Record<string, unknown>[];
        expect(row1Cells[0]).toEqual({ text: "Left", rowspan: 2 });
      });
    });

    // ----- Tree -----
    describe("Tree", () => {
      it("TreeItem の再帰的なネストを処理する", () => {
        const xml = `
          <Tree layout="vertical">
            <TreeItem label="CEO" color="1D4ED8">
              <TreeItem label="CTO">
                <TreeItem label="Dev Lead" />
              </TreeItem>
              <TreeItem label="CFO" />
            </TreeItem>
          </Tree>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "tree",
            layout: "vertical",
            data: {
              label: "CEO",
              color: "1D4ED8",
              children: [
                {
                  label: "CTO",
                  children: [{ label: "Dev Lead" }],
                },
                { label: "CFO" },
              ],
            },
          },
        ]);
      });

      it("子要素なしの TreeItem（リーフノード）を処理する", () => {
        const xml = `
          <Tree>
            <TreeItem label="Root" />
          </Tree>
        `;
        const result = parseXml(xml);
        expect((result[0] as Record<string, unknown>).data).toEqual({
          label: "Root",
        });
      });

      it("JSON 属性のみでも引き続き動作する（後方互換性）", () => {
        const data = JSON.stringify({
          label: "Root",
          children: [{ label: "A" }],
        });
        const result = parseXml(`<Tree data='${data}' />`);
        expect((result[0] as Record<string, unknown>).data).toEqual({
          label: "Root",
          children: [{ label: "A" }],
        });
      });

      it("Tree に複数の TreeItem があるとエラーをスローする", () => {
        expect(() =>
          parseXml('<Tree><TreeItem label="A" /><TreeItem label="B" /></Tree>'),
        ).toThrow(
          "<Tree> must have exactly 1 <TreeItem> child element, but got 2",
        );
      });

      it("Tree 内の未知タグでエラーをスローする", () => {
        expect(() => parseXml('<Tree><Unknown label="X" /></Tree>')).toThrow(
          "Unknown child element <Unknown> inside <Tree>. Expected: <TreeItem>",
        );
      });

      it("TreeItem 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml(
            '<Tree><TreeItem label="Root"><Unknown label="X" /></TreeItem></Tree>',
          ),
        ).toThrow(
          "Unknown child element <Unknown> inside <TreeItem>. Expected: <TreeItem>",
        );
      });
    });

    // ----- コンテナ内でのネスト -----
    describe("コンテナ内でのネスト", () => {
      it("VStack 内で Chart の子要素記法を使用できる", () => {
        const xml = `
          <VStack gap="16">
            <Text fontPx="24" bold="true">売上</Text>
            <Chart chartType="bar" w="400" h="300">
              <ChartSeries name="Q1">
                <ChartDataPoint label="1月" value="100" />
              </ChartSeries>
            </Chart>
          </VStack>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "vstack",
            gap: 16,
            children: [
              { type: "text", text: "売上", fontPx: 24, bold: true },
              {
                type: "chart",
                chartType: "bar",
                w: 400,
                h: 300,
                data: [{ name: "Q1", labels: ["1月"], values: [100] }],
              },
            ],
          },
        ]);
      });

      it("HStack 内で Table の子要素記法を使用できる", () => {
        const xml = `
          <HStack gap="16">
            <Table>
              <TableColumn width="200" />
              <TableRow><TableCell>A</TableCell></TableRow>
            </Table>
            <Text>Notes</Text>
          </HStack>
        `;
        const result = parseXml(xml);
        expect(result).toEqual([
          {
            type: "hstack",
            gap: 16,
            children: [
              {
                type: "table",
                columns: [{ width: 200 }],
                rows: [{ cells: [{ text: "A" }] }],
              },
              { type: "text", text: "Notes" },
            ],
          },
        ]);
      });
    });
  });

  // ===== バリデーション改善 =====
  describe("バリデーション改善", () => {
    describe("未知の属性名の検出", () => {
      it("未知の属性でエラーをスローする", () => {
        expect(() => parseXml('<Text fonPx="32">test</Text>')).toThrow(
          ParseXmlError,
        );
        try {
          parseXml('<Text fonPx="32">test</Text>');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors).toHaveLength(1);
          expect(err.errors[0]).toContain('Unknown attribute "fonPx"');
          expect(err.errors[0]).toContain('Did you mean "fontPx"');
        }
      });

      it("類似候補がない場合もエラーをスローする", () => {
        expect(() => parseXml('<Text zzzzz="32">test</Text>')).toThrow(
          ParseXmlError,
        );
        try {
          parseXml('<Text zzzzz="32">test</Text>');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors[0]).toContain('Unknown attribute "zzzzz"');
          expect(err.errors[0]).not.toContain("Did you mean");
        }
      });

      it("子要素の未知属性もエラーをスローする", () => {
        const xml = `
          <ProcessArrow>
            <ProcessArrowStep labl="A" />
          </ProcessArrow>
        `;
        expect(() => parseXml(xml)).toThrow(ParseXmlError);
        try {
          parseXml(xml);
        } catch (e) {
          const err = e as ParseXmlError;
          expect(
            err.errors.some((e) => e.includes('Unknown attribute "labl"')),
          ).toBe(true);
        }
      });

      it("x/y 属性は許可される（Layer 子要素用）", () => {
        const xml = '<Text x="10" y="20">test</Text>';
        const result = parseXml(xml);
        expect(result[0]).toHaveProperty("x", 10);
        expect(result[0]).toHaveProperty("y", 20);
      });
    });

    describe("属性値の型不一致", () => {
      it("enum 不一致でエラーをスローする", () => {
        expect(() => parseXml('<Text alignText="LEFT">test</Text>')).toThrow(
          ParseXmlError,
        );
        try {
          parseXml('<Text alignText="LEFT">test</Text>');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors.some((e) => e.includes("alignText"))).toBe(true);
        }
      });

      it("数値範囲違反でエラーをスローする", () => {
        expect(() => parseXml('<Text opacity="2">test</Text>')).toThrow(
          ParseXmlError,
        );
        try {
          parseXml('<Text opacity="2">test</Text>');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors.some((e) => e.includes("opacity"))).toBe(true);
        }
      });

      it("不正な shapeType でエラーをスローする", () => {
        expect(() =>
          parseXml('<Shape shapeType="invalid_shape" w="100" h="100" />'),
        ).toThrow(ParseXmlError);
        try {
          parseXml('<Shape shapeType="invalid_shape" w="100" h="100" />');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors.some((e) => e.includes("shapeType"))).toBe(true);
        }
      });
    });

    describe("必須属性の欠落", () => {
      it("Image の src 欠落でエラーをスローする", () => {
        expect(() => parseXml('<Image w="400" h="300" />')).toThrow(
          ParseXmlError,
        );
        try {
          parseXml('<Image w="400" h="300" />');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors.some((e) => e.includes('"src"'))).toBe(true);
        }
      });

      it("Line の座標欠落でエラーをスローする", () => {
        expect(() => parseXml('<Line x1="0" y1="0" />')).toThrow(ParseXmlError);
        try {
          parseXml('<Line x1="0" y1="0" />');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(
            err.errors.some((e) => e.includes('"x2"') || e.includes('"y2"')),
          ).toBe(true);
        }
      });
    });

    describe("不正な子要素の検出", () => {
      it("リーフノードに子要素があるとエラーをスローする", () => {
        const xml = "<Image><Text>x</Text></Image>";
        expect(() => parseXml(xml)).toThrow(ParseXmlError);
        try {
          parseXml(xml);
        } catch (e) {
          const err = e as ParseXmlError;
          expect(
            err.errors.some((e) =>
              e.includes("does not accept child elements"),
            ),
          ).toBe(true);
        }
      });
    });

    describe("複数エラーの一括報告", () => {
      it("1つの XML に複数のエラーがある場合すべて報告する", () => {
        const xml = `
          <VStack>
            <Text fonPx="32" alignText="LEFT">A</Text>
            <Image w="400" />
          </VStack>
        `;
        expect(() => parseXml(xml)).toThrow(ParseXmlError);
        try {
          parseXml(xml);
        } catch (e) {
          const err = e as ParseXmlError;
          // 少なくとも2つ以上のエラーが報告される
          expect(err.errors.length).toBeGreaterThanOrEqual(2);
          // Unknown attribute fonPx
          expect(err.errors.some((e) => e.includes("fonPx"))).toBe(true);
          // Missing src on Image
          expect(err.errors.some((e) => e.includes("src"))).toBe(true);
        }
      });

      it("ParseXmlError の errors プロパティでプログラム的にアクセスできる", () => {
        expect.assertions(4);
        try {
          parseXml('<Image w="400" />');
        } catch (e) {
          expect(e).toBeInstanceOf(ParseXmlError);
          const err = e as ParseXmlError;
          expect(Array.isArray(err.errors)).toBe(true);
          expect(err.errors.length).toBeGreaterThan(0);
          expect(err.message).toContain("XML validation failed");
        }
      });
    });

    describe("正常な XML は引き続き動作する", () => {
      it("有効な属性のみの場合エラーにならない", () => {
        const xml = `
          <VStack gap="16" padding="32">
            <Text fontPx="32" bold="true" color="FF0000">Hello</Text>
            <Image src="test.png" w="400" h="300" />
            <Shape shapeType="rect" w="200" h="100">Label</Shape>
          </VStack>
        `;
        expect(() => parseXml(xml)).not.toThrow();
      });

      it("opacity の有効な範囲の値は通る", () => {
        expect(() => parseXml('<Text opacity="0">test</Text>')).not.toThrow();
        expect(() => parseXml('<Text opacity="1">test</Text>')).not.toThrow();
        expect(() => parseXml('<Text opacity="0.5">test</Text>')).not.toThrow();
      });
    });

    describe("ネストデータのバリデーション", () => {
      it("Tree の data 内でネストした必須項目欠落をエラーにする", () => {
        const data = JSON.stringify({
          label: "root",
          children: [{}],
        });
        expect(() => parseXml(`<Tree data='${data}' />`)).toThrow(
          ParseXmlError,
        );
      });

      it("Chart の data 内で labels 欠落をエラーにする", () => {
        const data = JSON.stringify([{ name: "S", values: [1] }]);
        expect(() =>
          parseXml(`<Chart chartType="bar" data='${data}' />`),
        ).toThrow(ParseXmlError);
      });
    });
  });
});
