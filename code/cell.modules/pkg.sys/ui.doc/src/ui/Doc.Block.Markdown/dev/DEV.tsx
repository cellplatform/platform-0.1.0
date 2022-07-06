import React from 'react';

import { DocMarkdownBlock, DocMarkdownBlockProps } from '..';
import { DevActions, ObjectView } from '../../../test';
import { SAMPLE } from './DEV.Sample';
import { COLORS, css } from '../common';

type Ctx = {
  props: DocMarkdownBlockProps;
  debug: { width: number };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Block.Markdown')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: { markdown: SAMPLE.MARKDOWN },
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
      const markdown = e.ctx.props.markdown ?? '';
      const props = {
        ...e.ctx.props,
        markdown: markdown ? `${markdown.substring(0, 50)}...` : undefined,
      };
      return (
        <ObjectView
          name={'props'}
          data={props}
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
        position: [80, null, 130, null],
        cropmarks: -0.2,
        border: -0.04,
      },
    });

    const styles = { base: css({ Scroll: true }) };

    e.render(
      <div {...styles.base}>
        <DocMarkdownBlock {...e.ctx.props} />
      </div>,
    );
  });

export default actions;
