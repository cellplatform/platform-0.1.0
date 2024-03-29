import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Deploy, DeployProps } from 'vendor.cloud.vercel/lib/web/ui/Deploy';

import { TestFilesystem } from 'sys.fs/lib/web/test/Test.Filesystem';
import { t } from '../common';

type Ctx = {
  fs: t.Fs;
  props: DeployProps;
};

const Util = {
  token: {
    key: 'tmp.dev.token.vercel', // TEMP 🐷 HACK: this is not high enough security long-term to store private-keys.
    read() {
      return localStorage.getItem(Util.token.key) ?? '';
    },
    write(ctx: Ctx, token: string) {
      localStorage.setItem(Util.token.key, token);
      ctx.props.token = token;
      return token;
    },
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('DEV.Sample.Deploy')
  .context((e) => {
    if (e.prev) return e.prev;

    const filesystem = TestFilesystem.init();
    const instance = filesystem.instance();
    const token = Util.token.read();

    const ctx: Ctx = {
      fs: filesystem.fs,
      props: {
        instance,
        token,
        team: 'tdb',
        project: 'tdb-tmp',
        domain: 'tmp.db.team',
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.button('filesystem: delete all', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

    e.hr(1, 0.1);

    e.textbox((config) =>
      config.placeholder('set api token').pipe((e) => {
        if (e.changing?.action === 'invoke') {
          const next = e.changing.next || '';
          Util.token.write(e.ctx, next);
          e.redraw();
        }
      }),
    );

    e.hr();

    e.component((e) => {
      const token = e.ctx.props.token;
      const props = { ...e.ctx.props, token: token ? '********' : undefined };
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
    e.settings({
      host: { background: -0.04 },
      layout: {
        position: [100, null, null, null],
        cropmarks: 0,
      },
    });

    e.render(<Deploy {...e.ctx.props} />);
  });

export default actions;
