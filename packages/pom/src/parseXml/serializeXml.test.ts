import { describe, it, expect } from "vitest";
import { parseXml } from "./parseXml.ts";
import { serializeXml } from "./serializeXml.ts";

function roundTrip(xml: string): unknown[] {
  const nodes = parseXml(`<Slide>${xml}</Slide>`);
  const serialized = serializeXml(nodes);
  return parseXml(serialized);
}

describe("serializeXml", () => {
  describe("基本的なノードの直列化", () => {
    it("Text ノードを往復変換する", () => {
      const original = parseXml(
        `<Slide><Text fontSize="32" bold="true">Hello</Text></Slide>`,
      );
      const result = roundTrip(`<Text fontSize="32" bold="true">Hello</Text>`);
      expect(result).toEqual(original);
    });

    it("Image ノードを往復変換する", () => {
      const original = parseXml(
        `<Slide><Image src="image.png" w="400" h="300" /></Slide>`,
      );
      const result = roundTrip(`<Image src="image.png" w="400" h="300" />`);
      expect(result).toEqual(original);
    });

    it("Icon ノードを往復変換する", () => {
      const original = parseXml(
        `<Slide><Icon name="star" size="32" color="#FF0000" /></Slide>`,
      );
      const result = roundTrip(
        `<Icon name="star" size="32" color="#FF0000" />`,
      );
      expect(result).toEqual(original);
    });
  });

  describe("コンテナノードの直列化", () => {
    it("VStack と子ノードを往復変換する", () => {
      const xml = `<VStack gap="16" padding="24"><Text>Title</Text><Image src="img.png" w="100" h="100" /></VStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
    });

    it("HStack を往復変換する", () => {
      const xml = `<HStack alignItems="center" gap="8"><Text>A</Text><Text>B</Text></HStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
    });

    it("ネストしたコンテナを往復変換する", () => {
      const xml = `<VStack gap="16"><HStack gap="8"><Text>Left</Text><Text>Right</Text></HStack><Text>Bottom</Text></VStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
    });

    it("grow 属性を往復変換する", () => {
      const xml = `<HStack gap="8"><VStack grow="2"><Text>Left</Text></VStack><VStack grow="1"><Text>Right</Text></VStack></HStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
      const [left] = (result[0] as { children: unknown[] }).children;
      expect((left as Record<string, unknown>).grow).toBe(2);
    });
  });

  describe("複数スライドの直列化", () => {
    it("複数スライドを往復変換する", () => {
      const xml = `<Slide><Text>Slide 1</Text></Slide><Slide><Text>Slide 2</Text></Slide>`;
      const original = parseXml(xml);
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });
  });

  describe("インライン装飾 (runs) の直列化", () => {
    it("Bold テキストを runs として往復変換する", () => {
      const original = parseXml(`<Slide><Text><B>太字</B></Text></Slide>`);
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });

    it("複合装飾を往復変換する", () => {
      const original = parseXml(
        `<Slide><Text><B>Bold</B> and <I>italic</I></Text></Slide>`,
      );
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });

    it("runs がない Text は self-closing で直列化される", () => {
      const nodes = parseXml(`<Slide><Text fontSize="16">Hello</Text></Slide>`);
      const serialized = serializeXml(nodes);
      expect(serialized).toContain('text="Hello"');
    });

    it("runs がある Text は child element 形式で直列化される", () => {
      const nodes = parseXml(`<Slide><Text><B>Bold</B></Text></Slide>`);
      const serialized = serializeXml(nodes);
      expect(serialized).toContain("<B>Bold</B>");
    });

    it("letterSpacing 付きの Text を往復変換する", () => {
      const original = parseXml(
        `<Slide><Text letterSpacing="4">字間広め</Text></Slide>`,
      );
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });

    it("boolean 装飾のネスト順は B > I > U > S で直列化される", () => {
      const nodes = parseXml(
        `<Slide><Text><B><I><U><S>全装飾</S></U></I></B></Text></Slide>`,
      );
      const serialized = serializeXml(nodes);
      expect(serialized).toContain("<B><I><U><S>全装飾</S></U></I></B>");
      expect(parseXml(serialized)).toEqual(nodes);
    });

    it("Span の letterSpacing を runs として往復変換する", () => {
      const original = parseXml(
        `<Slide><Text>通常 <Span letterSpacing="6">字間広め</Span></Text></Slide>`,
      );
      const serialized = serializeXml(original);
      expect(serialized).toContain('letterSpacing="6"');
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });
  });

  describe("オブジェクト属性の直列化", () => {
    it("padding オブジェクトを dot-notation で直列化する", () => {
      const xml = `<VStack padding.top="16" padding.left="32"><Text>content</Text></VStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
    });

    it("border を往復変換する", () => {
      const xml = `<VStack border.color="FF0000" border.width="2"><Text>bordered</Text></VStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
    });

    it("辺ごとの border を往復変換する", () => {
      const xml = `<VStack borderTop.color="FF0000" borderTop.width="4" borderLeft.dashType="dash"><Text>bordered</Text></VStack>`;
      const original = parseXml(`<Slide>${xml}</Slide>`);
      const result = roundTrip(xml);
      expect(result).toEqual(original);
    });
  });

  describe("child element notation ノードの往復変換", () => {
    it("Ul (Li + インライン装飾) を往復変換する", () => {
      const original = parseXml(
        `<Slide><Ul><Li><B>太字</B>の項目</Li><Li>通常の項目</Li></Ul></Slide>`,
      );
      const serialized = serializeXml(original);
      // serialize 側は child element notation ではなく JSON 属性として出力する (現状仕様の固定)
      expect(serialized).toContain('items="');
      expect(serialized).not.toContain("<Li");
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });

    it("Timeline を往復変換する", () => {
      const original = parseXml(
        `<Slide><Timeline><TimelineItem date="2026-01" title="開始" /><TimelineItem date="2026-06" title="完了" color="FF0000" /></Timeline></Slide>`,
      );
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });

    it("ProcessArrow を往復変換する", () => {
      const original = parseXml(
        `<Slide><ProcessArrow><ProcessArrowStep label="調査" /><ProcessArrowStep label="実装" /></ProcessArrow></Slide>`,
      );
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });

    it("Table (Td + インライン装飾) を往復変換する", () => {
      const original = parseXml(
        `<Slide><Table><Tr><Td><B>見出し</B></Td><Td>値</Td></Tr></Table></Slide>`,
      );
      const serialized = serializeXml(original);
      const result = parseXml(serialized);
      expect(result).toEqual(original);
    });
  });

  describe("特殊文字のエスケープ", () => {
    it("属性値の特殊文字をエスケープする", () => {
      const xml = `<Text text="a &amp; b" />`;
      const nodes = parseXml(`<Slide>${xml}</Slide>`);
      const serialized = serializeXml(nodes);
      expect(serialized).toContain("&amp;");
      const result = parseXml(serialized);
      expect(result[0]).toMatchObject({ type: "text", text: "a & b" });
    });
  });
});
