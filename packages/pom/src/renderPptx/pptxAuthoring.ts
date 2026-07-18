import {
  addChart,
  addPicture,
  addShape,
  addTable,
  addTextBox,
  asEmu,
  asHundredthPt,
  asOoxmlAngle,
  asOoxmlPercent,
  asPt,
  createPptx,
  setSlideBackground,
  type AddChartInput,
  type AddPictureInput,
  type AddShapeColorInput,
  type AddShapeCustomGeometryPathCommandInput,
  type AddShapeEffectsInput,
  type AddShapeFillInput,
  type AddShapeGeometryInput,
  type AddShapeInput,
  type AddShapeOutlineInput,
  type AddTableInput,
  type AddTextBoxGradientFillInput,
  type AddTextBoxInput,
  type AddTextBoxParagraphInput,
  type AddTextBoxRunPropertiesInput,
  type PptxSourceModel,
  type SourceHandle,
} from "@pptx-glimpse/document";
import { parseGradient, parseLinearGradient } from "../shared/gradient.ts";
import type {
  BorderStyle,
  PositionedNode,
  ShadowStyle,
  TextGlow,
  TextOutline,
  Underline,
} from "../types.ts";
import { createTextOptions, resolveSubSup } from "./textOptions.ts";
import { EMU_PER_IN, pxToEmu, pxToPt } from "./units.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

interface GlimpseTextRun {
  text: string;
  properties: AddTextBoxRunPropertiesInput;
  href?: string;
}

export function cleanHex(color: string | undefined): string | undefined {
  const hex = color?.replace(/^#/, "").toUpperCase();
  return hex?.length === 3
    ? [...hex].map((character) => character.repeat(2)).join("")
    : hex;
}

export function toColorInput(
  color: string | undefined,
  opacity?: number,
): AddShapeColorInput | undefined {
  const hex = cleanHex(color);
  if (!hex) return undefined;
  return {
    kind: "srgb",
    hex,
    transforms:
      opacity === undefined
        ? undefined
        : [
            {
              kind: "alpha",
              value: asOoxmlPercent(Math.round(opacity * 100000)),
            },
          ],
  };
}

function toUnderlineInput(underline: Underline | undefined) {
  if (underline === undefined || underline === false) return undefined;
  if (underline === true) return true;
  return {
    style: underline.style,
    color: toColorInput(underline.color),
  };
}

function toBaselineInput(
  subscript: boolean | undefined,
  superscript: boolean | undefined,
) {
  if (subscript) {
    return {
      type: "percent" as const,
      value: asOoxmlPercent(-40000),
    };
  }
  if (superscript) {
    return {
      type: "percent" as const,
      value: asOoxmlPercent(30000),
    };
  }
  return undefined;
}

function toGlowInput(glow: TextGlow | undefined) {
  if (!glow) return undefined;
  return {
    radius: asEmu(Math.round(pxToEmu(glow.size ?? 8))),
    color: toColorInput(glow.color ?? "FFFFFF", glow.opacity ?? 0.75)!,
  };
}

function toOutlineInput(outline: TextOutline | undefined) {
  if (!outline) return undefined;
  return {
    width: asEmu(Math.round(pxToEmu(outline.size ?? 1))),
    color: toColorInput(outline.color ?? "FFFFFF"),
  };
}

function toCharSpacing(letterSpacingPx: number | undefined) {
  if (letterSpacingPx === undefined) return undefined;
  return Math.round(pxToPt(letterSpacingPx) * 100);
}

function toTextGradientInput(
  value: string | undefined,
): AddTextBoxGradientFillInput | undefined {
  if (!value) return undefined;
  const linear = parseLinearGradient(value);
  if (!linear) return undefined;
  const dmlAngle = (((linear.angle - 90) % 360) + 360) % 360;
  return {
    gradientType: "linear",
    angle: asOoxmlAngle(Math.round(dmlAngle * 60000)),
    stops: linear.stops.map((stop) => ({
      position: asOoxmlPercent(Math.round(stop.position * 1000)),
      color: toColorInput(stop.color)!,
    })),
  };
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function resolveUnderline(
  node: TextPositionedNode,
  run: NonNullable<TextPositionedNode["runs"]>[number] | undefined,
): Underline | undefined {
  if (run?.underline !== undefined) return run.underline;
  if (node.underline !== undefined) return node.underline;
  return run?.href ? true : undefined;
}

function buildRunProperties(
  node: TextPositionedNode,
  run: NonNullable<TextPositionedNode["runs"]>[number] | undefined,
  gradientFill: AddTextBoxGradientFillInput | undefined,
): AddTextBoxRunPropertiesInput {
  const fontSizePx = run?.fontSize ?? node.fontSize ?? 24;
  const subSup = run ? resolveSubSup(run, node) : node;
  return stripUndefined({
    fontFace: run?.fontFamily ?? node.fontFamily ?? "Noto Sans JP",
    fontSize: asPt(pxToPt(fontSizePx)),
    color: gradientFill ? undefined : toColorInput(run?.color ?? node.color),
    gradientFill,
    bold: run?.bold ?? node.bold,
    italic: run?.italic ?? node.italic,
    underline: toUnderlineInput(resolveUnderline(node, run)),
    strike: run?.strike ?? node.strike,
    baseline: toBaselineInput(subSup.subscript, subSup.superscript),
    highlight: toColorInput(run?.highlight ?? node.highlight),
    glow: toGlowInput(node.glow),
    outline: toOutlineInput(node.outline),
    charSpacing: toCharSpacing(run?.letterSpacing ?? node.letterSpacing),
  });
}

function buildParagraphs(node: TextPositionedNode): AddTextBoxParagraphInput[] {
  const gradientFill = toTextGradientInput(node.textGradient);
  const sourceRuns: GlimpseTextRun[] =
    node.runs && node.runs.length > 0
      ? node.runs.map((run) => ({
          text: run.text,
          properties: buildRunProperties(node, run, gradientFill),
          href: run.href,
        }))
      : [
          {
            text: node.text ?? "",
            properties: buildRunProperties(node, undefined, gradientFill),
          },
        ];
  const paragraphRuns: GlimpseTextRun[][] = [[]];
  for (const run of sourceRuns) {
    const lines = run.text.replace(/\r*\n/g, "\n").split("\n");
    lines.forEach((line, index) => {
      if (index > 0) paragraphRuns.push([]);
      paragraphRuns.at(-1)?.push({ ...run, text: line });
    });
  }
  const lineHeight = node.lineHeight ?? 1.3;
  const fontSizePx = node.fontSize ?? 24;
  return paragraphRuns.map((runs) => ({
    properties: {
      align: node.textAlign,
      marginLeft: asEmu(0),
      indent: asEmu(0),
      bullet: { type: "none" },
      lineSpacing: asHundredthPt(
        Math.round(pxToPt(fontSizePx * lineHeight) * 100),
      ),
    },
    runs: runs.map((run) => ({
      text: run.text,
      properties: run.properties,
      hyperlink: run.href,
    })),
  }));
}

export type CustomGeometryXmlInput = {
  width: number;
  height: number;
  points: readonly ({ x: number; y: number } | { close: true })[];
};

export type GlimpseShapeXmlOptions = {
  fillColor?: string;
  fillOpacity?: number;
  backgroundGradient?: string;
  outlineGradient?: string;
  outlineOpacity?: number;
  glow?: TextGlow;
  shadow?: ShadowStyle;
  rectRadius?: number;
  dashType?: BorderStyle["dashType"];
  flipH?: boolean;
  flipV?: boolean;
  zeroWidth?: boolean;
  zeroHeight?: boolean;
  customGeometry?: CustomGeometryXmlInput;
};

function toGradientFill(
  value: string,
  opacity?: number,
): AddShapeFillInput | undefined {
  const gradient = parseGradient(value);
  if (!gradient) return undefined;
  const stops = gradient.value.stops.map((stop) => ({
    position: asOoxmlPercent(Math.round(stop.position * 1000)),
    color: toColorInput(stop.color, opacity)!,
  }));
  if (gradient.kind === "linear") {
    const dmlAngle = (((gradient.value.angle - 90) % 360) + 360) % 360;
    return {
      kind: "gradient",
      gradientType: "linear",
      angle: asOoxmlAngle(Math.round(dmlAngle * 60000)),
      stops,
    };
  }
  return {
    kind: "gradient",
    gradientType: "radial",
    centerX: asOoxmlPercent(Math.round(gradient.value.centerX * 1000)),
    centerY: asOoxmlPercent(Math.round(gradient.value.centerY * 1000)),
    stops,
  };
}

function withFillOpacity(
  fill: AddShapeFillInput | undefined,
  opacity: number | undefined,
): AddShapeFillInput | undefined {
  if (!fill || opacity === undefined || fill.kind !== "solid") return fill;
  return {
    ...fill,
    color: toColorInput(fill.color.hex, opacity)!,
  };
}

function toShadowEffects(
  shadow: ShadowStyle | undefined,
): AddShapeEffectsInput | undefined {
  if (!shadow) return undefined;
  const common = {
    blurRadius: asEmu(Math.round((shadow.blur ?? 3) * 12700)),
    distance: asEmu(Math.round((shadow.offset ?? 23000 / 12700) * 12700)),
    direction: asOoxmlAngle(Math.round((shadow.angle ?? 90) * 60000)),
    color: toColorInput(shadow.color ?? "000000", shadow.opacity ?? 0.35)!,
  };
  return shadow.type === "inner"
    ? { innerShadow: common }
    : {
        outerShadow: {
          ...common,
          alignment: "bl",
          rotateWithShape: true,
        },
      };
}

function customGeometry(
  input: CustomGeometryXmlInput,
): AddShapeGeometryInput | undefined {
  const commands: AddShapeCustomGeometryPathCommandInput[] = [];
  let moved = false;
  for (const point of input.points) {
    if ("close" in point) {
      if (moved) commands.push({ kind: "close" });
      continue;
    }
    commands.push({
      kind: moved ? "lineTo" : "moveTo",
      x: Math.round(point.x * EMU_PER_IN),
      y: Math.round(point.y * EMU_PER_IN),
    });
    moved = true;
  }
  if (!moved) return undefined;
  return {
    kind: "custom",
    paths: [
      {
        width: Math.round(input.width * EMU_PER_IN),
        height: Math.round(input.height * EMU_PER_IN),
        commands,
      },
    ],
  };
}

function enrichShapeInput(
  input: AddShapeInput,
  options: GlimpseShapeXmlOptions | undefined,
): AddShapeInput {
  const preset = input.geometry.kind === "preset" ? input.geometry.preset : "";
  const geometry = options?.customGeometry
    ? (customGeometry(options.customGeometry) ?? input.geometry)
    : preset === "roundRect" && options?.rectRadius !== undefined
      ? {
          ...input.geometry,
          adjustValues: {
            adj: Math.round(options.rectRadius * 50000),
          },
        }
      : input.geometry;
  const gradientFill = options?.backgroundGradient
    ? toGradientFill(options.backgroundGradient, options.fillOpacity)
    : undefined;
  const outlineGradient = options?.outlineGradient
    ? toGradientFill(
        options.outlineGradient,
        options.outlineOpacity ?? options.fillOpacity,
      )
    : undefined;
  const outline: AddShapeOutlineInput | undefined = input.outline
    ? {
        ...input.outline,
        fill:
          outlineGradient ??
          withFillOpacity(input.outline.fill, options?.outlineOpacity),
        dash: options?.dashType ?? input.outline.dash,
      }
    : outlineGradient
      ? { fill: outlineGradient }
      : undefined;
  const glow = options?.glow
    ? {
        radius: asEmu(Math.round(pxToEmu(options.glow.size ?? 8))),
        color: toColorInput(
          options.glow.color ?? "FFFFFF",
          options.glow.opacity ?? 0.75,
        )!,
      }
    : input.effects?.glow;
  const effects: AddShapeEffectsInput = {
    ...input.effects,
    ...toShadowEffects(options?.shadow),
    ...(glow ? { glow } : {}),
  };
  const width =
    preset === "line" && options?.zeroWidth ? asEmu(0) : input.width;
  let height =
    preset === "line" && options?.zeroHeight ? asEmu(0) : input.height;
  if (preset === "line" && width === 0 && height === 0) height = asEmu(1);
  return {
    ...input,
    geometry,
    width,
    height,
    fill: gradientFill ?? withFillOpacity(input.fill, options?.fillOpacity),
    outline,
    effects: Object.keys(effects).length > 0 ? effects : undefined,
    flipHorizontal: options?.flipH ?? input.flipHorizontal,
    flipVertical: options?.flipV ?? input.flipVertical,
  };
}

function applyHyperlinks(
  input: AddTextBoxInput,
  hyperlinks: readonly (string | undefined)[] | undefined,
): AddTextBoxInput {
  if (!hyperlinks?.some(Boolean) || !input.paragraphs) return input;
  let index = 0;
  return {
    ...input,
    paragraphs: input.paragraphs.map((paragraph) => ({
      ...paragraph,
      runs: paragraph.runs.map((run) => ({
        ...run,
        hyperlink: hyperlinks[index++],
      })),
    })),
  };
}

export class PptxAuthoringRegistry {
  private currentSource: PptxSourceModel | undefined;
  private currentSlideHandle: SourceHandle | undefined;
  private useLayoutTextMargins = false;
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private tableCount = 0;
  private chartCount = 0;

  constructor() {
    const source = createPptx();
    this.currentSource = source;
    this.currentSlideHandle = source.slides[0]?.handle;
  }

  initialize(source: PptxSourceModel, useLayoutTextMargins = false): void {
    this.currentSource = source;
    this.useLayoutTextMargins = useLayoutTextMargins;
  }

  selectSlide(handle: SourceHandle): void {
    this.currentSlideHandle = handle;
  }

  get source(): PptxSourceModel {
    if (!this.currentSource)
      throw new Error("glimpse authoring is not initialized");
    return this.currentSource;
  }

  get entries(): readonly { kind: "shape"; xml: string }[] {
    return (this.source.edits ?? []).flatMap((edit) =>
      (edit.kind === "addTextBox" || edit.kind === "addShape") && "xml" in edit
        ? [{ kind: "shape" as const, xml: edit.xml }]
        : [],
    );
  }

  replaceSource(source: PptxSourceModel): void {
    this.currentSource = source;
  }

  private get target(): SourceHandle {
    if (!this.currentSlideHandle)
      throw new Error("glimpse slide is not selected");
    return this.currentSlideHandle;
  }

  register(node: TextPositionedNode): void {
    const textOptions = createTextOptions(node);
    this.registerTextBox({
      offsetX: asEmu(Math.round(textOptions.x * EMU_PER_IN)),
      offsetY: asEmu(Math.round(textOptions.y * EMU_PER_IN)),
      width: asEmu(Math.round(textOptions.w * EMU_PER_IN)),
      height: asEmu(Math.round(textOptions.h * EMU_PER_IN)),
      rotation:
        node.rotate === undefined
          ? undefined
          : asOoxmlAngle(Math.round(node.rotate * 60000)),
      body: this.useLayoutTextMargins
        ? undefined
        : {
            anchor: "top",
            marginLeft: asEmu(0),
            marginRight: asEmu(0),
            marginTop: asEmu(0),
            marginBottom: asEmu(0),
          },
      paragraphs: buildParagraphs(node),
    });
  }

  registerTextBox(
    input: AddTextBoxInput,
    options?: {
      name?: string;
      hyperlinks?: readonly (string | undefined)[];
    },
  ): void {
    const name = options?.name ?? `Text ${++this.textCount}`;
    this.currentSource = addTextBox(
      this.source,
      this.target,
      applyHyperlinks({ ...input, name }, options?.hyperlinks),
    );
  }

  registerShape(
    input: AddShapeInput,
    options?: GlimpseShapeXmlOptions & { name?: string },
  ): void {
    const name = options?.name ?? `Shape ${++this.shapeCount}`;
    this.currentSource = addShape(
      this.source,
      this.target,
      enrichShapeInput({ ...input, name }, options),
    );
  }

  registerPicture(
    input: AddPictureInput,
    options?: { name?: string; shadow?: ShadowStyle },
  ): void {
    const name = options?.name ?? `Picture ${++this.pictureCount}`;
    this.currentSource = addPicture(this.source, this.target, {
      ...input,
      name,
      effects: toShadowEffects(options?.shadow),
    });
  }

  registerTable(input: AddTableInput, options?: { name?: string }): void {
    const name = options?.name ?? `Table ${++this.tableCount}`;
    this.currentSource = addTable(this.source, this.target, { ...input, name });
  }

  registerChart(input: AddChartInput, options?: { name?: string }): void {
    const name = options?.name ?? `Chart ${++this.chartCount}`;
    this.currentSource = addChart(this.source, this.target, { ...input, name });
  }

  setSlideBackgroundGradient(
    backgroundGradient: string,
    opacity?: number,
  ): boolean {
    const fill = toGradientFill(backgroundGradient, opacity);
    if (!fill || fill.kind !== "gradient") return false;
    const background =
      fill.gradientType === "linear"
        ? {
            kind: "gradient" as const,
            gradientType: "linear" as const,
            stops: fill.stops,
            angle: fill.angle ?? asOoxmlAngle(0),
          }
        : {
            kind: "gradient" as const,
            gradientType: "radial" as const,
            stops: fill.stops,
            centerX: fill.centerX,
            centerY: fill.centerY,
          };
    this.currentSource = setSlideBackground(
      this.source,
      this.target,
      background,
    );
    return true;
  }

  setSlideBackgroundSolid(color: string): void {
    this.currentSource = setSlideBackground(this.source, this.target, {
      kind: "solid",
      color: toColorInput(color)!,
    });
  }

  setSlideBackgroundImage(bytes: Uint8Array): void {
    this.currentSource = setSlideBackground(this.source, this.target, {
      kind: "image",
      bytes,
    });
  }
}
