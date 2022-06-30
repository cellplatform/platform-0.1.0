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
      const instance = e.ctx.filesystem.instance;
      const styles = {
        base: css({
          Margin: [5, 10, 20, 10],
        }),
        outer: css({
          height: 150,
          borderRadius: 4,
          backgroundColor: Color.alpha(COLORS.DARK, 0.02),
          border: `solid 1px ${Color.format(-0.06)}`,
          display: 'flex',
        }),
        footer: css({
          fontFamily: 'monospace',
          color: Color.alpha(COLORS.DARK, 0.4),
          fontSize: 10,
          fontWeight: 500,
          Flex: 'x-spaceBetween-center',
          marginTop: 3,
          PaddingX: 5,
        }),
      };
      return (
        <div {...styles.base}>
          <div {...styles.outer}>
            <Filesystem.PathList.Stateful
              style={{ flex: 1 }}
              instance={instance}
              scrollable={true}
              droppable={true}
              selectable={true}
            />
          </div>
          <div {...styles.footer}>
            <div>{`${rx.bus.instance(instance.bus)}/id:${instance.id}`}</div>
            <div>{`${instance.fs}`}</div>
          </div>
        </div>
      );
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
