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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function arrangeDocument() {
  api.loadDocument.mockResolvedValue({
    xml: "<Text>initial</Text>",
    revision: "revision-1",
    filename: "slides.pom.xml",
    editable: true,
  });
  api.generatePreview.mockResolvedValue({ svgs: [] });
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
});
