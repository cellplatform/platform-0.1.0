import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { EventListProps } from '..';
import { NetworkBusMock } from 'sys.runtime.web';
import { t } from '../../common';
import { DevSample } from './DEV.Sample';

type Ctx = {
  props: EventListProps;
  netbus: t.NetworkBusMock;
  count: number;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.EventList')
  .context((e) => {
    if (e.prev) return e.prev;

    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });

    const ctx: Ctx = {
      netbus,
      props: {},
      count: 0,
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Debug');

    const fire = (ctx: Ctx, total: number) => {
      new Array(total).fill(true).forEach(() => {
        ctx.count++;
        ctx.netbus.fire({
          type: 'FOO/sample',
          payload: { count: ctx.count },
        });
      });
    };

    e.button('fire', (e) => fire(e.ctx, 1));
    e.button('fire (10)', (e) => fire(e.ctx, 10));
    e.button('fire (100)', (e) => fire(e.ctx, 100));

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
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<EventList>',
        position: [150, 80],
        cropmarks: -0.2,
      },
    });
    e.render(<DevSample netbus={e.ctx.netbus} childProps={e.ctx.props} />);
  });

export default actions;
