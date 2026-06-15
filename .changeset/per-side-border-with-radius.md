---
"@hirokisakabe/pom": minor
"pom-vscode": minor
---

辺ごと border (`borderTop` / `borderRight` / `borderBottom` / `borderLeft`) と `borderRadius` を併用できるようになりました。各辺は pptxgenjs の `custGeom` shape で「両端の円弧 + 直線セグメント」を描画し、角部はその角に隣接する水平辺 (`top` / `bottom`) が指定されていれば水平辺が引き取り、それ以外は垂直辺 (`left` / `right`) が引き取ります。これにより `borderTop` + `borderRadius` は両上端の角丸が `borderTop` の色で連続描画され、KPI タイルの上端アクセント表現が直接できるようになります。

これに伴い `PER_SIDE_BORDER_WITH_RADIUS` 警告コードを除去しました。`DiagnosticCode` 型からも当該リテラルが削除されているため、TypeScript で当該 union を `switch` などで網羅していたコードはケース分岐の削除が必要です。`pom-vscode` の diagnostics 重大度マップからも対応エントリを削除しました。
