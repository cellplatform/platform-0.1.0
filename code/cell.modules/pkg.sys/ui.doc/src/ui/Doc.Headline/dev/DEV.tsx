import React from 'react';

import { DocHeadline, DocHeadlineProps } from '..';
import { DevActions, ObjectView, TestFilesystem, Lorem } from '../../../test';
import { Filesystem, t } from '../common';

type Ctx = {
  props: DocHeadlineProps;
  instance: t.FsViewInstance;
  fs: t.Fs;
};

const SAMPLE = {
  SUBITLE: `Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world to work and play.\nBut will the next line break properly?`,
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
        title: 'Hello world!',
        category: 'conceptual framework',
        subtitle: SAMPLE.SUBITLE,
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
    e.button('category: "conceptual framework"', (e) => {
      e.ctx.props.category = 'conceptual framework';
    });
    e.button('category: long', (e) => (e.ctx.props.category = Lorem.toString()));

    e.hr(1, 0.1);

    e.button('title: <undefined>', (e) => (e.ctx.props.title = undefined));
    e.button('title: "Hello World!"', (e) => (e.ctx.props.title = 'Hello world!'));
    e.button('title: line break', (e) => {
      e.ctx.props.title = `Old pond. A frog jumps in.\nThe sound of water.`;
    });
    e.button('title: long', (e) => (e.ctx.props.title = Lorem.toString()));

    e.hr(1, 0.1);

    e.button('subtitle: <undefined>', (e) => (e.ctx.props.subtitle = undefined));

    e.button('subtitle: sample', (e) => {
      e.ctx.props.subtitle = SAMPLE.SUBITLE;
    });
    e.button('subtitle: long', (e) => (e.ctx.props.subtitle = Lorem.toString()));

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
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
        width: 720,
      },
    });

    e.render(<DocHeadline {...e.ctx.props} />);
  });

export default actions;
