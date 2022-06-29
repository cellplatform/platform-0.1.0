import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocImage, DocImageProps } from '..';
import { COLORS } from '../common';

type Ctx = {
  props: DocImageProps;
  debug: { width: number };
};

export const SAMPLE = {
  URL: `https://images.unsplash.com/photo-1511798616182-aab3698ac53e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2176&q=80`,
  CREDIT: 'Photo by John Fowler on Unsplash',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Image')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        url: SAMPLE.URL,
        borderRadius: DocImage.DEFAULT.borderRadius,
        credit: SAMPLE.CREDIT,
      },
      debug: { width: 720 },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      config
        .items([300, 720].map((value) => ({ label: `width: ${value}px`, value })))
        .initial(720)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.width = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.boolean('borderRadius', (e) => {
      if (e.changing) {
        e.ctx.props.borderRadius = e.changing.next ? DocImage.DEFAULT.borderRadius : 0;
      }
      e.boolean.current = Boolean(e.ctx.props.borderRadius);
    });

    e.boolean('credit', (e) => {
      if (e.changing) e.ctx.props.credit = e.changing.next ? SAMPLE.CREDIT : undefined;
      e.boolean.current = Boolean(e.ctx.props.credit);
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
    const debug = e.ctx.debug;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        width: debug.width,
        cropmarks: -0.2,
      },
    });
    e.render(<DocImage {...e.ctx.props} width={debug.width} />);
  });

export default actions;
