import type { PomJsxElement } from "./jsx-runtime.ts";
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

function el(type: string, props: object): PomJsxElement {
  return { type, props: props as Record<string, unknown> };
}

export const Slide = (props: SlideProps): PomJsxElement => el("Slide", props);
export const Text = (props: TextProps): PomJsxElement => el("Text", props);
export const VStack = (props: VStackProps): PomJsxElement =>
  el("VStack", props);
export const HStack = (props: HStackProps): PomJsxElement =>
  el("HStack", props);
export const Layer = (props: LayerProps): PomJsxElement => el("Layer", props);
export const Ul = (props: UlProps): PomJsxElement => el("Ul", props);
export const Ol = (props: OlProps): PomJsxElement => el("Ol", props);
export const Li = (props: LiProps): PomJsxElement => el("Li", props);
export const Image = (props: ImageProps): PomJsxElement => el("Image", props);
export const Shape = (props: ShapeProps): PomJsxElement => el("Shape", props);
export const Chart = (props: ChartProps): PomJsxElement => el("Chart", props);
export const Timeline = (props: TimelineProps): PomJsxElement =>
  el("Timeline", props);
export const Matrix = (props: MatrixProps): PomJsxElement =>
  el("Matrix", props);
export const Tree = (props: TreeProps): PomJsxElement => el("Tree", props);
export const Flow = (props: FlowProps): PomJsxElement => el("Flow", props);
export const ProcessArrow = (props: ProcessArrowProps): PomJsxElement =>
  el("ProcessArrow", props);
export const Pyramid = (props: PyramidProps): PomJsxElement =>
  el("Pyramid", props);
export const Line = (props: LineProps): PomJsxElement => el("Line", props);
export const Icon = (props: IconProps): PomJsxElement => el("Icon", props);
export const Svg = (props: SvgProps): PomJsxElement => el("Svg", props);
export const Table = (props: TableProps): PomJsxElement => el("Table", props);
export const Tr = (props: TrProps): PomJsxElement => el("Tr", props);
export const Td = (props: TdProps): PomJsxElement => el("Td", props);
export const Th = (props: ThProps): PomJsxElement => el("Th", props);

// Inline text formatting components
export const B = (props: InlineProps): PomJsxElement => el("B", props);
export const I = (props: InlineProps): PomJsxElement => el("I", props);
export const U = (props: InlineProps): PomJsxElement => el("U", props);
export const S = (props: InlineProps): PomJsxElement => el("S", props);
export const A = (props: AnchorProps): PomJsxElement => el("A", props);
export const Span = (props: SpanProps): PomJsxElement => el("Span", props);
export const Mark = (props: MarkProps): PomJsxElement => el("Mark", props);
