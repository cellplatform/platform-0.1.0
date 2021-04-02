import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { Sample } from './DEV.Sample';

type Ctx = {
  count: number;
};
const INITIAL = { count: 0 };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook/useDragTarget')
  .context((prev) => prev || INITIAL)

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        position: [250, 150],
        label: {
          topLeft: 'hook: useDragTarget',
          topRight: 'hint: drag a file over the target',
        },
      },
      host: { background: -0.04 },
      actions: { width: 0 },
    });

    e.render(<Sample />);
  });

export default actions;
