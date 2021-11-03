import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { ManifestSelectorStateful, ManifestSelectorProps } from '..';
import { t, rx, css } from '../common';

import { WebRuntimeBus } from '../../../web.RuntimeBus';
import { useModuleTarget } from '../../hooks';

type Ctx = {
  bus: t.EventBus;
  events: t.WebRuntimeEvents;
  props: ManifestSelectorProps;
  debug: {
    output: {
      title?: string;
      data?: any;
      write(title: string, data: any): void;
      clear(): void;
    };
  };
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
      debug: {
        output: {
          clear: () => ctx.debug.output.write('', undefined),
          write(title, data) {
            e.change.ctx((ctx) => {
              ctx.debug.output.title = title;
              ctx.debug.output.data = data;
            });
          },
        },
      },
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
    e.title('WebRuntimeBus');

    e.button('info', async (e) => {
      const res = await e.ctx.events.info.get();
      console.log('res', res);
      e.ctx.debug.output.write('info', res);
    });

    e.button('useModule: null (unload)', async (e) => {
      e.ctx.events.useModule.fire({ target: 'myTarget', module: null });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.button('clear', (e) => e.ctx.debug.output.clear());

    e.component((e) => {
      const output = e.ctx.debug.output;
      const data = output.data;
      if (!data) return null;
      return (
        <ObjectView
          name={output.title ?? 'Unnamed'}
          data={data}
          fontSize={10}
          style={{ MarginX: 20, marginTop: 10 }}
          expandLevel={3}
        />
      );
    });
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
      <ManifestSelectorStateful
        {...ctx.props}
        bus={ctx.bus}
        onEntryClick={(e) => {
          console.log('onRemoteEntryClick', e);
          const { remote } = e;
          ctx.events.useModule.fire({ target: 'myTarget', module: remote });
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

  console.log('useModuleTarget (remote)', remote);

  const styles = {
    base: css({ position: 'relative', flex: 1 }),
  };

  const App = remote.module?.default;
  const elMain = App && <App bus={props.bus} />;

  return <div {...styles.base}>{elMain}</div>;
};
