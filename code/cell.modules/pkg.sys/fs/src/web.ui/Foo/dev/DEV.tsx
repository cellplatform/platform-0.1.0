import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Foo, FooProps } from '..';
import { t, Filesystem, rx, HttpClient, Stream } from '../../common';

type Ctx = {
  id: string;
  bus: t.EventBus<t.SysFsEvent>;
  events: t.SysFsEvents;
  props: FooProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Foo')
  .context((e) => {
    if (e.prev) return e.prev;

    const id = 'my-filesystem';
    const bus = rx.bus<t.SysFsEvent>();
    const events = Filesystem.Events({ id, bus });

    const ctx: Ctx = {
      id,
      bus,
      events,
      props: {},
    };
    return ctx;
  })

  .items((e) => {
    e.title('sys.fs');

    e.button('info', async (e) => {
      const res = await e.ctx.events.io.info.get();
      console.log('res', res);
    });

    e.button('fetch', async (e) => {
      const url =
        'http://localhost:5000/cell:ckmv1vll1000e01etelnr0s9a:A1/fs/sys.net/static/images/wax.png';

      const path = 'sys.net/static/images/wax.png';
      const client = HttpClient.create(5000);
      const cell = client.cell('cell:ckmv1vll1000e01etelnr0s9a:A1');

      const res = await cell.fs.file(path).download();
      console.log('res', res);
      console.log('-------------------------------------------');

      const fetched = await fetch(url);
      const body = fetched.body;

      console.log('fetched', fetched);
      const merged = await Stream.toUint8Array(fetched.body);

      const blob = new Blob([merged.buffer], { type: 'image/png' });
      e.ctx.props.src = URL.createObjectURL(blob);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<FileSystem>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Foo {...e.ctx.props} />);
  });

export default actions;
