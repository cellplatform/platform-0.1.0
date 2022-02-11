import React from 'react';

import { CommandBar, CommandBarProps } from '..';
import { COLORS, DevActions, ObjectView, PeerNetwork, TEST } from '../../../web.test';

type Ctx = { props: CommandBarProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Command.Bar')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} as any }; // HACK
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    const signal = TEST.SIGNAL;
    const network = await PeerNetwork.start({ bus, signal });
    ctx.props = { network };
  })

  .items((e) => {
    e.title('Debug');

    e.button('netbus.fire', (e) => {
      e.ctx.props.network?.netbus.fire({ type: 'FOO/event', payload: { count: 123 } });
    });

    e.hr();
    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={10} />;
    });
  })

  .subject((e) => {
    const { network } = e.ctx.props;

    e.settings({
      host: { background: COLORS.DARK },
      layout: {
        label: '<CommandBar>',
        width: 600,
        height: 38,
        border: -0.1,
        cropmarks: -0.2,
        labelColor: 0.6,
      },
    });

    e.render(
      network && (
        <CommandBar
          {...e.ctx.props}
          style={{ flex: 1 }}
          onAction={(e) => console.log('onAction:', e)}
        />
      ),
    );
  });

export default actions;
