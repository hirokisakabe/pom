import { palette } from "./palette.js";

// ============================================================
// Page 53: Timeline Customization Test
// テスト対象: connectorColor / connectorGradient /
//   per-item dateColor / useColorForDate / fontFamily 継承
// ============================================================
export const page53TimelineCustomizationXml = `
<VStack w="100%" h="max" padding="32" gap="12" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="24" color="${palette.charcoal}" bold="true">Page 53: Timeline Customization</Text>

  <VStack padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="6">
    <Text fontSize="12" bold="true">connectorColor (solid):</Text>
    <Timeline direction="horizontal" w="1180" h="80" connectorColor="${palette.blue}">
      <TimelineItem date="2026/Q1" title="Phase 1" color="${palette.blue}" />
      <TimelineItem date="2026/Q2" title="Phase 2" color="${palette.accent}" />
      <TimelineItem date="2026/Q3" title="Phase 3" color="${palette.green}" />
    </Timeline>
  </VStack>

  <VStack padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="6">
    <Text fontSize="12" bold="true">connectorGradient (linear, horizontal):</Text>
    <Timeline direction="horizontal" w="1180" h="80" connectorGradient="linear-gradient(90deg, #1D4ED8 0%, #DC2626 100%)">
      <TimelineItem date="Start" title="Begin" color="${palette.blue}" />
      <TimelineItem date="Mid" title="Middle" color="9333EA" />
      <TimelineItem date="End" title="Finish" color="${palette.red}" />
    </Timeline>
  </VStack>

  <HStack gap="12" alignItems="stretch">
    <VStack w="50%" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="6">
      <Text fontSize="12" bold="true">useColorForDate (date follows item color):</Text>
      <Timeline direction="vertical" w="560" h="200" useColorForDate="true">
        <TimelineItem date="Jan" title="Kickoff" color="${palette.blue}" />
        <TimelineItem date="Mar" title="MVP" color="${palette.accent}" />
        <TimelineItem date="Jun" title="GA" color="${palette.green}" />
      </Timeline>
    </VStack>
    <VStack w="50%" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="6">
      <Text fontSize="12" bold="true">per-item dateColor override:</Text>
      <Timeline direction="vertical" w="560" h="200" dateColor="${palette.charcoal}">
        <TimelineItem date="Jan" title="Default" color="${palette.blue}" />
        <TimelineItem date="Mar" title="Override" color="${palette.accent}" dateColor="${palette.red}" />
        <TimelineItem date="Jun" title="Default" color="${palette.green}" />
      </Timeline>
    </VStack>
  </HStack>

  <VStack padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="6">
    <Text fontSize="12" bold="true">fontFamily inheritance (Arial):</Text>
    <Timeline direction="horizontal" w="1180" h="80" fontFamily="Arial">
      <TimelineItem date="2026/Q1" title="Plan" description="design phase" color="${palette.blue}" />
      <TimelineItem date="2026/Q2" title="Build" description="implementation" color="${palette.accent}" />
      <TimelineItem date="2026/Q3" title="Ship" description="release" color="${palette.green}" />
    </Timeline>
  </VStack>
</VStack>
`;
