import {
  createPptxAuthoringSession,
  type AddChartInput,
  type AddConnectorInput,
  type AddEmptySlideFromLayoutInput,
  type AddPictureInput,
  type AddShapeInput,
  type AddSlideNumberInput,
  type AddTableInput,
  type AddTextBoxInput,
  type PptxAuthoringSession,
  type PptxAuthoringTarget,
  type PptxSourceModel,
  type SourceHandle,
  type SourceShapeNode,
} from "@pptx-glimpse/document";

/** Mutable state needed only while authoring a PPTX. */
export class PptxAuthoringContext {
  private readonly session: PptxAuthoringSession;
  private currentTargetHandle: SourceHandle | undefined;
  private currentTarget: PptxAuthoringTarget | undefined;
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private tableCount = 0;
  private chartCount = 0;
  private connectorCount = 0;

  constructor(
    source: PptxSourceModel,
    readonly useLayoutTextMargins = false,
  ) {
    this.session = createPptxAuthoringSession(source);
    const firstSlideHandle = source.slides[0]?.handle;
    if (firstSlideHandle) this.selectTarget(firstSlideHandle);
  }

  selectTarget(handle: SourceHandle): void {
    this.currentTargetHandle = handle;
    this.currentTarget = this.session.target(handle);
  }

  get source(): PptxSourceModel {
    return this.session.source;
  }

  addEmptySlideFromLayout(input: AddEmptySlideFromLayoutInput): SourceHandle {
    return this.session.addEmptySlideFromLayout(input);
  }

  private get target(): PptxAuthoringTarget {
    if (!this.currentTarget)
      throw new Error("glimpse slide or master is not selected");
    return this.currentTarget;
  }

  addTextBox(input: AddTextBoxInput, name?: string): SourceHandle {
    return this.target.addTextBox({
      ...input,
      name: name ?? `Text ${++this.textCount}`,
    });
  }

  addShape(input: AddShapeInput, name?: string): SourceHandle {
    return this.target.addShape({
      ...input,
      name: name ?? `Shape ${++this.shapeCount}`,
    });
  }

  addConnector(input: AddConnectorInput, name?: string): SourceHandle {
    return this.target.addConnector({
      ...input,
      name: name ?? `Connector ${++this.connectorCount}`,
    });
  }

  currentTargetShapeHandles(): readonly SourceHandle[] {
    return this.currentTargetShapes().map((shape) => {
      if (!shape.handle) throw new Error("authored shape handle was not found");
      return shape.handle;
    });
  }

  reorderCurrentTargetShapes(handles: readonly SourceHandle[]): void {
    this.target.reorderShapes(handles);
  }

  addPicture(input: AddPictureInput, name?: string): void {
    this.target.addPicture({
      ...input,
      name: name ?? `Picture ${++this.pictureCount}`,
    });
  }

  addTable(input: AddTableInput, name?: string): void {
    this.target.addTable({
      ...input,
      name: name ?? `Table ${++this.tableCount}`,
    });
  }

  addChart(input: AddChartInput, name?: string): void {
    this.target.addChart({
      ...input,
      name: name ?? `Chart ${++this.chartCount}`,
    });
  }

  addSlideNumber(input: AddSlideNumberInput): void {
    this.target.addSlideNumber(input);
  }

  setSlideBackground(
    background: Parameters<PptxAuthoringTarget["setSlideBackground"]>[0],
  ): void {
    this.target.setSlideBackground(background);
  }

  private currentTargetShapes(): readonly SourceShapeNode[] {
    const partPath = this.currentTargetHandle?.partPath;
    if (!partPath) throw new Error("glimpse slide or master is not selected");
    const target = [
      ...this.source.slides,
      ...this.source.slideLayouts,
      ...this.source.slideMasters,
    ].find((candidate) => candidate.partPath === partPath);
    if (!target) throw new Error("glimpse authoring target was not found");
    return target.shapes;
  }
}
