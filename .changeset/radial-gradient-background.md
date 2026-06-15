---
"@hirokisakabe/pom": minor
---

`backgroundGradient` 属性で CSS の `radial-gradient(<shape>? <size>? at <position>?, <stops>)` 構文をサポート。pptxgenjs は radial fill を未サポートのため、既存 `linear-gradient` と同様に出力 PPTX の slide XML を後処理で書き換え、DrawingML ネイティブの `<a:gradFill>` + `<a:path path="circle">` + `<a:fillToRect>` を生成する。

- 形状 (`circle` / `ellipse`、省略時 `ellipse`) と size キーワード (`closest-side` / `closest-corner` / `farthest-side` / `farthest-corner`、省略時 `farthest-corner`) は構文として受け付けるが、PowerPoint の radial fill は `path="circle"` 1 種類で shape / size を描画上区別しない。要素の縦横比に応じた `farthest-corner` 相当の楕円扱いで出力される。
- 中心位置は `at <position>` (キーワード / `%`) で指定可能。`fillToRect` の `l` / `t` / `r` / `b` に変換される。省略時は `at center`。
- `textGradient` は radial を受け付けない (linear-gradient のみ)。
- 既存の `linear-gradient` 構文の出力 XML は変化しない (後方互換)。
