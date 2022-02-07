import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { OpenConnectionInput, OpenConnectionInputProps } from '..';
import { t } from '../../common';
import { PeerNetwork } from '../../..';

type Ctx = {
  self: t.PeerId;
  network?: t.PeerNetwork;
  props: OpenConnectionInputProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.OpenConnectionInput')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      self: '',
      props: {},
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    const signal = 'rtc.cellfs.com';
    const network = (ctx.network = await PeerNetwork.start({ bus, signal }));
    const { self } = network.netbus;

    ctx.self = self;
    ctx.network = network;
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      return <ObjectView name={'props'} data={e.ctx.props} style={{ MarginX: 15 }} fontSize={11} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(
      <OpenConnectionInput
        {...e.ctx.props}
        onConnectRequest={(e) => console.log('onConnectRequest', e)}
      />,
    );
  });

export default actions;
