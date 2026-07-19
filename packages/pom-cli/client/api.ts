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
