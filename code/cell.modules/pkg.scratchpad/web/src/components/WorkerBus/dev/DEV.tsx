import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { WorkerBus, WorkerBusProps } from '..';

type Ctx = { props: WorkerBusProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('WorkerBus')
  .context((e) => {
    if (e.prev) return e.prev;
    return { props: {} };
  })

  .items((e) => {
    e.title('Dev');

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<WorkerBus>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<WorkerBus {...e.ctx.props} />);
  });

export default actions;
