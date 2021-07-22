import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Manifest, ManifestProps } from '..';
import { t, IpcBus, Bundle, http } from './common';

const manifest = require('./sample/manifest.json') as t.ModuleManifest; // eslint-disable-line

type E = t.BundleEvent;
type Ctx = {
  netbus: t.NetworkBus<E>;
  events: t.BundleEvents;
  props: ManifestProps;
  install: {
    source?: string;
    force: boolean;
  };
  loadManifest(url: string): Promise<void>;
};

// const fetchManifest = async (source: string) => {
//   const res = await http.get(source);
//   console.log('res', res);
//   return res.ok ? (res.json as t.ModuleManifest) : undefined;
// };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui/Manifest')
  .context((e) => {
    if (e.prev) return e.prev;

    const netbus = IpcBus<E>();

    console.log('netbus', netbus);
    const events = Bundle.Events({ bus: netbus });

    console.log('events', events);

    // e.

    return {
      netbus,
      events,
      props: {},
      install: { force: false },
      async loadManifest(url: string) {
        const res = await events.manifest.fetch.fire(url, { timeout: 9999 });
        e.change.ctx((draft) => (draft.props.manifest = res.manifest as t.ModuleManifest));
      },
    };
  })

  .items((e) => {
    e.title('Manifest');
    e.button('load', (e) => (e.ctx.props.manifest = manifest));
    e.button('unload', (e) => (e.ctx.props.manifest = undefined));
    e.hr();
  })

  .items((e) => {
    e.title('Bundles');

    e.button('tmp', async (e) => {
      const { netbus, events } = e.ctx;
      // const res = await events.status.get({ dir: 'app.sys/web' });
      const res = await events.list.get();
      // const res = await events.status.get({domain:''})
      console.log('res', res);

      // const match = res.items.find((item) => item.)

      // const first = res.items[0];

      // if (first) {
      //   // first.
      //   // const { domain, namespace } = first;
      //   // const status = await events.status.get({ domain, namespace });
      //   // console.log('status', status);
      // }
    });

    e.textbox((config) =>
      config
        .title('source manifest')
        .placeholder('url')
        .pipe(async (e) => {
          if (e.changing?.action === 'invoke') {
            const url = e.changing.next || '';
            e.ctx.install.source = url;
            e.ctx.loadManifest(url);
          }
        }),
    );

    e.boolean('force', (e) => {
      if (e.changing) e.ctx.install.force = e.changing.next;
      e.boolean.current = e.ctx.install.force;
    });

    e.button('install', async (e) => {
      //
      const { events } = e.ctx;

      const { source, force } = e.ctx.install;
      if (!source) {
        e.button.description = 'enter manifest url';
        return;
      }

      if (source) {
        e.button.description = '';

        const res = await events.install.fire(source, { timeout: 30000, force });

        console.log('install', res);
        e.button.description = `action: ${res.action}`;
      }
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Manifest>',
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Manifest {...e.ctx.props} />);
  });

export default actions;
