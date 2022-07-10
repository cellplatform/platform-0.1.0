import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocBylineBlock, DocBylineProps } from '..';
import { COLORS } from '../common';

type Ctx = {
  props: DocBylineProps;
  debug: { width: number; whiteBg: boolean };
};

export const SAMPLE = {
  avatarUrl: 'https://tdb-4wu2h9jfp-tdb.vercel.app/avatar.png',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Byline')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        align: 'Left',
        version: '0.1.6 (Jan 2050)',
        author: { name: 'Display Name', avatar: SAMPLE.avatarUrl },
      },
      debug: { width: 720, whiteBg: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('align')
        .items(DocBylineBlock.ALL.align.map((value) => ({ label: `align: ${value}`, value })))
        .initial(config.ctx.props.align)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.align = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.markdown(`Divider:`);
    e.button('<none>', (e) => (e.ctx.props.divider = undefined));

    e.button('5px grey, spacing: 30', (e) => {
      e.ctx.props.divider = { thickness: 5, opacity: 0.1, spacing: 30 };
    });

    e.button('1px magenta, spacing: 15', (e) => {
      e.ctx.props.divider = { thickness: 1, opacity: 0.4, color: COLORS.MAGENTA, spacing: 15 };
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('white backdrop', (e) => {
      if (e.changing) e.ctx.debug.whiteBg = e.changing.next;
      e.boolean.current = e.ctx.debug.whiteBg;
    });

    e.hr(1, 0.1);

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
          expandLevel={3}
        />
      );
    });
  })

  .subject((e) => {
    const debug = e.ctx.debug;

    e.settings({
      actions: { width: 350 },
      host: { background: debug.whiteBg ? 1 : COLORS.BG },
      layout: {
        width: debug.width,
        cropmarks: -0.2,
      },
    });

    e.render(<DocBylineBlock {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
