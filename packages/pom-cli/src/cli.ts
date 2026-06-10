#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { DiagnosticsError } from "@hirokisakabe/pom";
import { runBuild, runBuildWatch } from "./build.ts";
import { runPreview } from "./preview.ts";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const program = new Command();

program
  .name("pom")
  .description("CLI tool for pom — preview and build presentations")
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
            process.exit(1);
          },
        );
      }
    },
  );

program.parse();
