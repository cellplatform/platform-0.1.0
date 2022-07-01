import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { TestNetwork, TestFilesystem } from '../../test';
import { Sample, SampleProps } from './DEV.Sample';
import { SimpleDoc } from './DEV.types';

import { t, rx, COLORS, css, Color, Filesystem } from './common';

const DEFAULT = {
  DOC: 'myDoc',
};

type Ctx = {
  bus: t.EventBus;
  filesystem: {
    fs: t.Fs;
    instance: t.FsViewInstance;
    events: t.SysFsEvents;
    ready: () => Promise<any>;
  };
  props: SampleProps;
  total: number;
  debounce: number;
};

export async function startMockNetwork(args: { total: number; debounce: number }) {
  const { total, debounce } = args;
  const initial: SimpleDoc = { count: 0 };
  const network = await TestNetwork<SimpleDoc>({ total, initial, debounce });
  const docs = await network.docs(DEFAULT.DOC);
  return { docs, network };
}

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const { fs, ready, instance, events } = TestFilesystem.init({ bus });

    const ctx: Ctx = {
      bus,
      filesystem: { fs, ready, instance, events },
      props: { instance },
      total: 3,
      debounce: 300,
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    const { total, debounce } = ctx;
    const mock = await startMockNetwork({ total, debounce });
    const docs = mock.docs;
    ctx.props.docs = docs;

    console.group('🌳 CRDT/INIT');
    console.log('bus', ctx.bus);
    console.log('docs', docs);
    console.groupEnd();

    await ctx.filesystem.ready();
  })

  .items((e) => {
    /**
     * TODO 🐷
     */
    e.title('[TODO] 🐷');

    e.markdown(`
- distribute sync protocol through [netbus]
    `);
    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    // TEMP 🐷
    e.button('tmp: fire (bus)', async (e) => {
      const bus = e.ctx.bus;
      bus.fire({ type: 'CRDT/foo', payload: { msg: 'derp' } });
    });

    e.hr();

    e.button('start network: mock (in-memory)', async (e) => {
      const { total, debounce } = e.ctx;
      const network = await startMockNetwork({ total, debounce });
      e.ctx.props.docs = network.docs;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Filesystem');

    e.component((e) => {
      const instance = e.ctx.props.instance;
      const id = `${instance.id}.dev`;
      return <Filesystem.PathList.Dev instance={{ ...instance, id }} />;
    });

    e.button('delete all', async (e) => {
      await TestFilesystem.clear(e.ctx.filesystem.fs, { all: true });
    });

    e.hr();
  })

  .subject((e) => {
    const docs = e.ctx.props.docs ?? [];

    e.settings({
      actions: { width: 320 },
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.1,
        label: {
          bottomLeft: `Peers | ${rx.bus.instance(e.ctx.bus)}`,
          bottomRight: `sync debounce: ${e.ctx.debounce}ms`,
        },
      },
    });

    if (docs.length > 0) {
      e.render(<Sample {...e.ctx.props} />);
    }
  });

export default actions;
