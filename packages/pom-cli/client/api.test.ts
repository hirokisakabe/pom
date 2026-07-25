// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  downloadPptx,
  exportImages,
  generatePreview,
  loadDocument,
  PreviewExportError,
  saveDocument,
} from "./api.ts";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockResponse(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("preview client API", () => {
  it("document responseの必須fieldを検証する", async () => {
    mockResponse(200, {
      xml: "<Text />",
      revision: "revision-1",
      filename: "slides.pom.xml",
      editable: true,
    });
    await expect(loadDocument()).resolves.toMatchObject({
      xml: "<Text />",
      revision: "revision-1",
    });

    mockResponse(200, { xml: "<Text />" });
    await expect(loadDocument()).rejects.toThrow("Invalid document response");
  });

  it("previewへXMLとAbortSignalを渡し、SVG responseを検証する", async () => {
    const fetchMock = mockResponse(200, { svgs: ["<svg />"] });
    const signal = new AbortController().signal;
    await expect(generatePreview("<Text />", signal)).resolves.toEqual({
      svgs: ["<svg />"],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/_api/preview",
      expect.objectContaining({
        body: JSON.stringify({ xml: "<Text />" }),
        signal,
      }),
    );

    mockResponse(200, {});
    await expect(generatePreview("<Text />", signal)).rejects.toThrow(
      "Invalid preview response",
    );
  });

  it("422 diagnosticsをPomEditorへ返す", async () => {
    mockResponse(422, {
      errors: [{ type: "xml_syntax", message: "Invalid XML" }],
    });
    await expect(
      generatePreview("<Text>", new AbortController().signal),
    ).resolves.toEqual({
      errors: [{ type: "xml_syntax", message: "Invalid XML" }],
    });
  });

  it("Save successのrevisionと409 conflict messageを扱う", async () => {
    mockResponse(200, { revision: "revision-2" });
    await expect(saveDocument("<Text />", "revision-1")).resolves.toBe(
      "revision-2",
    );

    mockResponse(409, { message: "External change conflict" });
    await expect(saveDocument("<Text />", "revision-1")).rejects.toThrow(
      "External change conflict",
    );
  });

  it("未保存XMLをPPTX APIへ渡してdownloadする", async () => {
    const response = new Response(new Uint8Array([80, 75]), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:pptx"),
      revokeObjectURL: vi.fn(),
    });

    await downloadPptx("<Text>unsaved</Text>", "slides.pom.xml");

    expect(fetchMock).toHaveBeenCalledWith(
      "/_api/export/pptx",
      expect.objectContaining({
        body: JSON.stringify({ xml: "<Text>unsaved</Text>" }),
      }),
    );
    expect(click).toHaveBeenCalled();
  });

  it("画像形式とslide指定をAPIへ渡してresponseを1回downloadする", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([80, 75]), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    let downloadedFilename = "";
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download;
      });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:image"),
      revokeObjectURL: vi.fn(),
    });

    await exportImages("<Text>unsaved</Text>", {
      format: "svg",
      slides: [2],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/_api/export/images",
      expect.objectContaining({
        body: JSON.stringify({
          xml: "<Text>unsaved</Text>",
          format: "svg",
          slides: [2],
        }),
      }),
    );
    expect(click).toHaveBeenCalledTimes(1);
    expect(downloadedFilename).toBe("slides-images.zip");
  });

  it("export APIのdiagnosticsを保持したerrorを投げる", async () => {
    mockResponse(422, {
      errors: [{ type: "NODE_OVERLAP", message: "overlap" }],
    });

    const error = await downloadPptx("<Text />", "slides.pom.xml").catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(PreviewExportError);
    expect((error as PreviewExportError).diagnostics).toEqual([
      { type: "NODE_OVERLAP", message: "overlap" },
    ]);
  });

  it("不正なdiagnostics responseは型付きerrorとして扱わない", async () => {
    mockResponse(422, { errors: [null] });

    await expect(downloadPptx("<Text />", "slides.pom.xml")).rejects.toThrow(
      "PPTX generation failed",
    );
  });
});
