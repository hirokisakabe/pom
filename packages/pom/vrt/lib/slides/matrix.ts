import { palette } from "./palette.js";

// ============================================================
// Page 11: Matrix Test
// テスト対象: axes, quadrants, items, coordinate system
// ============================================================
export const page11MatrixXml = `
<VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 11: Matrix Test</Text>
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="12">
      <Text fontSize="14" bold="true">Cost-Effectiveness Matrix (with quadrants):</Text>
      <Matrix w="500" h="400">
        <MatrixAxes x="コスト" y="インパクト" />
        <MatrixQuadrants topLeft="低コスト高効果\n（優先実施）" topRight="高コスト高効果\n（検討）" bottomLeft="低コスト低効果\n（様子見）" bottomRight="高コスト低効果\n（見送り）" />
        <MatrixItem label="施策A" x="0.2" y="0.8" color="4CAF50" />
        <MatrixItem label="施策B" x="0.7" y="0.6" color="2196F3" />
        <MatrixItem label="施策C" x="0.3" y="0.3" color="FF9800" />
        <MatrixItem label="施策D" x="0.8" y="0.2" color="E91E63" />
      </Matrix>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="12">
      <Text fontSize="14" bold="true">Impact-Effort Matrix (without quadrants):</Text>
      <Matrix w="500" h="400">
        <MatrixAxes x="Effort" y="Impact" />
        <MatrixItem label="Quick Win" x="0.15" y="0.85" />
        <MatrixItem label="Major Project" x="0.75" y="0.75" />
        <MatrixItem label="Fill-In" x="0.25" y="0.25" />
        <MatrixItem label="Time Sink" x="0.85" y="0.15" />
        <MatrixItem label="Feature X" x="0.5" y="0.5" />
      </Matrix>
    </VStack>
  </HStack>
</VStack>
`;
