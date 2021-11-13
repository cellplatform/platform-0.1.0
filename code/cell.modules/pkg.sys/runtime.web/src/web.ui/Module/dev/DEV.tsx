import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Module, ModuleProps } from '..';
import { ManifestSelectorStateful } from '../../ManifestSelector';
import { t, rx } from '../../../common';

type Ctx = {
  bus: t.EventBus;
  // props: ModuleEntryProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();

    const ctx: Ctx = { bus };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      const bus = e.ctx.bus;
      return (
        <ManifestSelectorStateful
          bus={bus}
          style={{ MarginX: 15, marginTop: 10 }}
          onChanged={(event) => {
            console.log('event', event);
            // e.change.ctx((ctx) => {
            //   ctx.url = event.url;
            //   ctx.props.manifest = event.manifest;
            // });
          }}
          onEntryClick={(event) => {
            console.log('event', event);
          }}
        />
      );
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Module>',
        // position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });
    // e.render(<ModuleEntry {...e.ctx.props} />);
  });

export default actions;
