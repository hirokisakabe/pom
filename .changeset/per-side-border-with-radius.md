---
"@hirokisakabe/pom": minor
"pom-vscode": minor
---

辺ごと border (`borderTop` / `borderRight` / `borderBottom` / `borderLeft`) と `borderRadius` を併用できるようになりました。各辺は pptxgenjs の `custGeom` shape で「両端の円弧 + 直線セグメント」を描画します。角弧は水平辺 (`top` / `bottom`) のみが所有し、`borderTop` が指定されていれば両上端の角丸が `borderTop` の色で連続描画され、`borderBottom` 指定時は両下端が `borderBottom` の色になります。`borderLeft` / `borderRight` は角弧を描画せず角丸の内側で直線として始終するため、accent bar 用途で左辺だけ強調しても角丸はニュートラルなまま残り「コルク抜き」になりません。

これに伴い `PER_SIDE_BORDER_WITH_RADIUS` 警告コードを除去しました。`DiagnosticCode` 型からも当該リテラルが削除されているため、TypeScript で当該 union を `switch` などで網羅していたコードはケース分岐の削除が必要です。`pom-vscode` の diagnostics 重大度マップからも対応エントリを削除しました。
