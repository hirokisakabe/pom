// @vitest-environment jsdom
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PomEditorProps } from "@hirokisakabe/pom-editor";

const api = vi.hoisted(() => ({
  downloadPptx: vi.fn(),
  exportImages: vi.fn(),
  generatePreview: vi.fn(),
  loadDocument: vi.fn(),
  saveDocument: vi.fn(),
}));

vi.mock("./api.ts", () => api);
vi.mock("@hirokisakabe/pom-editor", () => ({
  PomEditor: (props: PomEditorProps) => {
    const [error, setError] = useState<string | null>(null);
    return (
      <div data-testid="shared-pom-editor">
        <textarea
          aria-label="XML editor"
          value={props.xml}
          onChange={(event) => props.onChange(event.target.value)}
        />
        <button
          type="button"
          onClick={() => props.onChange("<Text>AST DnD result</Text>")}
        >
          Simulate AST DnD
        </button>
        <button
          type="button"
          onClick={() =>
            void props.onPreview(props.xml, {
              signal: new AbortController().signal,
            })
          }
        >
          Preview
        </button>
        {props.onDownload && (
          <button
            type="button"
            onClick={() => void props.onDownload?.(props.xml)}
          >
            Download PPTX
          </button>
        )}
        {props.onExportImages && (
          <>
            <button
              type="button"
              onClick={() =>
                void props.onExportImages?.(props.xml, {
                  format: "png",
                  scope: "current",
                  currentSlide: 2,
                })
              }
            >
              Export current PNG
            </button>
            <button
              type="button"
              onClick={() =>
                void props.onExportImages?.(props.xml, {
                  format: "svg",
                  scope: "all",
                  currentSlide: 2,
                })
              }
            >
              Export all SVG
            </button>
          </>
        )}
        {props.onSave && (
          <button
            type="button"
            onClick={() =>
              void Promise.resolve(props.onSave?.(props.xml)).catch((reason) =>
                setError(
                  reason instanceof Error ? reason.message : String(reason),
                ),
              )
            }
          >
            Save
          </button>
        )}
        {props.toolbarStart}
        {props.toolbarEnd}
        {error && <div role="alert">{error}</div>}
      </div>
    );
  },
}));

import { App } from "./App.tsx";

type DocumentEvent = {
  xml: string;
  revision: string;
  filename: string;
  editable: boolean;
};

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  private documentListener: ((event: MessageEvent<string>) => void) | null =
    null;

  constructor(_url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(
    type: string,
    listener: (event: MessageEvent<string>) => void,
  ) {
    if (type === "document") this.documentListener = listener;
  }

  emit(document: DocumentEvent) {
    this.documentListener?.(
      new MessageEvent("document", { data: JSON.stringify(document) }),
    );
  }

  close() {}
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  FakeEventSource.instances.length = 0;
});

function arrangeDocument() {
  api.loadDocument.mockResolvedValue({
    xml: "<Text>initial</Text>",
    revision: "revision-1",
    filename: "slides.pom.xml",
    editable: true,
  });
  api.generatePreview.mockResolvedValue({ svgs: [] });
  api.downloadPptx.mockResolvedValue(undefined);
  api.exportImages.mockResolvedValue(undefined);
  api.saveDocument.mockResolvedValue("revision-2");
}

describe("CLI preview App", () => {
  it("共通PomEditorのXML変更とAST DnD結果を未保存previewへ渡す", async () => {
    arrangeDocument();
    render(<App />);
    expect(await screen.findByTestId("shared-pom-editor")).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "XML editor" }), {
      target: { value: "<Text>XML edit</Text>" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(api.generatePreview).toHaveBeenLastCalledWith(
      "<Text>XML edit</Text>",
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole("button", { name: "Simulate AST DnD" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(api.generatePreview).toHaveBeenLastCalledWith(
      "<Text>AST DnD result</Text>",
      expect.any(AbortSignal),
    );
    expect(screen.getByRole("status").textContent).toBe("Unsaved changes");
  });

  it("未保存XMLをPPTXと現在 / 全スライド画像の出力APIへ渡す", async () => {
    arrangeDocument();
    render(<App />);
    const editor = await screen.findByRole("textbox", { name: "XML editor" });
    fireEvent.change(editor, {
      target: { value: "<Text>unsaved export</Text>" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Download PPTX" }));
    fireEvent.click(screen.getByRole("button", { name: "Export current PNG" }));
    fireEvent.click(screen.getByRole("button", { name: "Export all SVG" }));

    expect(api.downloadPptx).toHaveBeenCalledWith(
      "<Text>unsaved export</Text>",
      "slides.pom.xml",
    );
    expect(api.exportImages).toHaveBeenNthCalledWith(
      1,
      "<Text>unsaved export</Text>",
      { format: "png", slides: [2] },
    );
    expect(api.exportImages).toHaveBeenNthCalledWith(
      2,
      "<Text>unsaved export</Text>",
      { format: "svg" },
    );
  });

  it("Saveへ編集中XMLと読込時revisionを渡し、成功後にSaved表示へ戻す", async () => {
    arrangeDocument();
    render(<App />);
    const editor = await screen.findByRole("textbox", { name: "XML editor" });
    fireEvent.change(editor, { target: { value: "<Text>saved</Text>" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.saveDocument).toHaveBeenCalledWith(
        "<Text>saved</Text>",
        "revision-1",
      ),
    );
    expect(await screen.findByText("Saved")).toBeTruthy();
  });

  it("external change conflictをPomEditor内のerrorとして表示する", async () => {
    arrangeDocument();
    api.saveDocument.mockRejectedValue(
      new Error("The file changed outside pom preview. Reload before saving."),
    );
    render(<App />);
    const editor = await screen.findByRole("textbox", { name: "XML editor" });
    fireEvent.change(editor, { target: { value: "<Text>conflict</Text>" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "The file changed outside pom preview",
    );
  });

  it("Save処理中に届いたexternal change通知をsuccess responseで消さない", async () => {
    arrangeDocument();
    vi.stubGlobal("EventSource", FakeEventSource);
    let resolveSave: ((revision: string) => void) | undefined;
    api.saveDocument.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveSave = resolve;
      }),
    );
    render(<App />);
    const editor = await screen.findByRole("textbox", { name: "XML editor" });
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    fireEvent.change(editor, { target: { value: "<Text>browser</Text>" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    FakeEventSource.instances[0]?.emit({
      xml: "<Text>external</Text>",
      revision: "external-revision",
      filename: "slides.pom.xml",
      editable: true,
    });
    resolveSave?.("revision-2");

    expect(
      await screen.findByText(
        "External changes detected — Save will be blocked",
      ),
    ).toBeTruthy();
  });

  it("Save内容と一致するdocument通知を保存成功として反映する", async () => {
    arrangeDocument();
    vi.stubGlobal("EventSource", FakeEventSource);
    render(<App />);
    const editor = await screen.findByRole("textbox", { name: "XML editor" });
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    fireEvent.change(editor, { target: { value: "<Text>browser</Text>" } });

    FakeEventSource.instances[0]?.emit({
      xml: "<Text>browser</Text>",
      revision: "revision-2",
      filename: "slides.pom.xml",
      editable: true,
    });

    expect(await screen.findByText("Saved")).toBeTruthy();
  });

  it("Save後に再編集してもSave内容の通知をexternal change扱いしない", async () => {
    arrangeDocument();
    vi.stubGlobal("EventSource", FakeEventSource);
    let resolveSave: ((revision: string) => void) | undefined;
    api.saveDocument.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveSave = resolve;
      }),
    );
    render(<App />);
    const editor = await screen.findByRole("textbox", { name: "XML editor" });
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    fireEvent.change(editor, { target: { value: "<Text>saving</Text>" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(editor, { target: { value: "<Text>new edit</Text>" } });

    FakeEventSource.instances[0]?.emit({
      xml: "<Text>saving</Text>",
      revision: "revision-2",
      filename: "slides.pom.xml",
      editable: true,
    });
    resolveSave?.("revision-2");

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Unsaved changes"),
    );
  });
});
