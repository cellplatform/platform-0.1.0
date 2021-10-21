import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { RemoteManifestSelectorStateful, RemoteManifestSelectorProps } from '..';
import { t, rx, css } from '../common';

import { WebRuntimeBus } from '../../../web.RuntimeBus';
import { useModuleTarget } from '../../hooks';

type Ctx = {
  bus: t.EventBus;
  events: t.WebRuntimeEvents;
  props: RemoteManifestSelectorProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.config.ManifestSelector')

  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const { events } = WebRuntimeBus.Controller({ bus });

    const ctx: Ctx = {
      bus,
      events,
      props: { canDrop: true },
    };
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
    e.component((e) => <RemoteManifestSelectorStateful style={{ MarginX: 20, MarginY: 15 }} />);
    e.hr();
  })

  .items((e) => {
    e.title('WebRuntimeBus');

    e.button('info', async (e) => {
      const res = await e.ctx.events.info.get();
      console.log('res', res);
    });

    e.button('useModule: null (unload)', async (e) => {
      e.ctx.events.useModule.fire({ target: 'myTarget', remote: null });
    });

    e.hr();
  })

  .subject((e) => {
    const { ctx } = e;

    e.settings({
      host: { background: -0.04 },
      actions: { width: 360 },
      layout: {
        position: [200, null, null, null],
        cropmarks: -0.2,
        width: 350,
      },
    });

    e.render(
      <RemoteManifestSelectorStateful
        {...ctx.props}
        onRemoteEntryClick={(e) => {
          console.log('onRemoteEntryClick', e);
          const { remote } = e;
          ctx.events.useModule.fire({ target: 'myTarget', remote });
        }}
      />,
    );

    e.render(<Sample bus={ctx.bus} target={'myTarget'} />, {
      position: [400, 80, 120, 80],
      cropmarks: false,
      background: 1,
      border: -0.1,
      label: `useModuleTarget (hook)`,
    });
  });

export default actions;

/**
 * Sample UI for the [useModuleTarget] hook.
 */
export type SampleProps = { bus: t.EventBus; target: string };
export const Sample: React.FC<SampleProps> = (props) => {
  const { bus, target } = props;
  const remote = useModuleTarget({ bus, target });

  console.log('useModuleTarget', remote);

  const styles = {
    base: css({ position: 'relative', flex: 1 }),
  };

  const App = remote.module?.default;
  const elMain = App && <App bus={props.bus} />;

  return <div {...styles.base}>{elMain}</div>;
};
