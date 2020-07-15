/**
 * A change with the code editor.
 */
export type IIdeModelChange = {
  forceMoveMarkers: boolean;
  range: IIdeModelRange;
  rangeLength: number;
  rangeOffset: number;
  text: string;
};

/**
 * A range within the model.
 */
export type IIdeModelRange = {
  endColumn: number;
  endLineNumber: number;
  startColumn: number;
  startLineNumber: number;
};
