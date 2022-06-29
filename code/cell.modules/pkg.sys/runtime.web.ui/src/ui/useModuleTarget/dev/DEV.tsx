import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import { t, rx, WebRuntimeBus, Filesystem } from '../../common';

const TARGET = 'foo';
const DEFAULT = ManifestSelectorStateful.DEFAULT;

type Id = string;
type Ctx = {
  instance: { bus: t.EventBus<any>; id?: Id };
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
    const instance = { bus };
    const events = WebRuntimeBus.Events({ instance });

    const fs = DEFAULT.HISTORY.FS;
    Filesystem.IndexedDb.create({ bus, fs });

    const ctx: Ctx = {
      instance,
      events,
      props: { instance, target: TARGET },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      return (
        <ManifestSelectorStateful
          instance={e.ctx.instance}
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
