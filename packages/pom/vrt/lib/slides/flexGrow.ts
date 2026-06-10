import { palette } from "./palette.js";

// ============================================================
// Page 42: flex-grow (grow 属性) - 比率レイアウト
// ============================================================
export const page42FlexGrowXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 42: flex-grow (grow attribute)</Text>

  <!-- HStack で grow 2:1 -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">HStack grow="2" : grow="1"</Text>
    <HStack w="600" h="60" gap="8" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" grow="2" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">grow=2</Shape>
      <Shape shapeType="rect" grow="1" fill.color="${palette.red}" color="FFFFFF" fontSize="12">grow=1</Shape>
    </HStack>
  </VStack>

  <!-- HStack で grow 1:2:1 の 3 カラム -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">HStack grow="1" : grow="2" : grow="1"</Text>
    <HStack w="600" h="60" gap="8" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" grow="1" fill.color="${palette.green}" color="FFFFFF" fontSize="12">grow=1</Shape>
      <Shape shapeType="rect" grow="2" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">grow=2</Shape>
      <Shape shapeType="rect" grow="1" fill.color="${palette.green}" color="FFFFFF" fontSize="12">grow=1</Shape>
    </HStack>
  </VStack>

  <!-- VStack で grow 3:1 -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">VStack grow="3" : grow="1"</Text>
    <VStack w="300" h="120" gap="8" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" grow="3" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">grow=3</Shape>
      <Shape shapeType="rect" grow="1" fill.color="${palette.red}" color="FFFFFF" fontSize="12">grow=1</Shape>
    </VStack>
  </VStack>

  <!-- w="max" との併用 (grow 優先) と固定幅との混在 -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">w="max" grow="2" : w="max" (grow priority) / fixed + grow</Text>
    <HStack w="600" h="60" gap="8" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" w="max" grow="2" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">w=max grow=2</Shape>
      <Shape shapeType="rect" w="max" fill.color="${palette.red}" color="FFFFFF" fontSize="12">w=max</Shape>
    </HStack>
    <HStack w="600" h="60" gap="8" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" w="150" fill.color="${palette.accent}" color="FFFFFF" fontSize="12">w=150</Shape>
      <Shape shapeType="rect" grow="2" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">grow=2</Shape>
      <Shape shapeType="rect" grow="1" fill.color="${palette.green}" color="FFFFFF" fontSize="12">grow=1</Shape>
    </HStack>
  </VStack>
</VStack>
`;
