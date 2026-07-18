import { describe, expect, it } from "vitest";
import { buildPptx } from "./index.ts";
import {
  CUSTOM_FONT_BOLD,
  CUSTOM_FONT_REGULAR,
} from "./testFixtures/customFont.ts";

describe("buildPptx custom fonts in a browser", () => {
  it("public API accepts ArrayBuffer and Uint8Array font data", async () => {
    expect(window.document).toBeDefined();

    const { pptx, diagnostics } = await buildPptx(
      `<Slide><VStack gap="4">
        <Text fontFamily="Custom Fixture">Browser regular</Text>
        <Text fontFamily="Custom Fixture" bold="true">Browser bold</Text>
      </VStack></Slide>`,
      { w: 1280, h: 720 },
      {
        autoFit: false,
        fonts: [CUSTOM_FONT_REGULAR, CUSTOM_FONT_BOLD],
      },
    );
    const output = await pptx.write({ outputType: "arraybuffer" });

    expect(diagnostics).toEqual([]);
    expect(output).toBeInstanceOf(ArrayBuffer);
    expect(output.byteLength).toBeGreaterThan(0);
  });
});
