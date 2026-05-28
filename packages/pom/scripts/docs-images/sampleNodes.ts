import type { NodeType } from "./config.js";

const palette = {
  background: "F8FAFC",
  navy: "0F172A",
  blue: "1D4ED8",
  lightBlue: "DBEAFE",
  accent: "0EA5E9",
  border: "E2E8F0",
  charcoal: "1E293B",
  red: "DC2626",
  green: "16A34A",
};

const textSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Text Node Example</Text>
  <HStack gap="60">
    <VStack gap="12">
      <Text fontSize="16" bold="true">Font Sizes</Text>
      <Text fontSize="14">14px text</Text>
      <Text fontSize="20">20px text</Text>
      <Text fontSize="28">28px text</Text>
    </VStack>
    <VStack gap="12">
      <Text fontSize="16" bold="true">Colors</Text>
      <Text fontSize="16" color="${palette.navy}">Navy color</Text>
      <Text fontSize="16" color="${palette.blue}">Blue color</Text>
      <Text fontSize="16" color="${palette.red}">Red color</Text>
    </VStack>
    <VStack gap="12">
      <Text fontSize="16" bold="true">Alignment</Text>
      <Text textAlign="left" w="200" backgroundColor="${palette.lightBlue}" fontSize="16">Left aligned</Text>
      <Text textAlign="center" w="200" backgroundColor="${palette.lightBlue}" fontSize="16">Center aligned</Text>
      <Text textAlign="right" w="200" backgroundColor="${palette.lightBlue}" fontSize="16">Right aligned</Text>
    </VStack>
    <VStack gap="12">
      <Text fontSize="16" bold="true">Inline Formatting</Text>
      <Text fontSize="16">Normal <B>bold</B> text</Text>
      <Text fontSize="16">Normal <I>italic</I> text</Text>
      <Text fontSize="16"><B><I>Bold italic</I></B></Text>
    </VStack>
  </HStack>
</VStack>
`;

const sampleImageUrl = "sample_images/sample_0.png";

const imageSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Image Node Example</Text>
  <HStack gap="60" alignItems="center">
    <Image src="${sampleImageUrl}" w="300" h="220" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20" />
    <Image src="${sampleImageUrl}" w="250" h="250" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" borderRadius="8" padding="20" />
    <Image src="${sampleImageUrl}" w="280" h="200" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" borderRadius="16" padding="20" />
  </HStack>
</VStack>
`;

const tableSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Table Node Example</Text>
  <Table defaultRowHeight="48">
    <Col width="120" />
    <Col width="300" />
    <Col width="150" />
    <Col width="150" />
    <Tr>
      <Td bold="true" backgroundColor="${palette.navy}" color="FFFFFF" textAlign="center">ID</Td>
      <Td bold="true" backgroundColor="${palette.navy}" color="FFFFFF" textAlign="center">Name</Td>
      <Td bold="true" backgroundColor="${palette.navy}" color="FFFFFF" textAlign="center">Status</Td>
      <Td bold="true" backgroundColor="${palette.navy}" color="FFFFFF" textAlign="center">Progress</Td>
    </Tr>
    <Tr>
      <Td textAlign="center">001</Td>
      <Td>Project Alpha</Td>
      <Td color="${palette.green}">Active</Td>
      <Td textAlign="right">75%</Td>
    </Tr>
    <Tr>
      <Td textAlign="center">002</Td>
      <Td>Project Beta</Td>
      <Td color="${palette.accent}">Pending</Td>
      <Td textAlign="right">30%</Td>
    </Tr>
    <Tr>
      <Td textAlign="center">003</Td>
      <Td>Project Gamma</Td>
      <Td color="${palette.blue}">Complete</Td>
      <Td textAlign="right">100%</Td>
    </Tr>
    <Tr>
      <Td textAlign="center">004</Td>
      <Td>Project Delta</Td>
      <Td color="${palette.red}">On Hold</Td>
      <Td textAlign="right">50%</Td>
    </Tr>
  </Table>
</VStack>
`;

const shapeSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Shape Node Example</Text>
  <HStack gap="40" alignItems="center">
    <Shape shapeType="rect" w="180" h="120" fill.color="${palette.blue}" text="Rectangle" color="FFFFFF" fontSize="16" textAlign="center" />
    <Shape shapeType="roundRect" w="180" h="120" fill.color="${palette.green}" text="Rounded" color="FFFFFF" fontSize="16" textAlign="center" />
    <Shape shapeType="ellipse" w="160" h="160" fill.color="${palette.accent}" text="Ellipse" color="FFFFFF" fontSize="16" textAlign="center" />
    <Shape shapeType="diamond" w="160" h="160" fill.color="${palette.red}" text="Diamond" color="FFFFFF" fontSize="14" textAlign="center" />
    <Shape shapeType="rightArrow" w="200" h="100" fill.color="${palette.navy}" text="Arrow" color="FFFFFF" fontSize="16" textAlign="center" />
  </HStack>
</VStack>
`;

const chartSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Chart Node Example</Text>
  <HStack gap="40">
    <Chart chartType="bar" w="360" h="300" showTitle="true" title="Bar Chart" showLegend="true" chartColors='["${palette.blue}","${palette.green}","${palette.red}"]'>
      <ChartSeries name="Q1">
        <ChartDataPoint label="Jan" value="30" />
        <ChartDataPoint label="Feb" value="45" />
        <ChartDataPoint label="Mar" value="60" />
      </ChartSeries>
      <ChartSeries name="Q2">
        <ChartDataPoint label="Jan" value="40" />
        <ChartDataPoint label="Feb" value="55" />
        <ChartDataPoint label="Mar" value="70" />
      </ChartSeries>
    </Chart>
    <Chart chartType="pie" w="320" h="300" showTitle="true" title="Pie Chart" showLegend="true" chartColors='["${palette.blue}","${palette.green}","${palette.accent}","${palette.red}"]'>
      <ChartSeries>
        <ChartDataPoint label="Category A" value="35" />
        <ChartDataPoint label="Category B" value="25" />
        <ChartDataPoint label="Category C" value="25" />
        <ChartDataPoint label="Category D" value="15" />
      </ChartSeries>
    </Chart>
    <Chart chartType="line" w="360" h="300" showTitle="true" title="Line Chart" showLegend="true" chartColors='["${palette.blue}","${palette.red}"]'>
      <ChartSeries name="2023">
        <ChartDataPoint label="Q1" value="20" />
        <ChartDataPoint label="Q2" value="35" />
        <ChartDataPoint label="Q3" value="45" />
        <ChartDataPoint label="Q4" value="60" />
      </ChartSeries>
      <ChartSeries name="2024">
        <ChartDataPoint label="Q1" value="30" />
        <ChartDataPoint label="Q2" value="50" />
        <ChartDataPoint label="Q3" value="55" />
        <ChartDataPoint label="Q4" value="75" />
      </ChartSeries>
    </Chart>
  </HStack>
</VStack>
`;

const timelineSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Timeline Node Example</Text>
  <Timeline direction="horizontal" w="100%" h="300">
    <TimelineItem date="2024 Q1" title="Phase 1" description="Planning &amp; Research" color="${palette.blue}" />
    <TimelineItem date="2024 Q2" title="Phase 2" description="Development" color="${palette.green}" />
    <TimelineItem date="2024 Q3" title="Phase 3" description="Testing" color="${palette.accent}" />
    <TimelineItem date="2024 Q4" title="Phase 4" description="Launch" color="${palette.red}" />
  </Timeline>
</VStack>
`;

const matrixSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Matrix Node Example</Text>
  <Matrix w="700" h="500">
    <MatrixAxes x="Cost" y="Impact" />
    <MatrixQuadrants topLeft="Low Cost\nHigh Impact" topRight="High Cost\nHigh Impact" bottomLeft="Low Cost\nLow Impact" bottomRight="High Cost\nLow Impact" />
    <MatrixItem label="Project A" x="0.2" y="0.8" color="${palette.green}" />
    <MatrixItem label="Project B" x="0.7" y="0.85" color="${palette.blue}" />
    <MatrixItem label="Project C" x="0.3" y="0.3" color="${palette.accent}" />
    <MatrixItem label="Project D" x="0.8" y="0.2" color="${palette.red}" />
  </Matrix>
</VStack>
`;

const treeSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Tree Node Example</Text>
  <Tree layout="vertical" nodeShape="roundRect" w="100%" h="500" connectorStyle.color="${palette.charcoal}" connectorStyle.width="2">
    <TreeItem label="CEO" color="${palette.navy}">
      <TreeItem label="CTO" color="${palette.blue}">
        <TreeItem label="Dev Team" color="${palette.accent}" />
        <TreeItem label="QA Team" color="${palette.accent}" />
      </TreeItem>
      <TreeItem label="CFO" color="${palette.green}">
        <TreeItem label="Finance" color="${palette.accent}" />
        <TreeItem label="Accounting" color="${palette.accent}" />
      </TreeItem>
      <TreeItem label="COO" color="${palette.red}">
        <TreeItem label="Operations" color="${palette.accent}" />
        <TreeItem label="HR" color="${palette.accent}" />
      </TreeItem>
    </TreeItem>
  </Tree>
</VStack>
`;

const flowSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Flow Node Example</Text>
  <Flow direction="horizontal" w="100%" h="400" connectorStyle.color="${palette.charcoal}" connectorStyle.width="2">
    <FlowNode id="start" shape="flowChartTerminator" text="Start" color="${palette.green}" />
    <FlowNode id="input" shape="flowChartInputOutput" text="Input Data" color="${palette.lightBlue}" />
    <FlowNode id="process" shape="flowChartProcess" text="Process" color="${palette.blue}" />
    <FlowNode id="decision" shape="flowChartDecision" text="Valid?" color="${palette.accent}" />
    <FlowNode id="end" shape="flowChartTerminator" text="End" color="${palette.red}" />
    <FlowConnection from="start" to="input" />
    <FlowConnection from="input" to="process" />
    <FlowConnection from="process" to="decision" />
    <FlowConnection from="decision" to="end" label="Yes" />
  </Flow>
</VStack>
`;

const processArrowSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">ProcessArrow Node Example</Text>
  <ProcessArrow direction="horizontal" w="100%" h="120">
    <ProcessArrowStep label="Planning" color="4472C4" />
    <ProcessArrowStep label="Design" color="5B9BD5" />
    <ProcessArrowStep label="Development" color="70AD47" />
    <ProcessArrowStep label="Testing" color="FFC000" />
    <ProcessArrowStep label="Release" color="ED7D31" />
  </ProcessArrow>
  <HStack gap="60">
    <VStack gap="12">
      <Text fontSize="14" bold="true">Default Style</Text>
      <ProcessArrow direction="horizontal" w="480" h="70">
        <ProcessArrowStep label="Input" />
        <ProcessArrowStep label="Process" />
        <ProcessArrowStep label="Output" />
      </ProcessArrow>
    </VStack>
    <VStack gap="12">
      <Text fontSize="14" bold="true">Custom Text Color</Text>
      <ProcessArrow direction="horizontal" w="480" h="70">
        <ProcessArrowStep label="Light BG" color="FFEB3B" textColor="333333" />
        <ProcessArrowStep label="Dark BG" color="${palette.navy}" textColor="FFFFFF" />
        <ProcessArrowStep label="Blue BG" color="${palette.blue}" textColor="FFFFFF" />
      </ProcessArrow>
    </VStack>
  </HStack>
</VStack>
`;

const pyramidSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Pyramid Node Example</Text>
  <HStack gap="60" alignItems="center">
    <VStack gap="12">
      <Text fontSize="14" bold="true">direction: up (default)</Text>
      <Pyramid direction="up" w="480" h="350">
        <PyramidLevel label="Vision" color="${palette.navy}" />
        <PyramidLevel label="Strategy" color="${palette.blue}" />
        <PyramidLevel label="Tactics" color="${palette.accent}" />
        <PyramidLevel label="Operations" color="${palette.green}" />
      </Pyramid>
    </VStack>
    <VStack gap="12">
      <Text fontSize="14" bold="true">direction: down</Text>
      <Pyramid direction="down" w="480" h="350">
        <PyramidLevel label="Executive" color="${palette.navy}" />
        <PyramidLevel label="Management" color="${palette.blue}" />
        <PyramidLevel label="Team Lead" color="${palette.accent}" />
        <PyramidLevel label="Staff" color="${palette.green}" />
      </Pyramid>
    </VStack>
  </HStack>
</VStack>
`;

const vstackSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">VStack Node Example</Text>
  <HStack gap="48">
    <VStack w="280" h="350" gap="12" alignItems="start" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20">
      <Text fontSize="14" bold="true">alignItems: start</Text>
      <Shape shapeType="rect" w="140" h="60" fill.color="${palette.blue}" />
      <Shape shapeType="rect" w="100" h="60" fill.color="${palette.green}" />
      <Shape shapeType="rect" w="180" h="60" fill.color="${palette.red}" />
    </VStack>
    <VStack w="280" h="350" gap="12" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20">
      <Text fontSize="14" bold="true">alignItems: center</Text>
      <Shape shapeType="rect" w="140" h="60" fill.color="${palette.blue}" />
      <Shape shapeType="rect" w="100" h="60" fill.color="${palette.green}" />
      <Shape shapeType="rect" w="180" h="60" fill.color="${palette.red}" />
    </VStack>
    <VStack w="280" h="350" gap="12" alignItems="end" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20">
      <Text fontSize="14" bold="true">alignItems: end</Text>
      <Shape shapeType="rect" w="140" h="60" fill.color="${palette.blue}" />
      <Shape shapeType="rect" w="100" h="60" fill.color="${palette.green}" />
      <Shape shapeType="rect" w="180" h="60" fill.color="${palette.red}" />
    </VStack>
  </HStack>
</VStack>
`;

const hstackSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">HStack Node Example</Text>
  <VStack gap="20">
    <HStack w="100%" h="120" gap="20" justifyContent="start" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20">
      <Text fontSize="14" bold="true" w="200">justifyContent: start</Text>
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.blue}" />
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.green}" />
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.red}" />
    </HStack>
    <HStack w="100%" h="120" gap="20" justifyContent="center" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20">
      <Text fontSize="14" bold="true" w="200">justifyContent: center</Text>
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.blue}" />
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.green}" />
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.red}" />
    </HStack>
    <HStack w="100%" h="120" gap="20" justifyContent="spaceBetween" alignItems="center" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1" padding="20">
      <Text fontSize="14" bold="true" w="200">justifyContent: spaceBetween</Text>
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.blue}" />
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.green}" />
      <Shape shapeType="rect" w="80" h="60" fill.color="${palette.red}" />
    </HStack>
  </VStack>
</VStack>
`;

const iconSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Icon Node Example</Text>
  <HStack gap="32">
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Basic Icons</Text>
      <HStack gap="24" alignItems="center">
        <Icon name="cpu" size="48" color="#${palette.blue}" />
        <Icon name="database" size="48" color="#${palette.green}" />
        <Icon name="cloud" size="48" color="#${palette.accent}" />
        <Icon name="server" size="48" color="#${palette.red}" />
        <Icon name="shield" size="48" color="#${palette.navy}" />
      </HStack>
    </VStack>
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Size Variations</Text>
      <HStack gap="16" alignItems="end">
        <Icon name="star" size="20" color="#${palette.navy}" />
        <Icon name="star" size="32" color="#${palette.navy}" />
        <Icon name="star" size="48" color="#${palette.navy}" />
        <Icon name="star" size="64" color="#${palette.navy}" />
      </HStack>
    </VStack>
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Color Variations</Text>
      <HStack gap="24" alignItems="center">
        <Icon name="heart" size="48" color="#${palette.navy}" />
        <Icon name="heart" size="48" color="#${palette.blue}" />
        <Icon name="heart" size="48" color="#${palette.red}" />
        <Icon name="heart" size="48" color="#${palette.green}" />
      </HStack>
    </VStack>
  </HStack>
  <HStack gap="32">
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Background Variants</Text>
      <HStack gap="24" alignItems="center">
        <Icon name="cpu" size="48" variant="circle-filled" bgColor="#E8F0FE" color="#${palette.blue}" />
        <Icon name="star" size="48" variant="circle-outlined" bgColor="#${palette.blue}" color="#${palette.blue}" />
        <Icon name="settings" size="48" variant="square-filled" bgColor="#E8F0FE" color="#${palette.blue}" />
        <Icon name="lock" size="48" variant="square-outlined" bgColor="#${palette.navy}" color="#${palette.navy}" />
      </HStack>
    </VStack>
  </HStack>
</VStack>
`;

const svgSample = `
<VStack w="100%" h="max" padding="40" gap="32" justifyContent="center" alignItems="center" backgroundColor="${palette.background}">
  <Text fontSize="28" bold="true" color="${palette.navy}" w="100%" textAlign="center">Svg Node Example</Text>
  <HStack gap="32">
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Basic SVGs</Text>
      <HStack gap="24" alignItems="center">
        <Svg w="48" h="48">
          <svg viewBox="0 0 24 24"><polygon points="12,2 2,22 22,22" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round"/></svg>
        </Svg>
        <Svg w="48" h="48">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="2"/></svg>
        </Svg>
        <Svg w="48" h="48">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="black" stroke-width="2"/></svg>
        </Svg>
      </HStack>
    </VStack>
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Size Variations</Text>
      <HStack gap="16" alignItems="end">
        <Svg w="20" h="20">
          <svg viewBox="0 0 24 24"><polygon points="12,2 2,22 22,22" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round"/></svg>
        </Svg>
        <Svg w="32" h="32">
          <svg viewBox="0 0 24 24"><polygon points="12,2 2,22 22,22" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round"/></svg>
        </Svg>
        <Svg w="48" h="48">
          <svg viewBox="0 0 24 24"><polygon points="12,2 2,22 22,22" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round"/></svg>
        </Svg>
        <Svg w="64" h="64">
          <svg viewBox="0 0 24 24"><polygon points="12,2 2,22 22,22" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round"/></svg>
        </Svg>
      </HStack>
    </VStack>
    <VStack gap="20" padding="24" backgroundColor="FFFFFF" border.color="${palette.border}" border.width="1">
      <Text fontSize="16" bold="true">Color Variations</Text>
      <HStack gap="24" alignItems="center">
        <Svg w="48" h="48" color="#${palette.navy}">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke-width="2"/></svg>
        </Svg>
        <Svg w="48" h="48" color="#${palette.blue}">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke-width="2"/></svg>
        </Svg>
        <Svg w="48" h="48" color="#${palette.red}">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke-width="2"/></svg>
        </Svg>
        <Svg w="48" h="48" color="#${palette.green}">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke-width="2"/></svg>
        </Svg>
      </HStack>
    </VStack>
  </HStack>
</VStack>
`;

export const sampleNodes: Record<NodeType, string> = {
  text: textSample,
  image: imageSample,
  table: tableSample,
  shape: shapeSample,
  chart: chartSample,
  timeline: timelineSample,
  matrix: matrixSample,
  tree: treeSample,
  flow: flowSample,
  processArrow: processArrowSample,
  pyramid: pyramidSample,
  vstack: vstackSample,
  hstack: hstackSample,
  icon: iconSample,
  svg: svgSample,
};
