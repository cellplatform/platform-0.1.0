import { t, Translate } from '../common';

export function select(args: {
  instance: t.IMonacoStandaloneCodeEditor;
  input: t.CodeEditorSelection | null;
}) {
  const { instance, input } = args;

  if (input === null) {
    // Clear.
    const pos = Translate.position.toEditor(instance.getPosition());
    const range: t.CodeEditorRange = { start: pos, end: pos };
    const selection = Translate.range.toMonaco(range).selection;
    instance.setSelection(selection);
  } else {
    // Assign.
    const selections = [input.primary, ...input.secondary]
      .filter(Boolean)
      .map((s) => Translate.range.toMonaco(s).selection);

    if (selections.length === 1) {
      instance.setSelection(selections[0]);
    }

    if (selections.length > 1) {
      const positionColumn = selections[0].positionColumn;
      const positionLineNumber = selections[0].positionLineNumber;
      instance.setSelections(
        selections.map((item) => ({
          ...item,
          positionLineNumber,
          positionColumn,
          selectionStartColumn: item.startColumn,
          selectionStartLineNumber: item.startLineNumber,
        })),
      );
    }
  }
}
