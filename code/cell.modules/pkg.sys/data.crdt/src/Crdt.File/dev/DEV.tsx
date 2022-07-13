import React from 'react';
import { CrdtFile } from '..';
import { TestFilesystem, DevActions, ObjectView } from '../../test';
import { rx, t, Filesystem, slug } from './common';
import { DevSample, DevSampleProps } from './DEV.Sample';

import { Deploy, DeployProps } from 'vendor.cloud.vercel/lib/web/ui/Deploy';

type Ctx = {
  bus: t.EventBus;
  token: string;
  filesystem: t.TestFilesystem;
  props: DevSampleProps;
};

const Util = {
  token: {
    key: 'tmp.dev.token.vercel', // TEMP 🐷 HACK: this is not high enough security long-term to store private-keys.
    read() {
      return localStorage.getItem(Util.token.key) ?? '';
    },
    write(ctx: Ctx, token: string) {
      localStorage.setItem(Util.token.key, token);
      ctx.token = token;
      return token;
    },
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Crdt.File')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const filesystem = TestFilesystem.init({ bus });
    const instance = filesystem.instance();
    const token = Util.token.read();

    const ctx: Ctx = {
      bus,
      filesystem,
      token,
      props: { instance },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
    await ctx.filesystem.ready();
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      const instance = e.ctx.props.instance;
      const id = `${instance.id}.dev`;
      return (
        <Filesystem.PathList.Dev
          instance={{ ...instance, id }}
          margin={[12, 10, 20, 10]}
          height={100}
        />
      );
    });

    e.button('delete all', async (e) => {
      await TestFilesystem.clear(e.ctx.filesystem.fs, { all: true });
    });

    e.hr();

    e.title('Deployment');

    e.component((e) => {
      const props: DeployProps = {
        instance: e.ctx.props.instance,
        token: e.ctx.token,
      };
      return <Deploy {...props} style={{ Margin: [12, 10, 20, 10] }} />;
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'ctx'}
          data={e.ctx}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      actions: { width: 380 },
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<DevSample {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
