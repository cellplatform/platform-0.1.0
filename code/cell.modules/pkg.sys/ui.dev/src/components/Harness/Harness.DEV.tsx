import React from 'react';
import { DevActions, toObject } from '../..';
import { css, COLORS, color, time, rx } from '../../common';
import { Harness, HarnessProps, HarnessActionsEdge } from '.';

const bus = rx.bus();

const ACTIONS_EDGE: HarnessActionsEdge[] = ['left', 'right'];

type Ctx = {
  props: HarnessProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.dev.Harness')
  .context((prev) => prev || { props: { bus, actions: [] } })

  .items((e) => {
    e.title('props');
    e.select((e) => {
      e.label('actionsEdge')
        .initial('right')
        .items(ACTIONS_EDGE)
        .pipe((e) => {
          /**
           * TODO 🐷
           * rename: placeholder => isPlaceholder
           * - e.select('label') - with param, not working.
           */

          const value = e.select.current[0]; // NB: always first.
          e.select.label = value ? value.label : `actionsEdge`;
          e.select.placeholder = !Boolean(value);
          e.ctx.props.acitonsEdge = value.value;
        });
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
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: '<Harness>',
        position: [123, 80],
      },
    });
    e.render(<Harness {...e.ctx.props} style={{ Absolute: 0 }} />);
  });

export default actions;
