import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let capturedHandlers: {
  onDragOver?: (event: {
    active: { id: string; data: { current: { parentId: string } } };
    over: { id: string; data: { current: { parentId: string } } } | null;
  }) => void;
  onDragEnd?: (event: {
    active: { id: string; data: { current: { parentId: string } } };
    over: { id: string; data: { current: { parentId: string } } } | null;
  }) => void;
  onDragCancel?: () => void;
} = {};

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragOver,
    onDragEnd,
    onDragCancel,
  }: {
    children: React.ReactNode;
    onDragOver?: typeof capturedHandlers.onDragOver;
    onDragEnd?: typeof capturedHandlers.onDragEnd;
    onDragCancel?: typeof capturedHandlers.onDragCancel;
  }) => {
    capturedHandlers = { onDragOver, onDragEnd, onDragCancel };
    return <>{children}</>;
  },
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => null,
}));

vi.mock("@dnd-kit/sortable", async () => {
  const actual =
    await vi.importActual<typeof import("@dnd-kit/sortable")>(
      "@dnd-kit/sortable",
    );
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      transition: null,
      isDragging: false,
    }),
    verticalListSortingStrategy: undefined,
  };
});

import type { POMNode } from "@hirokisakabe/pom/clientApi";
import { AstTree } from "./AstTree.tsx";
import type { AstNode } from "./ast.ts";

afterEach(() => {
  cleanup();
  capturedHandlers = {};
});

// Two slides, each is a VStack with text children.
// AST ids:
//   0: VStack (slide 1, parent root)
//     1: Text "A" (parent 0)
//     2: Text "B" (parent 0)
//   3: VStack (slide 2, parent root)
//     4: Text "C" (parent 3)
function makeAst(): AstNode[] {
  const text = (t: string): POMNode =>
    ({ type: "text", text: t }) as unknown as POMNode;
  const vstack = (children: POMNode[]): POMNode =>
    ({ type: "vstack", children }) as unknown as POMNode;

  return [
    {
      id: "0",
      node: vstack([text("A"), text("B")]),
      parentId: "root",
      children: [
        { id: "1", node: text("A"), parentId: "0" },
        { id: "2", node: text("B"), parentId: "0" },
      ],
    },
    {
      id: "3",
      node: vstack([text("C")]),
      parentId: "root",
      children: [{ id: "4", node: text("C"), parentId: "3" }],
    },
  ];
}

function event(
  activeId: string,
  activeParent: string,
  overId: string | null,
  overParent: string | null,
) {
  return {
    active: { id: activeId, data: { current: { parentId: activeParent } } },
    over:
      overId === null || overParent === null
        ? null
        : { id: overId, data: { current: { parentId: overParent } } },
  };
}

function labelWrapper(text: string): HTMLElement {
  // SortableItem renders: <div><div style={...highlight}><span handle/><span>{label}</span></div>{children}</div>
  // We match by visible label text, and the parent <div> carries the highlight style.
  const labelSpan = screen.getByText(text);
  const wrapper = labelSpan.parentElement;
  if (!wrapper) throw new Error(`No wrapper for "${text}"`);
  return wrapper;
}

describe("AstTree DnD state transitions", () => {
  it("同一親内での reorder が onChange 経由で反映される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag "A" (id 1, parent 0) over "B" (id 2, parent 0) — same parent.
    capturedHandlers.onDragEnd?.(event("1", "0", "2", "0"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    // VStack children should be reordered: B then A.
    const slide1 = newNodes[0] as POMNode & { children: POMNode[] };
    expect(slide1.children).toHaveLength(2);
    const t0 = slide1.children[0] as POMNode & { text: string };
    const t1 = slide1.children[1] as POMNode & { text: string };
    expect(t0.text).toBe("B");
    expect(t1.text).toBe("A");
  });

  it("トップレベル slide の reorder (parentId === 'root') が onChange に反映される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag slide 1 (id 0, parent root) over slide 2 (id 3, parent root).
    // applyReorder() has a dedicated `activeParentId === "root"` branch — cover it.
    capturedHandlers.onDragEnd?.(event("0", "root", "3", "root"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    expect(newNodes).toHaveLength(2);
    // After swap, the (previously second) VStack with a single "C" child comes first.
    const first = newNodes[0] as POMNode & { children: POMNode[] };
    const second = newNodes[1] as POMNode & { children: POMNode[] };
    expect(first.children).toHaveLength(1);
    expect((first.children[0] as POMNode & { text: string }).text).toBe("C");
    expect(second.children).toHaveLength(2);
  });

  it("異なる親への drag では onChange が呼ばれない (silent rejection)", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag "A" (id 1, parent 0) over "C" (id 4, parent 3) — different parents.
    capturedHandlers.onDragEnd?.(event("1", "0", "4", "3"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("異なる親に over しているとき、該当行に赤ハイライト + not-allowed カーソルが付与される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Trigger onDragOver: active id 1 (parent 0) over id 4 (parent 3).
    act(() => {
      capturedHandlers.onDragOver?.(event("1", "0", "4", "3"));
    });

    const over = labelWrapper('Text: "C"');
    expect(over.style.backgroundColor).toBe("rgb(254, 226, 226)");
    // jsdom does not normalize the hex value; keep the literal.
    expect(over.style.outline).toBe("1px solid #dc2626");
    expect(over.style.cursor).toBe("not-allowed");
  });

  it("drag cancel 後に invalidOverId がクリアされ、赤ハイライト・not-allowed カーソル指定が残らない", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(event("1", "0", "4", "3"));
    });
    // Sanity: highlight applied.
    expect(labelWrapper('Text: "C"').style.backgroundColor).toBe(
      "rgb(254, 226, 226)",
    );

    act(() => {
      capturedHandlers.onDragCancel?.();
    });

    const over = labelWrapper('Text: "C"');
    expect(over.style.backgroundColor).toBe("");
    expect(over.style.outline).toBe("");
    expect(over.style.cursor).toBe("");
  });

  it("drag end (異なる親 silent reject) 後に invalidOverId がクリアされ、赤ハイライト指定が残らない", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(event("1", "0", "4", "3"));
    });
    expect(labelWrapper('Text: "C"').style.backgroundColor).toBe(
      "rgb(254, 226, 226)",
    );

    act(() => {
      capturedHandlers.onDragEnd?.(event("1", "0", "4", "3"));
    });

    const over = labelWrapper('Text: "C"');
    expect(over.style.backgroundColor).toBe("");
    expect(over.style.outline).toBe("");
    expect(over.style.cursor).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });
});
