import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PomAstEditor } from "./PomAstEditor.tsx";

afterEach(cleanup);

describe("PomAstEditor", () => {
  it("Text の inline edit を XML に反映する", () => {
    const onChange = vi.fn();
    render(
      <PomAstEditor
        xml="<Slide><Text>Original</Text></Slide>"
        onChange={onChange}
        onRequestXmlMode={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Text: Original" }));
    const input = screen.getByRole("textbox", { name: "Text を編集" });
    fireEvent.change(input, { target: { value: "Edited" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(
      '<Slide>\n  <Text text="Edited" />\n</Slide>',
    );
  });

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
