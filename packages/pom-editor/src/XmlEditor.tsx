"use client";

import { xml } from "@codemirror/lang-xml";
import type { Diagnostic } from "@codemirror/lint";
import { lintGutter, setDiagnostics } from "@codemirror/lint";
import { Annotation, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";

import type { PomEditorDiagnostic } from "./PomEditor.tsx";

const externalValueUpdate = Annotation.define<boolean>();

function errorTypeToSeverity(type: string): Diagnostic["severity"] {
  switch (type) {
    case "xml_syntax":
    case "schema":
      return "error";
    case "structure":
      return "warning";
    default:
      return "info";
  }
}

interface XmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  diagnostics: PomEditorDiagnostic[] | null;
  onViewReady: (view: EditorView) => void;
}

export function XmlEditor({
  value,
  onChange,
  diagnostics,
  onViewReady,
}: XmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onViewReadyRef = useRef(onViewReady);

  useEffect(() => {
    onChangeRef.current = onChange;
    onViewReadyRef.current = onViewReady;
  }, [onChange, onViewReady]);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        xml(),
        lintGutter(),
        EditorView.updateListener.of((update) => {
          const isExternalUpdate = update.transactions.some((transaction) =>
            transaction.annotation(externalValueUpdate),
          );
          if (update.docChanged && !isExternalUpdate) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    onViewReadyRef.current(view);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
        annotations: externalValueUpdate.of(true),
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const cmDiagnostics: Diagnostic[] = (diagnostics ?? []).flatMap(
      (diagnostic) => {
        if (!diagnostic.line) return [];
        const line = view.state.doc.line(
          Math.min(diagnostic.line, view.state.doc.lines),
        );
        return [
          {
            from: line.from,
            to: line.to,
            severity: errorTypeToSeverity(diagnostic.type),
            message: diagnostic.message,
          },
        ];
      },
    );
    view.dispatch(setDiagnostics(view.state, cmDiagnostics));
  }, [diagnostics]);

  return (
    <div
      ref={editorRef}
      data-testid="pom-xml-editor"
      style={{
        height: "100%",
        overflow: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
      }}
    />
  );
}
