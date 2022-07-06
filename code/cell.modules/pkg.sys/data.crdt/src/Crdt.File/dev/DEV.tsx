import React from 'react';
import { CrdtFile } from '..';
import { TestFilesystem, DevActions, ObjectView } from '../../test';
import { rx, t, Filesystem } from './common';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  bus: t.EventBus;
  filesystem: {
    fs: t.Fs;
    instance: t.FsViewInstance;
    events: t.SysFsEvents;
    ready: () => Promise<any>;
  };
  props: DevSampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Crdt.File')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const { fs, ready, instance, events } = TestFilesystem.init({ bus });

    const ctx: Ctx = {
      bus,
      filesystem: { fs, ready, instance, events },
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
      actions: { width: 350 },
      host: { background: -0.04 },

      layout: {
        cropmarks: -0.2,
      },
    });
    e.render(<DevSample {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
