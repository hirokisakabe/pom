import type { POMNode } from "../types.ts";
import type { NodeDefinition } from "./types.ts";

type NodeType = POMNode["type"];

const registry = new Map<NodeType, NodeDefinition>();
const tagToType = new Map<string, NodeType>();

export function registerNode(def: NodeDefinition): void {
  if (registry.has(def.type)) {
    throw new Error(`Duplicate node registration: ${def.type}`);
  }
  if (tagToType.has(def.tagName)) {
    throw new Error(`Duplicate node tag registration: ${def.tagName}`);
  }
  registry.set(def.type, def);
  tagToType.set(def.tagName, def.type);
}

export function getNodeDef(type: NodeType): NodeDefinition {
  const def = registry.get(type);
  if (!def) throw new Error(`Unknown node type: ${type}`);
  return def;
}

export function getNodeDefByTag(tagName: string): NodeDefinition | undefined {
  const type = tagToType.get(tagName);
  return type ? getNodeDef(type) : undefined;
}

export function getTagName(type: NodeType): string {
  return getNodeDef(type).tagName;
}

export function getAllNodeDefs(): NodeDefinition[] {
  return [...registry.values()];
}
