import React from 'react';

import { Harness, HarnessActionsEdge, HarnessProps } from '.';
import { DevActions } from '../..';
import { rx } from '../../common';

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
  .context((prev) => prev || { props: { bus, actions: [], actionsStyle: {} } })

  .items((e) => {
    e.title('props');
    e.select((e) => {
      e.initial('right')
        .label('actions/edge')
        .items(ACTIONS_EDGE)
        .pipe((e) => {
          const value = e.select.current[0];
          const actionsStyle = e.ctx.props.actionsStyle || (e.ctx.props.actionsStyle = {});

          e.select.label = value ? `actions/edge: ${value.label}` : `actions/edge`;
          e.select.isPlaceholder = !Boolean(value);
          actionsStyle.edge = value.value;
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
        position: [123, 80],
        label: '<Harness>',
      },
    });

    e.render(<Harness {...e.ctx.props} style={{ Absolute: 0 }} />);
  });

export default actions;
