import React from 'react';

import { Harness, HarnessActionsEdge, HarnessProps } from '.';
import { Store } from '../../store';
import { DevActions } from '../..';
import { rx, HttpClient } from '../../common';

import sample1 from '../../test/sample-1/Component.DEV';
import sample2 from '../../test/sample-2/Component.DEV';
import sample3 from '../../test/sample-3/Component.DEV';

const client = HttpClient.create(5000);
const bus = rx.bus();

const ACTIONS = [sample1, sample2, sample3];
const ACTIONS_EDGE: HarnessActionsEdge[] = ['left', 'right'];
const ACTIONS_WIDTH: number[] = [200, 300, 400];

type Ctx = { props: HarnessProps };
const props: HarnessProps = {
  bus,
  actions: ACTIONS,
  actionsStyle: {},
  hostStyle: {},

  namespace: 'child-dev',
  store: true, // Default (local-storage).

  // store: Store.ActionsSelect.cell({
  //   client,
  //   uri: 'cell:ckkynysav001hrret8tzzg2pp:A1',
  //   actions: ACTIONS,
  // }),
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.dev.Harness')
  .context((prev) => prev || { props: { ...props } })

  .items((e) => {
    e.title('props');
    e.select((e) => {
      e.label('actions/edge')
        .items(ACTIONS_EDGE)
        .initial('right')
        .pipe((e) => {
          const current = e.select.current[0];
          const actionsStyle = e.ctx.props.actionsStyle || (e.ctx.props.actionsStyle = {});
          e.select.label = current ? `actions/edge: ${current.label}` : `actions/edge`;
          e.select.isPlaceholder = !Boolean(current);
          actionsStyle.edge = current.value;
        });
    });
    e.select((e) => {
      e.label('actions/width')
        .items(ACTIONS_WIDTH)
        .initial(300)
        .pipe((e) => {
          const current = e.select.current[0];
          const actionsStyle = e.ctx.props.actionsStyle || (e.ctx.props.actionsStyle = {});
          e.select.label = current ? `actions/width: ${current.label}` : `actions/width`;
          e.select.isPlaceholder = !Boolean(current);
          actionsStyle.width = current.value;
        });
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: -0.03 },
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        position: [180, 100],
        label: '<Harness>',
      },
    });

    e.render(<Harness {...e.ctx.props} style={{ Absolute: 0 }} />);
  });

export default actions;
