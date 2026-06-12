---
"@hirokisakabe/pom": patch
---

Text の上下視覚余白が非対称になる問題を修正（グリフがボックス下寄りに描画され、下隣要素との gap が詰まって見える）

- Text の行送りを spcPct（倍率）から spcPts（固定値 = fontSize × lineHeight）に変更し、レイアウト計測高さと実描画の行高さを一致させた
- グリフ ink が行内で上下中央に来るようにテキストフレームの描画位置を補正
- Text の lineHeight 属性がレイアウト計測に反映されていなかった問題を修正
