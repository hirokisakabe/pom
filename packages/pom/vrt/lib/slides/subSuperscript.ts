import { palette } from "./palette.js";

// ============================================================
// Page 47: Subscript / Superscript Test
// テスト対象: Text 本体の subscript / superscript、<Sub>/<Sup> インライン、
// Ul / Ol の li、Shape、Table cell
// ============================================================
export const page47SubSuperscriptXml = `
<VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 47: Subscript / Superscript Test</Text>
  <!-- Text 本体の sub / sup -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Text 本体 (全体に適用):</Text>
    <Text fontSize="22" color="${palette.charcoal}" superscript="true">全体が superscript</Text>
    <Text fontSize="22" color="${palette.charcoal}" subscript="true">全体が subscript</Text>
  </VStack>
  <!-- インラインタグ <Sub> / <Sup> -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">インライン (runs 単位):</Text>
    <Text fontSize="24" color="${palette.charcoal}">水分子: H<Sub>2</Sub>O / 二酸化炭素: CO<Sub>2</Sub></Text>
    <Text fontSize="24" color="${palette.charcoal}">面積: a<Sup>2</Sup> + b<Sup>2</Sup> = c<Sup>2</Sup></Text>
    <Text fontSize="24" color="${palette.charcoal}">混在: x<Sup>2</Sup> + H<Sub>2</Sub>O の解</Text>
  </VStack>
  <!-- Ul / Ol の Li -->
  <HStack gap="16" alignItems="stretch">
    <VStack grow="1" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">Ul Li の sub / sup:</Text>
      <Ul fontSize="20" color="${palette.charcoal}">
        <Li>通常項目</Li>
        <Li superscript="true">全体 superscript</Li>
        <Li>インライン x<Sup>n</Sup></Li>
        <Li>インライン H<Sub>2</Sub>O</Li>
      </Ul>
    </VStack>
    <VStack grow="1" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">Ol Li の sub / sup:</Text>
      <Ol fontSize="20" color="${palette.charcoal}">
        <Li>n<Sup>2</Sup> の計算</Li>
        <Li>H<Sub>2</Sub>SO<Sub>4</Sub> の生成</Li>
      </Ol>
    </VStack>
  </HStack>
  <!-- Shape のテキスト -->
  <HStack gap="16" alignItems="stretch">
    <Shape shapeType="roundRect" w="240" h="80" fill.color="${palette.lightBlue}" color="FFFFFF" fontSize="22" superscript="true">注釈テキスト</Shape>
    <Shape shapeType="roundRect" w="240" h="80" fill.color="${palette.navy}" color="FFFFFF" fontSize="22" subscript="true">下付きラベル</Shape>
  </HStack>
  <!-- Table cell -->
  <Table cellBorder.color="${palette.border}" cellBorder.width="1">
    <Tr>
      <Td bold="true">化学式</Td>
      <Td bold="true">数式</Td>
    </Tr>
    <Tr>
      <Td>H<Sub>2</Sub>O</Td>
      <Td>x<Sup>2</Sup> + y<Sup>2</Sup></Td>
    </Tr>
    <Tr>
      <Td subscript="true">セル全体 subscript</Td>
      <Td superscript="true">セル全体 superscript</Td>
    </Tr>
  </Table>
</VStack>
`;
