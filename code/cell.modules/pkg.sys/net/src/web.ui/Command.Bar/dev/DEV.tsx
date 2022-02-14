import React from 'react';

import {
  CommandBar,
  CommandBarProps,
  CommandInsetProps,
  CommandBarConstants,
  CommandBarPart,
} from '..';
import { COLORS, DevActions, ObjectView, PeerNetwork, TEST } from '../../../web.test';

type Ctx = {
  props: CommandBarProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Command.Bar')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {} as any, // HACK
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    const signal = TEST.SIGNAL;
    const network = await PeerNetwork.start({ bus, signal });
    ctx.props = { network, inset: true };
  })

  .items((e) => {
    e.title('Props');

    e.boolean('inset', (e) => {
      if (e.changing) e.ctx.props.inset = e.changing.next;
      e.boolean.current = e.ctx.props.inset as boolean;
    });

    e.select((config) =>
      config
        .title('parts:')
        .items(CommandBarConstants.PARTS)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as CommandBarPart[];
            e.ctx.props.parts = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.hr(1, 0.1);

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
    const { props } = e.ctx;
    const { network } = props;

    e.settings({
      host: { background: COLORS.DARK },
      layout: {
        label: '<CommandBar>',
        width: 600,
        height: 38,
        cropmarks: 0.2,
        labelColor: 0.6,
      },
    });
    if (!network) return;

    const bg = props.inset ? ({ cornerRadius: [0, 0, 5, 5] } as CommandInsetProps) : undefined;

    e.render(
      <CommandBar
        {...props}
        style={{ flex: 1 }}
        onAction={(e) => console.log('onAction:', e)}
        inset={bg}
      />,
    );
  });

export default actions;
