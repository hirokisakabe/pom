import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PomEditorDiagnostic } from "./PomEditor.tsx";
import { SlidePreview } from "./SlidePreview.tsx";

afterEach(cleanup);

const defaultProps = {
  svgs: [],
  isLoading: false,
  diagnostics: null,
  currentPage: 1,
  onPageChange: vi.fn(),
};

describe("SlidePreview", () => {
  it("loadingとempty stateを表示する", () => {
    const { rerender } = render(
      <SlidePreview {...defaultProps} isLoading={true} />,
    );
    expect(screen.getByText("Generating preview...")).toBeTruthy();

    rerender(<SlidePreview {...defaultProps} />);
    expect(screen.getByText("Edit XML to see a preview")).toBeTruthy();
  });

  it("diagnosticsを表示し、行情報がある項目をbuttonで通知する", () => {
    const diagnostics: PomEditorDiagnostic[] = [
      { type: "xml_syntax", message: "Tag is not closed", line: 3 },
      { type: "schema", message: "Invalid attribute" },
    ];
    const onDiagnosticClick = vi.fn();
    render(
      <SlidePreview
        {...defaultProps}
        diagnostics={diagnostics}
        onDiagnosticClick={onDiagnosticClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Tag is not closed/ }));
    expect(onDiagnosticClick).toHaveBeenCalledWith(0);
    expect(
      screen
        .getByRole("button", { name: /Invalid attribute/ })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("SVGをsanitizeして表示とcopy callbackへ渡す", () => {
    const onCopyPreview = vi.fn();
    render(
      <SlidePreview
        {...defaultProps}
        svgs={[
          '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><text>Slide</text></svg>',
        ]}
        onCopyPreview={onCopyPreview}
      />,
    );

    const preview = screen.getByTestId("pom-slide-preview");
    expect(preview.innerHTML).toContain("Slide");
    expect(preview.innerHTML).not.toContain("onload");
    fireEvent.click(screen.getByRole("button", { name: "Copy as image" }));
    const copiedSvg = onCopyPreview.mock.calls.at(-1)?.[0] as
      string | undefined;
    expect(copiedSvg).not.toContain("onload");
  });

  it("複数slideをpage移動し、範囲外のpageを補正する", () => {
    const onPageChange = vi.fn();
    const svgs = [
      '<svg xmlns="http://www.w3.org/2000/svg"><text>Slide 1</text></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg"><text>Slide 2</text></svg>',
    ];
    render(
      <SlidePreview
        {...defaultProps}
        svgs={svgs}
        currentPage={99}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("2 / 2")).toBeTruthy();
    expect(screen.getByText("Slide 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
