import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { DocLayoutContainer, DocLayoutContainerProps } from '..';
import { COLORS, t } from '../common';
import { DevChildSample } from './DEV.ChildSample';
import { SAMPLE as DEFS } from '../../DEV.Sample.data';
import { Doc } from '../../Doc';

type Ctx = {
  sizes?: t.DocLayoutSizes;
  props: DocLayoutContainerProps;
  debug: {
    render: boolean;
    sampleBlocks: boolean;
  };
};

const Util = {
  props: {
    debug(ctx: Ctx): t.DocLayoutContainerDebug {
      const debug = ctx.props.debug || (ctx.props.debug = {});
      return DocLayoutContainer.toDebug(debug);
    },
  },

  toBlocks(ctx: Ctx) {
    const width = ctx.sizes?.column.width;
    if (!width) return [];

    const def = DEFS.SCALE;
    return Doc.toBlockElements({ def, width });
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.LayoutContainer')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        debug: {
          bg: true,
          tracelines: true,
          renderCount: true,
          columnSize: true,
        },
        onResize: (e) => change.ctx((ctx) => (ctx.sizes = e.sizes)),
      },
      debug: {
        render: true,
        sampleBlocks: false,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
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

    e.boolean('debug.bg', (e) => {
      const debug = Util.props.debug(e.ctx);
      if (e.changing) debug.bg = e.changing.next;
      e.boolean.current = debug.bg;
    });

    e.boolean('debug.tracelines', (e) => {
      const debug = Util.props.debug(e.ctx);
      if (e.changing) debug.tracelines = e.changing.next;
      e.boolean.current = debug.tracelines;
    });

    e.boolean('debug.renderCount', (e) => {
      const debug = Util.props.debug(e.ctx);
      if (e.changing) debug.renderCount = e.changing.next;
      e.boolean.current = debug.renderCount;
    });

    e.boolean('debug.columnSize', (e) => {
      const debug = Util.props.debug(e.ctx);
      if (e.changing) debug.columnSize = e.changing.next;
      e.boolean.current = debug.columnSize;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('render sample blocks', (e) => {
      if (e.changing) e.ctx.debug.sampleBlocks = e.changing.next;
      e.boolean.current = e.ctx.debug.sampleBlocks;
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
    const { debug, sizes } = e.ctx;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.LayoutContainer>',
          topRight: sizes ? `${sizes.root.width} x ${sizes.root.height} px` : undefined,
          bottomRight: sizes ? `center column: ${sizes.column.width}px` : undefined,
        },
        position: [80, 80, 130, 80],
        cropmarks: -0.2,
        border: -0.05,
      },
    });

    if (debug.render) {
      const sampleBlocks = debug.sampleBlocks;

      e.render(
        <Doc.LayoutContainer {...e.ctx.props} style={{ flex: 1 }}>
          {!sampleBlocks && <DevChildSample />}
          {sampleBlocks && <Doc.Blocks blocks={Util.toBlocks(e.ctx)} />}
        </Doc.LayoutContainer>,
      );
    }
  });

export default actions;
