import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DevSampleApp, DevSampleAppProps } from '..';
import { t, WebRuntimeBus } from '../common';

type Ctx = {
  self: string;
  network?: t.PeerNetwork;
  client?: t.PeerEvents;
  props: DevSampleAppProps;
  size?: t.DomRect;
  output: { networkStatus?: any; netbus?: any };
};

const Util = {
  async updateStatus(ctx: Ctx) {
    const { self, client } = ctx;
    if (client) {
      const status = await client.status(self).get();
      ctx.output.networkStatus = status.peer;
    }
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('DEV.Sample.App')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      self: '',
      props: {
        onReady(e) {
          change.ctx((ctx) => {
            ctx.network = e.network;
            ctx.self = e.network.self;
            ctx.client = e.network.events.peer;
          });
        },
        onSize(e) {
          change.ctx((ctx) => (ctx.size = e.size));
        },
      },
      output: {},
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    Util.updateStatus(ctx);
  })

  .items((e) => {
    e.title('Dev');

    e.button('req: network.status', async (e) => await Util.updateStatus(e.ctx));

    e.button('req: WebRuntime/netbus', async (e) => {
      const bus = e.ctx.network?.bus;
      if (bus) {
        const instance = { bus };
        const env = WebRuntimeBus.Events({ instance });
        e.ctx.output.netbus = await env.netbus.get();
      }
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });

    e.hr(1, 0.1);

    e.component((e) => {
      return (
        <ObjectView
          name={'network/status'}
          data={e.ctx.output.networkStatus ?? {}}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });

    e.hr(1, 0.1);

    e.component((e) => {
      return (
        <ObjectView
          name={'WebRuntime/netbus'}
          data={e.ctx.output.netbus ?? {}}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const size = e.ctx.size;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<DEV.Sample.App>',
          topRight: size ? `${size.width} x ${size.height} px` : undefined,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSampleApp {...e.ctx.props} />);
  });

export default actions;
