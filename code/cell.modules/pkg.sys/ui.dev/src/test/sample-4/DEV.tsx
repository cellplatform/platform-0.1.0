import React from 'react';
import { DevActions, ObjectView } from '../..';

type Ctx = { value?: any; texture: boolean };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test/sample-4')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { value: 0, texture: false };
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

    e.boolean('texture', (e) => {
      if (e.changing) e.ctx.texture = e.changing.next;
      e.boolean.current = e.ctx.texture;
    });

    e.hr();
  })

  .subject((e) => {
    const TEXTURE =
      'https://images.unsplash.com/photo-1521459467264-802e2ef3141f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3024&q=80';

    e.settings({
      host: {
        background: e.ctx.texture ? `url(${TEXTURE})` : -0.04,
      },
      layout: {
        label: '<Sample4>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: e.ctx.texture ? 0.6 : 1,
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
