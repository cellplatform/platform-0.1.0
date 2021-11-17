import React from 'react';
import { DevActions, ObjectView, Test, TestSuiteRunResponse } from 'sys.ui.dev';
import { t, rx, Filesystem } from '../common';

import { DevFsSample } from './DEV.Sample';

const path = 'myfile.txt';

type FilesystemId = string;

type Ctx = {
  bus: t.EventBus<any>;
  id: FilesystemId;
  debug: { data?: any; tests?: TestSuiteRunResponse };
  filestore(): Promise<t.SysFsEvents>;
  runTests(): Promise<TestSuiteRunResponse>;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('FsBus.IndexedDb')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const id = 'fs.foo';

    const runTests = async () => {
      const tests = await Test.bundle('FsDriver: IndexedDb', [
        import('../../../web.FsBus.IndexedDb/Filesystem.TEST'),
      ]);
      return tests.run();
    };

    const filestore = async () => {
      const { store } = await Filesystem.IndexedDb.create({ bus, id });
      return store.events;
    };

    const ctx: Ctx = {
      bus,
      id,
      debug: {},
      runTests,
      filestore,
    };
    return ctx;
  })

  .items((e) => {
    e.title('IndexedDB (Filesystem)');

    e.button('tests: run', async (e) => {
      const results = await e.ctx.runTests();
      e.ctx.debug.tests = results;
    });

    e.button('tests: clear', (e) => (e.ctx.debug.tests = undefined));

    e.hr();

    e.button('write', async (e) => {
      const store = await e.ctx.filestore();
      const fs = store.fs();
      const data = new TextEncoder().encode('foobar');
      const res = await fs.write(path, data);
      e.ctx.debug.data = res;
    });

    e.button('read', async (e) => {
      const store = await e.ctx.filestore();
      const fs = store.fs();
      const res = await fs.read(path);
      e.ctx.debug.data = res;
    });

    e.button('delete', async (e) => {
      const store = await e.ctx.filestore();
      const fs = store.fs();
      const res = await fs.delete(path);
      e.ctx.debug.data = res;
    });

    e.hr();

    e.component((e) => {
      const { data } = e.ctx.debug;
      if (!data) return null;
      return <ObjectView data={data} style={{ MarginX: 20 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: 'FileSystem (Bus)',
          topRight: `IndexedDB: "${e.ctx.id}"`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const debug = e.ctx.debug;

    if (debug.tests) {
      const el = (
        <Test.View.Results data={debug.tests} style={{ Scroll: true, padding: 30, flex: 1 }} />
      );
      e.render(el);
    }

    if (!debug.tests) {
      e.render(<DevFsSample bus={e.ctx.bus} />);
    }
  });

export default actions;
