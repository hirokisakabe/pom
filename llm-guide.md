# pom Specification

pom is a format for declaratively describing PowerPoint in JSON. Generate JSON according to the following specification.

## Standard Settings

```
Slide size: { w: 1280, h: 720 }
Standard padding: 48px (entire slide), 18-24px (internal boxes)
Standard gap: 12-24px
```

## Node List

| type     | Purpose    | Main Properties                                                             |
| -------- | ---------- | --------------------------------------------------------------------------- |
| text     | Text       | text, fontPx, color, bold, alignText, bullet                                |
| vstack   | Vertical   | children[], gap, alignItems, justifyContent                                 |
| hstack   | Horizontal | children[], gap, alignItems, justifyContent                                 |
| box      | Wrapper    | children (single node)                                                      |
| table    | Table      | columns[], rows[], defaultRowHeight                                         |
| shape    | Shape      | shapeType, fill, line, text, fontPx                                         |
| chart    | Chart      | chartType(bar/line/pie/area/doughnut/radar), data[], showLegend, radarStyle |
| timeline | Timeline   | direction(horizontal/vertical), items[]                                     |
| matrix   | Matrix     | axes, quadrants, items[]                                                    |
| image    | Image      | src                                                                         |

### Common Properties

Available for all nodes:

- `w`, `h`: Size (number in px / `"max"` / `"50%"`)
- `padding`: Margin (number or `{ top, right, bottom, left }`)
- `backgroundColor`: Background color (6-digit hex, e.g., `"F8FAFC"`)
- `border`: Border (`{ color, width, dashType }`)
- `borderRadius`: Corner radius in px (e.g., `8`, `16`)

### alignItems / justifyContent

- alignItems: `"start"` | `"center"` | `"end"` | `"stretch"`
- justifyContent: `"start"` | `"center"` | `"end"` | `"spaceBetween"`

## Font Size Guidelines

| Purpose   | fontPx |
| --------- | ------ |
| Title     | 28-40  |
| Heading   | 18-24  |
| Body      | 13-16  |
| Footnotes | 10-12  |

## Pattern Examples

### 1. Basic Slide Structure

```json
{
  "type": "vstack",
  "w": "100%",
  "h": "max",
  "padding": 48,
  "gap": 24,
  "alignItems": "stretch",
  "children": [
    { "type": "text", "text": "Title", "fontPx": 32, "bold": true },
    { "type": "text", "text": "Body text", "fontPx": 14 }
  ]
}
```

### 2. Two-Column Layout

```json
{
  "type": "hstack",
  "gap": 24,
  "alignItems": "start",
  "children": [
    {
      "type": "box",
      "w": "50%",
      "padding": 20,
      "backgroundColor": "FFFFFF",
      "children": { "type": "text", "text": "Left column", "fontPx": 14 }
    },
    {
      "type": "box",
      "w": "50%",
      "padding": 20,
      "backgroundColor": "FFFFFF",
      "children": { "type": "text", "text": "Right column", "fontPx": 14 }
    }
  ]
}
```

### 3. Bullet Points

```json
{
  "type": "text",
  "text": "Item 1\nItem 2\nItem 3",
  "fontPx": 14,
  "bullet": true
}
```

Numbered list:

```json
{
  "type": "text",
  "text": "Step 1\nStep 2\nStep 3",
  "fontPx": 14,
  "bullet": { "type": "number" }
}
```

Bullet options:

- `bullet: true` - Standard bullet points (•)
- `bullet: { type: "number" }` - Numbered (1. 2. 3.)
- `bullet: { type: "number", numberType: "alphaLcPeriod" }` - Alphabet (a. b. c.)
- `bullet: { type: "number", numberStartAt: 5 }` - Specify starting number

### 4. Table

```json
{
  "type": "table",
  "defaultRowHeight": 36,
  "columns": [{ "width": 150 }, { "width": 200 }],
  "rows": [
    {
      "cells": [
        {
          "text": "Item",
          "fontPx": 14,
          "bold": true,
          "backgroundColor": "DBEAFE"
        },
        {
          "text": "Value",
          "fontPx": 14,
          "bold": true,
          "backgroundColor": "DBEAFE"
        }
      ]
    },
    {
      "cells": [
        { "text": "Sales", "fontPx": 13 },
        { "text": "$1M", "fontPx": 13 }
      ]
    }
  ]
}
```

Omitting column width (evenly distributed from table width):

```json
{
  "type": "table",
  "w": 400,
  "columns": [{}, {}, {}],
  "rows": [...]
}
```

### 5. Shape (with text)

```json
{
  "type": "shape",
  "shapeType": "roundRect",
  "w": 200,
  "h": 60,
  "text": "Button style",
  "fontPx": 16,
  "fill": { "color": "1D4ED8" },
  "color": "FFFFFF"
}
```

Common shapeTypes: `rect`, `roundRect`, `ellipse`, `triangle`, `star5`, `cloud`, `downArrow`

### 6. Chart

```json
{
  "type": "chart",
  "chartType": "bar",
  "w": 500,
  "h": 300,
  "data": [
    {
      "name": "Sales",
      "labels": ["Jan", "Feb", "Mar"],
      "values": [100, 150, 200]
    }
  ],
  "showLegend": true,
  "chartColors": ["0088CC"]
}
```

### 7. Timeline (Roadmap)

```json
{
  "type": "timeline",
  "direction": "horizontal",
  "w": 1000,
  "h": 120,
  "items": [
    {
      "date": "Q1",
      "title": "Phase 1",
      "description": "Foundation",
      "color": "4CAF50"
    },
    {
      "date": "Q2",
      "title": "Phase 2",
      "description": "Development",
      "color": "2196F3"
    },
    {
      "date": "Q3",
      "title": "Phase 3",
      "description": "Release",
      "color": "FF9800"
    }
  ]
}
```

Vertical timeline:

```json
{
  "type": "timeline",
  "direction": "vertical",
  "w": 400,
  "h": 300,
  "items": [
    { "date": "Week 1", "title": "Planning" },
    { "date": "Week 2-3", "title": "Development" },
    { "date": "Week 4", "title": "Release" }
  ]
}
```

### 8. Matrix (Positioning Map)

```json
{
  "type": "matrix",
  "w": 600,
  "h": 500,
  "axes": { "x": "Cost", "y": "Effect" },
  "quadrants": {
    "topLeft": "Quick Wins",
    "topRight": "Strategic",
    "bottomLeft": "Low Priority",
    "bottomRight": "Avoid"
  },
  "items": [
    { "label": "A", "x": 0.2, "y": 0.8, "color": "4CAF50" },
    { "label": "B", "x": 0.7, "y": 0.6 }
  ]
}
```

Note: x/y coordinates are 0-1 relative values. (0,0) = bottom-left, (1,1) = top-right.

## Important Notes

| NG                       | OK                | Description                             |
| ------------------------ | ----------------- | --------------------------------------- |
| `"#FF0000"`              | `"FF0000"`        | No # needed for color                   |
| `"left"`                 | `"start"`         | alignItems/justifyContent use start/end |
| `children: [...]` in box | `children: {...}` | box's children is a single node         |
| `width: "100%"`          | `w: "100%"`       | Property names are w/h                  |

## Schema Validation

Generated JSON can be validated with `inputPomNodeSchema`. In browser environments, import from `@hirokisakabe/pom/schema`.

```typescript
import { inputPomNodeSchema } from "@hirokisakabe/pom/schema";
const result = inputPomNodeSchema.safeParse(json);
```
