---
"@hirokisakabe/pom": patch
---

refactor: XML child parsing / serialization ルールを registry 側の `xmlChildRule` として内部共通化

parseXml に分散していた child element の受け入れルール（許容タグ・変換先 property・インライン装飾タグの対応）を registry の宣言的なデータとして整理し、parseXml / serializeXml の双方から共有するようにしました。公開 API・XML 構文・エラーメッセージに変更はありません。
