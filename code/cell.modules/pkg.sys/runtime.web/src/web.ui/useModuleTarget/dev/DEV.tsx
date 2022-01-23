import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';
import { ManifestSelectorStateful, ManifestSelectorConstants } from '../../ManifestSelector';
import { t, rx, WebRuntimeBus, Filesystem } from '../../common';

const TARGET = 'foo';

type Ctx = {
  bus: t.EventBus;
  events: t.WebRuntimeEvents;
  props: DevSampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useModuleTarget')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const events = WebRuntimeBus.Events({ bus });
    Filesystem.IndexedDb.create({
      bus,
      id: ManifestSelectorConstants.DEFAULT.HISTORY.FS,
    });

    const ctx: Ctx = {
      bus,
      events,
      props: { bus, target: TARGET },
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
          showExports={false}
          focusOnLoad={true}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 20 }}
          onChanged={(event) => {
            e.change.ctx((ctx) => (ctx.props.url = event.url));
          }}
        />
      );
    });

    e.button('unload ({ module: null })', (e) => {
      const target = TARGET;
      e.ctx.events.useModule.fire({ target, module: null });
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: `useModuleTarget (hook)`,
          topRight: `target: "${TARGET}"`,
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSample {...e.ctx.props} />);
  });

export default actions;
