import { palette } from "./palette.js";

// ============================================================
// Page 53: Background Radial Gradient Test
// テスト対象: backgroundGradient の radial-gradient 構文
//             - 形状省略 (default ellipse)、circle / ellipse
//             - 中心位置 (default / at center / at top right / at 25% 75%)
//             - 3 色以上のカラーストップ
//             - borderRadius / border / opacity 併用
//             - ルートノード (スライド背景) への適用は別経路のため、
//               linear 版 (page41) と棲み分けて Container 内ケースのみを集める
// ============================================================
export const page53RadialGradientXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="F8FAFC">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 53: Background Radial Gradient Test</Text>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">shape / size 省略 (default):</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(#1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">defaults</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">circle</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(ellipse, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">ellipse</Text>
      </VStack>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">at &lt;position&gt; variations:</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at center, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">at center</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at top right, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">at top right</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at bottom left, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">at bottom left</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at 25% 75%, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">at 25% 75%</Text>
      </VStack>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">multi-stop / size keywords:</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="180" h="100" backgroundGradient="radial-gradient(circle at center, #DC2626 0%, #FACC15 50%, #16A34A 100%)" text=""></Text>
        <Text fontSize="12">3 stops</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="180" h="100" backgroundGradient="radial-gradient(circle at center, #667EEA, #764BA2, #F093FB, #F5576C)" text=""></Text>
        <Text fontSize="12">4 stops (auto pos)</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="180" h="100" backgroundGradient="radial-gradient(circle closest-side at center, #1D4ED8, #38BDF8)" text=""></Text>
        <Text fontSize="12">closest-side</Text>
      </VStack>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">combined with other props:</Text>
    <HStack gap="16" alignItems="center">
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at center, #11998E, #38EF7D)" borderRadius="16" text=""></Text>
        <Text fontSize="12">borderRadius</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at center, #11998E, #38EF7D)" border.color="${palette.navy}" border.width="2" text=""></Text>
        <Text fontSize="12">border</Text>
      </VStack>
      <VStack gap="4" alignItems="center">
        <Text w="160" h="100" backgroundGradient="radial-gradient(circle at center, #11998E, #38EF7D)" opacity="0.4" text=""></Text>
        <Text fontSize="12">opacity 0.4</Text>
      </VStack>
      <VStack w="220" h="100" padding="12" backgroundGradient="radial-gradient(circle at top left, #2563EB, #7C3AED)" borderRadius="12" justifyContent="center">
        <Text fontSize="14" color="FFFFFF" bold="true">text on radial</Text>
      </VStack>
    </HStack>
  </VStack>
</VStack>
`;
