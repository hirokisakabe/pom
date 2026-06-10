/**
 * リニアグラデーション文字列のパース
 *
 * CSS の linear-gradient() 風の構文を受け付ける:
 *   linear-gradient(135deg, #FF0000 0%, #0000FF 100%)
 *   linear-gradient(to right, #FF0000, #00FF00, #0000FF)
 *   linear-gradient(#FF0000, #0000FF)  ← 角度省略時は 180deg (上→下)
 *
 * - 角度: `<数値>deg` または `to <方向>` キーワード。省略時は 180deg。
 * - カラーストップ: 16進カラー (#RGB / #RRGGBB / RRGGBB) + 任意の位置 (%)。
 *   位置省略時は CSS と同様に補間する (先頭 0% / 末尾 100% / 中間は線形補間)。
 * - ストップは 2 つ以上必須。
 */

export interface GradientStop {
  /** 6桁大文字 HEX (# なし) */
  color: string;
  /** 0-100 (%) */
  position: number;
}

export interface LinearGradient {
  /** CSS 基準の角度 (deg)。0 = 上向き、時計回り。0-360 に正規化済み */
  angle: number;
  stops: GradientStop[];
}

/** `to <方向>` キーワード → CSS 角度 (deg)。コーナーは 45 度刻みの近似 */
const DIRECTION_KEYWORDS: Record<string, number> = {
  "to top": 0,
  "to right": 90,
  "to bottom": 180,
  "to left": 270,
  "to top right": 45,
  "to right top": 45,
  "to bottom right": 135,
  "to right bottom": 135,
  "to bottom left": 225,
  "to left bottom": 225,
  "to top left": 315,
  "to left top": 315,
};

const COLOR_PATTERN = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function normalizeColor(raw: string): string | null {
  const match = COLOR_PATTERN.exec(raw);
  if (!match) return null;
  const hex = match[1];
  if (hex.length === 3) {
    return hex
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase();
  }
  return hex.toUpperCase();
}

/**
 * 位置省略されたストップに CSS 互換のルールで位置を割り当てる。
 * - 先頭が省略なら 0、末尾が省略なら 100
 * - 中間の省略は前後の明示位置の間で均等配置
 * - 位置が前のストップより小さい場合は前の値に切り上げ (非減少を保証)
 */
function resolveStopPositions(
  stops: { color: string; position: number | undefined }[],
): GradientStop[] {
  const positions: (number | undefined)[] = stops.map((s) => s.position);
  if (positions[0] === undefined) positions[0] = 0;
  if (positions[positions.length - 1] === undefined) {
    positions[positions.length - 1] = 100;
  }

  let prevIndex = 0;
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] === undefined) continue;
    const gap = i - prevIndex;
    if (gap > 1) {
      const start = positions[prevIndex]!;
      const end = positions[i]!;
      for (let j = 1; j < gap; j++) {
        positions[prevIndex + j] = start + ((end - start) * j) / gap;
      }
    }
    prevIndex = i;
  }

  let prev = 0;
  return stops.map((stop, i) => {
    const clamped = Math.min(Math.max(positions[i]!, 0), 100);
    const position = Math.max(clamped, prev);
    prev = position;
    return { color: stop.color, position };
  });
}

/**
 * linear-gradient() 構文をパースする。不正な構文の場合は null を返す。
 */
export function parseLinearGradient(value: string): LinearGradient | null {
  const match = /^\s*linear-gradient\s*\(\s*(.+?)\s*\)\s*$/.exec(value);
  if (!match) return null;

  const args = match[1].split(",").map((s) => s.trim());
  if (args.length === 0) return null;

  let angle = 180;
  let stopArgs = args;

  const first = args[0];
  const angleMatch = /^(-?\d+(?:\.\d+)?)deg$/.exec(first);
  const directionAngle =
    DIRECTION_KEYWORDS[first.toLowerCase().replace(/\s+/g, " ")];
  if (angleMatch) {
    angle = ((Number(angleMatch[1]) % 360) + 360) % 360;
    stopArgs = args.slice(1);
  } else if (directionAngle !== undefined) {
    angle = directionAngle;
    stopArgs = args.slice(1);
  }

  if (stopArgs.length < 2) return null;

  const stops: { color: string; position: number | undefined }[] = [];
  for (const stopArg of stopArgs) {
    const parts = stopArg.split(/\s+/);
    if (parts.length === 0 || parts.length > 2) return null;
    const color = normalizeColor(parts[0]);
    if (color === null) return null;

    let position: number | undefined;
    if (parts.length === 2) {
      const posMatch = /^(-?\d+(?:\.\d+)?)%$/.exec(parts[1]);
      if (!posMatch) return null;
      position = Number(posMatch[1]);
    }
    stops.push({ color, position });
  }

  return { angle, stops: resolveStopPositions(stops) };
}
