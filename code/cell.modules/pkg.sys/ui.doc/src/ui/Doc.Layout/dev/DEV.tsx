import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocLayout, DocLayoutProps } from '..';
import { t, DEFAULT } from '../common';

type Ctx = {
  size?: t.DomRect;
  props: DocLayoutProps;
  debug: { render: boolean };
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
        sizes: DEFAULT.sizes,
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
    e.title('Props');

    e.boolean('scrollable', (e) => {
      if (e.changing) e.ctx.props.scrollable = e.changing.next;
      e.boolean.current = e.ctx.props.scrollable;
    });

    e.boolean('tracelines', (e) => {
      if (e.changing) e.ctx.props.tracelines = e.changing.next;
      e.boolean.current = e.ctx.props.tracelines;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    // e.component((e) => {
    //   return (
    //     <MinSize.Properties
    //       size={e.ctx.size}
    //       props={e.ctx.props}
    //       style={{ MarginX: 20, MarginY: 10 }}
    //     />
    //   );
    // });

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
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<DocLayout>',
          topRight: `${size?.width ?? '-'} x ${size?.height ?? '-'} px`,
        },
        position: [150, 80],
        cropmarks: -0.2,
      },
    });

    e.render(debug.render && <DocLayout {...props} style={{ flex: 1 }} />);
  });

export default actions;
