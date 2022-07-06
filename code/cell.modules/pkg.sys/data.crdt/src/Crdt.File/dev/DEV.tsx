import React from 'react';
import { CrdtFile } from '..';
import { TestFilesystem, DevActions, ObjectView } from '../../test';
import { rx, t, Filesystem } from './common';
import { DevSample, DevSampleProps } from './DEV.Sample';

import { Deploy, DeployProps } from 'vendor.cloud.vercel/lib/web/ui/Deploy';

type Ctx = {
  bus: t.EventBus;
  token: string;
  filesystem: TestFilesystem;
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

    const ctx: Ctx = {
      bus,
      token: Util.token.read(),
      filesystem,
      props: {},
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
      const instance = e.ctx.filesystem.instance;
      const id = `${instance.id}.dev`;
      return (
        <Filesystem.PathList.Dev
          instance={{ ...instance, id }}
          margin={[12, 10, 20, 10]}
          height={100}
        />
      );
    });

    e.component((e) => {
      const props: DeployProps = {
        instance: e.ctx.filesystem.instance,
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
      actions: { width: 400 },
      host: { background: -0.04 },

      layout: {
        cropmarks: -0.2,
      },
    });
    e.render(<DevSample {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
