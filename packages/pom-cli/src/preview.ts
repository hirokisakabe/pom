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
  const fontDirs = fs.existsSync(fontsDir) ? [fontsDir] : [];

  const slides = await convertPptxToSvg(buffer, {
    width: slideWidth,
    fontDirs,
    fontMapping: EXTRA_FONT_MAPPING,
    skipSystemFonts: true,
  });
  const svgs = slides.map((s: { svg: string }) => s.svg);

  return { type: "success", svgs, slideWidth };
}

function buildPreviewHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>pom preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f5f5f5; font-family: sans-serif; }
  .toolbar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; gap: 4px;
    padding: 6px 16px; background: #fff;
    border-bottom: 1px solid #ddd;
  }
  .zoom-btn {
    padding: 3px 10px; font-size: 12px;
    border: 1px solid #ccc; border-radius: 3px;
    background: #fff; color: #333; cursor: pointer;
  }
  .zoom-btn:hover { background: #e8e8e8; }
  .zoom-btn.active { background: #007acc; color: #fff; border-color: #007acc; }
  .status { margin-left: auto; font-size: 12px; color: #888; }
  .slides-container { padding: 16px; }
  .slide-wrapper { margin-bottom: 24px; }
  .slide-label { font-size: 12px; color: #888; margin-bottom: 4px; }
  .slide-frame {
    border: 1px solid #ddd; border-radius: 4px;
    overflow: hidden; background: #fff; display: inline-block;
  }
  .slide-frame svg { display: block; }
  .error-banner {
    background: #fee; border: 1px solid #fcc;
    border-radius: 4px; padding: 12px; margin: 16px; color: #c00;
  }
  .loading-message, .empty-message {
    display: flex; align-items: center; justify-content: center;
    height: calc(100vh - 40px); color: #888; flex-direction: column; gap: 8px;
  }
</style>
</head>
<body>
<div class="toolbar">
  <button class="zoom-btn" data-zoom="fit">Fit to Width</button>
  <button class="zoom-btn" data-zoom="50">50%</button>
  <button class="zoom-btn" data-zoom="75">75%</button>
  <button class="zoom-btn" data-zoom="100">100%</button>
  <button class="zoom-btn" data-zoom="150">150%</button>
  <span class="status" id="status">Connecting...</span>
</div>
<div id="content"><div class="loading-message"><span>Building preview...</span></div></div>

<script>
(function() {
  var VALID_ZOOMS = ['fit', '50', '75', '100', '150'];
  var currentZoom = localStorage.getItem('pom-zoom') || 'fit';
  var currentSlideWidth = 1280;

  applyZoom(currentZoom);

  document.querySelectorAll('.zoom-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var zoom = this.getAttribute('data-zoom');
      applyZoom(zoom);
      localStorage.setItem('pom-zoom', zoom);
    });
  });

  function applyZoom(zoom) {
    if (VALID_ZOOMS.indexOf(zoom) === -1) zoom = 'fit';
    currentZoom = zoom;
    document.body.setAttribute('data-zoom', zoom);
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
      svg.style.width = '100%';
      svg.style.height = 'auto';
      frame.style.display = 'block';
    } else {
      var scale = parseInt(zoom) / 100;
      svg.style.width = (slideWidth * scale) + 'px';
      svg.style.height = 'auto';
      frame.style.display = 'inline-block';
    }
  }

  var status = document.getElementById('status');
  var content = document.getElementById('content');

  var es = new EventSource('/_sse');

  es.addEventListener('open', function() {
    status.textContent = 'Connected';
  });

  es.addEventListener('update', function(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'success') {
      currentSlideWidth = data.slideWidth;
      status.textContent = 'Updated ' + new Date().toLocaleTimeString();
      var slideHtml = data.svgs.map(function(svg, i) {
        return '<div class="slide-wrapper">' +
          '<div class="slide-label">Slide ' + (i + 1) + '</div>' +
          '<div class="slide-frame">' + svg + '</div>' +
        '</div>';
      }).join('');
      content.innerHTML = '<div class="slides-container">' + slideHtml + '</div>';
      document.querySelectorAll('.slide-frame svg').forEach(function(svgEl) {
        applySvgZoom(svgEl, currentZoom, currentSlideWidth);
      });
    } else if (data.type === 'error') {
      status.textContent = 'Error';
      var escaped = data.message
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      content.innerHTML = '<div class="error-banner"><strong>Error:</strong> ' + escaped + '</div>';
    } else if (data.type === 'empty') {
      status.textContent = 'No slides';
      content.innerHTML = '<div class="empty-message">No slides to preview</div>';
    } else if (data.type === 'building') {
      status.textContent = 'Building...';
      content.innerHTML = '<div class="loading-message"><span>Building preview...</span></div>';
    }
  });

  es.addEventListener('error', function() {
    status.textContent = 'Disconnected — retrying...';
  });
})();
</script>
</body>
</html>`;
}

export function runPreview(inputFile: string): void {
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

  const html = buildPreviewHtml();

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
        `Port ${DEFAULT_PORT} is already in use. Is another pom preview running?`,
      );
    } else {
      console.error(`Server error: ${err.message}`);
    }
    process.exit(1);
  });

  server.listen(DEFAULT_PORT, () => {
    console.log(`Preview server: http://localhost:${DEFAULT_PORT}`);
    console.log(`Watching: ${absInput}`);
    console.log("Press Ctrl+C to stop");
  });
}
