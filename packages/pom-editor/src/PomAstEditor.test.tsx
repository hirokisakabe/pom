import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PomAstEditor } from "./PomAstEditor.tsx";

afterEach(cleanup);

describe("PomAstEditor", () => {
  it("parse不能時にerrorとXML modeへ戻る導線を表示する", () => {
    const onRequestXmlMode = vi.fn();
    render(
      <PomAstEditor
        xml="<Slide><"
        onChange={vi.fn()}
        onRequestXmlMode={onRequestXmlMode}
      />,
    );

    expect(screen.getByText(/XML validation failed/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open XML editor" }));

    expect(onRequestXmlMode).toHaveBeenCalledOnce();
  });
});
