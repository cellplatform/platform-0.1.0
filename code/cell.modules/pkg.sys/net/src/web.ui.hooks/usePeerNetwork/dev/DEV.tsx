import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';

import { t, PeerNetwork, cuid, rx, WebRuntime } from './DEV.common';

type Ctx = {
  self: t.PeerId;
  props?: DevSampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('usePeerNetwork')
  .context((e) => {
    if (e.prev) return e.prev;
    const self = cuid();
    const ctx: Ctx = { self };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    const self = e.ctx.self;

    PeerNetwork.Controller({ bus });
    const netbus = PeerNetwork.Netbus({ bus, self });
    const runtime = WebRuntime.Bus.Controller({ bus, netbus });

    const events = {
      peer: PeerNetwork.PeerEvents(bus),
      group: PeerNetwork.GroupEvents(netbus),
      runtime: runtime.events,
    };

    // console.log('c', c);
    console.group('🌳 INIT - usePeerNetwork');
    console.log('self', self);
    console.log('netbus', netbus);
    console.log('INIT', e);
    console.groupEnd();

    ctx.props = { self, bus };

    const signal = 'rtc.cellfs.com';

    await events.peer.create(signal, self);
  })

  .items((e) => {
    e.title('Dev');

    e.button('tmp: netbus', async (e) => {
      const bus = e.ctx.props?.bus;
      if (!bus) return;

      const self = e.ctx.self;
      const events = WebRuntime.Bus.Events({ bus });
      const res = await events.netbus.get();
      console.log('res', res);
      events.dispose();
    });

    e.button('tmp', async (e) => {
      const bus = e.ctx.props?.bus;
      if (!bus) return;

      const self = e.ctx.self;
      const events = PeerNetwork.PeerEvents(bus);

      const res = await events.status(self).get();

      console.log('res', res);

      events.dispose();

      //
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: 'usePeerNetwork (hook)',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(e.ctx.props && <DevSample {...e.ctx.props} />);
  });

export default actions;
