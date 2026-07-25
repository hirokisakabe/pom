import type {
  PomEditorDiagnostic,
  PomEditorPreviewResult,
} from "@hirokisakabe/pom-editor";

export interface PreviewDocument {
  xml: string;
  revision: string;
  filename: string;
  editable: boolean;
}

interface ExportedImage {
  filename: string;
  mediaType: string;
  data: string;
}

export class PreviewExportError extends Error {
  constructor(
    message: string,
    public readonly diagnostics: PomEditorDiagnostic[],
  ) {
    super(message);
    this.name = "PreviewExportError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new Error("Invalid response from the preview server");
  }
}

function errorMessage(value: unknown, fallback: string): string {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : fallback;
}

async function throwExportError(
  response: Response,
  fallback: string,
): Promise<never> {
  const result = await readJson(response);
  if (isRecord(result) && Array.isArray(result.errors)) {
    const diagnostics = result.errors as PomEditorDiagnostic[];
    throw new PreviewExportError(
      diagnostics.map((diagnostic) => diagnostic.message).join("\n") ||
        fallback,
      diagnostics,
    );
  }
  throw new Error(errorMessage(result, fallback));
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function outputBaseName(filename: string): string {
  return filename.replace(/\.pom\.(?:xml|md)$/u, "");
}

export async function loadDocument(signal?: AbortSignal) {
  const response = await fetch("/_api/document", { signal });
  const result = await readJson(response);
  if (!response.ok) {
    throw new Error(
      errorMessage(result, "Failed to load the preview document"),
    );
  }
  if (
    !isRecord(result) ||
    typeof result.xml !== "string" ||
    typeof result.revision !== "string" ||
    typeof result.filename !== "string" ||
    typeof result.editable !== "boolean"
  ) {
    throw new Error("Invalid document response from the preview server");
  }
  return result as unknown as PreviewDocument;
}

export async function generatePreview(
  xml: string,
  signal: AbortSignal,
): Promise<PomEditorPreviewResult> {
  const response = await fetch("/_api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xml }),
    signal,
  });
  const result = await readJson(response);
  if (isRecord(result) && Array.isArray(result.errors)) {
    return { errors: result.errors as PomEditorDiagnostic[] };
  }
  if (!response.ok) throw new Error(errorMessage(result, "Preview failed"));
  if (
    !isRecord(result) ||
    !Array.isArray(result.svgs) ||
    !result.svgs.every((svg) => typeof svg === "string")
  ) {
    throw new Error("Invalid preview response from the preview server");
  }
  return { svgs: result.svgs } satisfies PomEditorPreviewResult;
}

export async function saveDocument(xml: string, revision: string) {
  const response = await fetch("/_api/document", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xml, revision }),
  });
  const result = await readJson(response);
  if (
    !response.ok ||
    !isRecord(result) ||
    typeof result.revision !== "string"
  ) {
    throw new Error(errorMessage(result, "Save failed"));
  }
  return result.revision;
}

export async function downloadPptx(
  xml: string,
  sourceFilename: string,
): Promise<void> {
  const response = await fetch("/_api/export/pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xml }),
  });
  if (!response.ok) {
    await throwExportError(response, "PPTX generation failed");
  }
  downloadBlob(await response.blob(), `${outputBaseName(sourceFilename)}.pptx`);
}

export async function exportImages(
  xml: string,
  options: {
    format: "png" | "svg";
    slides?: number[];
  },
): Promise<void> {
  const response = await fetch("/_api/export/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xml, ...options }),
  });
  if (!response.ok) {
    await throwExportError(response, "Image rendering failed");
  }
  const result = await readJson(response);
  if (
    !isRecord(result) ||
    !Array.isArray(result.files) ||
    !result.files.every(
      (file) =>
        isRecord(file) &&
        typeof file.filename === "string" &&
        typeof file.mediaType === "string" &&
        typeof file.data === "string",
    )
  ) {
    throw new Error("Invalid image export response from the preview server");
  }
  for (const file of result.files as ExportedImage[]) {
    const bytes = Uint8Array.from(atob(file.data), (character) =>
      character.charCodeAt(0),
    );
    downloadBlob(new Blob([bytes], { type: file.mediaType }), file.filename);
  }
}
