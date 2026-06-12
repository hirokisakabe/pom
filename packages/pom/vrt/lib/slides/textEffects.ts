import { palette } from "./palette.js";

// ============================================================
// Page 44: Text Effects Test (glow / outline)
// テスト対象: Text glow, Text outline, glow + outline 併用, runs との併用
// ============================================================
export const page44TextEffectsXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 44: Text Effects Test (glow / outline)</Text>
  <!-- glow variations -->
  <VStack padding="16" backgroundColor="${palette.navy}" gap="8">
    <Text fontSize="14" bold="true" color="FFFFFF">glow:</Text>
    <Text fontSize="28" bold="true" color="FFFFFF" glow.size="8" glow.opacity="0.75" glow.color="${palette.accent}">Glow size 8 / opacity 0.75</Text>
    <Text fontSize="28" bold="true" color="FFFFFF" glow.size="16" glow.opacity="0.5" glow.color="${palette.red}">Glow size 16 / opacity 0.5</Text>
    <Text fontSize="28" bold="true" color="${palette.accent}" glow.size="10">Glow defaults (white)</Text>
  </VStack>
  <!-- outline variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">outline:</Text>
    <Text fontSize="32" bold="true" color="FFFFFF" outline.size="2" outline.color="${palette.blue}">Outline 2px blue</Text>
    <Text fontSize="32" bold="true" color="${palette.lightBlue}" outline.size="1" outline.color="${palette.navy}">Outline 1px navy</Text>
  </VStack>
  <!-- glow + outline combined -->
  <VStack padding="16" backgroundColor="${palette.charcoal}" gap="8">
    <Text fontSize="14" bold="true" color="FFFFFF">glow + outline:</Text>
    <Text fontSize="36" bold="true" color="${palette.blue}" outline.size="2" outline.color="FFFFFF" glow.size="12" glow.opacity="0.8" glow.color="${palette.accent}">Combined Effects</Text>
  </VStack>
  <!-- inline runs with node-level effects -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">runs との併用 (ノード単位の効果が各 run に適用):</Text>
    <Text fontSize="24" color="${palette.charcoal}" glow.size="8" glow.color="${palette.accent}">通常 <B>太字</B> <Span color="${palette.red}">色付き</Span></Text>
  </VStack>
</VStack>
`;
