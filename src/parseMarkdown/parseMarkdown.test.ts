import { describe, it, expect } from "vitest";
import { parseMarkdown } from "./parseMarkdown.ts";

describe("parseMarkdown", () => {
  it("should convert h1 heading", () => {
    const result = parseMarkdown("# Title");
    expect(result).toContain('<Text fontPx="40" bold="true">Title</Text>');
  });

  it("should convert h2 heading", () => {
    const result = parseMarkdown("## Subtitle");
    expect(result).toContain('<Text fontPx="32" bold="true">Subtitle</Text>');
  });

  it("should convert h3 heading", () => {
    const result = parseMarkdown("### Section");
    expect(result).toContain('<Text fontPx="28" bold="true">Section</Text>');
  });

  it("should convert paragraph", () => {
    const result = parseMarkdown("Hello world");
    expect(result).toContain("<Text>Hello world</Text>");
  });

  it("should convert unordered list", () => {
    const result = parseMarkdown("- Item 1\n- Item 2\n- Item 3");
    expect(result).toContain("<Ul>");
    expect(result).toContain("<Li>Item 1</Li>");
    expect(result).toContain("<Li>Item 2</Li>");
    expect(result).toContain("<Li>Item 3</Li>");
    expect(result).toContain("</Ul>");
  });

  it("should convert ordered list", () => {
    const result = parseMarkdown("1. First\n2. Second\n3. Third");
    expect(result).toContain("<Ol>");
    expect(result).toContain("<Li>First</Li>");
    expect(result).toContain("<Li>Second</Li>");
    expect(result).toContain("<Li>Third</Li>");
    expect(result).toContain("</Ol>");
  });

  it("should split slides by ---", () => {
    const md = "# Slide 1\n\n---\n\n# Slide 2";
    const result = parseMarkdown(md);
    const vstackCount = (result.match(/<VStack/g) || []).length;
    expect(vstackCount).toBe(2);
    expect(result).toContain("Slide 1");
    expect(result).toContain("Slide 2");
  });

  it("should passthrough <pom> blocks", () => {
    const md = '<pom>\n<Image src="test.png" />\n</pom>';
    const result = parseMarkdown(md);
    expect(result).toContain('<Image src="test.png" />');
  });

  it("should wrap each slide in VStack", () => {
    const result = parseMarkdown("# Title\n\nParagraph");
    expect(result).toContain("<VStack");
    expect(result).toContain("</VStack>");
  });

  it("should escape XML special characters in text", () => {
    const result = parseMarkdown("A & B < C > D");
    expect(result).toContain("A &amp; B &lt; C &gt; D");
  });

  it("should handle mixed content in a slide", () => {
    const md = "# Title\n\nSome text\n\n- Item A\n- Item B";
    const result = parseMarkdown(md);
    expect(result).toContain('<Text fontPx="40" bold="true">Title</Text>');
    expect(result).toContain("<Text>Some text</Text>");
    expect(result).toContain("<Ul>");
    expect(result).toContain("<Li>Item A</Li>");
  });

  it("should preserve link text content", () => {
    const result = parseMarkdown("[OpenAI](https://openai.com)");
    expect(result).toContain("<Text>OpenAI</Text>");
  });

  it("should not generate empty slides for unsupported blocks", () => {
    const md =
      "# Slide 1\n\n---\n\n```js\nconst x = 1;\n```\n\n---\n\n# Slide 3";
    const result = parseMarkdown(md);
    const vstackCount = (result.match(/<VStack/g) || []).length;
    expect(vstackCount).toBe(2);
  });

  it("should handle empty input", () => {
    const result = parseMarkdown("");
    expect(result).toBe("");
  });

  it("should handle multiple slides with different content types", () => {
    const md =
      "# Slide 1\n\nIntro text\n\n---\n\n## Slide 2\n\n1. Step 1\n2. Step 2\n\n---\n\n### Slide 3\n\n- Point A\n- Point B";
    const result = parseMarkdown(md);
    const vstackCount = (result.match(/<VStack/g) || []).length;
    expect(vstackCount).toBe(3);
  });
});
