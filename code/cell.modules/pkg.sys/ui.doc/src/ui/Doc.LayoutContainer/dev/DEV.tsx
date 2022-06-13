import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocLayoutContainer, DocLayoutContainerProps } from '..';
import { COLORS, t } from '../common';
import { DevChildSample } from './DEV.ChildSample';

type Ctx = {
  sizes?: t.DocLayoutSizes;
  props: DocLayoutContainerProps;
  debug: { render: boolean };
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
        tracelines: true,
        onResize: (e) => change.ctx((ctx) => (ctx.sizes = e.sizes)),
      },
      debug: { render: true },
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
      e.render(
        <DocLayoutContainer {...e.ctx.props} style={{ flex: 1 }}>
          <DevChildSample />
        </DocLayoutContainer>,
      );
    }
  });

export default actions;
