import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Root, RootProps } from '..';
import { rx, t } from '../../../common';

type Ctx = {
  bus: t.EventBus;
  props: RootProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Root')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const target = 'sys.db.team';

    const ctx: Ctx = {
      bus,
      props: { bus, target },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('isOpen', (e) => {
      if (e.changing) e.ctx.props.isOpen = e.changing.next;
      e.boolean.current = e.ctx.props.isOpen;
    });

    e.boolean('isSpinning', (e) => {
      if (e.changing) e.ctx.props.isSpinning = e.changing.next;
      e.boolean.current = e.ctx.props.isSpinning;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Root>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Root {...e.ctx.props} />);
  });

export default actions;
