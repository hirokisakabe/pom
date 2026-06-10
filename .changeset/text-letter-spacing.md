---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: Text ノードと runs（`<Span>`）に letterSpacing 属性を追加。px で指定し、PPTX 出力時に pt（pptxgenjs の charSpacing）へ変換する。テキスト幅計測も字間を考慮するためレイアウトがはみ出さない。
