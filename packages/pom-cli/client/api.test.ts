import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePreview, loadDocument, saveDocument } from "./api.ts";

afterEach(() => {
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
});
