import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample, SampleProps } from './DEV.Sample';

type Ctx = { props: SampleProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/Sample')
  .context((e) => {
    if (e.prev) return e.prev;
    return { props: {} };
  })

  .items((e) => {
    //
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Sample>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
