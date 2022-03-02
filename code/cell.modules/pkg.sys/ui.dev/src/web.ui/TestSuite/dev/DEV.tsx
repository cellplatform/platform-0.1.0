import React from 'react';
import { DevActions } from '../../..';

import { Test } from '..';
import tests from './test.samples/foo.TEST';
import { DevLayout } from './DEV.Layout';
import { ResultsProps } from '../Results';

type Ctx = { props: ResultsProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.dev.TestSuite')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: { scroll: true } };
    return ctx;
  })

  .items((e) => {
    e.title('TestSuite');

    e.boolean('scroll', (e) => {
      if (e.changing) e.ctx.props.scroll = e.changing.next;
      e.boolean.current = e.ctx.props.scroll;
    });

    e.hr();

    e.button('run: static import', async (e) => {
      e.ctx.props.data = await tests.run();
    });

    e.button('run: dynamic imports', async (e) => {
      const root = await Test.bundle([
        import('./test.samples/foo.TEST'),
        import('./test.samples/bar.TEST'),
      ]);
      e.ctx.props.data = await root.run();
    });

    e.hr(1, 0.1);
    e.button('clear', (e) => (e.ctx.props.data = undefined));
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
    e.render(<DevLayout results={e.ctx.props} />);
  });

export default actions;
