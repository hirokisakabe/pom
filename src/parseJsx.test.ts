import { describe, it, expect } from "vitest";
import { parseJsx, ParseJsxError } from "./parseJsx.ts";

describe("parseJsx", () => {
  describe("Text node", () => {
    it("should parse simple text", () => {
      const result = parseJsx("<Text>Hello</Text>");
      expect(result).toEqual([{ type: "text", text: "Hello" }]);
    });

    it("should parse text with props", () => {
      const result = parseJsx(
        '<Text fontPx={32} color="00AA00" bold>Title</Text>',
      );
      expect(result).toEqual([
        {
          type: "text",
          text: "Title",
          fontPx: 32,
          color: "00AA00",
          bold: true,
        },
      ]);
    });

    it("should parse text with all styling props", () => {
      const result = parseJsx(
        '<Text fontPx={18} color="333333" bold italic strike highlight="FFFF00" fontFamily="Arial" lineSpacingMultiple={1.5}>Styled</Text>',
      );
      expect(result).toEqual([
        {
          type: "text",
          text: "Styled",
          fontPx: 18,
          color: "333333",
          bold: true,
          italic: true,
          strike: true,
          highlight: "FFFF00",
          fontFamily: "Arial",
          lineSpacingMultiple: 1.5,
        },
      ]);
    });

    it("should parse text with underline object", () => {
      const result = parseJsx(
        '<Text underline={{ style: "dbl", color: "FF0000" }}>Underlined</Text>',
      );
      expect(result).toEqual([
        {
          type: "text",
          text: "Underlined",
          underline: { style: "dbl", color: "FF0000" },
        },
      ]);
    });

    it("should parse text with bullet", () => {
      const result = parseJsx(
        '<Text bullet={{ type: "number", numberType: "arabicPeriod" }}>Item 1</Text>',
      );
      expect(result).toEqual([
        {
          type: "text",
          text: "Item 1",
          bullet: { type: "number", numberType: "arabicPeriod" },
        },
      ]);
    });

    it("should parse text with alignText", () => {
      const result = parseJsx('<Text alignText="center">Centered</Text>');
      expect(result).toEqual([
        { type: "text", text: "Centered", alignText: "center" },
      ]);
    });

    it("should support text prop instead of children", () => {
      const result = parseJsx('<Text text="Hello" fontPx={24} />');
      expect(result).toEqual([{ type: "text", text: "Hello", fontPx: 24 }]);
    });

    it("should preserve space between text and expression", () => {
      const result = parseJsx('<Text>Hello {"World"}</Text>');
      expect(result).toEqual([{ type: "text", text: "Hello World" }]);
    });

    it("should preserve space in multi-expression text", () => {
      const result = parseJsx('<Text>{"A"} and {"B"}</Text>');
      expect(result).toEqual([{ type: "text", text: "A and B" }]);
    });
  });

  describe("Image node", () => {
    it("should parse self-closing image", () => {
      const result = parseJsx('<Image src="logo.png" w={200} h={100} />');
      expect(result).toEqual([
        { type: "image", src: "logo.png", w: 200, h: 100 },
      ]);
    });

    it("should parse image with sizing", () => {
      const result = parseJsx(
        '<Image src="photo.jpg" w={400} h={300} sizing={{ type: "cover", w: 400, h: 300 }} />',
      );
      expect(result).toEqual([
        {
          type: "image",
          src: "photo.jpg",
          w: 400,
          h: 300,
          sizing: { type: "cover", w: 400, h: 300 },
        },
      ]);
    });

    it("should parse image with shadow", () => {
      const result = parseJsx(
        '<Image src="photo.jpg" w={200} h={200} shadow={{ type: "outer", blur: 10, offset: 5 }} />',
      );
      expect(result).toEqual([
        {
          type: "image",
          src: "photo.jpg",
          w: 200,
          h: 200,
          shadow: { type: "outer", blur: 10, offset: 5 },
        },
      ]);
    });
  });

  describe("Shape node", () => {
    it("should parse shape with text", () => {
      const result = parseJsx(
        '<Shape shapeType="roundRect" w={200} h={100} text="Click me" fill={{ color: "4472C4" }} />',
      );
      expect(result).toEqual([
        {
          type: "shape",
          shapeType: "roundRect",
          w: 200,
          h: 100,
          text: "Click me",
          fill: { color: "4472C4" },
        },
      ]);
    });
  });

  describe("Chart node", () => {
    it("should parse chart with data", () => {
      const result = parseJsx(
        `<Chart chartType="bar" w={400} h={300}
          data={[{ name: "Q1", labels: ["1月","2月","3月"], values: [100,120,90] }]}
        />`,
      );
      expect(result).toEqual([
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
      ]);
    });

    it("should parse chart with legend and title", () => {
      const result = parseJsx(
        '<Chart chartType="pie" w={300} h={300} showLegend showTitle title="Distribution" data={[{ labels: ["A","B","C"], values: [30,40,30] }]} />',
      );
      expect(result).toEqual([
        {
          type: "chart",
          chartType: "pie",
          w: 300,
          h: 300,
          showLegend: true,
          showTitle: true,
          title: "Distribution",
          data: [{ labels: ["A", "B", "C"], values: [30, 40, 30] }],
        },
      ]);
    });
  });

  describe("Table node", () => {
    it("should parse table", () => {
      const result = parseJsx(
        `<Table w={500} h={200}
          columns={[{ width: 100 }, { width: 200 }]}
          rows={[
            { cells: [{ text: "Name" }, { text: "Value" }] },
            { cells: [{ text: "A" }, { text: "100" }] }
          ]}
        />`,
      );
      expect(result).toEqual([
        {
          type: "table",
          w: 500,
          h: 200,
          columns: [{ width: 100 }, { width: 200 }],
          rows: [
            { cells: [{ text: "Name" }, { text: "Value" }] },
            { cells: [{ text: "A" }, { text: "100" }] },
          ],
        },
      ]);
    });
  });

  describe("Timeline node", () => {
    it("should parse timeline", () => {
      const result = parseJsx(
        `<Timeline direction="horizontal" w={800} h={200}
          items={[
            { date: "2024-01", title: "Phase 1" },
            { date: "2024-06", title: "Phase 2", description: "Expansion" }
          ]}
        />`,
      );
      expect(result).toEqual([
        {
          type: "timeline",
          direction: "horizontal",
          w: 800,
          h: 200,
          items: [
            { date: "2024-01", title: "Phase 1" },
            {
              date: "2024-06",
              title: "Phase 2",
              description: "Expansion",
            },
          ],
        },
      ]);
    });
  });

  describe("Matrix node", () => {
    it("should parse matrix", () => {
      const result = parseJsx(
        `<Matrix w={500} h={500}
          axes={{ x: "Impact", y: "Effort" }}
          quadrants={{ topLeft: "Quick Wins", topRight: "Major Projects", bottomLeft: "Fill-Ins", bottomRight: "Thankless Tasks" }}
          items={[{ label: "Task A", x: 0.2, y: 0.8 }]}
        />`,
      );
      expect(result).toEqual([
        {
          type: "matrix",
          w: 500,
          h: 500,
          axes: { x: "Impact", y: "Effort" },
          quadrants: {
            topLeft: "Quick Wins",
            topRight: "Major Projects",
            bottomLeft: "Fill-Ins",
            bottomRight: "Thankless Tasks",
          },
          items: [{ label: "Task A", x: 0.2, y: 0.8 }],
        },
      ]);
    });
  });

  describe("Tree node", () => {
    it("should parse tree", () => {
      const result = parseJsx(
        `<Tree w={600} h={400} layout="vertical"
          data={{ label: "Root", children: [{ label: "Child 1" }, { label: "Child 2" }] }}
        />`,
      );
      expect(result).toEqual([
        {
          type: "tree",
          w: 600,
          h: 400,
          layout: "vertical",
          data: {
            label: "Root",
            children: [{ label: "Child 1" }, { label: "Child 2" }],
          },
        },
      ]);
    });
  });

  describe("Flow node", () => {
    it("should parse flow", () => {
      const result = parseJsx(
        `<Flow w={600} h={300}
          nodes={[
            { id: "start", shape: "flowChartTerminator", text: "Start" },
            { id: "process", shape: "flowChartProcess", text: "Process" }
          ]}
          connections={[{ from: "start", to: "process" }]}
        />`,
      );
      expect(result).toEqual([
        {
          type: "flow",
          w: 600,
          h: 300,
          nodes: [
            { id: "start", shape: "flowChartTerminator", text: "Start" },
            { id: "process", shape: "flowChartProcess", text: "Process" },
          ],
          connections: [{ from: "start", to: "process" }],
        },
      ]);
    });
  });

  describe("ProcessArrow node", () => {
    it("should parse processArrow", () => {
      const result = parseJsx(
        `<ProcessArrow w={600} h={100}
          steps={[
            { label: "Step 1", color: "4472C4" },
            { label: "Step 2", color: "5B9BD5" },
            { label: "Step 3", color: "70AD47" }
          ]}
        />`,
      );
      expect(result).toEqual([
        {
          type: "processArrow",
          w: 600,
          h: 100,
          steps: [
            { label: "Step 1", color: "4472C4" },
            { label: "Step 2", color: "5B9BD5" },
            { label: "Step 3", color: "70AD47" },
          ],
        },
      ]);
    });
  });

  describe("Line node", () => {
    it("should parse line", () => {
      const result = parseJsx(
        '<Line x1={0} y1={0} x2={100} y2={100} color="FF0000" lineWidth={2} />',
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

    it("should parse line with arrows", () => {
      const result = parseJsx(
        '<Line x1={0} y1={50} x2={200} y2={50} beginArrow endArrow={{ type: "triangle" }} />',
      );
      expect(result).toEqual([
        {
          type: "line",
          x1: 0,
          y1: 50,
          x2: 200,
          y2: 50,
          beginArrow: true,
          endArrow: { type: "triangle" },
        },
      ]);
    });
  });

  describe("Layout containers", () => {
    it("should parse VStack with children", () => {
      const result = parseJsx(`
        <VStack gap={16} padding={32}>
          <Text fontPx={32} bold>Title</Text>
          <Text fontPx={18}>Subtitle</Text>
        </VStack>
      `);
      expect(result).toEqual([
        {
          type: "vstack",
          gap: 16,
          padding: 32,
          children: [
            { type: "text", text: "Title", fontPx: 32, bold: true },
            { type: "text", text: "Subtitle", fontPx: 18 },
          ],
        },
      ]);
    });

    it("should parse HStack with children", () => {
      const result = parseJsx(`
        <HStack gap={8} alignItems="center">
          <Text>Left</Text>
          <Text>Right</Text>
        </HStack>
      `);
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

    it("should parse Box with single child", () => {
      const result = parseJsx(`
        <Box padding={16} backgroundColor="F0F0F0">
          <Text>Content</Text>
        </Box>
      `);
      expect(result).toEqual([
        {
          type: "box",
          padding: 16,
          backgroundColor: "F0F0F0",
          children: { type: "text", text: "Content" },
        },
      ]);
    });

    it("should parse Box with shadow", () => {
      const result = parseJsx(`
        <Box padding={16} shadow={{ type: "outer", blur: 10, offset: 5 }}>
          <Text>Shadowed</Text>
        </Box>
      `);
      expect(result).toEqual([
        {
          type: "box",
          padding: 16,
          shadow: { type: "outer", blur: 10, offset: 5 },
          children: { type: "text", text: "Shadowed" },
        },
      ]);
    });

    it("should parse Layer with positioned children", () => {
      const result = parseJsx(`
        <Layer w={800} h={600}>
          <Text x={100} y={50} fontPx={24}>Positioned Text</Text>
          <Image x={200} y={200} src="logo.png" w={100} h={100} />
        </Layer>
      `);
      expect(result).toEqual([
        {
          type: "layer",
          w: 800,
          h: 600,
          children: [
            {
              type: "text",
              x: 100,
              y: 50,
              fontPx: 24,
              text: "Positioned Text",
            },
            { type: "image", x: 200, y: 200, src: "logo.png", w: 100, h: 100 },
          ],
        },
      ]);
    });
  });

  describe("Nested structures", () => {
    it("should parse deeply nested layout", () => {
      const result = parseJsx(`
        <VStack gap={16} padding={32}>
          <Text fontPx={32} bold>売上レポート</Text>
          <HStack gap={16}>
            <Chart chartType="bar" w={400} h={300}
              data={[{ name: "Q1", labels: ["1月","2月","3月"], values: [100,120,90] }]}
            />
            <Text fontPx={18} color="00AA00">前年比 +15%</Text>
          </HStack>
        </VStack>
      `);
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

  describe("Multiple root elements", () => {
    it("should parse multiple root nodes", () => {
      const result = parseJsx(`
        <Text fontPx={24}>First</Text>
        <Text fontPx={18}>Second</Text>
      `);
      expect(result).toEqual([
        { type: "text", text: "First", fontPx: 24 },
        { type: "text", text: "Second", fontPx: 18 },
      ]);
    });
  });

  describe("Base node properties", () => {
    it("should parse common base properties", () => {
      const result = parseJsx(
        '<Text w={400} h={50} padding={8} backgroundColor="EEEEEE" border={{ color: "000000", width: 1 }} borderRadius={4} opacity={0.8}>Styled</Text>',
      );
      expect(result).toEqual([
        {
          type: "text",
          text: "Styled",
          w: 400,
          h: 50,
          padding: 8,
          backgroundColor: "EEEEEE",
          border: { color: "000000", width: 1 },
          borderRadius: 4,
          opacity: 0.8,
        },
      ]);
    });

    it("should parse percentage width", () => {
      const result = parseJsx('<Text w="50%">Half</Text>');
      expect(result).toEqual([{ type: "text", text: "Half", w: "50%" }]);
    });

    it("should parse padding object", () => {
      const result = parseJsx(
        "<Text padding={{ top: 10, right: 20, bottom: 10, left: 20 }}>Padded</Text>",
      );
      expect(result).toEqual([
        {
          type: "text",
          text: "Padded",
          padding: { top: 10, right: 20, bottom: 10, left: 20 },
        },
      ]);
    });

    it("should parse backgroundImage", () => {
      const result = parseJsx(
        '<VStack backgroundImage={{ src: "bg.png", sizing: "cover" }}><Text>Content</Text></VStack>',
      );
      expect(result).toEqual([
        {
          type: "vstack",
          backgroundImage: { src: "bg.png", sizing: "cover" },
          children: [{ type: "text", text: "Content" }],
        },
      ]);
    });
  });

  describe("VStack/HStack alignment", () => {
    it("should parse alignItems and justifyContent", () => {
      const result = parseJsx(`
        <VStack alignItems="center" justifyContent="spaceBetween">
          <Text>A</Text>
          <Text>B</Text>
        </VStack>
      `);
      expect(result).toEqual([
        {
          type: "vstack",
          alignItems: "center",
          justifyContent: "spaceBetween",
          children: [
            { type: "text", text: "A" },
            { type: "text", text: "B" },
          ],
        },
      ]);
    });
  });

  describe("Error handling", () => {
    it("should throw ParseJsxError for unknown components", () => {
      expect(() => parseJsx("<Unknown />")).toThrow(ParseJsxError);
      expect(() => parseJsx("<Unknown />")).toThrow(/Unknown component/);
    });

    it("should throw ParseJsxError for invalid JSX syntax", () => {
      expect(() => parseJsx("<Text>unclosed")).toThrow(ParseJsxError);
    });

    it("should throw ParseJsxError for Box with no children", () => {
      expect(() => parseJsx("<Box></Box>")).toThrow(ParseJsxError);
      expect(() => parseJsx("<Box></Box>")).toThrow(
        /must have exactly one child/,
      );
    });

    it("should throw ParseJsxError for Box with multiple children", () => {
      expect(() => parseJsx("<Box><Text>A</Text><Text>B</Text></Box>")).toThrow(
        ParseJsxError,
      );
    });

    it("should throw ParseJsxError for spread attributes", () => {
      expect(() => parseJsx("<Text {...props}>Hi</Text>")).toThrow(
        ParseJsxError,
      );
    });

    it("should throw ParseJsxError for unsupported expressions", () => {
      expect(() => parseJsx("<Text fontPx={1 + 2}>Hi</Text>")).toThrow(
        ParseJsxError,
      );
    });

    it("should throw ParseJsxError for expression children in containers", () => {
      expect(() => parseJsx("<VStack>{123}<Text>A</Text></VStack>")).toThrow(
        ParseJsxError,
      );
      expect(() => parseJsx("<VStack>{123}<Text>A</Text></VStack>")).toThrow(
        /Expression children are not supported/,
      );
    });

    it("should throw ParseJsxError for bare text in containers", () => {
      expect(() =>
        parseJsx("<VStack>bare text<Text>A</Text></VStack>"),
      ).toThrow(ParseJsxError);
      expect(() =>
        parseJsx("<VStack>bare text<Text>A</Text></VStack>"),
      ).toThrow(/Text content is not allowed/);
    });

    it("should return empty array for empty input", () => {
      const result = parseJsx("");
      expect(result).toEqual([]);
    });

    it("should return empty array for whitespace-only input", () => {
      const result = parseJsx("   \n   ");
      expect(result).toEqual([]);
    });
  });

  describe("Negative numbers", () => {
    it("should support negative numbers", () => {
      const result = parseJsx("<Line x1={0} y1={0} x2={-100} y2={-50} />");
      expect(result).toEqual([
        { type: "line", x1: 0, y1: 0, x2: -100, y2: -50 },
      ]);
    });
  });

  describe("Boolean values", () => {
    it("should support explicit boolean false", () => {
      const result = parseJsx(
        '<Chart chartType="bar" w={400} h={300} showLegend={false} data={[{ labels: ["A"], values: [1] }]} />',
      );
      expect(result[0]).toHaveProperty("showLegend", false);
    });
  });
});
