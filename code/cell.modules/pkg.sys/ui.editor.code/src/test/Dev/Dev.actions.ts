console.log('__CELL__', __CELL__);

import { Actions } from 'sys.ui.harness';

import { StateObject, t } from '../../common';
import { CodeEditor, CodeEditorReadyEventHandler } from '../../components/CodeEditor';

type M = {
  editor?: t.CodeEditorInstance;
  selection?: t.CodeEditorSelection;
};
type Ctx = { model: t.IStateObjectWritable<M>; fire?: t.CodeEditorEventsFire };

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

  const setSelection = () =>
    model.change((draft) => (draft.selection = model.state.editor?.selection));

  events.selection$.subscribe((e) => setSelection());

  const onReady: CodeEditorReadyEventHandler = (e) => {
    e.editor.events.focus$.subscribe(() => {
      model.change((draft) => (draft.editor = e.editor));
      setSelection();
    });
  };

  /**
   * Focus (between instances).
   */
  const focusActions = Actions<Ctx>()
    .button('focus: one', () => events.fire('one').focus())
    .button('focus: two', () => events.fire('two').focus());

  /**
   * Select
   */
  const selectActions = Actions<Ctx>()
    .title('select')
    .button('position (0:5)', (ctx) => {
      ctx.fire?.select({ line: 0, column: 5 }, { focus: true });
    })
    .button('range', (ctx) => {
      ctx.fire?.select(
        { start: { line: 1, column: 5 }, end: { line: 3, column: 10 } },
        { focus: true },
      );
    })
    .button('ranges', (ctx) => {
      ctx.fire?.select(
        [
          { start: { line: 1, column: 2 }, end: { line: 1, column: 4 } },
          { start: { line: 3, column: 2 }, end: { line: 4, column: 8 } },
          { start: { line: 5, column: 1 }, end: { line: 5, column: 2 } },
        ],
        { focus: true },
      );
    })
    .button('clear', (ctx) => {
      ctx.fire?.select(null, { focus: true });
    });

  /**
   * Text
   */
  const textActions = Actions<Ctx>()
    .title('text')
    .button('short', (ctx) => {
      ctx.fire?.text('// hello');
    })
    .button('sample', (ctx) => {
      let code = `// sample\nconst a:number[] = [1,2,3]\n`;
      code += `import {add} from 'math';\nconst x = add(3, 5);\n`;
      code += `const total = a.reduce((acc, next) =>acc + next, 0);\n`;
      ctx.fire?.text(code);
    })
    .button('clear', (ctx) => {
      ctx.fire?.text(null);
    });

  /**
   * Type Libraries
   */
  const libsActions = Actions<Ctx>()
    .title('Type Libraries')
    .button('clear', () => {
      // TODO 🐷
      // getFire()?.text(null);
      // fire(() => )
      // current(({fire}) => fire.)
    });

  /**
   * Actions
   */
  const actions = Actions<Ctx>()
    .context((prev) => {
      const editor = model.state.editor;
      const fire = editor ? editor.events.fire(editor.id) : undefined;
      return { model, fire };
    })
    .merge(focusActions)
    .hr()
    .merge(selectActions)
    .hr()
    .merge(textActions)
    .hr()
    .merge(libsActions);

  return {
    render: actions.render,
    onReady,
    model,
  };
};
