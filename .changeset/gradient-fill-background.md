---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: `backgroundGradient` 属性でリニアグラデーション背景を指定できるようになりました

CSS 風の `linear-gradient()` 構文（角度または `to <方向>` キーワード + 2 色以上のカラーストップ）をすべてのノードの背景塗りとして指定できます。生成される PPTX には DrawingML ネイティブの `<a:gradFill>` として出力されるため、PowerPoint 上で編集可能です。ルートノードに指定した場合はスライド背景に適用されます。

```xml
<VStack backgroundGradient="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)">
  <Text color="FFFFFF">Hello</Text>
</VStack>
```
