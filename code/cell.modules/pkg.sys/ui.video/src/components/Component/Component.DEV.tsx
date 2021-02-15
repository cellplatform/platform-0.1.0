import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Component, ComponentProps } from './Component';

type Ctx = ComponentProps;

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sample-component')
  .context((prev) => prev || { count: 0 })

  .items((e) => {
    e.title('props');
    e.button('count: increment', (e) => e.ctx.count++);
    e.button('count: decrement', (e) => e.ctx.count--);
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
        label: '<Component>',
        position: [150, 80],
      },
      host: { background: -0.04 },
    });
    e.render(<Component {...e.ctx} />);
  });

export default actions;
