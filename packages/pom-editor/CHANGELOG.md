# @hirokisakabe/pom-editor

## 0.2.0

### Minor Changes

- [#747](https://github.com/hirokisakabe/pom/pull/747) [`c96f84a`](https://github.com/hirokisakabe/pom/commit/c96f84a6cb9808051cfa04adae54381a5dba9f2b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `serializeXml`, `parseXml`, `POMNode` を `@hirokisakabe/pom` の公開 API に追加する。

  `@hirokisakabe/pom-editor` パッケージを新規追加する。pom XML の AST をツリー表示し、
  DnD でノードを並び替えると `onChange` で更新後の XML が返る `PomAstEditor` コンポーネントを提供する。

### Patch Changes

- Updated dependencies [[`c96f84a`](https://github.com/hirokisakabe/pom/commit/c96f84a6cb9808051cfa04adae54381a5dba9f2b)]:
  - @hirokisakabe/pom@8.2.0
