import { describe, it, expect } from "vitest";
import { resolveLength, toTRBL, measureTextPx, absolutize } from "./layout";
import type { Positioned } from "./types";

describe("resolveLength", () => {
  it("px数値をそのまま返す", () => {
    expect(resolveLength(100, 500)).toBe(100);
  });

  it('"max"は親サイズを返す', () => {
    expect(resolveLength("max", 500)).toBe(500);
  });

  it("パーセント指定を解決する", () => {
    expect(resolveLength("50%", 500)).toBe(250);
    expect(resolveLength("25%", 400)).toBe(100);
    expect(resolveLength("10%", 1000)).toBe(100);
  });

  it("undefinedは親サイズを返す", () => {
    expect(resolveLength(undefined, 500)).toBe(500);
  });
});

describe("toTRBL", () => {
  it("undefinedは全て0を返す", () => {
    expect(toTRBL()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("数値は全方向に適用する", () => {
    expect(toTRBL(10)).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
  });

  it("部分指定は残りを0で埋める", () => {
    expect(toTRBL({ top: 5, left: 10 })).toEqual({
      top: 5,
      right: 0,
      bottom: 0,
      left: 10,
    });
  });

  it("全ての値を指定できる", () => {
    expect(toTRBL({ top: 1, right: 2, bottom: 3, left: 4 })).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
  });
});

describe("measureTextPx", () => {
  const CHAR_WIDTH_RATIO = 0.6;
  const LINE_HEIGHT_RATIO = 1.2;

  it("1行テキストのサイズを計算する", () => {
    const result = measureTextPx("Hello", 24);
    expect(result.w).toBe(24 * CHAR_WIDTH_RATIO * 5); // 5文字
    expect(result.h).toBe(24 * LINE_HEIGHT_RATIO); // デフォルト行高
  });

  it("改行を含むテキストの行数を計算する", () => {
    const result = measureTextPx("A\nB\nC", 24);
    expect(result.h).toBe(24 * LINE_HEIGHT_RATIO * 3); // 3行
  });

  it("空文字列は最小1行として扱う", () => {
    const result = measureTextPx("", 24);
    expect(result.w).toBe(0);
    expect(result.h).toBe(24 * LINE_HEIGHT_RATIO); // 1行分
  });

  it("幅制限時に折り返しを計算する", () => {
    // 1文字あたり14.4px（24 * 0.6）
    // maxW=30の場合、2文字で折り返し
    const result = measureTextPx("AAAA", 24, 30);
    expect(result.w).toBeLessThanOrEqual(30);
    expect(result.h).toBeGreaterThan(24 * LINE_HEIGHT_RATIO); // 複数行になる
  });

  it("カスタム行高を使用できる", () => {
    const result = measureTextPx("A", 24, undefined, 48);
    expect(result.h).toBe(48); // カスタム行高
  });
});

describe("absolutize", () => {
  it("オフセットなしでも座標を更新する", () => {
    const node: Positioned = {
      type: "text",
      node: {} as any,
      x: 10,
      y: 20,
      w: 100,
      h: 50,
    };
    absolutize(node, 0, 0);
    expect(node.x).toBe(10);
    expect(node.y).toBe(20);
  });

  it("オフセットを加算する", () => {
    const node: Positioned = {
      type: "text",
      node: {} as any,
      x: 10,
      y: 20,
      w: 100,
      h: 50,
    };
    absolutize(node, 100, 200);
    expect(node.x).toBe(110);
    expect(node.y).toBe(220);
  });

  it("子要素にも再帰的にオフセットを加算する", () => {
    const child: Positioned = {
      type: "text",
      node: {} as any,
      x: 5,
      y: 10,
      w: 50,
      h: 25,
    };
    const parent: Positioned = {
      type: "vstack",
      node: {} as any,
      x: 10,
      y: 20,
      w: 100,
      h: 50,
      children: [child],
    };
    absolutize(parent, 100, 200);
    expect(parent.x).toBe(110);
    expect(parent.y).toBe(220);
    // 子は親の絶対座標を基準に加算される
    expect(child.x).toBe(115); // 5 + 110
    expect(child.y).toBe(230); // 10 + 220
  });

  it("ネストした子要素にも正しく適用される", () => {
    const grandchild: Positioned = {
      type: "text",
      node: {} as any,
      x: 2,
      y: 3,
      w: 20,
      h: 10,
    };
    const child: Positioned = {
      type: "vstack",
      node: {} as any,
      x: 5,
      y: 10,
      w: 50,
      h: 25,
      children: [grandchild],
    };
    const parent: Positioned = {
      type: "vstack",
      node: {} as any,
      x: 10,
      y: 20,
      w: 100,
      h: 50,
      children: [child],
    };
    absolutize(parent, 0, 0);
    expect(parent.x).toBe(10);
    expect(parent.y).toBe(20);
    expect(child.x).toBe(15); // 5 + 10
    expect(child.y).toBe(30); // 10 + 20
    expect(grandchild.x).toBe(17); // 2 + 15
    expect(grandchild.y).toBe(33); // 3 + 30
  });
});
