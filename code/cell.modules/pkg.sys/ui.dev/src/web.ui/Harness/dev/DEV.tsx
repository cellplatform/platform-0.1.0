import React from 'react';

import { Harness, HarnessProps } from '..';
import { DevActions } from '../../..';
import sample1 from '../../../test/sample-1/DEV';
import sample2 from '../../../test/sample-2/DEV';
import sample3 from '../../../test/sample-3/DEV';
import { rx } from '../../common';

const ACTIONS = [sample1, sample2, sample3];

type Ctx = { props: HarnessProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.dev.Harness')

  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const ctx: Ctx = {
      props: {
        bus,
        actions: ACTIONS,
        store: true, // Default (local-storage).
        allowRubberband: false,
        useDevQueryString: true,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('props');

    e.boolean('allowRubberband', (e) => {
      if (e.changing) e.ctx.props.allowRubberband = e.changing.next;
      e.boolean.current = e.ctx.props.allowRubberband;
    });

    e.boolean('useDevQueryString', (e) => {
      if (e.changing) e.ctx.props.useDevQueryString = e.changing.next;
      e.boolean.current = e.ctx.props.useDevQueryString;
    });

    e.hr(1, 0.1);
  })

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
