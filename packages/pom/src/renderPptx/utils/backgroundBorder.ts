import type { PositionedNode } from "../../types.ts";
import { getImageData } from "../../shared/measureImage.ts";
import { registerBackgroundGradient } from "../gradientFills.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, rectPxToIn } from "../units.ts";
import {
  BORDER_SIDES,
  convertShadow,
  convertBorderLine,
  hasVisibleBorder,
  resolveBackgroundFill,
  resolvePerSideBorders,
  resolveRectRadius,
  type BorderSide,
  type PerSideBorders,
} from "./visualStyle.ts";

/**
 * ノードの背景色・背景画像・ボーダー・影を描画する
 * 全ノードタイプで最初に呼び出される共通処理
 *
 * 描画順序: 背景色 → 背景画像 → ボーダー
 */
export function renderBackgroundAndBorder(
  node: PositionedNode,
  ctx: RenderContext,
): void {
  const {
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    border,
    borderRadius,
    shadow,
  } = node;

  // backgroundGradient はマーカー色の solidFill として描画し、
  // 出力時の後処理で gradFill に置換される (gradientFills.ts 参照)。
  // opacity はマーカー側ではなく gradFill のカラーストップの alpha で表現する
  const gradientMarker = backgroundGradient
    ? registerBackgroundGradient(
        backgroundGradient,
        node.opacity,
        ctx.buildContext.gradientFills,
      )
    : undefined;

  const perSideBorders = resolvePerSideBorders(node);

  const hasBackground = Boolean(backgroundColor) || Boolean(gradientMarker);
  const hasBackgroundImage = Boolean(backgroundImage);
  // 辺ごとの指定がある場合、一律 border は各辺へのマージで反映済みのため
  // shape の line としては描画しない
  const hasUniformBorder = !perSideBorders && hasVisibleBorder(border);
  const hasShadow = Boolean(shadow);

  if (
    !hasBackground &&
    !hasBackgroundImage &&
    !hasUniformBorder &&
    !perSideBorders &&
    !hasShadow
  ) {
    return;
  }

  // borderRadius がある場合は roundRect を使用し、rectRadius を計算
  const shapeType = borderRadius
    ? ctx.pptx.ShapeType.roundRect
    : ctx.pptx.ShapeType.rect;

  const rectRadius = resolveRectRadius(borderRadius, node.w, node.h);

  // backgroundImage がない場合は従来通り1回の addShape で処理
  if (!hasBackgroundImage) {
    if (hasBackground || hasUniformBorder || hasShadow) {
      const fill = hasBackground
        ? resolveBackgroundFill(backgroundColor, node.opacity, gradientMarker)
        : { type: "none" as const };

      const line = hasUniformBorder
        ? convertBorderLine(border, "000000")
        : { type: "none" as const };

      ctx.slide.addShape(shapeType, {
        ...rectPxToIn(node),
        fill,
        line,
        rectRadius,
        shadow: convertShadow(shadow),
      });
    }

    renderPerSideBorders(node, perSideBorders, ctx);
    return;
  }

  // backgroundImage がある場合は分割描画: 背景色 → 背景画像 → ボーダー

  // 1. 背景色
  if (hasBackground) {
    ctx.slide.addShape(shapeType, {
      ...rectPxToIn(node),
      fill: resolveBackgroundFill(
        backgroundColor,
        node.opacity,
        gradientMarker,
      ),
      line: { type: "none" as const },
      rectRadius,
    });
  }

  // 2. 背景画像
  if (backgroundImage) {
    const sizing = backgroundImage.sizing ?? "cover";
    const imageOptions: Record<string, unknown> = {
      ...rectPxToIn(node),
      sizing: {
        type: sizing,
        w: pxToIn(node.w),
        h: pxToIn(node.h),
      },
    };

    const cachedData = getImageData(
      backgroundImage.src,
      ctx.buildContext.imageDataCache,
    );
    if (cachedData) {
      ctx.slide.addImage({ ...imageOptions, data: cachedData });
    } else {
      ctx.slide.addImage({ ...imageOptions, path: backgroundImage.src });
    }
  }

  // 3. ボーダー
  if (hasUniformBorder || hasShadow) {
    ctx.slide.addShape(shapeType, {
      ...rectPxToIn(node),
      fill: { type: "none" as const },
      line: hasUniformBorder
        ? convertBorderLine(border, "000000")
        : { type: "none" as const },
      rectRadius,
      shadow: convertShadow(shadow),
    });
  }

  renderPerSideBorders(node, perSideBorders, ctx);
}

/**
 * ノードの border のみを描画する (背景・影は描画しない)。
 * ルートノードの backgroundColor / backgroundImage を slide.background に
 * 適用した後、border だけを個別に描画するパス用
 */
export function renderBorderOnly(
  node: PositionedNode,
  ctx: RenderContext,
): void {
  const { border, borderRadius } = node;

  const perSideBorders = resolvePerSideBorders(node);
  if (perSideBorders) {
    renderPerSideBorders(node, perSideBorders, ctx);
    return;
  }

  if (!hasVisibleBorder(border)) return;

  const shapeType = borderRadius
    ? ctx.pptx.ShapeType.roundRect
    : ctx.pptx.ShapeType.rect;

  ctx.slide.addShape(shapeType, {
    ...rectPxToIn(node),
    fill: { type: "none" as const },
    line: convertBorderLine(border, "000000"),
    rectRadius: resolveRectRadius(borderRadius, node.w, node.h),
  });
}

/**
 * 辺ごとの border を描画する。borderRadius の有無に応じて分岐:
 * - radius 無し: 各辺を独立した line shape として描画
 * - radius 有り: 角部の円弧 + 直線セグメントの custGeom shape を辺ごとに描画
 */
function renderPerSideBorders(
  node: PositionedNode,
  perSideBorders: PerSideBorders | undefined,
  ctx: RenderContext,
): void {
  if (!perSideBorders) return;

  if (node.borderRadius) {
    renderPerSideBorderPaths(node, perSideBorders, ctx);
    return;
  }

  const edges = {
    top: { x: node.x, y: node.y, w: node.w, h: 0 },
    right: { x: node.x + node.w, y: node.y, w: 0, h: node.h },
    bottom: { x: node.x, y: node.y + node.h, w: node.w, h: 0 },
    left: { x: node.x, y: node.y, w: 0, h: node.h },
  } as const;

  for (const side of BORDER_SIDES) {
    const style = perSideBorders[side];
    if (!style) continue;

    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      ...rectPxToIn(edges[side]),
      line: convertBorderLine(style, "000000"),
    });
  }
}

/**
 * borderRadius と辺ごと border の併用時に、角部の円弧と直線セグメントを
 * 含む custGeom path を辺ごとに描画する。
 *
 * 角弧は水平辺 (top / bottom) のみが所有する設計にしている。
 * - `borderTop` + `borderRadius` (KPI タイル想定): 上 2 つの角丸が borderTop
 *   の色で連続描画される
 * - `borderBottom` + `borderRadius`: 下 2 つの角丸が borderBottom の色で描画
 * - `borderLeft` のみ + `borderRadius` (アクセントバー想定): 角弧は描画されず、
 *   左辺は角丸の内側で直線として始終する。背景 roundRect の角丸はそのまま
 *   見えるので「左辺ストレート + 残りはニュートラルな角丸」のすっきりした
 *   見た目になる
 * - 4 辺すべて + `borderRadius`: top/bottom が上下 2 角を所有、left/right は
 *   角弧を持たず直線セグメントのみ
 *
 * CSS の `border-left + border-radius` は左辺が角に沿って巻き込む形になるが、
 * pom のアクセントバー / ヘッダ罫線ユースケースには「角を引き取らない」方が
 * 素直なので、そちらを採用している。
 */
function renderPerSideBorderPaths(
  node: PositionedNode,
  perSideBorders: PerSideBorders,
  ctx: RenderContext,
): void {
  const { w, h } = node;
  const r = effectiveBorderRadius(node.borderRadius, w, h);

  const ownership: Record<BorderCorner, BorderSide | null> = {
    topLeft: perSideBorders.top ? "top" : null,
    topRight: perSideBorders.top ? "top" : null,
    bottomRight: perSideBorders.bottom ? "bottom" : null,
    bottomLeft: perSideBorders.bottom ? "bottom" : null,
  };

  for (const side of BORDER_SIDES) {
    const style = perSideBorders[side];
    if (!style) continue;

    const points = buildSidePathPoints(side, w, h, r, ownership);
    if (points.length < 2) continue;

    // pptxgenjs v4 のランタイムは "custGeom" を解釈するが型定義に未収録のため
    // SHAPE_NAME へキャストする
    const custGeom = "custGeom" as Parameters<typeof ctx.slide.addShape>[0];
    ctx.slide.addShape(custGeom, {
      ...rectPxToIn(node),
      fill: { type: "none" as const },
      line: convertBorderLine(style, "000000"),
      points,
    });
  }
}

type BorderCorner = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

type CustGeomPoint =
  | { x: number; y: number; moveTo?: boolean }
  | {
      x: number;
      y: number;
      curve: {
        type: "arc";
        hR: number;
        wR: number;
        stAng: number;
        swAng: number;
      };
    };

/**
 * 描画時の実効半径 (px)。pptxgenjs の rectRadius は min(w, h) / 2 で
 * クランプされるため、custGeom 側でも同じクランプを適用する。
 */
function effectiveBorderRadius(
  borderRadius: number | undefined,
  w: number,
  h: number,
): number {
  if (!borderRadius) return 0;
  return Math.min(borderRadius, Math.min(w, h) / 2);
}

/**
 * 1 辺分のパスを (px 単位の) custGeom 用 point 列として返す。座標系は
 * ノード自身のローカル (左上 = 0,0、右下 = w,h)。
 *
 * OOXML arcTo の角度系: 0° = 3 時 (+x)、+90° = 6 時 (+y、画面下方向)。
 * 角部の円弧はいずれも時計回り 90° のスイープになる。
 */
function buildSidePathPoints(
  side: BorderSide,
  w: number,
  h: number,
  r: number,
  ownership: Record<BorderCorner, BorderSide | null>,
): CustGeomPoint[] {
  const points: CustGeomPoint[] = [];
  const arc = (
    end: { x: number; y: number },
    stAng: number,
  ): CustGeomPoint => ({
    x: pxToIn(end.x),
    y: pxToIn(end.y),
    curve: { type: "arc", hR: pxToIn(r), wR: pxToIn(r), stAng, swAng: 90 },
  });
  const lineTo = (p: { x: number; y: number }): CustGeomPoint => ({
    x: pxToIn(p.x),
    y: pxToIn(p.y),
  });
  const moveTo = (p: { x: number; y: number }): CustGeomPoint => ({
    x: pxToIn(p.x),
    y: pxToIn(p.y),
    moveTo: true,
  });

  switch (side) {
    case "top": {
      if (ownership.topLeft === "top") {
        points.push(moveTo({ x: 0, y: r }));
        points.push(arc({ x: r, y: 0 }, 180));
      } else {
        points.push(moveTo({ x: r, y: 0 }));
      }
      points.push(lineTo({ x: w - r, y: 0 }));
      if (ownership.topRight === "top") {
        points.push(arc({ x: w, y: r }, 270));
      }
      return points;
    }
    case "right": {
      if (ownership.topRight === "right") {
        points.push(moveTo({ x: w - r, y: 0 }));
        points.push(arc({ x: w, y: r }, 270));
      } else {
        points.push(moveTo({ x: w, y: r }));
      }
      points.push(lineTo({ x: w, y: h - r }));
      if (ownership.bottomRight === "right") {
        points.push(arc({ x: w - r, y: h }, 0));
      }
      return points;
    }
    case "bottom": {
      if (ownership.bottomRight === "bottom") {
        points.push(moveTo({ x: w, y: h - r }));
        points.push(arc({ x: w - r, y: h }, 0));
      } else {
        points.push(moveTo({ x: w - r, y: h }));
      }
      points.push(lineTo({ x: r, y: h }));
      if (ownership.bottomLeft === "bottom") {
        points.push(arc({ x: 0, y: h - r }, 90));
      }
      return points;
    }
    case "left": {
      if (ownership.bottomLeft === "left") {
        points.push(moveTo({ x: r, y: h }));
        points.push(arc({ x: 0, y: h - r }, 90));
      } else {
        points.push(moveTo({ x: 0, y: h - r }));
      }
      points.push(lineTo({ x: 0, y: r }));
      if (ownership.topLeft === "left") {
        points.push(arc({ x: r, y: 0 }, 180));
      }
      return points;
    }
  }
}
