import { type POMNode, type PositionedNode } from "../../types.ts";
import type { NodeDefinition } from "../types.ts";
import { rasterizeIcon } from "../../icons/index.ts";
import { renderIconNode } from "../../renderPptx/nodes/icon.ts";
import { getContentArea } from "../../renderPptx/utils/contentArea.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const iconNodeDef: NodeDefinition = {
  ...getNodeMetadata("icon"),
  applyYogaStyle(node, yn) {
    const n = node as Extract<POMNode, { type: "icon" }>;
    const iconSize = n.size ?? 24;
    // variant 指定時はアイコンサイズ + パディング分を全体サイズとする
    const totalSize = n.variant ? Math.ceil(iconSize * 1.75) : iconSize;
    yn.setMeasureFunc(() => ({ width: totalSize, height: totalSize }));
  },
  async toPositioned(pom, absoluteX, absoluteY, layout, ctx) {
    const n = pom as Extract<POMNode, { type: "icon" }>;
    const iconSize = n.size ?? 24;

    // padding を考慮したコンテンツ領域で bg/icon の座標を計算
    const content = getContentArea({
      x: absoluteX,
      y: absoluteY,
      w: layout.width,
      h: layout.height,
      padding: n.padding,
    });

    // 実描画サイズに合わせてラスタライズ（不要に大きい PNG を防ぐ）
    const rasterSize = Math.max(
      Math.ceil(n.variant ? iconSize : Math.min(content.w, content.h)),
      iconSize,
    );
    const iconImageData = await rasterizeIcon(
      n.name,
      rasterSize,
      n.color ?? "#000000",
      ctx.iconRasterCache,
    );

    const positioned: Record<string, unknown> = {
      ...n,
      x: absoluteX,
      y: absoluteY,
      w: layout.width,
      h: layout.height,
      iconImageData,
    };

    if (n.variant) {
      const totalSize = Math.ceil(iconSize * 1.75);
      // 背景図形は totalSize の正方形として、コンテンツ領域の中央に配置
      positioned.bgX = content.x + (content.w - totalSize) / 2;
      positioned.bgY = content.y + (content.h - totalSize) / 2;
      positioned.bgW = totalSize;
      positioned.bgH = totalSize;
      // アイコンはコンテンツ領域の中央に配置
      positioned.iconX = content.x + (content.w - iconSize) / 2;
      positioned.iconY = content.y + (content.h - iconSize) / 2;
      positioned.iconW = iconSize;
      positioned.iconH = iconSize;
    } else {
      // variant なしの場合もアスペクト比を維持し、コンテンツ領域の中央に配置
      const iconSide = Math.min(content.w, content.h);
      positioned.iconX = content.x + (content.w - iconSide) / 2;
      positioned.iconY = content.y + (content.h - iconSide) / 2;
      positioned.iconW = iconSide;
      positioned.iconH = iconSide;
    }
    return positioned as PositionedNode;
  },
  render(node, ctx) {
    renderIconNode(node as Extract<typeof node, { type: "icon" }>, ctx);
  },
};
