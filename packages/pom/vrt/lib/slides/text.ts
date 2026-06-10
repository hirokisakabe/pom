import { palette } from "./palette.js";

// ============================================================
// Page 1: Text Node Test
// テスト対象: fontSize, color, textAlign, bold, italic, underline, strike, highlight, fontFamily, lineHeight
// ============================================================
export const page1TextXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 1: Text Node Test</Text>
  <!-- fontSize variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">fontSize:</Text>
    <HStack gap="24" alignItems="end">
      <Text fontSize="12">12px</Text>
      <Text fontSize="18">18px</Text>
      <Text fontSize="24">24px</Text>
      <Text fontSize="36">36px</Text>
    </HStack>
  </VStack>
  <!-- color variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">color:</Text>
    <HStack gap="24" alignItems="center">
      <Text fontSize="16" color="${palette.charcoal}">charcoal</Text>
      <Text fontSize="16" color="${palette.blue}">blue</Text>
      <Text fontSize="16" color="${palette.red}">red</Text>
      <Text fontSize="16" color="${palette.green}">green</Text>
    </HStack>
  </VStack>
  <!-- textAlign variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">textAlign:</Text>
    <VStack gap="4">
      <Text w="100%" backgroundColor="${palette.lightBlue}" padding="8" fontSize="14" textAlign="left">left (default)</Text>
      <Text w="100%" backgroundColor="${palette.lightBlue}" padding="8" fontSize="14" textAlign="center">center</Text>
      <Text w="100%" backgroundColor="${palette.lightBlue}" padding="8" fontSize="14" textAlign="right">right</Text>
    </VStack>
  </VStack>
  <!-- bold variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">bold:</Text>
    <HStack gap="24" alignItems="center">
      <Text fontSize="16">Normal text</Text>
      <Text fontSize="16" bold="true">Bold text</Text>
    </HStack>
  </VStack>
  <!-- italic variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">italic:</Text>
    <HStack gap="24" alignItems="center">
      <Text fontSize="16">Normal text</Text>
      <Text fontSize="16" italic="true">Italic text</Text>
    </HStack>
  </VStack>
  <!-- underline variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">underline:</Text>
    <HStack gap="24" alignItems="center">
      <Text fontSize="16">Normal</Text>
      <Text fontSize="16" underline="true">Underline (bool)</Text>
      <Text fontSize="16" underline.style="wavy">Underline (wavy)</Text>
      <Text fontSize="16" underline.style="dbl" underline.color="DC2626">Underline (dbl + color)</Text>
    </HStack>
  </VStack>
  <!-- strike & highlight variations -->
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">strike:</Text>
      <HStack gap="24" alignItems="center">
        <Text fontSize="16">Normal</Text>
        <Text fontSize="16" strike="true">Strike text</Text>
      </HStack>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">highlight:</Text>
      <HStack gap="24" alignItems="center">
        <Text fontSize="16">Normal</Text>
        <Text fontSize="16" highlight="FFFF00">Yellow highlight</Text>
        <Text fontSize="16" highlight="00FFFF">Cyan highlight</Text>
      </HStack>
    </VStack>
  </HStack>
  <!-- fontFamily & lineHeight -->
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">fontFamily:</Text>
      <Text fontSize="16" fontFamily="Noto Sans JP">Noto Sans JP</Text>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">lineHeight:</Text>
      <Text fontSize="14" lineHeight="1.5">Line 1\nLine 2\nLine 3</Text>
    </VStack>
  </HStack>
</VStack>
`;

// ============================================================
// Page 36: Inline Formatting Test (B/I tags)
// テスト対象: Text, Li, Td 内のインライン書式
// ============================================================
export const page36InlineFormattingXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 36: Inline Formatting (B/I/U/S/Mark tags)</Text>
  <!-- Text with B/I -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Text with inline B/I:</Text>
    <Text fontSize="16">Normal <B>bold text</B> normal</Text>
    <Text fontSize="16">Normal <I>italic text</I> normal</Text>
    <Text fontSize="16">Normal <B>bold</B> and <I>italic</I> mixed</Text>
    <Text fontSize="16"><B><I>Bold italic nested</I></B></Text>
  </VStack>
  <!-- Text with U/S/Mark -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Text with inline U/S/Mark:</Text>
    <Text fontSize="16">Normal <U>underline text</U> normal</Text>
    <Text fontSize="16">Normal <S>strikethrough text</S> normal</Text>
    <Text fontSize="16">Normal <Mark color="FFFF00">highlighted text</Mark> normal</Text>
    <Text fontSize="16"><B><U>Bold underline nested</U></B></Text>
    <Text fontSize="16"><Mark>Default highlight color</Mark></Text>
  </VStack>
  <!-- Text with Span (inline color) -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Text with inline Span (color):</Text>
    <Text fontSize="16">Normal <Span color="FF0000">red text</Span> normal</Text>
    <Text fontSize="16">Normal <Span color="1D4ED8">blue text</Span> and <Span color="16A34A">green text</Span></Text>
    <Text fontSize="16"><B><Span color="FF0000">bold red</Span></B></Text>
    <Text fontSize="16"><Span color="1D4ED8"><I>italic blue</I></Span></Text>
  </VStack>
  <!-- Li with B/I -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Ul with inline B/I/U/S/Mark:</Text>
    <Ul fontSize="14">
      <Li>Normal <B>bold</B> item</Li>
      <Li>Normal <I>italic</I> item</Li>
      <Li><B>All bold</B></Li>
      <Li>Normal <U>underline</U> item</Li>
      <Li>Normal <S>strike</S> item</Li>
      <Li><Mark color="00FF00">highlighted</Mark> item</Li>
      <Li><Span color="FF0000">red</Span> and <Span color="1D4ED8">blue</Span> item</Li>
    </Ul>
  </VStack>
  <!-- Table with B/I/U/S/Mark -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Table with inline B/I/U/S/Mark:</Text>
    <Table>
      <Col width="200" />
      <Col width="200" />
      <Tr>
        <Td fontSize="14" bold="true">Header</Td>
        <Td fontSize="14" bold="true">Value</Td>
      </Tr>
      <Tr>
        <Td fontSize="13"><B>Bold</B> cell</Td>
        <Td fontSize="13"><I>Italic</I> cell</Td>
      </Tr>
      <Tr>
        <Td fontSize="13"><U>Underline</U> cell</Td>
        <Td fontSize="13"><S>Strike</S> cell</Td>
      </Tr>
      <Tr>
        <Td fontSize="13"><Mark color="FFFF00">Highlight</Mark> cell</Td>
        <Td fontSize="13"><B><U><Mark color="00FFFF">All combined</Mark></U></B></Td>
      </Tr>
      <Tr>
        <Td fontSize="13"><Span color="FF0000">Red</Span> cell</Td>
        <Td fontSize="13"><B><Span color="1D4ED8">Bold blue</Span></B> cell</Td>
      </Tr>
    </Table>
  </VStack>
</VStack>
`;

// ============================================================
// Page 40: Letter Spacing Test
// テスト対象: Text の letterSpacing 属性、Span の letterSpacing、レイアウト計測
// ============================================================
export const page40LetterSpacingXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 40: Letter Spacing Test</Text>
  <!-- letterSpacing variations -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">letterSpacing:</Text>
    <Text fontSize="18">letterSpacing なし (default)</Text>
    <Text fontSize="18" letterSpacing="2">letterSpacing 2px</Text>
    <Text fontSize="18" letterSpacing="6">letterSpacing 6px</Text>
    <Text fontSize="18" letterSpacing="12">letterSpacing 12px</Text>
  </VStack>
  <!-- heading style -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">見出しスタイル (bold + letterSpacing):</Text>
    <Text fontSize="32" bold="true" letterSpacing="8" color="${palette.navy}">SECTION TITLE</Text>
    <Text fontSize="24" bold="true" letterSpacing="6" color="${palette.charcoal}">セクション見出し</Text>
  </VStack>
  <!-- Span letterSpacing -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">Span letterSpacing (partial):</Text>
    <Text fontSize="18">通常 <Span letterSpacing="8">字間広め</Span> 通常</Text>
    <Text fontSize="18"><B><Span letterSpacing="6" color="${palette.blue}">太字で字間広め</Span></B> と通常</Text>
  </VStack>
  <!-- layout: width grows with letterSpacing -->
  <VStack padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
    <Text fontSize="14" bold="true">レイアウト計測 (背景色で幅を可視化):</Text>
    <HStack gap="8" alignItems="start">
      <Text fontSize="16" backgroundColor="${palette.lightBlue}" padding="4">ABCDE</Text>
      <Text fontSize="16" backgroundColor="${palette.lightBlue}" padding="4" letterSpacing="10">ABCDE</Text>
    </HStack>
  </VStack>
</VStack>
`;

// ============================================================
// Page 2: List Test (Ul / Ol)
// テスト対象: Ul, Ol, Li, numberType, numberStartAt, Li style override
// ============================================================
export const page2ListXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 2: List Test (Ul / Ol)</Text>
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">Ul (bullet)</Text>
      <Ul fontSize="14">
        <Li>Item A</Li>
        <Li>Item B</Li>
        <Li>Item C</Li>
      </Ul>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">Ol (number)</Text>
      <Ol fontSize="14">
        <Li>First</Li>
        <Li>Second</Li>
        <Li>Third</Li>
      </Ol>
    </VStack>
  </HStack>
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">alphaLcPeriod (a. b. c.)</Text>
      <Ol fontSize="14" numberType="alphaLcPeriod">
        <Li>Alpha</Li>
        <Li>Beta</Li>
        <Li>Gamma</Li>
      </Ol>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">romanLcPeriod (i. ii. iii.)</Text>
      <Ol fontSize="14" numberType="romanLcPeriod">
        <Li>Roman I</Li>
        <Li>Roman II</Li>
        <Li>Roman III</Li>
      </Ol>
    </VStack>
  </HStack>
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">numberStartAt: 5</Text>
      <Ol fontSize="14" numberStartAt="5">
        <Li>Starts at 5</Li>
        <Li>Continues 6</Li>
        <Li>And 7</Li>
      </Ol>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" gap="8">
      <Text fontSize="14" bold="true">Li style override</Text>
      <Ul fontSize="14" color="${palette.charcoal}">
        <Li>Normal item</Li>
        <Li bold="true">Bold item</Li>
        <Li color="${palette.red}">Red item</Li>
        <Li italic="true" color="${palette.blue}">Italic blue item</Li>
      </Ul>
    </VStack>
  </HStack>
</VStack>
`;
