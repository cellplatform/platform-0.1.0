import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { EventStack, EventStackProps } from '..';
import { rx } from './common';

type Ctx = { props: EventStackProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/EventStack')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus();

    return { props: { bus } };
  })

  .items((e) => {
    //
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<EventStack>',
        border: -0.1,
        cropmarks: -0.2,

        width: 350,
        height: 250,
      },
    });
    e.render(<EventStack {...e.ctx.props} />);
  });

export default actions;
