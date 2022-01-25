import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

type CtxRunTests = () => Promise<TestSuiteRunResponse>;

type Ctx = {
  results?: TestSuiteRunResponse;
  tests?: {
    Sample: CtxRunTests;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('UnitTests')
  .context((e) => e.prev ?? {})

  .init(async (e) => {
    const run = async (input: Promise<any>) => {
      const res = (e.ctx.results = await Test.run(input));
      e.redraw();
      return res;
    };

    const tests = (e.ctx.tests = {
      Sample: () => run(import('./Sample.TEST')),
    });

    await tests.Sample(); // Auto-run on load.
  })

  .items((e) => {
    e.title('Run Tests');

    e.button('run: Sample', (e) => e.ctx.tests?.Sample());

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: 'Unit Tests',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(
      <Test.View.Results data={e.ctx.results} style={{ flex: 1, padding: 20 }} scroll={true} />,
    );
  });

export default actions;
