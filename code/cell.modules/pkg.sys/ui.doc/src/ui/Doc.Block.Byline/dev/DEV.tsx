import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocBylineBlock, DocBylineProps } from '..';
import { COLORS, t, PropList } from '../common';

type Ctx = {
  props: DocBylineProps;
  debug: { width: number; whiteBg: boolean };
};

export const SAMPLE = {
  avatarUrl: 'https://tdb-4wu2h9jfp-tdb.vercel.app/avatar.png',
  signatureUrl: 'https://tdb-boie1kfi2-tdb.vercel.app/signature.png',
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
        version: '0.1.6 (Jan 2050)',
        author: {
          name: 'Display Name',
          avatar: SAMPLE.avatarUrl,
          signature: SAMPLE.signatureUrl,
        },
        parts: DocBylineBlock.DEFAULT.parts,
      },
      debug: { width: 720, whiteBg: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.component((e) => {
      type F = t.DocBylinePart;
      return (
        <PropList.FieldSelector
          title={'Parts'}
          all={DocBylineBlock.ALL.parts}
          selected={e.ctx.props.parts}
          onClick={({ next }) => e.change.ctx((ctx) => (ctx.props.parts = next as F[]))}
          style={{ Margin: [15, 15, 10, 15] }}
        />
      );
    });

    e.button(
      'sample: identity and signature',
      (e) => (e.ctx.props.parts = ['Doc.Identity', 'Doc.Author.Signature']),
    );

    e.button(
      'sample: signature and identity',
      (e) => (e.ctx.props.parts = ['Doc.Author.Signature', 'Doc.Identity']),
    );

    e.button('sample: identity (on right)', (e) => (e.ctx.props.parts = ['Space', 'Doc.Identity']));

    e.button(
      'sample: signature (on right)',
      (e) => (e.ctx.props.parts = ['Space', 'Doc.Author.Signature']),
    );

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
