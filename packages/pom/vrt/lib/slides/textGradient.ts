import { palette } from "./palette.js";

// ============================================================
// Page 52: Text Gradient Test
// テスト対象: textGradient - 角度、方向キーワード、3 色以上、
//             位置省略、Span / B 等 inline run 上書き、
//             暗色背景上での明色グラデーション、Theme トークン参照
// ============================================================
export const page52TextGradientXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 52: Text Gradient Test</Text>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">angle variations:</Text>
    <HStack gap="16" alignItems="center">
      <VStack w="180" gap="4" alignItems="center">
        <Text fontSize="32" bold="true" textGradient="linear-gradient(0deg, #1D4ED8 0%, #38BDF8 100%)">Aa1</Text>
        <Text fontSize="12">0deg</Text>
      </VStack>
      <VStack w="180" gap="4" alignItems="center">
        <Text fontSize="32" bold="true" textGradient="linear-gradient(45deg, #1D4ED8 0%, #38BDF8 100%)">Aa1</Text>
        <Text fontSize="12">45deg</Text>
      </VStack>
      <VStack w="180" gap="4" alignItems="center">
        <Text fontSize="32" bold="true" textGradient="linear-gradient(90deg, #1D4ED8 0%, #38BDF8 100%)">Aa1</Text>
        <Text fontSize="12">90deg</Text>
      </VStack>
      <VStack w="180" gap="4" alignItems="center">
        <Text fontSize="32" bold="true" textGradient="linear-gradient(180deg, #1D4ED8 0%, #38BDF8 100%)">Aa1</Text>
        <Text fontSize="12">180deg</Text>
      </VStack>
      <VStack w="180" gap="4" alignItems="center">
        <Text fontSize="32" bold="true" textGradient="linear-gradient(to right, #1D4ED8, #38BDF8)">Aa1</Text>
        <Text fontSize="12">to right</Text>
      </VStack>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">multi-stop / position variations:</Text>
    <Text fontSize="32" bold="true" textGradient="linear-gradient(90deg, #DC2626 0%, #FACC15 50%, #16A34A 100%)">three stops with positions</Text>
    <Text fontSize="32" bold="true" textGradient="linear-gradient(90deg, #667EEA, #764BA2, #F093FB, #F5576C)">four stops auto position</Text>
  </VStack>
  <VStack padding="16" backgroundColor="${palette.navy}" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true" color="FFFFFF">on dark background:</Text>
    <HStack gap="24" alignItems="center">
      <Text fontSize="56" bold="true" textGradient="linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)">Headline</Text>
      <Text fontSize="56" bold="true" textGradient="linear-gradient(135deg, #F472B6, #FB923C)">¥84.2M</Text>
    </HStack>
  </VStack>
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">with inline runs (Span / B) — gradient overrides all run colors:</Text>
    <Text fontSize="32" bold="true" textGradient="linear-gradient(90deg, #11998E, #38EF7D)">Mixed <Span color="FF0000">runs</Span> and <B>bold</B></Text>
  </VStack>
</VStack>
`;
