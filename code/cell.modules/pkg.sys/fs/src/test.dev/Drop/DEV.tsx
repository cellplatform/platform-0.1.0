import React from 'react';
import { DevActions, Textbox } from 'sys.ui.dev';
import { Sample, SampleProps } from './DEV.Sample';
import { css, IpcBus, t, Filesystem, HttpClient, cuid, time } from '../common';

type UriString = string;

type Ctx = {
  props: SampleProps;

  remote: {
    host: string;
    cell: UriString;
    path: string;
  };

  events: t.SysFsEvents;
  fs: t.Fs;
  dir: string;

  onDropped(e: t.Dropped): void;
  addLink(url: string): void;
  loadManifest(): Promise<void>;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test.drop')
  .context((e) => {
    if (e.prev) return e.prev;

    const netbus = IpcBus();
    const events = Filesystem.Events({ id: 'main', bus: netbus });
    const dir = 'test.fs.drop';
    const fs = events.fs(dir);

    const ctx: Ctx = {
      props: { links: [] },

      events,
      fs,
      dir,

      remote: {
        // host: 'http://localhost:5000',
        host: 'https://dev.db.team',
        cell: 'cell:ckt3qkrlv003m4n5xgqa06dwj:A1',
        path: '',
      },

      onDropped(e) {
        e.files
          .filter((file) => !file.path.endsWith('.DS_Store'))
          .forEach(async (file) => {
            const path = fs.join(e.dir, file.path);
            await fs.write(path, file.data);
            await ctx.loadManifest();
          });
      },

      addLink(url) {
        e.change.ctx((draft) => draft.props.links.push(url));
      },

      async loadManifest() {
        const manifest = await fs.manifest();
        console.log('manifest', manifest);

        // await time.wait(100);

        e.change.ctx((draft) => (draft.props.manifest = manifest));

        e.redraw();

        console.log('e.current', e.current);
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.button('cuid', (e) => {
      const ns = cuid();

      console.log('ns', ns);
      console.log('uri', `cell:${ns}:A1`);
    });

    e.button('loadManifest', async (e) => {
      await e.ctx.loadManifest();
    });

    e.button('write (simple "file.txt")', async (e) => {
      const fs = e.ctx.fs;
      const doc = 'Hello 👋';
      const data = new TextEncoder().encode(doc);
      await fs.write('simple.txt', data);
      await e.ctx.loadManifest();
    });

    e.hr(1, 0.1);

    e.button('clear (delete filesystem)', async (e) => {
      const fs = e.ctx.events.fs();
      await fs.delete(e.ctx.dir);
      await e.ctx.loadManifest();
    });

    e.hr(1, 0.1);

    e.button('push', async (e) => {
      const { fs, events } = e.ctx;

      const { host, cell, path } = e.ctx.remote;

      console.log('host', host);
      console.log('cell', cell);
      console.log('path', path);
      console.log('-------------------------------------------');

      const remote = events.remote.cell(host, cell);
      const res = await remote.push(path);
      console.log('res', res);

      const url = `${host}/${cell}/fs`;
      e.ctx.addLink(url);

      res.errors.forEach((err) => console.log('ERROR', err));
    });

    e.hr();
  })

  .subject((e) => {
    const { remote, props } = e.ctx;

    console.log('props.manifest', props.manifest);

    // const txtHost = (
    //   <Textbox
    //     placeholder={'remote host'}
    //     value={e.ctx.remote.host}
    //     spellCheck={false}
    //     onChange={({ to }) => {
    //       console.log('host:', to);
    //       // e.ctx.filename(to);
    //     }}
    //   />
    // );

    // const txtCellUri = (
    //   <Textbox
    //     placeholder={'cell:uri'}
    //     value={e.ctx.remote.cell}
    //     spellCheck={false}
    //     onChange={({ to }) => {
    //       console.log('cell:uri:', to);
    //       // e.ctx.filename(to);
    //     }}
    //   />
    // );

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: `test.drop`,
          topRight: `${remote.host}/${remote.cell}`,
          // bottomLeft: txtHost,
          // bottomRight: txtCellUri,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const el = <Sample {...e.ctx.props} onDropped={e.ctx.onDropped} />;

    e.render(el);
  });

export default actions;
