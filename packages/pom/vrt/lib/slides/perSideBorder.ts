import { palette } from "./palette.js";

// ============================================================
// Page 44: Per-Side Border Test
// テスト対象: borderTop / borderRight / borderBottom / borderLeft
// ============================================================
export const page44PerSideBorderXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 44: Per-Side Border Test</Text>
  <!-- 単独の辺指定 -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
    <Text fontSize="14" bold="true">Single side:</Text>
    <HStack gap="16" alignItems="stretch">
      <Text w="200" h="60" padding="12" backgroundColor="${palette.background}" borderLeft.color="${palette.blue}" borderLeft.width="6" fontSize="12">borderLeft (accent bar)</Text>
      <Text w="200" h="60" padding="12" borderBottom.color="${palette.red}" borderBottom.width="3" fontSize="12">borderBottom (underline)</Text>
      <Text w="200" h="60" padding="12" borderTop.color="${palette.green}" borderTop.width="4" borderTop.dashType="dash" fontSize="12">borderTop (dash)</Text>
      <Text w="200" h="60" padding="12" borderRight.color="${palette.navy}" borderRight.width="2" fontSize="12">borderRight</Text>
    </HStack>
  </VStack>
  <!-- 一律 border との併用 (辺ごとの指定が優先) -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
    <Text fontSize="14" bold="true">Combined with uniform border:</Text>
    <HStack gap="16" alignItems="stretch">
      <Text w="280" h="60" padding="12" border.color="${palette.border}" border.width="1" borderLeft.color="${palette.accent}" borderLeft.width="6" fontSize="12">border + borderLeft override</Text>
      <Text w="280" h="60" padding="12" border.color="${palette.navy}" border.width="2" borderBottom.width="6" fontSize="12">border + borderBottom width only</Text>
    </HStack>
  </VStack>
  <!-- 複数辺の組み合わせと背景色 -->
  <VStack padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
    <Text fontSize="14" bold="true">Multiple sides + background:</Text>
    <HStack gap="16" alignItems="stretch">
      <Text w="280" h="60" padding="12" backgroundColor="${palette.background}" borderTop.color="${palette.blue}" borderTop.width="4" borderBottom.color="${palette.blue}" borderBottom.width="4" fontSize="12">top + bottom</Text>
      <VStack w="280" h="60" padding="12" backgroundColor="${palette.background}" borderLeft.color="${palette.red}" borderLeft.width="4" borderRight.color="${palette.green}" borderRight.width="4">
        <Text fontSize="12">VStack left + right</Text>
      </VStack>
    </HStack>
  </VStack>
</VStack>
`;
