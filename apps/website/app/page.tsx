import { Geist, Geist_Mono } from "next/font/google";
import { type StaticImageData } from "next/image";
import Link from "next/link";
import { codeToHtml } from "shiki";
import "./landing.css";
import { NodeGallery } from "./NodeGallery";

import chartImg from "@/content/images/chart.png";
import flowImg from "@/content/images/flow.png";
import hstackImg from "@/content/images/hstack.png";
import iconImg from "@/content/images/icon.png";
import imageImg from "@/content/images/image.png";
import layerImg from "@/content/images/layer.png";
import lineImg from "@/content/images/line.png";
import matrixImg from "@/content/images/matrix.png";
import processArrowImg from "@/content/images/processArrow.png";
import pyramidImg from "@/content/images/pyramid.png";
import shapeImg from "@/content/images/shape.png";
import tableImg from "@/content/images/table.png";
import textImg from "@/content/images/text.png";
import timelineImg from "@/content/images/timeline.png";
import treeImg from "@/content/images/tree.png";
import vstackImg from "@/content/images/vstack.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const features = [
  {
    title: "AI Friendly",
    description:
      "Simple XML structure designed for LLM code generation. Include llm.txt in your system prompt for XML reference.",
    icon: "🤖",
  },
  {
    title: "Declarative",
    description:
      "Describe slides as XML. No imperative API calls needed — just data in, PPTX out.",
    icon: "📝",
  },
  {
    title: "Flexible Layout",
    description:
      "Flexbox-style layout with VStack / HStack, powered by yoga-layout.",
    icon: "📐",
  },
  {
    title: "Rich Nodes",
    description:
      "18 built-in node types: charts, flowcharts, tables, timelines, org trees, and more.",
    icon: "🧩",
  },
  {
    title: "PowerPoint Native",
    description:
      "Generates real editable PowerPoint shapes — not images. Recipients can modify everything.",
    icon: "📊",
  },
  {
    title: "Master Slide",
    description:
      "Define headers, footers, and page numbers once — applied to all slides automatically.",
    icon: "🎨",
  },
];

const nodes: { name: string; image: StaticImageData }[] = [
  { name: "Text", image: textImg },
  { name: "Table", image: tableImg },
  { name: "Chart", image: chartImg },
  { name: "Shape", image: shapeImg },
  { name: "Image", image: imageImg },
  { name: "Icon", image: iconImg },
  { name: "Flow", image: flowImg },
  { name: "Timeline", image: timelineImg },
  { name: "Matrix", image: matrixImg },
  { name: "Tree", image: treeImg },
  { name: "ProcessArrow", image: processArrowImg },
  { name: "Pyramid", image: pyramidImg },
  { name: "Line", image: lineImg },
  { name: "Layer", image: layerImg },
  { name: "VStack", image: vstackImg },
  { name: "HStack", image: hstackImg },
];

const codeExample = `import { buildPptx } from "@hirokisakabe/pom";

const xml = \`
<VStack w="100%" h="max" padding="48" gap="24" alignItems="start">
  <Text fontSize="48" bold="true">
    Presentation Title
  </Text>
  <Text fontSize="24" color="666666">
    Generated with pom
  </Text>
</VStack>
\`;

const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "presentation.pptx" });`;

export default async function LandingPage() {
  const [highlightedCode, highlightedInstall, highlightedGenerate] =
    await Promise.all([
      codeToHtml(codeExample, { lang: "typescript", theme: "github-dark" }),
      codeToHtml("npm install @hirokisakabe/pom", {
        lang: "bash",
        theme: "github-dark",
      }),
      codeToHtml(
        `const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });\nawait pptx.writeFile({ fileName: "presentation.pptx" });`,
        { lang: "typescript", theme: "github-dark" },
      ),
    ]);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white font-[family-name:var(--font-geist-sans)] text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold">pom</span>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/nodes"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Docs
          </Link>
          <Link
            href="/playground"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Playground
          </Link>
          <a
            href="https://github.com/hirokisakabe/pom"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-24 pb-20 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          npm install @hirokisakabe/pom
        </div>
        <h1 className="mb-6 max-w-3xl text-5xl leading-tight font-bold tracking-tight sm:text-6xl">
          Declarative PowerPoint
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
            from XML
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Write XML. Get editable PPTX. pom turns declarative markup into native
          PowerPoint slides with Flexbox layout, 18 built-in node types, and
          first-class AI support.
        </p>
        <div className="flex gap-4">
          <Link
            href="/nodes"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Get Started
          </Link>
          <Link
            href="/playground"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Try Playground
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 p-6 dark:border-gray-800"
            >
              <div className="mb-3 text-2xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold">
          XML in, PPTX out
        </h2>
        <p className="mb-10 text-center text-gray-600 dark:text-gray-400">
          Describe your slides in XML and generate native PowerPoint files with
          a single function call.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-gray-500">generate.ts</span>
          </div>
          <div
            className="overflow-x-auto font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed [&_pre]:p-6"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </div>
      </section>

      {/* Node Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold">
          18 Built-in Node Types
        </h2>
        <p className="mb-12 text-center text-gray-600 dark:text-gray-400">
          From simple text to complex charts and diagrams — everything renders
          as native PowerPoint shapes.
        </p>
        <NodeGallery nodes={nodes} />
        <div className="mt-8 text-center">
          <Link
            href="/nodes"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all nodes in detail →
          </Link>
        </div>
      </section>

      {/* Quick Start */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Quick Start</h2>
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">1. Install</p>
            <div
              className="rounded-lg font-[family-name:var(--font-geist-mono)] text-sm [&_pre]:px-5 [&_pre]:py-4"
              dangerouslySetInnerHTML={{ __html: highlightedInstall }}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">
              2. Generate
            </p>
            <div
              className="overflow-x-auto rounded-lg font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed [&_pre]:px-5 [&_pre]:py-4"
              dangerouslySetInnerHTML={{ __html: highlightedGenerate }}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">
              3. For AI agents
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Include{" "}
              <a
                href="/llm.txt"
                className="font-medium text-blue-600 underline dark:text-blue-400"
              >
                llm.txt
              </a>{" "}
              in your system prompt for a compact XML reference designed for
              LLMs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="text-sm text-gray-500">
            MIT {new Date().getFullYear()} © pom
          </span>
          <nav className="flex gap-6 text-sm">
            <Link
              href="/nodes"
              className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              Docs
            </Link>
            <Link
              href="/playground"
              className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              Playground
            </Link>
            <a
              href="https://github.com/hirokisakabe/pom"
              className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@hirokisakabe/pom"
              className="text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
