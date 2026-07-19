import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const watchState = vi.hoisted(() => ({
  callback: null as (() => void) | null,
}));

vi.mock("./watch.ts", () => ({
  watchInputFile: (_absPath: string, onChange: () => void) => {
    watchState.callback = onChange;
    return { close: vi.fn() };
  },
}));

import {
  atomicWriteFile,
  createPreviewServer,
  readPreviewDocument,
  savePreviewDocument,
} from "./preview.ts";

const INITIAL_XML = "<VStack><Text>initial</Text></VStack>";
let tempDir: string;
let inputFile: string;
let server: http.Server | null;
let baseUrl: string;

beforeEach(async () => {
  tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pom-preview-"));
  inputFile = path.join(tempDir, "slides.pom.xml");
  await fs.promises.writeFile(inputFile, INITIAL_XML);
  server = null;
  watchState.callback = null;
});

afterEach(async () => {
  if (server?.listening) {
    await new Promise<void>((resolve, reject) =>
      server?.close((error) => (error ? reject(error) : resolve())),
    );
  }
  await fs.promises.rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

async function startServer(
  generatePreview = vi.fn().mockResolvedValue({ svgs: [] }),
  onDocumentEvent?: ReturnType<typeof vi.fn>,
) {
  server = createPreviewServer(inputFile, {
    clientScript: "globalThis.__POM_PREVIEW_CLIENT__ = true;",
    generatePreview,
    onDocumentEvent,
  });
  await new Promise<void>((resolve) => server?.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No server address");
  baseUrl = `http://127.0.0.1:${address.port}`;
  return generatePreview;
}

describe("preview document save", () => {
  it("同一directoryの一時fileをrenameしてatomicに更新する", async () => {
    const rename = vi.spyOn(fs.promises, "rename");
    await atomicWriteFile(inputFile, "<Text>atomic</Text>");

    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(
      "<Text>atomic</Text>",
    );
    expect(rename).toHaveBeenCalledTimes(1);
    const [temporaryPath, targetPath] = rename.mock.calls[0] ?? [];
    expect(path.dirname(String(temporaryPath))).toBe(tempDir);
    expect(targetPath).toBe(inputFile);
  });

  it("外部変更後のSaveを拒否し、対象fileを上書きしない", async () => {
    const revision = readPreviewDocument(inputFile).revision;
    await fs.promises.writeFile(inputFile, "<Text>external</Text>");

    await expect(
      savePreviewDocument(inputFile, "<Text>browser</Text>", revision),
    ).rejects.toThrow("changed outside pom preview");
    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(
      "<Text>external</Text>",
    );
  });

  it("一時file作成中の外部変更もrename前の再検査で拒否する", async () => {
    const revision = readPreviewDocument(inputFile).revision;
    const originalReadFile = fs.promises.readFile.bind(fs.promises);
    let targetReads = 0;
    vi.spyOn(fs.promises, "readFile").mockImplementation(async (...args) => {
      if (String(args[0]) === inputFile && ++targetReads === 2) {
        await fs.promises.writeFile(inputFile, "<Text>external late</Text>");
      }
      return originalReadFile(...args);
    });

    await expect(
      savePreviewDocument(inputFile, "<Text>browser</Text>", revision),
    ).rejects.toThrow("changed outside pom preview");
    expect(await originalReadFile(inputFile, "utf8")).toBe(
      "<Text>external late</Text>",
    );
  });
});

describe("preview server", () => {
  it("PomEditor client assetをlocal endpointから配信する", async () => {
    await startServer();
    const html = await fetch(baseUrl).then((response) => response.text());
    const asset = await fetch(`${baseUrl}/_assets/preview.js`).then(
      (response) => response.text(),
    );

    expect(html).toContain('<script src="/_assets/preview.js"');
    expect(html).not.toMatch(/https?:\/\/.*(?:jsdelivr|unpkg|cdnjs)/);
    expect(asset).toContain("__POM_PREVIEW_CLIENT__");
  });

  it("localhost以外のHostとcross-origin requestを拒否する", async () => {
    await startServer();
    const invalidHostStatus = await new Promise<number | undefined>(
      (resolve, reject) => {
        const request = http.get(
          `${baseUrl}/_api/document`,
          { headers: { Host: "example.com" } },
          (response) => {
            response.resume();
            response.on("end", () => resolve(response.statusCode));
          },
        );
        request.on("error", reject);
      },
    );
    const invalidOrigin = await fetch(`${baseUrl}/_api/document`, {
      headers: { Origin: "https://example.com" },
    });

    expect(invalidHostStatus).toBe(403);
    expect(invalidOrigin.status).toBe(403);
  });

  it("編集中の未保存XMLをpreview APIへ渡す", async () => {
    const generatePreview = await startServer();
    const xml = "<Text>unsaved</Text>";
    const response = await fetch(`${baseUrl}/_api/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml }),
    });

    expect(response.status).toBe(200);
    expect(generatePreview).toHaveBeenCalledWith(xml);
  });

  it("Save後のwatch通知を抑止し、後続のexternal changeだけを配信する", async () => {
    const onDocumentEvent = vi.fn();
    const generatePreview = await startServer(undefined, onDocumentEvent);
    const document = await fetch(`${baseUrl}/_api/document`).then(
      (response) => response.json() as Promise<{ revision: string }>,
    );
    const xml = "<Text>saved from browser</Text>";
    const response = await fetch(`${baseUrl}/_api/document`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml, revision: document.revision }),
    });

    expect(response.status).toBe(200);
    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(xml);
    watchState.callback?.();
    await fs.promises.writeFile(inputFile, "<Text>external after save</Text>");
    watchState.callback?.();
    expect(onDocumentEvent).toHaveBeenCalledTimes(1);
    expect(onDocumentEvent).toHaveBeenCalledWith(
      expect.objectContaining({ xml: "<Text>external after save</Text>" }),
    );
    expect(generatePreview).not.toHaveBeenCalled();
  });

  it("外部変更後のSave APIは409 conflictを返す", async () => {
    await startServer();
    const document = await fetch(`${baseUrl}/_api/document`).then(
      (response) => response.json() as Promise<{ revision: string }>,
    );
    await fs.promises.writeFile(inputFile, "<Text>external</Text>");
    const response = await fetch(`${baseUrl}/_api/document`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        xml: "<Text>browser</Text>",
        revision: document.revision,
      }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ code: "conflict" });
    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(
      "<Text>external</Text>",
    );
  });
});
