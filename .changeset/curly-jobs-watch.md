---
"@hirokisakabe/pom": major
"@hirokisakabe/pom-md": major
"@hirokisakabe/pom-cli": minor
"@hirokisakabe/pom-jsx": minor
"@hirokisakabe/pom-editor": minor
"pom-vscode": minor
---

Node.js のサポート範囲を 22 以降に引き上げました。`@pptx-glimpse/document` 消費に備えて、pom 関連 package と VS Code extension の engines を Node 22 に揃えています。VS Code extension は Node.js 22 extension host を前提にするため、最小 VS Code バージョンも 1.101 に引き上げています。
