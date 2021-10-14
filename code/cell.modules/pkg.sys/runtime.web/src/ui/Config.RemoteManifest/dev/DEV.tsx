import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { ConfigRemoteManifest, ConfigRemoteManifestProps } from '..';

type Ctx = { props: ConfigRemoteManifestProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.ConfigRemoteManifest')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<ConfigRemoteManifest>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<ConfigRemoteManifest {...e.ctx.props} />);
  });

export default actions;
