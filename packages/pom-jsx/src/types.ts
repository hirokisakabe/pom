import type { PomJsxElement } from "./jsx-runtime.ts";

export type ReactNode =
  | PomJsxElement
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactNode[];

// ===== Shared primitive types =====
type Length = number | "max" | `${number}%`;
type PaddingValue =
  | number
  | { top?: number; right?: number; bottom?: number; left?: number };
type BorderDash =
  | "solid"
  | "dash"
  | "dashDot"
  | "lgDash"
  | "lgDashDot"
  | "lgDashDotDot"
  | "sysDash"
  | "sysDot";
type BorderStyle = { color?: string; width?: number; dashType?: BorderDash };
type FillStyle = { color?: string; transparency?: number };
type ShadowStyle = {
  type?: "outer" | "inner";
  opacity?: number;
  blur?: number;
  angle?: number;
  offset?: number;
  color?: string;
};
type TextGlow = { size?: number; opacity?: number; color?: string };
type TextOutline = { size?: number; color?: string };
type AlignItems = "start" | "center" | "end" | "stretch";
type AlignSelf = "auto" | "start" | "center" | "end" | "stretch";
type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "spaceBetween"
  | "spaceAround"
  | "spaceEvenly";
type FlexWrap = "nowrap" | "wrap" | "wrapReverse";
type TextAlign = "left" | "center" | "right";
type UnderlineStyle =
  | "dash"
  | "dashHeavy"
  | "dashLong"
  | "dashLongHeavy"
  | "dbl"
  | "dotDash"
  | "dotDotDash"
  | "dotted"
  | "dottedHeavy"
  | "heavy"
  | "none"
  | "sng"
  | "wavy"
  | "wavyDbl"
  | "wavyHeavy";
type Underline = boolean | { style?: UnderlineStyle; color?: string };
type BackgroundImage = { src: string; sizing?: "cover" | "contain" };

// ===== Base layout props =====
export interface BaseProps {
  w?: Length;
  h?: Length;
  grow?: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  padding?: PaddingValue;
  margin?: PaddingValue;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: BackgroundImage;
  border?: BorderStyle;
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;
  borderRadius?: number;
  opacity?: number;
  zIndex?: number;
  position?: "relative" | "absolute";
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  alignSelf?: AlignSelf;
  shadow?: ShadowStyle;
}

interface TextStyleProps {
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: Underline;
  strike?: boolean;
  highlight?: string;
  fontFamily?: string;
}

// subscript / superscript は Text 系ノードのうち core が schema で受け付ける
// ものだけに付ける (ProcessArrow など TextStyleProps を継承するが
// sub/sup を受け付けないノードに型上だけ生やしてしまうのを防ぐため別 interface)。
interface SubSupProps {
  subscript?: boolean;
  superscript?: boolean;
}

// ===== Slide =====
export interface SlideProps {
  children?: ReactNode;
}

// ===== Theme =====
// 属性名がトークン名、値が 6 桁 hex の色値。子要素は取らない。
export type ThemeProps = Record<string, string>;

// ===== Text =====
export interface TextProps extends BaseProps, TextStyleProps, SubSupProps {
  children?: ReactNode;
  rotate?: number;
  textGradient?: string;
  textAlign?: TextAlign;
  lineHeight?: number;
  letterSpacing?: number;
  glow?: TextGlow;
  outline?: TextOutline;
}

// ===== Inline text components =====
export interface InlineProps {
  children?: ReactNode;
}

export interface AnchorProps {
  children?: ReactNode;
  href?: string;
}

export interface SpanProps {
  children?: ReactNode;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  fontFamily?: string;
  fontSize?: number;
  letterSpacing?: number;
}

export interface MarkProps {
  children?: ReactNode;
  color?: string;
}

// ===== Ul / Ol =====
type BulletNumberType =
  | "alphaLcParenBoth"
  | "alphaLcParenR"
  | "alphaLcPeriod"
  | "alphaUcParenBoth"
  | "alphaUcParenR"
  | "alphaUcPeriod"
  | "arabicParenBoth"
  | "arabicParenR"
  | "arabicPeriod"
  | "arabicPlain"
  | "romanLcParenBoth"
  | "romanLcParenR"
  | "romanLcPeriod"
  | "romanUcParenBoth"
  | "romanUcParenR"
  | "romanUcPeriod";

interface ListBaseProps extends BaseProps, TextStyleProps, SubSupProps {
  children?: ReactNode;
  textAlign?: TextAlign;
  lineHeight?: number;
}

export type UlProps = ListBaseProps;

export interface OlProps extends ListBaseProps {
  numberType?: BulletNumberType;
  numberStartAt?: number;
}

export interface LiProps extends TextStyleProps, SubSupProps {
  children?: ReactNode;
}

// ===== Image =====
export interface ImageSizing {
  type: "contain" | "cover" | "crop";
  w?: number;
  h?: number;
  x?: number;
  y?: number;
}

export interface ImageProps extends BaseProps {
  src: string;
  sizing?: ImageSizing;
  rotate?: number;
}

// ===== VStack / HStack =====
interface StackBaseProps extends BaseProps {
  children?: ReactNode;
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  flexWrap?: FlexWrap;
}

export type VStackProps = StackBaseProps;
export type HStackProps = StackBaseProps;

// ===== Layer =====
export interface LayerProps extends BaseProps {
  children?: ReactNode;
}

// ===== Shape =====
export interface ShapeProps extends BaseProps, TextStyleProps, SubSupProps {
  shapeType: string;
  children?: ReactNode;
  text?: string;
  rotate?: number;
  fill?: FillStyle;
  line?: BorderStyle;
  textAlign?: TextAlign;
  lineHeight?: number;
}

// ===== Chart =====
export interface ChartData {
  name?: string;
  labels: string[];
  values: number[];
}

export interface ChartProps extends BaseProps {
  chartType: "bar" | "line" | "pie" | "area" | "doughnut" | "radar";
  data: ChartData[];
  showLegend?: boolean;
  showTitle?: boolean;
  title?: string;
  chartColors?: string[];
  radarStyle?: "standard" | "marker" | "filled";
  sparkline?: boolean;
}

// ===== Timeline =====
export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  color?: string;
}

export interface TimelineProps extends BaseProps {
  direction?: "horizontal" | "vertical";
  items: TimelineItem[];
  dateColor?: string;
  titleColor?: string;
  descriptionColor?: string;
}

// ===== Matrix =====
export interface MatrixItem {
  label: string;
  x: number;
  y: number;
  color?: string;
  textColor?: string;
}

export interface MatrixProps extends BaseProps {
  axes: { x: string; y: string };
  quadrants?: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
  items: MatrixItem[];
  axisLabelColor?: string;
  quadrantLabelColor?: string;
  itemLabelColor?: string;
}

// ===== Tree =====
export interface TreeDataItem {
  label: string;
  color?: string;
  textColor?: string;
  children?: TreeDataItem[];
}

export interface TreeProps extends BaseProps {
  layout?: "vertical" | "horizontal";
  nodeShape?: "rect" | "roundRect" | "ellipse";
  data: TreeDataItem;
  textColor?: string;
  connectorStyle?: { color?: string; width?: number };
  nodeWidth?: number;
  nodeHeight?: number;
  levelGap?: number;
  siblingGap?: number;
}

// ===== Flow =====
export interface FlowNodeItem {
  id: string;
  shape: string;
  text: string;
  color?: string;
  textColor?: string;
  width?: number;
  height?: number;
}

export interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  color?: string;
  labelColor?: string;
}

export interface FlowProps extends BaseProps {
  direction?: "horizontal" | "vertical";
  nodes: FlowNodeItem[];
  connections: FlowConnection[];
  connectorStyle?: {
    color?: string;
    width?: number;
    arrowType?: "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle";
    labelColor?: string;
  };
  nodeWidth?: number;
  nodeHeight?: number;
  nodeGap?: number;
}

// ===== ProcessArrow =====
export interface ProcessArrowStep {
  label: string;
  color?: string;
  textColor?: string;
}

export interface ProcessArrowProps extends BaseProps, TextStyleProps {
  direction?: "horizontal" | "vertical";
  steps: ProcessArrowStep[];
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
}

// ===== Pyramid =====
export interface PyramidLevel {
  label: string;
  color?: string;
  textColor?: string;
}

export interface PyramidProps extends BaseProps {
  direction?: "up" | "down";
  levels: PyramidLevel[];
  fontSize?: number;
  bold?: boolean;
  fontFamily?: string;
}

// ===== Line =====
type LineArrow =
  | boolean
  | { type?: "none" | "arrow" | "triangle" | "diamond" | "oval" | "stealth" };

export interface LineProps extends BaseProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  lineWidth?: number;
  dashType?: BorderDash;
  beginArrow?: LineArrow;
  endArrow?: LineArrow;
}

// ===== Icon =====
export interface IconProps extends BaseProps {
  name: string;
  size?: number;
  color?: string;
  rotate?: number;
  variant?:
    | "circle-filled"
    | "circle-outlined"
    | "square-filled"
    | "square-outlined";
  bgColor?: string;
}

// ===== Svg =====
export interface SvgProps extends BaseProps {
  svgContent: string;
  color?: string;
}

// ===== Table =====
export interface TableProps extends BaseProps {
  children?: ReactNode;
  defaultRowHeight?: number;
  cellBorder?: BorderStyle;
}

export interface TrProps {
  children?: ReactNode;
  height?: number;
}

interface CellBaseProps extends TextStyleProps, SubSupProps {
  children?: ReactNode;
  textAlign?: TextAlign;
  backgroundColor?: string;
  colspan?: number;
  rowspan?: number;
}

export type TdProps = CellBaseProps;
export type ThProps = CellBaseProps;
