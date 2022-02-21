import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';
import { RepoLink } from './RepoLink';

type CtxRunTests = () => Promise<TestSuiteRunResponse>;

type Ctx = {
  results?: TestSuiteRunResponse;
  tests?: {
    Automerge: CtxRunTests;
    AutomergeDoc: CtxRunTests;
    CrdtBus: CtxRunTests;
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
      Automerge: () => run(import('../../web.Automerge/Automerge.lib.TEST')),
      AutomergeDoc: () => run(import('../../web.Automerge/AutomergeDoc.TEST')),
      CrdtBus: () => run(import('../../web.CrdtBus/TEST')),
    });

    // Auto-run on load.
    // await tests.Automerge();
    // await tests.AutomergeDoc();
    await tests.CrdtBus();
  })

  .items((e) => {
    e.title('Run Tests');
    e.component((e) => {
      return <RepoLink url={'https://github.com/automerge/automerge'} marginLeft={15} />;
    });

    e.hr(1, 0.1);

    e.button('run: Automerge (baseline)', (e) => e.ctx.tests?.Automerge());
    e.button('run: AutomergeDoc (helpers)', (e) => e.ctx.tests?.AutomergeDoc());
    e.button('run: CrdtBus', (e) => e.ctx.tests?.CrdtBus());

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: 'Unit Tests (CRDT)',
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
