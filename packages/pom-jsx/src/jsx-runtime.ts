import type {
  SlideProps,
  TextProps,
  VStackProps,
  HStackProps,
  LayerProps,
  UlProps,
  OlProps,
  LiProps,
  ImageProps,
  ShapeProps,
  ChartProps,
  TimelineProps,
  MatrixProps,
  TreeProps,
  FlowProps,
  ProcessArrowProps,
  PyramidProps,
  LineProps,
  IconProps,
  SvgProps,
  TableProps,
  TrProps,
  TdProps,
  ThProps,
  InlineProps,
  AnchorProps,
  SpanProps,
  MarkProps,
} from "./types.ts";

export interface PomJsxElement {
  type: string;
  props: Record<string, unknown>;
}

type ComponentFn = (props: Record<string, unknown>) => PomJsxElement;
type JsxType = string | ComponentFn;

function createElement(
  type: JsxType,
  props: Record<string, unknown>,
  _key?: string,
): PomJsxElement {
  if (typeof type === "function") {
    return type(props);
  }
  return { type, props };
}

export { createElement as jsx, createElement as jsxs, createElement as jsxDEV };

export function Fragment(props: Record<string, unknown>): PomJsxElement {
  return {
    type: "__Fragment__",
    props,
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export type Element = PomJsxElement;
  export interface IntrinsicElements {
    Slide: SlideProps;
    Text: TextProps;
    VStack: VStackProps;
    HStack: HStackProps;
    Layer: LayerProps;
    Ul: UlProps;
    Ol: OlProps;
    Li: LiProps;
    Image: ImageProps;
    Shape: ShapeProps;
    Chart: ChartProps;
    Timeline: TimelineProps;
    Matrix: MatrixProps;
    Tree: TreeProps;
    Flow: FlowProps;
    ProcessArrow: ProcessArrowProps;
    Pyramid: PyramidProps;
    Line: LineProps;
    Icon: IconProps;
    Svg: SvgProps;
    Table: TableProps;
    Tr: TrProps;
    Td: TdProps;
    Th: ThProps;
    B: InlineProps;
    I: InlineProps;
    U: InlineProps;
    S: InlineProps;
    A: AnchorProps;
    Span: SpanProps;
    Mark: MarkProps;
  }
  export interface IntrinsicAttributes {
    key?: string | number | null;
  }
  export interface ElementAttributesProperty {
    props: object;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
