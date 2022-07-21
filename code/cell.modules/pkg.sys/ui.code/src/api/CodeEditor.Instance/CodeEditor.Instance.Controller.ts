import { Is, rx, t } from '../common';

/**
 * Handles events issued to the editor.
 */
export function InstanceController(bus: t.CodeEditorEventBus, editor: t.CodeEditorInstance) {
  const { events } = editor;
  const instance = editor.id;
  const $ = events.$;

  /**
   * Run action.
   */
  rx.payload<t.CodeEditorRunActionReqEvent>($, 'sys.ui.code/action:req')
    .pipe()
    .subscribe(async (e) => {
      const complete = (error?: string) => {
        const { tx, action } = e;
        bus.fire({
          type: 'sys.ui.code/action:res',
          payload: { tx, instance, action, error },
        });
      };
      try {
        const action = editor.action(e.action);
        await action.run();
        complete();
      } catch (error: any) {
        complete(error);
      }
    });

  /**
   * Focus
   */
  rx.payload<t.CodeEditorFocusEvent>($, 'sys.ui.code/focus')
    .pipe()
    .subscribe((e) => editor.focus());

  /**
   * Selection
   */
  rx.payload<t.CodeEditorChangeSelectionEvent>($, 'sys.ui.code/change:selection')
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
  rx.payload<t.CodeEditorChangeTextEvent>($, 'sys.ui.code/change:text')
    .pipe()
    .subscribe((e) => (editor.text = e.text || ''));

  rx.payload<t.CodeEditorTextReqEvent>($, 'sys.ui.code/text:req')
    .pipe()
    .subscribe((e) => {
      const { tx } = e;
      const text = editor.text;
      bus.fire({
        type: 'sys.ui.code/text:res',
        payload: { tx, instance, text },
      });
    });

  /**
   * Model
   */
  rx.payload<t.CodeEditorModelReqEvent>($, 'sys.ui.code/model:req')
    .pipe()
    .subscribe((e) => {
      const { tx, change } = e;

      if (change) {
        if (change.language !== undefined) editor.language = change.language;
        if (change.text !== undefined) editor.text = change.text;
        if (change.selection !== undefined) editor.select(change.selection);
      }

      const model: t.CodeEditorModel = {
        language: editor.language,
        text: editor.text,
        selection: editor.selection,
      };

      bus.fire({
        type: 'sys.ui.code/model:res',
        payload: {
          tx,
          instance,
          action: change ? 'update' : 'read',
          model,
        },
      });
    });
}
