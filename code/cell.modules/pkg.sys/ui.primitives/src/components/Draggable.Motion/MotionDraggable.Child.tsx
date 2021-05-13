import { DragElastic, m } from 'framer-motion';
import React, { useRef } from 'react';

import { css, t } from './common';
import { useItemController, useScale } from './hooks';
import * as n from './types';

export type ChildProps = {
  bus: t.EventBus<any>;
  def: n.MotionDraggableDef;
  container: n.MotionDraggableContainer;
  elastic?: DragElastic;
};

export const Child: React.FC<ChildProps> = (props) => {
  const { container, def, elastic = 0.3 } = props;
  const id = def.id;
  const bus = props.bus.type<n.MotionDraggableEvent>();

  const rootRef = useRef<HTMLDivElement>(null);
  const { state, motion } = useItemController({ bus, def });
  const { x, y, width, height, scale } = motion;

  const scaleable = typeof def.scaleable === 'object' ? def.scaleable : { min: 0.5, max: 5 };
  useScale(rootRef, scale, {
    isEnabled: Boolean(def.scaleable),
    min: scaleable.min,
    max: scaleable.max,
  });

  if (!state) return null;

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
    right: container.size.width - width.get(),
    bottom: container.size.height - height.get(),
  };

  const styles = {
    base: css({
      display: 'flex',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
    }),
  };

  const el = typeof def.el !== 'function' ? def.el : def.el({ state, container });

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
      {el}
    </m.div>
  );
};
