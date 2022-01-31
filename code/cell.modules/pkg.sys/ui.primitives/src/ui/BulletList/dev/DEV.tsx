import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { BulletList, BulletListProps } from '..';
import { k, css, color, COLORS } from '../common';
import { Card } from '../../Card';
import { renderFactory, CtxRender } from './DEV.render';

type Ctx = {
  props: BulletListProps;
  renderCtx: CtxRender;
  getRenderCtx(): CtxRender;
};

const CtxUtil = {
  addItem(ctx: Ctx) {
    const items = ctx.props.items || (ctx.props.items = []);
    const item = renderFactory(ctx.getRenderCtx);
    items.push(item);
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.BulletList')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        orientation: 'vertical',
        edge: 'near',
      },
      renderCtx: {
        bodySample: 'Card',
      },

      getRenderCtx() {
        return e.current?.renderCtx as CtxRender;
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
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
        .initial(config.ctx.props.edge)
        .items(['bullet:body', 'body:bullet'])
        .pipe((e) => {
          const current = e.select.current[0];
          const edge = current.value as k.BulletEdge;
          if (e.changing) e.ctx.props.edge = edge;
        });
    });

    e.title('Debug');

    e.select((config) => {
      config
        .view('buttons')
        .title('body sample')
        .items(['Card', 'Vanilla'])
        .initial(config.ctx.renderCtx.bodySample)
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.renderCtx.bodySample = current.value;
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
          bottomRight: `Body/Sample:"${e.ctx.renderCtx.bodySample}"`,
        },
        cropmarks: -0.2,
        border: -0.06,
      },
    });

    e.render(items.length > 0 && <BulletList {...e.ctx.props} style={{}} />);
  });

export default actions;
