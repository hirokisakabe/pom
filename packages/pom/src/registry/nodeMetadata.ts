import {
  arrowNodeSchema,
  chartNodeSchema,
  flowNodeSchema,
  hStackNodeSchema,
  iconNodeSchema,
  imageNodeSchema,
  layerNodeSchema,
  lineNodeSchema,
  matrixNodeSchema,
  olNodeSchema,
  processArrowNodeSchema,
  pyramidNodeSchema,
  shapeNodeSchema,
  svgNodeSchema,
  tableNodeSchema,
  textNodeSchema,
  timelineNodeSchema,
  treeNodeSchema,
  ulNodeSchema,
  vStackNodeSchema,
  type POMNode,
} from "../types.ts";
import type { ChildPolicy, NodeCategory, NodeDefinition } from "./types.ts";

export type NodeMetadata = Pick<
  NodeDefinition,
  | "type"
  | "tagName"
  | "category"
  | "schema"
  | "defaults"
  | "childPolicy"
  | "textContentProperty"
>;

const none: ChildPolicy = { kind: "none" };
const pomChildren: ChildPolicy = { kind: "pom-children" };

function leaf(
  type: POMNode["type"],
  tagName: string,
  schema: NodeDefinition["schema"],
  options: Partial<
    Pick<NodeMetadata, "defaults" | "childPolicy" | "textContentProperty">
  > = {},
): NodeMetadata {
  return {
    type,
    tagName,
    category: "leaf",
    schema,
    childPolicy: none,
    ...options,
  };
}

function container(
  type: POMNode["type"],
  tagName: string,
  category: Extract<NodeCategory, "multi-child" | "absolute-child">,
  schema: NodeDefinition["schema"],
): NodeMetadata {
  return {
    type,
    tagName,
    category,
    schema,
    childPolicy: pomChildren,
  };
}

export const NODE_METADATA = [
  leaf("text", "Text", textNodeSchema, {
    defaults: {
      fontSize: 24,
      fontFamily: "Noto Sans JP",
      lineHeight: 1.3,
    },
    childPolicy: { kind: "custom" },
    textContentProperty: "text",
  }),
  leaf("ul", "Ul", ulNodeSchema, {
    defaults: {
      fontSize: 24,
      fontFamily: "Noto Sans JP",
      lineHeight: 1.3,
    },
    childPolicy: { kind: "custom", optionalProperties: ["items"] },
  }),
  leaf("ol", "Ol", olNodeSchema, {
    defaults: {
      fontSize: 24,
      fontFamily: "Noto Sans JP",
      lineHeight: 1.3,
    },
    childPolicy: { kind: "custom", optionalProperties: ["items"] },
  }),
  leaf("image", "Image", imageNodeSchema),
  leaf("table", "Table", tableNodeSchema, {
    childPolicy: {
      kind: "custom",
      optionalProperties: ["columns", "rows"],
    },
  }),
  container("vstack", "VStack", "multi-child", vStackNodeSchema),
  container("hstack", "HStack", "multi-child", hStackNodeSchema),
  leaf("shape", "Shape", shapeNodeSchema, {
    defaults: {
      fontSize: 24,
      fontFamily: "Noto Sans JP",
      lineHeight: 1.3,
    },
    textContentProperty: "text",
  }),
  leaf("chart", "Chart", chartNodeSchema, {
    childPolicy: { kind: "custom", optionalProperties: ["data"] },
  }),
  leaf("timeline", "Timeline", timelineNodeSchema, {
    childPolicy: { kind: "custom", optionalProperties: ["items"] },
  }),
  leaf("matrix", "Matrix", matrixNodeSchema, {
    childPolicy: {
      kind: "custom",
      optionalProperties: ["axes", "items", "quadrants"],
    },
  }),
  leaf("tree", "Tree", treeNodeSchema, {
    childPolicy: { kind: "custom", optionalProperties: ["data"] },
  }),
  leaf("flow", "Flow", flowNodeSchema, {
    childPolicy: {
      kind: "custom",
      optionalProperties: ["nodes", "connections"],
    },
  }),
  leaf("processArrow", "ProcessArrow", processArrowNodeSchema, {
    childPolicy: { kind: "custom", optionalProperties: ["steps"] },
  }),
  leaf("pyramid", "Pyramid", pyramidNodeSchema, {
    childPolicy: { kind: "custom", optionalProperties: ["levels"] },
  }),
  leaf("line", "Line", lineNodeSchema),
  leaf("arrow", "Arrow", arrowNodeSchema),
  container("layer", "Layer", "absolute-child", layerNodeSchema),
  leaf("icon", "Icon", iconNodeSchema, {
    defaults: {
      size: 24,
      color: "#000000",
    },
  }),
  leaf("svg", "Svg", svgNodeSchema, {
    defaults: {
      w: 24,
      h: 24,
    },
    childPolicy: {
      kind: "custom",
      optionalProperties: ["svgContent"],
    },
  }),
] as const satisfies readonly NodeMetadata[];

const metadataByType = new Map<POMNode["type"], NodeMetadata>(
  NODE_METADATA.map((metadata) => [metadata.type, metadata]),
);
const metadataByTag = new Map<string, NodeMetadata>(
  NODE_METADATA.map((metadata) => [metadata.tagName, metadata]),
);

export function getNodeMetadata(type: POMNode["type"]): NodeMetadata {
  const metadata = metadataByType.get(type);
  if (!metadata) throw new Error(`Unknown node type: ${type}`);
  return metadata;
}

export function getNodeMetadataByTag(
  tagName: string,
): NodeMetadata | undefined {
  return metadataByTag.get(tagName);
}
