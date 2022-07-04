import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { CrdtFile } from '..';
import { TestFilesystem, Filesystem } from '../../test';
import { rx, t } from '../common';

type Ctx = {
  bus: t.EventBus;
  filesystem: {
    fs: t.Fs;
    instance: t.FsViewInstance;
    events: t.SysFsEvents;
    ready: () => Promise<any>;
  };
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
        label: '<CrdtFile>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    // e.render(<CrdtFile {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
