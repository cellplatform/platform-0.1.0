import React from 'react';
import { DevActions, ObjectView } from '../..';

type Ctx = {
  value?: any;
  texture: boolean;
  position?: number | [number, number] | [number, number, number, number];
  secondItemFill: boolean;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test/sample-4')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      value: 0,
      texture: true,
      secondItemFill: true,
      position: [200, 150],
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('background texture', (e) => {
      if (e.changing) e.ctx.texture = e.changing.next;
      e.boolean.current = e.ctx.texture;
    });

    e.boolean('second item (fill)', (e) => {
      if (e.changing) e.ctx.secondItemFill = e.changing.next;
      e.boolean.current = e.ctx.secondItemFill;
    });

    e.hr(1, 0.1);

    e.select((config) => {
      config
        .view('buttons')
        .title('title `markdown`, *foo* **bold** <T> {P} | values test:')
        .items([0, 1, 2, { label: '<undefined>', value: undefined }])
        .initial(config.ctx.value)
        .initial(undefined)
        .pipe((e) => {
          if (e.changing) e.ctx.value = e.changing?.next[0]?.value;
          const current = e.select.current[0];
        });
    });

    e.hr(1, 0.1);

    const position = (label: string, value: Ctx['position']) => {
      e.button(`position: ${label}`, (e) => (e.ctx.position = value));
    };

    position('<undefined>', undefined);
    position('0', 0);
    position('[0, 0]', [0, 0]);
    position('[200, 150]', [200, 150]);

    e.hr();
  })

  .subject((e) => {
    const TEXTURE =
      'https://images.unsplash.com/photo-1521459467264-802e2ef3141f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3024&q=80';

    const showTexture = e.ctx.texture;

    e.settings({
      host: { background: showTexture ? `url(${TEXTURE})` : -0.04 },
      layout: {
        label: '<Sample4>',
        position: e.ctx.position,
        border: showTexture ? 0.6 : -0.1,
        cropmarks: showTexture ? 0.8 : -0.2,
        background: showTexture ? 0.6 : 1,
        labelColor: showTexture ? 1 : -0.4,
      },
    });

    if (e.ctx.secondItemFill) {
      const el = <div style={{ flex: 1, backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */ }}></div>;
      e.render(el, { position: 0, border: 0, cropmarks: 0 });
    }

    const elMain = (
      <div style={{ padding: 30, flex: 1, backdropFilter: `blur(2px)` }}>
        <ObjectView name={'ctx'} data={e.ctx} />
      </div>
    );
    e.render(elMain);
  });

export default actions;
