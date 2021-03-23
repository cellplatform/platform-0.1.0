import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Button, ButtonProps } from '.';
import { SampleButtons, SampleButtonsProps } from './DEV.sample';

type Ctx = { props: SampleButtonsProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.button/Button')
  .context((prev) => {
    if (prev) return prev;
    return { props: { isEnabled: true, isChecked: true } };
  })

  .items((e) => {
    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.props.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.props.isEnabled;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Button>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<SampleButtons {...e.ctx.props} />);
  });

export default actions;
