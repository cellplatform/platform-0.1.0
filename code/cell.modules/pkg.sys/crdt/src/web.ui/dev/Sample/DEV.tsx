import React from 'react';
import { DevActions, toObject } from 'sys.ui.dev';

import { TestNetwork, WebRuntime, t, rx, time } from '../../../web.test';
import { Sample, SampleProps } from './DEV.Sample';
import { CrdtBus } from '../../../';
import { SimpleDoc } from './DEV.types';

const DEFAULT = {
  DOC: 'myDoc-id',
};

type Ctx = {
  bus: t.EventBus;
  netbus?: t.NetworkBus;
  props: SampleProps;
};

export async function startMockNetwork(total: number) {
  const initial: SimpleDoc = { count: 0 };
  const mesh = await TestNetwork<SimpleDoc>({ total, initial, debounce: 300 });
  const docs = await mesh.docs(DEFAULT.DOC);
  return { docs };
}

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const ctx: Ctx = { bus, props: {} };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    const env = WebRuntime.Bus.Events({ bus });
    const netbus = (await env.netbus.get({})).netbus;
    const docs = (await startMockNetwork(3)).docs;

    ctx.bus = bus;
    ctx.netbus = netbus;
    ctx.props.docs = docs;
  })

  .items((e) => {
    e.title('Dev');

    e.button('tmp: netbus', async (e) => {
      // TEMP 🐷
      // console.log('window.netbus', (window as any).netbus);
      console.log('e.ctx.netbus', e.ctx.netbus);
    });

    e.hr(1, 0.1);

    e.button('start network: mock (in-memory)', async (e) => {
      e.ctx.props.docs = (await startMockNetwork(3)).docs;
    });

    e.button('start network: remote', async (e) => {
      // e.ctx.props.docs = [];
      // if (!netbus) {
      //   e.button.description = 'WARNING: netbus not available in environment';
      //   return;
      // }
      // const bus = e.ctx.bus;
      // const ctrl = CrdtBus.Controller({ bus, sync: { netbus } });
      // const doc = await ctrl.events.doc({ id: DEFAULT.DOC, initial: { count: 0 } });
      // e.ctx.setDocs([doc]);
    });

    e.hr();
  })

  .subject((e) => {
    const netbus = e.ctx.netbus;
    const docs = e.ctx.props.docs ?? [];

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { topRight: `netbus: ${Boolean(netbus)}` },
        cropmarks: -0.1,
      },
    });

    if (docs.length > 0) {
      e.render(<Sample {...e.ctx.props} />);
    }
  });

export default actions;
