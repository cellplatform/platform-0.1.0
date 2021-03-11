import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample, SampleProps } from '.';

type Ctx = { props: SampleProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/Sample')
  .context((prev) => {
    if (prev) return prev;
    return { props: { count: 0 } };
  })

  .items((e) => {
    e.title('props');
    e.button('count: increment', (e) => e.ctx.props.count++);
    e.button('count: decrement', (e) => e.ctx.props.count--);
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: '<Sample>',
        position: [150, 80],
      },
      host: { background: -0.04 },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
