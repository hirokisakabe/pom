# @hirokisakabe/pom-jsx

## 0.2.0

### Minor Changes

- [#806](https://github.com/hirokisakabe/pom/pull/806) [`cc7a6c4`](https://github.com/hirokisakabe/pom/commit/cc7a6c40c05ebe789b9782032206db7afbb3e13e) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `grow` 属性で flex-grow 比率レイアウトを指定できるようになりました

  すべてのノードに `grow` 属性（正の数値）を指定でき、VStack / HStack 内の兄弟ノード間で余白が `grow` の比率どおりに配分されます（CSS の `flex-grow` 相当）。「左 2 : 右 1 の 2 カラム」のような比率レイアウトを `%` 計算なしで記述できます。

  既存の `w="max"` / `h="max"` は従来どおり `grow="1"` 相当として動作し、`grow` と同時指定された場合は `grow` が優先されます。

  ```xml
  <HStack w="max" h="max" gap="16">
    <VStack grow="2">…</VStack>
    <VStack grow="1">…</VStack>
  </HStack>
  ```

- [#805](https://github.com/hirokisakabe/pom/pull/805) [`106bb60`](https://github.com/hirokisakabe/pom/commit/106bb60742d602ff2d784688587043f0c5aedf85) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `backgroundGradient` 属性でリニアグラデーション背景を指定できるようになりました

  CSS 風の `linear-gradient()` 構文（角度または `to <方向>` キーワード + 2 色以上のカラーストップ）をすべてのノードの背景塗りとして指定できます。生成される PPTX には DrawingML ネイティブの `<a:gradFill>` として出力されるため、PowerPoint 上で編集可能です。ルートノードに指定した場合はスライド背景に適用されます。

  ```xml
  <VStack backgroundGradient="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)">
    <Text color="FFFFFF">Hello</Text>
  </VStack>
  ```

- [#803](https://github.com/hirokisakabe/pom/pull/803) [`74edfb6`](https://github.com/hirokisakabe/pom/commit/74edfb662685a59fe20f89ab6de0d6412e6ccdf3) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Text ノードと runs（`<Span>`）に letterSpacing 属性を追加。px で指定し、PPTX 出力時に pt（pptxgenjs の charSpacing）へ変換する。テキスト幅計測も字間を考慮するためレイアウトがはみ出さない。
