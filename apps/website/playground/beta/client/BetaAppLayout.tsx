"use client";

import { BookOpen, Download, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PomAstEditor } from "@hirokisakabe/pom-editor";

import { downloadPptx } from "@/playground/client/lib/downloadPptx";
import { honoClient } from "@/playground/client/lib/honoClient";
import { DEFAULT_TEMPLATE } from "@/playground/client/lib/sampleTemplates";
import type { StructuredError } from "@/playground/client/components/SlidePreview";
import { SlidePreview } from "@/playground/client/components/SlidePreview";

const DEBOUNCE_MS = 500;

export function BetaAppLayout() {
  const [xmlValue, setXmlValue] = useState(DEFAULT_TEMPLATE.xml);
  const [svgs, setSvgs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState<StructuredError[] | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  async function handleDownload() {
    setIsDownloading(true);
    setErrors(null);
    try {
      await downloadPptx(xmlValue);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Download failed";
      setErrors([{ type: "unknown", message }]);
    } finally {
      setIsDownloading(false);
    }
  }

  async function executePreview() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrors(null);

    try {
      const res = await honoClient.api.preview.$post(
        { json: { xml: xmlValue } },
        { init: { signal: controller.signal } },
      );
      const data = (await res.json()) as
        | { svgs: string[] }
        | { errors: StructuredError[] };
      if ("errors" in data) {
        setErrors(data.errors);
        return;
      }
      setSvgs(data.svgs);
      setCurrentPage(1);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setErrors([{ type: "unknown", message: "Failed to generate preview" }]);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      void executePreview();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [xmlValue]);

  function handleAstChange(newXml: string) {
    setXmlValue(newXml);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">pom playground</span>
          <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs font-medium">
            beta
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors disabled:opacity-50"
            onClick={() => void executePreview()}
            disabled={isLoading}
          >
            <RefreshCw className="size-4" />
            <span>Refresh</span>
          </button>
          <button
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors disabled:opacity-50"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
          >
            <Download className="size-4" />
            <span>Download</span>
          </button>
          <div className="bg-border mx-1 h-5 w-px" />
          <a
            href="/playground"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors"
          >
            <BookOpen className="size-4" />
            <span>Playground</span>
          </a>
          <a
            href="https://github.com/hirokisakabe/pom"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors"
          >
            <ExternalLink className="size-4" />
            <span>pom</span>
          </a>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 p-4">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            AST Editor
          </div>
          <div className="border-border min-h-0 flex-1 overflow-hidden rounded-md border bg-white">
            <PomAstEditor xml={xmlValue} onChange={handleAstChange} />
          </div>
          <div className="text-muted-foreground text-xs">
            ノードをドラッグして並び替えると XML が更新されます
          </div>
        </div>
        <SlidePreview
          svgs={svgs}
          isLoading={isLoading}
          errors={errors}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
