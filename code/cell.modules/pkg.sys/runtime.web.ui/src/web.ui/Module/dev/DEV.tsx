import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Module, ModuleProps } from '..';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import { t, rx, Filesystem } from '../../../common';

const { DEFAULT } = ManifestSelectorStateful.constants;

type Ctx = {
  bus: t.EventBus;
  props: ModuleProps;
  setUrl(url: t.ManifestUrl): void;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    Filesystem.IndexedDb.create({ bus, id: DEFAULT.HISTORY.FS });

    const ctx: Ctx = {
      bus,
      props: { bus },
      setUrl: (url) => e.change.ctx((ctx) => (ctx.props.url = url)),
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      const bus = e.ctx.bus;
      return (
        <ManifestSelectorStateful
          bus={bus}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 30 }}
          focusOnLoad={true}
          onExportClick={({ url }) => e.ctx.setUrl(url)}
        />
      );
    });

    e.hr();
    e.button('reset (unload)', (e) => (e.ctx.props.url = undefined));
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Module>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Module {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
