import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DevSampleApp, DevSampleAppProps } from '..';
import { t } from '../DEV.common';

type Ctx = {
  self: string;
  network?: t.PeerNetwork;
  client?: t.PeerEvents;
  props: DevSampleAppProps;
  output: { status?: any };
};

const Util = {
  async updateStatus(ctx: Ctx) {
    const { self, client } = ctx;
    if (client) {
      const status = await client.status(self).get();
      ctx.output.status = status.peer;
    }
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Sample.App')
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

    e.button('network.status', async (e) => await Util.updateStatus(e.ctx));

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
      const data = e.ctx.output.status;
      return (
        <ObjectView
          name={'status (network)'}
          data={data ?? {}}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<DEV.Sample.App>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSampleApp {...e.ctx.props} />);
  });

export default actions;
