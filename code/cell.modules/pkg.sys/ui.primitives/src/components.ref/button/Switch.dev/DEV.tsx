import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Samples, SamplesProps } from './DEV.sample';

type Ctx = { props: SamplesProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.button.Switch')
  .context((e) => {
    if (e.prev) return e.prev;
    return { props: { isEnabled: true, isChecked: true } };
  })

  .items((e) => {
    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.props.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.props.isEnabled;
    });

    e.boolean('isChecked', (e) => {
      if (e.changing) e.ctx.props.isChecked = e.changing.next;
      e.boolean.current = e.ctx.props.isChecked;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Switch>',
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<Samples {...e.ctx.props} />);
  });

export default actions;
