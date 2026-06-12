import type { POMNode, PositionedNode } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import type { RenderContext } from "../renderPptx/types.ts";
import type { loadYoga } from "yoga-layout/load";
import type { BuildContext } from "../buildContext.ts";
import type { LayoutResultMap } from "../calcYogaLayout/types.ts";
import type { z } from "zod";

export type Yoga = Awaited<ReturnType<typeof loadYoga>>;

/**
 * toPositioned ステージ入口関数の再帰呼び出し用コールバック。
 * 定義側がステージ入口を直接 import すると registry ↔ toPositioned の
 * 循環依存になるため、hook 引数として注入する
 */
export type ToPositionedRecurse = (
  pom: POMNode,
  ctx: BuildContext,
  map: LayoutResultMap,
  parentX?: number,
  parentY?: number,
) => Promise<PositionedNode>;

/** ノードのカテゴリ。子要素の扱い方を決定する */
export type NodeCategory =
  | "leaf" // 子要素なし
  | "multi-child" // 子要素複数（vstack, hstack）
  | "absolute-child"; // 子要素複数・絶対配置（layer）

export type ChildPolicy =
  | { kind: "none" }
  | { kind: "pom-children" }
  | { kind: "custom"; optionalProperties?: readonly string[] };

export interface NodeDefinition {
  /** ノードタイプ名 */
  type: POMNode["type"];

  /** XML タグ名 */
  tagName: string;

  /** ノードカテゴリ */
  category: NodeCategory;

  /** 属性/構造の検証 schema */
  schema: z.ZodTypeAny;

  /** 実行時に補完される既定値のメモ。schema の optional とは別に参照用 metadata として保持する */
  defaults?: Readonly<Record<string, unknown>>;

  /** XML child element の受け入れルール */
  childPolicy: ChildPolicy;

  /** テキスト content を流し込む属性名 */
  textContentProperty?: string;

  /** runs をインライン child element として直列化できる */
  supportsInlineRuns?: boolean;

  /** YogaNode にノード固有のスタイル/measureFunc を適用する */
  applyYogaStyle?: (
    node: POMNode,
    yn: YogaNode,
    yoga: Yoga,
    ctx: BuildContext,
  ) => void | Promise<void>;

  /** POMNode → PositionedNode へのカスタム変換（未定義なら category ベースのデフォルト） */
  toPositioned?: (
    pom: POMNode,
    absoluteX: number,
    absoluteY: number,
    layout: { width: number; height: number },
    ctx: BuildContext,
    map: LayoutResultMap,
    recurse: ToPositionedRecurse,
  ) => PositionedNode | Promise<PositionedNode>;

  /** PositionedNode をスライドにレンダリングする（リーフノード用） */
  render?: (node: PositionedNode, ctx: RenderContext) => void;

  /** 画像ソース収集（prefetch 用） */
  collectImageSources?: (node: POMNode) => string[];
}
