import React from 'react';
import { DevActions } from '../..';
import { Component, ComponentProps } from './Component';
import { COLORS } from '../../common';

type Ctx = { props: ComponentProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test/sample-3')
  .context((prev) => {
    if (prev) return prev;
    return { props: {} };
  })

  .items((e) => {
    //
  })

  .subject((e) => {
    e.settings({
      layout: {
        border: 0.2,
        cropmarks: 0.2,
        background: 0.1,
        labelColor: 0.5,
        label: 'sample-3',
      },
      host: { background: COLORS.DARK },
    });
    e.render(<Component {...e.ctx.props} />);
  });

export default actions;
