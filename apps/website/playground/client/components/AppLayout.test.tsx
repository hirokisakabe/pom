import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const previewTestState = vi.hoisted(() => ({ signals: [] as AbortSignal[] }));

const mockDownloadPptx = vi.fn().mockResolvedValue(undefined);
vi.mock("../lib/downloadPptx", () => ({
  downloadPptx: (...args: unknown[]) => mockDownloadPptx(...args) as unknown,
}));

const mockPreviewPost = vi.fn();
vi.mock("../lib/honoClient", () => ({
  honoClient: {
    api: {
      preview: {
        $post: (...args: unknown[]) => mockPreviewPost(...args) as unknown,
      },
    },
  },
}));

vi.mock("@hirokisakabe/pom-editor", () => ({
  PomEditor: ({
    xml,
    onChange,
    onPreview,
    onDownload,
    toolbarStart,
    toolbarEnd,
  }: {
    xml: string;
    onChange: (xml: string) => void;
    onPreview: (
      xml: string,
      options: { signal: AbortSignal },
    ) => Promise<unknown>;
    onDownload?: (xml: string) => Promise<void>;
    toolbarStart: ReactNode;
    toolbarEnd: ReactNode;
  }) => {
    const [previewResult, setPreviewResult] = useState<
      { svgs: string[] } | { errors: { message: string }[] } | null
    >(null);

    async function handlePreview() {
      const signal = new AbortController().signal;
      previewTestState.signals.push(signal);
      setPreviewResult(
        (await onPreview(xml, { signal })) as
          { svgs: string[] } | { errors: { message: string }[] },
      );
    }

    return (
      <div>
        <div>{toolbarStart}</div>
        <textarea
          data-testid="xml-editor"
          value={xml}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" onClick={() => void handlePreview()}>
          Preview
        </button>
        {onDownload && (
          <button type="button" onClick={() => void onDownload(xml)}>
            Download
          </button>
        )}
        {previewResult && "svgs" in previewResult && (
          <div dangerouslySetInnerHTML={{ __html: previewResult.svgs[0] }} />
        )}
        {previewResult && "errors" in previewResult && (
          <div>{previewResult.errors[0]?.message}</div>
        )}
        <div>{toolbarEnd}</div>
      </div>
    );
  },
}));

import { AppLayout } from "./AppLayout";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AppLayout", () => {
  beforeEach(() => {
    mockPreviewPost.mockClear();
    mockDownloadPptx.mockClear();
    previewTestState.signals.length = 0;
    mockPreviewPost.mockResolvedValue({
      json: () => Promise.resolve({ svgs: [] }),
    });
  });

  it("website固有のSamplesとnavigationをPomEditor toolbarへ渡す", async () => {
    render(<AppLayout />);
    expect(await screen.findByText("pom playground")).toBeInTheDocument();
    expect(screen.getByText("Samples")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "XML Reference" }),
    ).toBeInTheDocument();
  });

  it("PomEditorのpreview callbackをwebsite APIへ接続する", async () => {
    const user = userEvent.setup();
    mockPreviewPost.mockResolvedValue({
      json: () =>
        Promise.resolve({
          svgs: [
            '<svg xmlns="http://www.w3.org/2000/svg"><text>API Preview</text></svg>',
          ],
        }),
    });
    render(<AppLayout />);
    const editor = screen.getByTestId("xml-editor");
    await user.clear(editor);
    await user.type(editor, "<Text>preview</Text>");
    await user.click(screen.getByRole("button", { name: "Preview" }));

    await waitFor(() => expect(mockPreviewPost).toHaveBeenCalled());
    expect(mockPreviewPost.mock.calls.at(-1)?.[0]).toEqual({
      json: { xml: "<Text>preview</Text>" },
    });
    expect(mockPreviewPost.mock.calls.at(-1)?.[1]).toEqual({
      init: { signal: previewTestState.signals[0] },
    });
    expect(await screen.findByText("API Preview")).toBeInTheDocument();
  });

  it("PomEditorのDownloadを既存download処理へ接続する", async () => {
    const user = userEvent.setup();
    render(<AppLayout />);
    const editor = await screen.findByTestId("xml-editor");
    await user.clear(editor);
    await user.type(editor, "<Text>download</Text>");
    await user.click(screen.getByRole("button", { name: "Download" }));
    await waitFor(() =>
      expect(mockDownloadPptx).toHaveBeenCalledWith("<Text>download</Text>"),
    );
  });

  it("Samples選択時の置換確認をhost側で維持する", async () => {
    const user = userEvent.setup();
    render(<AppLayout />);
    await user.click(screen.getByText("Samples"));
    await user.click(
      await screen.findByRole("menuitem", { name: "プロダクト紹介" }),
    );
    expect(await screen.findByText("Replace with sample?")).toBeInTheDocument();
  });
});
