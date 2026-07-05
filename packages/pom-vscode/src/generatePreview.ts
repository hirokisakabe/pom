import * as fs from "fs";
import * as path from "path";
import { parseMd } from "@hirokisakabe/pom-md";
import { buildPptx, type Diagnostic } from "@hirokisakabe/pom";
import { convertPptxToSvg } from "pptx-glimpse";

export const DEFAULT_SLIDE_WIDTH = 1280;
export const DEFAULT_SLIDE_HEIGHT = 720;

/** 入力形式 */
export type InputFormat = "markdown" | "xml";

/**
 * pptx-glimpse の DEFAULT_FONT_MAPPING に含まれないテーマフォントの追加マッピング。
 * pptxgenjs のテーマフォントに「游ゴシック Light」が含まれるが、
 * DEFAULT_FONT_MAPPING には「游ゴシック」のみでLight は未定義のため補完する。
 */
const EXTRA_FONT_MAPPING: Record<string, string> = {
  "游ゴシック Light": "Noto Sans CJK JP",
  "Yu Gothic Light": "Noto Sans CJK JP",
};

type PreviewResult =
  | { type: "empty" }
  | {
      type: "success";
      svgs: string[];
      diagnostics: Diagnostic[];
      slideWidth: number;
    }
  | { type: "error"; message: string };

/**
 * Markdown または XML から SVG プレビューを生成する純粋関数
 */
export async function generatePreviewSvg(
  content: string,
  fontDirs: string[],
  format: InputFormat = "markdown",
  documentPath?: string,
): Promise<PreviewResult> {
  try {
    let xml: string;
    let slideWidth = DEFAULT_SLIDE_WIDTH;
    let slideHeight = DEFAULT_SLIDE_HEIGHT;
    let masterPptxData: Uint8Array | undefined;

    if (format === "xml") {
      xml = content;
    } else {
      const result = parseMd(content);
      xml = result.xml;
      slideWidth = result.meta.size.w;
      slideHeight = result.meta.size.h;

      if (result.meta.masterPptx && documentPath) {
        const masterPath = path.resolve(
          path.dirname(documentPath),
          result.meta.masterPptx,
        );
        try {
          masterPptxData = new Uint8Array(fs.readFileSync(masterPath));
        } catch (e: unknown) {
          // ファイルが見つからない場合のみ無視（プレビュー時に masterPptx なしで続行）
          if (!(e instanceof Error && "code" in e && e.code === "ENOENT")) {
            throw e;
          }
        }
      }
    }

    if (!xml.trim()) {
      return { type: "empty" };
    }

    const { pptx, diagnostics } = await buildPptx(
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

    const { slides } = await convertPptxToSvg(buffer, {
      width: slideWidth,
      fontDirs,
      fontMapping: EXTRA_FONT_MAPPING,
    });
    const svgs = slides.map((s) => s.svg);

    return { type: "success", svgs, diagnostics, slideWidth };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { type: "error", message };
  }
}

export type ZoomLevel = "fit" | "50" | "75" | "100" | "150";

export const ZOOM_LEVELS: { value: ZoomLevel; label: string }[] = [
  { value: "fit", label: "Fit to Width" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
  { value: "150", label: "150%" },
];

export function buildHtml(
  svgs: string[],
  nonce: string,
  defaultZoom: ZoomLevel,
  slideWidth: number = DEFAULT_SLIDE_WIDTH,
): string {
  if (svgs.length === 0) {
    return `<!DOCTYPE html>
<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#888;">
<p>No slides to preview</p>
</body></html>`;
  }

  const slideElements = svgs
    .map(
      (svg, i) => `
    <div class="slide-wrapper">
      <div class="slide-label">Slide ${i + 1}</div>
      <div class="slide-frame">
        ${svg}
      </div>
    </div>`,
    )
    .join("");

  const zoomButtons = ZOOM_LEVELS.map(
    ({ value, label }) =>
      `<button class="zoom-btn" data-zoom="${value}">${label}</button>`,
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; img-src data:;">
<style nonce="${nonce}">
  body {
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    font-family: sans-serif;
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: var(--vscode-editor-background, #f5f5f5);
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
  }
  .zoom-btn {
    padding: 3px 10px;
    font-size: 12px;
    border: 1px solid var(--vscode-button-border, #ccc);
    border-radius: 3px;
    background: var(--vscode-button-secondaryBackground, #fff);
    color: var(--vscode-button-secondaryForeground, #333);
    cursor: pointer;
  }
  .zoom-btn:hover {
    background: var(--vscode-button-secondaryHoverBackground, #e8e8e8);
  }
  .zoom-btn.active {
    background: var(--vscode-button-background, #007acc);
    color: var(--vscode-button-foreground, #fff);
    border-color: var(--vscode-button-background, #007acc);
  }
  .slides-container {
    padding: 16px;
  }
  .slide-wrapper {
    margin-bottom: 24px;
  }
  .slide-label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
  }
  .slide-frame {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    display: inline-block;
  }
  .slide-frame svg {
    display: block;
  }
  /* Fit to Width: SVG の幅をコンテナに合わせる */
  body[data-zoom="fit"] .slide-frame {
    display: block;
  }
  body[data-zoom="fit"] .slide-frame svg {
    width: 100%;
    height: auto;
  }
  /* 固定ズーム: SVG 幅を SLIDE_WIDTH のパーセンテージに設定 */
  body[data-zoom="50"] .slide-frame svg {
    width: ${slideWidth * 0.5}px;
    height: auto;
  }
  body[data-zoom="75"] .slide-frame svg {
    width: ${slideWidth * 0.75}px;
    height: auto;
  }
  body[data-zoom="100"] .slide-frame svg {
    width: ${slideWidth}px;
    height: auto;
  }
  body[data-zoom="150"] .slide-frame svg {
    width: ${slideWidth * 1.5}px;
    height: auto;
  }
</style>
</head>
<body data-zoom="${defaultZoom}">
  <div class="toolbar">
    ${zoomButtons}
  </div>
  <div class="slides-container">
    ${slideElements}
  </div>
  <script nonce="${nonce}">
    (function() {
      const vscode = acquireVsCodeApi();

      // 前回の状態を復元
      const previousState = vscode.getState();
      if (previousState && previousState.zoom) {
        applyZoom(previousState.zoom);
      }

      // Extension からのメッセージを受信
      window.addEventListener('message', function(event) {
        const message = event.data;
        if (message.type === 'setZoom') {
          applyZoom(message.zoom);
        }
      });

      // ズームボタンのクリックイベント
      document.querySelectorAll('.zoom-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var zoom = this.getAttribute('data-zoom');
          applyZoom(zoom);
          vscode.setState({ zoom: zoom });
          vscode.postMessage({ type: 'zoomChanged', zoom: zoom });
        });
      });

      var VALID_ZOOMS = ['fit','50','75','100','150'];
      function applyZoom(zoom) {
        if (VALID_ZOOMS.indexOf(zoom) === -1) zoom = 'fit';
        document.body.setAttribute('data-zoom', zoom);
        document.querySelectorAll('.zoom-btn').forEach(function(b) {
          b.classList.toggle('active', b.getAttribute('data-zoom') === zoom);
        });
      }

      // 初期状態のボタンをアクティブにする
      var currentZoom = document.body.getAttribute('data-zoom');
      applyZoom(currentZoom);
    })();
  </script>
</body>
</html>`;
}

export function buildErrorHtml(message: string): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:16px;font-family:sans-serif;">
<div style="background:#fee;border:1px solid #fcc;border-radius:4px;padding:12px;color:#c00;">
  <strong>Error:</strong> ${escaped}
</div>
</body></html>`;
}
