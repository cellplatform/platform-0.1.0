import React, { useState } from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { MotionDraggable, MotionDraggableProps } from '..';
import * as n from '../types';
import { rx, t } from '../common';
import { Sample } from './DEV.Sample';

type Ctx = {
  bus: t.EventBus<n.MotionDraggableEvent>;
  events: n.MotionDraggableEvents;
  count: number;
  props: MotionDraggableProps;
};

const toObject = (name: string, data: any) => (
  <ObjectView name={name} data={data} expandLevel={2} fontSize={10} />
);

/**
 * Actions
 *
 * Refs:
 *    https://hohanga.medium.com/framer-motion-drag-and-scroll-progress-850571dfdb06
 *    https://github.com/samselikoff/2020-12-15-image-cropper
 *    https://www.youtube.com/watch?v=SBRUuMyAYw0
 *
 *    https://github.com/pmndrs/react-use-gesture
 *    https://github.com/pmndrs/react-spring
 *    https://www.jclem.net/posts/pan-zoom-canvas-react
 *
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.drag/Motion')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus<n.MotionDraggableEvent>();
    const events = MotionDraggable.Events(bus);

    return {
      bus,
      events,
      count: 0,
      props: { bus },
    };
  })

  .items((e) => {
    e.title('events');

    e.button('size', async (e) => {
      const events = e.ctx.events;
      e.button.description = toObject('size', await events.size.get());
    });

    e.button('status (single item)', async (e) => {
      const events = e.ctx.events;
      const status = await events.status.get();
      const id = status.items[0].id;
      e.button.description = toObject('status', await events.status.item.get(id));
    });

    e.button('status (global)', async (e) => {
      const events = e.ctx.events;
      e.button.description = toObject('status', await events.status.get());
    });

    e.hr(1, 0.2);

    e.button('move', async (e) => {
      const events = e.ctx.events;
      const status = await events.status.get();
      const id = status.items[0].id;
      const res = await events.move.item.start({ id, x: 200, y: 150 });
      e.button.description = toObject('move', res);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<MotionDraggable>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
