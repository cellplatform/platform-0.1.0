import { Is, rx, t } from '../../common';

/**
 * Handles events issued to the editor.
 */
export function InstanceEventHandlers(bus: t.CodeEditorEventBus, editor: t.CodeEditorInstance) {
  const { events } = editor;
  const instance = editor.id;
  const $ = events.$;

  rx.payload<t.ICodeEditorTmpEvent>($, 'CodeEditor/tmp')
    .pipe()
    .subscribe(async (e) => {
      console.log('tmp');

      editor.singleton.libs.clear();
    });

  /**
   * Run action.
   */
  rx.payload<t.ICodeEditorRunActionEvent>($, 'CodeEditor/action:run')
    .pipe()
    .subscribe(async (e) => {
      const tx = e.tx || '';
      const complete = (error?: string) =>
        bus.fire({
          type: 'CodeEditor/action:complete',
          payload: { instance, action: e.action, error, tx },
        });
      try {
        const action = editor.action(e.action);
        await action.run();
        complete();
      } catch (error) {
        complete(error);
      }
    });

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
