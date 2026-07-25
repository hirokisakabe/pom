"use client";

import { EditorView } from "@codemirror/view";
import type { CSSProperties, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { PomAstEditor } from "./PomAstEditor.tsx";
import { SlidePreview } from "./SlidePreview.tsx";
import { XmlEditor } from "./XmlEditor.tsx";

export type PomEditorMode = "xml" | "ast";

export interface PomEditorDiagnostic {
  type: string;
  message: string;
  line?: number;
  column?: number;
  tagName?: string;
}

export type PomEditorPreviewResult =
  | { svgs: string[]; errors?: never }
  | { errors: PomEditorDiagnostic[]; svgs?: never };

export interface PomEditorImageExportOptions {
  format: "png" | "svg";
  scope: "current" | "all";
  currentSlide: number;
}

export interface PomEditorProps {
  xml: string;
  onChange: (xml: string) => void;
  onPreview: (
    xml: string,
    options: { signal: AbortSignal },
  ) => Promise<PomEditorPreviewResult>;
  onDownload?: (xml: string) => void | Promise<void>;
  onExportImages?: (
    xml: string,
    options: PomEditorImageExportOptions,
  ) => void | Promise<void>;
  onSave?: (xml: string) => void | Promise<void>;
  onCopyPreview?: (svg: string) => void | Promise<void>;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
  debounceMs?: number;
  className?: string;
  style?: CSSProperties;
}

const toolbarButtonStyle = {
  border: 0,
  borderRadius: 6,
  padding: "6px 8px",
  background: "transparent",
  color: "#4b5563",
  cursor: "pointer",
  fontSize: 14,
} as const;

export function PomEditor({
  xml,
  onChange,
  onPreview,
  onDownload,
  onExportImages,
  onSave,
  onCopyPreview,
  toolbarStart,
  toolbarEnd,
  debounceMs = 500,
  className,
  style,
}: PomEditorProps) {
  const [mode, setMode] = useState<PomEditorMode>("xml");
  const [svgs, setSvgs] = useState<string[]>([]);
  const [previewedXml, setPreviewedXml] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFormat, setImageFormat] = useState<"png" | "svg">("png");
  const [imageScope, setImageScope] = useState<"current" | "all">("current");
  const [runningAction, setRunningAction] = useState<
    "download" | "images" | "save" | null
  >(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<PomEditorDiagnostic[] | null>(
    null,
  );
  const [diagnosticNotice, setDiagnosticNotice] = useState<string | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const pendingDiagnosticRef = useRef<PomEditorDiagnostic | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const onPreviewRef = useRef(onPreview);
  const currentXmlRef = useRef(xml);

  useLayoutEffect(() => {
    currentXmlRef.current = xml;
  }, [xml]);

  useEffect(() => {
    onPreviewRef.current = onPreview;
  }, [onPreview]);

  useEffect(() => {
    setActionNotice(null);
  }, [xml]);

  const executePreview = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setPreviewedXml(null);
    setDiagnostics(null);
    setDiagnosticNotice(null);

    try {
      const result = await onPreviewRef.current(xml, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (result.errors) {
        setDiagnostics(result.errors);
        return;
      }
      setSvgs(result.svgs);
      setPreviewedXml(xml);
      setCurrentPage(1);
    } catch (error) {
      if (controller.signal.aborted) return;
      setDiagnostics([
        {
          type: "unknown",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate preview",
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [xml]);

  useEffect(() => {
    abortControllerRef.current?.abort();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      void executePreview();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [debounceMs, executePreview]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  function refreshPreview() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    void executePreview();
  }

  async function runAction(
    action: "download" | "images" | "save",
    callback: (xml: string) => void | Promise<void>,
    successMessage: string,
  ) {
    if (runningAction !== null) return;
    const actionXml = xml;
    setRunningAction(action);
    setActionNotice(
      action === "download"
        ? "Generating PPTX..."
        : action === "images"
          ? `Rendering ${imageFormat.toUpperCase()}...`
          : "Saving...",
    );
    setDiagnostics(null);
    setDiagnosticNotice(null);
    try {
      await callback(actionXml);
      if (currentXmlRef.current === actionXml) {
        setActionNotice(successMessage);
      }
    } catch (error) {
      if (currentXmlRef.current !== actionXml) return;
      setActionNotice(null);
      const actionDiagnostics =
        typeof error === "object" &&
        error !== null &&
        "diagnostics" in error &&
        Array.isArray(error.diagnostics)
          ? (error.diagnostics as PomEditorDiagnostic[])
          : null;
      setDiagnostics(
        actionDiagnostics ?? [
          {
            type: "unknown",
            message:
              error instanceof Error ? error.message : `${action} failed`,
          },
        ],
      );
    } finally {
      setRunningAction(null);
    }
  }

  function focusDiagnostic(view: EditorView, diagnostic: PomEditorDiagnostic) {
    if (!diagnostic.line) return;
    const requestedLine = Number.isFinite(diagnostic.line)
      ? Math.trunc(diagnostic.line)
      : 1;
    const line = view.state.doc.line(
      Math.min(Math.max(requestedLine, 1), view.state.doc.lines),
    );
    const requestedColumn = diagnostic.column
      ? Math.max(Math.trunc(diagnostic.column) - 1, 0)
      : 0;
    const anchor = Math.min(line.from + requestedColumn, line.to);
    view.dispatch({
      selection: { anchor },
      effects: EditorView.scrollIntoView(anchor, { y: "center" }),
    });
    view.focus();
  }

  function handleDiagnosticClick(index: number) {
    const diagnostic = diagnostics?.[index];
    if (!diagnostic) return;
    if (!diagnostic.line) {
      setDiagnosticNotice(
        mode === "ast"
          ? "This error does not include a source line. Review its message and switch to XML mode to inspect the source."
          : "This error does not include a source line. Review its message and inspect the XML source manually.",
      );
      return;
    }

    setDiagnosticNotice(null);
    if (mode === "ast") {
      pendingDiagnosticRef.current = diagnostic;
      setMode("xml");
      return;
    }

    const view = editorViewRef.current;
    if (view) focusDiagnostic(view, diagnostic);
  }

  function handleXmlViewReady(view: EditorView) {
    editorViewRef.current = view;
    const pendingDiagnostic = pendingDiagnosticRef.current;
    if (!pendingDiagnostic) return;
    pendingDiagnosticRef.current = null;
    focusDiagnostic(view, pendingDiagnostic);
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        minHeight: 0,
        flex: 1,
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: 42,
          alignItems: "center",
          gap: 8,
          padding: "6px 16px",
          borderBottom: "1px solid #e5e7eb",
          flexWrap: "wrap",
        }}
      >
        {toolbarStart}
        <div
          role="radiogroup"
          aria-label="Editor mode"
          style={{
            display: "flex",
            alignItems: "center",
            padding: 2,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            background: "#f9fafb",
          }}
        >
          {(["xml", "ast"] as const).map((editorMode) => (
            <button
              key={editorMode}
              type="button"
              role="radio"
              aria-checked={mode === editorMode}
              onClick={() => setMode(editorMode)}
              style={{
                ...toolbarButtonStyle,
                padding: "3px 8px",
                color: mode === editorMode ? "#111827" : "#6b7280",
                background: mode === editorMode ? "#fff" : "transparent",
                boxShadow:
                  mode === editorMode ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {editorMode}
            </button>
          ))}
        </div>
        <button
          type="button"
          style={toolbarButtonStyle}
          onClick={refreshPreview}
          disabled={isLoading}
        >
          Refresh Preview
        </button>
        {onDownload && (
          <button
            type="button"
            style={toolbarButtonStyle}
            onClick={() =>
              void runAction("download", onDownload, "PPTX downloaded")
            }
            disabled={runningAction !== null}
          >
            {runningAction === "download" ? "Generating PPTX..." : "Download"}
          </button>
        )}
        {onExportImages && (
          <>
            <label style={{ color: "#4b5563", fontSize: 12 }}>
              <span style={{ marginRight: 4 }}>Format</span>
              <select
                aria-label="Image format"
                value={imageFormat}
                onChange={(event) => {
                  setImageFormat(event.target.value as "png" | "svg");
                  setActionNotice(null);
                }}
                disabled={runningAction !== null}
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </label>
            <label style={{ color: "#4b5563", fontSize: 12 }}>
              <span style={{ marginRight: 4 }}>Slides</span>
              <select
                aria-label="Slides to export"
                value={imageScope}
                onChange={(event) => {
                  setImageScope(event.target.value as "current" | "all");
                  setActionNotice(null);
                }}
                disabled={runningAction !== null}
              >
                <option value="current">Current</option>
                <option value="all">All</option>
              </select>
            </label>
            <button
              type="button"
              style={toolbarButtonStyle}
              onClick={() =>
                void runAction(
                  "images",
                  (value) =>
                    onExportImages(value, {
                      format: imageFormat,
                      scope: imageScope,
                      currentSlide: currentPage,
                    }),
                  `${imageFormat.toUpperCase()} exported`,
                )
              }
              disabled={
                runningAction !== null ||
                isLoading ||
                svgs.length === 0 ||
                previewedXml !== xml
              }
            >
              {runningAction === "images"
                ? `Rendering ${imageFormat.toUpperCase()}...`
                : "Export Images"}
            </button>
          </>
        )}
        {onSave && (
          <button
            type="button"
            style={toolbarButtonStyle}
            onClick={() => void runAction("save", onSave, "Saved")}
            disabled={runningAction !== null}
          >
            {runningAction === "save" ? "Saving..." : "Save"}
          </button>
        )}
        {actionNotice && (
          <span
            role="status"
            style={{
              color: runningAction === null ? "#047857" : "#4b5563",
              fontSize: 12,
            }}
          >
            {actionNotice}
          </span>
        )}
        {toolbarEnd && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: "auto",
            }}
          >
            {toolbarEnd}
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          minHeight: 0,
          flex: 1,
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
          padding: 16,
        }}
      >
        <div style={{ minHeight: 0 }}>
          {mode === "xml" ? (
            <XmlEditor
              value={xml}
              onChange={onChange}
              diagnostics={diagnostics}
              onViewReady={handleXmlViewReady}
            />
          ) : (
            <div
              data-testid="pom-ast-editor"
              style={{
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: "#fff",
              }}
            >
              <PomAstEditor
                xml={xml}
                onChange={onChange}
                onRequestXmlMode={() => setMode("xml")}
              />
            </div>
          )}
        </div>
        <SlidePreview
          svgs={svgs}
          isLoading={isLoading}
          diagnostics={diagnostics}
          diagnosticNotice={diagnosticNotice}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onDiagnosticClick={handleDiagnosticClick}
          onCopyPreview={onCopyPreview}
        />
      </div>
    </div>
  );
}
