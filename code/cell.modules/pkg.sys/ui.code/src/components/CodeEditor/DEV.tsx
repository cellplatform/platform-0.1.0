import React from 'react';
import { DevActions, toObject } from 'sys.ui.dev';

import { CodeEditor as CodeEditorView, CodeEditorProps } from '.';
import { CodeEditor } from '../../api';
import { rx, t, bundle, constants } from '../../common';

type Ctx = {
  props: CodeEditorProps;
  focusedEditor?: t.CodeEditorInstance;
  global: t.CodeEditorEvents;
  instance?: t.CodeEditorInstanceEvents;
};

const { PATH } = constants;
const bus = rx.bus<t.CodeEditorEvent>();

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.code/CodeEditor')
  .context((e) => {
    if (e.prev) return e.prev;
    const global = CodeEditor.events(bus);
    const ctx: Ctx = { props: {}, global };
    return ctx;
  })

  .items((e) => {
    e.title('Language');
    e.button('typescript', (e) => e.ctx.instance?.model.set.language('typescript'));
    e.button('json', (e) => e.ctx.instance?.model.set.language('json'));
    e.hr();
  })

  /**
   * Themes.
   */
  .items((e) => {
    e.title('Theme');
    e.button('light', (e) => (e.ctx.props.theme = 'light'));
    e.button('dark', (e) => (e.ctx.props.theme = 'dark'));
    e.hr();
  })

  /**
   * Focus (between instances).
   */
  .items((e) => {
    e.title('Focus');
    e.button('instance: "one"', (e) => e.ctx.global.editor('one').focus.fire());
    e.button('instance: "two"', (e) => e.ctx.global.editor('two').focus.fire());
    e.hr();
  })

  /**
   * Select.
   */
  .items((e) => {
    e.title('Select');
    e.button('position (0:5)', (e) => {
      e.ctx.instance?.selection.select({ line: 0, column: 5 }, { focus: true });
    });
    e.button('range', (e) => {
      e.ctx.instance?.selection.select(
        { start: { line: 1, column: 5 }, end: { line: 3, column: 10 } },
        { focus: true },
      );
    });
    e.button('ranges', (e) => {
      e.ctx.instance?.selection.select(
        [
          { start: { line: 1, column: 2 }, end: { line: 1, column: 4 } },
          { start: { line: 3, column: 2 }, end: { line: 4, column: 8 } },
          { start: { line: 5, column: 1 }, end: { line: 5, column: 2 } },
        ],
        { focus: true },
      );
    });
    e.button('clear', (e) => {
      e.ctx.instance?.selection.select(null, { focus: true });
    });

    e.hr();
  })

  /**
   * Text.
   */
  .items((e) => {
    e.title('Text');

    e.button('get', async (e) => {
      const res = await e.ctx.instance?.text.get.fire();
      console.log('text', res);
    });

    e.hr(1, 0.1);

    e.button('set: short', (e) => {
      e.ctx.instance?.text.set('// hello');
    });

    e.button('set: sample', (e) => {
      const code = `
// sample
const a:number[] = [1,2,3]
import {add} from 'math'
const x = add(3, 5)
const total = a.reduce((acc, next) =>acc + next, 0)
      `;
      e.ctx.instance?.text.set(code);
    });

    e.button('set: null (clear)', (e) => {
      e.ctx.instance?.text.set(null);
    });

    e.hr();
  })

  /**
   * Command Actions.
   */
  .items((e) => {
    e.title('Command Actions');
    e.button('format document (prettier)', async (e) => {
      const res = await e.ctx.instance?.action.fire('editor.action.formatDocument');
      console.log('res', res);
    });
    e.button('format selection', async (e) => {
      const res = await e.ctx.instance?.action.fire('editor.action.formatSelection');
      console.log('res', res);
    });

    e.hr();
  })

  /**
   * Type Libraries.
   */
  .items((e) => {
    e.title('Type Libraries');
    e.button('clear', (e) => e.ctx.global.libs.clear());
    e.button('load: lib.es', async (e) => {
      const url = bundle.path(PATH.STATIC.TYPES.ES);
      const res = await e.ctx.global.libs.load(url);
      console.log('res', res);
    });
    e.button('load: env', async (e) => {
      const url = bundle.path('static/types.d/inner/env.d.txt');
      // const url = bundle.path('dist/web/types.d/env.d.txt');

      console.log('url', url);

      const res = await e.ctx.global.libs.load(url);
      console.log('res', res);
    });
    e.button('load: rxjs', async (e) => {
      const url = bundle.path('static/types.d/rxjs');
      // const url = bundle.path('dist/web/types.d/env.d.txt');

      console.log('url', url);

      const res = await e.ctx.global.libs.load(url);
      console.log('res', res);
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    const { ctx } = e;
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

    const onReady: t.CodeEditorReadyEventHandler = (e) => {
      console.log('onReady', e);
      // SaveTest(e.editor);
      e.editor.events.focus.changed$.subscribe(() => {
        ctx.focusedEditor = e.editor;
        ctx.instance = e.editor.events;

        // model.change((draft) => (draft.editor = e.editor));
        // setSelection();
      });
    };

    const renderEditor = (id: string, filename: string, props: CodeEditorProps = {}) => {
      props = { ...e.ctx.props, ...props };
      return <CodeEditorView {...props} id={id} filename={filename} bus={bus} onReady={onReady} />;
    };

    const editor1 = renderEditor('one', filename.one, { focusOnLoad: true });
    const editor2 = renderEditor('two', filename.two);

    e.render(editor1, { label: '<CodeEditor>: one' });
    e.render(editor2, { label: '<CodeEditor>: two' });
  });

export default actions;
