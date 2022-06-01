import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { DocLayoutProps } from '..';
import { Doc } from '../../Doc';
import { SAMPLE as BLOCK_SAMPLE } from '../../Doc.Block/dev/DEV.Sample';
import { COLORS, DEFAULT, t } from '../common';
import { SAMPLE } from '../../Doc.Image/dev/DEV';

type Ctx = {
  size?: t.DomRect;
  props: DocLayoutProps;
  debug: { render: boolean; width: number };
};

const Util = {
  blockSpacing(ctx: Ctx) {
    return ctx.props.blockSpacing || (ctx.props.blockSpacing = {});
  },

  blocks(ctx: Ctx) {
    const width = ctx.debug.width;

    const elBannerImage = <Doc.Image url={SAMPLE.URL} width={width} />;

    const elHeadline = (
      <Doc.Headline
        style={{ marginBottom: 100 }}
        category={'conceptual framework'}
        title={'Hello world!'}
        subtitle={
          'Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world. But are we importing a core concept from our existing paradigm without realising it?'
        }
      />
    );

    const elBlock = <Doc.Block markdown={BLOCK_SAMPLE.MARKDOWN} />;

    const elByline = <Doc.Byline />;

    return [elBannerImage, elHeadline, elByline, elBlock];
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Layout')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        scrollable: true,
        tracelines: true,
        footerPadding: DEFAULT.footerPadding,
        blockSpacing: { y: DEFAULT.blockspacing.y },
        onResize: (e) => change.ctx((ctx) => (ctx.size = e.size)),
        onBlockClick: (e) => console.log('⚡️ onBlockClick:', e),
      },
      debug: { render: true, width: 720 },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    ctx.props.blocks = Util.blocks(ctx);
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });
    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.boolean('scrollable', (e) => {
      if (e.changing) e.ctx.props.scrollable = e.changing.next;
      e.boolean.current = e.ctx.props.scrollable;
    });

    e.boolean('footerPadding', (e) => {
      if (e.changing) e.ctx.props.footerPadding = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.footerPadding);
    });

    e.boolean('blockSpacing.y', (e) => {
      const blockSpacing = Util.blockSpacing(e.ctx);
      if (e.changing) blockSpacing.y = e.changing.next ? 15 : 0;
      e.boolean.current = Boolean(blockSpacing.y);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('tracelines', (e) => {
      if (e.changing) e.ctx.props.tracelines = e.changing.next;
      e.boolean.current = e.ctx.props.tracelines;
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { props, debug, size } = e.ctx;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.Layout>',
          topRight: `${size?.width ?? '-'} x ${size?.height ?? '-'} px`,
        },
        position: [80, 80, 130, 80],
        cropmarks: -0.2,
        border: -0.05,
      },
    });

    e.render(debug.render && <Doc.Layout {...props} style={{ flex: 1 }} />);
  });

export default actions;
