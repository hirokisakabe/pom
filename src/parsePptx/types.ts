import type { POMNode } from "../types";

export type {
  Slide,
  Element,
  BaseElement,
  Text,
  Image,
  Shape,
  Table,
  TableCell,
  Chart,
  CommonChart,
  ScatterChart,
  ChartItem,
  ChartValue,
  ChartType,
  Fill,
  ColorFill,
  ImageFill,
  GradientFill,
  PatternFill,
  Shadow,
  Border,
  Group,
  Diagram,
  Video,
  Audio,
  Math,
} from "pptxtojson";

export type ParsedPptx = {
  slides: POMNode[];
  images: Map<string, Uint8Array>;
  metadata: {
    slideWidth: number;
    slideHeight: number;
  };
};

export type ParsePptxOptions = {
  slideFactor?: number;
  fontsizeFactor?: number;
};
