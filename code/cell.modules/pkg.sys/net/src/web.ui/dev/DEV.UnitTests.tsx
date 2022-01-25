import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

type CtxRunTests = () => Promise<TestSuiteRunResponse>;

type Ctx = {
  results?: TestSuiteRunResponse;
  tests?: {
    PeerNetbus: CtxRunTests;
    PeerEvents: CtxRunTests;
    PeerStrategy: CtxRunTests;
    PeerNetworkUri: CtxRunTests;
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
      PeerNetbus: () => run(import('../../web.PeerNetbus/PeerNetbus.TEST')),
      PeerEvents: () => run(import('../../web.PeerNetwork.events/PeerEvents.TEST')),
      PeerStrategy: () =>
        run(import('../../web.PeerNetwork/strategy/PeerStrategy/PeerStrategy.TEST')),
      PeerNetworkUri: () => run(import('../../web.PeerNetwork/common/util.Uri.TEST')),
    });

    // Auto-run on load.
    // await tests.PeerNetbus();
    await tests.PeerEvents();
    // await tests.PeerStrategy();
    // await tests.PeerNetworkUri();
  })

  .items((e) => {
    e.title('Run Tests');

    e.button('run: PeerNetbus', (e) => e.ctx.tests?.PeerNetbus());
    e.button('run: PeerEvents', (e) => e.ctx.tests?.PeerEvents());
    e.button('run: PeerStrategy', (e) => e.ctx.tests?.PeerStrategy());
    e.button('run: PeerNetwork URI', (e) => e.ctx.tests?.PeerNetworkUri());

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
