export type DiagnosticCode =
  | "IMAGE_MEASURE_FAILED"
  | "IMAGE_NOT_PREFETCHED"
  | "AUTOFIT_OVERFLOW"
  | "SCALE_BELOW_THRESHOLD"
  | "MASTER_PPTX_PARSE_FAILED"
  | "ARROW_REF_NOT_FOUND"
  | "DUPLICATE_NODE_ID"
  | "PER_SIDE_BORDER_WITH_RADIUS"
  | "NODE_OUT_OF_BOUNDS"
  | "NODE_OVERLAP";

export interface Diagnostic {
  code: DiagnosticCode;
  message: string;
}

export class DiagnosticCollector {
  readonly items: Diagnostic[] = [];

  add(code: DiagnosticCode, message: string): void {
    this.items.push({ code, message });
  }
}

export class DiagnosticsError extends Error {
  constructor(public readonly diagnostics: Diagnostic[]) {
    const summary = diagnostics
      .map((d) => `[${d.code}] ${d.message}`)
      .join("\n");
    super(`Build completed with diagnostics:\n${summary}`);
    this.name = "DiagnosticsError";
  }
}
