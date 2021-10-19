import React from 'react';
import { DevActions, ObjectView, Test } from 'sys.ui.dev';
import { css } from '../common';

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
        const tests = await Test.bundle([import('../FsDriver.IndexedDB.TEST')]);
        const res = await tests.run();
        e.change.ctx((ctx) => (ctx.data = res));
      },
    };

    // ctx.runTests();

    return ctx;
  })

  .items((e) => {
    e.title('FsDriver: IndexedDb');
    e.button('run tests', (e) => e.ctx.runTests());
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
      base: css({ Absolute: 0, Scroll: true, padding: 30 }),
    };

    const el = (
      <div {...styles.base}>
        <ObjectView name={'unit-tests'} data={e.ctx.data} expandLevel={5} />
      </div>
    );

    e.render(el);
  });

export default actions;
