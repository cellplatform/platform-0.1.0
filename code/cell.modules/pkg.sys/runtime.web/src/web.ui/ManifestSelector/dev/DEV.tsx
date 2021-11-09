import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { ManifestSelectorStateful, ManifestSelectorProps } from '..';
import { t, rx, css } from '../common';

import { WebRuntimeBus } from '../../../web.RuntimeBus';
import { useModuleTarget } from '../../hooks';
import { DevSampleTarget } from './DEV.SampleTarget';

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
    });

    const elSelector = (
      <ManifestSelectorStateful
        {...ctx.props}
        bus={ctx.bus}
        onEntryClick={(e) => {
          console.log('onRemoteEntryClick', e);
          const { remote } = e;
          ctx.events.useModule.fire({ target: 'myTarget', module: remote });
        }}
      />
    );

    const edge = 80;
    const width = 300;

    e.render(elSelector, {
      position: [edge, null, null, edge],
      width,
      cropmarks: -0.2,
    });

    e.render(<DevSampleTarget bus={ctx.bus} target={'myTarget'} />, {
      position: [edge - 1, edge, 120, width + edge + 50],
      cropmarks: false,
      background: 1,
      border: -0.1,
      label: `useModuleTarget (hook)`,
    });
  });

export default actions;
