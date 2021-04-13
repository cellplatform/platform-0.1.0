import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { EventStackCard, EventStackCardProps } from '..';
import { t } from './common';

type Ctx = { props: EventStackCardProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.event/EventCard')
  .context((prev) => {
    if (prev) return prev;

    const event: t.Event = { type: 'sample/event', payload: { message: 'hello' } };

    return {
      props: {
        event,
        count: 0,
        width: 300,
        isTopCard: true,
        shadow: false,
      },
    };
  })

  .items((e) => {
    e.title('debug');

    e.boolean('width', (e) => {
      if (e.changing) e.ctx.props.width = e.changing.next ? 300 : undefined;
      e.boolean.current = typeof e.ctx.props.width === 'number';
    });

    e.boolean('height', (e) => {
      if (e.changing) e.ctx.props.height = e.changing.next ? 250 : undefined;
      e.boolean.current = typeof e.ctx.props.height === 'number';
    });

    e.button('increment count', (e) => e.ctx.props.count++);

    e.hr();
  })

  .items((e) => {
    e.title('props');

    e.boolean('showPayload', (e) => {
      if (e.changing) e.ctx.props.showPayload = e.changing.next;
      e.boolean.current = e.ctx.props.showPayload;
    });

    e.boolean('isTopCard', (e) => {
      if (e.changing) e.ctx.props.isTopCard = e.changing.next;
      e.boolean.current = e.ctx.props.isTopCard;
    });

    e.boolean('shadow', (e) => {
      if (e.changing) e.ctx.props.shadow = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.shadow);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<EventStackCard>',
        cropmarks: -0.2,
        position: { top: 200 },
      },
    });
    e.render(<EventStackCard {...e.ctx.props} />);
  });

export default actions;
