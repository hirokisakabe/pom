import type { GradientFill } from "../../types.ts";

/**
 * GradientFill を pptxgenjs パッチ形式の fill オブジェクトに変換する
 */
export function toGradientFillProps(gradient: GradientFill): {
  type: "gradient";
  stops: Array<{ position: number; color: string }>;
  linearAngle: number;
} {
  return {
    type: "gradient" as const,
    stops: gradient.stops.map((s) => ({
      position: s.position,
      color: s.color.replace("#", ""),
    })),
    linearAngle: gradient.angle ?? 0,
  };
}
