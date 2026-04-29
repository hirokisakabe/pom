import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { generatePreviewSvg } from "../generatePreview.js";

// esbuild が CJS にバンドルするため、実行時に __dirname は利用可能
declare const __dirname: string;

/**
 * sample.pom.md を一時ディレクトリにコピーし、テスト用ファイルパスを返す。
 * 元ファイルの変更を防ぐため、テストは常にコピーを使用する。
 */
function createTempPomFile(): string {
  const src = path.resolve(__dirname, "../../sample.pom.md");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-test-"));
  const dest = path.join(tmpDir, "sample.pom.md");
  fs.copyFileSync(src, dest);
  return dest;
}

/**
 * 条件が true になるまでポーリングで待機する。
 * 固定 sleep よりも安定かつ高速。
 */
async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 10000,
  intervalMs = 200,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

function hasPreviewTab(): boolean {
  return vscode.window.tabGroups.all.some((group) =>
    group.tabs.some((tab) => tab.label === "pom Preview"),
  );
}

suite("pom-vscode Extension", () => {
  // 拡張機能が読み込まれるまで待機
  suiteSetup(async () => {
    const ext = vscode.extensions.getExtension("hirokisakabe.pom-vscode");
    assert.ok(ext, "Extension should be installed");
    if (!ext.isActive) {
      await ext.activate();
    }
  });

  // 各テスト後にエディタとパネルを閉じて状態を初期化
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  });

  test("pom.openPreview command is registered", async () => {
    const commands = await vscode.commands.getCommands(false);
    assert.ok(
      commands.includes("pom.openPreview"),
      "pom.openPreview should be in the command list",
    );
  });

  test("opens preview panel for .pom.md file", async () => {
    const tmpFile = createTempPomFile();
    const doc = await vscode.workspace.openTextDocument(tmpFile);
    await vscode.window.showTextDocument(doc);

    await vscode.commands.executeCommand("pom.openPreview");

    await waitFor(() => hasPreviewTab());
    assert.ok(hasPreviewTab(), "Preview panel should be opened");
  });

  test("fontDirs resolves to existing fonts directory with required font files", async () => {
    const ext = vscode.extensions.getExtension("hirokisakabe.pom-vscode");
    assert.ok(ext, "Extension should be installed");
    const fontsDir = path.join(ext.extensionPath, "fonts");
    assert.ok(
      fs.existsSync(fontsDir),
      `fonts directory should exist at ${fontsDir}`,
    );
    const files = fs.readdirSync(fontsDir);
    // CJK フォントが存在すること（.notdef 回避に必須）
    assert.ok(
      files.includes("NotoSansCJKjp-Regular.otf"),
      "fonts directory should contain NotoSansCJKjp-Regular.otf for CJK rendering",
    );
    // ラテン文字フォントが存在すること
    assert.ok(
      files.includes("Carlito-Regular.ttf"),
      "fonts directory should contain Carlito-Regular.ttf for Latin rendering",
    );
  });

  test("generated SVG does not contain .notdef glyphs", async () => {
    const ext = vscode.extensions.getExtension("hirokisakabe.pom-vscode");
    assert.ok(ext, "Extension should be installed");
    const fontDirs = [path.join(ext.extensionPath, "fonts")];
    // 日本語文字を含む入力で CJK フォント解決を検証する
    const markdown = [
      "---",
      "size: 16:9",
      "---",
      "",
      "# 日本語テキストのテスト",
      "",
      "- ライブプレビュー機能",
      "- 編集すると即座に反映",
    ].join("\n");

    const result = await generatePreviewSvg(markdown, fontDirs);
    assert.strictEqual(
      result.type,
      "success",
      "Preview generation should succeed",
    );
    assert.ok(
      result.type === "success" && result.svgs.length > 0,
      "Should produce at least one SVG",
    );
    if (result.type === "success") {
      for (const svg of result.svgs) {
        assert.ok(svg.includes("<svg"), "Output should be valid SVG");
        assert.ok(
          !svg.includes(".notdef"),
          "SVG should not contain .notdef glyph references",
        );
      }
    }
  });

  test("generates preview with Icon nodes (resvg-wasm bundled)", async () => {
    const ext = vscode.extensions.getExtension("hirokisakabe.pom-vscode");
    assert.ok(ext, "Extension should be installed");
    const fontDirs = [path.join(ext.extensionPath, "fonts")];
    // Icon ノードを含む XML でプレビュー生成を検証
    // バンドル後の環境で @resvg/resvg-wasm が正しく解決されることを確認する
    const xml = [
      "<Slide>",
      '  <HStack w="1280" h="720" gap="24" alignItems="center">',
      '    <Icon name="star" size="48" color="#f59e0b" />',
      '    <Text fontSize="24">Icon test</Text>',
      "  </HStack>",
      "</Slide>",
    ].join("\n");

    const result = await generatePreviewSvg(xml, fontDirs, "xml");
    assert.strictEqual(
      result.type,
      "success",
      `Preview with Icon should succeed, got: ${result.type === "error" ? result.message : result.type}`,
    );
    if (result.type === "success") {
      assert.ok(result.svgs.length > 0, "Should produce at least one SVG");
      // アイコンがラスタライズされ、base64 PNG として埋め込まれていることを確認
      const hasPngEmbed = result.svgs.some((svg) =>
        svg.includes("data:image/png;base64,"),
      );
      assert.ok(
        hasPngEmbed,
        "SVG should contain base64-encoded PNG icon image",
      );
    }
  });

  test("updates preview on text change", async () => {
    const tmpFile = createTempPomFile();
    const doc = await vscode.workspace.openTextDocument(tmpFile);
    const editor = await vscode.window.showTextDocument(doc);

    await vscode.commands.executeCommand("pom.openPreview");
    await waitFor(() => hasPreviewTab());

    // 変更前の HTML を記録
    const previewTabBefore = vscode.window.tabGroups.all
      .flatMap((g) => g.tabs)
      .find((t) => t.label === "pom Preview");
    assert.ok(previewTabBefore, "Preview tab should exist before edit");

    // テキストを変更
    await editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), "<!-- test -->\n");
    });

    // デバウンス(500ms) + レンダリング完了を待つ
    // PomPreviewPanel は非同期レンダリング後に webview.html を更新する
    await new Promise((r) => setTimeout(r, 1500));

    // パネルがまだ存在していること（エラーで閉じていないこと）を確認
    assert.ok(
      hasPreviewTab(),
      "Preview panel should still exist after text change",
    );
  });
});
