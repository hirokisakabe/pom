import { palette } from "./palette.js";

// ============================================================
// Page 6: Chart Test
// テスト対象: chartType, data, showLegend, showTitle, chartColors
// ============================================================
export const page6ChartXml = `
<VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 6: Chart Test</Text>
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Bar Chart</Text>
      <Chart chartType="bar" w="400" h="180" showLegend="true" chartColors='["0088CC","00AA00"]'>
        <ChartSeries name="Sales">
          <ChartDataPoint label="Q1" value="100" />
          <ChartDataPoint label="Q2" value="200" />
          <ChartDataPoint label="Q3" value="150" />
          <ChartDataPoint label="Q4" value="300" />
        </ChartSeries>
        <ChartSeries name="Profit">
          <ChartDataPoint label="Q1" value="30" />
          <ChartDataPoint label="Q2" value="60" />
          <ChartDataPoint label="Q3" value="45" />
          <ChartDataPoint label="Q4" value="90" />
        </ChartSeries>
      </Chart>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Line Chart</Text>
      <Chart chartType="line" w="400" h="180" showLegend="true" chartColors='["${palette.blue}"]'>
        <ChartSeries name="Revenue">
          <ChartDataPoint label="Jan" value="50" />
          <ChartDataPoint label="Feb" value="80" />
          <ChartDataPoint label="Mar" value="60" />
          <ChartDataPoint label="Apr" value="120" />
          <ChartDataPoint label="May" value="100" />
          <ChartDataPoint label="Jun" value="150" />
        </ChartSeries>
      </Chart>
    </VStack>
  </HStack>
  <HStack gap="16" alignItems="stretch">
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Pie Chart (with title)</Text>
      <Chart chartType="pie" w="400" h="180" showLegend="true" showTitle="true" title="Market Share" chartColors='["0088CC","00AA00","FF6600","888888"]'>
        <ChartSeries name="Share">
          <ChartDataPoint label="A" value="40" />
          <ChartDataPoint label="B" value="30" />
          <ChartDataPoint label="C" value="20" />
          <ChartDataPoint label="D" value="10" />
        </ChartSeries>
      </Chart>
    </VStack>
    <VStack w="50%" padding="16" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Bar Chart (with title)</Text>
      <Chart chartType="bar" w="400" h="180" showLegend="true" showTitle="true" title="Regional Sales" chartColors='["${palette.blue}","${palette.accent}"]'>
        <ChartSeries name="2023">
          <ChartDataPoint label="N" value="250" />
          <ChartDataPoint label="S" value="180" />
          <ChartDataPoint label="E" value="220" />
          <ChartDataPoint label="W" value="150" />
        </ChartSeries>
        <ChartSeries name="2024">
          <ChartDataPoint label="N" value="300" />
          <ChartDataPoint label="S" value="200" />
          <ChartDataPoint label="E" value="250" />
          <ChartDataPoint label="W" value="180" />
        </ChartSeries>
      </Chart>
    </VStack>
  </HStack>
</VStack>
`;

// ============================================================
// Page 48: Chart Sparkline Mode
// テスト対象: sparkline=true で凡例 / 軸 / マージンが消えること
// ============================================================
export const page48ChartSparklineXml = `
<VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 48: Chart Sparkline Mode</Text>
  <VStack gap="12" alignItems="stretch">
    <HStack gap="16" alignItems="center" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}'>
      <Text fontSize="14" bold="true" w="120">Bar sparkline</Text>
      <Chart chartType="bar" w="200" h="40" sparkline="true" chartColors='["${palette.blue}"]'>
        <ChartSeries name="Sales">
          <ChartDataPoint label="Q1" value="100" />
          <ChartDataPoint label="Q2" value="200" />
          <ChartDataPoint label="Q3" value="150" />
          <ChartDataPoint label="Q4" value="300" />
        </ChartSeries>
      </Chart>
      <Text fontSize="12" color="${palette.charcoal}">凡例 / 軸 / 余白すべて非表示</Text>
    </HStack>
    <HStack gap="16" alignItems="center" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}'>
      <Text fontSize="14" bold="true" w="120">Line sparkline</Text>
      <Chart chartType="line" w="200" h="40" sparkline="true" chartColors='["${palette.accent}"]'>
        <ChartSeries name="Revenue">
          <ChartDataPoint label="Jan" value="50" />
          <ChartDataPoint label="Feb" value="80" />
          <ChartDataPoint label="Mar" value="60" />
          <ChartDataPoint label="Apr" value="120" />
          <ChartDataPoint label="May" value="100" />
          <ChartDataPoint label="Jun" value="150" />
        </ChartSeries>
      </Chart>
      <Text fontSize="12" color="${palette.charcoal}">凡例 / 軸 / 余白すべて非表示</Text>
    </HStack>
    <HStack gap="16" alignItems="center" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}'>
      <Text fontSize="14" bold="true" w="120">Area sparkline</Text>
      <Chart chartType="area" w="200" h="40" sparkline="true" chartColors='["${palette.blue}"]'>
        <ChartSeries name="Trend">
          <ChartDataPoint label="1" value="30" />
          <ChartDataPoint label="2" value="50" />
          <ChartDataPoint label="3" value="40" />
          <ChartDataPoint label="4" value="70" />
          <ChartDataPoint label="5" value="60" />
          <ChartDataPoint label="6" value="90" />
        </ChartSeries>
      </Chart>
      <Text fontSize="12" color="${palette.charcoal}">凡例 / 軸 / 余白すべて非表示</Text>
    </HStack>
  </VStack>
</VStack>
`;

// ============================================================
// Page 10: Additional Chart Types Test
// テスト対象: area, doughnut, radar
// ============================================================
export const page10ChartAdditionalXml = `
<VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch" backgroundColor="${palette.background}">
  <Text fontSize="28" color="${palette.charcoal}" bold="true">Page 10: Additional Chart Types</Text>
  <HStack gap="16" alignItems="stretch">
    <VStack w="33%" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Area Chart</Text>
      <Chart chartType="area" w="350" h="200" showLegend="true" chartColors='["0088CC"]'>
        <ChartSeries name="Revenue">
          <ChartDataPoint label="Jan" value="30" />
          <ChartDataPoint label="Feb" value="50" />
          <ChartDataPoint label="Mar" value="40" />
          <ChartDataPoint label="Apr" value="70" />
          <ChartDataPoint label="May" value="60" />
        </ChartSeries>
      </Chart>
    </VStack>
    <VStack w="33%" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Doughnut Chart</Text>
      <Chart chartType="doughnut" w="350" h="200" showLegend="true" chartColors='["0088CC","00AA00","FF6600","888888"]'>
        <ChartSeries name="Share">
          <ChartDataPoint label="A" value="35" />
          <ChartDataPoint label="B" value="25" />
          <ChartDataPoint label="C" value="25" />
          <ChartDataPoint label="D" value="15" />
        </ChartSeries>
      </Chart>
    </VStack>
    <VStack w="33%" padding="12" backgroundColor="FFFFFF" border='{"color":"${palette.border}","width":1}' gap="8">
      <Text fontSize="14" bold="true">Radar Chart</Text>
      <Chart chartType="radar" w="350" h="200" showLegend="true" chartColors='["0088CC"]' radarStyle="filled">
        <ChartSeries name="Skills">
          <ChartDataPoint label="Tech" value="80" />
          <ChartDataPoint label="Design" value="60" />
          <ChartDataPoint label="PM" value="70" />
          <ChartDataPoint label="Sales" value="50" />
          <ChartDataPoint label="Support" value="90" />
        </ChartSeries>
      </Chart>
    </VStack>
  </HStack>
</VStack>
`;
