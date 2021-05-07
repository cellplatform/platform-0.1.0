import { domMax, DragElastic, LazyMotion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { filter } from 'rxjs/operators';

import { css, CssValue, t, useResizeObserver } from './common';
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
  const bus = props.bus.type<n.MotionDraggableEvent>();
  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);

  /**
   * Event controller.
   */
  useEffect(() => {
    const events = Events(bus);

    events.size.req$.pipe(filter((e) => resize.ready)).subscribe((e) => {
      const tx = e.tx;
      const { width, height } = resize.rect;
      bus.fire({ type: 'ui/MotionDraggable/size:res', payload: { tx, width, height } });
    });

    events.status.req$.pipe(filter((e) => resize.ready)).subscribe(async (e) => {
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
  }, [resize]); // eslint-disable-line

  const styles = {
    base: css({ position: 'relative', pointerEvents: 'none' }),
    item: css({ Absolute: 0 }),
  };

  const elBody =
    resize.ready &&
    items.map((item) => {
      return (
        <div key={item.id} {...styles.item}>
          <LazyMotion features={domMax}>
            <Child bus={bus} def={item} container={resize.rect} elastic={elastic} />
          </LazyMotion>
        </div>
      );
    });

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};

(View as any).Events = Events;
type E = (bus: t.EventBus<any>) => n.MotionDraggableEvents;
type T = React.FC<MotionDraggableProps> & { Events: E };
export const MotionDraggable = View as T;
