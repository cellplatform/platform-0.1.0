import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { DocLayoutContainer, DocLayoutContainerProps } from '..';
import { COLORS, t } from '../common';
import { DevChildSample } from './DEV.ChildSample';
import { SAMPLE as DEFS } from '../../DEV.Sample.DATA';
import { Doc } from '../../Doc';

type ContentType = 'Debug' | 'SampleDoc';

type Ctx = {
  sizes?: t.DocLayoutSizes;
  props: DocLayoutContainerProps;
  debug: {
    render: boolean;
    contentType: ContentType;
    customCalculator: boolean;
  };
};

const Util = {
  debugProp(ctx: Ctx): t.DocLayoutContainerDebug {
    const debug = ctx.props.debug || (ctx.props.debug = {});
    return DocLayoutContainer.toDebug(debug);
  },

  toProps(ctx: Ctx): DocLayoutContainerProps {
    const { debug } = ctx;
    const calculate = debug.customCalculator ? customCalculator : undefined;
    return { ...ctx.props, calculate };
  },

  toBlocks(ctx: Ctx) {
    const width = ctx.sizes?.column.width;
    if (!width) return [];

    const doc = DEFS.SCALE;
    return Doc.toBlockElements({ doc, width });
  },
};

const customCalculator: t.CalculateDocLayoutSizes = (root) => {
  const sizes = Doc.LayoutContainer.LayoutSize.calculate(root);
  if (root.width < 650) sizes.column.width = 220;
  if (root.width >= 650) sizes.column.width = root.width - 30;
  return sizes;
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
        scrollable: true,
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
        contentType: 'Debug',
        customCalculator: false,
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

    e.boolean('scrollable', (e) => {
      if (e.changing) e.ctx.props.scrollable = e.changing.next;
      e.boolean.current = e.ctx.props.scrollable;
    });

    e.hr(1, 0.1);

    e.boolean('debug.bg', (e) => {
      const debug = Util.debugProp(e.ctx);
      if (e.changing) debug.bg = e.changing.next;
      e.boolean.current = debug.bg;
    });

    e.boolean('debug.tracelines', (e) => {
      const debug = Util.debugProp(e.ctx);
      if (e.changing) debug.tracelines = e.changing.next;
      e.boolean.current = debug.tracelines;
    });

    e.boolean('debug.renderCount', (e) => {
      const debug = Util.debugProp(e.ctx);
      if (e.changing) debug.renderCount = e.changing.next;
      e.boolean.current = debug.renderCount;
    });

    e.boolean('debug.columnSize', (e) => {
      const debug = Util.debugProp(e.ctx);
      if (e.changing) debug.columnSize = e.changing.next;
      e.boolean.current = debug.columnSize;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    const contentTypes: ContentType[] = ['Debug', 'SampleDoc'];
    contentTypes.forEach((type) => {
      e.button(`render: ${type}`, (e) => (e.ctx.debug.contentType = type));
    });

    e.hr(1, 0.1);

    e.boolean('ƒ: custom size calculator', (e) => {
      if (e.changing) e.ctx.debug.customCalculator = e.changing.next;
      e.boolean.current = e.ctx.debug.customCalculator;
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
      const props = Util.toProps(e.ctx);
      const contentType = debug.contentType;

      e.render(
        <Doc.LayoutContainer {...props} style={{ flex: 1 }}>
          {contentType === 'Debug' && <DevChildSample />}
          {contentType === 'SampleDoc' && (
            <Doc.Blocks blocks={Util.toBlocks(e.ctx)} padding={{ header: 40, footer: 80 }} />
          )}
        </Doc.LayoutContainer>,
      );
    }
  });

export default actions;
