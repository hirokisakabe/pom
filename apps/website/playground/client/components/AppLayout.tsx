"use client";

import type {
  PomEditorDiagnostic,
  PomEditorPreviewResult,
} from "@hirokisakabe/pom-editor";
import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/playground/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/playground/components/ui/dropdown-menu";

import { copySvgAsPng } from "../lib/copySvgAsPng";
import { downloadPptx } from "../lib/downloadPptx";
import { honoClient } from "../lib/honoClient";
import type { SampleTemplate } from "../lib/sampleTemplates";
import { DEFAULT_TEMPLATE, SAMPLE_TEMPLATES } from "../lib/sampleTemplates";

const PomEditor = dynamic(
  () => import("@hirokisakabe/pom-editor").then((module) => module.PomEditor),
  { ssr: false },
);

const navigationLinkClass =
  "text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors";

export function AppLayout() {
  const [xmlValue, setXmlValue] = useState(DEFAULT_TEMPLATE.xml);
  const [pendingTemplate, setPendingTemplate] = useState<SampleTemplate | null>(
    null,
  );

  const generatePreview = useCallback(
    async (
      xml: string,
      { signal }: { signal: AbortSignal },
    ): Promise<PomEditorPreviewResult> => {
      const response = await honoClient.api.preview.$post(
        { json: { xml } },
        { init: { signal } },
      );
      return (await response.json()) as
        { svgs: string[] } | { errors: PomEditorDiagnostic[] };
    },
    [],
  );

  function handleSelectTemplate(template: SampleTemplate) {
    if (xmlValue === template.xml) return;
    if (xmlValue.trim() !== "") {
      setPendingTemplate(template);
    } else {
      setXmlValue(template.xml);
    }
  }

  function handleConfirmTemplate() {
    if (!pendingTemplate) return;
    setXmlValue(pendingTemplate.xml);
    setPendingTemplate(null);
  }

  const toolbarStart = (
    <>
      <span className="mr-2 text-lg font-semibold">pom playground</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={navigationLinkClass}>
            <ChevronDown className="size-4" />
            <span>Samples</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {SAMPLE_TEMPLATES.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
            >
              {template.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const toolbarEnd = (
    <>
      <a href="/" className={navigationLinkClass}>
        <BookOpen className="size-4" />
        <span>Docs</span>
      </a>
      <a
        href="/nodes"
        target="_blank"
        rel="noopener noreferrer"
        className={navigationLinkClass}
      >
        <BookOpen className="size-4" />
        <span>XML Reference</span>
      </a>
      <a
        href="https://github.com/hirokisakabe/pom"
        target="_blank"
        rel="noopener noreferrer"
        title="XML to PPTX conversion library"
        className={navigationLinkClass}
      >
        <ExternalLink className="size-4" />
        <span>pom</span>
      </a>
      <a
        href="https://github.com/hirokisakabe/pptx-glimpse"
        target="_blank"
        rel="noopener noreferrer"
        title="PPTX to SVG conversion library"
        className={navigationLinkClass}
      >
        <ExternalLink className="size-4" />
        <span>pptx-glimpse</span>
      </a>
    </>
  );

  return (
    <div className="flex h-screen flex-col">
      <PomEditor
        xml={xmlValue}
        onChange={setXmlValue}
        onPreview={generatePreview}
        onDownload={downloadPptx}
        onCopyPreview={copySvgAsPng}
        toolbarStart={toolbarStart}
        toolbarEnd={toolbarEnd}
      />
      <AlertDialog
        open={pendingTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTemplate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace with sample?</AlertDialogTitle>
            <AlertDialogDescription>
              Current editor content will be lost. Replace with sample template?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTemplate}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
