import React from 'react';
import { debounceTime } from 'rxjs/operators';
import { DevActions, ObjectView, TestFilesystem, t } from '../../../test';

import { CodeEditor as CodeEditorView, CodeEditorProps } from '..';
import { CodeEditor } from '../../../api';
import { rx, deleteUndefined, constants, Filesystem } from '../common';

type Ctx = {
  ready: boolean;
  props: CodeEditorProps;

  global?: {
    filesystem: { fs: t.Fs; instance: t.FsViewInstance };
    events: t.CodeEditorEvents;
  };

  instance?: t.CodeEditorInstanceEvents;
  debug: {
    focusedEditor?: t.CodeEditorInstance;
    readOutput?: any;
  };
};

const { PATH } = constants;

const FILENAME = {
  one: 'one.ts',
  two: 'foo/two.tsx',
};

const SAMPLE = `
// sample
const a:number[] = [1,2,3]
import {add} from 'math'
const x = add(3, 5)
const total = a.reduce((acc,next) =>add(acc,next), 0)
`;

const Util = {
  bus: (ctx: Ctx) => ctx.props?.instance?.bus,
  fs: (ctx: Ctx) => ctx.global?.filesystem.fs,
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.CodeEditor')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      ready: false,
      props: {
        instance: { bus: rx.bus() }, // Placeholder DUMMY.
        language: 'typescript',
      },
      debug: {},
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const events = CodeEditor.events(bus);
    const filesystem = TestFilesystem.init({ bus });
    const instance = filesystem.instance();
    const { fs } = filesystem;

    ctx.props.instance = { bus };
    ctx.global = {
      events,
      filesystem: { instance, fs },
    };
    ctx.ready = true;

    e.redraw();
  })

  .items((e) => {
    e.title('Language');

    e.select((config) =>
      config
        .title('language:')
        .items(CodeEditor.languages)
        .initial(config.ctx.props.language)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.language = e.changing.next[0].value;
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Filesystem');

    const read = (filename: string) => {
      e.button(`read: ${filename}`, async (e) => {
        const fs = Util.fs(e.ctx);
        if (!fs) return;
        if (!e.ctx.instance) return;

        const exists = await fs.exists(filename);
        const data = await fs.read(filename);
        const bytes = data?.byteLength;
        e.ctx.debug.readOutput = deleteUndefined({ exists, filename, bytes, data });
      });
    };

    e.hr(1, 0.1);
    read(FILENAME.one);
    read(FILENAME.two);

    e.component((e) => {
      const output = e.ctx.debug.readOutput;
      if (!output) return null;
      return (
        <ObjectView
          name={'read'}
          data={output}
          fontSize={11}
          style={{ MarginX: 20, MarginY: 10 }}
        />
      );
    });
    e.hr(1, 0.1);

    e.button('delete (all)', async (e) => {
      const fs = Util.fs(e.ctx);
      if (!fs) return;

      const filenames = Object.values(FILENAME);
      for (const path of filenames) {
        await fs.delete(path);
      }

      await fs.delete('index.json');
    });

    e.component((e) => {
      const instance = e.ctx.global?.filesystem.instance;
      if (!instance) return null;
      return (
        <Filesystem.PathList.Dev
          instance={instance}
          margin={[20, 10, 20, 10]}
          height={100}
          selectable={{ ...Filesystem.PathList.SelectionConfig.default, multi: false }}
          onStateChanged={async (change) => {
            if (change.kind === 'Selection') {
              const selection = change.to.selection;

              const fs = change.fs;
              console.group('🌳 ');
              console.log('fs', fs);

              const manifest = await fs.manifest({ cache: false });
              const files = manifest.files.filter((f, i) => selection?.indexes.includes(i));
              const file = files[0];

              if (file) {
                const path = file.path;
                const text = new TextDecoder().decode(await fs.read(path));

                console.log('path', path);
                console.log('text', text);
                // e.ctx.instance?.text.set(text);
              }

              console.groupEnd();
            }
          }}
        />
      );
    });

    e.hr();
  })

  /**
   * Themes.
   */
  .items((e) => {
    e.title('Theme');
    e.button('dark', (e) => (e.ctx.props.theme = 'dark'));
    e.button('light', (e) => (e.ctx.props.theme = 'light'));
    e.hr();
  })

  /**
   * Focus (between instances).
   */
  .items((e) => {
    e.title('Focus');
    const focus = (ctx: Ctx, id: string) => {
      ctx.global?.events.editor(id).focus.fire();
    };
    e.button('⚡️ instance: "one"', (e) => focus(e.ctx, 'one'));
    e.button('⚡️ instance: "two"', (e) => focus(e.ctx, 'two'));
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

    e.button('⚡️ get', async (e) => {
      const res = await e.ctx.instance?.text.get.fire();
      console.log('text', res);
    });

    e.button('⚡️ set: short', (e) => {
      e.ctx.instance?.text.set('// hello');
    });

    e.button('⚡️ set: sample', (e) => {
      e.ctx.instance?.text.set(SAMPLE);
    });

    e.button('⚡️ set: null (clear)', (e) => {
      e.ctx.instance?.text.set(null);
    });

    e.hr();
  })

  /**
   * Command Actions.
   */
  .items((e) => {
    e.title('Command Actions');
    e.button('⚡️ format document (prettier)', async (e) => {
      const res = await e.ctx.instance?.action.fire('editor.action.formatDocument');
      console.log('res', res);
    });
    e.button('⚡️ format selection', async (e) => {
      const res = await e.ctx.instance?.action.fire('editor.action.formatSelection');
      console.log('res', res);
    });

    e.hr();
  })

  /**
   * Type Libraries.
   */
  .items((e) => {
    const resolvePath = (input: string) => {
      console.log('TODO / resolve path', input); // TODO 🐷
      return input;
    };

    e.title('Type Libraries');
    e.button('clear', (e) => e.ctx.global?.events.libs.clear.fire());
    e.hr(1, 0.1);
    e.button('load: lib.es', async (e) => {
      const url = resolvePath(PATH.STATIC.TYPES.ES);
      const res = await e.ctx.global?.events.libs.load.fire(url);
      console.log('res', res);
    });
    e.button('[TODO] load: env', async (e) => {
      const url = resolvePath('static/types.d/inner/env.d.txt');
      // const url = toPath('dist/web/types.d/env.d.txt');

      console.log('url', url);

      const res = await e.ctx.global?.events.libs.load.fire(url);
      console.log('res', res);
    });
    e.button('[TODO] load: rxjs', async (e) => {
      const url = resolvePath('static/types.d/rxjs');
      // const url = toPath('dist/web/types.d/env.d.txt');

      console.log('url', url);

      const res = await e.ctx.global?.events.libs.load.fire(url);
      console.log('res', res);
    });

    e.hr();
  })

  .items((e) => {
    e.component((e) => {
      const name = 'ctx';
      const data = e.ctx;
      return (
        <ObjectView
          name={name}
          data={data}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  /**
   * Render
   */
  .subject((e) => {
    const { ctx } = e;
    const bus = Util.bus(ctx);
    const fs = Util.fs(e.ctx);

    e.settings({
      layout: {
        background: 1,
        border: -0.1,
        cropmarks: -0.2,
        width: 700,
        height: 230,
      },
      host: { background: -0.04 },
    });

    if (!bus || !ctx.ready) return;

    const saveOnChange = (editor: t.CodeEditorInstance, filename: string) => {
      editor.events.text.changed$.pipe(debounceTime(500)).subscribe(async (e) => {
        if (!fs) return;
        const text = editor.text;
        const data = new TextEncoder().encode(text);
        const res = await fs.write(filename, data);
        console.log('🤖 saved:', filename, res);
      });
    };

    const handleReady = (filename: string, e: t.CodeEditorReadyEvent) => {
      console.log('⚡️ [CodeEditor].onReady', e);

      saveOnChange(e.editor, filename);

      e.editor.events.focus.changed$.subscribe(() => {
        ctx.debug.focusedEditor = e.editor;
        ctx.instance = e.editor.events;
      });
    };

    const renderEditor = (id: string, filename: string, props: Partial<CodeEditorProps> = {}) => {
      props = { ...e.ctx.props, ...props };
      return (
        <CodeEditorView
          {...props}
          instance={{ bus, id }}
          filename={filename}
          onReady={(e) => handleReady(filename, e)}
        />
      );
    };

    const editor1 = renderEditor('one', FILENAME.one, { focusOnLoad: true });
    const editor2 = renderEditor('two', FILENAME.two);

    const render = (el: JSX.Element, label: string, filename: string) => {
      e.render(el, {
        label: {
          topLeft: label,
          bottomRight: `filename: ${filename}`,
        },
      });
    };

    render(editor1, '<CodeEditor>: one', FILENAME.one);
    render(editor2, '<CodeEditor>: two', FILENAME.two);
  });

export default actions;
