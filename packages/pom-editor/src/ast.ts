import type { POMNode } from "@hirokisakabe/pom";
import { arrayMove } from "@dnd-kit/sortable";

export interface AstNode {
  id: string;
  node: POMNode;
  parentId: string;
  children?: AstNode[];
}

const CONTAINER_TYPES = new Set(["vstack", "hstack", "layer"]);

export function buildAst(
  nodes: POMNode[],
  parentId: string,
  counter: { value: number },
): AstNode[] {
  return nodes.map((node) => {
    const id = String(counter.value++);
    if (CONTAINER_TYPES.has(node.type)) {
      const children =
        (node as POMNode & { children?: POMNode[] }).children ?? [];
      return {
        id,
        node,
        parentId,
        children: buildAst(children, id, counter),
      };
    }
    return { id, node, parentId };
  });
}

export function rebuildNodes(astNodes: AstNode[]): POMNode[] {
  return astNodes.map(({ node, children }) => {
    if (children) {
      return { ...node, children: rebuildNodes(children) } as POMNode;
    }
    return node;
  });
}

function findNode(astNodes: AstNode[], id: string): AstNode | null {
  for (const n of astNodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function reorderInParent(
  astNodes: AstNode[],
  parentId: string,
  oldIndex: number,
  newIndex: number,
): AstNode[] {
  return astNodes.map((astNode) => {
    if (astNode.id === parentId && astNode.children) {
      return {
        ...astNode,
        children: arrayMove(astNode.children, oldIndex, newIndex),
      };
    }
    if (astNode.children) {
      return {
        ...astNode,
        children: reorderInParent(
          astNode.children,
          parentId,
          oldIndex,
          newIndex,
        ),
      };
    }
    return astNode;
  });
}

export function applyReorder(
  ast: AstNode[],
  activeId: string,
  overId: string,
  activeParentId: string,
): AstNode[] {
  if (activeParentId === "root") {
    const oldIndex = ast.findIndex((c) => c.id === activeId);
    const newIndex = ast.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return ast;
    return arrayMove(ast, oldIndex, newIndex);
  }

  const parent = findNode(ast, activeParentId);
  if (!parent?.children) return ast;

  const oldIndex = parent.children.findIndex((c) => c.id === activeId);
  const newIndex = parent.children.findIndex((c) => c.id === overId);
  if (oldIndex === -1 || newIndex === -1) return ast;

  return reorderInParent(ast, activeParentId, oldIndex, newIndex);
}
