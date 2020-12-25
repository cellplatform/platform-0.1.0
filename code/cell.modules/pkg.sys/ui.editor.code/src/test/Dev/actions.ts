import { debounceTime } from 'rxjs/operators';
import { Actions } from 'sys.ui.harness';

import { CodeEditor } from '../../api';
import { bundle, HttpClient, rx, StateObject, t, constants } from '../../common';
import { SaveTest } from './actions.save';

console.log('__CELL__', __CELL__);

const { PATH } = constants;

type M = {
  editor?: t.CodeEditorInstance;
  selection?: t.CodeEditorSelection;
};
type Ctx = { model: t.IStateObjectWritable<M>; fire?: t.CodeEditorInstanceEventsFire };

/**
 * Actions for a single editor.
 */
export const DevActions = (bus: t.CodeEditorEventBus) => {
  const events = CodeEditor.events(bus); // TEMP 🐷

  const model = StateObject.create<M>({});

  const setSelection = () =>
    model.change((draft) => (draft.selection = model.state.editor?.selection));

  rx.payload<t.ICodeEditorSelectionChangedEvent>(events.instance$, 'CodeEditor/changed:selection')
    .pipe()
    .subscribe((e) => setSelection());

  const onReady: t.CodeEditorReadyEventHandler = (e) => {
    SaveTest(e.editor);

    e.editor.events.focus$.subscribe(() => {
      model.change((draft) => (draft.editor = e.editor));
      setSelection();
    });
  };

  /**
   * Focus (between instances).
   */
  const tmpActions = Actions<Ctx>()
    .button('tmp', () => bus.fire({ type: 'CodeEditor/tmp', payload: { instance: 'one' } }))
    .button('tmp.file', async (ctx) => {
      const uri = 'cell:ckgu71a83000dl0et1676dq9y:A1';
      const client = HttpClient.create(5000);
      console.log('client', client);
      const res = await client.info();

      const fs = client.cell(uri).fs;
      console.log('res', res);

      const encoder = new TextEncoder();
      const data = encoder.encode('hello\n');

      // const data = new ArrayBuffer()
      const uploaded = await fs.upload({ filename: 'foo/myfile.txt', data });

      console.log('uploaded', uploaded);
    });

  /**
   * Focus (between instances).
   */
  const focusActions = Actions<Ctx>()
    .button('focus: one', () => events.editor('one').fire.focus())
    .button('focus: two', () => events.editor('two').fire.focus());

  /**
   * Select
   */
  const selectActions = Actions<Ctx>()
    .title('Select')
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
    .title('Text')
    .button('short', (ctx) => {
      ctx.fire?.text('// hello');
    })
    .button('sample', (ctx) => {
      const code = `
// sample
const a:number[] = [1,2,3]
import {add} from 'math'
const x = add(3, 5)
const total = a.reduce((acc, next) =>acc + next, 0)
      `;
      ctx.fire?.text(code);
    })
    .button('null (clear)', (ctx) => {
      ctx.fire?.text(null);
    });

  /**
   * Command Actions
   */
  const cmdActions = Actions<Ctx>()
    .title('Command Actions')
    .button('format document', async (ctx) => {
      const res = await ctx.fire?.action('editor.action.formatDocument');
      console.log('res', res);
    });

  /**
   * Type Libraries
   */
  const libsActions = Actions<Ctx>()
    .title('Type Libraries')
    .button('clear', () => events.fire.libs.clear())
    .button('load: lib.es', async () => {
      const url = bundle.path(PATH.STATIC.TYPES.ES);
      const res = await events.fire.libs.load(url);
      console.log('res', res);
    });

  /**
   * Main
   */
  const main = Actions<Ctx>()
    .context((prev) => {
      const editor = model.state.editor;
      const fire = editor ? editor.events.fire : undefined;
      return { model, fire };
    })

    .merge(tmpActions)
    .hr()
    .merge(focusActions)
    .hr()
    .merge(selectActions)
    .hr()
    .merge(textActions)
    .hr()
    .merge(cmdActions)
    .hr()
    .merge(libsActions);

  return {
    render: main.render,
    onReady,
    model,
  };
};
