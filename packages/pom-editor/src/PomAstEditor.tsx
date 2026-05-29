"use client";

import React, { useEffect, useState } from "react";
import { parseXml, serializeXml } from "@hirokisakabe/pom/clientApi";
import type { POMNode } from "@hirokisakabe/pom/clientApi";
import { AstTree } from "./AstTree.tsx";
import { buildAst } from "./ast.ts";
import type { AstNode } from "./ast.ts";

export interface PomAstEditorProps {
  xml: string;
  onChange: (xml: string) => void;
}

export function PomAstEditor({ xml, onChange }: PomAstEditorProps) {
  const [ast, setAst] = useState<AstNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const nodes = parseXml(xml);
      const counter = { value: 0 };
      setAst(buildAst(nodes, "root", counter));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "XML parse error");
    }
  }, [xml]);

  function handleChange(nodes: POMNode[]) {
    const counter = { value: 0 };
    const newAst = buildAst(nodes, "root", counter);
    setAst(newAst);
    onChange(serializeXml(nodes));
  }

  if (error) {
    return (
      <div
        style={{
          padding: "12px",
          fontSize: "12px",
          color: "#dc2626",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {error}
      </div>
    );
  }

  if (ast.length === 0) {
    return (
      <div
        style={{
          padding: "12px",
          fontSize: "13px",
          color: "#9ca3af",
        }}
      >
        No nodes
      </div>
    );
  }

  return (
    <div style={{ overflow: "auto", height: "100%", padding: "8px" }}>
      <AstTree ast={ast} onChange={handleChange} />
    </div>
  );
}
