import { registerNode } from "./nodeRegistry.ts";
import { textNodeDef } from "./definitions/text.ts";
import { ulNodeDef, olNodeDef } from "./definitions/list.ts";
import { imageNodeDef } from "./definitions/image.ts";
import { tableNodeDef } from "./definitions/table.ts";
import { shapeNodeDef } from "./definitions/shape.ts";
import { chartNodeDef } from "./definitions/chart.ts";
import { iconNodeDef } from "./definitions/icon.ts";
import { lineNodeDef } from "./definitions/line.ts";
import { arrowNodeDef } from "./definitions/arrow.ts";
import {
  timelineNodeDef,
  matrixNodeDef,
  treeNodeDef,
  flowNodeDef,
  processArrowNodeDef,
  pyramidNodeDef,
} from "./definitions/compositeNodes.ts";
import { vstackNodeDef, hstackNodeDef } from "./definitions/stack.ts";
import { layerNodeDef } from "./definitions/layer.ts";
import { svgNodeDef } from "./definitions/svg.ts";

// 全ノード定義を登録
registerNode(textNodeDef);
registerNode(ulNodeDef);
registerNode(olNodeDef);
registerNode(imageNodeDef);
registerNode(tableNodeDef);
registerNode(shapeNodeDef);
registerNode(chartNodeDef);
registerNode(iconNodeDef);
registerNode(lineNodeDef);
registerNode(arrowNodeDef);
registerNode(timelineNodeDef);
registerNode(matrixNodeDef);
registerNode(treeNodeDef);
registerNode(flowNodeDef);
registerNode(processArrowNodeDef);
registerNode(pyramidNodeDef);
registerNode(vstackNodeDef);
registerNode(hstackNodeDef);
registerNode(layerNodeDef);
registerNode(svgNodeDef);

export { getNodeDef } from "./nodeRegistry.ts";
