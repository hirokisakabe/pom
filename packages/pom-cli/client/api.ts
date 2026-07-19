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

interface ErrorResponse {
  message?: string;
  errors?: PomEditorDiagnostic[];
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function loadDocument(signal?: AbortSignal) {
  const response = await fetch("/_api/document", { signal });
  if (!response.ok) throw new Error("Failed to load the preview document");
  return readJson<PreviewDocument>(response);
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
  const result = await readJson<PomEditorPreviewResult & ErrorResponse>(
    response,
  );
  if (result.errors) return { errors: result.errors };
  if (!response.ok) throw new Error(result.message ?? "Preview failed");
  return { svgs: result.svgs ?? [] };
}

export async function saveDocument(xml: string, revision: string) {
  const response = await fetch("/_api/document", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xml, revision }),
  });
  const result = await readJson<{ revision?: string; message?: string }>(
    response,
  );
  if (!response.ok || !result.revision) {
    throw new Error(result.message ?? "Save failed");
  }
  return result.revision;
}
