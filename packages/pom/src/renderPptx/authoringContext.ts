import {
  addChart,
  addConnector,
  addPicture,
  addShape,
  addTable,
  addTextBox,
  reorderShapes,
  setSlideBackground,
  type AddChartInput,
  type AddConnectorInput,
  type AddPictureInput,
  type AddShapeInput,
  type AddTableInput,
  type AddTextBoxInput,
  type PptxSourceModel,
  type SourceHandle,
  type SourceShapeNode,
} from "@pptx-glimpse/document";

/** Mutable state needed only while authoring a PPTX. */
export class PptxAuthoringContext {
  private currentSlideHandle: SourceHandle | undefined;
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private tableCount = 0;
  private chartCount = 0;
  private connectorCount = 0;

  constructor(
    private currentSource: PptxSourceModel,
    readonly useLayoutTextMargins = false,
  ) {
    this.currentSlideHandle = currentSource.slides[0]?.handle;
  }

  selectTarget(handle: SourceHandle): void {
    this.currentSlideHandle = handle;
  }

  get source(): PptxSourceModel {
    return this.currentSource;
  }

  replaceSource(source: PptxSourceModel, target: SourceHandle): void {
    this.currentSource = source;
    this.currentSlideHandle = target;
  }

  private get target(): SourceHandle {
    if (!this.currentSlideHandle)
      throw new Error("glimpse slide or master is not selected");
    return this.currentSlideHandle;
  }

  addTextBox(input: AddTextBoxInput, name?: string): SourceHandle {
    this.currentSource = addTextBox(this.source, this.target, {
      ...input,
      name: name ?? `Text ${++this.textCount}`,
    });
    return this.latestTargetShapeHandle();
  }

  addShape(input: AddShapeInput, name?: string): SourceHandle {
    this.currentSource = addShape(this.source, this.target, {
      ...input,
      name: name ?? `Shape ${++this.shapeCount}`,
    });
    return this.latestTargetShapeHandle();
  }

  addConnector(input: AddConnectorInput, name?: string): SourceHandle {
    this.currentSource = addConnector(this.source, this.target, {
      ...input,
      name: name ?? `Connector ${++this.connectorCount}`,
    });
    return this.latestTargetShapeHandle();
  }

  currentTargetShapeHandles(): readonly SourceHandle[] {
    return this.currentTargetShapes().map((shape) => {
      if (!shape.handle) throw new Error("authored shape handle was not found");
      return shape.handle;
    });
  }

  reorderCurrentTargetShapes(handles: readonly SourceHandle[]): void {
    this.currentSource = reorderShapes(this.source, this.target, handles);
  }

  addPicture(input: AddPictureInput, name?: string): void {
    this.currentSource = addPicture(this.source, this.target, {
      ...input,
      name: name ?? `Picture ${++this.pictureCount}`,
    });
  }

  addTable(input: AddTableInput, name?: string): void {
    this.currentSource = addTable(this.source, this.target, {
      ...input,
      name: name ?? `Table ${++this.tableCount}`,
    });
  }

  addChart(input: AddChartInput, name?: string): void {
    this.currentSource = addChart(this.source, this.target, {
      ...input,
      name: name ?? `Chart ${++this.chartCount}`,
    });
  }

  setSlideBackground(
    background: Parameters<typeof setSlideBackground>[2],
  ): void {
    this.currentSource = setSlideBackground(
      this.source,
      this.target,
      background,
    );
  }

  private latestTargetShapeHandle(): SourceHandle {
    const handle = this.currentTargetShapes().at(-1)?.handle;
    if (!handle) throw new Error("authored shape handle was not found");
    return handle;
  }

  private currentTargetShapes(): readonly SourceShapeNode[] {
    const partPath = this.target.partPath;
    const target = [
      ...this.source.slides,
      ...this.source.slideLayouts,
      ...this.source.slideMasters,
    ].find((candidate) => candidate.partPath === partPath);
    if (!target) throw new Error("glimpse authoring target was not found");
    return target.shapes;
  }
}
