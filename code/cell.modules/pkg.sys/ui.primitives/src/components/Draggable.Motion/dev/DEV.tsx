import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { MotionDraggable, MotionDraggableProps } from '..';
import { Sample } from './DEV.Sample';

type Ctx = { props: MotionDraggableProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.drag/Motion')
  .context((prev) => {
    if (prev) return prev;
    return { props: {} };
  })

  .items((e) => {
    //
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
    e.render(<Sample draggableProps={e.ctx.props} />);
  });

export default actions;
