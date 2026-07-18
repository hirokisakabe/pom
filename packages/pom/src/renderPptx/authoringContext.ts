import {
  addChart,
  addPicture,
  addShape,
  addTable,
  addTextBox,
  setSlideBackground,
  type AddChartInput,
  type AddPictureInput,
  type AddShapeInput,
  type AddTableInput,
  type AddTextBoxInput,
  type PptxSourceModel,
  type SourceHandle,
} from "@pptx-glimpse/document";

/** Mutable state needed only while authoring a PPTX. */
export class PptxAuthoringContext {
  private currentSlideHandle: SourceHandle | undefined;
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private tableCount = 0;
  private chartCount = 0;

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

  replaceSource(source: PptxSourceModel): void {
    this.currentSource = source;
  }

  private get target(): SourceHandle {
    if (!this.currentSlideHandle)
      throw new Error("glimpse slide or master is not selected");
    return this.currentSlideHandle;
  }

  addTextBox(input: AddTextBoxInput, name?: string): void {
    this.currentSource = addTextBox(this.source, this.target, {
      ...input,
      name: name ?? `Text ${++this.textCount}`,
    });
  }

  addShape(input: AddShapeInput, name?: string): void {
    this.currentSource = addShape(this.source, this.target, {
      ...input,
      name: name ?? `Shape ${++this.shapeCount}`,
    });
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
}
