import * as crypto from "crypto";
import * as path from "path";
import * as vscode from "vscode";
import type { Diagnostic, DiagnosticCode } from "@hirokisakabe/pom";
import {
  generatePreviewSvg,
  buildHtml,
  buildErrorHtml,
  ZOOM_LEVELS,
  type ZoomLevel,
} from "./generatePreview.js";
import { detectFormat } from "./fileUtils.js";

const SEVERITY_MAP: Record<DiagnosticCode, vscode.DiagnosticSeverity> = {
  IMAGE_MEASURE_FAILED: vscode.DiagnosticSeverity.Error,
  IMAGE_NOT_PREFETCHED: vscode.DiagnosticSeverity.Error,
  AUTOFIT_OVERFLOW: vscode.DiagnosticSeverity.Warning,
  SCALE_BELOW_THRESHOLD: vscode.DiagnosticSeverity.Warning,
  MASTER_PPTX_PARSE_FAILED: vscode.DiagnosticSeverity.Warning,
  ARROW_REF_NOT_FOUND: vscode.DiagnosticSeverity.Warning,
  ARROW_REF_NOT_CONNECTABLE: vscode.DiagnosticSeverity.Warning,
  DUPLICATE_NODE_ID: vscode.DiagnosticSeverity.Warning,
  NODE_OUT_OF_BOUNDS: vscode.DiagnosticSeverity.Warning,
  NODE_OVERLAP: vscode.DiagnosticSeverity.Warning,
};

function toVsDiagnostics(items: Diagnostic[]): vscode.Diagnostic[] {
  const range = new vscode.Range(0, 0, 0, 0);
  return items.map((d) => {
    const diag = new vscode.Diagnostic(
      range,
      `[${d.code}] ${d.message}`,
      SEVERITY_MAP[d.code],
    );
    diag.source = "pom";
    return diag;
  });
}

const DEBOUNCE_MS = 500;

function getNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

const VALID_ZOOM_VALUES = new Set<string>(ZOOM_LEVELS.map((z) => z.value));

function getDefaultZoom(): ZoomLevel {
  const value = vscode.workspace
    .getConfiguration("pom.preview")
    .get<string>("defaultZoom", "fit");
  return VALID_ZOOM_VALUES.has(value) ? (value as ZoomLevel) : "fit";
}

export class PomPreviewPanel {
  private static instance: PomPreviewPanel | undefined;
  private static diagnosticCollection: vscode.DiagnosticCollection | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly fontDirs: string[];
  private documentUri: vscode.Uri;
  private format: "markdown" | "xml";
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private renderGeneration = 0;
  private disposed = false;

  static setDiagnosticCollection(
    collection: vscode.DiagnosticCollection,
  ): void {
    PomPreviewPanel.diagnosticCollection = collection;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionPath: string,
    document: vscode.TextDocument,
  ) {
    this.panel = panel;
    this.fontDirs = [path.join(extensionPath, "fonts")];
    this.documentUri = document.uri;
    this.format = detectFormat(document.fileName);

    this.panel.onDidDispose(() => {
      this.disposed = true;
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      PomPreviewPanel.diagnosticCollection?.delete(this.documentUri);
      PomPreviewPanel.instance = undefined;
    });

    void this.render(document.getText());
  }

  static createOrShow(
    extensionUri: vscode.Uri,
    document: vscode.TextDocument,
  ): void {
    if (PomPreviewPanel.instance) {
      const oldUri = PomPreviewPanel.instance.documentUri;
      if (oldUri.toString() !== document.uri.toString()) {
        PomPreviewPanel.diagnosticCollection?.delete(oldUri);
      }
      PomPreviewPanel.instance.documentUri = document.uri;
      PomPreviewPanel.instance.format = detectFormat(document.fileName);
      PomPreviewPanel.instance.panel.reveal(vscode.ViewColumn.Beside);
      void PomPreviewPanel.instance.render(document.getText());
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "pomPreview",
      "pom Preview",
      vscode.ViewColumn.Beside,
      { enableScripts: true },
    );

    PomPreviewPanel.instance = new PomPreviewPanel(
      panel,
      extensionUri.fsPath,
      document,
    );
  }

  static update(document: vscode.TextDocument): void {
    const instance = PomPreviewPanel.instance;
    if (!instance || instance.disposed) return;

    // 対象ドキュメントの変更のみ再描画
    if (instance.documentUri.toString() !== document.uri.toString()) return;

    if (instance.debounceTimer) clearTimeout(instance.debounceTimer);
    instance.debounceTimer = setTimeout(() => {
      void instance.render(document.getText());
    }, DEBOUNCE_MS);
  }

  private async render(content: string): Promise<void> {
    const generation = ++this.renderGeneration;

    const result = await generatePreviewSvg(
      content,
      this.fontDirs,
      this.format,
      this.documentUri.fsPath,
    );

    if (generation !== this.renderGeneration || this.disposed) return;

    const nonce = getNonce();
    const defaultZoom = getDefaultZoom();

    switch (result.type) {
      case "empty":
        this.panel.webview.html = buildHtml([], nonce, defaultZoom);
        PomPreviewPanel.diagnosticCollection?.delete(this.documentUri);
        break;
      case "success":
        this.panel.webview.html = buildHtml(
          result.svgs,
          nonce,
          defaultZoom,
          result.slideWidth,
        );
        if (result.diagnostics.length > 0) {
          PomPreviewPanel.diagnosticCollection?.set(
            this.documentUri,
            toVsDiagnostics(result.diagnostics),
          );
        } else {
          PomPreviewPanel.diagnosticCollection?.delete(this.documentUri);
        }
        break;
      case "error":
        this.panel.webview.html = buildErrorHtml(result.message);
        PomPreviewPanel.diagnosticCollection?.delete(this.documentUri);
        break;
    }
  }
}
