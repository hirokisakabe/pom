/**
 * CSS 風グラデーション文字列のパース
 *
 * linear-gradient と radial-gradient の 2 種類を扱う:
 *   linear-gradient(135deg, #FF0000 0%, #0000FF 100%)
 *   linear-gradient(to right, #FF0000, #00FF00, #0000FF)
 *   linear-gradient(#FF0000, #0000FF)
 *   radial-gradient(circle at center, #FF0000, #0000FF)
 *   radial-gradient(ellipse farthest-corner at 50% 50%, #FF0000 0%, #0000FF 100%)
 *   radial-gradient(#FF0000, #0000FF)
 *
 * - 角度 (linear): `<数値>deg` または `to <方向>` キーワード。省略時は 180deg。
 * - 形状 (radial): `circle` / `ellipse`。省略時は `ellipse`。
 *   PowerPoint の DrawingML radial fill は shape を区別しないため、出力上は同一になる。
 * - サイズキーワード (radial): `closest-side` / `closest-corner` / `farthest-side` /
 *   `farthest-corner`。省略時は `farthest-corner`。MVP では構文として受け付けるのみで
 *   出力は farthest-corner 相当 (PPT 標準) に固定。
 * - 中心位置 (radial): `at <position>` で指定。`center` / `top right` / `25% 75%` 等。
 *   省略時は `center` (50% 50%)。
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

export type RadialGradientShape = "circle" | "ellipse";
export type RadialGradientSize =
  | "closest-side"
  | "closest-corner"
  | "farthest-side"
  | "farthest-corner";

export interface RadialGradient {
  shape: RadialGradientShape;
  size: RadialGradientSize;
  /** 中心位置 X (%、0=左 / 100=右) */
  centerX: number;
  /** 中心位置 Y (%、0=上 / 100=下) */
  centerY: number;
  stops: GradientStop[];
}

export type Gradient =
  | { kind: "linear"; value: LinearGradient }
  | { kind: "radial"; value: RadialGradient };

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

/** カラーストップ群 (`<color> [<pos>%]`) を parse する。失敗時 null */
function parseColorStops(stopArgs: string[]): GradientStop[] | null {
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
  return resolveStopPositions(stops);
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

  const stops = parseColorStops(stopArgs);
  if (!stops) return null;

  return { angle, stops };
}

const SHAPE_KEYWORDS: ReadonlySet<string> = new Set(["circle", "ellipse"]);
const SIZE_KEYWORDS: ReadonlySet<string> = new Set([
  "closest-side",
  "closest-corner",
  "farthest-side",
  "farthest-corner",
]);
const POSITION_X_KEYWORDS: Record<string, number> = {
  left: 0,
  center: 50,
  right: 100,
};
const POSITION_Y_KEYWORDS: Record<string, number> = {
  top: 0,
  center: 50,
  bottom: 100,
};

/**
 * `at <position>` の <position> 部分を parse する。
 * 1〜2 トークンの組み合わせを受け取り、{ x, y } (各 0-100 %) を返す。
 *
 * 受け付ける形:
 *   center / left / right / top / bottom
 *   top right / left bottom / center top など (2 トークン)
 *   50% / 25% 75% (% 値)
 *
 * 不正な組み合わせは null。
 */
function parsePosition(tokens: string[]): { x: number; y: number } | null {
  if (tokens.length === 0 || tokens.length > 2) return null;
  if (tokens.length === 1) {
    const t = tokens[0].toLowerCase();
    if (t === "center") return { x: 50, y: 50 };
    if (t in POSITION_X_KEYWORDS) {
      return { x: POSITION_X_KEYWORDS[t], y: 50 };
    }
    if (t in POSITION_Y_KEYWORDS) {
      return { x: 50, y: POSITION_Y_KEYWORDS[t] };
    }
    const pct = /^(-?\d+(?:\.\d+)?)%$/.exec(t);
    if (pct) return { x: Number(pct[1]), y: 50 };
    return null;
  }
  // 2 tokens.
  let x: number | null = null;
  let y: number | null = null;
  for (const raw of tokens) {
    const t = raw.toLowerCase();
    const pct = /^(-?\d+(?:\.\d+)?)%$/.exec(t);
    if (pct) {
      const v = Number(pct[1]);
      if (x === null) x = v;
      else if (y === null) y = v;
      else return null;
      continue;
    }
    if (t === "left" || t === "right") {
      if (x !== null) return null;
      x = POSITION_X_KEYWORDS[t];
      continue;
    }
    if (t === "top" || t === "bottom") {
      if (y !== null) return null;
      y = POSITION_Y_KEYWORDS[t];
      continue;
    }
    if (t === "center") {
      if (x === null) x = 50;
      else if (y === null) y = 50;
      else return null;
      continue;
    }
    return null;
  }
  return { x: x ?? 50, y: y ?? 50 };
}

/**
 * radial-gradient() 構文をパースする。不正な構文の場合は null を返す。
 *
 * 受け付ける構文:
 *   radial-gradient(<color stops>)
 *   radial-gradient(<shape>?, <color stops>)                       // 例: radial-gradient(circle, #FF0000, #0000FF)
 *   radial-gradient(<shape>? <size>?, <color stops>)               // 例: radial-gradient(circle farthest-side, ...)
 *   radial-gradient(<shape>? <size>? at <position>, <color stops>) // 例: radial-gradient(ellipse at top right, ...)
 *   radial-gradient(at <position>, <color stops>)                  // 例: radial-gradient(at 25% 75%, ...)
 */
export function parseRadialGradient(value: string): RadialGradient | null {
  const match = /^\s*radial-gradient\s*\(\s*(.+?)\s*\)\s*$/.exec(value);
  if (!match) return null;

  const args = match[1].split(",").map((s) => s.trim());
  if (args.length === 0) return null;

  let shape: RadialGradientShape = "ellipse";
  let size: RadialGradientSize = "farthest-corner";
  let centerX = 50;
  let centerY = 50;
  let stopArgs = args;

  const first = args[0];
  const firstTokens = first.split(/\s+/).filter((t) => t.length > 0);
  const firstLowerTokens = firstTokens.map((t) => t.toLowerCase());

  // prelude 判定: shape / size / "at" のいずれかキーワードが含まれていれば prelude として扱う。
  const hasPreludeKeyword = firstLowerTokens.some(
    (t) =>
      SHAPE_KEYWORDS.has(t) ||
      SIZE_KEYWORDS.has(t) ||
      t === "at",
  );

  if (hasPreludeKeyword) {
    const atIdx = firstLowerTokens.indexOf("at");
    const shapeSizeTokens =
      atIdx >= 0 ? firstLowerTokens.slice(0, atIdx) : firstLowerTokens;
    const positionTokens =
      atIdx >= 0 ? firstTokens.slice(atIdx + 1) : [];

    for (const token of shapeSizeTokens) {
      if (SHAPE_KEYWORDS.has(token)) {
        shape = token as RadialGradientShape;
      } else if (SIZE_KEYWORDS.has(token)) {
        size = token as RadialGradientSize;
      } else {
        return null;
      }
    }

    if (atIdx >= 0) {
      if (positionTokens.length === 0) return null;
      const pos = parsePosition(positionTokens);
      if (!pos) return null;
      centerX = pos.x;
      centerY = pos.y;
    }

    stopArgs = args.slice(1);
  }

  const stops = parseColorStops(stopArgs);
  if (!stops) return null;

  return { shape, size, centerX, centerY, stops };
}

/**
 * linear-gradient / radial-gradient のいずれかを parse する。
 */
export function parseGradient(value: string): Gradient | null {
  const linear = parseLinearGradient(value);
  if (linear) return { kind: "linear", value: linear };
  const radial = parseRadialGradient(value);
  if (radial) return { kind: "radial", value: radial };
  return null;
}
