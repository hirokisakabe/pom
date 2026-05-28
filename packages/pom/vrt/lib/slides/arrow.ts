import { palette } from "./palette.js";

// ============================================================
// Page 39: Arrow Node Test
// テスト対象: ArrowNode - from, to, color, lineWidth, dashType, beginArrow, endArrow
// ============================================================
export const page39ArrowXml = `
<Layer w="1280" h="720" backgroundColor="${palette.background}">
  <Text x="48" y="24" w="640" h="48" fontSize="28" color="${palette.charcoal}" bold="true">Page 39: Arrow Node Test</Text>

  <!-- 基本コネクター（縦方向） -->
  <Shape id="box1" x="100" y="120" w="160" h="60" shapeType="roundRect" fill.color="${palette.blue}" color="FFFFFF" bold="true">Web App</Shape>
  <Shape id="box2" x="100" y="260" w="160" h="60" shapeType="roundRect" fill.color="${palette.green}" color="FFFFFF" bold="true">API</Shape>
  <Shape id="box3" x="100" y="400" w="160" h="60" shapeType="roundRect" fill.color="${palette.red}" color="FFFFFF" bold="true">DB</Shape>
  <Arrow x="0" y="0" from="box1" to="box2" endArrow="true" />
  <Arrow x="0" y="0" from="box2" to="box3" endArrow="true" />

  <!-- 双方向矢印 -->
  <Shape id="svc1" x="380" y="200" w="160" h="60" shapeType="rect" fill.color="${palette.blue}" color="FFFFFF" bold="true">Service A</Shape>
  <Shape id="svc2" x="620" y="200" w="160" h="60" shapeType="rect" fill.color="${palette.red}" color="FFFFFF" bold="true">Service B</Shape>
  <Arrow x="0" y="0" from="svc1" to="svc2" beginArrow="true" endArrow="true" color="333333" lineWidth="2" />

  <!-- スタイル指定 -->
  <Shape id="nodeA" x="380" y="360" w="140" h="60" shapeType="ellipse" fill.color="7C3AED" color="FFFFFF" bold="true">Node A</Shape>
  <Shape id="nodeB" x="560" y="480" w="140" h="60" shapeType="ellipse" fill.color="DB2777" color="FFFFFF" bold="true">Node B</Shape>
  <Shape id="nodeC" x="740" y="360" w="140" h="60" shapeType="ellipse" fill.color="059669" color="FFFFFF" bold="true">Node C</Shape>
  <Arrow x="0" y="0" from="nodeA" to="nodeB" endArrow="true" color="7C3AED" lineWidth="2" dashType="dash" />
  <Arrow x="0" y="0" from="nodeB" to="nodeC" endArrow="true" color="DB2777" lineWidth="2" />
  <Arrow x="0" y="0" from="nodeA" to="nodeC" endArrow.type="diamond" color="059669" lineWidth="2" />

  <!-- 矢印タイプ -->
  <Shape id="srcStealth" x="940" y="120" w="140" h="50" shapeType="rect" fill.color="${palette.blue}" color="FFFFFF">Stealth</Shape>
  <Shape id="dstStealth" x="1100" y="120" w="140" h="50" shapeType="rect" fill.color="${palette.blue}" color="FFFFFF">dst</Shape>
  <Arrow x="0" y="0" from="srcStealth" to="dstStealth" endArrow.type="stealth" lineWidth="2" />

  <Shape id="srcOval" x="940" y="200" w="140" h="50" shapeType="rect" fill.color="${palette.green}" color="FFFFFF">Oval</Shape>
  <Shape id="dstOval" x="1100" y="200" w="140" h="50" shapeType="rect" fill.color="${palette.green}" color="FFFFFF">dst</Shape>
  <Arrow x="0" y="0" from="srcOval" to="dstOval" endArrow.type="oval" lineWidth="2" />
</Layer>
`;
