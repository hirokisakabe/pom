import { describe, it, expect } from "vitest";
import { parseXml as parseXmlRaw, ParseXmlError } from "./parseXml.ts";

// Most tests below validate slide-content parsing. They predate the
// `<Slide>` wrapper requirement, so a helper transparently wraps single-slide
// content. Tests that exercise top-level behavior (multi-slide, missing
// `<Slide>`, etc.) call `parseXmlRaw` directly.
const parseXml = (xml: string) => parseXmlRaw(`<Slide>${xml}</Slide>`);

describe("parseXml", () => {
  // ===== 基本的なノード変換 =====
  describe("ノードタイプ変換", () => {
    it("Text ノードを変換する", () => {
      const result = parseXml('<Text fontSize="32" bold="true">Hello</Text>');
      expect(result).toEqual([
        { type: "text", text: "Hello", fontSize: 32, bold: true },
      ]);
    });

    it("Text ノードの rotate 属性を number に変換する", () => {
      const result = parseXml('<Text rotate="15">Hello</Text>');
      expect(result).toEqual([{ type: "text", text: "Hello", rotate: 15 }]);
    });

    it("Image ノードを変換する（self-closing）", () => {
      const result = parseXml('<Image src="image.png" w="400" h="300" />');
      expect(result).toEqual([
        { type: "image", src: "image.png", w: 400, h: 300 },
      ]);
    });

    it("Image ノードの rotate 属性を number に変換する", () => {
      const result = parseXml('<Image src="image.png" rotate="-30" />');
      expect(result).toEqual([
        { type: "image", src: "image.png", rotate: -30 },
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

    it("Shape ノードの rotate 属性を number に変換する", () => {
      const result = parseXml('<Shape shapeType="rect" rotate="45" />');
      expect(result).toEqual([
        { type: "shape", shapeType: "rect", rotate: 45 },
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

    it("Arrow ノードを変換する", () => {
      const result = parseXml('<Arrow from="a" to="b" />');
      expect(result).toEqual([{ type: "arrow", from: "a", to: "b" }]);
    });

    it("Arrow ノードのスタイル属性を変換する", () => {
      const result = parseXml(
        '<Arrow from="a" to="b" color="FF0000" lineWidth="2" endArrow="true" beginArrow="true" dashType="dash" />',
      );
      expect(result).toEqual([
        {
          type: "arrow",
          from: "a",
          to: "b",
          color: "FF0000",
          lineWidth: 2,
          endArrow: true,
          beginArrow: true,
          dashType: "dash",
        },
      ]);
    });

    it("Icon ノードを変換する", () => {
      const result = parseXml('<Icon name="cpu" size="32" color="#1D4ED8" />');
      expect(result).toEqual([
        { type: "icon", name: "cpu", size: 32, color: "#1D4ED8" },
      ]);
    });

    it("Icon ノードの rotate 属性を number に変換する", () => {
      const result = parseXml('<Icon name="cpu" rotate="90" />');
      expect(result).toEqual([{ type: "icon", name: "cpu", rotate: 90 }]);
    });

    it("Icon ノードでデフォルト値を使う", () => {
      const result = parseXml('<Icon name="star" />');
      expect(result).toEqual([{ type: "icon", name: "star" }]);
    });

    it("Icon ノードで不正な name はエラーになる", () => {
      expect(() => parseXml('<Icon name="invalid-icon" />')).toThrow();
    });

    it("Icon ノードで不正な size はエラーになる", () => {
      expect(() => parseXml('<Icon name="cpu" size="-1" />')).toThrow();
    });

    it("Icon ノードで # なし hex color を受け付け、# 付きに正規化する", () => {
      const result = parseXml('<Icon name="cpu" color="1D4ED8" />');
      expect(result).toEqual([{ type: "icon", name: "cpu", color: "#1D4ED8" }]);
    });

    it("Icon ノードで不正な color はエラーになる", () => {
      expect(() =>
        parseXml('<Icon name="cpu" color="not-a-color" />'),
      ).toThrow();
    });

    it("Icon ノードで子要素はエラーになる", () => {
      expect(() =>
        parseXml(
          '<Icon name="cpu"><svg viewBox="0 0 24 24"><path d="M12 2"/></svg></Icon>',
        ),
      ).toThrow();
    });

    it("Icon ノードで name がない場合はエラーになる", () => {
      expect(() => parseXml("<Icon />")).toThrow();
    });

    it("Svg ノードでインライン SVG を変換する", () => {
      const result = parseXml(
        '<Svg w="32" h="32"><svg viewBox="0 0 24 24"><path d="M12 2L2 22h20z"/></svg></Svg>',
      );
      expect(result).toEqual([
        {
          type: "svg",
          w: 32,
          h: 32,
          svgContent: expect.stringContaining("<svg") as string,
        },
      ]);
      // svgContent に path が含まれることを確認
      expect((result[0] as Record<string, unknown>).svgContent).toContain(
        "M12 2L2 22h20z",
      );
    });

    it("Svg ノードで color を指定できる", () => {
      const result = parseXml(
        '<Svg w="32" h="32" color="1D4ED8"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></Svg>',
      );
      expect(result).toEqual([
        {
          type: "svg",
          w: 32,
          h: 32,
          color: "#1D4ED8",
          svgContent: expect.stringContaining("<svg") as string,
        },
      ]);
    });

    it("Svg ノードで svg 以外の子要素はエラーになる", () => {
      expect(() => parseXml("<Svg><Text>hello</Text></Svg>")).toThrow();
    });

    it("Svg ノードで svg 子要素がない場合はエラーになる", () => {
      expect(() => parseXml("<Svg />")).toThrow();
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

    it("Table の cellBorder を JSON 形式で変換する", () => {
      const result = parseXml(
        `<Table cellBorder='{"color":"334155","width":1}'><Tr><Td>A</Td></Tr></Table>`,
      );
      const table = result[0] as Record<string, unknown>;
      expect(table.cellBorder).toEqual({ color: "334155", width: 1 });
    });

    it("Table の cellBorder をドット記法で変換する", () => {
      const result = parseXml(
        `<Table cellBorder.color="334155" cellBorder.width="2"><Tr><Td>A</Td></Tr></Table>`,
      );
      const table = result[0] as Record<string, unknown>;
      expect(table.cellBorder).toEqual({ color: "334155", width: 2 });
    });

    it("Table の cellBorder 省略時はプロパティが存在しない", () => {
      const result = parseXml(`<Table><Tr><Td>A</Td></Tr></Table>`);
      const table = result[0] as Record<string, unknown>;
      expect(table.cellBorder).toBeUndefined();
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

    it("空の VStack で children を空配列として扱う", () => {
      const result = parseXml('<VStack grow="1" />');
      expect(result).toEqual([
        {
          type: "vstack",
          grow: 1,
          children: [],
        },
      ]);
    });

    it("空の HStack で children を空配列として扱う", () => {
      const result = parseXml('<HStack grow="1" />');
      expect(result).toEqual([
        {
          type: "hstack",
          grow: 1,
          children: [],
        },
      ]);
    });

    it("空の Layer で children を空配列として扱う", () => {
      const result = parseXml('<Layer w="100" h="100" />');
      expect(result).toEqual([
        {
          type: "layer",
          w: 100,
          h: 100,
          children: [],
        },
      ]);
    });

    it("Layer で children を配列として変換する", () => {
      const xml = `
        <Layer w="800" h="600">
          <Text x="10" y="20" fontSize="32">Hello</Text>
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
            { type: "text", x: 10, y: 20, fontSize: 32, text: "Hello" },
            { type: "image", x: 100, y: 200, src: "img.png" },
          ],
        },
      ]);
    });
  });

  // ===== 属性値の型変換 =====
  describe("属性値の型変換", () => {
    it("number 型に変換する", () => {
      const result = parseXml('<Text fontSize="24">test</Text>');
      expect(result[0]).toHaveProperty("fontSize", 24);
      expect(typeof (result[0] as Record<string, unknown>).fontSize).toBe(
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

    it("ドット記法で object 型属性を変換する", () => {
      const result = parseXml(
        '<Text border.color="000000" border.width="2">test</Text>',
      );
      expect((result[0] as Record<string, unknown>).border).toEqual({
        color: "000000",
        width: 2,
      });
    });

    it("辺ごとの borderTop / borderRight / borderBottom / borderLeft を変換する", () => {
      const result = parseXml(
        '<Text borderTop.color="FF0000" borderTop.width="4" borderRight.dashType="dash" borderBottom.width="1" borderLeft.color="0000FF">test</Text>',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.borderTop).toEqual({ color: "FF0000", width: 4 });
      expect(node.borderRight).toEqual({ dashType: "dash" });
      expect(node.borderBottom).toEqual({ width: 1 });
      expect(node.borderLeft).toEqual({ color: "0000FF" });
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

      // object（ドット記法）
      const r2 = parseXml(
        '<Text underline.style="dbl" underline.color="FF0000">test</Text>',
      );
      expect((r2[0] as Record<string, unknown>).underline).toEqual({
        style: "dbl",
        color: "FF0000",
      });
    });

    it("Ul + Li を正しくパースする", () => {
      const result = parseXml(
        '<Ul fontSize="14"><Li>Item A</Li><Li>Item B</Li></Ul>',
      );
      expect(result).toHaveLength(1);
      const node = result[0] as Record<string, unknown>;
      expect(node.type).toBe("ul");
      expect(node.fontSize).toBe(14);
      expect(node.items).toEqual([{ text: "Item A" }, { text: "Item B" }]);
    });

    it("Ol + Li を正しくパースする", () => {
      const result = parseXml(
        '<Ol fontSize="14" numberType="alphaLcPeriod" numberStartAt="3"><Li>A</Li><Li>B</Li></Ol>',
      );
      expect(result).toHaveLength(1);
      const node = result[0] as Record<string, unknown>;
      expect(node.type).toBe("ol");
      expect(node.fontSize).toBe(14);
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
      const result = parseXml('<Text textAlign="center">test</Text>');
      expect((result[0] as Record<string, unknown>).textAlign).toBe("center");
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

    it("opacity を number に変換する", () => {
      const result = parseXml('<Text opacity="0.5">test</Text>');
      expect((result[0] as Record<string, unknown>).opacity).toBe(0.5);
    });

    it("grow を number に変換する", () => {
      const result = parseXml('<Text grow="2">test</Text>');
      expect((result[0] as Record<string, unknown>).grow).toBe(2);
    });

    it("grow に 0 を指定するとエラーになる", () => {
      expect(() => parseXml('<Text grow="0">test</Text>')).toThrow(
        ParseXmlError,
      );
    });

    it("grow に負数を指定するとエラーになる", () => {
      expect(() => parseXml('<Text grow="-1">test</Text>')).toThrow(
        ParseXmlError,
      );
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
      const result = parseXml('<Text text="hello" fontSize="16" />');
      expect(result[0]).toHaveProperty("text", "hello");
    });
  });

  // ===== インラインフォーマット (B/I タグ) =====
  describe("インラインフォーマット", () => {
    it("B タグを太字の run に変換する", () => {
      const result = parseXml("<Text>通常 <B>太字</B> テキスト</Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 太字 テキスト",
        runs: [
          { text: "通常 " },
          { text: "太字", bold: true },
          { text: " テキスト" },
        ],
      });
    });

    it("I タグを斜体の run に変換する", () => {
      const result = parseXml("<Text>通常 <I>斜体</I> テキスト</Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 斜体 テキスト",
        runs: [
          { text: "通常 " },
          { text: "斜体", italic: true },
          { text: " テキスト" },
        ],
      });
    });

    it("B と I のネストを処理する", () => {
      const result = parseXml("<Text><B><I>太字斜体</I></B></Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "太字斜体",
        runs: [{ text: "太字斜体", bold: true, italic: true }],
      });
    });

    it("B/I が無い場合は runs を持たない", () => {
      const result = parseXml("<Text>プレーンテキスト</Text>");
      expect(result[0]).toEqual({
        type: "text",
        text: "プレーンテキスト",
      });
      expect(result[0]).not.toHaveProperty("runs");
    });

    it("Li 内の B タグを処理する", () => {
      const result = parseXml("<Ul><Li>通常 <B>太字</B></Li></Ul>");
      const ulNode = result[0] as Record<string, unknown>;
      const items = ulNode.items as Record<string, unknown>[];
      expect(items[0]).toMatchObject({
        text: "通常 太字",
        runs: [{ text: "通常 " }, { text: "太字", bold: true }],
      });
    });

    it("Td 内の B タグを処理する", () => {
      const result = parseXml(
        "<Table><Tr><Td><B>太字</B> セル</Td></Tr></Table>",
      );
      const tableNode = result[0] as Record<string, unknown>;
      const rows = tableNode.rows as Record<string, unknown>[];
      const cells = rows[0].cells as Record<string, unknown>[];
      expect(cells[0]).toMatchObject({
        text: "太字 セル",
        runs: [{ text: "太字", bold: true }, { text: " セル" }],
      });
    });

    it("A タグを href 付きの run に変換する", () => {
      const result = parseXml(
        '<Text>通常 <A href="https://example.com">リンク</A> テキスト</Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 リンク テキスト",
        runs: [
          { text: "通常 " },
          { text: "リンク", href: "https://example.com" },
          { text: " テキスト" },
        ],
      });
    });

    it("A タグと B タグのネストを処理する", () => {
      const result = parseXml(
        '<Text><A href="https://example.com"><B>太字リンク</B></A></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "太字リンク",
        runs: [{ text: "太字リンク", bold: true, href: "https://example.com" }],
      });
    });

    it("Li 内の A タグを処理する", () => {
      const result = parseXml(
        '<Ul><Li>詳細は <A href="https://example.com">こちら</A></Li></Ul>',
      );
      const ulNode = result[0] as Record<string, unknown>;
      const items = ulNode.items as Record<string, unknown>[];
      expect(items[0]).toMatchObject({
        text: "詳細は こちら",
        runs: [
          { text: "詳細は " },
          { text: "こちら", href: "https://example.com" },
        ],
      });
    });

    it("Td 内の A タグを処理する", () => {
      const result = parseXml(
        '<Table><Tr><Td><A href="https://example.com">リンク</A></Td></Tr></Table>',
      );
      const tableNode = result[0] as Record<string, unknown>;
      const rows = tableNode.rows as Record<string, unknown>[];
      const cells = rows[0].cells as Record<string, unknown>[];
      expect(cells[0]).toMatchObject({
        text: "リンク",
        runs: [{ text: "リンク", href: "https://example.com" }],
      });
    });

    it("U タグを下線の run に変換する", () => {
      const result = parseXml("<Text>通常 <U>下線</U> テキスト</Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 下線 テキスト",
        runs: [
          { text: "通常 " },
          { text: "下線", underline: true },
          { text: " テキスト" },
        ],
      });
    });

    it("S タグを取り消し線の run に変換する", () => {
      const result = parseXml("<Text>通常 <S>取り消し</S> テキスト</Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 取り消し テキスト",
        runs: [
          { text: "通常 " },
          { text: "取り消し", strike: true },
          { text: " テキスト" },
        ],
      });
    });

    it("Sub タグを subscript の run に変換する", () => {
      const result = parseXml("<Text>H<Sub>2</Sub>O</Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "H2O",
        runs: [{ text: "H" }, { text: "2", subscript: true }, { text: "O" }],
      });
    });

    it("Sup タグを superscript の run に変換する", () => {
      const result = parseXml("<Text>x<Sup>2</Sup></Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "x2",
        runs: [{ text: "x" }, { text: "2", superscript: true }],
      });
    });

    it("ネストした Sub / Sup は内側の指定を優先して相互排他化する", () => {
      const result = parseXml("<Text><Sub><Sup>x</Sup></Sub></Text>");
      const runs = (result[0] as Record<string, unknown>).runs as Record<
        string,
        unknown
      >[];
      expect(runs[0].text).toBe("x");
      expect(runs[0].superscript).toBe(true);
      expect(runs[0].subscript).toBeUndefined();
    });

    it("Text 全体に subscript / superscript 属性が指定できる", () => {
      const sup = parseXml('<Text superscript="true">注釈</Text>');
      expect(sup[0]).toMatchObject({
        type: "text",
        text: "注釈",
        superscript: true,
      });
      const sub = parseXml('<Text subscript="true">添字</Text>');
      expect(sub[0]).toMatchObject({
        type: "text",
        text: "添字",
        subscript: true,
      });
    });

    it("Mark タグをハイライトの run に変換する", () => {
      const result = parseXml(
        '<Text>通常 <Mark color="FFFF00">ハイライト</Mark> テキスト</Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 ハイライト テキスト",
        runs: [
          { text: "通常 " },
          { text: "ハイライト", highlight: "FFFF00" },
          { text: " テキスト" },
        ],
      });
    });

    it("Mark タグの color 省略時はデフォルト FFFF00 になる", () => {
      const result = parseXml("<Text><Mark>ハイライト</Mark></Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "ハイライト",
        runs: [{ text: "ハイライト", highlight: "FFFF00" }],
      });
    });

    it("B と U のネストを処理する", () => {
      const result = parseXml("<Text><B><U>太字下線</U></B></Text>");
      expect(result[0]).toMatchObject({
        type: "text",
        text: "太字下線",
        runs: [{ text: "太字下線", bold: true, underline: true }],
      });
    });

    it("Li 内の U タグを処理する", () => {
      const result = parseXml("<Ul><Li>通常 <U>下線</U></Li></Ul>");
      const ulNode = result[0] as Record<string, unknown>;
      const items = ulNode.items as Record<string, unknown>[];
      expect(items[0]).toMatchObject({
        text: "通常 下線",
        runs: [{ text: "通常 " }, { text: "下線", underline: true }],
      });
    });

    it("Td 内の S タグを処理する", () => {
      const result = parseXml(
        "<Table><Tr><Td><S>取り消し</S> セル</Td></Tr></Table>",
      );
      const tableNode = result[0] as Record<string, unknown>;
      const rows = tableNode.rows as Record<string, unknown>[];
      const cells = rows[0].cells as Record<string, unknown>[];
      expect(cells[0]).toMatchObject({
        text: "取り消し セル",
        runs: [{ text: "取り消し", strike: true }, { text: " セル" }],
      });
    });

    it("Li 内の Mark タグを処理する", () => {
      const result = parseXml(
        '<Ul><Li><Mark color="00FF00">ハイライト</Mark> アイテム</Li></Ul>',
      );
      const ulNode = result[0] as Record<string, unknown>;
      const items = ulNode.items as Record<string, unknown>[];
      expect(items[0]).toMatchObject({
        text: "ハイライト アイテム",
        runs: [
          { text: "ハイライト", highlight: "00FF00" },
          { text: " アイテム" },
        ],
      });
    });

    it("Td 内の Mark タグを処理する", () => {
      const result = parseXml(
        '<Table><Tr><Td><Mark color="FFFF00">ハイライト</Mark> セル</Td></Tr></Table>',
      );
      const tableNode = result[0] as Record<string, unknown>;
      const rows = tableNode.rows as Record<string, unknown>[];
      const cells = rows[0].cells as Record<string, unknown>[];
      expect(cells[0]).toMatchObject({
        text: "ハイライト セル",
        runs: [{ text: "ハイライト", highlight: "FFFF00" }, { text: " セル" }],
      });
    });

    it("Mark タグの color が空文字の場合はデフォルト FFFF00 になる", () => {
      const result = parseXml('<Text><Mark color="">ハイライト</Mark></Text>');
      expect(result[0]).toMatchObject({
        type: "text",
        text: "ハイライト",
        runs: [{ text: "ハイライト", highlight: "FFFF00" }],
      });
    });

    it("Span タグをインラインカラーの run に変換する", () => {
      const result = parseXml(
        '<Text>通常 <Span color="FF0000">赤色</Span> テキスト</Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 赤色 テキスト",
        runs: [
          { text: "通常 " },
          { text: "赤色", color: "FF0000" },
          { text: " テキスト" },
        ],
      });
    });

    it("Span タグと B タグをネストできる", () => {
      const result = parseXml(
        '<Text><B><Span color="1D4ED8">太字で青</Span></B></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "太字で青",
        runs: [{ text: "太字で青", bold: true, color: "1D4ED8" }],
      });
    });

    it("Li 内の Span タグを処理する", () => {
      const result = parseXml(
        '<Ul><Li><Span color="FF0000">赤</Span> アイテム</Li></Ul>',
      );
      const ulNode = result[0] as Record<string, unknown>;
      const items = ulNode.items as Record<string, unknown>[];
      expect(items[0]).toMatchObject({
        text: "赤 アイテム",
        runs: [{ text: "赤", color: "FF0000" }, { text: " アイテム" }],
      });
    });

    it("Span ネスト時に内側が color 未指定なら親の色を継承する", () => {
      const result = parseXml(
        '<Text><Span color="FF0000">A<Span>B</Span>C</Span></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "ABC",
        runs: [
          { text: "A", color: "FF0000" },
          { text: "B", color: "FF0000" },
          { text: "C", color: "FF0000" },
        ],
      });
    });

    it("Text の letterSpacing 属性を number に変換する", () => {
      const result = parseXml('<Text letterSpacing="4">字間広め</Text>');
      expect(result[0]).toMatchObject({
        type: "text",
        text: "字間広め",
        letterSpacing: 4,
      });
    });

    it("Span タグの letterSpacing を run に変換する", () => {
      const result = parseXml(
        '<Text>通常 <Span letterSpacing="6">字間広め</Span> テキスト</Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "通常 字間広め テキスト",
        runs: [
          { text: "通常 " },
          { text: "字間広め", letterSpacing: 6 },
          { text: " テキスト" },
        ],
      });
    });

    it("Span タグの fontSize を run に変換する", () => {
      const result = parseXml(
        '<Text fontSize="52">¥84.2<Span fontSize="18">M</Span></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "¥84.2M",
        fontSize: 52,
        runs: [{ text: "¥84.2" }, { text: "M", fontSize: 18 }],
      });
    });

    it("Span ネスト時に内側が fontSize 未指定なら親の値を継承する", () => {
      const result = parseXml(
        '<Text><Span fontSize="40">A<Span>B</Span>C</Span></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "ABC",
        runs: [
          { text: "A", fontSize: 40 },
          { text: "B", fontSize: 40 },
          { text: "C", fontSize: 40 },
        ],
      });
    });

    it("Span ネスト時に内側が letterSpacing 未指定なら親の値を継承する", () => {
      const result = parseXml(
        '<Text><Span letterSpacing="6">A<Span>B</Span>C</Span></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "ABC",
        runs: [
          { text: "A", letterSpacing: 6 },
          { text: "B", letterSpacing: 6 },
          { text: "C", letterSpacing: 6 },
        ],
      });
    });

    it("Span ネスト時に内側が color 指定なら上書きする", () => {
      const result = parseXml(
        '<Text><Span color="FF0000">A<Span color="1D4ED8">B</Span>C</Span></Text>',
      );
      expect(result[0]).toMatchObject({
        type: "text",
        text: "ABC",
        runs: [
          { text: "A", color: "FF0000" },
          { text: "B", color: "1D4ED8" },
          { text: "C", color: "FF0000" },
        ],
      });
    });

    it("Td 内の Span タグを処理する", () => {
      const result = parseXml(
        '<Table><Tr><Td><Span color="1D4ED8">青</Span> セル</Td></Tr></Table>',
      );
      const tableNode = result[0] as Record<string, unknown>;
      const rows = tableNode.rows as Record<string, unknown>[];
      const cells = rows[0].cells as Record<string, unknown>[];
      expect(cells[0]).toMatchObject({
        text: "青 セル",
        runs: [{ text: "青", color: "1D4ED8" }, { text: " セル" }],
      });
    });

    it("Text 内のインラインフォーマットタグ以外の子要素はエラーになる", () => {
      expect(() => parseXml("<Text><B>ok</B><Foo>ng</Foo></Text>")).toThrow();
    });
  });

  // ===== ネスト構造 =====
  describe("ネスト構造", () => {
    it("深いネスト構造を正しく変換する", () => {
      const xml = `
        <VStack gap="16" padding="32">
          <Text fontSize="32" bold="true">Title</Text>
          <HStack gap="16">
            <Text fontSize="18" color="00AA00">Left</Text>
            <Text fontSize="18">Right</Text>
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
            { type: "text", text: "Title", fontSize: 32, bold: true },
            {
              type: "hstack",
              gap: 16,
              children: [
                { type: "text", text: "Left", fontSize: 18, color: "00AA00" },
                { type: "text", text: "Right", fontSize: 18 },
              ],
            },
          ],
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

  // ===== 複数 Slide =====
  // ===== Theme トークン =====
  describe("Theme トークン", () => {
    it("色属性の $name 参照をトークン値に解決する", () => {
      const result = parseXmlRaw(`
        <Theme accent="1D4ED8" surface="1E293B" />
        <Slide>
          <VStack backgroundColor="$surface">
            <Text color="$accent">Hello</Text>
          </VStack>
        </Slide>
      `);
      expect(result).toEqual([
        {
          type: "vstack",
          backgroundColor: "1E293B",
          children: [{ type: "text", text: "Hello", color: "1D4ED8" }],
        },
      ]);
    });

    it("宣言値と参照の # プレフィックスを許容する", () => {
      const result = parseXmlRaw(`
        <Theme accent="#1D4ED8" />
        <Slide>
          <Text color="#$accent">Hello</Text>
        </Slide>
      `);
      expect((result[0] as Record<string, unknown>).color).toBe("#1D4ED8");
    });

    it("子要素・ドット記法・JSON 配列内の色属性も解決する", () => {
      const result = parseXmlRaw(`
        <Theme accent="1D4ED8" muted="94A3B8" />
        <Slide>
          <VStack border.color="$muted" borderLeft.color="$accent">
            <Timeline dateColor="$muted">
              <TimelineItem date="Q1" title="A" color="$accent" />
            </Timeline>
            <Chart chartType="bar" chartColors='["$accent","$muted"]'>
              <ChartSeries name="S"><ChartDataPoint label="a" value="1" /></ChartSeries>
            </Chart>
          </VStack>
        </Slide>
      `);
      const vstack = result[0] as Record<string, unknown>;
      expect(vstack.border).toEqual({ color: "94A3B8" });
      expect(vstack.borderLeft).toEqual({ color: "1D4ED8" });
      const children = vstack.children as Record<string, unknown>[];
      expect(children[0].dateColor).toBe("94A3B8");
      expect(children[0].items).toEqual([
        { date: "Q1", title: "A", color: "1D4ED8" },
      ]);
      expect(children[1].chartColors).toEqual(["1D4ED8", "94A3B8"]);
    });

    it("backgroundGradient 内の $name 参照を解決する", () => {
      const result = parseXmlRaw(`
        <Theme g1="667EEA" g2="764BA2" />
        <Slide>
          <VStack backgroundGradient="linear-gradient(135deg, $g1 0%, $g2 100%)">
            <Text>Hello</Text>
          </VStack>
        </Slide>
      `);
      expect((result[0] as Record<string, unknown>).backgroundGradient).toBe(
        "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
      );
    });

    it("radial-gradient 内の $name 参照を解決する", () => {
      const result = parseXmlRaw(`
        <Theme g1="667EEA" g2="764BA2" />
        <Slide>
          <VStack backgroundGradient="radial-gradient(circle at center, $g1 0%, $g2 100%)">
            <Text>Hello</Text>
          </VStack>
        </Slide>
      `);
      expect((result[0] as Record<string, unknown>).backgroundGradient).toBe(
        "radial-gradient(circle at center, #667EEA 0%, #764BA2 100%)",
      );
    });

    it("textGradient 内の $name 参照を解決する", () => {
      const result = parseXmlRaw(`
        <Theme g1="38BDF8" g2="A78BFA" />
        <Slide>
          <Text textGradient="linear-gradient(90deg, $g1 0%, $g2 100%)">Hello</Text>
        </Slide>
      `);
      // result[0] is the Text node
      expect((result[0] as Record<string, unknown>).textGradient).toBe(
        "linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)",
      );
    });

    it("Icon の color 参照は # 正規化と両立する", () => {
      const result = parseXmlRaw(`
        <Theme accent="1D4ED8" />
        <Slide>
          <Icon name="cpu" color="$accent" />
        </Slide>
      `);
      expect((result[0] as Record<string, unknown>).color).toBe("#1D4ED8");
    });

    it("color 系以外の属性値は置換しない", () => {
      const result = parseXmlRaw(`
        <Theme accent="1D4ED8" />
        <Slide>
          <Text color="$accent">$accent costs $100</Text>
        </Slide>
      `);
      expect((result[0] as Record<string, unknown>).text).toBe(
        "$accent costs $100",
      );
    });

    it("未知のトークン参照でエラーをスローする（候補つき）", () => {
      expect(() =>
        parseXmlRaw(`
          <Theme accent="1D4ED8" />
          <Slide><Text color="$accnet">Hello</Text></Slide>
        `),
      ).toThrow('Unknown theme token "$accnet". Did you mean "$accent"?');
    });

    it("Theme 未宣言でトークン参照するとエラーをスローする", () => {
      expect(() =>
        parseXmlRaw(`<Slide><Text color="$accent">Hello</Text></Slide>`),
      ).toThrow(
        'Theme token "$accent" is referenced, but no <Theme> is declared',
      );
    });

    it("複数の Theme 要素でエラーをスローする", () => {
      expect(() =>
        parseXmlRaw(`
          <Theme accent="1D4ED8" />
          <Theme muted="94A3B8" />
          <Slide><Text>Hello</Text></Slide>
        `),
      ).toThrow("Only one <Theme> element is allowed");
    });

    it("不正なトークン値でエラーをスローする", () => {
      expect(() =>
        parseXmlRaw(`
          <Theme accent="blue" />
          <Slide><Text>Hello</Text></Slide>
        `),
      ).toThrow(
        '<Theme>: Invalid color value "blue" for token "accent". Expected 6-digit hex',
      );
    });

    it("Theme の子要素はエラーをスローする", () => {
      expect(() =>
        parseXmlRaw(`
          <Theme><Token name="accent" value="1D4ED8" /></Theme>
          <Slide><Text>Hello</Text></Slide>
        `),
      ).toThrow("<Theme>: Child elements are not supported");
    });
  });

  describe("複数 Slide", () => {
    it("複数の <Slide> を別々のスライドとして配列で返す", () => {
      const xml =
        "<Slide><Text>Slide 1</Text></Slide><Slide><Text>Slide 2</Text></Slide>";
      const result = parseXmlRaw(xml);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: "text", text: "Slide 1" });
      expect(result[1]).toEqual({ type: "text", text: "Slide 2" });
    });

    it("Slide が複数子要素を持つ場合は VStack で暗黙的にラップする", () => {
      const xml = "<Slide><Text>A</Text><Text>B</Text></Slide>";
      const result = parseXmlRaw(xml);
      expect(result).toEqual([
        {
          type: "vstack",
          children: [
            { type: "text", text: "A" },
            { type: "text", text: "B" },
          ],
        },
      ]);
    });

    it("最上位 <Slide> 以外の要素はエラーになる", () => {
      expect(() => parseXmlRaw("<Text>not in Slide</Text>")).toThrow(
        ParseXmlError,
      );
    });

    it("空の <Slide> はエラーになる", () => {
      expect(() => parseXmlRaw("<Slide></Slide>")).toThrow(ParseXmlError);
    });

    it("<Slide> に属性を付けるとエラーになる", () => {
      expect(() =>
        parseXmlRaw('<Slide title="x"><Text>A</Text></Slide>'),
      ).toThrow(ParseXmlError);
    });
  });

  // ===== エッジケース =====
  describe("エッジケース", () => {
    it("空文字列で空配列を返す", () => {
      expect(parseXmlRaw("")).toEqual([]);
      expect(parseXmlRaw("  ")).toEqual([]);
    });

    it("backgroundImage をドット記法で変換する", () => {
      const result = parseXml(
        '<VStack backgroundImage.src="bg.png" backgroundImage.sizing="cover"><Text>A</Text></VStack>',
      );
      expect((result[0] as Record<string, unknown>).backgroundImage).toEqual({
        src: "bg.png",
        sizing: "cover",
      });
    });

    it("shadow をドット記法で変換する", () => {
      const result = parseXml(
        '<VStack shadow.type="outer" shadow.blur="4" shadow.offset="2" shadow.color="000000"><Text>A</Text></VStack>',
      );
      expect((result[0] as Record<string, unknown>).shadow).toEqual({
        type: "outer",
        blur: 4,
        offset: 2,
        color: "000000",
      });
    });

    it("VStack の shadow をドット記法で変換する", () => {
      const result = parseXml(
        '<VStack shadow.type="outer" shadow.blur="6" shadow.offset="3" shadow.color="000000"><Text>A</Text></VStack>',
      );
      expect((result[0] as Record<string, unknown>).shadow).toEqual({
        type: "outer",
        blur: 6,
        offset: 3,
        color: "000000",
      });
    });

    it("HStack の shadow をドット記法で変換する", () => {
      const result = parseXml(
        '<HStack shadow.type="inner" shadow.blur="4" shadow.offset="2" shadow.color="333333"><Text>A</Text></HStack>',
      );
      expect((result[0] as Record<string, unknown>).shadow).toEqual({
        type: "inner",
        blur: 4,
        offset: 2,
        color: "333333",
      });
    });

    it("Text の glow をドット記法で変換する", () => {
      const result = parseXml(
        '<Text glow.size="8" glow.opacity="0.5" glow.color="FF3399">A</Text>',
      );
      expect((result[0] as Record<string, unknown>).glow).toEqual({
        size: 8,
        opacity: 0.5,
        color: "FF3399",
      });
    });

    it("Text の outline をドット記法で変換する", () => {
      const result = parseXml(
        '<Text outline.size="2" outline.color="0088CC">A</Text>',
      );
      expect((result[0] as Record<string, unknown>).outline).toEqual({
        size: 2,
        color: "0088CC",
      });
    });

    it("glow.size / outline.size の負値を拒否する", () => {
      expect(() => parseXml('<Text glow.size="-1">A</Text>')).toThrow();
      expect(() => parseXml('<Text outline.size="-1">A</Text>')).toThrow();
    });

    it("Text の glow / outline を JSON shorthand で変換する", () => {
      const result = parseXml(
        `<Text glow='{"size":8,"opacity":0.5,"color":"FF3399"}' outline='{"size":2,"color":"0088CC"}'>A</Text>`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.glow).toEqual({ size: 8, opacity: 0.5, color: "FF3399" });
      expect(node.outline).toEqual({ size: 2, color: "0088CC" });
    });

    it("Shape の glow / outline をドット記法で変換する", () => {
      const result = parseXml(
        '<Shape shapeType="ellipse" glow.size="12" glow.opacity="0.6" glow.color="FF00FF" outline.size="3" outline.color="0088CC"/>',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.glow).toEqual({ size: 12, opacity: 0.6, color: "FF00FF" });
      expect(node.outline).toEqual({ size: 3, color: "0088CC" });
    });

    it("Icon の glow / outline をドット記法で変換する", () => {
      const result = parseXml(
        '<Icon name="star" variant="circle-filled" glow.size="8" glow.color="FFCC00" outline.size="2" outline.color="333333"/>',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.glow).toEqual({ size: 8, color: "FFCC00" });
      expect(node.outline).toEqual({ size: 2, color: "333333" });
    });

    it("ドット記法で fill 属性を変換する", () => {
      const result = parseXml(
        '<Shape shapeType="rect" fill.color="1D4ED8" fill.transparency="0.5" />',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.fill).toEqual({ color: "1D4ED8", transparency: 0.5 });
    });

    it("ドット記法で connectorStyle 属性を変換する", () => {
      const data = JSON.stringify({
        label: "Root",
        children: [{ label: "A" }],
      });
      const result = parseXml(
        `<Tree layout="vertical" data='${data}' connectorStyle.color="333333" connectorStyle.width="2" />`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.connectorStyle).toEqual({ color: "333333", width: 2 });
    });

    it("ドット記法で endArrow（union: boolean | object）を変換する", () => {
      const result = parseXml(
        '<Line x1="0" y1="0" x2="100" y2="100" endArrow.type="diamond" />',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.endArrow).toEqual({ type: "diamond" });
    });

    it("ドット記法で未知のサブ属性はエラーになる", () => {
      expect(() =>
        parseXml('<Shape shapeType="rect" fill.unknown="value" />'),
      ).toThrow('Unknown sub-attribute "fill.unknown"');
    });

    it("endArrow='true' とドット記法 endArrow.type の共存を許容する", () => {
      const result = parseXml(
        '<Line x1="0" y1="0" x2="100" y2="100" endArrow="true" endArrow.type="triangle" />',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.endArrow).toEqual({ type: "triangle" });
    });

    it("beginArrow='true' とドット記法 beginArrow.type の共存を許容する", () => {
      const result = parseXml(
        '<Line x1="0" y1="0" x2="100" y2="100" beginArrow="true" beginArrow.type="diamond" />',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.beginArrow).toEqual({ type: "diamond" });
    });

    it("endArrow='false' とドット記法 endArrow.type の共存を許容する（ドット記法優先）", () => {
      const result = parseXml(
        '<Line x1="0" y1="0" x2="100" y2="100" endArrow="false" endArrow.type="triangle" />',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.endArrow).toEqual({ type: "triangle" });
    });

    it("padding と dot 記法を混在指定できる（number shorthand を 4方向展開）", () => {
      const result = parseXml(
        '<VStack padding="16" padding.top="4"><Text>A</Text></VStack>',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.padding).toEqual({ top: 4, right: 16, bottom: 16, left: 16 });
    });

    it("margin と dot 記法を混在指定できる（number shorthand を 4方向展開）", () => {
      const result = parseXml(
        '<VStack margin="12" margin.left="20"><Text>A</Text></VStack>',
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.margin).toEqual({
        top: 12,
        right: 12,
        bottom: 12,
        left: 20,
      });
    });

    it("border の JSON shorthand と dot 記法を混在指定できる", () => {
      const border = JSON.stringify({ color: "000000", width: 2 });
      const result = parseXml(
        `<Text border='${border}' border.color="FF0000">test</Text>`,
      );
      expect((result[0] as Record<string, unknown>).border).toEqual({
        color: "FF0000",
        width: 2,
      });
    });

    it("cellBorder の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<Table cellBorder='{"color":"334155","width":1}' cellBorder.width="2"><Tr><Td>A</Td></Tr></Table>`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.cellBorder).toEqual({ color: "334155", width: 2 });
    });

    it("line の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<Shape shapeType="rect" line='{"color":"333333","width":1}' line.width="4" />`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.line).toEqual({ color: "333333", width: 4 });
    });

    it("fill の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<Shape shapeType="rect" fill='{"color":"1D4ED8","transparency":0.1}' fill.transparency="0.4" />`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.fill).toEqual({ color: "1D4ED8", transparency: 0.4 });
    });

    it("shadow の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<VStack shadow='{"type":"outer","color":"000000","blur":2}' shadow.blur="6"><Text>A</Text></VStack>`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.shadow).toEqual({ type: "outer", color: "000000", blur: 6 });
    });

    it("underline の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<Text underline='{"style":"sng","color":"000000"}' underline.color="FF0000">test</Text>`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.underline).toEqual({ style: "sng", color: "FF0000" });
    });

    it("beginArrow の object shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<Line x1="0" y1="0" x2="100" y2="100" beginArrow='{"type":"oval"}' beginArrow.type="diamond" />`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.beginArrow).toEqual({ type: "diamond" });
    });

    it("backgroundImage の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<VStack backgroundImage='{"src":"bg.png","sizing":"contain"}' backgroundImage.sizing="cover"><Text>A</Text></VStack>`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.backgroundImage).toEqual({ src: "bg.png", sizing: "cover" });
    });

    it("connectorStyle の JSON shorthand と dot 記法を混在指定できる", () => {
      const data = JSON.stringify({ label: "Root", children: [] });
      const result = parseXml(
        `<Tree layout="vertical" data='${data}' connectorStyle='{"color":"999999","width":1}' connectorStyle.width="3" />`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.connectorStyle).toEqual({ color: "999999", width: 3 });
    });

    it("sizing の JSON shorthand と dot 記法を混在指定できる", () => {
      const result = parseXml(
        `<Image src="image.png" sizing='{"type":"crop","x":0,"y":0,"w":100,"h":100}' sizing.w="120" />`,
      );
      const node = result[0] as Record<string, unknown>;
      expect(node.sizing).toEqual({ type: "crop", x: 0, y: 0, w: 120, h: 100 });
    });

    it("展開できない shorthand は従来どおり競合エラーになる", () => {
      expect(() =>
        parseXml('<Text border="solid" border.color="FF0000">test</Text>'),
      ).toThrow("conflicts with dot-notation");
    });

    it("ドット記法で未知のベース属性はエラーになる", () => {
      expect(() => parseXml('<Text unknown.color="value">test</Text>')).toThrow(
        'Unknown attribute "unknown"',
      );
    });

    it("Chart の showLegend, showTitle を boolean に変換する", () => {
      const data = JSON.stringify([{ labels: ["A"], values: [1] }]);
      const result = parseXml(
        `<Chart chartType="pie" data='${data}' showLegend="true" showTitle="false" />`,
      );
      expect((result[0] as Record<string, unknown>).showLegend).toBe(true);
      expect((result[0] as Record<string, unknown>).showTitle).toBe(false);
    });

    it("Chart の sparkline を boolean に変換する", () => {
      const data = JSON.stringify([{ labels: ["A"], values: [1] }]);
      const trueResult = parseXml(
        `<Chart chartType="bar" data='${data}' sparkline="true" />`,
      );
      const falseResult = parseXml(
        `<Chart chartType="bar" data='${data}' sparkline="false" />`,
      );
      expect((trueResult[0] as Record<string, unknown>).sparkline).toBe(true);
      expect((falseResult[0] as Record<string, unknown>).sparkline).toBe(false);
    });

    it("不正な JSON 属性値でエラーをスローする", () => {
      expect(() =>
        parseXml('<Chart chartType="bar" data="not-json" />'),
      ).toThrow();
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
          <Text fontSize="32" bold="true">売上レポート</Text>
          <HStack gap="16">
            <Chart chartType="bar" w="400" h="300"
              data='[{ "name": "Q1", "labels": ["1月","2月","3月"], "values": [100,120,90] }]'
            />
            <Text fontSize="18" color="00AA00">前年比 +15%</Text>
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
              fontSize: 32,
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
                  fontSize: 18,
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

      it("dateColor / titleColor / descriptionColor 属性を変換する", () => {
        const xml = `
          <Timeline dateColor="94A3B8" titleColor="F8FAFC" descriptionColor="CBD5E1">
            <TimelineItem date="2024-01" title="Launch" />
          </Timeline>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.dateColor).toBe("94A3B8");
        expect(node.titleColor).toBe("F8FAFC");
        expect(node.descriptionColor).toBe("CBD5E1");
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

      it("ラベル色属性と MatrixItem の textColor を変換する", () => {
        const xml = `
          <Matrix axisLabelColor="94A3B8" quadrantLabelColor="64748B" itemLabelColor="F8FAFC">
            <MatrixAxes x="X" y="Y" />
            <MatrixItem label="A" x="0.5" y="0.5" textColor="FACC15" />
          </Matrix>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.axisLabelColor).toBe("94A3B8");
        expect(node.quadrantLabelColor).toBe("64748B");
        expect(node.itemLabelColor).toBe("F8FAFC");
        expect(node.items).toEqual([
          { label: "A", x: 0.5, y: 0.5, textColor: "FACC15" },
        ]);
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

      it("FlowConnection の labelColor と connectorStyle.labelColor を変換する", () => {
        const xml = `
          <Flow connectorStyle.labelColor="94A3B8">
            <FlowNode id="a" shape="flowChartProcess" text="A" />
            <FlowNode id="b" shape="flowChartProcess" text="B" />
            <FlowConnection from="a" to="b" label="next" labelColor="FACC15" />
          </Flow>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.connectorStyle).toEqual({ labelColor: "94A3B8" });
        expect(node.connections).toEqual([
          { from: "a", to: "b", label: "next", labelColor: "FACC15" },
        ]);
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
      it("Col/Tr/Td 子要素から columns/rows を構築する", () => {
        const xml = `
          <Table>
            <Col width="200" />
            <Col width="100" />
            <Tr>
              <Td>太郎</Td>
              <Td>30</Td>
            </Tr>
            <Tr>
              <Td>花子</Td>
              <Td>25</Td>
            </Tr>
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

      it("Td に属性（fontSize, bold等）を設定する", () => {
        const xml = `
          <Table>
            <Col width="200" />
            <Tr>
              <Td fontSize="14" bold="true" color="FF0000">Header</Td>
            </Tr>
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
          fontSize: 14,
          bold: true,
          color: "FF0000",
        });
      });

      it("Td の text 属性がテキストコンテンツより優先される", () => {
        const xml = `
          <Table>
            <Col />
            <Tr>
              <Td text="from attr">from content</Td>
            </Tr>
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

      it("Tr に height 属性を設定する", () => {
        const xml = `
          <Table>
            <Col />
            <Tr height="50">
              <Td>A</Td>
            </Tr>
          </Table>
        `;
        const result = parseXml(xml);
        const rows = (result[0] as Record<string, unknown>).rows as Record<
          string,
          unknown
        >[];
        expect(rows[0].height).toBe(50);
      });

      it("Col なしで Tr のみを指定する", () => {
        const xml = `
          <Table>
            <Tr>
              <Td>A</Td>
              <Td>B</Td>
            </Tr>
          </Table>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.columns).toEqual([{}, {}]);
        expect(node.rows).toEqual([{ cells: [{ text: "A" }, { text: "B" }] }]);
      });

      it("Col なしで colspan を含む Tr から正しい列数を推定する", () => {
        const xml = `
          <Table>
            <Tr>
              <Td colspan="3">Header</Td>
            </Tr>
            <Tr>
              <Td>A</Td>
              <Td>B</Td>
              <Td>C</Td>
            </Tr>
          </Table>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.columns).toEqual([{}, {}, {}]);
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

      it("Tr 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml("<Table><Tr><Unknown>x</Unknown></Tr></Table>"),
        ).toThrow(
          "Unknown child element <Unknown> inside <Tr>. Expected: <Td>",
        );
      });

      it("Table 内の未知タグでエラーをスローする", () => {
        expect(() =>
          parseXml('<Table><Unknown width="100" /></Table>'),
        ).toThrow(
          "Unknown child element <Unknown> inside <Table>. Expected: <Col> or <Tr>",
        );
      });

      it("Td に colspan/rowspan を設定する", () => {
        const xml = `
          <Table>
            <Col width="100" />
            <Col width="100" />
            <Col width="100" />
            <Tr>
              <Td colspan="3">Header</Td>
            </Tr>
            <Tr>
              <Td rowspan="2">Left</Td>
              <Td>A</Td>
              <Td>B</Td>
            </Tr>
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
      it("Tree の textColor と TreeItem の textColor を変換する", () => {
        const xml = `
          <Tree textColor="0F172A">
            <TreeItem label="Root" textColor="FACC15">
              <TreeItem label="Child" />
            </TreeItem>
          </Tree>
        `;
        const result = parseXml(xml);
        const node = result[0] as Record<string, unknown>;
        expect(node.textColor).toBe("0F172A");
        expect(node.data).toEqual({
          label: "Root",
          textColor: "FACC15",
          children: [{ label: "Child" }],
        });
      });

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
            <Text fontSize="24" bold="true">売上</Text>
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
              { type: "text", text: "売上", fontSize: 24, bold: true },
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
              <Col width="200" />
              <Tr><Td>A</Td></Tr>
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
          parseXml('<Text fontSiz="32">test</Text>');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors).toHaveLength(1);
          expect(err.errors[0]).toContain('Unknown attribute "fontSiz"');
          expect(err.errors[0]).toContain('Did you mean "fontSize"');
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
        expect(() => parseXml('<Text textAlign="LEFT">test</Text>')).toThrow(
          ParseXmlError,
        );
        try {
          parseXml('<Text textAlign="LEFT">test</Text>');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors.some((e) => e.includes("textAlign"))).toBe(true);
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

      it("Arrow の from/to 欠落でエラーをスローする", () => {
        expect(() => parseXml('<Arrow to="b" />')).toThrow(ParseXmlError);
        try {
          parseXml('<Arrow to="b" />');
        } catch (e) {
          const err = e as ParseXmlError;
          expect(err.errors.some((e) => e.includes('"from"'))).toBe(true);
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
            <Text fonPx="32" textAlign="LEFT">A</Text>
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
            <Text fontSize="32" bold="true" color="FF0000">Hello</Text>
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

  // ===== テキストコンテンツの空白保持 =====
  describe("テキストコンテンツの空白処理", () => {
    it("スペースのみのテキストコンテンツを保持する", () => {
      const result = parseXml('<Text fontSize="1" color="D61E1E"> </Text>');
      expect(result).toEqual([
        { type: "text", fontSize: 1, color: "D61E1E", text: " " },
      ]);
    });

    it("通常のテキストコンテンツを正しくパースする", () => {
      const result = parseXml(
        '<Text fontSize="34" bold="true" color="FFFFFF">Hello World</Text>',
      );
      expect(result).toEqual([
        {
          type: "text",
          fontSize: 34,
          bold: true,
          color: "FFFFFF",
          text: "Hello World",
        },
      ]);
    });

    it("属性値の前後空白は trim される", () => {
      const result = parseXml('<Text fontSize="32">test</Text>');
      expect((result[0] as Record<string, unknown>).fontSize).toBe(32);
    });
  });
});
