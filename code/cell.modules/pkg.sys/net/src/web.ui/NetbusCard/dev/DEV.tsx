import React from 'react';
import { DevActions, ObjectView, TEST } from '../../../test';
import { NetbusCard, NetbusCardProps } from '..';
import { PeerNetwork } from '../../../web.PeerNetwork';

type Ctx = {
  props: NetbusCardProps;
};

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
    const signal = TEST.SIGNAL;
    const network = await PeerNetwork.start({ bus, signal });
    const { netbus } = network;
    ctx.props = { showAsCard: true, netbus };
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('showAsCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
    });

    e.button('fire', (e) => {
      const netbus = e.ctx.props.netbus;
      netbus.fire({ type: 'Foo', payload: { msg: 123 } });
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
        height: 300,
      },
    });
    e.render(<NetbusCard {...e.ctx.props} />);
  });

export default actions;
