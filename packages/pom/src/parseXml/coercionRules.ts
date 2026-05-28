/**
 * 明示的な型変換ルール定義
 *
 * Zod の内部構造（_def）に依存せず、XML 属性値の文字列→適切な型への変換ルールを
 * 静的に定義する。各ノードタイプ・子要素タイプごとに変換テーブルを持つ。
 */

// ===== CoercionRule 型定義 =====
export type CoercionRule =
  | "number"
  | "boolean"
  | "string" // string, enum を含む
  | "json" // array, object, record, tuple → JSON.parse
  | { type: "literal"; value: string | number | boolean }
  | { type: "union"; options: CoercionRule[] }
  | { type: "object"; shape: Record<string, CoercionRule> };

// ===== 変換関数 =====

export function coerceWithRule(
  value: string,
  rule: CoercionRule,
): { value: unknown; error: string | null } {
  if (rule === "number") {
    if (value === "") {
      return {
        value: undefined,
        error: `Cannot convert "${value}" to number`,
      };
    }
    const num = Number(value);
    if (isNaN(num)) {
      return {
        value: undefined,
        error: `Cannot convert "${value}" to number`,
      };
    }
    return { value: num, error: null };
  }
  if (rule === "boolean") {
    if (value !== "true" && value !== "false") {
      return {
        value: undefined,
        error: `Cannot convert "${value}" to boolean (expected "true" or "false")`,
      };
    }
    return { value: value === "true", error: null };
  }
  if (rule === "string") {
    return { value, error: null };
  }
  if (rule === "json") {
    try {
      return { value: JSON.parse(value), error: null };
    } catch {
      return {
        value: undefined,
        error: `Cannot parse JSON value: "${value}"`,
      };
    }
  }
  // オブジェクト型のルール
  if (rule.type === "literal") {
    return { value: rule.value, error: null };
  }
  if (rule.type === "union") {
    return { value: coerceUnionWithRules(value, rule.options), error: null };
  }
  if (rule.type === "object") {
    try {
      return { value: JSON.parse(value), error: null };
    } catch {
      return {
        value: undefined,
        error: `Cannot parse JSON value: "${value}"`,
      };
    }
  }
  return { value: coerceFallback(value), error: null };
}

export function coerceUnionWithRules(
  value: string,
  options: CoercionRule[],
): unknown {
  // boolean を試行
  if ((value === "true" || value === "false") && options.includes("boolean")) {
    return value === "true";
  }

  // number を試行
  if (options.includes("number")) {
    const num = Number(value);
    if (!isNaN(num) && value !== "") {
      return num;
    }
  }

  // literal を試行
  for (const opt of options) {
    if (typeof opt === "object" && opt.type === "literal") {
      if (`${opt.value as string | number}` === value) return opt.value;
    }
  }

  // object/json を試行（JSON パース）
  if (
    options.some(
      (opt) =>
        opt === "json" || (typeof opt === "object" && opt.type === "object"),
    )
  ) {
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        /* ignore */
      }
    }
  }

  // string にフォールバック
  return value;
}

export function coerceFallback(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  const num = Number(value);
  if (value !== "" && !isNaN(num)) return num;
  if (value.startsWith("{") || value.startsWith("[")) {
    try {
      return JSON.parse(value);
    } catch {
      /* ignore */
    }
  }
  return value;
}

/**
 * CoercionRule からオブジェクト型の shape を取得する。
 * dot notation の展開で使用。
 */
export function getObjectShapeFromRule(
  rule: CoercionRule,
): Record<string, CoercionRule> | undefined {
  if (typeof rule === "object" && rule.type === "object") {
    return rule.shape;
  }
  if (typeof rule === "object" && rule.type === "union") {
    const objectOpt = rule.options.find(
      (opt): opt is { type: "object"; shape: Record<string, CoercionRule> } =>
        typeof opt === "object" && opt.type === "object",
    );
    return objectOpt?.shape;
  }
  return undefined;
}

/**
 * boolean と object の union かどうかを判定する。
 * endArrow="true" と endArrow.type="triangle" の共存を許可するために使用。
 */
export function isBooleanObjectUnionRule(rule: CoercionRule): boolean {
  if (typeof rule === "string") return false;
  if (rule.type !== "union") return false;
  const hasBoolean = rule.options.includes("boolean");
  const hasObject = rule.options.some(
    (opt) => typeof opt === "object" && opt.type === "object",
  );
  return hasBoolean && hasObject;
}

type ResolvedMixedNotationShorthand =
  | { mode: "merge"; value: Record<string, unknown> }
  | { mode: "ignore" }
  | { mode: "conflict" };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDirectionalBoxShape(shape: Record<string, CoercionRule>): boolean {
  const keys = Object.keys(shape).sort();
  return (
    keys.length === 4 &&
    keys[0] === "bottom" &&
    keys[1] === "left" &&
    keys[2] === "right" &&
    keys[3] === "top"
  );
}

/**
 * 同一属性で shorthand と dot notation を併用したときに、
 * shorthand 側をどのように扱うかを解決する。
 *
 * - merge: shorthand をオブジェクト化して dot notation 側で上書き
 * - ignore: boolean shorthand を無視して dot notation を優先
 * - conflict: 併用不可（従来どおりエラー）
 */
export function resolveMixedNotationShorthand(
  value: string,
  rule: CoercionRule,
): ResolvedMixedNotationShorthand {
  const objectShape = getObjectShapeFromRule(rule);
  if (!objectShape) return { mode: "conflict" };

  if (
    isBooleanObjectUnionRule(rule) &&
    (value === "true" || value === "false")
  ) {
    return { mode: "ignore" };
  }

  const coerced = coerceWithRule(value, rule);
  if (coerced.error !== null) return { mode: "conflict" };

  if (isPlainObject(coerced.value)) {
    return { mode: "merge", value: coerced.value };
  }

  if (typeof coerced.value === "number" && isDirectionalBoxShape(objectShape)) {
    return {
      mode: "merge",
      value: {
        top: coerced.value,
        right: coerced.value,
        bottom: coerced.value,
        left: coerced.value,
      },
    };
  }

  return { mode: "conflict" };
}

// ===== 共通変換ルール =====

const LENGTH_RULE: CoercionRule = {
  type: "union",
  options: ["number", { type: "literal", value: "max" }, "string"],
};

const PADDING_RULE: CoercionRule = {
  type: "union",
  options: [
    "number",
    {
      type: "object",
      shape: {
        top: "number",
        right: "number",
        bottom: "number",
        left: "number",
      },
    },
  ],
};

const BORDER_STYLE_RULE: CoercionRule = {
  type: "object",
  shape: { color: "string", width: "number", dashType: "string" },
};

const FILL_STYLE_RULE: CoercionRule = {
  type: "object",
  shape: { color: "string", transparency: "number" },
};

const SHADOW_STYLE_RULE: CoercionRule = {
  type: "object",
  shape: {
    type: "string",
    opacity: "number",
    blur: "number",
    angle: "number",
    offset: "number",
    color: "string",
  },
};

const UNDERLINE_RULE: CoercionRule = {
  type: "union",
  options: [
    "boolean",
    { type: "object", shape: { style: "string", color: "string" } },
  ],
};

const LINE_ARROW_RULE: CoercionRule = {
  type: "union",
  options: ["boolean", { type: "object", shape: { type: "string" } }],
};

const BACKGROUND_IMAGE_RULE: CoercionRule = {
  type: "object",
  shape: { src: "string", sizing: "string" },
};

const TREE_CONNECTOR_STYLE_RULE: CoercionRule = {
  type: "object",
  shape: { color: "string", width: "number" },
};

const FLOW_CONNECTOR_STYLE_RULE: CoercionRule = {
  type: "object",
  shape: { color: "string", width: "number", arrowType: "string" },
};

const IMAGE_SIZING_RULE: CoercionRule = {
  type: "object",
  shape: {
    type: "string",
    w: "number",
    h: "number",
    x: "number",
    y: "number",
  },
};

// ===== Base node 属性 =====
const BASE_RULES: Record<string, CoercionRule> = {
  id: "string",
  w: LENGTH_RULE,
  h: LENGTH_RULE,
  minW: "number",
  maxW: "number",
  minH: "number",
  maxH: "number",
  padding: PADDING_RULE,
  margin: PADDING_RULE,
  backgroundColor: "string",
  backgroundImage: BACKGROUND_IMAGE_RULE,
  border: BORDER_STYLE_RULE,
  borderRadius: "number",
  opacity: "number",
  zIndex: "number",
  position: "string",
  top: "number",
  right: "number",
  bottom: "number",
  left: "number",
  alignSelf: "string",
  shadow: SHADOW_STYLE_RULE,
};

// テキスト系の共通属性
const TEXT_STYLE_RULES: Record<string, CoercionRule> = {
  fontSize: "number",
  color: "string",
  textAlign: "string",
  bold: "boolean",
  italic: "boolean",
  underline: UNDERLINE_RULE,
  strike: "boolean",
  highlight: "string",
  fontFamily: "string",
  lineHeight: "number",
};

// ===== ノードタイプ別の変換ルールマップ =====
export const NODE_COERCION_MAP: Record<string, Record<string, CoercionRule>> = {
  text: {
    ...BASE_RULES,
    text: "string",
    ...TEXT_STYLE_RULES,
  },
  ul: {
    ...BASE_RULES,
    items: "json",
    ...TEXT_STYLE_RULES,
  },
  ol: {
    ...BASE_RULES,
    items: "json",
    ...TEXT_STYLE_RULES,
    numberType: "string",
    numberStartAt: "number",
  },
  image: {
    ...BASE_RULES,
    src: "string",
    sizing: IMAGE_SIZING_RULE,
  },
  icon: {
    ...BASE_RULES,
    name: "string",
    size: "number",
    color: "string",
    variant: "string",
    bgColor: "string",
  },
  svg: {
    ...BASE_RULES,
    color: "string",
  },
  table: {
    ...BASE_RULES,
    columns: "json",
    rows: "json",
    defaultRowHeight: "number",
    cellBorder: BORDER_STYLE_RULE,
  },
  shape: {
    ...BASE_RULES,
    shapeType: "string",
    text: "string",
    fill: FILL_STYLE_RULE,
    line: BORDER_STYLE_RULE,
    ...TEXT_STYLE_RULES,
  },
  chart: {
    ...BASE_RULES,
    chartType: "string",
    data: "json",
    showLegend: "boolean",
    showTitle: "boolean",
    title: "string",
    chartColors: "json",
    radarStyle: "string",
  },
  timeline: {
    ...BASE_RULES,
    direction: "string",
    items: "json",
  },
  matrix: {
    ...BASE_RULES,
    axes: "json",
    quadrants: "json",
    items: "json",
  },
  tree: {
    ...BASE_RULES,
    layout: "string",
    nodeShape: "string",
    data: "json",
    connectorStyle: TREE_CONNECTOR_STYLE_RULE,
    nodeWidth: "number",
    nodeHeight: "number",
    levelGap: "number",
    siblingGap: "number",
  },
  flow: {
    ...BASE_RULES,
    direction: "string",
    nodes: "json",
    connections: "json",
    connectorStyle: FLOW_CONNECTOR_STYLE_RULE,
    nodeWidth: "number",
    nodeHeight: "number",
    nodeGap: "number",
  },
  processArrow: {
    ...BASE_RULES,
    direction: "string",
    steps: "json",
    itemWidth: "number",
    itemHeight: "number",
    gap: "number",
    fontSize: "number",
    bold: "boolean",
    italic: "boolean",
    underline: UNDERLINE_RULE,
    strike: "boolean",
    highlight: "string",
    fontFamily: "string",
  },
  pyramid: {
    ...BASE_RULES,
    direction: "string",
    levels: "json",
    fontSize: "number",
    bold: "boolean",
    fontFamily: "string",
  },
  line: {
    ...BASE_RULES,
    x1: "number",
    y1: "number",
    x2: "number",
    y2: "number",
    color: "string",
    lineWidth: "number",
    dashType: "string",
    beginArrow: LINE_ARROW_RULE,
    endArrow: LINE_ARROW_RULE,
  },
  arrow: {
    ...BASE_RULES,
    from: "string",
    to: "string",
    color: "string",
    lineWidth: "number",
    dashType: "string",
    beginArrow: LINE_ARROW_RULE,
    endArrow: LINE_ARROW_RULE,
  },
  // コンテナノード
  vstack: {
    ...BASE_RULES,
    gap: "number",
    alignItems: "string",
    justifyContent: "string",
    flexWrap: "string",
  },
  hstack: {
    ...BASE_RULES,
    gap: "number",
    alignItems: "string",
    justifyContent: "string",
    flexWrap: "string",
  },
  layer: {
    ...BASE_RULES,
  },
};

// ===== 子要素の変換ルールマップ =====
export const CHILD_ELEMENT_COERCION_MAP: Record<
  string,
  Record<string, CoercionRule>
> = {
  ProcessArrowStep: {
    label: "string",
    color: "string",
    textColor: "string",
  },
  PyramidLevel: {
    label: "string",
    color: "string",
    textColor: "string",
  },
  TimelineItem: {
    date: "string",
    title: "string",
    description: "string",
    color: "string",
  },
  MatrixAxes: {
    x: "string",
    y: "string",
  },
  MatrixQuadrants: {
    topLeft: "string",
    topRight: "string",
    bottomLeft: "string",
    bottomRight: "string",
  },
  MatrixItem: {
    label: "string",
    x: "number",
    y: "number",
    color: "string",
  },
  FlowNode: {
    id: "string",
    shape: "string",
    text: "string",
    color: "string",
    textColor: "string",
    width: "number",
    height: "number",
  },
  FlowConnection: {
    from: "string",
    to: "string",
    label: "string",
    color: "string",
  },
  Col: {
    width: "number",
  },
  Td: {
    text: "string",
    fontSize: "number",
    color: "string",
    bold: "boolean",
    italic: "boolean",
    underline: UNDERLINE_RULE,
    strike: "boolean",
    highlight: "string",
    fontFamily: "string",
    textAlign: "string",
    backgroundColor: "string",
    colspan: "number",
    rowspan: "number",
  },
  Li: {
    text: "string",
    bold: "boolean",
    italic: "boolean",
    underline: UNDERLINE_RULE,
    strike: "boolean",
    highlight: "string",
    color: "string",
    fontSize: "number",
    fontFamily: "string",
  },
  B: {},
  I: {},
  Span: { color: "string", fontFamily: "string" },
};
