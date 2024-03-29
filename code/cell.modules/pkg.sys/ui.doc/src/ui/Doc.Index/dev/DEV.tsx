import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocIndex, DocIndexProps } from '..';
import { COLORS, t } from '../common';
import { SAMPLE } from '../../DEV.Sample.DATA';

type Ctx = {
  sizes?: t.DocLayoutSizes;
  props: DocIndexProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Index')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        items: SAMPLE.defs,
        debug: true,
        onResize: (e) => change.ctx((ctx) => (ctx.sizes = e.sizes)),
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('debug (tracelines)', (e) => {
      if (e.changing) e.ctx.props.debug = e.changing.next;
      e.boolean.current = e.ctx.props.debug;
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
    const { props, sizes } = e.ctx;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.Index>',
          topRight: sizes ? `${sizes.root.width} x ${sizes.root.height} px` : undefined,
          bottomRight: sizes ? `center column: ${sizes.column.width}px` : undefined,
        },
        position: [80, 80, 120, 80],
        cropmarks: -0.2,
        border: -0.04,
      },
    });

    e.render(<DocIndex {...props} style={{ flex: 1 }} />);
  });

export default actions;
