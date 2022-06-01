import React from 'react';

import { DocHeadline, DocHeadlineProps } from '..';
import { DevActions, Lorem, ObjectView, TestFilesystem } from '../../../test';
import { Filesystem, t, COLORS } from '../common';

type Ctx = {
  props: DocHeadlineProps;
  instance: t.FsViewInstance;
  fs: t.Fs;
};

const SAMPLE = {
  CATEGORY: 'conceptual framework',
  HELLO_WORLD: 'Hello World!',
  SUBTITLE: `Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world to work and play.\nBut will the next line break properly?`,
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

    const { fs, instance } = TestFilesystem.init();

    const ctx: Ctx = {
      fs,
      instance,
      props: {
        title: SAMPLE.HELLO_WORLD,
        category: 'conceptual framework',
        subtitle: SAMPLE.SUBTITLE,
      },
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
    e.title(`Filesystem`);

    e.component((e) => {
      return (
        <Filesystem.PathList.Stateful
          style={{ Margin: [5, 10, 20, 10], height: 150 }}
          instance={e.ctx.instance}
          scroll={true}
          droppable={true}
          selectable={true}
        />
      );
    });

    e.hr(1, 0.1);

    e.button('delete all (clear)', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

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
    e.settings({
      actions: { width: 350 },
      host: { background: COLORS.BG },
      layout: {
        cropmarks: -0.2,
        border: -0.04,
        width: 720,
      },
    });

    e.render(<DocHeadline {...e.ctx.props} />);
  });

export default actions;
