import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  props?: DevSampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('PeerNetwork (hook)')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {};
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    console.log('INIT', e);

    ctx.props = { bus };
  })

  .items((e) => {
    e.title('Dev');

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: 'usePeerNetwork (hook)',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    console.log('e.ctx.props', e.ctx.props);

    e.render(e.ctx.props && <DevSample {...e.ctx.props} />);
  });

export default actions;
