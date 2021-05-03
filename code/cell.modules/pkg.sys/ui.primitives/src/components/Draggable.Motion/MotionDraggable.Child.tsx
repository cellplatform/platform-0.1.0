import { DragElastic, m, useMotionValue } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

import { css, t } from './common';
import { useItemController, useScale } from './hooks';
import * as n from './types';
import { ItemUtil } from './util';

export type ChildProps = {
  bus: t.EventBus<any>;
  item: n.MotionDraggableItem;
  container: { width: number; height: number };
  elastic?: DragElastic;
};

export const Child: React.FC<ChildProps> = (props) => {
  const { container, item, elastic = 0.3 } = props;
  const id = item.id;
  const { width, height } = ItemUtil.toSize(item);
  const bus = props.bus.type<n.MotionDraggableEvent>();

  const rootRef = useRef<HTMLDivElement>(null);

  const scaleable = typeof item.scaleable === 'object' ? item.scaleable : { min: 0.5, max: 5 };
  const scale = useScale(rootRef, {
    isEnabled: Boolean(item.scaleable),
    min: scaleable.min,
    max: scaleable.max,
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useItemController({ bus, item, x, y, scale });

  const dragHandler = (lifecycle: n.MotionDraggableItemDrag['lifecycle']) => {
    return () => {
      bus.fire({
        type: 'ui/MotionDraggable/item/drag',
        payload: { id, lifecycle },
      });
    };
  };

  const mouseHandler = (mouse: n.MotionDraggableItemMouse['mouse']) => {
    return (e: React.MouseEvent) => {
      const { button } = e;
      bus.fire({
        type: 'ui/MotionDraggable/item/mouse',
        payload: { id, mouse, button },
      });
    };
  };

  const constraints = {
    top: 0,
    left: 0,
    right: container.width - width,
    bottom: container.height - height,
  };

  const styles = {
    base: css({
      display: 'flex',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
    }),
  };

  return (
    <m.div
      ref={rootRef}
      drag={true}
      dragElastic={elastic}
      dragMomentum={true}
      dragConstraints={constraints}
      style={{ scale, x, y, width, height }}
      onPanStart={dragHandler('start')}
      onPanEnd={dragHandler('complete')}
      onMouseDown={mouseHandler('down')}
      onMouseUp={mouseHandler('up')}
      onMouseEnter={mouseHandler('enter')}
      onMouseLeave={mouseHandler('leave')}
      {...styles.base}
    >
      {typeof item.el === 'function' ? item.el(item) : item.el}
    </m.div>
  );
};
