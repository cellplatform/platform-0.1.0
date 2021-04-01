import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { CardStack, CardStackProps } from '.';

type Ctx = { props: CardStackProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/CardStack')
  .context((prev) => {
    if (prev) return prev;
    return { props: {} };
  })

  .items((e) => {
    //
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<CardStack>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<CardStack {...e.ctx.props} />);
  });

export default actions;
