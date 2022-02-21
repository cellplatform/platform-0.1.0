import React from 'react';
import { DevActions, ObjectView } from '../..';

type Ctx = { value?: any };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test/sample-4')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { value: 0 };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      config
        .view('buttons')
        .title(`foo *bold* <T> {P}`)
        .items([0, 1, 2, { label: '<undefined>', value: undefined }])
        .initial(config.ctx.value)
        .initial(undefined)
        // .multi(true)
        .pipe((e) => {
          if (e.changing) e.ctx.value = e.changing?.next[0]?.value;
          const current = e.select.current[0];
        });
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Sample4>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const el = (
      <div style={{ padding: 30 }}>
        <ObjectView name={'ctx'} data={e.ctx} />
      </div>
    );
    e.render(el);
  });

export default actions;
