import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { NetbusCard, NetbusCardProps } from '..';
import { t } from '../../common';
import { PeerNetwork } from '../../../web.PeerNetwork';

type Ctx = {
  props: NetbusCardProps;
  debug: {
    cardPadding?: t.CssEdgesInput;
    showAsCard: boolean;
  };
};

const SIGNAL_SERVER = 'rtc.cellfs.com';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.NetbusCard')
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

    const signal = SIGNAL_SERVER;
    const network = await PeerNetwork.start({ bus, signal });
    const { netbus } = network;

    ctx.props.netbus = netbus;
  })

  .items((e) => {
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

    e.boolean('asCard', (e) => {
      if (e.changing) e.ctx.debug.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.debug.showAsCard;
      updateShowAsCard(e.ctx);
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('asCard { padding }')
        .items(['tight', 'generous', '[undefined]'])
        .initial('[undefined]')
        .pipe((e) => {
          if (e.changing) {
            const value = e.changing?.next[0].value;
            let padding: t.CssEdgesInput | undefined = undefined;
            if (value === 'tight') padding = [10, 15];
            if (value === 'generous') padding = 40;
            e.ctx.debug.cardPadding = padding;
          }
          updateShowAsCard(e.ctx);
        });
    });

    e.hr();

    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<NetbusCard>',
        cropmarks: -0.2,
      },
    });
    e.render(<NetbusCard {...e.ctx.props} />);
  });

export default actions;
