import React, { useState } from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { MotionDraggable, MotionDraggableProps, MotionDraggableItem } from '..';
import { css, t, rx } from './common';
import * as n from '../types';

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

    e.button('status (single item [0])', async (e) => {
      const events = e.ctx.events;
      e.button.description = toObject('status', await events.status.item.get(0));
    });

    e.button('status (global)', async (e) => {
      const events = e.ctx.events;
      e.button.description = toObject('status', await events.status.get());
    });

    e.hr(1, 0.2);

    e.button('move', async (e) => {
      const events = e.ctx.events;
      const index = 0;
      const res = await events.move.item.start({ index, x: 200, y: 150 });
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

const Sample: React.FC<MotionDraggableProps> = (props) => {
  const [count, setCount] = useState<number>(0);
  const handleBgClick = () => setCount((prev) => prev + 1);

  const styles = {
    base: css({
      Absolute: 30,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      display: 'flex',
    }),
    bg: css({ Absolute: 0, Flex: 'center-center', userSelect: 'none', opacity: 0.3 }),
    content: css({
      padding: 20,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      borderRadius: 20,
      flex: 1,
    }),
  };

  const items: MotionDraggableItem[] = [
    { width: 100, height: 100, el: <div {...styles.content}>Foo-1</div> },
    // { width: 100, height: 100, el: <div {...styles.content}>Foo-2</div> },
    {
      width: 200,
      height: 80,
      el() {
        return <div {...styles.content}>Foo-2</div>;
      },
    },
  ];

  return (
    <div {...styles.base}>
      <div {...styles.bg} onClick={handleBgClick}>{`background click: ${count}`}</div>
      <MotionDraggable {...props} style={{ flex: 1, Absolute: 0 }} items={items} />
      {/* <MotionDraggable {...props} style={{ flex: 1, Absolute: 0 }} items={items} /> */}
    </div>
  );
};
