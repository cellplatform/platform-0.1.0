import React from 'react';
import { toObject, DevActions, lorem } from 'sys.ui.dev';
import { LocalPeerProps, LocalPeerPropsProps } from '..';
import { t, cuid, rx } from '../../common';
import { PeerNetwork } from '../../..';

type Ctx = {
  network?: t.PeerNetwork;
  props?: LocalPeerPropsProps;
  newConnections: boolean;
  title?: string | null;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.LocalPeerProps')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      newConnections: true,
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
    e.title('LocalPeerProps');

    e.select((config) => {
      config
        .title('title')
        .initial('default')
        .view('buttons')
        .items(['default', 'custom', 'custom (long)', 'none (null)'])
        .pipe((e) => {
          const current = e.select.current[0].value; // NB: always first.

          if (current === 'default') e.ctx.title = undefined;
          if (current === 'custom') e.ctx.title = 'My Title';
          if (current === 'custom (long)') e.ctx.title = lorem.toString();
          if (current === 'none (null)') e.ctx.title = null;
        });
    });

    e.boolean('newConnections', (e) => {
      if (e.changing) e.ctx.newConnections = e.changing.next;
      e.boolean.current = e.ctx.newConnections;
    });

    e.hr();
  })

  .subject((e) => {
    const { props } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    if (props) {
      e.render(
        <LocalPeerProps {...props} newConnections={e.ctx.newConnections} title={e.ctx.title} />,
      );
    }
  });

export default actions;
