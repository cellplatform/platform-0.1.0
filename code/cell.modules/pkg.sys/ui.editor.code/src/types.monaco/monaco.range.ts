/**
 * https://microsoft.github.io/monaco-editor/api/classes/monaco.position.html
 */
export type IMonacoPosition = {
  column: number;
  lineNumber: number;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.irange.html
 */
export type IMonacoRange = {
  startColumn: number;
  endColumn: number;
  startLineNumber: number;
  endLineNumber: number;
};

/**
 * https://microsoft.github.io/monaco-editor/api/classes/monaco.selection.html
 */
export type IMonacoSelection = IMonacoRange & {
  positionColumn: number;
  positionLineNumber: number;
  toString(): string;
};
