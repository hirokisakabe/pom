---
"@hirokisakabe/pom": patch
---

fix: ESM 環境での import 拡張子問題を修正

- TypeScript の `moduleResolution: NodeNext` と `rewriteRelativeImportExtensions` を使用して、ビルド時に相対 import に `.js` 拡張子を自動追加
- これにより `@hirokisakabe/pom/schema` を ESM 環境でインポートした際に発生していた `ERR_MODULE_NOT_FOUND` エラーを解消
