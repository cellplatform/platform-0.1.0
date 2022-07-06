import React from 'react';

import { DocMarkdownBlock, DocMarkdownBlockProps } from '..';
import { DevActions, ObjectView } from '../../../test';
import { SAMPLE } from './DEV.Sample';
import { COLORS } from '../common';
import { Doc } from '../../Doc';

type Ctx = {
  props: DocMarkdownBlockProps;
  debug: {
    width: number;
    sample: keyof typeof SAMPLE;
  };
};

const Util = {
  toProps(ctx: Ctx) {
    const { props } = ctx;
    const markdown = Util.toMarkdownSample(ctx);
    return { ...props, markdown };
  },

  toMarkdownSample(ctx: Ctx, options: { maxLength?: number } = {}) {
    let value = SAMPLE[ctx.debug.sample];
    if (typeof options.maxLength === 'number' && value.length > options.maxLength) {
      value = `${value.substring(0, options.maxLength).trim()}...`;
    }
    return value;
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Block.Markdown')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {},
      debug: {
        width: 720,
        // sample: 'Doc',
        sample: 'Headings',
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      const items = Object.keys(SAMPLE).map((value) => ({ label: `${value}`, value }));
      config
        .title('sample')
        .items(items)
        .initial(config.ctx.debug.sample)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.sample = e.changing?.next[0].value;
        });
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
      const data = {
        ...e.ctx.props,
        markdown: Util.toMarkdownSample(e.ctx, { maxLength: 35 }),
      };

      return (
        <ObjectView
          name={'props'}
          data={data}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const debug = e.ctx.debug;
    const props = Util.toProps(e.ctx);

    e.settings({
      actions: { width: 350 },
      host: { background: COLORS.BG },
      layout: {
        width: debug.width,
        position: [80, null, 130, null],
        cropmarks: -0.2,
        border: -0.04,
      },
    });

    e.render(
      <Doc.Fonts style={{ Scroll: true, flex: 1 }}>
        <DocMarkdownBlock {...props} />
      </Doc.Fonts>,
    );
  });

export default actions;
