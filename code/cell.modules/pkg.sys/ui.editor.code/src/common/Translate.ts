import * as t from './types';

/**
 * Helpers for translating data between [Monaco] and [CodeEditor].
 */
export const Translate = {
  position: {
    toEditor(input: t.IMonacoPosition): t.CodeEditorPosition {
      return {
        line: clamp(input.lineNumber),
        column: clamp(input.column),
      };
    },
    toMonaco(input: t.CodeEditorPosition): t.IMonacoPosition {
      return {
        lineNumber: clamp(input.line),
        column: clamp(input.column),
      };
    },
  },

  range: {
    toEditor(input: t.IMonacoRange): t.CodeEditorRange {
      return {
        start: { line: clamp(input.startLineNumber), column: clamp(input.startColumn) },
        end: { line: clamp(input.endLineNumber), column: clamp(input.endColumn) },
      };
    },
    toMonaco(input: t.CodeEditorRange) {
      const range: t.IMonacoRange = {
        startColumn: clamp(input.start.column),
        endColumn: clamp(input.end.column),
        startLineNumber: clamp(input.start.line),
        endLineNumber: clamp(input.end.line),
      };
      const selection: t.IMonacoSelection = {
        ...range,
        positionColumn: clamp(range.endColumn),
        positionLineNumber: clamp(range.endLineNumber),
      };
      return { range, selection };
    },
  },
};

/**
 * [Helpers]
 */

const clamp = (value: number) => Math.max(1, value);
