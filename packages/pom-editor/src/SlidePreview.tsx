"use client";

import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PomEditorDiagnostic } from "./PomEditor.tsx";

type CopyStatus = "idle" | "copying" | "success" | "error";

function getErrorTypeLabel(type: string): string {
  switch (type) {
    case "xml_syntax":
      return "XML Syntax Error";
    case "schema":
      return "Attribute Value Error";
    case "structure":
      return "Structure Error";
    default:
      return "Error";
  }
}

interface SlidePreviewProps {
  svgs: string[];
  isLoading: boolean;
  diagnostics: PomEditorDiagnostic[] | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDiagnosticClick?: (diagnosticIndex: number) => void;
  onCopyPreview?: (svg: string) => void | Promise<void>;
}

const buttonStyle = {
  border: 0,
  borderRadius: 6,
  padding: "6px 8px",
  background: "transparent",
  cursor: "pointer",
} as const;

export function SlidePreview({
  svgs,
  isLoading,
  diagnostics,
  currentPage,
  onPageChange,
  onDiagnosticClick,
  onCopyPreview,
}: SlidePreviewProps) {
  const totalPages = svgs.length;
  const sanitizedSvgs = useMemo(
    () =>
      svgs.map((svg) =>
        DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        }),
      ),
    [svgs],
  );
  const activePage = Math.min(Math.max(currentPage, 1), totalPages || 1);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  async function handleCopyAsPng() {
    if (!onCopyPreview) return;
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    setCopyStatus("copying");
    try {
      const svg = sanitizedSvgs[activePage - 1];
      if (!svg) return;
      await onCopyPreview(svg);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
    copyTimerRef.current = setTimeout(() => {
      setCopyStatus("idle");
      copyTimerRef.current = null;
    }, 2000);
  }

  const frameStyle = {
    display: "flex",
    height: "100%",
    minHeight: 0,
    flexDirection: "column",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  } as const;

  if (isLoading) {
    return (
      <div
        style={{
          ...frameStyle,
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
        }}
      >
        <span style={{ color: "#6b7280" }}>Generating preview...</span>
      </div>
    );
  }

  if (diagnostics && diagnostics.length > 0) {
    return (
      <div style={frameStyle}>
        <ul
          style={{
            overflow: "auto",
            margin: 0,
            padding: 16,
            listStyle: "none",
          }}
        >
          {diagnostics.map((diagnostic, index) => (
            <li
              key={`${diagnostic.type}-${diagnostic.message}-${index}`}
              style={{
                marginBottom: 8,
                border: "1px solid #fecaca",
                borderRadius: 6,
                background: "#fef2f2",
              }}
            >
              <button
                type="button"
                disabled={!diagnostic.line || !onDiagnosticClick}
                onClick={() => onDiagnosticClick?.(index)}
                style={{
                  display: "flex",
                  width: "100%",
                  gap: 12,
                  padding: 12,
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  cursor:
                    diagnostic.line && onDiagnosticClick
                      ? "pointer"
                      : "default",
                }}
              >
                <span aria-hidden="true" style={{ color: "#dc2626" }}>
                  ●
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}
                  >
                    {getErrorTypeLabel(diagnostic.type)}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      overflowWrap: "anywhere",
                      fontSize: 14,
                    }}
                  >
                    {diagnostic.message}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <div
        style={{
          ...frameStyle,
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
        }}
      >
        <span style={{ color: "#6b7280" }}>Edit XML to see a preview</span>
      </div>
    );
  }

  return (
    <div style={frameStyle}>
      <div
        style={{
          position: "relative",
          display: "flex",
          minHeight: 0,
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: "#f3f4f6",
        }}
      >
        <div
          className="pom-editor-slide-preview"
          data-testid="pom-slide-preview"
          style={{ width: "100%", height: "100%" }}
          dangerouslySetInnerHTML={{ __html: sanitizedSvgs[activePage - 1] }}
        />
        <style>{`.pom-editor-slide-preview > svg { width: 100%; height: 100%; }`}</style>
        {onCopyPreview && (
          <button
            type="button"
            style={{
              ...buttonStyle,
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(255,255,255,0.9)",
            }}
            onClick={() => void handleCopyAsPng()}
            disabled={copyStatus === "copying"}
            aria-label="Copy as image"
          >
            {copyStatus === "idle" && "Copy"}
            {copyStatus === "copying" && "Copying…"}
            {copyStatus === "success" && "Copied"}
            {copyStatus === "error" && "Failed"}
          </button>
        )}
      </div>
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "8px 16px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            style={buttonStyle}
            disabled={activePage <= 1}
            onClick={() => onPageChange(activePage - 1)}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span style={{ fontSize: 14 }}>
            {activePage} / {totalPages}
          </span>
          <button
            type="button"
            style={buttonStyle}
            disabled={activePage >= totalPages}
            onClick={() => onPageChange(activePage + 1)}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
