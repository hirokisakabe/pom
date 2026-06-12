---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: Text ノードに glow / outline 文字効果を追加

`Text` ノードで `glow`（光彩）と `outline`（文字の輪郭線）を指定できるようになりました。背景画像の上に置くタイトル文字など、視認性と装飾性を両立したいケースで使えます。どちらも PowerPoint のネイティブ文字効果として出力されるため、生成後も PowerPoint 上で編集できます（画像化しません）。

- `glow`: `size`（px、デフォルト 8）/ `opacity`（0–1、デフォルト 0.75）/ `color`（hex、デフォルト `FFFFFF`）
- `outline`: `size`（px、デフォルト 1）/ `color`（hex、デフォルト `FFFFFF`）
- ドット記法・JSON shorthand の両方に対応。インライン整形（`<B>` / `<Span>` など）併用時はノード単位の効果が全 run に適用されます。

```xml
<Text fontSize="40" bold="true" color="FFFFFF" glow.size="8" glow.opacity="0.5" glow.color="1D4ED8">Glowing title</Text>
<Text fontSize="40" bold="true" color="FFFFFF" outline.size="2" outline.color="0F172A">Outlined title</Text>
```
