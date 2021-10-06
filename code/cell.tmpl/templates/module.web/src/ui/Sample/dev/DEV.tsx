import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample, SampleProps } from '..';
import { SampleProperties } from '../Sample.Properties';

type Ctx = { props: SampleProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: { count: 0 } };
    return ctx;
  })

  .items((e) => {
    e.title('props');
    e.button('count: increment', (e) => e.ctx.props.count++);
    e.button('count: decrement', (e) => e.ctx.props.count--);

    e.hr(1, 0.1);

    e.component((e) => {
      return <SampleProperties props={e.ctx.props} style={{ MarginX: 20, MarginY: 10 }} />;
    });

    e.hr();
  })

  /**
   * Render
   */
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
