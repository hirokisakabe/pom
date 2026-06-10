import fs from "fs";
import path from "path";

const DEBOUNCE_MS = 100;

// Watches the parent directory instead of the file itself so the watcher
// survives atomic saves (rename + replace) performed by editors like Vim.
export function watchInputFile(
  absPath: string,
  onChange: () => void,
): fs.FSWatcher {
  const dir = path.dirname(absPath);
  const base = path.basename(absPath);
  let debounceTimer: NodeJS.Timeout | null = null;

  let lastMtimeMs = -1;
  try {
    lastMtimeMs = fs.statSync(absPath).mtimeMs;
  } catch {
    // 監視開始時点でファイルが無くても、作成され次第のイベントで拾う
  }

  return fs.watch(dir, (_eventType, filename) => {
    // filename can be null on some platforms; treat it as a potential match
    if (filename !== null && filename !== base) return;
    // 同一ディレクトリの別ファイル変更 (filename が null の環境) や
    // 自前の出力ファイル書き込みで発火しないよう、mtime の実変化を確認する
    let mtimeMs: number;
    try {
      mtimeMs = fs.statSync(absPath).mtimeMs;
    } catch {
      return;
    }
    if (mtimeMs === lastMtimeMs) return;
    lastMtimeMs = mtimeMs;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, DEBOUNCE_MS);
  });
}
