import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocByline, DocBylineProps } from '..';
import { COLORS } from '../common';

type Ctx = {
  props: DocBylineProps;
  debug: { width: number };
};

export const SAMPLE = {
  avatarUrl: '/static/.tmp.images/avatar.png',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Byline')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: { avatarUrl: SAMPLE.avatarUrl },
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
        border: -0.04,
      },
    });

    e.render(<DocByline {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
