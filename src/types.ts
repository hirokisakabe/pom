// レイアウト内部は px 基準。emit で inch に変換する前提。

export type Px = number;
export type Align = "start" | "center" | "end" | "stretch";
export type Justify = "start" | "center" | "end" | "spaceBetween";
export type Length = Px | "max" | `${number}%`;
export type Spacing = Px | { top?: Px; right?: Px; bottom?: Px; left?: Px };

type Base = {
  id?: string;

  // サイズ（相対指定を許可）
  w?: Length;
  h?: Length;

  // 最小/最大は実数pxで拘束
  minW?: Px;
  minH?: Px;
  maxW?: Px;
  maxH?: Px;

  // 余白
  padding?: Spacing;
  margin?: Spacing;

  // 任意：絶対配置の逃げ道
  position?: "relative" | "absolute";
  x?: Px;
  y?: Px;
  z?: number;

  // 回転（度）
  rotate?: number;
};

export type VStack = Base & {
  type: "vstack";
  gap?: Px;
  alignItems?: Align; // 交差軸
  justify?: Justify; // 主軸
  children: Node[];
};

export type HStack = Base & {
  type: "hstack";
  gap?: Px;
  alignItems?: Align;
  justify?: Justify;
  children: Node[];
};

export type Box = Base & {
  type: "box";
  align?: Align; // 子1つの水平揃え（stretch/center/end）
  children?: Node[];
  // 子ごとの上書き
  alignSelf?: Align;
  grow?: number;
  shrink?: number;
  basis?: Length;
};

export type Text = Base & {
  type: "text";
  text?: string;

  // 将来のリッチテキストを見据えたプレースホルダ
  rich?: {
    runs: {
      text: string;
      bold?: boolean;
      italic?: boolean;
      color?: string;
      link?: string;
    }[];
    bullets?: { type: "disc" | "decimal"; level?: number };
  };

  fontPx?: number;
  alignText?: "left" | "center" | "right";
  lineHeight?: number; // px
  paragraphSpacing?: number; // px
  verticalAlign?: "top" | "middle" | "bottom";
  autoFit?: boolean; // 枠に収まるまで縮小
  // 子ごとの上書き
  alignSelf?: Align;
  grow?: number;
  shrink?: number;
  basis?: Length;
};

export type Image = Base & {
  type: "image";
  src: string; // data URL or file path
  aspectRatio?: number; // w/h
  objectFit?: "contain" | "cover" | "fill";
  objectPosition?: "center" | "top" | "bottom" | "left" | "right";
  // 子ごとの上書き
  alignSelf?: Align;
  grow?: number;
  shrink?: number;
  basis?: Length;
};

export const shapeKinds = [
  "rect",
  "roundRect",
  "circle",
  "triangle",
  "diamond",
  "rightArrow",
  "leftArrow",
  "upArrow",
  "downArrow",
  "line",
  "cloud",
  "callout",
] as const;

export type ShapeKind = (typeof shapeKinds)[number];

export type Shape = Base & {
  type: "shape";
  shapeKind: ShapeKind;
  fill?: { color?: string; opacity?: number };
  border?: { color?: string; width?: Px; dash?: "solid" | "dot" | "dash" };
  text?: string;
  fontPx?: number;
  alignText?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  autoFit?: boolean;
  // 子ごとの上書き
  alignSelf?: Align;
  grow?: number;
  shrink?: number;
  basis?: Length;
};

export type Node = VStack | HStack | Box | Text | Image | Shape;

// layout 入力制約（親のコンテンツ箱サイズ, px）
export type Constraints = { w: Px; h: Px };

// layout 出力（絶対座標は別ステップで加算。ここは相対でも絶対でも px 数値）
export type Positioned = {
  type: Node["type"];
  node: Node;
  x: Px;
  y: Px;
  w: Px;
  h: Px;
  children?: Positioned[];
};
