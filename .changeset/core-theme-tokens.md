---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: テーマ機構を導入 — 複合ノードのテキスト色制御 + `<Theme>` デザイントークン参照

**複合ノードのテキスト色制御**: 内部テキスト色が固定だった複合ノードに、既存の `textColor` と命名・挙動を揃えた色属性を追加しました（optional / `#` 任意 / 未指定時は従来色で後方互換）。

- `Timeline`: `dateColor` / `titleColor` / `descriptionColor`
- `Matrix`: `axisLabelColor` / `quadrantLabelColor` / `itemLabelColor` + `<MatrixItem textColor>`
- `Tree`: `textColor` + `<TreeItem textColor>`
- `Flow`: `connectorStyle.labelColor` + `<FlowConnection labelColor>`

**デザイントークン参照**: トップレベル `<Theme>` 要素で配色トークンを 1 箇所宣言し、各ノードの色属性から `$name` で参照できるようになりました。参照は `parseXml` 時に解決され、未知トークンは "did you mean" つきの `ParseXmlError` になります。

```xml
<Theme surface="0F172A" accent="38BDF8" textMain="F8FAFC" textMuted="94A3B8" />
<Slide>
  <VStack w="100%" h="max" padding="48" backgroundColor="$surface">
    <Timeline dateColor="$textMuted" titleColor="$textMain" w="1000" h="120">
      <TimelineItem date="Q1" title="Phase 1" color="$accent" />
    </Timeline>
  </VStack>
</Slide>
```

これによりダーク背景でも `Timeline` 等の全テキストが視認できるようになり、パレットの hex 値を全ノードに繰り返し書く必要がなくなります。
