import { palette } from "./palette.js";

// ============================================================
// Page 50: 空コンテナを透明スペーサーとして使う
// ============================================================
// <VStack grow="1" /> / <HStack grow="1" /> を空のまま flex grow で
// 押し下げ / 押し広げに使う用途のレイアウト。CSS の `<div style="flex:1"></div>`
// 相当の primitive として、視覚負荷ゼロのまま grow=1 で間隔を空ける。
export const page50EmptyContainerSpacerXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 50: empty container as spacer</Text>

  <!-- VStack を grow="1" 空コンテナで縦方向に押し広げる -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">VStack with empty &lt;VStack grow="1" /&gt; spacer (push apart)</Text>
    <VStack w="300" h="180" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" h="40" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">Top</Shape>
      <VStack grow="1" />
      <Shape shapeType="rect" h="40" fill.color="${palette.red}" color="FFFFFF" fontSize="12">Bottom</Shape>
    </VStack>
  </VStack>

  <!-- HStack を grow="1" 空コンテナで横方向に押し広げる -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">HStack with empty &lt;HStack grow="1" /&gt; spacer (push apart)</Text>
    <HStack w="600" h="60" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" w="100" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">Left</Shape>
      <HStack grow="1" />
      <Shape shapeType="rect" w="100" fill.color="${palette.red}" color="FFFFFF" fontSize="12">Right</Shape>
    </HStack>
  </VStack>

  <!-- 固定サイズ指定の空 VStack を間隔として使う -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="12">
    <Text fontSize="14" bold="true">empty &lt;VStack h="40" /&gt; as fixed-size spacer</Text>
    <VStack w="300" backgroundColor="${palette.lightBlue}">
      <Shape shapeType="rect" h="40" fill.color="${palette.blue}" color="FFFFFF" fontSize="12">A</Shape>
      <VStack h="40" />
      <Shape shapeType="rect" h="40" fill.color="${palette.red}" color="FFFFFF" fontSize="12">B</Shape>
    </VStack>
  </VStack>
</VStack>
`;
