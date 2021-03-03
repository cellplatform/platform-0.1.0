import React from 'react';

import { Harness, HarnessProps } from '.';
import { Store } from '../../store';
import { DevActions } from '../..';
import { rx, HttpClient, t } from '../../common';

import sample1 from '../../test/sample-1/Component.DEV';
import sample2 from '../../test/sample-2/Component.DEV';

const client = HttpClient.create(5000);
const bus = rx.bus();

bus.event$.subscribe((e) => {
  // console.log('e', e);
});

const ACTIONS = [sample1, sample2];

type Ctx = { props: HarnessProps };
const props: HarnessProps = {
  bus,
  actions: ACTIONS,
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
    e.title('actions');
    e.button('multiple', (e) => (e.ctx.props.actions = ACTIONS));
    e.button('none (undefined)', (e) => (e.ctx.props.actions = undefined));
    e.button('single', (e) => (e.ctx.props.actions = ACTIONS[0]));

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: undefined },
      actions: { background: -0.03 },
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
