import React, { createContext, useContext, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AstNode } from "./ast.ts";
import type { POMNode } from "@hirokisakabe/pom/clientApi";
import { applyReorder, rebuildNodes } from "./ast.ts";

const NODE_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  table: "Table",
  shape: "Shape",
  chart: "Chart",
  timeline: "Timeline",
  matrix: "Matrix",
  tree: "Tree",
  flow: "Flow",
  processArrow: "ProcessArrow",
  pyramid: "Pyramid",
  ul: "Ul",
  ol: "Ol",
  line: "Line",
  arrow: "Arrow",
  vstack: "VStack",
  hstack: "HStack",
  layer: "Layer",
  icon: "Icon",
  svg: "Svg",
};

function nodeLabel(node: POMNode): string {
  const base = NODE_LABELS[node.type] ?? node.type;
  const record = node as Record<string, unknown>;
  if (node.type === "text" && typeof record.text === "string") {
    const preview = record.text.slice(0, 20);
    return `${base}: "${preview}${record.text.length > 20 ? "…" : ""}"`;
  }
  if (node.type === "image" && typeof record.src === "string") {
    return `${base}: ${record.src.split("/").pop() ?? record.src}`;
  }
  if (node.type === "icon" && typeof record.name === "string") {
    return `${base}: ${record.name}`;
  }
  if (node.type === "shape" && typeof record.text === "string") {
    const preview = record.text.slice(0, 20);
    return `${base}: "${preview}${record.text.length > 20 ? "…" : ""}"`;
  }
  return base;
}

const InvalidOverContext = createContext<string | null>(null);

interface SortableItemProps {
  astNode: AstNode;
  depth: number;
  onChange: (nodes: POMNode[]) => void;
  ast: AstNode[];
}

function SortableItem({ astNode, depth, onChange, ast }: SortableItemProps) {
  const invalidOverId = useContext(InvalidOverContext);
  const isInvalidOver = invalidOverId === astNode.id;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: astNode.id,
    data: { parentId: astNode.parentId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleCursor = isInvalidOver
    ? "not-allowed"
    : isDragging
      ? "grabbing"
      : "grab";

  return (
    <div ref={setNodeRef} style={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingLeft: `${depth * 16}px`,
          paddingTop: "3px",
          paddingBottom: "3px",
          borderRadius: "4px",
          userSelect: "none",
          backgroundColor: isInvalidOver ? "#fee2e2" : undefined,
          outline: isInvalidOver ? "1px solid #dc2626" : undefined,
          cursor: isInvalidOver ? "not-allowed" : undefined,
        }}
      >
        <span
          {...listeners}
          {...attributes}
          style={{
            cursor: handleCursor,
            color: isInvalidOver ? "#dc2626" : "#9ca3af",
            fontSize: "12px",
            lineHeight: 1,
            flexShrink: 0,
          }}
          title="ドラッグして並び替え"
        >
          ⠿
        </span>
        <span
          style={{
            fontSize: "13px",
            fontFamily: "monospace",
            color: astNode.children ? "#1d4ed8" : "#374151",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {nodeLabel(astNode.node)}
        </span>
      </div>
      {astNode.children && astNode.children.length > 0 && (
        <SortableChildrenList
          children={astNode.children}
          depth={depth + 1}
          onChange={onChange}
          ast={ast}
        />
      )}
    </div>
  );
}

interface SortableChildrenListProps {
  children: AstNode[];
  depth: number;
  onChange: (nodes: POMNode[]) => void;
  ast: AstNode[];
}

function SortableChildrenList({
  children,
  depth,
  onChange,
  ast,
}: SortableChildrenListProps) {
  const ids = children.map((c) => c.id);
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      {children.map((child) => (
        <SortableItem
          key={child.id}
          astNode={child}
          depth={depth}
          onChange={onChange}
          ast={ast}
        />
      ))}
    </SortableContext>
  );
}

export interface AstTreeProps {
  ast: AstNode[];
  onChange: (nodes: POMNode[]) => void;
}

function getParentId(data: unknown): string | null {
  if (typeof data === "object" && data !== null && "parentId" in data) {
    const value = data.parentId;
    return typeof value === "string" ? value : null;
  }
  return null;
}

export function AstTree({ ast, onChange }: AstTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );
  const [invalidOverId, setInvalidOverId] = useState<string | null>(null);

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) {
      setInvalidOverId(null);
      return;
    }
    const activeParentId = getParentId(active.data.current);
    const overParentId = getParentId(over.data.current);
    if (activeParentId !== overParentId) {
      setInvalidOverId(over.id as string);
    } else {
      setInvalidOverId(null);
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setInvalidOverId(null);
    if (!over || active.id === over.id) return;

    const activeParentId = getParentId(active.data.current);
    const overParentId = getParentId(over.data.current);
    if (activeParentId === null || activeParentId !== overParentId) return;

    const newAst = applyReorder(
      ast,
      active.id as string,
      over.id as string,
      activeParentId,
    );
    onChange(rebuildNodes(newAst));
  }

  function onDragCancel() {
    setInvalidOverId(null);
  }

  const rootIds = ast.map((n) => n.id);

  return (
    <div style={{ cursor: invalidOverId !== null ? "not-allowed" : undefined }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <InvalidOverContext.Provider value={invalidOverId}>
          <SortableContext
            items={rootIds}
            strategy={verticalListSortingStrategy}
          >
            {ast.map((astNode, i) => (
              <div key={astNode.id}>
                {i > 0 && (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#e5e7eb",
                      margin: "8px 0",
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    padding: "2px 0 4px 0",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Slide {i + 1}
                </div>
                <SortableItem
                  astNode={astNode}
                  depth={0}
                  onChange={onChange}
                  ast={ast}
                />
              </div>
            ))}
          </SortableContext>
        </InvalidOverContext.Provider>
      </DndContext>
    </div>
  );
}
