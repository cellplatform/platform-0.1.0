import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { RemoteManifestSelectorStateful, RemoteManifestSelectorProps } from '..';

type Ctx = { props: RemoteManifestSelectorProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.config.ManifestSelector')

  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: { canDrop: true } };
    return ctx;
  })

  .items((e) => {
    e.title('ManifestSelector');

    e.boolean('canDrop', (e) => {
      if (e.changing) e.ctx.props.canDrop = e.changing.next;
      e.boolean.current = e.ctx.props.canDrop;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Sample');

    e.component((e) => {
      return <RemoteManifestSelectorStateful style={{ MarginX: 20, MarginY: 15 }} />;
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      actions: { width: 360 },
      layout: {
        position: [300, null, null, null],
        cropmarks: -0.2,
        width: 350,
      },
    });
    e.render(
      <RemoteManifestSelectorStateful
        {...e.ctx.props}
        onRemoteEntryClick={(e) => console.log('onRemoteEntryClick', e)}
      />,
    );
  });

export default actions;
