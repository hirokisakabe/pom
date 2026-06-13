# pomxml Code Fence

For complex diagrams that Markdown cannot express, you can embed pom XML directly using `pomxml` code fences.

## Basic Usage

Wrap pom XML in a fenced code block with the `pomxml` language identifier:

````markdown
```pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="80" />
    <ChartDataPoint label="Q3" value="120" />
    <ChartDataPoint label="Q4" value="150" />
  </ChartSeries>
</Chart>
```
````

The content inside `pomxml` fences is passed through to the output XML as-is, without any conversion.

## Examples

### Chart

````markdown
```pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="80" />
    <ChartDataPoint label="Q3" value="120" />
    <ChartDataPoint label="Q4" value="150" />
  </ChartSeries>
</Chart>
```
````

### Flow Diagram

````markdown
```pomxml
<Flow direction="horizontal" w="600" h="200">
  <FlowNode id="plan" shape="flowChartProcess" text="Plan" />
  <FlowNode id="develop" shape="flowChartProcess" text="Develop" />
  <FlowNode id="release" shape="flowChartTerminator" text="Release" />
  <FlowConnection from="plan" to="develop" />
  <FlowConnection from="develop" to="release" />
</Flow>
```
````

### Timeline

````markdown
```pomxml
<Timeline direction="horizontal" w="900" h="120">
  <TimelineItem date="Q1" title="Phase 1" />
  <TimelineItem date="Q2" title="Phase 2" />
  <TimelineItem date="Q3" title="Phase 3" />
</Timeline>
```
````

## Mixing Markdown and pomxml

You can freely mix Markdown content and `pomxml` code fences within the same slide:

````markdown
# Project Status

- Overall progress is on track
- Budget within target

```pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="80" />
    <ChartDataPoint label="Q3" value="120" />
    <ChartDataPoint label="Q4" value="150" />
  </ChartSeries>
</Chart>
```
````

Each `pomxml` block is inserted into the slide at the position it appears in the Markdown source.

## Available Nodes

Any pom XML node can be used inside a `pomxml` code fence. See the [Nodes](/nodes) reference for the full list of available nodes and their attributes.
