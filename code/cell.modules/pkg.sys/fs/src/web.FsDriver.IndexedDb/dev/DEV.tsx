import React from 'react';
import { DevActions, Test } from 'sys.ui.dev';
import { css, IndexedDb } from '../common';

type Ctx = {
  data: any;
  runTests(): Promise<any>;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('FsDriver.IndexedDb')
  .context((e) => {
    if (e.prev) return e.prev;

    const runTests = async () => {
      const tests = await Test.bundle('FsDriver: IndexedDb', [
        import('../FsDriver/FsDriver.TEST'),
        import('../FsIndexer/FsIndexer.TEST'),
      ]);

      return tests.run();
    };

    const ctx: Ctx = {
      data: null,
      runTests,
    };

    return ctx;
  })

  .items((e) => {
    e.title('FsDriver: IndexedDb');

    e.button('run tests', async (e) => {
      const results = await e.ctx.runTests();
      e.ctx.data = results;
    });

    e.hr(1, 0.1);

    e.button('list', async (e) => {
      const list = await IndexedDb.list();
      console.log('list', list);
    });

    e.button('delete (all)', async (e) => {
      const list = await IndexedDb.list();
      for (const item of list) {
        const name = item.name || '';
        if (name.startsWith('test.')) {
          await IndexedDb.delete(name);
        }
      }
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
      base: css({ Absolute: 0, Scroll: true, padding: 30 }),
    };

    const el = (
      <div {...styles.base}>
        <Test.View.Results data={e.ctx.data} />
      </div>
    );

    e.render(el);
  });

export default actions;
