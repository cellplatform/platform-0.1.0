import React from 'react';
import { DevActions, ObjectView, TestFilesystem } from '../../test';
import { css, COLORS, Color, t, Filesystem } from '../../common';

type Ctx = {
  instance: t.FsViewInstance;
  fs: t.Fs;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Design')
  .context((e) => {
    if (e.prev) return e.prev;

    const { fs, instance } = TestFilesystem.init();

    const ctx: Ctx = {
      instance,
      fs,
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Design');

    e.hr();
  })

  .items((e) => {
    e.title(`Filesystem`);

    e.component((e) => {
      const change = e.change;
      return (
        <Filesystem.PathList.Stateful
          style={{ Margin: [5, 10, 20, 10], height: 150 }}
          instance={e.ctx.instance}
          scroll={true}
          droppable={true}
          selectable={true}
          onStateChange={(e) => {
            console.group('🌳 ');
            console.log('<FsPathList> State Change');
            console.log('e', e);
            console.groupEnd();
          }}
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

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Design>',
          bottomRight: `filesystem: "${e.ctx.instance.fs}"`,
        },
        position: [80, 80],
        cropmarks: -0.2,
        border: -0.06,
        background: 0.3,
      },
    });

    const styles = {
      base: css({
        flex: 1,
        backgroundImage: `url(/static/tmp.images/design.png)`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }),
    };

    const el = <div {...styles.base}></div>;

    e.render(el);
  });

export default actions;
