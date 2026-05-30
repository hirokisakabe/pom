import fs from "fs";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import { buildPptx } from "@hirokisakabe/pom";
import { parseMd } from "@hirokisakabe/pom-md";
import { convertPptxToSvg } from "pptx-glimpse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PORT = 3000;

const EXTRA_FONT_MAPPING: Record<string, string> = {
  "游ゴシック Light": "Noto Sans CJK JP",
  "Yu Gothic Light": "Noto Sans CJK JP",
};

type SvgResult =
  | { type: "success"; svgs: string[]; slideWidth: number }
  | { type: "error"; message: string }
  | { type: "empty" };

async function generateSvgs(inputFile: string): Promise<SvgResult> {
  const content = fs.readFileSync(inputFile, "utf-8");
  const ext = path.extname(inputFile);

  let xml: string;
  let slideWidth = 1280;
  let slideHeight = 720;
  let masterPptxData: Uint8Array | undefined;

  if (ext === ".md") {
    const result = parseMd(content);
    xml = result.xml;
    slideWidth = result.meta.size.w;
    slideHeight = result.meta.size.h;

    if (result.meta.masterPptx) {
      const masterPath = path.resolve(
        path.dirname(inputFile),
        result.meta.masterPptx,
      );
      try {
        masterPptxData = new Uint8Array(fs.readFileSync(masterPath));
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "ENOENT") {
          process.stderr.write(
            `Warning: masterPptx not found: ${masterPath}\n`,
          );
        } else {
          throw e;
        }
      }
    }
  } else {
    xml = content;
  }

  if (!xml.trim()) {
    return { type: "empty" };
  }

  const { pptx } = await buildPptx(
    xml,
    { w: slideWidth, h: slideHeight },
    {
      textMeasurement: "fallback",
      ...(masterPptxData ? { masterPptx: masterPptxData } : {}),
    },
  );

  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }

  const fontsDir = path.resolve(__dirname, "../fonts");
  if (!fs.existsSync(fontsDir)) {
    throw new Error(
      `Bundled fonts directory not found: ${fontsDir}. The package may be corrupted.`,
    );
  }
  const fontDirs = [fontsDir];

  const slides = await convertPptxToSvg(buffer, {
    width: slideWidth,
    fontDirs,
    fontMapping: EXTRA_FONT_MAPPING,
    skipSystemFonts: true,
  });
  const svgs = slides.map((s: { svg: string }) => s.svg);

  return { type: "success", svgs, slideWidth };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPreviewHtml(filename: string): string {
  const safeFilename = escapeHtml(filename);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>pom — ${safeFilename}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0f0f13;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #e2e2e8;
    min-height: 100vh;
  }
  .toolbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 12px;
    padding: 0 20px; height: 48px;
    background: #1a1a2e;
    border-bottom: 1px solid #2d2d4e;
  }
  .app-name {
    font-size: 13px; font-weight: 700;
    color: #a78bfa; letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .filename {
    font-size: 12px; color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    background: #0f172a; border: 1px solid #2d2d4e;
    padding: 2px 8px; border-radius: 4px;
    flex-shrink: 1; min-width: 0; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }
  .zoom-controls { display: flex; gap: 4px; flex-shrink: 0; }
  .zoom-btn {
    padding: 4px 10px; font-size: 11px;
    border: 1px solid #3d3d5e; border-radius: 4px;
    background: #2d2d4e; color: #c4c4d4; cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .zoom-btn:hover { background: #3d3d6e; color: #e2e2f2; }
  .zoom-btn.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
  .zoom-hint { font-size: 11px; color: #3d3d5e; flex-shrink: 0; }
  .status-group {
    margin-left: auto; display: flex; align-items: center;
    gap: 6px; flex-shrink: 0;
  }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #f59e0b;
    transition: background 0.3s, box-shadow 0.3s;
  }
  .status-dot.connected { background: #22c55e; box-shadow: 0 0 6px #22c55e88; }
  .status-dot.warning   { background: #f59e0b; box-shadow: 0 0 6px #f59e0b88; }
  .status-dot.error     { background: #ef4444; box-shadow: 0 0 6px #ef444488; }
  .status-text { font-size: 12px; color: #94a3b8; }
  .slides-container {
    padding: 32px 20px;
    display: flex; flex-direction: column;
    align-items: center; gap: 32px;
  }
  .slide-wrapper { width: 100%; display: flex; justify-content: center; }
  .slide-frame {
    position: relative;
    border-radius: 8px; overflow: hidden; background: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
  }
  .slide-frame svg { display: block; }
  .slide-number {
    position: absolute; bottom: 10px; right: 12px;
    font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,0.8);
    background: rgba(0,0,0,0.5);
    padding: 2px 8px; border-radius: 3px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    pointer-events: none; user-select: none;
  }
  .loading-screen {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    height: calc(100vh - 48px); gap: 16px;
  }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #2d2d4e;
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: #555578; }
  .empty-screen {
    display: flex; align-items: center; justify-content: center;
    height: calc(100vh - 48px);
    font-size: 13px; color: #555578;
  }
  .error-screen { padding: 32px; display: flex; justify-content: center; }
  .error-block {
    max-width: 720px; width: 100%;
    background: #1a0a0a; border: 1px solid #5c1a1a;
    border-radius: 8px; overflow: hidden;
  }
  .error-header {
    padding: 10px 16px; background: #2a0a0a;
    border-bottom: 1px solid #5c1a1a;
    font-size: 12px; font-weight: 600; color: #f87171;
  }
  .error-body {
    padding: 14px 16px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 12px; color: #fca5a5; line-height: 1.6;
    white-space: pre-wrap; word-break: break-all;
  }
</style>
</head>
<body>
<div class="toolbar">
  <span class="app-name">pom</span>
  <span class="filename">${safeFilename}</span>
  <div class="zoom-controls">
    <button class="zoom-btn" data-zoom="fit">Fit</button>
    <button class="zoom-btn" data-zoom="50">50%</button>
    <button class="zoom-btn" data-zoom="75">75%</button>
    <button class="zoom-btn" data-zoom="100">100%</button>
    <button class="zoom-btn" data-zoom="150">150%</button>
  </div>
  <span class="zoom-hint">+ / −</span>
  <div class="status-group">
    <span class="status-dot warning" id="statusDot"></span>
    <span class="status-text" id="statusText">Connecting...</span>
  </div>
</div>
<div id="content">
  <div class="loading-screen">
    <div class="spinner"></div>
    <span class="loading-text">Building preview...</span>
  </div>
</div>

<script>
(function() {
  var ZOOM_STEPS = ['fit', '50', '75', '100', '150'];
  var currentZoom = localStorage.getItem('pom-zoom') || 'fit';
  var currentSlideWidth = 1280;

  if (ZOOM_STEPS.indexOf(currentZoom) === -1) currentZoom = 'fit';
  applyZoom(currentZoom);

  document.querySelectorAll('.zoom-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      setZoom(this.getAttribute('data-zoom'));
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '+' || e.key === '=') {
      var idx = ZOOM_STEPS.indexOf(currentZoom);
      if (idx < ZOOM_STEPS.length - 1) setZoom(ZOOM_STEPS[idx + 1]);
    } else if (e.key === '-') {
      var idx = ZOOM_STEPS.indexOf(currentZoom);
      if (idx > 0) setZoom(ZOOM_STEPS[idx - 1]);
    }
  });

  function setZoom(zoom) {
    localStorage.setItem('pom-zoom', zoom);
    applyZoom(zoom);
  }

  function applyZoom(zoom) {
    if (ZOOM_STEPS.indexOf(zoom) === -1) zoom = 'fit';
    currentZoom = zoom;
    document.querySelectorAll('.zoom-btn').forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-zoom') === zoom);
    });
    document.querySelectorAll('.slide-frame svg').forEach(function(svg) {
      applySvgZoom(svg, zoom, currentSlideWidth);
    });
  }

  function applySvgZoom(svg, zoom, slideWidth) {
    var frame = svg.closest('.slide-frame');
    if (zoom === 'fit') {
      frame.style.width = '100%';
      frame.style.maxWidth = slideWidth + 'px';
      svg.style.width = '100%';
      svg.style.height = 'auto';
    } else {
      var scale = parseInt(zoom) / 100;
      frame.style.width = (slideWidth * scale) + 'px';
      frame.style.maxWidth = '';
      svg.style.width = (slideWidth * scale) + 'px';
      svg.style.height = 'auto';
    }
  }

  var statusDot = document.getElementById('statusDot');
  var statusText = document.getElementById('statusText');
  var content = document.getElementById('content');

  function setStatus(state, text) {
    statusDot.className = 'status-dot ' + state;
    statusText.textContent = text;
  }

  var es = new EventSource('/_sse');

  es.addEventListener('open', function() {
    setStatus('connected', 'Connected');
  });

  es.addEventListener('update', function(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'success') {
      currentSlideWidth = data.slideWidth;
      setStatus('connected', 'Updated ' + new Date().toLocaleTimeString());
      var total = data.svgs.length;
      var slideHtml = data.svgs.map(function(svg, i) {
        return '<div class="slide-wrapper">' +
          '<div class="slide-frame">' + svg +
            '<span class="slide-number">' + (i + 1) + ' / ' + total + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
      content.innerHTML = '<div class="slides-container">' + slideHtml + '</div>';
      document.querySelectorAll('.slide-frame svg').forEach(function(svgEl) {
        applySvgZoom(svgEl, currentZoom, currentSlideWidth);
      });
    } else if (data.type === 'error') {
      setStatus('error', 'Error');
      var escaped = data.message
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      content.innerHTML =
        '<div class="error-screen">' +
          '<div class="error-block">' +
            '<div class="error-header">&#9888; Build Error</div>' +
            '<pre class="error-body">' + escaped + '</pre>' +
          '</div>' +
        '</div>';
    } else if (data.type === 'empty') {
      setStatus('connected', 'No slides');
      content.innerHTML = '<div class="empty-screen">No slides to preview</div>';
    } else if (data.type === 'building') {
      setStatus('warning', 'Building...');
      content.innerHTML =
        '<div class="loading-screen">' +
          '<div class="spinner"></div>' +
          '<span class="loading-text">Building preview...</span>' +
        '</div>';
    }
  });

  es.addEventListener('error', function() {
    setStatus('error', 'Disconnected — retrying...');
  });
})();
</script>
</body>
</html>`;
}

export function runPreview(
  inputFile: string,
  port: number = DEFAULT_PORT,
): void {
  const absInput = path.resolve(inputFile);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  const clients: http.ServerResponse[] = [];
  let currentResult: SvgResult = { type: "empty" };
  let initialBuildDone = false;

  function broadcast(result: SvgResult): void {
    currentResult = result;
    const data = JSON.stringify(result);
    for (const client of clients) {
      client.write(`event: update\ndata: ${data}\n\n`);
    }
  }

  function broadcastBuilding(): void {
    const data = JSON.stringify({ type: "building" });
    for (const client of clients) {
      client.write(`event: update\ndata: ${data}\n\n`);
    }
  }

  function refresh(): void {
    broadcastBuilding();
    generateSvgs(absInput)
      .then(broadcast)
      .catch((err: unknown) => {
        broadcast({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      });
  }

  generateSvgs(absInput)
    .then((result) => {
      currentResult = result;
      initialBuildDone = true;
      broadcast(result);
    })
    .catch((err: unknown) => {
      initialBuildDone = true;
      broadcast({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    });

  let debounceTimer: NodeJS.Timeout | null = null;
  fs.watch(absInput, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(refresh, 100);
  });

  const html = buildPreviewHtml(path.basename(absInput));

  const server = http.createServer((req, res) => {
    if (req.url === "/_sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");

      if (!initialBuildDone) {
        res.write(
          `event: update\ndata: ${JSON.stringify({ type: "building" })}\n\n`,
        );
      } else {
        res.write(`event: update\ndata: ${JSON.stringify(currentResult)}\n\n`);
      }

      clients.push(res);
      req.on("close", () => {
        const idx = clients.indexOf(res);
        if (idx !== -1) clients.splice(idx, 1);
      });
    } else {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    }
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Is another pom preview running?`,
      );
    } else {
      console.error(`Server error: ${err.message}`);
    }
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`Preview server: http://localhost:${port}`);
    console.log(`Watching: ${absInput}`);
    console.log("Press Ctrl+C to stop");
  });
}
