import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { EventCard, EventCardProps } from '..';
import { t } from '../../common';

type Ctx = { props: EventCardProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.EventCard')
  .context((e) => {
    if (e.prev) return e.prev;

    const event: t.Event = { type: 'sample/event', payload: { message: 'hello' } };

    return {
      props: {
        event,
        count: 0,
        width: 300,
        isTopCard: true,
        shadow: false,
        showAsCard: true,
      },
    };
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

  .items((e) => {
    e.title('debug');

    e.boolean('showAsCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
    });

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
    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={10} />;
    });
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
    e.render(<EventCard {...e.ctx.props} />);
  });

export default actions;
