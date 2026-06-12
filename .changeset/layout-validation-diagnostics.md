---
"@hirokisakabe/pom": minor
"pom-vscode": patch
---

feat: はみ出し・重なりを build 時に静的検出する diagnostics を追加

`buildPptx` がレイアウト計算後の絶対座標を検査し、レイアウト上の問題を警告として報告するようになりました（ビルドは止まりません。`strict: true` 時のみ `DiagnosticsError`）。

- `NODE_OUT_OF_BOUNDS` — ノードの矩形がスライド境界からはみ出している場合に警告します。メッセージにはスライド番号・ノード（タグ / id / ルートからのパス）・はみ出し方向と量が含まれ、原因に最も近い最深ノードのみが報告されます。
- `NODE_OVERLAP` — `VStack` / `HStack` 内の兄弟ノード同士の矩形交差を警告します。意図的な重なり（`Layer` 配下・`position="absolute"`・負 `margin` / `gap`・`zIndex` 明示）は検出対象外です。

`rotate` 指定ノードと `Line` / `Arrow` は誤検知回避のため境界判定の対象外です。
