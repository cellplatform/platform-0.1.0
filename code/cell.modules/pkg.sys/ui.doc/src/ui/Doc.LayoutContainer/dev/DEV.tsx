import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocLayoutContainer, DocLayoutContainerProps } from '..';
import { COLORS, t } from '../common';

type Ctx = {
  size?: t.DomRect;
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
        onResize: (e) => change.ctx((ctx) => (ctx.size = e.size)),
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
    const { props, debug, size } = e.ctx;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.LayoutContainer>',
          topRight: `${size?.width ?? '-'} x ${size?.height ?? '-'} px`,
        },
        position: [80, 80, 130, 80],
        cropmarks: -0.2,
        border: -0.05,
      },
    });

    e.render(debug.render && <DocLayoutContainer {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
