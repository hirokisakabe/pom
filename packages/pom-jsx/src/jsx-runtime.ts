export interface PomJsxElement {
  type: string;
  props: Record<string, unknown>;
}

type ComponentFn = (props: Record<string, unknown>) => PomJsxElement;
type JsxType = string | ComponentFn;

function createElement(
  type: JsxType,
  props: Record<string, unknown>,
  _key?: string,
): PomJsxElement {
  if (typeof type === "function") {
    return type(props);
  }
  return { type, props };
}

export { createElement as jsx, createElement as jsxs, createElement as jsxDEV };

export function Fragment(props: Record<string, unknown>): PomJsxElement {
  return {
    type: "__Fragment__",
    props,
  };
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export type Element = PomJsxElement;
  export interface IntrinsicElements {
    [elemName: string]: unknown;
  }
  export interface IntrinsicAttributes {
    key?: string | number | null;
  }
  export interface ElementAttributesProperty {
    props: object;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
