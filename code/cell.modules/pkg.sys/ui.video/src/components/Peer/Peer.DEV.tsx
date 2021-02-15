import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Peer, PeerProps } from '.';

type Ctx = PeerProps;

// const ID1 = 'ckl668r2o000009l179rrf0q5';
// const ID2 = 'ckl66b1r3000g09l15rjya17t';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/Peer')
  .context((prev) => prev || {})

  .items((e) => {
    e.title('props');
    // e.button('count: increment', (e) => e.ctx.count++);
    // e.button('count: decrement', (e) => e.ctx.count--);
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
        width: 600,
        height: 500,
        label: '<Peer>',
      },
      host: { background: -0.04 },
    });
    e.render(<Peer {...e.ctx} />);
    // e.render(<Peer id={ID2} connectTo={ID1} {...e.ctx} />);
    // e.render(<Peer {...e.ctx} />);
  });

export default actions;
