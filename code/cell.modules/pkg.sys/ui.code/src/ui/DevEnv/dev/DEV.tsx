import React from 'react';
import { debounceTime } from 'rxjs/operators';
import { DevActions, LOREM, TestSuiteRunResponse, TestFilesystem } from '../../../test';
import { Vercel } from 'vendor.cloud.vercel/lib/web';
import { ModuleInfo as VercelModuleInfo } from 'vendor.cloud.vercel/lib/web/ui/ModuleInfo';

import { DevEnv, DevEnvProps } from '..';
import { CodeEditor } from '../../../api';
import { Http, rx, slug, t, Filesystem } from '../common';
import { evalCode } from './DEV.evaluate';

type Ctx = {
  instance: t.FsViewInstance;
  bus: t.EventBus<any>;
  token: string;
  fs: t.Fs;
  props: DevEnvProps;
  editor?: t.CodeEditorInstanceEvents;
  onReady: t.DevEnvReadyHandler;
  runTests(code?: string): Promise<TestSuiteRunResponse | undefined>;

  debug: { fs: { selection?: t.ListSelectionState } };
  deployment: { response?: t.VercelHttpDeployResponse; domain: string };
};

const SAMPLE_TEST = `
describe('hello', (e) => {
  e.it('does something', () => {
    console.log('foobar')
  })
})
`.substring(1);

const SAMPLE_MD = `
# Title

- One
- Two
- Three

---

${LOREM}

`.substring(1);

const Util = {
  token: {
    key: 'tmp.dev.token.vercel', // TEMP 🐷 HACK: this is not high enough security long-term to store private-keys.
    read() {
      return localStorage.getItem(Util.token.key) ?? '';
    },
    write(ctx: Ctx, token: string) {
      localStorage.setItem(Util.token.key, token);
      ctx.token = token;
      return token;
    },
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.DevEnv')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    let editor: t.CodeEditorInstanceEvents | undefined;

    const path = 'index.json';
    const { fs, instance } = TestFilesystem.init();

    const getEditorCode = () => ctx.editor?.text.get.fire();
    const getSavedCode = async () => new TextDecoder().decode(await fs.read(path));

    const handleChanged = async () => {
      const text = await getEditorCode();
      ctx.runTests(text);
      await fs.write(path, text);
      e.change.ctx((ctx) => (ctx.props.text = text));
    };

    const ctx: Ctx = {
      instance,
      bus,
      fs,
      token: Util.token.read(),
      props: {
        instance: { bus, id: `foo.${slug()}` },
        focusOnLoad: true,

        // language: 'typescript',
        // language: 'javascript',

        // language: 'markdown',
        // text: SAMPLE_MD,

        language: 'json',
        // text: '{  ` "count": 123 }\n',
        text: `
{
  ref: "route configuration (vercel.json)",
  refUrl: "https://vercel.com/docs/project-configuration"
}        
        `,
      },

      get editor() {
        return editor;
      },

      async onReady(args) {
        // const text = (await getSavedCode()) || SAMPLE_TEST;
        const text = await getSavedCode();

        console.log('saved code', text);

        editor = args.editor;
        editor.text.set(text);
        editor.text.changed$.pipe(debounceTime(500)).subscribe(handleChanged);
        ctx.runTests();
      },

      async runTests(code?: string) {
        const update = (results?: TestSuiteRunResponse) => {
          e.change.ctx((ctx) => (ctx.props.results = results));
          return results;
        };

        const language = e.current?.props.language;
        const isCode = language === 'javascript' || language === 'typescript';

        if (!isCode) {
          return update(undefined);
        }

        try {
          code = code ?? (await getEditorCode());
          const results = code ? await evalCode(code) : undefined;
          return update(results);
        } catch (error) {
          console.error('error', error);
          return update(undefined);
        }
      },
      debug: { fs: {} },
      deployment: { domain: 'tmp.ro.db.team' },
    };

    return ctx;
  })

  .items((e) => {
    e.title('Dev');

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

    e.hr(1, 0.1);
    e.button('sample: unit-test (js)', (e) => e.ctx.editor?.text.set(SAMPLE_TEST));
    e.button('sample: markdown', (e) => e.ctx.editor?.text.set(SAMPLE_MD));

    e.hr(1, 0.1);
    e.button('clear', (e) => e.ctx.editor?.text.set(null));
    e.button('format (prettier)', (e) => e.ctx.editor?.action.fire('editor.action.formatDocument'));

    e.hr();
  })

  .items((e) => {
    e.title('Evaluate');
    e.button('run', (e) => e.ctx.runTests());
    e.button('clear', (e) => (e.ctx.props.results = undefined));
    e.hr();
  })

  .items((e) => {
    e.title('Filesystem ("Package")');

    e.component((e) => {
      const change = e.change;
      return (
        <Filesystem.PathList.Stateful
          style={{ Margin: [5, 10, 20, 10], height: 150 }}
          instance={e.ctx.instance}
          scrollable={true}
          droppable={true}
          selectable={true}
          onStateChanged={(e) => {
            if (e.kind === 'Selection') {
              change.ctx((ctx) => (ctx.debug.fs.selection = e.to.selection));
            }

            console.group('🌳 ');
            console.log('<FsPathList> State Change');
            console.log('e', e);
            console.groupEnd();
          }}
        />
      );
    });

    e.hr(1, 0.1);

    e.button('delete selected', async (e) => {
      const selection = e.ctx.debug.fs.selection;
      if (selection) {
        const fs = e.ctx.fs;
        const files = (await fs.manifest()).files.filter((_, i) => selection.indexes.includes(i));
        await Promise.all(files.map((file) => fs.delete(file.path)));
      }
    });

    e.button('delete all (clear)', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

    e.hr();
  })

  .items((e) => {
    e.title('Deploy State');

    e.textbox((config) =>
      config.placeholder('set token').pipe((e) => {
        if (e.changing?.action === 'invoke') {
          const next = e.changing.next || '';
          Util.token.write(e.ctx, next);
        }
      }),
    );

    e.component((e) => {
      const token = e.ctx.token;
      const domain = e.ctx.deployment.domain;
      return (
        <VercelModuleInfo
          fields={['Module', 'Token.API.Hidden', 'Deploy.Domain']}
          data={{ token, deploy: { domain } }}
          style={{ Margin: [30, 45, 30, 38] }}
        />
      );
    });

    e.hr(1, 0.1);

    e.textbox((config) =>
      config
        .placeholder('set domain alias')
        // .initial(config.ctx.deployment.domain)
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            e.ctx.deployment.domain = e.changing.next || '';
          }
        }),
    );

    /**
     * TODO 🐷 Temp
     * - move within Vercel vendor module itself.
     */
    e.button('push (to "cloud")', async (e) => {
      const token = e.ctx.token;
      const Authorization = `Bearer ${token}`;
      const headers = { Authorization };
      const http = Http.create({ headers });
      const fs = e.ctx.fs;

      const alias = e.ctx.deployment.domain;

      /**
       * CONFIGURE
       */
      const deployment = Vercel.Deploy({
        http,
        fs,
        token,
        team: 'tdb',
        project: 'tdb-tmp-deploy',
      });

      console.group('🌳 Deployment');

      const info = await deployment.info();
      console.log('info', info);
      console.log('info.size.toString()', info.files.size.toString());
      console.log('-------------------------------------------');

      /**
       * COMMIT (DEPLOY)
       */
      const target = alias ? 'production' : 'staging';
      const res = await deployment.commit(
        { target, regions: ['sfo1'], alias },
        { ensureProject: true },
      );

      /**
       * OUTPUT
       */
      const { status } = res;
      const { name, urls } = res.deployment;

      console.log('res', res);

      console.log('-------------------------------------------');
      console.log(status);
      console.log(name);
      console.log(' • ', urls.inspect);
      urls.public.forEach((url) => console.log(' • ', url));
      if (res.error) console.log('error', res.error);
      console.log();

      e.ctx.deployment.response = res;
    });

    e.hr();

    e.component((e) => {
      const response = e.ctx.deployment.response;
      if (!response) return null;
      return (
        <VercelModuleInfo
          fields={['Deploy.Response']}
          data={{ deploy: { response } }}
          style={{ Margin: [10, 40, 10, 40] }}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<DevEnv>',
          topRight: `language: ${e.ctx.props.language}`,
        },
        position: [100, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevEnv {...e.ctx.props} style={{ flex: 1 }} onReady={e.ctx.onReady} />);
  });

export default actions;
