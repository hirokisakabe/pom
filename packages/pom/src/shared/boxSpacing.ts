/**
 * box spacing 系属性 (padding / margin / SlideMaster margin) の内部共通 resolver。
 *
 * 対象属性群: `number | { top?, right?, bottom?, left? }` 形式で指定される余白系の
 * layout/style 属性。pipeline の各段階が個別に形式分岐すると解釈ズレの温床になるため、
 * 「入力 XML の値」から「layout/render が使う解決済み per-edge 値」への正規化を
 * 本モジュールに集約する。
 *
 * 利用箇所:
 * - calcYogaLayout: padding / margin の yoga への設定 (resolveBoxSpacing)
 * - renderPptx: contentArea の padding 控除、SlideMaster margin の変換 (resolveBoxSpacing)
 * - autoFit: padding 縮小・一律スケール時の shape 保持変換 (mapBoxSpacing)
 *
 * fill / border / shadow など見た目属性の変換は renderPptx/utils/visualStyle.ts、
 * 複合ノードのスケーリングは renderPptx/utils/scaleToFit.ts が担当する (本モジュールの対象外)。
 */

/**
 * types.ts の paddingSchema / slideMasterMarginSchema と同じ shape。
 * schema 側を変更する場合は本型も同期すること。
 */
export type BoxSpacingInput =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export interface ResolvedBoxSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const EDGES = ["top", "right", "bottom", "left"] as const;

/**
 * box spacing 値を解決済みの per-edge 値に正規化する。
 * number は 4 辺すべて、object は未指定 edge を 0 として解決する。
 */
export function resolveBoxSpacing(
  value: BoxSpacingInput | undefined,
): ResolvedBoxSpacing {
  if (value === undefined) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  if (typeof value === "number") {
    return { top: value, right: value, bottom: value, left: value };
  }
  return {
    top: value.top ?? 0,
    right: value.right ?? 0,
    bottom: value.bottom ?? 0,
    left: value.left ?? 0,
  };
}

/**
 * box spacing 値の各 edge に fn を適用し、入力の shape を保持したまま返す。
 * number は number のまま、object は定義済み edge のみ変換する
 * (未指定 edge を 0 扱いで生やさない。autoFit の縮小処理が最小値クランプを
 * 持つため、未指定 edge に最小値が混入するのを防ぐ)。
 */
export function mapBoxSpacing(
  value: BoxSpacingInput,
  fn: (edgeValue: number) => number,
): { value: BoxSpacingInput; changed: boolean } {
  if (typeof value === "number") {
    const mapped = fn(value);
    return { value: mapped, changed: mapped !== value };
  }
  const mappedValue: Exclude<BoxSpacingInput, number> = {};
  let changed = false;
  for (const edge of EDGES) {
    const edgeValue = value[edge];
    if (edgeValue === undefined) {
      continue;
    }
    const mapped = fn(edgeValue);
    mappedValue[edge] = mapped;
    if (mapped !== edgeValue) {
      changed = true;
    }
  }
  return { value: mappedValue, changed };
}
