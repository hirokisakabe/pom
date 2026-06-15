import React, { createContext, useContext, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import type { AstNode } from "./ast.ts";
import type { POMNode } from "@hirokisakabe/pom/clientApi";
import {
  applyMoveInside,
  applyMoveToGap,
  isContainerType,
  rebuildNodes,
} from "./ast.ts";

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

const OverIdContext = createContext<string | null>(null);
const ActiveIdContext = createContext<string | null>(null);

const GAP_PREFIX = "gap:";
const INSIDE_PREFIX = "inside:";

function gapId(parentId: string, index: number): string {
  return `${GAP_PREFIX}${parentId}:${index}`;
}

function insideId(nodeId: string): string {
  return `${INSIDE_PREFIX}${nodeId}`;
}

function parseGapId(id: string): { parentId: string; index: number } | null {
  if (!id.startsWith(GAP_PREFIX)) return null;
  const rest = id.slice(GAP_PREFIX.length);
  const sep = rest.lastIndexOf(":");
  if (sep === -1) return null;
  const parentId = rest.slice(0, sep);
  const index = Number.parseInt(rest.slice(sep + 1), 10);
  if (Number.isNaN(index)) return null;
  return { parentId, index };
}

function parseInsideId(id: string): string | null {
  if (!id.startsWith(INSIDE_PREFIX)) return null;
  return id.slice(INSIDE_PREFIX.length);
}

interface GapStripProps {
  parentId: string;
  index: number;
  depth: number;
}

function GapStrip({ parentId, index, depth }: GapStripProps) {
  const id = gapId(parentId, index);
  const { setNodeRef } = useDroppable({ id });
  const overId = useContext(OverIdContext);
  const activeId = useContext(ActiveIdContext);
  const isOver = overId === id;
  const isDragging = activeId !== null;

  return (
    <div
      ref={setNodeRef}
      data-testid={id}
      style={{
        height: isOver ? "10px" : isDragging ? "8px" : "2px",
        marginLeft: `${depth * 16}px`,
        backgroundColor: isOver ? "#3b82f6" : "transparent",
        borderRadius: "2px",
      }}
    />
  );
}

interface RowProps {
  astNode: AstNode;
  depth: number;
}

function Row({ astNode, depth }: RowProps) {
  const isContainer = isContainerType(astNode.node.type);
  const overId = useContext(OverIdContext);
  const activeId = useContext(ActiveIdContext);

  const drag = useDraggable({ id: astNode.id });
  const isDragging = activeId === astNode.id;

  const inside = useDroppable({
    id: insideId(astNode.id),
    disabled: !isContainer || isDragging,
  });

  const setBodyRef = (el: HTMLElement | null) => {
    inside.setNodeRef(el);
    drag.setNodeRef(el);
  };

  const isInsideOver = isContainer && overId === insideId(astNode.id);

  return (
    <div>
      <div
        ref={setBodyRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingLeft: `${depth * 16}px`,
          paddingTop: "3px",
          paddingBottom: "3px",
          borderRadius: "4px",
          userSelect: "none",
          opacity: isDragging ? 0.4 : 1,
          backgroundColor: isInsideOver ? "#dbeafe" : undefined,
          outline: isInsideOver ? "1px solid #2563eb" : undefined,
          transition: "background-color 50ms",
        }}
      >
        <span
          {...drag.listeners}
          {...drag.attributes}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            color: "#9ca3af",
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
      {astNode.children && (
        <ChildList
          parentId={astNode.id}
          nodes={astNode.children}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

interface ChildListProps {
  parentId: string;
  nodes: AstNode[];
  depth: number;
}

function ChildList({ parentId, nodes, depth }: ChildListProps) {
  return (
    <>
      <GapStrip parentId={parentId} index={0} depth={depth} />
      {nodes.map((child, i) => (
        <React.Fragment key={child.id}>
          <Row astNode={child} depth={depth} />
          <GapStrip parentId={parentId} index={i + 1} depth={depth} />
        </React.Fragment>
      ))}
    </>
  );
}

export interface AstTreeProps {
  ast: AstNode[];
  onChange: (nodes: POMNode[]) => void;
}

export function AstTree({ ast, onChange }: AstTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );
  const [overId, setOverId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  function onDragStart(event: { active: { id: string | number } }) {
    setActiveId(String(event.active.id));
  }

  function onDragOver({ over }: DragOverEvent) {
    setOverId(over ? String(over.id) : null);
  }

  function applyDrop(activeId: string, overId: string): void {
    const gap = parseGapId(overId);
    if (gap) {
      const newAst = applyMoveToGap(ast, activeId, gap.parentId, gap.index);
      if (newAst !== ast) onChange(rebuildNodes(newAst));
      return;
    }
    const insideTarget = parseInsideId(overId);
    if (insideTarget !== null) {
      const newAst = applyMoveInside(ast, activeId, insideTarget);
      if (newAst !== ast) onChange(rebuildNodes(newAst));
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setOverId(null);
    setActiveId(null);
    if (!over) return;
    applyDrop(String(active.id), String(over.id));
  }

  function onDragCancel() {
    setOverId(null);
    setActiveId(null);
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <ActiveIdContext.Provider value={activeId}>
          <OverIdContext.Provider value={overId}>
            <GapStrip parentId="root" index={0} depth={0} />
            {ast.map((astNode, i) => (
              <React.Fragment key={astNode.id}>
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
                <Row astNode={astNode} depth={0} />
                <GapStrip parentId="root" index={i + 1} depth={0} />
              </React.Fragment>
            ))}
          </OverIdContext.Provider>
        </ActiveIdContext.Provider>
      </DndContext>
    </div>
  );
}
