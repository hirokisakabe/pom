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

  const perSideBorders = resolveEffectivePerSideBorders(node, ctx);

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

    renderPerSideBorderLines(node, perSideBorders, ctx);
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

  renderPerSideBorderLines(node, perSideBorders, ctx);
}

/**
 * 辺ごとの border 指定を解決する。borderRadius との併用は角の接続処理が
 * 複雑になるためサポートせず、警告を発して 4 辺一律の border に
 * フォールバックする
 */
function resolveEffectivePerSideBorders(
  node: PositionedNode,
  ctx: RenderContext,
): PerSideBorders | undefined {
  const perSideBorders = resolvePerSideBorders(node);
  if (perSideBorders && node.borderRadius !== undefined) {
    ctx.buildContext.diagnostics.add(
      "PER_SIDE_BORDER_WITH_RADIUS",
      'borderTop / borderRight / borderBottom / borderLeft cannot be combined with borderRadius — falling back to the uniform "border" style',
    );
    return undefined;
  }
  return perSideBorders;
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

  const perSideBorders = resolveEffectivePerSideBorders(node, ctx);
  if (perSideBorders) {
    renderPerSideBorderLines(node, perSideBorders, ctx);
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
 * 辺ごとの border をノードの各辺に沿った line shape として描画する。
 * shape の line オプション (4 辺一律) では表現できないため、辺ごとに
 * 独立した line shape を追加する
 */
function renderPerSideBorderLines(
  node: PositionedNode,
  perSideBorders: PerSideBorders | undefined,
  ctx: RenderContext,
): void {
  if (!perSideBorders) return;

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
