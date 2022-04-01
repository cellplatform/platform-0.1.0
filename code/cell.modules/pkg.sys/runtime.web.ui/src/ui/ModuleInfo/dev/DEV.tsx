import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { ModuleInfo, ModuleInfoConstants, ModuleInfoProps, ModuleInfoStateful } from '..';
import { Filesystem, rx, t } from '../../common';
import { ManifestSelectorStateful } from '../../Manifest.Selector';
import * as k from '../types';

const { DEFAULT } = ManifestSelectorStateful.constants;

type Ctx = {
  bus: t.EventBus;
  props: ModuleInfoProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Module.Info')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    Filesystem.IndexedDb.create({ bus, id: DEFAULT.HISTORY.FS });

    const ctx: Ctx = { bus, props: { width: 300 } };
    return ctx;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('width', (e) => {
      if (e.changing) e.ctx.props.width = e.changing.next ? 300 : undefined;
      e.boolean.current = e.ctx.props.width !== undefined;
    });

    e.textbox((config) =>
      config
        .initial(config.ctx.props.title?.toString() || '')
        .placeholder('title')
        .pipe((e) => {
          if (e.changing) {
            const title = e.changing.next;
            e.textbox.current = title;
            e.ctx.props.title = title;
          }
        }),
    );

    e.select((config) =>
      config
        .title('fields:')
        .items(ModuleInfoConstants.FIELDS)
        .initial(undefined)
        .clearable(true)
        .view('buttons')
        .multi(true)
        .pipe((e) => {
          if (e.changing) {
            const next = e.changing.next.map(({ value }) => value) as k.ModuleInfoFields[];
            e.ctx.props.fields = next.length === 0 ? undefined : next;
          }
        }),
    );

    e.hr();

    e.title('Manifest Selector');

    e.component((e) => {
      const bus = e.ctx.bus;
      return (
        <ManifestSelectorStateful
          bus={bus}
          showExports={false}
          focusOnLoad={true}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 40 }}
          onChanged={(event) => {
            e.change.ctx((ctx) => {
              ctx.props.manifestUrl = event.url;
              ctx.props.manifest = event.manifest;
            });
          }}
        />
      );
    });

    e.hr();

    e.component((e) => {
      const url = e.ctx.props.manifestUrl;
      if (!url) return null;
      return (
        <ModuleInfoStateful
          url={url}
          title={e.ctx.props.title}
          fields={e.ctx.props.fields}
          style={{ MarginX: 15, marginTop: 40, marginBottom: 40 }}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    const el = (
      <ModuleInfo {...e.ctx.props} onExportClick={(e) => console.log('onExportClick', e)} />
    );

    e.render(el);
  });

export default actions;
