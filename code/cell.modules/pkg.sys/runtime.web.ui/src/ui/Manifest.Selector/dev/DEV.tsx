import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { ManifestSelectorStateful, ManifestSelectorStatefulProps } from '..';
import { rx, t, Button, Filesystem, WebRuntimeBus } from '../common';
import { DevSampleTarget } from './DEV.SampleTarget';
import { ModuleInfoStateful, ModuleInfoConstants } from '../../Module.Info';
import { ModuleInfoFields } from '../../Module.Info/types';

const TARGET = 'foo';
const DEFAULT = ManifestSelectorStateful.DEFAULT;

type Ctx = {
  bus: t.EventBus;
  events: t.WebRuntimeEvents;
  props: ManifestSelectorStatefulProps;
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
  .namespace('ui.Manifest.Selector')

  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus };
    const { events } = WebRuntimeBus.Controller({ instance });

    Filesystem.IndexedDb.create({ bus, fs: DEFAULT.HISTORY.FS });

    const ctx: Ctx = {
      bus,
      events,
      props: {
        instance,
        canDrop: true,
        showExports: true,
        history: true,
        focusOnLoad: true,
      },
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

    e.select((config) =>
      config
        .title('exports fields:')
        .items(ModuleInfoConstants.FIELDS)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as ModuleInfoFields[];
            e.ctx.props.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr(1, 0.15);

    e.boolean('showExports (list)', (e) => {
      if (e.changing) e.ctx.props.showExports = e.changing.next;
      e.boolean.current = e.ctx.props.showExports;
    });

    e.boolean('canDrop', (e) => {
      if (e.changing) e.ctx.props.canDrop = e.changing.next;
      e.boolean.current = e.ctx.props.canDrop;
    });

    e.boolean('focusOnLoad', (e) => {
      if (e.changing) e.ctx.props.focusOnLoad = e.changing.next;
      e.boolean.current = e.ctx.props.focusOnLoad;
    });

    e.boolean('history (enabled)', (e) => {
      if (e.changing) e.ctx.props.history = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.history);
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
        onExportClick={(e) => ctx.events.useModule.fire({ target: TARGET, module: e.module })}
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

    e.render(<DevSampleTarget instance={ctx.props.instance} target={TARGET} />, {
      position: [edge - 1, edge, bottom, width + edge + 50],
      cropmarks: false,
      background: 1,
      border: -0.1,
      label: {
        topLeft: `useModule (hook)`,
        topRight: `target: "${TARGET}"`,
        bottomRight: elUnload,
      },
    });
  });

export default actions;
