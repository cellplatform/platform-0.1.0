import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { t, rx, Filesystem } from '../../common';
import { ManifestSelectorStateful, ManifestSelectorConstants } from '../../ManifestSelector';
import { DevSample, DevSampleProps } from './DEV.Sample';

type Ctx = {
  bus: t.EventBus;
  props: DevSampleProps;
  setUrl(url: t.ManifestUrl): void;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useModule')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    Filesystem.IndexedDb.create({ bus, id: ManifestSelectorConstants.DEFAULT.HISTORY.FS });

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
          focusOnLoad={true}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 30 }}
          onExportClick={({ url }) => e.ctx.setUrl(url)}
        />
      );
    });

    e.hr();
    e.button('reset (unload)', (e) => (e.ctx.props.url = undefined));
  })

  .subject((e) => {
    const url = e.ctx.props.url;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { topLeft: 'useModule (hook)', topRight: url },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    e.render(<DevSample {...e.ctx.props} />);
  });

export default actions;
