import {
  createPptxAuthoringSession,
  type AddChartInput,
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
} from "@pptx-glimpse/document";

/** Mutable state needed only while authoring a PPTX. */
export class PptxAuthoringContext {
  private readonly session: PptxAuthoringSession;
  private currentTarget: PptxAuthoringTarget | undefined;
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private tableCount = 0;
  private chartCount = 0;

  constructor(
    source: PptxSourceModel,
    readonly useLayoutTextMargins = false,
  ) {
    this.session = createPptxAuthoringSession(source);
    const firstSlideHandle = source.slides[0]?.handle;
    if (firstSlideHandle) this.selectTarget(firstSlideHandle);
  }

  selectTarget(handle: SourceHandle): void {
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

  addTextBox(input: AddTextBoxInput, name?: string): void {
    this.target.addTextBox({
      ...input,
      name: name ?? `Text ${++this.textCount}`,
    });
  }

  addShape(input: AddShapeInput, name?: string): void {
    this.target.addShape({
      ...input,
      name: name ?? `Shape ${++this.shapeCount}`,
    });
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
}
