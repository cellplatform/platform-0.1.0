console.log('__CELL__', __CELL__);

import { Actions } from 'sys.ui.harness';

import { StateObject, t } from '../../common';
import { CodeEditor, CodeEditorReadyEventHandler } from '../../components/CodeEditor';

type M = {
  editor?: t.CodeEditorInstance;
  selection?: t.CodeEditorSelection;
};
type Ctx = { model: t.IStateObjectWritable<M> };

/**
 * Actions for a single editor.
 */
export const editorActions = (bus: t.CodeEditorEventBus) => {
  const events = CodeEditor.events(bus);
  const model = StateObject.create<M>({});

  events.text$.subscribe((e) => {
    console.log('-------------------------------------------');
    console.log('text', e);
    console.log('text', model.state.editor?.text);
  });

  const getEditor = () => model.state.editor;

  const getFire = () => {
    const editor = getEditor();
    return editor ? events.fire(editor.id) : undefined;
  };

  const setSelection = () =>
    model.change((draft) => (draft.selection = model.state.editor?.selection));

  const focus = (instance: string) => events.fire(instance).focus();

  events.selection$.subscribe((e) => setSelection());

  const onReady: CodeEditorReadyEventHandler = (e) => {
    e.editor.events.focus$.subscribe(() => {
      model.change((draft) => (draft.editor = e.editor));
      setSelection();
    });
  };

  /**
   * Focus
   */
  const focusActions = Actions<Ctx>()
    .button('focus: one', () => focus('one'))
    .button('focus: two', () => focus('two'));

  /**
   * Select
   */
  const selectActions = Actions<Ctx>()
    .button('select: position (0:5)', () => {
      getFire()?.select({ line: 0, column: 5 }, { focus: true });
    })
    .button('select: range', () => {
      getFire()?.select(
        { start: { line: 1, column: 5 }, end: { line: 3, column: 10 } },
        { focus: true },
      );
    })
    .button('select: ranges', () => {
      getFire()?.select(
        [
          { start: { line: 1, column: 2 }, end: { line: 1, column: 4 } },
          { start: { line: 3, column: 2 }, end: { line: 4, column: 8 } },
          { start: { line: 5, column: 1 }, end: { line: 5, column: 2 } },
        ],
        { focus: true },
      );
    })
    .button('select: clear', () => {
      getFire()?.select(null, { focus: true });
    });

  /**
   * Text
   */

  const textActions = Actions<Ctx>()
    .button('text: sample', () => {
      let code = `// sample\nconst a:number[] = [1,2,3]\n`;
      code += `import {add} from 'math';\nconst x = add(3, 5);\n`;
      code += `const total = a.reduce((acc, next) =>acc + next, 0);\n`;
      getFire()?.text(code);
    })
    .button('text: clear', () => {
      getFire()?.text(null);
    });

  /**
   * Actions
   */
  const actions = Actions<Ctx>()
    .context((prev) => prev || { model })
    .merge(focusActions)
    .hr()
    .merge(selectActions)
    .hr()
    .merge(textActions);

  return {
    render: actions.render,
    onReady,
    model,
  };
};
