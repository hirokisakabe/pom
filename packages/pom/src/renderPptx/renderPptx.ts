// pptxgenjs の型定義
type PptxGenJSInstance = import("pptxgenjs").default;

// pptxgenjs は CJS パッケージのため動的 import で読み込む
async function loadPptxGenJS(): Promise<new () => PptxGenJSInstance> {
  const pptxModule = await import("pptxgenjs");
  // CJS default export の解決: module.default.default (ESM wrapper) または module.default
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
  const mod = pptxModule as any;
  return mod.default?.default ?? mod.default ?? mod;
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
}
type SlideMasterProps = Parameters<PptxGenJSInstance["defineSlideMaster"]>[0];
type ImageProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  path?: string;
  data?: string;
};
import type {
  PositionedNode,
  SlideMasterOptions,
  MasterObject,
} from "../types.ts";
import type { BuildContext } from "../buildContext.ts";
import type { RenderContext, NodeBounds } from "./types.ts";
import { pxToIn, pxToPt } from "./units.ts";
import { convertUnderline, convertStrike } from "./textOptions.ts";
import { getImageData } from "../shared/measureImage.ts";
import { resolveBoxSpacing } from "../shared/boxSpacing.ts";
import {
  renderBackgroundAndBorder,
  renderBorderOnly,
} from "./utils/backgroundBorder.ts";
import { getNodeDef } from "../registry/index.ts";

type SlidePx = { w: number; h: number };

const DEFAULT_MASTER_NAME = "POM_MASTER";

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

/**
 * MasterObject を pptxgenjs の objects 形式に変換する
 */
function convertMasterObject(
  obj: MasterObject,
): SlideMasterProps["objects"] extends (infer T)[] | undefined ? T : never {
  switch (obj.type) {
    case "text":
      return {
        text: {
          text: obj.text,
          options: {
            x: pxToIn(obj.x),
            y: pxToIn(obj.y),
            w: pxToIn(obj.w),
            h: pxToIn(obj.h),
            fontSize: obj.fontSize ? pxToPt(obj.fontSize) : undefined,
            fontFace: obj.fontFamily,
            color: obj.color,
            bold: obj.bold,
            italic: obj.italic,
            underline: convertUnderline(obj.underline),
            strike: convertStrike(obj.strike),
            highlight: obj.highlight,
            align: obj.textAlign,
          },
        },
      };
    case "image": {
      const imageProps: ImageProps = {
        x: pxToIn(obj.x),
        y: pxToIn(obj.y),
        w: pxToIn(obj.w),
        h: pxToIn(obj.h),
      };
      // src が data URI かパスかを判定
      if (obj.src.startsWith("data:")) {
        imageProps.data = obj.src;
      } else {
        imageProps.path = obj.src;
      }
      return { image: imageProps };
    }
    case "rect":
      return {
        rect: {
          x: pxToIn(obj.x),
          y: pxToIn(obj.y),
          w: pxToIn(obj.w),
          h: pxToIn(obj.h),
          fill: obj.fill
            ? { color: obj.fill.color, transparency: obj.fill.transparency }
            : undefined,
          line: obj.border
            ? {
                color: obj.border.color,
                width: obj.border.width,
                dashType: obj.border.dashType,
              }
            : undefined,
        },
      };
    case "line":
      return {
        line: {
          x: pxToIn(obj.x),
          y: pxToIn(obj.y),
          w: pxToIn(obj.w),
          h: pxToIn(obj.h),
          line: obj.line
            ? {
                color: obj.line.color,
                width: obj.line.width,
                dashType: obj.line.dashType,
              }
            : { color: "000000", width: 1 },
        },
      };
  }
}

/**
 * SlideMasterOptions から pptxgenjs の defineSlideMaster を呼び出す
 */
function defineSlideMasterFromOptions(
  pptx: PptxGenJSInstance,
  master: SlideMasterOptions,
): string {
  const masterName = master.title || DEFAULT_MASTER_NAME;

  const masterProps: SlideMasterProps = {
    title: masterName,
  };

  // background の変換
  if (master.background) {
    if ("color" in master.background) {
      masterProps.background = { color: master.background.color };
    } else if ("path" in master.background) {
      masterProps.background = { path: master.background.path };
    } else if ("data" in master.background) {
      masterProps.background = { data: master.background.data };
    } else if ("image" in master.background) {
      masterProps.background = { path: master.background.image };
    }
  }

  // margin の変換 (px -> inches)
  if (master.margin !== undefined) {
    const margin = resolveBoxSpacing(master.margin);
    masterProps.margin = [
      pxToIn(margin.top),
      pxToIn(margin.right),
      pxToIn(margin.bottom),
      pxToIn(margin.left),
    ];
  }

  // objects の変換
  if (master.objects && master.objects.length > 0) {
    masterProps.objects = master.objects.map((obj) => convertMasterObject(obj));
  }

  // slideNumber の変換
  if (master.slideNumber) {
    masterProps.slideNumber = {
      x: pxToIn(master.slideNumber.x),
      y: pxToIn(master.slideNumber.y),
      w: master.slideNumber.w ? pxToIn(master.slideNumber.w) : undefined,
      h: master.slideNumber.h ? pxToIn(master.slideNumber.h) : undefined,
      fontSize: master.slideNumber.fontSize
        ? pxToPt(master.slideNumber.fontSize)
        : undefined,
      fontFace: master.slideNumber.fontFamily,
      color: master.slideNumber.color,
    };
  }

  pptx.defineSlideMaster(masterProps);
  return masterName;
}

/**
 * PositionedNode ツリーを PptxGenJS スライドに変換する
 * @param pages PositionedNode ツリーの配列（各要素が1ページ）
 * @param slidePx スライド全体のサイズ（px）
 * @param master スライドマスターオプション（省略可能）
 * @returns PptxGenJS インスタンス
 */
export async function renderPptx(
  pages: PositionedNode[],
  slidePx: SlidePx,
  buildContext: BuildContext,
  master?: SlideMasterOptions,
) {
  const slideIn = { w: pxToIn(slidePx.w), h: pxToIn(slidePx.h) }; // layout(=px) → PptxGenJS(=inch) への最終変換

  const PptxGenJS = await loadPptxGenJS();
  const pptx = new PptxGenJS();

  pptx.defineLayout({ name: "custom", width: slideIn.w, height: slideIn.h });
  pptx.layout = "custom";

  // マスターが指定されている場合、defineSlideMaster を呼び出す
  const masterName = master
    ? defineSlideMasterFromOptions(pptx, master)
    : undefined;

  for (const data of pages) {
    // マスターが指定されている場合は masterName を使用
    const slide = masterName ? pptx.addSlide({ masterName }) : pptx.addSlide();
    const idPositionMap = buildIdPositionMap(data, buildContext.diagnostics);
    const ctx: RenderContext = { slide, pptx, buildContext, idPositionMap };

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
    const rootGradientMarker =
      rootBackgroundGradient && !rootHasOpacity
        ? buildContext.glimpseTextBoxes.registerSlideBackgroundGradient(
            rootBackgroundGradient,
          )
        : undefined;
    if (rootGradientMarker) {
      slide.background = { color: rootGradientMarker };
    } else if (
      rootBackgroundColor &&
      !rootBackgroundGradient &&
      !rootHasOpacity
    ) {
      slide.background = { color: rootBackgroundColor };
    }

    // ルートノードの backgroundImage はスライドの background プロパティとして適用
    // backgroundColor と backgroundImage の両方がある場合、backgroundImage が優先
    const rootBackgroundImage = !isLinelike ? data.backgroundImage : undefined;
    if (rootBackgroundImage) {
      const cachedData = getImageData(
        rootBackgroundImage.src,
        buildContext.imageDataCache,
      );
      if (cachedData) {
        slide.background = { data: cachedData };
      } else {
        slide.background = { path: rootBackgroundImage.src };
      }
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
            ((rootBackgroundColor || rootGradientMarker) && !rootHasOpacity))
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

  return pptx;
}
