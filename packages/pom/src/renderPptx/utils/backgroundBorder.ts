import type { PositionedNode } from "../../types.ts";
import { getImageData } from "../../shared/measureImage.ts";
import type { RenderContext } from "../types.ts";
import { rectPxToIn } from "../units.ts";
import {
  BORDER_SIDES,
  convertBorderLine,
  convertShadow,
  hasVisibleBorder,
  resolvePerSideBorders,
  resolveRectRadius,
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

  const perSideBorders = resolveEffectivePerSideBorders(node, ctx);

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
  const legacyShapeType = borderRadius
    ? ctx.pptx.ShapeType.roundRect
    : ctx.pptx.ShapeType.rect;
  const rectRadius = resolveRectRadius(borderRadius, node.w, node.h);

  // backgroundImage がない場合は従来通り1回の addShape で処理
  if (!hasBackgroundImage) {
    if (hasBackground || hasUniformBorder || hasShadow) {
      if (hasShadow && !backgroundGradient) {
        ctx.slide.addShape(legacyShapeType, {
          ...rectPxToIn(node),
          fill: hasBackground
            ? {
                color: backgroundColor,
                transparency:
                  node.opacity !== undefined
                    ? (1 - node.opacity) * 100
                    : undefined,
              }
            : { type: "none" },
          line: hasUniformBorder
            ? convertBorderLine(border, "000000")
            : { type: "none" },
          rectRadius,
          shadow: convertShadow(shadow),
        });

        renderPerSideBorderLines(node, perSideBorders, ctx);
        return;
      }

      const fill = hasBackground
        ? backgroundShapeFill(backgroundColor, backgroundGradient)
        : noneShapeFill();

      const line = hasUniformBorder
        ? shapeOutline(border, "000000")
        : noShapeOutline();

      addGlimpseShape(
        ctx,
        {
          preset: shapeType,
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

    renderPerSideBorderLines(node, perSideBorders, ctx);
    return;
  }

  // backgroundImage がある場合は分割描画: 背景色 → 背景画像 → ボーダー

  // 1. 背景色
  if (hasBackground) {
    addGlimpseShape(
      ctx,
      {
        preset: shapeType,
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
    if (hasShadow) {
      ctx.slide.addShape(legacyShapeType, {
        ...rectPxToIn(node),
        fill: { type: "none" },
        line: hasUniformBorder
          ? convertBorderLine(border, "000000")
          : { type: "none" },
        rectRadius,
        shadow: convertShadow(shadow),
      });

      renderPerSideBorderLines(node, perSideBorders, ctx);
      return;
    }

    addGlimpseShape(
      ctx,
      {
        preset: shapeType,
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

  const shapeType = borderRadius ? "roundRect" : "rect";

  addGlimpseShape(
    ctx,
    {
      preset: shapeType,
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

    addGlimpseShape(
      ctx,
      {
        preset: "line",
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
