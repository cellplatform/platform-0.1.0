import React from 'react';

import { COLORS, css, Filesystem, t } from '../../common';
import { DevActions, TestFilesystem } from '../../test';

type Ctx = {
  instance: t.FsViewInstance;
  fs: t.Fs;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Sample.Design')
  .context((e) => {
    if (e.prev) return e.prev;

    const filesystem = TestFilesystem.init();
    const instance = filesystem.instance();
    const fs = filesystem.fs;

    const ctx: Ctx = { instance, fs };

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
      return (
        <Filesystem.PathList.Stateful
          style={{ Margin: [5, 10, 20, 10], height: 150 }}
          instance={e.ctx.instance}
          scrollable={true}
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

  .subject((e) => {
    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Design>',
          bottomRight: `filesystem: "${e.ctx.instance.fs}"`,
        },
        position: [80, 80],
        cropmarks: -0.2,
        border: -0.06,
        // background: 0.3,
        background: 1,
      },
    });

    const styles = {
      base: css({
        flex: 1,
        backgroundImage: `url(https://tdb-4xnugeivt-tdb.vercel.app/design.png)`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }),
    };

    const el = <div {...styles.base}></div>;

    e.render(el);
  });

export default actions;
