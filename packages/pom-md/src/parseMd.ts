import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";

// ===== スライドサイズプリセット =====
const SIZE_PRESETS: Record<string, { w: number; h: number }> = {
  "16:9": { w: 1280, h: 720 },
  "4:3": { w: 1024, h: 768 },
};

const DEFAULT_SIZE = SIZE_PRESETS["16:9"];

// ===== 見出しフォントサイズ =====
const HEADING_FONT_SIZE: Record<number, number> = {
  1: 28,
  2: 24,
  3: 20,
  4: 18,
  5: 16,
  6: 14,
};

interface Frontmatter {
  size?: { w: number; h: number };
  masterPptx?: string;
  backgroundColor?: string;
}

export interface ParseMdMeta {
  size: { w: number; h: number };
  masterPptx?: string;
}

export interface ParseMdResult {
  xml: string;
  meta: ParseMdMeta;
}

/**
 * frontmatter を抽出する。
 * `---` で囲まれた YAML-like ブロックから `size` を読み取る。
 */
function parseFrontmatter(markdown: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const frontmatter: Frontmatter = {};

  for (const line of yamlBlock.split("\n")) {
    const kv = line.match(/^\s*(\w+)\s*:\s*(.+)\s*$/);
    if (!kv) continue;
    const [, key, value] = kv;

    if (key === "size") {
      const trimmed = value.trim();
      if (trimmed in SIZE_PRESETS) {
        frontmatter.size = SIZE_PRESETS[trimmed];
      }
    } else if (key === "masterPptx") {
      frontmatter.masterPptx = value.trim().replace(/^["']|["']$/g, "");
    } else if (key === "backgroundColor") {
      frontmatter.backgroundColor = value.trim().replace(/^["']|["']$/g, "");
    }
  }

  return { frontmatter, body };
}

/**
 * pomxml フェンスの内容から、外側の `<Slide>...</Slide>` ラッパーを 1 段だけ
 * 剥がす。ユーザーが pom 公式ドキュメントなどからフルスライド XML を貼り付けた
 * 際に、parseMd の出力で `<Slide>` がネストして parseXml が失敗するのを防ぐ。
 * `<Slide>` を含まない通常のスニペット（例: `<Text>...</Text>`）はそのまま返す。
 */
function stripSlideWrapper(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^<Slide\s*>([\s\S]*)<\/Slide>$/);
  return match ? match[1].trim() : trimmed;
}

/** XML 特殊文字をエスケープする */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * markdown-it の inline トークン列から XML マークアップ付きテキストを生成する。
 * bold (`**text**`) → `<B>text</B>`, italic (`*text*`) → `<I>text</I>` に変換する。
 */
function extractInlineXml(tokens: Token[]): string {
  let xml = "";
  for (const t of tokens) {
    if (t.type === "text" || t.type === "code_inline") {
      xml += escapeXml(t.content);
    } else if (t.type === "softbreak" || t.type === "hardbreak") {
      xml += " ";
    } else if (t.type === "strong_open") {
      xml += "<B>";
    } else if (t.type === "strong_close") {
      xml += "</B>";
    } else if (t.type === "em_open") {
      xml += "<I>";
    } else if (t.type === "em_close") {
      xml += "</I>";
    } else if (t.type === "link_open") {
      const href = t.attrGet("href") ?? "";
      xml += `<A href="${escapeXml(href)}">`;
    } else if (t.type === "link_close") {
      xml += "</A>";
    }
  }
  return xml;
}

/** markdown-it トークン列から1つのスライド分の pom XML フラグメントを生成する */
function tokensToXml(tokens: Token[]): string {
  const parts: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // --- 見出し ---
    if (token.type === "heading_open") {
      const level = parseInt(token.tag.slice(1), 10);
      const fontSize = HEADING_FONT_SIZE[level] ?? 14;
      const inlineToken = tokens[i + 1]; // inline
      const xml = inlineToken?.children
        ? extractInlineXml(inlineToken.children)
        : escapeXml(inlineToken?.content ?? "");
      parts.push(`<Text fontSize="${fontSize}" bold="true">${xml}</Text>`);
      i += 3; // heading_open, inline, heading_close
      continue;
    }

    // --- 段落 ---
    if (token.type === "paragraph_open") {
      const inlineToken = tokens[i + 1];

      // 段落内に画像のみの場合は Image ノードとして出力
      if (
        inlineToken?.children &&
        inlineToken.children.length === 1 &&
        inlineToken.children[0].type === "image"
      ) {
        const imgToken = inlineToken.children[0];
        const src = imgToken.attrGet("src") ?? "";
        parts.push(`<Image src="${escapeXml(src)}" />`);
        i += 3; // paragraph_open, inline, paragraph_close
        continue;
      }

      const xml = inlineToken?.children
        ? extractInlineXml(inlineToken.children)
        : escapeXml(inlineToken?.content ?? "");
      if (xml.trim()) {
        parts.push(`<Text>${xml}</Text>`);
      }
      i += 3; // paragraph_open, inline, paragraph_close
      continue;
    }

    // --- 箇条書きリスト ---
    if (
      token.type === "bullet_list_open" ||
      token.type === "ordered_list_open"
    ) {
      const tag = token.type === "bullet_list_open" ? "Ul" : "Ol";
      const items = collectListItems(tokens, i + 1);
      const liXml = items.xmlTexts.map((t) => `<Li>${t}</Li>`).join("");
      parts.push(`<${tag}>${liXml}</${tag}>`);
      i = items.endIndex + 1;
      continue;
    }

    // --- テーブル ---
    if (token.type === "table_open") {
      const tableResult = collectTable(tokens, i + 1);
      parts.push(tableResult.xml);
      i = tableResult.endIndex + 1;
      continue;
    }

    // --- pomxml コードフェンス ---
    if (token.type === "fence" && token.info.trim() === "pomxml") {
      // フェンス内容は周囲の <Slide><VStack> 内に埋め込まれるため、ユーザーが
      // フルスライド XML（`<Slide>...</Slide>`）を貼り付けた場合は外側の
      // <Slide> ラッパーを剥がして、入れ子になった不正な <Slide> 出力を避ける。
      parts.push(stripSlideWrapper(token.content.trim()));
      i++;
      continue;
    }

    // --- その他のコードフェンス（無視） ---
    if (token.type === "fence") {
      i++;
      continue;
    }

    // --- hr（スライド区切り以外の用途では無視） ---
    if (token.type === "hr") {
      i++;
      continue;
    }

    i++;
  }

  return parts.join("\n");
}

/** リストアイテムのテキストを収集する */
function collectListItems(
  tokens: Token[],
  startIndex: number,
): { xmlTexts: string[]; endIndex: number } {
  const xmlTexts: string[] = [];
  let i = startIndex;

  while (i < tokens.length) {
    const token = tokens[i];
    if (
      token.type === "bullet_list_close" ||
      token.type === "ordered_list_close"
    ) {
      return { xmlTexts, endIndex: i };
    }

    if (token.type === "list_item_open") {
      // list_item_open → paragraph_open → inline → paragraph_close → list_item_close
      const inlineToken = tokens[i + 2]; // inline
      const xml = inlineToken?.children
        ? extractInlineXml(inlineToken.children)
        : escapeXml(inlineToken?.content ?? "");
      xmlTexts.push(xml);
    }

    i++;
  }

  return { xmlTexts, endIndex: i - 1 };
}

/** テーブルトークンから pom Table XML を構築する */
function collectTable(
  tokens: Token[],
  startIndex: number,
): { xml: string; endIndex: number } {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let i = startIndex;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "table_close") {
      const headerRow = rows[0] ?? [];
      const dataRows = rows.slice(1);

      let xml = `<Table cellBorder='{"color":"CBD5E1"}'>`;

      // ヘッダー行
      if (headerRow.length > 0) {
        xml += "<Tr>";
        for (const cell of headerRow) {
          xml += `<Td bold="true" backgroundColor="F1F5F9">${cell}</Td>`;
        }
        xml += "</Tr>";
      }

      // データ行
      for (const row of dataRows) {
        xml += "<Tr>";
        for (const cell of row) {
          xml += `<Td>${cell}</Td>`;
        }
        xml += "</Tr>";
      }

      xml += "</Table>";

      return { xml, endIndex: i };
    }

    if (token.type === "tr_open") {
      currentRow = [];
    } else if (token.type === "tr_close") {
      rows.push(currentRow);
    } else if (token.type === "th_open" || token.type === "td_open") {
      const inlineToken = tokens[i + 1];
      const xmlText = inlineToken?.children
        ? extractInlineXml(inlineToken.children)
        : escapeXml(inlineToken?.content ?? "");
      currentRow.push(xmlText);
    }

    i++;
  }

  return {
    xml: `<Table cellBorder='{"color":"CBD5E1"}'></Table>`,
    endIndex: i - 1,
  };
}

/**
 * Markdown 文字列を pom XML 文字列に変換する。
 *
 * - frontmatter (`---` ブロック) でスライドサイズを指定可能
 * - `---` (水平線) でスライドを区切る
 * - `` ```pomxml `` コードフェンスは XML としてそのまま出力
 *
 * @example
 * ```ts
 * import { parseMd } from "@hirokisakabe/pom-md";
 * import { buildPptx } from "@hirokisakabe/pom";
 *
 * const { xml, meta } = parseMd(`
 * ---
 * size: 16:9
 * ---
 *
 * # タイトル
 *
 * - 項目1
 * - 項目2
 *
 * ---
 *
 * ## 詳細
 *
 * \`\`\`pomxml
 * <Chart type="bar" labels="Q1,Q2" values="100,200" />
 * \`\`\`
 * `);
 *
 * const { pptx } = await buildPptx(xml, meta.size);
 * ```
 */
export function parseMd(markdown: string): ParseMdResult {
  // CRLF を LF に正規化
  const normalized = markdown.replace(/\r\n?/g, "\n").trim();

  const { frontmatter, body } = parseFrontmatter(normalized);
  const size = frontmatter.size ?? DEFAULT_SIZE;
  const globalBgColor = frontmatter.backgroundColor;

  // コメント directive をパース前に抽出（html: false を維持するため前処理で対応）
  const { slides: slideTexts } = extractSlideDirectivesFromText(body);

  const md = new MarkdownIt({ html: false });

  const xmlSlides: string[] = [];

  for (const { text: slideText, directives } of slideTexts) {
    const tokens = md.parse(slideText, {});
    const content = tokensToXml(tokens);
    if (!content.trim()) continue;

    const bgColor = directives.backgroundColor ?? globalBgColor;
    const bgAttr = bgColor ? ` backgroundColor="${escapeXml(bgColor)}"` : "";

    xmlSlides.push(
      `<Slide><VStack w="${size.w}" h="${size.h}" padding="48" gap="16"${bgAttr}>\n${content}\n</VStack></Slide>`,
    );
  }

  const meta: ParseMdMeta = { size };
  if (frontmatter.masterPptx) {
    meta.masterPptx = frontmatter.masterPptx;
  }

  return { xml: xmlSlides.join("\n"), meta };
}

// ===== コメント directive =====
const DIRECTIVE_PATTERN = /^<!--\s*(\w+)\s*:\s*(.*?)\s*-->$/;
const SUPPORTED_DIRECTIVES = new Set(["backgroundColor"]);

interface SlideDirectives {
  backgroundColor?: string;
}

interface SlideWithDirectives {
  text: string;
  directives: SlideDirectives;
}

/**
 * Markdown テキストをスライド分割し、各スライドからコメント directive を抽出する。
 * markdown-it の html: false を維持するため、パース前にテキストベースで処理する。
 *
 * スライド区切りは段落間の `---`（前後に空行がある水平線）。
 * コードフェンス内の `---` はスライド区切りとして扱わない。
 */
function extractSlideDirectivesFromText(body: string): {
  slides: SlideWithDirectives[];
} {
  // コードフェンス外の --- でスライドを分割
  // markdown-it と同様に、段落間の --- をスライド区切りとして認識する
  const lines = body.split("\n");
  const slideTexts: string[][] = [[]];
  let inCodeFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
    }

    if (!inCodeFence && /^---\s*$/.test(line.trim())) {
      slideTexts.push([]);
    } else {
      slideTexts[slideTexts.length - 1].push(line);
    }
  }

  const slides: SlideWithDirectives[] = slideTexts.map((slideLines) => {
    const directives: SlideDirectives = {};
    const contentLines: string[] = [];

    for (const line of slideLines) {
      const match = line.trim().match(DIRECTIVE_PATTERN);
      if (match && SUPPORTED_DIRECTIVES.has(match[1])) {
        const [, key, value] = match;
        if (key === "backgroundColor") {
          directives.backgroundColor = value.replace(/^["']|["']$/g, "");
        }
      } else {
        contentLines.push(line);
      }
    }

    return { text: contentLines.join("\n"), directives };
  });

  return { slides };
}
