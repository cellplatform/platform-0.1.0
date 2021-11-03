import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { t, rx, Filesystem } from '../common';

import { DevFsSample } from './DEV.Sample';

const path = 'myfile.txt';

type Ctx = {
  bus: t.EventBus<any>;
  name: string;
  store(): Promise<t.SysFsEvents>;
  debug: { data?: any };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('FsBus.IndexedDb')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const name = 'fs.foo';

    const ctx: Ctx = {
      bus,
      name,
      debug: {},
      async store() {
        const { store } = await Filesystem.IndexedDb.create({ bus, name });
        return store.events;
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('IndexedDB (Filesystem)');

    e.button('write', async (e) => {
      const store = await e.ctx.store();
      const fs = store.fs();
      const data = new TextEncoder().encode('foobar');
      const res = await fs.write(path, data);
      e.ctx.debug.data = res;
      console.log('res', res);
    });

    e.button('read', async (e) => {
      const store = await e.ctx.store();
      const fs = store.fs();
      const res = await fs.read(path);
      e.ctx.debug.data = res;
      console.log('res', res);
    });

    e.button('delete', async (e) => {
      const store = await e.ctx.store();
      const fs = store.fs();
      const res = await fs.delete(path);
      e.ctx.debug.data = res;
      console.log('res', res);
    });

    e.hr();

    e.component((e) => {
      const data = e.ctx.debug.data;
      if (!data) return null;
      return <ObjectView data={data} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: 'FileSystem (Bus)',
          topRight: `IndexedDB: "${e.ctx.name}"`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const el = <DevFsSample bus={e.ctx.bus} />;
    e.render(el);
  });

export default actions;
