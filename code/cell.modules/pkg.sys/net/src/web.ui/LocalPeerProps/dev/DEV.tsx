import React from 'react';
import { toObject, DevActions } from 'sys.ui.dev';
import { LocalPeerProps, LocalPeerPropsProps } from '..';
import { t, cuid, rx } from '../../common';
import { PeerNetwork } from '../../..';

type Ctx = {
  network?: t.PeerNetwork;
  props?: LocalPeerPropsProps;
  flags: {
    newConnections: boolean;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.LocalPeerProps')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      flags: { newConnections: true },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const signal = 'rtc.cellfs.com';
    const network = (ctx.network = await PeerNetwork.start({ bus, signal }));
    const { self } = network;

    const status = (await network.events.peer.status(self).get()).peer;
    if (status) {
      ctx.props = { bus, self: { id: self, status } };
    }
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('newConnections', (e) => {
      if (e.changing) e.ctx.flags.newConnections = e.changing.next;
      e.boolean.current = e.ctx.flags.newConnections;
    });

    e.hr();
  })

  .subject((e) => {
    const { props, flags } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<LocalPeerProps>',
        // position: [150, 80],
        // border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });

    e.render(props && <LocalPeerProps {...props} newConnections={flags.newConnections} />);
  });

export default actions;
