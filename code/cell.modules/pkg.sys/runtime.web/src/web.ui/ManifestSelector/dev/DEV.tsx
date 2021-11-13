import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { ManifestSelectorProps, ManifestSelectorStateful } from '..';
import { WebRuntimeBus } from '../../../web.RuntimeBus';
import { rx, t, Button } from '../common';
import { DevSampleTarget } from './DEV.SampleTarget';
import { ModuleInfoStateful } from '../../ModuleInfo';

const TARGET = 'myTarget';

type Ctx = {
  bus: t.EventBus;
  events: t.WebRuntimeEvents;
  props: ManifestSelectorProps;
  url: { value?: string; change(url?: string): void };
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
  .namespace('ui.ManifestSelector')

  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const { events } = WebRuntimeBus.Controller({ bus });

    const ctx: Ctx = {
      bus,
      events,
      props: { canDrop: true, showExports: true },
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
      url: {
        value: '',
        change: (url) => e.change.ctx((ctx) => (ctx.url.value = url)),
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('showExports (list)', (e) => {
      if (e.changing) e.ctx.props.showExports = e.changing.next;
      e.boolean.current = e.ctx.props.showExports;
    });

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
      e.ctx.debug.output.write('info', res);
    });

    e.hr(1, 0.1);
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

  .items((e) => {
    e.hr();

    e.component((e) => {
      const url = (e.ctx.url.value || '').trim();
      if (!url) return null;
      return <ModuleInfoStateful url={url} style={{ MarginX: 25, MarginY: 15 }} />;
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
        onEntryClick={(e) => ctx.events.useModule.fire({ target: TARGET, module: e.remote })}
        onChanged={(e) => ctx.url.change(e.url)}
      />
    );

    const edge = 80;
    const bottom = 120;
    const width = 300;

    const unload = () => e.ctx.events.useModule.fire({ target: TARGET, module: null });
    const elUnload = <Button onClick={unload}>Unload</Button>;

    e.render(elSelector, {
      position: [edge, null, null, edge],
      width,
      cropmarks: -0.2,
      label: `<ManifestSelectorStateful>`,
    });

    e.render(<DevSampleTarget bus={ctx.bus} target={TARGET} />, {
      position: [edge - 1, edge, bottom, width + edge + 50],
      cropmarks: false,
      background: 1,
      border: -0.1,
      label: {
        topRight: `useModule (hook)`,
        bottomRight: elUnload,
      },
    });
  });

export default actions;
