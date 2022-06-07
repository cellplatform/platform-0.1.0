import React from 'react';

import { DocHeadline, DocHeadlineProps } from '..';
import { DevActions, Lorem, ObjectView } from '../../../test';
import { Filesystem, t, COLORS } from '../common';

type Ctx = {
  props: DocHeadlineProps;
  debug: { width: number };
};

const SAMPLE = {
  CATEGORY: 'conceptual framework',
  HELLO_WORLD: 'Hello World!',
  SUBTITLE: `Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world.\nBut will the next line break properly?`,
  OLD_POND: `Old pond. A frog jumps in.\nThe sound of water.`,
  LOREM: Lorem.toString(),
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Headline')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: {
        title: SAMPLE.HELLO_WORLD,
        category: 'conceptual framework',
        subtitle: SAMPLE.SUBTITLE,
      },
      debug: { width: 720 },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.button('redraw', (e) => e.redraw());
    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.hr(1, 0.1);

    e.button('category: <undefined>', (e) => (e.ctx.props.category = undefined));
    e.button(`category: "${SAMPLE.CATEGORY}"`, (e) => (e.ctx.props.category = SAMPLE.CATEGORY));
    e.button('category: long', (e) => (e.ctx.props.category = SAMPLE.LOREM));

    e.hr(1, 0.1);

    e.button('title: <undefined>', (e) => (e.ctx.props.title = undefined));
    e.button('title: "Hello World!"', (e) => (e.ctx.props.title = SAMPLE.HELLO_WORLD));
    e.button('title: line break', (e) => (e.ctx.props.title = SAMPLE.OLD_POND));
    e.button('title: long', (e) => (e.ctx.props.title = SAMPLE.LOREM));

    e.hr(1, 0.1);

    e.button('subtitle: <undefined>', (e) => (e.ctx.props.subtitle = undefined));

    e.button('subtitle: sample', (e) => (e.ctx.props.subtitle = SAMPLE.SUBTITLE));
    e.button('subtitle: long', (e) => (e.ctx.props.subtitle = SAMPLE.LOREM));

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      config
        .items([720, 300].map((value) => ({ label: `width: ${value}px`, value })))
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
    const width = debug.width;

    e.settings({
      host: { background: COLORS.BG },
      actions: { width: 350 },
      layout: {
        width,
        cropmarks: -0.2,
        border: -0.04,
      },
    });

    e.render(<DocHeadline {...e.ctx.props} hint={{ width }} />);
  });

export default actions;
