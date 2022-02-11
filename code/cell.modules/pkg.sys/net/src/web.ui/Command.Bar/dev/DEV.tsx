import React from 'react';
import { DevActions, ObjectView, TEST, PeerNetwork } from '../../../test';
import { CommandBar, CommandBarProps } from '..';

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
    e.title('Dev');

    e.hr();

    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={10} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<CommandBar>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<CommandBar {...e.ctx.props} />);
  });

export default actions;
