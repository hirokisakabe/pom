// ============================================================
// Page 43: Dark Theme Test
// テスト対象: Theme トークン宣言 + $name 参照、ダーク背景上での
// 複合ノードのテキスト色制御 (Timeline / Matrix / Tree / Flow)
// ============================================================

// Theme はトップレベル要素のため、<Slide> ラップの外側で文書先頭に挿入する
export const vrtThemeXml = `
<Theme surface="0F172A" surfaceAlt="1E293B" textMain="F8FAFC" textMuted="94A3B8" accent="38BDF8" warn="FACC15" green="34D399" />
`;

export const page43DarkThemeXml = `
<VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch" backgroundColor="$surface">
  <Text fontSize="28" color="$textMain" bold="true">Page 43: Dark Theme Test</Text>
  <VStack padding="12" backgroundColor="$surfaceAlt" borderRadius="8" gap="8">
    <Text fontSize="14" color="$textMuted" bold="true">Timeline (dateColor / titleColor / descriptionColor):</Text>
    <Timeline direction="horizontal" w="1100" h="120" dateColor="$textMuted" titleColor="$textMain" descriptionColor="$textMuted">
      <TimelineItem date="2026/Q1" title="Phase 1" description="基盤構築" color="$accent" />
      <TimelineItem date="2026/Q2" title="Phase 2" description="機能開発" color="$green" />
      <TimelineItem date="2026/Q3" title="Phase 3" description="リリース" color="$warn" />
    </Timeline>
  </VStack>
  <HStack gap="16" alignItems="stretch">
    <VStack w="33%" padding="12" backgroundColor="$surfaceAlt" borderRadius="8" gap="8">
      <Text fontSize="14" color="$textMuted" bold="true">Matrix (label colors):</Text>
      <Matrix w="340" h="280" axisLabelColor="$textMuted" quadrantLabelColor="$textMuted" itemLabelColor="$textMain">
        <MatrixAxes x="Cost" y="Impact" />
        <MatrixQuadrants topLeft="Quick Wins" topRight="Strategic" bottomLeft="Low Priority" bottomRight="Avoid" />
        <MatrixItem label="Plan A" x="0.25" y="0.75" color="$accent" />
        <MatrixItem label="Plan B" x="0.7" y="0.55" color="$green" />
        <MatrixItem label="Plan C" x="0.6" y="0.25" color="$warn" textColor="$warn" />
      </Matrix>
    </VStack>
    <VStack w="33%" padding="12" backgroundColor="$surfaceAlt" borderRadius="8" gap="8">
      <Text fontSize="14" color="$textMuted" bold="true">Tree (textColor):</Text>
      <Tree layout="vertical" nodeShape="roundRect" w="340" h="280" textColor="$surface" connectorStyle.color="$textMuted">
        <TreeItem label="Root" color="$accent">
          <TreeItem label="Left" color="$green" />
          <TreeItem label="Right" color="$textMuted" textColor="$textMain" />
        </TreeItem>
      </Tree>
    </VStack>
    <VStack w="33%" padding="12" backgroundColor="$surfaceAlt" borderRadius="8" gap="8">
      <Text fontSize="14" color="$textMuted" bold="true">Flow (connection labelColor):</Text>
      <Flow direction="vertical" w="340" h="280" connectorStyle.color="$textMuted" connectorStyle.labelColor="$textMuted">
        <FlowNode id="start" shape="flowChartTerminator" text="Start" color="$accent" textColor="$surface" />
        <FlowNode id="check" shape="flowChartDecision" text="OK?" color="$warn" textColor="$surface" />
        <FlowNode id="end" shape="flowChartTerminator" text="End" color="$green" textColor="$surface" />
        <FlowConnection from="start" to="check" label="run" />
        <FlowConnection from="check" to="end" label="yes" labelColor="$warn" />
      </Flow>
    </VStack>
  </HStack>
</VStack>
`;
