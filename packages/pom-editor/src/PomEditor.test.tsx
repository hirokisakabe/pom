import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const editorViewMock = vi.hoisted(() => ({
  dispatch: vi.fn(),
  focus: vi.fn(),
  state: {
    doc: {
      lines: 3,
      line: vi.fn(() => ({ from: 10, to: 20 })),
    },
  },
}));

vi.mock("./XmlEditor.tsx", () => ({
  XmlEditor: ({
    value,
    onChange,
    onViewReady,
  }: {
    value: string;
    onChange: (xml: string) => void;
    onViewReady: (view: never) => void;
  }) => {
    onViewReady(editorViewMock as never);
    return (
      <textarea
        data-testid="pom-xml-editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  },
}));

vi.mock("./PomAstEditor.tsx", () => ({
  PomAstEditor: ({
    xml,
    onChange,
    onRequestXmlMode,
  }: {
    xml: string;
    onChange: (xml: string) => void;
    onRequestXmlMode?: () => void;
  }) => (
    <div>
      <span>{xml}</span>
      <button type="button" onClick={() => onChange("<Text>from AST</Text>")}>
        Change AST
      </button>
      <button type="button" onClick={onRequestXmlMode}>
        Open XML editor
      </button>
    </div>
  ),
}));

import { PomEditor } from "./PomEditor.tsx";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("PomEditor", () => {
  it("XML / AST modeを切り替え、同じXMLを編集する", () => {
    const onChange = vi.fn();
    render(
      <PomEditor
        xml="<Text>hello</Text>"
        onChange={onChange}
        onPreview={vi.fn().mockResolvedValue({ svgs: [] })}
      />,
    );

    expect(screen.getByTestId("pom-xml-editor")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "ast" }));
    expect(screen.getByTestId("pom-ast-editor").textContent).toContain(
      "<Text>hello</Text>",
    );

    fireEvent.click(screen.getByRole("button", { name: "Change AST" }));
    expect(onChange).toHaveBeenCalledWith("<Text>from AST</Text>");
  });

  it("XML変更後にdebounceしてpreview callbackを呼ぶ", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onPreview = vi.fn().mockResolvedValue({
      svgs: [
        '<svg xmlns="http://www.w3.org/2000/svg"><text>Preview</text></svg>',
      ],
    });
    const { rerender } = render(
      <PomEditor
        xml="<Text>first</Text>"
        onChange={vi.fn()}
        onPreview={onPreview}
        debounceMs={100}
      />,
    );

    rerender(
      <PomEditor
        xml="<Text>second</Text>"
        onChange={vi.fn()}
        onPreview={onPreview}
        debounceMs={100}
      />,
    );
    await vi.advanceTimersByTimeAsync(101);

    await waitFor(() => expect(onPreview).toHaveBeenCalledTimes(1));
    const previewCall = onPreview.mock.calls.at(-1) as
      [string, { signal: AbortSignal }] | undefined;
    expect(previewCall?.[0]).toBe("<Text>second</Text>");
    expect(previewCall?.[1].signal).toBeInstanceOf(AbortSignal);
    expect(await screen.findByText("Preview")).toBeTruthy();
  });

  it("DownloadとSaveはcallbackが指定された場合だけ表示する", async () => {
    const onDownload = vi.fn();
    const onSave = vi.fn();
    const onPreview = vi.fn().mockResolvedValue({ svgs: [] });
    const { rerender } = render(
      <PomEditor xml="<Text />" onChange={vi.fn()} onPreview={onPreview} />,
    );

    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();

    rerender(
      <PomEditor
        xml="<Text />"
        onChange={vi.fn()}
        onPreview={onPreview}
        onDownload={onDownload}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    await waitFor(() => expect(onDownload).toHaveBeenCalledWith("<Text />"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("<Text />"));
  });

  it("AST modeの行付きdiagnosticからXML modeへ切り替えて該当位置へ移動する", async () => {
    render(
      <PomEditor
        xml={"<Slide>\n<Text />\n</Slide>"}
        onChange={vi.fn()}
        onPreview={vi.fn().mockResolvedValue({
          errors: [
            {
              type: "schema",
              message: "Invalid attribute",
              line: 2,
              column: 3,
            },
          ],
        })}
        debounceMs={0}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "ast" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Invalid attribute/ }),
    );

    expect(screen.getByTestId("pom-xml-editor")).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: "xml" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(editorViewMock.state.doc.line).toHaveBeenCalledWith(2);
    expect(editorViewMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ selection: { anchor: 12 } }),
    );
    expect(editorViewMock.focus).toHaveBeenCalled();
  });

  it("XML modeの既存diagnostic line jumpを維持する", async () => {
    render(
      <PomEditor
        xml={"<Slide>\n<Text />\n</Slide>"}
        onChange={vi.fn()}
        onPreview={vi.fn().mockResolvedValue({
          errors: [
            { type: "xml_syntax", message: "Tag is not closed", line: 2 },
          ],
        })}
        debounceMs={0}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Tag is not closed/ }),
    );

    expect(editorViewMock.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ selection: { anchor: 10 } }),
    );
    expect(editorViewMock.focus).toHaveBeenCalled();
  });

  it("AST modeの行なしdiagnosticを選択すると案内を表示する", async () => {
    render(
      <PomEditor
        xml="<Text />"
        onChange={vi.fn()}
        onPreview={vi.fn().mockResolvedValue({
          errors: [{ type: "structure", message: "Slide is required" }],
        })}
        debounceMs={0}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "ast" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /Slide is required/ }),
    );

    expect(screen.getByRole("status").textContent).toContain(
      "does not include a source line",
    );
    expect(screen.getByTestId("pom-ast-editor")).toBeTruthy();
  });

  it("XML modeの行なしdiagnosticには現在のmodeに合う案内を表示する", async () => {
    render(
      <PomEditor
        xml="<Text />"
        onChange={vi.fn()}
        onPreview={vi.fn().mockResolvedValue({
          errors: [{ type: "structure", message: "Slide is required" }],
        })}
        debounceMs={0}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Slide is required/ }),
    );

    expect(screen.getByRole("status").textContent).toContain(
      "inspect the XML source manually",
    );
    expect(screen.getByRole("status").textContent).not.toContain(
      "switch to XML mode",
    );
  });

  it("AST treeを構築できない場合もXML modeへ戻れる", () => {
    render(
      <PomEditor
        xml="<Text>"
        onChange={vi.fn()}
        onPreview={vi.fn().mockResolvedValue({ svgs: [] })}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "ast" }));
    fireEvent.click(screen.getByRole("button", { name: "Open XML editor" }));

    expect(screen.getByTestId("pom-xml-editor")).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: "xml" }).getAttribute("aria-checked"),
    ).toBe("true");
  });
});
