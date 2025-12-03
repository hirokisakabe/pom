import { describe, expect, it } from "vitest";
import { createTextOptions } from "./textOptions";
import { pxToIn, pxToPt } from "./units";

describe("createTextOptions", () => {
  it("指定した色と配置をオプションに反映する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 12,
      y: 34,
      w: 200,
      h: 100,
      fontPx: 32,
      color: "FF00FF",
      alignText: "center",
    });

    expect(options.x).toBe(pxToIn(12));
    expect(options.y).toBe(pxToIn(34));
    expect(options.w).toBe(pxToIn(200));
    expect(options.h).toBe(pxToIn(100));
    expect(options.fontSize).toBe(pxToPt(32));
    expect(options.align).toBe("center");
    expect(options.color).toBe("FF00FF");
  });

  it("色や配置が指定されない場合のデフォルト値を設定する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
    });

    expect(options.fontSize).toBe(pxToPt(24));
    expect(options.align).toBe("left");
    expect(options.color).toBeUndefined();
  });
});
