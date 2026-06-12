---
"@hirokisakabe/pom-cli": minor
---

pptx-glimpse を 1.1.0 に更新し、SVG のネイティブテキスト出力 (`textOutput: "text"`) を取り込み

- `pom render --format svg` に `--text-output <path|text>` オプションを追加。`text` を指定すると、グリフのアウトライン `<path>` ではなくネイティブ `<text>` 要素 + サブセット化フォントの `@font-face` (data URI) 埋め込みで出力する (デフォルトは従来どおり `path`)
- `pom preview` はインライン SVG 表示のため常に `textOutput: "text"` で変換するように変更。ブラウザのネイティブテキスト描画 (ヒンティング等) が効き、テキスト選択も可能になる
