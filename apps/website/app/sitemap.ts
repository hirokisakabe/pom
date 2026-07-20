import type { MetadataRoute } from "next";
import { siteUrl } from "./siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl },
    { url: `${siteUrl}/getting-started` },
    { url: `${siteUrl}/agent-skills` },
    { url: `${siteUrl}/agent-skills/pom-slide` },
    { url: `${siteUrl}/agent-skills/pom-theme` },
    { url: `${siteUrl}/authoring` },
    { url: `${siteUrl}/pom-xml` },
    { url: `${siteUrl}/nodes` },
    { url: `${siteUrl}/layout-system` },
    { url: `${siteUrl}/styling-guide` },
    { url: `${siteUrl}/master-slide` },
    { url: `${siteUrl}/text-measurement` },
    { url: `${siteUrl}/api-reference` },
    { url: `${siteUrl}/core-library` },
    { url: `${siteUrl}/embedding-the-editor` },
    { url: `${siteUrl}/pom-cli` },
    { url: `${siteUrl}/pom-md` },
    { url: `${siteUrl}/pom-md/markdown-syntax` },
    { url: `${siteUrl}/pom-md/pomxml-code-fence` },
    { url: `${siteUrl}/pom-vscode` },
    { url: `${siteUrl}/pom-vscode/supported-formats` },
    { url: `${siteUrl}/pom-vscode/configuration` },
    { url: `${siteUrl}/pom-jsx` },
    { url: `${siteUrl}/llm.txt` },
    { url: `${siteUrl}/playground` },
  ];
}
