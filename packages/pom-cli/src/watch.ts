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

  return fs.watch(dir, (_eventType, filename) => {
    // filename can be null on some platforms; treat it as a potential match
    if (filename !== null && filename !== base) return;
    if (!fs.existsSync(absPath)) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, DEBOUNCE_MS);
  });
}
