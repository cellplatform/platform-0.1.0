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
  endColumn: number;
  startColumn: number;
  endLineNumber: number;
  startLineNumber: number;
};

/**
 * https://microsoft.github.io/monaco-editor/api/classes/monaco.selection.html
 */
export type IMonacoSelection = IMonacoRange & {
  toString(): string;
};
