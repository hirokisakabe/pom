import { palette } from "./palette.js";

// ============================================================
// Page 40: Background Gradient Test
// テスト対象: backgroundGradient - 角度、方向キーワード、3色以上、
//             位置省略、borderRadius/border 併用、opacity 併用、
//             ルートノード指定 (スライド背景経路)
// ============================================================
export const page40GradientXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundGradient="linear-gradient(180deg, #F8FAFC 0%, #DBEAFE 100%)">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 40: Background Gradient Test</Text>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">angle variations:</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(0deg, #1D4ED8 0%, #38BDF8 100%)" text=""></Text>
        <Text fontSize="12">0deg</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(45deg, #1D4ED8 0%, #38BDF8 100%)" text=""></Text>
        <Text fontSize="12">45deg</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(90deg, #1D4ED8 0%, #38BDF8 100%)" text=""></Text>
        <Text fontSize="12">90deg</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(180deg, #1D4ED8 0%, #38BDF8 100%)" text=""></Text>
        <Text fontSize="12">180deg</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(to right, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">to right</Text>
      </VStack>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">multi-stop / position variations:</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="180" h="60" backgroundGradient="linear-gradient(90deg, #DC2626 0%, #FACC15 50%, #16A34A 100%)" text=""></Text>
        <Text fontSize="12">3 stops</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="180" h="60" backgroundGradient="linear-gradient(90deg, #667EEA, #764BA2, #F093FB, #F5576C)" text=""></Text>
        <Text fontSize="12">4 stops (auto pos)</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="180" h="60" backgroundGradient="linear-gradient(90deg, #0F172A 0%, #0F172A 50%, #0EA5E9 51%, #0EA5E9 100%)" text=""></Text>
        <Text fontSize="12">hard stop</Text>
      </VStack>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">combined with other props:</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(135deg, #11998E, #38EF7D)" borderRadius="16" text=""></Text>
        <Text fontSize="12">borderRadius</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(135deg, #11998E, #38EF7D)" border.color="${palette.navy}" border.width="2" text=""></Text>
        <Text fontSize="12">border</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="140" h="60" backgroundGradient="linear-gradient(135deg, #11998E, #38EF7D)" opacity="0.4" text=""></Text>
        <Text fontSize="12">opacity 0.4</Text>
      </VStack>
      <VStack w="200" h="80" padding="12" backgroundGradient="linear-gradient(120deg, #2563EB, #7C3AED)" borderRadius="12" justifyContent="center">
        <Text fontSize="14" color="FFFFFF" bold="true">text on gradient</Text>
      </VStack>
    </HStack>
  </VStack>
</VStack>
`;
