---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: Text / Shape / Image / Icon に rotate 属性を追加

`Text` / `Shape` / `Image` / `Icon` ノードで `rotate` 属性を指定できるようになりました。値は時計回りの度数で、PowerPoint への描画時に pptxgenjs の `rotate` option として渡されます。

回転はレイアウト計算後の描画時にのみ適用されます。Yoga layout は非回転時のバウンディングボックスで計算するため、回転しても兄弟要素の配置や親サイズには影響しません。

```xml
<Text rotate="12">Rotated label</Text>
<Shape shapeType="rect" w="120" h="60" rotate="-15" />
<Image src="sample_images/sample_0.png" w="160" h="100" rotate="8" />
<Icon name="cpu" rotate="45" />
```
