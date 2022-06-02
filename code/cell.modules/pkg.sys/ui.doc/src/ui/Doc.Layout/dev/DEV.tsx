import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { DocLayoutProps } from '..';
import { Doc } from '../../Doc';
import { SAMPLE as BLOCK_SAMPLE } from '../../Doc.Block/dev/DEV.Sample';
import { COLORS, DEFAULT, t } from '../common';
import { SAMPLE as IMAGE_SAMPLE } from '../../Doc.Image/dev/DEV';
import { SAMPLE as BYLINE_SAMPLE } from '../../Doc.Byline/dev/DEV';
import { SAMPLE as DEFS } from '../../DEV.Sample.data';

type Ctx = {
  size?: t.DomRect;
  props: DocLayoutProps;
  debug: {
    sampleId: 'Sample' | 'Flows' | 'Scale';
    render: boolean;
    width: number;
  };
};

const Util = {
  blockSpacing(ctx: Ctx) {
    return ctx.props.blockSpacing || (ctx.props.blockSpacing = {});
  },

  padding(ctx: Ctx) {
    return ctx.props.padding || (ctx.props.padding = {});
  },

  sampleBlocks(ctx: Ctx) {
    const width = ctx.debug.width;

    const elBannerImage = <Doc.Image url={IMAGE_SAMPLE.URL} width={width} />;

    const elByline = (
      <Doc.Byline
        version={'0.1.3 (Jun 2022)'}
        author={{ name: 'Philious Fogg', avatar: BYLINE_SAMPLE.avatarUrl }}
        style={{ marginBottom: 60 }}
      />
    );

    const elHeadline = (
      <Doc.Headline
        style={{ marginBottom: 50 }}
        category={'conceptual framework'}
        title={'Hello world!'}
        subtitle={
          'Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world. But are we importing a core concept from our existing paradigm without realising it?'
        }
      />
    );

    const elBlock = <Doc.Block markdown={BLOCK_SAMPLE.MARKDOWN} />;

    const elImage = (
      <Doc.Image
        url={'https://tdb-2cxz9824d-tdb.vercel.app/image.png'}
        credit={'Tyler Durden'}
        width={width}
      />
    );

    return [
      // Content Order:
      elBannerImage,
      elByline,
      elHeadline,
      elBlock,
      elImage,
    ];
  },

  toDef(ctx: Ctx) {
    const key = ctx.debug.sampleId;

    if (key === 'Flows') return DEFS.FLOWS;
    if (key === 'Scale') return DEFS.SCALE;
    return undefined;
  },

  toBlocks(ctx: Ctx) {
    const key = ctx.debug.sampleId;
    if (key === 'Sample') return Util.sampleBlocks(ctx);

    const width = ctx.debug.width;
    const def = Util.toDef(ctx);
    return def ? Doc.toBlockElements({ def, width }) : [];
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
        // tracelines: true,
        tracelines: false,
        padding: { header: undefined, footer: DEFAULT.padding.footer },
        blockSpacing: { y: DEFAULT.blockspacing.y },
        onResize: (e) => change.ctx((ctx) => (ctx.size = e.size)),
        onBlockClick: (e) => console.log('⚡️ onBlockClick:', e),
      },
      debug: {
        render: true,
        width: 720,
        // sampleId: 'Sample',
        // sampleId: 'Flows',
        sampleId: 'Scale',
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    ctx.props.blocks = Util.sampleBlocks(ctx);
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.hr(1, 0.1);

    e.select((config) => {
      const ITEMS: Ctx['debug']['sampleId'][] = ['Sample', 'Flows', 'Scale'];
      config
        .items(ITEMS.map((value) => ({ label: `content: "${value}"`, value })))
        .initial(config.ctx.debug.sampleId)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.sampleId = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.boolean('scrollable', (e) => {
      if (e.changing) e.ctx.props.scrollable = e.changing.next;
      e.boolean.current = e.ctx.props.scrollable;
    });

    e.boolean('blockSpacing.y', (e) => {
      const blockSpacing = Util.blockSpacing(e.ctx);
      if (e.changing) blockSpacing.y = e.changing.next ? 15 : 0;
      e.boolean.current = Boolean(blockSpacing.y);
    });

    e.hr(1, 0.1);

    e.boolean('padding.header', (e) => {
      const padding = Util.padding(e.ctx);
      if (e.changing) padding.header = e.changing.next;
      e.boolean.current = Boolean(padding.header);
    });

    e.boolean('padding.footer', (e) => {
      const padding = Util.padding(e.ctx);
      if (e.changing) padding.footer = e.changing.next;
      e.boolean.current = Boolean(padding.footer);
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
    const def = Util.toDef(e.ctx);

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.Layout>',
          topRight: `${size?.width ?? '-'} x ${size?.height ?? '-'} px`,
          bottomLeft: def ? `path: ${def.path}` : undefined,
        },
        position: [80, 80, 130, 80],
        cropmarks: -0.2,
        border: -0.05,
      },
    });

    if (debug.render) {
      const blocks = Util.toBlocks(e.ctx);
      e.render(<Doc.Layout {...props} blocks={blocks} style={{ flex: 1 }} />);
    }
  });

export default actions;
