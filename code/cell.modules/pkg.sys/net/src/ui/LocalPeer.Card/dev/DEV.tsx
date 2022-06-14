import React from 'react';

import { LocalPeerCard, LocalPeerCardProps } from '..';
import { PeerNetwork } from '../../..';
import { DevActions, Lorem, ObjectView, TEST } from '../../../test';
import { t } from '../../common';
import * as k from '../types';

type Ctx = {
  network?: t.PeerNetwork;
  props: LocalPeerCardProps;
  title?: string | null;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.LocalPeerCard')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {} as any, // Hack 🐷
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const signal = TEST.SIGNAL;
    const { network } = await PeerNetwork.start({ bus, signal });
    const { self } = network.netbus;
    ctx.network = network;

    const status = (await network.events.peer.status(self).get()).peer;
    if (status) {
      ctx.props = { bus, self, showAsCard: true };
    }
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      const items = ['default', 'custom', 'custom (long)', 'none (null)'];
      config
        .view('buttons')
        .initial(items[0])
        .items(items.map((value) => ({ label: `title: ${value}`, value })))
        .pipe((e) => {
          const current = e.select.current[0]?.value;

          if (current === 'default') e.ctx.title = undefined;
          if (current === 'custom') e.ctx.title = 'My Title';
          if (current === 'custom (long)') e.ctx.title = Lorem.toString();
          if (current === 'none (null)') e.ctx.title = null;
        });
    });

    e.hr(1, 0.1);

    e.select((config) =>
      config
        .title('fields:')
        .items(LocalPeerCard.FIELDS)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing && e.ctx.props) {
            const next = e.changing.next.map(({ value }) => value) as k.LocalPeerCardFields[];
            e.ctx.props.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();
    e.title('Debug');

    e.boolean('asCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
    });

    e.hr();

    e.component((e) => {
      return <ObjectView name={'props'} data={e.ctx.props} style={{ MarginX: 15 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    const { props } = e.ctx;

    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    if (props.bus) {
      e.render(<LocalPeerCard {...props} title={e.ctx.title} style={{ maxWidth: 400 }} />);
    }
  });

export default actions;
