import type { PositionedNode } from "../../types.ts";
import { getImageData } from "../../shared/measureImage.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn } from "../units.ts";
import {
  BORDER_SIDES,
  hasVisibleBorder,
  resolvePerSideBorders,
  resolveRectRadius,
  type BorderSide,
  type PerSideBorders,
} from "./visualStyle.ts";
import { addGlimpsePicture, imageBytesFromSource } from "./glimpsePicture.ts";
import {
  addGlimpseShape,
  backgroundShapeFill,
  createShapeBoundsInput,
  noShapeOutline,
  noneShapeFill,
  shapeOutline,
} from "./glimpseShape.ts";

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

  const perSideBorders = resolvePerSideBorders(node);

  const hasBackground = Boolean(backgroundColor) || Boolean(backgroundGradient);
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
  const shapeType = borderRadius ? "roundRect" : "rect";
  const rectRadius = resolveRectRadius(borderRadius, node.w, node.h);

  // backgroundImage がない場合は従来通り1回の addShape で処理
  if (!hasBackgroundImage) {
    if (hasBackground || hasUniformBorder || hasShadow) {
      const fill = hasBackground
        ? backgroundShapeFill(backgroundColor, backgroundGradient)
        : noneShapeFill();

      const line = hasUniformBorder
        ? shapeOutline(border, "000000")
        : noShapeOutline();

      addGlimpseShape(
        ctx,
        {
          geometry: { kind: "preset", preset: shapeType },
          ...createShapeBoundsInput(node),
          fill,
          outline: line,
        },
        node,
        {
          fillColor: backgroundColor,
          fillOpacity: node.opacity,
          backgroundGradient,
          shadow,
          rectRadius,
          dashType: border?.dashType,
        },
      );
    }

    renderPerSideBorders(node, perSideBorders, ctx);
    return;
  }

  // backgroundImage がある場合は分割描画: 背景色 → 背景画像 → ボーダー

  // 1. 背景色
  if (hasBackground) {
    addGlimpseShape(
      ctx,
      {
        geometry: { kind: "preset", preset: shapeType },
        ...createShapeBoundsInput(node),
        fill: backgroundShapeFill(backgroundColor, backgroundGradient),
        outline: noShapeOutline(),
      },
      node,
      {
        fillColor: backgroundColor,
        fillOpacity: node.opacity,
        backgroundGradient,
        rectRadius,
        dashType: border?.dashType,
      },
    );
  }

  // 2. 背景画像
  if (backgroundImage) {
    const sizing = backgroundImage.sizing ?? "cover";
    const cachedData = getImageData(
      backgroundImage.src,
      ctx.buildContext.imageDataCache,
    );
    addGlimpsePicture(
      ctx,
      node,
      imageBytesFromSource(backgroundImage.src, cachedData),
      {
        sizing: { type: sizing, w: node.w, h: node.h },
      },
    );
  }

  // 3. ボーダー
  if (hasUniformBorder || hasShadow) {
    addGlimpseShape(
      ctx,
      {
        geometry: { kind: "preset", preset: shapeType },
        ...createShapeBoundsInput(node),
        fill: noneShapeFill(),
        outline: hasUniformBorder
          ? shapeOutline(border, "000000")
          : noShapeOutline(),
      },
      node,
      {
        shadow,
        rectRadius,
        dashType: border?.dashType,
      },
    );
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

  const shapeType = borderRadius ? "roundRect" : "rect";

  addGlimpseShape(
    ctx,
    {
      geometry: { kind: "preset", preset: shapeType },
      ...createShapeBoundsInput(node),
      fill: noneShapeFill(),
      outline: shapeOutline(border, "000000"),
    },
    node,
    {
      rectRadius: resolveRectRadius(borderRadius, node.w, node.h),
      dashType: border.dashType,
    },
  );
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

    addGlimpseShape(
      ctx,
      {
        geometry: { kind: "preset", preset: "line" },
        ...createShapeBoundsInput(edges[side]),
        fill: noneShapeFill(),
        outline: shapeOutline(style, "000000"),
      },
      edges[side],
      {
        dashType: style.dashType,
      },
    );
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

    addGlimpseShape(
      ctx,
      {
        geometry: { kind: "preset", preset: "rect" },
        ...createShapeBoundsInput(node),
        fill: noneShapeFill(),
        outline: shapeOutline(style, "000000"),
      },
      node,
      {
        dashType: style.dashType,
        customGeometry: {
          width: pxToIn(w),
          height: pxToIn(h),
          points,
        },
      },
    );
  }
}

type BorderCorner = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

type CustGeomPoint = { x: number; y: number };

/**
 * 描画時の実効半径 (px)。roundRect の半径上限に合わせ、custGeom 側でも
 * min(w, h) / 2 へクランプする。
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
 * @pptx-glimpse/document の custom geometry writer は moveTo / lineTo を
 * サポートするため、角部の 90° 円弧を複数の lineTo へ展開する。
 */
function buildSidePathPoints(
  side: BorderSide,
  w: number,
  h: number,
  r: number,
  ownership: Record<BorderCorner, BorderSide | null>,
): CustGeomPoint[] {
  const points: CustGeomPoint[] = [];
  const point = (p: { x: number; y: number }): CustGeomPoint => ({
    x: pxToIn(p.x),
    y: pxToIn(p.y),
  });
  const appendQuarterArc = (
    center: { x: number; y: number },
    startAngle: number,
  ): void => {
    const segmentCount = 8;
    for (let index = 1; index <= segmentCount; index += 1) {
      const angle = startAngle + (90 * index) / segmentCount;
      const radians = (angle * Math.PI) / 180;
      points.push(
        point({
          x: center.x + r * Math.cos(radians),
          y: center.y + r * Math.sin(radians),
        }),
      );
    }
  };

  switch (side) {
    case "top": {
      if (ownership.topLeft === "top") {
        points.push(point({ x: 0, y: r }));
        appendQuarterArc({ x: r, y: r }, 180);
      } else {
        points.push(point({ x: r, y: 0 }));
      }
      points.push(point({ x: w - r, y: 0 }));
      if (ownership.topRight === "top") {
        appendQuarterArc({ x: w - r, y: r }, 270);
      }
      return points;
    }
    case "right": {
      if (ownership.topRight === "right") {
        points.push(point({ x: w - r, y: 0 }));
        appendQuarterArc({ x: w - r, y: r }, 270);
      } else {
        points.push(point({ x: w, y: r }));
      }
      points.push(point({ x: w, y: h - r }));
      if (ownership.bottomRight === "right") {
        appendQuarterArc({ x: w - r, y: h - r }, 0);
      }
      return points;
    }
    case "bottom": {
      if (ownership.bottomRight === "bottom") {
        points.push(point({ x: w, y: h - r }));
        appendQuarterArc({ x: w - r, y: h - r }, 0);
      } else {
        points.push(point({ x: w - r, y: h }));
      }
      points.push(point({ x: r, y: h }));
      if (ownership.bottomLeft === "bottom") {
        appendQuarterArc({ x: r, y: h - r }, 90);
      }
      return points;
    }
    case "left": {
      if (ownership.bottomLeft === "left") {
        points.push(point({ x: r, y: h }));
        appendQuarterArc({ x: r, y: h - r }, 90);
      } else {
        points.push(point({ x: 0, y: h - r }));
      }
      points.push(point({ x: 0, y: r }));
      if (ownership.topLeft === "left") {
        appendQuarterArc({ x: r, y: r }, 180);
      }
      return points;
    }
  }
}
