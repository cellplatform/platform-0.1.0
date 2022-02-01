import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { BulletList, BulletListProps } from '..';
import { k } from '../common';
import { RenderCtx, sampleBodyRendererFactory, sampleBulletRendererFactory } from './DEV.renderers';

type D = { msg: string };

type Ctx = {
  props: BulletListProps;
  renderCtx: RenderCtx;
};

const CtxUtil = {
  addItem(ctx: Ctx) {
    const items = ctx.props.items || (ctx.props.items = []);
    const data: D = { msg: `item-${items.length}` };
    items.push(data);
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.BulletList')
  .context((e) => {
    if (e.prev) return e.prev;

    const getRenderCtx = () => e.current?.renderCtx as RenderCtx;

    const ctx: Ctx = {
      props: {
        bulletEdge: 'near',
        orientation: 'vertical',
        // orientation: 'horizontal',
        bulletRenderer: sampleBulletRendererFactory(getRenderCtx),
        bodyRenderer: sampleBodyRendererFactory(getRenderCtx),
      },
      renderCtx: {
        bulletKind: 'Lines',
        bodyKind: 'Card',
        radius: 15,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    Array.from({ length: 3 }).forEach(() => CtxUtil.addItem(ctx));
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('orientation')
        .items(['vertical', 'horizontal'])
        .initial(config.ctx.props.orientation)
        .view('buttons')
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.props.orientation = current.value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bulletEdge')
        .initial(config.ctx.props.bulletEdge)
        .items(['near', 'far'])
        .pipe((e) => {
          const current = e.select.current[0];
          const edge = current.value as k.BulletEdge;
          if (e.changing) e.ctx.props.bulletEdge = edge;
        });
    });

    e.title('Debug');

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet (Kind)')
        .items(['Lines', 'Dot'])
        .initial(config.ctx.renderCtx.bulletKind)
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.renderCtx.bulletKind = current.value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('body (Kind)')
        .items(['Card', 'Vanilla'])
        .initial(config.ctx.renderCtx.bodyKind)
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.renderCtx.bodyKind = current.value;
        });
    });

    e.select((config) => {
      console.log('config.ctx.renderCtx.radius', config.ctx.renderCtx.radius);
      config
        .view('buttons')
        .title('radius')
        .items([0, 10, 15, 20])
        .initial(config.ctx.renderCtx.radius)
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.renderCtx.radius = current.value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Items');

    e.button('add', (e) => CtxUtil.addItem(e.ctx));
    e.button('clear', (e) => (e.ctx.props.items = []));

    e.hr();
  })

  .subject((e) => {
    const { items = [] } = e.ctx.props;
    const total = items.length;

    e.settings({
      host: { background: -0.04 },
      layout: total > 0 && {
        label: {
          topLeft: '<BulletList>',
          bottomRight: `Body/Sample:"${e.ctx.renderCtx.bodyKind}"`,
        },
        cropmarks: -0.2,
      },
    });

    e.render(items.length > 0 && <BulletList {...e.ctx.props} style={{}} />);
  });

export default actions;
