import { palette } from "./palette.js";

// ============================================================
// Page 50: Shape / Icon Effects Test (glow / outline)
// テスト対象: Shape glow / outline, Icon glow / outline (variant 時の背景図形)
// ============================================================
export const page50ShapeIconEffectsXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 50: Shape / Icon Effects Test (glow / outline)</Text>
  <!-- Shape glow variations -->
  <VStack padding="16" backgroundColor="${palette.navy}" gap="12">
    <Text fontSize="14" bold="true" color="FFFFFF">Shape glow:</Text>
    <HStack gap="32" alignItems="center">
      <Shape shapeType="ellipse" w="48" h="48" fill.color="${palette.accent}" glow.size="12" glow.opacity="0.8" glow.color="${palette.accent}" />
      <Shape shapeType="ellipse" w="48" h="48" fill.color="${palette.red}" glow.size="20" glow.opacity="0.6" glow.color="${palette.red}" />
      <Shape shapeType="roundRect" w="120" h="48" fill.color="${palette.blue}" glow.size="8" glow.opacity="0.7" glow.color="${palette.lightBlue}" />
      <Shape shapeType="ellipse" w="48" h="48" fill.color="FFFFFF" glow.size="10" />
    </HStack>
  </VStack>
  <!-- Shape outline variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">Shape outline (line と等価):</Text>
    <HStack gap="32" alignItems="center">
      <Shape shapeType="rect" w="100" h="50" outline.size="2" outline.color="${palette.blue}" />
      <Shape shapeType="ellipse" w="80" h="50" outline.size="3" outline.color="${palette.red}" />
      <Shape shapeType="roundRect" w="120" h="50" fill.color="${palette.lightBlue}" outline.size="4" outline.color="${palette.navy}" />
    </HStack>
  </VStack>
  <!-- Shape glow + outline / text -->
  <VStack padding="16" backgroundColor="${palette.charcoal}" gap="12">
    <Text fontSize="14" bold="true" color="FFFFFF">Shape glow + outline + text:</Text>
    <HStack gap="32" alignItems="center">
      <Shape shapeType="ellipse" w="120" h="60" fontSize="14" color="FFFFFF" bold="true" fill.color="${palette.blue}" outline.size="2" outline.color="FFFFFF" glow.size="10" glow.opacity="0.7" glow.color="${palette.accent}">Combined</Shape>
      <Shape shapeType="roundRect" w="160" h="60" fontSize="14" color="${palette.charcoal}" bold="true" fill.color="FFFFFF" outline.size="3" outline.color="${palette.accent}" glow.size="14" glow.color="${palette.accent}">Outline + Glow</Shape>
    </HStack>
  </VStack>
  <!-- Icon variant + glow / outline -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">Icon variant + glow / outline (背景図形にのみ適用):</Text>
    <HStack gap="32" alignItems="center">
      <Icon name="star" size="24" variant="circle-filled" bgColor="${palette.accent}" glow.size="12" glow.opacity="0.7" glow.color="${palette.accent}" />
      <Icon name="heart" size="24" variant="circle-filled" bgColor="${palette.blue}" glow.size="10" glow.color="${palette.lightBlue}" />
      <Icon name="shield" size="24" variant="circle-outlined" color="${palette.charcoal}" outline.size="3" outline.color="${palette.red}" />
      <Icon name="zap" size="24" variant="square-filled" bgColor="${palette.red}" glow.size="14" glow.opacity="0.6" glow.color="${palette.red}" />
    </HStack>
  </VStack>
</VStack>
`;
