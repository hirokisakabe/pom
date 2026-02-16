import type { POMNode } from "./types.ts";

/**
 * 再利用可能なコンポーネントを定義する。
 * Props を受け取り POMNode を返す関数を作成する。
 *
 * @example
 * ```typescript
 * const SectionCard = defineComponent<{
 *   title: string;
 *   content: POMNode;
 *   color?: string;
 * }>((props) => ({
 *   type: "box",
 *   padding: 20,
 *   backgroundColor: "FFFFFF",
 *   border: { color: "E2E8F0", width: 1 },
 *   borderRadius: 8,
 *   children: {
 *     type: "vstack",
 *     gap: 12,
 *     children: [
 *       {
 *         type: "text",
 *         text: props.title,
 *         fontPx: 18,
 *         bold: true,
 *         color: props.color ?? "334155",
 *       },
 *       props.content,
 *     ],
 *   },
 * }));
 *
 * // Usage:
 * const node = SectionCard({
 *   title: "KPI Summary",
 *   content: { type: "text", text: "Revenue: $1M" },
 * });
 * ```
 */
export function defineComponent<Props>(
  render: (props: Props) => POMNode,
): (props: Props) => POMNode {
  return render;
}

/**
 * テーマ設定の型。コンポーネントにスタイルの一括オーバーライドを提供する。
 */
export type Theme = {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    border?: string;
    accent?: string;
  };
  spacing?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  fontPx?: {
    title?: number;
    heading?: number;
    body?: number;
    caption?: number;
  };
};

type RequiredTheme = {
  colors: Required<NonNullable<Theme["colors"]>>;
  spacing: Required<NonNullable<Theme["spacing"]>>;
  fontPx: Required<NonNullable<Theme["fontPx"]>>;
};

export const defaultTheme: RequiredTheme = {
  colors: {
    primary: "1D4ED8",
    secondary: "64748B",
    background: "F8FAFC",
    text: "1E293B",
    border: "E2E8F0",
    accent: "0EA5E9",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,
  },
  fontPx: {
    title: 32,
    heading: 20,
    body: 14,
    caption: 11,
  },
};

/**
 * デフォルトテーマとユーザー指定テーマをマージする。
 */
export function mergeTheme(theme?: Partial<Theme>): RequiredTheme {
  return {
    colors: { ...defaultTheme.colors, ...theme?.colors },
    spacing: { ...defaultTheme.spacing, ...theme?.spacing },
    fontPx: { ...defaultTheme.fontPx, ...theme?.fontPx },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentRegistry = Record<string, (props: any) => POMNode>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expandNode(input: unknown, registry: ComponentRegistry): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => expandNode(item, registry));
  }

  if (!isRecord(input)) {
    return input;
  }

  if (input.type === "component") {
    const name = input.name as string;
    const fn = registry[name];
    if (!fn) {
      throw new Error(`Unknown component: "${name}"`);
    }
    const rawProps = isRecord(input.props) ? input.props : {};
    const expandedProps = Object.fromEntries(
      Object.entries(rawProps).map(([key, value]) => [
        key,
        expandNode(value, registry),
      ]),
    );
    return expandNode(fn(expandedProps), registry);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "children") {
      result[key] = expandNode(value, registry);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * JSON 入力内のコンポーネントノードを展開して POMNode を返す。
 * LLM が出力した JSON に `{ type: "component", name: "...", props: {...} }` が
 * 含まれている場合、レジストリからコンポーネント関数を取得して展開する。
 */
export function expandComponents(
  input: unknown,
  registry: ComponentRegistry,
): POMNode {
  return expandNode(input, registry) as POMNode;
}

/**
 * 複数スライドの JSON 入力内のコンポーネントノードを展開する。
 */
export function expandComponentSlides(
  inputs: unknown[],
  registry: ComponentRegistry,
): POMNode[] {
  return inputs.map((input) => expandComponents(input, registry));
}
