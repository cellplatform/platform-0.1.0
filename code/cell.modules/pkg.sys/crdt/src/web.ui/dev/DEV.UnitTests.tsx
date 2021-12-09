import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { TestSuiteRunResponse, TestSuiteModel } from 'sys.ui.dev/lib/types';
import { RepoLink } from './components/RepoLink';

type CtxRunTests = () => Promise<TestSuiteRunResponse>;

type Ctx = {
  results?: TestSuiteRunResponse;
  tests: {
    Automerge: CtxRunTests;
    CrdtBus: CtxRunTests;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('UnitTests')
  .context((e) => {
    if (e.prev) return e.prev;

    const run = async (bundle: TestSuiteModel) => {
      const results = await bundle.run();
      e.change.ctx((ctx) => (ctx.results = results));
      return results;
    };

    const tests: Ctx['tests'] = {
      async Automerge() {
        return run(await Test.bundle(import('../../web.Automerge/Automerge.TEST')));
      },
      async CrdtBus() {
        return run(await Test.bundle(import('../../web.CrdtBus/index.TEST')));
      },
    };

    const ctx: Ctx = { tests };

    // tests.Automerge(); // Auto-run on load.
    tests.CrdtBus(); // Auto-run on load.

    return ctx;
  })

  .items((e) => {
    e.title('Run Tests');

    e.button('run: Automerge (baseline)', (e) => e.ctx.tests.Automerge());
    e.component((e) => {
      return <RepoLink url={'https://github.com/automerge/automerge'} marginLeft={75} />;
    });

    e.button('run: CrdtBus', (e) => e.ctx.tests.CrdtBus());

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
