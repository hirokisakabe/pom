/**
 * JSX parser for POM nodes
 *
 * Parses JSX strings into POMNode arrays. Designed for LLM output parsing
 * where JSX is more token-efficient and natural than JSON.
 *
 * @example
 * ```typescript
 * import { parseJsx, buildPptx } from "@hirokisakabe/pom";
 *
 * const jsx = `
 *   <VStack gap={16} padding={32}>
 *     <Text fontPx={32} bold>売上レポート</Text>
 *     <HStack gap={16}>
 *       <Chart chartType="bar" w={400} h={300}
 *         data={[{ name: "Q1", labels: ["1月","2月","3月"], values: [100,120,90] }]}
 *       />
 *       <Text fontPx={18} color="00AA00">前年比 +15%</Text>
 *     </HStack>
 *   </VStack>
 * `;
 *
 * const nodes = parseJsx(jsx);
 * const pptx = await buildPptx(nodes, { w: 1280, h: 720 });
 * ```
 */

import { parse, type ParseResult } from "@babel/parser";
import type {
  Expression,
  File,
  JSXElement,
  JSXFragment,
  JSXText,
  JSXExpressionContainer,
  JSXSpreadChild,
  SpreadElement,
  JSXAttribute,
  JSXOpeningElement,
  TemplateLiteral,
} from "@babel/types";
import type { POMNode } from "./types.ts";

type JSXChild =
  | JSXElement
  | JSXFragment
  | JSXText
  | JSXExpressionContainer
  | JSXSpreadChild;

/** Map of JSX component names to POM node types */
const COMPONENT_TYPE_MAP: Record<string, POMNode["type"]> = {
  VStack: "vstack",
  HStack: "hstack",
  Box: "box",
  Text: "text",
  Image: "image",
  Table: "table",
  Shape: "shape",
  Chart: "chart",
  Timeline: "timeline",
  Matrix: "matrix",
  Tree: "tree",
  Flow: "flow",
  ProcessArrow: "processArrow",
  Line: "line",
  Layer: "layer",
};

/** Container types that have children */
const CONTAINER_TYPES = new Set(["vstack", "hstack", "box", "layer"]);

/**
 * Evaluate a Babel AST expression node into a JavaScript value.
 * Supports literals, arrays, objects, unary expressions, and template literals.
 * Does NOT use eval() for security.
 */
function evaluateExpression(node: Expression | SpreadElement): unknown {
  switch (node.type) {
    case "StringLiteral":
      return node.value;
    case "NumericLiteral":
      return node.value;
    case "BooleanLiteral":
      return node.value;
    case "NullLiteral":
      return null;
    case "UnaryExpression":
      if (node.operator === "-" && node.argument.type === "NumericLiteral") {
        return -node.argument.value;
      }
      if (node.operator === "+" && node.argument.type === "NumericLiteral") {
        return node.argument.value;
      }
      throw new ParseJsxError(
        `Unsupported unary operator: ${node.operator}`,
        node.loc?.start.line,
        node.loc?.start.column,
      );
    case "ArrayExpression":
      return node.elements.map((el) => {
        if (el === null) return null;
        if (el.type === "SpreadElement") {
          throw new ParseJsxError(
            "Spread elements are not supported in arrays",
            el.loc?.start.line,
            el.loc?.start.column,
          );
        }
        return evaluateExpression(el);
      });
    case "ObjectExpression": {
      const obj: Record<string, unknown> = {};
      for (const prop of node.properties) {
        if (prop.type === "SpreadElement") {
          throw new ParseJsxError(
            "Spread elements are not supported in objects",
            prop.loc?.start.line,
            prop.loc?.start.column,
          );
        }
        if (prop.type === "ObjectMethod") {
          throw new ParseJsxError(
            "Object methods are not supported",
            prop.loc?.start.line,
            prop.loc?.start.column,
          );
        }
        // ObjectProperty
        let key: string;
        if (prop.key.type === "Identifier") {
          key = prop.key.name;
        } else if (prop.key.type === "StringLiteral") {
          key = prop.key.value;
        } else {
          throw new ParseJsxError(
            `Unsupported object key type: ${prop.key.type}`,
            prop.key.loc?.start.line,
            prop.key.loc?.start.column,
          );
        }
        obj[key] = evaluateExpression(prop.value as Expression);
      }
      return obj;
    }
    case "TemplateLiteral":
      return evaluateTemplateLiteral(node);
    default:
      throw new ParseJsxError(
        `Unsupported expression type: ${node.type}`,
        node.loc?.start.line,
        node.loc?.start.column,
      );
  }
}

function evaluateTemplateLiteral(node: TemplateLiteral): string {
  if (node.expressions.length > 0) {
    throw new ParseJsxError(
      "Template literals with expressions are not supported",
      node.loc?.start.line,
      node.loc?.start.column,
    );
  }
  return node.quasis.map((q) => q.value.cooked ?? q.value.raw).join("");
}

/**
 * Extract the component name from a JSX opening element.
 */
function getComponentName(opening: JSXOpeningElement): string {
  if (opening.name.type === "JSXIdentifier") {
    return opening.name.name;
  }
  throw new ParseJsxError(
    `Unsupported JSX element name type: ${opening.name.type}`,
    opening.loc?.start.line,
    opening.loc?.start.column,
  );
}

/**
 * Extract props from JSX attributes.
 */
function extractProps(
  attributes: JSXOpeningElement["attributes"],
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const attr of attributes) {
    if (attr.type === "JSXSpreadAttribute") {
      throw new ParseJsxError(
        "JSX spread attributes are not supported",
        attr.loc?.start.line,
        attr.loc?.start.column,
      );
    }

    const jsxAttr: JSXAttribute = attr;
    const name =
      jsxAttr.name.type === "JSXIdentifier"
        ? jsxAttr.name.name
        : jsxAttr.name.name.name;

    if (jsxAttr.value === null || jsxAttr.value === undefined) {
      // Bare attribute: <Text bold> → bold: true
      props[name] = true;
    } else if (jsxAttr.value.type === "StringLiteral") {
      props[name] = jsxAttr.value.value;
    } else if (jsxAttr.value.type === "JSXExpressionContainer") {
      props[name] = evaluateExpression(jsxAttr.value.expression as Expression);
    }
  }

  return props;
}

/**
 * Extract text content from JSX children (for Text nodes).
 */
function extractTextContent(children: JSXChild[]): string {
  const parts: string[] = [];
  for (const child of children) {
    if (child.type === "JSXText") {
      const raw = child.value;
      if (raw.includes("\n")) {
        // Multi-line: collapse newlines/indentation, then trim (formatting whitespace)
        const text = raw.replace(/\s*\n\s*/g, " ").trim();
        if (text !== "") {
          parts.push(text);
        }
      } else {
        // Single-line: preserve inline spaces as-is (e.g., "Hello " between text and expression)
        if (raw.trim() !== "") {
          parts.push(raw);
        }
      }
    } else if (child.type === "JSXExpressionContainer") {
      const value = evaluateExpression(child.expression as Expression);
      parts.push(
        value === null || value === undefined
          ? ""
          : `${value as string | number | boolean}`,
      );
    }
  }
  return parts.join("");
}

/**
 * Convert a JSX element AST node into a POMNode.
 */
function jsxElementToNode(element: JSXElement): POMNode {
  const componentName = getComponentName(element.openingElement);
  const type = COMPONENT_TYPE_MAP[componentName];

  if (!type) {
    throw new ParseJsxError(
      `Unknown component: <${componentName}>. Supported components: ${Object.keys(COMPONENT_TYPE_MAP).join(", ")}`,
      element.loc?.start.line,
      element.loc?.start.column,
    );
  }

  const props = extractProps(element.openingElement.attributes);

  if (type === "text") {
    // For Text nodes, children become the "text" property
    const textContent = extractTextContent(element.children);
    if (textContent && !props.text) {
      props.text = textContent;
    }
    return { type, ...props } as unknown as POMNode;
  }

  if (CONTAINER_TYPES.has(type)) {
    // For container types, convert JSX children to POMNode children
    const childNodes = convertChildren(element.children);

    if (type === "box") {
      if (childNodes.length !== 1) {
        throw new ParseJsxError(
          `<Box> must have exactly one child element, got ${childNodes.length}`,
          element.loc?.start.line,
          element.loc?.start.column,
        );
      }
      return { type, ...props, children: childNodes[0] } as unknown as POMNode;
    }

    return {
      type,
      ...props,
      children: childNodes,
    } as unknown as POMNode;
  }

  // Leaf nodes (no children processing needed)
  return { type, ...props } as unknown as POMNode;
}

/**
 * Convert JSX children array to POMNode array, filtering out whitespace text.
 */
function convertChildren(children: JSXChild[]): POMNode[] {
  const nodes: POMNode[] = [];
  for (const child of children) {
    if (child.type === "JSXElement") {
      nodes.push(jsxElementToNode(child));
    } else if (child.type === "JSXFragment") {
      // Flatten fragment children
      nodes.push(...convertChildren(child.children));
    } else if (child.type === "JSXText") {
      // Whitespace between elements is expected; non-whitespace text is an error
      if (child.value.trim() !== "") {
        throw new ParseJsxError(
          "Text content is not allowed as a direct child of layout containers. Wrap it in <Text>.",
          child.loc?.start.line,
          child.loc?.start.column,
        );
      }
    } else if (child.type === "JSXExpressionContainer") {
      throw new ParseJsxError(
        "Expression children are not supported in layout containers. Use props or wrap in <Text>.",
        child.loc?.start.line,
        child.loc?.start.column,
      );
    }
  }
  return nodes;
}

/**
 * Custom error class for JSX parsing errors.
 */
export class ParseJsxError extends Error {
  readonly line?: number;
  readonly column?: number;

  constructor(message: string, line?: number, column?: number) {
    const location =
      line !== undefined ? ` (line ${line}, column ${column ?? 0})` : "";
    super(`${message}${location}`);
    this.name = "ParseJsxError";
    this.line = line;
    this.column = column;
  }
}

/**
 * Parse a JSX string into an array of POMNode.
 *
 * Supports all POM node types as JSX components:
 * - Layout: `<VStack>`, `<HStack>`, `<Box>`, `<Layer>`
 * - Content: `<Text>`, `<Image>`, `<Table>`, `<Shape>`, `<Chart>`
 * - Composite: `<Timeline>`, `<Matrix>`, `<Tree>`, `<Flow>`, `<ProcessArrow>`
 * - Drawing: `<Line>`
 *
 * @param jsx - JSX string to parse
 * @returns Array of POMNode
 * @throws {ParseJsxError} If the JSX is invalid or contains unsupported syntax
 *
 * @example
 * ```typescript
 * // Single node
 * const nodes = parseJsx('<Text fontPx={24} bold>Hello</Text>');
 * // → [{ type: "text", text: "Hello", fontPx: 24, bold: true }]
 *
 * // Multiple nodes
 * const nodes = parseJsx(`
 *   <Text>Title</Text>
 *   <Image src="logo.png" w={200} h={100} />
 * `);
 *
 * // Nested layout
 * const nodes = parseJsx(`
 *   <VStack gap={16}>
 *     <Text fontPx={32}>Title</Text>
 *     <HStack gap={8}>
 *       <Text>Left</Text>
 *       <Text>Right</Text>
 *     </HStack>
 *   </VStack>
 * `);
 * ```
 */
export function parseJsx(jsx: string): POMNode[] {
  // Wrap in a fragment to support multiple root elements
  const wrapped = `<>${jsx}</>`;

  let ast: ParseResult<File>;
  try {
    ast = parse(wrapped, {
      sourceType: "module",
      plugins: ["jsx"],
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      const loc = (e as Error & { loc?: { line: number; column: number } }).loc;
      throw new ParseJsxError(
        `JSX parse error: ${e.message}`,
        loc?.line,
        loc?.column,
      );
    }
    throw new ParseJsxError("JSX parse error: unknown error");
  }

  // The AST should contain a single ExpressionStatement with JSXFragment
  const body = ast.program.body;
  if (body.length !== 1 || body[0].type !== "ExpressionStatement") {
    throw new ParseJsxError("Expected JSX content");
  }

  const expr = body[0].expression;
  if (expr.type !== "JSXFragment") {
    throw new ParseJsxError("Expected JSX content");
  }

  return convertChildren(expr.children);
}
