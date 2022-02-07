import React from 'react';
import { DevActions, lorem, ObjectView } from 'sys.ui.dev';

import { LocalPeerCard, LocalPeerCardConstants, LocalPeerCardProps } from '..';
import { PeerNetwork } from '../../..';
import { t } from '../../common';
import * as k from '../types';

type Ctx = {
  network?: t.PeerNetwork;
  props: LocalPeerCardProps;
  title?: string | null;
  debug: {
    cardPadding?: t.CssEdgesInput;
    showAsCard: boolean;
  };
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
      debug: {
        cardPadding: undefined,
        showAsCard: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const signal = 'rtc.cellfs.com';
    const network = (ctx.network = await PeerNetwork.start({ bus, signal }));
    const { self } = network.netbus;

    const status = (await network.events.peer.status(self).get()).peer;
    if (status) {
      ctx.props = { bus, self, showAsCard: true };
    }
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('title')
        .initial('default')
        .view('buttons')
        .items(['default', 'custom', 'custom (long)', 'none (null)'])
        .pipe((e) => {
          const current = e.select.current[0]?.value; // NB: always first.

          if (current === 'default') e.ctx.title = undefined;
          if (current === 'custom') e.ctx.title = 'My Title';
          if (current === 'custom (long)') e.ctx.title = lorem.toString();
          if (current === 'none (null)') e.ctx.title = null;
        });
    });

    e.hr(1, 0.1);

    e.select((config) =>
      config
        .title('fields:')
        .items(LocalPeerCardConstants.FIELDS)
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

    const updateShowAsCard = (ctx: Ctx) => {
      const props = ctx.props;
      const showAsCard = ctx.debug.showAsCard;

      if (showAsCard === false) {
        props.showAsCard = showAsCard;
        return;
      }

      const padding = ctx.debug.cardPadding;
      props.showAsCard = padding === undefined ? true : { padding };
    };

    e.select((config) => {
      config
        .view('buttons')
        .title('asCard { padding }')
        .items(['undefined', 'tight', 'loose'])
        .initial('undefined')
        .pipe((e) => {
          if (e.changing) {
            const value = e.changing?.next[0].value;
            let padding: t.CssEdgesInput | undefined = undefined;
            if (value === 'tight') padding = [10, 15];
            if (value === 'loose') padding = 40;
            e.ctx.debug.cardPadding = padding;
          }
          updateShowAsCard(e.ctx);
        });
    });

    e.boolean('asCard', (e) => {
      if (e.changing) e.ctx.debug.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.debug.showAsCard;
      updateShowAsCard(e.ctx);
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
