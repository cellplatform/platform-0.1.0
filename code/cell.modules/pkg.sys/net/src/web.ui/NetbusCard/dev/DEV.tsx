import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { NetbusCard, NetbusCardProps } from '..';
import { t } from '../../common';
import { PeerNetwork } from '../../../web.PeerNetwork';

type Ctx = {
  props: NetbusCardProps;
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
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const signal = SIGNAL_SERVER;
    const network = await PeerNetwork.start({ bus, signal });
    const { netbus } = network;

    ctx.props = { showAsCard: true, netbus };
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('asCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
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
