import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { Filesystem, rx, t } from '../../common';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import { DevSample, DevSampleProps } from './DEV.Sample';

const DEFAULT = ManifestSelectorStateful.DEFAULT;

type Id = string;

type Ctx = {
  instance: { bus: t.EventBus; id?: Id };
  props: DevSampleProps;
  debug: { useUrl: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useManifest')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance = { bus };
    Filesystem.IndexedDb.create({ bus, fs: DEFAULT.HISTORY.FS });

    const ctx: Ctx = {
      instance,
      props: {},
      debug: { useUrl: true },
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

    e.boolean('use specified url', (e) => {
      if (e.changing) e.ctx.debug.useUrl = e.changing.next;
      e.boolean.current = e.ctx.debug.useUrl;
    });

    e.hr();
  })

  .subject((e) => {
    const url = e.ctx.debug.useUrl ? e.ctx.props.url : undefined;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: 'useManifest (hook)',
          bottomRight: url ? `Manifest URL: ${url}` : 'note: "mock" manifest',
        },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSample {...e.ctx.props} url={url} />);
  });

export default actions;
