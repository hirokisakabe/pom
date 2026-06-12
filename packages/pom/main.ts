import { buildPptx } from "./src/index.js";

const xml = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="16" alignItems="start" backgroundColor="FFFFFF">
    <Text fontSize="18" bold="true">見出し</Text>
    <Text fontSize="14" lineHeight="1.5" w="400">複数行に折り返す本文テキスト。複数行に折り返す本文テキスト。複数行に折り返す本文テキスト。</Text>
    <Shape shapeType="roundRect" w="220" h="44" fill.color="1D4ED8" />
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
