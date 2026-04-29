import { buildPptx } from "./src/index.js";

const xml = `
<Slide>
  <VStack w="1280" h="720" padding.top="24" padding.bottom="24" padding.left="48" padding.right="48" gap="24" backgroundColor="F8FAFC">
    <Text fontSize="28" bold="true" color="1E293B">Icon Preset Library Demo</Text>

    <HStack gap="24" alignItems="center">
      <Icon name="cpu" size="48" color="#1D4ED8" />
      <Icon name="database" size="48" color="#16A34A" />
      <Icon name="cloud" size="48" color="#0EA5E9" />
      <Icon name="server" size="48" color="#DC2626" />
      <Icon name="shield" size="48" color="#0F172A" />
      <Icon name="star" size="48" color="#F59E0B" />
      <Icon name="heart" size="48" color="#DC2626" />
      <Icon name="zap" size="48" color="#F59E0B" />
      <Icon name="target" size="48" color="#16A34A" />
      <Icon name="lightbulb" size="48" color="#1D4ED8" />
    </HStack>

    <HStack gap="32" alignItems="end">
      <Icon name="briefcase" size="16" />
      <Icon name="briefcase" size="24" />
      <Icon name="briefcase" size="32" />
      <Icon name="briefcase" size="48" />
      <Icon name="briefcase" size="64" />
    </HStack>

    <HStack gap="24" alignItems="center">
      <Icon name="trending-up" size="32" color="#16A34A" />
      <Icon name="bar-chart" size="32" color="#1D4ED8" />
      <Icon name="pie-chart" size="32" color="#9333EA" />
      <Icon name="line-chart" size="32" color="#DC2626" />
    </HStack>
  </VStack>
</Slide>
`;

async function main() {
  const { pptx } = await buildPptx(xml, {
    w: 1280,
    h: 720,
  });

  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
