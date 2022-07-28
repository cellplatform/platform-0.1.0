import React from 'react';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

import { DevActions, ObjectView, t, Test, TestFilesystem } from '..';
import { CodeEditor } from '../../api';
import { rx, Filesystem } from '../../common';
import { CodeEditor as CodeEditorView, CodeEditorProps } from '../../ui/CodeEditor';
import Tests from './TESTS';
import { ModuleInfo } from '../../ui/ModuleInfo';

type Ctx = {
  ready: boolean;
  props: CodeEditorProps;
  output: { status?: any };

  global?: {
    filesystem: { fs: t.Fs; instance: t.FsViewInstance };
    events: t.CodeEditorEvents;
  };

  results?: TestSuiteRunResponse;
  runTests(): Promise<TestSuiteRunResponse>;
  updateStatus(): Promise<void>;
};

const Util = {
  getOrThrow(ctx?: Ctx) {
    const props = ctx?.props;
    const global = ctx?.global;
    if (!props || !global) throw new Error('Not ready');

    const bus = props.instance.bus;
    const { events, filesystem } = global;
    return { bus, events, filesystem };
  },
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
      output: {},
      props: {
        instance: { bus: rx.bus() }, // Placeholder DUMMY.
        language: 'typescript',
      },

      async runTests() {
        const { bus } = Util.getOrThrow(e.current);
        const ctx = { bus };
        const results = await Tests.run({ ctx });

        e.change.ctx((ctx) => (ctx.results = results));
        return results;
      },

      async updateStatus() {
        const { events } = Util.getOrThrow(e.current);
        const status = await events?.status.get();
        e.change.ctx((ctx) => (ctx.output.status = status));
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

    events.status.updated$.subscribe((e) => ctx.updateStatus());

    ctx.ready = true;
    await ctx.runTests();

    e.redraw();
  })

  .items((e) => {
    e.title('Dev');

    e.button('run tests', async (e) => await e.ctx.runTests());

    e.button('get status (global)', async (e) => {
      await e.ctx.updateStatus();
    });

    e.hr();
  })

  .items((e) => {
    e.component((e) => {
      return <ModuleInfo style={{ MarginX: 15 }} />;
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
        />
      );
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'ctx'}
          data={e.ctx}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandLevel={0}
        />
      );
    });

    e.hr(1, 0.1);

    e.component((e) => {
      const name = 'status';
      const data = e.ctx.output.status;
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

    e.hr();
  })

  .subject((e) => {
    const bus = e.ctx.props.instance?.bus;
    const busid = bus ? rx.bus.instance(bus) : 'bus:<none>';

    e.settings({
      actions: { width: 380 },
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

    renderEditor('dev.unit-test-1', { filename: 'one.ts' });
    renderEditor('dev.unit-test-2');

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
