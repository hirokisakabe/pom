---
"@hirokisakabe/pom-cli": minor
---

`pom build` と `pom preview` に `--verbose` フラグを追加した。指定するとビルド処理の各ステップ（ファイル読み込み・Markdown パース・PPTX ビルド・書き出し）の処理時間が `[pom] ...` 形式で stderr に出力される。
