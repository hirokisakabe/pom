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

export type POMNode =
  | TextNode
  | ImageNode
  | BoxNode
  | VStackNode
  | HStackNode /* | ... */;

type PositionedBase = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PositionedNode =
  | (TextNode & PositionedBase)
  | (ImageNode & PositionedBase)
  | (BoxNode & PositionedBase & { children: PositionedNode })
  | (VStackNode & PositionedBase & { children: PositionedNode[] })
  | (HStackNode & PositionedBase & { children: PositionedNode[] });
