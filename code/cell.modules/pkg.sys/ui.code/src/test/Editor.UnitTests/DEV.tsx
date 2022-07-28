import React from 'react';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

import { DevActions, ObjectView, t, Test, TestFilesystem } from '..';
import { CodeEditor } from '../../api';
import { rx } from '../../common';
import { CodeEditor as CodeEditorView, CodeEditorProps } from '../../ui/CodeEditor';
import Tests from './TESTS';

type Ctx = {
  ready: boolean;
  props: CodeEditorProps;

  global?: {
    filesystem: { fs: t.Fs; instance: t.FsViewInstance };
    events: t.CodeEditorEvents;
  };

  run(): Promise<TestSuiteRunResponse>;
  results?: TestSuiteRunResponse;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('UnitTests.Editor')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      ready: false,
      props: {
        instance: { bus: rx.bus() }, // Placeholder DUMMY.
        language: 'typescript',
      },

      async run() {
        const bus = e.current?.props.instance.bus;
        if (!bus) throw new Error('Not ready');

        const ctx = { bus };
        const results = await Tests.run({ ctx });

        e.change.ctx((ctx) => (ctx.results = results));
        return results;
      },
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
    await ctx.run();

    e.redraw();
  })

  .items((e) => {
    e.title('Dev');

    e.button('run tests', async (e) => await e.ctx.run());

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'ctx'}
          data={e.ctx}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const bus = e.ctx.props.instance?.bus;
    const busid = bus ? rx.bus.instance(bus) : 'bus:<none>';

    e.settings({
      actions: { width: 300 },
      host: { background: -0.04 },
    });

    if (!e.ctx.ready) return;

    const renderEditor = (id: string, props: Partial<CodeEditorProps> = {}) => {
      props = { ...e.ctx.props, ...props };
      const el = <CodeEditorView {...props} instance={{ bus, id }} />;
      e.render(el, {
        label: `instance: "${id}"`,
        background: 1,
        border: -0.1,
        cropmarks: -0.2,
        width: 700,
        height: 130,
      });
    };

    renderEditor('one', { filename: 'one.ts' });
    renderEditor('two');

    e.render(
      <Test.View.Results data={e.ctx.results} style={{ flex: 1, padding: 20 }} scroll={true} />,
      {
        label: {
          topLeft: 'Unit Tests',
          bottomRight: `${busid}`,
        },
        width: 700,
        height: 300,
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    );
  });

export default actions;
