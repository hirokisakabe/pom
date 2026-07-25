import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
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
let capturedAutoScroll: boolean | undefined;
const dragPointerDown = vi.fn();

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    autoScroll,
  }: {
    children: React.ReactNode;
    autoScroll?: boolean;
    onDragStart?: typeof capturedHandlers.onDragStart;
    onDragOver?: typeof capturedHandlers.onDragOver;
    onDragEnd?: typeof capturedHandlers.onDragEnd;
    onDragCancel?: typeof capturedHandlers.onDragCancel;
  }) => {
    capturedHandlers = { onDragStart, onDragOver, onDragEnd, onDragCancel };
    capturedAutoScroll = autoScroll;
    return <>{children}</>;
  },
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PointerSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => [],
  pointerWithin: () => [],
  useDraggable: () => ({
    attributes: {},
    listeners: { onPointerDown: dragPointerDown },
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
  capturedAutoScroll = undefined;
  dragPointerDown.mockClear();
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

  it("non-container を親にする gap drop は構造防御として拒否される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    // gap:1:0 — would make Text "A" (id 1) act as the parent for the moved
    // node. The UI never renders this gap (leaves have no child list), but
    // applyMoveToGap must still reject it defensively if a stale id reaches it.
    capturedHandlers.onDragEnd?.(dragTo("2", "gap:1:0"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("存在しない parentId への gap drop は拒否される", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    capturedHandlers.onDragEnd?.(dragTo("1", "gap:999:0"));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("AstTree DnD — visual feedback distinguishes inside vs between", () => {
  it("before / after gap の見た目を広げずに 16px の drop hit area を提供する", () => {
    render(<AstTree ast={makeAst()} onChange={vi.fn()} />);

    for (const id of ["gap:0:0", "gap:0:2"]) {
      const gap = screen.getByTestId(id);
      expect(gap.style.height).toBe("16px");
      expect(gap.style.marginTop).toBe("-7px");
      expect(gap.style.marginBottom).toBe("-7px");
      expect(gap.dataset.dropPlacement).toBe("between");
      expect(gap.style.pointerEvents).toBe("none");
    }

    act(() => {
      capturedHandlers.onDragStart?.({ active: { id: "1" } });
    });
    expect(screen.getByTestId("gap:0:0").style.pointerEvents).toBe("auto");
  });

  it("inside drop ターゲットに対して container 本体が青ハイライトされる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });

    const insideHighlighted = screen.getByTestId("layout-container:3");
    expect(insideHighlighted.style.backgroundColor).toBe("rgb(219, 234, 254)");
    expect(insideHighlighted.style.border).toBe("1px solid rgb(37, 99, 235)");
  });

  it.each(["gap:0:0", "gap:0:2"])(
    "%s drop ターゲットに対して挿入インジケータが青で表示される",
    (gapId) => {
      const onChange = vi.fn();
      render(<AstTree ast={makeAst()} onChange={onChange} />);

      act(() => {
        capturedHandlers.onDragOver?.(dragTo("1", gapId));
      });

      const indicator = screen.getByTestId(`${gapId}:indicator`);
      expect(indicator.style.backgroundColor).toBe("rgb(37, 99, 235)");
      expect(indicator.style.height).toBe("3px");
    },
  );

  it("inside と gap で異なる背景色が使われる (UI 上区別できる)", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });
    const insideBg =
      screen.getByTestId("layout-container:3").style.backgroundColor;

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "gap:0:2"));
    });
    const gapBg = screen.getByTestId("gap:0:2:indicator").style.backgroundColor;

    // Different colors used for the two feedback modes.
    expect(insideBg).toBeTruthy();
    expect(gapBg).toBeTruthy();
    expect(insideBg).not.toBe(gapBg);
  });
});

describe("AstTree DnD — drag overlay and scrolling", () => {
  it("drag 中の node label を DragOverlay に表示する", () => {
    render(<AstTree ast={makeAst()} onChange={vi.fn()} />);

    expect(screen.queryByTestId("ast-drag-overlay")).toBeNull();
    act(() => {
      capturedHandlers.onDragStart?.({ active: { id: "1" } });
    });

    expect(screen.getByTestId("ast-drag-overlay").textContent).toContain("A");
    expect(screen.getByTestId("ast-drag-overlay").textContent).not.toContain(
      "Text:",
    );
  });

  it("scroll container の edge auto-scroll を有効にする", () => {
    render(<AstTree ast={makeAst()} onChange={vi.fn()} />);

    expect(capturedAutoScroll).toBe(true);
  });
});

describe("AstTree DnD — drag lifecycle clears state", () => {
  it("drag cancel 後にハイライトがクリアされる", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    act(() => {
      capturedHandlers.onDragOver?.(dragTo("1", "inside:3"));
    });
    expect(screen.getByTestId("layout-container:3").style.backgroundColor).toBe(
      "rgb(219, 234, 254)",
    );

    act(() => {
      capturedHandlers.onDragCancel?.();
    });

    expect(screen.getByTestId("layout-container:3").style.backgroundColor).toBe(
      "rgb(248, 250, 252)",
    );
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

    expect(screen.getByTestId("layout-container:3").style.backgroundColor).toBe(
      "rgb(248, 250, 252)",
    );
  });

  it("over が null の drag end では onChange が呼ばれない", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    capturedHandlers.onDragEnd?.(dragTo("1", null));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("AstTree content editing", () => {
  it("Text prefix や引用符を付けず本文を主表示にする", () => {
    render(<AstTree ast={makeAst()} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Text: A" }).textContent).toBe(
      "A",
    );
    expect(screen.queryByText('Text: "A"')).toBeNull();
  });

  it("本文クリック後、Enter で編集内容を確定する", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Text: A" }));
    const input = screen.getByRole("textbox", { name: "Text を編集" });
    fireEvent.change(input, { target: { value: "Edited title" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledOnce();
    const nodes = onChange.mock.calls[0][0] as Array<
      POMNode & { children: Array<POMNode & { text?: string }> }
    >;
    expect(nodes[0].children[0].text).toBe("Edited title");
  });

  it("フォーカスアウトで編集内容を確定する", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Text: B" }));
    const input = screen.getByRole("textbox", { name: "Text を編集" });
    fireEvent.change(input, { target: { value: "Edited body" } });
    fireEvent.blur(input);

    const nodes = onChange.mock.calls[0][0] as Array<
      POMNode & { children: Array<POMNode & { text?: string }> }
    >;
    expect(nodes[0].children[1].text).toBe("Edited body");
  });

  it("Escape で編集前の本文へ戻し、変更を通知しない", () => {
    const onChange = vi.fn();
    render(<AstTree ast={makeAst()} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Text: A" }));
    const input = screen.getByRole("textbox", { name: "Text を編集" });
    fireEvent.change(input, { target: { value: "Discard me" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Text: A" })).toBeTruthy();
  });

  it("空 Text にクリック可能な placeholder を表示する", () => {
    const emptyText = {
      id: "empty",
      node: { type: "text", text: "" } as POMNode,
      parentId: "root",
    };
    render(<AstTree ast={[emptyText]} onChange={vi.fn()} />);

    const placeholder = screen.getByRole("button", { name: "Empty Text" });
    expect(placeholder.textContent).toBe("クリックしてテキストを入力");
    fireEvent.click(placeholder);
    expect(screen.getByRole("textbox", { name: "Text を編集" })).toBeTruthy();
  });

  it("本文の操作では drag listener が動かず、専用 handle から開始できる", () => {
    render(<AstTree ast={makeAst()} onChange={vi.fn()} />);

    const text = screen.getByRole("button", { name: "Text: A" });
    fireEvent.pointerDown(text);
    expect(dragPointerDown).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByTestId("drag-handle:1"));
    expect(dragPointerDown).toHaveBeenCalledOnce();
  });
});

describe("AstTree layout containers", () => {
  function makeLayoutAst(): AstNode[] {
    const text = {
      id: "text",
      node: { type: "text", text: "Nested content" } as POMNode,
      parentId: "layer",
    };
    const layer = {
      id: "layer",
      node: { type: "layer", children: [text.node] } as POMNode,
      parentId: "hstack",
      children: [text],
    };
    const hstack = {
      id: "hstack",
      node: {
        type: "hstack",
        gap: 12,
        children: [layer.node],
      } as POMNode,
      parentId: "vstack",
      children: [layer],
    };
    return [
      {
        id: "vstack",
        node: {
          type: "vstack",
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          children: [hstack.node],
        },
        parentId: "root",
        children: [hstack],
      },
    ];
  }

  it("VStack / HStack / Layer が子要素を内包する frame として表示される", () => {
    render(<AstTree ast={makeLayoutAst()} onChange={vi.fn()} />);

    expect(
      screen
        .getByTestId("layout-container:vstack")
        .contains(screen.getByTestId("layout-container:hstack")),
    ).toBe(true);
    expect(
      screen
        .getByTestId("layout-container:hstack")
        .contains(screen.getByTestId("layout-container:layer")),
    ).toBe(true);
    expect(
      screen
        .getByTestId("layout-container:layer")
        .contains(screen.getByRole("button", { name: "Text: Nested content" })),
    ).toBe(true);
  });

  it("layout ごとに異なる方向表現と secondary information を表示する", () => {
    render(<AstTree ast={makeLayoutAst()} onChange={vi.fn()} />);

    expect(screen.getByLabelText("Vertical layout").textContent).toBe("↓");
    expect(screen.getByLabelText("Horizontal layout").textContent).toBe("→");
    expect(screen.getByLabelText("Overlapping layout").textContent).toBe("▱");
    expect(screen.getByText("gap 12")).toBeTruthy();
    expect(
      screen.getByText('padding {"top":8,"right":16,"bottom":8,"left":16}'),
    ).toBeTruthy();
  });
});
