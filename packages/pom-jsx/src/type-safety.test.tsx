import { describe, it } from "vitest";
import { Text, VStack, Image, Slide } from "./components.ts";

describe("型安全性の回帰テスト", () => {
  it("有効な props は型エラーにならない", () => {
    const _valid = (
      <Slide>
        <VStack w={200} h={100}>
          <Text fontSize={16} color="red">
            hello
          </Text>
        </VStack>
      </Slide>
    );
  });

  it("不正な props が TypeScript の型エラーになる (コンパイル時検証)", () => {
    // @ts-expect-error unknownProp は TextProps に存在しない
    const _invalidText = <Text unknownProp={1}>hello</Text>;

    // @ts-expect-error unknownProp は VStackProps に存在しない
    const _invalidVStack = <VStack unknownProp="x" />;

    // @ts-expect-error src は必須なのに渡していない
    const _invalidImage = <Image />;
  });
});
