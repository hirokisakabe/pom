import type { POMNode } from "@hirokisakabe/pom/clientApi";

export interface AstNode {
  id: string;
  node: POMNode;
  parentId: string;
  children?: AstNode[];
}

const CONTAINER_TYPES = new Set(["vstack", "hstack", "layer"]);

export function isContainerType(type: string): boolean {
  return CONTAINER_TYPES.has(type);
}

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

function isDescendantOrSelf(node: AstNode, id: string): boolean {
  if (node.id === id) return true;
  if (!node.children) return false;
  return node.children.some((c) => isDescendantOrSelf(c, id));
}

function removeById(
  astNodes: AstNode[],
  id: string,
): { newAst: AstNode[]; removed: AstNode } | null {
  for (let i = 0; i < astNodes.length; i++) {
    const current = astNodes[i];
    if (current.id === id) {
      return {
        newAst: [...astNodes.slice(0, i), ...astNodes.slice(i + 1)],
        removed: current,
      };
    }
    if (current.children) {
      const result = removeById(current.children, id);
      if (result) {
        return {
          newAst: [
            ...astNodes.slice(0, i),
            { ...current, children: result.newAst },
            ...astNodes.slice(i + 1),
          ],
          removed: result.removed,
        };
      }
    }
  }
  return null;
}

function insertAt(
  astNodes: AstNode[],
  parentId: string,
  index: number,
  insertion: AstNode,
): AstNode[] {
  if (parentId === "root") {
    const node = { ...insertion, parentId: "root" };
    return [...astNodes.slice(0, index), node, ...astNodes.slice(index)];
  }
  return astNodes.map((n) => {
    if (n.id === parentId) {
      const children = n.children ?? [];
      const node = { ...insertion, parentId };
      return {
        ...n,
        children: [...children.slice(0, index), node, ...children.slice(index)],
      };
    }
    if (n.children) {
      return {
        ...n,
        children: insertAt(n.children, parentId, index, insertion),
      };
    }
    return n;
  });
}

function siblingsOf(ast: AstNode[], parentId: string): AstNode[] | null {
  if (parentId === "root") return ast;
  const parent = findNode(ast, parentId);
  return parent?.children ?? null;
}

export function applyMoveToGap(
  ast: AstNode[],
  activeId: string,
  newParentId: string,
  newIndex: number,
): AstNode[] {
  const active = findNode(ast, activeId);
  if (!active) return ast;
  if (newParentId !== "root" && isDescendantOrSelf(active, newParentId))
    return ast;

  let adjustedIndex = newIndex;
  if (active.parentId === newParentId) {
    const siblings = siblingsOf(ast, newParentId);
    if (siblings) {
      const activeIndex = siblings.findIndex((c) => c.id === activeId);
      if (activeIndex !== -1 && activeIndex < newIndex) {
        adjustedIndex = newIndex - 1;
      }
    }
  }

  const removeResult = removeById(ast, activeId);
  if (!removeResult) return ast;

  return insertAt(
    removeResult.newAst,
    newParentId,
    adjustedIndex,
    removeResult.removed,
  );
}

export function applyMoveInside(
  ast: AstNode[],
  activeId: string,
  containerId: string,
): AstNode[] {
  const active = findNode(ast, activeId);
  if (!active) return ast;
  if (isDescendantOrSelf(active, containerId)) return ast;

  const container = findNode(ast, containerId);
  if (!container) return ast;
  if (!isContainerType(container.node.type)) return ast;

  const removeResult = removeById(ast, activeId);
  if (!removeResult) return ast;

  const containerAfterRemove = findNode(removeResult.newAst, containerId);
  const insertIndex = containerAfterRemove?.children?.length ?? 0;

  return insertAt(
    removeResult.newAst,
    containerId,
    insertIndex,
    removeResult.removed,
  );
}
