console.log('__CELL__', __CELL__);

import { Actions } from 'sys.ui.harness';

import { StateObject, t, time } from '../../common';
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

  const focus = (instance: string) => time.delay(0, () => events.fire.focus(instance));

  const actions = Actions<Ctx>()
    .context((prev) => prev || { model })
    .button('focus: one', () => focus('one'))
    .button('focus: two', () => focus('two'))
    .group(`editor`, (e) => e.button('foo', () => null));

  const onReady: CodeEditorReadyEventHandler = (e) => {
    console.log('ready', e.id);
    const editor = e.editor;
    const events = editor.events;

    events.focus$.subscribe(() => {
      model.change((draft) => (draft.editor = editor));
    });

    // e.
  };

  events.selection$.subscribe((e) => {
    model.change((draft) => (draft.selection = model.state.editor?.selection));
  });

  return {
    render: actions.render,
    onReady,
    model,
  };
};
