import type { POMNode } from "../types.ts";

/**
 * POMNode ツリーを再帰的に走査し、各ノードに visitor を適用する
 */
export function walkPOMTree(
  node: POMNode,
  visitor: (node: POMNode) => void,
): void {
  visitor(node);

  if (
    node.type === "vstack" ||
    node.type === "hstack" ||
    node.type === "layer"
  ) {
    for (const child of node.children) {
      walkPOMTree(child, visitor);
    }
  }
}
