import { rx, t, Is } from '../common';

/**
 * Handles change requests issued via events.
 */
export function ChangeHandlers(args: { editor: t.CodeEditorInstance; events: t.CodeEditorEvents }) {
  const { editor, events } = args;
  const $ = events.$;

  /**
   * Focus
   */
  rx.payload<t.ICodeEditorChangeFocusEvent>($, 'CodeEditor/change:focus')
    .pipe()
    .subscribe((e) => editor.focus());

  /**
   * Selection
   */
  rx.payload<t.ICodeEditorChangeSelectionEvent>($, 'CodeEditor/change:selection')
    .pipe()
    .subscribe((e) => {
      if (e.selection === null) {
        editor.select(null);
      }

      if (Is.position(e.selection)) {
        // Simple cursor position provided.
        const position = e.selection as t.CodeEditorPosition;
        editor.select({
          cursor: position,
          primary: { start: position, end: position },
          secondary: [],
        });
      }

      if (Is.range(e.selection)) {
        // Single range selection.
        const primary = e.selection as t.CodeEditorRange;
        editor.select({
          cursor: primary.end,
          primary,
          secondary: [],
        });
      }

      if (Array.isArray(e.selection)) {
        const selections = e.selection.filter((s) => Is.range(s));
        if (selections.length > 0) {
          const primary = selections[0];
          editor.select({
            cursor: primary.end,
            primary,
            secondary: selections.slice(1),
          });
        }
      }

      if (e.focus) {
        editor.focus();
      }
    });

  /**
   * Text
   */
  rx.payload<t.ICodeEditorChangeTextEvent>($, 'CodeEditor/change:text')
    .pipe()
    .subscribe((e) => (editor.text = e.text || ''));
}
