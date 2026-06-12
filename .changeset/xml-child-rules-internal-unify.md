---
"@hirokisakabe/pom": patch
---

refactor: XML child parsing / serialization ルールを registry 側の `xmlChildRule` として内部共通化

parseXml に分散していた child element の受け入れルール（許容タグ・変換先 property）を registry の宣言的なデータ `xmlChildRule` として整理しました。インライン装飾タグ（B/I/A/U/S/Mark/Span）と `TextRun` の対応ルールは parseXml / serializeXml の双方から共有されます。公開 API・XML 構文・エラーメッセージに変更はありません。
