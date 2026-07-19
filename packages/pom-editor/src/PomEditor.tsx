"use client";

import { EditorView } from "@codemirror/view";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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

export interface PomEditorProps {
  xml: string;
  onChange: (xml: string) => void;
  onPreview: (
    xml: string,
    options: { signal: AbortSignal },
  ) => Promise<PomEditorPreviewResult>;
  onDownload?: (xml: string) => void | Promise<void>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [runningAction, setRunningAction] = useState<
    "download" | "save" | null
  >(null);
  const [diagnostics, setDiagnostics] = useState<PomEditorDiagnostic[] | null>(
    null,
  );
  const editorViewRef = useRef<EditorView | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const onPreviewRef = useRef(onPreview);

  useEffect(() => {
    onPreviewRef.current = onPreview;
  }, [onPreview]);

  const executePreview = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setDiagnostics(null);

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
    action: "download" | "save",
    callback: (xml: string) => void | Promise<void>,
  ) {
    if (runningAction !== null) return;
    setRunningAction(action);
    setDiagnostics(null);
    try {
      await callback(xml);
    } catch (error) {
      setDiagnostics([
        {
          type: "unknown",
          message: error instanceof Error ? error.message : `${action} failed`,
        },
      ]);
    } finally {
      setRunningAction(null);
    }
  }

  function handleDiagnosticClick(index: number) {
    const view = editorViewRef.current;
    const diagnostic = diagnostics?.[index];
    if (!view || !diagnostic?.line) return;
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
            onClick={() => void runAction("download", onDownload)}
            disabled={runningAction !== null}
          >
            Download
          </button>
        )}
        {onSave && (
          <button
            type="button"
            style={toolbarButtonStyle}
            onClick={() => void runAction("save", onSave)}
            disabled={runningAction !== null}
          >
            Save
          </button>
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
              onViewReady={(view) => {
                editorViewRef.current = view;
              }}
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
              <PomAstEditor xml={xml} onChange={onChange} />
            </div>
          )}
        </div>
        <SlidePreview
          svgs={svgs}
          isLoading={isLoading}
          diagnostics={diagnostics}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onDiagnosticClick={mode === "xml" ? handleDiagnosticClick : undefined}
          onCopyPreview={onCopyPreview}
        />
      </div>
    </div>
  );
}
