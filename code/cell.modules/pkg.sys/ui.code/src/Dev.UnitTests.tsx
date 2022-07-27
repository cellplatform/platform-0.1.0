import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

const Imports = {
  CodeEditorSingleton: import('./api/CodeEditor.Singleton/TEST'),
  ConfigureTheme: import('./api/Configure/Configure.theme.TEST'),
  Events: import('./api/Events/TEST'),
  Is: import('./common/Is.TEST'),
};

type Ctx = { results?: TestSuiteRunResponse };

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
        label: '<Test.View.Results>',
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
