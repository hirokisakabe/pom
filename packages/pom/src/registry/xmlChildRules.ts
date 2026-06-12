/**
 * parseXml / serializeXml が共有する XML child handling のルール定義。
 *
 * - インライン装飾タグ (B/I/A/U/S/Mark/Span) と TextRun property の対応
 * - ノードごとの XML child element 受け入れルール (XmlChildRule)
 *
 * parse 側 (parseXml.ts) と serialize 側 (serializeXml.ts) の双方がこの
 * モジュールを参照することで、タグ名・対応 property・許容 child のズレを防ぐ。
 * 依存方向は parseXml / serializeXml → registry の一方向に保つ（このモジュール
 * からは parseXml / serializeXml を import しない）。
 */

// ===== インライン装飾 (B/I/A/U/S/Mark/Span) =====

/** Text / Shape / Li / Td 内のインライン装飾を表すテキスト run */
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  highlight?: string;
  color?: string;
  href?: string;
  fontFamily?: string;
  letterSpacing?: number;
}

/**
 * boolean 装飾タグ ↔ TextRun property の対応。
 * 配列の順序は serialize 時のネスト順（先頭が最も外側）。
 */
export const INLINE_BOOLEAN_FORMATS: readonly {
  readonly tag: string;
  readonly property: "bold" | "italic" | "underline" | "strike";
}[] = [
  { tag: "B", property: "bold" },
  { tag: "I", property: "italic" },
  { tag: "U", property: "underline" },
  { tag: "S", property: "strike" },
];

/** ハイパーリンクタグ。href 属性 → TextRun.href */
export const INLINE_LINK_TAG = "A";

/** ハイライトタグ。color 属性 → TextRun.highlight（省略時は既定色） */
export const INLINE_MARK_TAG = "Mark";

/** Mark の color 属性省略時に適用される既定のハイライト色 */
export const MARK_DEFAULT_HIGHLIGHT_COLOR = "FFFF00";

/** 文字スタイルタグ。color / fontFamily / letterSpacing 属性 → TextRun の同名 property */
export const INLINE_SPAN_TAG = "Span";

/** インライン装飾として許容されるタグの一覧（エラーメッセージの列挙順） */
export const INLINE_FORMAT_TAG_LIST: readonly string[] = [
  "B",
  "I",
  "A",
  "U",
  "S",
  "Mark",
  "Span",
];

/** インライン装飾タグの集合（child element 判定用） */
export const INLINE_FORMAT_TAGS: ReadonlySet<string> = new Set(
  INLINE_FORMAT_TAG_LIST,
);

// ===== XML child element 受け入れルール =====

/**
 * インライン装飾タグ (B/I/A/U/S/Mark/Span) のみを child として受け付け、
 * runs / text property へ変換するルール（Text 用）
 */
export interface InlineRunsChildRule {
  kind: "inline-runs";
}

/** 単一種類の child tag の繰り返しを受け取り、配列 property へ変換するルール */
export interface RepeatedChildRule {
  kind: "repeated";
  /** 受け付ける child tag 名 */
  childTag: string;
  /** 変換結果を格納する property 名 */
  property: string;
  /** 各 item が text content / インライン装飾タグを受け付けるか（Li 用） */
  allowsItemText?: boolean;
}

/**
 * parseXml 側の専用 converter で処理する複雑な child 構造
 * （ネスト構造や複数 property への振り分けを伴うもの）
 */
export interface NodeSpecificChildRule {
  kind: "node-specific";
  /** 直下で受け付ける child tag 名の一覧（unknown child エラーメッセージに使用） */
  expectedTags: readonly string[];
}

export type XmlChildRule =
  | InlineRunsChildRule
  | RepeatedChildRule
  | NodeSpecificChildRule;

/**
 * unknown child エラーメッセージ用に期待タグ一覧を整形する。
 * 例: ["A"] → "<A>" / ["A","B"] → "<A> or <B>" / ["A","B","C"] → "<A>, <B>, or <C>"
 */
export function formatExpectedTags(tags: readonly string[]): string {
  const wrapped = tags.map((tag) => `<${tag}>`);
  if (wrapped.length === 1) return wrapped[0];
  if (wrapped.length === 2) return `${wrapped[0]} or ${wrapped[1]}`;
  return `${wrapped.slice(0, -1).join(", ")}, or ${wrapped[wrapped.length - 1]}`;
}
