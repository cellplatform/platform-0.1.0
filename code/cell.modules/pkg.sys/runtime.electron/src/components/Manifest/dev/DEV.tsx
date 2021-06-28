import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Manifest, ManifestProps } from '..';
import {
  t,
  // IpcBus, Bundle
} from './common';

const manifest = require('./sample/manifest.json') as t.ModuleManifest; // eslint-disable-line

type E = t.BundleEvent;
type Ctx = {
  // netbus: t.NetworkBus<E>;
  // events: t.BundleEvents;
  props: ManifestProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.ui/Manifest')
  .context((e) => {
    if (e.prev) return e.prev;

    // const netbus = IpcBus<E>();
    // const events = Bundle.Events({ bus: netbus });
    return {
      // netbus,
      // events,
      props: { manifest },
    };
  })

  .items((e) => {
    e.title('Manifest');
    e.button('load', (e) => (e.ctx.props.manifest = manifest));
    e.button('unload', (e) => (e.ctx.props.manifest = undefined));
    e.hr();
  })

  // .items((e) => {
  //   e.title('Bundle (Module)');

  //   e.button('tmp', async (e) => {
  //     const { netbus, events } = e.ctx;

  //     const res = await events.status.get({ dir: 'app.sys/web' });
  //     console.log('res', res);
  //   });

  //   e.hr();
  // })

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
