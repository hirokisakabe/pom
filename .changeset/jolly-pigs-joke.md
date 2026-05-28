---
"@hirokisakabe/pom": minor
---

Add Arrow node: ID-based connector between nodes

`<Arrow from="id" to="id" />` draws a straight-line connector between the center points of two nodes referenced by their `id` attribute. Supports `color`, `lineWidth`, `dashType`, `beginArrow`, and `endArrow` style attributes. Emits an `ARROW_REF_NOT_FOUND` diagnostic when a referenced ID is not found.
