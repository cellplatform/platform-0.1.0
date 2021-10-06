import React from 'react';
import { DevActions, ObjectView, Test } from 'sys.ui.dev';
import { css } from '../common';

// import tests from './sample.TEST';

type Ctx = {
  data: any;
  runTests(): Promise<void>;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('FsDriver.IndexedDb')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      data: null,
      async runTests() {
        // const tests =
        // const res = await tests.run();
        // e.change.ctx((ctx) => (ctx.data = res));
      },
    };

    ctx.runTests();

    return ctx;
  })

  .items((e) => {
    e.title('FsDriver: IndexedDb');

    e.button('run tests', async (e) => {
      const tests = await Test.bundle([import('../FsDriver.IndexedDB.TEST')]);

      e.ctx.data = await tests.run();
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

    const styles = {
      base: css({ padding: 30 }),
    };

    const el = (
      <div {...styles.base}>
        <ObjectView name={'unit-tests'} data={e.ctx.data} />
      </div>
    );

    e.render(el);
  });

export default actions;
