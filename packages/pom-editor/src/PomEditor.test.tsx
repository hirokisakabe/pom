import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./XmlEditor.tsx", () => ({
  XmlEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (xml: string) => void;
  }) => (
    <textarea
      data-testid="pom-xml-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock("./PomAstEditor.tsx", () => ({
  PomAstEditor: ({
    xml,
    onChange,
  }: {
    xml: string;
    onChange: (xml: string) => void;
  }) => (
    <div>
      <span>{xml}</span>
      <button type="button" onClick={() => onChange("<Text>from AST</Text>")}>
        Change AST
      </button>
    </div>
  ),
}));

import { PomEditor } from "./PomEditor.tsx";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
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
});
