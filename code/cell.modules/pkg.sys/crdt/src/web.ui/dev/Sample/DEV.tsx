import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { TestNetwork } from '../../../web.test';
import { Sample, SampleProps } from './DEV.Sample';
import { Doc } from './DEV.types';

type Ctx = {
  total: number;
  props: SampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {}, total: 3 };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) =>
      config
        .title('Total Peers:')
        .label('peers')
        .items([1, 2, 3, 4])
        .initial(config.ctx.total)
        .pipe((e) => {
          const current = e.select.current[0]; // NB: always first.
          const total = current.value;
          e.select.label = total === 1 ? '1 peer' : `${total} peers`;
          e.ctx.total = total;
        }),
    );

    e.button('start network', async (e) => {
      const total = e.ctx.total;
      const initial: Doc = { count: 0 };
      const mesh = await TestNetwork<Doc>({ total, initial, debounce: 300 });

      const docs = await mesh.docs('my-id');
      e.ctx.props.docs = docs;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: false },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
