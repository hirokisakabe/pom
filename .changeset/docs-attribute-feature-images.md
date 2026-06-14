---
"@hirokisakabe/pom": patch
---

属性レベル新機能 (Theme tokens / backgroundGradient / per-side border / text glow・outline / letterSpacing / leaf rotation / sub-sup / grow) と styling-guide.md の inline formatting / underline styles / highlight / shadow / opacity / layer overlay / combining styles について、`packages/pom/docs/images/attr-*.png` のビジュアル例を追加しました。`packages/pom/scripts/docs-images/` の生成基盤を `ATTRIBUTE_DEMOS` で属性デモ単位の XML サンプル (`sampleAttributes.ts`) を扱えるよう拡張し、`pnpm run docs:images:docker:update` と `pnpm run docs:images:vrt:docker` でノード画像と同じワークフローに乗せています。`nodes.md` / `styling-guide.md` から各画像を参照しています。
