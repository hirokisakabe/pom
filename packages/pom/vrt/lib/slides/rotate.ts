import { palette } from "./palette.js";

// ============================================================
// Page 46: Rotate Test
// テスト対象: Text / Shape / Image / Icon の rotate 属性
// ============================================================
export const page46RotateXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 46: Rotate Attribute</Text>
  <Text fontSize="13" color="${palette.charcoal}">rotate is applied at render time only; layout boxes stay unrotated.</Text>
  <HStack gap="28" alignItems="start">
    <VStack w="250" padding="16" gap="14" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="14" bold="true">Text rotate=12</Text>
      <Shape shapeType="rect" w="160" h="80" fill.color="F8FAFC" line.color="${palette.border}" line.width="1" />
      <Text w="160" h="80" fontSize="24" bold="true" color="${palette.blue}" textAlign="center" rotate="12">Rotated Text</Text>
    </VStack>
    <VStack w="250" padding="16" gap="14" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="14" bold="true">Shape rotate=25</Text>
      <Shape shapeType="roundRect" w="160" h="80" fill.color="${palette.green}" line.color="${palette.charcoal}" line.width="2" color="FFFFFF" bold="true" rotate="25">Shape</Shape>
    </VStack>
    <VStack w="250" padding="16" gap="14" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="14" bold="true">Image rotate=-18</Text>
      <Image src="sample_images/sample_1.png" w="160" h="110" rotate="-18" />
    </VStack>
    <VStack w="250" padding="16" gap="14" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="14" bold="true">Icon rotate=45</Text>
      <Icon name="cpu" size="64" color="${palette.blue}" variant="circle-outlined" bgColor="${palette.blue}" rotate="45" />
    </VStack>
  </HStack>
</VStack>
`;
