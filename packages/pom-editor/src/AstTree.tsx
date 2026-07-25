import React, { createContext, useContext, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
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
  if (node.type === "text" && typeof record.text === "string")
    return record.text || "Empty text";
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
}

function GapStrip({ parentId, index }: GapStripProps) {
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
      data-drop-placement="between"
      style={{
        height: "16px",
        marginTop: "-7px",
        marginBottom: "-7px",
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        pointerEvents: isDragging ? "auto" : "none",
      }}
    >
      <div
        data-testid={`${id}:indicator`}
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          left: 0,
          height: isOver ? "3px" : "1px",
          transform: "translateY(-50%)",
          backgroundColor: isOver ? "#2563eb" : "transparent",
          borderRadius: "2px",
          boxShadow: isOver ? "0 0 0 1px #ffffff" : undefined,
          transition: "height 50ms, background-color 50ms",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

interface RowProps {
  astNode: AstNode;
  onTextChange: (id: string, text: string) => void;
}

const LAYOUT_PRESENTATION = {
  vstack: { icon: "↓", label: "VStack", description: "Vertical layout" },
  hstack: { icon: "→", label: "HStack", description: "Horizontal layout" },
  layer: { icon: "▱", label: "Layer", description: "Overlapping layout" },
} as const;

function DragHandle({
  drag,
  id,
  label,
  isDragging,
}: {
  drag: ReturnType<typeof useDraggable>;
  id: string;
  label: string;
  isDragging: boolean;
}) {
  return (
    <span
      {...drag.listeners}
      {...drag.attributes}
      data-testid={`drag-handle:${id}`}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        color: "#9ca3af",
        fontSize: "12px",
        lineHeight: 1,
        flexShrink: 0,
        touchAction: "none",
        userSelect: "none",
      }}
      title="ドラッグして並び替え"
      aria-label={`${label} をドラッグ`}
    >
      ⠿
    </span>
  );
}

function TextContent({
  astNode,
  onTextChange,
}: {
  astNode: AstNode;
  onTextChange: (id: string, text: string) => void;
}) {
  const record = astNode.node as Record<string, unknown>;
  const text = typeof record.text === "string" ? record.text : "";
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const cancelBlurRef = useRef(false);

  function startEditing() {
    setDraft(text);
    cancelBlurRef.current = false;
    setIsEditing(true);
  }

  function commit() {
    if (cancelBlurRef.current) {
      cancelBlurRef.current = false;
      return;
    }
    setIsEditing(false);
    if (draft !== text) onTextChange(astNode.id, draft);
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        aria-label="Text を編集"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancelBlurRef.current = true;
            setDraft(text);
            setIsEditing(false);
          }
        }}
        style={{
          minWidth: 0,
          width: "100%",
          border: "1px solid #60a5fa",
          borderRadius: "4px",
          padding: "3px 6px",
          background: "#ffffff",
          color: "#111827",
          font: "inherit",
          outline: "2px solid #dbeafe",
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      aria-label={text ? `Text: ${text}` : "Empty Text"}
      title="Text — クリックして編集"
      style={{
        minWidth: 0,
        flex: 1,
        border: 0,
        padding: "3px 0",
        background: "transparent",
        color: text ? "#1f2937" : "#9ca3af",
        cursor: "text",
        font: "inherit",
        fontStyle: text ? "normal" : "italic",
        textAlign: "left",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        userSelect: "text",
      }}
    >
      {text || "クリックしてテキストを入力"}
    </button>
  );
}

function secondaryInformation(node: POMNode): string[] {
  const record = node as Record<string, unknown>;
  const information: string[] = [];
  if (typeof record.gap === "number")
    information.push(`gap ${record.gap.toString()}`);
  if (record.padding !== undefined) {
    const padding =
      record.padding !== null && typeof record.padding === "object"
        ? JSON.stringify(record.padding)
        : typeof record.padding === "number"
          ? record.padding.toString()
          : "";
    information.push(`padding ${padding}`);
  }
  return information;
}

function Row({ astNode, onTextChange }: RowProps) {
  const isContainer = isContainerType(astNode.node.type);
  const overId = useContext(OverIdContext);
  const activeId = useContext(ActiveIdContext);

  const drag = useDraggable({ id: astNode.id });
  const isDragging = activeId === astNode.id;

  const inside = useDroppable({
    id: insideId(astNode.id),
    disabled: !isContainer || isDragging,
  });

  const setBodyRef = (el: HTMLDivElement | null) => {
    inside.setNodeRef(el);
    drag.setNodeRef(el);
  };

  const isInsideOver = isContainer && overId === insideId(astNode.id);
  const presentation = isContainer
    ? LAYOUT_PRESENTATION[astNode.node.type as keyof typeof LAYOUT_PRESENTATION]
    : null;

  if (presentation) {
    const information = secondaryInformation(astNode.node);
    return (
      <div
        ref={setBodyRef}
        data-testid={`layout-container:${astNode.id}`}
        data-layout-type={astNode.node.type}
        data-drop-placement="inside"
        style={{
          margin: "2px 0",
          padding: "6px",
          border: `1px solid ${isInsideOver ? "#2563eb" : "#cbd5e1"}`,
          borderRadius: "7px",
          opacity: isDragging ? 0.4 : 1,
          backgroundColor: isInsideOver ? "#dbeafe" : "#f8fafc",
          transition: "background-color 50ms, border-color 50ms",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            minWidth: 0,
            color: "#475569",
            fontSize: "12px",
            fontFamily: "sans-serif",
          }}
        >
          <DragHandle
            drag={drag}
            id={astNode.id}
            label={presentation.label}
            isDragging={isDragging}
          />
          <span
            aria-label={presentation.description}
            title={presentation.description}
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "18px",
              height: "18px",
              borderRadius: "4px",
              background: "#e2e8f0",
              color: "#334155",
              fontWeight: 700,
            }}
          >
            {presentation.icon}
          </span>
          <span style={{ fontWeight: 600 }}>{presentation.label}</span>
          {information.map((item) => (
            <span
              key={item}
              style={{
                borderRadius: "999px",
                padding: "1px 5px",
                background: "#e2e8f0",
                color: "#64748b",
                fontSize: "10px",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </span>
          ))}
        </div>
        <div
          data-testid={`layout-children:${astNode.id}`}
          style={{
            minWidth: 0,
            marginTop: "5px",
            paddingLeft: "14px",
            borderLeft: "2px solid #e2e8f0",
          }}
        >
          <ChildList
            parentId={astNode.id}
            nodes={astNode.children ?? []}
            onTextChange={onTextChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setBodyRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        minWidth: 0,
        padding: "3px 4px",
        borderRadius: "4px",
        opacity: isDragging ? 0.4 : 1,
        fontSize: "13px",
        fontFamily: "sans-serif",
      }}
    >
      <DragHandle
        drag={drag}
        id={astNode.id}
        label={nodeLabel(astNode.node)}
        isDragging={isDragging}
      />
      {astNode.node.type === "text" ? (
        <TextContent astNode={astNode} onTextChange={onTextChange} />
      ) : (
        <span
          style={{
            minWidth: 0,
            color: "#374151",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {nodeLabel(astNode.node)}
        </span>
      )}
    </div>
  );
}

interface ChildListProps {
  parentId: string;
  nodes: AstNode[];
  onTextChange: (id: string, text: string) => void;
}

function ChildList({ parentId, nodes, onTextChange }: ChildListProps) {
  return (
    <>
      <GapStrip parentId={parentId} index={0} />
      {nodes.map((child, i) => (
        <React.Fragment key={child.id}>
          <Row astNode={child} onTextChange={onTextChange} />
          <GapStrip parentId={parentId} index={i + 1} />
        </React.Fragment>
      ))}
    </>
  );
}

export interface AstTreeProps {
  ast: AstNode[];
  onChange: (nodes: POMNode[]) => void;
}

function findAstNode(nodes: AstNode[], id: string): AstNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const child = findAstNode(node.children, id);
      if (child) return child;
    }
  }
  return null;
}

function replaceText(nodes: AstNode[], id: string, text: string): AstNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return {
        ...node,
        node: { ...node.node, text } as POMNode,
      };
    }
    if (node.children) {
      return { ...node, children: replaceText(node.children, id, text) };
    }
    return node;
  });
}

export function AstTree({ ast, onChange }: AstTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );
  const [overId, setOverId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeNode = activeId ? findAstNode(ast, activeId) : null;

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

  function onTextChange(id: string, text: string) {
    onChange(rebuildNodes(replaceText(ast, id, text)));
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        autoScroll
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <ActiveIdContext.Provider value={activeId}>
          <OverIdContext.Provider value={overId}>
            <GapStrip parentId="root" index={0} />
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
                <Row astNode={astNode} onTextChange={onTextChange} />
                <GapStrip parentId="root" index={i + 1} />
              </React.Fragment>
            ))}
            <DragOverlay>
              {activeNode ? (
                <div
                  data-testid="ast-drag-overlay"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    maxWidth: "320px",
                    padding: "7px 10px",
                    border: "1px solid #93c5fd",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.96)",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
                    color: "#1e3a8a",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span aria-hidden="true" style={{ color: "#60a5fa" }}>
                    ⠿
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {nodeLabel(activeNode.node)}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </OverIdContext.Provider>
        </ActiveIdContext.Provider>
      </DndContext>
    </div>
  );
}
