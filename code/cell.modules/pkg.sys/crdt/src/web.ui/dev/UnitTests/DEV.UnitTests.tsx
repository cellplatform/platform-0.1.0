import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { TestSuiteRunResponse, TestSuiteModel } from 'sys.ui.dev/lib/types';
import { RepoLink } from './ui/RepoLink';

type CtxRunTests = () => Promise<TestSuiteRunResponse>;

type Ctx = {
  results?: TestSuiteRunResponse;
  tests: {
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
  .context((e) => {
    if (e.prev) return e.prev;

    const run = async (bundle: TestSuiteModel) => {
      const results = await bundle.run();
      e.change.ctx((ctx) => (ctx.results = results));
      return results;
    };

    const tests: Ctx['tests'] = {
      async Automerge() {
        return run(await Test.bundle(import('../../../web.Automerge/Automerge.lib.TEST')));
      },
      async AutomergeDoc() {
        return run(await Test.bundle(import('../../../web.Automerge/AutomergeDoc.TEST')));
      },
      async CrdtBus() {
        return run(await Test.bundle(import('../../../web.CrdtBus/TEST')));
      },
    };

    const ctx: Ctx = { tests };

    // Auto-run on load.
    // tests.Automerge();
    // tests.AutomergeDoc();
    tests.CrdtBus();

    return ctx;
  })

  .items((e) => {
    e.title('Run Tests');
    e.component((e) => {
      return <RepoLink url={'https://github.com/automerge/automerge'} marginLeft={15} />;
    });

    e.hr(1, 0.1);

    e.button('run: Automerge (baseline)', (e) => e.ctx.tests.Automerge());
    e.button('run: AutomergeDoc (helpers)', (e) => e.ctx.tests.AutomergeDoc());
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
