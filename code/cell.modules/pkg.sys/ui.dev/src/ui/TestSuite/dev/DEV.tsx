import React from 'react';
import { DevActions } from '../../..';

import { TestSuite, TestSuiteProps } from '..';
import tests from './sample.TEST';

type Ctx = { props: TestSuiteProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.TestSuite')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .items((e) => {
    e.title('TestSuite (runner)');

    e.button('run', async (e) => {
      const res = await tests.run();
      e.ctx.props.data = res;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<TestSuite>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<TestSuite {...e.ctx.props} />);
  });

export default actions;
