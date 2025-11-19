import type { Node as YogaNode } from "yoga-layout";

export type Length = number | "max" | `${number}%`;

export type Padding =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export type BorderDash =
  | "solid"
  | "dash"
  | "dashDot"
  | "lgDash"
  | "lgDashDot"
  | "lgDashDotDot"
  | "sysDash"
  | "sysDot";

export type BorderStyle = {
  color?: string;
  width?: number;
  dashType?: BorderDash;
};

export type FillStyle = {
  color?: string;
  transparency?: number;
};

export type ShadowStyle = {
  type?: "outer" | "inner";
  opacity?: number;
  blur?: number;
  angle?: number;
  offset?: number;
  color?: string;
};

export type AlignItems = "start" | "center" | "end" | "stretch";
export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "spaceBetween"
  | "spaceAround"
  | "spaceEvenly";
export type FlexDirection = "row" | "column";

type BasePOMNode = {
  yogaNode?: YogaNode;

  w?: Length;
  h?: Length;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  padding?: Padding;
  backgroundColor?: string;
  border?: BorderStyle;
};

export type TextNode = BasePOMNode & {
  type: "text";
  text: string;
  fontPx?: number;
  alignText?: "left" | "center" | "right";
};

export type ImageNode = BasePOMNode & {
  type: "image";
  src: string;
};

export type TableCell = {
  text: string;
  fontPx?: number;
  color?: string;
  bold?: boolean;
  alignText?: "left" | "center" | "right";
  backgroundColor?: string;
};

export type TableRow = {
  cells: TableCell[];
  height?: number;
};

export type TableColumn = {
  width: number;
};

export type TableNode = BasePOMNode & {
  type: "table";
  columns: TableColumn[];
  rows: TableRow[];
  defaultRowHeight?: number;
};

export type BoxNode = BasePOMNode & {
  type: "box";
  children: POMNode;
};

export type VStackNode = BasePOMNode & {
  type: "vstack";
  children: POMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
};

export type HStackNode = BasePOMNode & {
  type: "hstack";
  children: POMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
};

export type ShapeNode = BasePOMNode & {
  type: "shape";
  shapeType: string;
  text?: string;
  fill?: FillStyle;
  line?: BorderStyle;
  shadow?: ShadowStyle;
  fontPx?: number;
  fontColor?: string;
  alignText?: "left" | "center" | "right";
};

export type POMNode =
  | TextNode
  | ImageNode
  | TableNode
  | BoxNode
  | VStackNode
  | HStackNode
  | ShapeNode /* | ... */;

type PositionedBase = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PositionedNode =
  | (TextNode & PositionedBase)
  | (ImageNode & PositionedBase)
  | (TableNode & PositionedBase)
  | (BoxNode & PositionedBase & { children: PositionedNode })
  | (VStackNode & PositionedBase & { children: PositionedNode[] })
  | (HStackNode & PositionedBase & { children: PositionedNode[] })
  | (ShapeNode & PositionedBase);
