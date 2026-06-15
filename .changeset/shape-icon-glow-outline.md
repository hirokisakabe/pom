---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

`<Shape>` および `<Icon>` ノードに `glow` / `outline` 属性を追加しました。Text の `glow` / `outline` (#798) と同じ書式 (`glow.size="8" glow.opacity="0.5" glow.color="..."` / `outline.size="2" outline.color="..."`) で指定でき、生成 PPTX 上では PowerPoint ネイティブの shape effect として描画されます (画像化されないため PowerPoint 上で編集可能)。Shape では新規 `outline` は既存 `line` 属性のエイリアスとして振る舞い、両方指定時は `outline` が `line.color` / `line.width` を上書きします (`line.dashType` は引き継ぎ)。Icon では `variant` 指定時の背景図形にのみ glow / outline が適用されます (PNG ベースのアイコン本体は対象外)。`pom-jsx` 側にも対応する `glow` / `outline` prop を追加しました。
