import React from 'react';

import {
  CommandBar,
  CommandBarProps,
  CommandBarInsetProps,
  CommandBarConstants,
  CommandBarPart,
} from '..';
import { COLORS, t, rx } from '../../common';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { NetworkBusMock } from 'sys.runtime.web';

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

    const netbus = NetworkBusMock({ local: 'local-id', remotes: ['peer-1', 'peer-2'] });
    const ctx: Ctx = {
      props: { netbus },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    const instance = 'foo.instance';
    ctx.props.events = { bus, instance };

    const events = CommandBar.Events({ bus, instance });

    events.$.subscribe((e) => {
      console.log('CommandBar.Events.$', e);
    });
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

    e.button('arrangement (1)', (e) => (e.ctx.props.parts = ['Input', 'Events']));
    e.button('arrangement (2)', (e) => (e.ctx.props.parts = ['Events', 'Input']));

    e.hr(1, 0.1);

    e.button('netbus.fire', (e) => {
      e.ctx.props.netbus.fire({ type: 'FOO/event', payload: { count: 123 } });
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
  })

  .subject((e) => {
    const { props } = e.ctx;
    // const { netbus } = props;

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
    // if (!network) return;

    const bg = props.inset ? ({ cornerRadius: [0, 0, 5, 5] } as CommandBarInsetProps) : undefined;

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
