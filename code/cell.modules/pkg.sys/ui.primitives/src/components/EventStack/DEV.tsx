import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { EventStack, EventStackProps } from '.';
import { rx, t } from '../../common';

type Ctx = {
  bus: t.EventBus<any>;
  count: number;
  width?: number;
  height?: number;
  props: EventStackProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/EventStack')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus();

    return {
      bus,
      count: 0,
      width: 300,
      props: { bus },
    };
  })

  .items((e) => {
    e.title('debug');

    e.boolean('width', (e) => {
      if (e.changing) e.ctx.width = e.changing.next ? 300 : undefined;
      e.boolean.current = typeof e.ctx.width === 'number';
    });

    e.boolean('height', (e) => {
      if (e.changing) e.ctx.height = e.changing.next ? 250 : undefined;
      e.boolean.current = typeof e.ctx.height === 'number';
    });

    e.hr();
  })

  .items((e) => {
    e.title('events');

    e.button('fire', (e) => {
      e.ctx.count++;
      const msg = `hello ${e.ctx.count}`;
      e.ctx.bus.fire({ type: 'sample/event', payload: { msg } });
    });

    e.hr();
  })

  .subject((e) => {
    const { width, height } = e.ctx;
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { bottomLeft: '<EventStack>' },
        cropmarks: -0.2,
        position: { top: 200 },
        width,
        height,
      },
    });
    e.render(<EventStack {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
