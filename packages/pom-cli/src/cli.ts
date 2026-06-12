#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { DiagnosticsError } from "@hirokisakabe/pom";
import { runBuild, runBuildWatch } from "./build.ts";
import { runPreview } from "./preview.ts";
import { runRender, type RenderFormat, type TextOutput } from "./render.ts";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const program = new Command();

function printBuildError(err: unknown): void {
  if (err instanceof DiagnosticsError) {
    const count = err.diagnostics.length;
    console.error(
      `✗ Build failed (${count} ${count === 1 ? "error" : "errors"})\n`,
    );
    for (const d of err.diagnostics) {
      console.error(`  [${d.code}] ${d.message}`);
    }
  } else {
    console.error(err instanceof Error ? err.message : String(err));
  }
}

program
  .name("pom")
  .description("CLI tool for pom — preview, build, and render presentations")
  .version(version);

program
  .command("preview")
  .description("Start a live preview server for a presentation")
  .argument("<input>", "Input file (.pom.xml or .pom.md)")
  .option("--port <number>", "Port to listen on")
  .option("--verbose", "Show build step timing on stderr")
  .option("--no-open", "Do not open the browser automatically")
  .action(
    (
      input: string,
      options: { port?: string; verbose?: boolean; open: boolean },
    ) => {
      let port: number | undefined;
      if (options.port !== undefined) {
        port = Number(options.port);
        if (!Number.isInteger(port) || port <= 0 || port > 65535) {
          console.error(`Invalid port: ${options.port}`);
          process.exit(1);
        }
      }
      try {
        runPreview(input, port, {
          verbose: options.verbose,
          open: options.open,
        });
      } catch (err: unknown) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    },
  );

program
  .command("build")
  .description("Build a presentation to PPTX")
  .argument("<input>", "Input file (.pom.xml or .pom.md)")
  .requiredOption("-o <output>", "Output PPTX file")
  .option("--verbose", "Show build step timing on stderr")
  .option("--watch", "Watch for file changes and rebuild automatically")
  .action(
    (
      input: string,
      options: { o: string; verbose?: boolean; watch?: boolean },
    ) => {
      if (options.watch) {
        runBuildWatch(input, options.o, { verbose: options.verbose }).catch(
          (err: unknown) => {
            console.error(err instanceof Error ? err.message : String(err));
            process.exit(1);
          },
        );
      } else {
        runBuild(input, options.o, { verbose: options.verbose }).catch(
          (err: unknown) => {
            printBuildError(err);
            process.exit(1);
          },
        );
      }
    },
  );

program
  .command("render")
  .description("Render each slide to a PNG or SVG image")
  .argument("<input>", "Input file (.pom.xml or .pom.md)")
  .requiredOption("-o <dir>", "Output directory for rendered images")
  .option("--format <format>", "Output format: png or svg", "png")
  .option(
    "--slides <numbers>",
    "Comma-separated slide numbers to render (e.g. 2,5)",
  )
  .option(
    "--text-output <mode>",
    'SVG text output mode: "path" (glyph outlines) or "text" (native <text> with embedded subset fonts). Only valid with --format svg',
  )
  .option("--verbose", "Show build step timing on stderr")
  .action(
    (
      input: string,
      options: {
        o: string;
        format: string;
        slides?: string;
        textOutput?: string;
        verbose?: boolean;
      },
    ) => {
      if (options.format !== "png" && options.format !== "svg") {
        console.error(
          `Invalid format: ${options.format} (expected "png" or "svg")`,
        );
        process.exit(1);
      }
      const format: RenderFormat = options.format;
      if (options.textOutput !== undefined) {
        if (options.textOutput !== "path" && options.textOutput !== "text") {
          console.error(
            `Invalid text output mode: ${options.textOutput} (expected "path" or "text")`,
          );
          process.exit(1);
        }
        if (format !== "svg") {
          console.error("--text-output is only valid with --format svg");
          process.exit(1);
        }
      }
      const textOutput: TextOutput | undefined = options.textOutput;
      let slides: number[] | undefined;
      if (options.slides !== undefined) {
        slides = options.slides.split(",").map((s) => Number(s.trim()));
        if (
          slides.length === 0 ||
          slides.some((n) => !Number.isInteger(n) || n <= 0)
        ) {
          console.error(
            `Invalid slides: ${options.slides} (expected comma-separated slide numbers, e.g. 2,5)`,
          );
          process.exit(1);
        }
      }
      runRender(input, options.o, {
        format,
        slides,
        textOutput,
        verbose: options.verbose,
      }).catch((err: unknown) => {
        printBuildError(err);
        process.exit(1);
      });
    },
  );

program.parse();
