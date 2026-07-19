import { useEffect, useRef, useState } from "react";
import { PomEditor } from "@hirokisakabe/pom-editor";
import {
  generatePreview,
  loadDocument,
  saveDocument,
  type PreviewDocument,
} from "./api.ts";

const filenameStyle = {
  overflow: "hidden",
  color: "#4b5563",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

export function App() {
  const [document, setDocument] = useState<PreviewDocument | null>(null);
  const [xml, setXml] = useState("");
  const [savedXml, setSavedXml] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [externalChange, setExternalChange] = useState(false);
  const xmlRef = useRef("");
  const savedXmlRef = useRef("");
  const eventGenerationRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    loadDocument(controller.signal)
      .then((loaded) => {
        setDocument(loaded);
        setXml(loaded.xml);
        setSavedXml(loaded.xml);
        xmlRef.current = loaded.xml;
        savedXmlRef.current = loaded.xml;
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : String(error));
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!document || typeof EventSource === "undefined") return;
    const source = new EventSource("/_events");
    source.addEventListener("document", (event) => {
      eventGenerationRef.current += 1;
      let updated: PreviewDocument | { error: string };
      try {
        updated = JSON.parse((event as MessageEvent<string>).data) as
          PreviewDocument | { error: string };
      } catch {
        setExternalChange(true);
        return;
      }
      if ("error" in updated) {
        setExternalChange(true);
        return;
      }
      if (xmlRef.current !== savedXmlRef.current) {
        setExternalChange(true);
        return;
      }
      xmlRef.current = updated.xml;
      savedXmlRef.current = updated.xml;
      setXml(updated.xml);
      setSavedXml(updated.xml);
      setDocument(updated);
      setExternalChange(false);
    });
    return () => source.close();
  }, [document?.filename]);

  if (loadError) {
    return <div role="alert">{loadError}</div>;
  }
  if (!document) {
    return <div>Loading editor...</div>;
  }

  const isDirty = xml !== savedXml;
  return (
    <PomEditor
      xml={xml}
      onChange={(value) => {
        xmlRef.current = value;
        setXml(value);
      }}
      onPreview={(value, { signal }) => generatePreview(value, signal)}
      onSave={
        document.editable
          ? async (value) => {
              const eventGeneration = eventGenerationRef.current;
              const revision = await saveDocument(value, document.revision);
              savedXmlRef.current = value;
              setSavedXml(value);
              setDocument((current) =>
                current ? { ...current, revision } : current,
              );
              if (eventGenerationRef.current === eventGeneration) {
                setExternalChange(false);
              }
            }
          : undefined
      }
      toolbarStart={
        <span style={filenameStyle} title={document.filename}>
          {document.filename}
        </span>
      }
      toolbarEnd={
        <span
          role="status"
          style={{
            color: externalChange ? "#b45309" : isDirty ? "#2563eb" : "#6b7280",
            fontSize: 12,
          }}
        >
          {externalChange
            ? "External changes detected — Save will be blocked"
            : isDirty
              ? "Unsaved changes"
              : document.editable
                ? "Saved"
                : "Preview only (.pom.md)"}
        </span>
      }
      style={{ height: "100vh", background: "#fff" }}
    />
  );
}
