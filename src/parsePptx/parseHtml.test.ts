import { describe, it, expect } from "vitest";
import { extractPlainText, extractStyles } from "./parseHtml";

describe("extractPlainText", () => {
  it("HTMLタグを除去してプレーンテキストを抽出", () => {
    const html = "<p><span>Hello World</span></p>";
    expect(extractPlainText(html)).toBe("Hello World");
  });

  it("<br>タグを改行に変換", () => {
    const html = "<p>Line1<br>Line2</p>";
    expect(extractPlainText(html)).toBe("Line1\nLine2");
  });

  it("</p>タグを改行に変換", () => {
    const html = "<p>Para1</p><p>Para2</p>";
    expect(extractPlainText(html)).toBe("Para1\nPara2");
  });

  it("HTMLエンティティをデコード", () => {
    const html = "<p>&lt;tag&gt; &amp; &quot;text&quot;</p>";
    expect(extractPlainText(html)).toBe('<tag> & "text"');
  });

  it("&nbsp;をスペースに変換", () => {
    const html = "<p>Hello&nbsp;World</p>";
    expect(extractPlainText(html)).toBe("Hello World");
  });

  it("空のHTMLは空文字列を返す", () => {
    const html = "<p></p>";
    expect(extractPlainText(html)).toBe("");
  });
});

describe("extractStyles", () => {
  it("font-sizeを抽出", () => {
    const html = '<span style="font-size: 18pt;">Text</span>';
    const styles = extractStyles(html);
    expect(styles.fontSize).toBe(18);
  });

  it("colorを抽出", () => {
    const html = '<span style="color: #FF0000;">Text</span>';
    const styles = extractStyles(html);
    expect(styles.color).toBe("#FF0000");
  });

  it("font-weight: boldを検出", () => {
    const html = '<span style="font-weight: bold;">Text</span>';
    const styles = extractStyles(html);
    expect(styles.bold).toBe(true);
  });

  it("text-alignを抽出", () => {
    const html = '<p style="text-align: center;">Text</p>';
    const styles = extractStyles(html);
    expect(styles.textAlign).toBe("center");
  });

  it("font-familyを抽出", () => {
    const html = '<span style="font-family: Arial;">Text</span>';
    const styles = extractStyles(html);
    expect(styles.fontFamily).toBe("Arial");
  });

  it("複数のスタイルを同時に抽出", () => {
    const html =
      '<span style="font-size: 24pt; color: #0000FF; font-weight: bold;">Text</span>';
    const styles = extractStyles(html);
    expect(styles.fontSize).toBe(24);
    expect(styles.color).toBe("#0000FF");
    expect(styles.bold).toBe(true);
  });

  it("スタイルがない場合は空のオブジェクトを返す", () => {
    const html = "<span>Text</span>";
    const styles = extractStyles(html);
    expect(styles.fontSize).toBeUndefined();
    expect(styles.color).toBeUndefined();
    expect(styles.bold).toBeUndefined();
    expect(styles.textAlign).toBeUndefined();
    expect(styles.fontFamily).toBeUndefined();
  });
});
