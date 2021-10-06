import React from 'react';
import { DevActions } from '../../..';

import { Test, TestSuite, TestSuiteProps } from '..';
import tests from './test.samples/foo.TEST';

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

    e.button('run: static import', async (e) => {
      e.ctx.props.data = await tests.run();
    });

    e.hr(1, 0.1);

    e.button('run: dynamic imports', async (e) => {
      const root = await Test.bundle([
        import('./test.samples/foo.TEST'),
        import('./test.samples/bar.TEST'),
      ]);
      e.ctx.props.data = await root.run();
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
