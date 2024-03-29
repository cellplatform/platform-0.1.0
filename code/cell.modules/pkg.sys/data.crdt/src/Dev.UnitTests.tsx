import React from 'react';
import { DevActions, Test, TestFilesystem } from './test';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

const Imports = {
  Automerge: import('./lib.Automerge/Automerge.lib.TEST'),
  AutomergeDoc: import('./lib.Automerge/AutomergeDoc.TEST'),
  CrdtBus: import('./Crdt.Bus/TEST'),
};

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
    e.ctx.results = await Test.run(Object.values(Imports));
  })

  .items((e) => {
    e.title('Run Tests');

    e.button('all', async (e) => {
      e.ctx.results = await Test.run(Object.values(Imports));
    });

    e.hr(1, 0.1);

    Object.keys(Imports).forEach((key) => {
      e.button(`run: ${key}`, async (e) => (e.ctx.results = await Test.run(Imports[key])));
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Test.View.Results>',
          bottomLeft: `filesystem: "${TestFilesystem.id}"`,
        },
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
