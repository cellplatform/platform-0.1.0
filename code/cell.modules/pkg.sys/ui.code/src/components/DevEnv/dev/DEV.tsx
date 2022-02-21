import React from 'react';
import { debounceTime } from 'rxjs/operators';
import { DevActions, TestSuiteRunResponse } from 'sys.ui.dev';

import { DevEnv, DevEnvProps } from '..';
import { k, rx, t, Filesystem } from '../common';
import { evalCode } from './DEV.eval';

type Ctx = {
  bus: t.EventBus;
  props: DevEnvProps;
  editor?: t.CodeEditorInstanceEvents;
  onReady: k.DevEnvReadyHandler;
  runTests(code?: string): Promise<TestSuiteRunResponse | undefined>;
};

const LANGUAGES: t.CodeEditorLanguage[] = ['typescript', 'javascript'];

const SAMPLE = `
describe('hello', (e) => {
  e.it('does something', () => {
    console.log('foobar')
  })
})
`.substring(1);

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui.code.DevEnv')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    let editor: t.CodeEditorInstanceEvents | undefined;

    const storage = Filesystem.IndexedDb.create({ bus, id: 'fs.dev.code' });

    const path = 'dev/DevEnv/code.js';
    const getFs = async () => (await storage).fs;
    const getEditorCode = () => ctx.editor?.text.get.fire();
    const getSavedCode = async () => new TextDecoder().decode(await (await getFs()).read(path));

    const onChanged = async () => {
      const fs = await getFs();
      const code = await getEditorCode();
      await fs.write(path, code);
      ctx.runTests(code);
    };

    const ctx: Ctx = {
      bus,
      props: { bus, language: 'javascript', focusOnLoad: true },

      get editor() {
        return editor;
      },

      async onReady(args) {
        const code = (await getSavedCode()) || SAMPLE;
        editor = args.editor;
        editor.text.set(code);
        editor.text.changed$.pipe(debounceTime(500)).subscribe(onChanged);
        ctx.runTests();
      },

      async runTests(code?: string) {
        const update = (results?: TestSuiteRunResponse) => {
          e.change.ctx((ctx) => (ctx.props.results = results));
        };

        try {
          code = code ?? (await getEditorCode());
          const results = code ? await evalCode(code) : undefined;
          update(results);
          return results;
        } catch (error) {
          console.error('error', error);
          update(undefined);
          return undefined;
        }
      },
    };

    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) =>
      config
        .title('language:')
        .items(LANGUAGES)
        .initial(config.ctx.props.language)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.language = e.changing.next[0].value;
        }),
    );

    e.hr(1, 0.1);
    e.button('code: sample', (e) => e.ctx.editor?.text.set(SAMPLE));
    e.button('code: (clear)', (e) => e.ctx.editor?.text.set(null));
    e.hr(1, 0.1);
    e.button('format (prettier)', (e) => e.ctx.editor?.action.fire('editor.action.formatDocument'));

    e.hr();
  })

  .items((e) => {
    e.title('Eval');
    e.button('run', async (e) => await e.ctx.runTests());
    e.button('clear', (e) => (e.ctx.props.results = undefined));
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { topLeft: '<DevEnv>', topRight: `language: ${e.ctx.props.language}` },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevEnv {...e.ctx.props} style={{ flex: 1 }} onReady={e.ctx.onReady} />);
  });

export default actions;
