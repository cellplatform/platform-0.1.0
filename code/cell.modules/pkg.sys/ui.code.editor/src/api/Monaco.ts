import { R, t, Translate } from '../common';

/**
 * API wrapper for Monaco.
 *
 *    https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const Monaco = {
  /**
   * Derive the current selection object.
   */
  getSelection(instance: t.IMonacoStandaloneCodeEditor): t.CodeEditorSelection {
    const toRange = (input: t.IMonacoSelection): t.CodeEditorRange => {
      return {
        start: { line: input.startLineNumber, column: input.startColumn },
        end: { line: input.endLineNumber, column: input.endColumn },
      };
    };

    const primary = toRange(instance.getSelection());

    const secondary = instance
      .getSelections()
      .map((s) => toRange(s))
      .filter((r) => !R.equals(r, primary));

    return {
      cursor: Translate.position.toEditor(instance.getPosition()),
      primary,
      secondary,
    };
  },
};
