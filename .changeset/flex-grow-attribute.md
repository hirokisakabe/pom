---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: `grow` 属性で flex-grow 比率レイアウトを指定できるようになりました

すべてのノードに `grow` 属性（正の数値）を指定でき、VStack / HStack 内の兄弟ノード間で余白が `grow` の比率どおりに配分されます（CSS の `flex-grow` 相当）。「左 2 : 右 1 の 2 カラム」のような比率レイアウトを `%` 計算なしで記述できます。

既存の `w="max"` / `h="max"` は従来どおり `grow="1"` 相当として動作し、`grow` と同時指定された場合は `grow` が優先されます。

```xml
<HStack w="max" h="max" gap="16">
  <VStack grow="2">…</VStack>
  <VStack grow="1">…</VStack>
</HStack>
```
