import React from 'react';
import { DevActions, toObject } from 'sys.ui.dev';

import { TestNetwork, WebRuntime, t, rx } from '../../web.test';
import { Sample, SampleProps } from './DEV.Sample';
import { SimpleDoc } from './DEV.types';
import { CrdtBus } from '../../../';

const DEFAULT = {
  DOC: 'myDoc-id',
};

type Ctx = {
  bus: t.EventBus;
  netbus?: t.NetworkBus;
  props: SampleProps;
  total: number;
  debounce: number;
};

export async function startMockNetwork(args: { total: number; debounce: number }) {
  const { total, debounce } = args;
  const initial: SimpleDoc = { count: 0 };
  const mesh = await TestNetwork<SimpleDoc>({ total, initial, debounce });
  const docs = await mesh.docs(DEFAULT.DOC);
  return { docs };
}

async function getNetbus(bus: t.EventBus<any>) {
  bus = toObject(bus) as t.EventBus;
  const events = WebRuntime.Bus.Events({ bus });
  const res = await events.netbus.get();
  events.dispose();
  return res.netbus;
}

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const ctx: Ctx = {
      bus,
      props: {},
      total: 3,
      debounce: 300,
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const netbus = await getNetbus(bus);
    ctx.bus = bus;
    ctx.netbus = netbus;

    const { total, debounce } = ctx;
    const docs = (await startMockNetwork({ total, debounce })).docs;
    ctx.props.docs = docs;

    console.group('🌳 CRDT/INIT');
    console.log('bus', bus);
    console.log('netbus', netbus);
    console.log('docs', docs);
    console.groupEnd();
  })

  .items((e) => {
    e.title('Dev');

    // TEMP 🐷
    e.button('tmp: fire (bus)', async (e) => {
      const bus = e.ctx.bus;
      bus.fire({ type: 'CRDT/foo', payload: { msg: 'derp' } });
    });

    e.button('tmp: netbus', async (e) => {
      const netbus = await getNetbus(e.ctx.bus);

      // TEMP 🐷
      console.group('🌳 netbus res (CRDT)');
      console.log('netbus', netbus);
      console.log('bus', toObject(e.ctx.bus));
      console.groupEnd();
    });

    e.hr();

    e.button('start network: mock (in-memory)', async (e) => {
      const { total, debounce } = e.ctx;
      e.ctx.props.docs = (await startMockNetwork({ total, debounce })).docs;
      // e.ctx.netbus = undefined;
    });

    e.button('start network: remote', async (e) => {
      const { bus, netbus } = e.ctx;
      e.ctx.props.docs = [];

      if (!netbus) {
        e.button.description = 'WARNING: netbus not available in environment';
        return;
      }

      // const bus = e.ctx.bus;
      const ctrl = CrdtBus.Controller({
        bus: toObject(bus) as t.EventBus,
        sync: {
          // netbus,
          netbus: toObject(netbus) as t.NetworkBus,
        },
      });
      const doc = await ctrl.events.doc({ id: DEFAULT.DOC, initial: { count: 0 } });
      e.ctx.props.docs = [doc];
    });

    e.hr();
  })

  .subject((e) => {
    const docs = e.ctx.props.docs ?? [];

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.1,
        label: {
          topLeft: `Peers`,
          bottomRight: `sync debounce: ${e.ctx.debounce}ms`,
          // bottomLeft: `netbus: ${hasNetbus ? 'online' : 'in-memory'}`,
        },
      },
    });

    console.log('docs', docs);

    if (docs.length > 0) {
      e.render(<Sample {...e.ctx.props} />);
    }
  });

export default actions;
