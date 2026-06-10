# Layout System

A conceptual guide to building layouts with pom's Flexbox-style layout system powered by [yoga-layout](https://yogalayout.dev/).

## Layout Containers

pom provides two container types for composing layouts:

| Container | Direction  | Use Case                      |
| --------- | ---------- | ----------------------------- |
| `VStack`  | Vertical   | Stack elements top to bottom  |
| `HStack`  | Horizontal | Arrange elements side by side |

### VStack — Vertical Stack

Arranges children **top to bottom**. The main axis is vertical, and the cross axis is horizontal.

```xml
<VStack gap="16">
  <Text>First</Text>
  <Text>Second</Text>
  <Text>Third</Text>
</VStack>
```

### HStack — Horizontal Stack

Arranges children **left to right**. The main axis is horizontal, and the cross axis is vertical.

```xml
<HStack gap="16">
  <Text>Left</Text>
  <Text>Center</Text>
  <Text>Right</Text>
</HStack>
```

## Sizing

### Fixed Size

Specify exact dimensions in pixels:

```xml
<Text w="400" h="200">400×200 container</Text>
```

### Fill Available Space with `"max"`

Setting `"max"` applies `flexGrow=1`, which makes the element expand along the **main axis** of its parent to fill remaining space. For cross-axis expansion, use the parent's `alignItems="stretch"` (the default) or set an explicit size.

```xml
<!-- On a slide root, w="max" and h="max" fill the entire slide -->
<VStack w="max" h="max">
  <Text>This VStack fills the entire slide</Text>
</VStack>

<!-- In an HStack, w="max" expands horizontally (main axis) -->
<HStack>
  <Text>Label</Text>
  <VStack w="max"><Text>This fills remaining width</Text></VStack>
</HStack>
```

### Ratio-based Distribution with `grow`

`grow` (a positive number) distributes the remaining space along the parent's main axis among siblings in proportion to their `grow` values — the same semantics as CSS `flex-grow`. Since `"max"` is `flexGrow=1`, `w="max"` / `h="max"` behave as `grow="1"` along the main axis. When `grow` is specified together with `w="max"` / `h="max"`, `grow` takes precedence.

```xml
<!-- 2:1 two-column layout -->
<HStack w="max" h="max" gap="16">
  <VStack grow="2"><Text>Main (2/3)</Text></VStack>
  <VStack grow="1"><Text>Side (1/3)</Text></VStack>
</HStack>

<!-- Vertical: header fixed, body takes 3x the space of the footer -->
<VStack w="max" h="max">
  <Text h="60">Header</Text>
  <VStack grow="3"><Text>Body</Text></VStack>
  <VStack grow="1"><Text>Footer</Text></VStack>
</VStack>
```

### Percentage Size

Use percentage strings to size relative to the parent:

```xml
<HStack gap="16" w="max">
  <VStack w="30%"><Text>Sidebar (30%)</Text></VStack>
  <VStack w="70%"><Text>Main content (70%)</Text></VStack>
</HStack>
```

> **Note:** Child elements of HStack have `flexShrink=1` by default (same as CSS Flexbox), so percentage-based widths combined with `gap` will shrink automatically to fit within the parent. The same applies to VStack with percentage-based heights and `gap`.

### Min / Max Constraints

Use `minW`, `maxW`, `minH`, `maxH` to constrain dimensions:

```xml
<VStack minW="200" maxW="600">
  <Text>Width between 200px and 600px</Text>
</VStack>
```

## Spacing

### `gap` — Space Between Children

Sets uniform spacing between child elements in VStack and HStack:

```xml
<VStack gap="24">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</VStack>
```

`gap` only adds space **between** children — not before the first or after the last.

### `padding` — Inner Space

Adds space **inside** a container, between the container's edge and its children:

```xml
<!-- Uniform padding on all sides -->
<Text padding="24">24px padding all around</Text>

<!-- Per-side padding -->
<VStack padding.top="32" padding.bottom="32" padding.left="48" padding.right="48">
  <Text>Different padding on each side</Text>
</VStack>
```

### `margin` — Outer Space

Adds space **outside** an element, pushing it away from its neighbors:

```xml
<VStack>
  <Text>Above</Text>
  <Text margin.top="24">Extra space above this element</Text>
  <Text>Below</Text>
</VStack>
```

### Spacing Summary

| Property  | Where            | Applied To     |
| --------- | ---------------- | -------------- |
| `gap`     | Between children | VStack, HStack |
| `padding` | Inside container | All nodes      |
| `margin`  | Outside element  | All nodes      |

## Alignment

### `alignItems` — Cross-Axis Alignment

Controls how children are positioned along the **cross axis** (horizontal in VStack, vertical in HStack).

| Value     | Description                              |
| --------- | ---------------------------------------- |
| `start`   | Align to the start edge                  |
| `center`  | Center along the cross axis              |
| `end`     | Align to the end edge                    |
| `stretch` | Stretch to fill the cross axis (default) |

**VStack with `alignItems`** — controls horizontal positioning of children:

```xml
<VStack gap="8" alignItems="start" w="max">
  <Text backgroundColor="DCE6F1">Left aligned</Text>
</VStack>

<VStack gap="8" alignItems="center" w="max">
  <Text backgroundColor="DCE6F1">Centered</Text>
</VStack>

<VStack gap="8" alignItems="end" w="max">
  <Text backgroundColor="DCE6F1">Right aligned</Text>
</VStack>
```

**HStack with `alignItems`** — controls vertical positioning of children:

```xml
<HStack gap="8" alignItems="start" h="200">
  <Text backgroundColor="DCE6F1">Top</Text>
</HStack>

<HStack gap="8" alignItems="center" h="200">
  <Text backgroundColor="DCE6F1">Middle</Text>
</HStack>

<HStack gap="8" alignItems="end" h="200">
  <Text backgroundColor="DCE6F1">Bottom</Text>
</HStack>
```

### `justifyContent` — Main-Axis Alignment

Controls how children are distributed along the **main axis** (vertical in VStack, horizontal in HStack).

| Value          | Description                                |
| -------------- | ------------------------------------------ |
| `start`        | Pack to the start (default)                |
| `center`       | Center along the main axis                 |
| `end`          | Pack to the end                            |
| `spaceBetween` | Even spacing, first/last at edges          |
| `spaceAround`  | Even spacing with half-size space at edges |
| `spaceEvenly`  | Even spacing including edges               |

```xml
<HStack justifyContent="spaceBetween" w="max">
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>

<VStack justifyContent="center" alignItems="center" w="max" h="max">
  <Text fontSize="36">Perfectly Centered</Text>
</VStack>
```

### `alignSelf` — Per-Child Override

Override the parent's `alignItems` for a specific child:

```xml
<VStack alignItems="start" gap="8" w="max">
  <Text>Left aligned (from parent)</Text>
  <Text alignSelf="center">Centered (overridden)</Text>
  <Text alignSelf="end">Right aligned (overridden)</Text>
</VStack>
```

## Flex Wrapping

Use `flexWrap` on VStack or HStack to wrap children when they overflow. HStack wraps onto additional **rows**, while VStack wraps onto additional **columns**.

```xml
<HStack gap="8" flexWrap="wrap" w="400">
  <Text w="150" padding="8" backgroundColor="DCE6F1">Item 1</Text>
  <Text w="150" padding="8" backgroundColor="DCE6F1">Item 2</Text>
  <Text w="150" padding="8" backgroundColor="DCE6F1">Item 3</Text>
  <Text w="150" padding="8" backgroundColor="DCE6F1">Item 4</Text>
</HStack>
```

| Value         | Description               |
| ------------- | ------------------------- |
| `nowrap`      | No wrapping (default)     |
| `wrap`        | Wrap to next row/column   |
| `wrapReverse` | Wrap in reverse direction |

## Absolute Positioning

Use `position="absolute"` with `top`, `right`, `bottom`, `left` to place elements at exact positions relative to their parent:

```xml
<VStack w="max" h="max">
  <Text>Normal flow content</Text>
  <Text position="absolute" bottom="16" right="16" fontSize="10" color="999999">
    Page footer
  </Text>
</VStack>
```

> **Note:** Absolute elements are removed from the normal flow and do not affect sibling layout.

## Nesting Layouts

Build complex layouts by nesting VStack and HStack:

```xml
<!-- Outer vertical structure -->
<VStack w="max" h="max" padding="48" gap="24">
  <!-- Title -->
  <Text fontSize="36" bold="true" color="1A1A2E">Dashboard</Text>

  <!-- Two-column layout -->
  <HStack gap="16" w="max">
    <!-- Left column -->
    <VStack gap="12">
      <Text bold="true">Section A</Text>
      <Text fontSize="14">Content for section A</Text>
    </VStack>
    <!-- Right column -->
    <VStack gap="12">
      <Text bold="true">Section B</Text>
      <Text fontSize="14">Content for section B</Text>
    </VStack>
  </HStack>
</VStack>
```

The key idea: **VStack for vertical grouping, HStack for horizontal grouping, nested as needed.**

## Common Layout Patterns

### Header + Content

```xml
<VStack w="max" h="max" gap="24" padding="48">
  <!-- Header -->
  <VStack gap="8">
    <Text fontSize="36" bold="true" color="1A1A2E">Slide Title</Text>
    <Text fontSize="16" color="666666">Subtitle or description</Text>
  </VStack>
  <!-- Content -->
  <VStack gap="12" w="max">
    <Text fontSize="14" color="333333">Main content goes here.</Text>
  </VStack>
</VStack>
```

### Two-Column Layout

```xml
<VStack w="max" h="max" padding="48" gap="24">
  <Text fontSize="36" bold="true" color="1A1A2E">Comparison</Text>
  <HStack gap="24" w="max">
    <VStack gap="12" padding="24" backgroundColor="F8F9FA" borderRadius="8">
      <Text fontSize="20" bold="true">Option A</Text>
      <Text fontSize="14">Details about option A</Text>
    </VStack>
    <VStack gap="12" padding="24" backgroundColor="F8F9FA" borderRadius="8">
      <Text fontSize="20" bold="true">Option B</Text>
      <Text fontSize="14">Details about option B</Text>
    </VStack>
  </HStack>
</VStack>
```

> **Tip:** When HStack children have no explicit width, they share the available space equally.

### Three-Column Cards

```xml
<HStack gap="16" w="max">
  <VStack gap="8" padding="24" backgroundColor="FFFFFF" borderRadius="8"
    border.color="E5E7EB" border.width="1">
    <Text fontSize="12" color="999999">Metric A</Text>
    <Text fontSize="28" bold="true" color="1D4ED8">42%</Text>
  </VStack>
  <VStack gap="8" padding="24" backgroundColor="FFFFFF" borderRadius="8"
    border.color="E5E7EB" border.width="1">
    <Text fontSize="12" color="999999">Metric B</Text>
    <Text fontSize="28" bold="true" color="16A34A">$1.2M</Text>
  </VStack>
  <VStack gap="8" padding="24" backgroundColor="FFFFFF" borderRadius="8"
    border.color="E5E7EB" border.width="1">
    <Text fontSize="12" color="999999">Metric C</Text>
    <Text fontSize="28" bold="true" color="DC2626">-8%</Text>
  </VStack>
</HStack>
```

### Centered Content

```xml
<VStack w="max" h="max" justifyContent="center" alignItems="center" gap="16">
  <Text fontSize="48" bold="true" color="1A1A2E">Big Statement</Text>
  <Text fontSize="18" color="666666">Supporting detail below</Text>
</VStack>
```

### Sidebar Layout

```xml
<HStack w="max" h="max">
  <!-- Sidebar -->
  <VStack w="25%" h="max" padding="24" gap="16" backgroundColor="1A1A2E">
    <Text color="FFFFFF" bold="true">Navigation</Text>
    <Text color="CCCCCC" fontSize="12">Item 1</Text>
    <Text color="CCCCCC" fontSize="12">Item 2</Text>
    <Text color="CCCCCC" fontSize="12">Item 3</Text>
  </VStack>
  <!-- Main content -->
  <VStack padding="32" gap="16">
    <Text fontSize="28" bold="true" color="1A1A2E">Main Content</Text>
    <Text fontSize="14" color="333333">Content area with sidebar navigation.</Text>
  </VStack>
</HStack>
```
