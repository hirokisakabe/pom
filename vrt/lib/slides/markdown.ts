import { parseMarkdown } from "../../../src/parseMarkdown/parseMarkdown.js";
import { palette } from "./palette.js";

const markdownInput = `# Markdown Basic Support

This slide is generated from Markdown input.

---

## Headings & Text

### H3 Heading

Regular paragraph text for testing.

---

## Lists

- Bullet item A
- Bullet item B
- Bullet item C

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

---

## POM Passthrough

<pom>
<HStack gap="16" alignItems="stretch">
  <Box w="50%" padding="16" backgroundColor="${palette.lightBlue}" border='{"color":"${palette.border}","width":1}'>
    <Text fontPx="14" color="${palette.charcoal}">Left column via pom block</Text>
  </Box>
  <Box w="50%" padding="16" backgroundColor="D1FAE5" border='{"color":"${palette.border}","width":1}'>
    <Text fontPx="14" color="${palette.charcoal}">Right column via pom block</Text>
  </Box>
</HStack>
</pom>
`;

export const page25MarkdownXml = parseMarkdown(markdownInput);
