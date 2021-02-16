import React, { useEffect, useRef, useState } from 'react';

import { CodeEditor } from '../../api';
import { CodeEditor as CodeEditorView, CodeEditorProps } from '../../components/CodeEditor';

import { bundle, HttpClient, rx, StateObject, t, constants } from './common';
import { SaveTest } from './Dev.ACTIONS.save';
import { DevActions as DevActionsLib } from 'sys.ui.dev';

console.log('__CELL__', __CELL__);

const { PATH } = constants;

export type DevModel = {
  editor?: t.CodeEditorInstance;
  selection?: t.CodeEditorSelection;
  theme?: t.CodeEditorTheme;
};
type Ctx = { model: t.IStateObjectWritable<DevModel>; fire?: t.CodeEditorInstanceEventsFire };

/**
 * Actions for a single editor.
 */
export const DevActions = (bus: t.CodeEditorEventBus) => {
  const events = CodeEditor.events(bus);

  const model = StateObject.create<DevModel>({});

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
  const tmpActions = DevActionsLib<Ctx>().items((e) => {
    e.button('tmp', () => bus.fire({ type: 'CodeEditor/tmp', payload: { instance: 'one' } }));
    e.button('tmp.file', async (ctx) => {
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
    e.hr();
  });

  /**
   * Themes.
   */
  const themeActions = DevActionsLib<Ctx>().items((e) => {
    e.button('theme: light', () => model.change((draft) => (draft.theme = 'light')));
    e.button('theme: dark', () => model.change((draft) => (draft.theme = 'dark')));
    e.hr();
  });

  /**
   * Focus (between instances).
   */
  const focusActions = DevActionsLib<Ctx>().items((e) => {
    e.button('focus: one', () => events.editor('one').fire.focus());
    e.button('focus: two', () => events.editor('two').fire.focus());
    e.hr();
  });

  /**
   * Select
   */
  const selectActions = DevActionsLib<Ctx>().items((e) => {
    e.title('Select');
    e.button('position (0:5)', (e) => {
      e.ctx.fire?.select({ line: 0, column: 5 }, { focus: true });
    });
    e.button('range', (e) => {
      e.ctx.fire?.select(
        { start: { line: 1, column: 5 }, end: { line: 3, column: 10 } },
        { focus: true },
      );
    });
    e.button('ranges', (e) => {
      e.ctx.fire?.select(
        [
          { start: { line: 1, column: 2 }, end: { line: 1, column: 4 } },
          { start: { line: 3, column: 2 }, end: { line: 4, column: 8 } },
          { start: { line: 5, column: 1 }, end: { line: 5, column: 2 } },
        ],
        { focus: true },
      );
    });
    e.button('clear', (e) => {
      e.ctx.fire?.select(null, { focus: true });
    });

    e.hr();
  });

  /**
   * Text
   */
  const textActions = DevActionsLib<Ctx>().items((e) => {
    e.title('Text');

    e.button('short', (e) => {
      e.ctx.fire?.text('// hello');
    });

    e.button('sample', (e) => {
      const code = `
// sample
const a:number[] = [1,2,3]
import {add} from 'math'
const x = add(3, 5)
const total = a.reduce((acc, next) =>acc + next, 0)
      `;
      e.ctx.fire?.text(code);
    });

    e.button('null (clear)', (e) => {
      e.ctx.fire?.text(null);
    });

    e.hr();
  });

  /**
   * Command Actions
   */
  const cmdActions = DevActionsLib<Ctx>().items((e) => {
    e.title('Command Actions');
    e.button('format document (prettier)', async (e) => {
      const res = await e.ctx.fire?.action('editor.action.formatDocument');
      console.log('res', res);
    });
    e.button('format selection', async (e) => {
      const res = await e.ctx.fire?.action('editor.action.formatSelection');
      console.log('res', res);
    });

    e.hr();
  });

  /**
   * Type Libraries
   */
  const libsActions = DevActionsLib<Ctx>().items((e) => {
    e.title('Type Libraries');
    e.button('clear', () => events.fire.libs.clear());
    e.button('load: lib.es', async () => {
      const url = bundle.path(PATH.STATIC.TYPES.ES);
      const res = await events.fire.libs.load(url);
      console.log('res', res);
    });
    e.button('load: env', async () => {
      const url = bundle.path('static/types.d/inner/env.d.txt');
      // const url = bundle.path('dist/web/types.d/env.d.txt');

      console.log('url', url);

      const res = await events.fire.libs.load(url);
      console.log('res', res);
    });
    e.button('load: rxjs', async () => {
      const url = bundle.path('static/types.d/rxjs');
      // const url = bundle.path('dist/web/types.d/env.d.txt');

      console.log('url', url);

      const res = await events.fire.libs.load(url);
      console.log('res', res);
    });

    e.hr();
  });

  /**
   * Main
   */
  const main = DevActionsLib<Ctx>()
    .context((prev) => {
      const editor = model.state.editor;
      const fire = editor ? editor.events.fire : undefined;
      return { model, fire };
    })

    .merge(tmpActions)
    .merge(themeActions)
    .merge(focusActions)
    .merge(selectActions)
    .merge(textActions)
    .merge(cmdActions)
    .merge(libsActions)

    .subject((e) => {
      e.settings({
        layout: {
          border: -0.1,
          cropmarks: -0.2,
          background: 1,
          width: 800,
          height: 400,
        },
        host: { background: -0.04 },
      });

      const filename = {
        one: 'one.ts',
        two: 'foo/two.tsx',
      };

      const renderEditor = (id: string, filename: string, props: CodeEditorProps = {}) => {
        return (
          <CodeEditorView {...props} id={id} filename={filename} bus={bus} onReady={onReady} />
        );
      };

      const editor1 = renderEditor('one', filename.one, { focusOnLoad: true });
      const editor2 = renderEditor('two', filename.two);

      e.render(editor1, { label: '<CodeEditor>: one' });
      e.render(editor2, { label: '<CodeEditor>: two' });
    });

  return {
    renderActionPanel: main.renderActionPanel,
    onReady,
    model,
    main,
  };
};
