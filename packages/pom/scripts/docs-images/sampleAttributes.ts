import type { AttributeDemo } from "./config.js";

// sampleNodes.ts はスライド内コンテンツのみ (生成側で <Slide>...</Slide> で包む) を
// 持つのに対し、属性デモは <Theme> を含むため文書全体 (<Theme>?<Slide>...</Slide>)
// を 1 サンプルとして持つ。

const sampleImageUrl = "sample_images/sample_0.png";

const themeTokensSample = `
<Theme surface="0F172A" surfaceLight="1E293B" accent="38BDF8" accentDeep="0284C7" textMain="F8FAFC" textMuted="94A3B8" />
<Slide>
  <VStack w="100%" h="max" padding="48" gap="28" backgroundColor="$surface">
    <Text fontSize="32" bold="true" color="$textMain">Theme Tokens</Text>
    <Text fontSize="14" color="$textMuted">Declare colors once in &lt;Theme&gt;; reuse them everywhere as $token.</Text>
    <HStack gap="20">
      <VStack w="320" backgroundColor="$surfaceLight" padding="20" borderRadius="8" gap="8">
        <Text fontSize="14" color="$accent" bold="true">$accent on $surfaceLight</Text>
        <Text fontSize="13" color="$textMain">Card body uses $textMain</Text>
        <Text fontSize="12" color="$textMuted">Subtle copy uses $textMuted</Text>
      </VStack>
      <VStack w="320" backgroundColor="$accentDeep" padding="20" borderRadius="8" gap="8">
        <Text fontSize="14" color="$textMain" bold="true">$textMain on $accentDeep</Text>
        <Text fontSize="13" color="$textMain">Tokens flow into composite nodes too</Text>
      </VStack>
      <VStack w="320" backgroundColor="$accent" padding="20" borderRadius="8" gap="8">
        <Text fontSize="14" color="$surface" bold="true">$surface on $accent</Text>
        <Text fontSize="13" color="$surface">Swap one hex to retint the deck</Text>
      </VStack>
    </HStack>
    <Timeline dateColor="$textMuted" titleColor="$textMain" descriptionColor="$textMuted" w="100%" h="180">
      <TimelineItem date="Q1" title="Plan" description="Tokenized" color="$accent" />
      <TimelineItem date="Q2" title="Build" description="Reused" color="$accentDeep" />
      <TimelineItem date="Q3" title="Ship" description="Consistent" color="$accent" />
    </Timeline>
  </VStack>
</Slide>
`;

const backgroundGradientSample = `
<Slide>
  <VStack w="100%" h="max" padding="40" gap="24" backgroundGradient="linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%)">
    <Text fontSize="28" bold="true" color="FFFFFF">backgroundGradient</Text>
    <Text fontSize="14" color="DBEAFE">CSS-like linear-gradient() syntax. Exported as a native PowerPoint gradient fill.</Text>
    <HStack gap="20">
      <VStack w="300" h="200" backgroundGradient="linear-gradient(180deg, #F97316 0%, #DC2626 100%)" padding="20" borderRadius="8" justifyContent="end">
        <Text fontSize="16" color="FFFFFF" bold="true">180deg (default)</Text>
        <Text fontSize="12" color="FFE4E6">top → bottom</Text>
      </VStack>
      <VStack w="300" h="200" backgroundGradient="linear-gradient(to right, #16A34A 0%, #DBEAFE 100%)" padding="20" borderRadius="8" justifyContent="end">
        <Text fontSize="16" color="FFFFFF" bold="true">to right</Text>
        <Text fontSize="12" color="ECFDF5">left → right</Text>
      </VStack>
      <VStack w="300" h="200" backgroundGradient="linear-gradient(45deg, #7C3AED 0%, #EC4899 50%, #F97316 100%)" padding="20" borderRadius="8" justifyContent="end">
        <Text fontSize="16" color="FFFFFF" bold="true">45deg, 3 stops</Text>
        <Text fontSize="12" color="FCE7F3">violet → pink → orange</Text>
      </VStack>
    </HStack>
  </VStack>
</Slide>
`;

const perSideBorderSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" backgroundColor="F8FAFC">
    <Text fontSize="28" bold="true" color="0F172A">Per-Side Border</Text>
    <Text fontSize="13" color="475569">borderTop / borderRight / borderBottom / borderLeft — same fields as border (color / width / dashType).</Text>
    <HStack gap="24">
      <VStack w="320" backgroundColor="FFFFFF" borderLeft.color="1D4ED8" borderLeft.width="6" padding="20" padding.left="24" gap="6">
        <Text fontSize="16" bold="true" color="1D4ED8">Left accent bar</Text>
        <Text fontSize="12" color="475569">borderLeft.width="6"</Text>
      </VStack>
      <VStack w="320" backgroundColor="FFFFFF" padding="20" gap="10">
        <Text fontSize="18" bold="true" borderBottom.color="0F172A" borderBottom.width="3" padding.bottom="8" w="100%">Underlined Heading</Text>
        <Text fontSize="12" color="475569">borderBottom.width="3"</Text>
      </VStack>
      <VStack w="320" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderLeft.color="DC2626" borderLeft.width="6" padding="20" padding.left="24" gap="6">
        <Text fontSize="16" bold="true" color="DC2626">Combined</Text>
        <Text fontSize="12" color="475569">border (frame) + borderLeft (accent)</Text>
      </VStack>
    </HStack>
    <HStack gap="24">
      <VStack w="320" backgroundColor="FFFFFF" borderTop.color="16A34A" borderTop.width="4" borderBottom.color="16A34A" borderBottom.width="4" padding="20" gap="6">
        <Text fontSize="16" bold="true" color="16A34A">Top + Bottom only</Text>
        <Text fontSize="12" color="475569">borderTop / borderBottom</Text>
      </VStack>
      <VStack w="320" backgroundColor="FFFFFF" borderRight.color="9333EA" borderRight.width="6" borderRight.dashType="dash" padding="20" padding.right="24" gap="6">
        <Text fontSize="16" bold="true" color="9333EA">Right dashed</Text>
        <Text fontSize="12" color="475569">borderRight.dashType="dash"</Text>
      </VStack>
      <VStack w="320" backgroundColor="FFFFFF" borderTop.color="0EA5E9" borderTop.width="3" borderRight.color="0EA5E9" borderRight.width="3" borderBottom.color="0EA5E9" borderBottom.width="3" borderLeft.color="0EA5E9" borderLeft.width="3" padding="20" gap="6">
        <Text fontSize="16" bold="true" color="0EA5E9">All four sides</Text>
        <Text fontSize="12" color="475569">borderTop/Right/Bottom/Left individually</Text>
      </VStack>
    </HStack>
  </VStack>
</Slide>
`;

const textEffectsSample = `
<Slide>
  <VStack w="100%" h="max" padding="40" gap="28" backgroundColor="0F172A" justifyContent="center">
    <Text fontSize="28" bold="true" color="F8FAFC" w="100%" textAlign="center">Text Effects (glow / outline)</Text>
    <VStack w="100%" gap="22">
      <VStack gap="4" w="100%">
        <Text fontSize="12" color="94A3B8" w="100%" textAlign="center">glow.size="12" glow.opacity="0.7" glow.color="38BDF8"</Text>
        <Text fontSize="44" bold="true" color="FFFFFF" w="100%" textAlign="center" glow.size="12" glow.opacity="0.7" glow.color="38BDF8">Glowing title</Text>
      </VStack>
      <VStack gap="4" w="100%">
        <Text fontSize="12" color="94A3B8" w="100%" textAlign="center">outline.size="2" outline.color="F97316"</Text>
        <Text fontSize="44" bold="true" color="F8FAFC" w="100%" textAlign="center" outline.size="2" outline.color="F97316">Outlined title</Text>
      </VStack>
      <VStack gap="4" w="100%">
        <Text fontSize="12" color="94A3B8" w="100%" textAlign="center">glow + outline</Text>
        <Text fontSize="44" bold="true" color="F97316" w="100%" textAlign="center" glow.size="10" glow.color="EC4899" outline.size="2" outline.color="F8FAFC">Combined</Text>
      </VStack>
    </VStack>
    <Text fontSize="11" color="64748B" w="100%" textAlign="center">Native PowerPoint text effects (editable, not rasterized). Note: LibreOffice does not render glow.</Text>
  </VStack>
</Slide>
`;

const letterSpacingSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="20" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A">letterSpacing</Text>
    <Text fontSize="13" color="475569">Specified in px, converted to pt on output. Layout accounts for the added width.</Text>
    <VStack gap="22" backgroundColor="FFFFFF" padding="32" borderRadius="8" border.color="E2E8F0" border.width="1">
      <VStack gap="4">
        <Text fontSize="12" color="64748B">letterSpacing="0" (default)</Text>
        <Text fontSize="32" bold="true" color="0F172A">SECTION TITLE</Text>
      </VStack>
      <VStack gap="4">
        <Text fontSize="12" color="64748B">letterSpacing="4"</Text>
        <Text fontSize="32" bold="true" color="0F172A" letterSpacing="4">SECTION TITLE</Text>
      </VStack>
      <VStack gap="4">
        <Text fontSize="12" color="64748B">letterSpacing="12"</Text>
        <Text fontSize="32" bold="true" color="0F172A" letterSpacing="12">SECTION TITLE</Text>
      </VStack>
      <VStack gap="4">
        <Text fontSize="12" color="64748B">Inline &lt;Span letterSpacing="8"&gt;</Text>
        <Text fontSize="22" color="0F172A">Normal <Span letterSpacing="8">spaced span</Span> normal</Text>
      </VStack>
    </VStack>
  </VStack>
</Slide>
`;

const rotationSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A">Leaf Rotation</Text>
    <Text fontSize="13" color="475569">rotate (degrees clockwise) — applied at render time only; layout uses unrotated bounds.</Text>
    <HStack gap="32" justifyContent="center" alignItems="center">
      <VStack gap="14" alignItems="center" w="220" h="220" justifyContent="center" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1">
        <Text fontSize="22" bold="true" color="1D4ED8" rotate="-15">Text -15°</Text>
        <Text fontSize="11" color="64748B">Text rotate="-15"</Text>
      </VStack>
      <VStack gap="14" alignItems="center" w="220" h="220" justifyContent="center" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1">
        <Shape shapeType="rect" w="140" h="80" fill.color="16A34A" text="Shape 20°" color="FFFFFF" fontSize="14" textAlign="center" rotate="20" />
        <Text fontSize="11" color="64748B">Shape rotate="20"</Text>
      </VStack>
      <VStack gap="14" alignItems="center" w="220" h="220" justifyContent="center" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1">
        <Image src="${sampleImageUrl}" w="140" h="100" rotate="-8" />
        <Text fontSize="11" color="64748B">Image rotate="-8"</Text>
      </VStack>
      <VStack gap="14" alignItems="center" w="220" h="220" justifyContent="center" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1">
        <Icon name="arrow-up" size="80" color="#DC2626" rotate="45" />
        <Text fontSize="11" color="64748B">Icon rotate="45"</Text>
      </VStack>
    </HStack>
  </VStack>
</Slide>
`;

const subSupSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A">Subscript / Superscript</Text>
    <VStack gap="22" backgroundColor="FFFFFF" padding="32" borderRadius="8" border.color="E2E8F0" border.width="1">
      <VStack gap="6">
        <Text fontSize="12" color="64748B">Inline &lt;Sub&gt; — chemistry formulas</Text>
        <Text fontSize="28" color="0F172A">H<Sub>2</Sub>O · CO<Sub>2</Sub> · C<Sub>6</Sub>H<Sub>12</Sub>O<Sub>6</Sub></Text>
      </VStack>
      <VStack gap="6">
        <Text fontSize="12" color="64748B">Inline &lt;Sup&gt; — exponents and ordinals</Text>
        <Text fontSize="28" color="0F172A">x<Sup>2</Sup> + y<Sup>2</Sup> = r<Sup>2</Sup> · E = mc<Sup>2</Sup> · 1<Sup>st</Sup></Text>
      </VStack>
      <VStack gap="6">
        <Text fontSize="12" color="64748B">Attribute form — apply to the whole Text</Text>
        <HStack gap="32" alignItems="center">
          <Text fontSize="16" color="0F172A">normal</Text>
          <Text fontSize="16" color="0F172A" subscript="true">subscript="true"</Text>
          <Text fontSize="16" color="0F172A" superscript="true">superscript="true"</Text>
        </HStack>
      </VStack>
    </VStack>
  </VStack>
</Slide>
`;

const growSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" backgroundColor="F8FAFC">
    <Text fontSize="28" bold="true" color="0F172A">grow (Flexbox flex-grow)</Text>
    <Text fontSize="13" color="475569">Distributes remaining main-axis space in proportion to grow values.</Text>
    <VStack gap="20">
      <VStack gap="6">
        <Text fontSize="13" color="64748B">grow="1" / grow="1" / grow="1" — equal thirds</Text>
        <HStack w="100%" h="80" gap="12">
          <VStack grow="1" backgroundColor="1D4ED8" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="18">1</Text></VStack>
          <VStack grow="1" backgroundColor="0EA5E9" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="18">1</Text></VStack>
          <VStack grow="1" backgroundColor="16A34A" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="18">1</Text></VStack>
        </HStack>
      </VStack>
      <VStack gap="6">
        <Text fontSize="13" color="64748B">grow="2" / grow="1" — 2:1 split</Text>
        <HStack w="100%" h="80" gap="12">
          <VStack grow="2" backgroundColor="1D4ED8" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="18">grow=2</Text></VStack>
          <VStack grow="1" backgroundColor="16A34A" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="18">grow=1</Text></VStack>
        </HStack>
      </VStack>
      <VStack gap="6">
        <Text fontSize="13" color="64748B">w="200" / grow="1" / w="120" — only grow expands to fill</Text>
        <HStack w="100%" h="80" gap="12">
          <VStack w="200" backgroundColor="475569" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="16">w=200</Text></VStack>
          <VStack grow="1" backgroundColor="1D4ED8" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="16">grow=1</Text></VStack>
          <VStack w="120" backgroundColor="475569" justifyContent="center" alignItems="center"><Text color="FFFFFF" bold="true" fontSize="16">w=120</Text></VStack>
        </HStack>
      </VStack>
    </VStack>
  </VStack>
</Slide>
`;

const inlineFormattingSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="20" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A">Inline Formatting</Text>
    <Text fontSize="13" color="475569">Mix &lt;B&gt; / &lt;I&gt; / &lt;U&gt; / &lt;S&gt; / &lt;Mark&gt; / &lt;Span&gt; inside a single Text node.</Text>
    <VStack gap="16" backgroundColor="FFFFFF" padding="32" borderRadius="8" border.color="E2E8F0" border.width="1">
      <Text fontSize="20" color="0F172A">&lt;B&gt; — Normal <B>bold</B> normal</Text>
      <Text fontSize="20" color="0F172A">&lt;I&gt; — Normal <I>italic</I> normal</Text>
      <Text fontSize="20" color="0F172A">&lt;U&gt; — Normal <U>underline</U> normal</Text>
      <Text fontSize="20" color="0F172A">&lt;S&gt; — Normal <S>strikethrough</S> normal</Text>
      <Text fontSize="20" color="0F172A">&lt;Mark&gt; — Normal <Mark color="FEF08A">highlighted</Mark> normal</Text>
      <Text fontSize="20" color="0F172A">&lt;Span color&gt; — Normal <Span color="DC2626">red span</Span> normal</Text>
      <Text fontSize="20" color="0F172A">Nested — <B><I><Span color="1D4ED8">bold italic blue</Span></I></B> · <B><U>bold underline</U></B></Text>
    </VStack>
  </VStack>
</Slide>
`;

const underlineStylesSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="20" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A">Underline Styles</Text>
    <VStack gap="14" backgroundColor="FFFFFF" padding="32" borderRadius="8" border.color="E2E8F0" border.width="1">
      <Text fontSize="22" color="0F172A" underline="true">underline="true" (single)</Text>
      <Text fontSize="22" color="0F172A" underline.style="dbl">underline.style="dbl"</Text>
      <Text fontSize="22" color="0F172A" underline.style="dotted">underline.style="dotted"</Text>
      <Text fontSize="22" color="0F172A" underline.style="dottedHeavy">underline.style="dottedHeavy"</Text>
      <Text fontSize="22" color="0F172A" underline.style="dash">underline.style="dash"</Text>
      <Text fontSize="22" color="0F172A" underline.style="dashLong">underline.style="dashLong"</Text>
      <Text fontSize="22" color="0F172A" underline.style="wavy" underline.color="DC2626">underline.style="wavy" color="DC2626"</Text>
      <Text fontSize="22" color="0F172A" underline.style="wavyDbl" underline.color="1D4ED8">underline.style="wavyDbl" color="1D4ED8"</Text>
      <Text fontSize="22" color="0F172A" underline.style="heavy">underline.style="heavy"</Text>
    </VStack>
  </VStack>
</Slide>
`;

const highlightSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="22" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A">Highlight</Text>
    <VStack gap="16" backgroundColor="FFFFFF" padding="32" borderRadius="8" border.color="E2E8F0" border.width="1">
      <HStack gap="20" alignItems="center">
        <Text fontSize="12" color="64748B" w="160">highlight="FEF08A"</Text>
        <Text fontSize="22" color="0F172A" highlight="FEF08A">yellow highlight</Text>
      </HStack>
      <HStack gap="20" alignItems="center">
        <Text fontSize="12" color="64748B" w="160">highlight="BBF7D0"</Text>
        <Text fontSize="22" color="0F172A" highlight="BBF7D0">green highlight</Text>
      </HStack>
      <HStack gap="20" alignItems="center">
        <Text fontSize="12" color="64748B" w="160">highlight="BFDBFE"</Text>
        <Text fontSize="22" color="0F172A" highlight="BFDBFE">blue highlight</Text>
      </HStack>
      <HStack gap="20" alignItems="center">
        <Text fontSize="12" color="64748B" w="160">highlight="FECACA"</Text>
        <Text fontSize="22" color="0F172A" highlight="FECACA">red highlight</Text>
      </HStack>
      <Text fontSize="20" color="0F172A">Inline &lt;Mark&gt;: only <Mark color="FEF08A">this part</Mark> is highlighted</Text>
    </VStack>
  </VStack>
</Slide>
`;

const shadowSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" backgroundColor="F1F5F9" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A" w="100%" textAlign="center">Shadow</Text>
    <Text fontSize="13" color="475569" w="100%" textAlign="center">shadow.type ("outer" / "inner") + blur / offset / color / opacity / angle. Available on every node except Line.</Text>
    <HStack w="100%" gap="40" justifyContent="center">
      <VStack w="240" gap="14">
        <VStack w="240" h="140" backgroundColor="FFFFFF" borderRadius="8" justifyContent="center" shadow.blur="4" shadow.offset="2" shadow.color="000000" shadow.opacity="0.25">
          <Text fontSize="16" bold="true" color="0F172A" w="100%" textAlign="center">Subtle</Text>
        </VStack>
        <Text fontSize="11" color="64748B" w="100%" textAlign="center">blur=4 offset=2 opacity=0.25</Text>
      </VStack>
      <VStack w="240" gap="14">
        <VStack w="240" h="140" backgroundColor="FFFFFF" borderRadius="8" justifyContent="center" shadow.blur="12" shadow.offset="6" shadow.color="000000" shadow.opacity="0.4">
          <Text fontSize="16" bold="true" color="0F172A" w="100%" textAlign="center">Stronger</Text>
        </VStack>
        <Text fontSize="11" color="64748B" w="100%" textAlign="center">blur=12 offset=6 opacity=0.4</Text>
      </VStack>
      <VStack w="240" gap="14">
        <VStack w="240" h="140" backgroundColor="FFFFFF" borderRadius="8" justifyContent="center" shadow.blur="20" shadow.offset="8" shadow.color="1D4ED8" shadow.opacity="0.55">
          <Text fontSize="16" bold="true" color="0F172A" w="100%" textAlign="center">Colored</Text>
        </VStack>
        <Text fontSize="11" color="64748B" w="100%" textAlign="center">shadow.color="1D4ED8" blur=20</Text>
      </VStack>
    </HStack>
  </VStack>
</Slide>
`;

const opacitySample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="22" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A" w="100%" textAlign="center">Opacity</Text>
    <Text fontSize="13" color="475569" w="100%" textAlign="center">0 = fully transparent, 1 = fully opaque. Affects the node's background only.</Text>
    <HStack w="100%" h="200" gap="24" justifyContent="center" alignItems="center">
      <VStack w="200" gap="10" alignItems="center">
        <VStack w="180" h="140" backgroundColor="1D4ED8" opacity="1" justifyContent="center" alignItems="center"><Text fontSize="20" bold="true" color="FFFFFF">1.0</Text></VStack>
        <Text fontSize="12" color="64748B" w="100%" textAlign="center">opacity="1"</Text>
      </VStack>
      <VStack w="200" gap="10" alignItems="center">
        <VStack w="180" h="140" backgroundColor="1D4ED8" opacity="0.75" justifyContent="center" alignItems="center"><Text fontSize="20" bold="true" color="FFFFFF">0.75</Text></VStack>
        <Text fontSize="12" color="64748B" w="100%" textAlign="center">opacity="0.75"</Text>
      </VStack>
      <VStack w="200" gap="10" alignItems="center">
        <VStack w="180" h="140" backgroundColor="1D4ED8" opacity="0.5" justifyContent="center" alignItems="center"><Text fontSize="20" bold="true" color="FFFFFF">0.5</Text></VStack>
        <Text fontSize="12" color="64748B" w="100%" textAlign="center">opacity="0.5"</Text>
      </VStack>
      <VStack w="200" gap="10" alignItems="center">
        <VStack w="180" h="140" backgroundColor="1D4ED8" opacity="0.25" justifyContent="center" alignItems="center"><Text fontSize="20" bold="true" color="FFFFFF">0.25</Text></VStack>
        <Text fontSize="12" color="64748B" w="100%" textAlign="center">opacity="0.25"</Text>
      </VStack>
    </HStack>
  </VStack>
</Slide>
`;

const layerOverlaySample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="20" backgroundColor="F8FAFC" justifyContent="center">
    <Text fontSize="28" bold="true" color="0F172A" w="100%" textAlign="center">Layer Overlay Pattern</Text>
    <HStack w="100%" justifyContent="center">
      <Layer w="960" h="400">
        <Image src="${sampleImageUrl}" x="0" y="0" w="960" h="400" />
        <VStack x="0" y="0" w="960" h="400" backgroundColor="0F172A" opacity="0.55" justifyContent="center" gap="12">
          <Text fontSize="40" bold="true" color="FFFFFF" w="100%" textAlign="center">Overlay Title</Text>
          <Text fontSize="16" color="F1F5F9" w="100%" textAlign="center">Image + semi-transparent VStack overlay</Text>
        </VStack>
      </Layer>
    </HStack>
    <Text fontSize="12" color="64748B" w="100%" textAlign="center">Layer stacks an Image, a fill.transparency Shape, and text in document order.</Text>
  </VStack>
</Slide>
`;

const combiningStylesSample = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" backgroundColor="F8F9FA">
    <Text fontSize="36" bold="true" color="1A1A2E">Quarterly Report</Text>
    <Text fontSize="16" color="666666">Q4 2025 Results</Text>
    <HStack gap="16" w="100%">
      <VStack grow="1" backgroundColor="FFFFFF" borderRadius="8" padding="24" gap="8" border.color="E5E7EB" border.width="1" shadow.type="outer" shadow.blur="8" shadow.offset="3" shadow.color="000000" shadow.opacity="0.12">
        <Text fontSize="12" color="999999">Revenue</Text>
        <Text fontSize="28" bold="true" color="16A34A">$1.2M</Text>
        <Text fontSize="11" color="666666">YoY <B><Span color="16A34A">+18%</Span></B></Text>
      </VStack>
      <VStack grow="1" backgroundColor="FFFFFF" borderRadius="8" padding="24" gap="8" border.color="E5E7EB" border.width="1" shadow.type="outer" shadow.blur="8" shadow.offset="3" shadow.color="000000" shadow.opacity="0.12">
        <Text fontSize="12" color="999999">Growth</Text>
        <Text fontSize="28" bold="true" color="1D4ED8">+24%</Text>
        <Text fontSize="11" color="666666">vs target <B><Span color="1D4ED8">+6pt</Span></B></Text>
      </VStack>
      <VStack grow="1" backgroundColor="FFFFFF" padding="24" gap="8" border.color="E5E7EB" border.width="1" borderLeft.color="DC2626" borderLeft.width="6" shadow.type="outer" shadow.blur="8" shadow.offset="3" shadow.color="000000" shadow.opacity="0.12">
        <Text fontSize="12" color="999999">Churn</Text>
        <Text fontSize="28" bold="true" color="DC2626">2.4%</Text>
        <Text fontSize="11" color="666666">↑ <B><Span color="DC2626">+0.3pt</Span></B> from Q3</Text>
      </VStack>
    </HStack>
    <Text fontSize="13" color="666666" highlight="FEF3C7" padding="8">Note: Figures are preliminary and subject to final audit.</Text>
  </VStack>
</Slide>
`;

export const sampleAttributes: Record<AttributeDemo, string> = {
  "attr-theme-tokens": themeTokensSample,
  "attr-background-gradient": backgroundGradientSample,
  "attr-per-side-border": perSideBorderSample,
  "attr-text-effects": textEffectsSample,
  "attr-letter-spacing": letterSpacingSample,
  "attr-rotation": rotationSample,
  "attr-sub-sup": subSupSample,
  "attr-grow": growSample,
  "attr-inline-formatting": inlineFormattingSample,
  "attr-underline-styles": underlineStylesSample,
  "attr-highlight": highlightSample,
  "attr-shadow": shadowSample,
  "attr-opacity": opacitySample,
  "attr-layer-overlay": layerOverlaySample,
  "attr-combining-styles": combiningStylesSample,
};
