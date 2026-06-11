import type { POMNode } from "../types.ts";

/**
 * POMNode ツリーを再帰的に走査し、各ノードに visitor を適用する
 */
export function walkPOMTree(
  node: POMNode,
  visitor: (node: POMNode) => void,
): void {
  visitor(node);

  switch (node.type) {
    case "vstack":
    case "hstack":
    case "layer":
      for (const child of node.children) {
        walkPOMTree(child, visitor);
      }
      break;
    default:
      break;
  }
}
