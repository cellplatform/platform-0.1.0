import { domMax, DragElastic, LazyMotion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { filter } from 'rxjs/operators';

import { css, CssValue, FC, t, useResizeObserver } from './common';
import { Events } from './Events';
import { Child } from './MotionDraggable.Child';
import * as n from './types';

export type MotionDraggableProps = {
  bus: t.EventBus<any>;
  items?: n.MotionDraggableDef[];
  elastic?: DragElastic;
  style?: CssValue;
};

const View: React.FC<MotionDraggableProps> = (props) => {
  const { elastic } = props;
  const items = (props.items ?? []).filter(Boolean);
  const bus = props.bus as t.EventBus<n.MotionDraggableEvent>;
  const size = useResizeObserver();

  /**
   * Event controller.
   */
  useEffect(() => {
    const events = Events(bus);

    events.size.req$.pipe(filter((e) => size.ready)).subscribe((e) => {
      const tx = e.tx;
      const { width, height } = size.rect;
      bus.fire({ type: 'ui/MotionDraggable/size:res', payload: { tx, width, height } });
    });

    events.status.req$.pipe(filter((e) => size.ready)).subscribe(async (e) => {
      const tx = e.tx;
      const list = items.map((item) => events.item.status.get(item.id));
      bus.fire({
        type: 'ui/MotionDraggable/status:res',
        payload: {
          tx,
          status: {
            size: await events.size.get(),
            items: (await Promise.all(list))
              .filter(Boolean)
              .map((item) => item as n.MotionDraggableItemStatus),
          },
        },
      });
    });

    return () => events.dispose();
  }, [size]); // eslint-disable-line

  const styles = {
    base: css({ position: 'relative', pointerEvents: 'none' }),
    item: css({ Absolute: 0 }),
  };

  const elBody =
    size.ready &&
    items.map((item) => {
      const { width, height } = size.rect;
      const container: n.MotionDraggableContainer = { size: { width, height } };
      return (
        <div key={item.id} {...styles.item}>
          <LazyMotion features={domMax}>
            <Child bus={bus} def={item} container={container} elastic={elastic} />
          </LazyMotion>
        </div>
      );
    });

  return (
    <div ref={size.ref} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};

/**
 * Export API.
 */
type Fields = {
  Events: (bus: t.EventBus<any>) => n.MotionDraggableEvents;
};
export const MotionDraggable = FC.decorate<MotionDraggableProps, Fields>(
  View,
  { Events },
  { displayName: 'MotionDraggable' },
);
