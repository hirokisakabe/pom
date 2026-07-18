import {
  addEmptySlideFromLayout,
  addSlideNumber,
  asEmu,
  asPt,
  createPptx,
  type AddTextBoxRunPropertiesInput,
  type CreatePptxBackground,
} from "@pptx-glimpse/document";
import type { PositionedNode, SlideMasterOptions } from "../types.ts";
import type { BuildContext } from "../buildContext.ts";
import type { RenderContext, NodeBounds } from "./types.ts";
import { pxToEmu, pxToPt } from "./units.ts";
import { getImageData } from "../shared/measureImage.ts";
import { resolveBoxSpacing } from "../shared/boxSpacing.ts";
import {
  renderBackgroundAndBorder,
  renderBorderOnly,
} from "./utils/backgroundBorder.ts";
import { getNodeDef } from "../registry/index.ts";
import { toColorInput } from "./pptxAuthoring.ts";
import { createGlimpseRunProperties } from "./utils/glimpseTextBox.ts";
import {
  createShapeBoundsInput,
  noneShapeFill,
  shapeOutline,
  solidShapeFill,
} from "./utils/glimpseShape.ts";
import { imageBytesFromSource } from "./utils/glimpsePicture.ts";
import { createWritablePptx } from "./writablePptx.ts";

type SlidePx = { w: number; h: number };

function buildIdPositionMap(
  node: PositionedNode,
  diagnostics: import("../buildContext.ts").BuildContext["diagnostics"],
): Map<string, NodeBounds> {
  const map = new Map<string, NodeBounds>();

  function traverse(n: PositionedNode) {
    if (n.id) {
      if (map.has(n.id)) {
        diagnostics.add(
          "DUPLICATE_NODE_ID",
          `Duplicate node id "${n.id}" — only the first occurrence will be used for Arrow references`,
        );
      } else {
        map.set(n.id, { x: n.x, y: n.y, w: n.w, h: n.h });
      }
    }
    if (n.type === "vstack" || n.type === "hstack" || n.type === "layer") {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return map;
}

/**
 * zIndex でソートして描画順を制御する（安定ソート）
 * zIndex が小さいノードが先に描画される（PowerPoint は追加順に重ねるため）
 */
function sortByZIndex<T extends { zIndex?: number }>(children: T[]): T[] {
  // すべての子要素に zIndex が未設定の場合はそのまま返す
  if (children.every((c) => c.zIndex === undefined)) return children;
  return [...children].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

function masterBackground(
  master: SlideMasterOptions | undefined,
  buildContext: BuildContext,
): CreatePptxBackground | undefined {
  const background = master?.background;
  if (!background) return undefined;
  if ("color" in background) {
    return { kind: "solid", color: toColorInput(background.color)! };
  }
  if ("data" in background) {
    return { kind: "image", bytes: imageBytesFromSource("", background.data) };
  }
  const src = "path" in background ? background.path : background.image;
  return {
    kind: "image",
    bytes: imageBytesFromSource(
      src,
      getImageData(src, buildContext.imageDataCache),
    ),
  };
}

function masterBounds(obj: { x: number; y: number; w: number; h: number }) {
  return createShapeBoundsInput(obj);
}

function masterTextRunProperties(
  obj: Extract<
    NonNullable<SlideMasterOptions["objects"]>[number],
    { type: "text" }
  >,
): AddTextBoxRunPropertiesInput {
  const properties = createGlimpseRunProperties({
    fontSize: obj.fontSize,
    fontFace: obj.fontFamily,
    color: obj.color,
    bold: obj.bold,
    italic: obj.italic,
    underline: obj.underline,
    strike: obj.strike,
    highlight: obj.highlight,
  });
  return {
    ...properties,
    fontFace: obj.fontFamily === undefined ? undefined : properties.fontFace,
    fontSize: obj.fontSize === undefined ? undefined : properties.fontSize,
  };
}

function addMasterContent(
  buildContext: BuildContext,
  master: SlideMasterOptions,
): void {
  const target = buildContext.pptxAuthoring.source.slideMasters[0]?.handle;
  if (!target)
    throw new Error("createPptx did not create a slide master handle");
  buildContext.pptxAuthoring.selectSlide(target);
  for (const obj of master.objects ?? []) {
    switch (obj.type) {
      case "text":
        buildContext.pptxAuthoring.registerTextBox({
          ...masterBounds(obj),
          body: {
            anchor: "middle",
            marginLeft: asEmu(91440),
            marginRight: asEmu(91440),
            marginTop: asEmu(91440),
            marginBottom: asEmu(91440),
          },
          paragraphs: [
            {
              properties: {
                align: obj.textAlign,
                marginLeft: asEmu(0),
                indent: asEmu(0),
                bullet: { type: "none" },
              },
              runs: [
                {
                  text: obj.text,
                  properties: masterTextRunProperties(obj),
                },
              ],
            },
          ],
        });
        break;
      case "image":
        buildContext.pptxAuthoring.registerPicture({
          ...masterBounds(obj),
          bytes: imageBytesFromSource(
            obj.src,
            getImageData(obj.src, buildContext.imageDataCache),
          ),
        });
        break;
      case "rect":
        buildContext.pptxAuthoring.registerShape(
          {
            ...masterBounds(obj),
            geometry: { kind: "preset", preset: "rect" },
            fill: obj.fill
              ? solidShapeFill(obj.fill.color ?? "FFFFFF")
              : noneShapeFill(),
            outline: obj.border ? shapeOutline(obj.border) : undefined,
          },
          {
            fillColor: obj.fill?.color,
            fillOpacity:
              obj.fill?.transparency === undefined
                ? undefined
                : 1 - obj.fill.transparency / 100,
          },
        );
        break;
      case "line":
        buildContext.pptxAuthoring.registerShape({
          ...masterBounds(obj),
          geometry: { kind: "preset", preset: "line" },
          fill: noneShapeFill(),
          outline: shapeOutline(obj.line ?? { color: "000000", width: 1 }),
        });
        break;
    }
  }
  if (master.slideNumber) {
    const value = master.slideNumber;
    buildContext.pptxAuthoring.replaceSource(
      addSlideNumber(buildContext.pptxAuthoring.source, target, {
        offsetX: asEmu(Math.round(pxToEmu(value.x))),
        offsetY: asEmu(Math.round(pxToEmu(value.y))),
        width:
          value.w === undefined
            ? asEmu(800000)
            : asEmu(Math.round(pxToEmu(value.w))),
        height:
          value.h === undefined
            ? asEmu(300000)
            : asEmu(Math.round(pxToEmu(value.h))),
        properties: {
          fontFace: value.fontFamily,
          fontSize: value.fontSize ? asPt(pxToPt(value.fontSize)) : undefined,
          color: toColorInput(value.color),
        },
      }),
    );
  }
}

/**
 * PositionedNode ツリーを glimpse の PPTX source model に変換する
 * @param pages PositionedNode ツリーの配列（各要素が1ページ）
 * @param slidePx スライド全体のサイズ（px）
 * @param master スライドマスターオプション（省略可能）
 * @returns PPTX の write / writeFile / stream 互換 facade
 */
export function renderPptx(
  pages: PositionedNode[],
  slidePx: SlidePx,
  buildContext: BuildContext,
  master?: SlideMasterOptions,
) {
  const margin =
    master?.margin === undefined ? undefined : resolveBoxSpacing(master.margin);
  let source = createPptx({
    slideSize: {
      width: asEmu(Math.round(pxToEmu(slidePx.w))),
      height: asEmu(Math.round(pxToEmu(slidePx.h))),
    },
    slideMaster: {
      name: master?.title ?? "POM_MASTER",
      background: masterBackground(master, buildContext),
    },
    slideLayout: {
      name: "POM_LAYOUT",
      margin: margin
        ? {
            top: asEmu(Math.round(pxToEmu(margin.top))),
            right: asEmu(Math.round(pxToEmu(margin.right))),
            bottom: asEmu(Math.round(pxToEmu(margin.bottom))),
            left: asEmu(Math.round(pxToEmu(margin.left))),
          }
        : undefined,
    },
  });
  buildContext.pptxAuthoring.initialize(source, margin !== undefined);
  if (master) addMasterContent(buildContext, master);

  for (const [pageIndex, data] of pages.entries()) {
    if (pageIndex > 0) {
      const layoutPartPath =
        buildContext.pptxAuthoring.source.slideLayouts[0]?.partPath;
      if (!layoutPartPath)
        throw new Error("createPptx did not create a slide layout");
      source = addEmptySlideFromLayout(buildContext.pptxAuthoring.source, {
        layoutPartPath,
      });
      buildContext.pptxAuthoring.replaceSource(source);
    }
    const slideHandle =
      buildContext.pptxAuthoring.source.slides[pageIndex]?.handle;
    if (!slideHandle)
      throw new Error(`slide handle was not found: ${pageIndex + 1}`);
    buildContext.pptxAuthoring.selectSlide(slideHandle);
    const idPositionMap = buildIdPositionMap(data, buildContext.diagnostics);
    const ctx: RenderContext = { buildContext, idPositionMap };

    // ルートノードの backgroundColor はスライドの background プロパティとして適用
    // これにより、マスタースライドのオブジェクトを覆い隠さない
    // line/arrow ノードは backgroundColor を持たないためスキップ
    // ただし opacity が指定されている場合は slide.background では透過を表現できないため、
    // renderBackgroundAndBorder で描画する
    const isLinelike = data.type === "line" || data.type === "arrow";
    const rootBackgroundColor = !isLinelike ? data.backgroundColor : undefined;
    const rootBackgroundGradient = !isLinelike
      ? data.backgroundGradient
      : undefined;
    const rootHasOpacity =
      !isLinelike && "opacity" in data && data.opacity !== undefined;
    const rootGradientApplied =
      rootBackgroundGradient && !rootHasOpacity
        ? buildContext.pptxAuthoring.setSlideBackgroundGradient(
            rootBackgroundGradient,
          )
        : false;
    if (
      !rootGradientApplied &&
      rootBackgroundColor &&
      !rootBackgroundGradient &&
      !rootHasOpacity
    ) {
      buildContext.pptxAuthoring.setSlideBackgroundSolid(rootBackgroundColor);
    }

    // ルートノードの backgroundImage はスライドの background プロパティとして適用
    // backgroundColor と backgroundImage の両方がある場合、backgroundImage が優先
    const rootBackgroundImage = !isLinelike ? data.backgroundImage : undefined;
    if (rootBackgroundImage) {
      const cachedData = getImageData(
        rootBackgroundImage.src,
        buildContext.imageDataCache,
      );
      buildContext.pptxAuthoring.setSlideBackgroundImage(
        imageBytesFromSource(rootBackgroundImage.src, cachedData),
      );
    }

    /**
     * node をスライドにレンダリングする
     * @param isRoot ルートノードかどうか（ルートノードの background は slide.background で処理済み）
     */
    function renderNode(node: PositionedNode, isRoot = false) {
      // line/arrow ノードは backgroundColor/border を持たないため、background/border の描画をスキップ
      if (node.type !== "line" && node.type !== "arrow") {
        // ルートノードの backgroundColor/backgroundImage は既に slide.background に適用済みなのでスキップ
        // ただし opacity がある場合は slide.background では透過を表現できないため通常描画
        if (
          isRoot &&
          (rootBackgroundImage ||
            ((rootBackgroundColor || rootGradientApplied) && !rootHasOpacity))
        ) {
          // border のみ描画（backgroundColor/backgroundImage はスキップ）
          renderBorderOnly(node, ctx);
        } else {
          renderBackgroundAndBorder(node, ctx);
        }
      }

      const def = getNodeDef(node.type);

      switch (def.category) {
        case "leaf":
          if (!def.render) {
            throw new Error(
              `No render function registered for leaf node: ${node.type}`,
            );
          }
          def.render(node, ctx);
          break;

        case "multi-child":
        case "absolute-child": {
          const containerNode = node as Extract<
            PositionedNode,
            { type: "vstack" | "hstack" | "layer" }
          >;
          // zIndex でソートして描画順を制御（値が小さいものが先に描画される）
          for (const child of sortByZIndex(containerNode.children)) {
            renderNode(child);
          }
          break;
        }
      }
    }

    renderNode(data, true); // ルートノードとして処理
  }

  return createWritablePptx(() => buildContext.pptxAuthoring.source);
}
