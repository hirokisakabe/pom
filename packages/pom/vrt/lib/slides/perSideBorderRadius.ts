import { palette } from "./palette.js";

// ============================================================
// Page 54: Per-Side Border × borderRadius Test
// テスト対象: borderTop / borderRight / borderBottom / borderLeft と
// borderRadius の併用 (#881)
// 角弧は水平辺 (top / bottom) のみが所有することを確認する
// ============================================================
export const page54PerSideBorderRadiusXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 54: Per-Side Border × borderRadius</Text>
  <!-- KPI タイル想定: borderTop + borderRadius + 背景色 -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' borderRadius="8" gap="8">
    <Text fontSize="14" bold="true">borderTop + borderRadius (KPI tile)</Text>
    <HStack gap="16" alignItems="stretch">
      <VStack w="200" h="80" padding="12" backgroundColor="FFFFFF" borderRadius="12" borderTop.color="${palette.blue}" borderTop.width="6">
        <Text fontSize="11" color="${palette.charcoal}">REVENUE</Text>
        <Text fontSize="20" color="${palette.navy}" bold="true">$42.5K</Text>
      </VStack>
      <VStack w="200" h="80" padding="12" backgroundColor="FFFFFF" borderRadius="12" borderTop.color="${palette.red}" borderTop.width="6">
        <Text fontSize="11" color="${palette.charcoal}">CHURN</Text>
        <Text fontSize="20" color="${palette.navy}" bold="true">3.2%</Text>
      </VStack>
      <VStack w="200" h="80" padding="12" backgroundColor="FFFFFF" borderRadius="12" borderTop.color="${palette.green}" borderTop.width="6">
        <Text fontSize="11" color="${palette.charcoal}">RETENTION</Text>
        <Text fontSize="20" color="${palette.navy}" bold="true">96.8%</Text>
      </VStack>
    </HStack>
  </VStack>
  <!-- borderLeft + borderRadius (左端アクセント) -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' borderRadius="8" gap="8">
    <Text fontSize="14" bold="true">borderLeft + borderRadius (accent bar)</Text>
    <HStack gap="16" alignItems="stretch">
      <Text w="280" h="60" padding="12" backgroundColor="${palette.lightBlue}" borderRadius="8" borderLeft.color="${palette.blue}" borderLeft.width="6" fontSize="12">Highlighted card</Text>
      <Text w="280" h="60" padding="12" backgroundColor="${palette.background}" borderRadius="8" borderLeft.color="${palette.accent}" borderLeft.width="4" borderLeft.dashType="dash" fontSize="12">Dashed accent</Text>
    </HStack>
  </VStack>
  <!-- 上下 + borderRadius (header/footer line) -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' borderRadius="8" gap="8">
    <Text fontSize="14" bold="true">borderTop + borderBottom + borderRadius</Text>
    <Text w="600" h="60" padding="12" backgroundColor="FFFFFF" borderRadius="12" borderTop.color="${palette.navy}" borderTop.width="3" borderBottom.color="${palette.navy}" borderBottom.width="3" fontSize="12">Card with top + bottom rule</Text>
  </VStack>
  <!-- 4 辺すべて (それぞれ別色) + borderRadius -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' borderRadius="8" gap="8">
    <Text fontSize="14" bold="true">All 4 sides (different colors) + borderRadius</Text>
    <Text w="600" h="60" padding="12" backgroundColor="FFFFFF" borderRadius="16"
      borderTop.color="${palette.blue}" borderTop.width="3"
      borderRight.color="${palette.green}" borderRight.width="3"
      borderBottom.color="${palette.red}" borderBottom.width="3"
      borderLeft.color="${palette.accent}" borderLeft.width="3"
      fontSize="12">Rainbow border (top=blue, right=green, bottom=red, left=cyan)</Text>
  </VStack>
</VStack>
`;
