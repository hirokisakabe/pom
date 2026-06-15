import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

interface DragSubject {
  id: string;
  data?: { current?: unknown };
}

interface DragEvent {
  active: DragSubject;
  over: DragSubject | null;
}

let capturedHandlers: {
  onDragStart?: (event: { active: DragSubject }) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDragCancel?: () => void;
} = {};

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  }: {
    children: React.ReactNode;
    onDragStart?: typeof capturedHandlers.onDragStart;
    onDragOver?: typeof capturedHandlers.onDragOver;
    onDragEnd?: typeof capturedHandlers.onDragEnd;
    onDragCancel?: typeof capturedHandlers.onDragCancel;
  }) => {
    capturedHandlers = { onDragStart, onDragOver, onDragEnd, onDragCancel };
    return <>{children}</>;
  },
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => [],
  pointerWithin: () => [],
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: () => {},
    isOver: false,
  }),
}));

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

function dragTo(activeId: string, overId: string | null): DragEvent {
  return {
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  };
}

describe("AstTree DnD — gap drops (sibling reorder & cross-parent)", () => {
  it("同一親内 gap への drop で reorder される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag Text "A" (id 1, parent 0, index 0) onto gap "after B" (gap:0:2)
    capturedHandlers.onDragEnd?.(dragTo("1", "gap:0:2"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    const slide1 = newNodes[0] as POMNode & { children: POMNode[] };
    expect(slide1.children).toHaveLength(2);
    expect((slide1.children[0] as POMNode & { text: string }).text).toBe("B");
    expect((slide1.children[1] as POMNode & { text: string }).text).toBe("A");
  });

  it("トップレベル slide の gap drop で reorder される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag slide 1 (id 0) onto gap:root:2 (after slide 2)
    capturedHandlers.onDragEnd?.(dragTo("0", "gap:root:2"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    expect(newNodes).toHaveLength(2);
    const first = newNodes[0] as POMNode & { children: POMNode[] };
    const second = newNodes[1] as POMNode & { children: POMNode[] };
    expect(first.children).toHaveLength(1);
    expect((first.children[0] as POMNode & { text: string }).text).toBe("C");
    expect(second.children).toHaveLength(2);
  });

  it("cross-parent: 別 container の gap へ drop すると新しい親の子になる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag Text "B" (id 2, parent 0) into VStack slide 2's children at index 1
    // (after Text "C")
    capturedHandlers.onDragEnd?.(dragTo("2", "gap:3:1"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    const slide1 = newNodes[0] as POMNode & { children: POMNode[] };
    const slide2 = newNodes[1] as POMNode & { children: POMNode[] };
    expect(slide1.children).toHaveLength(1);
    expect((slide1.children[0] as POMNode & { text: string }).text).toBe("A");
    expect(slide2.children).toHaveLength(2);
    expect((slide2.children[0] as POMNode & { text: string }).text).toBe("C");
    expect((slide2.children[1] as POMNode & { text: string }).text).toBe("B");
  });

  it("container 配下のノードを root レベル gap に drop で root に引き上げられる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag Text "A" (id 1, parent 0) to gap:root:1 (between slide 1 and slide 2)
    capturedHandlers.onDragEnd?.(dragTo("1", "gap:root:1"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    expect(newNodes).toHaveLength(3);
    // newNodes[0] = VStack with only B
    const slide1 = newNodes[0] as POMNode & { children: POMNode[] };
    expect(slide1.children).toHaveLength(1);
    expect((slide1.children[0] as POMNode & { text: string }).text).toBe("B");
    // newNodes[1] = Text "A" (pulled up to root)
    expect(newNodes[1].type).toBe("text");
    expect((newNodes[1] as POMNode & { text: string }).text).toBe("A");
    // newNodes[2] = VStack with C
    const slide3 = newNodes[2] as POMNode & { children: POMNode[] };
    expect(slide3.children).toHaveLength(1);
  });
});

describe("AstTree DnD — inside drops (container nesting)", () => {
  it("inside drop で別 container の中に入れられる (container 自体の入れ子)", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag slide 1 VStack (id 0) into slide 2 VStack (id 3) as inside
    capturedHandlers.onDragEnd?.(dragTo("0", "inside:3"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    // Only one root-level slide now (slide 2, which contains former slide 1)
    expect(newNodes).toHaveLength(1);
    const surviving = newNodes[0] as POMNode & { children: POMNode[] };
    expect(surviving.type).toBe("vstack");
    expect(surviving.children).toHaveLength(2);
    // child 0 = Text "C", child 1 = nested VStack (former slide 1)
    expect((surviving.children[0] as POMNode & { text: string }).text).toBe(
      "C",
    );
    const nested = surviving.children[1] as POMNode & { children: POMNode[] };
    expect(nested.type).toBe("vstack");
    expect(nested.children).toHaveLength(2);
  });

  it("inside drop はコンテナ末尾に追加される (リーフを既存 container に入れる)", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag Text "A" (id 1) into slide 2 VStack (id 3) as inside
    capturedHandlers.onDragEnd?.(dragTo("1", "inside:3"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newNodes = onChange.mock.calls[0][0] as POMNode[];
    const slide1 = newNodes[0] as POMNode & { children: POMNode[] };
    const slide2 = newNodes[1] as POMNode & { children: POMNode[] };
    expect(slide1.children).toHaveLength(1);
    expect((slide1.children[0] as POMNode & { text: string }).text).toBe("B");
    expect(slide2.children).toHaveLength(2);
    // A is appended at the end
    expect((slide2.children[0] as POMNode & { text: string }).text).toBe("C");
    expect((slide2.children[1] as POMNode & { text: string }).text).toBe("A");
  });

  it("自分の subtree への drop は拒否される (サイクル防止)", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // Drag slide 1 VStack (id 0) into its own child gap:0:0 — would be a cycle
    capturedHandlers.onDragEnd?.(dragTo("0", "gap:0:0"));
    // Also try inside:0 (drop into itself)
    capturedHandlers.onDragEnd?.(dragTo("0", "inside:0"));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("AstTree DnD — visual feedback distinguishes inside vs between", () => {
  it("inside drop ターゲットに対して container 本体が青ハイライトされる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });

    // Both VStack rows are present; the one we dropped onto gets the inside highlight.
    const insideHighlighted = screen
      .getAllByText("VStack")
      .map((el) => el.parentElement)
      .find((el) => el?.style.backgroundColor === "rgb(219, 234, 254)");
    expect(insideHighlighted).toBeTruthy();
    expect(insideHighlighted!.style.outline).toBe("1px solid #2563eb");
  });

  it("gap drop ターゲットに対して挿入インジケータが青で表示される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "gap:0:2"));
    });

    const gap = document.querySelector<HTMLElement>('[data-testid="gap:0:2"]');
    expect(gap).not.toBeNull();
    expect(gap!.style.backgroundColor).toBe("rgb(59, 130, 246)");
  });

  it("inside と gap で異なる背景色が使われる (UI 上区別できる)", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });
    const insideBg = screen
      .getAllByText("VStack")
      .map((el) => el.parentElement)
      .find((el) => el?.style.backgroundColor)?.style.backgroundColor;

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "gap:0:2"));
    });
    const gap = document.querySelector<HTMLElement>('[data-testid="gap:0:2"]');
    const gapBg = gap?.style.backgroundColor;

    // Different colors used for the two feedback modes.
    expect(insideBg).toBeTruthy();
    expect(gapBg).toBeTruthy();
    expect(insideBg).not.toBe(gapBg);
  });
});

describe("AstTree DnD — drag lifecycle clears state", () => {
  it("drag cancel 後にハイライトがクリアされる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });
    expect(
      screen
        .getAllByText("VStack")
        .some((el) => el.parentElement?.style.backgroundColor),
    ).toBe(true);

    act(() => {
      capturedHandlers.onDragCancel?.();
    });

    expect(
      screen
        .getAllByText("VStack")
        .every((el) => !el.parentElement?.style.backgroundColor),
    ).toBe(true);
  });

  it("drag end 後にハイライトがクリアされる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });
    act(() => {
      capturedHandlers.onDragEnd?.(dragTo("1", "inside:3"));
    });

    expect(
      screen
        .getAllByText("VStack")
        .every((el) => !el.parentElement?.style.backgroundColor),
    ).toBe(true);
  });

  it("over が null の drag end では onChange が呼ばれない", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    capturedHandlers.onDragEnd?.(dragTo("1", null));

    expect(onChange).not.toHaveBeenCalled();
  });
});
