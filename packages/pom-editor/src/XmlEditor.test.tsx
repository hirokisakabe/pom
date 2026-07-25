import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { XmlEditor } from "./XmlEditor.tsx";

afterEach(cleanup);

describe("XmlEditor", () => {
  it("外部value同期ではonChangeを通知しない", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <XmlEditor
        value="<Text>first</Text>"
        onChange={onChange}
        diagnostics={null}
        onViewReady={vi.fn()}
      />,
    );

    rerender(
      <XmlEditor
        value="<Text>second</Text>"
        onChange={onChange}
        diagnostics={null}
        onViewReady={vi.fn()}
      />,
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
