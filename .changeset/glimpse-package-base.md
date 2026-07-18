---
"@hirokisakabe/pom": major
---

PPTX 全体を `@pptx-glimpse/document` の package writer で生成し、`pptxgenjs` 依存と marker 置換後処理を削除しました。

`buildPptx()` が返す `pptx` は pptxgenjs インスタンスではなく、`write` / `writeFile` / `stream` を提供する `WritablePptx` になります。出力以外の pptxgenjs API を戻り値から利用していた場合は、XML または `SlideMasterOptions` で生成内容を指定してください。
