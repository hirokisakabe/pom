/**
 * pptxtojsonのテキスト要素はHTML形式でスタイル情報を含んでいる
 * このモジュールはHTMLからテキストとスタイル情報を抽出する
 */

export interface ExtractedStyles {
  fontSize?: number;
  color?: string;
  bold?: boolean;
  textAlign?: "left" | "center" | "right";
  fontFamily?: string;
}

/**
 * HTMLコンテンツからプレーンテキストを抽出
 * <p>タグは改行、<br>は改行、それ以外のタグは除去
 */
export function extractPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .trim();
}

/**
 * HTMLのstyle属性からスタイル情報を抽出
 * 最初に見つかったスタイルを使用（複数スタイルの場合は最初のもの）
 */
export function extractStyles(html: string): ExtractedStyles {
  const result: ExtractedStyles = {};

  // font-size: Npt
  const fontSizeMatch = html.match(/font-size:\s*(\d+(?:\.\d+)?)pt/i);
  if (fontSizeMatch) {
    result.fontSize = parseFloat(fontSizeMatch[1]);
  }

  // color: #XXXXXX or rgb(...)
  const colorMatch = html.match(/(?:^|[^-])color:\s*(#[0-9A-Fa-f]{6})/i);
  if (colorMatch) {
    result.color = colorMatch[1];
  }

  // font-weight: bold
  const boldMatch = html.match(/font-weight:\s*bold/i);
  if (boldMatch) {
    result.bold = true;
  }

  // text-align: left|center|right
  const textAlignMatch = html.match(/text-align:\s*(left|center|right)/i);
  if (textAlignMatch) {
    result.textAlign = textAlignMatch[1] as "left" | "center" | "right";
  }

  // font-family
  const fontFamilyMatch = html.match(/font-family:\s*["']?([^;"']+)/i);
  if (fontFamilyMatch) {
    result.fontFamily = fontFamilyMatch[1].trim();
  }

  return result;
}
