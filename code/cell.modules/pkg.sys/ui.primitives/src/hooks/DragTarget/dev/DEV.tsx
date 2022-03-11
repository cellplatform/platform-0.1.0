import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { Sample } from './DEV.Sample';

type Ctx = {
  isEnabled: boolean;
  count: number;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.DragTarget')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = { isEnabled: true, count: 0 };
    return ctx;
  })

  .items((e) => {
    e.title('useDragTarget');

    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.isEnabled;
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        label: {
          topLeft: 'hook: useDragTarget',
          topRight: 'hint: drag a file over the target',
        },
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        position: [250, 150],
      },
      host: { background: -0.04 },
    });

    e.render(<Sample isEnabled={e.ctx.isEnabled} />, {});
  });

export default actions;
