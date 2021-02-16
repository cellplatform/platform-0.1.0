import React from 'react';
import { DevActions, toObject } from 'sys.ui.dev';

import { CodeEditor as CodeEditorView, CodeEditorProps } from '.';
import { CodeEditor } from '../../api';
import { rx, t, bundle, constants } from '../../common';

type Ctx = {
  props: CodeEditorProps;
  focusedEditor?: t.CodeEditorInstance;
  fire?: t.CodeEditorInstanceEventsFire;
};

const { PATH } = constants;
const bus = rx.bus<t.CodeEditorEvent>();
const events = CodeEditor.events(bus);
const INITIAL: Ctx = { props: {} };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/CodeEditor')
  .context((prev) => prev || INITIAL)

  .items((e) => {
    e.title('tmp');
    e.button('foo', (e) => {
      console.log('> e.ctx:', toObject(e.ctx));
    });
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
    e.button('instance: "one"', () => events.editor('one').fire.focus());
    e.button('instance: "two"', () => events.editor('two').fire.focus());
    e.hr();
  })

  /**
   * Select.
   */
  .items((e) => {
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
  })

  /**
   * Text.
   */
  .items((e) => {
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
  })

  /**
   * Command Actions.
   */
  .items((e) => {
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
  })

  /**
   * Type Libraries.
   */
  .items((e) => {
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
      e.editor.events.focus$.subscribe(() => {
        ctx.focusedEditor = e.editor;
        ctx.fire = e.editor.events.fire;

        // model.change((draft) => (draft.editor = e.editor));
        // setSelection();
      });
    };

    const renderEditor = (id: string, filename: string, props: CodeEditorProps = {}) => {
      props = { ...e.ctx.props, ...props };
      console.log('props', props);
      return <CodeEditorView {...props} id={id} filename={filename} bus={bus} onReady={onReady} />;
    };

    const editor1 = renderEditor('one', filename.one, { focusOnLoad: true });
    const editor2 = renderEditor('two', filename.two);

    e.render(editor1, { label: '<CodeEditor>: one' });
    e.render(editor2, { label: '<CodeEditor>: two' });
  });

export default actions;
