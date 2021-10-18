import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { ManifestSelector, ManifestSelectorStateful, ManifestSelectorProps } from '..';

type Ctx = { props: ManifestSelectorProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.config.ManifestSelector')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .items((e) => {
    e.title('ManifestSelector');

    e.hr();
  })

  .items((e) => {
    e.title('Sample');

    e.component((e) => {
      return <ManifestSelectorStateful style={{ MarginX: 20, MarginY: 15 }} />;
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
      <ManifestSelectorStateful
        {...e.ctx.props}
        onRemoteEntryClick={(e) => console.log('onRemoteEntryClick', e)}
      />,
    );
  });

export default actions;
