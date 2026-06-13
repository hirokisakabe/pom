import { describe, expect, it } from "vitest";
import { parseMd } from "./parseMd.ts";

describe("parseMd", () => {
  describe("見出し", () => {
    it("h1 を fontSize=28 bold の Text に変換する", () => {
      const { xml } = parseMd("# タイトル");
      expect(xml).toContain('fontSize="28"');
      expect(xml).toContain('bold="true"');
      expect(xml).toContain("タイトル");
    });

    it("h2 を fontSize=24 bold の Text に変換する", () => {
      const { xml } = parseMd("## サブタイトル");
      expect(xml).toContain('fontSize="24"');
      expect(xml).toContain("サブタイトル");
    });

    it("h3 を fontSize=20 bold の Text に変換する", () => {
      const { xml } = parseMd("### 小見出し");
      expect(xml).toContain('fontSize="20"');
      expect(xml).toContain("小見出し");
    });
  });

  describe("段落", () => {
    it("段落テキストを Text ノードに変換する", () => {
      const { xml } = parseMd("これは段落です。");
      expect(xml).toContain("<Text>これは段落です。</Text>");
    });

    it("空入力は空文字列を返す", () => {
      const { xml } = parseMd("");
      expect(xml).toBe("");
    });
  });

  describe("リスト", () => {
    it("箇条書きリストを Ul/Li に変換する", () => {
      const { xml } = parseMd("- 項目1\n- 項目2\n- 項目3");
      expect(xml).toContain("<Ul>");
      expect(xml).toContain("<Li>項目1</Li>");
      expect(xml).toContain("<Li>項目2</Li>");
      expect(xml).toContain("<Li>項目3</Li>");
      expect(xml).toContain("</Ul>");
    });

    it("番号付きリストを Ol/Li に変換する", () => {
      const { xml } = parseMd("1. 最初\n2. 次\n3. 最後");
      expect(xml).toContain("<Ol>");
      expect(xml).toContain("<Li>最初</Li>");
      expect(xml).toContain("<Li>次</Li>");
      expect(xml).toContain("<Li>最後</Li>");
      expect(xml).toContain("</Ol>");
    });
  });

  describe("画像", () => {
    it("画像を Image ノードに変換する", () => {
      const { xml } = parseMd("![alt text](image.png)");
      expect(xml).toContain('<Image src="image.png" />');
    });

    it("画像 src の特殊文字をエスケープする", () => {
      const { xml } = parseMd("![](path/to/image.png?v=1&w=100)");
      expect(xml).toContain("src=");
      expect(xml).toContain("&amp;");
    });
  });

  describe("テーブル", () => {
    it("Markdown テーブルを Table ノードに変換する", () => {
      const md = `| 名前 | 値 |
| --- | --- |
| A | 100 |
| B | 200 |`;
      const { xml } = parseMd(md);
      expect(xml).toContain(`<Table cellBorder='{"color":"CBD5E1"}'>`);
      expect(xml).toContain(
        '<Td bold="true" backgroundColor="F1F5F9">名前</Td>',
      );
      expect(xml).toContain('<Td bold="true" backgroundColor="F1F5F9">値</Td>');
      expect(xml).toContain("<Td>A</Td>");
      expect(xml).toContain("<Td>100</Td>");
      expect(xml).toContain("<Td>B</Td>");
      expect(xml).toContain("<Td>200</Td>");
      expect(xml).toContain("</Table>");
    });
  });

  describe("pomxml コードフェンス", () => {
    it("pomxml コードフェンスをそのまま XML として出力する", () => {
      const md = `# タイトル

\`\`\`pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="200" />
  </ChartSeries>
</Chart>
\`\`\``;
      const { xml } = parseMd(md);
      expect(xml).toContain('<Chart chartType="bar"');
      expect(xml).toContain('<ChartDataPoint label="Q1" value="100"');
    });

    it("pomxml 以外のコードフェンスは無視する", () => {
      const md = "```javascript\nconsole.log('hello');\n```";
      const { xml } = parseMd(md);
      expect(xml).not.toContain("console.log");
    });

    it("pomxml フェンスにフルスライド XML を貼り付けた場合、外側の <Slide> ラッパーを剥がす", () => {
      const md = `\`\`\`pomxml
<Slide>
  <Text fontSize="24">Hello</Text>
</Slide>
\`\`\``;
      const { xml } = parseMd(md);
      // 外側の <Slide> は parseMd 自身が付与するため、内側の <Slide> はネストしない
      expect((xml.match(/<Slide>/g) ?? []).length).toBe(1);
      expect((xml.match(/<\/Slide>/g) ?? []).length).toBe(1);
      expect(xml).toContain('<Text fontSize="24">Hello</Text>');
    });
  });

  describe("スライド分割", () => {
    it("--- でスライドを分割する", () => {
      const md = `# スライド1

---

# スライド2`;
      const { xml } = parseMd(md);
      const vstackCount = (xml.match(/<VStack/g) ?? []).length;
      expect(vstackCount).toBe(2);
      expect(xml).toContain("スライド1");
      expect(xml).toContain("スライド2");
    });

    it("空のスライドは無視する", () => {
      const md = `# スライド1

---

---

# スライド2`;
      const { xml } = parseMd(md);
      const vstackCount = (xml.match(/<VStack/g) ?? []).length;
      expect(vstackCount).toBe(2);
    });
  });

  describe("frontmatter", () => {
    it("size: 16:9 でデフォルトサイズを使用する", () => {
      const md = `---
size: 16:9
---

# タイトル`;
      const { xml, meta } = parseMd(md);
      expect(xml).toContain('w="1280"');
      expect(xml).toContain('h="720"');
      expect(meta.size).toEqual({ w: 1280, h: 720 });
    });

    it("size: 4:3 でサイズを変更する", () => {
      const md = `---
size: 4:3
---

# タイトル`;
      const { xml, meta } = parseMd(md);
      expect(xml).toContain('w="1024"');
      expect(xml).toContain('h="768"');
      expect(meta.size).toEqual({ w: 1024, h: 768 });
    });

    it("frontmatter なしの場合はデフォルト 16:9 を使う", () => {
      const { xml, meta } = parseMd("# タイトル");
      expect(xml).toContain('w="1280"');
      expect(xml).toContain('h="720"');
      expect(meta.size).toEqual({ w: 1280, h: 720 });
    });

    it("masterPptx を meta に含める", () => {
      const md = `---
masterPptx: ./template.pptx
---

# タイトル`;
      const { meta } = parseMd(md);
      expect(meta.masterPptx).toBe("./template.pptx");
    });

    it("masterPptx が未指定の場合は meta に含めない", () => {
      const md = `---
size: 16:9
---

# タイトル`;
      const { meta } = parseMd(md);
      expect(meta.masterPptx).toBeUndefined();
    });

    it("backgroundColor を全スライドの VStack に適用する", () => {
      const md = `---
backgroundColor: "#f0f0f0"
---

# スライド1

---

# スライド2`;
      const { xml } = parseMd(md);
      const bgMatches = xml.match(/backgroundColor="[^"]*"/g) ?? [];
      // 全スライドに backgroundColor が付与される
      const vstackBgMatches = bgMatches.filter(
        (m) => m === 'backgroundColor="#f0f0f0"',
      );
      expect(vstackBgMatches.length).toBe(2);
    });
  });

  describe("スライドラッパー", () => {
    it("各スライドを VStack で囲む", () => {
      const { xml } = parseMd("# タイトル");
      expect(xml).toContain("<VStack");
      expect(xml).toContain('padding="48"');
      expect(xml).toContain('gap="16"');
      expect(xml).toContain("</VStack>");
    });
  });

  describe("CRLF 対応", () => {
    it("CRLF 改行の frontmatter を正しくパースする", () => {
      const md = "---\r\nsize: 4:3\r\n---\r\n\r\n# タイトル";
      const { xml } = parseMd(md);
      expect(xml).toContain('w="1024"');
      expect(xml).toContain('h="768"');
      expect(xml).toContain("タイトル");
    });

    it("CRLF 改行のスライド分割が正しく動作する", () => {
      const md = "# スライド1\r\n\r\n---\r\n\r\n# スライド2";
      const { xml } = parseMd(md);
      const vstackCount = (xml.match(/<VStack/g) ?? []).length;
      expect(vstackCount).toBe(2);
    });
  });

  describe("コードフェンス内の ---", () => {
    it("コードフェンス内の --- でスライドを分割しない", () => {
      const md = `# タイトル

\`\`\`text
---
some content
---
\`\`\`

次の段落`;
      const { xml } = parseMd(md);
      const vstackCount = (xml.match(/<VStack/g) ?? []).length;
      expect(vstackCount).toBe(1);
      expect(xml).toContain("タイトル");
      expect(xml).toContain("次の段落");
    });
  });

  describe("XML エスケープ", () => {
    it("特殊文字をエスケープする", () => {
      const { xml } = parseMd("A < B & C > D");
      expect(xml).toContain("A &lt; B &amp; C &gt; D");
    });
  });

  describe("インラインフォーマット", () => {
    it("太字を <B> タグに変換する", () => {
      const { xml } = parseMd("**太字テキスト**");
      expect(xml).toContain("<Text><B>太字テキスト</B></Text>");
    });

    it("斜体を <I> タグに変換する", () => {
      const { xml } = parseMd("*斜体テキスト*");
      expect(xml).toContain("<Text><I>斜体テキスト</I></Text>");
    });

    it("太字と通常テキストの混在を変換する", () => {
      const { xml } = parseMd("通常 **太字** テキスト");
      expect(xml).toContain("<Text>通常 <B>太字</B> テキスト</Text>");
    });

    it("斜体と通常テキストの混在を変換する", () => {
      const { xml } = parseMd("通常 *斜体* テキスト");
      expect(xml).toContain("<Text>通常 <I>斜体</I> テキスト</Text>");
    });

    it("太字と斜体の混在を変換する", () => {
      const { xml } = parseMd("**太字** と *斜体*");
      expect(xml).toContain("<B>太字</B> と <I>斜体</I>");
    });

    it("太字斜体（ネスト）を変換する", () => {
      const { xml } = parseMd("***太字斜体***");
      // markdown-it は em > strong の順でネストする
      expect(xml).toContain("<B>");
      expect(xml).toContain("<I>");
      expect(xml).toContain("太字斜体");
    });

    it("書式なしテキストはタグを含まない", () => {
      const { xml } = parseMd("プレーンテキスト");
      expect(xml).toContain("<Text>プレーンテキスト</Text>");
      expect(xml).not.toContain("<B>");
      expect(xml).not.toContain("<I>");
    });

    it("見出し内の太字を変換する", () => {
      const { xml } = parseMd("# 見出し **強調**");
      expect(xml).toContain("<B>強調</B>");
      expect(xml).toContain('bold="true"');
    });

    it("リスト項目内の太字を変換する", () => {
      const { xml } = parseMd("- 通常 **太字** 項目");
      expect(xml).toContain("<Li>通常 <B>太字</B> 項目</Li>");
    });

    it("リスト項目内の斜体を変換する", () => {
      const { xml } = parseMd("- 通常 *斜体* 項目");
      expect(xml).toContain("<Li>通常 <I>斜体</I> 項目</Li>");
    });

    it("テーブルセル内の太字を変換する", () => {
      const md = `| 名前 | 値 |
| --- | --- |
| **重要** | 100 |`;
      const { xml } = parseMd(md);
      expect(xml).toContain("<Td><B>重要</B></Td>");
    });

    it("テーブルセル内の斜体を変換する", () => {
      const md = `| 名前 | 値 |
| --- | --- |
| *注記* | 100 |`;
      const { xml } = parseMd(md);
      expect(xml).toContain("<Td><I>注記</I></Td>");
    });

    it("インラインフォーマットの特殊文字をエスケープする", () => {
      const { xml } = parseMd("**A < B**");
      expect(xml).toContain("<B>A &lt; B</B>");
    });
  });

  describe("リンク", () => {
    it("リンクを <A> タグに変換する", () => {
      const { xml } = parseMd("[リンク](https://example.com)");
      expect(xml).toContain(
        '<Text><A href="https://example.com">リンク</A></Text>',
      );
    });

    it("テキスト中のリンクを変換する", () => {
      const { xml } = parseMd("詳細は [こちら](https://example.com) を参照");
      expect(xml).toContain('<A href="https://example.com">こちら</A>');
      expect(xml).toContain("詳細は ");
      expect(xml).toContain(" を参照");
    });

    it("リンク内の太字を変換する", () => {
      const { xml } = parseMd("[**太字リンク**](https://example.com)");
      expect(xml).toContain('<A href="https://example.com">');
      expect(xml).toContain("<B>太字リンク</B>");
    });

    it("リンクの href をエスケープする", () => {
      const { xml } = parseMd("[リンク](https://example.com?a=1&b=2)");
      expect(xml).toContain("href=");
      expect(xml).toContain("&amp;");
    });

    it("リスト項目内のリンクを変換する", () => {
      const { xml } = parseMd("- [リンク](https://example.com)");
      expect(xml).toContain(
        '<Li><A href="https://example.com">リンク</A></Li>',
      );
    });

    it("テーブルセル内のリンクを変換する", () => {
      const md = `| 名前 |
| --- |
| [リンク](https://example.com) |`;
      const { xml } = parseMd(md);
      expect(xml).toContain(
        '<Td><A href="https://example.com">リンク</A></Td>',
      );
    });

    it("見出し内のリンクを変換する", () => {
      const { xml } = parseMd("# [タイトル](https://example.com)");
      expect(xml).toContain('<A href="https://example.com">');
      expect(xml).toContain("タイトル");
    });
  });

  describe("コメント directive", () => {
    it("backgroundColor directive をそのスライドの VStack に適用する", () => {
      const md = `<!-- backgroundColor: red -->

# タイトル`;
      const { xml } = parseMd(md);
      expect(xml).toContain('backgroundColor="red"');
    });

    it("スライドごとに異なる backgroundColor を適用する", () => {
      const md = `<!-- backgroundColor: red -->

# スライド1

---

<!-- backgroundColor: blue -->

# スライド2`;
      const { xml } = parseMd(md);
      expect(xml).toContain('backgroundColor="red"');
      expect(xml).toContain('backgroundColor="blue"');
    });

    it("directive のないスライドには backgroundColor を付与しない", () => {
      const md = `<!-- backgroundColor: red -->

# スライド1

---

# スライド2`;
      const { xml } = parseMd(md);
      // スライド1 には backgroundColor あり
      const vstacks = xml.split("</VStack>");
      expect(vstacks[0]).toContain('backgroundColor="red"');
      // スライド2 には backgroundColor なし（VStack の属性として）
      expect(vstacks[1]).not.toContain("backgroundColor=");
    });

    it("frontmatter の backgroundColor をコメント directive で上書きする", () => {
      const md = `---
backgroundColor: "#f0f0f0"
---

# スライド1

---

<!-- backgroundColor: blue -->

# スライド2`;
      const { xml } = parseMd(md);
      const vstacks = xml.split("</VStack>");
      // スライド1 は frontmatter のデフォルト
      expect(vstacks[0]).toContain('backgroundColor="#f0f0f0"');
      // スライド2 はコメント directive で上書き
      expect(vstacks[1]).toContain('backgroundColor="blue"');
    });

    it("directive の値をクォートで囲んでも正しくパースする", () => {
      const md = `<!-- backgroundColor: "#ff0000" -->

# タイトル`;
      const { xml } = parseMd(md);
      expect(xml).toContain('backgroundColor="#ff0000"');
    });

    it("directive コメントは XML 出力に含めない", () => {
      const md = `<!-- backgroundColor: red -->

# タイトル`;
      const { xml } = parseMd(md);
      expect(xml).not.toContain("<!--");
    });

    it("サポート外の directive コメントは directive として処理しない", () => {
      const md = `<!-- unknownKey: value -->

# タイトル`;
      const { xml } = parseMd(md);
      // サポート外のコメントは directive として抽出されず、VStack 属性に影響しない
      expect(xml).not.toContain("unknownKey=");
      expect(xml).toContain("タイトル");
    });
  });

  describe("複合テスト", () => {
    it("issue #435 のサンプルを変換できる", () => {
      const md = `---
size: 16:9
---

# 売上報告

- Q1は好調
- Q2に課題あり

---

## 詳細データ

\`\`\`pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="80" />
    <ChartDataPoint label="Q3" value="120" />
    <ChartDataPoint label="Q4" value="150" />
  </ChartSeries>
</Chart>
\`\`\`

---

## プロセス

\`\`\`pomxml
<Flow direction="horizontal" w="600" h="200">
  <FlowNode id="plan" shape="flowChartProcess" text="企画" />
  <FlowNode id="develop" shape="flowChartProcess" text="開発" />
  <FlowNode id="release" shape="flowChartTerminator" text="リリース" />
  <FlowConnection from="plan" to="develop" />
  <FlowConnection from="develop" to="release" />
</Flow>
\`\`\``;
      const { xml } = parseMd(md);

      // 3 スライド
      const vstackCount = (xml.match(/<VStack/g) ?? []).length;
      expect(vstackCount).toBe(3);

      // スライド 1
      expect(xml).toContain("売上報告");
      expect(xml).toContain("<Ul>");
      expect(xml).toContain("<Li>Q1は好調</Li>");

      // スライド 2
      expect(xml).toContain("詳細データ");
      expect(xml).toContain('<Chart chartType="bar"');

      // スライド 3
      expect(xml).toContain("プロセス");
      expect(xml).toContain("<Flow");
    });
  });
});
