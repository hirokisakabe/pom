import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// XmlEditor を textarea にモック
vi.mock("./XmlEditor", () => ({
  XmlEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
    errors: unknown;
    onViewReady: (view: unknown) => void;
  }) => (
    <textarea
      data-testid="xml-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// downloadPptx をモック
const mockDownloadPptx = vi.fn().mockResolvedValue(undefined);
vi.mock("../lib/downloadPptx", () => ({
  downloadPptx: (...args: unknown[]) => mockDownloadPptx(...args) as unknown,
}));

// honoClient をモック
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

// PomAstEditor を簡易なモックに差し替える (クライアントの parseXml に依存しないため)
vi.mock("@hirokisakabe/pom-editor", () => ({
  PomAstEditor: ({ xml }: { xml: string; onChange: (xml: string) => void }) => (
    <div data-testid="ast-editor">{xml}</div>
  ),
}));

import { AppLayout } from "./AppLayout";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mockPreviewSuccess(svgs: string[]) {
  mockPreviewPost.mockResolvedValue({
    json: () => Promise.resolve({ svgs }),
  });
}

function mockPreviewError(errors: { type: string; message: string }[]) {
  mockPreviewPost.mockResolvedValue({
    json: () => Promise.resolve({ errors }),
  });
}

describe("AppLayout", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockPreviewSuccess([
      '<svg xmlns="http://www.w3.org/2000/svg"><text>Preview</text></svg>',
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("初期表示", () => {
    it("ヘッダーに 'pom playground' を表示する", () => {
      render(<AppLayout />);
      expect(screen.getByText("pom playground")).toBeInTheDocument();
    });

    it("デフォルトテンプレートの XML がエディタに設定される", () => {
      render(<AppLayout />);
      const editor = screen.getByTestId<HTMLTextAreaElement>("xml-editor");
      expect(editor.value).not.toBe("");
    });

    it("Samples ドロップダウンが表示される", () => {
      render(<AppLayout />);
      expect(screen.getByText("Samples")).toBeInTheDocument();
    });

    it("Refresh Preview ボタンが表示される", () => {
      render(<AppLayout />);
      expect(screen.getByText("Refresh Preview")).toBeInTheDocument();
    });

    it("Download ボタンが表示される", () => {
      render(<AppLayout />);
      expect(screen.getByText("Download")).toBeInTheDocument();
    });

    it("XML / AST モードトグルが表示される (初期は XML)", () => {
      render(<AppLayout />);
      const xmlRadio = screen.getByRole("radio", { name: "XML" });
      const astRadio = screen.getByRole("radio", { name: "AST" });
      expect(xmlRadio).toHaveAttribute("aria-checked", "true");
      expect(astRadio).toHaveAttribute("aria-checked", "false");
      expect(screen.getByTestId("xml-editor")).toBeInTheDocument();
      expect(screen.queryByTestId("ast-editor")).not.toBeInTheDocument();
    });
  });

  describe("モード切替フロー", () => {
    it("AST をクリックすると左ペインが PomAstEditor に切り替わる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);

      await user.click(screen.getByRole("radio", { name: "AST" }));

      expect(screen.getByTestId("ast-editor")).toBeInTheDocument();
      expect(screen.queryByTestId("xml-editor")).not.toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "AST" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("モード切替時に xmlValue が保持される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);

      const editor = screen.getByTestId<HTMLTextAreaElement>("xml-editor");
      await user.clear(editor);
      await user.type(editor, "<Text>persisted</Text>");

      await user.click(screen.getByRole("radio", { name: "AST" }));
      expect(screen.getByTestId("ast-editor")).toHaveTextContent(
        "<Text>persisted</Text>",
      );

      await user.click(screen.getByRole("radio", { name: "XML" }));
      expect(
        screen.getByTestId<HTMLTextAreaElement>("xml-editor").value,
      ).toBe("<Text>persisted</Text>");
    });
  });

  describe("プレビュー生成フロー", () => {
    it("初期表示時にデバウンス後にプレビューを生成する", async () => {
      render(<AppLayout />);

      // デバウンス前は呼ばれていない
      expect(mockPreviewPost).not.toHaveBeenCalled();

      // デバウンス後
      await vi.advanceTimersByTimeAsync(600);
      await waitFor(() => {
        expect(mockPreviewPost).toHaveBeenCalledTimes(1);
      });
    });

    it("XML 変更後、デバウンス待ち後に API を呼び出す", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);

      const editor = screen.getByTestId("xml-editor");
      await user.clear(editor);
      await user.type(editor, "<Text>hello</Text>");

      // デバウンス後
      await vi.advanceTimersByTimeAsync(600);
      await waitFor(() => {
        expect(mockPreviewPost).toHaveBeenCalled();
      });
    });

    it("API 成功時、SVG プレビューを表示する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockPreviewSuccess([
        '<svg xmlns="http://www.w3.org/2000/svg"><text>Test Slide</text></svg>',
      ]);
      render(<AppLayout />);

      const editor = screen.getByTestId("xml-editor");
      await user.clear(editor);
      await user.type(editor, "<Text>test</Text>");
      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText("Test Slide")).toBeInTheDocument();
      });
    });

    it("API エラー時、エラーを表示する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockPreviewError([{ type: "xml_syntax", message: "Tag is not closed" }]);
      render(<AppLayout />);

      const editor = screen.getByTestId("xml-editor");
      await user.clear(editor);
      await user.type(editor, "<broken");
      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText("Tag is not closed")).toBeInTheDocument();
      });
    });
  });

  describe("Refresh Preview ボタン", () => {
    it("クリックで即座にプレビューを実行する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);

      await user.click(screen.getByText("Refresh Preview"));

      await waitFor(() => {
        expect(mockPreviewPost).toHaveBeenCalled();
      });
    });
  });

  describe("ダウンロードフロー", () => {
    it("Download ボタンをクリックで downloadPptx を呼び出す", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);

      await user.click(screen.getByText("Download"));

      await waitFor(() => {
        expect(mockDownloadPptx).toHaveBeenCalled();
      });
    });

    it("ダウンロード失敗時にエラーを表示する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockDownloadPptx.mockRejectedValue(new Error("Download failed"));
      render(<AppLayout />);

      await user.click(screen.getByText("Download"));

      await waitFor(() => {
        expect(screen.getByText("Download failed")).toBeInTheDocument();
      });
    });
  });

  describe("テンプレート選択フロー", () => {
    it("テンプレート選択時、エディタに内容がある場合は確認ダイアログを表示する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);

      await user.click(screen.getByText("Samples"));
      await user.click(
        await screen.findByRole("menuitem", { name: "プロダクト紹介" }),
      );

      await waitFor(() => {
        expect(screen.getByText("Replace with sample?")).toBeInTheDocument();
      });
    });

    it("ダイアログで 'Cancel' をクリックするとテンプレートが適用されない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);
      const editor = screen.getByTestId<HTMLTextAreaElement>("xml-editor");
      const originalValue = editor.value;

      await user.click(screen.getByText("Samples"));
      await user.click(
        await screen.findByRole("menuitem", { name: "プロダクト紹介" }),
      );

      await waitFor(() => {
        expect(screen.getByText("Replace with sample?")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Cancel"));

      await waitFor(() => {
        expect(
          screen.queryByText("Replace with sample?"),
        ).not.toBeInTheDocument();
      });
      expect(editor.value).toBe(originalValue);
    });

    it("ダイアログで 'Replace' をクリックするとテンプレートが適用される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<AppLayout />);
      const editor = screen.getByTestId<HTMLTextAreaElement>("xml-editor");
      const originalValue = editor.value;

      await user.click(screen.getByText("Samples"));
      await user.click(
        await screen.findByRole("menuitem", { name: "プロダクト紹介" }),
      );

      await waitFor(() => {
        expect(screen.getByText("Replace with sample?")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Replace"));

      await waitFor(() => {
        expect(editor.value).not.toBe(originalValue);
      });
    });
  });
});
