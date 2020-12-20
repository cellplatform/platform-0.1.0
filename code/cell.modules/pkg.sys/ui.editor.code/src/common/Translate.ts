import * as t from './types';

/**
 * Helpers for translating data between Monaco and CodeEditor.
 */
export const Translate = {
  position: {
    toCodeEditor(input: t.IMonacoPosition): t.CodeEditorPosition {
      return {
        line: input.lineNumber,
        column: input.column,
      };
    },
    toMonaco(input: t.CodeEditorPosition): t.IMonacoPosition {
      return {
        lineNumber: input.line,
        column: input.column,
      };
    },
  },
};
