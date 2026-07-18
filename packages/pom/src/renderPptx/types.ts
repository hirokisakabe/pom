import type { BuildContext } from "../buildContext.ts";

export type NodeBounds = { x: number; y: number; w: number; h: number };

/**
 * ノード renderer が共有する描画コンテキスト。
 *
 * renderer は `(node, ctx) => void` のシグネチャ (registry/types.ts の
 * NodeDefinition.render) で registry に登録され、この context 経由で
 * glimpse authoring と build 全体の状態にアクセスする。
 *
 * renderer 共通処理と helper の責務マップ:
 * - 単位変換 (px → EMU / pt): units.ts (pxToEmu / pxToPt)
 * - padding 解決済みコンテンツ領域: utils/contentArea.ts
 *   (getContentArea / getContentAreaIn / withContentBounds)
 * - scaleToFit 系 diagram の前処理 (コンテンツ領域 + スケール係数):
 *   utils/scaleToFit.ts (resolveScaledContentArea)
 * - 見た目属性の純粋変換: utils/visualStyle.ts
 *   (fill / border / shadow / borderRadius / stripHash)
 * - 背景色・背景画像・ボーダーの描画順序: utils/backgroundBorder.ts
 *   (renderer の手前で renderPptx 本体から呼ばれる)
 * - 2 点間直線の描画 (Line / Arrow): utils/straightLine.ts (addStraightLine)
 * - テキスト系属性の変換: textOptions.ts
 *   (createTextOptions / convertUnderline / convertStrike)
 */
export type RenderContext = {
  /** diagnostics や画像・グラデーションのキャッシュなど build 全体の状態 */
  buildContext: BuildContext;
  /** Arrow の from/to 参照解決に使う id → 絶対座標マップ */
  idPositionMap: Map<string, NodeBounds>;
};
