import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = { props: DevSampleProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useModule')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .items((e) => {
    e.title('useModule (hook)');

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSample {...e.ctx.props} />);
  });

export default actions;
