import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { DocBlocksProps } from '..';
import { Doc } from '../../Doc';
import { SAMPLE as BLOCK_SAMPLE } from '../../Doc.Block.Markdown/dev/DEV.SAMPLE';
import { css, COLORS, DEFAULT, t } from '../common';
import { SAMPLE as IMAGE_SAMPLE } from '../../Doc.Image/dev/DEV';
import { SAMPLE as BYLINE_SAMPLE } from '../../Doc.Block.Byline/dev/DEV';
import { SAMPLE as DEFS } from '../../DEV.Sample.DATA';

type Ctx = {
  props: DocBlocksProps;
  debug: {
    sampleId: 'Sample' | 'Flows' | 'Scale';
    render: boolean;
    width: number;
  };
  onResize?: t.DocResizeHandler;
};

const Util = {
  blockSpacing(ctx: Ctx) {
    return ctx.props.blockSpacing || (ctx.props.blockSpacing = {});
  },

  padding(ctx: Ctx) {
    return ctx.props.padding || (ctx.props.padding = {});
  },

  sampleBlocks(ctx: Ctx) {
    const width = ctx.props.sizes?.column.width;
    if (!width) return;

    const elBannerImage = <Doc.Block.Image url={IMAGE_SAMPLE.sample_1.url} width={width} />;

    const elByline = (
      <Doc.Block.Byline
        version={'0.1.3 (Jun 2022)'}
        author={{ name: 'Chesterton Fogg', avatar: BYLINE_SAMPLE.avatarUrl }}
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

    const elBlock = <Doc.Block.Markdown markdown={BLOCK_SAMPLE.Doc} />;

    const elImage = (
      <Doc.Block.Image
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
    const doc = Util.toDef(ctx);
    return doc ? Doc.toBlockElements({ doc, width }) : [];
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Blocks')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        tracelines: true,
        // tracelines: false,
        padding: { header: undefined, footer: DEFAULT.padding.footer },
        blockSpacing: { y: DEFAULT.blockspacing.y },
        onBlockClick: (e) => console.log('⚡️ onBlockClick:', e),
      },
      debug: {
        render: true,
        width: 720,
        // sampleId: 'Sample',
        // sampleId: 'Flows',
        sampleId: 'Scale',
      },
      onResize: (e) => change.ctx((ctx) => (ctx.props.sizes = e.sizes)),
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
    const { props, debug } = e.ctx;
    const sizes = props.sizes;
    const def = Util.toDef(e.ctx);

    const rootWidth = sizes?.root.width ?? '-';
    const rootHeight = sizes?.root.height ?? '-';
    const columnWidth = sizes?.column.width ?? '-';
    const topRight = `${rootWidth} x ${rootHeight} px (column: ${columnWidth} px)`;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.Blocks>',
          topRight,
          bottomLeft: def ? `path: ${def.path}` : undefined,
        },
        position: [80, 80, 130, 80],
        cropmarks: -0.2,
        border: -0.05,
      },
    });

    if (debug.render) {
      const blocks = Util.toBlocks(e.ctx);

      const styles = {
        base: css({ flex: 1, position: 'relative' }),
        container: css({ Absolute: 0, pointerEvents: 'none' }),
        blocks: css({ Absolute: 0, Scroll: true, display: 'flex' }),
      };

      /**
       * NOTE: example usage, as visual backdrop only (in constrast to being the parent element itself).
       */
      e.render(
        <Doc.Fonts style={styles.base}>
          <Doc.LayoutContainer debug={false} style={styles.container} onResize={e.ctx.onResize} />
          <div {...styles.blocks}>
            <Doc.Blocks {...props} blocks={blocks} style={{ flex: 1 }} />
          </div>
        </Doc.Fonts>,
      );
    }
  });

export default actions;
