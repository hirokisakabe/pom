---
"@hirokisakabe/pom": major
"@hirokisakabe/pom-md": major
---

最上位 XML 要素を `<Slide>` で必須ラップする形式に変更（破壊的変更）。

## 変更内容

- `parseXml` の最上位要素は `<Slide>` のみ許容。それ以外を直下に置くとエラー
- 各 `<Slide>` が 1 つのスライドを表し、その子要素がスライドのルートとなる
- `<Slide>` は属性なしの最小実装。子要素が複数ある場合は暗黙的に VStack でラップされる
- pom-md の出力も `<Slide>` ラップ形式に統一

## 移行ガイド

Before:

```xml
<VStack w="100%" h="max" padding="48">
  <Text fontSize="32" bold="true">Slide 1</Text>
</VStack>
<VStack w="100%" h="max" padding="48">
  <Text fontSize="32" bold="true">Slide 2</Text>
</VStack>
```

After:

```xml
<Slide>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Slide 1</Text>
  </VStack>
</Slide>
<Slide>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Slide 2</Text>
  </VStack>
</Slide>
```

各スライドのコンテンツを `<Slide>...</Slide>` で囲んでください。属性は受け付けません（背景色や notes などの per-slide 属性は別 issue で順次対応予定）。
